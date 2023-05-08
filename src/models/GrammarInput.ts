import { v4 } from "uuid";

export class GrammarInput {
  id: string;
  LH: string;
  RH: string;

  constructor(LH: string, RH: string) {
    this.id = v4();
    this.LH = LH;
    this.RH = RH;
  }
}
