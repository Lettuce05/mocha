import { AppStore, RFSelector, LR1Store } from "../../state";
import Grammar from "../Grammar/Grammar";
import Table from "../Table/Table";
import { ItemSetNodeType, nodeTypes } from "../ItemSetNode/ItemSetNode";
import ReactFlow, {
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { shallow } from "zustand/shallow";
import { LR0Graph } from "../../models/LR0Graph";
import RFAddButton from "../RFAddButton/RFAddButton";

export default function LR1() {
  const grammar = AppStore((state) => state.grammar);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addEdge,
    resetStore
  } = LR1Store(RFSelector, shallow);

  AppStore.subscribe(
    (state) => state.grammar,
    () => {resetStore()}
  )

  let edgesLeft = false;
  let tableData = null;
  let tableHeaders = null;

  if (grammar !== null) {
    // if graph has not been generated then generate it
    if (grammar.lr1Graph === null) {
      grammar.getLR1();
    }
    // if table exists then get table data
    if (grammar.lr1Table !== null) {
      tableData = Array.from(grammar.lr1Table);
      tableHeaders = tableData.shift();
    }
    // if react flow graph is empty add the first node
    if (grammar.lr1Graph !== null){
      if (nodes.length === 0) {
        let LR1Graph = grammar.lr1Graph as LR0Graph;
        if (LR1Graph.unAddedNodes.length > 0) {
          let newNode = LR1Graph.unAddedNodes.shift();
          if (newNode) {
            addNode(newNode);
          }
        }
      }
      // check if there are any edges left to add (controls add button on react flow)
      edgesLeft = grammar.lr1Graph!.unAddedEdges.length > 0;
    }
    
  }

  function handleAdd() {
    if (grammar !== null && grammar.lr1Graph !== null) {
      if (grammar.lr1Graph.unAddedEdges.length < 1) {
        return;
      }
      let newEdge = grammar.lr1Graph.unAddedEdges.shift() as Edge;
      const newNodes: ItemSetNodeType[] = [];

      // check if source node already exists
      let sourceNode = nodes.find((node) => node.id === newEdge.source);
      if (!sourceNode) {
        let newNode = grammar.lr1Graph.removeNode(newEdge.source);
        if (newNode) {
          newNodes.push(newNode);
        }
      }

      // check if target node already exists
      if (nodes.findIndex((node) => node.id === newEdge.target) === -1) {
        let newNode = grammar.lr1Graph.removeNode(newEdge.target);
        if (newNode) {
          // add new node next to source node on graph
          if (sourceNode) {
            newNode.position.x = sourceNode.position.x + 100;
            newNode.position.y = sourceNode.position.y + 100;
          }
          newNodes.push(newNode);
        }
      }

      addEdge(newEdge, newNodes);
    }
  }

  return (
    <div className="flex flex-1 max-h-[calc(100vh-56px)] overflow-hidden">
      <Grammar />
      <div className="flex-1 max-h-[calc(100vh-56px)] overflow-hidden">
        <div className="w-full h-4/6">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
          >
            {edgesLeft ? (
              <Panel position="bottom-right">
                <RFAddButton onClick={handleAdd} />
              </Panel>
            ) : null}
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        <div className="w-full h-2/6">
          {grammar && tableData ? (
            <Table headers={tableHeaders} rows={tableData} />
          ): null}
        </div>
        
      </div>
    </div>
  );
}
