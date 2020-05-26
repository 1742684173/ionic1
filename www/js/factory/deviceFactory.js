/*//以下每个接口都必须带全局参数（ 全局参数客户端拼成JSON格式放到Headers的common参数）
var data = {
	mt: mt, //1-iOs,4-Android,255-PC
	sid: "", //sessionId 会话ID（有登录时必传）
	pid: "2", //目前手机端固定为2
	sv: "", //客户端版本号
	lan: "", //?语言代码缩写
	imei: "", //设备唯一标识码
	osv: "", //?固件
	cc: "", //?语言代码
	fuid: "", //客户端生成设备唯一标识非空
	ts: "", //时间戳（UTC时间：1970-1-1 00:00:00到当前客户端时间的秒数）
	sign: "",
	//1. 将请求参数格式化为“key=value”格式(包括业务参数及Headers的common解析出来的参数)，如“k1=v1”、“k2=v2”、“k3=v3”;
	//2. 将格式化好的参数键值对以字典序升序排列后， 拼接在一起，“ k1 = v1 & k2 = v2 & k3 = v3”;
	//3. 在拼接好的字符串末尾追加上应用的Secret Key;
	//上述字符串的MD5值即为签名的值。
	//注： 各字段值是没有经过urlencode的真实的值来计算
};*/
angular.module('app.deviceFactory', [])
	.factory('deviceFactory', function($cordovaDevice,$translate,storageFactory) {

		var server = {};
		
		//mt: mt, //1-iOs,4-Android,255-PC
		server.getMt = function() {
			if(ionic.Platform.isAndroid()) {
				return 4;
			} else if(ionic.Platform.isIOS() || ionic.Platform.isIPad()) {
				return 1;
			} else {
				return 0;
			}
		}

		//pid: "2", //目前手机端固定为2
		server.getPid = function() {
			return 2;
		}
		
		//sv: "", //客户端版本号
		server.getSv =function() {
			//return $cordovaDevice.getVersion();
			return $cordovaDevice.getCordova();
		}

		//lan: "", //语言代码缩写
		server.getLan =function() {
			return $translate.use();
		}
		
		//imei: "", //设备唯一标识码  
		server.getImei =function() {
			return "";
		}
		
		//osv: "", //?固件
		server.getOsv =function() {
			return "";
		}
		
		//osv: "", //?国家代码
		server.getCc =function() {
			return "";
		}
		
		//fuid: "", //客户端生成设备唯一标识非空
		server.getFuid =function() {
			return $cordovaDevice.getUUID();
		}
		
		//ts: "", //时间戳（UTC时间：1970-1-1 00:00:00到当前客户端时间的秒数）
		server.getTs = function(){
			return Date.parse(new Date());
		}
		
		server.getSid = function(){
			return storageFactory.get(CONFIG_CACHE.token);
		}
		
		//return json
		server.getDevice = function(){
			return {
				"mt": ""+server.getMt(),
				"sid": ""+server.getSid(),
				"pid": "2",
				"sv": ""+server.getSv(),
				"lan": ""+server.getLan(),
				"imei":""+server.getImei(),
				"osv":""+server.getOsv(),
				"cc":""+server.getCc(),
				"fuid":""+server.getFuid(),
				"ts":""+server.getTs(),
			}
		}
		
		return server;
	});