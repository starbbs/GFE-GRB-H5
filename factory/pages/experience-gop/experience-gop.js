// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters','h5-dialog-confirm'],function(
	router, api, weixin, filters, dialogConfirm
){
	var list={
    "data":{
        "list":[
            {
                "createTime":"2016-07-22 09:29:33",
                "getGopPrice":7.05,
                "gopPrice":7.01,
                "expireDate":"2016-07-29 00:00:00",
                "validDays":3,
                "updateTime":"2016-07-22 15:39:27",
                "id":1,
                "gopNum":1500,
                "userId":63,
                "getGopNum":0.70922,
                "status":"PROCESSING"
            },
            {
                "createTime":"2016-07-22 09:32:33",
                "getGopPrice":7,
                "gopPrice":7,
                "expireDate":"2016-07-29 00:00:00",
                "validDays":2,
                "updateTime":"2016-07-22 10:03:26",
                "id":3,
                "gopNum":500,
                "userId":63,
                "getGopNum":0.71429,
                "status":"PROCESSING"
            },
            {
                "createTime":"2016-07-22 09:32:33",
                "getGopPrice":7,
                "gopPrice":7.039,
                "expireDate":"2016-07-29 00:00:00",
                "validDays":1,
                "updateTime":"2016-07-22 10:03:26",
                "id":2,
                "gopNum":500,
                "userId":63,
                "getGopNum":0.71429,
                "status":"PROCESSING"
            },
            {
                "createTime":"2016-07-22 09:32:33",
                "getGopPrice":7.005,
                "gopPrice":7,
                "expireDate":"2016-07-29 00:00:00",
                "validDays":0,
                "updateTime":"2016-07-22 10:03:26",
                "id":4,
                "gopNum":500,
                "userId":63,
                "getGopNum":0.71429,
                "status":"PROCESSING"
            },
            {
                "createTime":"2016-07-22 09:32:33",
                "getGopPrice":7,
                "gopPrice":7.039,
                "expireDate":"2016-07-29 00:00:00",
                "validDays":0,
                "updateTime":"2016-07-22 10:03:26",
                "id":5,
                "gopNum":500,
                "userId":63,
                "getGopNum":0.71429,
                "status":"WITHDRAW"
            }
        ],
        "minIncome":1
    },
    "msg":"success",
    "status":"200"
}
	router.init(true);
	var gopToken = $.cookie('gopToken',gopToken);
	var experienceVM = avalon.define({
		$id: 'experience',
		gopNowPrice : 0, //果仁现价（取卖一价）
		drawConfirm:function(){
			dialogConfirm.set('<div class="screen-r-popup"> <div class="screen-r-popup-top"> 现在领取收益 <span class="screen-r-popup-top-f"> 1.08</span> 个果仁（价值 <span class="screen-r-popup-top-f"> 15.35</span>元）将会进入您的账户中，同时您的体验果仁将会被系统回收 </div><div class="screen-r-popup-bottom">确定领取？</div> </div>', {okBtnText: '确定', cancelBtnText: "取消"});
			dialogConfirm.show();
			dialogConfirm.onConfirm = function () {
			};	
		}
	});
	api.getselloneprice(function(data) {
		experienceVM.gopNowPrice = data.optimumBuyPrice;
	});
	experienceList=[];
	list.data.list && list.data.list.forEach(function(item){
		//if(item.status!="WITHDRAW"){
			item.flag = (item.getGopPrice-item.gopPrice) < 0 && item.validDays > 0;
			//收益小数部分计算
			var deci = Math.abs((item.getGopPrice-item.gopPrice)*item.gopNum)-Math.abs(parseInt((item.getGopPrice-item.gopPrice)*item.gopNum));
			item.gopDecimal = filters.ceilFix(deci,2).split(".")[1];
			//收益为负 且 已到期 时收益小数部分
			var minDeci = filters.ceilFix((Math.abs(list.data.minIncome)-Math.abs(parseInt(list.data.minIncome))),2).split(".")[1];
			//+ -
			item.sign = item.getGopPrice-item.gopPrice >= 0 ? '+' : (item.validDays >= 1 ? '-' : '+');
			//收益整数、小数部分显示
			item.incomeInt = (item.getGopPrice-item.gopPrice)*item.gopNum > 0 ? parseInt((item.getGopPrice-item.gopPrice)*item.gopNum) : (item.validDays >=1 ? Math.abs(parseInt((item.getGopPrice-item.gopPrice)*item.gopNum)) : parseInt(list.data.minIncome));
			item.incomeDec = (item.getGopPrice-item.gopPrice)*item.gopNum > 0 ? item.gopDecimal : (item.validDays >= 1 ? item.gopDecimal : minDeci);
			experienceList.push(item);
		//}
	})


	//有接口后使用，不删！！！！
	// api.experienceGopList({gopToken:gotToken},function(data){
	// 	if(data.status==200){
	// 		experienceList=data.data.list;			
	// 	}else{
	// 		$.alert(data.msg);
	// 	}
	// })
	avalon.scan();
	
	
});
