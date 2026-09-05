'use client';

import * as React from 'react';
import { ConfirmDialog } from '@/components/ui/alert-dialog';

/**
 * A promise-based replacement for `window.confirm`.
 *
 * The admin console had ~30 `if (!confirm('…')) return;` guards. Native confirm
 * blocks the main thread, cannot be styled, is unavailable in some embedded
 * webviews, and gives no room to explain consequences. This keeps the call site
 * a single line:
 *
 *     const confirm = useConfirm();
 *     if (!(await confirm({ title: 'Delete this product?' }))) return;
 *
 * Render `<ConfirmHost />` once near the root of the page that uses it.
 */

export interface ConfirmOptions {
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = React.createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<Pending | null>(null);

  const confirm = React.useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...opts, resolve })),
    []
  );

  const settle = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(open) => !open && settle(false)}
        title={pending?.title || ''}
        body={pending?.body ?? null}
        confirmLabel={pending?.confirmLabel || 'Confirm'}
        cancelLabel={pending?.cancelLabel || 'Cancel'}
        tone={pending?.tone || 'danger'}
        onConfirm={() => settle(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used inside <ConfirmProvider> (mounted by the admin console shell)');
  }
  return ctx;
}
