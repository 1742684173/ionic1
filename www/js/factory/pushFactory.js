angular.module('app.pushFactory', [])
	.factory('pushFactory', function($rootScope, $state) {

		var server = {};

		// 当设备就绪时
		server.onDeviceReady = function() {
			console.log("设备就绪时")
			initiateUI();
		};

		//初始化jpush
		server.initiateUI = function() {
			try {
				window.plugins.jPushPlugin.init();

				if(device.platform != "Android") {
					window.plugins.jPushPlugin.setDebugMode(true);
					window.plugins.jPushPlugin.setStatisticsOpen(true);

				} else {
					window.plugins.jPushPlugin.setDebugModeFromIos(true);
					window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
				}
				console.log("初始化jpush成功!")
			} catch(exception) {
				console.log(exception);
			}

		}

		// 设置别名和标签
		server.setTagsAndAlias = function(tags, alias) {
			console.log("设置标签与别名" + tags + "  " + alias);
			try {
				window.plugins.jPushPlugin.setTagsWithAlias(tags, alias);
			} catch(exception) {
				console.log(exception);
			}
		}

		//设置标签
		server.setTags = function(tags) {
			console.log("设置标签:" + alias);
			$window.plugins.jPushPlugin.setTags(tags);
		}

		//设置别名
		server.setAlias = function(alias) {
			console.log("设置别名:" + alias);
			$window.plugins.jPushPlugin.setAlias(alias);
		}

		// 设置标签和别名
		server.onTagsWithAlias = function(event) {
			console.log("设置标签与别名的监听");
		};

		// 获取RegistrationID
		server.getRegistrationID = function() {
			console.log("获取RegistrationID");
			window.plugins.jPushPlugin.getRegistrationID(function(data) {
				try {
					console.log("JPushPlugin:registrationID is " + data);
					if(data.length == 0) {
						var t1 = window.setTimeout(getRegistrationID(), 1000);
					}
					return data;
				} catch(exception) {
					console.log(exception);
				}
			});

		};

		// 打开通知的回调函数
		server.onOpenNotification = function() {
			try {
				var alertContent = null;;
				if(device.platform == "Android") {
					window.plugins.jPushPlugin.openNotification.title;
					alertContent = window.plugins.jPushPlugin.openNotification.alert;
				} else {
					alertContent = event.aps.alert;
				}
			} catch(exception) {
				console.log("JPushPlugin:onOpenNotification" + exception);
			}
			return alertContent;
		};

		// 接收到通知时的回调函数
		server.onReceiveNotification = function(event) {
			console.log("接收到通知时的回调函数:" + event);
			try {
				var alertContent;
				if(device.platform == "Android") {
					alertContent = window.plugins.jPushPlugin.receiveNotification.alert;
					console.log("-->"+alertContent)
				} else {
					alertContent = event.aps.alert;
				}
			} catch(exception) {
				console.log(exception)
			}
			//return alertContent;
		};

		// 接收到消息时的回调函数
		server.onReceiveMessage = function(event) {
			console.log("接收到消息时的回调函数:" + event);
			try {
				if(device.platform == "Android") {
					message = window.plugins.jPushPlugin.receiveMessage.message;
					console.log("接收到消息时的回调函数:" + message);
				} else {
					message = event.content;
				}

			} catch(exception) {
				console.log("JPushPlugin:onReceiveMessage-->" + exception);
			}
		};

		//关掉推送
		server.stopPush = function() {
			console.log("关掉推送");
			window.plugins.jPushPlugin.stopPush();
		}

		//重启推送
		server.resumePush = function() {
			console.log("重启推送");
			window.plugins.jPushPlugin.resumePush();
			server.initiateUI();
		}

		//判断推送是否关闭 0-》打开 
		server.isStopPush = function() {
			window.plugins.jPushPlugin.isPushStopped(function(data) {
				if(data == 0) {
					console.log("推送通道打开的");
					return false;
				} else {
					console.log("推送通道关闭");
					return true;
				}
			});
		}

		//清除图标badge
		server.cleanBadgeNumber = function() {
			console.log("cleanBadgeNumber");
			if(ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
				window.plugins.jPushPlugin.setBadge(0);
				window.plugins.jPushPlugin.resetBadge();
				window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
			}
		}
		
		//开始统计当前页面
		server.startLogPageView = function(pageName) {
			console.log("beginLogPageView");
			window.plugins.jPushPlugin.startLogPageView(pageName);
		}
		
		//结束统计当前页面
		server.stopLogPageView = function(pageName) {
			console.log("stopLogPageView");
			window.plugins.jPushPlugin.stopLogPageView(pageName);
		}
		
		//登录统计
		server.loginTotal = function(account,bool,msg) {
			console.log("loginTotal");
			window.plugins.jPushPlugin.loginTotal(account,bool,msg);
		}
		
		//登录统计
		server.registerTotal = function(account,bool,msg) {
			console.log("registerTotal");
			window.plugins.jPushPlugin.registerTotal(account,bool,msg);
		}

		// 添加对回调函数的监听
		//		server.pushListener = function() {
		//			document.addEventListener("jpush.setTagsWithAlias", server.onTagsWithAlias, false);
		//			document.addEventListener("deviceready", server.onDeviceReady, false);
		//			document.addEventListener("jpush.openNotification", server.onOpenNotification, false);
		//			document.addEventListener("jpush.receiveNotification", server.onReceiveNotification, false);
		//			document.addEventListener("jpush.receiveMessage", server.onReceiveMessage, false);
		//		}

		return server;
	});