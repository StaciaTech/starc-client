import { Request, Response } from 'express';
import Course from '../models/Course.js';
import CourseStructure from '../models/CourseStructure.js';
import Quiz from '../models/Quiz.js';
import aiContentService from '../services/aiContentService.js';

// Define interfaces for the request body structure
interface SectionInput {
  title: string;
  description?: string;
  order?: number;
  learningObjectives?: string[];
  keywords?: string[];
}

interface SubchapterInput {
  title: string;
  description?: string;
  order?: number;
  sections?: SectionInput[];
}

interface ChapterInput {
  title: string;
  description?: string;
  order?: number;
  subchapters?: SubchapterInput[];
}

/**
 * @desc    Preview AI-generated content for a section
 * @route   POST /api/admin/courses/preview-content
 * @access  Private (Admin)
 */
export const previewSectionContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, chapterTitle, subchapterTitle, sectionTitle, learningObjectives, keywords } = req.body;

    // Validate required fields
    if (!chapterTitle || !subchapterTitle || !sectionTitle) {
      res.status(400).json({
        success: false,
        message: 'Please provide chapter, subchapter and section titles'
      });
      return;
    }

    // Get course details if courseId is provided
    let courseTitle = 'New Course';
    let level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        courseTitle = course.title;
        level = course.level;
      }
    }

    // Generate content preview
    const generatedContent = await aiContentService.generateSectionContent({
      courseTitle,
      chapterTitle,
      subchapterTitle,
      sectionTitle,
      learningObjectives,
      keywords,
      level
    });

    res.status(200).json({
      success: true,
      data: {
        generatedContent,
        metadata: {
          courseTitle,
          chapterTitle,
          subchapterTitle,
          sectionTitle,
          learningObjectives,
          keywords,
          level
        }
      }
    });
  } catch (error) {
    console.error('Error previewing content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating content preview'
    });
  }
};

/**
 * @desc    Create complete course structure with content
 * @route   POST /api/admin/courses/:courseId/create-structure
 * @access  Private (Admin)
 */
export const createCourseStructureWithContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const { chapters } = req.body as { chapters: ChapterInput[] };
    
    // Validate input
    if (!Array.isArray(chapters) || chapters.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide at least one chapter'
      });
      return;
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Check if structure already exists and delete if it does
    const existingStructure = await CourseStructure.findOne({ course: courseId });
    if (existingStructure) {
      await CourseStructure.deleteOne({ course: courseId });
    }
    
    // Create new course structure with properly initialized nested documents
    const courseStructureData = {
      course: courseId,
      chapters: chapters.map((chapter: ChapterInput, chapterIdx: number) => ({
        title: chapter.title,
        description: chapter.description || '',
        order: chapter.order || chapterIdx + 1,
        subchapters: Array.isArray(chapter.subchapters) 
          ? chapter.subchapters.map((subchapter: SubchapterInput, subchapterIdx: number) => ({
              title: subchapter.title,
              description: subchapter.description || '',
              order: subchapter.order || subchapterIdx + 1,
              sections: Array.isArray(subchapter.sections)
                ? subchapter.sections.map((section: SectionInput, sectionIdx: number) => ({
                    title: section.title,
                    description: section.description || '',
                    order: section.order || sectionIdx + 1,
                    learningObjectives: section.learningObjectives || [],
                    keywords: section.keywords || [],
                    aiGenerated: false
                  }))
                : []
            }))
          : []
      }))
    };
    
    // Create the course structure using the prepared data
    const courseStructure = await CourseStructure.create(courseStructureData);
    
    res.status(201).json({
      success: true,
      data: courseStructure,
      message: 'Course structure created successfully. Generate content for individual sections as needed.'
    });
  } catch (error) {
    console.error('Error creating course structure:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course structure'
    });
  }
};

/**
 * @desc    Generate content for all sections in a course
 * @route   POST /api/admin/courses/:courseId/generate-all-content
 * @access  Private (Admin)
 */
export const generateAllContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    console.log(`Starting content generation for course ${courseId}`);
    
    // Find course structure
    const courseStructure = await CourseStructure.findOne({ course: courseId });
    if (!courseStructure) {
      console.error(`Course structure not found for course ${courseId}`);
      res.status(404).json({
        success: false,
        message: 'Course structure not found'
      });
      return;
    }
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      console.error(`Course not found with ID ${courseId}`);
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }
    
    // Track progress
    const totalSections = courseStructure.chapters.reduce(
      (total, chapter) => total + chapter.subchapters.reduce(
        (subtotal, subchapter) => subtotal + subchapter.sections.length, 0
      ), 0
    );
    
    console.log(`Found ${totalSections} sections to generate content for`);
    
    if (totalSections === 0) {
      res.status(400).json({
        success: false,
        message: 'No sections found in course structure'
      });
      return;
    }
    
    let generatedCount = 0;
    let failedSections: Array<{chapter: string, subchapter: string, section: string}> = [];
    let generatedQuizzes = 0;
    
    // Set a timeout for the entire operation (15 minutes)
    const timeout = 15 * 60 * 1000;
    const startTime = Date.now();
    
    // Generate content for each section
    for (let i = 0; i < courseStructure.chapters.length; i++) {
      const chapter = courseStructure.chapters[i];
      
      for (let j = 0; j < chapter.subchapters.length; j++) {
        const subchapter = chapter.subchapters[j];
        const sectionTitles: string[] = [];
        const sectionContents: string[] = [];
        
        // First pass: generate content for each section
        for (let k = 0; k < subchapter.sections.length; k++) {
          const section = subchapter.sections[k];
          
          try {
            // Check if we've exceeded the timeout
            if (Date.now() - startTime > timeout) {
              console.warn(`Generation timeout reached after processing ${generatedCount} sections`);
              break;
            }
            
            // Skip if already generated and not forcing regeneration
            if (section.aiGenerated && !req.body.forceRegenerate) {
              console.log(`Skipping already generated section: ${chapter.title} > ${subchapter.title} > ${section.title}`);
              sectionTitles.push(section.title);
              sectionContents.push(section.generatedContent || '');
              generatedCount++;
              continue;
            }
            
            console.log(`Generating content for section: ${chapter.title} > ${subchapter.title} > ${section.title}`);
            
            // Generate content
            const generatedContent = await aiContentService.generateSectionContent({
              courseTitle: course.title,
              chapterTitle: chapter.title,
              subchapterTitle: subchapter.title,
              sectionTitle: section.title,
              learningObjectives: section.learningObjectives,
              keywords: section.keywords,
              level: course.level
            });
            
            // Update section with generated content
            section.generatedContent = generatedContent;
            section.aiGenerated = true;
            section.lastGenerated = new Date();
            
            // Store section data for quiz generation
            sectionTitles.push(section.title);
            sectionContents.push(generatedContent);
            
            // Save changes after each section to avoid losing progress
            await courseStructure.save();
            
            generatedCount++;
            console.log(`Progress: ${generatedCount}/${totalSections} (${Math.round(generatedCount/totalSections*100)}%)`);
            
          } catch (sectionError) {
            console.error(`Error generating content for section "${section.title}":`, sectionError);
            failedSections.push({
              chapter: chapter.title,
              subchapter: subchapter.title,
              section: section.title
            });
          }
        }
        
        // Second pass: generate quizzes for the subchapter if we have sections with content
        if (sectionTitles.length > 0 && sectionContents.length > 0) {
          try {
            console.log(`Generating quizzes for subchapter: ${chapter.title} > ${subchapter.title}`);
            
            // Check if we've exceeded the timeout
            if (Date.now() - startTime > timeout) {
              console.warn(`Generation timeout reached before generating quizzes for ${subchapter.title}`);
              continue;
            }
            
            // Delete existing quizzes for this subchapter if forcing regeneration
            if (req.body.forceRegenerate) {
              // Find quizzes with titles containing the subchapter title
              const existingQuizzes = await Quiz.find({
                courseId: courseId,
                title: { $regex: subchapter.title, $options: 'i' }
              });
              
              if (existingQuizzes.length > 0) {
                console.log(`Deleting ${existingQuizzes.length} existing quizzes for subchapter ${subchapter.title}`);
                await Quiz.deleteMany({
                  _id: { $in: existingQuizzes.map(quiz => quiz._id) }
                });
              }
            }
            
            // Generate quizzes
            const quizzes = await aiContentService.generateSubchapterQuizzes({
              courseTitle: course.title,
              chapterTitle: chapter.title,
              subchapterTitle: subchapter.title,
              sectionTitles,
              sectionContents,
              level: course.level
            });
            
            // Save quizzes to database
            for (const quiz of quizzes) {
              // Add subchapter reference to quiz title if not already there
              if (!quiz.title.includes(subchapter.title)) {
                quiz.title = `${subchapter.title}: ${quiz.title}`;
              }
              
              await Quiz.create({
                courseId,
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore,
                questions: quiz.questions,
                isPublished: true // Auto-publish the generated quizzes
              });
              
              generatedQuizzes++;
            }
            
            console.log(`Generated ${quizzes.length} quizzes for subchapter ${subchapter.title}`);
            
          } catch (quizError) {
            console.error(`Error generating quizzes for subchapter "${subchapter.title}":`, quizError);
          }
        }
      }
    }
    
    console.log(`Generation complete. Generated ${generatedCount}/${totalSections} sections and ${generatedQuizzes} quizzes`);
    
    res.status(200).json({
      success: true,
      data: {
        totalSections,
        generatedCount,
        generatedQuizzes,
        failedSections,
        courseStructure: courseStructure._id
      },
      message: `Generated content for ${generatedCount} out of ${totalSections} sections and ${generatedQuizzes} quizzes`
    });
  } catch (error) {
    console.error('Error generating all content:', error);
    res.status(500).json({
      success: false,
      message: `Server error while generating content: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}; 