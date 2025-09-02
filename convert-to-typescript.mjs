#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import globPkg from 'glob';

const JS_FILES = globPkg.sync('src/**/*.js', {
    ignore: ['node_modules/**', 'dist/**', 'test/**']
});

console.log(`Found ${JS_FILES.length} JavaScript files to convert to TypeScript`);

function convertToTypeScript(jsFile) {
    const tsFile = jsFile.replace(/\.js$/, '.ts');
    let code = fs.readFileSync(jsFile, 'utf8');
    
    // Basic TypeScript conversions
    
    // Add type annotations for common patterns
    code = code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, (match, name, params) => {
        return `function ${name}(${params}): any {`;
    });
    
    // Convert var to let/const where appropriate
    code = code.replace(/^var\s+(\w+)\s*=/gm, 'let $1 =');
    code = code.replace(/^var\s+(\w+)\s*,/gm, 'let $1,');
    
    // Add basic type annotations for commonly typed variables
    code = code.replace(/let\s+(\w+)\s*=\s*null;/g, 'let $1: any = null;');
    code = code.replace(/let\s+(\w+)\s*=\s*\[\];/g, 'let $1: any[] = [];');
    code = code.replace(/let\s+(\w+)\s*=\s*\{\};/g, 'let $1: any = {};');
    code = code.replace(/let\s+(\w+)\s*=\s*new\s+Map\(\);/g, 'let $1: Map<any, any> = new Map();');
    code = code.replace(/let\s+(\w+)\s*=\s*new\s+Set\(\);/g, 'let $1: Set<any> = new Set();');
    
    // Add return types for simple functions
    code = code.replace(/(\w+):\s*function\s*\(([^)]*)\)\s*\{/g, '$1: ($2) => any {');
    
    // Fix prototype assignments with type annotations
    code = code.replace(/(\w+)\.prototype\.(\w+)\s*=\s*function\s*\(([^)]*)\)\s*\{/g, 
        '$1.prototype.$2 = function($3): any {');
    
    // Add type to class constructors
    code = code.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*\{/g, 
        'function $1($2): $1 {');
    
    // Basic DOM type fixes
    code = code.replace(/document\.createElement/g, 'document.createElement');
    code = code.replace(/document\.createTextNode/g, 'document.createTextNode');
    code = code.replace(/document\.createDocumentFragment/g, 'document.createDocumentFragment');
    
    return { tsFile, code };
}

async function convertAllFiles() {
    let convertedCount = 0;
    
    for (const jsFile of JS_FILES) {
        console.log(`Converting ${jsFile}...`);
        
        try {
            const { tsFile, code } = convertToTypeScript(jsFile);
            
            // Write the TypeScript file
            await fs.writeFile(tsFile, code, 'utf8');
            
            // Remove the JavaScript file
            await fs.unlink(jsFile);
            
            console.log(`  ✓ Converted to ${tsFile}`);
            convertedCount++;
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }
    
    console.log(`\n=== Conversion Summary ===`);
    console.log(`Converted ${convertedCount} out of ${JS_FILES.length} files`);
    
    // Update the index.mjs to index.ts
    if (await fs.pathExists('src/index.mjs')) {
        await fs.move('src/index.mjs', 'src/index.ts');
        console.log('✓ Renamed src/index.mjs to src/index.ts');
    }
}

convertAllFiles().catch(console.error);