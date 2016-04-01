// 张树垚 2016-03-31 16:16:59 创建
// H5微信端 --- 接口


/**
 * [H5接口集合]
 * @Author   张树垚
 * @DateTime 2016-04-01 10:15:24+0800
 * @注意:
 * 	1.编号顺序和文档一致,方便查找和对应
 * 	2.使用文档为v1.1.0
 */
define('h5-api', ['api', 'h5-alert', 'cookie'], function(api) {

	// var baseUri = '.'; // 同域
	var baseUri = 'http://116.213.142.89:8080'; // http测试服务器
	// var baseUri = 'https://endpoint.goopal.com.cn'; // https正式服务器
	// var baseUri = 'https://www.yuxiaojian.cn'; // https测试服务器
	var basePath = 'https://endpoint.goopal.com.cn/'; //gourenbao 1.1版的服务器(正式)

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
		onSuccess: function(data) { // return false 阻止后续进程
			console.log(data)
			if (!data) {
				goIndex(true);
				return false;
			}
			if (data.status == 300 && options.ignoreStatus && options.ignoreStatus.indexOf(300) === -1) { // {msg: "用户登录/验证失败，请重新登录", status: "300"}
				goIndex(true);
				return false;
			} else if (data.status == 304 && options.ignoreStatus && options.ignoreStatus.indexOf(304) === -1) { // {msg: "服务器异常", status: "304"}
				$.alert('服务器异常, 请联系后台人员!');
				return false;
			}
		},
		onError: function() {
			if (text === 'timeout') {
				$.alert('请求超时...<br>请检查您的网络');
				return false;
			}
		},
	});

	// 1.手机号注册（普通）
	api.add('register', '/login/register');

	// 2.手机号注册（带密码）
	api.add('registerall', '/login/registerall');

	// 3.发送手机号验证码
	api.add('sendCode', '/common/sendCode');

	// 4.验证手机短信验证码是否正确
	api.add('identifyingCode', '/common/identifyingCode');

	// 5.设置登录密码
	api.add('setLoginPassword', '/login/setLoginPassword');

	// 6.设置支付密码
	api.add('setPayPassword', '/user/setPayPassword');

	// 7.手机号登录
	api.add('login', '/login/login');

	// 8.微信自动登录（web）
	api.add('wxlogin', '/login/wxlogin');

	// 9.我的果仁数
	api.add('getGopNum', '/wealth/getGopNum');

	// 10.果仁市场实时价格
	api.add('price', '/gop/price');

	// 11.我的收益
	api.add('getIncome', '/wealth/getIncome');

// 14.年化收益列表
api.add('annualIncome', '/myWealth/annualIncome');

	// 12.历史结算价格列表
	api.add('historyPrice', '/myWealth/historyPrice');

	// 13.联系人列表
	api.add('person', '/contact/person');

	// 14.修改联系人备注
	api.add('updateRemark', '/contact/updateRemark');

	// 15.我的信息接口(头像、昵称、手机号、钱包地址等)
	api.add('info', '/user/info');

	// 16.修改我的昵称接口
	api.add('updateNick', '/user/updateNick');

	// 17.我的果仁市场账号信息接口
	api.add('gopMarketAddress', '/user/gopMarketAddress');

	// 18.添加果仁市场账号
	api.add('marketAdd', '/user/gopMarketAddress/add');

	// 19.删除果仁市场账号
	api.add('marketDel', '/user/gopMarketAddress/delete');

	// 20.查询绑定的钱包列表接口
	api.add('walletList', '/wallet/list');

	// 21.绑定钱包接口
	api.add('walletAdd', '/wallet/add');

	// 22.删除钱包接口
	api.add('walletDel', '/wallet/delete');

	// 23.设置默认的钱包接口
	api.add('walletSet', '/wallet/setDefault');

	// 24.查询绑定的银行卡接口
	api.add('bankcardSearch', '/bankcard/search');

	// 25.绑定银行卡接口
	api.add('bankcardAdd', '/bankcard/add');

	// 26.删除银行卡接口
	api.add('bankcardDel', '/bankcard/delete');

	// 27.是否实名认证查询接口
	api.add('isCertification', '/security/isCertification');

	// 28.是否填写密保问题查询接口
	api.add('isQuestion', '/security/isQuestion');

	// 29.查询已经实名认证的信息
	api.add('alreadyCertification', '/security/alreadyCertification');

	// 30.实名认证申请
	api.add('applyCertification', '/security/applyCertification');

	// 31.密保问题填写
	api.add('applyQuestion', '/security/applyQuestion');

	// 32.验证登录密码
	api.add('checkPwd', '/security/checkPwd');

	// 33.修改支付密码接口
	api.add('checkPayPwd', '/security/checkPayPwd');

	// 34.验证身份证号
	api.add('checkIDcard', '/security/checkIDcard');

	// 35.验证密保问题
	api.add('checkQuestion', '/security/checkQuestion');

	// 36.买果仁订单创建接口
	api.add('createBuyinOrder', '/gop/createBuyinOrder');

	// 37.买果仁订单详情查询接口
	api.add('queryBuyinOrder', '/gop/queryBuyinOrder');

	// 38.转果仁接口
	api.add('transfer', '/transfer/send');

	// 39.转果仁详情查询接口
	api.add('transferQuery', '/transfer/query');

	// 40.消费果仁订单，手机话费充值接口
	api.add('phoneRecharge', '/consume/product/phoneRecharge');

	// 41.消费果仁订单，订单查询接口
	api.add('query', '/consume/order/query');

	// 42.消费果仁订单，支付接口
	api.add('pay', '/consume/order/pay');

	// 43.账单列表接口
	api.add('billList', '/bill/list');

	// 44.果仁夺宝查询活动信息
	api.add('duobaoActivities', '/duobao/activities');

	// 45.果仁夺宝中奖用户参与码列表
	api.add('duobaoList', '/duobao/winnerCodeList');

	// 46.购买果仁夺宝兑换码
	api.add('duobaoJoin', '/duobao/join');

	// 47.获取商品列表
	api.add('productList', '/consume/product/list');

	// 48.添加商品
	api.add('productAdd', '/consume/product/add');

	// 49.更新商品
	api.add('productUpdate', '/consume/product/update');

	// 50.删除商品
	api.add('productDelete', '/consume/product/delete');

	// 51.静态资源
	api.add('static', '/common/static');

	// 52.手机号归属地和运营商
	api.add('phoneInfo', '/common/phone/info');

	// 53.最近3个充值手机号码
	api.add('phoneLastest', '/consume/product/phoneRecharge/lastest');

	// 54.发送手机号验证码
	api.add('phoneSendCode', '/common/user/phone/sendCode');

	// 55.验证手机短信验证码是否正确
	api.add('phoneIdentifyingCode', '/common/user/phone/identifyingCode');

	// 56.发送银行手机号验证码
	api.add('bankSendCode', '/common/bank/phone/sendCode');

	// 57.验证银行手机短信验证码是否正确
	api.add('bankIdentifyingCode', '/common//bank/phone/identifyingCode');

	// 58.获取最近转果仁记录
	api.add('transferRecent', '/transfer/recent');

	// 59.获取密保问题 
	api.add('getQuestion', '/security/getQuestion');

	// 60.重置登录密码
	api.add('resetLoginPassword', '/login/resetLoginPassword');

	// 61.识别银行卡
	api.add('checkBankCard', '/common/checkBankCard');

	// 62.买果仁订单，支付接口
	api.add('gopOrderPay', '/gop/order/pay');

	// 63.修改我的头像接口
	api.add('updatePhoto', '/user/updatePhoto');

	// 64.删除消费订单中手机充值历史记录
	api.add('phoneDelete', '/consume/product/phoneRecharge/clean');

	// 65.验证转果仁新目标地址
	api.add('transferValidate', '/transfer/validate');

	// 66.查询转入果仁记录
	api.add('transferInQuery', '/transfer/in/query');

	// 67.查询历史收益
	api.add('totalIncomeList', '/myWealth/totalIncomeList');

	// 68.用户反馈信息
	api.add('feedback', '/fankui/send');

	// 69.验证银行预留手机号的接口
	api.add('checkBankPhone', '/bankcard/checkBankPhone');

	// 70.微信签名
	api.add('weixinInfo', '/common/weixin/signature');

	// 71.关闭买果仁订单接口
	api.add('closeBuyinOrder', '/gop/closeBuyinOrder');

	// 72.关闭消费果仁订单接口
	api.add('closeConsumeOrder', '/consume/order/close');

	// 73.验证手机号是否已经注册的接口
	api.add('checkPhoneExist', '/user/checkPhoneExist');

	// 74.获取联系人信息
	api.add('contactInfo', '/contact/info', {
		ignoreStatus: [304] // 忽略304错误
	});

	// 75.年化收益
	api.add('annualIncomeWealth', '/myWealth/annualIncomeWealth');

	// 76.解锁的接口（5次解锁）
	api.add('clearLock5', '/clear/lock/five');

	// 77.解锁的接口（10次解锁）
	api.add('clearLock10', '/clear/lock/ten');

	// 78.获取用户支付密码锁定状态
	api.add('checkPayPasswordStatus', '/security/checkPayPasswordStatus');

	// 79.微信自动登录（app）
	api.add('appWXLogin', '/login/app/wxlogin');

	// 80.app微信注册用户
	api.add('appWXRegister', '/login/app/wxregister');

	// 81.验证手机号是否可以与微信号关联接口
	api.add('checkPhoneRelatedWxAccount', '/login/checkPhoneRelatedWxAccount');

	// 82.是否设置了登录密码接口
	api.add('isPasswordSet', '/security/isPasswordSetting');

	// 83.获取快钱支付验证码接口
	api.add('quickMondyGetDTM', '/99bill/getDTM');

	// 84.消费果仁订单，手机流量充值接口
	api.add('phoneTraffic', '/consume/product/phoneTraffic');

	// 85.退款详情查询接口
	api.add('refundQuery', '/refund/query');

	return api;
});