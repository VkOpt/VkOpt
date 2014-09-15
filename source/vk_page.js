// ==UserScript==
// @name          Vkontakte Optimizer module
// @description   (by KiberInfinity id13391307)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==

/*!
	profiles, walls, graffity from file and  etc.
*/

/* SEARCH */
vk_search={
   css:'\
      #search_content .vk_ex_info .miniblock{ width: 310px;}\
      #search_content .vk_ex_info .miniblock .labeled{position: static; width: 185px; }\
      #search_content .vk_ex_info .miniblock .label{ position: static; width: 120px;}\
      #search_content .people_row.short .info .vk_ex_info{display:none;}\
      .gedit_user_info .vk_ex_info .label:after {content: \': \';padding-right: 5px;}\
   ',
   page:function(){
      vkAudioDelDup(true);
      vk_search.process_node();
   },
   inj:function(){
      //Inj.Before('searcher.showMore',"ge('results')","rows=vkModAsNode(rows,vkProcessNodeLite);");
      //Inj.Before('searcher.sendSearchReq',"ge('results')","rows=vkModAsNode(rows,vkProcessNodeLite);");
   },
   process_node:function(node){
      if (!window.cur || cur.module!='search' || getSet(87)!='y') return;
      var nodes=geByClass('people_row',node);
      var uids=[];
      for (var i=0; i<nodes.length; i++){
         var el=nodes[i];
         var uid=(el.innerHTML.match(/Searcher.bigphOver\([^,\)]+\s*,\s*(\d+)\)/) || [])[1];
         if (!uid) continue;
         var info=geByClass('info',el)[0];
         var ex=geByClass('vk_ex_info',el)[0];
         if (!info || ex) continue;
         info.appendChild(se('<div class="vk_ex_info" id="vk_exinfo_'+uid+'"><div class="labeled ">'+vkLdrMiniImg+'</div></div>'));
         uids.push(uid);
      }
      vk_search.load_ex_info(uids);
   },
   process_node_gr_req:function(node){
      console.log('process_node_gr_req');
      if (!window.cur || cur.tab != "requests" || getSet(96)!='y') return;
      var nodes=geByClass('gedit_user',node);
      var uids=[];
      console.log('gedit_user',nodes);
      for (var i=0; i<nodes.length; i++){
         var el=nodes[i];
         var uid=(el.id.match(/gedit_user_requests(\d+)/) || [])[1];
         if (!uid) continue;
         var info=geByClass('gedit_user_btns',el)[0];
         var ex=geByClass('vk_ex_info',el)[0];
         if (!info || ex) continue;
         info.parentNode.insertBefore(se('<div class="vk_ex_info" id="vk_exinfo_'+uid+'"><div class="labeled ">'+vkLdrMiniImg+'</div></div>'),info);
         uids.push(uid);
      }
      //if (uids.length) stManager.add('profile.css');
      vk_search.load_ex_info(uids);
   },
   ex_info_cfg:function(){
      var p=ge('search_filters');
      if (!p || ge('ex_info_cfg')) return;
      

   },
   load_ex_info:function(uids,cnt){
      if (!uids || uids.length==0) return;
      if (!ge('vk_exinfo_'+uids[0])){
         if (cnt && cnt>30) return;
         setTimeout(function(){vk_search.load_ex_info(uids,(cnt||0)+1)},100);
         return;
      }
      var u={};
      for (var i=0; i<uids.length; i++)
         u[''+uids[i]]=1;
      
      dApi.call('users.get',{uids:uids.join(','),fields:'screen_name,sex,bdate,contacts,connections,relation'},{
         ok:function(r){
            var data=r.response;
            for (var i=0; i<data.length;i++){
               var p=data[i];
               var el=ge('vk_exinfo_'+p.uid) || ge('vk_exinfo_'+p.screen_name);
               if (!el) continue;
               u[''+p.uid]=0;
               u[''+p.screen_name]=0;
               el.innerHTML=vk_search.parse_info(p);//JSON.stringify(p);
               vkProccessLinks(el);
            }
            for (var key in u)
               if (u[key] && ge('vk_exinfo_'+key)) 
                  ge('vk_exinfo_'+key).innerHTML='';
            
         },
         error:function(){}
      });
      //ge('vk_exinfo_'+uid)
   },
   parse_info:function(profile){
      var sex=profile.sex;
      var relation=profile.relation;
      var rel=IDL((sex==1?'profile_relation_f_':'profile_relation_m_')+relation);
      rel=relation>0?rel:'';
      if (profile.relation_partner){
         var rp=profile.relation_partner;
         rel+=' (<a href="/id'+rp.id+'">'+rp.first_name+' '+rp.last_name+'</a>)';
      }
      
      var bdate=(profile.bdate || '').split('.');
      var bday_info='';
      if(bdate.length>1)
            bday_info = vkProcessBirthday(bdate[0],bdate[1],bdate[2]).join(', ');
      if (profile.bdate)
         bday_info = profile.bdate + " (" + bday_info + ")";
      else 
         bday_info = null;
         
      var info_labels=[
			[bday_info, IDL('Bithday')],
         //[(sex==1?Sex_fm:Sex_m), IDL('Sex')],
         [rel,IDL('Relation')],
			[profile.mobile_phone, IDL('Mob_tel')],
			[profile.home_phone, IDL('Home_tel')],
         [profile.skype, IDL('Skype')]
		];
      var info_html='';
		for (var i=0; i<info_labels.length;i++)
			if (info_labels[i][0] && info_labels[i][0]!='0')
			info_html+='<div class="clear_fix miniblock">\n\
					  <div class="label fl_l">'+info_labels[i][1]+'</div>\n\
					  <div class="labeled fl_l">'+info_labels[i][0]+'</div>\n\
					</div>';
      return info_html;
   }
}

/* PROFILE */

vk_profile={  
   page:function(){
      if (ge('vk_profile_inited')) return;
      ge('profile_info').appendChild(vkCe('input',{type:'hidden',id:'vk_profile_inited'}));
      //if (getSet(24) == 'y') vkAvkoNav();
      if (getSet(25) == 'y') status_icq(ge('profile_full_info'));
      if (getSet(26) == 'y') vkProcessProfileBday(); //VkCalcAge();
      vkPrepareProfileInfo();
      vk_graff.upload_graff_item();
      vk_photos.pz_item();
      //vkWallAddPreventHideCB();
      vkUpdWallBtn(); //Update wall button
      vk_profile.wall_notes_link();
      if (cur.oid!=vk.id) vk_profile.wall_tat_link();
      if (getSet(91)=='y' && cur.oid!=vk.id) vk_profile.fav_fr_block(); 
      if (getSet(50)=='y' && remixmid()==cur.oid && !ge('profile_fave')) vkFaveProfileBlock(); 
      if (getSet(60) == 'y') vkProfileMoveAudioBlock(); 
      if (getSet(61) == 'y') vkProfileGroupBlock();   
      if (MOD_PROFILE_BLOCKS) vkFrProfile();
      //if (getSet(65)=='y') vkShowLastActivity()
      if (getSet(46) == 'n') vkFriends_get('online');
      if (getSet(47) == 'n') vkFriends_get('common');
      if (getSet(72) == 'y') vk_profile.fr_in_cats();
      vk_profile.only4friends_checkbox();
      vk_highlinghts.groups_block();
      vk_highlinghts.profile_groups();   
   },
   inj:function(){
      Inj.After('profile.init','});','setTimeout("vkProcessNode();",2);');
      Inj.End('profile.init','setTimeout("vkOnNewLocation();",2);');   
   },
   wall_notes_link:function(get_count){
      if (get_count){
            dApi.call('execute',{code:'return API.notes.get({uid:'+cur.oid+', count:1})[0];'},function(r){ 
               ge('pr_notes_count').innerHTML=(r.response || '0');
            });
      }
      html='<a class="notes" onclick="return nav.go(this, event);" href="/notes'+cur.oid+'" onmouseover="vk_profile.wall_notes_link(true);">\
      <span class="fl_r thumb"></span><span class="fl_r" id="pr_notes_count"></span>'+IDL('clNo',1)+'</a>';
      if (ge('profile_counts') && !ge('pr_notes_count')){
         ge('profile_counts').appendChild(vkCe('div',{},html));
      }        
   },
   wall_tat_link:function(){
      if (ge('vk_wall_tat_link')) return;
      if (isVisible('page_wall_switch'))  ge('page_wall_header').appendChild(vkCe('span',{"class":'fl_r right_link divide'},'|'))
      var href=ge('page_wall_header').getAttribute('href');
      ge('page_wall_header').appendChild(vkCe('a',{
                  "class":'fl_r right_link', 
                  id:'vk_wall_tat_link',
                  href:'/wall'+cur.oid+'?with='+vk.id,
                  onclick:"cancelEvent(event); return nav.go(this, event);",
                  onmouseover:"this.parentNode.href='/wall"+cur.oid+"?with="+vk.id+"';",
                  onmouseout:"this.parentNode.href='"+href+"';"
               },IDL('T-a-T',1)))   
   },
   edit_page:function(){
      vk_profile.edit_mid_name();
   },
   edit_mid_name: function(){
      if (!ge('pedit_middle_name')){
         var p=ge('pedit_maiden_row');
         if (!p) return;
         var div=vkCe('div',{'class':'pedit_general_row clear_fix'},'\
            <div class="pedit_general_label fl_l ta_r">'+IDL('Middle_name')+'</div>\
            <div class="pedit_general_labeled fl_l"><input type="text" id="pedit_middle_name" class="text" autocomplete="off"></div>\
        ');
         p.parentNode.insertBefore(div,p);
      }
   },
   fr_in_cats:function(){
      var el=ge('profile_am_subscribed');
      if (!el || el.innerHTML.indexOf('section=list')!=-1) return;
      vkFriendUserInLists(cur.oid,function(html,status){
         if (html=='') return;
         if (html=='' || !el || el.innerHTML.indexOf('section=list')!=-1) return;
         el.innerHTML+='<br>[ '+html+' ]';
      },true);   
   },
   only4friends_checkbox:function(){
      if (cur.oid!=remixmid() || ge('friends_only') ) return;
      var p=ge('page_add_media');
      if (!p) return;
      var cb=vkCe('div',{"class":"checkbox fl_l","id":"friends_only","onclick":"checkbox(this);checkbox('status_export',!isChecked(this));checkbox('facebook_export',!isChecked(this));"},'<div></div>'+IDL('OnlyForFriends'))
      p.parentNode.insertBefore(cb,p);   
   },
   fav_fr_block:function(is_list){
      var is_right_block = false;//(getSet(XX)=='y');
      if (!ge('profile_favefr')){
         var html='\
           <a href="/fave" onclick="return nav.go(this, event)" class="module_header"><div class="header_top clear_fix">'+IDL('FaveFr')+'</div></a>\
           <div class="module_header">\
             <div class="p_header_bottom">\
               <a href="javascript:vk_profile.fav_fr_block(true)" id="vk_favefr_all_link">'+ vkopt_brackets(IDL('FaveFr') +' ( -- )')+'</a>\
             </div>\
           </div>\
           <div class="module_body clear_fix" id="vk_favefr_users_content"></div>\
         ';
         var div=vkCe('div',{"class":"module clear people_module",id:"profile_favefr"});
         div.innerHTML=html;
         var p=ge(is_right_block?'profile_wall':'profile_friends');
         p.parentNode.insertBefore(div,p);  
      }
      ge('vk_favefr_users_content').innerHTML=vkBigLdrImg;
      if (is_list){
         ge("vk_favefr_all_link").href="javascript:vk_profile.fav_fr_block()";
      } else {
         ge("vk_favefr_all_link").href="javascript:vk_profile.fav_fr_block(true)";
      }
      
      var uid=cur.oid;
      function get_users(callback){
         dApi.call('execute',{code:'var a=API.fave.getUsers({count:1000}); return {faves:a@.uid,friends:API.friends.get({uid:'+uid+'})};'},function(r){
            var data=r.response;
            var fav=data.faves;
            var fr=data.friends;
            var favfr=[];
            for (var i=0; i<fav.length; i++){
               if (fr.indexOf(fav[i])!=-1) favfr.push(fav[i]);
            }
            if (favfr.length){
               dApi.call('users.get',{uids:favfr.join(','),fields:'photo'},function(r){
                  callback(r.response || []);
               })
            } else {
               callback([]);
            }
         });
      };
      
      get_users(function(list){
         var to=3;
         var count=is_list?list.length:Math.min(list.length,FAVE_ONLINE_BLOCK_SHOW_COUNT);
         var users='';
         for (var i = 0; i < count; i++) {
            if (!is_list){
            var n1=list[i].first_name || '';
            var n2=list[i].last_name || '';
            users += ((i == 0 || i % to == 0) ? '<div class="people_row">' : '') + 
                     '<div class="fl_l people_cell">\
                       <a href="/id'+list[i].uid+'" onclick="return nav.go(this, event)">\
                         <img width="50" height="50" src="'+list[i].photo+'">\
                       </a>\
                       <div class="name_field">\
                         <a href="/id'+list[i].uid+'" onclick="return nav.go(this, event)">\
                           '+n1+'<br><small>'+n2+'</small>\
                         </a>\
                       </div>\
                     </div>'+
                  ((i > 0 && (i + 1) % to == 0) ? '</div>' : '');
            } else {
               users +='<div align="left" style="margin-left: 10px; width:180px;">&#x25AA;&nbsp;\
                  <a href="write'+list[i].uid+'" onclick="return showWriteMessageBox(event, '+list[i].uid+')" target="_blank">@</a>&nbsp;\
                  <a href="id'+list[i].uid+'" '+(vkIsFavUser(list[i].uid)?'class="vk_faved_user"':'')+'>'+list[i].first_name+' '+list[i].last_name+'</a>\
                  </div>';
            }
         }
         if (ge('vk_favefr_users_content')){
            ge("vk_favefr_all_link").innerHTML=vkopt_brackets(IDL('FaveFr') +' ('+list.length+')');
            ge('vk_favefr_users_content').innerHTML=users;
            vkProcessNodeLite(ge('vk_favefr_users_content'));
         }
         
      });
   }
}
/*
function vkLastActivity(uid,callback){
   ajax.post('al_im.php', {act: 'a_history', peer: uid, offset: 0, whole: 0}, {
      onDone: function (html, msgs, all_shown, newmsg, data) {callback(data?data.lastact:null)}
   });
}
function vkShowLastActivity(){
   if (!ge('vk_profile_online_la')) 
      ge('title').appendChild(vkCe('b',{id:"vk_profile_online_la", "class":"fl_r", "onclick":"vkShowLastActivity();"}));
   ge('vk_profile_online_la').innerHTML = "";   
   vkLastActivity(cur.oid,function(info){
      if (info) ge('vk_profile_online_la').innerHTML = info;
   });
}
*/

vk_highlinghts={
   process_node:function(node){
      var common=(getSet(39) == 'y');
      if (!common || !window.cur || cur.module!='profile') return;
      var els=geByClass('fans_idol_row',node);
      if (node && els.length>0){
         for (var i=0; i<els.length; i++){
            var nodes=els[i].getElementsByTagName('a');
            var hl=function(){
               var groups=','+vkGetVal('vk_my_groups')+',';
               for (var i=0;i<nodes.length;i++){
                  var href=nodes[i].getAttribute('href');
                  if (!href) continue;
                  var gid=href.split('/');
                  gid=gid[gid.length-1];
                  if (hasClass(nodes[i],'fans_idol_ph')) continue;
                  if (cur.oid!=remixmid() && groups.indexOf(','+gid+',')!=-1)	addClass(nodes[i],'vk_common_group');
                  if (isGroupAdmin(gid))	addClass(nodes[i],'vk_adm_group');
               }	      
            }
            hl();
         }
      }
   },
   update_my_gr_list:function(callback){
      dApi.call('groups.get',{extended:1},function(r){
         
         var data=r.response;
         count=data.shift();
         var mygr=[];
         for (var i=0;i<data.length;i++){
            mygr.push(data[i].screen_name);
         }
         var groups=mygr.join(',');
         vkSetVal('vk_my_groups',groups);
         if (callback) callback();
      }); 
   },
   profile_groups:function(node){
      var common=(getSet(39) == 'y');
      if (!common) return;
      var p=node || ge('profile_full_info') ;
      if (!p || !p.getElementsByTagName) return;
      var nodes=p.getElementsByTagName('a');
      
      var hl=function(){
         var groups=(vkGetVal('vk_my_groups')||'').split(',');
         for (var i=0;i<nodes.length;i++){
            var href=nodes[i].getAttribute('href');
            if (!href) continue;
            var gid=href.split('/');
            gid=gid[gid.length-1];
            if (cur.oid!=remixmid() && groups.indexOf(gid)!=-1)	addClass(nodes[i],'vk_common_group');
            /*
            if (cur.oid==remixmid() && groups.indexOf(gid)==-1){
               groups.push(gid);
               vkSetVal('vk_my_groups',groups.join(','));
            }*/
            if (isGroupAdmin(gid))	addClass(nodes[i],'vk_adm_group');
         }	      
      }
      var gl=vkGetVal('vk_my_groups');
      if (!gl || gl=='' || (common && cur.oid==remixmid())){ 
         vk_highlinghts.update_my_gr_list(function(r){
            hl();
         });
      } else {
         hl();
      } 
   },
   groups_block:function(){
      var common=(getSet(39) == 'y');
      
      function process_node(nodes){
         if (cur.oid==remixmid()){
            var mygr=(vkGetVal('vk_my_groups')||'').split(',');//[];
            for (var i=0;i<nodes.length;i++){
               var href=nodes[i].getAttribute('href');
               if (!href) continue;
               var id=href.split('/');	
               id=id[id.length-1];
               if (id!=''){
                  mygr.push(id);
               }
               if (isGroupAdmin(id) && common)	addClass(nodes[i],'vk_adm_group');
            }
            //var groups=mygr.join(',');
            //vkSetVal('vk_my_groups',groups);
         } else if(common){
            var groups=','+vkGetVal('vk_my_groups')+',';
            for (var i=0;i<nodes.length;i++){
               var href=nodes[i].getAttribute('href');
               if (!href) continue;
               var gid=href.split('/');
               gid=gid[gid.length-1];
               if (groups.indexOf(','+gid+',')!=-1)	addClass(nodes[i],'vk_common_group');
               if (isGroupAdmin(gid))	addClass(nodes[i],'vk_adm_group');
            }		
         }
      }
      if (ge('profile_groups') && geByClass('module_body',ge('profile_groups'))[0]){
         var nodes=geByClass('module_body',ge('profile_groups'))[0].getElementsByTagName('a');
         process_node(nodes);
      }
      if (ge('page_list_module') && geByClass('module_body',ge('page_list_module'))[0]){
         var nodes=geByClass('module_body',ge('page_list_module'))[0].getElementsByTagName('a');
         process_node(nodes);
      }     
   }

}


/*WALL*/
function vkWallPage(){
	vk_graff.upload_graff_item();
   vk_photos.pz_item();
   //vkWallAddPreventHideCB();
	vkAddCleanWallLink();
	vkAddDelWallCommentsLink();
   vkWallPhotosLinks();
}
function vkWallPhotosLinks(){
   var el=geByClass('fw_post_info')[1];
   //alert(cur.oid +'\n'+ cur.pid +'\n'+ el +'\n'+ !ge('vk_wall_ph_links') +'\n'+ geByClass('page_media_full_photo')[0]);
   if (cur.oid && cur.pid && el && !ge('vk_wall_ph_links') && (geByClass('page_media_full_photo')[0] || geByClass('page_post_thumb_sized_photo')[0])){
      var listId='wall'+cur.oid+'_'+cur.pid;
      el.insertBefore(vkCe('a',{id:'vk_wall_ph_links', "class":"fl_r","onclick":"vkGetLinksToPhotos('"+listId+"')"},IDL('Links')),el.firstChild);
      //vkGetLinksToPhotos();
   }
}




function vkWall(){
	Inj.End('FullWall.init','setTimeout("vkOnNewLocation();",2);');
   if (getSet(71)=='y') 
      Inj.Before('FullWall.replyTo','if (!v','vkWallReply(post,toMsgId, toId, event, rf,v,replyName); if(false) ');
   //Inj.Before('Wall.replyTo','toggleClass','vk_wall.cancel_reply_btn(post);');  
}


vk_wall = {
   cancel_reply_btn:function(post){
      var title=ge('reply_to_title' + post);
      var inp=ge('reply_to' + post);
      if (!inp || !title || (title.innerHTML || '').indexOf('cancel_reply')!=-1) return;
      title.appendChild(vkCe('div',{'class':'vk_x_btn',onclick:"vk_wall.cancel_reply('"+post+"');"}));
   },
   cancel_reply:function(post){
      var title=ge('reply_to_title' + post);
      var inp=ge('reply_to' + post);   
      val(inp, '');
      val(title, '');
   }
}

vk_notes={  // <a onclick="showBox('wkview.php', {act: 'notes_old_privacy', nid: 11661199});">Privacy settings</a>
   add_new:function(){
      stManager.add(['ui_controls.js', 'ui_controls.css','wkview.css'],function(){
         
         var box = new MessageBox({title: IDL('NoteNew'),width:'654px', progress:'vk_box_progr',bodyStyle:'padding:0px;'},true);
         box.removeButtons();

         //box.addButton(getLang('box_cancel'),box.hide, 'gray')
         var save_btn=box.addButton(getLang('box_save'),function(){  
            lockButton(save_btn);
            console.log(save_btn);
            dApi.call('notes.add',{title:ge('wk_page_title').value,text:ge('wke_textarea').value,privacy:ge('vk_note_privacy_val').value},function(r){ //privacy: 0 — all, 1 — only friends , 2 — friends and friends , 3 — only owner
               unlockButton(save_btn);
               var nid=(r.response || {}).nid;
               if (nid){
                  var note='note'+vk.id+'_'+nid;
                  vkMsg('<a href="/'+note+'">'+note+'</a>')
               }
               box.hide(); 
               if (nav.objLoc[0].match(/notes\d+/)){
                  nav.reload();
               }
            })


         },'yes',true);
         save_btn=geByTag1('button',save_btn);
         
         html='<div class="wk_page_title_cont"><input id="wk_page_title" class="text" value="" placeholder="Title"><br><br></div>';
         html+='<div id="editor_cont">\
         <textarea id="wke_textarea" class="wk_wiki_text wke_textarea" style="width: 630px; overflow-x: hidden; overflow-y: hidden; resize: none; height: 300px; display: block;"></textarea>\
         </div>';

         box.content(html);
         box.show();
         var p=ge('vk_box_progr');
         p.parentNode.insertBefore(se('<div id="vk_note_privacy"><input type="hidden" id="vk_note_privacy_val"></div>'),p);
         cur.vkNotePrivacy = new Dropdown(ge('vk_note_privacy_val'),[
               [0,getLang("privacy_options_all_users")],
               [1,getLang("privacy_options_friends_only")],
               [2,getLang("privacy_options_friends_and_friends")],
               [3,getLang("privacy_options_only_me")]
         ], {
           target: ge('vk_note_privacy'),
           resultField:'vk_note_privacy_val',
           customArrowWidth:25,
           width:260,
           onChange: function(val){    }
         });
      });	
      
      return false;
   }
}


function vkWallReply(post,toMsgId, toId, event, rf,v,replyName){
      console.log(post, toMsgId);
      var name=(replyName[1] || '').split(',')[0];
      if ((v||'').indexOf('id'+toId)==-1 && !checkEvent(event)){
         var new_val=(v?v+'\r\n':'');
         if ((post || "").indexOf('topic')!=-1)
            new_val+='[post'+toMsgId+'|'+name+'], ';
         else
            
            new_val+='['+(parseInt(toId)<0?'club':'id')+Math.abs(toId)+'|'+name+'], ';
            
         val(rf, new_val);
         if (rf.autosize) 
            rf.autosize.update();
      }
}

function vkPostSubscribe(oid, id_post){     // Подписаться на пост на стене путем добавления и удаления коммента
    // Сначала запускаем перехват изменений DOM-а, чтобы удалить кнопку "добавлен 1 комментарий" и сам коммент,
    // потому что вконтакт присылает новые комменты, даже если они были моментально удалены.
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var list = ge('replies'+oid+'_'+id_post);   // контейнер с комментами. Будем следить за ним.
    var observer = new MutationObserver(function(mutations, _this) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                if (mutation.addedNodes)
                    list.removeChild(mutation.addedNodes[0]);   // удаляем добавленный коммент
                var added_comment_link = geByClass('replies_open',list.parentNode);
                if (added_comment_link.length)  // если есть кнопка "добавлен 1 комментарий",
                    list.parentNode.removeChild(added_comment_link[0]); // то удаляем её.
                _this.disconnect(); // Остановить прослушивание изменений DOM
            }
        });
    });
    observer.observe(list, { childList: true });
    // Собственно, добавление и удаление комментария.
    dApi.call('wall.addComment',{owner_id: oid, post_id: id_post, text: '[subscribe]'}, function(r_add){
        if (r_add.response)
            dApi.call('wall.deleteComment',{owner_id: oid, comment_id: r_add.response.cid}, function(r_del){
                if (r_del.response)
                    vkMsg(IDL('Done'));
                else
                    vkMsg(IDL('Error'));
            });
        else
            vkMsg(IDL('Error'));
    });
}

function vkPostSubscribeBtn(node) {      // Добавление кнопки "Подписаться на пост"
    // при первом вызове (который без параметров) добавляем стили кнопки "подписаться"
    if (!node) vkaddcss('                               \
        .post_subscribe {                               \
            padding:    5px 6px;                        \
            cursor:     pointer;                        \
            visibility: hidden;                         \
        }                                               \
        .wall_post_over .post_subscribe {               \
            visibility: visible;                        \
        }                                               \
        .post_subscribe i {                             \
            width:      11px;                           \
            height:     11px;                           \
            background-image: url("'+subscribe_icon+'");\
        }');

    var els = geByClass('post_full_like', node);    // все контейнеры с лайками
    for (var i = 0; i < els.length; i++) {
        var parentContainer = els[i];
        var id = parentContainer.innerHTML.match(/(-?\d+)_(\d+)'/);    // id владельца и записи, для которой создается кнопка
        if (id != null)
        parentContainer.appendChild(vkCe('div', {
                "title":    IDL('AddToSubscribtions'),
                "class":    "post_subscribe fl_r",
                "onclick":  "vkPostSubscribe(" + id[1] + ", " + id[2] + ")"
            },
            '<i class="sp_main fl_l"></i>'
        ));
    }
}

function vkPollResults(post_id,pid){
   var tpl='\
       <tr>\
         <td colspan="2" class="page_poll_text">%TEXT</td>\
       </tr><tr onmouseover="Wall.pollOver(this, \'%POLL_ID\', %ANSWER_ID)">\
         <td class="page_poll_row">\
         <div class="page_poll_percent" style="width: %WIDTH%"></div><div class="page_poll_row_count">%COUNT</div>\
         </td><td class="page_poll_row_percent ta_r"><nobr><b>%RATE%</b></nobr></td>\
       </tr>\
       <tr><td colspan="2"><div id="vk_poll_usrs%ANSWER_ID" class="wk_poll_usrs"></div></td></tr>\
   '; 

   var view=function(data){
      var answer=data.answers; //answer[i].rate=12.9; answer[i].text="...."; answer[i].votes=150
      var max=0;
      for (var i=0; i<answer.length; i++){
         max=Math.max(max,answer[i].rate);
      }
      
      var html="";
      for (var i=0; i<answer.length; i++){
         var width=Math.round(answer[i].rate*100/max);
         html+=tpl.replace(/%RATE/g,answer[i].rate)
                  .replace(/%TEXT/g,answer[i].text)
                  .replace(/%POLL_ID/g,post_id)
                  .replace(/%ANSWER_ID/g,answer[i].id)
                  .replace(/%WIDTH/g,width)
                  .replace(/%COUNT/g,answer[i].votes);
      }   
      html='<table cellspacing="0" cellpadding="0" class="page_media_poll"><tbody>'+html+'</tbody></table>';
      
      html='\
      <div class="page_media_poll_wrap">\
         <div class="page_media_poll_title">'+data.question+'</div>\
         <div class="page_media_poll">\
         '+html+'\
         </div>\
      </div>';   
      
      var box=vkAlertBox(IDL('ViewResults'),html);
      vkPollVoters(data.owner_id,data.poll_id);
   };
   
   var code=''+
      'var post=API.wall.getById({posts:"'+post_id+'"})[0];'+
      'var attachments=post.attachments;'+
      'var i=0;'+
      'var b=attachments[i];'+
      'var pid = 0;'+
      'var oid = 0;'+
      'var oid2 = 0;'+
      'while(i<attachments.length){'+
         'if (b.type=="poll"){'+
            'pid=b.poll.poll_id;'+
            'oid=post.copy_owner_id;'+
            'oid2=post.to_id;'+
         '};'+
         'i = i + 1;'+
         'b=attachments[i]; '+
      '}'+
      'return {oid:oid,oid2:oid2,pid:pid,p:post,poll1:API.polls.getById({owner_id:oid,poll_id:pid}),poll2:API.polls.getById({owner_id:oid2,poll_id:pid})};'+
      '';
      
   if (post_id && pid){
      dApi.call('polls.getById',{owner_id:post_id,poll_id:pid},function(r){
         var data=r.response;
         view(data);
      });
   } else {
      dApi.call('execute',{code:code},function(r){
         var data=r.response;
         console.log(data);
         view(data.poll1 || data.poll2);
      });   
   }
   return false;
}


function vkPollCancelAnswer(post_id,pid){
   var cancel=function(data){
      if (data.answer_id==0){
         alert(IDL('CancelAnswerError'));
         return;
      }
      //board:
      dApi.call('polls.deleteVote',{owner_id:data.owner_id,poll_id:data.poll_id,answer_id:data.answer_id},function(r){
         alert(r.response==1?IDL('CancelAnswerSuccess'):IDL('CancelAnswerFail'));
      });
   };
   
   var code=''+
      'var post=API.wall.getById({posts:"'+post_id+'"})[0];'+
      'var attachments=post.attachments;'+
      'var i=0;'+
      'var b=attachments[i];'+
      'var pid = 0;'+
      'var oid = 0;'+
      'var oid2 = 0;'+
      'while(i<attachments.length){'+
         'if (b.type=="poll"){'+
            'pid=b.poll.poll_id;'+
            'oid=post.copy_owner_id;'+
            'oid2=post.to_id;'+
         '};'+
         'i = i + 1;'+
         'b=attachments[i]; '+
      '}'+
      'return {oid:oid,oid2:oid2,pid:pid,p:post,poll1:API.polls.getById({owner_id:oid,poll_id:pid}),poll2:API.polls.getById({owner_id:oid2,poll_id:pid})};'+
      '';
      
   if (post_id && pid){
      dApi.call('polls.getById',{owner_id:post_id,poll_id:pid},function(r){
         var data=r.response;
         cancel(data);
      });
   } else {
      dApi.call('execute',{code:code},function(r){
         var data=r.response;
         console.log(data);
         cancel(data.poll1 || data.poll2);
      });   
   }
   return false;
}


function vkPollVoters(oid,poll_id){
   var code=''+
     'var oid='+oid+';'+
     'var poll_id='+poll_id+';'+
     'var poll=API.polls.getById({owner_id:oid,poll_id:poll_id});'+
     'var voters=API.polls.getVoters({owner_id:oid,poll_id:poll_id,answer_ids:poll.answers@.id,fields:"first_name,last_name,online,photo_rec",offset:0,count:9});'+
     'return {poll:poll,voters:voters,anwers_ids:poll.answers@.id};'+
   '';
   dApi.call('execute',{code:code},function(r){
         var data=r.response;
         console.log(data);
         if (data.voters){
            stManager.add('wk.css');
            var voters=data.voters;
            for (var j=0; j<voters.length; j++){
               var el=ge('vk_poll_usrs'+voters[j].answer_id);
               var users=voters[j].users
               var html='';
               for (var i=0; i<users.length; i++){
                  if (!users[i].uid) continue;
                  html+='<a class="wk_poll_usr inl_bl" title="'+users[i].first_name+' '+users[i].last_name+'" href="/id'+users[i].uid+'"><img class="wk_poll_usr_photo" src="'+users[i].photo_rec+'" width="30" height="30"></a>'; 
               }
               el.innerHTML=html;
            }
         }
   }); 
   // ge('vk_poll_usrs'+voters[i].answer_id)
}


function vkPollResultsBtn(node){
   var els=geByClass('page_media_poll',node);
   for (var i=0; i<els.length; i++){
      var p=els[i];
      var el=geByClass('page_poll_options',p)[0];
      var c=geByClass('page_poll_bottom',p)[0];//'page_poll_total'
      
      
      if (!el && c){
         var m=p.innerHTML.match(/id="post_poll_raw-?\d+_\d+[^>]+value="(-?\d+)_(\d+)"/);
         if (c.innerHTML.indexOf('vkPollCancelAnswer')!=-1) continue;
         c.insertBefore(vkCe('span',{"class":"divider fl_r"},"|"),c.firstChild);
         c.insertBefore(vkCe('a',{
                                  "class":"fl_r",
                                  "href":"#",
                                  "onclick":"return vkPollCancelAnswer('"+m[1]+"','"+m[2]+"');"
                                 },IDL('CancelAnswer')),c.firstChild); 
      }

      if (!el || !c) continue;
      var id=(el.id || "").match(/(-?\d+)_(\d+)/);
      if (!id) continue;
      var oid=id[1];
      id=id[0];
      if (c.innerHTML.indexOf('vkPollResults')!=-1) continue;
      c.insertBefore(vkCe('span',{"class":"divider fl_r"},"|"),c.firstChild);
      c.insertBefore(vkCe('a',{
                               "class":"fl_r",
                               "href":"#",
                               "onclick":"return vkPollResults('"+id+"');"
                              },IDL('ViewResults')),c.firstChild);      
   }
}


/* MAIN CODE */
function vkPrepareProfileInfo(){
	if (cur.options.info){
		var mod_info=function(node){
			vkProcessNode(node);
			//status_icq(node);
		}
		cur.options.info[0]=vkModAsNode(cur.options.info[0],mod_info);
		cur.options.info[1]=vkModAsNode(cur.options.info[1],mod_info);
	}
}

function checkAgeFunc(_this,_id,_day,_month){
  /*
  if(getSet(27)!='y'){
    alert(unescape('%u041D%u0443%u0436%u043D%u043E%20%u0432%u043A%u043B%u044E%u0447%u0438%u0442%u044C%20%u043A%u0430%u043B%u0435%u043D%u0434%u0430%u0440%u044C%21'));
    return;
  }*/
  var getAge=function(){
       var full_years=0;
       var _tmp=vk_cur.vk_calEvents[_month][_day];
       for(var i in _tmp){
         if(_tmp[i][0]==_id){
           if(_tmp[i][3]){
             var bDay = new Date(_tmp[i][3] * 1000);
             var nowDay = new Date();
             var curDay = new Date(nowDay.getFullYear(), _month-1, _day);
             if(bDay.getFullYear() != nowDay.getFullYear()){
               var years = Number(curDay.getFullYear() - bDay.getFullYear());
               if(nowDay.getMonth()<bDay.getMonth()){
                 full_years=years-1;
               }else if(nowDay.getMonth()==bDay.getMonth()){
                 if(nowDay.getDate()<bDay.getDate()){
                   full_years=years-1;
                 }else{
                   full_years=years;
                 }
               }else{
                 full_years=years;
               }
             }
           }
         }
       }
         
       if(full_years>0)
         ge('checkAge').innerHTML='<b>'+langNumeric(full_years, vk_lang["vk_year"])+'</b>';
       else
         ge('checkAge').innerHTML=IDL('AgeNA');  
  };
  
  if(vk_cur.vk_calEvents){
      getAge();
  }else{
      _this.innerHTML=vkLdrImg;
      vkGetCalendarInfo(function(month, year, events, holidays){
         if (!window.vk_cur) vk_cur={};
         vk_cur.vk_calEvents=events;
         getAge();
      });
    //setTimeout(function(){checkAgeFunc(_this,_id,_day,_month)},100);
  }
}


function vkProcessBirthday(day,month,year){
   var zodiac_cfg=[20,19,20,20,21,21,22,23,23,23,22,21];// days
   //'zodiac_signs':['Козерог','Водолей','Рыбы','Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец']
   var info=[];
   
   if (day && month && year){
      var date=new Date(year, month-1, day);
      var cur_date = new Date();  
      var bDay = new Date(cur_date.getFullYear(), date.getMonth(), date.getDate());
      var years = cur_date.getFullYear() - date.getFullYear() - (bDay > cur_date?1:0);
      info.push(langNumeric(years, vk_lang["vk_year"]));
   }
  
   if (day && month){
      var zodiacs=vk_lang['zodiac_signs'];
      var idx = day>zodiac_cfg[month-1]?(month) % 12:(month-1);
      
		var zodiac = zodiacs[idx];
      
      //30 nov - 17 dec - Змееносец
      if (ZODIAK_SIGN_OPHIUCHUS && zodiacs[12] && 
         ((month==11 && day>29) || (month==12 && day<18))){ 
         zodiac = zodiacs[12];
      }
      
      info.push(zodiac);
   }
   return info;
}

//javascript: vk_users.find_age(cur.oid,function(age){alert(age?langNumeric(age, vk_lang['vk_year']):'N/A')});
function vkBDYear(uid,el){
   var _el=ge(el);
   var a=geByTag('a',_el)[0];
   if (a && a.tt) a.tt.hide();
   addClass(_el,'fl_r');
   vk_users.find_age(uid,function(age){
      var txt=age?langNumeric(age, vk_lang["vk_year"]):'N/A';
      removeClass(_el,'fl_r');
      _el.innerHTML=txt;
   },{el:el,width:50});
   return false;
}
function vkProcessProfileBday(node){
   node = node ||  ge('profile_info');//"profile_full_info"
   
   var rmd=/c(?:%5B|\[)bday(?:%5D|\])=(\d+).+c(?:%5B|\[)bmonth(?:%5D|\])=(\d+)/;
   var ryr=/c(?:%5B|\[)byear(?:%5D|\])=(\d+)/;
   
   var h = node.innerHTML;
   var md=h.match(rmd); 
   var yr=h.match(ryr);
   var info=vkProcessBirthday(md?md[1]:null,md?md[2]:null,yr?yr[1]:null);
   
   if (info.length>0){
      if (!yr)
         info.push('<span id="%age_el"><a href="#" onmouseover="showTooltip(this,{center:true,className:\'vk_pr_tt\', text:\''+IDL('CalcAgeWarning')+'\'})" onclick="return vkBDYear('+cur.oid+',\'%age_el\');">'+langNumeric('?', vk_lang["vk_year"])+'</a></span>');
      info = ' ('+info.join(', ')+')';

      var links=node.getElementsByTagName('a');
      for (var i=0;i<links.length;i++){
         if (links[i].href && links[i].href.match(rmd)) 
            links[i].parentNode.appendChild(vkCe('span',{"class":"vk_bday_info"},info.replace(/%age_el/g,'vkage0')));
      }
      if (cur.options.info) {
         var r1 = /(c\[byear\]=[^>]+>[^<>]+<\/a>)/;
         r1 = cur.options.info[0].match(r1) ? r1 : /(c\[bmonth\]=[^>]+>[^<>]+<\/a>)/;
         cur.options.info[0] = cur.options.info[0].replace(r1, "$1" + info.replace(/%age_el/g,'vkage1'));
         cur.options.info[1] = cur.options.info[1].replace(r1, "$1" + info.replace(/%age_el/g,'vkage2'));
      }     
   }
}

function status_icq(node) { //add image-link 'check status in ICQ'
  var t,i,icq,skype=null;
  var labels=geByClass('label',node);
  for(i=0;i<labels.length;i++){
    if(!icq && labels[i].innerHTML=='ICQ:'){    icq=labels[i];   }
    if(!skype && labels[i].innerHTML=='Skype:'){    skype=labels[i];   }
    if (icq && skype) break; 
  }
    
  if(icq) {	
	var el=icq.parentNode.getElementsByTagName('div')[1];//geByClass('dataWrap')[a];
    t=el.innerHTML || '';
    t=t.replace(/\D+/g,'') || '';
    if(t.length)                                                                                                                                                   // http://kanicq.ru/invisible/favicon.ico
      el.innerHTML+=' <a href="http://kanicq.ru/invisible/'+t+'" title="'+IDL("CheckStatus")+'" target=new><img src="http://status.icq.com/online.gif?img=26&icq='+t+'&'+Math.floor(Math.random()*(100000))+'" alt="'+IDL("CheckStatus")+'"></a>';
  } 
  //*
  if(skype) {	
	var el=skype.parentNode.getElementsByTagName('div')[1];
    t=el.innerHTML || '';
    t=t.match(/skype\:(.+)\?call/) || '';
    if(t.length)                                                                                                                                                   // http://kanicq.ru/invisible/favicon.ico
      el.innerHTML+='<img style="margin-bottom:-3px" src=" http://mystatus.skype.com/smallicon/'+t[1]+'?'+Math.floor(Math.random()*(100000))+'">';
  } //*/
}
function vkAvkoNav(){
  avko_num = 0;
  if(!ge('profile_photo_link')) return;
  
  if (!window.avkoinj){
    Inj.After('profile.showProfilePhoto','wait_index = i;','avko_num=i;');
    avkoinj=true;
  }  
  
  var ref=ge('profile_photo_link');
  var div=document.createElement('div');
  div.setAttribute('style',"width:200px;height:0px;");
  ref.parentNode.insertBefore(div,ref);
  div.innerHTML='\
          <table width="200px" height="32px" class="NextButtAva ui-corner-bottom" style= "opacity: 0;" id="NextButtAva"><tr>\
                <td id="avko_prev" class="ui-corner-bl" onclick="avko_list(false);">&#9668;</td>\
                <td id="avko_zoom" class="zoom_ava" onclick="zoom_profile_photo(cur.options.photos,event); return false;">+</td>\
                <td id="avko_next" class="ui-corner-br" onclick="avko_list(true);">&#9658;</td>\
          </tr></table>';
 zoom_profile_photo=function(ops,event){
	if (ops && ops!=''){
		var p=ops[avko_num][1];
		var pid=p.match(/(\d+)_\d+/);
		var mid=pid[1];
		pid=pid[0];
		showPhoto(pid, 'album'+mid+'_0/rev', {big: 1}, event);
	} else {
		ge('profile_photo_link').onclick();
	}
 };
 avko_list=function (next){
	  if(next){
  		if(avko_num==cur.options.photos_count)avko_num=-1;
  		avko_num++;
  		profile.showProfilePhoto(avko_num);
	  }else{
  		if (avko_num==0) avko_num=cur.options.photos_count;
  		avko_num--;
  		profile.showProfilePhoto(avko_num);
	  }  
	}  
    ge('profile_avatar').setAttribute("onmouseover","fadeTo(ge('NextButtAva'),250,0.8);");
    ge('profile_avatar').setAttribute("onmouseout","fadeTo(ge('NextButtAva'),250,0);");
	disableSelectText('avko_next');
	disableSelectText('avko_prev');
}



function vkUpdWallBtn(){
	var el=ge('page_wall_posts_count');
	if (!el || ge('wall_upd_btn')) return;
	var span=document.createElement('span');
	span.innerHTML='<a href="#" id="wall_upd_btn" onclick="cancelEvent(event); wall.showMore(0); return false;"> &#8635;</a>';/*&uarr;&darr;*/
	insertAfter(span,el);
}


function vkAddCleanWallLink(){
	 if (getSet(77)!='y') return;
    var rx=nav.objLoc[0].match(/notes(\d+)/);
    var rw=nav.objLoc[0].match(/wall-?\d+_\d+/);
    var p_options = [];

    if (!rx){
      p_options.push({
         l:IDL('PhotoLinks'),
         onClick:function(item) { 
            vk_photos.scan_wall(cur.oid,(cur.wallType=="full_own"?true:false));
         } 
      });
    }
    //notes
   var allow_clean=(cur.oid==remixmid() || isGroupAdmin(cur.oid));
	if (allow_clean && !rw && !ge('vk_clean_wall') && ge('full_wall_filters')){
		
      var link='';
      if (rx && rx[1]==remixmid()){
         //link='<a href="#" onclick="vkCleanNotes(); return false;">'+IDL('DelAllNotes')+'</a>';
         p_options.push({
            l:IDL('DelAllNotes'),
            onClick:function(item) { 
               vkCleanNotes();
            } 
         });
         p_options.push({
            l:IDL('NoteNew'),
            onClick:function(item) { 
               vk_notes.add_new();
            } 
         });
         
         
      } else {
         //link='<a href="#" onclick="vkCleanWall('+cur.oid+'); return false;">'+IDL("wallClear")+'</a><span class="divide">|</span>';
         p_options.push({
            l:IDL('wallClear'),
            onClick:function(item) { 
               vkCleanWall(cur.oid);
            } 
         });         
      }
      /*
      var li=vkCe('li',{"class":'t_r', id:'vk_clean_wall'},'\
			'+link+'\
		');
		ge('full_wall_filters').appendChild(li);*/
	}
   
   
	if(allow_clean && cur.wallType=="one" && !ge('vk_clean_post_comments_wall')){
		var p=geByClass('reply_link_wrap')[0];
		var el=vkCe('small',{id:'vk_clean_post_comments_wall'},'\
			<span class="divide">|</span><a href="#" onclick="vkDelWallPostComments('+cur.oid+','+nav.objLoc[0].match(/_(\d+)/)[1]+'); return false;">'+IDL("DelAllComments")+'</a>\
		');
		p.appendChild(el);
	}
   
   //p_options=p_options.concat(vk_plugins.wall_actions(cur.oid,cur.wallType));
   
   if (ge('full_wall_filters')){
      if (!ge('vk_wall_act_cont')){
         ge('full_wall_filters').appendChild(vkCe('li',{"class":'t_r', id:'vk_wall_act_cont'},'<a href="#" id="vk_wall_act_menu">'+IDL('Actions')+'</a><span class="divide"> </span>'));
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            cur.vkFullWallMenu = new DropdownMenu(p_options, {
              target: ge('vk_wall_act_menu'),
              containerClass: 'dd_menu_posts',
              updateHeader:false,
              offsetLeft:-15,
              showHover:false
            });
         });
      } else {
         if (cur.vkFullWallMenu)
            cur.vkFullWallMenu.setData(p_options);
      }
   }
}

function vkAddDelWallCommentsLink(node){
	if (getSet(77)!='y') return;
   var allow_clean=(cur.oid==remixmid()  || isGroupAdmin(cur.oid));
	if(allow_clean && (cur.wallType=="full_all"  || cur.wallType=="full_own") && !ge('vk_clean_post_comments_wall')){
		var p=geByClass('reply_link_wrap',node);
		for (var i=0;i<p.length;i++){
			var h=p[i].innerHTML;
			if (h.indexOf('showEditReply')!=-1 || h.indexOf('vkDelWallPostComments')!=-1) continue;
			var pid=h.match(/wall-?\d+_(\d+)/);
			if (pid) pid=pid[1];
			else continue;
			var el=vkCe('small',{"class":'vk_del_comments'},'\
				<span class="divide">|</span><a href="#" onclick="vkDelWallPostComments('+cur.oid+','+pid+'); return false;">'+IDL("DelAllComments")+'</a>\
			');
			p[i].appendChild(el);
		}
	}
}
/*

*/
function vkDelWallPostComments(oid,pid){
	var REQ_CNT=100;
	var WALL_DEL_REQ_DELAY=400;
	var box=null;
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
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %');
		var pid=mids[del_offset];
		if (!pid){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		dApi.call('wall.deleteComment', {owner_id:oid,cid:pid},function(r,t){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %');
		}
		dApi.call('wall.getComments',{owner_id:oid, post_id:pid, count:100, offset:cur_offset},function(r){
			if (abort) return;
			var ms=r.response;
			if (ms==0 || !ms[1]){
				deldone();
				return;
			}
			if (msg_count==0) msg_count=ms.shift();
			else ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].cid);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(scan,MSG_SCAN_REQ_DELAY);
			
		});
	};
	var run=function(){
		box=new MessageBox({title: IDL('DelComments'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
	vkAlertBox(IDL('DelComments'),IDL('DelAllCommentsConfirm'),run,true);
}

function vkCleanWall(oid){
	var REQ_CNT=100;
	var WALL_DEL_REQ_DELAY=400;
	oid=oid?oid:0;
	var start_offset=0;
	var box=null;
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
		ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('msgdel')+' %');
		var pid=mids[del_offset];
		if (!pid){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			del_offset=0;
			callback();
		} else
		dApi.call('wall.delete', {owner_id:oid, post_id:pid},function(r,t){
			del_offset++;
			setTimeout(function(){del(callback);},WALL_DEL_REQ_DELAY);
		});
	};
	var msg_count=0;
	var scan=function(){
		mids=[];
		if (cur_offset==0){
			ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('msgreq')+' %');
		}
		dApi.call('wall.get',{owner_id:oid,filter:filter[2],count:REQ_CNT,offset:0+start_offset},function(r){
			if (abort) return;
			var ms=r.response;
			if (ms==0 || !ms[1]){
				deldone();
				return;
			}
			if (msg_count==0) msg_count=ms.shift();
			else ms.shift();
			ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset+REQ_CNT,msg_count,310,IDL('msgreq')+' %');
			for (var i=0;i<ms.length;i++) mids.push(ms[i].id);
			cur_offset+=REQ_CNT;
			vklog(mids);
			del(scan);
			//setTimeout(scan,MSG_SCAN_REQ_DELAY);
			
		});
	};
	vkRunCleanWall=function(soffset){
		abox.hide();
		start_offset=soffset?soffset:0;
		box=new MessageBox({title: IDL('ClearWall'),closeButton:true,width:"350px"});
		box.removeButtons();
		box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
		var html='<div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
		box.content(html).show();	
		scan();
	};
	/*
		html=IDL('ClearBegin')+'<br>\
		<a href="#" onclick="vkStartClearWall(0);  return false;">- '+IDL('FromFirstPage')+'</a><br>\
		<a href="#" onclick="vkStartClearWall(20); return false;">- '+IDL('FromSecondPage')+'</a>\
		';
	*/
	var html=IDL('ClearBegin')+'<br><b>\
			<a href="#" onclick="vkRunCleanWall(0);  return false;">- '+IDL('FromFirstPage')+'</a><br>\
			<a href="#" onclick="vkRunCleanWall(20); return false;">- '+IDL('FromSecondPage')+'</a><br>'+
         (cur.pgPage?'<a href="#" onclick="vkRunCleanWall('+cur.pgPage*20+'); return false;">- '+IDL('FromPage')+' <b>'+(cur.pgPage+1) +'</b></a>':'')+'\
		</b>\
		';
	var abox=vkAlertBox(IDL('ClearWall'),html);
	//vkAlertBox(IDL('ClearWall'),IDL('CleanWallConfirm'),vkRunCleanWall,true);
}
    
function vkFaveProfileBlock(is_list){
   var is_right_block = (getSet(57)=='y');
   if (!ge('profile_fave')){
      var html='\
        <a href="/fave" onclick="return nav.go(this, event)" class="module_header"><div class="header_top clear_fix">'+IDL('FaveOnline')+'</div></a>\
        <div class="module_header">\
          <div class="p_header_bottom">\
            <a href="javascript:vkFaveProfileBlock(true)" id="vk_fave_all_link">'+ vkopt_brackets(IDL('FaveOnline') +' ( -- )')+'</a>\
            <span class="fl_r"><a href="/fave" onclick="return nav.go(this, event)">'+IDL('all')+'</a></span>\
          </div>\
        </div>\
        <div class="module_body clear_fix" id="vk_fave_users_content"></div>\
      ';
      //html=html.replace('%USERS%',users);
      var div=vkCe('div',{"class":"module clear people_module",id:"profile_fave"});
      div.innerHTML=html;
      var p=ge(is_right_block?'profile_wall':'profile_friends');
      p.parentNode.insertBefore(div,p);  
   }
   ge('vk_fave_users_content').innerHTML=vkBigLdrImg;
   if (is_list){
      ge("vk_fave_all_link").href="javascript:vkFaveProfileBlock()";
   } else {
      ge("vk_fave_all_link").href="javascript:vkFaveProfileBlock(true)";
   }
   AjGet('/fave?section=users&al=1',function(r,t){
      var r=t.match(/"faveUsers"\s*:\s*(\[[^\]]+\])/);
      if (r){
         r=eval('('+r[1]+')');
         var onlines=[];
         for(var i=0;i<r.length;i++) if(r[i].online) onlines.push(r[i]);
         var to=3;
         var count=is_list?onlines.length:Math.min(onlines.length,FAVE_ONLINE_BLOCK_SHOW_COUNT);
         var users='';
         for (var i = 0; i < count; i++) {
            if (!is_list){
            var n1=onlines[i].name.split(' ')[0] || '';
            var n2=onlines[i].name.split(' ')[1] || '';
            users += ((i == 0 || i % to == 0) ? '<div class="people_row">' : '') + 
                     '<div class="fl_l people_cell">\
                       <a href="/id'+onlines[i].id+'" onclick="return nav.go(this, event)">\
                         <img width="50" height="50" src="'+onlines[i].photo+'">\
                       </a>\
                       <div class="name_field">\
                         <a href="/id'+onlines[i].id+'" onclick="return nav.go(this, event)">\
                           '+n1+'<br><small>'+n2+'</small>\
                         </a>\
                       </div>\
                     </div>'+
                  ((i > 0 && (i + 1) % to == 0) ? '</div>' : '');
            } else {
               users +='<div align="left" style="margin-left: 10px; width:180px;">&#x25AA;&nbsp;\
                  <a href="write'+onlines[i].id+'" onclick="return showWriteMessageBox(event, '+onlines[i].id+')" target="_blank">@</a>&nbsp;\
                  <a href="id'+onlines[i].id+'" '+(vkIsFavUser(onlines[i].id)?'class="vk_faved_user"':'')+'>'+onlines[i].name+'</a>\
                  </div>';
            }
         }
         if (ge('vk_fave_users_content')){
            ge("vk_fave_all_link").innerHTML=vkopt_brackets(IDL('FaveOnline') +' ('+onlines.length+')');
            ge('vk_fave_users_content').innerHTML=users;
            vkProcessNodeLite(ge('vk_fave_users_content'));
         }
      }
   });
}

function vkProfileMoveAudioBlock(){
   var e=ge("profile_audios");
   var p=ge('profile_wall');
   if (e && p)  p.parentNode.insertBefore(e,p);  
}
//*
function vkProfileGroupBlock(){
   var is_right_block = false;//(getSet(57)=='y');
   if (ge('profile_groups')) re(ge('profile_groups'));
   if (!ge('profile_groups')){
      var html='\
        <a href="/groups?id='+cur.oid+'" onclick="return nav.go(this, event)" class="module_header"><div class="header_top clear_fix">'+IDL('clGr')+'<span id="vk_group_block_count"></span></div></a>\
        <div class="module_header">\
          <div class="p_header_bottom">\
            <a href="/groups?id='+cur.oid+'" onclick="return nav.go(this, event)"> </a>\
            <span class=""><a href="/groups?id='+cur.oid+'" onclick="return nav.go(this, event)">'+IDL('all')+'</a></span>\
          </div>\
        </div>\
        <div class="module_body clear_fix" id="vk_group_block_content"></div>\
      ';
      //html=html.replace('%USERS%',users);
      var div=vkCe('div',{"class":"module clear groups_list_module",id:"profile_groups"});
      div.innerHTML=html;
      var p=ge(is_right_block?'profile_wall':'profile_friends');
      if (is_right_block)
         p.parentNode.insertBefore(div,ge('profile_wall'));  
      else
         ge('profile_narrow').appendChild(div);
      
   }
   ge('vk_group_block_content').innerHTML=vkBigLdrImg;
   AjPost('al_groups.php',{act: 'get_list', mid: cur.oid,tab:'groups',al:1},function(r,t){
      var data=t.split('<!json>');
      if (!data[1]){
            ge('vk_group_block_content').innerHTML=IDL('NA');
            hide('profile_groups');
            return;      
      }
      data=eval(data[1]);
      var count=data.length;
      ge('vk_group_block_count').innerHTML=' ('+count+')';
      var html='';
      for (var i=0; i<data.length;i++)
         if (data[i][0]) html+='<a onclick="return nav.go(this, event)" href="'+data[i][3]+'">'+data[i][0]+' </a>';
      
      ge('vk_group_block_content').innerHTML=html;
      vk_highlinghts.groups_block();
      vkProcessNode(ge('vk_group_block_content'));     
   });
}//*/

function vkFrProfile(){
  var EnableShut = (getSet(53)=='y');
  var els=geByClass('module_header');
  var shuts_mask=parseInt(vkgetCookie('remixbit',1).split('-')[12]);
  var c=ge('profile_full_link') ? ge('profile_full_link') : geByClass('profile_info_link')[0];
  if (c){
    c.setAttribute('title', c.getAttribute('onclick'));
    c.id='profile_full_link';
    c.setAttribute('onclick','shut("profile_full_info");');
  }
  var c2 = geByClass('page_list_module')[0];
  if (c2) c2.id="page_list_module";
  
  //els=vkArr2Arr(els);
  var mod=function(el,postfix){
    if (postfix=='online' && el.parentNode.id=='profile_friends') el.parentNode.id='profile_friends_online';
    vkNextEl(el).id='friends_profile_'+postfix;
    var hdr=geByClass('p_header_bottom',el)[0];
	if (!hdr) return;
	var rlink=geByClass('right_link',el)[0];
	if (rlink) rlink.setAttribute('onclick',"return nav.go(this.parentNode.parentNode, event)");
    var all=hdr.getElementsByTagName('span')[0];
    hdr.innerHTML='<a href="javascript:vkFriends_get(\''+postfix+'\')" id="Fr'+postfix+'Lnk">'+vkopt_brackets(hdr.innerHTML)+'</a>';
    if (all) {
       all.innerHTML='<a href="'+el.href+'" onclick="'+el.getAttribute('onclick')+'">'+all.innerHTML+'</a>';//return nav.go(this, event)
       var div=document.createElement('div');
       div.className='module_header';
       div.appendChild(all);
       hdr.appendChild(all);
    }

    div.appendChild(hdr);
    insertAfter(div,el);
  };
  
  
  var mod_lite=function(el,postfix){
    var hdr=geByClass('p_header_bottom',el)[0];
    if (!hdr) return;
	var rlink=geByClass('right_link',el)[0];
	if (rlink) rlink.setAttribute('onclick',"return nav.go(this.parentNode.parentNode, event)");
    var all=hdr.getElementsByTagName('span')[0];
    if (all) {
       all.innerHTML='<a href="'+el.href+'"  onclick="'+el.getAttribute('onclick')+'">'+all.innerHTML+'</a>';
       var div=document.createElement('div');
       div.className='module_header';
       div.appendChild(all);
       hdr.appendChild(all);
    }
    //hdr.innerHTML='<a href="javascript:vkFriends_get(\''+postfix+'\')" id="Fr'+postfix+'Lnk">[ '+hdr.innerHTML+' ]</a>';
    div.appendChild(hdr);
    insertAfter(div,el);
  };
  var fr_match={
  'online':'section=online',
  'all':/friends(\?|$)(?!section).*/,
  'common':'section=common'
  };
  var mod_el={
    'profile_albums':function(el){
        var _el=geByClass('module_body',el)[0];
        _el.innerHTML='<div align="center"><a href="/photos'+cur.oid+'" onclick="return nav.go(this, event);">'+vkopt_brackets(IDL("obzor"))+'</a> <a href="/photos'+cur.oid+'?act=comments"  onclick="return nav.go(this, event);">'+vkopt_brackets(IDL("komm"))+'</a></div>'+_el.innerHTML;
        var hdr=geByClass('p_header_bottom',el)[0];
        if (!hdr) return;
        hdr.innerHTML='<a href="javascript:vk_photos.profile_albums_list()">'+vkopt_brackets(hdr.innerHTML)+'</a>';
      }
  };
  for (var i=0; i<els.length;i++)
    if (els[i].href || els[i].parentNode.id=='profile_wall'){
      var mod_l=false;
      var key=els[i].parentNode.id;
      if (key!='profile_wall'){
         for (var key in fr_match){
             if (els[i].href.match(fr_match[key])) {mod_l=true; mod(els[i],key);}  
         }
         if (!mod_l) mod_lite(els[i]);
         var key=els[i].parentNode.id;
         if (mod_el[key]) mod_el[key](els[i].parentNode);
      }
      
      if (key && vk_shuts_mask[key] && EnableShut){
        var s=vkCe('span',{"class":'fl_l',"onclick":'cancelEvent(event); return shut("'+key+'");'},'<span class="vk_shut_btn"></span>');
        var p=geByClass('header_top',els[i])[0];
        if (p)  p.insertBefore(s,p.firstChild); 
        addClass(key,'shut_open');
        addClass(els[i],'shutable');
        /*
        els[i].setAttribute("onclick",'return shut("'+key+'");');
        
        addClass(key,'shut_open');
        */
        if (shuts_mask & vk_shuts_mask[key]){	shut(key);	}
      }    
    }
  switch (parseInt(getSet(41))){
    case 1:
        if (shuts_mask & vk_shuts_prof) shut('profile_full_info','0');
        else shut('profile_full_info','1');
        break;
    case 2:
        shut('profile_full_info','1');
        break; 
    case 3:
        shut('profile_full_info','0');
        break; 
  }
}
function vkFriends_get(idx){
//if (1) shut('profile_friends_'+idx);
  var count_el=ge('Fr'+idx+'Lnk');
  if (!count_el) return;
  if (getSet(46) == 'n' && idx=='online') {
    clearTimeout(window.IDFrOnlineTO);
	var tout=getSet('-',5);
    IDFriendTime=(tout?tout:1)*60000;
	if (!IDFriendTime) {
		topMsg('Please, check <a href="/settings?act=vkopt">VkOpt settings</a>');
		return;
	}
    IDFrOnlineTO = setTimeout("vkFriends_get('"+idx+"');", IDFriendTime);
  }
  //vkStatus('[Friends '+idx+' Loading]');
  //alert(idx);
  var methods={
	'online':'friends.getOnline',
	'all':'friends.get',
	'common':'friends.getMutual'
  };
  code='var a=API.'+methods[idx]+'({uid:'+cur.oid+',target_uid:'+cur.oid+'});'+
  'var r=API.getProfiles({"uids":a,fields:"uid,first_name,last_name"});'+
  'return r;'
  dApi.call('execute',{code:code},function(r){
  //dApi.call(methods[idx],{uid:cur.oid,target_uid:cur.oid,fields:'first_name,last_name'},function(r){
  //AjPost('friends.php',{id:cur.oid,filter:idx,qty:'60'},function(r,t){
    //var res=eval('('+t+')');
    var fr=r.response;
    count_el.innerHTML=count_el.innerHTML.replace(/\d+/,fr.length);
    
    var html='';
    fr=vkSortFrList(fr);
    for (var i=0; i<fr.length;i++)
    html+='<div align="left" style="margin-left: 10px; width:180px;">&#x25AA;&nbsp;\
			<a href="write'+fr[i].uid+'" onclick="return showWriteMessageBox(event, '+fr[i].uid+')" target="_blank">@</a>&nbsp;\
			<a href="id'+fr[i].uid+'" '+(vkIsFavUser(fr[i].uid)?'class="vk_faved_user"':'')+'>'+fr[i].full_name+'</a>\
		   </div>';
    if (fr.length==0) html+='<div align="left" style="margin-left: 10px; width:180px;"><strike>&#x25AA;&nbsp;Nobody&nbsp;OnLine</strike></div>';
    ge('friends_profile_'+idx).innerHTML=html;
	vkProcessNodeLite(ge('friends_profile_'+idx));
    //vkStatus('');
    //if (getSet(17) == 'y' || getSet(17) > 0) best(idx);
    
    });
}

function vkSortFrList(arr){
  var bit=getSet(45);    //1 - name //2 - lname   //3 - none 
  for (var i=0;i<arr.length;i++)
	if (bit==2) arr[i].full_name=arr[i].last_name+' '+arr[i].first_name;
	else  arr[i].full_name=arr[i].first_name+' '+arr[i].last_name;
  var fave={};
  //*
  if (vkGetVal('FavList')){
    var fl=vkGetVal('FavList').split('-');
    for (var i=0;i<fl.length;i++) fave[fl[i]]=true;   
  }
  //*/
  var SortFunc=function(a,b){
    if (bit==3) return 0;
    if ( fave[a.uid] && !fave[b.uid]) return -1; 
    if (!fave[a.uid] &&  fave[b.uid]) return 1; 
    if(a.full_name<b.full_name)     return -1;
    if(a.full_name>b.full_name)     return 1;
    return 0
  }  
  arr.sort(SortFunc); 
  return arr;
}
/////////////////////for shut
// Profile tabs
var vk_shuts_mask = {
  'profile_common_friends': 0x1,
  'profile_friends'       : 0x2,
  'profile_friends_online': 0x4,
  'profile_albums'        : 0x8,
  'profile_videos'        : 0x10,
  'profile_questions'     : 0x20,
  'profile_matches'       : 0x40,
  'profile_notes'         : 0x80,
  'profile_groups'        : 0x100,
  'profile_apps'          : 0x200,
  'profile_personal'      : 0x400,
  'profile_education'     : 0x800,
  'profile_career'        : 0x1000,
  'profile_places'        : 0x2000,
  'profile_military'      : 0x4000,
  'profile_opinions'      : 0x8000,
  'profile_audios'        : 0x10000,
  'page_list_module'      : 0x20000,
  'profile_fave'          : 0x40000,
  'profile_optional'      : 0x80000,
  'profile_fans'          : 0x100000,
  'profile_idols'         : 0x200000,
  'profile_infos'         : 0x400000,
  'profile_wall'          : 0x800000,
  'profile_photos_module' : 0x1000000,
  'profile_gifts'         : 0x2000000,
  'profile_favefr'        : 0x4000000
}
var vk_shuts_prof=0x400000;

function shut(id,el) {
  var c = ge(id);
  if (!c) return true;
  var masks = vk_shuts_mask;
  var cookie_key = 'closed_tabs';
  var closed_tabs = parseInt(vkgetCookie('remixbit',1).split('-')[12]);
if (id!='profile_full_info') {
var newClass = hasClass(c,"shut") ? removeClass(c,"shut") : addClass(c,"shut");
if (!masks[id]) return;
} else {
	if (!el) el=3;
	masks={'profile_full_info':vk_shuts_prof};
	if ((el==3 && ge('profile_full_link').getAttribute('title').match('hid'))	 || el==0){ 
     addClass(c,"shut"); profile.hideFull();
	   if (ge('profile_full_link') == null) geByClass('profile_info_link')[0].id='profile_full_link';
	   ge('profile_full_link').setAttribute('title','show');
  }	else { 
     removeClass(c,"shut"); profile.showFull(cur.oid);
	   if (ge('profile_full_link') == null) geByClass('profile_info_link')[0].id='profile_full_link';
	   ge('profile_full_link').setAttribute('title','hide');
  }
  ge('profile_full_link').setAttribute('onclick','shut(\'profile_full_info\');');
}
    if (!hasClass(c,"shut")) closed_tabs = isNaN(closed_tabs) ? 0 : closed_tabs & ~masks[id];
    else closed_tabs = isNaN(closed_tabs) ? masks[id] : closed_tabs | masks[id];
	sett=vkgetCookie('remixbit',1).split('-');
	sett[12]=closed_tabs;
	vksetCookie('remixbit', sett.join('-'));
    //c.className = newClass;

  return false;
}
/* END OF SHUT */

/////////// GRAFFITY /////////////

vk_graff={
   upload_box:function(mid){
      mid = mid || cur.oid;
      AjPost('/al_wall.php',{act:'canvas_draw_box',al:1,flash:11,to_id:mid},function(r,t){
         var url=t.match(/action="([^"]+)"/);
         if (!url){
            alert('Parse upload url error');
            return;
         }
         url=url[1];
         var html='<iframe src="about:blank" name="graff_upload_frame" width=0 height=0 style="display:none;"></iframe>\
               <form id="fakeupload" name="upload" action="'+url+'" method="POST" enctype="multipart/form-data" target="graff_upload_frame"><center>\
               <span class="label">'+IDL('GraffitiFile')+'</span><br>\
               <input type="file" style="width:280px;" size="22" id="file2" name="photo">\
               </center></form>';
         var Box = new MessageBox({title: IDL('LoadFakeGraffiti')});
         Box.removeButtons();
         Box.addButton(getLang('box_cancel'), function(){Box.hide(200);Box.content("");},'no');
         Box.addButton(getLang('box_send'), vk_graff.start_upload,'yes');         
         Box.content(html).show(); 
      
      });
   },
   start_upload:function(){
      cur.graffitiSaved = function(photoRaw, mediaData) {
         cur.chooseMedia('photo', photoRaw, mediaData, false, false, true);
         //cur.chooseMedia('graffiti', media, thumb);
      }
      document.getElementById('fakeupload').submit();
   },
   upload_graff_item:function(){
      var AddGraffItem=function(bef){
         var mid=ge('mid')?ge('mid').value:(window.cur && cur.oid?cur.oid:0);
         if (bef && mid){
            bef=bef.getElementsByTagName('a')[0];
            var a=document.createElement('a');
            a.setAttribute("onfocus","this.blur()");
            a.setAttribute("class"," add_media_item");
            a.setAttribute("id","vk_wall_post_type0");
            a.setAttribute("style","background-image: url(/images/icons/attach_icons.gif); background-position: 3px -151px");
            a.setAttribute("href","#");
            a.setAttribute("onclick","vk_graff.upload_box("+mid+");return false;");
            a.innerHTML=IDL('LoadGraffiti');
            bef.parentNode.insertBefore(a,bef.nextSibling);
         }
      }

      if (ge('vk_wall_post_type0')) return;
      var vk__addMediaIndex=0;
      if (window.__addMediaIndex) vk__addMediaIndex=__addMediaIndex;
      var lnkId = ++vk__addMediaIndex;
      if (ge('page_add_media')){
         Inj.Wait("geByClass('add_media_rows')[0]",AddGraffItem,300,10);
      }   
   }
}


function vkWallAddPreventHideCB(){
   Inj.Wait('cur.wallAddMedia',function(){
      var p=geByClass('rows', cur.wallAddMedia.menu.menuNode)[0];
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
      var id='add_media_type_' +  cur.wallAddMedia.menu.id + '_nohide';
      if (!ge(id)){
         var a=vkCe('a',{id:id,'style':'border-top:1px solid #DDD; padding:2px; padding-top:4px;'},html);
         p.appendChild(a);
      }
      Inj.Replace('cur.wallAddMedia.chooseMedia',/addMedia/g,'cur.wallAddMedia');
      Inj.Before('cur.wallAddMedia.chooseMedia','boxQueue','if (!window.vk_prevent_addmedia_hide)');
   });
}


function vkModGroupBlocks(){
   var el=ge('group_albums');// || ge('public_albums');
   if (el && !ge('gr_photo_browse')){
      el=geByClass('p_header_bottom',el)[0];
      var a=vkCe('a',{id:'gr_photo_browse', href:'/photos'+cur.oid, onclick:"event.cancelBubble = true; return nav.go(this, event)"},IDL("obzor",1));
      el.appendChild(a);
      //el.innerHTML+='<a href="/photos'+cur.oid+'" onmousedown="event.cancelBubble = true;" onclick="event.cancelBubble = true; return nav.go(this, event);">[ '+IDL("obzor")+' ]</a>';
   }
}
function vkAudioBlock(load_audios,oid){
   if (ge('group_audios')) return; 
   oid = oid || cur.oid;
   var mini_tpl='<a href="/audio?id='+cur.oid+'" onclick="return nav.go(this, event);" class="module_header"><div class="header_top clear_fix">'+
                     IDL('clAu',1)+
                  '</div></a>';
   var block_tpl='\
     <a href="/audio?id='+cur.oid+'" onclick="return nav.go(this, event);" class="module_header">\
     <div class="header_top clear_fix">'+IDL('clAu',1)+'</div>\
     </a>\
     <div class="p_header_bottom">\
       <!--<span class="fl_r" >'+IDL('all')+'</span>-->\
       <span id="vk_audio_count">---</span>\
     </div>\
     <div class="module_body clear_fix" id="vk_audio_content" ></div>';
   
   var audio_tpl='<div class="audio" id="audio%AID%">\
     <table cellspacing="0" cellpadding="0" width="100%">\
       <tr>\
         <td>\
           <a onclick="playAudioNew(\'%AID%\')"><div class="play_new" id="play%AID%"></div></a>\
           <input type="hidden" id="audio_info%AID%" value="%URL%,%DURATION%" />\
         </td>\
         <td class="info">\
           <div class="duration fl_r">%DURATIONTEXT%</div>\
           <div class="audio_title_wrap fl_l"><b><a href="/search?c[section]=audio&c[q]=%ARTIST%" onclick="return nav.go(this, event);">%ARTIST%</a></b> - <span id="title%AID%">%TITLE%</span></div>\
         </td>\
       </tr>\
     </table>\
     <div class="player_wrap">\
       <div id="line%AID%" class="playline"><div></div></div>\
       <div id="player%AID%" class="player" ondragstart="return false;" onselectstart="return false;">\
         <table width="100%" border="0" cellpadding="0" cellspacing="0">\
           <tr valign="top" id="audio_tr%AID%">\
             <td style="width:100%;padding:0px;position:relative;">\
               <div id="audio_white_line%AID%" class="audio_white_line" onmousedown="audioPlayer.prClick(event);"></div>\
               <div id="audio_load_line%AID%" class="audio_load_line" onmousedown="audioPlayer.prClick(event);"></div>\
               <div id="audio_progress_line%AID%" class="audio_progress_line" onmousedown="audioPlayer.prClick(event);">\
                 <div id="audio_pr_slider%AID%" class="audio_pr_slider"></div>\
               </div>\
             </td>\
             <td id="audio_vol%AID%" style="position: relative;"></td>\
           </tr>\
         </table>\
       </div>\
     </div>\
   </div>';
   
   var p=ge('group_photos') || ge('group_wide_topics');
   if (p && !ge('vk_group_audios')){
      var div=vkCe('div',{"class":"module clear audios_module",id:"vk_group_audios", style:"margin-bottom:3px;"},mini_tpl);//block_tpl
      insertAfter(div,p);
      geByClass('header_top',div)[0].innerHTML+='<a class="fl_r right_link"  href="#" onclick="cancelEvent(event); vkAudioBlock(true); return false;">'+IDL('GetAudiosList')+'</a>';
      //addClass(div,'empty');
      //ge('vk_audio_content').innerHTML='<a href="#" onclick="vkAudioBlock(true); return false;">'+IDL('GetAudiosList')+'</a>';
   }
   
   if (!load_audios) return;
   ge('vk_group_audios').innerHTML=block_tpl;
   var div=ge('vk_group_audios');
   addClass(div,'empty');
   ge('vk_audio_content').innerHTML=vkBigLdrImg;   
	var params={}; 
	params[cur.oid>0?"uid":"gid"]=Math.abs(cur.oid);
   var is_vkcom=(document.location.href.indexOf('vk.com')!=-1);
	dApi.call('audio.get',params,function(r){
		var html='';
		var list=r.response;
		for (var i=0;i<list.length;i++){
			var itm=list[i];
			var aid=cur.oid+'_'+itm.aid+'_'+irand(0,10);
         dur=(new Date(itm.duration*1000)).format('MM:ss');
         html+=audio_tpl.replace(/%AID%/g,aid)
                        .replace(/%ARTIST%/g,itm.artist)
                        .replace(/%TITLE%/g,itm.title)
                        .replace(/%DURATION%/g,itm.duration)
                        .replace(/%DURATIONTEXT%/g,dur)
                        .replace(/%URL%/g,(is_vkcom?itm.url.replace('vkontakte.ru','vk.com'):itm.url));
		}
      
      removeClass(div,'empty');
      ge('vk_audio_count').innerHTML=list.length;
      ge('vk_audio_content').innerHTML=html;
      vk_audio.process_node(div);
	});
   /*
   // AUDIO
   %AID% = cur.oid+'_'+aid+'_'+random(10);
   %ARTIST%
   %TITLE%
   %DURATIONTEXT%
   %DURATION%
   %URL%
   */
}


function vkWikiPages(){
   var p=(ge('pages_right_link') || {}).parentNode
   var class_name='fl_r pages_right_link';
   var gid=Math.abs(cur.gid || cur.oid || nav.objLoc['oid'] || nav.objLoc['gid']);
   var pid=cur.pid || nav.objLoc['p'];
   if (p){
      if (p && !ge('vk_add_wiki_page')){
         p.appendChild(
            vkCe('a',{
               "class":class_name,
               "id":"vk_add_wiki_page",
               "href":"#",
               "onclick":"vkWikiNew(); return false;"
            },IDL('Add')+'<span class="divide">|</span>')
         );
         p.appendChild(
            vkCe('a',{
               "class":class_name,
               "id":"vk_add_wiki_page",
               "href":"#",
               "onclick":"vkGetWikiCode('"+pid+"','"+gid+"'); return false;"
            },IDL('Code')+'<span class="divide">|</span>')
         );
      }   
   } else {
      var end=true;
      if (geByClass('pages_header')[0] && !geByClass('pages_actions')[0]){
         geByClass('pages_header')[0].appendChild(se('<span class="pages_actions fl_r"> </span>'));
         end=false;
      }
      
      p=geByClass('pages_actions')[0];
      class_name='';
      
      if (p && !ge('vk_add_wiki_page')){
         p.insertBefore(
            vkCe('a',{
               "class":class_name,
               "id":"vk_add_wiki_page",
               "href":"#",
               "onclick":"vkWikiNew(); return false;"
            },IDL('Add')+(end?'<span class="divide">|</span>':'')),
            p.firstChild
         );
         p.insertBefore(
            vkCe('a',{
               "class":class_name,
               "id":"vk_add_wiki_page",
               "href":"#",
               "onclick":"vkGetWikiCode('"+pid+"','"+gid+"'); return false;"
            },IDL('Code')+'<span class="divide">|</span>'),
            p.firstChild
         );
      }   

   }

}
function vkWikiNew(){
   var title=prompt(IDL("Title"));
   if (title)
      nav.go("pages?act=edit&oid="+cur.oid+"&p="+encodeURIComponent(title));
}

// Фунция сохранения всех документов (или только гифок)
function vkDocsDownloadAll(_oid, tpl, onlyGifs){
	// Как выяснилось, функция endsWith есть не во всех браузерах...
	if (typeof String.prototype.endsWith !== 'function') {
		String.prototype.endsWith = function(suffix) {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		};
	}
	vkDocsLinks=[];
	vkDocsListCount = 0;							// Количество обработанных объектов, увеличивается функцией vkDocsGenList
	document.body.style.cursor = 'wait';			// Меняем картинку курсора на "ожидающую"
	var DOCS_DOWNLOAD_LIMIT = 2000;					// Сколько максимум документов может вернуть ВК
	dApi.call('docs.get',{oid: _oid, count: DOCS_DOWNLOAD_LIMIT},function(r){	// Получение списка всех документов владельца _oid
		if (!r.error && r.response[0]>0){			// Если у владельца есть документы и они доступны
			vkDocsGenList(r.response, tpl, onlyGifs);	// Генерация списка ссылок на документы
			if (r.response[0]>DOCS_DOWNLOAD_LIMIT)	// Если документов больше лимита, то вызываем дополнительно API
				for (var _offset=DOCS_DOWNLOAD_LIMIT;_offset<r.response[0];_offset+=DOCS_DOWNLOAD_LIMIT)
					dApi.call('docs.get',{oid: _oid, offset: _offset, count: DOCS_DOWNLOAD_LIMIT},function(r2){
						vkDocsGenList(r2.response, tpl, onlyGifs);
					});
		}
    });
}

function vkDocsGenList(data, tpl, onlyGifs){ // data - массив объектов "документ" (0-й элемент - общее количество, сколько есть у владельца)
	var length = data.length;		// Сколько фактически вернулось документов
	for (var i=1;i < length;i++) {	// формирование кода страницы. не-картинки отображатьсяне не будут, но все равно загрузятся.
		var item = data[i];
		if (!onlyGifs || data[i].ext=="gif") // Если загружаем только гифки, то проверяем расширение файла
			vkDocsLinks.push({url: item.url, filename: item.title+(item.title.endsWith(item.ext) ? '' : '.'+item.ext)});
		vkDocsListCount++;	// увеличить количество уже обработанных документов.
	}
	if (vkDocsListCount == data[0] || length == 1) vkDocsShowBox(tpl);	// Условие окончания генерации vkDocsList
}

function vkDocsShowBox(tpl) {	// создание таблички со сылкой на сгенерированную страницу либо списки ссылок
	document.body.style.cursor = '';	// Возвращаем картинку курсора

	switch (tpl) {
		case 'imgs':
			vkDocsList='<div style="background:#FFB; border:1px solid #AA0;  margin:20px; padding:20px;">'+IDL('HtmlPageSaveHelp')+'</div>';
			for (var i in vkDocsLinks) {
				vkDocsList += '<img src="'+vkDocsLinks[i].url+'" />';
			}
			var box = new MessageBox({title: IDL('SavingDocuments'), width: "350px"});
			box.removeButtons();
			box.addButton(box_close, box.hide, 'no');
			var html = '<h4><a href="#" onclick="vkWnd(vkDocsList,\'' + document.title.replace(/['"]+/g, "") + '\'); return false;">' + IDL('ClickForShowPage') + '</a></h4>';
			box.content(html).show();
			break;
		case 'links':
			vkaddcss('.vk_docs_links_area {width:520px; height:350px;}');
			var links = '', wget_links = '';
			for (var i in vkDocsLinks) {
				var item = vkDocsLinks[i];
				links+=item.url+'&/'+vkEncodeFileName(vkCleanFileName(item.filename))+'\n';
				wget_links+='wget "'+item.url+'" -O "'+winToUtf(item.filename).replace(/"/g,'\\"')+'"\n';
			}
			var links_html='<textarea class="vk_docs_links_area">'+links+'</textarea>\
					   <a download="DocumentsLinks.txt" href="data:text/plain;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(links))) + '">'+vkButton(IDL('.TXT'))+'</a>\
					   <a download="DocumentsLinks.txt" href="data:text/plain;base64,' + base64_encode(utf8_encode(links)) + '">'+vkButton(IDL('.TXT')+' (UTF-8)','',1)+'</a>';
			var wget_links_html='<textarea class="vk_docs_links_area">'+wget_links+'</textarea>\
					   <a download="DownloadDocuments.sh" href="data:text/plain;base64,' + base64_encode(utf8ToWindows1251(utf8_encode(wget_links))) + '">'+vkButton(IDL('.SH'))+'</a>\
					   <a download="DownloadDocuments.sh" href="data:text/plain;base64,' + base64_encode(utf8_encode(wget_links)) + '">'+vkButton(IDL('.SH')+' (UTF-8)','',1)+'</a>';
			var tabs=[];

			tabs.push({name:IDL('links'),		content:links_html,	active:true});
			tabs.push({name:IDL('wget_links'),	content:wget_links_html});
			box=vkAlertBox(document.title, vkMakeContTabs(tabs));
			box.setOptions({width:"560px"});
			break;
	}
}

function vkDocsPage() {	// Добавляет кнопку "скачать всё" и "скачать все GIF" на странице "Документы"
    if (ge('vkdocslinks')) return;			// Если кнопки уже добавлены, снова не добавлять
    var buttons = ge('docs_side_filter');	// Родительский контейнер всех кнопок, которые справа
    if (buttons) {	// Добавление кнопок
        buttons.insertBefore(vkCe('div',{	// Кнопка "Скачать всё"
                "id" :	"vkdocslinks",		// id нужен для определения, добавлены ли уже кнопки или нет.
                "class": "side_filter",
                "onmousedown": "vkDocsDownloadAll(cur.oid,'imgs');",
                "onmouseover": "addClass(this, 'side_filter_over');",
                "onmouseout":  "removeClass(this, 'side_filter_over');"
            },
            IDL('downloadAll')
        ),ge('docs_section_all'));	// перед кнопкой "все документы"

		buttons.insertBefore(vkCe('div',{	// Кнопка "Скачать все гифки"
				"class": "side_filter",
				"onmousedown": "vkDocsDownloadAll(cur.oid,'imgs',true);",
				"onmouseover": "addClass(this, 'side_filter_over');",
				"onmouseout":  "removeClass(this, 'side_filter_over');"
			},
			IDL('downloadAllGifs')
		),ge('docs_section_all'));	// перед кнопкой "все документы"

		buttons.insertBefore(vkCe('div', {	// Кнопка "Сссылки"
				"class": "side_filter",
				"onmousedown":	"vkDocsDownloadAll(cur.oid,'links');",
				"onmouseover":	"addClass(this, 'side_filter_over');",
				"onmouseout":	"removeClass(this, 'side_filter_over');"
			},
			IDL('Links')
		),ge('docs_section_all'));	// перед кнопкой "все документы"

		buttons.insertBefore(vkCe('div', {	// Кнопка "Сссылки на GIF"
				"class": "side_filter",
				"onmousedown":	"vkDocsDownloadAll(cur.oid,'links',true);",
				"onmouseover":	"addClass(this, 'side_filter_over');",
				"onmouseout":	"removeClass(this, 'side_filter_over');"
			},
			IDL('LinksGif')
		), ge('docs_section_all'));	// перед кнопкой "все документы"
	}
}

/* PAGES.JS */
vk_pages={
   inj:function(){
      if (getSet(71)=='y') 
         Inj.Before('wall.replyTo','if (!v','vkWallReply(post,toMsgId, toId, event, rf,v,replyName); if(false) ');
      Inj.Before('Wall.replyTo','toggleClass','vk_wall.cancel_reply_btn(post);');
   },
   inj_common:function(){
      Inj.Start('showWiki','if (vk_pages.is_wiki_box_disabled(arguments)) return;');
   },
   is_wiki_box_disabled:function(args){
      var box_disable=(getSet(86)=='y');
      var page=args[0], 
          edit=args[1], 
          ev = args[2], 
          opts=args[3];
      //console.log(ev);
      if (!ev) return false;
      var el= ev.target || ev.srcElement || {};
      if (box_disable && page && page.w && (page.w+"").match(/^wall-?\d+_\d+$/) && (el.tagName=='SPAN' || el.tagName=='A')){
         return true;
      }
      return false;
   }
   

}

function vkGroupsList(){
   Inj.Before('GroupsList.showMore','var name','if (vkGroupsListCheckRow(row)) continue;');
   
   if (getSet(74)=='y')  
      Inj.Replace('GroupsList.showMore',/html\.join\(['"]+\)/g, "vkModAsNode(html.join(''),vkGroupDecliner)"); 
}

function vkGroupsListPage(){
	vkGrLstFilter();
   if (getSet(74)=='y')
      vkGroupDecliner();
    vk_groups.leave_all_btn();
}


vk_groups = {
   css:'\
   #vk_gr_filter{margin-top: -3px;}\
   #vk_show_members_link{text-align:center; margin-bottom:-8px; margin-top: -5px; opacity:0;}\
   #group_followers:hover #vk_show_members_link, #public_followers:hover #vk_show_members_link{opacity:1;}\
   .people_cell .vk_gru_actions.opacity_anim, .vk_gru_row .vk_gru_actions.opacity_anim{opacity:0.5;}\
   .people_cell:hover .vk_gru_actions.opacity_anim, .vk_gru_row:hover .vk_gru_actions.opacity_anim{opacity:1;}\
   .vk_gru_row{}\
   .vk_gru_row:hover{background-color:rgba(163, 180, 194, 0.2);}\
   .vk_act_btn{opacity:0.6}\
   .vk_act_btn:hover{opacity:1} \
   .vk_gru_row{width:195px; padding-left:3px;}\
   ',
   // GROUP PAGE
   show_members_btn:function(){
      var p=ge('group_followers') || ge('public_followers');
      if (!p) return;
      p=geByClass('module_body',p)[0];
      if (p && !ge('vk_show_members_link')){
         var el=se('<div id="vk_show_members_link" class="opacity_anim"><a href="#" onclick="return vk_groups.show_members()">'+IDL('ShowGroupMembers')+'</a></div>');
         p.appendChild(el);
      }
   },
   show_members:function(gid){
         if (!gid) gid=Math.abs(cur.gid || cur.oid);
         var box=showFastBox({title:IDL('GroupMembers'),width:'478px',progress:'progress'+gid},'<div id="vk_member_list'+gid+'" class="dislike_list"></div>'); 
         box.setOptions({bodyStyle: 'padding: 0px; height: 310px;', width: 478});
         addClass(ge('vk_member_list'+gid),'disliked_users_big_loader');
         stManager.add('boxes.css');
         vk_groups.show_members_page(gid,0);
         return false;
   },
   show_members_page:function(gid,offset){
      if (!gid) gid=Math.abs(cur.gid || cur.oid);
      offset = offset || 0;
      var PER_PAGE=24;
      var IN_ROW=8;
      
      var sort="time_desc";//"time_asc";//
      var code=''+
      'var members=API.groups.getMembers({gid:'+gid+', count:'+PER_PAGE+', offset:'+offset+', sort:"'+sort+'"});'+
      'var users=API.users.get({uids:members.users,fields:"photo_rec"});'+
      'return {count:members.count,users:users};'+
      '';

      var item_tpl='\
         <td><div class="liked_box_row">\
            <div class="liked_box_thumb"><a href="/id%UID%" onclick="return nav.go(this, event)"><img width="50" height="50" src="%AVA%"></a></div>\
            <div><a href="/id%UID%" onclick="return nav.go(this, event)">%NAME%</a></div>\
         </div></td>\
      ';
      
      var cont_tpl='\
         <div style="padding: 7px 5px 5px;">\
           <div class="fl_r" style="padding:0 5px;width:200px;">%PAGE_LIST%</div>\
           <h4 style="border-bottom: 1px solid #DAE1E8;margin:0 5px 10px;padding:5px 0 2px;">%TITLE%</h4>\
           <table cellpadding="0" cellspacing="0">\
             <tbody>%USERS%</tbody>\
           </table>\
         </div>\
      ';
      
      var page_list=function(cur,end,href,onclick,step,without_ul){
         var after=2;
         var before=2;
         if (!step) step=1;
         var html=(!without_ul)?'<ul class="page_list fl_r">':'';
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
      
      var data=null;
      var load_info = function(){ 
         show('progress'+gid);
         dApi.call('execute',{code:code},function(r){
            view_info(r.response);
         });
      }
      var view_info=function(info){
         removeClass(ge('vk_member_list'+gid),'disliked_users_big_loader');
         hide('progress'+gid);
         var html='';
         var users=info.users;
         if (!users.length){            
            html='<tr><td><div class="msg">'+IDL('MembersListAccessDenied')+'</div></td></tr>';
         } else {
            for (var i=0; i<users.length;i++){
               html+=item_tpl.replace(/%NAME%/g,users[i].first_name)
                             .replace(/%UID%/g,users[i].uid)
                             .replace(/%AVA%/g,users[i].photo_rec);
               html+=((i+1)%IN_ROW==0)?'</tr><tr>':'';
            }
            html='<tr>'+html+'</tr>';
         }
         var pg='';
         if (info.count>PER_PAGE){
            pg=page_list(Math.ceil(offset/PER_PAGE),Math.ceil(info.count/PER_PAGE)-1,'#',"return vk_groups.show_members_page('"+gid+"',%%)",PER_PAGE);
         }
         
         html=cont_tpl.replace(/%PAGE_LIST%/g,pg)
                      .replace(/%TITLE%/g,info.count)
                      .replace(/%USERS%/g,html);
         ge('vk_member_list'+gid).innerHTML=html;
         vkProcessNode(ge('vk_member_list'+gid));
      }
      load_info();         
      return false;
   },
   requests_block:function(is_list){
      if (getSet(88)!='y') return;
      if (!ge('page_actions') || !/\?act=(edit|users)/.test(ge('page_actions').innerHTML)) return;
      var oid=cur.oid;
      var gid=Math.abs(oid);
      if (!ge('vk_group_requests')){
         var html='\
           <a href="/club'+gid+'?act=users&tab=requests" onclick="return nav.go(this, event)" class="module_header"><div class="header_top clear_fix">'+IDL('GroupRequests')+'</div></a>\
           <div class="module_header">\
             <div class="p_header_bottom">\
               <a href="javascript:vk_groups.requests_block(true)" id="vk_gr_req_all_link">'+ vkopt_brackets(getLang('global_X_people',0)) +'</a>\
               <span class="fl_r"><a href="/club'+gid+'?act=users&tab=requests" onclick="return nav.go(this, event)">'+IDL('all')+'</a></span>\
             </div>\
           </div>\
           <div class="module_body clear_fix" id="vk_gr_req_users_content"></div>\
         ';
         //html=html.replace('%USERS%',users);
         var div=vkCe('div',{"class":"module clear people_module",id:"vk_group_requests"});
         div.innerHTML=html;
         var p=ge('group_followers');
         if (!p) return;
         p.parentNode.insertBefore(div,p);
         hide('vk_group_requests');
      }
      ge('vk_gr_req_users_content').innerHTML=vkBigLdrImg;
      if (is_list){
         ge("vk_gr_req_all_link").href="javascript:vk_groups.requests_block()";
         addClass('vk_gr_req_all_link','as_list')
      } else {
         ge("vk_gr_req_all_link").href="javascript:vk_groups.requests_block(true)";
         removeClass('vk_gr_req_all_link','as_list')
      }
      ajax.post('groupsedit.php', {act: 'get_list', id: Math.abs(cur.oid), tab: 'requests'}, {onDone: function(cnt, res) {
            //console.log('gr_requests',cnt, res);
            if (cnt<=0) {
               hide('vk_group_requests');
               return;
            }
            show('vk_group_requests');
            var udata=res;
            var to=3;
            var count=is_list?udata.length:Math.min(udata.length,FAVE_ONLINE_BLOCK_SHOW_COUNT);
            var users='';
            for (var i = 0; i < count; i++) {
               if (!is_list){
               //udata[i][7]  - HASH
               var n1=udata[i][2].split(' ')[0] || '';
               var n2=udata[i][2].split(' ')[1] || '';
               users += ((i == 0 || i % to == 0) ? '<div class="people_row">' : '') + 
                        '<div class="fl_l people_cell" id="vk_gru'+udata[i][0]+'">\
                          <a href="/id'+udata[i][0]+'" onclick="return nav.go(this, event)">\
                            <img width="50" height="50" src="'+udata[i][3]+'">\
                          </a>\
                          <div class="name_field">\
                            <a href="/id'+udata[i][0]+'" onclick="return nav.go(this, event)">\
                              '+n1+'<!--<br><small>'+n2+'</small>-->\
                            </a>\
                            <span id="vk_gru_act'+udata[i][0]+'" class="vk_gru_actions opacity_anim"><br>\
                              <a href="#" class="vk_ok_ico vk_act_btn" onclick="vk_groups.request_accept('+gid+','+udata[i][0]+',\''+udata[i][7]+'\'); return false;"></a>\
                              <span class="divide"></span>\
                              <a href="#" class="vk_cancel_ico vk_act_btn" onclick="vk_groups.request_cancel('+gid+','+udata[i][0]+',\''+udata[i][7]+'\'); return false;"></a>\
                            </span>\
                          </div>\
                        </div>'+
                     ((i > 0 && (i + 1) % to == 0) ? '</div>' : '');
               } else {
                  users +='<div align="left" class="vk_gru_row">\
                     <span class="fl_r vk_gru_actions opacity_anim" id="vk_gru_act'+udata[i][0]+'">\
                        <a href="#" class="vk_ok_ico vk_act_btn" onclick="vk_groups.request_accept('+gid+','+udata[i][0]+',\''+udata[i][7]+'\'); return false;"></a>\
                        <span class="divide"></span>\
                        <a href="#" class="vk_cancel_ico vk_act_btn" onclick="vk_groups.request_cancel('+gid+','+udata[i][0]+',\''+udata[i][7]+'\'); return false;"></a>\
                     </span>\
                     <a href="id'+udata[i][0]+'" '+(vkIsFavUser(udata[i][0])?'class="vk_faved_user"':'')+'>'+udata[i][2]+'</a>\
                     </div>';
               }
            }
            if (ge('vk_gr_req_users_content')){
               ge("vk_gr_req_all_link").innerHTML=vkopt_brackets(getLang('global_X_people',cnt));
               ge('vk_gr_req_users_content').innerHTML=users;
               vkProcessNodeLite(ge('vk_gr_req_users_content'));
            }   
         
         },
         onFail:function(text){console.log('VkOpt: get "requests" list fail! ['+text+']');return true;}
      });
   },
   request_accept:function(gid,mid,hash){
      var el=ge('vk_gru_act'+mid);
      if (el)
         el.innerHTML=vkLdrMiniImg;
      ajax.post('groupsedit.php', {act: 'user_action', id: gid, addr: mid, hash: hash, action: 1}, {
         onDone: function(row) {
            //alert(row);
            if (el){ 
               el.innerHTML='OK';
               fadeOut(el, 200);
               //hide(el);
               setTimeout(function(){
                  if (ge('vk_gr_req_users_content') && geByClass('vk_ok_ico',ge('vk_gr_req_users_content')).length==0)
                     vk_groups.requests_block(hasClass('vk_gr_req_users_content','as_list'))               
               },600)

               
            }
         }
      });
   },
   request_cancel:function(gid,mid,hash){
      var el=ge('vk_gru_act'+mid);
      if (el)
         el.innerHTML=vkLdrMiniImg;
      ajax.post('groupsedit.php', {act: 'user_action', id: gid, addr: mid, hash: hash, action: -1}, {
         onDone: function(row) {
            //alert(row);
            if (el){ 
               el.innerHTML='OK';
               fadeOut(el, 200);
               //hide(el);
               setTimeout(function(){
                  if (ge('vk_gr_req_users_content') && geByClass('vk_ok_ico',ge('vk_gr_req_users_content')).length==0)
                     vk_groups.requests_block(hasClass('vk_gr_req_users_content','as_list'))               
               },600)
            }
         }
      });
   },   
   // GROUP EDIT
   group_edit_page:function(){
      //var tab=(nav.objLoc['tab'] || cur.tab);
      if (nav.objLoc['act']=='blacklist') 
         vk_groups.unban_all(true);      
      vk_groups.deactivated_edit_btn();
      vk_groups.remove_all_invites(true);
   },
   group_edit_inj:function(){
      Inj.End('GroupsEdit.uShowMore','setTimeout(function(){vkProcessNode(cont);},300); console.log("uShowMore",cont);');
   },
   deactivated_edit_btn:function(){
      var p=ge('gedit_users_summaryw_members');//ge('gedit_summary_tabs');//
      if (!p || ge('vk_deactivated_edit_btn')) return;
      var el=se('<a class="fl_r nobold" id="vk_deactivated_edit_btn" href="#" onclick="return vk_groups.deactivated_edit();">'+IDL('FrDeleted')+'</a>');
      p.insertBefore(el, p.firstChild); 
   },
   deactivated_edit:function(gid){
      ge('gedit_users_rows_members').innerHTML='<div id="vk_gre_scan">'+vkBigLdrImg+'</div><div id="vk_gre_scan_queue"></div>';
      hide('gedit_users_more_members');
      var tab=geByClass('summary_tab_sel')[0];
      if (tab){
         removeClass(tab,'summary_tab_sel');
         addClass(tab,'summary_tab');
      }
      
      if (!gid) gid=Math.abs(cur.gid || cur.oid);
      processDestroy(cur);
      offset = 0;
      var PER_REQ=500;
      var sort="time_asc";//"time_desc";//
      
      var queue=[];
      var founded=0;
      var deactiv_count=0;
      function queue_process(){
            if (queue.length==0){ 
               ge('vk_gre_scan_queue').innerHTML='';
               return;
            }
            var uid=queue.shift();
            var need_run=(queue.length==0)?false:true;
            ge('vk_gre_scan_queue').innerHTML=vkProgressBar(deactiv_count-queue.length,deactiv_count,590,IDL('Loading')+' %');
            var tab='members';
            ajax.post('groupsedit.php', {
               act: 'get_page',
               id: gid,
               tab: 'members',
               addr: uid
            }, {
               onDone: function(html, found) {
                  if (found) {
                     show('gedit_users_summaryw_' + tab);
                     founded++;
                     val('gedit_users_summary_' + tab, getLang('groups_found_n_users', founded, true));
                  }
                  ge('gedit_users_rows_members').appendChild(se(found?html:'<span>Error. id'+uid+'</span>'));
                  if (need_run) setTimeout(queue_process,100); else ge('vk_gre_scan_queue').innerHTML='';
               },
               onFail:function(){
                  if (need_run) setTimeout(queue_process,5000); else ge('vk_gre_scan_queue').innerHTML='';
               }
            });
      }
      function scan(){
         var code=''+
         'var members=API.groups.getMembers({gid:'+gid+', count:'+PER_REQ+', offset:'+offset+', sort:"'+sort+'"});'+
         'var users=API.users.get({uids:members.users,fields:"deactivated"});'+
         'return {count:members.count,users:users};'+
         '';
         dApi.call('execute',{code:code},function(r){
            var need_run = (queue.length==0)?true:false;
            var count=r.response.count;
            var users=r.response.users;
            for (var i=0; i<users.length; i++){
               if (users[i].deactivated){
                  queue.push(users[i].uid);
                  deactiv_count++;
               }
            }
            users=null;
            if (need_run) queue_process();
            
            ge('vk_gre_scan').innerHTML=vkProgressBar(offset,count,590,IDL('Search')+' %');
            if (offset<count){
               offset+=PER_REQ;
               setTimeout(scan,350);
            } else {
               ge('vk_gre_scan').innerHTML='';
            }
            
         });
      }; 
      scan();
      return false;
   },
   remove_all_invites:function(add_btn){
      if (add_btn){
         var btn=ge('vkillinv');
         var p=ge('gedit_users_summaryw_invites');//ge('gedit_summary_tabs');//
         if (!p || ge('vkillinv')) return;
         var el=se('<a class="fl_r nobold" id="vkillinv" href="#" onmouseover="showTooltip(this, {text: \'max 500 per day\', showdt: 0, black: 1});" onclick="return vk_groups.remove_all_invites();">'+IDL('Kill_Invitation')+'</a>');
         p.insertBefore(el, p.firstChild);
         return;
      }
      
      var box=null;
      var ids=[];
      var del_offset=0;
      var cur_offset=0;
      var abort=false;	
      var restored=[];
      
      var process=function(){	    
         //*
         //console.log(ids)
         if (abort) return;
         var del_count=ids.length;
         console.log(del_count,del_offset);
         ge('vk_scan').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('killing... ')+' %');
         var ids_part=ids[del_offset];//.slice(del_offset,del_offset+1);
         if (!ids_part){ 
            box.hide();		
            vkMsg(IDL('Done'),3000);	
         } 
         else {// ids[0]  ids[7]
            ajax.post('groupsedit.php', {
               act: 'user_action',
               id: cur.opts.id,
               addr: ids[del_offset][0],
               hash: ids[del_offset][7],
               action: -1
            }, {
               onDone: function(row) {
                  del_offset++;
                  setTimeout(process,10);         
               },
               onFail:function(row) {
                  del_offset++;
                  setTimeout(process,5000);         
               }
            });
         }
      };

      var scan=function(){
         ajax.post('groupsedit.php', {act: 'get_list', id: cur.opts.id, tab: 'invites'}, {onDone: function(cnt, res) {
           var count=cnt;
           ids=res;
           process();
         }});
      };
      var run=function(){
         box=new MessageBox({title: IDL('deleting'),closeButton:true,width:"350px"});
         box.removeButtons(); 
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no'); 
         var html='<div id="vk_scan"></div>'; box.content(html).show();	
         scan();
      }
      vkAlertBox(IDL('Kill_Invitation'),IDL('Kill_Invitation_confirm'),run,true);
      return false;
   },
   unban_all:function(add_btn){
      if (add_btn){
         var btn=ge('vunbanall');
         if (btn){
          //(nav.objLoc['tab']=='invites'?show:hide)(btn);
         } else if(ge('group_bl_summary')) {//nav.objLoc['tab']=='invites'
            var p=ge('group_bl_summary');
            if (!p) return;
            btn=vkCe('span',{"class":'', id:'vunbanall'},'<a onclick="vk_groups.unban_all();">'+IDL('UnbanAll')+'</a>');
            p.parentNode.appendChild(vkCe('span',{"class":'divide'},'|'));
            p.parentNode.appendChild(btn);//insertAfter(btn,p);
         }
         
         return;
      }
      
      var box=null;
      var ids=[];
      var del_offset=0;
      var cur_offset=0;
      var abort=false;	
      var restored=[];
      
      var process=function(){	    
         //*
         //console.log(ids)
         if (abort) return;
         var del_count=ids.length;
         console.log(del_count,del_offset);
         ge('vk_scan').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('unban users... ')+' %');
         var ids_part=ids[del_offset];//.slice(del_offset,del_offset+1);
         if (!ids_part){ 
            box.hide();		
            vkMsg(IDL('Done'),3000);	
         } 
         else     
            ajax.post('al_groups.php', {act: 'bl_user', mid: ids[del_offset][0], gid: cur.gid, hash: cur.hash}, {
               onDone: function(res) {
                  del_offset++;
                  setTimeout(process,10);         
               }
            });  

      };

      var scan=function(){
         if (cur_offset==0) ge('vk_scan').innerHTML=vkProgressBar(2,2,310,' scaning... ');
         //dApi.call('messages.get',{out:is_out?1:0,count:100,offset:cur_offset,preview_length:1},function(r){
         ajax.post(nav.objLoc[0], {act:'blacklist',offset: cur_offset, part: 1}, {
            onDone: function(off,html) {
               if (abort) return;
               var ms=[];
               vkModAsNode(html,function(node){
                  var nodes=geByClass('group_bl_row',node);
                  for (var i=0; i<nodes.length; i++){
                     var info=nodes[i].innerHTML.match(/GroupsEdit\.toggleBlacklist\((\d+)/i);
                     ms.push([info[1]]);
                  }               
               })
               
               
               //ge('vk_scan').innerHTML=vkProgressBar(1,1,310,' ');
               for (var i=0;i<ms.length;i++) ids.push(ms[i]);
               if (!ms[0] /*|| ids.length>=500*/){ 
                  process();	
                  return;	
               } else {
                  cur_offset+=25; 
                  setTimeout(scan,10);
               } 
            }, 
            onFail: function() {}
         });
      };
      var run=function(){
         box=new MessageBox({title: IDL('deleting'),closeButton:true,width:"350px"});
         box.removeButtons(); 
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no'); 
         var html='<div id="vk_scan"></div>'; box.content(html).show();	
         scan();
      }
      vkAlertBox(IDL('UnbanAll'),IDL('UnbanAll_confirm'),run,true);
   },

   // GROUPS LIST
   leave_all_btn:function(){
      if (getSet(77)!='y') return;
      if (nav.objLoc['id'] && nav.objLoc['id']!=vk.id) return;
      var p=ge('groups_list_tabs');
      if (!p || ge('vk_leave_all')) return;
      var li=se('<li class="t_r" id="vk_leave_all"><span class="divider">|</span><a onclick="vk_groups.leave_all()">'+IDL('LeaveAll')+'</a></li>');
      p.appendChild(li);
   },
   leave_all:function(){
      var REQ_CNT=1000;
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
         ge('vk_del_msg').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %');
         var item_id=mids[del_offset];
         if (!item_id){
            ge('vk_del_msg').innerHTML=vkProgressBar(1,1,310,' ');
            del_offset=0;
            callback();
         } else
         dApi.call('groups.leave', {gid:item_id},function(r,t){
            del_offset++;
            setTimeout(function(){del(callback);},DEL_REQ_DELAY);
         });
      };
      
      var _count=0;
      var cur_offset=0;
      var scan=function(){
         if (cur_offset==0) ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,2,310,IDL('listreq')+' %');
         
         var params={extended:1};
         params['count']=REQ_CNT;
         params['offset']=cur_offset;
         dApi.call('groups.get',params,function(r){
            if (abort) return;
            var ms=r.response;
            if (!ms[0]){ del(deldone);	return;	}
            var _count=ms.shift();
            ge('vk_scan_msg').innerHTML=vkProgressBar(cur_offset,_count,310,IDL('listreq')+' %');
            for (var i=0;i<ms.length;i++) if (!ms[i].is_admin) mids.push(ms[i].gid);
            if (cur_offset<_count){	cur_offset+=REQ_CNT; setTimeout(scan,SCAN_REQ_DELAY);} else del(deldone);
         });
      };
      
      var run=function(){
         
         box=new MessageBox({title: IDL('LeaveGroups'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
         var html='</br><div id="vk_del_msg" style="padding-bottom:10px;"></div><div id="vk_scan_msg"></div>';
         box.content(html).show();	
         scan();
      };

      vkAlertBox(IDL('LeaveGroups'),IDL('LeaveAllGroupsConfirm'),run,true);
   },
   // UTILS
   leave:function(gid){
      vkAlertBox('', IDL('LeaveGroup'),function(){
         dApi.call('groups.leave',{gid:Math.abs(gid)},function(r){
            vkMsg(r.response?IDL('GroupLeft'):IDL('Fail'),700)
         });
      }, true)
      return false;
   },
   enter:function(gid){
      dApi.call('groups.join',{gid:Math.abs(gid)},function(r){
         vkMsg(r.response?IDL('Done'):IDL('Fail'),700)
      });
      return false;
   }
}

function vkGroupDecliner(node){// [name, gid, href, thumb, count, type, hash, fr_count, friends, dateText]
   if (getSet(74)!='y') return;
   if (cur.scrollList && cur.scrollList.tab=="admin") return;
   if (nav.objLoc['id'] && nav.objLoc['id']!=vk.id) return;
   var nodes=geByClass('group_list_row',node);
   for (var i=0; i<nodes.length; i++){
      if (!nodes[i].id || nodes[i].innerHTML.match('vkGroupLeave')) continue;
      var p=geByClass('group_row_info',nodes[i])[0];
      if (!p) continue;
      var gid=(nodes[i].id || "").match(/\d+/);
      var el=vkCe('div',{"class":'fl_r'},'<a href="#" onclick="return vkGroupLeave('+gid+',this);">'+IDL('LeaveGroup')+'</a>');
      p.appendChild(el);
      //p.insertBefore(el,p.firstChild);
      
      //console.log(nodes[i].id);
   }
   //console.log(node);
}


function vkGroupLeave(gid,node){
   var p = (node || {}).parentNode;
   if (p) p.innerHTML=vkLdrImg;
   dApi.call('groups.leave',{gid:gid},function(r){
      if (r.response==1){
         if (p) p.innerHTML=IDL('GroupLeft');
      } else
         if (p) p.innerHTML='WTF? O_o';
   })
   return false;
}
function vkGroupsListCheckRow(row){
   var val=parseInt((ge('vk_grlst_filter') || {}).value || '0');
   if (val==0) return false;
   var type=row[6];
   
   /*
   type:
      3: public
      10+: event
      0: group open
      1: group closed
      2: group private
   */
   var isEvent = (type >= 10);
   var isPublic = (type==3);
   var isGroup = (type>=0 && type <=2);
   /*
      groups - hide events & publics
      events - hide groups & publics
      groups & pub - hide events
      publics - hide events & groups
  
   */
   if (val==1 && (isEvent || isPublic)) return true;// hide events and publics
   if (val==2 && (isGroup || isPublic)) return true;// hide groups and publics
   if (val==3 &&  -isEvent) return true;             // hide events
   if (val==4 && (isGroup || isEvent)) return true; // hide events and groups
   return false;
}

function vkGrLstFilter(){
   var p=(ge('groups_list_summary') || {}).parentNode;//ge('groups_list_tabs'); 
   if (!p) return;
   if (ge('vk_gr_filter')){
      (nav.objLoc['tab']=='admin'?hide:show)('vk_gr_filter');
   }
   if ((ge('vk_gr_filter') && cur.vkGrLstMenu) || !p) return;
   
   //var el=vkCe('li',{id:'vk_gr_filter'},'<input type="hidden" id="vk_grlst_filter">');
   var el=se('<div class="fl_r"><div id="vk_gr_filter"><input type="hidden" id="vk_grlst_filter"></div></div>');
   
   if (!ge('vk_gr_filter')) p.insertBefore(el,p.firstChild);//p.appendChild(el);
   //*   
   stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
      vkaddcss('ul.t0 .result_list ul li{float:none}');
      if (cur.vkGrLstMenu) return;
      cur.vkGrLstMenu = new Dropdown(ge('vk_grlst_filter'),[[0,IDL("SelectGRFilter")],[1,IDL("Groups")],[2,IDL("Events")],[3,IDL("GroupsAndPublics")],[4,IDL("Publics")]], {
        target: ge('vk_gr_filter'),
        resultField:'vk_grlst_filter',
        width:160,
        onChange: function(val){
            //alert(val);
            cur.scrollList.offset=0;
            var cont = ge(cur.scrollList.prefix + cur.scrollList.tab);
            cont.innerHTML='';
            GroupsList.showMore();
        }
      });
      (nav.objLoc['tab']=='admin'?hide:show)('vk_gr_filter');
	});	
   //*/
}

function vkToTopBackLink(){
   window._stlMousedown = function (e) {
     e = e || window.event;
     if (checkEvent(e)) {
       return;
     }
     if (!__afterFocus) {
       var y = _stlSaved;
       _stlSaved = y ? 0 : scrollGetY();
       _stlBack=_stlSaved;
       _stlText.className = (y || !_stlSaved) ? '' : 'down';
       scrollToY(y, 0);
     }
     return cancelEvent(e);
   }


   window._stlSaved=0;
   var s = {
      onmousedown: _stlMousedown
   };
   if (window._stlLeft) extend(_stlLeft, s);
   if (window._stlSide)  extend(_stlSide, s);
}

// FAVE
vk_fave = {
   inj:function(){
      if (FAVE_ALLOW_EXTERNAL_LINKS)
         Inj.Before('Fave.newLink','var link','vk_fave.new_link_fix();');   
   },
   page:function(){
      vkFavUsersList(true);
      vk_fave.photos_menu();
      vk_fave.videos_menu();
      vk_fave.posts_menu();
      if (getSet(17)=='y' && nav.objLoc['section']=='users'){
         setTimeout(function(){
            var el=ge('users_content');
            if (el.qsorter){ 
               el.qsorter.destroy();
               qsorter.init('users_content', {onReorder: Fave.reorderFave, xsize: 9, width: 67, height: 110});
            }
         },10);
      }   
   },
   new_link_fix:function(){
      var link = ge('fave_new_link').value;
      if (link.match(/^https?:\/\/[^\/]+\//) && !link.match(/https?:\/\/(vk\.com|vkontakte\.ru)/)){
         ge('fave_new_link').value='vk.com/away.php?to='+link;
      }
   },
   photos_menu:function(){
      var e=ge('fave_likes_tabs');
      var x=ge('vk_fav_phlinks_btn');
      if (x) (nav.objLoc['section']=='likes_photo'?show:hide)(x);
      if (!e || x) return;
      var p=geByClass('summary_tab',e);
      p=p[p.length-1];
      if (!p || nav.objLoc['section']!='likes_photo') return;
      
      if (!ge('vk_fav_phlinks_btn')){			
         var a=vkCe('div',{id:'vk_fav_phlinks_btn',"class":'summary_tab fl_r'},'\
            <a href="#" onclick="return false;"  id="vk_favph_act_menu" class_="summary_tab2">'+IDL('Actions')+'</a>\
         ');//<a href="#" onclick="return false;"  id="vk_favph_act_menu" class_="fl_r summary_right">'+IDL('Actions')+'</a>\
         //geByClass('t0')[0].appendChild(a);
         insertAfter(a,p)
         
         var p_options = [];
         p_options.push({l:IDL('SaveAlbumAsHtml'), onClick:function(item) {
            vkGetPageWithPhotos('liked'+vk.id,null);
         }});
         p_options.push({l:IDL('Links'), onClick:function(item) {
               vkGetLinksToPhotos('liked'+vk.id,null);
         }});
         
         p_options.push({l:IDL('DelLikes'), onClick:function(item) {
               vk_fave.remove_likes_photo();
         }});         
         
         
         //p_options=p_options.concat(vk_plugins.album_actions(oid,aid));
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            cur.vkAlbumMenu = new DropdownMenu(p_options, {
              target: ge('vk_favph_act_menu'),
              containerClass: 'dd_menu_posts',
              updateHeader:false,
              offsetLeft:-15,
              showHover:false
            });
         });			
      }
      
      return;
   },
   videos_menu:function(){
      var e=ge('fave_likes_tabs');
      var x=ge('vk_fav_vidlinks_btn');
      if (x) (nav.objLoc['section']=='likes_video'?show:hide)(x);
      if (!e || x) return;
      var p=geByClass('summary_tab',e);
      p=p[p.length-1];
      if (!p || nav.objLoc['section']!='likes_video') return;
      
      if (!ge('vk_fav_vidlinks_btn')){		
         var a=vkCe('div',{id:'vk_fav_vidlinks_btn',"class":'summary_tab fl_r'},'\
            <a href="#" onclick="return false;"  id="vk_favvid_act_menu" class_="summary_tab2">'+IDL('Actions')+'</a>\
         ');//<a href="#" onclick="return false;"  id="vk_favvid_act_menu" class_="fl_r summary_right">'+IDL('Actions')+'</a>\
         //geByClass('t0')[0].appendChild(a);
         insertAfter(a,p)
         
         var p_options = [];
         
         p_options.push({l:IDL('DelLikes'), onClick:function(item) {
               vk_fave.remove_likes_video();
         }});         
         
         
         //p_options=p_options.concat(vk_plugins.album_actions(oid,aid));
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            cur.vkAlbumMenu = new DropdownMenu(p_options, {
              target: ge('vk_favvid_act_menu'),
              containerClass: 'dd_menu_posts',
              updateHeader:false,
              offsetLeft:-15,
              showHover:false
            });
         });			
      }
      
      return;
   },
   posts_menu:function(){
      var e=ge('fave_notes_tab_wrap');//fave_likes_tabs
      var x=ge('vk_fav_postlinks_btn');
      if (x) (nav.objLoc['section']=='likes_posts'?show:hide)(x);
      if (!e || x) return;
      //var p=geByClass('summary_tab',e);
      //p=p[p.length-1];
      if (/* !p ||*/ nav.objLoc['section']!='likes_posts') return;
      
      if (!ge('vk_fav_postlinks_btn')){		
         var a=vkCe('div',{id:'vk_fav_postlinks_btn',"class":'summary_tab fl_r', "style":'padding: 11px 5px 4px;'},'\
            <a href="#" onclick="return false;"  id="vk_favpost_act_menu" class_="summary_tab2">'+IDL('Actions')+'</a>\
         ');//<a href="#" onclick="return false;"  id="vk_favpost_act_menu" class_="fl_r summary_right">'+IDL('Actions')+'</a>\
         //geByClass('t0')[0].appendChild(a);
         //e.parentNode.insertBefore(a,e);
         insertAfter(a,e)
         
         
         var p_options = [];
         
         p_options.push({l:IDL('DelLikes'), onClick:function(item) {
               vk_fave.remove_likes_posts();
         }});         
         
         
         //p_options=p_options.concat(vk_plugins.album_actions(oid,aid));
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            cur.vkAlbumMenu = new DropdownMenu(p_options, {
              target: ge('vk_favpost_act_menu'),
              containerClass: 'dd_menu_posts',
              updateHeader:false,
              offsetLeft:-15,
              showHover:false
            });
         });			
      }
      
      return;
   },
   remove_likes_photo:function(){
      var REQ_CNT=100;//100;
      var DEL_REQ_DELAY=400;
      var box=null;
      var ids=[];
      var del_offset=0;
      var cur_offset=0;
      var abort=false;	
      var deldone=function(){
            box.hide();
            vkMsg(IDL("ClearDone"),3000);	
      };
      var del=function(callback){	
         if (abort) return;
         var del_count=ids.length;
         ge('vk_del_info').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %');
         var obj=ids[del_offset];
         if (!obj){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            del_offset=0;
            callback();
         } else
         dApi.call('likes.delete', {type:'photo', owner_id:obj[0], item_id:obj[1]},function(r,t){
            del_offset++;
            setTimeout(function(){del(callback);},DEL_REQ_DELAY);
         });
      };
      var info_count=0;
      var scan=function(){
         ids=[];
         if (cur_offset==0){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset,2,310,IDL('listreq')+' %');
         }
         dApi.call('fave.getPhotos',{offset:0/*cur_offset*/,count:REQ_CNT},function(r){
            //var data=r.response;
            //var count=data.shift();
            if (abort) return;
            var data=r.response;
            if (data==0 || !data[1]){
               deldone();
               return;
            }
            if (info_count==0) info_count=data.shift();
            else data.shift();
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset+REQ_CNT,info_count,310,IDL('listreq')+' %');
            for (var i=0;i<data.length;i++) ids.push([data[i].owner_id,data[i].pid]);
            cur_offset+=REQ_CNT;
            //vklog(ids);
            del(scan);            
            
         });
      };
      var run=function(){
         box=new MessageBox({title: IDL('DelPhotosLikes'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
         var html='<div id="vk_del_info" style="padding-bottom:10px;"></div><div id="vk_scan_info"></div>';
         box.content(html).show();	
         scan();
      };
      vkAlertBox(IDL('DelPhotosLikes'),IDL('DelPhotosLikesConfirm'),run,true);
   },
   remove_likes_video:function(){
      var REQ_CNT=100;//100;
      var DEL_REQ_DELAY=400;
      var box=null;
      var ids=[];
      var del_offset=0;
      var cur_offset=0;
      var abort=false;	
      var deldone=function(){
            box.hide();
            vkMsg(IDL("ClearDone"),3000);	
      };
      var del=function(callback){	
         if (abort) return;
         var del_count=ids.length;
         ge('vk_del_info').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %');
         var obj=ids[del_offset];
         if (!obj){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            del_offset=0;
            callback();
         } else
         dApi.call('likes.delete', {type:'video', owner_id:obj[0], item_id:obj[1]},function(r,t){
            del_offset++;
            setTimeout(function(){del(callback);},DEL_REQ_DELAY);
         });
      };
      var info_count=0;
      var scan=function(){
         ids=[];
         if (cur_offset==0){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset,2,310,IDL('listreq')+' %');
         }
         dApi.call('fave.getVideos',{offset:0/*cur_offset*/,count:REQ_CNT},function(r){
            //var data=r.response;
            //var count=data.shift();
            if (abort) return;
            var data=r.response;
            if (data==0 || !data[1]){
               deldone();
               return;
            }
            if (info_count==0) info_count=data.shift();
            else data.shift();
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset+REQ_CNT,info_count,310,IDL('listreq')+' %');
            for (var i=0;i<data.length;i++) ids.push([data[i].owner_id,data[i].vid]);
            cur_offset+=REQ_CNT;
            //vklog(ids);
            del(scan);            
            
         });
      };
      var run=function(){
         box=new MessageBox({title: IDL('DelVideosLikes'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
         var html='<div id="vk_del_info" style="padding-bottom:10px;"></div><div id="vk_scan_info"></div>';
         box.content(html).show();	
         scan();
      };
      vkAlertBox(IDL('DelVideosLikes'),IDL('DelVideosLikesConfirm'),run,true);
   },
   remove_likes_posts:function(){
      var REQ_CNT=100;//100;
      var DEL_REQ_DELAY=400;
      var box=null;
      var ids=[];
      var del_offset=0;
      var cur_offset=0;
      var abort=false;	
      var deldone=function(){
            box.hide();
            vkMsg(IDL("ClearDone"),3000);	
      };
      var del=function(callback){	
         if (abort) return;
         var del_count=ids.length;
         ge('vk_del_info').innerHTML=vkProgressBar(del_offset,del_count,310,IDL('deleting')+' %');
         var obj=ids[del_offset];
         if (!obj){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            del_offset=0;
            callback();
         } else
         dApi.call('likes.delete', {type:'post', owner_id:obj[0], item_id:obj[1]},function(r,t){
            del_offset++;
            setTimeout(function(){del(callback);},DEL_REQ_DELAY);
         });
      };
      var info_count=0;
      var scan=function(){
         ids=[];
         if (cur_offset==0){
            ge('vk_del_info').innerHTML=vkProgressBar(1,1,310,' ');
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset,2,310,IDL('listreq')+' %');
         }
         dApi.call('fave.getPosts',{offset:0/*cur_offset*/,count:REQ_CNT},function(r){
            //var data=r.response;
            //var count=data.shift();
            if (abort) return;
            var data=r.response;
            if (data==0 || !data[1]){
               deldone();
               return;
            }
            if (info_count==0) info_count=data.shift();
            else data.shift();
            ge('vk_scan_info').innerHTML=vkProgressBar(cur_offset+REQ_CNT,info_count,310,IDL('listreq')+' %');
            for (var i=0;i<data.length;i++) ids.push([data[i].to_id,data[i].id]);
            cur_offset+=REQ_CNT;
            //vklog(ids);
            del(scan);            
            
         });
      };
      var run=function(){
         box=new MessageBox({title: IDL('DelPostsLikes'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
         var html='<div id="vk_del_info" style="padding-bottom:10px;"></div><div id="vk_scan_info"></div>';
         box.content(html).show();	
         scan();
      };
      vkAlertBox(IDL('DelPostsLikes'),IDL('DelPostsLikesConfirm'),run,true);
   }
}

vk_board={
   css:'\
      .vk_bp_other_posts{padding-left:65px;}\
      .vk_bp_other_posts .bp_post{width: 530px;}\
      .vk_bp_other_posts .bp_text{width: 455px;}\
      .vk_bp_other_posts #bpe_text{width: 450px !important;}\
      .vk_brd_action{\
         opacity:0;\
        -webkit-transition: opacity 100ms linear;\
        -moz-transition: opacity 100ms linear;\
        -o-transition: opacity 100ms linear;\
        transition: opacity 100ms linear;\
      }\
      .bp_post:hover .vk_brd_action{opacity:1;}',
   get_user_posts:function(user_href,el){// add cancel btn && fix scroll
      var start_offset=cur.pgOffset;
      var cur_offset=start_offset;
      var user=user_href.split('/').pop();
      var abort=false;
      el=ge(el);
      var p=el;//geByClass('bp_info',el)[0];
      var rx=/post(-\d+)_(\d+)/;
      var last_id=parseInt(el.id.match(rx)[2]);
      var idprogr=el.id+'_progress';
      var idres=el.id+'_other';
      var idcont=el.id+'_results';
      var idctrls=el.id+'_ctrls';
      var panel=ge(idcont);
      if (panel) re(panel);
      panel=vkCe('div',{id:idcont,"class":'vk_bp_other_posts'},'<div id="'+idres+'"><div class="vk_bp_separator"></div></div>\
                     <div id="'+idctrls+'" > <div class="button_blue fl_r"><button>'+IDL('Cancel')+'</button></div> <div id="'+idprogr+'"></div></div>')
      p.insertBefore(panel,p.firstChild);
      var btn=geByTag1('button');
      var status=function(){
         ge(idprogr).innerHTML=vkProgressBar(start_offset-cur_offset,start_offset,310, 'Scaning... %'); 
      }
      var done=function(){
         hide(idctrls);
      }
      var scan=function(){
         if (cur_offset<=0 || abort){
            done();
         } else {
            ajax.post("/topic"+cur.topic, {local:1,offset:cur_offset}, {
               onDone: function(count, from, rows, offset, pages, preload) { 
                  //console.log(arguments);
                  if (abort){
                     done();
                     return;
                  }
                  cur_offset-=20;
                  status();
                  //alert(rows);
                  var div=vkCe('div',{},rows);
                  var result=vkCe('div',{});
                  var posts=geByClass('bp_post',div);
                  for (var i=0; i<posts.length; i++){
                     var a=geByClass('bp_author',posts[i])[0];
                     var post_id=parseInt(posts[i].id.match(rx)[2]);
                     if (a && (a.getAttribute('href')||'').indexOf('/'+user)!=-1 && last_id>post_id){
                        result.appendChild(posts[i].cloneNode(true));
                     }
                  }
                  if (result.innerHTML!=''){
                     var startST = scrollGetY();
                     ge(idres).insertBefore(result,ge(idres).firstChild);
                     var updH=getSize(result)[1];
                     if (updH && startST > 100) {
                        scrollToY(startST + updH, 0);
                     }
                     //alert(result.innerHTML);
                  }
                  setTimeout(scan,300);
               }
            }); 
         }
         
      }
      btn.onclick=function(){abort=true; done();}
      status(); 
      scan();
      return false;
   },
   get_user_posts_btn:function(node){
      var els=geByClass('bp_post',node);
      for (var i=0; i<els.length; i++){
         var p=(geByClass('bp_date',els[i])[0] || {}).parentNode;
         var a=geByClass('bp_author',els[i])[0];
         var z=geByClass('vk_brd_action',els[i])[0];
         if (!p || !a || z) continue;
         p.appendChild(vkCe('span',{"class":"divide vk_brd_action"},'|'));
         p.appendChild(vkCe('a',{"href":"#","class":'vk_brd_action',onclick:"return vk_board.get_user_posts('"+a.getAttribute('href')+"','"+els[i].getAttribute('id')+"')"},IDL('PrevPosts')));
      }
   }
}


vk_feed={
   css:'\
      #vk_feed_filter .checkbox_container table, #vk_feed_filter_panel .checkbox_container table{margin: 0px;}\
      #feed_summary_wrap .divide{padding-top:3px;}\
      #vk_feed_filter .checkbox_container{width:auto !important;}\
      .vkf_filter .vk_feed_photo,\
      .vkf_filter .vk_feed_video,\
      .vkf_filter .vk_feed_audio,\
      .vkf_filter .vk_feed_graff,\
      .vkf_filter .vk_feed_poll, \
      .vkf_filter .vk_feed_note, \
      .vkf_filter .vk_feed_text, \
      .vkf_filter .vk_feed_links,\
      .vkf_filter .vk_feed_group,\
      .vkf_filter .vk_feed_friend,\
      .vkf_filter .vk_feed_repost{display:none !important}\
      \
      .vkf_photo .vk_feed_photo,\
      .vkf_video .vk_feed_video,\
      .vkf_audio .vk_feed_audio,\
      .vkf_graff .vk_feed_graff,\
      .vkf_poll  .vk_feed_poll, \
      .vkf_note  .vk_feed_note, \
      .vkf_text  .vk_feed_text, \
      .vkf_links .vk_feed_links,\
      .vkf_group .vk_feed_group,\
      .vkf_friend .vk_feed_friend,\
      .vkf_repost .vk_feed_repost{display:block !important}\
      \
      .vkf_nophoto .vk_feed_photo,\
      .vkf_novideo .vk_feed_video,\
      .vkf_noaudio .vk_feed_audio,\
      .vkf_nograff .vk_feed_graff,\
      .vkf_nopoll  .vk_feed_poll, \
      .vkf_nonote  .vk_feed_note, \
      .vkf_notext  .vk_feed_text, \
      .vkf_nolinks .vk_feed_links,\
      .vkf_nogroup .vk_feed_group,\
      .vkf_nofriend .vk_feed_friend,\
      .vkf_norepost .vk_feed_repost{display:none !important}\
   ',
   inj:function(){
      Inj.Before('Feed.go','revertLastInlineVideo',"/*console.log('process go',rows);*/ rows=vkModAsNode(rows,vk_feed.process_node);")
      Inj.Before('Feed.update','var feed_rows','/*console.log("process update",rows);*/ rows=vkModAsNode(rows,vk_feed.process_node);')  
      
      Inj.Before('Feed.pushEvent','others.insertBefore(first','vkProcessNode(first);'); 
      Inj.Before('Feed.pushEvent','cont.insertBefore(frow','vkProcessNode(frow);');
      Inj.Before('Feed.pushEvent','cont.insertBefore(newEl','vkProcessNode(newEl);');
      //      
   },
   on_page:function(){
      //vkSortFeedPhotos();
      vk_feed.filter_init();
      vk_feed.new_list_btn();
   },
   process_node:function(node){
      if (!vk_feed.filter_enabled) return;
      var nodes=geByClass('feed_row',node);
      if (node && hasClass(node,'feed_row')) nodes=[node];
      
      var reprocess=[];
      var process=function(row){
         if (hasClass(row,'vk_feed_filter')) return;
         var inner=row.innerHTML;
         var types={
            photo :false,
            video :false,
            audio :false,
            graff :false,
            poll  :false,
            note  :false,
            repost:false,
            text  :false,
            links :false,
            friend:false,
            group :false
         };
         
         var p=geByClass('post',row)[0];
         var t=geByClass('wall_post_text',row)[0];
         if (p){ 
            var id=p.getAttribute('id');
            if (id.match(/-\d+/)) 
               types.group=true;
            else
               types.friend=true;
         }
         //Photo
         if (inner.indexOf("showPhoto('")!=-1) 
            types.photo=true;
         //Video
         if (inner.indexOf("showInlineVideo('")!=-1 || inner.indexOf("showVideo('")!=-1) 
            types.video=true;
         //Audio
         if (inner.indexOf("playAudioNew('")!=-1) 
            types.audio=true;
         // Graffiti
         if (inner.indexOf("'graffiti'")!=-1) 
            types.graff=true;  
         // Poll
         if (geByClass('page_media_poll_wrap',row)[0]) 
            types.poll=true;  
         // Note
         if (geByClass('note',row)[0]) 
            types.note=true;    
         // Repost
         if (geByClass('published_by',row)[0]) 
            types.repost=true;  
         //Text
         if (t) 
            types.text=true;
         
         //Links
         if (t && geByTag('a',t).length>0) 
            types.links=true;
         if (geByClass('group_share',row)[0]) // Group Share
            types.links=true;              
         var lnk=geByClass('lnk',row)[0];
         if (lnk){
            if (!geByClass('video',lnk)[0]) types.links=true;
         }
         
         var b=false;
         for (var key in types)
            if (types[key]){
               addClass(row,'vk_feed_'+key);
               b=true;
            }
         if (b) //console.log(row,row.innerHTML);
            addClass(row,'vk_feed_filter');
            //console.log(row.id);
      }
      
      for (var i=0; i<nodes.length; i++){
         var row=nodes[i];
         if (!geByClass('post',row)[0]){
            reprocess.push(row.id);
            continue;
         }
         process(row);
      } 
      if (reprocess.length>0){ // Frame loaded parts fix
         setTimeout(function(){
            
            for (var i=0; i<reprocess.length; i++){
               var row=ge(reprocess[i]);
               //console.log(reprocess[i],row)
               if (!row) continue;
               process(row);
            }         
         },2000);

      }
   },
   filter_enabled:false,
   filter_init:function(){
      var bit=84;
      var enabled=(getSet(bit)=='y');
      if (ge('vk_feed_filter'))
         ((cur.section=="articles")?hide:show)('vk_feed_filter');
      vk_feed.process_node();
      if (ge('vk_feed_filter') || cur.section=="articles") return;
      var p=ge('feed_progress');
      var div=vkCe('div',{'class':'fl_r', id:'vk_feed_filter'},'<div id="vkf_filter_chk"></div>'/*'<a href="#" onclick="">'+IDL('Filter')+'</a>'*/);
      p.parentNode.insertBefore(vkCe('span',{'class':'divide fl_r'},'|'),p);
      p.parentNode.insertBefore(div,p);
      
      
      p=ge('feed_summary_wrap');
      var panel=vkCe('div',{id:'vk_feed_filter_panel',style:'display:none;'});
      p.appendChild(panel);
      
      var cfg=(vkGetVal('vk_feed_filter') || '00000000000').split('');
      var items=[
         [IDL('with_photo'), 'photo', false],// 0    photo 
         [IDL('with_video'), 'video', false],// 1    video
         [IDL('with_audio'), 'audio', false],// 2    audio 
         [IDL('with_graff'), 'graff', false],// 3    graff 
         [IDL('with_poll'),  'poll',  false],// 4    poll  
         [IDL('with_note'),  'note',  false],// 5    note  
         [IDL('with_repost'),'repost',false],// 6    repost
         [IDL('with_text'),  'text',  false],// 7    text  
         [IDL('with_links'), 'links', false],// 8    links 
         [IDL('from_friend'),'friend',false],// 9    friend
         [IDL('from_group'), 'group', false] // 10   group 
      ];
      for (var i=0; i<items.length; i++){
         if (cfg[i]=='1') 
            items[i][2]=true;
      }
            
      var prefix='vkf_no';
      var fobj='feed_wall';
      
      var apply=function(){
         for (var i=0; i<items.length; i++){
            (items[i][2]?addClass:removeClass)(ge(fobj),prefix+items[i][1]);
         }
         var cfg=[]
         for (var i=0; i<items.length; i++){
            cfg.push(items[i][2]?'1':'0');
         }
         vkSetVal('vk_feed_filter',cfg.join(''));
      }
      var disable=function(){
         for (var i=0; i<items.length; i++)
            removeClass(ge(fobj),prefix+items[i][1]);
      }
      
      vk_feed.filter_enabled=enabled;
      if (enabled){
         show(panel);
         vk_feed.process_node();
         apply();
      }
      stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
         
         var cb = new Checkbox(ge("vkf_filter_chk"), {  
                     width: 100,  
                     checked:enabled,  
                     label: IDL('Filter'),
                     onChange: function(state) { 
                        var checked = (state == 1)?true:false;
                        setCfg(bit,checked?'y':'n');
                        if (checked){
                           vk_feed.filter_enabled=true;
                           show(panel);
                           vk_feed.process_node();
                           apply();
                        } else {
                           vk_feed.filter_enabled=false;
                           hide(panel);
                           disable();
                        }
                        
                     } 
                  });
                  
         panel.appendChild(vkCe('h4',{},IDL('HideFeedRows')));
         for (var i=0; i<items.length; i++){
            var el=vkCe('span',{'class':'fl_l'},'<div></div>');
            panel.appendChild(el);
            var chk=new Checkbox(el.firstChild, {  
                     width: 200,  
                     checked:items[i][2],  
                     label: items[i][0],
                     onChange: (function(idx){
                        return function(state){
                           var checked = (state == 1)?true:false; 
                           items[idx][2] = checked;
                           apply();
                        }
                     })(i)
               });
         }
                        
      });

   }, 
   new_list_btn:function(){
      var r=ge('filter_t_newlist');
      if (!r || ge('filter_t_vknewlist')) return;
      var el=se('<div class="feed_filter_tabs_row clear_fix feed_newlist_filter_row" id="filter_t_vknewlist" onmouseover="addClass(this, \'feed_filter_tabs_row_over\');" onmouseout="removeClass(this, \'feed_filter_tabs_row_over\');" onclick="vk_feed.new_list();">\
        <div class="feed_filter_tabs_icon fl_l feed_icon_newlist"></div>\
        <div class="feed_filter_tabs_title fl_l noselect" onselectstart="return false;">'+IDL('NewList',1)+'</div>\
        <div class="feed_filter_tabs_check fl_l"></div>\
      </div>');
      r.parentNode.appendChild(el);
      //vk_feed.new_list();
   },
   new_list:function(){
      var box = new MessageBox({title: IDL('NewList')});
      
      var users_list=[];
      
      var save = function(white,title) {
            var list_id = -1; // create new
            ajax.post('al_feed.php', {
               act: 'a_save_list',
               hash: cur.tabs_hash,
               White: white.join(','),
               title: title,
               list_id: list_id,
               no_reposts: 1
            }, {
               onDone: function(new_list_id) {
                  if (list_id > 0) {
                     Feed.switchList(list_id);
                  } else {
                     nav.go({
                        '0': 'feed',
                        section: 'list',
                        list: new_list_id
                     }, null, {
                        nocur: true
                     });
                  }
                  box.hide();
               },
               showProgress: box.showProgress,
               hiderogress: box.hideProgress
            });

      }
      
      var tpl='<a href="/%LINK" class="olist_item_wrap" id="olist_item_wrap%UID">\
        <div class="olist_item clear_fix">\
          <!--<span class="olist_checkbox fl_r"></span>-->\
          <span class="olist_item_photo fl_l">\
            <img class="olist_item_photo" src="%PHOTO" width="40" height="40">\
          </span>\
          <span class="olist_item_name fl_l">%NAME</span>\
        </div>\
      </a>';
      var search_group=function(gid){
         dApi.call('groups.getById',{group_id:gid},function(r){
            if (!r.response || !r.response[0]) return;
            var u=r.response[0];
            if (users_list.indexOf('-'+u.gid)!=-1) return;
            users_list.push('-'+u.gid);
            var el=se(tpl.replace(/%UID/g,u.gid)
               .replace(/%LINK/g,u.screen_name)
               .replace(/%PHOTO/g,u.photo)
               .replace(/%NAME/g,u.name));
            val('vk_feed_list_user','');   
            ge('vk_feed_users_list').appendChild(el);
         })
         
      }
      
      var search_user=function(){
         var v=val('vk_feed_list_user');
         var sn=v.split('#')[0].split('?')[0].split('/').pop();
         if (!sn) return;
         dApi.call('users.get',{user_ids:sn,fields:'photo_50,screen_name'},{
            ok:function(r){
               if (!r.response || !r.response[0]){ 
                  search_group(sn);
                  return;
               }
               var u=r.response[0];
               if (users_list.indexOf(u.uid)!=-1) return;
               users_list.push(u.uid);
               var el=se(tpl.replace(/%UID/g,u.uid)
                  .replace(/%LINK/g,u.screen_name)
                  .replace(/%PHOTO/g,u.photo_50)
                  .replace(/%NAME/g,u.first_name+' '+u.last_name));
               val('vk_feed_list_user','');   
               ge('vk_feed_users_list').appendChild(el);
            },
            error:function(r){ search_group(sn); }
         })
      }

      box.removeButtons();   
      box.addButton(getLang('box_no'),box.hide, 'no')
      box.addButton(getLang('box_save'),function(){
         save(users_list,val('vk_feed_list_title'));
      },'yes');
      box.content('<div>\
      <h2>'+IDL('ListTitle')+'</h2>\
      <input type="text" id="vk_feed_list_title" value="'+Math.round((new Date()).getTime()/1000).toString(36)+'" class="text" style="width:370px; margin-bottom:15px;">\
      <h2>'+IDL('LinkToUserOrGroup')+'</h2>\
      <div class="fl_r"><div class="button_blue" id="vk_feed_search_btn"><button><span class="vk_magglass_icon"></span></button></div></div>\
      <div><input type="text" id="vk_feed_list_user" class="text olist_filter" style="margin-top:2px; width: 305px;"></div>\
      <div id="vk_feed_users_list"></div>\
      </div>');
      stManager.add(['privacy.css','ui_controls.css','boxes.css']);
      box.show();
      
      var inp=ge('vk_feed_list_user');
      inp.onkeydown=function(ev){
        ev = ev || window.event;
        if (ev.keyCode == 10 || ev.keyCode == 13) {
          search_user();
          cancelEvent(ev);
        }
      }
      ge('vk_feed_search_btn').onclick=search_user;
   }
}

/* FEED */
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







function vk_tag_api(section,url,app_id){
   var t={
      section:section,
      page_url:url,
      app:app_id,
      widget_req:function(obj_id,like,callback){
         var app=t.app;
         var send=t.send;
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
            "h": "22"
         }; 
         var ret=0;
         var req=function(){
            AjPost(location.protocol+'//vk.com/widget_like.php',params,function(r,t){
               var _pageQuery=(t.match(/_pageQuery\s*=\s*'([a-f0-9]+)'/) || [])[1];
               var likeHash=(t.match(/likeHash\s*=\s*'([a-f0-9]+)'/) || [])[1];
               if (!_pageQuery || !likeHash){
                  if (ret<5 && t.match('db_err')){
                     ret++;
                     console.log('widget_req error... retry '+ret+'... ');
                     setTimeout(req,3000);
                  } else 
                     alert('Parse hash error');
                  return;
               }
               var like_params={
                  value:like?1:0,
                  hash:likeHash,
                  pageQuery:_pageQuery,
                  app:app
               };
               send(location.protocol+'//vk.com/widget_like.php?act=a_like',like_params,function(obj){
                  if (callback) callback(obj.num);
                  //alert(obj.num);
               });
               
            });
         }
         req();
      },
      send:function(url,params,callback){
         var send=t.send;
         var ret=0;
         var req=function(){
            AjPost(url,params,function(r,t){
               try { 
                  var obj=JSON.parse(t); 
               } catch (e) {
                  if (ret<5){
                     ret++;
                     console.log('send error... retry '+ret+'... ');
                     setTimeout(req,3000);
                  } else 
                     console.log('send error ',params);
                  return;
               }
               if (obj.ok && obj.ok==-2){
                  var difficulty = '';
                  if (obj.difficult === undefined) obj.difficult = 0;
                  if (obj.difficult !== undefined) {
                    difficulty = intval(r.difficult) ? '' : 's=1&';
                  }
                  var captcha_img = 'http://vk.com/captcha.php?'+difficulty+'sid='+obj.captcha_sid;
                  dApi.captcha(obj.captcha_sid, captcha_img, function(sid, key){
                     params['captcha_sid']=sid;
                     params['captcha_key']=key;
                     if (vk_api_captchaBox) vk_api_captchaBox.hide();
                     send(url,params,callback);
                  });
               } else {
                  callback(obj);
               }
            });
         }
         req();
      },
      parse_id:function(obj_id){
         //console.log('>>>',obj_id);
         var like_obj=obj_id;
         if (obj_id.match(/^([a-z_]+)(-?\d+)_(\d+)/)){
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
         t.widget_req(like_obj,true,function(num){
            t.get_users(like_obj,0,6,callback);
            t.widget_req(like_obj+'|'+vk.id,true,function(num){});// костыль
         });
         
      },
      unmark:function(obj_id,callback){
         var like_obj=t.parse_id(obj_id);
         t.widget_req(like_obj,false,function(num){
            t.get_users(like_obj,0,6,callback);
            t.widget_req(like_obj+'|'+vk.id,false,function(num){});// костыль
         });
         
      },
      get_users:function(obj_id,offset,count,callback){
         offset = offset || 0;
         count = count || 6;
         var like_obj=t.parse_id(obj_id);
         obj_id=like_obj;
         var url=t.page_url+t.section+'/'+obj_id;
         var code=''+
         'var like=API.likes.getList({type:"sitepage",page_url:"'+url+'",owner_id:"'+t.app+'",count:'+count+',offset:'+offset+'});'+
         'var users=API.users.get({uids:like.users,fields:"photo_rec"});'+
         'return {count:like.count,users:users,uids:like.users};'+
         '';
         //api_for_dislikes
         api4dislike.call('execute',{code:code},function(r,t){
            if (callback) callback(r.response);
         });
         //api4dislike.call('likes.getList',{type:'sitepage', page_url:url,owner_id:t.app},console.log)
      },
      get_tags:function(obj_ids,callback){
         var tmp=[];
         for (var i=0; i<obj_ids.length; i++){
            var like_obj=t.parse_id(obj_ids[i]);
            var url=t.page_url+t.section+'/'+like_obj;
            var a1='API.likes.getList({type:"sitepage",page_url:"'+url+'",owner_id:"'+t.app+'",count:1,offset:0}).count';
            var a2='API.likes.getList({type:"sitepage",page_url:"'+url+'|'+vk.id+'",owner_id:"'+t.app+'",count:1,offset:0}).count';
            tmp.push('"'+obj_ids[i]+'":{count:'+a1+',my:'+a2+'}');
         }
         var code='return {'+tmp.join(',')+'};';
         var retry_count=0;
         var get=function(){
            //api_for_dislikes
            api4dislike.call('execute',{code:code},{
                  ok:function(r,t){
                     if (callback) callback(r.response);
                  },
                  error:function(r,err){
                     console.log('api marks error',obj_ids,err)
                     retry_count++;
                     if (retry_count<5){
                        setTimeout(get,2000);
                        console.log('api marks error.. wait 2sec and retry.. code:'+err.error_code);
                     } else { 
                        console.log('api marks error',obj_ids,err)
                     }
                  }
            });
         }
         get();
      }
   }
   return t;
}




(function(){
   var dk={
      app_id:3395854,
      server:'http://dislike.server/like.php',
      ls_val:'dislike_auth',
      ids_per_req:5,//10,//20,
      delay:1000,
      cache_time:3 * 60 * 1000,// 3 min
      is_enabled:function(set){
         if (document.location.href.indexOf('vk_dislikes_enabled')>0) vkSetVal('vk_dislikes_enabled','true');
         
         var d=new Date(2013, 3, 1, 0, 0, 0, 0); // Activate at 00:00 of 1 April
         var cur_date=new Date();
         var enabled=(d<cur_date || vk_DEBUG || vkGetVal('vk_dislikes_enabled'));
         if (enabled && !set){
            enabled = (getSet(79) == 'y');
         }
         return enabled;    
      },
      lang:{
         'dislike':'\u041d\u0435 \u043d\u0440\u0430\u0432\u0438\u0442\u0441\u044f',
         'users_dislike':['', '\u041d\u0435 \u043f\u043e\u043d\u0440\u0430\u0432\u0438\u043b\u043e\u0441\u044c %s \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0443', '\u041d\u0435 \u043f\u043e\u043d\u0440\u0430\u0432\u0438\u043b\u043e\u0441\u044c %s \u043b\u044e\u0434\u044f\u043c','\u041d\u0435 \u043f\u043e\u043d\u0440\u0430\u0432\u0438\u043b\u043e\u0441\u044c %s \u043b\u044e\u0434\u044f\u043c'],
         'who_dislike':'\u041b\u044e\u0434\u0438, \u043a\u043e\u0442\u043e\u0440\u044b\u043c \u044d\u0442\u043e \u043d\u0435 \u043f\u043e\u043d\u0440\u0430\u0432\u0438\u043b\u043e\u0441\u044c'
      },
      tip_tpl:'\
         <div class="header" onclick="vk_dislike.show_users(\'%OBJ_ID%\')"><div class="like_head_wrap">\
         <span id="dislike_title_%OBJ_ID%">%USERS_DISLIKE%</span>\
         </div></div>\
         <div class="wrap"><div class="content">\
             <div class="hider disliked_users_loading" id="dislike_utable_%OBJ_ID%">\
               <table cellspacing="0" cellpadding="0" id="dislike_table_%OBJ_ID%" class="like_stats"></table>\
             </div>\
         </div></div>\
      ',
      icons:[// 0 - striked, 1 - broken, 2 - crossed, 3 - skull
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWCAYAAAAW5GZjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZZJREFUeNq00cFLlEEYx/FnZnbDQyIe1kOKtyCC3UCIQghKT+ZBEPwHAiG6iReFjhpBECVCdOzUZU8VBIHaLbrYIYOkllo8hAtS4KqXfefxO7uzMbt1aA898Hl5Z+Y38868YxafbJSsNavGSElVKt7riogctPrMZVXdoe82fV9yzpmnzrmr0qrRzPsxUTl0zo7QzvAqy7JfTHLWWleUpOgZiMEKbuA9mTc4a2n8kD/rBa6jhLcooGFZ/llXcBnzeIB15FW0jKMc4cccbJrDnGPgFurYwsU4eVe9v6e85HBIeEaM5I3ITdpr6Asp+r971TkRU2NMbJxd4wvHDM62g9QHVT/FjI/t/eWSvf5kcIZV7osxo4TuhEXSwxhWlH8tKz2Ujf/yJarYxAQuhZvDPjZwXlon1nfaWeFq9+J7AwsohOsO4br+vb7iGsbBn9GBnq47rHy3a8UlDOF50veo+dd49Md9VzGJK/iUBD/Hyc2wxMYw5nGSBL+hGDO/w8EgXifBbVxIxjvCwRk8RLn96dT/u+5TAQYAPhF/nBcROC4AAAAASUVORK5CYII=',
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWCAYAAAAW5GZjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAT9JREFUeNq00a1Lg1EUx/G7hyH+CYoiaDBZBoJBm8E2URGcyMCXaDWIBkGHmBYMGtwMggo6GGKw6cAi2Ay+gANBUJNpQQzX75lncHY1uOCBz3iec3539243tpgrxZ1zmxjAI+bxjEEsoBPn0pfgLqbcd/WgD61IYUj73WiK+Bh19dWCAubwZvojEi4H4U80ox8V03+Q8HoQzmIZl+gy/YyE93FsmhNIo2R68rtOIn0Zx6E+d2AYV/qex4w8RGZ1SreXakMSa5itBeLBeTO4wzRWcG2HMe+9+2tFroGK9ChbuEER7TqT6z7DPbarOY6x5+vrRY6GnaCfl2bF/6yCLng1vfeGrltWTwbfuoHEL7slnW53ZJpPyOLCnrf6F2tYHJhhWXeQytUyNiyWNPCBW6zaeRgWYzhFbzj7v+v+EmAAgNNAvzRggY0AAAAASUVORK5CYII=',
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWCAYAAAAW5GZjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAb9JREFUeNq00kFLVFEUwPFz3x0lMpOQUUgRWtSihYLpRkgoTEQXml8hhMhVuXWXWiCKCjEwZOLeVgXChKIbo01t3I2zECtoMAqkFuZ7p/8Zr/jc1cIDP5h77nnn3vfOuLHcWnMUuZxz0qoqpSTRCRH5Tm7SOdepqtvkHpIrZrx3F733iyxe4k6cJO2icuB91Mw6xts4jn/ykI+iyL8jEaEb78nUhcKSPYwP1BRwyYoO8RoPcB9LsAb30IoNZHGUof0yd3vK4gk6cDccn8cIuJWu4JcVz/NiAzxwlfw0enAZy7iFGk2SKeVHBgcUD4qTKifSz/oFqvCMfG+iekHElV14MYsyJ/xmczgUWvSpJjWi+iWsK51P4gebg3R5Ls61UPTImqT2xdFR/jUi+Y+wYhvAG+xiPXy6NpscvmEN1yvVXOMGhrCvx2Gj3Qu/j/AYWRu3Fe9iGDexpaexg9vowifUWXExbM6gEa9QwDWM4hCfYZ9Rx1PdNu04+0LIp/JzlrNPV8vVC7Bxj+JPGPdXLNi4wz+yLKFLA5owEo61mEJ9yFfqTorNFaymjv6IltT+mWJTjVmshNPO7J/fuP8KMABGD4HnBxnu0AAAAABJRU5ErkJggg==',
         'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWCAYAAAAW5GZjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAStJREFUeNqUka1OQ0EQhbeAbIKpaECQkPQ1EDhCgq7kx5D0DapQvAEEA0gkJS19ALjVrQGDwBEEoj+yheUbOLssN0C4k3yZO3POnbt7p+S9d82zG0dU4BQ2YR5e4Rr24OVwd80tuM+owgOU3VfYC1vwCDV4npNwkjOmUZbugtk+PYBl6KnXUz2QHs12nC48QaZeprorPZ75HpqwChvq7cMK1KXHycfKJizCjnI91YP5CDrJpc6T5470aLa4VD7I5dD/ZraLjOEWvPJY/Y8o2Qb/G+lkW/cVzDR5proSHTYZqjDxP8dEejS3/N/RSs1T6MMSZDJkqvvSi607TL7TtAsY6nmo2kuP5kbujNu5upGajfYvl2sHT6F1p5PtX45gHd6UR+EfG4XW/S7AABuBTwpSct69AAAAAElFTkSuQmCC'
      ],
      icon_index:3,
      auth_key:'',
      api_id:'',
      viewer_id:'',
      queue:[],
      last_req_ts:0,
      cache:{},
      init:function(){
         //dk.auth();
         if (!dk.is_enabled()) return;
         dk.storage=new vk_tag_api('dislike','http://vk.dislike.server/',3429306);
      },
      auth:function(callback){
         var auth_data=localStorage[dk.ls_val] || '{}';
         var auth_obj=null;
         try {
            auth_obj=JSON.parse(auth_data);
            if (auth_data.auth_key && auth_data.api_id && auth_data.viewer_id){
               dk.auth_key=auth_data.auth_key;
               dk.api_id=auth_data.api_id;
               dk.viewer_id=auth_data.viewer_id;
               if (callback) callback();
            } else {
               auth_obj=null;
            }
         } catch (e) {}
         dk.post('/app'+dk.app_id,{},function(t){
            var data=(t.match(/var params = (\{[^\}]+\})/)||[])[1]; // parse flash params
            var obj=JSON.parse(data);
            var auth_data={
               auth_key:obj.auth_key,
               api_id:obj.api_id,
               viewer_id:obj.viewer_id
            };
            dk.auth_key=auth_data.auth_key;
            dk.api_id=auth_data.api_id;
            dk.viewer_id=auth_data.viewer_id;
            localStorage[dk.ls_val]=JSON.stringify(auth_data);
            if (callback) callback();
         });
      },

      post:function(url,params,callback){
         AjPost(url,params,function(r,t){
            if (callback) callback(t);
         });
      },
      users_info:function(uids,callback){
         var res=[];
         var scan=function(){
            var ids=uids.splice(0,1000);// max 1000 uids in one request
            var params={
               oauth:1,
               method:'users.get',
               uids:ids.join(','),
               fields:'first_name,last_name,photo_rec'
            }
            if (ids.length>0)
               dk.post('/api.php',params,function(t){
                  var r=JSON.parse(t);
                  res=res.concat(r.response);
                  if (uids.length>0) 
                     setTimeout(scan,340);
                  else
                     callback(res);
               });
            else 
               callback(res);
         }
         scan();
      },
      req:function(params,callback){
         if (params.likes!=null){
            var arr=params.likes.split(',');
            dk.storage.get_tags(arr,function(r){
               var data={};
               for (var key in r){
                  data[key]= r[key].count*(r[key].my==1?-1:1);
               }
               callback(data);
            });
         }
         if (params.object!=null){
           var gu=function(){
            dk.storage.get_users(params.object,params.offset || 0, params.limit || 6,function(r){
                  callback({"users":r.uids,"count": r.count});
            });
           }
           if (params.action!=null){
               (params.action==1?dk.storage.mark:dk.storage.unmark)(params.object,gu);
           } else gu();
         }
         return;
         /*
         var ts=Math.round(new Date().getTime());
         if (ts-dk.last_req_ts<dk.delay){ // проверка времени последнего запроса
            setTimeout(function(){
               dk.req(params,callback);
            },dk.delay);// или может сделать паузу = dk.delay-(ts-dk.last_req_ts)
            return;
         }
         if (!(dk.auth_key && dk.api_id && dk.viewer_id)){ // нужна авторизация
            dk.auth(function(){
               setTimeout(function(){
                  dk.req(params,callback);
               },dk.delay);
            });
            return;
         }
         
         params = params || {};
         params.auth=dk.auth_key;
         params.app=dk.api_id;
         params.uid=dk.viewer_id;
         dk.post(dk.server,params,function(t){
            var obj=JSON.parse(t);
   
   
            if (obj['delay']){ // delay before next query in seconds
               dk.delay=obj['delay']*1000;
               delete obj['delay'];
            }
            if (obj['status']){ 
               if(obj['status'] == -1){  //auth error 
                  localStorage[dk.ls_val]='{}';// reset auth settings
                  dk.auth(function(){
                     setTimeout(function(){
                        dk.req(params,callback);
                     },dk.delay);
                  });
                  return;
               }
               delete obj['status'];
            }                           
            if (callback){
               callback(obj);
            }
         });
         */
      },
      get_dislikes:function(obj_ids){ // пополнение очереди на обработку
         var need_run = (dk.queue.length===0); // если очередь была пустая, то нужно запустить получение инфы
         
         var cached=[];
         var uncached=[];
         for (var i=0; i<obj_ids.length;i++){// отделяем кэшированные от новых
            (dk.in_cache(obj_ids[i])?cached:uncached).push(obj_ids[i]);
         }
         //console.log('uncached:',JSON.stringify(uncached));
         //console.log('cached:',JSON.stringify(cached));
         setTimeout(function(){
            for (var i=0; i<cached.length;i++){
               var r=dk.update_dislike_view(cached[i],dk.cache[cached[i]].value);
            }
         },50);
         //dk.queue=dk.queue.concat(uncached); // новые в конец очереди
         dk.queue=uncached.concat(dk.queue); //новые в начало очереди
         if (need_run) {
            clearTimeout(dk.timeout);
            dk.timeout=setTimeout(dk.load_dislikes_info,300);
         }
      },
      in_cache:function(obj_id){
         if (dk.cache[obj_id]){
            var ts=Math.round(new Date().getTime());
            if (ts-dk.cache[obj_id].ts <= dk.cache_time)
               return true;
         }
         return false; 
      },
      add_to_cache:function(obj_id,val){
         var item={
            value:val,
            ts:Math.round(new Date().getTime())
         };
         dk.cache[obj_id]=item;
      },
      load_dislikes_info:function(){
         var load=function(){
            /* чистим очередь от id, которых нет на странице. Имеет смысл раскомметить, если всегда идёт обработка только реально размещённых элементов страницы
            for (var i=dk.queue.length-1; i>=0;i--){ 
               if (!ge('dislike_count'+dk.queue[i])){
                  var deleted=dk.queue.splice(i,1);
                  console.log('deleted',deleted);
               }
            }*/
            var ids=dk.queue.splice(0,dk.ids_per_req);
            var need_continue = (dk.queue.length>0); // если очередь не пустая, то после текущей пачки, нужно обработать следущую
            dk.req({likes:ids.join(',')},function(data){
               //for (var i=0; i<ids.length;i++) ge('dislike_icon'+ids[i]).style.boxShadow="0 0 5px 2px #F00";
               
               for (var obj_id in data){
                  dk.add_to_cache(obj_id,data[obj_id]);
                  dk.update_dislike_view(obj_id,data[obj_id]);
               }
               if (need_continue){
                  //console.log('continue load info',ids,dk.queue);
                  setTimeout(load,dk.delay);
               }
            });
         };
         load();
      },
      update_dislike_view:function(obj_id,val,c){
         var el=ge('dislike_count'+obj_id);
         if (!el){
            //--костыль--// Если всегда обрабатывать только то, что уже выведено на страницу, то он не нужен
            c = c || 0;
            if (c<10) setTimeout(function(){ dk.update_dislike_view(obj_id,val,c+1) },300)
            //-----------
            return false;
         }
         var my=val<0;
         val=Math.abs(val);
         if (val>0)
            ge('dislike_count'+obj_id).innerHTML=val;
         (my?addClass:removeClass)(ge('dislike_icon' + obj_id),'my_dislike');
         (val>0?removeClass:addClass)(ge('dislike_icon' + obj_id),'no_dislikes'); 
         return true;
      },
      get_dislike_element:function(obj_id,count, my_dislike){
           //if (obj_id=='wiki')
           // this.getAttribute(\'dislike_id\') - да-да... я не знаком с data- атрибутами
           return se(
              (obj_id=='wiki'?'<div class="button_gray fl_l"><button':'<div')+' dislike_id="'+obj_id+'" class="post_dislike fl_r" onclick="vk_dislike.dislike(this.getAttribute(\'dislike_id\'));" onmouseover="vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
                <span class="post_dislike_link fl_l" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</span>\
                <i class="post_dislike_icon no_dislikes fl_l'+(my_dislike?' my_dislike':'')+'" id="dislike_icon'+obj_id+'"></i>\
                <span class="post_dislike_count fl_l" id="dislike_count'+obj_id+'">'+(count|| '')+'</span>\
              '+(obj_id=='wiki'?'</button></div>':'</div>')
           );
      },
      types:{ // getting like_id from scripts
         wiki:function(){return wkcur.like_obj},
         photo:function(){
            var listId = cur.pvListId, index = cur.pvIndex, ph = cur.pvData[listId][index];   
            return  'photo' + ph.id
         },
         video:function(){
            var mv = mvcur.mvData;
            if (mvcur.statusVideo) {
               var object = 'wall' + mv.videoRaw;
            } else {
               var object = 'video' + mv.videoRaw;
            }
            return object;
         }
      },
      process_node:function(node){
         if (!dk.is_enabled()) return;
         node = node || geByTag('body')[0];
         var attrs=['onclick','onmouseover','onmouseout'];
         var obj_ids=[];
         
         var add=function(el,insert_type){
            var types=dk.types;
            
            if (hasClass(el,'has_dislike')) return;
            addClass(el,'has_dislike');
            
            if (el.parentNode.hasAttribute(attrs[0])){ //need move arguments from post_like_wrap  to post_like
               var p=el.parentNode;
               for (var j=0; j<attrs.length; j++){
                 var at=p.getAttribute(attrs[j]);
                 p.removeAttribute(attrs[j]);
                 el.setAttribute(attrs[j],at);
               }
            }
            
            var obj_id=null;
            if (types[insert_type]){
               obj_id=insert_type;
               setTimeout(function(){ // а на странице то ещё нет айдишника заныканного в скрипты...
                 var dislike_id=types[insert_type]();
                 var ids=['post_dislike','dislike_link','dislike_icon','dislike_count'];
                 for (var i=0;i<ids.length; i++){
                     var _el=ge(ids[i]+insert_type);
                     if (!_el) continue;
                     if (ids[i]=='post_dislike') _el.setAttribute('dislike_id',dislike_id);
                     if (_el) _el.id=ids[i]+dislike_id;
                 }
                 dk.get_dislikes([dislike_id]); 
               },400)
            } else {
               obj_id=(geByTag('i',el)[0] || {}).id;
               if (!obj_id) return;
               obj_id=obj_id.split('like_icon')[1];
               obj_ids.push(obj_id);
            }
            
            var dislike=dk.get_dislike_element(obj_id);
            switch(insert_type){
               case 'before':
                  el.parentNode.insertBefore(dislike,el);
                  break;
               case 'wiki':
                  insertAfter(dislike,el); 
                  break;
               case 'photo':
               case 'video':
                  el.parentNode.insertBefore(dislike,el);
                  break;                  
               default:
                  insertAfter(dislike,el);         
            }
            
               
         }
         
         var els=geByClass('post_like',node);
         for (var i=0; i<els.length;i++){
            add(els[i]);
         }
         els=geByClass('like_wrap',node);
         for (var i=0; i<els.length;i++){
            add(els[i]);
         }
         els=geByClass('fw_like_wrap',node);
         for (var i=0; i<els.length;i++){
            add(els[i],'before');
         }
         
         els=geByClass('wl_post_like_wrap',node);
         for (var i=0; i<els.length;i++){
            add(els[i],'wiki');
         }  
         
         
         //var els=document.evaluate('//div[@id="pv_like_wrap"]', node || document, null, 7, null);// костыль, а не getElementById...
         //console.log(els,els.length);
         //if ()
            
         //*
        // for (var i=0; i<els.length;i++){
          //  alert(els[i]);
         if (node.innerHTML.indexOf('pv_like_wrap')>-1 && ge('pv_like_wrap'))
            add(ge('pv_like_wrap'),'photo');
         if (node.innerHTML.indexOf('mv_like_wrap')>-1 && ge('mv_like_wrap'))
            add(ge('mv_like_wrap'),'video');
         
         if (obj_ids.length>0)
            dk.get_dislikes(obj_ids);
      },
      dislike:function(obj_id){
         var pid=obj_id.match(/wall(-?\d+_\d+)/);
         pid=pid?pid[1]:null;
         
         var p=ge('post'+obj_id);
         
         if (!p && pid){ // find repost in wall wiki view
            p=ge('wpt'+pid);
            if (p) p=p.parentNode;
         }
         var parent_post=null;
         if (p){
            var repost=(geByClass('published_by_date',p,'a')[0]||{}).href;
            if (repost){
               parent_post=repost.match(/[a-z]+-?\d+_\d+/)[0];
            }
         }
         var icon = ge('dislike_icon' + obj_id);
         var count = parseInt(trim(ge('dislike_count' + obj_id).innerHTML) || 0);
         var my = hasClass(icon,'my_dislike');
         
         // Request moved to function dislike_over
         //dk.req({object_id:obj_id, act:(my?'undislike':'dislike')},function(t){});
         
         var new_count=count + ( my ? -1 : 1);
         animateCount(ge('dislike_count'+obj_id), new_count);

         (my?removeClass:addClass)(icon,'my_dislike');
         (new_count>0?removeClass:addClass)(icon,'no_dislikes');
         
         setTimeout(function(){
            dk.dislike_over(obj_id,parent_post,my?'undislike':'dislike');         
         },400);        

      },
      dislike_out:function(post){
         var icon = ge('dislike_icon' + post);
         triggerEvent(icon.parentNode, 'mouseout');
      },
      dislike_over:function(post,parent,act){
         var icon = ge('dislike_icon' + post),
            link = ge('dislike_link' + post),
            count = ge('dislike_count' + post);
         var item_tpl='<td><a class="like_tt_usr" title="%NAME%" href="/id%UID%"><img class="like_tt_stats_photo" src="%AVA%" width="30" height="30" /></a></td>';
         
         var cnt=parseInt(count.innerHTML) || 0;
         html=dk.tip_tpl.replace(/%OBJ_ID%/g,post)
                        .replace(/%USERS_DISLIKE%/g,langNumeric(cnt,IDL('users_dislike')));

         var data=null;
         var tip_ready = (icon.parentNode.tt &&  icon.parentNode.tt!= 'loadingstat');
         
         var params={object:post, limit:6};
         if (act){
            params['action']=(act=='dislike')?1:0;
            params['parent']=parent;
         }
         var load_info = function(){ // Get Who Liked
            //console.log('load_info',act);
            dk.req(params,function(info){
               if (act){
                  var m=(act=='dislike')?-1:1;
                  dk.add_to_cache(post,info.count*m);
               }
               animateCount(count, info.count);// UPDATE COUNTER
               dk.users_info(info.users,function(users){
                  data={users:users,count:info.count};
                  view_info(data);
               })
            })
         }
         var view_info=function(info){
            if (!tip_ready) tip_ready=!!ge('dislike_table_'+post);
            if (!info || !tip_ready) return;
            removeClass('dislike_utable_'+post, 'disliked_users_loading');
            var html='';
            var users=info.users || [];
            for (var i=0; i<users.length;i++){
               html+=item_tpl.replace(/%NAME%/g,users[i].first_name+' '+users[i].last_name)
                             .replace(/%UID%/g,users[i].uid)
                             .replace(/%AVA%/g,users[i].photo_rec);
            }
            html='<tr>'+html+'</tr>';
            ge('dislike_table_'+post).innerHTML=html;
            ge('dislike_title_'+post).innerHTML=langNumeric(info.count,IDL('users_dislike'));
            vkProcessNode(ge('dislike_table_'+post));
         }
         if (cnt>0 || act){
            if (!tip_ready || act) load_info();
            dk.tip(post,html,function(){ 
               tip_ready=true; 
               view_info(data); 
               var tip=icon.parentNode.tt;
               if (!tip.inited) {
                   tip.onClean = function() {
                     tip.inited = false;
                     if (tip.over) removeEvent(tip.container, 'mouseover', tip.over);
                     if (tip.out) removeEvent(tip.container, 'mouseout', tip.out);
                   }
                   if (tip.over) addEvent(tip.container, 'mouseover', tip.over);
                   if (tip.out) addEvent(tip.container, 'mouseout', tip.out);
                   tip.inited = true;
               }
            });
         }
         if (cnt==0 && act && icon.parentNode.tt) icon.parentNode.tt.hide();
      },
      tip:function(post,content,oncreate){
         /*Далее куча копипаста с лайков вк*/
         var icon = ge('dislike_icon' + post),
            link = ge('dislike_link' + post),
            count = ge('dislike_count' + post),
            linkW = link.clientWidth || link.offsetWidth, 
            leftShift = (link.parentNode == icon.parentNode ? 0 : linkW), 
            pointerShift = false, 
            ttW = 230, 
            x = getXY(icon.parentNode)[0];
            
         if (x + ttW + 20 > lastWindowWidth) {
            leftShift = ttW - (icon.parentNode.clientWidth || icon.parentNode.offsetWidth) + 7;
            pointerShift = ttW - (count.clientWidth || count.offsetWidth) - 14;
         } else {
            leftShift = (link.parentNode == icon.parentNode ? 0 : linkW);
            pointerShift = linkW + 8;
         }
            
         showTooltip(icon.parentNode, {
            slide: 15,
            shift: [leftShift, 7, 7],
            showdt: 400,
            hidedt: 200,
            content:content,
            tip: {
               over: function() {
                  Wall.postOver(post);
               },
               out: function() {
                  Wall.postOut(post);
               }
            },
            className: 'rich like_tt ',
            onCreate:oncreate,
            onShowStart: function(tt) {
               if (!tt.container || pointerShift === false)
                  return;
               var bp = geByClass1('bottom_pointer', tt.container, 'div');
               var tp = geByClass1('top_pointer', tt.container, 'div');
               setStyle(bp, {
                  marginLeft: pointerShift
               });
               setStyle(tp, {
                  marginLeft: pointerShift
               });
               //vkProcessNode(tt.container);
            }
         });
      },
      show_users:function(post){
         var box=showFastBox({title:IDL('who_dislike'),width:'478px',progress:'progress'+post},'<div id="dislike_list'+post+'" class="dislike_list"></div>'); 
         box.setOptions({bodyStyle: 'padding: 0px; height: 310px;', width: 478});
         addClass(ge('dislike_list'+post),'disliked_users_big_loader');
         stManager.add('boxes.css');
         dk.show_dislikes_page(post,0,box);
      },
      show_dislikes_page:function(post,offset){
         var PER_PAGE=24;
         var IN_ROW=8;
         
         var params={object:post, limit:PER_PAGE, offset:offset};
         
         var item_tpl='\
            <td><div class="liked_box_row">\
               <div class="liked_box_thumb"><a href="/id%UID%" onclick="return nav.go(this, event)"><img width="50" height="50" src="%AVA%"></a></div>\
               <div><a href="/id%UID%" onclick="return nav.go(this, event)">%NAME%</a></div>\
            </div></td>\
         ';
         
         var cont_tpl='\
            <div style="padding: 7px 5px 5px;">\
              <div class="fl_r" style="padding:0 5px;width:200px;">%PAGE_LIST%</div>\
              <h4 style="border-bottom: 1px solid #DAE1E8;margin:0 5px 10px;padding:5px 0 2px;">%TITLE%</h4>\
              <table cellpadding="0" cellspacing="0">\
                <tbody>%USERS%</tbody>\
              </table>\
            </div>\
         ';
         
         var page_list=function(cur,end,href,onclick,step,without_ul){
            var after=2;
            var before=2;
            if (!step) step=1;
            var html=(!without_ul)?'<ul class="page_list fl_r">':'';
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
         
         var data=null;
         var load_info = function(){ // Get Who Liked
            show('progress'+post);
            dk.req(params,function(info){
               dk.users_info(info.users,function(users){
                  data={users:users,count:info.count};
                  view_info(data);
               })
            })
         }
         var view_info=function(info){
            removeClass(ge('dislike_list'+post),'disliked_users_big_loader');
            hide('progress'+post);
            var html='';
            var users=info.users;
            for (var i=0; i<users.length;i++){
               html+=item_tpl.replace(/%NAME%/g,users[i].first_name)
                             .replace(/%UID%/g,users[i].uid)
                             .replace(/%AVA%/g,users[i].photo_rec);
               html+=((i+1)%IN_ROW==0)?'</tr><tr>':'';
            }
            html='<tr>'+html+'</tr>';
            
            var pg='';
            if (info.count>PER_PAGE){
               pg=page_list(Math.ceil(offset/PER_PAGE),Math.ceil(info.count/PER_PAGE)-1,'#',"return vk_dislike.show_dislikes_page('"+post+"',%%)",PER_PAGE);
            }
            
            html=cont_tpl.replace(/%PAGE_LIST%/g,pg)
                         .replace(/%TITLE%/g,langNumeric(info.count,IDL('users_dislike')))
                         .replace(/%USERS%/g,html);
            ge('dislike_list'+post).innerHTML=html;
            vkProcessNode(ge('dislike_list'+post));
         }
         load_info();         
         return false;
      },
      css:function(){
         vk_dislike.icon_index = parseInt(getSet(83));
         if (!vk_dislike.icon_index && vk_dislike.icon_index!=0) 
            vk_dislike.icon_index=3;
         var code="\
         dislikes_icons{padding:1px;}\
         .dislikes_icons a{float:left;opacity:0.5;}\
         .dislikes_icons a:hover{opacity:1;}\
         .dislike_icon_0 .dislike_icon_striked,\
         .dislike_icon_1 .dislike_icon_broken,\
         .dislike_icon_2 .dislike_icon_crossed,\
         .dislike_icon_3 .dislike_icon_skull{opacity:1;}\
         .post_dislike_icon{background:url('"+vk_dislike.icons[vk_dislike.icon_index]+"') 1px 0px no-repeat transparent;      height:10px;      margin:2px 2px 0px;      opacity:0.4;      padding-right:1px;      width:11px;   }\
         .post_dislike_icon.dislike_icon_striked{background-image:url('"+vk_dislike.icons[0]+"')}\
         .post_dislike_icon.dislike_icon_broken{background-image:url('"+vk_dislike.icons[1]+"')}\
         .post_dislike_icon.dislike_icon_crossed{background-image:url('"+vk_dislike.icons[2]+"')}\
         .post_dislike_icon.dislike_icon_skull{background-image:url('"+vk_dislike.icons[3]+"')}\
         ";

         code += !dk.is_enabled()?"":"\
         .antilike,#al_adv_side{display:none !important}\
         .disliked_users_loading{background: url(http://vk.com/images/upload_inv_mono.gif) no-repeat 50% 50%;}\
         .disliked_users_big_loader{background-image: url(http://vk.com/images/progress7.gif); background-repeat:no-repeat; background-position:50% 50%;}\
         .dislike_list{height:100%}\
         \
         .post_dislike_icon,.post_dislike_count,.post_dislike_link{\
           -webkit-transition: opacity 200ms linear;\
           -moz-transition: opacity 200ms linear;\
           -o-transition: opacity 200ms linear;\
           transition: opacity 200ms linear;\
         }\
         .post_dislike_count{color:#7295B2;      font-weight:700;    }\
         .post_dislike{background:rgba(255,255,255,0);      border-radius:3px;      color:#2F5879;      cursor:pointer;      font-size:10px;      margin-top:-1px;      overflow:hidden;      padding:5px 6px;      right:0px;      white-space:nowrap;   }\
         .post_dislike_link{color:#829BAF;   }\
         .wall_module .post_dislike:hover{background:rgba(158, 166, 173, 0.2);;   }\
         .wall_post_over .post_dislike_link,.wall_module .post:hover .post_dislike_link{color:#2F5879;   }\
         .post_full_like_wrap .post_dislike{position:static;   }\
         .post_dislike_link{display:none;   }\
         .my_dislike.post_dislike_icon{opacity:1;   }\
         .wide_wall_module .post_dislike_link{display:inline;   }\
         .wide_wall_module .post_dislike{font-size:11px;   }\
         .wide_wall_module .post_share_link{display:none !important;   }\
         .wide_wall_module .post_like{position:static;float:right; }\
         .wide_wall_module .post_like_wrap, .post_full_like_wrap{width:300px !important;   }\
         .wall_module .reply_info .like_link,.wall_module .reply_info .post_dislike_link{   display:none !important; }\
         .wall_module .reply_info .post_dislike{padding: 1px 6px; }\
         .wall_module .reply_info .post_dislike:hover {  background:transparent; }\
         .wall_module .reply_info .post_dislike .post_dislike_icon{  margin-top: 3px; }\
         .wall_module .reply .reply_info .post_dislike_icon{opacity:0.4;   }\
         .wall_module .reply .reply_info .no_dislikes.post_dislike_icon{opacity:0;   }\
         .wall_module .reply:hover .reply_info .post_dislike_icon{opacity:0.4;   }\
         .wall_module .reply_info .post_dislike:hover .post_dislike_icon,.wall_module .reply_info .post_dislike .my_dislike.post_dislike_icon{opacity:1;   }\
         #fw_post_wrap .post_dislike{ padding: 1px 6px 0px;}   \
         #fw_post_wrap .fw_post_info .post_dislike{float:left}\
         #fw_post_wrap .post_dislike .post_dislike_link{opacity:1; color: #2F5879; display:inline;} \
         #fw_post_wrap .post_dislike .post_dislike_link, #fw_post_wrap .post_dislike .post_dislike_count{font-size:11px;}\
         #fw_post_wrap .fw_post_info .post_dislike .post_dislike_link, #fw_post_wrap .fw_post_info .fw_like_link{display:none;}\
         #fw_post_wrap .post_dislike:hover .post_dislike_icon{opacity:1;}\
         /*#fw_post_wrap .post_dislike .post_dislike_icon.no_dislikes{opacity:0;}*/\
         #fw_post_wrap .post_dislike:hover{background:transparent;}\
         #wl_post .post_dislike_link{display:inline; color: #2F5879;}\
         #wl_post .post_dislike_icon{opacity:0.5}\
         #wl_post .post_dislike:hover .post_dislike_icon, #wl_post .post_dislike .my_dislike.post_dislike_icon{   opacity:1;}\
         #pv_wide .post_dislike:hover .post_dislike_icon { opacity:1;}\
         #pv_wide .post_dislike{float:left; padding: 1px 6px;}\
         #pv_like_link{display:none;}\
         \
         #pv_wide .pv_comment .post_dislike{float:right; margin: 4px 1px 0px; padding: 0px 6px;}\
         #photos_container .pv_comment .post_dislike{margin: 0px 1px 0px !important; padding: 0px 6px; }\
         #pv_wide .pv_comment .post_dislike:hover,.pv_comment .post_dislike:hover{background:transparent;}\
         .pv_comment .no_dislikes.post_dislike_icon{opacity:0;}\
         .pv_comment:hover .no_dislikes.post_dislike_icon{opacity:0.4;}\
         .pv_comment .like_link{display:none !important;}\
         \
         #mv_comments .mv_comment .post_dislike{float:right; margin: 4px 1px 0px; padding: 0px 6px;}\
         #mv_comments .mv_comment .post_dislike:hover{background:transparent;}\
         #mv_wide .mv_comment .post_dislike_link{display:none;}\
         .mv_comment .no_dislikes.post_dislike_icon{opacity:0;}\
         .mv_comment:hover .no_dislikes.post_dislike_icon{opacity:0.4;}\
         .mv_comment .like_link{display:none !important;}\
         .review_comment .post_dislike{margin: 0px 1px 0px !important; padding: 0px 6px !important;}\
         .review_comment .post_dislike:hover{background:transparent;}\
         .review_comment .post_dislike:hover .post_dislike_icon{opacity:0.9;}\
         \
         #mv_wide .post_dislike_link {display:inline; font-size:11px; opacity:1; color: #2F5879; }\
         #mv_controls_line .post_dislike .post_dislike_icon, #mv_controls_line .post_dislike_link, #mv_controls_line .post_dislike_count  { opacity:0.4;}\
         #mv_controls_line .post_dislike:hover .post_dislike_icon, #mv_controls_line .post_dislike:hover .post_dislike_link, #mv_controls_line .post_dislike:hover .post_dislike_count { opacity:1;}\
         #mv_controls_line .post_dislike .my_dislike.post_dislike_icon{opacity:0.9;}\
         #mv_controls_line .post_dislike{float:left; padding: 1px 6px; background:transparent;}\
         #mv_controls_line .post_dislike_link, #mv_controls_line .post_dislike_count {display:inline; font-size:11px; color: #FFF; }\
         #mv_controls_line .post_dislike_icon{ background-position:1px -11px;}\
         \
         #bt_rows .bp_post .post_dislike{float:right; margin: 0px 1px; padding: 0px 1px;}\
         #bt_rows .bp_post .post_dislike:hover{background:transparent;}\
         #bt_rows .bp_post .post_dislike_link{display:none;}\
         .bp_post .no_dislikes.post_dislike_icon{opacity:0;}\
         .bp_post:hover .no_dislikes.post_dislike_icon{opacity:0.4;}\
         .bp_post .like_link{display:none !important;}\
         #bt_rows .post_dislike:hover .post_dislike_icon{ opacity:1;}\
         ";
         return code;
      }
   };
   window.vk_dislike=dk;
})();

if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
   var PLUGIN_ID = 'vk_dislikes';
   var PLUGIN_NAME = 'vk dislike plugin';   
   
   vkopt_plugins[PLUGIN_ID]={
      Name:PLUGIN_NAME,
      css:              vk_dislike.css,
      init:             vk_dislike.init,                    // function();                        //run on connect plugin to vkopt
      processNode:      vk_dislike.process_node                    // function(node);
   };
   if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();


/*
// GIFTS. ANONIM SEND
if (!window.vkopt_plugins) vkopt_plugins={};
(function(){ 
   vkopt_plugins['vk_anonim_gift']={
      Name:'vk_anonim_gift',
      css:'',
      onLibFiles:function(js){
         if (js!='gifts.js') return;
         Inj.Before("Gifts.sendGift","isChecked('gift_receiver_only')",'arguments[Gifts.sendGift.length]==2?2:');
         Inj.Before("Gifts.selectGift","box.setControlsText","box.addButton('Anonim send', function(){Gifts.sendGift(2)}, 'no');");
      }   
   };
   if (window.vkopt_ready) vkopt_plugin_run('vk_anonim_gift');
})();
*/


if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;