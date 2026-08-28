import { useCallback, useEffect, useRef, useState } from 'react';
import { blogApi } from '../lib/blogApi.js';
import { toDraft, serializeDraft } from './draftModel.js';

const LS_KEY = (id) => `apex.blogdraft.${id || 'new'}`;
const AUTOSAVE_IDLE_MS = 5000;
const AUTOSAVE_CEILING_MS = 60000;

/**
 * Owns the blog editor draft: field updates, dirty tracking, a localStorage
 * mirror for crash recovery, and periodic server autosave (which never creates
 * a revision — see `__autosave` in blogController.updateBlog).
 *
 * Returns everything the shell needs; the shell still owns publish/schedule.
 */
export function useBlogDraft(post, { onServerUpdate, blockAutosave } = {}) {
  const [id, setId] = useState(post?._id || null);
  const [draft, setDraft] = useState(() => toDraft(post));
  const [savedSnapshot, setSavedSnapshot] = useState(() => serializeDraft(toDraft(post)));
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(post?.updatedAt ? new Date(post.updatedAt) : null);
  const [recoverable, setRecoverable] = useState(null); // { at, draft } | null

  const savingLock = useRef(false);
  const idleTimer = useRef(null);
  const ceilingTimer = useRef(null);

  const dirty = serializeDraft(draft) !== savedSnapshot;

  const setField = useCallback((field, value) => setDraft((d) => ({ ...d, [field]: value })), []);
  const setSeoField = useCallback((field, value) => setDraft((d) => ({ ...d, seo: { ...d.seo, [field]: value } })), []);
  const patchDraft = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), []);

  // ── crash-recovery: check localStorage on mount ───────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(post?._id));
      if (!raw) return;
      const saved = JSON.parse(raw);
      const serverAt = post?.updatedAt ? new Date(post.updatedAt).getTime() : 0;
      if (saved?.at && saved.at > serverAt + 1000 && serializeDraft(saved.draft) !== serializeDraft(toDraft(post))) {
        setRecoverable({ at: new Date(saved.at), draft: saved.draft });
      } else {
        localStorage.removeItem(LS_KEY(post?._id));
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── mirror to localStorage whenever the draft changes ─────────────────────
  useEffect(() => {
    if (!dirty) return;
    try {
      localStorage.setItem(LS_KEY(id), JSON.stringify({ at: Date.now(), draft }));
    } catch { /* quota / private mode */ }
  }, [draft, dirty, id]);

  // ── save (shared by manual Save Draft and autosave) ───────────────────────
  const save = useCallback(async ({ autosave = false } = {}) => {
    if (savingLock.current) return null;
    savingLock.current = true;
    setSaveState('saving');
    const sent = draft;
    const sentSerialized = serializeDraft(sent);
    try {
      const payload = { ...sent, ...(autosave ? { __autosave: true } : {}) };
      const res = id ? await blogApi.update(id, payload) : await blogApi.create(payload);
      if (!res.success) { setSaveState('error'); return { error: res.message || 'Save failed' }; }
      const fresh = toDraft(res.data);
      setId(res.data._id);
      setDraft((cur) => {
        // If the user typed during the request, re-apply only their delta on top
        // of the server's (normalized) version; otherwise take the server version.
        if (serializeDraft(cur) === sentSerialized) return fresh;
        return { ...fresh, ...pickEdited(cur, sent) };
      });
      // Baseline is the server's normalized version — anything on top is unsaved.
      setSavedSnapshot(serializeDraft(fresh));
      setLastSavedAt(new Date());
      setSaveState('saved');
      try { localStorage.removeItem(LS_KEY(res.data._id)); localStorage.removeItem(LS_KEY(null)); } catch { /* */ }
      onServerUpdate?.(res.data);
      return { data: res.data };
    } finally {
      savingLock.current = false;
    }
  }, [draft, id, onServerUpdate]);

  // ── periodic autosave ────────────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(idleTimer.current);
    if (!id || !dirty || blockAutosave) return undefined;
    idleTimer.current = setTimeout(() => { save({ autosave: true }); }, AUTOSAVE_IDLE_MS);
    if (!ceilingTimer.current) {
      ceilingTimer.current = setTimeout(() => {
        ceilingTimer.current = null;
        if (dirty && !blockAutosave) save({ autosave: true });
      }, AUTOSAVE_CEILING_MS);
    }
    return () => clearTimeout(idleTimer.current);
  }, [draft, dirty, id, blockAutosave, save]);

  useEffect(() => { if (!dirty && ceilingTimer.current) { clearTimeout(ceilingTimer.current); ceilingTimer.current = null; } }, [dirty]);

  // ── warn on unload while dirty ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const applyServerData = useCallback((data) => {
    const fresh = toDraft(data);
    setDraft(fresh);
    setSavedSnapshot(serializeDraft(fresh));
    setId(data._id);
    setLastSavedAt(data.updatedAt ? new Date(data.updatedAt) : new Date());
    setSaveState('saved');
  }, []);

  const restoreRecoverable = useCallback(() => {
    if (recoverable) { setDraft({ ...toDraft(post), ...recoverable.draft }); setRecoverable(null); }
  }, [recoverable, post]);

  const discardRecoverable = useCallback(() => {
    setRecoverable(null);
    try { localStorage.removeItem(LS_KEY(post?._id)); } catch { /* */ }
  }, [post]);

  return {
    id, draft, dirty, saveState, lastSavedAt, recoverable,
    setField, setSeoField, patchDraft, setDraft,
    save, applyServerData, restoreRecoverable, discardRecoverable,
  };
}

// Fields the user changed relative to the request we just sent (so a slow save
// doesn't clobber fresh typing).
function pickEdited(current, sent) {
  const out = {};
  for (const k of Object.keys(current)) {
    if (JSON.stringify(current[k]) !== JSON.stringify(sent[k])) out[k] = current[k];
  }
  return out;
}
