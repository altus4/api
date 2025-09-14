/**
 * AuthController
 *
 * Handles user authentication operations such as registration, login, and profile management.
 * Integrates with UserService for user-related database operations.
 *
 * Usage:
 *   - Instantiate and use register() for user registration
 *   - Use login() for authentication
 */
import { UserService } from '@/services/UserService';
import type { User } from '@/types';
import { logger } from '@/utils/logger';

export class AuthController {
  /**
   * UserService instance for user registration and authentication.
   */
  private userService: UserService;

  /**
   * Initialize the AuthController and its dependencies.
   */
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Register a new user.
   * Validates input and delegates to UserService for database operations.
   *
   * @param userData - Object containing email, password, name, and optional role
   * @returns Object with created user and JWT token
   * @throws Error if validation fails or registration fails
   */
  public async register(userData: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'user';
  }): Promise<{ user: User; token: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Validate name
      if (!userData.name || userData.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }

      const result = await this.userService.registerUser({
        ...userData,
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
      });

      logger.info(`User registered successfully: ${userData.email}`);
      return result;
    } catch (error) {
      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login.
   * Validates input and delegates to UserService for authentication.
   *
   * @param credentials - Object containing email and password
   * @returns Object with authenticated user and JWT token
   * @throws Error if authentication fails
   */
  public async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    try {
      // Validate inputs
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const result = await this.userService.loginUser({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      logger.info(`User logged in successfully: ${credentials.email}`);
      return result;
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  public async getProfile(userId: string): Promise<User | null> {
    try {
      const user = await this.userService.getUserById(userId);
      if (user) {
        logger.info(`Profile retrieved for user: ${userId}`);
      }
      return user;
    } catch (error) {
      logger.error(`Failed to get profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  public async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email'>>
  ): Promise<User | null> {
    try {
      // Validate email format if provided
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw new Error('Invalid email format');
        }
        updates.email = updates.email.toLowerCase().trim();
      }

      // Validate name if provided
      if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }
        updates.name = updates.name.trim();
      }

      const user = await this.userService.updateUser(userId, updates);
      logger.info(`Profile updated for user: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Failed to update profile for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  public async changePassword(
    userId: string,
    passwords: {
      currentPassword: string;
      newPassword: string;
    }
  ): Promise<boolean> {
    try {
      // Validate new password strength
      if (passwords.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      // Check password complexity
      const hasUpperCase = /[A-Z]/.test(passwords.newPassword);
      const hasLowerCase = /[a-z]/.test(passwords.newPassword);
      const hasNumbers = /\d/.test(passwords.newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        throw new Error(
          'Password must contain at least one uppercase letter, one lowercase letter, ' +
            'one number, and one special character'
        );
      }

      const success = await this.userService.changePassword(
        userId,
        passwords.currentPassword,
        passwords.newPassword
      );

      logger.info(`Password changed successfully for user: ${userId}`);
      return success;
    } catch (error) {
      logger.error(`Failed to change password for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  public async refreshToken(token: string): Promise<{ user: User; token: string }> {
    try {
      const decoded = this.userService.verifyToken(token);
      const user = await this.userService.getUserById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.userService.generateToken(user);
      logger.info(`Token refreshed for user: ${user.id}`);

      return { user, token: newToken };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  public async deactivateAccount(userId: string): Promise<boolean> {
    try {
      const success = await this.userService.deactivateUser(userId);
      logger.info(`Account deactivated for user: ${userId}`);
      return success;
    } catch (error) {
      logger.error(`Failed to deactivate account for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Logout (placeholder for cleanup)
   */
  public async logout(userId: string): Promise<boolean> {
    try {
      // In a real application, you might want to:
      // 1. Add the token to a blacklist
      // 2. Clear any server-side session data
      // 3. Log the logout event

      logger.info(`User logged out: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Logout failed for user ${userId}:`, error);
      throw error;
    }
  }
}
