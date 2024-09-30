export class SetupError extends Error {
    constructor(message: string) {
        super(message);
    }

    static fromVarSetup(err: VarSetup) {
        return new SetupError(errMessage(err.varLabel || "Environment Variable", err));
    }
}

function errMessage(varLabel: string, err: VarSetup) {
    const tags = [err.nullable && "n", err.required === false ? "?" : "*", err.check && "c"]
        .filter(Boolean)
        .join(", ");

    return (
        err.errMessage || `${varLabel} ${err.name ? "'" + err.name + "'" : ""}(${tags}) not set or invalid`
    );
}

export interface VarSetup {
    /** @default true */
    required?: boolean;
    /** @default false */
    nullable?: boolean;
    errMessage?: string;
    name?: string;
    defaultVale?: string;
    check?: (value: string | undefined) => boolean;
    /**
     * @default "Environment Variable"
     */
    varLabel?: string;
    fallbackNull?: boolean;
}

export function varValue(value: any, setup: VarSetup = {}): any {
    const hasDefault = setup.defaultVale !== undefined;

    if (value === undefined) {
        if (setup.required !== false) throw SetupError.fromVarSetup(setup);
        if (hasDefault) value = setup.defaultVale;
    }

    if (value === null) {
        if (setup.fallbackNull && hasDefault) value = setup.defaultVale;
        else if (!setup.nullable) throw SetupError.fromVarSetup(setup);
    }

    if (setup.check && !setup.check(value)) {
        throw SetupError.fromVarSetup(setup);
    }

    return value;
}

export function envVar(varName: string, setup: Omit<VarSetup, "name"> = {}): string {
    return (
        varValue(process.env[varName], {
            ...setup,
            name: varName,
        }) || ""
    );
}

export function varInt(value: string, setup: VarSetup = {}) {
    const num = parseInt(varValue(value, setup));
    if (isNaN(num)) throw SetupError.fromVarSetup(setup);
    return num;
}

export function varBool(value: any, setup: VarSetup = {}): boolean {
    const v = varValue(value, setup);
    if (typeof v === "string") return v.toLowerCase() === "true";
    return v === true;
}

export function varStr(value: any, setup: VarSetup = {}): string {
    if (typeof value !== "string") throw SetupError.fromVarSetup(setup);
    return varValue(value, setup);
}
