# @esk/db

Provider-agnostic database layer with automatic replica routing, health monitoring, and seamless integration across the ESK stack.

## Features

- **Provider Abstraction** - Switch between Supabase, Neon, or PostgreSQL without code changes
- **Regional Replicas** - Automatic read replica selection based on geographic regions
- **Health Monitoring** - Built-in database health checks and monitoring endpoints
- **Zero Configuration** - Works out-of-the-box with sensible defaults
- **Type Safe** - Full TypeScript support with Drizzle ORM
- **Connection Pooling** - Optimized connection management per provider

## Quick Start

```bash
# Environment setup
DATABASE_PRIMARY_URL=postgresql://user:pass@host:5432/db
DATABASE_REPLICAS=postgresql://replica1:5432/db,postgresql://replica2:5432/db
DATABASE_REGIONS=us-east,eu-west
DATABASE_REGION=us-east
```

```typescript
import { connectDb } from '@esk/db/client';
import { users } from '@esk/db/schema';

const db = await connectDb();

// Reads use replicas automatically
const allUsers = await db.select().from(users);

// Writes use primary automatically
const newUser = await db
  .insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
  })
  .returning();
```

## Supported Providers

| Provider       | Auto-Detection  | Regions        | Features                 |
| -------------- | --------------- | -------------- | ------------------------ |
| **Supabase**   | `*.supabase.co` | Fly.io regions | Pooler, SSL optimization |
| **Neon**       | `*.neon.tech`   | AWS regions    | Serverless, autoscaling  |
| **PostgreSQL** | Generic         | Custom         | Universal compatibility  |

## Health Monitoring

```bash
# Quick health check
npm run health:check

# HTTP endpoint
curl http://localhost:3000/api/v1/health
```

## Documentation

TODO Update Links

- **[Introduction](src/docs/intro.md)** - Complete overview and setup guide
- **[Health Monitoring](src/docs/health.md)** - Database health checks and monitoring
- **[Region Configuration](src/docs/region.md)** - Read replica setup and optimization
- **[Usage Examples](src/docs/examples.md)** - Real-world usage patterns
- **[Migration Guide](src/docs/migration.md)** - Migrating from other database setups
- **[Troubleshooting](src/docs/troubleshooting.md)** - Common issues and solutions

## ESK Stack Integration

This package is designed for the ESK stack but works standalone:

```typescript
// In your Hono API (apps/api)
import { connectDb } from '@esk/db/client';

const db = await connectDb();
app.get('/users', async (c) => {
  const users = await db.select().from(userTable);
  return c.json(users);
});

// In your React app (apps/app)
// Database operations via API calls
const users = await fetch('/api/users').then((r) => r.json());
```

## Commands

```bash
npm run health:check    # Database health check
npm run health:monitor  # Continuous monitoring
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate migration files
```

## License

MIT
