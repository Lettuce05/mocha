import Grammar from "./Grammar";

export type Production = ProductionTerm[];

export function getProduction(stringTerms: string[]) {
  const terms = [];
  for (const term of stringTerms) {
    let currentTerm = term.trim();
    if (Grammar.isTerminal(currentTerm)) {
      terms.push(new ProductionTerm(currentTerm, { isTerminal: true }));
    } else if (Grammar.isNonTerminal(currentTerm)) {
      terms.push(new ProductionTerm(currentTerm, { isNonTerminal: true }));
    } else if (currentTerm === Grammar.EPSILON) {
      terms.push(new ProductionTerm(Grammar.EPSILON, { isEpsilon: true }));
    }
  }

  return terms;
}

export function indexOfProductionTerm(term: String, production: Production) {
  let index = -1;
  for (let i = 0; i < production.length; i++) {
    if (production[i].lexeme === term) {
      index = i;
    }
  }

  return index;
}

export function productionToString(lh: string, rh: Production) {
  let rhLexemes = rh.map((term) => term.lexeme);
  return `${lh} ${Grammar.PRODUCTION_ARROW} ${rhLexemes.join(" ")}`;
}

export function rhsToString(rh: Production) {
  let rhLexemes = rh.map((term) => term.lexeme);
  return rhLexemes.join(" ");
}

export type TermType = {
  isNonTerminal?: boolean;
  isTerminal?: boolean;
  isEpsilon?: boolean;
};

export class ProductionTerm {
  lexeme: string;
  isNonTerminal: boolean;
  isTerminal: boolean;
  isEpsilon: boolean;

  constructor(lexeme: string, termType: TermType) {
    this.lexeme = lexeme;
    this.isNonTerminal = termType.isNonTerminal ?? false;
    this.isTerminal = termType.isTerminal ?? false;
    this.isEpsilon = termType.isEpsilon ?? false;
  }
}
