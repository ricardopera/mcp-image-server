const fs = require('fs');
const path = require('path');

describe('Estrutura básica do projeto', () => {
  it('Deve existir o arquivo build/index.js após o build', () => {
    const buildPath = path.join(__dirname, '../build/index.js');
    expect(fs.existsSync(buildPath)).toBe(true);
  });

  it('package.json deve conter o campo main', () => {
    const pkg = require('../package.json');
    expect(pkg.main).toBeDefined();
    expect(typeof pkg.main).toBe('string');
  });
});
