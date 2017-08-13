const Loader = require('../index.js').Loader;
const path = require('path');
const chai = require('chai');
chai.should();

describe('Loader', () => {
  describe('#componentPath', () => {
    it('should return relative path if one relative path specified', () => {
      let loader = new Loader({});
      let route = {
        component: './src/Component',
      }

      let filepath = loader.componentPath(route);
      path.resolve(filepath).should.equal(path.resolve('./src/Component'));
      filepath.startsWith('.').should.be.true;
    });

    it('should return absolute path if one absolute path specified', () => {
      let loader = new Loader({});
      let route = { 
        component: path.resolve('./src/Component'),
      };

      let filepath = loader.componentPath(route);
      path.isAbsolute(filepath).should.be.true;
      path.resolve(filepath).should.equal(path.resolve('./src/Component'));
    });

    it('should return module path if one npm module specified', () => {
      let loader = new Loader({});
      let route = {
        component: 'Module/Component',
      };

      let filepath = loader.componentPath(route);
      filepath.should.equal('Module/Component');
    });

    it('should return path relative to componentsDir if it is specified', () => {
      let loader = new Loader({ query: { componentsDir: './src' } });
      let route = {
        component: './Component',
      };

      let filepath = loader.componentPath(route);
      path.resolve(filepath).should.equal(path.resolve('./src/Component'));
      filepath.startsWith('.').should.be.true;
    });

    it('should return escape character \\\\ if including \\ in path', () => {
      let loader = new Loader({});
      let route = {
        component: 'Module\\Component',
      };

      let filepath = loader.componentPath(route);
      filepath.should.equal('Module\\\\Component');
    });
  });
});