import { FormEvent, useState } from "react";
import { AppStore } from "../../state";
import { GRAMMAR_INPUT } from "../../types";
import { v4 } from "uuid";
import GrammarInput from "../GrammarInput/GrammarInput";
import { default as grammarClass } from "../../models/Grammar";
import Modal from "../Modal/Modal";

export default function Grammar() {
  const grammarInput = AppStore((state) => state.grammarInput);
  const setGrammarInput = AppStore((state) => state.setGrammarInput);
  const setGrammar = AppStore((state) => state.setGrammar);
  const [modalState, setModalState] = useState({
    shown: false,
    message: "",
  });

  function handleChange(id: string, e: FormEvent<HTMLInputElement>) {
    let grammarInputValues = [...grammarInput];
    const target: HTMLInputElement = e.target as HTMLInputElement;
    grammarInputValues = grammarInputValues.map((input: GRAMMAR_INPUT) => {
      if (input.id === id && target) {
        input = { ...input, [target.name]: target.value };
      }
      return input;
    });

    setGrammarInput(grammarInputValues);
  }

  function handleRemove(id: string) {
    let grammarInputValues = [...grammarInput];
    grammarInputValues = grammarInputValues.filter((input) => input.id !== id);
    setGrammarInput(grammarInputValues);
  }

  function handleAdd() {
    const newGrammarInput: GRAMMAR_INPUT = {
      id: v4(),
      LH: "",
      RH: "",
    };

    setGrammarInput([...grammarInput, newGrammarInput]);
  }

  function handleSave() {
    let validGrammar = grammarClass.validateGrammar(grammarInput);
    if (typeof validGrammar === "string") {
      setModalState({
        shown: true,
        message: validGrammar,
      });
    } else {
      setGrammar(validGrammar);
    }
  }

  return (
    <div className="max-h-full overflow-y-auto px-2 w-96 min-w-[384px]">
      <div className="my-4">
        <p>
          <span className="font-bold">Non-Terminal:</span> must match a [A-Z]+
          pattern
        </p>
        <p>
          <span className="font-bold">Terminal:</span> must match a ".+" pattern
        </p>
        <p>
          <span className="font-bold">Epsilon:</span> please use ε for any
          production that needs epsilon
        </p>
      </div>
      {grammarInput.map((input: GRAMMAR_INPUT) => (
        <GrammarInput
          key={input.id}
          input={input}
          handleInput={handleChange}
          handleRemove={handleRemove}
        />
      ))}
      <button
        onClick={handleAdd}
        className="mx-auto block bg-black text-white hover:bg-green-500 transition-colors py-2 w-56 my-3"
      >
        Add
      </button>
      <button
        onClick={handleSave}
        className="mx-auto block bg-black text-white hover:bg-green-500 transition-colors py-2 w-56 mb-3"
      >
        Save
      </button>
      <Modal shown={modalState.shown}>
        <div className="w-4/5 max-w-lg bg-white mx-auto mt-[25%] -translate-y-1/4 p-9 rounded-lg">
          <p className="font-bold text-2xl">Error:</p>
          <button
            className="absolute top-4 right-4"
            onClick={() => setModalState({ shown: false, message: "" })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 stroke-[3px]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <p className="text-red-600">{modalState.message}</p>
        </div>
      </Modal>
    </div>
  );
}
