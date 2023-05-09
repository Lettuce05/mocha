import First from "./components/First/First";
import LL from "./components/LL/LL";
import LR0 from "./components/LR0/LR0";
import LR0DFA from "./components/LR0DFA/LR0DFA";
import LR1 from "./components/LR1/LR1";
import SLR from "./components/SLR/SLR";
import LALR1 from "./components/LALR1/LALR1";

export const pages = {
  FIRST: "First, Follow, and Predict Sets",
  LL: "LL(1) Parse Table",
  LR0: "LR(0) Automaton (NFA)",
  LR0DFA: "LR(0) Automaton (DFA)",
  SLR: "SLR(1) Automaton",
  LR1: "LR(1) Automaton",
  LALR: "LALR(1) Automaton",
} as const;

export const pageComponents: Map<string, () => JSX.Element> = new Map([
  [pages.FIRST, First],
  [pages.LL, LL],
  [pages.LR0, LR0],
  [pages.LR0DFA, LR0DFA],
  [pages.SLR, SLR],
  [pages.LR1, LR1],
  [pages.LALR, LALR1]
]);

export type GRAMMAR_INPUT = {
  id: string;
  LH: string;
  RH: string;
};

export const RFProOptions = {
  hideAttribution: true
};

export const Direction = {
  UP: "Up",
  DOWN: "Down"
} as const;