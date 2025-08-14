# @esk/ui

Comprehensive UI component library and utilities for the ESK stack, providing accessible, customizable, and type-safe React components built with Radix UI and Tailwind CSS.

## Features

- **Accessible Components** - Built on Radix UI primitives for WCAG compliance
- **Component Library** - Powered by Shadcn.
- **Tailwind Integration** - Full Tailwind CSS v4 support with custom design system
- **Type Safe** - Complete TypeScript support with exported component types
- **Customizable** - Class Variance Authority for flexible component variants
- **Tree Shakeable** - Individual component imports for optimal bundle size
- **Design System** - Consistent spacing, colors, and typography
- **Dark Mode Ready** - Built-in dark/light theme support

## Quick Start

```bash
# Install the UI package
bun add --dev @esk/ui

# Import global styles in your app
import '@esk/ui/globals.css';
```

```tsx
import { Button } from '@esk/ui/components/button';
import { DropdownMenu } from '@esk/ui/components/dropdown-menu';

function MyApp() {
  return (
    <div>
      <Button variant="primary" size="md">
        Click me
      </Button>

      <DropdownMenu>
        <DropdownMenu.Trigger>Options</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Profile</DropdownMenu.Item>
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}
```
