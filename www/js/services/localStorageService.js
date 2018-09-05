angular.module('starter.services').factory('localStorage', ['$window', function($window) {

  var today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  //today = new Date(2017,02,09);
  //tomorrow = new Date(2017,02,10);

  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key) {
      return $window.localStorage[key];
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);

    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    },
    today: function() {
      return today;
    },
    tomorrow: function() {
      return tomorrow;
    }
  };

}]);
