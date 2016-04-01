// 张树垚 2016-03-31 16:16:59 创建
// H5微信端 --- 接口


define('h5-api', ['api', 'h5-alert', 'cookie'], function(api) {

	// var baseUri = '.'; // 同域
	var baseUri = 'http://116.213.142.89:8080'; // http测试服务器
	// var baseUri = 'https://endpoint.goopal.com.cn'; // https正式服务器
	// var baseUri = 'https://www.yuxiaojian.cn'; // https测试服务器

	var goIndex = function(useURI) { // 返回首页
		// useURI 是否使用当前页面地址(未完成)
		if (window.location.href.indexOf('/index.html') === -1) {
			return window.location.href = 'index.html';
		} else {
			$.alert('无法获得用户信息');
		}
	};

	$.gopToken = function(token) { // 注入gopGoken
		return $.cookie('gopToken', token);
	};

	api.init({
		baseUri: baseUri,
		onSuccess: function(data) {
			if (!data) {
				return goIndex(true);
			}
			if (data.status == 300 && options.ignoreStatus && options.ignoreStatus.indexOf(300) === -1) { // {msg: "用户登录/验证失败，请重新登录", status: "300"}
				return goIndex(true);
			} else if (data.status == 304 && options.ignoreStatus && options.ignoreStatus.indexOf(304) === -1) { // {msg: "服务器异常", status: "304"}
				return $.alert('服务器异常, 请联系后台人员!');
			}
		},
		onError: function() {
			if (text === 'timeout') {
				$.alert('请求超时...<br>请检查您的网络');
			}
		},
	});

	// 1.手机号注册
	api.add('register', '/login/register');

	// 1.1 手机号注册
	api.add('registerall', '/login/registerall');

	// 2.发送手机号验证码
	api.add('sendCode', '/common/sendCode');

	// 3.验证手机短信验证码是否正确
	api.add('identifyingCode', '/common/identifyingCode');

	// 4.设置登录密码
	api.add('setLoginPassword', '/login/setLoginPassword');

	// 5.设置支付密码
	api.add('setPayPassword', '/user/setPayPassword');

	// 6.手机号登录
	api.add('login', '/login/login');

	// 7.微信自动登录
	api.add('wxlogin', '/login/wxlogin');

	// 11.我的果仁数
	api.add('getGopNum', '/wealth/getGopNum');

	// 12.果仁市场实时价格
	api.add('price', '/gop/price');

	// 13.我的收益
	api.add('getIncome', '/wealth/getIncome');

	// 14.年化收益列表
	api.add('annualIncome', '/myWealth/annualIncome');

	// 15.历史结算价格列表
	api.add('historyPrice', '/myWealth/historyPrice');

	// 16.联系人列表
	api.add('person', '/contact/person');

	// 17.修改联系人备注
	api.add('updateRemark', '/contact/updateRemark');

	// 18.我的信息接口(头像、昵称、手机号)
	api.add('info', '/user/info');

	// 19.修改我的昵称接口
	api.add('updateNick', '/user/updateNick');

	// 20.我的果仁市场账号信息接口
	api.add('gopMarketAddress', '/user/gopMarketAddress');

	// 21.添加果仁市场账号
	api.add('marketAdd', '/user/gopMarketAddress/add');

	// 22.删除果仁市场账号
	api.add('marketDel', '/user/gopMarketAddress/delete');

	// 23.查询绑定的钱包列表接口
	api.add('walletList', '/wallet/list');

	// 24.绑定钱包接口
	api.add('walletAdd', '/wallet/add');

	// 25.删除钱包接口
	api.add('walletDel', '/wallet/delete');

	// 26.设置默认的钱包接口
	api.add('walletSet', '/wallet/setDefault');

	// 27.查询绑定的银行卡接口
	api.add('bankcardSearch', '/bankcard/search');

	// 28.绑定银行卡接口
	api.add('bankcardAdd', '/bankcard/add');

	// 29.删除银行卡接口
	api.add('bankcardDel', '/bankcard/delete');

	// 30.是否实名认证查询接口
	api.add('isCertification', '/security/isCertification');

	// 31.是否填写密保问题查询接口
	api.add('isQuestion', '/security/isQuestion');

	// 32.查询已经实名认证的信息
	api.add('alreadyCertification', '/security/alreadyCertification');

	// 33.实名认证申请
	api.add('applyCertification', '/security/applyCertification');

	// 34.密保问题填写
	api.add('applyQuestion', '/security/applyQuestion');

	// 35.验证登录密码
	api.add('checkPwd', '/security/checkPwd');

	// 36.修改登录密码
	api.add('updatePwd', '/login/updatePwd');

	// 37.修改支付密码接口
	api.add('checkPayPwd', '/security/checkPayPwd');

	// 38.验证身份证号
	api.add('checkIDcard', '/security/checkIDcard');

	// 39.验证密保问题
	api.add('checkQuestion', '/security/checkQuestion');

	// 40.修改支付密码
	api.add('changePayPwd', '/security/changePayPwd');

	// 41.买果仁订单创建接口
	api.add('createBuyinOrder', '/gop/createBuyinOrder');

	// 42.果仁充值订单详情查询接口
	api.add('queryBuyinOrder', '/gop/queryBuyinOrder');

	// 43.银联支付接口
	api.add('orderUnionPay', '/recharge/orderUnionPay');

	// 44.转账接口
	api.add('transfer', '/transfer/send');

	// 45.转账交易详情查询接口
	api.add('transferQuery', '/transfer/query');

	// 46.消费果仁订单，手机话费充值接口
	api.add('phoneRecharge', '/consume/product/phoneRecharge');

	// 47.通用支付订单查询接口
	api.add('query', '/consume/order/query');

	// 48.通用支付订单支付接口
	api.add('pay', '/consume/order/pay');

	// 49.账单列表接口
	api.add('billList', '/bill/list');

	// 50.账单详情接口 -- 无法使用
	api.add('account', '/bill/account');

	// 51.消息列表接口
	api.add('messageInfo', '/message/info');

	// 52.消息详情接口
	api.add('messageSys', '/message/system');

	// 53.账户冻结状态
	api.add('userStatus', '/user/status');

	// 54.果仁夺宝查询活动信息
	api.add('duobaoAct', '/duobao/activities');

	// 55.果仁夺宝中奖用户参与码列表
	api.add('duobaoWin', '/duobao/winnerCodeList');

	// 56.购买果仁夺宝兑换码
	api.add('duobaoCode', '/duobao/bugCode');

	// 57.获取商品列表
	api.add('productList', '/consume/product/list');

	// 61.静态资源
	api.add('static', '/common/static');

	// 62.手机号归属地和运营商
	api.add('phoneInfo', '/common/phone/info');

	// 63.最近3个充值手机号码
	api.add('phoneLastest', '/consume/product/phoneRecharge/lastest');

	// 64.发送手机号验证码
	api.add('phoneSendCode', '/common/user/phone/sendCode');

	// 65.验证手机短信验证码是否正确
	api.add('phoneIdentifyingCode', '/common/user/phone/identifyingCode');

	// 66.发送银行手机号验证码
	api.add('bankSendCode', '/common/bank/phone/sendCode');

	// 67.验证银行手机短信验证码是否正确
	api.add('bankIdentifyingCode', '/common//bank/phone/identifyingCode');

	// 68.获取最近转果仁记录
	api.add('transferRecent', '/transfer/recent');

	// 68.获取密保问题 
	api.add('getQuestion', '/security/getQuestion');

	// 69.重置登录密码
	api.add('resetLoginPassword', '/login/resetLoginPassword');

	// 70.识别银行卡
	api.add('checkBankCard', '/common/checkBankCard');

	// 73.删除消费订单中手机充值历史记录
	api.add('phoneDelete', '/consume/product/phoneRecharge/clean');

	// 74.验证转果仁新目标地址
	api.add('transferValidate', '/transfer/validate');

	// 75.查询转入果仁记录
	api.add('transferInQuery', '/transfer/in/query');

	// 76.查询历史收益
	api.add('totalIncomeList', '/myWealth/totalIncomeList');

	// 77.用户反馈信息
	api.add('feedback', '/fankui/send');

	//78.验证银行预留手机号的接口
	api.add('checkBankPhone', '/bankcard/checkBankPhone');

	// 79.微信签名
	api.add('weixinInfo', '/common/weixin/signature');

	// 80.关闭买果仁订单接口
	api.add('closeBuyinOrder', '/gop/closeBuyinOrder');

	// 81.关闭消费果仁订单接口（手机充值订单）
	api.add('closeConsumeOrder', '/consume/order/close');

	// 82.验证手机号是否已经注册的接口
	api.add('checkPhoneExist', '/user/checkPhoneExist');

	// 83.获取联系人头像（49.账单列表接口的附加接口）
	api.add('billPhoto', '/bill/contentPhoto', {
		asyn: true // 可同时请求多次
	});

	// 84.获取联系人信息
	api.add('contactInfo', '/contact/info', {
		ignoreStatus: [304] // 忽略304错误
	});

	//85.获取用户支付密码锁定状态
	api.add('checkPayPasswordStatus', '/security/checkPayPasswordStatus');

	//86.年华收益
	api.add('annualIncomeWealth', '/myWealth/annualIncomeWealth');

	return api;
});