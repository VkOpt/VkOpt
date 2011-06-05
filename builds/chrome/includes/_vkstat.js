// ==UserScript==
// @name          VK-STATS v4.3 plugin for VkOpt
// @description   vkontakte-stats (http://vk.com/club21792535)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==


var getKeys = function(obj){
	var keys = [];
	for(var key in obj){
		keys.push(key);
	}
	return keys;
};

var loadjscssfile = function (filename, filetype){
	var fileref;
	if (filetype=="js"){
		fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", filename);
	}
	else if (filetype=="css"){
		fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", filename);
	}
	if (typeof fileref!="undefined")
		document.getElementsByTagName("head")[0].appendChild(fileref)
}

var fixQuot = function(s) {
	if(browser.msie)return s.replace(/\"/g, '&quot;');
	else return s;
}

var nKeys = function(obj){
	var keys = 0;
	for(var key in obj){
		keys ++;
	}
	return keys;
};

var splitArrayToSubArrays = function(arr, maxPieceSize) {
	var result = [];
	for(var i = 0; i < arr.length / maxPieceSize; i ++) {
		result.push(arr.slice(maxPieceSize * i, maxPieceSize * (i + 1)));
	}
	return result;
};

var formatDate = function(date, withMsec) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	if(month < 10) month = '0' + month;
	var day = date.getDate();
	if(day < 10) day = '0' + day;
	
	var hours = date.getHours();
	if(hours < 10) hours = '0' + hours;
	
	var minutes = date.getMinutes();
	if(minutes < 10) minutes = '0' + minutes;
	
	var seconds = date.getSeconds();
	if(seconds < 10) seconds = '0' + seconds;
	
	if(withMsec) {
	
		var msec = mod(date.getTime(), 1000);
		if(msec < 100) msec = '0' + msec;
		if(intval(msec) < 10) msec = '0' + msec;
	
		seconds = seconds + '.' + msec;
		
	}
	
	return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
};

//because when inserted into address bar, expressions with percentage sign tend to get converted to characters
var mod = function(first, second) {
	return first % second;
};

var myCheckChange = function(obj, uid) {
	mail.checkChange(obj,uid);
	if( cur.messCheckedNum > SYS.MAX_USERS_AT_ONE_GRAPH) {
		if(user.plotGraphs) {
			ge('plot_graphs_links').style.visibility = 'hidden';
		}
		
	} else {
		if(user.plotGraphs) {
			ge('plot_graphs_links').style.visibility = '';
		}
	}
};

var SYS = {
	VERSION: '4.2',
	APP_ID: 2045168,
	LOGIN_SETTING: 0 + 2048 + 4096,
	DEBUG: false,
	MESSAGES_TO_PROCESS_IN_DEBUG_MODE: 400,
	MESSAGES_PER_REQUEST: 100,
	MSEC_BETWEEN_REQUESTS: 333,
	MSEC_BETWEEN_REQUESTS_FOR_USERDATA: 1000,
	MAX_USERS_PER_REQUEST: 1000,
	LINK_TO_CLUB: '/club21792535',
	TOO_MANY_REQUESTS_ERR_CODE: 6,
	MAX_USERS_AT_ONE_GRAPH: 3,
	PATH_TO_SWFOBJECT: 'http://vkontakte.ru/js/lib/swfobject2.js',
	LANGUAGES: {
		0: {
			name: 'russian',
			strings: {
				authorizing: '\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f',
				authorized: '\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u044f \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
				loadingMessageNumbers: '\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0447\u0438\u0441\u043b\u0430 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				fatal: '\u041a\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0441\u043e\u043e\u0431\u0449\u0438\u0442\u0435 \u043f\u0440\u0438\u0432\u0435\u0434\u0451\u043d\u043d\u044b\u0435 \u043d\u0438\u0436\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u0443.',
				appName: '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043b\u0438\u0447\u043d\u043e\u0439 \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0438',
				nameCol: '\u0418\u043c\u044f',
				kbytes: '\u0423\u0447\u0438\u0442\u044b\u0432\u0430\u0442\u044c \u0440\u0430\u0437\u043c\u0435\u0440 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				settingsText: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0436\u0435\u043b\u0430\u0435\u043c\u044b\u0435 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b',
				startButton: '\u041f\u043e\u0435\u0445\u0430\u043b\u0438!',
				verbose: '\u041b\u043e\u0433\u0433\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0432\u0441\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f',
				gettingNames: '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0438\u043c\u0451\u043d \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439',
				numberOfMessagesCol: '\u0412\u0441\u0435\u0433\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				sentCol: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e',
				receivedCol: '\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e',
				symbolsCol: '\u0412\u0441\u0435\u0433\u043e \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432',
				sentSymbolsCol: '\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432',
				receivedSymbolsCol: '\u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432',
				lastMsgCol: '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
				processingMessages: '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				done: '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
				messagesProcessed: '\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				incoming: '\u0432\u0445\u043e\u0434\u044f\u0449\u0438\u0445',
				outgoing: '\u0438\u0441\u0445\u043e\u0434\u044f\u0449\u0438\u0445',
				dayWithMostMessages: '\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439 \u0431\u044b\u043b\u043e',
				timeWithMostMessages: '\u0411\u043e\u043b\u044c\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				thankYou: '\u0421\u043f\u0430\u0441\u0438\u0431\u043e, \u0447\u0442\u043e \u0434\u043e\u0436\u0434\u0430\u043b\u0438\u0441\u044c, \u043d\u0430\u0434\u0435\u0435\u043c\u0441\u044f, \u043e\u043d\u043e \u0442\u043e\u0433\u043e \u0441\u0442\u043e\u0438\u043b\u043e!',
				exportByTime: '\u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0438 \u043f\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438',
				exportByMessages: '\u042d\u043a\u0441\u043f\u043e\u0440\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0438 \u043f\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f\u043c',
				warning: '\u0412\u043d\u0438\u043c\u0430\u043d\u0438\u0435! \u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				friendsOnly: '\u0423\u0447\u0438\u0442\u044b\u0432\u0430\u0442\u044c \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u0440\u0443\u0437\u0435\u0439',
				withSelected: '\u0412\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0435',
				exportToNote: '\u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0432 \u0437\u0430\u043c\u0435\u0442\u043a\u0443',
				ourGroup: '\u041d\u0430\u0448\u0430 \u0433\u0440\u0443\u043f\u043f\u0430',
				noteSuccess: '\u0417\u0430\u043c\u0435\u0442\u043a\u0430 \u0443\u0441\u043f\u0435\u0448\u043d\u043e \u0441\u043e\u0437\u0434\u0430\u043d\u0430',
				noteFailure: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0437\u0430\u043c\u0435\u0442\u043a\u0443. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u043f\u043e\u0437\u0434\u043d\u0435\u0435.',
				seeNote: '\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c',
				wrongPage: '\u0427\u0442\u043e\u0431\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0441\u043a\u0440\u0438\u043f\u0442, \u0432\u044b \u0434\u043e\u043b\u0436\u043d\u044b \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u044c\u0441\u044f \u0432 "\u041c\u043e\u0438\u0445 \u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f\u0445"!',
				plotKbytesGraph: '\u043f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0433\u0440\u0430\u0444\u0438\u043a \u043f\u043e \u0447\u0438\u0441\u043b\u0443 \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432',
				plotMessagesGraph: '\u043f\u043e\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0433\u0440\u0430\u0444\u0438\u043a \u043f\u043e \u0447\u0438\u0441\u043b\u0443 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439',
				wantToPlotGraphs: '\u042f \u0437\u0430\u0445\u043e\u0447\u0443 \u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0433\u0440\u0430\u0444\u0438\u043a\u0438 \u043e\u0431\u0449\u0435\u043d\u0438\u044f \u043e\u0442 \u0432\u0440\u0435\u043c\u0435\u043d\u0438',
				totalFirstName: '\u041e\u0431\u0449\u0430\u044f', 
				totalLastName: '\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430',
				sortByKBytes: '\u0421\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u043e \u043a\u0438\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u043c'
			}
		},
		1: {
			name: 'ukrainian',
			strings: {
				authorizing: '\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0456\u044f',
				authorized: '\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0456\u044f \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
				loadingMessageNumbers: '\u0412\u0438\u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u043a\u0456\u043b\u044c\u043a\u043e\u0441\u0442\u0456 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				settingsText: '\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044c \u0431\u0430\u0436\u0430\u043d\u0456 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u0438',
				startButton: '\u041f\u043e\u0457\u0445\u0430\u043b\u0438!',
				verbose: '\u041b\u043e\u0433\u0433\u0456\u0440\u043e\u0432\u0430\u0442\u044c \u0432\u0441\u0456 \u0434\u0456\u0457',
				fatal: '\u041a\u0440\u0438\u0442\u0438\u0447\u043d\u0430 \u043f\u043e\u043c\u0438\u043b\u043a\u0430. \u0411\u0443\u0434\u044c \u043b\u0430\u0441\u043a\u0430, \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u0442\u0435 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0456 \u043d\u0438\u0436\u0447\u0435 \u0434\u0430\u043d\u0456 \u0440\u043e\u0437\u0440\u043e\u0431\u043d\u0438\u043a\u0443.',
				appName: '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u0456 \u043f\u0435\u0440\u0435\u043f\u0438\u0441\u043a\u0438',
				nameCol: "\u0406\u043c'\u044f",
				numberOfMessagesCol: '\u0423\u0441\u044c\u043e\u0433\u043e \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				kbytes: '\u0412\u0440\u0430\u0445\u043e\u0432\u0443\u0432\u0430\u0442\u0438 \u0440\u043e\u0437\u043c\u0456\u0440 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				gettingNames: '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0435\u043d\u043d\u044f \u0456\u043c\u0435\u043d \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432',
				symbolsCol: '\u0412\u0441\u044c\u043e\u0433\u043e \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432',
				sentSymbolsCol: '\u0412\u0438 \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u0438\u043b\u0438 \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432',
				receivedSymbolsCol: '\u0412\u0438 \u043e\u0442\u0440\u0438\u043c\u0430\u043b\u0438 \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432',
				sentCol: '\u0412\u0438 \u0432\u0456\u0434\u043f\u0440\u0430\u0432\u0438\u043b\u0438',
				receivedCol: '\u0412\u0438 \u043e\u0434\u0435\u0440\u0436\u0430\u043b\u0438',
				lastMsgCol: '\u041e\u0441\u0442\u0430\u043d\u043d\u0454 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f',
				messagesProcessed: '\u041e\u0431\u0440\u043e\u0431\u043b\u0435\u043d\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				processingMessages: '\u041e\u0431\u0440\u043e\u0431\u043a\u0430 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				done: '\u041e\u0431\u0440\u043e\u0431\u043a\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0430',
				incoming: '\u0432\u0445\u043e\u0434\u044f\u0442\u044c',
				outgoing: '\u0432\u0438\u0445\u0456\u0434\u043d\u0438\u0445',
				dayWithMostMessages: '\u041d\u0430\u0439\u0431\u0456\u043b\u044c\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c \u0431\u0443\u043b\u043e',
				timeWithMostMessages: '\u041d\u0430\u0439\u0431\u0456\u043b\u044c\u0448\u0435 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				thankYou: '\u0421\u043f\u0430\u0441\u0438\u0431\u0456, \u0449\u043e \u0434\u043e\u0447\u0435\u043a\u0430\u043b\u0438\u0441\u044f, \u0441\u043f\u043e\u0434\u0456\u0432\u0430\u0454\u043c\u043e\u0441\u044f, \u0432\u043e\u043d\u043e \u0442\u043e\u0433\u043e \u043a\u043e\u0448\u0442\u0443\u0432\u0430\u043b\u043e!',
				exportByTime: '\u0415\u043a\u0441\u043f\u043e\u0440\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0438 \u0437\u0430 \u0447\u0430\u0441\u043e\u043c',
				exportByMessages: '\u0415\u043a\u0441\u043f\u043e\u0440\u0442 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0438 \u0437\u0430 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f\u043c',
				warning: '\u0423\u0432\u0430\u0433\u0430! \u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043e\u0431\u0440\u043e\u0431\u0438\u0442\u0438 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u044c',
				friendsOnly: '\u0412\u0440\u0430\u0445\u043e\u0432\u0443\u0432\u0430\u0442\u0438 \u0442\u0456\u043b\u044c\u043a\u0438 \u0434\u0440\u0443\u0437\u0456\u0432',
				withSelected: '\u0412\u0438\u0431\u0440\u0430\u043d\u0456',
				exportToNote: '\u0435\u043a\u0441\u043f\u043e\u0440\u0442\u0443\u0432\u0430\u0442\u0438 \u0432 \u0437\u0430\u043c\u0456\u0442\u043a\u0443',
				ourGroup: '\u041d\u0430\u0448\u0430 \u0433\u0440\u0443\u043f\u0430',
				noteSuccess: '\u0417\u0430\u043c\u0456\u0442\u043a\u0430 \u0443\u0441\u043f\u0456\u0448\u043d\u043e \u0441\u0442\u0432\u043e\u0440\u0435\u043d\u0430',
				noteFailure: '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0441\u0442\u0432\u043e\u0440\u0438\u0442\u0438 \u0437\u0430\u043c\u0456\u0442\u043a\u0443. \u0421\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437 \u043f\u0456\u0437\u043d\u0456\u0448\u0435.',
				seeNote: '\u041f\u043e\u0434\u0438\u0432\u0438\u0442\u0438\u0441\u044f',
				wrongPage: '\u0429\u043e\u0431 \u0437\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0438 \u0441\u043a\u0440\u0438\u043f\u0442, \u0432\u0438 \u043f\u043e\u0432\u0438\u043d\u043d\u0456 \u0437\u043d\u0430\u0445\u043e\u0434\u0438\u0442\u0438\u0441\u044f \u0432 "\u041c\u043e\u0457\u0445 \u043f\u043e\u0432\u0456\u0434\u043e\u043c\u043b\u0435\u043d\u043d\u044f\u0445"',
				plotKbytesGraph: '\u043f\u043e\u0431\u0443\u0434\u0443\u0432\u0430\u0442\u0438 \u0433\u0440\u0430\u0444\u0456\u043a \u0437\u0430 \u043a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044e \u0441\u0438\u043c\u0432\u043e\u043b\u0456\u0432',
				plotMessagesGraph: '\u043f\u043e\u0431\u0443\u0434\u0443\u0432\u0430\u0442\u0438 \u0433\u0440\u0430\u0444\u0456\u043a \u0437\u0430 \u043a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0456\u0439\u044c',
				wantToPlotGraphs: '\u042f \u0437\u0430\u0445\u043e\u0447\u0443 \u0431\u0443\u0434\u0443\u0432\u0430\u0442\u0438 \u0433\u0430\u0440\u043d\u0456 \u0433\u0440\u0430\u0444\u0456\u043a\u0438',
				totalFirstName: '\u0417\u0430\u0433\u0430\u043b\u044c\u043d\u0430', 
				totalLastName: '\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430',
				sortByKBytes: 'C\u043e\u0440\u0442\u0443\u0432\u0430\u0442\u0438 \u043f\u043e \u043a\u0456\u043b\u043e\u0431\u0430\u0439\u0442\u0430\u043c'
			}
		},
		3: {
			name: 'english',
			strings: {
				authorizing: 'Authorizing',
				authorized: 'Authorization complete',
				loadingMessageNumbers: 'Getting message numbers',
				fatal: 'Fatal error. Please, send the info below to the developers',
				appName: 'Private messages statistics',
				settingsText: 'Set your desired parameters',
				startButton: 'Start',
				verbose: 'Verbose mode',
				kbytes: 'Count message sizes as well',
				nameCol: 'Name',
				numberOfMessagesCol: 'Number of messages',
				gettingNames: 'Loading user names',
				sentCol: 'Sent',
				receivedCol: 'Received',
				symbolsCol: 'Total symbols',
				sentSymbolsCol: 'Sent symbols',
				receivedSymbolsCol: 'Received symbols',
				lastMsgCol: 'Last Message',
				messagesProcessed: 'Messages processed',
				processingMessages: 'Processing messages',
				done: 'Processing complete',
				incoming: 'incoming',
				outgoing: 'outgoing',
				dayWithMostMessages: 'Day with most messages',
				timeWithMostMessages: 'Time with most messages',
				thankYou: 'Thank you for your time, we hope it was worth it!',
				exportByTime: 'Export time statistics',
				exportByMessages: 'Export message statistics',
				warning: 'Warning! Failed to process messages',
				friendsOnly: 'Count only for friends',
				withSelected: 'Selected',
				exportToNote: 'export to note',
				ourGroup: 'Our club',
				noteSuccess: 'Note created successfully',
				noteFailure: 'Failed to create a note. Please try again later',
				seeNote: 'See it',
				wrongPage: 'You need to be at "My Messages" page for this script to run!',
				plotKbytesGraph: 'plot symbol number graph',
				plotMessagesGraph: 'plot message number graph',
				wantToPlotGraphs: 'I\'d like to plot fancy graphs',
				totalFirstName: 'Overall', 
				totalLastName: 'stats',
				sortByKBytes: 'Sort by kilobytes'
			}
		}
	},
	
	fatal: function(obj) {
		ui.setHeader(user.lang.fatal);
		ui.clearContent();
		var t = ce('textarea', {'cols': 80, 'rows': 20}, {fontFamily: 'Courier new'});
		t.innerHTML = obj;
		ui.appendContentElement(t);
		throw obj;
	},
	
	log: function(str) {
		str = formatDate(new Date(), true) + ': ' + str;
		var pane = ge('loggerPane');
		if(pane == undefined || pane == null) {
			ui.addLoggerPane();
			pane = ge('loggerPane');
		}
		pane.innerHTML += str + "\n";
		pane.scrollTop = pane.scrollHeight;
	}
};


var ui = {
	setTitle: function(string) {
		document.title = string;
	},

	setHeader: function(string) {
		show('header');
		ge('title').innerHTML = string;
		this.setTitle(string);
	},
	
	setContent: function(content) {
		ge('content').innerHTML = content;
	},
	
	clearContent: function() {
		this.setContent('');
	},
	
	appendContentElement: function(element) {
		ge('content').appendChild(element);
	},
	
	createProgressBar: function() {
		/*
		var pr = ce('div',
			{id: 'progressbar'},
			{position: 'relative', width: '100%', height: '30px', margin: '3px', backgroundColor: '#DAE2E8'}
		);
		pr.appendChild(
			ce('div',
			{id: 'progressbarbg'}, {width: '0', height: 'inherit', backgroundColor: '#45688E'}
			)
		);
		pr.appendChild(
			ce('div',
			{id: 'progresstext'}, {position: 'absolute', left: '10px', top: '7px', width: '400px', height: 'inherit', color: '#000', zIndex: 69}
			)
		);
		*/
		var pr=vkCe('div',{id:'progressbar',style:"margin:auto;"},vkProgressBar(0,1,624,' '));
		this.clearContent();
		this.appendContentElement(pr);
	},
	
	updateProgressBar: function(processedIncoming, totalIncoming, processedOutgoing, totalOutgoing) {
		var processed=processedIncoming + processedOutgoing;
		var total= totalIncoming + totalOutgoing;
		var percentage = (100 * processed / total);
		var text=user.lang.messagesProcessed + ': ' +
				 user.lang.incoming + ': ' + processedIncoming + '/' + totalIncoming + '; ' +
				 user.lang.outgoing + ': ' + processedOutgoing + '/' + totalOutgoing;

		ge('progressbar').innerHTML=vkProgressBar(processed,total,624,text);
		this.setTitle(Math.floor(percentage) + '% ' + user.lang.processingMessages);
	},
	
	sortBy: function(sorted, sortBy) {
		if(sortBy == 'tot-size') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.inSize + b.outSize - (a.inSize + a.outSize);
			});
		}
		
		if(sortBy == 'in-size') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.inSize - a.inSize;
			});
		}
		
		if(sortBy == 'out-size') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.outSize - a.outSize;
			});
		}
		
		if(sortBy == 'tot') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.inM + b.outM - (a.inM + a.outM);
			});
		}
		
		if(sortBy == 'in') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.inM - a.inM;
			});
		}
		
		if(sortBy == 'out') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.outM - a.outM;
			});
		}
		
		if(sortBy == 'date') {
			sorted.sort(function(a,b) {
				a = statCounter.statByUser[a];
				b = statCounter.statByUser[b];
				return b.lastMessageDate - a.lastMessageDate;
			});
		}
		
		return sorted;
	},
	
	displayStats: function(stats, userData, sortBy) {
	
		 cur.messCheckedNum = 0; actionsShown = false;
	
		this.clearContent();
		handlePageView({width:950});
		/*
		ge('side_bar').style.display = 'none';
		ge('page_body').style.width = '96%';
		*/
		var div = ce('div', {className: 'mailbox'});
		div.innerHTML += '<div id="message" class="message" style="visibility:hidden; display:none;"> </div> ';
		
		this.appendContentElement(div);
		
	
		if(user.verbose) {
			SYS.log('Processing complete, rendering results');
		}
		
		var cPane = ce('div', {id:"mail_bar", className: 'bar clearFix actionBar', innerHTML:
			user.lang.thankYou + (messageProcessor.failed > 0 ? ' ' + user.lang.warning + ': ' + messageProcessor.failed : '') + '<div style="float:right"> &copy; <a href="' + SYS.LINK_TO_CLUB + '" target="_blank">vkontakte-stats</a>, 2010 &ndash; 2011</div>'
		});
		var mActions = ce('div', {id: "mail_bar_act", innerHTML: user.lang.withSelected + ': '}, {display: 'none'});
		
		mActions.innerHTML += '<span id="mail_summary" style="display:none;"></span><a href="#" onclick="statCounter.exportToNote();">' + user.lang.exportToNote + '</a>';
		if(user.plotGraphs) {
			iHTML =  '<span id="plot_graphs_links"> | ';
			iHTML += '<a href="#" onclick="ui.plotGraph(false);" id="plot_msg_graph_link">' + user.lang.plotMessagesGraph + '</a>';
			if(user.kbytes) {
				iHTML += ' | ';
				iHTML += '<a href="#" onclick="ui.plotGraph(true);" id="plot_kb_graph_link">' + user.lang.plotKbytesGraph + '</a>';
			}
			mActions.innerHTML += iHTML + "</span>"
		}
		
		
		cPane.appendChild(ce('div', {id: "graph"}, {display:'none', width: '100%', height: '400px'}) );
		cPane.appendChild(mActions);
		div.appendChild(cPane);
		
		var tdiv = ce('div',{id:'mail_rows'});
		var table = ce('table', {cellspacing: "0", cellpadding: "0", id: 'mail_rows_t'}, {width: '100%'});
		tdiv.appendChild(table);
		div.appendChild(tdiv);
		//<td class="mail_check" onmouseover="mail.checkOver(this, '1767')" onmouseout="mail.checkOut(this, '1767')" onclick="mail.checkChange(this, '1767')" onmousedown="event.cancelBubble = true;">  <div class=""></div></td>
		tableHTML = '<thead>' + '<th class="mail_check" onmouseover="mail.checkOver(this, 0)" onmouseout="mail.checkOut(this, 0)" onclick="myCheckChange(this, 0)"><div class=""></div><input type="hidden" id="post_check_0"></th>' + 
			'<th style="text-align: center, width: 30px"> </th>' + 
			'<th class="messagePicture"> </th>' + 
			'<th class="messageFrom">' + user.lang.nameCol + '</th>' +
			'<th onclick="javascript: ui.sort(\'tot\');" style="cursor: pointer">' + user.lang.numberOfMessagesCol + '</th>' + 
			'<th onclick="javascript: ui.sort(\'out\');" style="cursor: pointer">' + user.lang.sentCol + '</th>' + 
			'<th onclick="javascript: ui.sort(\'in\');" style="cursor: pointer">' + user.lang.receivedCol + '</th>';
		if(user.kbytes) {
			tableHTML +=
			'<th onclick="javascript: ui.sort(\'tot-size\');" style="cursor: pointer">' + user.lang.symbolsCol + '</th>' + 
			'<th onclick="javascript: ui.sort(\'out-size\');" style="cursor: pointer">' + user.lang.sentSymbolsCol + '</th>' + 
			'<th onclick="javascript: ui.sort(\'in-size\');" style="cursor: pointer">' + user.lang.receivedSymbolsCol + '</th>';
		}
		
		tableHTML +=
			'<th onclick="javascript: ui.sort(\'date\');" style="cursor: pointer">' + user.lang.lastMsgCol + '</th>' + 
			'</thead>';
			
		table.innerHTML  = tableHTML;

		var tbody = ce('tbody');
		table.appendChild(tbody);
		
		var sorted = [statCounter.ALL_ID].concat(this.sortBy(getKeys(stats), sortBy));

		for(var rank = 0; rank < sorted.length; rank ++) {
			var uid = sorted[rank];
			
			sdata = statCounter.getStatData(uid);
			udata = statCounter.getUserData(uid);
			
			var tr = ce('tr', {id: 'mess' + uid});
			//class="mail_check" onmouseover="mail.checkOver(this, 0)" onmouseout="mail.checkOut(this, 0)"
			var tdR = ce('td', {innerHTML: uid == statCounter.ALL_ID ? '' : rank}, {textAlign: 'center',  width: "30px"});
			var tdS = ce('td', {innerHTML: '<div class=""></div><input type="hidden" id="post_check_' + uid + '">', className: 'mail_check'});
			tdS.setAttribute('onmouseover', "mail.checkOver(this, '" + uid + "')");
			tdS.setAttribute('onmouseout', "mail.checkOut(this, '" + uid + "')");
			tdS.setAttribute('onclick', "myCheckChange(this, '" + uid + "')");
			
			var tdP = ce('td', {innerHTML: uid == statCounter.ALL_ID ? '' : ('<a href="/id' + uid + '" target="_blank"><img src="' + udata.photo + '" /></a>'), className: 'messagePicture'});
			var tdN = ce('td', {innerHTML: (uid == statCounter.ALL_ID ? '' : ('<a href="/id' + uid + '" target="_blank">')) + udata.first_name + ' ' + udata.last_name + (uid == statCounter.ALL_ID ? '' : '</a>'), className: 'messageFrom'});
			var tdT = ce('td', {innerHTML: sdata.inM + sdata.outM});
			var tdO = ce('td', {innerHTML: sdata.outM});
			var tdI = ce('td', {innerHTML: sdata.inM});
			if(user.kbytes) {
				var tdST = ce('td', {innerHTML: sdata.inSize + sdata.outSize});
				var tdSO = ce('td', {innerHTML: sdata.outSize});
				var tdSI = ce('td', {innerHTML: sdata.inSize});
			}
			var tdL = ce('td', {innerHTML: '<a href="mail.php?act=show&id=' + sdata.lastMessageId + '" target="_blank">' + formatDate(new Date(sdata.lastMessageDate * 1000)) + '</a>'});

			tr.appendChild(tdS);
			tr.appendChild(tdR);
			
			tr.appendChild(tdP);
			tr.appendChild(tdN);
			tr.appendChild(tdT);
			tr.appendChild(tdO);
			tr.appendChild(tdI);
			if(user.kbytes) {
				tr.appendChild(tdST);
				tr.appendChild(tdSO);
				tr.appendChild(tdSI);
			}
			tr.appendChild(tdL);
			tbody.appendChild(tr);
		}
	},
	
	sort: function(sortBy) {
		this.displayStats(statCounter.statByUser, statCounter.userData, sortBy);
	},
	
	requestSettings: function() {
		var mbox = new MessageBox({title: user.lang.appName + ' ' + SYS.VERSION});//user.lang.settingsText

		mbox.addButton(box_cancel,function(){
			mbox.hide();
		},'no');		
		mbox.addButton(user.lang.startButton,function(){
			mbox.hide();
			//vkDisableAjax();
			messageProcessor.start();
		});

		html = '<div><h4>'+user.lang.settingsText+'</h4></div>';//*
		html += '<div style="width: 300px; height: 30px;"><input type="hidden" id="param_verbose" /></div>';
		html += '<div style="width: 300px; height: 30px;"><input type="hidden" id="param_kbytes" /></div>';
		html += '<div style="width: 300px; height: 30px;"><input type="hidden" id="param_sort_kbytes" /></div>';
		html += '<div style="width: 300px; height: 30px;"><input type="hidden" id="param_friends_only" /></div>';
		html += '<div style="width: 300px; height: 30px;"><input type="hidden" id="param_fancy_graphs" /></div>';
		
		mbox.content(html).show();
		
		new Checkbox(ge('param_verbose'), {
			label: user.lang.verbose,
			checked: 0,
			onChange: function() {user.verbose=!user.verbose;}
		});
		
		new Checkbox(ge('param_kbytes'), {
			label: user.lang.kbytes,
			checked: 1,
			onChange: function() {user.kbytes = !user.kbytes;}
		});

		new Checkbox(ge('param_sort_kbytes'), {
			label: user.lang.sortByKBytes,
			checked: 0,
			onChange: function() {user.sortByKBytes = !user.sortByKBytes;}
		});
		
		new Checkbox(ge('param_friends_only'), {
			label: user.lang.friendsOnly,
			checked: 0,
			onChange: function() {user.friendsOnly = !user.friendsOnly;}
		});
		
		new Checkbox(ge('param_fancy_graphs'), {
			label: user.lang.wantToPlotGraphs,
			checked: 1,
			onChange: function() {user.plotGraphs = !user.plotGraphs;}
		});
	},
	
	addLoggerPane: function(){
		var t = ce('textarea', {'cols': 80, 'rows': 20, id: 'loggerPane'}, {fontFamily: 'Courier new'});
		insertAfter(t,ge('content'));
	},
	
	removeLoggerPane: function() {
		var a = ge('loggerPane');
		if( a != undefined) {
			a.parentNode.removeChild(a);
		}
	},
	
	onNoteNotCreated: function() {
		ge('message').innerHTML = user.lang.noteFailure;
		ge('message').style.display = 'block';
		ge('message').style.visibility = 'visible';
	},
	
	onNoteCreated: function(nid) {
		ge('message').innerHTML = user.lang.noteSuccess + ". <a href=\"/note" + user.uid + '_' + nid + '" target="_blank">' + user.lang.seeNote + '</a>';
		ge('message').style.display = 'block';
		ge('message').style.visibility = 'visible';
	},
	
	sentColors: [0x67dc3e, 0xf3c740, 0xf0483b],
	receivedColors: [0x7fc966, 0xedcb65, 0xf06459],
	
	plotGraph: function(kBytes) {
	
		ge('graph').style.display = '';
		var commonVars = {
			isRTL: window.is_rtl,
			'lang.select_graphs':fixQuot('filter'),
			'lang.months':fixQuot('January,February,March,April,May,June,July,August,September,October,November,December'),
			'lang.dayMonths':fixQuot('January,February,March,April,May,June,July,August,September,October,November,December'),
			'lang.dateFormats.day_fullmon_year_hour':fixQuot('{day} {dayMonth} {year}, {hour12}:00'),
			'lang.dateFormats.day_fullmon_year':fixQuot('{month} {day}, {year}'),
			'lang.dateFormats.day_mon':fixQuot('{day} {month}'),
			'lang.dateFormats.day_fullmon':fixQuot('{day} {month}'),
			'lang.loading': fixQuot('Loading...'),
			'lang.no_data': fixQuot('No input data'),
			'lang.data_empty': fixQuot('Input data is empty'),
			'lang.error_loading': fixQuot('Loading error')
		};
		var params = {
			allowfullscreen: 'true'
		};
		flashVars = clone(commonVars);
		
		var table = ge('mail_rows_t');
		var graphData = '[';
		var rank = 0;
		for (var i = 0; i < table.rows.length; ++i) {
			var row = table.rows[i];
			var id = row.id ? intval(row.id.replace(/^mess/, '')) : 0;
			if (id) {
				if(cur.messChecked[id]) {//intval(ge('post_check_' + id).value)
					if(rank > 0) {
						graphData += ',';
					}
					
					if(kBytes) {
						var totBytesSent = 0, totBytesRec = 0;
						var receivedSizes = '{"c": ' + this.receivedColors[rank] + ',"f": 0, "d": [';
						var sentSizes = '{"c": ' + this.sentColors[rank] + ',"f": 0, "d": [';
					} else {
						var totSent = 0, totRec = 0;
						var sentMessages = '{"c": ' + this.sentColors[rank] + ',"f": 0, "d": [';
						var receivedMessages = '{"c": ' + this.receivedColors[rank] + ',"f": 0, "d": [';
					}
					for(var entry in statCounter.getStatData(id).history) {
						var histData = statCounter.getStatData(id).history[entry]
						
						if(kBytes) {
							totBytesSent += histData.outSize;
							totBytesRec += histData.inSize;
							sentSizes += '[' + entry + ',' + totBytesSent + '],';
							receivedSizes += '[' + entry + ',' + totBytesRec + '],';
						} else {
							totSent += histData.outM;
							totRec += histData.inM;
							sentMessages += '[' + entry + ',' + totSent + '],';
							receivedMessages += '[' + entry + ',' + totRec + '],';
						}
					}
					
					
					
					if(kBytes) {
						sentSizes += '[' + statCounter.lastMessageTime + ',' + totBytesSent + ']], "name": "' + statCounter.getUserData(id).first_name + ' ' + statCounter.getUserData(id).last_name + ': ' + user.lang.sentCol + '"}';
						receivedSizes += '[' + statCounter.lastMessageTime + ',' + totBytesRec + ']], "name": "' + statCounter.getUserData(id).first_name + ' ' + statCounter.getUserData(id).last_name + ': ' + user.lang.receivedCol + '"}';
						graphData += sentSizes + ',' + receivedSizes;
					} else {
						sentMessages += '[' + statCounter.lastMessageTime + ',' + totSent + ']], "name": "' + statCounter.getUserData(id).first_name + ' ' + statCounter.getUserData(id).last_name + ': ' + user.lang.sentCol + '"}';
						receivedMessages += '[' + statCounter.lastMessageTime + ',' + totRec + ']], "name": "' + statCounter.getUserData(id).first_name + ' ' + statCounter.getUserData(id).last_name + ': ' + user.lang.receivedCol + '"}';
						graphData += sentMessages + ',' + receivedMessages;
					}
					
					rank ++;
				}
			}
		}
		flashVars.graphdata = fixQuot(graphData + ']');
		if(user.verbose) {
			SYS.log('plotting: ' + flashVars.graphdata);
		}
		flashVars.div_id = 'graph';
		swfobject.embedSWF("/swf/graph.swf?0.28", "graph", "100%", "400px", "8", "", flashVars, params);
		
	}
};

//TODO: add date statistics
var statCounter = {
	statByUser: {},
	userData: {},
	lastMessageTime: 0,
	overallStats: {
		inM: 0,
		outM: 0,
		lastMessageDate: 0,
		lastMessageId: 0,
		inSize: 0,
		outSize: 0,
		history: {}
	},
	ALL_ID: -1,
	
	createEmptyStatsFor: function(message) {
		var newStats = {
			inM: 0,
			outM: 0,
			lastMessageDate: message.date,
			lastMessageId: message.mid,
			inSize: 0,
			outSize: 0,
			history: {}
			// TODO: add words distribution
		};
		this.statByUser[message.uid] = newStats;
		return newStats;
	},
	
	updateStats: function(message, userStats) {
		if(userStats.lastMessageDate < message.date) {
			userStats.lastMessageDate = message.date;
			userStats.lastMessageId = message.mid;
		}
		
		if(statCounter.lastMessageTime < message.date) {
			statCounter.lastMessageTime = message.date;
		}
		
		if(!message.out) {
			userStats.inM ++;
			userStats.inSize += message.body.length;
		} else {
			userStats.outM ++;
			userStats.outSize += message.body.length;
		}
		if(user.plotGraphs) {
			userStats.history[message.date] = {inM: message.out ? 0 : 1, outM: message.out ? 1 : 0, inSize: message.out ? 0 : message.body.length, outSize: message.out ? message.body.length : 0};
		}
	},
	
	processSingleMessage: function(message) {
		userStats = this.statByUser[message.uid];
		if(userStats == undefined) {
			userStats = this.createEmptyStatsFor(message);
		}
		this.updateStats(message, userStats);
		this.updateStats(message, this.overallStats);
		
	},
	
	getStatData: function(id) {
		if(id == this.ALL_ID) {
			return this.overallStats;
		}
		
		return this.statByUser[id];
	},
	
	getUserData: function(id) {
		if(id == this.ALL_ID) {
			return {first_name: user.lang.totalFirstName, last_name : user.lang.totalLastName};
		}
		
		return (this.userData[id] == undefined ? {first_name: 'DELETED', last_name : 'DELETED'} : this.userData[id]);
	},
	
	generateNoteContents: function() {
		var value = "[[club21792535|vkontakte-stats]]\n\n";
		value += "{|\n";
		value += "|-\n";
		value += "! ";
		value += "!! " + user.lang.nameCol;
		value += "!! " + user.lang.numberOfMessagesCol;
		value += "!! " + user.lang.sentCol;
		value += "!! " + user.lang.receivedCol
		if(user.kbytes) {
			value += "!! " + user.lang.symbolsCol;
			value += "!! " + user.lang.sentSymbolsCol;
			value += "!! " + user.lang.receivedSymbolsCol;
		}
		
		value += "\n";
		
		var rank = 0;
		var table = ge('mail_rows_t');
		for (var i = 0; i < table.rows.length; ++i) {
			var row = table.rows[i];
			var id = row.id ? row.id.replace(/^mess/, '') : 0;
			if (id != 0) {
				if(id != this.ALL_ID) {
					rank++;
				}
				
				if(cur.messChecked[id]) {//intval(ge('post_check_' + id).value)
					
					sdata = this.getStatData(id);
					udata = this.getUserData(id);
					
					value += "|-\n";
					value += "| " + (id != this.ALL_ID ? rank : '') + "\n";
					value += "| [[id" + id + "|" + udata.first_name + ' ' + udata.last_name + "]]\n";
					value += "| " + (sdata.inM + sdata.outM) + "\n";
					value += "| " + sdata.outM + "\n";
					value += "| " + sdata.inM + "\n";
					if(user.kbytes) {
						value += "| " + (sdata.inSize + sdata.outSize) + "\n";
						value += "| " + sdata.outSize + "\n";
						value += "| " + sdata.inSize + "\n";
					}
				}
			}	
		}
		
		value += "|}\n";
		
		return value;
	},
	
	exportToNote: function() {
		apiConnector.createNote(user.lang.appName, this.generateNoteContents(), function(r) {
			var parsedResponse = r;
			if(parsedResponse.response == undefined) {
				SYS.log('Note creationg failed!' + rt);
				ui.onNoteNotCreated();
			} else {
				var nid = parsedResponse.response.nid;
				if(user.verbose) {
					SYS.log('Note created: ' + nid);
				}
				ui.onNoteCreated(nid);
			}
		})
	}
};

var messageProcessor = {

	incomingMessages: undefined,
	processedIncomingMessages: 0,
	outgoingMessages: undefined,
	processedOutgoingMessages: 0,
	failed: 0,
	
	onUserProfilesLoaded: function(parsedResponse) {
		if(parsedResponse.response == undefined) {
			SYS.fatal(response);
		}
		parsedResponse = parsedResponse.response;
		for(var i = 0; i < parsedResponse.length; i ++) {
			statCounter.userData[parsedResponse[i].uid] = parsedResponse[i];
		}
		ui.setHeader(user.lang.done + '!');
		ui.displayStats(statCounter.statByUser, statCounter.userData, user.kbytes && user.sortByKBytes ? 'tot-size' : 'tot');
		
	},
	
	onAllMessagesLoaded: function() {
		ui.updateProgressBar(this.processedIncomingMessages, this.incomingMessages, this.processedOutgoingMessages, this.outgoingMessages);
		
		ui.setHeader(user.lang.gettingNames + '...');
		
		if(user.verbose) {
			SYS.log('Got all messages, getting user names');
		}
		
		this.api.getUserNames(getKeys(statCounter.statByUser),messageProcessor.onUserProfilesLoaded);
	},
	
	onMessagesLoaded: function(parsedResponse, out) {
	
		var offset = 0;
		
		if (parsedResponse == undefined) {
		
			this.failed += SYS.MESSAGES_PER_REQUEST;
			SYS.log('Skipping ' + SYS.MESSAGES_PER_REQUEST + ' messages...');

			if (!out) {
				this.processedIncomingMessages += SYS.MESSAGES_PER_REQUEST;
				offset = this.offset + SYS.MESSAGES_PER_REQUEST;
			} else {
				this.processedOutgoingMessages += SYS.MESSAGES_PER_REQUEST;
				offset = this.offset + SYS.MESSAGES_PER_REQUEST;
			}

		} else if (parsedResponse.response != undefined) {
		
			var response = parsedResponse.response;
			var currentMessages = response[0];
			
			if(user.verbose) {
				SYS.log('Got ' + (response.length - 1) + ' messages');
			}
			
			for(var i = 1; i < response.length; i ++) {
				statCounter.processSingleMessage(response[i]);
			}
			
			
			if(!out) {
				this.processedIncomingMessages += response.length - 1;
				offset = this.processedIncomingMessages + (currentMessages - this.incomingMessages);
				
				if(currentMessages != this.incomingMessages && user.verbose) {
					SYS.log('By the way, the user has received ' + (currentMessages - this.incomingMessages) + ' message(s) after the script was started');
				}
				
				if(offset >= currentMessages || (SYS.DEBUG && offset >= SYS.MESSAGES_TO_PROCESS_IN_DEBUG_MODE)) {
					out = 1;
					offset = 0;
				}
			} else {
				this.processedOutgoingMessages += response.length - 1;
				offset = this.processedOutgoingMessages + (currentMessages - this.outgoingMessages);
				
				if(currentMessages != this.outgoingMessages && user.verbose) {
					SYS.log('By the way, the user has sent ' + (currentMessages - this.outgoingMessages) + ' message(s) after the script was started');
				}
				
				if(offset >= currentMessages || (SYS.DEBUG && offset >= SYS.MESSAGES_TO_PROCESS_IN_DEBUG_MODE)) {
					this.onAllMessagesLoaded();
					return;
				}
			}
			
			ui.updateProgressBar(this.processedIncomingMessages, this.incomingMessages, this.processedOutgoingMessages, this.outgoingMessages);
		} else {
			out = this.out;
			offset = this.offset;
		}
		
		
		
		var elapsedTime = (new Date()).getTime() - this.requestStartTime;
		
		if(user.verbose) {
			SYS.log('Elapsed time:  ' + elapsedTime + ' ms');
		}
		
		if(elapsedTime >= SYS.MSEC_BETWEEN_REQUESTS) {
			if(user.verbose) {
				SYS.log('Starting new request...');
			}
			this.requestStartTime = (new Date()).getTime();
			this.api.getMessages(out, offset, SYS.MESSAGES_PER_REQUEST, function(response) {messageProcessor.onMessagesLoaded(response, out)});
		} else {
			this.out = out;
			this.offset = offset;
			if(user.verbose) {
				SYS.log('Scheduling new request in ' + (SYS.MSEC_BETWEEN_REQUESTS - elapsedTime) + 'ms');
			}
			setTimeout("messageProcessor.requestStartTime = (new Date()).getTime(); messageProcessor.api.getMessages(messageProcessor.out, messageProcessor.offset, SYS.MESSAGES_PER_REQUEST, function(response) {messageProcessor.onMessagesLoaded(response, messageProcessor.out)});", SYS.MSEC_BETWEEN_REQUESTS - elapsedTime);
		}
	},
	
	startProcessingMessages: function() {
		ui.setHeader(user.lang.processingMessages + '...');
		ui.createProgressBar();
		ui.updateProgressBar(0, this.incomingMessages, 0, this.outgoingMessages);
		this.requestStartTime = (new Date()).getTime();
		
		this.api.getMessages(0, 0, SYS.MESSAGES_PER_REQUEST, function(response) {messageProcessor.onMessagesLoaded(response, 0)});
	},

	onMessageNumbersLoaded: function(parsedResponse, out) {
		var response = parsedResponse.response;
		
		if(user.verbose) {
			SYS.log('Loaded message numbers [' + out + ']: ' + response[0]);
		}
		
		if(!out) {
			this.incomingMessages = response[0];
		} else {
			this.outgoingMessages = response[0];
		}
		
		if(this.incomingMessages != undefined && this.outgoingMessages != undefined) {
			setTimeout(function() {messageProcessor.startProcessingMessages()}, SYS.MSEC_BETWEEN_REQUESTS);
		}
	},

	getNumberOfMessages: function() {
		this.api.getMessages(0, 0, 1, function(response) {messageProcessor.onMessageNumbersLoaded(response, 0)});
		setTimeout(function() {apiConnector.getMessages(1, 0, 1, function(response) {messageProcessor.onMessageNumbersLoaded(response, 1)})}, SYS.MSEC_BETWEEN_REQUESTS * 2);
	},

	start: function() {
	
		this.api = apiConnector;
	
		if(user.verbose) {
			ui.addLoggerPane();
			SYS.log('Started');
		}

		ui.setHeader(user.lang.loadingMessageNumbers);
		this.getNumberOfMessages();
	}
};

apiConnector = {

	API_ADDRESS: '/api.php',
	API_VERSION: '3.0',
	LOGON_FAIL_STRING: 'login_fail',
	LOGON_SUCCESS_STRING: 'login_success',	
	getMessages: function(out, offset, count, onDone) {
		if(user.verbose) {
			SYS.log('getMessages invoked: out=' + out + "; offset=" + offset);
		}
		var previewLength = user.kbytes ? 0 : 1;
		dApi.call('messages.get',{filters:user.friendsOnly?4:0,offset:offset,out:out,preview_length:previewLength,count:count},onDone);
	},
	
	doGetUserData: function(ids, onDone) {
		if(user.verbose) {
			SYS.log('doGetUserData invoked: ids=' + ids);
		}
		dApi.call('getProfiles',{uids:ids.join(','),fields:'photo'},onDone);		
	},
	
	getUserNames: function(ids, onDone) {
		ids = splitArrayToSubArrays(ids, SYS.MAX_USERS_PER_REQUEST);
		//this.onDone = onDone;
		//messageProcessor.pendingUserDataRequests = ids.length;
		//
		var res=null;
		var i=0;
		var scan=function(r){
			if (r && r.response){
			   if (!res) res=r;
			   else for (var x=0; x<r.response.length;x++) res.response.push(r.response[x]);
			}
			if (!ids[i]) {
				onDone(res);
				return;
			}
			setTimeout(function(){
				apiConnector.doGetUserData(ids[i],scan);
				i++;
			},400);
		};
		scan();
	},
	
	createNote: function(title, text, onDone) {
		if(user.verbose) {
			SYS.log('createNote:  title=' +title + "; text=" + text);
		}
		dApi.call('notes.add',{text:text,title:title},onDone);
	}
};

function vkStats_Init(){
	user = {
		lang: SYS.LANGUAGES[langConfig.id] == undefined ? SYS.LANGUAGES[3].strings : SYS.LANGUAGES[langConfig.id].strings,
		verbose: false,
		kbytes: true,
		friendsOnly: false,
		plotGraphs: true,
		sortByKBytes: false,
		uid: remixmid()
	};
}
function vkStats_Run(){	
	loadjscssfile(SYS.PATH_TO_SWFOBJECT, "js");
	ui.requestSettings();
}

function vkStats_OnNewLocation(nav_obj,cur_module){
	// #597da3
	var icon_src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYklEQVQ4jWNgoAaIrF38n1y9TIQMJmQ4XgModgFVDYisXawQWbtYAV2chQTL7kNpRrJcgAsMQgNwBRYugC0QsQYW0S4gFZASjQwMDBAvwtjLm2MfMEIFycpMy5tjifImXgAAW1oXrK8osFAAAAAASUVORK5CYII=";
	if (nav.objLoc[0]=='mail'){
		if (!ge('vk_stat_msg') && ge('mail_tabs')){
			var li=vkCe('li',{"class":'t_r', id:'vk_stat_msg'},'\
				<a href="#" onmouseover="showTooltip(this,{text:\''+user.lang.appName+ ' v' + SYS.VERSION+'\'});" onclick="vkStats_Run(); return false;"><img style="margin-bottom:-5px;" src="'+icon_src+'"></a><span class="divide">|</span>\
			');
			ge('mail_tabs').appendChild(li);
		}
		if(nav.objLoc['act']=='show'){
			hide('vk_stat_msg');
		} else {
			show('vk_stat_msg');
		}	
	}
}

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
	var PLUGIN_ID = 'vkstat';
	var PLUGIN_NAME = 'VK-STATS - Messages statistic';
	
	var ADDITIONAL_CSS='#vk_stat_msg a img{opacity:0.5} #vk_stat_msg a:hover img{opacity:1}';
	
	/* FUNCTIONS */
	var INIT = vkStats_Init;					// function()
	var ON_NEW_LOCATION = vkStats_OnNewLocation;// function(nav_obj,cur_module_name);
	var PROCESS_NEW_SCRIPT = null;				// function(file_name);
	var ON_STORAGE = null; 		  				// function(command_id,command_obj);
	var PROCESS_LINK_FUNCTION = null;			// function(link);
	var PROCESS_NODE_FUNCTION = null;			// function(node);
	
	
	
	vkopt_plugins[PLUGIN_ID]={
		Name:PLUGIN_NAME,
		css:ADDITIONAL_CSS,
		init:INIT,
		onLocation:ON_NEW_LOCATION,
		onLibFiles:PROCESS_NEW_SCRIPT,
		onStorage :ON_STORAGE,
		processLinks:PROCESS_LINK_FUNCTION,
		processNode:PROCESS_NODE_FUNCTION
	};
	if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();


