import { useRef } from "react";
import { AppStore, LR0DFAStore, LR0Store } from "../../state";
import { default as GrammarType } from "../../models/Grammar";
import Select from "../Select/Select";
import { saveAs } from "file-saver";

export default function Nav() {
  const grammar = AppStore((state) => state.grammar);
  const setImportGrammar = AppStore((state) => state.setImportGrammar);
  const importRef = useRef(null);

  function handleImport() {
    if (importRef !== null && importRef.current !== null) {
      let input: HTMLInputElement = importRef.current;
      input.click();
    }
  }

  function handleExport() {
    if (!grammar) return;
    let file = new Blob([grammar.grammarToFile()], {type: "text/plain;charset=utf-8"});
    saveAs(file, "grammar.txt");
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
          setImportGrammar(grammarInput);
        };

        reader.readAsText(file);
      }
      input.value = "";
    }
  }

  return (
    <div className="flex items-center h-14 bg-white justify-end">
      <a href="https://mochadocs.anthonyromaine.com/" target="_blank" className="mr-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-9 h-9">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </a>

      <button
        className="bg-black hover:bg-blue-500 text-white transition-colors py-2 px-4 mr-3"
        onClick={handleImport}
      >
        Import
      </button>

      <button
        className="bg-black hover:bg-blue-500 text-white transition-colors py-2 px-4 mr-3"
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
