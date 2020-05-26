//日期控件

angular.module('app.widgetFactory', [])
	.factory('widgetFactory', function($cordovaDevice, $translate, $ionicPopup, storageFactory) {

		var server = {};

		//时间控件 
		server.getDatePacker = function() {
			return {
				inputDate: new Date(),
				titleLabel: $translate.instant("DATE_FACTORY_SELECT_DATE"),
				setLabel: $translate.instant("DATE_FACTORY_SURE"),
				todayLabel: $translate.instant("DATE_FACTORY_TODAY"),
				closeLabel: $translate.instant("DATE_FACTORY_CLOSE"),
				mondayFirst: false,
				weeksList: [$translate.instant("DATE_FACTORY_SEVEN"), $translate.instant("DATE_FACTORY_ONE"),
					$translate.instant("DATE_FACTORY_TWO"), $translate.instant("DATE_FACTORY_THREE"),
					$translate.instant("DATE_FACTORY_FOUR"), $translate.instant("DATE_FACTORY_FIVE"),
					$translate.instant("DATE_FACTORY_SIX")
				],
				monthsList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
				templateType: 'model', //model or popup
				from: new Date(1970, 1, 1),
				to: new Date(),
				showTodayButton: true,
				dateFormat: 'yyyy-MM-dd',
				closeOnSelect: true,
				disableWeekdays: []
				/*disabledDates: [ //Optional
					new Date(2016, 2, 16),
					new Date(2015, 3, 16),
					new Date(2015, 4, 16),
					new Date(2015, 5, 16),
					new Date('Wednesday, August 12, 2015'),
					new Date("08-16-2016"),
					new Date(1439676000000)
				],*/
			};
		}
		
		//弹出框
		server.updateAppPopup = function(info) {
			return $ionicPopup.show({
				title:info,
				buttons:[
				{
					text:$translate.instant('SET_VERSION_UPDATE_CANCEL'),
					type:'button-clear button-assertive',
					onTap:function(){
						return 'cancel';
					}
				},
				{
					text:$translate.instant('SET_VERSION_UPDATE_SURE'),
					type:'button-clear button-assertive border-left',
					onTap:function(e){
						return 'update';
					}
				}]
			})
		}

		return server;
	});