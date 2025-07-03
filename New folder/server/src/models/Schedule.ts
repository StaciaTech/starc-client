import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Schedule interface
export interface ISchedule extends Document {
  title: string;
  dueDate: string;
  time: string;
  description: string;
  color: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schedule schema
const ScheduleSchema: Schema<ISchedule> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    dueDate: {
      type: String,
      required: [true, 'Please add a due date']
    },
    time: {
      type: String,
      required: [true, 'Please add a time']
    },
    description: {
      type: String,
      required: false,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    color: {
      type: String,
      required: false,
      default: 'bg-blue-100 border-l-blue-400'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Schedule: Model<ISchedule> = mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule; 