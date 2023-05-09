import NavLayout from "./components/NavLayout/NavLayout";
import { AppStore } from "./state";
import { pageComponents } from "./types";

export default function App() {
  const page = AppStore((state) => state.page);

  const Page = pageComponents.get(page);
  if (Page){
    return (
      <NavLayout>
        <Page />
      </NavLayout>
    )
  } else {
    return <NavLayout />
  }
}
