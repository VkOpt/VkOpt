// ==UserScript==
// @name          Vkontakte Optimizer module
// @description   (by KiberInfinity id13391307)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==

/*!
	profiles, walls, graffity from file and  etc.
*/



/* PROFILE */
function vkProfilePage(){
	
	if (ge('vk_profile_inited')) return;
	ge('profile_info').appendChild(vkCe('input',{type:'hidden',id:'vk_profile_inited'}));
	//if (getSet(24) == 'y') vkAvkoNav();
	if (getSet(25) == 'y') status_icq(ge('profile_full_info'));
	if (getSet(26) == 'y') vkProcessProfileBday(); //VkCalcAge();
	vkPrepareProfileInfo();
	addFakeGraffItem();
   //vkWallAddPreventHideCB();
	vkUpdWallBtn(); //Update wall button
   vkWallNotesLink();
   if (cur.oid!=vk.id) vkWallTatLink();
   if (remixmid()==cur.oid && getSet(50)=='y' && !ge('profile_fave')) vkFaveProfileBlock(); 
   if (getSet(60) == 'y') vkProfileMoveAudioBlock(); 
   if (getSet(61) == 'y') vkProfileGroupBlock();   
	if (MOD_PROFILE_BLOCKS) vkFrProfile();
   //if (getSet(65)=='y') vkShowLastActivity()
	if (getSet(46) == 'n') vkFriends_get('online');
	if (getSet(47) == 'n') vkFriends_get('common');
   
   vkAddCheckBox_OnlyForFriends();
	vkHighlightGroups();
}

function vkAddCheckBox_OnlyForFriends(){
   if (cur.oid!=remixmid() || ge('friends_only') ) return;
   var p=ge('page_add_media');
   if (!p) return;
   var cb=vkCe('div',{"class":"checkbox fl_l","id":"friends_only","onclick":"checkbox(this);checkbox('status_export',!isChecked(this));checkbox('facebook_export',!isChecked(this));"},'<div></div>'+IDL('OnlyForFriends'))
   p.parentNode.insertBefore(cb,p);
}

function vkProfile(){
	Inj.After('profile.init','});','setTimeout("vkProcessNode();",2);');
	Inj.End('profile.init','setTimeout("vkOnNewLocation();",2);');
}

function vkWallTatLink(){
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
}
function vkWallNotesLink(get_count){
   if (get_count){
         dApi.call('execute',{code:'return API.notes.get({uid:'+cur.oid+', count:1})[0];'},function(r){ 
            ge('pr_notes_count').innerHTML=(r.response || '0');
         });
   }
   
   /*
   if (ge('vk_wall_notes_link')) return;
   if (isVisible('page_wall_switch'))  ge('page_wall_header').appendChild(vkCe('span',{"class":'fl_r right_link divide'},'|'))
   var href=ge('page_wall_header').getAttribute('href');
   ge('page_wall_header').appendChild(vkCe('a',{
               "class":'fl_r right_link', 
               id:'vk_wall_notes_link',
               href:'/notes'+cur.oid,
               onclick:"cancelEvent(event); return nav.go(this, event);",
               onmouseover:"this.parentNode.href='/notes"+cur.oid+"';",
               onmouseout:"this.parentNode.href='"+href+"';"
            },IDL('clNo',1)))*/
   html='<a class="notes" onclick="return nav.go(this, event);" href="/notes'+cur.oid+'" onmouseover="vkWallNotesLink(true);">\
   <span class="fl_r thumb"></span><span class="fl_r" id="pr_notes_count"></span>'+IDL('clNo',1)+'</a>';
   if (ge('profile_counts') && !ge('pr_notes_count')){
      ge('profile_counts').appendChild(vkCe('div',{},html));
   }         
  
}

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
function vkHighlightGroups(){
	var common=(getSet(39) == 'y');
	if (ge('profile_groups') && geByClass('module_body',ge('profile_groups'))[0]){
		var nodes=geByClass('module_body',ge('profile_groups'))[0].getElementsByTagName('a');
		if (cur.oid==remixmid()){
			var mygr=[];
			for (var i=0;i<nodes.length;i++){
				var href=nodes[i].getAttribute('href');
				if (!href) continue;
				var id=href.split('/');	
				id=id[id.length-1];
				if (id!=''){
					mygr.push(id);
				}
				if (isGroupAdmin(id))	addClass(nodes[i],'vk_adm_group');
			}
			var groups=mygr.join(',');
			vkSetVal('vk_my_groups',groups);
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
}

/*WALL*/
function vkWallPage(){
	addFakeGraffItem();
   //vkWallAddPreventHideCB();
	vkAddCleanWallLink();
	vkAddDelWallCommentsLink();
   vkWallPhotosLinks();
}
function vkWallPhotosLinks(){
   var el=geByClass('fw_post_info')[1];
   //alert(cur.oid +'\n'+ cur.pid +'\n'+ el +'\n'+ !ge('vk_wall_ph_links') +'\n'+ geByClass('page_media_full_photo')[0]);
   if (cur.oid && cur.pid && el && !ge('vk_wall_ph_links') && geByClass('page_media_full_photo')[0]){
      var listId='wall'+cur.oid+'_'+cur.pid;
      el.insertBefore(vkCe('a',{id:'vk_wall_ph_links', "class":"fl_r","onclick":"vkGetLinksToPhotos('"+listId+"')"},IDL('Links')),el.firstChild);
      //vkGetLinksToPhotos();
   }
}

function vkWall(){
	Inj.End('FullWall.init','setTimeout("vkOnNewLocation();",2);');
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
      var cur_date = new Date().getTime();  
      var age= (new Date(cur_date-date)).getFullYear()-1970; 
      info.push(langNumeric(age, vk_lang["vk_year"]));
   }
  
   if (day && month){
      var zodiacs=vk_lang['zodiac_signs'];
      var idx = day>zodiac_cfg[month-1]?(month) % 12:(month-1);
		var zodiac = zodiacs[idx];
      info.push(zodiac);
   }
   return info;
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
      info = ' ('+info.join(', ')+')';
      var links=node.getElementsByTagName('a');
      for (var i=0;i<links.length;i++){
         if (links[i].href && links[i].href.match(rmd)) 
            links[i].parentNode.appendChild(vkCe('span',{"class":"vk_bday_info"},info));
      }
      if (cur.options.info) {
         var r1 = /(c\[byear\]=[^>]+>[^<>]+<\/a>)/;
         r1 = cur.options.info[0].match(r1) ? r1 : /(c\[bmonth\]=[^>]+>[^<>]+<\/a>)/;
         cur.options.info[0] = cur.options.info[0].replace(r1, "$1" + info);
         cur.options.info[1] = cur.options.info[1].replace(r1, "$1" + info);
      }     
   }
}

function vkProcessBirthday(day,month,year){
   var zodiac_cfg=[20,19,20,20,21,21,22,23,23,23,22,21];// days
   //'zodiac_signs':['Козерог','Водолей','Рыбы','Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец']
   var info=[];
   
   if (day && month && year){
      var date=new Date(year, month-1, day);
      var cur_date = new Date().getTime();  
      var age= (new Date(cur_date-date)).getFullYear()-1970; 
      info.push(langNumeric(age, vk_lang["vk_year"]));
   }
  
   if (day && month){
      var zodiacs=vk_lang['zodiac_signs'];
      var idx = day>zodiac_cfg[month-1]?(month) % 12:(month-1);
		var zodiac = zodiacs[idx];
      info.push(zodiac);
   }
   return info;
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
      info = ' ('+info.join(', ')+')';
      var links=node.getElementsByTagName('a');
      for (var i=0;i<links.length;i++){
         if (links[i].href && links[i].href.match(rmd)) 
            links[i].parentNode.appendChild(vkCe('span',{"class":"vk_bday_info"},info));
      }
      if (cur.options.info) {
         var r1 = /(c\[byear\]=[^>]+>[^<>]+<\/a>)/;
         r1 = cur.options.info[0].match(r1) ? r1 : /(c\[bmonth\]=[^>]+>[^<>]+<\/a>)/;
         cur.options.info[0] = cur.options.info[0].replace(r1, "$1" + info);
         cur.options.info[1] = cur.options.info[1].replace(r1, "$1" + info);
      }     
   }
}

/*
// @name Vkontakte Calculate Age
// @namespace http://polkila.googlecode.com
// @author Васютинский Олег http://vasyutinskiy.ru

function VkCalcAge(){
var t = ge('profile_info').parentNode;//('rightColumn').childNodes[3];personal
if (!t) return;
  var byear = /c[\[%5B]{1,3}byear[\]%5D]{1,3}=([0-9]{4})/.exec(t.innerHTML);
  var bdate = /c[\[%5B]{1,3}bday[\]%5D]{1,3}=([0-9]{1,2})[&amp;]{1,5}c[\[%5B]{1,3}bmonth[\]%5D]{1,3}=([0-9]{1,2})/.exec(t.innerHTML);
  var _href='';
  var date_info='';
 
  //if (!byear) return;
  //alert (bdate[1]+'\n'+bdate[2]+'\n'+byear[1]);
  var lang = parseInt(vkgetCookie('remixlang')), _sign_ = '', now = new Date();
  if (byear){
  var age = now.getFullYear() - byear[1];
	if (bdate && bdate[2]>now.getMonth()+1) age--;
	else if (bdate && bdate[2]==now.getMonth()+1 && bdate[1]>now.getDate()) age--;

  date_info+=langNumeric(age, vk_lang["vk_year"]);// age+' '+_years_;
  }

	if (bdate){
      var signs = new Array('&#1050;&#1086;&#1079;&#1077;&#1088;&#1086;&#1075;','&#1042;&#1086;&#1076;&#1086;&#1083;&#1077;&#1081;','&#1056;&#1099;&#1073;&#1099;','&#1054;&#1074;&#1077;&#1085;','&#1058;&#1077;&#1083;&#1077;&#1094;','&#1041;&#1083;&#1080;&#1079;&#1085;&#1077;&#1094;&#1099;','&#1056;&#1072;&#1082;','&#1051;&#1077;&#1074;','&#1044;&#1077;&#1074;&#1072;','&#1042;&#1077;&#1089;&#1099;','&#1057;&#1082;&#1086;&#1088;&#1087;&#1080;&#1086;&#1085;','&#1057;&#1090;&#1088;&#1077;&#1083;&#1077;&#1094;');
		var lastD = new Array(20,19,20,20,21,21,22,23,23,23,22,21);
		var signN = bdate[2]-1;
		if (bdate[1]>lastD[signN]) signN = (signN+1) % 12;
		_sign_ = signs[signN];
	}

  if (date_info.length>0) date_info+=', '
  
  
  var alinks=document.getElementsByTagName('a');

  var rhdr='/search?c[section]=people&c[bday]=';
  var total=2;
  for(i = 0; i<alinks.length; i++ ){
    var lnk=alinks[i];
    if(lnk.href && lnk.href.indexOf(rhdr)!=-1) {
      total--;
      lnk.parentNode.innerHTML+=' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+total)+' '+_href+')';
      // cur.options.info[1]
    }
    if (!total) break;
  }
  //vk.com/search?c[section]=people&c[bday]=28&c[bmonth]=4
  //vk.com/search?c[section]=people&c[byear]=1991
  if (cur.options.info){
    //alert(cur.options.info[0].match(/(c\[byear\]=[^>]+>[^<>]+<\/a>)/));//http://vk.com/search?c[section]=people&c[bday]=6&c[bmonth]=5
	var r1=/(c\[byear\]=[^>]+>[^<>]+<\/a>)/;
	r1=cur.options.info[0].match(r1)?r1:/(c\[bmonth\]=[^>]+>[^<>]+<\/a>)/;
	cur.options.info[0]=cur.options.info[0].replace(r1,"$1"+' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+0)+' '+_href+')');
    cur.options.info[1]=cur.options.info[1].replace(r1,"$1"+' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+1)+' '+_href+')');
  }

   if(ge('checkAgeLink')) {
      if(window.vk_cur && vk_cur.vk_calEvents) ge('checkAgeLink').onclick();
      else if (getSet(27)=='y') Inj.Wait('window.vk_cur && vk_cur.vk_calEvents',ge('checkAgeLink').onclick);
   }
}
//*/

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
    t=el.innerHTML;
    t=t.replace(/\D+/g,'');
    if(t.length)                                                                                                                                                   // http://kanicq.ru/invisible/favicon.ico
      el.innerHTML+=' <a href="http://kanicq.ru/invisible/'+t+'" title="'+IDL("CheckStatus")+'" target=new><img src="http://status.icq.com/online.gif?img=26&icq='+t+'&'+Math.floor(Math.random()*(100000))+'" alt="'+IDL("CheckStatus")+'"></a>';
  } 
  //*
  if(skype) {	
	var el=skype.parentNode.getElementsByTagName('div')[1];
    t=el.innerHTML;
    t=t.match(/skype\:(.+)\?call/);
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
	if (!el) return;
	var span=document.createElement('span');
	span.innerHTML='<a href="#" onclick="cancelEvent(event); wall.showMore(0); return false;">&#8635;</a>';/*&uarr;&darr;*/
	insertAfter(span,el);
}


function vkAddCleanWallLink(){
	var allow_clean=(cur.oid==remixmid() || isGroupAdmin(cur.oid));
	if (allow_clean && !ge('vk_clean_wall') && ge('full_wall_filters')){
		var li=vkCe('li',{"class":'t_r', id:'vk_clean_wall'},'\
			<a href="#" onclick="vkCleanWall('+cur.oid+'); return false;">'+IDL("wallClear")+'</a><span class="divide">|</span>\
		');
		ge('full_wall_filters').appendChild(li);
	}
	
	if(allow_clean && cur.wallType=="one" && !ge('vk_clean_post_comments_wall')){
		var p=geByClass('reply_link_wrap')[0];
		var el=vkCe('small',{id:'vk_clean_post_comments_wall'},'\
			<span class="divide">|</span><a href="#" onclick="vkDelWallPostComments('+cur.oid+','+nav.objLoc[0].match(/_(\d+)/)[1]+'); return false;">'+IDL("DelAllComments")+'</a>\
		');
		p.appendChild(el);
	}
}

function vkAddDelWallCommentsLink(node){
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
			<a href="#" onclick="vkRunCleanWall(20); return false;">- '+IDL('FromSecondPage')+'</a>\
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
            <a href="javascript:vkFaveProfileBlock(true)" id="vk_fave_all_link">[ '+ IDL('FaveOnline') +' ( -- ) ]</a>\
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
            ge("vk_fave_all_link").innerHTML='[ '+ IDL('FaveOnline') +' ('+onlines.length+') ]';
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
      vkHighlightGroups();
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
    hdr.innerHTML='<a href="javascript:vkFriends_get(\''+postfix+'\')" id="Fr'+postfix+'Lnk">[ '+hdr.innerHTML+' ]</a>';
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
        var el=geByClass('module_body',el)[0];
        el.innerHTML='<div align="center"><a href="/photos'+cur.oid+'" onclick="return nav.go(this, event);">[ '+IDL("obzor")+' ]</a> <a href="/photos'+cur.oid+'?act=comments"  onclick="return nav.go(this, event);">[ '+IDL("komm")+' ]</a></div>'+el.innerHTML;
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
	   ge('profile_full_link') ? null : geByClass('profile_info_link')[0].id='profile_full_link';
	   ge('profile_full_link').setAttribute('title','show');
  }	else { 
     removeClass(c,"shut"); profile.showFull();
	   ge('profile_full_link') ? null : geByClass('profile_info_link')[0].id='profile_full_link';
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
function vkOnGetGraffitiSig(imgsig){ge('GrafSig').value=imgsig;}
function vkInitFakeGraffiti(){
  var upUrl=ge('content').innerHTML.match(/'postTo','(.+)'/i); 
  upUrl=unescape(upUrl[1]);
  /*alert(vkGetFakeGraffitiForm(upUrl));*/
  var bef=ge('content').firstChild;
  var div=document.createElement('div');
  div.innerHTML=vkGetFakeGraffitiForm(upUrl);
  ge('content').insertBefore(div,bef);
  //ge('content').innerHTML=vkGetFakeGraffitiForm(upUrl)+ge('content').innerHTML;
  
  
  vkMakeGrafSidGen();
}
var VKGSC_SWF_LINK='http://cs4287.vkontakte.ru/u13391307/4804adefa66494.zip';
function vkMakeGrafSidGen(){
  var so = new SWFObject(VKGSC_SWF_LINK,'player',"84","24",'10');
  so.addParam("allowscriptaccess", "always");
  so.addParam("preventhide", "1");
  so.addVariable('idl_browse', IDL('GrafSidCalc'));
  so.write('SigCalc');
}

function vkGraffUpForm(upUrl){
return '<iframe src="about:blank" name="graff_upload_frame" width=0 height=0 style="display:none;" onload="'+"if (window.vk_allowPostGrafffiti) ajax.post('al_wall.php', {act: 'last_graffiti'}, {onDone: function(media, thumb) {vk_allowPostGrafffiti=false;   cur.chooseMedia('graffiti', media, thumb);    }});"+'"></iframe>\
		<form id="fakeupload" name="upload" action="'+
  upUrl+'" method="POST" enctype="multipart/form-data" target="graff_upload_frame"><center>'+
  '<table class="formTable" border="0" cellspacing="0"><tbody><tr class="tallRow"><td class="label" style="text-align:right; vertical-align: top;">'+
  IDL('UpGraffiti')+'</td><td>'+
              '<span class="label">'+IDL('GraffitiFile')+'</span><br>'+
              '<input type="file" style="width:280px;" size="22" id="file2" name="Filedata">'+
              '<br><span class="label">'+IDL('GraffitiSignature')+'</span><br>'+
              '<div style="display:inline;"><INPUT type="text" size="32" name="Signature" id="GrafSig"></div><div id="SigCalc"  style="width:84px; display:inline; position:relative;top:7px;" ></div> <BR>'+
              
  '</td></tr><tr><td></td><td><div style="height:30px; margin-top:10px;"><center>'+
  vkRoundButton([IDL('UploadFraffiti'),"javascript:this.disabled=true; vk_allowPostGrafffiti=true; document.getElementById('fakeupload').submit();"])+
  '</center></div></td></tr></tbody></table></center></form>'+
  '<div style="margin_: 10px 20px; border:1px solid #b1bdd6; padding:5px; line-height: 15px; background-color:#f7f7f;"><small>'+
   IDL('GraffHelp')+ 
  '</small></div>';
}

function vkGetFakeGraffitiForm(upUrl){
return  '<div id="fgraff"><ol id="nav"><li><center><a href="#" onclick="hide(\'fgraff\'); show(\'fake_graffiti\'); hide(\'flash_player_container\'); return false;">'+IDL('LoadFakeGraffiti')+'</a></center></li></ol></div>'+
  '<div id="fake_graffiti" style="display:none"><div style="width:450px; text-align:center; margin:0px auto; padding:20px;">'+vkGraffUpForm(upUrl)+'</div></div>';

}

function vkShowFakeGraffLoader(mid){
  var Box = new MessageBox({title: IDL('LoadFakeGraffiti')});
  Box.removeButtons();
  /*Box.addButton({
    onClick: function(){ msgret=Box.hide(200);Box.content(""); },
    style:'button_no',label:IDL('Cancel')});
  */
  Box.addButton(!isNewLib()?{
    onClick:  function(){ msgret=Box.hide(200);Box.content(""); },
    style:'button_no',label:IDL('Cancel')}:IDL('Cancel'), function(){ msgret=Box.hide(200);Box.content(""); },'no');
    
  Box.content(vkGraffUpForm('/graffiti.php?'+((location.href.match(/club\d+/))?"group_id=":"to_id=")+mid)).show(); 
  vkMakeGrafSidGen();
}

function addFakeGraffItem() {
  var AddGraffItem=function(bef){
    var mid=ge('mid')?ge('mid').value:(window.cur && cur.oid?cur.oid:0);
    if (bef && mid){
    bef=bef.getElementsByTagName('a')[0];
	vkAddScript('/js/lib/swfobject.js');
    var a=document.createElement('a');
    a.setAttribute("onfocus","this.blur()");
    a.setAttribute("class"," add_media_item");
    a.setAttribute("id","vk_wall_post_type0");
    a.setAttribute("style","background-image: url(/images/icons/attach_icons.gif); background-position: 3px -152px");
    a.setAttribute("href","/graffiti.php?act=draw&"+((location.href.match(/club\d+/))?"group_id=":"to_id=")+mid);
    a.setAttribute("onclick","vkShowFakeGraffLoader("+mid+");return false;");
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
	
	/*
	Inj.Wait("ge('add_media_type_"+(lnkId-1)+"_0')",AddGraffItem,300,10);
	Inj.Wait("ge('add_media_type_"+lnkId+"_0')",AddGraffItem,300,10);
	*/
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
               <div id="audio_load_line%AID%" class="audio_load_line" onmousedown="audioPlayer.prClick(event);"><!-- --></div>\
               <div id="audio_progress_line%AID%" class="audio_progress_line" onmousedown="audioPlayer.prClick(event);">\
                 <div id="audio_pr_slider%AID%" class="audio_pr_slider"><!-- --></div>\
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
      vkAudioNode(div);
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
   if (ge('pages_right_link') && !ge('vk_add_wiki_page')){
      ge('pages_right_link').parentNode.appendChild(
         vkCe('a',{
            "class":"fl_r pages_right_link",
            "id":"vk_add_wiki_page",
            "href":"#",
            "onclick":"vkWikiNew(); return false;"
         },IDL('Add')+'<span class="divide">|</span>')
      );
   }
}
function vkWikiNew(){
   var title=prompt(IDL("Title"));
   if (title)
      nav.go("pages?act=edit&oid="+cur.oid+"&p="+encodeURIComponent(title));
}


function vkGroupsList(){
   Inj.Before('GroupsList.showMore','var name','if (vkGroupsListCheckRow(row)) continue;');
}

function vkGroupsListPage(){
	vkGrLstFilter();
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
   if (val==3 &&  isEvent) return true;             // hide events
   if (val==4 && (isGroup || isEvent)) return true; // hide events and groups
   return false;
}

function vkGrLstFilter(){
   var p=ge('groups_list_tabs'); 
   if (ge('vk_gr_filter')){
      (nav.objLoc['tab']=='admin'?hide:show)('vk_gr_filter');
   }
   if ((ge('vk_gr_filter') && cur.vkGrLstMenu) || !p) return;
   
   if (!ge('vk_gr_filter')) p.appendChild(vkCe('li',{id:'vk_gr_filter'},'<input type="hidden" id="vk_grlst_filter">'));
   //*   
   stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
      vkaddcss('ul.t0 .result_list ul li{float:none}');
      cur.vkGrLstMenu = new Dropdown(ge('vk_grlst_filter'),[[0,IDL("SelectGRFilter")],[1,IDL("Groups")],[2,IDL("Events")],[3,IDL("GroupsAndPublics")],[4,IDL("Publics")]], {//
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

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;