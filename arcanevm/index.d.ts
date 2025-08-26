declare module "@wettstein/arcanevm" {
    class ContextManager {
        createContext(): number;
        doesContextExist(id: number): boolean;
        getContext(id: number, callback: (context: any) => void): boolean;
        deleteContext(id: number): boolean;
    }

    class ScriptEngine {
        constructor(contextManager: ContextManager);

        addToGlobalContext(name: string, value: any): void;
        removeFromGlobalContext(name: string): void;

        runCode(str: string): any;
        runCode(str: string, isolate?: boolean): any;

        runFile(filePath: string): any;
        runFile(filePath: string, isolate?: boolean): any;
    }
}