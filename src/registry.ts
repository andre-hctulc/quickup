
/**
 * A registry for storing variable definitions.
 * Can be used to keep track of all variables used in the application.
 */
export abstract class VarsRegistry {
    static #enabled = false;

    static #registry: Record<string, any> = {};

    static registerVar(name: string, def: any) {
        this.#registry[name] = def;
    }

    static getVar(name: string): any {
        return this.#registry[name];
    }

    static getAllVars(): Record<string, any> {
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
