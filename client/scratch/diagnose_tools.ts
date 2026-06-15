import { createCorsair } from 'corsair';
import { github } from '@corsair-dev/github';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { OpenAIAgentsProvider } from '@corsair-dev/mcp';
import { tool } from '@openai/agents';
import { Pool } from 'pg';
import 'dotenv/config';

async function diagnose() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const corsairClient = createCorsair({
    plugins: [github(), gmail(), googlecalendar()],
    database: pool,
    kek: process.env.CORSAIR_KEK!,
  });

  const provider = new OpenAIAgentsProvider();
  const toolsArray = await provider.build({ corsair: corsairClient, tool });

  console.log("=== MCP TOOLS EXPOSED ===");
  toolsArray.forEach((t: any) => {
    console.log(`Tool Name: ${t.type === 'function' ? t.function.name : t.name}`);
  });
  
  pool.end();
}

diagnose().catch(console.error);
