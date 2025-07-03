import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the StudyMaterial interface
export interface IStudyMaterial extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  type: 'file' | 'link';
  content: string; // URL for links, file path for files
  fileType?: string; // For files: pdf, doc, etc.
  fileSize?: number; // For files: size in bytes
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create the StudyMaterial schema
const StudyMaterialSchema: Schema<IStudyMaterial> = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    type: {
      type: String,
      enum: ['file', 'link'],
      required: [true, 'Type is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    fileType: {
      type: String
    },
    fileSize: {
      type: Number
    },
    order: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'study_materials'
  }
);

// Create indexes for improved query performance
StudyMaterialSchema.index({ courseId: 1 });
StudyMaterialSchema.index({ title: 'text', description: 'text' });

const StudyMaterial: Model<IStudyMaterial> = mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);

export default StudyMaterial; 