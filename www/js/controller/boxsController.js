angular.module('app.boxsController', [])
	.controller('menuBoxsCtrl', function($rootScope, $controller, $ionicTabsDelegate, $scope, $state, $stateParams,
		$timeout,$translate, $ionicLoading, $cordovaToast, $ionicPopup, $ionicNavBarDelegate, boxDataService) {
		var map = null; //地图

		$scope.isShowMap = false; //是否显示地图，默认否
		$scope.boxsGroup = [];
		$scope.alarmBox = [];
		$scope.positions = [];

		$controller('baseCtrl', {
			$scope: $scope
		});

		//页面加载完成
		$scope.$watch('$viewContentLoaded', function() {
			map = new BMap.Map("allmap");
			// 添加带有定位的导航控件
			var navigationControl = new BMap.NavigationControl({
				// 靠左上角位置
				anchor: BMAP_ANCHOR_TOP_LEFT,
				// LARGE类型
				type: BMAP_NAVIGATION_CONTROL_LARGE,
				// 启用显示定位
				enableGeolocation: true
			});
			map.addControl(navigationControl);
			// 添加定位控件
			var geolocationControl = new BMap.GeolocationControl();
			geolocationControl.addEventListener("locationSuccess", function(e) {
				// 定位成功事件
				var address = '';
				address += e.addressComponent.province;
				address += e.addressComponent.city;
				address += e.addressComponent.district;
				address += e.addressComponent.street;
				address += e.addressComponent.streetNumber;
			});
			geolocationControl.addEventListener("locationError", function(e) {
				// 定位失败事件
				alert("定位失败，请重试！" + e.message);
			});
			map.addControl(geolocationControl);
			//添加”报警设备“按钮控件
			addAlarmControl();
			//添加”所有设备“按钮控件
			addAllControl();
			findBoxsList(); //查询盒子列表
		});

		// 定义一个控件类,即function
		function AlarmBoxControl() {
			// 默认停靠位置和偏移量
			this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
			this.defaultOffset = new BMap.Size(10, 160);
		}

		// 定义一个控件类,即function
		function AllBoxControl() {
			// 默认停靠位置和偏移量
			this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
			this.defaultOffset = new BMap.Size(10, 120);
		}

		//实现报警设备按钮控件
		var addAlarmControl = function() {
			// 通过JavaScript的prototype属性继承于BMap.Control
			AlarmBoxControl.prototype = new BMap.Control();

			// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
			// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
			AlarmBoxControl.prototype.initialize = function(map) {
				// 创建一个DOM元素
				var div = document.createElement("div");
				// 添加文字说明
				//				div.appendChild(document.createTextNode("报警"));
				var img = document.createElement("img");
				img.src = "img/alarm.svg";
				img.style.marginTop = "3px";
				div.appendChild(img);
				// 设置样式
				div.align = "center";
				div.style.position = "relative";
				div.style.width = "35px";
				div.style.height = "28px";
				div.style.cursor = "pointer";
				div.style.border = "1px solid #FDFDFB";
				div.style.backgroundColor = "#FDFDFB";
				div.style.color = "#686B72";
				div.style.zIndex = 15;
				div.style.boxShadow = "2px 2px 0.5px #C5C6C0"
				div.style.borderRadius = "3px";
				div.style.display = "block";
				div.style.fontSize = "14px";
				// 绑定事件,点击一次放大两级
				div.onclick = function(e) {
					console.log("显示报警设备");
					showAlarmBoxs();
				}
				// 添加DOM元素到地图中
				map.getContainer().appendChild(div);
				//将DOM元素返回
				return div;
			}
			// 创建控件
			var myZoomCtrl = new AlarmBoxControl();
			// 添加到地图当中
			map.addControl(myZoomCtrl);
		}

		//实现所有设备按钮控件
		var addAllControl = function() {
			// 通过JavaScript的prototype属性继承于BMap.Control
			AllBoxControl.prototype = new BMap.Control();

			// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
			// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
			AllBoxControl.prototype.initialize = function(map) {
				// 创建一个DOM元素
				var div = document.createElement("div");
				// 添加文字说明
				//				div.appendChild(document.createTextNode("报警"));
				var img = document.createElement("img");
				img.src = "img/all.svg";
				img.style.marginTop = "3px";
				div.appendChild(img);
				// 设置样式
				div.align = "center";
				div.style.position = "relative";
				div.style.width = "35px";
				div.style.height = "28px";
				div.style.cursor = "pointer";
				div.style.border = "1px solid #FDFDFB";
				div.style.backgroundColor = "#FDFDFB";
				div.style.color = "#686B72";
				div.style.zIndex = 15;
				div.style.boxShadow = "2px 2px 0.5px #C5C6C0"
				div.style.borderRadius = "3px";
				div.style.display = "block";
				div.style.fontSize = "14px";
				// 绑定事件,点击一次放大两级
				div.onclick = function(e) {
					console.log("显示报警设备");
					initMap();
				}
				// 添加DOM元素到地图中
				map.getContainer().appendChild(div);
				//将DOM元素返回
				return div;
			}
			// 创建控件
			var myZoomCtrl = new AllBoxControl();
			// 添加到地图当中
			map.addControl(myZoomCtrl);
		}

		//离开之前断开websocket连接
		$scope.$on("$ionicView.beforeLeave", function() {

		});

		//切换收缩图标
		$scope.toggleGroup = function(boxs) {
			console.log(boxs.show);
			boxs.show = !boxs.show;
		};

		//显示与隐藏item
		$scope.isGroupShown = function(boxs) {
			return boxs.show;
		};

		//前往box界面
		$scope.goBox = function(item) {
			console.log(angular.toJson(item));
			$state.go("box", {
				box: angular.toJson(item)
			});
		}

		//进行网络监听
		//		document.addEventListener("deviceready", function() {
		//
		//			// 监听手机网络在线事件
		//			$rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
		//
		//				if($location.path() == '/menu/boxs') {
		//					map = new BMap.Map("allmap");
		//					findBoxsList(); //查询盒子列表
		//				}
		//				$scope.networkState = networkState;
		//			})
		//
		//			// 监听手机网络离线事件
		//			$rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
		//				console.log("网络断线了。。。。。。" + networkState);
		//				$scope.networkState = networkState;
		//				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
		//			})
		//
		//		}, false);

		//显示地图
		$scope.showMap = function(bool) {
			console.log($scope.isShowMap)
			$scope.isShowMap = !$scope.isShowMap;
			console.log($scope.isShowMap)
			if(bool) {
				initMap();
			}
		}

		var showAlarmBoxs = function() {
			//先清除地图上的所有标记
			map.clearOverlays();
			console.log("清楚所有标注后，报警设备个数是：" + $scope.alarmBox.length);
			angular.forEach($scope.alarmBox, function(box, boxkey) {
				//			console.log("盒子名称：" + box.boxName + ",位置信息:" + box.map);
				var positionStr = box.map;
				var boxName = box.boxName;
				var boxId = box.boxId;
				var state = box.state;
				var isAlarm = box.isAlarm;
				var imgUrl;
				console.log("盒子状态是:" + state);
				console.log("盒子的位置信息：" + positionStr);
				if(positionStr != null) {
					$scope.positions = positionStr.split(",");
					if($scope.positions.length == 2) {
						console.log("经度：" + $scope.positions[0] + "纬度：" + $scope.positions[1]);
						//26.1075916614,119.4424346950
						var boxTag = new BMap.Point($scope.positions[0], $scope.positions[1]);
						var label = new BMap.Label(boxName, {
							offset: new BMap.Size(20, -10)
						});
						if(state == "1") {
							imgUrl = "img/box_location_online.svg";
						} else if(state == "0") {
							imgUrl = "img/box_location_offline.svg";
						}
						var myIcon = new BMap.Icon(imgUrl, new BMap.Size(25, 25), {
							anchor: new BMap.Size(12, 23)
						});
						//							marker = new BMap.Marker(boxTag);
						marker = new BMap.Marker(boxTag, {
							icon: myIcon
						}); // 创建标注
						map.addOverlay(marker);
						marker.setLabel(label);
						marker.addEventListener('click', function() {
							//			  				alert("盒子ID是：" + boxId);
							$state.go("box", {
								box: angular.toJson(box)
							});
						});
					}
				}
			})
		}

		//初始化地图
		var initMap = function() {
			//先清除地图上的所有标记
			map.clearOverlays();
			//初始化地图
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r) {
				if(this.getStatus() == BMAP_STATUS_SUCCESS) {
					var mk = new BMap.Marker(r.point);
					map.centerAndZoom(r.point, 10) //标注当前位置
				} else {
					alert('failed' + this.getStatus());
				}
			}, {
				enableHighAccuracy: true
			})
			console.log("将要产生标注点");
			var marker;
			angular.forEach($scope.boxsGroup, function(value, key) {
				//		console.log("分组名称：" + value.groupName);
				angular.forEach(value.boxList, function(box, boxkey) {
					//			console.log("盒子名称：" + box.boxName + ",位置信息:" + box.map);
					var positionStr = box.map;
					var boxName = box.boxName;
					var boxId = box.boxId;
					var state = box.state;
					var isAlarm = box.isAlarm;
					if(isAlarm == "1" && !isAlarmBoxExist(box)) {
						$scope.alarmBox.push(box);
						console.log("当前报警设备个数是:" + $scope.alarmBox.length);
					}
					var imgUrl;
					console.log("盒子状态是:" + state);
					console.log("盒子的位置信息：" + positionStr);
					if(positionStr != null) {
						$scope.positions = positionStr.split(",");
						if($scope.positions.length == 2) {
							console.log("经度：" + $scope.positions[0] + "纬度：" + $scope.positions[1]);
							//26.1075916614,119.4424346950
							var boxTag = new BMap.Point($scope.positions[0], $scope.positions[1]);
							var label = new BMap.Label(boxName, {
								offset: new BMap.Size(20, -10)
							});
							label.setStyle({
								color: "#3C4041",
								fontSize: "12px",
								border: "1",
								fontWeight: "bold"
							});
							if(state == "1") {
								imgUrl = "img/box_location_online.svg";
							} else if(state == "0") {
								imgUrl = "img/box_location_offline.svg";
							}
							var myIcon = new BMap.Icon(imgUrl, new BMap.Size(25, 25), {
								anchor: new BMap.Size(12, 23)
							});
							//							marker = new BMap.Marker(boxTag);
							marker = new BMap.Marker(boxTag, {
								icon: myIcon
							}); // 创建标注
							map.addOverlay(marker);
							marker.setLabel(label);
							marker.addEventListener('click', function() {
								//			  				alert("盒子ID是：" + boxId);
								$state.go("box", {
									box: angular.toJson(box)
								});
							});
						}
					}
				})
			})
			console.log("已经产生标注点");
		}

		var isAlarmBoxExist = function(insertBox) {
			for(var i = 0; i < $scope.alarmBox.length; i++) {
				if($scope.alarmBox[i] == insertBox) {
					console.log("待添加的报警设备已存在alarmBox数组中！");
					return true;
				}
			}
			console.log("alarmBox数组中不存在该待添加的报警设备！")
			return false;
		}

		//查询盒子列表
		var findBoxsList = function() {
			//显示加载
			$ionicLoading.show();
			//进入服务层
			boxDataService.getBoxsList().then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载

					console.log("返回的信息:" + angular.toJson(resultData));
					//检查注册结果
					var code = resultData.code;
					var msg = resultData.msg;
					var boxsGroup = resultData.result.list;
					console.log("注册请求成功:code=" + code + " msg=" + msg);
					console.log("注册请求成功:boxsGroup=" + angular.toJson(boxsGroup));

					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$cordovaToast.showLongCenter(msg);
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						$scope.boxsGroup = boxsGroup;
						//						map.clearOverlays();
						//						initMap();
						//initMap();
						//						$timeout(function() {
						//							initMap();
						//						}, 200);

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

	});