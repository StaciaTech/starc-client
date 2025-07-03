import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import UserQuiz from '../models/UserQuiz.js';
import Course from '../models/Course.js';
import UserCourse from '../models/UserCourse.js';

// @desc    Get all quizzes for a course
// @route   GET /api/courses/:courseId/quizzes
// @access  Private
export const getQuizzesByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    console.log(`Fetching quizzes for course: ${courseId}`);

    // Verify course exists
    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      console.log(`Course not found: ${courseId}`);
      res.status(404).json({
        success: false,
        message: 'Course not found'
      });
      return;
    }

    // Get quizzes for the course
    const quizzes = await Quiz.find({ courseId });
    console.log(`Found ${quizzes.length} quizzes for course ${courseId}`);
    
    // For non-admin users, filter out the correct answers
    const isAdmin = req.user?.role === 'admin';
    const filteredQuizzes = isAdmin ? quizzes : quizzes.map(quiz => {
      const quizObj = quiz.toObject();
      if (quizObj.questions) {
        quizObj.questions = quizObj.questions.map(q => ({
          ...q,
          options: q.options.map(o => ({
            ...o,
            isCorrect: false // Hide correct answers for non-admins
          }))
        }));
      }
      return quizObj;
    });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: filteredQuizzes
    });
  } catch (error) {
    console.error('Error getting quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quizzes'
    });
  }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
      return;
    }

    // Check if user is an admin
    const isAdmin = req.user?.role === 'admin';
    
    // If not admin, remove correct answers from response
    const quizData = isAdmin 
      ? quiz 
      : quiz.toObject();
    
    if (!isAdmin) {
      quizData.questions = quizData.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          optionText: option.optionText,
          // Remove the isCorrect flag for non-admins
          isCorrect: false
        }))
      }));
    }
    
    res.status(200).json({
      success: true,
      data: quizData
    });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quiz'
    });
  }
};

// @desc    Create a new quiz
// @route   POST /api/courses/:courseId/quizzes
// @access  Private (Admin only)
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
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

    // Add courseId to quiz data
    req.body.courseId = courseId;
    
    // Create the quiz
    const quiz = await Quiz.create(req.body);
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating quiz'
    });
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin only)
export const updateQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
      return;
    }
    
    // Update the quiz
    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating quiz'
    });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin only)
export const deleteQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
      return;
    }
    
    await quiz.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting quiz'
    });
  }
};

// @desc    Submit a quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { id: quizId } = req.params;
    const { answers, timeTaken } = req.body;
    
    // Validate required fields
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array'
      });
      return;
    }
    
    // Get the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
      return;
    }
    
    // Calculate score
    let score = 0;
    const maxScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    
    // Process each answer
    const processedAnswers = answers.map((answer: any) => {
      const { questionIndex, selectedOptionIndex } = answer;
      
      // Validate indices
      if (
        questionIndex < 0 || 
        questionIndex >= quiz.questions.length ||
        selectedOptionIndex < 0 || 
        selectedOptionIndex >= quiz.questions[questionIndex].options.length
      ) {
        return {
          questionIndex,
          selectedOptionIndex,
          isCorrect: false
        };
      }
      
      // Check if the selected option is correct
      const isCorrect = quiz.questions[questionIndex].options[selectedOptionIndex].isCorrect;
      
      // Add points to score if correct
      if (isCorrect) {
        score += quiz.questions[questionIndex].points;
      }
      
      return {
        questionIndex,
        selectedOptionIndex,
        isCorrect
      };
    });
    
    // Calculate percentage score
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    
    // Determine if the user passed the quiz
    const passed = percentage >= quiz.passingScore;
    
    // Create user quiz attempt record
    const userQuiz = await UserQuiz.create({
      user: req.user.id,
      quiz: quizId,
      course: quiz.courseId,
      answers: processedAnswers,
      score,
      maxScore,
      percentage,
      passed,
      timeTaken: timeTaken || 0,
      startedAt: new Date(Date.now() - (timeTaken * 1000) || Date.now()),
      completedAt: new Date()
    });

    // Update the user's course progress to include this quiz completion
    try {
      // Find the user's enrollment for this course
      const userCourse = await UserCourse.findOne({
        user: req.user.id,
        course: quiz.courseId
      });

      if (userCourse) {
        // Use MongoDB's $addToSet to add the quiz to the completedQuizzes array if it doesn't exist
        // Or use $set with the positional operator to update it if it exists with a better score
        await UserCourse.updateOne(
          { 
            _id: userCourse._id,
            // Check if this quiz exists in the array with a lower score
            'completedQuizzes.quizId': quizId
          },
          {
            $set: {
              'completedQuizzes.$.score': percentage,
              'completedQuizzes.$.passed': passed,
              'completedQuizzes.$.completedAt': new Date(),
              lastAccessDate: new Date()
            }
          }
        );

        // If the quiz wasn't found in the array (no documents modified), add it
        const updateResult = await UserCourse.updateOne(
          {
            _id: userCourse._id,
            'completedQuizzes.quizId': { $ne: quizId }
          },
          {
            $push: {
              completedQuizzes: {
                quizId: quizId,
                score: percentage,
                passed: passed,
                completedAt: new Date()
              }
            },
            $set: { lastAccessDate: new Date() }
          }
        );

        console.log(`Updated UserCourse record for user ${req.user.id} with quiz ${quizId} completion`);
      } else {
        console.log(`No UserCourse record found for user ${req.user.id} and course ${quiz.courseId}`);
      }
    } catch (userCourseError) {
      console.error('Error updating UserCourse with quiz completion:', userCourseError);
      // We don't want to fail the whole request if this part fails
    }
    
    res.status(201).json({
      success: true,
      data: {
        score,
        maxScore,
        percentage,
        passed,
        attemptId: userQuiz._id
      }
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting quiz attempt'
    });
  }
};

// @desc    Get user's quiz attempts for a course
// @route   GET /api/courses/:courseId/quiz-attempts
// @access  Private
export const getUserQuizAttemptsByCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { courseId } = req.params;
    
    // Get user's quiz attempts for the course
    const attempts = await UserQuiz.find({
      user: req.user.id,
      course: courseId
    }).populate('quiz', 'title description');
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quiz attempts'
    });
  }
};

// @desc    Get a specific quiz attempt
// @route   GET /api/quiz-attempts/:id
// @access  Private
export const getQuizAttemptById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const attempt = await UserQuiz.findById(req.params.id)
      .populate('quiz', 'title description questions')
      .populate('course', 'title');
    
    if (!attempt) {
      res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
      return;
    }
    
    // Check if the attempt belongs to the user or if the user is an admin
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this quiz attempt'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Error getting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quiz attempt'
    });
  }
};

// @desc    Get user's quiz attempts for a specific quiz
// @route   GET /api/quizzes/:id/attempts
// @access  Private
export const getUserQuizAttemptsByQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists before accessing its properties
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { id: quizId } = req.params;
    
    // Get user's quiz attempts for the quiz
    const attempts = await UserQuiz.find({
      user: req.user.id,
      quiz: quizId
    }).populate('quiz', 'title description');
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error getting quiz attempts by quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quiz attempts'
    });
  }
};

// @desc    Get user's quiz attempts for a specific course
// @route   GET /api/quizzes/attempts/course/:courseId
// @access  Private
export const getUserQuizAttemptsByCourseId = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if req.user exists
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all quizzes for the course
    const quizzes = await Quiz.find({ courseId });
    
    if (!quizzes.length) {
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
      return;
    }

    // Get quiz IDs
    const quizIds = quizzes.map(quiz => quiz._id);

    // Find all user's attempts for these quizzes
    const attempts = await UserQuiz.find({
      user: userId,
      quiz: { $in: quizIds }
    }).populate('quiz', 'title');

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error getting user quiz attempts by course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving quiz attempts'
    });
  }
};