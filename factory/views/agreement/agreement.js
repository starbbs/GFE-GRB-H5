// 张树垚 2016-01-21 15:28:29 创建
// H5微信端 --- view-agreement 关于我们


define('h5-view-agreement', ['h5-view', 'get'], function(View, get) {
	var agreement = new View('agreement');
	//如果ios并且versionForStore =1(需要屏蔽)的情况下,隐藏.js-hide 的内容
	if(get.data.app === 'ios' && get.data.versionForStore==1){
		$('.js-hide').remove();
	}
	return agreement;
});