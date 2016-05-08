// 余效俭 2016-01-09 20:58:22 创建
// H5微信端 --- 转果仁


require([
	'router', 'h5-api', 'h5-view', 'h5-price', 'get', 'filters', 'h5-component-bill',
	'h5-view-address-mine', 'h5-view-address-wallet', 'h5-view-bill',
	'h5-dialog-paypass', 'h5-dialog-alert', 'h5-view-authentication', 'h5-paypass-view',
	'h5-text', 'h5-weixin', 'h5-paypass-judge-auto', 'h5-login-judge-auto'
], function(
	router, api, View, price, get, filters, H5bill,
	viewAddressMine, viewAddressWallet, billView,
	dialogPaypass, dialogAlert, viewAuthentication
) {

	var gopToken = $.cookie('gopToken');
	var transfer = $('.transfer');

	var transferNewView = new View('transfer-new');
	var transferContactsView = new View('transfer-contacts');
	var transferTargetView = new View('transfer-target');

	router.init(true);

	var vm = avalon.define({
		$id: 'transfer',
		hasWallet: false,
		marketGopAddress: '',
		transferOutType: '',
		gopNum: 0,
		list: [],
		/*newTargetClick: function() { // 新目标
			vm.transferOutType = 'NEW';
			transferNew.newTarget = '';
			router.go('/transfer-new');
		},*/
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
							targetInit('new_walletaddress_nextstep');
							router.go('/transfer-target');
						} else {
							console.log(data);
						}
					});
					//targetInit(vm.transferOutType);
					//targetInit('new_walletaddress_nextstep');
					//router.go('/transfer-target');
				}
				router.go('/address-wallet');
			}
		},
		marketWalletClick: function() { // 果仁市场
			if (vm.marketGopAddress != '') {
				vm.transferOutType = 'GOP_MARKET';
				vm.gopAddress = vm.marketGopAddress;
				transferTarget.address = vm.marketGopAddress;
				transferTarget.name = '果仁市场';
				transferTarget.isMarket = true;
				transferTarget.serviceFee = '0.01';
				targetInit(vm.transferOutType);
				router.go('/transfer-target');
			} else {
				//跳转到设置果仁市场
				viewAddressMine.vm.hasStepNext = true;
				viewAddressMine.vm.callback = function() {
					api.info({
						gopToken: gopToken
					}, function(data) {
						if (data.status == 200) {
							if (data.data.marketGopAddress) {
								vm.marketGopAddress = data.data.marketGopAddress; //果仁市场地址
								vm.transferOutType = 'GOP_MARKET';
								vm.gopAddress = vm.marketGopAddress;
								transferTarget.address = vm.marketGopAddress;
								transferTarget.name = '果仁市场';
								transferTarget.isMarket = true;
								transferTarget.serviceFee = '0.01';
								targetInit(vm.transferOutType);
								router.go('/transfer-target');
							}
						} else {
							console.log(data);
						}
					});
				}
				router.go('/address-mine');
			}
		},
		/*
		gopContactClick: function() { // 果仁宝联系人
			vm.transferOutType = 'GOP_CONTACT';
			transferTarget.serviceFee = '0.00';
			router.go('/transfer-contacts');
			transferContacts.query();
		},
		*/
		/*
		walletContactClick: function() { // 钱包联系人
			vm.transferOutType = 'WALLET_CONTACT';
			transferTarget.serviceFee = '0.01';
			router.go('/transfer-contacts');
			transferContacts.query();
		},
		*/
		/*
		transferClick: function(event) { // 最近联系人
			var item = vm.list.$model[$(event.target).closest('.transfer-item').get(0).dataset.index];
			vm.transferOutType = item.type;
			if(vm.transferOutType === 'WALLET_CONTACT' || vm.transferOutType ==='GOP_MARKET'){
				transferTarget.serviceFee = '0.01';
			}
			if(vm.transferOutType === 'GOP_CONTACT' ){
				transferTarget.serviceFee = '0.00';
			}
			transferTarget.walletId = item.walletId;
			transferTarget.address = vm.gopAddress = item.phone || item.address;
			transferTarget.name = item.name;
			transferTarget.personId = item.personId;
			transferTarget.photo = item.photo || './images/picture.png';
			transferTarget.phone = item.phone;
			targetInit(vm.transferOutType);
			router.go('/transfer-target');
		},
		*/
		showAuthenDes: function() {
			dialogAlert.set('为保证您的账户资金安全，请您输入真实姓名，实名信息校验正确后不可更改');
			dialogAlert.show();
		}
	});

	/*
	var transferNew = avalon.define({ //转帐到新目标
		$id: 'transfer-new',
		newTarget: '',
		checked: true,
		internalGopAddress: '',
		newguorentype: false,
		check: function() {
			if (this.value.length != 11 && this.value.length != 67 && this.value.length != 68) {
				transferNew.checked = true;
			} else if (this.value.length == 11) {
				var reg = /^0?1[3|4|5|8\7][0-9]\d{8}$/;
				if (!reg.test(this.value)) {
					transferNew.checked = true;
				} else {
					transferNew.checked = false;
					transferNew.newguorentype = false;
				}
			} else if (this.value.indexOf('GOP') != -1) {
				transferNew.checked = false;
				transferNew.newguorentype = true;
			} else {
				transferNew.checked = true;
			}
			if (transferNew.checked) {
				$(this).addClass("error");
			} else {
				$(this).removeClass("error");
			}
		},
		//转到新目标   添加新目标(钱包地址或手机号)  的下一步操作
		newNextClick: function() {
			if (transferNew.checked) {
				return;
			}
			if (transferNew.newTarget == '') {
				$.alert('手机号或地址为空');
				return;
			} else if (transferNew.newTarget.length == 11) {
				var reg = /^0?1[3|4|5|8\7][0-9]\d{8}$/;
				if (!reg.test(transferNew.newTarget)) {
					$.alert('该手机号格式不正确');
					return;
				}
			} else if (transferNew.newTarget.length == 67 || transferNew.newTarget.length == 68) {
				if (transferNew.newTarget.indexOf('GOP') != 0) {
					$.alert('该地址格式不正确');
					return;
				}
			} else {
				$.alert('手机号或地址格式不正确');
				return;
			}

			if (transferNew.newTarget != '') {
				var nowData = {};
				var re = /^1\d{10}$/
				if (re.test(transferNew.newTarget)) {
					vm.transferOutType = 'GOP_NEW';
					nowData.phone = transferNew.newTarget;
				} else if (transferNew.newTarget.indexOf('GOP') >= 0) {
					vm.transferOutType = 'WALLET_NEW';
				}
				nowData.address = transferNew.newTarget;
				api.transferValidate({
					gopToken: gopToken,
					address: transferNew.newTarget
				}, function(data) {
					if (data.status == 200) {
						console.log(data.data.photo);
						if (data.data) {
							if (data.data.photo) {
								nowData.photo = data.data.photo;
							}else{
								nowData.photo =  './images/picture.png';
							}
							if (data.data.phone) { //果仁宝联系人
								nowData.addressToPhone = data.data.phone;
								nowData.phone = data.data.phone;
								vm.transferOutType = 'GOP_NEW';
								nowData.serviceFee = '0.00';
							}
							if (re.test(transferNew.newTarget)) { //如果目标是手机号
								if (data.data.nick) {
									nowData.name = data.data.nick;
								} else {
									nowData.name = '未命名用户';
								}
								nowData.serviceFee = '0.00';
							} else if (transferNew.newTarget.indexOf('GOP') >= 0) { //如果目标是钱包地址
								nowData.name = data.data.nick || '未命名用户';
								nowData.serviceFee = '0.01';
							}
						} else {
							nowData.name = "未命名地址";
							nowData.serviceFee = '0.01';
						}
						$.extend(transferTarget, nowData);
						targetInit(vm.transferOutType);
						router.go('/transfer-target');
					} else if (data.status == 400) { // 手机号未注册 或 不能给自己转账
						$.alert(data.msg);
					} else {
						if (transferNew.newTarget.length == 11) {
							$.alert('该手机号未注册');
						} else {
							nowData.name = "未命名地址";
							nowData.serviceFee = '0.01';
							$.extend(transferTarget, nowData);
							targetInit(vm.transferOutType);
							router.go('/transfer-target');
						}
					}
				});
			} else {
				$.alert('地址格式错误');
			}
		},
	});
	*/

	/*
	var transferContacts = avalon.define({//转帐到联系人
		$id: 'transfer-contacts',
		search: '',
		list: [],
		submit: function() {
			transferContacts.query();
			return false;
		},
		query: function() {
			api.person({
				contactType: vm.transferOutType,
				contactQuery: transferContacts.search,
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					transferContacts.list = dataHandler(data.data);
					//console.log(dataHandler(data.data));//联系人列表
				} else {
					console.log(data);
				}
			});
		},
		listClick: function(ev) {
			var item = $(ev.target).closest('.contacts-item');
			if (!item.length) {
				return;
			}
			var arr = item.get(0).dataset.path.split('/');
			var models = transferContacts.list[arr[0]].list[arr[1]];
			var nowData = {};
			nowData.personId = models.$model.id;
			if (models.$model.address) {
				if(models.$model.address.indexOf('GOP')!=-1){
					nowData.serviceFee = '0.01';
				}else{
					nowData.serviceFee = '0.00';
				}
				nowData.address = models.$model.address;
				nowData.addressToPhone = models.$model.address.substr(0, 8) + '**********';
			};
			if (models.$model.phone) {
				nowData.address = models.$model.phone;
				nowData.phone = models.$model.phone;
			};
			if (models.$model.picture) {
				nowData.photo = models.$model.picture;
			}else{
				nowData.photo = './images/picture.png';
			}
			if (models.$model.name) {
				nowData.name = models.$model.name;
			}else{
				nowData.name = '未命名用户';
			};
			$.extend(transferTarget,nowData);
			targetInit(vm.transferOutType);
			router.go('/transfer-target');
		},
	});
	*/

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
		transferDesInputFocus: function() {
			//$('.view').css('top','-100px');
		},
		transferDesInputBlur: function() {
			//$('.view').css('top','0px');
		},
		transferDesInputOnInput: function() {
			var val = $(this).val();
			$(this).val(cutString(val));
			transferTarget.content = cutString(val);
		},
		checkCnyMoney: function() { //输入 时候判断 果仁数量
			 //只允许输入 数字字符
    		$(this).val($(this).val().replace(/[^\d.]/g, ""));
		},
		getCnyMoney: function() { //失焦 时候判断 果仁数量
			if (!this.value) {
				return;
			}
			if (parseFloat(this.value) === 0 || this.value === '') {
				$.alert('请输入正确的数量');
				transferTarget.notchecked = true;
				return;
			}

			if (parseFloat(filters.floorFix(parseFloat(this.value) + parseFloat(transferTarget.serviceFee))) > (parseFloat(transferTarget.gopNum))) {
				$.alert('您的果仁数不足');
				transferTarget.notchecked = true;
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
			console.log(transferTarget.notchecked);
			if (transferTarget.notchecked) {
				return;
			}
			if (parseFloat(transferTarget.transferNum) > 0 && parseFloat(transferTarget.gopNum - transferTarget.serviceFee)) {
				//密码输入框显示 AJAX密码确认后 设置回调函数
				// setTimeout(function() {
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
							}
							router.to('/bill');
							billView.set('TRANSFER_OUT', data.data.transferOutId, {
								ifReturnHome: true
							});
							init();
						} else {
							//console.log(data);
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
			return cutString(s.substring(0, len - 1));
		} else {
			return s;
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
		$('.transfer-target-head').hide();
		$('.transfer-target-box').hide();
		if (transferOutType === 'WALLET_NEW') { // 新钱包
			$('.wallet-address').show();
			$('.wallet').show();
		} else if (transferOutType === 'GOP_NEW') { // 新果仁宝
			$('.phone-address').show();
			$('.gop').show();
		} else if (transferOutType === 'WALLET_CONTACT') { //钱包联系人
			$('.wallet-address').show();
			$('.wallet').show();
		} else if (transferOutType === 'GOP_CONTACT') { // 果仁宝联系人
			$('.phone-address').show();
			$('.gop').show();
		} else if (transferOutType === 'GOP_MARKET') { // 果仁市场
			$('.gop-market').show();
			$('.wallet').show();
		} else if (transferOutType === 'ME_WALLET') { // 我的钱包
			$('.my-wallet').show();
			$('.wallet').show();
		} else if (transferOutType === 'new_walletaddress_nextstep') { // 我的钱包
			$('.my-wallet').show();
			$('.wallet').show();
		}
		getprice();
	};
	var getprice = function() { // 获取当前实价
		price.once(function(next) {
			transferTarget.price = next;
		});
	};

	var init = function() {
		api.info({
			gopToken: gopToken
		}, function(data) {
			if (data.status == 200) {
				if (data.data.marketGopAddress) {
					vm.marketGopAddress = data.data.marketGopAddress; //果仁市场地址
				}
				if (data.data.hasWallet) {
					vm.hasWallet = data.data.hasWallet; //果仁市场地址。null或空字符串都表示未设置
				}
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
		});
		refresh_list();
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

	init();

	setTimeout(function() {
		if (get.data.from === 'contacts') { // 来自联系人, 后期分离出公用页面
			api.contactInfo({
				gopToken: gopToken,
				personId: get.data.id,
			}, function(data) {
				if (data.status == 200) {
					var person = data.data;
					$.extend(transferTarget, {
						address: person.address,
						name: person.remark || person.nick || H5bill.transferNoNames[person.contactType],
						personId: person.id,
						photo: person.photo || './images/picture.png',
						phone: person.phone,
					});
					targetInit(vm.transferOutType = person.contactType);
					router.to('/transfer-target');
				} else {
					$.alert(data.msg);
					console.log(data);
				}
				transfer.addClass('on');
			});
		} else {
			transfer.addClass('on');
		}
	}, 100);
});