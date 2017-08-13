# react-router-config-loader
[webpack](https://webpack.js.org/) loader transforms plain react router configuration object defined in json/yaml file into [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config) js module. 

[![npm version](https://badge.fury.io/js/react-router-config-loader.svg)](https://badge.fury.io/js/react-router-config-loader)
[![Build Status](https://travis-ci.org/grayyang/react-router-config-loader.svg?branch=master)](https://travis-ci.org/grayyang/react-router-config-loader)
[![Coverage Status](https://coveralls.io/repos/github/grayyang/react-router-config-loader/badge.svg?branch=master)](https://coveralls.io/github/grayyang/react-router-config-loader?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/grayyang/react-router-config-loader.svg)](https://greenkeeper.io/)

## Motivation
[react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config) provides one centralized routes configuration within react. However, the requirement to reference component classes directly in routes configuration limits its usage. 

[react-router-config-loader](https://www.npmjs.com/package/react-router-config-loader) provides the option to define plain react routes configuration object in json/yaml file, by tramsforming path of component class into class reference and module import with the help of [webpack](https://webpack.js.org/).

By removing direct reference to component classes and code transformation, it opens much more possibile usage of the routes configuration, including but no limited to:
* Routes definition with no dependency, which can provides single source of truth of the routes to multiple modules, e.g. react SPA and express.js backend
  * Ability to check validation of URL path in backend
  * Ability to trace route of URL path in backend
* Customization to route configuration object, which can adds additional features to react-router-config
  * Support to use relative path in routes configuration
  * Support inherit properties available in child routes automatically

## Installation
Use [npm](https://www.npmjs.com/) install to add devDependencies:
```sh
$ npm install --save-dev react-router-config-loader
```

## Usage
[react-router-config-loader](https://www.npmjs.com/package/react-router-config-loader) supports loading react-router configuration defined in json, yaml, and js file. Below configuration samples correspond to the [sample](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config#route-configuration-shape) provided by [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config).

### JSON
Inline usage of loader is given in below examples. For other ways, refer to webpack [documents](https://webpack.js.org/concepts/loaders/#using-loaders) for detail.  
#### main.js
```js
import routes from 'react-router-config-loader!./routes.json';
```
#### routes.json
```json
[
  { 
    "component": "./Root",
    "routes": [
      { 
        "path": "/",
        "exact": true,
        "component": "./Home"
      },
      { 
        "path": "/child/:id",
        "component": "./Child",
        "routes": [
          { 
            "path": "/child/:id/grand-child",
            "component": "./GrandChild"
          }
        ]
      }
    ]
  }
]
```

### YAML
Chaining [yaml-loader](https://www.npmjs.com/package/yaml-loader) before [react-router-config-loader](https://www.npmjs.com/package/react-router-config-loader) to transform routes defined in yaml file.
#### main.js
```js
import routes from 'react-router-config-loader!yaml-loader!./routes.yaml';
```
#### routes.yaml
```yaml
- component: ./Root
  routes:
    - component: ./Home
      path: /
      exact: true
    - component: ./Child
      path: /child/:id
      routes:
        - component: ./GrandChild
          path: /child/:id/grand-child
```

### JS
Routes configuration object can also be defined and exported from an js file (currently only using module.exports are supported).
#### main.js
```js
import routes from 'react-router-config-loader!./routes.js';
```
#### routes.js
```js
module.exports = [
  { component: './Root',
    routes: [
      { path: '/',
        exact: true,
        component: './Home'
      },
      { path: '/child/:id',
        component: './Child',
        routes: [
          { path: '/child/:id/grand-child',
            component: './GrandChild'
          }
        ]
      }
    ]
  }
]
```

## Route Configuration
Both configuration fields defined in [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config), and additional fields including _componentName_, _inheritProps_ are supported.

### component: string
The core difference between [react-router-config](https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config) configuration and [react-router-config-loader](https://www.npmjs.com/package/react-router-config-loader) configuration is that, the `component` field is path from which to resolve the react component class instead of the component class.

`component` supports relative path (and absolute path) to resolve local components, and module path to resolve components from node modules. By default, relative path will be resolved using the context path unless [`componentsDir`](#componentsDir) options is set.

If `componentName` field is not specified, the file name (without extention) is used as the name of the component.

### componentName: string
Once specified, the value of `componentName` will be used as the import name of the component.

### path: string
Absolute [path-to-regrex](https://www.npmjs.com/package/path-to-regexp) path used to match for the component if [`relativePath`](#relativePath) is not set. Otherwise, relative path should be used.

### exact: boolean
When `true`, will only match if the path matches the URL exactly. See https://reacttraining.com/react-router/core/api/Route/exact-bool

### strict: bool
When `true`, a path that has a trailing slash will only match a URL with a trailing slash. See https://reacttraining.com/react-router/core/api/Route/strict-bool.

### inheritProps: object
Object whose properties will be assigned to both the current route, and all its children. Which will be available through the `props.route`. For example,
```json
[
  { 
    "component": "./Root",
    "routes": [
      { 
        "path": "/",
        "exact": true,
        "component": "./Home"
      },
      { 
        "path": "/child/:id",
        "component": "./Child",
        "parentProp": "parentProp",
        "inheritProps": {
          "inheritProp": "inheritProp"
        },
        "routes": [
          { 
            "path": "/child/:id/grand-child",
            "component": "./GrandChild",
            "selfProp": "selfProp"
          }
        ]
      }
    ]
  }
]
```
will get below `props.route` for `GrandChild` component:
```js
{
  component: GrandChild,
  path: '/child/:id/grand-child',
  selfProp: 'selfProp',
  inheritProp: 'inheritProp',
}
```

### Other fields
Other fields are free to add into route object, which is also available via `props.route` inside the component.

## Loader Options
Several options controls the behavior of the loader on how routes configuration object is transformed.

### componentsDir: string
Once specified, this directory will be used as the context path with with `component` path are resolved.

### relativePath: boolean
Once set to `true`, all `path` in route are treated as relative path to its parents. For example, below is the corresponding configuration when `relativePath` equals `true`.
```json
[
  { 
    "component": "./Root",
    "routes": [
      { 
        "path": "/",
        "exact": true,
        "component": "./Home"
      },
      { 
        "path": "/child/:id",
        "component": "./Child",
        "routes": [
          { 
            "path": "grand-child",
            "component": "./GrandChild"
          }
        ]
      }
    ]
  }
]
```
