import { ItemSetEdge, ItemSetNodeClass, ItemSetNodeType } from "../components/ItemSetNode/ItemSetNode";
import Table, { TableCellData } from "../components/Table/Table";
import { DataEdge } from "../types";
import Grammar from "./Grammar";
import { ItemTerm } from "./ItemTerm";
import { LR0Graph } from "./LR0Graph";
import { LR0Item, LR0ItemSet } from "./LR0Item";
import { ProductionTerm } from "./Production";

export class SLR1Graph extends LR0Graph {
    grammar: Grammar;
    dataNodes: LR0Item[][] = [];
    dataEdges: DataEdge[] = [];

    constructor(grammar: Grammar){
        super([], []);
        this.grammar = grammar;
        this.computeDFA();
    }

    resetGraph(dataNodes: LR0Item[][], dataEdges: DataEdge[]){
        this.dataNodes = [...dataNodes];
        this.dataEdges = [...dataEdges];
        this.nodes = this.dataNodesToRFNodes(dataNodes);
        this.edges = this.dataEdges.map(edge => ItemSetEdge({
            ...edge,
            label: edge.label.lexeme
        }));
        this.unAddedNodes = [...this.nodes];
        this.unAddedEdges = [...this.edges];
    }

    uniqueNextTerms(set: LR0Item[]){
        const terms: Set<string> = new Set();
        const uniqueTerms: ItemTerm[] = [];

        for (const item of set.filter(setItem => setItem.nextTerm())){
            if (!terms.has(item.nextTerm()!.lexeme)){
                terms.add(item.nextTerm()!.lexeme);
                uniqueTerms.push(item.nextTerm()!);
            }
        }
        return uniqueTerms;
    }

    computeDFA(){
        const startRH = new ProductionTerm(Array.from(this.grammar.productions.keys())[0], {isNonTerminal: true});
        const startItem = LR0Item.epsilonNewItem(Grammar.START_NONTERM, [startRH]);
        const startState = this.closure([startItem]);
        const States: LR0Item[][] = [];
        const Edges = [];
        const W = [startState];

        while (W.length > 0){
            const I = W.shift()!;
            States.push(I);

            const nextTerms = this.uniqueNextTerms(I);
            
            for (const nextTerm of nextTerms){
                const newState = I.filter(item => item.nextTerm()?.lexeme === nextTerm.lexeme);
                const J = this.goto(newState, nextTerm);

                const statesContains = LR0ItemSet.contains(States, J);
                const WContains = LR0ItemSet.contains(W, J);
                if(!statesContains && !WContains){
                    W.push(J);
                }
                Edges.push({source: LR0ItemSet.toString(I), target: LR0ItemSet.toString(J), label: nextTerm});
            }
        }

        const nodeIndexes = new Map(States.map((node, index) => [LR0ItemSet.toString(node), String(index)]));
        const newDataEdges = Edges.map(edge => ({
            source: nodeIndexes.get(edge.source)!,
            target: nodeIndexes.get(edge.target)!,
            label: edge.label
        }));

        this.resetGraph(States, newDataEdges);
    }

    dataNodesToRFNodes(nodes: LR0Item[][]){
        const rfNodes: ItemSetNodeType[] = [];

        for (const node of nodes){
            rfNodes.push(new ItemSetNodeClass({
                id: String(rfNodes.length),
                data: {
                    id: String(rfNodes.length),
                    items: node.map(item => `[${item.toString()}]`)
                },
                position: {x:50, y:50}
            }))
        }

        return rfNodes;
    }

    closure(I: LR0Item[]) {
        const W = Array.from(I);
        const J: LR0Item[] = [];
        while (W.length > 0){
            // remove 
            const i = W.shift()!;
            J.push(i);
            // check if dot is before a non-terminal
            if (i.nextIsNonTerm()){
                const LH = i.nextTerm()!.lexeme;
                const productions = this.grammar.productions.get(LH) || [];
                // perform epsilon closure
                for (const production of productions){
                    let newItem = LR0Item.epsilonNewItem(LH, production);
                    if (!LR0ItemSet.has(W, newItem) && !LR0ItemSet.has(J, newItem)){
                        W.push(newItem);
                    }
                }
            }
        }

        return J;
    }

    goto(I: LR0Item[], X: ItemTerm) {
        // get all items where the next term is X
        let W: LR0Item[] = I.filter(item => item.nextTerm()?.lexeme === X.lexeme);
        // move the dot over for all the items
        W = W.map(item => item.newItem());

        return this.closure(W);
    }

    getTable(){
        let SLRTable: TableCellData[][] = new Array(this.nodes.length);
        let termArr = Array.from(this.grammar.terminals);
        let nonTermArr = Array.from(this.grammar.nonterminals);

        // initialize table
        for (let i = 0; i < this.nodes.length; i++){
            SLRTable[i] = new Array(termArr.length + nonTermArr.length);
            for (let j = 0; j < termArr.length + nonTermArr.length; j++){
                SLRTable[i][j] = new TableCellData([]);
            }
        }

        for (const node of this.nodes){
            // get all edges with the current node as source
            const edges = this.dataEdges.filter(edge => edge.source === node.id);
            for (const edge of edges) {
                if (edge.label.isTerminal){
                    // add shift entry
                    SLRTable[Number(node.id)][termArr.indexOf(edge.label.lexeme)].data = [`shift ${edge.target}`];
                } else if (edge.label.isNonTerminal){
                    // add goto entry
                    SLRTable[Number(node.id)][termArr.length+nonTermArr.indexOf(edge.label.lexeme)].data = [edge.target];
                }
            }

            // add reduce entry for each reduction item for each term in follow set of LH
            const reduceItems = this.dataNodes[Number(node.id)].filter(item => item.isComplete());
            for (const reduceItem of reduceItems){
                const production = LR0Item.reductionItemToProduction(`[${reduceItem.toString()}]`);
                const LH = LR0Item.extractLHfromProduction(production);
                const followTerms: string[] = Array.from(this.grammar.follows.get(LH) || new Set());
                
                // handle start terminal
                if (LH === Grammar.START_NONTERM){
                    const dollarIndex = termArr.indexOf('$');
                    SLRTable[Number(node.id)][dollarIndex].data = ['accept'];
                    SLRTable[Number(node.id)][dollarIndex].classes = TableCellData.ACCEPT_STYLE;
                }

                for (const followTerm of followTerms){
                    SLRTable[Number(node.id)][termArr.indexOf(followTerm)].data.push(`reduce ${production}`);
                }
            }

            // if cell is empty in table then insert error
            for (let i = 0; i < termArr.length; i++){
                let tableCell = SLRTable[Number(node.id)][i];
                if (tableCell.data.length === 0){
                    tableCell.data = ['error'];
                } else if (tableCell.data.length > 1){
                    tableCell.classes = TableCellData.ERROR_STYLE;
                }
            }

            // add state row header
            SLRTable[Number(node.id)].unshift(new TableCellData([node.id], `${TableCellData.HEADER_STYLE} sticky left-0`));
        }

        // add top table header
        const headerClasses = "z-10";
        const termToHeader = (term: string) => new TableCellData([term], headerClasses);
        const tableHeaders = [new TableCellData([""], headerClasses), ...termArr.map(termToHeader), ...nonTermArr.map(termToHeader)];
        SLRTable.unshift(tableHeaders);

        return SLRTable;
    }

    getLR0Table(){
        const LR0Table: TableCellData[][] = new Array(this.nodes.length);
        const termArr = Array.from(this.grammar.terminals);
        const nonTermArr = Array.from(this.grammar.nonterminals);

        // initialize table
        for (let i = 0; i < this.nodes.length; i++){
            LR0Table[i] = new Array(termArr.length + nonTermArr.length);
            for (let j = 0; j < termArr.length + nonTermArr.length; j++){
                LR0Table[i][j] = new TableCellData([]);
            }
        }

        for (const node of this.nodes){
            const reduceItem = this.dataNodes[Number(node.id)].find(item => item.isComplete());
            if (reduceItem){
                const production = LR0Item.reductionItemToProduction(`[${reduceItem.toString()}]`);
                for (let i = 0; i < termArr.length; i++){
                    LR0Table[Number(node.id)][i].data = [`reduce ${production}`];
                    // highlight cells red if there is more than one item (this means there is a shift/reduce or reduce/reduce error)
                    if (this.dataNodes[Number(node.id)].length > 1){
                        LR0Table[Number(node.id)][i].classes = TableCellData.ERROR_STYLE;
                    } else if (reduceItem.item[0].lexeme === Grammar.START_NONTERM){
                        // if LH is start nonterm then add accept to cell
                        LR0Table[Number(node.id)][i].classes = TableCellData.ACCEPT_STYLE;
                        LR0Table[Number(node.id)][i].data = [`accept`];
                    } 
                }
            } else {
                // handle shifts
                let edges = this.dataEdges.filter(edge => edge.source === node.id && edge.label.isTerminal);
                for (const edge of edges){
                    LR0Table[Number(node.id)][termArr.indexOf(edge.label.lexeme)].data = [`shift ${edge.target}`];
                }
            }

            // handle goto entries
            let NTedges = this.dataEdges.filter(edge => edge.source === node.id && edge.label.isNonTerminal);
            for (const edge of NTedges){
                LR0Table[Number(node.id)][termArr.length+nonTermArr.indexOf(edge.label.lexeme)].data = [edge.target];
            }

            // handle errors
            for (let i = 0; i < termArr.length; i++){
                let tableCell = LR0Table[Number(node.id)][i];
                if (tableCell.data.length === 0){
                    tableCell.data = ['error'];
                }
            }

            // add state header as first column
            LR0Table[Number(node.id)].unshift(new TableCellData([node.id], `${TableCellData.HEADER_STYLE} sticky left-0`));
        }

        const headerClasses = "z-10";
        const termToHeader = (term: string) => new TableCellData([term], headerClasses);
        const tableHeaders = [new TableCellData([""], headerClasses), ...termArr.map(termToHeader), ...nonTermArr.map(termToHeader)];
        LR0Table.unshift(tableHeaders);

        return LR0Table;
    }

}