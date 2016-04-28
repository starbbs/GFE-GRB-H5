// 张树垚 2016-04-27 21:16:12 创建
// H5微信端 --- 支付状态自动判断

define('h5-paypass-judge-auto', ['h5-paypass-judge'], function(paypassJudge) {
	paypassJudge.status = 'unknown';
	paypassJudge.check(function(status,data) {
		console.log(status);
		if (status === 'lock10') {
			window.location.href = 'frozen.html?type=locked'; // 已被锁
		}
	});
	return paypassJudge;
});

