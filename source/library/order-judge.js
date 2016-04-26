// 魏兵兵 2016-04-11 11:33:02 创建
// H5微信端 --- order-judge 判断果仁现价 果仁数是否满足消费价格


define('h5-order-judge', ['h5-api','filters'], function(api,filters) {
	var gopToken = $.cookie('gopToken');
	var res = {
		check: function(curGopNum, callback) {
			var status = 'gopNumNo'; //状态果仁不够
			var gopPrice = 0;
			var myGopNum = 0;			
			var resultArr = [];
			var todo = function() {
				if (resultArr.length !== 2) {
					return;
				}
				status = resultArr[1] > filters.ceilFix(curGopNum) ? 'gopNumOk' : 'gopNumNo';
				callback && callback(status, gopPrice, myGopNum);
			};
			//果仁现价
			api.price({
				gopToken: gopToken
			}, function(data) {
				if (data.status == '200') {
					resultArr.push(gopPrice = data.data.price);
					todo();
				}
			});
			//获取果仁数
			api.getGopNum({
				gopToken: gopToken
			}, function(data) {
				if (data.status == 200) {
					resultArr.push(myGopNum = filters.floorFix(data.data.gopNum));
					todo();
				} else {
					console.log(data);
				}
			});
		},
	};

	return res;
});