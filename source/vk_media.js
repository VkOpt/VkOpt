// ==UserScript==
// @description   Vkontakte Optimizer module
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//



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
  
  //*
  if (nav.strLoc.match(/photo-?\d+_\d+/))  { 
    setTimeout(function(){
      if (!isVisible(cur.pvAlbumsWrap)) photoview.doShow();
    },70);
  }//*/
}

function vkPVAfterShow(){
	vkPVChangeView=function(){
		window.PVShowFullHeight=!window.PVShowFullHeight;
      Photoview.doShow();
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
  html+='<a href="#" onclick="vkPhotoUrlUpload(\''+(ph.w_src || ph.z_src || ph.y_src || ph.x_src)+'\'); return false;">'+IDL('Add')+'</a>';
  if ((ph.tags || [])[0]>0){
      html+='<a href="#" onclick="vkPVShowTagsInfo(); return false;">'+IDL('TagsInfo')+'</a>';
  }
  
  html+=ph.x_src?'<a target="_blank" href="http://www.tineye.com/search?url='+(ph.w_src || ph.z_src || ph.y_src || ph.x_src)+'">'+IDL('TinEyeSearch')+'</a>':'';
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
 
function vkPhotosPage(){
	if (nav.objLoc[0].indexOf('albums')!=-1){
      vkAddAlbumCommentsLinks();
      if (cur.oid<0) vkPhotosWallAlbum();
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
            if (cur.statsPhotoAddHash)
               p_options.push({l:IDL('Add'), h:'/album'+oid+'_'+aid+'?act=add' /*onClick:function(item) { vkGetLinksToPhotos(oid,aid);}*/
               });
				
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
////javascript: vkGetPageWithPhotos(13391307,42748479); void(0);
function vkGetLinksToPhotos(oid,aid){  
	var MakeLinksList=function(phot){
		var parr=[]; 
		for (var i=0;i<phot.length;i++)
		  parr.push('<a href="'+phot[i].max_src+'">'+phot[i].max_src+'</a>');
		return parr;
	}
	if (!ge('vk_links_container')){
		var div=vkCe('div',{id:"vk_links_container","class":"clear_fix",style:"padding:10px;"},'<center>'+vkBigLdrImg+'</center>');
		var ref=ge('photos_container');
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
		var html=MakeLinksList(r).join('<br>');
      div.innerHTML=html+(box?'':
				'<div class="vk_hide_links" style="text-align:center; padding:20px;">\
					<a href="#" onclick="re(\'vk_links_container\'); return false;">'+IDL('Hide')+'</a>\
				</div>');
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
         //vkImgsList=vkImgsList.replace(/#/g,'%23');
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
   if (ge('vk_wall_album_link')) return;
   if (isVisible('page_wall_switch'))  ge('page_wall_header').appendChild(vkCe('span',{"class":'fl_r right_link divide'},'|'))
   var href=ge('page_wall_header').getAttribute('href');
   ge('page_wall_header').appendChild(vkCe('a',{
               "class":'fl_r right_link', 
               id:'vk_wall_album_link',
               href:'/album'+cur.oid+'_00?rev=1',
               onclick:"cancelEvent(event); return nav.go(this, event);",
               onmouseover:"this.parentNode.href='/album"+cur.oid+"_00?rev=1'",
               onmouseout:"this.parentNode.href='"+href+"';"
            },IDL('photo',1)))
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
function vkVideoPage(){
   if (getSet(2)=='y'){
		if (cur.videoTpl){ 
         Inj.After('cur.videoTpl','sign,','vkVidGetLinkBtn(v),');// or move this to 'vkInj'?
      }
   }
   vkVideoNullAlbum();
}
function vkVideoEditPage(){
   vkVidEditAlbumTitle(null,true);
}


function vkVideoNullAlbum(){
   var p=ge('video_albums_list');
   if (p && !ge('video_section_album_0')){
      var attrs={
         'id':"video_section_album_0",
         'class':"side_filter",
         'onmousedown':"return nav.change({section:'album_0'});",
         'onmouseover':"addClass(this, 'side_filter_over');",
         'onmouseout':"removeClass(this, 'side_filter_over');"      
      };
      
      p.insertBefore(vkCe('div',attrs,IDL('NotInAlbums')),p.firstChild);
   }
}

function vkVidEditAlbumTitle(album_id,add_buttons){
   if (cur.editmode && cur.albums){
      if (add_buttons){
         for (var aid in cur.albums){
            var el=ge('video_section_album_'+aid);
            
            var text=el.innerHTML;
            if (text.indexOf('album_title_'+aid)!=-1) continue;
            el.innerHTML='<span id="album_title_'+aid+'">'+text+'</span><div class="fl_r vk_edit_ico" onclick="vkVidEditAlbumTitle('+aid+');" onmousedown="cancelEvent(event);"> </div>';
         }
         return;
      }
          
      var aBox = new MessageBox({title: 'Edit Album Title'});
      aBox.removeButtons();
      
      var edit_done=function(){  
            var val=ge('albumedit_'+album_id).value;
            var params={
               title:val,
               album_id:album_id
            };
            if (cur.oid<0) 
               params['gid'] = Math.abs(cur.oid);
               
            dApi.call('video.editAlbum',params,function(r){
               if (r.response==1)
                  ge('album_title_'+album_id).innerHTML=val;
               else
                  alert('Rename error');
            });
            aBox.hide();            
      }      
      aBox.addButton(getLang('box_cancel'),aBox.hide, 'no')
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
      }
      ge('albumedit_'+album_id).value=cur.albums[album_id];
   } 
}


function vkVideoViewer(){
	vkVidVarsGet();
   Inj.End('videoview.showVideo','vkProcessNode(mvcur.mvWide);');
	if (getSet(2)=='y') Inj.End('videoview.showVideo','setTimeout(vkVidLinks,0);');//Inj.After('videoview.showVideo','innerHTML = info;','setTimeout(vkVidLinks,0);');
	videoview.enabledResize=function(){return true;}
}
function vkVidDownloadLinks(vars){
    // /video.php?act=a_flash_vars&vid=39226536_159441582
    ////
   var smartlink=(getSet(1) == 'y')?true:false;
   var vidname=winToUtf(mvcur.mvData.title).replace(/\?/g,'%3F').replace(/\&/g,'%26');
   vidname=vkCleanFileName(vidname);
   var vname=vidname;
   vidname='?'+vkDownloadPostfix()+'&/'+vkEncodeFileName(vidname);//
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
		  : 'http://cs' + vars.host + '.' + 'vk.com' + '/';//(vk.intnat ? 'vk.com' : 'vkontakte.ru') 
		return s + 'u' + vars.uid + '/video/' + vars.vtag + '.' + res + '.mp4';//'.mov'
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
			s += (vidHDurl)?'<a href="'+vidHDurl+(smartlink?vidname+'.mp4':'')+'" download="'+vname+'.mp4" onclick="return vkDownloadFile(this);" onmouseover="vkGetVideoSize(this); vkDragOutFile(this);">'+IDL("downloadHD")+' '+res+'p<small class="fl_r divide" url="'+vidHDurl+'"></small></a>':"";   
		  }
		  return s;
	}

   vidurl=(vars.no_flv=='1')?pathToHD('240')+(smartlink?vidname+'.mp4':''):(get_flv()+(smartlink?vidname+'.flv':''));
    vidurl =  '<a href="'+vidurl+'" download="'+vname+(vars.no_flv=='1'?'.mp4':'.flv')+'" onclick="return vkDownloadFile(this);" onmouseover="vkGetVideoSize(this); vkDragOutFile(this);">'+IDL("download")+'<small class="fl_r divide" url="'+vidurl+'"></small></a>';
    vidurl += generateHDLinks();
    //vidname
	return vidurl;
}


function vkVidGetLinkBtn(vid){//for cur.videoTpl
   if (!vid || getSet(66)=='n') return '';
   var oid=parseInt(vid[0]);
   var cur_oid=(window.cur && cur.oid)?cur.oid:((window.nav && nav.objLoc) ? nav.objLoc[0].match(/-?\d+/):null);
   var href=(oid<0?'club':'id')+Math.abs(oid);
      
   var s=(cur_oid==oid?'':'<small class="fl_r owner_cont"><a href="/'+href+'" onmouseover="vkVidShowOwnerName('+oid+',this)">'+href+'</a></small>');
   
   return s+'<div class="download_cont"><a href="#" onclick="vkVidLoadLinks('+vid[0]+','+vid[1]+',this.parentNode); return false;">'+IDL('download')+'</a></div>';
}
function vkVidAddGetLink(node){
   if (getSet(2)!='y' ||  getSet(66)=='n') return;
   var vre=/(-?\d+)_(\d+)/;
   var els=geByClass('video_row_cont',node);
   for (var i=0; i<els.length; i++){
      var el=els[i];
      var vid=(el.id || '').match(vre);
      var p=geByClass('video_info_cont',el)[0];
      if (!vid || !p || p.innerHTML.indexOf('vkVidLoadLinks')!=-1) continue;

      var div=vkCe('div',{'class':"download_cont"},'<a href="#" onclick="vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode); return false;">'+IDL('download')+'</a>');
      
      var oid=parseInt(vid[1]);
      var href=(oid<0?'club':'id')+Math.abs(oid);
      var cur_oid=nav.objLoc[0].match(/-?\d+/);
      //alert((cur_oid!=oid)+'\n'+cur_oid+'\n'+oid);
      if (cur_oid!=oid)
         p.appendChild(vkCe('small',{'class':'fl_r owner_cont'},'<a href="/'+href+'" onmouseover="vkVidShowOwnerName('+oid+',this)">'+href+'</a>'),div.firstChild);
 
      p.appendChild(div);  
   }
    
   var addlink=function(el,class_name){
      if (el && el.innerHTML.indexOf('vkVidLoadLinks')!=-1) return;
      if (geByClass('video_row',el)[0]) return;
      var v=geByClass('video',el)[0] || geByClass('image_div',el)[0];
      if (!v) return;
      if (v.innerHTML.indexOf('vkVidLoadLinks')!=-1) return;
      var vid=(v.href || '').match(vre);
      if (!vid || !vid[3]) {
         if (!vid) vid=(v.getAttribute("onclick") || '').match(vre);
         if (vid && (v.href || '').indexOf('youtube.com')!=-1) 
            vid[3]=(v.href.split(/watch(?:\?v\=|%3Fv%3D)/)[1] || '').split('&')[0];         
      } 
      var p=(el.nextElementSibling || {}).className=='media_desc'?el.nextElementSibling:null;//geByClass('media_desc',el.parentNode)[0];
      if (p && p.innerHTML.indexOf('vkVidLoadLinks')!=-1) return;
      if (!vid) return;
      if (!p){
         //<div style="right:auto; bottom:auto; "></div>
         p=geByClass('info',el)[1] || geByClass('info',el)[0];
         var div=vkCe('div',{"class":"vk_vid_download_t"},'<span class="fl_l"><a href="#" onclick="vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode'+(vid[3]?", '"+vid[3]+"'":'')+'); cancelEvent(event); return false;">'+IDL('download')+'</a></span>');         
         if (p) p.appendChild(div);
         else v.parentNode.appendChild(div);//v.insertBefore(div,v.firstChild);
         return;
      }
      var div=vkCe('span',{'class':"download_cont"},'<a href="#" onclick="vkVidLoadLinks('+vid[1]+','+vid[2]+',this.parentNode'+(vid[3]?", '"+vid[3]+"'":'')+'); return false;">'+IDL('download')+'</a>');
      p.appendChild(div);              
   };
   els=geByClass('page_media_video',node);
   for (var i=0; i<els.length; i++) addlink(els[i]);
   els=geByClass('page_media_full_video',node);
   for (var i=0; i<els.length; i++) addlink(els[i]);
   els=geByClass('video_row',node);
   for (var i=0; i<els.length; i++) addlink(els[i],'video_row'); 
   
   els=geByClass('videos_row',node);
   for (var i=0; i<els.length; i++) addlink(els[i]); 

}

function vkVidLoadLinks(oid,vid,el,yid){
    var smartlink=true;//(getSet(1) == 'y')?true:false;
    var fmt=['240p','360p','480p','720p'];
    el=ge(el);
    el.innerHTML=vkLdrImg;
    AjGet('/video.php?act=a_flash_vars&vid='+oid+'_'+vid,function(r,t){
      //console.log(t);
      // if (t=='NO_ACCESS')
      var getyt=function(youid){
         var html='<a href="http://youtube.com/watch?v='+youid+'">YouTube</a>';
            vkGetYoutubeLinks(youid,function(r){
               if (!r) return;
               for (var i=0;i<r.length;i++)
                  html+='<a class="vk_down_icon" href="'+r[i][0]+'" title="'+r[i][2]+'"  class="clear_fix" onmouseover="vkGetVideoSize(this);">'+r[i][1]+'<small class="divide" url="'+r[i][0]+'"></small></a>';
               el.innerHTML=html;      
            });
      }
      if (yid){
         getyt(yid);
      } else if(t=='NO_ACCESS'){
         el.innerHTML='<small class="divide" >'+IDL('NO_ACCESS')+'</small>';
      } else {
         var obj=JSON.parse(t);
         if (obj.extra=="21"){
            getyt(obj.extra_data);            
         } else if (!obj.extra){
            var html='';
            var arr=vkVidDownloadLinksArray(obj);
            for (var i=0; i<arr.length; i++){
               var vidext=arr[i].substr(arr[i].lastIndexOf('.'));   
               var vidname=vkCleanFileName(decodeURI(obj.title || obj.md_title)).replace(/\+/g,' ');
               var vname=vidname;

               vidname='?'+vkDownloadPostfix()+'&/'+vidname;
               var vidurl=arr[i]+(smartlink?vidname+vidext:'')
               html+='<a class="vk_down_icon" href="'+vidurl+'" download="'+vname+vidext+'" onclick="return vkDownloadFile(this);" onmouseover="vkGetVideoSize(this); vkDragOutFile(this);">'+fmt[i]+'<small class="divide" url="'+vidurl+'"></small></a>'; 
            }
            el.innerHTML=html;
         } else {
            el.innerHTML='<small class="divide" >'+IDL('NA')+'</small>';
         }
      }
    });
    // /video.php?act=a_flash_vars&vid=39226536_159441582
    /*
    extra":"21",//youtube
    "extra_data":"JGRAtRzGWlw" //vid
    */
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
		var s = (vars.host.substr(0, 4) == 'http') ? vars.host : 'http://cs' + vars.host + '.' + 'vk.com' + '/';//(vk.intnat ? 'vk.com' : 'vkontakte.ru') 
		return s + 'u' + vars.uid + '/video/' + vars.vtag + '.' + res + '.mp4';
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
            el.removeAttribute('getsize_ok');
			}
			
		},true);	
	}
}

var vk_oid_names={};
function vkVidShowOwnerName(oid,el){
   //el=el.getElementsByTagName('span')[0] || el;
   if (el && !el.hasAttribute('ok')){
      el.innerHTML=vkLdrMiniImg;
      var code='';
      if (oid>0){
         code='var u=API.users.get({uids:'+oid+'}); return u[0].first_name+" "+u[0].last_name;';
      } else{
         code='var g=API.groups.getById({gid:'+Math.abs(oid)+'}); return g[0].name;';
      }
      var view=function(){
         el.innerHTML=vk_oid_names[""+oid];
         el.setAttribute('ok',true); 
      }
      if (vk_oid_names[""+oid])
         view();
      else
         dApi.call('execute',{code:code},function(r){
            vk_oid_names[""+oid]=r.response
            view();
         });
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
/* YOUTUBE FUNCTIONS */
function YTDataDecode(qa) {
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
             if (v[j].indexOf('&')!=-1 && v[j].indexOf('=')!=-1 && !exclude[key]) v[j]=YTDataDecode(v[j]);
            query[key].push(v[j]);                
         }
         if (query[key].length==1) query[key]=query[key][0];
      }
  }
  return query;
}  

function vkGetYoutubeLinks(vid, callback) {
  var url = 'http://www.youtube.com/get_video_info?video_id=' + vid +
            '&asv=3&eurl=' + 
            encodeURIComponent(location.href) + '&el=embedded';
   
   XFR.post(url,{},function(t){   
      var obj=YTDataDecode(t);
      //alert(JSON.Str(obj));
      var map=(obj.fmt_url_map || obj.url_encoded_fmt_stream_map);
      if (!map) return [];
      var links=[];
      for (var i=0;i<map.length;i++){
         var format=YT_video_itag_formats[map[i].itag];
         
         var info=(map[i].type+'').split(';')[0]+' '+(obj.fmt_list[i]+'').split('/')[1];
         if (!format) vklog('<b>YT '+map[i].itag+'</b>: \n'+(map[i].stereo3d?'3D/':'')+info,1);
         format=(map[i].stereo3d?'3D/':'')+(format?format:info);
         links.push([map[i].url+(obj.title?'&title='+encodeURIComponent(obj.title):''), format,info]);
      }
      callback(links);
   });
}

function vkYTVideoLinks(link){
   if (String(link).indexOf('youtube.com')==-1) return;
   var vid=String(link).split('?')[0].split('/').pop();
   vkGetYoutubeLinks(vid,function(r){
      //alert(JSON.Str(r));
      if (!r) return;
      var html=''; 
      for (var i=0;i<r.length;i++)
         html+='<a href="'+r[i][0]+'" title="'+r[i][2]+'"  class="clear_fix" onmouseover="vkGetVideoSize(this);">'+IDL("download")+' '+r[i][1]+'<small class="fl_r divide" url="'+r[i][0]+'"></small></a>';
         //'<a href="'+vidurl+'" onmouseover="vkGetVideoSize(this);">'+IDL("download")+'<small class="fl_r divide" url="'+vidurl+'"></small></a>';
      ge('vkyoutubelinks').innerHTML='<a id="vkyoutubelinks_show" href="javascript: toggle(\'vkyoutubelinks_list\');">'+IDL('download')+'</a><span id="vkyoutubelinks_list" style="display:none;">'+html+'</span>';      
   });
   return '<span id="vkyoutubelinks"></span>';
}
/*END OF YOUTUBE FUNCTIONS */

function vkVidLinks(data){	
	if (ge('mv_actions')){
      if (ge('video_player') && ge('video_player').tagName.toUpperCase()=='IFRAME'){
         var vlink=ge('video_player').getAttribute('src');
         if (vlink && vlink.indexOf('youtube')!=-1){
            if (ge('vk_youtube_video_link')) return;
            var link=vlink.split('?')[0].replace('embed/','watch?v=');
            ge('mv_actions').innerHTML+='<a href="'+link+'" id="vk_youtube_video_link">'+IDL('YouTube',1)+'</a>';/*savefrom_link_tpl.replace('%URL%',link).replace('%CLASS%','fl_l')+*/ 
            ge('mv_actions').innerHTML+=vkYTVideoLinks(vlink);
            /*
               http://www.youtube.com/embed/jfKVHD3hCS0?autoplay=0
               http://www.youtube.com/watch?v=jfKVHD3hCS0
            */
            
         }
         ge('mv_actions').innerHTML+=vk_plugins.video_links(ge('video_player').src);
      } else if (vkVidVars){  
         var h=ge('mv_actions').innerHTML;
         if (h.indexOf('vkGetVideoSize')!=-1) return;
         ge('mv_actions').innerHTML+=vkVidDownloadLinks(vkVidVars); 
         ge('mv_actions').innerHTML+=vk_plugins.video_links(vkVidVars,vkVidDownloadLinksArray(vkVidVars));
         //if (h.indexOf('showTagSelector')!=-1){	ge('mv_actions').innerHTML+='<a href="#" onclick="vkTagAllFriends(); return false;">'+IDL("selall")+'</a>';	}
      } 
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

function vkAudioPlayer(){
   /*
   if (getSet(0)=='y' && INJ_AUDIOPLAYER_DUR_MOD){
      window.vkAudioDurMod=function(res){   return vkAudioDurSearchBtn(res,audioPlayer.lastSong[5]+' - '+audioPlayer.lastSong[6],audioPlayer.id) }
      Inj.Replace('audioPlayer.setCurTime','dur.innerHTML = res','dur.innerHTML = vkAudioDurMod(res)');
      Inj.Replace('audioPlayer.setGraphics','dur.innerHTML = res','dur.innerHTML = vkAudioDurMod(res)');
   }*/
}
function vkAudios(){		
	if (getSet(0)=='y'){
		/*
      if (cur.audioTpl){ 
         Inj.After('cur.audioTpl','id="play\'+aid+\'"></div></a>',"'+vkAudioDownBtn(audio)+'");
         Inj.After('cur.audioTpl',"author+'</span>","'+vkAudioSizeLabel(audio)+'");
         Inj.Replace('cur.audioTpl',/audio\[4\]/g,'vkAudioDurSearchBtn(audio)');
         //Inj.Replace('cur.audioTpl','>\'+audio[4]',' onmouseover="vkGetAudioSize(\\\'\'+aid+\'\\\',this)">\'+audio[4]');
          
		}
      if (cur.rowTpl){
         if (cur.rowTpl.indexOf('down_btn')==-1)
            cur.rowTpl=cur.rowTpl.replace(/(<div[^>]+class="play_new"[^>]+><\/div>)/,"$1"+vkAudioDownBtn(["%audio_id%",null,"%url%",0,0,"%performer%","%title%"])+"")
      }*/
      Inj.Before("Audio.showRows","while (au.","vkAudioNode(au);");
		Inj.After('Audio.searchRequest',/cur.sPreload.innerHTML.+preload;/i,'vkAudioNode(cur.sPreload);');
		Inj.After('Audio.searchRequest',/cur.sContent.innerHTML.+res;/i,'vkAudioNode(cur.sContent);');
		Inj.Before('Audio.loadRecommendations','if (json)','if (rows) rows=vkModAsNode(rows,vkAudioNode); if(preload) preload=vkModAsNode(preload,vkAudioNode); ');
	}
}
function vkAudioPage(){
	vkAudioPlayList(true);
   vkAudioBtns();
	vkAudioDelDup(true);
   vkAudioRefreshFriends();
}

function vkAudioRefreshFriends(){
   var p=ge('audio_more_friends');
   if (!p || ge('vk_audio_fr_refresh')) return;
   p.parentNode.insertBefore(vkCe('a',{id:'vk_audio_fr_refresh', onclick:"cur.shownFriends=[]; Audio.showMoreFriends(); return false;"},'&#8635;'),p);   
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
		var html='</br><div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
  
   var owner=(cur.oid>0?"id":"club")+Math.abs(cur.oid);
	vkAlertBox(IDL('DelAudios'),'<b><a href="/'+owner+'">'+owner+'</a></b><br>'+IDL('DelAllAutiosConfirm'),run,true);
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
      var reArr = ['<span>', '</span>', '<span class="match">'];
      var re = new RegExp(reArr.join('|'), "gi");
      art = art.innerHTML.replace(sr,'').replace(re, '');
      title = geByClass1('title', nfo);
      if (!title) title = ge('title'+_aid) || $x(".//span[@id='title" + _aid + "']", node)[0];//t_node;
      l = geByTag1('a', title);
      if (l) title = l.innerHTML;
      else title = title.innerHTML;
      title = title.replace(re,'').replace(sr,'');
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
  // get mp3 url maybe from /audio?act=reload_audio&al=1&audio_id=132434853&owner_id=10723321
  
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
  var makedownload=function(url,el,id,name){
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
    td.innerHTML='<a href="'+url+'"  download="'+name+'" onclick="return vkDownloadFile(this);" onmouseover="vkDragOutFile(this);"><div onmouseover="vkGetAudioSize(\''+id+'\',this)" class="play_new down_btn" id="down'+id+'"></div></a>';//<img src="'+icon_src+'">
    tr.appendChild(td);  
    el.setAttribute('vk_ok','1');  
    //vk$(this).dragout();
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
         if (url.indexOf('/u00000/')!=-1) continue;
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
			 (geByClass('title_wrap',el.parentNode)[0] || el.parentNode).appendChild(vkCe('small',{"class":"duration_ fl_r",id:"vk_asize"+id, "url":url, dur:data[1]}));

		     var name=el.parentNode.getElementsByTagName('b')[0].innerText+' - '+(span_title || ge('title'+id) || spans[1] || spans[0]).innerText;
           name=vkCleanFileName(name);
		     if (smartlink) {url+='?'+vkDownloadPostfix()+'&/'+vkEncodeFileName(name)+'.mp3';};//normal name
		     //if (SearchLink && el){el.innerHTML=vkAudioDurSearchBtn(el.innerText,name,id);/* "<a href='/search?c[section]=audio&c[q]="+name+"'>"+el.innerText+"</a>";*/}
         if (download){ 
            divs[i].setAttribute('style','width:17px;'); 
            makedownload(url,divs[i],id,name+'.mp3');
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
		  shift: [-15, -3, 0],
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
         /* костыли с педалями и тормозами */
         if (window.sorter && sorter.update && ge('audio'+id) && (ge('audio'+id).parentNode || {}).sorter)
            sorter.update(ge('audio'+id));
			
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

function vkAudioDownBtn(audio){ //[oid,aid,url,3,4,performer,title]
	var names=(getSet(1) == 'y')?true:false;
   var aid=audio[1]?audio[0]+'_'+audio[1]:audio[0];
   
   var name=vkCleanFileName(audio[5]+' - '+audio[6])+'.mp3';
	return '<a href="'+audio[2]+(names?'?'+vkDownloadPostfix()+'&/'+name:'')+'" download="'+name+'" onclick="return vkDownloadFile(this);"  onmouseover="vkDragOutFile(this);"><div class="play_new down_btn" id="down'+aid+'"></div></a>'; 
}

function vkAudioDurSearchBtn(audio,fullname,id){
	var sq=fullname?fullname:audio[5]+' - '+audio[6];
	var dur=fullname?audio:audio[4];
	id = fullname?id:audio[0]+'_'+audio[1];
	//var onclick='if (checkEvent(event)) return; Audio.selectPerformer(event, \''+sq+'\'); return false';'return nav.go(this, event);'
	return '<a href="/search?c[q]='+sq+'&c[section]=audio" onmouseover="vkGetAudioSize(\''+id+'\',this)" onclick="if (checkEvent(event)) return; Audio.selectPerformer(event, \''+sq+'\'); return false">'+dur+'</a>';
}

function vkAudioBtns(){
      if (ge('vkcleanaudios_btn')){
         var allow_show=cur.canEdit && !(nav.objLoc['act']=='recommendations' || nav.objLoc['act']=='popular' || nav.objLoc['friend']);
         (allow_show?show:hide)('vkcleanaudios_btn');
      }      
      if (cur.canEdit && !ge('vkcleanaudios_btn')){
         var p=ge('album_filters');
         
         var btn=vkCe("div",{
               id:"vkcleanaudios_btn",
               "class":"audio_filter",
               onmouseover:"if (Audio.listOver) Audio.listOver(this)",
               onmouseout:"if (Audio.listOut) Audio.listOut(this)",
               onclick:"vkCleanAudios();"
            },'<div class="label">'+IDL('DelAll')+'</div>');
         p.insertBefore(btn,p.firstChild);
      }	
      
      p=ge('audio_albums');//audio_albums_wrap
      if (p && !ge('albumNoSort')){
         var btn=vkCe("div",{
               id:"albumNoSort",
               "class":"audio_filter",
               stopsort:"1",
               onmouseover:"if (Audio.listOver) Audio.listOver(this)",
               onmouseout:"if (Audio.listOut) Audio.listOut(this)",
               onclick:"vkAudioLoadAlbum('NoSort')"
            },'<div class="label">'+IDL('NotInAlbums')+'</div>');
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
   Audio.loadAlbum(albumid);
}

function vkAudioPlayList(add_button){
	if(add_button){
      if (ge('vkmp3links') || nav.objLoc['act']=='recommendations' || nav.objLoc['act']=='popular') return;
		var p=ge('album_filters');
      var btn=vkCe("div",{
            id:"vkmp3links",
            "class":"audio_filter",
            onmouseover:"if (Audio.listOver) Audio.listOver(this)",
            onmouseout:"if (Audio.listOut) Audio.listOut(this)",
            onclick:"vkAudioPlayList();"
         },'<div class="label">'+IDL('Links')+'</div>');
      
      p.insertBefore(btn,p.firstChild);
		//p.innerHTML+='<span class="divider">|</span><a onclick="vkAudioPlayList(); return false;" href="#" id="vkmp3links">'+IDL('Links')+'</a>';
      return;
	}
	vkaddcss('#vk_mp3_links_area, #vk_m3u_playlist_area,#vk_pls_playlist_area{width:520px; height:400px;}');
	var params={}; 
	params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);
   if (cur.album_id && cur.album_id>0) params['album_id']=cur.album_id;
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
			
			links.push(itm.url+"?/"+vkEncodeFileName(vkCleanFileName(itm.artist+" - "+itm.title))+".mp3");
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
         scrobble_fail:'data:image/png;base64,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',
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
        timerId = window.setTimeout(callback, remaining);
        paused=false;
      };
      this.reset = function(){
         window.clearTimeout(timerId);
         remaining = delay;
         this.resume();
      }
      this.get_remaing = function(){
         return paused?remaining:(remaining-(new Date() - start));
      }
      this.kill=function(){
         window.clearTimeout(timerId);
         callback=null;
      }
      paused=true;
      this.resume();
   },
   get_time:function(){
      return Math.round((new Date()).getTime()/1000)
   },
   clean:function(s){
      return winToUtf(s);//s.replace(/&quot;|&amp;|&lt;|&gt;|&rsquo;|&#[0-9]{2}[0-9]*;/gi, ' ');//   |<|>|"|'
   },
   init:function(){
      var fm=vkLastFM;
      var md5=vkMD5;//from vk_lib.js
      fm.token=localStorage['lastfm_token'];
      fm.username=localStorage['lastfm_username'];
      fm.session_key=localStorage['lastfm_session_key'];
      fm.enable_scrobbling=parseInt(localStorage['lastfm_enable_scrobbling']);
      if (fm.enable_scrobbling==NaN) fm.enable_scrobbling=1;
      function LastFM(options){var apiKey=options.apiKey||'';var apiSecret=options.apiSecret||'';var apiUrl=options.apiUrl||'http://ws.audioscrobbler.com/2.0/';var cache=options.cache||undefined;var debug=typeof(options.debug)=='undefined'?false:options.debug;this.setApiKey=function(_apiKey){apiKey=_apiKey};this.setApiSecret=function(_apiSecret){apiSecret=_apiSecret};this.setApiUrl=function(_apiUrl){apiUrl=_apiUrl};this.setCache=function(_cache){cache=_cache};var internalCall=function(params,callbacks,requestMethod){if(requestMethod=='POST'){var html=document.getElementsByTagName('html')[0];var frameName='lastfmFrame_'+new Date().getTime();var iframe=document.createElement('iframe');html.appendChild(iframe);iframe.contentWindow.name=frameName;iframe.style.display="none";var doc;var formState='init';iframe.width=1;iframe.height=1;iframe.style.border='none';iframe.onload=function(){if(formState=='sent'){if(!debug){setTimeout(function(){html.removeChild(iframe);html.removeChild(form)},1500)}};formState='done';if(typeof(callbacks.success)!='undefined'){callbacks.success()}};var form=document.createElement('form');form.target=frameName;form.action=apiUrl;form.method="POST";form.acceptCharset="UTF-8";html.appendChild(form);for(var param in params){var input=document.createElement("input");input.type="hidden";input.name=param;input.value=params[param];form.appendChild(input)};formState='sent';form.submit()}else{var jsonp='jsonp'+new Date().getTime();var hash=auth.getApiSignature(params);if(typeof(cache)!='undefined'&&cache.contains(hash)&&!cache.isExpired(hash)){if(typeof(callbacks.success)!='undefined'){callbacks.success(cache.load(hash))}return}params.callback=jsonp;params.format='json';window[jsonp]=function(data){if(typeof(cache)!='undefined'){var expiration=cache.getExpirationTime(params);if(expiration>0){cache.store(hash,data,expiration)}}if(typeof(data.error)!='undefined'){if(typeof(callbacks.error)!='undefined'){callbacks.error(data.error,data.message)}}else if(typeof(callbacks.success)!='undefined'){callbacks.success(data)}window[jsonp]=undefined;try{delete window[jsonp]}catch(e){}if(head){head.removeChild(script)}};var head=document.getElementsByTagName("head")[0];var script=document.createElement("script");var array=[];for(var param in params){array.push(encodeURIComponent(param)+"="+encodeURIComponent(params[param]))}script.src=apiUrl+'?'+array.join('&').replace(/%20/g,'+');head.appendChild(script)}};var call=function(method,params,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;internalCall(params,callbacks,requestMethod)};var signedCall=function(method,params,session,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;if(session&&typeof(session.key)!='undefined'){params.sk=session.key}params.api_sig=auth.getApiSignature(params);internalCall(params,callbacks,requestMethod)};this.album={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('album.addTags',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('album.getBuylinks',params,callbacks)},getInfo:function(params,callbacks){call('album.getInfo',params,callbacks)},getTags:function(params,session,callbacks){signedCall('album.getTags',params,session,callbacks)},removeTag:function(params,session,callbacks){signedCall('album.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('album.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('album.share',params,callbacks)}};this.artist={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('artist.addTags',params,session,callbacks,'POST')},getCorrection:function(params,callbacks){call('artist.getCorrection',params,callbacks)},getEvents:function(params,callbacks){call('artist.getEvents',params,callbacks)},getImages:function(params,callbacks){call('artist.getImages',params,callbacks)},getInfo:function(params,callbacks){call('artist.getInfo',params,callbacks)},getPastEvents:function(params,callbacks){call('artist.getPastEvents',params,callbacks)},getPodcast:function(params,callbacks){call('artist.getPodcast',params,callbacks)},getShouts:function(params,callbacks){call('artist.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('artist.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('artist.getTags',params,session,callbacks)},getTopAlbums:function(params,callbacks){call('artist.getTopAlbums',params,callbacks)},getTopFans:function(params,callbacks){call('artist.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('artist.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('artist.getTopTracks',params,callbacks)},removeTag:function(params,session,callbacks){signedCall('artist.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('artist.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('artist.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('artist.shout',params,session,callbacks,'POST')}};this.auth={getMobileSession:function(params,callbacks){params={username:params.username,authToken:md5(params.username+md5(params.password))};signedCall('auth.getMobileSession',params,null,callbacks)},getSession:function(params,callbacks){signedCall('auth.getSession',params,null,callbacks)},getToken:function(callbacks){signedCall('auth.getToken',null,null,callbacks)},getWebSession:function(callbacks){var previuousApiUrl=apiUrl;apiUrl='http://ext.last.fm/2.0/';signedCall('auth.getWebSession',null,null,callbacks);apiUrl=previuousApiUrl}};this.chart={getHypedArtists:function(params,session,callbacks){call('chart.getHypedArtists',params,callbacks)},getHypedTracks:function(params,session,callbacks){call('chart.getHypedTracks',params,callbacks)},getLovedTracks:function(params,session,callbacks){call('chart.getLovedTracks',params,callbacks)},getTopArtists:function(params,session,callbacks){call('chart.getTopArtists',params,callbacks)},getTopTags:function(params,session,callbacks){call('chart.getTopTags',params,callbacks)},getTopTracks:function(params,session,callbacks){call('chart.getTopTracks',params,callbacks)}};this.event={attend:function(params,session,callbacks){signedCall('event.attend',params,session,callbacks,'POST')},getAttendees:function(params,session,callbacks){call('event.getAttendees',params,callbacks)},getInfo:function(params,callbacks){call('event.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('event.getShouts',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('event.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('event.shout',params,session,callbacks,'POST')}};this.geo={getEvents:function(params,callbacks){call('geo.getEvents',params,callbacks)},getMetroArtistChart:function(params,callbacks){call('geo.getMetroArtistChart',params,callbacks)},getMetroHypeArtistChart:function(params,callbacks){call('geo.getMetroHypeArtistChart',params,callbacks)},getMetroHypeTrackChart:function(params,callbacks){call('geo.getMetroHypeTrackChart',params,callbacks)},getMetroTrackChart:function(params,callbacks){call('geo.getMetroTrackChart',params,callbacks)},getMetroUniqueArtistChart:function(params,callbacks){call('geo.getMetroUniqueArtistChart',params,callbacks)},getMetroUniqueTrackChart:function(params,callbacks){call('geo.getMetroUniqueTrackChart',params,callbacks)},getMetroWeeklyChartlist:function(params,callbacks){call('geo.getMetroWeeklyChartlist',params,callbacks)},getMetros:function(params,callbacks){call('geo.getMetros',params,callbacks)},getTopArtists:function(params,callbacks){call('geo.getTopArtists',params,callbacks)},getTopTracks:function(params,callbacks){call('geo.getTopTracks',params,callbacks)}};this.group={getHype:function(params,callbacks){call('group.getHype',params,callbacks)},getMembers:function(params,callbacks){call('group.getMembers',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('group.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('group.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('group.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('group.getWeeklyTrackChart',params,callbacks)}};this.library={addAlbum:function(params,session,callbacks){signedCall('library.addAlbum',params,session,callbacks,'POST')},addArtist:function(params,session,callbacks){signedCall('library.addArtist',params,session,callbacks,'POST')},addTrack:function(params,session,callbacks){signedCall('library.addTrack',params,session,callbacks,'POST')},getAlbums:function(params,callbacks){call('library.getAlbums',params,callbacks)},getArtists:function(params,callbacks){call('library.getArtists',params,callbacks)},getTracks:function(params,callbacks){call('library.getTracks',params,callbacks)}};this.playlist={addTrack:function(params,session,callbacks){signedCall('playlist.addTrack',params,session,callbacks,'POST')},create:function(params,session,callbacks){signedCall('playlist.create',params,session,callbacks,'POST')},fetch:function(params,callbacks){call('playlist.fetch',params,callbacks)}};this.radio={getPlaylist:function(params,session,callbacks){signedCall('radio.getPlaylist',params,session,callbacks)},search:function(params,session,callbacks){signedCall('radio.search',params,session,callbacks)},tune:function(params,session,callbacks){signedCall('radio.tune',params,session,callbacks)}};this.tag={getInfo:function(params,callbacks){call('tag.getInfo',params,callbacks)},getSimilar:function(params,callbacks){call('tag.getSimilar',params,callbacks)},getTopAlbums:function(params,callbacks){call('tag.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('tag.getTopArtists',params,callbacks)},getTopTags:function(callbacks){call('tag.getTopTags',null,callbacks)},getTopTracks:function(params,callbacks){call('tag.getTopTracks',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('tag.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('tag.getWeeklyChartList',params,callbacks)},search:function(params,callbacks){call('tag.search',params,callbacks)}};this.tasteometer={compare:function(params,callbacks){call('tasteometer.compare',params,callbacks)},compareGroup:function(params,callbacks){call('tasteometer.compareGroup',params,callbacks)}};this.track={addTags:function(params,session,callbacks){signedCall('track.addTags',params,session,callbacks,'POST')},ban:function(params,session,callbacks){signedCall('track.ban',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('track.getBuylinks',params,callbacks)},getCorrection:function(params,callbacks){call('track.getCorrection',params,callbacks)},getFingerprintMetadata:function(params,callbacks){call('track.getFingerprintMetadata',params,callbacks)},getInfo:function(params,callbacks){call('track.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('track.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('track.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('track.getTags',params,session,callbacks)},getTopFans:function(params,callbacks){call('track.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('track.getTopTags',params,callbacks)},love:function(params,session,callbacks){signedCall('track.love',params,session,callbacks,'POST')},removeTag:function(params,session,callbacks){signedCall('track.removeTag',params,session,callbacks,'POST')},scrobble:function(params,session,callbacks){if(params.constructor.toString().indexOf("Array")!=-1){var p={};for(i in params){for(j in params[i]){p[j+'['+i+']']=params[i][j]}}params=p}signedCall('track.scrobble',params,session,callbacks,'POST')},search:function(params,callbacks){call('track.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('track.share',params,session,callbacks,'POST')},unban:function(params,session,callbacks){signedCall('track.unban',params,session,callbacks,'POST')},unlove:function(params,session,callbacks){signedCall('track.unlove',params,session,callbacks,'POST')},updateNowPlaying:function(params,session,callbacks){signedCall('track.updateNowPlaying',params,session,callbacks,'POST')}};this.user={getArtistTracks:function(params,callbacks){call('user.getArtistTracks',params,callbacks)},getBannedTracks:function(params,callbacks){call('user.getBannedTracks',params,callbacks)},getEvents:function(params,callbacks){call('user.getEvents',params,callbacks)},getFriends:function(params,callbacks){call('user.getFriends',params,callbacks)},getInfo:function(params,callbacks){call('user.getInfo',params,callbacks)},getLovedTracks:function(params,callbacks){call('user.getLovedTracks',params,callbacks)},getNeighbours:function(params,callbacks){call('user.getNeighbours',params,callbacks)},getNewReleases:function(params,callbacks){call('user.getNewReleases',params,callbacks)},getPastEvents:function(params,callbacks){call('user.getPastEvents',params,callbacks)},getPersonalTracks:function(params,callbacks){call('user.getPersonalTracks',params,callbacks)},getPlaylists:function(params,callbacks){call('user.getPlaylists',params,callbacks)},getRecentStations:function(params,session,callbacks){signedCall('user.getRecentStations',params,session,callbacks)},getRecentTracks:function(params,callbacks){call('user.getRecentTracks',params,callbacks)},getRecommendedArtists:function(params,session,callbacks){signedCall('user.getRecommendedArtists',params,session,callbacks)},getRecommendedEvents:function(params,session,callbacks){signedCall('user.getRecommendedEvents',params,session,callbacks)},getShouts:function(params,callbacks){call('user.getShouts',params,callbacks)},getTopAlbums:function(params,callbacks){call('user.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('user.getTopArtists',params,callbacks)},getTopTags:function(params,callbacks){call('user.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('user.getTopTracks',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('user.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('user.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('user.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('user.getWeeklyTrackChart',params,callbacks)},shout:function(params,session,callbacks){signedCall('user.shout',params,session,callbacks,'POST')}};this.venue={getEvents:function(params,callbacks){call('venue.getEvents',params,callbacks)},getPastEvents:function(params,callbacks){call('venue.getPastEvents',params,callbacks)},search:function(params,callbacks){call('venue.search',params,callbacks)}};var auth={getApiSignature:function(params){var keys=[];var string='';for(var key in params){keys.push(key)}keys.sort();for(var index in keys){var key=keys[index];string+=key+params[key]}string+=apiSecret;return md5(string)}}}
      fm.lastfm = new LastFM({
					apiKey: fm.api_key,
					apiSecret: fm.api_secret,
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
      }, error: function(code, message){
         if (code == 4)// токен сдох
            if (!fm.connect_box || !fm.connect_box.isVisible()){
               fm.connect_box=vkAlertBox(IDL('AuthBoxTitle'), IDL('AuthBoxText'), function(){
                  var url = 'http://www.last.fm/api/auth/?api_key=' + fm.api_key + '&cb=' + encodeURIComponent('http://' + location.host + '/settings?act=vkscrobbler');
                  window.open(url,'…','…');
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
         fm.token=null
         fm.username=null
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
      {success: function(data){
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
         error: function(code, message){
            if (code==4 || code==9) fm.auth();
         }
      });
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
      if (!(window.audioPlayer && audioPlayer.lastSong)) return;
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
         dx=dx||7;
         dy1=dy1||-13;
         dy2=dy2||-12;
         if (el.tt && el.tt.container) {
            val(geByClass1('gp_tip_text', el.tt.container), text);
         }
         showTooltip(el, {
            content: '<div class="gp_tip_text">' + text + '</div>',
            className: 'gp_tip',
            black: 1,
            shift: [4 + intval(dx), 13 + intval(dy1), 16 + intval(dy2)],
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
         </div>';
     var gp=ge('gp_small');
     if (gp && !geByClass('lastfm_status',gp)[0]){
         gp.appendChild(vkCe('div',{'class':'fl_l'},'<div class="lastfm_gp">'+controls+'</div>'));
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
      fm.enable_scrobbling=fm.enable_scrobbling?0:1;
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
      localStorage['lastfm_enable_scrobbling']=fm.enable_scrobbling;
      fm.set_icon(); 
      for (var i=0; i<els.length && !hide_tooltip ;i++){
         els[i].onmouseover();
      }
   },
   set_icon:function(audio_info,icon){
      var togglers=["ac"];//vk_lastfm_icon
      var icons=["ac"];
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
                  }
                  var text=IDL('TimeRemaining').replace('<time>','<span class="lastfm_timer">'+time()+'</span>');
                  //if (fm.scrobled) text=fm.lang['TrackPassed']
                  var upd=null;
                  fm.tip(el, text,   {
                     onHide:function(){ clearInterval(upd); },
                     onShowStart:function(tt){
                        var t=geByClass('lastfm_timer',tt.container)[0];  
                        upd=setInterval(function(){
                           if (t)
                              t.innerHTML=time();
                           else
                              clearInterval(upd);
                           
                        },1000);
                     }
                  });
               }
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
                  fm.tip(el, IDL('TrackScrobbled'));;
               }
               addClass(el,'vk_lastfm_ok_icon');//el.className='vk_lastfm_ok_icon';
               break; 
            case 'scrobled_fail':
               show(el);
               if (el.tt) el.tt.hide();
               el.onmouseover=function(){
                  fm.tip(el, IDL('TrackNotScrobbled'));;
               }
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
               fm.last_track=info;
               if (fm.s_timer) fm.s_timer.pause();
               fm.scrobled=false;
               fm.scrobble_timer(info);
               fm.now_playing(info);
               fm.set_icon(info,'playing');        // add scrobbler icon track         
            break;
         case 'play':    //if (fm.last_track.aid!=info.aid){ } else { }
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
}

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
   var PLUGIN_ID = 'vklastfm';
   var PLUGIN_NAME = 'LastFM scrobbler';
   var ADDITIONAL_CSS='\
   #vk_lastfm_icon, .vk_lastfm_icon{cursor:pointer; height:16px; width:16px; margin-left: 5px; background:url("'+vkLastFM.res.blue.last_fm+'") 50% 50% no-repeat;}\
   #vk_lastfm_icon.disabled,.vk_lastfm_icon.disabled{opacity:0.5;}\
   #vk_lastfm_small_icons{position:absolute; margin-left:-16px;}\
   #gp.reverse #vk_lastfm_small_icons{margin-left: 133px;}\
   #vk_lastfm_icons{position:absolute; margin-left:-40px; height:16px; width:40px;}\
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
   \
   .lastfm_ac .vk_lastfm_icon, .lastfm_pd .vk_lastfm_icon{background-image:url("'+vkLastFM.res.blue.last_fm+'");}\
   .lastfm_ac .vk_lastfm_playing_icon, .lastfm_pd .vk_lastfm_playing_icon{background-image:url("'+vkLastFM.res.blue.playing_icon+'");}\
   .lastfm_ac .vk_lastfm_paused_icon, .lastfm_pd .vk_lastfm_paused_icon{background-image:url("'+vkLastFM.res.blue.paused_icon+'");}\
   .lastfm_ac .vk_lastfm_ok_icon, .lastfm_pd .vk_lastfm_ok_icon{background-image:url("'+vkLastFM.res.blue.scrobble_ok+'");}\
   .lastfm_ac .vk_lastfm_fail_icon, .lastfm_pd .vk_lastfm_fail_icon{background-image:url("'+vkLastFM.res.blue.scrobble_fail+'");}\
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


if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;