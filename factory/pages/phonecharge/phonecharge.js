// 张树垚 2016-01-09 12:54:11 创建
// H5微信端 --- 手机充值


require(['h5-api', 'check', 'get', 'filters', 'touch-slide', 'h5-order-judge', 'h5-alert', 'h5-weixin'], function(api, check, get, filters, TouchSlide, orderJudge) {
	$.cookie('gopToken', '31df66a5ee434a2cb6e70427e19209a9');
	var gopToken = $.cookie('gopToken');
	var main = $('.phonecharge');
	var phoneInput = $('#phonecharge-text-input');

	var touchSlideDefaultIndex = 0;

	var focusTimer = null;
	var jsoncards = { // 各种充值卡
		'联通': [],
		'移动': [],
		'电信': [],
	};
	var jsonflows = { // 流量充值
		'联通': [],
		'移动': [],
		'电信': [],
	};
	//提交时存放数据
	var confirmData = [];

	var vm = avalon.define({
		$id: 'phonecharge',
		bannerImgArr: [],
		phone: '',
		cancelBool: false,
		carrier: '', // 运营商
		confirmId: '', // 提交时商品ID
		confirmCangory: '', // 提交时商品类型  话费 流量
		input: function() { // 手机号输入
			if (check.phone(vm.phone).result) {
				api.phoneInfo({
					phone: vm.phone
				}, function(data) {
					if (data.status == 200) {
						phoneInput[0].blur();
						vm.carrier = data.data.carrier;
						vm.goods = jsoncards[data.data.carrier.substr(-2)];
						vm.flows = jsonflows[data.data.carrier.substr(-2)];
					} else {
						$.alert(data.msg);
					}
				});
			} else {
				vm.goods = [];
				vm.flows = [];
			}
		},
		focusing: false, // 焦点在输入框
		focus: function() { // 获取焦点
			vm.cancelBool = true;
			vm.focusing = true;
			clearTimeout(focusTimer);
		},
		blur: function() { // 失去焦点
			vm.cancelBool = false;
			clearTimeout(focusTimer);
			focusTimer = setTimeout(function() {
				vm.focusing = false;
			}, 300);
		},
		close: function() { // 输入框清除
			vm.phone = '';
			vm.goods = [];
			vm.flows = [];
			vm.focusing = false;
			vm.button = '支付';
			confirmData = [];
			phoneInput.val('').get(0).focus();
		},
		cancel: function() {
			vm.cancelBool = false;
		},
		list: [], // 历史充值号码列表
		listClick: function() { // 选择历史号码
			vm.phone = this.innerHTML.replace(/ /g, '');
			vm.input();
		},
		listDelete: function(item, remove) { // 历史号码删除
			api.phoneDelete({
				gopToken: gopToken,
				phoneSet: [item]
			}, function(data) {
				if (data.status == 200) {
					remove();
				} else {
					$.alert(data.msg);
				}
			});
		},
		listClean: function() { // 历史号码清空
			api.phoneDelete({
				gopToken: gopToken,
				phoneSet: vm.list.$model
			}, function(data) {
				if (data.status == 200) {
					vm.list.clear();
				} else {
					$.alert(data.msg);
				}
			});
		},
		goods: [], // 话费列表
		goodsClick: function(ev) { // 支付点击
			var item = $(ev.target).closest('.phonecharge-lista-item');
			if (item.length) {
				item.addClass('cur').siblings().removeClass('cur');
				confirmData[0] = vm.goods[item.index()].$model;
				vm.confirmId = confirmData[0].id;
				vm.confirmCangory = '话费';
				vm.button = '支付：' + filters.floorFix(confirmData[0].use) + '元';
			}
		},
		flows: [], // 流量列表	
		flowsClick: function(ev) {
			var item = $(ev.target).closest('.phonecharge-listb-item');
			if (item.length) {
				item.addClass('cur').siblings().removeClass('cur');
				confirmData[1] = vm.flows[item.index()].$model;
				vm.confirmId = confirmData[1].id;
				vm.confirmCangory = '流量';
				vm.button = '支付：' + filters.floorFix(confirmData[1].use) + '元';
			}
		},
		button: '支付', // 按钮显示
		buttonClick: function() {
			// 按钮点击
			// orderJudge.check(curprice,cbfn(状态,当前价格,我的果仁数));判断果仁数是否够支付
			console.log(confirmData); // 充值项目的数组
			if ($(this).hasClass('disabled')) {
				return;
			}
			if (vm.confirmCangory === '话费') {
				//话费充值API
				orderJudge.check(confirmData[0].use, function(status, gopPrice, myGopNum) {
					if (status == 'gopNumNo') {
						$.alert('您的果仁不够，请充值');
					} else {
						api.phoneRecharge({
							gopToken: gopToken,
							productId: vm.confirmId,
							phone: vm.phone
						}, function(data) {
							if (data.status == 200) {
								setTimeout(function() {
									window.location.href = get.add('order.html', {
										// 跳到公共订单页 build/order.html?from=phonecharge&id=1525
										from: 'phonecharge',
										id: data.data.consumeOrderId
									});
								}, 1000 / 60);
							} else {
								$.alert(data.msg);
							}
						});
					}
				});
			} else {
				//流量充值API
				orderJudge.check(confirmData[1].use, function(status, gopPrice, myGopNum) {
					if (status == 'gopNumNo') {
						$.alert('您的果仁不够，请充值');
					} else {
						api.phoneTraffic({
							gopToken: gopToken,
							productId: vm.confirmId,
							phone: vm.phone
						}, function(data) {
							if (data.status == 200) {
								setTimeout(function() {
									window.location.href = get.add('order.html', {
										// 跳到公共订单页 build/order.html?from=phonecharge&id=1525
										from: 'phonecharge',
										id: data.data.consumeOrderId
									});
								}, 1000 / 60);
							} else {
								$.alert(data.msg);
							}
						});
					}
				})
			}
		}
	});

	var getUserPhone = function(cnfn) { //获取用户 明文 手机号码
		api.info({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				cnfn && cnfn(data);
			}
		});
	};
	var getUserCarrier = function(cnfn) { //获取用户手机运营商
		api.phoneInfo({
			phone: vm.phone
		}, function(data) {
			if (data.status == 200) {
				cnfn && cnfn(data);
			}
		});
	};
	var href = decodeURIComponent(window.location.href);
	console.log(href);
	var datajson = {};
	//是否从优惠入口进来  显示流量或话费选项卡
	if (href.indexOf('from=home') > -1) {
		href.substring(href.indexOf('from=home')).split('&').forEach(function(item) {
			var itemarr = item.split('=');
			datajson[itemarr[0]] = itemarr[1];
		});
		if (datajson.cangory === '话费') {
			touchSlideDefaultIndex = 0;
		} else {
			touchSlideDefaultIndex = 1;
		}
	}
	getUserPhone(function(data) { //获取用户手机号
		if (data.status == 200) {
			vm.phone = data.data.phone;
			getUserCarrier(function(data) { // 获取手机运营商
				if (data.status == 200) {
					vm.carrier = data.data.carrier;
					vm.goods = jsoncards[data.data.carrier.substr(-2)];
					vm.flows = jsonflows[data.data.carrier.substr(-2)];
					if (data.data.carrier.indexOf(datajson.carrier) != -1) { //是优惠的运营商
						// 选中话费
						if (datajson.cangory === '话费') {
							jsoncards[data.data.carrier.substr(-2)].every(function(item, index) {
								if (!datajson.price) {
									return false;
								};
								if (item.price != datajson.price) {
									return true;
								} else {
									vm.confirmId = item.id;
									vm.confirmCangory = datajson.cangory;
									confirmData[0] = item;
									vm.button = '支付：' + filters.floorFix(item.use) + '元';
									$('.phonecharge-lista-item').eq(index).addClass('cur').siblings().removeClass('cur');
									return false;
								}
							});
						} else {
							jsonflows[data.data.carrier.substr(-2)].every(function(item, index) {
								if (!datajson.level) {
									return false;
								};
								if (item.level != datajson.level) {
									return true;
								} else {
									vm.confirmId = item.id;
									vm.confirmCangory = datajson.cangory;
									confirmData[1] = item;
									vm.button = '支付：' + filters.floorFix(item.use) + '元';
									$('.phonecharge-listb-item').eq(index).addClass('cur').siblings().removeClass('cur');
									return false;
								}
							});
						}
					}
				}
			});
		}
	});
	//左右滑动判断状态
	var titles = $('.phonecharge-body-title-layer');
	var onIndex = function(index) {
		if (titles.eq(index).hasClass('on') && confirmData[index]) {
			vm.button = '支付：' + filters.floorFix(confirmData[index].use) + '元';
			vm.confirmId = confirmData[index].id;
			vm.confirmCangory = (index === 0 ? '话费' : '流量');
		}
	};
	$('#touchSlide')[0].ontouchmove = function() {
		vm.button = '支付';
	};
	$('#touchSlide')[0].ontouchend = function() {
		onIndex(0);
		onIndex(1);
	};
	//获取以往手机号
	api.phoneLastest({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			vm.list = data.data.phoneList;
		} else {
			console.log(data);
		}
	});
	//获取流量列表  联通 移动 电信
	api.productList({
		productType: "SHOUJILIULIANG"
	}, function(data) {
		if (data.status == 200) {

			data.data.productList.forEach(function(item) {
				var desc = JSON.parse(item.extraContent);
				jsonflows[desc.carrier].push({
					id: item.id, // 商品id
					level: desc.level, // 流量数M
					price: desc.price, // 下划线价格
					use: item.price, // 支付按钮价格
					desc: item.productDesc, // 描述
				});
			});
		} else {
			console.log(data);
		}
	});
	//获取话费列表  联通 移动 电信
	api.productList({
		productType: "SHOUJICHONGZHIKA"
	}, function(data) {
		if (data.status == 200) {
			data.data.productList.forEach(function(item) {
				var desc = JSON.parse(item.extraContent);
				jsoncards[desc.carrier].push({
					id: item.id, // 商品id
					currency: item.currency, // 货币(RMB)
					price: desc.price, // 下划线价格
					use: item.price, // 支付按钮价格
					desc: item.productDesc, // 描述
				});
			});
		} else {
			console.log(data);
		}
	});
	TouchSlide({
		slideCell: '#touchSlide',
		autoPlay: false,
		mainCell: '.phonecharge-body-content-lists',
		titCell: '.phonecharge-body-title-layer',
		defaultIndex: touchSlideDefaultIndex
	});
	// 轮播图
	api.static(function(data) {
		if (data.status == 200) {
			console.log(data.data.indexSlideAds);
			data.data.indexSlideAds.filter(function(val, index, arr) {
				if (val.sources.indexOf('h5') != -1) {
					vm.bannerImgArr.push(val);
				}
			});
			TouchSlide({
				slideCell: '#touchSlidephonecharge',
				autoPlay: true,
				mainCell: '.phonecharge-slider-bd',
				titCell: '.phonecharge-slider-hd-li'
			});
		}
	});

	setTimeout(function() {
		main.addClass('on');
	}, 100);
	avalon.scan(main.get(0), vm);
	return;
});