// 张树垚 2016-04-25 10:32:39 创建
// H5微信端 --- 登录校验(自动版)


define('h5-login-judge-auto', ['h5-login-judge'], function(loginJudge) {
	// alert('自动登录检测函数');
	loginJudge.check();
	return loginJudge;
});
