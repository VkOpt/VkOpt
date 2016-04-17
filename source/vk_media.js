// ==UserScript==
// @description   Vkontakte Optimizer module
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//

vk_dld={
   
};

/* PHOTOS */
vk_phviewer={
   inj:function(){
      //Inj.End('photoview.receiveComms','vkProcessNode(comms);');
      Inj.Before('photoview.doShow','cur.pvNarrow','vk_phviewer.proc1(ph);');
      Inj.Before('photoview.doShow','var likeop','vkProcessNode(cur.pvNarrow);');
      Inj.End('photoview.doShow','vkProcessNode(cur.pvWide);');
      Inj.Before('photoview.doShow','if (ph.actions.spam)','actionsHTML += vkPVLinks(ph) + vk_plugins.photoview_actions(ph);');
      if (getSet(7)=='y') Inj.Start('photoview.afterShow','vkPVMouseScroll();');

      vkPVNoCheckHeight=function(){return !window.PVShowFullHeight};

      if (PHOTO_FEATURE) {
         Inj.Before('photoview.onResize', 'cur.pvCurrent.height * c >', 'vkPVNoCheckHeight() && ');
         Inj.Before('photoview.doShow', 'h * c > ', 'vkPVNoCheckHeight() && ');
         Inj.End('photoview.afterShow', 'vkPVAfterShow();');
      }
      // предотвращаем при использовании временного вьювера изменение URL страницы
      Inj.Start('Photoview.updateLoc',"if (/^vkph_/.test((cur.pvCurPhoto && cur.pvCurPhoto.id) || '')) return; if (ge('pv_album_name')) vkPVPhotoMover();");
      
      if (browser.opera && intval(browser.version)==12) Inj.Start('photoview.canFullscreen','return true;');
      if (getSet(71)=='y') 
      Inj.Before('Photoview.commentTo','if (!v', 'vk_phviewer.reply_to(comm, toId, event, rf,v,replyName); if(false)' );


      if (/photo-?\d+_\d+/.test(nav.strLoc)) {
      	setTimeout(function () {
      		if (!isVisible(cur.pvAlbumsWrap) && !isVisible(cur.pvAlbumWrap))
      			photoview.doShow();
      	}, 70);
      }

   },
   proc1:function(ph){
      if (ph.comments)
         ph.comments=vkModAsNode(ph.comments,vkProcessNode);
      if (cur.pvCommsLikes && cur.pvCommsLikes[ph.id] && cur.pvCommsLikes[ph.id][0] && !cur.pvCommsLikes[ph.id][0].tagName)
         cur.pvCommsLikes[ph.id][0]=vkModAsNode(cur.pvCommsLikes[ph.id][0],vkProcessNode);
      if(ph.tagshtml) 
         ph.tagshtml=vkModAsNode(ph.tagshtml,vkProcessNode);
   },
   reply_to:function(post, toId, event, rf,v,replyName){
         if (vk_DEBUG) console.log(post);
         if (!toId){
            if (vk_DEBUG) console.log(post, 'VkOpt: Reply canceled. toId=null!');
            return;
         }
         var name=(replyName[1] || '').split(',')[0];
         if ((v||'').indexOf('id'+toId)==-1 && !checkEvent(event)){
            var new_val=(v?v+'\r\n':'');
            new_val+='['+(parseInt(toId)<0?'club':'id')+Math.abs(toId)+'|'+name+'], ';
               
            val(rf, new_val);
            if (rf.autosize) 
               rf.autosize.update();
         }
   },
   view:function(photos_src){
      var preload_lang=function(callback){
         ajax.post('al_photos.php', {act: 'show', list: 'album'+vk.id+'_0', offset: 0, direction: 0}, {
            onDone:function(listId, count, offset, data, opts){
               if (!opts) callback();
               
               //кэшируем себе нужную строку.
               if (opts.lang && opts.lang.photos_photo_num_of_N) 
                  vk_lang.photos_photo_num_of_N = opts.lang.photos_photo_num_of_N
               // просто так добавляем весь присланный ленг в обычное место
               extend(cur, {
                 lang: extend(cur.lang || {}, opts.lang)
               });
               callback();
            }
         });
      };
      var view = function(){
         stManager.add(['photoview.css', 'photoview.js'], function () {
            var listId = 'vktemp';
            cur.pvNoHistory = true;
            cur.pvHistoryLength = 0;
            cur.pvListId = listId;
            cur.pvData = cur.pvData || {};
            cur.pvCommsLikes =  cur.pvCommsLikes || {}
            var list = [];
            cur.pvData[listId]=list;      
            for (var i=0; i<photos_src.length; i++){
               var pid='vkph_'+i;
               if  (cur.pvCommsLikes)
                  cur.pvCommsLikes[pid]=[0,0];
               list.push({
                  id:pid,
                  x_src: photos_src[i],
                  actions:{}
               })
            }
            Photoview.show(listId, 0, false, false);
         })
      }
      
      // запихиваем закэшированный ленг в cur, если есть:
      if (vk_lang.photos_photo_num_of_N) {
         extend(cur, {
            lang: extend(cur.lang || {}, {photos_photo_num_of_N:vk_lang.photos_photo_num_of_N })
         });
         view();
      }
      if (cur.lang && cur.lang.photos_photo_num_of_N)
         view();
      else
         preload_lang(view) 
   }
};
function vkPVAfterShow(){
	vkPVChangeView=function(){
		window.PVShowFullHeight=!window.PVShowFullHeight;
      Photoview.doShow();
	};
	if (ge('pv_summary')) ge('pv_summary').setAttribu7e('onclick','vkPVChangeView()');
}
/*
var orig_cur_chooseMedia=cur.chooseMedia;
cur.chooseMedia=function(type, media, data, url, noboxhide){
   return orig_cur_chooseMedia(type, media, data, url, true);
}
*/


/* ALBUMS IDS
-5 app
-6 avas
-7 user wall
-8 from share on wall
-12 board
-14 wall
-24 graff
-15 saved
*/
var _vk_albums_list_cache={};
var vk_photos = {
   css:'\
      #vk_ph_save_move{width:160px}\
      #vkmakecover{margin-top:6px; width:169px;}\
      .photos_choose_header a, .photos_choose_header span{color:#FFF;}\
      .photos_choose_row.c_album{position:relative; cursor:pointer; height: 100px; width: 175px;}\
      .c_album .photo_row_img{ max-width: 175px;}\
      .c_title{background:rgba(0,0,0,0.5); position:absolute; bottom:0px; left:0px; right:0px; color:#FFF; text-align: left; padding:2px 0px 2px 6px;}\
      .vk_full_thumbs_photos #photos_container .photo_row a,\
      .vk_full_thumbs_photos #photos_container .photo_row,\
      .vk_full_thumbs_photos .pva_photo_link,\
      .vk_full_thumbs_photos .pva_photo{height: auto !important;}\
      .vk_full_thumbs_photos #photos_container .photo_row_up a {position: inherit !important;}\
      .vk_full_thumbs_photos #photos_container .photo_row_up a.bg {display: none !important;}\
      #vk_ph_upd_btn{opacity:0.1}\
      #vk_ph_upd_btn:hover{opacity:1}\
      .vk_albums_list a{display:block; padding-left:10px; padding-bottom:3px; border-bottom:1px solid rgba(100,100,100,0.1)}\
      .photos_tabs ul.t0 #photo_add_tab .tab_word {max-width: 39px;}\
      .vk_ph_info{position:absolute; min-height:13px; /*background:rgba(0,0,0,0.8);*/ width: inherit; text-align: center; padding: 3px 0 0 0; color:#FFF; border-radius: 0 0 3px 0;}\
      .vk_ph_info .info_wrap{background: rgba(0, 0, 0, 0.8); border-radius: 0px 0px 3px 3px; box-shadow: 0px 0px 2px #FFFFFF; padding: 3px;}\
      .vk_ph_info .vk_like_icon_white{opacity:0.5;}\
      .vk_ph_info.my_like .vk_like_icon_white, .vk_ph_info .vk_like_icon_white.my_like{opacity:1;}\
      .vk_ph_info .vk_comm_icon_white{opacity:0.5;}\
	  #pv_hd_links{margin-top:10px;}\
	  .vkPVPhotoMoverOpen #pv_author_info{width:169px;margin-left:0}\
	  .vkPVPhotoMoverOpen #pv_author_img{display:none;}\
   ',
   inj_photos:function(){
      if (getSet(93)=='y') Inj.Before('photos.loaded','while','vk_photos.album_process_node(d);');
   },
   page:function(){
      vk_photos.album_process_node();
      vk_photos.toggle_thumb_size(true);
      if (nav.objLoc[0].indexOf('albums')!=-1){
         vkAddAlbumCommentsLinks();
         if (cur.oid<0){
            vkPhotosWallAlbum();
            vk_ph_comms.browse_comments_btn(); // Устарело. Вк активировали родной раздел обзора комментов к фото группы.
         }
          if (!ge('vk_albums_actions')) {
              // Создание меню "Действия" для страницы "альбомы"
              var li = vkCe('li', {id: 'vk_albums_actions', "class": 't_r'},
                  '<a href="#" onclick="return false;"  id="vk_albums_act_menu" class_="fl_r summary_right">' + IDL('Actions') + '</a>' +
                      (geByClass('summary_right')[0] ? '<span class="divide">|</span>' : ''));
              geByClass('t0')[0].appendChild(li);

              var p_options = [];

              p_options.push({l: IDL('Links'), onClick: function () {
                  vk_photos.albums_links(cur.oid);  // Функция получения ссылок на все фотографии с группировкой по альбомам. (в виде скрипта)
              }});
              stManager.add(['ui_controls.js', 'ui_controls.css'], function () {
                  cur.vkAlbumsMenu = new DropdownMenu(p_options, {
                      target: ge('vk_albums_act_menu'),
                      containerClass: 'dd_menu_posts',
                      updateTarget: false,
                      offsetLeft: -15,
                      showHover: false
                  });
              });
          }
      } else if (nav.objLoc[0].indexOf('album')!=-1 || nav.objLoc[0].indexOf('tag')!=-1 || nav.objLoc[0].indexOf('photos')!=-1){
         
         var m=nav.objLoc[0].match(/album(-?\d+)_(\d+)/);
         var oid=null;
         var aid=null; 
         if(m){	
            oid=m[1];
            aid=m[2];
         } else {
            m=nav.objLoc[0].match(/(tag|photos)(-?\d+)/);
            if (m){
              oid=m[2];
              aid=m[1];
            }      
         }
         if(m){	
            /*oid=m[1];
            aid=m[2];*/
            if (!ge('vk_album_actions')){			
               
               var li=vkCe('li',{id:'vk_album_actions',"class":'t_r'},'\
                  <a href="#" onclick="return false;"  id="vk_album_act_menu" class_="fl_r summary_right">'+IDL('Actions')+'</a>\
                  '+(geByClass('t_r')[0]?'<span class="divide">|</span>':'')+'\
               ');
               geByClass('t0')[0].appendChild(li);
               
               var p_options = [];
               //if (!vkbrowser.chrome && !vkbrowser.safari)
                  p_options.push({l:IDL('SaveAlbumAsHtml'), onClick:function() {
                     vkGetPageWithPhotos(oid,aid);
                  }});
               p_options.push({l:IDL('Links'), onClick:function() {
                     vkGetLinksToPhotos(oid,aid);
               }});
               try {
                   var isFileSaverSupported = !!new Blob;   // проверка возможности браузера сохранять файлы
               } catch (e) {}
               if (isFileSaverSupported)    // если возможность есть, выводим ссылку на функцию сохранения альбома в ZIP
                   p_options.push({l:IDL('SaveAlbumAsZip'), onClick:function(item) {
                         vkGetZipWithPhotos(oid,aid);
                   }});
               if (cur.statsPhotoAddHash)
                  p_options.push({l:IDL('Add'), h:'/album'+oid+'_'+aid+'?act=add' /*onClick:function(item) { vkGetLinksToPhotos(oid,aid);}*/
                  });
               
               p_options.push({
                  l:IDL('FullThumb'),
                  onClick:function() { 
                     vk_photos.toggle_thumb_size();
                  } 
               });
               
               if (aid=='photos')
                  p_options.push({
                     l:IDL('mPhC'),
                     onClick:function() { 
                        cur.oid=oid;
                        vk_ph_comms.init();
                     } 
                  });               
                  
                  
                  
               p_options=p_options.concat(vk_plugins.album_actions(oid,aid));
               stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
                  cur.vkAlbumMenu = new DropdownMenu(p_options, {
                    target: ge('vk_album_act_menu'),
                    containerClass: 'dd_menu_posts',
                    updateTarget:false,
                    offsetLeft:-15,
                    showHover:false
                  });
               });			
            }								
         }
      }
   },
   //vk_photos.inj_photos()
   //vk_photos.page();
   //vk_photos.album_process_node()
   album_process_node:function(node){
      // cur.module=='photos'
      if (!window.cur || cur.module!='photos' || getSet(93)!='y') return;
      var nodes=geByClass('photo_row',node);
      var pids=[];
      for (var i=0; i<nodes.length; i++){
         var el=nodes[i];
         var pid=((el.getAttribute('id') || '').match(/photo_row(-?\d+_\d+)/) || [])[1];
         if (!pid) continue;
         var info=geByTag1('a',el);
         var ex=geByClass('vk_ph_info',el)[0];
         if (!info || ex) continue;
         info.insertBefore(se('<div class="vk_ph_info" id="vk_exinfo_'+pid+'"><div style="padding-top:3px"><!--'+vkLdrMiniImg+'--></div></div>'),info.firstChild);
         pids.push(pid);
      }
      vk_photos.load_ph_info(pids);
   },
   load_ph_info:function(pids,cnt){
      if (!pids || pids.length==0) return;
      if (!ge('vk_exinfo_'+pids[0])){ // Костыль если на странице ещё не появились фотки
         if (cnt && cnt>30) return;
         setTimeout(function(){vk_photos.load_ph_info(pids,(cnt||0)+1)},100);
         return;
      }
      var p={};
      for (var i=0; i<pids.length; i++)
         p[''+pids[i]]=1;
      
      dApi.call('photos.getById',{photos:pids.join(','),extended:1},{
         ok:function(r){
            var data=r.response;
            for (var i=0; i<data.length;i++){
               var p=data[i];
               var pid=p.owner_id+'_'+p.pid;
               var el=ge('vk_exinfo_'+pid);
               if (!el) continue;
               //   onclick="vk_skinman.like(\''+pid+'\'); event.cancelBubble = true;" onmouseout="vk_skinman.like_out(\''+pid+'\')"
               val(el, '<span class="info_wrap">\
                               <span class="vk_ph_likes_count" onmouseover="vk_photos.like_over(\''+pid+'\')">\
                                 <i class="vk_like_icon_white'+(p.likes.user_likes?' my_like':'')+'" id="s_like_icon'+pid+'"></i>\
                                 <span id="s_like_count'+pid+'">'+p.likes.count+'</span>\
                               </span>'+
                               '<span class="divide"></span>'+
                               '<span class="vk_ph_comm_count"><div class="vk_comm_icon_white"></div> '+p.comments.count+'</span>'+
                            '</span>');//vk_photos.parse_info(p);//JSON.stringify(p);
            }
            for (var key in p)
               if (p[key] && ge('vk_exinfo_'+key)) 
                  val(ge('vk_exinfo_'+key), '');
            
         },
         error:function(){}
      });
      //ge('vk_exinfo_'+uid)
   },
   like_over:function(pid){
      var icon=ge('s_like_icon'+pid);
      showTooltip(icon.parentNode, {
         url: 'like.php',
         params: {
            act: 'a_get_stats',
            object: 'photo' + pid
         },
         slide: 15,
         shift: [65, 10, 10],
         ajaxdt: 100,
         showdt: 400,
         hidedt: 200,
         className: 'rich like_tt'
      });
   },
   
   choose_album:function(oid){
      stManager.add('photoview.css');
      var params={need_covers:1};
      if (oid){
         params[oid<0?'gid':'uid']=Math.abs(oid);
      }
      hide('photos_choose_album_rows');
      hide('photos_choose_more_albums');
      
      var on_done=function(r){
         var albums=(r.error && r.error.error_code==15)?[]:r.response;
         //console.log(r,albums);
         if (r.error) dApi.show_error(r);
         if (albums[0]) oid=albums[0].owner_id;
         else oid=oid || vk.id;
         var sys=[{
            aid:"wall",
            thumb_src:'/images/m_noalbum.png',
            owner_id:oid,
            title:IDL('photos_on_wall'),
            size:'-',
            description:"", created:"0", updated:"0"
         }];
         if (oid>0) 
            sys.push({
               aid:"saved",
               thumb_src:'/images/m_noalbum.png',
               owner_id:oid,
               title:IDL('Saved_photos'),
               size:'-',
               description:"", created:"0", updated:"0"
            });
         albums=sys.concat(albums);

         var html='';
         for (var i=0; i<albums.length; i++){
            var a=albums[i];
            html+='\
                  <div class="photos_choose_row fl_l c_album" onclick="return vk_photos.choose_album_item('+a.owner_id+',\''+a.aid+'\');">\
                    <a href="#" onclick="return false"><img class="photo_row_img" src="'+a.thumb_src+'"></a>\
                    <div class="c_title">\
                      '+a.title+'<div class="pva_camera fl_r">'+a.size+'</div>\
                    </div>\
                  </div>';
            /*
            a.aid
            a.owner_id
            a.thumb_src
            a.title
             
            '<div class="pva_camera fl_r">'+a.size+'</div>'*/
         }
         html+='<br id="photos_choose_clear" class="clear">';
         val(ge('photos_choose_rows'), html);
         //console.log(r)
      };
      dApi.call('photos.getAlbums',params,{ok:on_done,error:on_done});
      
      //*
      val(ge('photos_choose_rows'), vkBigLdrImg);//albums;
      hide('photos_choose_more');
      //*/
      return false;
   },
   choose_album_item:function(oid,aid){
      var PER_PAGE=20;
      //vkMakePageList(0,100,'#','return page(%%);',PER_PAGE,true)
      val(ge('photos_choose_rows'), vkBigLdrImg);
      var params={aid:aid};
      params[oid<0?'gid':'uid']=Math.abs(oid);
     
     var photos=null;
     var photos_reverse=null;
     var cur_photos=null;
      
      dApi.call('photos.get',params,function(r){
         photos=r.response;
         photos_reverse=[];
         for (var i=photos.length-1; i>=0; i--)
            photos_reverse.push(photos[i]);
         
         cur_photos=photos;
         page(0);
         //console.log(r)
         
      });
      // 
      /*
         if(aid=='wall') aid='00'
         if (count==null){
         
         ajax.post('/album'+oid+'_'+aid, {offset: 0}, {
            onDone: function(b,html,script,vk) {
               var temp=script.match(/count:\s*(\d+)/);
               if (temp) count=parseInt(temp[1]);
            }
         });           
         
         }
      
         var opts={};
         if (rev) opts['rev']=1;
         ajax.post('/album'+oid+'_'+aid, extend({offset: offset, part: 1}, opts || {}), {
            cache: 1, 
            onDone: function() {
            
            }
         });      
      */

      var page=function(offset,rev){
         if (rev){
            cur_photos=(cur_photos==photos)?photos_reverse:photos;
         }
         var pages=Math.floor(cur_photos.length/PER_PAGE);
         var html='';
         var pages_html='<div class="clear clear_fix ">\
            <a class="fl_l sort_rev_icon" href="#" onclick="return vk_photos._choose_album_item_page(0,true);"></a>\
            <ul class="page_list fl_r">'+vkMakePageList(offset/PER_PAGE,pages,'#','return vk_photos._choose_album_item_page(%%);',1,true)+'</ul>\
         </div>';
         html+=pages_html;
         
         var max_offset=Math.min(offset+PER_PAGE,cur_photos.length);
         for (var i=offset; i<max_offset; i++){
            var ph=cur_photos[i];
            html+='\
                  <div class="photos_choose_row fl_l">\
                    <a href="photo'+ph.owner_id+'_'+ph.pid+'" onclick="return vk_ch_media.photo(\''+ph.owner_id+'_'+ph.pid+'\',\''+(ph.src_big || ph.src)+'\','+(ph.width || 0)+','+(ph.height || 0)+');">\
                      <img class="photo_row_img" src="'+ph.src+'">\
                    </a>\
                  </div>';
            /*
            html+='\
                  <div class="photos_choose_row fl_l">\
                    <a href="photo'+ph.owner_id+'_'+ph.pid+'" onclick="return cur.chooseMedia(\'photo\', \''+ph.owner_id+'_'+ph.pid+'\', [\''+ph.src+'\', \''+ph.src_small+'\', \'\',  \'{temp: {}, big: 1}\']);">\
                      <img class="photo_row_img" src="'+ph.src+'">\
                    </a>\
                  </div>';*/
         }
         html+=pages_html;
         html+='<br id="photos_choose_clear" class="clear">';
         val(ge('photos_choose_rows'), html);
         return false;
      };
      vk_photos._choose_album_item_page=function(_offset,rev){
         return page(_offset*PER_PAGE,rev);
      };
      return false;
   },
   url:function(url){
      if (!url) url=prompt('Image URL');
      
      if (url && /(vk\.com|vk\.me|userapi\.com)\//.test(url)){
         vkPhotoUrlUpload(url);
         return;
      }
      url=encodeURI(url);
      
      
      AjGet('/wall'+vk.id+'?offset=100000000',function(t){
         var o=(t.match(/"share":(\{[^}]+\})/)||[])[1];
         if (!o) {alert('hash error'); return;}
         o=JSON.parse(o);
         //alert(o.timehash);
         re(ge('vk_url_upldr_form'));
         var checkURLForm = ce('div', {url:'vk_url_upldr_form', innerHTML: '<iframe name="vk_url_upldr_form_iframe"></iframe>'});
         utilsNode.appendChild(checkURLForm);
         var parseForm = checkURLForm.appendChild(ce('form', {
           action: 'share.php?act=url_attachment',
           method: 'post',
           target: 'vk_url_upldr_form_iframe'
         }));
         
         each({hash: o.timehash || '', index: 1, url: url}, function(i, v) {
           parseForm.appendChild(ce('input', {type: 'hidden', name: i, value: v}));
         });
         
         window.onUploadDone = function(data){
            if (data[0]=='photo')
               showPhoto(data[1],data[2].list,{});
            else 
            if (data[0]=='doc'){
               var opts=data[2];
               var hash=opts.href.match(/hash=([a-f0-9]+)/);
               hash = hash?hash[1]:null;
               if (!hash){
                  alert('Hash error\r\nResponse data:\r\n'+JSON.stringify(data));
                  return;
               }
               var title=(opts.lang || {}).profile_choose_doc || 'Save uploaded document';
               var html='<a href="'+opts.href+'" target="_blank">'+opts.href+'</a><br>'+opts.title+'<br>'+(opts.thumb?'<img src="'+opts.thumb+'">':'');
               /*
                  ["doc", "16000020_171916744",
                  {
                     "lang": {
                        "profile_choose_doc": "Document"
                     },
                     "title": "<span class=\"fl_l\">file.gif</span>&nbsp;<span class=\"fl_r\">3Mb</span>",
                     "ext": "gif",
                     "size": "2954778",
                     "href": "/doc16000020_171916744?hash=abd5ca1bb1092cfa50&dl=91ec5a87ebf7bc21ee",
                     "thumb": "http://cs521201.vk.me/u16000020/-3/m_1205c06403.jpg",
                     "thumb_s": "http://cs521201.vk.me/u16000020/-3/s_1205c06403.jpg"
                  }]
               */               
               var aBox = new MessageBox({title: title});
               aBox.removeButtons();
               aBox.addButton(getLang('box_cancel'),aBox.hide,'no');
               aBox.addButton(getLang('box_save'),function(){  
                  aBox.hide();
                  ajax.post('docs.php', {act: 'a_add', doc: data[1], hash: hash}, {
                     onDone: function(text) {
                        showDoneBox(text);
                     }
                  });
               }, 'yes');
               aBox.content(html);
               aBox.show();
            } else {
               alert(JSON.stringify(data));
            }
            if (vk_DEBUG) console.log(data);
         };
         window.onUploadFail = function(){alert('Upload Fail')};

         parseForm.submit();
      })
   },
   toggle_thumb_size:function(apply){
      var p=geByTag('body')[0];
      if (apply){
         if (getSet(82)=='y') addClass(p,'vk_full_thumbs_photos');
         return false;
      }
      setCfg(82,hasClass(p,'vk_full_thumbs_photos')?'n':'y');
      toggleClass(p,'vk_full_thumbs_photos');
      return false;
   },
   process_node:function(node){
      //vk_photos.toggle_thumb_size();
      var p=geByClass('pvsa_summary_author',node)[0] || geByClass('photos_period',node)[0]; 
      if (!p){
         p=geByClass('photos_summary',node)[0] || geByClass('pva_summary',node)[0];
         if (p) p=geByClass('summary',p)[0];
      }
      
      if (p && p.innerHTML.indexOf('toggle_thumb_size')==-1) p.innerHTML+='<a href="#" class="fl_r" onclick="return vk_photos.toggle_thumb_size();">'+IDL('FullThumb')+'</a>';
   },
   update_photo:function(photo_id){
      var box=vkAlertBox(IDL('Upload'),'<center><div id="vk_upd_photo"></div><div id="vk_upd_photo_progress"></div></center>');
      stManager.add('upload.js',function(){
         var photo=photo_id;
         if (/photo-?\d+_\d+/.test(photo)) photo=photo.match(/photo(-?\d+_\d+)/)[1];
         AjPost('/al_photos.php',{'act':'edit_photo', 'al': 1, 'photo': photo},function(t){
               var upload_url=t.match(/"upload_url":"(.*)"/);
               var hash=t.match(/', '([a-f0-9]{18})'\)/);
               var aid=t.match(/selectedItems:\s*\[(-?\d+)\]/)[1];
               upload_url = upload_url[1].replace(/\\\//g, '/').split('"')[0];
               if (vk_DEBUG) console.log('url',upload_url);
               Upload.init('vk_upd_photo', upload_url, {}, {
                  file_name: 'photo',
                  file_size_limit: 1024 * 1024 * 5,
                  file_types_description: 'Image files (*.jpg, *.jpeg, *.png, *.gif)',
                  file_types: '*.jpg;*.JPG;*.jpeg;*.JPEG;*.png;*.PNG;*.gif;*.GIF',
                  onUploadStart:function(){
                     val(ge('vk_upd_photo_progress'), vkBigLdrImg);
                     //lockButton
                  },
                  onUploadComplete: function(u,res){
                     var params = {
                        '_query' 	 : res,
                        'act' 	 	 : 'save_desc',
                        'aid' 	 	 : aid,
                        'al' 	 	    : 1,
                        'conf' 	 	 : '///',
                        'cover'  	 : '',	
                        'filter_num' : 0,
                        'hash' 		 : hash[1],
                        'photo'		 : photo,
                        'text' 		 :''
                     };
                     ajax.post('/al_photos.php', params,{
                        onDone: function(text, album, photoObj, thumb) {
                           box.hide();
                           vkMsg(IDL('Done'),2000);
                           if (photoObj && thumb) {
                              Filters.changeThumbs(thumb);
                           }
                        }
                     });
                  },
                  lang: { "button_browse":IDL("Browse",1) }
               });         
         });         
      });
      return false;
   },
   update_photo_btn:function(node){
      var p = geByClass('pe_filter_buttons',node)[0] ? geByClass('pe_filter_buttons',node)[0] : geByClass('pv_filter_buttons',node)[0];
      if (!p) return;
      var btn = se('<div class="button_gray fl_r" id="vk_ph_upd_btn"><button onclick="vk_photos.update_photo(cur.filterPhoto);">'+IDL('Update',2)+'</button></div>');
      p.appendChild(btn);
   },
   scan_wall:function(oid,only_owner){
      var PER_REQ=100;
      var offset=0;
      var links=[];
      var oid=cur.oid;
      var filter=!only_owner?'all':'owner';
      var abort=false;
      function scan(){
         if (abort) return;
         dApi.call('wall.get',{owner_id:oid,count:PER_REQ,offset:offset,filter:filter,extended:1},function(r){
            if (abort) return;
            var data=r.response;
            var posts=data.wall;
            var count=posts.shift();
            var len=posts.length;
            val(ge('vk_links_container_progr'), vkProgressBar(offset,count,600));
            for (var j=0; j<len; j++){
               var att=posts[j].attachments;
               if (!att) continue;
               for (var i=0; i<att.length; i++){
                  if (!att[i].photo) continue;
                  var p=att[i].photo;
                  links.push(p.src_xxxbig || p.src_xxbig || p.src_xbig || p.src_big || p.src);
                  p=null;
               }
               att=null;
            }
            data=null;
            posts=null;
            if (len>0){
               offset+=PER_REQ;
               setTimeout(function(){scan();}, 350);
            } else {
               var to_file=isChecked('links_to_file');
               vkSetVal('vk_collect_links_to_file',to_file?'1':'0');
               val(ge('vk_links_container'),'<h2>count: '+links.length+'</h2><textarea style="width:560px; height:300px;">'+links.join('\n')+'</textarea>');
               if (to_file)
                  vkSaveText(links.join('\n'),("wall_photos_"+oid).substr(0,250)+".txt");
            }
         })
      }
      
      var html='<div id="vk_links_container"><div id="vk_links_container_progr"></div>'+
               '<br><div class="checkbox'+(vkGetVal('vk_collect_links_to_file')=='1'?' on':'')+' fl_l" id="links_to_file" onclick="checkbox(this);"><div></div>Save links list to file after scan</div></div>';
      var box=vkAlertBox(IDL('Links'),html,function(){abort=true;});
      box.setOptions({width:"640px"});
      scan();
   },
   scan_walls_list:function(list){
      var PER_REQ=100;
      var offset=0;
      var links=[];
      var oid=cur.oid;
      var type='owner_id';
      var lid=0;
      var abort=false;
      if (oid) list.push(oid);
      function next(){
         offset=0;
         if (lid>=list.length) {
            var to_file=isChecked('links_to_file');
            vkSetVal('vk_collect_links_to_file',to_file?'1':'0');
            val(ge('vk_links_container'),'<h2>count: '+links.length+'</h2><textarea style="width:590px; height:300px;">'+links.join('\n')+'</textarea>');
            if (to_file)
               vkSaveText(links.join('\n'),("wall_photos_"+oid).substr(0,250)+".txt");
            return;
         }
         oid=list[lid]+'';
         if (/^-?\d+$/.test(oid)){
            type='owner_id';
         } else {
            var m=oid.match(/(^|\/)(club|public|event|id)(\d+)/);
            if (m){
               oid=(m[2]=='id'?'':'-')+m[3];
               type='owner_id';
            } else {
               oid=oid.split(/\?|#/)[0].split('/').pop().replace(/[^a-zA-Z0-9_]+/g,'');
               type='domain';
            }
         }
         if (!oid || oid==''){
            lid++;
            next();
         } else {
            scan();
            lid++;
         }
      }
      
      function scan(filter){
         if (abort) return;
         filter = filter || 'all';
         var params={count:PER_REQ,offset:offset,filter:filter,extended:1};
         params[type]=oid;
         dApi.call('wall.get',params,function(r){
            if (abort) return;
            var data=r.response;
            if (r.error){
               if (r.error.error_code==15 && filter!='owner'){ 
                  filter='owner';
                  scan(filter);
                  return;
               } else {
                  ge('vk_scan_log').innerHTML+='Scan error. <b>'+oid+'</b> ('+r.error.error_msg+'). Skip...<br>';
                  next();
                  return;
               }
            }
            var posts=data.wall;
            var count=posts.shift();
            var len=posts.length;
            val(ge('vk_links_container_progr'), vkProgressBar(offset,count,600)+(list.length>1?vkProgressBar(lid,list.length,600):''));
            for (var j=0; j<len; j++){
               var att=posts[j].attachments;
               if (!att) continue;
               for (var i=0; i<att.length; i++){
                  if (!att[i].photo) continue;
                  var p=att[i].photo;
                  links.push(p.src_xxxbig || p.src_xxbig || p.src_xbig || p.src_big || p.src);
                  p=null;
               }
               att=null;
            }
            data=null;
            posts=null;
            if (len>0){
               offset+=PER_REQ;
               setTimeout(function(){scan(filter)}, 350);
            } else {
               next();
            }
         })
      }
      
         var html='<div id="vk_links_container"><div id="vk_links_container_progr"></div>'+
                  '<br><div class="checkbox'+(vkGetVal('vk_collect_links_to_file')=='1'?' on':'')+' fl_l" id="links_to_file" onclick="checkbox(this);"><div></div>Save links list to file after scan</div><br><div id="vk_scan_log"></div></div>';
      var box=vkAlertBox(IDL('Links'),html,function(){abort=true;});
      box.setOptions({width:"640px"});
      next();
   },
   scan_walls_list_box:function(){
      var html='<textarea id="vk_links_list" style="width:560px; height:300px;"></textarea>';
      
      var aBox = new MessageBox({title: IDL('Enter_links')});
      aBox.removeButtons();
      aBox.addButton(getLang('box_cancel'),aBox.hide, 'no');
      aBox.addButton('OK',function(){  
         var links=ge('vk_links_list').value;
         links=trim(links).split(/\s*[\r\n,]+\s*/);
         aBox.hide();
         if (links.length==0){
            alert('List is empty...');
         } else {
            vk_photos.scan_walls_list(links);
         }
      },'yes');
      aBox.content(html);
      aBox.setOptions({width:"600px", onHide:function(){aBox.content('');}});
      aBox.show();
   },
   profile_albums_list:function(oid){
      var album=ge('profile_albums');
      if (!album) return;
      oid=oid || cur.oid;
      var p=geByClass('module_body',album)[0];
      val(p, vkBigLdrImg);
      var html='';
      dApi.call('photos.getAlbums',{oid:oid,need_covers:1},function(r){
         var data=r.response;
         if (!data){
            val(p, IDL('Error'));
            return;
         }
         for (var i=0; i<data.length; i++)
            html+='<a href="/album'+oid+'_'+data[i].aid+'" onclick="return nav.change({z: \'album'+oid+'_'+data[i].aid+'\'}, event)">'+data[i].title+'</a>';
         val(p, '<div class="vk_albums_list">'+html+'</div>');
      });
   },
    albums_links: function (oid) {   // Реализация функции получения ссылок на все фотографии с группировкой по альбомам. (в виде скрипта)
        var box = vkAlertBox(document.title, '<div id="vk_links_container1">'+vkBigLdrImg+'</div><br/><div id="vk_links_container2"></div>', null, null, true);
        var Progress = function (c, f) {    // обновление прогрессбара для альбомов
            if (!f) f = 1;
            val(ge('vk_links_container1'), vkProgressBar(c, f, 350));
        };
        var Progress2 = function (c, f) {    // обновление прогрессбара для фоток внутри альбомов
            if (!f) f = 1;
            val(ge('vk_links_container2'), vkProgressBar(c, f, 350));
        };
        vkApis.albums(oid, function (albums) {
            var wget_strings = [], wget_strings_nix = [],
                metalinklist = ['<?xml version="1.0" encoding="UTF-8" ?>',
                    '<metalink version="3.0" xmlns="http://www.metalinker.org/">',
                    '<files>'];
            for (var i in albums) {
                albums[i].title = albums[i].title.replace(/"/g,'\\"');            
                wget_strings_nix.push('mkdir "' + albums[i].title + '"');   // создание директории с названием, равным названию альбома
                wget_strings_nix.push('cd "' + albums[i].title + '"');      // переход в неё
                albums[i].title = vkCleanFileName(albums[i].title);         // для Windows удаляются неподдерживаемые символы
                wget_strings.push('mkdir "' + albums[i].title + '"');
                wget_strings.push('cd "' + albums[i].title + '"');
                for (var j = 0; j < albums[i].list.length; j++) {
                    var filename = albums[i].list[j].pid + '.jpg';
                    var wget_cmd = 'wget -O ' + filename + ' ' + albums[i].list[j].src;
                    wget_strings_nix.push(wget_cmd);
                    wget_strings.push(wget_cmd);
                    
                    metalinklist.push('<file name="' + albums[i].title + '/' + filename + '">'
                        + '<resources><url type="http" preference="100">' + albums[i].list[j].src + '</url></resources>'
                        + '</file>');
                }
                wget_strings.push('cd ..');                             // возврат в родительскую директорию
                wget_strings_nix.push('cd ..');
            }
            metalinklist.push('</files></metalink>');
            var wget_strings_joined = wget_strings.join('\n');
            var metalinklist_joined = metalinklist.join('\n').replace(/&/g,'&amp;');

            var wget_links_html = '<textarea id="vk_mp3_wget_links_area">' + wget_strings_joined + '</textarea>\
               <a download="DownloadPhotos' + oid + '.bat" href="data:application/x-download;base64,' + base64_encode(utf8ToWindows1251(utf8_encode('chcp 1251\n' + wget_strings_joined))) + '">' + vkButton('.BAT') + '</a>\
               <a download="DownloadPhotos' + oid + '.bat" href="data:application/x-download;base64,' + base64_encode(utf8_encode('chcp 65001\n' + wget_strings_joined)) + '">' + vkButton('.BAT (UTF-8)', '', 1) + '</a>\
               <a download="DownloadPhotos' + oid + '.sh" href="data:text/plain;base64,' + base64_encode(utf8_encode(wget_strings_nix.join('\n'))) + '">' + vkButton('.SH (UTF-8)', '', 1) + '</a>';
            var metalinklist_html = '<textarea id="vk_mp3_metalink_links_area">' + metalinklist_joined + '</textarea>\
               <a download="DownloadPhotos' + oid + '.metalink" href="data:text/plain;base64,' + base64_encode(utf8_encode(metalinklist_joined)) + '">' + vkButton('.METALINK (UTF-8)') + '</a>';
            var tabs = [];

            tabs.push({name: IDL('wget_links'), content: wget_links_html, active: true});
            tabs.push({name: IDL('Metalink'), content: metalinklist_html});
            box.content(vkMakeContTabs(tabs));
            box.setOptions({width: "560px"});
        }, Progress, Progress2);
    },
   VKPZL_SWF_LINK:"http://app.vk.com/c6130/u13391307/8c0797eea18120.swf",
   VKPZL_SWF_HTTPS_LINK:"https://app.vk.com/c6130/u13391307/8c0797eea18120.swf",
   pz_box:function(){
      
      var html = '<div><span id="vkpzldr"><div class="box_loader"></div></span>'+
                '<div id="pz_container" style="display:inline-block;position:relative;top:8px;"></div>'+
                '</div>';
                
      vk_photos.PZLBox = new MessageBox({title: IDL('PhotoShredder'), width:'650px'});
      var Box = vk_photos.PZLBox;
      vkOnSavedFile=function(){Box.hide(200);};
      Box.removeButtons();
      Box.addButton(IDL('Cancel'),Box.hide,'no');
      Box.content(html).show(); 
      
      dApi.call('photos.getWallUploadServer',{},function(r){
         var info=r.response;
         //alert(info.upload_url);
         //info.upload_url;
         //info.aid;
         //info.mid;
         //
         //
         //
         var swf=location.protocol=='https:'?vk_photos.VKPZL_SWF_HTTPS_LINK:vk_photos.VKPZL_SWF_LINK;
         var params={width:627, height:100, allowscriptaccess: 'always',"wmode":"transparent","preventhide":"1","scale":"noScale"};
         var vars={
            'idl_browse': IDL('Browse'),
            'idl_upload': IDL('Upload'),
            'upload_url': info.upload_url,
            'onResize'  : (function(){return 'vk_photos.pz_onresize';})(),
            'onDone'    : (function(){return 'vk_photos.pz_ondone';})()
         };
         renderFlash('pz_container',
            {url:swf,id:"vkpzl_pl"},
            params,vars
         );          
      })

   },
   pz_ondone:function(s){
      var data=JSON.parse(s);
      dApi.call('photos.saveWallPhoto',{photo:data.photo, server: data.server, hash:data.hash},function(r){
         if (vk_DEBUG) console.log('Save photo: ',r);
         var photos=r.response;
         for (var i=0; i<photos.length; i++){
            vk_ch_media.photo(photos[i].owner_id+'_'+photos[i].pid,photos[i].src_big,photos[i].width,photos[i].height);
            //cur.chooseMedia('photo', photoRaw, mediaData, false, false, true);
         }
         /*
         id "photo13391307_311284003"
         owner_id 13391307
         pid 311284003*/
      });
      vk_photos.PZLBox.hide();
   },
   pz_onresize:function(new_height){
      //console.log('PZL height: '+new_height);
		hide("vkpzldr");
      var h=parseInt(new_height);
      if (h>0)  
      ge('vkpzl_pl').setAttribute("height",h+10);
      
   },
   pz_item:function(){
      var AddItem=function(bef){
         var mid=ge('mid')?ge('mid').value:(window.cur && cur.oid?cur.oid:0);
         if (bef && mid){
            bef=bef.getElementsByTagName('a')[0];
            var a=document.createElement('a');
            a.setAttribu7e("onfocus","this.blur()");
            a.setAttribute("class"," add_media_item");
            a.setAttribute("id","vk_wall_post_type1");
            a.setAttribute("style","background-image: url(/images/icons/attach_icons.gif); background-position: 3px 3px");
            a.setAttribute("href","#");
            a.setAttribu7e("onclick","vk_photos.pz_box("+mid+");return false;");
            val(a, IDL('PhotoShredder'));
            bef.parentNode.insertBefore(a,bef.nextSibling);
         }
      };

      if (ge('vk_wall_post_type1')) return;
      if (ge('page_add_media')){
         Inj.Wait("geByClass('add_media_rows')[0]",AddItem,300,10);
      }   
   }
};

function vkPVPhotoMover(show_selector){
   if (!show_selector && cur.pvCurPhoto && (cur.pvCurPhoto.actions || {}).edit && ge('pv_album_name') && !/vkPVPhotoMover/.test(ge('pv_album_name').innerHTML) && trim(ge('pv_album_name').innerHTML)!="" ){
      val(ge('pv_album_name'), '<div id="vk_ph_album_info">'+
                                    ge('pv_album_name').innerHTML+
                                    '<div class="fl_r vk_edit_ico" onclick="return vkPVPhotoMover(true);"> </div>'+
                                 '</div><div id="vk_ph_album_selector"></div>');
      //appendChild(vkCe('div',{'class':'fl_r', id:'vk_ph_move', onclick:"return vkPVPhotoMover(true);"},'edit'));
      return;
   }
   if (!show_selector) return;
   var a=(cur.pvCurPhoto.album || "").match(/album(-?\d+)_(\d+)/);
   if (!a){
      alert('album detect error');
      return false;
   }
   var oid=parseInt(a[1]);
   var aid=parseInt(a[2]);
   var pid=parseInt(cur.pvCurPhoto.id.match(/(-?\d+)_(\d+)/)[2]);
   
   var params={};
   params[oid<0?'gid':'uid']=Math.abs(oid);
   val(ge('vk_ph_album_selector'), vkLdrImg);
   var btn=vkCe('div',{'class':'button_gray button_wide',id:'vkmakecover'},'<button>'+IDL('MakeCover')+'</button>');
   
   var sel=function(){
   
      addClass('pv_narrow','vkPVPhotoMoverOpen');
	  
      stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
         var albums=_vk_albums_list_cache[''+oid];
         hide('vk_ph_album_info');
         var def_aid=aid;
         cur.vk_pvMoveToAlbum = new Dropdown(ge('vk_ph_album_selector'), albums, {
           width: 169,
           selectedItems: [def_aid],
           autocomplete: (albums.length > 7),
           onChange: function(val) {
             if (!intval(val)) {
               cur.vk_pvMoveToAlbum.val(def_aid);
             }
             //alert(cur.vk_pvMoveToAlbum.val());
             var to_aid=cur.vk_pvMoveToAlbum.val();
             var to_info=cur.vk_pvMoveToAlbum.val_full();
             show('vk_ph_album_info');
             val(ge('vk_ph_album_info'), vkLdrImg);
             dApi.call('photos.move',{pid:pid,target_aid:to_aid,oid:oid},function(){
               hide('vk_ph_album_info');
               
               var listId = cur.pvListId, index = cur.pvIndex;
               var listRow = cur.pvData[listId];
               var ph = listRow[index];
               var album='<a href="album'+oid+'_'+to_aid+'" onclick="return nav.go(this, event)">'+to_info[1]+'</a>';
               if (album) ph.album = album;
                  ph.moved = (to_aid != def_aid);
               val(ge('pv_album_name'), album);
			   
			   removeClass('pv_narrow','vkPVPhotoMoverOpen');
			   
               vkPVPhotoMover();

             })
             
           }
         }); 
         ge('pv_album_name').appendChild(btn);
         btn.onclick=function(){
            lockButton(geByTag1('button',btn));
            dApi.call('photos.makeCover',{pid:pid,aid:aid,oid:oid},function(r){
               if (r.response==1)
                  hide(btn);
               else
                  unlockButton(geByTag1('button',btn));
            });
            //alert(pid+'\r\n'+aid);
         }
      });
   };
   if (_vk_albums_list_cache[''+oid])
      sel();
   else
      dApi.call('photos.getAlbums',params,function(r){
         var data=r.response;
         var albums = [];
         for (var i=0; i<data.length;i++)
            albums.push([data[i].aid,data[i].title]);
         _vk_albums_list_cache[''+oid]=albums;
         sel();
      }); 
    
      
   
   
   return false;
}



function vkPVSaveAndMover(){
   /*
   var a=(cur.pvCurPhoto.album || "").match(/album(-?\d+)_(\d+)/);
   if (!a){
      alert('album detect error');
      return;
   }*/
   var oid=vk.id;
   var aid=vkGetVal('vk_pru_album') || 0;//0;		

   val(ge('vk_ph_save_move'), '<div id="vk_save_selector_label">'+IDL('SelectAlbum')+'</div><div id="vk_ph_save_move_ok"></div><div id="vk_save_selector">'+vkLdrImg+'</div>');
   
   var sel=function(){
      stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
         var albums=_vk_albums_list_cache['move'+oid];
         hide('vk_ph_album_info');
         var def_aid=aid;
         var on_change=function(){
               //alert(cur.vk_pvMoveToAlbum.val());
               var to_aid=cur.vk_pvMoveToAlbum.val();
               var to_info=cur.vk_pvMoveToAlbum.val_full();

               val(ge('vk_save_selector_label'), vkLdrImg);

               var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];
               var needmove=function(t){
                  t=t.replace(/<a[^<>]+>[^<>]+<\/a>/,'<a href="/album'+oid+'_'+to_aid+'" class="vk_album_done_link">'+to_info[1]+'</a>');
                  dApi.call('photos.get',{uid:vk.id,aid:'saved'},function(r){
                     var ph=r.response.pop();
                     dApi.call('photos.move',{pid:ph.pid,target_aid:to_aid,oid:oid},function(){
                        vkSetVal('vk_pru_album',to_aid);
                        //val(ge('vk_save_selector_label'), IDL('Add'));
                        val(ge('vk_ph_save_move'), '');//'ok - album'+oid+'_'+to_aid;
                        showDoneBox(t);
                     })                 
                  })
               };
               ajax.post('al_photos.php', {act: 'save_me', photo: ph.id, list: listId, hash: ph.hash}, {onDone: needmove});         
         };
         cur.vk_pvMoveToAlbum = new Dropdown(ge('vk_save_selector'), albums, {
           width: 125,
           selectedItems: [def_aid],
           autocomplete: (albums.length > 7),
           onChange: function(val) {
               if (!intval(val)) {
                  cur.vk_pvMoveToAlbum.val(def_aid);
               }
               on_change();
           }
         });
         ge('vk_ph_save_move_ok').className="button_gray fl_r";
         val(ge('vk_ph_save_move_ok'), '<button style="padding:3px 4px">OK</button>');
         ge('vk_ph_save_move_ok').onclick=on_change;         
      });
   };
   if (_vk_albums_list_cache['move'+oid])
      sel();
   else
      dApi.call('photos.getAlbums',{uid:vk.id},function(r){
         var data=r.response;
         var albums = [];
         var albums_full=[];
         for (var i=0; i<data.length;i++)
            //if (data[i].size<501)
            if (data[i].size<10001)
               albums.push([data[i].aid,data[i].title,data[i].size+""]);
            /*else
               albums_full.push([data[i].aid,data[i].title,data[i].size+""]);*/
               
         _vk_albums_list_cache['move'+oid]=albums.concat(albums_full);
         sel();
      }); 
   return false;
}


function vkPVMouseScroll(){
    vkPVAllowMouseScroll=true;
    var on_scroll=function(is_next){
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
        setTimeout(function(){vkPVAllowMouseScroll=true},200);
      }
    };
    var _next=function(e){on_scroll(1,e)};
    var _prev=function(e){on_scroll(0,e)};
    vkSetMouseScroll(ge("pv_photo"),_next,_prev);
    
}
function vkPVLinks(ph){
  var html='';
  
  var links=[];
  var sizes=["x_","y_","z_","w_","o_","p_","q_","r_","s_","m_"];
  
  var d_name=function(p,pfx){
    if (!PHOTO_DOWNLOAD_NAMES) return '';
    return ' onclick="return vkDownloadFile(this);" download="photo'+p.id+pfx+'.jpg" ';
  };
  
  if (ph['x_'] && ph['x_'][1]){
   for (var i=0; i<sizes.length; i++){
      var sz=ph[sizes[i]];
      var src=ph[sizes[i]+'src'];
      if (sz && sz[1] && src){
         links.push('<a href="'+src+'" class="fl_l" '+d_name(ph,sizes[i].replace(/_/g,''))+'>'+sizes[i]+'['+sz[1]+'x'+sz[2]+']</a>')
      }
   }
  }
  if (ph.y_src || links.length>0){
    html+='<div id="pv_hd_links"><a href="#" onclick="toggle(\'vk_ph_links_list\'); return false;" class="fl_l">'+IDL('Links')+': </a>'+  
        (!ph.y_src && links.length>0 ? links[0] :'')+
        (ph.y_src?'<a href="'+ph.y_src+'" '+d_name(ph,'y')+' class="fl_r">HD1</a>':'')+
        (ph.z_src?'<a href="'+ph.z_src+'" '+d_name(ph,'z')+' class="fl_r">HD2</a>':'')+
        (ph.w_src?'<a href="'+ph.w_src+'" '+d_name(ph,'w')+' class="fl_r">HD3</a>':'')+
        (links.length>0?'<div id="vk_ph_links_list" class="clear" style="display:none;">'+links.join('')+'</div>':'')+
    '</div><div class="clear"></div>';
  } 
  if (ph.actions.save)  
      html+='<div id="vk_ph_save_move"><a href="#" onclick="return vkPVSaveAndMover();">'+IDL('Add')+'</a></div>';
  else 
      html+='<a href="#" onclick="vkPhotoUrlUpload(\''+(ph.w_src || ph.z_src || ph.y_src || ph.x_src)+'\'); return false;">'+IDL('Add')+'</a>';
  if ((ph.tags || [])[0]>0){
      html+='<a href="#" onclick="vkPVShowTagsInfo(); return false;">'+IDL('TagsInfo')+'</a>';
  }
  if (ph.x_src){
      var src=(ph.w_src || ph.z_src || ph.y_src || ph.x_src);
      /*
      html+='<a target="_blank" href="http://www.tineye.com/search?url='+src+'">'+IDL('TinEyeSearch')+'</a>';
      html+='<a target="_blank" href="https://www.google.ru/searchbyimage?image_url='+src+'">'+IDL('GoogleImgSearch')+'</a>';
      html+='<a target="_blank" href="http://images.yandex.ru/yandsearch?rpt=imagecbir&img_url='+src+'">'+IDL('YandexImgSearch')+'</a>';*/
      html+='<div class="pv_info" style="padding-left:5px;">'+IDL('ImgCopySeacrh')+'</div>';
      html+='<a target="_blank" class="fl_l" href="https://www.google.com/searchbyimage?image_url='+src+'">Google</a>';
      html+='<a target="_blank" class="fl_l" href="http://www.tineye.com/search?url='+src+'">TinEye</a>';
      html+='<a target="_blank" class="fl_l" href="http://images.yandex.ru/yandsearch?rpt=imagecbir&img_url='+src+'">Yandex</a>';  
      html+='<a target="_blank" class="fl_l" href="/feed?section=photos_search&q=copy%3Aphoto'+ph.id+'">VK</a>';  
      html+='<div class="clear"></div>';
      

      /* http://images.yandex.ru/favicon.ico */
  }
  
  return html;
}
function vkPVShowTagsInfo(){
   var pid=cur.pvCurPhoto.id.split('_');
   var code='\
      var tags=API.photos.getTags({owner_id:'+pid[0]+',pid:'+pid[1]+'});\
      var placers=API.getProfiles({"uids":tags@.placer_id});\
      return {tags:tags, placers:placers};\
   ';
    dApi.call('execute',{code:code},function(r){
      var data=r.response;
      var html='Not Avaliable';
      if (data && data.placers && data.tags){
         var users={};
         for (var i=0; i<data.placers.length; i++) 
            users[data.placers[i].uid]=data.placers[i].first_name+' '+data.placers[i].last_name;
         html='<table class="wk_table"><tr>\
            <td><b>'+IDL('Tag')+'</b></td>\
            <td><b>'+IDL('TagPlacer')+'</b></td>\
            <td><b>'+IDL('Date')+'</b></td>\
            </tr>';//'<h3>'+IDL('TagsInfo')+'</h3><br>';
         for (var i=0; i<data.tags.length; i++){
            var t=data.tags[i];
            var date= (new Date(t.date*1000)).format("yyyy-mm-dd HH:MM");
            var tagged = t.uid>0 ? '<a href="/id'+t.uid+'">'+t.tagged_name+'</a>' : t.tagged_name;
            html+='<tr><td>'+(i+1)+') '+tagged+'</td><td><a href="/id'+t.placer_id+'">'+users[t.placer_id]+'</a></td><td>'+date+'</td></tr>';
         }
         html+='</table>';
         vkAlertBox(IDL('TagsInfo'),html);
         stManager.add('wk.css');
      }
    });
}
 

vk_ph_comms = { // Устарело. Оставить можно только если для примера реализации подгружаемых с API страниц при прокрутке .
   users:{},
   photos:{},
   browse_comments_btn:function(){
      if (cur.oid>0 || ge('vk_php_comm')) return;
      var p=geByClass('summary',ge('photos_albums'))[0];
      if (!p || p.innerHTML.indexOf('?act=comments')>-1) return;
      p.appendChild(se('<span class="fl_r" id="vk_php_comm"><a href="#" onclick="return vk_ph_comms.init();">'+IDL('mPhC',1)+'</a><span class="divider">|</span></span>'))
   },
   init:function(){
      var oid=cur.oid;
      processDestroy(cur);
      cur.module = 'photos_comments';
      cur.oid=oid;
      cur.offset = 0;
      val((ge('photos_albums') || geByClass('photos_albums_page')[0]),'<div id="photos_container" class="clear_fix"></div>\
         <a id="photos_load_more" onclick="vk_ph_comms.load()" style="">\
           <span style="display: inline;">'+IDL('ShowMore')+'</span>\
           <div id="photos_more_progress" class="progress" style="display: none;"></div>\
         </a>');
      vk_ph_comms.moreLink=ge('photos_load_more');
      vk_ph_comms.progress=ge('photos_more_progress');
      vk_ph_comms.cont=ge('photos_container');
      stManager.add('photoview.css');
      vk_ph_comms.initScroll();
      vk_ph_comms.load();
      return false;
   },
   initScroll: function() {
      vk_ph_comms.scrollnode = browser.msie6 ? pageNode : window;

      addEvent(vk_ph_comms.scrollnode, 'scroll', vk_ph_comms.scrollResize);
      addEvent(window, 'resize', vk_ph_comms.scrollResize);
      removeEvent(window, 'load', vk_ph_comms.initScroll);
      cur.destroy.push(function() {
         removeEvent(vk_ph_comms.scrollnode, 'scroll', vk_ph_comms.scrollResize);
         removeEvent(window, 'resize', vk_ph_comms.scrollResize);
         vk_ph_comms.users={};
         vk_ph_comms.photos={};
      });
   },   
   scrollResize: function() {
      if (browser.mobile || cur.pvShown) return;

      var docEl = document.documentElement;
      var ch = window.innerHeight || docEl.clientHeight || bodyNode.clientHeight;
      var st = scrollGetY();
      var lnk = vk_ph_comms.moreLink;

      if (isVisible(lnk) && st + ch > lnk.offsetTop) {
         vk_ph_comms.load();
      }
   },
   load:function(){
      var more=vk_ph_comms.moreLink;
      var progress=vk_ph_comms.progress;
      if (!isVisible(more) || isVisible(progress)) return;
      if (cur.loading) {
         cur.loading = 2;
         return;
      }
      cur.loading = 1;
      show(progress);
      hide(more.firstChild);
      vk_ph_comms.get_data(cur.offset,function(html,done){
         show(more.firstChild);
         hide(progress);
         cur.loading = done?1:0;
         if (done){
            hide(more);
            hide(progress);
         }
         if (html!=''){
            var comms=se(html);
            vkProcessNode(comms);
            vk_ph_comms.cont.appendChild(comms);
         }
      });
   },
   get_data:function(offset,callback){
      var PER_REQ=20;//max 100
      dApi.call('photos.getAllComments', {
         oid: cur.oid,
         offset:cur.offset,
         need_likes:1,
         allow_group_comments:1,
         count:PER_REQ
      }, function(r){
         cur.offset+=PER_REQ;
         var data=r.response;
         if (data.length==0){ 
            callback('',true);
            return;
         }

         var tpl='<div class="clear_fix pv_comment pv_first_comment" id="pv_comment%id">\
              <div class="reply_table">\
                <div class="fl_l pv_thumb"><a href="/id%uid" onclick="return nav.go(this, event)"><img src="%ava" class="vk_userava%uid"></a></div>\
                <div class="fl_l pv_comm">\
                  <a href="/id%uid" onclick="return nav.go(this, event)" class="author">%name</a>\
                  <div><div class="pv_commtext">%comment</div></div>\
                  <div class="pv_commdata"><span class="fl_l pv_commdate">%date</span></div>\
                </div>\
                <a class="pv_photo_thumb fl_r vk_ph_preview" href="/photo%pid?all=1" onclick="return showPhoto(\'%pid\', \'photos%oid\', {temp:{}}, event)">\
                  <img src="%src" id="vk_photo_prw%id">\
                </a>\
              </div>\
            </div>';
         var html='';
         var pids=[];//.vk_ph_preview{background:url(); width:; height:;}//vk_photo_prw%id
         var uids=[];//.vk_userava%uid .src=
         for (var i=0; i<data.length; i++){
            var com=data[i];
            var uid=com.from_id+"";
            var pid=com.pid+"";
            if (!vk_ph_comms.users[uid])
               uids.push(uid);
            if (!vk_ph_comms.photos[pid])   
               pids.push(cur.oid+'_'+pid);
         }
         
         var make_comments=function(){
            var users=vk_ph_comms.users;
            var photos=vk_ph_comms.photos;
            for (var i=0; i<data.length; i++){
               var com=data[i];
               //*
               if (!users[com.from_id]){ 
                  if (com.from_id<0)
                     users[com.from_id]=['Admin','/images/camera_c.gif'];
                  else
                     users[com.from_id]=['[id'+com.from_id+']','/images/camera_c.gif'];
               }
               html+=tpl.replace(/%id/g,cur.oid+'_'+com.cid+'review')
                        .replace(/%ava/g,users[com.from_id][1])
                        .replace(/%uid/g,com.from_id)
                        .replace(/%name/g,users[com.from_id][0])
                        .replace(/%comment/g,com.message.replace(/\[(id\d+)\|([^\]]+)\]/,'<a href="/$1">$2</a>'))
                        .replace(/%date/g, (new Date(com.date*1000)).format('dd.mm.yyyy HH:MM'))
                        .replace(/%pid/g,cur.oid+'_'+com.pid) //'-1_2'
                        .replace(/%oid/g,cur.oid)
                        .replace(/%src/g,photos[com.pid+'']||"/images/no_photo.png");
               //*/         
            }
            callback('<div>'+html+'</div>');
         };
         var photos_load=function(){
            if (pids.length==0){ 
               make_comments();
               return;
            }
            dApi.call('photos.getById',{photos:pids.join(',')},function(pr){
               var photos=pr.response;
               for (var i=0; i<photos.length; i++)
                  vk_ph_comms.photos[photos[i].pid+'']=photos[i].src;
               make_comments();
            })         
         };        
         var users_load=function(){
            if (uids.length==0){ 
               photos_load();
               return;
            }
            dApi.call('users.get',{uids:uids.join(','),fields:'photo_50'},{ok:function(ur){
                  var users=ur.response;
                  //console.log('users:',ur);
                  for (var i=0; i<users.length; i++)
                     vk_ph_comms.users[users[i].uid+'']=[users[i].first_name+' '+users[i].last_name,users[i].photo_50];
                  photos_load();
               },
               error:function(r){
                  photos_load();
                  dApi.show_error(r);
               }
            });         
         };

         users_load();
         

      })
   }
};
//javascript: vkGetPageWithPhotos(13391307,42748479); void(0);
////javascript: vkGetPageWithPhotos(13391307,42748479); void(0);
//
function vkGetLinksToPhotos(oid,aid){  
	var MakeLinksList=function(phot){
		var parr=[]; 
      var txt='';
      var len=(phot.length+"").length;
		for (var i=0;i<phot.length;i++){
		  var src=phot[i];
        if (PHOTO_DOWNLOAD_NAMES){
           var num=('_000000000000'+i).substr(-len);
           src+=(src.indexOf('?')>0?'&/':'?&/')+num+'_'+src.split('/').pop();
        }
        parr.push('<a href="'+src+'">'+src+'</a>');
        txt+=src+'\r\n';
      }
		return [parr,txt];
	};
	if (!ge('vk_links_container')){
		var div=vkCe('div',{id:"vk_links_container","class":"clear_fix",style:"padding:10px;"},'<center>'+vkBigLdrImg+'</center>');
		var ref=ge('photos_container') || ge('likes_photo_content') ;
      if (ref)
         ref.parentNode.insertBefore(div,ref);
      else 
         div=null;
	} else var div=ge('vk_links_container');
   var box=null;
   if (!div) {
      box=vkAlertBox(IDL('Links'),'<div id="vk_links_container"></div>');
      box.setOptions({width:"640px"});
      div=ge('vk_links_container');
   }
	vkApis.photos_hd(oid,aid,function(r){
		var arr=MakeLinksList(r);
      
      var html=arr[0].join('<br>');
      val(div, html+(box?'':
				'<div class="vk_hide_links" style="text-align:center; padding:20px;">\
					<a href="#" onclick="re(\'vk_links_container\'); return false;">'+IDL('Hide')+'</a>\
				</div>'));
      vkSaveText(arr[1],"photos_"+vkCleanFileName((oid||'')+'_'+(aid||'')).substr(0,250)+".txt");
	},function(c,f){
		if (!f) f=1;
		val(ge('vk_links_container'), vkProgressBar(c,f,600));
		//document.title=c+"/"+f
	});
}
function vkGetZipWithPhotos(oid, aid) {
    /* < Создание прогресс-бара > */
    if (!ge('vk_links_container')) {
        var div = vkCe('div', {id: "vk_links_container", "class": "clear_fix", style: "padding:10px;"}, '<center>' + vkBigLdrImg + '</center>');
        var ref = ge('photos_container') || ge('likes_photo_content');
        if (ref)
            ref.parentNode.insertBefore(div, ref);
        else
            div = null;
    } else var div = ge('vk_links_container');
    var box = null;
    if (!div) {
        box = vkAlertBox(IDL('Links'), '<div id="vk_links_container"></div>');
        box.setOptions({width: "640px"});
        div = ge('vk_links_container');
    }
    /* </ Создание прогресс-бара > */

    var CORS_PROXY = location.protocol+'//crossorigin.me/';  // константа, содержащая адрес прокси для CORS-запросов
    var zip;            // переменная для объекта JSZip
    var links;          // переменная для массива ссылок на фотки
    var links_length;   // длина этого массива. Чтобы каждый раз не дергать .length
    var dlphoto = function (i) {  // рекурсивная функция скачивания фоток. i - номер ссылки в массиве
        if (i > -1) {   // условие продолжения рекурсии
            var next = function() {
                Progress(links_length - i, links_length); // Потому что скачивание идет задом наперед  
                dlphoto(--i);                             // продолжаем рекурсию                       
            };
            var request = (vkAjTransport.readyState == 4 || vkAjTransport.readyState == 0) ? vkAjTransport : PrepReq();
            if (request) {
                var cors_proxy_used = false;    // использовался ли уже CORS-прокси
                var onerror = function() {
                    if (!cors_proxy_used) {                  // Если еще не использовали прокси, используем
                        cors_proxy_used = true;
                        request.open('GET', CORS_PROXY + links[i], true);
                        request.send();
                    } else {    // Не скачалось даже через прокси. Наверное, прокси лежит. Скачиваем файл через background.
                        vk_aj.ajax({url: links[i], method: 'GET', responseType: 'arraybuffer'}, function (response) {
                            if (response.status == 200)
                                zip.file(i + '_'+ links[i].split('/').pop(), response.raw);
                            next();
                        });
                    }
                };
                request.responseType = 'arraybuffer';
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            zip.file(i + '_' + links[i].split('/').pop(), request.response);     // Добавление скачанного файла в объект JSZip
                            next();
                        } else
                            onerror();
                    }
                };
                request.onerror=onerror;
                request.open('GET', links[i], true);
                request.send();
            } else next();
        }
        else {      // При завершении скачивания сохраняем сгенерированный архивчик
            var content = zip.generate({type: "blob"});
            saveAs(content, "photos_" + vkCleanFileName((oid || '') + '_' + (aid || '')).substr(0, 250) + ".zip");
            val(div, ''); // очистить прогрессбар
        }
    };
    var Progress = function (c, f) {    // обновление прогрессбара
        if (!f) f = 1;
        val(ge('vk_links_container'), vkProgressBar(c, f, 600));
    };
    // Когда все библиотеки подключены
    JsZipConnect(function () {
        zip = new JSZip();                          // Создание объекта JSZip в ранее объявленную переменную
        vkApis.photos_hd(oid, aid, function (r) {   // Получение списка ссылок
            links = r;
            links_length = links.length;
            dlphoto(links_length - 1);              // Запуск рекурсии с последней ссылки
        }, Progress);
    });
}

function vkGetPageWithPhotos(oid,aid){  
  var MakeImgsList=function(phot){
    var parr=[]; 
    for (var i=0;i<phot.length;i++)
      parr.push('<img src="'+phot[i]+'">');
    return parr;
  };
	var box=new MessageBox({title: IDL('SavingImages'),width:"350px"});
	box.removeButtons();
	box.addButton(box_close,box.hide,'no'); // IDL('Cancel')
	box.content('<div id="ph_ldr_progress"><center>'+vkBigLdrImg+'</center></div>').show();
	
    vkApis.photos_hd(oid,aid,function(r){
		var vkImgsList=MakeImgsList(r).join('<br>');
		if (!vkImgsList.length)
			var html='<h4>No images</h4>';
		else {
			vkImgsList='<div style="background:#FFB; border:1px solid #AA0;  margin:20px; padding:20px;">'+IDL('HtmlPageSaveHelp')+'</div>'+vkImgsList;
         //vkImgsList=vkImgsList.replace(/#/g,'%23');
			var html='<h4><a href="#" id="vkGetPageWithPhotos">'+IDL('ClickForShowPage')+'</a></h4>';
		}
		box.content(html).show();
        if (vkImgsList.length)
            ge('vkGetPageWithPhotos').onclick = function () {
                vkWnd(vkImgsList, document.title.replace(/['"]+/g, ""));
            };
    },function(c,f){
		if (!f) f=1;
		val(ge('ph_ldr_progress'), vkProgressBar(c,f,310));
	});
}

function vkAddAlbumCommentsLinks(node){
   var els=geByClass('album',node);
   for (var i=0;i<els.length;i++){
      var el=geByClass('info_wrap',els[i])[0];
      var id=els[i].id?els[i].id:el.innerHTML.match(/album-?\d+_\d+/);
      if (el.innerHTML.indexOf('act=comments')==-1) el.innerHTML+='<a class="fl_r" href="/'+id+'?act=comments" onclick="return nav.go(this, event)">'+IDL('komm',1)+'</a>';
   }
}

function vkPhotosWallAlbum(){
   var p=geByClass('t_bar')[0].getElementsByTagName('ul')[0];
   if (!p || ge('vk_ph_wall')) return;
   var html='<a href="/album'+cur.oid+'_00?rev=1" onclick="return nav.go(this, event)"><b class="tl1"><b></b></b><b class="tl2"></b><b class="tab_word"><nobr>'+IDL('photos_on_wall',1)+'</nobr></b> </a>';
   p.appendChild(vkCe('li',{id:"vk_ph_wall"},html));
   
   /*
   if (ge('photos_top_container')) return;
   var gid=cur.oid;
   var html='<div class="clear_fix album top_album">\
       <div class="fl_l thumb"><a href="/album'+gid+'_00?rev=1" onclick="return nav.go(this, event)"><img src="http://vk.com/images/m_noalbum.gif"></a></div>\
       <div class="fl_l info_wrap">\
         <div class="name"><a href="/album'+gid+'_00?rev=1" onclick="return nav.go(this, event)">'+IDL('photos_on_wall')+'</a></div>\
         <a class="fl_r" href="/album'+gid+'_00?act=comments" onclick="return nav.go(this, event)">'+IDL('komm',1)+'</a>\
       </div>\
     </div>';
   var p=ge('photos_container');
   var div=vkCe('div',{id:'photos_top_container'},html);
   p.parentNode.insertBefore(div,p);
   */
}
function vkWallAlbumLink(){
   if (!ge('page_wall_header') || ge('vk_wall_album_link')) return;
   if (isVisible('page_wall_switch') || isVisible('page_wall_suggest'))  ge('page_wall_header').appendChild(vkCe('span',{"class":'fl_r right_link divide'},'|'));
   var href=ge('page_wall_header').getAttribute('href');
   var vk_wall_album_link = vkCe('a',{
        "class":'fl_r right_link',
        id:'vk_wall_album_link',
        href:'/album'+cur.oid+'_00?rev=1'
   },IDL('photo',1));
   vk_wall_album_link.setAttribu7e('onclick',"cancelEvent(event); return nav.go(this, event);");
   vk_wall_album_link.setAttribu7e('onmouseover',"this.parentNode.href='/album"+cur.oid+"_00?rev=1'");
   vk_wall_album_link.setAttribu7e('onmouseout',"this.parentNode.href='"+href+"';");
   ge('page_wall_header').appendChild(vk_wall_album_link);
}


var VKPRU_SWF_LINK='http://app.vk.com/c420730/u13391307/6360944486b815.swf';
var VKPRU_SWF_HTTPS_LINK='https://app.vk.com/c420730/u13391307/6360944486b815.swf';

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
   };   
      
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
         api_id:dApi.API_ID,
         access_token:dApi.access_token,
         viewer_id:dApi.mid,
         user_id:dApi.mid,
         api_url:'https://api.'+domain+'/method/',
         image_url: url,
         album_id:vkGetVal('vk_pru_album') || 0,
         onFlashReady:(function(){return "vk_vkpru_on_init";})(),
         onUploadComplete:(function(){return "vk_vkpru_on_done";})(),
         onDebug:(function(){return "vk_vkpru_on_debug";})(),
         "lang.button_upload":IDL('puUploadImageBtn'),
         "lang.choice_album":IDL('puChoiceAlbum'),
         "lang.loading_info":IDL('puLoadingInfoWait')
         //,"lang.button_upload":'Загрузить фотографию'
      };
      var swf=location.protocol=='https:'?VKPRU_SWF_HTTPS_LINK:VKPRU_SWF_LINK;
      var params={width:260, height:345, allowscriptaccess: 'always',"wmode":"transparent","preventhide":"1","scale":"noScale"};
      renderFlash('prucontainer',
         {url:swf,id:"vkphoto_reuploader"},
         params,flashvars
      ); 
   });
}
//vkPhotoUrlUpload('http://cs9543.vk.com/u3457516/124935920/w_5603bf45.jpg')

// ADMIN MODULE
vk_photoadm={
   css:'.photo_row .checkbox{position:absolute;margin-top: -5px; margin-left: -5px;}',
   mover:function(){// TO DO
         if (ge('photos_container').qsorter){
            ge('photos_container').qsorter.destroy();
         }
         var nodes=geByClass('photo_row');
         for (var i=0; i<nodes.length; i++){
            if (hasClass(nodes[i],'vk_chk')) continue;
            var pid=((nodes[i].id || '').match(/-?\d+_\d+/) || [])[0];
            if (!pid) continue;
            addClass(nodes[i],'vk_chk');
            nodes[i].insertBefore(se('<div class="checkbox" id="ph_chk'+pid+'" pid="'+pid+'" onclick="checkbox(this); (isChecked(this)?addClass:removeClass)(this,\'vk_checked_ph\'); cancelEvent(event)"><div></div></div>'),nodes[i].firstChild)
         }
         
         
   },
   get_album_info:function(oid,aid, callback){
      
      switch(aid){
         case '0':
         case '00':
         case '000':
            callback();
            return;
      }      
      /* for system albums, need request all albums with "need_system" because albums_ids filter don't work.
      switch(aid){
         case '0':
            aid='profile';
            break;
         case '00':
            aid='wall';
            break;
         case '000':
            aid='saved';
            break;
      }*/
      
      dApi.call('photos.getAlbums',{
         owner_id: oid,
         album_ids: aid,
         need_covers:1
      },function(r){
         var data=r.response || [];
         var album = data[0];
         callback(album);
      });
   }
};
/*
vkaddcss(vk_photoadm.css);
vk_photoadm.mover();
//*/

function vkAlbumAdminItems(){
   var a=[];
   var p=geByClass('photos_tabs')[0];
   var oid=(location.href.match(/album(-\d+)_00/) || [])[1];
	if (p && (/album-?\d+_\d+\?act=edit/i.test(p.innerHTML) || (oid && isGroupAdmin(oid)) || vk_DEBUG)){
		
		a.push({l:IDL('paCheckUnik'), onClick:vkAlbumCheckDublicatUser, s:{borderColor:"#DDDDDD", borderTop:"1px", borderTopStyle:"solid"}});
		a.push({l:IDL('paGetPByUser'), onClick:vkGetPhotoByUserBox});
		a.push({l:IDL('paDelOld'), onClick:function(){vkOldPhotos();} });
		a.push({l:'club337',h:'/club337'});//, IDL('paDevSpecialFor')
	}
	return a;
}
function vkPVAdminItems(data){
	//alert(print_r(data));
   if (!(data ||{}).author) return '';
   //console.log(data);
	var user=(data.author.split('href="')[1] || "").split('"')[0];
	return (user && user!='' && ge('photos_container') && /album(-?\d+)_(\d+)/.test(cur.moreFrom || ''))?'<a href="#" onclick="photoview.hide(); vkGetPhotoByUser(\''+user+'\'); return false;">'+IDL('paAllUserPhotos')+'<span id="vkphloader" style="display:none"><img src="/images/upload.gif"></span></a>':'';
}

function vkDisableAlbumScroll(){
    try{
		hide('photos_load_more');
		removeEvent(photos.scrollnode, 'scroll', photos.scrollResize);
		removeEvent(window, 'resize', photos.scrollResize);
	} catch(e){}
}

function vkGetPhotoByUserBox() {
  var vkMsgBox = new MessageBox({title: IDL('paSearchUserPhotos'),width:"250px"});
  vkMsgBox.removeButtons();
  vkMsgBox.addButton(IDL('Cancel'),function(){ vkMsgBox.hide(200);  vkMsgBox.content('');},'no');
  var onQ=function(){ 
        var q=ge('byuserlink').value;
        if (trim(q)=='') {
         alert(IDL('paEnterUser'));
        } else {
          vkGetPhotoByUser(trim(q));
          vkMsgBox.hide(200); 
          vkMsgBox.content('');
        }
    };
  vkMsgBox.addButton(IDL('Search'),onQ,'yes');
  vkMsgBox.content(IDL('paEnterUserLink')+'<br><input type="text" style="width:200px" id="byuserlink"/>').show();
  ge('byuserlink').onkeydown=function(){if(event.keyCode==13){onQ()}};
  ge('byuserlink').focus();
  return false;
}

function vkOldPhotos(del_count, ignore_pid){
  

  var aoid=cur.moreFrom.match(/album(-?\d+)_(\d+)/);
  var aid=aoid[2];
  var oid=aoid[1]; 
  
  
  if (!del_count){
    var box = vkAlertBox('...',vkBigLdrImg);
    vk_photoadm.get_album_info(oid,aid,function(info){
       box.removeButtons();
       
       var html='<h2>'+IDL('paDelCount')+'</h2>'+
                (info && info.thumb_id?'<div style="padding:3px 0px" class="fl_r"><div id="vk_del_old_ignorecover" class="checkbox" onclick="checkbox(this)"><div></div>'+IDL('DontRemoveAlbumCover')+'</div></div>':'')+
                '<input type="text" class="text" id="vk_del_old_count" value="0">'       
       box.setOptions({title:IDL('deleting')});
       box.content(html);
       
       on_submit = function(){
         ignore_pid = 0;
         del_count = parseInt(val('vk_del_old_count'));
         
         if (ge('vk_del_old_ignorecover') && isChecked('vk_del_old_ignorecover')){
            ignore_pid = info.thumb_id;
         }
         if (del_count>0){
            box.hide();
            vkOldPhotos(del_count,ignore_pid);
         } else {
            alert(IDL('paNullCount'));
         }
       }
       box.addButton(getLang('box_cancel'),box.hide, 'no');
       box.addButton('OK',on_submit,'yes');

    })
    return;
  }   
  
  
  var photoSort=function (a, b){
    var p1=a.pid;//[0].match(/_(\d+)/)[1];
    var p2=b.pid;//[0].match(/_(\d+)/)[1];
    if(p1<p2) return -1;
    if(p1>p2) return 1;
    return 0;
  };
  //AjGet('photos.php?act=a_album&oid='+oid+'&aid='+aid,function(r,t){
  var count=parseInt(del_count);
  val(ge('photos_container'), vkBigLdrImg);
  vkDisableAlbumScroll();
  vkAdmGetPhotosWithUsers(oid,aid,function(r){
	var list=r.response[0];
	var users_data=r.response[1];
 	var users={};
	for(var i=0;i<users_data.length;i++){
		users[users_data[i].uid]=users_data[i].first_name+' '+users_data[i].last_name;
	}
    //var list=eval('('+t+')');
    list=list.sort(photoSort);
    count = Math.min(list.length, count);
    var html="";
    var photos_id=[];
    if (count){
      for (var i=0;i<count;i++){
        if (list[i].pid==ignore_pid) continue;
        var pid=oid+'_'+list[i].pid;
        var src=list[i].src;
        html+='<td><div id="ph'+pid+'"><a href="/photo'+pid+'"  onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto(\''+pid+'\', \''+cur.moreFrom+'\', {img: this, root: 1}, event)"><img src="'+src+'" style="max-width: 130px"></a></div></td>'+/*((i % 5 == 0)?'<tr>':'')+*/
                (( (i+1) % 4 == 0)?'</tr><tr>':'');
        photos_id[photos_id.length]=pid;
      }
      val(ge("photos_container"), vkSubmDelPhotosBox(count,photos_id.join(','))+
                                    '<h4>'+IDL('paChkOldPhotos')+'</h4>'+
                                    '<div id="album"><table border="0" cellspacing="0"><tbody><tr>'+
                                    html+'</tr></tbody></table></div>'+
                                    '<br><br><h4>'+IDL('paIDCheckedPhotos')+'</h4><br>'+photos_id.join(', '));
    } else {
      alert(IDL('paNullCount'));
    }
    
  });
}

function vkSubmDelPhotosBox(count,photos_list,uid){
if (!uid) uid=0;
return '<div id="DelPhotosDialog'+uid+'" style="padding:20px">'+
    '<h2>'+IDL('paDelPhotos')+'</h2>'+
    '<p>'+IDL('paSureDelPhoto').replace("{count}",count)+'</p>'+
          '<a href="#" onclick="vkRunDelPhotosList(this.getAttribute(\'photos_ids\'),\''+uid+'\'); return false;" photos_ids="'+photos_list+'">'+vkButton(IDL('phDel'))+'</a>'+
'</div>';
}


function vkRunDelPhotosList(list,uid){
  var plist=list.split(',');
  val(ge("DelPhotosDialog"+uid), "<h4>"+IDL('paDelStarted')+"</h4>");
  vkDeletePhotosList(plist,0,uid);
}
function vkDeletePhotosList(list,idx,uid){
  vkDelOnePhoto(list[idx],function(t){  
    if (idx<list.length){
      if (t!='FAIL') {
          //setTimeout(function(){fadeOut(ge('ph'+list[idx]))},500);
          fadeTo(ge('ph'+list[idx]), 100, 0.1, function(){
              val(ge('ph'+list[idx]), t);
              fadeTo(ge('ph'+list[idx]), 500, 1, function(){
                  setTimeout(function(){fadeOut(ge('ph'+list[idx]))},500);
              });
          });
      } else {
        ge('ph'+list[idx]).setAttribute("style","border:2px solid #A00;");
      }
	  val(ge("DelPhotosDialog"+uid), vkProgressBar(idx+1,list.length,550,IDL('paDelProc')+' '+(idx+1)+"/"+list.length));
      //val(ge("DelPhotosDialog"+uid), "<h4>"+IDL('paDelProc')+(idx+1)+"/"+list.length+"</h4>");
      setTimeout(function(){vkDeletePhotosList(list,idx+1,uid)},500);
    } else { 
		val(ge("DelPhotosDialog"+uid), "<h4>"+IDL('paDelSuc')+"</h4>");
		//alert(IDL('paDelSuc'));
	}
  });
}

function vkDelOnePhoto(pid, callback) {
	//ajax.post('al_photos.php', {act: 'show', photo: photoId, list: listId}
	ajax.post('al_photos.php', {act: 'show', photo: pid, list:cur.moreFrom},{ 
		onDone:function(listId, count, offset, data){
			//alert(pid+'\n\n'+print_r(data));
			var hash='';
			for (var i=0; i<data.length; i++)
				if (data[i].id==pid){ 
					hash=data[i].hash;
					break;
				}
			//alert(hash);
			ajax.post('al_photos.php', {act: 'delete_photo', photo: pid, hash: hash},{ 
					onDone:function(text){ if (callback) callback(text);}, 
					onFail:function(){ if (callback) callback('FAIL');}
			});
		},
		onFail:function(){ if (callback) callback('FAIL');}
	});
}

function vkGetPhotoByUser(u,oid,aid,toel){
val(ge('photos_container'), vkBigLdrImg);
vkDisableAlbumScroll();
getGidUid(u,function(userid,groupid){
  userid = userid || groupid;
  show("vkphloader");
  var ResultElem=toel || ge("photos_container");
  var aoid=cur.moreFrom.match(/album(-?\d+)_(\d+)/);//nav.objLoc[0]
  aid=aid || aoid[2];
  oid=oid || aoid[1];
  vkAdmGetPhotosWithUsers(oid,aid,function(r){
    var list=r.response[0];
	var users_data=r.response[1];
 	var users={};
	for(var i=0;i<users_data.length;i++){
		users[users_data[i].uid]=users_data[i].first_name+' '+users_data[i].last_name;
	}
    var uids={};
    var uid;
    val(ResultElem, "<br>");
    for (var i=0; i<list.length; i++){
      uid=list[i].user_id;//owner_id;
      if (uids[uid]) {
        uids[uid].count++;
        uids[uid].ph[uids[uid].ph.length]=list[i];
      } else {
        uids[uid]={};
        uids[uid].count=1;
        uids[uid].ph=[list[i]];
      }
    }
    var uid_list=[];
     if (uids[userid]){
       var del_list=[];
       uid=userid;
       uid_list[uid_list.length]=uid;

       var html="";
       var html_="";
       
       html+='<table id="album">';
       for (var i=0;i<uids[uid].ph.length;i++){
		   var pid=oid+'_'+uids[uid].ph[i].pid;
		   var src=uids[uid].ph[i].src;
		   del_list.push(pid);
		   html+='<td><div id="ph'+pid+'">'+
				 '<input type="checkbox" class="vkphcheck" vkphoto="'+pid+'" style="position:absolute;">'+
				 '<a href="/photo'+pid+'"  onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto(\''+pid+'\', \''+cur.moreFrom+'\', {img: this, root: 1}, event)"><img src="'+src+'" style="max-width: 130px"></a>'+
				 '</div></td>'+
				 (( (i+1) % 4 == 0)?'</tr><tr>':'');
           html_+='<a href="/photo'+pid+'"  onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto(\''+pid+'\', \''+cur.moreFrom+'\', {img: this, root: 1}, event)">http://vkontakte.ru/photo'+pid+'</a><br>';
       }
       html+='</table>';
       html='<div style="padding:0px; border:1px solid #808080;" id="photos_container"><b><u><span id="vkusername'+uid+'"><a href="/id'+uid+'">'+users[uid]+'</a></span></u></b> '+
                '<a id="ban'+uid+'" style="cursor: hand;" onClick="vkBanUser(\''+uid+'\',\''+oid.match(/\d+/)[0]+'\')">[ '+IDL('banit')+' ]</a>'+
                '<a id="delBtn'+uid+'" style="cursor: hand;" onClick="ge(\'vkDelUBox'+uid+'\').innerHTML=vkSubmDelPhotosBox('+del_list.length+',\''+del_list.join(',')+'\',\''+uid+'\'); return false;">'+IDL('paDelAllUserPhotos')+'</a>'+
                '<a id="delchecked" style="cursor: hand;" onClick="vkRunDelCheckedPhotosList(); return false;">'+IDL('paDelChecked')+'</a>'+
                ':<br>'+'<div id="vkDelUBox'+uid+'"></div>'+html;
       html+='<br><br></div>';
       html+='<div><a href="/id'+uid+'">http://vkontakte.ru/id'+uid+'</a> :<br>'+html_+'</div>';
       ResultElem.innerHTML+=html;
       
     }
  });  
  
});
}

function vkDoCheck(check,className){
  var ch=geByClass(className);
  for (var i=0;i<ch.length;i++){
    switch (check){
    case 0:  ch[i].checked=false; break;
    case 1:  ch[i].checked=true; break;
    case 2:  ch[i].checked=!ch[i].checked; break;
    }
  }
}


function vkRunAllBanAndDelPhotos(gid){
  var ch=geByClass("vkphcheck");
  var list=[];
  for (var i=0;i<ch.length;i++){
    list.push(ch[i].getAttribute("vkphoto"));
  }
  var photos=[];
  for (var i=0;i<list.length;i++){
   photos.push(ge('ph'+list[i]).parentNode.innerHTML);
  }
    vkaddcss(".nocheckp input{display:none}");
    var html='<table id="album" class="nocheckp">';
    for (var i=0;i<photos.length;i++){
       html+='<td>'+photos[i]+'</td>'+(( (i+1) % 4 == 0)?'</tr><tr>':'');
    }
    html+='</table>';   
   
  var idss=ge("banallusers").getAttribute("id_list");
  if (idss){
    var ids=idss.split(',');
    var  users="";
    for (var i=0;i<ids.length;i++){
        users+=ge('vkusername'+ids[i]).innerHTML+'<br>';
    }
     val(ge("photos_container"), vkSubmBanPhotosBox(ids.length,idss,0,gid,users)+
                                   vkSubmDelPhotosBox(list.length,list.join(','))+html);
  }
}


function vkRunDelCheckedPhotosList(){
  var ch=geByClass("vkphcheck");
  var list=[];
  for (var i=0;i<ch.length;i++){
    if (ch[i].checked) list.push(ch[i].getAttribute("vkphoto"));
  }
  //alert(list.join("\n"));
  var photos=[];
  for (var i=0;i<list.length;i++){
   photos.push(ge('ph'+list[i]).parentNode.innerHTML);
  }
  //alert(photos[0]);
    vkaddcss(".nocheckp input{display:none}");
    var html='<table id="album" class="nocheckp">';
    for (var i=0;i<photos.length;i++){
       html+='<td>'+photos[i]+'</td>'+(( (i+1) % 4 == 0)?'</tr><tr>':'');
    }
    html+='</table>';
    val(ge("photos_container"), vkSubmDelPhotosBox(list.length,list.join(','))+html);
}


function vkSubmBanPhotosBox(count,user_list,uid,gid,users){
if (!uid) uid=0;
return '<div id="BanDialog'+uid+'" style="padding:20px">'+
    '<h2>'+IDL('paBanUsers')+'</h2>'+
    '<p>'+IDL('paSureBanAll').replace("{count}",count)+"<br>"+users+"</p>"+
          '<a href="#" onclick="vkBanUserList(this.getAttribute(\'user_list\'),\''+gid+'\',\'BanDialog'+uid+'\'); return false;" user_list="'+user_list+'">'+vkButton(IDL('banit'))+'</a>'+
'</div>';
}


function vkRunBanAll(gid){
  var idss=ge("banallusers").getAttribute("id_list");
  //alert(idss);
  if (idss){
    var ids=idss.split(',');
    var  users="";
    for (var i=0;i<ids.length;i++){
        users+=ge('vkusername'+ids[i]).innerHTML+'<br>';
    }
     val(ge("photos_container"), vkSubmBanPhotosBox(ids.length,idss,0,gid,users));
     //users+'<div id="banProc"></div>';
    // vkBanUserList(idss,gid,ge("BanDialog0"),users);
  }
}
function vkBanUserList(users,gid,info_el){
  var idx=0;
  users=users.split(',');
  info_el=ge(info_el);
  /*
  var BanUser=function(id,gid,callback){
    val(info_el, "<h4>"+IDL('paBanUsers')+": "+(idx+1)+"/"+users.length+"</h4>");
    AjGet("/groups_ajax.php?act=a_inv_by_link&b=1&page="+id+"&gid="+gid,function(req){
      req=req.responseText;
      req=req.replace('id="invForm"','class="invForm"');
      var hash = req.match(/"hash".value="(.+)"/i)[1];
      req=req.replace(hash,decodehash(hash));
      div = document.createElement('div');
      val(div, req);
      var form = geByClass('invForm', div)[0];
      var url="/groups_ajax.php?"+ajx2q(serializeForm(form));  
      AjGet(url,callback);
    }); 
  }*/
  var onDone=function(text){
    if (idx<users.length){
      val(info_el, vkProgressBar(idx+1,users.length,550,IDL('paBanUsers')+": "+(idx+1)+"/"+users.length)+'<br><br>'+text);
	  //val(info_el, "<h4>"+IDL('paBanUsers')+": "+(idx+1)+"/"+users.length+"</h4>");
	  vkBanUserFunc('id'+users[idx],gid,onDone);
    } else {
		val(info_el, IDL('Done'));
		alert(IDL('Done'));
	}
    idx++;
  };
  onDone();
}

function vkAdmGetPhotosWithUsers(oid,aid,callback){	
      switch(aid){
         case '0':
            aid='profile';
            break;
         case '00':
            aid='wall';
            break;
         case '000':
            aid='saved';
            break;
      }
      /*
      var params={aid:aid,limit:1000,offset:cur_offset};
      params[(oid<0?'gid':'uid')]=Math.abs(oid);
      dApi.call('photos.get',params,function(r){
      
      });*/
      var limit=1000;
      var cur_offset=0;
      var result=[[],[]];
      var scan=function(){
         var code='var a=API.photos.get({'+(oid<0?'gid':'uid')+':'+Math.abs(oid)+',aid:"'+aid+'",limit:'+limit+',offset:'+cur_offset+'});'+
         'var p=API.getProfiles({"uids":a@.user_id,fields:"uid,first_name,last_name"});'+
         'return [a,p];';
         if (vk_DEBUG) console.log(code);
         dApi.call('execute',{code:code},function(r){
            var res=r.response; //[0] photos    [1] users

            if (res[0])
               result[0]=result[0].concat(res[0]);
            
            if (res[1]){
               var users=res[1];
               var all_users=result[1];
               for (var i=0; i<users.length; i++){
                  var b=true;
                  for (var j=0; j<all_users.length; j++){
                     if (all_users[j].uid==users[i].uid) b=false;
                  }
                  if (b) result[1].push(users[i]);
               }
               //result[1]=result[1].concat(res[1]);
            }
           
            if (res[0].length>=limit){
               cur_offset+=limit;
               if (vk_DEBUG) console.log('Current scan offset: '+cur_offset);
               scan();
            } else {
               //console.log(result,result[0].length);
               result={response:result};
               callback(result);
            }
         });
      };
      scan();
}
function vkAlbumCheckDublicatUser(){//oid,aid
  val(ge('photos_container'), vkBigLdrImg);
  vkDisableAlbumScroll();
  var aoid=cur.moreFrom.match(/album(-?\d+)_(\d+)/);
  var aid=aoid[2];
  var oid=aoid[1];
  var Allow_Count=prompt(IDL('EnterAllowPhotoCount'),'1');
  if (!Allow_Count) Allow_Count=1;
  vkAdmGetPhotosWithUsers(oid,aid,function(r){
    var list=r.response[0];
	var users_data=r.response[1];
	var users={};
	for(var i=0;i<users_data.length;i++){
		users[users_data[i].uid]=users_data[i].first_name+' '+users_data[i].last_name;
	}
	//alert(print_r(list));
    var uids={};
    var uid;
    val(ge("photos_container"), '<br>'+
                                  '<a id="delchecked" style="cursor: hand;" onClick="vkRunDelCheckedPhotosList(); return false;">'+IDL('paDelChecked')+'</a>'+
                                  '<span class="divider">|</span>'+
                                  '<a style="cursor: hand;" onClick="vkDoCheck(1,\'vkphcheck\'); return false;">'+IDL('CheckAll')+'</a>'+
                                  '<span class="divider">|</span>'+
                                  '<a style="cursor: hand;" onClick="vkDoCheck(0,\'vkphcheck\'); return false;">'+IDL('UncheckAll')+'</a>'+
                                  '<span class="divider">|</span>'+
                                  '<a id="banallusers" style="cursor: hand;" onClick="vkRunBanAll('+oid.match(/\d+/)[0]+'); return false;">'+IDL('paBanAll')+'</a>'+
                                  '<span class="divider">|</span>'+
                                  '<a id="bandelallusers" style="cursor: hand;" onClick="vkRunAllBanAndDelPhotos('+oid.match(/\d+/)[0]+'); return false;">'+IDL('paBanAllAndDelPhotos')+'</a>'+
                                  '<br><br>');
                       
    for (var i=0; i<list.length; i++){
      uid=list[i].user_id;//owner_id//[1].match(/u(\d+)/)[1];
      if (uids[uid]) {
        uids[uid].count++;
        uids[uid].ph[uids[uid].ph.length]=list[i];
      } else {
        uids[uid]={};
        uids[uid].count=1;
        uids[uid].ph=[list[i]];
      }
    }

    var uid_list=[];
    for (uid in uids)
     if (uids[uid].count>Allow_Count){
       uid_list[uid_list.length]=uid;
       var html="";
       
       var del_list=[];
       html+='<table id="album">';
       for (var i=0;i<uids[uid].ph.length;i++){
		   var pid=oid+'_'+uids[uid].ph[i].pid;
		   var src=uids[uid].ph[i].src;
		   del_list.push(pid);
		   html+='<td><div id="ph'+pid+'">'+
				 '<input type="checkbox" class="vkphcheck" vkphoto="'+pid+'" style="position:absolute;">'+
				 '<a href="/photo'+pid+'" onclick="if (cur.cancelClick) return (cur.cancelClick = false); return showPhoto(\''+pid+'\', \''+cur.moreFrom+'\', {img: this, root: 1}, event)"><img src="'+src+'" style="max-width: 130px"></a>'+
				 '</div></td>'+
				 (( (i+1) % 4 == 0)?'</tr><tr>':'');
       }
        html+='</table>';
        //.replace(/^0+/,"")
        html='<div style="padding:0px; border:1px solid #808080;"><b><u><span style="padding:5px;" id="vkusername'+uid+'"><a href="/id'+uid+'">'+users[uid]+'</a> ('+uids[uid].ph.length+')</span></u></b>'+
             '<a id="ban'+uid+'" style="cursor: hand;" onClick="vkBanUser(\''+uid+'\',\''+oid.match(/\d+/)[0]+'\'); return false;">[ '+IDL('banit')+' ]</a>'+
             '<a id="delBtn'+uid+'" style="cursor: hand;" onClick="ge(\'vkDelUBox'+uid+'\').innerHTML=vkSubmDelPhotosBox('+del_list.length+',\''+del_list.join(',')+'\',\''+uid+'\'); return false;">'+IDL('paDelAllUserPhotos')+'</a>'+
             ':<br>'+
             '<div id="vkDelUBox'+uid+'"></div>'+html;//vkSubmDelPhotosBox(del_list.length,del_list.join(','));
        
       
       //for (var i=0;i<uids[uid].ph.length;i++){html+='<a href="/photo'+uids[uid].ph[i][0]+'"><img src="'+uids[uid].ph[i][2]+'"></a>  '; }
       html+='<br><br>';
       ge("photos_container").innerHTML+=html+'</div>';
     } 
    ge("banallusers").setAttribute("id_list",uid_list.join(','));
  });
return false;
}

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
	var PLUGIN_ID = 'vkphadmin';
	var PLUGIN_NAME = 'vk photo admin module';
	
	var ADDITIONAL_CSS='';
	
	/* FUNCTIONS */
	var INIT = null;							// function()
	var ON_NEW_LOCATION = null;					// function(nav_obj,cur_module_name);
	var PROCESS_NEW_SCRIPT = null;				// function(file_name);
	var ON_STORAGE = null; 		  				// function(command_id,command_obj);
	var PROCESS_LINK_FUNCTION = null;			// function(link);
	var PROCESS_NODE_FUNCTION = null;			// function(node);
	var PHOTOVIEWER_ACTIONS	= vkPVAdminItems;	// function(photo_data); ||  String   
	var ALBUM_ACTIONS = vkAlbumAdminItems;		// function(oid,aid);
	
	vkopt_plugins[PLUGIN_ID]={
		Name:PLUGIN_NAME,
		css:ADDITIONAL_CSS,
		init:INIT,
		onLocation:ON_NEW_LOCATION,
		onLibFiles:PROCESS_NEW_SCRIPT,
		onStorage :ON_STORAGE,
		processLinks:PROCESS_LINK_FUNCTION,
		processNode:PROCESS_NODE_FUNCTION,
		pvActions:PHOTOVIEWER_ACTIONS,
		albumActions:ALBUM_ACTIONS
	};
	if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();






/* VIDEO */
function vkVideo(){
   //Inj.End('Video.onListInit','vk_videos.update_vid_titles();');
   /*if (getSet(76)=='y')
      Inj.Replace('Video.drawVideo','if (v[3]','if (false && v[3]');*/
}

function vkVideoEditPage(){
   vkVidEditAlbumTitle(null,true);
}

var _vk_vid_adm_gr=null;
var _vk_vid_add_box=null;

vk_videos = {
   css:function(){
      var code='\
      .vk_vid_acts_panel{  max-width:180px; position:absolute; z-index:20; padding:5px; border-radius:0 0 6px 0; background:rgba(0,0,0,0.5);  }\
      .video_compact_view .vk_vid_acts_panel{ max-width:280px;}\
      .videocat_row_item .vk_vid_acts_panel{ max-width:180px;}\
      .video_compact_view .video_can_edit .vk_vid_acts_panel{ max-width:230px;}\
      .video_compact_view .vk_vide_wide_lnks{width:230px; display:block; font-size: 11px;}\
      \
      .video_compact_view .video_can_edit .vk_vid_acts_panel{ max-width:178px;}\
      .vk_vide_wide_lnks{width:178px; display:block; font-size:8px}\
      \
      .vk_vid_acts_panel,.vk_vid_acts_panel a{color:#FFF; }\
      .video_compact_view .vk_vid_acts_panel .vk_down_icon, .video_compact_view .vk_vid_acts_panel .vk_phv_link{background-position: 6px 7px; padding: 3px 0px 0px 17px;}\
      .vk_vid_acts_panel .vk_down_icon, .vk_vid_acts_panel .vk_phv_link{box-shadow:0 0 2px #FFF; background-position:3px 6px; padding: 1px 0px 0px 12px; background-color:rgba(0, 0, 0, 0.5);}\
      \
      .video_compact_view .vk_vid_acts_panel .vk_phv_link, .vk_vid_acts_panel .vk_phv_link{ padding: 2px 5px 4px 7px; }\
      .vk_vid_acts_panel .vk_photo_icon{ padding-left:12px; background: url(/images/fixedmenu_2x.png) no-repeat 0 -191px;   background-size: 11px 322px; line-height: 11px;  vertical-align: middle; }\
      \
      .video_raw_info_name .vk_txt_icon{padding-left: 16px; margin-bottom:-2px;}\
      .vk_full_vid_info{width:auto !important; height:auto !important; display:block;}\
      .vk_full_vid_info .video_row_inner_cont{float:left}\
      .vk_full_vid_info .vid_descr{width: 298px;}\
      .vk_full_vid_info .vk_clr{clear:both;}\
      #vk_more_acts .idd_item, #vk_more_acts .idd_item a{display:block}\
      #vk_more_acts .idd_item a{padding: 3px 0;}\
      #vk_more_acts .idd_item:hover{background-color:rgba(0, 51, 102, 0.117);}\
      .vkv_athumb{\
         background-repeat: no-repeat;\
         left: 50% !important;\
         top: 50% !important;\
         bottom: auto !important;\
         position: absolute !important;\
      }\
      .vkv_athumb_wrap, .video_module a.video div.vkv_athumb_wrap {\
         overflow: hidden;\
         background-color: rgba(0,0,0,0.7);\
         top: 0 !important;\
         left: 0 !important;\
         width: 100% !important;\
         height: 100% !important;\
         position: absolute !important;\
         pointer-events: none;\
         background-size: contain;\
         display: block !important;\
         margin-top: 0px !important;\
         opacity:0;\
         -webkit-transition: opacity 100ms linear;\
         -moz-transition: opacity 100ms linear;\
         -o-transition: opacity 100ms linear;\
         transition: opacity 100ms linear;\
      }\
      a:hover .vkv_athumb_wrap{\
          opacity:1 !important;\
      }\
      .vk_vid_reverse_plst{\
         background: url("/images/photoorder.gif") no-repeat;\
         width: 15px;   height: 12px;\
         margin-left: -45px; margin-top: 10px;\
         position: absolute;   opacity: 0.6;   cursor:pointer;\
      }\
      .vk_vid_reverse_plst:hover{opacity: 1;}\
      ';
      
      code+='\
         .vid_filt_link{display:inline-block; min-width:350px;}\
         .vid_filt_row:hover{background:rgba(163, 180, 194, 0.2);}';
      return code;
   },
   inj_common:function(){
      if (VIDEO_AUTOPLAY_DISABLE){ 
         Inj.Start('showVideo', 'vk_videos.change_show_video_params(options);');
         Inj.Before('showVideo','ajax.post','vk_videos.change_show_video_params(options);');
      }
      vk_groups.block_autoplay();         
   },
   inj_html5:function(){
      if (getSet(2)=='y') Inj.End('html5video.initHTML5Video','vkOnRenderFlashVars(vars);'); // перехват flash-переменных для скачивания видео
   },
   inj_videoview:function(){
      window.vk_vid_down && vk_vid_down.inj_vidview();
      Inj.End('videoview.showVideo','vkProcessNode(mvcur.mvControls);');
      if (getSet(71)=='y') 
         Inj.Before('Videoview.commentTo','if (!v', 'vk_phviewer.reply_to(comm, toId, event, rf,v,replyName); if(false)' );
      if (getSet(92)=='y') Inj.Start('Videoview.hide','if (!mvcur.minimized) force=true;');
      
      Inj.End('Videoview.updatePlaylistBoxPosition','try{vk_videos.reverse_playlist_mod_tpl();} catch(e){}')
      
      videoview.enabledResize=function(){return true;}
   },
   page:function(){ 
      window.vk_vid_down && vk_vid_down.vid_page();
      vk_videos.reverse_playlist_mod_tpl();
      vkVideoAddOpsBtn();
      vkVideoNullAlbum();
      // VIDATHUMB
      if (getSet(106)=='y') cur.videoTplHTML = cur.videoTplHTML.replace(/(o.click="[^"]+Video\.show)/g,'o'+'nmouseover="vk_videos.init_animated_thumb(this);" $1')
   },
   process_link:function(link){
      // AMO censored
      var omo = 'o'+'nmouseover';
      var sa = 'setA'+'ttribute';
      // VIDATHUMB 
      if (getSet(106)=='y'){     
         if (link && /video-?\d+_\d+/.test(link.href || '') && !link.hasAttribute(omo))
            link[sa](omo,'vk_videos.init_animated_thumb(this);')
      }
   },
   init_animated_thumb: function(lnk){
      var MAX_PREVIEW_ZOOM_FACTOR = 2.5;
      
      lnk = ge(lnk);
      if (!lnk) return;
      ovid = lnk.href.match(/video(-?\d+)_(\d+)/);
      if (!ovid) return;
      
      var found = false, inners = ['mv_recom_screen','video_thumb_play','videocat_thumb','videocat_thumb_shadow','video_play_btn_wrap','videocat_duration','page_video_thumb','page_post_thumb_sized_photo'];
      for (var i = 0; i < inners.length; i++)
         if (hasClass(lnk, inners[i]) || (geByClass(inners[i],lnk)||[])[0]){
            found = true;
            break;
         }
      
      if (!found) return;
         
      // page_post_thumb_sized_photo - append to <A>
      var anim,
          el,
          spritesheetsUrls,
          thumbsPerRow,
          thumbsPerImage,
          thumbsTotal,
          thumbWidth,
          thumbHeight,
          stopped = false, 
          img_idx = x = y = thumbIndex = 0;   
      
      if (hasClass(lnk,'vkv_anim_inited')) return;
      addClass(lnk, 'vkv_anim_inited');
      
      var id = ovid[1]+'_'+ovid[2];
      
      var load_info = function(callback){
         AjGet('/video.php?act=a_flash_vars&vid='+id,function(t){
            if(t && t!='NO_ACCESS'){
               var obj=JSON.parse(t);
               !obj.extra ? callback(obj) : callback(null);
            }         
         });
      }
      
      var over = function(){
         // Тут из-за возможности переключения отображения списка, из-за чего меняется размер превьюхи.
         wrap_sz = getSize(el.parentNode);
         var zoom = (Math.min(MAX_PREVIEW_ZOOM_FACTOR, wrap_sz[0]/thumbWidth)).toFixed(2);
         el.style.zoom = zoom;
         el.style.MozTransform = "scale("+zoom+")";
         addClass(el, 'vkv_animated');
         stopped = false;
         anim = setInterval(anim_func, 300);
      }
      var anim_func = function(){
            if (!hasClass(el,'vkv_animated')){
               clearInterval(anim);
               return;
            }
            img_idx = Math.floor(thumbIndex / thumbsPerImage); // на каком листе искать кадр
            x = thumbWidth * (thumbIndex % thumbsPerRow);
            y = thumbHeight * Math.floor(thumbIndex % thumbsPerImage / thumbsPerRow);
            el.style.backgroundImage = "url('"+spritesheetsUrls[img_idx]+"')";
            el.style.backgroundPosition = (-x)+'px '+(-y)+'px' // Firefox
            thumbIndex++;
            if (thumbIndex >= thumbsTotal) 
               thumbIndex = 0;
      }
      
      var stop = function(){
         //removeEvent(el.parentNode.parentNode,'mouseout', stop);
         stopped = true;
         removeClass(el, 'vkv_animated'); 
         clearInterval(anim);
      }
      
      load_info(function(data){
         if (!data || !data.timeline_thumbs_jpg){
            console.log('video' + id + ' without preview');
            return;            
         }
         var athumb = se('<div class="vkv_athumb_wrap" id="vkv_athumb_wrap_%ID"><div class="vkv_athumb" id="vkv_athumb_%ID"></div></div>'.replace(/%ID/g,id));
         el = athumb.firstChild; //ge('vkv_athumb_'+id);
         
         var append_to = geByClass('video_image_div',lnk)[0] || geByClass('mv_recom_screen',lnk)[0];
         (append_to || lnk).appendChild(athumb);
         
         spritesheetsUrls = data.timeline_thumbs_jpg.split(",");
         thumbsPerRow = data.timeline_thumbs_per_row;
         thumbsPerImage = data.timeline_thumbs_per_image;
         thumbsTotal = data.timeline_thumbs_total;
         thumbWidth = data.timeline_thumb_width;
         thumbHeight = data.timeline_thumb_height;
        
         el.style.width = thumbWidth+'px';
         el.style.height = thumbHeight+'px';  
         el.style.marginLeft  =  '-'+(Math.round(thumbWidth/2))+'px';      
         el.style.marginTop  =  '-'+(Math.round(thumbHeight/2))+'px';
         
         addEvent(el.parentNode.parentNode,'mouseout',stop);
         addEvent(el.parentNode.parentNode,'mouseover',over);
         
         !stopped && over();
      });
   },
   
   reverse_playlist_mod_tpl:function(){
      if (window.cur  && cur.plb_tpl && cur.plb_tpl.indexOf('vk_vid_reverse_plst') == -1)
         cur.plb_tpl = cur.plb_tpl.replace(/(<div[^>]+class="video_plb_header_collapse_icon")/,vk_videos.reverse_playlist_btn_tpl+" $1");
      var p = geByClass('video_plb_header_collapse_icon');
      if (p && p.parentNode && !ge('vk_vid_reverse_plst')){
         p.parentNode.insertBefore(se(vk_videos.reverse_playlist_btn_tpl),p)
      }
   },
   reverse_playlist_btn_tpl: '<div class="fl_r" id="vk_vid_reverse_plst"><div class="vk_vid_reverse_plst" onclick="vk_videos.reverse_playlist(this);"></div></div>',
   reverse_playlist:function(){
      var blockEl = Videocat.getPlaylistBlockEl();
      var data_list = blockEl ? data(blockEl, 'playlist') : false; // список кэшированный в данных элемента
      var playlistId = data_list.id;
      playlistId = (window.Video && (Video.isCurrentChannel() || Video.isCurrentCategory() || Video.isCurrentSectionAlbum() || Video.isInVideosList())) ? ('all_' + playlistId) : playlistId;
      var list = (Videocat.lists || {})[playlistId]; // кэшированный плейлист для рендеринга
      

      // На случай если в конец нашему списку перевёрнутому были добавлены ещё видео
      if (data_list.vk_reordered){
         var reordered_list = list.list.splice(0,data_list.vk_reordered_count);// отрезаем наш перевёрнутый кусок
         reordered_list.reverse();
         list.list = reordered_list.concat(list.list); // возвращаем на место в нормальном порядке
         list.vk_reordered = false;
         list.vk_reordered_count = 0;
      } else {
         list.vk_reordered = true;
         list.vk_reordered_count = list.list.length;
          list.list.reverse();
      }   
            
      
      
      // основной список видео в альбоме, из которого вырезается список для рендеринга (по 50 видео вперёд/назад от текущего видео)
      if (window.cur && cur.videoList && cur.vSection && cur.videoList[cur.vSection] && cur.videoList[cur.vSection].list)
         cur.videoList[cur.vSection].list.reverse(); 

      data_list.list = list.list;
      
      Videocat.buildPlaylistBlock(list.id, true);
      
      Videoview.updatePlaylistBoxPosition(); // пвозвращаем список на место
      Videocat.setPlaylistCurrentVideo(mvcur.videoRaw,true); //проматываем до текущего видео
      Videoview.updatePlaylistControls(); // обновляем видимость стрелок вперёд/назад
   },
   show_null_album:function(){
      var albumed = [];
      var fake_id = 10000000001;// c нулевым какие-то траблы. не разбирался.
      
      var sec_idx = -1;
      for (var i=0; i<cur.sections.length; i++){
         if (cur.sections[i][0] == fake_id) sec_idx = i;
      }
      if (sec_idx == -1){
         for (var section in cur.videoList){ // собираем списко видео добавленных в любые альбомы
            var isAlbum = section.substr(0, 6) == 'album_';
            if (!isAlbum) continue;
            var vids=cur.videoList[section].list;
            for (var i=0; i<vids.length; i++){
               var vid = vids[i][0]+'_'+vids[i][1]
               if (albumed.indexOf(vid) == -1)
                  albumed.push(vid);
            }         
         }
         
         var data = {count:0, list:[], silent: false};
         var vids=cur.videoList['all']['list'];
         for (var i=0; i<vids.length; i++){ // собираем в список видео вне альбомов
            var vid = vids[i][0]+'_'+vids[i][1];
            if (albumed.indexOf(vid) == -1)
               data.list.push(vids[i]);
         }
         data.count = data.list.length;
         cur.videoList['album_'+fake_id] = data; // делаем фейковый альбом
         
         if (sec_idx == -1){ // добавляем инфу о фейковом альбоме
            cur.sections.push([fake_id, IDL('NotInAlbums'), false, 0, Math.round(new Date().getTime()/1000), "", 0]);
            sec_idx = cur.sections.length -1;
         }
      }
      
      cur.sections[sec_idx][3] = cur.videoList['album_'+fake_id].list.length;
      //Video.onSwitchTabs('album_'+fake_id);
      nav.change({section:'album_'+fake_id});
      return false;
   },
   change_show_video_params:function(opts){
      if (!opts) return;
      if (VIDEO_AUTOPLAY_DISABLE){
         if (opts.autoplay) 
            opts.autoplay = 0;
         if (opts.params)
            opts.params.autoplay = 0; 
         if (opts.addParams)
            opts.addParams.autoplay = 0; 
      }         
      //params['force_hd']=3;
      //console.log('showVideo:',opts);
   },
   tpl:'\
      <a class="choose_video_row fl_l" href="/video%oid_%vid" onclick="return cur.chooseMedia(\'video\', \'%oid_%vid\', \'%thumb\')">\
        <div class="img"><img src="%thumb"><div class="duration">%dur</div></div>\
        <div class="label">%title</div>\
      </a>\
   ',
   choose_album:function(oid){
      var PER_PAGE=100;
      var albums=[];
      var scan=function(offset){
         var params={count:PER_PAGE,offset:offset};
         if (oid){
            params[oid<0?'gid':'uid']=Math.abs(oid);
         }
         dApi.call('video.getAlbums',params,function(r){
            var _albums=(r.error && r.error.error_code==15)?[0]:r.response;
            if (r.error) dApi.show_error(r);
            var count=_albums.shift();
            albums=albums.concat(_albums);
            if (albums.length<count){
               scan(offset+PER_PAGE)
            } else {
               var html='';
               for (var i=0; i<albums.length; i++){
                  var a=albums[i];
                  html+='<a class="album_choose" href="#" onclick="return vk_videos.choose_album_item('+a.owner_id+',\''+a.album_id+'\');"><b class="vk_video_icon"></b>'+a.title+'</a>';
               }
               html+='<br class="clear">';
                val(ge('choose_video_rows'), html);
            }
         });
      };
      scan(0);
      //*
      val(ge('choose_video_rows'), vkBigLdrImg);//albums;
      hide('video_choose_more');
      //*/
      return false;
   },
   choose_album_item:function(oid,aid){
      var PER_PAGE=12;
      //vkMakePageList(0,100,'#','return page(%%);',PER_PAGE,true)


      var page=function(offset){
         
         val(ge('choose_video_rows'), vkBigLdrImg);
         var params={owner_id:oid, album_id:aid, width:130, count:PER_PAGE, offset:offset};

         var items=null;

         dApi.call('video.get',params,function(r){
            items=r.response;
            var count=items.shift();
                     
            var pages=Math.floor(count/PER_PAGE);
            var html='';
            var pages_html='<div class="clear clear_fix ">\
               <ul class="page_list fl_r">'+vkMakePageList(offset/PER_PAGE,pages,'#','return vk_videos._choose_album_item_page(%%);',1,true)+'</ul>\
            </div>';
            html+=pages_html;
            
            for (var i=0; i<items.length; i++){
               var v=items[i];                
               html+=vk_videos.tpl.replace(/%oid/g,v.owner_id)
                                 .replace(/%vid/g,v.vid)
                                 .replace(/%title/g,v.title)
                                 .replace(/%dur/g,vkFormatTime(v.duration))//formated
                                 .replace(/%thumb/g,v.image);
            }
            html+=pages_html;
            html+='<br class="clear">';
            val(ge('choose_video_rows'), html);
         }); 
         return false;
      };
      
      page(0);
      
      vk_videos._choose_album_item_page=function(_offset,rev){
         return page(_offset*PER_PAGE,rev);
      };
      return false;
   },
   clean:function(){
      var REQ_CNT=200;
      var DEL_REQ_DELAY=400;
      var SCAN_REQ_DELAY=400;
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
         val(ge('vk_del_msg'), vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %'));
         var item_id=mids[del_offset];
         if (!item_id){
            val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
            del_offset=0;
            callback();
         } else
         dApi.call('video.delete', {owner_id:item_id[0],video_id:item_id[1], target_id: cur.oid},function(){
            del_offset++;
            setTimeout(function(){del(callback);},DEL_REQ_DELAY);
         });
      };
      
      var cur_offset=0;
      var scan=function(){
         if (cur_offset==0) val(ge('vk_scan_msg'), vkProgressBar(cur_offset,2,310,IDL('listreq')+' %'));
         
         var params={};
         params['owner_id']=cur.oid;
         params['count']=REQ_CNT;
         params['offset']=cur_offset;
         
         dApi.call('video.get',params,function(r){
            if (abort) return;
            var ms=r.response;
            if (!ms[0]){ del(deldone);	return;	}
            var _count=ms.shift();
            val(ge('vk_scan_msg'), vkProgressBar(cur_offset,_count,310,IDL('listreq')+' %'));
            for (var i=0;i<ms.length;i++) mids.push([ms[i].owner_id, ms[i].vid]);
            if (cur_offset<_count){	cur_offset+=REQ_CNT; setTimeout(function(){scan();},SCAN_REQ_DELAY);} else del(deldone);
         });
      };
      
      var run=function(){
         
         box=new MessageBox({title: IDL('DelVideos'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(){abort=true; box.hide();},'no');
         var html='</br><div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
         box.content(html).show();	
         scan();
      };
     
      var owner=(cur.oid>0?"id":"club")+Math.abs(cur.oid);
      vkAlertBox(IDL('DelVideos'),'<b><a href="/'+owner+'">'+owner+'</a></b><br>'+IDL('DelAllVideosConfirm'),run,true);
   },
   get_description:function(oid,vid,el){
      var cont=ge('video_cont'+oid+'_'+vid);
      hide(el);
      dApi.call('video.get',{videos:oid+'_'+vid},function(r){
         var v=(r.response ||[])[1];
         if (!v) return;
         var div=vkCe('div',{'class':'vid_descr fl_r'},v.description);//'video_raw_info_name'
         addClass(cont,'vk_full_vid_info');
         cont.appendChild(div);
         cont.appendChild(vkCe('div',{'class':'vk_clr'}));
         // c.insertBefore(div,c.firstChild);
      })
   },
   mass_move_box:function(){
      var box = new MessageBox({title: IDL('VideoMove'), bodyStyle:'padding:0;', width:'550px'});
      box.removeButtons();
      
      box.addButton(getLang('box_cancel'), function() {
         box.hide();
         
      }, 'no');
      
      

      
      var html='<div id="video_upload_tab" class="video_upload_tab">\
           <div id="video_upload_info">\
             <div class="video_add_label">'+IDL('VideoFilterRegex')+'</div>\
             <div class="button_blue fl_r" id="vk_apply_filter_btn"><button>OK</button></div>\
             <input type="text" class="text" id="vk_filter_regex">\
             <div class="vk_cfg_info" style="margin-top:3px;">'+IDL('VideoFilterRegexHelp')+'</div>\
             <br><div id="vk_vid_filter_all" class="checkbox" onclick="checkbox(this)"><div></div>'+IDL('VideosOnlyWithoutAlbum')+'</div>\
             <br><div id="vk_vid_need_reload" class="checkbox on" onclick="checkbox(this)"><div></div>'+IDL('ReloadPegeAfterMove')+'</div>\
             <div id="vk_move_ctrls" style="display:none;">\
               <div class="video_add_label">'+IDL('MoveTo')+'</div>\
               <div class="button_blue fl_r" id="vk_run_move_btn"><button>'+IDL('Move')+'</button></div>\
               <div id="vk_vid_album_selector"></div> \
             </div>\
             <div id="vid_move_progress"></div>\
             <div id="vid_filt_list"></div>\
           </div>\
         </div>';
      box.content(html);
      box.show();
      
      var filtred_vids=null;
      var filtred_vids_count=0;
      var first_video=[0,0];
      var to_album=0;
      
      function collect_albums(callback,offset,data){
         data = data || [];
         dApi.call('video.getAlbums',{oid:cur.oid,count:100,offset:(offset||0),extended:1},function(r){
            var count=r.response.shift();
            //alert(count);
            data = data.concat(r.response);
            if ((offset>=count) || (data.length==count) || r.response.length==0){
               callback(data);
            } else {
               setTimeout(function(){
                  collect_albums(callback,offset+100,data);
               },350)
            }
         
         })
      }
      stManager.add(['video_edit.css','ui_controls.js', 'ui_controls.css','wkview.css'],function(){
         val(ge('vk_vid_album_selector'), vkLdrImg);
         /*
         collect_albums(function(list){
               var items=[];
               items.push(['0',IDL('NotInAlbums')]);
               for (var i=0; i<list.length;i++){
                  items.push([list[i].album_id,list[i].title,list[i].count+""]);
               }
               cur.vk_vidMoveToAlbum = new Dropdown(ge('vk_vid_album_selector'), items, {
                    width: 350,
                    selectedItems: [0],
                    autocomplete: (items.length > 7),
                    onChange: function(val) {
                      if (!intval(val)) {
                        cur.vk_vidMoveToAlbum.val(0);
                      }
                      to_album=cur.vk_vidMoveToAlbum.val();
                    }
               });//end of selector
               
               
         })*/
         
         
         var items=[];
         items.push(['0',IDL('NotInAlbums')]);
         for (var i=0; i<cur.sections.length;i++){
            items.push([cur.sections[i][0],cur.sections[i][1],cur.sections[i][3]+""]);
         }
         cur.vk_vidMoveToAlbum = new Dropdown(ge('vk_vid_album_selector'), items, {
              width: 350,
              selectedItems: [0],
              autocomplete: (items.length > 7),
              onChange: function(val) {
                if (!intval(val)) {
                  cur.vk_vidMoveToAlbum.val(0);
                }
                to_album=cur.vk_vidMoveToAlbum.val();
              }
         });

         
      });
      
     
      
      function move(callback){
         if (filtred_vids.length>0){
            if (vk_DEBUG) console.log(filtred_vids.length);
            //
            val(ge('vid_move_progress'), vkProgressBar(filtred_vids_count-filtred_vids.length,filtred_vids_count,310,(filtred_vids_count-filtred_vids.length)+'/'+filtred_vids_count));
            var vid = filtred_vids.shift();
            /*
            var part=filtred_vids.splice(0,30);
            
            var vids=[];
            for (var i=0; i<part.length; i++) vids.push(part[i][1]);
            
            var params={vids:vids.join(','),album_id:to_album};
            if (cur.oid<0){
               params['gid']=Math.abs(cur.oid);
            }
            */
            // 
            dApi.call('video.addToAlbum', {target_id: cur.oid, album_id:to_album, owner_id: vid[0], video_id: vid[1]},function(r){
               if (vk_DEBUG) console.log(r);
               /* тут должно быть обновление инфы об альбомах, где это видео располагается.
               var arr=cur.videoList['all']['list'];
               for (var j=0;j<arr.length; j++){
                  for (var i=0;i<vids.length; i++){
                     if (arr[j] && arr[j][1]==vids[i]) arr[j][6]=to_album;
                  }
               }*/
               move(callback);
            });
         } else {
            if (vk_DEBUG) console.log('done move to :'+to_album);
            callback();
         }
      }
      
      ge('vk_apply_filter_btn').onclick=function(){
         var rx=ge('vk_filter_regex').value;
         
         var x=rx.match(/^\/(.+)\/([a-z]*)$/);  // parse regex  "|^http://ya\\.ru|i"
         if (x){
            rx=new RegExp(x[1],x[2]);
         }
         /*
         get not in albums list
         */
         function get_albumed_list(){
            var albumed = [];
            var fake_id = 10000000001;// наш фейковый

            for (var section in cur.videoList){ // собираем списко видео добавленных в любые альбомы
               var isAlbum = section.substr(0, 6) == 'album_';
               if (!isAlbum) continue;
               var album = section.substr(6, 20);
               if (album == fake_id) continue;
               var vids=cur.videoList[section].list;
               for (var i=0; i<vids.length; i++){
                  var vid = vids[i][1]
                  if (albumed.indexOf(vid) == -1)
                     albumed.push(vid);
               }         
            }
            return albumed;
         }
         ///////
         var in_albums_list = [];
         var arr=cur.videoList['all']['list'];
         function filter_arr(regex,all){
            arr=arr.filter(function(video){
               var title=winToUtf(video[3]);
               var vid=video[1];
               if (regex.indexOf){
                  regex=regex.toLowerCase();
                  title=title.toLowerCase();
               }
               return (in_albums_list.indexOf(vid)==-1 || all===true) && ((regex.indexOf?title.indexOf(regex)!=-1:regex.test(title)) || regex==null);
            });
         }
         if (isChecked('vk_vid_filter_all'))
            in_albums_list = get_albumed_list();
         filter_arr(rx,(isChecked('vk_vid_filter_all')!=1));
         filtred_vids=arr;
         filtred_vids_count=filtred_vids.length;
         (filtred_vids.length>0?show:hide)('vk_move_ctrls');
         
         if (vk_DEBUG) console.log(filtred_vids);
         var lst='<h4>'+IDL('Found')+': '+filtred_vids.length+'</h4>';
         for (var i=0; i<filtred_vids.length; i++){
            lst+='<div class="vid_filt_row"><a class="vid_filt_link" href="/video'+filtred_vids[i][0]+'_'+filtred_vids[i][1]+'">'+filtred_vids[i][3]+'</a>'+(filtred_vids[i][6]>0?'<span class="vid_alb_info">[album<b>'+filtred_vids[i][6]+'</b>]</span>':'')+'</div>';//title
         }
         if (filtred_vids[0])
            first_video=[filtred_vids[0][0],filtred_vids[0][1]];
         val(ge('vid_filt_list'), lst);
         
         ge('vk_run_move_btn').onclick=function(){
            move(function(){
               val(ge('vid_filt_list'), '');
               hide('vk_move_ctrls');
               val(ge('vid_move_progress'), '');
               dApi.call('video.restore',{oid:first_video[0],vid:first_video[1]},function(){});
               vkMsg('Done');
               
               if (isChecked('vk_vid_need_reload')) setTimeout(function(){nav.reload();},1200);
            });
         }
      };
      
      var apply_btn=geByTag1('button',ge('vk_apply_filter_btn'));
      if (cur.silent){
         lockButton(apply_btn);
         var app_chk_int=setInterval(function(){
            if (!ge('vk_apply_filter_btn'))
               clearInterval(app_chk_int);
            if (!cur.silent){
               unlockButton(apply_btn);
               clearInterval(app_chk_int);
            }
         });
      }
   },
   get_album:function(){
      var list = [];
      if (!window.mvcur || !window.mvcur.mvData) return '';
      var video= mvcur.mvData.videoRaw;
      var album_id=null;
      var album_link=null;
      var vid_data=null;
      
      if (cur.vSection == 'search' && cur.vStr) {
         if (!cur.searchData || !cur.vOrder) return '';
         var hd = cur.vHD ? cur.vHD : 0;
         var searchData = cur.searchData[cur.vStr + hd.toString() + cur.vOrder.toString()];
         if (!searchData) return;
         list=searchData.list;
      } else {
         if (!cur.videoList) return '';
         list = cur.videoList[cur.vSection];
      }
      if (!list) return '';
      for (var i = 0, len = list.length; i < len; i++) {
         if (list[i][0] + '_' + list[i][1] == video) {
            album_id=list[i][6];
            vid_data=list[i];
            album_link='/videos'+list[i][0]+'?section=album_'+album_id;
            break;
         }
      }
      return [album_id,album_link,vid_data];
   },
   add_to_group: function(oid,vid,to_gid){
      /*
      // Native add box to groop from Dec 2014 
      if (!to_gid){
         // TODO: make fake mvcur.mvData object
         showBox('/video', { act: 'add_to_club_pl_box', oid: oid, vid: vid }, {params: {width: 480, dark: 1, bodyStyle: 'padding: 0'},
           onDone: function(box) {
           }
         });
         return;
      }
      */
      if (to_gid){
         if (_vk_vid_add_box) _vk_vid_add_box.hide();
         dApi.call('video.add',{target_id:-to_gid,video_id:vid, owner_id:oid},function(r){
            var _vid='http://vk.com/video'+oid+'_'+vid;
            vkMsg('<b>OK</b><br>'+_vid+' -> club'+to_gid);         
         })
         return false;
      }
      
      
      
      // Old solution for add to group. Broken.
      /*
      if (to_gid){
         if (_vk_vid_add_box) _vk_vid_add_box.hide();
         var _vid='http://vk.com/video'+oid+'_'+vid;
         AjPost('al_search.php',{al:1,"c[q]":_vid,"c[section]":"video","c[sort]":2,"gid":to_gid,"no_adult":0},function(r,t){
             var params=t.match(/\{act:'a_add'[^\}]+\}/);
             if (params){
                params=eval('('+params[0]+')');
                ajax.post('al_video.php', params, {onDone: function(label) {
                  //vkMsg('Ololo');
                  label=label.replace(/color\:\s*#[A-Z0-9]+;?/i,"");
                  //alert(label);
                  vkMsg('<b>'+label+'</b><br>'+_vid+' -> club'+to_gid);
                }});     
             } else {
               //document.title('error')
               alert(_vid);
             }     
         });       
         return false;
      }
      */
      var show_box=function(){
         var html='';
         html+='<h4>'+IDL('EnterLinkToGroup')+'</h4><div class="clear_fix">\
           <input id="vidtogrouplink" type="text" placeholder="http://vk.com/club123" class="text fl_l" style="width:336px">\
           <div class="button_blue fl_l"><button style="padding: 2px 8px;" id="vidtogroup">OK</button></div>\
         </div><br>';
         html+='<h4>'+IDL('SelectGroup')+'</h4>';
         for (var i=0; i<_vk_vid_adm_gr.length;i++){
            html+='<a href="/'+_vk_vid_adm_gr[i].screen_name+'" onclick="return vk_videos.add_to_group('+oid+','+vid+','+_vk_vid_adm_gr[i].gid+');">'+_vk_vid_adm_gr[i].name+'</a><br>';
         }
         _vk_vid_add_box=vkAlertBox(IDL('Add'),html);
         var btn=ge('vidtogroup');
         var old_val=localStorage['vk_vid_to_group'];
         if (old_val) ge('vidtogrouplink').value=old_val;
         btn.onclick=function(){
            var url=ge('vidtogrouplink').value;
            if (!url || trim(url)=='') {
               alert('Incorrect link');
               return;
            }
            lockButton(btn);
            getGidUid(url,function(uid,gid){
               if (gid){
                  localStorage['vk_vid_to_group']=url;
                  vk_videos.add_to_group(oid,vid,gid);
               } else {
                  alert('Incorrect link');
                  unlockButton(btn);
               }
               
            });
         }
      };
      
      if (_vk_vid_adm_gr==null){
      dApi.call('groups.get',{extended:1,filter:'admin'},function(r){
         //console.log(r)
         r.response.shift();
         _vk_vid_adm_gr=r.response;
         show_box();
         });
      } else {
         show_box();
      }
      return false;
   }
};

function vkVideoNullAlbum(){
   var p=ge('video_summary_tabs');
   if (p && !ge('video_section_album_0')){
	  p.appendChild(/*vkCe('a',attrs,IDL('NotInAlbums'))*/
                     se('<div id="video_section_album_0" class="fl_l summary_tab" style="">\
                       <a class="summary_tab2" href="#" onclick="return vk_videos.show_null_album();">\
                         <div class="summary_tab3">\
                           <nobr>'+IDL('NotInAlbums')+'</nobr>\
                         </div>\
                       </a>\
                     </div>')                  
                  );
   }   
}

function vkVidEditAlbumTitle(album_id,add_buttons){ // Вероятно устарело. Не мешало бы прикрутить в новый интерфейс на превьюшку альбома
   if (cur.editmode && cur.albums){
      if (add_buttons){
         for (var aid in cur.albums){
            var el=ge('video_section_album_'+aid);
            
            var text=el.innerHTML;
            if (text.indexOf('album_title_'+aid)!=-1) continue;
            val(el, '<span id="album_title_'+aid+'">'+text+'</span><div class="fl_r vk_edit_ico" onclick="vkVidEditAlbumTitle('+aid+');" onmousedown="cancelEvent(event);"> </div>');
         }
         return;
      }
          
      var aBox = new MessageBox({title: 'Edit Album Title'});
      aBox.removeButtons();
      
      var edit_done=function(){  
            var _val=ge('albumedit_'+album_id).value;
            var params={
               title:_val,
               album_id:album_id
            };
            if (cur.oid<0) 
               params['gid'] = Math.abs(cur.oid);
               
            dApi.call('video.editAlbum',params,function(r){
               if (r.response==1)
                  val(ge('album_title_'+album_id), _val);
               else
                  alert('Rename error');
            });
            aBox.hide();            
      };      
      aBox.addButton(getLang('box_cancel'),aBox.hide, 'no');
      aBox.addButton(getLang('box_save'),edit_done,'yes');
      var html='<input type="text" id="albumedit_'+album_id+'" style="width:380px"/>';
      aBox.content(html);
      aBox.show();
      ge('albumedit_'+album_id).onkeydown=function(ev){
         ev = ev || window.event;
         if (ev.keyCode == 10 || ev.keyCode == 13) {
            edit_done();
            cancelEvent(ev);
         }         
      };
      ge('albumedit_'+album_id).value=cur.albums[album_id];
   } 
}

function vkVideShowAdder(){
      var rclass='vk_vid_add_hidden', 
          aclass='vk_vid_add_visible',
          b=true;
      if (window.vk_vid_list_adder){
         rclass='vk_vid_add_visible';
         aclass='vk_vid_add_hidden';
         b=false;         
      }
      var els=geByClass(rclass);
      for (var i=els.length-1;i>=0;i--){
         removeClass(els[i],rclass);
         addClass(els[i],aclass);
         window.vk_vid_list_adder=b;
      }
}

function vkVideoAddOpsBtn(){
   var p=geByClass('t_r',ge('video_tabs'))[0];
   if (!ge('vk_video_ops')){
      var oid=cur.oid;
      var aid=((cur.vSection || "").match(/album_(\d+)/) || [])[1];
      
      var btn=vkCe('a',{id:'vk_video_ops', "class":'nobold _fl_r'},'[ <img src="/images/icons/help_stest_tick.gif"> ]');
      
      var p_options = [];
      if (getSet(66)=='y'){
         p_options.push({l:IDL('AddMod'), onClick:vkVideShowAdder}); 
      }
      if (getSet(77)=='y')
         p_options.push({l:IDL('DelAll',2), onClick:vk_videos.clean}); 
      if (cur.canEditAlbums) 
         p_options.push({l:IDL('VideoMove'), onClick:vk_videos.mass_move_box}); 
      
      if (window.vk_vid_down)
         p_options.push(vk_vid_down.vkVideoGetLinksBtn());
      /*
      p_options.push({l:IDL('Links'), onClick:function(item) {
            //
      }});
      p_options.push({l:IDL('Add'), h:'/album'+oid+'_'+aid+'?act=add'});
      */
      
      
      p_options=p_options.concat(vk_plugins.videos_actions(oid,aid));
      if (p_options.length>0){
         p.insertBefore(vkCe('span',{'class':'divide fl_l'},'&nbsp;'),p.firstChild);
		 p.insertBefore(btn,p.firstChild);
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            cur.vkAlbumMenu = new DropdownMenu(p_options, {
              target: ge('vk_video_ops'),
              containerClass: 'dd_menu_posts',
              updateTarget:false,
              //offsetLeft:-15,
              showHover:false
            });
         });
      }
   }
}

var vk_oid_names={};
function vkVidShowOwnerName(oid,el){
   //el=el.getElementsByTagName('span')[0] || el;
   if (el && !el.hasAttribute('ok')){
      val(el, vkLdrMiniImg);
      var code='';
      if (oid>0){
         code='var u=API.users.get({uids:'+oid+'}); return u[0].first_name+" "+u[0].last_name;';
      } else{
         code='var g=API.groups.getById({gid:'+Math.abs(oid)+'}); return g[0].name;';
      }
      var view=function(){
         val(el, vk_oid_names[""+oid]);
         el.setAttribute('ok',true); 
      };
      if (vk_oid_names[""+oid])
         view();
      else
         dApi.call('execute',{code:code},function(r){
            vk_oid_names[""+oid]=r.response;
            view();
         });
   }
}

vkVidVars=null;

/* AUDIO */

function vkAudioPlayer(){
   /*
    && INJ_AUDIOPLAYER_DUR_MOD){
      window.vkAudioDurMod=function(res){   return vkAudioDurSearchBtn(res,audioPlayer.lastSong[5]+' - '+audioPlayer.lastSong[6],audioPlayer.id) }
      Inj.Replace('audioPlayer.setCurTime','val(dur, res','dur.innerHTML = vkAudioDurMod(res)'));
      Inj.Replace('audioPlayer.setGraphics','val(dur, res','dur.innerHTML = vkAudioDurMod(res)'));
   }*/
   vk_audio_player.inj();
}

vk_audio_player={
   gpCtrlsStyle:'\
   .vka_ctrl {  background: url(/images/icons/audio_icons.png) no-repeat scroll 0 0 transparent; margin:0 5px; opacity:0.7; height: 11px;  width: 13px;  float: left;}\
   .vka_ctrl:hover{opacity:1;}\
   .vka_ctrl.prev {  background-position: -3px -52px;}\
   .vka_ctrl.next {  background-position: -18px -52px;}\
   .vka_ctrl.add  {  background-position: -80px -52px;}\
   .vka_ctrl.vol  {  background-position: -65px -51px;}\
   .vka_ctrl.vol .vol_panel { display:none; position:absolute; background-color: #D9E0E8; border-radius: 3px; width:8px; height:57px; padding: 5px;}\
   .vka_ctrl.vol .vol_panel.vis{ display:block; }\
   .vka_ctrl.vol:hover .vol_panel { display:block;}\
   #gp.reverse .vka_ctrl.vol .vol_panel{margin-top: -54px;}\
   .gp_vka_ctrls{position:absolute; width:137px; margin-top:34px; margin-left: 5px; padding:3px; border-radius:0 0 4px 4px; background:rgba(218, 225, 232, 0.702); }\
   ',
   inj:function(){
      if (getSet(75)=='y') vk_audio_player.gpCtrlsInit();
      if (getSet(85)=='y') Inj.Start('audioPlayer.scrollToTrack','return;');
      if (getSet(104)=='y') Inj.Before('audioPlayer.initPlayer','browser.flash','false && ');
   },
   gpCtrlsInit:function(){
      Inj.End('audioPlayer.setGraphics','vk_audio_player.gpCtrls();');
   },
   gpCtrls:function(){
      var p=ge('audio_global');
      if (!p || p.innerHTML.indexOf('gp_vka_ctrls')!=-1) return;
      var ctrl=vkCe('div',{'class':'gp_vka_ctrls', 'id':'gp_vka_ctrls'},'\
                     <a class="vka_ctrl prev" onclick="audioPlayer.prevTrack(); return false;"></a>\
                     <a class="vka_ctrl next" onclick="audioPlayer.nextTrack(); return false;"></a>\
                     <a class="vka_ctrl add" onclick="audioPlayer.addCurrentTrack(); return false;"></a>\
                     <span class="vka_ctrl vol" onmouseover="vk_audio_player.gpUpdVolSlider();"><div class="vol_panel" id="gp_vol_panel"></div></span>');
      p.insertBefore(ctrl,p.firstChild);
   },
   last_vol:-1,
   vol_slider:null,
   gpUpdVolSlider:function(){
      var el=ge('gp_vol_panel');
      disableSelectText(el);
      var t=null;
      var cur_vol=Math.round(audioPlayer.player.getVolume() * 100);
      if (!hasClass(el,'vis') && vk_audio_player.last_vol>-1 && vk_audio_player.last_vol!=cur_vol){
         vk_audio_player.last_vol=cur_vol;
         vk_v_slider.sliderUpdate(cur_vol,cur_vol,'gp_vol_panel');
         vk_v_slider.sliderApply('gp_vol_panel');
      }
      if (vk_audio_player.last_vol==-1/*!=cur_vol*/){
         vk_audio_player.last_vol=cur_vol;
         val(el, '');
         
         var set=function(volume){
            //console.log(volume);
            addClass(el,'vis');
            clearTimeout(t);
            t=setTimeout(function(){
               audioPlayer.player.setVolume(volume / 100);
               setCookie('audio_vol', Math.round(volume), 365);
               
               var _a=audioPlayer;
               if (_a.controls) {
                  for (var i in _a.controls) {
                     var obj = _a.controls[i];
                     if (obj.volume) setStyle(obj.volume, {width: volume + '%'})
                  }
               }
               var aid = currentAudioId();
               if (ge('player' + aid)) {
                  if (ge('audio_vol_line' + aid)) {
                    setStyle(ge('audio_vol_line' + aid), {width: volume + '%'});
                  }
               }
        
            },10)
         };
         vk_v_slider.init('gp_vol_panel',100,cur_vol,function(){removeClass(el,'vis');},function(vol){ set(vol);  },50); 
         removeClass(el,'vis');
      }
      //vk_v_slider.sliderUpdate(vol,vol,'gp_vol_panel');
   }
};


function vkAudios(){		
	vk_audio.inj();
}
function vkAudioPage(){
	window.vk_au_down && vk_au_down.page();
   vkAudioBtns();
	vkAudioDelDup(true);
   vkAudioRefreshFriends();
}

vk_audio={
   css:'\
      .album_choose{display: block;float: left; padding: 6px 10px; min-width: 175px;}\
      #vk_links_to_audio_on_page{padding: 10px; text-align:center; display:block;}\
     #albumBanned .post_dislike_icon{opacity: 1;}\
     .vk_deldup_btn_wrap{padding: 0 10px;}\
   ',
   album_cache:{},
   inj_common:function(){
      if (getSet(0)=='y') Inj.Start('playAudioNew','if (vk_audio.prevent_play_check()) return;'); // для предотвращения воспроизведения при нажатии на "скачать"
   },
   remove_trash:function(s){
      s=vkRemoveTrash(s);
      s=s.replace(/\[\s*\]|\(\s*\)|\{\s*\}/g,'');
      s=s.replace(/[\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+/g,'\u2013').replace(/\u2013\s*\u2013/g,'\u2013');
      s=s.replace(/[\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+$/,'');// ^[\s\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+
      return s;
   },
   process_node:function(node){
      if (getSet(94) == 'y'){// clean titles
         var nodes=geByClass('audio',node);
         for (var i=0; i<nodes.length; i++){
            FindAndProcessTextNodes(nodes[i],function(mainNode,childItem){
               var el = mainNode.childNodes[childItem];
               if (el.nodeValue && !/^[\u2013\s]+$/.test(el.nodeValue)){
                  //console.log('>>',el.nodeValue);
                  el.nodeValue=vk_audio.remove_trash(el.nodeValue);
                  //console.log('<<',el.nodeValue);
               }
               return childItem;
            });
         }
      }
      vk_audio.audio_node(node); 
   },
   
   inj:function(){
      if (getSet(0)=='y' || getSet(43)=='y'){
         Inj.Before("Audio.showRows","while (au.","vk_audio.process_node(au);");
         Inj.After('Audio.searchRequest',/cur.sPreload.innerHTML.+preload;/i,'vk_audio.process_node(cur.sPreload);');
         Inj.After('Audio.searchRequest',/cur.sContent.innerHTML.+res;/i,'vk_audio.process_node(cur.sContent);');
         Inj.Before('Audio.loadRecommendations','if (json)','if (rows) rows=vkModAsNode(rows,vk_audio.process_node); if(preload) preload=vkModAsNode(preload,vk_audio.process_node); ');
         Inj.Replace('Audio.hideRecommendation', "geByTag1('a', title_wrap)", "geByTag1('a', geByTag1('b', title_wrap))");
      }
   },
   audio_node:function(node){
     // get mp3 url maybe from /audio?act=reload_audio&al=1&audio_id=132434853&owner_id=10723321

     if ((node || ge('content')).innerHTML.indexOf('play_new')==-1 && (!_pads.cur || _pads.shown!="mus" || setTimeout(function(){vk_audio.audio_node(_pads.cur.aContent)},0))) return;
     var smartlink=(getSet(1) == 'y');
     var download=(getSet(0) == 'y');
     //var clean_trash=getSet(94) == 'y';
     if (!download && getSet(43) != 'y') return;
     //InitAudiosMenu();

     var divs = geByClass('play_new',node);
     for (var i=0; i<divs.length; i++){
        //var onclk=divs[i].getAttribute('onclick');
        if (!divs[i].id || divs[i].hasAttribute('vk_ok')) continue;
        if (divs[i].id.split('play')[1]){
            var id=divs[i].id.split('play')[1];
          //if (ge('down'+id)) continue;
            var data = (node?divs[i].parentNode.parentNode.getElementsByTagName('input')[0]:ge('audio_info' + id)).value.split(',');
            var url=data[0];
            //if (url=='') continue;
            if (url.indexOf('/u00000/')!=-1) continue;
            var anode=(node?divs[i].parentNode.parentNode.parentNode:ge('audio'+id));
            //if (clean_trash) vk_audio.process_node(anode);
             var el=geByClass("duration",anode )[0];
             var spans=el.parentNode.getElementsByTagName('span');
             var span_title=geByClass('title',anode )[0];
             if (window.nav && nav.objLoc[0]=='search' && !span_title){
                for (var x=0; x<spans.length;x++)
                  if (spans[x].id && spans[x].id.indexOf('title')!=-1) {span_title=spans[x]; break;}
                  //searcher.showMore
             }
             //vklog('Audio: id'+id+' '+ge('title'+id));
             (geByClass('title_wrap',el.parentNode)[0] || el.parentNode).appendChild(vkCe('small',{"class":"duration_ fl_r",id:"vk_asize"+id, "url":url, dur:data[1]}));

              var name=el.parentNode.getElementsByTagName('b')[0].innerText+' - '+(span_title || ge('title'+id) || spans[1] || spans[0]).innerText;
              name=vkCleanFileName(name);
              if (smartlink) {url+=(url.indexOf('?')>0?'':'?')+vkDownloadPostfix()+'&/'+vkEncodeFileName(name)+'.mp3';}//normal name
              //if (SearchLink && el){val(el, vkAudioDurSearchBtn(el.innerText,name,id));/* "<a href='/search?c[section]=audio&c[q]="+name+"'>"+el.innerText+"</a>";*/}
            if (download){
               divs[i].setAttribute('style','width:17px;');
               divs[i].setAttribute('vk_ok','1');
               window.vk_au_down && vk_au_down.make_d_btn(url,divs[i],id,name+'.mp3');
            }
            var btn=geByClass('down_btn',anode)[0] || geByClass('play_new',anode)[0];
            if (!btn) continue;
            btn.setAttribu7e('onmouseover',"vk_audio.get_size('"+id+"',this);");
         }
     }
   },
   thread_count:0,
   get_size:function(id,_el,without_tip){
      if (!without_tip) 
         vkShowAddAudioTip(_el,id);
      if (vk_audio.thread_count>=AUDIO_INFO_LOAD_THREADS_COUNT){
         var t = setInterval(function(){
            if (vk_audio.thread_count<AUDIO_INFO_LOAD_THREADS_COUNT){
               clearInterval(t);
               vk_audio.get_size(id,_el,without_tip);
            }
         },50);
         return;
      }
      var rb = true;
      if (getSet(43)!='y') return;
      var WAIT_TIME=4000;
      var el=ge("vk_asize"+id);
      if (el && !el.hasAttribute('getsize_ok')){
         el.setAttribute('getsize_ok',true);
         val(el, vkLdrMiniImg);
         var dur=el.getAttribute('dur');
         var reset=setTimeout(function(){
            el.removeAttribute('getsize_ok');
            val(el, '');
            vk_audio.thread_count--;
            rb = false;
         },WAIT_TIME);
         vk_audio.thread_count++;
         XFR.post(el.getAttribute('url'),{},function(h,l){
            clearTimeout(reset);
            if (rb){
               vk_audio.thread_count--;
            }
            if (dur>0 && l>0){
               var kbit=l/128;
               var kbps= Math.ceil(Math.round(kbit/dur)/16)*16;
               var info = [];
               if (AUDIO_INFO_SHOW_FILESIZE) info.push(vkFileSize(l,1));
               if (AUDIO_INFO_SHOW_BITRATE)  info.push(kbps+'Kbps');
               val(el, info.join(' | '));
               el.setAttribute('getsize_ok',true);
               
               var au_el = ge('audio'+id);
               if (au_el){
                  au_el.setAttribute('kbps',kbps);
                  au_el.setAttribute('filesize',l);
               }
            } else {
               val(el, 'o_O');
            }
            /* костыли с педалями и тормозами */
            if (window.sorter && sorter.update && ge('audio'+id) && (ge('audio'+id).parentNode || {}).sorter)
               sorter.update(ge('audio'+id));
            
         },true);	
      }
   },  
   
   play_blocked:false,
   prevent_play_check:function(){
      if (vk_audio.play_blocked){
         vk_audio.play_blocked=false;
         return true;
      }
      return false;
   },
   prevent_play:function(){
      vk_audio.play_blocked=true; 
   },
   in_box_move:function(full_aid){
      //return;
      var x=full_aid.split('_');
      var oid=parseInt(x[0]);
      var aid=parseInt(x[1]);
      
      var cur_offset=0;
      var alb_count=100;
      var albums=[];
      var get_albums=function(callback){
         if (vk_audio.album_cache[''+oid]) {
            callback(vk_audio.album_cache[''+oid]);
            return;
         }
         var params={count:100,offset:cur_offset};
         params[oid<0?'gid':'uid']=Math.abs(oid);
         dApi.call('audio.getAlbums',params,function(r){
            var _albums=r.response;
            alb_count=_albums.shift();
            
            albums=albums.concat(_albums);
            if (_albums.length<100){
               vk_audio.album_cache[''+oid]=albums;
               callback(albums);
            } else {
               cur_offset+=100;
               get_albums(callback);
            }   
         });
      };
      var p=ge('audio_extra_link');
      if (!p) return;
      var div=vkCe('div',{id:'vk_audio_mover', 'class':'audio_edit_row clear_fix'},'\
                    <div class="audio_edit_label fl_l ta_r">'+IDL('SelectAlbum',1)+'</div>\
                    <div class="audio_edit_input fl_l"><div id="vk_audio_album_selector"></div><div id="vk_au_alb_ldr">'+vkLdrImg+'</div></div>\
                  ');
      p.parentNode.insertBefore(div,p); 
      
      get_albums(function(list){
         //console.log(list);
         //var p=ge('audio_extra_link');
         //if (!p) return;
         
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            //var albums=[[0,"qwe"],[1,"qaz"]];//_vk_albums_list_cache[''+oid];
            var items=[];
            items.push(['0',IDL('NotInAlbums')]);
            for (var i=0; i<list.length;i++){
               items.push([list[i].album_id,list[i].title]);
            }
            
            var def_aid=(cur.audios[aid] || [])[8] || 0;
            cur.vk_auMoveToAlbum = new Dropdown(ge('vk_audio_album_selector'), items, {
                 width: 298,
                 selectedItems: [def_aid],
                 autocomplete: (items.length > 7),
                 onChange: function(val) {
                   if (!intval(val)) {
                     cur.vk_auMoveToAlbum.val(0);
                   }
                   var to_album=cur.vk_auMoveToAlbum.val();
                   show('vk_au_alb_ldr');
                   
                   //*
                   var params={aids:aid,album_id:to_album};
                   if (oid<0) params['gid']=Math.abs(oid);
                   dApi.call('audio.moveToAlbum',params,function(r){
                     if(r.response==1){
                        cur.audios[aid][8]=to_album;
                        Audio.generateAlbums();
                        hide('vk_au_alb_ldr');
                     } 
                   });
                   //*/
                   
                   /*
                   ajax.post(Audio.address, {act:'move_to_album', album_id:to_album, audio_id:aid, gid:cur.gid, hash:cur.hashes.move_hash}, {
                     onDone: function(text) {
                        alert(text);
                        cur.audios[aid][8]=to_album;
                        Audio.generateAlbums();
                        hide('vk_au_alb_ldr');
                     }
                   });
                   */
                 }
            });
            hide('vk_au_alb_ldr');
         });
         
         //var btn=geByTag1('button',div).parentNode;
         
      });
      //alert(full_aid);
   },
   tpl:'<div class="choose_audio_row clear_fix">\
     <div class="audio_content fl_l">\
       <div class="audio" id="audio%oid_%aid_choose" onmouseover="addClass(this, \'over\');" onmouseout="removeClass(this, \'over\');">\
     <a name="%oid_%aid_choose"></a>\
     <div class="area clear_fix" onclick="if (cur.cancelClick){ cur.cancelClick = false; return false;} playAudioNew(\'%oid_%aid_choose\')">\
       <table cellspacing="0" cellpadding="0" width="100%"><tr><td>\
             <div class="play_btn_wrap"><div class="play_new" id="play%oid_%aid_choose"></div></div>\
             <input type="hidden" id="audio_info%oid_%aid_choose" value="%url,%duration" />\
           </td><td class="info">\
             <div class="title_wrap fl_l" onmouseover="setTitle(this)"><b>%artist</b> &ndash; <span class="title" id="title%oid_%aid_choose">%title</span></div>\
             <div class="duration fl_r" onmousedown="if (window.audioPlayer) audioPlayer.switchTimeFormat(\'%oid_%aid_choose\', event);" onclick="cancelEvent(event)">%dur</div>\
       </td></tr></table>\
       <div id="player%oid_%aid_choose" class="player" ondragstart="return false;" onselectstart="return false;" onclick="event.cancelBubble = true;">\
         <table cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="width: 100%;">\
               <div id="audio_pr%oid_%aid_choose" class="audio_pr" onmouseover="addClass(this, \'over\')" onmouseout="removeClass(this, \'over\'); removeClass(this, \'down\')" onmousedown="addClass(this, \'down\'); audioPlayer.prClick(event);" onmouseup="removeClass(this, \'down\')">\
                 <div id="audio_white_line%oid_%aid_choose" class="audio_white_line" onmousedown="audioPlayer.prClick(event);"></div>\
                 <div id="audio_back_line%oid_%aid_choose" class="audio_back_line" onmousedown="audioPlayer.prClick(event);"></div>\
                 <div id="audio_load_line%oid_%aid_choose" class="audio_load_line" onmousedown="audioPlayer.prClick(event);"></div>\
                 <div id="audio_pr_line%oid_%aid_choose" class="audio_progress_line" onmousedown="audioPlayer.prClick(event);">\
                   <div id="audio_pr_slider%oid_%aid_choose" class="audio_slider"></div>\
                 </div>\
               </div>\
             </td><td>\
               <div id="audio_vol%oid_%aid_choose" class="audio_vol" onmouseover="addClass(this, \'over\')" onmouseout="removeClass(this, \'over\'); removeClass(this, \'down\')" onmousedown="addClass(this, \'down\'); audioPlayer.volClick(event)" onmouseup="removeClass(this, \'down\')">\
                 <div id="audio_vol_white_line%oid_%aid_choose" class="audio_vol_white_line" onmousedown="audioPlayer.volClick(event);"></div>\
                 <div id="audio_vol_back_line%oid_%aid_choose" class="audio_load_line" onmousedown="audioPlayer.volClick(event);"></div>\
                 <div id="audio_vol_line%oid_%aid_choose" class="audio_progress_line" onmousedown="audioPlayer.volClick(event);">\
                   <div id="audio_vol_slider%oid_%aid_choose" class="audio_slider" onmousedown="audioPlayer.volClick(event);"></div>\
                 </div>\
               </div>\
             </td></tr></tbody></table>\
       </div>\
     </div>\
   </div>\
     </div>\
     <div class="fl_r">\
       <a class="choose" onclick="cur.chooseMedia(\'audio\', \'%oid_%aid\', {performer: \'%artist\', title: \'%title\', info: val(\'audio_info%oid_%aid_choose\'), duration: \'%dur\'})">%add</a>\
     </div>\
   </div>\
   ',
   choose_album:function(oid){
      var PER_PAGE=100;
      var albums=[];
      var scan=function(offset){
         var params={count:PER_PAGE,offset:offset};
         if (oid){
            params[oid<0?'gid':'uid']=Math.abs(oid);
         }
         dApi.call('audio.getAlbums',params,function(r){
            var _albums=(r.error && r.error.error_code==15)?[0]:r.response;
            if (r.error) dApi.show_error(r);
            var count=_albums.shift();
            albums=albums.concat(_albums);
            if (albums.length<count){
               scan(offset+PER_PAGE)
            } else {
               var html='';
               for (var i=0; i<albums.length; i++){
                  var a=albums[i];
                  html+='<a class="album_choose" href="#" onclick="return vk_audio.choose_album_item('+a.owner_id+',\''+a.album_id+'\');"><b class="vk_audio_icon"></b> '+a.title+'</a>';
               }
               html+='<br class="clear">';
                val(ge('choose_audio_rows'), html);
            }
            //// done?
            //console.log(r)
         });
      };
      scan(0);
      //*
      val(ge('choose_audio_rows'), vkBigLdrImg);//albums;
      hide('audio_choose_more');
      //*/
      return false;
   },
   choose_album_item:function(oid,aid){
      var PER_PAGE=20;
      //vkMakePageList(0,100,'#','return page(%%);',PER_PAGE,true)
      val(ge('choose_audio_rows'), vkBigLdrImg);
      var params={album_id:aid};// count, offset
      params[oid<0?'gid':'uid']=Math.abs(oid);
     
     var items=null;

      dApi.call('audio.get',params,function(r){
         items=r.response;
         page(0);         
      });

      var page=function(offset){
         var pages=Math.floor(items.length/PER_PAGE);
         var html='';
         var pages_html='<div class="clear clear_fix ">\
            <ul class="page_list fl_r">'+vkMakePageList(offset/PER_PAGE,pages,'#','return vk_audio._choose_album_item_page(%%);',1,true)+'</ul>\
         </div>';
         html+=pages_html;
         
         var max_offset=Math.min(offset+PER_PAGE,items.length);
         for (var i=offset; i<max_offset; i++){
            var au=items[i];            
            html+=vk_audio.tpl.replace(/%add/g,IDL('Add'))
                              .replace(/%oid/g,au.owner_id)
                              .replace(/%aid/g,au.aid)
                              .replace(/%artist/g,au.artist)
                              .replace(/%title/g,au.title)
                              .replace(/%dur/g,vkFormatTime(au.duration))//formated
                              .replace(/%duration/g,au.duration)// raw
                              .replace(/%url/g,au.url);
         }
         html+=pages_html;
         html+='<br class="clear">';
         val(ge('choose_audio_rows'), html);
         return false;
      };
      vk_audio._choose_album_item_page=function(_offset,rev){
         return page(_offset*PER_PAGE,rev);
      };
      return false;
   },
   links_to_audio_on_page:function(){
      var links=[]; 
      each(geByClass('vkaudio_down'),function(i,el){
         links.push(geByTag('a',el)[0].href)
      }); 
     vkAlertBox('Links','<textarea style="width:560px; height:300px;">'+links.join('\n')+'</textarea>').setOptions({width:'600px'});
     return false;
   },
   search_track:function(event, name){
      cur.aSearch.setValue(name);
      cur.forceNoAutoComplete = true;
      if (event) {
      cur.searchTypeMenu.value = 0;
      cur.searchTypeChanged({target: {index: 0}}, true);
      }
      Audio.updateList(null, cur.aSearch);
      if (event) cancelEvent(event);
   },
   add_to_group:function(oid,aid,to_gid){//vk_audio.add_to_group(oid,aid,to_gid)
         if (to_gid){
            if (vk_audio._add_box) vk_audio._add_box.hide();
            dApi.call('audio.add',{aid:aid,oid:oid,gid:Math.abs(to_gid)},function(r){
               if (r.response){
                  vkMsg('<b><a href="/audio?id=-'+Math.abs(to_gid)+'&audio_id='+r.response+'">'+r.response+'</a></b><br>'+aid+' -> club'+to_gid);
               } else {
                  alert('aid:'+aid+'\n'+'Add error');
               }
            });      
            return false;
         }
         var show_box=function(){
            var html='';
            html+='<h4>'+IDL('EnterLinkToGroup')+'</h4><div class="clear_fix">\
              <input id="aidtogrouplink" type="text" placeholder="http://vk.com/club123" class="text fl_l" style="width:336px">\
              <div class="button_blue fl_l"><button style="padding: 2px 8px;" id="aidtogroup">OK</button></div>\
            </div><br>';
            html+='<h4>'+IDL('SelectGroup')+'</h4>';
            for (var i=0; i<_vk_vid_adm_gr.length;i++){
               html+='<a href="/'+_vk_vid_adm_gr[i].screen_name+'" onclick="return vk_audio.add_to_group('+oid+','+aid+','+_vk_vid_adm_gr[i].gid+');">'+_vk_vid_adm_gr[i].name+'</a><br>';
            }
            vk_audio._add_box=vkAlertBox(IDL('Add'),html);
            var btn=ge('aidtogroup');
            var old_val=localStorage['vk_aid_to_group'];
            if (old_val) ge('aidtogrouplink').value=old_val;
            btn.onclick=function(){
               var url=ge('aidtogrouplink').value;
               if (!url || trim(url)=='') {
                  alert('Incorrect link');
                  return;
               }
               lockButton(btn);
               getGidUid(url,function(uid,gid){
                  if (gid){
                     localStorage['vk_aid_to_group']=url;
                     vk_audio.add_to_group(oid,aid,gid);
                  } else {
                     alert('Incorrect link');
                     unlockButton(btn);
                  }
                  
               });
            }
         };
         
         if (_vk_vid_adm_gr==null){
         dApi.call('groups.get',{extended:1,filter:'admin'},function(r){
            //console.log(r)
            r.response.shift();
            _vk_vid_adm_gr=r.response;
            show_box();
            });
         } else {
            show_box();
         }

      return false;
   }
};

function vkAudioRefreshFriends(){
   var p=ge('audio_more_friends');
   if (!p || ge('vk_audio_fr_refresh')) return;
   var vk_audio_fr_refresh = vkCe('a',{id:'vk_audio_fr_refresh'},'&#8635;');
   vk_audio_fr_refresh.onclick = function(){ cur.shownFriends=[]; Audio.showMoreFriends(); return false; };
   p.parentNode.insertBefore(vk_audio_fr_refresh,p);
}
function vkAudioEditPage(){
	vkCleanAudioLink();
}

function vkCleanAudioLink(){
	if (getSet(77)=='y')
      if (!ge('vk_clean_audios') && ge('audio_actions')){
         ge('audio_actions').innerHTML+='<span class="divide">|</span><a id="vk_clean_audios" href="#" onclick="vkCleanAudios(); return false;">'+IDL('DelAll')+'</a>';
      }
}

function vkCleanAudios(){
	
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
		val(ge('vk_del_msg'), vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %'));
		var aid=mids[del_offset];
		if (!aid){
			val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
			del_offset=0;
			callback();
		} else
		dApi.call('audio.delete', {oid:cur.oid,aid:aid},function(){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	
	var scan=function(){
		mids=[];
		val(ge('vk_del_msg'), vkProgressBar(1,1,310,' '));
		val(ge('vk_scan_msg'), vkProgressBar(0,2,310,IDL('listreq')+' %'));
		var params={};
		params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);
		dApi.call('audio.get',params,function(r){
			if (abort) return;
			var ms=r.response;
			if (!ms.length){
				deldone();
				return;
			}
			val(ge('vk_scan_msg'), vkProgressBar(2,2,310,IDL('listreq')+' %'));
			for (var i=0;i<ms.length;i++) mids.push(ms[i].aid);
			vklog(mids);
			del(deldone);	
		});
	};
	var run=function(){
		
      box=new MessageBox({title: IDL('DelAudios'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(){abort=true; box.hide();},'no');
		var html='</br><div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
  
   var owner=(cur.oid>0?"id":"club")+Math.abs(cur.oid);
	vkAlertBox(IDL('DelAudios'),'<b><a href="/'+owner+'">'+owner+'</a></b><br>'+IDL('DelAllAutiosConfirm'),run,true);
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
      var l = geByTag1('a', art);
      if (l) art = l;
      var reArr = ['<span>', '</span>', '<span class="match">'];
      var re = new RegExp(reArr.join('|'), "gi");
      art = art.innerHTML.replace(sr,'').replace(re, '');
      title = geByClass1('title', nfo);
      if (!title) title = ge('title'+_aid) || $x(".//span[@id='title" + _aid + "']", node)[0];//t_node;
      l = geByTag1('a', title);
      if (l) title = l.innerHTML;
      else title = title.innerHTML;
      title = title.replace(re,'').replace(sr,'');
      var dur = geByClass1('duration', nfo).innerHTML;
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

var vk_del_dup_check_size=false;
function vkAudioDelDup(add_button,btn){
	if (add_button){
		if (nav.objLoc[0]=='audio' || /audios-?\d+/.test(nav.objLoc[0] || '')){
			var p=ge('audio_search_filters');
			if (ge('vk_deldup_btn') || !p) return;
			p.appendChild(vkCe('div',{"class":'audio_filter_sep'}));
			p.appendChild(vkCe('div',{"class":'audio_search_filter'},'<div id="vk_deldup_btn"  style="text-align:center;">'+vkButton(IDL('DeleteDuplicates'),"vkAudioDelDup(null,this)")+'</div>' ));
			p.appendChild(vkCe('div',{"style":'padding-top:10px;', id:"deldup_by_size"}));
			p.appendChild(vkCe('div',{"class":'audio_search_filter'},'<div id="vk_deldup_text"  style="text-align:center;"></div>' ));

			new Checkbox(ge("deldup_by_size"), {  width: 150,  
											  checked:vk_del_dup_check_size,  
											  label: IDL('DupDelCheckSizes'),
											  onChange: function(state) { vk_del_dup_check_size = (state == 1); }
											});
		} else if (nav.objLoc[0]=='search' && nav.objLoc['c[section]']=='audio'){
			var p=ge('search_filters');
			if (ge('vk_deldup_btn') || !p) return;
			var cont=vkCe('div',{"class":'vk_deldup_btn_wrap'});
         p.appendChild(cont);
            var el = vkCe('div',{"class":'no_select filter_open'},IDL('Duplicates'));
            el.setAttribu7e("onclick","searcher.toggleFilter(this, 'vk_del_dup');");
            el.setAttribu7e("onselectstart","return false");
            cont.appendChild(el);
			cont.appendChild(vkCe('div',{id:"vk_del_dup"},'\
				<div class="audio_search_filter"><div id="vk_deldup_btn"  style="text-align:center; margin-bottom: 5px;">'+vkButton(IDL('DeleteDuplicates'),"vkAudioDelDup(null,this)")+'</div></div>\
				<div style="padding-top:10px;" id="deldup_by_size"></div>\
				<div id="vk_deldup_text"  style="text-align:center;"></div>\
				')
			);
			
			new Checkbox(ge("deldup_by_size"), {  width: 150,  
														  checked:vk_del_dup_check_size,  
														  label: IDL('DupDelCheckSizes'),
														  onChange: function(state) { vk_del_dup_check_size = (state == 1); }
														});
		}
		return;
	}

	var check_lite=function(){
		lockButton(btn);
		var dcount=0;
		var adata={};
		var divs = geByClass('play_new').slice();
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
		val(ge('vk_deldup_text'), IDL('Deleted')+': '+dcount);
		unlockButton(btn);
	};
	var check_pro=function(){
		lockButton(btn);
		var adata={};
		var urls=[];
		var dcount=0;
		var divs = geByClass('play_new').slice();
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
			val(ge('vk_deldup_text'), IDL('Deleted')+': '+dcount);
			unlockButton(btn);
		};
		var get_sizes=function(){
			if (urls[idx]){
				val(ge('vk_deldup_text'), vkProgressBar(idx,urls.length,150,idx+'/'+urls.length));
				XFR.post(urls[idx][0],{},function(h,l){
					adata[urls[idx][1]].size=l;
					idx++;
					get_sizes();
				},true);	
			} else {
				re_dup();
			}
		};
		get_sizes();
	};
	var tstart=unixtime();
	(vk_del_dup_check_size?check_pro:check_lite)();
	vklog('DeleteDuplicates time:' + (unixtime()-tstart) +'ms');
}

vk_pads={
   pl_add:function(aid){
       if (window.audioPlayer) {
           var fromPad = window.audioPlayer.isPlaylistGlobal();
           var padPlist = fromPad ? ls.get('pad_playlist') || window.audioPlaylist : padAudioPlaylist();
           var cur_id = fromPad ? ls.get('audio_id') || currentAudioId() : currentAudioId();
           if (cur_id && padPlist) {
               var info;  // Новый элемент плейлиста
               if (padPlist[aid]) { // Если информация о добавляемой аудиозаписи уже имеется в плейлисте, извлекаем её оттуда
                   info = padPlist[aid];
                   padPlist[info._prev]._next = info._next;
                   padPlist[info._next]._prev = info._prev;
               } else            // Иначе получаем её из DOM
                   info = window.audioPlayer.getSongInfoFromDOM(aid);
               if (aid.substr(-4) == '_pad') {    // фикс для случая "добавление песни из pad в плейлист не из pad"
                   aid = aid.substr(0, aid.length - 4);
               }
               // вставка в двунаправленный список
               var cur_info = padPlist[cur_id];
               info._next = cur_info._next;
               info._prev = cur_info.full_id || cur_info.aid || cur_id;
               info.full_id = aid;
               info.aid = aid;

               if (padPlist[cur_info._next])
                   padPlist[cur_info._next]._prev = aid;
               cur_info._next = aid;
               padPlist[aid] = info;
               if (vk_DEBUG) console.log(padPlist[cur_id], padPlist[aid], padPlist[cur_info._next]);
               // Обновление плейлиста
               window.audioPlayer.setPadPlaylist(padPlist);
               window.audioPlaylist = padPlist;
               vkMsg('<b>' + info[5] + ' - ' + info[6] + '</b><br>' + IDL('AddedToPls'), 1000);
           }
           else
               playAudioNew(aid);
       }
       else
           playAudioNew(aid);
   }
};

function vkAddAudio(aid,oid,callback){
	dApi.call('audio.add',{aid:aid,oid:oid},function(r){
		if (callback) callback(r.response);
	});
}
function vkAddAudioT(oid,aid,el){
	var p=el;//.parentNode;
	val(p, vkLdrImg);
	vkAddAudio(aid,oid,function(r){  
      if (r) val(p, IDL('AddMyAudio')+' - '+IDL('Done'));
		else val(p, IDL('AddMyAudio')+' - '+IDL('Error'));
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
      html += show_add ?'<a href="#" onclick="vkAddAudioT(\''+a[1]+'\',\''+a[2]+'\',this); return false;">'+IDL('AddMyAudio')+'</a>':'';
      html += '<a href="#" onclick="vk_audio.add_to_group('+a[1]+','+a[2]+'); return false;">'+IDL('AddToGroup')+'</a>';
      html += '<a href="#" onclick="'+"showBox('like.php', {act: 'publish_box', object: 'audio"+a[1]+'_'+a[2]+"', to: 'mail'}, {stat: ['page.js', 'page.css', 'wide_dd.js', 'wide_dd.css', 'sharebox.js']});"+'return false;">'+IDL('Share')+'</a>';
      html +='<a href="#" onclick="vk_pads.pl_add(\''+id+'\'); return false;">'+IDL('AddToPls')+'</a>';

      html +='<a href="#" onclick="vkAudioWikiCode(\''+a[1]+'_'+a[2]+'\',\''+a[1]+'\',\''+a[2]+'\'); return false;">'+IDL('Wiki')+'</a>';
      html +='<a href="'+SEARCH_AUDIO_LYRIC_LINK.replace('%AUDIO_NAME%',name)+'" target="_blank">'+IDL('SearchAudioLyr')+'</a>';
      
		var links = '<div class="vk_tt_links_list">'+html+'</div>';
      
      if (el.tt && el.tt.container){
         val(geByClass('vk_tt_links_list',el.tt.container)[0], html);
      }
      showTooltip(el, {
		  hasover:true,
		  text:links,
		  slide: 15,
		  shift: [-15, -3, 0],
		  showdt: 400,
		  hidedt: 200
		});
	}
}



function vkDownloadPostfix(){
	/*!
	активация функции контакта изменяющая загловок ответа, 
	для скачивания файла минуя плагины типа QuickTime. 
	но есть вероятность оказаться на виду у разработчиков контакта и спалиться за скачиванием музыки
	Включается в расширенных настройках.
	*/
    return (AUDIO_DOWNLOAD_POSTFIX ? 'dl=1' : '');
}

function vkAudioBtns(){
      if (ge('vkcleanaudios_btn')){
         var allow_show=cur.canEdit && !(nav.objLoc['act']=='recommendations' || nav.objLoc['act']=='popular' || nav.objLoc['friend']);
         (allow_show?show:hide)('vkcleanaudios_btn');
      }      
      if (getSet(77)=='y' && cur.canEdit && !ge('vkcleanaudios_btn') ){
         var p=ge('album_filters');
         var btn=vkCe("div",{
               id:"vkcleanaudios_btn",
               "class":"audio_filter"
            },'<div class="label">'+IDL('DelAll')+'</div>');
         btn.setAttribu7e('onmouseover',"if (Audio.listOver) Audio.listOver(this)");
         btn.setAttribu7e('onmouseout',"if (Audio.listOut) Audio.listOut(this)");
         btn.setAttribu7e('onclick',"vkCleanAudios();");
         p.insertBefore(btn,p.firstChild);
      }	
      
      p=ge('audio_albums');//audio_albums_wrap
      if (p && !ge('albumNoSort')){
         var btn=vkCe("div",{
               id:"albumNoSort",
               "class":"audio_filter",
               stopsort:"1"
            },'<div class="label">'+IDL('NotInAlbums')+'</div>\
               <div class="icon_wrap" id="albumBanned" onclick="vkAudioLoadAlbum(\'Banned\'); return cancelEvent(event)" onmouseover="addClass(this,\'over\'); showTooltip(this, {text: \''+IDL('AudioBanned')+'\', black: 1, shift: [7, 2, 0]})" onmouseout="removeClass(this, \'over\')"><div class="post_dislike_icon dislike_icon_skull" style="margin:8px 6px "></div></div>');
         btn.setAttribu7e('onmouseover',"if (Audio.listOver) Audio.listOver(this)");
         btn.setAttribu7e('onmouseout',"if (Audio.listOut) Audio.listOut(this)");
         btn.setAttribu7e('onclick', "vkAudioLoadAlbum('NoSort');");
         p.insertBefore(btn,p.firstChild);
      }
}

function vkAudioLoadAlbum(albumid){
   if (albumid=='NoSort'){
      var audios=cur.audiosList['all'];
      cur.audiosList['albumNoSort']=[];
      for (var i=0; i<audios.length; i++){
         if (audios[i][8]=="0")
            cur.audiosList['albumNoSort'].push(audios[i]);
      }
   }
   if (albumid=='Banned'){
      var audios=cur.audiosList['all'];
      var s_list=[];
      cur.audiosList['albumBanned']=[];
      for (var i=0; i<audios.length; i++){
         if (!audios[i][2] || audios[i][2]==""){
            cur.audiosList['albumBanned'].push(audios[i]);
            s_list.push([audios[i][5],audios[i][6]]);
         }
      }  
      if (s_list.length>0 && cur.curList=='albumBanned'){
         vkAlertBox(getLang('audio_N_recs',s_list.length),IDL('SearchBanned'),function(){
         vk_aalbum.search_tracks(s_list);
         },function(){
            s_list=null;
         })
         
      }
   }
  
   Audio.loadAlbum({from_pad: '', album: albumid} );
}



// ==UserScript==
// @name          LastFM scrobbler v1.0 (vkOpt plugin)
// @description   (by KiberInfinity id13391307)
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
// Scrobbling API documentation: http://users.last.fm/~tims/scrobbling/scrobbling2.html
vkLastFM={
   api_key:"8077e41f067a717abb49db6159081cb5",
   api_secret:"e13a67e7e53c3c26d3734eefe34259a3",
   res:{
      white:{
         last_fm:'data:image/png;base64,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',
         playing_icon:'data:image/gif;base64,R0lGODlhCwALAIABAP///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0J6SFDpYT5Y35AYeBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdAF5MUKqKp82HVwcGBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0F6EScoKLQ2a7wYGBQAh+QQJBQABACwAAAAACwALAAACE4yPqQqw1l6IL1JkHXT59CuFQQEAIfkECQUAAQAsAAAAAAsACwAAAhGMj6nLBtBehElaGm7GWrZ/FAAh+QQJBQABACwAAAAACwALAAACEoyPqcuNABQMM8364o1mU+6EBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdABp8Mc1bqZ4GawcGBQAh+QQJBQABACwAAAAACwALAAACFIyPqbsAHByShtZ347OyYw1a0BgUACH5BAUFAAEALAAAAAALAAsAAAIRjI+pyx0AGpRxTmNrxPptBxYAIfkECQUAAQAsAgAEAAgAAgAAAgWMjwGgUAAh+QQFBQABACwAAAAACwALAAACDIyPqcuNABp0tFpbAAA7',
         paused_icon:'data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAALAAsAAAINlI+py+0PYQhiVhpbAQA7',
         scrobble_ok:'data:image/png;base64,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',
         scrobble_fail:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAFhJREFUeNpsj0ENwDAMA61RKo8hGKNSKIaSGIqVzO2xWs2i+hVFF9sRIOACypwVdhJw8mkEqM1dNX0HqMeDaGno53Zo6dFOKXOkuOK2uaShboe6ebMBegcAvlvCObrveGsAAAAASUVORK5CYII='
      },
      blue:{
         last_fm:'data:image/png;base64,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',
         playing_icon:'data:image/gif;base64,R0lGODlhCwALAIABAFBykv///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0J6SFDpYT5Y35AYeBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdAF5MUKqKp82HVwcGBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0F6EScoKLQ2a7wYGBQAh+QQJBQABACwAAAAACwALAAACE4yPqQqw1l6IL1JkHXT59CuFQQEAIfkECQUAAQAsAAAAAAsACwAAAhGMj6nLBtBehElaGm7GWrZ/FAAh+QQJBQABACwAAAAACwALAAACEoyPqcuNABQMM8364o1mU+6EBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdABp8Mc1bqZ4GawcGBQAh+QQJBQABACwAAAAACwALAAACFIyPqbsAHByShtZ347OyYw1a0BgUACH5BAUFAAEALAAAAAALAAsAAAIRjI+pyx0AGpRxTmNrxPptBxYAIfkECQUAAQAsAgAEAAgAAgAAAgWMjwGgUAAh+QQFBQABACwAAAAACwALAAACDIyPqcuNABp0tFpbAAA7',
         paused_icon:'data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///1Bykv///yH5BAEAAAMALAAAAAALAAsAAAINnI+py+0PoRBjVhpbAQA7',
         scrobble_ok:'data:image/png;base64,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',
         scrobble_fail:'data:image/png;base64,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'
      }
   },
   debug:false,
   get_time:null,
   lastfm:null,
   session_key:null,
   username:null,
   token:null,
   last_track:{},
   scrobled:false,
   enable_scrobbling:true,
   timer:function(callback, delay) {
      var timerId, start, remaining = delay;
      var paused=false;
      this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
        paused=true;
      };
      this.resume = function() {
        if (!paused) return;
        start = new Date();
        if (timerId) window.clearTimeout(timerId);
        timerId = window.setTimeout(function(){callback();}, remaining);
        paused=false;
      };
      this.reset = function(){
         window.clearTimeout(timerId);
         remaining = delay;
         this.resume();
      };
      this.get_remaing = function(){
         return paused?remaining:(remaining-(new Date() - start));
      };
      this.kill=function(){
         window.clearTimeout(timerId);
         callback=null;
      };
      paused=true;
      this.resume();
   },
   get_time:function(){
      return Math.round((new Date()).getTime()/1000)
   },
   clean:function(s){
      s=s.replace(/&#0+(\d+);/g,"&#$1;");
      return winToUtf(s);//s.replace(/&quot;|&amp;|&lt;|&gt;|&rsquo;|&#[0-9]{2}[0-9]*;/gi, ' ');//   |<|>|"|'
   },
   init:function(){
      var fm=vkLastFM;
      var md5=vkMD5;//from vk_lib.js
      fm.token=localStorage['lastfm_token'];
      fm.username=localStorage['lastfm_username'];
      fm.session_key=localStorage['lastfm_session_key'];
      fm.enable_scrobbling=parseInt(localStorage['lastfm_enable_scrobbling']) || false;
      function LastFM(options){ // sources: https://github.com/fxb/javascript-last.fm-api
         var apiKey=options.apiKey||'';
         var apiSecret=options.apiSecret||'';
         // https://ws.audioscrobbler.com/2.0/
         var apiUrl=options.apiUrl||'http://ws.audioscrobbler.com/2.0/';
         var cache=options.cache||undefined;var debug=typeof(options.debug)=='undefined'?false:options.debug;this.setApiKey=function(_apiKey){apiKey=_apiKey};this.setApiSecret=function(_apiSecret){apiSecret=_apiSecret};this.setApiUrl=function(_apiUrl){apiUrl=_apiUrl};this.setCache=function(_cache){cache=_cache};
         //original of library method internalCall  with JSONP/iframe requests:
         //var internalCall=function(params,callbacks,requestMethod){if(requestMethod=='POST'){var html=document.getElementsByTagName('html')[0];var frameName='lastfmFrame_'+new Date().getTime();var iframe=document.createElement('iframe');html.appendChild(iframe);iframe.contentWindow.name=frameName;iframe.style.display="none";var formState='init';iframe.width=1;iframe.height=1;iframe.style.border='none';iframe.onload=function(){if(formState=='sent'){if(!debug){setTimeout(function(){html.removeChild(iframe);html.removeChild(form)},1500)}};formState='done';if(typeof(callbacks.success)!='undefined'){callbacks.success()}};var form=document.createElement('form');form.target=frameName;form.action=apiUrl;form.method="POST";form.acceptCharset="UTF-8";html.appendChild(form);for(var param in params){var input=document.createElement("input");input.type="hidden";input.name=param;input.value=params[param];form.appendChild(input)};formState='sent';form.submit()}else{var jsonp='jsonp'+new Date().getTime();var hash=auth.getApiSignature(params);if(typeof(cache)!='undefined'&&cache.contains(hash)&&!cache.isExpired(hash)){if(typeof(callbacks.success)!='undefined'){callbacks.success(cache.load(hash))}return}params.callback=jsonp;params.format='json';window[jsonp]=function(data){if(typeof(cache)!='undefined'){var expiration=cache.getExpirationTime(params);if(expiration>0){cache.store(hash,data,expiration)}}if(typeof(data.error)!='undefined'){if(typeof(callbacks.error)!='undefined'){callbacks.error(data.error,data.message)}}else if(typeof(callbacks.success)!='undefined'){callbacks.success(data)}window[jsonp]=undefined;try{delete window[jsonp]}catch(e){}if(head){head.removeChild(script)}};var head=document.getElementsByTagName("head")[0];var script=document.createElement("script");var array=[];for(var param in params){array.push(encodeURIComponent(param)+"="+encodeURIComponent(params[param]))}script.src=apiUrl+'?'+array.join('&').replace(/%20/g,'+');head.appendChild(script)}};
         
         // internalCall method for vkopt with using XMLHTTPRequest:
         var internalCall = function (params, callbacks, requestMethod) {
            params.format = 'json';
            
            var onDone = function (data) {
               if (typeof(cache) != 'undefined') {
                  var expiration = cache.getExpirationTime(params);
                  if (expiration > 0) {
                     cache.store(hash, data, expiration)
                  }
               }
               if (typeof(data.error) != 'undefined') {
                  if (typeof(callbacks.error) != 'undefined') {
                     callbacks.error(data.error, data.message)
                  }
               } else if (typeof(callbacks.success) != 'undefined') {
                  callbacks.success(data)
               }
            }
            if (requestMethod != 'POST'){
               var hash = auth.getApiSignature(params);
               if (typeof(cache) != 'undefined' && cache.contains(hash) && !cache.isExpired(hash)) {
                  if (typeof(callbacks.success) != 'undefined') {
                     callbacks.success(cache.load(hash))
                  }
                  return
               }
            }
            var data = urlEncData(params);
            var url = apiUrl;
            if (requestMethod == 'GET') 
               url += '?'+data.replace(/%20/g, '+')
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
               if (xhr.readyState == 4){
                  onDone(JSON.parse(xhr.responseText));
               }
            };
            xhr.open(requestMethod, url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // Don't set this header, else request has fail
            requestMethod == 'POST' ? xhr.send(data) : xhr.send();
         };
         
         var call=function(method,params,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;internalCall(params,callbacks,requestMethod)};var signedCall=function(method,params,session,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;if(session&&typeof(session.key)!='undefined'){params.sk=session.key}params.api_sig=auth.getApiSignature(params);internalCall(params,callbacks,requestMethod)};this.album={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('album.addTags',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('album.getBuylinks',params,callbacks)},getInfo:function(params,callbacks){call('album.getInfo',params,callbacks)},getTags:function(params,session,callbacks){signedCall('album.getTags',params,session,callbacks)},removeTag:function(params,session,callbacks){signedCall('album.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('album.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('album.share',params,callbacks)}};this.artist={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('artist.addTags',params,session,callbacks,'POST')},getCorrection:function(params,callbacks){call('artist.getCorrection',params,callbacks)},getEvents:function(params,callbacks){call('artist.getEvents',params,callbacks)},getImages:function(params,callbacks){call('artist.getImages',params,callbacks)},getInfo:function(params,callbacks){call('artist.getInfo',params,callbacks)},getPastEvents:function(params,callbacks){call('artist.getPastEvents',params,callbacks)},getPodcast:function(params,callbacks){call('artist.getPodcast',params,callbacks)},getShouts:function(params,callbacks){call('artist.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('artist.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('artist.getTags',params,session,callbacks)},getTopAlbums:function(params,callbacks){call('artist.getTopAlbums',params,callbacks)},getTopFans:function(params,callbacks){call('artist.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('artist.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('artist.getTopTracks',params,callbacks)},removeTag:function(params,session,callbacks){signedCall('artist.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('artist.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('artist.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('artist.shout',params,session,callbacks,'POST')}};this.auth={getMobileSession:function(params,callbacks){params={username:params.username,authToken:md5(params.username+md5(params.password))};signedCall('auth.getMobileSession',params,null,callbacks)},getSession:function(params,callbacks){signedCall('auth.getSession',params,null,callbacks)},getToken:function(callbacks){signedCall('auth.getToken',null,null,callbacks)},getWebSession:function(callbacks){var previuousApiUrl=apiUrl;apiUrl='http://ext.last.fm/2.0/';signedCall('auth.getWebSession',null,null,callbacks);apiUrl=previuousApiUrl}};this.chart={getHypedArtists:function(params,session,callbacks){call('chart.getHypedArtists',params,callbacks)},getHypedTracks:function(params,session,callbacks){call('chart.getHypedTracks',params,callbacks)},getLovedTracks:function(params,session,callbacks){call('chart.getLovedTracks',params,callbacks)},getTopArtists:function(params,session,callbacks){call('chart.getTopArtists',params,callbacks)},getTopTags:function(params,session,callbacks){call('chart.getTopTags',params,callbacks)},getTopTracks:function(params,session,callbacks){call('chart.getTopTracks',params,callbacks)}};this.event={attend:function(params,session,callbacks){signedCall('event.attend',params,session,callbacks,'POST')},getAttendees:function(params,session,callbacks){call('event.getAttendees',params,callbacks)},getInfo:function(params,callbacks){call('event.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('event.getShouts',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('event.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('event.shout',params,session,callbacks,'POST')}};this.geo={getEvents:function(params,callbacks){call('geo.getEvents',params,callbacks)},getMetroArtistChart:function(params,callbacks){call('geo.getMetroArtistChart',params,callbacks)},getMetroHypeArtistChart:function(params,callbacks){call('geo.getMetroHypeArtistChart',params,callbacks)},getMetroHypeTrackChart:function(params,callbacks){call('geo.getMetroHypeTrackChart',params,callbacks)},getMetroTrackChart:function(params,callbacks){call('geo.getMetroTrackChart',params,callbacks)},getMetroUniqueArtistChart:function(params,callbacks){call('geo.getMetroUniqueArtistChart',params,callbacks)},getMetroUniqueTrackChart:function(params,callbacks){call('geo.getMetroUniqueTrackChart',params,callbacks)},getMetroWeeklyChartlist:function(params,callbacks){call('geo.getMetroWeeklyChartlist',params,callbacks)},getMetros:function(params,callbacks){call('geo.getMetros',params,callbacks)},getTopArtists:function(params,callbacks){call('geo.getTopArtists',params,callbacks)},getTopTracks:function(params,callbacks){call('geo.getTopTracks',params,callbacks)}};this.group={getHype:function(params,callbacks){call('group.getHype',params,callbacks)},getMembers:function(params,callbacks){call('group.getMembers',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('group.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('group.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('group.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('group.getWeeklyTrackChart',params,callbacks)}};this.library={addAlbum:function(params,session,callbacks){signedCall('library.addAlbum',params,session,callbacks,'POST')},addArtist:function(params,session,callbacks){signedCall('library.addArtist',params,session,callbacks,'POST')},addTrack:function(params,session,callbacks){signedCall('library.addTrack',params,session,callbacks,'POST')},getAlbums:function(params,callbacks){call('library.getAlbums',params,callbacks)},getArtists:function(params,callbacks){call('library.getArtists',params,callbacks)},getTracks:function(params,callbacks){call('library.getTracks',params,callbacks)}};this.playlist={addTrack:function(params,session,callbacks){signedCall('playlist.addTrack',params,session,callbacks,'POST')},create:function(params,session,callbacks){signedCall('playlist.create',params,session,callbacks,'POST')},fetch:function(params,callbacks){call('playlist.fetch',params,callbacks)}};this.radio={getPlaylist:function(params,session,callbacks){signedCall('radio.getPlaylist',params,session,callbacks)},search:function(params,session,callbacks){signedCall('radio.search',params,session,callbacks)},tune:function(params,session,callbacks){signedCall('radio.tune',params,session,callbacks)}};this.tag={getInfo:function(params,callbacks){call('tag.getInfo',params,callbacks)},getSimilar:function(params,callbacks){call('tag.getSimilar',params,callbacks)},getTopAlbums:function(params,callbacks){call('tag.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('tag.getTopArtists',params,callbacks)},getTopTags:function(callbacks){call('tag.getTopTags',null,callbacks)},getTopTracks:function(params,callbacks){call('tag.getTopTracks',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('tag.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('tag.getWeeklyChartList',params,callbacks)},search:function(params,callbacks){call('tag.search',params,callbacks)}};this.tasteometer={compare:function(params,callbacks){call('tasteometer.compare',params,callbacks)},compareGroup:function(params,callbacks){call('tasteometer.compareGroup',params,callbacks)}};this.track={addTags:function(params,session,callbacks){signedCall('track.addTags',params,session,callbacks,'POST')},ban:function(params,session,callbacks){signedCall('track.ban',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('track.getBuylinks',params,callbacks)},getCorrection:function(params,callbacks){call('track.getCorrection',params,callbacks)},getFingerprintMetadata:function(params,callbacks){call('track.getFingerprintMetadata',params,callbacks)},getInfo:function(params,callbacks){call('track.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('track.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('track.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('track.getTags',params,session,callbacks)},getTopFans:function(params,callbacks){call('track.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('track.getTopTags',params,callbacks)},love:function(params,session,callbacks){signedCall('track.love',params,session,callbacks,'POST')},removeTag:function(params,session,callbacks){signedCall('track.removeTag',params,session,callbacks,'POST')},scrobble:function(params,session,callbacks){if(params.constructor.toString().indexOf("Array")!=-1){var p={};for(i in params){for(j in params[i]){p[j+'['+i+']']=params[i][j]}}params=p}signedCall('track.scrobble',params,session,callbacks,'POST')},search:function(params,callbacks){call('track.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('track.share',params,session,callbacks,'POST')},unban:function(params,session,callbacks){signedCall('track.unban',params,session,callbacks,'POST')},unlove:function(params,session,callbacks){signedCall('track.unlove',params,session,callbacks,'POST')},updateNowPlaying:function(params,session,callbacks){signedCall('track.updateNowPlaying',params,session,callbacks,'POST')}};this.user={getArtistTracks:function(params,callbacks){call('user.getArtistTracks',params,callbacks)},getBannedTracks:function(params,callbacks){call('user.getBannedTracks',params,callbacks)},getEvents:function(params,callbacks){call('user.getEvents',params,callbacks)},getFriends:function(params,callbacks){call('user.getFriends',params,callbacks)},getInfo:function(params,callbacks){call('user.getInfo',params,callbacks)},getLovedTracks:function(params,callbacks){call('user.getLovedTracks',params,callbacks)},getNeighbours:function(params,callbacks){call('user.getNeighbours',params,callbacks)},getNewReleases:function(params,callbacks){call('user.getNewReleases',params,callbacks)},getPastEvents:function(params,callbacks){call('user.getPastEvents',params,callbacks)},getPersonalTracks:function(params,callbacks){call('user.getPersonalTracks',params,callbacks)},getPlaylists:function(params,callbacks){call('user.getPlaylists',params,callbacks)},getRecentStations:function(params,session,callbacks){signedCall('user.getRecentStations',params,session,callbacks)},getRecentTracks:function(params,callbacks){call('user.getRecentTracks',params,callbacks)},getRecommendedArtists:function(params,session,callbacks){signedCall('user.getRecommendedArtists',params,session,callbacks)},getRecommendedEvents:function(params,session,callbacks){signedCall('user.getRecommendedEvents',params,session,callbacks)},getShouts:function(params,callbacks){call('user.getShouts',params,callbacks)},getTopAlbums:function(params,callbacks){call('user.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('user.getTopArtists',params,callbacks)},getTopTags:function(params,callbacks){call('user.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('user.getTopTracks',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('user.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('user.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('user.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('user.getWeeklyTrackChart',params,callbacks)},shout:function(params,session,callbacks){signedCall('user.shout',params,session,callbacks,'POST')}};this.venue={getEvents:function(params,callbacks){call('venue.getEvents',params,callbacks)},getPastEvents:function(params,callbacks){call('venue.getPastEvents',params,callbacks)},search:function(params,callbacks){call('venue.search',params,callbacks)}};var auth={getApiSignature:function(params){var keys=[];var string='';for(var key in params){keys.push(key)}keys.sort();for(var index in keys){var key=keys[index];string+=key+params[key]}string+=apiSecret;return md5(string)}}
      }
      fm.lastfm = new LastFM({
					apiKey: fm.api_key,
					apiSecret: fm.api_secret,
               apiUrl: location.protocol+'//ws.audioscrobbler.com/2.0/',
					debug: fm.debug
				});
      fm.listen_storage();
   },
   on_location:function(){
      var fm=vkLastFM;
      if (nav.objLoc['act']=="vkscrobbler" && nav.objLoc['token']){ 
         localStorage['lastfm_token']=nav.objLoc['token'];
         fm.token=nav.objLoc['token'];
         fm.auth(function(){
            vkAlertBox(IDL('AuthBoxTitle'), IDL('AuthDone').replace(/<username>/g,localStorage['lastfm_username']));
         });    
      }
   },
   listen_storage:function(){
      var fm=vkLastFM;
      if (window.opera || vkbrowser.safari || vkbrowser.chrome){ // Note: Opera and WebKits listens on window
				window.addEventListener('storage', fm.on_storage, false);
		} else { // Note: FF listens on document.body or document
				document.body.addEventListener('storage', fm.on_storage, false);
		}	
   },
   on_storage:function(e){
      var fm=vkLastFM;
      if (e.key=='lastfm_username'){
         fm.token=localStorage['lastfm_token'];
         fm.username=localStorage['lastfm_username'];
         fm.session_key=localStorage['lastfm_session_key'];
         
      }
   },
   auth:function(callback){
      var fm=vkLastFM;
      fm.lastfm.auth.getSession({token: fm.token}, {success: function(data){
         fm.username = data.session.name;    // имя пользователя.
         fm.session_key = data.session.key;  // ключ
         localStorage['lastfm_username'] = fm.username;
         localStorage['lastfm_session_key'] = fm.session_key;
         if (callback) callback();
      }, error: function(code){
         if (code == 4)// токен сдох
            if (!fm.connect_box || !fm.connect_box.isVisible()){
               fm.connect_box=vkAlertBox(IDL('AuthBoxTitle'), IDL('AuthBoxText'), function(){
                  var url = 'http://www.last.fm/api/auth?api_key=' + fm.api_key + '&cb=' + encodeURIComponent(location.protocol+'//' + location.host + '/settings?act=vkscrobbler');
                  window.open(url,'_blank','');
                  //location.href = url;
               }, function(){
                  if (fm.enable_scrobbling) fm.toggle(true);
               });
            }
      }});
   },
   logout:function(){
      var fm=vkLastFM;
      vkAlertBox(IDL('AuthBoxTitle'), IDL('LogoutSubmit').replace(/<username>/g,localStorage['lastfm_username']), function(){
                  
         localStorage['lastfm_token']=null;
         localStorage['lastfm_username']=null;
         localStorage['lastfm_session_key']=null;
         fm.token=null;
         fm.username=null;
         fm.session_key=null;
         if (fm.enable_scrobbling) fm.toggle();
         //fm.enable_scrobbling=parseInt(localStorage['lastfm_enable_scrobbling']);
         //location.href = url;
      }, true);
   },
   scrobble:function(audio_info,ts){
      var fm=vkLastFM;
      if (!fm.enable_scrobbling) return;
      
      if (!fm.session_key) {
         fm.auth(function(){fm.scrobble(audio_info)});
         return;
      }

      // отправляем last.fm
      fm.lastfm.track.scrobble({ 
         artist: audio_info.artist,
         track: audio_info.title,
         duration: audio_info.duration,
         timestamp: ts
      },
      {
         key: fm.session_key
      },
      {success: function(){
         fm.set_icon(audio_info,'scrobled'); 
      }, error: function(code, message){
         if (code==4 || code==9) fm.auth();
         fm.set_icon(audio_info,'scrobled_fail');         
         vklog('scrobbler_error ['+code+']:'+message);
      }}); 
      fm.scrobled = true;
      fm.s_timer.kill();
      // show scrobble ok
   },
   now_playing: function(audio_info){
      var fm=vkLastFM;
      if (!fm.enable_scrobbling) return;
      if (!fm.session_key) {
         fm.auth(function(){fm.now_playing(audio_info)});
         return;
      }
      var fm=vkLastFM;
      fm.lastfm.track.updateNowPlaying({
         artist: audio_info.artist,
         track: audio_info.title,
         duration: audio_info.duration,
         timestamp: fm.get_time()
      },
      {
         key: fm.session_key
      },
      {
         success: function(data){}, 
         error: function(code){
            if (code==4 || code==9) fm.auth();
         }
      });
	},
   love:function(){
      if (vk_DEBUG) console.log('last.fm love track');
      var fm=vkLastFM;
      var audio_info=fm.audio_info();
      fm.lastfm.track.love({ 
            artist: audio_info.artist,
            track: audio_info.title
         },
         {
            key: fm.session_key
         },
         {success: function(data){
            //showDoneBox('loved',{out:800});
            //console.log('love done');
         }, error: function(code, message){
            if (code==4 || code==9) fm.auth();     
            vklog('last.fm error ['+code+']:'+message);
      }}); 
      
   },
   unlove:function(){
      if (vk_DEBUG) console.log('last.fm unlove track');
      var fm=vkLastFM;
      var audio_info=fm.audio_info();
      fm.lastfm.track.unlove({ 
            artist: audio_info.artist,
            track: audio_info.title
         },
         { key: fm.session_key },
         {
            success: function(data){
               //showDoneBox('unlove',{out:800});
               //console.log('unlove done');
            }, 
            error: function(code, message){
               if (code==4 || code==9) fm.auth();     
               vklog('last.fm error ['+code+']:'+message);
            }
      });      
   },
   set_love_icon:function(is_loved){
      var els=geByClass('lastfm_fav_icon');
      for (var i=0; i<els.length;i++){ 
         var el=els[i];
         (is_loved?removeClass:addClass)(el,'loved');
         
         if (el.tt) el.tt.hide();
         el.onmouseover=function(e){
            //alert('Qwr');
            //fm.tip(el, IDL(is_loved?'LastFMAddToLoved':'LastFMRemoveFromLoved'));
            var el=e.target;
            var text=IDL(!hasClass(el,'loved')?'LastFMAddToLoved':'LastFMRemoveFromLoved');
            
            if (el.tt && el.tt.container) {
               val(geByClass1('gp_tip_text', el.tt.container), text);
            }
            
            showTooltip(el, {
               content: '<div class="gp_tip_text">' + text + '</div>',
               className: 'gp_tip',
               showdt: 0, black: 1, shift: [11, 0, 0]});
         }
      }   
   },

   on_love_btn:function(el){
      var fm=vkLastFM;
      var is_loved=hasClass(el,'loved');
      if (is_loved){
         fm.unlove();
      } else {
         fm.love();
      }
      fm.set_love_icon(is_loved);
   },
   get_loved:function(){
      var fm=vkLastFM;
      
      if (!fm.loved_tracks){
         fm.lastfm.user.getLovedTracks({user:fm.username,limit:1000},{
               success: function(data) {
                  if (vk_DEBUG) console.log(data);
                  fm.loved_tracks=data.lovedtracks;
               },
               error: function(code, message) {
                  if (vk_DEBUG) console.log(code, message)
               }
            });
      }
   },
   scrobble_timer:function(audio_info){
      var fm=vkLastFM;
      if (fm.s_timer){ 
         fm.s_timer.pause();
         fm.s_timer.kill();
      }// отключение несработавшего таймера
      if (audio_info.duration>30){ // The track must be longer than 30 seconds.
         var delay = Math.min(240,audio_info.duration/2)*1000; //And the track has been played for at least half its duration, or for 4 minutes (whichever occurs earlier.)
         var ts=fm.get_time();
         fm.s_timer = new fm.timer(function(){
            fm.scrobble(audio_info,ts); // скробблим при срабатывании таймера
         },delay);
      }      
   },
   audio_info:function(){
      var fm=vkLastFM;
      if (!(window.audioPlayer && audioPlayer.lastSong)) return {};
      var a = audioPlayer.lastSong || [];
      return {
         title    :fm.clean(a[6]),
         artist   :fm.clean(a[5]),
         duration :a[3],
         url      :a[2],
         oid      :a[0],
         aid      :a[1]
      };
   },
   tip:function(el,text, opts){ 
         var dx, dy1, dy2;
         opts = opts || {};
         dx=7;
         dy1=-13;
         dy2=-12;
         if (el.tt && el.tt.container) {
            val(geByClass1('gp_tip_text', el.tt.container), text);
         }
         showTooltip(el, {
            content: '<div class="gp_tip_text">' + text + '</div>',
            className: 'gp_tip',
            black: 1,
            shift: [4 + intval(dx), 13 + intval(dy1), 16 + intval(dy2)],
            showdt:300,
            onHide:opts.onHide,
            onShowStart:opts.onShowStart
         });     
   },
   ui:function(){
     
     // Inj.End('audioPlayer.initPlayer','vkLastFM.ui()');
     /* CLASS: 
      lastfm_toggle_btn
      lastfm_status_ico
      
         
      */
      
      /* append to gp_small
      <div id="lastfm" class="fl_l">
         <div style="position: absolute; padding: 3px; background-color: rgba(0, 0, 0, 0.298); margin-left: -40px">lastfm</div>
      </div>*/
      
      // <span id="_" class="duration_ fl_r" style="width:60px; padding-left:6px;">LastFM</span> before id=ac_duration
      /*
          - top player

      */ 
     var fm=vkLastFM;
     var controls=//'<div class="lastfm_status">lastfm</div>';  id_="vk_lastfm_status_icon" id_="vk_lastfm_icon" 
         '<div class="lastfm_status">\
            <div class="fl_l lastfm_status_icon"></div>\
            <div class="fl_r vk_lastfm_icon'+(fm.enable_scrobbling?'':' disabled')+'" onclick="vkLastFM.toggle();"  onmousedown="cancelEvent(event)"></div>\
            <div class="fl_r lastfm_fav_icon" onclick="vkLastFM.on_love_btn(this);"></div>\
         </div>';
    
    var gp=ge('gp_vka_ctrls') || ge('gp_small');
     if (gp && !geByClass('lastfm_status',gp)[0]){
      var el=vkCe('div',{'class':'fl_r'},'<div class="lastfm_gp">'+controls+'</div>');
        if (gp==ge('gp_vka_ctrls'))
         gp.insertBefore(el,gp.firstChild);
        else
         gp.appendChild(el);
     }
     
     var ac=ge('ac_duration');
     if (ac && !geByClass('lastfm_status',ac.parentNode)[0]){
         ac.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_ac'},controls),ac);
     }
     var pd=ge('pd_duration');
     if (pd && !geByClass('lastfm_status',pd.parentNode)[0]){
         pd.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_pd'},controls),pd);
     }   
     var els=geByClass('vk_lastfm_icon');
     for (var i=0; i<els.length;i++){
         els[i].onmouseover=
         (function(z){
            return function(){
               var text=IDL(fm.enable_scrobbling?'ScrobblingOn':'ScrobblingOff').replace(/<username>/g,fm.username);
               text+=' <a href="#" onclick="vkLastFM.logout();">'+IDL('Logout')+'</a>';
               if (!fm.username) text=IDL('AuthNeeded');
               fm.tip(els[z],text);  
            }
         })(i);
         
     }
   },
   toggle:function(hide_tooltip){
      var fm=vkLastFM;
      /*
      if (fm.enable_scrobbling){
         fm.enable_scrobbling=0;
      }*/
      fm.enable_scrobbling=!fm.enable_scrobbling;
      var els=geByClass('vk_lastfm_icon');
      for (var i=0; i<els.length;i++){
         var el=els[i];//ge('vk_lastfm_icon');
         if (!fm.enable_scrobbling){
            addClass(el,'disabled');
            if (fm.s_timer) fm.s_timer.pause();
            fm.set_icon();   
         } else {
            if (!fm.session_key) {
               fm.auth();
            } 
            removeClass(el,'disabled');
            fm.s_timer.reset();
         }
      
      }
      localStorage['lastfm_enable_scrobbling']=fm.enable_scrobbling?1:0;
      fm.set_icon(); 
      for (var i=0; i<els.length && !hide_tooltip ;i++){
         els[i].onmouseover();
      }
   },
   set_icon:function(audio_info,icon){
      var fm=vkLastFM;
      /*
      var p=ge('gp_vol');
      if (!p) return;
      if (!ge('vk_lastfm_status_icon')) {

         ge('gp_small').appendChild(vkCe('div',{"class":"fl_r", id:"vk_lastfm_small_cont"},'<div  id="vk_lastfm_small_icons"><div class="fl_l" id="vk_lastfm_status_small_icon"></div></div>'));
         
         p.parentNode.appendChild(vkCe('div',{"class":"fl_l", id:"vk_lastfm_cont"},'<div id="vk_lastfm_icons">\
            <div class="fl_l" id="vk_lastfm_status_icon"></div>\
            <div class="fl_r'+(fm.enable_scrobbling?'':' disabled')+'" id="vk_lastfm_icon" onclick="vkLastFM.toggle();"  onmousedown="cancelEvent(event)"></div>\
         </div>'));
         ge('vk_lastfm_icon').onmouseover=function(){
            var text=IDL(fm.enable_scrobbling?'ScrobblingOn':'ScrobblingOff').replace(/<username>/g,fm.username);
            text+=' <a href="#" onclick="vkLastFM.logout();">'+IDL('Logout')+'</a>';
            if (!fm.username) text=IDL('AuthNeeded');
            fm.tip(ge('vk_lastfm_icon'),text);
         }
      }*/
      var set=function(func){
         var els=geByClass('lastfm_status_icon');
         for (var i=0; i<els.length;i++){ 
            //alert(els[i]);
            if (icon){
               removeClass(els[i],'vk_lastfm_playing_icon');
               removeClass(els[i],'vk_lastfm_paused_icon');
               removeClass(els[i],'vk_lastfm_ok_icon');
               removeClass(els[i],'vk_lastfm_fail_icon');
            }
            func(els[i]);
         }
         var vis=isVisible(els[0]);
         var els=geByClass('lastfm_fav_icon');
         for (var i=0; i<els.length;i++){ 
            (vis?show:hide)(els[i]);
         }
      };
            
      //var el=ge('vk_lastfm_status_icon');
      set(function(el){
         if (icon)
         switch (icon) {
            case 'playing': 
               show(el);
               el.onmouseover=function(){
                  var time=function(){
                     return (new Date(fm.s_timer.get_remaing())).format('MM:ss');
                  };
                  var text=IDL('TimeRemaining').replace('<time>','<span class="lastfm_timer">'+time()+'</span>');
                  //if (fm.scrobled) text=fm.lang['TrackPassed']
                  var upd=null;
                  fm.tip(el, text,   {
                     onHide:function(){ clearInterval(upd); },
                     onShowStart:function(tt){
                        var t=geByClass('lastfm_timer',tt.container)[0];  
                        upd=setInterval(function(){
                           if (t)
                              val(t, time());
                           else
                              clearInterval(upd);
                           
                        },1000);
                     }
                  });
               };
               addClass(el,'vk_lastfm_playing_icon');//el.className='vk_lastfm_playing_icon';
               break;
            case 'paused':
               show(el);
               addClass(el,'vk_lastfm_paused_icon');//el.className='vk_lastfm_paused_icon';
               break; 
            case 'scrobled':
               show(el);
               if (el.tt) el.tt.hide();
               el.onmouseover=function(){
                   fm.tip(el, IDL('TrackScrobbled'));
               };
               addClass(el,'vk_lastfm_ok_icon');//el.className='vk_lastfm_ok_icon';
               break; 
            case 'scrobled_fail':
               show(el);
               if (el.tt) el.tt.hide();
               el.onmouseover=function(){
                  fm.tip(el, IDL('TrackNotScrobbled'));
               };
               addClass(el,'vk_lastfm_fail_icon');//el.className='vk_lastfm_fail_icon';
               break;             
            case 'hide':
               hide(el);
               //el.className='';
               break; 
         }
         
         if (!fm.enable_scrobbling){
            hide(el);
         } else /*if (el.className!='')*/ show(el);
         
         var el_s=ge('vk_lastfm_status_small_icon');
         if (el_s){
            el_s.className=el.className;
            (isVisible(el)?show:hide)(el_s);
         }
      
      });
   },
   onPlayerState:function(act){
      var fm=vkLastFM;
      var info=fm.audio_info();
      fm.ui();
      switch (act) {
         case 'load':
               if (fm.last_track.aid == info.aid) return;
               fm.set_love_icon(true);
               fm.last_track=info;
               vkViewAlbumInfo(info.artist,info.title);
               if (fm.s_timer) fm.s_timer.pause();
               fm.scrobled=false;
               fm.scrobble_timer(info);
               fm.now_playing(info);
               fm.set_icon(info,'playing');        // add scrobbler icon track         
            break;
         case 'play':    //if (fm.last_track.aid!=info.aid){ } else { }
             vkViewAlbumInfo(info.artist,info.title);
             if (!fm.scrobled){ 
                fm.s_timer.resume();
                fm.set_icon(info,'playing');          // animate scrobbler icon track
             }
            break;
         case 'pause': 
            if (!fm.scrobled){
               fm.s_timer.pause();         
               fm.set_icon(info,'paused'); // pause scrobbler icon track (stop animate);
            }             
            break;
         case 'stop':
            if (fm.s_timer) {
               fm.s_timer.pause();
               fm.s_timer.kill();
            }
            fm.set_icon(info,'hide');              // remove icons 
            fm.last_track = {};
            break;
      }
   },
   onLibFiles:function(file_name){
      //*
      if (file_name=='audioplayer.js') //'new_player.js'
         Inj.End('audioPlayer.setGraphics','vkLastFM.onPlayerState(act);');//*/
      //audioPlayer.pauseTrack
   }
};

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
   var PLUGIN_ID = 'vklastfm';
   var PLUGIN_NAME = 'LastFM scrobbler';
   var ADDITIONAL_CSS='\
   #vk_lastfm_icon, .vk_lastfm_icon{cursor:pointer; height:16px; width:16px; margin-left: 2px; background:url("'+vkLastFM.res.blue.last_fm+'") 50% 50% no-repeat;}\
   #vk_lastfm_icon.disabled,.vk_lastfm_icon.disabled{opacity:0.5;}\
   #vk_lastfm_small_icons{position:absolute; margin-left:-16px;}\
   #gp.reverse #vk_lastfm_small_icons{margin-left: 133px;}\
   #vk_lastfm_icons{position:absolute; margin-left:-40px; height:16px; width:40px;}\
   .lastfm_fav_icon{cursor:pointer; background:url(\'/images/icons/like.gif\'); width:10px; height:10px; margin-top:4px; margin-left:1px; opacity:0.4 }\
   .lastfm_fav_icon:hover{opacity:0.7;}\
   .lastfm_fav_icon.loved{opacity:1;}\
   \
   .vk_lastfm_playing_icon{float:left; height:16px; width:11px; background:url("'+vkLastFM.res.blue.playing_icon+'") 50% 50% no-repeat;}\
   .vk_lastfm_paused_icon{float:left; height:16px; width:11px; background:url("'+vkLastFM.res.blue.paused_icon+'") 50% 50% no-repeat;}\
   .vk_lastfm_ok_icon{float:left; height:16px; width:8px; background:url("'+vkLastFM.res.blue.scrobble_ok+'") 0 50% no-repeat;}\
   .vk_lastfm_fail_icon{float:left; height:16px; width:8px; background:url("'+vkLastFM.res.blue.scrobble_fail+'") 0 50% no-repeat;}\
   \
   #gp .active .vk_lastfm_icon{background-image:url("'+vkLastFM.res.white.last_fm+'");}\
   #gp .active .vk_lastfm_playing_icon{background-image:url("'+vkLastFM.res.white.playing_icon+'");}\
   #gp .active .vk_lastfm_paused_icon{background-image:url("'+vkLastFM.res.white.paused_icon+'");}\
   #gp .active .vk_lastfm_ok_icon{background-image:url("'+vkLastFM.res.white.scrobble_ok+'");}\
   #gp .active .vk_lastfm_fail_icon{background-image:url("'+vkLastFM.res.white.scrobble_fail+'");}\
   #gp .active .lastfm_fav_icon{background-position: 0 -10px;}\
   \
   .lastfm_ac .vk_lastfm_icon, .lastfm_pd .vk_lastfm_icon, #gp .gp_vka_ctrls .vk_lastfm_icon{background-image:url("'+vkLastFM.res.blue.last_fm+'");}\
   .lastfm_ac .vk_lastfm_playing_icon, .lastfm_pd .vk_lastfm_playing_icon, #gp .gp_vka_ctrls .vk_lastfm_playing_icon{background-image:url("'+vkLastFM.res.blue.playing_icon+'");}\
   .lastfm_ac .vk_lastfm_paused_icon, .lastfm_pd .vk_lastfm_paused_icon, #gp .gp_vka_ctrls .vk_lastfm_paused_icon{background-image:url("'+vkLastFM.res.blue.paused_icon+'");}\
   .lastfm_ac .vk_lastfm_ok_icon, .lastfm_pd .vk_lastfm_ok_icon, #gp .gp_vka_ctrls .vk_lastfm_ok_icon{background-image:url("'+vkLastFM.res.blue.scrobble_ok+'");}\
   .lastfm_ac .vk_lastfm_fail_icon, .lastfm_pd .vk_lastfm_fail_icon, #gp .gp_vka_ctrls .vk_lastfm_fail_icon{background-image:url("'+vkLastFM.res.blue.scrobble_fail+'");}\
   #gp .gp_vka_ctrls .lastfm_fav_icon{background-position: 0 0px;}\
   \
   .gp_tip_text a{color:#FFF}\
   #ac .duration, #pd .duration{margin-right:0px !important;}\
   .lastfm_status{width:40px;}\
   .lastfm_gp{\
      position: absolute; \
      padding: 3px;  \
      margin-left: -45px;\
      width:40px;\
   }\
   .gp_vka_ctrls .lastfm_gp{margin-top: -2px; padding:0px;}\
   #gp_small:hover lastfm_gp{\
      background-color: rgba(0, 0, 0, 0.3);\
   }\
   .lastfm_ac, .lastfm_pd{\
      width:60px;\
      padding-left:6px;\
   }\
   .lastfm_status{width:40px;}\
   .lastfm_pd .lastfm_status, .lastfm_ac .lastfm_status{padding-left: 13px;}\
   ';

   vkopt_plugins[PLUGIN_ID]={
      Name:PLUGIN_NAME,
      css:ADDITIONAL_CSS,
      init:             vkLastFM.init,
      onLocation:       vkLastFM.on_location,
      onLibFiles:       vkLastFM.onLibFiles
   };
   if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();



var preview_album_info_tpl='<div class="audio_filter_sep"></div>\
                       <h4 onclick="slideToggle(\'vk_album_full_info\');">\
                           <img onclick="vkViewAlbumThumb(event);" class="big" src="%IMG2%">\
                           <img onclick="vkViewAlbumThumb(event);" class="small fl_l" src="%IMG%"><span class="divide_">\
                           <div class="fl_r fix_btn" onclick="vkViewAlbumFix(event)" onmouseover="vkViewAlbumFix(this,true)"><span class="vk_audio_icon"></span></div>\
                           <b>%ARTIST%</b><br>%NAME%</span>\
                       </h4>\
                       <div id="vk_album_full_info" style="display:none;">\
                          <!--<img class="fl_r vk_album_thumb" src="%IMG%">-->\
                          <div class="vk_album_tracks">%TRACKS%</div>\
                       </div>\
';

var vk_alb_last_track='';
var vk_current_album_info=null;
var vk_current_album_full_thumb=false;


function vkViewAlbumFix(e,over){
   if (over){
      showTooltip(e, {text: IDL('FixAlbumInfo'), showdt: 0, black: 1, shift: [11, 0, 0]});
      return;
   }
   cancelEvent(e);
   toggleClass('vk_album_info','fixed_album');
}
function vkViewAlbumThumb(ev){
   cancelEvent(ev);
   toggleClass('vk_album_info','view_big');
   vk_current_album_full_thumb=hasClass('vk_album_info','view_big');
   vkSetVal('vk_album_info_thumb',vk_current_album_full_thumb?1:0);
}
function vkViewAlbumInfo(artist,track){
   if (getSet(73)!='y') return;
   var p=ge('album_filters');
   if (!p) return;
   if (!ge('vk_album_info')){
      var div=vkCe('div',{id:'vk_album_info'},'<div class="audio_filter_sep"></div>'); 
      insertAfter(div,ge('album_filters'));
      vk_current_album_full_thumb=parseInt(vkGetVal('vk_album_info_thumb') || '0') || false;
   } else if (vk_alb_last_track==artist+'-'+track && ge('vk_album_info').innerHTML!=''){
      return;
   }
   if (hasClass('vk_album_info','fixed_album')) return;
   val(ge('vk_album_info'), '');
   vk_alb_last_track=artist+'-'+track;
   vk_current_album_info=null;
   vkGetAlbumInfo(artist,track,function(data,tracks){
      if (!ge('vk_album_info')) return;
      if (vk_current_album_full_thumb) 
         addClass('vk_album_info','view_big');
      if (vk_DEBUG) console.log(data);
      var html='';
      /*
      console.log(
         data.artist,
         data.name,
         data.releasedate,
         data.image[1]['#text'],
         tracks
      );
      */
      if (tracks){
         vk_current_album_info=data;
         for (var i=0; i<tracks.length;i++){
            var track_artist = data.artist || data.name;
            var track_name = (track_artist == 'Various Artists' ? '' : track_artist + ' - ') + tracks[i];
            html+='<li><a href="/search?c[q]='+encodeURIComponent(track_name)+'&c[section]=audio" '+
               'onclick="if (checkEvent(event)) { event.cancelBubble = true; return}; '+
                  'vk_audio.search_track(event, \''+track_name.replace(/'/,'\\\'')+'\'); return false">'+tracks[i]+'</a></li>';
         }
         html='<ul>'+html+'</ul><div class="vk_tracks_search_btn"><div class="button_blue button_wide"><button onclick="vkAlbumCollectPlaylist()">'+IDL('SearchAlbumTracks')+'</button></div></div>';
      }
      if (data.act!='artist_info'){
         var year=(new Date(data.releasedate)).getFullYear();
         html=preview_album_info_tpl.replace(/%ALBUM%/g,IDL('Album'))
                                    .replace(/%NAME%/g,'<a href="'+data.url+'" target="_blank">'+data.name+(year?' ('+year+')':'')+'</a>')
                                    .replace(/%ARTIST%/g,data.artist)
                                    .replace(/%IMG%/g,data.image[1]['#text'] || '/images/question_c.gif')
                                    .replace(/%IMG2%/g,data.image[2]['#text'] || '/images/question_c.gif')
                                    .replace(/%TRACKS%/g,html);
      } else {
         html=preview_album_info_tpl.replace(/%ALBUM%/g,IDL('Album'))
                                    .replace(/%NAME%/g,'')
                                    .replace(/%ARTIST%/g,'<a href="'+data.url+'" target="_blank">'+data.name+'</a>')
                                    .replace(/%IMG%/g,data.image[1]['#text'] || '/images/question_c.gif')
                                    .replace(/%IMG2%/g,data.image[2]['#text'] || '/images/question_c.gif')
                                    .replace(/%TRACKS%/g,html || (data.bio.summary?'<div class="bio">'+data.bio.summary+'</div>':''));      
      }
      val(ge('vk_album_info'), html);
      
   });
}

function vkGetSongInfoFromNode(node) {
    var aid=(node.getAttribute('id') || "").match(/-?\d+_\d+/);
    aid=aid?aid[0]:"";
    var art, title, nfo = geByClass1('info', node), full_id = aid, l;
    if (!nfo) return null;
    art = geByTag1('b', nfo);
    l = geByTag1('a', art);
    if (l) art = l;
    var reArr = ['<span>', '</span>', '<span class="match">', '<font>', '</font>'], re = new RegExp(reArr.join('|'), "gi");
    art = art.innerHTML.replace(re, '');
    title = geByClass1('title', nfo);
    if (!title) return null;
    l = geByTag1('a', title);
    if (l) title = l.innerHTML;
    else title = title.innerHTML;
    title = title.replace(re, '');
    var data = geByTag1('input',node).value.split(','), url = data[0], duration = parseInt(data[1]);
    var dur = duration;//audioPlayer.formatTime
    data = aid.split('_');
    var oid = data[0], aid = data[1], res = {
      0: oid,
      1: aid,
      2: url,
      3: duration,
      4: dur,
      5: art,
      6: title,
      7: 0,
      8: 0,
      9: oid != vk.id ? 1 : 0
    };
    res.full_id = full_id;
    return res;
}

vk_aalbum={
   s_cache:{},
   s_toggle:function(idx){
      val(ge('vk_audios_search'+idx), trim(ge('vk_audios_search'+idx).innerHTML)!=''?'':vk_aalbum.s_cache['au'+idx]);
   },
   search_tracks:function(list){
      if (!list || !list.length) return;
      var result=vkCe('div',{});
      var box=null;

      vk_aalbum.s_cache={};
      var abort=false;
      var idx=0;
     
     var mk=false;
      var get_track=function(){
         if (mk) return;
         /*if (abort){
            removeClass(cur.searchCont, 'loading');
            return;
         }*/
         if (idx>=list.length || abort){
            mk=true;
            box.hide();
            
            //var res = cur.audiosIndex.search(htmlencode(str));
            var str='vkalbum';
            var newList = cur.curSection;
            newList += '_search_'+str;
            cur.curList = newList;
            cur.audiosList[cur.curList] = [];
            
            removeClass(cur.searchCont, 'loading');
            val(cur.aContent, '');
            val(cur.sContent, '');
            if (window.vk_au_down) val(cur.sContent, '<a href="#" id="vk_links_to_audio_on_page" onclick="return vk_audio.links_to_audio_on_page();">'+IDL('Links')+'</a>');
            cur.sContent.innerHTML += result.innerHTML;
            show(cur.sContent);
            hide(cur.sShowMore);
            removeClass('audios_list', 'light');
            Audio.showRows();
            return;
         }
            
         val(ge('vk_scan_msg'), vkProgressBar(idx,list.length,310, '['+idx+'/'+list.length+'] %'));

         //progressbar
         
         var name=list[idx][0]+'-'+list[idx][1];
         var query={
                  act: "search", offset: 0, sort: 0, performer: 0,
                  id     : cur.id, 
                  gid    : cur.gid,
                  q      : winToUtf(name)
               };
         ajax.post(Audio.address, query, {
            onDone: function(res) {
               var div=vkCe('div',{},res);
               var els=geByClass('audio',div);
               var au=els[0];
               for (var i=0; i<els.length; i++){
                  //au=els[i];
                  var info=vkGetSongInfoFromNode(els[i]);
                  if (info[5]==list[idx][0] && info[6]==list[idx][1]){
                     au=els[i];
                  }
                  //console.log(info[5],info[6]);
               }
               if (au){
                  ge('vk_scan_info').innerHTML+=name+'<br>';
                  result.appendChild(au);
                  if (els.length>1){
                     result.appendChild(se('<div class="vk_au_search_block_btn fl_r"><small><a href="#" onclick="vk_aalbum.s_toggle('+idx+'); return false;">'+IDL('ShowMore')+' +'+(els.length-1)+'</a></small></div>'));
                     result.appendChild(se('<div class="vk_au_search_block" id="vk_audios_search'+idx+'"></div>'));
                     
                     var c=se('<div></div>');
                     for (var i=0; i<els.length; i++){
                        if (els[i]!=au)
                           c.appendChild(els[i]);
                     }
                     vk_aalbum.s_cache['au'+idx]=c.innerHTML;
                     c=null;
                  }
               }
               else
                  ge('vk_scan_info').innerHTML+='<b>Search failed:</b> '+name+'<br>'; 
               idx++;
               setTimeout(function(){get_track();},(idx%10==0 || !au)?2000:100);
               //get_track();
            }
         });
      };
      addClass(cur.searchCont, 'loading');
      //val(cur.aContent, '');
      
      box=new MessageBox({title: IDL('Searching...'),closeButton:true,width:"350px", onHide:function(){abort=true; get_track();} });
      box.removeButtons();
      box.addButton(IDL('Cancel'),function(){abort=true; box.hide(); get_track();},'no');
      var html='</br><div id="vk_scan_msg"></div><div id="vk_scan_info" style="padding-bottom:10px;"></div>';
      box.content(html).show();

      get_track();
      
   }
};
function vkAlbumCollectPlaylist(){
   if (!vk_current_album_info) return;
   var result=vkCe('div',{});
   var box=null;
   
   var abort=false;
   var idx=0;
   
   var mk=false;
   var get_track=function(){
      if (mk) return;
      /*if (abort){
         removeClass(cur.searchCont, 'loading');
         return;
      }*/
      if (idx>=vk_current_album_info.tracks.length || abort){
         mk=true;
         box.hide();
         //alert('make\n'+result.innerHTML);
         //var res = cur.audiosIndex.search(htmlencode(str));
         var str='vkalbum';
         var newList = cur.curSection;
         newList += '_search_'+str;
         cur.curList = newList;
         cur.audiosList[cur.curList] = [];
         
         removeClass(cur.searchCont, 'loading');
         val(cur.aContent, '');
         val(cur.sContent, '');
         if (window.vk_au_down) val(cur.sContent, '<a href="#" id="vk_links_to_audio_on_page" onclick="return vk_audio.links_to_audio_on_page();">'+IDL('Links')+'</a>');
         cur.sContent.innerHTML += result.innerHTML;
         show(cur.sContent);
         hide(cur.sShowMore);
         removeClass('audios_list', 'light');
         Audio.showRows();
         return;
      }
         
      val(ge('vk_scan_msg'), vkProgressBar(idx,vk_current_album_info.tracks.length,310, '['+idx+'/'+vk_current_album_info.tracks.length+'] %'));

      //progressbar
      var track_artist = (vk_current_album_info.artist || vk_current_album_info.name);
      var name = (track_artist == 'Various Artists' ? '' : track_artist + ' - ') + vk_current_album_info.tracks[idx];
      var query={
               act: "search", offset: 0, sort: 0, performer: 0,
               id     : cur.id, 
               gid    : cur.gid,
               q      : name
            };
      ajax.post(Audio.address, query, {
         onDone: function(res) {
            var div=vkCe('div',{},res);
            var els=geByClass('audio',div);
            var au=els[0];
            for (var i=0; i<els.length; i++){
               //au=els[i];
               var info=vkGetSongInfoFromNode(els[i]);
               if (info[5]==vk_current_album_info.artist && info[6]==vk_current_album_info.tracks[idx]){
                  au=els[i];
               }
               //console.log(info[5],info[6]);
            }
            if (au){
               ge('vk_scan_info').innerHTML+=name+'<br>';
               result.appendChild(au);
               //console.log(result.innerHTML+'\n\n\n');
            }
            else
               ge('vk_scan_info').innerHTML+='<b>Search failed:</b> '+name+'<br>'; 
            idx++;
            setTimeout(function(){get_track();},(idx%10==0 || !au)?2000:100);
            //get_track();
         }
      });
   };
   addClass(cur.searchCont, 'loading');
   //val(cur.aContent, '');
   
   box=new MessageBox({title: IDL('Searching...'),closeButton:true,width:"350px", onHide:function(){abort=true; get_track();}});
   box.removeButtons();
   box.addButton(IDL('Cancel'),function(){abort=true; box.hide(); get_track();},'no');
   var html='</br><div id="vk_scan_msg"></div><div id="vk_scan_info" style="padding-bottom:10px;"></div>';
   box.content(html).show();

   get_track();
}
                       
var vk_album_info_cache=[];
function vkGetAlbumInfo(artist,track,callback){
   var in_cache=function(artist,track){
      for (var i=0; i<vk_album_info_cache.length;i++){
         var c=vk_album_info_cache[i];
         if (c.artist==artist && c.track==track)
            return c.data;
      }
      return false;
   };
   var x=in_cache(artist,track);
   if (x){ 
      if (vk_DEBUG) console.log('in cache',x);
      setTimeout(function(){callback(x,x.tracks)},2);
   }else
      vkLastFM.lastfm.track.getInfo({
            artist: artist,
            track: track,
            //username:LastFM_UserName,
            autocorrect: 1
         }, {
            success: function(data) {
                  if (vk_DEBUG) console.log(data);
                  if (data.track.album) {
                     var params={
                        mbid: data.track.album.mbid
                     };
                     if (!data.track.album.mbid || data.track.album.mbid=="")
                        params={
                           artist: data.track.album.artist,
                           album:data.track.album.title
                        };
                     vkLastFM.lastfm.album.getInfo(params, {
                        success: function(data) { 
                           //console.log(data);
                           data=data.album;
                           var tracks=[];
                           for (var i=0; i<data.tracks.track.length;i++){
                              var t=data.tracks.track[i];
                              if (data.artist == 'Various Artists')
                                  tracks.push(t.artist.name + ' - ' + t.name);
                              else
                                  tracks.push(t.name);
                              if (!in_cache(artist,t.name)){
                                 vk_album_info_cache.push({
                                    artist: artist,
                                    track: t.name, 
                                    data:data
                                 });
                              }
                           }
                           vk_album_info_cache.push({
                              artist: artist,
                              track: track, 
                              data:data
                           });
                           data.tracks=tracks;
                           callback(data,tracks);
                           /*console.log(data)*/
                        }
                     });
                  } else if (data.track.artist && (data.track.artist.mbid || data.track.artist.name)){//data.track.artist.name
                     if (vk_DEBUG) console.log('no album info... load artist info');
                     var params={lang:'ru'};
                     if (data.track.artist.mbid)
                        params['mbid']=data.track.artist.mbid;
                     else 
                        params['artist']=data.track.artist.name;
                     //*  
                     // GET ARTIST INFO
                     vkLastFM.lastfm.artist.getInfo(params, {
                        success: function(a_data) {
                          a_data=a_data.artist;
                          a_data.act='artist_info';
                          if (vk_DEBUG) console.log(a_data);
                          //callback(data,null);
                          
                          // GET TOP TRACKS INFO
                          params['limit']=100;
                           vkLastFM.lastfm.artist.getTopTracks(params, {
                              success: function(data) {
                                 //console.log(data);
                                 data=data.toptracks;
                                 //data.image=a_data.image;
                                 //data.bio=a_data.bio;
                                 data.act='top_tracks';
                                 //a_data.artist
                                 var tracks=[];
                                 for (var i=0; i<data.track.length;i++){
                                    var t=data.track[i];
                                    tracks.push(t.name);
                                    /*
                                    if (!in_cache(artist,t.name)){
                                       vk_album_info_cache.push({
                                          artist: artist,
                                          track: t.name, 
                                          data:a_data,
                                          
                                       });
                                    }*/
                                 }
                                 vk_album_info_cache.push({
                                    artist: artist,
                                    track: track, 
                                    data:a_data
                                 });
                                 //data.tracks=tracks;
                                 a_data.tracks=tracks;
                                 callback(a_data,tracks);
                                 /*console.log(data)*/
                              },
                              error: function(code, message) {
                                 if (vk_DEBUG) console.log(code, message);
                                 callback(a_data,null);
                              }
                           });                          
                        }
                     });//*/
                     
                     
                     
                  }
                  else if (vk_DEBUG) console.log('no info')
               }, 
            error: function(code, message) {
                  if (vk_DEBUG) console.log(code, message)
               }
         }
      );
}


vk_apps = {
   page:function(){
      if (ge('app_edit_summary'))
         ge('app_edit_summary').onclick=vk_apps.view_adm_apps;
   },
   view_adm_apps: function() {
      var list = cur.appsList[cur.curList] || [];
      
      var contents = [ge('app_rows'), ge('app_site_list'), ge('app_desktop_list'), ge('app_edit_list')];
      var more_buttons = [ge('more_link'), ge('site_more_link'), ge('desktop_more_link'), ge('edit_more_link')];
      var results = [ge('app_rows'), ge('app_site_results'), ge('app_desktop_results'), ge('app_edit_results')];
      var wraps = [null, ge('app_site_wrap'), ge('app_desktop_wrap'), ge('app_edit_wrap')];
      var i = 3;
      var apps = Apps.filterByAppAdmin(list);
      cur.totalCounters[i] = apps.length;
      cur.shownCounters[i] = apps.length;
      show(wraps[i]);
      show(results[i]);
      
      val(contents[i], '');
      hide(more_buttons[i]);
      var html = [];
      for (var k in apps) {
         var app = apps[k];
         
         html.push(Apps.drawApp(app, false, true));
      }
      var au = ce('div', {
         innerHTML: html.join('')
      });
      while (au.firstChild) {
         contents[i].appendChild(au.firstChild);
      }
   }
};

////////////////////
// DOWNLOAD CODE //
//////////////////
vk_vid_down={
   vid_page:function(){
      if (getSet(2)=='y'){
         if (cur.videoTpl){ 
            //Inj.Start('cur.videoTpl','console.log(v);');
            if (window.vk_vid_down){
               Inj.Replace('cur.videoTpl','tags,','tags+vk_vid_down.vkVidGetLinkBtn(v),');// or move this to 'vkInj'?
               Inj.Replace('cur.videoTpl','return rs(','var res=rs(');
               Inj.End('cur.videoTpl','res=vk_vid_down.vkVidGetLinkBtn(v,res); return res;');
               if (cur.videoTplHTML && cur.videoTplHTML.indexOf('%download%')==-1)
                  cur.videoTplHTML=cur.videoTplHTML.replace('<a','%download%<a');
            }
         }
      }
      vk_vid_down.vkVideoGetLinksBtn();      
   },
   inj_vidview:function(){
      vk_vid_down.vkVidVarsGet();
      if (getSet(2)=='y') Inj.End('videoview.showVideo','setTimeout(vk_vid_down.vkVidLinks,0);');//Inj.After('videoview.showVideo','innerHTML = info;','setTimeout(vk_vid_down.vkVidLinks,0);');
   },
   process_node:function(node){
      vk_vid_down.vkVidAddGetLink(node);
   },
   get_ivi_links:function(vid,callback){
      // 'http://www.ivi.ru/watch/'+vid
      var rnd=Math.random()*1000000000000;
      var data={
         "method":"da.content.get",
         "params":[
            vid,
            {
               "utmfullinfo":"",
               "_url":null,
               "watchid":[vid,rnd,unixtime()].join('_'),
               "site":"s132",
               "_domain":null,
               "uid":rnd,
               "referrer":null,
               "contentid":vid,
               "campaignid":"",
               "sourceid":""
            }
         ]
      };
      
      var ondone=function(r) {
         var vars=JSON.parse(r);
         var links=vars.result.files;
         if (!links){ 
            callback([]);
            return;
         }
         var res=[];
         for (var i=0; i<links.length; i++){
            if (links[i].content_format!='Flash-Access')
               res.push([
                  links[i].url,
                  links[i].content_format
               ]);
         }
         callback(res);
         //console.log(r);
      };
      
     
      // XFR2.send({ url:'http: //api.digitalaccess.ru/api/json/', method: 'POST', data:JSON.stringify(data)},function(r){ alert(r.text);  });

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://api.digitalaccess.ru/api/json/', true);
      xhr.onreadystatechange = function(){         
         if (xhr.readyState == 4) {
            ondone(xhr.responseText);
         }
      };
      xhr.send(JSON.stringify(data));
   },
   ivi_links:function(ivi_id){
      ivi_id=ivi_id+"";
      if (!/^\d+$/.test(ivi_id)){
         ivi_id=(ivi_id.match(/videoId=(\d+)/)||[])[1];// + may be need parse siteId=s132 ...
      }
      vk_vid_down.get_ivi_links(ivi_id,function(r){
         if (!r) return;
         var html='';//'<a href="http://www.ivi.ru/watch/'+ivi_id+'">ivi.ru</a>'; 
         //alert(html);
         for (var i=0;i<r.length;i++)
            html+='<a href="'+r[i][0]+'" title="'+r[i][1]+'"  class="clear_fix">'+IDL("download")+' ['+r[i][1]+']</a>';
         val(ge('vkyoutubelinks'), '<a id="vkyoutubelinks_show" href="javascript: toggle(\'vkyoutubelinks_list\');">'+IDL('download')+'</a><span id="vkyoutubelinks_list" style="display:none;">'+html+'</span>');    });
      return '<span id="vkyoutubelinks"></span>';
   },
   vkVideoGetLinksBtn: function(){
      if (getSet(2)!='y') return;
      
      return {
         l:IDL('Links',2), 
         onClick:function(){
            vk_vid_down.vkVideoGetLinks(cur.oid,((nav.objLoc['section'] || "").match(/\d+/) || 0));
         }
      
      }
      /*
      var p=ge('video_albums_list');
      if (p && !ge('video_get_links')){
         var attrs={
            'id':"video_get_links",
            'class':"side_filter",
            'onmouseover':"addClass(this, 'side_filter_over');",
            'onmouseout':"removeClass(this, 'side_filter_over');"      
         };
         
         p.insertBefore(vkCe('div',attrs,IDL('Links')),p.firstChild);
      }
      */
   },
   vkVideoGetLinks: function(oid,aid){
   //vkApis.videos: function(oid,aid,quality,callback,progress){// quality: 0 - 240p; 1 - 360p;  2 - 480p;  3 - 720p; 4 - 1080p

      var box=vkAlertBox(IDL('Links'),'<div id="vk_links_container">'+vkBigLdrImg+'</div>');
      box.setOptions({width:"325px"});
      var div=ge('vk_links_container');
      var q=3;
      
      
      
      var run=function(quality){
         q = quality!=null?quality:3;
         box.setOptions({width:"640px"});
         val(ge('vk_links_container'), vkBigLdrImg);
         vk_vid_down.videos(oid,aid,q,function(r){
            show_links(r);
         },function(c,f){
            if (!f) f=1;
            val(ge('vk_links_container'), vkProgressBar(c,f,600));
         });
         return false;
      };
      
      val(ge('vk_links_container'), '\
      <a class="vk_down_icon" href="#"  id="vk_glinks_max240p">240p<small class="divide">max</small></a>\
      <a class="vk_down_icon" href="#"  id="vk_glinks_max360p">360p<small class="divide">max</small></a>\
      <a class="vk_down_icon" href="#"  id="vk_glinks_max480p">480p<small class="divide">max</small></a>\
      <a class="vk_down_icon" href="#"  id="vk_glinks_max720p">720p<small class="divide">max</small></a>\
      <a class="vk_down_icon" href="#"  id="vk_glinks_max1080p">1080p<small class="divide">max</small></a>\
      ');
      ge('vk_glinks_max240p').onclick=run.pbind(0);
      ge('vk_glinks_max360p').onclick=run.pbind(1);
      ge('vk_glinks_max480p').onclick=run.pbind(2);
      ge('vk_glinks_max720p').onclick=run.pbind(3);
      ge('vk_glinks_max1080p').onclick=run.pbind(4);
      
      var show_links=function(list){
			
			var smartlink=(getSet(1) == 'y');
	
            var links=[];
            var metalinklist=['<?xml version="1.0" encoding="UTF-8" ?>',
                        '<metalink version="3.0" xmlns="http://www.metalinker.org/">',
                        '<files>'];
						
			
            for (var i=0;i<list.length;i++){
			
               var itm = list[i][0];
               var itm_name = list[i][1];
			   var itm_ext = list[i][2];
			   
			   var vidname = (itm.indexOf('?')==-1?'?':'')+vkDownloadPostfix()+'&/'+vkEncodeFileName(itm_name) + itm_ext;
			   var itm2uri = itm + (smartlink ? vidname : '');

               links.push(itm2uri);
			   
               metalinklist.push('<file name="'+itm_name+itm_ext+'">');
               metalinklist.push('<resources>','<url type="http" preference="100">'+itm+'</url>','</resources>');
               metalinklist.push('</file>');
			  // console.log([itm,itm2,itm_name,smart2link]);

            }
			
			metalinklist.push('</files>');
			metalinklist.push('</metalink>');

            box.hide();
			
			var metalinklist_joined = metalinklist.join('\n').replace(/&/g,'&amp;');
				var metalinklist_html='<div class="vk_links_list">'
					+'<textarea class="vk_video_linklist_area">'+metalinklist_joined.replace(/&/g,'&amp;')+'</textarea>'
					+'<a download="video_playlist.metalink" href="data:text/plain;base64,' + base64_encode(utf8_encode(metalinklist_joined)) + '">'
						+vkButton(IDL('.METALINK (UTF-8)'))
					+'</a>'
				+'</div>';
			
            var tabs=[];

            tabs.push({name:IDL('links'),active:true, content:'<div class="vk_mp3_links"><textarea id="vk_mp3_links_area">'+links.join('\n')+'</textarea></div>'});
			tabs.push({name:IDL('Metalink'),active:false, content:metalinklist_html});
            box=vkAlertBox(IDL('links'),vkMakeContTabs(tabs));
            box.setOptions({width:"560px"});
           
      } 
   },
   vkVidDownloadLinks: function(vars){
       // /video.php?act=a_flash_vars&vid=39226536_159441582
       ////
      var smartlink=(getSet(1) == 'y');
      var vidname=winToUtf(mvcur.mvData.title).replace(/\?/g,'%3F').replace(/&/g,'%26');
      vidname=vkCleanFileName(vidname);
      var vname=vidname;
      vidname=vkDownloadPostfix()+'&/'+vkEncodeFileName(vidname);
      //(smartlink?vidname+'.mov')
      if (!vars) return '';
      
      
      vars.host=vars.host+"";
      var vuid=function (uid) { var s = "" + uid; while (s.length < 5) {s = "0" + s;}  return s; };
      var get_flv=function() {
         if (VIDEO_LINKS_WITH_EXTRA && vars["url240"]) return vars["url240"];
         if (vars.sd_link != null && vars.sd_link.length > 0) {return vars.sd_link;}
         if (vars.uid <= 0) {   
            return "http://" + vars.host + "/assets/video"+(vars.ip_subm || vars.host.indexOf('vkadre')!=-1?'':'s')+"/" + vars.vtag + "" + vars.vkid + ".vk.flv";
         }
         var host = (vars.host.substr(0, 4) == 'http')
           ? vars.host
           : 'http://cs' + vars.host + '.' + 'vk.com' + '/';
           
         return host + "u" + vuid(vars.uid) + "/video"+(vars.ip_subm?'s':'')+"/" + vars.vtag + ".flv";
      };
      var pathToHD=function(res) {
         if (VIDEO_LINKS_WITH_EXTRA && vars["url"+res]) return vars["url"+res];
         var s = (vars.host.substr(0, 4) == 'http')
           ? vars.host
           : 'http://cs' + vars.host + '.' + 'vk.com' + '/';//(vk.intnat ? 'vk.com' : 'vkontakte.ru') 
         return s + 'u' + vars.uid + '/video'+(vars.ip_subm?'s':'')+'/' + vars.vtag + '.' + res + '.mp4';//'.mov'
      };
      var generateHDLinks=function(){
         var s="";
         var vidHDurl="";
         var res_list='360,360,480,720,1080'.split(',');
         if ( parseInt(vars.hd)>0)
            for (var i = 1; i <= parseInt(vars.hd); i++) {
            	var res = res_list[i] || res_list[0];
            	vidHDurl = pathToHD(res);
            	s += (vidHDurl) ? '<a href="' +
                  vidHDurl + (smartlink ? (vidHDurl.indexOf('?') == -1 ? '?' : '') + vidname + vkEncodeFileName(' [' + res + 'p]') + '.mp4' : '') + '" ' +
                  'download="' + vname + ' [' + res + 'p].mp4"  ' +
                  'title="' + vname + ' [' + res + 'p].mp4" ' +
                  'onclick="return vkDownloadFile(this);" ' +
                  'onmouseover="vk_vid_down.vkGetVideoSize(this); vkDragOutFile(this);">' +
                  IDL("downloadHD") + ' ' + res + 'p<small class="fl_r divide" url="' + vidHDurl + '"></small></a>' : "";
            }
            return s;
      };
      // делаем ссылки на превьюхи
      var generatePreviewLinks=function(){
         var i, s='', arr=(vars.timeline_thumbs_jpg || '').split(',');
         for (i=0; i<arr.length && vars.timeline_thumbs_jpg; i++)
            s += '<a href="'+arr[i]+'"> '+IDL("Preview")+' JPG #'+(i+1)+'</a>';  
         return s;
      }
      
      var ext='.mp4';
      if (vars.no_flv=='1'){
         var vidurl=pathToHD('240');
      } else {
         var vidurl=get_flv();
         ext = '.flv';
      }
      if (smartlink){
         vidurl+= (vidurl.indexOf('?')==-1?'?':'')+vidname+ext;
      }
      //alert(vname+'\n\n\n'+);
      vidurl =  '<a href="'+vidurl+'" download="'+vname+ext+'" title="'+vname+ext+'" '+
                'onclick="return vkDownloadFile(this);" '+
                'onmouseover="vk_vid_down.vkGetVideoSize(this); vkDragOutFile(this);">'+
                IDL("download")+
                '<small class="fl_r divide" url="'+vidurl+'"></small></a>';
      vidurl += generateHDLinks();
      
      // делаем кнопку на просмотр превьюх
      var thumbs=(vars.timeline_thumbs_jpg || '').split(',');
      if (vars.timeline_thumbs_jpg && thumbs.length) vidurl +='<a href="#" onclick="vk_phviewer.view([\''+thumbs.join("','")+'\']); return false;">'+IDL("Preview")+'</a>';
      
      vidurl += generatePreviewLinks();
      //vidname
      return vidurl;
   },
   vkVidDownloadLinksArray: function (vars){
       // /video.php?act=a_flash_vars&vid=39226536_159441582
      if (!vars) return '';
      /*
   "url240": "http:\/\/cs13429v4.vk.me\/u23411632\/videos\/1300789c13.240.mp4?extra=9OoNGuNoDd92U-6oUKdeTQd-2redX0RVXw_gNnz4lR4R2kHD0L4p8FHUUqZQqoeexZwsxVWZMM0GdUP6Am0S51H_vp8hlbwm",
   "url360": "http:\/\/cs13429v4.vk.me\/u23411632\/videos\/1300789c13.360.mp4?extra=9OoNGuNoDd92U-6oUKdeTQd-2redX0RVXw_gNnz4lR4R2kHD0L4p8FHUUqZQqoeexZwsxVWZMM0GdUP6Am0S51H_vp8hlbwm",
   "url480": "http:\/\/cs13429v4.vk.me\/u23411632\/videos\/1300789c13.480.mp4?extra=9OoNGuNoDd92U-6oUKdeTQd-2redX0RVXw_gNnz4lR4R2kHD0L4p8FHUUqZQqoeexZwsxVWZMM0GdUP6Am0S51H_vp8hlbwm",
   "url720": "http:\/\/cs13429v4.vk.me\/u23411632\/videos\/1300789c13.720.mp4?extra=9OoNGuNoDd92U-6oUKdeTQd-2redX0RVXw_gNnz4lR4R2kHD0L4p8FHUUqZQqoeexZwsxVWZMM0GdUP6Am0S51H_vp8hlbwm",
   "cache720": "http:\/\/cs9-10v4.vk.me\/p5\/a250c76ca76f.720.mp4?extra=-ZXwV8B-qUp3RG3U1BYFxDxQ4lzaKJwNmDgM_z6fSAKn6h1P3mo2dBut80EO98PAhWuU7sHd8ObY8UGNsDV0WuX-LLgTLRyz",
   
      */
      var result=[];
      var vuid=function (uid) { var s = "" + uid; while (s.length < 5) {s = "0" + s;}  return s; };
      var get_flv=function() {
         if (VIDEO_LINKS_WITH_EXTRA && vars["url240"]) return vars["url240"];
         if (vars.sd_link != null && vars.sd_link.length > 0) {return vars.sd_link;}
         if (vars.uid <= 0) return "http://" + vars.host + "/assets/video"+(vars.ip_subm || vars.host.indexOf('vkadre')!=-1?'':'s')+"/" + vars.vtag + "" + vars.vkid + ".vk.flv";
         return vars.host + "u" + vuid(vars.uid) + "/video"+(vars.ip_subm?'s':'')+"/" + vars.vtag + ".flv";
      };
      var pathToHD=function(res) {
         if (VIDEO_LINKS_WITH_EXTRA && vars["url"+res]) return vars["url"+res];
         var s = (vars.host.substr(0, 4) == 'http') ? vars.host : 'http://cs' + vars.host + '.' + 'vk.com' + '/';//(vk.intnat ? 'vk.com' : 'vkontakte.ru') 
         return s + 'u' + vars.uid + '/video'+(vars.ip_subm?'s':'')+'/' + vars.vtag + '.' + res + '.mp4';
      };
      var generateHDLinks=function(){
         var s="";
         var vidHDurl="";
         var res_list='360,360,480,720,1080'.split(',');
         if ( parseInt(vars.hd)>0)
           for (var i=1;i<=parseInt(vars.hd);i++){
            var res = res_list[i] || res_list[0];
            vidHDurl = pathToHD(res);
            if (vidHDurl) result.push(vidHDurl);
            //if (vars["cache"+res]) result.push(vars["cache"+res]); 
           }
           return s;
      };
      result.push((vars.no_flv=='1')?pathToHD('240'):get_flv());
      generateHDLinks();
      return result;
   },
   videos: function(oid,aid,quality,callback,progress){// quality: 0 - 240p; 1 - 360p;  2 - 480p;  3 - 720p; 4 - 1080p
      aid = parseInt(aid) || 0;
      quality = quality!=null ? quality : 3;
      var load=function(cback){
         var section = 'all'
         if (aid>0)
            section = 'album_'+aid;
         
         ajax.post('al_video.php', {act: 'load_videos_silent', oid: oid, offset: 0, section:section}, { // please_dont_ddos:2
            onDone: function(_list) {
               var list = JSON.parse(_list)[section]['list'];
               cback(list);
            }
         });
      };
      
      var load_api=function(cback){
         var album_list=[];
         var cur_offset=0;
         var scan=function(){
            var params={aid:aid,count:200,offset:cur_offset, owner_id:oid};
            dApi.call('video.get',params,function(r){
               var data=r.response;
               if (data.length>1){
                  data.shift();
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
         };
         scan();
      };
      
      var fmt=['240p','360p','480p','720p','1080p'];
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
            };
            var _oid=vids_info[idx][0];
            var _vid=vids_info[idx][1];
            AjGet('/video.php?act=a_flash_vars&vid='+_oid+'_'+_vid,function(t){
               if(!t || t=='NO_ACCESS'){
                  next();
               } else {
                  var obj=JSON.parse(t);
                  if (!obj.extra){
                        var arr=vk_vid_down.vkVidDownloadLinksArray(obj);
                        
                        var i=arr[quality]?quality:arr.length-1;
                           var v=arr[i];
                           var vidext=v.substr(v.lastIndexOf('.')).split('?')[0];  
                           
						   
                           var vidname=vkCleanFileName(winToUtf(decodeURIComponent(obj.title || obj.md_title))).replace(/\+/g,' ');

                           videos.push([v,vidname+' ['+fmt[i]+']',vidext]);
                  } else {
                    //not vk video
                  }
                  next();
               }         
            });   
      };    
      
      var api_used=false;
      var process=function(vids){
         //console.log('aid:',aid,'  oid:',oid,' quality:',quality/*,' vids:',vids*/);  
         var result=[];
         /* фильтрация по альбому. устаревший код.
         if (aid>0){ 
            for (var i=0; i<vids.length; i++){
               //console.log(vids[i][6]);
               if (parseInt(vids[i][6])==aid)
                  result.push(vids[i]);
            }
         } else 
         */
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
      };
      
      /*if (cur.oid==oid && cur.videoList && cur.videoList['all'] || false){
         process(cur.videoList['all']);
      } else*/ {
         load(process);
      }

   },
   vkVidGetLinkBtn: function(vid,res){//for cur.videoTpl  
      if (res){
         if (getSet(2)!='y' ||  getSet(66)=='n') return res.replace(/%download%/g,'');
         res=res.replace(/%download%/,'<div class="vk_vid_acts_panel"><div class="download_cont">\
            <span><a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[0]+','+vid[1]+',this.parentNode); return false;">'+IDL('download')+'</a></span>\
            <small class="fl_r '+(!window.vk_vid_list_adder?'vk_vid_add_hidden':'vk_vid_add_visible')+'"><a href="#" onclick="return vk_videos.add_to_group('+vid[0]+','+vid[1]+');">'+IDL('AddToGroup')+'</a>'+(cur_oid!=oid?'<span class="divide">|</span>':'')+'</small>\
            </div></div>'); 
         res=res.replace(/"video_raw_info_name">/,'"video_raw_info_name"><span class="vk_txt_icon" onclick="cancelEvent(event); vk_videos.get_description('+vid[0]+','+vid[1]+',this);"></span>');
         //alert(res);
         return res;
      }
      if (!vid || getSet(66)=='n') return '';
      var oid=parseInt(vid[0]);
      var cur_oid=(window.cur && cur.oid)?cur.oid:((window.nav && nav.objLoc) ? nav.objLoc[0].match(/-?\d+/):null);
      var href=(oid<0?'club':'id')+Math.abs(oid);
         
      var s=(cur_oid==oid?'':'<small class="fl_r owner_cont"><a href="/'+href+'" onmouseover="vkVidShowOwnerName('+oid+',this)">'+href+'</a></small>');

      return s+'<div class="download_cont">\
      <a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[0]+','+vid[1]+',this.parentNode); return false;">'+IDL('download')+'</a>\
      <small class="fl_r '+(!window.vk_vid_list_adder?'vk_vid_add_hidden':'vk_vid_add_visible')+'"><a href="#" onclick="return vk_videos.add_to_group('+vid[0]+','+vid[1]+');">'+IDL('AddToGroup')+'</a>'+(cur_oid!=oid?'<span class="divide">|</span>':'')+'</small>\
      </div>';
   },
   vkVidAddGetLink: function(node){
      if (getSet(2)!='y' ||  getSet(66)=='n') return;
      var vre=/(-?\d+)_(\d+)/;
      var els=geByClass('video_row_cont',node);
      for (var i=0; i<els.length; i++){
         var el=els[i];
         var vid=(el.id || '').match(vre);
         var p=geByClass('video_info_cont',el)[0] || geByClass('info',el)[0] ;
         if (!vid || !p || p.innerHTML.indexOf('vk_vid_down.vkVidLoadLinks')!=-1) continue;

         var div=vkCe('div',{'class':"download_cont"},'<a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode); return false;">'+IDL('download')+'</a>');
         
         var oid=parseInt(vid[1]);
         var href=(oid<0?'club':'id')+Math.abs(oid);
         var cur_oid=nav.objLoc[0].match(/-?\d+/);
         //alert((cur_oid!=oid)+'\n'+cur_oid+'\n'+oid);
         if (cur_oid!=oid)
            p.appendChild(vkCe('small',{'class':'fl_r owner_cont'},'<a href="/'+href+'" onmouseover="vkVidShowOwnerName('+oid+',this)">'+href+'</a>'),div.firstChild);
         p.appendChild(vkCe('small',{'class':'fl_r '+(!window.vk_vid_list_adder?'vk_vid_add_hidden':'vk_vid_add_visible')},
               '<a href="#" onclick="return vk_videos.add_to_group('+vid[1]+','+vid[2]+');">'+IDL('AddToGroup')+'</a>'+(cur_oid!=oid?'<span class="divide">|</span>':'')),
               div.firstChild);
         p.appendChild(div);  
      }
       
      var addlink=function(el){
         if (el && el.innerHTML.indexOf('vk_vid_down.vkVidLoadLinks')!=-1) return;
         if (geByClass('video_row',el)[0]) return;
         var v=geByClass('video',el)[0] || geByClass('image_div',el)[0];
         //console.log(v,el,geByClass('lnk',el)[0]);
         //alert('\n'+v.href+'\n'+el.innerHTML+'\n'+geByClass('lnk',el)[0]);
         if (!v) return;
         if (!v.href && v.parentNode.href) v = v.parentNode;
         if (!v.href) v=geByClass('lnk',el)[0];
         if (!v) return;
         if (v.innerHTML.indexOf('vk_vid_down.vkVidLoadLinks')!=-1) return;
         var vid=(v.href || '').match(vre);
         var type='';
         if (!vid || !vid[3]) {
            if (!vid) vid=(v.getAttribute("onclick") || '').match(vre);
            if (vid && (v.href || '').indexOf('youtube.com')!=-1){
               type='youtube';
               vid[3]=(v.href.split(/watch(?:\?v\=|%3Fv%3D)/)[1] || '').split('&')[0];
            }
            if (vid && (v.href || '').indexOf('vimeo.com')!=-1){
               type='vimeo';
               vid[3]=(v.href.split(/\/(\d+)/)[1] || '');  
            }
         } 
         
         var p=(el.nextElementSibling || {}).className=='media_desc'?el.nextElementSibling:null;//geByClass('media_desc',el.parentNode)[0];
         if (el.className=='media_desc') p=el;
         if (p && p.innerHTML.indexOf('vk_vid_down.vkVidLoadLinks')!=-1) return;
         if (!vid) return;
         if (!p){
            //<div style="right:auto; bottom:auto; "></div>
            if (geByClass('post_video_title',el)[0]) return;
            p = geByClass('info',el)[1] || geByClass('info',el)[0];
            var div=vkCe('div',{"class":"vk_vid_download_t"},'<span class="fl_l"><a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode'+(vid[3]?", '"+vid[3]+"','"+type+"'":'')+'); cancelEvent(event); return false;">'+IDL('download')+'</a></span>');         
            if (p) p.appendChild(div);
            
            /*
            if (geByClass('video_results',node)[0])      
               p.appendChild(vkCe('small',{'class':'fl_r '+(!window.vk_vid_list_adder?'vk_vid_add_hidden':'vk_vid_add_visible')},
                     '<a href="#" onclick="return vk_videos.add_to_group('+vid[1]+','+vid[2]+');">'+IDL('AddToGroup')+'</a><span class="divide">|</span>'),
                     div.firstChild);*/
            else v.parentNode.appendChild(div);//v.insertBefore(div,v.firstChild);
            return;
         }
         var div=vkCe('span',{'class':"download_cont"},'<a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode'+(vid[3]?", '"+vid[3]+"','"+type+"'":'')+'); return false;">'+IDL('download')+'</a>');
         p.appendChild(div);              
      };
      var add_link_to_thumb=function(el){
         var v_el=geByClass('video_row_relative',el)[0];
         if (!v_el) v_el = geByTag('a', el)[0];
         //if (!v_el && el.href) v_el=el;
         if (!v_el) return;
         var h=v_el.href;
         var vid=h.match(/video(-?\d+)_(\d+)/);
         //console.log(h,vid);
         if (vid){
           if (v_el.innerHTML.indexOf('vk_vid_acts_panel')!=-1) return;
           var c=vkCe('div',{'class':'vk_vid_acts_panel' /*, 'onclick':'cancelEvent(event);'*/});
           var div=vkCe('span',{'class':"download_cont"},
            '<span><a href="#" onclick="vk_vid_down.vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode'+(vid[3]?", '"+vid[3]+"','"+type+"'":'')+'); return false;">'+IDL('download')+'</a></span>\
            <small class="fl_r '+(!window.vk_vid_list_adder?'vk_vid_add_hidden':'vk_vid_add_visible')+'"><a href="#" onclick="return vk_videos.add_to_group('+vid[1]+','+vid[2]+');">'+IDL('AddToGroup')+'</a>'+(cur_oid!=oid?'<span class="divide">|</span>':'')+'</small>\
            ');
            // '<span class="vk_txt_icon" onclick="cancelEvent(event); vk_videos.get_description('+vid[1]+','+vid[2]+',this);"></span>'
           c.appendChild(div);     
           el.insertBefore(c,el.firstChild);
           if (el.innerHTML.indexOf('get_description')==-1){
               var c=geByClass('video_raw_info_name',el)[0];
               if (c) val(c, '<span class="vk_txt_icon" onclick="cancelEvent(event); vk_videos.get_description('+vid[1]+','+vid[2]+',this);"></span>'+
                                   c.innerHTML);
           }
           // <div class="vk_vid_acts_panel">okoko</div>
         }
      };
      
      els=geByClass('page_media_video',node);
      for (var i=0; i<els.length; i++) addlink(els[i]);
      els=geByClass('page_media_full_video',node);
      for (var i=0; i<els.length; i++) addlink(els[i]);
      els=geByClass('video_row',node);
      for (var i=0; i<els.length; i++) addlink(els[i],'video_row'); 
      
      els=geByClass('videos_row',node);
      for (var i=0; i<els.length; i++) addlink(els[i]); 
      
      els=geByClass('post_video_title',node);
      for (var i=0; i<els.length; i++) addlink(els[i].parentNode.parentNode,'post_video_title'); 
      
      els=geByClass('video_row_inner_cont',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i]);       
      
      els=geByClass('video_row_thumb',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i]);
      
      els=geByClass('feed_video_thumb',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i].parentNode); 
      
      //els=geByClass('videocat_video_inner',node);
      //for (var i=0; i<els.length; i++) add_link_to_thumb(els[i]); 
      
      els=geByClass('videocat_row_video',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i]); 
      
      els=geByClass('videocat_video',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i]); 
      
      els=geByClass('page_post_video_play_inline',node);
      for (var i=0; i<els.length; i++) add_link_to_thumb(els[i].parentNode.parentNode,'page_post_video_play_inline');
      
   },
   vkVidLoadLinks: function(oid,vid,el,yid,type){
       var smartlink=true;//(getSet(1) == 'y')?true:false;
       var fmt=['240p','360p','480p','720p','1080p'];
       el=ge(el);
       val(el, vkLdrImg);
       AjGet('/video.php?act=a_flash_vars&vid='+oid+'_'+vid,function(t){
         //console.log(t);
         // if (t=='NO_ACCESS')
         var getyt=function(youid){
            var html='<a href="http://youtube.com/watch?v='+youid+'">YouTube</a>';
               vk_vid_down.vkGetYoutubeLinks(youid,function(r){
                  if (!r) return;
                  for (var i=0;i<r.length;i++)
                     html+='<a class="vk_down_icon" href="'+r[i][0]+'" title="'+r[i][2]+'" onmouse_over="vk_vid_down.vkGetVideoSize(this);">'+r[i][1]+'<small class="divide" url="'+r[i][0]+'"></small></a>';
                  val(el, html);
                  addClass(el,'vk_vide_wide_lnks');
                  
               });
         };
         
         var getvimeo=function(vimeoid){
            vk_vid_down.vkGetVimeoLinks(vimeoid,function(r){
               if (!r) return;
               var html='<a href="http://vimeo.com/'+vimeoid+'">Vimeo</a>'; 
               //alert(html);
               for (var i=0;i<r.length;i++)
                  html+='<a href="'+r[i][0]+'" title="'+r[i][2]+'"  class="vk_down_icon">'+r[i][1]+'<small class="divide">'+r[i][2]+'</small></a>';
               val(el, html);
            });  
         };
         var get_ivi=function(ivi_id){
            ivi_id=ivi_id+"";
            if (!ivi_id.match(/^\d+$/)){
               ivi_id=(ivi_id.match(/videoId=(\d+)/)||[])[1];// + may be need parse siteId=s132 ...
            }
            vk_vid_down.get_ivi_links(ivi_id,function(r){
               if (!r) return;
               var html='<a href="http://www.ivi.ru/watch/'+ivi_id+'">ivi.ru</a>'; 
               //alert(html);
               for (var i=0;i<r.length;i++)
                  html+='<a href="'+r[i][0]+'" title="'+r[i][1]+'"  class="vk_down_icon">'+r[i][1].replace(/-/g,'.')+' </a>';
               val(el, html);
            });  
         };      
         var get_coub=function(coub_id){
             vk_vid_down.vkGetCoubLinks(coub_id,function(r){
                 if (!r) return;
                 var html='<a href="http://coub.com/view/'+coub_id+'">Coub</a>';
                 for (var i=0;i<r.length;i++)
                     html+='<a href="'+r[i][0]+'" class="vk_down_icon">'+r[i][1]+'<small class="divide">'+r[i][2]+'</small></a>';
                 el.innerHTML=html;
             });
         };
         
         if (yid && (!type || type=='youtube')){
            getyt(yid);
         } else if (yid && type=='vimeo'){ 
            getvimeo(yid)
         }else if(t=='NO_ACCESS'){
            val(el, '<small class="divide" >'+IDL('NO_ACCESS')+'</small>');
         } else {
            var obj=JSON.parse(t);
            if (obj.extra=="21"){// 21 - YouTube; 22 - Vimeo; 50 - ivi.ru; 23 - Rutube; 24 - Russia.ru 
               getyt(obj.extra_data);            
            } else if (obj.extra=="22"){
               getvimeo(obj.extra_data);
            } else if (obj.extra=="50"){// AND ALSO extra=50 - carambatv.ru??? О_о WTF?
               if ((obj.extra_data||'').indexOf('ivi.ru')!=-1)
                  get_ivi(obj.extra_data);
               else if (~(obj.extra_data||'').indexOf('coub.com'))
                  get_coub(obj.extra_iframe.split('/').pop());
               else val(el, '<small class="divide" >'+IDL('NA')+'('+obj.extra+')</small>');
            } else if (!obj.extra){
               var html='';
               
               // делаем кнопку на просмотра превьюх
               var arr = (obj.timeline_thumbs_jpg || '').split(',');
               if (obj.timeline_thumbs_jpg && arr.length) 
                  html += '<a class="vk_phv_link" href="#" onclick="vk_phviewer.view([\''+arr.join("','")+'\']); return false;"><span class="vk_photo_icon"></span></a>';/*+IDL("Preview")*/
                
               var arr=vk_vid_down.vkVidDownloadLinksArray(obj);
               for (var i=0; i<arr.length; i++){
                  var vidext=arr[i].substr(arr[i].lastIndexOf('.')).split('?')[0];  
                  var vidname=vkCleanFileName(winToUtf(decodeURIComponent(obj.title || obj.md_title))).replace(/\+/g,' ');
                  var vname=vidname;

                  vidname=(arr[i].indexOf('?')==-1?'?':'')+vkDownloadPostfix()+'&/'+vkEncodeFileName(vidname+' ['+fmt[i]+']');
                  var vidurl=arr[i]+(smartlink?vidname+vidext:'');
                  html+='<a class="vk_down_icon" href="'+vidurl+'" download="'+vname+vidext+'"  title="'+vname+' ['+fmt[i]+']'+vidext+'" onclick="return vkDownloadFile(this);" onmouseover="vk_vid_down.vkGetVideoSize(this); vkDragOutFile(this);">'+fmt[i]+'<small class="divide" url="'+vidurl+'"></small></a>'; 
               }
               
               

               val(el, html);
            } else {
               val(el, '<small class="divide" >'+IDL('NA')+'('+obj.extra+')</small>');
            }
         }
       });
       // /video.php?act=a_flash_vars&vid=39226536_159441582
       /*
       extra":"21",//youtube
       "extra_data":"JGRAtRzGWlw" //vid
       */
   },
   vkGetVideoSize: function(el){
      //if (getSet(43)!='y') return;
      var WAIT_TIME=4000;
      el=el.getElementsByTagName('small')[0];//ge("vk_asize"+id);
      if (el && !el.hasAttribute('getsize_ok')){
         el.setAttribute('getsize_ok',true);
         val(el, vkLdrMiniImg);
         var reset=setTimeout(function(){
            el.removeAttribute('getsize_ok');
            val(el, '');
         },WAIT_TIME);
         XFR.post(el.getAttribute('url'),{},function(h,l){
            clearTimeout(reset);
            if (l>0){
               val(el, vkFileSize(l,2));
            } else {
               val(el, '0 byte');
               el.removeAttribute('getsize_ok');
            }
            
         },true);	
      }
   },
   vkVidVarsGet: function(){
      if (getSet(2)=='y'){
         var vivar=document.getElementsByTagName('body')[0].innerHTML.split('var vars = {')[1];
         if (vivar){
            vivar='{'+ev41('"'+vivar.split('};')[0]+'"')+'}';
            vkVidVars=JSON.parse(vivar);
            setTimeout(vk_vid_down.vkVidLinks,300);
         } else {
            vkVidVars=null;
         }
      }
   },
   /* YOUTUBE FUNCTIONS */
   YTDataDecode: function(qa) {
     if (!qa) return {};
     var exclude={'url':1,'type':1,'ttsurl':1};// !='url' && key!='type' 
     var query = {}, dec = function(str) {
       try {
         return decodeURIComponent(str);
       } catch (e) { return str; }
     };
     qa = qa.split('&');
     for (var i=0;i<qa.length;i++){
         var a=qa[i];
         var t = a.split('=');
         if (t[0]) {
            var key=dec(t[0]);
            var v=exclude[key]?[dec(t[1] + '')]:dec(t[1] + '').split(',');
            query[key]=[];
            for (var j=0; j<v.length; j++){
                if (v[j].indexOf('&')!=-1 && v[j].indexOf('=')!=-1 && !exclude[key]) v[j]=vk_vid_down.YTDataDecode(v[j]);
               query[key].push(v[j]);                
            }
            if (query[key].length==1) query[key]=query[key][0];
         }
     }
     return query;
   },  
   vkGetYoutubeLinks: function(vid, callback) {
      /*// Hashes calc from youtube html5 player lib 
      var x = Date.now ||
      function() {
         return +new Date
      };
      function Qi(a) {
         a = a.split("");
         a = Ri(a, 52);
         a = a.reverse();
         a = a.slice(3);
         a = Ri(a, 21);
         a = a.reverse();
         a = a.slice(3);
         a = a.reverse();
         return a.join("")
      }
      function Ri(a, b) {
         var c = a[0];
         a[0] = a[b % a.length];
         a[b] = c;
         return a
      };
      
      //alert(Qi('7F57F587C6E44AB8DFCAC50556FA669876D918A33F2.AAA00E3B7056C121228F5B949CDBCDEF5357ABD1BD1')=='8DBA7535FEDCBDC949B5F122121C6507B3E00AAA.2F33A819D678966AF65505CACFD8BA44E6C785F7');
      
      
      var Ek = void 0;
      function Fk() {
         var a;
         if (void 0 == Ek && (Ek = !1, window.crypto && window.crypto.Nx)) try {
            a = new Uint8Array(1), window.crypto.Nx(a), Ek = !0
         } catch (b) {}
         if (Ek) {
            a = Array(16);
            var c = new Uint8Array(16);
            window.crypto.getRandomValues(c);
            for (var d = 0; d < a.length; d++) a[d] = c[d]
         } else for (a = Array(16), c = 0; 16 > c; c++) {
            for (var d = x(), e = 0; e < d % 23; e++) a[c] = Math.random();
            a[c] = Math.floor(256 * Math.random())
         }
         return a
      }

      function Gk() {
         for (var a = Fk(), b = [], c = 0; c < a.length; c++) b.push("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_" [a[c] & 63]);
         return b.join("")
      }
      //*/
      /*
      function decode_sig(s){// code from http://userscripts.org/scripts/review/25105
         var sig=s;      
         function swap(a,b){var c=a[0];a[0]=a[b%a.length];a[b]=c;return a};
         if (sig.length==88) {      
           var sigA=sig.split("");
           sigA=sigA.slice(2);sigA=swap(sigA,1);sigA=swap(sigA,10);
           sigA=sigA.reverse();sigA=sigA.slice(2);sigA=swap(sigA,23);
           sigA=sigA.slice(3);sigA=swap(sigA,15);sigA=swap(sigA,34);
           sig=sigA.join("");
         } else if (sig.length==87) {
           var sigA=sig.substr(44,40).split('').reverse().join('');
           var sigB=sig.substr(3,40).split('').reverse().join('');
           sig=sigA.substr(21,1)+sigA.substr(1,20)+sigA.substr(0,1)+sigA.substr(22,9)+
           sig.substr(0,1)+sigA.substr(32,8)+sig.substr(43,1)+sigB;
         } else if (sig.length==86) {
           sig=sig.substr(2,15)+sig.substr(0,1)+sig.substr(18,23)+sig.substr(79,1)+
           sig.substr(42,1)+sig.substr(43,36)+sig.substr(82,1)+sig.substr(80,2)+sig.substr(41,1);
         } else if (sig.length==85) {
           var sigA=sig.substr(44,40).split('').reverse().join('');
           var sigB=sig.substr(3,40).split('').reverse().join('');
           sig=sigA.substr(7,1)+sigA.substr(1,6)+sigA.substr(0,1)+sigA.substr(8,15)+sig.substr(0,1)+
           sigA.substr(24,9)+sig.substr(1,1)+sigA.substr(34,6)+sig.substr(43,1)+sigB;
         } else if (sig.length==84) {
           var sigA=sig.substr(44,40).split('').reverse().join('');
           var sigB=sig.substr(3,40).split('').reverse().join('');
           sig=sigA+sig.substr(43,1)+sigB.substr(0,6)+sig.substr(2,1)+sigB.substr(7,9)+
           sigB.substr(39,1)+sigB.substr(17,22)+sigB.substr(16,1);
         } else if (sig.length==83) {
           var sigA=sig.substr(43,40).split('').reverse().join('');
           var sigB=sig.substr(2,40).split('').reverse().join('');
           sig=sigA.substr(30,1)+sigA.substr(1,26)+sigB.substr(39,1)+
           sigA.substr(28,2)+sigA.substr(0,1)+sigA.substr(31,9)+sig.substr(42,1)+
           sigB.substr(0,5)+sigA.substr(27,1)+sigB.substr(6,33)+sigB.substr(5,1);
         } else if (sig.length==82) {
           var sigA=sig.substr(34,48).split('').reverse().join('');
           var sigB=sig.substr(0,33).split('').reverse().join('');
           sig=sigA.substr(45,1)+sigA.substr(2,12)+sigA.substr(0,1)+sigA.substr(15,26)+
           sig.substr(33,1)+sigA.substr(42,1)+sigA.substr(43,1)+sigA.substr(44,1)+
           sigA.substr(41,1)+sigA.substr(46,1)+sigB.substr(32,1)+sigA.substr(14,1)+
           sigB.substr(0,32)+sigA.substr(47,1);
         }
         return sig;
      }
      */
      
      //var cpn=Gk();
      
      var url = (vk_ext_api.ready?'http:':location.protocol)+'//www.youtube.com/get_video_info?video_id=' + vid +
               '&asv=3&eurl=' + 
               encodeURIComponent(location.href) + '&el=embedded';
               /*'html5=1&video_id=' + vid +'&cpn='+cpn+'&eurl=' + 
               encodeURIComponent(location.href) + '&el=embedded&c=web'*/
      XFR.post(url,{},function(t){   
         var obj=vk_vid_down.YTDataDecode(t);
         var map=(/*obj.adaptive_fmts ||*/obj.fmt_url_map || obj.url_encoded_fmt_stream_map);
         if (!map) {
            callback([]);
            return;
         }
         /*
         var params={
            oid:obj.oid,
            ptk:obj.ptk,
            ptchn:obj.ptchn,
            pltype:obj.pltype,
            cpn:cpn//Gk()
         }
         //*/
         var links=[];
         for (var i=0;i<map.length;i++){
            var sig=map[i].sig; //|| Qi(map[i].s);// || (decode_sig(map[i].s));
            if (!map[i].sig && map[i].s) continue;// "Qi(map[i].s)" calc sig normaly, but links not valid

            var format=YT_video_itag_formats[map[i].itag];
            var info=(map[i].type+'').split(';')[0]+' '+(obj.fmt_list[i]+'').split('/')[1];
            if (!format) vklog('<b>YT '+map[i].itag+'</b>: \n'+(map[i].stereo3d?'3D/':'')+info,1);
            format=(map[i].stereo3d?'3D/':'')+(format || info);
            obj.title = isArray(obj.title) ? obj.title.join('') : obj.title;
            //links.push([map[i].url+'&signature='+sig+'&'+ajx2q(params), format,info]); // sig=Qi(map[i].s)
            links.push([map[i].url+'&signature='+sig+'&quality='+map[i].quality+(obj.title?'&title='+encodeURIComponent(obj.title.replace(/\+/g,' ')):''), format,info]);
         }
         callback(links);
      });
   },
   vkYTVideoLinks: function(link){
      if (String(link).indexOf('youtube.com')==-1) return '';
      var vid=String(link).split('?')[0].split('/').pop();
      vk_vid_down.vkGetYoutubeLinks(vid,function(r){
         //alert(JSON.Str(r));
         if (!r) return;
         var html=''; 
         for (var i=0;i<r.length;i++)
            html+='<a href="'+r[i][0]+'" title="'+r[i][2]+'"  class="clear_fix" onmouseover="vk_vid_down.vkGetVideoSize(this);">'+IDL("download")+' '+r[i][1]+'<small class="fl_r divide" url="'+r[i][0]+'"></small></a>';
            //'<a href="'+vidurl+'" onmouseover="vk_vid_down.vkGetVideoSize(this);">'+IDL("download")+'<small class="fl_r divide" url="'+vidurl+'"></small></a>';
         val(ge('vkyoutubelinks'), '<a id="vkyoutubelinks_show" href="javascript: toggle(\'vkyoutubelinks_list\');">'+IDL('download')+'</a><span id="vkyoutubelinks_list" style="display:none;">'+html+'</span>');
      });
      return '<span id="vkyoutubelinks"></span>';
   },
   /*END OF YOUTUBE FUNCTIONS */
   /* VIMEO FUNCTIONS */
   vkGetVimeoLinks: function(vid, callback) {
      XFR.post('http://player.vimeo.com/video/'+vid, {}, function(t) {
         t = (t || "").replace(/<iframe[^<>]+><[^<>]+iframe>/g,'');
         var r = t.match(/clip\d+_\d+\s*=\s*(\{[^;]+\});/);
         //alert(t);
         if (!r) return;
         var params = JSON.parse(r[1]);
         
         var config = params.config;
         var links = [];
         //alert(JSON.stringify(config.video.files));
         for (var key in config.video.files) {
            var data = config.video.files[key];
            for (var i = 0; i < data.length; i++) {
               var quality = data[i];
               var q = [
                  "clip_id=" + config.video.id, 
                  "sig=" + config.request.signature, 
                  "time=" + config.request.timestamp, 
                  "quality=" + quality, 
                  "codecs=H264,VP8,VP6", 
                  "type=moogaloop", 
                  "embed_location=" + location.href
               ];
               links.push([
                  'http://player.vimeo.com/play_redirect?'+q.join('&'), 
                  quality, 
                  key
               ]);
            } 
         }
         callback(links);
      }); 
   },
   vkVimeoVideoLinks: function(link){
      if (String(link).indexOf('vimeo.com')==-1) return '';
      var vid=String(link).split('?')[0].split('/').pop();
      vk_vid_down.vkGetVimeoLinks(vid,function(r){
         if (!r) return;
         var html=''; 
         for (var i=0;i<r.length;i++)
            html+='<a href="'+r[i][0]+'" title="'+r[i][2]+'"  class="clear_fix">'+IDL("download")+' ['+r[i][1]+']</a>';
         val(ge('vkyoutubelinks'), '<a id="vkyoutubelinks_show" href="javascript: toggle(\'vkyoutubelinks_list\');">'+IDL('download')+'</a><span id="vkyoutubelinks_list" style="display:none;">'+html+'</span>');
      });
      return '<span id="vkyoutubelinks"></span>';
   },
   /*END OF VIMEO FUNCTIONS */
    vkGetCoubLinks: function (coub, callback) {
        vk_aj.get('http://coub.com/coubs/' + coub + '.json', function (json) {
            var links = [];
            var info = JSON.parse(json);
            for (var version in info.file_versions.web.versions)
                for (var type in info.file_versions.web.types)
                    links.push([
                        info.file_versions.web.template.replace(/%\{type\}/g, info.file_versions.web.types[type]).replace(/%\{version\}/g, info.file_versions.web.versions[version]),
                        info.file_versions.web.versions[version],
                        info.file_versions.web.types[type]
                    ]);
            callback(links);
        });
    },
   vkVidLinks: function(){	
      var ctrls = ge('mv_controls');
      if (!ctrls) return;
      var acts = geByClass('mv_share_actions',ctrls)[0];
      
      if (acts && !ge('vk_more_acts')){
         /* Added by VK in Dec 2014
         var vid=((window.mvcur || {}).videoRaw || '').split('_');
         if (vid[0] && acts.innerHTML.indexOf('vk_videos.add_to_group')==-1)
            acts.innerHTML+='<a href="#" onclick="return vk_videos.add_to_group('+vid[0]+','+vid[1]+');">'+IDL('AddToGroup',1)+'</a>';
         */
         //console.log('Cur video',(window.mvcur || {}).videoRaw); 
         var links='';
         var vlink=null;
         if (ge('video_player') && ge('video_player').tagName.toUpperCase()=='IFRAME')
            vlink=ge('video_player').getAttribute('src');
         else if (ge('mv_content') && ge('mv_content').innerHTML.indexOf('ivi.ru')>-1){
            vlink=ge('mv_content').innerHTML.match(/ivi\.ru[^"]+videoId=\d+/);
            vlink = vlink?vlink[0]:null;
         }
         if (vlink){
            if (vlink.indexOf('youtube')!=-1){
               if (ge('vk_youtube_video_link')) return;
               var link=vlink.split('?')[0].replace('embed/','watch?v=');
               links+='<a href="'+link+'" class="idd_item" id="vk_youtube_video_link"><div class="idd_item_name">'+IDL('YouTube',1)+'</div></a>';
               links+='<div class="idd_item">'+vk_vid_down.vkYTVideoLinks(vlink)+'</div>';
               /*
                  http://www.youtube.com/embed/jfKVHD3hCS0?autoplay=0
                  http://www.youtube.com/watch?v=jfKVHD3hCS0
               */
               
            }
            if (vlink.indexOf('vimeo')!=-1){
               if (ge('vk_youtube_video_link')) return;
               //var link=vlink.split('?')[0].replace('embed/','watch?v=');
               var link='http://vimeo.com/'+String(vlink).split('?')[0].split('/').pop();
               links+='<a href="'+link+'" class="idd_item" id="vk_youtube_video_link"><div class="idd_item_name">'+IDL('Vimeo',1)+'</div></a>';
               links+='<div class="idd_item">'+vk_vid_down.vkVimeoVideoLinks(vlink)+'</div>';
               /*
                  http://www.youtube.com/embed/jfKVHD3hCS0?autoplay=0
                  http://www.youtube.com/watch?v=jfKVHD3hCS0
               */
            }
            //alert(vlink+'\n'+(vlink.indexOf('ivi.ru')));
            if (vlink.indexOf('ivi.ru')!=-1){
               
               var link='http://www.ivi.ru/watch/'+(vlink.match(/ivi\.ru[^"]+videoId=(\d+)/)||[])[1];
               links+='<a href="'+link+'" class="idd_item" id="vk_youtube_video_link"><div class="idd_item_name">'+IDL('ivi.ru',1)+'</div></a>';
               links+='<div class="idd_item">'+vk_vid_down.ivi_links(vlink)+'</div>';
            }
            links+=vk_plugins.video_links(ge('video_player').src);
         } else if (vkVidVars){  
            var h=acts.innerHTML;
            if (h.indexOf('vk_vid_down.vkGetVideoSize')!=-1) return;
            var inf=vk_videos.get_album();
            var v_el=geByClass('mv_views_count_number',ctrls)[0];
            if (inf && inf[0] && v_el){
               val(v_el, '<a href="'+inf[1]+'">'+v_el.innerHTML+'</a>');
               
            }
            links+='<div class="idd_item">'+vk_vid_down.vkVidDownloadLinks(vkVidVars)+'</div>'; 
            links+='<div class="idd_item">'+vk_plugins.video_links(vkVidVars,vk_vid_down.vkVidDownloadLinksArray(vkVidVars))+'</div>';
            //if (h.indexOf('showTagSelector')!=-1){	acts.innerHTML+='<a href="#" onclick="vkTagAllFriends(); return false;">'+IDL("selall")+'</a>';	}
         }
         acts.appendChild(se('<div class="mv_rtl_divider fl_l"></div>'));
         acts.appendChild(se('<div class="idd_wrap mv_more fl_l" id="vk_more_acts"><div class="idd_selected_value idd_arrow" onclick="toggle(\'vk_more_acts_idd\'); return false;">'+IDL('Actions')+'</div>'+
                             '<div class="idd_popup" id="vk_more_acts_idd" style="margin-left: -10px; margin-top: 3px; width: 220px; opacity:1; display:none;"><div class="idd_items_wrap"><div class="idd_items_content">'+
                             links+
                             '</div></div></div></div>'));         
      }
   }   
};

vk_au_down={
   css:'#vk_mp3_links_area, #vk_m3u_playlist_area,#vk_pls_playlist_area, #vk_mp3_wget_links_area, #vk_mp3_metalink_links_area,.vk_video_linklist_area{width:520px; height:400px;}',
   page:function(){
      vk_au_down.vkAudioPlayList(true);
   },
   make_d_btn:function(url,el,id,name){
       url = url.replace(/https:\/\//,'http://');
       
       var td=vkCe('div', {'class':"vkaudio_down"},'<a href="'+url+'"  download="'+name+'" title="'+name+'" onmousedown="vk_audio.prevent_play();" onclick="vk_audio.prevent_play(); return vkDownloadFile(this);" onmouseover="vkDragOutFile(this);"><div onmouseover_="vk_audio.get_size(\''+id+'\',this)" class="play_new down_btn" id="down'+id+'"></div></a>');
       var parent = geByClass('title_wrap',el.parentNode.parentNode.parentNode)[0];
       parent.insertBefore(td, parent.firstChild);
       el.setAttribute('vk_ok','1'); 
       if (AUDIO_AUTOLOAD_BITRATE){
          setTimeout(function(){
            if (ge('down'+id))
               vk_audio.get_size(id,ge('down'+id),true);
          },300);
       }
       //vk$(this).dragout();
   },
   vkAudioPlayList: function(add_button){
      if(add_button){
         if (getSet(0) != 'y') return;
         if (ge('vkmp3links') || nav.objLoc['act']=='recommendations' || nav.objLoc['act']=='popular') return;
         var p=ge('album_filters');
         var btn=vkCe("div",{
               id:"vkmp3links",
               "class":"audio_filter"
            },'<div class="label">'+IDL('Links')+'</div>');
         btn.setAttribu7e('onmouseover', "if (Audio.listOver) Audio.listOver(this)");
         btn.setAttribu7e('onmouseout', "if (Audio.listOut) Audio.listOut(this)");
         btn.setAttribu7e('onclick', "vk_au_down.vkAudioPlayList();");
         p.insertBefore(btn,p.firstChild);
         //p.innerHTML+='<span class="divider">|</span><a onclick="vkAudioPlayList(); return false;" href="#" id="vkmp3links">'+IDL('Links')+'</a>';
         return;
      }
      //vkaddcss('#vk_mp3_links_area, #vk_m3u_playlist_area,#vk_pls_playlist_area, #vk_mp3_wget_links_area{width:520px; height:400px;}');
      if (val(ge('audioExactSearch')))
          return vk_audio.links_to_audio_on_page(); // В случае точного поиска получить ссылки со страницы
      var params={}; 
      if (cur.album_id && cur.album_id>0) params['album_id']=cur.album_id;
      var box=vkAlertBox('',vkBigLdrImg);
      if (cur.searchStr == "") {    // Это не страница поиска
          var audio_method = 'audio.get';
          if (cur.curSection && cur.curSection.indexOf('friend') == 0)  // Это страница аудиозаписей друга
              params["uid"]=cur.audioFriend;
          else
              params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);          // Это моя страница или группы
      } else {                      // Это страница поиска
          var search_flag = true;   // флаг для начала цикла с 1, а не с 0, т.к. 0й элемент = кол-во результатов
          var audio_method = 'audio.search';
          params["q"] = cur.searchStr;  // Поисковый запрос
          if (nav.objLoc.performer)     // Поиск по исполнителю
              params["performer_only"] = 1;
          params["count"] = 300;        // Максимум аудиозаписей (ограничение ВК)
          if (cur.autoComplete)         // Исправление ошибок. На практике, true при живом поиске и false при обновлении страницы
              params["auto_complete"] = 1;
          params["sort"] = 2;           // Сортировка по популярности. Стандартная у вконтакта.
      }
      dApi.call(audio_method,params,function(r){
         var res='#EXTM3U\n';
         var pls='[playlist]\n\n';
         var wiki='';
		 var metalinklist=['<?xml version="1.0" encoding="UTF-8" ?>',
				'<metalink version="3.0" xmlns="http://www.metalinker.org/">',
				'<files>'];
         var links=[];
         var wget_links=[], wget_links_nix=[];
         var list=r.response;
         for (var i=(search_flag ? 1 : 0);i<list.length;i++){
            var itm=list[i];
            itm.url = itm.url.replace('https','http');
            res+='#EXTINF:'+itm.duration+','+(winToUtf(itm.artist+" - "+itm.title))+'\n';
            res+=itm.url+"\n";//+"?/"+(encodeURIComponent(itm.artist+" - "+itm.title))+".mp3"+"\n";
            
            pls+='File'+(i+1)+'='+itm.url+'\n';
            pls+='Title'+(i+1)+'='+winToUtf(itm.artist+" - "+itm.title)+'\n';
            pls+='Length'+(i+1)+'='+itm.duration+'\n\n';
            
            wiki+='[[audio'+itm.owner_id+'_'+itm.aid+']]\r\n';

            links.push(itm.url+(itm.url.indexOf('?')>0?'&/':'?/')+vkEncodeFileName(vkCleanFileName(itm.artist+" - "+itm.title))+".mp3");

            wget_links.push('wget "'+itm.url+'" -O "'+vkCleanFileName(winToUtf(itm.artist+" - "+itm.title))+'.mp3"');
            wget_links_nix.push('wget "'+itm.url+'" -O "'+winToUtf(itm.artist+" - "+itm.title).replace(/"/g,'\\"').replace(/`/g,'\'')+'.mp3"');
			
			metalinklist.push('<file name="'+vkCleanFileName(winToUtf(itm.artist+" - "+itm.title))+'.mp3'+'">'
								+'<resources><url type="http" preference="100">'+itm.url+'</url></resources>'
							+'</file>');
         }
		 metalinklist.push('</files></metalink>');
         pls+='\nNumberOfEntries='+list.length+'\n\nVersion=2';

         box.hide();
         var m3u_html='<div class="vk_m3u_playlist">\
               <textarea id="vk_m3u_playlist_area">'+res+'</textarea>\
               <a download="playlist.m3u" href="data:audio/x-mpegurl;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(res))) + '">'+vkButton(IDL('download_M3U'))+'</a>\
               <a download="playlist.m3u" href="data:audio/x-mpegurl;base64,' + base64_encode(utf8_encode(res)) + '">'+vkButton(IDL('download_M3U')+' (UTF-8)','',1)+'</a>\
               </div>';
         var pls_html='<div class="vk_pls_playlist">\
               <textarea id="vk_pls_playlist_area">'+pls+'</textarea>\
               <a download="playlist.pls" href="data:audio/x-scpls;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(pls))) + '">'+vkButton(IDL('download_PLS'))+'</a>\
               <a download="playlist.pls"  href="data:audio/x-scpls;base64,' + base64_encode(utf8_encode(pls)) + '">'+vkButton(IDL('download_PLS')+' (UTF-8)','',1)+'</a>\
               </div>';
               
         var links_joined = links.join('\n');
         var links_html='<div class="vk_mp3_links">\
               <textarea id="vk_mp3_links_area">'+links_joined+'</textarea>\
               <a download="playlist.txt" href="data:text/plain;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(links_joined))) + '">'+vkButton(IDL('.TXT'))+'</a>\
               <a download="playlist.txt" href="data:text/plain;base64,' + base64_encode(utf8_encode(links_joined)) + '">'+vkButton(IDL('.TXT')+' (UTF-8)','',1)+'</a>\
               </div>';
         var wget_links_joined = wget_links.join('\n');
         var wget_links_html='<div class="vk_mp3_wget_links">\
               <textarea id="vk_mp3_wget_links_area">'+wget_links_joined+'</textarea>\
               <a download="playlist.bat" href="data:application/x-download;base64,' + base64_encode(utf8ToWindows1251(utf8_encode('chcp 1251\n'+wget_links_joined))) + '">'+vkButton(IDL('.BAT'))+'</a>\
               <a download="playlist.bat" href="data:application/x-download;base64,' + base64_encode(utf8_encode('chcp 65001\n'+wget_links_joined)) + '">'+vkButton(IDL('.BAT')+' (UTF-8)','',1)+'</a>\
               <a download="playlist.sh" href="data:text/plain;base64,' + base64_encode(utf8_encode(wget_links_nix.join('\n'))) + '">'+vkButton(IDL('.SH')+' (UTF-8)','',1)+'</a>\
               </div>';
		 var metalinklist_joined = metalinklist.join('\n').replace(/&/g,'&amp;');
         var metalinklist_html='<div class="vk_mp3_metalink_links">\
               <textarea id="vk_mp3_metalink_links_area">'+metalinklist_joined.replace(/&/g,'&amp;')+'</textarea>\
               <a download="playlist.metalink" href="data:text/plain;base64,' + base64_encode(utf8_encode(metalinklist_joined)) + '">'+vkButton(IDL('.METALINK (UTF-8)'))+'</a>\
               </div>';
         var tabs=[];

         tabs.push({name:IDL('links'),active:true, content:links_html/*'<div class="vk_mp3_links"><textarea id="vk_mp3_links_area">'+links.join('\n')+'</textarea></div>'*/});
         tabs.push({name:IDL('M3U_Playlist'),content:m3u_html});
         tabs.push({name:IDL('PLS_Playlist'),content:pls_html});
         tabs.push({name:IDL('Wiki'), content:'<div class="vk_mp3_links"><textarea id="vk_mp3_links_area">'+wiki+'</textarea></div>'});
         tabs.push({name:IDL('wget_links'), content:wget_links_html});
		 tabs.push({name:IDL('Metalink'), content:metalinklist_html});
         box=vkAlertBox('MP3',vkMakeContTabs(tabs));
         box.setOptions({width:"560px"});
         /*alert(links.join('\n'));
         alert(res);
         */
      });
   }
};
///////////////////////////
// END OF DOWNLOAD CODE //
/////////////////////////

if (!window.vkopt_plugins) vkopt_plugins = {};
(function () {  // Плагин для скачивания всех материалов диалога
    var PLUGIN_ID = 'IMattachmentsDL';

    vkopt_plugins[PLUGIN_ID] = {
        Name: 'Messages Attachments Download',
        media_type: '',  // тип материалов, который необходимо вернуть (например, photo)
        progress_div: null, // элемент для размещения прогрессбра
        abs_i: 0,   // для абсолютной (сквозной) нумерации файлов
        links: [],
        wget_links: [],
        el_id: 'vk_im_download', // id элемента (ссылки), чтобы она 2 раза не вставлялась
        // ФУНКЦИИ
        onLocation: function (nav_obj, cur_module_name) {   // при открытии окна с материалами беседы
            if (cur_module_name == 'im' && nav_obj.w && nav_obj.w.indexOf('history') == 0 && !ge(this.el_id) && !~nav.objLoc.w.indexOf('video'))
                this.UI();
        },
        UI: function () {   // Добавление ссылки на скачивание
            var parent = ge('wk_history_wall');
            this.progress_div = vkCe('div', {'class': 'fl_r'}, '');
            parent.insertBefore(this.progress_div, parent.firstChild);

            var a = vkCe('a', {id: this.el_id, style: 'line-height:2em'}, IDL('Links'));
            a.onclick = this.onclick;
            parent.insertBefore(a, parent.firstChild);
        },
        onclick: function () {  // Нажатие на ссылку для скачивания
            vkopt_plugins[PLUGIN_ID].media_type = nav.objLoc.w.split('_')[1];
            vkopt_plugins[PLUGIN_ID].links = [];
            vkopt_plugins[PLUGIN_ID].wget_links = [];
            vkopt_plugins[PLUGIN_ID].abs_i = 0;
            vkopt_plugins[PLUGIN_ID].run(0);
            vkopt_plugins[PLUGIN_ID].progress_div.innerHTML = vkBigLdrImg;
        },
        run: function (_offset) {
            dApi.call('messages.getHistoryAttachments', {
                peer_id: cur.peer,
                media_type: this.media_type,
                start_from: _offset,
                count: 200
            }, function (r, response) {
                for (var i in response)
                    if (i != 0 && i != 'next_from') {
                        var attachment = response[i][response[i].type];
                        var url =
                            attachment.url || // audio & doc
                            attachment.src_xxxbig || attachment.src_xxbig || attachment.src_xbig || attachment.src_big || attachment.src;  // photo
                        var filename;
                        switch (response[i].type) {
                            case 'audio':
                                filename = vkCleanFileName(attachment.artist + ' - ' + attachment.title) + '.mp3';
                                break;
                            case 'doc':
                                filename = vkCleanFileName(attachment.title);
                                if (filename.toLowerCase().indexOf(attachment.ext) != filename.length - attachment.ext.length)
                                    filename += '.' + attachment.ext;
                                break;
                            case 'photo':
                                filename = ((100000 + vkopt_plugins[PLUGIN_ID].abs_i++) + '').substr(1) + '.jpg';           // для составления имен с фиксированной длиной. Основание фиксированное, т.к. заранее не знаем макс. номер
                                break;
                        }
                        vkopt_plugins[PLUGIN_ID].links.push(url + (~url.indexOf('?') ? '&' : '?') + '/' + vkEncodeFileName(filename));
                        vkopt_plugins[PLUGIN_ID].wget_links.push('wget "' + url + '" -O "' + winToUtf(filename).replace(/`/g, '\'') + '"');
                    }
                if (response.next_from) {
                    vkopt_plugins[PLUGIN_ID].run(response.next_from);
                } else {
                    val(vkopt_plugins[PLUGIN_ID].progress_div, '');
                    // генерация списков и табов.
                    var links_joined = vkopt_plugins[PLUGIN_ID].links.join('\n');
                    var links_html = '<div class="vk_mp3_links">\
                       <textarea id="vk_mp3_links_area">' + links_joined + '</textarea>\
                       <a download="' + val(ge('wk_history_title')) + '.txt" href="data:text/plain;base64,' + base64_encode(utf8_encode(links_joined)) + '">' + vkButton(IDL('.TXT'), '', 1) + '</a>\
                       </div>';

                    var wget_links_joined = vkopt_plugins[PLUGIN_ID].wget_links.join('\n');
                    var wget_links_html = '<div class="vk_mp3_wget_links">\
                       <textarea id="vk_mp3_wget_links_area">' + wget_links_joined + '</textarea>\
                       <a download="' + val(ge('wk_history_title')) + '.' + (vkbrowser.linux ? 'sh' : 'bat') + '" href="data:application/x-download;base64,' + base64_encode(utf8_encode(wget_links_joined)) + '">' + vkButton(IDL('.' + (vkbrowser.linux ? 'SH' : 'BAT')), '', 1) + '</a>\
                       </div>';

                    var tabs = [];
                    tabs.push({name: IDL('links'), active: true, content: links_html});
                    tabs.push({name: IDL('wget_links'), content: wget_links_html});
                    var box = vkAlertBox(IDL('links'), vkMakeContTabs(tabs));
                    box.setOptions({width: "560px"});
                }
            });
        }
    };
    if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();
if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;

(function(){
   var PLUGIN_ID = 'vkMozImgPaste';

   vkopt_plugins[PLUGIN_ID] = {
      Name: 'Paste images in messages',
      onLocation: function (nav_obj, cur_module_name) {
         if (cur_module_name == 'im' && nav_obj.sel)
            each(geByClass('im_editable'), function () {
               var events = data(this, 'events');
               if (events) {
                  if (!events.paste)
                     events.paste = [];
                  if (events.paste[0] != vkopt_plugins[PLUGIN_ID].onPaste)
                     events.paste.unshift(vkopt_plugins[PLUGIN_ID].onPaste);
               }
            });
      },
      onPaste: function (e) {
         var attr = e.target.getAttribute('contenteditable');   // бекап и восстановление атрибута contenteditable
         e.target.setAttribute('contenteditable','');           // для избежания Emoji.getRange() в emoji.js:229
         setTimeout(function () {
            e.target.setAttribute('contenteditable',attr);
            var img = geByTag('img', e.target)[0];
            if (img) {
               var binary = atob(img.src.split('base64,')[1]);
               re(img);
               var array = new Uint8Array(binary.length);
               for (var i = 0; i < binary.length; i++)
                  array[i] = binary.charCodeAt(i);
               var blob = new Blob([array], {type: 'image/png'});

               if (blob) {
                  blob.name = blob.filename = 'upload_' + new Date().toISOString() + '.png';
                  Upload.onFileApiSend(cur.imUploadInd, [blob]);
               }
            }
         }, 0);
      }
   };
   if (window.vkopt_ready && browser.mozilla) vkopt_plugin_run(PLUGIN_ID);
})();

(function () {
    var exact = {
        Name: 'Exact Audio Search',
        query: '',      // поисковый запрос
        performer: 0,   // поиск по исполнителю
        init: function() {
            if (!RegExp.escape)
                RegExp.escape= function(s) {
                    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            };
        },
        onLocation: function (nav_obj, cur_module_name) {
            if (cur_module_name == 'audio')
                exact.UI('audio_search_filters');
            else if (cur_module_name == 'search' && nav_obj['c[section]'] == 'audio')
                exact.UI('audio_lyrics_filter');
        },
        UI: function (parent_id) {
            if (!ge('audioExactSearch')) { // создание галочки "искать в точности"
                var parent = ge('pad_audio_search_filters') || ge(parent_id);
                var el = vkCe('div', {}, '<div id="audioExactSearch" class="label"></div>');
                parent.insertBefore(el, domFC(parent));
                new Checkbox(ge('audioExactSearch'), {
                    checked: false,
                    width: 150,
                    onChange: function() {
                        if (window.Audio.updateList) {
                            var b = cur.ignoreEqual;
                            cur.ignoreEqual=true;
                            if (!cur.aSearch) cur.aSearch = ge('pad_search');
                            Audio.updateList();
                            setTimeout(function(){cur.ignoreEqual = b},10);
                        } else if (window['searcher'])
                            searcher.updResults(true);
                    },
                    label: IDL('searchExactly')
                });
            }
        },
        filter: function (div) {    // чистка контейнера с аудиозаписями div от лишних аудио
            var audios = geByClass('audio', div);
            for (var i in audios) {
                var performer = geByTag('b', audios[i])[0].textContent.toLowerCase().trim();
                var title = geByClass('title', audios[i])[0].textContent.toLowerCase().trim();
                if ((exact.performer == 1 && performer != exact.query)
                    || (!exact.performer && title != exact.query && !(new RegExp(RegExp.escape(performer) + '\\s*[\-–]\\s*' + RegExp.escape(title),'i')).test(exact.query)))
                    re(audios[i]);
            }
        },
        onResponseAnswer: function (answer, url, params) {  // Обработка поискового запроса
            if (val(ge('audioExactSearch')) && ((url == '/audio' && params.act == 'search') || (url=='/al_search.php' && params['c[section]']=='audio'))) {
                exact.performer = params.performer || params['c[performer]'];    // поиск по исполнителю
                exact.query = (params.q || params['c[q]']).toLowerCase().trim();  // поисковый запрос (регистронезависимый)
                if (typeof answer[0] == 'string') answer[0] = vkModAsNode(answer[0], exact.filter);
                if (typeof answer[1] == 'string') answer[1] = vkModAsNode(answer[1], exact.filter);
            } else if (url == '/pads.php' && params.pad_id == 'mus')
                setTimeout(exact.UI, 1);
        }
    };
    var PLUGIN_ID = 'ExactAudioSearch';
    vkopt_plugins[PLUGIN_ID] = exact;
    if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();
