angular.module('app.basePointsController', [])

	.controller('basePointsCtrl', function($controller, $rootScope, $interval, $location, $scope, $state, $http, $translate, $filter, $q,
		$ionicHistory, $timeout, $ionicLoading, $cordovaToast, $ionicPopup, boxDataService, webSocketService,
		storageFactory, widgetFactory, pushFactory, ionicDatePicker, deviceFactory) {

		$scope.param = {
			boxId: storageFactory.get(CONFIG_CACHE.utype) == "1" ? "-100" : "-200", //盒子ID，可为空，不传则默认全部
			groupId: "0", //组别ID，可为空，不传默认全部
			monitorId: "0", //监控点ID，可为空，不传默认全部
			monitorName: "", //监控点名称
			monitorTime: "", //监控点时间
			monitorBeginTime: "", //监控开始时间
			monitorEndTime: "", //监控结束时间
			pageSize: "10", //每页数量，不传默认10条
			pageIndex: "1", //第几页，默认从1开始
			state: "1", //主要是针对报警数据，状态 1--未确认，2--确认
			type: "1" //分组类型   1：实时数据，2：历史数据，3：报警数据，不可为空
		}

		$scope.realPage = 1; //用来记录实时数据的当前页
		$scope.realTotalPage = 1; //总页数

		$scope.alarmPage = 1 //用来记录报警数据的当前页
		$scope.alarmTotalPage = 1; //总页数

		$scope.historyPage = 1; //用来记录历史数据的当前页
		$scope.historyTotalPage = 1; //总页数

		//$scope.selectGroup = "all"; //这里要设置成view的值一样
		//$scope.selectGroup = {} //实时数据的组别
		//$scope.realData = {} //实时数据

		var date = new Date();
		$scope.isLoadComplete = false; //显示是否加载完成
		$scope.isShowAlarm = "ture" //ture->显示当前报警,false->历史报警
		$scope.alarmBeginDate = $filter('date')(date, 'yyyy-MM-dd'); //查询历史数据时的开始时间
		$scope.alarmEndDate = $filter('date')(date.setDate(date.getDate()+1), 'yyyy-MM-dd'); //查询历史数据时的结束时间
		//$scope.alarmData = {} //报警数据

		//$scope.historyPoint = {} //该账户所有的监控点
		$scope.historyBeginDate = $filter('date')(date, 'yyyy-MM-dd'); //查询历史数据时的开始时间
		$scope.historyEndDate = $filter('date')(date.setDate(date.getDate()+1), 'yyyy-MM-dd'); //查询历史数据时的结束时间
		//$scope.historyData = {} //历史数据

		//获取日期控件实例
		var alarmBeginDateObj = widgetFactory.getDatePacker();
		var alarmEndDateObj = widgetFactory.getDatePacker();
		var historyBeginDateObj = widgetFactory.getDatePacker();
		var historyEndDateObj = widgetFactory.getDatePacker();

		//报警数据日期选择控件的开和关
		$scope.openAlarmBeginDate = function() {
			ionicDatePicker.openDatePicker(alarmBeginDateObj);
		}
		$scope.openAlarmEndDate = function() {
			ionicDatePicker.openDatePicker(alarmEndDateObj);
		}
		//历史数据日期选择控件的开和关
		$scope.openHistoryBeginDate = function() {
			ionicDatePicker.openDatePicker(historyBeginDateObj);
		}
		$scope.openHistoryEndDate = function() {
			ionicDatePicker.openDatePicker(historyEndDateObj);
		}

		//选择日期后的回调
		alarmBeginDateObj.callback = function(val) {
			if(typeof(val) === 'undefined') {} else {
				$scope.alarmBeginDate = $filter('date')(new Date(val), 'yyyy-MM-dd');
				alarmBeginDateObj.inputDate = new Date(val); //更新日期弹框上的日期  

				//判断开始时间是否大于结束时间,
				if($scope.alarmBeginDate > $scope.alarmEndDate) {
					console.log("开始时间大于结束时间");
					$scope.alarmEndDate = $scope.alarmBeginDate;
				}
			}
		};
		//选择日期后的回调
		alarmEndDateObj.callback = function(val) {
			if(typeof(val) === 'undefined') {} else {
				$scope.alarmEndDate = $filter('date')(new Date(val), 'yyyy-MM-dd');
				alarmEndDateObj.inputDate = new Date(val); //更新日期弹框上的日期  

				//判断结束时间是否小于开始时间,
				if($scope.alarmEndDate < $scope.alarmBeginDate) {
					console.log("结束日期小于开始日期");
					$scope.alarmBeginDate = $scope.alarmEndDate;
				}
			}
		};
		//选择日期后的回调
		historyBeginDateObj.callback = function(val) {
			if(typeof(val) === 'undefined') {} else {
				$scope.historyBeginDate = $filter('date')(new Date(val), 'yyyy-MM-dd');
				historyBeginDateObj.inputDate = new Date(val); //更新日期弹框上的日期  

				//判断开始时间是否大于结束时间,
				if($scope.historyBeginDate > $scope.historyEndDate) {
					console.log("开始时间大于结束时间");
					$scope.historyEndDate = $scope.historyBeginDate;
				}
			}
		};
		//选择日期后的回调
		historyEndDateObj.callback = function(val) {
			if(typeof(val) === 'undefined') {} else {
				$scope.historyEndDate = $filter('date')(new Date(val), 'yyyy-MM-dd');
				historyEndDateObj.inputDate = new Date(val); //更新日期弹框上的日期  

				//判断结束时间是否小于开始时间,
				if($scope.historyEndDate < $scope.historyBeginDate) {
					console.log("结束日期小于开始日期");
					$scope.historyBeginDate = $scope.historyEndDate;
				}
			}
		};

		//调用父级控制器之前先初始化需要的数据 这里要准备的就是分类 和 tab的索引
		$controller('baseCtrl', {
			$scope: $scope
		});

		//进入之前的操作
		$scope.$on("$ionicView.beforeEnter", function() {
			var stopEvent = $interval(function() {
				if(!$rootScope.isPlatformReady) {
					$ionicLoading.show();
				} else {
					$interval.cancel(stopEvent);
					findPointsGroup($scope.param); //查询实时数据的组别
					findAlarm($scope.param); //查找当前报警数据
					findPoints($scope.param); //查询所有的监控点
					pushFactory.cleanBadgeNumber(); //主要是为ios清除应用上推送的数字
				}
			}, 50)

		});

		//离开之前断开websocket连接
		$scope.$on("$ionicView.beforeLeave", function() {
			webSocketService.disconnect();
		});

		//进行网络监听
		document.addEventListener("deviceready", function() {

			// 监听手机网络在线事件
			$rootScope.$on('$cordovaNetwork:online', function(event, networkState) {

				if($location.path() == '/menu/points' || $location.path() == '/box') {
					findPointsGroup($scope.param); //查询实时数据的组别
					//findRealByGroup($scope.param); //查询实时数据
					findAlarm($scope.param); //查找当前报警数据
					findPoints($scope.param); //查询所有的监控点
				}
				$scope.networkState = networkState;
			})

			// 监听手机网络离线事件
			$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
				console.log("网络断线了。。。。。。" + networkState);
				$scope.networkState = networkState;
			})

		}, false);

		//当服务器中的实时数据有变化时,就会收到消息,就更新数据
		$scope.$on(CONFIG_WEBSOCKET.broadcast_real_point, function(event, data) {
			console.log("实时数据发生变化了");
			
			var list = data.list; //获取数据
			
			//判断从服务器传过来的值是否为空
			if(data.currentPage == undefined || data.totalPage == undefined || list == undefined || list.length == 0) {
				return;
			//判断当前的数据是否为空，为空，直接进行替换	
			} else if($scope.pointRealData == undefined || $scope.pointRealData.length == 0) {
				$scope.pointRealData = list;
				$scope.currentPage = data.currentPage; //当前页数
				$scope.realTotalPage = data.totalPage; //总共页数
				$scope.$apply();
			//判断是否是当前页，不是直接替换
			} else if($scope.currentPage != data.totalPage){
				$scope.pointRealData = list;
				$scope.currentPage = data.currentPage; //当前页数
				$scope.realTotalPage = data.totalPage; //总共页数
				$scope.$apply();
			}else {
				$scope.currentPage = data.currentPage; //当前页数
				$scope.realTotalPage = data.totalPage; //总共页数
				if($scope.pointRealData.length > list.length) {
					for(var i = 0; i < $scope.pointRealData.length; i++) {

						if(list[i] == undefined) {
							$scope.pointRealData.splice(i, 1);
						} else {
							//修改名称
							if($scope.pointRealData[i].monitorName != list[i].monitorName) {
								$scope.pointRealData[i].monitorName = list[i].monitorName;
							}
							//修改数值
							if($scope.pointRealData[i].number != list[i].number) {
								$scope.pointRealData[i].number = list[i].number;
							}
							//修改状态
							if($scope.pointRealData[i].state != list[i].state) {
								$scope.pointRealData[i].state = list[i].state;
							}
						}
					}
				} else if($scope.pointRealData.length < list.length) {
					for(var i = 0; i <list.length; i++) {

						if($scope.pointRealData[i] == undefined) {
							$scope.pointRealData.unshift(list[i]);
						} else {
							//修改名称
							if($scope.pointRealData[i].monitorName != list[i].monitorName) {
								$scope.pointRealData[i].monitorName = list[i].monitorName;
							}
							//修改数值
							if($scope.pointRealData[i].number != list[i].number) {
								$scope.pointRealData[i].number = list[i].number;
							}
							//修改状态
							if($scope.pointRealData[i].state != list[i].state) {
								$scope.pointRealData[i].state = list[i].state;
							}
						}
					}
				} else {
					for(var i = 0; i < list.length; i++) {

						//修改名称
						if($scope.pointRealData[i].monitorName != list[i].monitorName) {
							$scope.pointRealData[i].monitorName = list[i].monitorName;
						}
						//修改数值
						if($scope.pointRealData[i].number != list[i].number) {
							$scope.pointRealData[i].number = list[i].number;
						}
						//修改状态
						if($scope.pointRealData[i].state != list[i].state) {
							$scope.pointRealData[i].state = list[i].state;
						}
					}
				}
				$scope.$apply();
			}
		});

		//点击实时数据的item 进入监控点
		$scope.goPoint = function(item) {
			console.log(angular.toJson(item));
			$state.go("pointdetails", {
				point: angular.toJson(item)
			});
		}

		//查询实时数据根据组别
		$scope.findRealDataByGroup = function(groupId) {
			$scope.realPage = 1;
			console.log("根据组别" + groupId + "查询实时数据");
			var requestParam = $scope.param;
			requestParam.pageIndex = "1";
			requestParam.groupId = groupId;
			findRealByGroup(requestParam);
		}

		//选择报警还是历史
		$scope.showAlarm = function(bool) {
			$scope.isShowAlarm = !$scope.isShowAlarm;

			$scope.alarmPage = 1;
			$scope.alarmTotalPage = 1; //在这里把它设置为只有一页，很重要的

			if(bool) {
				$scope.isShowAlarmData = false;
				var requestParam = $scope.param;
				requestParam.pageIndex = "1";
				requestParam.state = "1";
				findAlarm(requestParam);
			} else {
				$scope.alarmData = [];
			}
		}

		//查询历史报警按钮
		$scope.findAlarm = function() {
			console.log("-----》开始查询历史报警数据了");

			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			var requestParam = $scope.param;
			requestParam.monitorBeginTime = $scope.alarmBeginDate;
			requestParam.monitorEndTime = $scope.alarmEndDate;
			requestParam.state = "2";
			requestParam.pageIndex = "1";

			findAlarm(requestParam);
		}

		//确认报警
		$scope.confirmAlarm = function(item) {
			console.log("确认报警数据:" + angular.toJson(item));
			var confirmPopup = $ionicPopup.confirm({
				title: $translate.instant("INFO"),
				template: '<span style=text-transform:none;>' + $translate.instant("ALARM_CONFIRM_INFO") + '</span>',
				buttons: [{
					text: $translate.instant("CONFIRM"),
					onTap: function(e) {
						//判断网络
						if($scope.networkState == CONFIG_CONNECTION.NONE) {
							$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
							return;
						}

						var requestParam = $scope.param;
						requestParam.monitorId = item.monitorId;
						requestParam.monitorTime = item.monitorTime;

						confirmAlarm(requestParam);
					}
				}, {
					text: $translate.instant("CANCEL")
				}]
			});

		}

		//显示报警数据的详细信息
		$scope.showAlarmDetail = function(alarm) {
			var status1 = alarm.state == 1 ? true : false;
			var status2 = alarm.state == 2 ? true : false;
			var templateStr = "";
			if(alarm.state == 1) {
				templateStr = "<div style='text-transform:none;text-align:center'>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_ID') + ":</div>" +
					"<div class='col'>" + alarm.monitorId + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_NAME') + ":</div>" +
					"<div class='col'>" + alarm.monitorName + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_VALUE') + ":</div>" +
					"<div class='col '>" + alarm.number + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_HANDLE') + ":</div>" +
					"<div class='col'>" + $translate.instant('ALARM_STATUS_CONFIRMING') + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_DATE') + ":</div>" +
					"<div class='col'>" + $filter('date')(alarm.monitorTime, 'yyyy-MM-dd') + "<br>" +
					$filter('date')(alarm.monitorTime, 'hh-mm-ss') + "</div>" +
					"</div>" +
					"</div>"

			} else if(alarm.state == 2) {
				templateStr = "<div style='text-transform:none;text-align:center'>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_NAME') + ":</div>" +
					"<div class='col'>" + alarm.monitorName + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_VALUE') + ":</div>" +
					"<div class='col'>" + alarm.number + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_HANDLE') + ":</div>" +
					"<div class='col'>" + $translate.instant('ALARM_STATUS_CONFIRMED') + "</div>" +
					"</div>" +
					"<div class='row'>" +
					"<div class='col col-30'>" + $translate.instant('ALARM_DATE') + ":</div>" +
					"<div class='col'>" + $filter('date')(alarm.monitorTime, 'yyyy-MM-dd') + "<br>" +
					$filter('date')(alarm.monitorTime, 'hh-mm-ss') + "</div>" +
					"</div>" +

					"</div>"
			}
			var myPopup = $ionicPopup.show({
				template: templateStr,
				title: $translate.instant('INFO'),
				scope: $scope,
				buttons: [{
					text: $translate.instant('CANCEL')
				}]
			});
		}

		//监控点发生变化
		$scope.pointChange = function(data) {
			console.log("监控点发生改变");
			$scope.selectPoint = data;
		}

		//查询历史数据
		$scope.findHistory = function() {
			console.log("开始查询历史数据了......");
			var requestParam = $scope.param;

			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			requestParam.monitorId = "" + $scope.selectPoint;
			requestParam.monitorBeginTime = $scope.historyBeginDate;
			requestParam.monitorEndTime = $scope.historyEndDate;
			requestParam.pageIndex = "1";

			findHistory(requestParam);
		}

		//根据页数来查找实时数据
		$scope.findRealByPage = function(page) {
			console.log("--->查询" + page + "页的实时数据");

			if(page <= 0) {
				$cordovaToast.showLongCenter($translate.instant('REAL_TOP_PAGE_INFP'));
				return;
			}

			if(page > $scope.realTotalPage) {
				$cordovaToast.showLongCenter($translate.instant('REAL_BOTTOM_PAGE_INFP'));
				return;
			}

			var requestParam = $scope.param;
			requestParam.pageIndex = "" + page;
			findRealByGroup(requestParam);
		}

		//监听实时数据的变化
		//		$scope.$watch('input.Tel', function(newValue, oldValue) {
		//			console.log($scope.input.Tel);
		//			if($scope.input.Tel != oldValue) {
		//				//当value改变时执行的代码
		//			}
		//		});

		//下拉显示上一页
		$scope.doRefresh = function(type) {

			if(type == 2) { //报警数据分布查询

				$scope.alarmPage = "1";

				var requestParam = $scope.param;
				requestParam.pageIndex = "" + $scope.alarmPage;
				findAlarm(requestParam);
				$scope.$broadcast('scroll.refreshComplete');

			} else if(type == 3) { //历史数据分布查询

				$scope.historyPage = "1";

				var requestParam = $scope.param;
				requestParam.pageIndex = "" + $scope.historyPage;
				findHistory(requestParam);
				$scope.$broadcast('scroll.refreshComplete');
			}

		}

		//上拉显示下一页
		$scope.loadmore = function(type) {
			//报警数据分布查询
			if(type == 2) {
				$scope.isLoadComplete = true;

				$scope.alarmPage++;
				var requestParam = $scope.param;
				requestParam.pageIndex = "" + $scope.alarmPage;

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				boxDataService.getPointAlarmDataList(requestParam).then(
					function(resultData) {
						var code = resultData.code;
						var msg = resultData.msg;
						console.log("请求成功:code=" + code + " msg=" + msg);

						//会话超时，退出登录
						if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
							$scope.exit();
						} else if(code == CONFIG_REQUEST_SUCCESS) {
							//$scope.alarmData = resultData.result.list;
							$scope.alarmData.push.apply($scope.alarmData, resultData.result.list);
							$scope.alarmTotalPage = resultData.result.totalPage;
							$scope.$broadcast('scroll.infiniteScrollComplete');
						} else {
							$cordovaToast.showLongCenter(msg);
							$scope.$broadcast('scroll.infiniteScrollComplete');
						}
						$scope.isLoadComplete = false;
					},
					function() {
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
						$scope.$broadcast('scroll.infiniteScrollComplete');
						$scope.isLoadComplete = false;
					}
				);

			} else if(type == 3) { //历史数据分布查询
				$scope.historyPage++;

				var requestParam = $scope.param;
				requestParam.pageIndex = "" + $scope.historyPage;

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				boxDataService.getPointHistoryDataList(requestParam).then(
					function(resultData) {
						var code = resultData.code;
						var msg = resultData.msg;

						//会话超时，退出登录
						if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
							$scope.exit();
						} else if(code == CONFIG_REQUEST_SUCCESS) {
							//$scope.pointHistoryData = resultData.result.list;
							$scope.pointHistoryData.push.apply($scope.pointHistoryData, resultData.result.list);
							$scope.historyTotalPage = resultData.result.totalPage;
							//$scope.pointHistoryData.push.apply($scope.pointHistoryData, resultData.result.list);
						} else {
							$cordovaToast.showLongCenter(msg);
						}
						$scope.$broadcast('scroll.infiniteScrollComplete');
					},
					function() {
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
						$scope.$broadcast('scroll.infiniteScrollComplete');
					}
				);
			}

		}

		//查询监控点组别
		var findPointsGroup = function(param) {
			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.getPointRealDataGroupList(param).then(
				function(resultData) {
					$ionicLoading.hide();
					console.log("返回的信息是：" + angular.toJson(resultData));
					var code = resultData.code;
					var msg = resultData.msg;
					console.log("请求成功：code=" + code + ",msg=" + msg);
					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$scope.pointsGroup = resultData.result.list;
						//判空
						if($scope.pointsGroup != undefined) {
							$scope.selectGroup = $scope.pointsGroup.length > 0 ? "" + $scope.pointsGroup[0].groupId : "";

							console.log("$scope.selectGroup=" + $scope.selectGroup);
							var requestParam = $scope.param;
							requestParam.pageIndex = "1";
							requestParam.groupId = $scope.selectGroup;
							findRealByGroup(requestParam);

						}
					} else {
						$cordovaToast.showLongCenter(msg);
					}
				},
				function() {
					$ionicLoading.hide();
				}
			);
		}

		//查询实时数据
		var findRealByGroup = function(param) {
			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.getPointRealDataList(param).then(
				function(resultData) {
					var code = resultData.code;
					var msg = resultData.msg;
					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					}
					$ionicLoading.hide();
				},
				function(resultData) {
					$ionicLoading.hide();
				}
			);
		}

		//查询报警数据
		var findAlarm = function(param) {
			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.getPointAlarmDataList(param).then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载

					console.log("返回的信息:" + angular.toJson(resultData));
					//检查注册结果
					var code = resultData.code;
					var msg = resultData.msg;
					console.log("请求成功:code=" + code + " msg=" + msg);

					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$scope.alarmData = resultData.result.list;
						$scope.alarmTotalPage = resultData.result.totalPage;
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
					console.log('Service get error');
				}
			);
		}

		//查询历史数据
		var findHistory = function(param) {

			if($scope.selectPoint == undefined || $scope.selectPoint == "") {
				$cordovaToast.showShortCenter($translate.instant('HISTORY_SELECT_POINT'));
				return;
			}

			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.getPointHistoryDataList(param).then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载

					console.log("返回的信息:" + angular.toJson(resultData));
					//检查注册结果
					var code = resultData.code;
					var msg = resultData.msg;
					console.log("请求成功:code=" + code + " msg=" + msg);

					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$scope.pointHistoryData = resultData.result.list;
						$scope.historyTotalPage = resultData.result.totalPage;
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
					console.log('Service get error');
				}
			);

		}

		//查询监控点
		var findPoints = function(param) {
			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.getPoints(param).then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载

					console.log("返回的信息:" + angular.toJson(resultData));
					//检查注册结果
					var code = resultData.code;
					var msg = resultData.msg;
					console.log("请求成功:code=" + code + " msg=" + msg);

					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$scope.points = resultData.result.list;
					} else {
						$cordovaToast.showLongCenter(msg);
					}
				},
				function() {
					$ionicLoading.hide(); //隐藏加载
				}
			);
		}

		//确认报警
		var confirmAlarm = function(param) {
			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

			$ionicLoading.show();
			boxDataService.confirmAlarm(param).then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载

					var code = resultData.code;
					var msg = resultData.msg;
					console.log("报警返回数据："+angular.toJson(resultData));
					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$cordovaToast.showLongCenter(msg);

						for(count in $scope.alarmData) {
							if($scope.alarmData[count].monitorId == param.monitorId) {
								$scope.alarmData.splice(count, 1);
								break;
							}
						}
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
					console.log('Service get error');
				}
			);
		}

		// 接收到消息时的回调函数
		var onReceiveMessage = function(event) {
			console.log("接收到消息时的回调函数:" + event);
			var message;
			try {
				if(device.platform == "Android") {
					message = window.plugins.jPushPlugin.receiveMessage.message;
					console.log("接收到消息时的回调函数:" + message);
				} else {
					message = event.content;
				}
				console.log("接收到消息时的回调函数:" + $scope.isShowAlarm);
				console.log("当前盒子id:" + $scope.param.boxId);

				//如果报警数据是当前报警就直接替换
				if($scope.isShowAlarm) {
					var alarms = angular.fromJson(message); //
					console.log("1111" + angular.toJson(alarms));
					for(i in alarms) {
						//$location.path() == '/menu/points' || $location.path() == '/box'
						if($location.path() == '/menu/points') { //如果是在监控点页面就全部显示
							$scope.alarmData.unshift(alarms[i]);
						} else if($location.path() == '/box') { //在盒子页面就要根据监控点显示
							if(alarms[i].boxId == $scope.param.boxId) {
								$scope.alarmData.unshift(alarms[i]);
							}
						}

					}
					$scope.$apply();
				}
			} catch(exception) {
				console.log("JPushPlugin:onReceiveMessage-->" + exception);
			}
		};

		// 添加对回调函数的监听
		document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);

	});