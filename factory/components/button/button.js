// 张树垚 2016-04-02 07:41:51 创建
// H5微信端 --- component-button 按钮状态插件


// define('h5-component-button', [], function() {});
define(function() {

	var format = function(string) { // 字符串格式化
		// button-loading => buttonLoading
		return string.split('-').reduce(function(str, item, index, array) {
			if (index === 0) {
				return item;
			}
			return str + item.replace(/^./, function(s) {
				return s.toUpperCase();
			});
		}, '');
	};

	var Bind = function(name) {
		// 属性
		this.name = name; // keyboard 或 button-loading
		this.handles = null;
	};
	// 类方法
	Bind.format = format;
	// 原型链方法
	Bind.prototype.setHandles = function(json) {
		bind.handles = json;
	};
	Bind.prototype.scan = function(context) {
		$('[data-' + name + ']', context).each(function(i, element) {

		});
	};

	return Bind;
});