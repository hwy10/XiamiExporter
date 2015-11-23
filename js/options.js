$(document).ready(function(){
	function viewModel(){
		var self = this;
		var localPerson = localStorage.getItem("person");
		var localWatches = localStorage.getItem("watches");
		if(null == localPerson) localPerson == "[]";
		if(null == localWatches) localWatches == "[]";
		var person = JSON.parse(localPerson);
		var watches = JSON.parse(localWatches);
		if(person != null)
		{
			self.chName = person.chName;
			self.chLevel = person.chLevel;
			self.chRace = person.chRace;
			self.chProfession = person.chProfession;
			self.chServer = person.chServer;
			self.chMoney = {gold:0,silver:0,copper:0};
			self.chMoney.copper = person.chMoney%100;
			person.chMoney = parseInt(person.chMoney/100);
			self.chMoney.silver = person.chMoney%100;
			person.chMoney = parseInt(person.chMoney/100);
			self.chMoney.gold = person.chMoney;
		}
		else
		{
			self.chName = "";
			self.chLevel = "";
			self.chRace = "";
			self.chProfession = "";
			self.chServer = "";
			self.chMoney = {gold:0,silver:0,copper:0};
		}
		self.watches = ko.observableArray(watches);
		self.availableTypes = ko.observableArray(["购买","出售"]);
		self.newWatch = {
			name : "",
			price : {gold:0,silver:0,copper:0},
			type : "",
		},
		self.removeWatch = function(watch){
			self.watches.remove(watch);
			localStorage.setItem("watches",JSON.stringify(self.watches()));
		},
		self.submitWatch = function(){
			var watch=self.newWatch;
			var change = false;
			for(var id in self.watches())
			{
				if(watch.name == self.watches()[id].name)
				{
					change = true;
					self.watches()[id] = watch;
					break;
				}
			}
			if(!change) self.watches.push(watch);
			localStorage.setItem("watches",JSON.stringify(self.watches()));
			localStorage.setItem("watch_"+watch.name,JSON.stringify(watch));
			var time = new Date().getTime();
			localStorage["nextRefresh"] = time;
			window.location.reload();
		};
	}
	
	var time = new Date().getTime();
	if("false" == localStorage["login"])
	{
		localStorage["nextRefresh"] = time;
		window.location.replace("https://www.battlenet.com.cn/login/zh/index");
	}
	ko.applyBindings(new viewModel());
});