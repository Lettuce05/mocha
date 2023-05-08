import { LR0Item } from "./LR0Item";

export class LR1Item {
  core: LR0Item;
  lookaheads: Set<string>;

  constructor(core?: LR0Item, lookaheads?: Set<string>){
    this.core = core ?? new LR0Item();
    this.lookaheads = lookaheads ?? new Set();
  }

  nextItem(){
    return new LR1Item(this.core.newItem(), new Set(this.lookaheads))
  }

  toString(){
    return `[${this.core.toString()}, { ${Array.from(this.lookaheads).join(', ')} }]`
  }
}

export class LR1ItemSet {
  static toString(set: LR1Item[]){
    return set.reduce(
      (setString: string, currentValue: LR1Item) => setString + currentValue.toString(),
      ''
      );
  }
  static has(items: LR1Item[], a: LR1Item){
    let itemSet = new Set(items.map(item => item.core.toString()));
    return itemSet.has(a.core.toString());
  }
  static contains(sets: LR1Item[][], set: LR1Item[]){
    const itemSets = new Set(sets.map(set => LR1ItemSet.toString(set)));
    return itemSets.has(LR1ItemSet.toString(set));
  }

  static merge(set1: LR1Item[], set2: LR1Item[])
}