angular.module('app', ['ionic', 'pascalprecht.translate', 'ngCordova', 'ngAnimate', 'angular-md5',
		'app.routes',

		'app.deviceFactory', 'app.storageFactory', 'app.signFactory', 'app.widgetFactory', 'app.pushFactory',

		'ionic-datepicker',

		'app.baseController', 'app.basePointsController', 'app.accountController',
		'app.menuController', 'app.pointsController', 'app.boxsController',
		'app.setController', 'app.aboutController', 'app.helpController',
		'app.boxController', 'app.pointDetailsController',

		'app.accountService', 'app.boxDataService', 'app.webSocketService',

	])

	.config(function($urlRouterProvider, $httpProvider, $ionicConfigProvider, $stateProvider,
		$sceDelegateProvider, $translateProvider) {

		$ionicConfigProvider.tabs.style("standard"); //声明条带风格 striped声明为条带风格;standard 申明不带条风格;
		$ionicConfigProvider.tabs.position("top"); //选项卡放在顶部还是底部 参数可以是：top | bottom   

		$sceDelegateProvider.resourceUrlWhitelist(['self', '*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
		/*添加多语言设置*/
		$translateProvider.useStaticFilesLoader({
			prefix: 'i18n/',
			suffix: '.json'
		});
		$translateProvider.registerAvailableLanguageKeys(['en', 'zh'], {
			'en-*': 'en',
			'zh-*': 'zh'
		});
		//这个方法是获取手机默认语言设置
		$translateProvider.determinePreferredLanguage();

	})

	.run(function($ionicPlatform, $rootScope, $ionicHistory, $state, $location, $cordovaDevice,
		$cordovaStatusbar,$cordovaToast, $cordovaKeyboard, $translate, $cordovaAppVersion, pushFactory, 
		accountService) {

		$ionicPlatform.ready(function() {
			// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
			// for form inputs) 
			if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			//支持键盘事件
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			//推送初始化
			pushFactory.initiateUI();
			$rootScope.isPlatformReady = true; //在ctrl中用来判断平台是否加载完成
			
			//作用是根据状态机的改变无法统计首次的页面，所以采用页面加载时来进行监听
			$rootScope.$watch('$viewContentLoading', function(event, viewConfig) {
				if($location.path() == '/menu/points') {
					console.log("$viewContentLoading--->menuPoints.html");
					pushFactory.startLogPageView("menuPoints.html");
				} else {
					console.log("$viewContentLoading--->login.html");
					pushFactory.startLogPageView("menuPoints.html");
				}
			});
			//$viewContentLoaded- 当视图加载完成，DOM渲染完成之后触发，视图所在的$scope发出该事件。  
			$rootScope.$watch('$viewContentLoaded', function(event) {
				if($location.path() == '/menu/points') {
					console.log("$viewContentLoaded--->menuPoints.html");
					pushFactory.stopLogPageView("menuPoints.html");
				} else {
					console.log("$viewContentLoaded--->login.html");
					pushFactory.stopLogPageView("menuPoints.html");
				}
			});

			//根据状态改变来开始当前页面统计
			$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
				if(toState.name == 'menu.points' ||
					toState.name == 'menu.boxs' ||
					toState.name == 'menu.set' ||
					toState.name == 'menu.about' ||
					toState.name == 'menu.help') {
					//截取字符
					var result = toState.views.menu.templateUrl.substring("templates".length + 1, toState.views.menu.templateUrl.length);
					console.log("$stateChangeStart---->" + result);
					pushFactory.startLogPageView(result);
				} else {
					var result = toState.templateUrl.substring("templates".length + 1, toState.templateUrl.length);
					console.log("$stateChangeStart---->" + result);
					pushFactory.startLogPageView(result);
				}
				//pushFactory.startLogPageView(toState.templateUrl);
				//pushFactory.stopLogPageView(toState.templateUrl);
			});
			
			//当模板解析完成后触发 结束当前页面统计
			$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
				if(toState.name == 'menu.points' ||
					toState.name == 'menu.boxs' ||
					toState.name == 'menu.set' ||
					toState.name == 'menu.about' ||
					toState.name == 'menu.help') {
					//截取字符
					var result = toState.views.menu.templateUrl.substring("templates".length + 1, toState.views.menu.templateUrl.length);
					console.log("$stateChangeSuccess---->" + result);
					pushFactory.stopLogPageView(result);
				} else {
					var result = toState.templateUrl.substring("templates".length + 1, toState.templateUrl.length);
					console.log("$stateChangeSuccess---->" + result);
					pushFactory.stopLogPageView(result);
				}
			})

			//物理返回按钮控制&双击退出应用
			$ionicPlatform.registerBackButtonAction(function(e) {
				//判断处于哪个页面时双击退出
				if($location.path() == '/menu/points' ||
					$location.path() == '/menu/boxs' ||
					$location.path() == '/menu/set' ||
					$location.path() == '/menu/about' ||
					$location.path() == '/menu/help') {

					if($rootScope.backButtonPressedOnceToExit) {
						navigator.app.exitApp();
					} else {
						$rootScope.backButtonPressedOnceToExit = true;
						$cordovaToast.showShortBottom($translate.instant('APP_ONCE_EXIT'));
						//navigator.app.exitApp();
						setTimeout(function() {
							$rootScope.backButtonPressedOnceToExit = false;
						}, 2000);
					}
				} else if($location.path() == '/login') {
					navigator.app.exitApp();
				} else if($ionicHistory.backView()) {
					if($cordovaKeyboard.isVisible()) {
						$cordovaKeyboard.close();
					} else {
						$ionicHistory.goBack();
					}
				} else {
					$rootScope.backButtonPressedOnceToExit = true;
					$cordovaToast.showShortBottom($translate.instant('APP_ONCE_EXIT'));
					navigator.app.exitApp();
					setTimeout(function() {
						$rootScope.backButtonPressedOnceToExit = false;
					}, 2000);
				}
				e.preventDefault();
				return false;
			}, 101);

			//启动页面消失
			navigator.splashscreen.hide();
		}); 

	})

	/*
	  This directive is used to disable the "drag to open" functionality of the Side-Menu
	  when you are dragging a Slider component.
	*/
	.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
		return {
			restrict: "A",
			controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {

				function stopDrag() {
					$ionicSideMenuDelegate.canDragContent(false);
				}

				function allowDrag() {
					$ionicSideMenuDelegate.canDragContent(true);
				}

				$rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
				$element.on('touchstart', stopDrag);
				$element.on('touchend', allowDrag);
				$element.on('mousedown', stopDrag);
				$element.on('mouseup', allowDrag);

			}]
		};
	}])

	/*
	  This directive is used to open regular and dynamic href links inside of inappbrowser.
	*/
	.directive('hrefInappbrowser', function() {
		return {
			restrict: 'A',
			replace: false,
			transclude: false,
			link: function(scope, element, attrs) {
				var href = attrs['hrefInappbrowser'];

				attrs.$observe('hrefInappbrowser', function(val) {
					href = val;
				});

				element.bind('click', function(event) {

					window.open(href, '_system', 'location=yes');

					event.preventDefault();
					event.stopPropagation();

				});
			}
		};
	});