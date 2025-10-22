export interface VarSetup {
    /** @default false */
    optional?: boolean;
    /** @default false */
    nullable?: boolean;
    errMessage?: string;
    name?: string;
    /**
     * Parses the value. If not set, it will return the value as is.
     */
    parse?: (value: unknown) => any;
    defaultValue?: any;
    /**
     * @default "Environment Variable"
     */
    label?: string;
    /**
     * Falls back to default value if value is null. If no default value is set, it will throw an error for null.
     */
    fallbackNull?: boolean;
    /**
     * `!!value` must be true.
     */
    notEmpty?: boolean;
    /**
     * Treat `""`, `undefined` and `null` values as undefined.
     */
    loose?: boolean;
    /**
     * If true, loose values are parsed as well.
     */
    parseAll?: boolean;
}
