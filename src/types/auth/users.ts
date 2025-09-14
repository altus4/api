/**
 * User Types
 *
 * Types related to users and user management.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  connectedDatabases: string[];
  createdAt: Date;
  lastActive: Date;
}
