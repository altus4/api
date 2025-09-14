/**
 * UserService
 *
 * Manages user registration, authentication, and user-related database operations.
 * Handles password hashing, JWT token generation, and user lookup.
 *
 * Usage:
 *   - Instantiate and use registerUser() to create new users
 *   - Use authentication methods for login and token management
 */
import { config } from '@/config';
import { HTTP_STATUS } from '@/config/constants';
import { AppError } from '@/middleware/errorHandler';
import type { User } from '@/types';
import { logger } from '@/utils/logger';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { RowDataPacket } from 'mysql2/promise';
import { createConnection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

export class UserService {
  /**
   * MySQL connection promise for user database operations.
   */
  private connection = createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
  });

  /**
   * Initialize the UserService and test the database connection.
   */
  constructor() {
    this.initializeConnection();
  }

  /**
   * Establish and test the database connection for user operations.
   * Logs success or failure.
   */
  private async initializeConnection(): Promise<void> {
    try {
      const conn = await this.connection;
      await conn.ping();
      logger.info('UserService database connection established');
    } catch (error) {
      logger.error('Failed to establish UserService database connection:', error);
    }
  }

  /**
   * Register a new user in the database.
   * Checks for existing user, hashes password, creates user record, and returns JWT token.
   *
   * @param userData - Object containing email, password, name, and optional role
   * @returns Object with created user and JWT token
   * @throws Error if user already exists or registration fails
   */
  public async registerUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'user';
  }): Promise<{ user: User; token: string }> {
    try {
      const conn = await this.connection;

      // Check if user already exists
      const [existingUsers] = await conn.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (existingUsers.length > 0) {
        throw new AppError(
          'User with this email already exists',
          HTTP_STATUS.CONFLICT,
          'USER_ALREADY_EXISTS'
        );
      }

      // Hash password securely
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user record with UUID and current timestamp
      const userId = uuidv4();
      const now = new Date();

      await conn.execute(
        `INSERT INTO users (id, email, name, password_hash, role, created_at, last_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, userData.email, userData.name, hashedPassword, userData.role || 'user', now, now]
      );

      const user: User = {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        connectedDatabases: [],
        createdAt: now,
        lastActive: now,
      };

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`User registered successfully: ${userData.email}`);
      return { user, token };
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  public async loginUser(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const conn = await this.connection;

      // Get user from database
      const [users] = await conn.execute<RowDataPacket[]>(
        `SELECT id, email, name, password_hash, role, created_at, last_active
         FROM users WHERE email = ? AND is_active = true`,
        [credentials.email]
      );

      if (users.length === 0) {
        throw new AppError(
          'Invalid email or password',
          HTTP_STATUS.UNAUTHORIZED,
          'INVALID_CREDENTIALS'
        );
      }

      const userData = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, userData.password_hash);

      if (!isValidPassword) {
        throw new AppError(
          'Invalid email or password',
          HTTP_STATUS.UNAUTHORIZED,
          'INVALID_CREDENTIALS'
        );
      }

      // Update last active timestamp
      await conn.execute('UPDATE users SET last_active = ? WHERE id = ?', [
        new Date(),
        userData.id,
      ]);

      // Get user's connected databases
      const [databases] = await conn.execute<RowDataPacket[]>(
        'SELECT id FROM database_connections WHERE user_id = ? AND is_active = true',
        [userData.id]
      );

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        connectedDatabases: databases.map(db => db.id),
        createdAt: new Date(userData.created_at),
        lastActive: new Date(),
      };

      // Generate JWT token
      const token = this.generateToken(user);

      logger.info(`User logged in successfully: ${credentials.email}`);
      return { user, token };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<User | null> {
    try {
      const conn = await this.connection;

      const [users] = await conn.execute<RowDataPacket[]>(
        `SELECT id, email, name, role, created_at, last_active
         FROM users WHERE id = ? AND is_active = true`,
        [userId]
      );

      if (users.length === 0) {
        return null;
      }

      const userData = users[0];

      // Get user's connected databases
      const [databases] = await conn.execute<RowDataPacket[]>(
        'SELECT id FROM database_connections WHERE user_id = ? AND is_active = true',
        [userId]
      );

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        connectedDatabases: databases.map(db => db.id),
        createdAt: new Date(userData.created_at),
        lastActive: new Date(userData.last_active),
      };
    } catch (error) {
      logger.error(`Failed to get user by ID ${userId}:`, error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  public async updateUser(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email'>>
  ): Promise<User | null> {
    try {
      const conn = await this.connection;

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
      }

      if (updates.email) {
        updateFields.push('email = ?');
        updateValues.push(updates.email);
      }

      if (updateFields.length === 0) {
        return await this.getUserById(userId);
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date());
      updateValues.push(userId);

      await conn.execute(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);

      logger.info(`User updated successfully: ${userId}`);
      return await this.getUserById(userId);
    } catch (error) {
      logger.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const conn = await this.connection;

      // Get current password hash
      const [users] = await conn.execute<RowDataPacket[]>(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);

      if (!isValidPassword) {
        throw new AppError(
          'Current password is incorrect',
          HTTP_STATUS.UNAUTHORIZED,
          'INVALID_CURRENT_PASSWORD'
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await conn.execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [
        hashedPassword,
        new Date(),
        userId,
      ]);

      logger.info(`Password changed successfully for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to change password for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  public async deactivateUser(userId: string): Promise<boolean> {
    try {
      const conn = await this.connection;

      await conn.execute('UPDATE users SET is_active = false, updated_at = ? WHERE id = ?', [
        new Date(),
        userId,
      ]);

      logger.info(`User deactivated successfully: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to deactivate user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   */
  public generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
    }
  }

  /**
   * Get all users (admin only)
   */
  public async getAllUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    try {
      const conn = await this.connection;
      const offset = (page - 1) * limit;

      // Get total count
      const [countResult] = await conn.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users WHERE is_active = true'
      );
      const { total } = countResult[0];

      // Get users with pagination
      const [users] = await conn.execute<RowDataPacket[]>(
        `SELECT id, email, name, role, created_at, last_active
         FROM users WHERE is_active = true
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const userList: User[] = [];
      for (const userData of users) {
        const [databases] = await conn.execute<RowDataPacket[]>(
          'SELECT id FROM database_connections WHERE user_id = ? AND is_active = true',
          [userData.id]
        );

        userList.push({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          connectedDatabases: databases.map(db => db.id),
          createdAt: new Date(userData.created_at),
          lastActive: new Date(userData.last_active),
        });
      }

      return { users: userList, total };
    } catch (error) {
      logger.error('Failed to get all users:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  public async updateUserRole(userId: string, newRole: 'admin' | 'user'): Promise<boolean> {
    try {
      const conn = await this.connection;

      await conn.execute('UPDATE users SET role = ?, updated_at = ? WHERE id = ?', [
        newRole,
        new Date(),
        userId,
      ]);

      logger.info(`User role updated: ${userId} -> ${newRole}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update user role for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      const conn = await this.connection;
      await conn.end();
      logger.info('UserService database connection closed');
    } catch (error) {
      logger.error('Failed to close UserService database connection:', error);
    }
  }
}
