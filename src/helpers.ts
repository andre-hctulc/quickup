import { z } from "zod";
import { SetupError } from "./error.js";

export function zodVar<T>(value: any, schema: z.ZodType<T>, varName?: string): T {
    try {
        return schema.parse(value);
    } catch (error) {
        throw new SetupError(varName ?? "unknown", error);
    }
}

export function zodEnvVar<T>(varName: string, schema: z.ZodType<T>): T {
    return zodVar(process.env[varName], schema, varName);
}

/**
 * Environment variable value. Does not allow empty values.
 */
export function envVar(varName: string): string {
    return zodEnvVar(varName, z.string().min(1));
}

/**
 * Environment variable value. Allows empty values.
 */
export function envVarOpt(varName: string): string {
    return zodEnvVar(varName, z.string().optional().default(""));
}

/**
 * Attempt to parse an environment variable to an integer.
 */
export function envVarInt(varName: string): number {
    return zodEnvVar(varName, z.coerce.number().int());
}

/**
 * Attempt to parse an environment variable to a number.
 */
export function envVarNum(varName: string): number {
    return zodEnvVar(varName, z.coerce.number());
}

/**
 * Parse an environment variable to a boolean.
 */
export function envFlag(varName: string): boolean {
    return zodEnvVar(
        varName,
        z.transform((v) => v === "true" || v === "1" || v === true || v === 1),
    );
}
