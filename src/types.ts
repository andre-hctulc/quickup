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
    /**
     * null/undefined will be passed to the parse function if nullable/optional is set
     * instead of returning null/undefined.
     */
    parseNullAndUndefined?: boolean;
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
}
