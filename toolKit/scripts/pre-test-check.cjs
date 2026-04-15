#!/usr/bin/env node

/**
 * Test Pre-Flight Check
 * Validates environment before running tests
 */

const fs = require('fs');
const path = require('path');

const checks = [];
const errors = [];
const warnings = [];

console.log('\n🔍 Running Pre-Test Checks...\n');

// ============================================
// 1. Check fixture directories
// ============================================
console.log('📁 Checking fixture directories...');

const fixtureChecks = [
  { path: 'tests/fixtures/newsletter', required: true, files: ['index.json', 'sources.json', 'pages.json', 'summaries.json'] },
  { path: 'tests/fixtures/gates-edge', required: true, files: ['index.json', 'sources.json', 'pages.json'] }
];

fixtureChecks.forEach(fixture => {
  if (!fs.existsSync(fixture.path)) {
    errors.push(`Missing fixture directory: ${fixture.path}`);
  } else {
    let allFilesPresent = true;
    fixture.files.forEach(file => {
      const fullPath = path.join(fixture.path, file);
      if (!fs.existsSync(fullPath)) {
        errors.push(`  Missing file in ${fixture.path}: ${file}`);
        allFilesPresent = false;
      }
    });
    if (allFilesPresent) {
      checks.push(`✅ Fixture directory valid: ${fixture.path}`);
    }
  }
});

// ============================================
// 2. Check TypeScript configuration
// ============================================
console.log('⚙️  Checking TypeScript configuration...');

const tsconfigFiles = ['tsconfig.json', 'tsconfig.test.json'];
tsconfigFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const config = JSON.parse(fs.readFileSync(file, 'utf-8'));
      
      if (file === 'tsconfig.test.json') {
        if (config.compilerOptions?.types?.includes('node')) {
          checks.push(`✅ ${file} includes Node types`);
        } else {
          warnings.push(`${file} may be missing "types": ["node"]`);
        }
      }
      
      checks.push(`✅ ${file} is valid JSON`);
    } catch (e) {
      errors.push(`Invalid JSON in ${file}: ${e.message}`);
    }
  } else {
    errors.push(`Missing file: ${file}`);
  }
});

// ============================================
// 3. Check test files exist
// ============================================
console.log('📝 Checking test files...');

const testFiles = [
  'tests/cli-routing.test.ts',
  'tests/config.test.ts',
  'tests/engine.test.ts',
  'tests/metrics.test.ts',
  'tests/provider-selection.test.ts',
  'tests/quality-provenance.test.ts',
  'tests/pipeline-malformed-results.test.ts',
  'tests/report-generation.test.ts',
  'tests/design-research.test.ts',
  'tests/research-integration.test.ts',
  'tests/run-storage.test.ts'
];

let testFileCount = 0;
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    testFileCount++;
  } else {
    errors.push(`Missing test file: ${file}`);
  }
});

if (testFileCount === testFiles.length) {
  checks.push(`✅ All ${testFileCount} test files present`);
} else {
  errors.push(`Only ${testFileCount}/${testFiles.length} test files found`);
}

// ============================================
// 4. Check environment variables
// ============================================
console.log('🔐 Checking environment variables...');

const envVarsToCheck = [
  { name: 'TAVILY_API_KEY', required: false, reason: 'Optional - tests mock this' },
  { name: 'OPENAI_API_KEY', required: false, reason: 'Optional - tests mock this' }
];

envVarsToCheck.forEach(env => {
  if (process.env[env.name]) {
    checks.push(`✅ ${env.name} is set`);
  } else if (env.required) {
    errors.push(`Missing required environment variable: ${env.name}`);
  } else {
    checks.push(`ℹ️  ${env.name} not set (${env.reason})`);
  }
});

// ============================================
// 5. Check node_modules
// ============================================
console.log('📦 Checking dependencies...');

const requiredPackages = [
  'vitest',
  'typescript',
  '@types/node'
];

requiredPackages.forEach(pkg => {
  if (fs.existsSync(path.join('node_modules', pkg))) {
    checks.push(`✅ Package installed: ${pkg}`);
  } else {
    errors.push(`Missing package: ${pkg} - run 'npm install'`);
  }
});

// ============================================
// 6. Check build output
// ============================================
console.log('🏗️  Checking build artifacts...');

if (fs.existsSync('dist')) {
  const jsFiles = fs.readdirSync('dist').filter(f => f.endsWith('.js')).length;
  if (jsFiles > 0) {
    checks.push(`✅ Build output exists (${jsFiles} JS files)`);
  } else {
    warnings.push('Build directory exists but is empty - run "npm run build"');
  }
} else {
  warnings.push('Build directory not found - run "npm run build" first');
}

// ============================================
// Summary
// ============================================
console.log('\n' + '═'.repeat(50));
console.log('📋 PRE-TEST CHECK SUMMARY\n');

if (checks.length > 0) {
  console.log('✅ PASSED CHECKS:');
  checks.forEach(check => console.log(`   ${check}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`   ${warning}`));
  console.log();
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(error => console.log(`   ${error}`));
  console.log();
  console.log('═'.repeat(50));
  console.log('❌ PRE-TEST CHECK FAILED\n');
  console.log('Actions to fix:');
  console.log('  1. Run: npm install');
  console.log('  2. Run: npm run build');
  console.log('  3. Check fixture files location\n');
  process.exit(1);
}

console.log('═'.repeat(50));
console.log('✅ ALL PRE-TEST CHECKS PASSED\n');
console.log('You can now run: npm test\n');
process.exit(0);
