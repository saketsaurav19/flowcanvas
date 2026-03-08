const fs = require('fs');
const generatorFile = 'src/app/utils/geminiGenerator.js';
let content = fs.readFileSync(generatorFile, 'utf8');

content = content.replace(
  /const JSON_PATCH_SCHEMA = {/g,
  'const { Type } = require("@google/genai");\n\n  const JSON_PATCH_SCHEMA = {'
);

fs.writeFileSync(generatorFile, content);
