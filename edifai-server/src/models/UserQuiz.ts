import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the UserQuiz interface
export interface IUserQuiz extends Document {
  user: mongoose.Schema.Types.ObjectId;
  quiz: mongoose.Schema.Types.ObjectId;
  course: mongoose.Schema.Types.ObjectId;
  answers: {
    questionIndex: number;
    selectedOptionIndex: number;
    isCorrect: boolean;
  }[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  startedAt: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create the UserQuiz schema
const UserQuizSchema: Schema<IUserQuiz> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz ID is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    answers: [
      {
        questionIndex: {
          type: Number,
          required: [true, 'Question index is required']
        },
        selectedOptionIndex: {
          type: Number,
          required: [true, 'Selected option index is required']
        },
        isCorrect: {
          type: Boolean,
          required: [true, 'Correctness flag is required']
        }
      }
    ],
    score: {
      type: Number,
      required: [true, 'Score is required'],
      default: 0
    },
    maxScore: {
      type: Number,
      required: [true, 'Maximum possible score is required'],
      default: 0
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage score is required'],
      default: 0,
      min: 0,
      max: 100
    },
    passed: {
      type: Boolean,
      required: [true, 'Pass status is required'],
      default: false
    },
    timeTaken: {
      type: Number,
      required: [true, 'Time taken is required'],
      default: 0
    },
    startedAt: {
      type: Date,
      required: [true, 'Start time is required'],
      default: Date.now
    },
    completedAt: {
      type: Date,
      required: [true, 'Completion time is required'],
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'user_quizzes'
  }
);

// Create indexes for improved query performance
UserQuizSchema.index({ user: 1, quiz: 1 });
UserQuizSchema.index({ user: 1, course: 1 });

const UserQuiz: Model<IUserQuiz> = mongoose.model<IUserQuiz>('UserQuiz', UserQuizSchema);

export default UserQuiz; 