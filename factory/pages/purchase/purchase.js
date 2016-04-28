// 张树垚 2016-01-04 17:34:09 创建
// H5微信端 --- 买果仁


require([
	'router', 'h5-view', 'h5-price', 'h5-weixin', 'h5-api', 'check', 'filters', 'h5-view-bill',
	'h5-text', 'h5-ident', 'h5-weixin', 'h5-keyboard', 'h5-login-judge-auto'
], function(
	router, View, price, weixin, api, check, filters, billView
) {

	router.init(true);

	var gopToken = $.cookie('gopToken');

	var viewOrder = new View('purchase-order');

	var main = $('.purchase');

	// dialogAlert.set('请输入1-3000整数!');
	// dialogAlert.onAlert();
	var vm = avalon.define({ // 主页面
		$id: 'purchase',
		price: 0, // 果仁实时价
		money: '', // 买入金额
		ifBuy: false, // 是否可购买
		expect: '', // 预计购买
		//buyGopNum:'',
		moneyClear: function() {
			vm.money = '';
			vm.expect = '';
			vm.ifBuy = false;
		},
		buy: function() { // 买入
			if (!vm.ifBuy) {
				return;
			}

			vm.ifBuy = false;
			
			weixin.pay.onSuccess = function(res) {
				price.stop();
				billView.set('BUY_IN', vmOrder.id, {
					forceStatus: 'SUCCESS',
					ifFinishButton: true
				});
				router.to('/bill');
			};
			weixin.pay.onCreate = function(data) {
				vm.money = '';
				var order = data.data.buyinOrder;
				vmOrder.orderMoney = order.orderMoney;
				vmOrder.id = order.id;
				setOrderNum();
				setTimeout(function() {
					router.go('/purchase-order');
				}, 100);
			};
			weixin.pay.create($('#purchase-main-money').val());
		},
		gopBuyValidate: function() {
			if(this.value){
				// console.log(isNaN(this.value));
				if(isNaN(this.value) || this.value === '0.'){//输入框是非数字时 NaN === NaN -> false 用isNaN判断类型是否是数字
					this.value = '';
					$.alert('请输入1~3000内的金额');
				}else{
					this.value = parseInt(this.value);
					vm.ifBuy = check.gopBuyValidate(this.value, vm.price);
					if(vm.ifBuy){
						console.log(vm.price);
						vm.expect = this.value ? filters.floorFix(this.value / vm.price) : '';
					}else{
						this.value = '';
						vm.expect = '';
					}
					
				}	
			}else{
				vm.expect = '';
				vm.ifBuy = false;
			}
		},
	});
	var vmOrder = avalon.define({ // 订单页面
		$id: 'purchase-order',
		id: 0, // 订单ID
		gopNum: 0, // 买入果仁数
		price: 0, // 实时价
		orderMoney: 0, // 订单金额
		click: function() { // 下一步
			weixin.pay.work();
		},
	});
	var setOrderNum = function() {
		vmOrder.gopNum = vmOrder.orderMoney / vmOrder.price;
	};

	avalon.scan();

	price.get(function(next) {
		vm.price = vmOrder.price = next;
		setOrderNum();
	});

	setTimeout(function() {
		main.addClass('on');
	}, 200);
});