// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页

require([
	'router', 'h5-api', 'h5-price', 'h5-weixin', 'h5-touchsliderBanner', 'filters','hchart'
], function(
	router, api, price, weixin, touchsliderBanner
) {
	// $.cookie('gopToken', '9bfcd178472f48bcb28584dc4ed82a04'); //小妮
	// $.cookie('gopToken','4d9655ca57af4fd1b1ce5f3c904ef5f7'); //杨娟    
	// $.cookie('gopToken','fc7c154d9c82426ca64931bfe2bcf406'); //东霖
	// $.cookie('gopToken', 'd5610892684b4523a1c2547b59318e37'); //魏冰
	// $.cookie('gopToken', '780a1811bc19478fbdd5a8c1802e9b3c'); //徐停
	//  $.cookie('gopToken', '1332f5bda22640db9e1f49583f5bb884'); //李鹏
	// $.cookie('gopToken', '7ed37109ecf44a2ea18f1b410693a54a'); //王源
	// $.cookie('gopToken', '09f83d1b82c74b048cda1978b51886a1'); //零娜
	router.init(true);
	//清除订单过去买果仁的存入内容
	window.localStorage.removeItem("from");
	window.localStorage.removeItem("id");
	window.localStorage.removeItem('phone');
	//清除注册时留下的用户痕迹
	localStorage.removeItem("username");
	localStorage.removeItem("userimg");
	localStorage.removeItem("openid");
	localStorage.removeItem("unionid");

	var gopToken = $.cookie('gopToken');
	/**
	 * 检查用户的登录密码，如果已经错误了十次了那直接进入frozen页面，如果ok的话进入home页面。
	 * @param _gopToken
	 * @returns {boolean}
	 */
	var checkPassword = function(_gopToken) {
		api.checkLoginPasswordStatus({
			"gopToken": _gopToken
		}, function(data) {
			if (data.status == 200) {
				if (data.data.result == "success") {
					//do nothing
				} else if (data.data.times == 10) {
					setTimeout(function() {
						window.location.href = './frozen10.html?type=locked'
					}, 210);
				} else if (data.data.times == 15) {
					setTimeout(function() {
						window.location.href = './frozen15.html?type=locked'
					}, 210);
				}
			}
		})
	};
	if (gopToken) {
		checkPassword(gopToken);
	}
	var main = $('.home');

	//我的收益  昨天 累计



	var homeVm = avalon.define({
		$id: 'home',
		bannerImgArr: [],
		myGopNum: 0, //果仁数
		gopNowPrice: 0, //果仁现价
		totalInCome: 0, //累计收益
		yesterDayIncome: 0, //昨天收益
		curIndex: 0,
		gopToken: gopToken ? true : false,
		//预计年化收益
		toggleBtnFn: function() { //切换样式Fn
			var $this = $(this);
			console.log(homeVm.curIndex);
			if (this.className.indexOf('up') != -1) {
				homeVm.curIndex = 2;
				$this.removeClass('up').addClass('down');
			} else {
				$this.removeClass('down').addClass('up');
				homeVm.curIndex = 1;
			}
		},
		gotophonecharge: function(ev) {
			var target = $(ev.target).closest('.home-phonebills');
			if (!target.length) {
				return;
			}
			window.location.href = target.get(0).dataset.href;
		},
	});

	avalon.scan(main.get(0), homeVm);
	api.getIncome({
		gopToken: gopToken
	}, function(data) {
		if (data.status == '200') {
			homeVm.totalInCome = data.data.totalIncome;
			homeVm.yesterDayIncome = data.data.yesterdayIncome;
		}
	});
	//果仁现价
	api.price(function(data) {
		if (data.status == '200') {
			homeVm.gopNowPrice = data.data.price;
		}
	});

	//获取果仁数
	api.getGopNum({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			homeVm.myGopNum = data.data.gopNum;
			if (homeVm.myGopNum > 0) {
				homeVm.curIndex = 1;
			}
		} else {
			console.log(data);
		}
	});

	setTimeout(function() {
		main.addClass('on');
	}, 250);


	var chartHistory = $('#chart-history'); //历史
	var chartHistoryData = [];
	var chartHistoryDate = [];
	var chartHistoryHandler = function (list) {
		chartHistoryData.length = 0;
		chartHistoryDate.length = 0;
		list.forEach(function (item) {
			chartHistoryData.push(item.price);
			chartHistoryDate.push(item.date.replace(/^\d{4}-(\d{2})-(\d{2}).*$/, function (s, s1, s2) {
				return s1 + '/' + s2;
			}));
		});
	};
	var chartSetting = function (data, date, flag) {
		var max = Math.max.apply(Math, data);
		var min = Math.min.apply(Math, data);
		var setting = {
			chart: {
				// type: 'area'
				// type: 'areaspline' // 带阴影的线
				type: 'spline',
				backgroundColor:"#f2f2f2"
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
				tickInterval: (function () { // 间隔问题, 最终采用收尾式
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
					formatter: function () {
						return date[this.value];
					}
				},
			},
			yAxis: {
				title: {
					text: ''
				},
				tickInterval: (function () {
					if ((max - min).toFixed(2) <= 0.01) {
						return (max - min) * 10000000 * 0.9 / 10000000 < 0.01 ? 0.01 : ((max - min)* 0.9).toFixed(2);
					} else if ((max - min).toFixed(2) < 0.08) {
						return (max - min) * 10000000 * 0.5 / 10000000 < 0.01 ? 0.01 : ((max - min)* 0.5).toFixed(2);
					} else {
						return (max - min) * 10000000 * 0.3 / 10000000 < 0.01 ? 0.01 : ((max - min)* 0.3).toFixed(2);
					}
				})(),
				labels: {
					formatter: function () {
						if (flag == "annual") {
							return this.value.toFixed(2) * 1000000 * 100 / 1000000;
						} else {
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
				}
			},
			series: [{
				data: data
			}]
		};
		if (max === min) { // 相等时加辅助线
			var fun = function (value) {
				return {
					color: '#C0C0C0',
					dashStyle: 'solid',
					width: 0.5,
					value: value,
					label: {
						text: avalon.filters.fix(value),
						x: -30,
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
	var chartHistorySet = function () {
		api.historyPrice({
			historyDay: 30,
			gopToken:gopToken
		}, function (data) {
			if (data.status == 200) {
				chartHistoryHandler(data.data.list);
				chartHistory.highcharts(chartSetting(chartHistoryData, chartHistoryDate, 'history'));
			} else {
				// $.alert(data.msg);
			}
		});
	};
	chartHistorySet();
});