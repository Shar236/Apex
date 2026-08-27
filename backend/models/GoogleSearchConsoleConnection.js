import mongoose from 'mongoose';

// Singleton document (one row) — Search Console property configuration is a
// site-wide setting, not something each admin connects separately.
const googleSearchConsoleConnectionSchema = new mongoose.Schema(
  {
    connected: { type: Boolean, default: false },
    propertyUrl: { type: String, trim: true, default: '' },
    availableProperties: [{ type: String, trim: true }],
    encryptedRefreshToken: { type: String, default: '' },
    scopes: [{ type: String, trim: true }],
    connectedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    connectedByEmail: { type: String, default: '' },
    connectedAt: { type: Date, default: null },
    lastSyncAt: { type: Date, default: null },
    syncInProgress: { type: Boolean, default: false },
  },
  { timestamps: true }
);

googleSearchConsoleConnectionSchema.methods.toPublicJSON = function () {
  return {
    connected: this.connected,
    propertyUrl: this.propertyUrl,
    availableProperties: this.availableProperties,
    connectedByEmail: this.connectedByEmail,
    connectedAt: this.connectedAt,
    lastSyncAt: this.lastSyncAt,
    syncInProgress: this.syncInProgress,
  };
};

export const GoogleSearchConsoleConnection = mongoose.model('GoogleSearchConsoleConnection', googleSearchConsoleConnectionSchema);
