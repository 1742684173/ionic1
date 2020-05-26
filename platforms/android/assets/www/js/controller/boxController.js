angular.module('app.boxController', [])

	.controller('boxCtrl',
		function($controller, $scope, $stateParams) {
			$scope.box = angular.fromJson($stateParams.box);
			
			$controller('basePointsCtrl', {
				$scope: $scope
			});
			
			//设置盒子id
			$scope.param.boxId = $scope.box.boxId; 
		
		})