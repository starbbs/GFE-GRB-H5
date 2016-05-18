// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页

require([
	'router', 'h5-api', 'h5-price', 'h5-weixin', 'h5-touchsliderBanner', 'h5-login-judge-auto',
	'filters',
], function(
	router, api, price, weixin, touchsliderBanner
) {
	// $.cookie('gopToken','d5610892684b4523a1c2547b59318e37'); //我的 
	// $.cookie('gopToken','67f011561e2c4c82851d6e38f3d31c69'); //杨娟
	router.init(true);
	var gopToken = $.cookie('gopToken');
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
	es6 箭头函数
	
	'use strict';
	var add = (a, b) => a + b;
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