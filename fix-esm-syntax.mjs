#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import globPkg from 'glob';

const JS_FILES = globPkg.sync('**/*.js', { 
    ignore: ['node_modules/**', 'dist/**', 'coverage/**', 'website/**', 'bin/**', 'lib/**'] 
});

console.log(`Found ${JS_FILES.length} JavaScript files to fix`);

function fixESMSyntax(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Store original code for comparison
    const originalCode = code;
    
    // Remove CommonJS-style exports
    code = code.replace(/var .+out\$ = typeof exports != 'undefined' && exports \|\| this.+;/g, '');
    code = code.replace(/out\$\.([\w]+) = ([\w]+) = /g, 'export class $2 ');
    code = code.replace(/out\$\.([\w]+) = ([\w]+);/g, 'export { $2 as $1 };');
    
    // Fix imports
    // Convert this['module'] patterns to proper imports
    const importMatches = code.matchAll(/this\['([^']+)'\] = \{([^}]+)\};/g);
    const imports = [];
    for (const match of importMatches) {
        const module = match[1];
        const items = match[2];
        const cleanItems = items.replace(/\s+/g, ' ').trim();
        if (cleanItems) {
            const importItems = cleanItems.split(',').map(item => {
                const [name, alias] = item.split(':').map(s => s.trim());
                return alias ? `${alias} as ${name}` : name;
            }).join(', ');
            
            // Add .js extension to local imports
            let modulePath = module;
            if (module.startsWith('./') || module.startsWith('../')) {
                if (!module.endsWith('.js') && !module.endsWith('.mjs') && !module.includes('.')) {
                    modulePath = module + '.js';
                }
            }
            imports.push(`import { ${importItems} } from '${modulePath}';`);
        }
    }
    
    // Remove the this['module'] assignments
    code = code.replace(/this\['[^']+'\] = \{[^}]+\};?\n?/g, '');
    
    // Add imports at the top
    if (imports.length > 0) {
        code = imports.join('\n') + '\n\n' + code;
    }
    
    // Fix class exports
    code = code.replace(/(\w+) = \(function\(\)\{/g, 'export class $1 {');
    code = code.replace(/return \w+;\s*\}\(\)\);?/g, '}');
    
    // Fix prototype definitions inside class
    code = code.replace(/(\w+)\.prototype\.(\w+) = /g, '  $2 = ');
    code = code.replace(/(\w+)\.displayName = '[^']+';/g, '');
    
    // Fix constructor functions
    code = code.replace(/var .+ prototype = (\w+)\.prototype, constructor = \1;/g, '');
    
    // Fix function definitions
    code = code.replace(/function (\w+)\(/g, '$1(');
    
    // Remove slice$ and arrayFrom$ helpers if unused
    if (!code.includes('slice$') && code.includes('slice$ =')) {
        code = code.replace(/, slice\$ = \[\]\.slice/g, '');
    }
    if (!code.includes('arrayFrom$') && code.includes('arrayFrom$ =')) {
        code = code.replace(/, arrayFrom\$ = Array\.from \|\| function\(x\)\{return slice\$\.call\(x\);\}/g, '');
    }
    
    // Fix export statements  
    code = code.replace(/module\.exports = (\w+);?/g, 'export default $1;');
    code = code.replace(/exports\.(\w+) = (\w+);?/g, 'export { $2 as $1 };');
    
    // Fix require statements
    code = code.replace(/const (\w+) = require\(['"]([^'"]+)['"]\);?/g, (match, varName, module) => {
        let modulePath = module;
        if (module.startsWith('./') || module.startsWith('../')) {
            if (!module.endsWith('.js') && !module.endsWith('.mjs') && !module.includes('.')) {
                modulePath = module + '.js';
            }
        }
        return `import ${varName} from '${modulePath}';`;
    });
    
    code = code.replace(/const \{([^}]+)\} = require\(['"]([^'"]+)['"]\);?/g, (match, items, module) => {
        let modulePath = module;
        if (module.startsWith('./') || module.startsWith('../')) {
            if (!module.endsWith('.js') && !module.endsWith('.mjs') && !module.includes('.')) {
                modulePath = module + '.js';
            }
        }
        return `import { ${items} } from '${modulePath}';`;
    });
    
    // Clean up empty lines
    code = code.replace(/\n{3,}/g, '\n\n');
    
    // Remove trailing semicolons from class definitions
    code = code.replace(/^}\);?\s*$/gm, '}');
    
    if (code !== originalCode) {
        modified = true;
    }
    
    return { code, modified };
}

async function fixAllFiles() {
    let modifiedCount = 0;
    
    for (const file of JS_FILES) {
        console.log(`Processing ${file}...`);
        try {
            const { code, modified } = fixESMSyntax(file);
            if (modified) {
                await fs.writeFile(file, code, 'utf8');
                console.log(`  ✓ Fixed ES module syntax`);
                modifiedCount++;
            } else {
                console.log(`  - No changes needed`);
            }
        } catch (error) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Modified ${modifiedCount} out of ${JS_FILES.length} files`);
}

fixAllFiles().catch(console.error);