import {
  ItemSetEdge,
  ItemSetNodeClass,
  ItemSetNodeType,
} from "../components/ItemSetNode/ItemSetNode";
import { TableCellData } from "../components/Table/Table";
import { GRAMMAR_INPUT } from "../types";
import { GrammarInput } from "./GrammarInput";
import { ItemTerm } from "./ItemTerm";
import { LALR1Graph } from "./LALR1Graph";
import { LR0Graph } from "./LR0Graph";
import { LR0Item } from "./LR0Item";
import { LR1Graph } from "./LR1Graph";
import {
  getProduction,
  Production,
  productionToString,
  rhsToString,
} from "./Production";
import { SLR1Graph } from "./SLR1Graph";

export default class Grammar {
  static TERMINAL_PATTERN = /^("|“|”).+("|“|”)$/;
  static NONTERMINAL_PATTERN = /^[A-Z]+$/;
  static EPSILON = "\u03B5";
  static PRODUCTION_ARROW = "\u2192";
  static ALPHA = "\u03B1";
  static DOT = "•";
  static START_NONTERM = "S'";
  
  static isProduction(production: string): boolean {
    let productions = production
      .trim()
      .split(" ")
      .filter((term) => term);
    // a production must include at least one NONTERMINAL, TERMINAL, or EPSILON
    if (productions.length < 1) {
      return false;
    }
    // epsilon must be alone in a production
    if (productions.includes(Grammar.EPSILON) && productions.length > 1) {
      return false;
    }
    return productions.every(
      (term) =>
        Grammar.isNonTerminal(term.trim()) ||
        Grammar.isTerminal(term.trim()) ||
        term.trim() === Grammar.EPSILON
    );
  }

  static isTerminal(term: string): boolean {
    return Grammar.TERMINAL_PATTERN.test(term);
  }

  static isNonTerminal(term: string): boolean {
    return Grammar.NONTERMINAL_PATTERN.test(term);
  }

  static validRH(rh: string): boolean {
    return rh
      .trim()
      .split("|")
      .every((production) => Grammar.isProduction(production));
  }

  static validateGrammar(rules: GRAMMAR_INPUT[]): string | Grammar {
    let productions: Map<string, Set<string>> = new Map();
    let usedNonTerminals: Set<string> = new Set();
    let usedTerminals: Set<string> = new Set();
    // iterate through rules
    for (const [index, rule] of rules.entries()) {
      // make sure that LH is not empty
      if (!rule.LH.trim()) {
        return `Rule ${index + 1}: Left Hand Side must not be empty`;
      }
      // make sure that RH is not empty
      if (!rule.RH.trim()) {
        return `Rule ${index + 1}: Right Hand Side must not be empty`;
      }
      // make sure that LH is a NonTerminal
      if (!Grammar.isNonTerminal(rule.LH.trim())) {
        return `Rule ${index + 1}: Left Hand Side must match a [A-Z]+ pattern`;
      }
      let rhProductions = rule.RH.trim().split("|");
      for (const production of rhProductions) {
        // Check each term in production, collect non-terminals and terminals, and give a specific error for empty production and invalid term
        let terms = production
          .trim()
          .split(" ")
          .filter((term) => term);

        if (terms.length < 1) {
          return `Rule ${index + 1}: There must be no empty Right Hand Sides`;
        }

        for (const term of terms) {
          if (Grammar.isNonTerminal(term.trim())) {
            usedNonTerminals.add(term.trim());
          } else if (Grammar.isTerminal(term.trim())) {
            usedTerminals.add(term.trim());
          } else if (term === Grammar.EPSILON && terms.length > 1) {
            return `Rule ${
              index + 1
            }: Epsilon must be by itself if used in a Right Hand Side`;
          } else if (term !== Grammar.EPSILON) {
            return `Rule ${
              index + 1
            }: Right Hand Side '${production}' does not match (Non-Terminal|Terminal)+|Epsilon pattern`;
          }
        }

        // check if the current LH is already in productions
        if (productions.has(rule.LH.trim())) {
          // get the productions for the LH and add the current production to the Set
          let currProductions: Set<string> =
            productions.get(rule.LH.trim()) || new Set();
          currProductions.add(production.trim());
          productions.set(rule.LH.trim(), currProductions);
        } else {
          // create a new entry for the LH with the current production as its initial production
          let newProductions: Set<string> = new Set();
          newProductions.add(production.trim());
          productions.set(rule.LH.trim(), newProductions);
        }
      } // end of for loop iterating over rhProductions
    } // end of for loop iterating over rules

    // Check if Non-Terminal was used but not defined
    const undefinedNonTerminals = new Set(
      [...usedNonTerminals].filter((x) => !productions.has(x))
    );
    if (undefinedNonTerminals.size > 0) {
      return `The following Non-Terminals are used without being defined: ${Array.from(
        undefinedNonTerminals
      ).join(",")}`;
    }
    // Grammar is valid so return a new Grammar object
    return new Grammar(usedTerminals, new Set(productions.keys()), productions);
  } // end of validateGrammar()

  static getTerms(rhs: string): string[] {
    return rhs
      .trim()
      .split(" ")
      .filter((term) => term);
  }

  static fileToGrammarInput(lines: string[]) {
    let grammarInput: GrammarInput[] = new Array();

    for (const line of lines) {
      const indexOfArrow = line.indexOf("->");
      // make sure that arrow exists and that there is a RH
      if (indexOfArrow > -1 && indexOfArrow + 2 < line.length - 1) {
        let lh = line.slice(0, indexOfArrow);
        let rh = line.slice(indexOfArrow + 2);

        grammarInput.push(new GrammarInput(lh.trim(), rh.trim()));
      }
    }

    return grammarInput;
  }

  FIRSTandFOLLOW() {
    let change, result;
    do {
      change = false;
      for (const [LH, RHS] of this.productions) {
        for (const RH of RHS) {
          if (this.isNullable(RH, 0, RH.length) && !this.nullable.get(LH)) {
            this.nullable.set(LH, true);
            change = true;
          }
          for (let i = 0; i < RH.length; i++) {
            if (this.isNullable(RH, 0, i)) {
              if (RH[i].isNonTerminal) {
                let rhFirst = new Set((this.firsts.get(RH[i].lexeme) || new Set<string>()));
                // Remove epsilon if NonTerminal is not last term in RH
                if (i !== RH.length-1){
                  rhFirst.delete(Grammar.EPSILON);
                }
                result = this.addSet(
                  this.firsts.get(LH) ?? new Set(),
                  rhFirst
                );
              } else {
                result = this.addSet(
                  this.firsts.get(LH) ?? new Set(),
                  new Set([RH[i].lexeme])
                );
              }
              change = change || result;
            }

            if (
              this.isNullable(RH, i + 1, RH.length) &&
              RH[i].isNonTerminal &&
              LH !== RH[i].lexeme
            ) {
              result = this.addSet(
                this.follows.get(RH[i].lexeme) ?? new Set(),
                this.follows.get(LH) ?? new Set()
              );
              change = change || result;
            }

            for (let j = i + 1; j < RH.length; j++) {
              if (this.isNullable(RH, i + 1, j) && RH[i].isNonTerminal) {
                if (RH[j].isNonTerminal) {
                  // delete epsilon from set, epsilon does not belong in follow sets
                  let firstWOEpsilon = new Set((this.firsts.get(RH[j].lexeme) || new Set<string>()));
                  firstWOEpsilon.delete(Grammar.EPSILON);
                  result = this.addSet(
                    this.follows.get(RH[i].lexeme) ?? new Set(),
                    firstWOEpsilon
                  );
                } else {
                  result = this.addSet(
                    this.follows.get(RH[i].lexeme) ?? new Set(),
                    new Set([RH[j].lexeme])
                  );
                }
                change = change || result;
              }
            }
          }
        }
      }
    } while (change);
  }

  addSet(s1: Set<string>, s2: Set<string>) {
    let changed = false;
    for (const e of s2) {
      if (!s1.has(e)) {
        s1.add(e);
        changed = true;
      }
    }
    return changed;
  }

  isNullable(production: Production, from: number, to: number) {
    let isnullable = true;
    for (let i = from; i < to; i++) {
      isnullable =
        isnullable &&
        ((production[i].isNonTerminal &&
          (this.nullable.get(production[i].lexeme) ?? false)) ||
          production[i].isEpsilon);
    }
    return isnullable;
  }

  getProductions(productions: Map<string, Set<string>>) {
    let newProductions: Map<string, Production[]> = new Map();
    // for every rhs of every production create a new Production object
    for (const [lhs, rhss] of productions) {
      let newRhss: Production[] = [];
      for (const rhs of rhss) {
        newRhss.push(getProduction(Grammar.getTerms(rhs)));
      }
      newProductions.set(lhs, newRhss);
    }

    return newProductions;
  }

  // Get the first set for a single RHS/production
  getRHSFirst(terms: Production) {
    const rhsFirst: Set<string> = new Set();

    if (terms.length === 1 && terms[0].isEpsilon) {
      this.addSet(rhsFirst, new Set([Grammar.EPSILON]));
    } else {
      if (this.isNullable(terms, 0, terms.length)) {
        this.addSet(rhsFirst, new Set([Grammar.EPSILON]));
      }

      for (let i = 0; i < terms.length; i++) {
        // if the term is a non terminal then get then add its first set without epsilon to rhsFirst
        if (this.isNullable(terms, 0, i)) {
          if (terms[i].isNonTerminal) {
            let firstWOEpsilon = new Set([
              ...(this.firsts.get(terms[i].lexeme) || new Set()),
            ]);
            firstWOEpsilon.delete(Grammar.EPSILON);
            this.addSet(rhsFirst, firstWOEpsilon);
          } else {
            this.addSet(rhsFirst, new Set([terms[i].lexeme]));
          }
        }
      }
    }
    return rhsFirst;
  }

  getPredictSets() {
    // iterate through and get predict set for each production
    for (const [LH, RHS] of this.productions) {
      for (const RH of RHS) {
        let rhPredict: Set<string> = new Set();
        let rhFirst = this.getRHSFirst(RH);
        if (!rhFirst.has(Grammar.EPSILON)) {
          // epsilon is not in rhFirst
          this.addSet(rhPredict, rhFirst);
        } else {
          // epsilon is in rhFirst
          // remove epsilon from rhFirst
          rhFirst.delete(Grammar.EPSILON);
          // rhPredict = rhFirst union FOLLOW(LH)
          this.addSet(
            rhPredict,
            new Set([...rhFirst, ...(this.follows.get(LH) ?? new Set())])
          );
        }

        // set predict set for production (add predict set to grammar predicts)
        this.predicts.set(productionToString(LH, RH), rhPredict);
      }
    }
  }

  grammarToFile(): string {
    let file = "";
    for (const [LH, RHS] of this.productions) {
      let line = `${LH} ->`;
      for (let i = 0; i < RHS.length; i++) {
        if (i === 0) {
          line = `${line} ${rhsToString(RHS[i])}`;
        } else {
          line = `${line} | ${rhsToString(RHS[i])}`;
        }
      }
      line = line + String.fromCharCode(10);
      file = file + line;
    }

    return file;
  }

  getLL1Table() {
    // initiate first dimension of table
    let LL1Table = new Array(this.nonterminals.size);

    // initiate second and third dimension of table
    for (let i = 0; i < this.nonterminals.size; i++) {
      LL1Table[i] = new Array(this.terminals.size);
      for (let j = 0; j < this.terminals.size; j++) {
        LL1Table[i][j] = new Array();
      }
    }

    let termArray = Array.from(this.terminals);
    let nontermArray = Array.from(this.nonterminals);

    // iterate through each production and see which terminals are in its predict set
    for (const [nonterm, productions] of this.productions) {
      let nonTermIndex = nontermArray.indexOf(nonterm);
      for (const production of productions) {
        let productionString = productionToString(nonterm, production);
        let predictSet = this.predicts.get(productionString) || new Set();

        for (let i = 0; i < termArray.length; i++) {
          // if terminal is in the productions predict set then add entry to table
          if (predictSet.has(termArray[i])) {
            LL1Table[nonTermIndex][i].push(productionString);
          }
        }
      }
      // add non terminal table header LL1Table
      LL1Table[nonTermIndex].unshift([nonterm]);
      // add error to any empty cell
      LL1Table[nonTermIndex] = LL1Table[nonTermIndex].map((arr: string[], index: number) => {
        if (arr.length === 0) {
          return new TableCellData(["error"]);
        }
        // Grammar is not LL1 if there are more than one entry so add error styling
        if (arr.length > 1) {
          return new TableCellData(arr, "bg-red-200");
        }
        // give non terminal headers header styles
        if (index === 0){
          return new TableCellData(arr, `${TableCellData.HEADER_STYLE} sticky left-0`)
        }

        return new TableCellData(arr);
      });
    }

    let tableHeaders = [];
    tableHeaders.push(new TableCellData([""], "z-10"));
    for (let i = 0; i < termArray.length; i++) {
      tableHeaders.push(new TableCellData([termArray[i]], "z-10"));
    }

    // add table header row to LL1Table
    LL1Table.unshift(tableHeaders);

    return LL1Table;
  }

  getLR0() {
    let startSymbol = Array.from(this.productions)[0][0];
    let startItem = new LR0Item([
      new ItemTerm(Grammar.START_NONTERM, { isNonTerminal: true }),
      new ItemTerm(Grammar.PRODUCTION_ARROW, { isArrow: true }),
      new ItemTerm(Grammar.DOT, { isDot: true }),
      new ItemTerm(startSymbol, { isNonTerminal: true }),
    ]);
    let state = 0;
    let Nodes: ItemSetNodeType[] = [
      new ItemSetNodeClass({
        id: String(state),
        data: { items: [`[${startItem.toString()}]`], id: String(state) },
        position: { x: 50, y: 50 },
      }),
    ];
    let edges = [];
    let queue = [startItem];
    let nodes: Map<string, number> = new Map();
    nodes.set(startItem.toString(), state);

    while (queue.length > 0) {
      // remove node from queue
      const currentItem = queue.shift() as LR0Item;
      const currentItemString = currentItem.toString();
      const currentState = nodes.get(currentItemString) as number;
      const nextTerm = currentItem.nextTerm() as ItemTerm;
      const currentNode = Nodes.find(
        (node) => node.id === String(currentState)
      ) as ItemSetNodeType;
      // if the next term is a non-term then iterate through all the productions for that non-term
      if (nextTerm.isNonTerminal) {
        // for each production see what the new item is
        let productions = this.productions.get(nextTerm.lexeme) as Production[];
        for (const production of productions) {
          const newItem = LR0Item.epsilonNewItem(nextTerm.lexeme, production);
          
          // if the new item already exists
          if (nodes.has(newItem.toString())) {
            // get the state number of the target item
            let nodeState = nodes.get(newItem.toString());
            // add epsilon edge from current state to the target state
            edges.push(
              ItemSetEdge({
                source: String(currentState),
                target: String(nodeState),
                label: Grammar.EPSILON,
              })
            );
          } else {
            // if the new item does not exist
            // create a node for it and an edge from the current node to the new node
            state++;
            Nodes.push(
              new ItemSetNodeClass({
                id: String(state),
                data: {
                  id: String(state),
                  items: [`[${newItem.toString()}]`],
                },
                position: {
                  x: currentNode.position.x + 50,
                  y: currentNode.position.y + 50,
                },
              })
            );
            nodes.set(newItem.toString(), state);
            edges.push(
              ItemSetEdge({
                source: String(currentState),
                target: String(state),
                label: Grammar.EPSILON,
              })
            );
            // if nextTerm of the new item is not Epsilon
            if (!newItem.isEpsilonItem()) {
              // add new item to the queue
              queue.push(newItem);
            }
          }
        }
        // create node for item if you moved the dot and add edge to new node
        state++;
        let newItem = currentItem.newItem();
        Nodes.push(
          new ItemSetNodeClass({
            id: String(state),
            data: {
              id: String(state),
              items: [`[${newItem.toString()}]`],
            },
            position: {
              x: currentNode.position.x + 50,
              y: currentNode.position.y + 50,
            },
          })
        );
        nodes.set(newItem.toString(), state);
        edges.push(
          ItemSetEdge({
            source: String(currentState),
            target: String(state),
            label: nextTerm.lexeme,
          })
        );
        // if new item is not complete (dot is not at the end of the item)
        if (!newItem.isComplete()) {
          // add new item to the queue
          queue.push(newItem);
        }
      } else if (nextTerm.isTerminal) {
        // create node for item if you moved the dot and add edge to new node
        state++;
        let newItem = currentItem.newItem();
        Nodes.push(
          new ItemSetNodeClass({
            id: String(state),
            data: {
              id: String(state),
              items: [`[${newItem.toString()}]`],
            },
            position: {
              x: currentNode.position.x + 50,
              y: currentNode.position.y + 50,
            },
          })
        );
        nodes.set(newItem.toString(), state);
        edges.push(
          ItemSetEdge({
            source: String(currentState),
            target: String(state),
            label: nextTerm.lexeme,
          })
        );
        // if new item is not complete (dot is not at the end of the item)
        if (!newItem.isComplete()) {
          // add new item to the queue
          queue.push(newItem);
        }
      }
    }

    this.lr0Graph = new LR0Graph(Nodes, edges);
  }

  getLR0DFA() {
    this.lr0DFAGraph = new SLR1Graph(this);
    this.lr0DFATable = this.lr0DFAGraph.getLR0Table();
  }

  getSLR() {
    this.slrGraph = new SLR1Graph(this);
    this.slrTable = this.slrGraph.getTable();
  }

  getLR1() {
    this.lr1Graph = new LR1Graph(this);
    this.lr1Table = this.lr1Graph.getTable();
  }

  getLALR1() {
    this.lalr1Graph = new LALR1Graph(this);
    this.lalr1Table = this.lalr1Graph.getTable();
  }

  terminals: Set<string>;
  nonterminals: Set<string>;
  productions: Map<string, Production[]>;
  firsts: Map<string, Set<string>>;
  follows: Map<string, Set<string>>;
  nullable: Map<string, boolean>;
  predicts: Map<string, Set<string>>;
  lr0Graph: LR0Graph | null = null;
  lr0DFAGraph: SLR1Graph | null = null;
  lr0DFATable: any[] | null = null;
  slrGraph: SLR1Graph | null = null;
  slrTable: any[] | null = null;
  lr1Graph: LR1Graph | null = null;
  lr1Table: any[] | null = null;
  lalr1Graph: LR1Graph | null = null;
  lalr1Table: any[] | null = null;

  constructor(
    terminals: Set<string>,
    nonterminals: Set<string>,
    productions: Map<string, Set<string>>
  ) {
    this.terminals = terminals;
    this.terminals.add("$");
    this.nonterminals = nonterminals;
    this.productions = this.getProductions(productions);
    this.predicts = new Map();
    this.firsts = new Map();
    this.nullable = new Map();
    this.follows = new Map();
    Array.from(nonterminals).forEach((nt, index) => {
      if (index === 0) {
        this.follows.set(nt, new Set(["$"]));
      } else {
        this.follows.set(nt, new Set());
      }
      this.firsts.set(nt, new Set());
      this.nullable.set(nt, false);
    });

    // get first, follow, and predict sets
    this.FIRSTandFOLLOW();
    this.getPredictSets();

  }
}
