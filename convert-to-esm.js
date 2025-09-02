#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const livescript = require('livescript');
const lexer = require('livescript/lib/lexer');
const Compiler = require('livescript-compiler/lib/livescript/Compiler');
const transformESM = require('livescript-transform-esm/lib/plugin');

// Setup compiler with ESM transform
livescript.lexer = lexer;
const compiler = Compiler.__default__.create({ livescript: livescript });
transformESM.__default__.install(compiler, {});

const lsFiles = glob.sync('**/*.ls', {
    ignore: ['node_modules/**', 'dist/**', 'coverage/**', 'website/**']
});

console.log(`Found ${lsFiles.length} LiveScript files to convert`);

function convertToESM(lsFile) {
    const jsFile = lsFile.replace(/\.ls$/, '.js');
    
    try {
        const lsCode = fs.readFileSync(lsFile, 'utf8');
        
        // Compile with ESM transform
        const options = {
            bare: true,
            header: false,
            const: false,
            json: false,
            warn: true,
            map: false,
            filename: lsFile,
            outputFilename: jsFile
        };
        
        const output = compiler.compile(lsCode, options);
        let jsCode = typeof output === 'string' ? output : output.code;
        
        if (!jsCode) {
            throw new Error('Failed to compile LiveScript code');
        }
        
        // Post-process to ensure proper ES module syntax
        
        // Fix imports - add .js extension to local imports
        jsCode = jsCode.replace(/import\s+(\{[^}]+\}|\w+)\s+from\s+['"]([^'"]+)['"]/g, (match, imports, module) => {
            if (module.startsWith('./') || module.startsWith('../')) {
                if (!module.endsWith('.js') && !module.endsWith('.mjs') && !module.includes('.')) {
                    return match.replace(module, module + '.js');
                }
            }
            return match;
        });
        
        // Fix export class syntax
        jsCode = jsCode.replace(/export var (\w+);[\s\n]+\1 = class extends/g, 'export class $1 extends');
        jsCode = jsCode.replace(/export var (\w+);[\s\n]+\1 = class \{/g, 'export class $1 {');
        
        // Fix export default
        jsCode = jsCode.replace(/export var (\w+);[\s\n]+\1 = /g, 'export const $1 = ');
        
        // Clean up any remaining var declarations that should be const/let
        jsCode = jsCode.replace(/^var (\w+) = /gm, 'const $1 = ');
        
        // Remove any CommonJS remnants
        jsCode = jsCode.replace(/module\.exports = .+;?$/gm, '');
        jsCode = jsCode.replace(/exports\.\w+ = .+;?$/gm, '');
        
        return { jsFile, jsCode };
    } catch (error) {
        console.error(`Error converting ${lsFile}:`, error.message);
        throw error;
    }
}

// Process all files
let successCount = 0;
let failCount = 0;

for (const lsFile of lsFiles) {
    console.log(`Converting ${lsFile}...`);
    
    try {
        const { jsFile, jsCode } = convertToESM(lsFile);
        
        // Write the JavaScript file
        fs.writeFileSync(jsFile, jsCode, 'utf8');
        
        // Remove the LiveScript file
        fs.unlinkSync(lsFile);
        
        console.log(`  ✓ Converted to ${jsFile}`);
        successCount++;
    } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        failCount++;
    }
}

console.log('\n=== Conversion Summary ===');
console.log(`Successfully converted: ${successCount} files`);
if (failCount > 0) {
    console.log(`Failed: ${failCount} files`);
}

// Update package.json to remove LiveScript configuration
if (successCount > 0) {
    console.log('\nUpdating package.json...');
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update mocha configuration
    if (packageJson.mocha && packageJson.mocha.require === 'livescript') {
        delete packageJson.mocha.require;
        packageJson.mocha.file = packageJson.mocha.file.replace(/\.ls$/, '.js');
    }
    
    // Update scripts
    if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(key => {
            packageJson.scripts[key] = packageJson.scripts[key]
                .replace(/\.ls\b/g, '.js')
                .replace(/lsc\s+-bc\s+--no-header\s+-p\s+/g, 'node ');
        });
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log('  ✓ Updated package.json');
}