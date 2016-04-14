// 余效俭 2016-1-9 10:47:16 创建
// H5微信端 --- 安全中心
require([
	'router', 'h5-api', 'h5-view', 'h5-view-authentication', 'h5-dialog-success',
	'h5-paypass', 'h5-weixin'
], function(
	router, api, View, viewAuthen, dialogSuccess
) {
	router.init(true);
	var gopToken = $.cookie('gopToken');
	var security = $('.security');
	new View('paypass-view-2');
	new View('paypass-view-3');

	var dialogShow = function() { // 显示浮层
		var timer = null;
		var second = 3;
		dialogSuccess.on('show', function() {
			timer = setInterval(function() {
				second--;
				if (second <= 0) {
					window.location.href = './mine.html';
					dialogSuccess.hide();
					clearInterval(timer);
				} else {
					dialogSuccess.button.html('支付密码修改成功，请牢记，' + second + 's后自动跳转');
				}
			}, 1000);
		});
		dialogSuccess.set('支付密码修改成功，请牢记，3S后自动跳转');
		dialogSuccess.show();
	};


	var vm = avalon.define({
		$id: 'security',
		authenticationed: false, // 实名认证
		setProtected: false, // 未设置 密保问题
		getPassWorld: true, // 是否设置密码 false未设置
		paypass2: '',
		paypass3: '',
		paypass2Next: false,
		paypass3Next: false,
		authentication_click: function() {
			router.go('/authentication');
		},
		paypass2Value: function() {
			vm.paypass2Next = vm.paypass2.length === 6 ? true : false;
		},
		paypass3Value: function() {
			vm.paypass3Next = vm.paypass3.length === 6 ? true : false;
		},
		protect_click: function(e) {
			if (!vm.setProtected) { //没密保
				if (vm.getPassWorld) { //已设置密码
					window.location.href = "./protection.html";
				} else { // 未设置
					$.alert('请先设置密码');
				}
			}
			// window.location.href = "./protection.html"; 
		},
		paypass2Click: function() {
			if (vm.paypass2.length == 6) {
				router.go('/paypass-view-3');
			}
		},
		paypass3Click: function() {
			if (vm.paypass3 == vm.paypass2 && vm.paypass3.length == 6) {
				api.setPayPassword({
					gopToken: gopToken,
					password: vm.paypass2
				}, function(data) {
					if (data.status == 200) {
						vm.paypass2 = '';
						vm.paypass3 = '';
						dialogShow();
					} else {
						$.alert(data.msg);
					}
				});
			} else {
				$.alert('两次输入不一致');
			}
		},
	});
	avalon.scan();
	var init = function() {
		api.isCertification({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				vm.authenticationed = true;
			} else {
				console.log(data);
			}
		});
		setTimeout(function() {
			api.isQuestion({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					vm.setProtected = true;
					vm.setProtectedStr = "已设置";
				} else {
					console.log(data);
				}
			});
		}, 200);
		api.checkPayPasswordStatus({
			'gopToken': gopToken
		}, function(data) {
			vm.getPassWorld = data.msg === '支付密码未设置' ? false : true;
		});
	}

	viewAuthen.vm.callbackFlag = true;
	viewAuthen.vm.callback = function() {
		vm.authenticationed = true;
	}
	setTimeout(function() {
		security.addClass('on');
	}, 100);
	init();
});