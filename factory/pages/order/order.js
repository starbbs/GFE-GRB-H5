// 张树垚 2016-01-09 14:29:10 创建
// H5微信端 --- page-order 订单 
// 此页面包含  支付浮层h5-dialog-paypass.js(实名认证，密码设置，锁定次数5-10次)


require([
    'h5-login-judge', 'h5-api', 'get', 'router',
    'h5-view', 'h5-view-bill',
    'h5-price', 'h5-ident', 'h5-component-bill',
    'h5-dialog-paypass', 'filters', 'h5-order-judge', 'h5-dialog-confirm', 'url', 'h5-view-coupon',
    'h5-weixin', 'h5-paypass-judge-auto'
], function(loginJudge, api, get, router,
    View, billView,
    price, H5Ident, H5Bill,
    dialogPaypass, filters, orderJudge, dialogConfirm, url, CouponJSON) {
    loginJudge.check(function() {
        //do notheing
        router.init(true);

        var main = $('.order');
        var gopToken = $.cookie('gopToken');
        var identInput = $('#order-ident');

        var vm = avalon.define({
            $id: 'order',
            hasBill: false, //是否已经生成定单
            money: 0, // RMB总金额
            phone: '', // 要发送验证码的电话
            productDesc: '', // 订单内容
            productRealPrice: 0, // 真实价格
            gopPrice: 0, // 果仁实时价
            gopNum: 0, // 果仁数
            gopIfUse: true, // 使用果仁数
            gopUse: 0, // 使用多少果仁
            orderCode: '',
            couponRmbNum: 0, //优惠券RMB
            couponRmbName: '', //优惠券名称
            moneyUse: 0, //实付金额
            voucherId: '', //优惠券id
            confirmCangory: '', // 消费类型 话费 || 流量
            confirmId: '', // 消费商品的ID
            confirmPhone: '', //消费商品充值的手机号码
            consumeOrderId: '', // 帐单查询的ID
            /*
             gopClick: function() { // 果仁点击
             vm.gopIfUse = !vm.gopIfUse;
             if (vm.gopIfUse) {
             vm.gopExchange();
             } else {
             vm.rmbUse = vm.money;
             }
             },
             */
            gopMoney: 0, //所用果仁折合人民币
            gopExchange: function() { // 换算gopMoney
                //vm.gopNum 小数点后为数据库返回的六位小数
                if (vm.gopNum * vm.gopPrice >= vm.money) { // 够支付
                    // vm.rmbUse = 0;
                    if (vm.couponRmbName === "无可用现金抵扣券") { //没有优惠券
                        vm.gopUse = vm.money / vm.gopPrice;
                        vm.gopMoney = vm.money;
                    } else {
                        var gopUse = vm.money / vm.gopPrice - vm.couponRmbNum / vm.gopPrice;
                        vm.gopUse = gopUse <= 0 ? 0 : gopUse;
                    }
                    // vm.ifConfirmPay = true;
                } else {
                    // vm.rmbUse = vm.money - vm.gopNum * vm.gopPrice;
                    var gopUse = vm.money / vm.gopPrice - vm.couponRmbNum / vm.gopPrice;
                    vm.gopUse = gopUse <= 0 ? 0 : gopUse;
                    vm.gopMoney = vm.gopNum * vm.gopPrice;
                    // vm.ifConfirmPay = false;
                }
            },
            // ifConfirmPay: false,
            confirmPay: function() { // 确认支付
                // 确认支付   orderJudge.KWQ_checkRMB(定单所有RMB数 , 优惠券RMB数(可以不传) , 回调函数)
                orderJudge.KWQ_checkRMB(filters.fix(vm.money), vm.couponRmbNum, function(status, gopPrice, myGopNum) {
                    // status = 'gopNumNo';
                    if (status == 'gopNumOk') {
                        if (vm.hasBill) {
                            console.log('已经生成过定单了');
                            paypassShow();
                        } else {
                            console.log('还没生成过定单了');
                            createBill(paypassShow);
                        }
                    } else {
                        dialogConfirm.set('您的果仁不足是否购买？',{okBtnText:'是',cancelBtnText:"否"});
                        dialogConfirm.show();
                        dialogConfirm.onConfirm = function() {
                            window.localStorage.setItem('from', url.basename);
                            window.localStorage.setItem('id', get.data.id);
                            window.location.href = 'purchase.html#!/';
                        };
                    }
                });
            },
            couponClick: function() {
                router.go('/coupon-list');
            }
        });
        //列表点击事件
        CouponJSON.couponListView.VM.onClickFn = function(ev) {
            var target = $(ev.target).closest('.coupon-list-li');
            if (target.length) {
                var json = target.get(0).dataset;
                if (json.voucherstatus === 'AVAILABLE') {
                    vm.couponRmbName = json.voucherstatus === 'AVAILABLE' ? json.vouchername : '无可用现金抵扣券';
                    vm.moneyUse = (vm.money - json.voucheramount) <= 0 ? 0 : (vm.money - json.voucheramount);
                    vm.couponRmbNum = json.voucheramount;
                    vm.voucherId = json.voucherid;
                    vm.gopExchange();
                    // router.to('/');
                    window.history.back(-1);
                }
            }
        };

        document.title = {
            phonecharge: '订单-手机充值', // 来自手机充值
            loverelay: '订单-爱心接力', // 来自爱心接力
        }[get.data.from] || '果仁宝-订单'; // 未知来源

        billView.onFinish = function() { // 返回首页点击时露底问题
            main.hide();
        };

        // 支付并跳转bill 分页
        var paypassShow = function() {
            dialogPaypass.show();
            //支付浮层消失的回调
            dialogPaypass.vm.callback = function(value) {
                // 支付密码校验成功
                api.pay({
                    gopToken: gopToken, // token
                    useGop: vm.gopIfUse, // 是否使用果仁
                    consumeOrderId: vm.consumeOrderId, // 订单id
                    // identifyingCode: identInput.val(), // 短信验证码
                    // bankCardId: vm.bankid, // 银行卡id  4-11去除银行卡支付后可随便写ID
                    bankCardId: 12,
                    payPassword: value, // 支付密码
                    bill99ValidCode: '803585',
                    bill99token: '1330872',
                    voucherId: vm.voucherId
                }, function(data) {
                    if (data.status == 200) {
                        router.to('/bill');
                        billView.set('PAY', vm.consumeOrderId, {
                            // forceStatus: 'PROCESSING',
                            ifFinishButton: true,
                            waitForPayMoney: '', // 取消等待支付
                            //orderMoney: vm.gopMoney, // 加入订单金额
                            //ifTip: true,
                            //tip: '预计15分钟内到账, 请稍后查看账单状态<br>如有疑问, 请咨询',
                        });
                    } else {
                        $.alert(data.msg);
                    }
                });
            }
        };

        // 创建账单
        var createBill = function(dbfn) {
            if (vm.confirmCangory === '话费') {
                api.phoneRecharge({
                    gopToken: gopToken,
                    productId: vm.confirmId,
                    phone: vm.confirmPhone
                }, function(data) {
                    if (data.status == 200) {
                        vm.hasBill = true;
                        vm.consumeOrderId = data.data.consumeOrderId;
                        dbfn && dbfn();
                    } else {
                        $.alert(data.msg);
                    }
                });
            } else {
                api.phoneTraffic({
                    gopToken: gopToken,
                    productId: vm.confirmId,
                    phone: vm.confirmPhone
                }, function(data) {
                    if (data.status == 200) {
                        vm.hasBill = true;
                        vm.consumeOrderId = data.data.consumeOrderId;
                        dbfn && dbfn();
                    } else {
                        $.alert(data.msg);
                    }
                });
            }
        };

        // bill            根据定单ID   优惠券 商品信息 价格
        // phonecharge     根据商品ID   优惠券 商品信息 价格
        var getDataFromBill = function() {
            if (get.data.id) { // 有订单ID, 跳转订单详情
                vm.consumeOrderId = get.data.id;
                billView.set('PAY', get.data.id, {
                    onRequest: function(data) {
                        if (data.status == 200) {
                            var order = data.data.consumeOrder; // 订单信息
                            var product = data.data.product; // 产品信息
                            var record = data.data.recordList; // 付款记录
                            var availableVoucher = data.data.availableVoucher; //最大可用代金券
                            if (order.status === 'PROCESSING' && !record.length) { // 进行中(未付款)
                                // 打开页面
                                router.to('/');
                                setTimeout(function() {
                                    main.addClass('on');
                                }, 100);
                                // 刷新数据
                                vm.productDesc = product.productDesc;
                                vm.money = order.orderMoney;
                                vm.gopPrice = data.data.gopPrice;
                                vm.gopNum = data.data.gopNum;
                                // vm.productRealPrice = JSON.parse(product.extraContent).price;
                                vm.orderCode = order.orderCode;
                                vm.couponRmbName = availableVoucher ? availableVoucher.voucherName : "无可用现金抵扣券";
                                vm.couponRmbNum = availableVoucher ? availableVoucher.voucherAmount : 0;
                                vm.moneyUse = vm.couponRmbName === "无可用现金抵扣券" ? vm.money : (vm.money - availableVoucher.voucherAmount > 0 ? vm.money - availableVoucher.voucherAmount : '0.00');
                                vm.voucherId = availableVoucher ? availableVoucher.id : '';
                                vm.hasBill = true;
                                vm.gopExchange();
                                api.getselloneprice({}, function(data) {
                                    vm.gopPrice = data.optimumSellPrice;
                                    vm.gopExchange();
                                })
                            } else { // 失败, 成功, 进行中(已付款)
                                router.to('/bill');
                            }
                        } else {
                            $.alert(data.msg);
                        }
                    },
                });
            } else {
                $.alert('缺少订单号');
            }
        };

        var getDataFromPhonecharge = function() {
            if (get.data.id) {
                var index = 0;
                vm.confirmId = get.data.id;
                vm.confirmPhone = get.data.phone;

                // 商品详情
                api.getProductInfor({
                    'gopToken': gopToken,
                    'productId': get.data.id
                }, function(data) {
                    var productInfor = data.data.product;
                    // 刷新  商品信息数据
                    vm.productDesc = productInfor.productDesc;
                    vm.money = productInfor.price; //商品价钱
                    vm.productRealPrice = productInfor.extraContent.price; // 果仁宝的RMB价格
                    vm.confirmCangory = productInfor.productName.slice(0, 2); //消费商品类别
                    if (index === 3) {
                        vm.gopExchange();
                    };
                    index++;
                    getMaxVoucher();
                });

                // 刷新 最大可用优惠券
               var getMaxVoucher = function(){
	               	api.myOrderVoucherList({
	                    gopToken: gopToken,
	                }, function(data) {
	                    var myOrderVoucherList = data.data.available;
	                    // 最大可用优惠券
	                    var myOrderMaxVoucher = myOrderVoucherList.length && myOrderVoucherList.sort(function(item1, item2) {
	                        return item2.voucherAmount - item1.voucherAmount;
	                    })[0];
	
	                    vm.couponRmbName = myOrderMaxVoucher ? myOrderMaxVoucher.voucherName : "无可用现金抵扣券"; //优惠券名字
	                    vm.couponRmbNum = myOrderMaxVoucher ? myOrderMaxVoucher.voucherAmount : 0; // 优惠券 金额
	                    vm.moneyUse = vm.couponRmbName === "无可用现金抵扣券" ? vm.money : (vm.money - myOrderMaxVoucher.voucherAmount > 0 ? vm.money - myOrderMaxVoucher.voucherAmount : '0.00'); // 商品价格RMB
	                   vm.voucherId = myOrderMaxVoucher ? myOrderMaxVoucher.id : ''; // 优惠券ID
	                    vm.hasBill = false; //是否已生成账单信号   
	                    if (index === 3) {
	                        vm.gopExchange();
	                    };
	                    index++;
	                });
               } 

                // 获取卖1价
                api.getselloneprice({}, function(data) {
                    vm.gopPrice = data.optimumSellPrice; //果仁现价
                    if (index === 3) {
                        vm.gopExchange();
                    };
                    index++;
                });

                //获取果仁数
                api.getGopNum({
                    gopToken: gopToken,
                }, function(data) {
                    if (data.status == 200) {
                        vm.gopNum = data.data.gopNum;
                        if (index === 3) {
                            vm.gopExchange();
                        };
                        index++;
                    } else {
                        console.log(data);
                    }
                });

                setTimeout(function() {
                    main.addClass('on')
                }, 200);
            } else {
                $.alert('缺少商品单号号');
            }
        };

        var init = function() {
            if (get.data.from === 'bill') {
                getDataFromBill();
                console.log('来自bill,已经生成过定单了');
            } else {
                getDataFromPhonecharge();
                console.log('来自phonecharge，还未生成定单');
            }
        };

        init();

        avalon.scan();



        /*
         var bankSelect = function(bank) { // 处理当前显示
         bank = bank || vm.bankSelect.$model;
         vm.bankSelectName = bank.name;
         vm.bankSelectType = bank.type;
         vm.bankSelectClass = bank.lang;
         vm.bankSelectTail = bank.tail;
         };
         var bankListRefresh = function(list) { // 刷新银行卡列表
         list = H5Bank.dataHandler(list);
         dialogBankcard.vm.list = list.concat();
         vm.bankList = list.concat();
         dialogBankcard.vm.index = vm.bankIndex;
         vm.bankSelect = $.extend({}, vm.bankList.$model[vm.bankIndex]);
         vm.bankid = vm.bankSelect.id;
         bankSelect();
         };
         var bankListReturn = function() {
         vm.bankIndex = dialogBankcard.vm.index;
         vm.bankSelect = $.extend({}, vm.bankList.$model[vm.bankIndex]);
         vm.bankid = vm.bankSelect.id;
         bankSelect();
         };
         */
    });
});