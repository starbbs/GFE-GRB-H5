// 高二军  创建
// H5微信端 --- view-coupon 优惠券分页
define([
    'router', 'h5-api', 'check', 'get',"url", 'h5-check', 'h5-alert','h5-config','h5-md5'
], function (router, api, check, get, url,h5check, alert,config,md5) {
    var activity = {};
    var loginData ={
        mobile : get.data.mobile,
        phonecode : get.data.phonecode,
        sign:get.data.sign,
        code:get.data.code
    }

    //判断url是否有数据,如果是授权完成以后的页面,则进行登录等逻辑
    if(checkeSign(loginData.mobile,loginData.phonecode,loginData.sign)){
        //说明是从认证页面跳转过来的
        api.wxlogin()
    }

    function checkeSign(_mobile,_code,_sign){
        return signData(_mobile,_code) === _sign;
    }
    function signData(_mobile,_code){
        return md5(_mobile+"##"+_code+"$");
    }
    var getWechatAuthUrl = function (_path) {
        'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + encodeURIComponent(_path) + '&response_type=code&scope=snsapi_userinfo&state=event#wechat_redirect';
    }
    var activityView = new View('activity');
    var activityVM = activity.vm = avalon.define({
        $id: 'activityController',
        name: '您好', // 微信昵称
        image: './images/picture.png', // 微信头像
        mobile: '', // 手机号
        code: '', // 验证码
        phoneStatus: 311, //手机状态,311为空,200为正确,310 为格式不正确。
        close: function (attr) { // 关闭按钮
            activityVM[attr] = '';
        },

        getCode: function () {
            if (activityVM.phoneStatus != 200) {
                alert("手机号码输入错误");
            } else if (activityVM.phoneStatus == 310) {
                alert("手机号码输入错误");
            }
            api.sendCode({phone: activityVM.mobile}, function (data) {
                if (data.status == 200) {
                    alert("发送成功,请查收~")
                } else {
                    alert()
                }
            })
        },
        formsubmit: function () {
            activityVM.getCoupons();
            return false;
        },
        /**
         * 检查手机号码输入是否正确
         * @returns {*}
         */
        checkePhone: function () {
            var phone = activityVM.mobile;
            activityVM.isPhoneOK = h5check.phone(phone);
            if (activityVM.isPhoneOK != 200) {
                alert("手机号码输入错误");
            }
            return activityVM.isPhoneOK;
        },
        /**
         * 点击马上领取的function
         * @returns {boolean}
         */
        getCoupons: function () { // 按钮
            if ($.trim(activityVM.mobile) == "" || $.trim(activityVM.code) == "") {
                alert("您的输入有误");
                return false;
            }
            //校验验证码是否正确
            var redirectUrl = config.main +"activity.html?mobile="+activityVM.mobile+"&phonecode="+activityVM.code;
            api.identifyingCode({}, function (data) {
                if (data.status == 200) {
                    //校验成功。
                    //跳转到微信授权页面
                    window.location.href =getWechatAuthUrl(redirectUrl)
                }
            })

        }
    });

    var codeTools ={

    }
    activityView.on('show', function () {
        activityView.self.get(0).scrollTop = 0; // 显示时滚回最上面
    });
    avalon.scan(activityView.native, activityVM);
});