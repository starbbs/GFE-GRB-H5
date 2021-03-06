// 余效俭 2016-01-09 20:58:22 创建
// H5微信端 --- 转果仁

require([
	'h5-login-judge', 'h5-api', 'h5-view', 'h5-price', 'get', 'filters', 'h5-component-bill',
	'h5-view-address-mine', 'h5-view-address-wallet', 'h5-view-bill',
	'h5-dialog-paypass', 'h5-dialog-alert', 'h5-view-authentication', 'url', 'h5-dialog-confirm', 'router',
	'h5-paypass-view', 'h5-text', 'h5-weixin', 'h5-paypass-judge-auto',
], function(
	loginJudge, api, View, price, get, filters, H5bill,
	viewAddressMine, viewAddressWallet, billView,
	dialogPaypass, dialogAlert, viewAuthentication, url, dialogConfirm, router
) {
	loginJudge.check(function() {
		var gopToken = $.cookie('gopToken');
		var transfer = $('.transfer');
		var transferTargetView = new View('transfer-target');

		router.init(true);

		//市场添加回调 return true用于下一步按钮是否可用
		viewAddressMine.vm.setSuccess = function() {
			return true;
		};
		//市场删除回调
		viewAddressMine.vm.setDelSuccess = function() {
			return false;
		};
		//删除添加钱包地址后回调
		viewAddressWallet.vm.setSuccess = function(walletListLength) {
			return walletListLength > 0 ? true : false;
		};

		// 转帐首页面
		var vm = avalon.define({
			$id: 'transfer',
			hasWallet: false,
			marketGopAddress: '',
			transferOutType: '',
			gopNum: 0,
			list: [],
			myWalletClick: function() { // 我的钱包
				if (vm.hasWallet) {
					vm.transferOutType = 'ME_WALLET';
					api.walletList({
						gopToken: gopToken
					}, function(data) {
						if (data.status == 200) {
							var nowData = {};
							nowData.name = '我的钱包';
							for (var i = 0; i < data.data.walletList.length; i++) {
								var item = data.data.walletList[i];
								if (!nowData.address) {
									nowData.address = item.address;
									nowData.walletId = item.id;
								}
								if (item.defaultWallet) {
									nowData.address = item.address;
									nowData.walletId = item.id;
									break;
								}
							}
							nowData.serviceFee = '0.01';
							$.extend(transferTarget, nowData);
							targetInit(vm.transferOutType);
							dialogPaypass.vm.cangory = vm.transferOutType;
							router.go('/transfer-target');
						} else {
							console.log(data);
						}
					});
				} else {
					//跳转到钱包地址
					viewAddressWallet.vm.hasStepNext = true;
					viewAddressWallet.vm.callback = function() {
						init();
						vm.transferOutType = 'ME_WALLET';
						api.walletList({
							gopToken: gopToken
						}, function(data) {
							if (data.status == 200) {
								var nowData = {};
								nowData.name = '我的钱包';
								for (var i = 0; i < data.data.walletList.length; i++) {
									var item = data.data.walletList[i];
									if (!nowData.address) {
										nowData.address = item.address;
										nowData.walletId = item.id;
									}
									if (item.defaultWallet) {
										nowData.address = item.address;
										nowData.walletId = item.id;
										break;
									}
								}
								nowData.serviceFee = '0.01';
								$.extend(transferTarget, nowData);
								//targetInit(vm.transferOutType);
								dialogPaypass.vm.cangory = vm.transferOutType;
								targetInit('new_walletaddress_nextstep');
								router.go('/transfer-target');
							} else {
								console.log(data);
							}
						});
					}
					router.go('/address-wallet');
				}
			},
			marketWalletClick: function() { // 果仁市场
				if (vm.marketGopAddress != '') {
					toTransferTarget();
				} else {
					//跳转到设置果仁市场
					viewAddressMine.vm.hasStepNext = false;
					viewAddressMine.vm.callback = function() {
						api.info({
							gopToken: gopToken
						}, function(data) {
							if (data.status == 200) {
								if (data.data.marketGopAddress) {
									toTransferTarget();
								}
							} else {
								console.log(data);
							}
						});
					}
					router.to('/address-mine');
				}
			},
			showAuthenDes: function() {
				dialogAlert.set('为保证您的账户资金安全，请您输入真实姓名，实名信息校验正确后不可更改');
				dialogAlert.show();
			}
		});
		//跳转到转果仁页面的初始化
		var toTransferTarget = function() {
			vm.transferOutType = 'GOP_MARKET';
			vm.gopAddress = vm.marketGopAddress;
			transferTarget.address = vm.marketGopAddress;
			transferTarget.name = '果仁市场';
			transferTarget.isMarket = true;
			transferTarget.serviceFee = '0.01';
			dialogPaypass.vm.cangory = vm.transferOutType;
			router.to('/transfer-target');
		}
		var isOutLength = true;
		var transferTarget = avalon.define({ // 转帐输入金额的部分
			$id: 'transfer-target',
			address: '',
			phone: '',
			name: '未命名地址',
			photo: './images/picture.png',
			gopUserNick: '未命名',
			personId: null,
			walletId: null,
			payPassword: '123456', // 支付密码
			serviceFee: 0.01, // 服务费
			serviceFeeShow: 0.01,
			transferNum: '', // 转果仁数
			gopNum: 0, // 拥有果仁数
			price: 0, // 实价
			cnyMoney: 0, // 约合人民币
			content: '', // 转账说明
			notchecked: true, // 是否没有检验通过
			isMarket: false, // 是否是果仁市场
			flag: true,
			len: 0,
			addressToPhone: '',
			myWallet: false, //以下几个属性用于判断显示隐藏的
			market: false,
			phoneAddr: false,
			walletAddr: false,
			wallet: false,
			gop: false,
			transferDesInputFocus: function() {
				//$('.view').css('top','-100px');
			},
			closeNum: function() {
				transferTarget.transferNum = '';
				transferTarget.cnyMoney = '';
				transferTarget.notchecked = true;
			},
			closeCont: function() {
				transferTarget.content = '';
			},
			checkCnyMoney: function() { //输入 时候判断 果仁数量
				//只允许输入 数字字符
				// clearTimeout(inputTimer);
				$(this).val($(this).val().replace(/[^\d.]/g, ""));
				if (!this.value) {
					return;
				}
//				if ((parseFloat(this.value) === 0 && this.value != '0' && this.value != '0.' && this.value != '0.0') || this.value === '') {
				var reg = new RegExp("^[1-9][0-9]{0,3}\.?[0-9]*$"); //非零开头的整数
				var reg2 = /^0(\.\d*)?$/g; 
				//alert(!reg.test(this.value)+"**"+!reg2.test(this.value));
				if(!reg.test(this.value) && !reg2.test(this.value)){
					// inputTimer = setTimeout(function(){
					$.alert('请输入正确的数量');
					transferTarget.notchecked = true;
					// },800);
					return;
				}
				transferTarget.notchecked = false;
				var whether_include_numrice = this.value.indexOf(".");
				if (whether_include_numrice != -1) {
					if (this.value.substring(whether_include_numrice + 1, whether_include_numrice + 4).length > 2) {
						transferTarget.transferNum = this.value.substring(0, whether_include_numrice + 3);
					}
				}
				transferTarget.cnyMoney = transferTarget.price * this.value;
			},
			//确定转帐按钮
			transferCommitClick: function() {
				var value = parseFloat(transferTarget.transferNum);
				// console.log(transferTarget.notchecked);
				// console.log(typeof transferTarget.transferNum);
				if (transferTarget.notchecked) {
					return;
				}
				var reg = new RegExp("^[1-9][0-9]{0,3}\.?[0-9]*$"); //非零开头的整数
				var reg2 = /^0\.\d+$/g; 
				if(!reg.test(value) && !reg2.test(value) && value <= 0){
					$.alert('请输入正确的数量');
					return;
				}
				var val = transferTarget.content;
				isOutLength = cutString(val);
				if (isOutLength) {
					return;
				}
				if (parseFloat(filters.floorFix(parseFloat($('#address-mine-input-1')[0].value) + parseFloat(transferTarget.serviceFee))) > (parseFloat(transferTarget.gopNum))) {

					dialogConfirm.set('您的果仁不足是否购买？', {
						okBtnText: '是',
						cancelBtnText: "否"
					});
					dialogConfirm.show();
					dialogConfirm.onConfirm = function() {
						window.location.href = 'purchase.html?from=' + url.basename;
					};
					return;
				}

				if (parseFloat(transferTarget.transferNum) > 0 && parseFloat(transferTarget.gopNum - transferTarget.serviceFee)) {
					//密码输入框显示 AJAX密码确认后 设置回调函数
					// setTimeout(function() {
					dialogPaypass.vm.cangory = vm.transferOutType;
					dialogPaypass.show();
					// }, 300)
					//支付浮层  密码确认后回调
					dialogPaypass.vm.callback = function(value) {
						var transferOutType = vm.transferOutType;
						if (vm.transferOutType.indexOf('NEW') > 0) {
							transferOutType = 'NEW';
							if (vm.transferOutType == "GOP_NEW") {
								transferTarget.serviceFee = '0.00';
							} else {
								transferTarget.serviceFee = '0.01';
							}
						}
						api.transfer({
							gopToken: gopToken,
							transferType: transferOutType,
							personId: transferTarget.personId,
							address: transferTarget.address,
							walletId: transferTarget.walletId,
							serviceFee: parseFloat(transferTarget.serviceFee),
							content: transferTarget.content,
							transferNum: parseFloat(transferTarget.transferNum),
							payPassword: value
						}, function(data) { // 转账成功
							//console.log(data);
							if (data.status == 200) {
								
								var nowData = {};
								nowData.successFlag = true;
								if (transferTarget.address) {
									if (transferTarget.address.length == 11) { //手机钱包
										nowData.address = transferTarget.address.substr(0, 3) + '****' + transferTarget.address.substr(7, 4);
									} else { //钱包地址
										nowData.address = transferTarget.address.substr(0, 8) + '**********';
									}
								};
								if (transferTarget.phone) {
									nowData.phone = transferTarget.phone;
								};
								billView.set('TRANSFER_OUT', data.data.transferOutId, {
									ifReturnHome: true
								});
								router.go('/bill');
								//init();
							} else {
								console.log(data);
								$.alert(data.msg);
							}
						});
					};
				} else {
					if (transferTarget.transferNum < 0) {
						$.alert('请输入大于0的数');
					}
					if (transferTarget.gopNum <= 0) {
						$.alert('您的果仁币为0');
					}
				}
			},
		});
		var mbStringLength = function(s) {
			var totalLength = 0;
			var i;
			var charCode;
			for (i = 0; i < s.length; i++) {
				charCode = s.charCodeAt(i);
				if (charCode < 0x007f) {
					totalLength = totalLength + 1;
				} else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
					totalLength += 2;
				} else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
					totalLength += 3;
				}
			}
			return totalLength;
		}
		var cutString = function(s) {
			var len = s.length;
			var codeLen = mbStringLength(s);
			if (codeLen > 40) {
				$.alert("转账说明不能多于10个字");
				return true;
			} else {
				return false;
			}
		}
		var dataHandler = function(data) {
			var result = {
				arr: [],
				other: []
			};
			for (var i in data) {
				if (data.hasOwnProperty(i)) {
					result[i.length === 1 ? 'arr' : 'other'].push({ // 字母放到arr, 其他放到other
						name: i !== 'Other' ? i : '其他',
						list: data[i]
					});
				}
			};
			result.arr.sort(function(a1, a2) {
				return a1.name > a2.name;
			});
			return result.arr.concat(result.other);
		};
		var targetInit = function(transferOutType) {
			transferTarget.transferNum = ''; // 转果仁数
			transferTarget.cnyMoney = 0; // 约合人民币
			transferTarget.content = ''; // 转账说明
			transferTarget.notchecked = true; // 是否没有检验通过
			switch (transferOutType) {
				case 'WALLET_NEW': // 新钱包
					transferTarget.walletAddr = true;
					transferTarget.wallet = true;
					break;
				case 'GOP_NEW': // 新果仁宝
					transferTarget.phoneAddr = true;
					transferTarget.gop = true;
					break;
				case 'WALLET_CONTACT': //钱包联系人
					transferTarget.walletAddr = true;
					transferTarget.wallet = true;
					break;
				case 'GOP_CONTACT': // 果仁宝联系人
					transferTarget.phoneAddr = true;
					transferTarget.gop = true;
					break;
				case 'GOP_MARKET': // 果仁市场
					transferTarget.market = true;
					transferTarget.wallet = true;
					break;
				case 'ME_WALLET': // 我的钱包
					transferTarget.myWallet = true;
					transferTarget.wallet = true;
					break;
				case 'new_walletaddress_nextstep': // 我的钱包
					transferTarget.myWallet = true;
					transferTarget.wallet = true;
					break;
			}
			getprice();
		};
		var getprice = function() { // 获取当前卖一价
			api.getselloneprice(function(data) {
				transferTarget.price = data.optimumBuyPrice;
			});
		};

		//初始化 检测有无  钱包地址   市场地址
		var init = function() {
			api.info({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					//果仁市场地址
					data.data.marketGopAddress && (vm.marketGopAddress = data.data.marketGopAddress); 
					//果仁市场地址。null或空字符串都表示未设置
					data.data.hasWallet && (vm.hasWallet = data.data.hasWallet); 
					
					getCangory();
				} else {
					console.log(data);
				}
			});
			api.getGopNum({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					if (data.data.gopNum) {
						transferTarget.gopNum = vm.gopNum = filters.floorFix(data.data.gopNum); //果仁数量
					}
				} else {
					console.log(data);
				}
			})
			refresh_list();
		};
		var getCangory = function() {
//			if (get.data.cangory) {
//				switch (get.data.cangory) {
//					case 'ME_WALLET':
//						vm.myWalletClick();
//						targetInit('ME_WALLET');
//						break;
//					case 'GOP_MARKET':
//						targetInit('GOP_MARKET');
//						vm.marketWalletClick();
//						break;
//				}
//				// router.go('/transfer-target');
//			} else {
//				router.go('/');
//				console.log('转帐选项页');
//			}
			targetInit('GOP_MARKET');
			vm.marketWalletClick();
			dialogPaypass.vm.cangory = vm.transferOutType;

		};
		var refresh_list = function() {
			api.transferRecent({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					data.data.transferOutList.forEach(function(item, index) {
						item.name = !item.name ? H5bill.transferNoNames[item.type] : item.name
					});
					vm.list = data.data.transferOutList;
				} else {
					console.log(data);
				}
			});
		};
		avalon.scan();

		transferTargetView.on("hide", function() {
			dialogPaypass.hide();
			transferTarget.transferNum = '';
			$('.transfer-target-box .text-input').val('');
		});
		transferTargetView.on("show", function() {
			transferTarget.transferNum = '';
			$('.transfer-target-box .text-input').val('');
			transferTargetView.self.get(0).scrollTop = 0; // 显示时滚回顶部
		});
		
		setTimeout(function(){
			init();
		},200);
	});
});