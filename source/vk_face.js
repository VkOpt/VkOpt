// ==UserScript==
// @name          Vkontakte Optimizer module 
// @description   (by KiberInfinity id13391307)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==

//javascript: dApi.call('friends.getLists',{},uApi.show)


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
	vkaddcss('#side_bar {width:130px !important;} #main_feed #feed_rate_slider_wrap { right: 152px; } #footer_wrap{ width: 100% !important;}');
	vk.width=vk.width+120;
   vk.width_dec=280;
	Inj.Start('handlePageView','if (params.width) params.width+=120; if (params.width_dec) params.width_dec+=120;');
	Inj.Replace('handlePageView','791','911');
	Inj.Replace('handlePageView','160','280');
	
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
	var h=getSize(el)[1]+getXY(el)[1];
	vkaddcss("#sideBar,#side_bar"+(cfg_r=='y'?", #right_bar":'')+"{ position: fixed;z-index: 101; top: "+h+"px }\
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
  if (cfg > 0) nav.innerHTML=nav.innerHTML.replace(RegExp('(">)(\u041c\u043e\u0439|\u041c\u043e\u044f|\u041c\u043e\u0438|\u041c\u043e\u0457|\u041c\u0430\u044f|\u041c\u0430\u0435|My) ','g'),"$1");
  
  

  var vkmenu_css1='\
         #nav a IMG, #side_bar ol a IMG{margin-right:3px; height:'+vkMenuIconSize+'px;}\
         #nav a .vkicon, #side_bar ol a .vkicon{float:left; width:13px; height:13px; margin-right:1px; /*background:#DDD;*/}\
         .vkico_friends, .vkico_profile, .vkico_albums,\
         .vkico_video,.vkico_audio,.vkico_mail,.vkico_im,\
         .vkico_notes,.vkico_groups,.vkico_events,\
         .vkico_feed, .vkico_newsfeed,.vkico_fave,\
         .vkico_settings,.vkico_apps,.vkico_docs,\
         .vkico_wall,.vkico_gifts,.vkico_vkplug,.vkico_vkopt,.vkico_app{background:url("http://vk.com/images/icons/mono_iconset.gif") no-repeat;}\
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
      [['fans.php?act=idols',"return !showTabbedBox('al_fans.php', {act: 'show_publics_box', oid: "+vkmid+"}, {cache: 1}, event);"],IDL('clSubscriptions')]
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
        ['feed?section=friends',IDL("mNeF")],
        ['feed?section=groups',IDL("mNeG")],
        ['feed?section=notifications',IDL("mNeNotif")],
        ['feed?section=photos',IDL("clPh")],
        ['feed?section=mentions',IDL("mNeMe")],
        ['feed?section=recommended',IDL("mNeR")+' 1'],
        ['feed?section=suggested',IDL("mNeR")+' 2'],
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
				vkHighlightCounters();
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
		var e=vk$(e); 
		var backcolor=e.css('backgroundColor'); 
		e.animate({backgroundColor:SIDEBAR_ITEM_HIGHLIGHT_COLOR},700,function(){//rgb(255,255,0)
			setTimeout(function(){
				e.animate({backgroundColor:backcolor},700,function(){e.css('backgroundColor',"")});
			},MENU_HIGHLIGHT_DELAY);
		});	
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
			var online = stat ? '<div class="vkUOnline">Online</div>': '<div class="vkUOffline">Offline</div>';
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
				var st=res.response?res.response[0].online:null;
				show_status(st);
				vkCmd('user_online_status',res.response[0].online);// шлём полученный статус в остальные вкладки
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
			  <div class="header_month fl_r" id="vk_calendar_header">VkOpt 2011</div>\
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

function vkGetCalendarInfo(callback){ //callback(month, year, events, holidays)    
	AjGet('/al_events.php?act=calendar&al=1',function(r,t){
		var res=t.split('initCalendar(')[1].split(');')[0];
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
