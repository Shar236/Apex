import React from 'react';
import { Field, TextArea, Label } from '../ui.jsx';
import ContentSourceControl from './ContentSourceControl.jsx';
import ArticleEditor from '../../components/editor';

export default function ContentTab({ draft, id, status, setField, fieldRefs, onEditorReady, onRequestImageUpload }) {
  return (
    <div className="space-y-4">
      <Field
        ref={fieldRefs?.title}
        label="Title *"
        value={draft.title}
        onChange={(v) => setField('title', v)}
        placeholder="e.g. Authentic PTE Exam Vouchers Online"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          ref={fieldRefs?.slug}
          label="URL Slug"
          value={draft.slug}
          onChange={(v) => setField('slug', v)}
          placeholder="auto-generated from title if left blank"
          hint={status === 'published' ? 'Changing this on a published post auto-creates a 301 redirect.' : undefined}
        />
        <Field label="Category" value={draft.category} onChange={(v) => setField('category', v)} placeholder="e.g. Exam Guide" />
      </div>
      <TextArea label="Short Excerpt" value={draft.excerpt} onChange={(v) => setField('excerpt', v)} rows={2}
        placeholder="One or two sentences shown on blog cards and used as a meta description fallback." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Author" value={draft.author} onChange={(v) => setField('author', v)} />
        <Field label="Reviewer (optional)" value={draft.reviewer} onChange={(v) => setField('reviewer', v)} hint="For policy-sensitive articles" />
        <Field label="Tags (comma separated)" value={(draft.tags || []).join(', ')}
          onChange={(v) => setField('tags', v.split(',').map((s) => s.trim()).filter(Boolean))} />
      </div>

      <ContentSourceControl draft={draft} setField={setField} />

      <div>
        <Label>{draft.contentSource === 'code' ? 'Article Content (CMS fallback)' : 'Article Content'}</Label>
        {draft.contentSource === 'code' && (
          <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-2">
            This post renders from its registered React component. The content below is kept
            as a safe fallback and becomes live again if you switch Content Source back to CMS.
          </p>
        )}
        <ArticleEditor
          value={draft.content}
          onChange={(html) => setField('content', html)}
          onEditorReady={onEditorReady}
          images={draft.images}
          onImagesChange={(imgs) => setField('images', imgs)}
          onRequestImageUpload={onRequestImageUpload}
          title={draft.title}
          excludeId={id}
        />
      </div>
    </div>
  );
}
