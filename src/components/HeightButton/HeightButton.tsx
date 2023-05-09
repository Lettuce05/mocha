import { Panel } from "reactflow";
import { RFTableStore } from "../../state";
import { Direction } from "../../types";


export default function HeightButton() {
  const adjustHeight = RFTableStore(state => state.adjustHeight);
  return (
      <div className="flex">
        {/* Down Arrow */}
        <button className="p-1 bg-black hover:bg-blue-500" onClick={() => adjustHeight(Direction.DOWN)}> 
          <div className="w-0 h-0 
            border-l-[8px] border-l-transparent
            border-t-[12px] border-t-white
            border-r-[8px] border-r-transparent">
          </div>
        </button>
        

        {/* Up Arrow */}
        <button className="p-1 bg-black hover:bg-blue-500" onClick={() => adjustHeight(Direction.UP)}>
          <div className="w-0 h-0 
            border-l-[8px] border-l-transparent
            border-b-[12px] border-b-white
            border-r-[8px] border-r-transparent">
          </div>
        </button>
      </div>
  )
}