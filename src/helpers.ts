import { SetupError } from "./error.js";
import { VarSetup } from "./types.js";

export function varValue<T = any>(value: unknown, setup: VarSetup = {}): T {
    // user parse
    if (setup.parse) {
        try {
            value = setup.parse(value);
        } catch (err) {
            if (err instanceof SetupError) throw err;
            throw SetupError.fromVarSetup(setup, err);
        }
    }

    // parse default value
    const hasDefault = setup.defaultValue !== undefined;

    if (hasDefault && (value === undefined || (setup.fallbackNull && value === null))) {
        value = setup.defaultValue;
    }

    if (value === undefined && setup.required !== false) {
        throw SetupError.fromVarSetup(setup);
    }

    if (value === null && !setup.nullable) {
        throw SetupError.fromVarSetup(setup);
    }

    return value as T;
}

/**
 * Environment variable value or empty string.
 */
export function envVar(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): string {
    return (
        varValue(process.env[varName], {
            ...setup,
            name: varName,
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
    return varBool(envVar(varName, { required: false, ...setup }), setup);
}

/**
 * Attempt to parse teh value as an integer.
 */
export function varInt(value: any, setup: VarSetup = {}): number {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            const num = parseInt(val as any);
            if (!Number.isInteger(num)) throw new TypeError("Not an integer");
            return num;
        },
    });
}

/**
 * Accepts integers, undefined or null.
 */
export function varOptInt(value: any, setup: VarSetup = {}): number | undefined {
    return varValue(value, {
        ...setup,
        required: false,
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
        ...setup,
        required: false,
        parse: (val) => {
            if (val == null) return undefined;
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
        ...setup,
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
        ...setup,
        required: false,
        parse: (val) => {
            if (val == null) return undefined;
            if (typeof val !== "string") throw new TypeError("Not a string");
            return val;
        },
    });
}
