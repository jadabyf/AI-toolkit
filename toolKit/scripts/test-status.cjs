#!/usr/bin/env node

/**
 * Test Status Checker - Comprehensive test analysis
 * 
 * Usage:
 *   node scripts/test-status.cjs              # Quick status
 *   node scripts/test-status.cjs --verbose    # Detailed output
 *   node scripts/test-status.cjs --json       # JSON format
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const json = args.includes('--json');

// Test file manifest
const testManifest = {
  'tests/cli-routing.test.ts': {
    name: 'CLI Routing',
    tests: ['registers top-level command groups', 'research includes run/gate/report'],
    type: 'Unit',
    category: 'Core'
  },
  'tests/config.test.ts': {
    name: 'Config Schema',
    tests: ['resolveThresholds applies site overrides', 'resolveRuleConfig applies enable and params'],
    type: 'Unit',
    category: 'Core'
  },
  'tests/engine.test.ts': {
    name: 'Gate Engine',
    tests: ['runGateEngine passes newsletter fixture'],
    type: 'Integration',
    category: 'Quality'
  },
  'tests/metrics.test.ts': {
    name: 'Metrics',
    tests: ['computeMetrics returns expected counts'],
    type: 'Integration',
    category: 'Quality'
  },
  'tests/provider-selection.test.ts': {
    name: 'Provider Selection',
    tests: ['creates mock search provider', 'requires tavily key when configured', 'creates heuristic llm provider', 'requires openai key when configured'],
    type: 'Unit',
    category: 'Providers'
  },
  'tests/quality-provenance.test.ts': {
    name: 'Quality Provenance',
    tests: ['flags unsupported claims and duplicate sources', 'applies scoring thresholds'],
    type: 'Integration',
    category: 'Quality'
  },
  'tests/pipeline-malformed-results.test.ts': {
    name: 'Pipeline Resilience',
    tests: ['completes run with malformed urls using fallback snippet'],
    type: 'Integration',
    category: 'Pipeline'
  },
  'tests/report-generation.test.ts': {
    name: 'Report Generation',
    tests: ['creates professional markdown with required sections'],
    type: 'Unit',
    category: 'Pipeline'
  },
  'tests/design-research.test.ts': {
    name: 'Design Research',
    tests: ['design research integration'],
    type: 'Integration',
    category: 'Research'
  },
  'tests/research-integration.test.ts': {
    name: 'Research Integration',
    tests: ['research implementation integration'],
    type: 'Integration',
    category: 'Research'
  },
  'tests/run-storage.test.ts': {
    name: 'Run Storage',
    tests: ['run storage'],
    type: 'Integration',
    category: 'Storage'
  }
};

function runTests() {
  const result = spawnSync('npm', ['test'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf-8',
    shell: true
  });

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.status,
    success: result.status === 0
  };
}

function parseTestOutput(output) {
  const passedMatch = output.match(/Tests\s+(\d+)\s+passed/);
  const failedMatch = output.match(/Tests\s+(\d+)\s+failed/);
  const filesPassedMatch = output.match(/Test Files\s+(\d+)\s+passed/);
  const filesFailedMatch = output.match(/Test Files\s+(\d+)\s+failed/);
  const durationMatch = output.match(/Duration\s+([\d.]+)ms/);

  return {
    testsTotal: (passedMatch ? parseInt(passedMatch[1]) : 0) + (failedMatch ? parseInt(failedMatch[1]) : 0),
    testsPassed: passedMatch ? parseInt(passedMatch[1]) : 0,
    testsFailed: failedMatch ? parseInt(failedMatch[1]) : 0,
    filesTotal: (filesPassedMatch ? parseInt(filesPassedMatch[1]) : 0) + (filesFailedMatch ? parseInt(filesFailedMatch[1]) : 0),
    filesPassed: filesPassedMatch ? parseInt(filesPassedMatch[1]) : 0,
    filesFailed: filesFailedMatch ? parseInt(filesFailedMatch[1]) : 0,
    duration: durationMatch ? parseFloat(durationMatch[1]) : 0
  };
}

function parseFileResults(output) {
  const lines = output.split('\n');
  const results = {};
  
  // Match patterns like: ✓ tests/cli-routing.test.ts (2 tests) 10ms
  const pattern = /([✓✗])\s+tests\/([^\s]+)\s+\((\d+)\s+tests?\)\s+([\d.]+)ms/g;
  let match;
  
  while ((match = pattern.exec(output)) !== null) {
    const [_, symbol, filename, count, time] = match;
    results[`tests/${filename}`] = {
      passed: symbol === '✓',
      testCount: parseInt(count),
      time: parseFloat(time)
    };
  }
  
  return results;
}

function formatOutput(summary, fileResults, manifest) {
  if (json) {
    return JSON.stringify({
      summary,
      fileResults,
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  let output = '';
  output += '\n╔════════════════════════════════════════╗\n';
  output += '║        TEST EXECUTION REPORT           ║\n';
  output += '╚════════════════════════════════════════╝\n\n';

  // Overall status
  const statusIcon = summary.testsFailed === 0 ? '✅' : '❌';
  output += `${statusIcon} OVERALL STATUS: ${summary.testsFailed === 0 ? 'ALL TESTS PASSING' : 'SOME TESTS FAILING'}\n\n`;

  // Summary numbers
  output += '📊 SUMMARY:\n';
  output += `  Test Files:   ${summary.filesPassed}/${summary.filesTotal} passed\n`;
  output += `  Test Cases:   ${summary.testsPassed}/${summary.testsTotal} passed\n`;
  output += `  Duration:     ${summary.duration.toFixed(0)}ms\n`;
  output += `  Pass Rate:    ${((summary.testsPassed / summary.testsTotal) * 100).toFixed(1)}%\n\n`;

  // Detailed file results
  if (verbose) {
    output += '═══════════════════════════════════════\n';
    output += '📁 DETAILED RESULTS BY FILE:\n';
    output += '═══════════════════════════════════════\n\n';

    Object.entries(manifest).forEach(([filepath, info]) => {
      const result = fileResults[filepath];
      if (!result) return;

      const icon = result.passed ? '✅' : '❌';
      const category = `[${info.category}]`;
      output += `${icon} ${info.name.padEnd(25)} ${category.padEnd(12)} (${result.testCount} tests, ${result.time.toFixed(0)}ms)\n`;

      if (info.tests && info.tests.length > 0) {
        info.tests.forEach((test, idx) => {
          output += `   ${idx + 1}. ${test}\n`;
        });
      }
      output += '\n';
    });
  }

  // Category summary
  const categories = {};
  Object.entries(manifest).forEach(([filepath, info]) => {
    const result = fileResults[filepath];
    if (!result) return;

    if (!categories[info.category]) {
      categories[info.category] = { passed: 0, total: 0 };
    }
    categories[info.category].total += result.testCount;
    if (result.passed) {
      categories[info.category].passed += result.testCount;
    }
  });

  output += '📂 BY CATEGORY:\n';
  Object.entries(categories).forEach(([category, stats]) => {
    const icon = stats.passed === stats.total ? '✅' : '⚠️';
    const pct = ((stats.passed / stats.total) * 100).toFixed(0);
    output += `  ${icon} ${category.padEnd(15)} ${stats.passed}/${stats.total} (${pct}%)\n`;
  });

  output += '\n╓════════════════════════════════════════╖\n';
  
  if (summary.testsFailed === 0) {
    output += '║ ✅ ALL TESTS PASSED - READY TO COMMIT  ║\n';
  } else {
    output += `║ ❌ ${summary.testsFailed} TEST(S) FAILING - NEEDS FIXES      ║\n`;
  }
  
  output += '╚════════════════════════════════════════╝\n\n';

  return output;
}

// Main execution
const testResult = runTests();
console.log(testResult.stdout);

if (testResult.exitCode !== 0) {
  console.error(testResult.stderr);
  process.exit(1);
}

const summary = parseTestOutput(testResult.stdout);
const fileResults = parseFileResults(testResult.stdout);

// Get complete manifest with results
Object.keys(testManifest).forEach(filepath => {
  if (!fileResults[filepath]) {
    fileResults[filepath] = { passed: false, testCount: 0, time: 0 };
  }
});

console.log(formatOutput(summary, fileResults, testManifest));

process.exit(summary.testsFailed === 0 ? 0 : 1);
