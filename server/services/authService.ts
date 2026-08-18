/**
 * MECHTWIN AI — Authentication & Role-Based Authorization (RBAC) Service
 * Manages user sessions, role permissions (ADMIN, ENGINEER, VIEWER), and security policies
 * Tagline: "Engineering Intelligence for Every Machine."
 * Created & Engineered by Samil Khan
 */

import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../src/types';
import { db } from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export class AuthService {
  /**
   * Resolves the active user from header or falls back to Admin/Engineer
   */
  public static getCurrentUser(req: Request): User {
    const userIdHeader = req.header('x-user-id') || req.header('authorization')?.replace('Bearer ', '');
    if (userIdHeader) {
      const found = db.users.find(u => u.id === userIdHeader || u.email === userIdHeader);
      if (found) return found;
    }
    // Default to the principal engineer (Samil Khan - ADMIN)
    return db.users[0];
  }

  /**
   * Middleware enforcing specific role permissions
   */
  public static requireRole(allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const user = AuthService.getCurrentUser(req);
      req.user = user;

      if (!allowedRoles.includes(user.role)) {
        db.logAction(
          user.id,
          'ACCESS_DENIED',
          'API_ENDPOINT',
          req.originalUrl,
          `User role ${user.role} is unauthorized for ${req.method} ${req.originalUrl}`,
          'DENIED',
          req.ip || '127.0.0.1'
        );

        return res.status(403).json({
          error: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${user.role}`,
          currentUser: {
            id: user.id,
            name: user.name,
            role: user.role,
          },
        });
      }

      next();
    };
  }
}
