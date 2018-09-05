angular.module('starter.controllers').controller('passCtrl', function($scope, API, $ionicPopup) {

  API.getUserData().success(function(docs) {
    $scope.data = docs;
    $scope.passwords = {};

  }).error(function(err) {});

  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Success!',
      template: 'Password changed successfully'
    });
  };

  $scope.updatePassword = function() {
    API.updatePassword($scope.passwords.oldpass, $scope.passwords.newpass).success(function(docs) {
      if (docs != null)
        $scope.showAlert();
      $scope.oldpass = $scope.newpass = null;
    }).error(function(err) {});

  };
});
