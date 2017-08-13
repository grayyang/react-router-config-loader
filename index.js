const path = require('path');
const toSource = require('tosource');
const deepCopy = require('deepcopy');
const loaderUtils = require("loader-utils");

class Loader {
  constructor(loaderApi) {
    this.loaderApi = loaderApi;

    const options = loaderUtils.getOptions(this.loaderApi) || {};
    this.componentsDir = options.componentsDir || '.';
    this.relativePath = options.relativePath || false;
    this.inheritProps = options.inheritProps || {};
  }

  transform(source) {
    let [ imports, routes ] = this.transformRoutes(eval(source));
    return (
      `${this.generateImports(imports)}`
      + `${this.generateRoutes(routes)}`
    );
  }

  /**
   * Get name of component in the route
   * 
   * @param {*} route route config object
   * @returns {string} component name
   */
  componentName(route) {
    // use component name specified in route
    if (route.componentName) {
      return route.componentName;
    }

    // default name equals base name of component path 
    return path.basename(route.component, path.extname(route.component));
  }

  /**
   * Get path to import component from
   * 
   * @param {*} route route config object
   * @returns {string} component path
   */
  componentPath(route) {
    if (path.isAbsolute(route.component) || !route.component.startsWith('.')) {
      // load for absolute path or node_modules, no change
      return route.component.replace(/\\/g, '\\\\');
    }
    else {
      // relative path, join with base path
      // NB: prefix ./ to not load from node_modules
      return `./${path.join(this.componentsDir, route.component)}`.replace(/\\/g, '\\\\');
    }
  }

  /**
   * Transform routes config into react router config by collecting component imports
   * 
   * @param {Array} routes routes config
   * @returns { [ Array, Array ] } [ component path to import, react routes config ]
   */
  transformRoutes(routes) {
    let imports = new Set();
    routes.forEach(route => this.transformRouteIter(route, imports, '', this.inheritProps));

    return [ Array.from(imports), routes ];
  }

  transformRouteIter(route, imports, cwd, inheritProps) {
    // transform component configuration into name and import
    if (route.component) {
      imports.add(`${this.componentName(route)}|${this.componentPath(route)}`);
      route.component = this.componentName(route);
      delete route.componentName;
    }

    // transform relative path to absolute
    if (route.path && this.relativePath) {
      cwd = route.path = path.posix.join(cwd, route.path);
    }

    // merge inherit props to route
    if (route.inheritProps) {
      inheritProps = Object.assign(inheritProps, route.inheritProps);
      delete route.inheritProps;
    }
    Object.assign(route, inheritProps);

    // recursive transform child routes
    if (route.routes) {
      route.routes.forEach(route => this.transformRouteIter(route, imports, cwd, inheritProps));
    }
  }

  /**
   * Generate js import expression for components
   * 
   * @param {string} imports import information for react components
   * @returns {string} js source code that import components 
   */
  generateImports(imports) {
    return imports.map(kv => {
      let [ name, file ] = kv.split('|');
      return `import ${name} from '${file}';\n`;
    }).join('');
  }

  /**
   * Generate js export expression for react-router-config
   * 
   * @param {*} routes react route configs
   * @returns {string} js source code that export react router config
   */
  generateRoutes(routes) {
    return `export default [${routes.map(route => this.generateRouteIter(route, '')).join(',\n')}];`;
  }

  generateRouteIter(route, indent) {
    let component = deepCopy(route.component);
    let routes = deepCopy(route.routes);
    delete route.component;
    delete route.routes;
    
    let source = toSource(route, null, '  ', indent);
    let nextIndent = indent + '  ';
    
    return [
      source === '{}' ? '{' : `${source.substring(0, source.length - 2)},`,
      component ? `${nextIndent}component:${component},` : '', 
      routes ? `${nextIndent}routes:[${routes.map(route => `${this.generateRouteIter(route, `${nextIndent}`)}`).join(`,\n${nextIndent}`)}]` : '', 
      `${indent}}`
    ].filter(str => str).join('\n');
  }
}

module.exports= exports = function(source) {
  let loader = new Loader(this);
  return loader.transform(source);
};

exports.Loader = Loader;