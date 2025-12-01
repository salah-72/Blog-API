import mongoose, { Types } from 'mongoose';

export interface ILike {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  blog: Types.ObjectId;
}

const likeSchema = new mongoose.Schema<ILike>(
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
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ILike>('Like', likeSchema);
