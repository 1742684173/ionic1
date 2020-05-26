


/*
 心跳连接 产生：
  断网时不会执行onclose
  如果当前发送websocket数据到后端，一旦请求超时，onclose便会执行，这时候便可进行绑定好的重连操作。
 * */
angular.module('app.webSocketService', [])
	.service('webSocketService', function($rootScope, $state, $http, $filter, $q, deviceFactory, signFactory, md5) {
		var ws = null;
		var deferred = null;
		var data = null;
		var lockReconnect = false; // 避免重复连接
		var isHandClose = false; //是否手动关闭

		//进行与服务器连接
		var connect = function() {
			console.log("connect--->" + data + " "+isHandClose);
			var param = "sid=" + deviceFactory.getSid() + "&ts=" + deviceFactory.getTs();
			var sign = param + "&key=" + CONFIG_KEY;
			param += "&sign=" + md5.createHash(sign);

			var url = CONFIG_SERVER.websocket + param;
			console.log(url);

			// 初始化
			if('WebSocket' in window) {
				ws = new WebSocket(url);
				initEventHandle();
			} else {
				console.log("该浏览器不支持WebSocket对象");
			}

		}

		//监听
		var initEventHandle = function() {
			// 绑定事件
			ws.onopen = function(evt) {
				console.log("onopen:打开了连接,现在进行发送内容" + data);
				ws.send(data);
				heartCheck.reset().start(); //收到消息就计时
			}

			//收到消息
			ws.onmessage = function(evt) {
				console.log("onmessage:" + evt.data);
				if(evt.data != 1) {
					$rootScope.$broadcast(CONFIG_WEBSOCKET.broadcast_real_point, angular.fromJson(evt.data));
					deferred.resolve(angular.fromJson(evt.data));
				}
				heartCheck.reset().start(); //收到消息就计时
			}

			//连接错误
			ws.onerror = function(evt) {
				console.log("onerror:连接服务器失败！");
				reconnect();
				if(deferred != null) {
					deferred.reject(evt.data);
				}
			}
			//连接关闭
			ws.onclose = function(evt) {
				//判断是否是手动关闭
				if(isHandClose) {
					console.log("手动关闭！");
					heartCheck.reset();//重置心跳
					isHandClose = false;
					deferred.resolve(evt.data);
				} else {
					console.log("非手动关闭！");
					reconnect();
//					if(deferred != null) {
//						deferred.resolve(evt.data);
//					}
				}
			}
		}

		//发送信息给服务器
		this.send = function(myDeferred, myData) {
			console.log("发送内容" + myData);
			deferred = myDeferred;
			data = myData;
			if(!ws || ws.readyState != 1) {
				connect();
				return;
			}
			ws.send(data);
		}

		//手动断开
		this.disconnect = function() {
			console.log("关掉连接");
			isHandClose = true;
			if(ws || ws.readyState == 1) {
				ws.close();
			}
			ws = null;
		}

		//重连操作
		var reconnect = function() {
			console.log("重连");
			if(lockReconnect){
				return;
			}
				
			lockReconnect = true;
			// 没连接上会一直重连，设置延迟避免请求过多
			setTimeout(function() {
				connect();
				lockReconnect = false;
			}, 2000);
		}

		// 心跳检测
		var heartCheck = {
			timeout: 30000, // 60秒
			timeoutObj: null,
			serverTimeoutObj: null,
			reset: function() {
				clearTimeout(this.timeoutObj);
				clearTimeout(this.serverTimeoutObj);
				return this;
			},
			start: function() {
				var self = this;
				this.timeoutObj = setTimeout(function() {
					// 这里发送一个心跳，后端收到后，返回一个心跳消息，
					// onmessage拿到返回的心跳就说明连接正常
					var params = {
						markid: -1,
					};
					if(!isHandClose) {
						console.log("----》心跳了");
						ws.send(angular.toJson(params));
					} else {
						console.log("----》手动断开了");
					}
					/*
					 * self.serverTimeoutObj = setTimeout(function ()
					 * {// 如果超过一定时间还没重置，说明后端主动断开了 ws.close();//
					 * 如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect //
					 * 会触发onclose导致重连两次 }, self.timeout)
					 */
				}, this.timeout)

			}
		}

	})