import { Request, Response } from 'express';
import Mentor from '../models/Mentor.js';

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
export const getMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentors = await Mentor.find().populate({
      path: 'courses',
      select: 'title description thumbnail'
    });
    
    res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors
    });
  } catch (error) {
    console.error('Error getting mentors:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving mentors'
    });
  }
};

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
export const getMentor = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('courses');
    
    if (!mentor) {
      res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: mentor
    });
  } catch (error) {
    console.error('Error getting mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving mentor'
    });
  }
};

// @desc    Get mentor courses
// @route   GET /api/mentors/:id/courses
// @access  Public
export const getMentorCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const mentor = await Mentor.findById(req.params.id).populate('courses');
    
    if (!mentor) {
      res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      count: mentor.courses.length,
      data: mentor.courses
    });
  } catch (error) {
    console.error('Error getting mentor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving mentor courses'
    });
  }
}; 