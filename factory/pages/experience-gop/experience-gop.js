// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters'],function(
	router, api, weixin, filters
){
	var list={
		"data":{
		"list":[{"createTime":"2016-07-22 09:29:33",
		"getGopPrice":7.050,
		"gopPrice":7.010,
		"expireDate":"2016-07-29 00:00:00",
		"updateTime":"2016-07-22 15:39:27",
		"id":1,
		"gopNum":1500.000000,
		"userId":63,
		"getGopNum":0.709220,
		"status":"PROCESSING"
		},{
		"createTime":"2016-07-22 09:32:33",
		"getGopPrice":7.000,
		"gopPrice":7.039,
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
		
	});
	api.getselloneprice(function(data) {
		experienceVM.gopNowPrice = data.optimumBuyPrice;
	});
	experienceList=[];
	list.data.list && list.data.list.forEach(function(item){
		//if(item.status!="WITHDRAW"){
			var deci=Math.abs((item.getGopPrice-item.gopPrice)*item.gopNum)-Math.abs(parseInt((item.getGopPrice-item.gopPrice)*item.gopNum));
			item.gopDecimal=filters.ceilFix(deci,2).split(".")[1];
			experienceList.push(item);
		//}
	})


	// api.experienceGopList({gopToken:gotToken},function(data){
	// 	if(data.status==200){
	// 		experienceList=data.data.list;			
	// 	}else{
	// 		$.alert(data.msg);
	// 	}
	// })
	avalon.scan();
});