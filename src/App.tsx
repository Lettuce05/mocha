import LL from "./components/LL/LL";
import First from "./components/First/First";
import NavLayout from "./components/NavLayout/NavLayout";
import { AppStore } from "./state";
import { pages } from "./types";
import LR0 from "./components/LR0/LR0";
import LR0DFA from "./components/LR0DFA/LR0DFA";
import SLR from "./components/SLR/SLR";
import LR1 from "./components/LR1/LR1";

export default function App() {
  const page = AppStore((state) => state.page);

  if (page === pages.FIRST) {
    return (
      <NavLayout>
        <First />
      </NavLayout>
    );
  } else if (page === pages.LL) {
    return (
      <NavLayout>
        <LL />
      </NavLayout>
    );
  } else if (page === pages.LR0) {
    return (
      <NavLayout>
        <LR0 />
      </NavLayout>
    );
  } else if (page === pages.LR0DFA) {
    return (
      <NavLayout>
        <LR0DFA />
      </NavLayout>
    );
  } else if (page === pages.SLR) {
    return (
      <NavLayout>
        <SLR />
      </NavLayout>
    );
  } else if (page === pages.LR1) {
    return (
      <NavLayout>
        <LR1 />
      </NavLayout>
    );
  } else {
    return <NavLayout />;
  }
}
