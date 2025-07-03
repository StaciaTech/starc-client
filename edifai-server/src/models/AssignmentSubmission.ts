import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the AssignmentSubmission interface
export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  courseId: mongoose.Schema.Types.ObjectId;
  submissionUrl: string;
  submissionDate: Date;
  isLatest: boolean; // Flag to identify the latest submission
  isLateSubmission: boolean; // Flag to identify if submission was after deadline
  feedback?: string; // Optional feedback from admin/instructor
  grade?: number; // Optional grade
  createdAt: Date;
  updatedAt: Date;
}

// Create the AssignmentSubmission schema
const AssignmentSubmissionSchema: Schema<IAssignmentSubmission> = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    submissionUrl: {
      type: String,
      required: [true, 'Submission URL is required'],
      trim: true
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    isLatest: {
      type: Boolean,
      default: true
    },
    isLateSubmission: {
      type: Boolean,
      default: false
    },
    feedback: {
      type: String,
      trim: true
    },
    grade: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true,
    collection: 'assignment_submissions'
  }
);

// Create indexes for improved query performance
AssignmentSubmissionSchema.index({ assignmentId: 1, userId: 1 });
AssignmentSubmissionSchema.index({ courseId: 1 });
AssignmentSubmissionSchema.index({ userId: 1 });
AssignmentSubmissionSchema.index({ submissionDate: -1 });
AssignmentSubmissionSchema.index({ isLatest: 1 });

const AssignmentSubmission: Model<IAssignmentSubmission> = mongoose.model<IAssignmentSubmission>(
  'AssignmentSubmission',
  AssignmentSubmissionSchema
);

export default AssignmentSubmission; 