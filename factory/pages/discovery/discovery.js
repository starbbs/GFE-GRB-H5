// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页
(function() {
	require(['router', 'h5-api', 'h5-price', 'h5-weixin', 'touch-slide'], function(router, api, price, weixin, TouchSlide) {
		router.init(true);
		var gopToken = $.cookie('gopToken');
		var main = $('.discovery');
		var nav = $('.nav');
		var UA = window.location.href;
		var iosUrlArr = [
			'myapp:product{"type":"phone"}',
			'myapp:product{"type":"flow"}',
			'myapp:product{"type":"phone","service":0}',
			'myapp:product{"type":"phone","service":1}',
			'myapp:product{"type":"phone","service":2}',
			'myapp:product{"type":"flow","service":0}',
			'myapp:product{"type":"flow","service":1}',
			'myapp:product{"type":"flow","service":2}'
		];
		var h5UrlArr = [
			'phonecharge.html?from=home&cangory=话费',
			'phonecharge.html?from=home&cangory=流量',
			'phonecharge.html?from=home&cangory=话费&carrier=移动',
			'phonecharge.html?from=home&cangory=话费&carrier=联通',
			'phonecharge.html?from=home&cangory=话费&carrier=电信',
			'phonecharge.html?from=home&cangory=流量&carrier=移动',
			'phonecharge.html?from=home&cangory=流量&carrier=联通',
			'phonecharge.html?from=home&cangory=流量&carrier=电信',
		];

		//判断是否APP打开
		if (UA.indexOf('from=discoveryiosapp') > 0) {
			for (var i = 0; i < iosUrlArr.length; i++) {
				$('.urlarr')[i].href = encodeURIComponent(iosUrlArr[i]);
			}
			nav.css('display', 'none');
		}else{
			for (var i = 0; i < h5UrlArr.length; i++) {
				$('.urlarr')[i].href = h5UrlArr[i];
			}			
		}

		var vm = avalon.define({
			$id: 'discovery',
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



		api.static(function(data) {
			if (data.status == 200) {
				data.data.indexSlideAds.filter(function(val,index,arr){
					if(val.sources.indexOf('h5')!=-1){
						vm.bannerImgArr.push(val);
					}
				});
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


		/*
		// 首页轮播图
		TouchSlide({
			slideCell: '#touchSlide',
			autoPlay: true,
			mainCell: '.discovery-banner',
			titCell: '.discovery-banner-hd-li'
		});
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