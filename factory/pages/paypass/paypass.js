// 张树垚 2015-12-30 16:55:15 创建
// H5微信端 --- 支付密码重置


require([
	'router', 'h5-api', 'h5-view', 'get', 'h5-dialog-success', 'h5-dialog-alert', 'url',
	'h5-ident', 'h5-paypass', 'h5-text', 'h5-weixin', 'h5-paypass-judge-auto'
], function(
	router, api, View, get, dialogSuccess, dialogAlert, url
) {
	router.init(true);

	dialogAlert.set('输入5次错误,3小时后解锁');
	var showDialogKnown = function(ifShowImmediately, ifHideOthers, HideArr) { // 出"知道了"弹窗  错误5次	
		dialogAlert.show();
	};

	var gopToken = $.cookie('gopToken');
	var paypass = $('.paypass-page');
	var cardInput = $("#paypass-authentication-card");
	var codeInput = $("#paypass-ident-code");
	var finish = function() { // 最终
		// return;
		switch (get.data.from) {
			case 'transfer':
				window.location.href = './transfer.html?cangory=' + get.data.cangory;
				break;
			case 'order':
				window.location.href = './order.html' + url.search;
				break;
			default:
				window.location.href = './mine.html';
				break;
		}
	};
	var dialogShow = function() { // 显示浮层
		var timer = null;
		var second = 3;
		dialogSuccess.on('show', function() {
			timer = setInterval(function() {
				second--;
				if (second <= 0) {
					finish();
					dialogSuccess.hide();
					clearInterval(timer);
				} else {
					dialogSuccess.button.html('支付密码修改成功，请牢记，' + second + 's后自动跳转');
				}
			}, 1000);
		});
		dialogSuccess.set('支付密码修改成功，请牢记，3s后自动跳转');
		dialogSuccess.show();
	};

	setTimeout(function() {
		paypass.addClass('on');
		if (get.data.from === 'dialog') {
			router.to('/paypass-choose');
		}
	}, 100);

	new View('paypass-choose');
	new View('paypass-protection-1');
	new View('paypass-protection-2');
	new View('paypass-authentication');
	new View('paypass-ident');

	var payPassViewArr = [];

	//Array.of(new View('paypass-view-1'), new View('paypass-view-2'), new View('paypass-view-3'));

	payPassViewArr.push(new View('paypass-view-1'));
	payPassViewArr.push(new View('paypass-view-2'));
	payPassViewArr.push(new View('paypass-view-3'));

	//var paypassViewShowFn = function(index) {
	//	$('#paypass-' + index).focus();
	//};
	//var paypassViewHideFn = function(index) {
	//	$('#paypass-' + index).blur();
	//};

	//payPassViewArr.forEach(function(objView, index, arr) {
	//	objView.on('show', function() {
	//		paypassViewShowFn(index);
	//	}.bind(objView));
	//
	//	//objView.on('hide', function() {
	//	//	paypassViewHideFn(index);
	//	//}.bind(objView));
	//});
	//

	var vm = avalon.define({
		$id: 'paypass',
		paypass1: '',
		paypass2: '',
		paypass3: '',
		realName: '',
		Idcard: '',
		question1: '',
		question2: '',
		answer1: '',
		answer2: '',
		paypass1Next: false,
		paypass2Next: false,
		phone: '',
		identifyingCode: '',
		hasProtected: true,
		hasRealName: true,
		chooseUrl: '',
		checkCodeClick: function() {
			if (vm.identifyingCode && codeInput[0].value.length) {
				api.phoneIdentifyingCode({
					gopToken: gopToken,
					identifyingCode: vm.identifyingCode
				}, function(data) {
					if (data.status == 200) {
						console.log(vm.identifyingCode);
						if (vm.chooseUrl == 'paypass-protection-1') {
							api.getQuestion({
								gopToken: gopToken,
								qusetionNumber: 1
							}, function(data) {
								if (data.status == 200) {
									vm.question1 = data.data.question;
									router.go('/paypass-protection-1');
								} else {
									$.alert('验证码错误');
								}
							});
						} else if (vm.chooseUrl == 'paypass-authentication') {
							//身份证认证				
							if (vm.realName && vm.realName != '') {
								//vm.realName = '*' + vm.realName.substr(1, vm.realName.length - 1);
								router.go('/paypass-authentication');
							} else {
								$.alert('未实名认证,请先实名认证');
							}
						}
					} else {
						$.alert('验证码错误');
					}
				});
			} else {
				$.alert('请输入验证码');
			}
		},
		paypass1Value: function() {
			vm.paypass1Next = vm.paypass1.length === 6 ? true : false;
			console.log(vm.paypass1Next);
		},
		paypass2Value: function() {
			vm.paypass2Next = vm.paypass2.length === 6 ? true : false;
		},
		paypass3Value: function() {
			vm.paypass3Next = vm.paypass3.length === 6 ? true : false;
		},
		quesiotn1Click: function() { // 第一个密保问题
			api.checkQuestion({
				gopToken: gopToken,
				qtNumber: 1,
				question: vm.question1,
				answer: vm.answer1
			}, function(data) {
				if (data.status == 200) {
					api.getQuestion({
						gopToken: gopToken,
						qusetionNumber: 2
					}, function(data) {
						if (data.status == 200) {
							vm.question2 = data.data.question;
							router.go('/paypass-protection-2');
						} else {
							console.log(data);
						}
					});
				} else {
					$.alert('验证问题错误');
				}
			});
		},
		quesiotn2Click: function() { // 第二个密保问题
			api.checkQuestion({
				gopToken: gopToken,
				qtNumber: 2,
				question: vm.question2,
				answer: vm.answer2
			}, function(data) {
				if (data.status == 200) {
					router.go('/paypass-view-2');
				} else {
					$.alert('验证问题错误');
				}
			});
		},
		ident: function(view) {
			if (!vm.hasProtected && view.indexOf('protection') != -1) {
				$.alert('您没有设置密保问题');
				return;
			}
			if (!vm.hasRealName && view.indexOf('authentication') != -1) {
				$.alert('您没有通过实名信息认证');
				return;
			}
			vm.chooseUrl = view;
			//身份证认证
			api.info({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					if (data.data.realname) {
						vm.realName = data.data.realname;
					}
					vm.phone = data.data.phone;
					vm.identifyingCode = '';
					router.go('/paypass-ident');
				} else {
					$.alert(data.msg);
				}
			});
		},
		authenticationClick: function() {
			if (vm.Idcard.length == 18 && cardInput[0].value.length) {
				api.checkIDcard({
					gopToken: gopToken,
					IDcard: vm.Idcard
				}, function(data) {
					if (data.status == 200) {
						router.go('/paypass-view-2');
					} else {
						$.alert(data.msg);
					}
				});
			} else {
				$.alert('身份证号码格式错误');
			}
		},
		paypass1Click: function() {
			if (vm.paypass1.length == 6) {
				//验证支付密码
				api.checkPayPwd({
					gopToken: gopToken,
					payPwd: vm.paypass1
				}, function(data) {
					if (data.status == 200) {
						router.go('/paypass-view-2');
					} else if (data.status == 310) {
						if (data.lockTimes && data.lockTimes > 9) {
							window.location.href = "./frozen.html";
						} else if (data.lockTimes && data.lockTimes > 5) {
							showDialogKnown();
						}
					} else {
						$.alert(data.msg);
					}
				});
			}
		},
		paypass2Click: function() {
			if (vm.paypass2.length == 6) {
				router.go('/paypass-view-3');
			}
		},
		paypass3Click: function() {
			if (vm.paypass2 == vm.paypass3 && vm.paypass3.length == 6) {
				api.setPayPassword({
					gopToken: gopToken,
					password: vm.paypass3
				}, function(data) {
					if (data.status == 200) {
						vm.paypass1 = '';
						vm.paypass2 = '';
						vm.paypass3 = '';
						vm.Idcard = '';
						vm.identifyingCode = '';
						dialogShow();
					} else {
						$.alert(data.msg);
					}
				});
			} else {
				$.alert('两次输入不一致');
			}
		},
	});

	avalon.scan();
	//设置密保问题
	api.isQuestion({
		gopToken: gopToken
	}, function(data) {
		//vm.hasProtected = data.status == 200;
		vm.hasProtected = data.status == 200 ? true : false;
	});

	if(window.location.href.match(/from=order|from=transfer|/)){
		router.go('/paypass-choose');
	}

	//身份证认证				
	api.info({
		gopToken: gopToken
	}, function(data) {
		if (data.status == 200) {
			//vm.hasRealName = data.data.realname && data.data.realname != '';
			vm.hasRealName = data.data.realname ? true : false;
		} else {
			$.alert(data.msg);
		}
	});
});