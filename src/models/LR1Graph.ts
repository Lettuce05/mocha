import { ItemSetEdge, ItemSetNodeClass, ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import { TableCellData } from "../components/Table/Table";
import Grammar from "./Grammar";
import { ItemTerm } from "./ItemTerm";
import { LR0Graph } from "./LR0Graph";
import { LR0Item } from "./LR0Item";
import { LR1Item, LR1ItemSet } from "./LR1Item";
import { SetUtils } from "./SetUtils";

export type DataEdge = {
  source: string,
  target: string,
  label: ItemTerm
}

export class LR1Graph extends LR0Graph {
  grammar: Grammar;
  dataNodes: LR1Item[][] = [];
  dataEdges: DataEdge[] = [];
  constructor(grammar: Grammar){
    super([], []);
    this.grammar = grammar;
    this.computeDFA();
  }

  closure(I: LR1Item[]){
    // working set
    const W = Array.from(I);
    // closure set
    const J: LR1Item[] = [];

    while (W.length > 0){
      let i = W.shift() as LR1Item;
      J.push(i);
      
      // check if the dot is before a nonterminal (is epsilon closure required)
      let nextTerm = i.core.nextTerm();
      if (nextTerm?.isNonTerminal){
        // add each production with the nonterminal on the left side
        let productions = this.grammar.productions.get(nextTerm.lexeme) || [];
        for(const production of productions){
          let newItem = new LR1Item(LR0Item.epsilonNewItem(nextTerm.lexeme, production))
          // check whether item is already in sets
          if (!LR1ItemSet.has([...W, ...J], newItem)){
            for (const lookahead of i.lookaheads){
              let newlookaheads = this.grammar.getRHSFirst([...i.core.termsAfterNextTerm(), new ItemTerm(lookahead, { isTerminal: true })]);
              newItem.lookaheads = SetUtils.union(newItem.lookaheads, newlookaheads);
            }
            W.push(newItem);
          }
        }
      }
    }
    return J;
  }

  goto(I: LR1Item[], X: ItemTerm){
    // working set
    const W: LR1Item[] = [];
    // add all items with the next term X to a new set
    for (const item of I.filter(item => item.core.nextTerm()?.lexeme === X.lexeme)){
      // get the item with the dot moved over one
      W.push(item.nextItem())
    }
    return this.closure(W);
  }

  computeDFA(){
    const startRH = new ItemTerm(Array.from(this.grammar.productions.keys())[0], {isNonTerminal: true});
    const startItemSet = [new LR1Item(LR0Item.epsilonNewItem(Grammar.START_NONTERM, [startRH]), new Set(["$"]))];
    const startState = this.closure(startItemSet);
    const States: LR1Item[][] = [];
    const Edges = [];
    const W = [startState];

    while(W.length > 0){
      // take state out of working set and put into final states
      const I = W.shift() as LR1Item[];
      States.push(I);
      const nextTerms = new Set(I.map(item => item.core.nextTerm()).filter(term => term));
      for (const nextTerm of nextTerms){
        // get all items with the same nextTerm for the newState
        const newState = I.filter(item => item.core.nextTerm()?.lexeme === nextTerm?.lexeme);
        const J = this.goto(newState, nextTerm!);
        const statesContains = LR1ItemSet.contains(States, J);
        const WContains = LR1ItemSet.contains(W, J);
        if (!statesContains && !WContains){
          W.push(J);
        }
        Edges.push({source: LR1ItemSet.toString(I), target: LR1ItemSet.toString(J), label: nextTerm});
      } 
    }

    // create RF nodes from dataNodes
    this.dataNodes = [...States];
    this.nodes = this.dataNodesToRFNodes(States);
    this.unAddedNodes = [...this.nodes];
    
    // create RF edges
    // create map from ItemSet string to node index
    // will allow for faster dataEdge creation rather than iterating through nodes for each source and target
    let nodeIndexes = new Map(this.dataNodes.map((node, index) => [LR1ItemSet.toString(node), String(index)]));
    this.dataEdges = Edges.map(edge => ({
      source: nodeIndexes.get(edge.source)!,
      target: nodeIndexes.get(edge.target)!,
      label: edge.label!
    }))
    // convert dataEdges into RF edges
    this.edges = this.dataEdges.map(edge => ItemSetEdge({
      ...edge,
      label: edge.label.lexeme
    }))
    this.unAddedEdges = [...this.edges];
  }

  dataNodesToRFNodes(nodes: LR1Item[][]){
    const rfNodes: ItemSetNodeType[] = [];

    for (const node of nodes){
      rfNodes.push(new ItemSetNodeClass({
        id: String(rfNodes.length),
        data: {
          id: String(rfNodes.length),
          items: node.map(item => item.toString()),
        },
        position: {x:50, y:50}
      }))
    }

    return rfNodes;
  }

  getTable() {
    const LR1Table: TableCellData[][] = new Array(this.nodes.length);
    const termArr = Array.from(this.grammar.terminals);
    const nonTermArr = Array.from(this.grammar.nonterminals);
    
    // initialize table
    for (let i = 0; i < this.nodes.length; i++){
      LR1Table[i] = new Array(termArr.length + nonTermArr.length);
      for (let j = 0; j < termArr.length + nonTermArr.length; j++){
        LR1Table[i][j] = new TableCellData([]);
      }
    }

    for (const node of this.nodes){
      // get all edges with the current node as source
      const edges = this.dataEdges.filter(edge => edge.source === node.id);
      for (const edge of edges) {
        if (edge.label.isTerminal){
          // add shift entry
          LR1Table[Number(node.id)][termArr.indexOf(edge.label.lexeme)].data = [`shift ${edge.target}`];
        } else if (edge.label.isNonTerminal){
          // add goto entry
          LR1Table[Number(node.id)][termArr.length+nonTermArr.indexOf(edge.label.lexeme)].data = [edge.target];
        }
      }

      // for each reduce item add a reduce entry for terms in lookahead set
      const reduceItems = this.dataNodes[Number(node.id)].filter(item => item.core.isComplete());
      for (const reduceItem of reduceItems){
        const production = LR0Item.reductionItemToProduction(`[${reduceItem.core.toString()}]`);
        for (const lookahead of reduceItem.lookaheads) {
          if (lookahead === "$" && reduceItem.core.item[0].lexeme === Grammar.START_NONTERM){
            const dollarIndex = termArr.indexOf('$');
            LR1Table[Number(node.id)][dollarIndex].data = ['accept'];
            LR1Table[Number(node.id)][dollarIndex].classes = TableCellData.ACCEPT_STYLE;
          } else {
            LR1Table[Number(node.id)][termArr.indexOf(lookahead)].data.push(`reduce ${production}`);
          }
        }
      }

      // set all empty cells as error entries
      for (let i = 0; i < termArr.length; i++){
        let tableCell = LR1Table[Number(node.id)][i];
        if (tableCell.data.length === 0){
          tableCell.data.push('error');
        } else if (tableCell.data.length > 1){
          tableCell.classes = TableCellData.ERROR_STYLE;
        }
      }

      // add row state header
      LR1Table[Number(node.id)].unshift(new TableCellData([node.id], `${TableCellData.HEADER_STYLE} sticky left-0`));

    }

    
    
    // add table header
    const headingClasses = "z-10";
    const tableHeaders = [new TableCellData([""], headingClasses), ...termArr.map(term => new TableCellData([term], headingClasses)), ...nonTermArr.map(term => new TableCellData([term], headingClasses))]
    LR1Table.unshift(tableHeaders);

    return LR1Table;
  }
  
}

