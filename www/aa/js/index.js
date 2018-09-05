var DemoApp = angular.module('DemoApp', ['dx','ionic'])

DemoApp.controller('DemoController', function DemoController($scope,$http) {





  $http.get('http://localhost:3000/users/getlogs?deviceid=' + 'asdasd' + '&variable=batt,mode,heat&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MzUxMjk5MjcsImlzcyI6IkthcnRoaWtleWFuIiwiZGF0YSI6eyJfaWQiOiI1YjdlYzBmZDM0MzYyN2M0MzRjZTk0MTUifSwiaWF0IjoxNTM1MTI2MzI3fQ.ttkmlnzsR10GomjWhOj1vInztyDIR4lAR5tOGy1yZ4c', {}).success(function(docs) {

    $scope.chartOptions = {
         dataSource: docs,
        commonSeriesSettings: {
            argumentField: "timestamp",
            valueField: "val",
            type: "bar"
        },
        seriesTemplate: {
            nameField: "variable",
            customizeSeries: function(valueFromNameField) {
              console.log(valueFromNameField)
                return valueFromNameField === "batt" ? { type: "line", label: { visible: true }, color: "#ff3f7a" } : {};
            }
        },

    };

  });
});
