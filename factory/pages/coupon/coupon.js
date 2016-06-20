// 姜晓妮 2016-06-17 15:48:40 创建
// H5微信端 --- 卡券列表

require(['h5-view-coupon', 'get', 'url', 'h5-view', 'router'], function(coupon, get, url, View, router) {
//	var couponDetailView = new View('coupon-detail');
	var couponDetailHandler = function() {
		//列表点击事件--跳转至详情页面
		coupon.couponListView.VM.onClickFn = function(ev) {
			var target = $(ev.target).closest('.coupon-list-li');
			if (target.length) {
				var json = target.get(0).dataset;
				$.extend(coupon.couponDetailView.VM, json);
				router.go('/coupon-detail');
			}
		};
		//详情页面点击事件回调--跳转至充值中心
		coupon.couponDetailView.VM.toUse = function() {
			window.location.href = "phonecharge.html?cardid=" + coupon.couponDetailView.VM.voucherid;
		}
	}
	var couponListHandler = function() {
		//列表点击事件--跳转至order页面
		coupon.couponListView.VM.onClickFn = function(ev) {
			var target = $(ev.target).closest('.coupon-list-li');
			if (target.length) {
				var json = target.get(0).dataset;
				if (json.voucherstatus === 'AVAILABLE') { //如果可用跳转回order页面
					window.location.href = 'order.html?cardid=' + json.voucherid;
				}
			}
		};
	}
	var eventHandler = function() {
		var type = get.data.from;
		switch (type) {
			case 'myvouchercards':
				couponDetailHandler(); //跳转至详情页面
				break;
			case 'consumecards':
				couponListHandler(); //跳转返回到order页面
				break;
		}
	}
	eventHandler();
});