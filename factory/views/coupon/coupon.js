// 张树垚 2016-02-24 16:16:44 创建
// H5微信端 --- view-bill 账单详情分页


define('h5-view-coupon',['h5-api', 'router', 'get', 'h5-view-bill', 'h5-login-judge',
	'h5-weixin'
], function(
	api, router, get, billView, loginJudge
) {
	var gopToken = $.cookie('gopToken');
	var couponID = get.data.id;
	api.getCouponsInfo({id:couponID},function(_data){
			
	},function(_error	){
		
	})
});