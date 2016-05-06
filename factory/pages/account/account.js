// 张树垚 2016-01-10 00:31:49 创建
// H5微信端 --- 账单

require([
	'router', 'h5-api', 'get', 'filters', 'h5-component-bill', 'iscrollLoading', 'h5-view-bill', 'mydate', 'h5-order-judge',
	'h5-weixin'
], function(
	router, api, get, filters, H5bill, iscrollLoading, billView, mydate, orderJudge
) {
	// $.cookie('gopToken','b7af44824ea34409a494393b00f0788e'); 

	router.init();
	$(document).get(0).ontouchmove = function(event) {
		event.preventDefault();
	};
	var gopToken = $.cookie('gopToken');
	var page = 1; // 账单页数, 当返回列表长度小于当前列表长度时, 置零, 不再请求
	var size = 15; // 账单列表

	var main = $('.account'); // 主容器
	var init = function() { // 初始化
		switch (get.data.from) {
			case 'wx_info': // 来自微信消息
				billView.set(get.data.type, get.data.id);
				router.to('/bill');
				break;
			default:
				router.to('/');
				iscrollLoading.downLoadingData();
		}
	};
	var originList = [];

	var getList = function() {
		api.billList({
			gopToken: gopToken,
			billListPage: page,
			billListPageSize: size
		}, function(data) {
			var list = data.data.list;
			if (data.status == 200) {
				page = list.length < size ? 0 : page + 1; // 是否停止请求
				vm.list = dataHandler(originList = originList.concat(list));
				!main.hasClass('on') && setTimeout(function() {
					main.addClass('on');
				}, 200);
				setTimeout(function() {
					vm.loading = false;
					vm.uploading = false;
				}, 100);
			} else {
				$.alert(data.msg);
			}
		});
	};


	iscrollLoading.upLoadingData = function() { // 获取上拉列表
		page = 1;
		originList = [];
		getList();
	};
	//上拉 下拉的函数
	iscrollLoading.downLoadingData = function() { // 获取列表
		getList();
	};
	iscrollLoading.scrollMove = function() { // 滑动时候
		vm.loadingWord = '松开刷新';
		vm.uploading = true;
	};
	iscrollLoading.beforeScrollEndTrue = function() { // 手指移开前 满足条件
		vm.uploading = false;
		if (vm.uploading) {
			return;
		}
		vm.loadingWord = '正在加载';
		vm.uploading = true;
		iscrollLoading.upLoadingData();
	};
	iscrollLoading.beforeScrollEndFalse = function() { // 手指移开前 不满足条件
		setTimeout(function() {
			vm.uploading = false;
		}, 200);
	};
	iscrollLoading.scrollEnd = function() { // 滑动完成后
		if (!page) {
			vm.loading = true;
			vm.loadingWord = '大大, 已经没有了...';
			setTimeout(function() {
				vm.loading = false;
			}, 1000);
			return;
		} else {
			vm.loadingWord = '正在加载';
			if (vm.loading) {
				return;
			}
			vm.loading = true;
			getList();
		}
	};

	var accountScroll = iscrollLoading.set('account', {
		userUp: true,
		userDown: true,
		// momentum: false, //关闭拖动后惯性运动
		// bounceLock:true, //当内容少于滚动是否可以反弹
		// bounce:true, //启用或禁用边界的反弹，默认为true
	});

	var now = new Date(); // 当前时间
	var nowMonth = now.getMonth(); // 当前月份
	//                 money gop   []   list的每条数据
	var dataAdd = function(kind, bills, item) { // 添加效果的数据
		var type = H5bill.typeClass[item.type]; // phone refund buy transfer
		var bill = { // 账单
			id: item.businessId, // id
			img: '', // 头像
			name: '', // 姓名
			desc: item.businessDesc,
			status: H5bill.statusBusiness[item.status], // 交易状态中文  进行中  交易成功/失败。。。
			originStatus: item.status,
			type: type,
			originType: item.type,
			iconClass: '',
		};
		var types = { // 类型
			money: 'money',
			gop: 'gopNumber',
		};
		var coins = { // 货币
			money: '¥',
			gop: '<span class="iconfont icon-g"></span>',
		};
		var filter = { // 过滤器
			money: 'fix',
			gop: 'floorFix',
		};

		//根据类型显示不同说明字段
		if (type === 'transfer' && item.extra) { //转帐类型  并有extra字段
			bill.img = item.extra.photo || ''; // 转账头像
			if (item.extra.name) { // 有名字的用户
				bill.desc += ' - ' + filters.omit(item.extra.name, 10); // "转出-L"  展示用    omit限制长度
				bill.name = filters.omit(item.extra.name); // L  绑定到 data-name="L"
			} else {
				if (item.extra.transferOutType === 'GOP_MARKET' || item.extra.transferInType === 'GOP_MARKET') {
					bill.desc += ' - 果仁市场';
					bill.iconClass = 'market';
				}
				if (item.extra.transferOutType === 'ME_WALLET' || item.extra.transferInType === 'ME_WALLET') {
					bill.desc += ' - 我的钱包';
					bill.iconClass = 'wallet';
				}
				if (item.extra.transferOutType === 'WALLET_CONTACT' || item.extra.transferInType === 'WALLET_CONTACT') {
					bill.desc += ' - 未命名地址';
				}
				if (item.extra.transferOutType === 'GOP_CONTACT' || item.extra.transferInType === 'GOP_CONTACT') {
					bill.desc += ' - 未命名用户';
				}
			}
		}
		if (type === 'phone' || type === 'refund') {
			if (item.extra && item.extra.product) {
				item.extra.product.productDesc && (bill.desc = item.extra.product.productDesc.replace(/\-/g, ' - '));
				// 运营商
			}
		}

		if (type === 'refund') {
			// bill.iconClass = 'refund';   退款成功
			bill.status = H5bill.getStatusRefund(item);
		}

		//根据消费方式显示  取整方式
		if (kind === 'all') { // RMB  果仁  支付都有
			if (item.extra.recordList.length) {
				item.extra.recordList.forEach(function(item) {
					switch (item.payType) {
						case 'GOP_PAY': // 果仁宝支付
							bill.change = numHandler(-item.payGop, coins['gop'], 'ceilFix'); // 果仁消费都是向上取整
							break;
						case 'UNION_PAY': // 银行卡支付
							bill.change = numHandler(-item.payMoney, coins['money'], filter['money']);
							break;
						case 'BILL99_PAY': // 块钱支付
							bill.change = numHandler(-item.payMoney, coins['money'], filter['money']);
							break;
						default:
							console.log('Error: (account) 支付类型错误', item);
					}
					bills.push($.extend({}, bill));
				});
			} else {
				bill.change = numHandler(item.money, coins['money'], filter['money']);
				bills.push(bill);
			}
		} else {
			// 果仁 或 RMB 支付之一  
			// 果仁支付 退款 向上   买果仁获得果仁向下
			var filterKinds = type === 'money' ? 'fix' : type === 'refund' ? 'ceilFix' : 'floorFix';
			// 退果仁 向上取   买果仁 向下取
			// kind   gop  money
			// types[kind] ==> gopNumber money
			// item[types[kind]]  数字
			// 数字      标识￥ G      取整方式
			bill.change = numHandler(item[types[kind]], coins[kind], filterKinds); //买果仁RMB显示 退款向上取整

			bills.push(bill);
		}
	};

	var dataHandler = function(data) { //后台返回list数据加工处理   时间处理同时获取交易的信息
		now = new Date();
		// data 列表所有的数据条目
		// data.map全部完成 ==> sort全部完成 ==> reduce全部完成 ==>
		return data.map(function(item) { // 确定时间 list每条的时间转化成 JS时间
			item._date = mydate.parseDate(item.businessTime);
			return item;
		}).sort(function(item1, item2) { // 时间排序
			return item2._date.getTime() - item1._date.getTime();
		}).reduce(function(result, item) { // 提取
			var time = mydate.timeHandler(item._date); // time格式如下
			var type = H5bill.typeClass[item.type];
			var bills = [];
			switch (type) { // 账单类型
				case 'phone': // 消费果仁, 果仁+人民币
					dataAdd('all', bills, item);
					break;
				case 'buy': // 买果仁, 人民币
					dataAdd('money', bills, item);
					break;
				case 'transfer': // 转果仁, 果仁
					dataAdd('gop', bills, item);
					break;
				default: // 退款
					if (item.type === 'REFUND') {
						if (item.money) { // 退人民币
							console.log('Warning: (account) 退人民币,在微信中被过滤掉', item);
							type = 'none'; // 页面过滤type为none的账单
						} else if (item.gopNumber) {
							dataAdd('gop', bills, item);
						} else {
							console.log('Error: (account) 退款错误,没有人民币和果仁', item);
						}
					} else {
						console.log('没有处理的账单类型', item);
					}
			}
			var compare = mydate.timeCompare(now, item._date); //返回 今天 昨天 前天  周一五
			var day = {
				id: item.businessId,
				day: compare ? compare : ('周' + time.day2),
				time: compare ? (time.hour2 + ':' + time.minute2) : (time.month2 + '-' + time.date),
				type: type,
				originType: item.type,
				bills: bills,
			};
			if (result.length > 0 && result[result.length - 1].month2 === time.month2) { // 和上个月相同
				result[result.length - 1].days.push(day);
			} else { // 没有这个月份, 创建
				result.push({
					month: nowMonth === time.month ? '本月' : (time.month2 + '月'),
					month2: time.month2,
					days: [day]
				});
			}
			return result;
		}, []);
	};
	//			       123.22    <span>G</span>    floorFix||ceilFix		
	var numHandler = function(number, unit, filter) { // 数值处理
		return (number > 0 ? '+' : '-') + ' ' + unit + ' ' + filters[filter](Math.abs(number));
	};
	// 处理 getList 的工具方法 -- 结束

	// 账单列表  vm
	var vm = avalon.define({
		$id: 'account',
		loading: false,
		uploading: false,
		loadingWord: '加载中...',
		list: [],
		listRepeatCallback: function() { // 循环结束回调
			setTimeout(function() {
				accountScroll.refresh();
			}, 200);
		},
		showAccount: function(ev) { // 显示账单详情(事件代理)
			var target = listTarget = $(ev.target).closest('.account-item');
			if (target.length) {
				var data = target.get(0).dataset;
				var options = {};
				data.name && (options.transferName = data.name);
				data.img && (options.transferImg = data.img);
				billView.set(data.type, data.id, options);
				router.go('/bill');
			}
		}
	});
	avalon.scan(main.get(0), vm);

	// 帐单详情
	billView.on('hide', function() {
		if (!vm.list.length) { // 没有list长度时获取list
			getList();
		}
	});
	// billView.on('close', function() {});
	billView.onClose = function(vmid, vmtime) {
		vm.list.every(function(month) {
			return month.days.every(function(day, index) {
				if (day.id === vmid) {
					console.log(day)
					day.time = vmtime.substr(vmtime.indexOf(' ') + 1, 5);
					day.bills.forEach(function(bill) {
						bill.status = '已关闭';
						bill.originStatus = 'CLOSE';
					});
					month.days.splice(index, 1);
					vm.list[0].days.unshift(day);
					return false;
				}
				return true;
			});
		});
	};

	// bill页面支付按钮点击事件
	//billView.onGotoPay = function(waitforpaymoney) {
	//	orderJudge.checkRMB(waitforpaymoney, function(status, gopPrice, myGopNum) {
	//		if (status == orderJudge.no) {
	//			$.alert(orderJudge.tip);
	//			return false;
	//		} else {
	//			return true;
	//		}
	//	});
	//};

	// setTimeout(function() {
	// 	billView.onClose(2346, '2016-04-13 17:75:04');
	// }, 2000);

	init();
});