require([
    'h5-api', 'check', 'get', 'h5-weixin', 'h5-config'
], function (api, check, get, weixin, config) {
    var gopToken = $.cookie('gopToken'); // 果仁宝token
    var wxCode = get.data.code; // 微信认证返回code
    var openid; // 用户的微信id
    var unionid; // 判断微信是否和手机绑定的id
    if (gopToken) {
        gotoRegisteredPage();
    } else {
        checkCode();
    }
    /**
     * 跳转到已注册用户的页面
     */
    function gotoRegisteredPage() {
        for (var i = 0; i < 10; i++) {
            var stateObj = {foo: "bar" + i};
            history.pushState(stateObj, "page " + i, "./home.html");
        }
        location.href = "./invite-registered.html?uid="+(get.data.uid?get.data.uid:'');
    }

    /**
     *    跳转到注册页面
     */
    function gotoRegister() {
        //修改当前url使返回之后返回到首页,防止出现返不回的情况
        for (var i = 0; i < 10; i++) {
            var stateObj = {foo: "bar" + i};
            history.pushState(stateObj, "page " + i, "./home.html");
        }
        location.href = "./invite-unregistered.html?uid="+(get.data.uid?get.data.uid:'');

    }
    /**
     * 获取微信授权的url 返回的url 为 activity.html
     *
     * @returns {string}
     */
    function gotoAuth() {
        for (var i = 0; i < 10; i++) {
            var stateObj = {foo: "bar" + i};
            history.pushState(stateObj, "page " + i, "./home.html");
        }
        var redirectUrl = window.location.protocol + config.main + "invite-index.html?uid=" + (get.data.uid?get.data.uid:'');
        location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.appid + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=event#wechat_redirect';
    }
    function checkCode() {
        if (wxCode) { // 已授权
            api.wxlogin({
                code: wxCode
            }, function (data) {
                if (data.status == 200) { // code有效
                    // alert('code有效，返回TOKEN设置COOKIE，然后GOHOME 判断STATE 进入相关页面');
                    if (data.data.gopToken) { // 已绑定
                        gopToken = data.data.gopToken;
                        $.cookie('gopToken', data.data.gopToken);
                        gotoRegisteredPage();
                    } else { // 未绑定
                        // alert('没有TOKEN 去注册');
                        openid = data.data.openid;
                        unionid = data.data.unionid;
                        localStorage.setItem("openid", data.data.openid);
                        localStorage.setItem("unionid", data.data.unionid);
                        localStorage.setItem("username", data.data.nick);
                        localStorage.setItem("userimg", data.data.img);
                        gotoRegister();
                    }

                } else if (data.status == 312) { //如果用户的密码被锁定那么跳转到锁定页面
                    if (data.lockTimes == 15) { //15次跳转到永远锁定页面
                        setTimeout(function () {
                            window.location.href = './frozen15.html?type=locked'
                        }, 210);
                    } else { //跳转到锁定页面
                        setTimeout(function () {
                            window.location.href = './frozen10.html?type=locked'
                        }, 210);
                    }
                } else {
                    //未授权成功,继续授权
                    gotoAuth();
                }
            });
        } else { // 未授权
            // alert('没有CODE未授权 继续检测TOKEN');
            gotoAuth();
        }
    }
});