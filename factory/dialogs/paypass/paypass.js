
// 张树垚 2016-01-07 18:06:48 创建
// H5微信端 --- dialog-paypass支付浮层


define('h5-dialog-paypass', ['h5-dialog', 'check', 'h5-api', 'h5-paypass-judge', 'h5-paypass'], function(Dialog, check, api, judge) {

	var gopToken = $.cookie('gopToken');

	var paypass = new Dialog('paypass');

	var box = paypass.box = paypass.self.find('.dialog-paypass-box'); // 大盒子
	var input = paypass.input = $('#dialog-paypass-input'); // 输入框
	var inputTimer = null;

	var authenticationStatus = judge.defaultStatus;
	judge.check(function(status, data) {
		// status 状态
		// 1. unknown	未知		不出认证页,不弹浮层
		// 2. not		未认证	出认证页,不弹浮层
		// 3. done 		已认证	不出认证页,弹浮层
		// 4. lock		已锁定	(优先级高)不出认证页,不弹浮层,弹"知道了"浮层
		authenticationStatus = status;
	});

	var prototypeShow = paypass.show;
	paypass.show = function() {
		switch(authenticationStatus) {
			case 'not':
				showAuthentication();
				break;
			case 'done':
				showDialogPaypass();
				break;
			case 'lock':
				showDialogKnown();
			case 'unknown':
				console.log('未知状态');
				break;
			default:
				console.log('Error: (dialog-paypass) authenticationStatus 认证状态错误');
		}
	};

	var showAuthentication = function() { // 出认证页

	};
	var showDialogPaypass = function() { // 出支付浮层
		prototypeShow.call(paypass);
	};
	var showDialogKnown = function() { // 出"知道了"弹窗
	
	};
	var gotoFrozen = function() { // 进入冻结页
		setTimeout(function() {
			window.loaction.href = 'frozen.html?type=useup'; // 用光可支付次数
		}, 100);
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
							judge.check(function(status, data) {
								authenticationStatus = status;
								if (data.data.result === 'error') {
									if (data.data.times === 10) {
										gotoFrozen();
									} else {
										showDialogKnown();
									}
								}
							});
						}
					});
				}, 500);
			}
		},
	});

	paypass.on('show', function() { // 显示时输入框自动获取焦点
		input.get(0).focus();
		setTimeout(function() {
			input.get(0).focus();
		}, 300);
	});
	paypass.on('hide', function() { // 清除input的value并失焦
		input.val('').get(0).blur();
		input.get(0).paypassClear();
	});

	return paypass;
});
