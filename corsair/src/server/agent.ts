import 'dotenv/config'
import {query} from '@anthropic-ai/claude-agent-sdk';

async function main (){
    for await (const response of query({
        prompt:"Hey, agent, can you list all my repositories?"
    })){
        if (response.type==="result" && response.subtype==="success"){
            console.log(`Response: ${response.result}`)
        }
    }
}