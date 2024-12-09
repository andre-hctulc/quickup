import { SetupError } from "./error.js";
import { VarSetup } from "./types.js";

export function varValue<T = any>(value: any, setup: VarSetup = {}): T {
    // parse default value
    const hasDefault = setup.defaultVale !== undefined;

    if (hasDefault && (value === undefined || (setup.fallbackNull && value === null))) {
        value = setup.defaultVale;
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
    // default parse
    else {
        if (value === undefined && setup.required !== false) {
            throw SetupError.fromVarSetup(setup);
        }

        if (value === null && !setup.nullable) {
            throw SetupError.fromVarSetup(setup);
        }
    }

    return value;
}

/**
 * Gets the value of an environment variable.
 * @returns A string. Empty string if variable is not set.
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
 * Get the value of an environment variable as an integer.
 */
export function envVarInt(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): number {
    return varInt(envVar(varName, setup), setup);
}

/**
 * Get the value of an environment variable as a number.
 */
export function envVarNum(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): number {
    return varNum(envVar(varName, setup), setup);
}

/**
 * Get the value of an environment variable as boolean.
 * By default the environment variable is not required and therefore will default to false.
 */
export function envVarBool(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): boolean {
    return varBool(envVar(varName, { required: false, ...setup }), setup);
}

export function varInt(value: any, setup: Omit<VarSetup, "parse"> = {}): number {
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
export function varOptInt(value: any, setup: Omit<VarSetup, "parse"> = {}): number | undefined {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            if (val == null) return undefined;
            const num = parseInt(val as any);
            if (!Number.isInteger(num)) throw new TypeError("Not an integer");
            return num;
        },
    });
}

export function varNum(value: any, setup: Omit<VarSetup, "parse"> = {}): number {
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
export function varOptNum(value: any, setup: Omit<VarSetup, "parse"> = {}): number | undefined {
    return varValue(value, {
        ...setup,
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
export function varBool(value: any, setup: Omit<VarSetup, "parse"> = {}): boolean {
    return varValue(value, {
        ...setup,
        parse: (val) =>
            val === true || (typeof val === "string" && val.toLowerCase() === "true") || val === 1,
    });
}

/**
 * Only accept string values.
 */
export function varStr(value: any, setup: Omit<VarSetup, "parse"> = {}): string {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            if (val && typeof val !== "string") throw new TypeError("Not a string");
            return val || "";
        },
    });
}

/**
 * Accept strings or, undefined or null.
 */
export function varOptStr(value: any, setup: Omit<VarSetup, "parse"> = {}): string | undefined {
    return varValue(value, {
        ...setup,
        parse: (val) => {
            if (val == null) return undefined;
            if (val && typeof val !== "string") throw new TypeError("Not a string");
            return val;
        },
    });
}
