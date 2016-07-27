/**
 * [H5参数配置]
 * @Author   姜晓妮
 * @DateTime 2016-05-27 15:35:24
 *
 */
define('h5-config', function() {
	var path = location.pathname;
	var rootPatharr = path.split("/");
	var pathName = rootPatharr.length>1?rootPatharr[1]:'wx';
	//测试环境参数配置
	var paramConfig = {
		baseUri : '//goopal.xiaojian.me',
		main : '//www.xiaojian.me/'+pathName+'/',
		appid : 'wxe91980c4944999fe',
		countAPIDomain:"//172.16.33.10:8089",
		countAPPID:"huafeihuodong",
		guorenMarketUrl:"//exchange.xiaojian.me/"
	}
	return paramConfig;
});