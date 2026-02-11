import { VarSetup } from "./types.js";

/**
 * A registry for storing variable definitions.
 * Can be used to keep track of all variables used in the application.
 */
export abstract class VarsRegistry {
    static #enabled = false;

    static #registry: Record<string, VarSetup> = {};

    static registerVar(name: string, def: VarSetup) {
        this.#registry[name] = def;
    }

    static getVar(name: string): VarSetup {
        return this.#registry[name];
    }

    static getAllVars(): Record<string, VarSetup> {
        return { ...this.#registry };
    }

    static enable() {
        this.#enabled = true;
    }

    static disable() {
        this.#enabled = false;
    }

    static isEnabled(): boolean {
        return this.#enabled;
    }
}
