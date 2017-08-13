const Loader = require('../index.js').Loader;
const chai = require('chai');
chai.should();

describe('Loader', () => {
  describe('#componentName', () => {
    it('should return path name by default', () => {
      let loader = new Loader({});
      let route = {
        component: './src/Componnet.js',
      };

      let name = loader.componentName(route);
      name.should.equal('Componnet');
    });

    it('should return componentName if it is specified', () => {
      let loader = new Loader({});
      let route = {
        component: './Componnet',
        componentName: 'TestComponent',
      };

      let name = loader.componentName(route);
      name.should.equal('TestComponent');
    });
  });
});