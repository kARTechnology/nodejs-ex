angular.module('starter.controllers').controller('registerCtrl', function($scope, API, $ionicPopup) {



  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Success!',
      template: 'Password changed successfully'
    });
  };

  $scope.register = function() {
    API.register($scope.data.username, $scope.data.password, $scope.data.email,$scope.data.phone).success(function(docs) {
      if (docs != null)
        $scope.showAlert();
    }).error(function(err) {});

  };
});
