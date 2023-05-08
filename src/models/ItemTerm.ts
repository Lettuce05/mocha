import { ProductionTerm, TermType } from "./Production";

export type ItemTermType = TermType & {
  isDot?: boolean;
  isArrow?: boolean;
};

export class ItemTerm extends ProductionTerm {
  isDot: boolean;
  isArrow: boolean;

  constructor(lexeme: string, itemTermType: ItemTermType) {
    super(lexeme, itemTermType);
    this.isArrow = itemTermType.isArrow ?? false;
    this.isDot = itemTermType.isDot ?? false;
  }
}
