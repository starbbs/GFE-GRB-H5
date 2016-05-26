// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-coupon 优惠券分页


define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view', 'h5-weixin'], function(api, router, get, url, View) {
	var gopToken = $.cookie('gopToken');

	var Qlist = []; //优惠券存放的数组
	var couponListView = new View('coupon-list');
	var couponDetailView = new View('coupon-detail');
	var couponDetailJSON = { //清空详情的数据
		vouchername: '',
		starttime: '',
		endtime: '',
		voucherstatus: '',
		voucheramount: ''
	};

	var mainList = $('.coupon-list');
	var mainDetail = $('.coupon-detail');

	// 设置列表VM
	couponListView.VM = avalon.define({
		$id: 'couponList',
		listAva: [],
		listExp: [],
		itemClick: function(ev) {
			couponListView.VM.onClickFn && couponListView.VM.onClickFn(ev);
		},
		onClickFn: $.noop,
	});

	//设置详情VM
	couponDetailView.VM = avalon.define($.extend({
		$id: 'couponDetail',
	}, couponDetailJSON));

	avalon.scan();

	//我的   券列表处理
	var mineHandler = function(arr) {
		//详情消失 重新渲染数据
		//数据处理函数
		//$.extend(couponListView.VM,{
		//	listAva:可用数组,
		//	listExp:不可用数组，	
		//})
		couponListView.on('show', function() {
			$.extend(couponDetailView.VM, couponDetailJSON);
		});
	};

	//定单  券列表处理
	var orderHandler = function(arr) {
		//数据处理函数
		//$.extend(couponListView.VM,{
		//	listAva:可用数组,
		//	listExp:不可用数组，	
		//})
	};



	var set = function(arr) {
		var type = url.filename;
		switch (type) {
			case 'mine.html':
				mineHandler(arr);
				break;
			case 'order.html':
				orderHandler(arr);
				break;
		};
	};

	//获取优惠券list
	api.myVoucherList({
		gopToken: gopToken,
	}, function(data) {
		if (data.status == 200) {
			set(data.data.voucherList);
		} else {
			$.alert(data.msg);
		}
	});


	//返回的JSON
	var couponJSON = {};
	return $.extend(couponJSON, {
		set: set,
		couponListView: couponListView,
		couponDetailView: couponDetailView,
	}); // 返回的是VIEW的对象  所有方法也在这个对象上面

});