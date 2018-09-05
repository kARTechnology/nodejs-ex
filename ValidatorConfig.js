
var ObjectId = require('mongodb').ObjectID,
expressValidator = require('express-validator');

module.exports = function(app) {

  app.use(expressValidator());
  app.use(expressValidator({
    customValidators: {
      isArray: function(value, num) {
        if (value) {
          var array = value.split(',');
          return Array.isArray(array);
        }
        return false;
      },
      isISODate: function(value) {
        if (value) {
          var rea = new RegExp(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/);
          return rea.test(value);
        }
        return false;
      },
      isBetweenDays: function(datefrom, dateto, days) {

        if (datefrom > dateto) return false;

        var one_day = 1000 * 60 * 60 * 24;
        // Convert both dates to milliseconds
        var date1_ms = datefrom.getTime();
        var date2_ms = dateto.getTime();
        // Calculate the difference in milliseconds
        var difference_ms = date2_ms - date1_ms;
        // Convert back to days and return
        return Math.round(difference_ms / one_day) < days;
      },
      isMongoIds: function(values, num) {
        if (values) {
          var array = values.split(',');

          if (Array.isArray(array)) {
            if (array.length > num) return false;
            var re = new RegExp(/^[0-9a-fA-F]{24}$/);

            for (var i = 0, len = array.length; i < len; i++) {
              if (!re.test(array[i])) {
                console.log(re.test(array[i]) + array[i]);
                return false;
              }
            }
            return true;
          }
          return false;
        }
        return false;
      },
    }
  }));
  app.use(expressValidator({
    customSanitizers: {
      toObjectIds: function(values) {
        return values.map(function(value) {
          return ObjectId(value);
        });
      },
      toArray: function(values) {
        return values.split(',');
      },
      toMongoId: function(value) {
        return ObjectId(value);
      },
      toISODate: function(value) {
        return new Date(value);
      },
    }
  }));



};