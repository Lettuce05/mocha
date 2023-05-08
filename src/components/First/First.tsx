import { AppStore } from "../../state";
import Grammar from "../Grammar/Grammar";
import Table, { TableCellData, TableParams } from "../Table/Table";
import { default as GrammarClass } from "../../models/Grammar";
import { productionToString, rhsToString } from "../../models/Production";

export default function First() {
  const grammar = AppStore((state) => state.grammar);
  const tableHeaders = [
    new TableCellData(["Non-Terminal"], 'z-10'),
    new TableCellData(["FIRST(X)"], 'z-10'),
    new TableCellData(["FOLLOW(X)"], 'z-10'),
  ];
  let tableData = null;
  let predictTables: TableParams[] | null = null;

  function printSet(set: Set<string>) {
    return `{${Array.from(set).sort().join(" , ")}}`;
  }

  if (grammar !== null) {
    let tempData = [];
    // format grammar data into tableData format (nonterminal,FIRST,FOLLOW)
    for (const nonterminal of grammar.nonterminals) {
      tempData.push([
        new TableCellData([nonterminal], `${TableCellData.HEADER_STYLE} sticky left-0`),
        new TableCellData([
          printSet(grammar.firsts.get(nonterminal) ?? new Set()),
        ]),
        new TableCellData([
          printSet(grammar.follows.get(nonterminal) ?? new Set()),
        ]),
      ]);
    }
    tableData = tempData;

    // format grammar predict sets data
    predictTables = [];
    for (const [LH, RHS] of grammar.productions) {
      // get string version of productions for table headers
      let LHProductions = RHS.map(
        (rhs) => new TableCellData([rhsToString(rhs)])
      );
      // set table headers
      let predictHeader = [new TableCellData([LH]), ...LHProductions];
      // get string version of predict sets for each RHS
      let productionData = RHS.map(
        (rhs) =>
          new TableCellData([
            printSet(
              grammar.predicts.get(productionToString(LH, rhs)) ?? new Set()
            ),
          ])
      );
      // create predict table data
      let predictTableData = [
        [
          new TableCellData([
            `PREDICT(${LH} ${GrammarClass.PRODUCTION_ARROW} ${GrammarClass.ALPHA})`,
          ]),
          ...productionData,
        ],
      ];
      // add predict table data and headers as tableData to predictTables
      predictTables.push({ headers: predictHeader, rows: predictTableData });
    }
  }
  return (
    <div className="flex flex-1 max-h-[calc(100vh-56px)] overflow-hidden">
      <Grammar />
      <div className="flex-1 max-h-[calc(100vh-56px)] overflow-y-auto">
        {grammar && (
          <h2 className="font-bold text-2xl">FIRST and FOLLOW Sets</h2>
        )}
        {grammar && tableData ? (
          <div className={`w-full ${tableData.length > 4 ? 'h-[300px]' : null}`}>
            <Table headers={tableHeaders} rows={tableData} />
          </div>
        ) : null}
        {grammar && <h2 className="font-bold text-2xl mt-2">PREDICT Sets</h2>}
        {grammar && predictTables
          ? predictTables.map(({ headers, rows }, index) => (
              <div key={index} className="w-full max-h-[300px]">
                <Table  headers={headers} rows={rows} />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
