import mongoose from 'mongoose';

const redirectSchema = new mongoose.Schema(
  {
    sourcePath: {
      type: String,
      required: [true, 'Source path is required'],
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    targetPath: {
      type: String,
      required: [true, 'Target path is required'],
      trim: true,
    },
    type: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
    entityType: {
      type: String,
      enum: ['product', 'page', 'blog', 'custom', 'auto'],
      default: 'custom',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityTypeModel',
    },
    entityTypeModel: {
      type: String,
    },
    hits: {
      type: Number,
      default: 0,
    },
    lastHitAt: {
      type: Date,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

redirectSchema.index({ enabled: 1, sourcePath: 1 });

export const Redirect = mongoose.model('Redirect', redirectSchema);
