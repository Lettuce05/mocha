export class TableCellData {
  data: string[];
  classes: string;
  static HEADER_STYLE = "border border-slate-400 bg-slate-200";

  constructor(data: string[], classes?: string) {
    this.data = data;
    this.classes = classes || "";
  }
}

function TableData({ data, classes }: TableCellData) {
  return (
    <td
      className={`p-2 whitespace-nowrap border border-slate-400${
        classes ? ` ${classes}` : ""
      }`}
    >
      {data.map((str, index) => (
        <p key={index}>{str}</p>
      ))}
    </td>
  );
}

function TableHeader({ data, classes }: TableCellData) {
  return (
    <th
      className={`p-2 whitespace-nowrap ${TableCellData.HEADER_STYLE} sticky top-0 ${
        classes ? ` ${classes}` : ""
      }`}
    >
      {data.map((str, index) => (
        <p key={index}>{str}</p>
      ))}
    </th>
  );
}

type TableRowParams = {
  row: TableCellData[];
  isHeader?: boolean;
};

function TableRow({ row, isHeader = false }: TableRowParams) {
  return (
    <tr>
      {row.map((cell, index) =>
        isHeader ? (
          <TableHeader key={index} data={cell.data} classes={cell.classes} />
        ) : (
          <TableData key={index} data={cell.data} classes={cell.classes} />
        )
      )}
    </tr>
  );
}

export type TableParams = {
  headers: TableCellData[];
  rows: TableCellData[][];
};

export default function Table({ headers, rows }: TableParams) {
  return (
    <div className="w-full h-full overflow-auto my-2 pb-2.5">
      <table className="border-separate border-spacing-0 border border-slate-300">
        <thead>
          <TableRow row={headers} isHeader={true} />
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <TableRow key={index} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
