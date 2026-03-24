import { ZodError } from "zod";

export class SetupError extends Error {
    constructor(
        varName: string,
        readonly cause: unknown = undefined,
    ) {
        super(`Error in variable: ${varName}`);
    }

    get issues() {
        if (this.cause instanceof ZodError) {
            return this.cause.issues;
        }
        return [];
    }
}
