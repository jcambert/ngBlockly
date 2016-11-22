
'use strict';
(function(angular,Blockly,X2JS,_){
/*if(!angular.isDefined(Blockly))
    throw new Error('You must include \'The Blockly Library\' before angular-blockly');
if(!angular.isDefined(X2JS))
    throw new Error('You must include \'The X2JS Library\' before angular-blockly');
if(!angular.isDefined(_))
    throw new Error('You must include \'The Lodash Library\' before angular-blockly');
 */   
String.prototype.camelize = function () {
    return this.replace (/(?:^|[-])(\w)/g, function (_, c) {
        return c ? c.toUpperCase () : '';
    });
}

Array.prototype.contain = function(o){
    return this.find(function(oo){ return oo == o;}) == o;
}

String.prototype.isXml = function(xml){
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "application/xml");
    console.dir(xmlDoc);
    return true;
}
angular.module('angular-blockly', ['ngAnimate','LocalStorageModule'])
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
.constant('StandardToolbox',{
    logic:['controls_if','logic_compare','logic_operation']
   // loops:['controls_repeat_ext'],
   // math:['math_number','math_arithmetic']
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
        realTimeSaving:true,
        //toolbox: '<xml ><category id="catLogic" name="Logic"><block type="controls_if"></block><block type="logic_ternary"></block></category></xml>'
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
.service('BlocklyService',['$timeout','Blockly','$rootScope','localStorageService', function($timeout,Blockly,$rootScope,localStorageService){

    var self=this;;
    self.cache={}
    this.lang=undefined;
    this.getWorkspace = function () {
        if(Blockly.mainWorkspace==null)return null;
        return Blockly.getMainWorkspace();
    };
    this.hasLang = function(lang){
        return _.findIndex(this.getLang(),function(l){l.toLowerCase()==lang.toLowerCase();})>-1;
    }
    this.getLang = function(){
       
        return self.lang || localStorageService.get('lang');
    }
    this.setCodeGeneratedLanguage = function(lang){
        var langs = self.getAvailableGeneratedLanguage();
        if(langs.length == 0){
            console.warn('There is no registered lang generator in the application');
            return;
        }
        if(angular.isDefined(lang) && lang != null)
            if(langs.contain(lang))
                self.lang=lang;
            else
                console.error('There is no lang',lang,'registered in blockly');
       else
            self.lang=langs[0]; 
        //console.log('set lang to',self.lang);
        localStorageService.set('lang',self.lang);
    };
    this.getAvailableGeneratedLanguage = function(index){
        var result=[]
        if(self.cache.langs)    
            result= self.cache.langs;
        else{
            _.forEach(_.keys(Blockly),function(key){
                //console.dir( Blockly[key]);
                if(  Blockly[key] instanceof Blockly.Generator ){
                    result.push(key);
                }
            });
            self.cache.langs=result;
        }
        if(angular.isNumber(index)) 
            return result[index];
        else if(angular.isString(index)){
            
                var idx = _.findIndex(result,function(l){l.toLowerCase()==index.toLowerCase();});
                if(idx>-1)return result[idx];
                return undefined;
            
        }
        return result;
    }
    this.setToolbox = function (toolbox) {
        //console.dir(toolbox);
        this.getWorkspace().updateToolbox(toolbox);
        //console.dir(this.getToolbox());
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
    this.onChange = function(callback){
        this.getWorkspace().addChangeListener(callback);
    };
    this.getGeneratedCode = function(lang){
        try {
            if(angular.isNumber(lang))
                lang=self.getAvailableGeneratedLanguage(lang);
            else if(!angular.isDefined(lang))
                lang=self.lang;
            var code= Blockly[lang].workspaceToCode(self.getWorkspace());
            return code;
        } catch (error) {
            return '';
        }

        /*if(!angular.isDefined(self.lang))
            return 'There is no registered lang in the application';*/
        
    };
    this.clear = function(){
        self.getWorkspace().clear();
    }
    this.getXml = function(){
        var xmlDom = Blockly.Xml.workspaceToDom(self.getWorkspace());
        var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
        return xmlText;
    };
    this.loadFromXml = function(blocksXml){
        var xmlDom = null;
        try {
            xmlDom = Blockly.Xml.textToDom(blocksXml);
        } catch (e) {
            return false;
        }
        self.clear();
        var sucess = false;
        if (xmlDom) {
            sucess = self.loadBlocksfromXmlDom(xmlDom);
        }
        return sucess;
    }
    this.loadBlocksfromXmlDom = function(blocksXmlDom){
        try {
            Blockly.Xml.domToWorkspace(blocksXmlDom, self.getWorkspace());
        } catch (e) {
            return false;
        }
        return true;
    }

    //block.json , block.lang
    this.addCustomBlock = function(block){
        if(angular.isFunction(block.define) && angular.isString(block.name)){
            Blockly.Blocks[block.name]=block.define;

            if(angular.isString(block.lang.name) && angular.isFunction(block.lang.generator) && this.hasLang(block.lang.name)){
                Blockly[this.getAvailableGeneratedLanguage(block.lang.name)]=block.lang.generator;
            }
        }
    }
}])

.service('BlocklyToolbox',['$log','Blockly','BlocklyService','StandardToolbox','_',function($log,Blockly,BlocklyService,StandardToolbox,_){
    var self=this;
    var rootbox={'xml':{'_id':'toolbox','_style':'display: none','category':[]}};
    var categories =[];// {'xml':{'_id':'toolbox','_style':'display: none','category':[]}};
    var x2js = new X2JS();
    this.currentCategory = undefined;
    this.currentBlock = undefined;

    

    this.addStandard = function(){
        _.forEach(StandardToolbox,function(value,key){
            var cat=['cat_',key].join('');
            self.addCategory(key.camelize(),cat);
            _.forEach(value,function(tb){
                self.addBlock(cat,tb);
            });
        })
    }
    function setCurrentCategory(cat){
        self.currentCategory=cat;
        return cat;
    }
    
    // category = {name,id,colour}
    this.addCategory = function(category){
        if(angular.isString(category))
            category = {id:'cat_'+category.toLowerCase(),name:category.camelize()};

        var cat=self.getCategory(category.id);
        if(cat!=null)return setCurrentCategory(cat);
        cat={'block':[]};
        _.forEach(Object.keys(category),function(key){
            cat['_'+key]=category[key];
        });
        //var idx=this.toolbox.xml.category.push({'block':[],'_id':id,'_name':name});
        var idx=categories.push(cat);
        $log.log(category);
        $log.log('Add Category:'+idx);$log.log(categories[idx-1]);
        return setCurrentCategory(categories[idx-1]);
    }
    this.getCategory = function(id){
        try{
            return _.find(categories,function(cat){return cat._id == id;});
        }catch(err){
            return null;
        }
        
    }
    /// block ={category,type, definition,generator}
    this.addBlock = function(block){

        
       //console.log('add block'); console.dir(block);
        if(angular.isString(block))
           /* if(block.isXml()){
                console.dir('block is XML');
                return;
            }
           else*/
                block={type:block};

        if(angular.isDefined(block.definition))
            Blockly.Blocks[name]=block.definition;
        
        if(!angular.isDefined(block.category))
            block.category=self.currentCategory;
        
        var idx=-1;
        var cat=block.category;
        if(!angular.isObject(block.category))
            cat = this.getCategory(block.category);
        idx= cat.block.push({'_type':block.type,'field':[]});
               
        this.currentBlock = cat.block[idx-1];
       // console.log('Current Block');console.dir(this.currentBlock);
        if(angular.isDefined(block.generator)){
            if(angular.isString(block.generator))
                Blockly.Javascript[name]=block.generator;
            else if(angular.isObject(block.generator))
                Blockly[block.generator.lang]=block.generator.generator;
        }
        
        if(angular.isDefined(block.field))
            addTree({field: block.field},this.currentBlock);

        return this.currentBlock;
        //$log.log('Add block:');$log.log(this.toolbox);$log.log(x2js.json2xml_str( this.toolbox ));
    };

    this.addField = function(field){
        console.log('add field');console.dir(field);
        var idx=field.block.field.push({_name: field.name,__text:field.value});
        return field.block.field[idx-1];
    }

    this.apply = function(){
        
        rootbox.xml.category=categories;
       // console.dir(rootbox);
       // $log.log(x2js.json2xml_str(rootbox ));
        BlocklyService.setToolbox(x2js.json2xml_str(rootbox ));
    }

    //var level=-1;
    function addTree(tree,parent){
        if(tree == null || !angular.isDefined(tree))return;
        //console.log('-------------------------------');
        //console.log('Add Tree');
        var key=Object.keys(tree)[0].toLowerCase();
        var node=null;
        //console.dir(tree);
        //console.log(key);
        //level=level+1;
        if(key == 'xml'){
            console.dir('tree xml');
            /* _.forEach(tree.xml.category,function(cat){
                addTree({category:cat});
            })*/
        }

        if(key=='category'){

            if(angular.isArray(tree.category)){
                //console.log('tree categories');
                _.forEach(tree.category,function(cat){addTree({category:cat},parent)});
            } else{
                //console.log('tree category');
                //console.dir(tree.category);
                var idx=(parent==null?categories:parent).push(tree.category);
                node=(parent==null?categories:parent)[idx-1];
            }

            return;
        }
       
       if(key == 'block'){
           var cat=parent;
           if(cat==null)cat=self.currentCategory;
           if(cat==null)return;
           if(!cat.block)cat.block=[];
           console.dir(cat);
           cat.block.push(tree.block);
           console.dir(cat);
           return;
       }

        if( !key.startsWith('_') && !key.startsWith('category')){
           // console.log('################################');
            
            _.forEach(_.keys(tree[key]),function(childkey){
                
               // console.log(childkey);
                var t={};
                t[childkey]=tree[key][childkey];
                //console.dir(tree[key][childkey]);
                addTree(t,node);
            });
        }
       // level=level-1;
        //console.log('***********************************************');
        return null;
    }
    this.addXml = function(xml){
       
        xml=xml.split('"').join('\''); 
        var tmptb=x2js.xml_str2json(xml);
        addTree(tmptb);

        
    }
}])
.directive('ngBlockly', ['ngBlockly','Blockly','BlocklyService','BlocklyToolbox','$timeout','$log','localStorageService', function (ngBlockly,Blockly,BlocklyService,BlocklyToolbox,$timeout,$log,localStorageService) {

	return {
		restrict: 'E',
		scope: {
            options:'=',
            toolboxId:'@',
            onChange:'&',
            lang:'=',
            code:'='
		},

	    //replace: true,
		template: '<div style="height:500px" class="ng-blockly"></div>',
		controller:['$scope',function($scope){
            $scope.$watch('lang',function(v){
                BlocklyService.setCodeGeneratedLanguage(v);
            })
        }],
		link: function($scope, $element, attrs) {
            var opts=angular.extend({},$scope.options || {},ngBlockly.getOptions());
            
            //console.dir(document.getElementById($scope.toolboxId).outerHTML);
            if(angular.isDefined($scope.toolboxId))
                _.forEach($scope.toolboxId.split(','),function(id){
                     BlocklyToolbox.addXml( document.getElementById(id).outerHTML);
                })
               
            
            
            $element.ready(function(){
                console.log('ready');
                $timeout(function(){
                   // $log.log('Inject Blockly');
                   /// $log.log(Blockly);
                   // $log.log(BlocklyService.getAvailableGeneratedLanguage());
                    Blockly.inject($element.children()[0],opts);
                    //BlocklyService.setToolbox(LogicToolbox());
                   // if(!angular.isDefined($scope.toolboxId))
                    BlocklyToolbox.apply();
                    BlocklyService.loadFromXml(localStorageService.get('ngBlockly'));

                    BlocklyService.setCodeGeneratedLanguage(localStorageService.get('lang'));
                    if(opts.realTimeSaving)
                        BlocklyService.onChange(function(){
                            localStorageService.set('ngBlockly',BlocklyService.getXml());
                            //console.log(BlocklyService.getXml());
                        });

                    if(angular.isDefined($scope.onChange)){
                      //  console.log('ON CHANGE');
                        BlocklyService.onChange($scope.onChange());
                    }

                    if(angular.isDefined($scope.code))
                        BlocklyService.onChange(function(){
                            $scope.code = BlocklyService.getGeneratedCode();
                        console.log($scope.code);
                    });
                    
                    $scope.$watch('lang',function(){
                        $scope.code=BlocklyService.getGeneratedCode();
                    });

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
                //console.dir(BlocklyService.getToolboxBounds().width);
                $scope.bounds=BlocklyService.getToolboxBounds();
                $scope.position=BlocklyService.getToolboxPosition();
                //console.dir($scope.position);
            })
        }],
        
        link:function($scope,$element,attrs){
            $scope.iconMode=false;
            $scope.bounds={width:0,height:0};
            $scope.position={left:0,top:0};    
            
            var template= angular.element('<a id="button_toggle_toolbox"  ng-click="ngModel=!ngModel" style="width:{{bounds.width}}px;left:{{position.left}}px"><ng-slide target="blocklyToolboxDiv" ng-model="ngModel"></ng-slide></a>');
           
            
            
            if (validateFileExtension($scope.iconShow) && validateFileExtension($scope.iconHide) ) {
                $scope.iconMode=true;
                //console.dir($scope.icon);
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
           //console.dir($element.html()); 
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
            //console.dir($scope.ngModel);
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

;
})(angular,Blockly,X2JS,_);