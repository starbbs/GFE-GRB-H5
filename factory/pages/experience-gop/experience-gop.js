// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters','h5-dialog-confirm'],function(
	router, api, weixin, filters, dialogConfirm
){
	var list={
		"data":{
		"list":[{"createTime":"2016-07-22 09:29:33",
		"getGopPrice":7.050,
		"gopPrice":7.011,
		"expireDate":"2016-07-29 00:00:00",
		"updateTime":"2016-07-22 15:39:27",
		"id":1,
		"gopNum":1500.000000,
		"userId":63,
		"getGopNum":0.709220,
		"status":"PROCESSING"
		},{
		"createTime":"2016-07-22 09:32:33",
		"getGopPrice":6.000,
		"gopPrice":7.000,
		"expireDate":"2016-07-29 00:00:00",
		"updateTime":"2016-07-22 10:03:26",
		"id":2,
		"gopNum":500.000000,
		"userId":63,
		"getGopNum":0.714290,
		"status":"WITHDRAW"}]
		},
		"msg":"success",
		"status":"200"}
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
	experienceList=list.data.list;

	// api.experienceGopList({gopToken:gotToken},function(data){
	// 	if(data.status==200){
	// 		experienceList=data.data.list;			
	// 	}else{
	// 		$.alert(data.msg);
	// 	}
	// })
	avalon.scan();
	
	
});
