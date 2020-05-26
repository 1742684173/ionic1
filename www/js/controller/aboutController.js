angular.module('app.aboutController', [])
	.controller('menuAboutCtrl', function($controller, $scope, $stateParams) {
		//调用父级控制器之前先初始化需要的数据
		$controller('baseCtrl', {
			$scope: $scope
		});
	});