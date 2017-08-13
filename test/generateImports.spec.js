const Loader = require('../index.js').Loader;
const chai = require('chai');
chai.should();

describe('Loader', () => {
  describe('#generateImports', () => {
    it('should generate import component source code', () => {
      let loader = new Loader({});
      let imports = [
        'Component|./src/Componnet.js',
        'Another|./src/Another.js',
      ];

      let expect = 
        ( 'import Component from \'./src/Componnet.js\';\n'
        + 'import Another from \'./src/Another.js\';\n');

      let actual = loader.generateImports(imports);
      actual.should.equal(expect);
    });
  });
});