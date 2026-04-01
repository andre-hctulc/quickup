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
export function envVar(varName: string, defaultValue?: string): string {
    return zodEnvVar(
        varName,
        defaultValue === undefined ? z.string().min(1) : z.string().min(1).default(defaultValue),
    );
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
export function envVarInt(varName: string, defaultValue?: number): number {
    return zodEnvVar(
        varName,
        defaultValue === undefined ? z.coerce.number().int() : z.coerce.number().int().default(defaultValue),
    );
}

/**
 * Attempt to parse an environment variable to a number.
 */
export function envVarNum(varName: string, defaultValue?: number): number {
    return zodEnvVar(
        varName,
        defaultValue === undefined ? z.coerce.number() : z.coerce.number().default(defaultValue),
    );
}

/**
 * Parse an environment variable to a boolean.
 */
export function envFlag(varName: string, defaultValue?: boolean): boolean {
    return zodEnvVar(
        varName,
        z.transform((v) => {
            if (v === undefined && defaultValue !== undefined) {
                return defaultValue;
            }
            return v === "true" || v === "1" || v === true || v === 1;
        }),
    );
}
