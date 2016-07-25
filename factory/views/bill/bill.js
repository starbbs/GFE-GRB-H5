// 张树垚 2016-02-24 16:16:44 创建
// 魏冰冰 2016-05-25          重构
// H5微信端 --- view-bill 账单详情分页
/**
 * [set 设置账单详情]
 * @Author   魏冰冰
 * @DateTime 2016-03-09
 * @param    {[string]}       		type					[账单类型]
 * @param    {[string|number]}		id						[账单ID]
 * @param    {[json]}         		options					[设置参数]
 * @param    {[string]}       		options.forceStatus		[强制状态]
 * @param    {[function]}     		options.onRequest		[后台请求回调,参数data]
 * @param    {[function]}     		options.onRendered		[vm渲染回调,参数vm]
 */

define('h5-view-bill', [
	'h5-api', 'router', 'filters', 'mydate', // 公用功能
	'h5-view', 'h5-weixin', 'h5-order-judge', 'h5-component-bill', // H5功能
	'h5-dialog-confirm' // H5组件
], function(
	api, router, filters, mydate,
	View, weixin, orderJudge, H5bill,
	dialogConfirm
) {

	var gopToken = $.cookie('gopToken');

	var bill = new View('bill');
	var main = $('.bill');

	var nowData = null; // 当前使用的后台原始数据
	var weixinPayData = null; // 微信重新支付数据

	var defaultAddress = '地址已删除'; // 默认地址栏内容

	var set = function(type, id, options) { // 账单分流
		type = (type + '').trim().toUpperCase();
		// console.log(type);
		options = options || {};
		switch (type) {
			case 'BUYIN_ORDER': // 买入, 消息
			case 'BUY_IN': //买果仁
				buyInHandler('BUY_IN', id, options);
				break;
			case 'TRANSFER_OUT': // 转出
				transferOutHandler('TRANSFER_OUT', id, options);
				break;
			case 'TRANSFER_IN': // 转账, 转入
				transferInHandler('TRANSFER_IN', id, options);
				break;
			case 'REFUND': // 退款
				refundHandler('REFUND', id, options);
				break;
			case 'CONSUME_ORDER': // 消费, 消息
			case 'PAY': // 消费, 列表
				consumeHandler('PAY', id, options);
				break;
			default:
				$.alert('未知类型的账单' + type);
		}
	};

	//关闭  去支付  完成   公用函数
	var closeOrder = function(vm) {
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
	};

	var gotoPayOrder = function(vm) { // 前往支付 买话费 跳转order
		// 买果仁
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
			//orderJudge.checkRMB(vm.waitForPayMoney, function(status, gopPrice, myGopNum) {
			//	if (status === orderJudge.ok) {
			window.location.href = './order.html?from=bill&id=' + vm.id;
			//	} else {
			//		$.alert(orderJudge.tip);
			//	}
			// });
		}
	};

	var goHome = function() {
		window.location.href = './home.html';
	};

	//===话费
	var phoneJSON = {
		id: '', // 账单ID
		type: '', // 类型
		status: '', // 订单状态
		headClass: '', // 头部样式名
		headContent: '', // 头部内容

		failReason: '', // 失败原因
		orderMoney: 0, // 订单金额
		payMoney: 0, // 消费--支付金额
		payGop: 0, // 消费--支付果仁数
		phoneNum: '', // 手机号		
		bankCangory: '', // 银行卡类型
		bankName: '', //银行卡名称
		bankLastNum: '', //银行卡尾几位
		productDesc: '', // 商品信息
		voucherClassName: '', //优惠券class名字
		voucherNum: '', //优惠券金额
		voucherName: '', //优惠券名字
		voucherOrderMoney: '', //优惠后金额
		hasPay: false, //是否付过钱

		orderTime: '', // 交易时间
		closeTime: '', // 关闭时间
		// submitTime: '', // 提交时间
		createTime: '', // 创建时间
		orderCode: '', // 订单号
		serialNum: '', // 流水号
		payType: '', // 支付方式

		waitForPay: false, // 等待支付 及  按钮
		waitForPayMoney: '', // 等待支付金额
		// ifPayButton:false, //等待支付按钮
		ifTip: false, // 提示文字
		ifFinishButton: false, //提示完成按钮
		ifReturnButton: false, //返回按钮  流程交易失败

		showHide: false, //显示更多
		showHideMoreBTN: false //显示更多按钮
	};
	var billPhoneVM = avalon.define($.extend({
		$id: 'billPhone',
		close: function() { // 关闭订单
			closeOrder(billPhoneVM);
		},
		gotoPay: function() {
			gotoPayOrder(billPhoneVM);
		},
		finish: function() {
			window.location.href = './home.html';
		},
		showHideMore: function() {
			billPhoneVM.showHide = !billPhoneVM.showHide;
		}
	}, phoneJSON));

	var consumeHandler = function(type, id, options) { // 消费 话费流量 step1
		api.query({
			gopToken: gopToken,
			consumeOrderId: id
		}, function(data) {
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.consumeOrder || data.status != 200) { //不成功
				//data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.consumeOrder; //定单信息 创建时间 
			var list = data.data.recordList; //流水号 创建时间 支付果仁  付款还会产生的
			var product = data.data.product; // 商品信息 流量 话费 面额
			var extra = data.data.extra; //银行卡
			var vouch = data.data.billVoucher; // 交易成功  已付款进行中 的优惠券  
			var waitForPay = (order.status = options.forceStatus || order.status) == 'PROCESSING' && (!list || !list.length);
			var payMoney, payGop;
			console.log(order.status === 'FAILURE' && window.location.href.indexOf('order.html') != -1);
			list.forEach(function(item) {
				item.payMoney && (payMoney = item.payMoney);
				item.payGop && (payGop = item.payGop);
			});
			$.extend(billPhoneVM, phoneHandler(type, id, order, waitForPay, list, product, extra, vouch), {
				payMoney: payMoney, // 支付金额
				payGop: payGop, // 支付果仁数
				failReason: order.status === 'FAILURE' ? data.data.trade && data.data.trade.result ? data.data.trade.result : list[0].payResult : '', //失败原因				
				// 已经支付 未到帐  显示以下
				// 已经支付  交易失败 不显示到帐
				waitForPayMoney: waitForPay ? order.orderMoney : '', //(!list && !list.length )&& order.status === 'PROCESSING' ? order.orderMoney : '',
				orderMoney: list && list.length || order.status === 'CLOSE' ? order.orderMoney : '', //订单金额
				ifTip: list && list.length && order.status === 'PROCESSING' ? true : false, // 已付款进行中  提示文字
				hasPay: list && list.length ? true : false, //是否付过钱
				// ifTip: list && list.length && order.status != 'FAILURE' ? true : false,
				// tip: list && list.length && order.status === 'PROCESSING' ? '预计15分钟内到账, 请稍后查看账单状态<br>如有疑问, 请咨询' : '',
				ifReturnButton: order.status === 'FAILURE' && window.location.href.indexOf('order.html') != -1,
			}, options);
			options.onRendered && options.onRendered(billPhoneVM);
		});
	};

	var phoneHandler = function(type, id, order, waitForPay, list, product, extra, vouch) { //话费流量 数据处理 step2
		return {
			id: id, // 账单ID
			type: type, // 类型
			status: order.status, // 订单状态
			headClass: H5bill.statusClass[order.status], // 头部样式名
			headContent: getHeaderContent(order.status, waitForPay) + (((order.status === 'PROCESSING' || order.status === 'SUCCESS') && extra.bankcard) ? '(<span>￥</span>)' : (((order.status === 'PROCESSING' && !waitForPay) || order.status === 'SUCCESS')) ? '(<span class="iconfont icon-g"></span>)' : ''), // 头部内容
			waitForPay: waitForPay, // 等待支付
			waitForPayMoney: order.status !== 'PROCESSING' ? '' : order.orderMoney, //等待支付金额
			productDesc: product.productDesc, // 商品信息
			// failReason: order.status == 'FAILURE' ? order.payResult || ($.isArray(list) ? list.reduce(function(string, item, index) {
			// 	return string += item.payResult || ''; // 从支付方式中找出失败原因
			// }, '') : '') : '', // 失败原因
			phoneNum: JSON.parse(order.extraContent).phone ? JSON.parse(order.extraContent).phone : '', //充值号码
			bankCangory: extra.bankcard ? extra.bankcard.cardType.indexOf('SAVINGS') != -1 ? '储蓄卡' : '信用卡' : '', //银行类型
			bankName: extra.bankcard ? extra.bankcard.bankName : '', //银行名称
			bankLastNum: extra.bankcard ? extra.bankcard.cardNo.substr(extra.bankcard.cardNo.length - 4, 4) : '', //银行卡尾几位
			closeReason: order.status === 'CLOSE' ? order.payResult : '', // 关闭原因
			orderTime: order.status !== 'CLOSE' ? order.updateTime === order.createTime ? '' : order.updateTime : '', // 交易时间
			closeTime: order.status === 'CLOSE' ? order.updateTime : '', // 关闭时间
			// createTime: order.updateTime ? '' : order.createTime, // 创建时间
			createTime: order.status === 'PROCESSING' ? order.createTime : '', // 创建时间
			orderCode: order.orderCode, // 订单号
			serialNum: $.isArray(list) ? list.map(function(item) {
				return item.tradeNo;
			}).join('<br>') : order.serialNum,
			payType: H5bill.payType[order.payType], // 支付方式
			voucherClassName: (order.status === 'PROCESSING' || order.status === 'SUCCESS') && vouch ? vouch.voucherType + vouch.voucherAmount : '', //优惠券所用类名
			voucherNum: order.status === 'FAILURE' && vouch ? vouch.voucherAmount : '', //优惠券金额
			voucherName: vouch ? vouch.voucherName : '', //优惠券名字
			orderMoney: order.orderMoney ? order.orderMoney : '', // 订单金额
			voucherOrderMoney: order.orderMoney && vouch ? (order.orderMoney - vouch.voucherAmount < 0 ? 0 : (order.orderMoney - vouch.voucherAmount)) : '', //优惠后金额
			showHide: order.status === 'CLOSE' || waitForPay || window.location.href.indexOf('order.html') > -1 ? true : false, //账单关闭状态不显示 读取更多按钮
			showHideMoreBTN: order.status === 'CLOSE' || waitForPay || window.location.href.indexOf('order.html') != -1 ? false : true,
			// ifPayButton: waitForPay, // 是否显示"前往支付"按钮
			// ifClose: waitForPay, // 是否显示"关闭"
		};
	};

	//===退款
	var refundJSON = {
		id: '', // 账单ID
		type: '', // 类型
		status: '', // 订单状态
		headClass: '', // 头部样式名
		headContent: '', // 头部内容
		refundNum: '', // 退款数目
		voucherName: '', //退款优惠券名称
		refundWord: '', // 退款状态说明
		productDesc: '', // 商品信息
		transferTime: '', // 到账时间
		submitTime: '', // 提交时间
		orderCode: '', // 订单号
		serialNum: '', // 流水号				
	};
	var billRefundVM = avalon.define($.extend({
		$id: 'billrefund',
	}, refundJSON));

	var refundHandler = function(type, id, options) { // 退款
		api.refundQuery({
			gopToken: gopToken,
			refundId: id
		}, function(data) {
			options.onRequest && options.onRequest(data);
			if (!data.data || data.status != 200) {
				//data.msg && $.alert(data.msg);
				return;
			}
			$.extend(billRefundVM, {
				id: id, // 账单ID
				type: type, // 类型
				status: data.data.status, // 订单状态
				headClass: H5bill.statusClass[data.data.status], // 头部样式名
				headContent: H5bill.getStatusRefund(data.data, true), // 头部内容
				refundNum: data.data.payGop == 0 ? '0.' + data.data.payGop : data.data.payGop || data.data.payMoney, // 退款数目
				refundWord: H5bill.getRefundWord(data.data), // 退款状态说明
				productDesc: data.data.orderDesc, // 商品信息
				voucherName: data.data.billVoucher ? data.data.billVoucher.voucherName : '', //退款优惠券内容
				transferTime: data.data.updateTime, // 到账时间
				submitTime: data.data.createTime, // 提交时间
				orderCode: data.data.orderCode, // 订单号
				serialNum: data.data.serialNum, // 流水号
			}, options);
			options.onRendered && options.onRendered(billRefundVM);
		});
	};

	//===转帐
	var transferJSON = {
		id: '', // 账单ID
		type: '', // 类型
		status: '', // 订单状态
		headClass: '', // 头部样式名
		headContent: '', // 头部内容

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

		ifReturnHome: false, //返回首页
		failReason: '', // 失败原因
		submitTime: '', // 提交时间
		// orderCode: '', // 订单号
		serialNum: '', // 流水号
	};

	var billTransferVM = avalon.define($.extend({ // 转帐的VM 
		$id: 'billTransfer',
		returnHome: function() {
			window.location.href = './home.html';
		},
	}, transferJSON));

	var transferOutHandler = function(type, id, options) { // 转出帐单  step 1
		api.transferQuery({
			gopToken: gopToken,
			transferOutId: id
		}, function(data) {
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.transferOut || data.status != 200) {
				return;
			}
			var order = data.data.transferOut;
			$.extend(billTransferVM, transferDataHandler(type, id, order), {
				transferSign: '-',
			}, options);
			order.personId && setUser(order.personId);
			options.onRendered && options.onRendered(billTransferVM);
		});
	};

	var transferInHandler = function(type, id, options) { // 转入帐单 只有成功 step 1
		api.transferInQuery({
			gopToken: gopToken,
			transferInId: id
		}, function(data) {
			options.onRequest && options.onRequest(data);
			if (!data.data || !data.data.transferIn || data.status != 200) {
				return;
			}
			var order = data.data.transferIn;
			$.extend(billTransferVM, transferDataHandler(type, id, order), {
				transferSign: '+',
			}, options);
			order.personId && setUser(order.personId);
			options.onRendered && options.onRendered(billTransferVM);
		});
	};

	var transferDataHandler = function(type, id, order) { // 转出转入 数据处理
		var startTime = order.createTime;
		var finishTime = order.transferTime || order.updateTime;
		if (order.status === 'PROCESSING') {
			finishTime = mydate.parseDate(startTime);
			finishTime.setHours(finishTime.getHours() + 2);
			// finishTime = '预计' + mydate.date2String3(finishTime) + '前到账';
			finishTime = '(工作日9:00-18:00提交)';
		}
		return {
			id: id, // 账单ID
			type: type, // 类型
			status: order.status, // 订单状态
			headClass: H5bill.statusClass[order.status], // 头部样式名
			headContent: H5bill.statusTransfer[order.status][type] + ' (' + H5bill.unit.gop + ')', // 头部内容
			transferNum: order.gopNum, // 转果仁--果仁数
			transferIcon: H5bill.transferClass[order.type], // 转果仁--头像图标
			transferName: H5bill.transferType[order.type], // 转果仁--名字
			transferAddress: (order.transferAddress || order.address) ? filters.address(order.transferAddress || order.address) : defaultAddress, // 转果仁--地址
			transferImg: '', //设置头像
			transferStage: H5bill.transferStage[order.status], // 转果仁--进度阶段
			transferTime: order.transferTime, // 转果仁--到账时间
			transferStart: startTime, // 转果仁--创建时间
			transferOver: finishTime, // 转果仁--完成或预计时间
			transferFailReason: order.failureMsg, // 转果仁--失败原因
			poundage: order.serviceFee > 0 ? '手续费  0.01' : type === 'TRANSFER_IN' ? '果仁已入帐' : '免手续费', //手续费
			submitTime: order.status === 'FAILURE' ? order.createTime : '', // 提交时间
			transferDesc: order.transContent, // 转果仁--转账说明
			ifTip: order.status === 'FAILURE', // 是否显示底部提示
			serialNum: order.serialNum, // 流水号
		};
	};

	var setUser = function(personId) { // 设置联系人
		api.contactInfo({
			gopToken: gopToken,
			personId: personId
		}, function(data) {
			if (data.status == 200) {
				setOne(billTransferVM, 'transferName', data.data.remark || data.data.nick || (data.data.contactType === 'WALLET_CONTACT' ? '未命名地址' : '未命名用户'));
				setOne(billTransferVM, 'transferImg', data.data.photo || '');
				setOne(billTransferVM, 'transferAddress', setUserAddress(data));
				//setOne(billTransferVM, 'transferAddress', data.data.nick ? (data.data.nick === '果小萌' ? '' : filters.phone(data.data.phone)) : (filters.address(data.data.address) || defaultAddress));
			}
		});
	};
	var setUserAddress = function(data) {
		console.log(data.data.contactType);
		if (data.data.contactType == 'GOP_CONTACT') { //果仁宝联系人  手机号
			return filters.phone(data.data.phone);
		} else if (data.data.contactType == 'WALLET_CONTACT') { //地址
			return data.data.address ? filters.address(data.data.address) : defaultAddress;
		}
		return
	};
	var setOne = function(vm, key, value) { // 设置一个vm属性
		vm[key] !== value && (vm[key] = value);
	};

	//===买果仁
	var buygopJSON = {
		id: '', // 账单ID
		type: '', // 类型
		status: '', // 订单状态
		headClass: '', // 头部样式名
		headContent: '', // 头部内容
		waitForPayMoney: '', // 等待支付金额
		gopNum: 0, // 买果仁成功--获得的果仁数
		gopPrice: 0, // 买果仁--成交价
		buyMoney: 0, // 买果仁--支付金额
		noPayGopNum: 0, //进行中 关闭 预得果仁  

		failReason: '', // 失败原因
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

		waitForPay: false, // 等待支付及按钮  关闭按钮
		ifFinishButton: false, // 完成按钮		
	};
	var billBuyGopVM = avalon.define($.extend({ // 买果仁VM
		$id: 'billBuyGop',
		/*
		gotoPay: function() { // 前往支付 买果仁和买话费
			// 买果仁
			if (billBuyGopVM.payType === '微信支付') {
				console.log(weixinPayData)
				weixin.pay.onSuccess = function(res) {
					buyInHandler('BUY_IN', billBuyGopVM.id, {
						forceStatus: 'SUCCESS',
						ifFinishButton: true
					});
				};
				weixin.pay.set(weixinPayData);
				weixin.pay.work();
			} else {
				orderJudge.checkRMB(billBuyGopVM.waitForPayMoney, function(status, gopPrice, myGopNum) {
					if (status === orderJudge.ok) {
						window.location.href = './order.html?from=bill&id=' + billBuyGopVM.id;
					} else {
						$.alert(orderJudge.tip);
					}
				});
			}
		},
		*/
		close: function() { // 关闭订单
			closeOrder(billBuyGopVM);
		},
		gotoPay: function() {
			gotoPayOrder(billBuyGopVM);
		},
	}, buygopJSON));

	var buyInHandler = function(type, id, options) { // 买果仁 step 1
		api.queryBuyinOrder({
			gopToken: gopToken,
			buyinOrderId: id,
			payType: 'WEIXIN_MP_PAY'
		}, function(data) {
			options.onRequest && options.onRequest(data);
			data.data.WEIXIN_MP_PAY && (weixinPayData = data.data.WEIXIN_MP_PAY);
			if (!data.data || !data.data.buyinOrder || data.status != 200) {
				//data.msg && $.alert(data.msg);
				return;
			}
			var order = data.data.buyinOrder; // 订单 
			var list = data.data.recordList; // 支付
			var waitForPay = (order.status = options.forceStatus || order.status) == 'PROCESSING' && (!list || !list.length);
			$.extend(billBuyGopVM, buyGopHandler(type, id, order, list, waitForPay), options);
			options.onRendered && options.onRendered(billBuyGopVM);
		});
	};

	function getHeaderContent(_status, _waitforPay) {

		if (_status == "PROCESSING") {
			if (_waitforPay) {
				return '待支付';
			} else {
				return '进行中';
			}
		} else {
			return H5bill.statusBusiness[_status]
		}
	}
	var buyGopHandler = function(type, id, order, list, waitForPay) { // 买果仁数据处理
		var buyInPrice = order.price;
		if(order.status ==='PROCESSING'){
			api.getselloneprice({}, function(data) {
				buyInPrice = data.optimumBuyPrice;
			},function(){},true);
		}
		return {
			id: id, // 账单ID
			type: type, // 类型
			status: order.status, // 订单状态
			headClass: H5bill.statusClass[order.status], // 头部样式名
			headContent: getHeaderContent(order.status, waitForPay), // 头部内容
			waitForPay: waitForPay, // 等待支付
			waitForPayMoney: order.status !== 'PROCESSING' ? '' : order.orderMoney, //等待支付金额
			gopNum: order.status === 'SUCCESS' ? order.gopNum : '', //success获得果仁数
			noPayGopNum: order.orderMoney / buyInPrice, //预获果仁
			closeReason: order.status === 'CLOSE' ? order.payResult : '', // 关闭原因
			orderMoney: order.status === 'PROCESSING' || order.status === 'FAILURE' ? '' : order.orderMoney, // 订单金额
			gopPrice: buyInPrice, // 成交价格
			orderTime: order.status === 'SUCCESS' ? order.payTime : '', // 交易时间
			closeTime: order.status === 'CLOSE' ? order.updateTime : '', // 关闭时间
			// createTime: order.updateTime ? '' : order.createTime, // 创建时间
			createTime: order.status === 'PROCESSING' ? order.createTime : '', // 创建时间
			orderCode: order.orderCode, // 订单号
			serialNum: order.status === 'SUCCESS' || order.status === 'FAILURE' ? order.serialNum : '', //流水号
			productDesc: order.status === 'PROCESSING' ? '果仁' : order.status === 'FAILURE' ? '购买果仁' : order.status === 'CLOSE' ? '买果仁' : '', //商品信息
			/*
			serialNum: $.isArray(list) ? list.map(function(item) {
				return item.tradeNo;
			}).join('<br>') : order.serialNum, //流水号
			*/
			payType: H5bill.payType[order.payType], // 支付方式
			// ifPayButton: waitForPay, // 是否显示"前往支付"按钮
			// ifClose: waitForPay, // 是否显示"关闭"
		}
	};
	avalon.scan();

	bill.on('hide', function() {
		$.extend(billPhoneVM, phoneJSON);
		$.extend(billBuyGopVM, buygopJSON);
		$.extend(billTransferVM, transferJSON);
		$.extend(billRefundVM, refundJSON);
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