// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页
(function() {
	require(['router', 'api', 'h5-price', 'h5-weixin', 'touch-slide'], function(router, api, price, weixin, TouchSlide) {
		router.init(true);
		var gopToken = $.cookie('gopToken');
		var main = $('.home');
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
			bannerImgArr: ['','']
		});
		avalon.scan(main.get(0), vm);
		*/
		// 首页轮播图
		TouchSlide({
			slideCell: '#touchSlide',
			autoPlay: true,
			mainCell: '.discovery-banner',
			titCell: '.discovery-banner-hd-li'
		});
		/*
		api.static(function(data) {
			if (data.status == 200) {
				vm.bannerImgArr = data.data.indexSlideAds;
				setTimeout(function() {
					TouchSlide({
						slideCell: '#touchSlide',
						autoPlay: true,
						mainCell: '.discovery-banner',
						titCell: '.discovery-banner-hd-li'
					});
				}, 100);
			}
		});


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
		}, 100);
	});
})();