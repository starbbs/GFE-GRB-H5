// 姜晓妮 2016-07-22  创建
// H5微信端 --- 体验果仁


require(['router', 'h5-api', 'h5-weixin','filters','h5-dialog-confirm','mathtool','h5-alert',],function(
	router, api, weixin, filters, dialogConfirm, mathtool
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
			if(flag === "false"){
				api.getselloneprice(function(data) {
					experienceVM.gopNowPrice = data.optimumBuyPrice;
					var gopId = _this.id;
					var gopNum = filters.floorFix(_this.income / experienceVM.gopNowPrice,2);
					var income = _this.income; //领取时的收益
					dialogConfirm.set('<div class="screen-r-popup"> <div class="screen-r-popup-top"> 现在领取收益 <span class="screen-r-popup-top-f"> '+gopNum+'</span> 个果仁（价值 <span class="screen-r-popup-top-f">'+income+'</span>元）将会进入您的账户中，同时您的体验果仁将会被系统回收 </div><div class="screen-r-popup-bottom">确定领取？</div></div>', {okBtnText: '确定', cancelBtnText: "取消"});
					dialogConfirm.show();
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
				});
			}
		}
	});
	//获取卖一价
	var getSellOnePrice = function(){
		api.getselloneprice(function(data) {
			experienceVM.gopNowPrice = data.optimumBuyPrice;
			getData();
		});
	}
	
	//获取后台返回的体验果仁list
	var getData = function(){
		 api.experienceGopList({gopToken:gopToken},function(data){
			 	if(data.status == 200){
			 		//experienceList=data.data.list;			
			 		data.data.list && data.data.list.forEach(function(item){
			 			if(item.status!="WITHDRAW"){
			 				item.gopNum = item.gopNum;
							//收益
							item.income = item.status === 'LOCKED' ? item.getGopPrice*item.getGopNum : (mathtool.reduce(experienceVM.gopNowPrice,item.gopPrice))*item.gopNum;
							
							if(item.validDays < 1 && item.income < 1){
								item.income = data.data.minIncome;
							}
							item.income = filters.ceilFix(item.income,2);
							//判断条件
							item.flag1 = item.validDays>=1;
							item.flag = parseFloat(item.income) <= 0 && item.validDays > 0;
							item.flag2 = parseFloat(item.income) == 0 && item.validDays > 0;
							//收益小数部分计算
							item.gopDecimal = item.income.toString().split(".")[1];
							//收益为负 且 已到期 时收益小数部分
							var minDeci = filters.ceilFix((Math.abs(data.data.minIncome)-Math.abs(parseInt(data.data.minIncome))),2).split(".")[1];
							//+ -
							item.sign = parseFloat(item.income) >= 0 ? '+' : (item.validDays >= 1 ? '-' : '+');
							//收益整数、小数部分显示
							item.incomeInt = item.validDays >= 1 ? (item.income > 0 ? parseInt(item.income) : Math.abs(parseInt(item.income))) : (item.income > 1 ? parseInt(item.income) : parseInt(data.data.minIncome));
							//alert(item.income);
							item.incomeDec = item.validDays >= 1 ? "."+item.gopDecimal : (item.income > 1 ? "."+item.gopDecimal : "."+minDeci);
							//获取价保留两位小数
							item.gopPrice=filters.ceilFix(item.gopPrice,2);
							item.desc = !item.flag1 ? "已到期":(item.status =='LOCKED'?"涨停":"");		
				
							experienceVM.experienceList.push(item);
						}
			 		})
			 	}else{
			 		$.alert(data.msg);
			 	}
			 })
//			list.data.list && list.data.list.forEach(function(item){
//			if(item.status!="WITHDRAW"){
//				//收益
//				item.income = item.status === 'LOCKED' ? item.getGopPrice*item.getGopNum : (experienceVM.gopNowPrice-item.gopPrice)*item.gopNum;
//				if(item.validDays < 1 && item.income < 0){
//					item.income = list.data.minIncome;
//				}
//				//判断条件
//				item.flag1 = item.validDays>=1;
//				item.flag = (experienceVM.gopNowPrice-item.gopPrice) < 0 && item.validDays > 0;
//				item.flag2 = (experienceVM.gopNowPrice-item.gopPrice) == 0 && item.validDays > 0;
//				//收益小数部分计算
//				var deci = Math.abs(item.income)-Math.abs(parseInt(item.income));
//				item.gopDecimal = filters.ceilFix(deci,2).split(".")[1];
//				//收益为负 且 已到期 时收益小数部分
//				var minDeci = filters.ceilFix((Math.abs(list.data.minIncome)-Math.abs(parseInt(list.data.minIncome))),2).split(".")[1];
//				//+ -
//				item.sign = (experienceVM.gopNowPrice-item.gopPrice) >= 0 ? '+' : (item.validDays >= 1 ? '-' : '+');
//				//收益整数、小数部分显示
//				item.incomeInt = item.validDays >= 1 ? (item.income > 0 ? parseInt(item.income) : Math.abs(parseInt(item.income))) : (item.income > 1 ? parseInt(item.income) : parseInt(list.data.minIncome));
//				//alert(item.income);
//				item.incomeDec = item.validDays >= 1 ? "."+item.gopDecimal : (item.income > 1 ? "."+item.gopDecimal : "."+minDeci);
//				//获取价保留两位小数
//				item.gopPrice=filters.ceilFix(item.gopPrice,2);
//				item.desc = !item.flag1 ? "已到期":(item.status =='LOCKED'?"涨停":"");		
//	
//				experienceVM.experienceList.push(item);
//			}
//		})
	}
	getSellOnePrice();
	$(".screen-r").addClass('on');
	avalon.scan();	
});
