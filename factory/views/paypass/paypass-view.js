// 张树垚 2016-01-09 14:29:10 创建
// H5微信端 --- page-paypass 修改密码 
// 此页面包含  支付浮层h5-dialog-paypass.js(实名认证，密码设置，锁定次数5-10次)


define('h5-paypass-view',[
	'h5-api', 'router',
	'h5-view',
	'h5-price', 'h5-component-bill',
], function(
	api, router,
	View
) {

	router.init(true);
	var main = $('.view');
	var gopToken = $.cookie('gopToken');

	var paypassviewvm = {};

	var paypass1VM = avalon.define({
		$id: 'paypass-view-1',
		paypass1: '',
		paypass1Next: false,
		paypass1Value:function(){
			console.log(paypass1VM.paypass1.length);
			paypass1VM.paypass1Next = paypass1VM.paypass1.length === 6 ? true : false;
		},
		paypass1Click: function() {
			console.log(1111);
			if (paypass1VM.paypass1.length == 6) {
				//验证支付密码
				api.checkPayPwd({
					gopToken: gopToken,
					payPwd: paypass1VM.paypass1
				}, function(data) {
					if (data.status == 200) {
						router.go('/paypass-view-2');
					} else {
						$.alert(data.msg);
					}
				});
			}
		},
	});
	var paypass2VM = avalon.define({
		$id: 'paypass-view-2',
		paypass2: '',
		paypass2Next: false,
		paypass2Value: function() { //输入时候的value值
			paypass2VM.paypass2Next = paypass2VM.paypass2.length === 6 ? true : false;
		},
		paypass2Click: function() {
			if (paypass2VM.paypass2.length == 6) {
				router.go('/paypass-view-3');
			}
		},
	});
	var paypass3VM = avalon.define({
		$id: 'paypass-view-3',
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
						paypass1VM.paypass1 = '';
						paypass2VM.paypass2 = '';
						paypass3VM.paypass3 = '';
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


	/*
	var vm = avalon.define({
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
	});
	*/
	avalon.scan();
	paypassviewvm['paypass1VM'] = paypass1VM;
	paypassviewvm['paypass2VM'] = paypass2VM;
	paypassviewvm['paypass3VM'] = paypass3VM;
	return paypassviewvm;
});