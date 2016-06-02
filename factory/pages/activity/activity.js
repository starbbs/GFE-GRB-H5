// 高二军  创建
// H5微信端 --- view-coupon 优惠券分页
require([
    'router', 'h5-api', 'check', 'get', "url", 'h5-check', 'h5-alert', 'h5-config', 'h5-md5'
], function (router, api, check, get, url, h5check, h5alert, config, md5) {
    // todo alert 提示需要修改
    router.init(true);
    var activity = {};
    var loginData = {
        mobile: get.data.mobile,
        phonecode: get.data.phonecode,
        sign: get.data.sign,
        code: get.data.code
    }
    function getAndGotoCouponlistPage(_gopToken){
        api.getVoucher({
            "gopToken": _gopToken,
            "voucherTemplateIdList": [1, 2, 3]
        }, function (voucherData) {
            //todo 跳转到优惠券列表。。 待完善
            location.href = "./mine.html#!"
        })
    }
    //判断url是否有数据,如果是授权完成以后的页面,则进行登录等逻辑
    if (checkeSign(loginData.mobile, loginData.phonecode, loginData.sign)) {
        //说明是从认证页面跳转过来的
        api.wxlogin({
            code: loginData.code
        }, function (data) {
            if (data.status == 200) { // code有效
                var openid = data.data.openid;
                var unionid = data.data.unionid;
                var gopToken = data.data.gopToken;
                if (gopToken) { // 已绑定
                    $.cookie('gopToken', gopToken);
                }
                api.checkPhoneAndWxAcount({phone: loginData.mobile, unionId: unionid}, function (checkedata) {
                    if(checkedata.PhoneBoundAnyWx){
                        if (checkedata.WxBoundPhone) { //微信和
                            getAndGotoCouponlistPage(gopToken);
                        }else{
                            //todo. 进入错误提示页面 查看下产品文档。。还没做

                        }
                    }else if(checkedata.WxBoundAnyPhone){
                        //todo. 进入错误提示页面 查看下产品文档。。还没做
                    }else{
                        //注册用户
                        api.wxregister({
                            phone: loginData.mobile,
                            identifyingCode: loginData.phonecode,
                            openId: openid,
                        }, function(registData) {
                            if (registData.status == 200) {
                                var gopToken = registData.data.gopToken;
                                $.cookie('gopToken', gopToken);
                                getAndGotoCouponlistPage(gopToken);
                            } else {
                                //todo. 错误处理 待定
                                // $.alert(data.msg);
                            }
                        });
                    }
                })
            }

        });
        return false;
    }
    function checkeSign(_mobile, _code, _sign) {
        return signData(_mobile, _code) === _sign;
    }

    function signData(_mobile, _code) {
        return md5(_mobile + "##" + _code + "$");
    }

    var getWechatAuthUrl = function (_path) {
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + encodeURIComponent(_path) + '&response_type=code&scope=snsapi_userinfo&state=event#wechat_redirect';
    }

    var activityVM = activity.vm = avalon.define({
        $id: 'activityController',
        mobile: '', // 手机号
        mobilecode: '', // 验证码
        phoneStatus: false, //手机状态,311为空,200为正确,310 为格式不正确。
        verifyTimer: 0,
        verify_secs: 60,
        close: function (attr) { // 关闭按钮
            activityVM[attr] = '';
        },

        getCode: function () {
            if (activityVM.verify_secs != 60) {
                return false;
            }
            if (!activityVM.phoneStatus) {
                alert("手机号码输入错误");
                return false;
            }
            api.sendCode({phone: activityVM.mobile}, function (data) {
                if (data.status == 200) {
                    alert("发送成功,请查收~");
                    //todo 切换样式
                    activityVM.verify_secs = 60;
                    $("#getcode_btn").html("<span id='verify_timer_phonenum' >60</span>秒后重新获取");
                    activityVM.phonenum_verifyTimer();
                } else {
                    alert("发送失败")
                }
            })
        },
        // 同步校验手机号
        inputPhone: function () {
            activityVM.checkePhone();
        },

        /**
         * 检查手机号码输入是否正确
         * @returns {*}
         */
        checkePhone: function () {
            activityVM.phoneStatus = h5check.phone($("#activity-login-mobile"));
        },
        /**
         * 点击马上领取的function
         * @returns {boolean}
         */
        getCoupons: function () { // 按钮
            if ($.trim(activityVM.mobile) == "" || $.trim(activityVM.mobilecode) == "") {
                alert("您的输入有误");
                return false;
            }
            //校验验证码是否正确
            var redirectUrl = config.main + "activity.html?mobile=" + activityVM.mobile + "&phonecode=" + activityVM.mobilecode + "&sign=" + signData(activityVM.mobile, activityVM.mobilecode);
            api.identifyingCode({phone: activityVM.mobile, identifyingCode: activityVM.mobilecode}, function (data) {
                if (data.status == 200) {
                    //校验成功。
                    //跳转到微信授权页面
                    // console.log(getWechatAuthUrl(redirectUrl));
                    window.location.href = getWechatAuthUrl(redirectUrl)
                }
            })

        },
        phonenum_verifyTimer: function () {
            activityVM.verify_secs--;
            $("#verify_timer_phonenum").html(activityVM.verify_secs);
            activityVM.verifyTimer = window.setTimeout(function () {
                activityVM.phonenum_verifyTimer();
            }, 1000);
            if (activityVM.verify_secs == 0) {
                clearTimeout(activityVM.verifyTimer);
                $("#getcode_btn").html("获取验证码");
                //todo 切换样式
                activityVM.verify_secs = 60;
            }
        }
    });
    avalon.scan($(".activity")[0], activityVM);
});