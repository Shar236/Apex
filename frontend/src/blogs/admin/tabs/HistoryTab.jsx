import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { blogApi } from '../../lib/blogApi.js';
import { Empty } from '../ui.jsx';

export default function HistoryTab({ id, onRestored }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    blogApi.revisions(id).then((res) => { if (res.success) setRevisions(res.data || []); setLoading(false); });
  }, [id]);

  const restore = async (rev) => {
    if (!confirm(`Restore the version from ${new Date(rev.createdAt).toLocaleString()}? Your current unsaved changes in other tabs will be replaced once you Save.`)) return;
    const res = await blogApi.restoreRevision(id, rev._id);
    if (res.success) { onRestored(res.data); alert('✅ Revision restored into the editor — review and Save/Publish to confirm.'); }
    else alert(res.message);
  };

  if (!id) return <Empty title="Save this post first" desc="Revision history is available after the first save." />;
  if (loading) return <div className="text-xs font-bold text-neutral-400 animate-pulse py-6 text-center">Loading revisions…</div>;
  if (revisions.length === 0) return <Empty title="No revisions yet" desc="A revision is recorded every time you save changes to this post (autosaves are not recorded)." />;

  return (
    <div className="space-y-2">
      {revisions.map((rev) => (
        <div key={rev._id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <div className="min-w-0">
            <div className="text-xs font-black text-neutral-900 dark:text-white">{new Date(rev.createdAt).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-neutral-400 line-clamp-1">{rev.editedByEmail || 'system'} — {rev.changeSummary}</div>
          </div>
          <button onClick={() => restore(rev)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[10px] font-black cursor-pointer"><RotateCcw className="w-3 h-3" /> Restore</button>
        </div>
      ))}
    </div>
  );
}
