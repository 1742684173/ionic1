angular.module('app.pointsController', [])

	.controller('menuPointsCtrl',
		function($controller, $scope) {

			$controller('basePointsCtrl', {
				$scope: $scope
			});
			console.log(angular.toJson($scope.param));

		});