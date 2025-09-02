#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import globPkg from 'glob';

// Only rename specific files to .ts for gradual migration
const FILES_TO_MIGRATE = [
  'src/index.mjs',
  'src/symbols.js',
  'src/documentclasses/index.js',
  'src/packages/index.js'
];

console.log('Starting gradual TypeScript migration...');

async function renameToTypeScript() {
  // Rename index.mjs to index.ts
  if (await fs.pathExists('src/index.mjs')) {
    let content = await fs.readFile('src/index.mjs', 'utf8');
    
    // Add type exports
    content = content.replace(
      "export {",
      "// Export types\nexport * from './types';\n\nexport {"
    );
    
    await fs.writeFile('src/index.ts', content, 'utf8');
    await fs.unlink('src/index.mjs');
    console.log('✓ Converted src/index.mjs to src/index.ts');
  }

  // Create simple index files as TypeScript
  const indexFiles = [
    'src/documentclasses/index.js',
    'src/packages/index.js'
  ];

  for (const file of indexFiles) {
    if (await fs.pathExists(file)) {
      const tsFile = file.replace(/\.js$/, '.ts');
      await fs.move(file, tsFile);
      console.log(`✓ Renamed ${file} to ${tsFile}`);
    }
  }

  // Convert symbols.js to .ts with proper types
  if (await fs.pathExists('src/symbols.js')) {
    let content = await fs.readFile('src/symbols.js', 'utf8');
    
    // Add proper type annotations
    content = content.replace(/^import he from 'he';/m, `import he from 'he';

// Type definitions
export type Ligature = string;
export type Diacritic = [string, string]; // [combining, standalone]
export type Symbol = string;`);

    content = content.replace(/^var ligatures,diacritics,symbols;/m, '');
    content = content.replace(/^export \{ ligatures \}/m, 'export const ligatures: Map<string, Ligature>');
    content = content.replace(/^export \{ diacritics \}/m, 'export const diacritics: Map<string, Diacritic>');
    content = content.replace(/^export \{ symbols \}/m, 'export const symbols: Map<string, Symbol>');
    
    await fs.writeFile('src/symbols.ts', content, 'utf8');
    await fs.unlink('src/symbols.js');
    console.log('✓ Converted src/symbols.js to src/symbols.ts with types');
  }
}

renameToTypeScript().catch(console.error);