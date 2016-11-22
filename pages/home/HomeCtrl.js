/**
*/

'use strict';


var testblock=
'';

angular.module('myApp')
.run(['BlocklyToolbox',function(toolbox){
    console.dir('myapp is running');
    //toolbox.addStandard();
    toolbox.addCategory('Domotick');
    toolbox.addBlock('controls_if');
    toolbox.addBlock('logic_compare');
    toolbox.addBlock({type:'math_number',field:{_name:"NUM",__text:"50"}});
    toolbox.addBlock(testblock);

    var xml='  <category id="catLogicals" name="Logicalss" colour="330">' +
'    <block type="controls_if"></block>' +
'    <block type="logic_compare"></block>' +
    '<block type="math_number"><field name="NUM">42</field></block>'+

    
'  </category>' ;
   toolbox.addXml(xml);
   
}])
.controller('HomeCtrl', ['$scope','BlocklyService', function($scope,BlocklyService) {
	var self=$scope;
    $scope.lang = BlocklyService.getLang();
    $scope.code='';
    /*$scope.$watch('lang',function(){
        $scope.code=BlocklyService.getGeneratedCode();
    });*/
    $scope.$watch('code',function(){console.log('code has change')});
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

   $scope.blocklyChange = function(){
       //console.log(BlocklyService.getGeneratedCode());
       self.codez=BlocklyService.getGeneratedCode();
       console.log(self.codez);
   }
   $scope.langs = BlocklyService.getAvailableGeneratedLanguage();
   
   //BlocklyService.setCodeGeneratedLanguage('PHP');
}]);