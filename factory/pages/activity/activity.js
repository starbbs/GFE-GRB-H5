// 高二军  创建
// H5微信端 --- view-coupon 优惠券分页
require([
    'router', 'h5-view', 'h5-weixin', 'h5-api', 'check', 'get', "url", 'h5-alert', 'h5-config', 'h5-md5'
], function (router, View, weixin, api, check, get, url, h5alert, config, md5) {
    var acvitityRegisteredPage = new View('activity-registered');
    // weixin.setShare("all",{});
    router.init(true);
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    //扩展 api 
    api.countEvent = function (params, callBack, errorCallBack) {
        $.ajax({
            url: config.countAPIDomain + "/event/upload",
            data: JSON.stringify(params),
            type: 'post',
            dataType: 'json',
            timeout: 30000,
            success: function (data) {
                callBack.call(this, data);
                return false;
            },
            error: function (data) {
                errorCallBack && errorCallBack(data);
            }
        })
    };
    var activity = {};
    var loginData = {
        mobile: $.cookie('mobile'),
        phonecode: $.cookie('phonecode'),
        sign: $.cookie('sign'),
        code: get.data.code
    };
    //待注册用户进入页面的时候生成唯一的key
    function initUserUniqueKey() {
        var randomStr = "abcdefghigkigklmopqrstuvwxyz0123456789!@#$";
        //生成一个 10位的字符串key
        var result = [];
        var m = 0, n = randomStr.length - 1;
        for (var i = 0; i < 15; i++) {
            var index = Math.floor(Math.random() * (n - m) + m);
            result.push(randomStr.split("")[index]);
        }
        $.cookie("eventUniqueKey", result.join(""));
    }

    initUserUniqueKey();
    var isFromWxShare = getQueryString("grbsev");
    alert(isFromWxShare);
    //注册用户的情况,如果是注册用户,则直接进行领取优惠券的逻辑。
    var currgopToken = $.cookie("gopToken");
    if (currgopToken && "yes"!=isFromWxShare ) {
        getAndGotoCouponlistPage(currgopToken);
        return false;
    }

    //定义提示页面的vm
    var tipPageVM = avalon.define({
        $id: 'activityRegistered',
        tipInfo: "您已注册了果仁宝账号",
        tipInfo2: "登录果仁宝直接去领取吧"
    })

    avalon.scan($(".activity-registered")[0], activityVM);
    //进入的提示页面
    function gotoTipPage() {
        router.to('activity-registered');
    };
    function gotoHome() {
        setTimeout(function () {
            location.href = "./home.html";
        }, 1000)
    }
    //判断url是否有数据,如果是授权完成以后的页面,则进行登录等逻辑
    if (checkeSign(loginData.mobile, loginData.phonecode, loginData.sign) && "yes"!=isFromWxShare ) {

        //清除数据
        $.cookie('mobile', "");
        $.cookie('phonecode', "");
        $.cookie('sign', "");
        //说明是从认证页面跳转过来的
        countEvnet("wechatAuthed");
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
                countEvnet("wechatLoginSucceed");
                api.checkPhoneAndWxAcount({"phone": loginData.mobile, "unionId": unionid}, function (checkedata) {
                    if (checkedata.status == 200) {
                        if (checkedata.data.phoneBoundAnyWx) {
                            if (checkedata.data.wxBoundPhone) { //微信和
                                getAndGotoCouponlistPage(gopToken);
                                return false;
                            } else {
                                gotoTipPage();
                                return false;
                            }
                        } else if (checkedata.data.wxBoundAnyPhone) {
                            gotoTipPage();
                            return false;
                        } else {
                            //注册用户
                            api.wxregister({
                                phone: loginData.mobile,
                                identifyingCode: loginData.phonecode,
                                openId: openid,
                            }, function (registData) {
                                if (registData.status == 200) {
                                    var gopToken = registData.data.gopToken;
                                    $.cookie('gopToken', gopToken);
                                    countEvnet("registerUserSucceed");
                                    getAndGotoCouponlistPage(gopToken);
                                } else {
                                    countEvnet("registerUserError");
                                    h5alert(data.msg);
                                    gotoHome();
                                }
                            });
                        }
                    }else{
                        h5alert("领取失败~");
                        gotoHome();
                    }
                })
            } else {
                h5alert("领取失败~");
                gotoHome();
            }
        });
        return false;
    }


    function countEvnet(_eventType) {
        var token = $.cookie("gopToken");
        if (!token) {
            token = $.cookie("eventUniqueKey");
        }
        var parmas = {
            "appId": "huodong1",
            "userId": token,
            "eventKey": _eventType,
            "extra": {
                "activityId": 1
            }
        }
        api.countEvent(parmas, function (data) {
            // console.log(data);
        });
    };
    $("#main_block").show();
    countEvnet("enterInPage");
    /**
     * 请求发优惠券,成功之后进入优惠券列表页面
     *
     *  @param _gopToken
     */
    function getAndGotoCouponlistPage(_gopToken) {
        countEvnet("goToGetCoupons");
        api.getVoucher({
            "gopToken": _gopToken,
            "activityId": 1
        }, function (voucherData) {
            if (voucherData.status == 399) {
                h5alert("来的太晚了,优惠券已经发完了~")
                setTimeout(function () {
                    location.href = "./home.html"
                }, 1000);
                return false;
            } else {
                var stateObj = {foo: "bar"};
                for (var i = 0; i < 10; i++) {
                    history.pushState(stateObj, "page " + i, "./home.html");
                }
                setTimeout(function () {
                    location.href = "./mine.html#!/coupon-list"
                }, 200);
            }


        })
    }

    /**
     * 检查返回的数据与签名是否一致
     * @param _mobile
     * @param _code
     * @param _sign
     * @returns {boolean}
     */
    function checkeSign(_mobile, _code, _sign) {
        return signData(_mobile, _code) === _sign;
    }

    /**
     * 签名数据
     * @param _mobile
     * @param _code
     * @returns {*}
     */
    function signData(_mobile, _code) {
        return md5(_mobile + "##" + _code + "$");
    }

    /**
     * 获取微信授权的url 返回的url 为 activity.html
     *
     * @param _path
     * @returns {string}
     */
    var getWechatAuthUrl = function (_path) {
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + encodeURIComponent(_path) + '&response_type=code&scope=snsapi_userinfo&state=event#wechat_redirect';
    }
    /**
     * activity 活动主页面的控制器
     */
    var activityVM = activity.vm = avalon.define({
        $id: 'activityController',
        mobile: '', // 手机号
        mobilecode: '', // 验证码
        phoneStatus: false,
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
                h5alert("手机号码输入错误");
                return false;
            }
            countEvnet("getMobileCode");
            api.sendCode({phone: activityVM.mobile}, function (data) {
                if (data.status == 200) {
                    h5alert("发送成功,请查收");
                    activityVM.verify_secs = 60;
                    $("#getcode_btn").removeClass("activity-login-main-item-btn-active").html("<span id='verify_timer_phonenum' >60</span>秒后重新获取");
                    activityVM.phonenum_verifyTimer();
                } else {
                    h5alert("短信发送失败")
                }
            })
        },
        // 同步校验手机号
        inputPhone: function () {
            activityVM.checkePhone();
        },
        inputCode: function () {
            if (activityVM.mobilecode.length == 6) {
                $("#activity-login-code").blur();
            }
        },
        /**
         * 检查手机号码输入是否正确
         * @returns {*}
         */
        checkePhone: function () {
            activityVM.phoneStatus = check.phone(activityVM.mobile).result;
            if (activityVM.phoneStatus && activityVM.verify_secs == 60) {
                $("#getcode_btn").addClass("activity-login-main-item-btn-active")
                countEvnet("inputedCorrectPhone");
                $("#activity-login-mobile").blur();
            } else if (!activityVM.phoneStatus) {
                $("#getcode_btn").removeClass("activity-login-main-item-btn-active")
                if (activityVM.mobile.length == 11) {
                    h5alert("手机号码输入错误!");
                }
            }
        },
        /**
         * 点击马上领取的function
         * @returns {boolean}
         */
        getCoupons: function () { // 按钮
            if ($.trim(activityVM.mobile) == "" || $.trim(activityVM.mobilecode) == "") {
                h5alert("您的输入有误");
                return false;
            }
            countEvnet("clickGetCouponsBtn");
            //校验验证码是否正确
            var redirectUrl = window.location.protocol + config.main + "activity.html";
            api.identifyingCode({phone: activityVM.mobile, identifyingCode: activityVM.mobilecode}, function (data) {
                if (data.status == 200) {
                    //校验成功。
                    //跳转到微信授权页面
                    //将参数写到cookie中
                    $.cookie('mobile', activityVM.mobile);
                    $.cookie('phonecode', activityVM.mobilecode);
                    $.cookie('sign', signData(activityVM.mobile, activityVM.mobilecode));
                    countEvnet("gotoWechatAuthPage");
                    setTimeout(function () {
                        window.location.href = getWechatAuthUrl(redirectUrl)
                    }, 200)
                } else {
                    countEvnet("errorInputPhoneOrCode");
                    h5alert("您的验证码输入有误");
                    return false;
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
                $("#getcode_btn").html("获取验证码").addClass("activity-login-main-item-btn-active");
                activityVM.verify_secs = 60;
            }
        }
    });
    avalon.scan($(".activity")[0], activityVM);

});