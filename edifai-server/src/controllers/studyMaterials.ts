import { Request, Response } from 'express';
import StudyMaterial, { IStudyMaterial } from '../models/StudyMaterial.js';
import Course from '../models/Course.js';

// @desc    Get all study materials for a course
// @route   GET /api/courses/:courseId/study-materials
// @access  Private
export const getStudyMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    // Verify course exists
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Get study materials for the course
    const materials = await StudyMaterial.find({ 
      courseId,
      isPublished: true
    }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error('Error getting study materials:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving study materials'
    });
  }
};

// @desc    Get all study materials for a course (including unpublished) - Admin only
// @route   GET /api/admin/courses/:courseId/study-materials
// @access  Private (Admin only)
export const getAllStudyMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    
    // Verify course exists
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Get all study materials for the course
    const materials = await StudyMaterial.find({ 
      courseId 
    }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });
  } catch (error) {
    console.error('Error getting study materials:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving study materials'
    });
  }
};

// @desc    Get a single study material
// @route   GET /api/study-materials/:id
// @access  Private
export const getStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error getting study material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving study material'
    });
  }
};

// @desc    Create a new study material
// @route   POST /api/admin/study-materials/:courseId
// @access  Private (Admin only)
export const createStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    console.log('Creating study material for course:', courseId);

    // Verify course exists
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Add courseId to study material data
    req.body.courseId = courseId;
    
    // Get the highest order number and add 1
    const highestOrder = await StudyMaterial.findOne({ courseId })
      .sort({ order: -1 })
      .select('order');
    
    req.body.order = highestOrder ? highestOrder.order + 1 : 0;
    
    // Create the study material
    const material = await StudyMaterial.create(req.body);
    
    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error creating study material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating study material'
    });
  }
};

// @desc    Update a study material
// @route   PUT /api/study-materials/:id
// @access  Private (Admin only)
export const updateStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    let material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
      return;
    }
    
    // Update the study material
    material = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error updating study material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating study material'
    });
  }
};

// @desc    Delete a study material
// @route   DELETE /api/study-materials/:id
// @access  Private (Admin only)
export const deleteStudyMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    
    if (!material) {
      res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
      return;
    }
    
    await material.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting study material:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting study material'
    });
  }
};

// @desc    Reorder study materials
// @route   PUT /api/admin/study-materials/course/:courseId/reorder
// @access  Private (Admin only)
export const reorderStudyMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { materialIds } = req.body;
    
    console.log('Reordering study materials for course:', courseId);
    
    if (!Array.isArray(materialIds)) {
      res.status(400).json({
        success: false,
        message: 'materialIds must be an array'
      });
      return;
    }
    
    // Update the order of each study material
    const updatePromises = materialIds.map((id, index) => {
      return StudyMaterial.findByIdAndUpdate(id, { order: index });
    });
    
    await Promise.all(updatePromises);
    
    // Get the updated study materials
    const materials = await StudyMaterial.find({ courseId }).sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    console.error('Error reordering study materials:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering study materials'
    });
  }
}; 