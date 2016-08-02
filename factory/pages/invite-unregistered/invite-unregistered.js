require([
	'router', 'h5-view', 'h5-weixin', 'h5-api', 'check', 'get', "url", 'h5-alert', 'h5-config', 'h5-md5'
],function(router,View,weixin,api,check,get,url,h5alert,h5config,h5md5){
	router.init(true);

	new View('invite-grb');

	//invite-unregistered页面控制器
	var inviteUnregisteredVM = avalon.define({
		$id: 'inviteUnregisteredController',
		mobile: '',//input获取的用户填写的手机号
		mobilecode: '',//input获取的用户填写的验证码
		phoneStatus: false,
		verifyTimer: 0,
		verify_secs: 60,
		close: function(attr){
			inviteUnregisteredVM[attr] = '';
		},
		//手机号校验
		checkPhone: function(){
			inviteUnregisteredVM.phoneStatus = check.phone(inviteUnregisteredVM.mobile).result;
			if(inviteUnregisteredVM.phoneStatus && inviteUnregisteredVM.verify_secs == 60){
				$("#getcode_btn").addClass("invite-login-main-code-r-active");//添加样式：黄色背景色
				//countEvnet("inputedCorrectPhone");
				$("#invite-login-moblie").blur();//移开键盘焦点
			}
			else if(!inviteUnregisteredVM.phoneStatus){
				$("#getcode_btn").removeClass("invite-login-main-code-r-active");
				if(inviteUnregisteredVM.mobile.length == 11){
					h5alert("手机号码输入错误！");
				}
			}
		},
		//获取验证码
		getCode: function(){
			if(inviteUnregisteredVM.verify_secs != 60){
				return false;
			}
			if(!inviteUnregisteredVM.phoneStatus){
				h5alert("手机号码输入错误");
				return false;
			}
			//countEvnet("getMobileCode");
			api.sendCode({phone: inviteUnregisteredVM.mobile},function(data){
				if(data.status == 200){
					h5alert("发送成功，请查收");
					inviteUnregisteredVM.verify_secs = 60;
					$("#getcode_btn").removeClass("invite-login-main-code-r-whitefont invite-login-main-code-r-active").html("<span id='verify_time_phonenum'>60</span>秒");
					inviteUnregisteredVM.phonenum_verifyTimer();//获取验证码的倒计时函数调用
				}
				else if(data.status == 400){
					h5alert(data.msg);
				}
				else{
					h5alert("验证码发送失败");
				}
			})
		},
		//验证码输入满6位自动移开焦点
		inputCode: function(){
			if(inviteUnregisteredVM.mobilecode.length == 6){
				$("#invite-login-code").blur();
			}
		},
		//验证码倒计时
		phonenum_verifyTimer: function(){
			inviteUnregisteredVM.verify_secs--;
			$("#verify_time_phonenum").html(inviteUnregisteredVM.verify_secs);
			inviteUnregisteredVM.verifyTimer = window.setTimeout(function(){
				inviteUnregisteredVM.phonenum_verifyTimer();
			},1000);
			if(inviteUnregisteredVM.verify_secs == 0){
				clearTimeout(inviteUnregisteredVM.verifyTimer);
				$("#getcode_btn").html("获取验证码").addClass("invite-login-main-code-r-active invite-login-main-code-r-whitefont");
				inviteUnregisteredVM.verify_secs = 60;
			}
		},
		//获取体验金/体验果仁
		// getExperienceGop: function(){
		// 	if($.trim(inviteUnregisteredVM.mobile) == "" || $.trim(inviteUnregisteredVM.mobilecode) == ""){
		// 		h5alert("您的输入有误");
		// 		return false;
		// 	}
		// 	//countEvnet("clickGetExperienceGopBtn");
		// 	//验证码校验
		// 	var redirectUrl = window.location.protocol + config.main + "invite-unregistered.html";
		// 	api.jiekou({canshu},function(data){//待改！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
		// 		if(data.status === 200){
		// 			//校验成功
		// 			//参数传回接口（账号注册）待改！！！！！！！！！！！！！！！！！！！！
		// 			data.mobile = inviteUnregisteredVM.mobile;
		// 			data.fenxiangren = fenxiangren;
		// 			data.newuser = newuser;
		// 			h5alert("领取成功哦");
		// 			//跳到果仁宝二维码分页
		// 			setTimeout(function(){router.go('/invite-grb');},1000);
		// 			//router.go('/invite-grb');
		// 		}
		// 		else{
		// 			//弹窗
		// 			h5alert();//
		// 		}
		// 	})
		// }
		//分页跳转测试
		getExperienceGop: function(){
			router.go('/invite-grb');
		}
	});
	avalon.scan();
})

