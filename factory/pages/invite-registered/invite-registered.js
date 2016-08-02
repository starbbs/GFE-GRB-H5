// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁

require(['router', 'h5-api', 'h5-weixin', 'filters', 'h5-view', 'h5-alert', ], function(
	router, api, weixin, filters, View, h5alert
) {
//		a={
//  "data": {
//      "max": 2,
//      "limit": false
//  },
//  "msg": "success",
//  "status": "200"
//}
	router.init(true);
	new View('invite-kefu');
	var gopToken = $.cookie('gopToken');
	var inventeVM = avalon.define({
		$id: 'invente',
		mideFlag: false, //定义详细规则页面开始是隐藏
		shareFlag: false,
		//		定义点击详细规则后页面跳出
		minuteRule: function() {
			inventeVM.mideFlag = true;
		},
		//		点击×号后关闭页面
		mideClose: function() {
			inventeVM.mideFlag = false;
		},
		//点击立即邀请好友判断邀请数是否超过上限
		minuteInvente: function() {
			//调接口
			api.inviteFriendLimit({
				gopToken: gopToken
			}, function(data) {
				if(data.status === 200) {
					if(data.data.limit) {
						router.go("/invite-kefu");//limit为true时跳转到二维码页面
					} else {
						inventeVM.shareFlag = true;
					}
				} else {
					$.alert(data.msg);
				}
			});
		},
//		minuteInvente: function() {
//			router.go("/invite-kefu");
//		},
//minuteInvente: function() {
//	if(a.data.limit) {
//		router.go("/invite-kefu");
//	} else {
//		inventeVM.shareFlag = true;
//	}
//},

		
	});
	
	$(".screen-popup ").addClass('on'); //延迟
	$(".screen-share").addClass('on'); //延迟
	avalon.scan();
})