// 张树垚 2016-01-07 18:06:48 创建
// H5微信端 --- dialog-paypass支付浮层
// (浮层显示时候执此函数 并做一次API校验密码状态paypass-judge.js)


define('h5-dialog-paypass', [
	'h5-dialog', 'check', 'h5-view', 'h5-api', 'h5-paypass-judge', 'h5-dialog-alert', 'router',
	'h5-view-authentication', 'h5-paypass-view', 'h5-paypass'
], function(
	Dialog, check, View, api, judge, dialogAlert, router, authenticationVM, paypassViewVM
) {

	router.init(true);
	var gopToken = $.cookie('gopToken');
	// new View('paypass-view-1');
	new View('paypass-view-2set');
	new View('paypass-view-3set');
	var paypass = new Dialog('paypass');

	// new View('authentication');
	var checkTimer = null;
	var box = paypass.box = paypass.self.find('.dialog-paypass-box'); // 大盒子
	var input = paypass.input = $('#dialog-paypass-input'); // 输入框
	var inputTimer = null;
	/*
	var paypassStatus = judge.defaultStatus;
	
	judge.check(function(status, data) {
		// status 状态
		// 1. unknown	未知		不出认证页,不弹浮层
		// 2. not		未认证	出认证页,不弹浮层
		// 3. done 		已认证	不出认证页,弹浮层
		// 4. lock5 lock10		已锁定	(优先级高)不出认证页,不弹浮层,弹"知道了"浮层
		// 5. notAuthentication  没实名 没设置密码 
		paypassStatus = status;
	});
	*/
	// 点击支付执行paypass浮窗show
	var setPaypassGo = function(status, data){
		switch (status) {
			case 'not': //没有设置密码 
				showPaypass();
				break;
			case 'notAuthentication': //没有设置密码  没实名
				showAuthenticationPaypass();
				break;
			case 'done':
				showDialogPaypass();
				break;
			case 'lock5':
				showDialogKnown();
				break;
			case 'lock10':
				gotoFrozen();
				break;
			case 'unknown':
				console.log('未知状态');
				break;
			default:
				console.log('Error: (dialog-paypass) paypassStatus 认证状态错误');
		}			
	}
	
	var prototypeShow = paypass.show;
	paypass.show = function() {
		clearTimeout(checkTimer);
		checkTimer = setTimeout(function(){
			judge.check(function(status, data) {
				setPaypassGo(status, data);
			});		
		},300);
	};

	var showPaypass = function() { // paypass-view.js设置密码后3秒后执行paypassViewVM.paypass3VM.callback
		// 返回设置密码前的页面
		router.go('paypass-view-2set');
		paypassViewVM.paypass3VM.callback = function() {
			judge.check(function(status, data) {
				paypassStatus = status;
				window.history.go(-2);
			});
		};
	};

	var showAuthenticationPaypass = function() { //认证+设置密码
		router.go('/authentication');
		$.extend(authenticationVM.vm, {
			callback: function() {
				setTimeout(function() {
					router.go('/paypass-view-2set');
					return true;
				}, 1500);
			}
		});
		paypassViewVM.paypass3VM.callback = function() {
			judge.check(function(status, data) {
				paypassStatus = status;
				window.history.go(-3);
			});
			// router.go('/transfer-target');
			// window.history.go(-3);
			// window.location.reload();
		};
	};

	var showDialogPaypass = function() { // 正常出支付浮层
		prototypeShow.call(paypass);
	};
	// ifShowImmediately [是否立即显示, 默认false]
	// ifHideOthers      [是否隐藏其他浮层, 默认false]
	// HideArr           [隐藏指定的浮层, 数组是浮层的名称集合]
	var showDialogKnown = function(ifShowImmediately, ifHideOthers ,HideArr) { // 出"知道了"弹窗  错误5次
		dialogAlert.set('输入5次错误,3小时后解锁');
		dialogAlert.show(ifShowImmediately, ifHideOthers ,HideArr);
	};
	var gotoFrozen = function() { // 进入冻结页  错误10次
		setInterval(function() {
			window.location.href = 'frozen.html?type=useup'; // 用光可支付次数
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
			if (check.paypassCondition(value) /* && check.paypass(value).result*/ ) {
				inputTimer = setTimeout(function() {
					api.checkPayPwd({
						gopToken: gopToken,
						payPwd: value
					}, function(data) {
						if (data.status == 200) {
							paypass.hide();
							vm.callback(value);
						} else {
							/*
							$.alert(data.msg, {
								top: document.body.scrollTop + box.get(0).getBoundingClientRect().top - 60 // ios键盘出现, alert定位bug
							});
							*/
							var alertMsg = data.msg;
							input.get(0).paypassClear(); // 清空输入框
							judge.check(function(status, times, data) { // 检测当前状态
								paypassStatus = status;
								if (status === 'lock5') { // 被锁5次
									// paypass.hide();
									showDialogKnown(false,false,['dialog-paypass']);
								} else if (status === 'lock10') {
									gotoFrozen();
								} else {
									$.alert(alertMsg);
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
	avalon.scan();
	return paypass;
});