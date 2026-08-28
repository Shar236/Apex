import React from 'react';
import { FileText, Heading, Link2, ImageIcon, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

const Row = ({ ok, warn, label, value }) => (
  <div className="flex items-center justify-between text-xs">
    <span className="flex items-center gap-1.5 font-bold text-neutral-500 dark:text-neutral-400">
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : warn ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> : <span className="w-3.5 h-3.5" />}
      {label}
    </span>
    <span className="font-black tabular-nums">{value}</span>
  </div>
);

const Card = ({ icon, title, children }) => (
  <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 space-y-2.5">
    <h3 className="font-black text-sm flex items-center gap-1.5">{icon} {title}</h3>
    {children}
  </div>
);

/** Live content / heading / link / image analytics — all from the debounced draft analysis. */
export default function AnalyticsPanels({ analysis, onQuickFix }) {
  if (!analysis) return null;
  const m = analysis.metrics;

  return (
    <>
      <Card icon={<FileText className="w-4 h-4 text-brand-pink" />} title="Content">
        <Row ok={m.wordCount >= 600} warn={m.wordCount < 250} label="Words" value={m.wordCount.toLocaleString()} />
        <Row label="Characters" value={m.charCount.toLocaleString()} />
        <Row label="Reading time" value={`${m.readingTime} min`} />
      </Card>

      <Card icon={<Heading className="w-4 h-4 text-brand-pink" />} title="Heading structure">
        <Row ok={m.h1Count === 1} warn={m.h1Count !== 1} label="H1" value={m.h1Count} />
        <Row ok={m.h2Count > 0} label="H2" value={m.h2Count} />
        <Row label="H3" value={m.h3Count} />
        {m.h1Count === 0 && (
          <button onClick={() => onQuickFix({ key: 'h1' })} className="text-[10px] font-black text-brand-pink cursor-pointer flex items-center gap-1">Add an H1 <ChevronRight className="w-3 h-3" /></button>
        )}
      </Card>

      <Card icon={<Link2 className="w-4 h-4 text-brand-pink" />} title="Links">
        <Row ok={m.internalLinksCount >= 2} warn={m.internalLinksCount < 2} label="Internal" value={m.internalLinksCount} />
        <Row label="External" value={m.externalLinksCount} />
        <button onClick={() => onQuickFix({ key: 'internalLinks' })} className="text-[10px] font-black text-brand-pink cursor-pointer flex items-center gap-1">Manage links <ChevronRight className="w-3 h-3" /></button>
      </Card>

      <Card icon={<ImageIcon className="w-4 h-4 text-brand-pink" />} title="Images">
        <Row label="In article" value={m.imagesCount} />
        <Row ok={m.imagesCount > 0 && m.imagesWithAltCount === m.imagesCount} warn={m.imagesCount > m.imagesWithAltCount} label="With ALT" value={`${m.imagesWithAltCount}/${m.imagesCount}`} />
        {m.imagesCount > m.imagesWithAltCount && (
          <button onClick={() => onQuickFix({ key: 'imageAltCoverage' })} className="text-[10px] font-black text-brand-pink cursor-pointer flex items-center gap-1">Fix ALT text <ChevronRight className="w-3 h-3" /></button>
        )}
      </Card>
    </>
  );
}
