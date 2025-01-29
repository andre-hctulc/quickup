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
            throw SetupError.fromVarSetup(setup);
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
            throw SetupError.fromVarSetup(setup);
        }
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
    return (
        varValue(process.env[varName], {
            name: varName,
            ...setup,
        }) || ""
    );
}

/**
 * Attempt to parse a environment variable as an integer.
 */
export function envVarInt(varName: string, setup: VarSetup = {}): number {
    return varInt(envVar(varName, setup), setup);
}

/**
 * Attempt to parse a environment variable as integer or undefined.
 */
export function envVarOptInt(varName: string, setup: VarSetup = {}): number {
    return varInt(envVar(varName, setup), setup);
}

/**
 * Attempt to parse a environment variable as a number.
 */
export function envVarNum(varName: string, setup: VarSetup = {}): number {
    return varNum(envVar(varName, setup), setup);
}
/**
 * Attempt to parse a environment variable as number or undefined.
 */
export function envVarOptNum(varName: string, setup: VarSetup = {}): number | undefined {
    return varOptNum(envVar(varName, setup), setup);
}

/**
 * Parse an environment variable as a boolean.
 */
export function envVarBool(varName: string, setup: VarSetup = {}): boolean {
    return varBool(envVar(varName, { optional: true, ...setup }), setup);
}

/**
 * Attempt to parse teh value as an integer.
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
 * Accepts integers, undefined or null.
 */
export function varOptInt(value: any, setup: VarSetup = {}): number | undefined {
    return varValue(value, {
        optional: true,
        nullable: true,
        ...setup,
        parseNullAndUndefined: true,
        parse: (val) => {
            if (val == null) return undefined;
            const num = parseInt(val as any);
            if (!Number.isInteger(num)) throw new TypeError("Not an integer");
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
 * Accepts numbers, undefined or null.
 */
export function varOptNum(value: any, setup: VarSetup = {}): number | undefined {
    return varValue(value, {
        optional: true,
        nullable: true,
        ...setup,
        parseNullAndUndefined: true,
        parse: (val) => {
            if (val == null) return undefined;
            const num = parseInt(val as any);
            if (isNaN(num)) throw new TypeError("Not a number");
            return num;
        },
    });
}

/**
 * Accepts all values and is optional and nullable by default.
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
 * Accept strings or, undefined or null.
 */
export function varOptStr(value: any, setup: VarSetup = {}): string | undefined {
    return varValue(value, {
        optional: true,
        nullable: true,
        ...setup,
        parseNullAndUndefined: true,
        parse: (val) => {
            if (val == null) return undefined;
            if (typeof val !== "string") throw new TypeError("Not a string");
            return val;
        },
    });
}
