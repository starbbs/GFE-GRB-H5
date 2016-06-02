// 张树垚 2016-04-22 10:51:40 创建
// H5微信端 --- 登录判断


define('h5-login-judge', ['h5-api', 'h5-authorization'], function(api, authorization) {
	var check = function(success, error) {
		alert(4444);
		var jumpOut = function() {
			alert(222);
			if (!(error && error() === false)) {
				authorization.go();
				return false;
			}
		};
		var gopToken = $.cookie('gopToken');
		if (gopToken) {
			// alert('有TOKEN 去检查TOKEN');
			//检查
			api.checkLoginPasswordStatus({"gopToken":gopToken},function(data){
				if(data.status == 200){
					if(data.data.result=="success"){
						success && success();
					}else if(data.data.times==10){
						// setTimeout(function() {
							window.location.href = './frozen10.html?type=locked'
						// }, 210);
					}else if(data.data.times==15){
						// setTimeout(function() {
							window.location.href = './frozen15.html?type=locked'
						// }, 210);
					}else if(data.data.times<15){
						success && success();
					}else{
						jumpOut();
					}
				}else if(data.status==313){
					success && success();
				}else{
					jumpOut();
				}
			})
		} else {
			// alert('没有TOKEN 去授权');
			jumpOut();
		}
	};
	return {
		check: check,
	};
});