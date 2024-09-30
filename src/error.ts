import { VarSetup } from "./types";

export class SetupError extends Error {
    constructor(message: string, readonly cause: unknown = undefined) {
        super(message);
    }

    static fromVarSetup(err: VarSetup, cause?: unknown) {
        return new SetupError(errMessage(err.label || "Environment Variable", err), cause);
    }
}

function errMessage(varLabel: string, err: VarSetup) {
    const tags = [err.nullable && "n", err.required === false ? "?" : "*", err.parse && "->"]
        .filter(Boolean)
        .join(", ");

    return (
        err.errMessage || `${varLabel} ${err.name ? "'" + err.name + "'" : ""}(${tags}) not set or invalid`
    );
}
