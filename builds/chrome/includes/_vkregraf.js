// ==UserScript==
// @name          ReSend Graffiti v0.5  (by KiberInfinity id13391307)
// @description   plugin for VkOpt
// @include       http://*vkontakte.ru/*
// @include       http://*vk.com/*
// ==/UserScript==
VK_GRAFF_URL = '';

function showBox_2(url, params, options, e) {
  if (checkEvent(e)) return false;

  var opts = options || {}, box = new MessageBox(opts.params || {});
  box.evalBox_2=function(js, url, params) {
		  var picurl=VK_GRAFF_URL;
		  picurl=(picurl.match('vk.com'))?picurl.split('vk.com').join('vkontakte.ru'):picurl;
		  var picurl_hash=vkMD5(picurl);
		  var params="\n'bgURL':'"+picurl+"',\n'bgURLSign':'"+picurl_hash+"',";
		  js=js.replace("var vars = {","var vars = { "+params);
		  var scr = '((function() { return function() { var box = this; ' + (js || '') + ';}; })())'; // IE :(
		  try {
			var fn = eval(scr);
			fn.apply(this, [url, params]);
		  } catch (e) {
			topError(e, {dt: 15, type: 7, url: url, query: params ? ajx2q(params) : undefined, js: js});
		  }
  }
  var p = {
    onDone: function(title, html, js) {
      if (!box.isVisible()) return;
      try {
        show(boxLayerBG);
        box.setOptions({title: title, hideButtons: false});
        if (opts.showProgress) {
          box.show();
        } else {
          show(box.bodyNode);
        }
        box.content(html);
        box.evalBox_2(js, url, params);
        if (opts.onDone) opts.onDone();
      } catch(e) {
        topError(e, {dt: 15, type: 103, url: url, query: ajx2q(params), answer: Array.prototype.slice.call(arguments).join('<!>')});
        if (box.isVisible()) box.hide();
      }
    },
    onFail: function(error) {
      box.failed = true;
      setTimeout(box.hide, 0);
      if (isFunction(opts.onFail)) return opts.onFail(error);
    },
    cache: opts.cache,
    stat: opts.stat
  };

  if (opts.prgEl) {
    opts.showProgress = showGlobalPrg.pbind(opts.prgEl, {cls: opts.prgClass, w: opts.prgW, h: opts.prgH, hide: true});
    opts.hideProgress = hide.pbind('global_prg');
  }
  if (opts.showProgress) {
    extend(p, {
      showProgress: opts.showProgress,
      hideProgress: opts.hideProgress
    });
  } else {
    box.setOptions({title: false, hideButtons: true}).show();
    if (__bq.count() < 2) {
      hide(boxLayerBG);
    }
    hide(box.bodyNode);
    p.showProgress = function() {
      show(boxLoader);
      boxRefreshCoords(boxLoader);
    }
    p.hideProgress = hide.pbind(boxLoader);
  }
  box.removeButtons().addButton(getLang('global_close'));

  ajax.post(url, params, p);
  return box;
}

function vkGRSend_Box(mid){
	// 
	var url=prompt('Graffiti URL (http://csXXX.vkontakte.ru/*.png)');
	if (!url) return;
	VK_GRAFF_URL = url;
	showBox_2('al_wall.php', {act: 'draw_box', to_id: cur.postTo, flash: browser.flash});
}

function vkGRSend_AddItem() {
  var AddGraffItem=function(bef){
    var mid=ge('mid')?ge('mid').value:(window.cur && cur.oid?cur.oid:0);
    if (bef && mid){
    vkAddScript('/js/lib/swfobject.js');
    var a=document.createElement('a');
    a.setAttribute("onfocus","this.blur()");
    a.setAttribute("id","vkgrs_wall_post_type0");
    a.setAttribute("style","background-image: url(/images/icons/wall_icons.gif); background-position: 0px 0px;");
    a.setAttribute("href","#");
    a.setAttribute("onclick","vkGRSend_Box("+mid+");return false;");
    a.innerHTML=IDL('from URL');
    bef.parentNode.insertBefore(a,bef.nextSibling);
    }   
  };
  
  if (ge('vkgrs_wall_post_type0')) return;
  var vk__addMediaIndex=0;
  if (window.__addMediaIndex) vk__addMediaIndex=__addMediaIndex;
  var lnkId = ++vk__addMediaIndex;
  if (ge('page_add_media')){
    Inj.Wait("ge('add_media_type_"+(lnkId-1)+"_0')",AddGraffItem,300,10);
	Inj.Wait("ge('add_media_type_"+lnkId+"_0')",AddGraffItem,300,10);
  } 
}
function vkGRSend_OnNewLocation(nav_obj,cur_module){
	if(cur_module=='profile' || cur_module=='groups' || cur_module=='wall'){
		vkGRSend_AddItem();
	}

}
function vkGRSend_init(){
/*
	MessageBox.evalBox_2=function(js, url, params) {
		  alert(js);
		  var scr = '((function() { return function() { var box = this; ' + (js || '') + ';}; })())'; // IE :(
		  try {
			var fn = eval(scr);
			fn.apply(this, [url, params]);
		  } catch (e) {
			topError(e, {dt: 15, type: 7, url: url, query: params ? ajx2q(params) : undefined, js: js});
		  }
	}
*/
}
if (!window.vkopt_plugins) vkopt_plugins={};
(function(){
	var PLUGIN_ID = 'vkgrsend';
	var PLUGIN_NAME = 'vk graffiti resend';
	
	var ADDITIONAL_CSS='';
	
	/* FUNCTIONS */
	var INIT = vkGRSend_init;					// function()
	var ON_NEW_LOCATION = vkGRSend_OnNewLocation;// function(nav_obj,cur_module_name);
	var PROCESS_NEW_SCRIPT = null;				// function(file_name);
	var ON_STORAGE = null; 		  				// function(command_id,command_obj);
	var PROCESS_LINK_FUNCTION = null;			// function(link);
	var PROCESS_NODE_FUNCTION = null;			// function(node);
	
	
	
	vkopt_plugins[PLUGIN_ID]={
		Name:PLUGIN_NAME,
		css:ADDITIONAL_CSS,
		init:INIT,
		onLocation:ON_NEW_LOCATION,
		onLibFiles:PROCESS_NEW_SCRIPT,
		onStorage :ON_STORAGE,
		processLinks:PROCESS_LINK_FUNCTION,
		processNode:PROCESS_NODE_FUNCTION
	};
	if (window.vkopt_ready) vkopt_plugin_run(PLUGIN_ID);
})();