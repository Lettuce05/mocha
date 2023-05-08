import { Edge } from "reactflow";
import { ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import { TableCellData } from "../components/Table/Table";
import Grammar from "./Grammar";
import { LR0Graph } from "./LR0Graph";
import { LR0Item } from "./LR0Item";

export class SLRGraph extends LR0Graph{
  constructor(nodes: ItemSetNodeType[], edges: Edge[]) {
    super(nodes, edges);
  }

  getTable(grammar: Grammar, nonTerm: Set<string>, term: Set<string>) {
    let SLRTable: TableCellData[][] = new Array(this.nodes.length);
    let termArr = Array.from(term);
    let nontermArr = Array.from(nonTerm);
    // initialize table
    for (let i = 0; i < this.nodes.length; i++){
      SLRTable[i] = new Array(term.size + nonTerm.size);
      for (let j = 0; j < term.size + nonTerm.size; j++){
        SLRTable[i][j] = new TableCellData([]);
      }
    }

    for (const node of this.nodes){
      // handle shifts and Goto
      // get all edges that have the current node as source
      let edges = this.edges.filter(edge => edge.source === node.id)
      for (const edge of edges){
        if (term.has(edge.label as string)){
          SLRTable[Number(node.id)][termArr.indexOf(edge.label as string)].data = [`shift ${edge.target}`];
        } else if(nonTerm.has(edge.label as string)){
          SLRTable[Number(node.id)][termArr.length+nontermArr.indexOf(edge.label as string)].data = [edge.target];
        }
      }

      // handle reduce
      let nodeItems = [...node.data.items];
      const reduceItems = nodeItems.filter(item => LR0Item.isComplete(item));
      for (const reduceItem of reduceItems){
        const production = LR0Item.reductionItemToProduction(reduceItem);
        const LHNonTerm = LR0Item.extractLHfromProduction(production);
        const followTerms: string[] = Array.from(grammar.follows.get(LHNonTerm) || new Set());
        // handle start terminal
        if (LHNonTerm === Grammar.START_NONTERM){
          SLRTable[Number(node.id)][termArr.indexOf('$')].data.push(`accept`);
          SLRTable[Number(node.id)][termArr.indexOf('$')].classes = "bg-green-200";
        }
        // only add reduce action for terms in follow set of LH
        for (const followTerm of followTerms){
          SLRTable[Number(node.id)][termArr.indexOf(followTerm)].data.push(`reduce ${production}`);
        }
      }

      // handle errors
      for (let i  = 0; i < term.size; i++){
        let tableCell = SLRTable[Number(node.id)][i];
        if(tableCell.data.length === 0){
          tableCell.data.push('error');
        } else if (tableCell.data.length > 1){
          tableCell.classes = "bg-red-200";
        }
      }

      // add state row header
      SLRTable[Number(node.id)].unshift(new TableCellData([node.id], `${TableCellData.HEADER_STYLE} sticky left-0`));
    }

    // add top table header
    const headingClasses = "z-10";
    const tableHeaders = [new TableCellData([""], headingClasses), ...termArr.map(term => new TableCellData([term], headingClasses)), ...nontermArr.map(term => new TableCellData([term], headingClasses))];
    SLRTable.unshift(tableHeaders);

    return SLRTable;
  }

  static from(graph: LR0Graph | SLRGraph): SLRGraph {
    let newGraph: SLRGraph = JSON.parse(JSON.stringify(
      graph,
      (key, value) => {
        if (value instanceof Map) {
          return Object.fromEntries(value.entries());
        } else if (value instanceof Set) {
          return [...value];
        }

        return value;
      }
    ));

    return new SLRGraph(newGraph.nodes, newGraph.edges);
  }
}