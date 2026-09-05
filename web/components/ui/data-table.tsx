'use client';

import * as React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Table + state primitives shared by every admin list.
 *
 * The admin console previously repeated the same table shell, one-line loading
 * placeholder and "no rows" message in each module. These give every list the
 * same four states (loading / error / empty / rows) and the same horizontal
 * scroll behaviour, so a wide table never pushes the page sideways.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-sunken motion-reduce:animate-none', className)} />;
}

export function TableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-3xl border border-line bg-surface shadow-sm', className)}>
      {/* The scroll lives here, never on the page body. */}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn('w-full text-xs', className)}>{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface-sunken text-ink-muted">{children}</thead>;
}

export function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn('px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider', className)}>
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3 align-middle text-ink', className)}>{children}</td>;
}

export function Tr({
  children,
  selected = false,
  className = '',
}: {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <tr className={cn('border-t border-line transition-colors', selected ? 'bg-accent/5' : 'hover:bg-surface-sunken/60', className)}>
      {children}
    </tr>
  );
}

/** Rows of shimmer sized to the real table, so the layout does not jump. */
export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-line">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-3.5">
              <Skeleton className={c === 0 ? 'h-4 w-24' : 'h-4 w-full max-w-32'} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-sunken text-ink-muted">
        {icon || <Inbox className="h-5 w-5" />}
      </span>
      <p className="font-heading text-sm font-bold text-ink">{title}</p>
      {description && <p className="max-w-sm text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center" role="alert">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <AlertCircle className="h-5 w-5" />
      </span>
      <p className="font-heading text-sm font-bold text-ink">Unable to load this data</p>
      <p className="max-w-sm text-xs text-ink-muted">{message || 'The request did not complete. Check your connection and try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-surface transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
