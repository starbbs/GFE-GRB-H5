
// 张树垚 2016-01-13 10:25:30 创建
// H5微信端 --- component-status 订单相关


define('h5-component-bill', function() {
	var bill = {
		unit: { // 货币单位
			money: '¥',
			RMB: '¥',
			gop: '<span class="iconfont icon-g"></span>',
			GOP: '<span class="iconfont icon-g"></span>',
		},
		statusClass: { // 订单状态对应class名称
			PROCESSING: 'going',
			SUCCESS: 'success',
			FAILURE: 'fail',
			CLOSE: 'close',
		},
		statusBusiness: { // 交易状态对应中文
			PROCESSING: '进行中',
			SUCCESS: '交易成功',
			FAILURE: '交易失败',
			CLOSE: '已关闭',
		},
		statusRefund: { // 退款状态对应中文
			PROCESSING1: '已提交', // 判断updatetime是否等于createtime
			PROCESSING2: '处理中', // 不同时是处理中
			SUCCESS: '退款成功',
			FAILURE: '退款失败',
		},
		getStatusRefund: function(item, ifUseUnit) { // 数据, 是否加单位
			var status = bill.statusRefund[item.status];
			if (item.status === 'PROCESSING') {
				status = item.createTime === (item.businessTime || item.updateTime) ? bill.statusRefund.PROCESSING1 : bill.statusRefund.PROCESSING2;
			}
			if (ifUseUnit && item.currency) {
				status += ' (' + bill.unit[item.currency] + ')';
			}
			return status;
		},
		refundWord: {
			PROCESSING1: '退款申请已提交',
			PROCESSING2: '处理中...稍后退款到',
			SUCCESS: {
				GOP: '果仁已入账',
				RMB: '金额已到账',
			},
			FAILURE: '未到账成功',
		},
		getRefundWord: function(item) {
			var word = bill.refundWord[item.status];
			if (item.status === 'PROCESSING') {
				word = item.createTime === (item.businessTime || item.updateTime) ? bill.refundWord.PROCESSING1 : bill.refundWord.PROCESSING2;
			}
			if (item.status === 'SUCCESS' && item.currency) {
				word = bill.refundWord.SUCCESS[item.currency];
			}
			return word;
		},
		statusTransfer: {
			PROCESSING: {
				TRANSFER_IN: '转入进行中',
				TRANSFER_OUT: '转账进行中',
			},
			SUCCESS: {
				TRANSFER_IN: '转入成功',
				TRANSFER_OUT: '转账成功',
			},
			FAILURE: {
				TRANSFER_IN: '转入失败',
				TRANSFER_OUT: '转账失败',
			},
			CLOSE: {
				TRANSFER_IN: '已关闭',
				TRANSFER_OUT: '已关闭',
			},
		},
		typeClass: { // 类型对应class名称
			TRANSFER_IN: 'transfer',
			TRANSFER_OUT: 'transfer',
			BUY_IN: 'buy',
			PAY: 'phone',
			REFUND: 'refund',
		},
		payType: { // 支付方式
			GOP_PAY: '果仁宝支付',
			UNION_PAY: '银联支付',
			WEIXIN_MP_PAY: '微信支付',
			WEIXIN_OPEN_PAY: '微信支付',
			ALIPAY: '支付宝支付',
			BILL99_PAY: '快钱支付',
		},
		transferType: { // 转账方式
			WALLET_CONTACT: '钱包联系人',
			GOP_CONTACT: '果仁宝联系人',
			ME_WALLET: '我的钱包',
			GOP_MARKET: '果仁市场',
		},
		transferClass: { // 转账样式
			WALLET_CONTACT: 'address',
			GOP_CONTACT: 'address',
			ME_WALLET: 'wallet',
			GOP_MARKET: 'market',
		},
		transferStage: { // 转账阶段(同名样式)
			PROCESSING: 'half',
			SUCCESS: 'finish',
			FAILURE: '',
			CLOSE: '',
		},
		transferNoNames: { // 未命名联系人
			GOP_CONTACT: '未命名用户',
			WALLET_CONTACT: '未命名地址',
		},
	};
	return bill;
});


