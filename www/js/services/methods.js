angular.module('starter.services').factory('commonMethods', function() {

  return {
    getColor: function(value) {
      value = (value - 0.4) / 1.55; //formular for customization
      var hue = ((1 - value) * 120).toString(10);
      return ["hsl(", hue, ",100%,50%)"].join("");
    },
     randomColor: function(brightness) {
      function randomChannel(brightness) {
        var r = 255 - brightness;
        var n = 0 | ((Math.random() * r) + brightness);
        var s = n.toString(16);
        return (s.length == 1) ? '0' + s : s;
      }
      return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
    },
    daysBetween: function(date1, date2,ago) {
      //Get 1 day in milliseconds
      var one_day = 1000 * 60 * 60 * 24;

      // Convert both dates to milliseconds
      var date1_ms = date1.getTime();
      var date2_ms = date2.getTime();

      // Calculate the difference in milliseconds
      var difference_ms = date2_ms - date1_ms;
      //take out milliseconds
      difference_ms = difference_ms / 1000;
      var seconds = Math.floor(difference_ms % 60);
      difference_ms = difference_ms / 60;
      var minutes = Math.floor(difference_ms % 60);
      difference_ms = difference_ms / 60;
      var hours = Math.floor(difference_ms % 24);
      var days = Math.floor(difference_ms / 24);

      res = "";
      if (days > 0) res += days + ' days, ';
      if (hours > 0) res += hours + ' hrs, ';
      if (minutes > 0) res += minutes + ' mins ';
      if (minutes > 0 && seconds > 0) res += ' and ';
      if (seconds > 0) res += seconds + ' sec';

      if (res === "") res = "Live!";
      else if(ago==1)res += ' ago';
      return res;
    }
  };
});
