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
	if (getSet(24) == 'y') vkAvkoNav();
	if (getSet(25) == 'y') status_icq(ge('profile_full_info'));
	if (getSet(26) == 'y') VkCalcAge();
	vkPrepareProfileInfo();
	addFakeGraffItem();
	vkUpdWallBtn(); //Update wall button
	if (MOD_PROFILE_BLOCKS) vkFrProfile();
	if (getSet(46) == 'n') vkFriends_get('online');
	if (getSet(47) == 'n') vkFriends_get('common');
	vkHighlightGroups();
}


function vkProfile(){
	Inj.After('profile.init','});','setTimeout("vkProcessNode();",2);');
	Inj.End('profile.init','setTimeout("vkOnNewLocation();",2);');
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
	vkAddCleanWallLink();
	vkAddDelWallCommentsLink();
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

// @name Vkontakte Calculate Age
// @namespace http://polkila.googlecode.com
// @author Васютинский Олег http://vasyutinskiy.ru

function VkCalcAge(){
var t = ge('profile_info').parentNode;//('rightColumn').childNodes[3];personal
if (!t) return;
  var byear = /c[\[%5B]{1,3}byear[\]%5D]{1,3}=([0-9]{4})/.exec(t.innerHTML);
  var bdate = /c[\[%5B]{1,3}bday[\]%5D]{1,3}=([0-9]{1,2})[&amp;]{1,5}c[\[%5B]{1,3}bmonth[\]%5D]{1,3}=([0-9]{1,2})/.exec(t.innerHTML);
  var date_info='';
  //if (!byear) return;
  //alert (bdate[1]+'\n'+bdate[2]+'\n'+byear[1]);
  var lang = parseInt(vkgetCookie('remixlang')), _sign_ = '', now = new Date();
  if (byear){
  var age = now.getFullYear() - byear[1];
	if (bdate && bdate[2]>now.getMonth()+1) age--;
	else if (bdate && bdate[2]==now.getMonth()+1 && bdate[1]>now.getDate()) age--;

	if (lang) _years_ = 'years old';
	else{
		last = age.toString().substr(1);
		if (last==1) _years_ = '&#1075;&#1086;&#1076;';
		if (last>1 && last<5) _years_ = '&#1075;&#1086;&#1076;&#1072;';
		if (last>4 || last==0) _years_ = '&#1083;&#1077;&#1090;';
		if (age>4 && age<21) _years_ = '&#1083;&#1077;&#1090;';
	}
  date_info+=age+' '+_years_;
  }

	if (bdate){
		//if (lang) var signs = new Array('Capricorn','Aquarius','Pisces','Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius');
		//else
    var signs = new Array('&#1050;&#1086;&#1079;&#1077;&#1088;&#1086;&#1075;','&#1042;&#1086;&#1076;&#1086;&#1083;&#1077;&#1081;','&#1056;&#1099;&#1073;&#1099;','&#1054;&#1074;&#1077;&#1085;','&#1058;&#1077;&#1083;&#1077;&#1094;','&#1041;&#1083;&#1080;&#1079;&#1085;&#1077;&#1094;&#1099;','&#1056;&#1072;&#1082;','&#1051;&#1077;&#1074;','&#1044;&#1077;&#1074;&#1072;','&#1042;&#1077;&#1089;&#1099;','&#1057;&#1082;&#1086;&#1088;&#1087;&#1080;&#1086;&#1085;','&#1057;&#1090;&#1088;&#1077;&#1083;&#1077;&#1094;');
		//var lastD = new Array(19,18,20,19,20,21,22,22,22,22,21,21);
		var lastD = new Array(20,19,20,20,21,21,22,23,23,23,22,21);
		var signN = bdate[2]-1;
		if (bdate[1]>lastD[signN]) signN = (signN+1) % 12;
		_sign_ = signs[signN];
	}

  if (date_info.length>0) date_info+=', '
  
  
  var alinks=document.getElementsByTagName('a');
/*
  if (_sign_)
		if(bdate!=null && byear==null){
			var dloc=document.location.href;
			var IdForMyPageInYear=remixmid();//ge('myprofile').getElementsByTagName('a')[1].href.split('/id')[1];
			var vkuid=cur.oid;//ge('mid').value;//(dloc.match(/id(\d+)/i))?dloc.match(/id(\d+)/i)[1]:((dloc.match(/profile\.php\?id=(\d+)/i))?dloc.match(/profile\.php\?id=(\d+)/i)[1]:false);
			if(IdForMyPageInYear!=vkuid && !ge('profile_actions').innerHTML.match('profile.addFriendBox()')){
				GsearthIDDay=bdate[1];
				GsearthIDMonth=bdate[2];
				_sign_+=" <span id='dateYear'><a onclick='SeartchDate("+bdate[2]+");'>"+IDL('UznatVozrast')+"</a></span>";
			}
			//      alert(bdate[1]+" "+bdate[2]);
		}*/
  var rhdr='/search?c[section]=people&c[bday]=';
  var total=2;
  for(i = 0; i<alinks.length; i++ ){
    var lnk=alinks[i];
    if(lnk.href && lnk.href.indexOf(rhdr)!=-1) {
      total--;
      lnk.parentNode.innerHTML+=' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+total)+')';
      // cur.options.info[1]
    }
    if (!total) break;
  }
  /*vk.com/search?c[section]=people&c[bday]=28&c[bmonth]=4
  vk.com/search?c[section]=people&c[byear]=1991*/
  if (cur.options.info){
    //alert(cur.options.info[0].match(/(c\[byear\]=[^>]+>[^<>]+<\/a>)/));//http://vk.com/search?c[section]=people&c[bday]=6&c[bmonth]=5
	var r1=/(c\[byear\]=[^>]+>[^<>]+<\/a>)/;
	r1=cur.options.info[0].match(r1)?r1:/(c\[bmonth\]=[^>]+>[^<>]+<\/a>)/;
	cur.options.info[0]=cur.options.info[0].replace(r1,"$1"+' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+0)+')');
    cur.options.info[1]=cur.options.info[1].replace(r1,"$1"+' ('+date_info+_sign_.replace(/dateYear/g,'dateYear'+1)+')');
  }
}


function status_icq(node) { //add image-link 'check status in ICQ'
  var t,i,icq=null;
  var labels=geByClass('label',node);
  for(i=0;i<labels.length;i++)
    if(labels[i].innerHTML=='ICQ:'){  
      icq=labels[i]; 
      break; 
    }
  if(icq) {	
	var el=icq.parentNode.getElementsByTagName('div')[1];//geByClass('dataWrap')[a];
    t=el.innerHTML;
    t=t.replace(/\D+/g,'');
    if(t.length)                                                                                                                                                   // http://kanicq.ru/invisible/favicon.ico
      el.innerHTML+=' <a href="http://kanicq.ru/invisible/'+t+'" title="'+IDL("CheckStatus")+'" target=new><img src="http://status.icq.com/online.gif?img=26&icq='+t+'&'+Math.floor(Math.random()*(100000))+'" alt="'+IDL("CheckStatus")+'"></a>';
      //'http://status.icq.com/online.gif?img=26&icq='+t//252297701
  } 
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

function vkFrProfile(){
  var els=geByClass('module_header');
  var shuts_mask=parseInt(vkgetCookie('remixbit',1).split('-')[12]);
  var c=ge('profile_full_link') ? ge('profile_full_link') : geByClass('profile_info_link')[0];
  if (c){
    c.setAttribute('title', c.getAttribute('onclick'));
    c.id='profile_full_link';
    c.setAttribute('onclick','shut("profile_full_info");');
  }
  //els=vkArr2Arr(els);
  var mod=function(el,postfix){
    if (postfix=='online' && el.parentNode.id=='profile_friends') el.parentNode.id='profile_friends_online';
    vkNextEl(el).id='friends_profile_'+postfix;
    var hdr=geByClass('p_header_bottom',el)[0];
	if (!hdr) return;
	var rlink=geByClass('right_link',el)[0];
	if (rlink) rlink.setAttribute('onclick',"return nav.go(this.parentNode.parentNode, event)");
    var all=hdr.getElementsByTagName('span')[0];
    all.innerHTML='<a href="'+el.href+'" onclick="'+el.getAttribute('onclick')+'">'+all.innerHTML+'</a>';//return nav.go(this, event)
    var div=document.createElement('div');
    div.className='module_header';
    div.appendChild(all);
    hdr.innerHTML='<a href="javascript:vkFriends_get(\''+postfix+'\')" id="Fr'+postfix+'Lnk">[ '+hdr.innerHTML+' ]</a>';
    hdr.appendChild(all);
    div.appendChild(hdr);
    insertAfter(div,el);
  };
  var mod_lite=function(el,postfix){
    var hdr=geByClass('p_header_bottom',el)[0];
    if (!hdr) return;
	var rlink=geByClass('right_link',el)[0];
	if (rlink) rlink.setAttribute('onclick',"return nav.go(this.parentNode.parentNode, event)");
    var all=hdr.getElementsByTagName('span')[0];
    all.innerHTML='<a href="'+el.href+'"  onclick="'+el.getAttribute('onclick')+'">'+all.innerHTML+'</a>';
    var div=document.createElement('div');
    div.className='module_header';
    div.appendChild(all);
    //hdr.innerHTML='<a href="javascript:vkFriends_get(\''+postfix+'\')" id="Fr'+postfix+'Lnk">[ '+hdr.innerHTML+' ]</a>';
    hdr.appendChild(all);
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
    if (els[i].href){
      var mod_l=false;
      for (var key in fr_match){
          if (els[i].href.match(fr_match[key])) {mod_l=true; mod(els[i],key);}  
      }
      if (!mod_l) mod_lite(els[i]);
      var key=els[i].parentNode.id;
      if (mod_el[key]) mod_el[key](els[i].parentNode);
      
      if (key && vk_shuts_mask[key]){
        els[i].setAttribute("onclick",'return shut("'+key+'");');
        addClass(key,'shut_open');
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
    IDFriendTime=getSet('-',5)*60000;
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
			<a href="id'+fr[i].uid+'">'+fr[i].full_name+'</a>\
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
  /*
  if (vkGetVal('FavList')){
    var fl=vkGetVal('FavList').split('-');
    for (var i=0;i<fl.length;i++) fave[fl[i]]=true;   
  }
  */
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
//  'profile_wall'          : 0x20000,
  'profile_gifts'         : 0x40000,
  'profile_optional'      : 0x80000,
  'profile_fans'          : 0x100000,
  'profile_idols'         : 0x200000,
  'profile_infos'         : 0x400000
  //,'profile_photos_module' : 0x800000
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
    a.setAttribute("id","vk_wall_post_type0");
    a.setAttribute("style","background-image: url(/images/icons/wall_icons.gif); background-position: 0px 0px;");
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


if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;