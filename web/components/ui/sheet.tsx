'use client';

import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * shadcn/ui Sheet — a Dialog that slides in from an edge. Used for the admin
 * sidebar on mobile and for detail panels that would be cramped in a modal.
 */

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SIDES = {
  left: 'apex-sheet-left inset-y-0 left-0 h-full w-[85vw] max-w-xs border-r',
  right: 'apex-sheet-right inset-y-0 right-0 h-full w-[85vw] max-w-md border-l',
  bottom: 'apex-sheet-bottom inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t',
} as const;

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: keyof typeof SIDES;
    /** Accessible name — required by Radix; rendered visually hidden when `hideTitle`. */
    title: string;
    hideTitle?: boolean;
  }
>(({ className, children, side = 'left', title, hideTitle = true, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="apex-overlay fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 flex flex-col overflow-y-auto border-line bg-surface shadow-2xl',
        SIDES[side],
        className
      )}
      {...props}
    >
      <SheetPrimitive.Title className={hideTitle ? 'sr-only' : 'mb-3 font-heading text-lg font-bold text-ink'}>
        {title}
      </SheetPrimitive.Title>
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-muted transition hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetClose, SheetContent };
