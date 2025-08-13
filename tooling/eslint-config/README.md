# @esk/eslint-config

This package bundles ESLint and its dependencies, making it easy to apply consistent linting across your applications.

## ESLint

Linting is the process of automatically analyzing source code to detect errors, enforce coding standards, and flag potential bugs or stylistic issues. A linter scans your code and highlights problems like unused variables, inconsistent formatting, or risky patterns.

Learn more at the [official ESLint site](https://eslint.org/).

## How to Use

From the root of your monorepo, you can run:

```bash title="Terminal"
bun lint        // Run on all apps and packages
bun lint:fix    // Run and fix on all apps and packages
bun lint:app    // Run only on app
bun lint:web    // Run only on web
bun lint:api    // Run only on api
```

You can also run `lint:fix` inside individual packages to fix issues locally.

## New Package Setup

### 1. Install Dependencies

```bash title="Terminal"
bun add --dev eslint @esk/eslint-config
```

### 2. Add or update `eslint.config.js`

Choose the appropriate config based on your project type:

#### Tanstack Start

```jsx title="eslint.config.js"
import { nextJsConfig } from "@repo/eslint-config/tanstack-start";

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
```

### Nextjs

```jsx title="eslint.config.js"
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
```

### Other

Here we are loading 'react-internal'.

```jsx title="eslint.config.js"
import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default config;
```

### 3. Add Lint Scripts to `package.json`

```json title="package.json"
{
  ..
    "scripts": {
    // highlight-next-line
    "lint": "eslint .",
    // highlight-next-line
    "lint:fix": "eslint . --fix"
  },
}
```

### 4. Add Package to Root `package.json`

To enable linting from the root, add a script like this:

```json title="<root>/package.json"
{
  ..
    "scripts": {
    // highlight-next-line
    "lint:<package-name>": "turbo run lint --filter=@repo/<package-name>",
  },
}
```
