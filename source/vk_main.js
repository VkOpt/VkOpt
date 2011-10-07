// ==UserScript==
// @name          VKOpt 2.x
// @author        KiberInfinity( /id13391307 )
// @namespace     http://vkopt.net/
// @description   Vkontakte Optimizer 2.x
// @include       *vkontakte.ru*
// @include       *vk.com*
// @include       *vkadre.ru*
// @include       *durov.ru*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//

// stManager Hook
function vkStManHook(){/* for dynamic loaded *.js */
  stManBeforeCallback = function (files){  vkInjCheck(files);  };
  stManAfterCallback = function (files){ /*alert(print_r(files));*/};
  stManCallback = function(callback,files){
    backfunc=callback;  
    callback=function(){    
      //vklog(files);
	  stManBeforeCallback(files);    
      backfunc();    
      stManAfterCallback(files);
	  //vklog('done: '+files);
    };
    return callback;
  };
  Inj.After("stManager.add",/if\s*\(!callback\)\s*{*\s*return;\s*}*/,"callback=stManCallback(callback,files);"); 
}
function vkInjCheck(files){
  if (!isArray(files)) files = [files];
  for (var i in files) 
    if (files[i].indexOf('.js') != -1) vkInj(files[i]); 
}

function vkInj(file){
 switch (file){
    case 'photoview.js':    vkPhotoViewer();	break;
	case 'videoview.js':	vkVideoViewer();	break;
	case 'audio.js':		vkAudios();		break;
	case 'feed.js':			vkFeed();		break;
	case 'search.js':		vkSearch();		break;
	case 'profile.js':		vkProfile();	break;
	case 'wall.js':			vkWall();		break;		
	case 'page.js':			vkPage();		break;
	case 'friends.js':		vkFriends();	break;
	case 'notifier.js': 	vkNotifier(); 	break;
	case 'common.js': 		vkCommon(); 	break;
	case 'im.js': 			vkIM(); 	break;
  }
  vk_plugins.onjs(file); 
}


   
function vkOnRenderFlashVars(vars){
	if (vars.vid) vkVidVars=vars;
	else vkVidVars=null;
}
function vkProcessNode(node){
	var tstart=unixtime();
	if (!(typeof node == 'string' && node.length>40)){
	//try{
		vkProccessLinks(node);
		vkSortFeedPhotos(node);
		vkSmiles(node);
		vkPrepareTxtPanels(node);
		vkAudioNode(node);
		vk_plugins.processnode(node);
	// }  catch (e) { topMsg('vkProcessNode error',2)}
	}
	vklog('ProcessNode time:' + (unixtime()-tstart) +'ms');
}


      
      
function vkProcessNodeLite(node){
  var tstart=unixtime();
  try{
	vkProccessLinks(node);
	vkAudioNode(node);
	vkPrepareTxtPanels(node);
	vk_plugins.processnode(node,true);
  }  catch (e) {
	topError(e,{dt:4});
  }
  vklog('ProcessNodeLite time:' + (unixtime()-tstart) +'ms');
}
	
function vkOnStorage(id,cmd){
	//vklog('id: '+id+'\n\n'+JSON.stringify(cmd));
	switch(id){
		case 'user_online_status': UserOnlineStatus(cmd); break;
		case 'menu_counters':UpdateCounters(false,cmd); break;
		case 'upd_sounds':vkUpdateSounds(true); break;
      case 'fav_users_statuses':vkFavOnlineChecker(cmd); break;
      case 'fave_users_statuses':vkFaveOnlineChecker(cmd); break;
	}
}
function vkOnNewLocation(startup){
	if (!(window.nav && nav.objLoc)) return;
	vklog('Navigate:'+print_r(nav.objLoc).replace(/\n/g,','));
	var tstart=unixtime();

	switch(nav.objLoc[0]){
		case 'settings':vkSettingsPage(); break;
		case 'mail': vkMailPage(); break;
		case 'feed': vkFeedPage(); break;
	}	
	
	if (cur.module){	
		vklog(cur.module+'|'+print_r(nav.objLoc).replace(/\n/g,','));
		switch(cur.module){
			case 'profile':vkProfilePage(); break;
			case 'groups' :vkGroupPage(); break;
			case 'event'  :vkEventPage(); break;
			case 'public' :vkPublicPage(); break;
			case 'wall'   :vkWallPage(); break;
			case 'friends':vkFriendsPage(); break;
			case 'photos' :vkPhotosPage(); break;
			case 'audio'  :vkAudioPage(); break;
			case 'audio_edit'  :vkAudioEditPage(); break;
			case 'notes'  :vkNotesPage(); break;
			case 'board'  :vkBoardPage(); break;
			case 'search'  :vkSearchPage(); break;
         case 'fave'    :vkFavePage(); break;
         case 'im': vkImPage(); break;
		}
		if (startup && window.Fave) Fave.init();	
	}

	if (!window.last_navobjLoc || last_navobjLoc!=nav.objLoc[0]){// единичный запуск при переходе в новый модуль
		last_navobjLoc=nav.objLoc[0];
		switch(cur.module){
			case 'friends':vkProcessNode(); break;
		}
	}
	vk_plugins.onloc();
	vklog('OnLocation time:' + (unixtime()-tstart) +'ms');
}

function vkProcessResponseNode(node,url,q){
   if (!url) return;
   if (q.offset && url.indexOf('wall')!=-1) vkAddDelWallCommentsLink(node);
   if (q.offset && url.indexOf('albums')!=-1) vkAddAlbumCommentsLinks(node);
   // alert(url+'\n'+JSON.Str(q));albums-126529

}

function vkLocationCheck(){
  if (uApi.onLogin()) return true;
  if (dApi.onLogin()) return true;
  if (vkCheckInstallCss()) return true;
  XFR.check();
  if (location.href.match('/away')) if (getSet(6) == 'y'){
	location.href=unescape(vkLinksUnescapeCyr(location.href.split('to=')[1].split(/&h=.{18}/)[0]));
	return true;
  }
  return false;
}

function VkOptMainInit(){
  if (vkLocationCheck()) return;
  if (InstallRelease()) return;
  /* // javascript:x=[];for (var key in vk_lang_ru) x.push("'"+key+"': '"+(typeof vk_lang_ru[key] == 'string'?IDL(key):JSON.Str(vk_lang_ru[key]))+"'"); alert(x.join(',\n'));
  vkExtendLang({

  });//*/
  vkStyles();
  if (!ge('content')) return;
  if (getSet(31)=='y' || getSet(35)=='y') vkMakeRightBar();
  if (vk_DEBUG) vkInitDebugBox();
  vkInitSettings();
  vkBroadcast.Init(vkOnStorage);
  window.vkopt_ready=true;
  vk_plugins.init();

  if (location.href.match('act=vkopt'))	vkShowSettings();
  if (window.topMsg){
	vkStManHook();
	for (var key in StaticFiles)  if (key.indexOf('.js') != -1) vkInj(key); 
	vkAudioNode();
  } 
  vkProccessLinks();
  if (ge('left_blocks')) vkProccessLinks(ge('left_blocks'));
  vk_user_init();
  vkFixedMenu();
  vkMenu();
  vkOnNewLocation(true);//Inj.Wait('window.nav', vkOnNewLocation,50);  
  vkSmiles();
  vkPrepareTxtPanels();  
  vkSkinManInit();
  vkClock();
  if (getSet(34)=='y' && !window.setkev){ InpTexSetEvents(); setkev=true;}
  if (getSet(27)=='y') vkGetCalendar();
  if (getSet(20) == 'y') vk_updmenu_timeout=setTimeout("UpdateCounters();",vk_upd_menu_timeout);
  if (getSet(16) == 'y') UserOnlineStatus();
  vkFavOnlineChecker();
  vkFaveOnlineChecker();
  vkMoneyBoxAddHide();
  vkCheckUpdates();
  vkFriendsCheckRun();
  if (vkgetCookie('IDFriendsUpd') && (vkgetCookie('IDFriendsUpd') != '_')) {	vkShowFriendsUpd();  }
  
}


/* STYLES FEATURES */
function GetUnReadColorCss(){
	var cldwn=120;
	var bgcolor=getMsgColor(), clar=hex2rgb(bgcolor); //background
	var rr=Math.max(clar[0]-cldwn,0), gg=Math.max(clar[1]-cldwn,0), bb=Math.max(clar[2]-cldwn,0);  //calc text color
	var textcolor=rgb2hex(Array(rr,gg,bb));
	//alert(bgcolor+'\n'+textcolor);
												 //#E2E9FF
	mailcss= '#mail_rows_t tr.new_msg { background-color: '+bgcolor+' !important;}\n\
	#mail_rows_t tr.new_msg a { color: '+textcolor+' !important;}\n\
	.im_new_msg, .im_new_msg .im_log_author, .im_new_msg .im_log_body, .im_new_msg .im_log_date { color: #000 !important; background-color: '+bgcolor+' !important; }\
	#im_dialogs .new_msg a,.im_new_msg, .dialogs_new_msg, .dialogs_new_msg .dialogs_msg_body, .fc_msgs_unread, .fc_msg_unread{ color: '+textcolor+' !important;  background-color: '+bgcolor+' !important;}\
	.im_new_msg .im_log_date a.im_date_link, .im_new_msg .im_fwd_log_date{color: '+textcolor+'}\
	#im_dialogs .new_msg div.mail_body{color: #000;} .im_hist tr.un td.user a{color: '+textcolor+'}';
	
	//bg_old: .im_hist tr.un,#im_dialogs .new_msg,.im_new_msg,.dialogs_new_msg
	return mailcss;                            //#3B4DA0  
}

function vkStyles(){
	var GR_IN_COL=getSet(22);
	var CompactAu=getSet(3);
	var MoreDarkPV=getSet(4);
	var CompactFave=getSet(17);
	var RemoveAd=getSet(21);
   var ShowAllTime=getSet(56);
	var NotHideSugFr= (getSet(44)=='y');
   var ShowGroupNews=getSet(59);
	var main_css='';
	if (getSet(28)=='y') main_css+=GetUnReadColorCss();
   main_css+=vkNotifierWrapMove();
	//compact fave
	if (CompactFave=='y'){
		main_css+='\
		.fave_user_div{height: 110px !important; width: 67px !important;}\
		.fave_user_div *{width:67px !important;} .fave_user_div a img{width:50px !important;}\
		.fave_user_image{height: 50px !important;}\
		';
		//if (window.Fave) Fave.init();
	}
   if (ShowAllTime=='y'){
   main_css+='\
      #im_rows .im_add_row .im_log_date a.im_date_link{\
         display: block;\
         font-size: 6pt;\
         margin-bottom: -5px;\
         margin-top: -2px;\
      }\
      ';
   }
   if (ShowGroupNews=='y') main_css+='#group .group_wiki_wrap .wk_text{display:block}';
   
	//getSet(38)=='y' 
	main_css+='.vk_my_friend{color:'+getFrColor()+' !important;}';
	main_css+='\
		.vk_common_group{background-color:#ffc1c1; background-color: rgba(89, 125, 163, 0.23);}\
		.vk_adm_group{font-weight:bold; padding:6px 0 !important; background-color: rgba(255, 255, 0, 0.4);}\
      .vk_faved_user{font-weight:bold;} .vk_faved_user nobr{text-decoration:underline;}\
		';
   //main_css+='.friends_add_block[style]{display:block !important;};';

	// main_css+='#notifiers_wrap{display:none !important;}'; /* hide all notifications */
	// main_css+='.notifier_baloon_body{display:none !important;}'; /* hide only notification text and image*/
	var float_profile='.vkrate{height: 20px; width: 200px; margin:4px auto;}\n\
		  .vkpercent {margin:2px; font-size:11px; text-align:center;position:absolute; z-index:3; }\n\
		  .vk_rate_left{position:absolute; z-index:2;float:left; height: 16px;}\n\
		  .vk_rate_right{position:relative; z-index:1; float:left; height: 16px;}\n\
		  /*rate level 0-2*/\n\
		  .vk_rate_lvl_0{color: #8BA1BC;} \n\
		  .vk_rate_lvl_0 .vk_rate_left{ border-top: 1px solid #C0CCD9; background-color:#DAE2E8;}\n\
		  .vk_rate_lvl_0 .vk_rate_right{border-top: 1px solid #ECECEC; border-right: 1px solid #EEE; background-color:#FAFAFA;}\n\
		  /*rate level 3*/\n\
		  .vk_rate_lvl_3 {color: #AAA26C;}\n\
		  .vk_rate_lvl_3 .vk_rate_left{  border-top: 1px solid #CCC490; background-color:#E0D7A3;}\n\
		  .vk_rate_lvl_3 .vk_rate_right{ border-top: 1px solid #E2DAA6; border-right: 1px solid #EEE; background-color:#F5EBBB;}\n\
		  /*rate  level 4*/\n\
		  .vk_rate_lvl_4 { font-size: 11px; color: #FFF2C8; font-weight: bold;}\n\
		  .vk_rate_lvl_4 .vk_rate_left{ border-top: 1px solid #8D7A38; background: #B19A52;}\n\
		  .vk_rate_lvl_4 .vk_rate_right{ border-top: 1px solid #A59250; background: #C9B36E;}\n\
		  /*rate level 5*/\n\
		  .vk_rate_lvl_5 { color: #948239;}\n\
		  .vk_rate_lvl_5 .vk_rate_left{ border-top: 1px solid #B29F4E; background: #CBB464;}\n\
		  .vk_rate_lvl_5 .vk_rate_right{ border-top: 1px solid #C5B565; background: #E1CC7E;}\n\
		/*.vk_profile_info{width:450px;}*/\
		#vk_profile_toogle{position:relative;display:block; text-align:center; 	background:rgba(0,0,0,0.5); color:#FFF; font-weight:bold; 	font-size:20px; margin-top:-25px; line-height:22px;}\
		#vk_profile_toogle:hover{text-decoration:none;}\
		.vk_profile_info .label { width: 100px;color: #777777; }\
		.vk_profile_info .labeled { width: 140px;overflow-x: hidden;overflow-y: hidden; }\
		.vk_profile_info .miniblock { padding-top: 3px; }\
		.vk_profile_block{border:1px solid #7d7d7d; background:#FFF;  box-shadow:1px 1px 5px #000;}\
		.vk_profile_right{background:#FFF;}\
		.vk_username{font-weight:bold;}\
		.vk_username a{color:#FFF;}\
		.vk_profile_online_status{text-shadow:1px 1px 1px #668ab3;  color: #222;}\
		.vk_profile_left{width: 200px;}\
		.vk_profile_ava{text-align: center;}\
		.vk_profile_header{width:236px; background:#5b7b9f; border:1px solid #45688e; color:#FFF;  padding:5px; text-shadow:1px 1px 1px #111; }\
		.vk_profile_header_divider{border-top:1px solid #45688e; border-bottom:1px solid #668ab3;/*border-top:1px solid #666;border-bottom:1px solid #999;*/ margin-top:3px;}\
		.vk_profile_info_block{padding-left:8px;}\
		.vk_profile_common_fr_header{cursor: pointer; width:230px; font-weight:bold; padding:2px; padding-left:5px; background-color: #e1e7ed; color: #7d96b0; border-bottom:1px solid #d8dfe5; border-top:1px solid #d3dae0;}\
		.vk_profile_common_fr{width:236px;}\
		.vk_profile_common_fr a{  margin: 0px;  padding: 1px;  display: inline-block; width:106px;  overflow:hidden; font-size:10px;}\
		.vk_profile_common_fr a.vk_usermenu_btn{width:10px; padding:0px; font-size:10px;}\
		/* avka_nav */\
		.ui-corner-tl { -moz-border-radius-topleft: 6px; -webkit-border-top-left-radius: 6px; border-top-left-radius: 6px; }\
        .ui-corner-tr { -moz-border-radius-topright: 6px; -webkit-border-top-right-radius: 6px; border-top-right-radius: 6px; }\
        .ui-corner-bl { -moz-border-radius-bottomleft: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px; }\
        .ui-corner-br { -moz-border-radius-bottomright: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px; }\
        .ui-corner-top { -moz-border-radius-topleft: 6px; -webkit-border-top-left-radius: 6px; border-top-left-radius: 6px; -moz-border-radius-topright: 6px; -webkit-border-top-right-radius: 6px; border-top-right-radius: 6px; }\
        .ui-corner-bottom { -moz-border-radius-bottomleft: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px; -moz-border-radius-bottomright: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px; }\
        .ui-corner-right {  -moz-border-radius-topright: 6px; -webkit-border-top-right-radius: 6px; border-top-right-radius: 6px; -moz-border-radius-bottomright: 6px; -webkit-border-bottom-right-radius: 6px; border-bottom-right-radius: 6px; }\
        .ui-corner-left { -moz-border-radius-topleft: 6px; -webkit-border-top-left-radius: 6px; border-top-left-radius: 6px; -moz-border-radius-bottomleft: 6px; -webkit-border-bottom-left-radius: 6px; border-bottom-left-radius: 6px; }\
        .ui-corner-all { -moz-border-radius: 6px; -webkit-border-radius: 6px; border-radius: 6px; }\
        \
        .NextButtAva tr td{ cursor:pointer; color: white; text-align: center;  background-color: black;  background-color: rgba(0,0,0,0.6);  border: 1px solid white;  opacity: 1;}\
        .NextButtAva tr td:hover{  background-color: white; background-color: rgba(255,255,255,0.6);   color: black;}\
        .NextButtAva {  border-spacing: 0px;  position: absolute;}\
        .NextButtAva #avko_prev, .NextButtAva #avko_next { width:100px; cursor:hand;  }\
        ._NextButtAva #avko_prev{border-left: 0px solid black !important;border-right: 0px solid black !important;}\
        .NextButtAva tr #avko_zoom{border-left: 0px;border-right: 0px; cursor:hand;}\
        .zoom_ava {\
          background-image_: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAABHFJREFUeNqslG1MU1cYx//n9PT2ttS2FAqMIkFli44NnXtTMYvZ2OLIpiOZybLsg1myhPlpLHPZFzDqB7OEkJgMiRM0zsVk0YyJoI4xxzIzXtNsSJBhIVLoKFBLW0op9+3sA23HXBE3/SdP7knuOf/f85z73Ifcvj2MlWQQBGicAxxmrqlvxxalN3V6fSEAIRaLhUOzs4NjY3cuHD5ytM3pzFWmpqbgdo8kz0uSBIrVtdNoSvs5rNDjmtm+habZw6It22PLzo/mbnhyx9YXS745UfdFK4DCVIfJKhW8Joimcxd+GRou2f60pyDTGtZTIukIQABwAAuSZgvOzu70DN9kBw58WO52j7getIL1FqvtVMP3A10bNxd1FObYgkxHFAIwzsE0DgYOahRo0JGV0V6waXPkUHXVGQA5y00opRSpwpGRebDzljdmcq7/sbjAzviSISMkGRQAA4fACJR0e3pf8XM7sva+UVYpyzJkWV4CrJB9lsKx2+WJ3nj+qTw/ABpTEVhQ4Y8o8M4r8EYVTC+o8MscQY0jwiiiGdnZ7l2vlJYBKEgYMavFkgpQ7A/NU3N65ogo6CIzC/iDAYKexgNglIBSAigc0ACNcMxTnSgWbHi8zGa1FgdDoTsAwEKhYCpATmSRaTarNajXQcwx4llGQHUA1cXLJiS5VyME4ByUacRitVo0wSDkAhAASCwWi6UCSHpm0RgIFA3SUpJA4gmy1EF/M6ARgOkIqKooVJFkLXH9rLPz11QAd+nre0VMSxYCjKocQQNFFgUUEjdeVgFovALCOfP+OS6F5uZ8ABQAYCe/bEgF6C99dbfHYaRFepX/JnMyRoAsusw84Z9cc1BJWsj7qf36hKqqownASl2ktDRfatyYZ9w1H4jkgMOjAT5KICQMCUmaa+CgBLANDPbnt7ZeaQXgSVZ3nx+t4aarsyfDsPDBYlQWFaCbA4F/QJa+iUYAs2966qWjh490TU5OtgAIJ0fFwMDv/3JWVQ6jMQ2trdf27NtXfonrxQHRYj0lGtioSPCEDnDGkxM4R+H4xPgLn3z8kevixW+PAehIXA/n/L6ATKs147IsR7e5+np8lvQMqXBTkd9kTvMIOmqGquUF7t61t//QJtXU1LQMDg6eBdCXME8A2ArXYzIYLGdFkW1zufp97763/+BiLNq39ZktL+evzd9uEEVMTk31DQ0N3fJ6vV0A+gH4UxmlBBgM9jqbzVQ2MTEmVVcfOh2JhK/oGQsAGAJw4uvz5xkAOJ1OZbVZz0IhCYTooaoAoMOaNeLnubnp++fmgmhsPN3S29t7DkDg3i7DA+reLvrM6cz+VJbn0d3d019bW1sfz/p/azng/XXr1h4DYpiZ8QcqKyvrAdxIvJQV5aEAZQ7HY3WiqECWZa2qquorj8fzHYAYHlIUwB6LJfOkwyGInKtobr7c1tTUdAaAD49AtL7+eBhkNsy5Ard7dLiioqIewECqzd29ff8ZwAB0lL9VXl5SUvLO1avXhgBcR2IsPwL9NQAItN6CBWomXgAAAABJRU5ErkJggg==");\
          background-image_: url("data:image/png;base64,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");\
          background-attachment: scroll;  background-repeat: no-repeat;  background-position: center;  width: 50px;\
          font-size: 13pt; font-weight: 700;\
        }\
		';
	var calendar='#vk_calendar.calendar {	width: 120px; margin:0px; padding:0px;margin-left:-1px;}\
		#vk_calendar .day_table {  width: 120px; table-layout: fixed;}\
		#vk_calendar .day_cell.day2, #vk_calendar  .day_cell.day4, #vk_calendar .day_cell.day6, #vk_calendar .day_head.day2, #vk_calendar .day_head.day4, #vk_calendar .day_head.day6{}\
		#vk_calendar .day_head{overflow:hidden; width: 16px; }\
		#vk_calendar .day_cell {width: 16px; height: 16px;}\
		#vk_calendar .day_cell.holiday{background-color: #fff2ab}\
		#vk_calendar .day_cell.event{font-weight:bold;}\
		#vk_calendar .day_cell.today,#vk_calendar .day_cell.holiday.today {background-color: #bbffaf;}\
		#vk_calendar .day_cell.today .day_num {display: block;}\
		#vk_calendar .day_cell .day_button {cursor:pointer;}\
		#vk_calendar .day_row {height: 16px; }\
		#vk_calendar .day_num { width: 16px; padding-top: 0px;}\
		#vk_calendar .calendar_header .header_info {display:none;}\
		#vk_calendar .calendar_header .header_month {font-size: 10px;padding: 2px;padding-bottom: 0px;}\
		#vk_calendar .calendar_header .arrow a { height: 17px;}\
		#vk_calendar .calendar_header {height: 17px; padding-left: 2px;padding-right: 2px;}\
		#vk_calendar .calendar_header .arrow a {width: 15px;}\
		#vk_calendar .calendar_header .left.arrow { background-position: 0px -35px; }\
		#vk_calendar .calendar_header .right.arrow { background-position: 0px -55px; }\
		#vk_calendar .day_text,#vk_calendar .day_events,#vk_calendar .day_more{display:none;}\
		#vk_calendar .events_block{border:1px solid #e7e7e7; background-color: #f7f7f7; margin-bottom:10px; padding:5px 5px 2px 5px; }\
		#vk_calendar .event_block{border:1px solid #e7e7e7; background-color: #fff; padding:5px; margin-bottom:3px; text-align: center;}';
	//main
	main_css+=float_profile+calendar+"\
   ul#settings_filters a{margin-right: 1px !important;}\
	#profile_current_info { max-height: none !important; }\
	#right_bar { width: 118px;}\
	#right_bar_container{width: 118px; margin:5px 10px 0px 0px;	padding-bottom: 10px;}\
	.box_loader {  height: 50px;  background: url('/images/progress7.gif') center no-repeat;}\
	.vk_usermenu_btn{color: rgba(100,100,100,0.5);} .vk_usermenu_btn:hover{/*opacity: 0.1;*/ text-decoration:none;}\
	.vk_user_menu_divider{border-bottom:1px solid #DDD;}\
	.vk_mail_save_history{	display: block; height: 13px;	padding: 18px;	text-align: center;	}\
	.vk_mail_save_history_block{	display: block; float:right; text-align: center; /*width: 200px;*/	}\
	.vk_mail_save_history_block IMG{margin-top:13px;}\
	.vk_mail_save_history_block .cfg{height: 11px; width: 15px; margin-top:2px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -60px;}\
	.lskey{padding-left: 5px; float:left; width:140px; overflow:hidden; height:20px; line-height:20px; font-weight:bold;}\
    .lsval{height:20px; overflow:hidden; line-height:20px;}\
    .lsrow{border:1px solid #FFF; border-bottom:1px solid #DDD;}\
    .lsrow:hover{border:1px solid #AAA; background-color:#EEE; }\
    .lsrow_sel{border:1px solid #AAA; background-color:#E0E0E0;}\
    .lstable{border:1px solid #DDD; max-height:200px; overflow:auto}\
	.vk_cfg_warn{padding:8px; border:1px solid #DD0; background:#FFE}\
	.vk_cfg_error{padding:8px; border:1px solid #D00; background:#FEE}\
	.vk_cfg_info{padding:8px; border:1px solid #36638e; background:#EEF}\
	#vk_online_status .vkUOnline,#vk_online_status .vkUOffline,#vk_online_status .vkUUndef{padding:4px; border:1px solid; opacity: 0.5;}\
	#vk_online_status .vkUOnline{background:#CCFF99; color:#009900; border-color:#009900;}\
	#vk_online_status .vkUOffline{background:#FFDCAD; color:#C00000; border-color:#C00000;}\
	#vk_online_status .vkUUndef{background:#DCDCDC; color:#555; border-color:#888; padding-left:14px; padding-right:14px;}\
	.picker_panel input{height:20px; border:1px solid #DDD; color:#FFF; background:rgba(0,0,0,0.7); margin-left: 10px;}\
	.picker_box{width: 275px;height: 286px; position: absolute; background: #fff; border: 4px solid #ccc; z-index: 1500;  background: rgba(0,0,0,0.7); padding:4px; border: 1px solid #000; z-index: 1500; border-radius:5px; box-shadow:1px 1px 4px #444;}\
	.picker_panel{clear: both; padding:4px; padding-top:0px; text-align:center;}\
	.picker_color{margin: opx; float:left; height: 20px; width: 50px; border: 1px solid #000; background: #f00;}\
	.picker_value{height:16px; width: 60px; padding: 0 3px;}\
	.vk_popupmenu{background:#FFF; border:1px solid #DDD; padding:0px;}\
	.vk_popupmenu ul{padding:0px; margin:0px;}\
	.vk_popupmenu ul li{display:block;}\
	.vk_popupmenu ul li a{display:block; padding:2px 5px;}\
	.vk_popupmenu ul li a:hover{background:#E1E7ED; text-decoration:none;}\
   .vk_tt_links_list a{display:block; padding:2px 1px;}\
	"+(RemoveAd=='y'?".ad_box,.ad_help_link, .ad_help_link_new, .ad_box_new, #ad_help_link_new {display: none !important;}\
			"+(NotHideSugFr?'.ad_box_friend{display: block !important;} .ad_box_friend + .ad_box_new{display:block !important;}':'')+"\
			#groups .clearFix {display: block !important;} \
			#sideBar a[href*=\"help.php\"] {display: none !important;} \
			#groups .clearFix {height: 100% !important;}":'')+"\
	";//,, #left_ads

	//compact audio
	if (CompactAu=='y')	main_css+="\
		.audio .playline { padding-top: 0px !important;}\
		.audio .player_wrap { height: 6px !important; padding-top: 0px !important;}\
		.audio_add{margin-top:0px !important;}\
		.audio_table .remove {top: 3px !important;}\
		.audio_table .audio td.play_btn, .audio_table .audio td.play_btn td { padding-bottom: 0px !important; padding-top: 0px !important;padding: 0px !important; }\
		.audio_table .audio td{ padding-bottom: 0px !important; padding-top: 0px !important;}\
		.audio_table table{ border-spacing: 0px !important;}\
		.audios_row { margin-top: 0px !important;}\
		.audios_row .actions a{padding-top:2px !important; padding-bottom:2px !important;}\
	";
	//additional audio styles
	var img="data:image/gif;base64,R0lGODdhEAARALMAAF99nf///+7u7pqxxv///8nW4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAEAARAAAEJpCUQaulRd5dJ/9gKI5hYJ7mh6LgGojsmJJ0PXq3JmaE4P9AICECADs=";
	main_css+='\
		.play_new{float:left; width: 17px !important;}\
		.vkaudio_down{border-spacing: 0px;}\
		.audio_table .audio td.play_btn {width: 40px !important;}\
		.audio .down_btn { background-image: url("'+img+'") !important;}\
		.audio_table .audio td.info { width: 340px !important;}\
		.audio_table .audio td { padding-left: 0px; }\
		.audio_table .audio .title_wrap {width: 315px !important;}\
		.audios_row .actions { padding-left: 0px !important; }\
		.audios_row .actions a{padding-right:2px !important; padding-left:2px !important;}\
		.audios_row .audio_title_wrap{ width: auto !important; max-width: 295px; }\
		.post_media .audio_title_wrap { width: 250px !important;}\
		#mail_envelope .audio_title_wrap { width: 215px !important;}\
	';
	  //extend switch color in viewer
	if (MoreDarkPV=='y') main_css+="\
		.pv_dark .pv_cont #pv_box,.pv_dark .info{background:#000 !important; color: #FFF !important;} \
		.pv_dark .pv_cont #pv_box DIV{border-color:#444 !important;}\
		.pv_dark .pv_cont SPAN{color:#DDD !important;}\
		.pv_dark .pv_cont A{color:#888 !important;}\
		.pv_dark #pv_actions a:hover{background-color:#444 !important; color:#FFF  !important;}\
	";
	main_css+=
		'.vk_imgbtn{cursor: pointer; margin:-5px 0 -6px 0;}'+
		'span.ptool { position: relative;} '+
		'span.ptool span.ptip { display: none; } '+
		'span.ptool:hover span.ptip { display: block; z-index: 100;  position: absolute; top: 25px;  left: 0; width:130px  } '+
		'span.ptool:hover span.ptip { color:#585858; text-align:center; padding: 10px; border: 1px solid #E9E9E9; background-color: #FFFFD9;} '+

		'span.pltool { position: relative;} '+
		'span.pltool span.pltip { display: none; } '+
		'span.pltool:hover {display: none;} '+                                                                    // 110px
		'span.pltool:hover span.pltip { display: block; z-index: 100;  position: relative; top: -3px;  left: -120px; width:auto;  } '+
		'span.pltool:hover span.pltip { color:#585858; text-align:center; padding: 2px; border: 1px solid #DDDDDD; background-color: #FFFFD9;}'
	;
	// friens test box
	main_css+="\
      .vkfrupl span{}\
      .vkcheckbox_off{opacity: 0.5; margin: 3px 3px -3px 0; display:inline-block; height: 14px; width: 15px; overflow: hidden; background: transparent url(/images/icons/check.gif?1) 0px 0px no-repeat;}\
      .vkcheckbox_on{opacity: 0.5; margin: 3px 3px -3px 0; display:inline-block; height: 14px; width: 15px; overflow: hidden; background: transparent url(/images/icons/check.gif?1) 0px -14px no-repeat;}\
	";
	//settings 
	main_css+="\
      .vk_warning_ico,.vk_info_ico,.vk_hint_ico{width:16px; height:16px; cursor:pointer;}\
		.vk_warning_ico{background-image:url('"+warning_img+"');}\
      .vk_info_ico{background-image:url('"+info_img+"');}\
      .vk_hint_ico{background-image:url('"+hint_img+"');}\
		.sett_block{border-bottom:1px solid #CCC; width:49%; display:inline-block; margin-top:3px;margin-left: 4px; float:left}\
		.sett_block .btns{border:0px solid; width:60px; float:left; height:100%; text-align:center;}\
		.btns A{display:block;}\
		.btns A[on]:hover,.btns A[off]:hover{text-decoration:none;}\
		.btns A[on],.btns A[off]{font-weight:normal; border:1px solid; }\
		.btns A[on] {color: #959595; border-bottom:0px; -moz-border-radius:5px 5px 0 0; border-radius:5px 5px 0 0;margin:3px 7px 0 7px;}\
		.btns A[on]:hover{color:#080; border-color:#080; background-color: #baf1ba;}\
		.btns A[off]{color: #959595; border-top: 0px; -moz-border-radius:0 0 5px 5px; border-radius:0 0 5px 5px; margin:0 7px 3px 7px;}\
		.btns A[off]:hover{color: #800; border-color:#880000; background-color: #ffbebe;}\
		.btns A[set_on]{color:#080; background-color: #baf1ba; border:1px solid; -moz-border-radius:5px; border-radius:5px; margin: 2px 2px 0px 2px;}\
		.btns A[on][set_on]{border:1px solid; color:#080; background-color: #baf1ba;-moz-border-radius:5px; border-radius:5px; margin: 2px 2px 0px 2px;}\
		.btns A[off][set_on]{border:1px solid; color:#800; background-color: #ffbebe;-moz-border-radius:5px; border-radius:5px; margin: 0px 2px 2px 2px;}\
		.sett_block .scaption{padding-left:70px;}\
		.sett_block .stext{border:0px solid; float:right; width:230px;}\
		.sett_header{text-align: center; font-weight:bold; border: 1px solid #B1BDD6; border-bottom: 1px solid #B1BDD6; color: #255B8E; background: #DAE2E8; height: 25px;}\
		.sett_container{width:100%;}\
		.sett_new{/*background-color:#FFC;*/}\
		.sett_new_:after{content:'*'; color:#F00; position:absolute; margin-top:-3px;}\
		.sett_new:before{content:'new'; color:#F00; position:absolute; margin-left:-3px; margin-top:-3px; font-size:7pt; text-shadow:white 1px 1px 2px; background:rgba(255,255,255,0.6); -moz-border-radius:2px; border-radius:2px; transform:rotate(-20deg); -webkit-transform:rotate(-20deg);  -moz-transform:rotate(-20deg);  -o-transform:rotate(-20deg);}\
		.sett_cat_header{display: inline-block; width:100%; text-align: center; font-weight:bold; border: 1px solid #B1BDD6; color: #255B8E; background: #DAE2E8; line-height: 25px;}\
		.vk_sounds_settrings .sett_block{border-bottom:0px; width: 300px;}\
		#vkTestSounds a{  margin: 0px;  padding: 3px; padding-left:25px; line-height:20px; display: inline-block; width:225px;  \
						  background: url(http:\/\/vk.com\/images\/play.gif) 4px 5px no-repeat;\
						  border-bottom_: solid 1px #CCD3DA; }\
		#vkTestSounds a:hover {  text-decoration: none;  background-color: #DAE1E8; }\
	"; 
	
	var shut='\
		.shut .module_body {	display: none !important;}\
		.shut { padding-bottom: 3px !important; }\
		#profile_wall.shut div {display: none !important;}\
		#profile_wall.shut div.module_header {display: block !important;}\
		.module_header.shutable .header_top{	padding-left: 23px !important;	background: #e1e7ed url("http://vkontakte.ru/images/flex_arrow_open.gif") 0% 50% no-repeat;	}\
		.shut .module_header.shutable .header_top{ padding-left: 23px;  background: #eeeeee url("http://vkontakte.ru/images/flex_arrow_shut.gif") 0% 50% no-repeat;}\
		.shut .module_header {background-color:#f9f9f9;}\
	  ';
	var gr_in_col=(GR_IN_COL == 'y')?"\
			  #groups .flexBox a{display: list-item !important; list-style: square outside !important; margin-left:5px; font-size: 11px;} \
			  #groups .flexBox { font-size:0px; } \
			  #profile .groups_list_module .module_body a {font-size: 11px; padding-bottom: 3px; border-bottom:1px solid #EEE; display: block !important;}\
			  #profile .groups_list_module .module_body{font-size:0px;}  \
			 ":"";
			 
	var vkmnustyle='.vkactionspro { list-style: none; margin: 20px 0 10px 1px; padding: 0;}'+
	'.vkactionspro li {border-bottom: 1px solid #ffffff; border-bottom-color: #ffffff; border-bottom-width: 1px;border-bottom-style: solid;font-size: 1em;}'+
	'.vkactionspro li a {border: none;border-top: 1px solid #ffffff;background: #ffffff;padding: 3px 3px 3px 6px;}'+
	'.vkactionspro li a:hover {background: #dae1e8;border-top: 1px solid #cad1d9;border-top-color: #cad1d9;border-top-width: 1px;border-top-style: solid;}'+
	'.VKAudioPages { list-style-type: none; padding-left:0px; height: 20px; margin:0px 0px 5px;  float:right;}'+
	'.VKAudioPages li { float: left; margin-right: 1px; padding: 2px 6px;}'+
	'.VKAudioPages li.current { border: 1px solid #DAE1E8; background-color:#fff;}'+
	'.vkLinksList   { margin: 0px;  padding: 10px 0px;  background: transparent; width:400px;}'+
	'.vkLinksList a {  margin: 0px;  padding: 3px;  display: inline-block; width:123px;  background: transparent;  border-bottom: solid 1px #CCD3DA; }'+
	'.vkLinksList a:hover {  text-decoration: none;  background-color: #DAE1E8; }  ';

	main_css+=vkmnustyle + gr_in_col+ shut +"\
			#vkWarnMessage, .vkWarnMessage {border: 1px solid #d4bc4c;background-color: #f9f6e7;padding: 8px 11px;font-weight: 700;font-size: 11px;margin: 0px 10px 10px;}\
			span.htitle span.hider{display:none} span.htitle:hover span.hider{display:inline}\
			.audioTitle b, .audioTitle span { float: none;} \
			.audioTitle .fl_l{float:right}\
			.playerClass {width: 330px;}\
			a .zoomouter{display:inline-block}\
			a .zoomouter .zoomphotobtn{ display:none;  z-index:1000; height:20px; width:20px;  position:absolute; margin-top:-3px; margin-left:-3px;\
					  background:rgba(255,255,255,0.9) url(\"data:image/png;base64,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\") 2px -4px no-repeat;}\
			a .zoomouter:hover .zoomphotobtn{display:inline; border:1px solid #FFF;}\
			a .zoomouter .zoomphotobtn:hover{display:inline; border:1px solid #800;}\
			span.cltool { position: relative;}\
			span.cltool span.cltip { display: none; }\
			span.cltool:hover span.cltip { display: inline;  width:190px  }\
			span.cltool:hover span.cltip { color:#585858; text-align:center; padding: 0px; border: 0px; background-color: #FFFFD9;}\
			.vkProgBar{height:30px;  text-align:center;line-height:30px;}\
			.vkProgBarFr{ background-color: #6D8FB3; color:#FFF; text-shadow: 0px 1px 0px #45688E;   border-style: solid;  border-width: 1px;  border-color: #7E9CBC #5C82AB #5C82AB;}\
			.vkPBFrame{position:absolute; border:1px solid #36638e; overflow:hidden}\
			.vkProgBarBgFrame{ background-color: #EEE; border:1px solid #ccc;}\
			.vkProgBarBg{text-shadow: 0px 1px 0px #FFF; border:1px solid #EEE;}\
			.vkProgressBarBg{background-color: #fff; border:1px solid #ccc}\
			.vkProgressBarFr{background-color: #5c7893; border:1px solid #36638e; height: 14px;}\
				.vkProg_Bar{height:19px;  text-align:center;line-height:17px; font-size:10px;}\
				.vkProg_BarFr{ background-image:url(\"/images/progress_grad.gif\"); background-color: #6D8FB3; color:#FFF; text-shadow: 0px 1px 0px #45688E;   border-style: solid;  border-width: 1px;  border-color: #7E9CBC #5C82AB #5C82AB;}\
				.vkPB_Frame{position:absolute; border:1px solid #36638e; overflow:hidden}\
				.vkProg_BarBgFrame{ background-color: #EEE; border:1px solid #ccc;}\
				.vkProg_BarBg{text-shadow: 0px 1px 0px #FFF; border:1px solid #EEE;  box-shadow: inset 0 10px 26px rgba(255, 255, 255, 0.5);}\
			.vkaudio_down td{padding:0px !important;}\
			.vk_tBar { padding: 10px 10px 0px 10px;  border-bottom: solid 1px #36638E;}\
			.vk_tab_nav{ padding:0px; margin:0px; width: 605px;}\
			.vk_tab_nav li{   float:left;   text-align:center;    list-style-type: none;  }\
			.vk_tab_nav .tab_word {  margin: 5px 10px 0px 10px;  font-weight: normal;}\
			.vk_tab_nav li a{\
			  float: left;\
			  padding: 5px 0 5px 0;\
			  margin-right: 5px;\
			  display_:block;\
			  text-decoration:none;\
			  border-radius: 4px 4px 0px 0px;\
			  -moz-border-radius: 4px 4px 0px 0px;\
			  -webkit-border-radius: 4px 4px 0px 0px;\
			  -o-border-radius: 4px 4px 0px 0px;\
			}\
			.vk_tab_nav li a:hover{ background: #DAE1E8; color: #2B587A;  text-decoration: none;}\
			.vk_tab_nav li.activeLink a,.vk_tab_nav li.activeLink a:hover{background-color: #36638e;color:#FFF;}\
			a.vk_button{\
			  background-color: #36638e;color:#FFF; text-decoration:none; padding:5px; margin: 0 5px;\
			  border-radius: 4px;-moz-border-radius: 4px;-webkit-border-radius: 4px;-o-border-radius: 4px;\
			}\
			#side_bar ol li#myprofile a.edit {float:right;}\
			.vk_textedit_panel{box-shadow: 0px -0px 3px #888; background:rgba(255,255,255,0.7); position:absolute; line-height:25px; padding:2px; margin-top:-35px;}\
			a.vk_edit_btn{display:block; background-color:transparent; border:1px solid transparent; height:20px; width:20px; float:left;}\
			a.vk_edit_btn:hover{background-color:#FFF; border:1px solid #DDD;}\
			a.smile_btn{background-image:url(\""+smile_btn_img+"\")}\
			a.vk_edit_btn .vk_edit_sub_panel{display:none; position:absolute;z-index: 1000; margin-left:20px; background:#FFF; background:rgba(255,255,255,0.7); border:1px solid #DDD; box-shadow: 1px 1px 4px #DDD; width:445px; margin-top:-140px;}\
			a.vk_edit_btn:hover .vk_edit_sub_panel{display:block;}\
			.vk_txt_smile_item IMG{background-color:transparent;}\
			.vk_txt_smile_item:hover IMG{background-color:#DDD;}\
         #side_bar ol li a.vk_published_by {  padding-left: 17px;  background-image: url(/images/icons/published.gif); background-position:3px 6px; background-repeat:no-repeat;}\
	";
	main_css+=vk_plugins.css();

	vkaddcss(main_css);
}

function vkNotifierWrapMove(){
   var bit=getSet(54);
   var css='#notifiers_wrap {'
   switch(bit){
      case '1': css+='top: auto !important;\
                      bottom:0px !important;\
                      right: 10px !important;\
                      left: auto !important';
               break;
      case '2': css+='top:0px  !important;\
                      bottom:auto !important;\
                      right: 10px !important;\
                      left: auto !important';
               break;  
      case '3': css+='top:0px  !important;\
                      bottom:auto !important;\
                      right: auto !important;\
                      left: 0px !important';
               break;                 
   }
   css+='}';
   return css;
}


/* USERS */
function vkProccessLinks(el){
 var tstart=unixtime();
 el=(el)?el:ge('content');//document
    var nodes=el.getElementsByTagName('a'); 
    for (var i=0;i<nodes.length;i++){  
      if (getSet(10)=='y') vkProcessUserLink(nodes[i]);
	  if (getSet(8)=='y')  ProcessUserPhotoLink(nodes[i]);
	  if (getSet(6)=='y')  ProcessAwayLink(nodes[i]);
	  if (getSet(38)=='y') ProcessHighlightFriendLink(nodes[i]);
     if (getSet(55)=='y') vkProcessIMDateLink(nodes[i]);
     if (getSet(58)=='y') vkProcessTopicLink(nodes[i]);
	  vk_plugins.processlink(nodes[i]);
    }
 vklog('ProcessLinks time:' + (unixtime()-tstart) +'ms');
}



function ProcessAwayLink(node){
  if (node.href && node.href.indexOf('away.php?')!=-1){ 
	var lnk=vkLinksUnescapeCyr(node.href).split('?to=')[1];
  if (!lnk) return;
	node.href=lnk.replace(/%26/gi,'&').replace(/%3A/gi,':').replace(/%2F/gi,'/').replace(/%25/gi,'%').replace(/%3F/gi,'?').replace(/%3D/gi,'=').replace(/%26/gi,';').replace(/&h=[\da-z]{18}/i,'');
	//alert(unescape(node.href));
  }
}


/* FRIENDS */
function vkFriendsPage(){
	vkFriendsBySex(true);
	vkCheckFrLink();
   vkFrNotInListsLink();
}
/* PUBLICS */
function vkPublicPage(){
	addFakeGraffItem();
}
/* EVENTS */
function vkEventPage(){
	addFakeGraffItem();
}
/* GROUPS */
function vkGroupPage(){
	addFakeGraffItem();
	vkCheckGroupAdmin();
   vkAudioBlock();
}
function vkGetGid(){
	if (!window.cur || cur.oid>0) return false;
	var gid=null;
	if (cur.gid || cur.oid<0) 
		gid=(cur.oid?Math.abs(cur.oid):cur.gid);
	if (!gid && cur.topic && cur.topic.match(/-(\d+)_/)) 
		gid=cur.topic.match(/-(\d+)_/)[1];
	if (!gid && cur.pvListId && cur.pvListId.indexOf('album-')!=-1) 
		gid=cur.pvListId.match(/album-(\d+)/)[1];
	return gid;
}
function isGroupAdmin(gid){
	if (gid || cur.gid || cur.oid<0){
		if (!gid) gid=-(cur.oid?Math.abs(cur.oid):cur.gid);
		var r="vk_adm_gr_"+remixmid();
		var val=','+vkGetVal(r)+',';
		if (val.indexOf(','+(gid || cur.oid)+',')!=-1) return true;
		else return false;
	} else return false;
}
function vkCheckGroupAdmin(){
	var r="vk_adm_gr_"+remixmid();
	var val=vkGetVal(r);
	var add=function(s){
		if ((','+val+',').indexOf(',' + s + ',') != -1) return;
		val+=','+s;
      val=val.replace(/^,+|,+$/g, '');
		vkSetVal(r,val);
	}
	var del=function(s){
		val+=(','+val+',').replace(','+s+',',',');
		val=val.replace(/^,+|,+$/g, '');
		vkSetVal(r,val);	
	}
	if (ge('page_actions')){
		var h=ge('page_actions').innerHTML;
		if (h.indexOf('?act=edit')!=-1 && !isGroupAdmin()){
			add(cur.oid);
			add(nav.objLoc[0]);	
		} 
		if (h.indexOf('?act=edit')==-1 && isGroupAdmin()){
			del(cur.oid);
			del(nav.objLoc[0]);
		}
	}
}

/* COMMON.JS */

function vkAjaxNavDisabler(strLoc){
	if (strLoc.indexOf('ATTRIBUTE_NODE')>-1) return true;
	var regex=/(video.+section=search|video-?\d+_\d+|photo-?\d+_\d+)/;
	var exc= strLoc.match(regex) || nav.strLoc.match(regex);
	if(getSet(5)=='y' && !exc){
		location.href='/'+strLoc;
		return true;
	} else {
		return false;
	}
}
function vkCommon(){
    if (getSet(6)=='y'){
		goAway=function(lnk,params){document.location=lnk; return false;};
		confirmGo=goAway;
	}
	
	//Inj.After('ajax._receive','html});','vkProcessOnReceive(h);'); // хук на функцию, которая и так сама по себе большой шиздец. надо что то другое придумать...
	//Inj.Replace('ajax.framepost',' done',' function(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10){done(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10); setTimeout("vkProcessNode(); ",50);}'); //alert(\'qwe\');
		
	Inj.Start('ajax.framegot','if (h) h=vkProcessOnFramegot(h);');
	Inj.Before('ajax._post','o.onDone.apply','vkResponseChecker(answer,url,q);');// если это будет пахать нормально, то можно снести часть инъекций в другие модули.
	
	Inj.Before('nav.go',"var _a = window.audioPlayer;","if (strLoc) if(vkAjaxNavDisabler(strLoc)){return true;}");
	
	Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
	Inj.End('nav.setLoc','setTimeout("vkOnNewLocation();",2);');
	
	//if (window.setFavIcon) Inj.Try('setFavIcon');

}

function vkProcessOnFramegot(h){ if (h && h.indexOf('vk_usermenu_btn')==-1 && h.indexOf('vkPopupAvatar')==-1) return vkModAsNode(h,vkProcessNodeLite); }
function vkProcessOnReceive(h){	if (h.innerHTML && h.innerHTML.indexOf('vk_usermenu_btn')==-1 && h.indexOf('vkPopupAvatar')==-1) {	vkProcessNode(h);}}

function vkResponseChecker(answer,url,q){// detect HTML in response and prosessing
	//var rx=/div.+class.+[^\\]"/;
	//var nrx=/['"]\+.+\+['"]/;
	//var nrx=/(document\.|window\.|join\(.+\)|\.init|[\{\[]["']|\.length|[:=]\s*function\()/;
	var _rx=/^\s*<(div|table|input|a)/;
	for (var i=0;i<answer.length;i++){
		//if (typeof answer[i]=='string') alert(answer[i].match(_rx)+'\n\n'+answer[i]);
		if (typeof answer[i]=='string' && _rx.test(answer[i]) ){
			answer[i]=vkModAsNode(answer[i],vkProcessNodeLite,url,q);//+'<input name="vkoptmarker" type="hidden" value=1>';	
		}
	}
  vkProcessResponse(answer,url,q);
  vk_plugins.process_response(answer,url,q);
}

function vkProcessResponse(answer,url,q){
  if (url=='/photos.php' && q.act=="a_choose_photo_box") vkPhChooseProcess(answer,url,q);
  if (url=='/video.php' && q.act=="a_choose_video_box") vkVidChooseProcess(answer,url,q);
  if ((url=='/audio' || url=='/audio.php') && q.act=="a_choose_audio_box") vkAudioChooseProcess(answer,url,q);
  if (url=='/al_friends.php' && q.act=='add_box') answer[1]=answer[1].replace('"friends_add_block" style="display: none;"','"friends_add_block"');
  if(url=='/al_groups.php' && q.act=='people_silent') {
   if(answer[0].members)  answer[0].members = vkModAsNode(answer[0].members,vkProcessNodeLite,url,q);
   if(answer[0].requests) answer[0].requests = vkModAsNode(answer[0].requests,vkProcessNodeLite,url,q);
  if(answer[0].invites) answer[0].invites = vkModAsNode(answer[0].invites,vkProcessNodeLite,url,q);
  if(answer[0].admins) answer[0].admins = vkModAsNode(answer[0].admins,vkProcessNodeLite,url,q);
  }
}

function vkPhChooseProcess(answer,url,q){
//*
  vkCheckPhotoLinkToMedia=function(){
    var btn=ge('vk_link_to_photo_button');
    var val=ge('vk_link_to_photo').value.match(/photo(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      cur.chooseMedia('photo', val[1]+'_'+val[2],['', '', '', '{temp: {x_src: ""}, big: 1}']);//['http://cs5751.vk.com/u13391307/138034142/m_a6b31fd8.jpg', 'http://cs5751.vk.com/u13391307/138034142/s_818dc071.jpg', '9b949405dd303694e1', '{temp: {x_src: "http://cs5751.vk.com/u13391307/138034142/x_c8cae130.jpg"}, big: 1}']
    } else {
      alert(IDL('IncorrectPhotoLink'))
    }
    unlockButton(btn);
  };
  if (answer[1].indexOf('vk_link_to_photo')==-1){
  var div=vkCe('div',{},answer[1]);
  var ref=geByClass('summary',div)[0];
  if (ref){
    var node=vkCe('div',{"class":'ta_r','style':"height: 25px; padding-left:10px; padding-top:4px;"},'\
    <div class="fl_l">\
        '+IDL('EnterLinkToPhoto')+': \
      <span><input id="vk_link_to_photo" type="text"  style="width:230px"></span>\
      <div id="vk_link_to_photo_button" class="button_blue"><button onclick="vkCheckPhotoLinkToMedia();">'+IDL('OK')+'</button></div>\
    </div>\
    ');
    ref.parentNode.insertBefore(node,ref);
    ref.parentNode.insertBefore(vkCe('h4'),ref);
    answer[1]=div.innerHTML;
  }
  }
//*/  
}

function vkVidChooseProcess(answer,url,q){
//*
  vkCheckVideoLinkToMedia=function(){
    var btn=ge('vk_link_to_video_button');
    var val=ge('vk_link_to_video').value.match(/video(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      cur.chooseMedia('video', val[1]+'_'+val[2], 'http://vk.com/images/video_s.png');
    } else {
      alert(IDL('IncorrectVideoLink'))
    }
    unlockButton(btn);
  };
  if (answer[1].indexOf('vk_link_to_video')==-1){
  var div=vkCe('div',{},answer[1]);
  var ref=geByClass('summary',div)[0];
  if (ref){
    var node=vkCe('div',{"class":'ta_r','style':"height: 25px; padding-left:10px; padding-top:4px;"},'\
    <div class="fl_l">\
        '+IDL('EnterLinkToVideo')+': \
      <span><input id="vk_link_to_video" type="text"  style="width:230px"></span>\
      <div id="vk_link_to_video_button" class="button_blue"><button onclick="vkCheckVideoLinkToMedia();">'+IDL('OK')+'</button></div>\
    </div>\
    ');
    ref.parentNode.insertBefore(node,ref);
    ref.parentNode.insertBefore(vkCe('h4'),ref);
    answer[1]=div.innerHTML;
  }
  }
//*/  
}

function vkAudioChooseProcess(answer,url,q){
  vkCheckAudioLinkToMedia=function(){
    var btn=ge('vk_link_to_audio_button');
    var val=ge('vk_link_to_audio').value.match(/audio(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      cur.chooseMedia('audio', val[1]+'_'+val[2], [val[1], val[2]]);//[artist,name]
    } else {
      alert(IDL('IncorrectAudioLink'))
    }
    unlockButton(btn);
  };
  if (answer[1].indexOf('vk_link_to_audio')==-1){
  var div=vkCe('div',{},answer[1]);
  var ref=geByClass('summary',div)[0];
  if (ref){
    var node=vkCe('div',{"class":'ta_r','style':"height: 25px; padding-left:10px; padding-top:4px;"},'\
    <div class="fl_l">\
        '+IDL('EnterLinkToAudio')+': \
      <span><input id="vk_link_to_audio" type="text"  style="width:230px"></span>\
      <div id="vk_link_to_audio_button" class="button_blue"><button onclick="vkCheckAudioLinkToMedia();">'+IDL('OK')+'</button></div>\
    </div>\
    ');
    ref.parentNode.insertBefore(node,ref);
    ref.parentNode.insertBefore(vkCe('h4'),ref);
    answer[1]=div.innerHTML;
  }
  }  
}
   

/* IM */
function vkImPage(){
   vkImAddPreventHideCB();
}

function vkProcessIMDateLink(node){
   if (node.className=='im_date_link'){
      var inp=vkNextEl(node); 
      var ts=0;
      var fmt=(node.parentNode && node.parentNode.parentNode && hasClass(node.parentNode.parentNode,'im_add_row'))?'HH:MM:ss':'d.mm.yy HH:MM:ss';
      if (inp && (ts=parseInt(inp.value)))  node.innerHTML=(new Date(ts*1000)).format(fmt); 
   }
}

function vkImAddPreventHideCB(){
   Inj.Wait('cur.imMedia',function(){
      var p=geByClass('rows', cur.imMedia.menu.menuNode)[0];
      var html='<div class="checkbox" id="vk_no_hide_add_box" onclick="checkbox(this); window.vk_prevent_addmedia_hide=isChecked(this);">'+
                  //'<div></div>'+IDL('PreventHide')+
                   '<table style="border-spacing:0px;"><tr><td><div></div></td>\
                        <td>\
                          <nobr>'+IDL('PreventHide')+'</nobr>\
                        </td>\
                      </tr>\
                    </tbody>\
                   </table>'+
               '</div>';
      var id='add_media_type_' +  cur.imMedia.menu.id + '_nohide';
      if (!ge(id)){
         var a=vkCe('a',{id:id,'style':'border-top:1px solid #DDD; padding:2px; padding-top:4px;'},html);
         p.appendChild(a);
      }
      Inj.Before(' cur.imMedia.onChange','boxQueue','if (!window.vk_prevent_addmedia_hide)');
   });
}


function vkIM(){
	Inj.Before('IM.addTab','cur.tabs','vkProcessNodeLite(txtWrap);');

   if (getSet(51)=='y'){
      Inj.Replace('IM.wrapFriends',/text\.push\(/g,'vkIMwrapFrMod(text,');
      Inj.Replace('IM.wrapFriends','text.join(','vkIMwrapFrModSort(text,');   
   }
}

function vkIMwrapFrModSort(text){
   mysort=function(a,b){
      if (String(a).indexOf('im_friend')!=-1 && String(b).indexOf('im_friend')!=-1){
         var at=(String(a).indexOf('vk_faved_user')!=-1);
         var bt=(String(b).indexOf('vk_faved_user')!=-1);
         if (at && bt) return 0;
         if (at && !bt) return -1;
         if (!at && bt) return 1;
      }
      return 0;
   }
   text.sort(mysort);
   return text.join('');
}

function vkIMwrapFrMod(){
   var text=arguments[0];
   var args=[];
   if (arguments.length>2){
      for (var i=1; i<arguments.length;i++) args.push(arguments[i]);
      if (vkIsFavUser(args[3])) args[1]+=' vk_faved_user';
      text.push(args.join(''));
   } else {
      text.push(arguments[1]);
   }
}

/* NOTIFIER */
function vkNotifier(){
	if(getSet(36)=='y'){
		vk_allow_autohide_notify=false;
		Inj.Before('Notifier.showEvent','ev.fadeTO','if (vk_allow_autohide_notify)');
		Inj.Before('Notifier.unfreezeEvents','this.fadeTO','if (vk_allow_autohide_notify)'); 
		
		Inj.Before('Notifier.onInstanceFocus','Notifier.hideEvent','if (vk_allow_autohide_notify)');
		Inj.Before('Notifier.onInstanceFocus','curNotifier.q_events = []','if (vk_allow_autohide_notify)');
		Inj.Before('Notifier.onInstanceFocus','curNotifier.q_shown = []','if (vk_allow_autohide_notify)');
		
		Notifier.unfreezeEvents=Notifier.freezeEvents;
	}
	if (getSet(48)=='y'){
		Inj.Wait('window.curNotifier && window.curNotifier.sound',function(){
			curNotifier.sound=new Sound2('New');
			curNotifier.sound_im=new Sound2('Msg');
		});
      vkNotifyCustomSInit();
	}
   if (getSet(51)=='y') Inj.Replace('FastChat.clistRender','html.push(','vkFavChekUserAndToArray(mid,html,');
   //Inj.Before('FastChat.clistRender','FastChat.clistUpdateTitle','vkProccessLinks(curFastChat.el.clist);');
   Inj.Before('Notifier.lpCheck','var response','if (!text || text=="") return;'); //error fix?
	 /* delay for hide notify msg
	  vk_notifier_show_timeout=20000;
	  //Inj.Replace('Notifier.showEventUi','5000','vk_notifier_show_timeout');
	  Inj.Replace('Notifier.showEvent','5000','vk_notifier_show_timeout');
	  Inj.Replace('Notifier.unfreezeEvents','5000','vk_notifier_show_timeout');
	  */
}

/* PAGES.JS */
function vkPage(){
	/*if (!window.wall) return;
	Inj.Before('wall.receive','var current','vkProcessNode(n);');
	Inj.End('wall._repliesLoaded','vkProcessNode(r);');*/
}
/* FEED */
function vkFeed(){
	//Inj.After("feed.showMore",/au.innerHTML.+rows;/,'vkProcessNode(au);');
}
function vkFeedPage(){
	vkSortFeedPhotos();
}
function vkSortFeedPhotos(node){
	if (getSet(42)!='y' || nav.objLoc[0]!='feed') return;
	var tstart=unixtime();
	var fnodes=geByClass('post_media',node);
	var re=/photo-?\d+_(\d+)/;
	for (var z=0; z<fnodes.length; z++){
		var node=fnodes[z];
		var nodes=geByClass('page_media_thumb',node); 
		var narr=[];
		for(var i=0;i<nodes.length;i++){ 
			var p=nodes[i].getElementsByTagName('a')[0];
         if (!p || !p.href) continue;
			var pid=p.href.match(re);
			if (pid) narr.push([nodes[i],pid[1]]);
		}
		var sf=function(a,b){
			if (a[1]<b[1]) return 1;
			else if (a[1]>b[1]) return -1;
			else return 0;
		}
		narr.sort(sf);
		for(var i=0;i<narr.length;i++) node.appendChild(narr[i][0]);
	}
	vklog('Sort feed photos time:' + (unixtime()-tstart) +'ms');
}
/* FRIENDS */
function vkFriends(){
	Inj.Before('Friends.showMore','cur.fContent.appendChild',"html=[vkModAsNode(html.join(''),vkProcessNode)];");
   //Inj.Replace('Friends.acceptRequest','text;','text+vkFrLstSel(mid); alert(text);');
   Inj.Replace('Friends.acceptRequest','text;','vkFrReqDoneAddUserLists(text,mid);');
}
function vkFrLstSel(mid){ return '<div class="actions"><a class="lists_select" onmousedown="return Friends.ddShow('+mid+', this, event)">'+IDL('AddFrToList')+'</a></div>'; }
function vkFrReqDoneAddUserLists(text,mid){
   var div=vkCe('div',{},text);
   var el=geByClass('friends_added',div)[0];
   //var mid=text.match(/friends_added_(\d+)/);
   //mid = mid?mid[1]:0;
   if (el && mid && cur.userLists){
      el.innerHTML+='<div class="friends_added_text box_controls_text">'+IDL('AddFrToList')+'</div>';
      for (var key in cur.userLists) el.innerHTML+='<div class="checkbox" onclick="return Friends.checkCat(this, '+mid+', '+key+', 1);"><div></div>'+cur.userLists[key]+'</div>';    
      return div.innerHTML;
   } else {
      return text+'<br><small>add user lists error</small>';
   }
}

function vkModAsNode(text,func,url,q){ //url,q - for processing response 
	var is_table=text.substr(0,3)=='<tr';
	var div=vkCe(is_table?'table':'div');
	div.innerHTML=text;
	func(div);
   vkProcessResponseNode(div,url,q);
	var txt=div.innerHTML;
	if (is_table && txt.substr(0,7)=="<tbody>")	txt=txt.substr(7,txt.length-15);
	return txt;
}

/* SEARCH */
function vkSearch(){
	//Inj.Before('searcher.showMore',"ge('results')","rows=vkModAsNode(rows,vkProcessNodeLite);");
	//Inj.Before('searcher.sendSearchReq',"ge('results')","rows=vkModAsNode(rows,vkProcessNodeLite);");
}
/* PHOTOS */
function vkPhotoViewer(){
  //main inj
  //Inj.End('photoview.receiveComms','vkProcessNode(comms);');
  Inj.Before('photoview.doShow','cur.pvNarrow','ph.comments=vkModAsNode(ph.comments,vkProcessNode); if(ph.tagshtml) ph.tagshtml=vkModAsNode(ph.tagshtml,vkProcessNode);');
  Inj.Before('photoview.doShow','var likeop','vkProcessNode(cur.pvNarrow);');
  Inj.Before('photoview.doShow','+ (ph.actions.del','+ vkPVLinks(ph) + vk_plugins.photoview_actions(ph) ');
  if (getSet(7)=='y') Inj.Start('photoview.afterShow','vkPVMouseScroll();');
  
  vkPVNoCheckHeight=function(){return !window.PVShowFullHeight};
  
  Inj.Before('photoview.onResize','cur.pvCurrent.height * c >','vkPVNoCheckHeight() && ');
  Inj.Before('photoview.doShow','h * c > ','vkPVNoCheckHeight() && ');
  Inj.End('photoview.afterShow','vkPVAfterShow();');
  
  if (nav.strLoc.match(/photo-?\d+_\d+/))  { 
    setTimeout(photoview.doShow,70);
  }
}

function vkPVAfterShow(){
	vkPVChangeView=function(){
		window.PVShowFullHeight=!window.PVShowFullHeight;
		photoview.onResize();
	}
	if (ge('pv_summary')) ge('pv_summary').setAttribute('onclick','vkPVChangeView()');
}

function vkPVMouseScroll(img){
    vkPVAllowMouseScroll=true;
    var on_scroll=function(is_next,ev){
      if (vkPVAllowMouseScroll && isVisible('pv_right_nav') && isVisible('pv_left_nav')){
        //(is_next?ge('pv_right_nav'):ge('pv_left_nav')).onmousedown(event);
		
		//ev.keyCode=is_next?KEY.RIGHT:KEY.LEFT; photoview.onKeyDown(ev);
		
		if (!cur.pvTagger && !boxQueue.count() && (!cur.pvComment || !cur.pvComment.focused)) {
		  if (is_next) {
			photoview.show(cur.pvListId, cur.pvIndex + 1);
		  } else {
			photoview.show(cur.pvListId, cur.pvIndex - 1);
		  }
		}
		/*photoview.show(false, is_next?(cur.pvIndex - 1 + vk.rtl * 2):(cur.pvIndex + 1 - vk.rtl * 2), ev); 
		cur.pvClicked = true;
		vk_ev=ev;*/

        vkPVAllowMouseScroll=false;
        setTimeout("vkPVAllowMouseScroll=true",200);
      }
    };
    var _next=function(e){on_scroll(1,e)};
    var _prev=function(e){on_scroll(0,e)};
    vkSetMouseScroll(ge("pv_photo"),_next,_prev);
    
}
function vkPVLinks(ph){
  var html='';
  if (ph.y_src){
    html+='<div id="pv_hd_links"><a href="#" onclick="return false" class="fl_l">'+IDL('Links')+': </a>'+  
        (ph.y_src?'<a href="'+ph.y_src+'" class="fl_r">HD1</a>':'')+
        (ph.z_src?'<a href="'+ph.z_src+'" class="fl_r">HD2</a>':'')+
        (ph.w_src?'<a href="'+ph.w_src+'" class="fl_r">HD3</a>':'')+
    '</div><div class="clear"></div>';
  } 
  html+='<a href="#" onclick="vkPhotoUrlUpload(\''+(ph.w_src || ph.z_src || ph.y_src || ph.x_src)+'\'); return false;">'+IDL('Add')+'</a>'
  html+=ph.x_src?'<a target="_blank" href="http://www.tineye.com/search?url='+(ph.w_src || ph.z_src || ph.y_src || ph.x_src)+'">'+IDL('TinEyeSearch')+'</a>':'';
  return html;
}

function vkPhotosPage(){
	if (nav.objLoc[0].indexOf('albums')!=-1){
      vkAddAlbumCommentsLinks();
   } else if (nav.objLoc[0].indexOf('album')!=-1){
		
      var m=nav.objLoc[0].match(/album(-?\d+)_(\d+)/);
		if(m /*&& ! /album\d+_00/.test(nav.objLoc[0])*/){	
			var oid=m[1];
			var aid=m[2];
			if (!ge('vk_album_actions')){			
				
				var li=vkCe('li',{id:'vk_album_actions',"class":'t_r'},'\
					<a href="#" onclick="return false;"  id="vk_album_act_menu" class_="fl_r summary_right">'+IDL('Actions')+'</a>\
					'+(geByClass('summary_right')[0]?'<span class="divide">|</span>':'')+'\
				');
				geByClass('t0')[0].appendChild(li);
				
				var p_options = [];
				if (!vkbrowser.chrome && !vkbrowser.safari)
					p_options.push({l:IDL('SaveAlbumAsHtml'), onClick:function(item) {
						vkGetPageWithPhotos(oid,aid);
					}});
				p_options.push({l:IDL('Links'), onClick:function(item) {
						vkGetLinksToPhotos(oid,aid);
				}});
				
				p_options=p_options.concat(vk_plugins.album_actions(oid,aid));
				stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
					cur.vkAlbumMenu = new DropdownMenu(p_options, {//
					  target: ge('vk_album_act_menu'),
					  containerClass: 'dd_menu_posts',
					  updateHeader:false,
					  offsetLeft:-15,
					  showHover:false
					});
				});			
			}								
		}
	}
}
//javascript: vkGetPageWithPhotos(13391307,42748479); void(0);
function vkGetLinksToPhotos(oid,aid){  
	var MakeLinksList=function(phot){
		var parr=[]; 
		for (var i=0;i<phot.length;i++)
		  parr.push('<a href="'+phot[i].max_src+'">'+phot[i].max_src+'</a>');
		return parr;
	}
	if (!ge('vk_links_container')){
		var div=vkCe('div',{id:"vk_links_container","class":"clear_fix",style:"padding:10px;"},'<center>'+vkBigLdrImg+'</center>');
		var ref=ge('photos_container')
		ref.parentNode.insertBefore(div,ref);
	} else var div=ge('vk_links_container');
	vkApis.photos_hd(oid,aid,function(r){
		div.innerHTML=MakeLinksList(r).join('<br>')+
				'<div class="vk_hide_links" style="text-align:center; padding:20px;">\
					<a href="#" onclick="re(\'vk_links_container\'); return false;">'+IDL('Hide')+'</a>\
				</div>';
	},function(c,f){
		if (!f) f=1;
		ge('vk_links_container').innerHTML=vkProgressBar(c,f,600);
		//document.title=c+"/"+f
	});
}

function vkGetPageWithPhotos(oid,aid){  
  var MakeImgsList=function(phot){
    var parr=[]; 
    for (var i=0;i<phot.length;i++)
      parr.push('<img src="'+phot[i].max_src+'">');
    return parr;
  }
	var box=new MessageBox({title: IDL('SavingImages'),width:"350px"});
	box.removeButtons();
	box.addButton(box_close,box.hide,'no'); // IDL('Cancel')
	box.content('<div id="ph_ldr_progress"><center>'+vkBigLdrImg+'</center></div>').show();
	
    vkApis.photos_hd(oid,aid,function(r){
		vkImgsList=MakeImgsList(r).join('<br>');
		if (!vkImgsList.length)
			var html='<h4>No images</h4>'
		else {
			vkImgsList='<div style="background:#FFB; border:1px solid #AA0;  margin:20px; padding:20px;">'+IDL('HtmlPageSaveHelp')+'</div>'+vkImgsList;
			var html='<h4><a href="#" onclick="vkWnd(vkImgsList,\''+document.title.replace(/'"/g,"")+'\'); return false;">'+IDL('ClickForShowPage')+'</a></h4>';
		}
		box.content(html).show();
    },function(c,f){
		if (!f) f=1;
		ge('ph_ldr_progress').innerHTML=vkProgressBar(c,f,310);
	});
}

function vkAddAlbumCommentsLinks(node){
   var els=geByClass('album',node);
   for (var i=0;i<els.length;i++){
      var el=geByClass('info_wrap',els[i])[0];
      var id=els[i].id?els[i].id:el.innerHTML.match(/album-?\d+_\d+/);
      el.innerHTML+='<a class="fl_r" href="/'+id+'?act=comments" onclick="return nav.go(this, event)">'+IDL('komm',1)+'</a>';
   }
}

var VKPRU_SWF_LINK='http://cs4320.vk.com/u13391307/ac8f5bbe4ce7a8.zip';
function vkPhotoUrlUpload(url){
	PRUBox = new MessageBox({title: IDL('PhotoUpload'),width:"290px"});
	var Box = PRUBox;
	
	vk_vkpru_on_debug=function(msg){
		vklog(msg);
	};
	vk_vkpru_on_done=function(pid,aid){
		Box.hide();
		vkSetVal('vk_pru_album',aid);
		vkMsg('<a href="/'+pid+'">'+IDL('PhotoUploaded')+': '+pid+'</a>',3000);
	};
	vk_vkpru_on_init=function(){
		hide('vkpruldr');
		Box.setOptions({});
		disableRightClick(ge('prucontainer'));
	}	
		
	var html = '<div><span id="vkpruldr"><div class="box_loader"></div></span>'+
             '<div id="prucontainer" style_="display:inline-block;position:relative;top:8px;"></div>'+
             '</div>';

	vkOnSavedFile=function(){Box.hide(200);};
	Box.removeButtons();
	Box.addButton(IDL('Cancel'),Box.hide,'no');
	Box.content(html).show(); 
	Box.setOptions({});
	var domain=location.href.match(/vk\.com|vkontakte\.ru/)[0];
	dApi.call('photos.getAlbumsCount',{},function(){
		var flashvars = {
			api_id:dApi.api_id,
			viewer_id:vkgetCookie('dapi_mid'),
			user_id:vkgetCookie('dapi_mid'),
			api_url:'http://api.'+domain+'/api.php',
			api_sid:vkgetCookie('dapi_sid'),
			api_secret:vkgetCookie('dapi_secret'),
			image_url: url,
			album_id:vkGetVal('vk_pru_album') || 0,
			onFlashReady:"vk_vkpru_on_init", 
			onUploadComplete:"vk_vkpru_on_done", 
			onDebug:"vk_vkpru_on_debug",
      "lang.button_upload":IDL('puUploadImageBtn'),
      "lang.choice_album":IDL('puChoiceAlbum'),
      "lang.loading_info":IDL('puLoadingInfoWait')
			//,"lang.button_upload":'Загрузить фотографию'
		};
		var params={width:260, height:345, allowscriptaccess: 'always',"wmode":"transparent","preventhide":"1","scale":"noScale"};
		renderFlash('prucontainer',
			{url:VKPRU_SWF_LINK,id:"vkphoto_reuploader"},
			params,flashvars
		); 
	});
}
//vkPhotoUrlUpload('http://cs9543.vk.com/u3457516/124935920/w_5603bf45.jpg')

/* VIDEO */
function vkVideoViewer(){
	vkVidVarsGet();
	//Inj.End('videoview.receiveComms','vkProcessNode(comms);');
	Inj.Before('videoview.showVideo','mvcur.mvNarrow','vkProcessNode(mvcur.mvWide);');
	if (getSet(2)=='y') Inj.After('videoview.showVideo','innerHTML = info;','setTimeout(vkVidLinks,0);');
	//Inj.Replace('videoview.minimize','browser.safari || browser.chrome || browser.mozilla','true');
	videoview.enabledResize=function(){return true;}
}
function vkVidDownloadLinks(vars){
    // /video.php?act=a_flash_vars&vid=39226536_159441582
    ////
   var smartlink=(getSet(1) == 'y')?true:false;
   var vidname=winToUtf(mvcur.mvData.title).replace(/\?/g,'%3F').replace(/\&/g,'%26');
   vidname=vkCleanFileName(vidname);
   vidname='?'+vkDownloadPostfix()+'&/'+vidname;
   //(smartlink?vidname+'.mov')
	if (!vars) return '';
	var vuid=function (uid) { var s = "" + uid; while (s.length < 5) {s = "0" + s;}  return s; }
	var get_flv=function() {
		if (vars.sd_link != null && vars.sd_link.length > 0) {return vars.sd_link;}
		if (vars.uid <= 0) {
			return "http://" + vars.host + "/assets/videos/" + vars.vtag + "" + vars.vkid + ".vk.flv";
		}
		return vars.host + "u" + vuid(vars.uid) + "/video/" + vars.vtag + ".flv";
	}
	var pathToHD=function(res) {
		var s = (vars.host.substr(0, 4) == 'http')
		  ? vars.host
		  : 'http://cs' + vars.host + '.' + (vk.intnat ? 'vk.com' : 'vkontakte.ru') + '/';
		return s + 'u' + vars.uid + '/video/' + vars.vtag + '.' + res + '.mov';
	};
	var generateHDLinks=function(){
		var s="";
		var vidHDurl="";
		if ( parseInt(vars.hd)>0)
		  for (var i=1;i<=parseInt(vars.hd);i++){
			//vidHDurl=vkpathToHD(flash_vars,i);
			var res = "360";
			switch(i){case 2:{res = "480"; break;}  case 3:{  res = "720"; break;}}
			vidHDurl=pathToHD(res);
			s += (vidHDurl)?'<a href="'+vidHDurl+(smartlink?vidname+'.mov':'')+'" onmouseover="vkGetVideoSize(this);">'+IDL("downloadHD")+' '+res+'p<small class="fl_r divide" url="'+vidHDurl+'"></small></a>':"";   
		  }
		  return s;
	}
	vidurl=(vars.no_flv=='1')?pathToHD('240')+(smartlink?vidname+'.mov':''):(get_flv()+(smartlink?vidname+'.flv':''));
    vidurl =  '<a href="'+vidurl+'" onmouseover="vkGetVideoSize(this);">'+IDL("download")+'<small class="fl_r divide" url="'+vidurl+'"></small></a>';
    vidurl += generateHDLinks();
    //vidname
	return vidurl;
}

function vkVidDownloadLinksArray(vars){
    // /video.php?act=a_flash_vars&vid=39226536_159441582
	if (!vars) return '';
	var result=[];
	var vuid=function (uid) { var s = "" + uid; while (s.length < 5) {s = "0" + s;}  return s; }
	var get_flv=function() {
		if (vars.sd_link != null && vars.sd_link.length > 0) {return vars.sd_link;}
		if (vars.uid <= 0) return "http://" + vars.host + "/assets/videos/" + vars.vtag + "" + vars.vkid + ".vk.flv";
		return vars.host + "u" + vuid(vars.uid) + "/video/" + vars.vtag + ".flv";
	}
	var pathToHD=function(res) {
		var s = (vars.host.substr(0, 4) == 'http') ? vars.host : 'http://cs' + vars.host + '.' + (vk.intnat ? 'vk.com' : 'vkontakte.ru') + '/';
		return s + 'u' + vars.uid + '/video/' + vars.vtag + '.' + res + '.mov';
	};
	var generateHDLinks=function(){
		var s="";
		var vidHDurl="";
		if ( parseInt(vars.hd)>0)
		  for (var i=1;i<=parseInt(vars.hd);i++){
			var res = "360";
			switch(i){case 2:{res = "480"; break;}  case 3:{  res = "720"; break;}}
			vidHDurl=pathToHD(res);
			if (vidHDurl) result.push(vidHDurl);
		  }
		  return s;
	}
	result.push((vars.no_flv=='1')?pathToHD('240'):get_flv());
	generateHDLinks();
	return result;
}
function vkGetVideoSize(el){
	//if (getSet(43)!='y') return;
	var WAIT_TIME=4000;
	el=el.getElementsByTagName('small')[0];//ge("vk_asize"+id);
	if (el && !el.hasAttribute('getsize_ok')){
		el.setAttribute('getsize_ok',true);
		el.innerHTML=vkLdrMiniImg;
		var reset=setTimeout(function(){
			el.removeAttribute('getsize_ok');
			el.innerHTML='';
		},WAIT_TIME);
		XFR.post(el.getAttribute('url'),{},function(h,l){
			clearTimeout(reset);
			if (l>0){
				el.innerHTML=vkFileSize(l,2);
			} else {
				el.innerHTML='0 byte';
			}
			
		},true);	
	}
}

vkVidVars=null;
function vkVidVarsGet(){
	if (getSet(2)=='y'){
		var vivar=document.getElementsByTagName('body')[0].innerHTML.split('var vars = {')[1];
		if (vivar){
			vivar='{'+eval('"'+vivar.split('};')[0]+'"')+'}';
			vkVidVars=eval('('+vivar+')');
			setTimeout(vkVidLinks,300);
		} else {
			vkVidVars=null;
		}
	}
}
function vkVidLinks(data){	
	//'mvcur.mvData.hash'
	if (ge('mv_actions') && vkVidVars){
		var h=ge('mv_actions').innerHTML;
		ge('mv_actions').innerHTML+=vkVidDownloadLinks(vkVidVars); 
		ge('mv_actions').innerHTML+=vk_plugins.video_links(vkVidVars,vkVidDownloadLinksArray(vkVidVars));
		//if (h.indexOf('showTagSelector')!=-1){	ge('mv_actions').innerHTML+='<a href="#" onclick="vkTagAllFriends(); return false;">'+IDL("selall")+'</a>';	}
		
	}
}

function vkTagAllFriends(vid,hash){
	var FID_PER_REQ=10;
	var addTags=function(ids,callback) {
	  var actionCont = ge('mv_action_info');
	  show(actionCont);  
	  mv = mvcur.mvData;
	  ajax.post('al_video.php', {act: 'add_tags', video: mv.videoRaw, ids: ids.join(','), hash: mv.hash}, {onDone: function(info, tagsList) {
		ge('mv_action_info').innerHTML = info;	ge('mv_tags_list').innerHTML = tagsList;(tagsList ? show : hide)('mv_tags');(info ? show : hide)('mv_action_info');	videoview.recache(mv.videoRaw);
		callback();
	  }});
	};
	var fids=[];
	var cur_offset=0;
	var add=function(){	
		var del_count=fids.length;
		var ids_part=fids.slice(cur_offset,cur_offset+FID_PER_REQ);
		if (ids_part.length==0) vkMsg(IDL('Done'),2000);
		else {
			ge('mv_action_info').innerHTML=vkProgressBar(cur_offset,del_count,310,ids_part+' %');
			addTags(ids_part,function(){cur_offset+=FID_PER_REQ; setTimeout(add,300); });
		}
	};
	var actionCont = ge('mv_action_info');
	actionCont.innerHTML = '<img src="/images/upload.gif" />';  
	show(actionCont); 
	vkFriendsIdsGet(function(all_ids){	fids=all_ids;	add();	});
}

/* AUDIO */
function vkAudios(){		
	if (getSet(0)=='y'){
		if (cur.audioTpl){ 
		Inj.After('cur.audioTpl','id="play\'+aid+\'"></div></a>',"'+vkAudioDownBtn(audio)+'");
		Inj.After('cur.audioTpl',"author+'</span>","'+vkAudioSizeLabel(audio)+'");
		Inj.Replace('cur.audioTpl','audio[4]','vkAudioDurSearchBtn(audio)');
		}
		Inj.After('Audio.searchRequest',/cur.sPreload.innerHTML.+preload;/i,'vkAudioNode(cur.sPreload);');
		Inj.After('Audio.searchRequest',/cur.sContent.innerHTML.+res;/i,'vkAudioNode(cur.sContent);');
		Inj.Before('Audio.loadRecommendations','if (json)','if (rows) rows=vkModAsNode(rows,vkAudioNode); if(preload) preload=vkModAsNode(preload,vkAudioNode); ');
	}
}
function vkAudioPage(){
	vkAudioPlayList(true);
	vkAudioDelDup(true);
}
function vkAudioEditPage(){
	vkCleanAudioLink();
}

function vkCleanAudioLink(){
	if (!ge('vk_clean_audios') && ge('audio_actions')){
		ge('audio_actions').innerHTML+='<span class="divide">|</span><a id="vk_clean_audios" href="#" onclick="vkCleanAudios(); return false;">'+IDL('DelAll')+'</a>';
	}
}

function vkCleanAudios(){
	var REQ_CNT=100;
	var WALL_DEL_REQ_DELAY=400;
	var box=null;
	var mids=[];
	var del_offset=0;
	var abort=false;	
	var deldone=function(){
			box.hide();
			vkMsg(IDL("ClearDone"),3000);	
	};
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %');
		var aid=mids[del_offset];
		if (!aid){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		dApi.call('audio.delete', {oid:cur.oid,aid:aid},function(r,t){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
		ge('vk_scan_msg').innerHTML=vkProgressBar(0,2,310,IDL('listreq')+' %');
		var params={};
		params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);
		dApi.call('audio.get',params,function(r){
			if (abort) return;
			var ms=r.response;
			if (!ms.length){
				deldone();
				return;
			}
			ge('vk_scan_msg').innerHTML=vkProgressBar(2,2,310,IDL('listreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].aid);
			vklog(mids);
			del(deldone);	
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DelAudios'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
	vkAlertBox(IDL('DelAudios'),IDL('DelAllAutiosConfirm'),run,true);
}
vkAudioEd = {
   Delete:function(id,aid,el){
    var el = ge('audio' + aid);
    var h = getSize(geByClass1('play_btn', el))[1];
    stManager.add(['audio_edit.js']);
    ajax.post(Audio.address, {act: 'delete_audio', oid: cur.oid, aid: id, hash: cur.hashes.delete_hash, restore: 1}, {
      onDone: function(text, delete_all) {
        cur.deleting = false;
        if (!cur.deletedAudios) cur.deletedAudios = [];
        cur.deletedAudios[id] = ge('audio'+aid).innerHTML;
        text=text.replace(/AudioEdit.restoreAudio\(\d+\)/,'vkAudioEd.Restore('+id+',\''+aid+'\')');
        el.innerHTML = text;
        h=30;
        setStyle(geByClass1('dld', el), {height: h+'px'});
        //el.style.cursor = 'auto';
        //el.setAttribute('nosorthandle', '1');
        if (delete_all) {
          cur.summaryLang.delete_all = delete_all;
        }
        cur.audiosIndex.remove(cur.audios[id]);
        cur.audios[id].deleted = true;
        cur.sectionCount--;
        Audio.changeSummary();
        
      }
    });
    return false;
   },
   Restore: function(id,aid) {
    if (cur.restoring) {
      return;
    }
    cur.restoring = true;
    var el = ge('audio' + aid);
    ajax.post(Audio.address, {act: 'restore_audio', oid: cur.oid, aid: id, hash: cur.hashes.restore_hash}, {
      onDone: function(text) {
        cur.restoring = false;
        el.innerHTML = cur.deletedAudios[id];
        //el.style.cursor = 'move';
        //el.removeAttribute('nosorthandle');
        cur.audiosIndex.add(cur.audios[id]);
        cur.audios[id].deleted = false;
        cur.sectionCount++;
        Audio.changeSummary();
      }
    });
  }
}


function vkParseAudioInfo(_aid,node,anode){
    //var _a=audioPlayer;
	
	var info=null;
    if (window.audioPlaylist && audioPlaylist[_aid]) {
      info = audioPlaylist[_aid];
    } else {
      var sr=/<\/?span>/ig;
	  var a_node = anode || ge('audio'+_aid) || $x(".//div[@id='audio" + _aid + "']", node)[0];
	  //var t_node=ge('title'+_aid) || $x(".//span[@id='title" + _aid + "']", node)[0];
	  var a_info=a_node.getElementsByTagName('input')[0];//ge('audio_info'+_aid) || $x(".//input[@id='audio_info" + _aid + "']", node)[0];
	  
	  var art, title, nfo = geByClass1('info', a_node);
      art = geByTag1('b', nfo);
      l = geByTag1('a', art);
      if (l) art = l;
	  art = art.innerHTML.replace(sr,'');
      title = geByClass1('title', nfo);
      if (!title) title = ge('title'+_aid) || $x(".//span[@id='title" + _aid + "']", node)[0];//t_node;
      l = geByTag1('a', title);
      if (l) title = l.innerHTML;
      else title = title.innerHTML;
      title = title.replace(sr,'');
      dur = geByClass1('duration', nfo).innerHTML;
      var data=a_info.value.split(',');
      var url=data[0];
      var duration=parseInt(data[1]);
      data = _aid.split('_');
      var uid = data[0];
      var aid = data[1];
      info = {0: uid, 1:aid, 2:url, 3:duration, 4:dur, 5: art, 6:title, node:a_node};
    }
	return info;
}


function vkAudioNode(node){
  if ((node || ge('content')).innerHTML.indexOf('play_new')==-1) return;
  var smartlink=(getSet(1) == 'y')?true:false;
  var download=(getSet(0) == 'y')?1:0;
  if (!download) return;
  var SearchLink=true;
  var trim=function(text) { return (text || "").replace(/^\s+|\s+$/g, ""); }
  //InitAudiosMenu();
  var icon_src='data:image/gif;base64,R0lGODdhEAARALMAAF99nf///+7u7pqxxv///8nW4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAEAARAAAEJpCUQaulRd5dJ/9gKI5hYJ7mh6LgGojsmJJ0PXq3JmaE4P9AICECADs=';
 
  /*var makedownload=function(url,el){
    var a=document.createElement('a');
	a.href=url;
	a.innerHTML='<div class="play_new down_btn"></div>';
	el.parentNode.parentNode.appendChild(a); 
    el.setAttribute('vk_ok','1');  
  }*/
  var makedownload=function(url,el,id){
    var table=document.createElement('table');
    table.className="vkaudio_down";
    var tr=document.createElement('tr');
    table.appendChild(tr);
    el.parentNode.appendChild(table);
    
    var td=document.createElement('td');
    tr.appendChild(td);  
    td.appendChild(el); 
    td=document.createElement('td');
    td.setAttribute('style',"vertical-align: top;");
    td.innerHTML='<a href="'+url+'" onmouseover="vk$(this).dragout();"><div class="play_new down_btn" id="down'+id+'"></div></a>';//<img src="'+icon_src+'">
    tr.appendChild(td);  
    el.setAttribute('vk_ok','1');  
  }
  var divs = geByClass('play_new',node);
  for (var i=0; i<divs.length; i++){
     //var onclk=divs[i].getAttribute('onclick');
     if (!divs[i].id || divs[i].hasAttribute('vk_ok')) continue;
     if (divs[i].id.split('play')[1]){
         var id=divs[i].id.split('play')[1];
		 if (ge('down'+id)) continue;
         var data = (node?divs[i].parentNode.parentNode.getElementsByTagName('input')[0]:ge('audio_info' + id)).value.split(',');
         var url=data[0];
		 var anode=(node?divs[i].parentNode.parentNode.parentNode:ge('audio'+id));
			 var el=geByClass("duration",anode )[0];
			 var spans=el.parentNode.getElementsByTagName('span');
			 var span_title=null;
			 var span_title=geByClass('title',anode )[0];
			 if (window.nav && nav.objLoc[0]=='search' && !span_title){
				 for (var x=0; x<spans.length;x++)
					if (spans[x].id && spans[x].id.indexOf('title')!=-1) {span_title=spans[x]; break;}	 
					//searcher.showMore
			 }
			 //vklog('Audio: id'+id+' '+ge('title'+id));
			 (geByClass('title_wrap',el.parentNode)[0] || el.parentNode).appendChild(vkCe('small',{"class":"duration fl_r",id:"vk_asize"+id, "url":url, dur:data[1]}));

		     var name=el.parentNode.getElementsByTagName('b')[0].innerText+' - '+(span_title || ge('title'+id) || spans[1] || spans[0]).innerText;
           name=vkCleanFileName(name);
		     if (smartlink) {url+='?'+vkDownloadPostfix()+'&/'+name+'.mp3';};//normal name
		     if (SearchLink && el){el.innerHTML=vkAudioDurSearchBtn(el.innerText,name,id);/* "<a href='/search?c[section]=audio&c[q]="+name+"'>"+el.innerText+"</a>";*/}
         if (download){ 
            divs[i].setAttribute('style','width:17px;'); 
            makedownload(url,divs[i],id);
         }    
      }  
  }
}



var vk_del_dup_check_size=false;
function vkAudioDelDup(add_button,btn){
	if (add_button){
		if (nav.objLoc[0]=='audio'){
			var p=ge('audio_search_filters');
			if (ge('vk_deldup_btn') || !p) return;
			p.appendChild(vkCe('div',{"class":'audio_filter_sep'}));
			p.appendChild(vkCe('div',{"class":'audio_search_filter'},'<div id="vk_deldup_btn"  style="text-align:center;">'+vkButton(IDL('DeleteDuplicates'),"vkAudioDelDup(null,this)")+'</div>' ));
			p.appendChild(vkCe('div',{"style":'padding-top:10px;', id:"deldup_by_size"}));
			p.appendChild(vkCe('div',{"class":'audio_search_filter'},'<div id="vk_deldup_text"  style="text-align:center;"></div>' ));

			var cb = new Checkbox(ge("deldup_by_size"), {  width: 150,  
											  checked:vk_del_dup_check_size,  
											  label: IDL('DupDelCheckSizes'),
											  onChange: function(state) { vk_del_dup_check_size = (state == 1)?true:false; } 
											});
		} else if (nav.objLoc[0]=='search' && nav.objLoc['c[section]']=='audio'){
			var p=ge('search_filters');
			if (ge('vk_deldup_btn') || !p) return;
			p.appendChild(vkCe('div',{"class":'no_select filter_open',
									  "onclick":"searcher.toggleFilter(this, 'vk_del_dup');",
									  "onselectstart":"return false"},IDL('Duplicates')));
			p.appendChild(vkCe('div',{id:"vk_del_dup"},'\
				<div class="audio_search_filter"><div id="vk_deldup_btn"  style="text-align:center;">'+vkButton(IDL('DeleteDuplicates'),"vkAudioDelDup(null,this)")+'</div></div>\
				<div style="padding-top:10px;" id="deldup_by_size"></div>\
				<div id="vk_deldup_text"  style="text-align:center;"></div>\
				')
			);
			
			var cb = new Checkbox(ge("deldup_by_size"), {  width: 150,  
														  checked:vk_del_dup_check_size,  
														  label: IDL('DupDelCheckSizes'),
														  onChange: function(state) { vk_del_dup_check_size = (state == 1)?true:false; } 
														});
		}
		return;
	}

	var check_lite=function(){
		lockButton(btn);
		var dcount=0;
		var adata={};
		var divs = vkArr2Arr(geByClass('play_new'));
		for (var i=0; i<divs.length; i++){
			if (divs[i].id && divs[i].id.split('play')[1]) var id=divs[i].id.split('play')[1];
			else continue;
			// info = {0: uid, 1:aid, 2:url, 3:duration, 4:dur, 5: art, 6:title};
			var info=vkParseAudioInfo(id);
			var check_id=info[3]+'|'+info[5].toLowerCase()+'|'+info[6].toLowerCase();
			if (adata[check_id]) {
				re(info.node); 
				dcount++;
			} else adata[check_id]=true;
		}
		ge('vk_deldup_text').innerHTML=IDL('Deleted')+': '+dcount
		unlockButton(btn);
	};
	var check_pro=function(){
		lockButton(btn);
		var adata={};
		var urls=[];
		var dcount=0;
		var divs = vkArr2Arr(geByClass('play_new'));
		for (var i=0; i<divs.length; i++){
			if (divs[i].id && divs[i].id.split('play')[1]) var id=divs[i].id.split('play')[1];
			else continue;
			// info = {0: uid, 1:aid, 2:url, 3:duration, 4:dur, 5: art, 6:title};
			var info=vkParseAudioInfo(id);
			info.aid=id;
			info.url=info[2];
			info[5]=info[5].toLowerCase();
			info[6]=info[6].toLowerCase();
			adata[id]=info;
			urls.push([info[2],id]);
		}
		
		var idx=0;
		//var re=function(node){	node.setAttribute('style',"border:1px solid #F00;");	}
		var re_dup=function(){
			var rdata={};
			for (var i=0; i<divs.length; i++){
				if (divs[i].id && divs[i].id.split('play')[1]) var id=divs[i].id.split('play')[1];
				else continue;
				// info = {0: uid, 1:aid, 2:url, 3:duration, 4:dur, 5: art, 6:title};
				var info=adata[id];
				if (!info) continue;
				var check_id=info[3]+'|'+info[5]+'|'+info[6];
				
				if (rdata[check_id] && rdata[check_id][0]>info.size) {
					re(info.node); 
					dcount++;
				} else {
					if(rdata[check_id]){ 
						var n=rdata[check_id][1];
						n.parentNode.replaceChild(info.node,n);
						dcount++;
					}
					rdata[check_id]=[info.size,info.node,info.aid];
				}
			}
			ge('vk_deldup_text').innerHTML=IDL('Deleted')+': '+dcount;
			unlockButton(btn);
		};
		var get_sizes=function(){
			if (urls[idx]){
				ge('vk_deldup_text').innerHTML=vkProgressBar(idx,urls.length,150,idx+'/'+urls.length);
				XFR.post(urls[idx][0],{},function(h,l){
					adata[urls[idx][1]].size=l;
					idx++;
					get_sizes();
				},true);	
			} else {
				re_dup();
			}
		}
		get_sizes();
	};
	var tstart=unixtime();
	(vk_del_dup_check_size?check_pro:check_lite)();
	vklog('DeleteDuplicates time:' + (unixtime()-tstart) +'ms');
}

/*
function vkAudioNode(node){
  if ((node || ge('content')).innerHTML.indexOf('play_new')==-1) return;
  var smartlink=(getSet(1) == 'y')?true:false;
  var download=(getSet(0) == 'y')?1:0;
  if (!download) return;
  var SearchLink=true;
  var trim=function(text) { return (text || "").replace(/^\s+|\s+$/g, ""); }
  //InitAudiosMenu();
  var icon_src='data:image/gif;base64,R0lGODdhEAARALMAAF99nf///+7u7pqxxv///8nW4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAEAARAAAEJpCUQaulRd5dJ/9gKI5hYJ7mh6LgGojsmJJ0PXq3JmaE4P9AICECADs=';
  var makedownload=function(url,el,id){
    var table=document.createElement('table');
    table.className="vkaudio_down";
    var tr=document.createElement('tr');
    table.appendChild(tr);
    el.parentNode.appendChild(table);
    
    var td=document.createElement('td');
    tr.appendChild(td);  
    td.appendChild(el); 
    td=document.createElement('td');
    td.setAttribute('style',"vertical-align: top;");
    td.innerHTML='<a href="'+url+'" onmouseover="vk$(this).dragout();"><div class="play_new down_btn" id="down'+id+'"></div></a>';//<img src="'+icon_src+'">
    tr.appendChild(td);  
    el.setAttribute('vk_ok','1');  
  }
  var divs = geByClass('play_new',node);
  for (var i=0; i<divs.length; i++){
     //var onclk=divs[i].getAttribute('onclick');
     if (!divs[i].id || divs[i].hasAttribute('vk_ok')) continue;
     if (divs[i].id.split('play')[1]){
         var id=divs[i].id.split('play')[1];
		 if (ge('down'+id)) continue;
		 // info = {0: uid, 1:aid, 2:url, 3:duration, 4:dur, 5: art, 6:title};
		 var anode=(node?divs[i].parentNode.parentNode.parentNode:ge('audio'+id));
		 var info=vkParseAudioInfo(id,node,anode);
		 var url=info[2];
		 var anode=info.node;
		 var el=geByClass("duration",anode )[0];
		 (geByClass('title_wrap',el.parentNode)[0] || el.parentNode).appendChild(vkCe('small',{"class":"duration fl_r",id:"vk_asize"+id, "url":url, dur:info[3]}));

		 var name=info[5] + ' - ' + info[6];
		 if (smartlink) {url+='?'+vkDownloadPostfix()+'&/'+name+'.mp3';};//normal name
		 if (SearchLink && el){el.innerHTML=vkAudioDurSearchBtn(info[4],name,id);}
		 if (download){ 
            divs[i].setAttribute('style','width:17px;'); 
            makedownload(url,divs[i],id);
         }    
      }  
  }
}
//*/
function vkAddAudio(aid,oid,callback){
	dApi.call('audio.add',{aid:aid,oid:oid},function(r){
		if (callback) callback(r.response);
	});
}
function vkAddAudioT(oid,aid,el){
	var p=el;//.parentNode;
	p.innerHTML=vkLdrImg;
	vkAddAudio(aid,oid,function(r){  
      if (r) p.innerHTML=IDL('AddMyAudio')+' - '+IDL('Done');
		else p.innerHTML=IDL('AddMyAudio')+' - '+IDL('Error');
	});
}
function vkAudioWikiCode(aid,oid,id){vkAlertBox('Wiki-code:','<center><input type="text" value="[[audio'+aid+']]" readonly onClick="this.focus();this.select();" size="25"/><br><br>\
                              <a href="/audio?'+(parseInt(oid)>0?'':'g')+'id='+Math.abs(oid)+'&audio_id='+id+'">'+IDL('Link')+'</a></center>');}

function vkShowAddAudioTip(el,id){	
   var a=id.match(/^(-?\d+)_(\d+)/);
   var show_add=(!ge('audio_add'+id)) && (a[1]!=remixmid());
   //alert(ge('audio_add'+id)+'\n'+(a[1]!=remixmid())+'\n'+show_add);
	if (a){
		var name=vkParseAudioInfo(id);
      name=(name[5]+' '+name[6]).replace(/[\?\&\s]/g,'+');
      var html = '';
      html += (remixmid()==cur.oid || isGroupAdmin(cur.oid))?'<a href="#" onclick="vkAudioEd.Delete(\''+a[2]+'\',\''+id+'\',this); return false;">'+IDL('delete',2)+'</a>':'';
      html += show_add ?'<a href="#" onclick="vkAddAudioT(\''+a[1]+'\',\''+a[2]+'\',this); return false;">'+IDL('AddMyAudio')+'</a>':'';
      html +='<a href="#" onclick="vkAudioWikiCode(\''+a[1]+'_'+a[2]+'\',\''+a[1]+'\',\''+a[2]+'\'); return false;">'+IDL('Wiki')+'</a>';
      html +='<a href="'+SEARCH_AUDIO_LYRIC_LINK.replace('%AUDIO_NAME%',name)+'" target="_blank">'+IDL('SearchAudioLyr')+'</a>';
      
		html = '<div class="vk_tt_links_list">'+html+'</div>';
      showTooltip(el, {
		  hasover:true,
		  text:html,
		  slide: 15,
		  shift: [0, -3, 0],
		  showdt: 400,
		  hidedt: 200,
		});
	}
}

function vkGetAudioSize(id,el){
	vkShowAddAudioTip(el,id);
	if (getSet(43)!='y') return;
	var WAIT_TIME=4000;
	var el=ge("vk_asize"+id);
	if (el && !el.hasAttribute('getsize_ok')){
		el.setAttribute('getsize_ok',true);
		el.innerHTML=vkLdrMiniImg;
		var dur=el.getAttribute('dur');
		var reset=setTimeout(function(){
			el.removeAttribute('getsize_ok');
			el.innerHTML='';
		},WAIT_TIME);
		XFR.post(el.getAttribute('url'),{},function(h,l){
			clearTimeout(reset);
			if (dur>0 && l>0){
				var kbit=l/128;
				var kbps= Math.ceil(Math.round(kbit/dur)/16)*16;
				//el.innerHTML=kbps+'Kbps | '+vkFileSize(l,1);
				el.innerHTML=vkFileSize(l,1)+' | '+kbps+'Kbps';
			} else {
				el.innerHTML='o_O';
			}
			
		},true);	
	}
}
function vkDownloadPostfix(){
	return '';
	/*!
	активация функции контакта изменяющая загловок ответа, 
	для скачивания файла минуя плагины типа QuickTime. 
	но есть вероятность оказаться на виду у разработчиков контакта и спалиться за скачиванием музыки
	*/	
	return 'dl=1';
}
function vkAudioSizeLabel(audio){
return '<small class="duration fl_r" id="vk_asize'+audio[0]+'_'+audio[1]+'" url="'+audio[2]+'" dur="'+audio[3]+'"></small>';
}

function vkAudioDownBtn(audio){
	var names=(getSet(1) == 'y')?true:false;
	return '<a href="'+audio[2]+'?'+vkDownloadPostfix()+(names?'&/'+audio[5]+' - '+audio[6]+'.mp3':'')+'" onmouseover="vk$(this).dragout();"><div class="play_new down_btn" id="down'+audio[0]+'_'+audio[1]+'"></div></a>'; 
}
function vkAudioDurSearchBtn(audio,fullname,id){
	var sq=fullname?fullname:audio[5]+' - '+audio[6];
	var dur=fullname?audio:audio[4];
	id = fullname?id:audio[0]+'_'+audio[1];
	//var onclick='if (checkEvent(event)) return; Audio.selectPerformer(event, \''+sq+'\'); return false';'return nav.go(this, event);'
	return '<a href="/search?c[q]='+sq+'&c[section]=audio" onmouseover="vkGetAudioSize(\''+id+'\',this)" onclick="if (checkEvent(event)) return; Audio.selectPerformer(event, \''+sq+'\'); return false">'+dur+'</a>';
}

function vkAudioPlayList(add_button){
	if(add_button){
		if (ge('vkmp3links')) return;
		var p=ge('audio_actions');
		p.innerHTML+='<span class="divider">|</span><a onclick="vkAudioPlayList(); return false;" href="#" id="vkmp3links">'+IDL('Links')+'</a>';
		return;
	}
	vkaddcss('#vk_mp3_links_area, #vk_m3u_playlist_area,#vk_pls_playlist_area{width:520px; height:400px;}');
	var params={}; 
	params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);
	var box=vkAlertBox('',vkBigLdrImg);
	dApi.call('audio.get',params,function(r){
		var res='#EXTM3U\n';
		var pls='[playlist]\n\n';
		var links=[];
		var list=r.response;
		for (var i=0;i<list.length;i++){
			var itm=list[i];
			res+='#EXTINF:'+itm.duration+','+(winToUtf(itm.artist+" - "+itm.title))+'\n';
			res+=itm.url+"\n";//+"?/"+(encodeURIComponent(itm.artist+" - "+itm.title))+".mp3"+"\n";
			
			pls+='File'+(i+1)+'='+itm.url+'\n';
			pls+='Title'+(i+1)+'='+winToUtf(itm.artist+" - "+itm.title)+'\n';
			pls+='Length'+(i+1)+'='+itm.duration+'\n\n';
			
			links.push(itm.url+"?/"+(itm.artist+" - "+itm.title)+".mp3");
		}
		pls+='\nNumberOfEntries='+list.length+'\n\nVersion=2'

		box.hide();
		m3u_html='<div class="vk_m3u_playlist">\
				<textarea id="vk_m3u_playlist_area">'+res+'</textarea>\
				<a href="data:audio/x-mpegurl;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(res))) + '">'+vkButton(IDL('download_M3U'))+'</a>\
				<a href="data:audio/x-mpegurl;base64,' + base64_encode(utf8_encode(res)) + '">'+vkButton(IDL('download_M3U')+' (UTF-8)','',1)+'</a>\
				</div>';
		pls_html='<div class="vk_pls_playlist">\
				<textarea id="vk_pls_playlist_area">'+pls+'</textarea>\
				<a href="data:audio/x-scpls;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(pls))) + '">'+vkButton(IDL('download_PLS'))+'</a>\
				<a href="data:audio/x-scpls;base64,' + base64_encode(utf8_encode(pls)) + '">'+vkButton(IDL('download_PLS')+' (UTF-8)','',1)+'</a>\
				</div>';

		var tabs=[];

		tabs.push({name:IDL('links'),active:true, content:'<div class="vk_mp3_links"><textarea id="vk_mp3_links_area">'+links.join('\n')+'</textarea></div>'});
		tabs.push({name:IDL('M3U_Playlist'),content:m3u_html});
		tabs.push({name:IDL('PLS_Playlist'),content:pls_html});
		box=vkAlertBox('MP3',vkMakeContTabs(tabs));
		box.setOptions({width:"560px"});
		/*alert(links.join('\n'));
		alert(res);
		*/
	});
}
/* SEARCH */
function vkSearchPage(){
	vkAudioDelDup(true);
}
/* FAVE */
function vkFavePage(){
   vkFavUsersList(true);
}

/* WIKI GET CODE*/ //NOT USED
function vkGetWikiCode(){
	var dloc=document.location.href;
	var gid=dloc.match(/o=-(\d+)/);
	gid=gid?gid[1]:null;
	dApi.call('pages.get',{title:geByClass('wikiTitle')[0].innerHTML,gid:24011636,},uApi.show);
}

/* MAIL */
function vkMailPage(){
	if(nav.objLoc['act']=='show') {
		vkAddSaveMsgLink();
		if (getSet(40)=='y') vkAddDelMsgHistLink();
		vkProcessNode();
      /*if (!cur.addMailMedia){
         cur.addMailMedia = initAddMedia('mail_add_link', 'mail_added_row', [["photo"," "],["video"," "],["audio"," "],["doc"," "]]);
         cur.addMailMedia.onChange = mail.onMediaChange;
      }*/
	}
	if (getSet(40)=='y') vkAddDeleteLink();
}

function vkAddDeleteLink(){
	if (!ge('vk_clean_msg') && ge('mail_tabs')){
		//if (!(cur.section=="inbox" || cur.section=="outbox")) return;
		var is_inbox=(cur.section=="inbox");
		var caption=is_inbox?IDL('msgdelinbox'):IDL('msgdeloutbox');
		var li=vkCe('li',{"class":'t_r', id:'vk_clean_msg'},'\
			<a href="#" onclick="vkDeleteMessages('+(!is_inbox?'true':'')+'); return false;">'+caption+'</a><span class="divide">|</span>\
		');
		ge('mail_tabs').appendChild(li);
	}
	if(nav.objLoc['act']=='show' || nav.objLoc['section']=='search'){
		hide('vk_clean_msg');
	} else {
		show('vk_clean_msg');
	}
}
function vkAddDelMsgHistLink(){ 
  if (!ge('vk_del_history')){
	var btn=vkCe('div', {	id:"vk_del_history", "class":"fl_l vk_mail_save_history", },
					'<a href="#" onclick="vkDeleteMessagesHistory('+cur.thread.id+'); return false;">'+IDL('msgclearchat')+'</a>'
				);
	var ref=ge('mail_history');
	ref.parentNode.insertBefore(btn,ref);
  }
}
function vkDeleteMessages_(is_out){// step 1: scan all; step 2: delete; This function not used
	var MARK_ACT='del';// 'del'		'read'		'new'
	var box=null;
	var mids=[];
	var del_offset=0;
	var cur_offset=0;
	var abort=false;	
	var del=function(){	
		if (abort) return;
		var del_count=mids.length;
		ge('vk_scan_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %');
		var ids_part=mids.slice(del_offset,del_offset+MSG_IDS_PER_DEL_REQUEST);
		if (ids_part.length==0){	box.hide();		vkMsg(IDL('DeleteMessagesDone'),3000);	} 
		else AjPost('mail?act=a_mark', {mark: MARK_ACT, msgs_ids: ids_part.join(','), hash: cur.mark_hash, al:1},function(r,t){
			del_offset+=MSG_IDS_PER_DEL_REQUEST;
			setTimeout(del,MSG_DEL_REQ_DELAY);
		});
	};
	var scan=function(){
		if (cur_offset==0) ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %');
		dApi.call('messages.get',{out:is_out?1:0,count:100,offset:cur_offset,preview_length:1},function(r){
			if (abort) return;
			var ms=r.response;
			if (!ms[0]){ del();	return;	}
			var msg_count=ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,msg_count,310,IDL('msgreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].mid);
			if (cur_offset<msg_count){	cur_offset+=100; setTimeout(scan,MSG_SCAN_REQ_DELAY);} else del();
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DeleteMessages'),closeButton:true,width:"350px"});
		box.removeButtons(); box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no'); 
		var html='<div id="vk_scan_msg"></div>'; box.content(html).show();	
		scan();
	}
	vkAlertBox(IDL('DeleteMessages'),IDL('msgdelconfirm'),run,true);
}

function vkDeleteMessages(is_out){
	var MARK_ACT='del';// 'del'		'read'		'new'
	var REQ_CNT=100;
	//MSG_IDS_PER_DEL_REQUEST=5;
	var box=null;
	var mids=[];
	var del_offset=0;
	var cur_offset=0;
	var abort=false;	
	var deldone=function(){
			box.hide();
			vkMsg(IDL('DeleteMessagesDone'),3000);	
	};
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %');
		var ids_part=mids.slice(del_offset,del_offset+MSG_IDS_PER_DEL_REQUEST);
		if (ids_part.length==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		AjPost('mail?act=a_mark', {mark: MARK_ACT, msgs_ids: ids_part.join(','), hash: cur.mark_hash, al:1},function(r,t){
			del_offset+=MSG_IDS_PER_DEL_REQUEST;
			setTimeout(function(){del(callback);},MSG_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %');
		}
		dApi.call('messages.get',{out:is_out?1:0,count:REQ_CNT,offset:0,preview_length:1},function(r){
			if (abort) return;
			var ms=r.response;
			if (ms==0 || !ms[0]){
				deldone();
				return;
			}
			if (msg_count==0) msg_count=ms.shift();
			else ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].mid);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(scan,MSG_SCAN_REQ_DELAY);
			
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DeleteMessages'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	}
	vkAlertBox(IDL('DeleteMessages'),IDL('msgdelconfirm'),run,true);
}

function vkDeleteMessagesHistory(uid){
	var MARK_ACT='del';// 'del'		'read'		'new'
	var REQ_CNT=100;
	//MSG_IDS_PER_DEL_REQUEST=5;
	var box=null;
	var mids=[];
	var del_offset=0;
	var cur_offset=0;
	var abort=false;
	var mark_hash=null;
	var deldone=function(){
			box.hide();
			vkMsg(IDL('DeleteMessagesDone'),3000);	
	};
	var get_mark_hash=function(callback){
		AjGet('/al_mail.php?al=1',function(r,t){
			mark_hash=t.split('"mark_hash":"')[1].split('"')[0];
			callback();
		});
	}
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %');
		var ids_part=mids.slice(del_offset,del_offset+MSG_IDS_PER_DEL_REQUEST);
		if (ids_part.length==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		AjPost('mail?act=a_mark', {mark: MARK_ACT, msgs_ids: ids_part.join(','), hash: mark_hash, al:1},function(r,t){
			del_offset+=MSG_IDS_PER_DEL_REQUEST;
			setTimeout(function(){del(callback);},MSG_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		if (!mark_hash){
			get_mark_hash(scan);
			return;
		}
		mids=[];
		if (cur_offset==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %');
		}
		dApi.call('messages.getHistory',{uid:uid,count:REQ_CNT,offset:0},function(r){
			if (abort) return;
			var ms=r.response;
			if (ms==0 || !ms[0]){
				deldone();
				return;
			}
			if (msg_count==0) msg_count=ms.shift();
			else ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].mid);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(scan,MSG_SCAN_REQ_DELAY);
			
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DeleteMessages'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	}
	vkAlertBox(IDL('DeleteMessages'),IDL('msgdelconfirm'),run,true);
}

// SAVE HISTORY TO FILE
function vkAddSaveMsgLink(){ 
  if (!ge('vk_history_to_file_block')){
	var btn=vkCe('div', {	id:"vk_history_to_file_block", "class":"vk_mail_save_history_block", },
					'<div id="saveldr" style="display:none; padding:8px; padding-top: 14px; text-align:center; width:130px;"><img src="/images/upload.gif"></div>'+
					'<a href="#" onclick="return false;" id="save_btn_text" class="vk_mail_save_history"><span onclick="vkMakeMsgHistory(); return false;">'+IDL('SaveHistory')+'</span><div class="cfg fl_r" onclick="vkMakeMsgHistory(null,true);"></div></a>'
				);
	var ref=ge('mail_history');
	ref.parentNode.insertBefore(btn,ref);
  }
}
function vkMakeMsgHistory(uid,show_format){
	//vkInitDataSaver();
	if (!uid) uid=cur.thread.id;
	var offset=0;
	var result='';
	var user1='user1';
	var user2='user1';
	var mid=remixmid();
	var msg_pattern=vkGetVal('VK_SAVE_MSG_HISTORY_PATTERN') || SAVE_MSG_HISTORY_PATTERN;
	var date_fmt=vkGetVal('VK_SAVE_MSG_HISTORY_DATE_FORMAT') || SAVE_MSG_HISTORY_DATE_FORMAT;
	var collect=function(callback){
		hide('save_btn_text');
		show('saveldr');
		//document.title='offset:'+offset;
		if (offset==0) ge('saveldr').innerHTML=vkProgressBar(offset,10,125);		
		dApi.call('messages.getHistory',{uid:uid,offset:offset,count:100},function(r){
			ge('saveldr').innerHTML=vkProgressBar(offset,r.response[0],125);
			var msgs=r.response;
			var count=msgs.shift();
			msgs.reverse();
			var msg=null;
			var res=''
			for (var i=0;i<msgs.length;i++){
				msg=msgs[i];
				var date=(new Date(msg.date*1000)).format(date_fmt);
				var user=(msg.from_id==mid?user2:user1);
				var text=vkCe('div',{},msg.body).innerText;// no comments....
				text=text.replace(/\n/g,'\r\n');
				res+=msg_pattern
                 .replace(/%username%/g,user) //msg.from_id
                 .replace(/%date%/g,    date)
                 .replace(/%message%/g, text);
			}
			result=res+result;
			if (offset<count){
				offset+=100;
				setTimeout(function(){collect(callback);},300);
			} else {
				//alert(result);
				callback(result);
			}
		});
	}
	var run=function(){
		dApi.call('getProfiles',{uids:remixmid()+','+uid},function(r){
			user2=r.response[0].first_name+" "+r.response[0].last_name;
			user1=r.response[1]?r.response[1].first_name+" "+r.response[1].last_name:'DELETED';
			collect(function(t){
				show('save_btn_text');
				hide('saveldr');
				vkSaveText(t,"messages_"+user1+"("+uid+").txt");
				//alert(t);
			});
		});	
	}
	
	if (show_format){
		var aBox = new MessageBox({title: IDL('SaveHistoryCfg')});
		aBox.removeButtons();
		aBox.addButton(IDL('Hide'), aBox.hide, 'no')
		aBox.addButton(IDL('OK'),function(){  
			msg_pattern=ge('vk_msg_fmt').value;
			date_fmt=ge('vk_msg_date_fmt').value;
			vkSetVal('VK_SAVE_MSG_HISTORY_PATTERN',msg_pattern);
			vkSetVal('VK_SAVE_MSG_HISTORY_DATE_FORMAT',date_fmt);
			aBox.hide(); 
			run();	 
		},'yes');
		vkaddcss('.vk_save_hist_cfg textarea{width:370px;}');
		html ='<h4>'+IDL('SaveMsgFormat')+'<a class="fl_r" onclick="ge(\'vk_msg_fmt\').value=SAVE_MSG_HISTORY_PATTERN;">'+
					IDL('Reset')+'</a></h4><textarea id="vk_msg_fmt" onfocus="autosizeSetup(this,{});">'+msg_pattern+'</textarea><br><br>';
					
		html+='<h4>'+IDL('SaveMsgDateFormat')+'<a class="fl_r" onclick="ge(\'vk_msg_date_fmt\').value=SAVE_MSG_HISTORY_DATE_FORMAT;">'+
					IDL('Reset')+'</a></h4><textarea id="vk_msg_date_fmt" onfocus="autosizeSetup(this,{});">'+date_fmt+'</textarea><br>';
		aBox.content('<div class="vk_save_hist_cfg">'+html+'</div>');
		aBox.show();
		autosizeSetup('vk_msg_fmt',{});
		autosizeSetup('vk_msg_date_fmt',{});
	} else run();
}

// END OF SAVE HISTORY TO FILE

function vkNotesPage(){
	if (!ge('vk_clean_notes') && cur.oid==remixmid()){
		var p=geByClass('summary')[0];
		p.innerHTML+='<span class="divide">|</span><a style="font-weight:normal" id="vk_clean_notes" href="#" onclick="vkCleanNotes(); return false;">'+IDL('DelAllNotes')+'</a>';
	}
}

function vkCleanNotes(){
	var REQ_CNT=100;
	var WALL_DEL_REQ_DELAY=400;
	var start_offset=0;
	var box=null;
	var by_time=false;
	var mids=[];
	var del_offset=0;
	var cur_offset=0;
	var abort=false;
	var filter=['owner','others','all'];
	var deldone=function(){
			box.hide();
			vkMsg(IDL("ClearDone"),3000);	
	};
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('nodesdel')+' %');
		var nid=mids[del_offset];
		if (!nid){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		dApi.call('notes.delete', {nid:nid},function(r,t){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('notesreq')+' %');
		}
		dApi.call('notes.get',{count:REQ_CNT,offset:0+start_offset},function(r){
			if (abort) return;
			var ms=r.response;
			if (ms==0 || !ms[1]){
				deldone();
				return;
			}
			if (msg_count==0) msg_count=ms.shift();
			else ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('notesreq')+' %');
			for (var i=0;i<ms.length;i++){ 
				if ((ms[i].date>del_time && by_time) || !by_time) mids.push(ms[i].nid);
			}
			cur_offset+=REQ_CNT;
			if (mids.length==0){
				deldone();
				return;
			} 
			del(scan);
			
		});
	};
	var vkRunClean=function(soffset){
		start_offset=soffset?soffset:0;
		box=new MessageBox({title: IDL('ClearNotes'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
	var showLoader=function(){
		loader_box=new MessageBox({title:''});
		loader_box.setOptions({title: false, hideButtons: true}).show(); 
		hide(loader_box.bodyNode); 
		show(boxLoader);
		boxRefreshCoords(boxLoader);	
	};
	var hideLoader=function(){
		loader_box.hide();
		hide(boxLoader);
	}
	
	showLoader();
	stManager.add(['ui_controls.js','ui_controls.css','datepicker.js','datepicker.css','events.css'], function() {
		hideLoader();
		html='<div class="clear_fix info_table page_add_event_info public_add_event_box"><div class="clear_fix">\
		  <div style="padding-top:10px;" id="notes_del_by_time"></div>\
		  <div class="labeled fl_l">\
			<div class="fl_l"><input type="hidden" id="notes_del_after_date" name="notes_del_after_date"/></div>\
			<div class="fl_l" style="padding:4px 4px 0"></div>\
			<div class="fl_l"><input type="hidden" id="notes_del_after_time"/></div>\
		  </div>\
		</div></div>';		
		var aBox = new MessageBox({title: IDL('ClearNotes'),width: "285px"});
		aBox.removeButtons();
		aBox.addButton(getLang('box_no'),aBox.hide, 'no');
		aBox.addButton(getLang('box_yes'),function(){  
			del_time = ge('notes_del_after_date').value;
			aBox.hide(); 
			vkRunClean();	 
		},'yes');
		  
		aBox.content(IDL('CleanNotesConfirm')+html);
		aBox.show();
		//vkAlertBox(IDL('ClearNotes'),IDL('CleanNotesConfirm')+html,vkRunClean,true);
		var delTime = new Datepicker(ge('notes_del_after_date'), {time:'notes_del_after_time', width:140});
		var cb = new Checkbox(ge("notes_del_by_time"), {  width: 270,  
														  checked:by_time,  
														  label: IDL('DelCreatedAfterTime'),
														  onChange: function(state) { by_time = (state == 1)?true:false; } 
														})
	});	
}

/*
  deleteReportPost: function(post, act) {
    post = cur.owner + '_' + post;
    var prg = geByClass1('bp_progress', ge('post' + post));
    if (isVisible(prg)) return;

    ajax.post('al_board.php', {act: act, post: post, hash: cur.hash}, {onDone: function(text, deleted) {
      var info = ge('post' + post).firstChild.nextSibling;
      if (info) {
        info.firstChild.rows[0].cells[0].innerHTML = text;
      } else {
        info = ge('post' + post).appendChild(ce('div', {className: 'bp_deleted', innerHTML: '\
<table cellspacing="0" cellpadding="0" style="width: 100%"><tr><td class="bp_deleted_td">\
  ' + text + '\
</td></tr></table>'}));
        hide(info.previousSibling);
      }

      if (deleted) {
        Pagination.recache(-1);
        Board.loadedPosts(cur.pgCount);
      }
    }, progress: prg});
  },
 */ 
function vkBoardPage(){
 vkTopicSubscribe(true);
 //vkTopicsTip();
}

function vkProcessTopicLink(link){
   var href=link.getAttribute('href');
   if (!href) return;
   var id=href.match(/topic(-?\d+)_(\d+)/);
   var post=href.match(/post=(\d+)/);
   if (!id) return;
   if(!link.hasAttribute('onmouseover')) link.setAttribute('onmouseover', "vkTopicTooltip(this, "+id[1]+","+id[2]+","+(post?post[1]:null)+");");
}
function vkTopicTooltip(el,gid,topic,post){
    var post_id=post?(gid+'_'+post):(gid+'_topic'+topic);
    var url = post?'al_board.php':'al_wall.php';
    stManager.add(post?'board.css':'wall.css', function() {
       showTooltip(el, {
         url: url,
         params: extend({act: 'post_tt', post: post_id}, {}),
         slide: 15,
         shift: [30, -3, 0],//78
         ajaxdt: 100,
         showdt: 400,
         hidedt: 200,
         className: 'rich wall_tt'
       });    
    });
}

function vkTopicSubscribe(add_link){
	if (add_link){
		if (ge('vksubscribetopic')) return;
		if (nav.objLoc[0].indexOf('topic-')!=-1){
			 var divider=(ge('privacy_edit_topic_action') && ge('privacy_edit_topic_action').parentNode && isVisible(ge('privacy_edit_topic_action').parentNode))?'<span class="divide">|</span>':'';
			 geByClass('t0')[0].appendChild(vkCe('li',{"class":"t_r"},'<a href="#" id="vksubscribetopic" onclick="return vkTopicSubscribe();">'+IDL('addtop')+'</a>'+divider))
		}
		return false;
	}
	progr_el=ge('vksubscribetopic');
	var text='[subscribe]';
	var last = ((cur.pgCont.childNodes[cur.pgNodesCount - 1].id || '').match(/\d+$/) || [0])[0];
	ajax.post('al_board.php', {act: 'post_comment',topic: cur.topic,last: last,hash: cur.hash,comment: text},{
		showProgress:showGlobalPrg.pbind(progr_el, {cls: 'progress_inv_img', w: 46, h: 16}),
		hideProgress:hide.pbind('global_prg'),
		onDone: function(count, from, rows, offset, pages, preload) {
			var pid=rows.split(text)[1].match(/Board\.deletePost\((\d+)\)/);
			if (!pid) {
				vkMsg(IDL('Error'));
			}
			else {
				var post = cur.owner + '_' + pid[1];
				ajax.post('al_board.php', {act: 'delete_comment', post: post, hash: cur.hash}, {
					showProgress:showGlobalPrg.pbind(progr_el, {cls: 'progress_inv_img', w: 46, h: 16}),
					hideProgress:hide.pbind('global_prg'),
					onDone: function(text, deleted) {
						if (deleted) vkMsg(IDL('topicadded'));
					}
				});
				
			}
		}
	});
	return false;
}

var vkstarted = (new Date().getTime());

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;