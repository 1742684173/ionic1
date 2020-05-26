angular.module('app.routes', ['ionic'])

	.config(function($stateProvider, $urlRouterProvider) {

		$stateProvider

			.state('login', {
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'loginCtrl'
			})

			.state('registerTab', {
				url: '/registerTab',
				templateUrl: 'templates/registerTab.html',
				controller: 'registerTabCtrl'
			})

			.state('findPwdTab', {
				url: '/findPwdTab',
				templateUrl: 'templates/findPwdTab.html',
				controller: 'findPwdTabCtrl'
			})

			.state('menu.set', {
				url: '/set',
				views: {
					'menu': { //指<ion-nav-view name="menu"></ion-nav-view>
						templateUrl: 'templates/menuSet.html',
						controller: 'menuSetCtrl'
					}
				}
				//				data: {isPublic: false}    //为路由添加该属性，判断是否为匿名路由
			})

			.state('menu.about', {
				url: '/about',
				views: {
					'menu': {
						templateUrl: 'templates/menuAbout.html',
						controller: 'menuAboutCtrl'
					}
				}
			})
			
			.state('menu.help', {
				url: '/help',
				views: {
					'menu': {
						templateUrl: 'templates/menuHelp.html',
						controller: 'menuHelpCtrl'
					}
				}
			})

			.state('menu.points', {
				url: '/points',
				views: {
					'menu': {
						templateUrl: 'templates/menuPoints.html',
						controller: 'menuPointsCtrl'
					}
				}
			})

			.state('menu.boxs', {
				url: '/boxs',
				views: {
					'menu': {
						templateUrl: 'templates/menuBoxs.html',
						controller: 'menuBoxsCtrl'
					}
				}
			})

			.state('menu', {
				url: '/menu',
				templateUrl: 'templates/menu.html', //模板
				controller: 'menuCtrl'
			})

			.state('box', {
				url: '/box',
				params: {
					box: null
				},
				templateUrl: 'templates/box.html',
				controller: 'boxCtrl'
			})

			.state('pointdetails', {
				url: '/pointdetails',
				params: {
					point: null
				},
				templateUrl: 'templates/pointDetails.html',
				controller: 'pointDetailsCtrl'
			})

			.state('secure', {
				url: '/secure',
				templateUrl: 'templates/secure.html',
				controller: 'secureCtrl'
			})
		
		console.log(window.localStorage.getItem(CONFIG_CACHE.token));
		console.log(window.JSON.parse(window.localStorage.getItem(CONFIG_CACHE.token)));
		
		if(window.localStorage.getItem(CONFIG_CACHE.token) != undefined && window.JSON.parse(window.localStorage.getItem(CONFIG_CACHE.token)).length == 32) {
			console.log("menu.points");
			$urlRouterProvider.otherwise('/menu/points')
		}else{
			console.log("login");
			$urlRouterProvider.otherwise('/login')
		}
		
	});