import { Panel } from "reactflow";
import HeightButton from "../HeightButton/HeightButton";


export default function RFHeightButton() {
  return (
    <Panel position="bottom-center" style={{marginBottom: 0}}>
      <HeightButton />
    </Panel>
  )
}