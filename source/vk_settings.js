// ==UserScript==
// @name          VKOpt 2.x
// @author        KiberInfinity( /id13391307 )
// @namespace     http://vkopt.net/
// @description   Vkontakte Optimizer 2.x
// @include       *vkontakte.ru*
// @include       *vk.com*
// @include       *durov.ru*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//

function InstallRelease(){
  var err=[];
  if (window.IDNamesInColsV || window.IDEnterGroup || window.sync_plctrl_timeout || window.SyncPctrls || window.vk100Photos || 
      window.IDNewsObzor || window.AjMsgFormTo || window.IDAddFriend || window.IDAdmDelTopic || window.IDpostMatch || window.IDAppsProf)
      err.push(IDL('ErrOldVkoptFound'));
  
  var cur_ver=vkgetCookie('vkOVer');
  cur_ver=cur_ver?cur_ver.split('_'):[0,0]; 
  var vver=parseInt(cur_ver[0]) || 0;
  var vbuild=parseInt(cur_ver[1]) || 0;
  
  if (vbuild && vbuild<vBuild) vkCheckSettLength();
  
  if ((!window.IDBit || window.IDBit=='') && (!vver || vver<vVersion)){
  if (!vver || vver<200) vksetCookie('remixbit',DefSetBits);
	  vksetCookie('vkOVer',String(vVersion));
	  vksetCookie('vkplayer','00-0_0');
	  if (!vkgetCookie('remixbit')) vksetCookie('remixbit',DefSetBits);
	  vkCheckSettLength();
	  
	  if (!window.vkMsg_Box) vkMsg_Box = new MessageBox({title: IDL('THFI'),width:"495px"});
	  vkMsg_Box.removeButtons();
	  vkMsg_Box.addButton(!isNewLib()?{
		onClick: function(){vkMsg_Box.hide( 200 );},
		style:'button_no',label:'OK'}:'OK',function(){vkMsg_Box.hide( 200 );},'no');
	  var cont=IDL('YIV')+'<b>'+String(vVersion).split('').join('.')+'</b> (build <b>'+vBuild+'</b>)<br><br>'+IDL('INCD')+'<b>'+IDL('FIS')+'</b>';
	  //cont='<table><tr><td>'+cont+'</td><td>'+hz_chooselang(true)+'</td></tr></table>'
	  cont+='<br><br>'+hz_chooselang(true);
	  vkMsg_Box.content(cont).show();

  }
  if (err.length) vkAlertBox(IDL('Error'),err.join('<br>'));
  return false;
}
	
function vkLocalStorageMan(ret){
  if(!ret){
	  if (!window.localStorage) return false;
	  //if (!window.vkLocalStorageBox) 
		vkLocalStorageBox = new MessageBox({title: IDL('LocalStorage')+' (vkontakte)', width:"570px"});
	  var Box = vkLocalStorageBox;
	  Box.removeButtons();
	  Box.addButton(IDL('Cancel'),Box.hide,'no');
	  /*{
		onClick: function(){ Box.hide(200); Box.content(""); },
		style:'button_no',label:IDL('Cancel')});*/
  }
  vkGetLsList=function(){
    var res='';
    for (var key in localStorage){
      if (key=='length') continue;
      res+='<div class="lsrow" id="lsrow_'+key+'" onclick="vkLsEdit(\''+key+'\')">'+
      '<div class="lskey">'+replaceChars(key)+'</div>'+
      '<div class="lsval">'+replaceChars(localStorage[key])+'</div>'+
      '</div>';
    }
    return res;
  }
  vkLsDelVal=function(key_){
    localStorage.removeItem(key_);
    ge('LsList').innerHTML=vkGetLsList();
    ge("LsEditNode").innerHTML='';
  }
  vkLsSaveVal=function(key_){
    localStorage[key_]=ge('LsValEdit').value;
    ge('LsList').innerHTML=vkGetLsList();
    //ge("LsEditNode").innerHTML='';
  }  
  vkLsNewKey=function(key_){
    localStorage.removeItem(key_);
    ge('LsList').innerHTML=vkGetLsList();
    el=ge("LsEditNode");
    el.innerHTML='<u>Key:</u> <input type="text" id="LsValNameEdit"/><br>'+
                 '<u>Value:</u><br><textarea id="LsValEdit" rows=5 cols=86  style_="height:100px; width:100%;"></textarea><br>'+
                 '<div style="padding-top:5px;">'+vkRoundButton(['Save key',"javascript:vkLsSaveNewVal()"])+'</div>';

  }
  vkLsSaveNewVal=function(){
    var key_=ge('LsValNameEdit').value;
    localStorage[key_]=ge('LsValEdit').value;
    ge('LsList').innerHTML=vkGetLsList();
    vkLsEdit(key_);
    //ge("LsEditNode").innerHTML='';
  }
  vkLsEdit=function(_key){
    el=ge("LsEditNode");
    el.innerHTML='<u>Key:</u> <b>'+_key+'</b><br>'+
                 '<u>Value:</u><br><textarea id="LsValEdit" rows=5 cols=86  style_="height:100px; width:100%;">'+localStorage[_key]+'</textarea><br>'+
                 '<div style="padding-top:5px;">'+vkRoundButton(['Save key',"javascript:vkLsSaveVal('"+_key+"')"],['Delete key',"javascript:vkLsDelVal('"+_key+"')"])+'</div>';
    el=geByClass('lsrow_sel')[0];
    if (el) el.className='lsrow';
    ge('lsrow_'+_key).className='lsrow_sel';
  }  
  var html='<div class="lstable" id="LsList">';
  html+=vkGetLsList();
  html+='<div style="clear:both"></div></div>';
  html+='<div style="padding-top:5px;">'+vkRoundButton(['New key',"javascript:vkLsNewKey()"])+'</div>';
  html+='<div id="LsEditNode" style="padding-top:10px;"></div>';
	if (ret) 
		return html;
	else
		Box.content(html).show(); 
}


function vkSettingsPage(){
	vkOpt_toogle();
	if (!ge('vkopt_settings_tab') && ge('settings_filters')){
		var li=vkCe('li',{id:'vkopt_settings_tab'});
		li.innerHTML='\
			<a href="/settings?act=vkopt" onclick="return checkEvent(event)" onmousedown="return vkShowSettings();">\
			<b class="tl1"><b></b></b><b class="tl2"></b>\
			<b class="tab_word">VkOpt</b>\
			</a>'; 
		ge('settings_filters').appendChild(li);
	}
}
function vkLoadVkoptConfigFromFile(){
  vkLoadTxt(function(txt){
	try {
	  var cfg=eval('('+txt+')');
	  /*alert(print_r(cfg));*/
	  for (var key in cfg) if (cfg[key]) 
		vksetCookie(key,cfg[key]);
	  alert(IDL('ConfigLoaded'));
	} catch(e) {
	  alert(IDL('ConfigError'));
	}
  },['JSON File (vkopt config *.json)','*.json']);
}

function vkGetVkoptFullConfig(){
  var sets={
	remixbit:vkgetCookie('remixbit'),
	remixumbit:vkgetCookie('remixumbit'),
	//AdmGr:vkgetCookie('AdmGr'),
	FavList:vkGetVal('FavList'),
	//VK_CURRENT_CSS_URL:vkGetVal('VK_CURRENT_CSS_URL'),
	WallsID:vkGetVal('WallsID')
  }
  
  var temp=[];
  for (var key in sets) if (sets[key]) temp.push(key+':'+'"'+sets[key]+'"');
  var config='{\r\n'+temp.join(',\r\n')+'\r\n}';
  vkSaveText(config,'vksetts_id'+remixmid()+'.json');
  //alert(config);
}

function hz_chooselang(no_reload){
	vkaddcss('\
	#hz_lang{margin:auto;width:'+(!no_reload?'240pt':'470px')+';height:'+(!no_reload?'180pt':'120pt')+';}\
	#hz_lang a{text-align:center;display:block;float:left;padding:2pt 5pt;margin:2pt;border:solid 1pt #5c82ab;background:#fff;width:100pt;height:50pt;}\
	#hz_lang a{ \
    -o-transition: all 0.25s ease-out;\
    -webkit-transition: all 200ms linear;\
    -moz-transition: all 200ms linear;\
    -o-transition: all 200ms linear;\
    transition: all 200ms linear;\
  }\
  #hz_lang a:hover,#hz_lang a:focus{text-decoration:none; color:#fff;background:#476d96;}\
	#hz_lang img{margin:auto;display:block;clear:both;width:48px;height:48px;}\
	#hz_lang img#be{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAVBSURBVHja7JnLb1VFHMc/M+d17+3rttrWVlCEPoACUhQogguNBuMGA4agaKImLEx0gf+AWzeuCYkmBlGj0YhxadSgtZSqQGkrIDEFSsujrb193Pae14yL29Lb0pZCjD2N/SWTM3PmN4/v+T1njtBas5hJsshpCcASgP87AAEYgDP+XEwUAq4JFPZc7vs7zwgJWtsw6tYiTAv/1GmsTfVgm4y+czCSCCqOflRiAkVFeSZOaoggncIYHQTbJhwbwkinMIorCRu2Rm7zmaZmgCITcEInhh5IYTy8AtVzHbTCWPkIqrsbs6YKNTCQHaU1CHHn2afz3eu4WXhkUSFoBeCYAGp4BNXXh1m/AdXcgnY95Ib1qKZmdCqF9n3E+MQzRe7pfXPxTvRrrW/xzcQ7wTNjPQjQSgFgAsi8BCIvgerqBstCSInq7gHHRhQWQhAyV8Kh79CejX++c06vCz8EpScBqNExZEkJ3vc/YjVsAdvGP/4z1vZt6JE02vcipf/a90CFORKIOWjXxVhTixpJgx7BWLsa7XkQj6E9P1oAPA/CHBXSvk94/gLmpo14jU2QcbF3PoP/UyNm3drsgCgBcL2pNoBlIZcvQ126glFehg41qvMSxvJlkIijPTdiACwIc1RIj40h8hJkvvgKZ/cuZDxO5sinxF7Zl7UBN2ISsFx0rg2IRILwwkVU52X8X08hbAvV1YV/5izxhi1oN2ISMIypNqBcj6CpGblyBaTTqJSPrK0hONGM3r8PogZASgiDHAlYFrKmBv9kC2b9o6AU/okWjOpqSCRQmWgBEAh0qKfagFlbhax4AHWtBz06hvP8ToRto4cGI+eFEGJqHNAZl+D0WYyaKsh4CMuEICTo/BO5ri56XshzQcicQJYsAhWS+eRznD27wLRwvz6GsWoVsqI8cl4IQJhmjgRcD1m1Cnn9JqrrKvgBsqwMo7YanXEns9H\/\/Kw1e7ZklJTkBDLHIWjrIOz4A3PzY4iYhf9LExgG9t49aLUQd0dzr6lz3WjY34/l+8Ree5WgvQNME/vF3YSdl1BXrmbz9IiRyjViHBvz8U3owSFwHHQ6DVJirluDKE5GDoAwjVsSkAA6FsM/cZKxwx8iEnFkSQmZIx/jffcDoiAflMqegFRO0er29zqnzNQ3F99M7dnWURqCnECmPI+g5TdkYT5Baxu4HiKRR9DyOwyPZCWg53Eq0XdxKuEux+npNpADANvGfu5ZRt97H2fvbkRxkszRz4gdeB1RnOTdQ3akVMiUFoQSdk1IYHAIs34jxsoV2E8/BQX5+McbsXZsR93sncchkQXzUtk4EI+hBlLE33oT1d8Pfb3ED76NHhhAJIvQMwHQ4656vmuJf3f74fh5QAKojEvQ2ISxuprgTCt+Uwtm3Wr85pPowaGsCYwX9KRAJtq572eqa7htjju1Z5sv6xAFSuupgczavo2w/RzmujpQiuBsO9bmzYhkcooK3a0t63u4xZjPLYdSwaQEwqFBRHER7jffIisrMGqqcb88hryvGL0gacQ8kgydezudX0B48S+cPS8QnjtPcPJXnJf3EnScQ5aVRvJedEKFshJIpdBXu7GeaEAPDqJu3MRs2ILu60f1XIueBIS4dbElAUQyiXhoOUFrG6IoiSgrJWxrR5Tej3ywMoLff5oRy9E0RnUVmUOHcfa/BPE47uEPcA68gUqliJl5RJVMIOwdGMUrKCbY+iRG+TKEYxM07MAsq0RcucFQajiq+w8FUA6sB0pZXNQLtAmyv5cKxp+LiVxgWCz9qV8CsARgCcCC0j8DAMfW4S5zwrjbAAAAAElFTkSuQmCC");}\
	#hz_lang img#ru{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAGtSURBVHja7JlLTsQwDIY/ZwqDEC8hRlyALXvuxZKDsWTDDTgG4iFGYmipbRbToZkBVPESsog3jdqkzV//v+M44u5EtkRwKwAKgP8OQIARMO6ukUyBugJ23P025N8X2U/AbmAG7aaOPlFtXKJQAVAAFAAFwP8GUAGcnJ4z2dvgsW5DTHpzXHF9/9QDUHNmdUvdKADeZXlDlvdbtD8a61n2mLcZ6Pve9wSwbitcAbTmzBqjfrYQHnCE1jIA5s7DYxOG9/WzkpJkHlCnVYsl3lHKNWDcTOs3O52fLrh89535+IOdcUYhg9XykP8Kd39uvBm5B5RoBS41XdZASkKrHoT//VznHlADJ44XXNAlAGaAEIlFSxS6vDijMsOb5ksr46rAZGDVZmA1HlqpZX2NNo046qOQ4fgghfwb9z7bd+iZdWGoA6AgiTAccjDXPp12dxCJIwCRV7ZUAK42LywGUrF3qU9aJHPRPLBIp3sKBTNfBSCBPCCZBsKK2DwPo13ETVtbITf1CnA3fYhYlFABDoFjYBJs8tfAlTA/H9gm3jlBDUylnNQXAAVAAfCn9jIAuSzTHtaxfZQAAAAASUVORK5CYII%3D");}\
	#hz_lang img#uk{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAJnSURBVHja7JlrahRBEMd/NZm4iMSID3IAEf3iEQSv4B08lnfwCkKO4BdBPIBIjEZwd2a7qvywM2PPy90VJCnc+jLT7/7Xo6uqW9ydyFQQnA4ADgD+dwACHAGL5huJFKhK4O6rN+++RuT+29cv75fAqeO8eHwWavPnnz4DnJbAwhzUnG/LGoDcuYlI9+/uFCJsc33uPhqXl1vd9S3j5ua+d/sWthm8KAHMnWSGmjWdsoXEcYd2XrXx9tu2dpzIptB38t7rn8/ZX9N7fab+1RxrKkoAN6dOxlptxJWWU/mXQd1Uvzkuk83BoF0m6qaoVsMtA5DcqdWo1ELof61G6knAnTop6xQEQNJOpcpWr2s16kASaO21AQDL2litYwA4LoyW1xsAbqxSoko6tryh1Y7ONabH+MxJwMDK56zZZ9oFjpOgnkvAYZmUSnVyb9dJU3soC0H7NmCsamW11iARqAxtwFm2KrQH5+f8wpymMeEn2NJ3aj0RsJ4fMGdZG1WQY9RdSDkAM+dqVYcJ5KqkFE0c0kkgBfEBnSEfFf1j9OJntTVa/Kt0yf8w566LNP3yoO7hnUXX9NS/P/mAXwTLJR8gpx+fNbGQIkS64HLcNQ/mEiIFkKJYAO4pzwe0uZ8IJIW+BHTHVOLmkNkIgANRjlIb2oA1AOJIwJtotOjEIbtGP/8i3tz3CJWhClmDxcOA8DwfaAuBVchuQOqyX4xilgGI+MzU7rn4fSsWSwItzzMJxFShLqHZ1J+EU6WSzUMBl5dXBCQV4Ax4DjwKtvkvwHth87x00nwjUQX8kMNL/QHAAcABwLXSrwEAP7t+bpCVzSsAAAAASUVORK5CYII%3D");}\
	#hz_lang img#us{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAPTSURBVHja7Jnva1tVGMc/J0l/JHVJbOcq6SYOtKmTlMFAZS+6vVDYi+E/oCtFEauISGuLL0QtwtCVyOgLHYgTOhCEMURfKL5RC4JYX4yE6Q0TofpuVdskTZPcH+f44t7cxNa0gifoxRw43Puc89yT53u+z3mePPcKpRRBbiEC3roAugD+7wAEEAb6vGuQmgPUI0D87Nk3fu/0r70nbmhfc/iTK4MRICGl4tSpY8zPP8qFCx/7CjrlPvq0Gl/96muAhADSZ86cNyYm7mNzswJAa24TwnM05Y6HBOyX+pTynmuRXzkW2d+qnQ+20REDMezvCyQX5sci7pjEtt0OkM2eY2Zm2VtLkM2eY3b2iud4imx2ktmZZXc9AW9lJ715haIpqxaot009pt8vF+YRQPqRh183HnzoXorFKrv3V7SMiR3zDVnQnhd3R5eWpvRHICFcBmxHYZo2S0tTTE+/6ytcuvSUNrnywTV9hkf7sdd+8bcnffr0a8bx43dTLG53LAq9yXV9ySsRx7yeI/Xl52MhAMeR1OsWpmljmjaXLz/j3/ty3d49X99Dv0U2TRthRfR1M4xQsSYDJ0++bIyOpiiXqx1j4MO3JzX+fwiBaREZubOVAZOrV2eo1y2/65TDhw7q6wcHCaeGmwycOPGSceTIEFtbtY4x8Ok7j+tlwLLoGbvHjUJSSqpVk3rdAmBlZYGJiVd9/X8qA6w/8ay+KBSLIm/92mQgk3nRSCYHqFbNjjHwEStaw6gqljicW/XygC2pbpusfneezPicl7Ihn19kPDPn56lcfpHM+JyftvI5T/ZyWS63SCYz52bwVn0F8aef1LcbkTBYNjy/6jKQTr9gdLq4LxQudiQTh1wGHGo1y++FwkWtcq1mdbSgSR89+pyxvl7qKAM/PlDRW0om4xy69n7zDEipqFSWGRhoJhydcvWbL7QCCA8NNRlIpaaNjY2tjjJw866f9LpOIs7It5+NCSDtOI4RCgWrvpdSEg6H3UMc5NeLEYCfh+8nYloo0wqE0aK3B7u3pwlA2Q4KUFI1Cqj2hVfbWnVXEbZ7XvzF/c75vYq/hp5UKMdpASClV8krkHtUlHKf6rGdMe3Gd4JSbTZF8Ge7BChHNgGM3LpBf39/oHy/VqtBNEpgD3HD5gjAWnKUWG8varsajEMci7Jtms2Xu/LvvFD6TyEQrs0NAAQxD7S60OHffiAejwfK/lKpBIlEcA+xlC1hdG0wze0HgsXAZrnkA3AANsolAtgcAQwDGeCOgBm/DuQF7uelA941SK0OlEX3S30XQBdAF8C/2v4YAPx7dIYulAWrAAAAAElFTkSuQmCC");}\
	#hz_lang img#it{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAALjSURBVHja7JnNbtNAEIC/sZ2kldJWaoWQ4FaJE+qBE4hn4BFAgrfgDXgQLpzhHVDviHdAgja0DSVe785wiOPa+aO4aVyLjGT5R5rd+XZmdnfWYma0WSJaLhuADcD/DpCISAz0gLgtRh8d7SUHB0/iw8PDNAF2X356d1q3sfcv3t7ImG+v3tTWff3xw4ME2FOM5w8fNzKavWdPa+mNPh9z/ONyOwF6ZoZq4Cz9BUB5aZPSs029r0J0MCh1YCB/6cGMaG8XTDmDTgKgpngNeA1zAcqGr3zd9j63q9qyiBTfZp69x1THSTwGMJx6Mg1VixdZLqsjsczP/77kWbIAamUAJVNPpn7tOWCZq6eTR0sCEMxw3uNCAwAuq6HjIChdkMIDachwIWsAoIYHUoep8qhDb+wBDTlAEx5IawB0IAS+ZoyuPOAdaXDrB0hreKCTYhro9rtRngPKKDjSJkIoreGBOIaguKHTPISU35kj9esHoA5AFEEe7oUHfqtjpOsH0NG/AwiCBasCpJlrzSyESHUdUFUu3GUjm7las5BLQaIrAG+Kb2AVrjsLAUiSVLcSg9GwEYDKbnQq0pdtuOL9/ZIHVNGGzodMF/W73B4LWs0Bo6EDrpoDp9XNnCeWqKgH7jqAJHHVA14VxVCsqAHErkKxKJSsVCqsqiZQXVz2Tdclk/40KgqhYiXGSlWRlWyz2YGyVZZmZrNtzatmbDoHygAhQJwDLKvA5I7kgBk6CaH9/X6iZpjJ4pG12yqIZ2vh60deDrCzc9ANGojiuJmZqC5AGE840cXJiTPTcXRYKSbNShdTl82P3XVJ6ZQiOR0O/ZaOA9wWxkq9xeY2PTA5VokmLyK0RkQEtTJAC38zTWwuAIRWuWAOQLtiqNh8Jn2IJjT97vbabYn6/RvpJ1s9FOD851mtBgYL9/PX1D8/v4l6EOA+cATca1kefwe+COPfSzv5vU2SAhey+VO/AdgAbAAalT8DANdU4nLzOiK9AAAAAElFTkSuQmCC");}\
	#hz_lang img#tat{background-image:url("data:image/png;base64,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");}\
	');
  no_reload=!!no_reload;
  var idx=0;
  var lng=[
	["ru","\u0420\u0443\u0441\u0441\u043a\u0438\u0439 \u044f\u0437\u044b\u043a",VK_LANGS[idx++]['LangAuthor']],
	["uk","\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430 \u043c\u043e\u0432\u0430",VK_LANGS[idx++]['LangAuthor']],
	["be","\u0411\u0435\u043b\u0430\u0440\u0443\u0441\u043a\u0430\u044f \u043c\u043e\u0432\u0430",VK_LANGS[idx++]['LangAuthor']],
	["us","English language",VK_LANGS[idx++]['LangAuthor']],
	["it","Italiano language",VK_LANGS[idx++]['LangAuthor']],
	["tat","\u0422\u0430\u0442\u0430\u0440\u0441\u043a\u0438\u0439 \u044f\u0437\u044b\u043a",VK_LANGS[idx++]['LangAuthor']]
  ];
  var html="";
  var about="";
  for (var i=0;i<lng.length;i++) {
	html+='<a href="#" onclick="vkLangSet('+i+','+no_reload+'); return false;"><img id="'+lng[i][0]+'"/>'+lng[i][1]+'</a>';
	about+='<b>'+lng[i][1]+'</b> - '+lng[i][2]+'<br>';
  }
  html='<div id="hz_lang">'+html+'</div>'+
	   '<center style="clear:both;"><b><a href="javascript: toggle(\'vklang_author\')">About languages</a></b><div id="vklang_author" style="display:none">'+about+'</div></center>';
  if (no_reload) return html;
  if (!window.hz_b || isNewLib())   hz_b = new MessageBox({title: IDL('Elektu lingvon.'),closeButton:true});
	
	hz_b.removeButtons();
	hz_b.addButton(isNewLib()?'OK':{
      onClick: function(){ hz_b.hide(200); },
      style:'button_yes',label:'OK'},function(){ hz_b.hide(200); },'yes');
	//hz_b.addButton({onClick:function(){hz_b.hide(200);},style:'button_no',label:'OK'});//0-rus 1-ua 2-be 3-en
	hz_b.content(html).show();
  
}


function vkCheckSettLength(){
  s2=vkgetCookie('remixbit'); 
  s2=s2.split('-'); 
  s1=DefSetBits.split('-'); 
  s2[0]+=s1[0].substr(s2[0].length); 
  for (var i=0; i<s1.length; i++)  if (s2[i]==null && s1[i]!=null) s2[i]=s1[i]; 
  s2=s2.join('-');
  vksetCookie('remixbit',s2);
}

//////////////////////
/* VKOPT SETTINGS */

// for color select //
var pickers = [];
function init_colorpicker(target, onselect, inhcolor){
// http://plugins.jquery.com/files/jquery.jqcolor.js.txt /
    function RGBToHSB(rgb) {
        var hsb = {h:0, s:0, b:0};
        hsb.b = Math.max(Math.max(rgb.r,rgb.g),rgb.b);
        hsb.s = (hsb.b <= 0) ? 0 : Math.round(100*(hsb.b - Math.min(Math.min(rgb.r,rgb.g),rgb.b))/hsb.b);
        hsb.b = Math.round((hsb.b /255)*100);
        if((rgb.r==rgb.g) && (rgb.g==rgb.b)) hsb.h = 0;
        else if(rgb.r>=rgb.g && rgb.g>=rgb.b) hsb.h = 60*(rgb.g-rgb.b)/(rgb.r-rgb.b);
        else if(rgb.g>=rgb.r && rgb.r>=rgb.b) hsb.h = 60  + 60*(rgb.g-rgb.r)/(rgb.g-rgb.b);
        else if(rgb.g>=rgb.b && rgb.b>=rgb.r) hsb.h = 120 + 60*(rgb.b-rgb.r)/(rgb.g-rgb.r);
        else if(rgb.b>=rgb.g && rgb.g>=rgb.r) hsb.h = 180 + 60*(rgb.b-rgb.g)/(rgb.b-rgb.r);
        else if(rgb.b>=rgb.r && rgb.r>=rgb.g) hsb.h = 240 + 60*(rgb.r-rgb.g)/(rgb.b-rgb.g);
        else if(rgb.r>=rgb.b && rgb.b>=rgb.g) hsb.h = 300 + 60*(rgb.r-rgb.b)/(rgb.r-rgb.g);
        else hsb.h = 0;
        hsb.h = Math.round(hsb.h);
        return hsb;
    }
    function HSBToRGB(hsb) {
        var rgb = {};
        var h = Math.round(hsb.h);
        var s = Math.round(hsb.s*255/100);
        var v = Math.round(hsb.b*255/100);
        if(s == 0) {
            rgb.r = rgb.g = rgb.b = v;
        } else {
            var t1 = v;
            var t2 = (255-s)*v/255;
            var t3 = (t1-t2)*(h%60)/60;
            if(h==360) h = 0;
            if(h<60) {rgb.r=t1; rgb.b=t2; rgb.g=t2+t3;}
            else if(h<120) {rgb.g=t1; rgb.b=t2; rgb.r=t1-t3;}
            else if(h<180) {rgb.g=t1; rgb.r=t2; rgb.b=t2+t3;}
            else if(h<240) {rgb.b=t1; rgb.r=t2; rgb.g=t1-t3;}
            else if(h<300) {rgb.b=t1; rgb.g=t2; rgb.r=t2+t3;}
            else if(h<360) {rgb.r=t1; rgb.g=t2; rgb.b=t1-t3;}
            else {rgb.r=0; rgb.g=0; rgb.b=0;}
        }
        return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
    }
    function RGBToHex(rgb) {
        var hex = [
            rgb.r.toString(16),
            rgb.g.toString(16),
            rgb.b.toString(16)
        ];
        hex = hex.map(function (val) {
            if (val.length == 1) {
                val = '0' + val;
            }
            return val;
        });
        return hex.join('');
    };

    function HexToRGB(hex) {
        var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
        return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
    };
//end /
    if (typeof(inhcolor) != "string") {
        inhcolor = "ff0000";
    }
    if (inhcolor.substr(0, 1) == "#") {
        inhcolor = inhcolor.substr(1, 6);
    }
    var 
        incolor = HexToRGB(inhcolor);
        hsb = RGBToHSB(incolor),
        bhsb = {h: hsb.h, s: 100, b: 100};

	for(var i = pickers.length; p = pickers[--i];){
        if(p == target){
            return;
        }
    }
    pickers.push(target);
    var p_imgs = {
        boverlay: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKxSURBVHja7NoxCoRAFAXBcfD+ZzYxEkxEDXqqYC9g0Dy/OwawrO38AQuaHgGsa7cAwAIALADAAgAsAMACACwAQAAArwCABQBYAIAFAAgA4BUAsAAAAQC8AgAWACAAgAAAbgCABQAIACAAgBsAYAEAAgAIACAAwDOOgGABAAIACAAgAIAAAAIA5PgMCBYAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAcBeA6TGABQAIACAAgAAAAgAIACAAQCYA/gcAFgAgAIAAAAIACAAgAEAuAD4DggUACAAgAIAAAPEAOAKCBQAIACAAgAAA8QA4AoIFAAgAIACAAADxADgCggUACAAgAIAAAPEAOAKCBQAIACAAgBsAYAEAAgAIAOAGAFgAgAAAAgC4AQAWACAAgAAAbgCABQAIACAAgBsAYAEAAgAIACAAwAcBcAQECwAQAEAAADcAwAIABAAQAMANALAAAAEABABwAwAsAEAAAAEA3AAACwAQAEAAAAEAfg6AIyBYAIAAAAIACAAQD4AjIFgAgAAAAgAIABAPgCMgWACAAAACAAgAEA+AIyBYAIAAAAIACAAgAIAAALkA+AwIFgAgAIAAAAIACAAgAIAAAJ0A+B8AWACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIADA1fQIwAIABAAQAEAAAAEABACo8RkQLABAAAABAAQAiHMEBAsAEABAAAA3AMACAAQAEADADQCwAAABALwCABYAIACAVwDAAgAsAMACAAQA8AoAWACABQBYAIAFAFgAgAUAvOkQYABehQTISkChWgAAAABJRU5ErkJggg==",
        woverlay: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKSSURBVHja7NQ7DoAgEEDB1fufef20GgWC0DiTEAUTC5S3bIeIOEcUrqW1633N/Gmt5tnMkR3Pc/Ba73zEO3PCPnzxbWaO1v+85SzVntHbdQ3gtwQABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEABAAQAEAAAAEAAbAFIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgAIACAAAACAAgACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAgAIAAAAIACAAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgAIACAAgAAAAgC82QUYAJKU6/4c8sBCAAAAAElFTkSuQmCC",
        slider: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAEACAIAAADeB9oaAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sGBwgFNhpkuzEAAACCSURBVGje7dtBCsQwEANBDZj9/3cTvDh/0NU197o3Mp6T8lZ+JEmSJEmSZHVzdit3m2/rDUmSJEmSJNk1WOoGS5uMJEmSJEmSt8tJO6FN2gltpU1GkiRJkiTJ2+WkndBW++RKkiRJkiR5vZzdNtic/NtizFPLlyRJkiRJ8mY59S/OD9P5jsGMLFCrAAAAAElFTkSuQmCC",
        arrows: "data:image/gif;base64,R0lGODlhKQAJAJECAP///25tbwAAAAAAACH5BAEAAAIALAAAAAApAAkAAAIvVC6py+18ggFUvotVoODwnoXNxnmfJYZkuZZp1lYx+l5zS9f2ueb6XjEgfqmIoAAAOw==",
        cursor: "data:image/gif;base64,R0lGODlhDAAMAJECAOzp2AAAAP///wAAACH5BAEAAAIALAAAAAAMAAwAAAIhlINpG+AfGFgLxEapxdns2QlfKCJgN4aWwGnR8UBZohgFADs="
    };

	
	var picker = $c("div", {"class":'picker_box'});
    var slider, palette, cursor, arrows, col, offsetcol, apply, cancel, val;
    picker.appendChild($c("div", {"class":'picker_panel', kids: [
        col = $c("div", {"class":'picker_color', style: "background-color: #" + inhcolor}),
        val = $c("input", {type: "input", value: "#" + inhcolor, "class":'picker_value'}),
        apply = $c("input", {type: "button", value: "OK"}),
        cancel = $c("input", {type: "button", value: IDL("Cancel")})
    ]}));
    offsetcol = 30;//col.offsetHeight;
    picker.appendChild(palette = $c("div", {style: "width: 256px; height: 256px; float: left; background: #" + RGBToHex(HSBToRGB(bhsb)) + ";", draggable: "false", kids: [
        $c("img",{src: p_imgs.woverlay, style: "position: absolute", draggable: "false"}), 
        $c("img",{src: p_imgs.boverlay, style: "position: absolute", draggable: "false"}),
        cursor = $c("img",{src: p_imgs.cursor, id: "p_cursor", style: "position: absolute; z-index:1000; margin: -6px -2px; left: 255px;", draggable: "false"})
    ]})); 
    picker.appendChild(slider = $c("div", {style: "float: left;", draggable: "false", kids: [
        arrows = $c("img",{src: p_imgs.arrows, style: "position: absolute; margin: -4px -11px; z-index: 1000", draggable: "false"}),
        $c("img",{src: p_imgs.slider, draggable: "false"})
    ]})); 
    cursor.style.top = ((255 - hsb.b / 100 * 255 + 30) | 0) + "px";
    cursor.style.left = ((hsb.s / 100 * 255) | 0) + "px";
    arrows.style.top = ((hsb.h / 360 * 255) | 0 + 30) + "px";
	var mousegpos = [0, 0],
    mousenpos = [0, 0],
    mousepos = [0, 0],
    paldown = 0,
    slddown = 0,
    lock = 0,
    hue = hsb.h / 360, sat = hsb.s / 100, bri = hsb.b / 100,
    color = [1, 0, 0],
    hcolor = inhcolor, 
    bhcolor = RGBToHex(HSBToRGB(bhsb)), 
    heig = 255;
    function upcolor(){
        var hsb = {h: hue * 360, s: sat * 100, b: bri * 100},
            bhsb = {h: hsb.h, s: 100, b: 100};
        hcolor = "#" + RGBToHex(HSBToRGB(hsb));
        bhcolor = "#" + RGBToHex(HSBToRGB(bhsb));
        val.value = hcolor;
        col.style.backgroundColor = hcolor;
        palette.style.backgroundColor = bhcolor;
    }
    function pelettemdown(e){
        var target = e.target;
        e.preventDefault();
        if(lock){
        //    return;
        }
        lock = 1;
        if(paldown) {
            mousepos = [mousepos[0] - mousegpos[0] + (e.pageX || e.x), mousepos[1] - mousegpos[1] + (e.pageY || e.y)];
        } else {
            paldown = 1;
            window.addEventListener("mousemove", pelettemdown, true);
            window.addEventListener("mouseup", bodyup, true);
            mousepos = [(e.offsetX || e.layerX), (e.offsetY || e.layerY)];
            while(target.tagName != "DIV"){
                mousepos[0] += target.offsetLeft;
                mousepos[1] += target.offsetTop;
                target = target.parentNode;
                break;
            }
            mousepos[1] -= offsetcol;
        }
        mousegpos = [(e.pageX || e.x), (e.pageY || e.y)];
        mousenpos = [mousepos[0] < 0 ? 0 : mousepos[0] > 255 ? 255 : mousepos[0], mousepos[1] < 0 ? 0 : mousepos[1] > 255 ? 255 : mousepos[1]];
        sat = mousenpos[0] / heig;
        bri = (255 - mousenpos[1]) / heig;
        cursor.style.left = mousenpos[0] + "px";
        cursor.style.top = (mousenpos[1] + offsetcol) + "px";
        upcolor();
        lock = 0;
    }
    function slidermdown(e){
        var target = e.target;
        e.preventDefault();
        if(lock){
            return;
        }
        lock = 1;
        if(slddown){
            mousepos = [mousepos[0] - mousegpos[0] + (e.pageX || e.x), mousepos[1] - mousegpos[1] + (e.pageY || e.y)];
        }else{
            slddown = 1;
            window.addEventListener("mousemove", slidermdown, true);
            window.addEventListener("mouseup", bodyup, true);
            mousepos = [(e.offsetX || e.layerX), (e.offsetY || e.layerY - offsetcol)];
            while(target.tagName != "DIV"){
                mousepos[0] += target.offsetLeft;
                mousepos[1] += target.offsetTop;
                target = target.parentNode;
                break;
            }
            mousepos[1] -= offsetcol + 4;
        }
        mousegpos = [(e.pageX || e.x), (e.pageY || e.y)];
        mousenpos = [mousepos[0] < 0 ? 0 : mousepos[0] > 255 ? 255 : mousepos[0], mousepos[1] < 0 ? 0 : mousepos[1] > 255 ? 255 : mousepos[1]];
        hue = mousenpos[1] / heig;
        arrows.style.top = (mousenpos[1] + offsetcol) + "px";
        upcolor();
        lock = 0;
    }
    function bodyup(e){
        paldown = 0;
        slddown = 0;
        window.removeEventListener("mousemove", pelettemdown, true);
        window.removeEventListener("mousemove", slidermdown, true);
        window.removeEventListener("mouseup", bodyup, true);
    }
    function onapply(e){
        //console.log(e);
        oncancel();
        onselect(hcolor);
    }
    function oncancel(e){
        target.removeChild(picker);
        for(var i = pickers.length; p = pickers[--i];){
            if(p == target){
                pickers.splice(i, 1);
            }
        }
    }
    function valkeyup(e){
        if(!/^#[\da-f]{6}$/.test(e.target.value)){ return; }
        hcolor = e.target.value;
        col.style.backgroundColor = hcolor;
    }
    palette.addEventListener("mousedown", pelettemdown, true);
    slider.addEventListener("mousedown", slidermdown, true);
    apply.addEventListener("click", onapply, false);
    cancel.addEventListener("click", oncancel, false);
    val.addEventListener("keyup", valkeyup, true);
    target.appendChild(picker);
}
FrCol_click=function(color){
    setFrColor(color);
    ge('spct11').style.backgroundColor = color;
}

MsgCol_click=function(color, id){
    setMsgColor(color);
    ge('spct10').style.backgroundColor = color;
}

function getMsgColor(){
  var cl=getSet('-',3);//vkgetCookie('remixbit').split('-')[9];
  return cl?cl:"#E2E9FF";
}
function setMsgColor(color) {    setSet('-',color,3); }

function getFrColor(){
  var cl=getSet('-',4);//sett.split('-')[10];
  return cl?cl:"#34A235";
}
function setFrColor(color) {
  setSet('-',color,4);
}


// end of color select func //
//////////////////////////////

////Walls
function ReadWallsCfg(){
  //alert(vkGetVal('WallsID').split(",")[0]);
  if (window.WallIDs && WallIDs.length>0 && WallIDs[0]!="") return WallIDs;
  return (vkGetVal('WallsID'))?String(vkGetVal('WallsID')).split(","):[""];//["1244","g1","g12345","1"];
}
function SetWallsCfg(cfg){
  vkSetVal('WallsID',cfg.join(","));
}
function vkAddWall(wid) {
    var wall_list=ReadWallsCfg();
    var wid = (!wid) ? ge('vkaddwallid').value: wid;
    wid = String(wid);

    if (wid.length > 0 && (wid.match(/^\d+$/i) || wid.match(/^g\d+$/i))) {
        var dub = false;
        for (var i = 0; i < wall_list.length; i++) if (String(wall_list[i]) == wid) {
            dub = true;
            break;
        }
        if (!dub) {
            wall_list[wall_list.length] = wid;
            SetWallsCfg(wall_list);
        } else {
            alert("Item Existing");
        }
        GenWallList("vkwalllist");//WallManForm();
    } else { alert('Not valid wall id'); }
}
function vkRemWall(idx){
  var res=[];
  var wall_list=ReadWallsCfg();
  for (var i=0;i<wall_list.length;i++)
    if (idx!=i){  
      res[res.length]=wall_list[i];
    }
  wall_list=res;
  SetWallsCfg(wall_list);  
  GenWallList("vkwalllist");
  //WallManForm();
}

function GenWallList(el){
  var wall_list=ReadWallsCfg();
  var whtml="";
  var lnk;
  for (var i=0; i<wall_list.length;i++){
      lnk=(wall_list[i][0] == 'g')?"wall.php?gid="+wall_list[i].split('g')[1]:"wall.php?id="+wall_list[i];
      if (wall_list[i]=="") {lnk="wall.php?id="+remixmid(); wall_list[i]=String(remixmid());}//
      whtml+='<div id="wit'+wall_list[i]+'" style="width:130px"><a style="position:relative; left:120px" onclick="vkRemWall('+i+')">x</a>'+i+') <a style="width:110px;" href="'+lnk+'">'+wall_list[i]+'</a></div>';
  }
  if (!el) {return whtml;} else {ge(el).innerHTML=whtml;}
}
function WallManager(){
  var wall_list=ReadWallsCfg();
  //wall_list=wall_list.sort();
  /*var whtml="";
  for (var i=0; i<wall_list.length;i++){
      whtml+='<div id="wit'+wall_list[i]+'" style="width:130px"><a>'+wall_list[i]+'</a><a style="float:right" onclick="vkRemWall('+i+')">x</a></div>';
  }*/
  var res='<a href="#" onclick="toggle(\'vkExWallMgr\'); ge(\'vkwalllist\').innerHTML=GenWallList(); return false;"><b>'+IDL("Settings")+'</b></a>'+
          '<div id="vkExWallMgr" style="display:none;"><div style="text-align:left;">'+//GetUserMenuSett()+'</span></span>'+
          '<input type="text" style="width:90px;" id="vkaddwallid" onkeydown="if(13==event.keyCode){vkAddWall(); this.value=\'\'; return false;}" size="20"> <a href=# onclick="vkAddWall(); return false;">'+IDL('add')+'</a><br>'+
          '<div id="vkwalllist">'+
          //GenWallList()+
          '</div></div><small class="divider">'+IDL('wallsHelp')+'</div></small>';
  return res;
}

function WallManForm(){
  ge('wallmgr').innerHTML=WallManager();
}
//end wallmgr

function vkInitSettings(){

  vkoptSets={
    Media:[
      {id:0, text:IDL("seLinkAu")},
      {id:1, text:IDL("seAudioDownloadName")},
	  {id:43, text:IDL("seAudioSize")},
	  {id:2, text:IDL("seLinkVi")},
      {id:7, text:IDL("seScroolPhoto")}
    ],
    Users:[
      {id:10, text:IDL("seExUserMenu")+'<br><a href="#" onclick="toggle(\'vkExUMenuCFG\'); return false;">[<b> '+IDL("Settings")+' </b>]</a><span id="vkExUMenuCFG" style="display:none">'+GetUserMenuSett()+'</span>'},
      {id:11, text:IDL("seExUMClik")},
	  {id:38, text:'<table><tr><td> <table><tr><td width=20 height=20 id="spct11" bgcolor='+getFrColor()+'></td></tr></table> <td>'+
      '<span class="cltool"><a onclick="init_colorpicker(this.parentNode,FrCol_click,\'' + getFrColor() + '\')">'+IDL("seLightFriends")+'</a></span>'+
      '</td></tr></table>'},      
	  {id:8, text:IDL("seZoomPhoto")},// {id:8, header:IDL("seZoomPhoto") , text:IDL("seZoomPhHelp"),ops:[0,1,2]},
	  //{id 23 - store "is expland" profile} 
	  {id:24, text:IDL("seAvaArrows")},
	  {id:25, text:IDL("seICQico")},
	  {id:26, text:IDL("seCalcAge")},
	  {id:39, text:IDL("seGrCom")},
	  {id:41, header:IDL("seExpland_ProfileInfo"), text:IDL("seExplandProfileInfoText"),ops:[0,1,2,3]},
	  {id:45, text:IDL("seSortNam"), ops:['name','last','none']},
	  {id:46,  text:IDL("seLoadOnl"), sub:{id:5, text:'<br>'+IDL("now")+': <b>%cur</b> '+IDL("min")+'<br>'+IDL("set")+': %sets',ops:[1,2,3,4,5,10,15]},ops:['au','ru']},
	  {id:47, text:IDL("seLoadCom"), ops:["au","ru"]}
    ],

    Messages:[
      {id:19, text:IDL("seQAns")},
	  {id:28, text:'<table><tr><td> <table><tr><td width=20 height=20 id="spct10" bgcolor=' + getMsgColor() + '></td></tr></table> <td>'+
      '<span class="cltool"><a onclick="init_colorpicker(this.parentNode,MsgCol_click,\'' + getMsgColor() + '\')">'+IDL("seHLMail")+'</a></span>'+
      '</td></tr></table>'},
	  {id:40, text:IDL("seMasDelPMsg")}
    ],
    vkInterface:[
      {id:21, text:IDL("seADRem")+vkCheckboxSetting(44,IDL("seAdNotHideSugFr"),true)},
	  {id:12, text:IDL("seMenu")},
      {id:20, text:IDL("seAutoUpdMenu")},
      {id:14, text:IDL("seLoadFrCats")},  
      {id:15, header:IDL("seLMenuH") , text:IDL("seLMenuO"),ops:[0,1,2,3]},
	  {id:29, text:IDL("seLMenuWallLink")},
	  {id:22, text:IDL("seGInCol")},
      {id:13, header:IDL("seMyFrLink") , text:IDL("seMyFrLnkOps"),ops:[0,1,2]},
	  {id:3, text:IDL("seCompactAudio")},
	  {id:4, text:IDL("seMoreDarkViewer")},
	  {id:5, text:IDL("seDisableAjaxNav"),warn:true},
	  {id:17, text:IDL("seCompactFave")},
	  {id:16, text:IDL("seOnlineStatus")},
	  {id:18, header:IDL("seFixLeftMenu"), text:IDL("seFixLeftMenuText"),ops:[0,1,2]},
	  {id:27, text:IDL("seCalend")},
	  {id:30, header:IDL("seClockH") , text:IDL("seClockO"),ops:[0,1,2,3]},
	  {id:31, text:IDL("seRightBar")+vkCheckboxSetting(37,IDL("seRightBarFixAsSideBar"),true)},
	  {id:35, text:IDL("seBlocksToRightBar")},
	  {id:32, text:IDL("seSkinManBtn"), hide: (vkbrowser.mozilla)},
	  {id:33, text:IDL("seSmiles")},
	  {id:36, text:IDL("sePreventHideNotifications")},
	  {id:42, text:IDL("seSortFeedPhotos")},
     {id:49, text:IDL("seFavOn")}
    ],
	Sounds:[
	  {id:48, text:IDL("ReplaceVkSounds")}	
	],
    Others:[
		{id:9,  header:IDL("seTestFr"), text:IDL("seRefList"), sub:{id:1, text:'<br>'+IDL("now")+': <b>%cur</b> '+IDL("day")+'<br>'+IDL("set")+': %sets'+
            '<br><a onClick="javascript:vkFriendsCheck();" style="cursor: hand;">'+IDL('seCreList')+'</a>',
            ops:[1,2,3,4,5,6,7]}},
		{id:6, text:IDL("seOnAway")},
		{id:34, text:IDL("seSwichTextChr")}	
    ]
  };	  
	//LAST 49
	
	vkSetsType={
      "on"  :[IDL('on'),'y'],
      "off" :[IDL('of'),'n'],
      "ru"  :[IDL('ru'),'y'],
      "au"  :[IDL('au'),'n'],
      "id"  :[IDL('byID')  ,0],
      "name":[IDL('byName'),1],
      "last":[IDL('byFam' ),2],
      "none":[IDL('byNone'),3]
    };
  vksettobj();
}

function vksettobj(s){
  vkoptSetsObj={};
  var x=0;
  for (var key in vkoptSets){
    var setts=vkoptSets[key];
    for (var i=0;i<setts.length;i++){
      x=Math.max(x,setts[i].id);
      vkoptSetsObj[setts[i].id]=[setts[i].ops,setts[i].text];
    }   
  }
  VK_SETTS_COUNT=x;    
}

function vkSwitchSet(id,set,ex){
  allsett=vkgetCookie('remixbit').split('-');
  sett=allsett[0].split('');
  if (ex) allsett[id]=set; else sett[id]=set;
  if (!ex){
    var el=ge('sbtns'+id);
    var html='';
    var ops=(vkoptSetsObj[id][0])?vkoptSetsObj[id][0]:["on","off"];      
        for (var i=0;i<ops.length;i++){
          if (typeof ops[i]=='number'){   
            var onclick="onClick=\"vkSwitchSet('"+id+"','"+ops[i]+"'); return false;\" ";
            html+='<a href="#'+id+'" '+onclick+(ops[i]==parseInt(sett[id])?'set_on':'')+'>'+ops[i]+'</a>';
          } else {
            var type=(ops[i]=='on' || ops[i]=='au')?'on':'off';//(type=='on'?'y':'n')
            if (typeof vkSetsType[ops[i]][1]=='number') type='';
            var onclick="onClick=\"vkSwitchSet('"+id+"','"+vkSetsType[ops[i]][1]+"'); return false;\" ";
            html+='<a href="#'+id+'" '+onclick+type+' '+(vkSetsType[ops[i]][1]==sett[id]?'set_on':'')+'>'+vkSetsType[ops[i]][0]+'</a>';
            //(type=='on' && sett[id]=='y') || (type=='off' && sett[id]=='n')
          }
        } 
    el.innerHTML=html;
  } else {
    ge('vkcurset'+id).innerHTML=set;
  }
  allsett[0]=sett.join('');
  vksetCookie('remixbit',allsett.join('-'));
}

function vkIsNewSett(id){
  if (!window.vkNewSettsObj){
    vkNewSettsObj={};
    for(var i=0;i<vkNewSettings.length;i++) { vkNewSettsObj[vkNewSettings[i]]=true;}
  }
  if (vkNewSettsObj[id]) return true;
  else return false;
}
function vkGetSettings(setts,allsett){
  var sett = allsett[0];
  
  var html='';
  for (var k=0;k<setts.length;k++){
      var set=setts[k];
      if (set.hide) continue;
      var id=set.id;
      var ops=(set.ops)?set.ops:["on","off"];
      
      html+='<div id="settBlock'+id+'" class="sett_block'+(vkIsNewSett(id)?' sett_new':'')+'" '+(ops.length>2?'style="float:right; margin-right:4px;"':'')+'>'+(set.header?'<div class="scaption">'+set.header+'</div>':'')+'<div class="btns" id="sbtns'+id+'">';
      //html+='<b>'+id+': '+sett[id]+'</b><br>';
      for (var i=0;i<ops.length;i++){ 
        if (typeof ops[i]=='number'){   
          var onclick="onClick=\"vkSwitchSet('"+id+"','"+ops[i]+"'); return false;\" ";
          html+='<a href="#'+id+'" '+onclick+(ops[i]==parseInt(sett[id])?'set_on':'')+'>'+ops[i]+'</a>';
        } else {
          var type=(ops[i]=='on' || ops[i]=='au')?'on':'off';
          if (typeof vkSetsType[ops[i]][1]=='number') type='';
          var onclick="onClick=\"vkSwitchSet('"+id+"','"+vkSetsType[ops[i]][1]+"'); return false;\" ";
          html+='<a href="#'+id+'" '+onclick+type+' '+(vkSetsType[ops[i]][1]==sett[id]?'set_on':'')+'>'+vkSetsType[ops[i]][0]+'</a>';
        }
      }
      var sub="";
	  var warn=(set.warn?'<div class="vk_warning_ico fl_r" onmouseover="vkSettInfo(this,IDL(\'WarnSetting\'));"></div>':'');
      if (set.sub) {
        var subsets=[];
        var sops=set.sub.ops;
        for (var i=0;i<sops.length;i++) subsets.push('<a href="javascript:vkSwitchSet('+set.sub.id+','+sops[i]+',true);">'+sops[i]+'</a>');
        sub = set.sub.text.replace("%cur",'<span id="vkcurset'+set.sub.id+'">'+allsett[set.sub.id]+'</span>').replace("%sets",subsets.join(" - "));
      }
      html+='</div><div class="stext">'+set.text+sub+warn+'</div></div>\r\n';
  }
  return '<div style="display: inline-block; width:100%;">'+html+"</div>";
  
}

function vkSettInfo(el,text,hasover){
	showTooltip(el, {
		  hasover:hasover,
		  text:text,
		  slide: 15,
		  //shift: [0, -3, 0],
		  showdt: 100,
		  hidedt: 200,
	});
}
function vkCheckboxSetting(id,text,in_div){
	var cfg=getSet(id)=='y'; 
	return (in_div?'<div class="vk_checkbox_cont">':'')+'<input class="vk_checkbox" type="checkbox" '+(cfg?'checked="on"':'')+' style="margin-left:0px;" onchange="vkSetNY('+id+',this.checked)">'+text+(in_div?'</div>':'');
}
function vkSetNY(id,is_on){	setCfg(id,is_on?'y':'n');};

function vkMakeSettings(el){
  vklog('Last settings index: '+VK_SETTS_COUNT,2);
  vkCheckSettLength();
  
  var remixbit=vkgetCookie('remixbit');
  allsett = remixbit.split('-');
  sett = allsett[0].split('');
 
  for (var j = 0; j <= VK_SETTS_COUNT; j++){
	if (sett[j] == null) { if (!vkoptSetsObj[j] || !vkoptSetsObj[j][0]) sett[j] = 'n'; else sett[j] = '0'; }
  }
  allsett[0] = sett.join('');
  vksetCookie('remixbit', allsett.join('-'));
 
  var html="";
  var tabs=[];
  for (var cat in vkoptSets){
    //alert(vkGetSettings(vkoptSets[cat],allsett));
	if (cat!='Sounds') tabs.push({name:IDL(cat),content:'<div class="sett_cat_header">'+IDL(cat)+'</div>'+vkGetSettings(vkoptSets[cat],allsett)});
    //html+='<div class="sett_container"><div class="sett_header" onclick="toggle(this.nextSibling);">'+IDL(cat)+'</div><div id="sett'+cat+'">'+vkGetSettings(vkoptSets[cat],allsett)+'</div></div>';
  }
  //*
  if (vkLocalStoreReady()){
    var currsnd=vkGetVal('sounds_name');
    currsnd=(currsnd && currsnd!=''?currsnd:IDL('Default'));
	var s_preview='<div class="vk_sounds_preview">'+
		'<div>'+IDL('SoundsThemeName')+': <b><span id="vkSndThemeName">'+currsnd+'</span></b></div>'+
		'<br><div id="vkTestSounds">'+
		'<a href="javascript: vkSound(\'Msg\')">'+IDL('SoundMsg')+'</a><br>'+
		'<a href="javascript: vkSound(\'New\')">'+IDL('SoundNewEvents')+'</a><br>'+
		'<a href="javascript: vkSound(\'On\')">'+IDL('SoundFavOnl')+'</a><br>'+      
		'</div>'+
	'</div>';
    var sounds=
	'<div class="vk_sounds_settrings">'+'<div class="sett_cat_header">'+IDL('Sounds')+'</div>'+
	'<table><tr><td>'+vkGetSettings(vkoptSets['Sounds'],allsett)+'</td><td>'+s_preview+'</td></tr></table>'+
	'</div>'+
	
    '<div style_="padding: 0px 20px 0px 20px">'+
	//s_preview+
	'<div style="clear:both" align="center"><br><h4>'+IDL('SoundsThemeLoadClear')+'</h4><br>'+
    vkRoundButton([IDL('LoadSoundsTheme'),'javascript: vkLoadSoundsFromFile();'],[IDL('ResetSoundsDef'),'javascript: vkResetSounds();'])+'</div>'+
    '<h4><br></h4><small>'+IDL('SoundsThemeOnForum')+'</small>'+
    '</div>';
    tabs.push({name:IDL('Sounds'),content:sounds});
  }//*/
  var CfgArea='<input type="hidden" id="TxtEditDiv_remixbitset" /><textarea id="remixbitset" rows=1 style="border: 1px double #999999; overflow: hidden; width: 100%;" type="text" readonly onmouseover="this.value=vkRemixBitS()" onClick="this.focus();this.select();">DefSetBits=\''+vkgetCookie('remixbit')+'\';</textarea>'; 
  tabs.push({name:IDL('all'),content:'all'});
  tabs.push({name:IDL('Help'),content:'<table style="width:100%; border-bottom:1px solid #DDD; padding:10px;"><tr><td colspan="2" style="text-align:center; font-weight:bold; text-decoration:underline;">'+IDL('Donations')+'</td></tr><tr><td width="50%"><div>'+IDL("DevRekv")+'</div><div>'+WMPursesList('wmdonate')+'</div></td><td><div id="wmdonate">'+WMDonateForm(30,'R255120081922')+'</div></td></tr></table>'+
    '<div id="vkcurcfg">'+
    (vkbrowser.opera?'<br>'+IDL('SettsNotSaved')+'<b align="center">'+IDL('addVkopsSets')+'<br>'+CfgArea+'</b>'+
    '<br><b align="center">'+IDL('seAttent')+'</b>':'<b align="center">Config:<br>'+CfgArea+'</b>')+
	'</div>'+
	'<div id="vklsman"><h4 onclick="ge(\'vkcurcfg\').innerHTML=vkLocalStorageMan(true);">  </h4></div>'+
    '<div style="clear:both" align="center"><br><h4>'+IDL('ConfigBackupRestore')+'</h4><br>'+vkRoundButton([IDL('ExportSettings'),'javascript: vkGetVkoptFullConfig();'],[IDL('ImportSettings'),'javascript: vkLoadVkoptConfigFromFile();'])+'</div>'+
    '<div style="clear:both" align="center"><br><h4>'+IDL('ConfigOnServer')+'</h4>'+
	'<div id="cfg_on_serv_info" style="text-align:center;"></div>'+
	'<br>'+vkRoundButton([IDL('SaveOnServer'),'javascript: vkSaveSettingsOnServer();'],[IDL('LoadFromServer'),'javascript: vkLoadSettingsFromServer();'])+'</div>'
  });

  vkRemixBitS=function(){return "DefSetBits='"+vkgetCookie('remixbit')+"';";}
  tabs[0].active=true;
  html=vkMakeContTabs(tabs);
  if (el) ge(el).innerHTML=html;//vkGetSettings(vkoptSets['Media'],allsett);
  else return html;
}

function vkShowSettings(box){
  vkDisableAjax();
  var header='Vkontakte Optimizer '+String(vVersion).split('').join('.')+'<sup><i>'+vPostfix+'</i></sup> '+'(build '+vBuild+') <b class="fl_r"><a href="javascript: hz_chooselang();">'+IDL("ChangeVkOptLang")+'</a></b>';
  if (!box){
    show('header');
	document.title='[ VkOpt ['+String(vVersion).split('').join('.')+'] settings ]';
    ge('header').innerHTML='<h1>'+header+'</h1>';
    vkMakeSettings('content');
  } else {
    var html=vkMakeSettings();
    if (!window.vkSettingsBox || isNewLib()) vkSettingsBox = new MessageBox({title: header,closeButton:true,width:"650px"});
    var box=vkSettingsBox;
    box.removeButtons();
    box.addButton(isNewLib()?IDL('Hide'):{
      onClick: function(){ box.hide(200); },
      style:'button_no',label:IDL('Hide')},function(){ box.hide(200); },'no');
    //box.setOptions({onHide: function(){box.content('');}});
    box.content(html).show();
  }
  vkLoadSettingsFromServer(true);//check cfg backup
  return false;
}
//vkGetSettings(vkoptSets['Media']) javascript: ge('content').innerHTML=vkGetSettings(vkoptSets['Media']); void(0);
// javascript: vkMakeSettings();

function vkSaveSettingsOnServer(check){
	var sett=vkgetCookie("remixbit");
	var cur_date=Math.round((new Date().getTime())/1000);
	sett+='|'+cur_date;
	dApi.call('storage.set',{key:'remixbits',value:sett},function(r){
		ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_info">'+IDL('seCfgBackupSaved')+'</div>';
	});
}
function vkLoadSettingsFromServer(check){
	dApi.call('storage.get',{key:'remixbits'},function(r){
		if (check){
			if (r.response && r.response!=''){
				var cfg=r.response.split('|');
				if (cfg[1] && parseInt(cfg[1])){
					var date=(new Date(parseInt(cfg[1])*1000)).format("dd.mm.yyyy (HH:MM:ss)");
					ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_info">'+IDL('seCfgBackupDate')+' <b>'+date+'</b> </div>';
				} else {
					ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_warn">'+IDL('seCfgNoBackup')+' #1</div>';
				}
			} else {
				ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_warn">'+IDL('seCfgNoBackup')+' #2</div>';
			}		
		} else {
			if (r.response && r.response!=''){
				var cfg=r.response.split('|');
				vksetCookie('remixbit', cfg[0]);
				ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_info">'+IDL('seCfgRestored')+'</div>';
			} else {
				ge('cfg_on_serv_info').innerHTML='<div class="vk_cfg_error">'+IDL('seCfgLoadError')+' #0</div>';
			}
		}
	});
  
}

function vkUpdateSounds(on_command){
	if (getSet(48)=='y'){
		if (!on_command) vkCmd('upd_sounds',{});
		if (window.curNotifier){
			curNotifier.sound=new Sound2('New');	
			curNotifier.sound_im=new Sound2('Msg');
		}
	}
}
function vkResetSounds(){
  for (var key in vkSoundsRes) vkSetVal('sound_'+key,'');
  vkSetVal('sounds_name','');
  if(ge('vkSndThemeName')) ge('vkSndThemeName').innerHTML=IDL('Default');
  vkUpdateSounds();
}

function vkLoadSoundsFromFile(){
    vkLoadTxt(function(txt){
    try {
      var cfg=eval('('+txt+')');
	  //alert('qwe');
      for (var key in cfg) if (cfg[key] && vkSoundsRes[key] && key!='Name') 
        vkSetVal('sound_'+key,cfg[key]);
      
      var tname=cfg['Name']?cfg['Name']:'N/A';
      tname=replaceChars(tname);
      vkSetVal('sounds_name',tname);
      if(ge('vkSndThemeName')) ge('vkSndThemeName').innerHTML=tname;
      
      alert(IDL('SoundsThemeLoaded'));
	  vkUpdateSounds();
    } catch(e) {
      alert(IDL('SoundsThemeError'));
    }
  },["VkOpt Sounds Theme (*.vksnd)","*.vksnd"]);
}

if (!window.vkscripts_ok) window.vkscripts_ok=1; else window.vkscripts_ok++;