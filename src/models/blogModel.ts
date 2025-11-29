import { slugGen } from '@/utils/gen_slug';
import mongoose, { Types } from 'mongoose';
import { title } from 'process';

export interface IBlog {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  banner: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: string;
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'blog title is required'],
      maxLength: [180, 'max length of title is 180 char'],
    },
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: [true, 'content must be unique'],
    },
    content: {
      type: String,
      required: [true, 'content is required'],
    },
    banner: {
      publicId: {
        type: String,
        required: [true, 'banner publicId is required'],
      },
      url: {
        type: String,
        required: [true, 'banner url is required'],
      },
      width: {
        type: String,
        required: [true, 'banner width is required'],
      },
      height: {
        type: String,
        required: [true, 'banner height is required'],
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'author is required'],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: ['draft', 'published'],
        message: 'blog can only be drafr or published',
      },
      default: 'draft',
    },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  },
);

typeof slugGen;
blogSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    this.slug = slugGen(this.title);
  }
});

export default mongoose.model<IBlog>('Blog', blogSchema);
