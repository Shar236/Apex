import React from 'react';

/**
 * Row of score / stat cards.
 * `items`: [{ label, value, sub }]
 */
export default function ScoreCards({ items = [], columns }) {
  return (
    <div
      className="ca-scorecards"
      style={columns ? { '--ca-scorecards-cols': columns } : undefined}
    >
      {items.map((it, i) => (
        <div key={i} className="ca-scorecard">
          <span className="ca-scorecard__label">{it.label}</span>
          <span className="ca-scorecard__value">{it.value}</span>
          {it.sub ? <span className="ca-scorecard__sub">{it.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}
