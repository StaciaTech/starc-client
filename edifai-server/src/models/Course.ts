import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Course interface
export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  instructor: mongoose.Schema.Types.ObjectId;
  price: number;
  discount?: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  lessons: {
    title: string;
    content: string;
    duration: number;
    order: number;
    videoUrl?: string;
  }[];
  enrolledUsers: mongoose.Schema.Types.ObjectId[];
  rating: number;
  reviews: {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  completionAnnouncement?: string; // Announcement message for course completion
  isCompleted?: boolean; // Flag to mark if the course is completed/ended
  createdAt: Date;
  updatedAt: Date;
}

// Create the course schema
const CourseSchema: Schema<ICourse> = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    thumbnail: {
      type: String,
      default: 'default-course.jpg'
    },
    duration: {
      type: Number,
      required: [true, 'Please add course duration in minutes']
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please add course price']
    },
    discount: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Please specify course level']
    },
    category: {
      type: String,
      required: [true, 'Please add a category']
    },
    tags: [String],
    lessons: [
      {
        title: {
          type: String,
          required: [true, 'Please add lesson title']
        },
        content: {
          type: String,
          required: [true, 'Please add lesson content']
        },
        duration: {
          type: Number,
          required: [true, 'Please add lesson duration in minutes']
        },
        order: {
          type: Number,
          required: [true, 'Please add lesson order']
        },
        videoUrl: {
          type: String
        }
      }
    ],
    enrolledUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    rating: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        rating: {
          type: Number,
          required: [true, 'Please add a rating between 1 and 5'],
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: [true, 'Please add a review comment']
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],
    completionAnnouncement: {
      type: String,
      maxlength: [1000, 'Completion announcement cannot be more than 1000 characters']
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    collection: 'courses',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for discounted price
CourseSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * ((this.discount || 0) / 100));
});

// Index for improved query performance
CourseSchema.index({ title: 'text', description: 'text', category: 1, level: 1 });

const Course: Model<ICourse> = mongoose.model<ICourse>('Course', CourseSchema);

export default Course; 