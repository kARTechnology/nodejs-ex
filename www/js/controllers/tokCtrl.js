angular.module('starter.controllers').controller('tokCtrl', function($scope , API, $ionicPopup) {

  API.getUserData().success(function(docs) {
    $scope.token = docs.token;
  }).error(function(err) {});

  $scope.genNewToken = function() {

    $scope.confirmPopup = $ionicPopup.confirm({
      title: 'Generate New Token',
      template: 'Are you sure you want generate a new token? you need to change the tokens in all your associated devices.',
      okText: 'DO IT!',
      okType: 'button-assertive',
      cancelText: 'No, Go Back!',
      cancelType: 'button-positive',
    });

    $scope.confirmPopup.then(function(res) {
      if (res) {
        console.log('You are sure');
        API.resetToken().success(function(docs) {
          $scope.token = docs;
        }).error(function(err) {});
      } else {
        console.log('You are not sure');
      }
    });

  };

});
