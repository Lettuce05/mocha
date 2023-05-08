import { Edge } from "reactflow";
import { ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import Grammar from "./Grammar";
import { DataEdge, LR1Graph } from "./LR1Graph";
import { LR1Item, LR1ItemSet } from "./LR1Item";

export class LALR1Graph extends LR1Graph {
  constructor (grammar: Grammar){
    super(grammar);

    this.computeGraph();
  }

  resetGraph(nodes: ItemSetNodeType, edges: Edge, dataNodes: LR1Item[][], dataEdges: DataEdge[]){
    this.nodes = [...nodes];
    this.edges = [...edges];
    this.dataNodes = [...dataNodes];
    this.dataEdges = [...dataEdges];
  }

  computeGraph() {
    const markedForDelete = this.nodes.map(() => false);

    // merge graph while there are states that can be merged
    while (this.conflictFreeMergeExists(markedForDelete)){}

    console.log('Nodes after: ', this.dataNodes);
    console.log('Edges after: ',this.dataEdges);
    console.log('Nodes Deleted: ',markedForDelete)
  }

  conflictFreeMergeExists(deleted: boolean[]){
    
    for (let i = 0; i < this.dataNodes.length; i++){
      
      if (deleted[i]){ continue; }

      for (let j = 0; j < this.dataNodes.length; j++){

        // console.log(this.dataNodes[i], this.dataNodes[j]);
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