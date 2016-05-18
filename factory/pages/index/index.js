// 张树垚 2015-12-27 15:57:31 创建
// H5微信端 --- 微信授权跳转页


require([
	'router', 'h5-api', 'check', 'get', 'h5-authorization', 'h5-view', 'h5-weixin', 'h5-button', 'h5-login-judge',
	'h5-view-agreement', 'h5-text', 'h5-keyboard', 'h5-ident'
], function(
	router, api, check, get, authorization, View, weixin, H5Button, loginJudge
) {
	
	var gopToken = $.cookie('gopToken'); // 果仁宝token
	var wxCode = get.data.code; // 微信认证返回code
	var openid; // 用户的微信id
	var unionid; // 判断微信是否和手机绑定的id

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
			if (!codeCheck.result) {
				return $.alert(codeCheck.message);
			}

			var load = this.__loading;
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
		login.self.get(0).scrollTop = 0; // 显示时滚回最上面
	});
	avalon.scan(login.native, loginVM);

	var gotoAuthorization = function() { // 跳转授权页, 未授权
		// return;
		setTimeout(function() {
			authorization.go(); //跳转威信授权的地址
		}, 100);
	};
	var gotoHome = function() { // 跳转home页面, 已授权, 已绑定账号 解决安卓停留请等待
		setInterval(function() {
			// window.location.href = 'frozen.html'
			authorization.goGet();
		}, 300);
	};
	var gotoLogin = function() { // 跳转login分页
		setTimeout(function() {
			router.to('/index-login');
			document.title = '绑定手机号';
		}, 100);
	};

	var checkToken = function() {
		loginJudge.check(function() {
			gotoHome();
		});
	};
	var checkCode = function() {
		// alert('是否有CODE==='+wxCode);
		if (wxCode) { // 已授权
			api.wxlogin({
				code: wxCode
			}, function(data) {
				if (data.status == 200) { // code有效
					// alert('code有效，返回TOKEN设置COOKIE，然后GOHOME 判断STATE 进入相关页面');
					if (data.data.gopToken) { // 已绑定
						gopToken = data.data.gopToken;
						$.cookie('gopToken', data.data.gopToken);
						gotoHome();
					} else { // 未绑定
						// alert('没有TOKEN 去注册');
						openid = data.data.openid;
						unionid = data.data.unionid;
						loginVM.name = data.data.nick;
						loginVM.image = data.data.img;
						gotoLogin();
					}
				} else { // code无效
					// $.alert(data.msg);
					// alert('code无效去授权');
					gotoAuthorization();
				}
			});
		} else { // 未授权
			// alert('没有CODE未授权 继续检测TOKEN');
			checkToken();
		}
	};

	var init = function() {
		router.init(true);
		if(gopToken){
			gotoHome();
		}else{
			checkCode();
		}
		// setTimeout(function() {
		// 	gotoLogin();
		// }, 100);
	};
	// alert(window.location.href);
	init();
});