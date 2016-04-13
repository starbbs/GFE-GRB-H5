// 张树垚 2016-04-11 11:33:02 创建
// H5微信端 --- order-judge 判断是否创建订单


define('h5-order-judge', ['h5-api'], function(api) {
	var gopToken = $.cookie('gopToken');
	var res = {
		check: function(curPrice, callback) {
			var status = 'gopNumNo'; //状态果仁不够
			var gopPrice = 0;
			var myGopNum = 0;			
			var resultArr = [];
			var todo = function() {
				if (resultArr.length !== 2) {
					return;
				}
				status = resultArr[0] * resultArr[1] > curPrice ? 'gopNumOk' : 'gopNumNo';
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
					resultArr.push(myGopNum = data.data.gopNum);
					todo();
				} else {
					console.log(data);
				}
			});
		},
	};

	return res;
});