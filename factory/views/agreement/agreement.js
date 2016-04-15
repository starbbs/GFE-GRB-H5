
// 张树垚 2016-01-21 15:28:29 创建
// H5微信端 --- view-agreement 关于我们


define('h5-view-agreement', ['h5-view', 'get'], function(View, get) {
	var agreement = new View('agreement');
	// agreement.v = $('#js-v').html('V' + (get.data.v || '1.0'));
	get.data.app === 'ios' && get.data.v === '1.2.0' && $('.js-hide').remove();
	return agreement;
});