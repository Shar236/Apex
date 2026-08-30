interface ScoreCardItem {
  label: string;
  value: string;
  sub?: string;
}

/** Row of score / stat cards. */
export function ScoreCards({ items = [], columns }: { items?: ScoreCardItem[]; columns?: number }) {
  return (
    <div className="ca-scorecards" style={columns ? ({ '--ca-scorecards-cols': columns } as React.CSSProperties) : undefined}>
      {items.map((it) => (
        <div key={it.label} className="ca-scorecard">
          <span className="ca-scorecard__label">{it.label}</span>
          <span className="ca-scorecard__value">{it.value}</span>
          {it.sub ? <span className="ca-scorecard__sub">{it.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}
