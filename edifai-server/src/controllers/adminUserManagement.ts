import { Request, Response } from 'express';
import User from '../models/User.js';

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all users except admins
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving users'
    });
  }
};

/**
 * @desc    Create a new user (admin only)
 * @route   POST /api/admin/users
 * @access  Private (Admin only)
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'user', 
      enrollmentEnabled = true,
      assignedCourses = []
    } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
      return;
    }

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
      password,
      role: role === 'admin' ? 'admin' : 'user', // Ensure only admin or user roles
      enrollmentEnabled,
      assignedCourses
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentEnabled: user.enrollmentEnabled,
        assignedCourses: user.assignedCourses,
        createdAt: user.createdAt
      },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user'
    });
  }
};

/**
 * @desc    Toggle user enrollment access
 * @route   PUT /api/admin/users/:userId/toggle-enrollment
 * @access  Private (Admin only)
 */
export const toggleEnrollmentAccess = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Toggle enrollment access
    user.enrollmentEnabled = !user.enrollmentEnabled;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        enrollmentEnabled: user.enrollmentEnabled
      },
      message: `Enrollment access ${user.enrollmentEnabled ? 'enabled' : 'disabled'} for ${user.name}`
    });
  } catch (error) {
    console.error('Error toggling enrollment access:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

/**
 * @desc    Get user enrollment status
 * @route   GET /api/admin/users/:userId/enrollment-status
 * @access  Private (Admin only)
 */
export const getUserEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId).select('name email enrollmentEnabled assignedCourses');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        enrollmentEnabled: user.enrollmentEnabled,
        assignedCourses: user.assignedCourses
      }
    });
  } catch (error) {
    console.error('Error getting enrollment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving user status'
    });
  }
};

/**
 * @desc    Update user assigned courses
 * @route   PUT /api/admin/users/:userId/assign-courses
 * @access  Private (Admin only)
 */
export const assignCoursesToUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { courses } = req.body;
    
    // Validate courses array
    if (!Array.isArray(courses)) {
      res.status(400).json({
        success: false,
        message: 'Courses must be provided as an array'
      });
      return;
    }
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Update assigned courses
    user.assignedCourses = courses;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        assignedCourses: user.assignedCourses
      },
      message: `Courses successfully assigned to ${user.name}`
    });
  } catch (error) {
    console.error('Error assigning courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning courses'
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:userId
 * @access  Private (Admin only)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Prevent admins from being deleted through this endpoint
    if (user.role === 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin users cannot be deleted through this endpoint'
      });
      return;
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
}; 