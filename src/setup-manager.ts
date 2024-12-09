import { SetupError } from "./error.js";
import { envVar, varValue } from "./helpers.js";
import { VarSetup } from "./types.js";

export type SetupManagerInit = {
    /**
     * The variable loader function. It should return a promise that resolves to the variable value.
     */
    loadVar: (varName: string) => Promise<any>;
    varLabel?: string;
};

export type LoadVarOptions = {
    /**
     * Loads the variable from environment variables.
     *
     * Useful for development.
     */
    loadFromEnv?: boolean;
} & Omit<VarSetup, "name" | "label">;

/**
 * Manages variables, that are must be loaded async.
 * Values are cached indefinitely after the first load and can only be cleared with `clearCache`.
 */
export class SetupManager {
    private _cache: { [key: string]: { value: any; timestamp: number } } = {};
    private _loader: (varName: string) => Promise<any>;
    private _varLabel: string;

    constructor(init: SetupManagerInit) {
        this._loader = init.loadVar;
        this._varLabel = init.varLabel || "Variable";
    }

    /**
     * Gets the variable value. If the variable is not loaded yet, it will throw an error.
     * @throws `SetupError`
     */
    getVar(varName: string) {
        const cached = this._cache[varName];
        if (cached) {
            throw new SetupError(`${this._varLabel || "Variable"} '${varName}' not loaded yet`);
        }
        return this._cache[varName].value;
    }

    /**
     * Load the variable value. If the variable is cached, it will return the cached value.
     * @throws `SetupError`
     */
    async loadVar<T = any>(varName: string, options: LoadVarOptions = {}): Promise<T> {
        let cached = this._cache[varName];

        // return cached value
        if (cached) {
            return cached.value;
        }

        let value: any;
        const varSetupOptions = { ...options, name: varName, label: this._varLabel || "Variable" };

        // load from env (ignore cache in this case)
        if (options.loadFromEnv) {
            value = envVar(varName, varSetupOptions);
        }
        // load with loader
        else {
            try {
                value = await this._loader(varName);
            } catch (err) {
                if (err instanceof SetupError) throw err;
                throw SetupError.fromVarSetup(varSetupOptions, err);
            }

            // validate/parse value
            value = varValue(value, varSetupOptions);
        }

        // update cached var value (async load before)
        this._cache[varName] = {
            value,
            timestamp: Date.now(),
        };

        return value;
    }

    clearCache() {
        this._cache = {};
    }

    removeEntry(varName: string): boolean {
        return delete this._cache[varName];
    }

    hasEntry(varName: string): boolean {
        return varName in this._cache;
    }
}
