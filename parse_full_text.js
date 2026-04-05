import fs from 'fs';

const text = fs.readFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/full_text_utf8.txt', 'utf-8');

// Combine patterns for headers:
// 1. # followed by digit
// 2. Dates like DD.MM.YYYY or DD.MM.YY
// 3. Weekdays followed by dates
const patterns = [
    /\n#\s*\d+/,
    /\n\d{1,2}\.\d{1,2}\.(?:\d{4}|\d{2})/,
    /\n(?:Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag)\s+\d{1,2}\.\d{1,2}\.(?:\d{4}|\d{2})/i
];

const combinedPattern = new RegExp('(' + patterns.map(p => p.source).join('|') + ')', 'g');

const chunks = text.split(combinedPattern);
const dreams = [];

// Chunks will alternative between Header and Content
for (let i = 1; i < chunks.length; i += 2) {
    const header = chunks[i].trim();
    const contentRaw = chunks[i+1]?.trim() || "";
    
    // Clean content
    const content = contentRaw.replace(/\s+/g, ' ').trim();
    if (content.length < 50) continue;

    dreams.push({
        header,
        content
    });
}

// Map them to titles and IDs
const final = dreams.map((d, index) => {
    // Try to find a title in the first few words of content
    const words = d.content.split(' ');
    let title = "Traum #" + (index + 1);
    
    // Look for common patterns for titles in the first 50 chars
    // (In your PDF, titles are often explicitly named like "Burgfeier")
    const titleMatch = d.content.slice(0, 100).match(/(TITEL|TITLE|Name):\s*([^.]+)/i) || 
                       d.content.slice(0, 100).match(/([A-Z]{3,}[^.,]+)/); // Uppercase words
    
    if (titleMatch) title = titleMatch[0].trim();

    return {
        header: d.header,
        originalTitle: title,
        content: d.content
    };
});

fs.writeFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/extracted_dreams.json', JSON.stringify(final, null, 2));
console.log(`Extracted ${final.length} dream blocks.`);
