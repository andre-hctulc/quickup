import { SetupError } from "./error.js";
import { VarSetup } from "./types.js";

/**
 * Validation order:
 *
 * `optional/defaultValue check -> nullable/fallbackNull check -> parse`
 */
export function varValue<T = any>(value: unknown, setup: VarSetup = {}): T {
    if (value === undefined) {
        if (setup.defaultValue !== undefined) {
            return setup.defaultValue as T;
        }
        if (setup.optional) {
            if (!(setup.parseNullAndUndefined && setup.parse)) {
                return undefined as T;
            }
        } else {
            throw SetupError.fromVarSetup(setup, undefined);
        }
    }

    if (value === null) {
        if (setup.fallbackNull && setup.defaultValue !== undefined) {
            return setup.defaultValue;
        }
        if (setup.nullable) {
            if (!(setup.parseNullAndUndefined && setup.parse)) {
                return null as T;
            }
        } else {
            throw SetupError.fromVarSetup(setup, undefined);
        }
    }
    if (!value && setup.notEmpty) {
        throw SetupError.fromVarSetup(setup, "Value must not be empty");
    }

    // user parse
    if (setup.parse) {
        try {
            value = setup.parse(value);
        } catch (err) {
            if (err instanceof SetupError) throw err;
            throw SetupError.fromVarSetup(setup, err);
        }
    }

    return value as T;
}

/**
 * Environment variable value or empty string.
 */
export function envVar(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): string {
    // We interpret empty values as not defined for env vars, thus we parse empty values as undefined
    return varValue(process.env[varName] || undefined, {
        name: varName,
        ...setup,
    });
}

/**
 * Attempt to parse an environment variable to an integer.
 */
export function envVarInt(varName: string, setup: VarSetup = {}): number {
    return varInt(process.env[varName], { name: varName, ...setup });
}

/**
 * Attempt to parse an environment variable to a number.
 */
export function envVarNum(varName: string, setup: VarSetup = {}): number {
    return varNum(process.env[varName], { name: varName, ...setup });
}

/**
 * Parse an environment variable to a boolean.
 * If the variable is not defined, false is returned, instead of throwing an error.
 */
export function envFlag(varName: string, setup: VarSetup = {}): boolean {
    return varBool(process.env[varName], { name: varName, ...setup });
}

/**
 * Accept integers.
 */
export function varInt(value: any, setup: VarSetup = {}): number {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            const num = parseInt(val as any);
            if (isNaN(num) || !Number.isInteger(num)) throw new TypeError("Not an integer");
            return num;
        },
    });
}

/**
 * Accept only numbers.
 */
export function varNum(value: any, setup: VarSetup = {}): number {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            const num = parseInt(val as any);
            if (isNaN(num)) throw new TypeError("Not a number");
            return num;
        },
    });
}

/**
 * Accepts all values.
 *
 * @returns true for true, "true" (case insensitive) and 1, false otherwise.
 */
export function varBool(value: any, setup: VarSetup = {}): boolean {
    return varValue(value, {
        optional: true,
        nullable: true,
        ...setup,
        parseNullAndUndefined: true,
        parse: (val) =>
            val === true || (typeof val === "string" && val.toLowerCase() === "true") || val === 1,
    });
}

/**
 * Only accept string values.
 */
export function varStr(value: any, setup: VarSetup = {}): string {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            if (typeof val !== "string") throw new TypeError("Not a string");
            return val;
        },
    });
}

/**
 * Call with optional flag.
 *
 * **Example**
 * ```ts
 * const threshold = opt(envVarInt, "THRESHOLD") // -> number | undefined
 * ```
 */
export function opt<T>(
    fn: (value: any, setup?: VarSetup) => T,
    value: any,
    setup: VarSetup = {}
): T | undefined {
    return fn(value, { ...setup, optional: true });
}
