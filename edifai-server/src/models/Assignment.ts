import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Assignment interface
export interface IAssignment extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  instructions: string;
  deadline: Date;
  unlockDate: Date; // 7 days before deadline
  order: number; // 1-5 for the 5 assignments
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Assignment schema
const AssignmentSchema: Schema<IAssignment> = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    instructions: {
      type: String,
      required: [true, 'Assignment instructions are required']
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required']
    },
    unlockDate: {
      type: Date,
      required: [true, 'Unlock date is required']
    },
    order: {
      type: Number,
      required: [true, 'Assignment order is required'],
      min: 1,
      max: 5
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'assignments'
  }
);

// Create indexes for improved query performance
AssignmentSchema.index({ courseId: 1 });
AssignmentSchema.index({ order: 1 });
AssignmentSchema.index({ deadline: 1 });
AssignmentSchema.index({ unlockDate: 1 });

const Assignment: Model<IAssignment> = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment; 