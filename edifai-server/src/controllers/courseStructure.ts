import { Request, Response } from 'express';
import CourseStructure from '../models/CourseStructure.js';
import Course from '../models/Course.js';
import aiContentService from '../services/aiContentService.js';
import Quiz from '../models/Quiz.js';
import mongoose from 'mongoose';

// @desc    Create course structure
// @route   POST /api/courses/:courseId/structure
// @access  Private (Admin)
export const createCourseStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if structure already exists
    const existingStructure = await CourseStructure.findOne({ course: courseId });
    if (existingStructure) {
      res.status(400).json({
        success: false,
        message: 'Course structure already exists for this course'
      });
      return;
    }
    
    // Create course structure
    const courseStructure = await CourseStructure.create({
      course: courseId,
      chapters: req.body.chapters || []
    });
    
    res.status(201).json({
      success: true,
      data: courseStructure
    });
  } catch (error) {
    console.error('Error creating course structure:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course structure'
    });
  }
};

// @desc    Get course structure
// @route   GET /api/courses/:courseId/structure
// @access  Private
export const getCourseStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: courseStructure
    });
  } catch (error) {
    console.error('Error getting course structure:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving course structure'
    });
  }
};

// @desc    Update course structure
// @route   PUT /api/courses/:courseId/structure
// @access  Private (Admin)
export const updateCourseStructure = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Find and update course structure
    const courseStructure = await CourseStructure.findOneAndUpdate(
      { course: courseId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: courseStructure
    });
  } catch (error) {
    console.error('Error updating course structure:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course structure'
    });
  }
};

// @desc    Add chapter to course structure
// @route   POST /api/courses/:courseId/structure/chapters
// @access  Private (Admin)
export const addChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Get course details for AI content generation
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Transform the chapter data to match MongoDB schema
    const chapterData = { ...req.body };
    
    // Instead of mapping id to _id, generate new MongoDB ObjectIds
    delete chapterData._id; // Remove any existing _id
    delete chapterData.id;  // Remove frontend id
    
    // Ensure order is set
    if (chapterData.order === undefined) {
      // Set order to the next available index
      chapterData.order = courseStructure.chapters.length;
    }
    
    // Transform subchapters
    if (chapterData.subchapters && Array.isArray(chapterData.subchapters)) {
      // Process each subchapter
      for (let subIndex = 0; subIndex < chapterData.subchapters.length; subIndex++) {
        const subchapter = chapterData.subchapters[subIndex];
        const transformedSubchapter = { ...subchapter };
        
        // Remove existing ids
        delete transformedSubchapter._id;
        delete transformedSubchapter.id;
        
        // Ensure order is set
        if (transformedSubchapter.order === undefined) {
          transformedSubchapter.order = subIndex;
        }
        
        // Transform sections and collect section data for quiz generation
        const sectionTitles: string[] = [];
        const sectionContents: string[] = [];
        
        if (transformedSubchapter.sections && Array.isArray(transformedSubchapter.sections)) {
          // Process each section and generate AI content
          for (let secIndex = 0; secIndex < transformedSubchapter.sections.length; secIndex++) {
            const section = transformedSubchapter.sections[secIndex];
            const transformedSection = { ...section };
            
            // Remove existing ids
            delete transformedSection._id;
            delete transformedSection.id;
            
            // Ensure order is set
            if (transformedSection.order === undefined) {
              transformedSection.order = secIndex;
            }
            
            // Generate AI content for this section
            try {
              const generatedContent = await aiContentService.generateSectionContent({
                courseTitle: course.title,
                chapterTitle: chapterData.title,
                subchapterTitle: transformedSubchapter.title,
                sectionTitle: transformedSection.title,
                learningObjectives: transformedSection.learningObjectives || [],
                keywords: transformedSection.keywords || [],
                level: course.level
              });
              
              // Set the generated content and mark as AI generated
              transformedSection.generatedContent = generatedContent;
              transformedSection.aiGenerated = true;
              transformedSection.lastGenerated = new Date();
              
              // Store section data for quiz generation
              sectionTitles.push(transformedSection.title);
              sectionContents.push(generatedContent);
            } catch (aiError) {
              console.error('Error generating AI content for section:', aiError);
              // Continue with empty content if AI generation fails
              transformedSection.generatedContent = '';
              transformedSection.aiGenerated = false;
              
              // Add placeholder content for quiz generation
              sectionTitles.push(transformedSection.title);
              sectionContents.push(`Placeholder content for ${transformedSection.title}`);
            }
            
            // Update the section in the array
            transformedSubchapter.sections[secIndex] = transformedSection;
          }
        }
        
        // Generate quizzes for this subchapter
        try {
          // Only generate quizzes if we have sections with content
          if (sectionTitles.length > 0 && sectionContents.length > 0) {
            console.log(`Generating quizzes for subchapter: ${transformedSubchapter.title}`);
            
            const generatedQuizzes = await aiContentService.generateSubchapterQuizzes({
              courseTitle: course.title,
              chapterTitle: chapterData.title,
              subchapterTitle: transformedSubchapter.title,
              sectionTitles,
              sectionContents,
              level: course.level
            });
            
            // Save the generated quizzes to the database
            for (const quizData of generatedQuizzes) {
              const quiz = new Quiz({
                courseId: new mongoose.Types.ObjectId(courseId),
                title: `${transformedSubchapter.title}: ${quizData.title}`,
                description: quizData.description,
                timeLimit: quizData.timeLimit,
                passingScore: quizData.passingScore,
                questions: quizData.questions,
                isPublished: true
              });
              
              await quiz.save();
              console.log(`Quiz saved: ${quiz.title}`);
            }
          }
        } catch (quizError) {
          console.error('Error generating quizzes for subchapter:', quizError);
          // Continue without quizzes if generation fails
        }
        
        // Update the subchapter in the array
        chapterData.subchapters[subIndex] = transformedSubchapter;
      }
    }
    
    // Add the transformed chapter to the course structure
    courseStructure.chapters.push(chapterData);
    await courseStructure.save();
    
    res.status(201).json({
      success: true,
      data: courseStructure.chapters[courseStructure.chapters.length - 1]
    });
  } catch (error) {
    console.error('Error adding chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding chapter',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// @desc    Add subchapter to a chapter
// @route   POST /api/courses/:courseId/structure/chapters/:chapterId/subchapters
// @access  Private (Admin)
export const addSubchapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Find chapter by index or _id
    const chapterIndex = courseStructure.chapters.findIndex(
      chapter => chapter._id.toString() === chapterId
    );
    
    if (chapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
      return;
    }
    
    // Transform the subchapter data to match MongoDB schema
    const subchapterData = { ...req.body };
    
    // Remove existing IDs to let MongoDB generate new ones
    delete subchapterData._id;
    delete subchapterData.id;
    
    // Ensure order is set
    if (subchapterData.order === undefined) {
      // Set order to the next available index
      subchapterData.order = courseStructure.chapters[chapterIndex].subchapters.length;
    }
    
    // Transform sections if they exist
    if (subchapterData.sections && Array.isArray(subchapterData.sections)) {
      subchapterData.sections = subchapterData.sections.map((section: any, secIndex: number) => {
        const transformedSection = { ...section };
        
        // Remove existing IDs
        delete transformedSection._id;
        delete transformedSection.id;
        
        // Ensure order is set
        if (transformedSection.order === undefined) {
          transformedSection.order = secIndex;
        }
        
        // Ensure aiGenerated is set
        if (transformedSection.aiGenerated === undefined) {
          transformedSection.aiGenerated = false;
        }
        
        return transformedSection;
      });
    }
    
    // Add subchapter
    courseStructure.chapters[chapterIndex].subchapters.push(subchapterData);
    await courseStructure.save();
    
    res.status(201).json({
      success: true,
      data: courseStructure.chapters[chapterIndex].subchapters[
        courseStructure.chapters[chapterIndex].subchapters.length - 1
      ]
    });
  } catch (error) {
    console.error('Error adding subchapter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding subchapter',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// @desc    Add section to a subchapter
// @route   POST /api/courses/:courseId/structure/chapters/:chapterId/subchapters/:subchapterId/sections
// @access  Private (Admin)
export const addSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    const subchapterId = req.params.subchapterId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Find chapter by index or _id
    const chapterIndex = courseStructure.chapters.findIndex(
      chapter => chapter._id.toString() === chapterId
    );
    
    if (chapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
      return;
    }
    
    // Find subchapter by index or _id
    const subchapterIndex = courseStructure.chapters[chapterIndex].subchapters.findIndex(
      subchapter => subchapter._id.toString() === subchapterId
    );
    
    if (subchapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Subchapter not found'
      });
      return;
    }
    
    // Transform the section data to match MongoDB schema
    const sectionData = { ...req.body };
    
    // Remove existing IDs to let MongoDB generate new ones
    delete sectionData._id;
    delete sectionData.id;
    
    // Ensure order is set
    if (sectionData.order === undefined) {
      // Set order to the next available index
      sectionData.order = courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections.length;
    }
    
    // Ensure aiGenerated is set
    if (sectionData.aiGenerated === undefined) {
      sectionData.aiGenerated = false;
    }
    
    // Add section
    courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections.push(sectionData);
    await courseStructure.save();
    
    res.status(201).json({
      success: true,
      data: courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections[
        courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections.length - 1
      ]
    });
  } catch (error) {
    console.error('Error adding section:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding section',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// @desc    Generate content for a section
// @route   POST /api/courses/:courseId/structure/chapters/:chapterId/subchapters/:subchapterId/sections/:sectionId/generate
// @access  Private
export const generateSectionContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    const subchapterId = req.params.subchapterId;
    const sectionId = req.params.sectionId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Find chapter by index or _id
    const chapterIndex = courseStructure.chapters.findIndex(
      chapter => chapter._id.toString() === chapterId
    );
    
    if (chapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
      return;
    }
    
    // Find subchapter by index or _id
    const subchapterIndex = courseStructure.chapters[chapterIndex].subchapters.findIndex(
      subchapter => subchapter._id.toString() === subchapterId
    );
    
    if (subchapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Subchapter not found'
      });
      return;
    }
    
    // Find section by index or _id
    const sectionIndex = courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections.findIndex(
      section => section._id.toString() === sectionId
    );
    
    if (sectionIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Section not found'
      });
      return;
    }
    
    const section = courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].sections[sectionIndex];
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Generate content
    const generatedContent = await aiContentService.generateSectionContent({
      courseTitle: course.title,
      chapterTitle: courseStructure.chapters[chapterIndex].title,
      subchapterTitle: courseStructure.chapters[chapterIndex].subchapters[subchapterIndex].title,
      sectionTitle: section.title,
      learningObjectives: section.learningObjectives,
      keywords: section.keywords,
      level: course.level
    });
    
    // Update section with generated content
    section.generatedContent = generatedContent;
    section.aiGenerated = true;
    section.lastGenerated = new Date();
    await courseStructure.save();
    
    res.status(200).json({
      success: true,
      data: {
        sectionId: section._id,
        generatedContent: section.generatedContent
      }
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating content'
    });
  }
};

// @desc    Delete chapter from course structure
// @route   DELETE /api/courses/:courseId/structure/chapters/:chapterId
// @access  Private (Admin)
export const deleteChapter = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const chapterId = req.params.chapterId;
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Find chapter index
    const chapterIndex = courseStructure.chapters.findIndex(
      chapter => chapter._id.toString() === chapterId
    );
    
    if (chapterIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
      return;
    }
    
    // Remove the chapter
    courseStructure.chapters.splice(chapterIndex, 1);
    
    // Update the order of remaining chapters
    courseStructure.chapters.forEach((chapter, index) => {
      chapter.order = index;
    });
    
    // Save the updated course structure
    await courseStructure.save();
    
    res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
      data: courseStructure
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chapter',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// @desc    Update section video URL
// @route   PATCH /api/courses/:courseId/structure/section/:sectionId/video
// @access  Private (Admin)
export const updateSectionVideoUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const sectionId = req.params.sectionId;
    const { videoUrl } = req.body;

    if (!videoUrl) {
      res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
      return;
    }

    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }

    // Flag to check if section was found and updated
    let sectionFound = false;

    // Loop through the structure to find and update the section
    for (const chapter of courseStructure.chapters) {
      for (const subchapter of chapter.subchapters) {
        for (const section of subchapter.sections) {
          if (section._id.toString() === sectionId) {
            section.videoUrl = videoUrl;
            sectionFound = true;
            break;
          }
        }
        if (sectionFound) break;
      }
      if (sectionFound) break;
    }

    if (!sectionFound) {
      res.status(404).json({
        success: false,
        message: 'Section not found'
      });
      return;
    }

    // Save the updated course structure
    await courseStructure.save();

    res.status(200).json({
      success: true,
      message: 'Section video URL updated successfully'
    });
  } catch (error) {
    console.error('Error updating section video URL:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating section video URL'
    });
  }
}; 