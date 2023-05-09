import { RFHeights, RFTableStore } from "../../state";
import HeightButton from "../HeightButton/HeightButton";

export default function TableHeightButton() {
  const tableHeight = RFTableStore(state => state.tableHeight);

  if (tableHeight === RFHeights[RFHeights.length-1]){
    return (
      <div className="absolute top-0 left-1/2 right-1/2 z-20">
        <HeightButton />
      </div>
    )
  }

  return null;
}