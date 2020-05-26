angular.module('app.accountController', [])

	.controller('loginCtrl',
		function($controller, $rootScope, $scope, $state, $ionicLoading, $translate, $interval, $ionicPopup, $cordovaToast,
			accountService, storageFactory, pushFactory, md5) {

			//登录数据
			$scope.loginData = {
				user: storageFactory.get(CONFIG_CACHE.user), //账户
				pwd: storageFactory.get(CONFIG_CACHE.pwd), //密码
				token: storageFactory.get(CONFIG_CACHE.token), //保存用户登录状态
				utype: storageFactory.get(CONFIG_CACHE.utype), //分为管理员和视图账号
				isremeber: "1", //保存时长 0-默认，1-保存30天
			}

			//调用父级控制器之前先初始化需要的数据
			$controller('baseCtrl', {
				$scope: $scope
			});

			//清理用户登录信息
			$scope.clearUser = function() {
				$scope.loginData.user = '';
				$scope.loginData.pwd = '';
				storageFactory.remove(CONFIG_CACHE.user);
				storageFactory.remove(CONFIG_CACHE.pwd);
			}

			//清理密码
			$scope.clearPwd = function() {
				$scope.loginData.pwd = '';
				storageFactory.remove(CONFIG_CACHE.pwd);
			}

			//登录事件
			$scope.login = function() {
				var user = $scope.loginData.user;
				var pwd = $scope.loginData.pwd;
				var isremeber = $scope.loginData.isremeber;
				var utype = $scope.loginData.utype;

				//判断账户是否为空
				if(user == undefined || user == "") {
					console.log("账户为空");
					$ionicPopup.confirm({
						title: $translate.instant('LOGIN_INFO'),
						template: $translate.instant('LOGIN_ACCOUNT_NOT_NULL')
					});
					return;
				}

				//判断用户名不能带中文
				if(escape(user).indexOf("%u") >= 0) {
					console.log("用户名有中文");
					$ionicPopup.confirm({
						title: $translate.instant('LOGIN_INFO'),
						template: $translate.instant('LOGIN_ACCOUNT_NOT_CHINESE')
					});
					return;
				}

				//判断密码是否少于6位
				if(pwd == undefined) {
					console.log("密码小于6位");
					$ionicPopup.confirm({
						title: $translate.instant('LOGIN_INFO'),
						template: $translate.instant('LOGIN_PWD_NOT_NULL')
					});
					return;
				}

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				//显示加载
				$ionicLoading.show();
				//进入登录服务层
				accountService.login(user, md5.createHash(pwd), isremeber).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载

						console.log("返回的信息:" + angular.toJson(resultData));
						//检查注册结果
						var code = "" + resultData.code;
						var msg = resultData.msg;
						var sid = resultData.result.sid;
						var utype = resultData.result.utype;

						if(code == CONFIG_REQUEST_SUCCESS) {
							//登录成功保存密码与账户
							storageFactory.set(CONFIG_CACHE.user, user);
							storageFactory.set(CONFIG_CACHE.pwd, pwd);
							storageFactory.set(CONFIG_CACHE.token, sid);
							storageFactory.set(CONFIG_CACHE.utype, "" + utype);

							pushFactory.setTagsAndAlias([], user); //设置推送别名
							pushFactory.loginTotal(user, true, {
								"code": code,
								"msg": msg
							}); //登录成功统计
							//跳转到主界面
							console.log("马上跳转到主界面");
							$state.go("menu.points", null, {
								location: 'replace'
							});
						} else {
							$cordovaToast.showLongCenter(msg);
							pushFactory.loginTotal(user, false, {
								"code": code,
								"msg": msg
							}); //登录失败统计
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

			};

			//前往注册界面
			$scope.register = function() {
				$state.go("registerTab");
			};

			//前往找回密码界面
			$scope.findPwd = function() {
				$state.go("findPwdTab");
			};
		})

	.controller('registerTabCtrl',
		function($controller, $scope, $state, $ionicHistory, $filter, $interval, $ionicModal, $ionicLoading, $cordovaToast, $translate, $ionicPopup,
			accountService, storageFactory, pushFactory, md5) {
			//手机注册参数
			$scope.regPhone = {
				phone: "", //用户和手机是同一个
				code: "", //验证码
				password: ""
			}

			//邮箱注册参数
			$scope.regEmail = {
				email: "", //用户和邮箱是同一个
				password: ""
			}

			$scope.canClick = false; //在60s不能再点击
			$scope.description = $translate.instant("REGISTER_PHONE_CODE_GET");

			//调用父级控制器之前先初始化需要的数据
			$controller('baseCtrl', {
				$scope: $scope
			});

			//获取验证码
			$scope.registerPhoneGetCode = function() {
				console.log("获取验证码" + $scope.regPhone.phone);

				var second = 59; //60s才能重新获取
				var timerHandler; //60s倒计时

				//$ionicLoading.show(); //进行渲染加载效果
				var phone = "" + $scope.regPhone.phone;

				if(phone.length != 11) {
					console.log("手机号不正确");
					$cordovaToast.showShortCenter($translate.instant("REGISTER_PHONE_ERROR"));
					return;
				}

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				timerHandler = $interval(function() {
					if(second <= 0) {
						$interval.cancel(timerHandler);
						second = 59;
						$scope.description = $translate.instant("REGISTER_PHONE_CODE_GET");
						$scope.canClick = false;
					} else {
						$scope.description = second + $translate.instant("REGISTER_PHONE_CODE_GET_AGAIN");
						second--;
						$scope.canClick = true;
					}
				}, 1000)

				$ionicLoading.show();
				//进入服务层
				accountService.registerPhoneGetCode(phone).then(
					function(resultData) {
						$ionicLoading.hide();
						console.log(angular.toJson(resultData));
						//检查注册结果
						var code = "" + resultData.code;
						var msg = resultData.msg;
						console.log("注册请求成功:code=" + code + " msg=" + msg);

						$cordovaToast.showShortCenter(msg);
					},
					function() {
						$ionicLoading.hide();
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
						console.log('goodsService get error');
					}
				);

			}

			//手机注册
			$scope.registerPhone = function() {
				console.log("进入手机注册控制器");

				var phone = "" + $scope.regPhone.phone;
				var pwd = "" + $scope.regPhone.password;
				var code = "" + $scope.regPhone.code;
				if(phone.length != 11) {
					console.log("phone null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_PHONE_ERROR'));
					return;
				}

				if(pwd.length < 6) {
					console.log("pwd null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_PHONE_PWD1_MIN_6'));
					return;
				}

				if(code.length < 6) {
					console.log("code null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_PHONE_CODE_MIN_6'));
					return;
				}

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				$ionicLoading.show(); //进行渲染加载效果
				//进入服务层
				accountService.registerPhone(phone, md5.createHash(pwd), code).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载

						console.log(angular.toJson(resultData));

						//检查注册结果
						var code = "" + resultData.code;
						var msg = "" + resultData.msg;
						var sid = "" + resultData.result.sid;
						console.log("注册请求成功:code=" + code + " msg=" + msg);

						if(code == CONFIG_REQUEST_SUCCESS) {
							//注册成功统计
							pushFactory.registerTotal(phone, true, {
								"code": code,
								"msg": msg
							});
							//登录成功保存密码与账户
							var confirmPopup = $ionicPopup.confirm({
								title: $translate.instant('REGISTER_PHONE_MESSAGE'),
								template: $translate.instant('REGISTER_PHONE_ACTIVATE')
							});
							confirmPopup.then(function(res) {
								if(res) {
									$state.go("login");
								}
							});

						} else {
							//注册失败统计
							pushFactory.registerTotal(phone, false, {
								"code": code,
								"msg": msg
							});
							$cordovaToast.showShortCenter(msg);
						}
					},
					function() {
						$ionicLoading.hide(); //隐藏加载
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
						console.log('goodsService get error');
					}
				);
			}

			//邮箱注册
			$scope.registerEmail = function() {
				console.log("进入邮箱注册控制器");

				var email = $scope.regEmail.email;
				var pwd = $scope.regEmail.password;
				console.log("email=" + email + " pwd=" + pwd);
				if(email == "") {
					console.log("email null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_EMAIL_ACCOUNT_NULL'));
					return;
				}
				if(pwd == "") {
					console.log("pwd null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_EMAIL_PWD_NULL'));
					return;
				}

				$ionicLoading.show(); //进行渲染加载效果
				//进入服务层
				accountService.registerEmail(email, md5.createHash(pwd)).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载

						console.log(angular.toJson(resultData));
						//检查注册结果
						var code = "" + resultData.code;
						var msg = resultData.msg;
						console.log("注册请求成功:code=" + code + " msg=" + msg);

						if(code == CONFIG_REQUEST_SUCCESS) {
							//$cordovaToast.showLongCenter(msg);
							//注册成功统计
							pushFactory.registerTotal(email, true, {
								"code": code,
								"msg": msg
							});
							var confirmPopup = $ionicPopup.confirm({
								title: $translate.instant('REGISTER_EMAIL_MESSAGE'),
								template: $translate.instant('REGISTER_EMAIL_ACTIVATE')
							});
							confirmPopup.then(function(res) {
								if(res) {
									$state.go("login");
								}
							});
						} else {
							pushFactory.registerTotal(email, false, {
								"code": code,
								"msg": msg
							});
							$cordovaToast.showShortCenter(msg);
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

			$ionicModal.fromTemplateUrl('templates/protocol.html', {
				scope: $scope
			}).then(function(modal) {
				$scope.modal = modal;
			});

		})

	.controller('findPwdTabCtrl',

		function($controller, $scope, $state, $ionicHistory, $filter, $interval, $ionicLoading, $cordovaToast, $translate, $ionicPopup,
			accountService, storageFactory, md5) {
			$scope.canClick = false; //在60s不能再点击
			$scope.codeText = $translate.instant("FINDPWD_GET_CODE");
			$scope.user = {
				account: "",
				password: "",
				code: ""
			};

			//调用父级控制器之前先初始化需要的数据
			$controller('baseCtrl', {
				$scope: $scope
			});

			//获取验证码
			$scope.getCode = function() {
				console.log("获取验证码:" + $scope.user.account);

				var second = 59; //60s才能重新获取
				var timerHandler; //60s倒计时

				//$ionicLoading.show(); //进行渲染加载效果
				var account = "" + $scope.user.account;

				if(account == undefined || account.length <= 6) {
					$cordovaToast.showShortCenter($translate.instant("FINDPWD_USER_ERROR"));
					return;
				}

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				timerHandler = $interval(function() {
					if(second <= 0) {
						$interval.cancel(timerHandler);
						second = 59;
						$scope.codeText = $translate.instant("FINDPWD_GET_CODE");
						$scope.canClick = false;
					} else {
						$scope.codeText = second + $translate.instant("FINDPWD_CODE_GET_AGAIN");
						second--;
						$scope.canClick = true;
					}
				}, 1000)

				$ionicLoading.show();
				//进入服务层
				accountService.registerPhoneGetCode(account).then(
					function(resultData) {
						$ionicLoading.hide();
						console.log(angular.toJson(resultData));
						//检查注册结果
						var code = "" + resultData.code;
						var msg = resultData.msg;
						console.log("获取难码成功:code=" + code + " msg=" + msg);

						$cordovaToast.showShortCenter(msg);
					},
					function() {
						$ionicLoading.hide();
						$ionicPopup.confirm({
							title: $translate.instant('INFO'),
							template: $translate.instant('DISCONNECT_SERVER')
						});
					}
				);

			}

			//找回密码
			$scope.findPwd = function() {
				console.log("找回密码");

				var account = "" + $scope.user.account;
				var pwd = "" + $scope.user.password;
				var code = "" + $scope.user.code;

				if(account.length <= 6) {
					console.log("account error");
					$cordovaToast.showShortCenter($translate.instant('FINDPWD_USER_ERROR'));
					return;
				}

				if(pwd.length < 6) {
					console.log("pwd error");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_PHONE_PWD1_MIN_6'));
					return;
				}

				if(code.length < 6) {
					console.log("code null");
					$cordovaToast.showShortCenter($translate.instant('REGISTER_PHONE_CODE_MIN_6'));
					return;
				}

				//判断网络
				if($scope.networkState == CONFIG_CONNECTION.NONE) {
					$cordovaToast.showLongCenter($translate.instant('CONNECTION_NONE'));
					return;
				}

				$ionicLoading.show(); //进行渲染加载效果
				//进入服务层
				accountService.findPwd(account, code, md5.createHash(pwd)).then(
					function(resultData) {
						$ionicLoading.hide(); //隐藏加载

						console.log(angular.toJson(resultData));

						//检查注册结果
						var code = "" + resultData.code;
						var msg = "" + resultData.msg;
						var sid = "" + resultData.result.sid;
						console.log("修改请求成功:code=" + code + " msg=" + msg);

						if(code == CONFIG_REQUEST_SUCCESS) {
							var confirmPopup = $ionicPopup.confirm({
								title: $translate.instant('INFO'),
								template: $translate.instant('FINDPWD_MODIFY_SUCCESS')
							});
							confirmPopup.then(function(res) {
								if(res) {
									$state.go("login");
								}
							});
						} else {
							$cordovaToast.showShortCenter(msg);
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

		}
	)