/**
*/

'use strict';

angular.module('myApp')
.run(['BlocklyToolbox',function(toolbox){
    toolbox.addStandard();
    toolbox.addCategory('Domotick','cat_domotick');
    toolbox.addBlock('cat_domotick','controls_if');
    toolbox.addBlock('cat_domotick','logic_compare');
    
}])
.controller('HomeCtrl', ['$scope', function($scope) {
	//TODO - put any directive code here
    $scope.onShowToolbox = function(){
        console.dir('Show Toolbox')
    };
    
    $scope.onHideToolbox = function(){
        console.dir('Hide Toolbox');
    }
    
   $scope.press = function(){
       $scope.toggle = !$scope.toggle;
   }
}]);