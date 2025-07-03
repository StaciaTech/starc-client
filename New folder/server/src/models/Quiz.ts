import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Quiz interface
export interface IQuiz extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage required to pass
  questions: {
    questionText: string;
    options: {
      optionText: string;
      isCorrect: boolean;
    }[];
    explanation?: string;
    points: number;
  }[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Quiz schema
const QuizSchema: Schema<IQuiz> = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    timeLimit: {
      type: Number,
      required: [true, 'Time limit is required'],
      default: 30 // 30 minutes default
    },
    passingScore: {
      type: Number,
      required: [true, 'Passing score percentage is required'],
      default: 70, // 70% passing score default
      min: 0,
      max: 100
    },
    questions: [
      {
        questionText: {
          type: String,
          required: [true, 'Question text is required']
        },
        options: [
          {
            optionText: {
              type: String,
              required: [true, 'Option text is required']
            },
            isCorrect: {
              type: Boolean,
              required: [true, 'Correct answer flag is required']
            }
          }
        ],
        explanation: {
          type: String
        },
        points: {
          type: Number,
          required: [true, 'Points value is required'],
          default: 1
        }
      }
    ],
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'quizzes'
  }
);

// Create indexes for improved query performance
QuizSchema.index({ courseId: 1 });
QuizSchema.index({ title: 'text', description: 'text' });

const Quiz: Model<IQuiz> = mongoose.model<IQuiz>('Quiz', QuizSchema);

export default Quiz; 