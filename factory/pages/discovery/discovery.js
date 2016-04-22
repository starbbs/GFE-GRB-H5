// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页
require([
	'router', 'h5-api', 'h5-price', 'touch-slide','h5-view',
	'h5-weixin'
], function(
	router, api, price, TouchSlide, View
) {
	var gopToken = $.cookie('gopToken');

	new View('discovery-temp');
	new View('discovery-temp-1');
	new View('discovery-temp-2');
	router.init();
	var main = $('.discovery');
	var nav = $('.nav');
	var UA = window.location.href;
	var iosUrlArr = [
		'myapp:product{"type":"phone"}',
		'myapp:product{"type":"flow"}',
		'myapp:product{"type":"flow","service":0}', // 移
		'myapp:product{"type":"flow","service":1}', // 联
		'myapp:product{"type":"flow","service":2}', // 信
		'myapp:product{"type":"phone","service":2}',
		'myapp:product{"type":"phone","service":0}',
		'myapp:product{"type":"phone","service":1}',
	];
	var h5UrlArr = [
		'phonecharge.html?from=home&cangory=话费',
		'phonecharge.html?from=home&cangory=流量',
		'phonecharge.html?from=home&cangory=流量&carrier=移动',
		'phonecharge.html?from=home&cangory=流量&carrier=联通',
		'phonecharge.html?from=home&cangory=流量&carrier=电信',
		'phonecharge.html?from=home&cangory=话费&carrier=电信',
		'phonecharge.html?from=home&cangory=话费&carrier=移动',
		'phonecharge.html?from=home&cangory=话费&carrier=联通',
	];

	var androidUrlArr = [
		'phonecharge.html?from=home&cangory=phone',
		'phonecharge.html?from=home&cangory=flow',
		'phonecharge.html?from=home&cangory=flow&carrier=move',//移动
		'phonecharge.html?from=home&cangory=flow&carrier=unicom',//联通
		'phonecharge.html?from=home&cangory=flow&carrier=telecom',//电信
		'phonecharge.html?from=home&cangory=phone&carrier=telecom',
		'phonecharge.html?from=home&cangory=phone&carrier=move',
		'phonecharge.html?from=home&cangory=phone&carrier=unicom',
	];

	//判断是否APP打开
	if (UA.indexOf('from=discoveryiosapp') > 0) {
		for (var i = 0; i < iosUrlArr.length; i++) {
			$('.urlarr')[i].href = encodeURIComponent(iosUrlArr[i]);
		}
	}else if(UA.indexOf('from=discoveryandroidapp') > 0){
		for (var i = 0; i < androidUrlArr.length; i++) {
			$('.urlarr')[i].href = androidUrlArr[i];
		}
	} else {
		for (var i = 0; i < h5UrlArr.length; i++) {
			$('.urlarr')[i].href = h5UrlArr[i];
		}
		nav.addClass('navon');		
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
	TouchSlide({
		slideCell: '#touchSlide',
		autoPlay: true,
		mainCell: '.discovery-banner',
		titCell: '.discovery-banner-hd-li'
	});
	/*
	api.static(function(data) {
		if (data.status == 200) {
			data.data.indexSlideAds.filter(function(val, index, arr) {
				if (val.sources.indexOf('h5') != -1) {
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
	*/

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