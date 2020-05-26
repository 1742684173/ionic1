angular.module('app.accountService', [])
	.service('accountService', function($state, $http, $filter, $q, $ionicPopup, $cordovaToast, $ionicLoading, $cordovaAppVersion, $cordovaFileTransfer, $cordovaFileOpener2,
		$timeout, $translate, deviceFactory, signFactory, md5) {
		var $this = this;

		//登录
		this.login = function(account, pwd, isremeber) {
			//从config.js中获取
			var url = CONFIG_URLS.login_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.alias = account; //添加账户
			mySignObj.password = pwd; //添加密码
			mySignObj.isremeber = isremeber; //添加保存时长

			console.log("全局参数：" + angular.toJson(signObj));
			
			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"alias": account,
					"password": pwd,
					"isremeber": isremeber
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("登录请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("登录请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			})

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//获取验证码
		this.registerPhoneGetCode = function(phonenum) {
			//从config.js中获取
			var url = CONFIG_URLS.register_phone_get_code_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.phonenum = phonenum;

			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"phonenum": phonenum
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("获取验证码请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("获取验证码请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//手机注册
		this.registerPhone = function(phone, pwd, code) {
			//从config.js中获取
			var url = CONFIG_URLS.register_phone_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.username = phone;
			mySignObj.phonenum = phone;
			mySignObj.password = pwd;
			mySignObj.vercode = code;
			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"username": phone,
					"phonenum": phone,
					"password": pwd,
					"vercode": code
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("手机注册请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("手机注册请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 

		}

		//邮箱注册
		this.registerEmail = function(email, pwd) {
			//从config.js中获取
			var url = CONFIG_URLS.register_emial_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.username = email;
			mySignObj.email = email;
			mySignObj.password = pwd;
			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"username": email,
					"email": email,
					"password": pwd
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("邮箱注册请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("邮箱注册请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//退出登录
		this.loginOut = function() {
			//从config.js中获取
			var url = CONFIG_URLS.login_out_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(signObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
			}).success(function(data, status, headers, config) {
				console.log("登录请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("登录请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//找回密码
		this.findPwd = function(account, vercode, newpwd) {
			//从config.js中获取
			var url = CONFIG_URLS.findpwd_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.account = account;
			mySignObj.vercode = vercode;
			mySignObj.newpwd = newpwd;
			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"account": account,
					"vercode": vercode,
					"newpwd": newpwd
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("找回密码请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("找回密码请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//修改密码
		this.modifyPwd = function(oldpwd, newpwd) {
			//从config.js中获取
			var url = CONFIG_URLS.modify_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.oldpwd = oldpwd;
			mySignObj.newpwd = newpwd;
			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"oldpwd": oldpwd,
					"newpwd": newpwd,
				},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("修改密码请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("修改密码请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//获取服务端保存的版本信息
		this.getServerVersion = function() {
			//从config.js中获取
			var url = CONFIG_URLS.check_version_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(signObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {},
				headers: {
					"common": angular.toJson(signFactory.signDeleteNullValue(signObj)),
					"Content-Type": "application/x-www-form-urlencoded"
				},
				transformRequest: function(obj) {
					var str = [];
					for(var s in obj) {
						str.push(encodeURIComponent(s) + "=" + encodeURIComponent(obj[s]));
					}
					return str.join("&");
				}
				,"timeout":5000
			}).success(function(data, status, headers, config) {
				console.log("检查更新请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("检查更新请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

	})