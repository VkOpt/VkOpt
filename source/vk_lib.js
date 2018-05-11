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


var vk_DEBUG = false,
    ENABLE_CACHE = false,
    LOAD_HEADERS_BY_HEAD_REQ = false; // для получения запросом только хидеров использовать HEAD запрос (иначе GET c хидером запроса Range: bytes=0-1)
var SetsOnLocalStore={
  'vkOVer':'c',
  'dapi_mid':'c',
  'dapi_sid':'c',
  'dapi_secret':'c',
};

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

var vk_lib = {};

/* FUNCTIONS LEVEL 0*/
///////////
function isNewLib(){return window.showWriteMessageBox} // deprecated
function isNewVk(){return typeof prepareAudioLayer != 'undefined'}

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
  mac: /mac/i.test(_ua_),
  linux: /linux/.test(_ua_)
};
if (window.opera) {vkbrowser.mozilla=false; vkbrowser.opera=true;}




	if ( !('innerText' in HTMLElement.prototype) ) {
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
	if ( !('outerHTML' in HTMLElement.prototype) ) {
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


if (!window.Audio){
  Audio= function(){
    this.notification    = function(){this.play  = function(){};};
    this.play  = function(){};
  }
}

var vkMozExtension = {
   callbacks: [],
   send_request: function (data, callback) { // analogue of chrome.extension.sendRequest
      var set_data = function (el, field, data) {
         if(el.dataset) {
            el.dataset[field] = JSON.stringify(data);
         } else {
            el.setUserData(field, data, null);
         }
      };
      var get_data = function (el, field) {
         if(el.dataset) {
            return JSON.parse(el.dataset[field]);
         } else {
            return el.getUserData(field);
         }
      };
      var request = document.createElement("div");
      set_data(request, "data", data);
      if(callback) {
         var callback_idx = vkMozExtension.callbacks.length;
         vkMozExtension.callbacks.push(function (response) {
            vkMozExtension.callbacks[callback_idx] = null;
            //alert('Before callback');
            return callback(response);
         });
         set_data(request, "callback", callback_idx);
         document.addEventListener("mozext-response", function (event) {
            var node = event.target,
               callback = vkMozExtension.callbacks[get_data(node, "callback")],
               response = get_data(node, "response");
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
   callback: function (response) {
      return alert("response: " + (response && response.toSource ? response.toSource() : response));
   }
};
/* FUNCTIONS. LEVEL 1 */
	//LANG
   function print_r( array) {
      var pad_char = " ", pad_val = 4;

      var formatArray = function (obj, cur_depth, pad_val, pad_char) {
         if(cur_depth > 0)
            cur_depth++;

         var base_pad = repeat_char(pad_val*cur_depth, pad_char);
         var thick_pad = repeat_char(pad_val*(cur_depth+1), pad_char);
         var str = "";

         if(typeof obj=='object' || typeof obj=='array' || (obj.length>0 && typeof obj!='string' && typeof obj!='number')) { // typeof obj=='array' не существует
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
         }

         return str;
      };

      var repeat_char = function (len, _char) {
         var str = "";
         for(var i=0; i < len; i++) { str += _char; }
         return str;
      };

      return formatArray(array, 0, pad_val, pad_char);
   }
   function isArray(obj) { return Array.isArray(obj); }
   function isFunction(obj) { return typeof obj === 'function'; }
	function vkCutBracket(s,bracket){
      if (isArray(s)) return s;
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
     };
	  if (vk_lang[i]) return vkCutBracket(dec(vk_lang[i]),bracket);
	  if (vk_lang_ru[i]) return vkCutBracket(dec(vk_lang_ru[i]),bracket);
	  if (window.vk_lang_add && vk_lang_add[i]) return vkCutBracket(dec(vk_lang_add[i]),bracket);
	  else return vkCutBracket(i,bracket);
	}

   function vkopt_brackets(s){
      var s1=vkCutBracket(s,2);
      if (!CUT_VKOPT_BRACKET) s1='[ '+s1+' ]';
      return s1;
   }

	function vkExtendLang(obj) {    // Используется в некоторых плагинах к вкопту. Там узкоспециализированные скрипты по мелочам. Человек 5 использует.
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

   function vk_string_escape(str){
      function encodeCharx(original){
        var thecharchar=original.charAt(0);
         switch(thecharchar){
               case '\n': return "\\n"; break; //newline
               case '\r': return "\\r"; break; //Carriage return
               case '\'': return "\\'"; break;
               case '"': return "\\\""; break;
               //case '\&': return "\\&"; break;
               case '\\': return "\\\\"; break;
               case '\t': return "\\t"; break;
               //case '\b': return "\\b"; break;
               //case '\f': return "\\f"; break;

               default:
                  return original;
                  break;
         }
      }
      var preescape="" + str;
      var escaped="";
      for(var i=0;i<preescape.length;i++){
         escaped=escaped+encodeCharx(preescape.charAt(i));
      }
      return escaped;
   }
   function vkRemoveTrash(s,additional_excludes){
      additional_excludes = additional_excludes || '';
      //maybe need optimize  (collect all ranges to single string...)
      var normal_ranges={
         Ll:'\u0061-\u007a\u00aa\u00b5\u00ba\u00df-\u00f6\u00f8-\u00ff\u0101\u0103\u0105\u0107\u0109\u010b\u010d\u010f\u0111\u0113\u0115\u0117\u0119\u011b\u011d\u011f\u0121\u0123\u0125\u0127\u0129\u012b\u012d\u012f\u0131\u0133\u0135\u0137\u0138\u013a\u013c\u013e\u0140\u0142\u0144\u0146\u0148\u0149\u014b\u014d\u014f\u0151\u0153\u0155\u0157\u0159\u015b\u015d\u015f\u0161\u0163\u0165\u0167\u0169\u016b\u016d\u016f\u0171\u0173\u0175\u0177\u017a\u017c\u017e-\u0180\u0183\u0185\u0188\u018c\u018d\u0192\u0195\u0199-\u019b\u019e\u01a1\u01a3\u01a5\u01a8\u01aa\u01ab\u01ad\u01b0\u01b4\u01b6\u01b9\u01ba\u01bd-\u01bf\u01c6\u01c9\u01cc\u01ce\u01d0\u01d2\u01d4\u01d6\u01d8\u01da\u01dc\u01dd\u01df\u01e1\u01e3\u01e5\u01e7\u01e9\u01eb\u01ed\u01ef\u01f0\u01f3\u01f5\u01f9\u01fb\u01fd\u01ff\u0201\u0203\u0205\u0207\u0209\u020b\u020d\u020f\u0211\u0213\u0215\u0217\u0219\u021b\u021d\u021f\u0221\u0223\u0225\u0227\u0229\u022b\u022d\u022f\u0231\u0233-\u0239\u023c\u023f\u0240\u0242\u0247\u0249\u024b\u024d\u024f-\u0293\u0295-\u02af\u037b-\u037d\u0390\u03ac-\u03ce\u03d0\u03d1\u03d5-\u03d7\u03d9\u03db\u03dd\u03df\u03e1\u03e3\u03e5\u03e7\u03e9\u03eb\u03ed\u03ef-\u03f3\u03f5\u03f8\u03fb\u03fc\u0430-\u045f\u0461\u0463\u0465\u0467\u0469\u046b\u046d\u046f\u0471\u0473\u0475\u0477\u0479\u047b\u047d\u047f\u0481\u048b\u048d\u048f\u0491\u0493\u0495\u0497\u0499\u049b\u049d\u049f\u04a1\u04a3\u04a5\u04a7\u04a9\u04ab\u04ad\u04af\u04b1\u04b3\u04b5\u04b7\u04b9\u04bb\u04bd\u04bf\u04c2\u04c4\u04c6\u04c8\u04ca\u04cc\u04ce\u04cf\u04d1\u04d3\u04d5\u04d7\u04d9\u04db\u04dd\u04df\u04e1\u04e3\u04e5\u04e7\u04e9\u04eb\u04ed\u04ef\u04f1\u04f3\u04f5\u04f7\u04f9\u04fb\u04fd\u04ff\u0501\u0503\u0505\u0507\u0509\u050b\u050d\u050f\u0511\u0513\u0561-\u0587\u1d00-\u1d2b\u1d62-\u1d77\u1d79-\u1d9a\u1e01\u1e03\u1e05\u1e07\u1e09\u1e0b\u1e0d\u1e0f\u1e11\u1e13\u1e15\u1e17\u1e19\u1e1b\u1e1d\u1e1f\u1e21\u1e23\u1e25\u1e27\u1e29\u1e2b\u1e2d\u1e2f\u1e31\u1e33\u1e35\u1e37\u1e39\u1e3b\u1e3d\u1e3f\u1e41\u1e43\u1e45\u1e47\u1e49\u1e4b\u1e4d\u1e4f\u1e51\u1e53\u1e55\u1e57\u1e59\u1e5b\u1e5d\u1e5f\u1e61\u1e63\u1e65\u1e67\u1e69\u1e6b\u1e6d\u1e6f\u1e71\u1e73\u1e75\u1e77\u1e79\u1e7b\u1e7d\u1e7f\u1e81\u1e83\u1e85\u1e87\u1e89\u1e8b\u1e8d\u1e8f\u1e91\u1e93\u1e95-\u1e9b\u1ea1\u1ea3\u1ea5\u1ea7\u1ea9\u1eab\u1ead\u1eaf\u1eb1\u1eb3\u1eb5\u1eb7\u1eb9\u1ebb\u1ebd\u1ebf\u1ec1\u1ec3\u1ec5\u1ec7\u1ec9\u1ecb\u1ecd\u1ecf\u1ed1\u1ed3\u1ed5\u1ed7\u1ed9\u1edb\u1edd\u1edf\u1ee1\u1ee3\u1ee5\u1ee7\u1ee9\u1eeb\u1eed\u1eef\u1ef1\u1ef3\u1ef5\u1ef7\u1ef9\u1f00-\u1f07\u1f10-\u1f15\u1f20-\u1f27\u1f30-\u1f37\u1f40-\u1f45\u1f50-\u1f57\u1f60-\u1f67\u1f70-\u1f7d\u1f80-\u1f87\u1f90-\u1f97\u1fa0-\u1fa7\u1fb0-\u1fb4\u1fb6\u1fb7\u1fbe\u1fc2-\u1fc4\u1fc6\u1fc7\u1fd0-\u1fd3\u1fd6\u1fd7\u1fe0-\u1fe7\u1ff2-\u1ff4\u1ff6\u1ff7\u2071\u207f\u210a\u210e\u210f\u2113\u212f\u2134\u2139\u213c\u213d\u2146-\u2149\u214e\u2184\u2c30-\u2c5e\u2c61\u2c65\u2c66\u2c68\u2c6a\u2c6c\u2c74\u2c76\u2c77\u2c81\u2c83\u2c85\u2c87\u2c89\u2c8b\u2c8d\u2c8f\u2c91\u2c93\u2c95\u2c97\u2c99\u2c9b\u2c9d\u2c9f\u2ca1\u2ca3\u2ca5\u2ca7\u2ca9\u2cab\u2cad\u2caf\u2cb1\u2cb3\u2cb5\u2cb7\u2cb9\u2cbb\u2cbd\u2cbf\u2cc1\u2cc3\u2cc5\u2cc7\u2cc9\u2ccb\u2ccd\u2ccf\u2cd1\u2cd3\u2cd5\u2cd7\u2cd9\u2cdb\u2cdd\u2cdf\u2ce1\u2ce3\u2ce4\u2d00-\u2d25\ufb00-\ufb06\ufb13-\ufb17\uff41-\uff5a',
         Lm:'\u02b0-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ee\u037a\u0559\u0640\u06e5\u06e6\u07f4\u07f5\u07fa\u0e46\u0ec6\u10fc\u17d7\u1843\u1d2c-\u1d61\u1d78\u1d9b-\u1dbf\u2090-\u2094\u2d6f\u3005\u3031-\u3035\u303b\u309d\u309e\u30fc-\u30fe\ua015\ua717-\ua71a\uff70\uff9e\uff9f',
         Lo:'\u01bb\u01c0-\u01c3\u0294\u05d0-\u05ea\u05f0-\u05f2\u0621-\u063a\u0641-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u076d\u0780-\u07a5\u07b1\u07ca-\u07ea\u0904-\u0939\u093d\u0950\u0958-\u0961\u097b-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d28\u0d2a-\u0d39\u0d60\u0d61\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e45\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0edc\u0edd\u0f00\u0f40-\u0f47\u0f49-\u0f6a\u0f88-\u0f8b\u1000-\u1021\u1023-\u1027\u1029\u102a\u1050-\u1055\u10d0-\u10fa\u1100-\u1159\u115f-\u11a2\u11a8-\u11f9\u1200-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u1676\u1681-\u169a\u16a0-\u16ea\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17dc\u1820-\u1842\u1844-\u1877\u1880-\u18a8\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19a9\u19c1-\u19c7\u1a00-\u1a16\u1b05-\u1b33\u1b45-\u1b4b\u2135-\u2138\u2d30-\u2d65\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3006\u303c\u3041-\u3096\u309f\u30a1-\u30fa\u30ff\u3105-\u312c\u3131-\u318e\u31a0-\u31b7\u31f0-\u31ff\u3400\u4db5\u4e00\u9fbb\ua000-\ua014\ua016-\ua48c\ua800\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\uac00\ud7a3\uf900-\ufa2d\ufa30-\ufa6a\ufa70-\ufad9\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff66-\uff6f\uff71-\uff9d\uffa0-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc',
         Lt:'\u01c5\u01c8\u01cb\u01f2\u1f88-\u1f8f\u1f98-\u1f9f\u1fa8-\u1faf\u1fbc\u1fcc\u1ffc',
         Lu:'\u0041-\u005a\u00c0-\u00d6\u00d8-\u00de\u0100\u0102\u0104\u0106\u0108\u010a\u010c\u010e\u0110\u0112\u0114\u0116\u0118\u011a\u011c\u011e\u0120\u0122\u0124\u0126\u0128\u012a\u012c\u012e\u0130\u0132\u0134\u0136\u0139\u013b\u013d\u013f\u0141\u0143\u0145\u0147\u014a\u014c\u014e\u0150\u0152\u0154\u0156\u0158\u015a\u015c\u015e\u0160\u0162\u0164\u0166\u0168\u016a\u016c\u016e\u0170\u0172\u0174\u0176\u0178\u0179\u017b\u017d\u0181\u0182\u0184\u0186\u0187\u0189-\u018b\u018e-\u0191\u0193\u0194\u0196-\u0198\u019c\u019d\u019f\u01a0\u01a2\u01a4\u01a6\u01a7\u01a9\u01ac\u01ae\u01af\u01b1-\u01b3\u01b5\u01b7\u01b8\u01bc\u01c4\u01c7\u01ca\u01cd\u01cf\u01d1\u01d3\u01d5\u01d7\u01d9\u01db\u01de\u01e0\u01e2\u01e4\u01e6\u01e8\u01ea\u01ec\u01ee\u01f1\u01f4\u01f6-\u01f8\u01fa\u01fc\u01fe\u0200\u0202\u0204\u0206\u0208\u020a\u020c\u020e\u0210\u0212\u0214\u0216\u0218\u021a\u021c\u021e\u0220\u0222\u0224\u0226\u0228\u022a\u022c\u022e\u0230\u0232\u023a\u023b\u023d\u023e\u0241\u0243-\u0246\u0248\u024a\u024c\u024e\u0386\u0388-\u038a\u038c\u038e\u038f\u0391-\u03a1\u03a3-\u03ab\u03d2-\u03d4\u03d8\u03da\u03dc\u03de\u03e0\u03e2\u03e4\u03e6\u03e8\u03ea\u03ec\u03ee\u03f4\u03f7\u03f9\u03fa\u03fd-\u042f\u0460\u0462\u0464\u0466\u0468\u046a\u046c\u046e\u0470\u0472\u0474\u0476\u0478\u047a\u047c\u047e\u0480\u048a\u048c\u048e\u0490\u0492\u0494\u0496\u0498\u049a\u049c\u049e\u04a0\u04a2\u04a4\u04a6\u04a8\u04aa\u04ac\u04ae\u04b0\u04b2\u04b4\u04b6\u04b8\u04ba\u04bc\u04be\u04c0\u04c1\u04c3\u04c5\u04c7\u04c9\u04cb\u04cd\u04d0\u04d2\u04d4\u04d6\u04d8\u04da\u04dc\u04de\u04e0\u04e2\u04e4\u04e6\u04e8\u04ea\u04ec\u04ee\u04f0\u04f2\u04f4\u04f6\u04f8\u04fa\u04fc\u04fe\u0500\u0502\u0504\u0506\u0508\u050a\u050c\u050e\u0510\u0512\u0531-\u0556\u10a0-\u10c5\u1e00\u1e02\u1e04\u1e06\u1e08\u1e0a\u1e0c\u1e0e\u1e10\u1e12\u1e14\u1e16\u1e18\u1e1a\u1e1c\u1e1e\u1e20\u1e22\u1e24\u1e26\u1e28\u1e2a\u1e2c\u1e2e\u1e30\u1e32\u1e34\u1e36\u1e38\u1e3a\u1e3c\u1e3e\u1e40\u1e42\u1e44\u1e46\u1e48\u1e4a\u1e4c\u1e4e\u1e50\u1e52\u1e54\u1e56\u1e58\u1e5a\u1e5c\u1e5e\u1e60\u1e62\u1e64\u1e66\u1e68\u1e6a\u1e6c\u1e6e\u1e70\u1e72\u1e74\u1e76\u1e78\u1e7a\u1e7c\u1e7e\u1e80\u1e82\u1e84\u1e86\u1e88\u1e8a\u1e8c\u1e8e\u1e90\u1e92\u1e94\u1ea0\u1ea2\u1ea4\u1ea6\u1ea8\u1eaa\u1eac\u1eae\u1eb0\u1eb2\u1eb4\u1eb6\u1eb8\u1eba\u1ebc\u1ebe\u1ec0\u1ec2\u1ec4\u1ec6\u1ec8\u1eca\u1ecc\u1ece\u1ed0\u1ed2\u1ed4\u1ed6\u1ed8\u1eda\u1edc\u1ede\u1ee0\u1ee2\u1ee4\u1ee6\u1ee8\u1eea\u1eec\u1eee\u1ef0\u1ef2\u1ef4\u1ef6\u1ef8\u1f08-\u1f0f\u1f18-\u1f1d\u1f28-\u1f2f\u1f38-\u1f3f\u1f48-\u1f4d\u1f59\u1f5b\u1f5d\u1f5f\u1f68-\u1f6f\u1fb8-\u1fbb\u1fc8-\u1fcb\u1fd8-\u1fdb\u1fe8-\u1fec\u1ff8-\u1ffb\u2102\u2107\u210b-\u210d\u2110-\u2112\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u2130-\u2133\u213e\u213f\u2145\u2183\u2c00-\u2c2e\u2c60\u2c62-\u2c64\u2c67\u2c69\u2c6b\u2c75\u2c80\u2c82\u2c84\u2c86\u2c88\u2c8a\u2c8c\u2c8e\u2c90\u2c92\u2c94\u2c96\u2c98\u2c9a\u2c9c\u2c9e\u2ca0\u2ca2\u2ca4\u2ca6\u2ca8\u2caa\u2cac\u2cae\u2cb0\u2cb2\u2cb4\u2cb6\u2cb8\u2cba\u2cbc\u2cbe\u2cc0\u2cc2\u2cc4\u2cc6\u2cc8\u2cca\u2ccc\u2cce\u2cd0\u2cd2\u2cd4\u2cd6\u2cd8\u2cda\u2cdc\u2cde\u2ce0\u2ce2\uff21-\uff3a',
         dash:'\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\\-',
         others:'\\d\\s\.,&\?!$#%:\\(\\)\\[\\]\\{\\}+<>«»\\\\\/_\'`'
      };
      // &., -(разные дефисы)
      var rx='';
      for (var key in normal_ranges) rx+=normal_ranges[key];

      var trash_rx=new RegExp('[^'+rx+additional_excludes+']','g');
      s=s.replace(trash_rx,' ');
      s=s.replace(/\s\s+/g,' ');
      return s;
   }

   function vkCleanFileName(s){   return trim(s.replace(/[\\\/:\*\?"<>\|]/g,'_').replace(/\u2013/g,'-').replace(/&#\d+;/g,'_').replace(/\s\s/g,'').substr(0,200));   }
   function vkEncodeFileName(s){
      try {
         if (FULL_ENCODE_FILENAME || vkbrowser.chrome)
            return encodeURIComponent(s);
         else
            return s.replace(/([^A-Za-z\u0410-\u042f\u0430-\u044f])/g,function (str, p1) {return encodeURIComponent(p1)});
      }catch(e){
         return s;
      }
   }

   function vkUnescapeCyrLink(str){ // auto detect decode from utf8/win1251 escaped
      return str.replace(/(%[A-F0-9]{2})+/ig, function(s){
         try {
            return decodeURIComponent(s);
         }
         catch (e) {
            try {
               return vkCyr.unescape(s);
            } catch (e) {
               return s;
            }
         }
      });
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
      var res, sec, min;
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

	function insertAfter(node, ref_node) {
		var next = ref_node.nextSibling;
		if (next) next.parentNode.insertBefore(node, next);
		else ref_node.parentNode.appendChild(node);
	}

	function vkNextEl(cur_el){
	  var next_el=cur_el.nextSibling;
	  while(next_el && next_el.nodeType==3) next_el=next_el.nextSibling;
	  return next_el;
	}

   function FindAndProcessTextNodes(node,func){
       var childItem =0;
       while(node.childNodes[childItem]){
           if(node.childNodes[childItem].nodeType==3 && node.tagName!="SCRIPT" && node.tagName!="STYLE" && node.tagName!="TEXTAREA" ){
               childItem = func(node,childItem);
           }else{ FindAndProcessTextNodes(node.childNodes[childItem],func);  }
           childItem++;
       }
   }

	function vkaddcss(addcss,id) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
      if (id) styleElement.setAttribute('mark',id);
		styleElement.appendChild(document.createTextNode(addcss));
		document.getElementsByTagName("head")[0].appendChild(styleElement);
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
		   try {
				   var a = document.evaluate(xpath, root || document, null, 7, null);
		   } catch(e) {
				   return[];
		   }
		   var b=[];
		   for(var i = 0; i < a.snapshotLength; i++) {
				   b[i] = a.snapshotItem(i);
		   }
		   return b;
	}
	function vkLocalStoreReady(){
	  return window.localStorage || window.GM_SetValue || window.sessionStorage;
	}

	function vkSetVal(key,val){
	  if (typeof localStorage!='undefined') {localStorage[key]=val;}//Chrome, FF3.5+
	  else if (typeof GM_SetValue!='undefined'){ GM_SetValue(key,val); }//Mozilla
	  else if (typeof sessionStorage!='undefined'){sessionStorage.setItem(key, val);} //Opera 10.5x+
	  else { vksetCookie(key,val)}
     window.vkopt_ready && vk_settings.backup_handler(); // сохранение дампа настроек в хранилище расширения (не домена vk.com)
	}

	function vkGetVal(key){
	  if (typeof localStorage!='undefined') { return localStorage[key];}//Chrome, Opera, FF3.5+
	  else if (typeof GM_GetValue!='undefined'){ return String(GM_GetValue(key)); }//Mozilla with Greasemonkey
	  else if (typeof sessionStorage!='undefined'){ return sessionStorage.getItem(key);}//Opera 10.5x+
	  else { return vkgetCookie(key)}
	}

	function vksetCookie(cookieName,cookieValue,nDays,domain){
		if (vkLocalStoreReady() && (SetsOnLocalStore[cookieName] || /api\d+_[a-z]+/.test(cookieName))){
		vkSetVal(cookieName,cookieValue);
	  } else {
		var today = new Date();
		var expire = new Date();
		if (nDays==null || nDays==0) nDays=365;
		expire.setTime(today.getTime()+ 3600000*24*nDays);
		document.cookie = cookieName+ "="+ encodeURIComponent(cookieValue)+
		";expires="+ expire.toUTCString()+
		((domain) ? ";domain=" + domain : ";domain="+location.host);
		}
		if (cookieName=='remixbit') SettBit=cookieValue;//vksetCookie('remixbit',SettBit);

	}

	function vkgetCookie(name,temp){
	  if (name=='remixbit' && SettBit && !temp) return SettBit;
	  if (name=='remixmid') { var tmp=remixmid(); if (tmp) return tmp; }
	  if (vkLocalStoreReady() && (SetsOnLocalStore[name] || /api\d+_[a-z]+/.test(name))){
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
		return decodeURIComponent(dc.substring(begin + prefix.length, end));
	}

	function delCookie(name, path, domain) {
		if ( vkgetCookie( name ) ) document.cookie = name + '=' +
		( ( path ) ? ';path=' + path : '') +
		( ( domain ) ? ';domain=' + domain : '' ) +
		';expires=Thu, 01-Jan-1970 00:00:01 GMT';
	}

	function getSet(num,type) {
	  /*if (!SettBit){
	  if (!vkgetCookie('remixbit')) return null;}*/
      if (!SettBit) {
          SettBit = vkgetCookie('remixbit');
          if (!SettBit)
              vksetCookie('remixbit', DefSetBits);  // vksetCookie изменяет SettBit, если имя 'remixbit'
      }
	  if (!type) type=0;
	  if (num=='-')	return SettBit.split('-')[type];


	  var bit=SettBit.split('-')[type].charAt(num);
	  if (!bit) {
	    bit=DefSetBits.split('-')[type].charAt(num);
	    if (!bit) return 'n';
      }
	  else return bit;
	}

	function setSet(num,val,setting) {
	if (!setting) setting=0;
	var settings=vkgetCookie('remixbit').split('-');
	if (num=='-') settings[setting]=val;
	else settings[setting] = settings[setting].replace(new RegExp('^(.{'+num+'}).'), '$1'+val);
	SettBit = settings.join('-');
	vksetCookie('remixbit',SettBit);
	}

	function setCfg(num,val) {
	    setSet(num,val,0);
	}

	function vkRand(){return Math.round((Math.random() * (100000000 - 1)));}
   function vkRandomRange(start, end){return start + Math.round((end - start) * Math.random())}
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
		var nows=  new  Date(); var datsig=nows.getYear()+"_"+nows.getMonth()+"_"+nows.getDate()+"_";
		datsig+=Math.floor(nows.getHours()/4); //raz v 4 chasa
		//    http://kiberinfinity.narod.ru/
		var updatejs='htt'+'p:/'+'/vko'+'pt.n'+'et/upd/upd_fixes.js';
		if (heads.length > 0) {
			AjCrossAttachJS(updatejs+"?"+datsig);
         /*
         if (vk_ext_api.ready){
            vk_aj.get(updatejs+"?"+datsig,function(t){eval(t)});
         } else {
            var node = document.createElement("script");
            node.type = "text/javascript";
            node.src = updatejs+"?"+datsig;   //http://vkoptimizer.narod.ru/update.js
            heads[0].appendChild(node);
         }*/
		}
	}
	/* Injection to JsFunctions Lib  */
	Inj = { // KiberInfinity's JS_InjToFunc_Lib v2.1
		FRegEx : /function[^\(]*\(\s*([^\)]*?)\s*\)[^\{]*\{([\s\S]+)\}/i,
		DisableHistrory : false,
		History : {},
		InitStringifier: function(){
         Function.prototype.toStringOriginal = Function.prototype.toString;
         //var origFnToStr = Function.prototype.toString;
         Function.prototype.toString = function(){
            if (this.inj_func_main){
               var args = [];
               args.push(
                     'Inj modified function:       "'+this.inj_src_path+'"');
               if (this.inj_func_original != this.inj_func_main){
                  args.push(
                     '\nSource function:            ',
                     this.inj_func_original,
                     '\nCurrent with modified code: ',
                     this.inj_func_main
                  );
               }

               if (this.inj_handlers.before.length){
                  args.push(
                     '\nBefore call handlers ('+this.inj_handlers.before.length+'):   ',
                     this.inj_handlers.before
                  )
               }
               if (this.inj_handlers.after.length){
                  args.push(
                     '\nAfter call handlers ('+this.inj_handlers.after.length+'):   ',
                     this.inj_handlers.after
                  )
               }
               console.log.apply(console, args);
               return this.inj_func_main.toStringOriginal();
            } else
               return this.toStringOriginal();

         }
      },
      Wait : function (func, callback, check_timeout, check_count, fail_callback) {
			if (check_count == 0) {
				if (fail_callback)
					fail_callback('WaitForFunc out of allow checkes');
				return;
			}
			if (check_count)
				check_count--;
			var func_ = func;
			if (typeof func == 'string')
				func_ = eval(func);
			if (!check_timeout)
				check_timeout = 1000;
			if (func_)
				callback(func_);
			else
				return setTimeout(function () {
					Inj.Wait(func, callback, check_timeout, check_count, fail_callback)
				}, check_timeout);
			return false;
		},
      GetFunc: function(func){
         return isFunction(func) ? func : eval('window.' + func);
      },
		Parse : function (func) {
			// определение распарсить переданную функцию или же найти по имени функции.
			var fn = Inj.GetFunc(func);

			if (!fn)
				vkopt.log('Inj_Error: "' + func + '" not found', 1);

         var wrp = Inj.Wrap(func);
         fn = wrp.inj_func_main;

			var res = fn ? String(fn).match(Inj.FRegEx) : ['', '', ''];
			if (Inj.need_porno()) {
				res[2] = res[2].replace(/\r?\n/g, " ");
			}
			return {
				func_name : func, // для последующего использования в Make, функция должна быть передана в Parse по строковому имени, либо обязательно переопредление этого параметра на нужное строковое имя.
				func: fn,
            wrapper: wrp,
            full : res[0],
				args : res[1],
				code : res[2],
				args_names : res[1].split(/\s*,\s*/) // используется для макрозамены обозначенных аргументов в коде
			}
		},
		Make : function (parsed_func, code, args) {
			var h = Array.prototype.join.call(args, '#_#');
			var hs = h.replace(/[^A-Za-z0-9]+/g, ""); // генерим "хеш" инъекции. не идеально, но так быстрее, чем crc/md5 и и.д считать.
			if (code.indexOf(hs) != -1) // проверяем, если ли уже метка этой инъекции в функции.
				return false;            // если инъекция уже была сделана ранее, то уходим.

			// Подстановка имён аргументов в места указанные в новом коде как #ARG1#, #ARG2# или __ARG0__, __ARG1__ и т.д
			code = code.replace(/(#|__)ARG(\d+)\1/g, function (s, prefix, idx) {
					var arg_idx = parseInt(idx);
					return parsed_func.args_names[arg_idx];
				});
				var ac = '\n"[inj_label]' + hs + '";';
				// добавляем косметический перенос строки перед родным кодом:
				if (!/^[\r\n\s]*['"]\[inj_label\]/.test(code))
					ac += '\n';
				// перезаписываем функцию новой:
				//eval(parsed_func.func_name + '=function(' + parsed_func.args + '){' + ac + code + '}');
            parsed_func.wrapper.inj_func_main = eval('(function(' + parsed_func.args + '){' + ac + code + '})');
			return true;
		},
		need_porno : function () {
			return vkbrowser.mozilla && parseInt(vkbrowser.version) < 17;
		},
		toRE : function (s, m) {
			if (Inj.need_porno() && (typeof s) == 'string' && (s.indexOf("+'") != -1 || s.indexOf("'+") != -1 || s.indexOf('"+') != -1)) {
				/* this is Porno! */
				s = s.replace(/([\(\)\[\]\\\/\.\^\$\|\?\+])/g, "\\$1");
				s = s.replace(/(["']\\\+)/g, "\\\\?[\"']\\s*\\+\\s*");
				s = s.replace(/(\\\+["'])/g, "\\s*\\+\\s*\\\\?[\"']");
				s = s.replace(/([^\[]|^)["]([^']|$)/g, "$1\\\\?[\"']$2");
				return new RegExp(s, m || '');
			} else
				return s;
		},
		mc : function (s) {
			if (Inj.need_porno()) {
				if (s.substr(0, 2) == "'+")
					s = '"+' + s.substr(2);
				if (s.substr(-2) == "+'")
					s = s.substr(0, s.length - 2) + '+"';
				return s;
			} else
				return s;
		},
      Wrapped : function(func){
         return !!func.inj_handlers;
      },
      Wrap : function(func){
         var src_func = Inj.GetFunc(func);
         var fn_path = ('window.'+func).match(/(.+)\.([^\.]+)/);

         if (Inj.Wrapped(src_func))
            return src_func;

         var wrapper = function func_wrapper(){
            var
               i,
               res,
               result,
               before = func_wrapper.inj_handlers.before,
               after  = func_wrapper.inj_handlers.after,
               args = Array.prototype.slice.call(arguments),
               obj = {
                  args: args,
                  prevent: false,
                  prevent_all: false,
                  return_result: undefined,
                  wrapper: func_wrapper
               };

            for (i = 0; i < args.length; i++)
               obj['__ARG'+i+'__'] = args[i]; // back compatible

            // call "before" handlers
            for (i = 0; i < before.length; i++)
               if (!obj.prevent_all){
                  before[i].apply(obj, args);
                  if (obj.prevent_all)
                     res = obj.return_result;
               }

            // call original function
            if (!obj.prevent)
               result = func_wrapper.inj_func_main.apply(this, args);

            // call "after" handlers
            for (i = 0; i < after.length; i++)
               if (!obj.prevent_all){
                  after[i].apply(obj, args);
                  if (obj.prevent_all)
                     res = obj.return_result;
               }

            return res || result;

         }
         wrapper.add = function(type, fn){
            var hash = vk_lib.crc(fn.toString());
            if (wrapper.inj_handlers[type + '_hashes'].indexOf(hash) == -1){
               wrapper.inj_handlers[type].push(fn);
               wrapper.inj_handlers[type + '_hashes'].push(hash);
               return true;
            } else
               return false;
         }

         wrapper.add_before = function(fn){
            return wrapper.add('before', fn);
         }
         wrapper.add_after = function(fn){
            return wrapper.add('after', fn);
         }

         wrapper.inj_src_path = fn_path[1];
         wrapper.inj_func_original = src_func;  // not modified original function
         wrapper.inj_func_main = src_func;      // we call this, it can contain other injections
         wrapper.inj_handlers = {
            before: [],
            before_hashes: [],
            after: [],
            after_hashes: []
         }
         eval(fn_path[1])[fn_path[2]] = wrapper;
         return wrapper;
      },
		Start : function (func, inj_code) {
         var new_func = Inj.Wrap(func);

         if (isFunction(inj_code))
            new_func.add_before(inj_code)
         else {
            var s = Inj.Parse(func);
            new_func = Inj.Make(s, inj_code + ' ' + s.code, arguments);
         }

         return new_func;
         /*
			if (isFunction(inj_code))                 // ну а что? Inj и так костыль, а с этим удобней местами - передали интересующий нас логически завершённый код завёрнутым в анонимную функцию
				inj_code = Inj.Parse(inj_code).code;   // и выдрали его из неё, а не строкой с экранированиями, без переносов и т.д
			return Inj.Make(s, inj_code + ' ' + s.code, arguments);
         */

		},
		End : function (func, inj_code) {
         var new_func = Inj.Wrap(func);

         if (isFunction(inj_code))
            new_func.add_after(inj_code)
         else {
            var s = Inj.Parse(func);
            new_func = Inj.Make(s, s.code + ' ' + inj_code, arguments);
         }

         return new_func;
		},
		Before : function (func, before_str, inj_code) {
			var s = Inj.Parse(func);
			before_str = Inj.toRE(before_str);

			if (isFunction(inj_code))
				inj_code = Inj.Parse(inj_code).code;
			else
				inj_code = Inj.mc(inj_code);

			var orig_code = ((typeof before_str) == 'string') ? before_str : s.code.match(before_str);
			s.code = s.code.split(before_str).join(inj_code + ' ' + orig_code + ' '); //maybe split(orig_code) ?
			//if (func=='nav.go') alert(s.code);
			return Inj.Make(s, s.code, arguments);
		},
		After : function (func, after_str, inj_code) {
			var s = Inj.Parse(func);
			after_str = Inj.toRE(after_str);

         if (isFunction(inj_code))
				inj_code = Inj.Parse(inj_code).code;
			else
				inj_code = Inj.mc(inj_code);

			var orig_code = ((typeof after_str) == 'string') ? after_str : s.code.match(after_str);
			s.code = s.code.split(after_str).join(orig_code + ' ' + inj_code + ' '); //maybe split(orig_code) ?
			//if (func=='stManager.add') alert(s.code);
			return Inj.Make(s, s.code, arguments);
		},

		BeforeR : function (func, before_rx, inj_code) {
			var s = Inj.Parse(func);

         if (isFunction(inj_code))
				inj_code = Inj.Parse(inj_code).code;
			else
				inj_code = Inj.mc(inj_code);

			s.code = s.code.replace(before_rx, inj_code + ' $&');
			return Inj.Make(s, s.code, arguments);
		},
		AfterR : function (func, before_rx, inj_code) {
			var s = Inj.Parse(func);

         if (isFunction(inj_code))
				inj_code = Inj.Parse(inj_code).code;
			else
				inj_code = Inj.mc(inj_code);

			s.code = s.code.replace(before_rx, '$& ' + inj_code);
			return Inj.Make(s, s.code, arguments);
		},

		Replace : function (func, rep_str, inj_code) {
			var s = Inj.Parse(func);
			s.code = s.code.replace(rep_str, inj_code); //split(rep_str).join(inj_code);
			return Inj.Make(s, s.code, arguments);
		}
	};
   Inj.InitStringifier();

   vk_lib.get_block_comments = function(func){ // извлекаем из кода функции содержимое блоковых комментариев
      var code = Inj.Parse(func).code;
      var obj_rx = /\*([a-z0-9_]+):\s*([\s\S]+?)\s*\*\//ig; // при нахождении /*comment_name: содержимое */ всё будет распарсенно в объект {comment_name: содержимое}
      var arr_rx = /\*(\s*)([\s\S]+?)\s*\*\//g;             // иначе всё будет в виде массива
      var is_obj = obj_rx.test(code);
      var comments = is_obj ? {} : [];
      code.replace(is_obj ? obj_rx : arr_rx,function(s,name,comment){ // просто взял replace вместо while..regexp.exec
         if (is_obj)
            comments[name] = comment;
         else
            comments.push(comment);
         return s;
      });
      return comments;
   };

   vk_lib.tpl_process = function(tpl, values){
      return (tpl || '').replace(/\{([a-z]+)\.([a-z0-9_-]+)\}/ig,function(s,type, id){
         switch(type.toLowerCase()){
            case 'lng': return IDL(id);
            case 'vals': return (values && typeof values[id] != 'undefined') ? values[id] : s;
            default: return s;
         }

      })
   };

   vk_lib.format = function(str){
      var args = arguments;
      return str.replace(/%(\d+)/g,function(s,id){
         id = parseInt(id);
         return args.length > id ? args[id] : s;
      })
   };

   vk_lib.toDataURI = function(type,svg){
      for (var key in svg)
         svg[key] = 'data:' + type + ',' + encodeURIComponent(svg[key])
      return svg;
   }

   vk_lib.crc = function(str){
      var makeCRCTable = function(){
          var c;
          var crcTable = [];
          for(var n =0; n < 256; n++){
              c = n;
              for(var k =0; k < 8; k++)
                  c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
              crcTable[n] = c;
          }
          return crcTable;
      }

      var crc32 = function(str) {
          var crcTable = vk_lib.crcTable || (vk_lib.crcTable = makeCRCTable());
          var crc = 0 ^ (-1);
          for (var i = 0; i < str.length; i++ )
              crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
          return (crc ^ (-1)) >>> 0;
      };

      return crc32(str);
   }


	function TwoWayMap (map) {
		this.map = map;
		this.reverseMap = {};
		for(var key in map)
			this.reverseMap[ map[key] ] = key;
	}
	TwoWayMap.prototype.get = function(key) { return this.map[key] || this.reverseMap[key] || key; };

	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		}
	}

	/* Storage broadcast */
	vkBroadcast={
		disabled:false,
		ignore_current_window:true, //возможность отключать реакцию отсылающей сообщение вкладки реагировать на это же сообщение.
		guid:parseInt(Math.random()*10000),
		cmd_item:'vkopt_command',
		last_cmd:'',
		handler:function(id,cmd){topMsg('<b>Maybe conflict detected</b><br>VkOpt may work not correctly<br>'+JSON.stringify(cmd),4);},
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
    var AjCache={};
    function AjGet(url, callback, unsyn) {
        var hash;
        if (!ENABLE_CACHE || !AjCache[hash = vkMD5(url)]) {
            var request = (vkAjTransport.readyState == 4 || vkAjTransport.readyState == 0) ? vkAjTransport : new XMLHttpRequest();
            vkAjTransport = request;
            if (!request) return false;
            request.onreadystatechange = function () {
                if (request.readyState == 4 && callback) {
                    if (ENABLE_CACHE) AjCache[hash] = request.responseText;
                    callback(request.responseText);
                }
            };
            //unsyn=!unsyn;
            request.open('GET', url, !unsyn);
            request.send(null);
        } else {
            callback(AjCache[hash]);
        }
        return true;
    }


    function AjPost(url, data, callback) {
        var hash;
        if (!ENABLE_CACHE || !AjCache[hash = vkMD5(url + JSON.stringify(data))]) {
            var request = new XMLHttpRequest();
            if (!request) return false;
            request.onreadystatechange = function () {
                if (request.readyState == 4 && callback) {
                    if (ENABLE_CACHE) AjCache[hash] = request.responseText;
                    callback(request.responseText);
                }
            };
            request.open('POST', url, true);
            if (request.setRequestHeader)
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            request.setRequestHeader("X-Requested-With", "XMLHttpRequest");//*/
            request.send(urlEncData(data));
        } else {
            callback(AjCache[hash]);
        }
        return true;
    }

   function AjCrossAttachJS(url,id, callback) {
      	if (vk_ext_api.ready && (url || '').replace(/^\s+|\s+$/g, '')){
            vk_aj.get(url, function (t) {
                window.eval(t);
                if (isFunction(callback)) callback();
            });
            return true;
         } else {
            var request = new XMLHttpRequest();
            if(!request) return false;
            request.onerror=function(){
               //alert('to <head>');
               var element = document.createElement('script');
               element.type = 'text/javascript';
               element.src = url;
               if (id)
                  element.id=id;
               if (isFunction(callback))
                  element.onload = callback;
               document.getElementsByTagName('head')[0].appendChild(element);
            };
            request.onreadystatechange = function() {
               if(request.readyState == 4 && request.responseText!=''){
                  //alert('JS loaded');
                  window.eval(request.responseText);
                  if (isFunction(callback)) callback();
               }
            };
            request.open('GET', url, true);
            request.send(null);
            return false;
         }
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
      if (hex.length==3) hex=hex.replace(/([A-Z0-9])([A-Z0-9])([A-Z0-9])/i,'$1$1$2$2$3$3');
		return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
	}
   function hex2rgba(hexcolor,ret_struct){  // Используется при разработке тем оформления
      var rgb=hex2rgb(hexcolor);
      var r=rgb[0];
      var g=rgb[1];
      var b=rgb[2];
      var min, a = ( 255 - (min = Math.min(r, g, b)) ) / 255;

      var color={
           r    : r = 0|( r - min ) / a,
           g    : g = 0|( g - min ) / a,
           b    : b = 0|( b - min ) / a,
           a    : a = (0|1000*a)/1000,
           rgba : 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
       };
       return ret_struct?color:color.rgba;
   }

/// end of color functions

/* FUNCTIONS. LEVEL 2*/

/* VK GUI */
	//javascript:   var x=0;  setInterval("ge('content').innerHTML=vkProgressBar(x++,100,600,'Выполнено %');",100);  void(0);

	function vkProgressBar(val,max,width,text){
			/*css:
            .vkProgBar{height:30px;  text-align:center;line-height:30px;}
            .vkProgBarFr{ background-color: #6D8FB3; color:#FFF; text-shadow: 0px 1px 0px #45688E;   border-style: solid;  border-width: 1px;  border-color: #7E9CBC #5C82AB #5C82AB;}
            .vkPBFrame{position:absolute; border:1px solid #36638e; overflow:hidden}
            .vkProgBarBgFrame{ background-color: #EEE; border:1px solid #ccc;}
            .vkProgBarBg{text-shadow: 0px 1px 0px #FFF; border:1px solid #EEE;}
            .vkProgressBarBg{background-color: #fff; border:1px solid #ccc}
            .vkProgressBarFr{background-color: #5c7893; border:1px solid #36638e; height: 14px;}
            .vkProg_Bar{height:19px;  text-align:center;line-height:17px; font-size:10px;}
            .vkProg_BarFr{ background-image:url("/images/progress_grad.gif"); background-color: #6D8FB3; color:#FFF; text-shadow: 0px 1px 0px #45688E;   border-style: solid;  border-width: 1px;  border-color: #7E9CBC #5C82AB #5C82AB;}
            .vkPB_Frame{position:absolute; border:1px solid #36638e; overflow:hidden}
            .vkProg_BarBgFrame{ background-color: #EEE; border:1px solid #ccc;}
            .vkProg_BarBg{text-shadow: 0px 1px 0px #FFF; border:1px solid #EEE;  box-shadow: inset 0 10px 26px rgba(255, 255, 255, 0.5);}
         */
         if (val>max) val=max;
			var pos=(val*100/max).toFixed(2).replace(/\.00/,'');
			var perw=(val/max)*width;
			text=(text || '%').replace("%",pos+'%');
			return '<div class="vkProg_Bar vkPB_Frame" style="width: '+perw+'px;">'+
					'<div class="vkProg_Bar vkProg_BarFr" style="width: '+width+'px;">'+text+'</div>'+
				'</div>'+
				'<div  class="vkProg_Bar vkProg_BarBgFrame" style="width: '+width+'px;">'+
					'<div class="vkProg_Bar vkProg_BarBg" style="width: '+width+'px;">'+text+'</div>'+
				'</div>';
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
	  html+='</div>';//'</ul>';
	  return html;
	}
	function vkButton(caption,onclick_attr,gray){
		return '<div class="button_'+(gray?'gray':'blue')+'"><button onclick="' + (onclick_attr || '') + '">'+caption+'</button></div>';
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

	function vkMakeContTabs(trash){
	  if (!window.vkContTabsCount) {
		vkContTabsCount=1;
		vkaddcss(".activetab{display:block} .noactivetab{display:none} ")
	  } else vkContTabsCount++;
	  var j=vkContTabsCount;
	  vkContTabsSwitch=function(idx,show_all){
			var ids=idx.split("_");
			if (show_all){
			  nodes=geByClass("noactivetab",ge('tabcontainer'+ids[0])).slice();
			  for (var i=0; i<nodes.length; i++)
				nodes[i].className="activetab";
			} else {
			  var nodes=geByClass("activetab",ge('tabcontainer'+ids[0])).slice();
			  for (var i=0; i<nodes.length; i++) nodes[i].className="noactivetab";
			  //while(nodes[0]) nodes[0].className="noactivetab";
			}

		   var el=ge("tabcontent"+idx);
		   //if (!show_all)
		   el.className=(!show_all)?"activetab":"noactivetab";
	  };
	  var menu=[];
	  var tabs="";
	  for (var i=0;i<trash.length;i++){
		  menu.push({name:trash[i].name,href:'#',id:'ctab'+j+'_'+i, onclick:"this.blur(); vkContTabsSwitch('"+j+'_'+i+"'"+(trash[i].content=='all'?',true':'')+"); return false;",active:trash[i].active});
		  tabs+='<div id="tabcontent'+j+'_'+i+'" class="'+(!trash[i].active?'noactivetab':'activetab')+'">'+trash[i].content+'</div>';
	  }
	  return '<div class="clearFix vk_tBar">'+vkMakeTabs(menu)+'<div style="clear:both"></div></div><div id="tabcontainer'+j+'" style="padding:1px;">'+tabs+'</div>';
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
           <div id="'+id+'_slider_line" class="vk_slider_line"></div>\
           <div id="'+id+'_slider" class="vk_slider" onmousedown="vk_hor_slider.sliderClick(event,this.parentNode);"></div>\
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
  },
  sliderUpdate: function (percent, val,id) {
      percent = intval(percent);
      ge(id+'_select').value=percent;
      ge(id+'_position').value=val;

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
};

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
		   </div>\
           <div id="'+id+'_slider" class="vk_vslider" onmousedown="vk_v_slider.sliderClick(event,this.parentNode);"></div>\
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
  },
  sliderUpdate: function (percent, val,id) {
      percent = intval(percent);
      ge(id+'_select').value=percent;
      ge(id+'_position').value=val;

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
};

//vk_v_slider.init('photos_albums_container',100,20,function(){},function(){},100);

/*END OF VK GUI*/

function vkSetMouseScroll(el,next,back){
 addEvent(ge(el),'mousewheel DOMMouseScroll',function(e){
      e = e || window.event;
      var wheelData = e.detail ? e.detail * -1 : e.wheelDelta / 40;
      if (Math.abs(wheelData)>100) { wheelData=Math.round(wheelData/100); }
      if (wheelData<0) next(e); else back(e);
      return cancelEvent(e);
 });
}



/* VK API */
function vk_oauth_api(app_id,scope){
   var api = {
      API_ID:app_id,
      SETTINGS:scope,
      allow_call:true,
      protocol:'http:',
      auth:function(callback){
         if (api.auth_process){
            return;
         }
         api.auth_process = true;
         api.allow_call = false;
         // Для http://vk.com при наличии соединения с background.js используем запросы к https через background
         if (vk_ext_api.ready || (location.protocol == 'https:'))
            api.protocol = 'https:';
         if (vk_DEBUG) console.log('Auth for protocol: ', api.protocol, vk_ext_api.ready);
         vksetCookie('api'+api.API_ID+'_prot', api.protocol);

         var appId=api.API_ID;
         var settings=api.SETTINGS+(api.protocol!='https:'?',nohttps':'');

         var auth_url=(api.protocol)+'//oauth.vk.com/authorize?client_id=' + appId +
                                                   '&scope=' + settings +
                                                   '&redirect_uri=http://oauth.vk.com/blank.html'+
                                                   '&display=popup'+
                                                   '&response_type=token';
         XFR.post(auth_url,{},function(t){
            var g=t.match(/https:\/\/[^"]+\.vk\.com\/[^"]+grant_access[^"]+/g);
            g = (g && g[1] && g[1].indexOf('cancel')==-1)?g[1]:(g || [])[0];

            var frame_url=auth_url;
            if (g){
               if (vk_DEBUG) console.log('VkOpt API Auth :',g);
               frame_url=g;
            }
            api.auth_frame = ce("iframe", { src:frame_url }, {
               position: 'absolute', width: '1px', height: '1px', top:'1px', left:'1px', border:'0px'
            });
            document.getElementsByTagName('body')[0].appendChild(api.auth_frame);
            var onmess=function(event) {
                  if (!api.auth_frame || !api.auth_frame.contentWindow) return;
                  var data=(event.data || {});
                  // Получили сообщение от нашего фрейма, а не от другой копии этого класса
                  if (data.act=='oapi_login_success' && event.source==api.auth_frame.contentWindow){
                     var auth_info=q2ajx((data.href || "").split('#')[1]);
                     if (vk_DEBUG) console.log('auth_info:',auth_info);
                     if (!auth_info['access_token']){
                        topMsg('<b>VkOpt:</b> API auth error',2,'#FFB4A3');
                        return;
                     }
                     api.access_token=auth_info['access_token'];
                     api.mid=auth_info['user_id'];
                     api.secret=auth_info['secret'];

                     vksetCookie('api'+api.API_ID+'_atoken', api.access_token);
                     vksetCookie('api'+api.API_ID+'_mid', api.mid);
                     vksetCookie('api'+api.API_ID+'_secret', api.secret);

                     api.auth_process=false;
                     api.allow_call = true;
                     if (api.auth_frame) {
                        window.removeEventListener("message", onmess,false);
                        api.auth_frame.parentNode.removeChild(api.auth_frame);
                        api.auth_frame=null;
                     }
                     if (callback) callback(api.mid,api.access_token);
                  }
            };
            window.addEventListener("message", onmess,false);
         });
      },
      check:function(){
         var dloc=document.location.href;
         if (/\?xfr_query=/.test(dloc) || !/access_token/.test(dloc)) return;
         if (/login_success\.html/.test(dloc) || /blank\.html/.test(dloc)){
               parent.window.postMessage({act:"oapi_login_success",href:dloc},"*");
         }
      },
      show_error:function(r){
         topMsg('<b>VkOpt:</b> [code:'+r.error.error_code+']<br>'+r.error.error_msg,2,'#FFB4A3');
         if (vk_DEBUG) console.log(r);
      },
      call:function(method, inputParams, callback, captcha){
         if (api.allow_call && (!api.captcha_visible || captcha)){
            api.allow_call=false;
            api.allow_t=setTimeout(function(){api.allow_call=true;},300);
         } else {
            setTimeout(function(){
               api.call(method, inputParams, callback, captcha);
            },300);
            return;
         }
         if (api._captchaBox && !api._captchaBox.isVisible()){
            api.captcha_visible=false
         }

         var rmid=remixmid();
         var apiReAuth=function(){
            if (api.auth_process) {
               setTimeout(function(){
                  api.call(method, inputParams, callback);
               },400);
               return;
            }
            if (!remixmid()) {
               //vkopt.log('API '+api.API_ID+' Error. user id not found');
               if (vk_DEBUG) console.log('API '+api.API_ID+' Error. user id not found');
               return;
            }
            api.auth(function(){
               api.call(method, inputParams, callback);
            });
         };
         api.access_token=vkgetCookie('api'+api.API_ID+'_atoken');
         api.mid=vkgetCookie('api'+api.API_ID+'_mid');
         api.secret=vkgetCookie('api'+api.API_ID+'_secret');
         api.protocol=vkgetCookie('api'+api.API_ID+'_prot') || location.protocol;
         if (!api.access_token || !api.mid || (rmid && api.mid!=rmid)){
            if (vk_DEBUG) console.log('Wait auth data');
            apiReAuth();
            return;
         }

         var params = {
            v: '3.0',
            format:'json'
         };// "v": "4.6"
         if (inputParams) for (var i in inputParams) params[i] = inputParams[i];
         params['access_token']=api.access_token;

         var onDoneRequest = function(text){
            if (text=='') text='{}';
            var response = {error:{error_code:666,error_msg:'VK API EpicFail'}};
            try{
               response = eval("("+text+")");
            } catch (e) { }

            if (api._captchaBox && api._captchaBox.isVisible() && inputParams['captcha_sid']){
               api._captchaBox.hide();
            }

            var captcha_canceled = true;
            var onCaptchaHide = function(){
               api._captchaBox = false;
               api.captcha_visible = false;
               if (captcha_canceled){
                  if (callback.ok){
                        callback.ok(response,response.response,response.error);
                  } else
                     callback(response,response.response,response.error);
               }
            }

            if (response.error){
               if (response.error.error_code == 6){
                  setTimeout(function(){
                     api.call(method, inputParams, callback);
                  },500);
               } else if ( response.error.error_code == 4 || (response.error.error_code == 3 || response.error.error_code == 7 || response.error.error_code == 5) ){
                  if (vk_DEBUG) console.log('reauth reason: error_code', response.error.error_code, response);
                  apiReAuth();
               } else if(response.error.error_code == 14) { // Captcha needed
                  api.captcha_visible=true;
                  vkopt.log('API Captcha');
                  api._captchaBox = showCaptchaBox(response.error.captcha_sid, 0, api._captchaBox, {
                     imgSrc: response.error.captcha_img,
                     onSubmit: function(sid, key) {
                        inputParams['captcha_sid'] = sid;
                        inputParams['captcha_key'] = key;
                        vkopt.log('API Submit captcha. sid: ', sid, ' key:', key);
                        captcha_canceled = false;
                        api.call(method, inputParams, callback, true);
                     },
                     onHide: onCaptchaHide
                  });
               } else if(response.error.error_code == 17) { // validation request
                  vkopt.log('api validation request.')
                  // skip validation box and show captcha
                  var vdata = q2ajx(response.error.redirect_uri.split('?')[1]);
                  var options = {
                     "act": "validate_box",
                     "al":1,
                     "captcha":1,
                     "hash": vdata.hash,
                     "ahash": vdata.api_hash,
                     "skip_push": "",
                     "from":""
                  };
                  ajax.post("/activation.php", options, {onDone: function(title, html, js){
                        csid =(js.match(/validationCsid:\s*['"]?([a-f0-9]+)['"]?/) || [])[1];
                        cstrong = (js.match(/strongCode:\s*['"]?([a-f0-9]+)['"]?/) || [0,0])[1];
                        vkopt.log('API Activation captcha sid: ', csid, ' strong:', cstrong);
                        api.captcha_visible=true;
                        api._captchaBox = showCaptchaBox(csid, cstrong, api._captchaBox, {
                           onSubmit: function(sid, key) {
                              inputParams['captcha_sid'] = sid;
                              inputParams['captcha_key'] = key;
                              vkopt.log('API Submit activation captcha. sid: ', sid, ' key:', key);
                              captcha_canceled = false;
                              api.call(method, inputParams, callback, true);
                           },
                           onHide: onCaptchaHide
                        });
                  }})
               } else {
                  if (!callback || !callback.error) api.show_error(response);
                  /*
                  if (captcha) {
                     api._captchaBox.setOptions({onHide: function(){api.captcha_visible=false}}).hide();
                     api._captchaBox = false;
                     //api._captchaBox.hide();
                  }
                  */
                  if (callback.error){
                     callback.error(response,response.error);
                  } else
                     callback(response,response.response,response.error);
               }
            } else {
               /*
               if (captcha){
                  api._captchaBox.setOptions({onHide: function(){api.captcha_visible=false}}).hide(); //api._captchaBox.hide();
                  api._captchaBox = false;
               }
               */
               if (callback.ok){
                     callback.ok(response,response.response,response.error);
               } else
                  callback(response,response.response,response.error);
            }
         };

         if (vk_ext_api.ready && ((location.protocol == 'http:') || (location.hostname != 'vk.com')) && (api.protocol == 'https:')){ //на new.vk.com не можем стучать на роут /api.php
            vk_aj.post('https://api.vk.com/method/'+method, params, onDoneRequest);
         } else {
            if (api.protocol != 'https:'){
               // с sid'ом проблемы с генерацией подписи для запросов с произвольным текстом - он перстаёт быть валидным
               // часть костылей вида replace(/%20/g,'+') можно увидеть ниже, но надо адекватное решение.
               var sig = [];
               for (i in params) sig.push(i+'='+encodeURIComponent(params[i]+"").replace(/%20/g,'+')
                                                                                .replace(/\(/g,'%28')
                                                                                .replace(/\)/g,'%29')
                                                                                /*.replace(/%3A/g,':')
                                                                                .replace(/%7B/g,'{')
                                                                                .replace(/%7D/g,'}')
                                                                                .replace(/%22/g,'"')
                                                                                .replace(/%2C/g,',')*/);
               sig=('/method/?'+sig.join('&')+api.secret);
               //console.log(sig);
               params['sig']=vkMD5(sig);
            }
            params['method'] = method;
            params['oauth'] = 1;
            AjPost('/api.php', params, function(text){ // https://new.vk.com/api.php редиректит на https://vk.com/api.php => тут фейл кроссдоменности
               onDoneRequest(text);
            })
         }

      }
   };
   return api;
}

//vk_api_permissions.to_str(1522942)
//vk_api_permissions.to_int('wall,groups,messages,stats,offline')
var vk_api_permissions = {
   types: {
      "notify"        : 1,
      "friends"       : 2,
      "photos"        : 4,
      "audio"         : 8,
      "video"         : 16,
      "docs"          : 131072,
      "notes"         : 2048,
      "pages"         : 128,
      "status"        : 1024,
      "offers"        : 32,
      "questions"     : 64,
      "wall"          : 8192,
      "groups"        : 262144,
      "messages"      : 4096,
      "email"         : 4194304,
      "notifications" : 524288,
      "stats"         : 1048576,
      "ads"           : 32768,
      "offline"       : 65536
   },
   // Преобразует числовые права доступа приложения в строку, где права разделённы запятой
   to_str: function(int_scope){
      var str_scope = [];
      var types = vk_api_permissions.types;
      for (var key in types){
         if (int_scope & types[key])
            str_scope.push(key);
      }
      return str_scope.join(',');
   },
   // Преобразует числовые права доступа приложения в число
   to_int: function(_str_scope){
      var str_scope = _str_scope.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
      var int_scope = 0;
      var types = vk_api_permissions.types;
      for (var i = 0; i < str_scope.length; i++){
         if (types[str_scope[i]])
            int_scope += types[str_scope[i]];
      }
      return int_scope;
   }
};


function vkApiCall(method,params,callback){ // Функция позволяет юзать методы без авторизации. TODO: добавить получение инфы через эту функцию для всплывающего профиля, если тебя этот чел в свой ЧС занёс.
   params = params || {};
   params['oauth'] = 1;
   params['method'] = method;
   AjPost('api.php',params,function(t){
      var res = eval('('+t+')');
      if (callback) callback(res);
   });
}

vkApis={
    /* получение всех фотографий из альбома aid владельца oid через API.
     * callback: function( [{pid, src}, ...] )
     * progress: function(cur, total)
     */
    photos: function (oid, aid, callback, progress) {
        var result = [];
        var total = 0;      // Общее количество фотографий
        var PER_REQ = 1000; // Ограничение Вконтакта (см. https://vk.com/dev/photos.get)
        var run = function (i) {
            if (isFunction(progress)) progress(i * PER_REQ, total);
            var params = {owner_id: oid,
                          album_id: aid,
                          offset: i * PER_REQ,
                          count: PER_REQ,
                          v: '4.1'};
            dApi.call('photos.get', params, function (r) {
                total = r.response[0];
                for (var j = 1; j < r.response.length; j++)
                    result.push({pid: r.response[j].pid,
                          src: r.response[j].src_xxxbig
                            || r.response[j].src_xxbig
                            || r.response[j].src_xbig
                            || r.response[j].src_big
                            || r.response[j].src
                            || r.response[j].src_small});
                if (++i * PER_REQ < total)  //Условие продолжения рекурсии - количество обработанных записей меньше общего количества
                    run(i);
                else
                    callback(result);
            });
        };
        run(0);
    },
	photos_hd:function(oid,aid,callback,progress){
		var listId=(aid=='tag' || aid=='photos') ?  aid+oid : "album"+oid+"_"+aid;
      if (aid==null) listId=oid;
		var PER_REQ=10;
		var cur=0;
		var count=0;
      var from=0;
      var to=0;
		var photos=[];
		var temp={};
      if (!isFunction(callback)){
         var params=callback;
         callback=params.callback;
         progress=params.progress;
         from=params.from;
         to=params.to;
         if (from) cur=from;
      }

		var get=function(){
			if (progress) progress(cur,count);
			ajax.post('al_photos.php', {act: 'show', list: listId, offset: cur}, {
            onDone: function(listId, ph_count, offset, data) {
               if (!count) count=ph_count;
               for(var i=0; i<data.length;i++){
                  if (temp[data[i].id]) continue;
                  temp[data[i].id]=true;
                  var p=data[i];
                  var max_src= p.w_src || p.z_src || p.y_src || p.x_src;
                  //p.max_src=max_src;
                  photos.push(max_src);//p
                  data[i]=null;
                  p=null;
               }
               if (!to) to=count;
               if (cur<Math.min(to,count)){
                  cur+=PER_REQ;
                  setTimeout(nxt,50); // активируем костыль
                  //setTimeout(get,50);
               } else callback(photos);
            },
            onFail: function(){
               //alert('Request failed..\n'+arguments);
               if (vk_DEBUG) console.log(arguments);
               setTimeout(function(){next=true;},5000); // активируем костыль
            }
         });
		};
      var next=true;
      var nxt=function(){next=true;};
      setInterval(function(){ // знаю... этот ужасный костыль для избежания наращивания стека вызовов...
         if (!next) return;
         next=false;
         get();
      },100);
	},

    /* получение всех фотографий владельца oid с группировкой по альбомам.
     * callback: function( [{title, list: [{pid, src}, ...]}, ...] )
     * progress: function(cur, total) для альбомов и фоток внутри них
     */
    albums: function (oid, callback, progress_albums, progress_photos) {
        var result = [];
        var data;   // здесь будет инфа об альбомах, полученная из API
        var run = function (i) {
            if (isFunction(progress_albums)) progress_albums(i, data.length);
            if (i == data.length)   // условие окончания рекурсии
                callback(result);
            else if (data[i].size > 0) {
                switch (data[i].aid) {  // замена отрицательных айдишников системных альбомов на пригодные к скачиванию.
                    case -6:    data[i].aid = 'profile'; break;
                    case -7:    data[i].aid = 'wall'; break;
                    case -15:   data[i].aid = 'saved'; break;
                }
                vkApis.photos(oid, data[i].aid, function (_list) {
                    result.push({title: data[i].title, list: _list});
                    run(++i);   // продолжение рекурсии. рекурсия здесь используется для превращения асинхронного цикла в синхронный.
                }, progress_photos);
            } else run(++i);
        };

        dApi.call('photos.getAlbums', {oid: oid, need_system: 1}, function (r) {
            data = r.response;
            if (data) run(0);   // запуск рекурсии с первого альбома.
            else callback(result);
        });
    },
   faves:function(callback){
      AjGet('/fave?section=users&al=1',function(t){
         var r=t.match(/"faveUsers"\s*:\s*(\[[^\]]+\])/);
         if (r){
            r=eval('('+r[1]+')');
            var onlines=[];
            for(var i=0;i<r.length;i++) if(r[i].online) onlines.push(r[i]);
            callback(r,onlines);
         } else callback(null,null);
      });
   }
};

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


var vkCyr = {
   enc_map:{0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37, 38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85, 86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99, 100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110, 111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121, 122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 1027: 129, 8225: 135, 1046: 198, 8222: 132, 1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201, 1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192, 1051: 203, 164: 164, 166: 166, 167: 167, 169: 169, 171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176, 177: 177, 1114: 156, 181: 181, 182: 182, 183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209, 1058: 210, 8364: 136, 1112: 188, 1115: 158, 1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215, 1116: 157, 1064: 216, 1065: 217, 1031: 175, 1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163, 8226: 149, 1071: 223, 1072: 224, 8482: 153, 1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133, 1075: 227, 1033: 138, 1076: 228, 1077: 229, 8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232, 1034: 140, 1025: 168, 1081: 233, 1082: 234, 8212: 151, 1083: 235, 1169: 180, 1084: 236, 1052: 204, 1085: 237, 1035: 142, 1086: 238, 1087: 239, 1088: 240, 1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244, 8224: 134, 1093: 245, 8470: 185, 1094: 246, 1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250, 1044: 196, 1099: 251, 1111: 191, 1055: 207, 1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254, 8216: 145, 1103: 255, 1043: 195, 1105: 184, 1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146, 1108: 186, 1109: 190},
   dec_map:{0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37, 38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85, 86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99, 100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110, 111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121, 122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 128: 1026, 129: 1027, 130: 8218, 131: 1107, 132: 8222, 133: 8230, 134: 8224, 135: 8225, 136: 8364, 137: 8240, 138: 1033, 139: 8249, 140: 1034, 141: 1036, 142: 1035, 143: 1039, 144: 1106, 145: 8216, 146: 8217, 147: 8220, 148: 8221, 149: 8226, 150: 8211, 151: 8212, 153: 8482, 154: 1113, 155: 8250, 156: 1114, 157: 1116, 158: 1115, 159: 1119, 160: 160, 161: 1038, 162: 1118, 163: 1032, 164: 164, 165: 1168, 166: 166, 167: 167, 168: 1025, 169: 169, 170: 1028, 171: 171, 172: 172, 173: 173, 174: 174, 175: 1031, 176: 176, 177: 177, 178: 1030, 179: 1110, 180: 1169, 181: 181, 182: 182, 183: 183, 184: 1105, 185: 8470, 186: 1108, 187: 187, 188: 1112, 189: 1029, 190: 1109, 191: 1111, 192: 1040, 193: 1041, 194: 1042, 195: 1043, 196: 1044, 197: 1045, 198: 1046, 199: 1047, 200: 1048, 201: 1049, 202: 1050, 203: 1051, 204: 1052, 205: 1053, 206: 1054, 207: 1055, 208: 1056, 209: 1057, 210: 1058, 211: 1059, 212: 1060, 213: 1061, 214: 1062, 215: 1063, 216: 1064, 217: 1065, 218: 1066, 219: 1067, 220: 1068, 221: 1069, 222: 1070, 223: 1071, 224: 1072, 225: 1073, 226: 1074, 227: 1075, 228: 1076, 229: 1077, 230: 1078, 231: 1079, 232: 1080, 233: 1081, 234: 1082, 235: 1083, 236: 1084, 237: 1085, 238: 1086, 239: 1087, 240: 1088, 241: 1089, 242: 1090, 243: 1091, 244: 1092, 245: 1093, 246: 1094, 247: 1095, 248: 1096, 249: 1097, 250: 1098, 251: 1099, 252: 1100, 253: 1101, 254: 1102, 255: 1103},
   coder: function(s, map){
     var L = [];
     for (var i=0; i<s.length; i++) {
         var ord = s.charCodeAt(i);
         if (!(ord in map))
             throw "Character "+s.charAt(i)+" isn't supported by win1251!";
         L.push(String.fromCharCode(map[ord]))
     }
     return L.join('')
   },
   toWin: function(s){
      return vkCyr.coder(s, vkCyr.enc_map);
   },
   toUnicode: function(s){
      return vkCyr.coder(s, vkCyr.dec_map);
   },
   escape: function(s){
      return escape(vkCyr.toWin(s));
   },
   unescape: function(s){
      return (vkCyr.toUnicode(unescape(s)));
   }
};

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
    var res = '', i = 0, c = 0, c2 = 0;
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
          else res += '_';
        } else res += '_';
        i += 2;
      } else {
        res += '_';
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
//
var vk_ext_msg = {
   handler: null,
   init:function(callback){
      vk_ext_msg.handler = callback;
      if (typeof CustomEvent != 'undefined'){
         window.addEventListener('vkopt_messaging_response', function(e) {
            vk_ext_msg.handler(JSON.parse(e.detail).data);
         });
      } else {
         /* для этого случая vk_ext_msg.handler вызывается в  vk_ext_msg.post_message
         document.addEventListener('vkopt_messaging_response', function(e) {
            vk_ext_msg.handler(e.detail.data);
         });
         */
      }
   },
   post_message: function(data){
      var data_obj = {data:data};
      if (typeof CustomEvent != 'undefined'){
         var request = new CustomEvent("vkopt_messaging_request",{detail:data_obj});
         window.dispatchEvent(request);
      } else {
         var request = document.createTextNode(JSON.stringify(data_obj));
         request.addEventListener("vkopt_messaging_response", function (event) {
            request.parentNode.removeChild(request);
            if (vk_ext_msg.handler) {
               var response = JSON.parse(request.nodeValue);
               vk_ext_msg.handler(response);
            }
         }, false);
         document.head.appendChild(request);
         var event = document.createEvent("HTMLEvents");
         event.initEvent("vkopt_messaging_request", true, false);
         request.dispatchEvent(event);
         }
   }
};
var vk_ext_api={
   mark:'vkopt_loader',
   browsers: window._vkopt_loader_browser || {},
   callbacks:{},
   cid:1,
   ready: !!window._ext_ldr_vkopt_loader,
   init:function(){
      if (!vk_ext_api.inited){
         //window.addEventListener("message", vk_ext_api.on_message,false); // не нравится некоторым браузерам такой способ общения с контент-скриптом (якобы устаревший)
         //последняя версия сафари доступная на винде не поддерживает CustomEvent, т.ч нужны и костыли и по старинке
         vk_ext_msg.init(vk_ext_api.on_message);
         vk_ext_api.inited = true;
      }
      vk_ext_api.req()
   },
   on_message:function(e){
		var res= e || {};//e.data || {};
      var data=res.response;
      var sub=res.sub || {};
      if (sub.cid && sub.mark==vk_ext_api.mark){
         vk_ext_api.callbacks['cb_'+sub.cid](data);
      }
   },

   req:function(data,callback){
      /*
      {
         act: get post head ajax
         mark: vk_ext_api.mark
         url:
         params:
         options: only for ajax
      }*/
      var cid=vk_ext_api.cid++;
      data = data || {};
      data.mark = vk_ext_api.mark;
      data._sub = {cid:cid,mark:vk_ext_api.mark};
      if (callback)
         vk_ext_api.callbacks['cb_'+cid]=function(response){
            callback(response);
            delete vk_ext_api.callbacks['cb_'+cid];
         };
      vk_ext_msg.post_message(data);
      //window.postMessage(data,"*");
   },
   /*
   // Пишем:
   vk_ext_api.storage.set('test_val','qwerty',function(){
      console.log('ok');
      //Читаем:
      vk_ext_api.storage.get('test_val',function(value){
         console.log(value)
      })
   });


   vk_ext_api.storage.sets({'test_val':'qwe2','test4':'qwe4'},function(){
      console.log('ok');
      vk_ext_api.storage.gets(['test_val','test4'],function(values){
         console.log(values)
      })
   });

   */
   storage:{
      get: function(key, callback){
         vk_ext_api.req({act:'storage_get',key:key},function(r){
            callback(r.value);
         });
      },
      set:function(key, val, callback){
         vk_ext_api.req({act:'storage_set',key:key, value:val},function(r){
            callback();
         });
      },
      // Чтение и установка значений сразу нескольких полей
      gets: function(keys, callback){ // keys - Array[key_name1, ...]
         vk_ext_api.req({act:'storage_get',keys:keys},function(r){
            callback(r.values);
         });
      },
      sets:function(values, callback){ // values - Object{key1:value1, ...}
         vk_ext_api.req({act:'storage_set', values:values},function(r){
            callback();
         });
      }
   },
   ajax:{
      parse_headers:function(raw_headers){
         var raw=(raw_headers || '').split(/\r?\n/);
         var headers={};
         for (var i=0; i<raw.length; i++){
            var s=raw[i].split(':');
            var n=s.shift().replace(/^\s+|\s+$/g, '');
            var c=s.join(':').replace(/^\s+|\s+$/g, '');
            if (n && c)
               headers[n]=c;
         }
         return headers;
      },
      get:function(url,callback){
         vk_ext_api.req({act:'get',url:url},function(r){
            callback(r.response);
         });
      },
      post:function(url,params,callback){
         vk_ext_api.req({act:'post',url:url,params:params},function(r){
            callback(r.response);
         });
      },
      head:function(url,callback){
         vk_ext_api.req({act:'head',url:url},function(r){
            headers = vk_ext_api.ajax.parse_headers(r.response);
            callback(headers);
         });
      },
      ajax:function(options,callback){
         vk_ext_api.req({act:'ajax',options:options},function(r){
            callback(r.response);
         });
      }
   }
};
vk_ext_api.init();
vk_ext_api.req({act:'check_ext'},function(){vk_ext_api.ready=true;});
vk_aj=vk_ext_api.ajax;
/*

*/

var XFR={
	reqs:0,
	callbacks:[],
   vk_ext_api_exclude:/oauth\.vk\.com\/authorize/,
	post:function(url,data,callback,only_head){
		var prot = 'http://';//(location.protocol?location.protocol+'//':'http://');

      if (/^https:\/\//.test(url) || (location.protocol == 'https://'))
         prot = 'https://';

      var domain= prot+url.split('/')[2];

      if (domain.indexOf('youtube.com')!=-1) domain+='/embed/';
      if (domain.indexOf('player.vimeo.com')!=-1) domain+='/video/';

      if (vk_ext_api.ready && url && !XFR.vk_ext_api_exclude.test(url)){
         if (only_head){
            if (LOAD_HEADERS_BY_HEAD_REQ){
               vk_aj.head(url,function(h){
                  var l=0;
                  for (var key in h){
                     if (key.toLowerCase()=='content-length'){
                        l=parseInt(h[key]);
                     }
                  }
                  callback(h,l);
               });
            }  else {
               vk_aj.ajax({url:url, method: 'GET', headers:{'Range':'bytes=0-1'}},function(r){
                  var l = 0;
                  var l2 = 0;
                  var h = vk_ext_api.ajax.parse_headers(r.headers);
                  for (var key in h){
                     if (key.toLowerCase()=='content-length'){
                        l=parseInt(h[key]);
                     }
                     if (key.toLowerCase()=='content-range'){
                        l2=parseInt((h[key].match(/\/(\d+)/)||['',0])[1]);
                     }
                  }
                  l = Math.max(l,l2);
                  callback(h,l);
               })
            }
         } else {
            vk_aj.post(url,data,function(t){
               callback(t);
            });
         }
         return;
      }
		data=data || {};
		var req_id=this.reqs++;
		var frame_url=domain+'?xfr_query='+encodeURIComponent(JSON.Str([url,data,req_id,only_head?1:0]));
		var fr=vkCe('iframe', {src: frame_url, id:"xfr_frame"+req_id, style:"visibility:hidden; position:absolute; display:none;" });
		document.body.appendChild(fr);
		if (this.callbacks.length==0) window.addEventListener("message", this.onMessage,false);
		this.callbacks[req_id]=function(){
			re(fr);
			callback.apply(this, arguments);
		};
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

         q=JSON.parse(decodeURIComponent(q));
			var url=q[0];
			var data=q[1];
			var req_id=q[2];
			var method=q[3]==1?'HEAD':'POST';
			XFR.ajax(method,url,data,function(r,t){
				if (method=='HEAD'){
					var all=r.getAllResponseHeaders();
					var len=r.getResponseHeader('Content-Length');
					var data=['xfr',req_id,all,len];
				} else {
					var data=['xfr',req_id,t];
					//callback(t);
				}
				parent.window.postMessage(JSON.Str(data),"*");
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
      var url = options.url || '';
      var domain = 'http://' + url.split('/')[2];
      if (domain.indexOf('youtube.com') != -1) domain += '/embed/';

      var req_id = this.reqs++;
      var frame_url = domain + '?xfr__query=' + encodeURIComponent(JSON.Str([req_id, url]));
      var fr = vkCe('iframe', {
         src: frame_url,
         id: "xfr_frame" + req_id,
         style: "visibility:hidden; position:absolute; display:none;"
      });
      document.body.appendChild(fr);
      if (this.callbacks.length == 0) window.addEventListener("message", this.onMessage, false);
      this.callbacks[req_id] = function() {
            re(fr);
            callback.apply(this, arguments);
         };
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
         q = JSON.parse(decodeURIComponent(q));
         var req_id = q[0];
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
                     };
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
                     };

                     xhr.send(data);

                  } catch (e) {
                     if (vk_DEBUG) console.log('XHR ERROR', e);
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
	var x=[]; x[c]=''; x='.'+x.join('0');
	var filesizename = [" Bytes", " KB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"];
	return size ? (size/Math.pow(1024, (i = Math.floor(Math.log(size)/Math.log(1024))))).toFixed(c).replace(x,'')+filesizename[i] : '0 Bytes';
}



// DATA SAVER
var VKFDS_SWF_LINK='http://cs6147.vk.me/u13391307/c0b944fc2c34a1.zip';
var VKFDS_SWF_HTTPS_LINK='https://pp.vk.me/c6147/u13391307/c0b944fc2c34a1.zip';

var VKTextToSave="QweQwe Test File"; var VKFNameToSave="vkontakte.txt";

function vkOnSaveDebug(t,n){/*alert(n+"\n"+t)*/}
function vkOnResizeSaveBtn(w,h){        // Вызывается из флешки как и vkOnSaveDebug
			ge("vkdatasaver").setAttribute("height",h);
			ge("vkdatasaver").setAttribute("width",w+2);
			hide("vkdsldr"); show("vksavetext");
			return {text:VKTextToSave,name:VKFNameToSave};
}
function vkSaveText(text,fname){
    if (getSet(103)=='y') { // Сохранение файла используя HTML5 функцию saveAs
        vkLdr.show();
        FileSaverConnect(function() {
            var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
            vkLdr.hide();
            saveAs(blob, fname);
        });
    } else {
        VKTextToSave = text;
        VKFNameToSave = fname;
        var html = '<div><span id="vkdsldr"><div class="box_loader"></div></span>' +
            '<span id="vksavetext" style="display:none">' + IDL("ClickForSave") + '</span>' +
            '<div id="dscontainer" style="display:inline-block;position:relative;top:8px;"></div>' +
            '</div>';
        DataSaveBox = new MessageBox({title: IDL('SaveToFile')});
        var Box = DataSaveBox;
        vkOnSavedFile = function () {
            Box.hide(200);
        };
        Box.removeButtons();
        Box.addButton(IDL('Cancel'), Box.hide, 'no');
        Box.content(html).show();
        var swf = location.protocol == 'https:' ? VKFDS_SWF_HTTPS_LINK : VKFDS_SWF_LINK;
        var params = {
            width: 100,
            height: 29,
            allowscriptaccess: 'always',
            "wmode": "transparent",
            "preventhide": "1",
            "scale": "noScale"
        };
        var vars = {};//'idl_browse':IDL('Browse'),'mask_name':mask[0],'mask_ext':mask[1]
        renderFlash('dscontainer',
            {url: swf, id: "vkdatasaver"},
            params, vars
        );
    }
}
// Подключение библиотеки FileSaver.js и последующее выполнение функции callback
function FileSaverConnect(callback) {
    var FileSaverOnload = function () {
        try {
            var blobSupported = !!URL.createObjectURL;  // Проверка поддержки Blob для подключения Blob.js в старых браузерах (Opera < 15 и Firefox < 20)
        } catch (e) {}
        if (!blobSupported)
            AjCrossAttachJS('http://vkopt.net/blob', 'BlobJs', FileSaverOnload);
        else
            callback();
    };
    if (typeof saveAs != "undefined")   // Проверка поддержки saveAs
        FileSaverOnload();
    else                                // если она не реализована браузером, подключаем библиотеку
        AjCrossAttachJS('http://vkopt.net/FileSaver', 'FileSaver', FileSaverOnload);
}

// Подключение библиотеки JsZip и последующее выполнение функции callback
function JsZipConnect(callback) {
    FileSaverConnect(function () {
        if (typeof JSZip != "undefined")
            callback();
        else
            AjCrossAttachJS('http://vkopt.net/jszip', 'JsZip', callback);
    });
}
//END DATA SAVER

// DATA LOADER
var VKFDL_SWF_LINK='http://cs6147.vk.me/u13391307/8f4dac1239fc88.zip';
var VKFDL_SWF_HTTPS_LINK='https://pp.vk.me/c6147/u13391307/8f4dac1239fc88.zip';

function vkLoadTxt(callback,mask){
	DataLoadBox = new MessageBox({title: IDL('LoadFromFile')});
	var Box = DataLoadBox;

	vkOnDataLoaded=function(text){
		//alert(text);
      Box.hide();
		setTimeout(function(){callback(text);},10);
	};
	vkOnInitDataLoader=function(w,h){
	  ge("vkdataloader").style.width=w+2;
			ge("vkdataloader").style.height=h;
			hide("vkdlldr"); show("vkloadtext");
	};
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

function vkDisableAjax(){
  if (window.nav && nav.go) Inj.Before('nav.go',"var _a = window.audioPlayer","{ location.href='/'+strLoc; return true;};");
}


function vkWnd(text,title){
	var url='about:blank';
	var as_data=true;
	text='<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"><html><head><title>'+(title || 'VkOpt')+'</title></head><body>'+text+'</body></html>';
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
	};
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
		vkLdr.box.setOptions({title: false, hideButtons: true}).show();
		hide(vkLdr.box.bodyNode);
		show(boxLoader);
      hide(boxLayerBG);
      removeClass(bodyNode, 'layers_shown');
		boxRefreshCoords(boxLoader);
	},
	hide:function(){
		vkLdr.box.hide();
		hide(boxLoader);
	}
};

function vkAlertBox(title, text, callback, confirm, minimizable) {// [callback] - "Yes" or "Close" button / onShow() for "minimizable"; [confirm] - "No" button
  if (minimizable && vkopt.settings.get('minimizable_boxes')) {    // вывод контента в видеоплеере, который можно сворачивать
      var vp = vkCe('div', {'id': 'video_player', 'class': 'popup_box_container box_dark', 'style': 'overflow:auto'});
      var box_body = (typeof text == 'string' ? vkCe('div', {'class': 'box_body'}, text) : text);
      vp.appendChild(box_body);
      stManager.add(['videoview.js', 'videoview.css', 'page.js', 'page.css'], function () {
          var _a = window.audioPlayer;  // Для предотвращения остановки аудио при открытии видеоплеера
          window.audioPlayer = null;
          videoview.show(false, '0_', '', {noHistory: 1, prevLoc: nav.objLoc});
          window.audioPlayer = _a;      // восстановление аудиоплеера
          mvcur.mvContent.appendChild(vp);
          hide(mvcur.mvLoader, mvcur.mvControls); // скрыть картинку с анимацией загрузки и блок для комментариев
          if (title) {  // заголовок будет отображаться только в свернутом окне.
              mvcur.mvData.published = 1;
              mvcur.mvData.title = title;
          }
          if (isFunction(callback)) callback();
      });
      return {
          setOptions: function (items) {    // для совместимости с MessageBox
              for (var i in items)
                  if (box_body.style.setProperty) {
                      box_body.style.setProperty(i, items[i], '');
                  } else box_body.style[i] = items[i];
          },
          content: function(html) {
              box_body.innerHTML = html;
          }
      };
  } else {
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
        a = ':'+(d || '')+':' + a
    }
    el.addEventListener("dragstart", function(e) {
        e.dataTransfer.setData("DownloadURL", a);
    },false);
}
function vkDownloadFile(el,ignore) {
   if (!vkbrowser.mozilla || vk_ext_api.browsers.webext || ignore) return true;
   //if (getSet(1) == 'n') return true;
   var a = el.getAttribute("href");
   var d = el.getAttribute("download");
   var url=a;
   var name='';
   if (a.indexOf("&/") != -1 || (d && d!='')) {
      a = a.split("&/");
      url=a[0];
      name=d || decodeURI(a[1]);
   } else
   if (a.indexOf("#FILENAME/") != -1 || (d && d!='')) {
      a = a.split("#FILENAME/");
      url=a[0];
      name=d || decodeURI(a[1]);
   }

   if (!name) return true;//name = url.split('/').pop();
   if (vk_ext_api.ready)
      vk_ext_api.req({act:'download',url:url,name:name},function(r){});
   else
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
   var vk_nf_id=unixtime()+vkRand();//window.vk_nf_id || 0;
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
      Notifier.pushEvents([notify.join('<!>')],false,params.sound);
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
      var events=[msg.join('<!>')];

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
         Notifier.pushEvents(events,false,obj.sound);
      }
      //console.log(response);
      //*/
      //Notifier.lpChecked({ts:vkNow(),key:curNotifier.key,events:events,sound:obj.sound});
   });
}//*/

//vkShowNotify({sound:'On',title:'TestTitle',text:'QazQwe',author_photo:'http://cs10781.vk.com/u17115308/e_ceb5c84f.jpg',author_link:'mail',link:'audio',onclick:'nav.go(this)'}); //,
//setInterval(function(){vkShowNotify({sound:'On',title:'TestTitle',text:'QazQwe',author_photo:'http://cs10781.vk.com/u17115308/e_ceb5c84f.jpg',author_link:'mail',link:'audio',onclick:'nav.go(this)'});},500)


var vkOptDonate = {
    /* WebMoney Form */
    WMDonateForm: function WMDonateForm(Amount,purse_id,descr_text,submit_text){
        descr_text=descr_text || IDL('Donate_text');
        submit_text=submit_text || IDL('Donate');
        var type=purse_id.match(/(\w)\d+/)[1].toLowerCase();
        var wm='WM'+type.toUpperCase();
        return '<div style="margin:0 auto; display: table;"><FORM action="wmk:payto" style="padding:0; margin:0px" method="get">\
        <table><tr><td><IMG src="'+vkOptDonate.wmkeeper_img+'"></td><td>\
        <b>'+purse_id+'</b><br><INPUT type=hidden value="'+purse_id+'" name=Purse>\
        <INPUT style="\
        width:40px; padding:2px 2px 2px 22px; border:1px solid #DDD; background:url(\''+vkOptDonate.wmicons_img[type]+'\') 2px 2px no-repeat; text-align:right;\
        " size=4 value="'+Amount+'" name=Amount> '+wm+' <BR>\
        <INPUT type=hidden value="'+descr_text+'" name=Desc>\
        <INPUT type=hidden value=Y name=BringToFront>\
        <INPUT type=submit value="'+submit_text+'">\
        </td></tr></table></FORM>\
        <div style="color:#AAA; font-size:7pt; text-align:center;">'+IDL('NeedWMKeeper')+'</div>\
        </div>';
    },
    /* Yandex Money */
    YMDonateForm: function YMDonateForm(Amount,purse_id,submit_text){
        //if(ge('purse_ad_link')) show('purse_ad_link');
        submit_text=submit_text || IDL('Donate');
        return '<div style="margin:0 auto; display: table;">\
        <form style="margin: 0; padding: 0;" action="https://money.yandex.ru/charity.xml" method="post">\
        <input type="hidden" name="to" value="'+purse_id+'"/>\
        <input type="hidden" name="CompanyName" value="vkOpt"/>\
        <input type="hidden" name="CompanyLink" value="http://vkopt.net/"/>\
        <table><tbody><tr><td>\
        <img src="data:image/gif;base64,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">\
        </td><td><b>'+purse_id+'</b>\
        <br><input type="text" id="CompanySum" name="CompanySum" value="'+Amount+'" size="4" style="width:30px; padding:2px 2px 2px 2px; border:1px solid #DDD; text-align:right;"/>\
        <input type="submit" value="'+submit_text+'" style="margin-right: 5px;"/>\
        </td></tr></tbody></table></form></div>';
    },
    // YM & WM purses list
    WMPursesList: function WMPursesList(result_el){
    	var purses=[['R'+'2551200'+'81922',30],['E'+'101435'+'675230',1],['Z'+'498828'+'961904',1],['*41001'+'96245'+'7205',30]/*,['*41001486412536',30]*/];
    	var html='<style  type="text/css">\
    	.purse_link{cursor:pointer; padding:2px 3px 3px 18px; text-decoration:none; display:block; border:1px solid transparent; width:222px;}\
    	.purse_link:hover,.purse_yad_link:hover{border:1px solid #DDD;text-decoration:none;}\
    	.purse_yad_link{margin-right: 5px; padding:2px 3px 3px 0px; display:block; border:1px solid transparent; width:240px;}\
    	.purse_yad_link_img{float:left; background-image: url("data:image/gif;base64,R0lGODlhDQAPAPcAABANC5LeNslOAAN3wmaZM/jzscaIUFXO8A1Gi63P6ZVDBn224P8AAMfSst+sebWdSFktXyDA6+Tp8m2CmK2urf87O3R0dKPQZkp4Ct+SWJmZmVSBw8d8M1mu17jT609ngOPi30hfdE1NTOD5/7m6uvSlGMTFxeDOXX6v/PV6H7W1tff4+UKN0oeGhjMzM7CIYqi6zPvbw/nTjY5vH2OX65nM/+tRGv58O+/gQv+IOdTU1IisVOd/JPD157iqoCxUuBSl5dKtkOWpPs+6Xf/MAP3V1szMzO2TQ0uGrpK85JXh9TddBLPp+Yttj2ChBVub1iFbjf+ZmT1pyf9mZnmPpON5Qoecsf+uXvBtGY+Pj2aEPNLHe7huMjep5unXyOFsEaTE7F6s/P/3iNeIN22m/aZeKcu9zaWjoWZmZvrbIP7dXby0ftvZ3efn5+Dt+LfRk8TL0i6Nx/abXofC/f/2+6yWr5ythj+Uy1B9wERxtiid3VuN4/C8fXCm3Jiuzf7BQ/ODLtbm9fy1MPSWSvlnK/3YbMbT69lkDK9zQZCkuEl41T1qr4u8RPnt6aRQC3HW8u+Hbe7u7uWITIzE+lKD2/8ZGWN5kMrX49vmy76yv9nLmf7lWl2q+H2cUlWi93WyH/6LR+O+mP/UTmu3/bbE0cGVacPm/efx2fr03LzL2WWEvqvC3OytcxeU0abL/vP5/lCIAPeOKvrAwM67d+u0fvpZINXK17bDouKiav/keeHm6vPQrcPolL1xJLPT/v/IDLy8vP6hQ6DR+e5/Mv7sRo+raEe579NHFOCWLC5boOPt9uZ1GYqHdZXB/fRuNiJPkDyh1v727vi/h2Wz/4e4/pHC+fzp2fvkyv3tW6i6jc7s/t/d3qvZ/fXnN9jh6nfGCzR+rf759venguzVW7yysvSTGPinYsXd9f+ZM/TBneRMEe+GJ02U1f///5Z2JXK//9bx//RiDtjFZfzx6iJpn9u5nyBLiqLY8Zy65z5/rvN9KvJzFPqucfz/8eBgCv///yH5BAEAAP8ALAAAAAANAA8AAAhrAP8JHPjPmrQVBAkaTJEiRkKB0gAxbJgwhsQUFx0KjCHnYgo5DDX+8wgI0IqQcuT8m8iwZEiJK1mytJgipkyG1hjalCnHGkyZgOTEWOGz5kRA0qzFkAZSJ0ZpHC96HMmSpE6lMbJq1WrtX0AAOw=="); background-position: 0px 0px;height: 15px;margin-right: 5px;width: 12px; display:block}\
    	.purse_ad_link_img{float:left;height: 15px;margin-right: 5px;width: 12px; display:block}\
       #wmdonate{border:1px solid #AAA; border-radius:5px;}\
    	</style><div class="purses_block">';
    	for (var i=0; i<purses.length; i++){
    		var type=purses[i][0].match(/(\w)(\d+)/)[1].toLowerCase();
    		var yad=purses[i][0].split('*')[1];
    		if (!yad)
    			html+='<a href=# class="purse_link" onclick="ge(\''+result_el+'\').innerHTML=vkOptDonate.WMDonateForm('+purses[i][1]+',\''+purses[i][0]+'\'); return false" style="background:url(\''+vkOptDonate.wmicons_img[type]+'\') 0px 0px no-repeat;">'+purses[i][0]+'<span style="float:right">WebMoney</span></a>';
    		else
    			html+='<a href=# class="purse_yad_link" onclick="ge(\''+result_el+'\').innerHTML=vkOptDonate.YMDonateForm('+purses[i][1]+',\''+yad+'\'); return false"><div class="purse_yad_link_img" ></div>'+yad+'<span style="float:right">\u042f\u043d\u0434\u0435\u043a\u0441.\u0414\u0435\u043d\u044c\u0433\u0438</span></a>';
    	}
       //html+='<a href=# class="purse_ad_link" id="purse_ad_link" style="display:none;" onclick="ge(\''+result_el+'\').innerHTML=vkOptDonate.AdDonateForm(); return false"><div class="purse_ad_link_img" ></div>\u0420\u0435\u043a\u043b\u0430\u043c\u0430</a>';
    	html+='</div>';
    	return html;
    },

    AdDonateForm: function AdDonateForm(){
       return vkopt_add_cfg;
   },
    wmkeeper_img: 'data:image/png;base64,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',
    wmicons_img: {
        r: 'data:image/gif;base64,R0lGODlhEAAQANUAAGmSr86/n7SVLri5rfd6B/yuXP///+7KMunp6ZS60YRySPTSrLTS5PziUHFrR6hsONjY1Nzm7KSYbG6jxpCEXFyWxDA6SLSqlNi0MPz6/PT6/Oz1/OhoDORsFPfaQXRjPKSilGRQHMzKzOx0DHRePOS6HJR8QMzf59xiFOS+JGSexLzKzLGFV76nRvT29LyKTPT2/KScgGyCkFRCFLSaROTi3MSaJOTu9PySJJR6ZKSmjEw+DL+ylNTSxKSORPzmXyH5BAAAAAAALAAAAAAQABAAAAa3QINwGDCZApmhktj6/XyQpTLQbDQwFITUwGtZPQeMiWLqJYVdD7hEW200iSxacDikBIONS7M5OQYZF3QpNgM3GhkbGwwqMgoIISU2OhGIfAwTEBYVfyESJxkaopgVFTIWADkfEhGhGaSlFQAsHRwzNTF9E7GyLCMdKCg7BjErCSqlswQjHB0PJCAGCBQMCQAvBMvO0CJRBhcDATjZI88g3QguQhkfCwUEDx/nEAhnQwMOCvLoMEpBADs=',
        e: 'data:image/gif;base64,R0lGODlhEAAQANUAAPHONanD1////zBoltS4OLCULFhOLIyKWGyTtOTm5Ed6plyYxHirqsi7mrfM4dfY1HSGaPzkWHa23FyVvJy3ybmulDA6SGSdxLfTfEt0lWyo1FSSvHiozPz6/JymtFSOtMzKzERynPz+TESCtHSu3JS61JR6PPziTL6nQPT29CRWhMzibPzmZMzGtMSuVKy2xJzCjFyKrIy2nOC8KHR+jNzg6ERmfKCSSOzyVOzs7pTC3OS6HPzeRFR2hISypISy1CH5BAAAAAAALAAAAAAQABAAAAa0QIFw2DCZWp2hkuhiRW6P5FLYQEUiJ8IhNxVUsQAAyjYYOKSCCooXJkBGJMlIwU0XwjOIIq5ZTAYUHRV3MwcKGhJ9EwsbChkJBjs3GReJOD4rGDUWGwMvBj2VGgwMMhekNBYLjggOOgsLGCsTGwswGIwbKjUIARywtX60fh8qAr0lFxMiw8wfAxkeAjkxDj+wywvPIR4gD0IUFL61z9HeOSlCHRkOJX/mDwloQg4hIfAJ6UNBADs=',
        z: 'data:image/gif;base64,R0lGODlhEAAQANUAAOlrDKyRL/HNNXmpymxWIP///+zs7PzlXJW71/d4BcTb6o+Xj9SvLE8+GaiWaJSGXKajlJd/R6zK39zt+dfY1JCOdMm7nKqPRLmtlHdpRNCmfNxkGPz6/GxmRPT6/Oz2/Mzm9MzKzORiFPT29FyWxMzi7PT2/PTCpMSuTNxaFOyaZMS+rPS+nH92Uby2pNzWxOTg3KScgPy6dLyylOyeXPyuXExOTGmhxNTi5LymQJR2PNTOxMzCrPzChPzhSuTm5CH5BAAAAAAALAAAAAAQABAAAAa6wIJwaInoeJyhkog6HC6UpdLSPPgYD4O0MMv5fAIBI+KI7JJCjDfMuGhUnlc2HWC7VRyPKPVYjSB1bTE0HnobJh8bLT8EDAELNyQKAACIMA0TLS4EFQMICAM3Hx8iLAs2LCkZDgoSnwMkACITEycnIAoNMBCtoCQIE7K4IiINBTE4EjcDCgkAJZMiCx0QBQYVCiUJCSDaANMQIVEFGD0yEyDb4OIGI0IcGQY1CesUP2hDKxkt1OzuQ0EAADs='
    }
};

function vk_tag_api(section,url,app_id){
   var t={
      section:section,
      page_url:url,
      app:app_id,
      widget_req:function(obj_id,like,callback){
         var app=t.app;
         var params={
            "app": app,
            "url": t.page_url+t.section+'/'+obj_id,
            "width": "100%",
            "page": "0",
            "type": "button",
            "verb": "0",
            "title": t.section,
            "description": t.section,
            "image": "",
            "text": "",
            "h": "22",
            "_ver": "1",
            "color": ""
         };

         var ret=0;
         var req=function(){
            AjPost(location.protocol+'//vk.com/widget_like.php',params,function(t){
               var _pageQuery=(t.match(/_pageQuery\s*=\s*'([a-f0-9]+)'/) || [])[1];
               var likeHash=(t.match(/likeHash\s*=\s*'([a-f0-9]+)'/) || [])[1];
               if (!_pageQuery || !likeHash){
                  if (ret<5 && /db_err/.test(t)){
                     ret++;
                     if (vk_DEBUG) console.log('widget_req error... retry '+ret+'... ');
                     setTimeout(function(){req();},3000);
                  } else
                     alert('Parse hash error');
                  return;
               }
               var like_params={
                  value:like?1:0,
                  act:'a_like',
                  s:0,
                  verb:0,
                  al:1,
                  hash:likeHash,
                  pageQuery:_pageQuery,
                  app:app
               };
               ajax.post('widget_like.php',like_params,{
                  onDone : function (stats) {
                     if (callback) callback(stats.num);
                  },
                  onFail : function (text) {}
               });
            });
         };
         req();
      },
      parse_id:function(obj_id){
         //console.log('>>>',obj_id);
         var like_obj=obj_id;
         if (/^([a-z_]+)(-?\d+)_(\d+)/.test(obj_id)){
            //console.log('<<<',like_obj);
            return like_obj;
         }
         var m = obj_id.match(/(-?\d+)(_?)(photo|video|note|topic|wall_reply|note_reply|photo_comment|video_comment|topic_comment|)(\d+)/);
         if (m){
            like_obj = (m[3] || 'wall') + m[1] + '_' + m[4];
         }
         //console.log('<<<',like_obj);
         return like_obj;
      },
      mark:function(obj_id,callback){
         var like_obj=t.parse_id(obj_id);
         t.widget_req(like_obj,true,function(){
            t.get_users(like_obj,0,6,callback);
         });

      },
      unmark:function(obj_id,callback){
         var like_obj=t.parse_id(obj_id);
         t.widget_req(like_obj,false,function(){
            t.get_users(like_obj,0,6,callback);
         });

      },
      get_users:function(obj_id,offset,count,callback){
         offset = offset || 0;
         count = count || 6;
         obj_id=t.parse_id(obj_id);
         var url=t.page_url+t.section+'/'+obj_id;
         var code='\
         var like=API.likes.getList({type:"sitepage",page_url:"'+url+'",owner_id:"'+t.app+'",count:'+count+',offset:'+offset+'});\
         var users=API.users.get({uids:like.users,fields:"photo_rec"});\
         return {count:like.count,users:users,uids:like.users};\
         ';
         //api_for_dislikes
         api4dislike.call('execute',{code:code},function(r){
            if (callback) callback(r.response);
         });
         //api4dislike.call('likes.getList',{type:'sitepage', page_url:url,owner_id:t.app},console.log)
      },
      get_tags:function(obj_ids,callback){
         var tmp=[];
         for (var i=0; i<obj_ids.length; i++){
            var like_obj=t.parse_id(obj_ids[i]);
            var url=t.page_url+t.section+'/'+like_obj;
            tmp.push('"'+obj_ids[i]+'": API.likes.getList({type:"sitepage",page_url:"'+url+'",owner_id:"'+t.app+'",count:1,offset:0}) ');
         }
         var code = 'return {'+tmp.join(',')+'};';
         var retry_count=0;
         var get=function(){
            //api_for_dislikes
            api4dislike.call('execute',{code:code},{
                  ok:function(r){
                     var raw = r.response;
                     var data = {};
                     for (var key in raw){
                        if (!raw[key]) continue;
                        data[key] = {
                           count: raw[key].count,
                           my: raw[key].users[0]==vk.id
                        };
                     }
                     if (callback) callback(data);
                  },
                  error:function(r,err){
                     if (vk_DEBUG) console.log('api marks error',obj_ids,err);
                     retry_count++;
                     if (retry_count<5){
                        setTimeout(function(){get();},2000);
                        if (vk_DEBUG) console.log('api marks error.. wait 2sec and retry.. code:'+err.error_code);
                     } else {
                        if (vk_DEBUG) console.log('api marks error',obj_ids,err)
                     }
                  }
            });
         };
         get();
      }
   };
   return t;
}

if (!window.winToUtf) winToUtf=function(text) {
  text=text.replace(/&#0+(\d+);/g,"&#$1;");
  var m, j, code;  m = text.match(/&#[0-9]{2}[0-9]*;/gi);
  for (j in m) {   var val = '' + m[j]; code = intval(val.substr(2, val.length - 3));
    if (code >= 32 && ('&#' + code + ';' == val)) text = text.replace(val, String.fromCharCode(code));
  }  text = text.replace(/&quot;/gi, '"').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
  return text;
};
if (!window.ge) ge=function(q) {return document.getElementById(q);};
if (!window.geByTag) geByTag=function(searchTag, node) {return (node || document).getElementsByTagName(searchTag);};
if (!window.geByTag1) geByTag1=function(searchTag, node) {return geByTag(searchTag, node)[0];};

var dloc=document.location.href.split('/')[2] || '';

DAPI_APP_ID=2168679;
DAPI_APP_SCOPE = "friends,photos,audio,video,docs,notes,pages,status,offers,questions,wall,groups,messages,stats,offline"; //vk_api_permissions.to_str(1522942)
DISLIKEAPI_APP_ID = 2347646;

api4dislike=vk_oauth_api(DISLIKEAPI_APP_ID,'photos,audio,video,wall,groups,messages,offline');
dApi=vk_oauth_api(DAPI_APP_ID, DAPI_APP_SCOPE);
setTimeout(api4dislike.check,10);
setTimeout(dApi.check,10);

//if(!(dloc.indexOf('vk.com')!=-1 || dloc.indexOf('vkontakte.ru')!=-1)) {
(function(){
   var xfr_delay=800;
   if (/vk\.com|vkontakte\.ru|userapi\.com|vk\.me/.test(dloc)) xfr_delay=0;
   setTimeout(XFR.check,xfr_delay);
})();


//}
/*if(!(dloc.indexOf('vk.com')!=-1 || dloc.indexOf('vkontakte.ru')!=-1)) {*/setTimeout(XFR2.check,800);//}

//////////////////////


//////////////////////
/////////////////////

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;
