import { GRAMMAR_INPUT } from "../../types";
import Grammar from "../../models/Grammar";
import { FormEvent } from "react";
type GrammarInputParam = {
  input: GRAMMAR_INPUT;
  handleInput: (id: string, e: FormEvent<HTMLInputElement>) => void;
  handleRemove: (id: string) => void;
};

export default function GrammarInput({
  input,
  handleInput,
  handleRemove,
}: GrammarInputParam) {
  let lhError = input.LH.trim()
    ? !Grammar.isNonTerminal(input.LH.trim())
    : true;
  let rhError = input.RH.trim() ? !Grammar.validRH(input.RH) : true;
  return (
    <div className="flex">
      <input
        className={`w-36 max-w-[9rem] ${lhError ? "border-2 border-red-500" : ""}`}
        name="LH"
        type="text"
        value={input.LH}
        onInput={(e) => handleInput(input.id, e)}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={3}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
      <input
        className={`w-36 ${rhError ? "border-2 border-red-500" : ""}`}
        name="RH"
        type="text"
        value={input.RH}
        onInput={(e) => handleInput(input.id, e)}
      />
      <button
        className="bg-black hover:bg-red-500 transition-colors py-1 px-1"
        onClick={() => handleRemove(input.id)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 stroke-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      </button>
    </div>
  );
}
