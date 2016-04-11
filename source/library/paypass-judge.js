// 张树垚 2016-04-11 11:02:07 创建
// H5微信端 --- paypass-judge 判断支付状态及跳转控制


define('h5-paypass-judge', ['h5-api'], function(api) {

	var gopToken = $.cookie('gopToken');

	// 状态
	// 1. unknown	未知		不出认证页,不弹浮层
	// 2. not		未认证	出认证页,不弹浮层
	// 3. done 		已认证	不出认证页,弹浮层
	// 4. lock		已锁定	(优先级高)不出认证页,不弹浮层,弹"知道了"浮层

	var res = {
		defaultStatus: 'unknown',
		check: function(callback) { // 支付状态
			callback = callback || $.noop;
			api.checkPayPasswordStatus({ // 页面加载初判断一次
				gopToken: gopToken
			}, function(data) { // 每次打开时都要判断
				var status = res.defaultStatus;
				if (data.status == 311) {
					status = 'not';
				} else {
					status = 'done';
				}
				if (data.data.result === 'error') {
					status = 'lock';
				}
				callback(status, data);
			});
		},

	};

	return res;
});