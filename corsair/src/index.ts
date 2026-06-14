import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { corsairIntegrations, corsairAccounts, corsairEntities, corsairEvents } from './server/db/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  // Creating a new integration
  const newIntegration: typeof corsairIntegrations.$inferInsert = {
    id: 'test-integration-123',
    name: 'My First Integration',
    config: { test: true }, // jsonb data
  };

  await db.insert(corsairIntegrations).values(newIntegration);
  console.log('New integration created!')

  // Getting all integrations
  const integrations = await db.select().from(corsairIntegrations);
  console.log('Getting all integrations from the database: ', integrations)

  // Updating the integration
  await db
    .update(corsairIntegrations)
    .set({
      name: 'Updated Integration Name',
    })
    .where(eq(corsairIntegrations.id, newIntegration.id));
  console.log('Integration info updated!')

  // Deleting the integration
  await db.delete(corsairIntegrations).where(eq(corsairIntegrations.id, newIntegration.id));
  console.log('Integration deleted!')
}

main();
