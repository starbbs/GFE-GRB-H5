// 张树垚 2016-01-05 11:02:37 创建
// H5微信端 --- 获取果仁实时价格


define('h5-price', ['h5-api'], function(api) {
	var price = {
		interval: 3000, // 请求间隔
		timer: null, // 定时器
		now: false, // 当前价格
		stop: function() {
			clearTimeout(price.timer);
		},
		onUpdate: $.noop, // 价格更新时回调, 传参(当前价格, 上一次价格)
		onChange: $.noop, // 价格改变时回调, 传参(当前价格, 上一次价格, 改变大小)
		onFirstChange: $.noop, // 第一次改变时回调, 传参(当前价格)
	};
	var once = price.once = function(callback) {
		api.price(function(data) {
			if (data.status == 200) {
				callback && callback(data.data.price);
			} else {
				console.log(data);
			}
		});
	};
	var get = price.get = function() {
		once(function(next) {
			var now = price.now; // false = false
			var change = next - now; //  3=3-false
			if (now === false) {
				price.onFirstChange(next);
			}
			price.onUpdate(next, now);
			if (change && now !== false) {
				price.onChange(next, now, change);
			}
			price.now = next;
			price.timer = setTimeout(price.get, price.interval);
		});
	};
	var getSellOnePrice = price.getSellOnePrice = function(callBack) {
		api.getselloneprice(function(data) {
			callBack && callBack(data);
		});
		// 6-16 获取卖1价样品调用
		//$.ajax({
		//	type: 'GET',
		//	url: 'http://172.16.33.4/trade/optimumPrice',
		//	data: '',
		//	dataType: 'json',
		//	success: function(data){
		//		console.log(data);
		//	}
		//});
	};
	return price;
});