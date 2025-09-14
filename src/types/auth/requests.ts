/**
 * Authentication Request Types
 *
 * Types related to authenticated requests and request extensions.
 */

import type { Request } from 'express';
import type { ApiKey } from '../api/keys';

/**
 * Extends Express Request to include authenticated user info.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}

/**
 * Extends Express Request to include authenticated user and API key info.
 */
export interface ApiKeyAuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
  apiKey?: ApiKey;
}
