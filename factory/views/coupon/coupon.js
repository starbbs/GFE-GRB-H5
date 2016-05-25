// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-coupon 优惠券分页


define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view', 'h5-weixin'], function(api, router, get, url, View) {
	var gopToken = $.cookie('gopToken');
	var couponID = get.data.id;

	//返回VM的集合
	var coupon = {};

	var mainList = $('.coupon-list');
	var mainDetail = $('.coupon-detail');

	//获取优惠券list
	api.myVoucherList({
		gopToken: gopToken,
	}, function(data) {

	});

	//优惠券过滤
	var Qlist = {};
	Qlist.available = [{ //可用
		'id': '1',
		'voucherName': '5元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '5',
		'voucherStatus': 'AVAILABLE'
	}, {
		'id': '2',
		'voucherName': '5元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '5',
		'voucherStatus': 'EXPIRE'
	}];

	Qlist.exp = [{ //不可用
		'id': '1',
		'voucherName': '10元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '10',
		'voucherStatus': 'AVAILABLE'
	}, {
		'id': '2',
		'voucherName': '10元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '10',
		'voucherStatus': 'EXPIRE'
	}];

	var set = function(type){
		switch(type){
			case 'mine':
			mineHandler();
			break;
			case 'order':
			orderHandler();
		};
	};

	//我的券列表处理
	var mineHandler = function(){

	};

	//定单券列表处理
	var orderHandler = function(){
		
	};

	//列表VM
	var couponListVM = coupon.listVM = avalon.define({
		$id: 'coupon',
		listAva: Qlist.available,
		listExp: Qlist.exp,
		itemClick: $.noop,
	});



	//路由选择数据处理
	if (url.filename.match(/mine.html/g)) {
		console.log('我的');
		set('mine');
	} else if (url.filename.match(/order.html/g)) {
		set('order');
		console.log('定单');
	}



	avalon.scan(mainList.get(0), couponListVM);

	//详情VM


	return coupon;

});