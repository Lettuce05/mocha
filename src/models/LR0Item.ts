import Grammar from "./Grammar";
import { ItemTerm } from "./ItemTerm";
import { Production } from "./Production";

export class LR0Item {
  item: ItemTerm[];

  constructor(item?: ItemTerm[]) {
    this.item = item ?? [];
  }

  toString() {
    let terms = this.item?.slice(2).map((term) => term.lexeme);
    return `${this.item[0].lexeme} ${this.item[1].lexeme} ${terms.join(" ")}`;
  }

  nextTerm() {
    let termIndex = this.item.findIndex((term) => term.isDot);

    if (termIndex === this.item.length - 1 || termIndex === -1) {
      return null;
    }
    return this.item[termIndex + 1];
  }

  nextIsEpsilon() {
    let nextTerm = this.nextTerm();
    if (!nextTerm){
      return false;
    }
    return nextTerm.isEpsilon;
  }

  nextIsNonTerm() {
    let nextTerm = this.nextTerm();
    // item was not found or item is complete
    if (!nextTerm){
      return false;
    }
    return nextTerm.isNonTerminal;
  }

  termsAfterNextTerm(){
    let dotIndex = this.item.findIndex((term) => term.isDot);
    // if the dot was found and there is still items after the next term
    if (dotIndex !== -1 && dotIndex < this.item.length - 2){
      return this.item.slice(dotIndex + 2);
    }
    return [];
  }

  moveDot() {
    let dotIndex = this.item.findIndex((term) => term.isDot);
    // swap the dotIndex with the term after it if dot is not already in last index
    if (dotIndex !== -1 && dotIndex !== this.item.length - 1) {
      let temp = this.item[dotIndex];
      this.item[dotIndex] = this.item[dotIndex + 1];
      this.item[dotIndex + 1] = temp;
    }
  }

  static epsilonNewItem(lh: string, rh: Production) {
    let rhItemTerms = rh.map((term) => {
      const { isEpsilon, isTerminal, isNonTerminal } = term;
      return new ItemTerm(term.lexeme, {
        isEpsilon,
        isTerminal,
        isNonTerminal,
      });
    });
    let newItem = new LR0Item([
      new ItemTerm(lh, { isNonTerminal: true }),
      new ItemTerm(Grammar.PRODUCTION_ARROW, { isArrow: true }),
      new ItemTerm(Grammar.DOT, { isDot: true }),
      ...rhItemTerms,
    ]);

    if (newItem.nextIsEpsilon()){
      newItem.moveDot();
    }
    return newItem;
  }

  newItem() {
    let newItems = this.item.map((term) => {
      const { isEpsilon, isTerminal, isNonTerminal, isArrow, isDot } = term;
      return new ItemTerm(term.lexeme, {
        isEpsilon,
        isTerminal,
        isNonTerminal,
        isArrow,
        isDot,
      });
    });

    let newItem = new LR0Item(newItems);
    newItem.moveDot();
    return newItem;
  }

  static fromLR0Item(lr0: LR0Item) {
    let newItems = lr0.item.map((term) => {
      const { isEpsilon, isTerminal, isNonTerminal, isArrow, isDot } = term;
      return new ItemTerm(term.lexeme, {
        isEpsilon,
        isTerminal,
        isNonTerminal,
        isArrow,
        isDot,
      });
    });

    return new LR0Item(newItems);
  }

  isComplete() {
    // check if dot is in the last index of the terms
    return this.item.findIndex((term) => term.isDot) === this.item.length - 1;
  }

  isCore() {
    let isCore = false;

    // Start Production Items are always core items
    if (this.item[0].lexeme === Grammar.START_NONTERM){
      return true;
    }
    // Epsilon terms are never core items
    if (this.isEpsilonItem()){
      return false;
    }
    if (this.item.length > 3) {
      const thirdItem = this.item.at(2)!;
      isCore = !thirdItem.isDot;
    }
    return isCore;
  }

  isEpsilonItem(){
    return this.item.findIndex(term => term.isEpsilon) > -1;
  }

  static isComplete(item: string) {
    let lastTerm = item.at(-2);
    return lastTerm === Grammar.DOT;
  }

  static reductionItemToProduction(item: string) {
    return item.slice(1, -3);
  }

  static extractLHfromProduction(production: string){
    let lh = production.split(Grammar.PRODUCTION_ARROW)[0];
    return lh.trim();
  }
}
