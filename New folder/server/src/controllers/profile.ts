import { Request, Response } from 'express';
import User from '../models/User.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';
import UserCourse from '../models/UserCourse.js';

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, location, dateOfBirth, phone, avatar, username } = req.body;

    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Find user by ID from auth middleware
    let user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (location) user.location = location;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    
    // If email is being updated, check if it's already in use
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
        return;
      }
      user.email = email;
    }
    
    // If username is being updated, check if it's already in use
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        res.status(400).json({
          success: false,
          message: 'Username already in use'
        });
        return;
      }
      user.username = username;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// @desc    Get user's activity and progress
// @route   GET /api/profile/activity
// @access  Private
export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for user authentication
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Define activity data type
    interface ActivityData {
      learningHours: number;
      certificatesEarned: number;
      coursesEnrolled: number;
      progress: number;
      recentActivity: Array<{
        courseId: string;
        courseName: string;
        lastAccessed: Date | null;
        progress: number;
      }>;
    }

    // Find user enrollments
    const userCourses = await UserCourse.find({ user: userId })
      .populate('course');

    // Initialize activity data with empty values
    const activityData: ActivityData = {
      learningHours: 0,
      certificatesEarned: 0,
      coursesEnrolled: userCourses.length,
      progress: 0,
      recentActivity: []
    };

    // If user has courses, calculate actual data
    if (userCourses.length > 0) {
      // Calculate certificates earned (completed courses)
      const completedCourses = userCourses.filter(course => course.completed);
      activityData.certificatesEarned = completedCourses.length;

      // Calculate average progress
      const totalProgress = userCourses.reduce((sum, course) => sum + (course.progress || 0), 0);
      activityData.progress = userCourses.length > 0 
        ? Math.round(totalProgress / userCourses.length) 
        : 0;

      // Calculate estimated learning hours (based on course duration and progress)
      const totalHours = userCourses.reduce((sum, course) => {
        // Access the populated course document and handle possible undefined values
        const courseDuration = course.course && typeof course.course === 'object' ? (course.course as any).duration || 0 : 0;
        const courseProgress = course.progress || 0;
        return sum + (courseDuration * courseProgress / 100);
      }, 0);
      activityData.learningHours = Math.round(totalHours);

      // Get recent activity (last accessed courses)
      const recentActivity = userCourses
        .filter(course => course.lastAccessDate)
        .sort((a, b) => {
          const dateA = a.lastAccessDate ? new Date(a.lastAccessDate).getTime() : 0;
          const dateB = b.lastAccessDate ? new Date(b.lastAccessDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map(course => ({
          courseId: course.course && typeof course.course === 'object' ? (course.course as any)._id || '' : '',
          courseName: course.course && typeof course.course === 'object' ? (course.course as any).title || 'Unknown Course' : 'Unknown Course',
          lastAccessed: course.lastAccessDate,
          progress: course.progress || 0
        }));
      
      activityData.recentActivity = recentActivity;
    }

    res.status(200).json({ success: true, data: activityData });
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving user activity',
      data: {
        learningHours: 0,
        certificatesEarned: 0,
        coursesEnrolled: 0,
        progress: 0,
        recentActivity: []
      }
    });
  }
};

// @desc    Get enrolled courses for a user
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Get the current user from req.user (added by auth middleware)
    const userId = req.user.id;

    // Find all user course enrollments
    const userCourses = await UserCourse.find({ user: userId })
      .sort({ lastAccessDate: -1 }) // Sort by last accessed (most recent first)
      .populate({
        path: 'course',
        select: 'title description thumbnail duration level category instructor',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!userCourses || userCourses.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
      return;
    }

    // Format the courses data to match the frontend requirements
    const formattedCourses = userCourses
      .filter(userCourse => userCourse.course) // Filter out any null course references
      .map(userCourse => {
        const course = userCourse.course as any;
        
        // Skip if course is null or undefined
        if (!course) {
          return null;
        }
        
        // Format duration in months/weeks/days based on the minutes
        let durationText = '1 Month'; // Default
        if (course.duration) {
          const hours = Math.floor(course.duration / 60);
          if (hours > 40) {
            durationText = `${Math.ceil(hours / 40)} Months`;
          } else if (hours > 10) {
            durationText = `${Math.ceil(hours / 10)} Weeks`;
          } else {
            durationText = `${hours} Hours`;
          }
        }
        
        // Format status based on completion/progress
        const status = userCourse.completed ? 'Completed' : `${userCourse.progress}%`;
        
        // Construct the image path
        // In a real app, this would be an actual URL from the database
        // For this implementation, we'll use a pattern matching course IDs to images
        const courseId = course._id.toString();
        const imageNumber = (parseInt(courseId.substring(courseId.length - 2), 16) % 6) + 1;
        const imagePath = `/src/Assets/icons/course${imageNumber}.svg`;
        
        return {
          id: courseId,
          title: course.title,
          description: course.description,
          duration: durationText,
          progress: userCourse.progress,
          status: status,
          image: imagePath,
          instructor: course.instructor?.name || 'Unknown Instructor',
          level: course.level,
          category: course.category,
          lastAccessed: userCourse.lastAccessDate,
          currentLesson: userCourse.currentLesson || 0
        };
      })
      .filter(Boolean); // Remove any null entries from the map operation

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      data: formattedCourses
    });
  } catch (error) {
    console.error('Error getting enrolled courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting enrolled courses'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Find user by ID from auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving profile'
    });
  }
}; 