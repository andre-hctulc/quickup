# quickup

Setup package.

## Usage

```ts
const val = varValue(someNum, {
    required: true, // wether or not to allow undefined
    nullable: false, // Allow null? Defaults to false
});

const region = varValue(someRegion, {
    defaultValue: "eu-central-1",
});

const project = varStr(someValue);

const maxInstances = varNum(someNum);

const devMode = varBool(someNum); // true for: true or "true" (case insensitive)

const apiKey = envVar("API_KEY");
```

For invalid values a `SetupError` is thrown.
