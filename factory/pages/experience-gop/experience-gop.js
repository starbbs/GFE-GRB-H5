// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters'],function(
	router, api, weixin, filters
){
	router.init(true);
	var gopToken = get.data.token;
	if(gopToken){
		$.cookie('gopToken',gopToken);
	}
	var experienceVM = avalon.define({
		$id: 'experience',
		gopNowPrice : 0, //果仁现价（取卖一价）
		
	});
	api.getselloneprice(function(data) {
		experienceVM.gopNowPrice = data.optimumBuyPrice;
	});
	avalon.scan();
});