
'use strict';
(function(angular,_){
angular
.module('ngDomotick',['ngBlockly','ui-router'])
.constant('states',function(){
    var states=[];
    states.push({
        name:'blockly',
        url:'/blockly',
        templateUrl:'',
        resolve:{
            sensors:function(ngDomotickService){
                return ngDomotickService.getSensors();
            }
        }

    });
})
.config(['$stateProvider','states', 'ngBlockly',function($stateProvider,states,ngBlockly){
    _.map(states,$stateProvider.state);
}])
.service('ngDomotickService',['sailsResource','toastr','$log','$q',function(sailsResource,toastr,$log,$q){
    var Sensor=sailsResource('Sensor',{
       // byname:{method:'GET',url:'/menu/byname/:name',isArray:false},
        //bystate:{method:'GET',url:'/menu/bystate/:state',isArray:false},
       // upsert:{method:'POST',url:'/menu/'},
       // left:{method:'GET',url:'/menu/left',isArray:true}
    })
    
    this.getSensors = function(){
        var d=$q.defer();
        Sensor.query(
            function(menus){d.resolve(menus);},
            function(err){
                $log.log(err);
                toastr.error('Impossible de recuperer les menus');
                d.reject(err);
            }
        )
        return d.promise;
    }
}])
;
})(angular,_);