
// 张树垚 2016-01-07 18:06:48 创建
// H5微信端 --- dialog-paypass支付浮层


define('h5-dialog-paypass', ['h5-dialog', 'check', 'h5-api', 'h5-paypass'], function(Dialog, check, api) {

	var gopToken = $.cookie('gopToken');

	var paypass = new Dialog('paypass');

	var box = paypass.box = paypass.self.find('.dialog-paypass-box'); // 大盒子
	var input = paypass.input = $('#dialog-paypass-input'); // 输入框
	var inputTimer = null;

	// 实名认证状态
	// 1. unknown	未知		不出认证页,不弹浮层
	// 2. not		未认证	出认证页,不弹浮层
	// 3. done 		已认证	不出认证页,弹浮层
	// 4. lock		已锁定	(优先级高)不出认证页,不弹浮层,弹"知道了"浮层
	var authenticationStatus = 'unknown';
	api.checkPayPasswordStatus({ // 页面加载初判断一次
		gopToken: gopToken
	}, function(data) { // 每次打开时都要判断
		if (data.status == 311) {
			authenticationStatus = 'not';
		} else {
			authenticationStatus = 'done';
		}
		if (data.data.result === 'error') {
			authenticationStatus = 'lock';
		}
	});

	var showAuthentication = function() { // 出认证页

	};
	var showDialogPaypass = function() { // 出支付浮层

	};
	var showDialogKnown = function() { // 出"知道了"弹窗

	};

	var vm = paypass.vm = avalon.define({
		$id: 'dialog-paypass',
		close: function() {
			paypass.hide();
		},
		callback: $.noop, // 下一步
		focus: function() { // 获取焦点时
			setTimeout(function() {
				document.body.scrollTop = 0;
			}, 500);
		},
		input: function() { // 输入时
			var value = this.value;
			clearTimeout(inputTimer);
			if (check.paypassCondition(value)/* && check.paypass(value).result*/) {
				inputTimer = setTimeout(function(){
					api.checkPayPwd({
						gopToken: gopToken,
						payPwd: value
					}, function(data) {
						if (data.status == 200) {
							paypass.hide();
							vm.callback(value);
						} else {
							$.alert(data.msg, {
								top: document.body.scrollTop + box.get(0).getBoundingClientRect().top - 60 // ios键盘出现, alert定位bug
							});
							input.get(0).paypassClear();
						}
					});
				}, 500);
			}
		},
	});

	// paypass.on('beforeShow', function() {

	// });
	paypass.on('show', function() {
		setTimeout(function() {
			input.get(0).focus();
		}, 10);
	});
	paypass.on('hide', function() {
		// 清除input的value并失焦
		input.val('').get(0).blur();
		input.get(0).paypassClear();
	});

	return paypass;
});
