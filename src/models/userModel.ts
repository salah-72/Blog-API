import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  _id: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
  socialLinks: {
    website?: string;
    facebook?: string;
    instagtam?: string;
    linkedIn?: string;
    x?: string;
    youtube?: string;
  };
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'please provide your username'],
      unique: [true, 'user name must be unique'],
      maxLength: [20, 'user name must be less than 20 char'],
    },
    email: {
      type: String,
      required: [true, 'please provide your email'],
      unique: [true, 'email must be unique'],
      maxLength: [50, 'email must be less than 50 char'],
      validate: [validator.isEmail, 'please write a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'you can be only admin or user',
      },
      default: 'user',
      required: [true, 'user role is required'],
    },
    firstName: {
      type: String,
      maxLength: 20,
    },

    lastName: {
      type: String,
      maxLength: 20,
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [50, 'website url musr be less than 50 char'],
      },
      facebook: {
        type: String,
        maxLength: [50, 'facebook profile url musr be less than 50 char'],
      },
      instagram: {
        type: String,
        maxLength: [50, 'instagram profile url musr be less than 50 char'],
      },
      linkedIn: {
        type: String,
        maxLength: [50, 'linkedIn profile url musr be less than 50 char'],
      },
      x: {
        type: String,
        maxLength: [50, 'x profile url musr be less than 50 char'],
      },
      youtube: {
        type: String,
        maxLength: [50, 'youtube channel url musr be less than 50 char'],
      },
    },
  },
  {
    timestamps: true,
  },
);
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
