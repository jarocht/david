var tiberiusApp = angular.module('tiberiusApp', ['ngRoute']);

tiberiusApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/home', {
            templateUrl: 'pages/home.html',
            controller: 'homeController'
        })
        .when('/thermostat', {
            templateUrl: 'pages/thermostat.html',
            controller: 'thermostatController'
        })
        .when('/sprinkler', {
            templateUrl: 'pages/sprinkler.html',
            controller: 'sprinklerController'
        })
        .when('/sensors', {
            templateUrl: 'pages/sensors.html',
            controller: 'sensorsController'
        })
        .when('/secret', {
            templateUrl: 'pages/secret.html'
        })
        .otherwise({
            templateUrl: 'pages/home.html',
            controller: 'homeController'
        });

    $locationProvider.hashPrefix('');

});

tiberiusApp.controller('mainController', function ($scope, $http, $interval) {
    $scope.Model = {
        dataLoaded: false,
    };
    $interval(() => {
        $http({
            method: 'GET',
            url: 'http://tiberius:3000/api/status'
        }).then(function successCallback(response) {
            $scope.status = response.data;
            $scope.Model.dataLoaded = (new Date).getTime();
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }, 500);
});

tiberiusApp.controller('homeController', function ($scope) {
    $scope.message = "Welcome to Tiberius";
});

tiberiusApp.controller('thermostatController', function ($scope, $http) {
    $scope.temperatureTarget = "74.5°F";
    $scope.indoor = {};
    $scope.indoor.rooms = [];

    $scope.$watch('Model.dataLoaded', function (dataLoaded) {
        if (dataLoaded) {
            $scope.temperature = ($scope.$parent.status.sensor.fahrenheit.value).toFixed(1) + $scope.$parent.status.sensor.fahrenheit.unit;
            $scope.humidity = ($scope.$parent.status.sensor.humidity.value).toFixed(1) + " " + $scope.$parent.status.sensor.humidity.unit;
            $scope.indoor.rooms[0] = {
                name: "Thermostat",
                temperature: $scope.temperature,
                humidity: $scope.humidity,
                selected: true
            }
            $scope.indoor.rooms[1] = {
                name: "Master Bedroom",
                temperature: "72.4°F",
                humidity: "42.3 %",
                selected: false
            }
            $scope.indoor.rooms[2] = {
                name: "Office",
                temperature: "73.4°F",
                humidity: "39.8 %",
                selected: false
            }

            $scope.weather = {};
            $scope.weather.temperature = ($scope.$parent.status.weather.temperature).toFixed(1);
            $scope.weather.humidity = ($scope.$parent.status.weather.humidity * 100).toFixed(1);
        }
    });
});

tiberiusApp.controller('sensorsController', function ($scope) {
    $scope.message = "Sensors Page";
});

tiberiusApp.controller('sprinklerController', function ($scope, $http) {
    $scope.$watch('Model.dataLoaded', function (dataLoaded) {
        if (dataLoaded) {
            $scope.mode = $scope.$parent.status.sprinkler.mode;
            $scope.pinStatus = $scope.$parent.status.sprinkler.pinStatus;
            $scope.sprinkler = $scope.$parent.status.sprinkler;
            console.log($scope.sprinkler);
        }
    });

    $scope.sidebarState = true;
    $scope.sidebarClass = 'hide';
    $scope.gearBtnClass = '';

    $scope.toggleSidebar = function () {
        $scope.sidebarClass = $scope.sidebarState ? 'show' : 'hide';
        $scope.gearBtnClass = $scope.sidebarState ? 'active' : '';
        $scope.sidebarState = !$scope.sidebarState;
    };

    $scope.setMode = function (mode) {
        $http({
            method: 'GET',
            url: 'http://tiberius:3000/api/sprinkler/set/' + mode
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.stop = function () {
        $http({
            method: 'GET',
            url: 'http://tiberius:3000/api/sprinkler/stop'
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.toggleZone = function (zone) {
        $http({
            method: 'GET',
            url: 'http://tiberius:3000/api/sprinkler/manual/' + zone
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

});