// ==UserScript==
// @name          Vkontakte Optimizer module 
// @description   (by KiberInfinity id13391307)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==

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
	#im_dialogs .new_msg div.mail_body{color: #000;} .im_hist tr.un td.user a{color: '+textcolor+'}\
   .mail_history_unread {background-color: '+bgcolor+' !important; color: '+textcolor+'}\
   ';
	
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
   var hideBigLike = getSet(70)=='y';
  
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
         line-height:150%\
         /*font-size: 6pt;\
         margin-bottom: -5px;\
         margin-top: -2px;*/\
      }\
      ';
   }
   if (ShowGroupNews=='y') main_css+='#group .wide_column .group_wiki_wrap .wk_text{display:block}';
   if (hideBigLike) main_css+="#pv_hh{display:none !important;}";
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
      .vk_last_seen{margin-top: -5px;line-height: 9px;}\
		.vk_profile_left{width: 200px;}\
		.vk_profile_ava{text-align: center;}\
		.vk_profile_header{width:236px; background:#5b7b9f; border:1px solid #45688e; color:#FFF;  padding:5px; text-shadow:1px 1px 1px #111; }\
		.vk_profile_header_divider{border-top:1px solid #45688e; border-bottom:1px solid #668ab3;/*border-top:1px solid #666;border-bottom:1px solid #999;*/ margin-top:3px;}\
		.vk_profile_info_block{padding-left:8px;}\
		.vk_profile_common_fr_header{cursor: pointer; width:230px; font-weight:bold; padding:2px; padding-left:5px; background-color: #e1e7ed; color: #7d96b0; border-bottom:1px solid #d8dfe5; border-top:1px solid #d3dae0;}\
		.vk_profile_common_fr{width:236px;}\
		.vk_profile_common_fr a{  margin: 0px;  padding: 1px;  display: inline-block; width:106px;  overflow:hidden; font-size:10px;}\
		.vk_profile_common_fr a.vk_usermenu_btn{width:10px; padding:0px; font-size:10px;}\
		.vk_profile_frinfo{   width:235px;   padding-bottom:2px;}\
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
          background-image_: url("data:image/png;base64,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");\
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
   .module_header .p_header_bottom .fl_r { display: inline;  }\
	#profile_current_info { max-height: none !important; }\
	#right_bar { width: 118px;}\
	#right_bar_container{width: 118px; margin:5px 10px 0px 0px;	padding-bottom: 10px;}\
	.box_loader {  height: 50px;  background: url('/images/progress7.gif') center no-repeat;}\
	.vk_usermenu_btn{\
      color: rgba(100,100,100,0.5);\
        -moz-user-select: none;\
        -khtml-user-select: none;\
        -webkit-user-select: none;\
        -o-user-select: none;\
        user-select: none;\
   } \
   .vk_usermenu_btn:hover{/*opacity: 0.1;*/ text-decoration:none;}\
   .vk_ts_exmenu{display: block; line-height: 30px;text-overflow: ellipsis;white-space: nowrap;width: 10px;}\
	.vk_user_menu_divider{border-bottom:1px solid #DDD;}\
	.vk_mail_save_history{	display: block; height: 13px;	padding: 18px;	text-align: center;	}\
	.vk_mail_save_history_block{	display: block; float:right; text-align: center; /*width: 200px;*/	}\
	.vk_mail_save_history_block IMG{margin-top:13px;}\
	.vk_mail_save_history_block .cfg, .save_msgs_link .cfg, .vk_cfg_icon{height: 11px; width: 15px; margin-top:2px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -60px;}\
   #vk_stats_btn{position: absolute; float:left}\
   #vk_stats_btn .button_blue{position: absolute; right: 0px;}\
   #vk_stats_im_btn{margin-right:3px;}\
   .vk_photo_icon{ padding-left:12px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -29px; line-height: 11px; }\
   .vk_msg_icon{ padding-left:12px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -193px; line-height: 11px; }\
   .vk_audio_icon{ padding-left:12px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -221px; line-height: 11px; }\
   .vk_video_icon{ padding-left:12px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -75px; line-height: 11px; }\
   .vk_profile_links a{padding:3px;}\
   .vk_profile_links a:hover{background-color:#E1E7ED; text-decoration:none;}\
   .vk_profile_links{line-height:20px;}\
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
   .nobold{font-weight: normal;}\
	"+(RemoveAd=='y'?".ad_box,.ad_help_link, .ad_help_link_new, .ad_box_new, #ad_help_link_new, #left_ads {display: none !important;}\
			"+(NotHideSugFr?'.ad_box_friend{display: block !important;} .ad_box_friend + .ad_box_new{display:block !important;}':'')+"\
			#groups .clearFix {display: block !important;} \
			#sideBar a[href*=\"help.php\"] {display: none !important;} \
			#groups .clearFix {height: 100% !important;}":'')+"\
	";//,, #left_ads

   main_css+='\
   .im_fixed_nav #stl_side{display:none !important;}\
   ';
   
	//compact audio
	if (CompactAu=='y')	main_css+="\
		.audio .playline { padding-top: 0px !important;}\
		.audio .player_wrap { height: 6px !important; padding-top: 0px !important;}\
		.audio_add{margin-top:0px !important;}\
		.audio_table .remove {top: 3px !important;}\
		.audio_table .audio td.play_btn, .audio_table .audio td.play_btn td { padding-bottom: 0px !important; padding-top: 0px !important;padding: 0px !important; }\
		.audio_table .audio td{ padding-bottom: 0px !important; padding-top: 0px !important;}\
		.audio_table table{ border-spacing: 0px !important;}\
		.audios_row { margin-top: 0px !important; padding-top:0px !important;}\
		.audios_row .actions a{padding-top:2px !important; padding-bottom:2px !important;}\
      .audio_list .audio_title_wrap { width: 315px !important;}\
      #audio.new .audio_edit_wrap, #audio.new .audio_add_wrap, #audio.new .audio_remove_wrap, #pad_playlist .audio_add_wrap { \
         margin-bottom: 0px !important;\
         margin-top: 0px !important;\
      }\
      .audio .play_btn_wrap, .audio .title_wrap, .duration{\
         padding-bottom: 2px !important;\
         padding-top:2px !important;\
      }\
      .audio .area {margin-bottom: 0px !important;}\
      .choose_audio_row {height:auto !important;}\
      .choose_audio_row a.choose{margin-top: 0px !important; padding-bottom: 2px !important; padding-top:2px !important; height: auto !important; line-height: normal !important;}\
	";
   
	//additional audio styles
	var img="data:image/gif;base64,R0lGODdhEAARALMAAF99nf///+7u7pqxxv///8nW4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwAAAAAEAARAAAEJpCUQaulRd5dJ/9gKI5hYJ7mh6LgGojsmJJ0PXq3JmaE4P9AICECADs=";
	main_css+='\
		.play_new{float:left; width: 17px !important;}\
		.vkaudio_down{border-spacing: 0px;}\
		.audio_table .audio td.play_btn {width: 40px !important;}\
		.audio .down_btn { \
         background-image: url("'+img+'") !important; \
         background-position:0 0 !important;\
         border-radius:3px;\
         width: 16px !important;\
      }\
      #vk_album_info {margin-left: -10px; margin-right: -10px;}\
      #vk_album_info h4{cursor:pointer; min-height:30px; padding:3px 10px}\
      #vk_album_info h4:hover{background-color: rgba(219, 227, 235, 0.5);}\
      #vk_album_info h4 img.small{max-width:30px;max-height:30px; margin-right:3px;}\
      #vk_album_info h4 img:hover{box-shadow: 0px 0px 4px #717171;}\
      #vk_album_info h4 img.big{max-width:155px;max-height:170px; margin:0 auto; margin-bottom:4px; display:none;}\
      #vk_album_info.view_big .small{display:none;}\
      #vk_album_info.view_big .big{display:block;}\
      #vk_album_info h4 .fix_btn{opacity:0;}\
      #vk_album_info h4:hover .fix_btn{opacity:0.4;}\
      #vk_album_info h4 .fix_btn:hover{opacity:0.7;}\
      #vk_album_info.fixed_album h4 .fix_btn,#vk_album_info.fixed_album h4 .fix_btn:hover{opacity:1;}\
      #vk_album_info .bio{padding:4px;}\
      .vk_album_thumb{padding:3px;}\
      .vk_album_tracks ul{list-style-type: disc; margin:0px; padding:0px; padding-left:4px; margin-left: 17px; color:#AAA;}\
      .vk_album_tracks .vk_tracks_search_btn{padding:3px 10px;}\
      \
      /* Display full audio names*/\
      .audio .title_wrap{white-space: normal !important; width: 245px; !important; }\
      .audio .title_wrap b{white-space: normal !important; display: inline !important;}\
      \
		.audio_table .audio td.info { width: 340px !important;}\
		.audio_table .audio td { padding-left: 0px; }\
		.audio_table .audio .title_wrap, .audio_list .audio_title_wrap {width: 315px !important;}\
		.audios_row .actions { padding-left: 0px !important; }\
		.audios_row .actions a{padding-right:2px !important; padding-left:2px !important;}\
		.audios_row .audio_title_wrap{ width: auto !important; max-width: 295px; }\
      div.results .audios_row .audio_title_wrap{width: auto !important; max-width: 490px; }\
      .choose_audio_row .audio_title_wrap { width: 350px !important; }\
		.post_media .audio_title_wrap { width: 250px !important;}\
      \
      #audio.new .audio .info { width: 370px !important;}\
      #pad_playlist .audio .info {width: 435px !important;}\
      #pad_playlist .audio .title_wrap {width: auto !important; }\
      \
		#mail_envelope .audio_title_wrap { width: 215px !important;}\
      .narrow_column .audio_title_wrap { width: 115px !important;}\
      #profile_audios .audio_title_wrap { width: auto;}\
      /*.audios_module .audio .title_wrap { width: 318px !important;}*/\
      #vk_audio_fr_refresh{float:right; font-size:19px; border-left:1px solid #DDD; padding:0 5px;}\
	';
   main_css+=vk_audio_player.gpCtrlsStyle;
   
   //video downloads styles
   main_css+="\
     .vk_down_icon{\
        background: #E1E7ED url('/images/icons/darr.gif') 6px 7px no-repeat;\
        height: 17px;\
        border-radius: 3px;\
        -moz-border-radius: 3px;\
        color: #6A839E;\
        padding: 3px 0px 0px 17px;\
        display: inline-block;\
        margin:1px 2px 1px 2px;\
     }\
     .video div.vk_vid_download_t{right:auto; bottom:auto;}\
     .video div.vk_vid_download_t a{color:#FFF; background-color:rgba(0,0,0,0.5)}\
     .video div.vk_vid_download_t img{height:auto; weight:auto;}\
     .wall_module .page_media_thumb.page_media_video{height:auto;}\
     .vk_vid_add_hidden{display:none}\
   ";
	  //extend switch color in viewer
	if (MoreDarkPV=='y') main_css+="\
		.pv_dark .pv_cont #pv_box,.pv_dark .info{background:#000 !important; color: #FFF !important;} \
		.pv_dark .pv_cont #pv_box DIV{border-color:#444 !important;}\
		.pv_dark .pv_cont SPAN{color:#DDD !important;}\
		.pv_dark .pv_cont A{color:#888 !important;}\
      .pv_dark #pv_comments_header{background-color:#222 !important; color:#AAA  !important;}\
		.pv_dark #pv_actions a:hover {background-color:#444 !important; color:#FFF  !important;}\
      .pv_dark .pvs_act{background-color:#000 !important;}\
      #layer_bg.pv_dark { opacity: 0.9 !important; }\
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
      #vk_sound_vol{text-align:center; width:200px; margin:0 auto;}\
      #wmdonate .sett_block{width:96%; height:110px;}\
      #wmdonate .sett_block .stext{width: 190px;}\
	"; 
	
	var shut='\
		.shut .module_body, .shut #profile_photos_upload_wrap{	display: none !important;}\
		.shut { padding-bottom: 3px !important; }\
      .vk_shut_btn{ display:block; background:url("http://vkontakte.ru/images/flex_arrow_open.gif") no-repeat -6px 2px; width:20px; height:20px; margin:-4px 0; }\
      .shut .vk_shut_btn{ background-image:url("http://vkontakte.ru/images/flex_arrow_shut.gif");}\
		#profile_wall.shut div,#profile_photos_module.shut #profile_photos{display: none !important;}\
		#profile_wall.shut div.module_header, #profile_photos_module.shut div.module_header {display: block !important;}\
		.module_header.shutable .header_top{ background: #e1e7ed;	}\
		.shut .module_header.shutable .header_top{ background: #eeeeee;}\
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

   
   if (getSet(67)=='y') 
      main_css+='#left_friends{display:none !important;}';
      
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
         .vk_slider_scale {  cursor: pointer;  padding-top: 3px; }\
         .vk_slider_line {  cursor: pointer;  border-bottom: 1px solid #5F7D9D; }\
         .vk_slider {  cursor: pointer;  background: #5F7D9D;  width: 11px;  height: 4px; }\
         \
         .vk_vslider_wrap{width:5px;}\
         .vk_vslider_scale {  cursor: pointer;  padding-top: 3px; }\
         .vk_vslider_line {  cursor: pointer;  width:4px; background: #BAC7D4; position: absolute; border-radius: 2px; margin-left: 2px;}\
         .vk_vslider_line_bg { background:#5F7E9E; position:relative; border-radius:2px; }\
         .vk_vslider {  cursor: pointer;  position:absolute; background: #5F7E9E;  width: 8px;  height: 8px; border-radius:4px; }\
         \
         .zoom_ico_white{\
            width:14px; \
            height:14px; \
            background:url('http://st0.userapi.com/images/icons/photo_icons.png') 0 -62px;\
            opacity:0.75;\
            -webkit-transition: opacity 100ms linear;\
            -moz-transition: opacity 100ms linear;\
            -o-transition: opacity 100ms linear;\
            transition: opacity 100ms linear;\
         }\
         .zoom_ico_white:hover{opacity:1;}\
         .doc_gif_anim .page_doc_photo{width: auto !important;}\
         .doc_gif_anim .page_doc_photo img{max-height:none !important;}\
         .wall_module .doc_gif_anim img { max-width: 320px;}\
         .wide_wall_module .doc_gif_anim img {max-width: 500px !important;}\
         \
         .vk_edit_ico {\
           background: url(/images/icons/audio_icons.png?2) -136px -51px no-repeat;\
           height: 13px; width: 13px;\
           opacity:0.5;\
           cursor:pointer;\
         }\
         .vk_edit_ico:hover {opacity:1}\
         .cur_section .vk_edit_ico{       background-position: -151px -51px; }\
         \
         .vk_mob_ico {  background: url(/images/mobile_online.gif) no-repeat transparent; height: 12px;margin-left: 4px;padding-left: 10px;width: 0px;}\
         .vk_album_done_link  .vk_album_count{display:none;}\
	";
   main_css+=vk_board.css;
   main_css+=vk_photos.css;
   main_css+=vk_audio.css;
   main_css+=vk_videos.css();
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


function sideBar(original){
	var sb=(ge('sideBar') || ge('side_bar'));
	if (original) return sb;
	if (getSet(31)=='y') 
		return ge('right_bar');
	else 
		return sb;
}

function vkMakeRightBar(){
	var page_layout=ge('page_layout');
	if (!page_layout) return;
   var el=ge('pageHeader') || ge('pageHeader1') || ge('page_header');
	var h=getSize(el,true)[1]+getXY(el)[1];
   
	vkaddcss('\
      #side_bar {width:130px !important;} \
      .audio_fixed_nav #right_bar, .im_fixed_nav #right_bar{position: fixed; z-index: 119; top:'+h+'px;}\
      /*#gp{margin-left: 130px !important; }\
      #gp.reverse{margin-left: 0px !important;}*/\
      #main_feed #feed_rate_slider_wrap { right: 152px; } \
      #footer_wrap{ width: 100% !important;}\
   ');// 
	vk.width=vk.width+120;
   vk.width_dec=280;
	Inj.Start('handlePageView','if (params.width) params.width+=120; if (params.width_dec) params.width_dec+=120;');
	Inj.Replace('handlePageView','791','911');
	Inj.Replace('handlePageView','160','280');
   Inj.Before('updGlobalPlayer','var sbw','pbsz[0]+=120;');
   
	var new_width=getSize(page_layout)[0]+120;
	page_layout.style.width=new_width+'px';
	var bar=vkCe('div',{id:'right_bar',"class":'fl_r'});
	var bar_cont=vkCe('div',{id:'right_bar_container',"class":'fl_r'});
	bar_cont.appendChild(bar);
	
	var ref=ge('page_body');
	
	ref.parentNode.insertBefore(bar_cont,ref);
	if (getSet(35)=='y'){
		if (ge("left_money_box")) bar.appendChild(ge("left_money_box"));
		if (ge("left_blocks")) bar.appendChild(ge("left_blocks"));
		var b=geByClass('left_box',ge('side_bar'))[0];
      if (b && b.parentNode && (b.parentNode.id || "").match(/left_block\d+_\d+/)) b = b.parentNode;
		if (b) bar.appendChild(b);
	}
   updSideTopLink(true);
}
//if (getSet(44)=='y') vkMoveSuggFrBox();
function vkMoveSuggFrBox(){
	var e=geByClass('ad_box_friend',ge('left_ads'))[0]; 
	if (!e) return;
	var e2=vkNextEl(e); 
	ge('left_blocks').appendChild(e); 
	if (!e2) ge('left_blocks').appendChild(e2);
}

function vkFrCat2Menu(ret){
  var str='';
  if (window.vkFrCatList){
  for (var key in vkFrCatList){ str+='<li><a class="left_row" href="friends?section=list'+key+'"><span class="left_label inl_bl">-- '+vkFrCatList[key]+'</span></a></li>\n';}
  } else {
    vkLoadFiendsGroups();
  }
  if (ret) {return str;} else {
    if (ge('vkm_friends'))  ge('vkm_friends').innerHTML+=str; 
  } 
}
  
function vkLoadFiendsGroups(sh){
	dApi.call('friends.getLists',{},function(r){
		var f=r.response;
		vkFrCatList=[];
		var str=[];
		for (var i=0;i<f.length;i++){
			str.push(f[i].lid+":'"+f[i].name+"'");
			vkFrCatList[f[i].lid]=f[i].name;
		}
		str="vkFrCatList={"+str.join(',')+'};';
		if (sh) {window.prompt("Copy to vkops.js","vkFrCatList="+str+";");} else {
		  vkFrCat2Menu();
		}
	});
}


function vkFixedMenu(){
	if (!window.getSize) return;
	var cfg=getSet(18);
	var cfg_r=getSet(37);
	if (cfg=='n' || cfg=='0') return;
	var el=ge('pageHeader') || ge('pageHeader1') || ge('page_header');
	var side_bar=(ge('sideBar') || ge('side_bar'));
	var right_bar=ge('right_bar');
	var h=getSize(el,true)[1]+getXY(el)[1];
	vkaddcss("#sideBar,#side_bar"+(cfg_r=='y'?", #right_bar":'')+"{ position: fixed;z-index: 101; top: "+h+"px }\
         .audio_fixed_nav #side_bar, .im_fixed_nav #side_bar"
         +(cfg_r=='y'?", .audio_fixed_nav #right_bar, .im_fixed_nav #right_bar":'')+"{top: "+h+"px !important; }\
         #page_wrap{overflow: visible !important;}\
         #fmenu{display:none !important;}\
         #stl_side { z-index: 0 !important;}");
	var onscroll=function(){
		removeEvent(window, 'scroll', onscroll);
		var ntop=h-getScrollTop();
		ntop=ntop<0?0:ntop;
		animate(side_bar, {top: ntop}, 400, function(){addEvent(window, 'scroll', onscroll); onscroll();});
	};
	var onscroll_r=function(){
		removeEvent(window, 'scroll', onscroll_r);
		var ntop=h-getScrollTop();
		ntop=ntop<0?0:ntop;
		animate(right_bar, {top: ntop}, 400, function(){addEvent(window, 'scroll', onscroll_r); onscroll_r();});
	};	
	if (cfg=='y' || cfg=='1')	  
		addEvent(window, 'scroll', onscroll);
	if (right_bar && cfg_r=='y' && (cfg=='y' || cfg=='1'))	  
		addEvent(window, 'scroll', onscroll_r);
}

function vkMenu(){//vkExLeftMenu
  var CSS_ICONS=false;
  var tstart=tend=unixtime();
  var cfg=getSet(15);
  var MFR_CFG=13; //mod my friends
  var LOAD_FR_CATS_CFG=14; //load friends categories in ext menu
  var UNREADMSG_CFG=19;//unread msg in ex menu
  var WALL_LINK = (getSet(29)=='y');
  var exm=(getSet(12) == 'y')?true:false; //extended menu
  var nav=(ge('sideBar') || ge('side_bar')).getElementsByTagName('ol')[0];
  if (cfg > 0) nav.innerHTML=nav.innerHTML.replace(RegExp('(">)(\u041c\u043e\u0439|\u041c\u043e\u044f|\u041c\u043e\u0438|\u041c\u043e\u0457|\u041c\u0430\u044f|\u041c\u0430\u0435|\u041c\u043e\u0435|My) ','g'),"$1");

  var vkmenu_css1='\
         #nav a IMG, #side_bar ol a IMG{margin-right:3px; height:'+vkMenuIconSize+'px;}\
         #nav a .vkicon, #side_bar ol a .vkicon{float:left; width:13px; height:13px; margin-right:1px; /*background:#DDD;*/}\
         .vkico_friends, .vkico_profile, .vkico_albums,\
         .vkico_video,.vkico_audio,.vkico_mail,.vkico_im,\
         .vkico_notes,.vkico_groups,.vkico_events,\
         .vkico_feed, .vkico_newsfeed,.vkico_fave,\
         .vkico_settings,.vkico_apps,.vkico_docs,\
         .vkico_wall,.vkico_gifts,.vkico_vkplug,.vkico_vkopt,.vkico_app,.vkico_ads,.vkico_pages{background:url("http://vk.com/images/icons/mono_iconset.gif") no-repeat;}\
         .left_row  .vkicon{margin: 4px 3px -4px 0px;}\
         \
         .vkico_profile{background-position:0 0px;}\
         .vkico_albums{background-position:0 -29px;}\
         .vkico_friends{background-position:0 -88px;}\
         .vkico_video{background-position:0 -74px;}\
         .vkico_audio{background-position:0 -221px;}\
         .vkico_mail,.vkico_im{background-position:0 -193px;}\
         .vkico_notes{background-position:0 -133px;}\
         .vkico_groups{background-position:0 -177px;}\
         .vkico_feed, .vkico_newsfeed{background-position:0 -163px;}\
         .vkico_fave{background-position:0 -118px;}\
         .vkico_settings,.vkico_vkplug, .vkico_vkopt{background-position:0 -58px;}\
         .vkico_apps, .vkico_app{background-position:0 -104px;/-207px*/}\
         .vkico_docs{background-position:0 -148px;}\
         .vkico_wall{background-position:0 -44px;}\
         \
         .vkico_ads{background-position:0 -235px;}\
         .vkico_pages{background-position:0 -133px;}\
         \
         /*.vkico_events{background-position:0 -168px;}*/\
         /*.vkico_gifts{background-position:0 -104px;}*/\
   ';//float:left; 

  var vkmid=remixmid();//#nav li:hover ul{display:block;}\
  vkaddcss(vkmenu_css1+"\
      #nav li ul, #side_bar li ul, #sideBar li ul{display:none;}\
      #nav li ul, #side_bar li ul, #sideBar li ul{position:absolute; z-index:999; /*background:#FFF;*/ width:130px; margin-left:70px;padding-left:0px; border:1px solid #AAA; }\
      #nav ul li, #side_bar li ul, #sideBar li ul{list-style:none;}\
      #side_bar ol li#myprofile ul a { display: block;  padding: 4px 3px 4px 6px; }\
	   /*#stl_side { z-index: 0 !important;}*/\
  ");
  
  var icon_url='http://vkoptimizer.narod.ru/icons/';
  var MenuIcons={
      'profile':'home.png',
      'friends':'freinds.png',
      'albums':'photo.png',
      'video':'videos.png',
      'audio':'audios.png',
      'mail':'mail.png',
	  'im':'mail.png',
      'notes':'notes.png',
      'groups':'groups.png',
      'events':'events.png',
      'newsfeed':'news.png',
      'feed':'news.png',
      'fave':'fave.png',
      'settings':'settings.png',
      'matches':'matches.png',
      'opinions':'opinions.png',
      'questions':'questions.png',
      'apps':'apps.png',
	  'docs':'docs.png',
	  'wall':'wall.png',
      'market':'market.png',
      'gifts':'gift2me.png'
  };
  // sub_item = [link, lang, show_only_when_<b>21</b>, expressinon_when_item_hide]
 var ExMenu={ 
    //*
    'profile':[
      ['gifts'+vkmid,IDL('clGi')],
      [['fans.php?act=fans&mid='+vkmid,"return !showTabbedBox('al_fans.php', {act: 'show_fans_box', oid: "+vkmid+"}, {cache: 1}, event);"],IDL('clFans')],
      [['fans.php?act=idols',"return !showTabbedBox('al_fans.php', {act: 'show_publics_box', oid: "+vkmid+"}, {cache: 1}, event);"],IDL('clSubscriptions')],
      [['stats?mid='+vkmid,'return;'],IDL('Stats')]
    ],//*/
    /*
    'edit':[
      ['?','Edit1'],
      ['?','qazqaz']
    ],//*/
    'friends':[
      ['friends?section=all',IDL("mFrA")],
      ['friends?section=online',IDL("mFrO")],
      ['friends?section=recent',IDL("mFrNew")],
      ['friends?section=suggestions',IDL("mFrSug")],
      ['friends?section=requests',IDL("mFrR"),true],
      ['friends?section=all_requests',IDL("mFrAllReq")],
      ['friends?section=out_requests',IDL("mFrOutReq")],
      [['/friends?w=calendar','return nav.change({w: \'calendar\'})'],IDL("Birthdays")] 
    ],
    'albums':[
        ['albums'+vkmid,IDL("mPhM")],
        ['friendsphotos',IDL("mPhFrP")],
        ['tag'+vkmid,IDL("mPhW")],
        [["#","showBox('al_photos.php', {act: 'new_album_box'},{stat: ['photos.css']}); return false;"],IDL("mPhN")],
        ['photos'+vkmid+'?act=comments',IDL("mPhC")],
        ['photos'+vkmid,IDL("mPhA")],
        ['albums'+vkmid+'?act=added',vk_lang["mTags"],true]
    ], 
    'video':[
        ['video',IDL("mViM")],
        ['video?section=tagged',IDL("mViW")],
        ['video?section=comments',IDL("mPhC")],
        [['#',"showTabbedBox('al_video.php', {act: 'upload_box', oid: cur.oid}, {stat: ['video_edit.css', 'privacy.css', 'privacy.js', 'uploader.js']}); return false;"], IDL("mViN")], //'video.php?act=new'
        ['video?section=tagged',vk_lang["mTags"],true]
    ],
    'audio':[
        ['audio',IDL("mAuM")],
        ['audio?act=edit',IDL("mAuE")],
        [['#',"showBox('/audio', extend({}, {act: 'new_audio'}), {   params: {width: '430px'}, stat: ['audio.css','audio.js'] }); return false;"],IDL("mAuN")] 
    ],
    'mail':[
        ['mail',IDL("mMaI")],
        ['mail?section=outbox',IDL("mMaO")],
        ['mail?section=spam',IDL("Spam")],
        ['im',IDL('mDialogsMessages')]
		//,[['im.php?act=a_box&popup=1',''],IDL('mQuickMessages')]
    ],
    'notes':[   
        ['notes',IDL("mNoM")],
        ['notes?act=new',IDL("mNoN")],
        ['notes?act=comments',IDL("mNoC")],
        ['notes?section=friends',IDL("mNoF")],
        ['notes?section=fave',IDL("mNoI")]
    ],
    'groups':[
        ['groups',IDL("mGrM")],
        ['groups?tab=inv',IDL("mGrInv")],
        ['search?c[section]=groups',IDL("mGrS")],
        ['groups?tab=admin',IDL("mGrAdmin")]
    ],
    'events':[
        ['events?tab=future',IDL("mEvF")],
        ['events?tab=past',IDL("mEvL")],
        ['events?tab=calendar',IDL("mEvC")],
        ['search?c[section]=events',IDL("mEvS")]
    ],
   'gifts':[
        ['gifts.php?act=wishlist',IDL("mWishMy")],
        ['gifts.php?act=wishlist&done=1',IDL("mWishDone")],
        ['gifts.php?act=wishlist&mid=-1',IDL("mWishFr")]
    ],
   /*'gifts':[
        ['gifts#act=wishlist',IDL("mWishMy")],
        ['gifts#act=wishlist&done=1',IDL("mWishDone")],
        ['gifts#act=wishlist&mid=-1',IDL("mWishFr")]
    ],*/	
    'feed':[
        ['feed',IDL("mNeP")],
        ['feed?section=updates',IDL("mNeU")],
        //['feed?section=friends',IDL("mNeF")],
        ['feed?section=groups',IDL("mNeG")],
        ['feed?section=notifications',IDL("mNeNotif")],
        ['feed?section=photos',IDL("clPh")],
        ['feed?section=mentions',IDL("mNeMe")],
        ['feed?section=recommended',IDL("mNeR")],
        //['feed?section=suggested',IDL("mNeR")+' 2'],
        ['feed?section=articles',IDL("mNeArticles")],
        ['feed?section=comments',IDL("mNeB")],
        ['tag'+vkmid+'?act=comments',IDL("mNeFW")]       
    ],
	'fave':[
        ["fave?section=users",IDL("mFaV")],
        ["fave?section=links",IDL("mFaL")],
        ["fave?section=likes_photo",IDL("mFaP")],
        ["fave?section=likes_video",IDL("mFaVI")],
        ["fave?section=likes_posts",IDL("mFaPO")],
        ["cc",IDL("vk_cc")],
    ],
    'settings':[
        ['settings',IDL("mSeO")],
        ['settings?act=privacy',IDL("mSeP")],
        ['settings?act=notify',IDL("mSeN")],
        ['settings?act=blacklist',IDL("mSeB")],
        ['settings?act=mobile',IDL("mSeMobile")],
        [['settings?act=vkopt',"vkShowSettings(false); return false;"],"VKOpt"], //['settings?act=vkopt" onClick="vkShowSettings(false); return false;',"VKOpt"],   
        [['settings?skinman','vkShowSkinMan(); return false;'],IDL("SkinMan")/*,false,vkbrowser.mozilla*/],
        [['#','hz_chooselang(); return false;'],IDL("ChangeVkOptLang")] 
    ],
    'matches':[
        ['matches.php',IDL("mMaM")],
        ['matches.php?act=search',IDL("mMaS")],
        ['matches.php?act=sent',IDL("mMaSe")]    
    ],
    'opinions':[
        ['opinions.php',IDL("mOpA")],
        ['opinions.php?act=outbox',IDL("mOpO")],
        ['opinions.php?act=friends',IDL("mOpF")]    
    ],
    'apps':[
        ['apps?act=apps',IDL("mApM")],
        ['apps?act=catalog',IDL("mApA")],
        ['apps?act=notifications',IDL("mTags"),true],
        ['apps?act=settings',IDL("mApS")]  
        //,[['#',"Ajax.Send(\'apps.php?act=a_delete_all_not\', {}, function(){vkLoadLeftMenu();}); return false;"],IDL('MyTagsDelete'),true]    
    ],
    'questions':[
        ['questions.php',IDL("mQuM")],
        ['questions.php?act=add_question',IDL("mQuN")],
        ['questions.php?act=all',IDL("mQuS")],
        ['questions.php?act=friends',IDL("mQuF")],
        ['questions.php?act=answered',IDL("mQuA")]    
    ],
    'market':[
        ['market.php',IDL("mMaA")],
        ['market.php?show=my',IDL("mMaN")],
        ['market.php?show=fave',IDL("favorites")],
        ['market.php?show=friends',IDL("mMaF")]    
    ],
	'wall':[
		['wall'+remixmid(),IDL('mWAllPosts')],
		['wall'+remixmid()+'?own=1',IDL('mWMyPosts')],
      ['notes',IDL("mNoM")],
      ['notes?act=new',IDL("mNoN")],
      ['notes?act=comments',IDL("mNoC")]
	],	
    'vkopt':[
         [["#","UpdateCounters(); return false;"],IDL("updateLMenu")],
         ["http://vkopt.net/",'<b>VkOpt Forum</b>']
    ]
  };
  ExMenu['im']=ExMenu['mail'];
  if (vk_DEBUG){
   ExMenu['vkopt'].push([["#","if (window.vk_updmenu_timeout) clearTimeout(vk_updmenu_timeout); return false;"],'<b>Stop Upd Menu</b>']);
   ExMenu['vkopt'].push([["#","vkPhotoUrlUpload(prompt('Image URL:')); return false;"],'UploadImg']);
  }
  /* 
  ExMenu['vkopt']=[];
  ExMenu['vkopt'].push(["javascript: vkHighlightCounters();",IDL("updateLMenu")]); 
  ExMenu['vkopt'].push(["http://vkopt.net/",'<b>VkOpt Forum</b>']);
  */
  
  vkMenuCurrentSub=null;
  vkMenuHider=null;
  
  vkMenuItemHover=function(e,elem){
    if (!elem) return true;
    var cur=elem.parentNode.getElementsByTagName('ul')[0];
    if (vkMenuCurrentSub!=cur) {  vkMenuHide();  show(cur);   vkMenuCurrentSub=cur; }
    clearTimeout(vkMenuHider);
  }
  vkMenuItemOut=function(e,elem){ clearTimeout(vkMenuHider);  vkMenuHider=setTimeout(vkMenuHide,vkMenuHideTimeout); }
  vkMenuHide=function(){if (vkMenuCurrentSub){ hide(vkMenuCurrentSub); vkMenuCurrentSub=null; }}
  var setActions=function(elem){
      if (elem){
        elem.setAttribute('onmousemove','vkMenuItemHover(event,this)');
        elem.setAttribute('onmouseout','vkMenuItemOut(event,this)');  
      } else return ' onmousemove="vkMenuItemHover(event,this)" onmouseout="vkMenuItemOut(event,this)" ';
  }
  
  if (WALL_LINK){
	var li=vkCe('li',{},'<a class="left_row" href="/wall'+remixmid()+'" onclick="return nav.go(this, event);"><span class="left_label inl_bl">'+IDL('wall')+'</span><span></span></a>');
	var md=geByClass('more_div',nav)[0];
	if (md) insertAfter(li,md) 
	else nav.appendChild(li);
  }
  //*
  var div=document.createElement('div');
  div.className='moreDiv more_div';
  nav.appendChild(div);
  var li=vkCe('li',{id:"frOpt"},'<a class="left_row" href="settings?act=vkopt" onclick="vkShowSettings(true); return false;"><span class="left_label inl_bl">'+IDL('VKopt',1)+'</span><span></span></a>');
  nav.appendChild(li);
  //*/
  
  
  var ass=nav.getElementsByTagName('a');
  var items=[];
  for (var i=0; i<ass.length;i++) items.push(ass[i]);
  for (var i=0;i<items.length;i++) if (items[i].parentNode.tagName=='LI' || items[i].parentNode.tagName=='TD'){
    var item=items[i];
    var page=item.href.match(/\/([A-Za-z]+)(\.php|\d+|\?|$)/);//
	//vklog(page);
    if (item.className=='hasedit' || item.className=='hasedit fl_l' || item.id=='myprofile')
      page='profile';
    else if (item.href.indexOf('act=vkopt')!=-1)
      page='vkopt';
    else 
      page=(page)?page[1]:'';
    
    if (page=='friends'){
      var frlnk='friends';
	  switch ( parseInt(getSet(MFR_CFG)) ){
      case 1: frlnk="friends?section=online"; break;
      case 2: frlnk="friends"; break;
      }
	  item.href='/'+frlnk;
	  if (parseInt(getSet(MFR_CFG))) {Inj.Replace('handlePageParams',"'friends'","'"+frlnk+"'");}
    }


    if (cfg > 1 && !(hasClass(item,'fl_r') || item.id=='myprofile_edit')){// && MenuIcons[page]
      /*
      var img=document.createElement('img');
      img.src=(cfg == 2)?icon_url+MenuIcons[page]:vkSideImg(page);
      item.insertBefore(img,item.firstChild);*/
      var ico=document.createElement('div');
      ico.className='vkicon vkico_'+page;
      item.insertBefore(ico,item.firstChild);
      
      
    }
    var bcout=item.innerHTML.match(/<b>(\d+)<\/b>/);
    bcout=(bcout)?bcout[1]:0;
    var submenu=ExMenu[page];
    if (!submenu && exm) item.setAttribute('onmousemove','vkMenuHide();');
    if (submenu && (exm || page=='vkopt')){
      var ul=document.createElement('ul');
      ul.id='vkm_'+page;
      setActions(item);
      setActions(ul);
      var html="";
	  //  onclick="return nav.go(this, event);"
      for (var k=0;(submenu && k<submenu.length);k++){
          if (submenu[k][3]) continue;
		  var onclick=' onclick="return nav.go(this, event);" ';
		  var href=' href="'+submenu[k][0]+'" ';
		  if (typeof submenu[k][0]!='string'){
			onclick=' onclick="'+submenu[k][0][1]+'" ';
			href=' href="'+submenu[k][0][0]+'" ';			
		  }
        if (href.indexOf('http://')!=-1) onclick='';
        
          html+=(submenu[k][2] && bcout)?'<li><a class="left_row" '+href+onclick+'><span class="left_label inl_bl">- '+submenu[k][1]+'</span></a></li>':'';/*.replace(/%%/i,bcout)  href="'+submenu[k][0]+'"*/
          html+=(!submenu[k][2])?'<li><a class="left_row" '+href+onclick+'><span class="left_label inl_bl">- '+submenu[k][1]+'</span></a></li>':'';

      }
      ul.innerHTML=html;
      if (page=='profile') item.parentNode.appendChild(vkCe('div',{"class":"clear"}));
      item.parentNode.appendChild(ul);
    }
  }
  var nav=(ge('sideBar') || ge('side_bar')).getElementsByTagName('ol')[0];
  //var nav=ge('nav');
  /*var div=document.createElement('div');
  div.className='moreDiv more_div';
  nav.appendChild(div);
  if (window.vkNavLinks){
        var li=document.createElement('li');
        var html='';
        for (var i=0;i<vkNavLinks.length; i++)  html+='<a href="'+vkNavLinks[i][1]+'" '+(vkNavLinks[i][2]?vkNavLinks[i][2]:'')+'>'+vkNavLinks[i][0]+'</a>';
        li.id='frNavLinks';
        li.innerHTML=html;
        nav.appendChild(li);  
  }*/
  /*var li=document.createElement('li');
  var html="";
  for (var i=0;window.vkNavLinks && i<vkNavLinks.length; i++)  html+='<a href="'+vkNavLinks[i][1]+'" '+(vkNavLinks[i][2]?vkNavLinks[i][2]:'')+'>'+vkNavLinks[i][0]+'</a>';
  html+='<a href="settings?act=vkopt" '+setActions()+' onclick="vkShowSettings(true); return false;">'+ExMenu.vkopt[0]+'</a><ul '+setActions()+'>'+ExMenu.vkopt[1]+'</ul>';
  li.id='frOpt';
  li.innerHTML=html;
  nav.appendChild(li);*/
  if (window.vkLinks && vkLinks.length>1){
        var li=document.createElement('li');
        var html='<a class="left_row" href="#" '+setActions()+' onclick="return false;"><span class="left_label inl_bl">'+vkLinks[0]+'</span></a><ul '+setActions()+'>';//
        for (var i=1; i<vkLinks.length; i++)  html+='<a  class="left_row" href="'+vkLinks[i][1]+'"><span class="left_label inl_bl">'+vkLinks[i][0]+'</span></a>';
        li.id='frLinks';
        li.innerHTML=html+'</ul>';
        nav.appendChild(li);  
  }
  var div=document.createElement('div');
  div.id='vkstatus';
  nav.appendChild(div);
  /* Call others functions */ 
  if (getSet(UNREADMSG_CFG)=='y') UpdateCounters(true);
  if (getSet(LOAD_FR_CATS_CFG)=='y') vkFrCat2Menu();
  
  /* Calc menu generation time */
  tend=unixtime()-tstart;
  vklog('Menu creating time:' + tend +'ms')
  return tend;
}

function vkCheckNewMessages(data){
	var unread_in_exmenu=getSet(19);
	var make_list=function(msg_list){
		var sort_msg=function(a, b){
		  if(a[0]>b[0]) return -1 
		  if(a[0]<b[0]) return 1 
		  return 0
		}
		msg_list.sort(sort_msg);
			
		var mel=ge('vkm_mail');
		var p=ge('vk_msg_list');
		if (mel){ 
			if (!p) mel.innerHTML+='<li id="vk_msg_list"></li>';
			p=ge('vk_msg_list');
			var html='';
			for (var i=0;i<msg_list.length;i++)
				html+='<a class="left_row" href="/mail?act=show&id='+msg_list[i][0]+'" onclick="return nav.go(this, event);"><span class="left_label inl_bl">-- '+msg_list[i][1]+'</span></a>';
			p.innerHTML=html;
		}
	}
	if (data.messages.count && unread_in_exmenu=='y'){
		var ms=data.messages.items;
		var msg_list=[];
		for (var key in ms) msg_list.push([parseInt(key),ms[key]]);
		make_list(msg_list);
	} else if (data.messages.count==0){
		var p=ge('vk_msg_list');
		if (p) p.innerHTML='';
	}
}

var vk_updmenu_timeout=0;
var VK_MENU_LAST_HIGHLIGHT=[];



function UpdateCounters(only_msg,data){	
	var AUTO_UPD_MENU=20; //cfg bit id
	clearTimeout(vk_updmenu_timeout);
	var menu_vars = { 
		"friends": 	{i:0, id:'fr',lnk:'friends',add:null},
		"photos": 	{i:1, id:'ph',lnk:'albums' + vk.id,add:'act=added'},
		"videos": 	{i:2, id:'vid',lnk:'video',add:'section=tagged'},	
		"messages": {i:3, id:'msg',lnk:'mail',add:null},
		"groups": 	{i:5, id:'gr',lnk:'groups',add:'tab=inv'}	
		
		/*OLDEST INACTIVE* /
      "notes": 	{i:4, id:'nts',lnk:'notes',add:'act=comments'},
      "events": 	{i:6, id:'ev',lnk:'events',add:'tab=inv'},
		"gifts": 	{id:'wsh',lnk:'gifts.php?act=wishlist',add:null},
		"offers": 	{id:'mat',lnk:'matches.php',add:null},   
		"opinions": {id:'op',lnk:'opinions.php',add:null},
		"questions":{id:'ques',lnk:'questions.php',add:null}*/
	}
	var HL=[];
	if (!window.VK_LAST_COUNTERS) {
		//ol=sideBarMenu();
		var cnt=[0,0,0,0,0,0,0];
		if (!only_msg){
			for (var key in menu_vars){
            var e=menu_vars[key];
            var el=ge('l_'+e.id);
            if (!el) return;
            var v = (geByClass1('left_count', el.firstChild, 'span') || geByTag1('span', el.firstChild)).innerHTML.match(/\d+/);
				console.log(v);
            v=v?v:0;
				cnt[e.i]=v;
			}
			window.VK_LAST_COUNTERS=cnt.join('-');
		}
	}
	//javascript: vkCmd('menu_counters','{"friends":{"count":3041},"messages":{"count":0},"events":{"count":0},"groups":{"count":1153},"photos":{"count":0},"videos":{"count":100},"notes":{"count":0},"opinions":{"count":0},"offers":{"count":0},"questions":{"count":0},"gifts":{"count":0}}');
	var onupdate = function(r,t){
		if (t.indexOf('messages')!=-1){
			if (r) vkCmd('menu_counters',t);
			var c=eval('('+t+')');
			var cnt=[0,0,0,0,0,0,0];
			for (var key in c)
				if (menu_vars[key]) cnt[menu_vars[key].i]=c[key].count; 
				
			vkCheckNewMessages(c);		
			
			if (only_msg) return;
			if (VK_LAST_COUNTERS!=cnt.join('-')){
				//if (VK_LAST_COUNTERS!=t)
				var old=VK_LAST_COUNTERS.split('-');
				for (var key in menu_vars){
					var e = ge('l_' + menu_vars[key].id);
					var v=c[key].count;
               if (window.handlePageCount){
                  handlePageCount(menu_vars[key].id, v,menu_vars[key].lnk,menu_vars[key].add);
               } else {
                  toAdd = (v && menu_vars[key].add) ? ('?' + menu_vars[key].add) : '';
                  geByTag1('span', e.firstChild).innerHTML = v ? ('(<b>' + v + '</b>)') : '';
                  e.firstChild.href = '/' + menu_vars[key].lnk + toAdd;
                  e.firstChild.onclick = function (ev) { return nav.go(this, ev);}; 
                  if (parseInt(old[menu_vars[key].i])!=v) {
                     HL.push(e.firstChild);
                     //vkMenuHighlightEl(e.firstChild);
                  }
               }
					
				}
				VK_LAST_COUNTERS=cnt.join('-');
				VK_MENU_LAST_HIGHLIGHT=HL;
				//vkHighlightCounters();
				vklog('Menu counters are updated');
			}
		}
		//vkCmd('menu_counters',res.response[0].online);
		//vkGenDelay(vk_upd_menu_timeout,r)

		if (getSet(AUTO_UPD_MENU) == 'y') vk_updmenu_timeout=setTimeout("UpdateCounters();",vkGenDelay(vk_upd_menu_timeout,r));	
	};
	if (data){
		onupdate(null,data);
	} else {
		AjGet('feed2.php?mask=m'+vkRand(),onupdate);
	}
}

function vkHighlightCounters(){
	var vkMenuHighlightEl=function(e){
		//*
      
      /* REPLACE TO CSS ANIMATION
		var e=vk$(e); 
		var backcolor=e.css('backgroundColor'); 
		e.animate({backgroundColor:SIDEBAR_ITEM_HIGHLIGHT_COLOR},700,function(){//rgb(255,255,0)
			setTimeout(function(){
				e.animate({backgroundColor:backcolor},700,function(){e.css('backgroundColor',"")});
			},MENU_HIGHLIGHT_DELAY);
		});*/
      
      
		//*/
		/*
		var backcolor=getStyle(e, 'backgroundColor');
		animate(e, {backgroundColor: SIDEBAR_ITEM_HIGHLIGHT_COLOR}, 700,function(){//rgb(255,255,0)
			setTimeout(function(){
				animate(e,{backgroundColor:backcolor},700,function(){setStyle(e,{backgroundColor: ''})});
			},MENU_HIGHLIGHT_DELAY);
		});		
		*/
	}
	for (var i=0;i<VK_MENU_LAST_HIGHLIGHT.length;i++) vkMenuHighlightEl(VK_MENU_LAST_HIGHLIGHT[i]);
}

function vkMoneyBoxAddHide(){
	var mb=ge('left_money_box');
	if (!mb) return;
	var lmb=vkCe('div',{id:'left_block_money',onmouseover:"leftBlockOver('_money')",onmouseout:"leftBlockOut('_money')"});
	var hb=vkCe('div',{id:'left_hide_money', "class":"left_hide", onmouseover:"leftBlockOver(this)",onmouseout:"leftBlockOut(this)",onclick:"hide('left_block_money')"});
	mb.parentNode.insertBefore(lmb,mb)
	lmb.appendChild(hb);
	lmb.appendChild(mb);
}

function vkWallAddBtnOnError(){
   var oid=nav.objLoc[0].match(/wall(\d+)/);
   var el=ge('msg_back_button');
   if (oid && el){
      el.parentNode.parentNode.innerHTML+=
      '<a href="wall'+oid[1]+'?own=1"><div style="display: block; margin: 15px auto 0px;" class="button_gray"><button style="width: 100%;">'+IDL('GoToUserPosts')+'</button></div></a>'
   }
}
function UserOnlineStatus(status) {// ADD LAST STATUS
	if (window.vk_check_online_timeout) clearTimeout(vk_check_online_timeout);
	if (ge('vk_online_status')){
		ge('vk_online_status').innerHTML='<div class="vkUUndef">...</div>';
	}
	
	var show_status=function(stat){
		//if (!window.vk_last_uonline_status || vk_last_uonline_status!=stat){
			//vk_last_uonline_status=stat;
         var text=vkOnlineInfo(stat);
			var online = (text && text!='') ? '<div class="vkUOnline">'+text+'</div>': '<div class="vkUOffline">Offline</div>';
			if (!ge('vk_online_status')){
			  var div = document.createElement('div');
			  var body = document.getElementsByTagName('body')[0];
			  div.id = 'vk_online_status';
			  div.style.position = "fixed";
			  div.style.bottom="0px";
			  div.style.left = "0px";
			  div.setAttribute('onclick','UserOnlineStatus();');
			  
			  div.innerHTML=online;
			  var vk_side_bar=sideBar();
			  body=(vk_side_bar)?vk_side_bar:body;
			  body.appendChild(div);
			} else {
			  ge('vk_online_status').innerHTML=online;
			}
		//}
		/* vkGenDelay() -random для рассинхронизации запросов разных вкладок, иначе запросы со всех вкладок будут одновременно слаться. */
		vk_check_online_timeout=setTimeout(UserOnlineStatus,vkGenDelay(vk_upd_menu_timeout,status!=null));
	}
	if (status!=null){
		show_status(status);
		//vklog('[onStorage] Online status');
	} else {
		dApi.call("getProfiles",{ uid: remixmid(), fields:'online'},function(res) {	
			if (res.response){
				//res.response[0].online_mobile
            //res.response[0].online_app
            //var st=res.response?res.response[0].online:null;
            var p=res.response[0];
            var st={
                  online:p.online,
                  online_app: p.online_app,
                  online_mobile: p.online_mobile
             };
            
				show_status(st);
				vkCmd('user_online_status',st);// /*res.response[0].online*/ шлём полученный статус в остальные вкладки
				//vklog('Online status >> [onStorage] ');
			} else {
				vk_check_online_timeout=setTimeout(UserOnlineStatus,vkGenDelay(vk_upd_menu_timeout));
			}
		});  
	}
}

/* CALENDAR */
vk_cur={};
function vkGetCalendar(){
	if (window.stManager) stManager.add('events.css');
	var html='\
		 <div id="vk_calendar" class="calendar">\
			<div class="calendar_header">\
			  <div class="right arrow fl_r"><a href="" onclick="vk_cur.vk_calGetMonth(1); return false;"></a></div>\
			  <div class="left arrow fl_r"><a href="" onclick="vk_cur.vk_calGetMonth(-1); return false;"></a></div>\
			  <div class="header_month fl_r" id="vk_calendar_header">VkOpt</div>\
			</div>\
			<div id="vk_calendar_table_wrap"></div>\
			<div id="vk_calendar_events" style="display:none"  onmouseover="leftBlockOver(\'_vk_cal\')" onmouseout="leftBlockOut(\'_vk_cal\')">\
					<div id="left_hide_vk_cal" class="left_hide" onmouseover="leftBlockOver(this)" onmouseout="leftBlockOut(this)" onclick="hide(\'vk_calendar_events\')"></div>\
					<div id="vk_calendar_events_cont"></div>\
			</div>\
	';
	sideBar().appendChild(vkCe('div',{id:'vk_calendar_block'},html));
	vkGetCalendarInfo(function(month, year, events, holidays){
      vk_initCalendar(month, year, events, holidays);
      vk_cur.vk_calGetMonth(0);
   });
}

function vkGetCalendarInfo(callback,cnt){ //callback(month, year, events, holidays)    
	cnt=cnt || 1;
   AjGet('/al_events.php?tab=calendar&al=1',function(r,t){//al_events.php?act=calendar&al=1
		var res=t.split('initCalendar(')[1];
      if (!res){
         if (cnt<5)
            setTimeout(function(){vkGetCalendarInfo(callback,cnt+1)},5000);
         else 
            console.log('calendar loading failed');
         return;
      }
      res=res.split(');')[0];
		//eval(callback+'('+res+')');
      var args=eval('['+res+']');
      callback.apply(this,args);
	});
}
function vk_initCalendar(month, year, events, holidays) {

extend(vk_cur, {
  vk_calEvents: events,
  vk_calHolidays: holidays,
  vk_calMon: month,
  vk_calYear: year,
  vk_calEventsById: {},
  vk_calGetCurEvents: function(day) {
    if (!vk_cur.vk_calEvents[vk_cur.vk_calMon]) return [];
    var events = vk_cur.vk_calEvents[vk_cur.vk_calMon][day], curEvents = [];
    var now = new Date(), nowYear = now.getFullYear();
    for (var i in events) {
      var year = (new Date(events[i][3] * 1000)).getFullYear();
      if ((events[i][0] > 0 && (vk_cur.vk_calYear > year || year == nowYear)) || (events[i][0] < 0 && vk_cur.vk_calYear == year)) {
        curEvents.push(events[i]);
      }
    }
    return curEvents;
  },
  vk_calShowMore: function(el) {
    var e = geByClass('day_text', el.parentNode)[0];
	ge('vk_calendar_events_cont').innerHTML=vkModAsNode(e.innerHTML,vkProcessNode);
	show('vk_calendar_events');
  },
  vk_calGetMonth: function(shift) {
    if (window.tooltips) tooltips.hideAll();
    vk_cur.vk_calMon += shift;
    if (vk_cur.vk_calMon > 12) {
      vk_cur.vk_calMon = 1;
      vk_cur.vk_calYear++;
    } else if (vk_cur.vk_calMon < 1) {
      vk_cur.vk_calMon = 12;
      vk_cur.vk_calYear--;
    }
    ge('vk_calendar_header').innerHTML = getLang('Month'+vk_cur.vk_calMon)+' '+vk_cur.vk_calYear;


    var days = (new Date(vk_cur.vk_calYear, vk_cur.vk_calMon, 0)).getDate();
    var date = new Date(vk_cur.vk_calYear, vk_cur.vk_calMon - 1, 1);

    var start = (date.getDay() + 6) % 7;
    var offset = days + start;
    var weeksCount = Math.ceil(offset / 6);
    var rows = '';
    var nowDay = new Date();
    nowDay = new Date(nowDay.getFullYear(), nowDay.getMonth(), nowDay.getDate());

    for (var week = 0; week < weeksCount; week++) {
      var rowHTML = '';
	  var blank=true;
      for (var weekDay = 0; weekDay < 7; weekDay++) {
        var day = week * 7 + weekDay - start + 1;
        var dayClass = (weekDay == 0) ? 'left ' : '';
        if (day > 0 && day <= days) {
          blank=false;
		  var holidays = vk_cur.vk_calHolidays[vk_cur.vk_calMon];
          var curDay = new Date(vk_cur.vk_calYear, vk_cur.vk_calMon - 1, day);
          
          if (holidays && holidays[day] || weekDay > 4) {
            dayClass += 'holiday ';
          }
          
          var dayText = '';
          if (nowDay.toString() == curDay.toString()) {
            //dayText = getLang('Today');
            dayClass += 'today ';
          }
          
          var dayEvents = '', showMore = '', dayClick='', dayNumClass='';

          var vk_calEvents = vk_cur.vk_calGetCurEvents(day);
          if (vk_calEvents[0]) {
            dayClick='onclick="vk_cur.vk_calShowMore(this)"';
			dayNumClass='day_button';
			dayClass += 'event ';
			var events='';
			for (var i=0; i<vk_calEvents.length;i++){
				var photo = vk_calEvents[i][4];
				var href = vk_calEvents[i][2];
				var name = vk_calEvents[i][1];
				var fid = vk_calEvents[i][0];
				events+='<div class="event_block">\
							<a href="' + href + '" onclick="return nav.go(this, event);"><img src="' + photo + '"/></a>\
							<div class="event_name">\
							  <a href="' + href + '" onclick="return nav.go(this, event);">'+name+'</a>\
							</div>\
						</div>\
						';
			}
			dayText='<div class="events_block">'+events+'</div>';
			
          }

          rowHTML += '<td class="day_cell day' + (weekDay+1) + ' ' + dayClass + '">\
            <div class="day_num fl_l '+dayNumClass+'" '+dayClick+'>' + day + '</div><div class="day_text fl_l">' + dayText + '</div>\
            <div class="day_events clear">' + dayEvents + '</div>\
            <div class="day_more">' + showMore + '</div>\
          </td>';

        } else {
          rowHTML += '<td class="day_cell day' + (weekDay+1) + ' ' + dayClass + '"></td>';
        }
      }
	  if (!blank) rows += '<tr class="day_row">' + rowHTML + '</tr>';
    }
    
    ge('vk_calendar_table_wrap').innerHTML = '<table class="day_table" cellpadding="0" cellspacing="0" align="center">\
      <tr>\
       <td class="day_head day1">' + getLang('events_mon') + '</td>\
       <td class="day_head day2">' + getLang('events_tue') + '</td>\
       <td class="day_head day3">' + getLang('events_wed') + '</td>\
       <td class="day_head day4">' + getLang('events_thu') + '</td>\
       <td class="day_head day5">' + getLang('events_fri') + '</td>\
       <td class="day_head day6">' + getLang('events_sat') + '</td>\
       <td class="day_head day7">' + getLang('events_sun') + '</td>\
      </tr>' + rows + '</table>';

    return false;
  }
});

each(vk_cur.vk_calEvents, function(i,m) {
  each(m, function(j, d) {
    each(d, function(k, item) {
      vk_cur.vk_calEventsById[item[0]] = item;
    });
  });
});

}
/* END CALENDAR */

function vkClock() {
	if (getSet(30) > 0) {
		if (getSet(30) < 3) {
			var sidebar=sideBar();
			var div=vkCe('div',{id:"vkCl","class":"left_box",style:"color: #2b587a; font-size: 22px; font-family: arial; font-weight: bold;"},new Date().toLocaleString().match(/\d+:\d+:\d+/i));
			sidebar.appendChild(div);
		}
      if (ge('vkCl')){
         if (getSet(30) ==1) setInterval(function(){ge('vkCl').innerHTML=new Date().toLocaleString().match(/\d+:\d+:\d+/i);},1000);
         if (getSet(30) ==2) setInterval(function(){ge('vkCl').innerHTML=wr_date();},1000);
      }
		if (getSet(30) ==3) makeClock();
	}
}

function wr_date(){ 
  var ms=['01','02','03','04','05','06','07','08','09','10','11','12']; 
  var d=document;  
  var up=new Date(); 
  var dt=up.getDate(); 
  var m=up.getMonth();//ms[]; 
  var y=up.getYear(); 
  var h=up.getHours(); 
  var mm=up.getMinutes(); mm=(mm.toString().length<2)?'0'+mm.toString():mm;
  var ss=up.getSeconds(); ss=(ss.toString().length<2)?'0'+ss.toString():ss;
  if(y<1000){y+=1900} 
  return dt+'.'+ms[m]+'.'+y+'<br>'+h+':'+mm+':'+ss; 
}

function clock(){
  var now = new Date();
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.save();

  fon='rgba(255,255,255,0.7)';
  strelkaH='#222';
  strelkaM='#444';
  strelkaS='#666';
  metki='#000';

  ctx.clearRect(0,0,150,150);
  ctx.translate(57,75);
  ctx.scale(0.4,0.4);
  ctx.rotate(-Math.PI/2);
  ctx.strokeStyle = metki;
  ctx.fillStyle = fon;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";

//fon
 ctx.save();
 ctx.beginPath();
 ctx.arc(0,0,140,0,Math.PI*2,true);
 ctx.fill();
 ctx.restore();

  // Hour marks
  ctx.save();
  for (i=0;i<12;i++){
    ctx.beginPath();
    ctx.rotate(Math.PI/6);
    ctx.moveTo(100,0);
    ctx.lineTo(120,0);
    ctx.stroke();
  }
  ctx.restore();

  // Minute marks
  ctx.save();
  ctx.lineWidth = 5;
  for (i=0;i<60;i++){
    if (i%5!=0) {
      ctx.beginPath();
      ctx.moveTo(117,0);
      ctx.lineTo(120,0);
      ctx.stroke();
    }
    ctx.rotate(Math.PI/30);
  }
  ctx.restore();

  var ms=now.getMilliseconds();
  var sec = now.getSeconds();
  var min = now.getMinutes();
  var hr  = now.getHours();
  hr = hr>=12 ? hr-12 : hr;

  ctx.fillStyle = "black";


  // write Hours
  ctx.strokeStyle = strelkaH;
  ctx.save();
  ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-20,0);
  ctx.lineTo(60,0);
  ctx.stroke();
  ctx.restore();

  // write Minutes
  ctx.strokeStyle = strelkaM;
  ctx.save();
  ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec +(Math.PI/1800000)*ms)
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-20,0);
  ctx.lineTo(80,0);
  ctx.stroke();
  ctx.restore();

  // Write seconds
  ctx.strokeStyle = strelkaS;
  ctx.save();
  ctx.rotate(sec * Math.PI/30);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-30,0);
  ctx.lineTo(100,0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0,0,5,0,Math.PI*2,true);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = metki;
  ctx.arc(0,0,132,0,Math.PI*2,true);
  ctx.stroke();

  ctx.restore();
}

function makeClock(){
s=sideBar();
d=document.createElement('span')
c=document.createElement('canvas')
c.id='canvas'
c.width=115
c.height=150
d.appendChild(c)
s.appendChild(d)
clock();
setInterval(clock,1000);
}
/* END OF DATE/CLOCK */


/* SMILES */
function vkSmiles(element){ 
	if (getSet(33)!='y' || ge("vkopt_sett_table")) return;
	var tstart=unixtime();
	//alert('smilize');
	element=(element)?ge(element):ge('content');
	FindAndProcessTextNodes(element,SmileNode);	
	vklog('Process Smiles time:' + (unixtime()-tstart) +'ms');
}

function RemoveSmile(elem){ var newel=document.createTextNode(elem.title);  elem.parentNode.replaceChild(newel,elem);} 
function FindAndProcessTextNodes(node,func){
    var childItem =0;
    while(node.childNodes[childItem]){
        if(node.childNodes[childItem].nodeType==3 && node.tagName!="SCRIPT" && node.tagName!="STYLE" && node.tagName!="TEXTAREA" ){
            childItem = func(node,childItem);
        }else{ FindAndProcessTextNodes(node.childNodes[childItem],func);  }
        childItem++;
    }
}          
function SmileNode(mainNode,childItem,searchWord){
    node = mainNode.childNodes[childItem];
    for (key in SmilesMap){ 
      var regex=(SmilesMap[key][0])?SmilesMap[key][0]:SmilesMap[key];
      var searchWord = node.nodeValue.match(regex);
      searchWord=(searchWord)?searchWord[0]:false;
      if (searchWord){   
      var startIndex = node.nodeValue.indexOf(searchWord);
      var endIndex = searchWord.length;
      
       if(startIndex!=-1){
          var secondNode = node.splitText(startIndex);
          var thirdNode = secondNode.splitText(endIndex);
          
          
         // var smilepath=(SmilesMap[key][0])?SmilesMap[key][1]:'icq';
          
          var smile = mainNode.ownerDocument.createElement('img');
          smile.setAttribute('style',"margin-bottom:-0.3em; border:0px;");
          //smile.src='http://kolobok.us/smiles/'+smilepath+'/'+key+'.gif';
          smile.src=vkSmilesLinks[key];//'http://vkoptcss.narod.ru/smiles/'+key+'.gif';
          smile.setAttribute("onclick","RemoveSmile(this);");
		  smile.alt=searchWord;
          smile.title=searchWord;
 
          mainNode.replaceChild(smile,mainNode.childNodes[childItem+1]);
          //childItem = childItem*1+2;
          if(mainNode.childNodes[childItem] && mainNode.childNodes[childItem].nodeValue.match(SmilesMap[key])!=-1){
              childItem = SmileNode(mainNode,childItem,searchWord);
          }
      }
    }
  }
  return childItem;
}
/* END OF SMILES */


if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;
