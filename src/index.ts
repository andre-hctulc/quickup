export class SetupError extends Error {
    constructor(message: string) {
        super(message);
    }

    static fromVarSetup(err: VarSetup) {
        return new SetupError(
            err.errInfo || `Environment variable ${err.name ? "'" + err.name + "' " : ""}not set or invalid`
        );
    }
}

export interface VarSetup {
    required?: boolean;
    nullable?: boolean;
    errInfo?: string;
    name?: string;
    defaultVale?: string;
    check?: (value: string | undefined) => boolean;
}

export function varValue(value: any, setup: VarSetup = {}): any {
    if (value === undefined) {
        if (setup.required) throw SetupError.fromVarSetup(setup);
        if (setup.defaultVale) value = setup.defaultVale;
    }

    if (!setup.nullable && value === null) {
        throw SetupError.fromVarSetup(setup);
    }

    if (setup.check && !setup.check(value)) {
        throw SetupError.fromVarSetup(setup);
    }

    return value;
}

export function envVar(varName: string, setup: Omit<VarSetup, "name"> = {}): string {
    return varValue(process.env[varName], { ...setup, name: varName }) || "";
}

export function varInt(value: string, setup: VarSetup = {}) {
    const num = parseInt(varValue(value, setup));
    if (isNaN(num)) throw SetupError.fromVarSetup(setup);
    return num;
}

export function varBool(value: any, setup: VarSetup = {}): boolean {
    const v = varValue(value, setup);
    if (typeof v === "string") return v.toLowerCase() === "true";
    return !!v;
}

export function varStr(value: any, setup: VarSetup = {}): string {
    if (typeof value !== "string") throw SetupError.fromVarSetup(setup);
    return varValue(value, setup);
}
