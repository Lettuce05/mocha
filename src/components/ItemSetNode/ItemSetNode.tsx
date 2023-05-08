import { Edge, MarkerType, Node, NodeProps, NodeTypes } from "reactflow";
import { Handle, Position } from "reactflow";
import { ProductionTerm } from "../../models/Production";

type NodeData = {
  items: string[];
  id: string;
};

export type ItemSetNodeType = Node<NodeData>;

export default function ItemSetNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="bg-white p-4 rounded-xl relative">
      <Handle
        type="target"
        id="normal"
        position={Position.Top}
        isConnectable={false}
      />
      <Handle
        className="top-1/4"
        type="source"
        id="loop"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        className="top-3/4"
        type="target"
        id="loop"
        position={Position.Right}
        isConnectable={false}
      />
      <Handle
        type="source"
        id="normal"
        position={Position.Bottom}
        isConnectable={false}
      />
      <p className="absolute -top-8 left-0 font-bold text-2xl font-serif italic">
        I<sub className="font-sans not-italic">{data.id}</sub>
      </p>
      {data.items.map((item, index) => (
        <p key={index}>{item}</p>
      ))}
    </div>
  );
}

export class ItemSetNodeClass implements ItemSetNodeType {
  id: string;
  data: NodeData;
  position: { x: number; y: number };
  type?: string;

  constructor({ id, data, position, type }: ItemSetNodeType) {
    this.id = id;
    this.data = data;
    this.position = position;
    this.type = type ?? "itemSetNode";
  }
}

type ItemSetEdgeType = {
  source: string;
  target: string;
  label: string;
};

type LoopingEdge = {
  sourceHandle: string;
  targetHandle: string;
  type?: string;
};

export function ItemSetEdge({ source, target, label }: ItemSetEdgeType): Edge {
  let loopingEdge: LoopingEdge = {
    sourceHandle: "normal",
    targetHandle: "normal",
  };
  if (source === target) {
    loopingEdge.sourceHandle = "loop";
    loopingEdge.targetHandle = "loop";
    loopingEdge.type = "smoothstep";
  }
  return {
    id: `e${source}-${target}`,
    source,
    target,
    ...loopingEdge,
    label,
    labelBgStyle: { fill: "#b1b1b7" },
    labelStyle: { fontSize: "16px" },
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { strokeWidth: "3px", marginLeft: "10px" },
  };
}

export const nodeTypes: NodeTypes = {
  itemSetNode: ItemSetNode,
};
