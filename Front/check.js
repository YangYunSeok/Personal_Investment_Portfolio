const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('src/screens/PIPASSETS01.jsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('No syntax error found');
} catch (e) {
  console.error(`Syntax Error at line ${e.loc?.line}, col ${e.loc?.column}: ${e.message}`);
  // print exact context
  const pos = e.pos;
  console.log(code.substring(pos - 50, pos + 50));
}
