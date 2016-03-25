
// 余效俭 2016-01-08 8:58:22 创建
// H5微信端 --- 银行卡验证码


define('h5-bankcard-ident', ['api', 'router', 'h5-view', 'h5-ident', 'h5-text'], function(api, router, View) {
	var gopToken = $.cookie('gopToken');
	var bankcard_ident = new View('bankcard-ident');
	bankcard_ident.on('hide',function(){
		vm.cardNo = '';
		vm.phone = '';
		vm.identifyingCode = '';
	});

	var vm = bankcard_ident.vm = avalon.define({
		$id: 'bankcard-ident',
		cardNo: '',
		bankName: '',
		cardTypeStr: '',
		cardType: '',
		checked: true,
		phone: '',
		phoneStr: '',
		identifyingCode: '',
		callback: $.noop,
		bankcard_add_click: function() {
			if (vm.identifyingCode) {
				console.log(vm.bankName);
				api.bankcardAdd({
					gopToken: gopToken,
					bankName: vm.bankName,
					cardNo: vm.cardNo,
					bankPhone: vm.phone,
					bankType: vm.cardType,
					identifyingCode: vm.identifyingCode
				}, function(data) {
					if (data.status == 200) {
						$.alert('绑定成功');
						vm.callback && vm.callback();
					} else {
						console.log(data);
						$.alert(data.msg);
					}
				});
			} else {
				$.alert('请输入验证码');
			}
		}
	});

	return bankcard_ident;
});