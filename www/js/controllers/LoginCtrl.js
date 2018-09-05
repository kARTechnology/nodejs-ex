angular.module('starter.controllers').controller('LoginCtrl', function($stateParams, $ionicHistory, $http, $scope, $rootScope, API, $ionicModal, localStorage, $state) {

  $scope.data = {
    username: "",
    password: ""
  };

  $rootScope.$on('$ionicView.loaded',
    function(event, toState, toParams, fromState, fromParams) {
      console.log(toState);
      console.log(toParams);
      if (toState.stateName == "login") {
        if ($stateParams.action !== undefined && $stateParams.action == 'logout') {
          $rootScope.loggedin = false;
          localStorage.set('token', null);
          console.log('loggedout');
        } else
        if ($rootScope.loggedin) $state.go("app.dash");
      }
    });

  $scope.login = function() {
    API.doLogin($scope.data.username, $scope.data.password).success(function(docs) {
      localStorage.set('token', docs);
      $state.go('app.dash');
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + docs;
    }).error(function(err) {});

  };

});
