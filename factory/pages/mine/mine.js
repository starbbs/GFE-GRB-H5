// 余效俭 2016-01-07 17:26:56 创建
// H5微信端 --- 我的

require([
	'router', 'h5-api', 'h5-view', 'check', 'h5-view-address-mine', 'h5-view-address-wallet', 'h5-login-judge', 'h5-view-coupon',
	'url',
	'h5-view-about-us', 'h5-view-agreement', 'h5-alert', 'h5-text', 'h5-weixin', 'filters', 'h5-login-judge-auto'
], function(
	router, api, View, check, address_mine, address_wallet, loginJudge, CouponJSON, url
) {

	router.init(true);

	var gopToken = $.cookie('gopToken');
	var mine = $('.mine');
	var feedbackText = $(".setting-feedback-text");

	new View('setting');
	new View('setting-about');
	new View('setting-address');
	new View('setting-feedback');

	//列表点击事件
	CouponJSON.couponListView.VM.onClickFn = function(ev) {
		var target = $(ev.target).closest('.coupon-list-li');
		if (target.length) {
			var json = target.get(0).dataset;
			$.extend(CouponJSON.couponDetailView.VM, json);
			router.go('/coupon-detail');
		}
	};
	/*
		var dbclickOrLongpress = '长按'; //安卓为长按, ios为双击, 在zepto的$.os对象中可判断浏览器
		if ($.os.ios) {
			dbclickOrLongpress = '长按';
		} else if ($.os.android) {
			dbclickOrLongpress = '双击';
		}
	*/
	//市场添加回调  return false用于下一步按钮是否可用
	address_mine.vm.setSuccess = function() {
		vm.setMarketAddressTip = '查看';
		vm.marketGopAddress = address_mine.vm.marketGopAddress;
		return false;
	};
	//市场删除回调
	address_mine.vm.setDelSuccess = function() {
		vm.setMarketAddressTip = '未设置';
		//address_mine.vm.marketGopAddress = '';
		vm.marketGopAddress = '';
		return false;
	};

	//钱包
	address_wallet.vm.callback = function() {
		router.go('/');
	};
	//删除添加钱包地址后回调
	address_wallet.vm.setSuccess = function(walletListLength) {
		vm.setWallet = walletListLength > 0 ? '查看' : '未设置';
		return false;
	};



	var vm = avalon.define({
		$id: 'mine',
		name: '',
		phone: '',
		photo: './images/picture.png',
		setnick: '未设置',
		nickname: '',
		feedback: '',
		setMarketAddressTip: '未设置', //市场地址
		setWallet: '未设置', // 钱包地址
		setRealName: false, //是否实名认证标志
		hasMarketAddress: false, //是否有果仁市场地址标志
		setMarketAddress: false, //正在设置果仁市场地址标志
		marketGopAddress: '', //果仁市场地址
		internalGopAddress: '',
		dbclickOrLongpress: '长按',
		textNum: '0/140', //可输入的文字个数上线
		nick_click: function() {
			// $.extend(nicknameView.vm, {
			// 	nickname: vm.nickname,
			// 	id: '',
			// 	callback: function() {
			// 		$.alert('设置成功!');
			// 		setTimeout(function() {
			// 			router.go('/');
			// 		}, 1000);
			// 	}
			// });
			// router.go('/nickname');
		},
		address_mine_click: function() { //果仁市场跳转
			var nowData = {};
			if (vm.marketGopAddress != '') {
				nowData.marketGopAddress = vm.marketGopAddress;
				nowData.hasMarketAddress = true;
				address_mine.vm.hasMarketAddress = true;
				address_mine.vm.setMarketAddress = false;
			} else {
				nowData.hasMarketAddress = false;
				address_mine.vm.setMarketAddress = false;
			}
			$.extend(address_mine.vm, nowData);
			router.go('/address-mine');
		},
		walletAddress_click: function() { //钱包地址跳转
			var nowData = {};
			nowData.walletList = [];
			api.walletList({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					for (var i = 0; i < data.data.walletList.length; i++) {
						var item = data.data.walletList[i];
						if (item.defaultWallet) {
							nowData.walletList.unshift(item);
						} else {
							nowData.walletList.push(item);
						}
					}
					$.extend(address_wallet.vm, nowData);
					router.go('/address-wallet');
				} else {
					console.log(data);
				}
			});
		},
		myCoupon_click: function() {
			//router.go('/coupon-detail');
			router.go('/coupon-list');
		},
		address_back_click: function() { //返回
			router.go('/');
		},
		feedbackSending: false, // 反馈发送中
		feedbackClick: function() { //问题反馈
			if (vm.feedbackSending) {
				return $.alert('正在发送中, 请稍后');
			}
			if (check.empty(vm.feedback) || vm.feedback === '＃果仁宝意见反馈＃' || vm.feedback.length < 10 || vm.feedback.length > 140) {
				return $.alert('用户可输入10-140个汉字');
			}
			vm.feedbackSending = true;
			api.feedback({
				gopToken: gopToken,
				fankuiContext: vm.feedback
			}, function(data) {
				vm.feedbackSending = false;
				if (data.status == 200) {
					$.alert('谢谢您的意见反馈!');
					//router.go('/');
					vm.feedback = "";
					window.history.back();
				} else {
					console.log(data);
					$.alert(data.msg);
				}
			});
		},
		input: function() {
			if (this.value.length >= 140) {
				this.value = this.value.substring(0, 140);
				console.log(this.value.length);
			}
			vm.textNum = this.value.length + '/' + (140);
		}
	});
	//监听是否在反馈页面
	window.onhashchange = function() {
			var feedback_isShowing = router.view['setting-feedback'].isShowing;
			if (!feedback_isShowing) {
				feedbackText[0].blur();
			}
		}
		//初始加载用户信息
	api.info({
		gopToken: gopToken
	}, function(data) {
		console.log(data);
		if (data.status == 200) {
			vm.phone = data.data.phone;
			if (data.data.photo) {
				vm.photo = data.data.photo;
			}
			if (data.data.nickname) {
				vm.setnick = '修改'; //昵称。null或空字符串都表示未设置
				vm.name = data.data.nickname;
				vm.nickname = data.data.nickname;
			}
			if (data.data.realname) {
				vm.name = data.data.realname;
				vm.setRealName = true;
			}
			if (data.data.marketGopAddress) {
				vm.setMarketAddressTip = '查看'; //果仁市场地址。null或空字符串都表示未设置
				vm.hasMarketAddress = true;
				vm.marketGopAddress = data.data.marketGopAddress.substring(0, 10) + "*************************************";
			}
			if (data.data.hasWallet) {
				vm.setWallet = '查看'; //果仁市场地址。null或空字符串都表示未设置
			}
			vm.internalGopAddress = data.data.internalGopAddress; //内部果仁地址。null或空字符串都表示未设置

		} else {
			console.log(data);
		}
	});

	avalon.scan();

	loginJudge.check(function() {
		setTimeout(function() {
			mine.addClass('on');
		}, 100);
	});

});