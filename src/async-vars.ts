import { SetupError } from "./error";
import { envVar, varValue } from "./helpers";
import { VarSetup } from "./types";

export type AsyncVarsManagerInit = {
    /**
     * The variable loader function. It should return a promise that resolves to the variable value.
     */
    loadVar: (varName: string) => Promise<any>;
    /**
     * Milliseconds
     * @default Infinity
     */
    cacheDuration?: number;
    varLabel?: string;
};

export type LoadVarOptions = {
    /**
     * Loads the variable from environment variables.
     *
     * Useful for development.
     */
    loadFromEnv?: boolean;
    /**
     * Milliseconds
     *
     * Overwrites the cache duration set in the `AsyncVarsManager` for this load.
     *
     * @default Infinity
     * */
    cacheDuration?: number;
} & Omit<VarSetup, "name" | "label">;

/**
 * Manages variables, that must be initialized async. Use it for secrets, configurations, etc.
 */
export class AsyncVarsManager {
    private _cache: { [key: string]: { value: any; clear: any } } = {};
    private _loader: (varName: string) => Promise<any>;
    private _cacheDuration: number;
    private _varLabel: string;

    constructor(init: AsyncVarsManagerInit) {
        this._loader = init.loadVar;
        this._cacheDuration = init.cacheDuration ?? Infinity;
        this._varLabel = init.varLabel || "Variable";
    }

    /**
     * Gets the variable value. If the variable is not loaded yet, it will throw an error.
     * @throws `SetupError`
     */
    getVar(varName: string) {
        const cached = this._cache[varName];
        if (!cached) throw new SetupError(`${this._varLabel || "Variable"} '${varName}' not loaded yet`);
        return this._cache[varName].value;
    }

    /**
     * Load the variable value. If the variable is already loaded, it will return the cached value.
     * @throws `SetupError`
     */
    async loadVar(varName: string, options: LoadVarOptions = {}): Promise<any> {
        const cacheDuration = options.cacheDuration ?? this._cacheDuration;
        let cached = this._cache[varName];

        // return cached value, if cache enabled
        if (cached && cacheDuration > 0) return cached.value;

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
                throw SetupError.fromVarSetup(varSetupOptions, err);
            }

            // validate/parse value
            value = varValue(value, varSetupOptions);
        }

        // update cached var value (async load before)
        cached = this._cache[varName];
        if (cached.clear) clearTimeout(cached.clear);

        this._cache[varName] = {
            value,
            clear:
                cacheDuration == Infinity
                    ? null
                    : setTimeout(() => delete this._cache[varName], cacheDuration),
        };

        return value;
    }

    clearCache() {
        // clear timeouts
        Object.entries(this._cache).forEach(([key, { clear }]) => {
            if (clear) clearTimeout(clear);
        });
        this._cache = {};
    }

    removeEntry(varName: string): boolean {
        return delete this._cache[varName];
    }

    hasEntry(varName: string): boolean {
        return varName in this._cache;
    }
}
