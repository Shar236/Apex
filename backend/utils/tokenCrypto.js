import crypto from 'crypto';
import { config } from '../config/index.js';

const ALGO = 'aes-256-gcm';

// Normalize the configured key (any length/format) to exactly 32 bytes.
const deriveKey = () => crypto.createHash('sha256').update(String(config.google.tokenEncryptionKey || '')).digest();

export const encrypt = (plainText) => {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, deriveKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
};

export const decrypt = (cipherText) => {
  if (!cipherText) return '';
  const [ivB64, authTagB64, dataB64] = String(cipherText).split(':');
  if (!ivB64 || !authTagB64 || !dataB64) return '';
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGO, deriveKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
};
