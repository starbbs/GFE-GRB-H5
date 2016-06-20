// 魏冰冰 2016-05-27        创建
// H5微信端 --- view-coupon 优惠券分页
/**
 * [set 设置账单详情]
 * @Author   魏冰冰
 * @DateTime 2016-03-09
 * @param    {[function]}     		couponListView.vm.onClickFn		[优惠券列表点击后的回调]
 * @param    {[function]}     		set								[按页面URL设置优惠券列表]
 */

define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view'], function(api, router, get, url, View) {
//	var gopToken = $.cookie('gopToken');
	var gopToken = get.data.token;
	if(gopToken){
		$.cookie('gopToken',gopToken);
	}
	var canuse = []; //可用优惠券数组
	var disuse = []; //不可用优惠券数组
	var couponListView = new View('coupon-list');
	var couponDetailView = new View('coupon-detail');
	var couponDetailJSON = { //清空详情的数据
		vouchername: '',
		starttime: '',
		endtime: '',
		voucherstatus: '',
		voucheramount: '',
		voucherid: ''
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
		toUse: function(){
			window.location.href = "phonecharge.html";
		}
	}, couponDetailJSON));

	avalon.scan();

	//日期处理，结束日期展示时需要提前一天
	var getPreDay = function(str) {
		var strDate = new Date(str.replace(/-/g, "/")); //字符串转日期
		var newDate = new Date(strDate - 24 * 60 * 60 * 1000); //日期减一天操作
		var newDateStr = newDate.getFullYear() + "-" + ((newDate.getMonth() + 1) < 10 ? ("0" + (newDate.getMonth() + 1)) : (newDate.getMonth() + 1)) + "-" + (newDate.getDate() < 10 ? ("0" + newDate.getDate()) : newDate.getDate()); //获取新的日期
		return newDateStr;
	}

	var dataHandler = function(data, type) {
		data.available && data.available.forEach(function(item, index, arr){
			var itemEndTime = new Date(item.endTime.replace(/-/g, "/")).getTime();
			item.endTime = getPreDay(item.endTime.substr(0, 10)); //对当前结束时间进行建议减一天的操作
			item.startTime = item.startTime.substr(0, 10);
			item.voucherStatus = 'AVAILABLE';
			item.disuse = false;  //判断是否展示过期的标志icon
			canuse.push(item);
		});
		data.expire && data.expire.forEach(function(item, index, arr){
			var itemEndTime = new Date(item.endTime.replace(/-/g, "/")).getTime();
			item.endTime = getPreDay(item.endTime.substr(0, 10)); //对当前结束时间进行建议减一天的操作
			item.startTime = item.startTime.substr(0, 10);
			item.voucherStatus = 'EXPIRE';
			item.disuse = false;
			disuse.push(item);
		});
		if (type === "order") {
			var disuseUnexpire = [];
			data.disable && data.disable.forEach(function(item, index, arr){
				var itemEndTime = new Date(item.endTime.replace(/-/g, "/")).getTime();
				item.endTime = getPreDay(item.endTime.substr(0, 10)); //对当前结束时间进行建议减一天的操作
				item.startTime = item.startTime.substr(0, 10);
				item.voucherStatus = 'EXPIRE';
				item.disuse = true;
				disuseUnexpire.push(item);
			});
			disuse = disuseUnexpire.concat(disuse);
		}
		canuse.length && $("#canuse-list").show();
		disuse.length && $("#disuse-list").show();
		(!canuse.length && !disuse.length) && $("#coupon-none").show();
		$.extend(couponListView.VM, {
			listAva: canuse,
			listExp: disuse
		})
	}

	//我的   券列表处理
	var mineHandler = function() {
		//详情消失 重新渲染数据
		//数据处理函数--获取优惠券list
		api.myVoucherList({
			gopToken: gopToken,
		}, function(data) {
			if (data.status == 200) {
				dataHandler(data.data, 'mine');
			} else {
				$.alert(data.msg);
			}
		});
		couponListView.on('show', function() {
			$.extend(couponDetailView.VM, couponDetailJSON);
		});
	};

	//定单  券列表处理
	var orderHandler = function(arr) {
		//数据处理函数
		api.myOrderVoucherList({
			gopToken: gopToken,
		}, function(data) {
			if (data.status == 200) {
				dataHandler(data.data, 'order');
			} else {
				$.alert(data.msg);
			}
		});
	};

	var set = function() {
		//根据当前传入的参数判断是否是app传入的链接
		if(get.data.from === 'myvouchercards'){
			mineHandler();
		}else if(get.data.from === 'consumecards'){
			orderHandler();
		}else{
			gopToken = $.cookie('gopToken');
			var type = url.filename;
			switch (type) {
				case 'mine.html':
					mineHandler();
					break;
				case 'order.html':
					orderHandler();
					break;
			};
		}
	};
	set();

	//返回的JSON
	var couponJSON = {};
	return $.extend(couponJSON, {
		set: set,
		couponListView: couponListView,
		couponDetailView: couponDetailView,
	}); // 返回的是VIEW的对象  所有方法也在这个对象上面

});