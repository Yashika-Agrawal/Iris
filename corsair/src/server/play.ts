import 'dotenv/config';
import { corsair } from './corsair.ts';

// We put it in a function so we can use async/await cleanly
async function run() {
    try {
        // 1. Await the result cleanly (no .then() needed)
        const repos = await corsair.github.api.repositories.list({
            owner: 'Yashika-Agrawal',
            type: 'owner',
        });
        
        // 2. Map the result to get just names
        const names = repos.map(repo => repo.name);
        console.log("My Repos:", names);

    } catch (error) {
        console.error("Oops, something broke:", error);
    }

    process.exit(0); 
}

run();
