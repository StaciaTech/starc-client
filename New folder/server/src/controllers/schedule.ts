import { Request, Response } from 'express';
import Schedule from '../models/Schedule.js';

// @desc    Get user's schedule events
// @route   GET /api/schedule
// @access  Private
export const getUserSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const events = await Schedule.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error getting schedule events:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while getting schedule events'
    });
  }
};

// @desc    Add a schedule event
// @route   POST /api/schedule
// @access  Private
export const addScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { title, dueDate, time, description, color } = req.body;
    
    // Create event with user ID from authenticated user
    const event = await Schedule.create({
      title,
      dueDate,
      time,
      description,
      color,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error adding schedule event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding schedule event'
    });
  }
};

// @desc    Update a schedule event
// @route   PUT /api/schedule/:id
// @access  Private
export const updateScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    let event = await Schedule.findById(req.params.id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user owns the event
    if (event.userId.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
      return;
    }

    event = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error updating schedule event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating schedule event'
    });
  }
};

// @desc    Delete a schedule event
// @route   DELETE /api/schedule/:id
// @access  Private
export const deleteScheduleEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const event = await Schedule.findById(req.params.id);

    if (!event) {
      res.status(404).json({
        success: false,
        message: 'Event not found'
      });
      return;
    }

    // Check if user owns the event
    if (event.userId.toString() !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
      return;
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting schedule event:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting schedule event'
    });
  }
}; 