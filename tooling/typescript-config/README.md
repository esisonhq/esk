# @esk/typescript-config

This package bundles Typescript and its dependencies, making it easy to integrate type safety across your applications.

## About Typescript

TypeScript is a superset of JavaScript that adds static typing, enabling developers to catch errors early and write more robust, maintainable code. It’s preferred over regular JavaScript for larger projects or teams because it improves code quality, enhances editor support (like autocompletion and refactoring), and helps prevent runtime bugs through compile-time checks.

## How to Use

Type safety will work automatically in the background of your IDE. To manually check for type issues across your project, run:

```bash title="Terminal"
bun check-types
```

## New Package Setup

### 1. Install Dependencies

```bash title="Terminal"
bun add --dev @esk/typescript-config
```

### 2. Add or update `tsconfig.json`

Choose the appropriate base config based on your project type:

#### Tanstack Start

```json title="tsconfig.json"
{
  "extends": "@repo/typescript-config/tanstack-start.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### Nextjs

```json title="tsconfig.json"
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Other

```json title="tsconfig.json"
{
  "extends": "@repo/typescript-config/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

:::info
Using absolute paths like `@/` in your `tsconfig.json` can greatly improve code readability and maintainability by avoiding long relative imports like `../../../components/Button`. However, it's important to note that **not all bundlers or tooling environments support these path aliases out of the box**.

For example:

- **Vite** requires additional configuration in `vite.config.ts` using the `resolve.alias` field.
- **Webpack** needs alias setup in `webpack.config.js` under `resolve.alias`.
- **Jest** (for testing) also needs matching path mappings in its configuration (`moduleNameMapper`).
- **ESLint** may require plugin support to correctly resolve aliases during linting.

If these aliases aren't properly configured across all tools, you might encounter errors like:

- “Module not found”
- “Cannot resolve symbol”
- Or even silent failures in type checking or linting

:::

### 3. Update `package.json`

```json title="package.json"
{
  ..
    "scripts": {
    // highlight-next-line
    "check-types": "tsc --noEmit"
  },
}
```
