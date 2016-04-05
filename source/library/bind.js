// 张树垚 2016-04-02 07:44:30 创建
// H5微信端 --- 行间属性绑定方法


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
			element.dataset.keyboard.split('|').forEach(function(string) { //遍历属性上的方法
				var match = string.match(/(\w+)(\(([\w\,\-]+)\))?/);
				if (match && match[1] in handles) {
					handles[match[1]].apply(element, match[3] ? match[3].split(',') : []);
					//  handles[hide].apply(element , [contacts-search-input]);
				}
			});
		}.bind(this));
	};

	return Bind;
});

