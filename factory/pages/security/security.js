// 余效俭 2016-1-9 10:47:16 创建
// H5微信端 --- 安全中心
require([
	'router', 'h5-api', 'h5-view', 'h5-view-authentication', 'h5-dialog-success','h5-paypass-view','h5-paypass-judge',
	'h5-paypass', 'h5-weixin', 
], function(
	router, api, View, viewAuthen, dialogSuccess, paypassView, paypassJudge
) {
	router.init(true);
	var gopToken = $.cookie('gopToken');
	var security = $('.security');
	new View('paypass-view-2set');
	new View('paypass-view-3set');

	// paypassJudge.check(function(status, data){

	// });
	var vm = avalon.define({
		$id: 'security',
		authenticationed: false, // 实名认证
		setProtected: false, // 未设置 密保问题
		getPassWorld: true, // 是否设置密码 false未设置
		authentication_click: function() {
			router.go('/authentication');
		},
		protect_click: function(e) {//没密保==>有没有设置过密码
			if (!vm.setProtected) { //没密保
				if (vm.getPassWorld) { //已设置密码
					window.location.href = "./protection.html";
				}else{// 未设置
					$.alert('请先设置支付密码');
				}				
			}
			// window.location.href = "./protection.html"; 
		},
		paypassSet:function(){
			if(vm.getPassWorld){ //已设置  
				window.location.href = './paypass.html';
			}else{ //修改密码步骤
				if(!vm.authenticationed){
					$.alert('请先进行实名认证!');
					return;
				}
				router.go('/paypass-view-2set');
				paypassView.paypass3VM.callback = function(){ // 设置密码后的回调
					window.history.go(-2);
					vm.getPassWorld = true;
				};			
			}
		},
	});
	avalon.scan();
	var init = function() {
		api.isCertification({
			gopToken: gopToken
		}, function(data) {
			console.log(data);
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