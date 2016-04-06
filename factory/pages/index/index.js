// 张树垚 2015-12-27 15:57:31 创建
// H5微信端 --- 微信授权跳转页


require(['router', 'h5-api', 'check', 'get', 'authorization', 'h5-view', 'h5-weixin', 'h5-ident', 'h5-button', 'h5-view-agreement', 'h5-text', 'h5-keyboard'], function(router, api, check, get, authorization, View, weixin, H5Ident, H5Button) {

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
			var load = this.__loading;
			var self = $(this);
			if (self.hasClass('disabled')) {
				return;
			}
			load.work();
			H5Ident.input(mobileInput, codeInput, function() {
				console.log(loginVM.mobile, openid)
				api.checkPhoneRelatedWxAccount({
					phone: loginVM.mobile,
					unionId: openid,
				}, function() {});
			}, function() {
				load.reset();
			});
		},
	});
	avalon.scan(login.native, loginVM);

	// $.cookie('gopToken','1f12d62f3e344e1ca654fd61533303b1'); // 有钱的帐号
	// $.cookie('gopToken','cb51f72310fa4d22a1c7142e8d48b214'); // 杨娟的帐号
	// $.cookie('gopToken','31df66a5ee434a2cb6e70427e19209a9'); //自己
	// $.cookie('gopToken','4b35b6239f8b465cb126cae77177f2d7'); //自己133
	// $.cookie('gopToken','60371545982b401d9cba6eea72402f01'); //13833298624

	// $.gopToken('d3a40c529c9c4d16b34dc96d49934f61');
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