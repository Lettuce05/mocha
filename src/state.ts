import { create, StateCreator } from "zustand";
import { pages, GRAMMAR_INPUT, Direction } from "./types";
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
  setImportGrammar: (input: GRAMMAR_INPUT[]) => void;
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
  setImportGrammar: (input) => set({ grammarInput: input, grammar: null})
})));

export const RFHeights = ["h-0","h-1/6", "h-2/6", "h-3/6", "h-4/6", "h-5/6", "h-full"];

interface RFTableHeightState {
  tableHeight: string;
  rfHeight: string;
  adjustHeight: (direction: string) => void;
}

export const RFTableStore = create<RFTableHeightState>((set, get)=> ({
  tableHeight: RFHeights[2],
  rfHeight: RFHeights[4],
  adjustHeight: (direction) => {
    // default to Direction.DOWN
    let heightChange = -1;
    if (direction === Direction.UP){
      heightChange = 1;
    }
    const oldTableHeight = RFHeights.indexOf(get().tableHeight);
    const newTableHeight = Math.max(0, Math.min(oldTableHeight+heightChange ,RFHeights.length-1));
    const newRFHeight = (RFHeights.length-1) - newTableHeight;
    set({tableHeight: RFHeights[newTableHeight], rfHeight: RFHeights[newRFHeight]});
  },
}))

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

export const LALR1Store = create(rfStateCreator);

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

export const RFHeightSelector = ((state: RFTableHeightState) => ({tableHeight: state.tableHeight, rfHeight: state.rfHeight}))