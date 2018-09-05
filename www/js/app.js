angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'dx'])
  .constant('config', {
    client: 'localhost:3000',
    base: 'http://192.168.1.100:3000',
    // client: 'http://localhost:8000',
    // base: 'http://localhost:8000',
    ver: '?3'
  })
  .run(function($ionicPlatform, $rootScope, $ionicLoading, $ionicPopup, $state) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard  for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) { // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    $rootScope.$on('loading:show', function(args) {
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner><br>Loading...'
      });
    });

    $rootScope.$on('loading:hide', function() {
      $ionicLoading.hide();
    });


    $rootScope.$on('loading:error', function(event, args) {
      $ionicLoading.hide();

      var message = JSON.stringify(args.err.data) || JSON.stringify(args) || 'No respose from server';
      var name = 'Error!';

      setTimeout(function() {
        var alertPopup = $ionicPopup.alert({
          title: name,
          template: message
        }).then(function(res) {
          if (args.err.status == "401") {
            $state.go('login');
          }
        });
      }, 500);
    });
  })

  .config(['$ionicConfigProvider', function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom'); // other values: top
  }])

  .config(function($httpProvider) {
    $httpProvider.interceptors.push(function($rootScope, $q, localStorage) {
      return {
        request: function(config) {
          if (config.url.startsWith("templates")) return config;
          $rootScope.$broadcast('loading:show');
          config.params = config.params || {};
          if (localStorage.get('token')) {
            config.params.token = localStorage.get('token');
          }
          return config;
        },
        response: function(response) {
          $rootScope.$broadcast('loading:hide');
          return response;
        },
        requestError: function(rejection) {
          console.log('requestError');
          console.log(rejection);

          $rootScope.$broadcast('loading:error', {
            err: rejection
          });
          return $q.reject(rejection);
        },
        responseError: function(rejection) {
          console.log('responseError');
          console.log(rejection);
          if (rejection.config !== undefined)
            if (!rejection.config.url.startsWith('templates'))
              $rootScope.$broadcast('loading:error', {
                err: rejection
              });
          return $q.reject(rejection);
        }
      };
    });
  })
  .config(function($stateProvider, $urlRouterProvider, config) {
    $stateProvider
      .state('login', {
        url: '/login?action',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl',
      })
      .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'registerCtrl',
      })
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html' + config.ver,
      })
      .state('app.dash', {
        url: '/dash',
        views: {
          'menuContent': {
            templateUrl: 'templates/dash.html' + config.ver,
            controller: 'DashCtrl'
          }
        },
      })
      .state('app.pass', {
        url: '/pass',
        views: {
          'menuContent': {
            templateUrl: 'templates/pass.html' + config.ver,
            controller: 'passCtrl',
          }
        },
      })
      .state('app.tok', {
        url: '/tok',
        views: {
          'menuContent': {
            templateUrl: 'templates/tok.html' + config.ver,
            controller: 'tokCtrl'
          }
        },
      })
      .state('app.about', {
        url: '/about',
        views: {
          'menuContent': {
            templateUrl: 'templates/about.html' + config.ver
          }
        },
      });
    $urlRouterProvider.otherwise('/login');
  });
