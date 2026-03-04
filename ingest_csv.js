/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    // Manual CSV parsing to handle quotes and newlines within fields if any
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                if (inQuotes && line[j + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    j++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                parts.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current);
        rows.push(parts);
    }

    const cleanStr = (s) => (s || '').trim();

    return rows.map(parts => {
        let tags_theme = [];
        let tags_filtre = [];

        try {
            // Parts 6 and 7 are tags_theme and tags_filtre
            // They look like: ["item1","item2"]
            if (parts[6]) tags_theme = JSON.parse(parts[6]);
            if (parts[7]) tags_filtre = JSON.parse(parts[7]);
        } catch {
            // Fallback: split by comma if not valid JSON
            tags_theme = parts[6] ? parts[6].replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()) : [];
            tags_filtre = parts[7] ? parts[7].replace(/[\[\]"]+/g, '').split(',').map(s => s.trim()) : [];
        }

        return {
            id: cleanStr(parts[0]),
            niveau: parseInt(cleanStr(parts[1])) || 1,
            dimension: cleanStr(parts[2]).toUpperCase(),
            question: cleanStr(parts[3]),
            objectif: cleanStr(parts[4]),
            tip: cleanStr(parts[5]),
            tags_theme: tags_theme,
            tags_filtre: tags_filtre
        };
    });
}

const data = parseCSV('pedagogical_content_rows.csv');
const outputDir = path.join('src', 'data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

fs.writeFileSync(
    path.join(outputDir, 'pedagogical_content.json'),
    JSON.stringify(data, null, 2)
);

console.log(`Successfully converted ${data.length} rows.`);

// Also generate a seed script for Supabase
const sql = data.map(row => {
    const q = (s) => `'${(s || '').replace(/'/g, "''")}'`;
    const arr = (a) => `ARRAY[${a.map(q).join(',')}]`;
    return `('${row.id}', ${row.niveau}, ${q(row.dimension)}, ${q(row.question)}, ${q(row.objectif)}, ${q(row.tip)}, ${arr(row.tags_theme)}, ${arr(row.tags_filtre)})`;
}).join(',\n');

const fullSql = `INSERT INTO pedagogical_content (id, niveau, dimension, question, objectif, tip, tags_theme, tags_filtre)
VALUES
${sql}
ON CONFLICT (id) DO UPDATE SET
  niveau = EXCLUDED.niveau,
  dimension = EXCLUDED.dimension,
  question = EXCLUDED.question,
  objectif = EXCLUDED.objectif,
  tip = EXCLUDED.tip,
  tags_theme = EXCLUDED.tags_theme,
  tags_filtre = EXCLUDED.tags_filtre;`;

fs.writeFileSync('supabase/seed_content.sql', fullSql);
console.log('Seed SQL generated at supabase/seed_content.sql');
