import React from 'react';
import { Field, TextArea, Select, Label, CharGuide } from '../ui.jsx';

export default function SeoTab({ draft, setSeoField, slug, fieldRefs }) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://apexvouchers.com';
  const canonical = draft.seo.canonicalUrl || `${siteUrl}/blog/${slug || 'your-post-slug'}`;
  const robotsValue = draft.seo.noindex && draft.seo.nofollow ? 'noindex_nofollow'
    : draft.seo.noindex ? 'noindex_follow'
    : draft.seo.nofollow ? 'index_nofollow'
    : 'index_follow';
  const setRobots = (v) => {
    setSeoField('noindex', v.startsWith('noindex'));
    setSeoField('nofollow', v.endsWith('nofollow'));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Google Search Preview</Label>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <div className="text-[13px] text-[#1a0dab] dark:text-sky-400 font-medium truncate">{draft.seo.title || draft.title || 'SEO Title Preview'}</div>
          <div className="text-[12px] text-emerald-700 dark:text-emerald-500 truncate">{canonical}</div>
          <div className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{draft.seo.description || draft.excerpt || 'Meta description preview…'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field ref={fieldRefs?.keyword} label="Primary Keyword" value={draft.seo.focusKeyword} onChange={(v) => setSeoField('focusKeyword', v)} placeholder="e.g. authentic PTE exam vouchers" />
        <Field label="Secondary Keywords (comma separated)" value={(draft.seo.secondaryKeywords || []).join(', ')} onChange={(v) => setSeoField('secondaryKeywords', v.split(',').map((s) => s.trim()).filter(Boolean))} />
      </div>

      <div>
        <Field ref={fieldRefs?.seoTitle} label="SEO Title" value={draft.seo.title} onChange={(v) => setSeoField('title', v)} placeholder="Shown in search results" />
        <CharGuide value={draft.seo.title} min={30} max={70} />
      </div>
      <div>
        <TextArea ref={fieldRefs?.metaDesc} label="Meta Description" value={draft.seo.description} onChange={(v) => setSeoField('description', v)} rows={2} />
        <CharGuide value={draft.seo.description} min={80} max={160} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field ref={fieldRefs?.canonical} label="Canonical URL" value={draft.seo.canonicalUrl} onChange={(v) => setSeoField('canonicalUrl', v)} placeholder={canonical} hint="Leave blank to auto-use the article URL." />
        <Select ref={fieldRefs?.robots} label="Robots" value={robotsValue} onChange={setRobots} options={[
          { value: 'index_follow', label: 'Index, Follow (default)' },
          { value: 'noindex_follow', label: 'Noindex, Follow' },
          { value: 'index_nofollow', label: 'Index, Nofollow' },
          { value: 'noindex_nofollow', label: 'Noindex, Nofollow' },
        ]} />
      </div>

      <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
        <Label>Open Graph</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="OG Title" value={draft.seo.ogTitle} onChange={(v) => setSeoField('ogTitle', v)} placeholder={draft.seo.title || draft.title} />
          <Field label="OG Image URL" value={draft.seo.ogImage} onChange={(v) => setSeoField('ogImage', v)} placeholder={draft.coverImage || 'Uses featured image if blank'} />
        </div>
        <TextArea label="OG Description" value={draft.seo.ogDescription} onChange={(v) => setSeoField('ogDescription', v)} rows={2} />
      </div>

      <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
        <Label>Twitter / X</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Twitter Title" value={draft.seo.twitterTitle} onChange={(v) => setSeoField('twitterTitle', v)} />
          <Select label="Card Type" value={draft.seo.twitterCardType} onChange={(v) => setSeoField('twitterCardType', v)} options={[
            { value: 'summary_large_image', label: 'Summary Large Image' },
            { value: 'summary', label: 'Summary' },
          ]} />
        </div>
        <TextArea label="Twitter Description" value={draft.seo.twitterDescription} onChange={(v) => setSeoField('twitterDescription', v)} rows={2} />
        <Field label="Twitter Image URL" value={draft.seo.twitterImage} onChange={(v) => setSeoField('twitterImage', v)} placeholder={draft.coverImage || 'Uses featured image if blank'} />
      </div>
    </div>
  );
}
