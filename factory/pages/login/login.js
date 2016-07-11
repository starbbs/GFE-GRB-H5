// 张树垚 2015-12-27 15:57:31 创建
// H5微信端 --- 微信授权跳转页


require([
	'router', 'h5-api', 'check', 'get', 'h5-authorization', 'h5-view', 'h5-weixin', 'h5-button', 'h5-login-judge',
	'h5-view-agreement', 'h5-text', 'h5-keyboard', 'h5-ident'
], function(
	router, api, check, get, authorization, View, weixin, H5Button, loginJudge
) {

	router.init();
	var gopToken = $.cookie('gopToken'); // 果仁宝token
	var openid = localStorage.getItem("openid");
	var unionid=localStorage.getItem("unionid"); // 判断微信是否和手机绑定的id
	var gotoHome = function() {
		//跳转到新页面之前,修改当前路径为login,防止返回到登录页面。
		var stateObj = {foo:"bar"}
		history.replaceState(stateObj, "pageme", "./linkhome.html");
		authorization.goGet();
	};
	var init = function() {
		router.init(true);
		if (gopToken) {
			gotoHome();
		}
	};
	init();
	var login = new View('login');
	var username =  localStorage.getItem("username"),userimg = localStorage.getItem("userimg");
	var loginVM = login.vm = avalon.define({
		$id: 'index-login',
		name: username?username:'您好', // 微信昵称
		image: userimg?userimg:'./images/picture.png', // 微信头像
		tipIsShow: false,
		mobile: '', // 手机号
		code: '', // 验证码
		blur: function() {
			loginVM.tipIsShow = false;
			// alert('blur    '+loginVM.tipIsShow);
		},
		focus: function() {
			loginVM.tipIsShow = true;
			// alert('focus    '+loginVM.tipIsShow);	
		},
		close: function(attr) { // 关闭按钮
			// $("#index-login-"+attr).val("");
			// loginVM[attr] = '';
		},
		click: function() { // 按钮
			// console.log(H5Button.filter(this));
			var self = $('.button').eq(0).click();
			var _this = $('.button')[0];
			if (self.hasClass('disabled')) {
				return $.alert('正在校验中, 请稍后');
			}

			var mobile = $("#index-login-mobile").val();
			var mobileCheck = check.phone(mobile);
			if (!mobileCheck.result) {
				return $.alert(mobileCheck.message);
			}

			var code = $("#index-login-code").val();
			var codeCheck = check.ident(code);
			if (!codeCheck.result) {
				return $.alert(codeCheck.message);
			}

			var load = _this.__loading;
			load.work();
			api.identifyingCode({
				phone: mobile,
				identifyingCode: code
			}, function(data) {
				if (data.status == 200) {
					api.checkPhoneRelatedWxAccount({
						phone: mobile,
						unionId: unionid,
					}, function(data) {
						if (data.status == 200) {
							api.wxregister({
								phone: mobile,
								identifyingCode: code,
								openId: openid,
							}, function(data) {
								if (data.status == 200) {
									load.reset('欢迎!');
									gopToken = data.data.gopToken;
									$.cookie('gopToken', gopToken);
									localStorage.removeItem("username");
									localStorage.removeItem("userimg");
									localStorage.removeItem("openid");
									localStorage.removeItem("unionid");
									$.alert('微信注册成功!<br>欢迎来到果仁世界!', gotoHome, 'half');
								} else {
									$.alert(data.msg);
									load.reset();
								}
							});
						} else {
							$.alert(data.msg);
							load.reset();
						}
					});
				} else {
					$.alert('验证码错误');
					load.reset();
				}
			});
		},
	});
	login.on('show', function() {
		// login.self.get(0).scrollTop = 0; // 显示时滚回最上面
	});
	avalon.scan(login.native, loginVM);
});