import type { ReactNode } from 'react';

/** Highlighted info / tip / warning box for code articles. */
export function ArticleInfoBox({ variant = 'note', title, icon, children }: { variant?: 'note' | 'tip' | 'warning'; title?: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <aside className={`ca-infobox ca-infobox--${variant}`} role="note">
      {title ? (
        <p className="ca-infobox__title">
          {icon ? (
            <span className="ca-infobox__icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {title}
        </p>
      ) : null}
      <div className="ca-infobox__body">{children}</div>
    </aside>
  );
}
