// 张树垚 2015-12-27 15:57:31 创建
// H5微信端 --- 微信授权跳转页


require(['router', 'h5-api', 'check', 'get', 'authorization', 'check', 'h5-view', 'h5-weixin', 'h5-ident', 'h5-button', 'h5-view-agreement', 'h5-text', 'h5-keyboard'], function(router, api, check, get, authorization, check, View, weixin, H5Ident, H5Button) {

	// router.init(true);
	router.init();

	var gopToken = $.cookie('gopToken'); // 果仁宝token
	var wxCode = get.data.code; // 微信认证返回code
	var openid; // 用户的微信id

	var mobileInput = $('#index-login-mobile');
	var codeInput = $('#index-login-code');

	var login = new View('index-login');
	var loginVM = login.vm = avalon.define({
		$id: 'index-login',
		name: '您好', // 微信昵称
		image: './images/picture.png', // 微信头像
		mobile: '', // 手机号
		code: '', // 验证码
		close: function(attr) { // 关闭按钮
			loginVM[attr] = '';
		},
		click: function() { // 按钮

			// console.log(H5Button.filter(this));
			var self = $(this);
			if (self.hasClass('disabled')) {
				return $.alert('正在校验中, 请稍后');
			}

			var mobile = loginVM.mobile;
			var mobileCheck = check.phone(mobile);
			if (!mobileCheck.result) {
				return $.alert(mobileCheck.message);
			}

			var code = loginVM.code;
			var codeCheck = check.ident(code);
			if (!mobileCheck.result) {
				return $.alert(codeCheck.message);
			}

			var load = this.__loading;
			load.work();
			api.identifyingCode({
				phone: mobile,
				identifyingCode: code
			}, function(data) {
				if (data.status == 200) {
					console.log(mobile, openid)
					api.checkPhoneRelatedWxAccount({
						phone: mobile,
						unionId: openid,
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
									gotoHome();
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

			// H5Ident.input(mobileInput, codeInput, function() {
			// 	console.log(loginVM.mobile, openid)
			// 	api.checkPhoneRelatedWxAccount({
			// 		phone: loginVM.mobile,
			// 		unionId: openid,
			// 	}, function(data) {
			// 		if (data.status == 200) {} else {}
			// 	});
			// }, function() {
			// 	load.reset();
			// });
		},
	});
	avalon.scan(login.native, loginVM);

	var gotoAuthorization = function() { // 跳转授权页, 未授权
		// return;
		setTimeout(function() {
			window.location.href = authorization.default; //跳转威信授权的地址
		}, 100);
	};
	var gotoHome = function() { // 跳转home页面, 已授权, 已绑定账号
		setTimeout(function() {
			window.location.href = 'home.html?from=index';
		}, 100);
	};
	var gotoLogin = function() { // 跳转login分页
		setTimeout(function() {
			// router.to('/index-login');
			document.title = '绑定手机号';
		}, 100);
	};

	var checkToken = function() {
		if (gopToken) { // 有token
			api.getGopNum({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) { // token有效
					// gotoHome();
					gotoLogin();
				} else { // token无效
					$.cookie('gopToken', null);
					checkCode();
				}
			});
		} else { // 没有token
			checkCode();
		}
	};
	var checkCode = function() {
		if (wxCode) { // 已授权
			api.wxlogin({
				code: wxCode
			}, function(data) {
				if (data.status == 200) {
					if (data.data.gopToken) { // 已绑定
						gopToken = data.data.gopToken;
						$.cookie('gopToken', data.data.gopToken);
						gotoHome();
					} else { // 未绑定
						openid = data.data.openid;
						loginVM.name = data.data.nick;
						loginVM.image = data.data.img;
						gotoLogin();
					}
				} else {
					$.alert(data.msg);
				}
			});
		} else { // 未授权
			gotoAuthorization();
		}
	};

	var init = function() {
		checkToken();
	};

	init();

});