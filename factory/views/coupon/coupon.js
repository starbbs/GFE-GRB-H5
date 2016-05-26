// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-coupon 优惠券分页


define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view', 'h5-weixin'], function(api, router, get, url, View) {
	var gopToken = $.cookie('gopToken');
	var couponID = get.data.id;

	var couponListView = {}; //new View('coupon-list');
	var couponDetailView = {}; //= new View('coupon-detail');
	var couponDetailJSON = {};

	var mainList = $('.coupon-list');
	var mainDetail = $('.coupon-detail');



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
	var setListVM = function() {
		couponListView.VM = avalon.define({
			$id: 'couponList',
			listAva: Qlist.available,
			listExp: Qlist.exp,
			itemClick: function(ev) {
				couponListView.VM.onClickFn && couponListView.VM.onClickFn(ev);
			},
			onClickFn: $.noop,
		});
	};

	//设置详情VM
	var setDetailVM = function() {
		couponDetailJSON = {
			vouchername: '',
			starttime: '',
			endtime: '',
			voucherstatus: '',
			voucheramount: ''
		};
		couponDetailView.VM = avalon.define($.extend({
			$id: 'couponDetail',
		}, couponDetailJSON));
	};

	//我的   券列表处理
	var mineHandler = function() {
		couponListView = new View('coupon-list');
		couponDetailView = new View('coupon-detail');
		setListVM();
		setDetailVM();
	};

	//定单  券列表处理
	var orderHandler = function() {
		couponListView = new View('coupon-list');
		setListVM();
		//列表消失
		couponListView.on('show', function() {
			$.extend(couponDetailView.VM, couponDetailJSON);
		});
	};

	avalon.scan();

	//优惠券过滤
	var Qlist = {};
	Qlist.available = []; //可用

	Qlist.exp = []; //不可用
	
	//获取优惠券list
	api.myVoucherList({
		gopToken: gopToken,
	}, function(data) {
		var voucherList = data.data.voucherList;
		voucherList.forEach(function(item,index,array){
			var nowTime = new Date().getTime();
			var itemStartTime = new Date(item.startTime).getTime();
			var itemEndTime =  new Date(item.endTime).getTime();
			if(nowTime > itemEndTime){
				Qlist.exp.push(item);
			}else if(nowTime < itemStartTime){
				Qlist.available.push(item);
			}else{
				Qlist.available.push(item);
			}
		});
	});


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