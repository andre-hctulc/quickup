import { varName } from "./system.js";
import { VarSetup } from "./types.js";

export class SetupError extends Error {
    constructor(
        message: string,
        readonly cause: unknown = undefined,
    ) {
        super(message);
    }

    static fromVarSetup(err: VarSetup, cause: unknown | undefined) {
        return new SetupError(errMessage(err), cause);
    }
}

function errMessage(err: VarSetup) {
    const tags = [err.nullable && "n", err.optional ? "?" : "*", err.parse && "->"]
        .filter(Boolean)
        .join(", ");

    return (
        err.errMessage ||
        `${varName(err)} ${err.name ? "'" + err.name + "'" : "<unnamed>"} (${tags}) not set or invalid`
    );
}
