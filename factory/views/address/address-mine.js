// 余效俭 2016-01-11 17:26:56 创建
// 魏冰冰 2016-06-01          修改
// H5微信端 --- 我的
define('h5-view-address-mine', ['router', 'h5-api', 'h5-view', 'check', 'url','h5-dialog-confirm', 'h5-alert', 'h5-text'],
    function(router, api, View, check, url, dialogConfirm) {
        var gopToken = $.cookie('gopToken');
        var address_mine = new View('address-mine');
        var vm = address_mine.vm = avalon.define({
            $id: 'address-mine',
            hasStepNext: false, //是否有下一步跳转
            hasMarketAddress: false, //是否有果仁市场地址标志
            setMarketAddress: false, //正在设置果仁市场地址标志
            marketGopAddress: '', //果仁市场地址
            callback: $.noop,
            setSuccess: $.noop,
            setDelSuccess: $.noop,
            address_mine_next: function() { //返回
                if (vm.callback) {
                    vm.callback();
                }
            },
            marketAddress_add_click: function() { //添加果仁市场  按钮
                vm.setMarketAddress = true;
            },
            marketAddress_save_click: function() { //添加果仁市场  事件
                if (check.empty(vm.marketGopAddress)) {
                    $.alert('请输入果仁市场地址!');
                    return false;
                }
                if (vm.marketGopAddress.indexOf('GOP') < 0) {
                    $.alert('果仁市场地址格式错误!');
                    return false;
                }
                api.marketAdd({
                    gopToken: gopToken,
                    gopMarketAddress: vm.marketGopAddress
                }, function(data) {
                    if (data.status == 200) {
                        //$.alert('设置成功!');
                        // vm.hasStepNext = !url.filename.match(/mine\.html/g) ? true : false;
                        vm.hasMarketAddress = true;
                        vm.setMarketAddress = false;
                        vm.hasStepNext = vm.setSuccess && vm.setSuccess();
                    } else {
                        console.log(data);
                        $.alert(data.msg)
                    }
                });
            },
            marketAddress_del_click: function() { //删除果仁市场地址
            		var _this = this;
            		dialogConfirm.set('删除后可重新添加果仁市场地址 确定删除？',{okBtnText:'删除',cancelBtnText:"取消"});
                dialogConfirm.show();
                dialogConfirm.onConfirm = function() {
	                api.marketDel({
	                    gopToken: gopToken
	                }, function(data) {
	                    if (data.status == 200) {
	                        $.alert('删除成功!');
	                        vm.marketGopAddress = '';
	                        $('#address-mine-input-focusa').val('');
	                        $(_this).parent('.address-item').removeClass('del');
	                        vm.hasMarketAddress = false;
	                        // vm.hasStepNext = false;
	                        vm.hasStepNext = vm.setDelSuccess && vm.setDelSuccess();
	                    } else {
	                        console.log(data);
	                    }
	                });
                };
            },
            transferToMarket: function(){
            		if(vm.hasMarketAddress){
            			window.location.href = "transfer.html?cangory=GOP_MARKET";
            		}
            }
        });



        $(document).on('swipeLeft', '.address-item', function() {
            $(this).addClass('del');
        });
        $(document).on('swipeRight', '.address-item', function() {
            $(this).removeClass('del');
        });
        address_mine.on("hide", function() {
            $(".address-item").removeClass('del top');
            //vm.setMarketAddress=false;
        });
        address_mine.on("show", function() {
            //$(".address-item").removeClass('del top');
            //vm.setMarketAddress=false;
        });
        return address_mine;
    });