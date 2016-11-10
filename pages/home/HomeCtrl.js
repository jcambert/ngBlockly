/**
*/

'use strict';

angular.module('myApp')
.controller('HomeCtrl', ['$scope', function($scope) {
	//TODO - put any directive code here
    $scope.onShowToolbox = function(){
        alert('Show Toolbox')
    };
    
    $scope.onHideToolbox = function(){
        alert('Hide Toolbox');
    }
}]);