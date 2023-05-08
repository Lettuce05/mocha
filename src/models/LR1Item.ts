import { LR0Item } from "./LR0Item";
import { SetUtils } from "./SetUtils";

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

  static hasSameCore(set1: LR1Item[], set2: LR1Item[]){
    const set1Core = set1.filter(item => item.core.isCore()).map(item => item.core.toString());
    const set2Core = set2.filter(item => item.core.isCore()).map(item => item.core.toString());

    return SetUtils.difference(new Set(set1Core), new Set(set2Core)).size === 0;
  }

  static merge(set1: LR1Item[], set2: LR1Item[]){
    const newSet: LR1Item[] = [];
    for (let i = 0; i < set1.length; i++){
      let matchingItem = set2.find(item => item.core.toString() === set1[i].core.toString());
      let matchingItemLookaheads = matchingItem ? matchingItem.lookaheads : new Set();
      newSet.push(new LR1Item(
        LR0Item.fromLR0Item(set1[i].core),
        SetUtils.union(set1[i].lookaheads, matchingItemLookaheads)
      ))
    }

    return newSet;
  }

  static reduceErrorExists(set: LR1Item[]){
    let reduceItems = set.filter(item => item.core.isComplete());
    for (const item of reduceItems){
      if (reduceItems.some(currItem => currItem.core.toString() !== item.core.toString() && SetUtils.intersection(currItem.lookaheads, item.lookaheads).size > 0)){
        return true;
      }
    }
    return false;
  }
}