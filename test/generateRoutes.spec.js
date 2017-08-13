const Loader = require('../index.js').Loader;
const chai = require('chai');
chai.should();

describe('Loader', () => {
  describe('#generateRoutes', () => {
    it('should generate export routes source code supporting react-route-config options', () => {
      let loader = new Loader({});
      let routes = [
        {
          component: 'Root',
          path: '/',
          exact: true,
          strict: false,
        },
      ];

      let expect = 
        ( 'export default [{ path:"/",\n'
        + '  exact:true,\n'
        + '  strict:false,\n'
        + `  component:Root,\n`
        + '}];');

      let actual = loader.generateRoutes(routes);
      actual.should.equal(expect);
    });

    it('should generate export routes source code supporting additional options', () => {
      let loader = new Loader({});
      let routes = [
        {
          path: '/',
          str: 'string',
          bool: true,
          number: 5,
        },
      ];

      let expect = 
        ( 'export default [{ path:"/",\n'
        + '  str:"string",\n'
        + '  bool:true,\n'
        + '  number:5,\n'
        + '}];');

      let actual = loader.generateRoutes(routes);
      actual.should.equal(expect);
    });

    it('should generate export routes source code supporting child routes', () => {
      let loader = new Loader({});
      let routes = [
        {
          path: '/',
          component: 'Home',
          routes: [
            {
              path: '/child',
              component: 'Child',
              routes: [
                {
                  path: '/child/grandchild',
                  component: 'Grandchild',
                },
              ],
            },
          ],
        },
      ];

      let expect = 
        ( 'export default [{ path:"/",\n'
        + '  component:Home,\n'
        + '  routes:[{ path:"/child",\n'
        + '    component:Child,\n'
        + '    routes:[{ path:"/child/grandchild",\n'
        + '      component:Grandchild,\n'
        + '    }]\n'
        + '  }]\n'
        + '}];');

      let actual = loader.generateRoutes(routes);
      actual.should.equal(expect);
    });
  });
});