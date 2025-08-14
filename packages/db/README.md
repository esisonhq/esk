# @esk/db

The Database package provides a powerful, provider-agnostic database layer with built-in replica support, health monitoring, and seamless integration with popular PostgreSQL providers.

## Key Features

- **Provider Abstraction**: Switch between Supabase, Neon, Railway, or generic PostgreSQL without code changes
- **Automatic Region Selection**: Intelligent replica routing based on geographic regions
- **Health Monitoring**: Comprehensive database health checks and monitoring endpoints
- **Connection Pooling**: Optimized connection management with configurable pool settings
- **Type Safety**: Full TypeScript support with Drizzle ORM integration
- **Zero Configuration**: Works out-of-the-box with sensible defaults

## Quick Start

### 1. Environment Setup

Create your `.env` file with the minimum required configuration:

```env
# Required - your primary database
DATABASE_PRIMARY_URL=postgresql://user:pass@host:5432/dbname

# Optional - connection pooler (recommended for production)
DATABASE_PRIMARY_POOLER_URL=postgresql://user:pass@host:6543/dbname

# Optional - read replicas for better performance
DATABASE_REPLICAS=postgresql://user:pass@replica1:5432/dbname,postgresql://user:pass@replica2:5432/dbname
DATABASE_REGIONS=us-east,eu-west
DATABASE_REGION=us-east # Auto-detected - specify manually if needed
```

### 2. Basic Usage

```tsx
import { connectDb } from '@esk/db/client';
import { users } from '@esk/db/schema';

// Get a database connection
const db = await connectDb();

// Query data (automatically routed to replicas for reads)
const allUsers = await db.select().from(users);

// Write data (always goes to primary)
const newUser = await db
  .insert(users)
  .values({
    name: 'John Doe',
    email: 'john@example.com',
  })
  .returning();
```

### 3. Health Monitoring

```tsx
import { checkDatabaseHealth } from '@esk/db/utils/health';

const db = await connectDb();
const health = await checkDatabaseHealth(db);

console.log(`Database is ${health.status}`);
console.log(`Response time: ${health.latency}ms`);
```

See [Health Monitoring](./health.md) to learn more about database health checks and monitoring.

## Supported Providers

Supports any PostgreSQL provider. You can even mix them for replication.

- Supabase
- Neon
- PlanetScale
- Railway
- Render
- Custom

## Configuration Options

### Environment Variables

| Variable                      | Required | Description                         |
| ----------------------------- | -------- | ----------------------------------- |
| `DATABASE_PRIMARY_URL`        | ✅       | Primary database connection string  |
| `DATABASE_PRIMARY_POOLER_URL` | ❌       | Connection pooler URL (recommended) |
| `DATABASE_REPLICAS`           | ❌       | Comma-separated replica URLs        |
| `DATABASE_REGIONS`            | ❌       | Comma-separated region names        |
| `DATABASE_REGION`             | ❌       | Override auto-detection             |

### Provider Settings

Each provider comes with optimized connection settings:

```tsx title="utils/providers.ts"
// Automatically configured based on provider
const poolConfig = {
  max: 10, // Maximum connections
  idle_timeout: 20, // Idle timeout in seconds
  connect_timeout: 10, // Connection timeout
  ssl: true, // SSL configuration
};
```

### Replica and Region Detection

The system automatically tries to set the `DATABASE_REGION` environment variable by checking certain the presence of other environmental variables.

See [Region Configuration](./region.md) to set up read replicas for better performance.
