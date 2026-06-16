import 'dotenv/config';
import { corsair } from '../lib/corsair';

async function run() {
  try {
    const tenantId = 'default_tenant';
    const tenant = corsair.withTenant(tenantId);
    
    const startIso = new Date().toISOString();
    const end = new Date();
    end.setHours(end.getHours() + 1);
    const endIso = end.toISOString();

    try {
      const response = await tenant.googlecalendar.api.events.create({
        calendarId: 'primary',
        event: {
          summary: "Test Create Event 1",
          start: { dateTime: startIso },
          end: { dateTime: endIso }
        }
      });
      console.log("SUCCESS WITH 'event':", response);
    } catch (err: any) {
      console.log("FAILED WITH 'event':", err.response?.data || err.message);
    }

    try {
      const response2 = await tenant.googlecalendar.api.events.create({
        calendarId: 'primary',
        requestBody: {
          summary: "Test Create Event 2",
          start: { dateTime: startIso },
          end: { dateTime: endIso }
        }
      });
      console.log("SUCCESS WITH 'requestBody':", response2);
    } catch (err: any) {
      console.log("FAILED WITH 'requestBody':", err.response?.data || err.message);
    }

    try {
      const response3 = await tenant.googlecalendar.api.events.create({
        calendarId: 'primary',
        summary: "Test Create Event 3",
        start: { dateTime: startIso },
        end: { dateTime: endIso }
      });
      console.log("SUCCESS WITH flat args:", response3);
    } catch (err: any) {
      console.log("FAILED WITH flat args:", err.response?.data || err.message);
    }
    
    process.exit(0);
  } catch(e: any) {
    console.error("ERROR:", e.response?.data || e.message);
    process.exit(1);
  }
}
run();
