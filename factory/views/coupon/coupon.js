// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-coupon 优惠券分页


define('h5-view-coupon', ['h5-api', 'router', 'get', 'url', 'h5-view', 'h5-weixin'], function(api, router, get, url, View) {
	var gopToken = $.cookie('gopToken');

	var canuse = [];  //可用优惠券数组
	var disuse = [];  //不可用优惠券数组
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
	}, couponDetailJSON));

	avalon.scan();
	
	//日期处理，结束日期展示时需要提前一天
	var getPreDay = function(str){
		var strDate = new Date(str.replace(/-/g,"/"));  //字符串转日期
		var newDate = new Date(strDate - 24*60*60*1000); //日期减一天操作
		var newDateStr = newDate.getFullYear()+"-"+(newDate.getMonth()+1)+"-"+newDate.getDate(); //获取新的日期
		return newDateStr;
	}
	
    var dataHandler = function(arr,type){
    	var nowTime = new Date().getTime();
        arr.forEach(function(item,index,array){
            var itemStartTime = new Date(item.startTime.replace(/-/g,"/")).getTime();
            var itemEndTime =  new Date(item.endTime.replace(/-/g,"/")).getTime();
            item.startTime = item.startTime.substr(0,10);
            item.endTime = getPreDay(item.endTime.substr(0,10));  //对当前结束时间进行建议减一天的操作
            item.disuse = false;
            if(nowTime > itemEndTime){
                item.voucherStatus = 'EXPIRE';
                disuse.push(item);
            }else{
                item.voucherStatus = 'AVAILABLE';
                canuse.push(item);
            }
        });
        if(type === 'order'){
            canuse.forEach(function(item,index,array){
                var itemStartTime = new Date(item.startTime).getTime();
                var itemEndTime =  new Date(item.endTime).getTime();
                if(nowTime < itemStartTime){
                	item.disuse = true;
                    item.voucherStatus = 'EXPIRE';
                    disuse.push(item);
                    canuse.splice(index,1,'');
                }
            });
            canuse = canuse.filter(function(item,index,array){
                return item != '';
            });
        }
    }

	//我的   券列表处理
	var mineHandler = function(arr) {
		//详情消失 重新渲染数据
		//数据处理函数
		dataHandler(arr,'mine');
        $.extend(couponListView.VM,{
            listAva:canuse,
            listExp:disuse    
        })
		couponListView.on('show', function() {
			$.extend(couponDetailView.VM, couponDetailJSON);
		});
	};

	//定单  券列表处理
	var orderHandler = function(arr) {
		//数据处理函数
		dataHandler(arr,'order');
        $.extend(couponListView.VM,{
            listAva:canuse,
            listExp:disuse    
        })

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