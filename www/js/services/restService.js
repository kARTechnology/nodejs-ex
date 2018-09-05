angular.module('starter').factory('API', function($q, $http, config) {
  var base = config.base;
  return {
    doLogin: function(username, password) {
      return $http.get(base + '/users/login', {
        method: 'GET',
        params: {
          "username": username,
          "password": password
        }
      });
    },
    getDevices: function() {
      return $http.get(base + '/users/getdevices/', {});
    },
    getUserData: function() {
      return $http.get(base + '/users/', {});
    },
    resetToken: function() {
      return $http.get(base + '/users/refreshToken/', {});
    },
    updatePassword: function(oldpass, newpass) {
       return $http.get(base + '/users/updatePassword', {
        method: 'GET',
        params: {
          "oldpass": oldpass,
          "newpass": newpass
        }
      });
    },
  };
});
