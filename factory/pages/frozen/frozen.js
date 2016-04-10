// 张树垚 2015-12-20 11:27:22 创建
// H5微信端 --- 个人首页
(function() {
	require(['router', 'h5-api', 'h5-price', 'h5-weixin', 'touch-slide'], function(router, api, price, weixin, TouchSlide) {
		// router.init(true);
		// var gopToken = $.cookie('gopToken');
		var main = $('.frozen');

		setTimeout(function() {
			main.addClass('on');
		}, 100);
	});
})();