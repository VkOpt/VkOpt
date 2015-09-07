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
  return window.localStorage || window.GM_SetValue || window.sessionStorage;
}
function vk_LSSetVal(key,val){
  if (typeof localStorage!='undefined') {localStorage[key]=val; return true;}//Chrome, FF3.5+
  else if (typeof GM_SetValue!='undefined'){ GM_SetValue(key,val); return true;}//Mozilla
  else if (typeof sessionStorage!='undefined'){sessionStorage.setItem(key, val); return true;} //Opera 10.5x+
  else return false;
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
if (name=='remixmid') { if (temp) return false; else { var tmp=remixmid(); return tmp; } }
	var dc = document.cookie;
	var prefix = name + "=";
	var begin = dc.indexOf("; " + prefix);
	if (begin == -1){		begin = dc.indexOf(prefix);		if (begin != 0) return null; }	else { begin += 2;}
	var end = document.cookie.indexOf(";", begin);
	if (end == -1){	end = dc.length;}
	return decodeURIComponent(dc.substring(begin + prefix.length, end));
}

function VkStyleMainInit(){
EnableSetStyle=true;
}
VkStyleMainInit();

if (!window.ge) ge=function(q) {return document.getElementById(q);};


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
            setTimeout(function(){add_scr_info();},2);
         }
      };
      add_scr_info();
}

var vk_skinman_last_style_url='';
function vkStyle(url){ 
   vk_skinman_last_style_url=url;
   var need_xhr=false;
   if (url && document.location.protocol=='https:' && url.substr(0,6)!='https:') need_xhr=true;
   var vkcssNode=ge("vkStyleCSS");
   if (vkcssNode) vkcssNode.parentNode.removeChild(vkcssNode);

   vkcssNode = null;
   var set = function(node){
      var head = document.getElementsByTagName('head')[0];
      if (!head){ 
         setTimeout(function(){set(node)},2);
         return;
      }
      head.appendChild(node);
   
   };  
   
   if (need_xhr && vk_ext_api.ready){
      vk_aj.get(url,function(css){
         if (vk_skinman_last_style_url!=url) return; // if new theme apply before loaded previous
         
         var t=url.split('/');
         t.pop();
         var base_url=t.join('/');
         var base_domain=t[0]+'//'+t[2];
         //*
         var replaced=0;
         css=css.replace(/(url\(['"]?)(.{6})/g,function(str,p1,p2){
            if (!/^(https?:|data:|\/\/)/.test(p2)){ // don't replace for absolute links  http:, https:, data:, //domain
               //console.log('"'+p2+'"', str);
               replaced++;
               return p1+(p2[0]=='/'?base_domain:base_url+'/')+p2;
            } else {
               return p1+''+p2;
            }
            //console.log(p1,p2);
         });
         if (replaced){
            if (vk_DEBUG) console.log('Process css: '+url+'\nbase_url: '+base_url+'\nbase_domain: '+base_domain+'\nreplaced: '+replaced);
         }
         //*/
         
         vkcssNode = document.createElement("style");
         vkcssNode.type = "text/css";
         vkcssNode.id="vkStyleCSS";
         vkcssNode.appendChild(document.createTextNode(css));
         set(vkcssNode);
      });

   } else {
      vkcssNode = document.createElement('link');
      vkcssNode.type = 'text/css';
      vkcssNode.rel = 'stylesheet';
      vkcssNode.id="vkStyleCSS";
      if (url) vkcssNode.href = url;
      set(vkcssNode);
   }

   /*
   if (ge("vkStyleCSS"))
      ge("vkStyleCSS").href=url; */
}

function vkStyleJS(url){ 
   if (window.vkThemeOnDisable) vkThemeOnDisable();
   
   var js=ge("vkStyleCSSJS");
   if (js)  js.parentNode.removeChild(js);
   
   AjCrossAttachJS(url,"vkStyleCSSJS");
   /*
   var  scriptElement = document.createElement("script");
   scriptElement.type = "text/javascript";
   scriptElement.id="vkStyleCSSJS";
   scriptElement.src=url;
   document.getElementsByTagName('head')[0].appendChild(scriptElement);
   */
   
   //if (ge("vkStyleCSSJS")) ge("vkStyleCSSJS").src=url; 
}

function vkSkinnerInit(){
  //var lsready=vkLocalStoreReady();
  if (!window.AjCrossAttachJS){
      setTimeout(function(){vkSkinnerInit();},2);
      return;
  }
  if (EnableSetStyle && !ge('vkStyleCSS')) {                                                           
    VK_CURRENT_CSS_URL=vkGetVal("VK_CURRENT_CSS_URL") || "";//vk_LSGetVal - only localstore; vkGetVal- localstore && cookie 
    VK_CURRENT_CSS_CODE=vk_LSGetVal('VK_CURRENT_CSS_CODE') || "";
    VK_CURRENT_CSSJS_URL=vkGetVal('VK_CURRENT_CSSJS_URL') || "";
    
      vkSetBodyScrResolution();
      
      vkStyle(VK_CURRENT_CSS_URL);
      /*
      var vkcssNode = document.createElement('link');
      vkcssNode.type = 'text/css';
      vkcssNode.rel = 'stylesheet';
      vkcssNode.id="vkStyleCSS";
      if (!VK_CURRENT_CSS_URL=="") vkcssNode.href = VK_CURRENT_CSS_URL;
      */
      
      var styleElement = document.createElement("style");
      styleElement.type = "text/css";
      styleElement.id="vkStyleNode";
      styleElement.appendChild(document.createTextNode(VK_CURRENT_CSS_CODE));
      
      var  scriptElement = null;
      if (VK_CURRENT_CSSJS_URL!=""){
         AjCrossAttachJS(VK_CURRENT_CSSJS_URL,"vkStyleCSSJS");
      } else {
         scriptElement = vkCe('script', {type: "text/javascript", id: "vkStyleCSSJS"});
      }
      //if (!VK_CURRENT_CSSJS_URL=="") scriptElement.src=VK_CURRENT_CSSJS_URL;
      
      var appendTo='head';//"body";
      var headID = document.getElementsByTagName(appendTo)[0];
	  //var link = document.getElementsByTagName('link')[0];
      if (headID){
        headID.appendChild(document.createElement('link'));//fix
        //headID.appendChild(vkcssNode);
        headID.appendChild(styleElement);
        if (scriptElement) 
         headID.appendChild(scriptElement);
      } else {
        var vkcsload=setInterval(function(){                                            
          if (document.getElementsByTagName(appendTo)[0]){
            clearInterval(vkcsload);
            headID = document.getElementsByTagName(appendTo)[0];
            //headID.appendChild(document.createElement('link'));//fix
            //headID.appendChild(vkcssNode);
            headID.appendChild(styleElement);
            if (scriptElement) 
               headID.appendChild(scriptElement);
          }
        },2);
    }
  }
}
vkSkinnerInit();

function vkSwichCSS(code){
  vk_LSSetVal('VK_CURRENT_CSS_CODE',code);
  val(ge('vkStyleNode'), code);
}

function vkSwichStyle(url,el,js){
  vkStyle(url);
  vkSetVal('VK_CURRENT_CSS_URL',url);
  
  vkStyleJS(js || "");
  vkSetVal('VK_CURRENT_CSSJS_URL',js);
  
  if (!window.geByClass) return true;
  var nodes=geByClass('current_skin');
  for (var i=0;i<nodes.length;i++){ nodes[i].setAttribute("class","noselected_skin"); }  
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
      var cat=skins[i].cat.split(/\s*,\s*/);
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
  val(ge("header"), '<h1>'+IDL("SkinMan")+' | '+cat+'</h1>');
  return false;
}
function vkMakeCatMenu(cats){
  if (!ge("snav")){
    var el=(ge('sideBar') || ge('side_bar')).getElementsByTagName('ol')[0];//ge("nav");
	vkNavigationMenu=el;
    //el.setAttribute("id","snav");
    var html='<li><h4 style="cursor:hand;" onclick="show(vkNavigationMenu); hide(\'vk_cat_skins_menu\')">'+IDL('categories')+"</h4></li>"+
             
             '<li><a href="#"  onclick="return vkShowSkinMan();" class="left_row">'+
               '<span class="left_count_wrap  fl_r"><span class="inl_bl left_count">'+cats.SkinsCount+'</span></span>'+
               '<span class="left_label inl_bl">'+IDL('all')+'</span>'+
             '</a></li>';

    for (var cat in cats)  if(cat!='SkinsCount') 
      html+='<li><a href="#"  category="'+cat+'" onclick="return vkCatNavigate(this);" class="left_row">\
    <span class="left_count_wrap  fl_r"><span class="inl_bl left_count">'+cats[cat]+'</span></span>\
    <span class="left_label inl_bl">'+cat+'</span>\
</a></li>';
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
function vkOnSkinList(Skins){   // Вызывается из подгружаемого js файла со списком 
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
      if (!/<\/?(style|script|textarea)/i.test(val)){// || val.match(/<\/?script/i) || val.match(/<\/?textarea/i)
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
  removeClass(geByTag1('body'),'audio_fixed_nav');
  removeClass(geByTag1('body'),'im_fixed_nav');
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
	  val(ge("content"), html+'<div class="box_loader"></div>');
      var nows= new  Date(); 
      var datsig=nows.getYear()+"_"+nows.getMonth()+"_"+nows.getDate()+"_";
      datsig+=Math.floor(nows.getHours()/4); //raz v 4 chasa      
      /*
      var element = document.createElement('script');
      element.type = 'text/javascript';
      element.src = VK_CSS_CATALOG_BASE_URL+"?"+datsig;
      document.getElementsByTagName('head')[0].appendChild(element);*/
      AjCrossAttachJS(VK_CSS_CATALOG_BASE_URL+"?"+datsig,"vkStyleCSSJS");
      
      return false;
  }
  if (!page) page=0;
  if (window.vk_updmenu_timeout) clearTimeout(vk_updmenu_timeout);
  vkMyStyles=VK_STYLE_LIST;
  var cats=vkPrepareCats(vkMyStyles);
  if (filter){
    vkMyStyles=[];
    for (var i=0; i<VK_STYLE_LIST.length; i++)
      if (VK_STYLE_LIST[i].cat && (filter.test(VK_STYLE_LIST[i].cat) /*|| VK_STYLE_LIST[i].cat=="*"*/))  vkMyStyles.push(VK_STYLE_LIST[i]);
      
  }
  document.title=IDL("SkinMan")+(filter?" | "+filter:"")+" | [vkOpt]";
  //addCss("css/photos2.css");
  vkaddcss("\
          .vk_cssjs_ico{background-image:url('"+skinman_cssjs+"'); cursor:pointer; display: block; height: 16px; width: 16px; float:right;}\
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
          /*#vk_cat_skins_menu li a span, #vk_cat_skins_menu li a span{float:right;}*/ \
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
  var from=VK_THEMES_ON_PAGE*page;
  var to=Math.min(VK_THEMES_ON_PAGE*(page+1),vkMyStyles.length); 
  var pids=[];
  for (var i=from; i<to;i++){
     if (vkMyStyles[i].pid)
         vkMyStyles[i].pid=vkMyStyles[i].pid.match(/-?\d+_\d+/)[0];
     if (vkMyStyles[i].pid) pids.push(vkMyStyles[i].pid);
     var Thumb=(vkMyStyles[i].thumb)?vkMyStyles[i].thumb:"/images/question_a.gif";
     var Screen=(vkMyStyles[i].screen)?vkMyStyles[i].screen:null;
     var Name=(vkMyStyles[i].name)?vkMyStyles[i].name:IDL("Noname");
     var Author=(vkMyStyles[i].author)?vkMyStyles[i].author:"N/A";
     var CssUrl=(vkMyStyles[i].url)?vkMyStyles[i].url:"";
     var CssJsUrl=(vkMyStyles[i].script_url)?vkMyStyles[i].script_url:"";
     var CssDesc=(vkMyStyles[i].description)?vkMyStyles[i].description:"";
     
     var like_wrap=vkMyStyles[i].pid?vk_skinman.get_like_html(vkMyStyles[i].pid):'';

     var mouseover = ' onmouseover="vkSkinManInfo(this,\''+(CssDesc!=""?CssDesc:IDL('WarnCSSJSTheme'))+'\');" ';
     html +=""+
          '<div class="'+(vkGetVal("VK_CURRENT_CSS_URL")==CssUrl?'current_skin':'noselected_skin')+'">'+
            '<div>'+like_wrap+'<h4 onclick="return vkSwichStyle(\''+CssUrl+'\',this,\''+CssJsUrl+'\');" style="cursor:hand;">'+Name+(CssJsUrl!=""?'<span class="vk_cssjs_ico" '+mouseover+'></span>':"")+'</h4></div>'+
            
            '<div align=center class="thumbimg">'+
              '<a href="#" onclick="return vkSwichStyle(\''+CssUrl+'\',this,\''+CssJsUrl+'\');"><img width="160px" alt="'+Name+'" src="' + Thumb + '"/></a>'+
            '</div>' + 
            '<div><h4>'+IDL("Author")+": "+Author+'</h4></div>'+
            '<div>'+((Screen)?'<a class="smaximize zoombg" href="'+Screen+'" onclick="return vkShowScreen(\''+Screen+'\')">'+IDL("Zoom")+'</a>':
            '<span class="smaximizeoff zoombg">'+IDL("Zoom")+'</span>')+'</div>'+
          '</div>';
  }

  html+='</div></div></div>';
  val(ge("content"), html);
  val(ge("toppages"), vkMakePageListS(page,Math.ceil(vkMyStyles.length/VK_THEMES_ON_PAGE)-1,"javascript:vkShowSkinMan("+(filter || false)+",%%);","vkShowSkinMan("+(filter || false)+",%%); return false;"));
  val(ge("header"), '<h1>'+IDL("SkinMan")+'</h1>');
  vk_skinman.likes_load(pids);
  return false;
}

vk_skinman={
   css:'\
      .skin_like{\
         border-radius: 3px;\
         cursor: pointer;\
         font-size: 10px;\
         margin-top: -1px;\
         overflow: hidden;\
         /*padding: 5px 6px;*/\
         right: 0px;\
         white-space: nowrap;\
      }\
      .sm_like_icon{\
         background: url(/images/icons/like_2x.png) 1px 0px no-repeat transparent;\
         background-size: 10px 32px;\
         height: 10px;\
         margin: 2px 2px 0px;\
         opacity: 0.4;\
         padding-right: 1px;\
         width: 11px;\
      }\
      .sm_like_count {\
         color: #7295B2;\
         font-weight: 700;\
      }\
      .skin_like:hover .sm_like_icon{  opacity: 0.8; }\
      .skin_like .my_like.sm_like_icon {  opacity: 1;  }\
   ',
   get_like_html:function(pid,count){
      return '<div class="skin_like fl_l" onmouseover="vk_skinman.like_over(\''+pid+'\',this)" onmouseout="vk_skinman.like_out(\''+pid+'\')" onclick="vk_skinman.like(\''+pid+'\'); event.cancelBubble = true;">\
<i class="sm_like_icon fl_l" id="s_like_icon'+pid+'"></i>\
<span class="sm_like_count fl_l" id="s_like_count'+pid+'">'+(count||'')+'</span>\
</div>';
   },
   likes_load:function(pids){
      dApi.call('photos.getById',{photos:pids.join(','),extended:1},function(r){
         var data=r.response;
         for (var i=0; i<data.length; i++){
            var cnt=data[i].likes.count;
            var my_like=data[i].likes.user_likes;
            var pid=data[i].owner_id+'_'+data[i].pid;
            
            var icon=ge('s_like_icon'+pid),
                count=ge('s_like_count'+pid);
            if (count) val(count, cnt>0?cnt:'');
            if (icon && my_like) addClass(icon,'my_like');
         }
      })
   },
   like:function(pid){
      var id=pid.match(/(-?\d+)_(\d+)/);
      var oid=id[1];
      var item_id=id[2];
      
      var icon=ge('s_like_icon'+pid),
          count=ge('s_like_count'+pid);
      var act=hasClass(icon,'my_like');
      (act?removeClass:addClass)(icon,'my_like');
      dApi.call(act?'likes.delete':'likes.add',{type:'photo', owner_id:oid,item_id:item_id},function(r){
         val(count, r.response.likes);
         if (icon.parentNode.tt) icon.parentNode.tt.destroy();
         //icon.parentNode.tt=null;
         //vk_skinman.like_over(pid);
      })
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
         shift: [55, 0, 15],
         ajaxdt: 100,
         showdt: 400,
         hidedt: 200,
         className: 'rich like_tt'
      });
   },
   like_out:function(pid){
      
   }
};

function vkSkinManInfo(el,text,hasover){
	showTooltip(el, {
		  hasover:hasover,
		  text:text,
		  slide: 15,
		  //shift: [0, -3, 0],
		  showdt: 100,
		  hidedt: 200,
        width:70
	});
}

function vkSkinManInit(){
  if (window.icoNode){
      var flink = headNode.getElementsByTagName("link");
      for (var i=0; i<flink.length;i++) 
        if (flink[i].rel=='shortcut icon'){
          var icoNode=flink[i];
          headNode.appendChild(icoNode);
          break;
        }
  }
  if (getSet(32)=='n' || /widget_.+php/.test(location.href)) return;
  var body = document.getElementsByTagName('body')[0];
  var div=document.createElement('div');
  div.id='chStyle';
  div.setAttribute("style","position:fixed; top:0px; left:0px; z-index:999;");
  var arrow_style='font-size:11px; font-weight:normal; margin: 0px; line-height:15px; padding:0px 0px 0px 0px;';
  val(div, '<div id="Strelki"><table><tr>'+
     // '<td><div style="'+arrow_style+'"><a href="#" style="'+arrow_style+'" onclick="return vkSwichStyle(prompt());">[S]</a></div></td>'+
      '<td><div style="'+arrow_style+'"><a href="#" style="'+arrow_style+'" onclick="hide(this); return vkShowSkinMan();">[&uarr;]</a></div></td>'+
      '</tr></table></div>');
  body.appendChild(div);
  if (/\?skinman/.test(location.href)) vkShowSkinMan();
}


function vkCheckInstallCss(){
  var dloc=document.location.href;
  if (/[\?&]installcss=http:\/\/.+/.test(dloc)){
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