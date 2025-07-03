import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the UserCourse interface
export interface IUserCourse extends Document {
  user: mongoose.Schema.Types.ObjectId;
  course: mongoose.Schema.Types.ObjectId;
  progress: number;
  completed: boolean;
  startDate: Date;
  lastAccessDate: Date;
  completionDate?: Date;
  currentLesson?: number;
  notes?: string;
  completedSections?: string[]; // Array of section IDs that are completed
  completedQuizzes?: {
    quizId: mongoose.Schema.Types.ObjectId;
    score: number;
    passed: boolean;
    completedAt: Date;
  }[]; // Array of completed quizzes with scores
}

// Create the UserCourse schema
const UserCourseSchema: Schema<IUserCourse> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    lastAccessDate: {
      type: Date,
      default: Date.now
    },
    completionDate: {
      type: Date
    },
    currentLesson: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    },
    completedSections: {
      type: [String],
      default: []
    },
    completedQuizzes: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Quiz',
          required: true
        },
        score: {
          type: Number,
          required: true
        },
        passed: {
          type: Boolean,
          required: true
        },
        completedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'user_courses'
  }
);

// Create a compound index on user and course for faster lookups
UserCourseSchema.index({ user: 1, course: 1 }, { unique: true });

const UserCourse: Model<IUserCourse> = mongoose.model<IUserCourse>('UserCourse', UserCourseSchema);

export default UserCourse; 