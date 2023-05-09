import { AppStore, LR0Store, RFSelector } from "../../state";
import Grammar from "../Grammar/Grammar";
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
import { RFProOptions } from "../../types";

export default function LR0() {
  const grammar = AppStore((state) => state.grammar);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addEdge,
    resetStore,
  } = LR0Store(RFSelector, shallow);

  AppStore.subscribe(
    (state) => state.grammar,
    () => {resetStore()}
  )
  
  let edgesLeft = false;
  if (grammar !== null) {
    if (grammar.lr0Graph === null) {
      grammar.getLR0();
      
    }
    if (nodes.length === 0) {
      let LR0Graph = grammar.lr0Graph as LR0Graph;
      if (LR0Graph.unAddedNodes.length > 0) {
        let newNode = LR0Graph.unAddedNodes.shift();
        if (newNode) {
          addNode(newNode);
        }
      }
    }
    edgesLeft = grammar.lr0Graph!.unAddedEdges.length > 0;
  }

  function handleAdd() {
    if (grammar !== null && grammar.lr0Graph !== null) {
      if (grammar.lr0Graph.unAddedEdges.length < 1) {
        return;
      }
      let newEdge = grammar.lr0Graph.unAddedEdges.shift() as Edge;
      const newNodes: ItemSetNodeType[] = [];

      // check if source node already exists
      let sourceNode = nodes.find((node) => node.id === newEdge.source);
      if (!sourceNode) {
        let newNode = grammar.lr0Graph.removeNode(newEdge.source);
        if (newNode) {
          newNodes.push(newNode);
        }
      }

      // check if target node already exists
      if (nodes.findIndex((node) => node.id === newEdge.target) === -1) {
        let newNode = grammar.lr0Graph.removeNode(newEdge.target);
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
      <div className="flex-1 max-h-[calc(100vh-56px)] overflow-y-auto">
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            proOptions={RFProOptions}
          >
            {edgesLeft ? (
              <RFAddButton onClick={handleAdd} />
            ) : null}
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
