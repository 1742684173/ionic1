angular.module('app.boxDataService', [])
	.service('boxDataService', function($state, $http, $filter, $q, webSocketService, deviceFactory, signFactory, md5) {
		var $this = this;

		//获取实时数据的组别
		this.getPointRealDataGroupList = function(param) {
			var type = param.type;
			var boxId = param.boxId;

			//获取请求地址
			var url = CONFIG_URLS.points_real_data_group;

			console.log("it's here");
			//获取全局参数并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.type = type;
			mySignObj.boxId = boxId;

			//获取待签名的字符串，并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数是：" + signStr);

			//进行Md5加密
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数:" + angular.toJson(signObj));

			var deferred = $q.defer();
			$http({
				method: "POST",
				url: url,
				data: {
					"type": type,
					"boxId": boxId
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
				console.log("实时数据组别请求成功" + angular.toJson(data));
				deferred.resolve(data); //声明执行成功，即http请求数据成功，可以返回数据了
			}).error(function(data, status, headers, config) {
				console.log("实时数据组别请求失败" + angular.toJson(data));
				deferred.reject(data); //声明执行失败，服务器返回错误
			})

			return deferred.promise; //返回承诺，这里不是返回数据，而是访问最终数据的API
		}

		//获取实时数据
		this.getPointRealDataList = function(param) {
			var mySignObj = {
				boxId: param.boxId,
				groupId: param.groupId,
				pageSize: param.pageSize,
				pageIndex: param.pageIndex
			};
			
			console.log("实时数据参数---->" + angular.toJson(mySignObj));
			var deferred = $q.defer();
			//webSocketService.connect(deferred, angular.toJson(mySignObj));
			webSocketService.send(deferred, angular.toJson(mySignObj));
			return deferred.promise; //返回承诺，这里不是返回数据，而是访问最终数据的API
		}

		//获取报警数据
		this.getPointAlarmDataList = function(param) {
			var boxId = param.boxId;
			var monitorBeginTime = param.monitorBeginTime;
			var monitorEndTime = param.monitorEndTime;
			var pageSize = param.pageSize;
			var pageIndex = param.pageIndex;
			var state = param.state;

			var url = CONFIG_URLS.points_alarm_data_url;
			var signObj = deviceFactory.getDevice();
			console.log("全局参数是：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.boxId = boxId;
			mySignObj.state = state;
			mySignObj.pageSize = pageSize;
			mySignObj.pageIndex = pageIndex;
			if(state == "2") {
				mySignObj.monitorBeginTime = monitorBeginTime;
				mySignObj.monitorEndTime = monitorEndTime;
			}

			//获取待签名的字符串，并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("报警数据待签名参数是：" + signStr);

			//进行Md5加密
			signObj.sign = md5.createHash(signStr);
			console.log("报警数据已签名全局参数:" + angular.toJson(signObj));

			var deferred = $q.defer();

			//当前报警与历史报警
			if(state == "1") {
				$http({
					method: "POST",
					url: url,
					data: {
						"boxId": boxId,
						"state": state,
						"pageIndex":pageIndex,
						"pageSize":pageSize
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
					console.log("报警数据请求成功" + angular.toJson(data));
					deferred.resolve(data); //声明执行成功，即http请求数据成功，可以返回数据了
				}).error(function(data, status, headers, config) {
					console.log("报警数据请求失败");
					deferred.reject(data); //声明执行失败，服务器返回错误
				})

			} else {
				$http({
					method: "POST",
					url: url,
					data: {
						"boxId": boxId,
						"monitorBeginTime": monitorBeginTime,
						"monitorEndTime": monitorEndTime,
						"pageSize": pageSize,
						"pageIndex": pageIndex,
						"state": state
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
					console.log("报警数据请求成功" + angular.toJson(data));
					deferred.resolve(data); //声明执行成功，即http请求数据成功，可以返回数据了
				}).error(function(data, status, headers, config) {
					console.log("报警数据请求失败");
					deferred.reject(data); //声明执行失败，服务器返回错误
				})

			}
			return deferred.promise; //返回承诺，这里不是返回数据，而是访问最终数据的API
		}

		//获取历史数据
		this.getPointHistoryDataList = function(param) {
			var boxId = param.boxId;
			var groupId = param.groupId;
			var pageSize = param.pageSize;
			var monitorId = param.monitorId;
			var pageIndex = param.pageIndex;
			var monitorBeginTime = param.monitorBeginTime;
			var monitorEndTime = param.monitorEndTime;

			var url = CONFIG_URLS.points_history_data_url;
			var signObj = deviceFactory.getDevice();
			console.log("全局参数是：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.boxId = boxId;
			mySignObj.groupId = groupId;
			mySignObj.monitorId = monitorId;
			mySignObj.monitorBeginTime = monitorBeginTime;
			mySignObj.monitorEndTime = monitorEndTime;
			mySignObj.pageSize = pageSize;
			mySignObj.pageIndex = pageIndex;

			//获取待签名的字符串，并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("待签名参数是：" + signStr);

			//进行Md5加密
			signObj.sign = md5.createHash(signStr);
			console.log("已签名全局参数:" + angular.toJson(signObj));

			var deferred = $q.defer();
			$http({
				method: "POST",
				url: url,
				data: {
					"boxId": boxId,
					"groupId": groupId,
					"monitorId": monitorId,
					"monitorBeginTime": monitorBeginTime,
					"monitorEndTime": monitorEndTime,
					"pageSize": pageSize,
					"pageIndex": pageIndex
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
				console.log("历史数据请求成功" + angular.toJson(data));
				deferred.resolve(data); //声明执行成功，即http请求数据成功，可以返回数据了
			}).error(function(data, status, headers, config) {
				console.log("历史数据请求失败" + angular.toJson(data));
				deferred.reject(data); //声明执行失败，服务器返回错误
			})

			return deferred.promise; //返回承诺，这里不是返回数据，而是访问最终数据的API
		}

		//根据组别获取监控点
		this.getPoints = function(param) {
			var boxId = param.boxId;
			var groupId = param.groupId;

			console.log("boxService:boxId=" + boxId + " groupId" + groupId);

			//从config.js中获取
			var url = CONFIG_URLS.points_data_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.boxId = boxId; //盒子ID，可为空，不传默认全部
			mySignObj.groupId = groupId; //组别ID，可为空

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
					"boxId": boxId,
					"groupId": groupId
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
				console.log("所有的监控点数据请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("所有的监控点数据请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//获取盒子列表
		this.getBoxsList = function() {
			//从config.js中获取
			var url = CONFIG_URLS.boxs_list_url;
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
				console.log("获取boxs请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("获取boxs请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}

		//修改监控点
		this.modifyPoint = function(param) {
			console.log("实时数据参数---->" + angular.toJson(param));
			var deferred = $q.defer();
			webSocketService.send(deferred, angular.toJson(param));
			return deferred.promise; 
			
		}

		//获取监控点详情
		this.getPoint = function(param) {

			var monitorId = param.monitorId;

			console.log("boxService:monitorId=" + monitorId);

			//从config.js中获取
			var url = CONFIG_URLS.point_detail_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.monitorId = monitorId; //监控点ID

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
					"monitorId": monitorId
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
				console.log("获取监控点数据数据请求成功" + angular.toJson(data));
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				console.log("获取监控点数据数据请求失败" + angular.toJson(data));
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 

		}

		//确认报警
		this.confirmAlarm = function(param){
			var monitorId = param.monitorId;//监控点序号
			var monitorTime = param.monitorTime;//监控点时间

			console.log("modifyPoint: monitorId->" + monitorId + " monitorTime->" + monitorTime);

			//修改监控点数据的url，从config.js中获取
			var url = CONFIG_URLS.confirm_alarm_url;
			//获取全局参数 并相应的增加一些请求参数
			var signObj = deviceFactory.getDevice();
			console.log("全局参数：" + angular.toJson(signObj));

			var mySignObj = deviceFactory.getDevice();
			mySignObj.alarm_cfg_id = "" + monitorId;
			mySignObj.monitor_time = "" + monitorTime;

			//获取待签名的字条串  并把key加在末尾
			var signStr = signFactory.signOrderSrc(mySignObj) + "key=" + CONFIG_KEY;
			console.log("确认报警数据待签名参数：" + signStr);

			//进行md5加密,添加sign
			signObj.sign = md5.createHash(signStr);
			console.log("确认报警数据已签名全局参数：" + angular.toJson(signObj));

			var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			$http({
				method: "POST",
				url: url,
				data: {
					"alarm_cfg_id": monitorId,
					"monitor_time": monitorTime
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
				deferred.resolve(data); // 声明执行成功，即http请求数据成功，可以返回数据了 
			}).error(function(data, status, headers, config) {
				deferred.reject(data); // 声明执行失败，即服务器返回错误  
			});

			return deferred.promise; //// 返回承诺，这里并不是最终数据，而是访问最终数据的API 
		}
	})