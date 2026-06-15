import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createCorsair } from 'corsair';
import { setupCorsair } from 'corsair/setup';
import { github } from '@corsair-dev/github';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export const corsair = createCorsair({
    plugins: [
      github(), 
      gmail({ topicId: process.env.GOOGLE_PUBSUB_TOPIC }), 
      googlecalendar()
    ],
    database: pool,
    kek: process.env.CORSAIR_KEK!,
    multiTenancy: true,
});

export async function ensureIntegrationsExist() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  if (!googleClientId || !googleClientSecret) {
    console.warn('Google Client ID or Client Secret not set in environment variables. Skipping setupCorsair.');
    return;
  }

  try {
    await setupCorsair(corsair, {
      credentials: {
        gmail: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
        },
        googlecalendar: {
          client_id: googleClientId,
          client_secret: googleClientSecret,
        }
      }
    });
    console.log('Successfully set up Corsair integrations using setupCorsair.');
  } catch (e) {
    console.error('Failed to run setupCorsair:', e);
  }
}

ensureIntegrationsExist().catch(console.error);

