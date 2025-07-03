import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Protect routes - middleware to check if user is authenticated
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check if token exists in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
      if (token) {
        console.log('Token from Authorization header:', token.substring(0, 10) + '...');
      }
    } else if (req.cookies && req.cookies.token) {
      // Set token from cookie
      token = req.cookies.token;
      if (token) {
        console.log('Token from cookies:', token.substring(0, 10) + '...');
      }
    }

    // Check if token exists
    if (!token) {
      console.log('No token found in request:', {
        path: req.path,
        method: req.method,
        headers: req.headers,
        cookies: req.cookies
      });
      
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    try {
      // Verify token
      console.log('Verifying token with secret:', config.jwtSecret ? 'Secret exists' : 'Secret missing');
      const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret) as jwt.JwtPayload;
      console.log('Token verified, decoded ID:', decoded.id);

      // Set user to req.user
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log('User not found for ID:', decoded.id);
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      console.log('User authenticated:', {
        id: user._id,
        role: user.role,
        email: user.email
      });
      
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      console.log('Authorization failed: No user in request');
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed: User role ${req.user.role} not in allowed roles:`, roles);
      res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
      return;
    }
    
    console.log(`User ${req.user._id} with role ${req.user.role} authorized for route:`, req.path);
    next();
  };
}; 