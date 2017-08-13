const Loader = require('../index.js').Loader;
const chai = require('chai');
chai.should();

describe('Loader', () => {
  describe('#transformRoutes', () => {
    it('should transform component into name and import', () => {
      let loader = new Loader({});
      let routes = [
        {
          component: './Component',
          routes: [
            {
              component: './Child1',
            },
            {
              component: './Child2',
              componentName: 'AlternativeName',
            }
          ],
        }
      ];

      let expectImports = [
        loader.componentName(routes[0]) + '|' + loader.componentPath(routes[0]),
        loader.componentName(routes[0].routes[0]) + '|' + loader.componentPath(routes[0].routes[0]),
        loader.componentName(routes[0].routes[1]) + '|' + loader.componentPath(routes[0].routes[1]),
      ];

      let expectRoutes = [
        {
          component: loader.componentName(routes[0]),
          routes: [
            {
              component: loader.componentName(routes[0].routes[0]),
            },
            {
              component: loader.componentName(routes[0].routes[1]),
            }
          ],
        }
      ];

      let [ actualImports, actualRoutes ] = loader.transformRoutes(routes);
      actualImports.should.deep.equal(expectImports);
      actualRoutes.should.deep.equal(expectRoutes);
    });

    it('should not transform absolute path if relativePath is not true', () => {
      let loader = new Loader({ query: { relativePath: true } });
      let routes = [
        {
          path: '/',
          routes: [
            {
              path: '/child',
              routes: [
                {
                  path: '/child/:id',
                  routes: [
                    {
                      path: '/child/:id/grandchild',
                    },
                  ],
                },
              ],
            },
            {
              path: '/other',
            }
          ],
        }
      ];

      let [ actualImports, actualRoutes ] = loader.transformRoutes(routes);
      actualRoutes.should.deep.equal(routes);
    });

    it('should transform relative path to absolute if relativePath is true', () => {
      let loader = new Loader({ query: { relativePath: true } });
      let routes = [
        {
          routes: [
            {
              path: '/',
              routes: [
                {
                  path: 'child',
                  routes: [
                    {
                      path: ':id',
                    },
                    {
                      path: 'grandchild',
                    }
                  ],
                },
              ],
            },
            {
              path: '/other',
            }
          ],
        }
      ];

      let expectRoutes = [
        {
          routes: [
            {
              path: '/',
              routes: [
                {
                  path: '/child',
                  routes: [
                    {
                      path: '/child/:id',
                    },
                    {
                      path: '/child/grandchild',
                    }
                  ],
                },
              ],
            },
            {
              path: '/other',
            }
          ],
        }
      ];

      let [ actualImports, actualRoutes ] = loader.transformRoutes(routes);
      actualRoutes.should.deep.equal(expectRoutes);
    });

    it('should merge inheritProps into self and child routes', () => {
      let loader = new Loader({ query: { inheritProps: { option: 'option' } } });
      let routes = [
        {
          inheritProps: {
            top: 'top',
          },
          routes: [
            {
              routes: [
                {
                  inheritProps: {
                    child: 'child',
                  },
                  routes: [
                    {
                      self: 'self',
                    },
                  ],
                },
              ],
            },
          ],
        }
      ];

      let expectRoutes = [
        {
          option: 'option',
          top: 'top',
          routes: [
            {
              option: 'option',
              top: 'top',
              routes: [
                {
                  option: 'option',
                  top: 'top',
                  child: 'child',
                  routes: [
                    {
                      option: 'option',
                      top: 'top',
                      child: 'child',
                      self: 'self',
                    },
                  ],
                },
              ],
            },
          ],
        }
      ];

      let [ actualImports, actualRoutes ] = loader.transformRoutes(routes);
      actualRoutes.should.deep.equal(expectRoutes);
    });
  });
});