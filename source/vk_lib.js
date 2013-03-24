// ==UserScript==
// @name          VKOpt 2.x Lib
// @author        KiberInfinity( /id13391307 )
// @namespace     http://vkopt.net/
// @description   Vkontakte Optimizer 2.x
// @include       *vkontakte.ru*
// @include       *vk.com*
// @include       *userapi.com*
// @include       *vk.me*
// @include       *vkadre.ru*
// @include       *durov.ru*
// @include       *youtube.com*
// @include       *vimeo.com*
// ==/UserScript==
//*

//*/
/*!
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};


if (!window.JSON) JSON ={
	stringify:function (obj) {
		var t = typeof (obj);
		if (t != "object" || obj === null) {
			if (t == "string") obj = '"'+obj+'"';
			return String(obj);
		} else {
			var n, v, json = [], arr = (obj && obj.constructor == Array);
			for (n in obj) {
				v = obj[n]; t = typeof(v);
				if (t == "string") v = '"'+v+'"';
				else if (t == "object" && v !== null) v = JSON.stringify(v);
				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	},
	parse: function (str) {
		if (str === "") str = '""';
		eval("var p=" + str + ";");
		return p;
	}
};
JSON.Str=JSON.stringify;
/*
if (!window.localStorage) localStorage={
	getItem:function(){},
	setItem:function(){}
}
*/


/* FUNCTIONS LEVEL 0*/
///////////
function isNewLib(){return window.showWriteMessageBox?true:false}
/* CROSS */
var _ua_ = window.navigator.userAgent.toLowerCase();
var vkbrowser = {
  version: (_ua_.match( /.+(?:me|ox|on|rv|it|era|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: /opera/i.test(_ua_),
  msie: (/msie/i.test(_ua_) && !/opera/i.test(_ua_)),
  msie6: (/msie 6/i.test(_ua_) && !/opera/i.test(_ua_)),
  msie7: (/msie 7/i.test(_ua_) && !/opera/i.test(_ua_)),
  msie8: (/msie 8/i.test(_ua_) && !/opera/i.test(_ua_)),
  msie9: (/msie 9/i.test(_ua_) && !/opera/i.test(_ua_)),
  mozilla: /firefox/i.test(_ua_),
  chrome: /chrome/i.test(_ua_),
  safari: (!(/chrome/i.test(_ua_)) && /webkit|safari|khtml/i.test(_ua_)),
  iphone: /iphone/i.test(_ua_),
  ipod: /ipod/i.test(_ua_),
  iphone4: /iphone.*OS 4/i.test(_ua_),
  ipod4: /ipod.*OS 4/i.test(_ua_),
  ipad: /ipad/i.test(_ua_),
  android: /android/i.test(_ua_),
  bada: /bada/i.test(_ua_),
  mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile/i.test(_ua_),
  msie_mobile: /iemobile/i.test(_ua_),
  safari_mobile: /iphone|ipod|ipad/i.test(_ua_),
  opera_mobile: /opera mini|opera mobi/i.test(_ua_),
  opera_mini: /opera mini/i.test(_ua_),
  mac: /mac/i.test(_ua_)
}
if (window.opera) {vkbrowser.mozilla=false; vkbrowser.opera=true;}



if (vkbrowser.mozilla){
	if (window.Node)
	{
	  Node.prototype.__defineGetter__('innerText', function() {
		if (this.nodeType == 3)
		  return this.nodeValue;
		else
		{
		  var result = '';
		  for (var child = this.firstChild; child; child = child.nextSibling)
			result += child.innerText;
		  return result;
		}
	  });
	}
	if (typeof(HTMLElement) != "undefined") {
		var _emptyTags = {
		   "IMG": true,
		   "BR": true,
		   "INPUT": true,
		   "META": true,
		   "LINK": true,
		   "PARAM": true,
		   "HR": true
		};
		
		HTMLElement.prototype.__defineGetter__("outerHTML", function () {
		   var attrs = this.attributes;
		   var str = "<" + this.tagName;
		   for (var i = 0; i < attrs.length; i++)
			  str += " " + attrs[ i ].name + "=\"" + attrs[ i ].value + "\"";
		
		   if (_emptyTags[this.tagName])
			  return str + ">";
		
		   return str + ">" + this.innerHTML + "</" + this.tagName + ">";
		});
		
		HTMLElement.prototype.__defineSetter__("outerHTML", function (sHTML) {
		   var r = this.ownerDocument.createRange();
		   r.setStartBefore(this);
		   var df = r.createContextualFragment(sHTML);
		   this.parentNode.replaceChild(df, this);
		});
	}
}

if (!window.Audio){
  Audio= function(url){
    this.notification    = function(){this.play  = function(){};};
    this.play  = function(){};
  }
}

var vkMozExtension = {  
  send_request: function(data, callback) { // analogue of chrome.extension.sendRequest  
    var request = document.createTextNode("");  
    request.setUserData("data", data, null);  
    if (callback) {
      request.setUserData("callback", callback, null);  
      document.addEventListener("mozext-response", function(event) {  
        var node = event.target, callback = node.getUserData("callback"), response = node.getUserData("response");  
        document.documentElement.removeChild(node);  
        document.removeEventListener("mozext-response", arguments.callee, false);  
        return callback(response);  
      }, false);  
    }  
    document.documentElement.appendChild(request);  
    var sender = document.createEvent("HTMLEvents");  
    sender.initEvent("mozext-query", true, false);  
    return request.dispatchEvent(sender);  
  },  

  callback: function(response) {    return alert("response: " + (response && response.toSource ? response.toSource() : response)); }  
} 
/* FUNCTIONS. LEVEL 1 */
	//LANG   
   function print_r( array, return_val ) {
      var output = "", pad_char = " ", pad_val = 4;

      var formatArray = function (obj, cur_depth, pad_val, pad_char) {
         if(cur_depth > 0)
            cur_depth++;

         var base_pad = repeat_char(pad_val*cur_depth, pad_char);
         var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
         var str = "";

         if(typeof obj=='object' || typeof obj=='array' || (obj.length>0 && typeof obj!='string' && typeof obj!='number')) {
            if(!(typeof obj=='object' || typeof obj=='array'))str = '\n'+obj.toString()+'\n';
         str += '[\n';//"Array\n" + base_pad + "(\n";
            for(var key in obj) {
               if(typeof obj[key]=='object' || typeof obj[key]=='array' || (obj.length>0 && typeof obj!='string' && typeof obj!='number')) {
             str += thick_pad + ""+key+": "+((!(typeof obj=='object' || typeof obj=='array'))?'\n'+obj[key]+'\n':'')+formatArray(obj[key], cur_depth+1, pad_val, pad_char)+'\n';
               } else {
                  str += thick_pad + ""+key+": " + obj[key] + "\n";
               }
            }
            str += base_pad + "]\n";
         } else {
            str = obj.toString();
         };

         return str;
      };

      var repeat_char = function (len, char) {
         var str = "";
         for(var i=0; i < len; i++) { str += char; };
         return str;
         return str;
      };

      output = formatArray(array, 0, pad_val, pad_char);
         return output;
   }
	function vkTimer(callback, delay) {
       /* Example:
         var timer = new Timer(function() {
             alert("Done!");
         }, 1000);
         timer.pause();
         timer.resume();         
       */ 
       var timerId, start, remaining = delay;

       this.pause = function() {
           window.clearTimeout(timerId);
           remaining -= new Date() - start;
       };

       this.resume = function() {
           start = new Date();
           timerId = window.setTimeout(callback, remaining);
       };

       this.resume();
   }
	function vkCutBracket(s,bracket){
		if (CUT_VKOPT_BRACKET || bracket==2) s=(s.substr(0,1)=='[')?s.substr(1,s.length-2):s;
      else if (bracket &&  bracket!=2) s='[ '+s+' ]';
		return s;
	}
	function IDL(i,bracket) {
	  vkLangGet();
     var dec=function(val){
       try {
         return decodeURI(val);
       } catch(e) { }
       return val;
     }
	  if (vk_lang[i]) return vkCutBracket(dec(vk_lang[i]),bracket);
	  if (vk_lang_ru[i]) return vkCutBracket(dec(vk_lang_ru[i]),bracket);
	  if (window.vk_lang_add && vk_lang_add[i]) return vkCutBracket(dec(vk_lang_add[i]),bracket);
	  else return vkCutBracket(i,bracket);
	}

	function vkExtendLang(obj) {
	  if (!window.vk_lang_add) vk_lang_add={};
	  for (var key in obj)  vk_lang_add[key]=obj[key]; 
	}

	function vkLangSet(id,no_reload){
	  vksetCookie('vklang',id);
	  vk_lang=VK_LANGS[id];
	  if (no_reload) InstallRelease();
	  else  location.reload();
	}

	function vkLangGet(){
	  if (!window.vk_lang){
		 var id=vkgetCookie('vklang');
		 if (!id) id=0;
		 vk_lang=VK_LANGS[id]?VK_LANGS[id]:VK_LANGS[0];
	  }
	  return id;
	}
	
	function replaceChars(text, nobr) {
		var res = "";
		for (var i = 0; i<text.length; i++) {
		  var c = text.charCodeAt(i);
		  switch(c) {
			case 0x26: res += "&amp;"; break;
			case 0x3C: res += "&lt;"; break;
			case 0x3E: res += "&gt;"; break;
			case 0x22: res += "&quot;"; break;
			case 0x0D: res += ""; break;
			case 0x0A: res += nobr?"\t":"<br>"; break;
			case 0x21: res += "&#33;"; break;
			case 0x27: res += "&#39;"; break;
			default:   res += ((c > 0x80 && c < 0xC0) || c > 0x500) ? "&#"+c+";" : text.charAt(i); break;
		  }
		}
		return res;
	}
   function vkCleanFileName(s){   return trim(s.replace(/[\\\/\:\*\?\"\<\>\|]/g,'_').replace(/\u2013/g,'-').substr(0,200));   }
   function vkEncodeFileName(s){
      // [^A-Za-zА-Яа-я]
      return s.replace(/([^A-Za-z\u0410-\u042f\u0430-\u044f])/g,function (str, p1, offset, s) {return encodeURIComponent(p1) });
   }
   
   function num_to_text(s){
      s+='';
      return s.length<4?s:s.split('').reverse().join('').replace(/(\d{3})/g,'$1 ').split('').reverse().join('').replace(/^\s+/,'');
   }

	function vkLinksUnescapeCyr(str){
	  var escaped=["%B8", "%E9", "%F6", "%F3", "%EA", "%E5", "%ED", "%E3", "%F8", "%F9", "%E7", "%F5", "%FA", "%F4", "%FB", "%E2", "%E0", "%EF", "%F0", "%EE", "%EB", "%E4", "%E6", "%FD", "%FF", "%F7", "%F1", "%EC", "%E8", "%F2", "%FC", "%E1", "%FE","%A8", "%C9", "%D6", "%D3", "%CA", "%C5", "%CD", "%C3", "%D8", "%D9", "%C7", "%D5", "%DA", "%D4", "%DB", "%C2", "%C0", "%CF", "%D0", "%CE", "%CB", "%C4", "%C6", "%DD", "%DF", "%D7", "%D1", "%CC", "%C8", "%D2", "%DC", "%C1", "%DE"];
	  var unescaped=["\u0451", "\u0439", "\u0446", "\u0443", "\u043a", "\u0435", "\u043d", "\u0433", "\u0448", "\u0449", "\u0437", "\u0445", "\u044a", "\u0444", "\u044b", "\u0432", "\u0430", "\u043f", "\u0440", "\u043e", "\u043b", "\u0434", "\u0436", "\u044d", "\u044f", "\u0447", "\u0441", "\u043c", "\u0438", "\u0442", "\u044c", "\u0431", "\u044e","\u0401", "\u0419", "\u0426", "\u0423", "\u041a", "\u0415", "\u041d", "\u0413", "\u0428", "\u0429", "\u0417", "\u0425", "\u042a", "\u0424", "\u042b", "\u0412", "\u0410", "\u041f", "\u0420", "\u041e", "\u041b", "\u0414", "\u0416", "\u042d", "\u042f", "\u0427", "\u0421", "\u041c", "\u0418", "\u0422", "\u042c", "\u0411", "\u042e"];
	  for (var i=0;i<escaped.length;i++)
		str=str.split(escaped[i]).join(unescaped[i]);
     str=str.replace('%23','#');
	  return str;
	}
   
   function vkFormatTime(t){
      var res, sec, min, hour;
      t = Math.max(t, 0);
      sec = t % 60;
      res = (sec < 10) ? '0'+sec : sec;
      t = Math.floor(t / 60);
      min = t % 60;
      res = min+':'+res;
      t = Math.floor(t / 60);
      if (t > 0) {
         if (min < 10) res = '0' + res;
         res = t+':'+res;
      }
      return res;
   }
	function disableSelectText(node) {    
		node=ge(node);
		  node.onselectstart = function() { return false; }; 
		node.unselectable = "on";
		if (typeof node.style.MozUserSelect != "undefined") node.style.MozUserSelect = "none";
	}
	function disableRightClick (element) {
		function preventer (event) {
			event.preventDefault();
			event.stopPropagation();
			event.cancelBubble = true;
		}

		if(element.addEventListener) {
			element.addEventListener('contextmenu', preventer, false);
		} else if(document.attachEvent) {
			element.attachEvent('oncontextmenu', preventer );
		}
	}
	function vkCe(tagName, attr,inner){
	  var el = document.createElement(tagName);
	  for (var key in attr)  el.setAttribute(key,attr[key]);
	  if (inner) el.innerHTML=inner;
	  return el;
	}
	function DelElem(el)	{
		var Node = ge(el);
		if(Node) Node.parentNode.removeChild(Node);
	}

	function insertAfter(node, ref_node) {
		var next = ref_node.nextSibling;
		if (next) next.parentNode.insertBefore(node, next);
		else ref_node.parentNode.appendChild(node);
	}

	function vkNextEl(cur_el){
	  var next_el=cur_el.nextSibling
	  while(next_el && next_el.nodeType==3) next_el=next_el.nextSibling
	  return next_el;
	}
	function vkaddcss(addcss,id) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
      if (id) styleElement.setAttribute('mark',id);
		styleElement.appendChild(document.createTextNode(addcss));
		document.getElementsByTagName("head")[0].appendChild(styleElement);
		addcss='';
	}
	
	function $c(type,params){
		if(type == "#text" || type == "#"){
			return document.createTextNode(params);
		}else if(typeof(type) == "string" && type.substr(0, 1) == "#"){
			return document.createTextNode(type.substr(1));
		}else{
			var node = document.createElement(type);
		}
		for(var i in params){
			switch(i){
				case "kids":
				for(var j in params[i]){
					if(typeof(params[i][j]) == 'object'){
						node.appendChild(params[i][j]);
					}
				}
				break;
				case "#text":
				node.appendChild(document.createTextNode(params[i]));
				break;
				case "html":
				node.innerHTML = params[i];
				break;
				default:
				node.setAttribute(i, params[i]);
			}
		}
		return node;
	}

	function $x(xpath, root) {
		   root = root ? root : document;
		   try {
				   var a = document.evaluate(xpath, root, null, 7, null);
		   } catch(e) {
				   return[];
		   }
		   var b=[];
		   for(var i = 0; i < a.snapshotLength; i++) {
				   b[i] = a.snapshotItem(i);
		   }
		   return b;
	}
	function $xp(s, t){
		return new DOMParser().parseFromString(s, "text/xml");
	}
	function $hp(s){
		var a = document.createElement("div");
		a.innerHTML = s;
		return a;
	}
	function $rnd(tmpl, ns) {
		var fn = function(w, g) {
			g = g.split("|");
			var cnt = ns[g[0]];
			for(var i = 1; i < g.length; i++)
				cnt = eval(g[i])(cnt);
			return cnt || w;
		};
		return tmpl.replace(/\$\{([A-Za-z0-9_|.]+)\}/g, fn);
	}
	function vkLocalStoreReady(){
	  if (window.localStorage || window.GM_SetValue || window.sessionStorage) {
		return true;
	  } else { 
		return false; 
	  }
	}

	function vkSetVal(key,val){
	  if (typeof localStorage!='undefined') {localStorage[key]=val;}//Chrome, FF3.5+
	  else if (typeof GM_SetValue!='undefined'){ GM_SetValue(key,val); }//Mozilla
	  else if (typeof sessionStorage!='undefined'){sessionStorage.setItem(key, val);} //Opera 10.5x+
	  else { vksetCookie(key,val)}
	}

	function vkGetVal(key){
	  if (typeof localStorage!='undefined') { return localStorage[key];}//Chrome, Opera, FF3.5+
	  else if (typeof GM_GetValue!='undefined'){ return String(GM_GetValue(key)); }//Mozilla with Greasemonkey
	  else if (typeof sessionStorage!='undefined'){ return sessionStorage.getItem(key);}//Opera 10.5x+
	  else { return vkgetCookie(key)}
	}
	

	function vksetCookie(cookieName,cookieValue,nDays,domain){
		if (vkLocalStoreReady() && SetsOnLocalStore[cookieName]){
		vkSetVal(cookieName,cookieValue);
	  } else {
		var today = new Date();
		var expire = new Date();
		if (nDays==null || nDays==0) nDays=365;
		expire.setTime(today.getTime()+ 3600000*24*nDays);
		document.cookie = cookieName+ "="+ escape(cookieValue)+
		";expires="+ expire.toGMTString()+
		((domain) ? ";domain=" + domain : ";domain="+location.host);
		}
		if (cookieName=='remixbit') SettBit=cookieValue;//vksetCookie('remixbit',SettBit);

	}

	function vkgetCookie(name,temp){
	  if (name=='remixbit' && SettBit && !temp) return SettBit;
	  if (name=='remixmid') { if (temp) return false; else { tmp=remixmid(); return tmp; } }
	  if (vkLocalStoreReady() && SetsOnLocalStore[name]){
		var val=vkGetVal(name);
		if (val) return val;
	  }
		var dc = document.cookie;
		var prefix = name + "=";
		var begin = dc.indexOf("; " + prefix);
		if (begin == -1){
			begin = dc.indexOf(prefix);
			if (begin != 0) return null;
		}	else	{		begin += 2;	}
		var end = document.cookie.indexOf(";", begin);
		if (end == -1)	{		end = dc.length;	}
		return unescape(dc.substring(begin + prefix.length, end));
	}
	
	function delCookie(name, path, domain) {
		if ( vkgetCookie( name ) ) document.cookie = name + '=' +
		( ( path ) ? ';path=' + path : '') +
		( ( domain ) ? ';domain=' + domain : '' ) +
		';expires=Thu, 01-Jan-1970 00:00:01 GMT';
	}
	
	function getSet(num,type) {
	  var sett=vkgetCookie('remixbit');
	  if (!sett) {
		vksetCookie('remixbit',DefSetBits);
		sett=DefSetBits;
	  }
	  
	  /*if (!SettBit){
	  if (!vkgetCookie('remixbit')) return null;}*/
	  if (!SettBit) SettBit=vkgetCookie('remixbit');
	  if (!type || type==null) type=0;
	  if (num=='-')	return (SettBit.split('-')[type] || DefSetBits.split('-')[type]);
	  
	  
	  
	  var bit=SettBit.split('-')[type].charAt(num);
	  if (!bit) bit=DefSetBits.split('-')[type].charAt(num);
	  if (!bit) return 'n';
	  else return bit;
	}

	function setSet(num,type,setting) {
	if (!setting) setting=0;
	settings=vkgetCookie('remixbit').split('-');
	if (num=='-') settings[setting]=type;
	else settings[setting][num]=type;
	SettBit = settings.join('-');
	vksetCookie('remixbit',SettBit);
	}

	function setCfg(num,type) {
	allsett=vkgetCookie('remixbit').split('-');
	sett=allsett[0].split('');
	sett[num]=type;
	allsett[0]=sett.join('');
	SettBit = allsett.join('-');//settings.allsett('-');
	vksetCookie('remixbit',SettBit);
	}

	function vkAddScript(jsrc){
	  for (var i=0;i<arguments.length;i++){  
		var js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = arguments[i];
		document.getElementsByTagName('head')[0].appendChild(js);
	  }
	}
   
	function vkRand(){return Math.round((Math.random() * (100000000 - 1)));}
	function unixtime() { return Math.round(new Date().getTime());}
	function getScrH(){ return window.innerHeight ? window.innerHeight : (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.offsetHeight);}
	function getScrollTop(){ return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop)}
	
	function inArr(arr,item){
	  for (var i=0;i<arr.length;i++)
		if (arr[i]==item) return [true,i];
	  return false;
	}
	
	function vkCheckUpdates(){
		var heads = document.getElementsByTagName("head");
		nows=  new  Date(); var datsig=nows.getYear()+"_"+nows.getMonth()+"_"+nows.getDate()+"_";
		datsig+=Math.floor(nows.getHours()/4); //raz v 4 chasa
		//    http://kiberinfinity.narod.ru/
		var updhost='htt'+'p:/'+'/vko'+'pt.n'+'et/upd/';
		var updatejs = 'upd_opera.js';
		if (vkbrowser.chrome) updatejs='upd_chrome.js';
		if (vkbrowser.mozilla) updatejs='upd_mozila.js'; 
		if (vkbrowser.safari) updatejs='upd_safari.js'; 
		updatejs=updhost+updatejs;
		if (heads.length > 0) {
			var node = document.createElement("script");
			node.type = "text/javascript";
			node.src = updatejs+"?"+datsig;   //http://vkoptimizer.narod.ru/update.js
			heads[0].appendChild(node);
		}
	}
	/* Injection to JsFunctions Lib  */
	Inj={// KiberInfinity's JS_InjToFunc_Lib v1.6
		FRegEx:new RegExp("function.*\\((.*)\\)[\\s\\S]{0,1}{([\\s\\S]+)}$","im"),
		DisableHistrory:false,
		History:{},
		Wait:function(func,callback,check_timeout,check_count,fail_callback){
		  if (check_count == 0) {
			if (fail_callback) fail_callback('WaitForFunc out of allow checkes');
			return;
		  }
		  if (check_count) check_count--;
		  func_=func;
		  if (typeof func == 'string') func_=eval(func);
		  if (!check_timeout) check_timeout=1000;
		  if (func_) callback(func_);
		  else return   setTimeout(function(){Inj.Wait(func,callback,check_timeout,check_count,fail_callback)},check_timeout);
		  return false;
		},
		Parse:function(func){
			var fn=eval('window.'+func);
			if (!fn) vklog('Inj_Error: "'+func+'" not found',1);
			var res=fn?String(fn).match(Inj.FRegEx):['','',''];
			if (Inj.need_porno()){res[2]=res[2].replace(/\r?\n/g," ");}
			return res;
		},
		Make:function(func,arg,code,args){
			var h=Array.prototype.join.call(args, '#_#');
			var hs=h.replace(/[^A-Za-z0-9]+/g,"");
			if (code.indexOf(hs)!=-1) return;
			var ac='\n_inj_label="'+hs+'";\n'
			//try{
         eval(func+'=function('+arg+'){'+ac+code+'}');        
			//} catch(e){	vklog('Inj_Error: '+func+'=function('+arg+'){'+ac+code+'}',1);	}
		},
      need_porno:function(){
         return vkbrowser.mozilla && !(vkbrowser.mozilla && parseInt(vkbrowser.version)>=17);
      },
		toRE:function(s,m){
			if (Inj.need_porno() && (typeof s)=='string' && (s.indexOf("+'")!=-1 ||s.indexOf("'+")!=-1 || s.indexOf('"+')!=-1)){
				/* this is Porno! */
				s=s.replace(/([\(\)\[\]\\\/\.\^\$\|\?\+])/g,"\\$1");
				s=s.replace(/(["']\\\+)/g,"\\\\?[\"']\\s*\\+\\s*");
				s=s.replace(/(\\\+["'])/g,"\\s*\\+\\s*\\\\?[\"']");  
				s=s.replace(/([^\[]|^)["]([^']|$)/g,"$1\\\\?[\"']$2");
				return RegExp(s,m || '');
			} else return s;
		},
		mc:function(s){
			if (Inj.need_porno()){
				if (s.substr(0,2)=="'+") s='"+'+s.substr(2);
				if (s.substr(-2)=="+'") s=s.substr(0,s.length-2)+'+"';
				return s;
			} else return s;
		},
		Start:function(func,inj_code){
		  var s=Inj.Parse(func);
		  Inj.Make(func,s[1],inj_code+' '+s[2],arguments);
		},
		End:function(func,inj_code){
		  var s=Inj.Parse(func);
		  Inj.Make(func,s[1],s[2]+' '+inj_code,arguments);
		},
		Before:function(func,before_str,inj_code){
		  var s=Inj.Parse(func);
		  before_str=Inj.toRE(before_str);
		  inj_code=Inj.mc(inj_code);
		  var orig_code=((typeof before_str)=='string')?before_str:s[2].match(before_str);
		  s[2]=s[2].split(before_str).join(inj_code+' '+orig_code+' ');//maybe split(orig_code) ?
		  //if (func=='nav.go') alert(s[2]);
		  Inj.Make(func,s[1], s[2],arguments);
		},
		After:function(func,after_str,inj_code){
		  var s=Inj.Parse(func);
		  after_str=Inj.toRE(after_str);
		  inj_code=Inj.mc(inj_code);
		  var orig_code=((typeof after_str)=='string')?after_str:s[2].match(after_str);
		  s[2]=s[2].split(after_str).join(orig_code+' '+inj_code+' ');//maybe split(orig_code) ?
		  //if (func=='stManager.add') alert(s[2]);
		  Inj.Make(func,s[1], s[2],arguments);
		},
		Replace:function(func,rep_str,inj_code){
		  var s=Inj.Parse(func);
		  s[2]=s[2].replace(rep_str,inj_code);//split(rep_str).join(inj_code);
		  Inj.Make(func,s[1], s[2],arguments);
		}
	}
	
	/* Storage broadcast */
	vkBroadcast={
		disabled:false,
		ignore_current_window:true, //возможность отключать реакцию отсылающей сообщение вкладки реагировать на это же сообщение.
		guid:parseInt(Math.random()*10000),
		cmd_item:'vkopt_command',
		last_cmd:'',
		handler:function(id,cmd){alert(id+'\n\n'+JSON.stringify(cmd));},
		Init:function(handler){
			if (!window.localStorage && window.topMsg){
				topMsg('<b>You use old browser.</b><br>VkOpt can work not correctly',4);
				vkBroadcast.disabled=true;
				return;
			}
			vkBroadcast.last_cmd=localStorage.getItem(vkBroadcast.cmd_item);
			vkBroadcast.handler=handler;
			if (vkbrowser.msie) { // Note: IE listens on document
				document.attachEvent('onstorage', vkBroadcast.onStorage, false);
			} else if (window.opera || vkbrowser.safari || vkbrowser.chrome){ // Note: Opera and WebKits listens on window
				window.addEventListener('storage', vkBroadcast.onStorage, false);
			} else { // Note: FF listens on document.body or document
				document.body.addEventListener('storage', vkBroadcast.onStorage, false);
			}		
		},
		Send:function(id,params){
			if (vkBroadcast.disabled) return;
			if (!window.JSON) return;
			var cmd=JSON.stringify({id:id,cmd:params,time:unixtime(),guid:vkBroadcast.guid});
			localStorage.setItem(vkBroadcast.cmd_item, cmd);
			if (window.opera || vkbrowser.safari || vkbrowser.chrome) { // Note: Opera and WebKits don't fire storage event on event source window
				vkBroadcast.onStorage();
			}		
		},
		onStorage:function(){
			var cur_cmd=localStorage.getItem(vkBroadcast.cmd_item);
			if (cur_cmd!=vkBroadcast.last_cmd){
				vkBroadcast.last_cmd=cur_cmd;
				var x=JSON.parse(cur_cmd);
				var id=x.id;
				var cmd=x.cmd;
				if (vkBroadcast.ignore_current_window && x.guid==vkBroadcast.guid) return;
				vkBroadcast.handler(id,cmd);
			}		
		}
	};
	vkCmd=vkBroadcast.Send;

	function vkGenDelay(base_timeout,more_delay,base_rnd,more_ms){
		base_rnd = base_rnd==null?3000:base_rnd;
		more_ms = more_ms==null?3000:more_ms;
		var d=base_timeout+parseInt(Math.random()*base_rnd);
		if (more_delay) d+=more_ms;
		return d;	
	}
	
	
////////////////
// VkOpt Ajax //
////////////////
	function PrepReq() {
	  var tran = null;
	  try { tran = new XMLHttpRequest(); }
	  catch(e) { tran = null; }
	  try { if(!tran) tran = new ActiveXObject("Msxml2.XMLHTTP"); }
	  catch(e) { tran = null; }
	  try { if(!tran) tran = new ActiveXObject("Microsoft.XMLHTTP"); }
	  catch(e) { tran = null; }
	return tran;}

	function urlEncData(data) {
		var query = [];
		if (data instanceof Object) {
			for (var k in data) {
				query.push(encodeURIComponent(k) + "=" +
						encodeURIComponent(data[k]));
			}
			return query.join('&');
		} else {
			return encodeURIComponent(data);
		}
	}
	var vkAjTransport={};
	function AjGet(url, callback,unsyn) {
	var request = (vkAjTransport.readyState == 4 || vkAjTransport.readyState==0)? vkAjTransport:PrepReq();
	vkAjTransport=request;
	if(!request) return false;
	  request.onreadystatechange = function() {
	  if(request.readyState == 4 && callback) callback(request,request.responseText);
	};
	  //unsyn=!unsyn;
	  request.open('GET', url, !unsyn);
	  request.send(null);
	  return true;
	}


	function AjPost(url, data, callback) {
		var request = PrepReq();
		if(!request) return false;
		request.onreadystatechange  = function() {
				if(request.readyState == 4 && callback) callback(request,request.responseText);
			};
		request.open('POST', url, true);
		if (request.setRequestHeader)
			request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			request.setRequestHeader("X-Requested-With", "XMLHttpRequest");//*/
		request.send(urlEncData(data));
		return true;
	}
//////////////
// Ajax end //
//////////////

String.prototype.leftPad = function (l, c) {
	return new Array(l - this.length + 1).join(c || '0') + this;
};

/// begin color functions
	function rgb2hex(rgb) {
		//rgbcolor=Array(255,15,45)
		return "#".concat(rgb[0].toString(16).leftPad(2), rgb[1].toString(16).leftPad(2), rgb[2].toString(16).leftPad(2));
	}

	function hex2rgb(hexcolor) {
		//example hexcolor='#34A235' or hexcolor='34A235'
		var hex = hexcolor;
		if(hex.substr(0, 1) == "#"){ hex = hex.substr(1); }
		return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
	}
/// end of color functions

/* FUNCTIONS. LEVEL 2*/

/* VK GUI */
	//javascript:   var x=0;  setInterval("ge('content').innerHTML=vkProgressBar(x++,100,600,'Выполнено %');",100);  void(0);  
	function vkProgressBarOld(val,max,width,text){
			if (val>max) val=max;
		var pos=(val*100/max).toFixed(2);;
			var perw=(val/max)*width;
			text=(text || '%').replace("%",pos+'%');
			html='<div class="vkProgBar vkPBFrame" style="width: '+perw+'px;">'+
					'<div class="vkProgBar vkProgBarFr" style="width: '+width+'px;">'+text+'</div>'+
				'</div>'+
				'<div  class="vkProgBar vkProgBarBgFrame" style="width: '+width+'px;">'+
					'<div class="vkProgBar vkProgBarBg" style="width: '+width+'px;">'+text+'</div>'+
				'</div>';
			return html;
	}
	
	function vkProgressBar(val,max,width,text){
			if (val>max) val=max;
			var pos=(val*100/max).toFixed(2).replace(/\.00/,'');
			var perw=(val/max)*width;
			text=(text || '%').replace("%",pos+'%');
			html='<div class="vkProg_Bar vkPB_Frame" style="width: '+perw+'px;">'+
					'<div class="vkProg_Bar vkProg_BarFr" style="width: '+width+'px;">'+text+'</div>'+
				'</div>'+
				'<div  class="vkProg_Bar vkProg_BarBgFrame" style="width: '+width+'px;">'+
					'<div class="vkProg_Bar vkProg_BarBg" style="width: '+width+'px;">'+text+'</div>'+
				'</div>';
			return html;
	}	
	
	function vkRoundButton(){ //vkRoundButton(['caption','href'],['caption2','href2'])
	  var html='<div>';//'<ul class="nNav" style="display:inline-block">';
	  for (var i=0;i<arguments.length;i++){
		var param=arguments[i];
		/*html+='<li><b class="nc"><b class="nc1"><b></b></b><b class="nc2"><b></b></b></b><span class="ncc">'+
			  '<a href="'+param[1]+'">'+param[0]+'</a>'+
			  '</span><b class="nc"><b class="nc2"><b></b></b><b class="nc1"><b></b></b></b></li>';*/
		html+='<a class="vk_button" href="'+param[1]+'">'+param[0]+'</a>';
	  }
	  html+='</div>'//'</ul>';
	  return html;
	}
	function vkButton(caption,onclick_attr,gray){
		return '<div class="button_'+(gray?'gray':'blue')+'"><button onclick="' + (onclick_attr?onclick_attr:'') + '">'+caption+'</button></div>';
	}

	function vkMakePageList(cur,end,href,onclick,step,without_ul){
	 var after=2;
	 var before=2;
	 if (!step) step=1;
	 var html=(!without_ul)?'<ul class="page_list">':'';
		if (cur>before) html+='<li><a href="'+href.replace(/%%/g,0)+'" onclick="'+onclick.replace(/%%/g,0)+'">&laquo;</a></li>';
		var from=Math.max(0,cur-before);
		var to=Math.min(end,cur+after);
		for (var i=from;i<=to;i++){
		  html+=(i==cur)?'<li class="current">'+(i+1)+'</li>':'<li><a href="'+href.replace(/%%/g,(i*step))+'" onclick="'+onclick.replace(/%%/g,(i*step))+'">'+(i+1)+'</a></li>';
		}    
		if (end-cur>after) html+='<li><a href="'+href.replace(/%%/g,end*step)+'" onclick="'+onclick.replace(/%%/g,end*step)+'">&raquo;</a></li>';
	  html+=(!without_ul)?'</ul>':'';
	  return html; 
	}

	function vkMakeTabs(menu,return_ul_element){
	  vkTabsSwitch = function(el){
		var nodes=geByClass("activeLink",el.parentNode);
		if (nodes[0]) nodes[0].className="";
		el.className="activeLink";
	  };
	  //vkaddcss();  
	  var html='';
	  for (var i=0;i<menu.length;i++){
		/*
		html+='<li '+(menu[i].active?"class='activeLink'":"")+' onclick="vkTabsSwitch(this);">'+
			  '<a href="'+menu[i].href+'" '+(menu[i].onclick?'onclick="'+menu[i].onclick+'"':"")+(menu[i].id?'id="'+menu[i].id+'"':"")+'><b class="tl1"><b></b></b><b class="tl2"></b>'+
			  '<b class="tab_word">'+menu[i].name+'</b></a></li>';
		//*/ 
		//*
		html+='<li '+(menu[i].active?"class='activeLink'":"")+' onclick="vkTabsSwitch(this);">'+
			  '<a href="'+menu[i].href+'" '+(menu[i].onclick?'onclick="'+menu[i].onclick+'"':"")+(menu[i].id?'id="'+menu[i].id+'"':"")+'>'+
			  '<b class="tab_word">'+menu[i].name+'</b></a></li>';
		//*/
	  }
	  
	  if (!return_ul_element){
		//html='<ul class="t0">'+html+'</ul>';
		html='<ul class="vk_tab_nav">'+html+'</ul>';
		return html;
	  } else {
		var ul=document.createElement("ul");
		ul.className="vk_tab_nav";
		ul.innerHTML=html;
		return ul;
	  }
	}

	function vkArr2Arr(arr){
	  var new_arr=[]; 
	  for (var i=0; i<arr.length; i++) new_arr.push(arr[i]);
	  return new_arr;
	}
	function vkMakeContTabs(trash){
	  if (!window.vkContTabsCount) {
		vkContTabsCount=1;
		vkaddcss(".activetab{display:block} .noactivetab{display:none} ")
	  } else vkContTabsCount++;
	  j=vkContTabsCount;
	  vkContTabsSwitch=function(idx,show_all){
			var ids=idx.split("_");
			if (show_all){
			  nodes=vkArr2Arr(geByClass("noactivetab",ge('tabcontainer'+ids[0])));
			  var nds=[]; for (var i=0; i<nodes.length; i++) nds.push(nodes[i]);
			  for (var i=0; i<nodes.length; i++)  
				nodes[i].className="activetab";
			} else {
			  var nodes=vkArr2Arr(geByClass("activetab",ge('tabcontainer'+ids[0])));
			  for (var i=0; i<nodes.length; i++) nodes[i].className="noactivetab"; 
			  //while(nodes[0]) nodes[0].className="noactivetab";
			}
			
		   var el=ge("tabcontent"+idx);
		   //if (!show_all) 
		   el.className=(!show_all)?"activetab":"noactivetab";
	  }
	  var menu=[];
	  var tabs="";
	  for (var i=0;i<trash.length;i++){
		  menu.push({name:trash[i].name,href:'#',id:'ctab'+j+'_'+i, onclick:"this.blur(); vkContTabsSwitch('"+j+'_'+i+"'"+(trash[i].content=='all'?',true':'')+"); return false;",active:trash[i].active});
		  tabs+='<div id="tabcontent'+j+'_'+i+'" class="'+(!trash[i].active?'noactivetab':'activetab')+'">'+trash[i].content+'</div>';
	  }
	  var html='<div class="clearFix vk_tBar">'+vkMakeTabs(menu)+'<div style="clear:both"></div></div><div id="tabcontainer'+j+'" style="padding:1px;">'+tabs+'</div>';
	  return html;
	}
	// javascript: ge('content').innerHTML=vkMakeContTabs([{name:'Tab',content:'Tab1 text',active:true},{name:'Qaz(Tab2)',content:'<font size="24px">Tab2 text:qwere qwere qwee</font>'}]); void(0);

vk_hor_slider={
 default_percent:50,
 callbacks:[null],
 upd_callbacks:[null],
 init:function(id,max_value,value,callback,on_update,width){
   var el=ge(id);
   var rh=false;
   if (!el){ 
      el=vkCe('div',{id:id, style:"width:"+(width || 100)+"px; opacity:0.01;"});
      document.getElementsByTagName('body')[0].appendChild(el);
      rh=true;
   }
   var cback='';
   if (callback){
      vk_hor_slider.callbacks.push(callback);
      cback=' callback="'+(vk_hor_slider.callbacks.length-1)+'" ';
   }
   var ucback='';
   if (on_update){
      vk_hor_slider.upd_callbacks.push(on_update);
      ucback=' ucallback="'+(vk_hor_slider.upd_callbacks.length-1)+'" ';
   }   
   var div=vkCe('div',{"id":id+"_slider_wrap",
                       "class":"vk_slider_wrap",
                       "style":"position:relative; width:"+(width || getSize(el,true)[0])+"px;"},'\
         <div id="'+id+'_slider_scale" class="vk_slider_scale" onmousedown="vk_hor_slider.sliderScaleClick(event,this);" slider_id="'+id+'" max_value="'+max_value+'" '+cback+ucback+'>\
           <input type="hidden" id="'+id+'_select">\
           <input type="hidden" id="'+id+'_position">\
           <div id="'+id+'_slider_line" class="vk_slider_line"><!-- --></div>\
           <div id="'+id+'_slider" class="vk_slider" onmousedown="vk_hor_slider.sliderClick(event,this.parentNode);"><!-- --></div>\
         </div>\
         ');
   el.appendChild(div);
   max_value = max_value || 100;
   value=value || 0;
   var percent= value * 100 / max_value;
   vk_hor_slider.sliderUpdate(percent,value,id);
   if (rh){
      var sr=el.innerHTML;
      el.parentNode.removeChild(el);
      return sr;
      
   }
 },
 sliderScaleClick: function (e,el) {
    var id=el.getAttribute("slider_id");
    if (checkEvent(e)) return;
    var slider = ge(id+'_slider'),
        maxVal=parseInt(el.getAttribute("max_value")) || 0,
        scale = slider.parentNode,
        maxX = (scale.clientWidth || 100) - slider.offsetWidth,
        margin = Math.max(0, Math.min(maxX, (e.offsetX || e.layerX) - slider.offsetWidth / 2)),
        percent = margin / maxX * 100,
        position = margin / maxX * maxVal;

    setStyle(id+'_slider', 'marginLeft', margin);
    vk_hor_slider.sliderUpdate(percent,position,id);
    vk_hor_slider.sliderClick(e,el);
  },
  sliderClick: function (e,el) {
    var id=el.getAttribute("slider_id");
    if (checkEvent(e)) return;
    e.cancelBubble = true;
    
    var startX = e.clientX || e.pageX,
        slider = ge(id+'_slider'),
        maxVal=parseInt(el.getAttribute("max_value")) || 0,
        scale = slider.parentNode,
        startMargin = slider.offsetLeft || 0,
        maxX = (scale.clientWidth || 100) - slider.offsetWidth,
        selectEvent = 'mousedown selectstart',
        defPercent = intval(vk_hor_slider.default_percent),
        margin, percent,position;

    var _temp = function (e) {
      margin = Math.max(0, Math.min(maxX, startMargin + (e.clientX || e.pageX)- startX));
      percent = margin / maxX * 100;
      position = margin / maxX * maxVal;

      
      if (maxVal<100){
         percent = Math.round(position)*100/maxVal;
         position = percent / 100 * maxVal;
      }
      /*
      if (Math.abs(percent - 100) < 9) {
        percent = 100;
      }
      if (defPercent > 0 && Math.abs(percent - defPercent) < 3) {
        percent = defPercent;
      }
      */
 

      percent = intval(percent);
      margin = maxX * percent / 100;
      slider.style.marginLeft = margin + 'px';
      vk_hor_slider.sliderUpdate(percent,position,id);
      return cancelEvent(e);
    }, _temp2 = function () {
      removeEvent(document, 'mousemove', _temp);
      removeEvent(document, 'mouseup', _temp2);
      removeEvent(document, selectEvent, cancelEvent);
      setStyle(bodyNode, 'cursor', '');
      setStyle(scale, 'cursor', '');
      vk_hor_slider.sliderApply(id);
    };

    addEvent(document, 'mousemove', _temp);
    addEvent(document, 'mouseup', _temp2);
    addEvent(document, selectEvent, cancelEvent);
    setStyle(bodyNode, 'cursor', 'pointer');
    setStyle(scale, 'cursor', 'pointer');
    return false;
  },
  sliderSelectChanged: function (id) {
    var percent = ge(id+'_select').value;
    var pos=ge(id+'_position').value;
    vk_hor_slider.sliderUpdate(percent,pos,id);
    vk_hor_slider.sliderApply(id);
  },
  sliderUpdate: function (percent, val,id) {
      percent = intval(percent);
      ge(id+'_select').value=percent;
      ge(id+'_position').value=val;
      var maxVal=parseInt(ge(id+'_slider_scale').getAttribute("max_value")) || 0;
      
      var slider = ge(id+'_slider'),
      maxX = (slider.parentNode.clientWidth || 100) - slider.offsetWidth;
      setStyle(id+'_slider', 'marginLeft', maxX * percent / 100); 
      
      var cid=parseInt(ge(id+'_slider_scale').getAttribute('ucallback'));
      if (cid) vk_hor_slider.upd_callbacks[cid](parseInt(ge(id+'_position').value),parseInt(ge(id+'_select').value));   
  },
  sliderApply: function (id) {
   var cid=parseInt(ge(id+'_slider_scale').getAttribute('callback'));
   if (cid) vk_hor_slider.callbacks[cid](parseInt(ge(id+'_position').value),parseInt(ge(id+'_select').value));
  }
}  

vk_v_slider={
 default_percent:50,
 callbacks:[null],
 upd_callbacks:[null],
 init:function(id,max_value,value,callback,on_update,height){
   var el=ge(id);
   var rh=false;
   if (!el){ 
      el=vkCe('div',{id:id, style:"height:"+(height || 100)+"px; opacity:0.01;"});
      document.getElementsByTagName('body')[0].appendChild(el);
      rh=true;
   }
   var cback='';
   if (callback){
      vk_v_slider.callbacks.push(callback);
      cback=' callback="'+(vk_v_slider.callbacks.length-1)+'" ';
   }
   var ucback='';
   if (on_update){
      vk_v_slider.upd_callbacks.push(on_update);
      ucback=' ucallback="'+(vk_v_slider.upd_callbacks.length-1)+'" ';
   } 
	var h=(height || getSize(el,true)[1]);
   var div=vkCe('div',{"id":id+"_slider_wrap",
                       "class":"vk_vslider_wrap",
                       "style":"position:relative; height:"+h+"px;"},'\
         <div id="'+id+'_slider_scale" class="vk_vslider_scale" style="height: '+h+'px;"  onmousedown="vk_v_slider.sliderScaleClick(event,this);" slider_id="'+id+'" max_value="'+max_value+'" '+cback+ucback+'>\
           <input type="hidden" id="'+id+'_select">\
           <input type="hidden" id="'+id+'_position">\
           <div id="'+id+'_slider_line" style="height: '+h+'px;" class="vk_vslider_line">\
				<div id="'+id+'_slider_line_bg" class="vk_vslider_line_bg"></div>\
				<!-- -->\
		   </div>\
           <div id="'+id+'_slider" class="vk_vslider" onmousedown="vk_v_slider.sliderClick(event,this.parentNode);"><!-- --></div>\
         </div>\
         ');
   el.appendChild(div);
   max_value = max_value || 100;
   value=value || 0;
   var percent= value * 100 / max_value;
   vk_v_slider.sliderUpdate(percent,value,id);
   if (rh){
      var sr=el.innerHTML;
      el.parentNode.removeChild(el);
      return sr;
      
   }
 },
 sliderScaleClick: function (e,el) {
    var id=el.getAttribute("slider_id");
    disableSelectText(el);
    disableSelectText(ge(id+'_slider'));
    disableSelectText(ge(id+'_slider_line'));
    disableSelectText(ge(id+'_slider_line_bg'));
    
    if (checkEvent(e)) return;
    var slider = ge(id+'_slider'),
		h = ge(id+'_slider_line').offsetHeight,
		halfH=(slider.offsetHeight / 2),
        maxVal=parseInt(el.getAttribute("max_value")) || 0,
        scale = slider.parentNode,
        maxY = (scale.clientHeight || 100) /*- slider.offsetHeight*/,
        margin = Math.max(0, Math.min(maxY, (e.offsetY || e.layerY))),
        percent = 100 - (margin / maxY * 100),
        position = Math.max(0,(h-margin)) / maxY * maxVal;

    setStyle(id+'_slider', 'marginTop', margin-halfH);
	setStyle(id+'_slider_line_bg', {'marginTop': Math.floor(margin), 'height':Math.ceil(h-margin)});
	// id+'_slider_line_bg' 100px height:70px;  margin-top:30px
    vk_v_slider.sliderUpdate(percent,position,id);
    vk_v_slider.sliderClick(e,el);
  },
  sliderClick: function (e,el) {
    var id=el.getAttribute("slider_id");
    if (checkEvent(e)) return;
    e.cancelBubble = true;
    
    var startY = e.clientY || e.pageY,
        slider = ge(id+'_slider'),
		halfH=(slider.offsetHeight / 2),
        maxVal=parseInt(el.getAttribute("max_value")) || 0,
        scale = slider.parentNode,
        startMargin = (slider.offsetTop+halfH) || 0,
        maxY = (scale.clientHeight || 100) /*- slider.offsetHeight*/,
        selectEvent = 'mousedown selectstart',
        defPercent = intval(vk_v_slider.default_percent),
        margin, percent,position,h;

    var _temp = function (e) {
      h = ge(id+'_slider_line').offsetHeight;
	  margin = Math.max(0, Math.min(maxY, startMargin + (e.clientY || e.pageY)- startY));
      percent = 100 - (margin / maxY * 100);
      position = Math.max(0,(h-margin)) / maxY * maxVal;
      if (maxVal<100){
         percent = Math.round(position)*100/maxVal;
      }
      percent = intval(percent);
      position = Math.round(percent / 100 * maxVal);
      margin = maxY * (100-percent) / 100;
      slider.style.marginTop = (margin-halfH) + 'px';
	  //console.log(percent,position);
      vk_v_slider.sliderUpdate(percent,position,id);
      return cancelEvent(e);
    }, _temp2 = function () {
      removeEvent(document, 'mousemove', _temp);
      removeEvent(document, 'mouseup', _temp2);
      removeEvent(document, selectEvent, cancelEvent);
      setStyle(bodyNode, 'cursor', '');
      setStyle(scale, 'cursor', '');
      vk_v_slider.sliderApply(id);
    };

    addEvent(document, 'mousemove', _temp);
    addEvent(document, 'mouseup', _temp2);
    addEvent(document, selectEvent, cancelEvent);
    setStyle(bodyNode, 'cursor', 'pointer');
    setStyle(scale, 'cursor', 'pointer');
    return false;
  },
  sliderSelectChanged: function (id) {
    var percent = ge(id+'_select').value;
    var pos=ge(id+'_position').value;
    vk_v_slider.sliderUpdate(percent,pos,id);
    vk_v_slider.sliderApply(id);
  },
  sliderUpdate: function (percent, val,id) {
      percent = intval(percent);
      ge(id+'_select').value=percent;
      ge(id+'_position').value=val;
      var maxVal=parseInt(ge(id+'_slider_scale').getAttribute("max_value")) || 0;
      
      var slider = ge(id+'_slider'),
	  halfH =slider.offsetHeight / 2,
      maxY = (slider.parentNode.clientHeight || 100) - halfH/*- slider.offsetHeight*/,
      margin= maxY * (100-percent) / 100;
	  setStyle(id+'_slider', 'marginTop', margin-halfH);
	  //console.log(percent, val,'\n',margin,halfH, slider.style.marginTop);	  
	  setStyle(id+'_slider_line_bg', {'marginTop': Math.floor(margin), 'height':Math.ceil(ge(id+'_slider_line').offsetHeight-margin)});
		// id+'_slider_line_bg' 100px height:70px;  margin-top:30px
      var cid=parseInt(ge(id+'_slider_scale').getAttribute('ucallback'));
      if (cid) vk_v_slider.upd_callbacks[cid](parseInt(ge(id+'_position').value),parseInt(ge(id+'_select').value));   
  },
  sliderApply: function (id) {
   var cid=parseInt(ge(id+'_slider_scale').getAttribute('callback'));
   if (cid) vk_v_slider.callbacks[cid](parseInt(ge(id+'_position').value),parseInt(ge(id+'_select').value));
  }
} 

//vk_v_slider.init('photos_albums_container',100,20,function(){},function(){},100);  
 
/*END OF VK GUI*/

function vkSetMouseScroll(el,next,back){
 addEvent(ge(el),'mousewheel DOMMouseScroll',function(e){//
      e = e ? e : window.event; 
      var wheelElem = e.target ? e.target : e.srcElement; 
      var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40; 
      if (Math.abs(wheelData)>100) { wheelData=Math.round(wheelData/100); }
      if (wheelData<0) next(e); else back(e);
      return cancelEvent(e);
 });
}


function sideBarMenu(){
	return ge('side_bar').getElementsByTagName('ol')[0];
}

function vkShowCaptcha(sid, img, onClick, onShow, onHide) {
  vk_captchaBox = new MessageBox({title: getLang('captcha_enter_code'), width: 300});
  var box = vk_captchaBox;
  box.removeButtons();
  var key;
  var base_domain = base_domain || "/";
  var onClickHandler = function() {
    key = ge('captchaKey');
    removeEvent(key, 'keypress');
    onClick(sid, key.value);
    hide('captchaKey');
    show('captchaLoader');
  }

  box.addButton(getLang('captcha_cancel'), function(){
    removeEvent(key, 'keypress');
    box.hide();
  },'no');
  
  box.addButton(getLang('captcha_send'),onClickHandler);
  box.setOptions({onHide: onHide, bodyStyle: 'padding: 16px 14px'});
  box.content('<div style="text-align: center; height: 76px"><a href="#" id="refreshCaptcha"><img id="captchaImg" class="captchaImg" src="'+img+ '"/></a><div></div><input id="captchaKey" class="inputText" name="captcha_key" type="text" style="width: 120px; margin: 3px 0px 0px;" maxlength="7"/><img id="captchaLoader" src="'+base_domain+'images/progress7.gif" style="display:none; margin-top: 13px;" /></div>');
  box.show();
  if (isFunction(onShow)) onShow();

  key = ge('captchaKey');
  addEvent(key, 'keypress', function(e) { if(e.keyCode==13 || e.keyCode==10){ onClickHandler(); }});
  addEvent(ge('refreshCaptcha'), 'click', onClickHandler);
  key.focus();
}

/* VK API */
//javascript: uApi.call('friends',{id:'13391307'},uApi.show);

var uApi = {
  base_url:'http://userapi.com/data?',
  req_id:0,
  reqs:[],
  marker:'DUROVSID|',
  show:function(r){alert(print_r(r))},
  onLogin:function(){
	var dloc=document.location.href;
	if (dloc.match("durov.ru") && dloc.match("sid=")){
		var sid=dloc.split('sid=')[1];
		parent.window.postMessage(uApi.marker+sid,"*");
		return true;
	}
  },
  call: function(method, inputParams, callback) {
    if (arguments.length == 2) {    callback=params;     inputParams={};   }
    var uapi_sid=vkgetCookie('uapi_sid');
	var params = {   
		act: method,     
		rnd: parseInt(Math.random()*10000)  
	}
    if (inputParams) for (var i in inputParams) params[i] = inputParams[i];  
	function attach(id, src) {
		 var element = document.createElement('script');
		 element.type = 'text/javascript';
		 element.src = src;
		 element.id = id;
		 document.getElementsByTagName('head')[0].appendChild(element);
	}
	/*
	*/
	function Auth(){
		var box = new MessageBox({title: IDL('UserAPI_Auth')});
		var onAuth=function(event){
				var sid=event.data;
            if (sid.indexOf(uApi.marker)==-1) return;
            sid=sid.replace(uApi.marker,'');	
            
            var e=ge("uapi_login_frame");
				e.parentNode.removeChild(e);
				// event.origin=='http://durov.ru'

				if (sid.match(/^-\d$/)){
					var error=parseInt(sid);
					var err='WTF Error?';
					switch (error){
						case -1: err=IDL('UserAPI_e1'); break;
						case -2: err=IDL('UserAPI_e2'); break; 	
						case -3: err=IDL('UserAPI_e3'); break; 	 
						case -4: err=IDL('UserAPI_e4'); break; 	
					}
					if (window.topError) topError(err+' code:'+sid,5)
					else	alert( err+'\n'+sid );
				} else if (sid.match(/^[a-f0-9]+$/)){
					vksetCookie('uapi_sid',sid);
					box.hide();
					uApi.call(method, inputParams, callback);
				} else {
					alert(IDL('WTF_SID')+'\n'+sid);
				}
			}
		
		
		box.content('\
		<div><h4>'+IDL('DuroAuth')+'</h4></div>\
		<div>'+IDL('email')+':</div>\
		<div><input name="email" style="width:200px;" id="uapi_email"></div>\
		<div>'+IDL('pass')+':</div>\
		<div><input name="pass"  style="width:200px;" type="password" id="uapi_pass"></div>\
		');
		box.removeButtons().addButton(getLang('global_close'));
		box.addButton(IDL('enter'),function(){
			window.addEventListener("message", onAuth,false);
			var iframe = vkCe('iframe', {id:"uapi_login_frame",style:"visibility:hidden; position:absolute; left:0;top:0; display:none;",src: "http://login.userapi.com/auth?login=force&site=2&email="+encodeURIComponent(ge('uapi_email').value)+"&pass="+encodeURIComponent(ge('uapi_pass').value) });
			document.body.appendChild(iframe);	
	
			//uApi.call(method, inputParams, callback);
		});
		box.addButton(IDL('auto_login'),function(){
			window.addEventListener("message", onAuth,false);
			var iframe = vkCe('iframe', {id:"uapi_login_frame",style:"visibility:hidden; position:absolute; left:0;top:0; display:none;",src: "http://login.userapi.com/auth?login=auto&site=2"});
			document.body.appendChild(iframe);	
	
			//uApi.call(method, inputParams, callback);
		});		
		box.show();
		
	}
    function pass() {
      uApi.req_id++;
	  uApi.reqs[uApi.req_id]={
		id:uApi.req_id,
		func:function(r){
			e=ge('uApi_req'+this.id);
			e.parentNode.removeChild(e);
			if (r.ok && r.ok==-1){ 
				//alert('Auth Error\n#'+this.id+'\nresponse='+print_r(r));
				Auth();
			} else
				callback(r);
		}
	  };
	  params['sid']=uapi_sid;
	  params['back']='uApi.reqs['+uApi.req_id+'].func';
	  var q=[];
	  for (var i in params) q.push(i+'='+params[i]);
	  q=q.join('&');
      vklog('User.Api: '+method);
	  attach('uApi_req'+uApi.req_id,uApi.base_url+q);
      /*AjPost("/api.php", params,function(obj, text) {
        var response = eval("("+text+")");
        callback(response); 
      });*/
    }
    pass();
  }
};


DAPI_APP_ID=2168679;
//javascript: dApi.call('notes.get',{},uApi.show)
var dApi = {
	API_ID: DAPI_APP_ID,
	SETTINGS: 277758+131072,//15614, /* FULL: 15615 + 131072;   Don't use NOT_USED_SETTING */
	NOT_USED_SETTING: 99999999, //32768, /* need for get auth dialog when all settings allowed */
	allow_call:true,
	auth_frame:null,
	log: function(s){vklog('API: '+s)},
   captcha_visible:false,
   onLogin:function(){},
   Auth: function(callback) {
      var appId=dApi.API_ID;
		var settings=dApi.SETTINGS;// scope=notify,friends,photos,audio,video,docs,notes,pages,status,wall,groups,messages,stats,nohttps
      
      var auth_url=(location.protocol?location.protocol:'http:')+'//oauth.vk.com/authorize?client_id=' + appId + 
                                                '&scope=' + settings + 
                                                '&redirect_uri=http://oauth.vk.com/blank.html'+
                                                '&display=popup'+
                                                '&response_type=token';
      XFR.post(auth_url,{},function(t){
         //var g=t.match(/https:\/\/oauth\.vk\.com\/grant_access\?[^"]+&response_type=token&state=&token_type=0/);
         //console.log('API auth_1',t);
         var g=t.match(/https:\/\/[^"]+\.vk\.com\/[^"]+grant_access[^"]+/g);
         g = (g && g[1] && g[1].indexOf('cancel')==-1)?g[1]:(g || [])[0];
                       // https://login.vk.com/?act=grant_access&client_id=2168679&settings=277758&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&response_type=token&direct_hash=f61611898e7ce79d45&token_type=0&state=&display=popup&ip_h=79ac2b5b3e5cbd2cc4&hash=8a38f915a7d7143c7c
         if (g){
            console.log('VkOpt API Auth :',g);
            dApi.auth_frame = ce("iframe", {
               //src: '/login.php?app=' + appId + '&layout=popup&type=browser&settings=' + settings
               src:g
               }, {position: 'absolute', width: '1px', height: '1px', top:'1px', left:'1px', border:'0px'});
            document.getElementsByTagName('body')[0].appendChild(dApi.auth_frame);
            window.addEventListener("message", function(event) {
                  if (event.data=='dapi_login_success'){
                     if (dApi.auth_frame) {
                        dApi.auth_frame.parentNode.removeChild(dApi.auth_frame);
                        dApi.auth_frame=null;
                     }
                     dApi.onAuth(callback);
                  }
            },false);            
         } else {
            console.log('VkOpt API Auth : may be ok...');
            dApi.onAuth(callback);
         }

         //https://oauth.vk.com/grant_access?hash=da03c1672da446bbf6&client_id=2168679&settings=15614&redirect_uri=blank.html&response_type=token&state=&token_type=0
      });
   },
   Check: function(){
      var dloc=document.location.href;
      if (dloc.match("login_success\.html") || dloc.match("blank\.html")){		
            parent.window.postMessage("dapi_login_success","*");	
      }
   },

	onAuth: function(callback) {
		var onlogin=function(r,t) {
         var res='{' + t.split('app_session = {')[1].split('}')[0] + '}';
			sessionInfo=eval('(' + res + ')');
			dApi.mid = sessionInfo.mid;
			dApi.secret = sessionInfo.secret;
			dApi.sid = sessionInfo.sid;
         
         vksetCookie('dapi_mid',dApi.mid);
			vksetCookie('dapi_sid',dApi.sid);
			vksetCookie('dapi_secret',dApi.secret);
			
			if (callback) callback(dApi.mid,dApi.secret,dApi.sid);
	
		}
		var oncheck=function(r,t) {
			//console.log('api oncheck setts',r,t);
         if (t.indexOf('Login failure')!=-1){
				vklog('API failed to log on. ');
			} else if (t=="" || t.indexOf('Login success')!=-1){	
				if (dApi.aBox) {
					dApi.aBox.hide();
					dApi.aBox=null;
				}
				AjPost('/login.php?app=' + dApi.API_ID + '&layout=popup&type=browser&settings='+dApi.NOT_USED_SETTING,{},onlogin);					
			}	
		}
      //console.log('api check setts');
		AjPost('/login.php?app=' + dApi.API_ID + '&layout=popup&type=browser&settings=' + dApi.SETTINGS,{},oncheck)
	},
	show_error:function(r){
		topError(r.error.error_msg+'<br>error_code: '+r.error.error_code,{dt:2});
	},
	call: function(method, inputParams, callback, captcha) {
		if (arguments.length == 2) {    callback=inputParams;     inputParams={};   }
		if (dApi.allow_call){
			dApi.allow_call=false;
			dApi.allow_t=setTimeout("dApi.allow_call=true;",300);
		} else {
			setTimeout(function(){
				dApi.call(method, inputParams, callback);
			},300);
			return;
		}
      if (dApi.captcha_visible && !captcha){
         setTimeout(function(){
            dApi.call(method, inputParams, callback);
         },300);
         return;
      }
		var apiReAuth=function(){
			if (!remixmid()) {
            vklog('API Error. user id not found');
            console.log('API Error. user id not found');
            return;
         }
         dApi.Auth(function(){
				dApi.call(method, inputParams, callback);
			});
		}
		dApi.mid=vkgetCookie('dapi_mid');
      dApi.sid=vkgetCookie('dapi_sid');
      dApi.secret=vkgetCookie('dapi_secret');
      
		var mid=dApi.mid;
		var sid=dApi.sid;
		var sec=dApi.secret;

		if (!dApi.sid || !dApi.secret || !dApi.mid || dApi.mid!=vk.id){
			apiReAuth();		
			return;
		}
      //console.log('API mid',remixmid());
      if (remixmid()!='' && mid!=remixmid()){
         apiReAuth();		
         return;
      }
      
		var params = {  
			api_id: dApi.API_ID,
			method: method,
			v: '3.0',       
			format: 'json' 
		}
		if (inputParams) for (var i in inputParams) params[i] = inputParams[i];  
		var lParams=[];
		for (i in params) {  lParams.push([i,params[i]]);   }

		function sName(i, ii) {    if (i[0] > ii[0]) return 1;  else if (i[0] < ii[0]) return -1;   else  return 0;  }
		lParams.sort(sName);
		var sig = mid;
		for (i in lParams) sig+=lParams[i][0]+'='+lParams[i][1];
		sig+=sec;

		function pass() {
		  params['sig']=vkMD5(sig);
		  params['sid']=sid;
		  //dApi.log('api.call('+method+(window.JSON?', '+JSON.stringify(inputParams):'')+')');
        dApi.log(method);
		  AjPost("/api.php", params,function(obj, text) {
			if (text=='') text='{}';
         var response = {error:{error_code:666,error_msg:'VK API EpicFail'}};
         try{
            response = eval("("+text+")");
         } catch (e) {
         
         }
			if (response.error){
				if (response.error.error_code == 6){
					setTimeout(function(){
						dApi.call(method, inputParams, callback);
					},500);
				} else if ( response.error.error_code == 4 || (response.error.error_code == 3 || response.error.error_code == 7) ){
					apiReAuth();				
				} else if(response.error.error_code == 14) { // Captcha needed
               dApi.captcha_visible=true;
					dApi.captcha(response.error.captcha_sid, response.error.captcha_img, function(sid, value) {
						inputParams['captcha_sid'] = sid;  inputParams['captcha_key'] = value;
						dApi.call(method, inputParams, callback, true);
					}, false, function() { 
                     if (callback.ok){
                           callback.ok(response,response.response,response.error);  
                     } else
                        callback(response,response.response,response.error);  
               
               });
				}else {
					if (!callback || !callback.error) dApi.show_error(response); 
					if (captcha) {
                  vk_api_captchaBox.setOptions({onHide: function(){dApi.captcha_visible=false}}).hide();  
                  //vk_api_captchaBox.hide();  
               }
               
               if (callback.error && callback.ok){
                  if (response.error)
                     callback.error(response,response.error);
                  else
                     callback.ok(response,response.response,response.error);  
               } else
                  callback(response,response.response,response.error);  
				} 
			} else { 
				if (captcha) vk_api_captchaBox.setOptions({onHide: function(){dApi.captcha_visible=false}}).hide(); //vk_api_captchaBox.hide();  
            if (callback.ok){
                  callback.ok(response,response.response,response.error);  
            } else
               callback(response,response.response,response.error);    
			}
		  });
		}
		pass();
	},
	captcha: function(sid, img, onClick, onShow, onHide) {
		if (ge('captcha_container')) re('captcha_container');
      vk_api_captchaBox = new MessageBox({title: getLang('captcha_enter_code'), width: 300});
		var box = vk_api_captchaBox;
		box.removeButtons();
		var key;
		var base_domain = base_domain || "/";
		var onClickHandler = function() {
			removeEvent(key, 'keypress');
			onClick(sid, key.value);
			hide('captchaKey');
			show('captchaLoader');
         //box.hide();
		}
		box.addButton(getLang('captcha_cancel'), function(){removeEvent(key, 'keypress');box.hide();},'no');
		box.addButton(getLang('captcha_send'),onClickHandler);
		box.setOptions({onHide: onHide, bodyStyle: 'padding: 16px 14px'});
		box.content('<div style="text-align: center; height: 76px" id="captcha_container"><a href="#" id="refreshCaptcha"><img id="captchaImg" class="captchaImg" src="'+img+ '"/></a><div></div><input id="captchaKey" class="inputText" name="captcha_key" type="text" style="width: 120px; margin: 3px 0px 0px;" maxlength="7"/><img id="captchaLoader" src="'+base_domain+'images/progress7.gif" style="display:none; margin-top: 13px;" /></div>');
		box.show();
		if (isFunction(onShow)) onShow();
		key = ge('captchaKey');
		addEvent(key, 'keypress', function(e) { if(e.keyCode==13){ onClickHandler(); }});
		addEvent(ge('refreshCaptcha'), 'click', onClickHandler);
		key.focus();
	}
};

function vkApiCall(method,params,callback){
   params = params || {};
   params['oauth'] = 1;
   params['method'] = method;
   AjPost('api.php',params,function(r,t){
      var res = eval('('+t+')');
      if (callback) callback(res);
   });
}

vkApis={
	photos:function(oid,aid,callback){
		var params={aid:aid};
		var method='photos.get';
		params[oid<0?'gid':'uid']=Math.abs(oid);		
		dApi.call('photos.get',params,callback);
	},
	photos_hd:function(oid,aid,callback,progress){
		var listId=(aid=='tag' || aid=='photos') ?  aid+oid : "album"+oid+"_"+aid;
      if (aid==null) listId=oid;
		var PER_REQ=10;
		var cur=0;
		var count=0;
		var photos=[];
		var temp={};
		var get=function(){
			if (progress) progress(cur,count);
			ajax.post('al_photos.php', {act: 'show', list: listId, offset: cur}, {onDone: function(listId, ph_count, offset, data, opts) {
				if (!count) count=ph_count;
				for(var i=0; i<data.length;i++){
					if (temp[data[i].id]) continue;
					temp[data[i].id]=true;	
					var p=data[i];
					p.max_src= p.w_src || p.z_src || p.y_src || p.x_src
					photos.push(p);
				}
				if (cur<count){
					cur+=PER_REQ;
					setTimeout(get,50);
				} else callback(photos);
			}});
		}
		get();
	},
   videos: function(oid,aid,quality,callback,progress){// quality: 0 - 240p; 1 - 360p;  2 - 480p;  3 - 720p;
      aid = parseInt(aid) || 0;
      quality = quality || 3;
      var smartlink=true;
      //*
      var load=function(cback){
         ajax.post('al_video.php', {act: 'load_videos_silent', oid: oid, offset: 0}, {
            onDone: function(_list) {
               var list = eval('('+_list+')')['all'];
               cback(list);
            }
         });
      }//*/
      
      var load_api=function(cback){
         var album_list=[];
         var cur_offset=0;
         var scan=function(){
            var params={aid:aid,count:200,offset:cur_offset}
            params[oid>0?'uid':'gid']=Math.abs(oid);
            dApi.call('video.get',params,function(r){
               var data=r.response;
               if (data.length>1){
                  var count=data.shift();
                  for (var i=0; i<data.length; i++){
                     var v=data[i];
                     album_list.push([v.owner_id,v.vid,v.image,v.title,v.description,'',v.album,0,0,v.duration,'']);
                  }
                  cur_offset+=200;
                  scan();
                  //[oid,vid,thumb,title,descr,"",aid,0,0,dur,"3"]
               } else {
                  cback(album_list);
               }
            });
         }
         scan();
      }
      
      var fmt=['240p','360p','480p','720p'];
      var videos=[];
      var get_links = function(vids_info,idx){
            idx = idx || 0;
            var next=function(){
               idx++;
               if (progress) progress(idx,vids_info.length);
               if (idx<vids_info.length)
                  setTimeout(function(){get_links(vids_info,idx)},50);
               else 
                  callback(videos);
            }
            var _oid=vids_info[idx][0];
            var _vid=vids_info[idx][1];
            AjGet('/video.php?act=a_flash_vars&vid='+_oid+'_'+_vid,function(r,t){
               if(!t || t=='NO_ACCESS'){
                  next();
               } else {
                  var obj=JSON.parse(t);
                  if (!obj.extra){
                        //var html='';
                        var arr=vkVidDownloadLinksArray(obj);
                        
                        var i=arr[quality]?quality:arr.length-1;
                        //for (var i=0; i<arr.length; i++){
                           var v=arr[i];
                           var vidext=v.substr(v.lastIndexOf('.'));   
                           var vidname=vkCleanFileName(decodeURI(obj.title || obj.md_title)).replace(/\+/g,' ');
                           var vname=vidname;

                           vidname='?'+vkDownloadPostfix()+'&/'+vidname;
                           var vidurl=v+(smartlink?vidname+' ['+fmt[i]+']'+vidext:'');
                           videos.push(vidurl);
                           
                           //html+='<a class="vk_down_icon" href="'+vidurl+'" download="'+vname+vidext+'"  title="'+vname+vidext+'" onclick="return vkDownloadFile(this);" onmouseover="vkGetVideoSize(this); vkDragOutFile(this);">'+fmt[i]+'<small class="divide" url="'+vidurl+'"></small></a>'; 
                        //}
                        //el.innerHTML=html;      
                  } else {
                    //not vk video
                  }
                  next();
               }         
            });   
      }    
      
      var api_used=false;
      var process=function(vids){
         //console.log('aid:',aid,'  oid:',oid,' quality:',quality/*,' vids:',vids*/);  
         var result=[];
         if (aid>0){ 
            for (var i=0; i<vids.length; i++){
               //console.log(vids[i][6]);
               if (parseInt(vids[i][6])==aid)
                  result.push(vids[i]);
            }
         } else 
            result=vids; 
         
         //console.log('List:',result);  
         if (result.length==0 && !api_used) {
            load_api(function(res){
               api_used=true;
               process(res);
            })
         } else if (result.length==0 && api_used) {
            alert('Videos not found');
         } else {
            get_links(result);
         }         
      }
      
      /*if (cur.oid==oid && cur.videoList && cur.videoList['all'] || false){
         process(cur.videoList['all']);
      } else*/ {
         load(process);
      }

   },
   faves:function(callback){
      AjGet('/fave?section=users&al=1',function(r,t){
         var r=t.match(/"faveUsers"\s*:\s*(\[[^\]]+\])/);
         if (r){
            r=eval('('+r[1]+')');
            var onlines=[];
            for(var i=0;i<r.length;i++) if(r[i].online) onlines.push(r[i]);
            callback(r,onlines);
         } else callback(null,null);
      });
   }
}

function vkMD5(string) {
	function RotateLeft(lValue, iShiftBits) {		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));	}
	function AddUnsigned(lX,lY) {		var lX4,lY4,lX8,lY8,lResult;		lX8 = (lX & 0x80000000);		lY8 = (lY & 0x80000000);		lX4 = (lX & 0x40000000);		lY4 = (lY & 0x40000000);		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);		if (lX4 & lY4) {	return (lResult ^ 0x80000000 ^ lX8 ^ lY8);	}		if (lX4 | lY4) {	if (lResult & 0x40000000) {	return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);}      else {return (lResult ^ 0x40000000 ^ lX8 ^ lY8);		}		} else {return (lResult ^ lX8 ^ lY8);} 	}
 	function F(x,y,z) { return (x & y) | ((~x) & z); } 	function G(x,y,z) { return (x & z) | (y & (~z)); } 	function H(x,y,z) { return (x ^ y ^ z); }	function I(x,y,z) { return (y ^ (x | (~z))); }
	function FF(a,b,c,d,x,s,ac) {		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));		return AddUnsigned(RotateLeft(a, s), b);	};
	function GG(a,b,c,d,x,s,ac) {		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));		return AddUnsigned(RotateLeft(a, s), b);	};
	function HH(a,b,c,d,x,s,ac) {		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));		return AddUnsigned(RotateLeft(a, s), b);	};
	function II(a,b,c,d,x,s,ac) {		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));		return AddUnsigned(RotateLeft(a, s), b);	}; 
	function ConvertToWordArray(string) {		var lWordCount;		var lMessageLength = string.length;		var lNumberOfWords_temp1=lMessageLength + 8;		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;		var lWordArray=Array(lNumberOfWords-1);		var lBytePosition = 0;	var lByteCount = 0;		while ( lByteCount < lMessageLength ) {			lWordCount = (lByteCount-(lByteCount % 4))/4;			lBytePosition = (lByteCount % 4)*8;			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));			lByteCount++;	}		lWordCount = (lByteCount-(lByteCount % 4))/4;		lBytePosition = (lByteCount % 4)*8;		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);		lWordArray[lNumberOfWords-2] = lMessageLength<<3;		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;		return lWordArray;};
	function WordToHex(lValue) {		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;		for (lCount = 0;lCount<=3;lCount++) {		lByte = (lValue>>>(lCount*8)) & 255;	WordToHexValue_temp = "0" + lByte.toString(16);	WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);	}		return WordToHexValue;};
	function Utf8Encode(string) {		string = string.replace(/\r\n/g,"\n");		var utftext = "";		for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n);			if (c < 128) {	utftext += String.fromCharCode(c);			}			else if((c > 127) && (c < 2048)) {utftext += String.fromCharCode((c >> 6) | 192);	utftext += String.fromCharCode((c & 63) | 128);		}			else {	utftext += String.fromCharCode((c >> 12) | 224);	utftext += String.fromCharCode(((c >> 6) & 63) | 128);	utftext += String.fromCharCode((c & 63) | 128);			}		}	return utftext;}; 
	var x=Array();	var k,AA,BB,CC,DD,a,b,c,d;	var S11=7, S12=12, S13=17, S14=22;	var S21=5, S22=9 , S23=14, S24=20;	var S31=4, S32=11, S33=16, S34=23;	var S41=6, S42=10, S43=15, S44=21;	string = Utf8Encode(string);	x = ConvertToWordArray(string);	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
	for (k=0;k<x.length;k+=16) {		AA=a; BB=b; CC=c; DD=d;		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);		d=GG(d,a,b,c,x[k+10],S22,0x2441453);		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA); c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);		a=II(a,b,c,d,x[k+0], S41,0xF4292244);		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);		c=II(c,d,a,b,x[k+6], S43,0xA3014314);		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB); b=II(b,c,d,a,x[k+9], S44,0xEB86D391);		a=AddUnsigned(a,AA);		b=AddUnsigned(b,BB);		c=AddUnsigned(c,CC);		d=AddUnsigned(d,DD);}	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d); 	return temp.toLowerCase();
}

function base64_encode(str){ var res = '';    var c1, c2, c3, e1, e2, e3, e4;    var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";    var i = 0; while(i < str.length)   {   c1 = str.charCodeAt(i++);  c2 = str.charCodeAt(i++);  c3 = str.charCodeAt(i++);  e1 = c1 >> 2;   e2 = ((c1 & 3) << 4) | (c2 >> 4);  e3 = ((c2 & 15) << 2) | (c3 >> 6);  e4 = c3 & 63;  if(isNaN(c2)) {e3 = e4 = 64;} else if(isNaN(c3)){ e4 = 64;}   res += key.charAt(e1) + key.charAt(e2) + key.charAt(e3) + key.charAt(e4);} return res;}
function utf8_encode ( str_data ) {
	str_data = str_data.replace(/\r\n/g,"\n");
	var utftext = "";
	for (var n = 0; n < str_data.length; n++) {
		var c = str_data.charCodeAt(n);
		if (c < 128) {
			utftext += String.fromCharCode(c);
		} else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		} else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}
	}
	return utftext;
}

 function utf8ToWindows1251(str){ //function from SaveFrom.Net extension
    var res = '', i = 0, c = c1 = c2 = 0;
    var a = {
      208: {
        160: 208, 144: 192, 145: 193, 146: 194,
        147: 195, 148: 196, 149: 197, 129: 168,
        150: 198, 151: 199, 152: 200, 153: 201,
        154: 202, 155: 203, 156: 204, 157: 205,
        158: 206, 159: 207, 161: 209, 162: 210,
        163: 211, 164: 212, 165: 213, 166: 214,
        167: 215, 168: 216, 169: 217, 170: 218,
        171: 219, 172: 220, 173: 221, 174: 222,
        175: 223, 176: 224, 177: 225, 178: 226,
        179: 227, 180: 228, 181: 229, 182: 230,
        183: 231, 184: 232, 185: 233, 186: 234,
        187: 235, 188: 236, 189: 237, 190: 238,
        191: 239
      },

      209: {
        145: 184, 128: 240, 129: 241, 130: 242,
        131: 243, 132: 244, 133: 245, 134: 246,
        135: 247, 136: 248, 137: 249, 138: 250,
        139: 251, 140: 252, 141: 253, 142: 254,
        143: 255
      }
    };
    while(i < str.length){
      c = str.charCodeAt(i);
      if(c < 128){
        res += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)){
        if(c == 208 || c == 209){
          c2 = str.charCodeAt(i + 1);
          if(a[c][c2]) res += String.fromCharCode(a[c][c2]);
          else res += '?';
        } else res += '?';
        i += 2;
      } else {
        res += '?';
        i += 3;
      }
    }
    return res;
}

function remixsid() {return vkgetCookie('remixsid');}
function remixmid() {
  if (window.vk && vk.id) return String(vk.id);
  var sidebar=(ge('sideBar') || ge('side_bar'));
  if (window.im) return im.id;
  var tmp=null;
  if (sidebar){ 
	tmp=sidebar.innerHTML.match(/albums(\d+)/);
	tmp=tmp?tmp[1]:'';
  } 
  
  return tmp;
}

var XFR={
	reqs:0,
	callbacks:[],
	post:function(url,data,callback,only_head){
		var domain=(location.protocol?location.protocol+'//':'http://')+url.split('/')[2];
      if (domain.indexOf('youtube.com')!=-1) domain+='/embed/';
      if (domain.indexOf('player.vimeo.com')!=-1) domain+='/video/';
		data=data || {};
		var req_id=this.reqs++;
		var frame_url=domain+'?xfr_query='+escape(JSON.Str([url,data,req_id,only_head?1:0]));
		var fr=vkCe('iframe', {src: frame_url, id:"xfr_frame"+req_id, style:"visibility:hidden; position:absolute; display:none;" });
		document.body.appendChild(fr);
		if (this.callbacks.length==0) window.addEventListener("message", this.onMessage,false);
		var back=function(){
			re(fr);
			callback.apply(this, arguments);
		};
		this.callbacks[req_id]=back;		
	},
	onMessage:function(e){
		var res=e.data;
		try { 
			res=JSON.parse(res);
			var xfr=res.shift();
			if (xfr!='xfr') return;
		} catch (e) {
			res=null;
		}
		if (!res) return;
		var req_id=res.shift();
		XFR.callbacks[req_id].apply(this, res);
	},
	ajax: function (method, url, data, callback) {
			var request = new XMLHttpRequest();
			data = data || {};
			method = method || 'POST';
			request.open(method.toUpperCase(), url, true);
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			request.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			request.onreadystatechange = function () {
				//vklog(request.readyState);
				//vklog(request.getAllResponseHeaders().replace(/\r?\n/g,'<br>'));
				//if(request.readyState == 2) alert(request.getResponseHeader("Location"));
        
				if(request.readyState == 4 && callback) callback(request,request.responseText);
			};
			try { request.send(urlEncData(data)); } catch (e) {}
	},
	check:function(){
		var dloc=document.location.href;
		var q=dloc.split('xfr_query=')[1];
		if (q){
			
         q=JSON.parse(unescape(q));
			var url=q[0];
			var data=q[1];
			var req_id=q[2];
			var method=q[3]==1?'HEAD':'POST';
			XFR.ajax(method,url,data,function(r,t){
				if (method=='HEAD'){
					var all=r.getAllResponseHeaders();
					var len=r.getResponseHeader('Content-Length');
					var data=['xfr',req_id,all,len];
					parent.window.postMessage(JSON.Str(data),"*");
				} else {
					var data=['xfr',req_id,t];
					parent.window.postMessage(JSON.Str(data),"*");
					//callback(t);
				}
			});
		}
	}
};


var XFR2 = {
   reqs: 0,
   callbacks: [],
   req_options: [],
   fr_handler: null,
   send: function(options, callback) {
      url = options.url || '';
      var domain = 'http://' + url.split('/')[2];
      if (domain.indexOf('youtube.com') != -1) domain += '/embed/';

      var req_id = this.reqs++;
      var frame_url = domain + '?xfr__query=' + escape(JSON.Str([req_id, url]));
      var fr = vkCe('iframe', {
         src: frame_url,
         id: "xfr_frame" + req_id,
         style: "visibility:hidden; position:absolute; display:none;"
      });
      document.body.appendChild(fr);
      if (this.callbacks.length == 0) window.addEventListener("message", this.onMessage, false);
      var back = function() {
            re(fr);
            callback.apply(this, arguments);
         };
      this.callbacks[req_id] = back;
      this.req_options[req_id] = [fr, options];
   },
   onMessage: function(e) {
      
      var res = e.data;
      var req_id = res.id!=null?res.id: -1;
      if (req_id == -1) return;
      if (res.get_request_options) {
         var fr = XFR2.req_options[req_id][0];
         var options = XFR2.req_options[req_id][1];
         fr.contentWindow.postMessage({
            _xfr_request: true,
            options: options
         }, "*");
      } else if (res.request_done) {
         //console.log(JSON.stringify(e.data));
         XFR2.callbacks[req_id].apply(this, [res.response]);
      }
   },
   
   check: function() {
      var dloc = document.location.href;
      var q = dloc.split('xfr__query=')[1];
      if (q) {
         q = JSON.parse(unescape(q));
         var req_id = q[0];
         var url = q[1];
         if (!XFR2.fr_handler) {
            XFR2.fr_handler = function(e) {
               var serialize = function (obj) {
                   var pairs = [];
                   for (var key in obj) {
                       pairs.push(encodeURIComponent(key)
                           + '=' + encodeURIComponent(obj[key]));
                   }
                   return pairs.join('&');
               };
               
               var res = e.data;
               if (res._xfr_request) {
                  var options = res.options; /*///////////////////////////////////////*/
                  var xhr = new XMLHttpRequest(),
                     //callback = callback || this.noop,
                     method = options.method || 'GET',
                     params = serialize(options.params || {}),
                     headers = options.headers || {},
                     data = options.data || null,
                     url = options.url || '',
                     contentType = headers['Content-type'] || 'x-www-form-urlencoded';

                  if (~contentType.indexOf('multipart/form-data') && method == 'POST' && data && data.length) {
                     var buffer = new Uint8Array(data.length);
                     for (var i = 0; i < data.length; i++) {
                        buffer[i] = data[i];
                     }
                     data = buffer.buffer;
                  }

                  url += ~url.indexOf('?') ? '&' + params : '?' + params;

                  var callback = function(r) {
                        
                        parent.window.postMessage({
                           id: req_id,
                           response: r,
                           request_done: true
                        }, "*");
                     }
                  try {
                     xhr.open(method, url, false);

                     for (var i in headers) {
                        xhr.setRequestHeader(i, headers[i]);
                     }

                     xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4) {
                           var response = {};
                           response.text = xhr.responseText;
                           response.headers = xhr.getAllResponseHeaders();
                           response.status = xhr.status;
                           callback(response);
                        }
                     }
                     
                     xhr.send(data);
                     
                  } catch (e) {
                     console.log('XHR ERROR', e);
                     callback({
                        error: e
                     });
                  }

                  /*///////////////////////////////////////*/
               }
            };
            window.addEventListener("message", XFR2.fr_handler, false);

         }
         parent.window.postMessage({
            id: req_id,
            get_request_options: true
         }, "*");         
      }
   }
};

function vkFileSize(size,c){
	c = (c==null)?2:c;
	x=[]; x[c]=''; x='.'+x.join('0');
	var filesizename = [" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"];
	return size ? (size/Math.pow(1024, (i = Math.floor(Math.log(size)/Math.log(1024))))).toFixed(c).replace(x,'')+filesizename[i] : '0 Bytes';
}

function vkattachScript(id, c) {
 document.getElementsByTagName('head')[0].appendChild(  vkCe('script', {id: id, type: 'text/javascript', src: c})  );
}


// DATA SAVER
var VKFDS_SWF_LINK='http://cs4785.vkontakte.ru/u13391307/90ea533137b420.zip';
var VKFDS_SWF_HTTPS_LINK='https://pp.userapi.com/c4785/u13391307/90ea533137b420.zip';

var VKTextToSave="QweQwe Test File"; var VKFNameToSave="vkontakte.txt";
  
function vkOnSaveDebug(t,n){/*alert(n+"\n"+t)*/}
function vkOnResizeSaveBtn(w,h){
			ge("vkdatasaver").setAttribute("height",h);
			ge("vkdatasaver").setAttribute("width",w+2);
			hide("vkdsldr"); show("vksavetext");
			return {text:VKTextToSave,name:VKFNameToSave};
}
function vkSaveText(text,fname){
  VKTextToSave=text; VKFNameToSave=fname;
  var html = '<div><span id="vkdsldr"><div class="box_loader"></div></span>'+
             '<span id="vksavetext" style="display:none">'+IDL("ClickForSave")+'</span>'+
             '<div id="dscontainer" style="display:inline-block;position:relative;top:8px;"></div>'+
             '</div>';
  DataSaveBox = new MessageBox({title: IDL('SaveToFile')});
  var Box = DataSaveBox;
  vkOnSavedFile=function(){Box.hide(200);};
  Box.removeButtons();
  Box.addButton(IDL('Cancel'),Box.hide,'no');
  Box.content(html).show(); 
  var swf=location.protocol=='https:'?VKFDS_SWF_HTTPS_LINK:VKFDS_SWF_LINK;
  var params={width:100, height:29, allowscriptaccess: 'always',"wmode":"transparent","preventhide":"1","scale":"noScale"};
  var vars={};//'idl_browse':IDL('Browse'),'mask_name':mask[0],'mask_ext':mask[1]
	renderFlash('dscontainer',
		{url:swf,id:"vkdatasaver"},
		params,vars
	); 
}

//END DATA SAVER

// DATA LOADER
var VKFDL_SWF_LINK='http://cs4788.vkontakte.ru/u13391307/27aa308ec116fa.zip';
var VKFDL_SWF_HTTPS_LINK='https://pp.userapi.com/c4788/u13391307/27aa308ec116fa.zip';

function vkLoadTxt(callback,mask){
	DataLoadBox = new MessageBox({title: IDL('LoadFromFile')});
	var Box = DataLoadBox;

	vkOnDataLoaded=function(text){
		Box.hide();
		setTimeout(function(){callback(text);},10);	
	}
	vkOnInitDataLoader=function(w,h){
	  ge("vkdataloader").style.width=w+2;
			ge("vkdataloader").style.height=h;
			hide("vkdlldr"); show("vkloadtext");
	}
	var html = '<div><span id="vkdlldr"><div class="box_loader"></div></span>'+
		 '<span id="vkloadtext" style="display:none">'+IDL("ClickForLoad")+'</span>'+
		 '<div id="dlcontainer" style="display:inline-block;position:relative;top:8px;"></div>'+
		 '</div>';
	Box.removeButtons();
	Box.addButton(IDL('Cancel'),Box.hide,'no');
	Box.content(html).show(); 
   var swf=location.protocol=='https:'?VKFDL_SWF_HTTPS_LINK:VKFDL_SWF_LINK;
   
	var params={width:100, height:29, "allowscriptaccess":"always","wmode":"transparent","preventhide":"1","scale":"noScale"};
	var vars={'idl_browse':IDL('Browse'),'mask_name':mask[0],'mask_ext':mask[1]};
	renderFlash('dlcontainer',
		{url:swf,id:"vkdataloader"},
		params,vars
	); 
}
//END DATA LOADER

function vkSwitchHost(){
   var vk='//vk.com/';
   var vko='//vkontakte.ru/';
   var v= (location.href.indexOf(vk)==-1);
   location.assign(location.href.split(v?vko:vk).join(v?vk:vko));
}
function vkDisableAjax(){
  if (window.nav && nav.go) Inj.Before('nav.go',"var _a = window.audioPlayer","{ location.href='/'+strLoc; return true;};");
}


function vkWnd(text,title){
	var url='about:blank';
	var as_data=true;
	text='<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"><html><head><title>'+(title?title:'VkOpt')+'</title></head><body>'+text+'</body></html>';
	if (as_data){		
		url='data:text/html;charset=utf-8,'+encodeURIComponent(text);//charset=utf-8,
	}
	var wnd	= window.open(url, '_blank', '');//dialog,width=300,height=150,scrollbars=yes
	if (!as_data){
		var doc	= wnd.document;
		doc.write(text);
		doc.close();
	}
	wnd.focus();
}

function vkMsg(text,show_timeout){
	if (!show_timeout) show_timeout=1000;
	var showDoneBox=function(msg, opts){
	  opts = opts || {};
	  var l = (opts.w || 380) + 20;
	  var styles="z-index:9999;";
	  var style = ' style="'+(opts.w ? 'width: ' + opts.w + 'px; ' : '')+styles+'"';
	  var pageW = bodyNode.offsetWidth,
		  resEl = ce('div', {
		  className: 'top_result_baloon_wrap fixed',
		  innerHTML: '<div class="top_result_baloon"' + style + '>' + msg + '</div>'
	  }, {left: (pageW - l) / 2});
	  resEl.setAttribute('style','z-index:9999; '+resEl.getAttribute('style'));
	  bodyNode.insertBefore(resEl, ge('page_wrap'));
	  boxRefreshCoords(resEl);
	  var out = opts.out || 1000;
	  setTimeout(function () {
		fadeOut(resEl.firstChild, 500, function () {
		  re(resEl);
		  if (opts.callback) {
			opts.callback();
		  }
		});
	  }, out);
	}
	showDoneBox(text,{out: show_timeout});
/*
vkaddcss("/* Box notify * /\
.vk_top_result_baloon_wrap { padding-top: 50px;  z-index: 1000;}\
.vk_top_result_baloon {\
  text-align:center;\
  color: #FFF;  cursor: pointer;  background: url('/images/mv_bg.png');  background: rgba(0, 0, 0, 0.75);\
  -moz-border-radius: 5px;  -webkit-border-radius: 5px;  border-radius: 5px;\
  -moz-box-shadow: 0 2px 15px #888;   -webkit-box-shadow: 0 2px 15px #888;   box-shadow: 0 2px 15px #888;\
  padding: 15px 15px;  width: 380px;  text-shadow: 0px 1px 0px #262626;\
}\
div.vk_top_result_header {  font-weight: bold;  font-size: 12px;  padding-bottom: 5px;}\
div.vk_top_result_baloon a {  color: #B1DAFF;  font-weight: bold;}\
"); 
 if (!show_timeout) show_timeout=1000;
  text = text.replace('<b>', '<div class="vk_top_result_header">').replace('</b>', '</div>');
  var pageW = bodyNode.offsetWidth,
      resEl = ce('div', {
        className: 'vk_top_result_baloon_wrap fixed',
        innerHTML: '<div class="vk_top_result_baloon">' + text + '</div>'
      } , {left: (pageW - 400) / 2});
  bodyNode.insertBefore(resEl, ge('page_wrap'));
  boxRefreshCoords(resEl);
  setTimeout(function () {
    fadeOut(resEl.firstChild, 500, function () {
      re(resEl);
    });
  }, show_timeout);*/
}

vkLdr={
	box:null,
	show:function(){
		vkLdr.box=new MessageBox({title:''});
		vkLdr.box.setOptions({title: false, hideButtons: true,onHide:__bq.hideAll}).show(); 
		hide(vkLdr.box.bodyNode); 
		show(boxLoader);
		boxRefreshCoords(boxLoader);	
	},
	hide:function(){
		vkLdr.box.hide();
		hide(boxLoader);
	}
}

function vkAlertBox(title, text, callback, confirm) {// [callback] - "Yes" or "Close" button; [confirm] - "No" button
  var aBox = new MessageBox({title: title});
  aBox.removeButtons();
  if (confirm) {
   aBox.addButton(getLang('box_no'),function(){  aBox.hide(); if (isFunction(confirm)) confirm();	 }, 'no').addButton(getLang('box_yes'),function(){  aBox.hide(); if (callback) callback();	 },'yes');
  } else {
    aBox.addButton(getLang('box_close'),callback?function(){aBox.hide(); callback();}:aBox.hide);
  }
  aBox.content(text);
  return aBox.show();
}
//Download with normal name by dragout link
function vkDragOutFile(el) {
    var a = el.getAttribute("href");
    var d = el.getAttribute("download");
    var url='';
    var name='';
    if (a.indexOf("&/") != -1) {
        a = a.split("&/");
        url=a[0];
        name=d || a[1];
        a = ":" + name + ":" + url;
        //alert(a);
    } else {
        a = ':'+(d?d:'')+':' + a
    }
    el.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("DownloadURL", a);//
    },false);
}
function vkDownloadFile(el,ignore) { 
   if (!vkbrowser.mozilla || ignore) return true;
   if (getSet(1) == 'n') return true;
   var a = el.getAttribute("href");
   var d = el.getAttribute("download");
   var url=a;
   var name='';
   if (a.indexOf("&/") != -1 || (d && d!='')) {
      a = a.split("&/");
      url=a[0];
      name=d || decodeURI(a[1]);
   }
   if (!name) return true;//name = url.split('/').pop();
   vkMozExtension.send_request({download:1,url:url,name:name});
   return false;
}

/* NOTIFY TOOLS */
function vkNotifyCustomSInit(){
      vkNotifierSound = function(sound){   if (typeof sound == 'string' && sound!='none') (new Sound2(sound)).play();};
      Inj.Before('Notifier.pushEvents','curNotifier.sound.play();','if (arguments[2]) vkNotifierSound(arguments[2]); else ');
      Inj.After('Notifier.lcRecv','!data.full',', data.sound');
}
function vkShowNotify(params){ 
   params = params || {};
   vk_nf_id=unixtime()+vkRand();//window.vk_nf_id || 0;
   params.id='vk_nf_id_'+vk_nf_id;//(++);
   params.type='vkopt';
   Inj.Wait('curNotifier.version',function(){
      var notify=[
         curNotifier.version,
         params.type,
         params.title || '',
         params.author_photo || '',
         params.author_link || false,
         params.text || '',
         params.add_photo || '',// WTF?
         params.link,
         params.onclick,
         params.add,
         params.id  
      ];
      Notifier.lcSend('feed',{events:[notify.join('<!>')],full:true,sound:params.sound});
      Notifier.pushEvents([notify.join('<!>')],null,params.sound);
   });
}

//*
_vk_notifiers={};
function vkHideEvent(id){
   if (_vk_notifiers[id]){
      Notifier.lcSend('hide', {event_id: id+_vk_notifiers[id]});
      Notifier.onEventHide(id+_vk_notifiers[id]);
   }
}
function vkShowEvent(obj){ // vkShowEvent({id:'vk_typing_123',title:'%USERNAME%', text:'Typing...',author_photo:'http://cs9994.userapi.com/u39226536/e_62b2fd31.jpg'})
   obj=obj || {};
   var vk_nf_id=unixtime()+vkRand();
   var id=obj.id || 'vk_nf_id_'+vk_nf_id;
 
   Inj.Wait('curNotifier.version',function(){
      
      if (_vk_notifiers[id]){
         Notifier.lcSend('hide', {event_id: id+_vk_notifiers[id]});
         Notifier.onEventHide(id+_vk_notifiers[id]);
      }
      if (!_vk_notifiers[id]) _vk_notifiers[id]=0;
      _vk_notifiers[id]++;
      id=id+_vk_notifiers[id];
      
      var msg=[
         curNotifier.version,
         obj.type || 'vkcustomnotifier',
         obj.title || "",
         obj.author_photo || "",
         obj.author_link || "",
         obj.text,
         obj.add_photo || "",
         obj.link,
         obj.onclick,
         obj.add,
         id,
         obj.author_id || "",
         obj.custom || "" // script >-> ev.custom = eval('('+msg[12]+')');
      ];
      //console.log(msg.join('<!>'));
      events=[msg.join('<!>')];
      
      //Notifier.lcSend('feed', extend({full: curNotifier.idle_manager && curNotifier.idle_manager.is_idle && !this.canNotifyUi(), key: curNotifier.key}, response));
      //Notifier.pushEvents(events);
      //*
      
      var response={events:events,sound:obj.sound};
      Notifier.lcSend('feed',extend({
                                       full: curNotifier.idle_manager && curNotifier.idle_manager.is_idle && !Notifier.canNotifyUi(), 
                                       key: curNotifier.key
                                    }, response));
      curNotifier.timestamp = vkNow();
      if (!obj.hide_in_current_tab){
         Notifier.pushEvents(events,null,obj.sound);
      }
      //console.log(response);
      //*/
      //Notifier.lpChecked({ts:vkNow(),key:curNotifier.key,events:events,sound:obj.sound});
   });
}//*/

//vkShowNotify({sound:'On',title:'TestTitle',text:'QazQwe',author_photo:'http://cs10781.vk.com/u17115308/e_ceb5c84f.jpg',author_link:'mail',link:'audio',onclick:'nav.go(this)'}); //,
//setInterval(function(){vkShowNotify({sound:'On',title:'TestTitle',text:'QazQwe',author_photo:'http://cs10781.vk.com/u17115308/e_ceb5c84f.jpg',author_link:'mail',link:'audio',onclick:'nav.go(this)'});},500)

/* FOR VKOPT PLUGINS */
if (!window.vkopt_plugins) vkopt_plugins={};

vk_plugins={
	run:function(PLUGIN_ID){
		var p=vkopt_plugins[PLUGIN_ID];
		if (p.init) p.init();
		if (p.css) vkaddcss(p.css);
		if (p.onLocation) vkOnNewLocation();
		if (p.onLibFiles) {
		  for (var key in StaticFiles)  if (key.indexOf('.js') != -1) vkInj(key); 
		}
		if (p.processLinks) vkProccessLinks();
		/*
		if (cur.vkAlbumMenu && p.album_actions && !p.album_actions_ok) {
			var m=nav.objLoc[0].match(/album(-?\d+)_(\d+)/);
			if(m && ! /album\d+_00/.test(nav.objLoc[0])){	
				var oid=m[1];
				var aid=m[2];
				var a=p.album_actions();
				for(var i=0;i<a.lenght;i++) cur.vkAlbumMenu.addItem(a[i]);
			}
		}*/
	},
	init:function(){
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.init){
				var tstart=unixtime();
				p.init();	
				vklog('Plugin "'+key+'" inited. '+(unixtime()-tstart)+'ms');
			}
		}
	},
	css:function(){
		var css='';
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.css) css+=(Object.prototype.toString.call(p.css) === '[object Function]')?p.css():p.css;	
		}
		return css;
	},
	onloc:function(){
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.onLocation){ 
				var tstart=unixtime();
				p.onLocation(nav.objLoc,cur.module);
				vklog('Plugin "'+key+'" onLocation: '+(unixtime()-tstart)+'ms');
			}
		}
	},
	onjs:function(file){
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.onLibFiles) {
				var tstart=unixtime();
				p.onLibFiles(file);
				vklog('Plugin "'+key+'" onLibFiles: '+(unixtime()-tstart)+'ms');
			}
		}
	},
	processlink:function(node){
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.processLinks) p.processLinks(node);
		}
	},
	processnode:function(node,is_lite){
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.processNode){ 
				var tstart=unixtime();
				p.processNode(node,is_lite);
				vklog('Plugin "'+key+'" ProcessNode: '+(unixtime()-tstart)+'ms');
			}
		}
	},
	photoview_actions:function(ph){
		var r='';
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.pvActions) {
				var tstart=unixtime();
				r+=isFunction(p.pvActions)?p.pvActions(ph):p.pvActions;
				vklog('Plugin "'+key+'" PhView actions: '+(unixtime()-tstart)+'ms');
			}
		}		
		return r;
	},
	album_actions:function(oid,aid){
		var a=[];
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.albumActions) {
				var tstart=unixtime();
				a=a.concat(isFunction(p.albumActions)?p.albumActions(oid,aid):p.albumActions);
				vklog('Plugin "'+key+'" Album actions items: '+(unixtime()-tstart)+'ms');
			}
			p.album_actions_ok=true;	
		}	
		return a;
	},
   videos_actions:function(oid,aid){
		var a=[];
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.videosActions) {
				var tstart=unixtime();
				a=a.concat(isFunction(p.videosActions)?p.videosActions(oid,aid):p.videosActions);
				vklog('Plugin "'+key+'" Videos actions items: '+(unixtime()-tstart)+'ms');
			}
		}	
		return a;   
   },
	video_links:function(video_data,links_array){
		var r='';
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.vidActLinks) {
				var tstart=unixtime();
				r+=isFunction(p.vidActLinks)?p.vidActLinks(video_data,links_array):p.vidActLinks;
				vklog('Plugin "'+key+'" VidLinks actions: '+(unixtime()-tstart)+'ms');
			}
		}		
		return r;		
	},
	process_response:function(answer,url,params){
		var r='';
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.onResponseAnswer) {
				var tstart=unixtime();
				r=p.onResponseAnswer(answer,url,params);
				if (r){
					vklog('Plugin "'+key+'" onResponseAnswer: '+(unixtime()-tstart)+'ms');
				}
			}
		}		
		//return r;		
	},
   user_menu_items:function(uid,gid){
		var r='';
		for (var key in vkopt_plugins){
			var p=vkopt_plugins[key];
			if (p.UserMenuItems) {
				var tstart=unixtime();
            var i = p.UserMenuItems(uid,gid) || '';
            if (isArray(i)){
               r+='<li><div class="vk_user_menu_divider"></div></li>';
               for (var j=0; j<i.length;j++)
                  r+='<li onmousemove="clearTimeout(pup_tout);" onmouseout="pup_tout=setTimeout(pupHide, 400);">'+i[j]+'</li>';              
            } else {
               if (i) r+='<li><div class="vk_user_menu_divider"></div></li>';
               r+='<li onmousemove="clearTimeout(pup_tout);" onmouseout="pup_tout=setTimeout(pupHide, 400);">'+i+'</li>';
            } 
				if (r) vklog('Plugin "'+key+'" user_menu_items: '+(unixtime()-tstart)+'ms');	
			}
		}		
		return r;		   
   }
}
vkopt_plugin_run=vk_plugins.run;

/*! CONNECT PLUGIN CODE

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
   var PLUGIN_ID = 'vkmyplugin';
   var PLUGIN_NAME = 'vk my test plugin';   
   var ADDITIONAL_CSS='';

   vkopt_plugins[PLUGIN_ID]={
      Name:PLUGIN_NAME,
      css:ADDITIONAL_CSS,
   // FUNCTIONS
      init:             null,                    // function();                        //run on connect plugin to vkopt
      onLocation:       null,                    // function(nav_obj,cur_module_name); //On new location
      onLibFiles:       null,                    // function(file_name);               //On connect new vk script
      onStorage :       null,                    // function(command_id,command_obj);
      processLinks:     null,                    // function(link);
      processNode:      null,                    // function(node);
      pvActions:        null,                    // function(photo_data); ||  String    //PHOTOVIEWER_ACTIONS
      albumActions:     null,                    // function(oid,aid); || Array with items. Example  [{l:'Link1', onClick:Link1Func},{l:'Link2', onClick:Link2Func}]
      videosActions:    null,                    // see "albumActions"
      vidActLinks:      null,                    // function(video_data,links_array); ||  String.   video_data may contain iframe url
      onResponseAnswer: null,                    // function(answer,url,params); 'answer' is array. modify only array items
      UserMenuItems:    null                     // function(uid) || string
   };
   if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();

*/

/* WebMoney Form */
function WMDonateForm(Amount,purse_id,descr_text,submit_text){
 descr_text=descr_text?descr_text:IDL('Donate_text');
 submit_text=submit_text?submit_text:IDL('Donate');
 var type=purse_id.match(/(\w)\d+/)[1].toLowerCase();
 var wm='WM'+type.toUpperCase();
 var html='<div style="margin:0 auto; display: table;"><FORM action="wmk:payto" style="padding:0; margin:0px" method="get">\
	<table><tr><td><IMG src="http://www.webmoney.ru/img/wmkeeper_48x48.png"></td><td>\
	<b>'+purse_id+'</b><br><INPUT type=hidden value="'+purse_id+'" name=Purse>\
	<INPUT style="\
	width:40px; padding:2px 2px 2px 22px; border:1px solid #DDD; background:url(http://www.webmoney.ru/img/icons/wm'+type+'.gif) 2px 2px no-repeat; text-align:right;\
	" size=4 value="'+Amount+'" name=Amount> '+wm+' <BR>\
	<INPUT type=hidden value="'+descr_text+'" name=Desc>\
	<INPUT type=hidden value=Y name=BringToFront>\
	<INPUT type=submit value="'+submit_text+'">\
</td></tr></table></FORM>\
<div style="color:#AAA; font-size:7pt; text-align:center;">'+IDL('NeedWMKeeper')+'</div>\
</div>';
return html;
}
/* Yandex Money */
function YMDonateForm(Amount,purse_id,submit_text){
  if(ge('purse_ad_link')) show('purse_ad_link');
 submit_text=submit_text?submit_text:IDL('Donate');
 var html=
 '<div style="margin:0 auto; display: table;">\
  <form style="margin: 0; padding: 0;" action="https://money.yandex.ru/charity.xml" method="post">\
    <input type="hidden" name="to" value="'+purse_id+'"/>\
	<input type="hidden" name="CompanyName" value="vkOpt"/>\
    <input type="hidden" name="CompanyLink" value="http://vkopt.net/"/>\
    <table><tbody><tr><td>\
    <img src="data:image/gif;base64,R0lGODlhWgAnAOZbACMgIPV7ISMgISQgIfzex+Pj46yrq/Hx8e0cJFpYWPR6IFpYWdbV1fecWDEtLnZzdExJSj87PPV7IJ6dnZGPkISBgvJVW3Z0dO0dJGhlZvm1gu4dJf7u4/WDLvvNq/icWfm9jzEuLv738TEuL/aUSvrGyFtYWbq5ufJWXP3j5PekZv7x8e84P/3m1T88PPitdPRyd2hmZvBHTfJWW0xKS2hmZ/aDL/mtdfaNkUxKSoSCg62rq/zU1vWMPGlmZ/icn+8rM/ikZ/A5QHZ0dfebWPRydvWLPPzWuTIuL/m0gvebn/rFnfRxdvBITfaOkeTj4/eUSj88PfNjafiqrfisdPvGyFpXWJGPj8jHx/R7ICMfIP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFsALAAAAABaACcAAAf/gFuCWzhACIeDiYqLjI2Oj5CRjjgYUlVNGJKam5ydjiwsgjOZnqWmp4krCEWCKAiosLGaJQhOghYbWwYJWwxWBoILCQkmglcOI1i6Jgy+wAYOAzWy1IIIMrevV1pbWFpXglpWEQDdAhcQI1vbWBlaBVgCGRcV1dQwCD9bFtrc3uBbviXg9gDAAQMAsFwZYECLji0FD9irtkIGgg0IMrGb8M3cCSsDttAIgWUCgAnbooSQ6MDKRHslMFhgkYuCFgA3wWEZgMVKOS1AgV7ZBiBDOJcvqVnAkAJFrm3dAIDbdsAKNwBWsGgtYDOCFmXiksqaggDGFqfr/GmhsMUHhC0+/7dACJFoW0OXSByIjSUEQYotM7QJ6PatAABgC7Qc0KHlwgEGB64kvJDwQePHex0ReKGBkRIETLJtsWnuis+gUg+4GABUIc8C4go4AGowsyIOKrIoyEJgUYoSKwTxKLEF3pYDWAokoKEVCwRwB68wKI5FIgNlByZMKGB7kIgkWQKE521qwTRBVgB25wTCRpb37wP0Xk9/kAcj4cW/3z2/fncCDcCnn4D9+ScWbvDpNuB4BRo4EQjxBRDAbu9pQMJ+DRoz1IbADFJADACM8IBEghhwxQSDmNihQuolggUFGw5lQAFDcVdcjYx4kIUEFA64xBYQvkdACw1Q0V9QWrCGVP9xDgCAkxZvoTdAOehhZQxQjGyDmjjeCKDMFhW0xsgH48W3YwBbiNCDfgQQoEAAHQyCU3oRCLCkVVoYYFme6AnADXpa8JLWn4poGaMBO30liFcJMdKABPBBGh8JHZTZJnyDCAVXWMUBVc8Ws+UgSAI4DZIYUkRlmaQi3ijaqqKLkKnfguNJeml4g/gJjlVIcQRrDFhuGhKgqAZbqABUDtKqMhfc5OWYCUoqqZm8ESBhFoLApsUJW5wqiDuKXSnAdFYgOwivxpS6iJastnZACEF9qUiA4tWb4IDyWfueIMvCZacgELSmlWWN4jkUBV4VS9tzg2wzmIutNTTbs4sEWOb/te9JKl4LBIzHL1DTmSCAoEn6yRptylj15E2caokkquoqK4CX7ljGk6MCJmimeA1s0fG+gwK6QDgDOFAnkikju4AVVoxgZVoGnZADUMBIRujHh2nhwAliVjyevTp3cIMIPusnyBADIOWToDgJughIhFolaKpbPHHTA0G7OHPN/Xqt824SNuBBIhCKt6gWn6ILqrGK4Glqy8aiu82wygLFmlY4yZuIxfh2oAEH3h0RRIK9IDvdpoJaJYCNjcesOLsAB7oOAJR/zFoEhMGqCJkSXEvE4IK0AMKF4VGIbZgunKvF0Fv4ivciC7jOqU1/Gob47FfnLlXumg/SwG42fJ6mnwcvVIpvme8K0GG3AkQgEWwDCHDF+6ebYGxic2NZQMCKwl65n9xJVPcEIasbEMBCOiuTziyHJNRciWU3GdZpBjEQpNgkfs56nv8+xiksZI4RuQGbgMQDOHw1kDZBGUSYaCMA5pFKL1UqFgZdoJ4NmgMAO+DgALfAASj0CD7GAyJ8XqAFilXuagVAyYwcZI+uHZGJ3XEiv2IGxSpaMSmBAAA7">\
    </td><td><b>'+purse_id+'</b>\
            <br><input type="text" id="CompanySum" name="CompanySum" value="'+Amount+'" size="4" style="width:30px; padding:2px 2px 2px 2px; border:1px solid #DDD; text-align:right;"/>\
            <input type="submit" value="'+submit_text+'" style="margin-right: 5px;"/>\
    </td></tr></tbody></table></form></div>';
	return html;
}

function YM5DonateForm(purse_id,submit_text){
 submit_text=submit_text?submit_text:IDL('Donate');
 var type=purse_id.match(/(\w)\d+/)[1].toLowerCase();
 var wm='WM'+type.toUpperCase();
 var html='<div style="margin:0 auto; display: table;"><img src="data:image/gif;base64,R0lGODlhWgAnAOZbACMgIPV7ISMgISQgIfzex+Pj46yrq/Hx8e0cJFpYWPR6IFpYWdbV1fecWDEtLnZzdExJSj87PPV7IJ6dnZGPkISBgvJVW3Z0dO0dJGhlZvm1gu4dJf7u4/WDLvvNq/icWfm9jzEuLv738TEuL/aUSvrGyFtYWbq5ufJWXP3j5PekZv7x8e84P/3m1T88PPitdPRyd2hmZvBHTfJWW0xKS2hmZ/aDL/mtdfaNkUxKSoSCg62rq/zU1vWMPGlmZ/icn+8rM/ikZ/A5QHZ0dfebWPRydvWLPPzWuTIuL/m0gvebn/rFnfRxdvBITfaOkeTj4/eUSj88PfNjafiqrfisdPvGyFpXWJGPj8jHx/R7ICMfIP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAFsALAAAAABaACcAAAf/gFuCWzhACIeDiYqLjI2Oj5CRjjgYUlVNGJKam5ydjiwsgjOZnqWmp4krCEWCKAiosLGaJQhOghYbWwYJWwxWBoILCQkmglcOI1i6Jgy+wAYOAzWy1IIIMrevV1pbWFpXglpWEQDdAhcQI1vbWBlaBVgCGRcV1dQwCD9bFtrc3uBbviXg9gDAAQMAsFwZYECLji0FD9irtkIGgg0IMrGb8M3cCSsDttAIgWUCgAnbooSQ6MDKRHslMFhgkYuCFgA3wWEZgMVKOS1AgV7ZBiBDOJcvqVnAkAJFrm3dAIDbdsAKNwBWsGgtYDOCFmXiksqaggDGFqfr/GmhsMUHhC0+/7dACJFoW0OXSByIjSUEQYotM7QJ6PatAABgC7Qc0KHlwgEGB64kvJDwQePHex0ReKGBkRIETLJtsWnuis+gUg+4GABUIc8C4go4AGowsyIOKrIoyEJgUYoSKwTxKLEF3pYDWAokoKEVCwRwB68wKI5FIgNlByZMKGB7kIgkWQKE521qwTRBVgB25wTCRpb37wP0Xk9/kAcj4cW/3z2/fncCDcCnn4D9+ScWbvDpNuB4BRo4EQjxBRDAbu9pQMJ+DRoz1IbADFJADACM8IBEghhwxQSDmNihQuolggUFGw5lQAFDcVdcjYx4kIUEFA64xBYQvkdACw1Q0V9QWrCGVP9xDgCAkxZvoTdAOehhZQxQjGyDmjjeCKDMFhW0xsgH48W3YwBbiNCDfgQQoEAAHQyCU3oRCLCkVVoYYFme6AnADXpa8JLWn4poGaMBO30liFcJMdKABPBBGh8JHZTZJnyDCAVXWMUBVc8Ws+UgSAI4DZIYUkRlmaQi3ijaqqKLkKnfguNJeml4g/gJjlVIcQRrDFhuGhKgqAZbqABUDtKqMhfc5OWYCUoqqZm8ESBhFoLApsUJW5wqiDuKXSnAdFYgOwivxpS6iJastnZACEF9qUiA4tWb4IDyWfueIMvCZacgELSmlWWN4jkUBV4VS9tzg2wzmIutNTTbs4sEWOb/te9JKl4LBIzHL1DTmSCAoEn6yRptylj15E2caokkquoqK4CX7ljGk6MCJmimeA1s0fG+gwK6QDgDOFAnkikju4AVVoxgZVoGnZADUMBIRujHh2nhwAliVjyevTp3cIMIPusnyBADIOWToDgJughIhFolaKpbPHHTA0G7OHPN/Xqt824SNuBBIhCKt6gWn6ILqrGK4Glqy8aiu82wygLFmlY4yZuIxfh2oAEH3h0RRIK9IDvdpoJaJYCNjcesOLsAB7oOAJR/zFoEhMGqCJkSXEvE4IK0AMKF4VGIbZgunKvF0Fv4ivciC7jOqU1/Gob47FfnLlXumg/SwG42fJ6mnwcvVIpvme8K0GG3AkQgEWwDCHDF+6ebYGxic2NZQMCKwl65n9xJVPcEIasbEMBCOiuTziyHJNRciWU3GdZpBjEQpNgkfs56nv8+xiksZI4RuQGbgMQDOHw1kDZBGUSYaCMA5pFKL1UqFgZdoJ4NmgMAO+DgALfAASj0CD7GAyJ8XqAFilXuagVAyYwcZI+uHZGJ3XEiv2IGxSpaMSmBAAA7"/><form style="margin: 0; padding: 0 0 2px;" action="https://money.yandex.ru/donate.xml" method="post">\
  <input type="hidden" name="to" value="'+purse_id+'"/>\
  <input type="hidden" name="s5" value="5rub"/>\
  <input type="submit" value="'+submit_text+'"/>\
  </form></div>';
return html;
}

function AdDonateForm(){
   return vkopt_add_cfg;
}

// YM & WM purses list

function WMPursesList(result_el){
	var purses=[['R'+'2551200'+'81922',30],['E'+'101435'+'675230',1],['Z'+'498828'+'961904',1],['*41001'+'96245'+'7205',30]/*,['*41001486412536',30]*/];
	var html='<style  type="text/css">\
	.purse_link{cursor:pointer; padding:2px 3px 3px 18px; text-decoration:none; display:block; border:1px solid transparent; width:190px;}\
	.purse_link:hover,.purse_yad_link:hover{border:1px solid #DDD;text-decoration:none;}\
	.purse_yad_link{margin-right: 5px; padding:2px 3px 3px 0px; display:block; border:1px solid transparent; width:208px;}\
	.purse_yad_link_img{float:left; background-image: url("data:image/gif;base64,R0lGODlhDQAPAPcAABANC5LeNslOAAN3wmaZM/jzscaIUFXO8A1Gi63P6ZVDBn224P8AAMfSst+sebWdSFktXyDA6+Tp8m2CmK2urf87O3R0dKPQZkp4Ct+SWJmZmVSBw8d8M1mu17jT609ngOPi30hfdE1NTOD5/7m6uvSlGMTFxeDOXX6v/PV6H7W1tff4+UKN0oeGhjMzM7CIYqi6zPvbw/nTjY5vH2OX65nM/+tRGv58O+/gQv+IOdTU1IisVOd/JPD157iqoCxUuBSl5dKtkOWpPs+6Xf/MAP3V1szMzO2TQ0uGrpK85JXh9TddBLPp+Yttj2ChBVub1iFbjf+ZmT1pyf9mZnmPpON5Qoecsf+uXvBtGY+Pj2aEPNLHe7huMjep5unXyOFsEaTE7F6s/P/3iNeIN22m/aZeKcu9zaWjoWZmZvrbIP7dXby0ftvZ3efn5+Dt+LfRk8TL0i6Nx/abXofC/f/2+6yWr5ythj+Uy1B9wERxtiid3VuN4/C8fXCm3Jiuzf7BQ/ODLtbm9fy1MPSWSvlnK/3YbMbT69lkDK9zQZCkuEl41T1qr4u8RPnt6aRQC3HW8u+Hbe7u7uWITIzE+lKD2/8ZGWN5kMrX49vmy76yv9nLmf7lWl2q+H2cUlWi93WyH/6LR+O+mP/UTmu3/bbE0cGVacPm/efx2fr03LzL2WWEvqvC3OytcxeU0abL/vP5/lCIAPeOKvrAwM67d+u0fvpZINXK17bDouKiav/keeHm6vPQrcPolL1xJLPT/v/IDLy8vP6hQ6DR+e5/Mv7sRo+raEe579NHFOCWLC5boOPt9uZ1GYqHdZXB/fRuNiJPkDyh1v727vi/h2Wz/4e4/pHC+fzp2fvkyv3tW6i6jc7s/t/d3qvZ/fXnN9jh6nfGCzR+rf759venguzVW7yysvSTGPinYsXd9f+ZM/TBneRMEe+GJ02U1f///5Z2JXK//9bx//RiDtjFZfzx6iJpn9u5nyBLiqLY8Zy65z5/rvN9KvJzFPqucfz/8eBgCv///yH5BAEAAP8ALAAAAAANAA8AAAhrAP8JHPjPmrQVBAkaTJEiRkKB0gAxbJgwhsQUFx0KjCHnYgo5DDX+8wgI0IqQcuT8m8iwZEiJK1mytJgipkyG1hjalCnHGkyZgOTEWOGz5kRA0qzFkAZSJ0ZpHC96HMmSpE6lMbJq1WrtX0AAOw=="); background-position: 0px 0px;height: 15px;margin-right: 5px;width: 12px; display:block}\
	.purse_ad_link_img{float:left;height: 15px;margin-right: 5px;width: 12px; display:block}\
   #wmdonate{border:1px solid #AAA; border-radius:5px;}\
	</style><div class="purses_block">';
	for (var i=0; i<purses.length; i++){
		var type=purses[i][0].match(/(\w)(\d+)/)[1].toLowerCase();
		var yad=purses[i][0].split('*')[1];
		if (!yad)
			html+='<a href=# class="purse_link" onclick="ge(\''+result_el+'\').innerHTML=WMDonateForm('+purses[i][1]+',\''+purses[i][0]+'\'); return false" style="background:url(http://www.webmoney.ru/img/icons/wm'+type+'.gif) 0px 0px no-repeat;">'+purses[i][0]+'<span style="float:right">WebMoney</span></a>';
		else 
			html+='<a href=# class="purse_yad_link" onclick="ge(\''+result_el+'\').innerHTML=YMDonateForm('+purses[i][1]+',\''+yad+'\'); return false"><div class="purse_yad_link_img" ></div>'+yad+'<span style="float:right">\u042f\u043d\u0434\u0435\u043a\u0441.\u0414\u0435\u043d\u044c\u0433\u0438</span></a>';	 
	}
   html+='<a href=# class="purse_ad_link" id="purse_ad_link" style="display:none;" onclick="ge(\''+result_el+'\').innerHTML=AdDonateForm(); return false"><div class="purse_ad_link_img" ></div>\u0420\u0435\u043a\u043b\u0430\u043c\u0430</a>'
	html+='</div>';
	return html;
}
if (!window.winToUtf) winToUtf=function(text) {
  var m, i, j, code;  m = text.match(/&#[0-9]{2}[0-9]*;/gi);
  for (j in m) {   var val = '' + m[j]; code = intval(val.substr(2, val.length - 3));
    if (code >= 32 && ('&#' + code + ';' == val)) text = text.replace(val, String.fromCharCode(code));
  }  text = text.replace(/&quot;/gi, '"').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  return text;
}
if (!window.ge) ge=function(q) {return document.getElementById(q);}
if (!window.geByTag) geByTag=function(searchTag, node) {return (node || document).getElementsByTagName(searchTag);}
if (!window.geByTag1) geByTag1=function(searchTag, node) {return geByTag(searchTag, node)[0];}

var dloc=document.location.href.split('/')[2] || '';

setTimeout(dApi.Check,10);
//if(!(dloc.indexOf('vk.com')!=-1 || dloc.indexOf('vkontakte.ru')!=-1)) {
(function(){
   var xfr_delay=800;
   if (dloc.match(/vk\.com|vkontakte\.ru|userapi\.com|vk\.me/)) xfr_delay=0; 
   setTimeout(XFR.check,xfr_delay);
})();


//}
/*if(!(dloc.indexOf('vk.com')!=-1 || dloc.indexOf('vkontakte.ru')!=-1)) {*/setTimeout(XFR2.check,800);//}

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;


