angular.module('starter.controllers').controller('DashCtrl', function($http, $scope, $ionicSideMenuDelegate, API, $state) {
  $scope.ViewTitle = "Dashboard";
  var now = new Date();
  var morning = new Date();
  morning.setHours(0);
  morning.setMinutes(0);
  morning.setSeconds(0);

  $scope.fromdate = morning;
  $scope.todate = now;
  $scope.currentDevice = null;


  $scope.dateBox = {
    morning: {
      type: "datetime",
      value: morning,
      pickerType: 'calendar',
      acceptCustomValue: false,
      bindingOptions: {
        value: 'fromdate'
      }
    },
    now: {
      type: "datetime",
      value: now,
      pickerType: 'calendar',
      acceptCustomValue: false,
      bindingOptions: {
        value: 'todate'
      }
    }
  };
  $ionicSideMenuDelegate.canDragContent(false);
  $scope.$on("$ionicView.enter", function(event, data) {

    loadDevices();
  });
  // == == == == == == == == == == == == == == == == == == == == == == == ==
  loadDevices = function() {
    $http.get('http://192.168.1.100:3000/users/getdevices/', {}).success(function(docs) {
      $scope.currentDevice = docs[0].deviceids[0].id;
      $scope.devices = {
        dataSource: docs[0].deviceids,
        displayExpr: "id",
        valueExpr: "id",
        bindingOptions: {
          value: "currentDevice"
        },
        onValueChanged: function(e) {
          console.log(e);
          var previousValue = e.previousValue;
          var newValue = e.value;
          $scope.loadData(newValue);
        }
      };
    }).error(function(err) {});

  };
  loadDevices();

  $scope.chartInstance = {};

  $scope.loadData = function(device) {
    $scope.charts = {
      configs: []
    };
    console.log($scope.currentDevice, $scope.fromdate, $scope.todate);
    $http.get("http://192.168.1.100:3000/users/getlogs", {
      method: "GET",
      params: {
        deviceid: $scope.currentDevice,
        variable: 'acin,acou,batt,char,heat,load,amps',
        from: $scope.fromdate,
        to: $scope.todate
      }
    }).success(function(docs) {


      $scope.$broadcast('scroll.refreshComplete');

      if (docs.length == 0) return;
      chartOptions = {
        onInitialized: function (e) {
          console.log('c init');
    $scope.chartInstance = e.component;
},
        scrollingMode: "all",
        zoomingMode: "all",
        scrollBar: {
          visible: true,
          position: 'bottom'
        },
        title: {
          text: "Inverter",
          subtitle: {
            text: device
          }
        },


        dataSource: docs,
        crosshair: {
          enabled: true,
          color: "#949494",
          width: 3,
          dashStyle: "dot",
          label: {
            visible: true,
            backgroundColor: "#949494",
            font: {
              color: "#fff",
              size: 12,
            }
          }
        },
        "export": {
          enabled: true
        },
        loadingIndicator: {
          show: true
        },
        valueAxis: [{
            name: "acvoltage",
            position: "left",
            grid: {
              visible: true
            },
            title: {
              text: "AC Voltage"
            },
            label: {
              customizeText: function() {
                return this.valueText + 'v';
              }
            },
            tickInterval: 5,
          },
          {
            name: "battvoltage",
            position: "left",
            grid: {
              visible: true
            },
            title: {
              text: "Battery Voltage"
            },
            label: {
              customizeText: function() {
                return this.valueText + 'v';
              }
            },
            min: 10,
            max: 15,
          },
          {
            name: "heat",
            position: "right",
            grid: {
              visible: true
            },
            title: {
              text: "Temperature"
            },
            label: {
              customizeText: function() {
                return this.valueText + ' °C';
              }
            },
            min: 10,
            max: 100,

          },
          {
            name: "charger",
            position: "right",
            grid: {
              visible: true
            },
            title: {
              text: "Charing Mode"
            },
            label: {
              customizeText: function() {
                switch (this.valueText + "") {
                  case '0':
                    return 'Off';
                  case '1':
                    return 'Bulk';
                  case '2':
                    return 'Absorption';
                  case '3':
                    return 'Float';
                  case '4':
                    return 'Equalization';
                }
              }
            },
            min: 0,
            max: 4,
          },
          {
            name: "load",
            position: "left",
            grid: {
              visible: true
            },
            title: {
              text: "Load"
            },
            label: {
              customizeText: function() {
                return this.valueText + ' W';
              }
            },
          },
          {
            name: "amps",
            position: "right",
            grid: {
              visible: true
            },
            title: {
              text: "Charging Currrent"
            },
            label: {
              customizeText: function() {
                return this.valueText + ' A';
              }
            },
            tickInterval: 1,
            min: 0,
            max: 15,
          }
        ],
        panes: [{
          name: "Pane1",
          border: {
            visible: true
          }
        }, {
          name: "Pane2",
          border: {
            visible: true
          }
        }, {
          name: "Pane3",
          border: {
            visible: true
          }
        }, {
          name: "Pane4",
          border: {
            visible: true
          }
        }],
        seriesTemplate: {
          nameField: "variable",
          customizeSeries: function(valueFromNameField) {
            switch (valueFromNameField.toLowerCase()) {
              case 'acin':
              case 'acou':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  min: 0,
                  max: 300,
                  axis: "acvoltage",
                  pane: 'Pane1'
                };
              case 'batt':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  pane: 'Pane2',
                  axis: "battvoltage",
                };
              case 'char':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  pane: 'Pane2',
                  axis: "charger",
                };
              case 'amps':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  pane: 'Pane2',
                  axis: "amps",
                };
              case 'load':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  axis: "load",
                  pane: 'Pane3',
                };
              case 'heat':
                return {
                  type: "spline",
                  argumentField: "timestamp",
                  valueField: "val",
                  pane: 'Pane4',
                  axis: "heat",
                };

            }
          }
        },
        legend: {
          hoverMode: "excludePoints",

          customizeText: function(seriesInfo) {
            switch (seriesInfo.seriesName) {
              case 'batt':
                return "Battery Voltage";
              case 'acin':
                return "AC Input";
              case 'acou':
                return "AC Output";
              case 'heat':
                return "Temperature";
              case 'load':
                return "Load";
              case 'char':
                return "Charger Mode";
              case 'amps':
                return "Amps";
            }
          }
        },
        commonSeriesSettings: {
          argumentField: 'timestamp',
          valueField: 'val',
          point: {
            visible: false
          },
        },
        argumentAxis: {
          label: {
            format: 'shortDateShortTime',
          },
          tickInterval: {
            hours: 1
          },
          minorTickInterval: {
            minutes: 10
          },
          minorGrid: {
            visible: true
          },
          minorTick: {
            visible: true
          },
          argumentType: 'datetime',
          grid: {
            visible: true
          }
        },
        tooltip: {
          enabled: true,
          customizeTooltip: function() {
            return this.valueText;
          }
        }
      };
      $scope.charts.configs.push(chartOptions);

        console.log(  $scope.chartInstance)

    }).error(function(err) {});
  };
});
