// ==UserScript==
// @description   Vkontakte Optimizer StyleModule (by KiberInfinity id13391307)
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//

var VK_SKINMAN_VER=2;
var VK_CSS_CATALOG_BASE_URL='http://vkopt.net/css/vk_css_list.js';
var VK_THEMES_ON_PAGE=30;

var VK_BASE_BG_SIZES=[// sorted by squares
   [800,600],
   [1024,768],
   [1280,720],
   [1152,864],
   [1280,800],
   [1366,768],
   [1280,960],
   [1440,900],
   [1280,1024],
   [1600,900],
   [1400,1050],
   [1680,1050],
   [1600,1200],
   [1920,1080],
   [1920,1200],
   [2560,1440],
   [2560,1600]
];
/*
VK_BASE_BG_SIZES.sort(function(i1,i2){
   var s1=i1[0]*i1[1]; var s2=i2[0]*i2[1];
   if (s1<s2) return -1; else 
   if (s1>s2) return 1;
   else       return 0;
});

*/



function vkLocalStoreReady(){
  if (window.localStorage || window.GM_SetValue || window.sessionStorage) {
    return true;
  } else { 
    return false; 
  }
}
function vk_LSSetVal(key,val){
  if (typeof localStorage!='undefined') {localStorage[key]=val; return true;}//Chrome, FF3.5+
  else if (typeof GM_SetValue!='undefined'){ GM_SetValue(key,val); return true;}//Mozilla
  else if (typeof sessionStorage!='undefined'){sessionStorage.setItem(key, val); return true;} //Opera 10.5x+
  else { return false }
}

function vk_LSGetVal(key){
  if (typeof localStorage!='undefined') { return localStorage[key];}//Chrome, FF3.5+
  else if (typeof GM_GetValue!='undefined'){ return String(GM_GetValue(key)); }//Mozilla
  else if (typeof sessionStorage!='undefined'){ return sessionStorage.getItem(key);}//Opera 10.5x+
  else { return false }
}

function vkGetVal(key){ //this func is duplicate from vkopt.js
  if (typeof localStorage!='undefined') { return localStorage[key];}//Chrome, FF3.5+
  else if (typeof GM_GetValue!='undefined'){ return String(GM_GetValue(key)); }//Mozilla
  else if (typeof sessionStorage!='undefined'){ return sessionStorage.getItem(key);}//Opera 10.5x+
  else { return vkgetCookie2(key)}
}
function vkgetCookie2(name,temp){ //this func is duplicate from vkopt.js
if (name=='remixmid') { if (temp) return false; else { tmp=remixmid(); return tmp; } }
	var dc = document.cookie;
	var prefix = name + "=";
	var begin = dc.indexOf("; " + prefix);
	if (begin == -1){		begin = dc.indexOf(prefix);		if (begin != 0) return null; }	else { begin += 2;}
	var end = document.cookie.indexOf(";", begin);
	if (end == -1){	end = dc.length;}
	return unescape(dc.substring(begin + prefix.length, end));
}

function VkStyleMainInit(){
EnableSetStyle=true;
}
VkStyleMainInit();

if (!window.ge) ge=function(q) {return document.getElementById(q);}


function vkSetBodyScrResolution(){
      var bg_info = VK_BASE_BG_SIZES[VK_BASE_BG_SIZES.length-1][0]+'x'+VK_BASE_BG_SIZES[VK_BASE_BG_SIZES.length-1][1];// max size as default
      for (var i=0;i<VK_BASE_BG_SIZES.length;i++)
         if (VK_BASE_BG_SIZES[i][0]>=window.screen.width &&  VK_BASE_BG_SIZES[i][1]>=window.screen.height){
            bg_info = VK_BASE_BG_SIZES[i][0]+"x"+VK_BASE_BG_SIZES[i][1];
            break;
         }
      var add_scr_info=function(){
         var vbody=document.getElementsByTagName('body')[0];
         if (vbody){
           vbody.setAttribute('scrwidth',window.screen.width);
           vbody.setAttribute('scrheight',window.screen.height);
           vbody.setAttribute('need_background',bg_info);
         } else {
            setTimeout(add_scr_info,2);
         }
      }
      add_scr_info();
}

function vkStyle(url){ if (ge("vkStyleCSS")) ge("vkStyleCSS").href=url; }
function vkStyleJS(url){ 
   if (window.vkThemeOnDisable) vkThemeOnDisable();
   if (ge("vkStyleCSSJS")) ge("vkStyleCSSJS").src=url; 
}

function vkSkinnerInit(){
  //var lsredy=vkLocalStoreReady();
  if (EnableSetStyle && !ge('vkStyleCSS')) {                                                           
    VK_CURRENT_CSS_URL=vkGetVal("VK_CURRENT_CSS_URL") || "";//vk_LSGetVal - only localstore; vkGetVal- localstore && cookie 
    VK_CURRENT_CSS_CODE=vk_LSGetVal('VK_CURRENT_CSS_CODE') || "";
    VK_CURRENT_CSSJS_URL=vk_LSGetVal('VK_CURRENT_CSSJS_URL') || "";
    
      vkSetBodyScrResolution();
      var vkcssNode = document.createElement('link');
      vkcssNode.type = 'text/css';
      vkcssNode.rel = 'stylesheet';
      vkcssNode.id="vkStyleCSS";
      if (!VK_CURRENT_CSS_URL=="") vkcssNode.href = VK_CURRENT_CSS_URL;
      
      
      var styleElement = document.createElement("style");
      styleElement.type = "text/css";
      styleElement.id="vkStyleNode";
      styleElement.appendChild(document.createTextNode(VK_CURRENT_CSS_CODE));
      

      var  scriptElement = document.createElement("script");
      scriptElement.type = "text/javascript";
      scriptElement.id="vkStyleCSSJS";
      if (!VK_CURRENT_CSSJS_URL=="") scriptElement.src=VK_CURRENT_CSSJS_URL;
      
      var appendTo='head';//"body";
      var headID = document.getElementsByTagName(appendTo)[0];
	  //var link = document.getElementsByTagName('link')[0];
      if (headID){
        headID.appendChild(document.createElement('link'));//fix
        headID.appendChild(vkcssNode);
        headID.appendChild(styleElement);
        headID.appendChild(scriptElement);
      } else {
        var vkcsload=setInterval(function(){                                            
          if (document.getElementsByTagName(appendTo)[0]){
            clearInterval(vkcsload);
            headID = document.getElementsByTagName(appendTo)[0];
            //headID.appendChild(document.createElement('link'));//fix
            headID.appendChild(vkcssNode);
            headID.appendChild(styleElement);
            headID.appendChild(scriptElement);
          }
        },2);
    }
  }
}
vkSkinnerInit();

function vkSwichCSS(code){
  vk_LSSetVal('VK_CURRENT_CSS_CODE',code);
  ge('vkStyleNode').innerHTML=code;
}

function vkSwichStyle(url,el,js){
  vkStyle(url);
  vkSetVal('VK_CURRENT_CSS_URL',url);
  
  vkStyleJS(js || "");
  vkSetVal('VK_CURRENT_CSSJS_URL',js);
  
  if (!window.geByClass) return true;
  var nodes=geByClass('current_skin');
  for (var i=0;i<nodes.length;i++){ nodes[i].setAttribute("class","noselected_skin"); };  
  if (el){
    var node=el.parentNode.parentNode;
    node.setAttribute("class",'current_skin');
  }
  return false;
}



function vkHideScreen(){
vkScreenBox.hide(200);
vkScreenBox.content("");
}
function vkShowScreen(url){
  if (!window.vkScreenBox || isNewLib()) vkScreenBox = new MessageBox({title: IDL('Preview'),fullPageLink:url+'" target="_blank',closeButton:true,width:"800px"});
  vkScreenBox.removeButtons();
  
  vkScreenBox.removeButtons();
  vkScreenBox.addButton(!isNewLib()?{
    onClick: vkHideScreen,
    style:'button_no',label:IDL('Cancel')}:IDL('Cancel'),vkHideScreen,'no');
    
  vkScreenBox.setOptions({onHide: vkHideScreen});
  vkScreenBox.content('<img src="'+url+'" onclick="vkHideScreen();" width="780px">').show();
  
  return false;
}

function vkPrepareCats(skins){ // it's PIZDEC! Don't translate to Russian
  var Cats={};
  for (var i = 0; i<skins.length; i++)
    if (skins[i].cat && skins[i].cat!='*'){
      var cat=skins[i].cat.split(",");
      for (var k = 0; k<cat.length; k++)  {
        if (!Cats[cat[k]]) Cats[cat[k]]=0;
        Cats[cat[k]]++;
      }
    }
  Cats.SkinsCount=skins.length;
  return Cats;
}

function vkCatNavigate(elem){
  var cat=elem.getAttribute("category");
  vkShowSkinMan(cat);
  ge("header").innerHTML='<h1>'+IDL("SkinMan")+' | '+cat+'</h1>';
  return false;
}
function vkMakeCatMenu(cats){
  if (!ge("snav")){
    el=(ge('sideBar') || ge('side_bar')).getElementsByTagName('ol')[0];//ge("nav");
	vkNavigationMenu=el;
    //el.setAttribute("id","snav");
    var html='<li><h4 style="cursor:hand;" onclick="show(vkNavigationMenu); hide(\'vk_cat_skins_menu\')">'+IDL('categories')+"</h4></li>"+
             '<li><a href=# onclick="return vkShowSkinMan();">'+IDL('all')+'<span>'+cats.SkinsCount+'</span></a></li>';
    for (var cat in cats)  if(cat!='SkinsCount') html+='<li><a href=# category="'+cat+'" onclick="return vkCatNavigate(this);">'+cat+'<span>'+cats[cat]+'</span></a></li>';
    html+='<div class="moreDiv"></div>';
	hide(vkNavigationMenu);
	el.parentNode.insertBefore(vkCe('ol',{id:'vk_cat_skins_menu'},html),el);
  }
}

/*

	{
		name:'Ripped v1.1',
		author:'<a href="/id13391307">KiberInfinity</a>',
		url:'http://vkopt.net/css/vk_ripped.css',
		cat:'Категории',
		thumb:'http://ipic.su/img/img6/tn/kiss_307kb.1338032185.png',
		screen:'http://ipic.su/img/img6/fs/kiss_307kb.1338032185.png',
      skinman_ver:2,
      script_url:'http://vk.cc/myscript.js'
	},

*/
function vkOnSkinList(Skins){
  var arr=[];
  for (var i=0; i<Skins.length; i++){
      var smv=parseInt(Skins[i].skinman_ver) || 0;
      if (smv<=VK_SKINMAN_VER)
         arr.push(Skins[i]);   
  }
  VK_STYLE_LIST=arr;//Skins;
  if (ge('content')) vkShowSkinMan();
}

function vkSetCSSCode(){
  var cur_css=vk_LSGetVal('VK_CURRENT_CSS_CODE');
  if (!cur_css) cur_css="";
  if (!window.vkCSSCodeBox || isNewLib()) vkCSSCodeBox = new MessageBox({title: IDL('CSSCode'),closeButton:true,width:"500px"});
  vkCSSCodeBox.removeButtons();
    
  vkCSSCodeBox.addButton(!isNewLib()?{
    onClick: vkCSSCodeBox.hide,
    style:'button_no',label:IDL('Hide')}:IDL('Hide'),vkCSSCodeBox.hide,'no');
      
  vkCSSCodeBox.addButton(!isNewLib()?{
    onClick: function(){ ge('vkcsscode').value=""; ge('vkcsscode').focus(); },
    style:'button_no',label:IDL('Clear')}:IDL('Clear'),function(){ ge('vkcsscode').value=""; ge('vkcsscode').focus(); },'no');

  var applycode=function(){ 
      var val=ge('vkcsscode').value;
      if (!val.match(/<\/?(style|script|textarea)/i)){// || val.match(/<\/?script/i) || val.match(/<\/?textarea/i)
        vkSwichCSS(val);
        //vkCSSCodeBox.hide(200); 
        //vkCSSCodeBox.content('');
      } else {
        alert(IDL('WrongCSSCode'));
      }
    };
  
  vkCSSCodeBox.addButton(!isNewLib()?{
    onClick: applycode,  
    label:IDL('Apply')}:IDL('Apply'), applycode ,'yes'); 
       
  /*vkCSSCodeBox.addButton({
    onClick: applycode,
    label:IDL('Apply')
  });*/
  vkCSSCodeBox.setOptions({
      onHide:function(){vkCSSCodeBox.content('');}  
  });
  vkCSSCodeBox.content(IDL('InsertCSSCode')+'<br><textarea style="width:460px; height:200px;" id="vkcsscode">'+cur_css+'</textarea>');
  vkCSSCodeBox.show(200);  
  return false;
}


function vkMakePageListS(cur,end,href,onclick,step){
 var after=2;
 var before=2;
 if (!step) step=1;
 var html='<ul class="pageList page_list fl_r">';
    if (cur>before) html+='<li><a href="'+href.replace(/%%/g,0)+'" onclick="'+onclick.replace(/%%/g,0)+'">&laquo;</a></li>';
    var from=Math.max(0,cur-before);
    var to=Math.min(end,cur+after);
    for (var i=from;i<=to;i++){
      html+=(i==cur)?'<li class="current">'+(i+1)+'</li>':'<li><a href="'+href.replace(/%%/g,(i*step))+'" onclick="'+onclick.replace(/%%/g,(i*step))+'">'+(i+1)+'</a></li>';
    }    
    if (end-cur>after) html+='<li><a href="'+href.replace(/%%/g,end)+'" onclick="'+onclick.replace(/%%/g,end)+'">&raquo;</a></li>';
  html+='</ul>';
  return html; 
}
function vkShowSkinMan(filter,page){
  vkDisableAjax();
  if (!window.VK_STYLE_LIST){
	var html='<div class="bar clearFix summaryBar summary_wrap clear_fix">'+
             '<div id="toppages" class="fl_r pages_top"></div>'+
             '<div class="summary">'+
                '<a class="notbold" href="#" onclick="return vkSwichStyle(prompt(IDL(\'EnterCSSLink\')));">'+IDL('SetByLink')+'</a>'+
                (vkLocalStoreReady()?'<span class="divider">|</span>'+
                '<a class="notbold" href="#" onclick="return vkSetCSSCode();">'+IDL('SetByCode')+'</a>':'')+
                (vkLocalStoreReady() && (
					(vk_LSGetVal('VK_CURRENT_CSS_CODE') && vk_LSGetVal('VK_CURRENT_CSS_CODE').length)
					||
					(vkGetVal('VK_CURRENT_CSS_URL') && vkGetVal('VK_CURRENT_CSS_URL').length)
				)?'<span class="divider">|</span>'+
                '<a class="notbold" href="#" onclick="vkSwichCSS(\'\'); vkSwichStyle(\'\'); return false;">'+IDL('ClearCssCode')+'</a>':'')+
             '</div>'+
             
            '</div>';
	  ge("content").innerHTML=html+'<div class="box_loader"></div>';
      var nows= new  Date(); 
      var datsig=nows.getYear()+"_"+nows.getMonth()+"_"+nows.getDate()+"_";
      datsig+=Math.floor(nows.getHours()/4); //raz v 4 chasa      
      var element = document.createElement('script');
      element.type = 'text/javascript';
      element.src = VK_CSS_CATALOG_BASE_URL+"?"+datsig;
      document.getElementsByTagName('head')[0].appendChild(element);
      return false;
  }
  if (!page) page=0;
  if (window.vk_updmenu_timeout) clearTimeout(vk_updmenu_timeout);
  vkMyStyles=VK_STYLE_LIST;
  var cats=vkPrepareCats(vkMyStyles);
  if (filter){
    vkMyStyles=[];
    for (var i=0; i<VK_STYLE_LIST.length; i++)
      if (VK_STYLE_LIST[i].cat && (VK_STYLE_LIST[i].cat.match(filter) /*|| VK_STYLE_LIST[i].cat=="*"*/))  vkMyStyles.push(VK_STYLE_LIST[i]);
      
  }
  document.title=IDL("SkinMan")+(filter?" | "+filter:"")+" | [vkOpt]";
  //addCss("css/photos2.css");
  vkaddcss("\
          .skin_table{text-align: left; padding: 0 5px 0;} \
          .current_skin,.noselected_skin {display:inline-block; margin:8px 8px 0; text-align: center; padding:3px;} \
          .current_skin DIV, .noselected_skin DIV {display:block;} \
          .thumbimg{width: 175px; height: 120px; overflow:hidden;} \
          .thumbimg img { background: white;padding: 6px; border: solid 1px #ccc; margin-top:3px; } \
          .thumbimg img:hover {  border: solid 1px #45688E; } \
          .current_skin{border: 1px solid #DDD; background-color: #EEF;} \
          .noselected_skin{border: 0px; background-color: transparent;} \
          .zoombg{background: url('"+zoom_img+"') 4px 0px no-repeat;} \
          .smaximize {  border-bottom: 1px solid #DAE1E8;  height: 19px;  line-height: 19px;  background-color: transparent; display: block;  clear: both;  padding: 3px; padding-left:25px;  border-bottom: solid 1px #CCD3DA; } \
          .smaximize:hover {  background-color: #DAE1E8;} \
          .smaximizeoff {  opacity: 0.5; color: #2b587a; border-bottom: 1px solid #DAE1E8;  height: 19px;  line-height: 19px;  background-color: transparent; display: block;  clear: both;  padding: 3px; padding-left:25px; border-bottom: solid 1px #CCD3DA; } \
          #vk_cat_skins_menu li a span, #vk_cat_skins_menu li a span{float:right;} \
          #sideBar ol#vk_cat_skins_menu {  list-style: none;  margin: 0px 0px 10px;  padding: 0px;}\
          #sideBar ol#vk_cat_skins_menu  li {  font-size: 1.0em;}\
          #sideBar ol#vk_cat_skins_menu  li a {  border: 0;  display: block;  padding: 4px 3px 4px 6px;}\
          ");
  vkMakeCatMenu(cats);
  var html='<div class="bar clearFix summaryBar summary_wrap clear_fix">'+
             '<div id="toppages" class="fl_r pages_top"></div>'+
             '<div class="summary">'+langNumeric(vkMyStyles.length,vk_lang["theme_num"])+ //+vkMyStyles.length+' '+IDL('Skins')+
                '<span class="divider">|</span>'+
                '<a class="notbold" href="#" onclick="return vkSwichStyle(prompt(IDL(\'EnterCSSLink\')));">'+IDL('SetByLink')+'</a>'+
                (vkLocalStoreReady()?'<span class="divider">|</span>'+
                '<a class="notbold" href="#" onclick="return vkSetCSSCode();">'+IDL('SetByCode')+'</a>':'')+
                (vkLocalStoreReady() && vk_LSGetVal('VK_CURRENT_CSS_CODE') && vk_LSGetVal('VK_CURRENT_CSS_CODE').length?'<span class="divider">|</span>'+
                '<a class="notbold" href="#" onclick="vkSwichCSS(\'\');return false;">'+IDL('ClearCssCode')+'</a>':'')+
             '</div>'+
             
            '</div>'+
  '<div id="vkSkinMan">'+
  '<div id="searchResults" class="searchResults clearFix"><div class="skin_table">';
  var COL_COUNT=3;
  var from=VK_THEMES_ON_PAGE*page;
  var to=Math.min(VK_THEMES_ON_PAGE*(page+1),vkMyStyles.length);  
  for (var i=from; i<to;i++){
     var Thumb=(vkMyStyles[i].thumb)?vkMyStyles[i].thumb:"http://vkontakte.ru/images/question_a.gif";
     var Screen=(vkMyStyles[i].screen)?vkMyStyles[i].screen:null;
     var Name=(vkMyStyles[i].name)?vkMyStyles[i].name:IDL("Noname");
     var Author=(vkMyStyles[i].author)?vkMyStyles[i].author:"N/A";
     var CssUrl=(vkMyStyles[i].url)?vkMyStyles[i].url:"";
     var CssJsUrl=(vkMyStyles[i].script_url)?vkMyStyles[i].script_url:"";
     html +=""+
          '<div class="'+(vkGetVal("VK_CURRENT_CSS_URL")==CssUrl?'current_skin':'noselected_skin')+'">'+
            '<div><h4 onclick="return vkSwichStyle(\''+CssUrl+'\',this,\''+CssJsUrl+'\');" style="cursor:hand;">'+Name+'</h4></div>'+
            
            '<div align=center class="thumbimg">'+
              '<a href="#" onclick="return vkSwichStyle(\''+CssUrl+'\',this,\''+CssJsUrl+'\');"><img width="160px" alt="'+Name+'" src="' + Thumb + '"/></a>'+
            '</div>' + 
            '<div><h4>'+IDL("Author")+": "+Author+'</h4></div>'+
            '<div>'+((Screen)?'<a class="smaximize zoombg" href="'+Screen+'" onclick="return vkShowScreen(\''+Screen+'\')">'+IDL("Zoom")+'</a>':
            '<span class="smaximizeoff zoombg">'+IDL("Zoom")+'</span>')+'</div>'+
          '</div>';
  }

  html+='</div></div></div>';
  ge("content").innerHTML=html;
  ge("toppages").innerHTML=vkMakePageListS(page,Math.ceil(vkMyStyles.length/VK_THEMES_ON_PAGE)-1,"javascript:vkShowSkinMan("+(filter?filter:false)+",%%);","vkShowSkinMan("+(filter?filter:false)+",%%); return false;");
  ge("header").innerHTML='<h1>'+IDL("SkinMan")+'</h1>';
  return false;
}


function vkSkinManInit(){
  if (window.icoNode){
      var flink = headNode.getElementsByTagName("link");
      for (var i=0; i<flink.length;i++) 
        if (flink[i].rel=='shortcut icon'){
          icoNode=flink[i];
          headNode.appendChild(icoNode);
          break;
        }
  }
  if (getSet(32)=='n' || location.href.match(/widget_.+php/)) return;
  var body = document.getElementsByTagName('body')[0];
  div=document.createElement('div');
  div.id='chStyle';
  div.setAttribute("style","position:fixed; top:0px; left:0px; z-index:999;");
  var arrow_style='font-size:11px; font-weight:normal; margin: 0px; line-height:15px; padding:0px 0px 0px 0px;';
  div.innerHTML='<div id="Strelki"><table><tr>'+
     // '<td><div style="'+arrow_style+'"><a href="#" style="'+arrow_style+'" onclick="return vkSwichStyle(prompt());">[S]</a></div></td>'+
      '<td><div style="'+arrow_style+'"><a href="#" style="'+arrow_style+'" onclick="hide(this); return vkShowSkinMan();">[&uarr;]</a></div></td>'+
      '</tr></table></div>';
  body.appendChild(div);
  if (location.href.match(/\?skinman/)) vkShowSkinMan();
}


function vkCheckInstallCss(){
  var dloc=document.location.href;
  if (dloc.match(/[\?&]installcss=http:\/\/.+/)){
    vkSwichStyle(dloc.match(/[\?&]installcss=(.+)/)[1]);
    location.href="/";
    return true;
  }
  return false;
}
/*
(function(){
  document.addEventListener('DOMContentLoaded',vkSkinManInit, false);
})();*/

if (!window.vkscripts_ok) vkscripts_ok=1; else vkscripts_ok++;