import { z } from "zod";
import { SetupError } from "./error.js";

export function zodVar<T>(value: any, schema: z.ZodType<T>, varName?: string): T {
    try {
        return schema.parse(value);
    } catch (error) {
        throw new SetupError(varName ?? "unknown", error);
    }
}

export function zodStrVar(value: unknown, defaultValue?: string): string {
    return zodVar(value, z.string().min(defaultValue === "" ? 0 : 1), "unknown");
}

export function zodIntVar(value: unknown, defaultValue?: number): number {
    return zodVar(value, z.coerce.number().int(), "unknown");
}

export function zodNumVar(value: unknown, defaultValue?: number): number {
    return zodVar(value, z.coerce.number(), "unknown");
}

export function zodFlag(value: unknown, defaultValue?: boolean): boolean {
    return zodVar(
        value,
        z.transform((v) => {
            if (v === undefined && defaultValue !== undefined) {
                return defaultValue;
            }
            return v === "true" || v === "1" || v === true || v === 1;
        }),
        "unknown",
    );
}

export function zodEnvVar<T>(varName: string, schema: z.ZodType<T>, defaultValue?: T): T {
    return zodVar(process.env[varName] || defaultValue, schema, varName);
}

/**
 * Environment variable value. Does not allow empty values.
 */
export function envVar(varName: string, defaultValue?: string): string {
    return zodEnvVar(varName, z.string().min(defaultValue === "" ? 0 : 1), defaultValue);
}

/**
 * Attempt to parse an environment variable to an integer.
 */
export function envVarInt(varName: string, defaultValue?: number): number {
    return zodEnvVar(varName, z.coerce.number().int(), defaultValue);
}

/**
 * Attempt to parse an environment variable to a number.
 */
export function envVarNum(varName: string, defaultValue?: number): number {
    return zodEnvVar(varName, z.coerce.number(), defaultValue);
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
