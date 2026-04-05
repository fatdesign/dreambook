import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/Dreambook.pdf');

async function run() {
    try {
        const data = await pdf(dataBuffer);
        console.log("---CONTENT---");
        console.log(data.text);
        console.log("---END---");
    } catch (err) {
        console.error("Extraction error:", err);
    }
}

run();
