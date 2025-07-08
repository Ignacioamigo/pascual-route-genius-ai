// Debug pattern detection
const { detectQueryPattern } = require('./lib/smart-queries');

console.log('🔍 DEBUGGING PATTERN DETECTION\n');

const testQueries = [
  'cliente más eficiente en Madrid',
  'clients with the better median ticket in Almería',
  'most efficient client in Barcelona',
  'cliente más eficiente'
];

testQueries.forEach(query => {
  console.log(`Testing: "${query}"`);
  const result = detectQueryPattern(query);
  if (result) {
    console.log(`✅ MATCH: ${result.pattern.description}`);
    console.log(`📍 Params: [${result.params.join(', ')}]`);
  } else {
    console.log('❌ NO MATCH');
  }
  console.log('---');
});

console.log('Done.'); 