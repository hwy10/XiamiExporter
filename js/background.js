(function(){
	getData();
	setInterval(function(){
		var time = new Date().getTime();
		if(localStorage["nextRefresh"] <= time) getData();
		},1000);
})();