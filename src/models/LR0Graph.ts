import { Edge } from "reactflow";
import { ItemSetEdge, ItemSetNodeClass, ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import { TableCellData } from "../components/Table/Table";
import Grammar from "./Grammar";
import { LR0Item } from "./LR0Item";
import { SetUtils } from "./SetUtils";

export class LR0Graph {
  nodes: ItemSetNodeType[];
  edges: Edge[];
  unAddedNodes: ItemSetNodeType[];
  unAddedEdges: Edge[];

  constructor(nodes: ItemSetNodeType[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
    this.unAddedNodes = [...nodes];
    this.unAddedEdges = [...edges];
  }

  removeNode(id: string) {
    let nodeIndex = this.unAddedNodes.findIndex((node) => node.id === id);
    if (nodeIndex === -1) {
      return null;
    }
    let removedNode = this.unAddedNodes.splice(nodeIndex, 1);
    return removedNode[0];
  }

  // take in an nfa LR0Graph and return a new dfa LR0Graph
  static nfa2dfa(nfa: LR0Graph, alphabet: Set<string>){
    // remove $ from the alphabet if it is included
    alphabet.delete("$");
    const dfaEdges = [];
    const dfaStates: Set<string>[] = [];
    const q0 = this.eClosure(nfa, new Set("0"))
    const Q = [q0];

    while (Q.length > 0){
      // get next value from Q and remove it from Q
      const t = Q.shift()!;

      // add the new state to dfaStates
      dfaStates.push(t);
      for (const term of alphabet){
        const s = this.eClosure(nfa, this.moveNFA(nfa, t, term));
        if (s.size > 0){
          if (!dfaStates.find(state => SetUtils.same(state, s))){
            Q.push(s);
          }
          dfaEdges.push({ source: t, target: s, label: term });
        }
      }
    }

    // convert dfaStates into ItemSetNodeType
    let newNodes = dfaStates.map((dfaState, index) => {
      // get newItems for node
      let items = [];
      for (const state of dfaState){
        let nfaNode = nfa.nodes.find(node => node.id === state);
        if (nfaNode){
          items.push(...nfaNode.data.items);
        }
      }

      return new ItemSetNodeClass({
        id: String(index),
        data: {
          id: String(index),
          items,
        },
        position: {x:50, y:50}
      })
    })

    // convert dfaEdges into Edge
    let newEdges = dfaEdges.map(dfaEdge => {
      return ItemSetEdge({
        source: String(dfaStates.findIndex(state => SetUtils.same(state, dfaEdge.source))),
        target: String(dfaStates.findIndex(state => SetUtils.same(state, dfaEdge.target))),
        label: dfaEdge.label
      })
    })

    return new LR0Graph(newNodes, newEdges);
  }

  static eClosure(graph: LR0Graph , S: Set<string>){
    const C: Set<string> = new Set();
    const Q: Set<string> = new Set(S);

    while (Q.size > 0){
      let p = Q.values().next().value;
      Q.delete(p);
      C.add(p);
      // for every edge whose source is p and label is epsilon
      let edges = graph.edges.filter(edge => edge.source === p && edge.label === Grammar.EPSILON)
      for (const edge of edges){
        // if target node is not in Q or C
        let notInQ = !Q.has(edge.target);
        let notInC = !C.has(edge.target);
        if (notInQ && notInC){
          Q.add(edge.target);
        }
      }
    }
    return C;
  }

  static moveNFA(graph: LR0Graph, S: Set<string>, term: string){
    const C: Set<string> = new Set();
    // for every state in S check if there are edges that reach another state with label term
    for (const p of S){
      // for every edge that has p as a source and term as the label
      let edges = graph.edges.filter(edge => edge.source === p && edge.label === term);
      for (const edge of edges){
        C.add(edge.target);
      }
    }

    return C;
  }

  static getDFATable(dfa: LR0Graph, nonTerm: Set<string>, term: Set<string>){
    
    
    let actionTable = new Array(dfa.nodes.length);
    let termArr = Array.from(term);
    let nontermArr = Array.from(nonTerm);
    // initialize table
    for (let i = 0; i < dfa.nodes.length; i++){
      actionTable[i] = new Array(term.size);
      for (let j = 0; j < term.size; j++){
        actionTable[i][j] = new TableCellData(['error']);
      }
    }

    for (const node of dfa.nodes){
      let nodeItems = [...node.data.items];
      // check if there is a reduction
      const reduceItem = nodeItems.find(item => LR0Item.isComplete(item));
      if (reduceItem){
        const production = LR0Item.reductionItemToProduction(reduceItem);
        actionTable[Number(node.id)] = actionTable[Number(node.id)].map((cell: TableCellData) => {
          if (nodeItems.length > 1){
            return new TableCellData([`reduce ${production}`], "bg-red-200");
          }
          if (production.startsWith(Grammar.START_NONTERM)){
            return new TableCellData(["accept"], "bg-green-200");
          }
          return new TableCellData([`reduce ${production}`]);
        })
      } else { // handle shifts
        let edges = dfa.edges.filter(edge => edge.source === node.id && term.has(edge.label as string));
        for (const edge of edges){
          actionTable[Number(node.id)][termArr.indexOf(edge.label as string)] = new TableCellData([`shift ${edge.target}`])
        }
      }

      // handle GOTO
      let goto = new Array(nonTerm.size)
      for (let i = 0; i < nonTerm.size; i++) {
        goto[i] = new TableCellData([""]);
      }
      const gotoEdges = dfa.edges.filter(edge => edge.source === node.id && nonTerm.has(edge.label as string));
      for  (const edge of gotoEdges){
        goto[nontermArr.indexOf(edge.label as string)] = new TableCellData([edge.target]);
      }

      // append GoTo table to the action table
      actionTable[Number(node.id)] = actionTable[Number(node.id)].concat(goto);
      // add state heading to row
      actionTable[Number(node.id)].unshift(new TableCellData([node.id], `${TableCellData.HEADER_STYLE} sticky left-0`));

     
    }

    // add table headers
    const headingClasses = "z-10";
    const tableHeaders = [new TableCellData([""], headingClasses), ...termArr.map(term => new TableCellData([term], headingClasses)), ...nontermArr.map(term => new TableCellData([term], headingClasses))];
    actionTable.unshift(tableHeaders);

    return actionTable;
  }

  static from(graph: LR0Graph): LR0Graph {
    let newGraph: LR0Graph = JSON.parse(JSON.stringify(
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

    return new LR0Graph(newGraph.nodes, newGraph.edges);
  }
}


