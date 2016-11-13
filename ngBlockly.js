
'use strict';
(function(angular,Blockly,X2JS,_){
/*if(!angular.isDefined(Blockly))
    throw new Error('You must include \'The Blockly Library\' before angular-blockly');
if(!angular.isDefined(X2JS))
    throw new Error('You must include \'The X2JS Library\' before angular-blockly');
if(!angular.isDefined(_))
    throw new Error('You must include \'The Lodash Library\' before angular-blockly');
 */       
angular.module('angular-blockly', ['ngAnimate',])
.run(['$log',function($log){
    $log.log('ngBlockly is running');
}])
.constant('Blockly',Blockly)
.constant('_',_)
.constant('EmptyToolbox',function(){
     var toolboxXml= ['<xml >','<category id="catLogic" name="Empty">','</category>','</xml>'];
     return toolboxXml.join('');
})
.constant('LogicToolbox',function(){
     var toolboxXml= ['<xml >','<category id="catLogic" name="Logic">','<block type="controls_if">','</block>','</category>','</xml>'];
     return toolboxXml.join('');
})
.provider('ngBlockly',['EmptyToolbox',function (EmptyToolbox) {
    var defaultOptions={
        //path:'assets/',
        css:true,
        trashcan:true,
        sounds:false,
        scrollbars: true,
        disable: true,
        grid: false,
        maxBlocks: Infinity,
        //toolbox: '<xml ><category id="catLogic" name="Logic"><block type="controls_if"></block></category></xml>'
        toolbox:EmptyToolbox()
    };
    var options={};
    this.options = function(opt,value){
        if(angular.isObject(opt))
            options=angular.extend({},opt);
        if(angular.isDefined(opt) && angular.isDefined(value))
            options[opt]=value;
        if(angular.isArray(opt))
            angular.forEach(opt,function(oopt,key){
                options[key]=oopt;
            });
    };
    
    this.$get = function () {
        var locals=angular.extend({},defaultOptions, options);
        return{
            getOptions:function(){
                return locals;
            }
        }
    }
    
}])
.service('BlocklyService',['$timeout','Blockly','$rootScope', function($timeout,Blockly,$rootScope){

    
    this.getWorkspace = function () {
        return Blockly.getMainWorkspace();
    };
    
    this.setToolbox = function (toolbox) {
        this.getWorkspace().updateToolbox(toolbox);
        console.dir(this.getToolbox());
        $rootScope.$broadcast('BLOCKLY_TOOLBOX_READY');
    };
    
    this.getToolbox = function(){
        return document.getElementById(':0');
    };
    this.getToolboxPosition = function(){
        return {x:this.getToolbox().clientLeft,y:this.getToolbox().clientTop};
    };
    this.getToolboxBounds = function(){
        return {width:this.getToolbox().clientWidth,height:this.getToolbox().clientHeight};
    };
    
    
}])

.service('BlocklyToolbox',['$log','Blockly','BlocklyService','_',function($log,Blockly,BlocklyService,_){
    
    this.toolbox = {'xml':{'_id':'toolbox','_style':'display: none','category':[]}};
    var x2js = new X2JS();
    
    //var toolboxXml= ['<xml >','<category id="catLogic" name="Logic">','<block type="controls_if">','</block>','</category>','</xml>'];
    this.addCategory = function(name,id){
        var idx=this.toolbox.xml.category.push({'block':[],'_id':id,'_name':name});
        $log.log('Add Category:');$log.log(this.toolbox);
        return this.toolbox.xml.category[idx];
    }
    this.getCategory = function(id){
        //try{
            return _.find(this.toolbox.xml.category,function(cat){return cat._id == id;});
      //  }catch(err){
      //      return null;
      //  }
        
    }
    this.addBlock = function(category,name, definition,generator){
        if(angular.isDefined(definition))
            Blockly.Blocks[name]=definition;
            
        this.getCategory(category).block.push({'_type':name});
        
        if(angular.isDefined(generator))
            Blockly.Javascript[name]=generator;
            
        $log.log('Add block:');$log.log(this.toolbox);$log.log(x2js.json2xml_str( this.toolbox ));
    };
    this.apply = function(){
        BlocklyService.setToolbox(x2js.json2xml_str( this.toolbox ));
    }
}])
.directive('ngBlockly', ['ngBlockly','Blockly','BlocklyService',/*'BlocklyToolbox',*/'$timeout', function (ngBlockly,Blockly,BlocklyService,/*BlocklyToolbox,*/$timeout) {

	return {
		restrict: 'E',
		scope: {
            options:'='
		},

	    //replace: true,
		template: '<div style="height:500px" class="ng-blockly"></div>',
		controller:[function(){
            
        }],
		link: function($scope, $element, attrs) {
            var opts=angular.extend({},$scope.options || {},ngBlockly.getOptions());
            console.dir(opts);
            
            
            $element.ready(function(){
                console.log('ready');
                $timeout(function(){
                    Blockly.inject($element.children()[0],opts);
                    //BlocklyService.setToolbox(LogicToolbox());
                   // BlocklyToolbox.apply();
                },100);
            });
		},
		
		
	};
}])

.directive('ngBlocklyToolboxButton',[ '$compile','BlocklyService',function($compile,BlocklyService){
    function validateFileExtension(fileName) {        
        var exp = /^.*\.(jpg|jpeg|gif|JPG|png|PNG)$/;         
        return exp.test(fileName);  
    }
    return{
        restrict:'E',
        replace:true,
        require:['ngModel'],
        scope:{
            iconShow:'@',
            iconOverShow:'@',
            iconDownShow:'@',
            iconHide:'@',
            iconOverHide:'@',
            iconDownHide:'@',
            onShow:  '&',
            onHide:  '&',
            ngModel:'='
            
        },
        controller:['$scope','$rootScope',function($scope,$rootScope){
            $scope.icon = $scope.iconShow;
            $scope.ngModel =true;
            $scope.toggleLeave = function(){
            if(!$scope.iconMode)return;
                $scope.icon =  $scope.ngModel?$scope.iconHide:$scope.iconShow;
            }
            $scope.iconOver  = function(){
                if(angular.isDefined($scope.iconOverShow) && angular.isDefined($scope.iconOverHide))
                $scope.icon = $scope.ngModel?$scope.iconOverHide:$scope.iconOverShow;
            }
             $scope.iconDown  = function(){
                if(angular.isDefined($scope.iconDownShow) && angular.isDefined($scope.iconDownHide))
                $scope.icon = $scope.ngModel?$scope.iconDownHide:$scope.iconDownShow;
            }
            $scope.$watch('ngModel',function(newValue){
                if(newValue)
                    $scope.onShow();
                else    
                    $scope.onHide();
                $scope.toggleLeave();
                
            });
            $rootScope.$on('BLOCKLY_TOOLBOX_READY',function(){
                console.dir(BlocklyService.getToolboxBounds().width);
                $scope.bounds=BlocklyService.getToolboxBounds();
                $scope.position=BlocklyService.getToolboxPosition();
                console.dir($scope.position);
            })
        }],
        
        link:function($scope,$element,attrs){
            $scope.iconMode=false;
            $scope.bounds={width:0,height:0};
            $scope.position={left:0,top:0};    
            
            var template= angular.element('<a id="button_toggle_toolbox"  ng-click="ngModel=!ngModel" style="width:{{bounds.width}}px;left:{{position.left}}px"><ng-slide target="blocklyToolboxDiv" ng-model="ngModel"></ng-slide></a>');
           
            
            
            if (validateFileExtension($scope.iconShow) && validateFileExtension($scope.iconHide) ) {
                $scope.iconMode=true;
                console.dir($scope.icon);
                var icon=angular.element('<img ng-src="{{icon}}" ></img>');
                template.attr('ng-mouseover',"iconOver()");
                template.attr('ng-mouseleave',"toggleLeave()");
                template.attr('ng-mousedown','iconDown();')
                template.append(icon);
            }else{
                $scope.iconMode=false;
                var icon_=angular.element('<i id="button_toggle_toolbox_icon" ng-class="{ iconShow:ngModel, iconHide:!ngModel}"></i>');
                template.append(icon_);
            }

            
                    
             
           $element=$element.replaceWith( $compile(template)($scope) );
           console.dir($element.html()); 
        }
    }
}])
.directive('ngSlide',['BlocklyService','$rootScope',function(BlocklyService,$rootScope){
    return{
        restrict:'E',
        scope:{
            target:'@',
            ngModel:'=',
        },
        link:function($scope,$element,attrs,controllers){
            console.dir($scope.ngModel);
            //$scope.target = attrs['target'];
             var elt=undefined;
             $rootScope.$on('BLOCKLY_TOOLBOX_READY',function(){
                  elt= document.getElementsByClassName($scope.target)[0];//document.getElementById(':0');
                  elt=angular.element(elt);//.addClass('toolbox_toggle_off');
                  update();
                //var toto=document.getElementsByClassName('blocklyToolboxDiv')[0].addClass('TOTO');
                //console.dir(elt);
             });
             function update(){
                if(!angular.isDefined(elt))return;
                if($scope.ngModel){
                    elt.removeClass('toolbox_toggle_off');
                    elt.addClass('toolbox_toggle_on');
                }else{
                    elt.removeClass('toolbox_toggle_on');
                    elt.addClass('toolbox_toggle_off');
                }
             }
            $scope.$watch('ngModel',function(){
                update();
            });
        }
        
    }
}])
.directive('ngVerticalSlide', ['$timeout',function ($timeout) {
      var getTemplate, link;
      getTemplate = function (tElement, tAttrs) {
        if (tAttrs.lazyRender !== void 0) {
          return '<div ng-if=\'lazyRender\' ng-transclude></div>';
        } else {
          return '<div ng-transclude></div>';
        }
      };
      link = function (scope, element, attrs, ctrl, transclude) {
        var closePromise, duration, elementScope, emitOnClose, getHeight, hide, lazyRender, onClose, show;
        duration = attrs.duration || 1;
        elementScope = element.scope();
        emitOnClose = attrs.emitOnClose;
        onClose = attrs.onClose;
        lazyRender = attrs.lazyRender !== void 0;
        if (lazyRender) {
          scope.lazyRender = scope.expanded;
        }
        closePromise = null;
        element.css({
          overflow: 'hidden',
          transitionProperty: 'height',
          transitionDuration: '' + duration + 's',
          transitionTimingFunction: 'ease-in-out'
        });
        getHeight = function (passedScope) {
          var c, children, height, _i, _len;
          height = 0;
          children = element.children();
          for (_i = 0, _len = children.length; _i < _len; _i++) {
            c = children[_i];
            height += c.clientHeight;
          }
          return '' + height + 'px';
        };
        show = function () {
          if (closePromise) {
            $timeout.cancel(closePromise);
          }
          if (lazyRender) {
            scope.lazyRender = true;
          }
          return element.css('height', getHeight());
        };
        hide = function (){
          element.css('height', '0px');
          if (emitOnClose || onClose || lazyRender) {
            return closePromise = $timeout(function () {
              if (emitOnClose) {
                scope.$emit(emitOnClose, {});
              }
              if (onClose) {
                elementScope.$eval(onClose);
              }
              if (lazyRender) {
                return scope.lazyRender = false;
              }
            }, duration * 1000);
          }
        };
        scope.$watch('expanded', function (value, oldValue) {
          if (value) {
            return $timeout(show);
          } else {
            return $timeout(hide);
          }
        });
        return scope.$watch(getHeight, function (value, oldValue) {
          if (scope.expanded && value !== oldValue) {
            return $timeout(show);
          }
        });
      };
      return {
        restrict: 'A',
        scope: { expanded: '=ngSlideDown' },
        transclude: true,
        link: link,
        template: function (tElement, tAttrs) {
          return getTemplate(tElement, tAttrs);
        }
      };
    }
  ])

;
})(angular,Blockly,X2JS,_);