// ==UserScript==
// @name          VKOpt 3.x
// @author        KiberInfinity( /id13391307 )
// @namespace     http://vkopt.net/
// @description   Vkontakte Optimizer 3.x
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//
/* VERSION INFO */
var vVersion	= 233;
var vBuild = 160418;
var vPostfix = ' ';

if (!window.vkopt) window.vkopt={};
var vkopt_core = {
   disallow_location: /\/m\.vk\.com|login\.vk\.com|oauth\.vk\.com|al_index\.php|frame\.php|widget_.+php|notifier\.php|audio\?act=done_add/i,
   dom_ready: function(fn, ctx){
      var ready, timer;
      var onChange = function (e) {
         if (!window.IDL || !window.VK_LANGS) return; // Ждём vk_lib.js и vklang.js
         if (document.getElementById('footer') || document.getElementById('footer_wrap')) {
            fireDOMReady();
         } else if (e && e.type == "DOMContentLoaded") {
            fireDOMReady();
         } else if (e && e.type == "load") {
            fireDOMReady();
         } else if (document.readyState) {
            if ((/loaded|complete/).test(document.readyState)) {
               fireDOMReady();
            } else if (!!document.documentElement.doScroll) {
               try {
                  ready || document.documentElement.doScroll('left');
               } catch (e) {
                  return;
               }
               fireDOMReady();
            }
         }
      };
      var fireDOMReady = function () {
         if (!ready) {
            ready = true;
            fn.call(ctx || window);
            if (document.removeEventListener)
               document.removeEventListener("DOMContentLoaded", onChange, false);
            document.onreadystatechange = null;
            window.onload = null;
            clearInterval(timer);
            timer = null;
         }
      };
      if (document.addEventListener)
         document.addEventListener("DOMContentLoaded", onChange, false);
      document.onreadystatechange = onChange;
      timer = setInterval(onChange, 5);
      window.onload = onChange;
   },
   init: function(){
      if (vkopt_core.disallow_location.test(document.location.href)) return;
      //TODO: тут ещё бы дождаться подгрузки vk_lib.js
      vkopt_core.dom_ready(function(){
         if (!isNewVk()) return;
         console.log('init vkopt 3.x');
         vkopt_core.run();
      }); 
   },
   run: function(){
      for (var key in StaticFiles)  
         if (StaticFiles[key].t == 'js')
            vk_glue.inj_to_file(key); 
      vkBroadcast.Init(vkOnStorage);
      vkopt_core.plugins.on_init();
      vk_glue.nav_handler();
      window.vkopt_core_ready = true;
      vkCheckUpdates();
   },
   
   mod_str_as_node: function(str, func, params){
      if (!str || str.tagName)
         return str;
      var is_table = str.substr(0,3)=='<tr';
      var div = vkCe(is_table?'table':'div');
      div.innerHTML = str;
      func(div,params);
      var txt = div.innerHTML;
      if (is_table && txt.substr(0,7) == "<tbody>")
         txt = txt.substr(7,txt.length-15);
      return txt;
      //TODO: call to plugins 
   }, 
   setLoc: function(new_location){
      nav.setLoc(new_location,'vkopt');
   },   
   /*
   (function(){
      var m = {
         id: 'vkopt_any_plugin',
         onInit:           function(){},                        // выполняется один раз после загрузки стрницы
         onLibFiles:       function(file_name){},               // место для инъекций = срабатывает при подключении нового js-файла движком контакта.
         onLocation:       function(nav_obj,cur_module_name){}, // вызывается при переходе между страницами
         onResponseAnswer: function(answer,url,params){},       // answer - массив, изменять только его элементы
         onStorage :       function(command_id,command_obj){},  // слушает сообщения отосланные из других вкладок вк через vkCmd(command_id,command_obj)
         processNode:      function(node, params){}             // обработка элемента
         processLinks:     function(link, params){},            // обработка ссылки
      };
      window.vkopt = (window.vkopt || {});
      window.vkopt[m.id] = m;
      if (window.vkopt_core_ready) vkopt_core.plugins.delayed_run(m.id);
   })();
   
   */
   plugins: {
      delayed_run: function(plug_id){ //функция для пуска отдельного плагина, который не был подключен до основного запуска вкопта
         
         var css = vkopt_core.plugins.get_css(plug_id);
         if (css != '') 
            vkaddcss(code);
         
         vkopt_core.plugins.call_method(plug_id, 'onInit');
         
         for (var key in StaticFiles) 
            if (StaticFiles[key].t == 'js')
               vkopt_core.plugins.call_method(plug_id, 'onLibFiles', key);
            
         vkopt_core.plugins.call_method(plug_id, 'onLocation', nav.objLoc, cur.module);
         vkopt_core.plugins.call_method(plug_id, 'processNode', null, {source:'delayed_run'});
      },
      call_method: function(){ // (plug_id, method, arg1, arg2 ...)
         var args = Array.prototype.slice.call(arguments);
         var plug_id = args.shift();
         var method = args.shift();
         if (vkopt[plug_id][method]) // TODO: && isModuleEnabled(plug_id)
            return vkopt[plug_id][method].apply(window, args); 
         return null;
      },
      call_modules: function(){ // (method, arg1, arg2 ...)
         var args = Array.prototype.slice.call(arguments);
         var results = [];
         for (var plug_id in vkopt){
            var res = vkopt_core.plugins.call_method.apply(this, [plug_id].concat(args));
            if (res) results.push(res);
         }
         return results;
      },
      on_init:function(){
         vkopt_core.plugins.add_css();
         vkopt_core.plugins.call_modules('onInit');
      },
      add_css:function(){
         var code = '';
         for (var plug_id in vkopt)
            code += vkopt_core.plugins.get_css(plug_id);
         vkaddcss(code);
      },
      get_css:function(plug_id){
         var css = vkopt[plug_id].css;
         if (!css) return '';
         return (Object.prototype.toString.call(p.css) === '[object Function]')?css():css;
      },
      on_js_file: function(file){
         //console.log('on *.js: '+file);
         vkopt_core.plugins.call_modules('onLibFiles', file);
      },
      on_location: function(){
         //console.log('on nav: ', cur.module, ' obj: ', JSON.stringify(nav.objLoc)); 
         vkopt_core.plugins.call_modules('onLocation', nav.objLoc, cur.module);
      },
      on_storage: function(id, cmd){ // listen messages for communicate between tabs
         vkopt_core.plugins.call_modules('onStorage', id, cmd);
      },
      process_response: function(answer, url, q){
         var _rx = /^\s*<(div|table|input|a)/i;
         for (var i=0;i<answer.length;i++){
            if (typeof answer[i]=='string' && _rx.test(answer[i]) ){
               answer[i] = vkopt_core.mod_str_as_node(answer[i], vkopt_core.plugins.process_node, {source:'process_response', url:url, q:q});
            }
         }
         vkopt_core.plugins.call_modules('onResponseAnswer', answer,url,q);
      },
      process_node: function(node, params){
         node = node || ge('content');
         var nodes=node.getElementsByTagName('a'); 
         for (var i=0;i<nodes.length;i++)
            vkopt_core.plugins.process_links(nodes[i],params);
         //if (params && params.source = 'process_response' )
         vkopt_core.plugins.call_modules('processNode', node, params);
      },
      process_links:function(link_el, params){
         vkopt_core.plugins.call_modules('processLinks', link_el, params);
      }
   }
}

var vk_glue = {
   inj_handler: function(files){ // call from stManager.add(files, callback, async)  ->   vk_glue.inj_handler(files)
      return function(no_pending){
         if (no_pending)
            console.log('no need inject?', files)
            
         if (!isArray(files)) files = [files];
         for (var i in files){
            if (files[i].indexOf('.js') != -1) 
               vk_glue.inj_to_file(files[i]);
         }
      }
   },
   inj_to_file: function(file_name){
      switch (file_name){
         case 'common.js':       vk_glue.inj.common();  break;
      }
      vkopt_core.plugins.on_js_file(file_name); 
   },
   inj: {
      common: function(){
         // перехватываем момент подключения скриптов:
         Inj.BeforeR("stManager.add",/__stm._waiters.push\(\[([^,]+)/,"__stm._waiters.push([$1, vk_glue.inj_handler(#ARG0#)]);");
         
         // следующая строка не факт что нужна (а может оптимизированней будет, если её убрать), т.к она срабатывает только если у нас нет списка ожидания, 
         // т.е скрипты были ранее уже подгружены на страницу, и инъекции вероятно остались на месте.
         //Inj.BeforeR("stManager.add",/(if\s*\(![a-zA-z_]+.length\))/,"$1{vk_glue.inj_handler(#ARG0#)(true);}"); //"_matched_{vk_glue.inj...
         
         // перехват события об аякс загрузке новой страницы / смене URL'а
         Inj.End('nav.setLoc',';\nif (arguments[1]!="vkopt") setTimeout(vk_glue.nav_handler,2);\n');
         

         // Перехватываем результат ajax-запросов с возможностью модификации перед колбеком
         Inj.Start('ajax._post', 
            // ARG0 - url; ARG1 - query object; ARG2 - options
            function(){
               // Mod callback:
               if (__ARG2__.onDone){
                  var onDoneOrig = __ARG2__.onDone;
                  __ARG2__.onDone = function(){
                     vk_glue.response_handler(arguments, __ARG0__, __ARG1__);
                     onDoneOrig.apply(window, arguments);
                  }
               }
               // End of callback mod
            }
         );
         
        
         
         /*
         Inj.Start('ajax.framegot','if (#ARG1#) #ARG1#=vkopt_core.process_on_framegot(#ARG1#);');
         Inj.Start('ajax.post','if (vkAllowPost(url, query, options)==false) return;');
         Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
         */
      }
   },
   nav_handler: function(){
      // тут какие-то системные действия движка до передачи события в плагины
      // ...
      vkopt_core.plugins.on_location();
   },
   response_handler: function(answer,url,q){
      vkopt_core.plugins.process_response(answer, url, q);
   }
}

vkopt['settings'] =  {
   tpls: null,
   onInit: function(){
      var values = {
         full_title: vk_lib.format('Vkontakte Optimizer %1<sup><i>%2</i></sup> (build %3)', String(vVersion).split('').join('.'), vPostfix, vBuild)
      };
      // Кто-то что-то имеет против против такого пожирания ресурсов, в обмен на более удобное описание больших кусков текста? (и да, я в курсе что это создаст проблем в случае минимизации)
      vkopt.settings.tpls = vk_lib.get_block_comments(function(){
         /*right_menu_item:
         <a id="ui_rmenu_vkopt" href="/settings?act=vkopt" class="ui_rmenu_item _ui_item_payments" onclick="return vkopt.settings.show(this);"><span>{lng.VkOpt}</span></a>
         */
         /*main:
         <div id="vkopt_settings_block" class="page_block clear_fix">
             <div class="page_block_header">{vals.full_title}</div>
             <div id="vkopt_settings">
               Comming soon! <!--☑ Check Me!--!>
               <!--CODE--!>   
             </div>
         </div>         
         */
      });
      // Подставляем локализацию в шаблон:
      for (var key in vkopt.settings.tpls)
         vkopt.settings.tpls[key] = vk_lib.tpl_process(vkopt.settings.tpls[key],values);
      
   },
   onLocation: function(nav_obj,cur_module_name){
      if (nav_obj[0] != 'settings') return;
      if (!ge('ui_rmenu_vkopt')){
         var item = se(vkopt.settings.tpls.right_menu_item);
         var p = (ge('ui_rmenu_general') || {}).parentNode;
         p && p.appendChild(item);
      }
      if (nav_obj.act == 'vkopt'){
         vkopt.settings.show();
      }
   },
   show: function(el, in_box){
      var p = null;
      if (!in_box){
         el = el || ge('ui_rmenu_vkopt');
         el && uiRightMenu.switchMenu(el);
         p = ge('wide_column');
         vkopt_core.setLoc('settings?act=vkopt'); // вместо nav.setLoc для избежания рекурсии, обход реакции на смену URL'а
      }
      p.innerHTML = vkopt.settings.tpls.main;
      return false;
   }
}
/*
vkopt['test_module'] =  {
   onLibFiles:       function(file_name){
      console.log('test onLibFiles:',file_name)
   },
   onLocation:       function(nav_obj,cur_module_name){
      console.log('test onLocation:',nav_obj,cur_module_name)
   },
   onResponseAnswer: function(answer,url,params){
      console.log('test onResponseAnswer:',url,params,answer)
   },
   onStorage :       function(command_id,command_obj){
      console.log('test onStorage:', command_id, command_obj)
   },
   processNode:      function(node, params){
      console.log('test processNode:',node, params)
   },
   processLinks:     function(link_el, params){
      console.log('test processLinks:',link_el, params)
   }
}
*/
vkopt_core.init();