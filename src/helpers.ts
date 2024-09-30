import { SetupError } from "./error";
import { VarSetup } from "./types";

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
 * @returns A string. If the variable is not set, it will return an empty string.
 */
export function envVar(varName: string, setup: Omit<VarSetup, "name" | "parse"> = {}): string {
    return (
        varValue(process.env[varName], {
            ...setup,
            name: varName,
        }) || ""
    );
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
 * Accepts all values.
 *
 * @returns `true` for `true`, `"true"` (case insensitive) and `1`, `false` otherwise.
 */
export function varBool(value: any, setup: Omit<VarSetup, "parse"> = {}): boolean {
    return varValue(value, {
        ...setup,
        parse: (val) =>
            val === true || (typeof val === "string" && val.toLowerCase() === "true") || val === 1,
    });
}

/**
 * Only accepts string values.
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
