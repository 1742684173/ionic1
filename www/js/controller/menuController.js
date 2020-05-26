angular.module('app.menuController', [])
.controller('menuCtrl', function($scope, $stateParams, storageFactory) {
	console.log($scope.utype);
	console.log(storageFactory.get(CONFIG_CACHE.utype));
	//1 是管理员 2是帐号
	//$scope.utype = storageFactory.get(CONFIG_CACHE.utype)=="1"?true:false;
	console.log($scope.utype);
});