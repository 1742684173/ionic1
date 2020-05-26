var CONFIG_SERVER = {
//	domain: "http://192.168.29.186:8686/box-web/api/",
//	websocket: "ws://192.168.29.186:8686/box-web/api/actdata-websocket/websocket?",
//	androidUrl: "http://192.168.29.186:8686//box-webweb/apk/V-Box.apk",
//		domain: "http://192.168.23.37:8080/box-data-web/api/",
//		websocket: "ws://192.168.23.37:8080/box-data-web/api/actdata-websocket/websocket?",
//		androidUrl: "http://192.168.23.37:8080/box-data-web/web/apk/V-Box.apk",
	//		domain: "http://192.168.23.30:8080/box-web/api/",
	//		websocket: "ws://192.168.23.30:8080/box-web/api/actdata-websocket/websocket?",
	//		androidUrl:"http://192.168.23.30:8080/box-web/web/apk/V-Box.apk",

		
};

//进行提交时的urls
var CONFIG_URLS = {
	//登录url = user/signin
	login_url: CONFIG_SERVER.domain + "user/signin",

	//退出登录
	login_out_url: CONFIG_SERVER.domain + "user/signout",

	//手机注册获取验证码
	register_phone_get_code_url: CONFIG_SERVER.domain + "user/sendvercode",

	//手机注册url = user/signin
	register_phone_url: CONFIG_SERVER.domain + "user/signupphone",

	//邮箱注册的url = CONFIG_URLS.register_emial_url
	register_emial_url: CONFIG_SERVER.domain + "user/signupemail",

	//找回密码
	findpwd_url: CONFIG_SERVER.domain + "user/findpwd",

	//修改密码
	modify_url: CONFIG_SERVER.domain + "user/chgpwd",

	//检查更新
	check_version_url: CONFIG_SERVER.domain + "appveraction/checkupdate",

	//盒子列表 url = CONFIG_URLS.boxs_list_url
	boxs_list_url: CONFIG_SERVER.domain + "data/boxs",

	//实时数据
	points_real_data_url: CONFIG_SERVER.domain + "data/real",

	//报警数据
	points_alarm_data_url: CONFIG_SERVER.domain + "data/alarm",

	//历史数据
	points_history_data_url: CONFIG_SERVER.domain + "data/history",

	//获取实时监控点的分组信息
	points_real_data_group: CONFIG_SERVER.domain + "data/group",

	//获取一个盒子的所有的监控点data/monitors
	points_data_url: CONFIG_SERVER.domain + "data/monitors",

	//获取监控点详情
	point_detail_url: CONFIG_SERVER.domain + "data/realdetail",

	//确认报警
	confirm_alarm_url: CONFIG_SERVER.domain + "alarmDataAction/confirmData"
};

//登录
var CONFIG_CACHE = {
	user: "_user", //保存登录账号key
	pwd: "_pwd", //保存登录密码key
	utype: "_utype", //角色：管理员与视图
	token: '_token' //保存登录认证key
};

//用来 记录当前APP的状态：首次安装  未登录  已登录
var CONFIG_APP_STATUS = "app_status";

//MD5加密的密钥
var CONFIG_KEY = "5cee621329f24e5cbdc43daa959ce9a1";

//请求成功
var CONFIG_REQUEST_SUCCESS = 200;
////SessionID(用户的会话标识)无效
var CONFIG_REQUEST_SESSION_TIMEOUT = 403;
////非法参数值
//var CONFIG_INVAILD_PARAM = 400;
////未知的服务器错误
//var CONFIG_SERVER_ERROR = 503;
////网络断开
//var CONFIG_NET_DISCONNECT = 700;
////未知错误
//var CONFIG_ERROR = 800;

//获取数据类型
var CONFIG_DATA_TYPE = {
	REAL: 1, //实时数据
	ALARM: 2, //报警数据
	HISTORY: 3, //历史数据
	POINTS: 4, //获取监控点
	GROUP: 5, //组别
	POINT_DETAIL: 6, //监控点详情
	CONFIRM_ALARM: 7 //确认报警
}

var CONFIG_WEBSOCKET = {
	not_support: 10000, //不支持websocket
	open_success: 10001, //打开成功
	close: 10002, //关闭websocket成功
	connect_error: 10003, //连接websocket错误
	broadcast_real_point: "broadcast_real_point" //广播实时监控点
}

//用来保存网络状态的key
var CONFIG_NET_STATE = "net_state";

//当有消息推送过来时，就进行通知，这是标志通知的key
var CONFIG_PUSH_NOTICE = "push_notice";

//当前连接网络的类型
var CONFIG_CONNECTION = {
	UNKNOWN: "unknown", //未知连接
	ETHERNET: "ethernet", //以太网连接
	WIFI: "wifi", //无线网连接
	CELL_2G: "2g", //2 G网连接
	CELL_3G: "3g", // 3 G网连接
	CELL_4G: "4g", // 4 G网连接
	CELL: "cellular", // 通用连接
	NONE: "none" // 无网络连接
}

//更新下载保存的路径
var CONFIG_TARGET_PATH = "/sdcard/Download/V-Box.apk";