import mongoose from 'mongoose';

const searchPerformanceCacheSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, trim: true, default: 'site', index: true }, // 'site' or a page path
    period: { type: String, required: true, enum: ['7d', '28d', '90d'], index: true },
    dimension: { type: String, required: true, enum: ['query', 'page', 'country', 'device', 'date', 'totals'], index: true },
    rows: { type: mongoose.Schema.Types.Mixed, default: [] },
    totals: {
      clicks: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
    },
    previousTotals: {
      clicks: { type: Number, default: 0 },
      impressions: { type: Number, default: 0 },
      ctr: { type: Number, default: 0 },
      position: { type: Number, default: 0 },
    },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

searchPerformanceCacheSchema.index({ scope: 1, period: 1, dimension: 1 }, { unique: true });

export const SearchPerformanceCache = mongoose.model('SearchPerformanceCache', searchPerformanceCacheSchema);
