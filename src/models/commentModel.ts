import mongoose, { Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  blog: Types.ObjectId;
  content: string;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'blog is required'],
    },
    content: {
      type: String,
      required: [true, 'conrent is required'],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IComment>('Comment', commentSchema);
