var baseUrl = "http://tiberius.local:3000/api/sprinkler";
var modes;

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
            templateUrl: 'pages/home.html'
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
            url: 'http://tiberius.local:3000/api/status'
        }).then(function successCallback(response) {
            $scope.status = response.data;
            $scope.Model.dataLoaded = (new Date).getTime();
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }, 100);

    getWeather = function () {
        $http({
            method: 'GET',
            url: 'https://api.darksky.net/forecast//42.928009,%20-85.843410'
        }).then(function successCallback(response) {
            console.log("here!");
            $scope.weather = response.data;
            $scope.Model.weatherDataLoaded = (new Date).getTime();
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }
    $interval(getWeather(), 200000); //once every 200s

    
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
        }
    });

    $scope.$watch('Model.weatherDataLoaded', function (dataLoaded) {
        if (dataLoaded) {
            $scope.weather = {};
            $scope.weather.temperature = ($scope.$parent.weather.currently.temperature).toFixed(1);
            $scope.weather.humidity = ($scope.$parent.weather.currently.humidity*100).toFixed(1);

            console.log($scope.weather);
            console.log($scope.$parent.weather);
        }
    });



});

tiberiusApp.controller('sensorsController', function ($scope) {
    $scope.message = "Sensors Page";
});

tiberiusApp.controller('sprinklerController', function ($scope) {
    $scope.message = 'Sprinkler Page!';

    $scope.$watch('Model.dataLoaded', function (dataLoaded) {
        if (dataLoaded) {
            $scope.mode = $scope.$parent.status.sprinkler.mode;
            $scope.pinStatus = $scope.$parent.status.sprinkler.pinStatus;
            console.log($scope.mode);
            console.log($scope.pinStatus);
        }
    });

    $scope.sidebarState = false;
    $scope.sidebarClass = 'hide';
    $scope.gearBtnClass = '';

    $scope.toggleSidebar = function () {
        $scope.sidebarClass = $scope.sidebarState ? 'show' : 'hide';
        $scope.gearBtnClass = $scope.sidebarState ? 'active' : '';
        $scope.sidebarState = !$scope.sidebarState;
    };
});