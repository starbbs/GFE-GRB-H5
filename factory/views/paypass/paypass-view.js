// 张树垚 2016-01-09 14:29:10 创建
// H5微信端 --- paypass-view   
// 此页面包含  设置密码2  3步 回调成功弹窗 页面刷新


define('h5-paypass-view', [
	'h5-api', 'router',
	'h5-view','h5-dialog-success'
], function(
	api, router,
	View,dialogSuccess
) {
	router.init(true);

	var view2 = $('.paypass-view-2set');
	var view3 = $('.paypass-view-3set');
	var gopToken = $.cookie('gopToken');
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

	var paypassviewvm = {};

	var paypass2VM = avalon.define({
		$id: 'paypass-view-2set',
		paypass2: '',
		paypass2Next: false,
		paypass2Value: function() { //输入时候的value值
			paypass2VM.paypass2Next = paypass2VM.paypass2.length === 6 ? true : false;
		},
		paypass2Click: function() {
			if (paypass2VM.paypass2.length == 6) {
				router.go('/paypass-view-3set');
			}
		},
	});
	avalon.scan(view2[0], paypass2VM);
	var paypass3VM = avalon.define({
		$id: 'paypass-view-3set',
		paypass3: '',
		paypass3Next: false,
		callback: $.noop,
		paypass3Value: function() {
			paypass3VM.paypass3Next = paypass3VM.paypass3.length === 6 ? true : false;
		},
		paypass3Click: function() {
			console.log(paypass2VM.paypass2 + ' ==' + paypass3VM.paypass3);
			if (paypass2VM.paypass2 == paypass3VM.paypass3 && paypass3VM.paypass3.length == 6) {
				api.setPayPassword({
					gopToken: gopToken,
					password: paypass3VM.paypass3
				}, function(data) {
					if (data.status == 200) {
						paypass2VM.paypass2 = '';
						paypass3VM.paypass3 = '';
						dialogShow();
						paypass3VM.callback && paypass3VM.callback();
						// dialogShow(); //密码修改完成后在dialogShow中做页面跳转
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
	});
	avalon.scan(view3[0], paypass3VM);
	paypassviewvm['paypass2VM'] = paypass2VM;
	paypassviewvm['paypass3VM'] = paypass3VM;

	return paypassviewvm;

});