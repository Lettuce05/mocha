import { AppStore } from "../../state";
import { useState } from "react";
import { pages } from "../../types";
export default function Select() {
  const page = AppStore((state) => state.page);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={() => setOpen(!open)}>
      <div
        className={`relative w-[270px] bg-zinc-300 mr-10 py-2 px-2 cursor-pointer after:absolute after:content-[''] after:top-3.5 after:right-2.5 after:w-0 after:h-0 after:border-[6px] after:border-solid after:border-transparent ${
          open ? "after:border-t-white" : "after:border-l-white"
        }`}
      >
        {page}
      </div>
      <div
        className={`h-40 w-[270px] bg-zinc-200 overflow-y-auto overflow-x-hidden absolute z-50 ${
          open ? "" : "hidden"
        }`}
      >
        {Object.values(pages).map((page) => (
          <SelectItem key={page} value={page} />
        ))}
      </div>
    </div>
  );
}

type SelectItemProps = {
  value: string;
};

function SelectItem({ value }: SelectItemProps) {
  const setPage = AppStore((state) => state.setPage);
  return (
    <div
      className="w-[270px] bg-zinc-200 mr-10 py-2 px-2 cursor-pointer hover:bg-zinc-400"
      onClick={() => setPage(value)}
    >
      {value}
    </div>
  );
}
