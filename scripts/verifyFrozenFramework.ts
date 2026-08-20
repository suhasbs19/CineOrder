import * as crypto from 'crypto';
import * as fs from 'fs';

const filesToVerify: Record<string, string> = {
  'src/lib/storyGraphEngine.ts': 'e7402a0a8d383f25e24e23392a0aad437fb04204bc7c79080781bdc6ad848488',
  'src/lib/storyKnowledgeGraphEngine.ts': 'e729c5dc2b0edbdb23d75bc2caf1813cd7a0fb507f6fa687ad0dbbabc4c6258e',
  'src/lib/recommendationService.ts': 'd143d7eecd5fdc27d33b79630f9551e939f7d6fb9924bc97b3cfc82bde1c48d9',
  'src/data/cineOrderKnowledgeGraph.ts': '3f4e9d92bbbfb4ae0046b64912329b5e704b8b06cac6e723d3650219157e48af',
  '.agents/AGENTS.md': '47a3707789cfff9fe926f4d78212807d7f31ab335c03d58894e15779e4342363',
};

console.log('============================================================');
console.log('  FROZEN FRAMEWORK SHA-256 CHECKSUM VERIFICATION');
console.log('============================================================\n');

let allPassed = true;
for (const [filePath, expectedHash] of Object.entries(filesToVerify)) {
  const content = fs.readFileSync(filePath);
  const actualHash = crypto.createHash('sha256').update(content).digest('hex');
  const match = actualHash === expectedHash;
  if (match) {
    console.log(`  ✅ BIT-FOR-BIT IDENTICAL: ${filePath}`);
    console.log(`     Hash: ${actualHash}`);
  } else {
    console.error(`  ❌ HASH MISMATCH: ${filePath}`);
    console.error(`     Expected: ${expectedHash}`);
    console.error(`     Actual:   ${actualHash}`);
    allPassed = false;
  }
}

console.log('\n============================================================');
if (allPassed) {
  console.log('  STATUS: ✅ ZERO FRAMEWORK CREEP CONFIRMED');
} else {
  console.error('  STATUS: ❌ INTEGRITY COMPROMISED');
  process.exit(1);
}
console.log('============================================================\n');
