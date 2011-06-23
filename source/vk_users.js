// ==UserScript==
// @name          Vkontakte Optimizer module (ExUserMenu && other users functions)
// @description   (by KiberInfinity id13391307)
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==



//  functions for work with users
var vkUsersDomain={}; 
var isUserRegEx=[
/(^|\/)(reg|regstep|club|event|photo|photos|album|albums|video|videos|note|notes|app|page|board|topic|write|public|publics|groups|wall|graffiti|tag\d|doc|gifts)-?\d+/i,
/(^|\/)(events|changemail|mail|im([^a-z0-9]|$)|audio|apps|editapp|feed|friends|friendsphotos|search|invite|settings|edit|fave|stats|video|groups|notes|docs|gifts)\??.*#?/i,
/javascript|#|\.mp3|\.flv|\.mov|http...www|\/ru\//i,
/\.php($|\?)/i,
/\/$/i,
/id\d+/i,
/http.{3}\w+\.vk.*\/.?/i
];
function isUserLink(url){
	if ((!(isUserRegEx[0].test(url) || isUserRegEx[1].test(url) || isUserRegEx[2].test(url) || isUserRegEx[3].test(url) || isUserRegEx[4].test(url)) || 
		isUserRegEx[5].test(url)) && !isUserRegEx[6].test(url)){
	  return true;
	} else return false;
}

function getUserID(url,callback){
 url=String(url);
 if (url.match(/^\d+$/)){callback(url);  return;}
 if (vkUsersDomain[url]){callback(vkUsersDomain[url]);  return; }
 AjGet('/groups_ajax.php?act=a_inv_by_link&page='+url,function(r){ // payments.php?act=votes_transfer_get_person&page=durov -captcha
    r=r.responseText;
    var uid=(r)?r.match(/name=.id..value=.(\d+)/)[1]:null;
    vkUsersDomain[url]=uid;
    callback(uid);
 });
}

var vkUsersGroupsDomain={};
function getGidUid(url,callback){ //callback(uid,gid)
	url=String(url);
	if (url.match(/^\d+$/)){callback(url);  return;}
	if (url.match(/^u\d+$/)){callback(url.match(/^u(\d+)$/)[1],null);  return;}
	if (url.match(/id\d+$/)){callback(url.match(/id(\d+)$/)[1],null);  return;}
	
	if (url.match(/^g\d+$/)){callback(null,url.match(/^g(\d+)$/)[1]);  return;}
	if (url.match(/club\d+$/)){callback(url.match(/club(\d+)$/)[1],null);  return;}
	
	if (vkUsersGroupsDomain[url]){callback(vkUsersGroupsDomain[url][0],vkUsersGroupsDomain[url][1]);  return; }
	AjGet('/al_groups.php?act=add_link_box&al=1&lnk='+url,function(r,t){
		var res=t.match(/http:\/\/cs\d+.vk.+\/(u\d+|g\d+)\/[A-Za-z0-9]_[A-Za-z0-9]+.jpg/);
		var id=res?res[1]:null;
		if (id){
			var o=id.substr(0,1);
			var id=id.substr(1).replace(/^[0]+/,'');
			if (o=='u')
				callback(id,null);//user
			else
				callback(null,id);//group
		} else if (t.indexOf('images/question_100.gif')>0){ //if NULL AVA
			if (t.match(/http:\/\/vk.+\/images\/question_100\.gif/)){// if 'NULL AVA (USER)';
				 AjGet('/groups_ajax.php?act=a_inv_by_link&page='+url,function(r){
					r=r.responseText;
					var uid=(r)?r.match(/name=.id..value=.(\d+)/)[1]:null;
					vkUsersGroupsDomain[url]=[uid,null];
					callback(uid,null);
				 });	
			} else {  // if 'NULL AVA (GROUP)';
				var gurl=url.split('/'); 
				gurl=(gurl[gurl.length-1])?gurl[gurl.length-1]:url;
				gurl=gurl.split('?')[0];
				AjGet(gurl+'?al=1',function(r,t){
					var gid=t.match(/"group_id":(\d+)/);
					if (gid) callback(null,gid[1]);
					if (!gid) vklog('>_< group parse error...',1);//alert('NO AVA GROUP');
				});	
			}
		} else {
			vklog('It\'s no user or group link');//alert('WTF');
		}
	});	
}

function ExtractUserID(link){
    if (!link) return null;
	var tmp2=link.match(/\/id(\d+)$/);
    if (!tmp2 && isUserLink(link)) {  tmp2=link.split('/'); tmp2=(tmp2[tmp2.length-1])?["",tmp2[tmp2.length-1]]:[];  }
    if (tmp2 && tmp2[1]) tmp2=(tmp2[1].indexOf("#")>0)?false:tmp2;
    return (tmp2)?tmp2[1]:null;
}
// <a href=# onclick="vkGoToLink('albums%id','kiberinfinity'); return false;">
function vkGoToLink(link,mid){
  getUserID(mid,function(uid){
    document.location.href=link.replace(/%id/g,uid);
  });
}

//////////////////////////////////
// ExUserMenu by KiberInfinity //
/////////////////////////////////
function ChangeUserMenuSet(){
  var res="";
  var cnt=ge('vkUMsettCnt').value;
  for (var i=0; i<cnt;i++){
   res+=(ge('ums'+i).checked)?'1':'0'; 
  }
  //alert(res);
  vksetCookie('remixumbit', res);
}
function GetUserMenuSett() {
    makeCbox = function(idx, name, state) {
        var cb = (state == '1') ? 'checked': '';
        return '<input type="checkbox" onclick="ChangeUserMenuSet();" id="ums' + idx + '" ' + cb + ' value=""> ' + name + '<br>';
    }
    var ItemNames = [
                     IDL("Page"),
                     IDL('txMessage'), 
                     IDL("clWa"), 
                     IDL("clPhW"), 
                     IDL("clViW"), 
                     IDL("clPh"), 
                     IDL("clAu"), 
                     'player ' + IDL("clAu"), 
                     IDL("clVi"), 
                     IDL("clGr"), 
                     IDL("fris"), 
                     IDL("clQu"), 
                     //IDL("clAp"), 
                     //IDL("clEv"), 
                     IDL("clNo"), 
                     IDL("clGi"), 
                     IDL("clRa"), 
                     IDL("clAddFr"), 
                     IDL("clAddToFav"), 
                     IDL("addblack")
                    ];
    
    var res="";
    var bits = vkgetCookie('remixumbit');
    if (!bits) {
        bits = DefExUserMenuCfg;
        vksetCookie('remixumbit', DefExUserMenuCfg);
    }
    var ExUserMenuCfg = bits.split('');

    for (var i = 0; i < ItemNames.length; i++) {
        res+=makeCbox(i, ItemNames[i], ExUserMenuCfg[i]);
    }

    return '<div style="text-align:left;">'+res+'</div><input type="hidden" id="vkUMsettCnt" value="'+ItemNames.length+'" /> ';
}
function GetUserMenuCfg(){
  var bits=vkgetCookie('remixumbit');
  if (!bits) {bits=DefExUserMenuCfg; vksetCookie('remixumbit',DefExUserMenuCfg);}
  ExUserMenuCfg=bits.split('');
}

//vkProcessUserLink_mask=/([^<]*<small>[^<]*<\/small>|[^<]*<strong>[^<]*<\/strong>|[^<]*<em>[^<]*<\/em>)/;
vkumlnks=0;
function vkProcessUserLink(link){
	if (link.hasAttribute('exuser')) return;
	var uid=ExtractUserID(link.getAttribute('href'));
	var txt=link.innerHTML;
	if (!uid || uid.indexOf('?')!=-1 || /(href=|src=)/.test(txt)) return;
	var adid=uid+'_'+(vkumlnks++);
	var mev=(getSet(11)=='y')?'onclick':'onmouseover';
	var inel=document.createElement('a');
	inel.id="pup"+adid;
	inel.setAttribute('class','vk_usermenu_btn'+(link.className.indexOf('fl_r')!=-1?' fl_r':''));
	inel.setAttribute(mev,'pupShow(event,\''+adid+'\',\''+uid+'\',this); return false;');
	inel.setAttribute("onmousedown","event.cancelBubble = true;");
	inel.innerHTML='&#9660; ';
	link.setAttribute('exuser',true);
	if (getSet(22)=='y' && link.parentNode.parentNode && link.parentNode.parentNode.id=='profile_groups'){
		inel.setAttribute('class','vk_usermenu_btn fl_r');
		link.parentNode.insertBefore(inel,link);
	} else {
		insertAfter(inel,link);
	}
	// tmp1.parentNode.parentNode.id!='profile_groups' - insertBefore, class="fl_r"
}
function vkAddUserMenu(el){
	el=(el || ge('content'));
	var nodes=el.getElementsByTagName('a');
	for (var i=0;i<nodes.length;i++) vkProcessUserLink(nodes[i]);
}

function vkExUMlinks(el){
 return;
 if (!el) el=ge('pageBody') || ge('page_body');
 //alert(el);
 if(ge(el).getElementsByTagName('a')){
  var nodes=ge(el).getElementsByTagName('a');
  var i=0;
  var mask=new Array();
  mask['small']=/[^<]*<small>[^<]*<\/small>/i;
  mask['strong']=/[^<]*<strong>[^<]*<\/strong>/i;
  mask['em']=/[^<]*<em>[^<]*<\/em>/i;
  mask['img']=/[^<]*<img/i;  
  for (i=0;i<nodes.length;i++){  
    var tmp1=nodes[i];
    var tmp2=ExtractUserID(tmp1.href);
    if (tmp2 && tmp2.match(/\?/)) tmp2=false;
    if(tmp2){
      var uid=tmp2;//[1];
       var tes=tmp1.innerHTML;
       var adid=uid+'_'+i;
       var mev=(getSet(11)=='y')?'onclick':'onmouseover';
       var inel=document.createElement('a');
       inel.id="pup"+adid;
	   inel.setAttribute('class','vk_usermenu_btn');
       inel.setAttribute(mev,'pupShow(event,\''+adid+'\',\''+uid+'\',this); return false;');
       inel.innerHTML='&#9660; ';
	   //addEvent(inel,'mouseover',function(){animate(inel, {opacity: 1}, 200);});
       //addEvent(inel,'mouseout',function(){animate(inel, {opacity: 0.5}, 200);});
       //inelem='<a id="pup'+adid+'" '+mev+'="pupShow(event,\''+adid+'\',\''+uid+'\'); return false;">&#9660; </a>';
        var atr_cl=tmp1.getAttribute('onclick');
        if (!tmp1.innerHTML.match('pupShow') && !tmp1.hasAttribute('exuser') && (!atr_cl || (atr_cl &&  atr_cl.match("nav.go"))|| tmp1.hasAttribute("altprof")) && tmp1.parentNode.parentNode.id!='profile_groups'){//  tmp1.getAttribute('altprof')
        if (((tes.match(mask['small']) || tes.match(mask['strong']) || tes.match(mask['em'])) && !tes.match(mask['img'])) || !tes.match('<')){
          tmp1.setAttribute('exuser',true);
          //tmp1.outerHTML=tmp1.outerHTML+inelem;
          insertAfter(inel,tmp1);
        }
        }
    }
  }}
}
var PUPCss= //position: fixed;
'#pupMenu { background: #FFFFFF; position:absolute; display: none; cursor: pointer; z-index: 200000;}'+
'.pupBody { background: #FFFFFF; border: 1px solid #96AABE; width: 156px; _width: 157px;}'+
'.pupBottom, .pupBottom2 { height: 1px; overflow: hidden; background: #000; opacity: 0.12; filter:alpha(opacity=12);}'+
'.pupBottom2 { opacity: 0.05; filter:alpha(opacity=5); height: 1px;}'+
'.pupSide { width: 1px; overflow: hidden; background: #000; opacity: 0.06; filter:alpha(opacity=6);}'+
'.pupItem, .pupItemOn { padding: 3px 3px 3px 5px; background-color: #FFF; color: #2C587D; _width:132px;}'+
'.pupItemOn { background-color: #EEF2F6;}';
var pup_over = 0;
var pup_show_delay=1500;
var pup_tout;

function pupShow(event,pid,id,el) {
 //cancelEvent(event);
 var pup_menu = ge('pupMenu');
 if (!event)event=window.event;
 pup_menu.style.left=event.pageX+"px";//pageX
 pup_menu.style.top=event.pageY+"px";//pageY
 var str = '<div class="vk_popupmenu"><ul>';//"<table cellpadding=0 cellspacing=0><tr><td class='pupSide'></td><td><div class='pupBody'>";
 str += ExUserItems(id,el);//pupItems(pid);
 str += '</ul></div>';//"</div><div class='pupBottom'></div><div class='pupBottom2'></div></td><td class='pupSide'></td></tr>";
 pup_menu.innerHTML = str;
 var ready=false;
 /*
 getUserID(id,function(uid){  
      if (uid==null) {
        ge("pupUidLoader").innerHTML='<span style="font-weight:bold; color:#F00;">'+IDL('NotUser')+'</span>'
        setStyle("pupMenuBlock", {opacity: 0.8});
      };
      pup_menu.innerHTML=pup_menu.innerHTML.replace(/%uid/g,uid); 
      if (ge('pupMenuBlock') && uid!=null) hide('pupMenuBlock');
      //if (uid==null) hide();
      ready=true; 
 });*/
 
  getGidUid(id,function(uid,gid){// getUserID 
      if (!uid && !gid) {
        ge("pupUidLoader").innerHTML='<span style="font-weight:bold; color:#F00;">'+IDL('NotUser')+'</span>'
        setStyle("pupMenuBlock", {opacity: 0.8});
      };
	  if (uid){
		  pup_menu.innerHTML=pup_menu.innerHTML.replace(/%uid/g,uid); 
		  if (ge('pupMenuBlock')) hide('pupMenuBlock');
		  ready=true; 
	  }
	  if (gid){
		 var str2 = '<div class="vk_popupmenu"><ul>';
		 str2 += ExGroupItems(gid,el);
		 str2 += '</ul></div>';	
		 str2=str2.replace(/%GID/g,gid); 
		 pup_menu.innerHTML = str2;
		 if (ge('pupMenuBlock')) hide('pupMenuBlock');
		 ready=true; 
	  }
 });
 
 show(pup_menu);
 var sz=getSize(pup_menu); 
 if (!ready) {pup_menu.innerHTML = '<div id="pupMenuBlock" style="position:absolute; opacity: 0.5;  background: #FFFFFF; height:'+sz[1]+'px; line-height:'+sz[1]+'px; width:'+sz[0]+'px;"'+
                                   'onmouseover="clearTimeout(pup_tout);" onmouseout="pup_tout=setTimeout(pupHide, 50);">'+
                                   '<center id="pupUidLoader"><img  src="/images/progress7.gif"></center></div>'+str;}
 pup_menu.style.visible='visible';
 clearTimeout(pup_tout);
 pup_tout=setTimeout(pupHide, pup_show_delay);
}

function mkExItem(id,text){
var str = '<li onmousemove="clearTimeout(pup_tout);" onmouseout="pup_tout=setTimeout(pupHide, 400);">'+text+"</li>";
return str;
}

function ExGroupItems(gid,el){
	var i=0;
	var uitems='';
	uitems+=mkExItem(i++,'<a href="/wall-%GID">'+IDL('wall')+'</a>');
	uitems+=mkExItem(i++,'<a href="/board%GID">'+IDL('board')+'</a>');
	uitems+=mkExItem(i++,'<a href="/albums-%GID">'+IDL('clPh')+'</a>');
	uitems+=mkExItem(i++,'<a href="/video?gid=%GID">'+IDL('clVi')+'</a>');
	uitems+=mkExItem(i++,'<a href="/photos-%GID">'+IDL('clPhBrowse')+'</a>');
	uitems+=mkExItem(i++,'<a href="/apps?gid=%GID">'+IDL('clAp')+'</a>');
	uitems+=mkExItem(i++,'<a href="/search?c[section]=people&c[group]=%GID">'+IDL('clGu')+'</a>');
	return uitems;
}
function ExUserItems(id,el){
	var i=0;
	var uitems='';
	if (isGroupAdmin('-'+vkGetGid())){
		uitems+=mkExItem(0,'<a href="#" onclick="vkBanUser(\'/id%uid\'); return false;">'+IDL('banit')+'</a>');
	}
	if (cur.oid>0 && geByClass('wall_post_text',el.parentNode)[0]){
		uitems+=mkExItem(0,'<a href="/wall'+cur.oid+'?with=%uid" onclick="return nav.go(this, event)">'+IDL('TetAtet')+'</a>');
	}
	if (uitems!='') uitems+='<li><div class="vk_user_menu_divider"></div></li>';
	var fl_pr='<a href="#" onclick_="return false;" onclick="vkPopupAvatar(\'%uid\',this,true); return false;" onmouseout="vkHidePhoto();" class="fl_r">&gt;</a>';
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,fl_pr+'<a href="/id%uid" onclick="return nav.go(this, event);">'+IDL('Page')+'</a>'):i++;// onclick="AlternativeProfile(\'%uid\'); return false;"
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/write%uid" onclick="return showWriteMessageBox(event, %uid);">'+IDL('txMessage')+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/wall%uid" onclick="return nav.go(this, event);">'+IDL("clWa")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/tag%uid" onclick="return nav.go(this, event);">'+IDL("clPhW")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/video?id=%uid&section=tagged" onclick="return nav.go(this, event);">'+IDL("clViW")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/albums%uid" onclick="return nav.go(this, event);">'+IDL("clPh")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/audio?id=%uid" onclick="return nav.go(this, event);">'+IDL("clAu")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/app545941_%uid" onclick="return nav.go(this, event);">player '+IDL("clAu")+'</a>'):i++; //audio application
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/videos%uid" onclick="return nav.go(this, event);">'+IDL("clVi")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/groups?id=%uid" onclick="return nav.go(this, event);">'+IDL("clGr")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/friends?id=%uid" onclick="return nav.go(this, event);">'+IDL("fris")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/questions.php?mid=%uid">'+IDL("clQu")+'</a>'):i++;
	//(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/apps.php?mid=%uid">'+IDL("clAp")+'</a>'):i++;
	//(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/events.php?id=%uid">'+IDL("clEv")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/notes%uid" onclick="return nav.go(this, event);">'+IDL("clNo")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/gifts?id=%uid">'+IDL("clGi")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="/rate.php?act=vote&id=%uid">'+IDL("clRa")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="javascript:vkRemoveFriend(%uid);" class="fl_r">x</a><a href="javascript:vkAddToFriends(%uid);">'+IDL("clAddFr")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="javascript:vkAddToFave(%uid,1);">'+IDL("clAddToFav")+'</a>'):i++;
	(ExUserMenuCfg[i]==1)?uitems+=mkExItem(i++,'<a href="#" style="cursor: hand;" onClick="vkAddToBL(%uid); return false;">'+IDL("addblack")+'</a>'):i++;
	 
	return uitems;
}

function pupHide() {
 if (pup_over) {
  return;
 }
 ge('pupMenu').style.left='-200px';
 ge('pupMenu').style.top='-300px';
 hide('pupMenu');
}
  ///////////////////////
 // End of ExUserMenu //
///////////////////////
function vkAddToFriends(uid) {    showBox('al_friends.php', {act: 'add_box', mid: uid});}
function vkRemoveFriend(uid) {    showBox('al_friends.php', {act: 'remove_box', mid: uid});}

function vkAddToFave(uid){ // Turn you to online
	AjGet('/id'+uid+'?al=1',function(r,t){
		var hash=t.split("Profile.toggleFave(this",2)[1].split("'",2)[1];
		//alert(hash);
		AjPost('fave.php', {act: 'addPerson', al:1, hash: hash, mid: uid},function(r,t){
			vkMsg('<b>OK</b>',2000);
		});
	});
}

function vkAddToBL(uid){
	vkMsg(vkLdrMonoImg,1000);
	AjGet('/settings?act=blacklist&al=1',function(r,t){
		var hash=t.split('"blacklist_hash":')[1].split('"')[1];
		AjPost('al_settings.php', {act: 'search_blacklist', query: '/id'+uid, hash: hash, al:1},function(r,t){
			var msg=t.split('class="msg">')[1].split('</div>')[0];
			vkMsg(msg,3000);
		});
	});
}


function vkBanUser(user_link,gid) {
	if (gid || cur.gid || cur.oid<0){
		if (!gid) gid=cur.oid?Math.abs(cur.oid):cur.gid;
		var ban=function(){
			vkLdr.show();
			AjGet('/club'+gid+'?act=blacklist&al=1',function(r,t){
				var hash=t.split("hash: '")[1];
				if (!hash){
					vkLdr.hide();
					vkMsg(IDL('Error'),2000);
					return;
				}
				hash=hash.split("',")[0];
				ajax.post('al_groups.php', {act: 'bl_user', name: user_link, gid: gid, hash: hash}, {onDone: function(text, mid, html) {
					  vkLdr.hide();
					  vkMsg(text,3000);
					}
				});//, showProgress: lockButton.pbind(btn), hideProgress: unlockButton.pbind(btn)
			});
		};
		vkAlertBox(IDL('ban'),IDL('BanConfirm'),ban,true);
	}
}

function vkBanUserFunc(user_link,gid,callback) {
	if (gid || cur.gid || cur.oid<0){
		if (!gid) gid=cur.oid?Math.abs(cur.oid):cur.gid;
		var ban=function(){
			//vkLdr.show();
			AjGet('/club'+gid+'?act=blacklist&al=1',function(r,t){
				var hash=t.split("hash: '")[1];
				if (!hash){
					//vkLdr.hide();
					//vkMsg(IDL('Error'),2000);
					callback(null,true);
					return;
				}
				hash=hash.split("',")[0];
				ajax.post('al_groups.php', {act: 'bl_user', name: user_link, gid: gid, hash: hash}, {onDone: function(text, mid, html) {
					  //vkLdr.hide();
					  callback(text);
					  //vkMsg(text,3000);
					}
				});//, showProgress: lockButton.pbind(btn), hideProgress: unlockButton.pbind(btn)
			});
		};
		ban();
	}
}

function AddExUserMenu(el){
 if (getSet(10)=='y') //&& !ge('phototags') && !ge('videotags')
    {
    vkExUMlinks(el);
     }
}

function vk_user_init(){
	if (ge('pageLayout')||ge('page_layout')){
	 if (getSet(10)=='y'){
		GetUserMenuCfg();
		var addbg=' .pupBody { background:'+getStyle(document.body, 'background')+' !important;}';
		vkaddcss(PUPCss+addbg);
		phdiv=document.createElement('div');
		phdiv.id='pupHead';
		pmdiv=document.createElement('div');
		pmdiv.id='pupMenu';
		var vk_page_layout=document.getElementsByTagName('body')[0];//ge('pageLayout')||ge('page_layout');
		vk_page_layout.appendChild(phdiv);
		vk_page_layout.appendChild(pmdiv);
		vkExUMlinks();
	 }
	}
}


function ProcessUserPhotoLink(node){
  var hr=node.href;
  if (node.innerHTML.match(/img/i) && !node.innerHTML.match(/showPhoto/i) && !(node.parentNode.id && node.parentNode.id=='myprofile')) { 
  if (hr && isUserLink(hr) && !node.getAttribute("onmouseover")){
      var uid=node.innerHTML.match(/http.{3}cs.+\/u(\d+)/i);
      if (uid) uid=uid[1];
      if (!uid) uid=ExtractUserID(hr);
      node.setAttribute("onmouseover","vkPopupAvatar('"+uid+"',this)");
      node.setAttribute("onmouseout","vkHidePhoto();");
    }    
  }
}
allowHidePhoto=setTimeout(null,null);
allowShowPhotoTimer=setTimeout(null,null);
function vkPopupAvatar(id,el,in_box){
    if (id==null) return;
    if (!window.LoadedProfiles) LoadedProfiles={};
    if (typeof allowShowPhoto =='undefined') allowShowPhoto=true;
    allowShowPhoto=true;
	if (in_box){
		var box=vkAlertBox('',vkBigLdrImg);
		vkGetProfile(id,function(html,uid){
			//LoadedProfiles[id]=html;
			box.hide();
			box=vkAlertBox('id'+uid,html);
			box.setOptions({width:"455px",hideButtons:true, bodyStyle:'padding:0px;', onHide:__bq.hideAll});
		},true);
		
	}else  if (LoadedProfiles[id]){
      allowShowPhotoTimer=setTimeout(function(){vkShowProfile(el,LoadedProfiles[id],id);},400);  
    } else {
		vkGetProfile(id,function(html,uid){
			LoadedProfiles[id]=html;
			allowShowPhotoTimer=setTimeout(function(){
				vkShowProfile(el,html,uid);
			},400);
		});
    }
}
function vkShowProfile(el,html,uid,right){
	clearTimeout(allowHidePhoto);
    if (!ge("vkbigPhoto")) {
            var ht = '<div id="vkbigPhoto" onmousemove="clearTimeout(allowHidePhoto);" onmouseout="vkHidePhoto()" style="z-index:1000;display:none;position:absolute;background:transparent;"></div>';
            div = document.createElement('div');
            var body = document.getElementsByTagName('body')[0];
            div.innerHTML = ht;
            body.appendChild(div);
    }
	var p = ge('vkbigPhoto');
	p.innerHTML=html;
	var pb=ge('vk_profile_block');
	vkProfileToggle(true);//check expland
	
	if (allowShowPhoto) fadeIn('vkbigPhoto');//show('vkbigPhoto');
      var xy=getXY(el); 
      var height=getScrollTop()+getScrH();    
      var top= (xy[1]+pb.offsetHeight>height)?height-pb.offsetHeight-10:xy[1];
      top=(top<getScrollTop())?getScrollTop():top;
      
      var left=xy[0] - pb.offsetWidth + 5;
      if (left<0) left=0;
      //alert(getScrollTop()+"\n"+getScrH()+"\n"+height+"\n"+(xy[1]+el.offsetHeight)+"\n"+el.offsetHeight);
      if (right) {
        p.style.left = (xy[0] + el.offsetWidth + 10) + "px";
        p.style.top = top+"px";
        
      }else {
        p.style.left = left+"px";//(xy[0] - p.offsetWidth - 10)+"px";
        p.style.top = top+"px";
      }
}
function vkShowPhoto(el, img, right,res,uid) {
    //var sbit=getSet(73)
      clearTimeout(allowHidePhoto);
     // PrepLang();
      //profileInfoVars(res.profile);
      //var boxcont=utf2win(getTopProfileBlock(res.profile,true));
      //vk_ProfileBox(boxcont,utf2win(username),uid);
    if (!ge("vkbigPhoto")) {
            var html = '<div id="vkbigPhoto" onmousemove="clearTimeout(allowHidePhoto);" onmouseout="vkHidePhoto()" style="z-index:1000;display:none;position:absolute;padding:5px;border:#CCCCCC 1px solid;background:#FFFFFF">' + '<a href="#" id="vkbigPhotoLink"><img id="vkbigPhotoImg" src="" style="" /></a>' + '</div>';
            div = document.createElement('div');
            var body = document.getElementsByTagName('body')[0];
            div.innerHTML = html;
            body.appendChild(div);
    }
    var p = ge('vkbigPhoto');
    var pi = ge('vkbigPhotoImg');
	pi.src = "http://vkontakte.ru/images/upload.gif";
	ge('vkbigPhotoLink').href="/"+(String(uid).match(/^\d+$/)?'id':'')+uid;
    var onload = function(){
      if (allowShowPhoto) show('vkbigPhoto');
      /*if (sbit==2) {
        p.innerHTML=boxcont;
        p.style.width="430px";
      }*/
      var xy=getXY(el); 
      var height=getScrollTop()+getScrH();    
      var top= (xy[1]+p.offsetHeight>height)?height-p.offsetHeight-10:xy[1];
      top=(top<getScrollTop())?getScrollTop():top;
      
      var left=xy[0] - p.offsetWidth + 10;
      if (left<0) left=0;
      //alert(getScrollTop()+"\n"+getScrH()+"\n"+height+"\n"+(xy[1]+el.offsetHeight)+"\n"+el.offsetHeight);
      if (right) {
        p.style.left = (xy[0] + el.offsetWidth + 10) + "px";
        p.style.top = top+"px";
        
      }else {
        p.style.left = left+"px";//(xy[0] - p.offsetWidth - 10)+"px";
        p.style.top = top+"px";
      }
    };
    //if (sbit==1){
      if(pi.src != img){
        pi.src = img;
      }
    /*  addEvent(pi, 'load', onload);
    }else*/ 
    //}
    onload();
}
function vkHidePhoto() {
    allowShowPhoto=false;
    clearTimeout(allowShowPhotoTimer);
    allowHidePhoto=setTimeout(function(){ fadeOut('vkbigPhoto');//hide('vkbigPhoto');
      //ge('vkbigPhotoImg').src = "http://vkontakte.ru/images/upload.gif";
    },200);
}
//javascript: vkGetProfile(13391307);
var VK_PROFILE_TPL='\
<div class="vk_profile_info">\
	<div id="vk_profile_block" class="vk_profile_block clear_fix">\
		<div class="vk_profile_left fl_l" onmouseover%nb%="fadeIn(\'vk_profile_toogle\')" onmouseout%nb%="fadeOut(\'vk_profile_toogle\')">\
			<div class="vk_profile_ava"><a href="/id%UID%" onclick="return nav.go(this, event);"><img src="%AVA_SRC%"/></a></div>\
			<div style="margin-top:-2px;"><a id="vk_profile_toogle" onclick="return vkProfileToggle();" style="display:none;">&#9668;</a></div>\
		</div>\
		<div id="vk_profile_right_block" class="vk_profile_right fl_r">\
		  <div class="vk_profile_header">\
			<div class="vk_username">%USERNAME%<small class="vk_profile_online_status fl_r">%ONLINE%</small></div>\
			<div class="vk_profile_header_divider"></div>\
			<div><small>%ACTIVITY%</small></div>\
		  </div>\
		  <div class="vk_profile_info_block">\
			%PROFILE_INFO%\
			<div>%RATE%</div>\
			<div>%COMMON_FR%</div>\
		  </div>\
		 <!--<div style="background:#DDD; padding:30px; text-align:center; color:#888; font-weight:bold; font-size:30pt; margin-top:10px;">WTF?</div>-->\
		</div>\
	</div>\
</div>\
';

function vkProfileToggle(init){
	var CFG=23;
	if (init){
		if (getSet(CFG)=='n'){
			hide('vk_profile_right_block');
			ge('vk_profile_block').style.width='200px'; 
			ge('vk_profile_toogle').innerHTML='&#9658;';
		}
		hide('vk_profile_toogle');
		return false;
	}
	
	toggle('vk_profile_right_block'); 
	if (isVisible('vk_profile_right_block')){
		ge('vk_profile_block').style.width='450px'; 
		ge('vk_profile_toogle').innerHTML='&#9668;';
		setCfg(CFG,'y');
	} else {
		setCfg(CFG,'n');
		ge('vk_profile_block').style.width='200px'; 
		ge('vk_profile_toogle').innerHTML='&#9658;';
	}
	return false;
}

function vkGetProfile(uid,callback,no_switch_button){
      var make_rate=function(rate){
	    var fullwidth=200;
		var level=Math.ceil(Math.log(rate)/Math.log(10));
		var lvl_class = level<3?'vk_rate_lvl_0':'vk_rate_lvl_'+level;
		if (level>5) lvl_class='vk_rate_lvl_5';
		var rate_text=rate+((rate<=100)?'%':'');
		if(rate>=90000) rate_text=rate+'$';

		var percentwidth=rate*(1/Math.pow(10,level<3?2:level))*fullwidth;
		var html='<div class="vkrate '+lvl_class+'">'+
			'<div class="vk_rate_left" style="width:'+percentwidth+'px;">  </div>'+
			'<div class="vk_rate_right" style="width:'+fullwidth+'px;"> </div>'+
			'<div class="vkpercent" style="width:'+fullwidth+'px;">'+rate_text+'</div>'+
		  '</div>';
		return html;
	  }
	  make_rate(361);
	  var MakeProfile = function(r){
		if (!r.response || !r.response.profile) return;
		var profile=r.response.profile;
		var activity=r.response.activity;
		var country=r.response.country;
		var city=r.response.city;
		var common='';
		
		var username='<a href="/id'+uid+'" onclick="return nav.go(this, event);">'+profile.first_name+' '+profile.nickname+' '+profile.last_name+'</a>';
		var ava_url=profile.photo_big;
		var online=profile.online?'Online':'';//'Offline';
		var rate=make_rate(profile.rate);
		
		if (r.response.common){
			var fr=r.response.common;
			common='<div class="vk_profile_common_fr_header" onclick="slideToggle(\'vkp_commfr\');">'+IDL('CommonFriends')+' ('+fr.length+')</div>';
			common+='<div class="vk_profile_common_fr" id="vkp_commfr" style="display:none;">';
			for (var i=0; i<fr.length;i++){
				common+='<a href="/id'+fr[i].uid+'" onclick="return nav.go(this, event);">'+fr[i].first_name+' '+fr[i].last_name+'</a>';
			}
			common+='</div>';
			//alert(common);
		}
		
		var info_labels=[
			[profile.bdate, Birth_date[1]],
			[country,Country],
			[city,select_city],
			[profile.mobile_phone, Contact_mob_tel_abbr],
			[profile.home_phone, Contact_home_tel_abbr],
			[profile.university_name,select_university_name],
			[profile.faculty_name,Faculty],
			[profile.graduation,select_graduation]
		];
		var info_html='';
		for (var i=0; i<info_labels.length;i++)
			if (info_labels[i][0] && info_labels[i][0]!='0')
			info_html+='<div class="clear_fix miniblock">\n\
					  <div class="label fl_l">'+info_labels[i][1]+'</div>\n\
					  <div class="labeled fl_l">'+info_labels[i][0]+'</div>\n\
					</div>';
		var html=VK_PROFILE_TPL.replace("%AVA_SRC%",ava_url)
							   .replace("%UID%",uid)
							   .replace("%USERNAME%",username)
							   .replace("%ACTIVITY%",activity)
							   .replace("%RATE%",rate)
							   .replace("%ONLINE%",online)
							   .replace("%PROFILE_INFO%",info_html)
							   .replace("%COMMON_FR%",common);
		if (no_switch_button) html=html.replace(/%nb%/g,'_'); else html=html.replace(/%nb%/g,'');
		html=vkModAsNode(html,vkAddUserMenu);
		callback(html,uid);
		//uApi.show(r);	
	  };
	  if (!window.VK_CURRENT_PROFILES_DATA) VK_CURRENT_PROFILES_DATA={};
	  if (VK_CURRENT_PROFILES_DATA['uid'+uid]) 
		MakeProfile(VK_CURRENT_PROFILES_DATA['uid'+uid]);
	  else {
		  code  = 'var activity=API.status.get({uid:"'+uid+'"});';
		  code += 'var profile=API.getProfiles({uids:"'+uid+'",fields:"nickname,photo_big,online,rate,bdate,city,country,contacts,education,can_post,can_write_private_message"})[0];';
		  code += 'var commonfr=API.friends.getMutual({target_uid:"'+uid+'"});';
		  code += 'var commons=API.getProfiles({uids:commonfr,fields:"online"});';
		  code += 'return {';
		  code += 'profile:profile';
		  code += ',activity:activity.text';
		  code += ',country: API.getCountries({cids: profile.country})[0].name';
		  code += ',city: API.getCities({cids: profile.city})[0].name';
		  code += ',common:commons';
		  code += ',now:API.getServerTime()';
		  code += '};';
		  dApi.call("execute", {'code': code}, function(r){
			//alert(print_r(r));
			if (r.response && r.response.profile) VK_CURRENT_PROFILES_DATA['uid'+uid]=r;
			MakeProfile(r);
		  });
	  }
}

/////////////////
// UPD FRIENDS //

function vkCheckFrLink(){
	if (getSet(9)=='y' && !ge('section_frcheck')){
		var ref=ge("section_suggestions");
		var sec=vkCe('a',{href:'#', onclick:"vkFriendsCheckRun(true);return false;",id:'section_frcheck',"class":"side_filter"},IDL("refreshList"));
		ref.parentNode.insertBefore(sec, ref.nextSibling);//
		return;
	}
}

function vkFriendsCheckRun(cl){
		if ((getSet(9) == 'y') && (!vkgetCookie('IDFriendsUpd') || cl)) {
			vkAlertBox(IDL('FriendsListTest'),IDL('RefreshFrListConfirm'),function(){//yes
				vkFriendsCheck();
			},
			function(){//no
				if (vkgetCookie('IDFriendsUpd') != null) vksetCookie('IDFriendsUpd', vkgetCookie('IDFriendsUpd'), 1);
				else vksetCookie('IDFriendsUpd', '_', 1);			
			});
			/*
			if (confirm(IDL('RefreshFrListConfirm'))) //Refresh friendsList NOW ?
			else {	

			}*/
		}
}
function vkFriendsCheck(nid){
  var NID_CFG=2;//sett in - segments
  var FUPD_CFG=1;//days
	
  if (!window.FrUpdBox || isNewLib()) FrUpdBox = new MessageBox({title: IDL('FriendsListTest'),closeButton:true,width:"350px"});
  var box=FrUpdBox;
  var addButton=function(_box,label,callback,style){  _box.addButton(!isNewLib()?{onClick: callback, style:'button_'+(style?style:'no'),label:label}:label,callback,style);};		
  var html='\
    <div class="vkfrupl">\
    <div id="vkfrupdloader" class="box_loader"></div><br>\
    <div class="vkcheckbox_off" id="vkfrupdck1"></div><span>'+IDL('FrListLoading')+'</span><br>\
    <div class="vkcheckbox_off" id="vkfrupdck2"></div><span>'+IDL('FrListLoadingNote')+'</span><br>\
    <div class="vkcheckbox_off" id="vkfrupdck3"></div><span>'+IDL('FrListSaveNote')+'</span><br><br>\
    <div id="vkfrupdresult"></div>\
    </div>\
  ';
  box.removeButtons();
  addButton(box,IDL('Hide'),box.hide,'no');
  box.content(html).show();
  
  var UseOldNote=function(){
	setSet('-',nid,NID_CFG);
	box.hide();
	vkFriendsCheck(nid);// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  };
  var frList=function(callback){ //callback(friendsData,PostData,FriendsCount);
    AjGet('/friends_ajax.php',function(r,t){
		if (!t || !t.length) {alert(IDL('FrListError')); box.hide(200); return;}
		var res=eval('('+t+')');
		var fr=res.friends;
		var fids=[];
		for (var i=0;i<fr.length;i++)  fids.push(fr[i][0]);
		var PostData=fids.join('-');
		var FrCount=fids.length;
		callback(fids,PostData,FrCount);
	});
  };
  var newNote=function(){
	box.setOptions({title:IDL("NoteCreating")});
	box.removeButtons();
	addButton(box,IDL('Hide'),box.hide,'no');	
	box.content('<div class="box_loader"></div>');
	frList(function(fids,str,cnt){
		dApi.call('notes.add',{title:'friends_ok_'+cnt,text:str,privacy:3},function(r){
			var nid=r.response.nid;
			setSet('-',nid,NID_CFG);
            setTimeout(function(){box.hide(); vkFriendsCheck(nid);},300);	
		});	
	});
  };  
  var searchNote=function(){
	dApi.call('notes.get',{count:100},function(r){
		if (r.error && r.error.error_code==180){
			setTimeout(newNote,300);
			return;
		}
		var notes=r.response;
		notes.shift();
		var note=0;
		for(var i=0; i<notes.length;i++)	
			if (notes[i].title.match(/friends_ok_\d+/) && notes[i].text.match(/[\d-]+/))	{note=notes[i]; nid=note.nid; break;}
			
		if (note){
		  box.removeButtons();
		  addButton(box,IDL('Cancel'),box.hide,'no');
		  addButton(box,IDL('No'),newNote,'no');
		  addButton(box,IDL('Yes'),UseOldNote,'yes');
		  box.content(IDL('FrNoteFound').replace('{note}','<a href="note'+note.uid+'_'+note.nid+'" target="blank">'+note.title+'</a>'));//.show();
		} else setTimeout(newNote,300);
		
	});
  };

	var friends_check=function(){
		box.removeButtons();
		addButton(box,IDL('Hide'),box.hide,'no');
		ge('vkfrupdck1').className='vkcheckbox_on';
		frList(function(fids,PostData,cnt){
			dApi.call('notes.getById',{nid:nid},function(r){
				//uApi.show(r);
				if (r.error && r.error.error_code==180){
					searchNote();
					return;
				}
				ge('vkfrupdck2').className='vkcheckbox_on';
				var text=r.response.text;
				var note=text.match(/[\d-]+/);
				if (!note) {alert(IDL('FrListNoteError')); searchNote(); return;}
				var nfids=note[0].split('-');
				if (parseInt(nfids[0])==nfids.length-1) var ncount=nfids.shift();
				var i=0;
				while (i<nfids.length){
					for (var j=0;j<fids.length;j++)
					  if(parseInt(fids[j])==parseInt(nfids[i])){
						fids.splice(j,1);
						nfids.splice(i,1);
						i--;
						break;
					  }
					i++;
				}
				//
				vksetCookie('IDFriendsUpd', nfids.join('-')+'_'+fids.join('+'), getSet('-',FUPD_CFG)); 
				vkShowFriendsUpd();
				dApi.call('notes.edit',{nid:nid,title:'friends_ok_'+cnt,text:PostData,privacy:3},function(r){
					ge('vkfrupdck3').className='vkcheckbox_on';
					hide('vkfrupdloader');
					var remadd=vkShowFriendsUpd(true);
					  if (!remadd) ge('vkfrupdresult').innerHTML='<b>'+IDL('WithoutChanges')+'</b>';
					  else {
						  ge('vkfrupdresult').innerHTML='<table width="100%"><tr valign="top"><td>'+remadd.rem+'</td><td valign="top">'+remadd.add+'</td></tr></table>';
						  vkProccessLinks(ge('vkfrupdresult'));//AddExUserMenu
						  var fids_x=fids.concat(nfids);
						  dApi.call('getProfiles',{uids:fids_x.join(',')},function(r){//fids.join(',')+','+nfids.join(',')
							//alert(print_r(r));
							for (var i=0;r.response && i<r.response.length;i++){
							  var user=r.response[i];
							  var elem=ge('vkfr'+user.uid);
							  if (elem) elem.innerHTML=user.first_name+' '+user.last_name;
							  
							}
							vkProccessLinks(ge('vkfrupdresult'));
						  });
					  }
					
					
					/*var nid=r.response.nid;
					vkFriendsCheck(nid);*/
				});	
			});
		});
	};  
  if (!nid) nid=getSet('-',NID_CFG);
  nid=parseInt(nid); 
  if (FriendsNid[remixmid()]) nid=FriendsNid[remixmid()];
  if (nid == 0) {searchNote();};
  if (nid) friends_check();
}

function vkShowFriendsUpd(ret,names){
  var el=ge('remadd');
  var idfrupd=vkgetCookie('IDFriendsUpd');
  var html={rem:"",add:""};
  if (!idfrupd || vkgetCookie('IDFriendsUpd') == '_') {if (el) el.parentNode.removeChild(el); return;}
  idfrupd=vkgetCookie('IDFriendsUpd').split('_');
  var onclick="vkShowFriendsUpd(false,["+idfrupd.join(',').replace(/\+|\-/g,",").replace(/(^,|,$)/g,"")+"])";
  if (idfrupd[0].length){
    var rem=idfrupd[0].split('-');
    html.rem+='<div class="leftAd  left_box" style="margin-bottom:10px"><h4 onclick="'+onclick+'"><span class="linkover">'+IDL("delby")+'</span></h4><p><div style="text-align: center">';
    for (var i=0;i<rem.length;i++)   html.rem+='<a id="'+(ret?'vkfr':'vkfrsb')+rem[i]+'" href="id'+rem[i]+'">'+rem[i]+'</a><br>';
	  html.rem += '</div></p></div>';
  }
  if (idfrupd[1].length){
    var add=idfrupd[1].split('+');
    html.add+='<div class="leftAd left_box" style="margin-bottom:10px"><h4 onclick="'+onclick+'"><span class="linkover">'+IDL("addby")+'</span></h4><p><div style="text-align: center">';
    for (var i=0;i<add.length;i++)   html.add+='<a id="'+(ret?'vkfr':'vkfrsb')+add[i]+'" href="id'+add[i]+'">'+add[i]+'</a><br>';
	  html.add += '</div></p></div>';
  }
  
  if (ret) return html;
  if (!el){
      var el=document.createElement('div');
			el.id="remadd";
			sideBar().appendChild(el);
  }
  el.innerHTML=html.rem+html.add;
  vkProccessLinks(el);//AddExUserMenu
  if (names) dApi.call('getProfiles',{uids:names.join(',')},function(r){
    for (var i=0;r.response && i<r.response.length;i++){
            var user=r.response[i];
            var elem=ge('vkfrsb'+user.uid);
            if (elem) elem.innerHTML=user.first_name+' '+user.last_name;
    }
    vkProccessLinks(el);
  });
}
//  UPD_END  //
//////////////
//*
function vkFriendsIdsGet(callback){
		dApi.call('friends.get',{},function(r){
			callback(r.response);
		});
}


function vkFriendsBySex(add_link){
	if (add_link  && !ge('section_slists')){
		var ref=ge("section_suggestions");
		var sec=vkCe('a',{href:'#', onclick:"vkFriendsBySex();return false;",id:'section_slists',"class":"side_filter"},IDL('FrSexToLists'));
		ref.parentNode.insertBefore(sec, ref.nextSibling);//
		return;
	}
	if (add_link) return;
	
	var RunMake=function(){
		dApi.call('friends.get',{fields:'sex'},function(r){
			var fr=r.response;
			var res=[[],[],[]];  // [0] - WTF?	[1] - Female [2] - Male
			for (var i=0;i<fr.length;i++){
				res[fr[i].sex].push(fr[i].uid);
			}
			for (var i=0;i<3;i++) if(res[i].length){
				makecat(ge('frcat'+i).value,res[i],i);
			}
			box.removeButtons();
			box.addButton(IDL('Cancel'),box.hide,'no');
		});
	};
	
	var makecat=function(title,friendsList,idx){
		box.removeButtons();
		box.addButton(IDL('Cancel'),box.hide,'no');
		var elem=ge('frcatp'+idx);
		elem.innerHTML=vkLdrImg;
		dApi.call('friends.getLists',{},function(r){
			var listId=0;
			var cats=r.response;
			for (var i=0;i<cats.length;i++)
				if (cats[i].name==title) listId=cats[i].lid;	
			AjPost('al_friends.php',{act:'edit_list_title_box', cat_id: listId,al:1},function(r,t){		// also hash in /al_friends.php?act=edit_list_hash&cat_id=0&al=1
				var hash=t.split('cur.saveList(')[1].split("'")[1];
				AjPost('al_friends.php', {act: 'save_list', title: title, cat_id: listId, friends: friendsList.join(','), hash: hash},function(r, t) {
					elem.innerHTML="<b>OK</b>";	
					box.removeButtons();
					box.addButton(IDL('OK'),box.hide,'yes');
				});
			});
		});
	};
	
	var box=new MessageBox({title: IDL('ParseFriends'),closeButton:true,width:"350px"});
    vkaddcss("\
        .vkfrbx input{width:150px; margin-right:5px; margin-top:3px;}\
    ");	
	box.removeButtons();
	box.addButton(IDL('Cancel'),box.hide,'no');
	box.addButton(IDL('OK'),RunMake,'yes');
	var html='<div class="vkfrbx">'+IDL('FrToCatsBySex')+':<br>'+
		  '<span id="frcatp1"><input type="text" id="frcat1" value=":-*"></span> -'+Sex_fm+'<br>'+
		  '<span id="frcatp2"><input type="text" id="frcat2"  value="^_^"></span> -'+Sex_m+'<br>'+
		  '<span id="frcatp0"><input type="text" id="frcat0"  value="WTF?"></span> -'+IDL('Sex_other')+
		  '</div>';
	box.content(html).show();
}//*/

function ProcessHighlightFriendLink(link){
	var href=link.getAttribute('href');
	if (!window.vk_friends_id_list){
		vk_friends_id_list='0,0|';
		vkHighlightFriends();
		return;
	}
	if (vk_friends_id_list=='') return;
	if (href && href!=''){
		var id=href.split('/');
		id=id[id.length-1];
		id=id.split('?')[0].split('#')[0];
		var list=','+vk_friends_id_list+',';
		if (list.indexOf(','+id+',')!=-1){
			//link.setAttribute('is_friend','true');
			addClass(link,'vk_my_friend');
		}
	}
}
function vkHighlightFriends(){
	var check_time=1;//hour
	var fr=vkGetVal('vk_friends_ids');
	var load_friends=function(callback){
		var vkFr=[];
		dApi.call('friends.get',{fields:'domain'},function(r){	
			for (var i=0;i<r.response.length;i++){
				var user=r.response[i];
				vkFr.push(user.domain);
				if (user.domain != 'id'+user.uid) vkFr.push('id'+user.uid);	
			}
			vk_friends_id_list=vkFr.join(',');
			var result=unixtime()+','+remixmid()+'|'+vk_friends_id_list;
			vkSetVal('vk_friends_ids',result);
			vklog('friends loaded from API. highlighting...');
			highlight();
		});
		
	
	};
	var highlight=function(){
		var nodes=ge('content').getElementsByTagName('a'); 
		for (var i=0;i<nodes.length;i++)  ProcessHighlightFriendLink(nodes[i]);
	};
	if (fr && fr!=''){
		var arr=fr.split('|')[0].split(',');// ft="time,remixmid,id1,id2,id3,id3..idN";
		vk_friends_id_list=fr.split('|')[1];
		var time=parseInt(arr.shift());
		var mid=parseInt(arr.shift());
		var dif=(unixtime()-time)/(1000*60*60);
		if (dif>check_time || mid!=parseInt(remixmid())) load_friends(highlight);
		else vklog('friends loaded from LocalStorage. highlighting...');
	} else if (!fr || fr==''){
		load_friends(highlight);
	}
}
/*
(function(){
  document.addEventListener('DOMContentLoaded',vk_user_init, false);
})();*/

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;