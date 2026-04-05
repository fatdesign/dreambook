const WORKER_URL = "https://dreambook.f-klavun.workers.dev/dreams";
const PASSWORD = "coco";

import fs from 'fs';

const extracted = JSON.parse(fs.readFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/extracted_dreams.json', 'utf-8'));

async function restore() {
    console.log("Fetching existing dreams...");
    const response = await fetch(WORKER_URL, {
        headers: { "X-API-KEY": PASSWORD }
    });
    const currentDreams = await response.json();
    console.log(`Found ${currentDreams.length} dreams in Vault.`);

    for (const ext of extracted) {
        const match = currentDreams.find(d => {
            const titleMatch = d.title.toLowerCase().includes(ext.originalTitle.toLowerCase()) || 
                               ext.originalTitle.toLowerCase().includes(d.title.toLowerCase());
            const contentMatch = ext.content.toLowerCase().includes(d.content.toLowerCase().slice(0, 10)) ||
                                 d.content.toLowerCase().includes(ext.content.toLowerCase().slice(0, 10));
            return titleMatch || contentMatch;
        });

        if (match) {
            console.log(`Updating: "${match.title}"...`);
            const updateResponse = await fetch(`${WORKER_URL}/${match.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": PASSWORD
                },
                body: JSON.stringify({
                    ...match,
                    content: ext.content
                })
            });
            if (updateResponse.ok) {
                console.log(`Success: ${match.title}`);
            } else {
                const text = await updateResponse.text();
                console.error(`Error ${updateResponse.status} for "${match.title}": ${text}`);
            }
        }
    }
}

restore();
