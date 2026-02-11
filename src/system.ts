import { VarSetup } from "./types.js";

export function varName(setup: VarSetup): string {
    return setup.name || "unnamed_variable";
}
