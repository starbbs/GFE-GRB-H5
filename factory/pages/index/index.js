// 张树垚 2015-12-27 15:57:31 创建
// H5微信端 --- 微信授权跳转页


require([
    'h5-api', 'check', 'get', 'h5-authorization', 'h5-weixin', 'h5-login-judge',
], function (api, check, get, authorization, weixin, loginJudge) {

    var gopToken = $.cookie('gopToken'); // 果仁宝token
    var wxCode = get.data.code; // 微信认证返回code
    var openid; // 用户的微信id
    var unionid; // 判断微信是否和手机绑定的id
    var gotoAuthorization = function () { // 跳转授权页, 未授权
        // return;
        setTimeout(function () {
            authorization.go(); //跳转威信授权的地址
        }, 100);
    };
    var gotoHome = function () {
        // 跳转home页面, 已授权, 已绑定账号 解决安卓停留请等待,
        // window.location.href = 'frozen.html'
        authorization.goGet();
    };
    var gotoLogin = function () { // 跳转login分页
        setTimeout(function () {
            //修改当前url使返回之后返回到首页,防止出现返回又跳转到登录页面的情况
            var stateObj = {foo:"bar222"}
            history.replaceState(stateObj, "pageme2", "./home.html");
            location.href = "./login.html";
            document.title = '绑定手机号';
        }, 100);
    };

    var checkToken = function () {
        loginJudge.check(function () {
            gotoHome();
        });
    };
    var checkCode = function () {
        // alert('是否有CODE==='+wxCode);
        if (wxCode) { // 已授权
            api.wxlogin({
                code: wxCode
            }, function (data) {
                if (data.status == 200) { // code有效
                    // alert('code有效，返回TOKEN设置COOKIE，然后GOHOME 判断STATE 进入相关页面');
                    if (data.data.gopToken) { // 已绑定
                        gopToken = data.data.gopToken;
                        $.cookie('gopToken', data.data.gopToken);
                        gotoHome();
                    } else { // 未绑定
                        // alert('没有TOKEN 去注册');
                        openid = data.data.openid;
                        unionid = data.data.unionid;
                        localStorage.setItem("openid",data.data.openid);
                        localStorage.setItem("unionid",data.data.unionid);
                        localStorage.setItem("username",data.data.nick);
                        localStorage.setItem("userimg",data.data.img);
                        gotoLogin();
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
                    //alert(data.status+"  "+data.msg);
                    gotoAuthorization();
                }
            });
        } else { // 未授权
            // alert('没有CODE未授权 继续检测TOKEN');
            checkToken();
        }
    };
    if (gopToken) {
        gotoHome();
    } else {
        checkCode();
    }
    
    
});