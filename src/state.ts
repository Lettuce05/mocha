import { create, StateCreator } from "zustand";
import { pages, GRAMMAR_INPUT } from "./types";
import { v4 } from "uuid";
import Grammar from "./models/Grammar";
import {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import {
  ItemSetNodeType,
} from "./components/ItemSetNode/ItemSetNode";
import { subscribeWithSelector } from "zustand/middleware";

export type RFState = {
  nodes: ItemSetNodeType[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: ItemSetNodeType) => void;
  addEdge: (edge: Edge, nodes?: ItemSetNodeType[]) => void;
  resetStore: () => void;
};

interface AppState {
  page: string;
  grammarInput: GRAMMAR_INPUT[];
  grammar: Grammar | null;
  setGrammarInput: (input: GRAMMAR_INPUT[]) => void;
  setGrammar: (newGrammar: Grammar | null) => void;
  setPage: (newPage: string) => void;
}

export const AppStore = create(subscribeWithSelector<AppState>((set) => ({
  page: pages.FIRST,
  grammarInput: [{ id: v4(), LH: "", RH: "" }],
  grammar: null,
  setGrammarInput: (input) => set({ grammarInput: input }),
  setGrammar: (newGrammar) => set({ grammar: newGrammar }),
  setPage: (newPage) => set({ page: newPage }),
})));

const rfStateCreator: StateCreator<RFState> = (set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  addEdge: (edge, newNodes = []) => {
    set({
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, edge],
    });
  },
  resetStore: () => set({nodes: [], edges: []})
})


export const LR0Store = create(rfStateCreator);

export const LR0DFAStore = create(rfStateCreator);

export const SLRStore = create(rfStateCreator);

export const LR1Store = create(rfStateCreator);

export const RFSelector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addNode: state.addNode,
  addEdge: state.addEdge,
  resetStore: state.resetStore
});