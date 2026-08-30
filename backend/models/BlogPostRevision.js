import mongoose from 'mongoose';

const blogPostRevisionSchema = new mongoose.Schema(
  {
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: true,
      index: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    editedByEmail: {
      type: String,
      default: '',
    },
    changeSummary: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

blogPostRevisionSchema.index({ blogId: 1, createdAt: -1 });

export const BlogPostRevision = mongoose.model('BlogPostRevision', blogPostRevisionSchema);
