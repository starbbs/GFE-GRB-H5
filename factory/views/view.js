// 张树垚 2015-11-27 10:46:47 创建
// 移动端 右侧移入页面 View类

define('h5-view', ['router', 'url', 'h5-alert'], function(router, url) {

	// 存在问题:
	// 1.缺少进入页面首次路由的触发判断
	// 2.判断分页顺序, 由dom结构判断而不是实例, 之后由分页顺序来显示隐藏
	window.onhashchange = function(){
		$('input').blur();
	};
	router.view = {};
	var _list = router.view._list = []; // 所有列表 各分页的类名
	var _reset = router.view._reset = function(classname) { // 重置, 隐藏所有
		mainHide();
		oNav.removeClass('view-nav');
		pageBox.removeClass('main-hide').addClass('main-show');
		$('.' + classname).length && $('.paypass-input').blur();
	};
	var oNav = $('.nav');
	var pageBox = $('.' + url.basename).eq(0);
	router.onRoot = function() { // 开始执行2次, 之后返回执行1次
		for (var i = 0; i < _list.length; i++) {
			// console.log(_list[i], router.view[_list[i]], router.view[_list[i]].isShowing)
			if (router.view[_list[i]].isShowing) {
				_reset(router.view[_list[i]].name);
				break;
			}
		}
		_list.forEach(function(name) {
			var view = router.view[name];
			view[stackMaker('root')].length && view[stackMaker('root')].forEach(function(callback) {
				callback.call(view);
			});
		});
	};
	router.get('/', ['all'], router.onRoot);
	router.get('/:name', [_list], function(name) { //显示
		if (name in router.view) {
			router.view[name].show();
			oNav.addClass('view-nav');
			pageBox.removeClass('main-show').addClass('main-hide');
		}
	});

	var time = 10; // 运动时间, 使用的定时器, 没有绑定transitionEnd/animationEnd
	var main = $('.view');
	var removeAllClass = function() {
		_list.forEach(function(name) {
			var view = router.view[name];
			view.self.removeClass('show show-immediately hide hide-immediately');
			view.isShowing = false;
			view[stackMaker('hide')].length && view[stackMaker('hide')].forEach(function(callback) {
				callback.call(view);
			});
		});
		main.removeClass('hide hide-immediately');
	};
	var mainHide = function(ifHideImmediately) {
		if (ifHideImmediately) {
			main.addClass('hide-immediately');
			removeAllClass();
		} else {
			main.addClass('hide');
			setTimeout(function() {
				removeAllClass();
			}, time);
		}
	};

	// 排序view 节点
	var refreshList = [];
	var refreshTimer = null;
	var refresh = function() {
		main.children().each(function(i, item) { // main.children()  html节点
			var name = item.className.split(' ')[0];
			refreshList[i] = name;
			if (name in router.view) {
				router.view[name].refreshIndex = i;
			} else {
				console.log('view:' + name + '不存在!');
			}
		});
	};
	var stackSupports = ['show', 'hide', 'root'];
	var stackMaker = function(name) {
		return 'on' + name[0].toUpperCase() + name.substr(1) + 'Stack';
	};
	var View = function(name) {

		// 注册
		if (_list.indexOf(name) > -1) {
			return alert(name + '已被添加到view上!');
		}
		_list.push(name);
		router.view[name] = this;  //router.view[name] = this;

		// 定义
		this.name = name;
		this.main = main;
		this.className = '.' + name;
		this.self = $(this.className); // choice -> .choice
		this.native = this.self.get(0);
		this.isShowing = false;

		stackSupports.forEach(function(name) {
			this[stackMaker(name)] = [];
		}.bind(this));

		// 排序
		clearTimeout(refreshTimer);
		refreshTimer = setTimeout(refresh, 300);
	};
	View.prototype.config = function(opts) {
		opts && $.extend(this, opts);
	};
	View.prototype.show = function(ifShowImmediately) {
		refreshList.slice(this.refreshIndex + 1).forEach(function(name) {
			name in router.view && router.view[name].hide(ifShowImmediately);
		});
		if (this.isShowing) {
			return;
		}
		this.isShowing = true;
		this.self.addClass(ifShowImmediately ? 'show-immediately' : 'show');
		this[stackMaker('show')].length && this[stackMaker('show')].forEach(function(callback) {
			callback.call(this);
		}.bind(this));
	};
	View.prototype.hide = function(ifHideImmediately, ifHideOthers) {
		if (!this.isShowing) {
			return;
		}
		this.isShowing = false;
		if (ifHideOthers) { // 同时隐藏其他所有views
			mainHide(ifHideImmediately);
		} else {
			var self = this.self;
			if (ifHideImmediately) {
				self.addClass('hide-immediately');
				self.removeClass('hide-immediately show');
			} else {
				self.addClass('hide');
				setTimeout(function() {
					self.removeClass('hide show');
				}, time);
			}
			self.addClass(ifHideImmediately ? 'hide-immediately' : 'hide');
		}
		this[stackMaker('hide')].length && this[stackMaker('hide')].forEach(function(callback) {
			callback.call(this);
			// alert('hide');
		}.bind(this));
	};
	View.prototype.on = function(name, callback) {
		this[stackMaker(name)].push(callback);
	};

	return View;
});