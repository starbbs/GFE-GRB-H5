// 张树垚 2015-12-27 16:23:25 创建
// H5微信端 --- 微信授权链接


define('h5-authorization', ['get', 'url'], function(get, url) {
	// <a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx55923db8dfb94e44&redirect_uri=http%3A%2F%2Fwww.goopal.me%2Findex2222.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect">点击授权登录</a>
	return {
		getInfoDate: function() { // info 特有的参数
			return '?from=' + $.cookie('from') + '&type=' + $.cookie('type') + '&id=' + $.cookie('id');
		},
//		main: window.location.protocol + '//www.goopal.com.cn/wx/', // 回跳地址
		main: window.location.protocol + '//www.xiaojian.me/wx/', //测试环境
		set: function(path, state) { // 设置授权页地址
			// alert('授权页面相应地址==='+'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx55923db8dfb94e44&redirect_uri=' + encodeURIComponent(path) + '&response_type=code&scope=snsapi_userinfo&state=' + encodeURIComponent(state || 'STATE') + '#wechat_redirect');
			//测试环境wxe91980c4944999fe  正式环境wx55923db8dfb94e44
			return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxe91980c4944999fe&redirect_uri=' + encodeURIComponent(path) + '&response_type=code&scope=snsapi_userinfo&state=' + encodeURIComponent(state || 'STATE') + '#wechat_redirect';
		},
		go: function() { // 进入授权页
			// return // 注释进入授权页
			// alert('进入授权页面');
			setTimeout(function() {
				window.location.href = this.set(this.main, url.basename);
			}.bind(this), 100);
		},
		get: function() { // 获取回跳后要跳转的链接
			var state = (get.data.state || '').trim().toLowerCase();
			// alert(state);
			// info  home state
			switch (state) {
				case '': // 为空
				case 'index': // 为首页
				case 'state': // 为默认
					state = 'home';
			}
			// alert(state === 'info' ? './' + state + '.html' + this.getInfoDate() : './' + state + '.html');
			return state === 'info' ? './' + state + '.html' + this.getInfoDate() : './' + state + '.html';
			// return './' + state + '.html';
		},
		goGet: function() { // 进入回跳后要跳转的链接   已经授权绑定
			// alert('gohome函数执行');
			return window.location.href = this.get();
		},
	}
});