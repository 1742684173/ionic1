angular.module('app.baseController', [])

	.controller('baseCtrl', function($rootScope, $scope, $state, $location,$ionicTabsDelegate,$ionicHistory, 
		$ionicLoading, pushFactory, storageFactory, accountService) {
		
		//返回上一个界面
		$scope.back = function() {
			$ionicHistory.goBack();
		}

//		//进入之前的操作
//		$scope.$on("$ionicView.beforeEnter", function() {
//			pushFactory.cleanBadgeNumber(); //主要是为ios清除应用上推送的数字
//		});
		
		//进行网络监听
		document.addEventListener("deviceready", function() {
			console.log("父控制器");
			pushFactory.cleanBadgeNumber();//清除
			
			// 监听手机网络在线事件
			$rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
				console.log("网络在线了。。。。。。" + networkState);
				$scope.networkState = networkState;
			})

			// 监听手机网络离线事件
			$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
				console.log("网络断线了。。。。。。" + networkState);
				$scope.networkState = networkState;
			})

		}, false);

		//退出登录
		$scope.exit = function() {
			$ionicLoading.show();

			//清除推送别名
			pushFactory.setTagsAndAlias([], "");

			//清除登录信息
			storageFactory.remove(CONFIG_CACHE.token);
			storageFactory.remove(CONFIG_CACHE.utype);
			accountService.loginOut().then(function(data) {
				console.log(angular.toJson(data));
				$ionicLoading.hide();
				$state.go("login");
			}, function(data) {
				console.log(angular.toJson(data));
				$ionicLoading.hide();
				$state.go("login");
			});
		}
		
		document.addEventListener("jpush.openNotification", function(event){
			console.log("打开通知！！！！");
			pushFactory.cleanBadgeNumber();//主要是为ios清除应用上推送的数字
			if($location.path() != '/menu/points'){
				$state.go("menu.points");
			}
			$ionicTabsDelegate.select(1);//进入报警页面
			$scope.$apply();
		}, false);
		document.addEventListener("jpush.receiveNotification", function(event){
			console.log("收到通知！！！！"+window.plugins.jPushPlugin.receiveNotification.alert);
			pushFactory.cleanBadgeNumber();//主要是为ios清除应用上推送的数字
		}, false);

	});