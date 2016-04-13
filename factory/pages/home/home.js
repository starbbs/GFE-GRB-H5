// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页
(function() {
	require(['router', 'h5-api', 'h5-price', 'h5-weixin', 'touch-slide', 'filters'], function(router, api, price, weixin, TouchSlide) {
		router.init(true);
		var gopToken = $.cookie('gopToken');
		var main = $('.home');

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
		});
		console.log(homeVm.gopToken);
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
		api.price({}, function(data) {
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
		avalon.scan(main.get(0), homeVm);
		/*
		var vm = avalon.define({
			$id: 'home',
			defaultIndex: 0,
			price: 0,
			priceChange: 0,
			visible_ok: eval($.cookie('gopHomeEye')), //true==close
			visibleChange: function() {
				vm.visible_ok = !vm.visible_ok;
				$.cookie('gopHomeEye', vm.visible_ok);
			},
			gopNum: 0,
			bannerImgArr: []
		});
		avalon.scan(main.get(0), vm);
		*/
		// 首页轮播图
		api.static(function(data) {
			if (data.status == 200) {
				data.data.indexSlideAds.filter(function(val, index, arr) {
					if (val.sources.indexOf('h5') != -1) {
						homeVm.bannerImgArr.push(val);
					}
				});
				TouchSlide({
					slideCell: '#touchSlide',
					autoPlay: true,
					mainCell: '.home-slider-bd',
					titCell: '.home-slider-hd-li'
				});
			}
		});

		/*
		price.onFirstChange = function(next) {
			vm.price = next;
		};
		price.onChange = function(next, now, change) {
			vm.priceChange = change;
			vm.price = next;
		};
		api.getGopNum({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				vm.gopNum = data.data.gopNum;
			} else {
				console.log(data);
			}
		});
		price.get();
		*/
		setTimeout(function() {
			main.addClass('on');
		}, 200);
	});
})();