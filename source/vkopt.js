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
var vVersion = 307;
var vBuild = 181220;
var vVersionRev = 2;
var vPostfix = '';

if (!window.vkopt) window.vkopt={};

var vkopt_defaults = {
   config: {
      scroll_to_next: false,
      ad_block: true,
      skip_away: true,
      compact_audio: false,
      audio_full_title: false,
      disable_border_radius: false,
      audio_dl: true,
      audio_wait_hover: true,
      vid_dl: true,
      audio_size_info: false,
      audio_clean_titles: false,
      audio_album_info: true,
      //size_info_on_ctrl: true,
      scrobbler: true,
      im_dialogs_right: false,
      dont_cut_bracket: false,
      postpone_custom_interval: true,
      pv_comm_move_down: false,
      calc_age: true,
      audio_pos: false,
      old_unread_msg: false,
      old_unread_msg_bg: 'c5d9e7',
      im_recent_emoji: false,
      ru_vk_logo: false,
      //hide_big_like: false,
      hide_left_set: false,
      hide_recommendations: false,
      show_full_user_info: false,
      switch_kbd_lay: true,
      show_online_status: false,
      show_common_group: false,
      common_group_color: '90ee90',
      dislikes_enabled: false,
      dislike_icon_index: 1,
      reverse_comments: false,

      //disabled:
      im_store_h: false,

      //Extra:
      vkopt_guide: true,   // показываем, где находится кнопка настроек, до тех пор, пока в настройки всё же не зайдут
      photo_replacer: true,
      audio_more_acts: true, // доп. менюшка для каждой аудиозаписи
      vk_audio_icon_dots: false, // иконка аудио "действия/скачать" в виде трех точек
      //audio_dl_acts_2_btns: false, // разделить на аудио кнопки скачивания и меню доп.действий
      audio_force_flash: false, // принудительно использовать Flash для аудио-плеера
      im_hide_dialogs: false, // Новый стиль диалогов. Полотно переписки на всю ширину, список диалогов скрывается при клике по истории, показ списка - клик по заголовку переписки
      attach_media_by_id: true, // при вставке айди медиа в поле поиска из диалога прикрепления, в диалог подгружается медиа-файл с этим айди
      datepicker_inj: true, // активна ли инъекция в конструктор DatePicker'а
      zodiak_ophiuchus:false, // 13ый знак зодиака, Змееносец, между 30 ноября и 17 декабря
      photo_search_copy: true,
      ph_download_with_name: false,
      stealth_addons: true, // прикидываемся перед ТП, что у нас не стоит расширение для скачивания.
      im_block_typing: false,
      im_block_mark_read: false,
      gim_block_typing: false,
      gim_block_mark_read: false,
      accept_more_cats: true,

      lastfm_enable_scrobbling: false,
      lastfm_token: '',
      lastfm_username: 'NO_AUTH',
      lastfm_session_key: '',

      //Consts:
      SAVE_MSG_HISTORY_PATTERN: "%username% (%date%):\r\n%message%\r\n%attachments%\r\n\r\n",
      SAVE_MSG_HISTORY_DATE_FORMAT: "HH:MM:ss  dd/mm/yyyy",
      AUDIO_INFO_LOAD_THREADS_COUNT: 5,
      AUTO_LIST_DRAW_ROWS_INJ: true, // На случай, если инъекция будет убивать редер автоподгружаемых списков
      MAX_CACHE_AUDIO_SIZE_ITEMS: 10000 // максимальное количество запомненных размеров аудио в локальном хранилище
   },
   popular: [
      'dislikes_enabled',
      'scroll_to_next',
      'pv_comm_move_down',
      'disable_border_radius'
   ],
   disabled_modules: [
      /*
      "res",
      "settings",
      "lang",
      "owners",
      "away",
      "photoview",
      "photos",
      "audio",
      "scrobbler",
      "audio_info",
      "audioplayer",
      "videoview",
      "messages",
      "attacher",
      "face",
      "profile",
      "groups",
      "wall",
      "friends",
      "support",
      "test_module",
      "turn_blocks",
      "vk_dislike"
      */
   ]
};

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
         // if (!isNewVk()) return;
         if (!window.StaticFiles){
            console.log('avoid vkopt init');
         } else {
            console.log('init vkopt 3.x');
            vkopt_core.run();
         }
      });
   },
   run: function(){
      // Под новый дизайн чуть другие функции работы с локализацией.
      vkopt.lang.override(); // TODO: убрать этот костыль при удалении скриптов для старого дизайна
      vkopt.settings.init_defaults();
      for (var key in StaticFiles)
         if (StaticFiles[key].t == 'js' && StaticFiles[key].l)
            vk_glue.inj_to_file(key.split('/').pop(), key);
      vkopt_core.plugins.on_init();
      vk_glue.nav_handler();
      window.vkopt_core_ready = true;
      vkCheckUpdates();
   },
   timeout: function(fn, t){
      return window['set'+'Timeout'](fn,t);
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
   setLoc: function(new_location){  // использовать вместо nav.setLoc для избежания рекурсии, обход реакции на смену URL'а
      nav.setLoc(new_location,'vkopt');
   },
   plugins: {
      delayed_run: function(plug_id){ //функция для пуска отдельного плагина, который не был подключен до основного запуска вкопта
         // сначала прописываем в vkopt_defaults.config данные о значениях опций по умолчанию
         var options_list = vkopt_core.plugins.call_method(plug_id, 'onSettings');
         vkopt.settings.update_defaults(options_list);

         // добавляем стили модуля в страницу
         var css = vkopt_core.plugins.get_css(plug_id);
         if (css != '')
            vkopt.set_css(css, 'vkopt_'+plug_id+'_styles');

         vkopt_core.plugins.call_method(plug_id, 'onInit');
         vkopt_core.plugins.call_modules('onModuleDelayedInit', plug_id); // сообщаем всем модулям о подключении опоздавшего

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
         //Предотвращаем вызов обработчиков у отключенных модулей
         if (vkopt_defaults.disabled_modules.indexOf(plug_id) > -1)
            return;
         var field = vkopt[plug_id][method];
         if (field) // TODO: && isModuleEnabled(plug_id)
            return isFunction(field) ? field.apply(this, args) : field;
      },
      call_modules: function(){ // (method, arg1, arg2 ...)
         var args = Array.prototype.slice.call(arguments);
         var results = {};
         for (var plug_id in vkopt){
            var res = vkopt_core.plugins.call_method.apply({plugin_id:plug_id}, [plug_id].concat(args));
            if (res != undefined) results[plug_id] = res;
         }
         return results;
      },
      on_init:function(){
         vkopt_core.plugins.add_css();
         vkopt_core.plugins.call_modules('onInit');
         vkopt_core.plugins.process_node(ge('page_body'));
      },
      add_css:function(){
         var code = '';
         if (!vkopt.settings.get('style_per_module')){
            for (var plug_id in vkopt)
               code += vkopt_core.plugins.get_css(plug_id);
            vkaddcss(code);
         } else {
            for (var plug_id in vkopt){
               code = vkopt_core.plugins.get_css(plug_id);
               code && vkopt.set_css(code,'vkopt_module_'+plug_id);
            }
         }
      },
      get_css:function(plug_id){
         var css = vkopt[plug_id].css;
         if (!css) return '';
         return (Object.prototype.toString.call(css) === '[object Function]')?css():css;
      },
      on_js_file: function(file, full_file_name){
         //console.log('on *.js: '+file);
         vkopt_core.plugins.call_modules('onLibFiles', file, full_file_name);
      },
      on_location: function(){
         //console.log('on nav: ', cur.module, ' obj: ', JSON.stringify(nav.objLoc));
         vkopt_core.plugins.call_modules('onLocation', nav.objLoc, cur.module);
      },
      on_ajax_post: function(url, query, options){
         var res = vkopt_core.plugins.call_modules('onRequestQuery', url, query, options);
         if (url === 'al_im.php' && query.act === 'a_send') {
            res = extend(res, vkopt_core.plugins.call_modules('onImSend', query));
         }
         for (var i in res)
            if (res[i] === false)
               return false;
         return true;
      },
      process_response: function(answer, url, q){
         // answer - массив, элементы которого в последствии становятся аргументами вызываемых колбеков. можно править его элементы
         var _rx = /^\s*<(div|table|input|a)/i;
         for (var i=0; i < answer.length; i++){
            if (typeof answer[i]=='string' && _rx.test(answer[i]) ){
               answer[i] = vkopt_core.mod_str_as_node(answer[i], vkopt_core.plugins.process_node, {source:'process_response', url:url, q:q});
            }
            else if (isArray(answer[i])){
               var sub = answer[i];
               for (var j = 0; j < sub.length; j++)
                  if (typeof sub[j]=='string' && _rx.test(sub[j]) ){
                     sub[j] = vkopt_core.mod_str_as_node(sub[j], vkopt_core.plugins.process_node, {source:'process_response', url:url, q:q});
                  }
            }
         }
         // для случаев, когда тело html'а передано не отдельным аргументом, а внутри какого-то JSON'а:
         if (url === '/al_im.php' && q.act == 'a_start' && answer[0] && answer[0].history){ // открытие диалога
             answer[0].history = vkopt_core.mod_str_as_node(answer[0].history, vkopt_core.plugins.process_node, {source:'process_response_im_a_start', url:url, q:q});
         }
         vkopt_core.plugins.call_modules('onResponseAnswer', answer,url,q);
      },
      process_node: function(node, params){
         node = node || ge('content');
         if (!node) return;
         var nodes=node.getElementsByTagName('a');
         for (var i=0;i<nodes.length;i++)
            vkopt_core.plugins.process_links(nodes[i],params);
         //if (params && params.source = 'process_response' )
         vkopt_core.plugins.call_modules('processNode', node, params);
      },
      process_links:function(link_el, params){
         vkopt_core.plugins.call_modules('processLinks', link_el, params);
      },
      on_cmd: function(data){ // listen messages for communicate between tabs
         vkopt_core.plugins.call_modules('onCmd', data);
      },
      eltt_first_show: function(ett){
         vkopt_core.plugins.call_modules('onElementTooltipFirstTimeShow', ett, ett._opts);
      },
      /*
      inline_dd_create: function(el, opts){
         vkopt_core.plugins.call_modules('onInlineDropdownCreate', el, opts);
      },
      */
      datepicker_create: function(){
         vkopt_core.plugins.call_modules('onDatepickerCreate', Array.prototype.slice.call(arguments));
      }
   }
};

var vk_glue = {
   inj_handler: function(files){ // call from stManager.add(files, callback, async)  ->   vk_glue.inj_handler(files)
      return function(no_pending){
         if (no_pending)
            console.log('no need inject?', files);

         if (!isArray(files)) files = [files];
         for (var i in files){
            if (files[i].indexOf('.js') != -1)
               vk_glue.inj_to_file(files[i].split('/').pop(), files[i]);
         }
      }
   },
   inj_to_file: function(file_name, full_file_name){
      switch (file_name){
         case 'common.js':
         case 'common_web.js':
         case 'cmodules/web/common_web.js':
         case 'lite.js':
            vk_glue.inj.common();  break;
         case 'auto_list.js':    vk_glue.inj.auto_list();  break;
         case 'ui_controls.js':  vk_glue.inj.ui_controls();  break;
         case 'datepicker.js':  vk_glue.inj.datepicker();  break;
         case 'notifier.js':  vk_glue.inj.notifier();  break;
      }
      vkopt_core.plugins.on_js_file(file_name, full_file_name);
   },
   inj: {
      common: function(){
         // перехватываем момент подключения скриптов:
         //Inj.BeforeR("stManager.add",/__stm._waiters.push\(\[([^,]+)/,"__stm._waiters.push([$1, vk_glue.inj_handler(#ARG0#)]);");
         Inj.End("stManager.add",function(files, callback, asyn){
            var f, wait = [];
            if (!isArray(files))
               files = [files];

            for (var i in files){
               f = files[i];
               if (!f) continue;
               if (f.indexOf('?') != -1)
                  f = f.split('?')[0];

               if (!StaticFiles[f].l)
                  wait.push(f);
            }

            if (wait.length)
               stManager._waiters.push([wait, vk_glue.inj_handler(files)]);
         });

         // следующая строка не факт что нужна (а может оптимизированней будет, если её убрать), т.к она срабатывает только если у нас нет списка ожидания,
         // т.е скрипты были ранее уже подгружены на страницу, и инъекции вероятно остались на месте.
         //Inj.BeforeR("stManager.add",/(if\s*\(![a-zA-z_]+.length\))/,"$1{vk_glue.inj_handler(#ARG0#)(true);}"); //"_matched_{vk_glue.inj...

         // перехват события об аякс загрузке новой страницы / смене URL'а
         Inj.End('nav.setLoc',function(){
            if (arguments[1]!="vkopt")
               setTimeout(vk_glue.nav_handler,2);
         });

         // Ловим момент, когда через extend меняют информацию о текущем модуле страницы
         Inj.End('extend', function(obj, obj2){
            if (obj && obj2 && window.cur && obj == cur && obj2.module)
               setTimeout(vk_glue.nav_handler,2);
         })

         // Перехватываем результат ajax-запросов с возможностью модификации перед колбеком
         Inj.Start('ajax._post',
         // ARG0 - url; ARG1 - query object; ARG2 - options
         function(url, query, options){
             // Mod callback:
             var ctx = this;
             if (ctx.__ARG2__){
                 var onDoneOrig = ctx.__ARG2__.onDone;
                 ctx.__ARG2__.onDone = function(){
                     var argarr = Array.prototype.slice.call(arguments);
                     vk_glue.response_handler(argarr, ctx.__ARG0__, ctx.__ARG1__);

                     onDoneOrig && onDoneOrig.apply(window, argarr);
                 }
             }
             // End of callback mod
         }
         );
         // айфремовая загрузка выглядит так - загрузили каркас с частью данных, дальше по ходу загрузки айфреймовой страницы выполняются куски заполнения элементов карскаса.
         // эти кучки тоже надо перехватывать.
         Inj.Start('ajax.framegot',function(cont, html, js, params){
            if (this.args && this.args[1])
               this.args[1]=vk_glue.process_on_framegot(this.args[1]);
         });

         // Можем модифицировать поля запроса перед отсылкой ajax-запроса, либо заблокировать его
         Inj.Start('ajax.post',function(url, query, options){
            if (vk_glue.process_on_post(url, query, options) === false)
               this.prevent = true;
         });

         // цепляемся к возвращению обработанного шаблона из getTemplate
         Inj.End('getTemplate',function(tplName, state){
            // если исходная функция что-то вернула
            if (this.result){
               // возвращаем модифицированный ответ
               this.return_result = vk_glue.tpl_hook(this.result, tplName, state)
               this.prevent_all = true;
            }
         })
         /*
         Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
         */
         // перехват тултипов при создании их контента. например для перехвата создания меню "Ещё" перед его показом в просмотрщике фото
         Inj.Start('ElementTooltip.prototype.show', function(){
            var handle = function(){
               vkopt_core.plugins.eltt_first_show(this);
            }
            var obj = this.this_obj;
            if (obj._opts){
               if (obj._opts.onFirstTimeShow){
                  var orig = obj._opts.onFirstTimeShow;
                  obj._opts.onFirstTimeShow = function(){
                     var args = Array.prototype.slice.call(arguments);
                     handle.apply(obj, args);
                     orig.apply(obj, args);
                  }
               } else {
                  obj._opts.onFirstTimeShow = handle;
               }
            }
         });
      },
      notifier: function(){
         Notifier.addRecvClbk('vkcmd', 0, function(data){
            vkopt_core.plugins.on_cmd(data);
         }, true);
      },
      auto_list: function(){
         if (vkopt_defaults.config.AUTO_LIST_DRAW_ROWS_INJ){
            Inj.End('AutoList.prototype._drawRows',function(t){
               var s = this.this_obj;
               var N = 0;
               each(t, function(i, o) {
                  if ("string" == typeof o)                          // копипаст фильтра из _drawRows
                     N++;                                            // считаем количество элементов, которые должны были быть вставлены
               });
               var new_rows = domChildren(s._containerEl).slice(-N); // получаем список из N последних вставленных элементов
               for (var i = 0; i < new_rows.length; i++)
                  vkopt_core.plugins.process_node(new_rows[i]);
            })
         }
         // Inj.Replace('AutoList.prototype._drawRows',/\.appendChild\(([A-Za-z_0-9]+)\)/,'$&; vkopt_core.plugins.process_node($1);');
         // Inj.End('AutoList.prototype._drawRows', '; vkopt_core.plugins.process_node(this._containerEl);'); // Другой вариант. Меньше шансов того, что отвалится, но тут выходит повторная обработка ранее выведенного.
      },
      ui_controls: function(){
         /*
         var orig = InlineDropdown; // бекап
         Inj.Start('InlineDropdown','vkopt_core.plugins.inline_dd_create(#ARG0#, #ARG1#);'); // Инжект в конструктор не работает с текущим враппером функций из обновленного Inj
         for (var method in orig.prototype) //восстанавливаем методы из бекапа
            InlineDropdown.prototype[method] = orig.prototype[method];
         */
      },
      datepicker: function(){
         if (!vkopt.settings.get('datepicker_inj'))
            return;
         // передаём в наш перехватчик id элемента в котором указана дата.
         if (!window.vkorigDatepicker ||  (window.Datepicker  && Datepicker.toString().indexOf('onDatepickerCreate') == -1)){
            window.vkorigDatepicker = window.Datepicker;
            window.Datepicker = function(el, options){
               // moved from vkopt.wall.onLibFiles mod. Attach to this by event onDatepickerCreate
               var args = Array.prototype.slice.call(arguments);
               vkopt_core.plugins.datepicker_create.apply(this, args);
               vkorigDatepicker.apply(this, args);
            }
         }
      }
   },
   nav_handler: function(){ //TODO: debounce?
      // тут какие-то системные действия движка до передаче события в плагины
      // ...
      vkopt_core.plugins.on_location();
   },
   process_on_framegot: function(html){
      return vkopt_core.mod_str_as_node(html, vkopt_core.plugins.process_node);
   },
   process_on_post: function(url, query, options){
      return vkopt_core.plugins.on_ajax_post(url, query, options);
   },
   response_handler: function(answer,url,q){
      // try{
      vkopt_core.plugins.process_response(answer, url, q);
      // catch(e){
      //    vkopt_core.ping_stat({type: 'fail', source: 'response_handler', url: url, q: q ? q.act : ''})
      // }
   },
   tpl_hook: function(html, tpl_name, state){
      // Сообщаем модулям, что нужно как элемент обработать содержимое возвращаемое функцией getTemplate
      return vkopt_core.mod_str_as_node(html, vkopt_core.plugins.process_node, {source:"getTemplate", tpl_name: tpl_name, state: state})
   }
};

/*
(function(){
   window.vkopt = (window.vkopt || {});
   var m = {
      id: 'vkopt_any_plugin',
      // <core>
      onInit:                 function(){},                                // выполняется один раз после загрузки стрницы
      onLibFiles:             function(file_name, full_file_name){},       // место для инъекций = срабатывает при подключении нового js-файла движком контакта.
      onLocation:             function(nav_obj,cur_module_name){},         // вызывается при переходе между страницами
      onRequestQuery:         function(url, query, options){}              // вызывается перед выполнением ajax.post метода. Если функция вернёт false, то запрос выполнен не будет.
      onResponseAnswer:       function(answer,url,params){},               // answer - массив, изменять только его элементы
      onCmd:                  function(command_obj){},                     // слушает сообщения отосланные из других вкладок вк через vkopt.cmd(command_obj)
      processNode:            function(node, params){}                     // обработка элемента
      processLinks:           function(link, params){},                    // обработка ссылки
      onModuleDelayedInit:    function(plugin_id){},                       // реакция на подключение модуля, опоздавшего к загрузке страницы.
      onElementTooltipFirstTimeShow: function(ett, ett_options),           // реакция на первый показ ElementTooltip, при создании его контента. На момент вызова в элементе ett._ttel уже есть контент. По ett._opts.id можно определить к чему тултип относится.
      // UNAVAILABLE! onInlineDropdownCreate: function(el, options),       // реакция на создание контрола InlineDropdown. Можно использовать для добавления своих пунктов в options.items для меню элемента el
      onDatepickerCreate: function(args){},                                // вызывается при создании селектора даты new Datepicker(), args - массив аргументов переданных в конструктор

      // <settings>
      onSettings:             function(){} || {}                           // возвращаем объект с перечисленными по категориям настройками этого модуля
      onOptionChanged:        function(option_id, val, option_data){},     // реакция на изменение опции
      firstRun:               function(){}                                 // вызывается при первом запуске (не найдены ранее прописанные настройки vkopt'a),
                                                                           // P.S. вкопт из хранилища расширения восстанавливает только данные из своего конфига, если они были сохранены,
                                                                           // тогда это первым запуском не считается, но в локальном хранилище могут отсутствовать данные от других модулей,
                                                                           // хранящих инфу не через vkopt.settings.get | vkopt.settings.set

      // <im>
      onImSend:               function(query){}                            // вызывается перед отправкой личного сообщения. Если функция вернёт false, то сообщение не отправится.
      onImReceive:            <not implemented yet>

      // <audio>
      onAudioRowItems: function(audioEl, audioObject, audio){}             // добавление кастомных кнопок-иконок (actions) и пунктов в доп. действия (more) для аудио
                                                                           // результатом вызова функции должен быть объект вида {actions:[item1, item2, ...], more:[item1, item2, ...]}
                                                                           // а каждый добавляемый пункт имеет вид массива с элементами:
                                                                           // itemN = [
                                                                           //    id,                                    // id кнопки, добавляется к имени CSS-класса
                                                                           //    function(audioEl, audioObject, audio), // обработчик нажатия на кнопку
                                                                           //    html,                                  // внутреннее содержимое кнопки, для конопок-иконок обычно пустая строка
                                                                           //    attrs,                                 // строка с дополнительными атрибутами
                                                                           //    tagName                                // если требуется, чтоб тегом кнопки был не "div", а другой, то указывать тут.
                                                                           // ]
      // <photos>
      onPhotoAlbumItems:      function(aid, oid){}                         // добавление пунктов в меню действий с альбомом
                                                                           // результатом вызова функции должен быть массив с объектами, которые могут содержать поля:
                                                                           // {
                                                                           //    href:       ссылка
                                                                           //    item_class: доп. CSS-класс,
                                                                           //    onclick:    строка или функция обработчик,
                                                                           //    attrs:      доп. HTML атрибуты тега пункта,
                                                                           //    text:       название пункта
                                                                           // }
                                                                           // aid может быть как числовым, так и вида "tag", "photos", "00", "000"

      // <groups>
      onGroupActionItems:    function(oid, gid){}                          // добавление пунктов в меню действий на главной странице группы
                                                                           // результатом вызова функции должен быть массив с объектами, которые могут содержать поля:
                                                                           // {
                                                                           //    href:       ссылка
                                                                           //    item_class: доп. CSS-класс,
                                                                           //    onclick:    строка или функция обработчик,
                                                                           //    attrs:      доп. HTML атрибуты тега пункта,
                                                                           //    text:       название пункта
                                                                           // }

   };
   window.vkopt[m.id] = m;
   if (window.vkopt_core_ready) vkopt_core.plugins.delayed_run(m.id);      // запускает модуль, если мы опоздали к загрузке страницы, провоцирует вызов события onModuleDelayedInit
})();
*/

// vkopt.zipjs library
(function(obj) {
   /*
    Zip.js
    Copyright (c) 2013 Gildas Lormeau. All rights reserved.
    Please read copyright notice, list of conditions and the disclaimer https://raw.githubusercontent.com/gildas-lormeau/zip.js/master/WebContent/zip.js
    */
   "use strict";
	var ERR_WRITE = "Error while writing zip file.";
	var ERR_READ_DATA = "Error while reading file data.";
	var ERR_DUPLICATED_NAME = "File already exists.";
	var CHUNK_SIZE = 512 * 1024;

	var appendABViewSupported;
	try {
		appendABViewSupported = new Blob([ new DataView(new ArrayBuffer(0)) ]).size === 0;
	} catch (e) {
	}

	function Crc32() {
		this.crc = -1;
	}
	Crc32.prototype.append = function append(data) {
		var crc = this.crc | 0, table = this.table;
		for (var offset = 0, len = data.length | 0; offset < len; offset++)
			crc = (crc >>> 8) ^ table[(crc ^ data[offset]) & 0xFF];
		this.crc = crc;
	};
	Crc32.prototype.get = function get() {
		return ~this.crc;
	};
	Crc32.prototype.table = (function() {
		var i, j, t, table = []; // Uint32Array is actually slower than []
		for (i = 0; i < 256; i++) {
			t = i;
			for (j = 0; j < 8; j++)
				if (t & 1)
					t = (t >>> 1) ^ 0xEDB88320;
				else
					t = t >>> 1;
			table[i] = t;
		}
		return table;
	})();

	// "no-op" codec
	function NOOP() {}
	NOOP.prototype.append = function append(bytes, onprogress) {
		return bytes;
	};
	NOOP.prototype.flush = function flush() {};

	function getDataHelper(byteLength, bytes) {
		var dataBuffer, dataArray;
		dataBuffer = new ArrayBuffer(byteLength);
		dataArray = new Uint8Array(dataBuffer);
		if (bytes)
			dataArray.set(bytes, 0);
		return {
			buffer : dataBuffer,
			array : dataArray,
			view : new DataView(dataBuffer)
		};
	}

   function blobSlice(blob, index, length) {
		if (index < 0 || length < 0 || index + length > blob.size)
			throw new RangeError('offset:' + index + ', length:' + length + ', size:' + blob.size);
		if (blob.slice)
			return blob.slice(index, index + length);
		else if (blob.webkitSlice)
			return blob.webkitSlice(index, index + length);
		else if (blob.mozSlice)
			return blob.mozSlice(index, index + length);
		else if (blob.msSlice)
			return blob.msSlice(index, index + length);
	}
	// Readers
	function Reader() {
	}
   function BlobReader(blob) {
		var that = this;

		function init(callback) {
			that.size = blob.size;
			callback();
		}

		function readUint8Array(index, length, callback, onerror) {
			var reader = new FileReader();
			reader.onload = function(e) {
				callback(new Uint8Array(e.target.result));
			};
			reader.onerror = onerror;
			try {
				reader.readAsArrayBuffer(blobSlice(blob, index, length));
			} catch (e) {
				onerror(e);
			}
		}

		that.size = 0;
		that.init = init;
		that.readUint8Array = readUint8Array;
	}
	BlobReader.prototype = new Reader();
	BlobReader.prototype.constructor = BlobReader;

	// Writers

	function Writer() {
	}
	Writer.prototype.getData = function(callback) {
		callback(this.data);
	};

	function BlobWriter(contentType) {
		var blob, that = this;

		function init(callback) {
			blob = new Blob([], {
				type : contentType
			});
			callback();
		}

		function writeUint8Array(array, callback) {
			blob = new Blob([ blob, appendABViewSupported ? array : array.buffer ], {
				type : contentType
			});
			callback();
		}

		function getData(callback) {
			callback(blob);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	BlobWriter.prototype = new Writer();
	BlobWriter.prototype.constructor = BlobWriter;

	function FileWriter(fileEntry, contentType) {
		var writer, that = this;

		function init(callback, onerror) {
			fileEntry.createWriter(function(fileWriter) {
				writer = fileWriter;
				callback();
			}, onerror);
		}

		function writeUint8Array(array, callback, onerror) {
			var blob = new Blob([ appendABViewSupported ? array : array.buffer ], {
				type : contentType
			});
			writer.onwrite = function() {
				writer.onwrite = null;
				callback();
			};
			writer.onerror = onerror;
			writer.write(blob);
		}

		function getData(callback) {
			fileEntry.file(callback);
		}

		that.init = init;
		that.writeUint8Array = writeUint8Array;
		that.getData = getData;
	}
	FileWriter.prototype = new Writer();
	FileWriter.prototype.constructor = FileWriter;

   function MutableFileWriter(fileHandle, contentType) {
      var lockedFile, that = this;

      function init(callback) {
         //lockedFile = fileHandle.open('readwrite');
         callback();
      }

      function writeUint8Array(array, callback) {
         var blob = new Blob([ appendABViewSupported ? array : array.buffer ], {
            type : contentType
         });
         var lockedFile = fileHandle.open('readwrite');
         var writing = lockedFile.append(blob)
         writing.onsuccess = function(){
            callback();
         }
         writing.onerror =  function(){
            console.log('Something goes wrong in the writing process: ' + this.error);
         }
      }

      function getData(callback) {
         fileHandle.getFile().onsuccess = function () {
           callback(this.result);
         }
      }

      that.init = init;
      that.writeUint8Array = writeUint8Array;
      that.getData = getData;
   }
   MutableFileWriter.prototype = new Writer();
   MutableFileWriter.prototype.constructor = MutableFileWriter;

	function launchProcess(process, reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror) {
		var chunkIndex = 0, index, outputSize = 0,
			crcInput = crcType === 'input',
			crcOutput = crcType === 'output',
			crc = new Crc32();
		function step() {
			var outputData;
			index = chunkIndex * CHUNK_SIZE;
			if (index < size)
				reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function(inputData) {
					var outputData;
					try {
						outputData = process.append(inputData, function(loaded) {
							if (onprogress)
								onprogress(index + loaded, size);
						});
					} catch (e) {
						onreaderror(e);
						return;
					}
					if (outputData) {
						outputSize += outputData.length;
						writer.writeUint8Array(outputData, function() {
							chunkIndex++;
							setTimeout(step, 1);
						}, onwriteerror);
						if (crcOutput)
							crc.append(outputData);
					} else {
						chunkIndex++;
						setTimeout(step, 1);
					}
					if (crcInput)
						crc.append(inputData);
					if (onprogress)
						onprogress(index, size);
				}, onreaderror);
			else {
				try {
					outputData = process.flush();
				} catch (e) {
					onreaderror(e);
					return;
				}
				if (outputData) {
					if (crcOutput)
						crc.append(outputData);
					outputSize += outputData.length;
					writer.writeUint8Array(outputData, function() {
						onend(outputSize, crc.get());
					}, onwriteerror);
				} else
					onend(outputSize, crc.get());
			}
		}

		step();
	}

	function copy(worker, sn, reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
		var crcType = 'input';
		launchProcess(new NOOP(), reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror);
	}

	// ZipWriter

	function encodeUTF8(string) {
		return unescape(encodeURIComponent(string));
	}

	function getBytes(str) {
		var i, array = [];
		for (i = 0; i < str.length; i++)
			array.push(str.charCodeAt(i));
		return array;
	}

	function createZipWriter(writer, callback, onerror) {
		var files = {}, filenames = [], datalength = 0;
		var deflateSN = 0;

		function onwriteerror(err) {
			onerror(err || ERR_WRITE);
		}

		function onreaderror(err) {
			onerror(err || ERR_READ_DATA);
		}

		var zipWriter = {
			add : function(name, reader, onend, onprogress, options) {
				var header, filename, date;
				var worker = this._worker;

				function writeHeader(callback) {
					var data;
					date = options.lastModDate || new Date();
					header = getDataHelper(26);
					files[name] = {
						headerArray : header.array,
						directory : options.directory,
						filename : filename,
						offset : datalength,
						comment : getBytes(encodeUTF8(options.comment || ""))
					};
					header.view.setUint32(0, 0x14000808);
					if (options.version)
						header.view.setUint8(0, options.version);
					header.view.setUint16(6, (((date.getHours() << 6) | date.getMinutes()) << 5) | date.getSeconds() / 2, true);
					header.view.setUint16(8, ((((date.getFullYear() - 1980) << 4) | (date.getMonth() + 1)) << 5) | date.getDate(), true);
					header.view.setUint16(22, filename.length, true);
					data = getDataHelper(30 + filename.length);
					data.view.setUint32(0, 0x504b0304);
					data.array.set(header.array, 4);
					data.array.set(filename, 30);
					datalength += data.array.length;
					writer.writeUint8Array(data.array, callback, onwriteerror);
				}

				function writeFooter(compressedLength, crc32) {
					var footer = getDataHelper(16);
					datalength += compressedLength || 0;
					footer.view.setUint32(0, 0x504b0708);
					if (typeof crc32 != "undefined") {
						header.view.setUint32(10, crc32, true);
						footer.view.setUint32(4, crc32, true);
					}
					if (reader) {
						footer.view.setUint32(8, compressedLength, true);
						header.view.setUint32(14, compressedLength, true);
						footer.view.setUint32(12, reader.size, true);
						header.view.setUint32(18, reader.size, true);
					}
					writer.writeUint8Array(footer.array, function() {
						datalength += 16;
						onend();
					}, onwriteerror);
				}

				function writeFile() {
					options = options || {};
					name = name.trim();
					if (options.directory && name.charAt(name.length - 1) != "/")
						name += "/";
					if (files.hasOwnProperty(name)) {
						onerror(ERR_DUPLICATED_NAME);
						return;
					}
					filename = getBytes(encodeUTF8(name));
					filenames.push(name);
					writeHeader(function() {
						if (reader)
                     copy(worker, deflateSN++, reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);
						else
							writeFooter();
					}, onwriteerror);
				}

				if (reader)
					reader.init(writeFile, onreaderror);
				else
					writeFile();
			},
			close : function(callback) {
				if (this._worker) {
					this._worker.terminate();
					this._worker = null;
				}

				var data, length = 0, index = 0, indexFilename, file;
				for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
					file = files[filenames[indexFilename]];
					length += 46 + file.filename.length + file.comment.length;
				}
				data = getDataHelper(length + 22);
				for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
					file = files[filenames[indexFilename]];
					data.view.setUint32(index, 0x504b0102);
					data.view.setUint16(index + 4, 0x1400);
					data.array.set(file.headerArray, index + 6);
					data.view.setUint16(index + 32, file.comment.length, true);
					if (file.directory)
						data.view.setUint8(index + 38, 0x10);
					data.view.setUint32(index + 42, file.offset, true);
					data.array.set(file.filename, index + 46);
					data.array.set(file.comment, index + 46 + file.filename.length);
					index += 46 + file.filename.length + file.comment.length;
				}
				data.view.setUint32(index, 0x504b0506);
				data.view.setUint16(index + 8, filenames.length, true);
				data.view.setUint16(index + 10, filenames.length, true);
				data.view.setUint32(index + 12, length, true);
				data.view.setUint32(index + 16, datalength, true);
				writer.writeUint8Array(data.array, function() {
					writer.getData(callback);
				}, onwriteerror);
			},
			_worker: null
		};

		callback(zipWriter);
	}

	function resolveURLs(urls) {
		var a = document.createElement('a');
		return urls.map(function(url) {
			a.href = url;
			return a.href;
		});
	}

	function onerror_default(error) {
		console.error(error);
	}
	obj.zipjs = {
		Writer : Writer,
		BlobWriter : BlobWriter,
      FileWriter : FileWriter,
      MutableFileWriter: MutableFileWriter,
      BlobReader : BlobReader,
		createWriter : function(writer, callback, onerror) {
			onerror = onerror || onerror_default;
			writer.init(function() {
				createZipWriter(writer, callback, onerror);
			}, onerror);
		}
	};

})(vkopt);

/* vkopt.zip = { //library wrapper
   addFile(name, data, ondone, onprogress),
   getBlobURL(callback),
   getBlob(callback),
   download() // run download archive
}
*/
(function(obj) {

	var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;
   var url_create = (window.URL || window.webkitURL || window.mozURL || window).createObjectURL;
   var url_revoke = (window.URL || window.webkitURL || window.mozURL || window).revokeObjectURL;

	function onerror(message) {
		alert(message);
	}


	var model = function(file_name){
		var
         zipFileEntry, zipWriter, writer,
         creationMethod = 'Blob',
         download_url =  null;

         if (typeof requestFileSystem != "undefined")
            creationMethod = 'File';
         else
         if (typeof IDBMutableFile != "undefined")
            creationMethod = 'MutableFile';

      function createTempFile(file_name, callback) {
         var tmpFilename = file_name || "tmp.zip";
         requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
            function create() {
               filesystem.root.getFile(tmpFilename, {
                  create : true
               }, function(zipFile) {
                  callback(zipFile);
               });
            }

            filesystem.root.getFile(tmpFilename, null, function(entry) {
               entry.remove(create, create);
            }, create);
         });
      }

      function createMutableFile(file_name, contentType, cb){
         var idb = indexedDB.open("vkoptFileStorageDB",{version: 1, storage:'persistent'});
         idb.onsuccess = function(){
           var db = this.result;
           var buildHandle = db.createMutableFile(file_name, contentType);
           buildHandle.onsuccess = function(){
             cb && cb(this.result); // fileHandle
           };
         };
      }

      //function onprogress(current, total) {}
      var add_locked = false;
      var addFile = function (name, data, ondone, onprogress){
            if (add_locked){
               var args = Array.prototype.slice.call(arguments);
               setTimeout(function(){addFile.apply(this, args)}, Math.round(Math.random()*100)+10);
               return;
            }
            add_locked = true;
            var add = function(){
               zipWriter.add(name, new vkopt.zipjs.BlobReader(data), function() {
                     add_locked = false;
                     ondone();
               }, onprogress);
            }
            function createZipWriter() {
               vkopt.zipjs.createWriter(writer, function(writer) {
						zipWriter = writer;
						add();
					}, onerror);
				}

				if (zipWriter)
					add();
            else switch(creationMethod){
               case 'Blob': {
                  writer = new vkopt.zipjs.BlobWriter();
                  createZipWriter();
                  break;
               };
               case 'File': {
                  createTempFile(file_name, function(fileEntry) {
                     zipFileEntry = fileEntry;
                     writer = new vkopt.zipjs.FileWriter(zipFileEntry);
                     createZipWriter();
                  });
                  break;
               };
               case 'MutableFile': {
                  createMutableFile(file_name, "application/zip", function(fileHandle) {
                     writer = new vkopt.zipjs.MutableFileWriter(fileHandle, "application/zip");
                     createZipWriter();
                  })
                  break;
               }
            }
      };
		var addFiles = function (files, onadd, onprogress, onend) {
         var addIndex = 0;

         function nextFile() {
            var file = files[addIndex];
            onadd(file);
            addFile(file.name, file, function(){
               addIndex++;
               if (addIndex < files.length)
                  nextFile();
               else
                  onend();
            }, onprogress)
         }

         nextFile();
      };
      var getBlobURL = function(callback) {
         zipWriter.close(function(blob) {
            var blobURL = creationMethod == "File" ? zipFileEntry.toURL() : url_create(blob);
            callback(blobURL);
            zipWriter = null;
         });
      };
      var getBlob = function(callback) {
         zipWriter.close(callback);
      };
      return {
			addFile: addFile,
         addFiles : addFiles,
			getBlobURL : getBlobURL,
			getBlob : getBlob,
         download: function(){
            var dl = function(){
               if (creationMethod == 'MutableFile'){
                  var fr = document.createElement('iframe');
                  fr.frameBorder = 0;
                  fr.width = 1;
                  fr.height = 1;
                  document.body.appendChild(fr);
                  var doc = fr.contentDocument;
                  var form = doc.createElement('form');
                  form.action = download_url;
                  doc.body.appendChild(form);
                  form.submit();
                  setTimeout(function(){
                     fr.parentNode.removeChild(fr);
                  }, 100);
               } else {
                  var dlnk = document.createElement('a');
                  dlnk.href = download_url;
                  dlnk.download = file_name;
                  (window.utilsNode || document.body).appendChild(dlnk)
                  dlnk.click();
                  vkopt.log('Download zip file: ', file_name);
                  setTimeout(function(){
                     re(dlnk);
                     //url_revoke(dlnk);
                  },200);
               }
            }
            if (typeof navigator.msSaveBlob == "function") {
					getBlob(function(blob) {
						navigator.msSaveBlob(blob, file_name);
					});
				} else {
               if (!download_url){
                  getBlobURL(function(blobURL){
                     download_url = blobURL;
                     vkopt.log(file_name + ' download url: ' + download_url);
                     dl();
                  })
               } else dl();
            }
         }
		};
	};
   obj.zip = model;
})(vkopt);


vkopt.log = function(){
   var args = Array.prototype.slice.call(arguments);
   console.log.apply(console, args);
};
vkopt.cmd = function(msg){ // при вызове сразу из onInit, сообщение не доходит в другие вкладки.
   stManager.add('notifier.js',function(){
      Notifier.lcSend('vkcmd', msg);
   })
}
vkopt.save_file = function(data, filename){
   vkLdr.show();

   var onFail = function(){
      FileSaverConnect(function() { // load extenal library
         vkopt.log('FileSaver loaded');
         var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
         vkLdr.hide();
         saveAs(blob, filename);
      });
   }

   var url_create = (window.URL || window.webkitURL || window).createObjectURL;
   var url_revoke = (window.URL || window.webkitURL || window).revokeObjectURL;
   if (window.Blob && url_create && url_revoke){
      var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
      var url = url_create(blob);
      if (url){
         var dlnk = document.createElement('a');
         dlnk.href = url;
         dlnk.download = filename;
         utilsNode.appendChild(dlnk)
         dlnk.click();
         vkopt.log('Download file: ', filename);
         setTimeout(function(){
            re(dlnk);
            vkLdr.hide();
            url_revoke(dlnk);
         },200);
      } else
         onFail();
   } else onFail();


}
vkopt.load_file = function(callback){
     var inp_el;
     var load_file = function(){
        var file = inp_el.files[0];
        if (!file) {
          return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
          callback(e.target.result);
        };
        reader.readAsText(file);
     }
     vkAlertBox(IDL('LoadFile'), IDL('SelectFile')+'<input type="file" id="vk_load_file_input">', true);
     inp_el = ge('vk_load_file_input');
     inp_el.addEventListener('change', load_file, false);
}

vkopt.set_css = function(code, id){
   var st = ge(id);
   if (!id || !st) {
   	st = document.createElement("style");
   	st.type = "text/css";
   	st.setAttribute('id', id);
   	st.appendChild(document.createTextNode(code));
   	document.getElementsByTagName("head")[0].appendChild(st);
   } else
   	val(id, code);
}

vkopt.permissions = { // for chromium
   origins_cache:[],
   update: function(callback){
      vk_ext_api.req({act:'permissions_get'},function(r){
         var origins = r.permissions.origins.filter(function(item, idx){
           if (!/:\/\/\*\//.test(item) && /:\/\/\*\./.test(item)) // исключаем маску *://*/* и маски без поддоменов
              return item;
         });
         vkopt.permissions.origins_cache = origins;
         callback && callback(r.permissions);
      });
   },
   check_url: function(url, masks){
      for (var i in masks){
         var rx_pat = '^'+masks[i].replace(/\*$/,'').replace(/\*/g,'[^\/]*').replace(/\//g,'\\/').replace(/\./g,'\\.')+'.*';
         var rx = new RegExp(rx_pat,'i');
         if (rx.test(url))
            return true;
      }
      return false;
   },
   /*
   // Попытка заставить работать запрос доп. прав доступа на Firefox WebExt с помощью обработчика клика повешенного
   // из content_script. Но в итоге "May only request permissions from a user input handler".
   // У кого-то есть идеи как это заставить работать?
   request_on_click: function(el, url, callback){
      var m = url.match(/^[^\/]+:\/\/([^\/]+\.)?([^\/]+\.[^\/]+)\//);
      var mask = "*://" + (m[2] ? "*." : '') + m[2] + "/*";
      vk_ext_api.req({act:'permissions_request_on_click', eid: el.id, permissions_query:{origins:[mask]}},function(r){
         vkopt.permissions.update(function(){
            callback && callback(r.act == 'permission_granted');
         });
      });
   },
   */
   get_url_mask: function(url){
      var m = url.match(/^[^\/]+:\/\/([^\/]+\.)?([^\/]+\.[^\/]+)\//);
      return "*://" + (m[2] ? "*." : '') + m[2] + "/*";
   },
   request: function(url, callback){
      var mask = vkopt.permissions.get_url_mask(url);
      vk_ext_api.req({act:'permissions_request', permissions_query:{origins:[mask]}},function(r){
         vkopt.permissions.update(function(){
            callback && callback(r.act == 'permission_granted');
         });
      });
   },
   check_dl_url: function(el, url){
      if (!(vkbrowser.chrome || vk_ext_api.browsers.webext) || vk_ext_api.browsers.maxthon || vkopt.permissions.check_url(url, vkopt.permissions.origins_cache)){
         return true;
      } else {
         show(boxLayerBG);
         vkopt.permissions.request(url, function(granted){
            hide(boxLayerBG);
            if (granted) el.click();
         })
         return false;
      }
   }
}

vkopt['res'] = {
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_ldr{
            display: inline-block;
            background-image: url(/images/upload_inv_mini.gif) 50% 50% no-repeat;
            min-width: 16px;
            min-height: 4px;
         }
         */
      }).css;
   },
   img: {
      ldr: '<img src="/images/upload.gif">',
      ldr_mono: '<img src="/images/upload_inv_mono.gif">',
      ldr_mini: '<img src="/images/upload_inv_mini.gif">',
      ldr_big: '<center><img src="/images/progress7.gif"></center>'
   }
};

vkopt['settings'] =  {
   backup_key_prefix: 'vkopt_settings_backup_',
   tpls: null,
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*settings_css:
         .vkopt_icon,
         #side_bar .left_icon.vkopt_icon, .vkopt_icon_inline{
            background: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%237D9AB7%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E") 8px 4px no-repeat;
         }
         .vkopt_icon_inline{
            display: inline-block;
            width: 18px;
            height: 18px;
            background-position: 0 0;
            margin-top: -8px;
            margin-bottom: -4px;
         }
         .vk_setts_wrap{
            padding: 0 25px;
         }
         .settings_labeled_text.vk_settings_block {
             margin-left: 0px;
             width: 293px;
         }
         .wide_column .settings_labeled_text.vk_settings_block {
             width: 248px;
         }
         .welcome_cfg .settings_labeled_text.vk_settings_block {
             width: 290px;
         }
         .welcome_cfg .settings_label.vk_setts_cat_header{
            width: auto;
         }
         .vk_all_options{
            text-align: center;
            padding-top: 10px;
         }
         .vk_settings_block.vk_settings_block_left {
             border-right: 1px solid #e7e8ec;
             padding-right: 5px;
         }
         .vk_settings_block.vk_settings_block_right {
             padding-left: 5px;
             border-left: 1px solid #e7e8ec;
             margin-left: -1px;
         }

         .settings_label.vk_setts_cat_header{
            float:none;
         }
         .vk_settings_block .checkbox{
            margin-top: 10px
         }
         .vk_settings_block .checkbox:first-child {
            margin-top: 0
         }
         .vk_settings_block .checkbox .vk_checkbox_caption{
            padding-left:20px;
         }
         .vk_settings_block #dev_colorpicker{
            margin-left: 107px;
         }
         .vk_settings_block .dev_labeled{
            width: 107px;
         }
         .vk_settings_block .vk_color_switcher{
            padding-left: 3px;
         }
         .vk_sub_options{padding-left:20px; margin-top:5px;}

         #vk_setts_Extra{
            display:none;
         }

         .vk_welcome_r{
            width: 105px;
         }
         .vk_welcome_r .vk_lang{
            width: auto;
            height: auto;
         }
         .vk_welcome_r .vk_lang a{
            font-size: 10px;
            width: 85px;
            height: 75px;
            line-height: 12px;
         }
         .vk_welcome_r .vk_lang_about{
            display: none;
         }
         .vk_welcome_l{
            width: 600px;
         }
         .vk_welcome_warn{
            font-weight:bold;
            color:#F00;
         }
         #vkopt_export_settings{
            text-align: center;
            padding: 10px 0px;
         }
         .box_body #vkopt_donate_block{
            margin-left: 50px;
         }
         .vk_donations_left{
            width:300px;
         }
         .vk_donations_right{
            width:auto;
         }
         #vkopt_donate_block{
            padding: 5px 20px;
         }
         #vk_extra_actions_wrap{
            padding: 4px 0px;
            text-align: center;
         }
         .vk_vkopt_guide #top_vkopt_settings_link:before,
         .vk_vkopt_guide .top_profile_link:before {
             content: '';
             display: block;
             width: 0px;
             height: 0px;
             position: absolute;
             border: 10px solid transparent;
             border-left-color: #2a5885;
             margin-top: 5px;
             margin-left: -30px;
             border-left-width: 15px;
         }
         .vk_vkopt_guide .top_profile_link:before{
            border-left-color: rgba(255,255,255,0.7);
            margin-top: 11px;
         }
         .vk_vkopt_guide .top_profile_link.active:before{
            border:0px;
         }
         .vk_vkopt_guide #top_vkopt_settings_link:before,
         .vk_vkopt_guide .top_profile_link:before
         {
           animation: top_vkopt_settings_arrow ease-in-out 0.5s infinite alternate;
           -webkit-animation: top_vkopt_settings_arrow ease-in-out 0.5s infinite alternate;
           -moz-animation: top_vkopt_settings_arrow ease-in-out 0.5s infinite alternate;
           -o-animation: top_vkopt_settings_arrow ease-in-out 0.5s infinite alternate;
           -ms-animation: top_vkopt_settings_arrow ease-in-out 0.5s infinite alternate;
         }
         @keyframes top_vkopt_settings_arrow{
           0%{transform:  translate(0px,0px)}
           100%{transform:  translate(10px,0px)}
         }

         @-moz-keyframes top_vkopt_settings_arrow{
           0%{-moz-transform:  translate(0px,0px)}
           100%{-moz-transform:  translate(10px,0px)}
         }

         @-webkit-keyframes top_vkopt_settings_arrow {
           0%{-webkit-transform:  translate(0px,0px)}
           100%{-webkit-transform:  translate(10px,0px)}
         }

         @-o-keyframes top_vkopt_settings_arrow {
           0%{-o-transform:  translate(0px,0px)}
           100%{-o-transform:  translate(10px,0px)}
         }

         @-ms-keyframes top_vkopt_settings_arrow {
           0%{-ms-transform:  translate(0px,0px)}
           100%{-ms-transform:  translate(10px,0px)}
         }

         .vk_vkopt_guide #top_vkopt_settings_link {
            -webkit-animation: top_vkopt_settings_bg ease-in-out 1s infinite alternate;
            -moz-animation: top_vkopt_settings_bg ease-in-out 1s infinite alternate;
            -ms-animation: top_vkopt_settings_bg ease-in-out 1s infinite alternate;
            -o-animation: top_vkopt_settings_bg ease-in-out 1s infinite alternate;
            animation: top_vkopt_settings_bg ease-in-out 1s infinite alternate;
         }
         @-webkit-keyframes top_vkopt_settings_bg {
            from { background-color: rgba(228, 234, 240, 0.2)}
            to { background-color: rgb(228, 234, 240)}
         }
         @-moz-keyframes top_vkopt_settings_bg {
            from { background-color: rgba(228, 234, 240, 0.2)}
            to { background-color: rgb(228, 234, 240)}
         }
         @-ms-keyframes top_vkopt_settings_bg {
            from { background-color: rgba(228, 234, 240, 0.2)}
            to { background-color: rgb(228, 234, 240)}
         }
         @-o-keyframes top_vkopt_settings_bg {
            from { background-color: rgba(228, 234, 240, 0.2)}
            to { background-color: rgb(228, 234, 240)}
         }
         @keyframes top_vkopt_settings_bg {
            from { background-color: rgba(228, 234, 240, 0.2)}
            to { background-color: rgb(228, 234, 240)}
         }

        */
      }).settings_css;

   },
   onInit: function(){
      // <UI>
      vkopt.settings.__full_title = vk_lib.format('Vkontakte Optimizer %1<sup><i>%2</i></sup> (build %3)', String(vVersion).split('').join('.'), vPostfix, vBuild);
      var values = {
         full_title: vkopt.settings.__full_title
      };
      // Кто-то что-то имеет против против такого пожирания ресурсов, в обмен на более удобное описание больших кусков текста? (и да, я в курсе, что это создаст проблем в случае минимизации)
      vkopt.settings.tpls = vk_lib.get_block_comments(function(){
         /*right_menu_item:
         <a id="ui_rmenu_vkopt" href="/settings?act=vkopt" class="ui_rmenu_item _ui_item_payments" onclick="return vkopt.settings.show(this);"><span>{lng.VkOpt}</span></a>
         */
         /*left_menu_item:
         <li id="l_vkopt">
           <a href="/settings?act=vkopt" onclick="return vkopt.settings.show(this);" class="left_row">
             <span class="left_fixer">
               <span class="left_icon fl_l vkopt_icon"></span>
               <span class="left_label inl_bl">{lng.VkOpt}</span>
             </span>
           </a>
         </li>
         */
         /*main:
         <div id="vkopt_settings_block" class="page_block clear_fix">
             <div class="page_block_header">{vals.full_title}</div>
             <div class="ui_search ui_search_field_empty ui_search_custom _wrap">
                <div class="ui_search_input_block">
                  <input type="text" class="ui_search_field _field" id="vk_setts_search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" onkeyup="vkopt.settings.filter_change( this, vkopt.settings.filter);" onpaste="vkopt.settings.filter_change( this, vkopt.settings.filter);" oncut="vkopt.settings.filter_change( this, vkopt.settings.filter);" placeholder="{lng.Search}">
                </div>
             </div>
             <div id="vkopt_settings" class="settings_panel clear_fix">
                <div class="settings_line">
                  Comming soon! <!--☑ Check Me!--!>
                  <!--CODE--!>
                </div>
             </div>
             {vals.bottom_block}
         </div>
         */
         /*search_block:
         <div class="ui_search ui_search_field_empty ui_search_custom _wrap">
           <div class="ui_search_input_block">
             <input type="text" class="ui_search_field _field" id="vk_setts_search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" onkeyup="vkopt.settings.filter_change( this, vkopt.settings.filter);" onpaste="vkopt.settings.filter_change( this, vkopt.settings.filter);" oncut="vkopt.settings.filter_change( this, vkopt.settings.filter);" placeholder="{lng.Search}">
           </div>
         </div>
         <div class="vk_setts_wrap" id="vkopt_settings">{vals.content}</div>
         {vals.bottom_block}
         */
         /*bottom_block:
             <div id="vkopt_export_settings">
               <button class="flat_button" onclick="vkopt.settings.export_cfg();">{lng.ExportSettings}</button>
               <button class="flat_button" onclick="vkopt.settings.import_cfg();">{lng.ImportSettings}</button>
             </div>
             <div id="vkopt_lang_settings"></div>
             <div id="vkopt_donate_block"></div>
         */
         /*donate_form:
         <h2>{lng.Donations}</h2>
         <div class="vk_donations">
            <div class="vk_donations_left fl_l">
               <div>{lng.DevRekv}</div>
               <div id="vk_purses_list">vkOptDonate.WMPursesList('wmdonate')</div>
            </div>
            <div class="vk_donations_right fl_l">
            <div id="wmdonate">
               <div class="eltt feature_intro_tt feature_info_tooltip hot_feature_tooltip eltt_arrow_size_normal eltt_align_center eltt_right eltt_vis" id="" style="display: block;"><div class="eltt_arrow_back _eltt_arrow_back" style="margin-top: 33px;"><div class="eltt_arrow"></div></div><div class="eltt_content _eltt_content">{lng.DonateInfo} </div></div>
            </div>
            </div>
            <div class="clear_fix">
         </div>
         */
         /*cat_block:
         <div class="settings_line clear_fix" id="vk_setts_{vals.cat}">
            <div class="settings_label vk_setts_cat_header">{vals.caption}</div>
            <div class="settings_labeled_text vk_settings_block vk_settings_block_left fl_l">{vals.content_left}</div>
            <div class="settings_labeled_text vk_settings_block vk_settings_block_right fl_l">{vals.content_right}</div>
         </div>
         */

         /*checkbox:
         <div class="checkbox {vals.on_class}" id="vkcfg_{vals.id}" onclick="checkbox(this); vkopt.settings.set('{vals.id}', isChecked(this));"><div class="vk_checkbox_caption">{vals.caption}</div></div>
         */
         /*radiobtn:
         <div class="radiobtn {vals.on_class}" data-val="{vals.value}" onclick="radiobtn(this, '{vals.value}', '{vals.id}'); vkopt.settings.set('{vals.id}', '{vals.value}');">{vals.caption}</div>
         */
         /*sub_block:
         <div class="vk_sub_options">{vals.content}</div>
         */

         /* Usage as

         <div class="radiobtn on" data-val="0" onclick="radiobtn(this, 0, 'im_submit')">
            <b>Enter</b> — отправка сообщения<br><b>Shift+Enter</b> — перенос строки
         </div>

         radioBtns.im_submit = {
                           els : Array.prototype.slice.apply(geByClass("radiobtn", ge("im_submit_hint_opts"))),
                           val : e
                        };
         */

         /*welcome_layout:
         <div class="clear_fix">
            <div class="vk_welcome_r fl_r">{vals.right}</div>
            <div class="vk_welcome_l fl_l">{vals.left}<div id="vkopt_settings" class="welcome_cfg">{vals.cfg}</div>
               <div class="vk_all_options">
                  <a class="flat_button" href="#" onclick="val('vkopt_settings', vkopt.settings.render_options()); hide(this); return false;">{lng.ShowAllOptions}</a>
               </div>
            </div>
         </div>
         */
         /*extra_actions:
         <div id="vk_extra_actions_wrap">
            <button class="flat_button" onclick="dApi.auth(); return false;">{lng.ResetApiAuth}</button>
         </div>
         */
		 /*color_picker:
		  <div id = "dev_widget_colors">
        <div id="dev_colorpicker" class="ttb dev_tt_to_left" style="display: none;">
			<div class="toup1">
			  <div class="ttb_cont"><div class="tt_text">
				<div class="dev_colorpicker">
				  <div class="dev_colorpicker_title">{lng.ColorSelector}</div>
				  <div id="dev_colors" onmousedown="return Dev.colorsDown(event, true);"><img class="dev_colors_grad" src="/images/colorpicker_bg.png" width="176" height="176"></div>
				  <canvas id="dev_palette" onmousedown="return Dev.paletteDown(event, true);" width="20" height="176"></canvas>
				  <div id="dev_picker1"></div>
				  <div id="dev_picker2"></div>
				</div>
			  </div></div>
			  <div class="bottom_pointer"></div>
			</div>
		  </div>
		  </div>
      */
      /*color_input:
      <div id="vk_color_input_{vals.id}" class="vk_color_switcher clear_fix">
			<div class="vk_color_label">{vals.caption}</div>
			<div class="dev_labeled">
			  # <input type="text" onchange="vkopt.settings.set('{vals.id}', this.value); setStyle(ge('dev_colorbox{vals.id}'),{backgroundColor: '#'+this.value});" class="text dev_constructor_input" id="widget_color{vals.id}" value="{vals.curColorNoSharp}" style="width: 50px;" onkeyup="cur.soonUpdatePreview();">
           <span onmouseover="vkopt.settings.colorbox_show(this, '{vals.id}', event);" class="dev_colorbox_cont">
            <span class="dev_colorbox" id="dev_colorbox{vals.id}" style="background-color: #{vals.curColorNoSharp};">&nbsp;</span>
           </span>
			</div>
      </div>
      */
      });
      // Подставляем локализацию в шаблон:
      for (var key in vkopt.settings.tpls)
         vkopt.settings.tpls[key] = vk_lib.tpl_process(vkopt.settings.tpls[key],values);

      vkopt.settings.top_menu_item();
      // vkopt.settings.left_menu_item(); // пока непонятно как избавиться от добавления класса ui_rmenu_item_sel при клике по пункту меню
      // </UI>

      vkopt.settings.filter_change = debounce (function(obj,callback){ callback(trim(obj.value)); }, 300);
      // Инит фич настроек плагинов
      var list = vkopt.settings.get_options_list();
      vkopt.settings.init_features(list);
      setTimeout(function(){
         vkopt.settings.first_launch();
      },0);
   },
   colorbox_show: function(el,id,ev){
      stManager.add(['dev.js','dev.css','tooltips.css'], function(){
         var updatePreview = function(){
           var color = val(ge('widget_color'+id));
           if (!color) return;
           vkopt.log(color);
           vkopt.settings.set(id, color);
           setStyle(ge('dev_colorbox'+id), {backgroundColor: '#'+color});
         }

         !cur.soonUpdate && (cur.soonUpdate = 0);
         // бекапим оригинал функции если он есть
         if (cur.soonUpdatePreview && cur.soonUpdatePreview.toString().indexOf('orig_soonUpdatePreview') == -1)
            cur.orig_soonUpdatePreview =  cur.soonUpdatePreview;
         cur.soonUpdatePreview = function(){
            clearTimeout(cur.soonUpdate);
            cur.soonUpdate = setTimeout(function(){
               updatePreview();
               cur.orig_soonUpdatePreview  && cur.orig_soonUpdatePreview();
            }, 400);
         };
         if (!ge('dev_widget_colors')){
            geByTag1('body').appendChild(se(vkopt.settings.tpls['color_picker']));
            cur.colorInited = false;
         }
         var p = ge('widget_color'+id).parentNode;
         p.insertBefore(ge('dev_widget_colors'),p.firstChild);
         Dev.showColorBox(el, id, ev);
      });
   },
   onLocation: function(nav_obj,cur_module_name){
      if (vkopt.settings.__last_user_id == 0 && vk.id > 0){
         vkopt.settings.__last_user_id = vk.id;
         vkopt.settings.first_launch();
      }
      if (nav_obj[0] != 'settings') return;



      if (!ge('ui_rmenu_vkopt')){
         var item = se(vkopt.settings.tpls.right_menu_item);
         var p = (ge('ui_rmenu_general') || {}).parentNode;
         p && p.appendChild(item);
      }
      if (nav_obj.act == 'vkopt'){
         Inj.Wait('cur.module == "settings"',function(){ // для предотвращения фейла родных скриптов
            vkopt.settings.show();
         },100)
      }
   },
   onModuleDelayedInit: function(plug_id){
      var list = vkopt_core.plugins.call_method(plug_id, 'onSettings');
      vkopt.settings.init_features(list, plug_id);
   },
   onSettings:{
      Extra:{
         vkopt_guide:{
            class_toggler: true
         },
         style_per_module:{}
      }
   },
   first_launch: function(){
      var check_ver = function(){
         var cur_ver = parseInt(vkopt.settings.get('version'));
         var cur_build = parseInt(vkopt.settings.get('build'));
         // Устанавливаем язык вкопта исходя из выбранного в вк, либо выбранного руками ранее.
         vkopt.lang.set(vkopt.lang.get_prefered(), true);

         if (!cur_ver)
            vkopt_core.plugins.call_modules('firstRun');

         if (!cur_build || cur_build<vBuild){
            dApi.call('account.getAppPermissions',{},function(r){
               if (r.response != vk_api_permissions.to_int(DAPI_APP_SCOPE)){
                  if (vk_DEBUG) console.log('API auth reason: different scopes');
                  dApi.auth();
               }
            });
            vkopt.settings.set('version', vVersion);
            vkopt.settings.set('build', vBuild);

            var box = new MessageBox({title: IDL('THFI'),width:"760px"});
            box.removeButtons();
            box.addButton('OK',function(){box.hide( 200 );},'no');

            // Для быстрого просмотра выбранной локализации
            var box_content = function(){
               //var welcome_html =
               //welcome_html += '<br><br>' + vkopt.lang.choose(true, box_content);
               var settings =  {
                  PopularOptions:{}
               };
               var list = vkopt.settings.get_options_list();
               for (var cat in list){
                      i = 0;
                  for (var option_id in list[cat]){
                     if (vkopt_defaults.popular.indexOf(option_id) == -1)
                        continue;
                     settings.PopularOptions[option_id] = list[cat][option_id];
                  }
               }

               var welcome_html = vk_lib.tpl_process(vkopt.settings.tpls['welcome_layout'],{
                  left: IDL('FirstUpdateLaunch',{
                     ver: String(vVersion).split('').join('.'),
                     build: vBuild,
                     b: '<b>%s</b>',
                     n: '<br />',
                     warn: '<span class="vk_welcome_warn">%s</span>',
                     a_site:'<a href=\"http://vkopt.net/\" target=_blank><b>%s</b></a>',
                     a_cfg:'<a href=\"/settings.php?act=vkopt\" target=_blank>%s</a>',
                     a_forum:'<a href=\"http://vkopt.net/forum/forumdisplay.php?f=4\" target=_blank>%s</a>',
                     a_faq:'<a href=\"http://vkopt.net/forum/forumdisplay.php?f=4\" target=_blank>%s</a>'
                  }),
                  right: vkopt.lang.choose(true, box_content),
                  cfg: vkopt.settings.render_options('',settings)
               });
               box.content(welcome_html);
               box.setOptions({title: IDL('THFI')});
            };
            stManager.add(['settings.css']);
            box_content();
            box.show();

         }

      };
      if (vk.id == 0){
         vkopt.settings.__last_user_id = 0;
         return;
      }
      if (!vkopt.settings.get('version')){
         vkopt.settings.restore(function(){
            check_ver();
         });
      } else {
         check_ver();
      }
   },
   init_features: function(list, plug_id){

      var each_in_opts = function(list){
         for (var option_id in list){
            var option_data = list[option_id];
            if (plug_id){
               option_data.plug_id = plug_id;      // TODO: убрать дублирование кода. (второй дубль в get_options_list)
               option_data.id = option_id;
            }
            vkopt.settings.set_feature(option_data, vkopt.settings.get(option_data.id));

            if (list[option_id].sub)              // обходим вложенные опции.
               each_in_opts(list[option_id].sub);
         }
         return null;
      };
      for (var cat in list){
         each_in_opts(list[cat]);
      }
   },
   top_menu_item: function(){
      var ref = ge('top_support_link');
      var item = se('<a class="top_profile_mrow" id="top_vkopt_settings_link" href="/settings?act=vkopt" onclick="return vkopt.settings.show(this, true);">VkOpt</a>');
      if (ref && !ge('top_vkopt_settings_link')){
         ref.parentNode.insertBefore(item, ref);
      }
   },
   left_menu_item: function(){
      if (!ge('l_vkopt')){
         var item = se(vkopt.settings.tpls.left_menu_item);
         var p = (ge('l_pr') || {}).parentNode;
         p && p.appendChild(item);
      }
   },
   render_options: function(filter, list){
      list =  list || vkopt.settings.get_options_list();
      var html = '';
      for (var cat in list){
         var content = ['',''],
             i = 0;
         for (var option_id in list[cat]){
            var option_data = list[cat][option_id];
            var option_text = (IDL(option_data.title) + ' ' + option_data.plug_id + ' ' + option_data.id).toLowerCase(); // в этой строке будем искать строку вбитую в фильтре
            if (filter  && trim(filter) != ''){
               filter = trim(filter).toLowerCase();
               if (filter == 'extra' && cat != 'Extra')
                  continue;

               if (filter != 'extra' && option_text.indexOf(filter) == -1) // если фильтр вбит
                  continue;
            }
            content[i++ % 2] += vkopt.settings.get_switcher_code(option_data);
         }
         if (content[0] || content[1])
            html += vk_lib.tpl_process(vkopt.settings.tpls['cat_block'], {
                  caption: IDL(cat, 2),
                  content_left: content[0],
                  content_right: content[1],
                  cat: cat
               });

      }
      if (filter == 'extra')
         html += vk_lib.tpl_process(vkopt.settings.tpls['extra_actions'], {});
      return html;
   },
   show: function(el, in_box){
      vkopt.settings.set('vkopt_guide', false); // скрываем подсказки по поиску кнопки настроек

      var update_view = function(){
         val('vkopt_settings', vkopt.settings.render_options());
         val('vkopt_lang_settings', vkopt.lang.choose(true, update_view));

         val('vkopt_donate_block', vk_lib.tpl_process(vkopt.settings.tpls['donate_form'], {}));
         val('vk_purses_list', vkOptDonate.WMPursesList('wmdonate'));
         //val('wmdonate', vkOptDonate.WMDonateForm(30,'R255120081922'));
      };
      var bottom_block = vk_lib.tpl_process(vkopt.settings.tpls['bottom_block'], {});

      if (!in_box || ge('vkopt_settings_block')){ // показ на странице, а не во всплывающем окне
         stManager.add(['dev.css','page.css']);
         el = el || ge('ui_rmenu_vkopt');
         el && uiRightMenu.switchMenu(el);
         var p = ge('wide_column');
         vkopt_core.setLoc('settings?act=vkopt'); // вместо nav.setLoc для избежания рекурсии, обход реакции на смену URL'а
         p.innerHTML = vk_lib.tpl_process(vkopt.settings.tpls['main'],{bottom_block: bottom_block});
         update_view();
      } else {
         stManager.add(['settings.css','dev.css','page.css'],function(){
            var html = vk_lib.tpl_process(vkopt.settings.tpls['search_block'], {content: '', bottom_block: bottom_block});
            vkopt.settings.__box = new MessageBox({title:vkopt.settings.__full_title, width: 650 ,hideButtons:true, bodyStyle: 'padding:0px;'}).content(html).show();
            update_view();
         })

      }
      return false;
   },
   filter: function(val){
      ge('vkopt_settings').innerHTML = vkopt.settings.render_options(val);
      (val.toLowerCase() == 'extra' ? show : hide)('vk_setts_Extra');
      (val == '' ? show : hide)('vkopt_lang_settings');
   },
   filter_change: function(){}, //onInit: filter_change = debounce (function(obj,callback){ callback(trim(obj.value)); }, 300),
   onCmd: function(data){
      if (data && data.act == 'config_updated')
         vkopt.settings.config_cached = null;
   },
   config_cached: null,
   config: function(new_config){
      if (new_config){
         localStorage['vkopt_config'] = JSON.stringify(new_config);
         vkopt.settings.config_cached = new_config;
         vkopt.cmd({act: 'config_updated'});
         return new_config;
      }
      if (vkopt.settings.config_cached)
         return vkopt.settings.config_cached;
      var config = vkopt_defaults.config;
      try {
         config = JSON.parse(localStorage['vkopt_config'] || '{}')
         vkopt.settings.config_cached = config;
      } catch(e) {
         new MessageBox({title:'Vkopt error',hideButtons:true}).content('Config parse error. Use default config').show();
         localStorage['vkopt_config'] = JSON.stringify(config);
         // TODO: add ping to statisitcs about fail
      }
      return config;
   },
   set:function(option_id, val){
      var cfg = vkopt.settings.config();
      cfg[option_id] = val;
      vkopt.settings.config(cfg);

      var option_data = vkopt.settings.get_option_data(option_id);
      vkopt.settings.set_feature(option_data, val);

      vkopt_core.plugins.call_modules('onOptionChanged', option_id, val, option_data);
      window.vkopt_core_ready && vkopt.settings.backup_handler();
   },
   get:function(option_id){
      var cfg = vkopt.settings.config();
      return (typeof cfg[option_id] == 'undefined') ? vkopt_defaults.config[option_id] : cfg[option_id];
   },
   init_defaults: function(){
      var list = vkopt.settings.get_options_list();
      vkopt.settings.update_defaults(list);
   },
   update_defaults: function(list){ // выдираем значения настроек по умолчанию и прописываем в vkopt_defaults.config;
      var each_in_opts = function(list){
         for (var option_id in list){
            if (typeof list[option_id].default_value != 'undefined')
               vkopt_defaults.config[option_id] = list[option_id].default_value;

            if (list[option_id].sub){              // ищем среди вложенных опций.
               each_in_opts(list[option_id].sub);
            }
         }
      };
      for (var cat in list){
         each_in_opts(list[cat]);
      }
   },
   get_option_data: function(option_id){
      var list = vkopt.settings.get_options_list();
      var each_in_opts = function(list){
         for (var opt_id in list){
            if (opt_id == option_id)
               return list[opt_id];

            if (list[opt_id].sub){              // ищем среди вложенных опций.
               var data = each_in_opts(list[opt_id].sub);
               if (data)
                  return data;
            }
         }
         return null;
      };
      for (var cat in list){
         var option_data = each_in_opts(list[cat]);
         if (option_data)
            return option_data
      }
   },
   set_feature: function(option_data, val){
      if (!option_data) return;
      if (option_data.class_toggler) // если опция переключает наличие css-класса применяемого ко всей странице
         (val ? addClass : removeClass)(geByTag1('html'), 'vk_'+option_data.id);// у <body> className порой полностью перезаписывается обработчиками вк, т.ч вешаем класс на <html>
   },
   get_options_list:function(){
      var raw_list = vkopt_core.plugins.call_modules('onSettings'); // собираем опции со всех плагинов в один список
      var options = {
         Media:{},
         Users: {},
         vkInterface:{},
         Messages:{},
         Others:{},
         Extra:{}
         //Sounds:{}
      };
      var options_id = {}; // <conflicts />

      var each_in_cat = function(plug_id, opts, options, cat){
            for (var option_id in opts){
               var option_data = opts[option_id];
               option_data.plug_id = plug_id;
               option_data.id = option_id;
               if (options && cat)
                  options[cat][option_id] = option_data;

               // <conflicts>
               if (!options_id[option_id]) // собираем инфу, чтоб потом проверить, нет ли повторов ID опций в других плагинах
                  options_id[option_id] = [];
               options_id[option_id].push(plug_id);
               // </conflicts>
               if (option_data.sub){
                  each_in_cat(plug_id, option_data.sub);
               }
            }
      };
      for (var plug_id in raw_list){
         var setts = raw_list[plug_id];
         for (var cat in setts){
            var opts = setts[cat];
            if (!options[cat])
               options[cat] = {};
            each_in_cat(plug_id, opts, options, cat);
         }
      }

      // <conflicts>
      var conflicts = [];
      for (var option_id in options_id)
         if (options_id[option_id] && options_id[option_id].length > 1)
            conflicts.push(vk_lib.format('Option: <b>%1</b>. Found in: %2', option_id, options_id[option_id].join(', ')));

      if (conflicts.length)
         new MessageBox({title:'Conflicts',hideButtons:true}).content(conflicts.join('<br>')).show();
      // </conflicts>

      return options;
   },
   get_switcher_code:function(option_data){
      // чекбоксы
      //
      var html = '';
      if (!option_data.options && !option_data.color_picker && !option_data.content_func){ // checkbox
         html = vk_lib.tpl_process(vkopt.settings.tpls['checkbox'], {
               id: option_data.id,
               caption: IDL(trim(option_data.title || option_data.plug_id+'.'+option_data.id), 2),
               on_class: vkopt.settings.get(option_data.id) ? 'on': ''
            });
         if (option_data.sub){
            var content = '';
            for (var option_id in option_data.sub){
               content += vkopt.settings.get_switcher_code(option_data.sub[option_id]);
            }
            html += vk_lib.tpl_process(vkopt.settings.tpls['sub_block'], {content: content});
         }
      } else { // radio group (тут пока ничего нет поэтому пусть будет тут) COLOR_PICKER
			if (option_data.color_picker) {
				// конец каких-то левых функций
				html = vk_lib.tpl_process(vkopt.settings.tpls['color_input'], {
					id: option_data.id,
					curColorNoSharp: vkopt.settings.get(option_data.id),
					caption: IDL(trim(option_data.title || option_data.plug_id+'.'+option_data.id), 2)
				});
				if (option_data.sub){
					var content = '';
					for (var option_id in option_data.sub){
					   content += vkopt.settings.get_switcher_code(option_data.sub[option_id]);
					}
					html += vk_lib.tpl_process(vkopt.settings.tpls['sub_block'], {content: content});
				}
			}
         if (option_data.content_func) {
            if (typeof option_data.content_func == 'string'){
               var plug_func = vkopt[option_data.plug_id][option_data.content_func];
               html = plug_func ? plug_func() : option_data.content_func;
            } else
               html = option_data.content_func();
         }
      }
      return html;
   },

   backup_handler: function(){
      clearTimeout(vkopt.settings.__bkp_timeout);
      vkopt.settings.__bkp_timeout = setTimeout(function(){
         vkopt.settings.backup();
      },400)

   },
   backup:function(callback){
      var full_config = {
         config: vkopt.settings.config()
      };
      vk_ext_api.storage.set('vkopt_cfg_backup_'+vk.id, JSON.stringify(full_config), function(){
         console.log('config '+vk.id+' copied to bg ok');
         callback && callback();
      });

   },
   restore:function(callback){
      vk_ext_api.storage.get('vkopt_cfg_backup_'+vk.id,function(value){
         var cfg = JSON.parse(value || '{}');
         if (cfg.config){
            vkopt.settings.config(cfg.config);
            for (var option_id in cfg.config){
               var option_data = vkopt.settings.get_option_data(option_id);
               if (!option_data) continue;
               vkopt.settings.set_feature(option_data, cfg.config[option_id]);
               vkopt_core.plugins.call_modules('onOptionChanged', option_id, cfg.config[option_id], option_data);
            }
         }
         console.log('config '+vk.id+' restored from bg ok');
         callback && callback();
      })
   },
   remove_backup:function(callback){
      vk_ext_api.storage.set('vkopt_cfg_backup_'+vk.id, '{}', function(){
         console.log('empty config copied to bg ok');
         callback && callback();
      });
   },
   export_cfg: function() {
      var data = JSON.stringify(vkopt.settings.config(), '', '   ');
      vkopt.save_file(data, 'vkopt_config.json');
   },
   import_cfg: function() {
      vkopt.load_file(function(data) {
         try{
            var newset = JSON.parse(data);
            vkopt.settings.config(newset);
            vkopt.settings.config_cached = null;
            alert(IDL('ConfigLoaded'));
         } catch(e) {
            alert(IDL('ConfigError'));
         }
      });
   }
};

vkopt['lang'] = {
   tpls: null,
   __callbacks: [function(){}],
   onSettings:{
      Others:{
         dont_cut_bracket:{ title: 'seCutBracket' },
         switch_kbd_lay: { title: 'seSwitchKbdLay' }
      }
   },
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_lang{
            margin:auto;
            width:470px;
            height:120pt;
         }
         .vk_lang a{
            text-align:center;
            display:block;
            float:left;
            padding:2pt 5pt;
            margin:2pt;
            border_:solid 1pt #5c82ab;
            background:#fff;
            width:100pt;
            height:50pt;
         }
         .vk_lang a.selected{
            background-color: #e5ebf1;
         }
         .vk_lang a{
           -o-transition: all 0.25s ease-out;
           -webkit-transition: all 200ms linear;
           -moz-transition: all 200ms linear;
           -o-transition: all 200ms linear;
           transition: all 200ms linear;
         }
         .vk_lang a:hover, .vk_lang a:focus, .vk_lang a.selected:hover{
            text-decoration:none;
            color:#fff;
            background:#476d96;
         }
         .vk_lang .vk_lang_icon{margin:auto;display:block;clear:both;width:48px;height:48px;}
         .vk_lang .vk_lang_icon_ru{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAXVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////eEBgRWKnfEhrgGyMTWqnPDxYmZ7AzcLVCe7o6dbcsa7IPV6gOVqcNVaceYazSDxcwbrTbGiLYFh3VEhpMgr4qarKTDQFWAAAACHRSTlMAJxtZDRUIRLAAvJYAAACPSURBVEjH7ctHEsIwDAVQJWCHYsWFkp77HxOLXEDfM8yw8Ns/qlTsGWCJzAViqMVCSw0Wmhr+JYQtqm1BQkxqUcKUglqaJDwAEnYP2HPwDPASbgAJAxIGCfxU4yO81L6B+a3GnMPs7mpuLgmLu6q5pSSsSFhLwoiE8eehz6F3ekdA5GC6E6AzZE0LMJYqhQ/0BEft1j2DHgAAAABJRU5ErkJggg==");}
         .vk_lang .vk_lang_icon_ua{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAhFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/7wj/7wr/8BP/8BD/7w1RnMDv4AdClLosh7Izi7Umg7CNv9Z6tM92ss1rrMlmqMdgpcVKmb1YoMNxr8sTeak7kLdRncA5kLdMmr/66xT05QqIvNRElbv/8SP97hv36A8TeqmAt9EUeql73+oKAAAACXRSTlMAJwxZGxQiRAeVBSjSAAAA7UlEQVRIx+3Ny5KCMBCF4TgzQR2YkAG5Kknwfnn/95PTWi7URbcLV34VKumk/kJ9sHyJKKWNiFaRmQmYSI36dcG27kcISjYK2uOC7dgOwaao2IoNgrJmKxHYqmGrLIJ6zlYjcI3xxhjvjQcM9GHG9fVMQ+OGIPiWbR4Q9JatR5BZ54IDCFjhcgxYgJ3ebIYgZGwBwb8IglwAQd49c7jbcTp1XT4E21hgiyARQLCLE7Z4R8EfGwVLSbCk4JctoSARBvvbH6Z3z4+X8Z6CKRsFK0mwekuQSoL0tYAPQZSKREqPvwXGWk30j4CeqA+GMxMNaQHX9GMOAAAAAElFTkSuQmCC");}
         .vk_lang .vk_lang_icon_by{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAABcVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABasSRcsibdHyXdGyFUpSLnXGDlTlLjRkviQEXhOj5itS/ulJfgMzjeIifsfoHqdXjoaW3mXGDlVVnren7pb3PnY2bdHiTsg4b5qq31fYJgtCz4pKj3nJ///v77y836uLv5srX3nqL2kZT2iY30c3j0a3D++vr+8PH+7e3w5uz7xMX5sLP5rbD4p6r2k5f2hYnsgoXxTFL+9/fw7vT96Oj82Nn5vcD5trj2jZH0eH30b3TyWmDx6u/x5Ovu4Obo2+L83N381df7ztD7yMr5u73zZGnyYmfwREruLTRYqiTy8PXq6e/g4Of94ePh1dvd0Nfbx87bwsrttLv3mJzti471gYbmV1vxUlnlUVbxSE7vP0VcrinrDRby8/jy8fb17PDm4ez96erp4+nm4+nk4unMxdL6vsDXhZDXg43pb3LxV17mWV3uNj7hNDneLzTdLDLdKC7cJSptsklgAAAACXRSTlMAJwxZGxQiRAeVBSjSAAABxklEQVRIx+3PV28TQRDA8TNwTpyQ2CE9oXg31/v5KmfcS3C3KemNhNB7h0/PDUggJB7G7/k97Wr11+wwF1AujYVh2OfN/c3mfrMxi8IyyWct0m6RYn4BYy3JJJ6IYqknloRs9nb2Nzj9c/tzWPiUYBI5qeCSF661jHB4HAdPHbEsd8rCdYTDdZjQVrsdVbRWELKP4uB+p1cq9RzzBsIyBA2uyAdF3lpFWEnHwR1Hkl1JMm8ifIAgJxpvu4ZjryGsZmAHP9LUKBDWEWYhaBgGrep1K41wPAc7BHWF7x+ZGYQ0BDnJUzVPtucQMhBsap5WIZWtayjwpfDEJ3WaX8SAIEdqWljjrCWMLzCBDjlyqpvTGItxcLfKValCW6jgKyztKVRXfPsWwtK3OHigf9bCs4F5FWH6exy8PBvWT6KRjQp+wITwfGCc68IUwsYGLF0ecfLILaCDVxwfqLySnwKpv4+p/wWPYYLhDD52+4UUwq/gNXdQqRzweVRwLw62y6e+PPQK6OChylOqHAnoYEdv1/rF2hYmmJ+BCYFPqyQU0MG2FBE5cu15BAiSb/be7e2+392ZQUky7MTlMUywzCR7ZQzsJHMB4ScOwJ2mzVrpiwAAAABJRU5ErkJggg==");}
         .vk_lang .vk_lang_icon_en{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAxlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD////gAhngBBviDiTRAhdMTIgJCVzhBx1ERIM0NHkmJm8MDF5tbZ5hYZZTU43pTV3729/yk549PX4eHmroQlPkMzv0pa3wiY/mPUnkJzrfChL86euJibHzn6hycqFbW5IsLHTrXGrqYWZ2dqRnZ5p1daTWBRv39/fx8fHdDiPgFiY4OHvtbXXnSFPlOUX86+385ej1rrWCgq18fKjxj5hgYJZQUIvwf4oaGmjCyrWuAAAACXRSTlMAJwxZGxQiBUSTska8AAABDklEQVRIx+3RS1ODMBSG4aAGejSA4K0a2loVAQV6s633y///Uyad6eqczCQsuuoz82X3Ls6E7dkIDpwEjEcmfQpnfpRDnlO7Jax85kV5XbdtW6u33mr1HrHRr8e85KMooMArgKKDzwuaMaihaRpiI+z9SwWyuKQ9Y8uxDpqyhBKvfMKWAxW8fF/RHrDXNx2UoH6JmOno9CehXVN0kEgJEk+OsdVQBZVMaUNsvQlSqKqK2A1FBWcmQNFBlmWAppiC7NxgQOjrIIY4pnZPWKjgLza4I6xVAE66BAtxak3oG+bixJqYdwmm4GDaJZiIY2tispNgBg5mXYJQOAg95odOfMZ7hw56nAX8yAEP2J6Ff6oZds4sz/U+AAAAAElFTkSuQmCC");}
         .vk_lang .vk_lang_icon_it{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAxlBMVEUAAAABAAAAAAAAAAAAAAAUDAoeCAQZGRQ1NTUAAAD///8Xk1TcFx0fl1oalVbdGyHcGB7eISYimV3nXGDdHiRcs4cdllgVik7OFRtOrHzlVVnlTlLgMjfeIynu7u5GqndApnI6o20zoGjjRkviQEXhOj6UzrHulJdVsIGDxaN+w6B1v5lvvJVpuZBjtozsg4bsfoHqdXjpb3PoaW3ren7nY2Z6wZ16wp0bkVVYsYTXHiTTGR+Lyanti44tnWTdKjDcJSraIijFix7TAAAACnRSTlMAJhtZDCsXEglEphuazgAAASpJREFUSMft0ltTgkAYxvHFArWi4mAKSJiYeT4WZtnp+3+pdqGL532nQXC89Lezl/95LnbFSSHnJVSrNVFtUBeMQxmi0ugTPHgiHE1o2/4Q8WCOsmA3QjxYoA9fBoNdslFnkySJvDx4RlkwHCMeLNFcBd5ogniwQotABeMp4sEaLQNdBpMZ4sELWqmFaFr84daxLoPZAPHAR04sFzpbD/EgQH5PBV6EeBCjIA2iDuJBD8UqeKB48EipoEvwoE2ooGsTPLBSoZVpq8Ak/gkUCD7zA5dIA/sO5QbWlwxsMze4QX/BNcoPvmVglgjcH03oe4Jb5L7J4NW8RMcNLBloe4IrZL0fEjRLB3bxIGwdEOjN/O8domyBumdahAyM+lkJdUPUjEoJRk2cFPALAAaA9oogdCMAAAAASUVORK5CYII=");}
         .vk_lang .vk_lang_icon_tat{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAYFBMVEUAAAAKhQoAAADdHiTkS1D///+SyZJ3u3dut25ptGlksmRfr19ZrFlSqVLO5878vr9MpkxGo0Y/nz83mzculi7eJiwmkiYAgACDwYONxo3Y7Nj9y8zI5Mj0lJZ6vXrlUVbnrokrAAAAA3RSTlMA/oyUR8fmAAAAg0lEQVRIx+3LNxaDMBAFQGxhKzubHO5/S6Rdat7fgk7TT1Wc4yKSQnsXaHPoNaznYGAcOgvrODjYHjyMwxJgCwUdYZqCecEMBfuGWQruA3MU/BfmKYQfLFCIDSzmMA0P2DClcBNJYR6fsHFOQa1/2KpyqBWsLqGEw4DjIJHDVaQqTrEBM5w1uYWmqN8AAAAASUVORK5CYII=");}
         .vk_lang .vk_lang_icon_md{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAACmlBMVEUAAAABAAAAAAAAAAAAAAAUBQIbCwgGAAAoKB81NTUAAAAfHx/76g4AKYbbFhzbFx3dISfmW1/cHSMELIgCKofcGR8KMovdHyX76xkAJn0NNIzMFRrq2g0eQpT99ZAJMIr99H7983X88m/98FXjRUviP0TfMTb76hCJncdMaao9XKIlSZgMM4z88WPkTVFyiLxbdLFTbq5MaKpEYqY0VZ8sT5vulJbrfoHpb3LoaG3lVFngOT1thbpngLdherQHL4kGLonqen3qdHjmYmbcGyHsgoX88mn88V12jL7983n88FX76xT88E7983r88mp1i74EK4P870D77ThpXDX77TFvXyybjSf76xbp1hZ7YAl1UwlHZaj57V/16VX26kn870eZgUXGXj2AaCbUGiA6URjn2BLGthLt3BH35xC5qA2YgQh1UAdwUQZAX6U4WKEyU54oS5rtj5EVOo7rgYQOKXnmWV1NU1vlVlrkUVXYy0vu4knw5UbpSUWpnEGCdD14aj10YT2icTzgNDmMbzi7QjhwaDZwXTSyazPUeC/cKS+6YC7VTC377CuBfSvYyinZISeIbCJ3Yh7RFx2omhTx4A95UgeIZgSClsR8ksFpgLhgebQKLZUaP5EKMJDsiIsJLoYSN4PqdXoqPGjPxVq+s1m0p1g4R1jLwFNKS1DjS09LTk6SeU3e00ybg0w2Qkyhj0ZcXETgOj/FVj6pgj2mfz2YYzyXYzvXYDraWTq7aznRbTfNcTZTVzWKhTNrZDF4cS18Zy15YiyShSmuZSjLnCbFkCbXHyUiOx+FYx7OFRo8OhZKTRWGKxTz4hPZwBPf0BLUxhJtNA+njA6iXg6cVA5zYA1lVA2Jewx4WQurmgp1ZAmMcQeLbQeJcAamqL7HAAAADHRSTlMAJ1kbDBYsIhIJRDGTZtjuAAACcUlEQVRIx+3N9VdTYRjA8Tt1lKgDdZuEGMCQTgk7BmP3DlyP0UgtDJSQBkkpQcLu7u7u7q7/xfe+Hs953qvnuPEznzfO88v3PNQIm4yxg5OTM+U0izSTw43EpxwjAwhTOWYTyhwpXnqATJaamipDvwyZxiGVStdKMTSUlPFQsDkMSlYoktmHKZIVsVBJBQqitsyFpnMsgnYloGCFbB40g2MxJF3HBmHzocTEFHSQlN83Doplg8Ct4VAIlhHyRzy0N9SB4q3cFgElsTIOHNyfkYQtgeKO8lAQHgnJ5fJMufzw8ZOZeJC7QfG+KFgVEQUxTGVOFcOczsliTuRUMkwC5IaD9EAoO6u+obY6q66+uqq2oS47OxSq8ENBTGA0pFS2tjY1nr908UJjk7pFqfSFQtlgdXQMpFLd1V6tOZebm1vTpr2jUvlBvjgIImg0eXkdl681N1+/0pbXq9HMIZxFQZA3oavnSV9H54P29oed9/t6e7r8CetR4B1MEPc/N6rLjxQZjpVrjWn9YgEBB0KC2PB48MzOUt290u1q4xeDWETwR8EOH4Jen5+vbrmh053ao7V81OvdCWywRrgAoulPzwq7D+lu7usutKbRtDsk2ICDhRBNW/ILP7y5fev1+1ffrDS9FBKxgYdwIiSRpJneGgoGLQUvX5jQhsmQaOO/goKBz14/jNbvxe+KiySSvwIHH59JkIT11Tw0ZDbhcQLk/ohHjd0tJAJXbMD8s6gYT2SwHG1YJhwHuULcQIQC3n+C8ZD9wabhBFOCbQ8ET9nAw47AEwcEMYeAgAOSF4cnyZHiu4yygwufcuaPtgPfmRphg1+dSTMgRnAshAAAAABJRU5ErkJggg==");}
         .vk_lang .vk_lang_icon_lv{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAh1BMVEUAAAAAAAAFBQQAAAAAAAAUBQINCwgpKSkGAAAAAAAfHx8rBQD///+oAQHCTEyqBQWoAwOsDAydAAC9PT26NDTXiYnPcnLLZ2fJYWG/RETEU1PNbW3HW1vRdnarCgrBSEiiBASoCwv9/f3VhITRdne/QEC7ODjRd3bSfHzGWVm4LS2uFBSrERGcTWvbAAAADHRSTlMAJw1ZGxYqCSJEMS/l5UaFAAAA2klEQVRIx+3N69KCIBCA4d2+D7WDFmIeKiU72PH+r68Fmn7v+rPpQcCBeQf4YYknEjFMMhEFiV0L2ATQHlvv0gYnv3yOTmEPf0eLLijZfNBct2zXhoJzW7G1ZxeUNVvpAlPt2CozBxzqDVs9IAW3jO02RIDFpmHLCqTAGjbrgrsp2MydgoXIlwSHhcBhTPDQSzb9oOApCZ4U9N2KresRIgpSGoS2lKYf4XtPWsK1C2Z9l7L5F/aSYI+A8kDzAz0qyCVBPiKIcs0XXhBJQE3/BKYKYvUvoGL4YXgBSrxrknu3zq4AAAAASUVORK5CYII=");}

         .vk_lang_about {
            text-align:center;
            clear:both;
         }
         */
      }).css;
   },
   onInit: function(){
      if (vkopt.settings.get('switch_kbd_lay')) {
         vkopt.lang.inputListener(true);
      }
      vkopt.lang.tpls = vk_lib.get_block_comments(function(){
         /*lang_item:
         <a href="#" class="vk_lang_item {vals.subclass}" onclick="vkopt.lang.set({vals.lang_idx},{vals.no_reload}); vkopt.lang.__callbacks[{vals.after_lang_set}](); return false;"><div class="vk_lang_icon vk_lang_icon_{vals.lang_id}"/></div>{vals.lang_name}
         */

         /*lang_block:
         <div class="vk_lang">{vals.items}</div>
         <div class="vk_lang_about"><b><a href="javascript: toggle('vklang_author')">{lng.About_languages}</a></b><div id="vklang_author" style="display:none">{vals.about}</div></div>
         */
      });
   },
   inputListener: function (on) {
      if (on) {
         document.addEventListener('keyup', vkopt.lang.ctrlQListner);
      } else {
         document.removeEventListener('keyup', vkopt.lang.ctrlQListner);
      }
   },
   ctrlQListner: function (ev) {
      ev = ev || window.event;
      if (ev.ctrlKey && (ev.keyCode == 81 || ev.keyCode == 221)) {
         ev.preventDefault();
         var ae = document.activeElement;
         if (ae.value) ae.value = vkopt.lang.switchKeybTxt(ae.value);
         else if (ae.contentEditable == "true" && ae.innerText) {
            ae.innerText = vkopt.lang.switchKeybTxt(ae.innerText);
         }
      }
   },
   switchKeybTxt: function switchKeybTxt(text) {
      var dict = vk_lang['keyboard_lang'] || vk_lang_ru['keyboard_lang'];
      if (dict.constructor != TwoWayMap){
         dict = new TwoWayMap(dict);
         vk_lang['keyboard_lang'] = dict;
      }
      return text.split('').reduce(function (acc, val) {
         return acc + dict.get(val);
      }, '');
   },
   onOptionChanged: function (option_id, val/*, option_data*/) {
      if (option_id === 'switch_kbd_lay') vkopt.lang.inputListener(val);
   },
   override: function(){
      vkLangGet = vkopt.lang.get;
      vkLangSet = vkopt.lang.set;
      IDL  = vkopt.lang.lng;
   },
   lng: function(id,options){ // if options is [Object] - apply macro replacing to lang string; else if  options = 2 - remove [], other  - add []
      vkopt.lang.get();
      var str = vkopt.lang.str_by_name(id);
      if (isObject(options)) {
         str = str.replace(/\{([a-z_\-\.]+)(?:\|([^\{\}]*?))?\}/g, function(s,key, val){
            if (options[key]){
               return val ? options[key].replace(/%s/g, val) : options[key]
            } else {
               return val ? val : s;
            }
         });
         return str;
      }
      else if (str && (options || !vkopt.settings.get('dont_cut_bracket')))
         return vkopt.lang.cut_bracket(str, options);
      else
         return str;
   },
   cur_rx: /^\[\s*(.+)\s*\]$/,
   cut_bracket: function(s,bracket){ // bracket = 2 - remove [], other  - add []
      if (isArray(s)) return s;
      if (!vkopt.settings.get('dont_cut_bracket') || bracket==2) s=s.replace(vkopt.lang.cur_rx,'$1');
      else if (bracket &&  bracket!=2) s='[ '+s+' ]';
		return s;
	},
   str_by_name: function(id){
      var dec = function (val) {
      	try {
      		return decodeURI(val);
      	} catch (e) {}
      	return val;
      };
      var raw = vk_lang[id] || vk_lang_ru[id] || (window.vk_lang_add && vk_lang_add[id]);
      return raw ? dec(raw) : id;
   },
   get: function(){
	  var id=vkopt.settings.get('vklang');
     if (!window.vk_lang){
		 if (!id) id=0;
		 vk_lang=VK_LANGS[id]?VK_LANGS[id]:VK_LANGS[0];
	  }
	  return id;
	},
   set: function(id,no_reload){
      vkopt.settings.set('vklang',id);
      vk_lang=VK_LANGS[id];
      if (!no_reload)
         location.reload();
	},
   get_prefered: function(){
      var cur_lang_id = parseInt(vkopt.settings.get('vklang'));
      if (isNaN(cur_lang_id))
         cur_lang_id = -1;
      if (cur_lang_id == -1){
         var lng = 'en';
         for (var key in VK_LANGS_ASSOC){
            if (VK_LANGS_ASSOC[key].indexOf(vk.lang) > -1){
               lng = key;
            }
         }
         return VK_LANGS_IDS.indexOf(lng);
      } else {
         return cur_lang_id;
      }
   },
   choose: function(no_reload, after_lang_set){
      var cb_idx = 0;
      if (after_lang_set){
         vkopt.lang.__callbacks.push(after_lang_set);
         cb_idx = vkopt.lang.__callbacks.length - 1;
      }
      var cur_lang_id = parseInt(vkopt.settings.get('vklang')) || 0;

      var lng=[];
      for (var i=0; i<VK_LANGS_IDS.length; i++){
         lng.push([VK_LANGS_IDS[i],VK_LANGS[i]['LangTitle'],VK_LANGS[i]['LangAuthor']])
      }
      var html=[];
      var about=[];
      for (var i=0;i<lng.length;i++) {
         html.push(vk_lib.tpl_process(vkopt.lang.tpls.lang_item, {
                     lang_idx: i,
                     no_reload: no_reload,
                     after_lang_set: cb_idx || 0,
                     lang_id: lng[i][0],
                     lang_name: lng[i][1],
                     subclass: i == cur_lang_id ? 'selected' : ''
                  }));

         about.push('<b>'+lng[i][1]+'</b> - '+lng[i][2]);
      }

      return vk_lib.tpl_process(vkopt.lang.tpls.lang_block, {
         items: html.join(''),
         about: about.join('<br>')
      });
   }
};

vkopt['owners'] = {
   cache:{},
   decode: function(url, callback){ //callback(uid, gid, appid)
      if (!url)
         return callback(null, null);

      var u_rx = /(?:(?:^|\/)(?:u|id)?(\d+)$)/;
      var g_rx = /(?:(?:^|\/)(?:g|club|event|public)(\d+)$)/;

      url = String(url);
      var obj_id = url.split('/').pop().split('?').shift();

      if (u_rx.test(url))
         return callback(url.match(u_rx)[1], null);

      if (g_rx.test(url))
         return callback(null, url.match(g_rx)[1]);


      if (vkopt.owners.cache[obj_id])
         return callback.apply(this, vkopt.owners.cache[obj_id]);

      dApi.call('utils.resolveScreenName', {screen_name : obj_id}, function (r) {
         var res = r.response;
         switch (res.type) {
            case 'user':
               vkopt.owners.cache[obj_id] = [res.object_id];
               break;
            case 'event':
            case 'group':
            case 'page':
               vkopt.owners.cache[obj_id] = [null, res.object_id];
               break;
            case 'application':
               vkopt.owners.cache[obj_id] = [null, null, res.object_id];
               break;
         }
         if (vkopt.owners.cache[obj_id])
            callback.apply(this, vkopt.owners.cache[obj_id])
      });
   }
};

vkopt['away'] = {
   onSettings: {
      Others: {
         skip_away: {
            title: 'seOnAway'
         }
      },
      Extra:{
         away_unescape_cyrilic:{
            default_value: false
         }
      }
   },
   processLinks:  function(link){
      if (vkopt.settings.get('skip_away'))
         vkopt.away.process_link(link);
   },
   process_link: function(node){
      var href = node.getAttribute('href');
      //  href="/away.php?to=https%3A%2F%2F%EF%F0%E0%E7%E4%ED%E8%EA%E8-%F0%FF%E7%E0%ED%E8.%F0%F4%2F2017-08-18-2&post=177665937_1672&cc_key="  (source: /wall177665937_1672)

      if (!href || (href+'').indexOf('away.php?') == -1) // нас не интересуют ссылки без away.php
         return;
      var params = q2ajx(href.split('?')[1]); // декодируем GET-параметры в объект
      if (!params.to) // не нашли целевую ссылку
         return;

      var new_lnk = vkopt.settings.get('away_unescape_cyrilic') ? vkUnescapeCyrLink(params.to) : params.to;

      if (/^[a-z]+%/.test(new_lnk)) // тут не ссылка, а вероятно escaped win1251
         return;                     // для декодирования нужна магия (vkUnescapeCyrLink). игнорим.

      if (!new_lnk)
         return;
      node.setAttribute('href', new_lnk);
   }
};

vkopt['side_bar'] = {
   onSettings:{
      vkInterface: {
         menu: {
            title: 'seMenu',
            class_toggler: true,
            default_value: false
         }
      }
   },
   tpls:{},
   items: function(){
      var vkmid = vk.id;
      return {
         'profile': [
            ['wall' + vkmid, IDL('mWAllPosts')],
            [['#', "showWiki({w: 'postbox'}, false, event, {queue: 1, stat: ['wkview.js' ,'wkview.css', 'postbox.js', 'postbox.css', 'wide_dd.js', 'wide_dd.css', 'page.js', 'page.css']}); return false;"], IDL('NewPost')],
            ['/notes', IDL("mNoM")],
            [['/gifts' + vkmid, "return !showBox('al_gifts.php',{act:'box',tab:'received',mid:"+vkmid+"},{cache:1,stat:['gifts.css','gifts.js']})"], IDL('clGi')],
            [['#', "return !showTabbedBox('al_page.php', {act: 'box', oid: "+vkmid+", tab: 'fans'}, {cache: 1}, event)"], IDL('clFans')],
            [['#', "return !showBox('al_fans.php',{act:'box',tab:'idols',oid:"+vkmid+"},{cache:1,stat:['page_help.css', 'fansbox.js']})"], IDL('clSubscriptions')],
            ['/edit', IDL('mAuE')],
            ['/stats?mid=' + vkmid, IDL('Stats')]
         ],
         'feed': [
            ['feed', IDL("mNeP")],
            ['feed?section=notifications&list=replies', IDL("mNeNotif")],
            ['feed?section=updates', IDL("mNeU")],
            ['feed?section=comments', IDL("mNeB")],

            ['feed?section=friends',IDL("mNeF")],
            ['feed?section=groups', IDL("mNeG")],
            ['feed?section=photos', IDL("clPh")],
            ['feed?section=videos', IDL("clVi")],
            ['feed?section=mentions', IDL("mNeMe")],
            ['feed?section=recommended', IDL("mNeR")],
            //['feed?section=suggested',IDL("mNeR")+' 2'],
            ['feed?section=likes', IDL("mNeLiked")],
            ['feed?section=search', IDL("Search")]
         ],
         'im': [
            ['/im', IDL('mDialogsMessages')],
            ['/im?tab=unread', IDL('mUnread')],
            [['#', "return !showTabbedBox('al_im.php', {act: 'a_spam', gid: 0, offset: 0},{stat: ['im.css'], params:{width: 638}})"], IDL('Spam')],
            [['#', "return !showTabbedBox('al_im.php', {act: 'a_important', offset: 0},{stat: ['im.css'], params:{width: 638}})"], IDL('mImportant')]
            /*
            ['/im?q=day:' + dateFormat("ddmmyyyy"), IDL('mStealth')]
            ._im_search .nim-dialog--preview {white-space: normal;}
            .nim-dialog._im_search {height: auto;}
            ._im_search.nim-dialog .nim-dialog--cw, ._im_search.nim-dialog.nim-dialog_classic .nim-dialog--cw {height: auto;margin: 4px 0;}
            */
         ],
         'friends': [
            ['/friends?section=all', IDL("mFrA")],
            ['/friends?section=online', IDL("mFrO")],
            ['/friends?section=recent', IDL("mFrNew")],
            ['/friends?act=find', IDL("mFrSug")],
            ['/friends?section=requests', IDL("mFrR"), true],
            ['/friends?section=all_requests', IDL("mFrAllReq")],
            ['/friends?section=out_requests', IDL("mFrOutReq")],
            [['/friends?w=calendar', 'return nav.change({w: \'calendar\'})'], IDL("Birthdays")]
         ],
         'groups': [
            ['/groups', IDL("mGrM")],
            ['/groups?act=events', IDL("Events")],
            ['/groups?act=catalog', IDL("mGrS")],
            ['/groups?tab=admin', IDL("mGrAdmin")]
         ],

         'albums': [
            ['/albums' + vkmid, IDL("mPhM")],
            ['/tag' + vkmid, IDL("mPhW")],
            [["#", "showBox('al_photos.php', {act: 'new_album_box'},{stat: ['photos.css']}); return false;"], IDL("mPhN")],
            ['/photos' + vkmid + '?act=comments', IDL("mPhC")],
            ['/photos' + vkmid, IDL("mPhA")]
         ],
         'audio': [
            ['/audio', IDL("mAuM")],
            ['/audio?section=playlists', IDL("Playlists")],
            ['/audio?section=updates', IDL("mNeU")],
            ['/audio?section=recoms', IDL("mNeR")],
            [['#', "showBox('/audio', {act: 'new_audio'}, {params: {width: 430}, stat: ['audio.css','audio.js'] }); return false;"], IDL("mAuN")]
         ],
         'video': [
            ['/videos'+vkmid, IDL("mViM")],
            ['/video?section=uploaded', IDL("mViUploaded")],
            ['/video?section=comments', IDL("mPhC")]
            //[['#', "stManager.add(['ui_controls.js','video.js', 'upload.js', 'video_upload.js'],function(){VideoUpload.showBox({aid:0});}); return false;"], IDL("mViN")]
         ],
         'apps': [
            ['/apps?act=apps', IDL("mApM")],
            ['/apps?act=catalog', IDL("mApA")],
            ['/apps?act=notifications', IDL("mTags"), true],
            ['/settings?act=apps', IDL("mApS")]
         ],
         'market': [
            ['/market',IDL('Catalog')],
            ['/market?act=fav',IDL('favorites')],
            ['/market?act=my',IDL('MyProducts')]
         ],
         /*
         'fave': [
            ["fave?section=users", IDL("mFaV")],
            ["fave?section=likes_photo", IDL("mFaP")],
            ["fave?section=likes_video", IDL("mFaVI")],
            ["fave?section=likes_posts", IDL("mFaPO")],
            ["fave?section=likes_market", IDL("Products")],
            ["fave?section=links", IDL("mFaL")],
            ["fave?section=articles", IDL("Articles")],
            ["cc", IDL("vk_cc")]
         ],
         */
         'bookmarks': [
            [["#", "return showWiki({w: 'bookmarks_pages'}, false, event); return false;"], IDL("mFaV")],
            ['feed?section=likes', IDL("mNeLiked")],
            ["bookmarks?type=post", IDL("mFaPO")],
            ["bookmarks?type=article", IDL("Articles")],
            ["bookmarks?type=video", IDL("mFaVI")],
            ["bookmarks?type=link", IDL("mFaL")],
            ["bookmarks?type=podcast", IDL("Podcasts")],
            ["bookmarks?type=product", IDL("Products")],
            ["cc", IDL("vk_cc")]
         ],
         'docs': [],
         'apps_manage': []
      }
   },
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_menu #side_bar.side_bar,
         .vk_menu .body_im #side_bar.side_bar{
            overflow:visible;
         }
         .vk_menu .body_im #side_bar.side_bar{
            overflow-y: hidden;
         }
         .vk_menu_block {
            position: absolute;
            z-index: 2000;
            margin-left: 115px;
            margin-top: -5px;
         }
         .vk_menu_block ul{
            list-style: none;
            margin: 2px;
            padding: 0px;
            background: rgba(255,255,255,0.9);
            border-radius:5px;
            box-shadow: 0 1px 0 0 #d7d8db, 0 0 0 1px #e3e4e8;
            overflow:hidden;
         }
         #side_bar ol li .vk_menu_block ul li{
            margin:0;
            padding:0;
            display:block;
            white-space: nowrap;
         }
         .vk_menu_block ul li a{
            display:block;
            padding:7px 15px;
            text-decoration:none;
            background:rgba(255, 255, 255, 0);
            transition:background-color 200ms linear;
         }
         .vk_menu_block ul li a:hover{
            background:rgba(0, 34, 85, 0.1)
         }
         #side_bar ol li .vk_menu_block{
            overflow:hidden;
            max-height:0px;
            transition: max-height 100ms;
            transition-delay:400ms;
         }
         .vk_menu #side_bar ol li:hover .vk_menu_block{
            max-height:500px;
         }
         */
      }).css
   },
   onInit: function(){
      vkopt.side_bar.tpls = vk_lib.get_block_comments(function(){
         /*menu_block:
         <div class="vk_menu_block">
            <ul>
               {vals.items}
            </ul>
         </div>
         */
         /*menu_item:
         <li><a href="{vals.href=#}" onclick="{vals.onclick=}">{vals.text}</a></li>
         */
      });
      vkopt.side_bar.make_menu();
   },
   onOptionChanged: function(option_id, val, option_data){
      if (option_id == 'menu')
         vkopt.side_bar.make_menu();
   },
   make_menu: function(){
      if (geByClass1('vk_menu_block')) return;
      var id2type =    {
         "l_pr": "profile",
         "l_nwsf": "feed",
         "l_msg": "im",
         "l_fr": "friends",
         "l_gr": "groups",
         "l_ph": "albums",
         "l_aud": "audio",
         "l_vid": "video",
         "l_ap": "apps",
         "l_mk": "market",
         "l_fav": "bookmarks", //"fave",
         "l_doc": "docs",
         "l_apm": "apps_manage"
         //"l_mgid\d+": "club\d+"
      }

      var p = ge('side_bar_inner');
      var lis = geByTag('li', p);
      var els = [];
      for (var i=0;i<lis.length; i++)
         els.push(lis[i]);

      var blocks = vkopt.side_bar.items();
      for (i = 0; i < els.length; i++){
         var
            li = els[i],
            id = li.id,
            a = geByTag1('a',li),
            lnk = '';
         if (a && a.href)
            lnk = a.href.split('?')[0].split('/').pop();

         var items = blocks[id2type[id]] || blocks[lnk];

         var sub_items = [];
         if (items && items.length){
            for (var k = 0; k < items.length; k++)
               sub_items.push(vk_lib.tpl_process(vkopt.side_bar.tpls['menu_item'], {
                  href:       isArray(items[k][0]) ? items[k][0][0] : items[k][0],
                  onclick:    isArray(items[k][0]) ? items[k][0][1] : "return nav.go(this, event, {noback: true});",
                  text:       IDL(items[k][1])
               }))

            var block = se(vk_lib.tpl_process(vkopt.side_bar.tpls['menu_block'], {
               items: sub_items.join('\n')
            }));
            li.appendChild(block);
         }
      }
   }
}

vkopt['photoview'] =  {
   onSettings:{
      Media:{
         scroll_to_next:{
            title: 'seScroolPhoto'
         }
      },
      vkInterface: {
         pv_comm_move_down: {
            title: 'sePvCommMoveDown',
            class_toggler: true
         }
      },
      Extra:{
         photo_search_copy:{},
         ph_download_with_name:{},
         ph_show_save_info:{default_value: true},
         ph_update_btn:{},
         photo_copy_btn:{default_value: true},
         pv_hide_comments_btn: {
            default_value: true,
            class_toggler: true
         },
         pv_hide_comments: {
            default_value: false,
            class_toggler: true
         },
         pv_editor_ignore_flash:{default_value: true}
      }
   },
   tpls:{},
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_pv_comm_move_down .pv_left_wrap,
         .vk_pv_comm_move_down .pv_narrow_column_wrap{
            clear:both !important;
         }
         .vk_pv_comm_move_down .pv_narrow_column_cont .narrow_column{
            width: auto !important;
            height: auto !important;
         }
         .vk_pv_comm_move_down .pv_narrow_column_cont .ui_scroll_outer{
            padding-right: 10px !important;
         }
         .vk_pv_comm_move_down .pv_narrow_column_cont .ui_scroll_blocker,
         .vk_pv_comm_move_down .pv_narrow_column_cont  .ui_scroll_outer{
            overflow-y: auto;
         }
         .vk_pv_comm_move_down .pv_narrow_column_cont .ui_scroll_blocker{
            padding-right: 0px !important;
         }
         .vk_pv_comm_move_down .pv_cont{
            margin: 0px auto 100px;
         }
         .vk_pv_comm_move_down .pv_cont .pv_photo_wrap .pv_narrow_column_wrap{
            display:block;
            float: none;
         }
         .vk_pv_comm_move_down .pv_cont .pv_narrow_column_cont .pv_reply_form_wrap{
            width: auto !important;
         }
         .vk_pv_comm_move_down .pv_cont .pv_narrow_column_cont .pv_no_commments_placeholder_wrap{
            margin-top: 0px !important;
         }
         .vk_pv_comm_move_down .pv_cont .pv_narrow_column_cont .pv_no_commments_placeholder ,
         .vk_pv_comm_move_down .pv_cont .pv_narrow_column_cont .pv_closed_commments_placeholder{
            padding: 9px 30px 4px;
            background-image: none;
            height: auto;
         }
         .vk_pv_comm_move_down .pv_cont .pv_close_btn{
            right: 34px;
         }
         .vk_pv_comm_move_down .pe_editor,
         .vk_pv_comm_move_down .pe_sticker_pack_list{
            width: auto !important;
            height: auto !important;
         }
         .vk_pv_comm_move_down .pe_sticker_pack_list .ui_scroll_outer{
            padding-right: 12px !important;
         }
         .vk_pv_comm_move_down .pe_main_wrap {
            padding-bottom: 50px;
         }
         #pv_more_acts_tt .vk_ph_copy_search.pv_more_act_item{
            padding: 8px 5px;
         }
         #pv_more_acts_tt .vk_ph_copy_search.pv_more_act_item:before{
            display: none;
         }
         .vk_ph_copy_search_label{
            padding:5px 12px;
         }
         .vk_ph_copy_search_links{
            padding-left:6px;
         }
         #pv_more_acts_tt .pv_more_act_item.vk_ph_sz_link{
            float:left;
            padding: 8px 6px;
         }
         #pv_more_acts_tt .pv_more_act_item.vk_ph_sz_hdlink {
             float: right;
             padding: 8px 6px;
         }
         #pv_more_acts_tt .vk_ph_sz_link.pv_more_act_item:before,
         #pv_more_acts_tt .vk_ph_sz_hdlink.pv_more_act_item:before{
            display: none;
         }
         #pv_more_acts_tt .vk_ph_sz_btn.pv_more_act_item:before,
         #pv_more_acts_tt .vk_ph_copy_search_label.pv_more_act_item:before,
         #pv_more_acts_tt .vk_pv_more_act_item.pv_more_act_item:before{
            background-image: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23FFFFFF%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E");
            background-position: 0 0;
            background-repeat: no-repeat;
            width: 16px;
            margin-top: -2px;
         }
         #pv_more_acts_tt .vk_pv_copy_act_item.pv_more_act_item:before{
            background-position: 0 -79px;
         }
         #pv_more_acts_tt .vk_ph_sz_btn.pv_more_act_item{
            padding: 8px 12px;
         }
         #vk_ph_links_list{
            padding-left: 8px;
         }

         .vk_save_info a {
            font-weight: bold;
         }
         .vk_save_info{
            white-space: normal;
            margin-bottom: 10px;
            padding-left: 51px;
            background: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%237D9AB7%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E") no-repeat;
            background-size: 24px;
            background-position: 6px 50%;
         }
         .vk_pv_comm_move_down .vk_save_info {
            float:right;
            text-align: right;
            margin: 0px;
            padding-left: 0px;
            padding-right: 28px;
            background-position: 100% 50%;
         }
         .vk_pv_comms:before {
            content: '';
            display: inline-block;
            width: 17px;
            height: 15px;
            background: url(/images/icons/like_icons_bl.png) 0 -30px;
            margin-bottom: -3px;
            opacity: 0.6;
            cursor:pointer;
         }
         .vk_pv_comms:hover:before{
            opacity:1;
         }
         .vk_pv_comms {
            color: #CCC;
            display: none;
            padding: 0 5px;
         }
         .vk_pv_comm_move_down .vk_pv_comms{
            display: inline-block;
         }
         .vk_pv_comm_move_down.vk_pv_hide_comments_btn.vk_pv_hide_comments #pv_box .pv_narrow_column_wrap{
            display:none;
         }
         */
      }).css;
   },
   onLibFiles: function(file_name){
      if (file_name == 'photoview.js'){
         if (vkopt.settings.get('pv_editor_ignore_flash'))
            Inj.Start('Photoview.openEditor', function(){
               if (browser.flash == 0)
                  browser.flash = 1
            })

         Inj.Start('Photoview.afterShow', function(){
            vkopt.photoview.scroll_view();
            cur.pvBox && vkopt_core.plugins.process_node(cur.pvBox);
            vkopt.photoview.toogle_comments_btn();
         });
         vkopt.photoview.move_comments_block.inj();
      }
   },
   onOptionChanged: function(option_id, val, option_data){
      if (option_id == 'pv_comm_move_down'){
         if (val)
            vkopt.photoview.move_comments_block.inj();
         else
            if (typeof Photoview != 'undefined')
               Photoview.SIDE_COLUMN_WIDTH = vkopt.photoview._SIDE_COLUMN_WIDTH_BKP;
      }
   },
   onInit: function(){
      vkopt.photoview.tpls = vk_lib.get_block_comments(function(){
         /*acts_menu:
         <div class="vk_pv_acts">
            <div class="pv_counter vk_ph_copy_search_label pv_more_act_item">{lng.ImgCopySeacrh}</div>
            <div class="vk_ph_copy_search_links">
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="https://www.google.com/searchbyimage?image_url={vals.src}">Google</a>
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="http://www.tineye.com/search?url={vals.src}">TinEye</a>
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="http://yandex.ru/images/search?img_url={vals.src}&rpt=imageview">Yandex</a>
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="https://iqdb.org/?url={vals.src}">IQDB</a>
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="/feed?section=photos_search&q=copy%3Aphoto{vals.photo_id}">VK</a>
            <div class="clear"></div>
            </div>
         </div>
         */
         /*act_item:
         <div class="pv_more_act_item {vals.class_name=}" onclick="{vals.onclick=}">{vals.text}</div>
         */
         /*links_menu:
         <div id="pv_hd_links">
            <a href="#" onclick="return vkopt.photoview.links_toogle();" class="vk_ph_sz_btn fl_l pv_more_act_item">{lng.Links}: </a>{vals.hd_links}
            <div id="vk_ph_links_list" class="clear" style="display:none;">{vals.links}</div>
            <div class="clear"></div>
         </div>
         */
         /*comm_btn:
         <span class="vk_pv_comms" onclick="vkopt.photoview.toogle_comments();"></span>
         */
      });
   },
   onElementTooltipFirstTimeShow: function(ett, ett_options){
      if (!ett_options || ett_options.id != 'pv_more_acts_tt' || !ett._ttel)
         return;
      if (ett._ttel && hasClass(ett._ttel, 'vk_actions'))
         return;
      var append_menu = function(content){
         ett._ttel.appendChild(se(trim(content)));
      };

      // Восстановить отредактированное фото
      if (cur.pvCurPhoto && cur.pvCurPhoto.actions && cur.pvCurPhoto.actions.edit && cur.pvCurPhoto.was_edited){
         var html = vk_lib.tpl_process(vkopt.photoview.tpls['act_item'],{
            class_name: 'vk_pv_more_act_item',
            onclick: 'vkopt.photoview.restore_original();',
            text: IDL('RestoreOriginal')
         });
         append_menu(html);
      }

      if (vkopt.settings.get('ph_update_btn'))
         if (cur.pvCurPhoto && cur.pvCurPhoto.id){
            var html = vk_lib.tpl_process(vkopt.photoview.tpls['act_item'],{
               class_name: 'vk_pv_more_act_item',
               onclick: 'vkopt.photos.update_photo(cur.pvCurPhoto.id);',
               text: IDL('Update')
            });
            append_menu(html);
         }

      // Поиск копий
      if (vkopt.settings.get('photo_search_copy')){
         var html = vk_lib.tpl_process(vkopt.photoview.tpls['acts_menu'],{
            src: cur.pvCurData.src,
            photo_id: cur.pvCurPhoto.id
         });
         append_menu(html);
      }


      // Список ссылок на варианты фото:
      var d_name=function(p,pfx){
         if (!vkopt.settings.get('ph_download_with_name')) return '';
         return ' onclick="return vkDownloadFile(this);" download="photo'+p.id+pfx+'.jpg" ';
      };

      var links=[],
          hd_links=[],
          ph = cur.pvCurPhoto;

      var sizes=["w","z","y","x","r","q","p","o","m","s"];
      for (var i=0; i<sizes.length; i++){
         var size = sizes[i];
         var sz=ph[size+'_'];
         var src=ph[size+'_src'];
         if (sz && sz[1] && src){
            links.push('<a href="'+src+'" class="pv_more_act_item vk_ph_sz_link" '+d_name(ph,size)+'>'+size+':'+sz[1]+'x'+sz[2]+'</a>');
            if (i < 3)
               hd_links.push('<a href="'+src+'" '+d_name(ph,size)+' title="'+sz[1]+'x'+sz[2]+'" class="pv_more_act_item vk_ph_sz_hdlink">HD'+(3-i)+'</a>')
         }
      }
      if (!hd_links.length && links.length)
         hd_links.push(links[0]);

      if (links.length){
         html = vk_lib.tpl_process(vkopt.photoview.tpls['links_menu'],{
            hd_links: hd_links.join('\n'),
            links: links.join('\n')
         });
         append_menu(html);
      }

      //Сохранить фото к себе с выбором альбома
      if (vkopt.settings.get('photo_copy_btn') && cur.pvCurPhoto && cur.pvCurPhoto.id){
         var html = vk_lib.tpl_process(vkopt.photoview.tpls['act_item'],{
            class_name: 'vk_pv_copy_act_item',
            onclick: 'vkopt.photoview.copy_and_move();',
            text: getLang('photos_save_to_alb')
         });
         append_menu(html);
      }
      ett._ttel && addClass(ett._ttel, 'vk_actions');
      ett.updatePosition();

   },
   onResponseAnswer: function(answer, url, q) {
      if (url == '/al_photos.php' && q.act == 'save_me' && answer[0]){
         if (!vkopt.settings.get('ph_show_save_info')) return;
         if (window.cur && cur.pvData){
			var idx = cur.pvIndex,
                lid = cur.pvListId,
                pv = cur.pvData;
            if (cur.pvData[lid] && cur.pvData[lid][idx] && cur.pvData[lid][idx].id == q.photo){
               var p = geByClass1('pv_author_block'),
                   div = ce('div',{className:'vk_save_info'});
               val(div, answer[0]);
               re(geByClass1('top_result_header', div));
               p.insertBefore(div, p.firstChild);
            }

         }
      }
   },
   links_toogle: function(){
      toggle('vk_ph_links_list');
      cur.pvMoreActionsTooltip && cur.pvMoreActionsTooltip.updatePosition();
      return false;
   },
   scroll_view: function() {
   	 // можно конечно для оптимизации и в onLibFiles перенести проверку активности опции + вызов onLibFiles по событию onOptionChanged('scroll_to_next'), для инъекции на лету при переключении опции
       // но есть ли смысл? падения вызывать не должно, т.к в самое начало функции инъектится
      if (!vkopt.settings.get('scroll_to_next')) return;
      vkopt.photoview.allow_scroll_view = true;
   	var on_scroll = function (is_next) {
   		if (vkopt.photoview.allow_scroll_view && (
               (isVisible('pv_nav_right') && isVisible('pv_nav_left')) ||
               (isVisible('pv_nav_btn_left') && isVisible('pv_nav_btn_right'))
            )) {
   			if (!cur.pvTagger && !boxQueue.count() && !document.activeElement.focused ) { //&& (!cur.pvComment || !cur.pvComment.focused)
   				if (is_next) {
   					photoview.show(cur.pvListId, cur.pvIndex + 1);
   				} else {
   					photoview.show(cur.pvListId, cur.pvIndex - 1);
   				}
   			}
   			vkopt.photoview.allow_scroll_view = false;
   			setTimeout(function(){ vkopt.photoview.allow_scroll_view = true }, 200);
   		}
   	};
   	var _next = function (e) {
   		on_scroll(1, e)
   	};
   	var _prev = function (e) {
   		on_scroll(0, e)
   	};
   	vkSetMouseScroll(geByClass1("pv_img_area_wrap"), _next, _prev);
   },
   restore_original: function(){
      ajax.post("al_photos.php", {
          act: "edit_photo",
          photo: cur.pvData[cur.pvListId][cur.pvIndex].id,
          webgl: 1,
          cors: 1
      }, {
         loader: true,
         onDone: function(title, html, js, data){
            var opts = html.match(/Filters\.restoreOriginal\([^,]+,\s*(-?\d+),\s*(\d+),\s*['"]([a-f0-9]+)['"]\)/);
            if (!window.Filters || !opts)
               showFastBox('',getLang('global_error_occured'));
            else {
               var restore = function(){
                  Filters.restoreOriginal(null, opts[1], opts[2],opts[3]);
               }
               showFastBox(getLang('global_box_confirm_title'),IDL('RestoreOriginal'), getLang('box_restore'), restore, getLang('box_cancel'))
            }
            vkopt.log(Filters, arguments);
         }
      })
   },
   copy_and_move: function(oid, pid, cb){
      if (!oid || !pid){
         var
            lid = cur.pvListId,
            idx = cur.pvIndex,
            pdata = cur.pvData[lid][idx],
            m = pdata.id.split('_');
         oid = m[0];
         pid = m[1];
      }
      var saved_pid = 0;
      var cur_uid = vk.id;

      var on_saved = function(oid, pid){
         showBox(
            "al_photos.php",
            {
               act: "a_move_to_album_box",
               photo_id: oid + "_" + pid,
               owner_id: oid,
               from: 'save_photo'
            },
            {
               stat: ["page.js", "page.css", "wide_dd.js", "wide_dd.css"]
            }
         )
      }


      dApi.call('photos.copy',{owner_id: oid, photo_id: pid, access_key: pdata.pe_hash}, {
         ok:function(resp, r, err){
            if (!r)  return;
            saved_pid = r;
            (cb && cb(saved_pid)) || on_saved(cur_uid,saved_pid)
         },
         error: function(r, err){
            if (pdata){
               ajax.post("al_photos.php", {
                  act: "save_me",
                  photo: pdata.id,
                  list: lid,
                  hash: pdata.hash
               },
               {
                  onDone: function(html){
                     var id = (html || '').match(/Photoview\.moveToAlbumBox\(\s*-?\d+,\s*(\d+)/);
                     if (!id){
                        vkMsg(IDL('Error'));
                        cb && cb(null);
                        return;
                     }
                     saved_pid =  id[1];
                     (cb && cb(saved_pid)) || on_saved(cur_uid,saved_pid)
                  }
               });
            } else {
               vkMsg(IDL('Error')+ (err?'<br>'+err.error_msg:''));
               cb && cb(null);
            }
         }
      });
   },
   toogle_comments_btn: function(){
      var viewer = cur.pvBox;
      if (!viewer || !vkopt.settings.get('pv_hide_comments_btn')) return;
      var ref = geByClass1('pv_bottom_info_left', viewer);
      if (!ref) return;
      var btn = geByClass1('vk_pv_comms', ref);
      if (!btn){
         btn = se(vk_lib.tpl_process(vkopt.photoview.tpls['comm_btn'],{}));
         ref.appendChild(btn);
      }
      val(btn, (cur.pvCurPhoto && cur.pvCurPhoto.commcount ? cur.pvCurPhoto.commcount : ''));
   },
   toogle_comments: function(show){
      var hide_comments = vkopt.settings.get('pv_hide_comments');
      hide_comments = !hide_comments;
      vkopt.settings.set('pv_hide_comments',hide_comments);
   },
   move_comments_block:{
      inj: function(){
         if (vkopt.settings.get('pv_comm_move_down') && typeof Photoview != 'undefined'){
            Inj.Replace('Photoview.updateVerticalPosition', /Math\.round/g, 'vkopt.photoview.move_comments_block.mod');
            Inj.Replace('Photoview.doShow', /new uiScroll\(/i, "(vkopt.settings.get('pv_comm_move_down') ? function(){} : new uiScroll)("); // вырубаем подмену скролла для блока комментов
            if (!vkopt.photoview._SIDE_COLUMN_WIDTH_BKP && Photoview.SIDE_COLUMN_WIDTH)
               vkopt.photoview._SIDE_COLUMN_WIDTH_BKP = Photoview.SIDE_COLUMN_WIDTH;
            Photoview.SIDE_COLUMN_WIDTH = 0;
         }
      },
      mod:function(t){
         return vkopt.settings.get('pv_comm_move_down') ? Math.max(Math.round(t),10) : Math.round(t);
      }
   }
};

vkopt['photos'] =  {
   css: function(){
      return vk_lib.get_block_comments(function(){
      /*css:
      #vk_ph_upd_btn{
         opacity:0.1
      }
      #vk_ph_upd_btn:hover{
         opacity:1
      }

      .vk_photos_album_more_btn {
          margin: 10px 0px 0px 10px;
          padding: 5px;
          float: right;
          cursor: pointer;
          font-size: 13px;
          position: relative;
          width: 22px;
          height: 24px;
      }
      .vk_photos_album_more_btn .ui_actions_menu_icons{
         top:auto;
      }
      */
      }).css
   },
   onSettings:{
      Extra:{
         photo_replacer:{}
      }
   },
   tpls:{},
   onInit: function(){
      vkopt.photos.tpls = vk_lib.get_block_comments(function(){
      /*photos_comments_link:
      <span class="photos_comments_link">
         <a href="/{vals.loc}?act=comments" onclick="return nav.go(this, event)">{lng.mPhC}</a>
      </span>
      */
      /*more_acts:
      <div class="vk_photos_album_more_btn ui_actions_menu_wrap _ui_menu_wrap" onmouseover="uiActionsMenu.show(this);" onmouseout="uiActionsMenu.hide(this);">
         <div class="ui_actions_menu_icons" tabindex="0" aria-label="{lng.Actions}" role="button" onclick="uiActionsMenu.keyToggle(this, event);">
            <span class="blind_label">{lng.Actions}</span>
         </div>
         <div class="ui_actions_menu _ui_menu">
         </div>
      </div>
      */
      /*more_acts_item:
      <a href="{vals.href=#}" tabindex="0" role="link" class="ui_actions_menu_item vk_acts_item {vals.item_class=vk_acts_item_icon}" onclick="{vals.onclick=}" {vals.attrs=}>{vals.text}</a>
      */
      /*more_acts_item_sep:
      <div class="ui_actions_menu_sep"></div>
      */
      });
   },
   onPhotoAlbumItems: function(aid, oid){
      var items = [];
      var loc = nav.objLoc[0];
      if (!nav.objLoc['act']){
         items.push({
            text: 'mPhC',
            href: '/'+nav.objLoc[0]+'?act=comments'
         });
         //items.push({}); // separator
      }
      return items;
   },
   onLocation: function(){
      if (/album|tag|photos/.test(nav.objLoc[0])){
         var m=nav.objLoc[0].match(/album(-?\d+)_(\d+)|(tag|photos|albums)(-?\d+)/);
         if (m){
            oid = m[1] ? m[1] : m[4];
            aid = m[1] ? m[2] : m[3];
            if (aid == 'albums')
               aid = 'photos'
            vkopt.photos.album_actions(aid, oid);
         }
      }
   },
   onResponseAnswer: function(answer,url,q){
      if (url == '/al_photos.php' && q.act == 'edit_photo' && (vkopt.settings.get('photo_replacer'))){
         answer[1] = vkopt_core.mod_str_as_node(answer[1], vkopt.photos.update_photo_btn, {source:'process_edit_photo_response', url:url, q:q});
      }
   },
   update_photo: function(photo_id){
      var box=vkAlertBox(IDL('Upload'),'<center><div id="vk_upd_photo"></div><div id="vk_upd_photo_progress"></div></center>');
      stManager.add(['upload.js','filters.js'],function(){
         var photo=photo_id;
         if (/photo-?\d+_\d+/.test(photo)) photo=photo.match(/photo(-?\d+_\d+)/)[1];
         AjPost('/al_photos.php',{'act':'edit_photo', 'al': 1, 'photo': photo},function(t){
               var upload_url=t.match(/"upload_url":"(.*)"/);
               var hash=t.match(/', '([a-f0-9]{18})'\)/);
               var aid=t.match(/selectedItems:\s*\[(-?\d+)\]/)[1];
               upload_url = upload_url[1].replace(/\\\//g, '/').split('"')[0];
               if (vk_DEBUG) console.log('url',upload_url);
               Upload.init('vk_upd_photo', upload_url, {}, {
                  file_name: 'photo',
                  file_size_limit: 1024 * 1024 * 5,
                  file_types_description: 'Image files (*.jpg, *.jpeg, *.png, *.gif)',
                  file_types: '*.jpg;*.JPG;*.jpeg;*.JPEG;*.png;*.PNG;*.gif;*.GIF',
                  onUploadStart:function(){
                     ge('vk_upd_photo_progress').innerHTML = vkopt.res.img.ldr_big;
                     //lockButton
                  },
                  onUploadComplete: function(u,res){
                     var data = {};
                     try{
                        data = JSON.parse(res);
                     }catch(e){ }
                     if (data.error){
                        box.hide();
                        vkAlertBox(IDL('Error'), data.error);
                        return;
                     }
                     var params = {
                        '_query' 	 : res,
                        'act' 	 	 : 'save_desc',
                        'aid' 	 	 : aid,
                        'al' 	 	    : 1,
                        'conf' 	 	 : '///',
                        'cover'  	 : '',
                        'filter_num' : 0,
                        'hash' 		 : hash[1],
                        'photo'		 : photo,
                        'text' 		 :''
                     };
                     ajax.post('/al_photos.php', params,{
                        onDone: function(text, album, photoObj, thumb) {
                           box.hide();
                           vkMsg(IDL('Done'),2000);
                           if (photoObj && thumb) {
                              if (typeof FiltersPE != 'undefined'){
                                 FiltersPE.changeThumbs(thumb);
                              }
                              if (typeof Filters != 'undefined'){
                                 Filters.changeThumbs(thumb);
                              }


                           }
                        }
                     });
                  },
                  lang: { "button_browse":IDL("Browse",1) }
               });
         });
      });
      return false;
   },
   update_photo_btn:function(node){
      var p = geByClass('pe_filter_buttons',node)[0] ? geByClass('pe_filter_buttons',node)[0] : geByClass('pv_filter_buttons',node)[0];
      if (!p) return;
      var btn = se('<div class="button_gray fl_r" id="vk_ph_upd_btn"><button onclick=" vkopt.photos.update_photo(cur.filterPhoto);">'+IDL('Update',2)+'</button></div>');
      p.appendChild(btn);
   },
   album_actions: function(aid, oid){ // добавляем кнопку на обзор комментариев к фото, если она отсутствует
      var cnt = 0, btn, p = ge('photos_all_block');// || ge('photos_container_photos');
      var h = geByClass1('page_block_header_extra', p);
      if (!h || geByClass1('vk_photos_album_more_btn', h)) return;

      btn = se(vk_lib.tpl_process(vkopt.photos.tpls['more_acts'], {}));
      h.firstChild && !geByClass1('upload_btn_wrap', h) && !p ? h.insertBefore(btn, h.firstChild) : h.appendChild(btn);

      var menu = geByClass1('ui_actions_menu', btn);
      var acts = vkopt_core.plugins.call_modules('onPhotoAlbumItems', aid, oid);
      for (var plug_id in acts){
         var items = acts[plug_id];
         for (var i = 0; i < items.length; i++){
            var item = se(vk_lib.tpl_process(vkopt.photos.tpls[items[i].text ? 'more_acts_item' : 'more_acts_item_sep'], {
               href:       items[i].href,
               item_class: items[i].item_class,
               onclick:    isString(items[i].onclick) ? items[i].onclick : '',
               attrs:      isString(items[i].attrs) ? attrs : '',
               text:       IDL(items[i].text)
            }));

            if (isObject(items[i].attrs))
               for (var attr in items[i].attrs)
                  item.setAttribute(attr, items[i].attrs[attr]);

            if (isFunction(items[i].onclick))
               addEvent(item, 'click', items[i].onclick);

            menu.appendChild(item);
            cnt++;
         }
      }
      if (cnt < 1)
         hide(btn);
      else
         show(btn);
      /*
      if (!geByClass1('photos_comments_link', h)){
         btn = se(
               vk_lib.tpl_process(vkopt.photos.tpls['photos_comments_link'], {
                  loc: loc
               })
            );
         h.appendChild(btn);
      }*/


   }

};

vkopt['albums'] = {
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         #vk_max_zip_size_slider,
         #vk_max_threads_count_slider{
            width: 280px;
         }
         .vk_adl_val_view {
            font-weight: bold;
         }
         .vkopt_box .box_title{
            background: url(data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23FFFFFF66%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E) 11px 50% no-repeat;
            background-size: 24px;
            padding-left: 45px;
         }
         .vk_opts_col{
            width: 290px;
            padding:3px;
            display: inline-block;
         }
         .vk_ph_progress_view .vk_ph_row{
            padding:10px 40px
         }
         .vk_opts_checkboxes .checkbox{
            margin-top: 10px;
            display: inline-block;
            width: 285px;
            vertical-align: top;
            margin-right: 10px;
         }
         */
      }).css
   },
   tpls: null,
   onSettings: {
      Extra:{
         album_dl_threads:{
            default_value: 5
         },
         album_dl_zip_size:{
            default_value:  400 * 1024 * 1024 // 400Mb
         },
         album_dl_photo_descr:{
            default_value: false
         },
         album_dl_album_descr:{
            default_value: true
         },
         album_dl_album_struct:{
            default_value: true
         }
      }
   },
   onInit: function(){
      vkopt.albums.tpls = vk_lib.get_block_comments(function(){
      /*options_content:
      <div>
         <div class="vk_opts_col">
            <div>{lng.FileSizePerArchive} <div class="vk_adl_val_view" id="vk_fsz_arch">{vals.def_filesize}</div></div>
            <div id="vk_max_zip_size_slider"></div>
         </div>
         <div class="vk_opts_col">
            <div>{lng.DownloadThreadsCount} <div class="vk_adl_val_view" id="vk_dl_th_cnt">{vals.def_threads}</div></div>
            <div id="vk_max_threads_count_slider"></div>
         </div>
         <div class="vk_opts_checkboxes">
            <div class="checkbox on" id="vk_ab_photo_descr" role="checkbox" aria-checked="true">
               {lng.SavePhotoDescriptions}
            </div>
            <div class="checkbox on" id="vk_ab_album_descr" role="checkbox" aria-checked="true">
               {lng.SaveAlbumDescriptions}
            </div>
            <div class="checkbox on" id="vk_ab_album_struct" role="checkbox" aria-checked="true">
               {lng.SaveAlbumStructure}
            </div>
         </div>
      </div>
      */
      /*progress_view:
      <div class="vk_ph_progress_view">
         <div class="vk_ph_progress vk_ph_row"></div>
         <div class="vk_ph_arch_list vk_ph_row"></div>
      </div>
      */
      });
   },

   onPhotoAlbumItems: function(aid, oid){
      var items = [];
      if (!nav.objLoc['act']){
         items.push({
            text: 'download',
            onclick: "return vkopt.albums.download('"+aid+"',"+oid+");"
         });
      }
      return items;
   },
   download: function(aid, oid){
      var album_name = (aid=='tag' || aid=='photos') ?  aid+oid : "album"+oid+"_"+aid;
      var box = null;

      var jpeg_vk_size = 6758400; // max 100% quality jpg file size in bytes (2560*2560*8.25)/8
      //cur_threads*jpeg_vk_size

      var max_threads = 20,
          cur_threads = vkopt.settings.get('album_dl_threads');
      var max_zip_size = 900 * 1024 * 1024,
          cur_size =  vkopt.settings.get('album_dl_zip_size'); //400 * 1024 * 1024; // 400Mb
      var sz_val, th_val;
      var save_photo_descr = vkopt.settings.get('album_dl_photo_descr'),
          save_albums_descr = vkopt.settings.get('album_dl_album_descr');
          save_albums_struct = vkopt.settings.get('album_dl_album_struct');

//dApi.call('photos.getAlbums',{owner_id:-337, album_ids:249252152, v:'5.80'},vkopt.log)

      var download_photo_list = function(list, name, ondone, on_progress){
         var modes = [
            'direct download',
            'direct download',
            'download with domain replace',
            'download with domain replace',
            'download through ext bg'
         ];

         var cur = 0;
         var dl_cnt = 0;
         var zip_cnt = 0;
         var size_sum = 0;
         var url, file_name;
         var aids = [];

         var lz_count = (list.length+'').length;

         //var phz = vkopt.zip(name || 'photos.zip');

         var xhrs = [];
         for (var i = 0; i < cur_threads; i++){
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhrs.push(xhr);
         }

         var make_next_zip = function(cb){
             var zipname = (name || 'photos.zip').replace(/(\.zip)?$/i, '_p' + zip_cnt + '.zip');
             size_sum = 0;
             phz = vkopt.zip(zipname);
             phz.addFile('0_info.txt', new Blob(['Archive #'+zip_cnt+'\r\nOriginal file name: ' + zipname + '\r\nDownloaded from vk.com by vkopt extension ( http://vkopt.net/ )'],{type:'plain/text'}), function(){
                cb && cb();
             });
             zip_cnt++;
         }

         var dl = function(idx, mode, callback){
            var error_fired = false;
            var xhr = xhrs.pop();
            if (!xhr) {
               vkopt.log('Get existing XHR object error. Create new');
               xhr = new XMLHttpRequest();
               xhr.responseType = 'blob';
            }
            mode = mode || 0;
            photo_info = list[idx];
            url = photo_info.url;

            file_name = (url || '/null').split('?')[0].split('/').pop();
            var info = {
               url: url,
               desc: photo_info.desc,
               file_name: file_name,
               path: vkCleanFileName(photo_info.album_id+' - '+photo_info.album_name) + '/',
               num: ('0000000000'+idx).substr(-lz_count)
            }
            if (!url) mode = 99;

            var onload = function(){
               if (xhr.status == 200){
                  xhrs.push(xhr);
                  callback(null, xhr.response, info)
               } else
                  onerror();

            };
            var onerror = function(){
               if (error_fired) return;
               error_fired = true;
               vkopt.log('Failed ' + modes[mode] + ': ' + file_name);
               xhrs.push(xhr);
               dl(idx, mode+1, callback)
            };
            xhr.onload = onload;
            xhr.onerror = onerror;
            //xhr.onprogress = function(e){console.log(e.loaded, e.total)}
            switch(mode){
               case 0:
               case 1: //retry
               {
                  xhr.open('GET', url, true);
                  xhr.send();
                  break;
               };
               case 2:
               case 3: // retry
               {
                  if (/pp\.userapi\.com/.test(url)){ // пробудем подставить в ссылку домен раздачи, на котором есть CORS хидеры.
                     xhrs.push(xhr);
                     dl(idx, mode+1, callback);
                  } else if (/[^\/\/]+\.userapi\.com/.test(url)){
                     url = url.replace(/:\/\/[^\/\/]+\.userapi\.com/,'://pp.userapi.com')
                     xhr.open('GET', url, true);
                     xhr.send();
                  } else
                     onerror();
                  break;
               };
               case 4: {
                  vk_aj.ajax({url: url, method: 'GET', responseType: 'arraybuffer'}, function (response) {
                     if (response && response.status == 200){
                        xhrs.push(xhr);
                        callback(null, new Blob([new Uint8Array(response.raw)],{type:'image/jpeg'}), info);
                     } else
                        onerror();
                  });
                  break;
               };
               default: {
                  xhrs.push(xhr);
                  callback('Failed while downloading "'+file_name+'"', null, info);
               }
            }
         }
         if (list.length < 1){
            alert('Photos not found');
            return;
         }
         var thread_count = 0;
         var run_threads  = function(){
            make_next_zip(function(){
               for (var i = 0; i < cur_threads; i++)
                  (cur < list.length) && step();
            });
         }
         var step = function(){
            thread_count++;
            dl(cur++, 0,function(err, result, info){
               if (!result){
                  result = new Blob(['Failed while downloaing:\r\n'+info.url],{type:'plain/text'});
                  info.file_name += '.txt';
               }
               var on_added = function(){
                  dl_cnt++;
                  thread_count--;
                  on_progress(dl_cnt, list.length);
                  if (size_sum >= cur_size) {
                     check_ready();
                  } else if (cur < list.length){
                     step();
                  } else {
                     check_ready();
                  }
               };

               size_sum += result.size || result.length || 0;

               var file_name = info.num + '_' + info.file_name;
               if (save_albums_struct)
                  file_name = info.path + file_name;

               save_albums_descr && info.path.replace(/album-?\d+_(\d+)/,function(s,album_id){
                  if (aids.indexOf(album_id) < 0)
                     aids.push(album_id);
                  return s;
               });

               phz.addFile(file_name, result, function(){
                  if (save_photo_descr && (trim(info.desc || '')).length){
                     phz.addFile(file_name + '_description.txt', new Blob([info.desc],{type:'plain/text'}), on_added);
                  } else
                     on_added();
               });
            });
         }
         var add_albums_info = function(items, callback){
            var i = 0;
            var add_next = function(){
               var item = items[i++];
               if (!item)
                  callback();
               else {
                  var descr = [
                     item.title,
                     item.description,
                     IDL('AlbumCreated')+': '+(new Date(item.created*1000)).format('dd mmm yyyy HH:MM'),
                     IDL('AlbumUpdated')+': '+(new Date(item.updated*1000)).format('dd mmm yyyy HH:MM')
                  ].join('\r\n\r\n');
                  phz.addFile('album' + item.owner_id + item.id + '_description.txt', new Blob([descr],{type:'plain/text'}), add_next);
               }
            }
            add_next();
         }
         var check_add_info = function(cb){
            if (save_albums_descr){
               dApi.call('photos.getAlbums', {owner_id:oid,album_ids:aids.join(','), v:'5.80'}, function(res, r, e){
                  if (r && r.items)
                     add_albums_info(r.items, cb);
                  else
                     cb && cb();
               });
            } else
               cb && cb();
         }

         var check_ready = function(){
            if (thread_count == 0){
               check_add_info(function(){
                  phz.download();
                  if (cur < list.length){
                     run_threads();
                  } else {
                     ondone && ondone();
                  }
               });
            } else
               vkopt.log('Wait download ending...');
         }

          run_threads();
      }

      function run(){
         if (!box) return;

         vkopt.settings.set('album_dl_threads',cur_threads)
         vkopt.settings.set('album_dl_zip_size',cur_size)
         vkopt.settings.set('album_dl_photo_descr',save_photo_descr)
         vkopt.settings.set('album_dl_album_struct',save_albums_struct)
         vkopt.settings.set('album_dl_album_descr',save_albums_descr)

         box.setOptions({title:IDL('Downloading')})
         box.changed = true;
         box.removeButtons();
         val(box.bodyNode, vk_lib.tpl_process(vkopt.albums.tpls['progress_view'], {}));
         var wrp = geByClass1('vk_ph_progress',box.bodyNode);

         vkApis.photos_hd({oid:oid, aid:aid, info:1}, function(r){
            vkopt.log('Links collected. Downloading...');
            download_photo_list(r, album_name+'.zip',
               function(){//on_done
                  box.changed = false;
                  box.setOptions({title:false});
                  wrp.innerHTML = IDL("Done");
                  removeClass(wrp,'vk_ph_row');
                  addClass(wrp,'ok_msg');
                  box.removeButtons();
                  box.addButton(getLang('box_close'), function (r) {
                     box.hide();
                  }, 'yes');
               },
               function(progr, total){ //on_progress
                  wrp.innerHTML = vkProgressBar(progr, total, 500, IDL('DownloadingAndArchiving'));
               }
            );
         }, function(progr, total){
            wrp.innerHTML = vkProgressBar(progr, total, 500, IDL('CollectingLinks'));
         });
      }

      function start(){
         if (navigator.storage && navigator.storage.persist){
           navigator.storage.persist().then(function(granted){
             run();
           });
         } else {
            run();
         }
      }
      stManager.add(['ui_common.css','ui_common.js'], function(){
         box = new MessageBox({
               title : IDL('DownloadSettings'),
               containerClass:'vkopt_box',
               closeButton : true,
               width : "650px"
            });
         box.removeButtons();
         box.addButton(IDL('download'), function (r) {
            start();
         }, 'yes');
         box.addButton(IDL('Cancel'), function (r) {
            abort = true;
            box.hide();
         }, 'no');

         box.show();
         var width = getSize(box.bodyNode, true)[0];
         box.content(vk_lib.tpl_process(vkopt.albums.tpls['options_content'], {
               def_filesize: vkFileSize(cur_size),
               def_threads: cur_threads
         }));
         box.show();

         var upd_info = debounce(function(){
               cur_size = 1 + sz_val * max_zip_size;
               cur_threads = 1 + Math.round(th_val * max_threads);
               var sz = vkFileSize(cur_size) + ' ~ ' + vkFileSize(cur_size + (cur_threads * jpeg_vk_size));
               val('vk_fsz_arch',sz);
               val('vk_dl_th_cnt',cur_threads);
         },30)

         var sz_sl = new Slider('vk_max_zip_size_slider', { // silder set float value from 0 to 1
            // backValue:0,
            // withBackLine:1|0,
            // color:''
            // backColor:''
            // formatHint: callback(obj, n)
            // hintClass:'',
            // log:0|1
            // onEndDragging: callback(cur_val)
            fireChangeEventOnInit: true,
            size:2,
            //debounce: 100,
            value: cur_size/max_zip_size,
            onChange: function(cur_val){
               sz_val = cur_val;
               upd_info();

            }
         });
         var th_sl = new Slider('vk_max_threads_count_slider', {
            fireChangeEventOnInit: true,
            size:2,
            //debounce: 100,
            value: cur_threads/max_threads,
            onChange: function(cur_val){
               th_val = cur_val;
               upd_info();
            }
         });

         checkbox('vk_ab_photo_descr', save_photo_descr);
         checkbox('vk_ab_album_descr', save_albums_descr);
         checkbox('vk_ab_album_struct', save_albums_struct);

         addEvent('vk_ab_photo_descr', 'click', function(e){
            checkbox(e.target);
            save_photo_descr = isChecked(e.target)
         });

         addEvent('vk_ab_album_descr', 'click', function(e){
            checkbox(e.target);
            save_albums_descr = isChecked(e.target)
         })

         addEvent('vk_ab_album_struct', 'click', function(e){
            checkbox(e.target);
            save_albums_struct = isChecked(e.target)
         })

      })
      return false;
   }
}

vkopt['audio'] =  {
   css: function(){
      var codes = vk_lib.get_block_comments(function(){
      /*dl:
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn{
         display:block;
      }
      .audio_row__action_get_link{
         float: right;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn>div,
      .audio_row__action_get_link div{
         background-image: url(/images/blog/about_icons.png);
         width: 12px;
         height: 14px;
         background-position: 0px -309px;
      }

      .audio_row .audio_acts .audio_act.vk_audio_acts>div {
         margin: 6px 0 0 6px;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.dl_url_loading>div,
      .audio_row__action_get_link.dl_url_loading div{
         opacity:0.3;
         background: url(/images/upload_inv_mini.gif) no-repeat 0% 50%;
         width: 17px;
         margin-left: -2px;
      }
      .audio_row__action_get_link div,
      .audio_row__action_get_link.dl_url_loading div{
         margin: 5px auto;
      }

      .vk_audio_icon_dots .audio_row .audio_acts .audio_act.vk_audio_acts{
         display:block;
      }
      .vk_audio_icon_dots .audio_row .audio_acts .audio_act.vk_audio_acts>div {
         background: url(/images/icons/profile_dots.png) no-repeat 0 5px;
         height: 13px;
         width: 18px;
      }

      .vk_audio_icon_dots .audio_row .audio_acts .audio_act.vk_audio_dl_btn.vk_audio_acts>div{
         background: url(/images/icons/profile_dots.png) no-repeat 0 5px;
         height: 13px;
         width: 18px;
         transition: none;
      }
      .vk_audio_icon_dots .audio_row .audio_acts .audio_act.vk_audio_dl_btn.vk_audio_acts:hover>div{
         background-image: url(/images/blog/about_icons.png);
         width: 12px;
         height: 14px;
         margin-left:3px;
         margin-right:3px;
         background-position: 0px -309px;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.dl_url_loading>div,
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.dl_url_loading:hover>div{
         opacity:0.3;
         background: url(/images/upload_inv_mini.gif) no-repeat 0% 50%;
         width: 18px;
      }

      .audio_duration_wrap.vk_with_au_info .audio_duration{
         display: inline;
      }

      .audio_row.vk_info_loaded .vk_audio_size_info_wrap,
      ._vk_size_info_on_ctrl .ctrl_key_pressed .audio_row.vk_info_loaded .vk_audio_size_info_wrap,
      ._vk_size_info_on_ctrl .audio_hq_label_show .audio_row.vk_info_loaded .vk_audio_size_info_wrap{
         display: table;
      }

      .vk_audio_size_info_wrap,
      .narrow_column .audios_module .vk_audio_size_info_wrap,
      .audio_row:hover .vk_audio_size_info_wrap,
      ._vk_size_info_on_ctrl .audio_row .vk_audio_size_info_wrap,
      ._vk_size_info_on_ctrl .audio_hq_label_show .audio_row:hover .vk_audio_size_info_wrap,
      ._vk_size_info_on_ctrl .audio_row:hover .vk_audio_size_info_wrap
      {
         display: none;
      }
      .vk_audio_size_info_wrap span{
         display: block;
      }
      .vk_audio_size_info_wrap{
         line-height: 10px;
         margin-right: 3px;
         margin-top: 12px;
         height: 18px;
         float:right;
         font-size: 10px;
         color: #777;
      }
      .audio_w_covers .vk_audio_size_info_wrap{
         margin-top: 15px;
      }
      .vk_audio_size_info{
         display: table-cell;
         vertical-align: middle;
      }
      .audio_row.vk_info_loaded .audio_row__info {margin-left: 30px;}
      .wall_module .media_desc .vk_audio_size_info b {
         background:none
      }
      .vk_audio_hq_label {
         display: inline-block;
         width: 15px;
         height: 11px;
         background-image: url(/images/icons/audio_hq.png);
         opacity: 0.35;
         vertical-align: top;
         margin-top: 3px;
         margin-right: 4px;
      }
      .audio_row .audio_row__action.audio_row__action_skip_track{
         display: none;
      }
      #top_audio_layer_place .audio_row .audio_row__action.audio_row__action_skip_track{
         display: inline-block;
      }

      .audio_row__action_skip_track .vko_skip, #top_audio_layer_place .audio_row .audio_acts .vko_skip, .audio_row__action_skip_track {
         display: block;
	      height: 24px;
         width: 24px;
         background: no-repeat url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20fill%3D%22%23828A99%22%20d%3D%22M5%2011.5c0-.27.23-.5.5-.5H12v2H5.5c-.27%200-.5-.2-.5-.5v-1zm0-4c0-.27.23-.5.5-.5h12c.28%200%20.5.2.5.5v1c0%20.27-.23.5-.5.5h-12c-.3%200-.5-.2-.5-.5v-1zm0%208c0-.27.23-.5.5-.5H12v2H5.5c-.27%200-.5-.2-.5-.5v-1zm15.9.9l-1.5-1.5%202.2-2.2c.4-.4.4-1%200-1.4-.4-.4-1-.4-1.4%200l-.7.7-1.5%201.5-1.5-1.5-.7-.7c-.4-.4-1-.4-1.4%200-.4.4-.4%201%200%201.4l2.2%202.2-1.5%201.5-.7.7c-.4.4-.4%201%200%201.4.4.4%201%20.4%201.4%200l2.2-2.2%202.2%202.2c.4.4%201%20.4%201.4%200%20.4-.4.4-1%200-1.4l-.7-.7z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
      }

      #top_audio_layer_place .audio_row.audio_skipped .audio_row__action_skip_track,
      #top_audio_layer_place .audio_row.audio_row__playing .audio_row__action_skip_track,
      #top_audio_layer_place .audio_row.audio_row__playing.audio_row__added_next.audio_skipped .audio_row__action_skip_track {
         display: none;
      }
      .audio_row.audio_skipped .audio_row_content {
         opacity: 0.5;
      }
      .audio_row.audio_row__added_next.audio_skipped .audio_row_content {
         opacity: 1;
      }
      #top_audio_layer_place .audio_row.audio_row__added_next.audio_skipped .audio_row__action_skip_track {
         display: inline-block;
      }
      .vk_audio_mod_info_visible .audios_module .audio_row .audio_row__duration,
      .vk_audio_mod_info_visible .audios_module .audio_row__info._audio_row__info {
         display: block !important;
      }
      */
      });
      return codes.dl;
   },
   tpls: {},
   onSettings:{
      Media:{
         audio_dl: {
            title: 'seLinkAu',
            info: 'infoUseNetTrafic'
         },
         audio_size_info: {
            title: 'seAudioSizeAuto',
            info: 'infoUseNetTrafic',
            sub: {
               audio_wait_hover:{
                  title: 'seAudioSizeHover'
               },
               /*
               size_info_on_ctrl: {
                  title: 'seAudioSizeShowOnCtrl',
                  class_toggler: true
               }
               */
            }
         },
         audio_skip_button: {
            title: 'seAudioSkipButton',
            default_value: true
         }
      },
      Extra:{
         /*
         audio_more_acts:{
            sub:{
               vk_audio_icon_dots:{class_toggler: true}
               audio_dl_acts_2_btns:{}
            }
         },
         */
         audio_mod_info_visible:{  // на блоках с аудио (профиль, группы) тоже показывать длительность и кнопки
            default_value: true,
            class_toggler: true
         }
      }
   },
   onInit: function(){
      vkopt.audio.tpls = vk_lib.get_block_comments(function(){
      /*size_info:
      <small class="vk_audio_size_info_wrap" id="vk_audio_size_info_{vals.id}">
         <div class="vk_audio_size_info">
            <span class="vk_audio_size">{vals.size}</span>
            <span class="vk_audio_kbps">{vals.kbps}</span>
         </div>
      </small>
      */
      /*wiki_code:
      <center>
         <input type="text" value="[[audio{vals.full_id}]]" readonly class="text" style="text-align: center;" onClick="this.focus();this.select();" size="30"/>
         <!--
         <br><br>
         <a href="/audio?{vals.oid_type}={vals.oid_abs}&audio_id={vals.aid}">{lng.Link}</a>
         --!>
      </center>
      */
      /*added_to_group:
      <b>
         <a href="/audio?id=-{vals.gid}&audio_id={vals.id}">{vals.id} ({vals.performer} - {vals.title})</a>
      </b>
      <br>
      {vals:aid} -> club{vals:gid}
      */
      });
      vkopt.audio.load_sizes_cache();
      vkbrowser.mozilla && vkopt.permissions.update();
   },
   onLibFiles: function(fn){
      if (fn == 'audioplayer.js'){
         Inj.Start('AudioUtils.onRowOver', vkopt.audio.acts.buttons);
         Inj.End('AudioUtils.onRowLeave', function(){
            clearTimeout(vkopt.audio.__onrowover);
         });
         Inj.Start('AudioPlayerHTML5.prototype._isHlsUrl', function(url,obj){
            if (obj && obj.get_url)
               obj.url = url;
         })

      }
   },
   remove_trash:function(s){
      s=vkRemoveTrash(s,'%'); // удаление символов не являющихся буквами/иероглифами/и т.д
      // Удаление лишних дефисов в названиях и приведение их к одному виду
      s=s.replace(/\[\s*\]|\(\s*\)|\{\s*\}/g,'');
      s=s.replace(/[\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+/g,'\u2013').replace(/\u2013\s*\u2013/g,'\u2013');
      s=s.replace(/[\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+$/,'');// ^[\s\u1806\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u2043\u02D7\u2796\-]+
      return s;
   },
   share: function(audio_fullId){
      showBox("like.php", {
            act: "publish_box",
            object: "audio" + audio_fullId,
            //list: "s" + vk.id, ???
            to: "mail"
      }, {
            stat: ["page.js", "page.css", "wide_dd.js", "wide_dd.css", "sharebox.js"],
            onFail: function(t) {
               showDoneBox(t);
                return true; // BUG ?
            }
      });
      return false;
   },
   search_track:function(event, ref, name){
      cur.cancelClick = true;

      var audioEl = gpeByClass('audio_layout ', ref);
      var isInAudioPage = window.AudioPage && audioEl && ge('audio_search');
      if (isInAudioPage) {
         return nav.change({
            q : name
         }, event, {
            searchPerformer : false
         });
      } else {
         return nav.go(ref, event);
      }
   },
   _adm_gr: null,
   add_to_group: function(oid, aid, to_gid){//vk_audio.add_to_group(oid,aid,to_gid)
         if (to_gid){
            if (vkopt.audio._add_box) vkopt.audio._add_box.hide();
            var data = AudioUtils.getAudioFromEl(geByClass1('_audio_row_'+oid+'_'+aid), true);
            var params = {
               act: "add",
               group_id: to_gid,
               audio_owner_id: data.ownerId,
               audio_id: data.id,
               hash: data.addHash,
               from: "" // AudioUtils.getContextPlaylist(getAudioPlayer(), true)[0] ???
            };
            ajax.post("al_audio.php", params, {
               onDone : function (t) {
                  var data = AudioUtils.asObject(t);
                  vkMsg(vk_lib.tpl_process(vkopt.audio.tpls['added_to_group'], {
                     gid: to_gid,
                     aid: aid,
                     id: data.id,
                     performer: data.performer,
                     title: data.title
                  }));
               },
               onFail : function (e) {
                  new MessageBox({ title : getLang("global_error")})
                  .content(e)
                  .setButtons("Ok", function(){curBox().hide()})
                  .show();
                  return true;
               }
            });
            return false;
         }
         var show_box=function(){
            var html=''; // TODO: в шаблоны
            html+='<h4>'+IDL('EnterLinkToGroup')+'</h4><div class="clear_fix">\
              <input id="aidtogrouplink" type="text" placeholder="http://vk.com/club123" class="text fl_l" style="width:336px">\
              <div class="button_blue fl_l"><button style="padding: 2px 8px;" id="aidtogroup">OK</button></div>\
            </div><br>';
            html+='<h4>'+IDL('SelectGroup')+'</h4>';
            for (var i=0; i<vkopt.audio._adm_gr.length;i++){
               html+='<a href="/'+vkopt.audio._adm_gr[i].screen_name+'" onclick="return vkopt.audio.add_to_group('+oid+','+aid+','+vkopt.audio._adm_gr[i].gid+');">'+vkopt.audio._adm_gr[i].name+'</a><br>';
            }
            vkopt.audio._add_box=vkAlertBox(IDL('Add'),html);
            var btn=ge('aidtogroup');
            var old_val=localStorage['vk_aid_to_group'];
            if (old_val) ge('aidtogrouplink').value=old_val;
            btn.onclick=function(){
               var url=ge('aidtogrouplink').value;
               if (!url || trim(url)=='') {
                  alert('Incorrect link');
                  return;
               }
               lockButton(btn);
               vkopt.owners.decode(url,function(uid,gid){
                  if (gid){
                     localStorage['vk_aid_to_group']=url;
                     vkopt.audio.add_to_group(oid,aid,gid);
                  } else {
                     alert('Incorrect link');
                     unlockButton(btn);
                  }

               });
            }
         };

         if (vkopt.audio._adm_gr==null){
         dApi.call('groups.get',{extended:1,filter:'admin'},function(r){
            //console.log(r)
            r.response.shift();
            vkopt.audio._adm_gr=r.response;
            show_box();
            });
         } else {
            show_box();
         }

      return false;
   },
   download_file: function(el){
     var result = true;
     if (el.hasAttribute('url_ready'))
        result = vkopt.permissions.check_dl_url(el, el.href);
     if (result) result = vkDownloadFile(el);
     return result;
   },
   check_dl_url: function(el){   // если на странице не было ссылок на аудио, то при наведении на кнопку загрузки ждём их появления в кэше.
      if (el.getAttribute('href') == ''){
         addClass(el,'dl_url_loading');
         var id = el.dataset["aid"];
         var req_id = el.dataset["reqaid"];
         function wait_and_set_url(){
            var info = vkopt.audio.__full_audio_info_cache[id];
            if (info){
               var name = unclean(info.performer + ' - ' + info.title);
               if (vkopt.settings.get('audio_clean_titles'))
                  name = vkopt.audio.remove_trash(name);

               var name = vkCleanFileName(name);
               var url = vkopt.audio.make_dl_url(info.url, name);

               if (/\.m3u8/.test(info.url)){
                  el.dataset["m3u8"] = info.url;
               }

               el.setAttribute('download', name+'.mp3');
               el.setAttribute('href', url);
               el.setAttribute('url_ready','1');
               removeClass(el,'dl_url_loading');
               //vkopt.permissions.request_on_click(el, url, vkopt.log);
               vkopt.audio.load_size_info(info.fullId, info.url);
            } else {
               setTimeout(function(){
                  wait_and_set_url();
               },300);
            }
         }
         wait_and_set_url();
         if (vkopt.settings.get('audio_wait_hover')){
            var info = vkopt.audio.__full_audio_info_cache[id];
            // если не в загруженной инфе и очередях загрузки
            var hq = vkopt.audio.__hover_load_queue;
            if (!info && vkopt.audio.__loading_queue.indexOf(req_id) == -1 &&  vkopt.audio.__load_queue.indexOf(req_id) == -1){
               var idx = hq.indexOf(req_id);
               if (idx == -1){ // не знаю возможно ли, но лучше добавлю проверку.
                  hq.push(req_id);
                  idx = hq.length - 1;
               }
               var start = Math.max(0, idx - 2);
               var end = Math.min(start + 5, hq.length) - start;
               var to_load = hq.splice(start, end);
               vkopt.audio.__load_queue = vkopt.audio.__load_queue.concat(to_load);
               vkopt.audio.load_audio_urls(); // запускаем процесс загрузки инфы об аудио из очереди
            }
         }
      }
   },
   make_dl_url: function(url, name){
      name = vkCleanFileName(name);
      /*
      // фикс-костыль, т.к для https://*.vk-cdn.net нет разрешений в манифесте.
      // если исправить в манифесте, то после обновления расширения, оно отключится у всех пользователей хрома)
      //url = vkopt.audio.decode_url(url);
      if (/^https:.+\.vk-cdn\.net\//i.test(url))
         url = url.replace(/^https:/,'http:');
      */
      var ext =  /\.m3u8/.test(url) ? '.m3u8' : '.mp3';
      return url + '#FILENAME/' + vkEncodeFileName(name) + ext;
   },
   processNode: function(node, params){
      if (!vkopt.settings.get('audio_dl')) return;
      if (!vkopt.audio.__full_audio_info_cache)
         vkopt.audio.__full_audio_info_cache = {};
      var cache = vkopt.audio.__full_audio_info_cache;

      var audios = geByClass('audio_row',node);
      if (!audios.length && hasClass(node, 'audio_row')) // если вызов из AutoList.prototype._drawRows, то на входе уже элемент audio_row
         audios = [node];

      for (var i = 0; i < audios.length; i++){
         var row = audios[i];
         var dur = geByClass1('audio_row__info', row);
         var info = null;
         try {
            info = JSON.parse(row.dataset["audio"]);
         } catch(e) {}
         if (!info) continue;
         var info_obj = AudioUtils.asObject(info);
         if (info_obj.url==""){                    // собираем очередь из аудио, которым требуется подгрузка инфы
            if (cache[info_obj.fullId])
               info_obj = cache[info_obj.fullId];
            else {
               var queue = vkopt.settings.get('audio_wait_hover') ? vkopt.audio.__hover_load_queue : vkopt.audio.__load_queue;
               var full_id_req = info_obj.fullId  + "_" + info_obj.actionHash + "_" + info_obj.urlHash;
               if (queue.indexOf(full_id_req) == -1 && vkopt.audio.__loading_queue.indexOf(full_id_req) == -1)
                  queue.push(full_id_req);
            }
         }

         if (info_obj.url)
            info_obj.url = vkopt.audio.decode_url(info_obj.url);

         //var name = unclean(info[4]+' - '+info[3]).replace(/<em>|<\/em>/g, ''); // зачищаем от тегов.
         //name = vkCleanFileName(name);

         var size = vkopt.audio._sizes_cache[info_obj.fullId];
         var sz_labels = size ? vkopt.audio.size_to_bitrare(size, info_obj.duration) : {};
         if (size){
            row.dataset['kbps'] = sz_labels.kbps_raw;
            row.dataset['filesize'] = size;
            addClass(row, 'vk_info_loaded');
         }

         var sz_info = se(vk_lib.tpl_process(vkopt.audio.tpls['size_info'], {
               id: info_obj.fullId,
               url: info_obj.url || '',
               size: sz_labels.size || '? Mb',
               kbps: sz_labels.kbps || '? Kbps'
            }));

         // Инфа о размере/битрейте
         if (vkopt.settings.get('audio_size_info')){
            if (!vkopt.settings.get('audio_wait_hover') && info_obj.url)
               vkopt_core.timeout( //setTimeout
                  (function(id, url){
                     return function(){
                        vkopt.audio.load_size_info(id, url);
                     }
                  })(info_obj.fullId, info_obj.url),
                  200
               );

            if (dur && !hasClass('vk_with_au_info',dur.parentNode)){
               dur.parentNode.insertBefore(sz_info, dur);
               addClass(dur.parentNode, 'vk_with_au_info');
            }
         }
      }

      // TODO: грузить инфу только при наведении на иконку меню/скачивания
      if (!vkopt.settings.get('audio_wait_hover') && (vkopt.settings.get('audio_size_info') || vkopt.settings.get('audio_dl'))) // URL'ы нужны только для этих опций
         vkopt.audio.load_audio_urls(); // запускаем процесс загрузки инфы об аудио из очереди
   },
   _sizes_cache: {}, // надо бы его загонять в локальное хранилище, но например кэш размеров со списка в ~500 аудио занимает около 10кб. т.е его нужно будет как-то по умному чистить.
   info_thread_count: 0,
   save_sizes_cache:function(){
      clearTimeout(vkopt.audio._save_size_cache);
      vkopt.audio._save_size_cache = setTimeout(function(){
         var cache = vkopt.audio._sizes_cache;
         var len = 0;
         var max_items = vkopt_defaults.config.MAX_CACHE_AUDIO_SIZE_ITEMS;
         for (var key in cache) len++;
         if (len > max_items){
            var new_cache = {};
            var i = 0;
            for (var key in cache){
               i++;
               if (i > len - max_items)
                  new_cache[key] = cache[key];
            }
            cache = new_cache;
         }
         localStorage['vkopt_audio_sizes_cache'] = JSON.stringify(cache);
      },1500);
   },
   load_sizes_cache:function(){
      var sz_cache = {};
      try{
         sz_cache = JSON.parse(localStorage['vkopt_audio_sizes_cache'] || '{}');
      } catch(e){}
      vkopt.audio._sizes_cache = sz_cache;
   },
   clear_sizes_cache:function(){
      localStorage['vkopt_audio_sizes_cache'] = '{}';
   },
   size_to_bitrare: function(size, duration){
      var kbit = size / 128;
      var kbps = Math.ceil(Math.round(kbit/duration)/16)*16;
      return {
         size: vkFileSize(size, 1).replace(/([\d\.]+)/,'<b>$1</b>'),
         kbps: (kbps > 0 ? '<b>' + kbps + '</b> Kbps' : ''),
         kbps_raw: kbps
      }
   },
   load_size_info: function(id, url){
      if (vkopt.audio.info_thread_count >= vkopt_defaults.config.AUDIO_INFO_LOAD_THREADS_COUNT){
         var t = setInterval(function(){
            if (vkopt.audio.info_thread_count < vkopt_defaults.config.AUDIO_INFO_LOAD_THREADS_COUNT){
               clearInterval(t);
               vkopt.audio.load_size_info(id, url);
            }
         },50);
         return;
      }
      if (!vkopt.settings.get('audio_size_info')) return;

      var size = vkopt.audio._sizes_cache[id];
      var rb = true;
      var WAIT_TIME = 4000;
      var els = geByClass('_audio_row_' + id);
      var set_size_info = function(size){
         for (var i = 0; i < els.length; i++){
            var el = els[i];
            var info = AudioUtils.asObject(AudioUtils.getAudioFromEl(el));
            var size_el = geByClass1('vk_audio_size', el);
            var kbps_el = geByClass1('vk_audio_kbps', el);

            var sz_info = vkopt.audio.size_to_bitrare(size, info.duration);
            val(size_el, sz_info.size);
            val(kbps_el, sz_info.kbps);

            el.dataset['kbps'] = sz_info.kbps_raw;
            el.dataset['filesize'] = size;
            addClass(el, 'vk_info_loaded');

            if (!vkopt.audio._sizes_cache[id]){
               if (sz_info.kbps_raw > 120){
                  vkopt.audio._sizes_cache[id] = size;
                  vkopt.audio.save_sizes_cache();
               } else {
                  vkopt.audio._sizes_cache[id] = false;
                  vkopt.audio.save_sizes_cache();
               }
            }
            return sz_info.kbps_raw > 120;
         }
      };
      var need_load = true;
      if (size)
         need_load = !set_size_info(size);

      if (need_load && els.length){
         var reset=setTimeout(function(){
            vkopt.audio.info_thread_count--;
            rb = false;
         }, WAIT_TIME);
         vkopt.audio.info_thread_count++;
         XFR.post(url, {}, function(h, size){
            clearTimeout(reset);
            vkopt.log('get_size response:', id, size, h);
            if (rb){
               vkopt.audio.info_thread_count--;
            }
            if (size > 0){
               set_size_info(size);
            } else {
               // TODO: видать ссылка протухла. нужно подгрузить актуальный URL и снова запросить размер
            }
         }, true);
      }
   },
   __load_queue:[], // очередь загрузки инфы
   __hover_load_queue:[], // очередь, из которой будут аудио перемещаться в __load_queue, при наведении на иконку загрузки.
   __loading_queue:[], // очередь текущих аудио, по которым в данный момент грузится инфа
   __load_req_num: 1,
   __full_audio_info_cache: {},
   decode_url: function(url){
      var tmp = {};
      var orig = RegExp.prototype.test;
      RegExp.prototype.test = function(){return false}
      try{
         AudioPlayerHTML5.prototype._setAudioNodeUrl(tmp, url);
      }catch(e){}
      RegExp.prototype.test = orig;
      return tmp.src
   },
   load_audio_urls: function(){
      if (vkopt.audio.__load_queue.length == 0 || vkopt.audio.__loading_queue.length > 0) // если нет списка на подгрузку, или что-то уже грузится - игнорим вызов
         return;

      vkopt.audio.__loading_queue = vkopt.audio.__load_queue.splice(0,Math.min(vkopt.audio.__load_queue.length, vkRandomRange(5,10))); // больше 10 аудио не принимает.
      var load_info = function(){
         //TODO: удаление из __load_queue отсутствущих на странице аудио

         ajax.post("al_audio.php", {
            act : "reload_audio",
            ids :  vkopt.audio.__loading_queue.join(",")
         }, {
            onDone : function (data) {
               if (!data){ // вероятно косяк с детектом множества однотипных действий
                  console.log('Load audio info failed:', vkopt.audio.__load_req_num, vkopt.audio.__loading_queue.join(","));
                  setTimeout(function(){
                     console.log('try load again');
                     load_info();
                  }, 10000);
               } else {
                  //console.log('on done:', vkopt.audio.__load_req_num, data);
                  vkopt.audio.__loading_queue = [];
                  each(data, function (i, info) {

                     info = AudioUtils.asObject(info);
                     if (info.url)
                        info.url = vkopt.audio.decode_url(info.url);

                     vkopt.audio.__full_audio_info_cache[info.fullId] = info;
                     if (info.url)
                        vkopt.audio.load_size_info(info.fullId, info.url);
                  });
                  if (vkopt.audio.__load_queue.length > 0) // если в очереди есть аудио - продолжаем грузить
                     vkopt.audio.load_audio_urls();
               }
            }
         });
         vkopt.audio.__load_req_num++;
      };

      clearTimeout(vkopt.audio.__load_delay); // за короткий промежуток времени аудио могло появиться в разных местах. чуть ждём пока устаканится список.
      vkopt.audio.__load_delay = setTimeout(
         function(){
            load_info();
         },
         vkopt.audio.__load_req_num %20 == 0 ? 3500 : 350 // попытка избежать тетекта однотипных действий
      );
   },
   load_all: function(callback){ // пока не используется. добавлено чтоб не забыть о таком способе получения ссылок (в новом вк нет упоминаний об этом методе).
      var query = {
         act : 'load_audios_silent',
         id : (cur.allAudiosIndex == 'all' ? cur.id : cur.audioFriend),
         gid : cur.gid,
         claim : nav.objLoc.claim,  // Для silent-подгрузки похоже не работает ни на старой, ни на новой версии вк.
                                    // На старой версии по URL https://vk.com/audio?claim=1 показываются только те заблоченные, что попадают в видимый без подгрузки список.
         please_dont_ddos : 2
      };
      if (cur.club)
         query.club = cur.club;

      ajax.post('/al_audio.php', query, {
         onDone : (function (data, opts) {
            callback(data)
         })
      });
   },
   onAudioRowItems: function(audioEl, audioObject, audio){
      var ap = getAudioPlayer();
      var items = {
         actions: [],
         more: [
            [//<a href="#" onclick="vkopt.audio.add_to_group({vals.ownerId}, {vals.id}); return false;">{lng.AddToGroup}</a>
               'add_to_group',
               function(audioEl, obj, audio){
                  //vkopt.log(arguments);
                  vkopt.audio.add_to_group(obj.ownerId,obj.id);
               },
               IDL('AddToGroup'),// button content
               ''//custom_attributes
            ],
            [
               'get_wiki_code',
               function(audioEl, obj, audio){
                  //vkopt.log(arguments);
                  vkopt.audio.acts.wiki(obj.fullId,obj.ownerId,obj.id);
               },
               IDL('Wiki'),// button content
               ''//custom_attributes
            ]
         ]
      }
      if (vkopt.settings.get('audio_dl')){
         items.actions.push([
            'get_link',
            function(audioEl, audioObject, audio){
               vkopt.log(arguments);
               var filename=vkCleanFileName(unclean(audioObject.performer+' - '+audioObject.title));
               var dl_btn = geByClass1('_audio_row__action_get_link', audioEl);
               if (dl_btn.hasAttribute('url_ready')){
                  if (dl_btn.dataset["m3u8"]){
                     vkopt.hls.download(
                        dl_btn.dataset["m3u8"],
                        dl_btn.getAttribute('download'),
                        dl_btn.dataset["aid"]
                     );
                     return false;
                  }

                  var dlnk = se('<a href="'+dl_btn.href+'" download="'+filename+'.mp3" url_ready=1></a>');
                  utilsNode.appendChild(dlnk);
                  if (vkopt.audio.download_file(dlnk))
                     dlnk.click();
                  setTimeout(function(){
                     re(dlnk);
                  },200);
               }
               return true;
            },
            '<div></div>',// button content
            'data-aid="{vals.fullId}" data-reqaid="{vals.fullId}_{vals.actionHash}_{vals.urlHash}" id="vk_get_link_{vals.fullId}" href="" onmouseover="vkopt.audio.check_dl_url(this);"',//custom_attributes
            'a'
         ]);
      }
      if (vkopt.settings.get('audio_skip_button') && gpeByClass('audio_section__current', audioEl)){ // для текущего плейлиста кнопку "воспроизветси следующей" зажали.
         // исправляем это поведение
         items.actions.push([
            "next",
            ap.setNext.bind(ap),
            "",
            'onmouseover="audioShowActionTooltip(this)"'
         ]);
         // добавляем кнопку исключения из плейлиста без мгновенного удаления из него
         items.actions.push([
            'skip_track',
            function(audioEl, audioObject, audio){
               // Удалить из текущего плейлиста
               vkopt.audio.acts.skip(audioEl, audioObject.fullId);
            },
            '',//'<div class="vko_skip"></div>',
            'onmouseover="showTooltip(this,{text:\'{lng.Skip_pl}\',black:1,shift:[7,5,0],needLeft:true})"'
         ]);
      }
      return items;
   },
   acts: {
      buttons: function(audioEl, event, forceRedraw){
         var add_items = function(){
            var
               audio = AudioUtils.getAudioFromEl(audioEl),
               audioObject = AudioUtils.getAudioFromEl(audioEl, !0),
               actions = [],
               moreActions = [],
               extra = AudioUtils.getAudioExtra(audioObject);


            /* actions[] item format
            [
               id,
               onclick_function(audioEl, audioObject, audio),
               button_content,
               custom_attributes
            ]
            */
            var
               acts_wrap = geByClass1('_audio_row__actions', audioEl),
               info_wrap = geByClass1("_audio_row__info", audioEl),
               more_btn = geByClass1("_audio_row__action_more", audioEl);
               more_wrap = geByClass1("_audio_row__more_actions", audioEl);

            // если нет места под кнопки, делаем его
            if (!acts_wrap){
               acts_wrap = se('<div class="_audio_row__actions audio_row__actions"></div>');
               info_wrap.appendChild(acts_wrap);
            }

            if (!more_btn){
               actions.push(['more']);
               //more_btn = se('<div class="_audio_row__more_actions audio_row__more_actions"></div>');
               //acts_wrap.appendChild(more_btn);
            } else { // пробуем выдрать элемент с доп. действиями из экземпляра ElementTooltip
               var ett = data(more_btn, 'ett'); // получаем экземпляр ElementTooltip
               if (ett){
                  more_wrap = ett.getOptions().content || ett.getContent(); //getContent() возвращает контент, только если тултип показан. UPD: почему-то возвращает чужой элемент.
                  more_wrap = geByClass1('_audio_row__more_actions', more_wrap) || more_wrap;
               }
            }

            addClass(acts_wrap, 'vk_acts_added');

            // если нет меню действий, то добавляем
            if (!more_wrap){
               more_wrap = se('<div class="_audio_row__more_actions audio_row__more_actions"></div>');

               var
                  eltt_content = gpeByClass("_eltt_content", audioEl),
                  opts = eltt_content ? {appendTo : eltt_content} : {appendToParent : true};

               opts = extend({
                  cls : "_audio_row__tt",
                  defaultSide : "bottom",
                  rightShift : 20,
                  content : more_wrap,
                  bottomGap : 200,
                  preventSideChange : !0,
                  autoShow : !0,
                  onFirstTimeShow : function () {
                     this.getOptions().bottomGap = 0
                  },
                  onHide : function () {
                     data(audioEl, "leaved") && AudioUtils.onRowLeave(audioEl)
                  }
               }, opts)
               //data(audioEl, "tt", new ElementTooltip(more_btn, opts))
            }

            var acts = vkopt_core.plugins.call_modules('onAudioRowItems', audioEl, audioObject, audio);
            for (var plug_id in acts){
                  var items = acts[plug_id];
                  if (items.actions)
                     actions = actions.concat(items.actions);
                  if (items.more)
                     moreActions = moreActions.concat(items.more);
            }

            var ref = geByClass1('acts_wrap', 'audio_row__action');
            each(actions, function (e, i) {
               var tag = i[4] || 'button';
               var o = se(vk_lib.tpl_process(
                     '<'+tag+' data-action="' + i[0] + '" class="audio_row__action audio_row__action_' + i[0] + " _audio_row__action_" + i[0] + '" ' + (i[3] || "") + ">" + (i[2] || "") + '</'+tag+'>',
                     audioObject
               ));
               o.addEventListener("click", function (t) {
                  return i[1] && i[1].call(window, audioEl, audioObject, audio),
                  cancelEvent(t)
               });
               if (ref)
                  acts_wrap.insertBefore(o, ref)
               else
                  acts_wrap.appendChild(o)
            });
            if (actions[0] && actions[0][0] == 'more'){
               more_btn = geByClass1('audio_row__action_more', acts_wrap);
               data(audioEl, "tt", new ElementTooltip(more_btn, opts))
            }

            if (moreActions.length && more_btn){
               each(moreActions, function (e, item) {
                  var a = se(rs(AudioUtils.AUDIO_ROW_ACTION_ROW_ITEM, item));
                  a.addEventListener("click", function (t) {
                     return item[1].call(window, audioEl, audioObject),
                     cancelEvent(t)
                  }),
                  more_wrap.appendChild(a)
               });

            };
            data(audioEl, "actions", 1);
            if(moreActions.length > 0 || actions.length > 0)
               setStyle(geByClass1("_audio_row__duration", audioEl), "visibility", "hidden");
         }
         if (geByClass1('vk_acts_added', audioEl))
            return;
         clearTimeout(vkopt.audio.__onrowover);
         vkopt.audio.__onrowover = setTimeout(add_items, 20);
      },
      wiki: function(full_id,oid,id){
         var code = vk_lib.tpl_process(vkopt.audio.tpls['wiki_code'], {
               full_id: full_id,
               aid: id,
               oid: oid,
               oid_abs: Math.abs(oid),
               oid_type: (parseInt(oid)>0?'id':'gid')
         });
         vkAlertBox('Wiki-code:',code);
      },
      skip: function (audioEl, id) {
          var row = audioEl;//gpeByClass("audio_row", ev.target);
          if (hasClass(row, 'audio_row__added_next') || !hasClass(row, 'audio_skipped')){ // наличие класса .audio_row__added_next разрешает убрать трек из очереди
             // при добавлении трека после исключения обратно в очередь следующим,
             // нужно чтоб класс .audio_row__added_next перекрывал визуальто стиль от .audio_skipped
             // т.е тут роль костыля будет играть класс .audio_row__added_next.audio_skipped{opacity:1}
             // вместо того, чтоб делать инъекцию в setNext для удаления класса audio_skipped
             getAudioPlayer().getCurrentPlaylist().removeAudio(id);
             addClass(row, "audio_skipped");
             removeClass(row, "audio_row__added_next"); // чтоб трек можно было вернуть в очередь
          }
      }
   }
};

vkopt['hls'] = {
   css: function(){
      return vk_lib.get_block_comments(function(){
      /*css:
         .vk_grab_progress {
             height: 3px;
             background: #6b96cf;
             position: absolute;
             bottom: 0px;
             width: 50%;
         }

         .vk_grab_progress:before {
             content: attr(data-progress)'%';
             position: absolute;
             right: 0px;
             font-size: 10px;
             margin-top: -5px;
             background: #6b96cf;
             padding: 1px 4px;
             color: #FFF;
             font-weight: bold;
             border-radius: 4px;
         }
      */
      }).css
   },
   grab: function(m3u8, opts){
      var
         onSegmentReady = opts.onSegmentReady || null,
         onDone = opts.onDone || null,
         onProgress = opts.onProgress || null;

      var url_create = window.URL.createObjectURL;
      var url_revoke = window.URL.revokeObjectURL;
      window.URL.createGrabObjectURL = function(ms) {
         if (ms instanceof MediaGrabSource){
            vkopt.log('coURL ', ms);
            ms.emit('sourceopen'); //new
            return 'test://';
         } else
            return url_create(ms);
      };
      window.URL.revokeGrabObjectURL = function(ms) {
         if (ms instanceof MediaGrabSource){
            vkopt.log('roURL ', ms);
            return true;
         } else
            return url_revoke(ms);
      };

      function HTML5MediaElement(){}
      HTML5MediaElement.prototype = Object.create(EventEmitter.prototype)
      var mel = new HTML5MediaElement();
      extend(mel,{
         addEventListener: mel.addListener,
         pause: function() {
            vkopt.log('Paused');
            mel.emit('pause');
            mel.emit('play');
            return false;
         },
         preload: 'auto',
         buffered: {},
         duration: 1,
         seeking: false,
         height: 1080,
         width: 1920,
         loop: false,
         played: {},
         removeAttribute: function(attr){},
         load: function(l){vkopt.log('Load:',this)},
         canPlayType: function(codec){vkopt.log('Got asked about:'+codec); return 'probably'},
         nodeName: 'audio',
         playbackQuality: {},
         getVideoPlaybackQuality: function() {return mel.playbackQuality},
         addTextTrack: function(tt){vkopt.log('Adding textTrack ',tt); return [{}]},
         textTracks: {
            addEventListener: function(e,cb) {
               vkopt.log('** Adding eventListener: '+e);
            }
         }
      })

      function SourceGrabBuffer(mimetype){
            EventEmitter.call(this);
            this._mimetype = mimetype;
            return this;
      }
      SourceGrabBuffer.prototype =  Object.create(EventEmitter.prototype);
      var sgb = SourceGrabBuffer.prototype;
      sgb.addEventListener = function(eventName, callback) {
         this.addListener(eventName, callback);
         //vkopt.log('sgb addEventListener '+eventName);
      }
      sgb.appendBuffer = function(data) {
         //vkopt.log('append: ', data.length, 'bytes ', this._mimetype);
         var that = this;
         onSegmentReady && onSegmentReady(data, this._mimetype);
         setTimeout(function(){
            that.emit('onupdateend');
            that.emit('updateend');
         },5);
      }
      Object.defineProperty(sgb, "buffered", {
          get: function buffered() {
               return [];
          }
      });
      Object.defineProperty(sgb, "mode", {
          get: function mode() {
               return '';
          }
      });
      SourceGrabBuffer.prototype.constructor = SourceGrabBuffer;

      function MediaGrabSource(){
         EventEmitter.call(this);
         this.readyState = 'closed';
         this._sb = {};
         return this;
      }
      MediaGrabSource.prototype =  Object.create(EventEmitter.prototype);
      var mgs = MediaGrabSource.prototype;
      extend(mgs,{
         addEventListener: function(eventName,callback) {
            //vkopt.log('MediaGrabSource addEventListener: '+eventName);
            this.addListener(eventName,callback);
            this.readyState = 'open';
            //vkopt.log(Object.keys(this._sb).length);
            if (eventName == 'sourceopen') {
               vkopt.log('Fired: '+eventName);
               //this.emit(eventName,this);
            }
         },
         removeEventListener: function(eventName,b) {
            this.removeListener(eventName,b);
         },
         addSourceBuffer: function(mimetype) {
            vkopt.log('MediaGrabSource new buffer for '+mimetype);
            var nb = new SourceGrabBuffer(mimetype);
            this._sb[mimetype] = nb;
            return nb;
         },
         endOfStream: function(error) {
            vkopt.log('** End of stream: '+error);
            mel.emit('ended');
            // onDone();
         },
         isTypeSupported: function(codec){return true}
      });
      Object.defineProperty(mgs, "sourceBuffers", {
          get: function sourceBuffers() {
               var a = [];
               for (var sb in this._sb) {
                  a.push(this._sb[sb]);
               }
               return a;
          }
      });
      MediaGrabSource.isTypeSupported = function(codec){return true}

      var get_module=function(js){
         var exports = {};
          eval(js);
          return exports;
      }
      var modify_hls = function(js){
         js = js.replace(/window\.MediaSource/g,'MediaGrabSource')
                .replace(/window\.SourceBuffer/g,'SourceGrabBuffer')
                .replace(/\.createObjectURL/g,'.createGrabObjectURL')
                .replace(/\.revokeObjectURL/g,'.revokeGrabObjectURL');
         return js;
      }

      var Hls = {};

      function downloadHls(url) {
         var
            startSN = 0,
            endSN = 0;

         var hls = new Hls({debug:false,autoStartLoad:true});
         hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            vkopt.log("hls.js attached to grabber");
            hls.loadSource(url);
         });

         hls.on(Hls.Events.BUFFER_EOS,function(event_name, info){
            vkopt.log('GRABBER DONE: ',Hls.Events.FRAG_LOADED);
            onDone && onDone();

         });

         hls.on(Hls.Events.FRAG_LOADED,function(event_name, info){
            if (info && info.frag && info.frag.sn)
               setTimeout(function(){
                  onProgress && onProgress(info.frag.sn - startSN, endSN - startSN);
               },30);
         });

         hls.on(Hls.Events.MANIFEST_PARSED,function(n,m) {
            vkopt.log('manifest_parsed', m);
            startSN = m.levels[0].details.startSN
            endSN = m.levels[0].details.endSN
            mel.paused = false;
            mel.currentTime = 0;
            mel.emit('pause');
            mel.emit('playing');
         });
         hls.attachMedia(mel);
      }

      AjGet('/js/lib/hls.min.js', function(js){
         Hls = get_module(modify_hls(js)).Hls;
         downloadHls(m3u8);
      });
   },
   download: function(url, file_name, aid){
      var buff = {
         type: '',
         data:[]
      };

      var draw_progress = function(percent, aid){
         //vkopt.log(percent,'%');
         var els = geByClass('_audio_row_'+aid);
         for (var i = 0; i < els.length; i++){
            var bar = geByClass1('vk_grab_progress', els[i]);
            if (!bar){
               bar = se('<div class="vk_grab_progress"></div>');
               els[i].insertBefore(bar, els[i].firstChild);
            }
            show(bar);
            bar.dataset['progress'] = percent;
            bar.style.width = percent+'%';
         }
      };
      var hide_progress = function(aid){
         var els = geByClass('_audio_row_'+aid);
         for (var i = 0; i < els.length; i++){
            var bar = geByClass1('vk_grab_progress', els[i]);
            bar && re(bar);
         }
      };
      vkopt.hls.grab(url, {
         onSegmentReady: function(data, type){
            buff.type = type;
            buff.data.push(data);
         },
         onDone: function(){
            setTimeout(function(){
               hide_progress(aid);
            },500);
            var url_create = (window.URL || window.webkitURL || window.mozURL || window).createObjectURL;

            var data = new Blob(buff.data,{type:buff.type});
            var url = url_create(data)

            var dlnk = document.createElement('a');
            dlnk.href = url;
            dlnk.download = file_name;
            (window.utilsNode || document.body).appendChild(dlnk)
            dlnk.click();
            setTimeout(function(){
               re(dlnk);
               //url_revoke(url);
            },200);
         },
         onProgress: function(cur, total){
            if (total == 0) return;
            var pc = Math.round(cur/total*100);
            draw_progress(pc, aid);
         }
      });
   }

}

// Scrobbling API documentation: http://users.last.fm/~tims/scrobbling/scrobbling2.html
vkopt['scrobbler'] = {
   css: function(){
      return '\
      .lastfm_audio_page{position: absolute;margin-top: -20px;margin-left: 5px;} \
      .top_audio_player_title_wrap .lastfm_status{position:fixed; z-index: 121; margin-left: 10px;}\
      .lastfm_white .vk_lastfm_icon{background-image:url("'+vkopt.scrobbler.res.white.last_fm+'");}\
      .lastfm_white .vk_lastfm_playing_icon{background-image:url("'+vkopt.scrobbler.res.white.playing_icon+'");}\
      .lastfm_white .vk_lastfm_paused_icon{background-image:url("'+vkopt.scrobbler.res.white.paused_icon+'");}\
      .lastfm_white .vk_lastfm_ok_icon{background-image:url("'+vkopt.scrobbler.res.white.scrobble_ok+'");}\
      .lastfm_white .vk_lastfm_fail_icon{background-image:url("'+vkopt.scrobbler.res.white.scrobble_fail+'");}\
      .lastfm_white .lastfm_fav_icon{background-position: 0 -10px;}\
      \
      .vk_lastfm_icon{cursor:pointer; height:16px; width:16px; margin-left: 2px; background:url("'+vkopt.scrobbler.res.blue.last_fm+'") 50% 50% no-repeat;}\
      .vk_lastfm_icon.disabled{opacity:0.5;}\
      .lastfm_fav_icon{cursor:pointer; background:url(\'/images/icons/like.gif\'); width:10px; height:10px; margin-top:4px; margin-left:1px; opacity:0.4 }\
      .lastfm_fav_icon:hover{opacity:0.7;}\
      .lastfm_fav_icon.loved{opacity:1;}\
      \
      .vk_lastfm_playing_icon{float:left; height:16px; width:11px; background:url("'+vkopt.scrobbler.res.blue.playing_icon+'") 50% 50% no-repeat;}\
      .vk_lastfm_paused_icon{float:left; height:16px; width:11px; background:url("'+vkopt.scrobbler.res.blue.paused_icon+'") 50% 50% no-repeat;}\
      .vk_lastfm_ok_icon{float:left; height:16px; width:8px; background:url("'+vkopt.scrobbler.res.blue.scrobble_ok+'") 0 50% no-repeat;}\
      .vk_lastfm_fail_icon{float:left; height:16px; width:8px; background:url("'+vkopt.scrobbler.res.blue.scrobble_fail+'") 0 50% no-repeat;}\
      \
      .gp_tip_text a{color:#FFF}\
      .lastfm_status{width:40px;}\
      .lastfm_status{width:40px;}\
      ';
   },
   api_key:"8077e41f067a717abb49db6159081cb5",
   api_secret:"e13a67e7e53c3c26d3734eefe34259a3",
   res:{
      white:{
         last_fm:'data:image/png;base64,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',
         playing_icon:'data:image/gif;base64,R0lGODlhCwALAIABAP///////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0J6SFDpYT5Y35AYeBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdAF5MUKqKp82HVwcGBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0F6EScoKLQ2a7wYGBQAh+QQJBQABACwAAAAACwALAAACE4yPqQqw1l6IL1JkHXT59CuFQQEAIfkECQUAAQAsAAAAAAsACwAAAhGMj6nLBtBehElaGm7GWrZ/FAAh+QQJBQABACwAAAAACwALAAACEoyPqcuNABQMM8364o1mU+6EBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdABp8Mc1bqZ4GawcGBQAh+QQJBQABACwAAAAACwALAAACFIyPqbsAHByShtZ347OyYw1a0BgUACH5BAUFAAEALAAAAAALAAsAAAIRjI+pyx0AGpRxTmNrxPptBxYAIfkECQUAAQAsAgAEAAgAAgAAAgWMjwGgUAAh+QQFBQABACwAAAAACwALAAACDIyPqcuNABp0tFpbAAA7',
         paused_icon:'data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///////wAAACH5BAEAAAIALAAAAAALAAsAAAINlI+py+0PYQhiVhpbAQA7',
         scrobble_ok:'data:image/png;base64,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',
         scrobble_fail:'data:image/png;base64,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'
      },
      blue:{
         last_fm:'data:image/png;base64,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',
         playing_icon:'data:image/gif;base64,R0lGODlhCwALAIABAFBykv///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0J6SFDpYT5Y35AYeBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdAF5MUKqKp82HVwcGBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsG0F6EScoKLQ2a7wYGBQAh+QQJBQABACwAAAAACwALAAACE4yPqQqw1l6IL1JkHXT59CuFQQEAIfkECQUAAQAsAAAAAAsACwAAAhGMj6nLBtBehElaGm7GWrZ/FAAh+QQJBQABACwAAAAACwALAAACEoyPqcuNABQMM8364o1mU+6EBQAh+QQJBQABACwAAAAACwALAAACEoyPqcsdABp8Mc1bqZ4GawcGBQAh+QQJBQABACwAAAAACwALAAACFIyPqbsAHByShtZ347OyYw1a0BgUACH5BAUFAAEALAAAAAALAAsAAAIRjI+pyx0AGpRxTmNrxPptBxYAIfkECQUAAQAsAgAEAAgAAgAAAgWMjwGgUAAh+QQFBQABACwAAAAACwALAAACDIyPqcuNABp0tFpbAAA7',
         paused_icon:'data:image/gif;base64,R0lGODlhCwALAJEAAAAAAP///1Bykv///yH5BAEAAAMALAAAAAALAAsAAAINnI+py+0PoRBjVhpbAQA7',
         scrobble_ok:'data:image/png;base64,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',
         scrobble_fail:'data:image/png;base64,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'
      }
   },
   debug:false,
   lastfm:null,
   session_key:null,
   username:null,
   token:null,
   last_track:{},
   scrobled: false,
   enable_scrobbling: false,

   onSettings:{
      Media:{
         scrobbler: {
            title: 'seScrobbler',
            need_reload: true
         }
      }
   },
   onLocation: function(){
      if (!vkopt.settings.get('scrobbler')) return;
      var fm=vkopt.scrobbler;
      if (nav.objLoc['act']=="vkscrobbler" && nav.objLoc['token']){
         vkopt.settings.set('lastfm_token', nav.objLoc['token']);
         fm.token=nav.objLoc['token'];
         fm.auth(function(){
            vkAlertBox(IDL('AuthBoxTitle'), IDL('AuthDone').replace(/<username>/g, vkopt.settings.get('lastfm_username')));
            setTimeout(function(){
               vkopt.cmd({act: 'scrobbler_auth'});
            },500);
         });
      }
      //vkopt.scrobbler.on_location();
   },
   onLibFiles: function(file_name){
      if (!vkopt.settings.get('scrobbler')) return;
      if (file_name=='audioplayer.js')
         /*  можно конечно по адекватному через метод AudioPlayer.prototype.on добавлять обработчики событий плеера в массив subscribers, но как оно себя поведёт  - надо проверять.
         var pl = getAudioPlayer(),
             pl.on(this, AudioPlayer.EVENT_UPDATE, function(){console.log('update ', arguments)}),
             pl.on(this, AudioPlayer.EVENT_PLAY, function(){console.log('play ', arguments)}),
             pl.on(this, AudioPlayer.EVENT_PAUSE, function(){console.log('pause ', arguments)});
         */
         Inj.End('AudioPlayer.prototype.notify', function(event_name, data, var1, var2){
            vkopt.scrobbler.onPlayerNotify(event_name, data, var1)
         });
   },
   onPlayerNotify: function(event_name, data, var1){
      /*
      if (['buffered','progress'].indexOf(event_name) == -1)
         console.log(event_name, data, var1);
      */
      var act = '';
      switch(event_name){
         case 'start':
            data && vkopt.scrobbler.onPlayerState('load');
            vkopt.scrobbler.onPlayerState('play');
            break;
         case 'pause':
            vkopt.scrobbler.onPlayerState('pause');
            break;
         case 'stop': // происходит только при разлогивании
            vkopt.scrobbler.onPlayerState('stop');
            break;
      }
   },

   timer:function(callback, delay) {
      var timerId, start, remaining = delay;
      var paused = true;
      this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
        paused=true;
      };
      this.resume = function() {
        if (!paused) return;
        start = new Date();
        if (timerId) window.clearTimeout(timerId);
        timerId = vkopt_core.timeout(callback, remaining);
        paused=false;
      };
      this.reset = function(){
         window.clearTimeout(timerId);
         remaining = delay;
         this.resume();
      };
      this.get_remaing = function(){
         return paused?remaining:(remaining-(new Date() - start));
      };
      this.kill=function(){
         window.clearTimeout(timerId);
         callback=null;
      };
      this.resume();
   },
   get_time:function(){
      return Math.round((new Date()).getTime()/1000)
   },
   clean:function(s){
      s=s.replace(/&#0+(\d+);/g,"&#$1;");
      return winToUtf(s);//s.replace(/&quot;|&amp;|&lt;|&gt;|&rsquo;|&#[0-9]{2}[0-9]*;/gi, ' ');//   |<|>|"|'
   },
   onInit:function(){
      var fm=vkopt.scrobbler;
      var md5=vkMD5;//from vk_lib.js
      fm.token = vkopt.settings.get('lastfm_token');
      fm.username = vkopt.settings.get('lastfm_username');
      fm.session_key = vkopt.settings.get('lastfm_session_key');
      fm.enable_scrobbling = vkopt.settings.get('lastfm_enable_scrobbling');
      function LastFM(options){ // sources: https://github.com/fxb/javascript-last.fm-api
         var apiKey=options.apiKey||'';
         var apiSecret=options.apiSecret||'';
         // https://ws.audioscrobbler.com/2.0/
         var apiUrl=options.apiUrl||'http://ws.audioscrobbler.com/2.0/';
         var cache=options.cache||undefined;var debug=typeof(options.debug)=='undefined'?false:options.debug;this.setApiKey=function(_apiKey){apiKey=_apiKey};this.setApiSecret=function(_apiSecret){apiSecret=_apiSecret};this.setApiUrl=function(_apiUrl){apiUrl=_apiUrl};this.setCache=function(_cache){cache=_cache};
         //original of library method internalCall  with JSONP/iframe requests:
         //var internalCall=function(params,callbacks,requestMethod){if(requestMethod=='POST'){var html=document.getElementsByTagName('html')[0];var frameName='lastfmFrame_'+new Date().getTime();var iframe=document.createElement('iframe');html.appendChild(iframe);iframe.contentWindow.name=frameName;iframe.style.display="none";var formState='init';iframe.width=1;iframe.height=1;iframe.style.border='none';iframe.onload=function(){if(formState=='sent'){if(!debug){setTimeout(function(){html.removeChild(iframe);html.removeChild(form)},1500)}};formState='done';if(typeof(callbacks.success)!='undefined'){callbacks.success()}};var form=document.createElement('form');form.target=frameName;form.action=apiUrl;form.method="POST";form.acceptCharset="UTF-8";html.appendChild(form);for(var param in params){var input=document.createElement("input");input.type="hidden";input.name=param;input.value=params[param];form.appendChild(input)};formState='sent';form.submit()}else{var jsonp='jsonp'+new Date().getTime();var hash=auth.getApiSignature(params);if(typeof(cache)!='undefined'&&cache.contains(hash)&&!cache.isExpired(hash)){if(typeof(callbacks.success)!='undefined'){callbacks.success(cache.load(hash))}return}params.callback=jsonp;params.format='json';window[jsonp]=function(data){if(typeof(cache)!='undefined'){var expiration=cache.getExpirationTime(params);if(expiration>0){cache.store(hash,data,expiration)}}if(typeof(data.error)!='undefined'){if(typeof(callbacks.error)!='undefined'){callbacks.error(data.error,data.message)}}else if(typeof(callbacks.success)!='undefined'){callbacks.success(data)}window[jsonp]=undefined;try{delete window[jsonp]}catch(e){}if(head){head.removeChild(script)}};var head=document.getElementsByTagName("head")[0];var script=document.createElement("script");var array=[];for(var param in params){array.push(encodeURIComponent(param)+"="+encodeURIComponent(params[param]))}script.src=apiUrl+'?'+array.join('&').replace(/%20/g,'+');head.appendChild(script)}};

         // internalCall method for vkopt with using XMLHTTPRequest:
         var internalCall = function (params, callbacks, requestMethod) {
            params.format = 'json';

            var onDone = function (data) {
               if (typeof(cache) != 'undefined') {
                  var expiration = cache.getExpirationTime(params);
                  if (expiration > 0) {
                     cache.store(hash, data, expiration)
                  }
               }
               if (typeof(data.error) != 'undefined') {
                  if (typeof(callbacks.error) != 'undefined') {
                     callbacks.error(data.error, data.message)
                  }
               } else if (typeof(callbacks.success) != 'undefined') {
                  callbacks.success(data)
               }
            };
            if (requestMethod != 'POST'){
               var hash = auth.getApiSignature(params);
               if (typeof(cache) != 'undefined' && cache.contains(hash) && !cache.isExpired(hash)) {
                  if (typeof(callbacks.success) != 'undefined') {
                     callbacks.success(cache.load(hash))
                  }
                  return
               }
            }
            var data = urlEncData(params);
            var url = apiUrl;
            if (requestMethod == 'GET')
               url += '?'+data.replace(/%20/g, '+');
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
               if (xhr.readyState == 4){
                  onDone(JSON.parse(xhr.responseText));
               }
            };
            xhr.open(requestMethod, url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            //xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); // Don't set this header, else request has fail
            requestMethod == 'POST' ? xhr.send(data) : xhr.send();
         };

         var call=function(method,params,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;internalCall(params,callbacks,requestMethod)};var signedCall=function(method,params,session,callbacks,requestMethod){params=params||{};callbacks=callbacks||{};requestMethod=requestMethod||'GET';params.method=method;params.api_key=apiKey;if(session&&typeof(session.key)!='undefined'){params.sk=session.key}params.api_sig=auth.getApiSignature(params);internalCall(params,callbacks,requestMethod)};this.album={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('album.addTags',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('album.getBuylinks',params,callbacks)},getInfo:function(params,callbacks){call('album.getInfo',params,callbacks)},getTags:function(params,session,callbacks){signedCall('album.getTags',params,session,callbacks)},removeTag:function(params,session,callbacks){signedCall('album.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('album.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('album.share',params,callbacks)}};this.artist={addTags:function(params,session,callbacks){if(typeof(params.tags)=='object'){params.tags=params.tags.join(',')}signedCall('artist.addTags',params,session,callbacks,'POST')},getCorrection:function(params,callbacks){call('artist.getCorrection',params,callbacks)},getEvents:function(params,callbacks){call('artist.getEvents',params,callbacks)},getImages:function(params,callbacks){call('artist.getImages',params,callbacks)},getInfo:function(params,callbacks){call('artist.getInfo',params,callbacks)},getPastEvents:function(params,callbacks){call('artist.getPastEvents',params,callbacks)},getPodcast:function(params,callbacks){call('artist.getPodcast',params,callbacks)},getShouts:function(params,callbacks){call('artist.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('artist.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('artist.getTags',params,session,callbacks)},getTopAlbums:function(params,callbacks){call('artist.getTopAlbums',params,callbacks)},getTopFans:function(params,callbacks){call('artist.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('artist.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('artist.getTopTracks',params,callbacks)},removeTag:function(params,session,callbacks){signedCall('artist.removeTag',params,session,callbacks,'POST')},search:function(params,callbacks){call('artist.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('artist.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('artist.shout',params,session,callbacks,'POST')}};this.auth={getMobileSession:function(params,callbacks){params={username:params.username,authToken:md5(params.username+md5(params.password))};signedCall('auth.getMobileSession',params,null,callbacks)},getSession:function(params,callbacks){signedCall('auth.getSession',params,null,callbacks)},getToken:function(callbacks){signedCall('auth.getToken',null,null,callbacks)},getWebSession:function(callbacks){var previuousApiUrl=apiUrl;apiUrl='http://ext.last.fm/2.0/';signedCall('auth.getWebSession',null,null,callbacks);apiUrl=previuousApiUrl}};this.chart={getHypedArtists:function(params,session,callbacks){call('chart.getHypedArtists',params,callbacks)},getHypedTracks:function(params,session,callbacks){call('chart.getHypedTracks',params,callbacks)},getLovedTracks:function(params,session,callbacks){call('chart.getLovedTracks',params,callbacks)},getTopArtists:function(params,session,callbacks){call('chart.getTopArtists',params,callbacks)},getTopTags:function(params,session,callbacks){call('chart.getTopTags',params,callbacks)},getTopTracks:function(params,session,callbacks){call('chart.getTopTracks',params,callbacks)}};this.event={attend:function(params,session,callbacks){signedCall('event.attend',params,session,callbacks,'POST')},getAttendees:function(params,session,callbacks){call('event.getAttendees',params,callbacks)},getInfo:function(params,callbacks){call('event.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('event.getShouts',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('event.share',params,session,callbacks,'POST')},shout:function(params,session,callbacks){signedCall('event.shout',params,session,callbacks,'POST')}};this.geo={getEvents:function(params,callbacks){call('geo.getEvents',params,callbacks)},getMetroArtistChart:function(params,callbacks){call('geo.getMetroArtistChart',params,callbacks)},getMetroHypeArtistChart:function(params,callbacks){call('geo.getMetroHypeArtistChart',params,callbacks)},getMetroHypeTrackChart:function(params,callbacks){call('geo.getMetroHypeTrackChart',params,callbacks)},getMetroTrackChart:function(params,callbacks){call('geo.getMetroTrackChart',params,callbacks)},getMetroUniqueArtistChart:function(params,callbacks){call('geo.getMetroUniqueArtistChart',params,callbacks)},getMetroUniqueTrackChart:function(params,callbacks){call('geo.getMetroUniqueTrackChart',params,callbacks)},getMetroWeeklyChartlist:function(params,callbacks){call('geo.getMetroWeeklyChartlist',params,callbacks)},getMetros:function(params,callbacks){call('geo.getMetros',params,callbacks)},getTopArtists:function(params,callbacks){call('geo.getTopArtists',params,callbacks)},getTopTracks:function(params,callbacks){call('geo.getTopTracks',params,callbacks)}};this.group={getHype:function(params,callbacks){call('group.getHype',params,callbacks)},getMembers:function(params,callbacks){call('group.getMembers',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('group.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('group.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('group.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('group.getWeeklyTrackChart',params,callbacks)}};this.library={addAlbum:function(params,session,callbacks){signedCall('library.addAlbum',params,session,callbacks,'POST')},addArtist:function(params,session,callbacks){signedCall('library.addArtist',params,session,callbacks,'POST')},addTrack:function(params,session,callbacks){signedCall('library.addTrack',params,session,callbacks,'POST')},getAlbums:function(params,callbacks){call('library.getAlbums',params,callbacks)},getArtists:function(params,callbacks){call('library.getArtists',params,callbacks)},getTracks:function(params,callbacks){call('library.getTracks',params,callbacks)}};this.playlist={addTrack:function(params,session,callbacks){signedCall('playlist.addTrack',params,session,callbacks,'POST')},create:function(params,session,callbacks){signedCall('playlist.create',params,session,callbacks,'POST')},fetch:function(params,callbacks){call('playlist.fetch',params,callbacks)}};this.radio={getPlaylist:function(params,session,callbacks){signedCall('radio.getPlaylist',params,session,callbacks)},search:function(params,session,callbacks){signedCall('radio.search',params,session,callbacks)},tune:function(params,session,callbacks){signedCall('radio.tune',params,session,callbacks)}};this.tag={getInfo:function(params,callbacks){call('tag.getInfo',params,callbacks)},getSimilar:function(params,callbacks){call('tag.getSimilar',params,callbacks)},getTopAlbums:function(params,callbacks){call('tag.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('tag.getTopArtists',params,callbacks)},getTopTags:function(callbacks){call('tag.getTopTags',null,callbacks)},getTopTracks:function(params,callbacks){call('tag.getTopTracks',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('tag.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('tag.getWeeklyChartList',params,callbacks)},search:function(params,callbacks){call('tag.search',params,callbacks)}};this.tasteometer={compare:function(params,callbacks){call('tasteometer.compare',params,callbacks)},compareGroup:function(params,callbacks){call('tasteometer.compareGroup',params,callbacks)}};this.track={addTags:function(params,session,callbacks){signedCall('track.addTags',params,session,callbacks,'POST')},ban:function(params,session,callbacks){signedCall('track.ban',params,session,callbacks,'POST')},getBuylinks:function(params,callbacks){call('track.getBuylinks',params,callbacks)},getCorrection:function(params,callbacks){call('track.getCorrection',params,callbacks)},getFingerprintMetadata:function(params,callbacks){call('track.getFingerprintMetadata',params,callbacks)},getInfo:function(params,callbacks){call('track.getInfo',params,callbacks)},getShouts:function(params,callbacks){call('track.getShouts',params,callbacks)},getSimilar:function(params,callbacks){call('track.getSimilar',params,callbacks)},getTags:function(params,session,callbacks){signedCall('track.getTags',params,session,callbacks)},getTopFans:function(params,callbacks){call('track.getTopFans',params,callbacks)},getTopTags:function(params,callbacks){call('track.getTopTags',params,callbacks)},love:function(params,session,callbacks){signedCall('track.love',params,session,callbacks,'POST')},removeTag:function(params,session,callbacks){signedCall('track.removeTag',params,session,callbacks,'POST')},scrobble:function(params,session,callbacks){if(params.constructor.toString().indexOf("Array")!=-1){var p={};for(i in params){for(j in params[i]){p[j+'['+i+']']=params[i][j]}}params=p}signedCall('track.scrobble',params,session,callbacks,'POST')},search:function(params,callbacks){call('track.search',params,callbacks)},share:function(params,session,callbacks){if(typeof(params.recipient)=='object'){params.recipient=params.recipient.join(',')}signedCall('track.share',params,session,callbacks,'POST')},unban:function(params,session,callbacks){signedCall('track.unban',params,session,callbacks,'POST')},unlove:function(params,session,callbacks){signedCall('track.unlove',params,session,callbacks,'POST')},updateNowPlaying:function(params,session,callbacks){signedCall('track.updateNowPlaying',params,session,callbacks,'POST')}};this.user={getArtistTracks:function(params,callbacks){call('user.getArtistTracks',params,callbacks)},getBannedTracks:function(params,callbacks){call('user.getBannedTracks',params,callbacks)},getEvents:function(params,callbacks){call('user.getEvents',params,callbacks)},getFriends:function(params,callbacks){call('user.getFriends',params,callbacks)},getInfo:function(params,callbacks){call('user.getInfo',params,callbacks)},getLovedTracks:function(params,callbacks){call('user.getLovedTracks',params,callbacks)},getNeighbours:function(params,callbacks){call('user.getNeighbours',params,callbacks)},getNewReleases:function(params,callbacks){call('user.getNewReleases',params,callbacks)},getPastEvents:function(params,callbacks){call('user.getPastEvents',params,callbacks)},getPersonalTracks:function(params,callbacks){call('user.getPersonalTracks',params,callbacks)},getPlaylists:function(params,callbacks){call('user.getPlaylists',params,callbacks)},getRecentStations:function(params,session,callbacks){signedCall('user.getRecentStations',params,session,callbacks)},getRecentTracks:function(params,callbacks){call('user.getRecentTracks',params,callbacks)},getRecommendedArtists:function(params,session,callbacks){signedCall('user.getRecommendedArtists',params,session,callbacks)},getRecommendedEvents:function(params,session,callbacks){signedCall('user.getRecommendedEvents',params,session,callbacks)},getShouts:function(params,callbacks){call('user.getShouts',params,callbacks)},getTopAlbums:function(params,callbacks){call('user.getTopAlbums',params,callbacks)},getTopArtists:function(params,callbacks){call('user.getTopArtists',params,callbacks)},getTopTags:function(params,callbacks){call('user.getTopTags',params,callbacks)},getTopTracks:function(params,callbacks){call('user.getTopTracks',params,callbacks)},getWeeklyAlbumChart:function(params,callbacks){call('user.getWeeklyAlbumChart',params,callbacks)},getWeeklyArtistChart:function(params,callbacks){call('user.getWeeklyArtistChart',params,callbacks)},getWeeklyChartList:function(params,callbacks){call('user.getWeeklyChartList',params,callbacks)},getWeeklyTrackChart:function(params,callbacks){call('user.getWeeklyTrackChart',params,callbacks)},shout:function(params,session,callbacks){signedCall('user.shout',params,session,callbacks,'POST')}};this.venue={getEvents:function(params,callbacks){call('venue.getEvents',params,callbacks)},getPastEvents:function(params,callbacks){call('venue.getPastEvents',params,callbacks)},search:function(params,callbacks){call('venue.search',params,callbacks)}};var auth={getApiSignature:function(params){var keys=[];var string='';for(var key in params){keys.push(key)}keys.sort();for(var index in keys){var key=keys[index];string+=key+params[key]}string+=apiSecret;return md5(string)}}
      }
      fm.lastfm = new LastFM({
					apiKey: fm.api_key,
					apiSecret: fm.api_secret,
               apiUrl: location.protocol+'//ws.audioscrobbler.com/2.0/',
					debug: fm.debug
				});
      // fm.listen_storage();
   },
   onCmd: function(data){
      if (data && data.act == 'scrobbler_auth'){
         var fm=vkopt.scrobbler;
         fm.token = vkopt.settings.get('lastfm_token');
         fm.username = vkopt.settings.get('lastfm_username');
         fm.session_key = vkopt.settings.get('lastfm_session_key');
         fm.enable_scrobbling = vkopt.settings.get('lastfm_enable_scrobbling');
         vkopt.log('scrobbler auth');
      }
   },
   /* TODO: сделать отсылку события о новом токене во все вкладки
   listen_storage:function(){
      var fm=vkopt.scrobbler;
      if (window.opera || vkbrowser.safari || vkbrowser.chrome){ // Note: Opera and WebKits listens on window
				window.addEventListener('storage', fm.on_storage, false);
		} else { // Note: FF listens on document.body or document
				document.body.addEventListener('storage', fm.on_storage, false);
		}
   },
   on_storage:function(e){
      var fm=vkopt.scrobbler;
      if (e.key=='lastfm_username'){
         fm.token=localStorage['lastfm_token'];
         fm.username=localStorage['lastfm_username'];
         fm.session_key=localStorage['lastfm_session_key'];

      }
   },
   */
   auth:function(callback){
      var fm=vkopt.scrobbler;
      fm.lastfm.auth.getSession({token: fm.token}, {success: function(data){
         fm.username = data.session.name;    // имя пользователя.
         fm.session_key = data.session.key;  // ключ
         vkopt.settings.set('lastfm_username', fm.username);
         vkopt.settings.set('lastfm_session_key', fm.session_key);

         if (callback) callback();
      }, error: function(code){
         if (code == 4)// токен сдох
            if (!fm.connect_box || !fm.connect_box.isVisible()){
               fm.connect_box=vkAlertBox(IDL('AuthBoxTitle'), IDL('AuthBoxText'), function(){
                  var url = 'http://www.last.fm/api/auth?api_key=' + fm.api_key + '&cb=' + encodeURIComponent(location.protocol+'//' + location.host + '/settings?act=vkscrobbler');
                  window.open(url,'_blank','');
                  //location.href = url;
               }, function(){
                  if (fm.enable_scrobbling) fm.toggle(true);
               });
            }
      }});
   },
   logout:function(){
      var fm=vkopt.scrobbler;
      vkAlertBox(IDL('AuthBoxTitle'), IDL('LogoutSubmit').replace(/<username>/g, vkopt.settings.get('lastfm_username')), function(){
         vkopt.settings.set('lastfm_token', '');
         vkopt.settings.set('lastfm_username', '');
         vkopt.settings.set('lastfm_session_key', '');
         fm.token = '';
         fm.username = 'NO_AUTH';
         fm.session_key = '';
         if (fm.enable_scrobbling) fm.toggle();
         //fm.enable_scrobbling=parseInt(localStorage['lastfm_enable_scrobbling']);
         //location.href = url;
      }, true);
      return false;
   },
   scrobble:function(audio_info,ts){
      var fm=vkopt.scrobbler;
      if (!fm.enable_scrobbling) return;

      if (!fm.session_key) {
         fm.auth(function(){fm.scrobble(audio_info)});
         return;
      }

      // отправляем last.fm
      fm.lastfm.track.scrobble({
         artist: audio_info.artist,
         track: audio_info.title,
         duration: audio_info.duration,
         timestamp: ts
      },
      {
         key: fm.session_key
      },
      {success: function(){
         fm.set_icon(audio_info,'scrobled');
      }, error: function(code, message){
         if (code==4 || code==9) fm.auth();
         fm.set_icon(audio_info,'scrobled_fail');
         vkopt.log('scrobbler_error ['+code+']:'+message);
      }});
      fm.scrobled = true;
      fm.s_timer && fm.s_timer.kill();
      // show scrobble ok
   },
   now_playing: function(audio_info){
      var fm=vkopt.scrobbler;
      if (!fm.enable_scrobbling) return;
      if (!fm.session_key) {
         fm.auth(function(){fm.now_playing(audio_info)});
         return;
      }
      fm.lastfm.track.updateNowPlaying({
         artist: audio_info.artist,
         track: audio_info.title,
         duration: audio_info.duration,
         timestamp: fm.get_time()
      },
      {
         key: fm.session_key
      },
      {
         success: function(data){},
         error: function(code){
            if (code==4 || code==9) fm.auth();
         }
      });
	},
   love:function(){
      if (vk_DEBUG) console.log('last.fm love track');
      var fm=vkopt.scrobbler;
      var audio_info=fm.audio_info();
      fm.lastfm.track.love({
            artist: audio_info.artist,
            track: audio_info.title
         },
         {
            key: fm.session_key
         },
         {success: function(data){
            //showDoneBox('loved',{out:800});
            //console.log('love done');
         }, error: function(code, message){
            if (code==4 || code==9) fm.auth();
            vkopt.log('last.fm error ['+code+']:'+message);
      }});

   },
   unlove:function(){
      if (vk_DEBUG) console.log('last.fm unlove track');
      var fm=vkopt.scrobbler;
      var audio_info=fm.audio_info();
      fm.lastfm.track.unlove({
            artist: audio_info.artist,
            track: audio_info.title
         },
         { key: fm.session_key },
         {
            success: function(data){
               //showDoneBox('unlove',{out:800});
               //console.log('unlove done');
            },
            error: function(code, message){
               if (code==4 || code==9) fm.auth();
               vkopt.log('last.fm error ['+code+']:'+message);
            }
      });
   },
   set_love_icon:function(is_loved){
      var els=geByClass('lastfm_fav_icon');
      for (var i=0; i<els.length;i++){
         var el=els[i];
         (is_loved?removeClass:addClass)(el,'loved');

         if (el.tt) el.tt.hide();
         el.onmouseover=function(e){
            var el=e.target;
            var text=!hasClass(el,'loved')?IDL('LastFMAddToLoved'):IDL('LastFMRemoveFromLoved');

            if (el.tt && el.tt.container) {
               val(geByClass1('tt_text', el.tt.container), text);
            }
            showTooltip(el, {
               content: '<div class="tt_text">' + text + '</div>',
               showdt: 0, black: 1, shift: [15, 4, 0]});
         }
      }
   },
   on_love_btn:function(el){
      var fm=vkopt.scrobbler;
      var is_loved=hasClass(el,'loved');
      if (is_loved){
         fm.unlove();
      } else {
         fm.love();
      }
      fm.set_love_icon(is_loved);
   },
   get_loved:function(){
      var fm=vkopt.scrobbler;

      if (!fm.loved_tracks){
         fm.lastfm.user.getLovedTracks({user:fm.username,limit:1000},{
               success: function(data) {
                  if (vk_DEBUG) console.log(data);
                  fm.loved_tracks=data.lovedtracks;
               },
               error: function(code, message) {
                  if (vk_DEBUG) console.log(code, message)
               }
            });
      }
   },
   scrobble_timer:function(audio_info){
      var fm=vkopt.scrobbler;
      if (fm.s_timer){
         fm.s_timer.pause();
         fm.s_timer.kill();
      }// отключение несработавшего таймера
      if (audio_info.duration>30){ // The track must be longer than 30 seconds.
         var delay = Math.min(240,audio_info.duration/2)*1000; //And the track has been played for at least half its duration, or for 4 minutes (whichever occurs earlier.)
         var ts=fm.get_time();
         fm.s_timer = new fm.timer(function(){
            fm.scrobble(audio_info,ts); // скробблим при срабатывании таймера
         },delay);
      }
   },
   audio_info:function(){
      var fm=vkopt.scrobbler;
      if (!(window.AudioUtils)) return {};
      var cur_audio = AudioUtils.asObject(getAudioPlayer().getCurrentAudio());
      var a = cur_audio || {title:'', performer: ''};
      return {
         title    :fm.clean(a.title),
         artist   :fm.clean(a.performer),
         duration :a.duration,
         url      :a.url,
         oid      :a.owner_id,
         aid      :a.id
      };
   },
   tip:function(el,text, opts){
         var dx, dy1, dy2;
         opts = opts || {};
         dx=7;
         dy1=-13;
         dy2=-12;
         if (el.tt && el.tt.container) {
            val(geByClass1('tt_text', el.tt.container), text);
         }
         showTooltip(el, {
            content: '<div class="tt_text">' + text + '</div>',
            //className: 'slider_hint',
            black: 1,
            shift: [4 + intval(dx), 13 + intval(dy1), 16 + intval(dy2)],
            showdt:300,
            hidedt:300,
            onHide:opts.onHide,
            onShowStart:opts.onShowStart
         });
   },
   ui:function(){
     var fm=vkopt.scrobbler;
     var controls= // TODO: в шаблоны
         '<div class="lastfm_status">\
            <div class="fl_l lastfm_status_icon"></div>\
            <div class="fl_r vk_lastfm_icon'+(fm.enable_scrobbling?'':' disabled')+'" onclick="vkopt.scrobbler.toggle(); cancelEvent(event); return false;"  onmousedown="cancelEvent(event)"></div>\
            <div class="fl_r lastfm_fav_icon" onclick="vkopt.scrobbler.on_love_btn(this); cancelEvent(event); return false;"></div>\
         </div>';

     var volume_wraps = geByClass('audio_page_player_volume_wrap');
     for (var i = 0; i < volume_wraps.length; i++){
        var ap = volume_wraps[i].firstChild;
        if (ap && !geByClass('lastfm_status',ap.parentNode)[0]){
            ap.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_audio_page'},controls),ap);
        }
     }

     var top_ap_wraps = geByClass('top_audio_player_title_wrap');
     for (var i = 0; i < top_ap_wraps.length; i++){
        var ap = top_ap_wraps[i].firstChild;
        if (ap && !geByClass('lastfm_status',ap.parentNode)[0]){
            ap.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_white'},controls),ap);
        }
     }

     var els=geByClass('vk_lastfm_icon');
     for (var i=0; i<els.length;i++){
         els[i].onmouseover=
         (function(z){
            return function(){
               var text=(fm.enable_scrobbling?IDL('ScrobblingOn'):IDL('ScrobblingOff')).replace(/<username>/g,fm.username);
               text+=' <a href="#" onclick="return vkopt.scrobbler.logout();">'+IDL('Logout')+'</a>';
               if (!fm.username || fm.username == 'NO_AUTH') text=IDL('AuthNeeded');
               fm.tip(els[z],text);
            }
         })(i);

     }
   },
   toggle:function(hide_tooltip){
      var fm=vkopt.scrobbler;

      fm.enable_scrobbling=!fm.enable_scrobbling;
      var els=geByClass('vk_lastfm_icon');
      for (var i=0; i<els.length;i++){
         var el=els[i];//ge('vk_lastfm_icon');
         if (!fm.enable_scrobbling){
            addClass(el,'disabled');
            if (fm.s_timer) fm.s_timer.pause();
            fm.set_icon();
         } else {
            if (!fm.session_key) {
               fm.auth();
            }
            removeClass(el,'disabled');
            fm.s_timer && fm.s_timer.reset();
         }

      }
      vkopt.settings.set('lastfm_enable_scrobbling', fm.enable_scrobbling);
      fm.set_icon();
      for (var i=0; i<els.length && !hide_tooltip ;i++){
         els[i].onmouseover();
      }
   },
   set_icon:function(audio_info,icon){
      var fm=vkopt.scrobbler;

      var set=function(func){
         var els=geByClass('lastfm_status_icon');
         for (var i=0; i<els.length;i++){
            //alert(els[i]);
            if (icon){
               removeClass(els[i],'vk_lastfm_playing_icon');
               removeClass(els[i],'vk_lastfm_paused_icon');
               removeClass(els[i],'vk_lastfm_ok_icon');
               removeClass(els[i],'vk_lastfm_fail_icon');
            }
            func(els[i]);
         }
         var vis=isVisible(els[0]);
         var els=geByClass('lastfm_fav_icon');
         for (var i=0; i<els.length;i++){
            (vis?show:hide)(els[i]);
         }
      };

      //var el=ge('vk_lastfm_status_icon');
      set(function(el){
         if (icon)
         switch (icon) {
            case 'playing':
               show(el);
               el.onmouseover=function(){
                  var time=function(){
                     return (new Date(fm.s_timer.get_remaing())).format('MM:ss');
                  };
                  var text=IDL('TimeRemaining').replace('<time>','<span class="lastfm_timer">'+time()+'</span>');
                  //if (fm.scrobled) text=fm.lang['TrackPassed']
                  var upd=null;
                  fm.tip(el, text,   {
                     onHide:function(){ clearInterval(upd); },
                     onShowStart:function(tt){
                        var t=geByClass('lastfm_timer',tt.container)[0];
                        upd=setInterval(function(){
                           if (t)
                              t.innerHTML=time();
                           else
                              clearInterval(upd);

                        },1000);
                     }
                  });
               };
               addClass(el,'vk_lastfm_playing_icon');//el.className='vk_lastfm_playing_icon';
               break;
            case 'paused':
               show(el);
               addClass(el,'vk_lastfm_paused_icon');//el.className='vk_lastfm_paused_icon';
               break;
            case 'scrobled':
               show(el);
               if (el.tt) el.tt.hide();
               el.onmouseover=function(){
                   fm.tip(el, IDL('TrackScrobbled'));
               };
               addClass(el,'vk_lastfm_ok_icon');//el.className='vk_lastfm_ok_icon';
               break;
            case 'scrobled_fail':
               show(el);
               if (el.tt) el.tt.hide();
               el.onmouseover=function(){
                  fm.tip(el, IDL('TrackNotScrobbled'));
               };
               addClass(el,'vk_lastfm_fail_icon');//el.className='vk_lastfm_fail_icon';
               break;
            case 'hide':
               hide(el);
               //el.className='';
               break;
         }

         if (!fm.enable_scrobbling){
            hide(el);
         } else /*if (el.className!='')*/ show(el);

         var el_s=ge('vk_lastfm_status_small_icon');
         if (el_s){
            el_s.className=el.className;
            (isVisible(el)?show:hide)(el_s);
         }

      });
   },
   onPlayerState:function(act){
      var fm=vkopt.scrobbler;
      var info=fm.audio_info();
      fm.ui();
      switch (act) {
         case 'load':
               if (fm.last_track.aid == info.aid) return;
               fm.set_love_icon(true);
               fm.last_track=info;
               vkopt.audio_info.view(info.artist,info.title);
               if (fm.s_timer) fm.s_timer.pause();
               fm.scrobled=false;
               fm.scrobble_timer(info);
               fm.now_playing(info);
               fm.set_icon(info,'playing');        // add scrobbler icon track
            break;
         case 'play':    //if (fm.last_track.aid!=info.aid){ } else { }
             vkopt.audio_info.view(info.artist,info.title);
             if (!fm.scrobled){
                if (!fm.s_timer)
                   fm.scrobble_timer(info);
                fm.s_timer && fm.s_timer.resume();
                fm.set_icon(info,'playing');          // animate scrobbler icon track
             }
            break;
         case 'pause':
            if (!fm.scrobled){
               if (!fm.s_timer)
                   fm.scrobble_timer(info);
               fm.s_timer && fm.s_timer.pause();
               fm.set_icon(info,'paused'); // pause scrobbler icon track (stop animate);
            }
            break;
         case 'stop':
            if (fm.s_timer) {
               fm.s_timer.pause();
               fm.s_timer.kill();
            }
            fm.set_icon(info,'hide');              // remove icons
            fm.last_track = {};
            break;
      }
   }
};

vkopt['audio_info'] = {
   onSettings:{
      Media:{
         /*
         audio_album_info: {
            title: 'seLoadAudioAlbumInfo'
         }
         */
      }
   },
   css: function(){
      return vk_lib.get_block_comments(function(){
      /*css:
      #vk_album_info {display:none;}
      .audio_layout #vk_album_info {display:block;}
      #vk_album_info h4{cursor:pointer; min-height:30px; padding:3px 10px; border: 0px;}
      #vk_album_info h4:hover{background-color: rgba(219, 227, 235, 0.5);}
      #vk_album_info h4 img.small{max-width:30px;max-height:30px; margin-right:3px;}
      #vk_album_info h4 img:hover{box-shadow: 0px 0px 4px #717171;}
      #vk_album_info h4 img.big{max-width:155px;max-height:170px; margin:0 auto; margin-bottom:4px; display:none;}
      #vk_album_info.view_big .small{display:none;}
      #vk_album_info.view_big .big{display:block;}
      #vk_album_info h4 .fix_btn{opacity:0;}
      #vk_album_info h4:hover .fix_btn{opacity:0.4;}
      #vk_album_info h4 .fix_btn:hover{opacity:0.7;}
      #vk_album_info.fixed_album h4 .fix_btn,#vk_album_info.fixed_album h4 .fix_btn:hover{opacity:1;}
      #vk_album_info .bio{padding:4px;}
      .vk_album_thumb{padding:3px;}
      .vk_album_tracks ul{list-style-type: disc; margin:0px; padding:0px; padding-left:4px; margin-left: 17px; color:#AAA;}
      .vk_album_tracks .vk_tracks_search_btn{padding:3px 10px;}
      .vk_audio_icon{ padding-left:12px; background: url(/images/icons/mono_iconset.gif) no-repeat 0 -221px; line-height: 11px; }
      */
      }).css;
   },
   preview_album_info_tpl: '\
                          <h4 onclick="slideToggle(\'vk_album_full_info\');">\
                              <img onclick="vkopt.audio_info.toggle_thumb(event);" class="big" src="%IMG2%">\
                              <img onclick="vkopt.audio_info.toggle_thumb(event);" class="small fl_l" src="%IMG%"><span class="divide_">\
                              <div class="fl_r fix_btn" onclick="vkopt.audio_info.pin(event)" onmouseover="vkopt.audio_info.pin(this,true)"><span class="vk_audio_icon"></span></div>\
                              <b>%ARTIST%</b><br>%NAME%</span>\
                          </h4>\
                          <div id="vk_album_full_info" style="display:none;">\
                             <!--<img class="fl_r vk_album_thumb" src="%IMG%">-->\
                             <div class="vk_album_tracks">%TRACKS%</div>\
                          </div>\
   ',

   alb_last_track: '',
   current_album_info: null,
   current_album_full_thumb: false,

   pin: function(e,over){
      if (over){
         showTooltip(e, {text: IDL('FixAlbumInfo'), showdt: 0, black: 1, shift: [11, 0, 0]});
         return;
      }
      cancelEvent(e);
      toggleClass('vk_album_info','fixed_album');
   },
   toggle_thumb: function(ev){//vkViewAlbumThumb
      cancelEvent(ev);
      toggleClass('vk_album_info','view_big');
      vkopt.audio_info.current_album_full_thumb=hasClass('vk_album_info','view_big');
      vkopt.settings.set('vk_album_info_thumb',vkopt.audio_info.current_album_full_thumb?1:0);
   },
   view: function(artist,track){
      if (!vkopt.settings.get('audio_album_info')) return;
      var p = geByClass1('ui_rmenu');
      if (!p) return;
      if (!ge('vk_album_info')){
         var div=se('<div id="vk_album_info" class="page_block ui_rmenu">');
         insertAfter(div,p);
         vkopt.audio_info.current_album_full_thumb=parseInt(vkopt.settings.get('vk_album_info_thumb') || '0') || false;
      } else if (vkopt.audio_info.alb_last_track==artist+'-'+track && ge('vk_album_info').innerHTML!=''){
         return;
      }
      if (hasClass('vk_album_info','fixed_album')) return;
      ge('vk_album_info').innerHTML='';
      vkopt.audio_info.alb_last_track=artist+'-'+track;
      vkopt.audio_info.current_album_info=null;
      vkopt.audio_info.get_info(artist,track,function(data,tracks){
         if (!ge('vk_album_info')) return;
         if (vkopt.audio_info.current_album_full_thumb)
            addClass('vk_album_info','view_big');
         if (vk_DEBUG) console.log(data);
         var html='';
         /*
         console.log(
            data.artist,
            data.name,
            data.releasedate,
            data.image[1]['#text'],
            tracks
         );
         */
         if (tracks){
            vkopt.audio_info.current_album_info=data;
            for (var i=0; i<tracks.length;i++){
               var track_artist = data.artist || data.name;
               var track_name = (track_artist == 'Various Artists' ? '' : track_artist + ' - ') + tracks[i];
               html+='<li><a href="/search?c[q]='+encodeURIComponent(track_name)+'&c[section]=audio" '+
                  'onclick="if (checkEvent(event)) { event.cancelBubble = true; return}; '+
                     'vkopt.audio.search_track(event, this, \''+track_name.replace(/'/,'\\\'')+'\'); return false">'+tracks[i]+'</a></li>';
            }
            html='<ul>'+html+'</ul>';//'<div class="vk_tracks_search_btn"><div class="button_blue button_wide"><button onclick="vkAlbumCollectPlaylist()">'+IDL('SearchAlbumTracks')+'</button></div></div>';
         }
         if (data.act!='artist_info'){
            var year=(new Date(data.releasedate)).getFullYear();
            html=vkopt.audio_info.preview_album_info_tpl.replace(/%ALBUM%/g,IDL('Album'))
                                       .replace(/%NAME%/g,'<a href="'+data.url+'" target="_blank">'+data.name+(year?' ('+year+')':'')+'</a>')
                                       .replace(/%ARTIST%/g,data.artist)
                                       .replace(/%IMG%/g,data.image[1]['#text'] || '/images/question_c.gif')
                                       .replace(/%IMG2%/g,data.image[2]['#text'] || '/images/question_c.gif')
                                       .replace(/%TRACKS%/g,html);
         } else {
            html=vkopt.audio_info.preview_album_info_tpl.replace(/%ALBUM%/g,IDL('Album'))
                                       .replace(/%NAME%/g,'')
                                       .replace(/%ARTIST%/g,'<a href="'+data.url+'" target="_blank">'+data.name+'</a>')
                                       .replace(/%IMG%/g,data.image[1]['#text'] || '/images/question_c.gif')
                                       .replace(/%IMG2%/g,data.image[2]['#text'] || '/images/question_c.gif')
                                       .replace(/%TRACKS%/g,html || (data.bio.summary?'<div class="bio">'+data.bio.summary+'</div>':''));
         }
         ge('vk_album_info').innerHTML=html;

      });
   },
   album_info_cache:[],
   get_info: function(artist,track,callback){
      var in_cache=function(artist,track){
         for (var i=0; i<vkopt.audio_info.album_info_cache.length;i++){
            var c=vkopt.audio_info.album_info_cache[i];
            if (c.artist==artist && c.track==track)
               return c.data;
         }
         return false;
      };
      var x=in_cache(artist,track);
      if (x){
         if (vk_DEBUG) console.log('in cache',x);
         setTimeout(function(){callback(x,x.tracks)},2);
      } else
         vkopt.scrobbler.lastfm.track.getInfo({
               artist: artist,
               track: track,
               //username:LastFM_UserName,
               autocorrect: 1
            }, {
               success: function(data) {
                     if (vk_DEBUG) console.log(data);
                     if (data.track.album) {
                        var params={
                           mbid: data.track.album.mbid
                        };
                        if (!data.track.album.mbid || data.track.album.mbid=="")
                           params={
                              artist: data.track.album.artist,
                              album:data.track.album.title
                           };
                        vkopt.scrobbler.lastfm.album.getInfo(params, {
                           success: function(data) {
                              data=data.album;
                              var tracks=[];
                              for (var i=0; i<data.tracks.track.length;i++){
                                 var t=data.tracks.track[i];
                                 if (data.artist == 'Various Artists')
                                     tracks.push(t.artist.name + ' - ' + t.name);
                                 else
                                     tracks.push(t.name);
                                 if (!in_cache(artist,t.name)){
                                    vkopt.audio_info.album_info_cache.push({
                                       artist: artist,
                                       track: t.name,
                                       data:data
                                    });
                                 }
                              }
                              vkopt.audio_info.album_info_cache.push({
                                 artist: artist,
                                 track: track,
                                 data:data
                              });
                              data.tracks=tracks;
                              callback(data,tracks);
                           }
                        });
                     } else if (data.track.artist && (data.track.artist.mbid || data.track.artist.name)){//data.track.artist.name
                        if (vk_DEBUG) console.log('no album info... load artist info');
                        var params={lang:'ru'};
                        if (data.track.artist.mbid)
                           params['mbid']=data.track.artist.mbid;
                        else
                           params['artist']=data.track.artist.name;
                        //*
                        // GET ARTIST INFO
                        vkopt.scrobbler.lastfm.artist.getInfo(params, {
                           success: function(a_data) {
                             a_data=a_data.artist;
                             a_data.act='artist_info';
                             if (vk_DEBUG) console.log(a_data);

                             // GET TOP TRACKS INFO
                             params['limit']=100;
                              vkopt.scrobbler.lastfm.artist.getTopTracks(params, {
                                 success: function(data) {
                                    data=data.toptracks;
                                    data.act='top_tracks';
                                    var tracks=[];
                                    for (var i=0; i<data.track.length;i++){
                                       var t=data.track[i];
                                       tracks.push(t.name);
                                    }
                                    vkopt.audio_info.album_info_cache.push({
                                       artist: artist,
                                       track: track,
                                       data:a_data
                                    });
                                    a_data.tracks=tracks;
                                    callback(a_data,tracks);
                                 },
                                 error: function(code, message) {
                                    if (vk_DEBUG) console.log(code, message);
                                    callback(a_data,null);
                                 }
                              });
                           }
                        });



                     }
                     else if (vk_DEBUG) console.log('no info')
                  },
               error: function(code, message) {
                     if (vk_DEBUG) console.log(code, message)
                  }
            }
         );
   }

};

vkopt['audioplayer'] = {
   onSettings:{
      Extra:{
         audio_force_flash: {}
      }
   },
   audioObjToArr: function(obj){
      if (isObject(obj)){
         var arr = ["", "", "", "", "", 0, 0, 0, "", 0, 0, "", "[]"];
         arr[AudioUtils.AUDIO_ITEM_INDEX_ID] = obj.id;
         arr[AudioUtils.AUDIO_ITEM_INDEX_OWNER_ID] = obj.ownerId;
         arr[AudioUtils.AUDIO_ITEM_INDEX_TITLE] = obj.title;
         arr[AudioUtils.AUDIO_ITEM_INDEX_PERFORMER] = obj.performer;
         arr[AudioUtils.AUDIO_ITEM_INDEX_DURATION] = obj.duration;
         arr[AudioUtils.AUDIO_ITEM_INDEX_URL] = obj.url;
         arr[AudioUtils.AUDIO_ITEM_INDEX_FLAGS] = obj.flags;
         arr[AudioUtils.AUDIO_ITEM_INDEX_CONTEXT] = obj.context;
         arr[AudioUtils.AUDIO_ITEM_INDEX_EXTRA] = obj.extra;
         return arr;
      } else {
         return obj;
      }
   },
   onLibFiles: function(file_name){

      if (file_name != 'audioplayer.js')
         return;

      // У меня HTML5 плеер аудио глючит, вызывая артефакты со случайными перескакиваниями проигрываемой позиции по хронометражу.
      if (vkopt.settings.get('audio_force_flash')){
         Inj.Start('AudioPlayerHTML5.isSupported','if (vkopt.settings.get("audio_force_flash")) return false;');
         Inj.Start('AudioPlayer.prototype.play','vkopt.audioplayer.init_flash_impl();');
      }
   },
   init_flash_impl: function(){
      if (!vkopt.settings.get('audio_force_flash'))
         return;
      var cur_pl = getAudioPlayer();
      if (cur_pl && cur_pl._impl.type != 'flash'){
         cur_pl._impl = new AudioPlayerFlash();
         cur_pl._initImpl();
         cur_pl._initEvents();
         cur_pl._restoreVolumeState();
         setTimeout(function() {
            cur_pl.restoreState();
            AudioUtils.toggleAudioHQBodyClass();
            cur_pl.updateCurrentPlaying();
         }, 0)
      }
   }
};

vkopt['videoview'] = {
   onSettings:{
      Media:{
         vid_dl: {
            title: 'seLinkVi'
         }
      }
   },
   css: function(){
      return vk_lib.get_block_comments(function(){
      /*css:
      .vk_mv_down_icon {
         background: url(/images/icons/video_icon.png?3) no-repeat;
         background-position: 0 -52px;
         height: 19px;
         width: 20px;
         transform: rotate(90deg);
      }
      .vk_mv_down_links_tt {
         background: rgba(0,0,0,0.6);
         border: 1px solid rgba(255,255,255,0.4);
      }

      .vk_mv_down_links_tt.eltt.eltt_bottom:before {
         border-bottom-color: transparent;
      }
      .vk_mv_down_links_tt.eltt.eltt_bottom:after {
         border-bottom-color: rgba(255, 255, 255, 0.4);
         margin-bottom: 1px;
      }
      .vk_mv_down_links_tt.eltt.eltt_bottom .eltt_arrow{
         border-bottom-color: #000;
      }
      .vk_mv_down_links_tt a {
         display: block;
         padding: 3px 10px;
         color: #FFF;
         white-space: nowrap;
      }
      .vk_mv_down_links_tt a.size_loaded{
         padding-right: 80px;
      }
      .vk_mv_down_links_tt a .vk_vid_size_info.progress_inv_mini{
         position: absolute;
         margin-top: 6px;
         right: 3px;
      }
      .vk_mv_down_links_tt a.size_loaded .vk_vid_size_info{
         position: absolute;
         right: 10px;
      }
      #mv_top_controls{
         z-index: 1000;
      }
      .vk_vid_size_info b{
         color: #FFF;
         padding-left: 10px;
      }
      */
      }).css
   },
   onInit: function(){
      vkopt.videoview.tpls = vk_lib.get_block_comments(function(){
         /*dl_btn:
         <div class="mv_top_button" id="vk_mv_down_icon" role="button" tabindex="0" aria-label="{lng.ToggleLinksView}">
         <div class="vk_mv_down_icon"></div>
         </div>
         */
         /*dl_link:
         <a href="{vals.url}" download="{vals.name}" onclick="return vkopt.videoview.download_file(this)" onmouseover="vkopt.videoview.get_size(this)">{vals.caption}<span class="vk_vid_size_info"></span></a>
         */
         /*ext_link:
         <a class="vk_vid_external_view" href="{vals.url}">{vals.source_name}</a>
         */
      });
   },
   onLibFiles: function(fn){
      if (fn == 'videoview.js'){
        Inj.Start('Videoview.showVideo', function(){
           vkopt.videoview.on_show(arguments);
        });
      }
   },
   /*
   onResponseAnswer: function(answer, url, q){
      // запихиваем свой обработчик в момент получения данных о видео.
      if (url == '/al_video.php' && q.act == 'show'){
         vkopt.videoview.check_show_args(answer);
      }
   },
   */
   _cur_mv_data: null,
   update_dl_btn: function(html){
     re('vk_mv_down_icon'); // убиваем кнопку, т.к не выходит убить тултип таким образом: data(ge('vk_mv_down_icon'), 'ett').destroy();
     if (!html)
        return null;
      if (!ge('vk_mv_down_icon') && ge('mv_top_controls')){
         var btn = se(vk_lib.tpl_process(vkopt.videoview.tpls['dl_btn'], {}));
         ge('mv_top_controls').appendChild(btn);
      }
      // создаём новое тултип-меню
      vkopt.videoview._links_tt = new ElementTooltip(btn,{
                 cls: "vk_mv_down_links_tt",
                 forceSide: "bottom",
                 elClassWhenTooltip: "vk_mv_down_links_shown",
                 content: html,
                 offset: [-3, 0],
                 setPos: function(){
                    return  {
                     left: 0,
                     top: 36,
                     arrowPosition: 21
                    }
                 }
      });
   },
   get_vars: function(opt, video_id){
      var vars = null;
      if (opt && opt.player){
         var params_arr = opt.player.params;
         if (params_arr){
            vars = {};
            var full_vid = function(vars){
               return vars.oid+'_'+vars.vid
            };
            if (params_arr.length > 0 && full_vid(vars) != video_id){ //mvcur.videoRaw
               vkopt.log('wrong video data. search other...');
               for (var i = 0; i < params_arr.length; i++){
                  if (full_vid(params_arr[i]) == video_id){ // нашли данные о нужном видео
                     vars = params_arr[i];
                     break;
                  }
               }
            }

         }
      }
      return vars;
   },
   check_show_args: function(args){
      //args = [videoRaw, title, html, js, desc, serviceBtns, opt]
      var videoRaw = args[0],
          js = args[3],
          opt = args[5],
          rx = /(var\s*isInline)/;
      if (opt && opt.player){// новый формат ответа, JSON с данными о плеере находится в 6-ом аргументе.
         var vars = vkopt.videoview.get_vars(opt,videoRaw);
         vkopt.videoview.on_player_data(vars);
      }
      else if (js && rx.test(args[3])){ // старый формат ответа, vars находится в третьем аргументе.
         //vkopt.log('video data:', args[3]);
         args[3] = js.replace(rx, '\n   vkopt.videoview.on_player_data(vars);\n $1');
      } else
         vkopt.videoview.on_player_data(null);
   },
   on_show: function(args){
      vkopt.log('vkopt.videoview.on_show', args);
      vkopt.videoview.check_show_args(args);
   },
   download_file: function(el){
     var result = vkopt.permissions.check_dl_url(el, el.href);
     if (result) result = vkDownloadFile(el);
     return result;
   },
   on_player_data: function(vars){
      vkopt.log('Video data:', vars, mvcur.mvData.videoRaw);
      if (!vkopt.settings.get('vid_dl')) return;
      vkopt.videoview._cur_mv_data = vars;
      vkopt.videoview.update_dl_btn();
      if (!vars || !vars.md_title || (vars.extra && !vars.hls && !vars.postlive_mp4)){
         setTimeout(function(){
            var p, ifr;
            p = ge('mv_player_box');
            p && (ifr = geByTag1('iframe', p));
            if (ifr)
               vkopt.videoview.on_iframe_player(ifr.src)
            else
               vkopt.videoview.on_iframe_player(vars)
         }, 300);
         return; // нет данных - выходим.
      }

      var links = vkopt.videoview.get_video_links(vars);
      var filename = vkCleanFileName(unclean(vars.md_title));
      var html = '';
      for (var i = 0; i < links.length; i++){
         html += vk_lib.tpl_process(vkopt.videoview.tpls['dl_link'], {
            url: links[i].url + (links[i].ext ? '#FILENAME/' + vkEncodeFileName(filename + '_' + links[i].quality) + links[i].ext : ''),
            name: filename + '_' + links[i].quality + links[i].ext,
            caption: links[i].quality
         })
      }

      vkopt.videoview.update_dl_btn(html);
   },
   get_ext_links: function(url, title, cb){
      vkopt.log('External player:', url);
      if (isString(url)) {
         if (url.indexOf('ivi.ru') > -1){
            vkopt.videoview.get_ivi_links(url, function(links, vid){
                  var html = '';
                  var filename = vkCleanFileName(title);
                  html += vk_lib.tpl_process(vkopt.videoview.tpls['ext_link'], {
                     url: 'http://www.ivi.ru/watch/' + vid,
                     source_name:'ivi.ru'
                  });

                  for (var i = 0; i < links.length; i++){
                     html += vk_lib.tpl_process(vkopt.videoview.tpls['dl_link'], {
                        url: links[i].url,
                        name: filename + '_' + links[i].quality + '.mp4',
                        caption: links[i].quality
                     })
                  }
                  cb && cb(html, links);
            })
         } else
         if (url.indexOf('youtube.com') > -1){
            vkopt.videoview.yt.get_links(url, function(links, vid){
                  var html = '';
                  var filename = vkCleanFileName(title);
                  html += vk_lib.tpl_process(vkopt.videoview.tpls['ext_link'], {
                     url: 'http://youtube.com/watch?v=' + vid,
                     source_name: 'YouTube'
                  });
                  for (var i = 0; i < links.length; i++){
                     html += vk_lib.tpl_process(vkopt.videoview.tpls['dl_link'], {
                        url: links[i].url,
                        name: filename + '_' + links[i].quality + '.mp4',
                        caption: links[i].quality
                     })
                  }
                  cb && cb(html, links);
            })
         } else
            cb && cb('', []);
      } else
         cb && cb('', []);
   },
   on_iframe_player: function(url){
      vkopt.videoview.get_ext_links(url, unclean(mvcur.mvData.title), function(html, link){
         vkopt.videoview.update_dl_btn(html);
      });
   },
   get_size: function(el){
      if (!el || !el.href || hasClass(el,'size_loaded') || /\.m3u8/.test(el.href)) return;
      var WAIT_TIME = 4000;
      var szel = geByTag1('span', el);

      var set_size_info = function(size){
         removeClass(szel,'progress_inv_mini');
         if (size != null)
            szel.innerHTML = vkFileSize(size, 1).replace(/([\d\.]+)/,'<b>$1</b>');
         if (size > 500)
            addClass(el, 'size_loaded');
      }
      szel.innerHTML = '';
      addClass(szel,'progress_inv_mini');
      var reset=setTimeout(function(){
         set_size_info(null);
      }, WAIT_TIME);

      XFR.post(el.href, {}, function(h, size){
         clearTimeout(reset);
         if (size > 0){
            set_size_info(size);
         } else {
            // TODO: видать ссылка протухла. нужно подгрузить актуальный URL и снова запросить размер
         }
      }, true);
   },
   get_video_url: function(vars, q) {
      return vars.live_mp4 ? vars.live_mp4 : vars.extra_data ? vars.extra_data : vars["cache" + q] || vars["url" + q]
   },
   get_video_links: function(vars){
      var list = [];

      // 'ffmpeg -i "'+vars.hls+'" -c copy video.ts'
      if (vars.hls)
         list.push({url: vars.hls, quality: 'hls', ext: '.m3u8'});

      //if (vars.hls_raw)
      //   list.push({text: vars.hls_raw, quality: 'hls_raw', ext: '.m3u8'});

      if (vars.postlive_mp4)
         list.push({url: vars.postlive_mp4, quality: 'mp4', ext: '.mp4'});

      if (vars.live_mp4)
         list.push({url: vars.live_mp4, quality: 'live_mp4', ext: '.mp4'});

      if (vars.extra_data && (vars.extra_data != (vars.author_id+'_'+vars.vid)))
         list.push({url: vars.extra_data, quality: 'extra'});

      var q = [240, 360, 480, 720, 1080];
      for (var i = 0; i <= vars.hd; i++){
         var qname = q[i] || 0;
         vars["url" + qname] && list.push({url: vars["url" + qname], quality: qname+'p', ext: '.mp4'});
         vars["cache" + qname] &&  list.push({url: vars["cache" + qname], quality: qname+'p_alt', ext: '.mp4'})
      }
      return list;
   },
   yt: {
      decode_data : function (qa) { // декодирование URL-encoded объектов
      	if (!qa)
      		return {};
      	var exclude = {
      		'url' : 1,
      		'type' : 1,
      		'ttsurl' : 1
      	};
      	var query = {},
      	dec = function (str) {
      		try {
      			return decodeURIComponent(str);
      		} catch (e) {
      			return str;
      		}
      	};
      	qa = qa.split('&');
      	for (var i = 0; i < qa.length; i++) {
      		var a = qa[i];
      		var t = a.split('=');
      		if (t[0]) {
      			var key = dec(t[0]);
      			var v = exclude[key] ? [dec(t[1] + '')] : dec(t[1] + '').split(',');
      			query[key] = [];
      			for (var j = 0; j < v.length; j++) {
      				if (v[j].indexOf('&') != -1 && v[j].indexOf('=') != -1 && !exclude[key])
      					v[j] = vkopt.videoview.yt.decode_data(v[j]);
      				query[key].push(v[j]);
      			}
      			if (query[key].length == 1)
      				query[key] = query[key][0];
      		}
      	}
      	return query;
      },
      video_itag_formats: { //YouTube formats list
         '0': '240p.flv',
         '5': '240p.flv',
         '6': '360p.flv',
         '34': '360p.flv',
         '35': '480p.flv',

         '13': '144p.3gp (small)',
         '17': '144p.3gp (medium)',
         '36': '240p.3gp',

         '160': '240p.mp4 (no audio)',
         '18': '360p.mp4',
         '135': '480p.mp4 (no audio)',
         '22': '720p.mp4',
         '37': '1080p.mp4',
         '137': '1080p.mp4 (no audio)',
         '38': '4k.mp4',
         '82': '360p.mp4',//3d?
         //'83': '480p.mp4',//3d?
         '84': '720p.mp4',//3d?
         //'85': '1080p.mp4',//3d?

         '242': '240p.WebM (no audio)',
         '43': '360p.WebM',
         '44': '480p.WebM',
         '244': '480p.WebM (low, no audio)',
         '45': '720p.WebM',
         '247': '720p.WebM (no audio)',
         '46': '1080p.WebM',
         '248': '1080p.WebM (no audio)',
         '100':'360p.WebM',//3d?
         //'101':'480p.WebM',//3d?
         '102':'720p.WebM',//3d?
         //'103':'1080p.WebM',//3d?

         '139': '48kbs.aac',
         '140': '128kbs.aac',
         '141': '256kbs.aac',

         '171': '128kbs.ogg',
         '172': '172kbs.ogg'
      },
      get_links : function (url, callback) {
      	var vid = String(url).split('?')[0].split('/').pop();
      	var req_url = (vk_ext_api.ready ? 'http:' : location.protocol) + '//www.youtube.com/get_video_info?video_id=' + vid;

      	XFR.post(req_url, {}, function (t) {
            /*
            var decode_s = function (a) {
               var mod = {
                  del_left : function (a, b) {
                     a.splice(0, b)
                  },
                  calc : function (a, b) {
                     var c = a[0];
                     a[0] = a[b % a.length];
                     a[b] = c
                  },
                  reverse : function (a) {
                     a.reverse()
                  }
               };
               a = a.split("");
               mod.calc(a, 19);
               mod.reverse(a);
               mod.del_left(a, 1);
               mod.reverse(a);
               mod.del_left(a, 1);
               mod.calc(a, 7);
               mod.reverse(a);
               mod.calc(a, 38);
               mod.del_left(a, 3);
               return a.join("")
            };
            */
            var obj = vkopt.videoview.yt.decode_data(t);
            vkopt.log('YT raw data:', obj);
      		var map = (obj.fmt_url_map || obj.url_encoded_fmt_stream_map  || obj.adaptive_fmts);
      		if (!map) {
      			callback([], vid);
      			return;
      		}
      		var links = [];
      		for (var i = 0; i < map.length; i++) {

               if (!map[i].sig && map[i].s)
                  continue; //map[i].sig = decode_s(map[i].s);

      			var format = vkopt.videoview.yt.video_itag_formats[map[i].itag];
      			var info = (map[i].type + '').split(';')[0] + ' ' + (obj.fmt_list[i] + '').split('/')[1];
      			if (!format)
      				vkopt.log('YT ' + map[i].itag + ': \n' + (map[i].stereo3d ? '3D/' : '') + info, 1);
      			format = (map[i].stereo3d ? '3D/' : '') + (format || info);
      			obj.title = isArray(obj.title) ? obj.title.join('') : obj.title;
      			var url = map[i].url;
               if (url.indexOf('&signature=') == -1 && map[i].sig)
                  url += '&signature=' + map[i].sig;
               url += '&quality=' + map[i].quality + (obj.title ? '&title=' + encodeURIComponent(obj.title.replace(/\+/g, ' ')) : '');
               links.push({
      				url : url,
      				quality : format,
      				info : info
      			});
               // adaptive_fmts
      		}
      		callback(links, vid);
      	});
      }
   },
   get_ivi_links:function(url,callback){
      var vid = isNumeric(url) ? url : (url.match(/(?:videoId|id)=(\d+)/) || [])[1];
      if (!vid)
         return;
      // 'http://www.ivi.ru/watch/'+vid
      //  https://www.ivi.ru/embeds/video/?id=126872&app_version=340&autostart=1
      var app_ver = 340;
      var rnd=Math.random()*1000000000000;
      var data={
         "method" : "da.content.get",
         "params" : [
            vid,
            {
               "sourceid" : "",
               "utmfullinfo" : "",
               "_domain" : "www.ivi.ru",
               "app_version" : app_ver,
               "_url" : "https://www.ivi.ru/embeds/video/?id="+vid+"&app_version="+app_ver+"&autostart=1",
               "site" : "s132",
               "campaignid" : "",
               "uid" : rnd+""
            }
         ]
      };



      var ondone=function(r) {
         var vars=JSON.parse(r);
         var links=vars.result.files;
         if (!links){
            callback([]);
            return;
         }
         var res=[];
         for (var i=0; i<links.length; i++){
            if (links[i].content_format!='Flash-Access')
               res.push({
                  url: links[i].url,
                  quality: links[i].content_format
               });
         }
         callback(res, vid);
         //console.log(r);
      };
      // old: https://api.digitalaccess.ru/api/json/
      // new: https://api.ivi.ru/light/?r=266.3667255532756&app_version=340
      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.ivi.ru/light/?r='+Math.random()*1000+'6&app_version='+app_ver, true);
      xhr.onreadystatechange = function(){
         if (xhr.readyState == 4) {
            ondone(xhr.responseText);
         }
      };
      xhr.send(JSON.stringify(data));
   }
};

vkopt['videos'] = {
   css: function(){
      return vk_lib.get_block_comments(function(){
      /*css:
      .video_thumb_actions>div.vk_video_thumb_action_link .icon {
         background-image: url("/images/icons/pv_actions.png");
         background-size: cover;
         background-position: 1px 3px;
      }
      .video_thumb_actions>div.vk_video_thumb_action_link.vk_cant_get_link,
      .video_thumb_actions>div.vk_video_thumb_action_link.vk_cant_get_link:hover {
         opacity:0.2;
         cursor: default;
      }

      .video_thumb_actions>div.vk_video_thumb_action_link {
         display: inline-block;
      }
      .vk_video_thumb_action_link a {
         display: block;
         line-height: 14px;
      }
      .video_thumb_actions>div.vk_video_thumb_action_link:active {
         position: static;
      }
      .video_thumb_actions>div.vk_video_thumb_action_link.vk_links_loading .icon {
          background: url(/images/upload_inv_mini.gif) 50% 50% no-repeat;
      }
      .videoplayer_settings_menu_sublist_item.vk_wg_dl_item{
         justify-content: flex-start;
      }
      #vk_wg_dl_menu{
         width: 160px;
      }
      .videoplayer_settings_menu_list_icon.vk_wg_dl_icon {
         width: 18px;
         height: 16px;
         display: inline-block;
         margin-right: 23px;
         vertical-align: top;
         background-image: url(/images/icons/pv_actions.png?3);
         background-position: 0 0px;
      }
      */
      }).css
   },
   onLibFiles: function(fn){
      if (fn == 'video.js'){
         Inj.End('Video.buildVideoEl', function(){
            if (this.result)
               vkopt.videos.processNode(this.result);
         })
      }

      if ((fn == 'videoplayer.js') && window.playerParams)
         setTimeout(vkopt.videos.widget_player, 10);
   },
   onInit: function(){
      vkopt.videos.tpls = vk_lib.get_block_comments(function(){
         /*dl_btn:
         <div class="vk_video_thumb_action_link" onclick="return vkopt.videos.show_links(event, this, '{vals.video}','{vals.list=}');">
            <div class="icon"></div>
         </div>
         */
         /*wg_show_dl:
         <div class="videoplayer_settings_menu_list_item" role="menuitemradio" tabindex="0" onclick="toggle('vk_wg_dl_menu')">
            <div class="videoplayer_settings_menu_list_icon vk_wg_dl_icon"></div>
            <div class="videoplayer_settings_menu_list_title">{lng.download}</div>
         </div>
         */
         /*wg_sub_menu:
         <div class="videoplayer_settings_menu_sublist" id="vk_wg_dl_menu" style="display:none">
            <div class="videoplayer_settings_menu_sublist_header" onclick="hide('vk_wg_dl_menu')">{lng.download}</div>
            <div class="videoplayer_settings_menu_sublist_divider"></div>
            <div class="videoplayer_settings_menu_sublist_items">
               {vals.content}
            </div>
         </div>
         */
         /*wg_dl_item:
         <a class="videoplayer_settings_menu_sublist_item vk_wg_dl_item" role="menuitemradio" tabindex="0" href="{vals.url}" download="{vals.name}" onclick="return vkopt.videoview.download_file(this)" onmouseover="vkopt.videoview.get_size(this)">
            {vals.caption}
            <span class="vk_vid_size_info"></span>
         </a>
         */
      });
   },
   processNode: function(node, params){
      if (!vkopt.settings.get('vid_dl')) return;
      if (!node) return;
      var nodes = geByClass('video_thumb_actions',node);
      for (var i = 0; i < nodes.length; i++){
         var acts = nodes[i];
         if (geByClass1('vk_video_thumb_action_link', acts))
            continue;

         var vid_el = gpeByClass('video_item', acts);
         if (!vid_el)
            continue;

         var a = (geByTag1('a',vid_el) || {}).href || '';
         var ids = a.match(/video(-?\d+_\d+)(?:\?list=([a-f0-9]+))?/);
         if (!ids)
            continue;


         acts.appendChild(
            se(
               vk_lib.tpl_process(vkopt.videos.tpls['dl_btn'], {
                  video: ids[1],
                  list: ids[2] || ''
               })
            )
         );
      }
   },
   widget_player: function(){
      if (!vkopt.settings.get('vid_dl')) return;
      var
         vars = vkopt.videoview.get_vars({player:playerParams},nav.objLoc.oid+'_'+nav.objLoc.id),
         menu = geByClass1('videoplayer_settings_menu_list');
      if (!vars || !menu) return;


      var links = vkopt.videoview.get_video_links(vars);
      var filename = vkCleanFileName(unclean(vars.md_title));
      var html = '';
      for (var i = 0; i < links.length; i++){
         html += vk_lib.tpl_process(vkopt.videos.tpls['wg_dl_item'], {
            url: links[i].url + (links[i].ext ? '#FILENAME/' + vkEncodeFileName(filename + '_' + links[i].quality) + links[i].ext : ''),
            name: filename + '_' + links[i].quality + links[i].ext,
            caption: links[i].quality
         })
      }

      var dl_menu = se(
         vk_lib.tpl_process(vkopt.videos.tpls['wg_sub_menu'], {
            content: html
         })
      );
      menu.parentNode.appendChild(dl_menu);
      menu.insertBefore(se(vk_lib.tpl_process(vkopt.videos.tpls['wg_show_dl'],{})),menu.firstChild)

   },
   show_links: function(ev, el, video, list){
      cancelEvent(ev);
      if (hasClass(el,'vk_links_loading') || hasClass(el,'vk_links_loaded'))
         return false;
      addClass(el,'vk_links_loading');

      var on_links_ready = function(html, links){
         if (links.length){
            removeClass(el,'vk_links_loading');
            addClass(el,'vk_links_loaded');
            el.dl_ett = new ElementTooltip(el,{
               cls: "vk_mv_down_links_tt",
               forceSide: "bottom",
               elClassWhenTooltip: "vk_mv_down_links_shown",
               content: html,
               offset: [-3, 0],
               setPos: function(){
                  return  {
                     left: 33,
                     top: 34,
                     arrowPosition: 21
                  }
               }
            });
            el.dl_ett.show();
         }
      }
      var failed = function(){
         addClass(el, 'vk_cant_get_link')
      }

      ajax.post('al_video.php', {act: "show", list: list, video: video}, {
         onDone: function(title, vid_box, js, html, data){
            if (vid_box && /<iframe/i.test(vid_box)){
               var ifr, p = se(vid_box);
               p && (ifr = geByTag1('iframe', p));
               if (ifr && ifr.src){
                   vkopt.videoview.get_ext_links(ifr.src, unclean(title), function(html, links){
                     if (links.length)
                        on_links_ready(html, links);
                     else
                        failed();
                  });
               } else
                  failed();
            } else {
               var vars = vkopt.videoview.get_vars(data, video);
               if (!vars) return failed();
               var links = vkopt.videoview.get_video_links(vars);
               var filename = vkCleanFileName(unclean(vars.md_title));
               var html = '';
               for (var i = 0; i < links.length; i++){
                  html += vk_lib.tpl_process(vkopt.videoview.tpls['dl_link'], {
                     url: links[i].url + (links[i].ext ? '#FILENAME/' + vkEncodeFileName(filename + '_' + links[i].quality) + links[i].ext : ''),
                     name: filename + '_' + links[i].quality + links[i].ext,
                     caption: links[i].quality
                  })
               }
               on_links_ready(html, links);
            }


            //vkMsg(html, 5000);
            //vkopt.log('MV_DATA:', data);
         }
      })
      return false;
   }
}

vkopt['messages'] = {
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_im_dialogs_right .im-page-wrapper .im-page .im-page--dialogs{
            float: right;
         }
         .vk_im_dialogs_right .im-page-wrapper .im-page .im-page--history {
            margin-left: 0px;
            margin-right: 317px;
         }
         .vk_im_dialogs_right .im-page-wrapper .im-page .im-create{
            left: auto;
            right: 0px;
         }

         .vk_im_hide_dialogs .im-page-wrapper .im-page .im-page--dialogs{
            display: none;
            position: absolute;
         }
         .vk_im_hide_dialogs.vk_im_dialogs_right .im-page-wrapper .im-page .im-page--dialogs {
            right: 0px;
         }

         .vk_im_hide_dialogs.vk_im_dialogs_right .im-page-wrapper .im-page .im-page--history,
         .vk_im_hide_dialogs .im-page-wrapper .im-page .im-page--history
         {
            margin: 0px;
         }
         .vk_im_hide_dialogs .im-page-wrapper .im-page .im-chat-input .im-chat-input--textarea {
            width: 720px;
         }
         .vk_im_hide_dialogs .im-mess-stack .im-mess-stack--content .im-mess-stack--lnk{
            max-width: auto;
         }
         .vk_msg_info_icon{
            width: 18px;
            height: 18px;
            display: block;
            float: right;
            margin: 14px;
         }
         a.vk_msg_info_icon:hover{
            text-decoration: none;
         }
         .vk_msg_info_icon:before {
            content: '!';
            font-weight: bold;
            border: 2px solid #93a3bc;
            color: #93a3bc;
            width: 15px;
            height: 15px;
            line-height: 16px;
            display: block;
            text-align: center;
            border-radius: 50%;
         }
         .im-page.im-page_classic .vk_msg_info_icon{
            margin-top: -3px;
            margin-right: 0;
         }
         .ui_actions_menu_item.vk_acts_item_icon:before,
         .vk_acts_item_icon:before,
         .vk_acts_item_ricon:after{
            background: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%237D9AB7%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E") 9px 0px no-repeat;
            height: 17px;
         }
         .ui_actions_menu_item.vk_acts_item{
            padding-left: 0;
         }
         .ui_actions_menu_item.vk_acts_item:before,
         .ui_actions_menu_item.vk_acts_item_r:after{
            content: "";
            width: 20px;
            display: inline-block;
            padding-left: 15px;
            opacity: 0.7;
            vertical-align: middle;
         }
         .vk_save_hist_cfg textarea{
            width:370px;
         }
         .vk_audio_msg_btns{
            padding: 0px 10px;
         }
         .vk_au_msg_dl{
            font-size: 10px;
            padding-right: 10px;
         }
         .vk_au_msg_dl div{
            background-image: url(/images/blog/about_icons.png);
            background-repeat: no-repeat;
            width: 12px;
            height: 14px;
            background-position: 0px -309px;
            padding-right: 5px;
            display: inline-block;
            margin-top: -5px;
            margin-bottom: -5px;
         }
         #vk_restore_msg {
            margin-top: 5px;
         }

       .vk_block_typing_btn .im-chat-input .im-chat-input--textarea:not(.im-chat-input_open-keyboard):not(.im-chat-input_close-keyboard):not(.im-chat-input--textarea_show-templates) .im-chat-input--text{
          padding-right: 106px;
       }
       .im-chat-input_close-keyboard .msg_typing_icon,
       .im-chat-input_open-keyboard .msg_typing_icon{
          display:none;
       }

       .vk_block_typing_btn  .im-chat-input--textarea_show-templates .im-chat-input--text{
          padding-right: 150px;
       }
       .vk_block_typing_btn  .im-chat-input--textarea_show-templates .msg_typing_icon{
          right: 108px;
       }

       .msg_mark_read_icon.off_mark_read {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%2392abc6'%3e%3cpath d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'/%3e%3c/svg%3e") !important;
       }
       .msg_mark_read_icon {
          float: right;
          margin: 4px 4px 0 0;
          width: 24px;
          height: 24px;
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%2392abc6'%3e%3cpath d='M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z'/%3e%3c/svg%3e");
          opacity: 0.75;
          filter: alpha(opacity=75);
       }
       .msg_mark_read_icon:hover {
          opacity: 1;
          filter: none
       }
       ._im_dialogs_settings .msg_mark_read_icon {
          margin: 11px;
       }
       .msg_typing_icon:before{
          content: '';
          display:block;
          width:24px;
          height:24px;
          background: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20width%3D%2224%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M-4.166-3.74h31.811v30.912h-31.81z%22%2F%3E%3Cpath%20d%3D%22M5.122%2015.59l2.632%202.556-.678.659-2.912.566c-.2.038-.343-.091-.302-.294l.583-2.83zM6.447%2014.3l10.21-9.92a1.357%201.357%200%200%201%201.881-.011l.761.74a1.26%201.26%200%200%201-.01%201.828l-10.21%209.92z%22%20fill%3D%22%23828a99%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M7.006.624a10.345%2010.345%200%200%200-4.828%203.53A10.284%2010.284%200%200%200%20.094%209.745l.96.125a9.425%209.425%200%200%201%201.913-5.124A9.472%209.472%200%200%201%207.39%201.512zm.97%202.257c-1.381.48-2.572%201.259-3.53%202.384a8.28%208.28%200%200%200-.298.37c-1.014%201.337-1.502%202.902-1.613%204.42l.96.13c.102-1.37.54-2.768%201.44-3.956.907-1.198%202.04-1.981%203.422-2.463zM20.55%2012.943c-.086%201.456-.532%202.757-1.44%203.954-.9%201.188-2.13%201.99-3.427%202.46l.391.886c1.434-.522%202.81-1.417%203.824-2.754%201.005-1.328%201.518-2.815%201.613-4.425zm2.441.312a9.422%209.422%200%200%201-1.91%205.124%209.479%209.479%200%200%201-4.424%203.235l.383.888a10.345%2010.345%200%200%200%204.828-3.53%2010.292%2010.292%200%200%200%202.084-5.594z%22%20fill%3D%22%23828a99%22%2F%3E%3C%2Fsvg%3E") 50% no-repeat;
          background-size: 24px 24px;
       }
       .msg_typing_icon.off_typing:before{
         background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20width%3D%2224%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M-4.166-3.74h31.811v30.912h-31.81z%22%2F%3E%3Cpath%20d%3D%22M5.122%2015.59l2.632%202.556-.678.659-2.912.566c-.2.038-.343-.091-.302-.294l.583-2.83zM6.447%2014.3l10.21-9.92a1.357%201.357%200%200%201%201.881-.011l.761.74a1.26%201.26%200%200%201-.01%201.828l-10.21%209.92z%22%20fill%3D%22%23828a99%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M18.412%2012.968a.808.808%200%200%200-.56.236l-1.306%201.307-1.281-1.28a.808.808%200%200%200-1.141-.002l-.215.214a.808.808%200%200%200%200%201.143l1.28%201.281-1.285%201.286a.808.808%200%200%200%200%201.142l.214.213a.808.808%200%200%200%201.142%200l1.286-1.284%201.31%201.31a.808.808%200%200%200%201.142%200l.214-.214a.808.808%200%200%200%200-1.142l-1.31-1.31%201.307-1.307a.808.808%200%200%200%200-1.142l-.215-.215a.808.808%200%200%200-.583-.236z%22%20fill%3D%22%23828a99%22%2F%3E%3C%2Fsvg%3E");
       }

       .msg_typing_icon{
          position: absolute;
          border: none;
          padding: 6px 7px 6px 5px;
          margin: 0;
          background: transparent;
          right: 73px;
          bottom: 0;
          cursor: pointer;
          opacity: .7;
       }
       .msg_typing_icon:hover {
          opacity: 1;
          filter: none
       }
       .vk_block_mark_read_btn .vk_msg_info_icon,
       .vk_block_mark_read_btn ._im_dialogs_settings .msg_mark_read_icon{
          margin: 14px 14px 14px 5px;
        }
        .vk_block_mark_read_btn .im-page .im-page--dialogs-settings{

        }
        .vk_block_mark_read_btn ._im_dialogs_settings .msg_mark_read_icon{
          margin-top:11px
        }
        */
      }).css + vkopt.messages.css_msg_bg(vkopt.settings.get('old_unread_msg_bg'))
   },
   css_msg_bg: function(color){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_old_unread_msg .nim-dialog.nim-dialog_classic.nim-dialog_unread-out .nim-dialog--inner-text,
         .vk_old_unread_msg .ui_scroll_container .nim-dialog.nim-dialog_unread-out .nim-dialog--text-preview,
         .vk_old_unread_msg .nim-dialog.nim-dialog_classic.nim-dialog_unread-out.nim-dialog_muted .nim-dialog--inner-text,
         .vk_old_unread_msg .nim-dialog:not(.nim-dialog_deleted).nim-dialog_unread,
         ._vk_old_unread_msg .nim-dialog.nim-dialog_unread-out,
         .vk_old_unread_msg .im-mess.im-mess_unread,
         .vk_old_unread_msg .im-mess.im-mess_unread+.im-mess:before,
         .vk_old_unread_msg .im-mess.im-mess_unread:last-child:before,
         .vk_old_unread_msg .fc_msgs_unread {
            background: #{colorMsgBgUnread} !important;
         }
         .vk_old_unread_msg .nim-dialog.nim-dialog_unread-out:not(.nim-dialog_failed) .nim-dialog--unread {
            display: none;
         }
         */
      }).css.replace(new RegExp("{colorMsgBgUnread}", 'g'), color);
   },
   onSettings:{
      Messages: {
         im_dialogs_right:{
            title: 'seDialogsListToRight',
            class_toggler: true
         },
         old_unread_msg:{
            title: 'seHLMail',
               class_toggler: true,
            sub: {
               old_unread_msg_bg:{
                  title: ' ',
                  color_picker: true
               }
            }
         },
         block_typing_btn: {
            title: 'seShowBlockTypingButton',
            class_toggler: true,
            default_value: true
         },
         block_mark_read_btn: {
            title: 'seShowBlockMarkAsReadButton',
            class_toggler: true,
            default_value: true
         }
      },
      Extra: {
        im_hide_dialogs: { class_toggler: true },
        im_block_typing: {},
        im_block_mark_read: {},
        gim_block_typing: {},
        gim_block_mark_read: {},
        im_show_online_count: {
           default_value: true
        }
      }
   },
   onInit: function(){
      vkopt.messages.tpls = vk_lib.get_block_comments(function(){
         /*info_btn:
            <a href="#" class="vk_msg_info_icon" id="vk_msg_info_btn" onmouseover="vkopt.messages.show_info(this);" onclick="return false;"></a>
         */
         /*info_content:
         <!--
         <div>{lng.mMaI}: {vals.in_count}</div>
         <div>{lng.mMaO}: {vals.out_count}</div>
         --!>
         <div>{lng.mDialogsMessages}: {vals.dialogs_count}</div>
         */
         /*menu_separator:
         <div class="ui_actions_menu_sep" id="vk_im_acts_sep"></div>
         */
         /*history_html:
         <!DOCTYPE html>
         <html>
            <head>
               <meta charset="utf-8"/>
               <link rel="shortcut icon" href="http://vk.com/images/fav_chat.ico"/>
               <!--<link rel="stylesheet" type="text/css" href="http://vk.com/css/al/common.css" />-->
               <title>%title</title>
               <style>
                  .emoji,.emoji_css {width: 16px;height: 16px;border: none;vertical-align: -3px;margin: 0 1px;display: inline-block}
                  .emoji_css {background: url(https://vk.com/images/im_emoji.png?9) no-repeat}
                  @media (-webkit-min-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-resolution: 192dpi) {
                      .emoji_css {background-image:url(https://vk.com/images/im_emoji_2x.png?9);background-size: 16px 544px}
                  }
                  h4{font-family: inherit;font-weight: 500;line-height: 1.1;color: inherit;margin-top: 10px;margin-bottom: 10px;font-size: 18px;}
                  body{font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;font-size: 14px;line-height: 1.42857143;color: #333;background-color: #fff;margin:0;}
                  hr{height: 0;margin-top: 20px;margin-bottom: 20px;border: 0;border-top: 1px solid #eee;}
                  .messages{width:1170px;margin:0 auto;text-align:left;}
                  .msg_item {overflow:hidden}
                  .from,.msg_body,.att_head,.attacments,.attacment,.fwd{margin-left:60px;min-height: 1px;padding-right: 15px;padding-left: 15px;}
                  .msg_item{margin-top:5px;}
                  .upic{float:left}
                  .upic img{vertical-align:top;padding:5px;width: 50px;height: 50px;}
                  .round_upic .upic img{border-radius: 50%;}
                  a {color: #337ab7;text-decoration: none;}
                  a:active, a:hover {outline: 0;}
                  a:focus, a:hover {color: #23527c;text-decoration: underline;}
                  .att_head{color:#777;}
                  .att_ico{float:left;width:11px;height:11px;margin: 3px 3px 2px; background-image:url('http://vk.com/images/icons/mono_iconset.gif');}
                  .att_photo{background-position: 0 -30px;}
                  .att_audio{background-position: 0 -222px;}
                  .att_video{background-position: 0 -75px;}
                  .att_doc{background-position: 0 -280px;}
                  .att_wall,.att_fwd{background-position: 0 -194px;}
                  .att_gift{background-position: 0 -105px;}
                  .att_sticker{background-position: 0 -362px; width: 12px; height: 12px;}
                  .att_link{background-position: 0 -237px;}
                  .attb_link a span{color:#777777 !important;}
                  .att_geo{background-position: 0 -165px;}
                  .fwd{border:2px solid #C3D1E0;border-width: 0 0 0 2px;margin-left:85px;}
               </style>
            </head>
            <body><div class="messages {vals.body_class}">{vals.messages_body}</div></body>
         </html>
         */
         /*export_box:
         <div id="saveldr" style="display:none; padding:8px; padding-top: 14px; text-align:center; width:360px;"><img src="/images/upload.gif"></div>
         <div id="save_btn_text" style="text-align:center">
            <div class="button_blue"><button onclick="vkopt.messages.get_history({vals.peer}); return false;">{lng.SaveHistory} *.html</button></div><br>
            <div class="button_gray"><button onclick="toggle('msg_save_more'); return false;">(*.txt)</button></div>
            <div id="msg_save_more" style="display:none;">
            <div class="button_gray"><button onclick="vkopt.messages.get_history_txt({vals.peer}); return false;">{lng.SaveHistory}</button></div>
            <div class="button_gray"><button onclick="vkopt.messages.get_history_txt({vals.peer},true); return false;">{lng.SaveHistoryCfg}</button></div>
            </div>
         </div>
         */
         /*msg_exp_txt_cfg:
         <div class="vk_save_hist_cfg">
            <h4>{lng.SaveMsgFormat}
               <a class="fl_r" onclick="ge('vk_msg_fmt').value=vkopt_defaults.config.SAVE_MSG_HISTORY_PATTERN;">{lng.Reset}</a>
            </h4>
            <textarea id="vk_msg_fmt">{vals.msg_pattern}</textarea>
            <br><br>
            <h4>{lng.SaveMsgDateFormat}
               <a class="fl_r" onclick="ge('vk_msg_date_fmt').value=vkopt_defaults.config.SAVE_MSG_HISTORY_DATE_FORMAT;">{lng.Reset}</a>
            </h4>
            <textarea id="vk_msg_date_fmt">{vals.date_fmt}</textarea>
            <br>
         </div>
         */

         /*acts_export_history_item:
         <a tabindex="0" role="link" class="ui_actions_menu_item _im_action im-action vk_acts_item_icon" onclick="return vkopt.messages.export_box()">{lng.SaveHistory}</a>
         */
         /*acts_to_beginning_item:
         <a tabindex="0" role="link" class="ui_actions_menu_item _im_action im-action vk_acts_item_icon" onclick="return vkopt.messages.go_to_beginning()">{lng.GoToBeginning}</a>
         */
         /*audio_msg_btns:
         <div class="vk_audio_msg_btns">
           <a class="vk_au_msg_dl" href="{vals.url_mp3}"><div></div>mp3</a>
           <a class="vk_au_msg_dl" href="{vals.url_ogg}"><div></div>ogg</a>
         </div>
         */
         /*search_deleted_content:
         <div id="vk_scan_msg"></div>
         <div id="vk_restore_msg"></div>
         <div id="vk_restore_info"></div>
         <div class="info_msg" style="line-height: 160%;">
            {lng.SearchDeletedMessagesInfo}
         </div>

         <h2>
            {lng.MessagesSaveFound}
            (<span id="vk_msg_found_cnt">0</span>)
         </h2>
         <div id="vk_msg_save_html" class="flat_button button_indent">{lng.SaveToFile} (.html)</div>
         <div id="vk_msg_save_json" class="flat_button secondary button_indent">{lng.SaveToFile} (.json)</div>
         */
         /*search_deleted_done:
         <div class="ok_msg">{lng.Done}</div>
         */
         /*try_restore_chk:
         <div class="checkbox on" id="vk_msg_try_restore" role="checkbox" aria-checked="true">
            {lng.MessagesTryRestore}
         </div>
         */
         /*search_deleted_item:
         <a class="ui_actions_menu_item _im_settings_action im-action vk_acts_item_icon" id="vk_search_deleted_item" onclick="vkopt.messages.search_deleted(); return false;">{lng.SearchDeletedMessages}</a>
         */
	 /*users_item:
	 <div class="ListItem">
	   <div class="Entity">
	     <div class="Entity__aside">
	       <a href="/{vals.domain}"><img src="{vals.photo}" class="Entity__photo"></a>
	     </div>
	     <div class="Entity__main">
	       <div class="Entity__title">
		 <a href="/{vals.domain}" class="Link">{vals.fullName}</a>
	       </div>
	       <div class="Entity__description">
		 <span>online{vals.mobile}</span>
	       </div>
	     </div>
           </div>
         </div>
	 */
	 /*typing_mread_icon:
	   <div id="{vals.prefix}_{vals.type}_st" class="msg_{vals.type}_icon {vals.class_btn}" onclick="vkopt.messages.change_typing_mread_st('{vals.prefix}','{vals.type}')" onmouseover="vkopt.messages.typing_mread_tip(this,'{vals.prefix}','{vals.type}')"></div>
	 */
      });
   },
   onCmd: function(data){
       if(data.act == 'update_typing_mread_icon' && ge(data.el)) {
           ge(data.el).classList.toggle('off_'+data.type);
       }
   },
   onRequestQuery: function(url, query, options) {
       var prefix = (query.gid) ? 'gim' : 'im';
       if (url === 'al_im.php') {
           if (query.type === 'typing'  && vkopt.settings.get(prefix + '_block_typing')) {
               return false;
           }
           /* something interesting:
           a_mark_answered
           a_mark
           a_restore_dialog
           */
           if (query.act === 'a_mark_read' && vkopt.settings.get(prefix + '_block_mark_read')) {
               return false;
           }
        }
   },
   onOptionChanged: function(option_id, val, option_data){
      if (option_id == 'im_hide_dialogs'){
         if (!val)
            show(geByClass1('im-page--dialogs'));
         else
            vkopt.messages.dialogs_hide_init();

      }

      if (option_id == 'old_unread_msg_bg' && vkopt.settings.get('old_unread_msg')){
         clearTimeout(vkopt.messages._chbg_to);
         vkopt.messages._chbg_to = setTimeout(function(){
            var code = vkopt.messages.css_msg_bg(val);
            var st = ge('vk_unread_msg_preview');
            vkopt.set_css(code, 'vk_unread_msg_preview');
         },200)
      }

      if(option_id == 'block_typing_btn' && (vkopt.settings.get('im_block_typing') ||  vkopt.settings.get('gim_block_typing'))){
         vkopt.settings.set('im_block_typing', 0);
         vkopt.settings.set('gim_block_typing', 0);
      }

      if(option_id == 'block_mark_read_btn' && (vkopt.settings.get('im_block_mark_read') || vkopt.settings.get('gim_block_mark_read'))){
         vkopt.settings.set('im_block_mark_read', 0);
         vkopt.settings.set('gim_block_mark_read', 0);
      }

   },
   onLocation: function(nav_obj, cur_module_name){
      if(nav.objLoc[0].substr(0,3) == 'gim') {
         if (vkopt.settings.get('block_mark_read_btn'))
            vkopt.messages.add_typing_read_icon('gim', 'mark_read');
         if (vkopt.settings.get('block_typing_btn'))
            vkopt.messages.add_typing_read_icon('gim', 'typing');
      }
      if (nav.objLoc[0] != 'im'){
         clearInterval(vkopt.messages.timeout_online_count_users);
         return;
      }
      if ((nav.objLoc['sel'] || '').substr(0,1) == 'c'){
         vkopt_core.timeout(vkopt.messages.online_count_users, 500);
         clearInterval(vkopt.messages.timeout_online_count_users);
         vkopt.messages.timeout_online_count_users = setInterval(vkopt.messages.online_count_users, vkopt.messages.online_count_update_interval);
      } else {
         clearInterval(vkopt.messages.timeout_online_count_users);
      }

      if (vkopt.settings.get('block_mark_read_btn'))
         vkopt.messages.add_typing_read_icon('im', 'mark_read');

      if (vkopt.settings.get('block_typing_btn'))
         vkopt.messages.add_typing_read_icon('im', 'typing');

      vkopt.messages.info_icon();
      vkopt_core.timeout(vkopt.messages.acts_menu, 500);
      if (vkopt.settings.get('im_hide_dialogs'))
         vkopt.messages.dialogs_hide_init();
   },
   onLibFiles: function(fn){
      if (fn == 'ui_common.js'){
         Inj.End('uiActionsMenu.show', function(el){
            if (gpeByClass('_im_dialog_action_wrapper', el))
               vkopt.messages.acts_menu();
         })
      }
      if (fn == 'tooltips.js')
         Inj.End('tooltips.show', function(el, opts){
            if (el && /im-page--dialogs-settings/.test(el.className||''))
               vkopt.messages.dialogs_menu();
         })
   },
   processNode: function(node, params){
      if (!vkopt.settings.get('audio_dl') || !node || (params && params.source == "getTemplate" && params.tpl_name!="im_msg_row")) return;
      var amsg = geByClass('audio-msg-track', node);
      for (var i = 0; i < amsg.length; i++){
         var msg = amsg[i];
         if (!msg || !msg.parentNode || geByClass1('vk_audio_msg_btns', msg.parentNode)) // чтоб повторно не добавить кнопки
            continue;
         // выдираем ссылки на аудио
         var url_mp3 = attr(msg,'data-mp3'),
             url_ogg = attr(msg,'data-ogg');
         if (!url_mp3 && !url_ogg)
            continue;
         // создаём блок с кнопками по шаблону и добавляем после аудио-сообщения
         var dl_block = se(vk_lib.tpl_process(vkopt.messages.tpls['audio_msg_btns'],{
            url_mp3: url_mp3,
            url_ogg: url_ogg
         }));
         msg.parentNode.appendChild(dl_block);
      }
   },
   typing_mread_tip: function(el, prefix, type){
      var lng_cfg = {
         mark_read:{
            on:  IDL('BlockMarkAsReadON'),
            off: IDL('BlockMarkAsReadOFF'),
         },
         typing:{
            on:  IDL('BlockTypingON'),
            off: IDL('BlockTypingOFF')
         }
      };

      var cl = 'off_'+type;


      showTooltip(el, {
         text: function(){
            var state = hasClass(el, cl) ? 'on' : 'off';
            return lng_cfg[type][state];
         },
         black: true,
         shift: [4, 5]
      });
   },
   add_typing_read_icon: function(prefix, type){
      var el = (type == 'mark_read') ? ge('ui_rmenu_all') || geByClass1('_im_dialogs_settings') : geByClass1('im_chat-input--buttons');
      if(!el || ge(prefix+'_'+type+'_st')) return;
      var class_btn = vkopt.settings.get(prefix+'_block_'+type) ? 'off_'+type : '';
      var icon_btn = el.insertBefore(se(vk_lib.tpl_process(vkopt.messages.tpls['typing_mread_icon'], {
            class_btn: class_btn,
            prefix: prefix,
            type: type
      })), el.firstChild);
   },
   change_typing_mread_st: function(prefix, type){
      var option = prefix+'_block_'+type;
      var el = prefix+'_'+type+'_st';
      vkopt.settings.get(option) ? vkopt.settings.set(option, 0) : vkopt.settings.set(option, 1);

      toggleClass(el, 'off_'+type)
      //ge(el).classList.toggle('off_'+type);
      vkopt.cmd({
          act:'update_typing_mread_icon',
          el:el,
          type:type
      });
      el = ge(el);
      if (el.tt){
         el.tt.hide({fasthide:1});
         el.tt.show();
      }
      //vkopt.messages.typing_mread_tip(el, prefix, type);
      return false;
   },
   info_icon: function(){
      var p = geByClass1('_im_dialogs_settings');
      if (!p || ge('vk_msg_info_btn')) return;
      p.insertBefore(se(vkopt.messages.tpls['info_btn']), p.firstChild);
   },
   timeout_online_count_users: null,
   online_count_update_interval: 20000,
   online_count_users: function(){ // in chats
      if (!vkopt.settings.get('im_show_online_count')) return;
      /*var attr, list = geByClass('im-mess-stack--lnk'); // Как дополнение. Всплывающее меню при наведении на имя
      for (var key in list){				                   // Будет везде: и в лс, и в беседах. Можно перенести чуть ниже, чтобы сделать только для бесед.
         attr = list[key].getAttribute('href');	          // Для мгновенной отправки сообщения в лс.
         list[key].setAttribute('mention_id', attr.substr(1));
         list[key].setAttribute('onmouseover', 'mentionOver(this)');
      }*/
      var p = geByClass1('_im_page_peer_online');
      if (!p || !geByClass1('_im_chat_members')) return;
      var chatId = cur.peer - 2000000000;
      var body_code = 'var listUsers = API.messages.getChatUsers({"chat_id":'+chatId+',"fields":"online"});'+
                      'var i = 0, count = 0;'+
                      'while(listUsers[i]){'+
                      'if(listUsers[i].online == 1) count=count+1; i=i+1;}'+
                      'return count;';
      dApi.call('execute',{v:'5.73', code:body_code},function(r){
         if (!ge('countUsers'))
           p.appendChild(se('<span id="countUsers" onmouseover="vkopt.messages.show_on_users(this)"></span>'));
         ge('countUsers').innerHTML = r.response > 0 ? ' ('+langNumeric(r.response, IDL('online_count'))+')' : '';

         //p.insertBefore(se('<span id="countUsers"> ('+r.response+' онлайн)</span>'), p.nextSibling);
      });
   },
   show_on_users:  function(el){
      var chatId = cur.peer - 2000000000;
      var body_code = 'return API.messages.getChatUsers({"chat_id":'+chatId+',"fields":"photo_50,online,domain"});';
      dApi.call('execute',{v:'5.75', code:body_code},function(r){
         var items='', mob='' , i=0, on = 0, u = {};
         while(r.response[i]){
            if(r.response[i]['online'] == 1){
               u = r.response[i];
               mob = (u['online_mobile']) ? '<b class="mob_onl im_status_mob_onl"></b>' : '';
               items = items+vk_lib.tpl_process(vkopt.messages.tpls['users_item'],{
                  fullName: u['first_name']+' '+u['last_name'],
                  photo: u['photo_50'],
                  domain: u['domain'],
                  mobile: mob
               });
               on++;
            }
            i++;
         }
         ge('countUsers') && (ge('countUsers').innerHTML = ' ('+langNumeric(on, IDL('online_count'))+')');

         var html = '<div class="vk_users_items_wrap" style="max-height:250px;">' + items + '</div>';

         var statusTT = new ElementTooltip(el,{
             content: html,
             width: 250,
             rightShift: 80,
             elClassWhenShown: "vk_users_items_tt_shown",
             id: "vk_users_items_tt",
             appendToParent: true,
             onFirstTimeShow: function(e) {
                 this.sb = new uiScroll(geByClass1("vk_users_items_wrap", e),{
                     global: true
                 })
             },
             onShow: function() {
                 setTimeout(function() {
                     statusTT.sb.update()
                 }, 0)
             }
         });
         statusTT.show();
         statusTT.sb.update();
      });
   },
   show_info: function(el){ // показываем количество сообщений и диалогов
      var code_body = 'return {';
      code_body += '"in_count": API.messages.get({"count":1,"offset":0,"out":0,"preview_length":2}).count,' +
                   '"out_count": API.messages.get({"count":1,"offset":0,"out":1,"preview_length":2}).count,' +
                   '"dialogs_count": API.messages.getDialogs({"count":0,"unread":0}).count';
      code_body += '};';

      dApi.call('execute',{v:'5.53', code:code_body},function(r){
         var html = vk_lib.tpl_process(vkopt.messages.tpls['info_content'], r.response);
         showTooltip(el, {
            text: html,
            black: 1,
            zIndex: 1,
            toup: true
         });
      });
   },
   dialogs_menu: function(){
      var menu = geByClass1('_im_settings_popup');
      if (!menu) return;
      !ge('vk_search_deleted_item') && menu.appendChild(se(vk_lib.tpl_process(vkopt.messages.tpls['search_deleted_item'])));
   },
   acts_menu: function(){
      if (ge('vk_im_acts_sep')) return;
      var p = geByClass1('im-page--header-more');
      if (!p) return;
      var menu = geByClass1('ui_actions_menu', p);
      if (!menu) return;
      menu.appendChild(se(vkopt.messages.tpls['menu_separator']));
      menu.appendChild(se(vk_lib.tpl_process(vkopt.messages.tpls['acts_export_history_item'])));
      menu.appendChild(se(vk_lib.tpl_process(vkopt.messages.tpls['acts_to_beginning_item'])));
      var raw_list = vkopt_core.plugins.call_modules('onDialogActsMenu'),
          list = [];
      for (var key in raw_list)
         list.push(raw_list[key]);
      var nodes = sech(list.join('\n')); //создаём массив элементов
      for (var i in nodes)
         menu.appendChild(nodes[i]);
   },
   dialogs_hide_init: function(){
      var dialogs  = geByClass1('im-page--dialogs');

      if (geByClass1('im-page--history_empty'))
         show(dialogs);

      !hasClass('im--page','vk_hide_dialogs_toggler') && addEvent('im--page','click',function(e){
         if (!vkopt.settings.get('im_hide_dialogs'))
            return;
         addClass('im--page','vk_hide_dialogs_toggler');
         if (domClosest('im-page--chat-body',e.target) || domClosest('im-page--chat-input',e.target))
            hide(dialogs);
         if (domClosest('im-page--header-chat',e.target))
            toggle(dialogs)
      });
   },
   go_to_beginning: function(){
      var sel_id = nav.objLoc['sel'];
      var cur_loc = clone(nav.objLoc);
      dApi.call('messages.getHistory',{user_id:cur.peer, count:1, rev:1, v:'5.73'},function(r,response){
         if (!(response && response.items && response.items[0]))
            return vkMsg(IDL('Error'));
         nav.go(extend(cur_loc, {sel:''}));
         setTimeout(function(){
            nav.go(extend(cur_loc, {msgid: response.items[0].id,sel:sel_id}));
         },300);
      })
   },
   search_deleted: function(){
      var get_last_msg_id = function(cb){
         var dt = (new Date()).format('HH:MM:ss dd.mm.yyyy');
         var code  =
            'var user = API.users.get({})[0];'+
            'return API.messages.send({'+
               'user_id:user.id, '+
               'message: user.first_name+", '+IDL('SearchDeletedMessagesStarted')+' ('+dt+')"'+
            '});';
         dApi.call('execute',{code:code, v:'5.73'}, function(r){
            cb(r.response || 0);
         });
      }
      //window.vk_deleted_messages = [];
      var msg = [];//window.vk_deleted_messages;
      var del_ids = [];
      var restored = 0;
      var total_try = 0;
      var last_msg = 0;
      var offset = 0;
      var width = 0;

      var restore_stage = 0;
      var restore_max_progress = 0;

      var collect = function(cb){
         var ids = [];
         var PER_REQ = 50;
         var PER_EXEC = 10;
         for (var i = 0; (i < PER_REQ * PER_EXEC) && (offset > 0); i++)
            ids.push(offset--);

         var code = [];
         while(ids.length)
            code.push('API.messages.getById({"message_ids":"'+ids.splice(0,PER_REQ).join(',')+'"}).items');
         code = 'return ' + code.join('+') + ';'

         ge('vk_scan_msg').innerHTML = vkProgressBar(last_msg - offset, last_msg, width, IDL('MessagesScan') + ' %'+(offset > 0 ? ' (id:' + offset + ')' : ''));

         dApi.call('execute', {code: code, v:'5.73'}, function(r){
            if (r && r.response){
               r.response.forEach(function(item, idx){
                  if (item.deleted){
                     msg.push(item);
                     del_ids.push(item.id);
                  }
               })

               ge('vk_scan_msg').innerHTML = vkProgressBar(last_msg - offset, last_msg, width, IDL('MessagesScan') + ' %'+(offset > 0 ? ' (id:' + offset + ')' : ''));
               ge('vk_msg_found_cnt').innerHTML = msg.length;

               /*
               if (!restoring){
                  ge('vk_restore_msg').innerHTML = restored > 0 ? 'Restored: <b>' + restored + '</b>' : '';
                  var r_btn = se('<div class="button_blue"><button>try restore '+del_ids.length+' messages</button></div>');
                  ge('vk_restore_msg').appendChild(r_btn);
                  addEvent(r_btn, 'click', function(ev){
                     restore();
                  });
               }
               */
               restore_stage++;
               restore_max_progress = 0;
               restore(function(){
                  if (offset > 0){
                     setTimeout(function(){collect(cb)},300);
                  } else {
                     cb();
                  }
               })

            } else {
               console.log('API EXEC FAILED: ', code);
            }

         })
      }
      var restore_executed = false;
      var restore = function(cb){
         if (!del_ids.length || !isChecked(chk)){
            restore_executed = false;
            cb && cb();
            return;
         }
         restore_executed = true;
         restore_max_progress = Math.max(restore_max_progress, del_ids.length);
         var code = [];
         for (var i = 0; i < 15 && del_ids.length; i++)
            code.push('API.messages.restore({message_id:'+del_ids.shift()+'})');
         code = 'return [ ' + code.join(',') + ' ];'

         dApi.call('execute', {code: code, v:'5.73'}, function(r){
             if (r && r.response){
                total_try += r.response.length;
                restored += r.response.filter(function(item){return item}).length;
                var prog_txt = vk_lib.format(IDL('MessagesRestoreProgress'), restored, total_try);
                ge('vk_restore_msg').innerHTML = vkProgressBar(restore_max_progress - del_ids.length, restore_max_progress, width, prog_txt +' (#'+restore_stage+' / %)');
             } else {
                console.log('API EXEC RESTORE FAILED: ', code);
             }
             if (del_ids.length){
                setTimeout(restore,300);
             } else {
                restore_executed = false;
                var prog_txt = vk_lib.format(IDL('MessagesRestoreProgress'), restored, total_try);
                ge('vk_restore_msg').innerHTML = vkProgressBar(restore_max_progress - del_ids.length, restore_max_progress, width, prog_txt +' (#'+restore_stage+' / %)');
                cb && cb();
             }

         })
      }

      var box = new MessageBox({
            title : IDL('SearchDeletedMessages'),
            closeButton : true,
            width : "650px"
         });
      box.changed = true;
      box.removeButtons();
      box.addButton(IDL('Cancel'), function (r) {
         abort = true;
         box.hide();
      }, 'no');

      box.show();
      var width = getSize(box.bodyNode, true)[0];
      box.content(vk_lib.tpl_process(vkopt.messages.tpls['search_deleted_content'],{}));
      box.setControlsText(vk_lib.tpl_process(vkopt.messages.tpls['try_restore_chk'],{}));
      box.changed = true;
      var chk = ge('vk_msg_try_restore');
      addEvent(chk, 'click', function(e){
         checkbox(chk);
         if (!restore_executed && done && isChecked(chk))
            restore();
      })
      addEvent('vk_msg_save_html', 'click', function(e){
         vkopt.messages.export_data(msg);
      })
      addEvent('vk_msg_save_json', 'click', function(e){
         vkopt.save_file(JSON.stringify(msg,'', '   '), 'deleted_messages'+vk.id+' '+(new Date())+'.json');
      });
      var done = false;
      get_last_msg_id(function(id){
         if (!id){
            alert('Nothing...');
            return;
         }
         last_msg = id;
         offset = id;
         collect(function(){
            done = true;
            val('vk_restore_info',vk_lib.tpl_process(vkopt.messages.tpls['search_deleted_done'],{}));
         })
      });
   },
   get: function(out, offset, count, onDone) {
		var code_body='';
		var code_r=[];
		var steps=Math.ceil(count/100);
		for (var i=0; i<steps;i++){
			var obj={count:count>100?100:count, offset:offset,out:out,preview_length:0};
			code_body+='var x'+i+'=API.messages.get('+JSON.stringify(obj)+');\n';
			code_r.push('x'+i);
			count-=100;
			offset+=100;
		}
		code_body+='\nreturn ['+code_r.join(',')+'];';
		dApi.call('execute',{v:'5.53', code:code_body},function(r){
			var res=[];
         var count = 0;
			var m=r.response;
			for (var i=0;i<m.length;i++){
				count = m[i].count || count;
            if (m[i].items && m[i].items.length>0)
					res = res.concat(m[i].items)
			}
			onDone({response:{count: count, items: res}});
		});
	},

   export_box: function(peer){
      peer = peer || cur.peer;
      var html = vk_lib.tpl_process(vkopt.messages.tpls['export_box'],{
         peer: peer
      });
      vkAlertBox(IDL('SaveHistory'), html, null, null, true);
      return false;
   },
   make_html: function(msg,user){
      var html='';
      var t2d = function(unix){
         var time = new Date(unix*1000);
         return time.getFullYear()+'.'+('0'+(time.getMonth()+1)).slice(-2)+'.'+('0'+time.getDate()).slice(-2)+' '+('0'+time.getHours()).slice(-2)+':'+('0'+time.getMinutes()).slice(-2)+':'+('0'+time.getSeconds()).slice(-2);
      };
      var t2m = function(inputText) {
         var replacedText,replacePattern2,replacePattern3;
         //add break
         replacedText = replaceEntities(inputText).replace(/&/g,'&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />').replace(/"/g, '&quot;');

            /*
                           replacedText.replace(/&#(\d\d+);/g,function(s, c) {
                                  c=replaceEntities('&#'+c+';')
                                  return c.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br />').replace(/"/g, '&quot;');
                           }
            */
          //URLs starting with http://, https://, or ftp://
          replacePattern2 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\\/%?=~_|!:,.;\u0410-\u042f\u0430-\u044f\u0401\u0451]*[-A-Z0-9+&@#\/%=~_|\u0410-\u042f\u0430-\u044f\u0401\u0451])/gim; // /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;А-Яа-яЁё]*[-A-Z0-9+&@#\/%=~_|А-Яа-яЁё])/gim;
          replacedText = replacedText.replace(replacePattern2, '<a href="$1" target="_blank">$1</a>');
          //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
          replacePattern3 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
          replacedText = replacedText.replace(replacePattern3,'$1<a href="http://$2" target="_blank">$2</a>');

         if (window.Emoji && Emoji.emojiToHTML)
            replacedText = Emoji.emojiToHTML(replacedText,true).replace(/"\/images\//g,'"http://vk.com/images/') || replacedText;

          return replacedText;
      };
		var doc2text=function(t){
			// проверка < и > в именах документов
			return t.replace(/</g, '&lt;').replace(/>/g,'&gt;').replace(/"/g, '&quot;').replace(/&/g,'&amp;');
		};
      var a2t = function(sec){
         return Math.floor(sec/60)+':'+('0'+(sec%60)).slice(-2);
      };
      var chatAction=function(action_name){
         switch(action_name){
            case 'chat_photo_update':
               html='<div style="color:#888888;">'+IDL('HistMsgChatAvaUpd')+'</div>';
               break;
            case 'chat_photo_remove':
               html='<div style="color:#888888;">'+IDL('HistMsgChatAvaDel')+'</div>';
               break;
            default:
               html='<div>action "<b>'+action_name+'</b>" is unknown</div>'
         }
         return html;
      };
      var make_ulink = function(id){
         return 'http://vk.com/'+(id > 0 ? 'id' : 'club')+ Math.abs(id);
      }
      var make_attachments=function(attachments){
         var html = '';
         if(attachments !== undefined){
            html+='<div class="attacments"> <b>'+IDL('HistMsgAttachments')+'</b> </div>';
            var l=attachments.length;
            for(var k=0;k<l;k++){
               html+=make_attach(attachments[k]);
            }
         }
         return html
      }
      var make_attach=function(attach){
         var html='';
         if (!attach[attach.type]){
            //console.log('Attach broken?', attach);
            attach[attach.type]={};
         }
         switch (attach.type){
            case 'photo':
               var photolink=attach.photo.photo_2560 || attach.photo.photo_1280 || attach.photo.photo_807 || attach.photo.photo_604;
               var photo_size=attach.photo.width ? ' ('+attach.photo.width+'x'+attach.photo.height+')' : '';
               html+='<div class="attacment"> <div class="att_ico att_photo"></div> <a target="_blank" href="'+photolink+'">[photo'+attach.photo.owner_id+'_'+attach.photo.id+']'+photo_size+'</a> </div>';
               break;
            case 'audio':
               var url = attach.audio.url;
               if (!url){
                  url = 'http://vk.com/audio?q='+encodeURIComponent(attach.audio.artist+' - '+attach.audio.title);
               }
               html+='<div class="attacment"> <div class="att_ico att_audio"></div> <a target="_blank" href="'+url+'">[audio'+attach.audio.owner_id+'_'+attach.audio.id+'] '+doc2text(attach.audio.artist)+' - '+doc2text(attach.audio.title)+' ('+a2t(attach.audio.duration)+')</a></div>';
               break;
            case 'video':
               html+='<div class="attacment"> <div class="att_ico att_video"></div> <a href="http://vk.com/video'+attach.video.owner_id+'_'+attach.video.id+'" target="_blank">[video'+attach.video.owner_id+'_'+attach.video.id+'] '+doc2text(attach.video.title)+' ('+a2t(attach.video.duration)+')</a></div>';
               break;
            case 'doc':
               html+='<div class="attacment"> <div class="att_ico att_doc"></div> <a target="_blank" href="'+attach.doc["url"].replace(/&/g,'&amp;')+'">'+doc2text(attach.doc.title)+'</a></div>';
               break;
            case 'wall':
               html+='<div class="attacment"> <div class="att_ico att_wall"></div> <a target="_blank" href="http://vk.com/wall'+attach.wall.to_id+'_'+attach.wall.id+'">[wall'+attach.wall.to_id+'_'+attach.wall.id+']</a><div class="att_wall_text">'+attach.wall.text+'</div>'+make_attachments(attach.wall.attachments)+'</div>';
               break;
            case 'wall_reply':
               html+='<div class="attacment"> <div class="att_ico att_wall"></div> <a target="_blank" href="http://vk.com/wall'+attach.wall_reply.owner_id+'_'+attach.wall_reply.post_id+'">[wall'+attach.wall_reply.owner_id+'_'+attach.wall_reply.post_id+']</a> <div class="att_wall_text">'+attach.wall_reply.text+'</div>'+make_attachments(attach.wall_reply.attachments)+'</div>';
               break;
            case 'link':
               html+='<div class="attacment attb_link"> <div class="att_ico att_link"></div> <a href="'+attach.link.url+'" target="_blank"><span>'+IDL('HistMsgAttachLink')+'</span> '+doc2text(attach.link.title)+'</a></div>';
               break;
            case 'gift':
               html+='<div class="attacment"> <div class="att_ico att_gift"></div> <a target="_blank" href="'+attach.gift.thumb_256+'">'+IDL('HistMsgAttachGift')+' #'+attach.gift.id+'</a></div>';
               break;
            case 'sticker':
               html+='<div class="attacment"> <div class="att_ico att_sticker"></div> <a target="_blank" href="'+attach.sticker.photo_256+'">'+IDL('HistMsgAttachSticker')+' #'+attach.sticker.id+'</a></div>';
               break;
            default:
               html+='<div class="attacment"><pre>'+JSON.stringify(attach,'','   ')+'</pre></div>';
               //console.log(attach.type+' is unknown');
         }
         return html;
      };
		var make_geo=function(m){
			var html='';
         html+='<div class="attacment"> <div class="att_ico att_geo"></div> <a href="https://maps.google.ru/maps?q='+m.geo['coordinates']+'" target="_blank">'+IDL('HistMsgGeoAttach')+' '+(m.geo['place'] || {'title':'---'})['title']+'</a></div>';
			return html;
		};

      // write data
      html+='<h4> '+IDL('HistMsgDates').replace(/%start/g,t2d(msg[0].date)).replace(/%end/g,t2d(msg[msg.length-1].date))+' </h4>';
      html+='<h4> '+IDL('HistMsgCount').replace(/%count/g,msg.length)+' </h4>';
      html+='<hr>';

      // icons
      // http://vk.com/images/icons/mono_iconset.gif

      // build
      for(var i=0,j=msg.length;i<j;i++){
         var from_id = msg[i].from_id || msg[i].user_id;
         var u=(user[from_id] || {
                           id: from_id,
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        } );
         html+='<div id="msg'+msg[i].id+'" class="msg_item">';
         html+='<div class="upic"><img src="'+u.photo_100+'" alt="[photo_100]"></div>';
         html+='<div class="from"> <b>'+u.name+'</b> <a href="'+make_ulink(from_id)+'" target="_blank">@'+u.domain+'</a> <a href="#msg'+msg[i].id+'">'+t2d(msg[i].date)+'</a></div>';

         if(msg[i].body != ""){
               html+='<div class="msg_body">'+t2m(msg[i].body)+'</div>';
         }
         if(msg[i].action){
            html+=chatAction(msg[i].action);
         }
         if(msg[i].attachments !== undefined){
            html+='<div class="attacments"> <b>'+IDL('HistMsgAttachments')+'</b> </div>';
            var l=msg[i].attachments.length;
            for(var k=0;k<l;k++){
               html+=make_attach(msg[i].attachments[k]);
            }
         }
         //геолокаци
         if(msg[i].geo !== undefined)
            html+=make_geo(msg[i]);

         if(msg[i].fwd_messages !== undefined){
            initfwd(msg[i].fwd_messages);
         }
         html+='</div>';
      }
      html+='<hr>';

      function initfwd(msgfwd){
         html+='<div class="att_head"> <div class="att_ico att_fwd"></div> '+IDL('HistMsgFwd')+' </div>';
         html+='<div class="fwd">';
         for(var k=0,l=msgfwd.length;k<l;k++){
            var u = (user[msgfwd[k].user_id] || {
                           id: msgfwd[k].user_id,
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        } );
			html+='<div class="msg_item">';
            html+='<div class="upic"><img src="'+
			u.photo_100+
			'" alt="[photo_100]"></div>';
            html+='<div class="from"> <b>'+u.name+'</b> <a href="'+make_ulink(msgfwd[k].user_id)+'" target="_blank">@'+u.domain+'</a> '+t2d(msgfwd[k].date)+'</div>';
            html+='<div class="msg_body"> '+t2m(msgfwd[k].body)+'</div>';
            if(msgfwd[k].attachments !== undefined){
               html+='<div class="attacments"> <b>'+IDL('HistMsgAttachments')+'</b> </div>';
               var n=msgfwd[k].attachments.length;
               for(var m=0;m<n;m++){
                  html+=make_attach(msgfwd[k].attachments[m]);
               }
            }
            if(msgfwd[k].geo !== undefined)
               html+=make_geo(msgfwd[k]);

            if(msgfwd[k].fwd_messages !== undefined){
               initfwd(msgfwd[k].fwd_messages);
            }
            html+='</div>';
         }
         html+='</div>';
      }
      return html;
   },
   export_data: function(messages){
      var users_ids = [];
      var groups_ids = [];
      var history_uids={};

      var collect_users=function(arr){
         var add_ugid = function(id){
            var add_to = id > 0 ? users_ids : groups_ids;
            id = Math.abs(id);
            if (id && add_to.indexOf(id)==-1) add_to.push(id);
         }
         for (var i=0; i<arr.length; i++){
            var msg=arr[i];
            //console.log(msg)
            if (msg.from_id) history_uids[msg.from_id]='1';
            if (msg.user_id) history_uids[msg.user_id]='1';
            add_ugid(msg.from_id);
            add_ugid(msg.user_id);
            if (msg.fwd_messages)
               collect_users(msg.fwd_messages);
               //for (var i=0; i<msg.fwd_messages.length; i++)
         }
      };
      var users={};
      var load_users_info = function(callback){
         var get_users = function(cb){
            if (users_ids.length){
               dApi.call('users.get',{user_ids:users_ids.join(','),fields:'photo_100,screen_name',v:'5.73'},function(r){
                  ldr && (ldr.innerHTML = vkProgressBar(90,100,w,'Users data... %'));
                  var usrs=r.response;

                  for (var i=0; i<usrs.length; i++){
                     usrs[i].name = usrs[i].first_name+' '+usrs[i].last_name
                     usrs[i].domain = usrs[i].screen_name;
                     users[usrs[i].id]=usrs[i];
                  }
                  for (var i=0; i<users_ids.length; i++)
                     if (!users[users_ids[i]])
                        users[users_ids[i]]={
                           id: users_ids[i],
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        };
                  cb && cb();
               });
            } else {
               cb && cb();
            }
         }

         var get_groups = function(cb){
            if (groups_ids.length){
               dApi.call('groups.getById',{group_ids:groups_ids.join(','),fields:'photo_100,screen_name',v:'5.73'},function(r){
                  ldr && (ldr.innerHTML = vkProgressBar(95,100,w,'Groups data... %'));
                  var grps=r.response;
                  for (var i=0; i<grps.length; i++){
                     grps[i].domain = grps[i].screen_name
                     users['-'+grps[i].id]=grps[i];
                  }

                  for (var i=0; i<users_ids.length; i++)
                     if (!users[users_ids[i]])
                        users[users_ids[i]]={
                           id: users_ids[i],
                           name: 'DELETED',
                           first_name: 'DELETED',
                           last_name: '',
                           photo_100: 'http://vk.com/images/deactivated_c.gif'
                        };
                  cb && cb();
               });
            } else {
               cb && cb();
            }
         }
         get_users(function(){
            get_groups(function(){
               callback && callback();
            })
         });
      }


      collect_users(messages);
      var ldr = ge('saveldr');
      if (ldr){
         var w=getSize(ge('saveldr'),true)[0];
         ldr.innerHTML=vkProgressBar(0,100,w,'Users data... %');
      }


      load_users_info(function(){
         var html=vkopt.messages.make_html(messages, users);
         html = vk_lib.tpl_process(vkopt.messages.tpls['history_html'], {
               body_class: !vkopt.settings.get('disable_border_radius') ? 'round_upic' : ' ',
               messages_body: html
            });
         ldr && (ldr.innerHTML=vkProgressBar(100,100,w,'Export data... %'));
         show('save_btn_text');
         hide('saveldr');

         var file_name=[];
         for (var key in users){
            var uid=parseInt(key || '0');
            if (history_uids[key] && !(window.vk && uid==vk.id)) file_name.push(users[key].name+'('+uid+')');
         }

         html=html.replace(/%title/g,'VK Messages: '+file_name.join(','));
         vkopt.save_file(html,"messages_"+vkCleanFileName(file_name.join(',')).substr(0,250)+".html");
      });
   },
   load_dump: function(callback){
        vkopt.load_file(function(data){
           var contents = JSON.parse(data);
           vkopt.messages.export_data(data);
        })
   },
   get_history:function(uid){
      if (!uid) uid=cur.thread.id;
      var PER_REQ=100;
      var offset=0;
      var messages = [];
      var scan=function(){
         hide('save_btn_text');
         show('saveldr');
         //document.title='offset:'+offset;
         var w = getSize(ge('saveldr'),true)[0];
         if (offset==0) ge('saveldr').innerHTML=vkProgressBar(offset,10,w);

         var code=[];
         for (var i=0; i<10; i++){
            code.push('API.messages.getHistory({user_id:'+uid+', count:'+PER_REQ+', offset:'+offset+', rev:1}).items');//
            offset+=PER_REQ;
         }
         dApi.call('execute',{code:'return {count:API.messages.getHistory({user_id:'+uid+', count:0, offset:0}).count, items:'+code.join('+')+'};',v:'5.73'},function(r){
            var msgs = r.response.items;
            var count = r.response.count;
            ge('saveldr').innerHTML=vkProgressBar(offset,count,w);

            messages = messages.concat(msgs);
            if (msgs.length>0){
               setTimeout(scan,350);
            } else {
               vkopt.messages.export_data(messages);
            }
         });
      };
      scan();
   },
   get_history_txt: function(uid,show_format){
      if (!uid) uid=cur.thread.id;
      var offset=0;
      var result='';
      var user1='user1';
      var msg_pattern = vkopt.settings.get('msg_exp_pattern')  ||  vkopt_defaults.config.SAVE_MSG_HISTORY_PATTERN;
      var date_fmt = vkopt.settings.get('msg_exp_date_fmt') || vkopt_defaults.config.SAVE_MSG_HISTORY_DATE_FORMAT;
      msg_pattern=msg_pattern.replace(/\r?\n/g,'\r\n');
      date_fmt=date_fmt.replace(/\r?\n/g,'\r\n');
      var users={};
      var users_ids=[];
      var history_uids={};
      var collect=function(callback){
         hide('save_btn_text');
         show('saveldr');
         var w=getSize(ge('saveldr'),true)[0];
         if (offset==0) ge('saveldr').innerHTML=vkProgressBar(offset,10,w);
         dApi.call('messages.getHistory',{uid:uid,offset:offset,count:100},function(r){
            //console.log(r);
            //return;
            ge('saveldr').innerHTML=vkProgressBar(offset,r.response[0],w);
            var msgs=r.response;
            var count=msgs.shift();
            msgs.reverse();
            var msg=null;
            var res='';
            var make_msg=function(msg,level){
               level=level || 0;
               var from_id= msg.from_id || msg.uid;
               if (msg.from_id) history_uids['%'+msg.from_id+'%']='1';
               if (!users['%'+from_id+'%']){
                  users['%'+from_id+'%']='id'+from_id+' DELETED';
                  users_ids.push(from_id);
               }

               var attach_text="";
               for (var j=0; msg.attachments && j<msg.attachments.length;j++){
                  var attach=msg.attachments[j];
                  switch(attach.type){
                     case  "photo":
                        var a=attach.photo;
                        var src=a.src_xxxbig || a.src_xxbig || a.src_xbig || a.src_big || a.src || a.src_small;
                        var link="vk.com/photo"+a.owner_id+'_'+a.pid;
                        attach_text+=link+" : "+src+"\r\n"+(a.text?a.text+"\r\n":"");
                        break;
                     case  "video":
                        var a=attach.video;
                        var link="vk.com/video"+a.owner_id+'_'+a.vid;
                        attach_text+=link+" : "+(a.title?a.title+"\r\n":"")+"\r\n"+(a.description?a.description+"\r\n":"");

                        break;
                     case  "audio":
                        var a=attach.audio;
                        var link="vk.com/audio?id="+a.owner_id+'&audio_id='+a.aid;
                        attach_text+=link+" : "+(a.performer || "")+" - "+(a.title || "")+"\r\n";
                        break;
                     case  "doc":
                        var a=attach.doc;
                        attach_text+=a.url+" ("+vkFileSize(a.size)+"): "+a.title+"\r\n";
                        break;
                     default:
                       attach_text+=JSON.stringify(attach)+'\r\n';
                     /*
                     case  "wall":

                        break;*/
                  }

               }
               //console.log(msg);
               var date=(new Date(msg.date*1000)).format(date_fmt);
               var user='%'+from_id+'%';//(msg.from_id==mid?user2:user1);
               var msgBody = msg.body.replace(/<br>/g, '\r\n');

               var ret=msg_pattern
                    .replace(/%username%/g,user) //msg.from_id
                    .replace(/%date%/g,    date)
                    .replace(/%message%/g, msgBody)
                    .replace(/%attachments%/g, (attach_text!=""?"Attachments:[\r\n"+attach_text+"]":""));
               var tab='\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t';
               ret=ret.replace(/^.+$/mg,tab.substr(0,level)+"$&");
               if (msg.fwd_messages)
               for (var i=0; i<msg.fwd_messages.length; i++)
                  ret+=make_msg(msg.fwd_messages[i],level+1);
               return ret;
            };
            for (var i=0;i<msgs.length;i++){
               msg=msgs[i];
               res+=make_msg(msg);
            }
            result=res+result;
            if (offset<count){
               offset+=100;
               setTimeout(function(){collect(callback);},300);
            } else {
               //alert(result);
               callback(result);
            }
         });
      };
      var run=function(){
            collect(function(t){
               dApi.call('getProfiles',{uids:users_ids.join(',')/*remixmid()+','+uid*/},function(r){
                  var file_name=[];
                  for (var i=0;i<r.response.length;i++){
                     var u=r.response[i];
                     users['%'+u.uid+'%']=u.first_name+" "+u.last_name;

                  }
                  for (var key in users){
                     var uid=parseInt((key || '0').replace(/%/g,''));
                     if (history_uids[key] && !(window.vk && uid==vk.id)) file_name.push(users[key]+'('+uid+')');
                     t=t.split(key).join(users[key]);
                  }

                  show('save_btn_text');
                  hide('saveldr');
                  //alert(t);
                  vkopt.save_file(t,"messages_"+vkCleanFileName(file_name.join(',')).substr(0,250)+".txt");

               });
            });

      };

      if (show_format){
         var aBox = new MessageBox({title: IDL('SaveHistoryCfg')});
         aBox.removeButtons();
         aBox.addButton(IDL('Hide'), aBox.hide, 'no');
         aBox.addButton(IDL('OK'),function(){
            msg_pattern=ge('vk_msg_fmt').value;
            date_fmt=ge('vk_msg_date_fmt').value;
            msg_pattern=msg_pattern.replace(/\r?\n/g,'\r\n');
            date_fmt=date_fmt.replace(/\r?\n/g,'\r\n');
            vkopt.settings.set('msg_exp_pattern', msg_pattern);
            vkopt.settings.set('msg_exp_date_fmt', date_fmt);
            aBox.hide();
            run();
         },'yes');

         var html = vk_lib.tpl_process(vkopt.messages.tpls['msg_exp_txt_cfg'],{
            msg_pattern: msg_pattern,
            date_fmt: date_fmt
         })
         aBox.content(html);
         aBox.show();
      } else run();
   }
};

vkopt['attacher'] = {
   tpls: null,
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .docs_choose_upload_area_wrap:hover .vk_doc_upload_cfg {
              max-height: 100px;
         }

         .vk_doc_upload_cfg {
             max-height: 0px;
             transition: max-height 1000ms ease-out 500ms;
             overflow: hidden;
         }

         .vk_doc_upload_cfg_cont {
             padding: 10px 52px;
             background-position: 23px 11px;
             border-bottom: 1px solid #e7e8ec;
         }
         .vk_doc_upload_cfg_cont .checkbox{
            display: inline-block;
         }
         .vk_doc_recent_graffiti{
            margin-left: -2px;
            margin-right:-2px;
         }
         .vk_doc_recent_graffiti div{
            cursor: pointer;
         }

         .doc_show_graffiti:before {
             position: absolute;
             left: 5px;
             content: '';
             width: 22px;
             height: 22px;
             background: url(/images/post_icon.png?10) no-repeat;
             background-position-y: -173px;
             opacity: 0.7;
         }

         .ui_search_field_empty .doc_show_graffiti_btn {
             visibility: visible;
         }

         .doc_show_graffiti_btn {
             position: absolute;
             width: 38px;
             top: 0;
             bottom: 0;
             right: 6px;
             cursor: pointer;
             z-index: 4;
             opacity: 0.75;
             visibility: hidden;
             margin-top: 10px;
             margin-left: 2px;
             width: 22px;
             height: 22px;
             padding: 0 0 0 22px;
             display: block;
             float: left;
         }

         .doc_show_graffiti_btn:hover .doc_show_graffiti:before {
             opacity: 1;
         }

         .doc_show_graffiti_btn:before {
             content: attr(count);
             position: absolute;
             display: block;
             font-size: 10px;
             font-weight: bold;
             border-radius: 50%;
             color: #5b88bd;
             width: 16px;
             height: 16px;
             line-height: 16px;
             top: 10px;
             left: 19px;
         }
         #vk_doc_recent_graffiti{
            display:none;
         }
         .vk_doc_recent_graffiti_show #vk_doc_recent_graffiti{
            display:block;
         }

         .vk_hide_graffiti {
            position: absolute;
            display: block;
            background: rgba(0,0,0,0.6);
            width: 20px;
            height: 20px;
            line-height: 20px;
            top: 0;
            border-radius: 2px;
            right: -30px;
            transition: right 200ms linear;
            transition-delay: 800ms;
         }

         .vk_hide_graffiti:before {
            content: '\2A09';
            display: block;
            color: #FFF;
            font-weight: bold;
            text-align: center;
         }

         .photos_choose_row:hover  .vk_hide_graffiti {
            right: 0;
         }
         */
      }).css;
   },
   onSettings:{
      Extra: {
         attach_media_by_id:{},
         doc_recent_graffiti_show:{
            class_toggler: true,
            default_value: false
         }
      }
   },
   onInit: function(){
      vkopt.attacher.tpls = vk_lib.get_block_comments(function(){
         /*choose_audio_row:
         <div class="choose_audio_row">
            <a class="choose_link" onclick="return vkopt.attacher.audio.choose(event, this, '{vals.full_aid}');">{lng.Attach}</a>
            <div class="choose_row">{vals.audio_row}</div>
         </div>
         */
         /*doc_attach_cfg:
         <div class="vk_doc_upload_cfg">
            <div class="vk_doc_upload_cfg_cont vkopt_icon">
               <div class="checkbox" onclick="checkbox(this); return vkopt.attacher.doc.upload_as_graffiti(isChecked(this));" role="checkbox" aria-checked="false" tabindex="0">
                  {lng.UploadPngDocAsGraffiti}
               </div>
            </div>
         </div>
         */
         /*doc_graffiti_item:
         <div id="docs_choose_row{vals.doc_id}_" href="{vals.doc_url}" onclick="return Docs.chooseDoc(this, '{vals.doc_id}', {vals.doc_data}, event);" class="photos_choose_row fl_l _docs_choose_attach" onmouseover="addClass(this, 'over');" onmouseout="removeClass(this, 'over');">
            <div class="photo_row_img" style="background-image: url('{vals.thumb}')"></div>
            <div class="photos_choose_row_bg"></div>
            <div class="vk_hide_graffiti" onclick="return vkopt.attacher.doc.hide_graffiti(this, event, '{vals.doc_id}');"></div>
         </div>
         */
         /*doc_graffiti_show_btn: //insert before '.ui_search_field'
         <div class="doc_show_graffiti_btn" count="0" onclick="return vkopt.attacher.doc.recent_graffiti_toggle();" style="display:none">
            <span class="doc_show_graffiti"></span>
         </div>
         */

      });
   },
   onResponseAnswer: function(answer, url, q){
      if (!vkopt.settings.get('attach_media_by_id'))
            return;
      if (url == '/audio' && q.act == 'a_choose_audio_box' && !q.q && answer[2] && answer[2].replace){
         if (answer[2].indexOf('vkopt.attacher.audio.check_query') == -1)
            answer[2] = answer[2].replace(/(cur\.onChangeAudioQuery\s*=\s*function[^\{]+\{([\r\n\s]*))/,'$1vkopt.attacher.audio.check_query(arguments[0]);$2');
            answer[2] = answer[2].replace(/(box\.hideCloseProgress\(\);)/,'$1\n   vkopt.attacher.audio.check_query(cur.chooseAudioQuery);');
      }

      if (url == '/docs.php' && q.act == 'a_choose_doc_box' && !q.switch_tab && isString(answer[1])){
         // answer:
         // [0] - box title content
         // [1] - box body content
         // [2] - js
         answer[1] = vkopt_core.mod_str_as_node(answer[1], vkopt.attacher.doc.process_box_node, {source:'doc_attach_mod', url:url, q:q});
      }
         /*
         setTimeout(function(){
            Inj.Start('cur.onChangeAudioQuery','vkopt.attacher.audio.check_query(arguments[0]);')
         });
         */
   },
   doc: {
      process_box_node: function(node, params){
         var p = geByClass1('docs_choose_upload_area_wrap',node);
         if (!p || geByClass1('vk_doc_upload_cfg', node)) return;
         p.appendChild(se(vk_lib.tpl_process(vkopt.attacher.tpls['doc_attach_cfg'], {})));



         p = geByClass1('docs_choose_rows',node);
         if (!p || geByClass1('vk_doc_recent_graffiti', node)) return;
         var div = se('<div id="vk_doc_recent_graffiti", class="vk_doc_recent_graffiti clear_fix"></div>');
         if (p.firstChild)
            p.insertBefore(div,p.firstChild)
         else
            p.appendChild(div);

         p = geByClass1('ui_search_field',node);
         if (p && !geByClass1('doc_show_graffiti_btn',node)){
            p.parentNode.insertBefore(se(vk_lib.tpl_process(vkopt.attacher.tpls['doc_graffiti_show_btn'], {})),p)

         }

         setTimeout(vkopt.attacher.doc.recent_graffiti, 100);

      },
      upload_as_graffiti: function(val){
         if (val)
            Upload.vars[cur.uplId].type='graffiti'
         else
            delete Upload.vars[cur.uplId].type
      },
      recent_graffiti: function(){
         dApi.call('messages.getRecentGraffities',{limit:32, v:'5.74'},function(r, items){
            if(!items || items.length < 1) return;
            var btn = geByClass1('doc_show_graffiti_btn');
            if (btn){
               btn.setAttribute('count', items.length);
               show(btn);
            }

            stManager.add('photos.css');
            var html = [];
            for (var i = 0; i < items.length; i++){
               var item = items[i];
               var str_size = vkFileSize(item.size);
               var attach_data = {
                  "ext": item.ext,
                  "size": item.size,
                  "size_str": str_size,
                  "type": item.type,
                  "href": item.url,
                  "video_preview":false,
                  "video_preview_size":[],
                  "title": '<span class="doc_ext">'+item.ext.toUpperCase()+'</span>'+
                           '<div class="doc_title">'+
                              '<span class="doc_size">'+str_size+'</span>'+
                              '<div class="doc_label">'+clean(item.title)+'</div>'+
                           '</div>',
                  "title_plain": clean(item.title)
               }

               if (item.preview && item.preview.video){
                  attach_data.video_preview = item.preview.video.src;
                  attach_data.video_preview_size = [item.preview.video.width, item.preview.video.height];
               }

               var sizes = {};
               if (item.preview && item.preview.photo){
                  each(item.preview.photo.sizes, function(i,size){sizes[size.type] = size });
                  attach_data.thumb = (sizes.m || {}).src;
                  attach_data.thumb_s = (sizes.s || {}).src;
               }
               html.push(
                  vk_lib.tpl_process(vkopt.attacher.tpls['doc_graffiti_item'], {
                     doc_data: clean(JSON.stringify(attach_data)),
                     doc_id: item.owner_id + '_' + item.id,
                     doc_url: item.url,
                     thumb: (sizes.m || {}).src || '/images/camera_big.png'
                  })
               );
            }
            val('vk_doc_recent_graffiti', html.join('\n'))
         })
      },
      recent_graffiti_toggle: function(){
         var visible = vkopt.settings.get('doc_recent_graffiti_show');
         vkopt.settings.set('doc_recent_graffiti_show', !visible);
         return false;
      },
      hide_graffiti: function(el, ev, doc_full_id){
         cancelEvent(ev);
         var doc_id = (doc_full_id.match(/-?\d+_(\d+)/) || [])[1];
         if (!doc_id) return;
         var box = showFastBox(getLang('global_box_confirm_title'), IDL('HideRecentGraffitiConfirm'), getLang('global_delete'),function(){
            dApi.call('messages.hideRecentGraffiti',{doc_id:doc_id, v:'5.80'}, function(r, resp, err){
               if (resp){
                  box.hide();
                  setTimeout(function(){
                     fadeOut(ge('docs_choose_row'+doc_full_id+'_'));
                  },500);;
               } else if (err && err.error_msg) {
                  box.content(err.error_msg);
                  box.setButtons();
               } else {
                  box.content(getLang('global_unknown_error')+'<pre>'+JSON.stringify(r,'','   ')+'</pre>');
                  box.setButtons();
               }
            })
         }, getLang('box_cancel'));

      }
   },
   audio: {
      cache:{},
      check_query: function(s){
         clearTimeout(vkopt.attacher.audio.__debounce_check);
         vkopt.attacher.audio.__debounce_check = setTimeout(function(){
            var full_id = ((s || '').match(/audio_?(-?\d+_\d+)/i) || [])[1];
            if (full_id){
               if ((vkopt.attacher.audio.__last_aid != full_id) || !geByClass1('_audio_row_'+full_id,ge('choose_audio'))) // что повторно не вызывать перерендеринг
                  vkopt.attacher.audio.load_info(full_id);
               vkopt.attacher.audio.__last_aid = full_id;
            } else
               vkopt.attacher.audio.__last_aid = null;
         },400);
      },
      load_info: function(full_aid){
         if (vkopt.attacher.audio.cache[full_aid]){
            vkopt.attacher.audio.render(full_aid);
         } else
            ajax.post("al_audio.php", {
               act : "reload_audio",
               ids :  full_aid
            }, {
               onDone : function (data) {
                  if (!data){ // вероятно косяк с детектом множества однотипных действий
                     console.log('Load audio info failed:', full_aid);
                     setTimeout(function(){
                        console.log('try load again');
                        vkopt.attacher.audio.load_info(full_aid);
                     }, 10000);
                  } else {
                     each(data, function (i, info) {
                        var info_obj = AudioUtils.asObject(info);
                        vkopt.attacher.audio.cache[info_obj.fullId] = {arr: info, obj: info_obj};
                     });
                     vkopt.attacher.audio.render(full_aid);
                  }
               }
            })

      },
      render: function(full_aid){
         var cont = ge('choose_audio_rows');
         if (!cont ||  geByClass1('_audio_row_'+full_aid, cont)) return; // избегаем вывода дублей

         var info_obj = vkopt.attacher.audio.cache[full_aid].obj;
         var info_arr = vkopt.attacher.audio.cache[full_aid].arr;
         var row = se(
            vk_lib.tpl_process(vkopt.attacher.tpls['choose_audio_row'], {
               full_aid: info_obj.fullId,
               audio_row: AudioUtils.drawAudio(info_arr)
            })
         );
         cont.appendChild(row);
      },
      choose: function(ev, el, full_aid){
         window.event = window.event || ev;
         if (el.selected !== undefined) {
            cur.lastAddMedia.unchooseMedia(el.selected);
            el.selected = undefined;
            removeClass(domPN(el), 'audio_selected');
            el.innerHTML = IDL('Attach');
         } else {
            var info = vkopt.attacher.audio.cache[full_aid];
            var cnt = cur.attachCount && cur.attachCount() || 0;
            cur.chooseMedia('audio', full_aid, {
               performer : info.obj.performer,
               title : info.obj.title,
               info : info.obj.url,
               duration : info.obj.duration
            });
            if (!cur.attachCount || cur.attachCount() > cnt) {
               if (cur.lastAddMedia) {
                  el.selected = cur.lastAddMedia.chosenMedias.length - 1;
                  addClass(domPN(el), 'audio_selected');
                  el.innerHTML = IDL('Cancel');
               }
            }
         }
         window.event = undefined;
         return false;
      }
   }

};

vkopt['face'] =  {
   onSettings:{
      Media:{
         old_audio_btns: {
            title: 'seOldAudioButtons',
            class_toggler: true,
            sub:{
               compact_audio: {
                  title: 'seCompactAudio',
                  class_toggler: true
               },
               audio_full_title: {
                  title: 'seAudioFullTitles',
                  class_toggler: true
               }
            }
         }
      },

      vkInterface:{
         ad_block:{
            title: 'seADRem',
            class_toggler: true

         },
         disable_border_radius:{
            title: 'seDisableBorderRadius',
            class_toggler: true
         },
         old_white_background:{
            title: 'oldWhiteBackground',
            class_toggler: true
         },
         ru_vk_logo:{
            title: 'seVkontakteLogo',
            class_toggler: true
         },
         /*
         hide_big_like:{
            title: 'seHideBigLike',
            class_toggler: true
         },
         */
         hide_left_set:{
            title: 'seHideLeftSettings',
            class_toggler: true
         },
         hide_recommendations:{
            title:"seHideRecomendations",
            class_toggler: true
         },
         hide_stories:{
            title:"seHideStories",
            class_toggler: true
         },
         shift_page: {
            title: 'seShiftPageButtons',
            class_toggler: true,
            sub:{
               hide_shift_btn: {
                  title: 'seHideShiftBtn',
                  class_toggler: true
               }
            }
         },
         compact_like_btns: {
            title: 'seCompactLikeBtns',
            class_toggler: true
         },
         reverse_comments:{
            title: 'seReverseComments',
            class_toggler: true
         }
      },

      Users:{
         show_online_status:{
            title:"seShowOnlineStatus",
            class_toggler: true
         },
         show_full_user_info:{
            title:"seExplandProfileInfo",
            class_toggler: true
         }
      },
      Extra:{
         invert_btn: {
            class_toggler: true
         },
         invert:{
            class_toggler: true
         },
         anonimize_btn: {
            class_toggler: true
         },
         anonimize: {
            class_toggler: true
         },
         shift_page_type:{
            default_value: 0
         }
      }
   },
   css: function(){
      var codes = vk_lib.get_block_comments(function(){
         /*main:
         .vk_ad_block div#ads_left{
            position: absolute !important;
            left: -9500px !important;
         }
         .vk_ad_block .feed_row .post[data-ad]{
            display: none;
         }
         .vk_disable_border_radius body *{
            border-radius: 0px !important;
         }

         .vk_old_audio_btns .audio_row {
            line-height: 1;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__performer_title {
            justify-content: flex-end;
            flex-direction: row-reverse;
            align-items: center;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__performers a {
            color: #2a5885;
            font-weight: 500;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row {
            height: 42px;
            padding: 2px 0;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__actions {
            margin-top: -5px;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__inner {
            padding-left: 42px;
            height: 40px;
         }
         .vk_old_audio_btns .audio_row .audio_row__performers {
            overflow: visible;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__title {
            margin-bottom: 0px;
            overflow: hidden;
            text-overflow: clip;
            font-weight: normal;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__title:before {
            display: inline-block;
            content: "\00a0\2013";
            color: #000;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__duration,
         .vk_old_audio_btns .audio_row.audio_row__current .audio_row__duration {
            top: 13px;
         }
         .vk_old_audio_btns .audio_row .audio_row__cover_back {
            background-color: #6788AA;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2229%22%20viewBox%3D%220%200%2028%2029%22%3E%3Cg%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M11.8%2019.9C11.4%2020.2%2011%2020%2011%2019.5L11%208.5C11%208%2011.4%207.8%2011.8%208.1L19.5%2013.6C19.9%2013.8%2019.8%2014.2%2019.5%2014.4L11.8%2019.9Z%22%20fill%3D%22%23FFF%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
            width: 28px;
            height: 28px;
         }
         .vk_old_audio_btns .audio_row.audio_row__playing .audio_row__cover_back {
            background-color: #6788AA;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2228%22%20height%3D%2229%22%20viewBox%3D%2236%200%2028%2029%22%3E%3Cg%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M46%208.6C46%208.3%2046.3%208%2046.6%208L48.4%208C48.7%208%2049%208.3%2049%208.6L49%2019.4C49%2019.7%2048.7%2020%2048.4%2020L46.6%2020C46.3%2020%2046%2019.7%2046%2019.4L46%208.6ZM51%208.6C51%208.3%2051.3%208%2051.6%208L53.4%208C53.7%208%2054%208.3%2054%208.6L54%2019.4C54%2019.7%2053.7%2020%2053.4%2020L51.6%2020C51.3%2020%2051%2019.7%2051%2019.4L51%208.6Z%22%20fill%3D%22%23FFF%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
            width: 28px;
            height: 28px;
         }
         .vk_old_audio_btns .audio_row.audio_row__current .audio_row__cover_back {
            background-color: #6788AA;
         }
         .vk_old_audio_btns .audio_row.audio_row_with_cover:hover .audio_row__cover_back {
            background-color: #577CA1;
         }
         .vk_old_audio_btns .audio_row .audio_row__play_btn {
            background-color: #5885B8;
            border-radius: 2px;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__cover_icon,
         .vk_old_audio_btns .audio_row .audio_row__cover,
         .vk_old_audio_btns .audio_row .audio_row__sound_bars {
             display: none;
         }

         .vk_compact_audio.vk_old_audio_btns .audio_row,
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__inner{
            height: 26px;
         }

         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__performers,
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__title {
            padding: 2px 0;
         }

         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__cover_back,
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__play_btn{
            width: 16px;
            height: 16px;
            background-size: contain;
            background-position: 50% 50%;
            top: 6px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__inner {
            padding-left: 30px;
         }

         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__duration {
            top: 5px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_w_covers  .vk_audio_size_info_wrap{
            margin-top: 2px;
         }
         .vk_compact_audio.vk_old_audio_btns .vk_audio_size_info_wrap{
            margin-top: 4px;
         }
         .vk_compact_audio.vk_old_audio_btns  .audio_w_covers .audio_row .audio_row__actions {
            margin-top: -12px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__actions {
            margin-top: -15px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_row__performer_title{
            top: 6px;
         }

         .vk_compact_audio.vk_old_audio_btns .audio_w_covers .audio_row .audio_row__performer_title{
            top: 0px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_row .audio_player__place{
            top:18px;
            padding-left: 18px;
         }
         .vk_compact_audio.vk_old_audio_btns .audio_pl_edit_box .ape_audio_item_wrap .ape_attach{
            margin-top: 3px;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_title_wrap,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_performer{
            white-space: normal;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_performer{
            display: inline;
         }

         BEGIN {descr:'Begin of fixes from 8.01.2018'}
         .vk_old_audio_btns .audio_w_covers .vk_audio_size_info_wrap {
             margin-top: 8px;
             margin-bottom: -12px;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__actions {
             margin-top: -3px;
             margin-bottom: -12px;
         }
         .vk_old_audio_btns .audio_w_covers .audio_row .audio_row__info {
             margin-bottom: -13px;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_title_wrap,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_performer,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__title,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performer_title {
            white-space: normal;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_performer,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performers,
         .vk_audio_full_title.vk_old_audio_btns .audio_row__title._audio_row__title,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performer_title {
            display: inline;
         }
         .vk_audio_full_title.vk_compact_audio.vk_old_audio_btns .audio_row__performer_title,
         .vk_audio_full_title.vk_compact_audio.vk_old_audio_btns .audio_w_covers .audio_row .audio_row__performer_title {
             top: 6px;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row__performer_title {
             top: 13px;
         }

         .vk_audio_full_title.vk_old_audio_btns .audio_row,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__inner {
            height: auto;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row {
            padding-bottom: 5px;
         }

         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row_content {
             padding-bottom: 23px;
             margin-bottom: -10px;
         }
         .vk_compact_audio.vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row_content{
             padding-bottom: 11px;
             margin-bottom: -10px;
         }
         .vk_audio_full_title.vk_old_audio_btns  .audio_row__performer_title:after {
             content: '.';
             display: block;
             height: 0;
             font-size: 0;
             line-height: 0;
             clear: both;
             visibility: hidden
         }

         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performer_title,
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performer{
            overflow: visible;
         }

         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__performer {
            top: 11px;
            position: relative;
         }
         .vk_audio_full_title.vk_old_audio_btns .audio_row .audio_row__actions {
            margin-bottom: -20px;
         }

         .vk_old_audio_btns.vk_compact_audio.vk_audio_full_title .audio_pl_edit_box .ape_audio_item_wrap{
            clear:both;
         }

         END {descr:'End of fixes from 18.02.2018'}



         .vk_more_acts_icon{
            background: url(/images/icons/profile_dots.png) no-repeat 0 4px;
            height: 13px;
            width: 17px;
         }
         .vk_old_white_background body{
            background: #fff;
         }
         .vk_old_white_background .im-page.im-page_classic .im-page--chat-header,
         .vk_old_white_background .im-page.im-page_classic .im-page--header,
         .vk_old_white_background .im-page.im-page_classic .im-page--chat-input
         {
            border-color: #fff;
         }
         .vk_ru_vk_logo .top_home_link .top_home_logo {
            background: url("/images/logo.png") no-repeat;
            height: 25px;
            width: 135px;
            margin: 8px 10px 0 0;
         }
         .vk_hide_big_like .pv_hh_like {
            display: none;
         }
         .vk_hide_left_set .left_settings {
            display: none;
         }
         .vk_hide_recommendations #friends_possible_block,
         .vk_hide_recommendations #groups_filters_wrap>.page_block,
         .vk_hide_recommendations .page_block.feed_friends_recomm {
            display: none;
         }
         .vk_hide_stories #stories_feed_wrap {
            display: none;
         }
         #vk_online_status > * {
            margin-top: 15px;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.5);
            height: 8px;
            width: 8px;
            display:none;
         }
         .vkUOnline {
            background-color: #8ac176;
         }
         .vkUOffline {
            background-color: #d65e5e;
         }
         .vkUUndef {
            background-color: #9b9b9b;
         }
         .vk_show_online_status #vk_online_status > * {display:block;}
         .vk_show_full_user_info #profile_full {
            display: block;
         }
         .vk_show_full_user_info .profile_more_info {
            display: none;
         }

         .vk_anonimize .top_profile_img,
         .vk_anonimize .people_cell_img,
         .vk_anonimize .post_field_user_image,
         .vk_anonimize .post_img,
         .vk_anonimize .reply_image,
         .vk_anonimize .like_tt_owner,
         .vk_anonimize .friends_photo,
         .vk_anonimize .ow_ava,
         .vk_anonimize .apps_feed_user_photo,
         .vk_anonimize .ts_contact_photo,
         .vk_anonimize .chat_tab_imgcont,
         .vk_anonimize .fc_contact_photo,
         .vk_anonimize .fc_msgs_img,
         .vk_anonimize .nim-peer--photo{
            -webkit-filter: blur(10px);
            filter: blur(6px);
         }
         .vk_anonimize .page_avatar_img{
            -webkit-filter: blur(30px);
            filter: blur(30px);
         }
         .vk_anonimize .top_profile_name,
         .vk_anonimize .ts_contact_title,
         .vk_anonimize .ts_contact_info,
         .vk_anonimize .ts_contact_info,
         .vk_anonimize .people_cell_name a,
         .vk_anonimize .friends_field_title a,
         .vk_anonimize .post_author .author,
         .vk_anonimize #profile h2.page_name,
         .vk_anonimize .reply_author .author,
         .vk_anonimize .mem_link,
         .vk_anonimize .audio_friend_name,
         .vk_anonimize .apps_feed_info_str b a,
         .vk_anonimize .wall_signed_by,
         .vk_anonimize .fc_contact_name,
         .vk_anonimize .im-mess-stack--lnk,
         .vk_anonimize ._im_ui_peers_list .im-right-menu--text,
         .vk_anonimize .im-page--peer{
            -webkit-filter: blur(4px);
            filter: blur(4px);
         }
         .vk_shift_page #page_layout.vk_shift_left{
            margin-left:0px;
         }
         .vk_shift_page #page_layout.vk_shift_right{
            margin-right:0px;
         }

         .vk_page_shift_left:before, .vk_page_shift_right:before {
             content: "";
             background-image: url(/images/icons/row_slider_btn.png);
             background-position-y: 50%;
             background-repeat: no-repeat;
             display: block;
             width: 26px;
             height: 42px;
         }
         .vk_page_shift_left,
         .vk_page_shift_right{
            position: relative;
            opacity: 0.2;
            transition: opacity 300ms linear;
         }
         .vk_hide_shift_btn .vk_page_shift_left,
         .vk_hide_shift_btn .vk_page_shift_right{
            opacity: 0;
         }
         .vk_page_shift_left:hover, .vk_page_shift_right:hover,
         .vk_hide_shift_btn .vk_page_shift_left:hover, .vk_hide_shift_btn .vk_page_shift_right:hover{
            opacity: 1;
         }
         .vk_page_shift_left{
            margin-left: -40px;
         }
         .vk_page_shift_right:before{
            background-position-x: -26px;
         }
         .vk_page_shift_right{
            margin-right: -40px;
         }

         .vk_compact_like_btns .like_btns .post_dislike .post_dislike_icon {
             width: 17px;
             height: 14px;
         }

         .vk_compact_like_btns .like_button_icon{
             height: 14px;
             width: 17px;
             opacity: 0.35;
         }
         .vk_compact_like_btns .like_btn {
             margin-left: 8px;
         }
         .vk_compact_like_btns .like_button_count, .like_button_label{
             font-size: 13px;
         }
         .vk_compact_like_btns .like_views,
         .vk_compact_like_btns .like_views:before{
             height: 11px;
             line-height: 11px;
             font-size: 11px;
         }

         .vk_compact_like_btns .like_btn.like .like_button_icon,
         .vk_compact_like_btns .like_btn.like.active .like_button_icon,
         .vk_compact_like_btns .like_wrap.lite .like_btn.like.active .like_button_icon {
             background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2214%22%20viewBox%3D%220%200%2016%2014%22%20style%3D%22fill%3A%233D6899%3B%22%3E%3Cpath%20d%3D%22M8%203.2C7.4-0.3%203.2-0.8%201.4%201%20-0.5%202.9-0.5%205.8%201.4%207.7%201.9%208.2%206.9%2013%206.9%2013%207.4%2013.6%208.5%2013.6%209%2013L14.5%207.7C16.5%205.8%2016.5%202.9%2014.6%201%2012.8-0.7%208.6-0.3%208%203.2Z%22%2F%3E%3C%2Fsvg%3E");
         }

         .vk_compact_like_btns .like_btn.comment .like_button_icon {
             background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%225%206%2014%2014%22%20style%3D%22fill%3A%233D6899%3B%22%3E%3Cpath%20d%3D%22M5%207C5%206.4%205.4%206%206%206L18%206C18.5%206%2019%206.5%2019%207L19%2015C19%2015.6%2018.6%2016%2018%2016L6%2016C5.5%2016%205%2015.5%205%2015L5%207ZM9%2016L9%2020%2014%2016%209%2016Z%22%2F%3E%3C%2Fsvg%3E");
         }

         .vk_compact_like_btns .like_btn.share .like_button_icon {
             background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22fill%3A%233D6899%3B%22%3E%3Cpath%20d%3D%22M0%205.5L0%206.5C0%208%201.6%209%203%209L8%209C8.4%209%209.1%209.2%2010.7%2010.3%2011.7%2011.1%2012.9%2012%2012.9%2012L14%2012%2014%206%2014%206%2014%206%2014%200%2012.9%200C12.9%200%2011.7%200.9%2010.7%201.7%209.1%202.8%208.4%203%208%203L3%203C1.6%203%200%204%200%205.5ZM7.5%2012L6.4%209%204%209%205.3%2014C7.3%2014%207.5%2013.3%207.5%2012Z%22%2F%3E%3C%2Fsvg%3E");
         }
         .vk_compact_like_btns .like_btn.like.active .like_button_count{
            color: #3d6899;
         }
         .vk_compact_like_btns .like_cont {
            padding: 4px 0;
         }


         html.vk_invert,
         .vk_invert .top_home_logo,
         .vk_invert _#ts_wrap,
         .vk_invert .head_nav_item_player,
         .vk_invert #top_profile_link,
         .vk_invert #notifiers_wrap,
         .vk_invert .top_nav_btn#top_notify_btn.active .top_nav_btn_icon,
         .vk_invert .top_nav_btn#top_notify_btn.has_notify .top_nav_btn_icon,
         .vk_invert #top_notify_count,
         .vk_invert .like_tt,
         .vk_invert #box_layer_bg,
         .vk_invert .ap_layer_bg_dark,
         .vk_invert #stories_layers_background,
         .vk_invert .stories_preview[style],
         .vk_invert .stories_photo[style],
         .vk_invert .stories_item_cont,
         .vk_invert .stories_bottom_wrap,

         .vk_invert #mv_layer_wrap,
         .vk_invert #layer_bg,
         .vk_invert #pv_box,
         .vk_invert .pv_narrow_column_wrap,
         _.vk_invert .videoplayer_thumb,

         .vk_invert .widget_body,

         .vk_invert #vk_online_status,
         .vk_invert .vk_page_shift_left,
         .vk_invert .vk_page_shift_right
         {
             filter: invert(1);
         }

         .vk_invert body,
         .vk_invert .top_nav_link.active {
             background: #171717;
         }
         .vk_invert img,
         .vk_invert canvas,
         .vk_invert svg,
         .vk_invert .vk_lang_icon,
         .vk_invert .emoji,
         .vk_invert .thumb,
         .vk_invert #pv_photo,
         .vk_invert .ow_ava,
         .vk_invert .audio_row__cover,
         .vk_invert .audio_page_player__cover,
         .vk_invert .ts_contact_img,
         .vk_invert .friends_photo_img,
         .vk_invert .page_avatar_img,
         .vk_invert .page_square_photo,
         .vk_invert .poster__image,
         .vk_invert .page_post_thumb_wrap,
         .vk_invert .image_cover,
         .vk_invert .crisp_image,
         .vk_invert .photos_row,
         .vk_invert .page_post_thumb_unsized,
         .vk_invert .video,
         .vk_invert .mv_info,
         .vk_invert .mv_recom_item_thumb,
         .vk_invert .apps_recent_row,
         .vk_invert .apps_featured_slides,
         .vk_invert .inline_video_wrap,

         .vk_invert .online:after,
         .vk_invert .fc_clist_online,

         .vk_invert .post .podcast_snippet,
         .vk_invert .wl_post .podcast_snippet,
         .vk_invert .Button--negative,
         .vk_invert .Button--positive,
         .vk_invert .bookmark_unseen,

         .vk_invert .group_friends_images,
         .vk_invert .fc_msgs_img,
         .vk_invert .stories_feed_preview_item,
         .vk_invert .page_media_link_thumb,
         .vk_invert .page_doc_photo,
         .vk_invert .page_gif_preview,
         .vk_invert .page_gif_play_icon,
         .vk_invert .article_snippet__image,
         .vk_invert .feed_video_item,
         .vk_invert .wall_card__photo,
         .vk_invert .media_voting_bg_photo,
         .vk_invert .media_voting_bg_gradient,
         .vk_invert .audio_pl__cover,
         .vk_invert .audio_artist_block__cover,
         .vk_invert .page_album_title,
         .vk_invert .audio_row__cover_back {
             filter: invert(1);
         }
         .vk_invert .top_profile_img,
         .vk_invert .like_tt_image,
         .vk_invert .media_voting_bg_photo img,
         .vk_invert .media_voting_bg_gradient img,
         .vk_invert img.notifier_image,
         .vk_invert .thumb img.cell_img,
         .vk_invert .ap_layer canvas,

         .vk_invert .widget_body img,
         .vk_invert .widget_body canvas,
         .vk_invert .widget_body svg

         {
             filter: invert(0);
         }
         .vk_invert .photos_container .photos_row{
             border-color:#000;
         }

         .vk_invert #page_header_cont .back {
             background: #e7e7e7;
             border-color: #cbcaca;
         }
         .vk_invert .group_friends_image,
         .vk_invert .top_notify_count{
             background: #404040;
             border-color: #000;
         }

         .vk_invert input.text.ts_input{
             background-color:#f8f8f8;
         }
         .vk_invert input.text.ts_input:focus{
            background-color: #FFF;
            color: #000;
         }
         .vk_invert .top_audio_player:hover,
         .vk_invert .top_nav_link:hover {
            background-color: #2f2f2f;
         }

         */
      });
      var progress_bar = vk_lib.get_block_comments(vkProgressBar).css;

      return codes.main + progress_bar;
   },
   onResponseAnswer: function(answer, url, q){
      // запихиваем свой обработчик в момент получения данных о видео.
      if (url == '/al_video.php' && q.act == 'show'){
         if (answer[2])
            answer[2] = answer[2].replace(/(var\s*isInline)/,'\n   vkopt.face.ad_block.video(vars);\n $1');
         if (answer[5] && answer[5].mvData && vkopt.settings.get('ad_block')){
            answer[5]['no_ads'] = 1;
            answer[5].player && answer[5].player.params && each(
               answer[5].player.params,
               function(i,item){
                  item['no_ads'] = 1;
               }
            );
         }

      }
   },
   onLibFiles: function(fn){
      if (fn == 'audioplayer.js')
         vkopt.face.ad_block.audio();
      if (fn == 'videoplayer.js')
         vkopt.face.ad_block.videoplayer();
   },
   onLocation: function(){
      vkopt.face.user_online_status();
   },
   ad_block: {
      video: function(vars){
         if (vkopt.settings.get('ad_block')){
            vars['no_ads'] = 1;
            vkopt.log('vid ad_block info:', vars);
         }
      },
      videoplayer:function(){
         if (vkopt.settings.get('ad_block'))
            Inj.Start('VideoPlayer.prototype.canShowAds','if (vkopt.settings.get("ad_block")) return false;');
      },
      audio: function(){
         if (vkopt.settings.get('ad_block'))
            Inj.Start('AudioPlayer.prototype._adsIsAllowed','if (vkopt.settings.get("ad_block")) return AudioPlayer.ADS_ALLOW_DISABLED;');
      }
   },
   onInit: function() {
      vkopt.face.user_online_status();
      vkopt.face.anon_top_menu_item();
      vkopt.face.inv_top_menu_item();
      if (vkopt.settings.get('shift_page_type') != 0)
         vkopt.face.shift_page.shift(vkopt.settings.get('shift_page_type'));
   },
   onCmd: function(data){
      if (data.act == 'user_online_status')
         vkopt.face.user_online_status(data.status);
   },
   onOptionChanged: function(option_id, val, option_data){
      if (option_id == 'show_online_status')
         vkopt.face.user_online_status();
      vkopt.face.shift_page.btn();
   },
   processNode: function(node, params){
      if(!vkopt.settings.get('reverse_comments')) return;
      var nodes = geByClass('replies_next_main', node);
      if(!nodes) return;
      for(var i=0; i<nodes.length; i++){
         var more = nodes[i];
         var post = more.href.match(/wall(.+)/i) || [];
         var parentMore = more.parentNode;
         var el = '<a onclick="return vkopt.face.show_rev_comments(this);" class="replies_next replies_next_main replies_prev" data-post="' + post[1] + '"data-offset="0" data-count="3">' + IDL('showLastComments') + '</a>';
         //parentMore.replaceChild(se(el), more);
         parentMore.appendChild(se(el));
      }
   },
   show_rev_comments: function(el){
      var post = domData(el, 'post')
      var post_item = post.split('_');
      dApi.call('wall.getComments',{ owner_id: post_item[0], post_id: post_item[1], count: 1, v:'5.92'}, function(res) {
         if(res){
            res = res.response;
            domData(el, 'offset', res.current_level_count-3);
            el.setAttribute('onclick', 'return wall.showNextReplies(this, \'' + post +'\', event);');
            return wall.showNextReplies(el, post);
         }
      });
   },
   inv_top_menu_item: function(){
      if (!vkopt.settings.get('invert_btn'))
         return;
      var ref = ge('top_support_link');
      var item = se('<a class="top_profile_mrow" id="top_invert_link" href="#" onclick="return vkopt.settings.set(\'invert\', !vkopt.settings.get(\'invert\'));">Night mode</a>');
      if (ref && !ge('top_invert_link')){
         ref.parentNode.insertBefore(item, ref);
      }
   },
   anon_top_menu_item: function(){
      if (!vkopt.settings.get('anonimize_btn'))
         return;
      var ref = ge('top_support_link');
      var item = se('<a class="top_profile_mrow" id="top_anonimize_link" href="#" onclick="return vkopt.settings.set(\'anonimize\', !vkopt.settings.get(\'anonimize\'));">Anonimize</a>');
      if (ref && !ge('top_anonimize_link')){
         ref.parentNode.insertBefore(item, ref);
      }
   },
   user_online_status: function(status) {
      if (vkopt.face.check_online_timeout) clearTimeout(vkopt.face.check_online_timeout);
      if (!vkopt.settings.get('show_online_status')){
         re('vk_online_status');
         return;
      }
      var set_status = function(cl){
         var p = ge('vk_online_status');
         if (p){
            p = geByTag1('div',p);
            if (p)
               p.className = cl;
         }
      }
      var show_status=function(stat){
            if (!ge('vk_online_status')){
              var div = se('<div id="vk_online_status" class="fl_r"><div></div></div>');
              var top_nav_list = ge('top_nav');
              var top_music_player = geByClass1('head_nav_item_player',top_nav_list);
              top_nav_list && top_nav_list.insertBefore(div,top_music_player);
            }
            set_status(stat ? 'vkUOnline': 'vkUOffline');
         /* vkGenDelay() -random для рассинхронизации запросов разных вкладок, иначе запросы со всех вкладок будут одновременно слаться. */
         vkopt.face.check_online_timeout=setTimeout(function(){vkopt.face.user_online_status();},vkGenDelay(20000,status!=null));
      };
      set_status('vkUUndef');
      if (status!=null){
         show_status(status);
      } else {
         dApi.call("getProfiles",{ uid: remixmid(), fields:'online'},function(res) {
            if (res.response){
               var p=res.response[0];
               var st={
                     online:p.online,
                     online_app: p.online_app,
                     online_mobile: p.online_mobile
                };

               show_status(st.online);
               vkopt.cmd({act:'user_online_status', status:st.online}); // шлём полученный статус в остальные вкладки
            } else {
               vkopt.face.check_online_timeout = setTimeout(function(){vkopt.face.user_online_status();},vkGenDelay(20000));
            }
       });
      }
   },
   shift_page: {
      btn: function(){
         if (vkopt.settings.get('shift_page') && ge('top_nav') && !geByClass('vk_page_shift_left')[0]){
            ge('top_nav').insertBefore(se('<a class="vk_page_shift_left head_nav_item fl_l" onclick="return vkopt.face.shift_page.shift(-1);"></a>'), ge('top_nav').firstChild);
            ge('top_nav').insertBefore(se('<a class="vk_page_shift_right head_nav_item fl_r" onclick="return vkopt.face.shift_page.shift(1);"></a>'),geByClass('fl_r', ge('top_nav'))[0]);
         }
      },
      shift: function(dir){
         if (hasClass('page_layout', 'vk_shift_right') || hasClass('page_layout', 'vk_shift_left')){
            removeClass('page_layout', 'vk_shift_right');
            removeClass('page_layout', 'vk_shift_left');
            vkopt.settings.set('shift_page_type', 0);
            return false;
         }
         vkopt.settings.set('shift_page_type', dir);
         if (dir > 0)
            addClass('page_layout', 'vk_shift_right');
         else
            addClass('page_layout', 'vk_shift_left');
         return false;
      }
   }
};

vkopt['profile'] = {
   tpls: null,
   rx_lnk_monthday:/c(?:%5B|\[)bday(?:%5D|\])=(\d+).+c(?:%5B|\[)bmonth(?:%5D|\])=(\d+)/,
   rx_lnk_year:/c(?:%5B|\[)byear(?:%5D|\])=(\d+)/,

   onSettings:{
      Media: {
         audio_pos: {
            title: 'seProfileMoveAudioBlock'
         }
      },
      Users: {
         calc_age:{
            title: 'seCalcAge'
         },
         show_reg_date: {
            title: 'seShowRegDate',
            default_value: true
         },
         show_common_group:{
            title: 'seShowCommonGroup',
            class_toggler: true,
            sub: {
               common_group_color:{
                  title: ' ',
                  color_picker: true
               }
            }
         }
      },
      Extra: {
         zodiak_ophiuchus:{}
      }
   },

   css: function() {
      return '' +
         vkopt.profile.css_common_group(vkopt.settings.get('common_group_color'))+
         vk_lib.get_block_comments(function(){
         /*css:
            .vk_box_content_loading{
               text-align:center
            }
         */
         }).css;
   },

   css_common_group: function(color){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_show_common_group .vkopt_com_gr {
            background: #{colorCommonGroup} !important;
         }
         */
      }).css.replace(new RegExp("{colorCommonGroup}", 'g'), color);
   },

   onInit: function(){
      vkopt.profile.tpls = vk_lib.get_block_comments(function(){
         /*calc_age_el:
         <span id="vk_calc_age_el">
            <a href="#" onmouseover="showTooltip(this, {center:true, className:'vk_pr_tt', text:'{lng.CalcAgeWarning}'})" onclick="return vkopt.profile.search_age(cur.oid,'vk_calc_age_el');">
               {vals.year_text}
            </a>
         </span>
         */
         /*middle_name_field:
         <div class="pedit_row clear_fix">
           <div class="pedit_label">{lng.Middle_name}</div>
           <div class="pedit_labeled">
             <input type="text" value="" id="pedit_middle_name" class="dark" autocomplete="off">
           </div>
         </div>
         */
	 /*date_reg:
	 <div class="clear_fix profile_info_row ">
	   <div class="label fl_l">{lng.RegDate}:</div>
	   <div class="labeled labeled_date_reg">{vals.date_reg}</div>
	 </div>
	 */
	 /*orig_avatar:
	   <a id="avatar_orig" href="{vals.href}" onclick="return vkopt.profile.show_avatar()" target="_blank">{vals.el}</a>
	 */
      });
   },
   onLocation: function(){
      if (nav.objLoc[0] == 'edit')
         vkopt.profile.editor.middle_name_field();

      if (vkopt.settings.get('audio_pos')) {
         clearTimeout(vkopt.profile.audelay);
         vkopt.profile.audelay = setTimeout(function() {
            vkopt.profile.moveAudio(vkopt.settings.get('audio_pos'));
         },200);
      }
      if (vk.id == cur.oid) // обновим кеш групп, если зашли на свою страницу
         vkopt.profile.fshow_common_group(true);

      if (vkopt.settings.get('show_common_group') && cur.module == 'profile' && vk.id != cur.oid)
         vkopt.profile.fshow_common_group();

      if(vkopt.settings.get('show_reg_date') && cur.module == 'profile' && cur.oid && ge('profile_short') && !geByClass1('labeled_date_reg'))
         vkopt.profile.date_reg();

      if(geByClass1('profile_closed_wall_dummy') &&  cur.module == 'profile')
         vkopt.profile.orig_avatar();

      /*
      ge('profile_message_send') && dApi.call('messages.getHistory',{user_id: cur.oid, v:'5.85'}, function(r,result){
         if (result && result.count){
            geByClass1('flat_button', ge('profile_message_send')).appendChild(se('<span> ('+result.count+')</span>'))
         }
         // + first message date / last message date
      })
      */
   },
   onLibFiles: function(fn){
      if (fn == 'fansbox.js' && vkopt.settings.get('show_common_group')){
         Inj.Replace('FansBox.genIdolRow', /return\s*([\s\S]+)/i, function(s,p1){ // вклиниваемся в рендеринг списка интересных страниц в боксе
            return 'var tmp_html = '+p1+'; return vkopt_core.mod_str_as_node(tmp_html, vkopt.profile.highlight_groups, {source:"FansBox.genIdolRow"});';
         })
      }
   },
   groups_cache:{},
   fshow_common_group: function(update) {
      var store_key = 'user_groups_' + vk.id; // чтоб при входе на другой аккаунт не подсвечивались группы предыдущего.
      var stored_list = localStorage[store_key];
      if (!stored_list || update) {
         dApi.call("groups.get",{ user_id: vk.id, extended: '1', filter: 'groups,publics,events', v: '5.59'},function(r) {
            if (r.error) return;
            var groups = r.response.items;
            var cnt = groups.length;
            var groups_sn = [];
            for (var i = 0; i < groups.length; i++) groups_sn.push(groups[i].screen_name);
            vkopt.profile.groups_cache[store_key] = groups_sn;
            if (!update)
               vkopt.profile.highlight_groups();
            localStorage[store_key] = JSON.stringify(groups_sn);
         });
      } else {
         try {
            var groups_sn = JSON.parse(stored_list);
            vkopt.profile.groups_cache[store_key] = groups_sn;
            vkopt.profile.highlight_groups();
         } catch(e){
            localStorage[store_key] = '';
            setTimeout(function(){
               vkopt.profile.fshow_common_group();
            },300)
         }

      }
   },
   link_rx: /^(https:\/\/[^\/]+\/|\/)([^\/\?#&]+)/i, // выдёргиваем из ссылки адрес модуля (screen_name)
   highlight_groups: function(node) {
      var groups_sn = vkopt.profile.groups_cache['user_groups_' + vk.id];
      if (!groups_sn) return;
      var rx = vkopt.profile.link_rx;
      node = node || ge('page_info_wrap');
      if (!node) return;
      var nodes = geByTag('a', node);
      for (var j=0;j<nodes.length;j++) {
         if ((m = (nodes[j].href || '').match(rx)) && m && groups_sn.indexOf(m[2]) > -1){
            addClass(nodes[j], "vkopt_com_gr");
         }
      }
   },
   processNode: function(node, params){
         if (vkopt.settings.get('show_common_group') && params && params.url == '/al_fans.php' && params.q && params.q.oid != vk.id){
            vkopt.profile.highlight_groups(node);
         }

         if (!vkopt.settings.get('calc_age'))
             return;
         var nodes = geByClass('profile_info_row');
         for (var i = 0; i < nodes.length; i++){
            var row = nodes[i];
            var html = row.innerHTML;
            var mday = html.match(vkopt.profile.rx_lnk_monthday);
            var year = html.match(vkopt.profile.rx_lnk_year);
            if (!mday && !year || /vk_age_info/.test(html))
               continue;

            var info = vkopt.profile.bday_info(mday && mday[1], mday && mday[2], year && year[1]);
            if (!info.length)
               continue;

            var p = geByClass1('labeled',row);
            if (!p)
               continue;

            if (!year) // добавляем кнопку на поиск возраста
               info.push(
                  vk_lib.tpl_process(vkopt.profile.tpls['calc_age_el'], {
                     oid: cur.oid,
                     year_text: langNumeric('?', vk_lang["vk_year"])
                  })
               );

            info = ' ('+info.join(', ')+')';

            p.appendChild(se('<span id="vk_age_info">'+info+'</span>'));
         }
   },
   date_reg:function(){
      ajax.plainpost('/foaf.php',{id: cur.oid}, function(response){
         var date_raw = (response.match(/<ya:created dc:date="(.*?)"/i) || [])[1];
         if (!date_raw)
            return;
         var date = new Date(date_raw);
         var month_lang = getLang('month'+(date.getMonth()+1)+'_of');
         if (month_lang)
            date = dateFormat(date, "d '" + month_lang + "' yyyy (HH:MM)");
         else
            date = dateFormat(date, 'd.mm.yyyy (HH:MM)');
         var ref = geByClass1('profile_more_info');
         if(ref)
            ref.parentNode.insertBefore(se(
               vk_lib.tpl_process(vkopt.profile.tpls['date_reg'], {date_reg: date})
            ), ref);
         else
            ge('profile_short').appendChild(se(
               vk_lib.tpl_process(vkopt.profile.tpls['date_reg'], {date_reg: date})
            ));
         return true;
      });
   },
   orig_avatar: function(){
      var el = ge('page_avatar');
      if(!ge('avatar_orig') && !el) return;
      var body_code = 'var info = API.users.get({"user_ids":' + cur.oid + ', fields:"crop_photo"});' +
                      'if(info[0].crop_photo) return info@.crop_photo@.photo@.sizes@.pop();';
      dApi.call('execute',{v:'5.85', code:body_code},function(r){
         if (r.response)
            el.innerHTML = vk_lib.tpl_process(vkopt.profile.tpls['orig_avatar'], {href: r.response[0].url, el:el.innerHTML});
      });
   },
   show_avatar: function(){
      dApi.call('users.get',{user_ids: cur.oid, fields:'crop_photo', v:'5.85'},  function(r,resp){
         var ph = resp[0].crop_photo.photo;
         var sz = ph.sizes;
         var pv_sz = {base:''};
         each(sz, function(i,el){
               pv_sz[el.type+'_'] = [el.url,el.width,el.height];
               pv_sz[el.type+'_src'] = el.url;
         })
         stManager.add(["photoview.js", "photoview.css"],function(){
            extend(cur, {
               pvCancelLoad: function() {},
               pvData: cur.pvData || {},
               pvOptions: cur.pvOptions || {}
            }),
            cur.pvData.temp = [pv_sz];
            Photoview.show("temp", 0);
            hideProgress(cur.pvCounter);
            cur.pvBottomActions.innerHTML='<a class="pv_actions_more">' + getLang("photos_actions_more") + "</a>"
            var ref = geByClass1("pv_actions_more");
                ref && (cur.pvMoreActionsTooltip = new ElementTooltip(ref,{
                    id: "pv_more_acts_tt",
                    forceSide: "top",
                    elClassWhenShown: "pv_more_shown",
                    content: '<div class="pv_more_acts"></div>',
                    offset: [0, -5],
                    autoShow: !0,
                    noHideOnClick: !0
                }))
         })
      })
      return false;
   },
   bday_info: function(day,month,year){
      var zodiac_cfg=[20,19,20,20,21,21,22,23,23,23,22,21];// days
      //'zodiac_signs':['Козерог','Водолей','Рыбы','Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец']
      var info=[];

      if (day && month){
         if (year){
            var date=new Date(year, month-1, day);
            var cur_date = new Date();
            var bDay = new Date(cur_date.getFullYear(), date.getMonth(), date.getDate());
            var years = cur_date.getFullYear() - date.getFullYear() - (bDay > cur_date?1:0);
            info.push(langNumeric(years, vk_lang["vk_year"]));
         }


         var zodiacs=vk_lang['zodiac_signs'];
         var idx = day > zodiac_cfg[month-1] ? (month) % 12 : (month - 1);
         var zodiac = zodiacs[idx];
         //30 nov - 17 dec - Змееносец
         if (
               vkopt.settings.get('zodiak_ophiuchus') &&
               zodiacs[12] && (
                  (month == 11 && day > 29) || (month == 12 && day < 18)
               )
            ){
            zodiac = zodiacs[12];
         }
         info.push(zodiac);
      }
      return info;
   },
   search_age: function(uid,el){
      var _el=ge(el);
      var a=geByTag('a',_el)[0];
      if (a && a.tt) a.tt.hide();
      addClass(_el,'fl_r');
      vkopt.profile.find_age(uid,function(age){
         var txt=age?langNumeric(age, vk_lang["vk_year"]):'N/A';
         removeClass(_el,'fl_r');
         _el.innerHTML=txt;
      },{el:el,width:50});
      return false;
   },
   find_age:function(target_uid,callback,ops){
      var min=12;
      var max=80;
      ops = ops || {};
      var mid;
      var first = min;
      var last = max;
      var step = 0;
      if (!ops.el){
         var box = new MessageBox({title: IDL('Scaning'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'), function(){ var abort = true; box.hide();}, 'no');
      }
      var html='<div id="vk_scan_bar" style="padding-bottom:10px;">'+vkopt.res.img.ldr_big+'</div>';
      if (!ops.el) box.content(html).show();
      else ge(ops.el).innerHTML=vkopt.res.img.ldr;

      var scan=function(fid){
         ge(ops.el || 'vk_scan_bar').innerHTML=vkProgressBar(++step,8,(ops.width || 310),' %');
         mid = first + Math.floor( (last - first) / 2 );
         //callback(first + ';' + last + '-' + mid);
         ajax.post('/friends',{act:'filter_friends',al:1,city:0,sex:0,age_from:first,age_to:mid,uid:fid},{
            onDone:function(uids){
               var x =inArr(uids,target_uid);
               if (x) {
                  last = mid;
               } else {
                  first=mid+1;
               }

                if (first == last && first!=80)
                {
                  if (!ops.el) box.hide();
                  callback(first);
                }
                else
                if (first>last || first==80){
                	callback(null);
                } else {
                	vkopt_core.timeout(scan.pbind(fid),300);
                }

            }
         });
      };
      dApi.call('friends.get',{
            user_id: target_uid,
            fields: 'first_name',
            count: 20, //надеемся, что среди первых 20 будет хоть один незаблокированный акк
            v:'5.53'
         }, function(r){
            if (!r.response || !r.response.count){
               alert('Sorry... Mission impossible...');
               if (!ops.el) box.hide();
               return;
            }
            var fid = 0;
            // игнорим DELETED друзей, т.к невозможно использовать их список друзей
            for (var i in r.response.items)
               if (!r.response.items[i].deactivated){
                  fid = r.response.items[i].id;
                  break;
               }
            vkopt.log('fid',fid);
            scan(fid);
      });
   },
   editor: {
      middle_name_field: function(){
         if (!ge('pedit_middle_name')){
            var p=ge('pedit_maiden_row');
            if (!p) return;
            var field = se(vk_lib.tpl_process(vkopt.profile.tpls['middle_name_field'], {}));
            p.parentNode.insertBefore(field, p);
         }
      }
   },
   moveAudio: function(flag) {
      var audios = document.getElementById("profile_audios");
      if (audios == null) return;

      var pageblock = document.createElement('div');
      pageblock.className = "page_block";
      pageblock.appendChild(audios);

      if (flag) { //сдвиг вправо
         var newplace = document.getElementById("wide_column");
         newplace.insertBefore(pageblock, newplace.children[2]);
      } else { //влево (отключение)
         var newplace = document.getElementById("narrow_column");
         newplace = newplace.getElementsByClassName("page_block");
         var len = newplace.length - 1;
         newplace[len].appendChild(pageblock.children[0]);
      }
   },
   onOptionChanged: function(option_id, val, option_data) {
      if (option_id == 'audio_pos') {
         vkopt.profile.moveAudio(val);
      }
   }
};

vkopt['extra_online'] = {
   onSettings: {
      Users: {
         extra_online: {
            title: 'seShowOnlineExtraInfo',
            default_value: true
         }
      }
   },
   css: '.vk_extra_online_info{margin-left:5px}',
   onLocation: function(){
      if (cur.module == "profile"){
         vkopt.extra_online.update_online_info();
         cur.onPeerStatusChanged && Inj.End('cur.onPeerStatusChanged', vkopt.extra_online.update_online_info);
      }
   },
   update_online_info: function(){
      var code = 'var clients=["","m.vk.com","iPhone","iPad","Android","Windows Phone","Windows 10","vk.com","VK Mobile"];var u = API.users.get({user_ids:"%UID",fields:"online,last_seen"})[0];if (u.online_app){u.app_title=API.apps.get({app_id:u.online_app}).items[0].title;}if(u.last_seen)u.last_seen.platform_title=clients[u.last_seen.platform];return u;';
      code = code.replace(/%UID/g,cur.oid);
      dApi.call('execute',{code: code, v:'5.75'},function(r,info){
         re(geByClass1('vk_extra_online_info'));
         var extra = null;
         if (info.online_app)
            extra = se('<a class="vk_extra_online_info" href="/app'+info.online_app+'">('+info.app_title+')</a>');
         else if (!info.online && info.last_seen)
            extra = se('<span class="vk_extra_online_info" title="'+(new Date(info.last_seen.time*1000)).format('HH:MM dd.mm.yyyy')+'">('+info.last_seen.platform_title+')</span>');

         var p = geByClass1('profile_online');
         if (p && hasClass(p, 'is_online'))
            p = geByClass1('profile_online_lv');
         else
            p = geByClass1('profile_time_lv');

         if (p){
            if (p.childNodes.length < 1 && !info.online && info.last_seen) // no last seen info
               p.innerHTML = (new Date(info.last_seen.time*1000)).format('HH:MM dd.mm.yyyy');
            if (extra)
               p.appendChild(extra);
         }
      })
   }
}

vkopt['groups'] = {
   tpls:null,
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         #vk_wikicode_area{
            width:100%;
            height:300px;
         }
         .vk_wiki_page_code{
            opacity: 0.3;
         }
         .vk_wiki_page_code:hover{
            opacity: 1;
         }
         .vk_wiki_list_table div{
            max-width: 295px;
            overflow: hidden;
            word-wrap: break-word;
         }

         .page_photo.page_action_menu_groups .page_actions_item.vk_acts_item_icon:before{
            background: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%237D9AB7%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E") 0px 0px no-repeat;
         }
         .page_photo.page_action_menu_groups .page_actions_item.vk_acts_item_icon:before{
            content: "";
            height: 20px;
            width: 20px;
            margin-left: 3px;
            background-size:contain;
            display: inline-block;
            padding-left: 0px;
            vertical-align: middle;
         }
         i.vk_edit_icon{
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%2232%20126%2024%2024%22%3E%3Cg%20style%3D%22fill%3Anone%3B%22%3E%3Crect%20x%3D%2232%22%20y%3D%22126%22%20width%3D%2224%22%20height%3D%2224%22%2F%3E%3Cpath%20d%3D%22M39%20141L41%20143%2040.5%20143.5%2038.3%20143.9C38.1%20144%2038%20143.9%2038.1%20143.7L38.5%20141.5%2039%20141ZM40%20140L47.7%20132.3C48.1%20131.9%2048.7%20131.9%2049.1%20132.3L49.7%20132.9C50.1%20133.3%2050.1%20133.9%2049.7%20134.3L42%20142%2040%20140Z%22%20fill%3D%22%23828A99%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E");
            display: inline-block;
            cursor: pointer;
            outline: none;
            height: 24px;
            width: 24px;
            margin: 0 2px;
            opacity: 0.7;
            border: none;
            background-color: transparent;
            padding: 0;
         }
         .vk_wiki_list_table i.vk_edit_icon {
            float: right;
            opacity:0.3;
            transition: opacity 200ms linear;
         }
         .vk_wiki_list_table i.vk_edit_icon:hover {
            opacity:1;
         }
         */
      }).css
   },
   onInit: function(){
      vkopt.groups.tpls = vk_lib.get_block_comments(function(){
         /*wiki_owner_list_btn:
         <a id="vk_wiki_links" href="#" onclick="vkopt.groups.wiki_list.show(cur.oid); return false;" class="ui_rmenu_item" role="listitem">
           <span>{lng.WikiPagesList}</span>
         </a>
         */
         /*list_header:
         <h3>Owner: {vals.oid_caption}
            <a class="fl_r {vals.new_page_lnk_class}" id="vk_add_wiki_page" href="#" onclick="vkopt.groups.wiki_list.new_page(); return false;">{lng.Add}</a>
            <span class="divider fl_r">|</span>
            <a class="fl_r" onclick="vkopt.groups.wiki_list.download({vals.oid})">{lng.downloadAll}</a>
         </h3>
         <br>
         <table class="wk_table vk_wiki_list_table" cellspacing="0" cellpadding="0">
            <tr>
               <th><a onclick="vkopt.groups.wiki_list.sort_column(0, this)">{lng.Page} </a></th>
               <th>{lng.History}</th>
               <th>{lng.Code}</th>
               <th><a onclick="vkopt.groups.wiki_list.sort_column(3, this)">{lng.Author} </a></th>
               <th><a title="{lng.sortByDate}" onclick="vkopt.groups.wiki_list.sort_column(4, this)">{lng.Date} &#9650;<a></th>
            </tr>
            {vals.content}
          </table>
         */

         /*list_item:
         <tr>
             <td>
               <div>
                  <a class="vk_wiki_link" pid="{vals.id}" href="/{vals.page}">{vals.title}</a>
                  <a class="vk_wiki_edit_link" pid="{vals.id}" onclick="return showWiki({w:'{vals.page}/market'}, false, null, {onLoaded:WkView.edit});" href="#"><i class="vk_edit_icon"></i></a>
               </div>
               <div class="vk_wiki_page_code">[[{vals.page}]]</div>
             </td>
             <td><a href="/pages.php?oid={vals.oid}&p={vals.enc_title}&act=history" target="_blank">{lng.History}</a></td>
             <td><a href="#" onclick="return vkopt.groups.wiki_list.view_code({vals.id}, {vals.group_id});">{lng.Code}</a></td>
             <td><a href="/id{vals.creator_id}">{vals.creator_name}</a></td>
             <td>{vals.created_date}</td>
         </tr>
         */

         /*view_wiki_source:
         <h2>{vals.title}</h2><textarea id="vk_wikicode_area">{vals.code}</textarea>
         */
         /*more_acts_item:
         <a href="{vals.href=#}" class="page_actions_item vk_acts_item {vals.item_class=vk_acts_item_icon}" onclick="{vals.onclick=}" {vals.attrs=}>{vals.text}</a>
         */
         /*more_acts_item_sep:
         <div class="page_actions_separator"></div>
         */
      });
   },
   onLocation: function(){
      if (!/groups|public/.test(cur.module+''))
         return;
      if (ge('vk_wiki_links'))
         return;
      // Добавляем кнопку для просмотра созданных из под текущего аккаунта страниц
      if (nav.objLoc[0] == 'groups' && ge('ui_rmenu_all')){
         vkopt.groups.wiki_list.owner_pages_btn();
      }

      // На странице группы добавляем кнопку
      if (ge('group') || ge('public'))
         vkopt.groups.actions_items();
   },
   onGroupActionItems: function(oid, gid){
      if (ge('vk_wiki_links'))
         return [];
      var items = [
         {
            id: "vk_wiki_links",
            onclick:"vkopt.groups.wiki_list.show(cur.oid); return false;",
            text:IDL('WikiPagesList')
         },
         {
            //id="vk_gr_mentions_btn"
            href:"/feed?obj="+oid+"&section=mentions",
            text:IDL('mNeMe')
         }

      ];
      if (!/stats\?gid=/.test(val(geByClass1('page_actions_expanded'))))
         items.push({
            //id="vk_gr_stat_btn"
            href:"/stats?gid="+gid,
            text:IDL('Stats'),
            item_class: 'page_menu_group_stats'
         })

      return items;
   },
   actions_items: function(){
      var acts = vkopt_core.plugins.call_modules('onGroupActionItems', cur.oid, Math.abs(cur.oid));
      for (var plug_id in acts){
         var items = acts[plug_id];
         for (var i = 0; i < items.length; i++){
            var item = se(vk_lib.tpl_process(vkopt.groups.tpls[items[i].text ? 'more_acts_item' : 'more_acts_item_sep'], {
               href:       items[i].href,
               item_class: items[i].item_class,
               onclick:    isString(items[i].onclick) ? items[i].onclick : '',
               attrs:      isString(items[i].attrs) ? attrs : '',
               text:       IDL(items[i].text)
            }));
            if (items[i].id) item.id = items[i].id;

            if (isObject(items[i].attrs))
               for (var attr in items[i].attrs)
                  item.setAttribute(attr, items[i].attrs[attr]);

            if (isFunction(items[i].onclick))
               addEvent(item, 'click', items[i].onclick);

            vkopt.groups.append_extra_action_btn(item);
         }
      }
   },
   append_extra_action_btn: function(btn){         // добавляем в выпадающем меню доп. действий группы под аватаркой свою кнопку
      var p = geByClass1('page_actions_expanded');
      if (!p) return false;
      var wrap = geByClass1('page_actions_more', p) || p;
      if (!wrap) return false;
      wrap.appendChild(btn);
      return true;
   },
   wiki_list:{
      owner_pages_btn:function(){
         var p = ge('ui_rmenu_all');
         if (!p) return;
         var btn = se(
            vk_lib.tpl_process(vkopt.groups.tpls['wiki_owner_list_btn'], {})
         );
         insertAfter(btn, p);
      },
      show: function(oid){
         vkLdr.show();

         var gid=Math.abs(oid);
         //if (gid==1) gid=-1;
         stManager.add('wk.css');
         var params = {v:'5.53'};
         if (oid < 0)
            params.group_id = gid;

         dApi.call('pages.getTitles', params, function(r){
            vkLdr.hide();

            var items = [];
            (r.response || []).map(function(obj){
               obj = extend({
                  oid: oid,
                  page: 'page-'+obj.group_id+'_'+obj.id,
                  enc_title: encodeURIComponent(obj.title),
                  created_date: new Date(obj.created * 1000).format('yyyy.mm.dd HH:MM:ss'),
                  creator_name: 'Unknown',
                  creator_id: 0
               }, obj);
               //obj.creator_name = obj.creator_name || IDL('Unknown');
               //obj.creator_id = obj.creator_id || 0;
               items.push(vk_lib.tpl_process(vkopt.groups.tpls['list_item'], obj));
            });


            var t=vk_lib.tpl_process(vkopt.groups.tpls['list_header'], {
               oid_caption: (oid && oid < 0 ? 'club' : 'id') + Math.abs(oid || vk.id),
               oid: oid,
               new_page_lnk_class: oid > 0 ? 'unshown' : '',
               content: items.join('\n')
            });
            var box=vkAlertBox('Wiki Pages',t,null,null,true);
            box.setOptions({width:'680px'});
         });
      },
      new_page: function(){
         var title=prompt(IDL("Title"));
         if (title)
            nav.go("pages?act=edit&oid="+cur.oid+"&p="+encodeURIComponent(title));
      },
      sort_column: function(index, anchor) {  // сортировка строк таблицы
          var table = geByClass('wk_table')[0];
          var rows = [].slice.call(geByTag('tr', table));
          var header = rows.shift();   // заголовок таблицы не участвует в сортировке
          var descending = anchor.innerHTML.indexOf('\u25B2') == -1 ? -1 : 1; // ▲
          rows.sort(function (a, b) {
              var a_val = trim(val(geByTag('td',a)[index]).toUpperCase());
              var b_val = trim(val(geByTag('td',b)[index]).toUpperCase());
              if (a_val == b_val)
                 return 0;
              return a_val < b_val ? descending : -descending;
          });
          for (var i in rows)
              table.appendChild(rows[i]);
          each(geByTag('a', header), function (i, a) {
              a.innerHTML = a.innerHTML.replace(/[\u25BC\u25B2]/, '');
          });
          anchor.innerHTML += ~descending ? '\u25BC' : '\u25B2';
      },
      view_code: function(pid,gid){
         var params={owner_id: -gid, need_source:1, v:'5.53'};
         if (/^\d+$/.test(pid+"")){
            params['page_id'] = pid;
         } else {
            params['title'] = pid;
         }
         dApi.call('pages.get', params, function(r){
            var data=r.response;
            if (!data.source) {
               alert('Nothing...');
               return;
            }
            var code=(data.source || "").replace(/<br>/gi,'\r\n');
            var box=vkAlertBox('Wiki-code',vk_lib.tpl_process(vkopt.groups.tpls['view_wiki_source'], {title: data.title, code:code}),null,null,true);
            box.setOptions({width:'500px'});
         });
         return false;
      },
      download: function(oid) {
          var box;              // окошко с прогресс-баром
          var zip;              // переменная для объекта JSZip
          var anchors;          // переменная для массива ссылок (элементов) на страницы
          var anchors_length;   // длина этого массива. Чтобы каждый раз не дергать .length
          var pages_complete = 0;
          var CORS_PROXY = 'http://crossorigin.me/';  // константа, содержащая адрес прокси для CORS-запросов
          var canvas = document.createElement('CANVAS'), ctx = canvas.getContext('2d');// для конвертирования изображений в base64
          var flushPage = function (title, pid, html) {   // Добавление готовой страницы (с картинками) в объект JSZip
              if (html!='') zip.file(vkCleanFileName(title) + ' (' + pid + ').html',
                  '<!DOCTYPE HTML><html><head><meta charset="utf-8"><title>' + (title || 'Wiki ' + oid + '_' + pid + ' [VkOpt]') + '</title><link type="text/css" rel="stylesheet" href="https://vk.com/css/al/wk.css"></head><body>' + html + '</body></html>');
              pages_complete++;
          };
          var dlpages = function (i) {  // рекурсивная функция скачивания страниц. i - номер ссылки в массиве
              if (i > -1) {      // условие остановки рекурсии
                  var pid = anchors[i].getAttribute('pid');
                  dApi.call('pages.get', {
                      owner_id: oid,
                      page_id: pid,
                      need_html: 1,
                      v: '5.20'
                  }, function (r, response) {
                      var el = vkCe('div', {}, response.html); // Запихиваем html-код в элемент, чтобы картинки начали грузиться
                      // обработка away-ссылок
                      var as = geByTag('a', el);
                      for (var j = 0; j < as.length; j++)
                          vkopt.away.process_link(as[j]);
                      // обработка картинок
                      var imgs = geByTag('img', el);
                      var imgs_total = imgs.length;
                      if (imgs_total) {           // если на странице есть картинки
                          var imgs_loaded = 0;    // а это - самопальный счетчик готовых картинок, т.к. события "все картинки загружены" нет.
                          var onLoad = function (e) {      // конвертируем в base64
                              var img = e.target;
                              canvas.height = img.naturalHeight;
                              canvas.width = img.naturalWidth;
                              try {
                                  ctx.drawImage(img, 0, 0);
                                  var dataURL = canvas.toDataURL('image/jpeg');
                              } catch (err) {
                                  onError(e);
                                  return;
                              }
                              img.onload = null;
                              img.src = dataURL;
                              img.removeAttribute('crossOrigin');
                              if (++imgs_loaded == imgs_total)        // если это последняя загруженная картинка на странице, сохраняем страницу.
                                  flushPage(response.title, pid, el.innerHTML);
                          };
                          var onError = function (e) {
                              var img = e.target;
                              if (img.src.indexOf(CORS_PROXY) == -1 && img.src.indexOf('data') != 0)  // Сначала пытаемся загрузить картинку через прокси
                                  img.src = CORS_PROXY + img.src;
                              else {                                  // при повторной ошибке оставляем адрес как есть
                                  img.removeAttribute('crossOrigin');
                                  img.onload = null;
                                  img.onerror = null;
                                  img.src = img.src.replace(CORS_PROXY, '');
                                  if (++imgs_loaded == imgs_total)  // не удалось загрузить картинку, однако она последняя; всё равно сохраняем страницу.
                                      flushPage(response.title, pid, el.innerHTML);
                              }
                          };
                          for (var j = 0; j < imgs_total; j++) {
                              imgs[j].crossOrigin = 'Anonymous';  // stackoverflow фигни не посоветует!
                              imgs[j].onload = onLoad;
                              imgs[j].onerror = onError;
                          }
                      }
                      else
                          flushPage(response.title, pid, el.innerHTML);
                      Progress(anchors_length - i, anchors_length);   // Потому что скачивание идет задом наперед
                      dlpages(--i);                                   // продолжаем рекурсию
                  });
              }
              else {  // скачивание текстов страниц закончено; дожидаемся загрузки всех картинок в страницах
                  var t = setInterval(function () {
                      if (pages_complete == anchors_length) { // все страницы загружены; сохраняем zip
                          clearInterval(t);
                          var content = zip.generate({type: "blob"});
                          saveAs(content, "wiki_" + vkCleanFileName(document.title) + ".zip");
                          box.hide();
                      }
                  }, 100);
              }
          };
          var Progress = function (c, f) {                // обновление прогрессбара
              box.content(vkProgressBar(c, f || 1, 350));
          };
          JsZipConnect(function () {
              zip = new JSZip();                          // Создание объекта JSZip в ранее объявленную переменную
              anchors = geByClass('vk_wiki_link', ge('box_layer'));
              anchors_length = anchors.length;
              box = vkAlertBox(IDL('Loading'));
              dlpages(anchors_length - 1);                // Запуск рекурсии с последней ссылки
          });
      }
   }
};

vkopt['wall'] = {
   onSettings:{
      vkInterface:{
         postpone_custom_interval:{
            title: 'sePostponeCustomInterval'
         }
      },
      Extra: {
         datepicker_inj:{},
         wall_reload_btn:{
            default_value: true
         }
      }
   },
   css: function(){
      return vk_lib.get_block_comments(function(){
         /*css:
         .vk_poll_info_btn{
            color: #939393;
         }
         .vk_ui_tab_reload{
            padding: 17px 6px 14px;
         }
         .vk_ui_tab_reload:after {
            content: '';
            display: inline;
            padding: 5px 14px 5px 0;
            background: no-repeat;
            background-position: 100%;
            opacity: 0.75;
            filter: alpha(opacity=75);
         }
         .vk_ico_refresh, .vk_ui_tab_reload:after{
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20viewBox%3D%220%200%2024%2024%22%20version%3D%221.1%22%3E%3Cg%3E%3Cpath%20fill%3D%22%2397a6be%22%20d%3D%22M%2015.324219%204.445313%20C%2013.496094%203.640625%2011.433594%203.515625%209.515625%204.121094%20C%205.871094%205.269531%203.507813%208.726563%203.753906%2012.53125%20L%201.265625%2012.695313%20C%200.945313%207.738281%204.027344%203.238281%208.765625%201.742188%20C%2011.539063%200.867188%2014.546875%201.171875%2017.097656%202.550781%20L%2019.484375%200%20L%2020.121094%207.074219%20L%2012.628906%207.324219%20Z%20M%2015.230469%2022.257813%20C%2014.179688%2022.585938%2013.089844%2022.753906%2012.007813%2022.753906%20C%2010.242188%2022.753906%208.488281%2022.296875%206.90625%2021.445313%20L%204.515625%2024%20L%203.882813%2016.925781%20L%2011.371094%2016.675781%20L%208.679688%2019.554688%20C%2010.5%2020.355469%2012.5625%2020.484375%2014.480469%2019.878906%20C%2018.125%2018.726563%2020.492188%2015.265625%2020.246094%2011.46875%20L%2022.730469%2011.304688%20C%2023.058594%2016.253906%2019.972656%2020.757813%2015.230469%2022.257813%20Z%20%22%3E%3C%2Fpath%3E%3C%2Fg%3E%3C%2Fsvg%3E");
         }
         .vk_ui_tab_reload:hover:after {
            opacity: 1;
         }
         .ui_tabs_search_opened .vk_reload_wrap {
            display: none;
         }
         */
      }).css;
   },
   onLibFiles: function(file_name){

      /* Задача - хотим менять дефолтный интервал между создаваемыми отложенными постами.
      Вариант 1.
      if (file_name == 'ui_media_selector.js')
         Inj.Replace('MediaSelector',/\+\s*3600/g, ' + vkopt.wall.postponed.date_mod()') // заменяем то самое место, где захардкожен интервал.
      Но если обновить страницу, на которой стена, то фикс не применится, т.к медиаселектор создаёт свой экземпляр раньше, чем вкопт изменит его код.
      Поэтому будем править время уже в самом datepicker'е
      */
   },
   tpls:{},
   onInit: function(){
      vkopt.wall.tpls = vk_lib.get_block_comments(function(){
         /*results_btn:
         <a class="ui_actions_menu_item vk_acts_item_r vk_acts_item_ricon" href="#" onclick="cancelEvent(event); return vkopt.wall.poll_results('{vals.owner_id}','{vals.poll_id}','{vals.post_id}');">{lng.ViewResults}</a>
         */
         /*reload_button:
            <li class="vk_reload_wrap">
              <a class="ui_tab_plain vk_ui_tab_reload" onclick="return vkopt.wall.reload();" href="#">
               <span class="blind_label">{lng.Reload}</span>
              </a>
            </div>
            </li>
         */

         /*poll_answer_row:
            <div class="media_voting_option_wrap media_voting_option_voted media_voting_option_leader">
                <div class="media_voting_option">
                    <div class="media_voting_option_text">
                    {vals.answer}
                      <span class="media_voting_option_count">
                         <span class="media_voting_option_counter">
                           <span class="media_voting_separator">&#8901;</span>
                           {vals.count}
                         </span>
                         <span class="media_voting_separator">&#8901;</span>000
                      </span>
                    </div>
                    <div class="media_voting_option_percent">{vals.rate} %</div>
                    <div class="media_voting_option_bar" style="width:{vals.width}%"></div>
                </div>
            </div>
         */

         /*poll_wrap:
         <div class="post_media_voting">
             <div class="media_voting media_voting_clickable_options">
                 <div class="media_voting_header">
                     <div class="media_voting_question">{vals.question}</div>
                     <div class="media_voting_info">{vals.type=}</div>
                 </div>
                 <div class="media_voting_options">
                 {vals.answers}
                 </div>
                 <div class="media_voting_footer">
                     <div class="pr pr_medium media_voting_footer_pr">
                         <div class="pr_bt"></div>
                         <div class="pr_bt"></div>
                         <div class="pr_bt"></div>
                     </div>
                     <div class="media_voting_footer_voted"><span><b>{vals.total=}</b></span></div>
                 </div>
             </div>
         </div>
         */
      });
   },
   onDatepickerCreate: function(args){
      // args[0] - element_id
      // args[1] - options

      if (vkopt.settings.get('postpone_custom_interval') && args && args.length > 0)
         vkopt.wall.postponed.datepicker(args[0],args[1])
   },
   postponed: {
      additional_interval: 0,
      datepicker: function(el,options){
         el = ge(el);
         var vk_post_date =  parseInt(val(el));
         if (el && el.id && /postpone_date/.test(el.id) && el.value){ // если создаётся селектор даты для таймера публикации поста
            val(el, parseInt(val(el)) + vkopt.wall.postponed.date_mod()); // добавляем к дефолтному времени своё значение.
            if (isObject(options) && options.onUpdate){
               var orig_onUpdate = options.onUpdate;
               options.onUpdate = function(){
                  console.log(arguments);
                  var args = Array.prototype.slice.call(arguments);
                  orig_onUpdate.apply(this, args);

                  vkopt.wall.postponed.on_update(parseInt(val(ge(el.id))), vk_post_date); // el != ge(el.id)   WTF? o_O
               }
            }
         }
      },
      on_update: function(new_time, orig_time){
         // видираем хардкод временного шага создания поста и функции прикрепения таймера
         var default_step = ((cur.chooseMedia && cur.chooseMedia.toString().match(/cur.postponedLastDate[^;\d]+(\d+)/)) || [0,3600])[1];

         // поведение вк - если предлагаемое бекэндом время поста меньше текущего, то инкрементим до текущего.
         // делаем себе такую же логику для корректного определения кастомного промежутка:
         var orig_post_time = orig_time - default_step;
         var cur_dt = Math.round((new Date).getTime() / 1e3);
         if (orig_post_time > cur_dt)
            cur_dt = orig_post_time;

         var pp_last_dt = intval(cur.postponedLastDate);
         // Считаем интервал между последним отложенным и создаваемым
         var interval = new_time - (pp_last_dt && (pp_last_dt > cur_dt) ? pp_last_dt : cur_dt);

         if (interval){


            // Вычисляем величину, на которую будем автоматически дополнять время таймера для нового поста
            vkopt.wall.postponed.additional_interval = interval - default_step
         }
      },
      date_mod: function(){
         //var hours = 3; // нужна опция выбора величины интервала между постами.
         return vkopt.wall.postponed.additional_interval;//hours * 60*60;
      }
   },
   processNode: function(node, params) {
      var els=geByClass('post_media_voting',node);
      for (var i=0; i<els.length; i++){
         vkopt.wall.poll_btns(els[i]);
      }

      if (!els.length && params && params.q && params.url == '/widget_poll.php' && params.q.act == 'a_vote')
         vkopt.wall.poll_btns(node);

      vkopt.wall.reload_btn(node);
   },
   reload_btn: function(node){
      if (!vkopt.settings.get('wall_reload_btn')) return;
      var p = domQuery('#wall_tabs.ui_tabs', node)[0];
      if (!p || geByClass1('vk_ui_tab_reload', p)) return;
      var btn =  se(vk_lib.tpl_process(vkopt.wall.tpls['reload_button'],{}));
      var ref = geByClass1('ui_tab_search_wrap', p);
      //ref.parentNode.insertBefore(btn, ref);
      p.appendChild(btn);
   },
   reload:function(){
      cur.wallNextFrom = 0;
      Wall.showMore(0);
      return false;
   },
   poll_btns: function(p){
      var votingEl=geByClass('media_voting',p)[0];
      var c=geByClass('ui_actions_menu_item',votingEl)[0];

      if (!votingEl || !c) return;

      var id = domData(votingEl, 'id'),
          oid = domData(votingEl, 'owner-id'),
          board = domData(votingEl, 'board'),
          post_id = domData(votingEl.parentNode, 'post-raw');

      var res_btn =  se(vk_lib.tpl_process(vkopt.wall.tpls['results_btn'],{
         owner_id: oid,
         poll_id:  id,
         post_id:  post_id
      }));
      c.parentNode.appendChild(res_btn);
   },
   poll_results: function(owner_id, poll_id, post_id){
      var full_post_id = /*owner_id + '_' +*/ post_id;
      var view=function(data){
         if(!data){
            vkAlertBox(IDL('Error'),'poll data: <br>'+[owner_id, poll_id, post_id].join('<br>'));
            return;
         }
         var answer=data.answers; //answer[i].rate=12.9; answer[i].text="...."; answer[i].votes=150
         var max=0;
         for (var i=0; i<answer.length; i++){
            max=Math.max(max,answer[i].rate);
         }

         var html="";

         for (var i=0; i<answer.length; i++){
            var width=Math.round(answer[i].rate*100/max);
            html +=  vk_lib.tpl_process(vkopt.wall.tpls['poll_answer_row'],{//['poll_answer_row']
               answer: answer[i].text,
               count:answer[i].votes,
               rate: answer[i].rate,
               width:width
            });
         }

         html =  vk_lib.tpl_process(vkopt.wall.tpls['poll_wrap'],{//['poll_wrap']
            question:data.question,
            type: '',
            answers: html,
            total: data.votes
         });

         vkAlertBox(IDL('ViewResults'),html).setOptions({width:550});
         //vkopt.wall.poll_voters(data.owner_id,data.id);
      };


      var code = 'return {posts: API.wall.getById({posts:"'+full_post_id+'", copy_history_depth: 2}), poll: API.polls.getById({owner_id:'+owner_id+',poll_id:'+poll_id+'})};'
      if (!post_id && owner_id && poll_id){
         dApi.call('polls.getById',{owner_id:owner_id, poll_id:poll_id, v: '5.59'},function(r){
            var data=r.response;
            view(data);
         });
      } else {
         dApi.call('execute',{code:code, v: '5.59'},function(r){
         var post = ((r.response || {}).posts || [])[0] || {};
            var scan = function(list){
               if (!list)
                  return null;
               for (var i = 0; i < list.length; i++)
                  if (list[i].type == 'poll' && list[i].poll.id == poll_id)
                     return list[i].poll;
               return null;
            }
            var poll = scan(post.attachments);
            if (!poll && post.copy_history)
               for (var i = 0; i < post.copy_history.length; i++){
                  poll = scan(post.copy_history[i].attachments);
                  if (poll)
                     break;
               }
            vkopt.log(poll);
            view(poll);
         });
      }
      return false;
   },
   poll_voters: function(oid,poll_id){
      var code='\
        var oid='+oid+';\
        var poll_id='+poll_id+';\
        var poll=API.polls.getById({owner_id:oid,poll_id:poll_id});\
        var voters=API.polls.getVoters({owner_id:oid,poll_id:poll_id,answer_ids:poll.answers@.id,fields:"first_name,last_name,online,photo_rec",offset:0,count:9});\
        return {poll:poll,voters:voters,anwers_ids:poll.answers@.id};\
      ';
      dApi.call('execute',{code:code, v: '5.59'},function(r){
            var data=r.response;
            if (vk_DEBUG) console.log(data);
            if (data.voters){
               stManager.add('wk.css');
               var voters=data.voters;
               for (var j=0; j<voters.length; j++){
                  var el=ge('vk_poll_usrs'+voters[j].answer_id);
                  var users=voters[j].users;
                  var html='';
                  for (var i=0; i<users.length; i++){
                     if (!users[i].uid) continue;
                     html+='<a class="wk_poll_usr inl_bl" title="'+users[i].first_name+' '+users[i].last_name+'" href="/id'+users[i].uid+'"><img class="wk_poll_usr_photo" src="'+users[i].photo_rec+'" width="30" height="30"></a>';
                  }
                  val(el, html);
               }
            }
      });
      // ge('vk_poll_usrs'+voters[i].answer_id)
   }

};

vkopt['friends'] = {
   tpls: {},
   onSettings:{
      Extra:{
         accept_more_cats:{}
      }
   },
   onInit: function(){
      vkopt.friends.tpls = vk_lib.get_block_comments(function(){
      /*ritem_show_deleted:
      <a id="ui_rmenu_deleted" href="{vals.href=#}" class="ui_rmenu_item _ui_item_deleted friends_section_deleted" onclick="return vkopt.friends.show_deleted(this, event);">
         <span>
            <span class="ui_rmenu_count"></span>
            {lng.FrDeleted}
         </span>
      </a>
      */
      });
   },
   onResponseAnswer: function(answer,url,q){
      if (
         window.cur && cur.userLists &&
         vkopt.settings.get('accept_more_cats') &&
         url == '/al_friends.php' && q.act == 'add' &&
         q.request == 1 && q.select_list == 1 && answer[0]
      ){
         answer[0] = vkopt.friends.accept_more_cats(answer[0], q.mid);
      }
   },
   onLocation: function(){
      if(nav.objLoc[0] != 'friends')
         return;

      if (!geByClass1('friends_section_deleted')){
         var ref = ge('ui_rmenu_find') || ge('ui_rmenu_recent') || ge('ui_rmenu_phonebook') || ge('ui_rmenu_all');
         ref && domInsertAfter(se(vk_lib.tpl_process(vkopt.friends.tpls['ritem_show_deleted'],{})),ref);
      }
      (cur.section=='all' || nav.objLoc['section'] == 'all' || !nav.objLoc['section'] ? show : hide)(ge('ui_rmenu_deleted'));
   },
   show_deleted: function(el, ev){
      el && uiRightMenu.switchMenu(el);

      if (cur.silent){
         setTimeout(function(){
            vkopt.friends.show_deleted(el, ev);
         }, 500);
         return;
      }

      var deleted = [];
      for(var i = 0; i < cur.friendsList.all.length; i++)
         if(/\/images\/deactivated_/.test(cur.friendsList.all[i][1]) || cur.friendsList.all[i][5] == 'DELETED')
            deleted.push(cur.friendsList.all[i]);

      el && val(geByClass1('ui_rmenu_count',el), deleted.length)
      cur.friendsList['deleted'] = deleted;
      Friends.showSection('deleted');
      return false;
   },
   accept_more_cats: function(html, mid){
      if (vkopt.settings.get('accept_more_cats')){
         html += '<div class="friends_added">';
         html += '<div class="friends_added_text box_controls_text">'+IDL('AddFrToList')+'</div>';
         for (var key in cur.userLists)
            html += '<div class="checkbox" onclick="return Friends.checkCat(this, '+mid+', '+key+', 1);"><div></div>'+cur.userLists[key]+'</div>';
         html += '</div>';
      }
      return html;
   }
}

vkopt['support'] = {
   onSettings:{
      Extra: {
         stealth_addons:{}
      }
   },
   onRequestQuery: function(url, q, options){
      if (q.audio_orig && q.audio_html){
         if (!vkopt.settings.get('stealth_addons')) return;
         q.audio_html = q.audio_orig;
      }
   }
};

vkopt['test_module'] =  {
   /*
   onInit: function(){
      vkopt.xxx.tpls = vk_lib.get_block_comments(function(){
         /*tpl:

         * /
      });
   },
   onAudioRowMenuItems: function(info){
       console.log(arguments);
      return [
         '<div>---</div>',
         '<div>'+info.fullId+'</div>',
         '<div>^^^</div>',
      ];
   },
   onLibFiles:       function(file_name){
      console.log('test onLibFiles:',file_name)
   },
   onLocation:       function(nav_obj,cur_module_name){
      console.log('test onLocation:',nav_obj,cur_module_name)
   },
   onResponseAnswer: function(answer,url,params){
      console.log('test onResponseAnswer:',url,params,answer[1], answer)
   },
   onStorage :       function(command_id,command_obj){
      console.log('test onStorage:', command_id, command_obj)
   },
   processNode:      function(node, params){
      //console.log('test processNode:',node, params)
   },
   processLinks:     function(link_el, params){
      //console.log('test processLinks:',link_el, params)
   },
   //*/
};

vkopt['im_form'] = {
   onSettings:{
      Messages:{
         im_recent_emoji:{
            title: 'seRecentEmoji',
            class_toggler: true
         },
         im_store_h:{
            title: 'seStoreHeightImTxt',
            class_toggler: true
         }
      }
   },
   css: function() {
      var code = vk_lib.get_block_comments(function() {
         /*css:
         .vk_im_recent_emoji .im-chat-input .im-chat-input--txt-wrap {
            margin-bottom: 0;
         }
         .vk_im_recent_emoji #mail_box_controls {
            padding-top: 0;
         }
         ._vk_im_store_h .im-chat-input .im-chat-input--text {
            resize: vertical;
            height: auto;
         }
         .vk_im_store_h .im-chat-input .im-chat-input--smile-wrap .emoji_smile {
            _padding: 6px 3px;
         }
         .vk_im_store_h .emoji_smile_wrap {
            _right: 11px;
         }

         .vk_im_store_h ._im_media_selector,
         .vk_im_store_h .im-send-btn {
            margin: auto;
            padding: 0;
            bottom: 0;
            top: 0;
         }
         .vk_im_store_h ._im_media_selector {
            width: 56px;
            height: 62px;
         }

         #vk_im_form_resizer_wrap{
            height:10px;
            _background:#AAA;
            _display: none;
             margin-top: -10px;
             cursor: row-resize;
         }
         #vk_im_form_resizer_wrap:before {
             display: block;
             content: "";
             position: absolute;
             left: 50%;
             top: 4px;
             width: 10px;
             height: 2px;
             border-top: 1px solid #d4d6da;
             border-bottom: 1px solid #d4d6da;
             margin-left: -5px
         }
         */
      }).css;
      /*
      if (vkopt.settings.get('im_store_h')) {
         var h = vkopt.settings.get('im_form_h');
         if (h) code += '.vk_im_store_h .im-chat-input--text{height:'+h+';}';
      }*/
      return code;
   },

   onLibFiles: function(file_name) {
      if (file_name != 'writebox.js') return;

      Inj.End('showWriteMessageBox', function(){
         vkopt.im_form.debounce(vkopt.im_form.add_recent_emoji);
      });
      vkopt.im_form.debounce(vkopt.im_form.add_recent_emoji);
   },

   add_recent_emoji: function() {
      if (ge('im_form_emoji') || !window.Emoji) return;
      if (!geByClass1('im-chat-input--text') && !ge('mail_box_editable')) return;

      stManager.add([jsc("web/emoji.js")], function(){
         var emoji = document.createElement('div');
         emoji.id = 'im_form_emoji';


         var tarea = geByClass1('im-chat-input--textarea');
         if (tarea)
            tarea.insertBefore(emoji, geByClass1('im-chat-input--scroll', tarea));
         else {
            tarea = ge('mbe_emoji_wrap');
            if (tarea) tarea.appendChild(emoji);
         }
         if (tarea){
            emoji.appendChild(vkopt.im_form.recent_emoji(tarea));
         }
      })
   },
   get_opt_id: function(el){
      var optId = 0;
      try{
         optId = data(geByClass1('_emoji_wrap', gpeByClass('_emoji_field_wrap',el)), 'optId') || 0;
      } catch(e){}
      return optId;
   },
   recent_emoji: function(el) {
      var emojiList = Emoji.emojiGetRecentFromStorage();
      if (emojiList) Emoji.setRecentEmojiList(emojiList);

      var cat = Emoji.getRecentEmojiSorted();
      var data = document.createElement('div');
      data.className = 'emoji_smiles_row';

      var optId = 0;
      try{
         optId = data(geByClass1('_emoji_wrap', el), 'optId') || 0; // вообще не факт, что к этому моменту optId уже проставлен.
                                                                    // из-за этого может быть путаница при определение набора опций принадлежащего конкретному иниту панели Emoji,
                                                                    // а на сколько это важно, возможно из баг-репортов узнаем.
      } catch(e){}

      for (var i=0, len = cat.length; i<len; i++) {
         var wrap = Emoji.emojiWrapItem(optId, cat[i], i);
         wrap = wrap.replace(/Emoji\.shownId/g,'vkopt.im_form.get_opt_id(this)'); // при закрытой панели смайлов Emoji.shownId не содержит нужного значения. Меняем его на функцию поиска optId
         data.innerHTML += wrap;
      }

      return data;
   },
   del_recent_emoji : function () {
      if (ge('im_form_emoji')) {
         re('im_form_emoji')
      }
   },

   add_resizer: function(){
      if (!ge('vk_im_form_resizer_wrap') && geByClass1('im-chat-input--error')){
         insertAfter(se('<div id="vk_im_form_resizer_wrap"><div></div></div>'), geByClass1('im-chat-input--error'));
         addEvent('vk_im_form_resizer_wrap', 'mousedown', vkopt.im_form.on_resize_start);
      }
   },
   on_resize_start: function (e) {
      cur.resizeStartY = e.clientY;
      cur.resizeStartH = geByClass1('im_editable').clientHeight; //cur.imEl.resizable.clientHeight;
      cur.resizeStartScroll = scrollGetY(true);
      cur.emMove = undefined;
      var cb = function (e) {
         setStyle(bodyNode, 'cursor', '');
         removeEvent(document, 'mouseup', cb);
         removeEvent(document, 'mousemove', vkopt.im_form.on_resize);
         removeEvent(document, 'drag', vkopt.im_form.on_resize);
      };
      setStyle(bodyNode, 'cursor', 'row-resize');
      addEvent(document, 'mouseup', cb);
      addEvent(document, 'mousemove', vkopt.im_form.on_resize);
      addEvent(document, 'drag', vkopt.im_form.on_resize);
      return cancelEvent(e);
   },
   on_resize : function (e) {
      var diff = e.clientY - cur.resizeStartY,
      h = cur.resizeStartH - diff,
      scroll = !!diff;

      if (h < 20) {
         h = 0;
         scroll = false;
      } else if (h > 0.4 * lastWindowHeight) {
         h = 0.4 * lastWindowHeight;
         scroll = false;
      }
      setStyle(geByClass1('im_editable'), 'height', h);
      vkopt.settings.set('im_form_h', h + 'px');
      cancelEvent(e);
      return false;
   },

   debounce : function (cb) {
      clearTimeout(vkopt.im_form.delay);
      vkopt.im_form.delay = setTimeout(cb, 200);
   },
   onLocation: function() {
      if (!vkopt.settings.get('im_recent_emoji') && !vkopt.settings.get('im_store_h')) return;

      vkopt.im_form.debounce(function() {
         if (vkopt.settings.get('im_recent_emoji')) vkopt.im_form.add_recent_emoji();

         if (vkopt.settings.get('im_store_h')) {
            var inp = geByClass1('im-chat-input--text')
            if (inp != null) {
               vkopt.im_form.add_resizer();

               inp.style.height = vkopt.settings.get('im_form_h');
               addEvent(inp, 'mouseup', function () {
                  var oldH = parseInt(vkopt.settings.get('im_form_h'));
                  var newH = parseInt(this.style.height);
                  if (newH < 36) newH = 36; //min-height: 36px;
                  vkopt.settings.set('im_form_h', newH + 'px');

                  var el = geByClass1('im-page--chat-body-wrap-inner');
                  var borderH = parseInt(el.style.borderBottomWidth);
                  el.style.borderBottomWidth = borderH - (oldH - newH) + 'px';
               });
            }
         }
      });
   },
   onOptionChanged: function(option_id, val, option_data) {
      if (option_id == 'im_recent_emoji') {

         vkopt.im_form.debounce(function() {
            if (val) vkopt.im_form.add_recent_emoji();
            else vkopt.im_form.del_recent_emoji();
         });
      }
      if (option_id == 'im_store_h') {
         vkopt.im_form.debounce(function() {
            if (val) {
               var h = vkopt.settings.get('im_form_h');
               //if (h) vkopt.set_css('.vk_im_store_h .im-chat-input--text{height:'+h+';}','im_form_h');
               geByClass1('im-chat-input--text').style.height = h;
            } else {
               geByClass1('im-chat-input--text').style.height = '';
            }
         })
      }
   }
}

vkopt['turn_blocks'] = {
   onSettings:{
      vkInterface:{
         turn_blocks:{
            title: 'seShutProfilesBlock',
            class_toggler: true
         }
      }
   },
   css: function() {
      vkopt.turn_blocks.arrset = vkopt.settings.get('turn_blocks_arr') || [];
      var code = vkopt.turn_blocks.getShutCss();
      vkopt.set_css(code, 'vk_closed_blocks_temp');

      return vk_lib.get_block_comments(function() {
            /*css:
            .vk_turn_blocks .module_header .header_top{
                padding-right: 0px;
            }
            .vk_turn_blocks .shut_block .module_header .header_top{
                padding-top: 0px;
                height: 40px;
            }
            .vk_turn_blocks .shut_icon_wrap{
                padding-right: 10px;
                height: 40px;
            }
            .vk_turn_blocks .shut_icon{
                background: url(/images/icons/menu_arrow.png) no-repeat 50% 50%;
                width: 10px;
                height: 40px;
                margin-left: -6px;
                -webkit-transform: rotate(180deg);
                transform: rotate(180deg);
            }
            .vk_turn_blocks .shut_block .shut_icon{
                -webkit-transform: rotate(0deg);
                transform: rotate(0deg);
            }
            .vk_turn_blocks .shut_block .module_body,
            .vk_turn_blocks .shut_block .page_photos_module {
               display:none;
            }
            */
         }).css;
   },
   addIcons: function() {
      vkopt.turn_blocks.arrset = vkopt.settings.get('turn_blocks_arr') || [];
      vkopt.set_css('','vk_turn_blocks_state');
      var code = vkopt.turn_blocks.getShutCss();
      vkopt.set_css(code, 'vk_closed_blocks_temp');

      var blocks = geByClass('header_top clear_fix');
      for (i = 0; i < blocks.length; i++) {
         if (!geByClass1('shut_icon',blocks[i])) {
            var icon = document.createElement('div');
            icon.className = 'shut_icon';
            var btn = document.createElement('a');
            btn.className = 'fl_l shut_icon_wrap';
            btn.id = blocks[i].parentNode.parentNode.id+'_i';
            btn.href = '#';
            btn.onclick = function(e) {
               e.preventDefault(); //не открываем ссылку блока
               e.stopPropagation(); //не открываем окно блока
               vkopt.turn_blocks.turnBlock(this);
            };
            btn.appendChild(icon);
            blocks[i].insertBefore(btn, blocks[i].firstChild);
         }
      }
      //сворачиваем те, которые были сохранены
      var len = vkopt.turn_blocks.arrset.length;
      for (var i = 0; i < len; i++) {
         var icon = ge(vkopt.turn_blocks.arrset[i]+'_i');
         if (icon !== null) {
            var block = icon.parentNode.parentNode.parentNode;
            addClass(block, 'shut_block');
         }
      }
   },
   delIcons: function() { //отключение
      vkopt.set_css('.shut_icon{display:none}','vk_turn_blocks_state');
      vkopt.set_css('', 'vk_closed_blocks_temp');
   },
   turnBlock: function(icon) {
      var block = icon.parentNode.parentNode.parentNode;
      var blockname = icon.parentNode;
      var arrset = vkopt.turn_blocks.arrset;

      if (hasClass(block, 'shut_block')) {
         var index = arrset.indexOf(block.id);
         if (index > -1) arrset.splice(index, 1);
         removeClass(block, 'shut_block');
      } else {
         arrset.push(block.id);
         addClass(block, 'shut_block');
      }
      var code = vkopt.turn_blocks.getShutCss();
      vkopt.set_css(code, 'vk_closed_blocks_temp');
      vkopt.settings.set('turn_blocks_arr', arrset);
   },
   getShutCss: function() {
      if (vkopt.turn_blocks.arrset.length<1) return '';
      var selectors = [];
      for (var i in vkopt.turn_blocks.arrset) {
         if (vkopt.turn_blocks.arrset[i] == 'profile_photos_module')
            selectors.push('#profile_photos_module .page_photos_module'); //костыль
         else selectors.push('#' + vkopt.turn_blocks.arrset[i] + ' .module_body');
      }
      var code = selectors.join(',\n') + '{ display: none }';
      return code;
   },
   reset: function() {
      vkopt.settings.set('turn_blocks_arr', []);
   },
   onLocation: function() {
      if (vkopt.settings.get('turn_blocks')) {
         clearTimeout(vkopt.turn_blocks.delay);
         vkopt.turn_blocks.delay = setTimeout(function() {
            vkopt.turn_blocks.addIcons();
         }, 200);
      }
   },
   onOptionChanged: function(option_id, val, option_data){
      if (option_id == 'turn_blocks') {
         clearTimeout(vkopt.turn_blocks.delay);
         vkopt.turn_blocks.delay = setTimeout(function() {
            if (val) vkopt.turn_blocks.addIcons();
            else vkopt.turn_blocks.delIcons();
         }, 200);
      }
   }
}

vkopt['audio_clean_titles'] = {
	onSettings:{
		Media:{
			audio_clean_titles: {
				title: 'seAudioUntrashTitle'
			}}
	},
	processNode: function (node, params) {
		if (vkopt.settings.get('audio_clean_titles')){ // clean titles
			var nodes=domQuery('.audio_row__performer_title, .audio_title_wrap', node);
			for (var i=0; i<nodes.length; i++){
				FindAndProcessTextNodes(nodes[i],function(mainNode,childItem){
					var el = mainNode.childNodes[childItem];
					if (el.nodeValue && !/^[\u2013\s]+$/.test(el.nodeValue)){
						el.nodeValue=vkopt.audio.remove_trash(el.nodeValue);
					}
					return childItem;
				});
			}
		}
	}
}

vkopt['vk_dislike'] = {
   app_id:3395854,
   server:'http://dislike.server/like.php',
   ls_val:'dislike_auth',
   ids_per_req:5,//10,//20,
   delay:1000,
   cache_time:3 * 60 * 1000,// 3 min
   is_enabled:function(){
      return vkopt.settings.get('dislikes_enabled');
   },
   tpls:{},
   icons:[],
   //0 - striked, 1 - striked empty, 2 - broken, 3 - crossed, 4 - skull, 5 - thumb
   icons_svg: [
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M4.5,10.7l9.9-9.9c-1.9-1.5-5.8-1-6.4,2.4C7.4-0.3,3.2-0.8,1.4,1c-1.9,1.9-1.9,4.8,0,6.7C1.7,8,3.1,9.4,4.5,10.7z"/><path d="M5.4,11.6C6.3,12.4,6.9,13,6.9,13c0.5,0.6,1.6,0.6,2.1,0l5.5-5.3c1.7-1.7,2-4.1,0.7-5.9L5.4,11.6z"/></svg>',
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M3.4,10.6l1.1-1.1C3.7,8.7,2.9,7.9,2.8,7.8c-1.5-1.5-1.5-3.8,0-5.3C4.2,1,7.5,1.4,8,4.2 c0.4-2.2,2.5-2.9,4.1-2.4l1.2-1.2c-0.7-0.3-1.4-0.5-2.2-0.5C9.9,0.1,8.9,0.4,8,1.1C7.1,0.4,6,0,4.9,0C3.6,0,2.4,0.5,1.6,1.3 c-2.1,2.1-2.1,5.5,0,7.6C1.8,9.1,2.5,9.8,3.4,10.6z"/><path d="M16,0L16,0L2.1,14h2.1l1.3-1.3C5.7,12.9,5.9,13,6,13.1C6.5,13.7,7.2,14,8,14c0.8,0,1.5-0.3,2-0.9l4.3-4.2 c1.1-1,1.7-2.4,1.7-3.8c0-0.9-0.2-1.7-0.6-2.4L16,2.1V0z M13.2,7.8L8.8,12c-0.4,0.5-1.3,0.5-1.7,0c0,0-0.2-0.2-0.5-0.5l7.6-7.6 C14.7,5.2,14.3,6.7,13.2,7.8z"/></svg>',
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M14.6,1.1c-1.4-1.3-4.2-1.4-5.7,0.3l1.6,3.5L8,6.6l1.8,2.8l-1.8,4l0.8-4.2L6.3,6.8l2.4-2.6L6.2,0.6 C4.7-0.3,2.5-0.1,1.4,1.1c-1.9,1.9-1.9,4.8,0,6.7c0.5,0.5,5.5,5.3,5.5,5.3c0.5,0.6,1.6,0.6,2.1,0l5.5-5.3C16.5,5.9,16.5,3,14.6,1.1z"/></svg>',
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M7.1,8L0.8,1.7c-1.3,1.9-1.1,4.3,0.6,6c0.3,0.3,1.7,1.7,3.1,3L7.1,8z"/><path d="M8,7.1l6.3-6.3c-1.9-1.5-5.8-1-6.4,2.4C7.4-0.1,3.6-0.7,1.7,0.8L8,7.1z"/><path d="M8,9l-2.6,2.6C6.3,12.4,6.9,13,6.9,13c0.5,0.6,1.6,0.6,2.1,0l1.6-1.5L8,9z"/><path d="M9,8l2.5,2.5l3-2.9c1.7-1.7,2-4.1,0.7-5.9L9,8z"/></svg>',
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M8,0C4.9,0,2.3,2.6,2.3,5.7c0,1.6,0.6,3,1.7,4c0.5,0.5,0.8,3.8,1.5,4.1 c0.2,0.1,0.5,0.1,1,0.2v-2.7l1,0V14c0.3,0,0.7,0,1,0v-2.8l1,0v2.7c0.5,0,0.8-0.1,1-0.2c0.7-0.3,1-3.5,1.5-4.1c1-1,1.7-2.5,1.7-4 C13.7,2.6,11.1,0,8,0z M5.7,7.6c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6S7.3,5,7.3,5.9C7.3,6.8,6.6,7.6,5.7,7.6z M7,9.8L8,7 l1,2.9L7,9.8z M10.3,7.6c-0.9,0-1.6-0.7-1.6-1.6c0-0.9,0.7-1.6,1.6-1.6c0.9,0,1.6,0.7,1.6,1.6C11.9,6.8,11.2,7.6,10.3,7.6z"/></svg>',
         '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" style="fill:#3D6899;"><path d="M15.2,1.6c0-0.1-0.4-1.3-2-1.5C11.9-0.1,8.9,0,8.3,0.3L7.6,0.7c0,0-0.9,0.5-0.9,0.5c-0.1,0-0.6,0.1-1.4,0V0.8H0v7.3h5.2V8 c0.7,0.3,1.6,0.9,2,1.6c0.6,0.9,1.1,2.1,1.4,2.9c0.4,1,0.6,1.4,1,1.5c1.2,0.1,2-0.5,2.2-1.6c0.1-0.3,0.1-0.6,0.1-0.8 c0-1-0.3-1.8-0.6-2.4c0.7,0,1.6,0,1.6,0c1.3,0,2.2-0.6,2.7-1.7C16.5,5.8,15.4,2.1,15.2,1.6z M14.8,7.1c-0.3,0.7-0.9,1.1-1.8,1.1H9.7 l0.5,0.7c0,0,0.8,1.2,0.8,2.6c0,0.2,0,0.4-0.1,0.7C10.8,12.8,10.5,13,10,13c-0.1-0.2-0.4-0.9-0.4-0.9C9.3,11.3,8.8,10.1,8.1,9 C7.4,8,6.1,7.3,5.2,7V2.2c0.8,0,1.4,0,1.7-0.1l1.2-0.6c0,0,0.6-0.4,0.6-0.4C9.1,1,11.7,0.9,13,1.1c1,0.1,1.2,0.8,1.2,0.8 C14.6,3,15.3,5.9,14.8,7.1z"/></svg>'
   ],
   icon_index: vkopt.settings.get('dislike_icon_index'),
   auth_key:'',
   api_id:'',
   viewer_id:'',
   queue:[],
   last_req_ts:0,
   cache:{},
   onSettings: {
      vkInterface:{
         dislikes_enabled:{
            title: 'seDislikeEnable',
            class_toggler: true,
            need_reload: true,
            sub: {
               dislike_icon_index:{
                  title: ' ',
                  content_func: 'dislikes_icons' // vkopt.vk_dislike.dislikes_icons()
               }
            }
         }
      }
   },
   onInit:function(){
      addClass(geByTag1('html'), 'dislike_icon'+vkopt.settings.get('dislike_icon_index'));

      vkopt.vk_dislike.tpls = vk_lib.get_block_comments(function(){
         /*tip:
         <div class="like_tt_header" onclick="vkopt.vk_dislike.show_users('%OBJ_ID%')">
         <span id="dislike_title_%OBJ_ID%" class="_title">%USERS_DISLIKE%</span>
         </div>
         <div class="like_tt_wrap"><div class="like_tt_content">
             <div class="like_tt_hider disliked_users_loading" id="dislike_utable_%OBJ_ID%">
               <div id="dislike_table_%OBJ_ID%" class="like_tt_owners _content"></div>
             </div>
         </div></div>
         */
      });
     //vkopt.vk_dislike.auth();
      console.log('vk_dk status :' + (vkopt.vk_dislike.is_enabled()?'1':'0'));
      if (!vkopt.vk_dislike.is_enabled()) return;
      vkopt.vk_dislike.storage=new vk_tag_api('dislike','http://vk.dislike.server/',3429306);
   },
   auth:function(callback){
      var auth_data=localStorage[vkopt.vk_dislike.ls_val] || '{}';
      var auth_obj;
      try {
         auth_obj=JSON.parse(auth_data);
         if (auth_data.auth_key && auth_data.api_id && auth_data.viewer_id){
            vkopt.vk_dislike.auth_key=auth_data.auth_key;
            vkopt.vk_dislike.api_id=auth_data.api_id;
            vkopt.vk_dislike.viewer_id=auth_data.viewer_id;
            if (callback) callback();
         } else {
            auth_obj=null;
         }
      } catch (e) {}
      vkopt.vk_dislike.post('/app'+vkopt.vk_dislike.app_id,{},function(t){
         var data=(t.match(/var params = (\{[^\}]+\})/)||[])[1]; // parse flash params
         var obj=JSON.parse(data);
         var auth_data={
            auth_key:obj.auth_key,
            api_id:obj.api_id,
            viewer_id:obj.viewer_id
         };
         vkopt.vk_dislike.auth_key=auth_data.auth_key;
         vkopt.vk_dislike.api_id=auth_data.api_id;
         vkopt.vk_dislike.viewer_id=auth_data.viewer_id;
         localStorage[vkopt.vk_dislike.ls_val]=JSON.stringify(auth_data);
         if (callback) callback();
      });
   },

   post:function(url,params,callback){
      AjPost(url,params,function(t){
         if (callback) callback(t);
      });
   },
   users_info:function(uids,callback){
      var res=[];
      var scan=function(){
         var ids=uids.splice(0,1000);// max 1000 uids in one request
         var params={
            //oauth:1,
            //method:'users.get',
            uids:ids.join(','),
            fields:'first_name,last_name,photo_100'
         };
         if (ids.length>0)
            //vkopt.vk_dislike.post('/api.php',params,
            api4dislike.call('users.get', params, function(r){
               //var r=JSON.parse(t);
               res=res.concat(r.response);
               if (uids.length>0)
                  setTimeout(function(){scan();},340);
               else
                  callback(res);
            });
         else
            callback(res);
      };
      scan();
   },
   req:function(params,callback){
      if (params.likes!=null){
         var arr=params.likes.split(',');
         vkopt.vk_dislike.storage.get_tags(arr,function(r){
            var data={};
            for (var key in r){
               data[key]= r[key].count*(r[key].my==1?-1:1);
            }
            callback(data);
         });
      }
      if (params.object!=null){
        var gu=function(){
         vkopt.vk_dislike.storage.get_users(params.object,params.offset || 0, params.limit || 6,function(r){
               callback({"users":r.uids,"count": r.count});
         });
        };
        if (params.action!=null){
            (params.action==1?vkopt.vk_dislike.storage.mark:vkopt.vk_dislike.storage.unmark)(params.object,gu);
        } else gu();
      }
      /*
      var ts=Math.round(new Date().getTime());
      if (ts-vkopt.vk_dislike.last_req_ts<vkopt.vk_dislike.delay){ // проверка времени последнего запроса
         setTimeout(function(){
            vkopt.vk_dislike.req(params,callback);
         },vkopt.vk_dislike.delay);// или может сделать паузу = vkopt.vk_dislike.delay-(ts-vkopt.vk_dislike.last_req_ts)
         return;
      }
      if (!(vkopt.vk_dislike.auth_key && vkopt.vk_dislike.api_id && vkopt.vk_dislike.viewer_id)){ // нужна авторизация
         vkopt.vk_dislike.auth(function(){
            setTimeout(function(){
               vkopt.vk_dislike.req(params,callback);
            },vkopt.vk_dislike.delay);
         });
         return;
      }

      params = params || {};
      params.auth=vkopt.vk_dislike.auth_key;
      params.app=vkopt.vk_dislike.api_id;
      params.uid=vkopt.vk_dislike.viewer_id;
      vkopt.vk_dislike.post(vkopt.vk_dislike.server,params,function(t){
         var obj=JSON.parse(t);
         if (obj['delay']){ // delay before next query in seconds
            vkopt.vk_dislike.delay=obj['delay']*1000;
            delete obj['delay'];
         }
         if (obj['status']){
            if(obj['status'] == -1){  //auth error
               localStorage[vkopt.vk_dislike.ls_val]='{}';// reset auth settings
               vkopt.vk_dislike.auth(function(){
                  setTimeout(function(){
                     vkopt.vk_dislike.req(params,callback);
                  },vkopt.vk_dislike.delay);
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
      var need_run = (vkopt.vk_dislike.queue.length===0); // если очередь была пустая, то нужно запустить получение инфы

      var cached=[];
      var uncached=[];
      for (var i=0; i<obj_ids.length;i++){// отделяем кэшированные от новых
         (vkopt.vk_dislike.in_cache(obj_ids[i])?cached:uncached).push(obj_ids[i]);
      }
      //console.log('uncached:',JSON.stringify(uncached));
      //console.log('cached:',JSON.stringify(cached));
      setTimeout(function(){
         for (var i=0; i<cached.length;i++){
            vkopt.vk_dislike.update_dislike_view(cached[i],vkopt.vk_dislike.cache[cached[i]].value);
         }
      },50);
      //vkopt.vk_dislike.queue=vkopt.vk_dislike.queue.concat(uncached); // новые в конец очереди
      vkopt.vk_dislike.queue=uncached.concat(vkopt.vk_dislike.queue); //новые в начало очереди
      if (need_run) {
         clearTimeout(vkopt.vk_dislike.timeout);
         vkopt.vk_dislike.timeout=setTimeout(function(){vkopt.vk_dislike.load_dislikes_info();},300);
      }
   },
   in_cache:function(obj_id){
      if (vkopt.vk_dislike.cache[obj_id]){
         var ts=Math.round(new Date().getTime());
         if (ts-vkopt.vk_dislike.cache[obj_id].ts <= vkopt.vk_dislike.cache_time)
            return true;
      }
      return false;
   },
   add_to_cache:function(obj_id,val){
      var item={
         value:val,
         ts:Math.round(new Date().getTime())
      };
      vkopt.vk_dislike.cache[obj_id]=item;
   },
   load_dislikes_info:function(){
      var load=function(){
         /* чистим очередь от id, которых нет на странице. Имеет смысл раскомметить, если всегда идёт обработка только реально размещённых элементов страницы
         for (var i=vkopt.vk_dislike.queue.length-1; i>=0;i--){
            if (!ge('dislike_count'+vkopt.vk_dislike.queue[i])){
               var deleted=vkopt.vk_dislike.queue.splice(i,1);
               console.log('deleted',deleted);
            }
         }*/
         var ids=vkopt.vk_dislike.queue.splice(0,vkopt.vk_dislike.ids_per_req);
         if (ids.length == 0) return;
         var need_continue = (vkopt.vk_dislike.queue.length>0); // если очередь не пустая, то после текущей пачки, нужно обработать следущую
         vkopt.vk_dislike.req({likes:ids.join(',')},function(data){
            //for (var i=0; i<ids.length;i++) ge('dislike_icon'+ids[i]).style.boxShadow="0 0 5px 2px #F00";

            for (var obj_id in data){
               vkopt.vk_dislike.add_to_cache(obj_id,data[obj_id]);
               vkopt.vk_dislike.update_dislike_view(obj_id,data[obj_id]);
            }
            if (need_continue){
               //console.log('continue load info',ids,vkopt.vk_dislike.queue);
               setTimeout(function(){load();},vkopt.vk_dislike.delay);
            }
         });
      };
      load();
   },
   update_dislike_view:function(obj_id,value,c){
      //console.log('upd dk view; id: '+obj_id+' val: '+value+' c: '+c);
      var el=ge('dislike_count'+obj_id);
      if (!el){
         //--костыль--// Если всегда обрабатывать только то, что уже выведено на страницу, то он не нужен
         c = c || 0;
         if (c<10) setTimeout(function(){ vkopt.vk_dislike.update_dislike_view(obj_id,value,c+1) },300);
         //-----------
         return false;
      }
      var my = (value<0);
      value = Math.abs(value);
      if (value>0)
         val(ge('dislike_count'+obj_id), value);

      if (obj_id.indexOf('comment') > -1 || obj_id.indexOf('reply') > -1) {
         (my?addClass:removeClass)(ge('post_dislike' + obj_id),'my_dislike');
      }
      else if (obj_id.indexOf('photo') > - 1) {
         (my?addClass:removeClass)(ge('post_dislike' + obj_id),'pv_liked');
      } else {
         (my?addClass:removeClass)(ge('post_dislike' + obj_id),'my_dislike');
      }

      (value>0?removeClass:addClass)(ge('post_dislike' + obj_id),'no_dislikes');
      return true;
   },
   get_dislike_element:function(obj_id,count, my_dislike){
      switch(obj_id){
         case 'video':
            vkopt.log('try to make video dislike');
            return se('\
            <button class="flat_button clear_fix mv_dislike_wrap _like_wrap '+(my_dislike?' '+'my_dislike':'')+'no_dislikes" dislike_id="'+obj_id+'" onclick="vkopt.vk_dislike.dislike(this.getAttribute(\'dislike_id\')); return false;" onmouseover="vkopt.vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
               <div class="mv_dislike_icon _icon" id="dislike_icon'+obj_id+'"></div>\
               <div class="mv_like_label _link" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</div>\
               <div class="mv_like_count _count" id="dislike_count'+obj_id+'">'+(count|| '')+'</div>\
            </button>');
         case 'wiki':
            vkopt.log('try to make wiki dislike');
            return se('\
            <button class="flat_button wk_dislike_wrap _like_wrap clear_fix '+(my_dislike?' '+'my_dislike':'')+'no_dislikes" dislike_id="'+obj_id+'" onclick="vkopt.vk_dislike.dislike(this.getAttribute(\'dislike_id\')); return false;" onmouseover="vkopt.vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
               <div class="wk_dislike_icon _icon" id="dislike_icon'+obj_id+'"></div>\
               <div class="wk_like_label _link" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</div>\
               <div class="wk_like_count _count" id="dislike_count'+obj_id+'">'+(count|| '')+'</div>\
            </button>');
         case 'photo':
            return se('\
            <div class="pv_like _like_wrap '+(my_dislike?' '+'pv_disliked':'')+' no_dislikes" dislike_id="'+obj_id+'" onclick="vkopt.vk_dislike.dislike(this.getAttribute(\'dislike_id\')); return false;" onmouseover="vkopt.vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
               <i class="pv_dislike_icon no_dislikes" id="dislike_icon'+obj_id+'"></i>\
               <span class="pv_like_link" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</span>\
               <span class="pv_like_count fl_l" id="dislike_count'+obj_id+'">'+(count|| '')+'</span>\
            </div>');
         default:
            if (obj_id.indexOf('reply') > -1 || obj_id.indexOf('comment') > -1) {
               return se('\
               <a href="#" class="dislike_wrap _like_wrap '+(my_dislike?' '+'my_dislike':'')+' no_dislikes" dislike_id="'+obj_id+'" onclick="vkopt.vk_dislike.dislike(this.getAttribute(\'dislike_id\')); return false;" onmouseover="vkopt.vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
                  <span class="blind_label" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</span>\
                  <i class="dislike_icon _icon" id="dislike_icon'+obj_id+'"></i>\
                  <span class="like_count _count" id="dislike_count'+obj_id+'">'+(count|| '')+'</span>\
               </a>');
            }
            return se('\
            <a href="#" dislike_id="'+obj_id+'" class="like_btn post_dislike '+(my_dislike?' '+'pv_disliked':'')+' no_dislikes" onclick="vkopt.vk_dislike.dislike(this.getAttribute(\'dislike_id\')); return false;" onmouseover="vkopt.vk_dislike.dislike_over(this.getAttribute(\'dislike_id\'));" id="post_dislike'+obj_id+'">\
               <i class="post_dislike_icon" id="dislike_icon'+obj_id+'"></i>\
               <span class="post_like_link" id="dislike_link'+obj_id+'">'+IDL('dislike')+'</span>\
               <span class="post_like_count fl_l" id="dislike_count'+obj_id+'">'+(count|| '')+'</span>\
            </a>');
      }
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
   obj_ids:[],
   add: function(el,insert_type){
      var attrs=['onclick','onmouseover','onmouseout'];
      var types=vkopt.vk_dislike.types;

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
           vkopt.vk_dislike.get_dislikes([dislike_id]);
         },400)
      } else {
         //obj_id=(geByTag('i',el)[0] || {}).id;
         obj_id = el.outerHTML.split('(this, \'')[1].split('\'')[0];
         if (!obj_id) return;
         //obj_id=obj_id.split('like_icon')[1];
         vkopt.vk_dislike.obj_ids.push(obj_id);
      }

      //console.log(obj_id);

      var dislike=vkopt.vk_dislike.get_dislike_element(obj_id);
      switch(insert_type){
         case 'before':
            el.parentNode.insertBefore(dislike,el);
            break;
         case 'append':
            el.appendChild(dislike);
            break;
         case 'wiki':
         case 'video':
            insertAfter(dislike,el);
            break;
         case 'photo':
            el.parentNode.insertBefore(dislike,el);
            break;
         default:
            insertAfter(dislike,el);
      }


   },
   processNode:function(node){
      if (!vkopt.vk_dislike.is_enabled()) return;
      node = node || geByTag('body')[0];

      var els=geByClass('post_like',node);
      for (var i=0; i<els.length;i++){
         vkopt.vk_dislike.add(els[i]);
      }
      /*
      els=geByClass('like_wrap',node);
      for (var i=0; i<els.length;i++){
         vkopt.vk_dislike.add(els[i]);
      }*/

      els=geByClass('like_btns',node);
      for (var i=0; i<els.length;i++){
         vkopt.vk_dislike.add(geByClass1('like',els[i]));
      }

      els=geByClass('fw_like_wrap',node);
      for (var i=0; i<els.length;i++){
         vkopt.vk_dislike.add(els[i],'before');
      }

      els=geByClass('wl_post_like_wrap',node);
      for (var i=0; i<els.length;i++){
         vkopt.vk_dislike.add(els[i],'wiki');
      }


      //var els=document.evaluate('//div[@id="pv_like_wrap"]', node || document, null, 7, null);// костыль, а не getElementById...
      //console.log(els,els.length);
      //if ()

      //*
     // for (var i=0; i<els.length;i++){
       //  alert(els[i]);
      if (ge('pv_like'))
         vkopt.vk_dislike.add(ge('pv_like'),'photo');
      if (node.innerHTML.indexOf('mv_like_wrap')>-1 && ge('mv_like_wrap'))
         vkopt.vk_dislike.add(ge('mv_like_wrap'),'video');
      if (node.innerHTML.indexOf('wk_like_wrap')>-1 && ge('wk_like_wrap'))
         vkopt.vk_dislike.add(ge('wk_like_wrap'),'wiki');

      /*if (node.innerHTML.indexOf('mv_like_count')>-1 && ge('mv_like_count'))
         vkopt.vk_dislike.add(ge('mv_like_count').parentNode.parentNode,'video');*/

      if (vkopt.vk_dislike.obj_ids.length>0)
         vkopt.vk_dislike.get_dislikes(vkopt.vk_dislike.obj_ids);
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
      var post = ge('post_dislike' + obj_id);
      var icon = ge('dislike_icon' + obj_id);
      var count = parseInt(trim(ge('dislike_count' + obj_id).innerHTML) || 0);

      //console.log(obj_id);

      if (obj_id.indexOf('reply') >- 1 || obj_id.indexOf('comment') >- 1) {
         var my = hasClass(post,'my_dislike');
         (my?removeClass:addClass)(post,'my_dislike');
      }
      else if (obj_id.indexOf('photo') >- 1) {
         var my = hasClass(post,'pv_liked');
         (my?removeClass:addClass)(post,'pv_liked');
      } else {
         var my = hasClass(post,'my_dislike');
         (my?removeClass:addClass)(post,'my_dislike');
      }

      // Request moved to function dislike_over
      //vkopt.vk_dislike.req({object_id:obj_id, act:(my?'undislike':'dislike')},function(t){});

      var new_count=count + ( my ? -1 : 1);
      animateCount(ge('dislike_count'+obj_id), new_count);

      (new_count>0?removeClass:addClass)(post,'no_dislikes');

      setTimeout(function(){
         vkopt.vk_dislike.dislike_over(obj_id,parent_post,my?'undislike':'dislike');
      },400);

   },
   dislike_over:function(post,parent,act){
      var icon = ge('dislike_icon' + post),
         count = ge('dislike_count' + post);
      var item_tpl='<a class="like_tt_owner" title="%NAME%" href="/id%UID%"><img class="like_tt_image" src="%AVA%" width="30" height="30" /></a>';

      var cnt=parseInt(count.innerHTML) || 0;
      var html = vkopt.vk_dislike.tpls['tip'].replace(/%OBJ_ID%/g,post)
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
         vkopt.vk_dislike.req(params,function(info){
            if (act){
               var m=(act=='dislike')?-1:1;
               vkopt.vk_dislike.add_to_cache(post,info.count*m);
            }
            animateCount(count, info.count);// UPDATE COUNTER
            vkopt.vk_dislike.users_info(info.users,function(users){
               data={users:users,count:info.count};
               view_info(data);
            })
         })
      };
      var view_info=function(info){
         if (!tip_ready) tip_ready=!!ge('dislike_table_'+post);
         if (!info || !tip_ready) return;
         removeClass('dislike_utable_'+post, 'disliked_users_loading');
         var html='';
         var users=info.users || [];
         for (var i=0; i<users.length;i++){
            html+=item_tpl.replace(/%NAME%/g,users[i].first_name+' '+users[i].last_name)
                          .replace(/%UID%/g,users[i].uid)
                          .replace(/%AVA%/g,users[i].photo_100);
         }
         val(ge('dislike_table_'+post), html);
         val(ge('dislike_title_'+post), langNumeric(info.count,IDL('users_dislike')));
         vkopt_core.plugins.process_node(ge('dislike_table_'+post));
      };
      if (cnt>0 || act){
         if (!tip_ready || act) load_info();
         vkopt.vk_dislike.tip(post,html,function(){
            tip_ready=true;
            view_info(data);
            var tip=icon.parentNode.tt;
            if (!tip.inited) {
                tip.onClean = function() {
                  tip.inited = false;
                  if (tip.over) removeEvent(tip.container, 'mouseover', tip.over);
                  if (tip.out) removeEvent(tip.container, 'mouseout', tip.out);
                };
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
         wrap = icon.parentNode;
         linkW = link.clientWidth || link.offsetWidth,
         //leftShift = (link.parentNode == icon.parentNode ? 0 : linkW),
         pointerShift = false,
         ttW = 230,
         x = getXY(icon.parentNode)[0];

      if (x + ttW + 20 > lastWindowWidth) {
         //leftShift = ttW - (icon.parentNode.clientWidth || icon.parentNode.offsetWidth) + 7;
         pointerShift = ttW - (count.clientWidth || count.offsetWidth) - 14;
      } else {
         //leftShift = (link.parentNode == icon.parentNode ? 0 : linkW);
         pointerShift = linkW + 8;
      }

      var tt_offset = 41,
         wrap_left = getXY(wrap)[0],
         icon_left = getXY(icon)[0],
         icon_width = getSize(icon, true)[0],
         leftShift = icon_left + icon_width / 2 - wrap_left - tt_offset;

      showTooltip(icon.parentNode, {
         slide: 15,
         shift: [-leftShift, 7, 7],
         ajaxdt: 100,
         showdt: 400,
         hidedt: 200,
         dir: 'auto',
         checkLeft: true,
         reverseOffset: 80,
         noZIndex: true,
         content:content,
         tip: {
            over: function() {
               vkopt.vk_dislike.dislike_over(post);
            }
         },
         typeClass: 'like_tt',
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
      var box=showFastBox({title:IDL('who_dislike'),width:'478px',progress:'progress'+post,hideButtons:true},'<div id="dislike_list'+post+'" class="dislike_list"></div>');
      box.setOptions({bodyStyle: 'padding: 0px;', width: 638});
      addClass(ge('dislike_list'+post),'disliked_users_big_loader');
      stManager.add('boxes.css');
      vkopt.vk_dislike.show_dislikes_page(post,0,box);
   },
   show_dislikes_page:function(post,offset){
      var PER_PAGE=15;
      var IN_ROW=5;

      var params={object:post, limit:PER_PAGE, offset:offset};

      stManager.add('page_help.css');

      var item_tpl='\
         <div class="fans_fan_row inl_bl" id="fans_fan_row%UID%" data-id="%UID%">\
            <div class="fans_fanph_wrap ui_zoom_wrap" onmouseover="uiPhotoZoom.over(this, %UID%, {showOpts: {queue: 1}});">\
               <a class="ui_zoom_outer ui_zoom_added" href="/albums211858250" aria-label="Увеличить" wotsearchprocessed="true">\
                  <div class="ui_zoom_inner"><div class="ui_zoom"><div class="ui_zoom_icon"></div></div></div>\
               </a>\
               <a class="fans_fan_ph " href="/id%UID%" wotsearchprocessed="true">\
                  <img class="fans_fan_img" src="%AVA%" alt="%NAME%">\
               </a>\
            </div>\
            <div class="fans_fan_name">\
               <a class="fans_fan_lnk" href="/id%UID%" wotsearchprocessed="true">%NAME%</a>\
            </div>\
         </div>\
      ';

      var cont_tpl='\
         <div style="padding: 7px 5px 5px;">\
           <div class="fl_r" style="padding:0 5px;width:200px;">%PAGE_LIST%</div>\
           <div id="user_dislike_list_content">%USERS%</div>\
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
      };

      var data=null;
      var load_info = function(){ // Get Who Liked
         show('progress'+post);
         vkopt.vk_dislike.req(params,function(info){
            vkopt.vk_dislike.users_info(info.users,function(users){
               data={users:users,count:info.count};
               view_info(data);
            })
         })
      };
      var view_info=function(info){
         removeClass(ge('dislike_list'+post),'disliked_users_big_loader');
         hide('progress'+post);
         var html='';
         var users=info.users;
         for (var i=0; i<users.length;i++){
            html+=item_tpl.replace(/%NAME%/g,users[i].first_name)
                          .replace(/%UID%/g,users[i].uid)
                          .replace(/%AVA%/g,users[i].photo_100);
            html+=((i+1)%IN_ROW==0)?'</tr><tr>':'';
         }
         html='<tr>'+html+'</tr>';

         var pg='';
         if (info.count>PER_PAGE){
            pg=page_list(Math.ceil(offset/PER_PAGE),Math.ceil(info.count/PER_PAGE)-1,'#',"return vkopt.vk_dislike.show_dislikes_page('"+post+"',%%)",PER_PAGE);
         }

         html=cont_tpl.replace(/%PAGE_LIST%/g,pg)
                      .replace(/%TITLE%/g,langNumeric(info.count,IDL('users_dislike')))
                      .replace(/%USERS%/g,html);
         val(ge('dislike_list'+post), html);
         //попробуем поменять тайтл основного бокса
         geByClass1('box_title',ge('dislike_list'+post).parentNode.parentNode).innerText
            = langNumeric(info.count,IDL('users_dislike'));
         vkopt_core.plugins.process_node(ge('dislike_list'+post));
      };
      load_info();
      return false;
   },
   dislikes_icons:function(){
      var dsl = vkopt.vk_dislike;
      var html = '';
      for (var i = 0; i < dsl.icons.length; i++){
         html += '<a class="post_dislike_icon dislike_icon_preview dislike_icon'+i+'_preview" onclick="return vkopt.vk_dislike.dislikes_icons_set('+i+',this);"></a>';
      }
      html='\
      <div class="dislikes_icons">'
         + html +
      '</div>';

      /*var icon_index = parseInt(vkopt.settings.get('dislike_icon_index'));
      if (!icon_index && (icon_index < 0 || icon_index > 3))
            icon_index=vkopt.vk_dislike.icon_index;*/
      html = html.replace(/%cur/g, vkopt.vk_dislike.icon_index);
      return html;
   },
   dislikes_icons_set:function(idx,el){
      vkopt.settings.set('dislike_icon_index',idx);
      if (el){
         for (var i = 0; i < vkopt.vk_dislike.icons.length; i++){
            (i == idx? addClass : removeClass)(geByTag1('html'), 'dislike_icon'+i);
         }
      }
      return false;
   },
   css:function(){
      var code = vk_lib.get_block_comments(function(){
         /*icon_css_tpl:
         .dislike_icon{vals.idx} .dislike_icon,
         .dislike_icon{vals.idx} .pv_dislike_icon,
         .dislike_icon{vals.idx} .mv_dislike_icon,
         .dislike_icon{vals.idx} .wk_dislike_icon,
         .dislike_icon{vals.idx} .post_dislike_icon,
         .dislikes_icons .dislike_icon_preview.dislike_icon{vals.idx}_preview{
            background:url('{vals.url}') no-repeat 0 0;
            background-size: contain;
         }
         .dislike_icon{vals.idx} .dislike_icon_preview.dislike_icon{vals.idx}_preview{
            opacity: 1;
         }
         */
         /*css:
         .dislike_wrap, .dislike_wrap:hover{
            text-decoration:none;
         }
         .dislike_icon{
            background-size: contain;
         }
         .dislike_icon_preview{
            opacity: 0.5;
            margin-right: 10px;
         }

         .dislikes_icons{padding:1px;}
         .dislikes_icons a{float:left;opacity:0.5;}
         .dislikes_icons a:hover{opacity:1;}
         .post_dislike_icon{
            display: inline-block;
            float: left;
            width: 17px;
            height: 14px;
            margin-top: 1px;
            opacity: 0.35;
         }

         .antilike, #al_adv_side{display:none !important}
         .disliked_users_loading{background: url(/images/upload_inv_mono.gif) no-repeat 50% 50%;}
         .disliked_users_big_loader{background-image: url(/images/progress7.gif); background-repeat:no-repeat; background-position:50% 50%;}
         .dislike_list{height:100%}

         .post_dislike_icon,.post_dislike_count,.post_dislike_link{
           -webkit-transition: opacity 200ms linear;
           -moz-transition: opacity 200ms linear;
           -o-transition: opacity 200ms linear;
           transition: opacity 200ms linear;
         }

         .post_dislike {
            cursor:pointer;
            color:#2a5885;
            white-space:nowrap;
            overflow:hidden;
            margin-right:8px;
            padding:5px 6px 6px;
            border-radius:3px
         }
         .post_dislike:hover {
            color:#315b8c
         }
         .wall_module .post_dislike:hover {
            background-color:#f5f7fa
         }
         .wall_module .post_dislike_link {
            font-weight:500;
            -webkit-font-smoothing:subpixel-antialiased;
            -moz-osx-font-smoothing:auto;
            margin-left:7px;
            float:left
         }

         .vk_dislikes_enabled .wall_module .post_like_count .counter_anim_wrap,
         .wall_module .post_dislike_count,
         .wall_module .post_dislike_link {
            line-height:15px;
            height:14px
         }
         .wall_module .post_dislike_count {
            margin-left:6px;
            float:left;
            font-weight:500;
            -webkit-font-smoothing:subpixel-antialiased;
            -moz-osx-font-smoothing:auto
         }
         .wall_module .post_dislike_link:empty+.post_dislike_count {
            margin-left:0
         }
         .wall_module .post_dislike:hover .post_dislike_icon {
            opacity:0.5;
            filter:alpha(opacity=50)
         }
         .wall_module .my_dislike .post_dislike_icon {
            opacity:1!important;
            -webkit-filter:none!important;
            filter:none!important
         }
         .post_full_like_wrap .post_dislike {
            float:left
         }
         .post_full_like_wrap .post_dislike:first-child {
            margin-left:-6px
         }
         .wall_module .no_dislikes .dislike_count {
            margin:0
         }
         .wall_module .dislike_icon {
            width:12px;
            height:10px;
            float: left;
            margin:1px 0 0;
            opacity:0.4;
            filter:alpha(opacity=40);
            -o-transition:opacity 100ms ease;
            transition:opacity 100ms ease
         }
         .wall_module .reply .no_dislikes .dislike_icon {
            -o-transition:visibility 100ms ease,opacity 100ms ease;
            transition:visibility 100ms ease,opacity 100ms ease
         }
         .wall_module .reply .no_dislikes .dislike_icon {
            opacity:0.35;
            filter:alpha(opacity=35)
         }
         .wall_module .dislike_wrap:hover .dislike_icon {
            opacity:0.5;
            filter:alpha(opacity=50)
         }
         .wall_module .dislike_wrap.my_dislike .dislike_icon {
            opacity:1;
            -webkit-filter:none;
            filter:none
         }
         .wall_module .no_dislikes .post_dislike_count {
            display:none
         }
         .wall_module .reply .dislike_wrap {
            float:right;
            padding:10px;
            padding-right: 0px;
            margin:-10px 0px;
            margin-right: 0;
         }
         .wall_module .dislike_wrap {
            font-size:12.5px;
            color:#4a7099;
            cursor:pointer
         }
         .wall_module .dislike_link {
            margin:0 4px 0 0
         }

         .like_btns .post_dislike .post_like_link{display:none}
         .post_dislike.no_dislikes .post_like_count{
            margin-left: 0!important;
         }
         .like_btns .post_dislike{
            margin-right: 0px;
         }
         .like_btns .post_dislike .post_dislike_icon {
            width: 24px;
            height: 20px;
         }

         .pv_dislike_icon {
            display: inline-block;
            width: 16px;
            height: 13px;
            margin: 2px 0 1px;
            float: left;
            opacity: 0.4;
            filter: alpha(opacity=40);
         }
         .pv_liked .pv_dislike_icon {
            opacity: 1;
            -webkit-filter: none;
            filter: none;
         }
         .mv_dislike_wrap {
            margin-left: 5px;
            float: left;
         }
         .mv_dislike_icon {
            float: left;
            height: 10px;
            width: 13px;
            margin: 3px 8px 0 3px;
            opacity: 0.4;
            filter: alpha(opacity=40);
            -o-transition: opacity 0.2s ease;
            transition: opacity 0.2s ease;
         }
         .mv_dislike_wrap:hover .mv_dislike_icon,
         .mv_dislike_wrap.my_dislike .mv_dislike_icon {
            opacity: 1;
            -webkit-filter: none;
            filter: none;
         }
         .wk_dislike_wrap {
            float: left;
            margin-right: 10px;
         }
         .wk_dislike_icon {
            float: left;
            width: 13px;
            height: 10px;
            margin: 3px 8px 0 3px;
            opacity: 0.4;
            filter: alpha(opacity=40);
            -o-transition: opacity 0.2s ease;
            transition: opacity 0.2s ease;
         }
         .wk_dislike_wrap:hover .wk_dislike_icon,
         .wk_dislike_wrap.my_dislike .wk_dislike_icon {
            opacity: 1;
            -webkit-filter: none;
            filter: none;
         }
         */
      });
      var dsl = vkopt.vk_dislike;
      // 0 - striked, 1 - striked empty, 2 - broken, 3 - crossed, 4 - skull, 5 - thumb
      dsl.icons = vk_lib.toDataURI('image/svg+xml', dsl.icons_svg);
      var icons_css = '';
      for (var i = 0; i < dsl.icons.length; i++){
         icons_css += vk_lib.tpl_process(code['icon_css_tpl'],{
            idx: i,
            url: dsl.icons[i]
         })
      }

      return icons_css + code.css;
   }
}

vkopt['attachments_and_link'] = {
    module_id: 'attachments_and_link',
    dialogsFilter: 7, // показываем все, 1 -линки 2 - форварды 4 записи со стен.
    COUNT_ROW: 8,
    cursor: 0,
    _timer: null,
    _content: null,
    _uid: null,
    /* первое выполнение сразу, последующее с указанной задержкой*/
    onInit: function () {
        var self = vkopt[this.plugin_id];

        //инициализируем шаблон
        self.template = self.template();
        ['addBottom', 'clickMenu', 'getAttach', 'getHistoryAttr', 'tplProcess', 'pasteHTML', 'processResponse',
            'callEvent', 'normalazeMessage'].reduce(function (func, value) {
                func[value] = func[value].bind(func);
                return func;
            },
            self);


        self.getAttach = self.debounce(self.getAttach); // тормозим функцию

        self.eventHandlers();// регистрируем обработчики событий

    },
    onRequestQuery: function (url, query, options) {
        if (url == 'wkview.php') {
            var self = vkopt[this.plugin_id];
            setTimeout(self.addBottom);
        }
    },
    eventHandlers: function () {
        var self = this,
            fragment = [],
            objmess = [],
            inStock = 0;


        window.addEventListener('vkopt_attachments_and_link', function (event) {
            var dataItem = event.detail, strongId = self.local.strongIdMessages;
            switch (dataItem.name) {
                case 'getAttach': // вызов по клику на кнопке меню
                    if (dataItem.status == 'ok' || dataItem.status == 'scrolling') { //история уже в хранилище , получаем сообщения по ид
                        self.getById(self.cursor);
                        break;
                    } else if (dataItem.status == 'start') {
                        self.getHistoryAttr(self.local.lastid == 0 ? dataItem.item.rangeStart : self.local.lastid, 0, strongId); //
                    }
                    else if (dataItem.status == 'segment') { //первый вызов для этого диалога либо между вызовами появились новые сообщения в истории
                        self.getHistoryAttr(dataItem.item.rangeStart, dataItem.item.rangeEnd);
                        // debugger;
                    }
                    self.local.firstid = dataItem.item.rangeStart; // обновляем первое сообщение (будет помещено в localStorage)
                    break;
                case 'getHistoryAttr': //результат поиска по истории
                    inStock += dataItem.item.data.length;
                    if (dataItem.status == 'ok') {
                        self.local.lastid = dataItem.item.last;
                        //Array.prototype.push.apply(strongId, dataItem.item.IdMassage); // пердаем getHistoryAttrstrongIdMessages в getHistoryAttr параметрах при вызовах


                    } else if (dataItem.status == 'segment') {
                        if (dataItem.item.fullsegment) { // был просканирован весь сегмент
                            Array.prototype.unshift.apply(strongId, dataItem.item.IdMassage);

                        } else { // была просканирована часть сегмента необходимо продолжить
                            setTimeout(function () {
                                self.getHistoryAttr(dataItem.item.last, self.local.lastid, dataItem.item.IdMassage, dataItem.item.data)
                            }, 20); //передаем возвращенные массивы, функция корретно допишит в них данные
                            break;
                        }

                    }

                    Array.prototype.push.apply(objmess, dataItem.item.data);
                    if (objmess.length < self.COUNT_ROW && self.local.lastid != 'eof') {
                        setTimeout(function () {
                            self.getHistoryAttr(dataItem.status == 'segment' ? self.local.lastid : dataItem.item.last, 0, strongId, objmess); //в случае если это сегмент dataItem.item.last будет конец сегмента
                        });
                        break;
                    }


                    self.normalazeMessage(objmess);
                    objmess = [];

                    self.setlocalStorage(self._uid); // сохраняем прогресс
                    break;
                case 'getById':
                    if (dataItem.status == 'ok') {
                        Array.prototype.push.apply(objmess, dataItem.item.data);
                        inStock = dataItem.item.sCursor - self.cursor; //доступно для вывода
                        if (inStock < self.COUNT_ROW && self.local.lastid != 'eof') {
                            setTimeout(function () {
                                self.getById(dataItem.item.sCursor);
                            });
                            break;
                        } else if (objmess.length) {
                            self.normalazeMessage(objmess);
                        }
                    }
                    else if (dataItem.status == 'overlimit') {
                        setTimeout(function () {
                            self.getHistoryAttr(self.local.lastid, 0, strongId, objmess);
                        });
                        break;
                    }
                    ;


                    if (objmess.length) {
                        objmess = [];
                        break;
                    }
                case 'normalazeMessage':
                    var count = Math.min(strongId.length, inStock + self.cursor), fragment = [];

                    for (; self.cursor < count && fragment.length < self.COUNT_ROW; self.cursor++) {
                        var mess = strongId[self.cursor];
                        if (!(mess.type & self.dialogsFilter)) {
                            continue;
                        }
                        ;
                        if (!self.itemMessage[mess.id]) {
                            console.log('сообщение не найдено в itemMessage по id. ' + mess.id);
                            continue;
                        }

                        fragment.push(self.itemMessage[mess.id]);

                    }
                    self.loader();
                    self.processResponse(fragment);
                    // fragment = [];
                    self.state = null;
                    inStock = 0;

                    break;

            }
        });


        document.addEventListener('scroll', function (e) {
            if (!self._content) return;
            if (!(e.currentTarget.location && e.currentTarget.location.search.match(/_document$/))) return;
            if (self.cursor == self.local.strongIdMessages.length - 1 && self.local.lastid == 'eof') return; //достигли конца ленты
            var coords = self._content.getBoundingClientRect();

            if (coords.height - document.documentElement.clientHeight + coords.top < 0) {
                self.getAttach(true);
            }
        }, true);

    },
    css: function () {
        return vk_lib.get_block_comments(function () {
            /*css:
             .no_link{
             pointer-events: none;

             }
             .media_position {
             display : inline-block;
             float: left;
             margin : 1px;
             vertical-align : top;
             line-height : normal;
             width: auto;
             height: 150px;
             }
             .history_im_fwd {
             margin-left: 14%;
             border-left: 2px solid #dee6ee;
             }
             .history_im_media_fwd {
             margin-left: -15%
             }
             .history_message {
             border-bottom: 1px dotted #ecf1f5;
             padding-bottom: 10px;
             }
             #history_list {
             position:absolute;
             left: 100%;
             margin-left: 0;
             padding-left: 0;
             background-color: #ffffff;
             z-index: 900;
             border: 2px solid #f7f7f7;
             border-left: 1px solid rgba(0,0,0,.1);
             width: 30%;
             }
             #history_list  li {
             list-style-type: none;
             }
             */
        }).css;
    },
    loader: (function () {
        var displayed;
        return function () {
            if (vk_DEBUG) return; //не показывать окно при включенной отладке
            if (displayed) {
                hide(boxLoader);
                hide(boxLayerWrap);
                displayed = null;
            } else {
                show(boxLoader);
                show(boxLayerWrap);
                displayed = true;
            }
        }
    })(),
    tplProcess: function tplProcess(template, options) { //применяет к шаблону весь массив аргументов
        if (isObject(options)) {
            template = vk_lib.tpl_process(template, options);
        } else {
            for (var i = 0; i < options.length; i++) {
                if (isArray(options[i])) {
                    options[i].unshift(template);
                    template = tplProcess.apply(this, options[i]);
                    continue;
                }
                template = vk_lib.tpl_process(template, options[i]);
            }
        }
        return template;
    },
    addBottom: function () {
        var tabsBox = geByClass1('ui_tabs_box', null, '#wk_history_wrap ');// ищем нужный див
        if (tabsBox && !tabsBox.querySelector('.my_link_repost')) {
            this._timer = null;
            tabsBox.lastElementChild.insertAdjacentHTML('afterEnd', vk_lib.tpl_process(this.template.menu_button, {
                module_id: this.module_id
            }));

        } else   this._timer = setTimeout(this.addBottom, 20); // похоже страница не прогрузилась, ждем еще

    },
    clickMenu: function (uid) {
        var content = ge('wk_history_rows'), menu = document.querySelector('#wk_history_wrap  .my_link_repost');
        this._content = content;
        if (menu.classList.contains('ui_tab_sel')) return; // повторный клик
        document.querySelectorAll('#wk_history_wrap  .ui_tab_sel').forEach(function (value) {
            value.classList.remove('ui_tab_sel');
        });
        menu.classList.toggle('ui_tab_sel');
        ge('wk_history_more_link').remove(); //удаляем скролл
        content.innerHTML = '';//'<span style="height:'+document.documentElement.clientHeight+'px"></span>';

        document.querySelector('#wk_history_wrap > div.wk_history_tabs.tb_tabs_wrap').insertAdjacentHTML('afterEnd', this.tplProcess(this.template.menu_right, {
            module_id: this.module_id
        }));

        // this.state = 0;
        if (uid != this._uid || !this.itemMessage) this.itemMessage = {};
        this._uid = uid;
        this.cursor = 0;
        this.start=true;
        this.dialogsFilter = 7;
        nav.objLoc.w = 'history' + nav.objLoc.sel + '_document';
        wkcur.wkRaw = nav.objLoc.w;
        nav.setLoc(nav.objLoc);
        //history.pushState(null, null, location.search.replace(/(=history.*_)(.*$)/, '$1document'));

        this.getlocalStorage(uid);
        this.getAttach();

    },
    clickList: function (el) {
        var target = event.target.closest('.ui_rmenu_item');
        event.currentTarget.querySelector('.ui_rmenu_item_sel').classList.remove('ui_rmenu_item_sel');
        target.classList.add('ui_rmenu_item_sel');
        this.cursor = 0;
        this._content.innerHTML = '';
        this.dialogsFilter = +target.dataset.type;
        this.getAttach();


        //slideToggle('vk_album_full_info'); //показывает скрывает меню
    },
    pasteHTML: function pasteHTML(node, options, position) {
        var lastdiv;
        var qlast = function (select) {
            return (node = node.querySelectorAll(select)) && node[node.length - 1] || node;
        };

        switch (position) {
            case 'begin':
                node.classList.add('history_message');
                node.insertAdjacentHTML('beforeEnd', this.tplProcess(this.template.content_row, options));
                pasteHTML.lastdiv = node;
                pasteHTML.typePaste = {};
                break;

            case 'repost':
            case 'forward':
                var div = document.createElement('div');
                options[0].no_link = options[0].location ? '' : 'no_link';
                if (position == 'forward' && (lastdiv = pasteHTML.lastdiv.querySelector('[data-deep="' + (options[0].depth || 0) + '"]:last-child'))) {
                    node = lastdiv.children[0];
                    div.insertAdjacentHTML('beforeEnd', this.template.content_repost_deep);
                } else {
                    node = qlast('[name=content_repost]');

                div.insertAdjacentHTML('beforeEnd', this.template.content_repost);
                    div.querySelector('[data-deep]').setAttribute('data-deep', options[0].depth || 0);
                }

                geByClass1('im-mess-stack_fwd', div).insertAdjacentHTML('afterEnd', this.tplProcess(this.template.content_row, options));
                node.appendChild(div);
                node = div;
                if (options[0].nocontent) break;
            case 'content':
                node.querySelector('[name=content]').insertAdjacentHTML('beforeEnd',
                    this.tplProcess(this.template.content_message, options));
                break;
            case 'repost_link':
            case 'repost_link_no_photo':
                    node.querySelector('[name=content_repost]').insertAdjacentHTML('beforeEnd',
                        this.tplProcess(position == 'repost_link' ? this.template.content_link : this.template.content_link_no_photo, options));
                break;
            case 'photo':
            case 'gif':
            case 'doc':
            case 'audio':
            case 'poll':
            case 'video':
            case 'page':
                div = pasteHTML.typePaste[position] || ( pasteHTML.typePaste[position] = document.createElement('div') ) && position == 'photo' ? (pasteHTML.typePaste[position].setAttribute('style', 'display: inline-block;'), pasteHTML.typePaste[position]) : pasteHTML.typePaste[position];
                div.insertAdjacentHTML('beforeEnd', this.tplProcess(this.template[position], options));
                qlast('[name=content_repost]').appendChild(div);
                break;
            case 'poll_answers':
                div = document.createElement('div');
                div.insertAdjacentHTML('afterBegin', this.tplProcess(this.template.poll_answers, options));
                qlast('.page_poll_stats').appendChild(div);
                break;
            case 'json':
                div = document.createElement('div');
                div.textContent = options[0];
                qlast('[name=content_repost]').appendChild(div);
                node = div;
                break;


        }
        return node;
    },

    debounce: function (f) {
        //var start_form = 0;
        this.state = null;

        return function () {
            if (this.state) return;

            this.state = 1;
            this.loader();
            f.apply(this, arguments);
        }

    },
    TimeStamp: function (timeStamp) {
        return new Date(timeStamp * 1000).toLocaleString();
    },
    geId: function (arr, id) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].id == id) return arr[i];
        }
    },
    callEvent: function (name, item, status) {
        status = status || 'ok';
        window.dispatchEvent(new CustomEvent("vkopt_attachments_and_link", {
            bubbles: true,
            detail: {
                name: name,
                item: item || [],
                status: status
            }
        }));
    },

    errorProcessing: function (r) {
        if (!r.response) {// ошибка
            this.loader();
            new Error(r.error.error_msg);
        }
    },
    getlocalStorage: function (uid) {
        this.local = JSON.parse(localStorage.getItem('vkopt_' + this.module_id + '_' + uid) || '{}');
        this.local.strongIdMessages = this.local.strongIdMessages || [];
        this.local.firstid = this.local.firstid || 0;
        this.local.lastid = this.local.lastid || 0;

    },
    setlocalStorage: function (uid) {
        localStorage.setItem('vkopt_' + this.module_id + '_' + uid, JSON.stringify({
            strongIdMessages: this.local.strongIdMessages,
            firstid: this.local.firstid,
            lastid: this.local.lastid
        }));
    },
    clearSetLocal: function (uid) {
        localStorage.clear('vkopt_' + this.module_id + '_' + uid);
    },


    processResponse: function (items) {
        var self = this, uid = self._uid, content = self._content;
        var content_row = self.template.content_row, content_message = self.template.content_message, content_repost = self.template.content_repost;
        var fragment = document.createDocumentFragment();
        var getName = function (item) {
            return item.first_name && item.first_name + ' ' + item.last_name;
        };
        var getLocation = function (item, type) {
            type = type || 'fwd';
            if (type == 'wall') {
                return item.id ? 'wall-' + item.sender.id + '_' + item.id : '';
            } else {
                return item.id ? 'im?msgid=' + item.id + '&sel=' + uid : '';
            }

        };
        var parseHash = function (url) {
            return /hash=(.+?)\&/.exec(url)[1];
        };
        var linkIt = function (text) {
            text = text.replace(/(^|[\n ])([\w]*?)((ht|f)tp(s)?:\/\/[\w]+[^ \,\"\n\r\t<]*)/ig, '$1$2<a href=\"$3\" target="_blank">$3</a>');

            text = text.replace(/(^|[\n ])([\w]*?)((www|ftp)\.[^ \,\"\t\n\r<]*)/ig, '$1$2<a href=\"http://$3\" target="_blank">$3</a>');

            text = text.replace(/(^|[\n ])([a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/i, '$1<a href=\"mailto:$2@$3\">$2@$3</a>');

            text = text.replace(/\[((?:club|id)\d+)\|(.+?)]/ig, '<a href="\$1" target="_blank">$2</a>');


            return (text);
        };
        items.forEach(function (item) {
            var attNames = ['fwd_messages', 'attachments'];

            var el = self.pasteHTML(document.createElement('div'), [{
                name: getName(item.user),
                time: self.TimeStamp(item.date),
                location: getLocation(item)
            }, item.user], 'begin');
            fragment.appendChild(el);
            // content.appendChild(el);

            self.pasteHTML(el, [{text_content: linkIt(item.body), time: self.TimeStamp(item.date)}], 'content');


            attNames.forEach(function (attName) {
                if (!item[attName]) return;
                item[attName].forEach(function (att) {

                    repost(att[att.type] || att, att.type || 'fwd', 0, att.id);
                    function repost(att, type, depth, parentid) {
                        depth = depth || 0;
                        if (att.id == 0) return; // нет доступа, удалено.
                        /* репост */
                        if (type == 'wall' || type == 'fwd') {
                            self.pasteHTML(el, [{
                                text_content: linkIt(att.body || att.text || ''),
                                time: self.TimeStamp(att.date),
                                name: getName(att.sender),
                                location: getLocation(att, type),
                                domain: att.sender.screen_name || att.sender.domain,
                                depth: depth
                            }, att.sender], type == 'wall' ? 'repost' : 'forward');
                            if (att.fwd_messages) att.fwd_messages.forEach(function (wall) {
                                repost(wall, 'fwd', depth + 1);
                            });
                            if (att.copy_history) att.copy_history.forEach(function (wall) {
                                repost(wall.wall || wall[wall.type] || wall, wall.type || 'wall', 0, att.id)
                            });
                            if (att.attachments) att.attachments.forEach(function (wall) {
                                repost(wall.wall || wall[wall.type] || wall, wall.type || 'wall', 0, att.id);
                            });

                        }
                        else if (type == 'photo') {
                            self.pasteHTML(el, [att], 'photo');
                        }
                        else if (type == 'video') {
                            self.pasteHTML(el, [{
                                photo_320: att.photo_320
                            }, att], 'video');
                        }
                        else if (type == 'doc') {
                            if (att.type == 3) {
                            self.pasteHTML(el, [{
                                photo_size_src_o: att.preview.photo.sizes[2].src,
                                url_parse_hash: parseHash(att.url),
                                width: att.preview.photo.sizes[0].width + 100,//att.preview.video.width,
                                height: att.preview.photo.sizes[0].height + 100, //att.preview.video.height
                                dataWidth: att.preview.video.width,
                                dataHeight: att.preview.video.height
                            }, att], 'gif');
                            } else {
                                self.pasteHTML(el, [{
                                    size: Math.round(att.size / 1000)
                                }, att], 'doc');
                            }
                        }
                        else if (type == 'link') {
                            self.pasteHTML(el, [{
                                text_content: '',
                                caption: att.caption || ''
                            }, att, att.photo], att.photo ? 'repost_link' : 'repost_link_no_photo');
                        }
                        else if (type == 'sticker') {
                            self.pasteHTML(el, [{photo_604: att['photo_' + att.width]}], 'photo');
                        }
                        else if (type == 'audio') {
                            self.pasteHTML(el, [{artist_encode: encodeURI(att.artist)}, att], 'audio');
                        }
                        else if (type == 'poll') {
                            self.pasteHTML(el, [{
                                state: att.anonymous ? 'Открытый' : 'Анонимный',
                                postId: att.owner_id + '_' + parentid
                            }, att], 'poll');
                            for (var i = att.answers.length - 1; i >= 0; i--) {
                                self.pasteHTML(el, [att.answers[i]], 'poll_answers');
                            }
                        } else if (type == 'page') {
                            self.pasteHTML(el, [att], 'page');
                        }
                        else {// не ясно что это отправляем в json
                            self.pasteHTML(el, ['\n' + JSON.stringify(att)], 'json');
                        }


                    }
                });
            });
            //  self.cursor++;
        });
        content.appendChild(fragment);
        // self.state = null;
        //self.loader();
        //self.setlocalStorage(uid);


    },
    getAttach: function (scrolling) {
        var self = this;

        if (scrolling) {
            self.callEvent('getAttach', [], 'scrolling');
            return;
        }
        // проверяем был ли диалог с нашего последнего посещения
            dApi.call('messages.getHistory', {
                'user_id': self._uid,
                'count': 1,
                'offset': 0,
                'v': '5.60'
            }, function (r) {
                self.errorProcessing(r);

                var idMax = Math.max(r.response.in_read, r.response.out_read),
                    status = self.local.firstid == 0 ? 'start' : self.local.firstid < idMax ? 'segment' : 'ok';

                self.callEvent('getAttach', {
                    rangeStart: idMax,
                    rangeEnd: self.local.firstid
                }, status);

            });


    },
    getById: function (sCursor) {
        /*Получает сообщения по их адресам, в качестве параметра принимает индес начала
         по завершению вызывает событие со своим именем
         strongIdMessages - адреса сообщений с вложениями
         itemMessage полученные сообщения методом getHistoryAttr или методом getById
         sCursor копия курсора self.cursor
         значение курсора изменяется только при окончательном выводе
         */
        var param = [],
            inStock = 0; // сколько обошли, уже в itemMessage + обработанные этим методом
        var self = this, strongId = self.local.strongIdMessages;
        var count = strongId.length - 1;
        /* если вышли за границу и не eof запускаем поиск по истории*/
        if (count <= sCursor && self.local.lastid != 'eof') { //!
            self.callEvent('getById', self.local.lastid, 'overlimit');
            return;
        }

        for (; sCursor <= count; sCursor++) {
            var id = strongId[sCursor].id, type = strongId[sCursor].type;
            if (!(type & self.dialogsFilter)) continue;
            self.itemMessage[id] || param.push(id + '_' + self._uid);
            inStock++;
            if (param.length >= 100) break;
        }
        if (param.length) {
            dApi.call('messages.getById', {
                'message_ids': param.join(','),
                'v': '5.60'
            }, function (r) {
                self.errorProcessing(r);
                if (r.response.items.length != param.length) console.log('API не вернул одно из сообщений? сообщение удалено?');

                self.callEvent('getById', {
                    data: r.response.items.filter(function (value) {
                    return !value.deleted;
                    }), inStock: inStock,
                    sCursor: sCursor
                });

            });
        } else  self.callEvent('getById', {
            data: [],
            inStock: inStock,
            sCursor: sCursor
        });

    },
    getHistoryAttr: function (first, last, IdMassage, objMess) {
        // перебирает count сообщений  вызывает событие в котором передает  вложения не включая last
        // найденное дописывается в конец IdMassage, objMess
        var self = this;
        if (first == 'eof') {
            self.callEvent('getHistoryAttr', null, 'eof');
            return;
        } // нечего искать
        var self = this;
        objMess = objMess || [];
        IdMassage = IdMassage || [];
        var count = 100;

        var correctType = function (val) {
            var type = 0;
            if (/\w{2,6}?:\/\//ig.test(val.body)) type = type | 1;
            if (val.fwd_messages && val.fwd_messages.length) type = type | 2;

            if (val.attachments) {
                for (var i = 0; i < val.attachments.length; i++) {
                    if (val.attachments[i].type == 'wall') type = type | 4;
                    else if (val.attachments[i].type == 'link') type = type | 1;
            }
            }

            return type;
        };


        var code = {
            'user_id': self._uid,
            'start_message_id': first,
            'count': count,
            'offset': last || self.start ? 0 : 1,
            'v': '5.60'
        };
        dApi.call('messages.getHistory', code, function (r) {
            self.errorProcessing(r);

            for (i = 0; i < r.response.items.length; i++) {
                var value = r.response.items[i], type = 0;
                if (last && value.id <= last) break;
                if (type = correctType(value)) {
                    var idMess = {
                        id: value.id,
                        type: type
                    };

                    IdMassage.push(idMess);

                    if (idMess.type & self.dialogsFilter) objMess.push(value); //сохраняем объект только если хотим его показать, в локальном хранилище (strongIdMessages) данные сохраняются всегда, не зависимо от того, хотим ли мы их показывать.
                }
            }

            var dataHistory = {
                IdMassage: IdMassage,
                first: first,
                last: r.response.items.length < count ? 'eof' : r.response.items[Math.min(i, r.response.items.length - 1)].id,
                data: objMess,
                segment: Boolean(last),
                fullsegment: i != r.response.items.length && i > 0
            };

            self.callEvent('getHistoryAttr', dataHistory, dataHistory.segment ? 'segment' : 'ok');

        });
	self.start=null;
        return self;
    },
    normalazeMessage: function (obj) {
        var self = this;
        var response = {idGroup: [vk.id], senders: []};


        scan(obj);
        getGoupsUsers();

        function fscan(att) {
            if (att.wall || att.link) {
                fscan(att.wall || att.link);
                return;
            } else if (att.fwd_messages) scan(att.fwd_messages); //внутри может быть еще
            if (att.to_id) response.idGroup.push(att.to_id);
            else if (att.from_id) response.idGroup.push(att.from_id);
            if (att.user_id) response.idGroup.push(att.user_id);
            if (att.copy_history) scan(att.copy_history);
            if (att.attachments) scan(att.attachments);
        }

        function scan(arr) {
            Array.isArray(arr) ? arr.forEach(fscan) : fscan(arr);
        }// так как @ в execute не работает должным образом прийдется делать несколько запросов


        function getGoupsUsers() {
            var code = [];
            var param = response.idGroup.filter(function (value) {
                if (value && value < 0) return true;
            }).map(function (value) {
                return -value;
            }).join(',');
            if (param) code.push(' API.groups.getById({group_ids:"' + param + '"})');
            param = response.idGroup.filter(function (value) {
                if (value && value > 0) return true;
            }).join(',');
            if (param) code.push(' API.users.get({user_ids:"' + param + '",fields:"domain,name,photo_50"})'); // могут быть репосты от других пользователей
            if (code.length) {
                dApi.call('execute', {code: 'return ' + code.join('+') + ';', v: '5.60'}, function (b) {
                    self.errorProcessing(b);
                    b.response.forEach(function (value) {
                        /* if (value.type='users'){
                         response.users.push.apply( response.users, value.resp );
                         } else {*/
                        if (!response.senders) response.senders = b.response;
                        else response.senders.push.apply(response.senders, b.response);
                        //  }
                        // });
                    });
                    rearrange();
                });
            } else {
                rearrange();
            }
        }


        function rearrange() {

            function append(value) {
                if (value.attachments) {
                    value.attachments.forEach(function (att) {
                        if (att.type == 'wall') {
                            att.wall.sender = self.geId(response.senders, Math.abs(att.wall.to_id));
                            if (att.wall.attachments || att.wall.copy_history) append(att.wall);
                        }
                    });
                }

                if (value.copy_history) value.copy_history.forEach(function (wall) {
                    wall.sender = self.geId(response.senders, Math.abs(wall.from_id));
                    if (wall.attachments || wall.copy_history) append(wall);
                });

                if (value.fwd_messages) {
                    value.fwd_messages.forEach(function (att) {
                        att.sender = self.geId(response.senders, Math.abs(att.user_id));
                        append(att);
                    });

                }
            }

            obj.forEach(function (value) {
                value.user = self.geId(response.senders, value.out ? vk.id : value.user_id);
                append(value);
                self.itemMessage[value.id] = value;
            });

            self.callEvent('normalazeMessage', self.itemMessage);


        }
    },

    template: function () {
        return vk_lib.get_block_comments(function () {/*menu_button:
         <li>
         <div class="ui_tab my_link_repost" onclick="vkopt['{vals.module_id}'].clickMenu(cur.peer)">
         {lng.LinksAndRepost}
         </div>
         </li>
         */
            /*menu_right:
             <ul id="history_list"  onclick="vkopt['{vals.module_id}'].clickList(event)">
             <li><a  href="#" class="ui_rmenu_item ui_rmenu_item_sel" data-type="7">
             <span>{lng.LinksAndRepost_all}</span>
             </a>
             </li>
             <li><a href="#" class="ui_rmenu_item" data-type="2">
             <span>{lng.LinksAndRepost_forward}</span>
             </a>
             </li>
             <li><a  href="#" class="ui_rmenu_item " data-type="4">
             <span>{lng.LinksAndRepost_post}</span>
             </a>
             </li>
             <li><a  href="#" class="ui_rmenu_item" data-type="1">
             <span>{lng.LinksAndRepost_link}</span>
             </a>
             </li>
             </ul>
             */
            /*content_row:
             <div class="im-mess-stack _im_mess_stack " style="margin-left: -7%;">
             <div class="im-mess-stack--photo">
             <div class="nim-peer nim-peer_small fl_l">
             <div class="nim-peer--photo-w">
             <div class="nim-peer--photo">
             <a target="_blank" class="im_grid" href="/{vals.domain}"  onclick="nav.setLoc(this.getAttribute('href'));  nav.reload();"><img alt="{vals.name}" src="{vals.photo_50}"></a>
             </div>
             </div>
             </div>
             </div>
             <div class="im-mess-stack--content">
             <div class="im-mess-stack--info">
             <div class="im-mess-stack--pname">
             <a href="/{vals.domain}" class="im-mess-stack--lnk" title="" target="_blank">{vals.name}</a>
             <span class="im-mess-stack--tools">
             <a href="/{vals.location}" class="_im_mess_link {vals.no_link}" onclick="nav.setLoc(this.getAttribute('href'));  nav.reload();">{vals.time}</a>    <!--a href="/im?sel=c25&amp;msgid=868870" relocation  -->
             </span>
             </div>
             </div>
             <span name="content"><span><!-- контент -->
             </div>
             </div>
             */
            /*content_message:
             <ul class="ui_clean_list im-mess-stack--mess _im_stack_messages">
             <li class="im-mess im_in" style="padding-right: 8px;"> <!-- im-mess_selected выделяет-->
             <div class="im-mess--text wall_module _im_log_body">
             <div class="im_msg_text" name="content_repost"><div style="margin-top: 2px;">{vals.text_content}</div></div>
             </li>
             </ul>
             </div>
             </div>
             */
            /*content_repost:
             <div class="media_desc im-mess--inline-fwd history_im_media_fwd clear_fix" data-deep="0">
             <div class="history_im_fwd"><div class="im-mess-stack _im_mess_stack im-mess-stack_fwd">
             </div>
             </div>
             */
            /*content_repost_deep:
             <div class="im-mess-stack _im_mess_stack im-mess-stack_fwd">
             </div>
             */
            /*content_link:
             <div class="_im_msg_media"><div class="im_msg_media im_msg_media_link"><div class="page_media_thumbed_link page_media_thumbed_link_big ">
             <div class="page_media_link_photo"><a href="{vals.url}" target="_blank" class="page_media_link_img_wrap">
             <img data-width="537" data-height="240" width="391" height="175" class="page_media_link_img" src="{vals.photo_604}"></a>
             </div>
             <div class="page_media_link_desc_wrap ">
             <div class="page_media_link_desc_block">
             <div class="page_media_link_title"><a href="{vals.url}" target="_blank">{vals.title}</a>
             </div>

             <a href="{vals.url}" target="_blank" class="page_media_link_url page_market_owner_link"><div class="page_media_link_text">{vals.caption}
             </div></a>
             </div>

             </div>
             */
            /*content_link_no_photo:
             <div class="im_msg_media im_msg_media_link">
             <div class="media_desc">
             <a class="lnk lnk_mail clear_fix" href="{vals.url}" target="_blank">
             <span class="lnk_mail_title a clear_fix">{vals.title}</span>

             <span class="lnk_mail_domain clear_fix">{vals.caption}</span>

             </a>
             </div>
             </div>
             */
            /*page:
             <div class="media_desc media_desc__">
             <a class="lnk"  href="/page-{vals.group_id}_{vals.id}"   target="_blank"  onclick="window.open(this.href); cancelEvent(event);" >
             <b class="fl_l "></b>
             <span class="a">{vals.title}&nbsp;</span>
             </a>
             <a href="/page-{vals.group_id}_{vals.id}"   target="_blank" onclick="window.open(this.href); cancelEvent(event);" class="post_media_link_preview_wrap inl_bl">
             <button class="flat_button">
             <span class="wall_postlink_preview_btn_label">Просмотреть</span>
             </button>
             </a>
             </div>
             */
            /*photo:
             <img data-width="537" data-height="240"  class="page_media_link_img media_position" src="{vals.photo_604}"  onclick="showPhoto('{vals.owner_id}_{vals.id}',null,{img:this, queue: 1 }, event)">
             */
            /*gif:
             <div class="clear_fix page_gif_large">
             <a class="photo page_doc_photo_href" href="{vals.url}" onclick="return Page.showGif(this, event)" data-doc="{vals.owner_id}_{vals.id}" data-hash="{vals.url_parse_hash}"  data-add-txt="Скопировать в мои документы" data-share-txt="Поделиться" data-preview="1" data-thumb="{vals.photo_size_src_o}" data-width="{vals.dataWidth}" data-height="{vals.dataHeight}" style="width:{vals.width}px; height:{vals.height}px; display: block;">
             <div class="page_doc_photo" style="background-image: url({vals.photo_size_src_o});width:{vals.width}px;height:{vals.height}px;background-size:cover;"></div>
             <div class="page_gif_label">gif</div>
             <div class="page_gif_play_icon"></div>
             <div class="page_gif_actions">
             <div class="page_gif_share" onmouseover="showTooltip(this, {text: 'Поделиться', black: 1, shift: [7, 6, 6], toup: 0, needLeft: 1})" onclick="return 0 ? false : Page.shareGif(this, '{vals.owner_id}_{vals.id}', '{vals.url_parse_hash}', event)">
             <div class="page_gif_share_icon"></div>
             </div>
             </div>
             </a>
             </div>
             */
            /*doc:
             <div class="media_desc media_desc__doc ">
             <div class="page_doc_row" id="post_media_lnk{vals.owner_id}_{vals.id}">
             <a class="page_doc_icon page_doc_icon1" href="{vals.url}" target="_blank"></a>
             <a class="page_doc_title" href="{vals.url}" target="_blank">{vals.title}</a>
             <div class="page_doc_size">{vals.size} КБ</div>
             </div>
             </div>
             */
            /*audio:
             <div class="wall_audio_rows _wall_audio_rows">
             <div class="audio_row _audio_row _audio_row_{vals.owner_id}_{vals.id} inlined canadd lpb clear_fix" onclick="return getAudioPlayer().toggleAudio(this, event)" data-audio="[&quot;{vals.id}&quot;,&quot;{vals.owner_id}&quot;,&quot;&quot;,&quot;{vals.title}&quot;,&quot;{vals.artist}&quot;,145,0,0,&quot;&quot;,0,16393,&quot;post-114356242_181&quot;,&quot;[]&quot;,&quot;abd77f44bf2391e1f4\/\/b8d78debc3b4fafcf6&quot;]" data-full-id="{vals.owner_id}_{vals.id}" id="audio_{vals.owner_id}_{vals.id}">
             <div class="audio_play_wrap" data-nodrag="1"><button class="audio_play _audio_play" id="play_{vals.owner_id}_{vals.id}" aria-label="Воспроизвести "></button></div>
             <div class="audio_info">
             <div class="audio_duration_wrap _audio_duration_wrap">
             <div class="audio_hq_label"></div>
             <div class="audio_duration _audio_duration">{vals.duration}</div>
             </div>
             <div class="audio_title_wrap"><a href="/search?c[section]=audio&amp;c[q]={vals.artist_encode}&amp;c[performer]=1" onmouseover="setTitle(this)" nodrag="1" onclick="return audioSearchPerformer(this, event)" class="audio_performer">{vals.artist}</a><span class="audio_info_divider">–</span><span class="audio_title _audio_title" onmouseover="setTitle(this, domPN(this))"><span class="audio_title_inner" tabindex="0" nodrag="1" aria-label="{vals.title}" onclick="return toggleAudioLyrics(event, this, '{vals.owner_id}_{vals.id}', '0')">{vals.title}</span>
             <span class="audio_author" onclick="cur.cancelClick=true"></span>
             </span></div>
             </div>
             <div class="_audio_player_wrap"></div>
             <div class="_audio_lyrics_wrap audio_lyrics" data-nodrag="1"></div>
             </div>
             </div>
             */
            /*video:
             <div class="page_post_sized_thumbs  clear_fix" style="width:320px; height:240px;">
             <a href="/video{vals.owner_id}_{vals.id}?list={vals.access_key}" data-video="{vals.owner_id}_{vals.id}" data-list="{vals.access_key}" data-duration="{vals.duration}" aria-label="{vals.title}&amp;#33;" onclick="return showInlineVideo('{vals.owner_id}_{vals.id}', '{vals.access_key}', {autoplay: 1, addParams: { post_id: '{vals.owner_id}_{vals.id}' }}, event, this);" style="width:320px; height:240px; background-image: url({vals.photo_320})" class="page_post_thumb_wrap image_cover  page_post_thumb_video page_post_thumb_last_column page_post_thumb_last_row">
             <div class="page_post_video_play_inline"></div>
             <div class="page_wm"></div>
             <div class="page_post_video_duration_single">{vals.duration}</div>
             </a>
             </div>
             <div class="a post_video_title" onclick="return showVideo('{vals.owner_id}_{vals.id}', '{vals.access_key}', {autoplay: 1, queue: 1, addParams: { post_id: '{vals.owner_id}_{vals.id}' }}, event);" style="width: 320px;">{vals.title}</div>
             */
            /*poll:
             <div class="page_media_poll_wrap">
             <div class="page_media_poll_title_wrap clear_fix">
             <div class="page_media_poll_desc">{vals.state}</div>
             <div class="page_media_poll_title">{vals.question}</div>
             </div>
             <div class="page_media_poll" id="post_poll{vals.postId}"><div class="page_poll_stats" onclick="Wall.pollFull(false, '{vals.postId}', event);">

             <input type="hidden" id="post_poll_raw{vals.postId}" value="{vals.owner_id}_{vals.id}" class="user_revote"><input type="hidden" id="post_poll_open{vals.postId}" value="1"><div class="page_poll_bottom">
             <div class="page_poll_total">
             <span class="divider fl_r"></span>
             <div class="page_poll_total_count">Неравнодушны <b>{vals.votes}</b> граждан.</div>
             </div>
             </div></div>
             </div>
             */
            /*poll_answers:
             <div class="page_poll_stat" onmouseover="Wall.pollOver(this, '{vals.postId}', {vals.id})">
             <div class="page_poll_text">{vals.text}</div>
             <div class="page_poll_row_wrap">
             <div class="page_poll_row_percent">{vals.rate}%</div>
             <div class="page_poll_row page_poll_voted">
             <div class="page_poll_percent" style="width: 49%"></div>
             <div class="page_poll_row_count">{vals.votes}</div>
             </div>
             </div>
             </div>
             */
        })
    }
};

vkopt_core.init();

