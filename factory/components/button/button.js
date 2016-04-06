// 张树垚 2016-04-02 07:41:51 创建
// H5微信端 --- component-button 按钮状态插件


define('h5-button', ['bind'], function(Bind) {

	var loads = [];
	var Load = function(element, string) {

		this.element = element; // 元素
		this.self = $(element); // jQuery对象
		this.replace = string || 'Loading'; // 要替换的文字
		this.origin = this.self.html(); // 原文字
		this.class = 'disabled'; // 添加的样式
		this.attr = 'disabled'; // 添加的属性
		this.timer = null; // 定时器
		this.timeout = 10000; // 延时时间

		this.self.on('click', this.click.bind(this)); // 点击

		loads.push(this);
	};
	Load.prototype.set = function(options) {
		return $.extend(this, options);
	};
	Load.prototype.work = function(html) {
		if (this.self.hasClass(this.class) && this.self.attr(this.attr) === this.attr) {
			return this;
		}
		clearTimeout(this.timer);
		this.self.addClass(this.class).html(html || this.replace).attr(this.attr, this.attr);
		this.timer = setTimeout(this.reset.bind(this), this.timeout);
		return this;
	};
	Load.prototype.reset = function(html) {
		clearTimeout(this.timer);
		this.self.removeClass(this.class).html(this.origin || html).removeAttr(this.attr);
		return this;
	};
	Load.prototype.click = function() {
		this.work.call(this);
		this.onClick.call(this.element);
	};
	Load.prototype.onClick = $.noop;

	var button = new Bind('button');
	button.Load = Load;
	button.loads = loads;
	button.filter = function(element) {
		return loads.filter(function(item) {
			return item.element === element;
		})[0] || null;
	};
	button.setHandles({
		loading: function(string) {
			this.__loading = new Load(this, string);
		},
	});
	button.scan(true);

	return button;
});
