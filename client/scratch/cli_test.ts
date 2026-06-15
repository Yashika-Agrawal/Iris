import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { Pool } from 'pg';
import 'dotenv/config';

async function runCliTest() {
  console.log("=== STARTING CORSAIR CLI TEST ===");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const corsairClient = createCorsair({
    plugins: [gmail(), googlecalendar()],
    database: pool,
    kek: process.env.CORSAIR_KEK!,
  });

  try {
    console.log("\\n[1] Testing Gmail API Connectivity...");
    const profile = await corsairClient.gmail.api.users.getProfile({ userId: 'me' });
    console.log("SUCCESS: Connected as", profile.emailAddress);
  } catch (err: any) {
    console.error("FAIL: Gmail API Error:");
    console.error(err.message || err);
  }

  try {
    console.log("\\n[2] Testing Google Calendar Event Creation...");
    const eventParams = {
      calendarId: 'primary',
      event: {
        summary: "CLI Test Event",
        description: "Testing API access from the CLI",
        start: { dateTime: new Date(Date.now() + 1000 * 60 * 60).toISOString() }, // 1 hour from now
        end: { dateTime: new Date(Date.now() + 1000 * 60 * 120).toISOString() }
      }
    };
    const eventResponse = await corsairClient.googlecalendar.api.events.create(eventParams);
    console.log("SUCCESS: Event created! Link:", eventResponse.htmlLink);
  } catch (err: any) {
    console.error("FAIL: Calendar API Error:");
    console.error(err.message || err);
  }

  try {
    console.log("\\n[3] Testing Gmail Email Sending (Base64url)...");
    const to = "friend@corsair.dev";
    const subject = "CLI Test Email";
    const bodyText = "This is a test email sent directly via Corsair SDK from the CLI.";
    
    // Construct the strict RFC 2822 format
    const str = `To: ${to}\r\nSubject: ${subject}\r\n\r\n${bodyText}`;
    
    // Convert to Base64url (important: must replace + and / and remove padding =)
    const rawEncoded = Buffer.from(str)
      .toString('base64')
      .replace(/\\+/g, '-')
      .replace(/\\//g, '_')
      .replace(/=+$/, '');

    const emailResponse = await corsairClient.gmail.api.messages.send({
      userId: 'me',
      raw: rawEncoded
    });
    console.log("SUCCESS: Email sent! Message ID:", emailResponse.id);
  } catch (err: any) {
    console.error("FAIL: Gmail Send Error:");
    console.error(err.message || err);
  }

  console.log("\\n=== TEST COMPLETE ===");
  await pool.end();
}

runCliTest().catch(console.error);
