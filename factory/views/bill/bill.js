// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-bill 账单详情分页


define('h5-view-bill', [
	'h5-api', 'router', 'filters', 'mydate', // 公用功能
	'h5-view', 'h5-weixin', 'h5-component-bill', // H5功能
	'h5-dialog-confirm' // H5组件
], function(
	api, router, filters, mydate,
	View, weixin, H5bill,
	dialogConfirm
) {

	var gopToken = $.cookie('gopToken');

	var bill = new View('bill');
	var main = $('.bill');

	var nowData = null; // 当前使用的后台原始数据
	var weixinPayData = null; // 微信重新支付数据

	var defaultAddress = '地址已删除'; // 默认地址栏内容

	var initSettings = { // 初始化
		id: '', // 账单ID
		type: '', // 类型
		status: '', // 订单状态
		headClass: '', // 头部样式名
		headContent: '', // 头部内容
		waitForPay: false, // 等待支付
		gopNum: 0, // 买果仁--果仁数
		gopPrice: 0, // 买果仁--成交价
		buyMoney: 0, // 买果仁--支付金额

		transferSign: '', // 转果仁--正负号
		transferNum: 0, // 转果仁--果仁数
		transferIcon: '', // 转果仁--图标
		transferName: '', // 转果仁--名字
		transferAddress: '', // 转果仁--地址
		transferImg: '', // 转果仁--头像
		transferStage: '', // 转果仁--阶段
		transferTime: '', // 转果仁--到账时间
		transferStart: '', // 转果仁--创建时间
		transferOver: '', // 转果仁--完成或预计时间
		transferFailReason: '', // 转果仁--失败原因
		poundage: 0, // 转果仁--手续费
		transferDesc: '', // 转果仁--转账说明
		phoneNum: '', // 手机号

		refundNum: 0, // 退款数目
		refundWord: '', // 退款状态说明

		rebate: 0, // 获得返利
		failReason: '', // 失败原因
		closeReason: '', // 关闭原因
		orderMoney: 0, // 订单金额
		payMoney: 0, // 消费--支付金额
		payGop: 0, // 消费--支付果仁数
		productDesc: '', // 商品信息
		orderTime: '', // 交易时间
		closeTime: '', // 关闭时间
		submitTime: '', // 提交时间
		createTime: '', // 创建时间
		orderCode: '', // 订单号
		serialNum: '', // 流水号
		payType: '', // 支付方式
		ifReturnHome: false, // 是否显示"返回首页"按钮
		ifFinishButton: false, // 是否显示"完成"按钮
		ifPayButton: false, // 是否显示"前往支付"按钮
		ifClose: false, // 是否显示"关闭"
		ifTip: false, // 是否显示底部提示
		tip: '如有疑问，请联系果仁宝客服<br>', // 底部提示
	};
	var vm = avalon.define($.extend({ // 账单vm
		$id: 'bill',
		returnHome: function() { // 返回首页
			if (bill.onReturnHome() === false) {

			} else {
				setTimeout(function() {
					window.location.href = './home.html?from=bill';
				}, 100);
			}
		},
		finish: function() { // 完成 -- 完成按钮只有在买果仁流程的最后一步会显示
			if (bill.onFinish() === false) {

			} else {
				$.os.ios && document.write(''); // iOS页面跳转时突然恢复初始状态的bug
				window.location.href = './home.html?from=bill';
			}
		},
		gotoPay: function() { // 前往支付
			if (bill.onGotoPay() === false) {

			} else {
				if (vm.payType === '微信支付') {
					console.log(weixinPayData)
					weixin.pay.onSuccess = function(res) {
						buyInHandler('BUY_IN', vm.id, {
							forceStatus: 'SUCCESS',
							ifFinishButton: true
						});
					};
					weixin.pay.set(weixinPayData);
					weixin.pay.work();
				} else {
					window.location.href = './order.html?from=bill&id=' + vm.id;
				}
			}
		},
		close: function() { // 关闭订单
			dialogConfirm.set('订单关闭后将无法继续付款，确定关闭？');
			dialogConfirm.onConfirm = function() {
				switch (vm.type) {
					case 'BUY_IN': // 关闭买果仁
						api.closeBuyinOrder({
							gopToken: gopToken,
							buyinOrderId: vm.id
						}, function(data) {
							if (data.status == 200) {
								$.alert('关闭成功');
								buyInHandler(vm.type, vm.id, { // 关闭订单后再刷新一下bill页面更新交易状态
									onRequest: function(data) {
										bill.onClose(data.data.buyinOrder.id, data.data.buyinOrder.updateTime);
									}
								});
							}
						});
						break;
					case 'PAY': // 关闭消费果仁
						api.closeConsumeOrder({
							gopToken: gopToken,
							consumeOrderId: vm.id
						}, function(data) {
							if (data.status == 200) {
								$.alert('关闭成功');
								consumeHandler(vm.type, vm.id, { //关闭订单后再刷新一下bill页面
									onRequest: function(data) {
										bill.onClose(data.data.consumeOrder.id, data.data.consumeOrder.updateTime);
									}
								});
							}
						});
						break;
					default:
						console.log('Error: (bill) 未知的关闭账单类别:' + vm.type);
				}
			};
			dialogConfirm.show();
		},
	}, initSettings));
	avalon.scan(main.get(0), vm);

	/**
	 * [set 设置账单详情]
	 * @Author   张树垚
	 * @DateTime 2016-03-09
	 * @param    {[string]}       		type					[账单类型]
	 * @param    {[string|number]}		id						[账单ID]
	 * @param    {[json]}         		options					[设置参数]
	 * @param    {[string]}       		options.forceStatus		[强制状态]
	 * @param    {[function]}     		options.onRequest		[后台请求回调,参数data]
	 * @param    {[function]}     		options.onRendered		[vm渲染回调,参数vm]
	 */
	var set = function(type, id, options) { // 设置账单, 分流 -- 不做view显示  根据用户ID和消费类型做AJAX
		setVM(); // 清空分页
		type = (type + '').trim().toUpperCase();
		options = options || {};
		switch (type) {
			case 'TRANSFER_OUT': // 转账, 转出
				transferOutHandler('TRANSFER_OUT', id, options);
				break;
			case 'TRANSFER_IN': // 转账, 转入
				transferInHandler('TRANSFER_IN', id, options);
				break;
			case 'BUYIN_ORDER': // 买入, 消息
			case 'BUY_IN': // 买入, 列表
				buyInHandler('BUY_IN', id, options);
				break;
			case 'CONSUME_ORDER': // 消费, 消息
			case 'PAY': // 消费, 列表
				consumeHandler('PAY', id, options);
				break;
			case 'REFUND': // 退款
				refundHandler('REFUND', id, options);
				break;
			default:
				$.alert('未知类型的账单' + type);
		}
	};
	var setVM = function(settings, options) { // 设置账单vm -- 清空原VM
		settings = settings || {};
		options = options || {};
		for (var i in options) {
			if (initSettings.hasOwnProperty(i)) {
				settings[i] = options[i];
			}
		}
		$.extend(vm, initSettings, settings);
		options.onRendered && options.onRendered(vm);
	};
	var setOne = function(key, value) { // 设置一个vm属性
		vm[key] !== value && (vm[key] = value);
	};
	var setUser = function(personId) { // 设置联系人
		api.contactInfo({
			gopToken: gopToken,
			personId: personId
		}, function(data) {
			//console.log(data)
			if (data.status == 200) {
				console.log(data.data);
				setOne('transferName', data.data.remark || data.data.nick || (data.data.contactType === 'WALLET_CONTACT' ? '未命名地址' : '未命名用户'));
				setOne('transferImg', data.data.photo || '');
				setOne('transferAddress', filters.phone(data.data.phone) || filters.address(data.data.address) || defaultAddress);
			}
		});
	};

	var orderHandler = function(type, id, order, waitForPay, list) { // 统一处理买入消费数据
		return {
			id: id, // 账单ID
			type: type, // 类型
			status: order.status, // 订单状态
			headClass: H5bill.statusClass[order.status], // 头部样式名
			headContent: H5bill.statusBusiness[order.status], // 头部内容
			waitForPay: waitForPay, // 等待支付
			failReason: order.status == 'FAILURE' ? order.payResult || ($.isArray(list) ? list.reduce(function(string, item, index) {
				return string += item.payResult || ''; // 从支付方式中找出失败原因
			}, '') : '') : '', // 失败原因
			closeReason: order.status === 'CLOSE' ? order.payResult : '', // 关闭原因
			orderMoney: order.orderMoney, // 订单金额
			orderTime: order.status !== 'CLOSE' ? order.updateTime === order.createTime ? '' : order.updateTime : '', // 交易时间
			closeTime: order.status === 'CLOSE' ? order.updateTime : '', // 关闭时间
			createTime: order.updateTime ? '' : order.createTime, // 创建时间
			orderCode: order.orderCode, // 订单号
			serialNum: $.isArray(list) ? list.map(function(item) {
				return item.tradeNo;
			}).join('<br>') : order.serialNum,
			payType: H5bill.payType[order.payType], // 支付方式
			ifPayButton: waitForPay, // 是否显示"前往支付"按钮
			ifClose: waitForPay, // 是否显示"关闭"
			// phoneNum:JSON.parse(order.extraContent).phone ? JSON.parse(order.extraContent).phone : null,
		};
	};
	var buyInHandler = function(type, id, options) { // 买入
		api.queryBuyinOrder({
			gopToken: gopToken,
			buyinOrderId: id,
			payType: 'WEIXIN_MP_PAY'
		}, function(data) {
			// console.log(nowData = data);
			options.onRequest && options.onRequest(data);
			data.data.WEIXIN_MP_PAY && (weixinPayData = data.data.WEIXIN_MP_PAY);
			if (!data.data || !data.data.buyinOrder || data.status != 200) {
				data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.buyinOrder; // 订单 
			var list = data.data.recordList; // 支付
			var waitForPay = (order.status = options.forceStatus || order.status) == 'PROCESSING' && (!list || !list.length);
			setVM($.extend(orderHandler(type, id, order, waitForPay, list), {
				gopNum: order.gopNum, // 买果仁--果仁数
				gopPrice: order.price, // 买果仁--成交价
				buyMoney: order.payMoney, // 买果仁--支付金额
				productDesc: order.businessDesc || '果仁', // 商品信息
			}), options);
		});
	};
	var consumeHandler = function(type, id, options) { // 消费 话费流量
		console.log(options)
		api.query({
			gopToken: gopToken,
			consumeOrderId: id
		}, function(data) {
			// console.log(nowData = data);
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.consumeOrder || data.status != 200) { //不成功
				data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.consumeOrder; //定单信息 创建时间 
			var list = data.data.recordList; //流水号 创建时间 支付果仁
			var product = data.data.product; // 商品信息 流量 话费 面额
			var trade = data.data.trade; // 支付状态
			var waitForPay = (order.status = options.forceStatus || order.status) == 'PROCESSING' && (!list || !list.length);
			var payMoney, payGop;
			if (order.status == 'SUCCESS' && list && list.length) {
				list.forEach(function(item) {
					item.payMoney && (payMoney = item.payMoney);
					item.payGop && (payGop = item.payGop);
				});
			}
			payGop = 1;
			setVM($.extend(orderHandler(type, id, order, waitForPay, list), {
				payMoney: payMoney, // 支付金额
				payGop: payGop, // 支付果仁数
				productDesc: JSON.parse(order.extraContent).carrier + '-' + product.productDesc.substr(2), // 商品信息
				phoneNum: JSON.parse(order.extraContent).phone, //充值号码
				transferFailReason: trade.result, //失败原因
			}), options);
		});
	};
	var transferHandler = function(type, id, order) { // 统一处理的转账数据
		var startTime = order.createTime;
		var finishTime = order.transferTime || order.updateTime;
		if (order.status === 'PROCESSING') {
			finishTime = mydate.parseDate(startTime);
			finishTime.setHours(finishTime.getHours() + 2);
			// finishTime = '预计' + mydate.date2String3(finishTime) + '前到账';
			finishTime = '(工作日9:00-18:00提交)';
		}
		// var finishTime = order.transferTime || (order.updateTime === order.createTime ? order.status === 'PROCESSING' ? '预计 ' + avalon.filters.date(new Date().setHours(new Date().getHours() + 2), 'yyyy-MM-dd HH:mm:ss') + ' 前' : order.updateTime : order.updateTime)
		return {
			id: id, // 账单ID
			type: type, // 类型
			status: order.status, // 订单状态
			headClass: H5bill.statusClass[order.status], // 头部样式名
			headContent: H5bill.statusTransfer[order.status][type] + ' (' + H5bill.unit.gop + ')', // 头部内容
			transferNum: order.gopNum, // 转果仁--果仁数
			transferIcon: H5bill.transferClass[order.type], // 转果仁--图标
			transferName: H5bill.transferType[order.type], // 转果仁--名字
			transferAddress: order.address ? filters.address(order.address) : defaultAddress, // 转果仁--地址
			transferStage: H5bill.transferStage[order.status], // 转果仁--阶段
			transferTime: order.transferTime, // 转果仁--到账时间
			transferStart: startTime, // 转果仁--创建时间
			transferOver: finishTime, // 转果仁--完成或预计时间
			transferFailReason: order.failureMsg, // 转果仁--失败原因
			poundage: order.serviceFee, // 转果仁--手续费
			submitTime: order.status === 'FAILURE' ? order.createTime : '', // 提交时间
			transferDesc: order.transContent, // 转果仁--转账说明
			ifTip: order.status === 'FAILURE', // 是否显示底部提示
			// serialNum: order.serialNum, // 流水号
		};
	};
	var transferInHandler = function(type, id, options) { // 转入
		api.transferInQuery({
			gopToken: gopToken,
			transferInId: id
		}, function(data) {
			// console.log(nowData = data);
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.transferIn || data.status != 200) {
				data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.transferIn;
			setVM($.extend(transferHandler(type, id, order), {
				transferSign: '+',
			}), options);
			order.personId && setUser(order.personId);
		});
	};
	var transferOutHandler = function(type, id, options) { // 传出
		api.transferQuery({
			gopToken: gopToken,
			transferOutId: id
		}, function(data) {
			// console.log(nowData = data);
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.transferOut || data.status != 200) {
				data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.transferOut;
			setVM($.extend(transferHandler(type, id, order), {
				transferSign: '-',
			}), options);
			order.personId && setUser(order.personId);
		});
	};
	var refundHandler = function(type, id, options) { // 退款
		api.refundQuery({
			gopToken: gopToken,
			refundId: id
		}, function(data) {
			console.log(nowData = data);
			options.onRequest && options.onRequest(data);
			if (!data.data || data.status != 200) {
				data.msg && $.alert(data.msg);
				return;
			}
			setVM({
				id: id, // 账单ID
				type: type, // 类型
				status: data.data.status, // 订单状态
				headClass: H5bill.statusClass[data.data.status], // 头部样式名
				headContent: H5bill.getStatusRefund(data.data, true), // 头部内容
				refundNum: data.data.payGop || data.data.payMoney, // 退款数目
				refundWord: H5bill.getRefundWord(data.data), // 退款状态说明
				productDesc: data.data.orderDesc, // 商品信息
				transferTime: data.data.updateTime, // 到账时间
				submitTime: data.data.createTime, // 提交时间
				orderCode: data.data.orderCode, // 订单号
				serialNum: data.data.serialNum, // 流水号
				ifTip: true, // 是否显示底部提示
				tip: data.data.status === 'FAILURE' ? '退款失败可能由多种原因造成<br>详情可咨询果仁宝客服' : '请留意付款银行卡的余额变动提醒<br>', // 底部提示
			}, options);
		});
	};

	bill.on('hide', function() {
		dialogConfirm.hide();
	});

	return $.extend(bill, {
		set: set, // 设置账单
		// vm: vm, // 账单vm(不建议暴露)
		onReturnHome: $.noop, // 点击返回首页时(可 return false 取消默认)
		onFinish: $.noop, // 点击完成时(可 return false 取消默认)
		onGotoPay: $.noop, // 点击支付时(可 return false 取消默认)
		onClose: $.noop, // 关闭订单时
	});
});