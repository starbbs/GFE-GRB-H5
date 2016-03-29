// 余效俭 2016-1-9 10:47:16 创建
// H5微信端 --- 安全中心
require(['router', 'api', 'h5-view', 'h5-view-password', 'h5-view-authentication', 'h5-dialog-success', 'h5-paypass', 'h5-weixin'], function(router, api, View, viewPassword, viewAuthen ,dialogSuccess) {
	router.init(true);
	var gopToken = $.cookie('gopToken');
	var security = $('.security');
	new View('paypass-view-1');
	new View('paypass-view-2');
	
	var dialogShow = function() { // 显示浮层
		var timer = null;
		var second = 3;
		dialogSuccess.on('show', function() {
			timer = setInterval(function() {
				second--;
				if (second <= 0) {
					finish();
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
		setProtected: false, // 密保问题
		getPassWorld: true, // 是否设置密码 false未设置
		paypass1:'',
		paypass2:'',
		paypass1Next:false,
		paypass2Next:false,
		authentication_click: function() {
			router.go('/authentication');
		},
		paypass1Value:function(){
			vm.paypass1Next = vm.paypass1.length === 6 ? true : false;
			console.log(vm.paypass1Next);
		},
		paypass2Value:function(){
			vm.paypass2Next = vm.paypass2.length === 6 ? true : false;
		},
		protect_click: function(e) {
			if (!vm.setProtected) {
				window.location.href = "./protection.html";
			}
		},
		paypass1Click : function() {
			if (vm.paypass1.length == 6) {
				router.go('/paypass-view-2');
			}
		},
		paypass2Click : function() {
			if (vm.paypass2 == vm.paypass1 && vm.paypass2.length == 6) {
				api.setPayPassword({
					gopToken: gopToken,
					password: vm.paypass2
				}, function(data) {
					if (data.status == 200) {
						vm.paypass1 = '';
						vm.paypass2 = '';
						vm.Idcard = '';
						vm.identifyingCode = '';
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
	var init = function() {
		api.isCertification({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				vm.authenticationed = true;
				vm.authenticationedStr = "已认证";
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
		},function(data){
			vm.getPassWorld = data.msg === '支付密码未设置' ? false : true;
		});
	}
	avalon.scan();
	viewAuthen.vm.callbackFlag=true;
	viewAuthen.vm.callback = function() {
		vm.authenticationed = true;
		vm.authenticationedStr = "已认证";
	}
	setTimeout(function() {
		security.addClass('on');
	}, 100);
	init();
});