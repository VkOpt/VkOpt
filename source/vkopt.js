// ==UserScript==
// @name          VKOpt 2.x
// @author        KiberInfinity( /id13391307 )
// @namespace     http://vkopt.net/
// @description   Vkontakte Optimizer 2.x
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//
/* VERSION INFO */
var vVersion	= 232;
var vBuild = 160417;
var vPostfix = ' ';
if (!window.vk_DEBUG) var vk_DEBUG=false;
/* EXT CONFIG */
if (!window.DefSetBits)

var DefSetBits='yyyynnyyynyyy0n0yy0nnnynyyynyy0nynynnnnyy0yyy1yynnnnny0nynynynnnnyynnynnnynynyynnyn3nnnnynynnnnnyynnnnnnnnynn-3-0-#c5d9e7-#34a235-1-';

var DefExUserMenuCfg='111111101111111111111'; // default user-menu items config
var vk_upd_menu_timeout=20000;      //(ms) Update left menu timeout
var vkMenuHideTimeout=400;          //(ms) Hide Menu Popups timeout
var CHECK_FAV_ONLINE_DELAY = 20000; //(ms)  delay for check online statuses of faved users
var FAVE_ONLINE_BLOCK_SHOW_COUNT=6;
var SHOW_POPUP_PROFILE_DELAY=800;//ms 

/* Save messages history config */
var SAVE_MSG_HISTORY_PATTERN="%username% (%date%):\r\n%message%\r\n%attachments%\r\n\r\n"; //Save Messages history file format (one record)
var SAVE_MSG_HISTORY_DATE_FORMAT="HH:MM:ss  dd/mm/yyyy";

/* Delete messages config */
var MSG_DEL_REQ_DELAY=300; 	//ms
var MSG_IDS_PER_DEL_REQUEST=25;

var SEARCH_AUDIO_LYRIC_LINK='http://yandex.ru/yandsearch?text=%AUDIO_NAME%+%28%2Bsite%3Alyrics.mp3s.ru+%7C+%2Bsite%3Alyrics-keeper.com+%7C+%2Bsite%3Aalloflyrics.com++%7C+%2Bsite%3A2song.net++%7C+%2Bsite%3Amegalyrics.ru+%7C+%2Bsite%3Aakkords.ru%29';
/* API SETTINGS PAGE: http://vkontakte.ru/login.php?app=2168679&layout=popup&type=browser&settings=15615 */

var FAVE_ALLOW_EXTERNAL_LINKS=true;


/* Others */
var USERMENU_SYMBOL='&#9660;&nbsp;';
var MOD_PROFILE_BLOCKS=true;
var CUT_VKOPT_BRACKET=false;     // true - убирает из надписей вкопта скобки "[" и "]"
var MAIL_BLOCK_UNREAD_REQ=false; // true - отключает отсылку отчёта о прочтении сообщения, при его открытии из /mail
var MAIL_BLOCK_TYPING_REQ=false; // true - отключает отсылку уведомления собеседнику о наборе текста
var SUPPORT_STEALTH_MOD=true;    // прикидываемся перед ТП, что у нас не стоит расширение для скачивания.
var VIDEO_AUTOPLAY_DISABLE=false;
var VIDEO_LINKS_WITH_EXTRA=true;
var FULL_ENCODE_FILENAME=false;
var PHOTO_DOWNLOAD_NAMES=false;
var ZODIAK_SIGN_OPHIUCHUS=false;
var AUDIO_AUTOLOAD_BITRATE=false;
var AUDIO_INFO_LOAD_THREADS_COUNT=5;
var AUDIO_INFO_SHOW_FILESIZE=true;
var AUDIO_INFO_SHOW_BITRATE=true;
var AUDIO_DOWNLOAD_POSTFIX=false;
var FEEDFILTER_DEBUG=false;
var SHOW_OID_IN_TITLES=false;
var ENABLE_HOTFIX=true;
var VKSETTINGS_WITH_WIKI_LINKS=false;
var ENABLE_CACHE=false;
var VIDEO_PLAYER_DBG_ON = false; // включить отладочную инфу в видеоплеере
var LOAD_HEADERS_BY_HEAD_REQ = false; // для получения запросом только хидеров использовать HEAD запрос (иначе GET c хидером запроса Range: bytes=0-1)
var BLOCK_LOCALSTORAGE_CLEAR = true; // пытаемся перезаписать родную функцию очистки хранилища
var PHOTO_FEATURE = true; // фича, при которой по щелчку на "Фотография 1 из 40" переключается режим "подгонять/не подгонять фото в просмотрщике по высоте под высоту видимой области".
var NOTIFY_TIMEOUT = 15000; // 15sec пауза между повторным оповещением о наборе текста пользователем
 
var VKOPT_CFG_LIST=[
         'vk_DEBUG',
         'vk_upd_menu_timeout',
         'vkMenuHideTimeout',
         'CHECK_FAV_ONLINE_DELAY',
         'FAVE_ONLINE_BLOCK_SHOW_COUNT',
         'SHOW_POPUP_PROFILE_DELAY',
         'USERMENU_SYMBOL',
         'MOD_PROFILE_BLOCKS',
         'CUT_VKOPT_BRACKET',
         'MAIL_BLOCK_UNREAD_REQ',
         'MAIL_BLOCK_TYPING_REQ',
         'SUPPORT_STEALTH_MOD',
         'VIDEO_AUTOPLAY_DISABLE',
         'VIDEO_LINKS_WITH_EXTRA',
         'AUDIO_AUTOLOAD_BITRATE',
         'AUDIO_INFO_LOAD_THREADS_COUNT',
         'AUDIO_INFO_SHOW_FILESIZE',
         'AUDIO_INFO_SHOW_BITRATE',
         'PHOTO_DOWNLOAD_NAMES',
         'FULL_ENCODE_FILENAME',
         'ZODIAK_SIGN_OPHIUCHUS',
         'AUDIO_DOWNLOAD_POSTFIX',
         'FEEDFILTER_DEBUG',
         'SHOW_OID_IN_TITLES',
         'ENABLE_HOTFIX',
         'VKSETTINGS_WITH_WIKI_LINKS',
         'ENABLE_CACHE',
         'VIDEO_PLAYER_DBG_ON',
         'LOAD_HEADERS_BY_HEAD_REQ',
         'PHOTO_FEATURE',
         'NOTIFY_TIMEOUT'
];

var vkNewSettings=[98,99,100,79,101,103,104,105,106,19]; //"new" label on settings item
var SetsOnLocalStore={
  'vkOVer':'c',
  'remixbit':'c',
  'remixumbit':'c',
  'IDNew':'c',
  'AdmGr':'c',//last of cookie
  'vkplayer':'c',
  'dapi_mid':'c',
  'dapi_sid':'c',
  'dapi_secret':'c',
  'FavList':'s',
  'GrList':'s',//myGrList
  'VK_CURRENT_CSS_URL':'s',
  'VK_CURRENT_CSSJS_URL':'s',
  'VK_CURRENT_CSS_CODE':'s',
  'menu_custom_links':'s',
  'WallsID':'s',
  'vk_sounds_vol':'s'
};
var vkLdrImg='<img src="/images/upload.gif">';
var vkLdrMonoImg='<img src="/images/upload_inv_mono.gif">';
var vkLdrMiniImg='<img src="/images/upload_inv_mini.gif">';
var vkBigLdrImg='<center><img src="/images/progress7.gif"></center>';
var SettBit=false;
var vkopt_disabled_ad=false;
var vkOpt_js_count=11; // Count of vkopt files

var FriendsNid=[];

//YouTube formats list
var YT_video_itag_formats={
	
	'0': '240p.flv',
	'5': '240p.flv',
	'6': '360p.flv',
	'34': '360p.flv',
	'35': '480p.flv',
	
	'13': '144p.3gp (small)',
	'17': '144p.3gp (medium)',
	'36': '240p.3gp',
	
	'160': '240p.mp4 (no audio)',
	'18': '360p.mp4',
	'135': '480p.mp4 (no audio)',
	'22': '720p.mp4',
	'37': '1080p.mp4',
	'137': '1080p.mp4 (no audio)',
	'38': '4k.mp4',
	'82': '360p.mp4',//3d?
	//'83': '480p.mp4',//3d?
	'84': '720p.mp4',//3d?
	//'85': '1080p.mp4',//3d?
	
	'242': '240p.WebM (no audio)',
	'43': '360p.WebM',
	'44': '480p.WebM',
	'244': '480p.WebM (low, no audio)',
	'45': '720p.WebM',
	'247': '720p.WebM (no audio)',
	'46': '1080p.WebM',
	'248': '1080p.WebM (no audio)',
	'100':'360p.WebM',//3d?
	//'101':'480p.WebM',//3d?
	'102':'720p.WebM',//3d?
	//'103':'1080p.WebM',//3d?
	
	'139': '48kbs.aac',
	'140': '128kbs.aac',
	'141': '256kbs.aac',
	
	'171': '128kbs.ogg',
	'172': '172kbs.ogg'
}; 
 // kolobok.us
var SmilesMap = {
'girl_angel': /O:-\)|O:\)|O\+\)|O=\)|0:-\)|0:\)|0\+\)|0=\)/gi,
'smile': /:\)+|:-\)+|=\)+|=\]|\(=|\(:|\)\)\)+|\+\)/gi,// |:-\]|:\]

'hang1':[/-:\(/ig,'big_madhouse'],
'sad': /[\+:]\(+|:-\(+|=\(+|\(\(\(+/gi,

'wink': /;\)+|;-\)+|\^_~/gi,
'blum1': /:-[p\u0440]|[\+=:][p\u0440]|:-[P\u0420]|[\+=:][P\u0420]|[:\+=]b|:-b/gi,
'cool': /B-?[D\)]|8-[D\)]/gi,
'biggrin': /[:=]-?D+/gi,

'mamba': [/[=:]\[\]|\*WASSUP\*|\*SUP\*/ig,'big_madhouse'],
'blush':  /:-?\[|;-\.|;'>/gi, //\^_\^|

'shok': /=-?[0OОoо]|o_0|o_O|0_o|O_o|[OО]_[OО]/gi,
'diablo':  /[\]}]:-?>|>:-?\]|\*DIABLO\*/gi, 
'cray': /[:;]-?'\(|[:;]'-\(/gi,
'mocking': /\*JOKINGLY\*|8[Pp]/gi, 
'give_rose': /@-->--|@}->--|@}-:--|@>}--`---/gi,
'music': /\[:-?\}/gi, 
'air_kiss':/\*KISSED\*/gi,
'kiss': /[:;=]-\*+|[:;=]\*+|:-?\{\}|[\+=]\{\}|\^\.\^/gi,//[:;=]-\[\}|[:;=]\[\}
'bad':  /[:;]-?[!~]/gi,
'wacko1': /[^\d]%-?\)|:\$/gi,  
'good':/\*THUMBS.UP\*|\*GOOD\*/gi,
'drinks': /\*DRINK\*/gi,
'pardon':/\*PARDON\*|=\]/gi,  
'nea':/\*NO\*|:&|:-&/gi,
'yes':/\*YES\*/gi,
'sorry':/\*SORRY\*/gi,  
'bye2':/\*BYE\*/gi,
//'hi':/\*HI\*/gi,
'unknown':/\*DONT_KNOW\*|\*UNKNOWN\*/gi,
'dance':/\*DANCE\*/gi, 
'crazy':/\*CRAZY\*|%-\)/gi,
'lol':/\*LOL\*|xD+|XD+/gi, 
'i_am_so_happy': /:!\)/gi,
'mad': /:\\|:-[\\\/]/gi,

'greeting':[/\*HI\*/gi,'big_standart'],
'ok':[/\*OK\*/ig,'big_standart'],
'rofl':[/\*ROFL\*/ig,'big_standart'],
'scratch_one-s_head':[/\*SCRATCH\*|:-I/ig,'big_standart'],
'fool': [/:-\||:\||=\|/ig,'big_standart'],
'bomb': /@=/ig,
'new_russian':[/\\m\//ig,'big_standart'],
'scare3':[/:-@/ig,'big_standart'],
'acute':[/;D|\*ACUTE\*/ig,'big_standart'],
'heart':[/<3/ig,'light_skin'],
'secret':[/:-x/ig,'big_standart'],
'girl_devil':[/\}:o/ig,'big_he_and_she'],
'dash1':[/\*WALL\*|X-\|/ig,'big_madhouse'],
'facepalm':/\*FACEPALM\*/ig,
'help':[/[\*!]HELP[\*!]/ig,'big_standart'],
'spam':[/!SPAM!|SPAM,.IP.LOGGED/ig,'other'],
'flood':[/!FLOOD!/ig,'other'],
'opera':/\*OPERA\*/ig,
'firefox':/\*FIREFOX\*/ig,
'chrome':/\*CHROME\*/ig,
'windows':/\*WINDOWS\*/ig,
'linux':/\*LINUX\*/ig

//'mellow': /:-\||:\||=\|/gi,
//'kiss3': /[:;=]-\*+|[:;=]\*+/gi,
//'yahoo': /\^_\^|\^\^|\*\(\)\*/gi
//'bad': /:X|:x|:х|:Х|:-X|:-x/gi,

};
//smile array for TxtFormat
var TextPasteSmiles={
'girl_angel':'O:-)',
'smile':'=)',
'sad':'=(',
'wink':';-)',
'blum1':'=P',
'cool':' 8-)',
'biggrin':'=D',
'blush':";\\\'>",
'shok':'O_o',
'diablo':']:->',
'cray':":-\\\'(",
'mocking':'*JOKINGLY*',
'give_rose':'@}->--',
'music':'[:-}',
'kiss':':-*',
'bad':':-!',
'wacko1':'%-)',
'crazy':'*CRAZY*',
'lol':'*LOL*', 
'dance':'*DANCE* ',
'nea':'*NO*',
'yes':'*YES*',
'sorry':'*SORRY*',
'bye2':'*BYE*',
'mad': ':-/',
'pardon':'=]',
'mamba': ['=[]','big_madhouse'],
'hang1':['-:(','big_madhouse'],
'greeting':['*HI*','big_standart'],
'ok':['*OK*','big_standart'],
'rofl':['*ROFL*','big_standart'],
'scratch_one-s_head':[':-I','big_standart'],
'fool': [':-|','big_standart'],
'bomb': '@=',
'new_russian':['\\\\m\/','big_standart'],
'scare3':[':-@','big_standart'],
'acute':[';D','big_standart'],
'heart':['<3','light_skin'],
'secret':[':-x','big_standart'],
'girl_devil':['}:o','big_he_and_she'],
'dash1':['X-|','big_madhouse'],
'facepalm':'*FACEPALM*',
'help':['!HELP!','big_standart'],
//'flood':['!FLOOD!','other'],
'opera':"*Opera*",
'firefox':"*Firefox*",
'chrome':"*Chrome*",
'windows':"*Windows*",
'linux':"*Linux*"
};


	
	function vkInitDebugBox(){
	  var sHEIGHT=21;
	  var sWIDTH=21; 
	  var HEIGHT=300;
	  var WIDTH=400;
	  LAST_LOG_MSG='';
	  LAST_EQ_LOG_MSG_COUNT=0;
	  vkaddcss('\
			#vkDebug{opacity:0}\
         #vkDebug:hover{opacity:1}\
         #vkDebug{ border: 1px solid #AAA; border-radius:5px; background:#FFF; color: #555;\
					  padding:1px;\
					  width:'+sWIDTH+'px; height:'+sHEIGHT+'px; overflow:hidden;\
					  position:fixed; z-index:1000; right:0px; top:0px;}\
			#vkDebug .debugPanel{height:'+sHEIGHT+'px; background:#F0F0F0}\
			#vkDebug .debugPanel span{line-height:18px; font-weight:bold; color:#999; padding-left:5px;}\
			#vkDebug .mbtn{background:#FFF url("/images/icons/x_icon5.gif") 0px -63px no-repeat;\
					  cursor: pointer; height: 21px; width: 21px;\
					  float:right;}\
			#vkDebug .hbtn{background:#FFF url("/images/icons/x_icon5.gif") 0px -105px no-repeat;\
					  cursor: pointer; height: 21px; width: 21px;\
					  float:right;}\
			#vkDebug .log{border: 1px solid #DDD; margin: 5px; min-width:'+(WIDTH-10)+'px; max-height:'+HEIGHT+'px; overflow:auto;}\
			#vkDebug .log DIV{border-bottom: 1px solid #EEE;}\
			#vkDebug .log DIV:hover{background:#FFB}\
			#vkDebug .log DIV .time{float:right; color: #BBB;}\
			#vkDebug .log DIV .count{background:#44F; padding:0 2px; margin-right:4px; font-size:6pt; border-radius:5px; color:#FFF; border:1px solid #00A;}\
	  ');
	  
	  
	  
	  var div=document.createElement('div');
	  var panel=document.createElement('div'); 
	  var btn=document.createElement('div'); 
	  var wlog=document.createElement('div');  
	  div.id='vkDebug';
	  panel.className='debugPanel';
	  btn.className='mbtn';
	  wlog.className='log';
	  wlog.id='vkDebugLogW';
	  //val(wlog, '<div>log started</div>');
	  
	  var tomax=function(){
		  var callback=function(){
			  btn.onclick=tomin;
			  btn.className='hbtn';
			  div.style.height='auto';
		  };
		  var h=getSize(wlog)[1];
		  animate(div, {height: h+sHEIGHT,width: WIDTH}, 400, callback);
	  };
	  var tomin=function(){
		  var callback=function(){
			btn.onclick=tomax;
			btn.className='mbtn';
		  };
		  animate(div, {height: sHEIGHT,width: sWIDTH}, 400, callback);
	  };
	  btn.onclick=tomax;
	  panel.appendChild(btn);
	  div.appendChild(panel);
	  div.appendChild(wlog);
	  document.getElementsByTagName('body')[0].appendChild(div);
	  vklog('Log started ('+location.pathname+location.search+')',3);
	}
	function vklog(s,type){
	  if (vk_DEBUG){

		
		var node=ge('vkDebugLogW');
		if (!node) return;
		var div=document.createElement('div');
		type=type || 0;
		var style="";
		switch(type){
		  case 0: style=""; break;
		  case 1: style="color:#D00; font-weight:bold;"; break;
		  case 2: style="color:#080;"; break;
		  case 3: style="color:#00D;"; break;
		}
		
		div.setAttribute('style',style);
		div.appendChild($c("#", s));
		//div.appendChild($c("span",{"class":"time", "#text": (new Date().getTime()) - vkstarted}));
		val(div, s+'<span class="time">'+(new Date((new Date().getTime()) - vkstarted)).format("MM:ss:L",true)+'</span>');

		if (LAST_LOG_MSG==s){
			LAST_EQ_LOG_MSG_COUNT++;
			val(node.lastChild, '<span class="count">'+LAST_EQ_LOG_MSG_COUNT+'</span>'+div.innerHTML);
		} else {
			LAST_EQ_LOG_MSG_COUNT=0;
			node.appendChild(div);
		}		
		//node.appendChild(div);
		node.scrollTop = node.scrollHeight;
		LAST_LOG_MSG=s;
	  }
	}

function vkCheckLoadedScripts(){    // Функция для ручного вызова, чтобы на опере 12 определить, какой из файлов сфейлился на первичной интерпретации.
   var obj={
      "vk_face"      :!!window.SmileNode,
      "vk_lib"       :!!window.vkApis,
      "vk_main"      :!!window.vkProcessResponseNode,
      "vk_media"     :!!window.vkLastFM,
      "vk_resources" :!!window.vkSound,
      "vk_settings"  :!!window.vksettobj,
      "vk_skinman"   :!!window.vkShowSkinMan,
      "vk_txtedit"   :!!window.vkAddSmilePanel,
      "vk_users"     :!!window.ProcessUserPhotoLink,
      "vklang"       :!!window.vk_lang_en,
      "vkopt"        :!!window.vkonDOMReady
   };
   if (vk_DEBUG) console.log('result:',obj);
  //vkLastFM.get_loved
}

////////// INIT ////////
function vkonDOMReady(fn, ctx){
    var ready, timer;
    var onChange = function(e){
		if (document.getElementById('footer') || document.getElementById('footer_wrap')) {
         fireDOMReady();
      } else if(e && e.type == "DOMContentLoaded"){
            fireDOMReady();
        }else if(e && e.type == "load"){
            fireDOMReady();
        }else if(document.readyState){
            if((/loaded|complete/).test(document.readyState)){
                fireDOMReady();
            }else if(!!document.documentElement.doScroll){
                try{
                    ready || document.documentElement.doScroll('left');
                }catch(e){
                    return;
                }
                fireDOMReady();
            }
        }
    };
    var fireDOMReady = function(){
        if(!ready){
            ready = true;
            fn.call(ctx || window);
            if(document.removeEventListener)
                document.removeEventListener("DOMContentLoaded", onChange, false);
            document.onreadystatechange = null;
            window.onload = null;
            clearInterval(timer);
            timer = null;
        }
    };
      if(document.addEventListener)
        document.addEventListener("DOMContentLoaded", onChange, false);
      document.onreadystatechange = onChange;
      timer = setInterval(onChange, 5);
      window.onload = onChange;
}
/////////////////////////////////
function vkOpt_toogle(){
  var off=(vkgetCookie('vkopt_disable')=='1');
  if (ge('vkMoreSett') || !window.addEvent) return;
  //if (ge('vkMoreSett') || !ge('settings_filters') || dloc.indexOf('settings')==-1) return;
  var img='data:image/png;base64,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';
  vkaddcss("\
    #header h1 b div a{color: #2B587A;}\
    #vk_onoff{ color: #2B587A; position:absolute; z-index:1000; background:#FFF; margin-left:5px; border:1px solid #DDD;display:none}\
    #vk_onoff .vk_off,#vk_onoff .vk_on{cursor:hand; float:right; border-radius:4px; width:35px; height:8px; padding:1px;}\
    #vk_onoff .btn{width:15px; height:6px;  border-radius:4px;}\
    .vk_off{background:rgba(255, 0, 0, 0.133); border:1px solid #800; }\
    .vk_off .btn{border:1px solid #A00; background:#DDD; margin-left:15px;}\
    .vk_on{background:rgba(0, 255, 0, 0.133); border:1px solid #080;}\
    .vk_on .btn{border:1px solid #0A0; background:#DDD; margin-left:2px;}\
    .vkSettList   { margin: 0px;  padding: 0px 0px; font-weight:normal;  background: transparent; width:105px;}\
    .vkSettList a { color: #2B587A;  margin: 0px;  padding: 3px;  display: inline-block; width:100px;  background: transparent;  border-bottom: solid 1px #CCD3DA; }\
    .vkSettList a:hover {  text-decoration: none;  background-color: rgba(0, 48, 96, 0.145); }\
  ");
  
  var div=document.createElement('div');
  //var style="";  div.setAttribute("style",style);
  div.id='vk_onoff';
  div.className='vkSettList';
  val(div, '<a href="#" onclick="return vkOnOffButton();">VkOpt <div  class="'+(off?"vk_off":"vk_on")+'" id="vktoogler"><div class="btn"></div></div></a>'+
                '<a href="#" onclick="return vkResetVkOptSetting();">Reset Settings</a>'+
                (vkLocalStoreReady()?'<a href="#" onclick="vkLocalStorageMan(); return false;">View LocalStorage</a>':''));

  var cb=vkCe('div',{"class":"fl_r"});
  var btn=vkCe('a',{id:"vkMoreSett",href:"#"},'<img src="'+img+'" height="14px" style="position:absolute; margin-left: -14px;  margin-top: 4px;">');
  var hide_t=0;
  var showed=false;
  var hideFunc=function(){ hide_t=setTimeout(function(){slideUp(div); showed=false;},400); };
  var showFunc=function(){
    cancelFunc(); 
    if (!showed){ 
      slideDown(div);
      showed=true;
    }
  };
  var cancelFunc=function(){ clearTimeout(hide_t); };
  
  addEvent(btn, 'mouseover', showFunc);
  addEvent(btn, 'mouseout' , hideFunc);
  addEvent(div,'mouseover', cancelFunc);
  addEvent(div,'mouseout' , hideFunc);
  //b.appendChild(div);  
  if (!off){
	var ref=ge('settings_filters');
	//alert(ref + '\n'+dloc+'\n'+(dloc.indexOf('settings')==-1));
	if (!ref || !window.nav || nav.objLoc[0]!='settings') return;
	//alert('qaz');
  } else {
	var ref=ge('utils') || ge('pageContainer');
	if (!ref) return;
	cb.className='';
	cb.setAttribute('style','position:absolute; top:0px; left:10px; z-index:999;');
  }
  cb.appendChild(btn);
  cb.appendChild(div);
  ref.parentNode.appendChild(cb);
  
}

function vkOnOffButton(){
  var off=(vkgetCookie('vkopt_disable')=='1');
  if (off) {
    vksetCookie('vkopt_disable','0');
    delCookie('vkopt_disable');
  } else vksetCookie('vkopt_disable','1');
  ge('vktoogler').className=!off?"vk_off":"vk_on";
  location.reload();
  return false;
}

function vkResetVkOptSetting(){
  vksetCookie('remixbit',DefSetBits);
  vkSetVal('remixbit',DefSetBits);
  location.reload();
}

function VkOptInit(ignore_login){
  var allow_init=true;
  if (window.StaticFiles)
   for (var key in StaticFiles){
      if (StaticFiles[key].t=='js' && StaticFiles[key].l!=1){
         allow_init=false;
         break;
      }
   }
  
  if (!window.vkscripts_ok || window.vkscripts_ok<vkOpt_js_count || !allow_init) {setTimeout(function(){VkOptInit();},10); return;}
  /*
  var err=IDL('VkoptDupFound');
  err=(err=='VkoptDupFound')?'\u041e\u0431\u043d\u0430\u0440\u0443\u0436\u0435\u043d\u043e \u0431\u043e\u043b\u0435\u0435 \u043e\u0434\u043d\u043e\u0439 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u043e\u0439 \u043a\u043e\u043f\u0438\u0438 VkOpt`\u0430.<br>\u0423\u0434\u0430\u043b\u0438\u0442\u0435 \u043b\u0438\u0448\u043d\u0438\u0435 \u043a\u043e\u043f\u0438\u0438.':err;
  if (window.vkscripts_ok>vkOpt_js_count){
   topError(err);
   return;
  }*/
	if (window._vkopt_started) return;
	
	vkOpt_toogle();
	if (vkgetCookie('vkopt_disable')=='1') return;
	if (ge("quick_login") && !ignore_login) {
      ql.insertBefore(ce('div', {innerHTML: '<iframe class="upload_frame" id="quick_login_frame" name="quick_login_frame"></iframe>'}), qf);
      qf.target = 'quick_login_frame';

      //     Inj.Wait('window.vk && vk.id',function(){      VkOptMainInit();      }); 
      window.onLoginDone = function(loc){document.location.href=loc};//nav.reload;
		return; 
	}
	VkOptMainInit();
	md5=vkMD5;
   window._vkopt_started=true;
}

var dloc=document.location.href;
var vk_domain=document.location.host;
if (/vk\.com/.test(vk_domain) || /vkontakte\.ru/.test(vk_domain)){
   if (BLOCK_LOCALSTORAGE_CLEAR){ // Блокируем вызов метода очистки локального хранилища, чтоб вк при разлогине не грохал настройки вкопта
      var ls_clear_orig = window.localStorage.clear;
      var ls_new_clear_func = function(confirm){ 
         if(confirm)
            ls_clear_orig();
      } 
      if (vk_DEBUG) console.log('Try override localStorage.clear');
      window.localStorage.clear = ls_new_clear_func;
      if (window.localStorage.clear != ls_new_clear_func && window.localStorage.__proto__){
         if (vk_DEBUG) console.log('Fail. Try override localStorage.__proto__.clear');
         localStorage.__proto__.clear = ls_new_clear_func;
      }
      if (window.localStorage.clear == ls_new_clear_func){
         if (vk_DEBUG) console.log('overrided ok..');
      }
   }
   if (!/\/m\.vk\.com|login\.vk\.com|oauth\.vk\.com|al_index\.php|frame\.php|widget_.+php|notifier\.php|audio\?act=done_add/i.test(dloc)){
       vkonDOMReady(VkOptInit); 
   }
}
