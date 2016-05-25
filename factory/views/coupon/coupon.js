// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-coupon 优惠券分页


define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view', 'h5-weixin'], function(api, router, get, url, View) {
	var gopToken = $.cookie('gopToken');
	var couponID = get.data.id;

	var couponListView = new View('coupon-list');
	var couponDetailView = null; //= new View('coupon-detail');

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
		'voucherName': '55元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '55',
		'voucherStatus': 'AVAILABLE'
	}];

	Qlist.exp = [{ //不可用
		'id': '1',
		'voucherName': '10元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '10',
		'voucherStatus': 'EXPIRE'
	}, {
		'id': '2',
		'voucherName': '1010元代金券',
		'voucherType': 'AMOUNT',
		'currencyType': 'RMB',
		'startTime': '2016-5-24',
		'endTime': '2016-6-24',
		'voucherAmount': '1010',
		'voucherStatus': 'EXPIRE'
	}];

	var set = function(type) {
		switch (type) {
			case 'mine':
				mineHandler();
				break;
			case 'order':
				orderHandler();
				break;
		};
	};


	// 设置列表VB
	var setListVM = function(){
		couponListView.VM = avalon.define({
			$id: 'couponList',
			listAva: Qlist.available,
			listExp: Qlist.exp,
			itemClick: function(ev) {
				couponListView.VM.onHideFn && couponListView.VM.onHideFn(ev);
			},
			onHideFn: $.noop,
		});
	};

	//设置账单详情VM
	var setDetailVM = function(){
		var couponDetailJSON = {
			vouchername: '',
			starttime: '',
			endtime: '',
			voucherstatus: '',
		};
		couponDetailView.VM = avalon.define($.extend({
			$id: 'couponDetail',
		}, couponDetailJSON));
		//列表消失
		couponListView.on('show',function(){
			$.extend(couponDetailView.VM, couponDetailJSON);
		});		
	};

	//我的   券列表处理
	var mineHandler = function() {
		couponDetailView = new View('coupon-detail');
		setListVM();
		setDetailVM();
	};

	//定单  券列表处理
	var orderHandler = function() {
		setListVM();
	};

	avalon.scan();

	//路由选择数据处理
	if (url.filename.match(/mine.html/g)) {
		set('mine');
	} else if (url.filename.match(/order.html/g)) {
		set('order');
	}

	//返回的JSON
	var couponJSON = {};
	return $.extend(couponJSON, {
		set: set,
		couponListView: couponListView,
		couponDetailView: couponDetailView,
	}); // 返回的是VIEW的对象  所有方法也在这个对象上面

});