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
			api.getGopNum({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200 ) { 
					success && success();
				} else if(data.status == 300){ //增加如果用户锁定进冻结页面
					setTimeout(function(){window.location.href = './frozen.html'},210);
				} else {
					jumpOut();
				}
			});
		} else {
			jumpOut();
		}
	};
	return {
		check: check,
	};
});

