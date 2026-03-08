const fs = require('fs');

const promptsFile = 'src/app/locales/promt.js';
let content = fs.readFileSync(promptsFile, 'utf8');

content = content.replace(
  /PHASE_3: `[\s\S]*?`,\n\s*REPAIR/g,
  'REPAIR'
);

content = content.replace(
  /PHASE_3: \(currentGraphContext\) => `[\s\S]*?`,\n\s*REPAIR/g,
  'REPAIR'
);

fs.writeFileSync(promptsFile, content);
