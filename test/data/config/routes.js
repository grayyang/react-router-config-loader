module.exports = [
  { component: '../components/Root',
    routes: [
      { path: '/',
        exact: true,
        component: '../components/Home'
      },
      { path: '/child/:id',
        component: '../components/Child',
        routes: [
          { path: '/child/:id/grand-child',
            component: '../components/GrandChild'
          }
        ]
      }
    ]
  }
]