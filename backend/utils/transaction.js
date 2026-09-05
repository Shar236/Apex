import mongoose from 'mongoose';

/**
 * Mongo transactions require a replica set / mongos. A standalone `mongod`
 * (common in local dev and on some managed single-node plans) rejects them with
 * `IllegalOperation` / "Transaction numbers are only allowed on a replica set
 * member or mongos".
 *
 * Every write path in this codebase is already individually atomic
 * (`findOneAndUpdate` claims, unique indexes), so the transaction is a
 * nice-to-have grouping — not the thing that makes allocation safe. Without a
 * fallback, however, an unsupported-transaction error surfaces as an ordinary
 * failure: in `fulfillVerifiedOrder` that would push EVERY paid order into
 * manual fulfillment even when inventory is available.
 *
 * `runInTransaction` runs `fn(session)` inside a transaction when the
 * deployment supports one, and transparently re-runs `fn(null)` without a
 * session when it does not. Support is probed once and cached.
 */

let transactionsSupported = null; // null = unknown, true/false once probed

const isUnsupportedTransactionError = (err) => {
  if (!err) return false;
  const message = String(err.message || '');
  return (
    err.code === 20 || // IllegalOperation
    err.codeName === 'IllegalOperation' ||
    /Transaction numbers are only allowed on/i.test(message) ||
    /Transactions are not supported/i.test(message) ||
    /does not support (?:sessions|transactions)/i.test(message) ||
    /replica set member or mongos/i.test(message)
  );
};

/** Test hook / reset after a topology change. */
export const resetTransactionSupportProbe = () => {
  transactionsSupported = null;
};

export const runInTransaction = async (fn) => {
  if (transactionsSupported === false) return fn(null);

  let session;
  try {
    session = await mongoose.startSession();
  } catch (err) {
    if (!isUnsupportedTransactionError(err)) throw err;
    transactionsSupported = false;
    console.warn('[db] sessions unavailable — running without a transaction');
    return fn(null);
  }

  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    transactionsSupported = true;
    return result;
  } catch (err) {
    if (isUnsupportedTransactionError(err)) {
      transactionsSupported = false;
      console.warn(`[db] transactions unsupported (${err.codeName || err.code || 'n/a'}) — retrying without a transaction`);
      return fn(null);
    }
    throw err;
  } finally {
    await session.endSession().catch(() => {});
  }
};
