# quickup

Setup package.

## Usage

```ts
const val = varValue(value, {
    required: true, // wether or not to allow undefined
    nullable: false, // Allow null? Defaults to false
});

const region = varValue(value, {
    defaultValue: "eu-central-1",
});

const project = varStr(value);

const maxInstances = varNum(value);

const devMode = varBool(value); // true for: true or "true" (case insensitive)

const apiKey = envVar("API_KEY");
```

For invalid values a `SetupError` is thrown.
