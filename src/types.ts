export interface VarSetup {
    /** @default true */
    required?: boolean;
    /** @default false */
    nullable?: boolean;
    errMessage?: string;
    name?: string;
    /**
     * Parses the value. If not set, it will return the value as is.
     */
    parse?: (value: unknown) => any;
    defaultValue?: string;
    /**
     * @default "Environment Variable"
     */
    label?: string;
    /**
     * Falls back to default value if value is null. If no default value is set, it will throw an error for null.
     */
    fallbackNull?: boolean;
}
