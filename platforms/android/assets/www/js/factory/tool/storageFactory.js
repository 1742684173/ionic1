//存储全局信息

angular.module('app.storageFactory', [])
	.factory('storageFactory', function() {
		var server = {};

		var storage = window.localStorage;
		var json = window.JSON;

		server.set = function(key, value) {
			storage.setItem(key, json.stringify(value));
		}

		server.get = function(key) {
			var value = json.parse(storage.getItem(key));
			if(null != value) {
				return value;
			}
			return "";
		}

		server.clear = function() {
			storage.clear();
		}

		server.remove = function(key) {
			storage.removeItem(key);
		}

		return server;
	});