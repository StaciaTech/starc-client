import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course.js';
import UserCourse from '../models/UserCourse.js';
import User from '../models/User.js';
import UserQuiz from '../models/UserQuiz.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = { ...req.query };
    
    // Fields to exclude from filtering
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete query[param]);
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search as string };
    }
    
    // Filter for category and level
    if (req.query.category) query.category = req.query.category;
    if (req.query.level) query.level = req.query.level;
    
    // Find courses
    let coursesQuery = Course.find(query) as any;
    
    // Select fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      coursesQuery = coursesQuery.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      coursesQuery = coursesQuery.sort(sortBy);
    } else {
      coursesQuery = coursesQuery.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Course.countDocuments(query);
    
    coursesQuery = coursesQuery.skip(startIndex).limit(limit);
    
    // Execute query
    const courses = await coursesQuery.exec();
    
    // Pagination result
    const pagination: any = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: courses.length,
      pagination,
      data: courses
    });
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving courses'
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id).populate({
      path: 'reviews.user',
      select: 'name'
    });
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving course'
    });
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin only)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add user to request body as instructor
    req.body.instructor = req.user?.id;
    
    const course = await Course.create(req.body);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin only)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
      return;
    }
    
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin only)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Make sure user is course instructor or admin
    if (course.instructor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
      return;
    }
    
    await course.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course'
    });
  }
};

// @desc    Enroll in a course
// @route   PUT /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Check if user has enrollment access
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // If user is not an admin and doesn't have enrollment access, deny enrollment
    if (req.user.role !== 'admin' && !user.enrollmentEnabled) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to enroll in courses. Please contact an administrator.'
      });
      return;
    }

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // If user has assigned courses and is not an admin, check if they can enroll in this course
    if (req.user.role !== 'admin' && user.assignedCourses && user.assignedCourses.length > 0) {
      // Check if this course is in the user's assigned courses
      const courseIdStr = String(course._id);
      const userAssignedCourseIds = user.assignedCourses.map(id => String(id));
      
      if (!userAssignedCourseIds.includes(courseIdStr)) {
        res.status(403).json({
          success: false,
          message: 'You are not allowed to enroll in this specific course. Please contact an administrator.'
        });
        return;
      }
    }

    // Check if user is already enrolled in the course
    const existingEnrollment = await UserCourse.findOne({
      user: req.user.id,
      course: course._id
    });
    
    if (existingEnrollment) {
      res.status(400).json({
        success: false,
        message: 'User already enrolled in this course'
      });
      return;
    }
    
    // Create a new user course enrollment
    const userCourse = await UserCourse.create({
      user: req.user.id,
      course: course._id,
      progress: 0,
      completed: false,
      startDate: new Date(),
      lastAccessDate: new Date(),
      currentLesson: 0
    });
    
    // Also add user to the course's enrolledUsers array for backward compatibility
    // and easier course-centric queries
    if (!course.enrolledUsers.includes(req.user.id)) {
      course.enrolledUsers.push(req.user.id);
      await course.save();
    }
    
    // Return the enrollment information
    res.status(200).json({
      success: true,
      data: {
        enrollment: userCourse,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          duration: course.duration,
          level: course.level,
          category: course.category
        }
      }
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while enrolling in course'
    });
  }
};

// @desc    Add course review
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addCourseReview = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { rating, comment } = req.body;
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if user is enrolled in the course
    const isEnrolled = course.enrolledUsers.some(
      (user) => user.toString() === req.user.id
    );
    
    if (!isEnrolled && req.user.role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'You must be enrolled in the course to leave a review'
      });
      return;
    }
    
    // Check if user already submitted a review
    const alreadyReviewed = course.reviews.some(
      (review) => review.user.toString() === req.user.id
    );
    
    if (alreadyReviewed) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this course'
      });
      return;
    }
    
    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment,
      date: new Date()
    };
    
    course.reviews.push(review);
    
    // Calculate average rating
    const totalRating = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    course.rating = totalRating / course.reviews.length;
    
    await course.save();
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
};

// @desc    Update user's course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
export const updateCourseProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { progress, currentLesson, completed, completedSections } = req.body;
    
    // Validate progress value
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
      return;
    }
    
    // Find the user's enrollment for this course
    const userCourse = await UserCourse.findOne({
      user: req.user.id,
      course: req.params.id
    });
    
    if (!userCourse) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found. User is not enrolled in this course.'
      });
      return;
    }
    
    // Get the course to check if it's been marked as completed by admin
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Update the fields
    if (progress !== undefined) {
      userCourse.progress = progress;
    }
    
    if (currentLesson !== undefined) {
      userCourse.currentLesson = currentLesson;
    }
    
    // Handle completion status
    if (completed !== undefined) {
      // Only update if the completion status is changing
      if (completed !== userCourse.completed) {
        // Only allow marking as completed if:
        // 1. Admin has already marked the course as completed, AND
        // 2. The user has completed all content (progress is high)
        if (completed === true) {
          // Check if the course is marked as completed by admin
          if (!course.isCompleted) {
            // If admin hasn't marked it completed, don't allow user to be marked as completed
            res.status(400).json({
              success: false,
              message: 'Course cannot be marked as completed until the administrator marks it as completed'
            });
            return;
          }
          
          // Set completion date and ensure progress is 100%
          userCourse.completionDate = new Date();
          userCourse.progress = 100;
          userCourse.completed = true;
          
          // Log completion event for admin dashboard
          console.log(`User ${req.user.id} completed course ${req.params.id} at ${new Date().toISOString()}`);
          
          // Add metadata to indicate this user completed after admin marked as completed
          userCourse.notes = userCourse.notes || '';
          if (!userCourse.notes.includes('completed_after_admin_mark')) {
            userCourse.notes += `completed_after_admin_mark:${new Date().toISOString()};`;
          }
        } else {
          // If unmarking as completed, remove completion date
          userCourse.completionDate = undefined;
          userCourse.completed = false;
        }
      }
    }
    
    // Update completed sections if provided
    if (completedSections !== undefined) {
      userCourse.completedSections = completedSections;
    }
    
    // Always update the last access date
    userCourse.lastAccessDate = new Date();
    
    // Save the changes
    await userCourse.save();
    
    res.status(200).json({
      success: true,
      data: userCourse
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course progress'
    });
  }
};

// @desc    Get user's course details including completed sections and quizzes
// @route   GET /api/courses/:id/user-details
// @access  Private
export const getUserCourseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const courseId = req.params.id;
    
    // Find the user's enrollment for this course
    const userCourse = await UserCourse.findOne({
      user: req.user.id,
      course: courseId
    });
    
    if (!userCourse) {
      res.status(404).json({
        success: false,
        message: 'User is not enrolled in this course'
      });
      return;
    }
    
    // Get user's quiz attempts for this course
    const userQuizAttempts = await UserQuiz.find({
      user: req.user.id,
      course: courseId
    }).sort({ completedAt: -1 });
    
    // Format quiz attempts by quiz ID for easier access
    const quizAttempts: Record<string, any> = {};
    userQuizAttempts.forEach(attempt => {
      const quizId = attempt.quiz.toString();
      if (!quizAttempts[quizId] || attempt.score > quizAttempts[quizId].score) {
        quizAttempts[quizId] = {
          score: attempt.score,
          passed: attempt.passed,
          completedAt: attempt.completedAt
        };
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        progress: userCourse.progress,
        completed: userCourse.completed,
        currentLesson: userCourse.currentLesson,
        lastAccessDate: userCourse.lastAccessDate,
        completedSections: userCourse.completedSections || [],
        completedQuizzes: userCourse.completedQuizzes || [],
        quizAttempts
      }
    });
  } catch (error) {
    console.error('Error getting user course details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting user course details'
    });
  }
};

// @desc    Set course completion announcement and status
// @route   PUT /api/courses/:id/completion
// @access  Private (Admin only)
export const setCourseCompletion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists and is an admin
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update course completion status'
      });
      return;
    }

    const { completionAnnouncement, isCompleted } = req.body;
    
    // Find the course by ID
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Update the course completion fields
    if (completionAnnouncement !== undefined) {
      course.completionAnnouncement = completionAnnouncement;
    }
    
    if (isCompleted !== undefined) {
      course.isCompleted = isCompleted;
    }
    
    // Save the updated course
    await course.save();
    
    // If the course is marked as completed, update all enrolled users' progress
    if (isCompleted) {
      // Find all user enrollments for this course
      const userCourses = await UserCourse.find({ course: req.params.id });
      
      // Update the completion status for all enrolled users
      const updatePromises = userCourses.map(async (userCourse) => {
        // Only update if the user has made significant progress (e.g., over 70%)
        if (userCourse.progress >= 70) {
          userCourse.completed = true;
          userCourse.completionDate = new Date();
          return userCourse.save();
        }
        return null;
      });
      
      await Promise.all(updatePromises);
    }
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course completion:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course completion'
    });
  }
};

// @desc    Get users who completed a course (for admin dashboard)
// @route   GET /api/courses/:id/completed-users
// @access  Private (Admin only)
export const getCompletedCourseUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists and is an admin
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
      return;
    }

    const courseId = req.params.id;
    
    // Find all completed user enrollments for this course
    const completedEnrollments = await UserCourse.find({
      course: courseId,
      completed: true
    }).populate('user', 'name email username');
    
    if (!completedEnrollments || completedEnrollments.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
      return;
    }
    
    // Format the data for the admin dashboard
    const formattedData = completedEnrollments.map(enrollment => {
      // Check if the user completed after admin marked as completed
      const completedAfterAdminMark = enrollment.notes && 
        enrollment.notes.includes('completed_after_admin_mark');
      
      // Extract timestamp if available
      let adminMarkCompletionTimestamp = null;
      if (completedAfterAdminMark && enrollment.notes) {
        const match = enrollment.notes.match(/completed_after_admin_mark:([^;]+)/);
        if (match && match[1]) {
          adminMarkCompletionTimestamp = match[1];
        }
      }
      
      // Handle the populated user object properly
      const user = enrollment.user as any; // Cast to any to access properties
      
      return {
        userId: user._id,
        userName: user.name || 'Unknown User',
        userEmail: user.email || 'No Email',
        username: user.username || 'No Username',
        progress: enrollment.progress,
        completionDate: enrollment.completionDate,
        startDate: enrollment.startDate,
        completedAfterAdminMark: completedAfterAdminMark,
        adminMarkCompletionTimestamp: adminMarkCompletionTimestamp
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
  } catch (error) {
    console.error('Error getting completed course users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving completed course users'
    });
  }
}; 