import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config/index.js';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  enrollmentEnabled: boolean;
  assignedCourses: mongoose.Schema.Types.ObjectId[]; // Array of course IDs that user can enroll in
  createdAt: Date;
  updatedAt: Date;
  // Additional profile fields
  location?: string;
  dateOfBirth?: string;
  phone?: string;
  avatar?: string;
  username?: string;
  // Methods
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  getSignedJwtToken: () => string;
}

// Create the user schema
const UserSchema: Schema<IUser> = new mongoose.Schema(
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
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    enrollmentEnabled: {
      type: Boolean,
      default: false
    },
    assignedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    // Additional profile fields
    location: {
      type: String,
      default: ''
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Allow null/undefined values without triggering uniqueness constraint
    }
  },
  {
    timestamps: true,
    collection: 'profile'
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(): string {
  const payload = { id: this._id, role: this.role };
  const options: SignOptions = { expiresIn: config.jwtExpire as any };
  
  return jwt.sign(payload, config.jwtSecret as any, options);
};

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Drop existing indexes to prevent duplicate key errors
mongoose.connection.on('connected', async () => {
  try {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const profileCollection = collections.find(c => c.name === 'profile');
      
      if (profileCollection) {
        try {
          // Try to drop the problematic index if it exists
          await mongoose.connection.db.collection('profile').dropIndex('username_1');
          console.log('Dropped username index to prevent duplicate key errors');
        } catch (indexError) {
          // Index doesn't exist, which is fine
          console.log('No username_1 index found, continuing...');
        }
      }
    }
  } catch (error) {
    console.error('Error handling indexes:', error);
  }
});

const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User; 