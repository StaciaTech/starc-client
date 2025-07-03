import { Request, Response } from 'express';
import User from '../models/User.js';
import config from '../config/index.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('Login failed: User not found');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    console.log('User found, checking password');
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    console.log('Login successful for user:', user._id);
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user from middleware where it was added with auth middleware
    const user = await User.findById(req.user?.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get Me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting user'
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req: Request, res: Response): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Helper function to send token response
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  // Create token
  const token = user.getSignedJwtToken();
  
  console.log('Generated token for user:', user._id);

  const options = {
    expires: new Date(Date.now() + parseInt(config.jwtExpire) * 24 * 60 * 60 * 1000), // Convert days to ms
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only https in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' as 'strict' | 'lax' | 'none' | undefined
  };

  console.log('Setting cookie with options:', {
    expires: options.expires,
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite
  });

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
}; 