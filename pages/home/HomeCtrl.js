/**
*/

'use strict';

angular.module('myApp')
.run(['BlocklyToolbox',function(toolbox){
    console.dir('myapp is running');
    //toolbox.addStandard();
    toolbox.addCategory('Domotick');
    toolbox.addBlock('controls_if');
    toolbox.addBlock('logic_compare');

    var xml='  <category id="catLogicals" name="Logicals">' +
'    <block type="controls_if"></block>' +
'  </category>' ;
    toolbox.addXml(xml);
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