import { Edge } from "reactflow";
import { ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import Grammar from "./Grammar";
import { LR0Graph } from "./LR0Graph";
import { DataEdge, LR1Graph } from "./LR1Graph";
import { LR1Item } from "./LR1Item";

class LALR1Graph extends LR1Graph {
  constructor (grammar: Grammar){
    super(grammar);
  }

  resetGraph(nodes: ItemSetNodeType, edges: Edge, dataNodes: LR1Item[][], dataEdges: DataEdge[]){
    this.nodes = [...nodes];
    this.edges = [...edges];
    this.dataNodes = [...dataNodes];
    this.dataEdges = [...dataEdges];
  }

  computeGraph() {
    while (this.conflictFreeMergeExists()){

    }
  }

  conflictFreeMergeExists(){
    
    return false;
  }
}