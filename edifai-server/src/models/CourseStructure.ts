import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Define interfaces for nested documents with _id fields
export interface ISection extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  learningObjectives?: string[];
  keywords?: string[];
  aiGenerated: boolean;
  generatedContent?: string;
  lastGenerated?: Date;
  videoUrl?: string;
}

export interface ISubchapter extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  sections: ISection[];
}

export interface IChapter extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  subchapters: ISubchapter[];
}

// Define the CourseStructure interface
export interface ICourseStructure extends Document {
  course: mongoose.Schema.Types.ObjectId;
  chapters: IChapter[];
  createdAt: Date;
  updatedAt: Date;
}

// Create schemas for nested documents
const SectionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a section title'],
    trim: true,
    maxlength: [100, 'Section title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Section description cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: [true, 'Please add section order']
  },
  learningObjectives: [String],
  keywords: [String],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  generatedContent: {
    type: String
  },
  lastGenerated: {
    type: Date
  },
  videoUrl: {
    type: String,
    trim: true
  }
}, { _id: true });

const SubchapterSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a subchapter title'],
    trim: true,
    maxlength: [100, 'Subchapter title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Subchapter description cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: [true, 'Please add subchapter order']
  },
  sections: [SectionSchema]
}, { _id: true });

const ChapterSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a chapter title'],
    trim: true,
    maxlength: [100, 'Chapter title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Chapter description cannot be more than 500 characters']
  },
  order: {
    type: Number,
    required: [true, 'Please add chapter order']
  },
  subchapters: [SubchapterSchema]
}, { _id: true });

// Create the course structure schema
const CourseStructureSchema: Schema<ICourseStructure> = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    chapters: [ChapterSchema]
  },
  {
    timestamps: true,
    collection: 'course_structures'
  }
);

// Create index for faster querying
CourseStructureSchema.index({ course: 1 });

const CourseStructure: Model<ICourseStructure> = mongoose.model<ICourseStructure>('CourseStructure', CourseStructureSchema);

export default CourseStructure; 