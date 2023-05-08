import { useRef } from "react";
import { AppStore, LR0DFAStore, LR0Store } from "../../state";
import { default as GrammarType } from "../../models/Grammar";
import Select from "../Select/Select";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Nav() {
  const grammar = AppStore((state) => state.grammar);
  const setGrammar = AppStore((state) => state.setGrammar);
  const setGrammarInput = AppStore((state) => state.setGrammarInput);
  const resetLR0 = LR0Store((state) => state.resetStore);
  const resetLR0DFA = LR0DFAStore((state) => state.resetStore);
  const importRef = useRef(null);

  function handleImport() {
    if (importRef !== null && importRef.current !== null) {
      let input: HTMLInputElement = importRef.current;
      input.click();
    }
  }

  function handleExport() {
    if (!grammar) return;
    grammar.grammarToJSON();
    const zip = new JSZip();
    zip.file("grammar.txt", grammar.grammarToFile());
    zip.file("grammar.json", grammar.grammarToJSON());
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "grammar.zip");
    });
  }

  function handleImportSubmit() {
    if (importRef !== null && importRef.current !== null) {
      let input: HTMLInputElement = importRef.current;
      if (input.files !== null && input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onabort = () => alert("File reading was aborted");
        reader.onerror = () => alert("File reading has failed");
        reader.onload = () => {
          let fileContents: string = "";
          // make sure that result is defined and that is a string
          if (reader.result && typeof reader.result === "string") {
            fileContents = reader.result;
          }
          // get lines of file and filter out any blank lines
          const fileLines = fileContents
            .split(String.fromCharCode(10))
            .filter((line) => line);
          // get new grammarInput from lines
          let grammarInput = GrammarType.fileToGrammarInput(fileLines);
          setGrammarInput(grammarInput);
          setGrammar(null);
        };

        reader.readAsText(file);
      }
    }
  }

  return (
    <div className="flex items-center h-14 bg-white justify-end">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
        onClick={handleImport}
      >
        Import
      </button>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3"
        onClick={handleExport}
      >
        Export
      </button>

      <Select />

      <input
        type="file"
        className="hidden"
        name="import-input"
        onChange={handleImportSubmit}
        accept=".txt"
        ref={importRef}
      />
    </div>
  );
}
