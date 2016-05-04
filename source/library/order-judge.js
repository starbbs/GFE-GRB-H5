// 魏兵兵 2016-04-11 11:33:02 创建
// H5微信端 --- order-judge 判断果仁现价 果仁数是否满足消费价格


define('h5-order-judge', ['h5-api', 'filters'], function(api, filters) {
	var ok = 'gopNumOk';
	var no = 'gopNumNo';
	return {
		ok: ok,
		no: no,
		tip: '您的果仁不够，请充值',
		checkGOP: function(curGOPNum, callback) { // 以果仁数值传参
			this.once(function(myGopNum, gopPrice) {
				console.log(curGOPNum);
				console.log(filters.ceilFix(curGOPNum));
				var status = myGopNum >= parseFloat(filters.ceilFix(curGOPNum)) ? ok : no;
				callback && callback(status, gopPrice, myGopNum);
			});
		},
		checkRMB: function(curRMBNum, callback) { // 以人民币数值传参
			this.once(function(myGopNum, gopPrice) {
				var status = myGopNum * gopPrice >= parseFloat(curRMBNum) ? ok : no;
				callback && callback(status, gopPrice, myGopNum);
			});
		},
		once: function(callback) { // 请求一次
			var gopToken = $.cookie('gopToken');
			var myGopNum = 0;
			var gopPrice = 0;
			var i = 0;
			var todo = function() {
				i++;
				if (i === 2) {
					callback && callback(myGopNum, gopPrice);
				}
			};
			api.price({ // 果仁现价
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					gopPrice = parseFloat(data.data.price);
					todo();
				}
			});
			api.getGopNum({ // 获取果仁数
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					myGopNum = parseFloat(data.data.gopNum);
					todo();
				}
			});
		},
		check: function(curGOPNum, callback) { // 默认用果仁数检查 --- 不适用于手机充值
			this.checkGOP(curGOPNum, callback);
		},
	};
});