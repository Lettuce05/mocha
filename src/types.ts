export const pages = {
  FIRST: "First, Follow, and Predict Sets",
  LL: "LL(1) Parse Table",
  LR0: "LR(0) Automaton (NFA)",
  LR0DFA: "LR(0) Automaton (DFA)",
  SLR: "SLR(1) Automaton",
  LR1: "LR(1) Automaton",
  LALR: "LALR(1) Automaton",
} as const;

export type GRAMMAR_INPUT = {
  id: string;
  LH: string;
  RH: string;
};
