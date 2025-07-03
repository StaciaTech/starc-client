import { Request, Response } from 'express';
import Assignment from '../models/Assignment.js';
import AssignmentSubmission from '../models/AssignmentSubmission.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all published assignments for a course
 * @route   GET /api/assignments/course/:courseId
 * @access  Private (authenticated users)
 */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get current date to filter assignments that are unlocked
    const currentDate = new Date();
    
    const assignments = await Assignment.find({
      courseId,
      isPublished: true,
      unlockDate: { $lte: currentDate }
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Error in getAssignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get all assignments for a course (including unpublished) - Admin only
 * @route   GET /api/admin/assignments/course/:courseId
 * @access  Private (admin)
 */
export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const assignments = await Assignment.find({ courseId }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get a single assignment by ID
 * @route   GET /api/assignments/:id
 * @access  Private (authenticated users)
 */
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment is published or if user is admin
    if (!assignment.isPublished && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if assignment is unlocked for regular users
    const currentDate = new Date();
    if (req.user.role !== 'admin' && assignment.unlockDate > currentDate) {
      return res.status(403).json({
        success: false,
        message: 'Assignment not yet available'
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error in getAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Create a new assignment
 * @route   POST /api/admin/assignments/course/:courseId
 * @access  Private (admin)
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, instructions, deadline } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate unlock date (7 days before deadline)
    const deadlineDate = new Date(deadline);
    const unlockDate = new Date(deadlineDate);
    unlockDate.setDate(unlockDate.getDate() - 7);

    // Get the count of existing assignments for this course to determine order
    const assignmentCount = await Assignment.countDocuments({ courseId });
    
    // Ensure we don't exceed 5 assignments per course
    if (assignmentCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of assignments (5) reached for this course'
      });
    }

    const newAssignment = await Assignment.create({
      courseId,
      title,
      description,
      instructions,
      deadline: deadlineDate,
      unlockDate,
      order: assignmentCount + 1,
      isPublished: false
    });

    return res.status(201).json({
      success: true,
      data: newAssignment
    });
  } catch (error) {
    console.error('Error in createAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Update an assignment
 * @route   PUT /api/admin/assignments/:id
 * @access  Private (admin)
 */
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, instructions, deadline, isPublished } = req.body;

    // Find the assignment
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Update fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    // If deadline is updated, also update the unlock date
    if (deadline !== undefined) {
      const deadlineDate = new Date(deadline);
      updateData.deadline = deadlineDate;
      
      const unlockDate = new Date(deadlineDate);
      unlockDate.setDate(unlockDate.getDate() - 7);
      updateData.unlockDate = unlockDate;
    }

    // Update the assignment
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error in updateAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Delete an assignment
 * @route   DELETE /api/admin/assignments/:id
 * @access  Private (admin)
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get the courseId and order of the assignment to be deleted
    const { courseId, order } = assignment;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete the assignment
      await Assignment.findByIdAndDelete(req.params.id).session(session);

      // Update the order of remaining assignments
      await Assignment.updateMany(
        { courseId, order: { $gt: order } },
        { $inc: { order: -1 } }
      ).session(session);

      // Delete all submissions for this assignment
      await AssignmentSubmission.deleteMany({ assignmentId: req.params.id }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Reorder assignments
 * @route   PUT /api/admin/assignments/course/:courseId/reorder
 * @access  Private (admin)
 */
export const reorderAssignments = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { assignmentIds } = req.body;

    // Validate input
    if (!Array.isArray(assignmentIds)) {
      return res.status(400).json({
        success: false,
        message: 'assignmentIds must be an array'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the order of each assignment
      for (let i = 0; i < assignmentIds.length; i++) {
        await Assignment.findByIdAndUpdate(
          assignmentIds[i],
          { order: i + 1 },
          { session }
        );
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      // Get the updated assignments
      const assignments = await Assignment.find({ courseId }).sort({ order: 1 });

      return res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error in reorderAssignments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Submit an assignment
 * @route   POST /api/assignments/:id/submit
 * @access  Private (authenticated users)
 */
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;
    const { submissionUrl } = req.body;
    const userId = req.user.id;

    // Check if assignment exists and is published
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isPublished: true
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not published'
      });
    }

    // Check if assignment is unlocked
    const currentDate = new Date();
    if (assignment.unlockDate > currentDate) {
      return res.status(403).json({
        success: false,
        message: 'Assignment not yet available for submission'
      });
    }

    // Check if deadline has passed, but don't prevent submission
    const isLateSubmission = assignment.deadline < currentDate;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Mark all previous submissions as not latest
      await AssignmentSubmission.updateMany(
        { assignmentId, userId, isLatest: true },
        { isLatest: false }
      ).session(session);

      // Create new submission
      const submission = await AssignmentSubmission.create([{
        assignmentId,
        userId,
        courseId: assignment.courseId,
        submissionUrl,
        submissionDate: currentDate,
        isLatest: true,
        isLateSubmission: isLateSubmission
      }], { session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        data: submission[0],
        isLateSubmission: isLateSubmission
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Error in submitAssignment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get user's submissions for an assignment
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (authenticated users)
 */
export const getUserSubmissions = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;
    const userId = req.user.id;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get user's submissions for this assignment
    const submissions = await AssignmentSubmission.find({
      assignmentId,
      userId
    }).sort({ submissionDate: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error in getUserSubmissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get all submissions for an assignment (admin only)
 * @route   GET /api/admin/assignments/:id/submissions
 * @access  Private (admin)
 */
export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const { id: assignmentId } = req.params;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get all latest submissions for this assignment with user details
    const submissions = await AssignmentSubmission.find({
      assignmentId,
      isLatest: true
    }).populate('userId', 'name email username');

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Error in getAllSubmissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Provide feedback and grade for a submission
 * @route   PUT /api/admin/submissions/:id
 * @access  Private (admin)
 */
export const provideSubmissionFeedback = async (req: Request, res: Response) => {
  try {
    const { id: submissionId } = req.params;
    const { feedback, grade } = req.body;

    // Find the submission
    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Update feedback and grade
    submission.feedback = feedback;
    if (grade !== undefined) {
      if (grade < 0 || grade > 100) {
        return res.status(400).json({
          success: false,
          message: 'Grade must be between 0 and 100'
        });
      }
      submission.grade = grade;
    }

    await submission.save();

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error in provideSubmissionFeedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 