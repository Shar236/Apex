/** Accessible, horizontally scrollable comparison table. First cell of each row is treated as a row header. */
export function ComparisonTable({ caption, columns = [], rows = [] }: { caption?: string; columns?: string[]; rows?: Array<Array<string | number>> }) {
  return (
    <div className="ca-table-wrap">
      <table className="ca-table">
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (j === 0 ? (
                <th key={j} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={j}>{cell}</td>
              )))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
