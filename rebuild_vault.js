const WORKER_URL = "https://dreambook.f-klavun.workers.dev/dreams";
const PASSWORD = "coco";

import fs from 'fs';

const extracted = JSON.parse(fs.readFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/extracted_dreams.json', 'utf-8'));

async function rebuild() {
    console.log("Fetching existing dreams to delete...");
    const response = await fetch(WORKER_URL, { headers: { "X-API-KEY": PASSWORD } });
    const currentDreams = await response.json();
    
    // We'll just reset the list on the worker if we can, but the worker doesn't have a 'clear' endpoint.
    // So we'll use the worker's DELETE for each one or just POST them and let the user delete duplicates.
    // BETTER: The worker overwrites the whole list on POST/PUT anyway (it gets the list, modifies it, and puts it back).
    
    // Actually, I'll just write a script that sends a single POST with an empty list to clear it, 
    // but the worker doesn't support that (it expects a single dream object).
    
    // I'll use the DELETE route for each dream.
    console.log(`Deleting ${currentDreams.length} existing dreams...`);
    for (const d of currentDreams) {
        await fetch(`${WORKER_URL}/${d.id}`, {
            method: "DELETE",
            headers: { "X-API-KEY": PASSWORD }
        });
    }

    console.log(`Importing ${extracted.length} full dreams...`);
    for (const ext of extracted) {
        const title = ext.originalTitle.length > 50 ? ext.originalTitle.slice(0, 47) + "..." : ext.originalTitle;
        const addResponse = await fetch(WORKER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": PASSWORD
            },
            body: JSON.stringify({
                title: title,
                content: ext.content,
                date: ext.header.match(/\d+\.\d+\.\d+/)?.[0] || new Date().toISOString().split('T')[0],
                isLucid: ext.content.toLowerCase().includes('klarheit') || ext.content.toLowerCase().includes('luzid'),
                sleepHours: 8,
                vividness: 7,
                mood: "Neutral"
            })
        });
        if (addResponse.ok) {
            console.log(`Imported: ${title}`);
        } else {
            console.error(`Failed: ${title}`);
        }
    }
    console.log("Rebuild complete!");
}

rebuild();
