import React from 'react';

/**
 * Accessible, horizontally scrollable comparison table.
 * `columns`: string[]   `rows`: (string | number)[][]   (first cell = row header)
 */
export default function ComparisonTable({ caption, columns = [], rows = [] }) {
  return (
    <div className="ca-table-wrap">
      <table className="ca-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0
                  ? <th key={j} scope="row">{cell}</th>
                  : <td key={j}>{cell}</td>,
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
