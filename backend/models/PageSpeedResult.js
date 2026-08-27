import mongoose from 'mongoose';

const pageSpeedResultSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, index: true },
    strategy: { type: String, required: true, enum: ['mobile', 'desktop'], index: true },
    scores: {
      performance: { type: Number, default: 0 },
      accessibility: { type: Number, default: 0 },
      bestPractices: { type: Number, default: 0 },
      seo: { type: Number, default: 0 },
    },
    vitals: {
      lcp: { type: String, default: '' },
      inp: { type: String, default: '' },
      cls: { type: String, default: '' },
    },
    audits: [
      {
        id: String,
        title: String,
        description: String,
        priority: { type: String, enum: ['high', 'medium', 'low'] },
        savings: String,
      },
    ],
    testedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

pageSpeedResultSchema.index({ url: 1, strategy: 1, testedAt: -1 });

export const PageSpeedResult = mongoose.model('PageSpeedResult', pageSpeedResultSchema);
