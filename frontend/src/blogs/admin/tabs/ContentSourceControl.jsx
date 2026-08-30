import React from 'react';
import { PenSquare, Code2 } from 'lucide-react';
import { Label, Select } from '../ui.jsx';
import { listCodeArticles } from '../../registry.js';

export default function ContentSourceControl({ draft, setField }) {
  const codeArticles = listCodeArticles();
  const source = draft.contentSource === 'code' ? 'code' : 'cms';
  const registered = codeArticles.find((a) => a.slug === draft.slug) || null;

  return (
    <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0E0E0E] p-4 space-y-3">
      <div>
        <Label>Content Source</Label>
        <div className="inline-flex rounded-xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden">
          <button
            type="button"
            onClick={() => setField('contentSource', 'cms')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer transition ${source === 'cms' ? 'bg-brand-pink text-white' : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300'}`}
          >
            <PenSquare className="w-3.5 h-3.5" /> CMS
          </button>
          <button
            type="button"
            onClick={() => setField('contentSource', 'code')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer transition ${source === 'code' ? 'bg-brand-pink text-white' : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300'}`}
          >
            <Code2 className="w-3.5 h-3.5" /> Code
          </button>
        </div>
        <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-2">
          {source === 'code'
            ? 'The article body is rendered by a registered React component. All metadata, SEO, schema, FAQ, related posts, sitemap and publishing stay CMS-managed. The URL never changes when you switch.'
            : 'The article body is rendered from the CMS content editor below (current behaviour).'}
        </p>
      </div>

      {source === 'code' && (
        codeArticles.length === 0 ? (
          <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
            No code articles are registered yet. Add the slug + component to
            frontend/src/blogs/registry.js, then reload.
          </p>
        ) : (
          <>
            <Select
              label="Code Article"
              value={registered ? registered.slug : ''}
              onChange={(slug) => { if (slug) setField('slug', slug); }}
              options={[
                { value: '', label: '— Select a registered component —' },
                ...codeArticles.map((a) => ({ value: a.slug, label: `${a.label}  (${a.slug})` })),
              ]}
            />
            {registered ? (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Slug matches registered component “{registered.label}”. It will render at /blog/{draft.slug}.
              </p>
            ) : (
              <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                ⚠ This slug has no registered component. Until one is added, /blog/{draft.slug || '…'} falls
                back to the CMS content below.
              </p>
            )}
          </>
        )
      )}
    </div>
  );
}
