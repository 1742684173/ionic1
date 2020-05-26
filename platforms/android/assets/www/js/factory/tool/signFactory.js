/**
 * 签名
 */
angular.module('app.signFactory', [])
	.factory('signFactory', function() {
		var server = {};
		
		//进行字典升排序
		server.signOrderSrc = function(json) {
			//console.log("进入签名字典排序"+angular.toJson(json));
			var sign = "";
			var sdic = Object.keys(json).sort();
			//console.log(angular.toJson(sdic));
			for(ki in sdic) {
				if(json[sdic[ki]].length > 0) {
					sign += sdic[ki] + "=" + json[sdic[ki]] + "&";
				}
			}
			return sign;
		}

		//去掉json中值长度小于等于0
		server.signDeleteNullValue = function(json) {
			var myJson = {};
			//console.log("去掉json中值长度小于等于0");
			//console.log("删除之前：" + angular.toJson(json));
			var sdic = Object.keys(json);
			console.log("key:"+angular.toJson(sdic));
			for(ki in sdic) {
				if(json[sdic[ki]].length <= 0) {
					delete json[sdic[ki]];
				} else {
					myJson[sdic[ki]] = json[sdic[ki]];
				}
			}
			//console.log("删除之后：" + angular.toJson(myJson));
			return myJson;
		}

		return server;
	});