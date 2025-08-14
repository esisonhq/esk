# @esk/utils

Essential utilities for the ESK stack providing type-safe environment validation, shared helpers, and cross-package functionality.

## Quick Start

```bash
# Environment setup (.env file)
NODE_ENV=development
PORT=3000
DATABASE_PRIMARY_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-secret-key
RESEND_API_KEY=your-resend-key
```

```typescript
import { env } from '@esk/utils/env';

// Type-safe access to validated environment variables
console.log(env.PORT); // number: 3000
console.log(env.NODE_ENV); // string: 'development'
console.log(env.DATABASE_PRIMARY_URL); // string (validated URL)

// Optional variables are properly typed
if (env.GITHUB_CLIENT_ID) {
  // TypeScript knows this is string, not string | undefined
  setupGithubAuth(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET!);
}
```
