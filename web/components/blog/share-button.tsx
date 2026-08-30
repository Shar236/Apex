'use client';

import { Share2 } from 'lucide-react';

export function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard');
      } catch {
        // clipboard unavailable
      }
    }
  };

  return (
    <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer hover:text-brand-pink transition-colors">
      <Share2 className="w-3.5 h-3.5" /> Share this article
    </button>
  );
}
