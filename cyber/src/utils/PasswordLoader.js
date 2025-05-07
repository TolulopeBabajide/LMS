const fs = require('fs').promises;
const path = require('path');

async function loadCommonPasswords() {
    try {
        // Load from multiple sources
        const [commonPasswords, leakedPasswords, dictionaryWords] = await Promise.all([
            loadFile('common-passwords.txt'),
            loadFile('leaked-passwords.txt'),
            loadFile('dictionary.txt')
        ]);

        // Combine and deduplicate passwords
        const allPasswords = new Set([
            ...commonPasswords,
            ...leakedPasswords,
            ...dictionaryWords
        ]);

        return Array.from(allPasswords);
    } catch (error) {
        console.error('Error loading passwords:', error);
        return getDefaultPasswords();
    }
}

async function loadFile(filename) {
    try {
        const filePath = path.join(__dirname, '../../data', filename);
        const content = await fs.readFile(filePath, 'utf8');
        return content.split('\n').filter(line => line.trim());
    } catch (error) {
        console.warn(`Warning: Could not load ${filename}:`, error.message);
        return [];
    }
}

function getDefaultPasswords() {
    return [
        'password',
        'admin123',
        '123456',
        'qwerty',
        'welcome',
        'letmein',
        'password123',
        'admin',
        'test123',
        '12345678'
    ];
}

module.exports = { loadCommonPasswords }; 