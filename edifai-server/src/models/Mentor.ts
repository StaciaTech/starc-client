import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the Mentor interface
export interface IMentor extends Document {
  name: string;
  email: string;
  specialization: string;
  bio: string;
  avatar?: string;
  courses: mongoose.Schema.Types.ObjectId[];
  rating: number;
  reviews: {
    user: mongoose.Schema.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the Mentor schema
const MentorSchema: Schema<IMentor> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    specialization: {
      type: String,
      required: [true, 'Please add specialization']
    },
    bio: {
      type: String,
      required: [true, 'Please add bio'],
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    avatar: {
      type: String,
      default: 'default-avatar.jpg'
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
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
    ]
  },
  {
    timestamps: true,
    collection: 'mentors',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Mentor: Model<IMentor> = mongoose.model<IMentor>('Mentor', MentorSchema);

export default Mentor; 