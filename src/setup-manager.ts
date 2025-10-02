import { SetupError } from "./error.js";
import { varValue } from "./helpers.js";
import { VarSetup } from "./types.js";

export type SetupManagerInit = {
    /**
     * The variable loader function.
     * If it returns promises ``
     */
    loader: (varName: string) => any;
    allLoader?: () => Promise<Record<string, any>>;
    varLabel?: string;
};

export type LoadVarOptions = Omit<VarSetup, "name" | "label">;

/**
 * Manages setup variables from a source (e.g. environment variables, database, etc).
 * Values are cached indefinitely after firstly loaded and can only be cleared with {@link clearCache} or {@link removeEntry}.
 */
export class SetupManager {
    private _cache: { [key: string]: { value: any; timestamp: number } } = {};
    private _loader: (varName: string) => Promise<any>;
    private _allLoader: (() => Promise<Record<string, any>>) | undefined;
    private _varLabel: string;

    constructor(init: SetupManagerInit) {
        this._loader = init.loader;
        this._allLoader = init.allLoader;
        this._varLabel = init.varLabel || "Variable";
    }

    /**
     * Gets the variable value. If the variable is not loaded yet, it will throw an error.
     * @throws `SetupError`
     */
    getVar<T = any>(varName: string): T {
        const cached = this._cache[varName];
        if (!cached) {
            throw new SetupError(`${this._varLabel || "Variable"} '${varName}' not loaded yet`);
        }
        return this._cache[varName].value;
    }

    /**
     * Load the variable value. If the variable is cached, it will return the cached value.
     * @throws `SetupError`
     */
    async load<T = any>(varName: string, options: LoadVarOptions = {}): Promise<T> {
        let cached = this._cache[varName];

        // return cached value
        if (cached) {
            return cached.value;
        }

        let value: any;
        const varSetupOptions = { ...options, name: varName, label: this._varLabel || "Variable" };

        try {
            value = await this._loader(varName);
        } catch (err) {
            if (err instanceof SetupError) throw err;
            throw SetupError.fromVarSetup(varSetupOptions, err);
        }

        // validate/parse value
        value = varValue(value, varSetupOptions);

        // update cached var value (async load before)
        this._cache[varName] = {
            value,
            timestamp: Date.now(),
        };

        return value;
    }

    async loadAll(): Promise<Record<string, any>> {
        if (!this._allLoader) {
            throw new Error("No loader function available");
        }
        return this._allLoader();
    }

    /**
     * **Only supported when the loader function is synchronous or the variable is already cached.**
     *
     * Load the variable value. If the variable is cached, it will return the cached value.
     * @throws `SetupError`
     */
    loadSync<T = any>(varName: string, options: LoadVarOptions = {}): T {
        let cached = this._cache[varName];

        // return cached value
        if (cached) {
            return cached.value;
        }

        let value: any;
        const varSetupOptions = { ...options, name: varName, label: this._varLabel || "Variable" };

        try {
            value = this._loader(varName);
            if (value instanceof Promise) {
                throw new Error("Loader function is asynchronous");
            }
        } catch (err) {
            if (err instanceof SetupError) throw err;
            throw SetupError.fromVarSetup(varSetupOptions, err);
        }

        // validate/parse value
        value = varValue(value, varSetupOptions);

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

    /**
     * Checks if a variable entry exists.
     */
    hasEntry(varName: string): boolean {
        return varName in this._cache;
    }

    /**
     * Lists all available variable entries.
     */
    getEntries() {
        return Array.from(Object.entries(this._cache));
    }

    /**
     * Initializes the setup manager with the given variable values.
     */
    init(values: Record<string, unknown>) {
        for (const [key, value] of Object.entries(values)) {
            if (value === undefined) {
                continue;
            }
            this._cache[key] = {
                value,
                timestamp: Date.now(),
            };
        }
    }
}
