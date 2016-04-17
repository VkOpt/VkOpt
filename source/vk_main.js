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
  stManBeforeCallback = function (files){  
      return function(){
         vkInjCheck(files); 
      }      
  };  
  Inj.Before("stManager.add","__stm._waiters.push","__stm._waiters.push([wait, stManBeforeCallback(files)]);");
  Inj.After("stManager.add",/if\s*\(!callback\)\s*{*\s*return;\s*}*/,"if (!wait.length){stManBeforeCallback(files)();}"); //"callback=stManCallback(callback,files);"
}
function vkInjCheck(files){
  if (!isArray(files)) files = [files];
  for (var i in files) 
    if (files[i].indexOf('.js') != -1) vkInj(files[i]); 
}

function vkInj(file){
 switch (file){
   case 'photoview.js':    vk_phviewer.inj();         break;
   case 'videoview.js':    vk_videos.inj_videoview(); break;
   case 'html5video.js':   vk_videos.inj_html5();     break;
   case 'video.js':        vkVideo();        break;
   case 'audio.js':        vkAudios();       break;
   case 'audioplayer.js':  vkAudioPlayer();  break;
   case 'feed.js':         vk_feed.inj();    break;
   case 'search.js':       vk_search.inj();  break;
   case 'profile.js':      vk_profile.inj(); break;
   case 'wall.js':         vkWall();         break;
   case 'page.js':         vk_pages.inj();   break;
   case 'friends.js':      vkFriends();      break;
   case 'notifier.js':     vkNotifier();     break;
   case 'common.js':       vkCommon();       break;
   case 'im.js':           vkIM();           break;
   case 'groups_list.js':  vkGroupsList();   break;
   case 'groups_edit.js':  vk_groups.group_edit_inj(); break;
   case 'fave.js':         vk_fave.inj();           break;
   case 'photos.js':       vk_photos.inj_photos();  break;
   case 'emoji.js':        vk_features.emoji_inj(); break;
   case 'upload.js':       vk_features.upload_inj(); break;
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
		//vkPrepareTxtPanels(node);
		vk_audio.process_node(node);
      window.vk_vid_down && vk_vid_down.process_node(node);
      vkPollResultsBtn(node);
      vk_im.process_node(node);
      vk_board.get_user_posts_btn(node);
      vk_feed.process_node(node);
      vk_photos.process_node(node);
      vk_search.process_node(node);
      vk_search.process_node_gr_req(node);
      //vk_photos.album_process_node(node);
      vk_highlinghts.process_node(node);
		vk_plugins.processnode(node);
	// }  catch (e) { topMsg('vkProcessNode error',2)}
	}
	vklog('ProcessNode time:' + (unixtime()-tstart) +'ms');
}


      
      
function vkProcessNodeLite(node){
  var tstart=unixtime();
  try{
	vkProccessLinks(node);
	vk_audio.process_node(node);
   window.vk_vid_down && vk_vid_down.process_node(node);
   vkPollResultsBtn(node);
	//vkPrepareTxtPanels(node);
   vk_board.get_user_posts_btn(node);
   vk_im.process_node(node);
   vk_feed.process_node(node);
   vk_photos.process_node(node);
   vk_search.process_node(node);
   vk_highlinghts.process_node(node);
	vk_plugins.processnode(node,true);
   if (getSet(63)=='y') vkSmiles(node);
   vkPostSubscribeBtn(node);
   vk_wall.process_node(node);
  }  catch (e) {
	topError(e,{dt:4});
  }
  vklog('ProcessNodeLite time:' + (unixtime()-tstart) +'ms');
}
	
function vkOnStorage(id,cmd){
	//vklog('id: '+id+'\n\n'+JSON.stringify(cmd));
	switch(id){
		case 'user_online_status': UserOnlineStatus(cmd); break;
		case 'upd_sounds':vkUpdateSounds(true); break;
      case 'fav_users_statuses':vkFavOnlineChecker(cmd); break;
      case 'fave_users_statuses':vkFaveOnlineChecker(cmd); break;
	}
}
function vkOnNewLocation(startup){
	//console.log('hav hook', window.nav);
   if (!(window.nav && nav.objLoc)) return;
   if (!cur.module){
      if (cur.gid && nav.objLoc['act']=='blacklist' && (cur.moreParams || {}).act=="blacklist"){
         cur.module='groups_edit';
      }else if (/page-?\d+_\d+/.test(nav.objLoc[0])){
         var obj=nav.objLoc[0].match(/page(-?\d+)_(\d+)/);
         cur.module='pages';
         if (!cur.gid) cur.gid=Math.abs(obj[1]);
         if (!cur.oid) cur.oid=obj[1];
         if (!cur.pid) cur.pid=obj[2];
         
      } else if (nav.objLoc['act']=='users' && /^(members|invites|admins|requests)$/.test(cur.tab || "") && cur.oid<0){
         cur.module='groups_edit';
      } else {
         switch(nav.objLoc[0]){
            case 'settings':  cur.module='settings';          break;
            case 'pages':      cur.module='pages';         break;
            default:          setTimeout(function(){vkOnNewLocation();},10); return;
         }
      }

      /*
      if (nav.objLoc[0]=='settings'){
         cur.module='settings';
      } else if (nav.objLoc[0]=='page'){
         cur.module='wiki_page';
      } else {
         setTimeout(function(){vkOnNewLocation();},10);
         return;
      }*/

   }
	vklog('Navigate:'+print_r(nav.objLoc).replace(/\n/g,','));
	var tstart=unixtime();

	switch(nav.objLoc[0]){
		case 'settings':vkSettingsPage(); break;
		case 'mail':   vkMailPage(); break;
		case 'feed':   vk_feed.on_page(); break;
      case 'groups': vkGroupsListPage();  break;
      default:
         if (/write\d+/.test(nav.objLoc[0])) vkMailPage();
	}



	if (cur.module){	
		vklog(cur.module+'|'+print_r(nav.objLoc).replace(/\n/g,','));
		switch(cur.module){
			case 'profile':		vk_profile.page(); break;
			case 'profileEdit':	vk_profile.edit_page(); break;
			case 'groups':		vkGroupPage(); break;
			case 'groups_edit':	vk_groups.group_edit_page(); break;
			case 'event':		vkEventPage(); break;
			case 'public':		vkPublicPage(); break;
			case 'wall':		vkWallPage(); break;
			case 'friends':		vkFriendsPage(); break;
			case 'photos':		vk_photos.page(); break;
			case 'audio':		vkAudioPage(); break;
			case 'audio_edit':	vkAudioEditPage(); break;
			case 'video':		vk_videos.page(); break;
			case 'video_edit':	vkVideoEditPage(); break;
			case 'notes':		vkNotesPage(); break;
			case 'board':		vkBoardPage(); break;
			case 'search':		vk_search.page(); break;
			case 'fave':		vk_fave.page(); break;
			case 'im':			vk_im.page(); break;
			case 'pages':		vkWikiPages(); break;
			case 'apps':		vk_apps.page(); break;
			//case 'groups_list': vkGroupsListPage(); break;
			case 'docs':		vkDocsPage(); break;
		}
		if (startup && window.Fave) Fave.init();	
	}

	if (!window.last_navobjLoc || last_navobjLoc!=nav.objLoc[0]){// единичный запуск при переходе в новый модуль
		last_navobjLoc=nav.objLoc[0];
		switch(cur.module){
			case 'friends':vkProcessNode(); break;
		}
      vkWallAddBtnOnError();
	}
	vk_plugins.onloc();
   stManager.add(['page.js']);
	vklog('OnLocation time:' + (unixtime()-tstart) +'ms');
}

function vkProcessResponseNode(node,url,q){
   if (!url) return;
   if (q.offset && url.indexOf('wall')!=-1) vkAddDelWallCommentsLink(node);
   if (q.offset && url.indexOf('albums')!=-1) vkAddAlbumCommentsLinks(node);
   // alert(url+'\n'+JSON.Str(q));albums-126529

}

function vkLocationCheck(){
  if (vkCheckInstallCss()) return true;
  XFR.check();
  if (/\/away/.test(location.href) && getSet(6) == 'y'){
	location.href=decodeURIComponent(location.href.match(/to=([^&]+)/)[1]);
	return true;
  }
  return false;
}

function VkOptMainInit(){
  vk_settings.cfg_override();
  if (vkLocationCheck()) return;
  InstallRelease();
  
  
  if (isNewLib() && !window.lastWindowWidth){
      setTimeout(function(){VkOptMainInit();},50);
      return;
  }
  /* Get lang data:
   javascript:x=[];for (var key in vk_lang_ru) x.push("'"+key+"': '"+(typeof vk_lang_ru[key] == 'string'?(IDL(key)==key?'':IDL(key)):JSON.Str(vk_lang_ru[key]))+"'"); alert(x.join(',\n'));
 
  vkExtendLang({

  });//*/
  vkStyles();  
  if (!ge('content')) return;
  if (getSet(69)=='n') vkopt_disabled_ad=true;
  if (getSet(31)=='y' || getSet(35)=='y') vkMakeRightBar();
  if (vk_DEBUG) vkInitDebugBox();
  vkInitSettings();
  if (getSet(78)=='n') CUT_VKOPT_BRACKET=true;
  vkBroadcast.Init(vkOnStorage);
  window.vkopt_ready=true;
  
  vkFixSmileMap();
 
  vk_plugins.init();
  addEvent(document, 'mouseup', vkOnDocumentClick);
  if (/act=vkopt/.test(location.href))	vkShowSettings();
  if (window.topMsg){
	vkStManHook();
	for (var key in StaticFiles)  if (key.indexOf('.js') != -1) vkInj(key); 
	vk_audio.process_node();
  } 
  vkProccessLinks();
  if (ge('left_blocks')) vkProccessLinks(ge('left_blocks'));
  vk_user_init();
  setTimeout(function(){vkFixedMenu();},200);
  vkMenu();
  vkOnNewLocation(true);//Inj.Wait('window.nav', vkOnNewLocation,50);  
  vkSmiles();
  //vkPrepareTxtPanels();  
  vkSkinManInit();
  vkClock();
  window.vk_vid_down && vk_vid_down.process_node();
  vkPollResultsBtn();
  vkPostSubscribeBtn();
  vk_board.get_user_posts_btn();  
  vk_im.process_node();  
  vk_photos.process_node();
  vk_plugins.processnode();
  vk_wall.process_node();
  if (getSet(34)=='y' && !window.setkev){ InpTexSetEvents(); setkev=true;}
  if (getSet(27)=='y') vkGetCalendar();
  if (getSet(16) == 'y') UserOnlineStatus();
  vkFavOnlineChecker();
  vkFaveOnlineChecker();
  vkMoneyBoxAddHide();
  if (ENABLE_HOTFIX) vkCheckUpdates();
  setTimeout(function(){vkFriendsCheckRun();},2000);
  window.vk_vid_down &&  setTimeout(function(){vk_vid_down.vkVidLinks();},0);
  if (vkgetCookie('IDFriendsUpd') && (vkgetCookie('IDFriendsUpd') != '_')) {	vkShowFriendsUpd();  }
  
}

function vkOnDocumentClick() {
   var el=document.activeElement;
   if ((el.contentEditable=="true" || el.tagName=='TEXTAREA'))
      vkAddSmilePanel(el);
}

/* USERS */
function vkProccessLinks(el){
 var tstart=unixtime();
 el=el || ge('content');//document
    var nodes=el.getElementsByTagName('a'); 
    for (var i=0;i<nodes.length;i++){  
     if (getSet(10)!='n') vkProcessUserLink(nodes[i]);
	  if (getSet(8)=='y')  ProcessUserPhotoLink(nodes[i]);
	  if (getSet(6)=='y')  ProcessAwayLink(nodes[i]);
	  if (getSet(38)=='y') ProcessHighlightFriendLink(nodes[i]);
     if (getSet(55)=='y') vk_im.process_date_link(nodes[i]);
     if (getSet(58)=='y') vkProcessTopicLink(nodes[i]);
     vk_videos.process_link(nodes[i]);
     //vkProcessDocPhotoLink(nodes[i]);
	  vk_plugins.processlink(nodes[i]);
    }
    /*
    var nodes=el.getElementsByTagName('td'); 
    for (var i=0;i<nodes.length;i++){  
      if (getSet(6)=='y')  ProcessAwayLink(nodes[i]);
    }    
    */
 vklog('ProcessLinks time:' + (unixtime()-tstart) +'ms');
}

function ProcessAwayLink(node){
  var href=node.getAttribute('href');
  if (href && href.indexOf('away.php?')!=-1){
   var to = (href.match(/to=([^&]+)/) || [])[1];
   try {
       var lnk = decodeURIComponent(vkLinksUnescapeCyr(to));
   }
   catch (e) {
       var lnk = decodeURIComponent(to);
   }
   if (!lnk) return;
	node.setAttribute('href',lnk);
  }
}


/* FRIENDS */
function vkFriendsPage(){
	vkFriendsBySex(true);
	vkCheckFrLink();
   vk_friends.cat_links();
   
   if (ge('main_class')) removeClass('main_class','wide');
}
/* PUBLICS */
function vkPublicPage(){
	vk_graff.upload_graff_item();
   vk_photos.pz_item();
   vkWallAlbumLink();
   //vkSwitchPublicToGroup();
   vkWikiPagesList(true);
   vkGroupStatsBtn();
   vkUpdWallBtn();
   vk_groups.show_members_btn();
   vk_groups.show_oid();
   vk_feed.scroll_posts('page_wall_posts');
}
/* EVENTS */
function vkEventPage(){
	vk_graff.upload_graff_item();
   vk_photos.pz_item();
   vkWallAlbumLink();
   vkUpdWallBtn();
   vk_groups.show_oid();
   //vkWikiPagesList(true);
}
/* GROUPS */
function vkGroupPage(){
	vk_graff.upload_graff_item();
   vk_photos.pz_item();
	vkCheckGroupsAdmin();
   vkModGroupBlocks();
   //vkAudioBlock();
   vkWallAlbumLink();
   vkUpdWallBtn();
   vkWikiPagesList(true);
   vkGroupStatsBtn();
   vk_groups.show_members_btn();
   vk_groups.requests_block();
   vk_groups.show_oid();
   vk_feed.scroll_posts('page_wall_posts');
}

function vkGroupStatsBtn(){
      var p=ge('page_actions') || ge('unsubscribe');
      if (p && !ge('vk_stats_list') && !(ge('page_actions') && /stats\?gid=/.test(ge('page_actions').innerHTML))){
         var wklink=function(id){
            var el = vkCe('a',{id:id, href:"/stats?gid="+Math.abs(cur.oid)},IDL('Stats',1));
            el.onclick = function(e){ return nav.go(e.target, e); };
            return el;
         };
         var a=wklink('vk_stats_list');
         if (p==ge('unsubscribe')) p.appendChild(vkCe('br'));
         p.appendChild(a);
         if (p==ge('unsubscribe') && ge('subscribe')){
            p=ge('subscribe');
            a=wklink('vk_stats_list_2');
            p.appendChild(a);
         }
      }
}
function vkWikiPagesList(add_btn){
   if (add_btn){
      var p=ge('page_actions') || ge('unsubscribe');
      if (p && !ge('vk_wiki_pages_list')){
         var wklink=function(id){
            var el = vkCe('a',{id:id},IDL('WikiPagesList')+'<span class="fl_r" id="vk_wiki_pages_list_loader" style="display:none;">'+vkLdrImg+'</span>');
            el.onclick = function(){ vkWikiPagesList(); return false; };
            return el;
         };
         var a=wklink('vk_wiki_pages_list');
         if (p==ge('unsubscribe')) p.appendChild(vkCe('br'));
         p.appendChild(a);
         if (p==ge('unsubscribe') && ge('subscribe')){
            p=ge('subscribe');
            a=wklink('vk_wiki_pages_list');
            p.appendChild(a);
         }
      }
      return;
   }
   var ldr=ge('vk_wiki_pages_list_loader');
   if (ldr) show(ldr);
   var gid=Math.abs(cur.oid);
   //if (gid==1) gid=-1;
   stManager.add('wk.css');
   dApi.call('pages.getTitles',{gid: gid},function(r){
      if (ldr) hide(ldr);
      var t='<h3>Owner: '+(cur.oid && cur.oid<0?'club':'id')+Math.abs(cur.oid || vk.id)+
          '<a class="fl_r" id="vk_add_wiki_page" href="#" onclick="vkWikiNew(); return false;">'+IDL('Add')+'</a>' +
          '<span class="divider fl_r">|</span>' +
          '<a class="fl_r" onclick="vkWikiDownload('+cur.oid+')">'+IDL('downloadAll')+'</a></h3><br>' +
          '<table class="wk_table" cellspacing="0" cellpadding="0">' +
          '<tr>' +
            '<th><a onclick="vkWikiSortColumn(0, this)">'+IDL('Page')+' </a></th>' +
            '<th>'+IDL('History')+'</th>'+
            '<th>'+IDL('Code')+'</th>' +
            '<th><a onclick="vkWikiSortColumn(3, this)">'+IDL('Author')+' </a></th>' +
            '<th><a title="'+IDL('sortByDate')+'" onclick="vkWikiSortColumn(4, this)">'+IDL('Date')+' &#9650;<a></th>' +
          '</tr>';
      (r.response || []).map(function(obj){
         //console.log(obj);
         var page='page-'+obj.group_id+'_'+obj.pid;
         t+='<tr>' +
             '<td><a class="vk_wiki_link" pid="'+obj.pid+'" href="/'+page+'">'+obj.title+'</a></td>' +
             '<td><a href="/pages.php?oid=-'+obj.group_id+'&p='+encodeURIComponent(obj.title)+'&act=history" target="_blank">'+IDL('History')+'</a></td>' +
             '<td><a href="#" onclick="return vkGetWikiCode('+obj.pid+','+obj.group_id+');">'+IDL('Code')+'</a></td>' +
             '<td>' + obj.creator_name + '</td>' +
             '<td>' + obj.created + '</td>' +
         '</tr>';
      });
      t+='</table>';
      var box=vkAlertBox('Wiki Pages',t,null,null,true);
      box.setOptions({width:'680px'});
   });
}
function vkWikiSortColumn(index, anchor) {  // сортировка строк таблицы
    var table = geByClass('wk_table')[0];
    var rows = [].slice.call(geByTag('tr', table));
    var header = rows.shift();   // заголовок таблицы не участвует в сортировке
    var descending = anchor.innerHTML.indexOf('\u25B2'); // ▲
    rows.sort(function (a, b) {
        return a.childNodes[index].textContent.toUpperCase() < b.childNodes[index].textContent.toUpperCase() ? descending : -descending;
    });
    for (var i in rows)
        table.appendChild(rows[i]);
    each(geByTag('a', header), function (i, a) {
        a.innerHTML = a.innerHTML.replace(/[\u25BC\u25B2]/, '');
    });
    anchor.innerHTML += ~descending ? '\u25BC' : '\u25B2';
}

function vkWikiDownload(oid) {
    var box;              // окошко с прогресс-баром
    var zip;              // переменная для объекта JSZip
    var anchors;          // переменная для массива ссылок (элементов) на страницы
    var anchors_length;   // длина этого массива. Чтобы каждый раз не дергать .length
    var pages_complete = 0;
    var CORS_PROXY = 'http://crossorigin.me/';  // константа, содержащая адрес прокси для CORS-запросов
    var canvas = document.createElement('CANVAS'), ctx = canvas.getContext('2d');// для конвертирования изображений в base64
    var flushPage = function (title, pid, html) {   // Добавление готовой страницы (с картинками) в объект JSZip
        if (html!='') zip.file(vkCleanFileName(title) + ' (' + pid + ').html',
            '<!DOCTYPE HTML><html><head><meta charset="utf-8"><title>' + (title || 'Wiki ' + oid + '_' + pid + ' [VkOpt]') + '</title></head><body>' + html + '</body></html>');
        pages_complete++;
    };
    var dlpages = function (i) {  // рекурсивная функция скачивания страниц. i - номер ссылки в массиве
        if (i > -1) {      // условие остановки рекурсии
            var pid = anchors[i].getAttribute('pid');
            dApi.call('pages.get', {
                owner_id: oid,
                page_id: pid,
                need_html: 1,
                v: '5.20'
            }, function (r, response) {
                var el = vkCe('div', {}, response.html); // Запихиваем html-код в элемент, чтобы картинки начали грузиться
                // обработка away-ссылок
                var as = geByTag('a', el);
                for (var j = 0; j < as.length; j++)
                    ProcessAwayLink(as[j]);
                // обработка картинок
                var imgs = geByTag('img', el);
                var imgs_total = imgs.length;
                if (imgs_total) {           // если на странице есть картинки
                    var imgs_loaded = 0;    // а это - самопальный счетчик готовых картинок, т.к. события "все картинки загружены" нет.
                    var onLoad = function (e) {      // конвертируем в base64
                        var img = e.target;
                        canvas.height = img.naturalHeight;
                        canvas.width = img.naturalWidth;
                        try {
                            ctx.drawImage(img, 0, 0);
                            var dataURL = canvas.toDataURL('image/jpeg');
                        } catch (err) {
                            onError(e);
                            return;
                        }
                        img.onload = null;
                        img.src = dataURL;
                        img.removeAttribute('crossOrigin');
                        if (++imgs_loaded == imgs_total)        // если это последняя загруженная картинка на странице, сохраняем страницу.
                            flushPage(response.title, pid, el.innerHTML);
                    };
                    var onError = function (e) {
                        var img = e.target;
                        if (img.src.indexOf(CORS_PROXY) == -1 && img.src.indexOf('data') != 0)  // Сначала пытаемся загрузить картинку через прокси
                            img.src = CORS_PROXY + img.src;
                        else {                                  // при повторной ошибке оставляем адрес как есть
                            img.removeAttribute('crossOrigin');
                            img.onload = null;
                            img.onerror = null;
                            img.src = img.src.replace(CORS_PROXY, '');
                            if (++imgs_loaded == imgs_total)  // не удалось загрузить картинку, однако она последняя; всё равно сохраняем страницу.
                                flushPage(response.title, pid, el.innerHTML);
                        }
                    };
                    for (var j = 0; j < imgs_total; j++) {
                        imgs[j].crossOrigin = 'Anonymous';  // stackoverflow фигни не посоветует!
                        imgs[j].onload = onLoad;
                        imgs[j].onerror = onError;
                    }
                }
                else
                    flushPage(response.title, pid, el.innerHTML);
                Progress(anchors_length - i, anchors_length);   // Потому что скачивание идет задом наперед
                dlpages(--i);                                   // продолжаем рекурсию
            });
        }
        else {  // скачивание текстов страниц закончено; дожидаемся загрузки всех картинок в страницах
            var t = setInterval(function () {
                if (pages_complete == anchors_length) { // все страницы загружены; сохраняем zip
                    clearInterval(t);
                    var content = zip.generate({type: "blob"});
                    saveAs(content, "wiki_" + vkCleanFileName(document.title) + ".zip");
                    box.hide();
                }
            }, 100);
        }
    };
    var Progress = function (c, f) {                // обновление прогрессбара        
        box.content(vkProgressBar(c, f || 1, 350));
    };
    JsZipConnect(function () {
        zip = new JSZip();                          // Создание объекта JSZip в ранее объявленную переменную
        anchors = geByClass('vk_wiki_link', ge('box_layer'));
        anchors_length = anchors.length;
        box = vkAlertBox(IDL('Loading'));
        dlpages(anchors_length - 1);                // Запуск рекурсии с последней ссылки
    });
}

/* WIKI GET CODE*/ 
function vkGetWikiCode(pid,gid){
	//var dloc=document.location.href;
	//var gid=dloc.match(/o=-(\d+)/);
	//gid=gid?gid[1]:null;
   var params={gid:gid};
   if (/^\d+$/.test(pid+"")){
      params['pid']=pid;
   } else {
      params['title']=pid;
   }
	dApi.call('pages.get',params,function(r){
      var data=r.response;
      if (!data.source) {
         alert('Nothing...');
         return;
      }
      var code=(data.source || "").replace(/<br>/gi,'\r\n');
      var box=vkAlertBox('Wiki-code','<h2>'+data.title+'</h2><textarea id="vk_wikicode_area" style="width:460px; height:300px;">'+code+'</textarea>',null,null,true);
      box.setOptions({width:'500px'});
   });
   return false;
}

/*
function vkSwitchPublicToGroup(){
   var p=ge('page_actions');
   if (!ge('vkpubtogroup') && p && p.innerHTML.indexOf('?act=edit')!=-1){
      var a=vkCe('a',{id:'vkpubtogroup', onclick:"showBox('al_public.php', {act:'a_switch_to_group_box',gid:Math.abs(cur.oid)}); return false;"},IDL('PublicToGroup'));
      p.appendChild(a);
   }
}*/
function vkGetGid(){
	if (!window.cur || cur.oid>0) return false;
	var gid=null;
	if (cur.gid || cur.oid<0) 
		gid=(cur.oid?Math.abs(cur.oid):cur.gid);
	if (!gid && cur.topic && /-(\d+)_/.test(cur.topic))
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
		return val.indexOf(','+(gid || cur.oid)+',')!=-1;
	} else return false;
}

function vkCheckGroupsAdmin(){
   dApi.call('groups.get',{extended:1},function(r){
      var data=r.response || [0];
      var gids=[];
      for (var i=0; i<data.length; i++){
         var g=data[i];
         if (g.is_admin==1){
           gids.push(-g.gid,g.screen_name);
         }
      }
      if (gids.length>0){
         var k="vk_adm_gr_"+remixmid();
         vkSetVal(k,gids.join(','));
      }
      //alert(gids.join('\n'));
   });
}
/*
function vkCheckGroupAdmin(){
	var r="vk_adm_gr_"+remixmid();
	var val=vkGetVal(r);
	var add=function(s){
		if ((','+val+',').indexOf(',' + s + ',') != -1) return;
      vklog(val);
		val+=','+s;
      vklog(val);
      val=val.replace(/^,+|,+$/g, '');
      vklog(val);
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
}*/



/* COMMON.JS */

function vkAjaxNavDisabler(strLoc){
	if (strLoc.indexOf('ATTRIBUTE_NODE')>-1) return true;
	var regex=/(video.+section=search|video-?\d+_\d+|photo-?\d+_\d+)/;
	var exc= regex.test(strLoc) || regex.test(nav.strLoc);
	if(getSet(5)=='y' && !exc){
		location.href='/'+strLoc;
		return true;
	} else {
		return false;
	}
}
function vkAllowPost(url, q){
   if (SUPPORT_STEALTH_MOD && q && q.audio_html && q.audio_orig){
      q.audio_html=q.audio_orig;
   }
   
   if (MAIL_BLOCK_UNREAD_REQ){
      if (url=='al_mail.php' && q.act=='show') return false;
      if (url=='al_im.php' && q.act=='a_mark_read') return false;
   }
   if (MAIL_BLOCK_TYPING_REQ){
      if (url=='al_im.php' && q.act=='a_typing') return false; 
   }
   return true;
}
function vkCommon(){
    if (getSet(6)=='y'){
		goAway=function(lnk){
         lnk=lnk.replace(/&#0+(\d+);/g,"&#$1;");
         lnk=winToUtf(lnk);//.replace(/&amp;/,'&');
         window.open(lnk, '_blank');
         return false;
         //document.location=lnk; return false;
      };
		confirmGo=goAway;
	}
	
	//Inj.After('ajax._receive','html});','vkProcessOnReceive(h);'); // хук на функцию, которая и так сама по себе большой шиздец. надо что то другое придумать...
	//Inj.Replace('ajax.framepost',' done',' function(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10){done(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10); setTimeout("vkProcessNode(); ",50);}'); //alert(\'qwe\');
		
	Inj.Start('ajax.framegot','if (h) h=vkProcessOnFramegot(h);');
	Inj.Before('ajax._post','o.onDone.apply','vkResponseChecker(answer,url,q);');// если это будет пахать нормально, то можно снести часть инъекций в другие модули.
	Inj.Start('ajax.post','if (vkAllowPost(url, query, options)==false) return;');
   
	Inj.Before('nav.go',"var _a = window.audioPlayer","if (strLoc && vkAjaxNavDisabler(strLoc)){return true;}");
	
	Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
	Inj.End('nav.setLoc','setTimeout(vkOnNewLocation,2);');
	
    if (getSet(10)!='n') Inj.After('TopSearch.row','name +','vkTsUserMenuLink(mid)+');
   
   vk_pages.inj_common();
   vk_audio.inj_common();
   vk_videos.inj_common();
   
   //if(window.TopSearch) Inj.End('TopSearch.prepareRows','vkProccessLinks(tsWrap);');
	//if (window.setFavIcon) Inj.Try('setFavIcon');
   
   //if (getSet(64)=='y') vkToTopBackLink();

}

function vkProcessOnFramegot(h){ if (h && h.indexOf('vk_usermenu_btn')==-1 && h.indexOf('vkPopupAvatar')==-1) return vkModAsNode(h,vkProcessNodeLite); }

function vkResponseChecker(answer,url,q){// detect HTML in response and prosessing
	//var rx=/div.+class.+[^\\]"/;
	//var nrx=/['"]\+.+\+['"]/;
	//var nrx=/(document\.|window\.|join\(.+\)|\.init|[\{\[]["']|\.length|[:=]\s*function\()/;
	var _rx=/^\s*<(div|table|input|a)/;
	for (var i=0;i<answer.length;i++){
		
		if (typeof answer[i]=='string' && _rx.test(answer[i]) ){
			answer[i]=vkModAsNode(answer[i],vkProcessNodeLite,url,q);//+'<input name="vkoptmarker" type="hidden" value=1>';	
		}
      //if (typeof answer[i]=='string') alert(answer[i].match(_rx)+'\n\n'+answer[i]);
	}
  vkProcessResponse(answer,url,q);
  vk_plugins.process_response(answer,url,q);
}

function vkProcessResponse(answer,url,q){
  if (url=='/photos.php' && q.act=="a_choose_photo_box") vkPhChooseProcess(answer, q);
  if (url=='/al_photos.php' && q.act=="choose_photo") vkPhChooseProcess(answer, q);
  if (url=='/video.php' && q.act=="a_choose_video_box") vkVidChooseProcess(answer, q);
  if (url=='/al_video.php' && q.act=="a_choose_video_box") vkVidChooseProcess(answer, q);
  if ((url=='/audio' || url=='/audio.php' || url=='/al_audio.php') && q.act=="a_choose_audio_box") vkAudioChooseProcess(answer, q);
  if (url=='/al_friends.php' && q.act=='add_box') answer[1]=answer[1].replace('"friends_add_block" style="display: none;"','"friends_add_block"');
  if(url=='/al_groups.php' && q.act=='people_silent') {
      if(answer[0].members)  answer[0].members = vkModAsNode(answer[0].members,vkProcessNodeLite,url,q);
      if(answer[0].requests) answer[0].requests = vkModAsNode(answer[0].requests,vkProcessNodeLite,url,q);
      if(answer[0].invites) answer[0].invites = vkModAsNode(answer[0].invites,vkProcessNodeLite,url,q);
      if(answer[0].admins) answer[0].admins = vkModAsNode(answer[0].admins,vkProcessNodeLite,url,q);
  }
  if (q.act=='edit_audio_box' && answer[2]) answer[2]=answer[2]+'\n vk_audio.in_box_move("'+q.aid+'");';
  // 39 - highlight common groups
  if (getSet(39) == 'y' && url=='/al_profile.php' && q.act=='groups'){
      answer[1]=vkModAsNode(answer[1],vk_highlinghts.profile_groups,url,q);
  }
  
  if (url=='/al_wall.php' && q.act=='poll_export_box'){
      answer[1]=vkModAsNode(answer[1],vk_features.poll_preview_btn,url,q);
  }
  
  if (url=='/al_photos.php' && q.act=='edit_photo'){
      answer[1]=vkModAsNode(answer[1],vk_photos.update_photo_btn,url,q);
  }
  if (getSet(101) == 'y' && url == '/al_video.php' && (q.act == 'show' || q.act == 'show_inline') && !(answer.indexOf('"no_flv":0')>0)) answer[2] = answer[2].replace(/if\s*\([^b]*browser.flash[^\)]*\)/g,'if (false)'); // al_video.php:111 : if (browser.flash >= 10) { /*flash*/ } else { /*html5*/ }
  
  if (VIDEO_PLAYER_DBG_ON && url=='/al_video.php' && q.act=='show') answer[2]=answer[2].replace('"dbg_on":0','"dbg_on":1');
  if (getSet(21)=='y' && url=='/al_video.php' && q.act=='show'){
     answer[2]=answer[2].replace(/"eid1"\s*:\s*"?\d+"?/i,'"eid1":0');
     answer[2]=answer[2].replace(/"(show_ads[^"]*)"\s*:\s*"?\d+"?/ig,'"$1":0');
  }
}

vk_features={
   poll_preview_btn:function(node){
      if (!node) return;
      var t=geByTag('textarea',node)[0];
      if (!t) return;
      t.setAttribute('id','vk_poll_code');
      var el=se('<div><a href="#" onclick="return vk_features.poll_preview();">'+IDL('Preview',1)+'</a><div id="vk_poll_preview"></div></div>');
      node.appendChild(el);
   },
   poll_preview:function(){
      stManager.add('api/openapi.js',function(){
         ge('vk_poll_preview').innerHTML='';
         ge('vk_poll_preview').innerHTML=ge('vk_poll_code').value.replace(/<script[^>]+>[^<]*<\/script>/g,'');
         ev41(ge('vk_poll_code').value.match(/VK\.Widgets[^\)]+\)/)[0]);
      });

      /*
      fr=se('<iframe frameborder="0"  style="width: 100%; height: 200px;"></iframe>'); 
      ge('vk_poll_preview').appendChild(fr);
      fr.contentDocument.write(ge('vk_poll_code').value);
      */
      return false;
   },
   emoji_inj:function(){
      //Emoji.cssEmoji[code][1]
      if (getSet(95)=='y'){
         Inj.Replace('Emoji.addEmoji','Emoji.cssEmoji[code][1]','(Emoji.cssEmoji[code]?Emoji.cssEmoji[code][1]:Emoji.codeToChr(code))');
      }
   },
   upload_inj:function() {
       if (getSet(98)=='y')
           Inj.End('Upload.onCheckComplete','vk_features.mod_upload_box();');   // если нужны опции, vk_features.mod_upload_box(options)
   },
   mod_upload_box: function () {    // Перенос контента из MessageBox-a в видеоплеер
       if (!isVisible(window.mvLayerWrap) // если уже существует видеоплеер, ничего не делать, а то второй плеер не запустится, а темный слой останется.
       && (nav.objLoc[0].indexOf('audio')==0 || nav.objLoc[0].indexOf('docs')==0)) { // и только для аудио и документов
           var b = curBox(), cb = __bq.curBox; // бекап текущих переменных для правильной работы функции curBox
           b.hide = function () {};
           vkAlertBox(geByClass('box_title')[0].textContent, b.bodyNode.parentNode, function () {
               // восстановление переменных
               b.isVisible = function () {    
                   return true;
               };
               b.hide = function () {
                   Videoview.hide(false, true);
               };
               __bq.curBox = cb;    // 
               _message_boxes[__bq.curBox] = b;
               // Исправление функции перетаскивания в окно
               var dragElEvents = data(ge('box_layer_wrap'),'events');
               var dragElNew = ge('mv_layer_wrap');
               addEvent(dragElNew, 'dragenter', dragElEvents.dragenter.pop());
               addEvent(dragElNew, 'dragover', dragElEvents.dragover.pop());
               addEvent(dragElNew, 'dragleave', dragElEvents.dragleave.pop());
           }, null, true);
           // чтобы не разрушался Upload при переходе на другую страницу, убираем Upload.deinit из списка функций для уничтожения.
           if (nav.objLoc[0].indexOf('audio')==0)
               cur.destroy.pop();
           else if (nav.objLoc[0].indexOf('docs')==0) {
               cur.destroy.splice(-3,1);
               // бекап и восстановление функций для сохранения документа, т.к. nav.go() чистит cur
               window.curdocChangeType = cur.docChangeType;
               window.curtagsDD = cur.tagsDD;
               window.cursaveUploadedDoc = cur.saveUploadedDoc;
               window.curdocTags = cur.docTags;
               window.radioBtnsdocs_file_type = radioBtns.docs_file_type;
               Inj.Start('Upload.onUploadComplete',
                   'cur.docChangeType=curdocChangeType;' +
                   'cur.tagsDD=curtagsDD;' +
                   'cur.saveUploadedDoc=cursaveUploadedDoc;' +
                   'cur.docTags=curdocTags;' +
                   'radioBtns.docs_file_type=radioBtnsdocs_file_type;');
           }
       }
   }
};

vk_ch_media={
   photo:function(id,img,w,h){
      var sizes=null;
      
      img=img || "/images/no_photo.png";
      if (img){
         w = w || 115;
         h = h || 87;
         var s=w/h;
         sizes={
            "s": [img, Math.round(75*(s<1?s:1)), Math.round(75/(s>1?s:1))],
            "m": [img, Math.round(130*(s<1?s:1)), Math.round(130/(s>1?s:1))],
            "x": [img, Math.round(604*(s<1?s:1)), Math.round(604/(s>1?s:1))],
            "o": [img, Math.round(130*(s<1?s:1)), Math.round(130/(s>1?s:1))],
            "p": [img, Math.round(200*(s<1?s:1)), Math.round(200/(s>1?s:1))],
            "q": [img, Math.round(320*(s<1?s:1)), Math.round(320/(s>1?s:1))],
            "r": [img, Math.round(510*(s<1?s:1)), Math.round(510/(s>1?s:1))]
         } 
      
      } else {
         img="/images/no_photo.png";
         sizes={
            "s": [img, 57, 43],
            "m": [img, 115, 87],
            "x": [img, 575, 435],
            "o": [img, 115, 87],
            "p": [img, 230, 174],
            "q": [img, 345, 261],
            "r": [img, 575, 435]
         }  
      }
      
      cur.chooseMedia('photo', id, {
         "thumb_s": img, 
         "thumb_m": img,
         "view_opts": '{temp:{x_src: "'+img+'"}}',  
         "editable": {
            "sizes": sizes
         }
      });
   },
   video:function(vid){
      cur.chooseMedia('video', vid, {
         "thumb": "/images/video_s.png",
         "editable": {
            "sizes": {
               "s": ["/images/video_s.png", 130, 98],
               "m": ["/images/video_m.png", 160, 120],
               "l": ["/images/video_l.png", 240]
            },
            "duration": 0
         }
      });
   
   }
};
function vkPhChooseProcess(answer,q){
  vkCheckPhotoLinkToMedia=function(){
    var btn=ge('vk_link_to_photo_button');
    var val=ge('vk_link_to_photo').value.match(/photo(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      vk_ch_media.photo(val[1]+'_'+val[2]);
      /*
      cur.chooseMedia('photo', val[1]+'_'+val[2],{"thumb_s": "http://vk.com/images/no_photo.png", "thumb_m": "http://vk.com/images/no_photo.png","view_opts": '{temp:{x_src: "http://vk.com/images/no_photo.png"}}',  "editable": {
      "sizes": {
         "s": ["http://vk.com/images/no_photo.png", 57, 43],
         "m": ["http://vk.com/images/no_photo.png", 115, 87],
         "x": ["http://vk.com/images/no_photo.png", 575, 435],
         "o": ["http://vk.com/images/no_photo.png", 115, 87],
         "p": ["http://vk.com/images/no_photo.png", 230, 174],
         "q": ["http://vk.com/images/no_photo.png", 345, 261],
         "r": ["http://vk.com/images/no_photo.png", 575, 435]
      }
   }
});//*/
// ['', '', '', '{temp: {x_src: ""}, big: 1}']  ['http://cs5751.vk.com/u13391307/138034142/m_a6b31fd8.jpg', 'http://cs5751.vk.com/u13391307/138034142/s_818dc071.jpg', '9b949405dd303694e1', '{temp: {x_src: "http://cs5751.vk.com/u13391307/138034142/x_c8cae130.jpg"}, big: 1}']
    } else {
      alert(IDL('IncorrectPhotoLink'))
    }
    unlockButton(btn);
  };

  if (answer[1] && answer[1].indexOf && answer[1].indexOf('vk_link_to_photo')==-1){
     var div=vkCe('div',{},answer[1]);
     var ref=q.act=="a_choose_photo_box"?geByClass('summary',div)[0]:geByClass('photos_choose_rows',div)[0];
     //*
     var p=geByClass('photos_choose_header_title',div)[0];
     if (p && !/choose_album/.test(p.innerHTML)){
      val(p, '');
      var mPhM = vkCe('a',{"class":'fl_l_',href:'#'},IDL('mPhM',1));
      mPhM.setAttribu7e('onclick','return vk_photos.choose_album();');
      p.appendChild(mPhM);
      if (vk_DEBUG) console.log(q);
      if (q.to_id && q.to_id<0){
         p.appendChild(vkCe('span',{"class":'fl_l_ divider'},'|'));
         var ca = vkCe('a',{"class":'fl_l_',href:'#'},IDL('GroupAlbums',1));
         ca.setAttribu7e('onclick', 'return vk_photos.choose_album('+q.to_id+');');
         p.appendChild(ca);
      }
     }//*/
     if (ref){
       var node=vkCe('div',{"class":'ta_r vk_opa2','style':"height: 25px; padding-left:10px; padding-top:4px;"},'\
       <div class="fl_l">\
           '+IDL('EnterLinkToPhoto')+': \
         <span><input id="vk_link_to_photo" type="text"  style="width:230px" class="s_search text"></span>\
         <div id="vk_link_to_photo_button" class="button_blue" style="vertical-align: middle;"><button onclick="vkCheckPhotoLinkToMedia();">'+IDL('OK')+'</button></div>\
       </div>\
       ');
       ref.parentNode.insertBefore(node,ref);
       ref.parentNode.insertBefore(vkCe('h4'),ref);
       answer[1]=div.innerHTML;
     }
     
     //vk_photos.choose_album();<a class="fl_r">'+IDL('mPhM',1)+'</a>
  }
}

function vkVidChooseProcess(answer,q){
//*
  vkCheckVideoLinkToMedia=function(){
    var btn=ge('vk_link_to_video_button');
    var val=ge('vk_link_to_video').value.match(/video(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      //cur.chooseMedia('video', val[1]+'_'+val[2], 'http://vk.com/images/video_s.png');
      vk_ch_media.video(val[1]+'_'+val[2]);
    } else {
      alert(IDL('IncorrectVideoLink'))
    }
    unlockButton(btn);
  };
  if (answer[1].indexOf('vk_link_to_video')==-1){
  var div=vkCe('div',{},answer[1]);
  if (vk_DEBUG) console.log(answer);
  var ref=geByClass('summary',div)[0] || geByClass('search_bar',div)[0] || geByClass('choose_search_cont',div)[0];
   
   var p=geByClass('choose_close',div)[0];
   if (p && !/choose_album/.test(p.innerHTML)){
         p.insertBefore(vkCe('span',{"class":'divide'},'|'),p.firstChild);
         var mPhM = vkCe('a',{"class":'',href:'#'},IDL('mPhM',1));
         mPhM.setAttribu7e('onclick','return vk_videos.choose_album();');
         p.insertBefore(mPhM, p.firstChild);
         //console.log(q);
      if (q.to_id && q.to_id<0){
         p.insertBefore(vkCe('span',{"class":'divide'},'|'),p.firstChild);
         var GroupAlbums = vkCe('a',{"class":'',href:'#'},IDL('GroupAlbums',1));
         GroupAlbums.setAttribu7e('onclick', 'return vk_videos.choose_album('+q.to_id+');');
         p.insertBefore(GroupAlbums,p.firstChild)
      }
   } 
  
  if (ref){
    var node=vkCe('div',{'style':"padding: 4px 20px; padding-left:0px; margin-top: 33px;","class":'vk_opa2 vk_idattach'},'\
    <div class="fl_l">'+IDL('EnterLinkToVideo')+':</div>\
      <span class="fl_l"><input id="vk_link_to_video" type="text"  style="width:215px" class="s_search text"></span>\
      <div id="vk_link_to_video_button" class="button_blue fl_r"  style="vertical-align: middle;"><button onclick="vkCheckVideoLinkToMedia();">'+IDL('OK')+'</button></div>\
    \
    ');
    /*ref.parentNode.insertBefore(node,ref);
    ref.parentNode.insertBefore(vkCe('h4'),ref);*/
    //ref.parentNode.appendChild(node);
    ref.appendChild(node);
    answer[1]=div.innerHTML;
  }
  }
//*/  
}

function vkAudioChooseProcess(answer,q){
  vkCheckAudioLinkToMedia=function(){
    var btn=ge('vk_link_to_audio_button');
    var val=ge('vk_link_to_audio').value.match(/audio(-?\d+)_(\d+)/);
    lockButton(btn);
    if (val){
      cur.chooseMedia('audio',  val[1]+'_'+val[2], {performer: val[1], title: val[2], info: ',0', duration: '0:00'});//.chooseMedia('audio', val[1]+'_'+val[2], [val[1], val[2]]);//[artist,name]
    } else {
      alert(IDL('IncorrectAudioLink'))
    }
    unlockButton(btn);
  };
  if (answer[1].indexOf('vk_link_to_audio')==-1){
  var div=vkCe('div',{},answer[1]);
  var ref=geByClass('summary',div)[0] || geByClass('search_bar',div)[0];
   
   var p=geByClass('choose_close',div)[0];
   if (p && !/choose_album/.test(p.innerHTML)){
         p.insertBefore(vkCe('span',{"class":'divide'},'|'),p.firstChild);
         var mPhM = vkCe('a',{"class":'',href:'#'},IDL('mPhM',1));
         mPhM.setAttribu7e('onclick','return vk_audio.choose_album();');
         p.insertBefore(mPhM, p.firstChild);
         //console.log(q);
      if (q.to_id && q.to_id<0){
         p.insertBefore(vkCe('span',{"class":'divide'},'|'),p.firstChild);
         var GroupAlbums = vkCe('a',{"class":'',href:'#'},IDL('GroupAlbums',1));
         GroupAlbums.setAttribu7e('onclick', 'return vk_audio.choose_album('+q.to_id+');');
         p.insertBefore(GroupAlbums,p.firstChild)
      }
   }
  
  if (ref){
    var node=vkCe('div',{'style':"padding: 4px 20px; padding-left:0px; margin-top: 33px;","class":'vk_opa2 vk_idattach'},'\
    <div class="fl_l" style="line-height:20px">'+IDL('EnterLinkToAudio')+':</div>\
      <span class="fl_l"><input id="vk_link_to_audio" type="text" style="width:190px"  class="s_search text"></span>\
      <div id="vk_link_to_audio_button" class="button_blue fl_r"  style="vertical-align: middle;"><button onclick="vkCheckAudioLinkToMedia();">'+IDL('OK')+'</button></div>\
    \
    ');
    //ref.parentNode.insertBefore(node,ref);
    //ref.parentNode.insertBefore(vkCe('h4'),ref);
    ref.appendChild(node);
    //ref.parentNode.appendChild(node);
    answer[1]=div.innerHTML;
  }
  }  
}
   

/* IM */


vk_messages={
   html_tpl:'<!DOCTYPE html>\
   <html>\
      <head><meta charset="utf-8"/><link rel="shortcut icon" href="http://vk.com/images/fav_chat.ico"/><link rel="stylesheet" type="text/css" href="http://vk.com/css/al/common.css" /><title>%title</title><style>\
      body{text-align:center;font:12px/16px Verdana;margin:5px;}\
      hr{border-color:#C3D1E0;}\
      .messages{width:950px;margin:0 auto;text-align:left;} .msg_item {overflow:hidden} .from,.msg_body,.att_head,.attacments,.attacment,.fwd{margin-left:80px;}\
      .upic{float:left} .upic img{vertical-align:top;width:70px;padding:5px;height:70px;}\
      a,a:visited{text-decoration:none;color:#2B587A} a:hover{text-decoration:underline} .att_head{color:#777;}\
      .att_ico{float:left;width:11px;height:11px;margin: 3px 3px 2px; background-image:url(\'http://vk.com/images/icons/mono_iconset.gif\');}\
      .att_photo{background-position: 0 -30px;} .att_audio{background-position: 0 -222px;} .att_video{background-position: 0 -75px;}\
      .att_doc{background-position: 0 -280px;} .att_wall,.att_fwd{background-position: 0 -194px;} .att_gift{background-position: 0 -105px;} \
      .att_sticker{background-position: 0 -362px; width: 12px; height: 12px;}\
      .att_link{background-position: 0 -237px;} .attb_link a span{color:#777777 !important;} .att_geo{background-position: 0 -165px;}\
      .fwd{border:2px solid #C3D1E0;border-width: 0 0 0 2px;margin-left:85px;}\
      </style></head>\
      <body><div class="messages">%messages_body</div></body>\
   </html>',
   make_html: function(msg,user){
      var html='';
      var t2d = function(unix){
         var time = new Date(unix*1000);
         return time.getFullYear()+'.'+('0'+(time.getMonth()+1)).slice(-2)+'.'+('0'+time.getDate()).slice(-2)+' '+('0'+time.getHours()).slice(-2)+':'+('0'+time.getMinutes()).slice(-2)+':'+('0'+time.getSeconds()).slice(-2);
      };
      var t2m = function(inputText) {
         var replacedText,replacePattern2,replacePattern3;
         //add break
         replacedText = replaceEntities(inputText).replace(/&/g,'&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />').replace(/"/g, '&quot;');

            /*
                           replacedText.replace(/&#(\d\d+);/g,function(s, c) {
                                  c=replaceEntities('&#'+c+';')
                                  return c.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />').replace(/"/g, '&quot;');
                           }
            */
          //URLs starting with http://, https://, or ftp://
          replacePattern2 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\\/%?=~_|!:,.;\u0410-\u042f\u0430-\u044f\u0401\u0451]*[-A-Z0-9+&@#\/%=~_|\u0410-\u042f\u0430-\u044f\u0401\u0451])/gim; // /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;А-Яа-яЁё]*[-A-Z0-9+&@#\/%=~_|А-Яа-яЁё])/gim;
          replacedText = replacedText.replace(replacePattern2, '<a href="$1" target="_blank">$1</a>');
          //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
          replacePattern3 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
          replacedText = replacedText.replace(replacePattern3,'$1<a href="http://$2" target="_blank">$2</a>');
          
         if (window.Emoji && Emoji.emojiToHTML)
            replacedText = Emoji.emojiToHTML(replacedText,true).replace(/"\/images\//g,'"http://vk.com/images/') || replacedText;          
          
          return replacedText;
      };
		var doc2text=function(t){
			// проверка < и > в именах документов
			return t.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;').replace(/&/g,'&amp;');
		};
      var a2t = function(sec){
         return Math.floor(sec/60)+':'+('0'+(sec%60)).slice(-2);
      };
      var chatAction=function(action_name){
         switch(action_name){
            case 'chat_photo_update':
               html='<div style="color:#888888;">'+IDL('HistMsgChatAvaUpd')+'</div>';
               break;
            case 'chat_photo_remove':
               html='<div style="color:#888888;">'+IDL('HistMsgChatAvaDel')+'</div>';
               break;
            default:
               html='<div>action "<b>'+action_name+'</b>" is unknown</div>'
         }
         return html;
      };
      var make_attach=function(attach){
         var html='';
         if (!attach[attach.type]){ 
            //console.log('Attach broken?', attach);
            attach[attach.type]={};
         }
         switch (attach.type){
            case 'photo':
               var photolink=attach.photo.photo_2560 || attach.photo.photo_1280 || attach.photo.photo_807 || attach.photo.photo_604;
               var photo_size=attach.photo.width ? ' ('+attach.photo.width+'x'+attach.photo.height+')' : '';
               html+='<div class="attacment"> <div class="att_ico att_photo"></div> <a target="_blank" href="'+photolink+'">[photo'+attach.photo.owner_id+'_'+attach.photo.id+']'+photo_size+'</a> </div>';
               break;
            case 'audio':
               var url = attach.audio.url;
               if (!url){
                  url = 'http://vk.com/audio?q='+encodeURIComponent(attach.audio.artist+' - '+attach.audio.title);
               }
               html+='<div class="attacment"> <div class="att_ico att_audio"></div> <a target="_blank" href="'+url+'">[audio'+attach.audio.owner_id+'_'+attach.audio.id+'] '+doc2text(attach.audio.artist)+' - '+doc2text(attach.audio.title)+' ('+a2t(attach.audio.duration)+')</a></div>';
               break;  
            case 'video':
               html+='<div class="attacment"> <div class="att_ico att_video"></div> <a href="http://vk.com/video'+attach.video.owner_id+'_'+attach.video.id+'" target="_blank">[video'+attach.video.owner_id+'_'+attach.video.id+'] '+doc2text(attach.video.title)+' ('+a2t(attach.video.duration)+')</a></div>';
               break;
            case 'doc':
               html+='<div class="attacment"> <div class="att_ico att_doc"></div> <a target="_blank" href="'+attach.doc["url"].replace(/&/g,'&amp;')+'">'+doc2text(attach.doc.title)+'</a></div>';
               break;
            case 'wall':
               html+='<div class="attacment"> <div class="att_ico att_wall"></div> <a target="_blank" href="http://vk.com/wall'+attach.wall.to_id+'_'+attach.wall.id+'">[wall'+attach.wall.to_id+'_'+attach.wall.id+']</a></div>';
               break;
            case 'link':
               html+='<div class="attacment attb_link"> <div class="att_ico att_link"></div> <a href="'+attach.link.url+'" target="_blank"><span>'+IDL('HistMsgAttachLink')+'</span> '+doc2text(attach.link.title)+'</a></div>'; 
               break;   
            case 'gift':
               html+='<div class="attacment"> <div class="att_ico att_gift"></div> <a target="_blank" href="'+attach.gift.thumb_256+'">'+IDL('HistMsgAttachGift')+' #'+attach.gift.id+'</a></div>'; 
               break;
            case 'sticker':
               html+='<div class="attacment"> <div class="att_ico att_sticker"></div> <a target="_blank" href="'+attach.sticker.photo_256+'">'+IDL('HistMsgAttachSticker')+' #'+attach.sticker.id+'</a></div>'; 
               break;               
            default:
               html+=JSON.stringify(attach);
               //console.log(attach.type+' is unknown');               
         }
         return html;
      };
		var make_geo=function(m){
			var html='';
         html+='<div class="attacment"> <div class="att_ico att_geo"></div> <a href="https://maps.google.ru/maps?q='+m.geo['coordinates']+'" target="_blank">'+IDL('HistMsgGeoAttach')+' '+(m.geo['place'] || {'title':'---'})['title']+'</a></div>';
			return html;
		};

      // write data
      html+='<hr>';
      html+='<div> '+IDL('HistMsgDates').replace(/%start/g,t2d(msg[0].date)).replace(/%end/g,t2d(msg[msg.length-1].date))+' </div>';
      html+='<div> '+IDL('HistMsgCount').replace(/%count/g,msg.length)+' </div>';
      html+='<hr>';

      // icons
      // http://vk.com/images/icons/mono_iconset.gif

      // build
      for(var i=0,j=msg.length;i<j;i++){
         var u=(user[msg[i].from_id] || {
                           id: msgfwd[i].user_id,
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        } );
		 html+='<div id="msg'+msg[i].id+'" class="msg_item">';
         html+='<div class="upic"><img src="'+
		 u.photo_100+
		 '" alt="[photo_100]"></div>';
         html+='<div class="from"> <b> <a href="http://vk.com/id'+msg[i].from_id+'" target="_blank">'+u.first_name+' '+u.last_name+'</a></b> @ <a href="#msg'+msg[i].id+'">'+t2d(msg[i].date)+'</a></div>';
         if(msg[i].body != ""){
               html+='<div class="msg_body">'+t2m(msg[i].body)+'</div>';
         }
         if(msg[i].action){
            html+=chatAction(msg[i].action);
         }
         if(msg[i].attachments !== undefined){
            html+='<div class="attacments"> <b>'+IDL('HistMsgAttachments')+'</b> </div>';
            var l=msg[i].attachments.length;
            for(var k=0;k<l;k++){
               html+=make_attach(msg[i].attachments[k]);
            }
         }
         //геолокаци
         if(msg[i].geo !== undefined)
            html+=make_geo(msg[i]);
         
         if(msg[i].fwd_messages !== undefined){
            initfwd(msg[i].fwd_messages);
         }
         html+='</div>';
      }
      html+='<hr>';

      function initfwd(msgfwd){
         html+='<div class="att_head"> <div class="att_ico att_fwd"></div> '+IDL('HistMsgFwd')+' </div>';
         html+='<div class="fwd">';
         for(var k=0,l=msgfwd.length;k<l;k++){
            var u = (user[msgfwd[k].user_id] || {
                           id: msgfwd[k].user_id,
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        } );
			html+='<div class="msg_item">';
            html+='<div class="upic"><img src="'+
			u.photo_100+
			'" alt="[photo_100]"></div>';
            html+='<div class="from"> <b> <a href="http://vk.com/id'+msgfwd[k].user_id+'" target="_blank">'+u.first_name+' '+u.last_name+'</a></b> @ '+t2d(msgfwd[k].date)+'</div>';
            html+='<div class="msg_body"> '+t2m(msgfwd[k].body)+'</div>';
            if(msgfwd[k].attachments !== undefined){
               html+='<div class="attacments"> <b>'+IDL('HistMsgAttachments')+'</b> </div>';
               var n=msgfwd[k].attachments.length;
               for(var m=0;m<n;m++){
                  html+=make_attach(msgfwd[k].attachments[m]);
               }
            }
            if(msgfwd[k].geo !== undefined)
               html+=make_geo(msgfwd[k]);

            if(msgfwd[k].fwd_messages !== undefined){
               initfwd(msgfwd[k].fwd_messages);
            }
            html+='</div>';
         }
         html+='</div>';
      }
      return html;
   },
   get_history:function(uid){
      if (!uid) uid=cur.thread.id;
      var PER_REQ=100;
      var offset=0;
      var messages = [];
      var users_ids = [];
      var history_uids={};
      stManager.add('emoji.js');
      var collect_users=function(arr){
         for (var i=0; i<arr.length; i++){
            var msg=arr[i];
            //console.log(msg)
            if (msg.from_id) history_uids[msg.from_id]='1';
            if (msg.from_id && users_ids.indexOf(msg.from_id)==-1) users_ids.push(msg.from_id);
            if (msg.user_id && users_ids.indexOf(msg.user_id)==-1) users_ids.push(msg.user_id);
            if (msg.fwd_messages)
               collect_users(msg.fwd_messages);
               //for (var i=0; i<msg.fwd_messages.length; i++)
         }
      }; 
      var scan=function(){
         hide('save_btn_text');
         show('saveldr');
         //document.title='offset:'+offset;
         var w=getSize(ge('saveldr'),true)[0];
         if (offset==0) val(ge('saveldr'), vkProgressBar(offset,10,w));
         
         var code=[];
         for (var i=0; i<10; i++){
            code.push('API.messages.getHistory({user_id:'+uid+', count:'+PER_REQ+', offset:'+offset+', rev:1}).items');// 
            offset+=PER_REQ;
         }
         dApi.call('execute',{code:'return {count:API.messages.getHistory({user_id:'+uid+', count:0, offset:0}).count, items:'+code.join('+')+'};',v:'5.5'},function(r){
            var msgs = r.response.items;
            var count = r.response.count;
            val(ge('saveldr'), vkProgressBar(offset,count,w));
            
            messages = messages.concat(msgs);
            if (msgs.length>0){
               setTimeout(function(){scan();},350);
            } else {
               collect_users(messages);
               val(ge('saveldr'), vkProgressBar(0,100,w,'Users data... %'));
               dApi.call('users.get',{user_ids:users_ids.join(','),fields:'photo_100',v:'5.5'},function(r){
                  val(ge('saveldr'), vkProgressBar(90,100,w,'Users data... %'));
                  var usrs=r.response;
                  var users={};
                  for (var i=0; i<usrs.length; i++)
                     users[usrs[i].id]=usrs[i];
                  for (var i=0; i<users_ids.length; i++)
                     if (!users[users_ids[i]]) 
                        users[users_ids[i]]={
                           id: users_ids[i],
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        }; 
                  
                  var html=vk_messages.make_html(messages, users);
                  html=vk_messages.html_tpl.replace(/%messages_body/g,html);
                  val(ge('saveldr'), vkProgressBar(100,100,w,'Users data... %'));
                  show('save_btn_text');
                  hide('saveldr');
                  
                  var file_name=[];
                  for (var key in users){
                     var uid=parseInt(key || '0');
                     if (history_uids[key] && !(window.vk && uid==vk.id)) file_name.push(users[key].first_name+" "+users[key].last_name+'('+uid+')');
                  }
                  
                  html=html.replace(/%title/g,'VK Messages: '+file_name.join(','));
                  
                  vkSaveText(html,"messages_"+vkCleanFileName(file_name.join(',')).substr(0,250)+".html");
               });
               //alert(users);
            }
         });
      };
      scan();
   }
};

vk_im={
   css:function(){
      return '\
      .vk_im_reply{opacity:0; margin-top:1px; margin-left: -34px; position:absolute; }\
      .im_in:hover .vk_im_reply{opacity:1;}\
      .im_out .vk_im_reply{display:none;}\
      ';
   },
   page: function(){
      vk_im.add_prevent_hide_cbox();
      //vkMsgStatsBtn();
      vk_im.add_menus();
      if (getSet(76) == 'y')    // Отключение функции преобразования ссылок в ЛС в миниатюры с текстом
          Inj.Wait('cur.imMedia', function () {
              Inj.Start('cur.imMedia.onCheckURLDone', 'if (data[0]=="share") result=false; ' +
                  'var addMedia=cur.imMedia, multi=true, progressEl=ge("im_progress_preview"), opts={mail:1,onCheckURLDone:IM.onUploadDone};');
          });
   },
   add_menus:function(){
      if (!ge('vk_im_menu')){
  
         var p_options = [];
         if (getSet(40)=='y') {
            p_options.push({l:IDL('msgdelinbox',2), onClick:function() {
               vkDeleteMessages();
            }});
            p_options.push({l:IDL('msgdeloutbox',2), onClick:function() {
               vkDeleteMessages(true);
            }});
         }
         p_options.push({l:IDL('Stats',2), onClick:function() {
            vkMsgStats();
         }});         
         
         if (p_options.length>0){
            var el=se('<li class="t_r" id="vk_im_menu">\
               <span class="add_media_lnk" id="vk_im_menu_actions" style="cursor: pointer;">'+IDL('Actions')+'</span><span class="divider">|</span>\
             </li>');
            ge('im_top_tabs').appendChild(el);            
            
            stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
               cur.vkAlbumMenu = new DropdownMenu(p_options, {
                 target: ge('vk_im_menu_actions'),
                 containerClass: 'dd_menu_posts',
                 updateHeader:function(){ return IDL('Actions'); },
                 //offsetLeft:-15,
                 showHover:false
               });
            }); 
         }         
         
      }
      if (ge('vk_im_menu')){
         if (nav.objLoc['sel'])
            hide('vk_im_menu');
         else
            show('vk_im_menu');
      }
   },
   process_node:function(node){
      vk_im.reply_btns(node);
   },
   process_date_link: function (node){
      if (node.parentNode.className=='im_date_link'){
         var inp=vkNextEl(node); 
         var ts;
         var fmt=gpeByClass('im_add_row', node) ? 'HH:MM:ss':'d.mm.yy HH:MM:ss';
         if (inp && (ts=parseInt(inp.value)))  val(node, (new Date((ts-vk.dt)*1000)).format(fmt));
      }
   },
   add_prevent_hide_cbox: function (){
      Inj.Wait('cur.imMedia',function(){
         var p=geByClass('add_media_items', cur.imMedia.menu.menuNode)[0];
         var html='<div class="checkbox" id="vk_no_hide_add_box"  style="padding: 7px;" onclick="checkbox(this); window.vk_prevent_addmedia_hide=isChecked(this);">'+
                     '<div></div>'+'<nobr>'+IDL('PreventHide')+'</nobr>'+
                  '</div>';
         var id='add_media_type_' +  cur.imMedia.menu.id + '_nohide';
         if (!ge(id)){
            // ADD WALL POST
            var a=vkCe('a',{'class':'add_media_item','style':"background-image: url('/images/icons/attach_icons.png'); background-position: 3px -130px;"},'<nobr>'+IDL('WallPost')+'</nobr>');
            a.onclick = vk_im.attach_wall;
            p.appendChild(a);
            
            a=vkCe('a',{id:id,'style':'border-top:1px solid #DDD;'},html);
            p.appendChild(a);

         }
         Inj.Before(' cur.imMedia.onChange','boxQueue','if (!window.vk_prevent_addmedia_hide)');
      });
   },
   attach:function(type,media,data){
      if (!isArray(cur.imPeerMedias[cur.peer])) {
         cur.imPeerMedias[cur.peer] = [];
         cur.imSortedMedias[cur.peer] = [];
      }
      var preview = type+media,
         postview = '',
         attrs = '',
         conts = [
            ge('im_docs_preview'),
            ge('im_media_preview'),
            ge('im_media_dpreview'),
            ge('im_media_mpreview'),
            ge('im_sdocs_preview')
         ], curPeerMedia = cur.imPeerMedias[cur.peer];

      var contIndex = 0, cont;
      var ind = curPeerMedia.length,
          mediaHtml = '<div class="im_preview_' + type + '_wrap im_preview_ind%ind%"' + attrs + '>' + preview + '<div nosorthandle="1" class="im_media_x inl_bl" '+ (browser.msie ? 'title' : 'tooltip') + '="' + getLang('dont_attach') + '" onmouseover="if (browser.msie) return; showTooltip(this, {text: this.getAttribute(\'tooltip\'), shift: [14, 3, 3], black: 1})" onclick="cur.addMedia[%lnkId%].unchooseMedia(%ind%); return cancelEvent(event);"><div class="im_x" nosorthandle="1"></div></div>' + postview + '</div>',
          mediaEl = se(rs(mediaHtml, {lnkId: cur.imMedia.lnkId, ind: ind}));
      if (data.upload_ind !== undefined) re('upload' + data.upload_ind + '_progress_wrap');
      (cont = conts[contIndex]).appendChild(mediaEl);
      curPeerMedia.push([type, media, contIndex, mediaHtml]);
      if (!cur.fileApiUploadStarted || data.upload_ind === undefined) {
        boxQueue.hideLast();
      }
      if (data.upload_ind !== undefined) {
        delete data.upload_ind;
      }
      show(cont);
   },
   attach_wall:function(){
         var add=null;
         var aBox = new MessageBox({title: IDL('EnterLinkToWallPost')});
         aBox.removeButtons();
         aBox.addButton(getLang('box_cancel'),function(){  
            aBox.hide();	 
         }, 'no');
         aBox.addButton('OK',function(){ 
            add();            
         },'yes');
         //event.keyCode == 13
         aBox.content('<div id="vk_attach_wall"><input type="text" style="width:370px;"></div>');
         aBox.show();

         var el=ge('vk_attach_wall');
         var inp=el.getElementsByTagName('input')[0];
         inp.focus();
         inp.onkeyup=function(ev){
            ev = ev || window.event;
            if (ev.keyCode == 13) {
               add();
            }    
         };
         
         add=function(){
            var val=(inp.value || '').match(/(wall)(-?\d+_\d+)/);// ^\[([^\|\[\]]+)\|([^\|\[\]]+)\]$
            if (!val) (inp.value || '').match(/^\[([^\|\[\]]+)\|([^\|\[\]]+)\]$/); // format [type|madia_id]
            if (val){
               vk_im.attach(val[1],val[2],{});
               //cur.chooseMedia('wall',val[1],{});
               aBox.hide();
            } else {
               alert(IDL('IncorrectWallPostLink'))
            }
         };         
      return false;
   },
   
   reply_btns:function(node){
      if (getSet(81)!='y') return;
      var nodes=geByClass('im_date_link',node);//geByClass('im_log_author_chat_name',node);
      for (var i=0; i<nodes.length; i++)
        if (nodes[i].firstElementChild) {   // не делать кнопку "ответить" при просмотре результатов поиска
         var mid=(nodes[i].firstElementChild.href || '').match(/mail.+id=(\d+)/) || (nodes[i].firstElementChild.href || '').match(/im\?.*msgid=(\d+)/);
         if (!mid) continue;
         mid = mid[1];
         var p=nodes[i].parentNode;
         if (p.innerHTML.indexOf('vk_im.reply')!=-1) continue;
         var r=se('<a class="fl_r_ vk_im_reply opacity_anim" onmouseover="showTooltip(this, {text: \''+IDL('Reply')+'\', showdt: 0, black: 1, shift: [15, -2, 0], className: \'im_important_tt\'});" onclick="return vk_im.reply(this,event,'+mid+')"><div class="vk_repost_icon"></div></a>');
         p.insertBefore(r,p.firstChild); //appendChild(r);
      }
   },
   reply:function(el,ev,msg_id){
      //ev = ev || window.event;
      
      var scrll=IM.scrollOn;
      IM.scrollOn=function(){};
      
      var selMsgs=[];
      // Add to attached mails
      var curPeerMedia = cur.imPeerMedias[cur.peer];
      for (var i in curPeerMedia) {
        if (curPeerMedia[i][0] == 'mail') {
          selMsgs=(curPeerMedia[i][1]+"").split(';');
          cur.imMedia.unchooseMedia(i);
          //curPeerMedia.splice(i, 1);
          break;
        }
      }      
      selMsgs.push(msg_id);
      cur.fwdFromPeer = cur.peer;
      IM.onMediaChange('mail', selMsgs.join(';'), [selMsgs.length]);
      
      IM.scrollOn=scrll;
      
      var txt = IM.getTxt(cur.peer);
      if (cur.editable) {
        Emoji.editableFocus(txt, false, true);
      } else {
        elfocus(txt);
      }
      
      /*
      var ctrl=false;
      if (ev.ctrlKey) ctrl=true;
      var a=geByTag('a',el.parentNode)[0];
      var id=ExtractUserID(a.getAttribute('href'));
      var name=a.innerHTML;
      if (ctrl){
         getGidUid(id,function(uid,gid){// getUserID 
           if (uid){
               vk_im.paste_code('[id'+uid+'|'+name+'], ');
           }
           if (gid){// Ну а вдруг однажды можно будет от имени группы переписываться? 
               vk_im.paste_code('[club'+gid+'|'+name+'], ');
           }
         });
      } else {
         vk_im.paste_code(name+', ');
      }*/
   },
   paste_code:function(code) {
       cur.emojiFocused = false;
       if (cur.editable) {
         var editable = IM.getTxt(cur.peer);
         var sel = window.getSelection ? window.getSelection() : false;
         if (sel && sel.rangeCount) {
           var r = sel.getRangeAt(0);
           if (r.commonAncestorContainer) {
             var rCont = r.commonAncestorContainer;
           } else {
             var rCont = r.parentElement ? r.parentElement() : r.item(0);
           }
         } else {
           var rCont = false;
         }
         var el = rCont;
         while(el && el != editable) {
           el = el.parentNode;
         }
         var edLast = (editable.lastChild || {});
         if (browser.mozilla && edLast.tagName == 'BR' && !edLast.previousSibling) {
           re(editable.lastChild);
         }
         if (!el) {
           IM.editableFocus(editable, false, true);
         }
         if (browser.msie) {
           r = document.selection.createRange();
           if (r.pasteHTML) {
             r.pasteHTML(code);
           }
         } else {
           document.execCommand('insertHTML', false, code);
         }
         if (editable.check) editable.check();
       } else {
         var textArea = IM.getTxt();
         var val = textArea.value;

         var endIndex, range;
         if (textArea.selectionStart != undefined && textArea.selectionEnd != undefined) {
           endIndex = textArea.selectionEnd;
           textArea.value = val.slice(0, textArea.selectionStart) + code + val.slice(endIndex);
           textArea.selectionStart = textArea.selectionEnd = endIndex + code.length;
         } else if (typeof document.selection != 'undefined' && typeof document.selection.createRange != 'undefined') {
           textArea.focus();
           range = document.selection.createRange();
           range.text = code;
           range.select();
         }
       }
   }
};

function vkIM(){
   Inj.Before('IM.addTab','cur.tabs','vkProcessNodeLite(txtWrap);');
   Inj.Before('IM.send','IM.updateUnread','vkProccessLinks(msg_row);');
   Inj.End('IM.addMsg','vkProcessNode(row);');
   if (getSet(51)=='y'){
      Inj.Replace('IM.wrapFriends',/text\.push\(/g,'vkIMwrapFrMod(text,');
      Inj.Replace('IM.wrapFriends','text.join(','vkIMwrapFrModSort(text,');   
   }

   if (getSet(68)=='y') Inj.Start('IM.checked','vkImEvents(response);');
   
   Inj.Before('IM.applyPeer','cur.actionsMenu.setItems','vkIMModActMenu(types,peer,user);');
   if (window.cur && cur.tabs) IM.applyPeer();
   
   if (getSet(89)=='y'){
      Inj.Start('IM.changeTitle','return;');
   }
   if (getSet(48)=='y' && window.Sound){
		Inj.Wait('window.cur && window.cur.sound',function(){
			cur.sound=new Sound2('Msg');
		});
      vkNotifyCustomSInit();
	}
}


function vkImEvents(response){
   if (response.updates) {
      for (var i in response.updates) {
        var update = response.updates[i],
            code = intval(update[0]),
            msg_id = intval(update[1]),// UID!!!!!! copypaste >_<
            flags = intval(update[2]), // chat id
            peer = intval(update[3]);
            // [62, 39226536, 15] - 62 chat
        if (vk_DEBUG) console.log('IM events', code,msg_id,peer,flags,update);
        if (code == 61 || code == 62) { // peer or chat peer is typing
          if (code == 61)
            vkImTypingEvent({uid:msg_id});
          if (code == 62)
            vkImTypingEvent({uid:msg_id,chat:flags});
          /*
          if (code == 62) { // 62 chat     cur.peer == 2e9 + flags
              IM.onTyping(2e9 + flags, msg_id); //cur.tabs[cur.peer].data.members[msg_id]);
          } else if (cur.peer == msg_id) {// 61 user
            IM.onTyping(msg_id);
          }*/
        }
        if (code == 4) {
          vkImTypingEvent(msg_id,true);
        }

      }
   }
}

_vk_im_typings={};
function vkImTypingEvent(uid,need_close){
   var chat=0;
   if (uid.chat)
      chat=uid.chat;
   if (uid.uid)
      uid=uid.uid;
   
   if (chat && getSet(105)=='y') return;

   if (need_close){
      vkHideEvent('vk_typing_'+uid);
      return;
   }
   
   _vk_im_typings=JSON.parse(localStorage['vk_typing_notify'] || '{}');
   
   
   if (_vk_im_typings[uid] && (_vk_im_typings[uid]+NOTIFY_TIMEOUT)>vkNow())
      return;
   _vk_im_typings[uid]=vkNow();
   
   // UPDATE INFO
   var new_to_store={};
   for (var key in _vk_im_typings){
      if ((_vk_im_typings[uid]+NOTIFY_TIMEOUT)>vkNow())
         new_to_store[key]=_vk_im_typings[key];
   }
   localStorage['vk_typing_notify']=JSON.stringify(new_to_store);
   
   //if (cur.peer!=uid)
   setTimeout(function(){      
      vkGetUserInfo(uid,function(info){
         var show=function(chat_name){
            var tm=(new Date).format('isoTime');
            var time='<div class="fl_r">'+tm+'</div>';
            var text=IDL('Typing')+(chat?' ('+IDL("Chat")+' &laquo;'+chat_name+'&raquo;)':'');
            text+=
            '<br><b>'+
            (chat?
            '<a href="#" onclick="TopSearch.writeBox('+(2e9+chat)+'); return false;">'+IDL("Chat")+'</a><span class="divider">|</span>'+
            '<a href="/im?sel=c'+chat+'" onclick="return nav.go(this, event);">'+IDL('Dialog')+'</a>'       
            :
            '<a href="#" onclick="TopSearch.writeBox(%uid); return false;">'+IDL("Chat")+'</a><span class="divider">|</span>'+
            '<a href="/im?sel=%uid" onclick="return nav.go(this, event);">'+IDL('Dialog')+'</a><span class="divider">|</span>'+
            '<a href="/write%uid" onclick="return showWriteMessageBox(event, %uid);">'+IDL('txMessage')+'</a>')+
            '</b>';
            text=text.replace(/%uid/g,info.uid);
            text+=time;
            //if (vk_DEBUG) text+='<br>'+document.title;
            vkShowEvent({sound:'none', hide_in_current_tab:cur.peer==uid ,id:'vk_typing_'+uid,title:info.name, text:text,author_photo:info.photo_rec});
         };
         
         if (!chat) {
            show();
         } else {
            dApi.call('messages.getChat',{chat_id:chat},function(r){
               var sound = (r.response.push_settings || {}).sound; // проверка отключены ли оповещения для чата
               if (sound !== 0)
               show(r.response.title);
            });
         }
      });
   },1);
}

function vkIMwrapFrModSort(text){
   var mysort=function(a,b){
      if (String(a).indexOf('im_friend')!=-1 && String(b).indexOf('im_friend')!=-1){
         var at=(String(a).indexOf('vk_faved_user')!=-1);
         var bt=(String(b).indexOf('vk_faved_user')!=-1);
         if (at && bt) return 0;
         if (at && !bt) return -1;
         if (!at && bt) return 1;
      }
      return 0;
   };
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

function vkIMModActMenu(types,peer,user){
   if (!types || !peer || !user) return;
   if (/*peer > 0 && peer < 2e9 &&*/ user.msg_count){
      //console.log(user);      
      var item=['save_history', IDL('SaveHistory'), '3px -41px', vkIMSaveHistoryBox.pbind(peer)];
      //types.push(item);//  [id, name, bg-position, onclick, href, bg-url, customStyle]
      types.splice(1,0,item);
   }
}
function vkIMSaveHistoryBox(peer){
   var t='\
   <div id="saveldr" style="display:none; padding:8px; padding-top: 14px; text-align:center; width:360px;"><img src="/images/upload.gif"></div>\
   <div id="save_btn_text" style="text-align:center">\
      <div class="button_blue"><button href="#" onclick="vk_messages.get_history('+peer+'); return false;">'+IDL('SaveHistory')+' *.html</button></div><br>\
      <small><a href="#" onclick="toggle(\'msg_save_more\'); return false;">(.txt)</a></small>\
      <div id="msg_save_more" style="display:none;">\
      <div class="button_gray"><button href="#" onclick="vkMakeMsgHistory('+peer+'); return false;">'+IDL('SaveHistory')+'</button></div>\
      <div class="button_gray"><button href="#" onclick="vkMakeMsgHistory('+peer+',true); return false;">'+IDL('SaveHistoryCfg')+'</button></div>\
      </div>\
   </div>';
   vkAlertBox(IDL('SaveHistory'), t, null, null, true);
}

/* NOTIFIER */
function vkNotifier(){
	if(getSet(36)=='y'){
		vk_allow_autohide_notify=false;
		Inj.Before('Notifier.showEvent','ev.fadeTO','if (vk_allow_autohide_notify)');
      Inj.Start('Notifier.unfreezeEvents','if (!vk_allow_autohide_notify) return;'); //Inj.Before('Notifier.unfreezeEvents','this.fadeTO','if (vk_allow_autohide_notify)'); 
      

		Inj.Before('Notifier.onInstanceFocus','Notifier.hideAllEvents','if (vk_allow_autohide_notify)');
      /*Inj.Before('Notifier.onInstanceFocus','Notifier.hideEvent','if (vk_allow_autohide_notify)');
		Inj.Before('Notifier.onInstanceFocus','curNotifier.q_events = []','if (vk_allow_autohide_notify)');
		Inj.Before('Notifier.onInstanceFocus','curNotifier.q_shown = []','if (vk_allow_autohide_notify)');*/
		
		Notifier.unfreezeEvents=Notifier.freezeEvents;
	}
	if (getSet(48)=='y'){
		Inj.Wait('window.curNotifier && window.curNotifier.sound',function(){
			curNotifier.sound=new Sound2('New');
			curNotifier.sound_im=new Sound2('Msg');
		});
      vkNotifyCustomSInit();
	}
   if (getSet(51)=='y'){ 
      vk_fav.inj_notifier();
   }
   
   
   //Inj.Before('FastChat.clistRender','if (lastMid','html.sort(vkFastChatSortUsers);');
   //Inj.Before('FastChat.clistRender','FastChat.clistUpdateTitle','vkProccessLinks(curFastChat.el.clist);');
   
   Inj.Before('Notifier.lpCheck','var response','if (!text || text=="") return;'); //error fix?
	 /* delay for hide notify msg
	  vk_notifier_show_timeout=20000;
	  //Inj.Replace('Notifier.showEventUi','5000','vk_notifier_show_timeout');
	  Inj.Replace('Notifier.showEvent','5000','vk_notifier_show_timeout');
	  Inj.Replace('Notifier.unfreezeEvents','5000','vk_notifier_show_timeout');
	  */
     
    if (getSet(62)=='y')  FastChat.selectPeer=function(mid,e){return showWriteMessageBox(e, mid)};
    if (getSet(68)=='y') Inj.Start('FastChat.imChecked','vkFcEvents(response);');
}

function vkFcEvents(response){
   if (!response || !isArray(response.events) || !response.events.length) {
      return;
   }
   each(response.events, function (){
      var ev = this.split('<!>'),
         evType = ev[1],
         peer = ev[2];
         //console.log('fc:',evType,peer,ev);
      if (evType=='typing' && peer) {
         var uid = peer<2e9?peer:ev[3];
         var chat = peer>2e9?peer-2e9:0;
         if (chat)
            vkImTypingEvent({uid:uid,chat:chat});
         else 
            vkImTypingEvent(uid);
         if (vk_DEBUG) console.log('fc events',ev);
         /* console.log(ev);
            Array ["23", "typing", "13391307", "1", "10116"] // dialog
            Array ["23", "typing", "2000000003", "13391307", "1", "10116"] // Chat!
            
         */
      }
      if (evType=='new' && peer) {
         var uid = peer<2e9?peer:ev[3];
         vkImTypingEvent(uid,true);
      }
   });   
}


/* FRIENDS */
function vkFriends(){
	Inj.Before('Friends.showMore','cur.fContent.appendChild',"html=[vkModAsNode(html.join(''),vkProcessNode)];");
   //Inj.Replace('Friends.acceptRequest','text;','text+vkFrLstSel(mid); alert(text);');
   Inj.Replace('Friends.acceptRequest','text;','vkFrReqDoneAddUserLists(text,mid);');
}
function vkFrReqDoneAddUserLists(text,mid){
   var div=vkCe('div',{},text);
   var el=geByClass('friends_added',div)[0] || geByClass('friends_added_text',div)[0];
   //var mid=text.match(/friends_added_(\d+)/);
   //mid = mid?mid[1]:0;
   if (el && mid && cur.userLists){
      //el.parentNode.
      var el_=vkCe('div',{"class":"friends_added"},'');
      insertAfter(el_,el);
      el_.innerHTML+='<div class="friends_added_text box_controls_text">'+IDL('AddFrToList')+'</div>';
      for (var key in cur.userLists) el_.innerHTML+='<div class="checkbox" onclick="return Friends.checkCat(this, '+mid+', '+key+', 1);"><div></div>'+cur.userLists[key]+'</div>';    
      return div.innerHTML;
   } else {
      return text+'<br><small>add user lists error</small>';
   }
}

function vkModAsNode(text,func,url,q){ //url,q - for processing response 
	if (!text || text.tagName){
      //console.log('ModAsNode fail',text,url,q);
      return text;
   }
   var is_table=text.substr(0,3)=='<tr';
	var div=vkCe(is_table?'table':'div');
	val(div, text);
	func(div);
   vkProcessResponseNode(div,url,q);
	var txt=div.innerHTML;
	if (is_table && txt.substr(0,7)=="<tbody>")	txt=txt.substr(7,txt.length-15);
	return txt;
}


/* MAIL */
function vkMailSendFix(){
   if (nav.objLoc['act']=='show' && !cur.addMailMedia) setTimeout(function(){mail.showMessage(nav.objLoc['id']);},100);
}
function vkMailPage(){
	if(nav.objLoc['act']=='show' || /write\d+/.test(nav.objLoc[0])) {
		vkAddSaveMsgLink();
		if (getSet(40)=='y') vkAddDelMsgHistLink();
		vkProcessNode();
      /*if (!cur.addMailMedia){
         cur.addMailMedia = initAddMedia('mail_add_link', 'mail_added_row', [["photo"," "],["video"," "],["audio"," "],["doc"," "]]);
         cur.addMailMedia.onChange = mail.onMediaChange;
      }*/
	} else {
      vkMsgStatsBtn();
      /*if (ge('mail_bar_search') && !ge('vk_stats_btn')){
         ge('mail_bar_search').insertBefore(vkCe('div',{id:'vk_stats_btn','class':'fl_l'},'<div class="button_blue"><button onclick="vkMsgStats();">'+IDL('Stats')+'</button></div>'),ge('mail_bar_search').firstChild);
      }*/
   }
	if (getSet(40)=='y') vkAddDeleteLink();
}
function vkMsgStatsBtn(){
   if (ge('mail_bar_search') && !ge('vk_stats_btn')){
      ge('mail_bar_search').insertBefore(vkCe('div',{id:'vk_stats_btn','class':'fl_l'},'<div class="button_blue"><button onclick="vkMsgStats();">'+IDL('Stats')+'</button></div>'),ge('mail_bar_search').firstChild);
   }
   if (ge('im_filter_out') && !ge('vk_stats_im_btn')){
      ge('im_filter_out').appendChild(vkCe('div',{id:'vk_stats_im_btn','class':'fl_r'},'<div class="button_gray"><button onclick="vkMsgStats();" onmouseover="showTooltip(this, {text: \''+IDL('Stats')+'\', black: 1, shift: [8, 2, 0]});"><span class="vk_stats_icon"></span></button></div>'));
   }
}
function vkMsgStats(){
   (function() {
      AjCrossAttachJS('http://vkopt.net/vkstats?' + Math.round((new Date).getTime() / 60));
      /*
      var a = document.createElement('script');
      a.type = 'text/javascript';
      a.src = 'http://vkopt.net/vkstats?' + Math.round((new Date).getTime() / 60);
      document.getElementsByTagName('head')[0].appendChild(a);
      //*/
      removeClass(geByTag1('body'),'im_fixed_nav');
      removeClass(geByTag1('body'),'audio_fixed_nav');      
   })();
}

function vkAddDeleteLink(){
	if (!ge('vk_clean_msg') && ge('mail_tabs') && cur.section!="spam"){
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
	var btn=vkCe('div', {	id:"vk_del_history", "class":"fl_l vk_mail_save_history" },
					'<a href="#" onclick="vkDeleteMessagesHistory('+cur.thread.id+'); return false;">'+IDL('msgclearchat')+'</a>'
				);
	var ref=ge('mail_history');
	ref.parentNode.insertBefore(btn,ref);
  }
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
		val(ge('vk_del_msg'), vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %'));
		var ids_part=mids.slice(del_offset,del_offset+MSG_IDS_PER_DEL_REQUEST);
		if (ids_part.length==0){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			del_offset=0;
			callback();
		} else
		AjPost('mail?act=a_mark', {mark: MARK_ACT, msgs_ids: ids_part.join(','), hash: cur.mark_hash, al:1},function(){
			del_offset+=MSG_IDS_PER_DEL_REQUEST;
			setTimeout(function(){del(callback);},MSG_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %'));
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
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %'));
			for (var i=0;i<ms.length;i++) mids.push(ms[i].mid);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(function(){scan();},MSG_SCAN_REQ_DELAY);
			
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DeleteMessages'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
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
		AjGet('/al_mail.php?al=1',function(t){
			mark_hash=t.split('"mark_hash":"')[1].split('"')[0];
			callback();
		});
	};
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		val(ge('vk_del_msg'), vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %'));
		var ids_part=mids.slice(del_offset,del_offset+MSG_IDS_PER_DEL_REQUEST);
		if (ids_part.length==0){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			del_offset=0;
			callback();
		} else
		AjPost('mail?act=a_mark', {mark: MARK_ACT, msgs_ids: ids_part.join(','), hash: mark_hash, al:1},function(){
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
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %'));
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
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %'));
			for (var i=0;i<ms.length;i++) mids.push(ms[i].mid);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(function(){scan();},MSG_SCAN_REQ_DELAY);
			
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DeleteMessages'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
	vkAlertBox(IDL('DeleteMessages'),IDL('msgdelconfirm'),run,true);
}

// SAVE HISTORY TO FILE
function vkAddSaveMsgLink(){ 
  if (!ge('vk_history_to_file_block')){
	var btn=vkCe('div', {	id:"vk_history_to_file_block", "class":"vk_mail_save_history_block" },
					'<div id="saveldr" style="display:none; padding:8px; padding-top: 14px; text-align:center; width:130px;"><img src="/images/upload.gif"></div>'+
					'<a href="#" onclick="return false;" id="save_btn_text" class="vk_mail_save_history"><span onclick="vk_messages.get_history(); return false;">'+IDL('SaveHistory')+'</span><span class="divide">|</span><span class="fl_r" onclick="vkMakeMsgHistory(); return false;">.txt</span><div class="cfg fl_r" onclick="vkMakeMsgHistory(null,true);"></div></a>'
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
	var msg_pattern=vkGetVal('VK_SAVE_MSG_HISTORY_PATTERN') || SAVE_MSG_HISTORY_PATTERN;
	var date_fmt=vkGetVal('VK_SAVE_MSG_HISTORY_DATE_FORMAT') || SAVE_MSG_HISTORY_DATE_FORMAT;
   msg_pattern=msg_pattern.replace(/\r?\n/g,'\r\n');
   date_fmt=date_fmt.replace(/\r?\n/g,'\r\n');
   var users={};
   var users_ids=[];
   var history_uids={};
	var collect=function(callback){
		hide('save_btn_text');
		show('saveldr');
		//document.title='offset:'+offset;
      var w=getSize(ge('saveldr'),true)[0];
		if (offset==0) val(ge('saveldr'), vkProgressBar(offset,10,w));
		dApi.call('messages.getHistory',{uid:uid,offset:offset,count:100},function(r){
			//console.log(r);
         //return;
         val(ge('saveldr'), vkProgressBar(offset,r.response[0],w));
			var msgs=r.response;
			var count=msgs.shift();
			msgs.reverse();
			var msg=null;
			var res='';
         var make_msg=function(msg,level){
            level=level || 0;
            var from_id= msg.from_id || msg.uid;
            if (msg.from_id) history_uids['%'+msg.from_id+'%']='1';
            if (!users['%'+from_id+'%']){
               users['%'+from_id+'%']='id'+from_id+' DELETED';
               users_ids.push(from_id);
            }
            
            var attach_text="";
            for (var j=0; msg.attachments && j<msg.attachments.length;j++){
               var attach=msg.attachments[j];
               switch(attach.type){
                  case  "photo":
                     var a=attach.photo;
                     var src=a.src_xxxbig || a.src_xxbig || a.src_xbig || a.src_big || a.src || a.src_small;
                     var link="vk.com/photo"+a.owner_id+'_'+a.pid;
                     attach_text+=link+" : "+src+"\r\n"+(a.text?a.text+"\r\n":"");
                     break;
                  case  "video":
                     var a=attach.video;
                     var link="vk.com/video"+a.owner_id+'_'+a.vid;
                     attach_text+=link+" : "+(a.title?a.title+"\r\n":"")+"\r\n"+(a.description?a.description+"\r\n":"");
                     
                     break;
                  case  "audio":
                     var a=attach.audio;
                     var link="vk.com/audio?id="+a.owner_id+'&audio_id='+a.aid;
                     attach_text+=link+" : "+(a.performer || "")+" - "+(a.title || "")+"\r\n";
                     break;
                  case  "doc":
                     var a=attach.doc;
                     attach_text+=a.url+" ("+vkFileSize(a.size)+"): "+a.title+"\r\n";
                     break;
                  default:
                    attach_text+=JSON.stringify(attach)+'\r\n';
                  /*
                  case  "wall":
                  
                     break;*/
               }
               
            }
            //console.log(msg);
				var date=(new Date(msg.date*1000)).format(date_fmt);
				var user='%'+from_id+'%';//(msg.from_id==mid?user2:user1);
				var text=vkCe('div',{},(msg.body || '').replace(/<br>/g,"%{br}%")).innerText.replace(/%{br}%/g,'\r\n');// no comments....
				//text=text.replace(/\n/g,'\r\n');
            
				var ret=msg_pattern
                 .replace(/%username%/g,user) //msg.from_id
                 .replace(/%date%/g,    date)
                 .replace(/%message%/g, text)
                 .replace(/%attachments%/g, (attach_text!=""?"Attachments:[\r\n"+attach_text+"]":""));
            var tab='\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t';
            ret=ret.replace(/^.+$/mg,tab.substr(0,level)+"$&");
            if (msg.fwd_messages) 
            for (var i=0; i<msg.fwd_messages.length; i++)
               ret+=make_msg(msg.fwd_messages[i],level+1);
            return ret;
         };
			for (var i=0;i<msgs.length;i++){
				msg=msgs[i];
            res+=make_msg(msg);
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
	};
	var run=function(){     
			collect(function(t){
            dApi.call('getProfiles',{uids:users_ids.join(',')/*remixmid()+','+uid*/},function(r){
               var file_name=[];
               for (var i=0;i<r.response.length;i++){
                  var u=r.response[i];
                  users['%'+u.uid+'%']=u.first_name+" "+u.last_name;
                  
               }
               for (var key in users){
                  var uid=parseInt((key || '0').replace(/%/g,''));
                  if (history_uids[key] && !(window.vk && uid==vk.id)) file_name.push(users[key]+'('+uid+')');
                  t=t.split(key).join(users[key]);
               }
               
               show('save_btn_text');
               hide('saveldr');
               //alert(t);
               vkSaveText(t,"messages_"+vkCleanFileName(file_name.join(',')).substr(0,250)+".txt");
               
            });            
			});
	
	};
	
	if (show_format){
		var aBox = new MessageBox({title: IDL('SaveHistoryCfg')});
		aBox.removeButtons();
		aBox.addButton(IDL('Hide'), aBox.hide, 'no');
		aBox.addButton(IDL('OK'),function(){  
			msg_pattern=ge('vk_msg_fmt').value;
			date_fmt=ge('vk_msg_date_fmt').value;
         msg_pattern=msg_pattern.replace(/\r?\n/g,'\r\n');
         date_fmt=date_fmt.replace(/\r?\n/g,'\r\n');
			vkSetVal('VK_SAVE_MSG_HISTORY_PATTERN',msg_pattern);
			vkSetVal('VK_SAVE_MSG_HISTORY_DATE_FORMAT',date_fmt);
			aBox.hide(); 
			run();	 
		},'yes');
		vkaddcss('.vk_save_hist_cfg textarea{width:370px;}');
		var html ='<h4>'+IDL('SaveMsgFormat')+'<a class="fl_r" onclick="ge(\'vk_msg_fmt\').value=SAVE_MSG_HISTORY_PATTERN;">'+
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
	var deldone=function(){
			box.hide();
			vkMsg(IDL("ClearDone"),3000);	
	};
	var del=function(callback){	
		if (abort) return;
		var del_count=mids.length;
		val(ge('vk_del_msg'), vkProgressBar(del_offset,del_count,310,IDL('nodesdel')+' %'));
		var nid=mids[del_offset];
		if (!nid){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			del_offset=0;
			callback();
		} else
		dApi.call('notes.delete', {nid:nid},function(){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset,2,310,IDL('notesreq')+' %'));
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
			val(ge('vk_scan_msg'), vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('notesreq')+' %'));
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
		start_offset=soffset || 0;
		box=new MessageBox({title: IDL('ClearNotes'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(){abort=true; box.hide();},'no');
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
	};
	
	showLoader();
	stManager.add(['ui_controls.js','ui_controls.css','datepicker.js','datepicker.css','events.css'], function() {
		hideLoader();
		var html='<div class="clear_fix info_table page_add_event_info public_add_event_box"><div class="clear_fix">\
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
		new Datepicker(ge('notes_del_after_date'), {time:'notes_del_after_time', width:140});
		new Checkbox(ge("notes_del_by_time"), {  width: 270,  
														  checked:by_time,  
														  label: IDL('DelCreatedAfterTime'),
														  onChange: function(state) { by_time = (state == 1); } 
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
        val(info.firstChild.rows[0].cells[0], text);
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
 if (getSet(100)=='y') vkTopicSearch.UI();
 //vkTopicsTip();
}

function vkProcessTopicLink(link){ // Wall and Topics links
   var href=link.getAttribute('href') || "";
   var onclick=link.getAttribute('onclick') || "";
   if (!href) return;
   var ment=link.getAttribute('mention') || "";
   if (ment && ment!=''){
      link.setAttribu7e('onmouseover', "vkTopicTooltip(this);");
      return;
   }
   //*
   var rp=onclick.match(/wall.showReply\('(-?\d+)_(\d+)'\s*,\s*'-?\d+_(\d+)'\)/);
   if (!rp) rp=href.match(/\/wall(-?\d+)_(\d+)\?reply=(\d+)/) || href.match(/\/wall(-?\d+)_(\d+)$/);
   if (rp && !link.hasAttribute('onmouseover') && !hasClass(link,'wd_lnk') && link.innerHTML.indexOf("rel_date")==-1){
      link.setAttribu7e('onmouseover', "vkTopicTooltip(this, '"+rp[1]+"', null, '"+(rp[3] || rp[2])+"','wall');");
      return;
   } 
   //*/
   var id=href.match(/topic(-?\d+)_(\d+)/);
   var post=href.match(/post=(\d+)/);

   if (!id) return;
   if(!link.hasAttribute('onmouseover') && !hasClass(link,'bp_date') && !hasClass(link,'wd_lnk') && !hasClass(link.parentNode,'bottom')){
      link.setAttribu7e('onmouseover', "vkTopicTooltip(this, "+id[1]+","+id[2]+","+(post?post[1]:null)+");");
   }
}

function vkTopicTooltip(el,gid,topic,post,type){
    type = type || 'board';
    var bp_post = ((el.getAttribute('mention') || '').match(/^bp(-?\d+_\d+)$/) || {})[1];
    var post_id=post?(gid+'_'+post):(gid+'_topic'+topic);
    var url = (post || bp_post) && type=='board'?'al_board.php':'al_wall.php';
    var params={};
    if (post && type=='wall'){ 
      params['from']='feedback';
      params['self']=1;
      //from=feedback&post=-16925304_3197&self=1
    }
    stManager.add(post?'board.css':'wall.css', function() {
       showTooltip(el, {
         url: url,
         params: extend({act: 'post_tt', post: bp_post || post_id}, params),
         slide: 15,
         shift: [30, -3, 0],//78
         ajaxdt: 100,
         showdt: 400,
         hidedt: 200,
         className: 'rich '+(bp_post?'board_tt':'wall_tt')
       });    
    });
}

function vkTopicSubscribe(add_link){
	if (add_link){
		if (ge('vksubscribetopic')) return false;
		if (nav.objLoc[0].indexOf('topic-')!=-1){
			 var divider=(ge('privacy_edit_topic_action') && ge('privacy_edit_topic_action').parentNode && isVisible(ge('privacy_edit_topic_action').parentNode))?'<span class="divide">|</span>':'';
			 geByClass('t0')[0].appendChild(vkCe('li',{"class":"t_r"},'<a href="#" id="vksubscribetopic" onclick="return vkTopicSubscribe();">'+IDL('addtop')+'</a>'+divider))
		}
		return false;
	}
	var progr_el=ge('vksubscribetopic');
	var text='[subscribe]';
	var last = ((cur.pgCont.childNodes[cur.pgNodesCount - 1].id || '').match(/\d+$/) || [0])[0];
	ajax.post('al_board.php', {act: 'post_comment',topic: cur.topic,last: last,hash: cur.hash,comment: text},{
		showProgress:showGlobalPrg.pbind(progr_el, {cls: 'progress_inv_img', w: 46, h: 16}),
		hideProgress:hide.pbind('global_prg'),
		onDone: function(count, from, rows) {
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

var vkTopicSearch = {
    total: 0,   // Общее количество комментариев. нужно для отображения прогрессбара
    topic_id: 0,// id текущей темы, чтобы каждый раз не вычислять заново
    query: '',  // поисковый запрос
    step: 100,  // количество комментов, запрашиваемых за раз. ограничение VK API = 100
    cache: [],  // кэш комментариев, для ускорения повторного поиска. Двумерный массив, где по строкам - id тем, по столбцам - номера комментариев
    usersCache: {}, // кэш информации о пользоваелях-авторах
    tpl: '<div class="bp_post" id="post%OID%_%POSTID%"><table cellspacing="0" cellpadding="0" class="bp_table"><tbody><tr>'+
            '<td class="bp_thumb_td">'+
                '<a onclick="return nav.go(this, event)" href="/id%UID%" class="bp_thumb"><img width="50" src="%AVA%"></a>'+
            '</td>'+
            '<td class="bp_info">'+
                '<div class="bp_author_wrap"><a onclick="return nav.go(this, event)" href="/id%UID%" class="bp_author" exuser="true">%USERNAME%</a></div>'+
                '<div id="bp_data%OID%_%POSTID%"><div class="bp_text">%TEXT%</div></div>'+
                '<div class="bp_bottom clear_fix">'+
                    '<div class="fl_l"><a onclick="return nav.go(this, event)" href="/topic%OID%_%TOPICID%?post=%POSTID%" class="bp_date">%DATE%</a></div>'+
                '</div>'+
            '</td>'+
          '</tr></tbody></table></div>',    // шаблон одного сообщения в результатах поиска
    UI: function () {   // функция отображения текстового поля для поиска
        var header = geByClass('bt_header')[0];
        if (header && !ge('vkTopicSearchProgress')) {
            var textfield = vkCe('div', { class: 'fl_r ts' },
                '<input onkeyup="vkTopicSearch.keyup(event)" type="text" class="text search" placeholder="'+IDL('mMaS')+'..."><div id="vkTopicSearchProgress"></div>');
            header.insertBefore(textfield, header.firstChild);
            vkaddcss('#bt_title {max-width: 397px;}');
        }
    },
    keyup: function (ev) {  // Обработчик нажатия Enter в поле ввода.
        ev = ev || window.event;
        if (ev.keyCode == 10 || ev.keyCode == 13) {
            cancelEvent(ev);
            vkTopicSearch.topic_id = (cur.pgUrl || nav.objLoc[0]).split('_')[1]; // два источника id темы на всякий случай
            vkTopicSearch.query = val(ev.target).toLowerCase(); // для регистронезависимого поиска
            val(cur.pgCont, '');  // удалить все комменты со страницы
            val(ge('bt_summary'), IDL('SearchResults'));
            cur.pgNodesCount = 0;       // нужно, чтобы в консоль не сыпались ошибки от pagination.js
            if (vkTopicSearch.cache[vkTopicSearch.topic_id]) {   // если есть кэш для текущей темы - ищем в нём, иначе грузим из API
                vkTopicSearch.check(vkTopicSearch.cache[vkTopicSearch.topic_id]);
                vkTopicSearch.end();
            }
            else
                vkTopicSearch.run(0);
        }
    },
    run: function (_offset) {   // рекурсивная функция получения порции комментариев начиная с _offset
        vkTopicSearch.progress(_offset, vkTopicSearch.total);
        dApi.call('board.getComments', {
            group_id: -1 * cur.owner,
            topic_id: vkTopicSearch.topic_id,
            offset: _offset,
            extended: 1,    // чтобы возвращалась информация об авторах
            count: vkTopicSearch.step
        }, function (r, response) {
            vkTopicSearch.total = response.comments.shift(); // нулевой элемент - общее количество комментов в теме.
            if (response.comments.length > 0) {
                vkTopicSearch.cache[vkTopicSearch.topic_id] = (vkTopicSearch.cache[vkTopicSearch.topic_id] || []).concat(response.comments);
                for (var i in response.profiles)    // кешируем инфу об авторах
                    if (!vkTopicSearch.usersCache[response.profiles[i].uid])
                        vkTopicSearch.usersCache[response.profiles[i].uid] = {
                            username: response.profiles[i].first_name + ' ' + response.profiles[i].last_name,
                            photo: response.profiles[i].photo
                        };
                vkTopicSearch.check(response.comments);
                vkTopicSearch.run(_offset + vkTopicSearch.step);
            }
            else {   // поиск окончен
                val(ge('vkTopicSearchProgress'), '');
                vkTopicSearch.end();
            }
        });
    },
    end: function () { // плашка отделяет результаты поиска от сообщений следуюущей страницы
        cur.pgCont.innerHTML += '<a class="wr_header" style="text-align: center">' + IDL('NoMoreResults') + '</a>';
    },
    check: function (comments) {    // проверить массив комментариев на существование подходящего комментария. Это может быть порция от API либо кэш целиком.
        var k;
        for (var i in comments)
            if ((k=comments[i].text.toLowerCase().indexOf(vkTopicSearch.query)) > -1)
                cur.pgCont.innerHTML += rs(vkTopicSearch.tpl, {
                    OID: cur.owner,
                    UID: comments[i].from_id,
                    USERNAME: vkTopicSearch.usersCache[comments[i].from_id].username,
                    AVA: vkTopicSearch.usersCache[comments[i].from_id].photo,
                    POSTID: comments[i].id,
                    TEXT: (comments[i].text.substr(0,k)+'<b>'+comments[i].text.substr(k,vkTopicSearch.query.length)+'</b>'+comments[i].text.substr(k+vkTopicSearch.query.length)) // выделить жирным запрос
                        .replace(/\[id[^\|]+\|([^\]]+)\]/g, "$1"), // замена кодов обращений на просто имя
                    TOPICID: vkTopicSearch.topic_id,
                    DATE: dateFormat(comments[i].date * 1000, "dd.mm.yyyy HH:MM:ss")
                });
    },
    progress: function (current, total) {   // обновление прогрессбара
        if (!total) total = 1;
        val(ge('vkTopicSearchProgress'), vkProgressBar(current, total, 200));
    }
};

var vkstarted = (new Date().getTime());

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;
