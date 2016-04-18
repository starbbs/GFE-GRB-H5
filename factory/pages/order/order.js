// 张树垚 2016-01-09 14:29:10 创建
// H5微信端 --- page-order 订单 
// 此页面包含  支付浮层h5-dialog-paypass.js(实名认证，密码设置，锁定次数5-10次)


require([
	'h5-api', 'get', 'router',
	'h5-view', 'h5-view-bill',
	'h5-price', 'h5-ident', 'h5-component-bill',
	'h5-dialog-paypass', 'h5-dialog-success',
	'h5-weixin'
], function(
	api, get, router,
	View, billView,
	price, H5Ident, H5Bill,
	dialogPaypass, dialogSuccess
) {
	router.init();
	var main = $('.order');
	var gopToken = $.cookie('gopToken');
	var identInput = $('#order-ident');

	var dialogShow = function() { // 显示浮层
		var timer = null;
		var second = 3;
		dialogSuccess.on('show', function() {
			timer = setInterval(function() {
				second--;
				if (second <= 0) {
					// finish();
					window.location.reload();
					dialogSuccess.hide();
					clearInterval(timer);
				} else {
					dialogSuccess.button.html('支付密码设置成功，请牢记，' + second + 's后自动跳转');
				}
			}, 1000);
		});
		dialogSuccess.set('支付密码设置成功，请牢记，3S后自动跳转');
		dialogSuccess.show();
	};


	var vm = avalon.define({
		$id: 'order',
		money: 0, // RMB总金额
		phone: '', // 要发送验证码的电话
		productDesc: '', // 订单内容
		productRealPrice: 0, // 真实价格
		gopPrice: 0, // 果仁实时价
		gopNum: 0, // 果仁数
		gopIfUse: true, // 使用果仁数
		gopUse: 0, // 使用多少果仁
		//==============================支付浮层
		paypass1: '',
		paypass2: '',
		paypass3: '',
		paypass1Next: false,
		paypass2Next: false,
		paypass3Next: false,
		paypass2Value: function() {
			vm.paypass2Next = vm.paypass2.length === 6 ? true : false;
		},
		paypass3Value: function() {
			vm.paypass3Next = vm.paypass3.length === 6 ? true : false;
		},
		paypass2Click: function() {
			if (vm.paypass2.length == 6) {
				router.go('/paypass-view-3');
			}
		},
		paypass3Click: function() {
			console.log(vm.paypass2 + ' ==' + vm.paypass3);
			if (vm.paypass2 == vm.paypass3 && vm.paypass3.length == 6) {
				api.setPayPassword({
					gopToken: gopToken,
					password: vm.paypass3
				}, function(data) {
					if (data.status == 200) {
						vm.paypass1 = '';
						vm.paypass2 = '';
						vm.paypass3 = '';
						dialogShow(); //密码修改完成后在dialogShow中做页面跳转
						// window.location.reload();
						// router.go('/');
					} else {
						$.alert(data.msg);
					}
				});
			} else {
				$.alert('两次输入不一致');
			}
		},
		//==============================支付浮层
		/*
		gopClick: function() { // 果仁点击
			vm.gopIfUse = !vm.gopIfUse;
			if (vm.gopIfUse) {
				vm.gopExchange();
			} else {
				vm.rmbUse = vm.money;
			}
		},
		*/
		gopMoney: 0, //所用果仁折合人民币
		gopExchange: function() { // 换算gopMoney
			if (vm.gopNum * vm.gopPrice >= vm.money) { // 够支付
				// vm.rmbUse = 0;
				vm.gopUse = vm.money / vm.gopPrice;
				vm.gopMoney = vm.money;
				vm.ifConfirmPay = true;
			} else {
				// vm.rmbUse = vm.money - vm.gopNum * vm.gopPrice;
				vm.gopUse = vm.gopNum;
				vm.gopMoney = vm.gopNum * vm.gopPrice;
				vm.ifConfirmPay = false;
			}
		},
		ifConfirmPay: false,
		confirmPay: function() { // 确认支付
			if (!vm.ifConfirmPay) {
				return;
			}
			dialogPaypass.show();
			dialogPaypass.vm.callback = function(value) {
				// 支付密码校验成功
				api.pay({
					gopToken: gopToken, // token
					useGop: vm.gopIfUse, // 是否使用果仁
					consumeOrderId: get.data.id, // 订单id
					// identifyingCode: identInput.val(), // 短信验证码
					// bankCardId: vm.bankid, // 银行卡id  4-11去除银行卡支付后可随便写ID
					bankCardId: 12,
					payPassword: value, // 支付密码
					bill99ValidCode: '803585',
					bill99token: '1330872'
				}, function(data) {
					if (data.status == 200) {
						router.to('/bill');
						billView.set('PAY', get.data.id, {
							forceStatus: 'PROCESSING',
							ifFinishButton: true
						});
					} else {
						$.alert(data.msg);
					}
				});
			};
		}
	});

	/*
	var bankSelect = function(bank) { // 处理当前显示
		bank = bank || vm.bankSelect.$model;
		vm.bankSelectName = bank.name;
		vm.bankSelectType = bank.type;
		vm.bankSelectClass = bank.lang;
		vm.bankSelectTail = bank.tail;
	};
	var bankListRefresh = function(list) { // 刷新银行卡列表
		list = H5Bank.dataHandler(list);
		dialogBankcard.vm.list = list.concat();
		vm.bankList = list.concat();
		dialogBankcard.vm.index = vm.bankIndex;
		vm.bankSelect = $.extend({}, vm.bankList.$model[vm.bankIndex]);
		vm.bankid = vm.bankSelect.id;
		bankSelect();
	};
	var bankListReturn = function() {
		vm.bankIndex = dialogBankcard.vm.index;
		vm.bankSelect = $.extend({}, vm.bankList.$model[vm.bankIndex]);
		vm.bankid = vm.bankSelect.id;
		bankSelect();
	};
	*/
	// 进入页面
	if (get.data.id) { // 有订单ID, 跳转订单详情
		billView.set('PAY', get.data.id, {
			onRequest: function(data) {
				if (data.status == 200) {
					var order = data.data.consumeOrder; // 订单信息
					var product = data.data.product; // 产品信息
					var record = data.data.recordList; // 付款记录
					if (order.status === 'PROCESSING' && !record.length) { // 进行中(未付款)
						// 打开页面
						router.to('/');
						setTimeout(function() {
							main.addClass('on');
						}, 100);
						// 刷新数据
						vm.productDesc = product.productDesc;
						vm.money = order.orderMoney;
						vm.gopPrice = data.data.gopPrice;
						vm.gopNum = data.data.gopNum;
						vm.productRealPrice = JSON.parse(product.extraContent).price;
						vm.gopExchange();
						// 银行卡相关
						/*
						if (Array.isArray(data.data.bankCardList)) {
							bankListRefresh(data.data.bankCardList);
							dialogBankcard.on('hide', function() {
								bankListReturn();
							});
							viewBankcardAppend.vm.callback = function() { // 银行卡添加回调
								api.bankcardSearch({
									gopToken: gopToken
								}, function(data) {
									if (data.status == 200) {
										bankListRefresh(data.data.list);
										setTimeout(function() {
											router.to('/');
										}, 100);
									} else {
										$.alert(data.msg);
									}
								});
							};
						}
						*/
						price.onChange = price.onFirstChange = function(next) {
							vm.gopPrice = next;
							vm.gopExchange();
						};
						price.once();
					} else { // 失败, 成功, 进行中(已付款)
						router.to('/bill');
					}
				} else {
					$.alert(data.msg);
				}
			},
		});
	} else {
		$.alert('缺少订单号');
	}

	document.title = {
		phonecharge: '订单-手机充值', // 来自手机充值
		loverelay: '订单-爱心接力', // 来自爱心接力
	}[get.data.from] || '果仁宝-订单'; // 未知来源

	avalon.scan();
});