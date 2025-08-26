// ArcaneJS deals with the creation and execution of a script engine. 
// For type information, see ./index.d.ts

const util = require("node:util");
const vm = require("node:vm");
const fs = require("node:fs");

// ArcaneJS is declared as a namespace and uses an object as its main declaration.
const ArcaneJS = {};

(function initArcaneJS(ns) {
    const dataManager = new Array(3);

    const doesExist = {
        contextManager: false, // Scheme: dataManager[1][ContextManagerId][ContextId]
        scriptEngine: false
    };

    function getRandomId() {
        const max = 1000, min = 1;

        let randValue = Math.random() * (max - min) + min;

        randValue = randValue * ((Math.random() * (max - min) + min) / randValue);

        if (Math.random() >= 5)
            randValue = randValue * getRandomId();

        return Math.round(randValue);
    }

    class ArcaneJSBase {

    }

    ArcaneJSBase.toString = function AJSBASE_toString() {
        return `class ${this.name} { ... }`;
    }

    class ContextManager extends ArcaneJSBase {
        constructor() {
            super();
            if (!doesExist.contextManager)
            {
                dataManager[1] = new Array();
                doesExist.contextManager = true;
            }


            let id = getRandomId();

            try {
                while (dataManager[1][id])
                    id = getRandomId();
            } catch (_) { }

            dataManager[1][id] = new Array();

            this.createContext = function cmCreateContext() {
                let conId = getRandomId();

                try {
                while (dataManager[1][id][conId])
                    conId = getRandomId();
                } catch (_) { }

                dataManager[1][id][conId] = {};

                return conId;
            }

            // The parameter 'conId' is refered to as 'id' as stated by the type definitions.
            this.doesContextExist = function cmDoesContextExist(conId) {
                if (typeof conId != "number")
                    throw new TypeError("The type of 'id' is not of type number. (cmDoesContextExist)");

                if (dataManager[1][id][conId])
                    return true;
                else
                    return false;
            }

            this.getContext = function cmGetContext(conId, callback) {
                if (typeof conId != "number")
                    throw new TypeError("The type of 'id' is not of type number. (cmGetContext)");
                else if (typeof callback != "function")
                    throw new TypeError("The type of 'callback' is not of type function. (cmGetContext)");

                if (!this.doesContextExist(conId))
                    return false;

                const context = {
                    ...dataManager[1][id][conId]
                };

                callback(context);

                dataManager[1][id][conId] = context;

                return true;
            }

            this.deleteContext = function cmDeleteContext(conId) {
                if (typeof conId != "number")
                    throw new TypeError("The type of 'id' is not of type number. (cmDeleteContext)");

                if (!this.doesContextExist(conId))
                    return false;

                delete dataManager[1][id][conId];

                return true;
            }

        }
    }

    class ScriptEngine extends ArcaneJSBase {
        constructor(contextManager) {
            super();
            if (!(contextManager instanceof ContextManager))
                throw new TypeError("The type of 'contextManager' is not of type ContextManager. (ScriptEngine)");
            
            const globalContextId = contextManager.createContext();

            this.addToGlobalContext = function seAddToGlobalContext(name, value) {
                if (typeof name != "string")
                    throw new TypeError("The type of 'name' is not of type string. (seAddToGlobalContext)");

                contextManager.getContext(globalContextId, (cnt) => {
                    cnt[name] = value;
                });

                return;
            }

            this.removeFromGlobalContext = function seRemoveFromGlobalContext(name) {
                if (typeof name != "string")
                    throw new TypeError("The type of 'name' is not of type string. (seRemoveFromGlobalContext)");

                contextManager.getContext(globalContextId, (cnt) => {
                    delete cnt[name];
                });

                return;
            }

            this.runCode = function seRunCode(str, isolate = true) {
                if (typeof str != "string")
                    throw new TypeError("The type of 'str' is not of type string. (seRunCode)");
                else if (typeof isolate != "boolean")
                    isolate = true;

                let exports = {};

                if (isolate == true)
                    contextManager.getContext(globalContextId, cnt => {
                        const context = {...cnt, exports: {}};

                        if (!vm.isContext(context))
                            vm.createContext(context);

                        vm.runInContext(str, context, "eval");

                        exports = context.exports || exports;
                    });
                else
                    contextManager.getContext(globalContextId, cnt => {
                        if (!vm.isContext(cnt))
                            vm.createContext(cnt);

                        vm.runInContext(str, cnt, "eval");
                    });

                return exports;
            }

            this.runFile = function seRunFile(filePath, isolate = true) {
                if (typeof filePath != "string")
                    throw new TypeError("The type of 'filePath' is not of type string. (seRunFile)");
                else if (typeof isolate != "boolean")
                    isolate = true;
                else if (!fs.existsSync(filePath))
                    throw new EvalError(`The file '${filePath}' does not exist. (seRunFile)`);

                const str = fs.readFileSync(filePath, "utf-8");

                let exports = {};

                if (isolate == true)
                    contextManager.getContext(globalContextId, cnt => {
                        const context = {...cnt, exports: {}};

                        if (!vm.isContext(context))
                            vm.createContext(context);

                        vm.runInContext(str, context, filePath);

                        exports = context.exports || exports;
                    });
                else
                    contextManager.getContext(globalContextId, cnt => {
                        if (!vm.isContext(cnt))
                            vm.createContext(cnt);

                        vm.runInContext(str, cnt, filePath);
                    });

                return exports;
            }
        }
    }


    ns.ContextManager = ContextManager;
    ns.ScriptEngine = ScriptEngine;
})(ArcaneJS);

// Export ArcaneJS
module.exports = ArcaneJS;