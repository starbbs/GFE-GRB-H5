// 张树垚 2016-03-07 10:18:14 创建
// H5微信端 --- component-keyboard 键盘控制插件组


define('h5-keyboard', ['bind'], function(Bind) {

	var keyboard = new Bind('keyboard');
	var keyboardHideTimer = null;
	// var keyboardShowTimer = null;
	keyboard.setHandles({
		hide: function(id) { // 写法: data-keyboard="hide(contacts-search-input)" (id不用带引号)
			var self = $(this);
			var input = $('#' + id)
				.on('focus', function() {
					clearTimeout(keyboardHideTimer);
					// keyboardShowTimer = setTimeout(function(){
						self.hide();
					// },500);
				})
				.on('blur', function() {
					clearTimeout(keyboardHideTimer);
					keyboardHideTimer = setTimeout(function() {
						self.show();
					}, 600);
				})
		},
	});
	keyboard.scan(true);

	return keyboard;
});