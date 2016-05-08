// 张树垚 2016-04-22 10:51:40 创建
// H5微信端 --- 登录判断


define('h5-login-judge', ['h5-api', 'h5-authorization'], function(api, authorization) {
	var check = function(success, error) {
		var jumpOut = function() {
			if (!(error && error() === false)) {
				authorization.go();
			}
		};
		var gopToken = $.cookie('gopToken');
		if (gopToken) {
			//alert('有TOKEN 去检查TOKEN');
			api.getGopNum({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					//alert('TOKEN有效');
					success && success();
				} else if (data.status == 300) { //增加如果用户锁定进冻结页面
					setTimeout(function() {
						window.location.href = './frozen.html?type=locked'
					}, 210);
				} else {
					//alert('TOKEN无效 去授权');
					jumpOut();
				}
			});
		} else {
			//alert('没有TOKEN 去授权');
			jumpOut();
		}
	};
	return {
		check: check,
	};
});