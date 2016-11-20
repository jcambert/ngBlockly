/**
*/

'use strict';


var testblock=
'<xml xmlns="http://www.w3.org/1999/xhtml">\
<block type="factory_base" id="$cl:h03forXa^@5iz|Rz" deletable="false" movable="false" x="0" y="0">\
    <mutation connections="LEFT"></mutation>\
    <field name="NAME">sensor</field>\
    <field name="INLINE">INT</field>\
    <field name="CONNECTIONS">LEFT</field>\
    <statement name="INPUTS">\
      <block type="input_dummy" id="=1+P==EL`9YbNfrRQ07v">\
        <field name="ALIGN">LEFT</field>\
        <statement name="FIELDS">\
          <block type="field_dropdown" id="x:3N%6*o/bCOo*./oMi_">\
            <mutation options="3"></mutation>\
            <field name="FIELDNAME">NAME</field>\
            <field name="USER0">option</field>\
            <field name="CPU0">OPTIONNAME</field>\
            <field name="USER1">option</field>\
            <field name="CPU1">OPTIONNAME</field>\
            <field name="USER2">option</field>\
            <field name="CPU2">OPTIONNAME</field>\
            <next>\
              <block type="field_static" id="[1cX6Wm2$yRg.Df,7b@n">\
                <field name="TEXT">temp.</field>\
              </block>\
            </next>\
          </block>\
        </statement>\
      </block>\
    </statement>\
    <value name="OUTPUTTYPE">\
      <shadow type="type_null" id="_0ypaM/p!OP~X06b2Zts"></shadow>\
      <block type="type_number" id="BcT*]kcAz;~G8b,C17Q|"></block>\
    </value>\
    <value name="COLOUR">\
      <block type="colour_hue" id="}H/QFn*jU%(3AA^7_O:N">\
        <mutation colour="#a55ba5"></mutation>\
        <field name="HUE">300</field>\
      </block>\
    </value>\
  </block>\
  </xml>';

angular.module('myApp')
.run(['BlocklyToolbox',function(toolbox){
    console.dir('myapp is running');
    //toolbox.addStandard();
    toolbox.addCategory('Domotick');
    toolbox.addBlock('controls_if');
    toolbox.addBlock('logic_compare');
    toolbox.addBlock({type:'math_number',field:{_name:"NUM",__text:"50"}});
    toolbox.addXml(testblock);

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