const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('c:/Users/Limitless/.gemini/antigravity/scratch/dream-vault/Dreambook.pdf');

pdf(dataBuffer).then(function(data) {
    console.log("---BEGIN DUMP---");
    console.log(data.text);
    console.log("---END DUMP---");
}).catch(err => {
    console.error(err);
});
