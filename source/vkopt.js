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
var vVersion	= 232;
var vBuild = 160407;
var vPostfix = ' ';
if (!window.vk_DEBUG) var vk_DEBUG=false;

var vkopt = {
   disallow_location: /\/m\.vk\.com|login\.vk\.com|oauth\.vk\.com|al_index\.php|frame\.php|widget_.+php|notifier\.php|audio\?act=done_add/i,
   dom_ready: function(fn, ctx){
      var ready, timer;
      var onChange = function (e) {
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
      if (vkopt.disallow_location.test(document.location.href)) return;
      //TODO: тут ещё бы дождаться подгрузки vk_lib.js
      vkopt.dom_ready(function(){

         if (!isNewVk()) return;
         console.log('init vkopt 3.x');
         vkopt.run();
      }); 
   },
   run:function(){
      for (var key in StaticFiles)  
         if (StaticFiles[key].t == 'js')
            vk_glue.inj_to_file(key); 
      
      vk_glue.nav_handler();
   },
   plugins: {
      on_js_file:function(file){
         console.log('on *.js: '+file);
      },
      on_location:function(){
         console.log('on nav: ', cur.module, ' obj: ', JSON.stringify(nav.objLoc)); 
      }
   }
}

var vk_glue = {
   inj_handler: function(files){ // call from stManager.add(files, callback, async)  ->   vk_glue.inj_handler(files)
      return function(no_pending){
         if (no_pending)
            console.log('no need inject?', files);
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
      vkopt.plugins.on_js_file(file_name); 
   },
   inj: {
      common: function(){
         // перехватываем момент подключения скриптов:
         Inj.BeforeR("stManager.add",/__stm._waiters.push\(\[([^,]+)/,"__stm._waiters.push([$1, vk_glue.inj_handler(#ARG0#)]);");
         // следующая строка не факт что нужна (а может оптимизированней будет, если её убрать), т.к она срабатывает только если у нас нет списка ожидания, 
         // т.е скрипты были ранее уже подгружены на страницу, и инъекции вероятно остались на месте.
         Inj.BeforeR("stManager.add",/(if\s*\(![a-zA-z_]+.length\))/,"$1{vk_glue.inj_handler(#ARG0#)(true);}"); //"_matched_{vk_glue.inj...
         
         // перехват события об аякс загрузке новой страницы / смене URL'а
         Inj.End('nav.setLoc',';\nsetTimeout(vk_glue.nav_handler,2);\n');
         

         // Перехватываем результат ajax-запросов с возможностью модификации перед колбеком
         Inj.Start('ajax._post', 
            // ARG0 - url; ARG1 - query object; ARG2 - options
            function(){
               // Mod callback:
               if (__ARG2__.onDone){
                  var onDoneOrig = __ARG2__.onDone;
                  __ARG2__.onDone = function(){
                     vk_glue.process_response(arguments, __ARG0__, __ARG1__);
                     onDoneOrig.apply(window, arguments);
                  }
               }
               // End of callback mod
            }
         );
         
        
         
         /*
         Inj.Start('ajax.framegot','if (#ARG1#) #ARG1#=vkopt.process_on_framegot(#ARG1#);');
         Inj.Start('ajax.post','if (vkAllowPost(url, query, options)==false) return;');
         Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
         */
      }
   },
   nav_handler: function(){
      // тут какие-то системные действия движка до передачи события в плагины
      // ...
      vkopt.plugins.on_location();
   },
   process_response: function(answer,url,q){
      console.log('hook response:',url, q, answer);
   }
}



vkopt.init();