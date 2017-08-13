const webpack = require('webpack');
const promisify = require('js-promisify');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
chai.should();

describe('react-router-config-loader', () => {
  beforeEach(() => {
    rimraf.sync(path.resolve(__dirname, 'dist'));
  });

  it('should transform config define in json file', () => {
    let compiler = webpack({
      context: path.resolve(__dirname, 'data'),
      entry: './index-json.js', // import routes from 'react-router-config-loader!./config/routes.json';
      output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'main.js',
        libraryTarget: 'commonjs2',
      },
    });

    return promisify(compiler.run, [], compiler)
      .then(stats => {
        stats.hasErrors().should.be.false;      
        let routes = require(path.resolve(__dirname, 'dist', 'main.js')).default;
        routes.should.have.lengthOf(1);
        let component = new routes[0].component();
        component.whoami.should.equal('Root');
      })
      .should.be.fulfilled;
  });

  it('should transform config define in yaml file', () => {
    let compiler = webpack({
      context: path.resolve(__dirname, 'data'),
      entry: './index-yaml.js', // import routes from 'react-router-config-loader!yaml-loader!./config/routes.json';
      output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'main.js',
        libraryTarget: 'commonjs2',
      },
    });

    return promisify(compiler.run, [], compiler)
      .then(stats => {
        stats.hasErrors().should.be.false;      
        let routes = require(path.resolve(__dirname, 'dist', 'main.js')).default;
        routes.should.have.lengthOf(1);
        let component = new routes[0].component();
        component.whoami.should.equal('Root');
      })
      .should.be.fulfilled;
  });

  it('should transform config define in js file', () => {
    let compiler = webpack({
      context: path.resolve(__dirname, 'data'),
      entry: './index-yaml.js', // import routes from 'react-router-config-loader!./config/routes.js';
      output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'main.js',
        libraryTarget: 'commonjs2',
      },
    });

    return promisify(compiler.run, [], compiler)
      .then(stats => {
        stats.hasErrors().should.be.false;      
        let routes = require(path.resolve(__dirname, 'dist', 'main.js')).default;
        routes.should.have.lengthOf(1);
        let component = new routes[0].component();
        component.whoami.should.equal('Root');
      })
      .should.be.fulfilled;
  });

  afterEach(() => {
    beforeEach(() => {
      rimraf.sync(path.resolve(__dirname, 'dist'));
    });
  });
});
