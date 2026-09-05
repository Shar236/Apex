'use client';

import { Toaster as Sonner, toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

/**
 * The single toast surface for the whole app (shadcn/ui uses Sonner for this).
 *
 * It replaces the ~95 `alert()` / `confirm()` calls the admin console used to
 * make, which blocked the main thread, could not be styled, and gave no way to
 * distinguish success from failure at a glance.
 *
 * Use `notify` rather than importing `toast` directly so success/error styling
 * stays consistent, and so a failed mutation can never be reported as success.
 */
export function Toaster() {
  const { isDark } = useTheme();
  return (
    <Sonner
      theme={isDark ? 'dark' : 'light'}
      position="bottom-right"
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl border border-line shadow-lg font-sans',
          title: 'text-[13px] font-bold',
          description: 'text-[12px] text-ink-muted',
        },
      }}
    />
  );
}

export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description, duration: 6000 }),
  info: (message: string, description?: string) => toast(message, { description }),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),

  /**
   * Report an API result honestly: the `{ success, message }` contract the
   * Express API returns decides which toast is shown, so a failed request can
   * never surface a success message.
   */
  result: (
    res: { success?: boolean; message?: unknown } | null | undefined,
    successMessage: string,
    fallbackError = 'Something went wrong. Please try again.'
  ) => {
    if (res?.success) {
      toast.success(successMessage);
      return true;
    }
    toast.error((res?.message as string) || fallbackError, { duration: 6000 });
    return false;
  },
};
