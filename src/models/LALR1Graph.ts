import { Edge } from "reactflow";
import { ItemSetEdge, ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import Grammar from "./Grammar";
import { LR1Graph } from "./LR1Graph";
import { LR1Item, LR1ItemSet } from "./LR1Item";
import { DataEdge } from "../types";

export class LALR1Graph extends LR1Graph {
  constructor (grammar: Grammar){
    super(grammar);

    this.computeGraph();
  }

  resetGraph(dataNodes: LR1Item[][], dataEdges: DataEdge[]){
    this.dataNodes = [...dataNodes];
    this.dataEdges = [...dataEdges];
    this.nodes = this.dataNodesToRFNodes(dataNodes);
    this.edges = this.dataEdges.map(edge => ItemSetEdge({
      ...edge,
      label: edge.label.lexeme
    }));
    this.unAddedNodes = [...this.nodes];
    this.unAddedEdges = [...this.edges];
  }

  computeGraph() {
    const deleted = this.nodes.map(() => false);

    // merge graph while there are states that can be merged
    while (this.conflictFreeMergeExists(deleted)){}

    // get new nodes and node id changes
    const newDataNodes = [];
    let nodeIdChanges: string[] = new Array(this.dataNodes.length);
    for (let i = 0; i < this.dataNodes.length; i++){
      if (!deleted[i]) {
        nodeIdChanges[i] = String(newDataNodes.length);
        newDataNodes.push(this.dataNodes[i]);
      } else {
        nodeIdChanges[i] = "";
      }
    }

    // update node 
    let newDataEdges = this.dataEdges.map(edge => {
      // update edge source and target to updated node ids
      edge.source = nodeIdChanges[Number(edge.source)];
      edge.target = nodeIdChanges[Number(edge.target)];

      return edge;
    });

    const uniqueEdges = new Set();
    newDataEdges = newDataEdges.filter(edge => {
      const edgeString = `${edge.source} ${edge.target} ${edge.label.lexeme}`;
      if (!uniqueEdges.has(edgeString)){
        uniqueEdges.add(edgeString);
        return true;
      }
      
      return false;
    })

    this.resetGraph(newDataNodes, newDataEdges);

  }

  conflictFreeMergeExists(deleted: boolean[]){
    
    for (let i = 0; i < this.dataNodes.length; i++){
      
      if (deleted[i]){ continue; }

      for (let j = 0; j < this.dataNodes.length; j++){

        if (i === j || deleted[j] || !LR1ItemSet.hasSameCore(this.dataNodes[i], this.dataNodes[j])){ continue; }
          
        // get new merged state
        const mergedState = LR1ItemSet.merge(this.dataNodes[i], this.dataNodes[j]);
        

        // check if there is reduce errors in the merged state
        if (LR1ItemSet.reduceErrorExists(mergedState)){ continue; }

        this.dataNodes[i] = mergedState;
        // delete merged state
        deleted[j] = true;

        // update edges
        this.dataEdges = this.dataEdges.map(edge => {
          if (edge.source === String(j)){
            edge.source = String(i)
          }
          
          if (edge.target === String(j)){
            edge.target = String(i)
          }

          return edge;
        });

        return true;

      }
    }
    return false;
  }
}