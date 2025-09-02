#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import globPkg from 'glob';

const LIVESCRIPT_FILES = globPkg.sync('**/*.ls', { 
    ignore: ['node_modules/**', 'dist/**', 'coverage/**', 'website/**'] 
});

console.log(`Found ${LIVESCRIPT_FILES.length} LiveScript files to convert`);

// Function to convert LiveScript to JavaScript using lsc compiler
function convertLivescriptToJs(lsFile) {
    const jsFile = lsFile.replace(/\.ls$/, '.js');
    
    try {
        // Use lsc to compile LiveScript to JavaScript with ESM
        const cmd = `npx lsc -bc --no-header -p "${lsFile}"`;
        const jsCode = execSync(cmd, { encoding: 'utf8' });
        
        // Clean up the generated JavaScript
        let cleanedCode = jsCode;
        
        // Fix import statements - ensure proper ES module syntax
        cleanedCode = cleanedCode.replace(/^import\s*$/gm, '');
        
        // Fix export statements
        cleanedCode = cleanedCode.replace(/^export\s*$/gm, '');
        
        // Ensure imports have proper syntax
        cleanedCode = cleanedCode.replace(/import\s+(\{[^}]+\})\s+from\s+'([^']+)'/g, (match, imports, module) => {
            // Add .js extension if importing local file
            if (module.startsWith('./') || module.startsWith('../')) {
                const hasExtension = /\.\w+$/.test(module);
                if (!hasExtension) {
                    return `import ${imports} from '${module}.js'`;
                }
            }
            return match;
        });
        
        // Fix default imports/exports
        cleanedCode = cleanedCode.replace(/import\s+(\w+)\s+from\s+'([^']+)'/g, (match, name, module) => {
            if (module.startsWith('./') || module.startsWith('../')) {
                const hasExtension = /\.\w+$/.test(module);
                if (!hasExtension) {
                    return `import ${name} from '${module}.js'`;
                }
            }
            return match;
        });
        
        // Ensure proper semicolons
        cleanedCode = cleanedCode.replace(/^(import\s+.+)$/gm, '$1;');
        cleanedCode = cleanedCode.replace(/^(export\s+.+)$/gm, '$1;');
        
        return { jsFile, jsCode: cleanedCode };
    } catch (error) {
        console.error(`Error converting ${lsFile}:`, error.message);
        throw error;
    }
}

// Function to update import paths in a JavaScript file
function updateImportPaths(jsCode, filePath) {
    // Update imports to reference .js files instead of .ls
    return jsCode.replace(
        /from\s+['"](\.\.?\/[^'"]+)\.ls['"]/g, 
        "from '$1.js'"
    );
}

// Main migration process
async function migrate() {
    const results = {
        success: [],
        failed: []
    };
    
    for (const lsFile of LIVESCRIPT_FILES) {
        console.log(`Converting ${lsFile}...`);
        
        try {
            const { jsFile, jsCode } = convertLivescriptToJs(lsFile);
            const updatedCode = updateImportPaths(jsCode, jsFile);
            
            // Write the JavaScript file
            await fs.writeFile(jsFile, updatedCode, 'utf8');
            
            // Delete the original LiveScript file
            await fs.unlink(lsFile);
            
            results.success.push(lsFile);
            console.log(`  ✓ Converted to ${jsFile}`);
        } catch (error) {
            results.failed.push({ file: lsFile, error: error.message });
            console.error(`  ✗ Failed: ${error.message}`);
        }
    }
    
    // Summary
    console.log('\n=== Migration Summary ===');
    console.log(`Successfully converted: ${results.success.length} files`);
    if (results.failed.length > 0) {
        console.log(`Failed: ${results.failed.length} files`);
        results.failed.forEach(({ file, error }) => {
            console.log(`  - ${file}: ${error}`);
        });
    }
    
    return results;
}

// Run migration
migrate().catch(console.error);