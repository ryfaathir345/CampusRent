const fs = require('fs');

function removeDarkClasses(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Specifically handle dark:bg-xxx style classes
    const newContent = content.replace(/dark:[a-zA-Z0-9\-\/:]+/g, '');
    
    // Clean up multiple spaces that might have been left behind ON THE SAME LINE
    const cleanedContent = newContent.replace(/className=\"\s+/g, 'className="')
                                     .replace(/\s+\"/g, '"')
                                     .replace(/[^\S\r\n]{2,}/g, ' ');
    
    fs.writeFileSync(filePath, cleanedContent);
    console.log('Cleaned ' + filePath);
}

removeDarkClasses('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/frontend/src/pages/Items.jsx');
removeDarkClasses('c:/Users/Administrator/Documents/MyProject/Peminjaman Mahasiswa/frontend/src/pages/ItemForm.jsx');
