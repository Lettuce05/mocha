import { AppStore } from "../../state";
import Grammar from "../Grammar/Grammar";
import Table from "../Table/Table";

export default function LL() {
  const grammar = AppStore((state) => state.grammar);
  let tableData = null;
  let tableHeaders = null;
  if (grammar !== null) {
    tableData = grammar.getLL1Table();
    tableHeaders = tableData.shift();
  }
  return (
    <div className="flex flex-1 max-h-[calc(100vh-56px)] overflow-hidden">
      <Grammar />
      <div className="flex-1 max-h-[calc(100vh-56px)] overflow-hidden">
        <div className="w-full h-full">
          {grammar && tableData ? (
            <Table headers={tableHeaders} rows={tableData} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
