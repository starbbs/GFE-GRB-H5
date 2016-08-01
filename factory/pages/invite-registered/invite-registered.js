// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁

require(['router', 'h5-api', 'h5-weixin', 'filters', 'h5-view', 'h5-alert', ], function(
	router, api, weixin, filters, View
) {
	router.init(true);
	var gopToken = $.cookie('gopToken');
	var inventeVM = avalon.define({
		$id: 'invente',
		click : function(){
			api.aaa({
				gopToken : gopToken
			},function(data){
				if(data.status === 200){
					flag = true;
				}else{
					router.go("/invite-kefu.html");
				}
			});
		}
	aaa();
	$(".screen-reg").addClass('on');
	avalon.scan();	
});