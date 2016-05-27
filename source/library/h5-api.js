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
define('h5-api', ['api', 'h5-authorization', 'h5-alert', 'cookie','h5-config'], function(Api, authorization, alert, cookie, config) {

	// var baseUri = '.'; // 同域
	var baseUri = config.baseUri; // http测试服务器
	// var baseUri = 'http://116.213.142.89:8080'; // http测试服务器
	// var baseUri = '//endpoint.goopal.com.cn'; // https正式服务器 v1.1
	// var baseUri = 'https://www.yuxiaojian.cn'; // https测试服务器

	var goIndex = function() { // 返回首页
		authorization.go();
	};

	$.gopToken = function(token) { // 注入gopGoken
		return $.cookie('gopToken', token);
	};

	var api = new Api({
		baseUri: baseUri,
		onSuccess: function(data, options) { // return false 阻止后续进程
			// console.log(data, options, this.options);
			// alert('没事别乱删数据'+data.status);
			if (!data && !options.notGoIndex) {
				// notGoIndex 为空时不进入首页, 在单个API中设置, 默认只要返回是空, 就跳转认证
				goIndex();
				return false;
			}
			if (data.status == 300 && this.options.ignoreStatus && this.options.ignoreStatus.indexOf(300) === -1) { // {msg: "用户登录/验证失败，请重新登录", status: "300"}
				goIndex();
				return false;
			} else if (data.status == 304 && this.options.ignoreStatus && this.options.ignoreStatus.indexOf(304) === -1) { // {msg: "服务器异常", status: "304"}
				$.alert('服务器异常, 请联系后台人员!');
				return false;
			}
		},
		onError: function(XMLHttpRequest, textStatus, errorThrown) {
			console.log(arguments);
			if (textStatus === 'timeout') {
				$.alert('请求超时...<br>请检查您的网络');
				return false;
			}
		},
	});

	// 1.手机号注册（普通）
	api.regist('register', '/login/register');

	// 2.发送手机号验证码
	api.regist('sendCode', '/common/sendCode');

	// 3.验证手机短信验证码是否正确
	api.regist('identifyingCode', '/common/identifyingCode');

	// 4.设置登录密码
	api.regist('setLoginPassword', '/login/setLoginPassword');

	// 5.设置支付密码
	api.regist('setPayPassword', '/user/setPayPassword');

	// 6.手机号登录
	api.regist('login', '/login/login');

	// 7.微信自动登录（web）
	api.regist('wxlogin', '/login/wxlogin', {
		ignoreStatus: [304]
	});

	// 8.我的果仁数
	api.regist('getGopNum', '/wealth/getGopNum', {
		asyn: true
	});

	// 9.果仁市场实时价格
	api.regist('price', '/gop/price');

	// 10.我的收益
	api.regist('getIncome', '/wealth/getIncome');

	// 11.历史结算价格列表
	api.regist('historyPrice', '/myWealth/historyPrice');

	// 12.联系人列表
	api.regist('person', '/contact/person');

	// 13.修改联系人备注
	api.regist('updateRemark', '/contact/updateRemark');

	// 14.我的信息接口(头像、昵称、手机号、钱包地址等)
	api.regist('info', '/user/info');

	// 15.修改我的昵称接口
	api.regist('updateNick', '/user/updateNick');

	// 16.我的果仁市场账号信息接口
	api.regist('gopMarketAddress', '/user/gopMarketAddress');

	// 17.添加果仁市场账号
	api.regist('marketAdd', '/user/gopMarketAddress/add');

	// 18.删除果仁市场账号
	api.regist('marketDel', '/user/gopMarketAddress/delete');

	// 19.查询绑定的钱包列表接口
	api.regist('walletList', '/wallet/list');

	// 20.绑定钱包接口
	api.regist('walletAdd', '/wallet/add');

	// 21.删除钱包接口
	api.regist('walletDel', '/wallet/delete');

	// 22.设置默认的钱包接口
	api.regist('walletSet', '/wallet/setDefault');

	// 23.查询绑定的银行卡接口
	api.regist('bankcardSearch', '/bankcard/search');

	// 24.绑定银行卡接口
	api.regist('bankcardAdd', '/bankcard/add');

	// 25.删除银行卡接口
	api.regist('bankcardDel', '/bankcard/delete');

	// 26.是否实名认证查询接口
	api.regist('isCertification', '/security/isCertification');

	// 27.是否填写密保问题查询接口
	api.regist('isQuestion', '/security/isQuestion');

	// 28.查询已经实名认证的信息
	api.regist('alreadyCertification', '/security/alreadyCertification');

	// 29.实名认证申请
	api.regist('applyCertification', '/security/applyCertification');

	// 30.密保问题填写
	api.regist('applyQuestion', '/security/applyQuestion');

	// 31.验证登录密码
	api.regist('checkPwd', '/security/checkPwd');

	// 32.修改支付密码接口
	api.regist('checkPayPwd', '/security/checkPayPwd');

	// 33.验证身份证号
	api.regist('checkIDcard', '/security/checkIDcard');

	// 34.验证密保问题
	api.regist('checkQuestion', '/security/checkQuestion');

	// 35.买果仁订单创建接口
	api.regist('createBuyinOrder', '/gop/createBuyinOrder');

	// 36.买果仁订单详情查询接口
	api.regist('queryBuyinOrder', '/gop/queryBuyinOrder');

	// 37.转果仁接口
	api.regist('transfer', '/transfer/send');

	// 38.转果仁详情查询接口
	api.regist('transferQuery', '/transfer/query');

	// 39.消费果仁订单，手机话费充值接口
	api.regist('phoneRecharge', '/consume/product/phoneRecharge', {
		asyn: true
	});

	// 40.消费果仁订单，订单查询接口
	api.regist('query', '/consume/order/query');

	// 41.消费果仁订单，支付接口
	api.regist('pay', '/consume/order/pay');

	// 42.账单列表接口
	api.regist('billList', '/bill/list');

	// 43.果仁夺宝查询活动信息
	api.regist('duobaoActivities', '/duobao/activities');

	// 44.果仁夺宝中奖用户参与码列表
	api.regist('duobaoList', '/duobao/winnerCodeList');

	// 45.购买果仁夺宝兑换码
	api.regist('duobaoJoin', '/duobao/join');

	// 46.获取商品列表
	api.regist('productList', '/consume/product/list', {
		asyn: true
	});

	// 47.添加商品
	api.regist('productAdd', '/consume/product/add');

	// 48.更新商品
	api.regist('productUpdate', '/consume/product/update');

	// 49.删除商品
	api.regist('productDelete', '/consume/product/delete');

	// 50.静态资源
	api.regist('static', '/common/static');

	// 51.手机号归属地和运营商
	api.regist('phoneInfo', '/common/phone/info');

	// 52.最近3个充值手机号码
	api.regist('phoneLastest', '/consume/product/phoneRecharge/lastest');

	// 53.发送手机号验证码
	api.regist('phoneSendCode', '/common/user/phone/sendCode');

	// 54.验证手机短信验证码是否正确
	api.regist('phoneIdentifyingCode', '/common/user/phone/identifyingCode');

	// 55.发送银行手机号验证码
	api.regist('bankSendCode', '/common/bank/phone/sendCode');

	// 56.验证银行手机短信验证码是否正确
	api.regist('bankIdentifyingCode', '/common//bank/phone/identifyingCode');

	// 57.获取最近转果仁记录
	api.regist('transferRecent', '/transfer/recent');

	// 58.获取密保问题 
	api.regist('getQuestion', '/security/getQuestion');

	// 59.重置登录密码
	api.regist('resetLoginPassword', '/login/resetLoginPassword');

	// 60.识别银行卡
	api.regist('checkBankCard', '/common/checkBankCard');

	// 61.买果仁订单，支付接口
	api.regist('gopOrderPay', '/gop/order/pay');

	// 62.修改我的头像接口
	api.regist('updatePhoto', '/user/updatePhoto');

	// 63.删除消费订单中手机充值历史记录
	api.regist('phoneDelete', '/consume/product/phoneRecharge/clean');

	// 64.验证转果仁新目标地址
	api.regist('transferValidate', '/transfer/validate');

	// 65.查询转入果仁记录
	api.regist('transferInQuery', '/transfer/in/query');

	// 66.查询历史收益
	api.regist('totalIncomeList', '/myWealth/totalIncomeList');

	// 67.用户反馈信息
	api.regist('feedback', '/fankui/send');

	// 68.验证银行预留手机号的接口
	api.regist('checkBankPhone', '/bankcard/checkBankPhone');

	// 69.微信签名
	api.regist('weixinInfo', '/common/weixin/signature');

	// 70.关闭买果仁订单接口
	api.regist('closeBuyinOrder', '/gop/closeBuyinOrder');

	// 71.关闭消费果仁订单接口
	api.regist('closeConsumeOrder', '/consume/order/close');

	// 72.验证手机号是否已经注册的接口
	api.regist('checkPhoneExist', '/user/checkPhoneExist');

	// 73.获取联系人信息
	api.regist('contactInfo', '/contact/info', {
		ignoreStatus: [304] // 忽略304错误
	});

	// 7.年化收益
	api.regist('annualIncomeWealth', '/myWealth/annualIncomeWealth');

	// 75.解锁的接口（5次解锁）
	api.regist('clearLock5', '/clear/lock/five');

	// 76.解锁的接口（10次解锁）
	api.regist('clearLock10', '/clear/lock/ten');

	// 77.获取用户支付密码锁定状态
	api.regist('checkPayPasswordStatus', '/security/checkPayPasswordStatus', {
		asyn: true
	});

	// 78.微信自动登录（app）
	api.regist('appWXLogin', '/login/app/wxlogin');

	// 79.app微信注册用户
	api.regist('appWXRegister', '/login/app/wxregister');

	// 80.验证手机号是否可以与微信号关联接口
	api.regist('checkPhoneRelatedWxAccount', '/login/checkPhoneRelatedWxAccount');

	// 81.是否设置了登录密码接口
	api.regist('isPasswordSet', '/security/isPasswordSetting');

	// 82.获取快钱支付验证码接口
	api.regist('quickMondyGetDTM', '/99bill/getDTM');

	// 83.消费果仁订单，手机流量充值接口
	api.regist('phoneTraffic', '/consume/product/phoneTraffic');

	// 84.退款详情查询接口
	api.regist('refundQuery', '/refund/query');

	// 85.微信端微信注册用户
	api.regist('wxregister', '/login/wx/wxregister');

	//86.优惠券列表接口
	api.regist('myVoucherList', '/voucher/myVoucherList');

	//87 .判断用户登录密码状态的接口
	api.regist('checkLoginPasswordStatus', '/security/checkLoginPasswordStatus');

	return api;
});