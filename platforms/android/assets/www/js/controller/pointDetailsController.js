angular.module('app.pointDetailsController', [])
	.controller('pointDetailsCtrl',
		function($controller, $scope, $stateParams, $state, $http, $translate, $ionicHistory, $filter, 
			$q, $cordovaToast, $ionicLoading, $ionicPopup, boxDataService,webSocketService) {
			$scope.point = angular.fromJson($stateParams.point);
			console.log($stateParams.point);
			var param = {
				addr_id: "", //监控点序号
				monitorId: "" + $scope.point.id, //监控点id
				number: $scope.point.number
			}

			//调用父级控制器之前先初始化需要的数据 这里要准备的就是分类 和 tab的索引
			$controller('baseCtrl', {
				$scope: $scope
			});

			//进入之前的操作
			$scope.$on("$ionicView.beforeEnter", function() {
				pointServer(param); //查询监控点信息
			});

			//离开之前断开websocket连接
			$scope.$on("$ionicView.beforeLeave", function() {
				//webSocketService.disconnect();
			});

			//修改监控点值			
			$scope.updateValue = function() {
				if($scope.point.state != 1) {
					$cordovaToast.showShortCenter($translate.instant('POINT_NO_MODIFY'));
					return;
				}
				//自定义弹窗
				var updatePopup = $ionicPopup.show({
					template: '<input id="updatePointValue" type="text" style="padding-left:5px;" ng-model="pointDetail.number">',
					title: $translate.instant('POINT_MODIFY_VALUE'),
					scope: $scope,
					buttons: [{
							text: $translate.instant('POINT_MODIFY_CANCEL')
						},
						{
							text: $translate.instant('POINT_MODIFY_CONFIRM'),
							type: 'button-positive',
							onTap: function(e) {
								updatePopup.close();
								console.log('Tapped', "sure");
								var modifyParam = {
									addr_id: $scope.pointDetail.monitorId,
									value: $scope.pointDetail.number,
									markid: "1"
								}
								console.log(" addrId" + modifyParam.addr_id + " value" + modifyParam.value);
								modifyPoint(modifyParam);
							}
						},
					]
				});
			};

			//修改监控点
			var modifyPoint = function(requestParam) {
				//return;
				if(requestParam.value.length > 256) {
					$cordovaToast.showShortCenter($translate.instant('POINT_VALUE_LENGTH_ERROR'));
					return;
				}

				$ionicLoading.show(); //显示加载
				boxDataService.modifyPoint(requestParam).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载
						if("1" == resultData.resultData) {
							$cordovaToast.showShortCenter($translate.instant('POINT_SUCCESS'));
						} else if("0" == resultData.resultData) {
							$cordovaToast.showShortCenter(resultData.resultError);
							$scope.pointDetail.number = $scope.point.number;
						} else {
							$cordovaToast.showShortCenter($translate.instant('POINT_FAILURE'));
							$scope.pointDetail.number = $scope.point.number;
						}
					},
					function() {
						$ionicLoading.hide(); //隐藏加载
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
						console.log('Service get error');
					}
				);
			}

			//查询监控点信息
			var pointServer = function(requestParam) {
				//return;
				$ionicLoading.show(); //显示加载

				boxDataService.getPoint(requestParam).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载

						console.log("返回的信息:" + angular.toJson(resultData));
						//检查结果
						var code = resultData.code;
						var msg = resultData.msg;
						console.log("请求成功:code=" + code + " msg=" + msg);

						//会话超时，退出登录
						if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
							$scope.exit();
						} else if(code == CONFIG_REQUEST_SUCCESS) {
							$scope.pointDetail = resultData.result.detail;
						} else {
							$cordovaToast.showLongCenter(msg);
						}
					},
					function() {
						$ionicLoading.hide(); //隐藏加载
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
					}
				);

			}

		});