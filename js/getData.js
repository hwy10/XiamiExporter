function getPersonInfo()
{
	$.get("https://www.battlenet.com.cn/wow/zh/vault/character/auction/money",function(data){
		var person={};
		var json=data;
		if(json.type == "LOGIN_FORM")
		{
			chrome.browserAction.setBadgeBackgroundColor({"color":[255, 0, 0, 255]});
			chrome.browserAction.setBadgeText({"text": "login"});
			localStorage.setItem("login","false");
			return;
		}
		else if(null != json.error)
		{
			chrome.browserAction.setBadgeBackgroundColor({"color":[255, 0, 0, 255]});
			chrome.browserAction.setBadgeText({"text": "wait"});
			localStorage.setItem("maintenance","true");
			return;
		}
		if("false" == localStorage["login"])
		{
			chrome.browserAction.setBadgeText({"text": ""});
			localStorage.setItem("login","true");
		}
		if("true" == localStorage["maintenance"])
		{
			chrome.browserAction.setBadgeText({"text": ""});
			localStorage["maintenance"] = "false";
		}
		person.chName=json["character"]["name"];
		person.chLevel=json["character"]["level"];
		person.chRace=json["character"]["raceName"];
		person.chProfession=json["character"]["className"];
		person.chServer=json["character"]["realmName"];
		person.chMoney=json["money"];
		localStorage.setItem("person",JSON.stringify(person));
		getPrice();
	})
}
function isNotice(item,oldPrice,watch)
{
	if(oldPrice == null) return true;
	else if(watch != null && "购买" == watch.type && compare(item.currentPrice,watch.price) <= 0 && compare(item.currentPrice,oldPrice.currentPrice) < 0) return true;
	else if(watch != null && "出售" == watch.type &&compare(item.currentPrice,watch.price) >= 0 && compare(item.currentPrice,oldPrice.currentPrice) > 0) return true;
	return false;
}
function updatePrice(data,type)
{
	var item = null;
	var html = data;
	var time = new Date().getTime();
	if(html.type == "LOGIN_FORM")
	{
		return;
	}
	else if(0 < $("div.auction-house-error",html).length) return;
	var name = $("input#itemName",html).val();
	var trs = $("div.table table tbody tr",html);
	if(trs.length == 0)
	{
		var watch = localStorage.getItem("watch_"+name);
		var oldPrice = localStorage.getItem("current"+type+"Price_"+name);
		localStorage.setItem("current"+type+"Price_"+name,null);
		localStorage.setItem(type+"Time_"+name,time);
		if(null != watch && oldPrice != null && '出售' == JSON.parse(watch).type)
		{
			chrome.browserAction.setBadgeBackgroundColor({"color":[255, 0, 0, 255]});
			chrome.browserAction.setBadgeText({"text": "sell"});
		}
		return;
	}
	for(var trID=0;trID<trs.length;trID++)
	{
		var tr = trs[trID];
		var itemName = $("td.item strong",tr).text();
		if(itemName == name)
		{
			var priceTooltips = $("div.price-tooltip > span.float-right",tr);
			var priceTooltip = priceTooltips[0];
			if(type == "Buyout") priceTooltip = priceTooltips[1];
			var seller = $($("td.item > a",tr)[2]).text();
			
			item = {
				name : itemName,
				seller : seller,
				currentPrice : {
					gold :  $("span.icon-gold",priceTooltip).text(),
					silver : $("span.icon-silver",priceTooltip).text(),
					copper : $("span.icon-copper",priceTooltip).text(),
				},
			};
			var oldPrice = localStorage.getItem("current"+type+"Price_"+item.name);
			localStorage.setItem("current"+type+"Price_"+item.name,JSON.stringify(item));
			localStorage.setItem(type+"Time_"+item.name,time);
			var watch = localStorage.getItem("watch_"+itemName);
			if(watch != null && (null == oldPrice || isNotice(item,JSON.parse(oldPrice),JSON.parse(watch))))
			{
				chrome.browserAction.setBadgeBackgroundColor({"color":[255, 0, 0, 255]});
				if("购买" == JSON.parse(watch).type) chrome.browserAction.setBadgeText({"text": "buy"});
				else chrome.browserAction.setBadgeText({"text": "sell"});
				var news = localStorage.getItem("news");
				news+=" "+item.name;
				localStorage.setItem("news",news);
			}
			return;
		}
	}
	var begin = parseInt($("strong.results-start",html).text());
	var end = parseInt($("strong.results-end",html).text());
	var total = parseInt($("strong.results-total",html).text());
	begin += 40;
	end += 40;
	var newURL = "https://www.battlenet.com.cn/wow/zh/vault/character/auction/browse?reverse=false&sort=unit"+type+"&filterId=-1&maxLvl=-1&start="+begin+"&qual=1&minLvl=-1&end="+end+"&n="+name;
	fetchPrice(newURL,type);
	localStorage.setItem(type+"Time_"+item.name,time);
}
function updateBuyoutPrice(data)
{
	updatePrice(data,"Buyout");
}
function updateBidPrice(data)
{
	updatePrice(data,"Bid");
}
function fetchPrice(url,type)
{
	var func = updateBidPrice;
	if(type == "Buyout") func = updateBuyoutPrice;
	$.get(url,func);
}
function getCurrentBuyoutPrice(name)
{
	getCurrentPrice(name,"Buyout");
}
function getCurrentBidPrice(name)
{
	getCurrentPrice(name,"Bid");
}
function getCurrentPrice(name,type)
{
	var end = 40;
	var start = 0;
	
	var url = "https://www.battlenet.com.cn/wow/zh/vault/character/auction/browse?reverse=false&sort=unit"+type+"&filterId=-1&maxLvl=-1&start="+start+"&qual=1&minLvl=-1&end="+end+"&n="+name;
	fetchPrice(url,type);
}

function compare(a,b)
{
	var va = parseInt(String(a.gold).replace(",",""))*10000+parseInt(a.silver)*100+parseInt(a.copper);
	var vb = parseInt(String(b.gold).replace(",",""))*10000+parseInt(b.silver)*100+parseInt(b.copper);
	if(va<vb) return -1;
	else if(va>vb) return 1;
	return 0;
}
function getData()
{
	if("true" == localStorage["stop"])
	{
		chrome.browserAction.setBadgeBackgroundColor({"color":[255, 0, 0, 255]});
		chrome.browserAction.setBadgeText({"text": "stop"});
		return;
	}
	localStorage["nextRefresh"] = new Date().getTime() + 10*60*1000;
	getPersonInfo();
}
function getPrice()
{
	var watches = localStorage.getItem("watches");
	if(null == watches) return;
	var items = JSON.parse(watches);
	for(var itemID in items)
	{
		var name = items[itemID].name;
		getCurrentBuyoutPrice(name);
		getCurrentBidPrice(name);
	}
}