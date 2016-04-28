// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页


require([
	'router', 'h5-api', 'h5-price', 'h5-view', 'touch-slide', 'mydate', 'iscrollLoading', 'h5-login-judge-auto', 'touch-slide',
	'filters', 'h5-weixin', 'hchart'
], function(
	router, api, price, View, TouchSlide, mydate, iscrollLoading
) {

	router.init(true);
	var gopToken = $.cookie('gopToken');
	var main = $('.wealth');
	var pageNum = 1;
	var bottomHeight = 20;
	var pageSize = 15;
	var historyListArr = [];
	var history = new View('wealth-history');
	
	$('#wealth-history').get(0).ontouchmove = function(event) {
		event.preventDefault();
	};
	
	var historyVM = history.vm = avalon.define({
		$id: 'wealth-history',
		total: 0,
		loading: false,
		loadingWord: '加载中...',
		list: []
	});
	avalon.scan(history.native, historyVM);

	//wealthScroll用于存放iscrollLoading.set新生成的iscroll4生成的对象   iscrollLoading用于存放iscroll4相应的函数 
	//开关控制上拉或下拉刷新		wealthScroll用于加载完列表进行刷新
	var wealthScroll = iscrollLoading.set('wealth-history', {
		userUp: false,
		userDown: true
	});
	/*
	iscrollLoading.on('onBeforeScrollStart',function(){
		console.log('开始移动前，绑定的附加事件');
	});
	*/
	iscrollLoading.scrollEnd = function(pageNum) {
		console.log(' 开始获取' + pageNum);
		if (historyVM.loading) {
			return;
		}
		if (!pageNum) {
			historyVM.loading = true;
			historyVM.loadingWord = '大大, 已经没有了...';
			setTimeout(function() {
				historyVM.loading = false;
				historyVM.loadingWord = '加载中...';
			}, 300);
			return;
		}
		historyVM.loading = true;
		api.totalIncomeList({
			gopToken: gopToken,
			pageNo: pageNum,
			pageSize: pageSize,
		}, function(data) {
			if (data.status == 200) {
				if (data.data.list.length) {
					pageNum = data.data.list.length < pageSize ? 0 : pageNum + 1;
					//此处不用再计算累计收益 因为页面刷新时180行已经计算过了
					//生成今日（期）
					var timerA = new Date();
					for (var i = 0; i < data.data.list.length; i++) {
						//转成date对象
						var timerB = mydate.parseDate(data.data.list[i]['createTime']);
						//向前错一天  今日是昨日的收益  昨日是前天的收益 
						timerB.setDate(timerB.getDate() - 1);
						//转化成今日昨日前日的表示
						if (mydate.timeCompare(timerA, timerB)) {
							data.data.list[i]['createTime'] = mydate.timeCompare(timerA, timerB);
						} else {
							data.data.list[i]['createTime'] = mydate.date2String(timerB); //日期转字符串
						}
					}

					setTimeout(function() {
						historyVM.loading = false;
						wealthScroll.refresh();
					}, 300);
					historyListArr = historyListArr.concat(data.data.list);
					historyVM.list = historyListArr;
				}else{
					historyVM.loadingWord = '您还没有累计收益记录哦！';
					setTimeout(function(){
						historyVM.loading = false;
					},1000);
				}
			} else {
				$.alert(data.msg);
			}
		});
	};

	var listCache = {};
	var vm = avalon.define({
		$id: 'wealth',
		price: 0,
		gopNum: 0,
		total: 0,
		yesterday: 0,
		historyDay: 7,
		historyClick: function(day) {
			vm.historyDay = day;
			chartHistorySet();
		},
		showHistory: function() { //展示历史财富
			//console.log(historyVM.total);
			if (!historyVM.list.length) {
				iscrollLoading.scrollEnd(pageNum);
			}
			router.go('/wealth-history');
		}
	});
	avalon.scan(main.get(0), vm);

	// 历史首页图表
	TouchSlide({
		slideCell: '#touchSlide',
		autoPlay: false,
		mainCell: '.wealth-chart-scroll',
		titCell: '.wealth-tab-item',
		endFun: function(i ,c){
			$('.wealth-chart-box-slider-hd-li').eq(i).addClass('on').siblings('li').removeClass('on');
			console.log(1111);
		},
	});
	var chartHistory = $('#chart-history'); //历史
	var chartAnnual = $('#chart-annual'); //年化30日
	var chartAnnualData = [];
	var chartAnnualDate = [];
	var chartAnnualHandler = function(list) {
		chartAnnualData.length = 0;
		chartAnnualDate.length = 0;
		list.forEach(function(item) {
			chartAnnualData.push(item.annualIncome);
			chartAnnualDate.push(item.date.replace(/^\d{4}-(\d{2})-(\d{2}).*$/, function(s, s1, s2) {
				return s1 + '/' + s2;
			}));
		});
	};
	var chartHistoryData = [];
	var chartHistoryDate = [];
	var chartHistoryHandler = function(list) {
		chartHistoryData.length = 0;
		chartHistoryDate.length = 0;
		list.forEach(function(item) {
			chartHistoryData.push(item.price);
			chartHistoryDate.push(item.date.replace(/^\d{4}-(\d{2})-(\d{2}).*$/, function(s, s1, s2) {
				return s1 + '/' + s2;
			}));
		});
	};
	var chartSetting = function(data, date, flag) {
		var max = Math.max.apply(Math, data);
		var min = Math.min.apply(Math, data);
		var setting = {
			chart: {
				// type: 'area'
				// type: 'areaspline' // 带阴影的线
				type: 'spline'
			},
			colors: ['#3d70ee'],
			title: {
				text: ''
			},
			subtitle: {
				text: ''
			},
			legend: {
				x: 150,
				y: 100,
			},
			xAxis: {
				// showFirstLabel: false,
				// showLastLabel: true,
				// endOnTick: true,
				// minTickInterval: 5,
				// maxTickInterval: 2,
				// maxPadding: 0.05,
				// startOnTick: true,
				tickInterval: (function() { // 间隔问题, 最终采用收尾式
					// if (data.length < 8) {
					// 	return 1;
					// } else {
					// 	return Math.round(data.length / 7);
					// }
					return data.length - 1;
				})(),
				tickWidth: 0,
				tickmarkPlacement: 'on',
				labels: {
					formatter: function() {
						return date[this.value];
					}
				},
			},
			yAxis: {
				title: {
					text: ''
				},
				tickInterval: (function() {
					return (max - min) * 0.3;
				})(),
				labels: {
					formatter: function() {
						if(flag == "annual"){
							return this.value.toFixed(2) * 100;
						}else{
							return this.value.toFixed(2);
						}
					}
				}
			},
			plotOptions: {
				series: {
					marker: {
						enabled: false // 去掉线上的点
					}
				},
				// area: {
				// 	fillColor: { // 渐变颜色, 不知为何失效了
				// 		linearGradient: [0, 0, 0, 300],
				// 		stops: [
				// 			[0, Highcharts.getOptions().colors[0]],
				// 			[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
				// 		]
				// 	}
				// }
			},
			series: [{
				data: data
			}]
		};
		if (max === min) { // 相等时加辅助线
			var fun = function(value) {
				return {
					color: '#C0C0C0',
					dashStyle: 'solid',
					width: 0.5,
					value: value,
					label: {
						text: avalon.filters.fix(max),
						x: -40,
						y: 5,
						style: {
							fontSize: 11,
							color: '#666'
						}
					},
				}
			};
			setting.yAxis.plotLines = [
				fun(max - 0.5 / 3 * 1),
				fun(max - 0.5 / 3 * 2),
				fun(max + 0.5 / 3 * 1),
				fun(max + 0.5 / 3 * 2),
			];
		}
		return setting;
	};

	var annualIncomeWealthSet = function() {
		api.annualIncomeWealth(function(data) {
			if (data.status == 200) {
				chartAnnualHandler(data.data.list);
				chartAnnual.highcharts(chartSetting(chartAnnualData, chartAnnualDate,'annual'));
			} else {
				$.alert(data.msg);
			}
		});
	};
	annualIncomeWealthSet();

	var chartHistorySet = function() {
		api.historyPrice({
			historyDay: vm.historyDay,
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				chartHistoryHandler(data.data.list);
				chartHistory.highcharts(chartSetting(chartHistoryData, chartHistoryDate,'history'));
			} else {
				$.alert(data.msg);
			}
		});
	};
	chartHistorySet();

	var resizeTimer = null;
	window.addEventListener('resize', function() { // 横竖屏时形状改变的问题
		clearTimeout(resizeTimer);
		Highcharts.charts.forEach(function(item) {
			item && item.destroy();
		});
		resizeTimer = setTimeout(function() {
			annualIncomeWealthSet();
			chartHistorySet();
		}, 100);
	}, false);


	price.once(function(data) {
		vm.price = data;
	});

	api.getGopNum({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			vm.gopNum = data.data.gopNum;
		} else {
			console.log(data);
		}
	});

	api.getIncome({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			vm.total = historyVM.total = data.data.totalIncome;
			vm.yesterday = data.data.yesterdayIncome;
		} else {
			console.log(data);
		}
	});

	setTimeout(function() {
		main.addClass('on');
	}, 100);
});