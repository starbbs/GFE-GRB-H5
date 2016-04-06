// 张树垚 2016-03-31 16:16:59 创建
// H5微信端 --- 接口


/**
 * [H5接口集合]
 * @Author   张树垚
 * @DateTime 2016-04-01 10:15:24
 * @注意:
 * 	1.编号顺序和文档一致,方便查找和对应
 * 	2.使用文档为v1.2.0
 */
define('h5-api', ['api', 'h5-alert', 'cookie'], function(api) {

	// var baseUri = '.'; // 同域
	var baseUri = 'http://116.213.142.89:8080'; // http测试服务器
	// var baseUri = 'https://endpoint.goopal.com.cn'; // https正式服务器 v1.1
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

	// 7.微信自动登录（web）
	api.add('wxlogin', '/login/wxlogin');

	// 8.我的果仁数
	api.add('getGopNum', '/wealth/getGopNum');

	// 9.果仁市场实时价格
	api.add('price', '/gop/price');

	// 10.我的收益
	api.add('getIncome', '/wealth/getIncome');

	// 11.历史结算价格列表
	api.add('historyPrice', '/myWealth/historyPrice');

	// 12.联系人列表
	api.add('person', '/contact/person');

	// 13.修改联系人备注
	api.add('updateRemark', '/contact/updateRemark');

	// 14.我的信息接口(头像、昵称、手机号、钱包地址等)
	api.add('info', '/user/info');

	// 15.修改我的昵称接口
	api.add('updateNick', '/user/updateNick');

	// 16.我的果仁市场账号信息接口
	api.add('gopMarketAddress', '/user/gopMarketAddress');

	// 17.添加果仁市场账号
	api.add('marketAdd', '/user/gopMarketAddress/add');

	// 18.删除果仁市场账号
	api.add('marketDel', '/user/gopMarketAddress/delete');

	// 19.查询绑定的钱包列表接口
	api.add('walletList', '/wallet/list');

	// 20.绑定钱包接口
	api.add('walletAdd', '/wallet/add');

	// 21.删除钱包接口
	api.add('walletDel', '/wallet/delete');

	// 22.设置默认的钱包接口
	api.add('walletSet', '/wallet/setDefault');

	// 23.查询绑定的银行卡接口
	api.add('bankcardSearch', '/bankcard/search');

	// 24.绑定银行卡接口
	api.add('bankcardAdd', '/bankcard/add');

	// 25.删除银行卡接口
	api.add('bankcardDel', '/bankcard/delete');

	// 26.是否实名认证查询接口
	api.add('isCertification', '/security/isCertification');

	// 27.是否填写密保问题查询接口
	api.add('isQuestion', '/security/isQuestion');

	// 28.查询已经实名认证的信息
	api.add('alreadyCertification', '/security/alreadyCertification');

	// 29.实名认证申请
	api.add('applyCertification', '/security/applyCertification');

	// 30.密保问题填写
	api.add('applyQuestion', '/security/applyQuestion');

	// 31.验证登录密码
	api.add('checkPwd', '/security/checkPwd');

	// 32.修改支付密码接口
	api.add('checkPayPwd', '/security/checkPayPwd');

	// 33.验证身份证号
	api.add('checkIDcard', '/security/checkIDcard');

	// 34.验证密保问题
	api.add('checkQuestion', '/security/checkQuestion');

	// 35.买果仁订单创建接口
	api.add('createBuyinOrder', '/gop/createBuyinOrder');

	// 36.买果仁订单详情查询接口
	api.add('queryBuyinOrder', '/gop/queryBuyinOrder');

	// 37.转果仁接口
	api.add('transfer', '/transfer/send');

	// 38.转果仁详情查询接口
	api.add('transferQuery', '/transfer/query');

	// 39.消费果仁订单，手机话费充值接口
	api.add('phoneRecharge', '/consume/product/phoneRecharge');

	// 40.消费果仁订单，订单查询接口
	api.add('query', '/consume/order/query');

	// 41.消费果仁订单，支付接口
	api.add('pay', '/consume/order/pay');

	// 42.账单列表接口
	api.add('billList', '/bill/list');

	// 43.果仁夺宝查询活动信息
	api.add('duobaoActivities', '/duobao/activities');

	// 44.果仁夺宝中奖用户参与码列表
	api.add('duobaoList', '/duobao/winnerCodeList');

	// 45.购买果仁夺宝兑换码
	api.add('duobaoJoin', '/duobao/join');

	// 46.获取商品列表
	api.add('productList', '/consume/product/list', {
		asyn: true
	});

	// 47.添加商品
	api.add('productAdd', '/consume/product/add');

	// 48.更新商品
	api.add('productUpdate', '/consume/product/update');

	// 49.删除商品
	api.add('productDelete', '/consume/product/delete');

	// 50.静态资源
	api.add('static', '/common/static');

	// 51.手机号归属地和运营商
	api.add('phoneInfo', '/common/phone/info');

	// 52.最近3个充值手机号码
	api.add('phoneLastest', '/consume/product/phoneRecharge/lastest');

	// 53.发送手机号验证码
	api.add('phoneSendCode', '/common/user/phone/sendCode');

	// 54.验证手机短信验证码是否正确
	api.add('phoneIdentifyingCode', '/common/user/phone/identifyingCode');

	// 55.发送银行手机号验证码
	api.add('bankSendCode', '/common/bank/phone/sendCode');

	// 56.验证银行手机短信验证码是否正确
	api.add('bankIdentifyingCode', '/common//bank/phone/identifyingCode');

	// 57.获取最近转果仁记录
	api.add('transferRecent', '/transfer/recent');

	// 58.获取密保问题 
	api.add('getQuestion', '/security/getQuestion');

	// 59.重置登录密码
	api.add('resetLoginPassword', '/login/resetLoginPassword');

	// 60.识别银行卡
	api.add('checkBankCard', '/common/checkBankCard');

	// 61.买果仁订单，支付接口
	api.add('gopOrderPay', '/gop/order/pay');

	// 62.修改我的头像接口
	api.add('updatePhoto', '/user/updatePhoto');

	// 63.删除消费订单中手机充值历史记录
	api.add('phoneDelete', '/consume/product/phoneRecharge/clean');

	// 64.验证转果仁新目标地址
	api.add('transferValidate', '/transfer/validate');

	// 65.查询转入果仁记录
	api.add('transferInQuery', '/transfer/in/query');

	// 66.查询历史收益
	api.add('totalIncomeList', '/myWealth/totalIncomeList');

	// 67.用户反馈信息
	api.add('feedback', '/fankui/send');

	// 68.验证银行预留手机号的接口
	api.add('checkBankPhone', '/bankcard/checkBankPhone');

	// 69.微信签名
	api.add('weixinInfo', '/common/weixin/signature');

	// 70.关闭买果仁订单接口
	api.add('closeBuyinOrder', '/gop/closeBuyinOrder');

	// 71.关闭消费果仁订单接口
	api.add('closeConsumeOrder', '/consume/order/close');

	// 72.验证手机号是否已经注册的接口
	api.add('checkPhoneExist', '/user/checkPhoneExist');

	// 73.获取联系人信息
	api.add('contactInfo', '/contact/info', {
		ignoreStatus: [304] // 忽略304错误
	});

	// 7.年化收益
	api.add('annualIncomeWealth', '/myWealth/annualIncomeWealth');

	// 75.解锁的接口（5次解锁）
	api.add('clearLock5', '/clear/lock/five');

	// 76.解锁的接口（10次解锁）
	api.add('clearLock10', '/clear/lock/ten');

	// 77.获取用户支付密码锁定状态
	api.add('checkPayPasswordStatus', '/security/checkPayPasswordStatus');

	// 78.微信自动登录（app）
	api.add('appWXLogin', '/login/app/wxlogin');

	// 79.app微信注册用户
	api.add('appWXRegister', '/login/app/wxregister');

	// 80.验证手机号是否可以与微信号关联接口
	api.add('checkPhoneRelatedWxAccount', '/login/checkPhoneRelatedWxAccount');

	// 81.是否设置了登录密码接口
	api.add('isPasswordSet', '/security/isPasswordSetting');

	// 82.获取快钱支付验证码接口
	api.add('quickMondyGetDTM', '/99bill/getDTM');

	// 83.消费果仁订单，手机流量充值接口
	api.add('phoneTraffic', '/consume/product/phoneTraffic');

	// 84.退款详情查询接口
	api.add('refundQuery', '/refund/query');

	// 85.微信端微信注册用户
	api.add('wxregister', '/login/wx/wxregister');

	return api;
});