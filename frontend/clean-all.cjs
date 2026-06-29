const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Specifically handle dark:bg-xxx style classes
    let newContent = content.replace(/dark:[a-zA-Z0-9\-\/:]+/g, '');
    
    // Clean up multiple spaces that might have been left behind ON THE SAME LINE
    let cleanedContent = newContent.replace(/className=\"\s+/g, 'className="')
                                     .replace(/\s+\"/g, '"')
                                     .replace(/[^\S\r\n]{2,}/g, ' ');
    
    if (content !== cleanedContent) {
        fs.writeFileSync(filePath, cleanedContent);
        console.log('Cleaned ' + filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            cleanFile(fullPath);
        }
    }
}

walkDir('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/frontend/src');
console.log('Done cleaning all JSX files');
