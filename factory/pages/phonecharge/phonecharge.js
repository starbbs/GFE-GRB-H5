// 张树垚 2016-01-09 12:54:11 创建
// H5微信端 --- 手机充值
require([
    'h5-login-judge', 'h5-api', 'check', 'get', 'filters', 'h5-touchsliderBanner', 'h5-order-judge',
    'h5-weixin'
], function(loginJudge, api, check, get, filters, touchsliderBanner, orderJudge) {
    //进入页面之前先进行检查,如果还未登录则进入授权页面,成功后继续加载页面
    loginJudge.check(function() {
        var gopToken = $.cookie('gopToken');
        var main = $('.phonecharge');
        var phoneInput = $('#phonecharge-text-input');

        var touchSlideDefaultIndex = 0;

        var focusTimer = null;
        var jsoncards = { // 各种充值卡
            '联通': [],
            '移动': [],
            '电信': [],
        };
        var jsonflows = { // 流量充值
            '联通': [],
            '移动': [],
            '电信': [],
        };
        var gopPrice = [];
        var curPhone;
        //获取以往手机号
        api.phoneLastest({
            gopToken: gopToken
        }, function(data) {
            if (data.status == 200) {
                vm.list = data.data.phoneList;
            } else {
                console.log(data);
            }
        });
        //果仁现价
        api.price({
            gopToken: gopToken
        }, function(data) {
            if (data.status == '200') {
                gopPrice.push(data.data.price);
            }
        });

        //获取流量列表  联通 移动 电信
        var phoneJson = {
            i: 0,
            init: function() {
                this.getFlowsList();
                this.getCardsList();
            },
            todo: function() {
                this.i++;
                if (this.i === 2) {
                    this.getUserPhoneCarrier();
                } else {
                    return;
                }
            },
            //获取流量
            getFlowsList: function() {
                api.productList({
                    productType: "SHOUJILIULIANG"
                }, function(data) {
                    if (data.status == 200) {
                        // console.log('获取流量列表');
                        data.data.productList.forEach(function(item) {
                            var desc = JSON.parse(item.extraContent);
                            jsonflows[desc.carrier].push({
                                id: item.id, // 商品id
                                level: desc.level, // 流量数M
                                price: desc.price, // 下划线价格
                                use: item.price, // 支付按钮价格
                                desc: item.productDesc, // 描述
                            });
                        });
                        phoneJson.todo();
                    } else {
                        console.log(data);
                    }
                });
            },
            //获取话费
            getCardsList: function() {
                api.productList({
                    productType: "SHOUJICHONGZHIKA"
                }, function(data) {
                    if (data.status == 200) {
                        // console.log('获取话费列表');
                        data.data.productList.forEach(function(item) {
                            var desc = JSON.parse(item.extraContent);
                            jsoncards[desc.carrier].push({
                                id: item.id, // 商品id
                                currency: item.currency, // 货币(RMB)
                                price: desc.price, // 下划线价格
                                use: item.price, // 支付按钮价格
                                desc: item.productDesc, // 描述
                            });
                        });
                        phoneJson.todo();
                    } else {
                        console.log(data);
                    }
                });
            },
            getUserPhone: function(cnfn) { //获取用户 明文 手机号码
                api.info({
                    gopToken: gopToken
                }, function(data) {
                    if (data.status == 200) {
                        cnfn && cnfn(data);
                    }
                });
            },
            getUserCarrier: function(cnfn) { //获取用户手机运营商
                api.phoneInfo({
                    phone: vm.phone
                }, function(data) {
                    if (data.status == 200) {
                        cnfn && cnfn(data);
                    }
                });
            },
            getUserPhoneCarrier: function() {
                phoneJson.getUserPhone(function(data) { //获取用户手机号
                    if (data.status == 200) {
                        vm.phone = curPhone = data.data.phone;
                        phoneJson.getUserCarrier(function(data) { // 获取手机运营商
                            if (data.status == 200) {
                                vm.carrier = data.data.carrier;
                                setFlowsWorld(data.data.carrier);
                                vm.goods = jsoncards[data.data.carrier.substr(-2)];
                                vm.flows = jsonflows[data.data.carrier.substr(-2)];
                                if (data.data.carrier.indexOf(datajson.carrier) != -1) { //是优惠的运营商
                                    // 选中话费
                                    if (datajson.cangory === '话费') {
                                        jsoncards[data.data.carrier.substr(-2)].every(function(item, index) {
                                            if (!datajson.price) {
                                                return false;
                                            };
                                            if (item.price != datajson.price) {
                                                return true;
                                            } else {
                                                vm.confirmId = item.id;
                                                vm.confirmCangory = datajson.cangory;
                                                confirmData[0] = item;
                                                vm.button = '支付：' + filters.floorFix(item.use) + '元';
                                                $('.phonecharge-lista-item').eq(index).addClass('cur').siblings().removeClass('cur');
                                                return false;
                                            }
                                        });
                                    } else {
                                        jsonflows[data.data.carrier.substr(-2)].every(function(item, index) {
                                            if (!datajson.level) {
                                                return false;
                                            };
                                            if (item.level != datajson.level) {
                                                return true;
                                            } else {
                                                vm.confirmId = item.id;
                                                vm.confirmCangory = datajson.cangory;
                                                confirmData[1] = item;
                                                vm.button = '支付：' + filters.floorFix(item.use) + '元';
                                                $('.phonecharge-listb-item').eq(index).addClass('cur').siblings().removeClass('cur');
                                                return false;
                                            }
                                        });
                                    }
                                }
                            } else {
                                getUserPhoneCarrier();
                            }
                        });
                    } else {
                        getUserPhoneCarrier();
                    }
                });
            },
        };

        phoneJson.init();

        //提交时存放数据
        var confirmData = [];

        var checkTimer = null; // 用于手机校验的定时器

        var vm = avalon.define({
            $id: 'phonecharge',
            bannerImgArr: [],
            phone: '',
            cancelBool: false,
            carrier: '', // 运营商
            confirmId: '', // 提交时商品ID
            confirmCangory: '', // 提交时商品类型  话费 流量
            flowsworld: '', //流量充值描述文字
            goodsFlag: true,
            closeBool: true,
            input: function() { // 手机号输入
                // clearTimeout(focusTimer);
                if (!vm.cancelBool) {
                    vm.closeBool = true;
                } else {
                    vm.closeBool = false;
                }
                clearTimeout(checkTimer);
                checkTimer = setTimeout(function() {
                    if (check.phone(vm.phone).result) {
                        api.phoneInfo({
                            phone: vm.phone
                        }, function(data) {
                            if (data.status == 200) {
                                phoneInput[0].blur();
                                curPhone = vm.phone;
                                vm.carrier = data.data.carrier;
                                setFlowsWorld(data.data.carrier);
                                vm.goods = jsoncards[data.data.carrier.substr(-2)];
                                vm.goodsFlag = true;
                                vm.closeBool = true;
                                vm.focusing = false;
                                vm.flows = jsonflows[data.data.carrier.substr(-2)];
                            } else {
                                $.alert(data.msg);
                            }
                        });
                    } else {
                        vm.flowsworld = '';
                        vm.goodsFlag = false;
                        // vm.goods = [];
                        // vm.flows = [];
                        vm.carrier = '';
                        vm.button = '支付';
                        if (vm.phone.length === 11) {
                            $.alert("手机号码不正确");
                            $(this).blur();
                            clearTimeout(focusTimer);
                            vm.cancelBool = true;
                            vm.focusing = true;
                            vm.closeBool = true;
                        }
                    }
                }, 500);
            },
            focusing: false, // 焦点在输入框
            focus: function() { // 获取焦点
                vm.cancelBool = true;
                vm.focusing = true;
                vm.closeBool = true;
                if (vm.phone == curPhone || check.phone(vm.phone).result || vm.phone.length == 11) {
                    vm.phone = '';
                    phoneInput.val('');
                    vm.button = '支付';
                }
                vm.carrier = '';
                clearTimeout(focusTimer);
                vm.goodsFlag = false;
                $(".phonecharge-lista-item").removeClass('cur');
                confirmData[0]=null;

                $(".phonecharge-listb-item").removeClass('cur');
                confirmData[1]=null;
            },
            /*blur: function() { // 失去焦点
             var inputVal = $("#phonecharge-text-input").val();
             if (inputVal) {

             } else {
             $("#phonecharge-text-input").val(curPhone);
             vm.phone = curPhone;
             }
             // $("#phonecharge-text-input").val(!$(this).value&& $(this).value.length ? curPhone : $(this).value ) ;
             vm.input();
             vm.cancelBool = false;
             vm.closeBool = true;
             clearTimeout(focusTimer);
             focusTimer = setTimeout(function() {
             vm.focusing = false;
             }, 300);
             },*/
            close: function() { // 输入框清除
                setTimeout(function() {
                    vm.phone = '';
                    vm.goodsFlag = false;
                    vm.focusing = true;
                    vm.button = '支付';
                    confirmData = [];
                    phoneInput.focus();
                    phoneInput.val('').get(0).focus();
                }, 300);
            },
            cancel: function() {
                vm.cancelBool = false;
                vm.focusing = false;
                vm.closeBool = true;
                vm.button = '支付';
                $(".phonecharge-lista-item").removeClass('cur');
                $(".phonecharge-listb-item").removeClass('cur');
                confirmData[0]=null;
                confirmData[1]=null;
                phoneInput.blur();
                vm.input();
            },
            list: [], // 历史充值号码列表
            listClick: function(e) { // 选择历史号码
                e.preventDefault();
                e.stopPropagation();
                vm.phone = this.innerHTML.replace(/ /g, '');
                vm.input();
                vm.focusing = false;
            },
            listDelete: function(item, remove) { // 历史号码删除
                api.phoneDelete({
                    gopToken: gopToken,
                    phoneSet: [item]
                }, function(data) {
                    if (data.status == 200) {
                        remove();
                    } else {
                        $.alert(data.msg);
                    }
                });
            },
            listClean: function(e) { // 历史号码清空
                e.preventDefault();
                e.stopPropagation();
                api.phoneDelete({
                    gopToken: gopToken,
                    phoneSet: vm.list.$model
                }, function(data) {
                    if (data.status == 200) {
                        vm.list.clear();
                        vm.phone = '';
                        vm.goodsFlag = false;
                        vm.focusing = true;
                        vm.button = '支付';
                        confirmData = [];
                    } else {
                        $.alert(data.msg);
                    }
                });
            },
            goods: [], // 话费列表
            goodsClick: function(ev) { // 支付点击
                var item = $(ev.target).closest('.phonecharge-lista-item');
                if (item.length && vm.goodsFlag) {
                    item.addClass('cur').siblings().removeClass('cur');
                    confirmData[0] = vm.goods[item.index()].$model;
                    vm.confirmId = confirmData[0].id;
                    vm.confirmCangory = '话费';
                    vm.button = '支付：' + filters.fix(confirmData[0].use) + '元';
                    // floorFix用于果仁数量  fix用于人民币
                }
            },
            flows: [], // 流量列表
            flowsClick: function(ev) {
                var item = $(ev.target).closest('.phonecharge-listb-item');
                if (item.length && vm.goodsFlag) {
                    item.addClass('cur').siblings().removeClass('cur');
                    confirmData[1] = vm.flows[item.index()].$model;
                    vm.confirmId = confirmData[1].id;
                    vm.confirmCangory = '流量';
                    vm.button = '支付：' + filters.fix(confirmData[1].use) + '元';
                }
            },
            button: '支付', // 按钮显示
            buttonClick: function() {
                // 按钮点击
                if ($(this).hasClass('disabled')) {
                    return;
                }
                if (vm.confirmCangory === '话费') {
                    api.phoneRecharge({
                        gopToken: gopToken,
                        productId: vm.confirmId,
                        phone: vm.phone
                    }, function(data) {
                        if (data.status == 200) {
                            setTimeout(function() {
                                window.location.href = get.add('order.html', {
                                    // 跳到公共订单页 build/order.html?from=phonecharge&id=1525
                                    from: 'phonecharge',
                                    id: data.data.consumeOrderId
                                });
                            }, 1000 / 60);
                        } else {
                            $.alert(data.msg);
                        }
                    });
                } else {
                    api.phoneTraffic({
                        gopToken: gopToken,
                        productId: vm.confirmId,
                        phone: vm.phone
                    }, function(data) {
                        if (data.status == 200) {
                            setTimeout(function() {
                                window.location.href = get.add('order.html', {
                                    // 跳到公共订单页 build/order.html?from=phonecharge&id=1525
                                    from: 'phonecharge',
                                    id: data.data.consumeOrderId
                                });
                            }, 1000 / 60);
                        } else {
                            $.alert(data.msg);
                        }
                    });
                }
            }
        });

        var href = decodeURIComponent(window.location.href);
        var datajson = {};
        //是否从优惠入口进来  显示流量或话费选项卡
        if (href.indexOf('from=home') > -1) {
            href.substring(href.indexOf('from=home')).split('&').forEach(function(item) {
                var itemarr = item.split('=');
                datajson[itemarr[0]] = itemarr[1];
            });
            if (datajson.cangory === '话费') {
                touchSlideDefaultIndex = 0;
            } else {
                touchSlideDefaultIndex = 1;
            }
        }
        //设置 流量的描述
        var setFlowsWorld = function(carrier) {
            if (carrier.indexOf('联通') > 0) {
                vm.flowsworld = '';
                // vm.flowsworld = '同面值每月限充5次，不同面值产品可叠加1次';
            } else if (carrier.indexOf('移动') > 0) {
                vm.flowsworld = '移动用户每月最后一天办理，下月生效';
            } else {
                vm.flowsworld = '';
            }
        };
        var slideEvent = function() {
            vm.button = '支付';
            for (var i = 0; i < 2; i++) {
                if (titles.eq(i).hasClass('on') && confirmData[i]) {
                    vm.button = '支付：' + filters.fix(confirmData[i].use) + '元';
                    vm.confirmId = confirmData[i].id;
                    vm.confirmCangory = (i === 0 ? '话费' : '流量');
                }
            }
        };
        //左右滑动判断状态
        var titles = $('.phonecharge-body-title-layer');

        $('#touchSlide')[0].onclick = function() {
            slideEvent();
        };
        $('#touchSlide')[0].ontouchend = function() {
            slideEvent();
        };

        touchsliderBanner.touchsliderFn({
            slideCell: '#touchSlide',
            autoPlay: false,
            mainCell: '.phonecharge-body-content-lists',
            titCell: '.phonecharge-body-title-layer',
            defaultIndex: touchSlideDefaultIndex,
            effect: 'left',
        });
        // 轮播图
        api.static(function(data) {
            if (data.status == 200) {
                data.data.consumeSlideAds.filter(function(val, index, arr) {
                    if (val.sources.indexOf('h5') != -1) {
                        vm.bannerImgArr.push(val);
                    }
                });
                touchsliderBanner.touchsliderFn({
                    slideCell: '#touchSlidephonecharge',
                });
            }
        });
        //点击空白地方input失去焦点
        $(document)[0].ontouchend = function(e) {
            e = window.event || e;
            obj = e.srcElement ? e.srcElement : e.target;
            var className = obj.className;
            if (className.indexOf("phonecharge-text-input") < 0 && className.indexOf("text-close") < 0) {
                var inputVal = $("#phonecharge-text-input").val();
                if (!inputVal) {
                    $("#phonecharge-text-input").val(curPhone);
                    vm.phone = curPhone;
                }
                vm.cancelBool = false;
                vm.closeBool = true;
                clearTimeout(focusTimer);
                focusTimer = setTimeout(function() {
                    vm.focusing = false;
                }, 300);
            }
        };

        setTimeout(function() {
            main.addClass('on');
        }, 100);

        avalon.scan(main.get(0), vm);
        return;
    });
});