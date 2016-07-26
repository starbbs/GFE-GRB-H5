// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters','h5-dialog-confirm','h5-alert',],function(
	router, api, weixin, filters, dialogConfirm
){
	router.init(true);
	var gopToken = $.cookie('gopToken');
	var experienceVM = avalon.define({
		$id: 'experience',
		gopNowPrice : 0, //果仁现价（取卖一价）
		experienceList:[],
		drawConfirm:function(){
			var li = $(this).parents(".screen-r-middle-menu-li");
			var _this = li.get(0).dataset;
			var flag = _this.flag;
			if(flag){
				var gopId = _this.id;
				var getGopNum = _this.gopnum;//获取过人数
				var getGopPrice = _this.gopprice;//领取时的价格
				var getGopSum = filters.ceilFix(getGopNum*getGopPrice,2); //领取时的收益
				dialogConfirm.set('<div class="screen-r-popup"> <div class="screen-r-popup-top"> 现在领取收益 <span class="screen-r-popup-top-f"> '+getGopSum+'</span> 个果仁（价值 <span class="screen-r-popup-top-f">'+getGopPrice+'</span>元）将会进入您的账户中，同时您的体验果仁将会被系统回收 </div><div class="screen-r-popup-bottom">确定领取？</div></div>', {okBtnText: '确定', cancelBtnText: "取消"});
				dialogConfirm.show();
				//以下是确定事件！！！！！
				dialogConfirm.onConfirm = function () {
					api.experienceGopWithdraw({
					    gopToken:gopToken,				
					    exeprienceGopId:gopId
					},function(data){
						if(data.status==200){
							li.hide();
						}else{
							$.alert(data.msg);
						}
					});
				};	
			}
		}
	});
	api.getselloneprice(function(data) {
		experienceVM.gopNowPrice = data.optimumBuyPrice;
	});
	// experienceList=[];
	// list.data.list && list.data.list.forEach(function(item){
	// 	//if(item.status!="WITHDRAW"){
	// 		item.flag = (item.getGopPrice-item.gopPrice) < 0 && item.validDays > 0;
	// 		//收益小数部分计算
	// 		var deci = Math.abs((item.getGopPrice-item.gopPrice)*item.gopNum)-Math.abs(parseInt((item.getGopPrice-item.gopPrice)*item.gopNum));
	// 		item.gopDecimal = filters.ceilFix(deci,2).split(".")[1];
	// 		//收益为负 且 已到期 时收益小数部分
	// 		var minDeci = filters.ceilFix((Math.abs(list.data.minIncome)-Math.abs(parseInt(list.data.minIncome))),2).split(".")[1];
	// 		//+ -
	// 		item.sign = item.getGopPrice-item.gopPrice >= 0 ? '+' : (item.validDays >= 1 ? '-' : '+');
	// 		//收益整数、小数部分显示
	// 		item.incomeInt = (item.getGopPrice-item.gopPrice)*item.gopNum > 0 ? parseInt((item.getGopPrice-item.gopPrice)*item.gopNum) : (item.validDays >=1 ? Math.abs(parseInt((item.getGopPrice-item.gopPrice)*item.gopNum)) : parseInt(list.data.minIncome));
	// 		//获取价保留两位小数
	// 		item.gopPrice=filters.ceilFix(item.gopPrice,2);
	// 		item.incomeDec = (item.getGopPrice-item.gopPrice)*item.gopNum > 0 ? item.gopDecimal : (item.validDays >= 1 ? item.gopDecimal : minDeci);
	// 		experienceList.push(item);
	// 	//}
	// })


	//有接口后使用，不删！！！！
	api.experienceGopList({gopToken:gopToken},function(data){
		if(data.status==200){
			//experienceList=data.data.list;			
			data.data.list && data.data.list.forEach(function(item){
				if(item.status!="WITHDRAW"){
					item.flag = (item.getGopPrice-item.gopPrice) < 0 && item.validDays > 0;
					//收益
					item.income=(item.getGopPrice-item.gopPrice)*item.gopNum;
					//收益小数部分计算
					var deci = Math.abs(item.income)-Math.abs(parseInt(item.income));
					item.gopDecimal = filters.ceilFix(deci,2).split(".")[1];
					//收益为负 且 已到期 时收益小数部分
					var minDeci = filters.ceilFix((Math.abs(data.data.minIncome)-Math.abs(parseInt(data.data.minIncome))),2).split(".")[1];
					//+ -
					item.sign = item.getGopPrice-item.gopPrice >= 0 ? '+' : (item.validDays >= 1 ? '-' : '+');
					//收益整数、小数部分显示
					item.incomeInt = item.validDays >= 1 ? (item.income > 0 ? parseInt(item.income) : Math.abs(parseInt(item.income))) : (item.income > 1 ? parseInt(item.income) : parseInt(data.data.minIncome));
					//alert(item.income);
					item.incomeDec = item.validDays >= 1 ? item.gopDecimal : (item.income > 1 ? item.gopDecimal : minDeci);
					//获取价保留两位小数
					item.gopPrice=filters.ceilFix(item.gopPrice,2);
					experienceVM.experienceList.push(item);
				}
			})
		}else{
			$.alert(data.msg);
		}
	})
	avalon.scan();	
});
