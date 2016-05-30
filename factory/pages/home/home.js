// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页

require([
	'router', 'h5-api', 'h5-price', 'h5-weixin', 'h5-touchsliderBanner', 'filters',
], function(
	router, api, price, weixin, touchsliderBanner
) {
	// $.cookie('gopToken', 'f9e8c2d6f87b40aead8c4a7d921d5c00'); //小妮
	// $.cookie('gopToken','4d9655ca57af4fd1b1ce5f3c904ef5f7'); //东林
	// $.cookie('gopToken', 'd5610892684b4523a1c2547b59318e37'); //魏冰
	router.init(true);
	//控制屏幕高度在nav之上，达到滚动条美观的目的
	$(".screen-r").height($(window).height() - $(".nav").height());
	var gopToken = $.cookie('gopToken');
	/**
	 * 检查用户的登录密码，如果已经错误了十次了那直接进入frozen页面，如果ok的话进入home页面。
	 * @param _gopToken
	 * @returns {boolean}
	 */
	var checkPassword = function(_gopToken) {
		api.checkLoginPasswordStatus({
			"gopToken": _gopToken
		}, function(data) {
			if (data.status == 200) {
				if (data.data.result == "success") {
					//do nothing
				} else if (data.data.times == 10) {
					setTimeout(function() {
						window.location.href = './frozen10.html?type=locked'
					}, 210);
				} else if (data.data.times == 15) {
					setTimeout(function() {
						window.location.href = './frozen15.html?type=locked'
					}, 210);
				}
			}
		})
	};
	if (gopToken) {
		checkPassword(gopToken);
	}
	var main = $('.home');

	//我的收益  昨天 累计
	api.getIncome({
		gopToken: gopToken
	}, function(data) {
		if (data.status == '200') {
			homeVm.totalInCome = data.data.totalIncome;
			homeVm.yesterDayIncome = data.data.yesterdayIncome;
		}
	});
	//果仁现价
	api.price(function(data) {
		if (data.status == '200') {
			homeVm.gopNowPrice = data.data.price;
		}
	});

	//获取果仁数
	api.getGopNum({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			homeVm.myGopNum = data.data.gopNum;
			if (homeVm.myGopNum > 0) {
				homeVm.curIndex = 1;
			}
		} else {
			console.log(data);
		}
	});

	// 首页轮播图
	api.static(function(data) {
		if (data.status == 200) {
			data.data.indexSlideAds.filter(function(val, index, arr) {
				if (val.sources.indexOf('h5') != -1) {
					homeVm.bannerImgArr.push(val);
				}
			});
			touchsliderBanner.touchsliderFn();
		}
	});


	var homeVm = avalon.define({
		$id: 'home',
		bannerImgArr: [],
		myGopNum: 0, //果仁数
		gopNowPrice: 0, //果仁现价
		totalInCome: 0, //累计收益
		yesterDayIncome: 0, //昨天收益
		curIndex: 0,
		gopToken: gopToken ? true : false,
		//预计年化收益
		toggleBtnFn: function() { //切换样式Fn
			var $this = $(this);
			console.log(homeVm.curIndex);
			if (this.className.indexOf('up') != -1) {
				homeVm.curIndex = 2;
				$this.removeClass('up').addClass('down');
			} else {
				$this.removeClass('down').addClass('up');
				homeVm.curIndex = 1;
			}
		},
		gotophonecharge: function(ev) {
			var target = $(ev.target).closest('.home-phonebills');
			if (!target.length) {
				return;
			}
			window.location.href = target.get(0).dataset.href;
		},
	});

	avalon.scan(main.get(0), homeVm);

	setTimeout(function() {
		main.addClass('on');
	}, 250);


	/*
		'use strict';
		//字符串模板
		
		var name = 'kingswei',
			time = '111111';
		console.log(`我是${name},出生时间是${time}`);
		console.log(`字符串模板${(function(){ return '---可以放函数---'})()}`);
	*/


	/*
	//generator  return yield区别在于记忆功能
	function* helloGenerator() {
		yield console.log('1111');
		yield console.log('2222');
		yield console.log('3333');
		yield console.log('4444');
		yield console.log('5555');
		yield console.log('6666');
		yield console.log('7777');
		yield console.log('8888');
		yield console.log('9999');
		yield console.log('0000');
		return console.log('循环完成');
	};
	// helloGenerator GEN函数执行返回遍历接口对象
	var Gfn = helloGenerator();
	// console.log(Gfn);
	for (let i = 0; i < 11; i++) {
		Gfn.next();
	}

	for (let val of helloGenerator()) { //for of可执行具有itnerator接口对象
		console.log('for of执行===' + val);
	}

	//==================generator 遍历接口
	const flat = function*(arr) {
		for (let i = 0; i < arr.length; i++) {
			typeof arr[i] != 'number' ? yield * flat(arr[i]) : yield arr[i];
		}
	};
	let arr = [
		[1, 2, 3, 3, 3, 3, 3, 3, 3], 4, 5, 6, [7, 8, 9]
	];
	for (let val of flat(arr)) {
		console.log(val);
	}
	*/


	// promise实例 3   先检测token  再取果仁数  再取果仁现价  最后 算总RMB
	//果仁现价

	//创建promise对象
	/*
	var creatPromise = function(cnfn) {
		return new Promise(function(reslove, reject) {
			cnfn && cnfn(reslove, reject);
		});
	}
	//获取果仁现价FN
	var getpriceFN = function (reslove, reject) {
		api.price(function(data) {
			if (data.status == '200') {
				reslove(data.data.price);
			} else {
				reject('错误');
			}
		});
	};
	var getGopnum = function(reslove, reject){
		api.getGopNum({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				reslove(data.data.gopNum);
			} else {
				reject('错误');
			}
		});		
	};
	var getPrice = creatPromise(getpriceFN).then(function(price){
		console.log(price);
		return creatPromise(getGopnum);
	}).then(function(gopnum){
		console.log(gopnum);
	});
	*/


	/*	
	'use strict';
	// promise实例 1
	var promise = [1,2,3,4,5].map((id)=>{
		var op = new Promise(function(reslove,reject){
			reslove('promist-----'+id);
		})
		return op;
	});

	Promise.all(promise).then((text)=>{
		console.log(text);
	}).catch((errwhy)=>{
		console.log('有错误'+errwhy)
	});

	// promise实例 2
	var p = Promise.resolve('hello');  // 等价于 var p = new Promise((resolve,reject)=>resolve('hello'));
	

	


	es6 箭头函数   add ([x,y]) => {return x+y;};
		var add = (a, b) => a + b;
		var valFN = (val) => console.log(val);		
		console.log(add(1, 2)); //3

		var add1 = (a, b) => {
			return typeof a == 'number' && typeof b == 'number' ? a + b : 'a && b are not number';
		}
		console.log(add1(1, 3)); // 4

		//匿名函数
		setTimeout(() => {
			console.log(add1(1, 3)); // 4
		});
	*/


});