angular.module('app.setController', [])

	.controller('menuSetCtrl', function($controller, $scope, $state, $cordovaAppVersion, $cordovaNetwork,
		$ionicLoading, $ionicPopup, $translate, $cordovaFileTransfer, $cordovaToast, $cordovaFileOpener2,
		$cordovaFile, $timeout,
		accountService, pushFactory, storageFactory, widgetFactory) {
		//用户信息
		$scope.loginData = {
			user: storageFactory.get(CONFIG_CACHE.user),
			name: ""
		}

		$scope.version = {
			"latest": "", //最新版本
			"now": "", //当前版本
			"isUpdate": false, //是否需要更新
			"url": "" //下载地址
		}

		//调用父级控制器之前先初始化需要的数据
		$controller('baseCtrl', {
			$scope: $scope
		});
		
		$scope.$on("$ionicView.beforeEnter", function() {
			getServerVersion();
			
			//当前版本
			$cordovaAppVersion.getVersionNumber().then(function(version) {
				$scope.version.now = version;
			}, false);
		});
		
		//前往账号与安全界面
		$scope.goAccountSet = function() {
			$state.go("secure");
		}

		document.addEventListener("deviceready", function() {

			//判断网络
			if($scope.networkState == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				return;
			}

		}, false);

		//更新版本
		$scope.softUpdate = function() {
			if(!$scope.version.isUpdate){
				return;
			} else if($cordovaNetwork.getNetwork() == CONFIG_CONNECTION.NONE) {
				$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
				//判断是否是wifi
			} else if($cordovaNetwork.getNetwork() == CONFIG_CONNECTION.WIFI) {
				isAndroid()
			} else {
				widgetFactory.updateAppPopup($translate.instant('SET_NO_WIFI')).then(function(res) {
					if(res == 'update') { //如果用户选择更新，则进行Android版本的更新
						console.log("res == 'update'");
						isAndroid();
					}
				})
			}
		}

		//根据不同的平台进行不同的更新
		var isAndroid = function() {
			console.log("根据不同的平台进行不同的更新");
			if(ionic.Platform.isAndroid()) {
				$scope.version.url = CONFIG_SERVER.androidUrl;
				getPermission();
			} else if(ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
				$scope.version.url = CONFIG_SERVER.IOSUrl;
				//$window.open(versionInfo.downloadUrl);//跳转到APP商店这样即可  
			} else {

			}
		}
		
		//获取服务器的版本
		var getServerVersion = function(){
			$ionicLoading.show();
			accountService.getServerVersion().then(
				function(resultData) {
					console.log("返回的信息:" + angular.toJson(resultData));
					$ionicLoading.hide();
					//检查请求结果
					var code = resultData.code;
					var msg = resultData.msg;
					//服务端保存的app版本
					$scope.version.latest = resultData.result.version;
					console.log("" + $scope.version.latest);
					//利用正则表达式把“.”转换成“0”，再进行数字的大小比较
					var serverVersionNum = parseInt($scope.version.latest.replace(new RegExp(/(\.)/g), '0'));
					//服务端保存的最新apk下载地址
					//$scope.version.url = resultData.result.apkUrl;
					if(code == CONFIG_REQUEST_SUCCESS) {
						var localVersionNum = parseInt($scope.version.now.replace(new RegExp(/(\.)/g), '0'));
						if(serverVersionNum > localVersionNum) {
							$scope.version.isUpdate = true;
						}
					} else {
						$cordovaToast.showLongCenter(msg);
					}
				},
				function() {
					$ionicLoading.hide();
					$ionicPopup.confirm({
						title: $translate.instant('INFO'),
						template: $translate.instant('DISCONNECT_SERVER')
					});
					console.log('Service get error');
				}
			);
		}

		//获取权限
		var getPermission = function() {
			console.log("权限判断");
			var permissions = cordova.plugins.permissions;
			permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function(status) {
				//判断存储权限是否打开
				if(!status.hasPermission) {
					permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE,
						function(status) {
							if(!status.hasPermission) {
								console.log("打开失败");
							} else {
								loadForAndroid($scope.version.url);
							}
						},
						function() {
							console.log("打开失败1");
						}
					);
				} else {
					loadForAndroid($scope.version.url);;
				}
			}, null);
		}

		//下载app
		var loadForAndroid = function(downloadUrl) {
			console.log("下载地址" + downloadUrl);
			var targetPath = CONFIG_TARGET_PATH;
			var trustHosts = true;
			var options = [];
			$ionicLoading.show({
				template: $translate.instant('SET_VERSION_DOWNLOADED_ZERO')
			});

			$cordovaFileTransfer.download(downloadUrl, targetPath, options, trustHosts).then(
				function(result) {
					console.log("下载成功");
					$cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
						console.log("安装apk");
					}, function(err) {
						console.log("下载新版本错误：" + err);
					});
					$ionicLoading.hide();
				},
				function(err) {
					console.log("下载失败" + angular.toJson(err));
					$ionicLoading.show({
						template: $translate.instant('SET_VERSION_DOWNLOAD_FAILED')
					});
					$ionicLoading.hide();
				},
				function(progress) {
					console.log("正在下载");
					$timeout(
						function() {
							var downloadProgress = (progress.loaded / progress.total) * 100;
							$ionicLoading.show({
								template: $translate.instant('SET_VERSION_DOWNLOADED') + Math.floor(downloadProgress) + $translate.instant('SET_VERSION_DOWNLOAD_PERCENT')
							});
							if(downloadProgress > 99) {
								$ionicLoading.hide();
							}
							$scope.$apply();
						}
					);
				});

		}

	})

	.controller('secureCtrl', function($controller, $scope, $state, $ionicLoading, $ionicPopup, $translate, $cordovaToast,
		accountService, pushFactory, storageFactory, md5) {
		$scope.pwdInfo = {
			oldpwd: "",
			newpwd: "",
			confirmpwd: ""
		};

		//调用父级控制器之前先初始化需要的数据
		$controller('baseCtrl', {
			$scope: $scope
		});

		//修改密码对话框		
		$scope.updatePwd = function() {
			//自定义弹窗
			var updatePopup = $ionicPopup.show({
				template: "<input id='oldPwdValue' placeholder='" + $translate.instant('SECURE_OLD_PWD') +
					"' type='password' style='padding-left:5px;' ng-model='pwdInfo.oldpwd'/><input id='newPwdValue' placeholder='" +
					$translate.instant('SECURE_NEW_PWD') + "' type='password' style='padding-left:5px;margin-top:10px;' ng-model='pwdInfo.newpwd'/><input id='confirmPwdValue' placeholder='" +
					$translate.instant('SECURE_CONFIRM_PWD') + "' type='password' style='padding-left:5px;margin-top:10px;' ng-model='pwdInfo.confirmpwd'/>",
				title: $translate.instant('SECURE_MODIFY_PWD'),
				scope: $scope,
				buttons: [{
						text: $translate.instant('SECURE_MODIFY_PWD_CANCEL')
					},
					{
						text: $translate.instant('SECURE_MODIFY_PWD_CONFIRM'),
						type: 'button-positive',
						onTap: function(e) {
							//updatePopup.close();
							console.log('Dialog', "has canceled");
							console.log(" oldPwd:" + $scope.pwdInfo.oldpwd + " newPwd:" + $scope.pwdInfo.newpwd + ",confirmPwd:" + $scope.pwdInfo.confirmpwd);
							var oldPwd = $scope.pwdInfo.oldpwd;
							var newPwd = $scope.pwdInfo.newpwd;
							var confirmPwd = $scope.pwdInfo.confirmpwd;

							if(newPwd.length < 6 || newPwd.length > 32) {
								e.preventDefault(); //阻止关掉窗口

								$scope.pwdInfo.oldpwd = "";
								$scope.pwdInfo.newpwd = "";
								$scope.pwdInfo.confirmpwd = "";
								console.log("pwd length error");
								$cordovaToast.showShortCenter($translate.instant('SECURE_PWD_LENGTH_ERROR'));
								return;
							}
							if(newPwd != confirmPwd) {
								e.preventDefault(); //阻止关掉窗口

								$cordovaToast.showLongCenter($translate.instant('SECURE_PWD_CONFIRM_ERROR'));
								console.log("两次输入的密码不一致");
								$scope.pwdInfo.oldpwd = "";
								$scope.pwdInfo.newpwd = "";
								$scope.pwdInfo.confirmpwd = "";
								return;
							}

							updatePopup.close();
							//修改密码，传递MD5加密后的密码
							modifyPwd(md5.createHash(oldPwd), md5.createHash(newPwd));
						}
					},
				]
			})

		};

		//修改密码
		var modifyPwd = function(oldPwd, newPwd) {
			$scope.pwdInfo.oldpwd = "";
			$scope.pwdInfo.newpwd = "";
			$scope.pwdInfo.confirmpwd = "";

			$ionicLoading.show(); //显示加载
			accountService.modifyPwd(oldPwd, newPwd).then(
				function(resultData) {
					$ionicLoading.hide(); //隐藏加载
					console.log("返回的信息:" + angular.toJson(resultData));
					//检查结果
					var code = resultData.code;
					var msg = resultData.msg;
					console.log("请求成功:code=" + code + " msg=" + msg);
					$cordovaToast.showLongCenter(msg);
					//会话超时，退出登录
					if(code == CONFIG_REQUEST_SESSION_TIMEOUT) {
						$scope.exit();
					} else if(code == CONFIG_REQUEST_SUCCESS) {
						//修改密码成功，需要退出重新登录
						$scope.exit();
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