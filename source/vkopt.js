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
var vVersion	= 300;
var vBuild = 160819;
var vPostfix = ' beta';

if (!window.vkopt) window.vkopt={};

var vkopt_defaults = {
   config: {
      scroll_to_next: false,
      ad_block: true,
      compact_audio: false,
      audio_full_title: false,
      disable_border_radius: false,
      audio_dl: true,
      audio_size_info: false,
      audio_clean_titles: false,
      audio_album_info: true,
      size_info_on_ctrl: true,
      scrobbler: true,
      im_dialogs_right: false,
      cut_bracket: false,
      postpone_custom_interval: true,
      pv_comm_move_down: false,
      calc_age: true,

      //Extra:
      vkopt_guide: true,   // показываем, где находится кнопка настроек, до тех пор, пока в настройки всё же не зайдут
      photo_replacer: true,
      add_to_next_fix: true, // кнопка "Воспроизвести следующей" теперь добавляет в текущий список воспроизведения из посторонних
      audio_more_acts: true, // доп. менюшка для каждой аудиозаписи
      audio_dl_acts_2_btns: false, // разделить на аудио кнопки скачивания и меню доп.действий
      audio_edit_box_album_selector: true, // поле выбора альбома в окне редактирования названия аудио
      audio_force_flash: false, // принудительно использовать Flash для аудио-плеера
      im_hide_dialogs: false, // Новый стиль диалогов. Полотно переписки на всю ширину, список диалогов скрывается при клике по истории, показ списка - клик по заголовку переписки
      attach_media_by_id: true, // при вставке айди медиа в поле поиска из диалога прикрепления, в диалог подгружается медиа-файл с этим айди
      datepicker_inj: true, // активна ли инъекция в конструктор DatePicker'а
      zodiak_ophiuchus:false, // 13ый знак зодиака, Змееносец, между 30 ноября и 17 декабря
      photo_search_copy: true,
      ph_download_with_name: false,
      stealth_addons: true, // прикидываемся перед ТП, что у нас не стоит расширение для скачивания.

      lastfm_enable_scrobbling: false,
      lastfm_token: '',
      lastfm_username: 'NO_AUTH',
      lastfm_session_key: '',

      //Consts:
      AUDIO_INFO_LOAD_THREADS_COUNT: 5,
      AUTO_LIST_DRAW_ROWS_INJ: true, // На случай, если инъекция будет убивать редер автоподгружаемых списков
      MAX_CACHE_AUDIO_SIZE_ITEMS: 10000 // максимальное количество запомненных размеров аудио в локальном хранилище
   },
   popular: [
      'scroll_to_next',
      'pv_comm_move_down',
      'disable_border_radius'
   ]
}

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
      // Под новый дизайн чуть другие функции работы с локализацией.
      vkopt.lang.override(); // TODO: убрать этот костыль при удалении скриптов для старого дизайна

      for (var key in StaticFiles)
         if (StaticFiles[key].t == 'js')
            vk_glue.inj_to_file(key);
      //vkBroadcast.Init(vkOnStorage);
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
         var css = vkopt_core.plugins.get_css(plug_id);
         if (css != '')
            vkaddcss(code);

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
         var field = vkopt[plug_id][method];
         if (field) // TODO: && isModuleEnabled(plug_id)
            return isFunction(field) ? field.apply(this, args) : field;
         return null;
      },
      call_modules: function(){ // (method, arg1, arg2 ...)
         var args = Array.prototype.slice.call(arguments);
         var results = {};
         for (var plug_id in vkopt){
            var res = vkopt_core.plugins.call_method.apply({plugin_id:plug_id}, [plug_id].concat(args));
            if (res) results[plug_id] = res;
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
         for (var plug_id in vkopt)
            code += vkopt_core.plugins.get_css(plug_id);
         vkaddcss(code);
      },
      get_css:function(plug_id){
         var css = vkopt[plug_id].css;
         if (!css) return '';
         return (Object.prototype.toString.call(css) === '[object Function]')?css():css;
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
      on_ajax_post: function(url, query, options){
         var res = vkopt_core.plugins.call_modules('onRequestQuery', url, query, options);
         for (var i = 0; i < res.length; i++)
            if (res[i] === false)
               return false;
         return true;
      },
      process_response: function(answer, url, q){
         // answer - массив, элементы которого в последствии становятся аргументами вызываемых колбеков. можно править его элементы
         var _rx = /^\s*<(div|table|input|a)/i;
         for (var i=0;i<answer.length;i++){
            if (typeof answer[i]=='string' && _rx.test(answer[i]) ){
               answer[i] = vkopt_core.mod_str_as_node(answer[i], vkopt_core.plugins.process_node, {source:'process_response', url:url, q:q});
            }
         }
         // для случаев, когда тело html'а передано не отдельным аргументом, а внутри какого-то JSON'а:
         switch (url){
            case '/al_im.php':
               if (q.act == 'a_start' && answer[0] && answer[0].history){ // открытие диалога
                  answer[0].history = vkopt_core.mod_str_as_node(answer[0].history, vkopt_core.plugins.process_node, {source:'process_response_im_a_start', url:url, q:q});
               }
               break;
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
      },
      eltt_first_show: function(ett){
         vkopt_core.plugins.call_modules('onElementTooltipFirstTimeShow', ett, ett._opts);
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
         case 'auto_list.js':       vk_glue.inj.auto_list();  break;
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
                     var argarr = Array.prototype.slice.call(arguments);
                     vk_glue.response_handler(argarr, __ARG0__, __ARG1__);
                     onDoneOrig.apply(window, argarr);
                 }
             }
             // End of callback mod
         }
     );
         // айфремовая загрузка выглядит так - загрузили каркас с частью данных, дальше по ходу загрузки айфреймовой страницы выполняются куски заполнения элементов карскаса.
         // эти кучки тоже надо перехватывать.
         Inj.Start('ajax.framegot','if (#ARG1#) #ARG1#=vk_glue.process_on_framegot(#ARG1#);');

         // Можем модифицировать поля запроса перед отсылкой ajax-запроса, либо заблокировать его
         Inj.Start('ajax.post','if (vk_glue.process_on_post(#ARG0#, #ARG1#, #ARG2#) === false) return;');//(url, query, options)
         /*
         Inj.Start('renderFlash','vkOnRenderFlashVars(vars);');
         */
         // перехват тултипов при создании их контента. например для перехвата создания меню "Ещё" перед его показом в просмотрщике фото
         Inj.After('ElementTooltip.prototype.show',/this\._opts.onFirstTimeShow[^;]+;/,'vkopt_core.plugins.eltt_first_show(this);');
      },
      auto_list: function(){
         if (vkopt_defaults.config.AUTO_LIST_DRAW_ROWS_INJ){
            Inj.Replace('AutoList.prototype._drawRows',/\.appendChild\(([A-Za-z_0-9]+)\)/,'$&; vkopt_core.plugins.process_node($1);');
         }
         // Inj.End('AutoList.prototype._drawRows', '; vkopt_core.plugins.process_node(this._containerEl);'); // Другой вариант. Меньше шансов того, что отвалится, но тут выходит повторная обработка ранее выведенного.
      }
   },
   nav_handler: function(){
      // тут какие-то системные действия движка до передачи события в плагины
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
   }
}

/*
(function(){
   var m = {
      id: 'vkopt_any_plugin',
      // <core>
      onInit:                 function(){},                                // выполняется один раз после загрузки стрницы
      onLibFiles:             function(file_name){},                       // место для инъекций = срабатывает при подключении нового js-файла движком контакта.
      onLocation:             function(nav_obj,cur_module_name){},         // вызывается при переходе между страницами
      onRequestQuery:         function(url, query, options){}              // вызывается перед выполнением ajax.post метода. если функция вернёт false, то запрос выполнен не будет.
      onResponseAnswer:       function(answer,url,params){},               // answer - массив, изменять только его элементы
      onStorage :             function(command_id,command_obj){},          // слушает сообщения отосланные из других вкладок вк через vkCmd(command_id,command_obj)
      processNode:            function(node, params){}                     // обработка элемента
      processLinks:           function(link, params){},                    // обработка ссылки
      onModuleDelayedInit:    function(plugin_id){},                       // реакция на подключение модуля, опоздавшего к загрузке страницы.
      onElementTooltipFirstTimeShow: function(ett, ett_options)            // реакция на первый показ ElementTooltip, при создании его контента. На момент вызова в элементе ett._ttel уже есть контент. По ett._opts.id можно определить к чему тултип относится.

      // <settings>
      onSettings:             function(){} || {}                           // возвращаем объект с перечисленными по категориям настройками этого модуля
      onOptionChanged:        function(option_id, val, option_data){},     // реакция на изменение опции
      firstRun:               function(){}                                 // вызывается при первом запуске (не найдены ранее прописанные настройки vkopt'a),
                                                                           // P.S. вкопт из хранилища расширения восстанавливает только данные из своего конфига, если они были сохранены,
                                                                           // тогда это первым запуском не считается, но в локальном хранилище могут отсутствовать данные от других модулей,
                                                                           // хранящих инфу не через vkopt.settings.get | vkopt.settings.set

      // <audio>
      onAudioRowMenuItems: function(audio_info_obj){},                     // вернуть массив из строк с пунктами-ссылками "<a>..</a>"

      // <wall>
      onDatepickerCreate: function(args){},                                // вызывается при создании селектора даты new Datepicker(), args - массив аргументов переданных в конструктор
   };
   window.vkopt = (window.vkopt || {});
   window.vkopt[m.id] = m;
   if (window.vkopt_core_ready) vkopt_core.plugins.delayed_run(m.id);      // запускает модуль, если мы опоздали к загрузке страницы, провоцирует вызов события onModuleDelayedInit
})();
*/

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
}

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
             width: 255px;
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
         .vk_sub_options{padding-left:20px; margin-top:5px;}

         #vk_setts_Extra{
            display:none;
         }

         .vk_welcome_r{
            width: 70px;
         }
         .vk_welcome_r .vk_lang{
            width: auto;
            height: auto;
         }
         .vk_welcome_r .vk_lang a{
            font-size: 10px;
            width: 55px;
            height: 75px;
            line-height: 12px;
         }
         .vk_welcome_r .vk_lang_about{
            display: none;
         }
         .vk_welcome_l{
            width: 530px;
         }
         .vk_welcome_warn{
            font-weight:bold;
            color:#F00;
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
             <div id="vkopt_lang_settings"></div>
             <div id="vkopt_donate_block"></div>
         </div>
         */
         /*search_block:
         <div class="ui_search ui_search_field_empty ui_search_custom _wrap">
           <div class="ui_search_input_block">
             <input type="text" class="ui_search_field _field" id="vk_setts_search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" onkeyup="vkopt.settings.filter_change( this, vkopt.settings.filter);" onpaste="vkopt.settings.filter_change( this, vkopt.settings.filter);" oncut="vkopt.settings.filter_change( this, vkopt.settings.filter);" placeholder="{lng.Search}">
           </div>
         </div>
         <div class="vk_setts_wrap" id="vkopt_settings">{vals.content}</div>
         <div id="vkopt_lang_settings"></div>
         <div id="vkopt_donate_block"></div>
         */
         /*donate_form:
         <div>{lng.Donations}</div>
         <div class="vk_donations">
            <div class="vk_donations_left fl_l">
               <div>{lng.DevRekv}</div>
               <div id="vk_purses_list">vkOptDonate.WMPursesList('wmdonate')</div>
            </div>
            <div class="vk_donations_right fl_l">
            <div id="wmdonate">vkOptDonate.WMDonateForm(30,'R255120081922')</div>
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
      });
      // Подставляем локализацию в шаблон:
      for (var key in vkopt.settings.tpls)
         vkopt.settings.tpls[key] = vk_lib.tpl_process(vkopt.settings.tpls[key],values);

      vkopt.settings.top_menu_item();
      // vkopt.settings.left_menu_item(); // пока непонятно как избавиться от добавления класса ui_rmenu_item_sel при клике по пункту меню
      // </UI>

      // Инит фич настроек плагинов
      var list = vkopt.settings.get_options_list();
      vkopt.settings.init_features(list);
      setTimeout(function(){
         vkopt.settings.first_launch();
      },0);
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
         }
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

            var box = new MessageBox({title: IDL('THFI'),width:"660px"});
            box.removeButtons();
            box.addButton('OK',function(){box.hide( 200 );},'no');

            // Для быстрого просмотра выбранной локализации
            var box_content = function(){
               //var welcome_html =
               //welcome_html += '<br><br>' + vkopt.lang.choose(true, box_content);
               var settings =  {
                  PopularOptions:{}
               }
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
            }
            stManager.add(['settings.css']);
            box_content();
            box.show();

         }

      }
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
      }
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
      return html;
   },
   show: function(el, in_box){
      vkopt.settings.set('vkopt_guide', false); // скрываем подсказки по поиску кнопки настроек

      var update_view = function(){
         val('vkopt_settings', vkopt.settings.render_options());
         val('vkopt_lang_settings', vkopt.lang.choose(true, update_view));

         val('vkopt_donate_block', vk_lib.tpl_process(vkopt.settings.tpls['donate_form'], {}));
         val('vk_purses_list', vkOptDonate.WMPursesList('wmdonate'));
         val('wmdonate', vkOptDonate.WMDonateForm(30,'R255120081922'));
      }
      var p = null;
      if (!in_box || ge('vkopt_settings_block')){ // показ на странице, а не во всплывающем окне
         el = el || ge('ui_rmenu_vkopt');
         el && uiRightMenu.switchMenu(el);
         p = ge('wide_column');
         vkopt_core.setLoc('settings?act=vkopt'); // вместо nav.setLoc для избежания рекурсии, обход реакции на смену URL'а
         p.innerHTML = vkopt.settings.tpls['main'];
         update_view();
      } else {
         stManager.add('settings.css',function(){
            html = vk_lib.tpl_process(vkopt.settings.tpls['search_block'], {content: ''});
            vkopt.settings.__box = new MessageBox({title:vkopt.settings.__full_title, width: 650 ,hideButtons:true, bodyStyle: 'padding:0px;'}).content(html).show();
            update_view();
         })

      }
      return false;
   },
   filter: function(val){
      ge('vkopt_settings').innerHTML = vkopt.settings.render_options(val);
      (trim(val).toLowerCase() == 'extra' ? show : hide)('vk_setts_Extra');
      (trim(val) == '' ? show : hide)('vkopt_lang_settings');
   },
   _vk_inp_to:{'__cnt_id':0},
   filter_change: function(obj,callback){
      //var val=trim(obj.value);
      if (!obj.id){
         obj.id='vkobjid_'+vkopt.settings._vk_inp_to['__cnt_id'];
         vkopt.settings._vk_inp_to['__cnt_id']= vkopt.settings._vk_inp_to['__cnt_id']+1;
      }
      if (vkopt.settings._vk_inp_to[obj.id]) clearTimeout(vkopt.settings._vk_inp_to[obj.id]);
      vkopt.settings._vk_inp_to[obj.id]=setTimeout(function(){
         callback(trim(obj.value));
      },50);
   },
   config: function(new_config){
      if (new_config){
         localStorage['vkopt_config'] = JSON.stringify(new_config);
         return new_config;
      }
      var config = vkopt_defaults.config;
      try {
         config = JSON.parse(localStorage['vkopt_config'] || '{}')
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

   get_option_data: function(option_id){
      var list = vkopt.settings.get_options_list();
      var option_data = null;
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
      }
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
                  options_id[option_id] = []
               options_id[option_id].push(plug_id);
               // </conflicts>
               if (option_data.sub){
                  each_in_cat(plug_id, option_data.sub);
               }
            }
      }
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
      if (!option_data.options){ // checkbox
         html = vk_lib.tpl_process(vkopt.settings.tpls['checkbox'], {
               id: option_data.id,
               caption: IDL(option_data.title || option_data.plug_id+'.'+option_data.id, 2),
               on_class: vkopt.settings.get(option_data.id) ? 'on': ''
            });
         if (option_data.sub){
            var content = '';
            for (var option_id in option_data.sub){
               content += vkopt.settings.get_switcher_code(option_data.sub[option_id]);
            }
            html += vk_lib.tpl_process(vkopt.settings.tpls['sub_block'], {content: content});
         }
      } else { // radio group

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
         config: vkopt.settings.config(),
      }
      vk_ext_api.storage.set('vkopt_cfg_backup_'+vk.id, JSON.stringify(full_config), function(){
         console.log('config '+vk.id+' copied to bg ok');
         callback && callback();
      });

   },
   restore:function(callback){
      vk_ext_api.storage.get('vkopt_cfg_backup_'+vk.id,function(value){
         var cfg = JSON.parse(value || '{}');
         if (cfg.config)
            vkopt.settings.config(cfg.config);

         console.log('config '+vk.id+' restored from bg ok');
         callback && callback();
      })
   },
   remove_backup:function(callback){
      vk_ext_api.storage.set('vkopt_cfg_backup_'+vk.id, '{}', function(){
         console.log('empty config copied to bg ok');
         callback && callback();
      });
   }
}

vkopt['lang'] = {
   tpls: null,
   __callbacks: [function(){}],
   onSettings:{
      Others:{
         cut_bracket:{
            title: 'seCutBracket'
         }
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

         .vk_lang_about {
            text-align:center;
            clear:both;
         }
         */
      }).css;
   },
   onInit: function(){
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
      else if (options)
         return vkopt.lang.cut_bracket(str, options);
      else
         return str;
   },
   cut_bracket: function(s,bracket){ // bracket = 2 - remove [], other  - add []
      if (isArray(s)) return s;
      if (vkopt.settings.get('cut_bracket') || bracket==2) s=(s.substr(0,1)=='[')?s.substr(1,s.length-2):s;
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
      var raw = vk_lang[id] || vk_lang_ru[id] || (window.vk_lang_add && vk_lang_add[id])
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
         lng.push([VK_LANGS_IDS[i],VK_LANGS[i]['LangTite'],VK_LANGS[i]['LangAuthor']])
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

      return html;
   }
}

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
         return callback.apply(this, vkopt.owners.cache[obj_id])

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
         ph_download_with_name:{}
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
            padding: 8px 10px;
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
         #pv_more_acts_tt .vk_ph_copy_search_label.pv_more_act_item:before{
            background-image: url("data:image/svg+xml,%3Csvg%20version%3D%221.1%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%09%20viewBox%3D%220%200%20256%20256%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20fill%3D%22%23FFFFFF%22%20d%3D%22M204.1%2C66l-25.3%2C30.4c-14.1-25-44.3-37.6-72.7-28.5%09c-32.5%2C10.4-50.5%2C45.2-40%2C77.8c6.2%2C19.4%2C21.2%2C33.6%2C39.1%2C39.7c7.4%2C14%2C15.4%2C31.9%2C21.1%2C46c-7.5%2C7.8-12.1%2C19.6-12.1%2C19.6l-30.9-6.7%09l3.5-26.3c-4.8-2-9.5-4.4-13.9-7.2L53.6%2C229l-23.4-21.3l16.2-21c-3.1-4.1-6-8.5-8.5-13.2l-25.8%2C6l-9.7-30.1l24.5-10.1%09c-0.7-5.3-0.9-10.5-0.8-15.7L0.8%2C116l6.7-30.9l26.3%2C3.5c2-4.8%2C4.4-9.5%2C7.2-13.9L22.8%2C55.3l21.3-23.4l21%2C16.2c4.1-3.1%2C8.5-6%2C13.2-8.5%09l-6-25.8l30.1-9.7l10.1%2C24.5c5.3-0.7%2C10.5-0.9%2C15.7-0.8l7.7-25.4l30.9%2C6.7l-3.5%2C26.3c4.8%2C2%2C9.5%2C4.4%2C13.9%2C7.2l19.3-18.2l23.4%2C21.3%09l-15.4%2C20L204.1%2C66z%20M79%2C106.3l49.8-18.1l44.6%2C87.8l31.7-95.6l50%2C18.1c-11%2C24.1-21%2C48.8-30.1%2C74c-9.1%2C25.2-17.2%2C50.9-24.4%2C77h-50.9%09c-9.5-22.9-20.2-46.3-32-70.2C105.8%2C155.3%2C92.9%2C131%2C79%2C106.3z%22/%3E%3C/svg%3E");
            background-position: 0 0;
            background-repeat: no-repeat;
            width: 16px;
            margin-top: -2px;
         }
         #pv_more_acts_tt .vk_ph_sz_btn.pv_more_act_item{
            padding: 8px 12px;
         }
         #vk_ph_links_list{
            padding-left: 8px;
         }
         */
      }).css;
   },
   onLibFiles: function(file_name){
      if (file_name == 'photoview.js'){
         Inj.Start('Photoview.afterShow','vkopt.photoview.scroll_view();');
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
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="http://images.yandex.ru/yandsearch?rpt=imagecbir&img_url={vals.src}">Yandex</a>
            <a target="_blank" class="pv_more_act_item fl_l vk_ph_copy_search" href="/feed?section=photos_search&q=copy%3Aphoto{vals.photo_id}">VK</a>
            <div class="clear"></div>
            </div>
         </div>
         */
         /*links_menu:
         <div id="pv_hd_links">
            <a href="#" onclick="return vkopt.photoview.links_toogle();" class="vk_ph_sz_btn fl_l pv_more_act_item">{lng.Links}: </a>{vals.hd_links}
            <div id="vk_ph_links_list" class="clear" style="display:none;">{vals.links}</div>
            <div class="clear"></div>
         </div>
         */
      });
   },
   onElementTooltipFirstTimeShow: function(ett, ett_options){
      if (!ett_options || ett_options.id != 'pv_more_acts_tt' || !ett._ttel)
         return;
      var append_menu = function(content){
         ett._ttel.appendChild(se(trim(content)));
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

      var html='',
          max_size
          links=[],
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
   move_comments_block:{
      inj: function(){
         if (vkopt.settings.get('pv_comm_move_down') && typeof Photoview != 'undefined'){
            Inj.Replace('Photoview.updateVerticalPosition', /Math\.round/g, 'vkopt.photoview.move_comments_block.mod');
            Inj.Replace('Photoview.doShow', /new uiScroll\(/i, "(vkopt.settings.get('pv_comm_move_down') ? function(){} : new uiScroll)("); // вырубаем подмену скролла для блока комментов
            if (!vkopt.photoview._SIDE_COLUMN_WIDTH_BKP && Photoview.SIDE_COLUMN_WIDTH)
               vkopt.photoview._SIDE_COLUMN_WIDTH_BKP = Photoview.SIDE_COLUMN_WIDTH
            Photoview.SIDE_COLUMN_WIDTH = 0;
         }
      },
      mod:function(t){
         return vkopt.settings.get('pv_comm_move_down') ? Math.max(Math.round(t),10) : Math.round(t);
      }
   }
}

vkopt['photos'] =  {
   css: '\
      #vk_ph_upd_btn{opacity:0.1}\
      #vk_ph_upd_btn:hover{opacity:1}\
   ',
   onSettings:{
      Extra:{
         photo_replacer:{}
      }
   },
   onResponseAnswer: function(answer,url,q){
      if (url == '/al_photos.php' && q.act == 'edit_photo' && (vkopt.settings.get('photo_replacer'))){
         answer[1] = vkopt_core.mod_str_as_node(answer[1], vkopt.photos.update_photo_btn, {source:'process_edit_photo_response', url:url, q:q});
      }
   },
   update_photo: function(photo_id){
      var box=vkAlertBox(IDL('Upload'),'<center><div id="vk_upd_photo"></div><div id="vk_upd_photo_progress"></div></center>');
      stManager.add('upload.js',function(){
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
   }
}

vkopt['audio'] =  {
   css: function(){
      var codes = vk_lib.get_block_comments(function(){
      /*dl:
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn{
         display:block;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn>div {
         background-image: url(/images/blog/about_icons.png);
         width: 12px;
         height: 14px;
         background-position: 0px -309px;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.dl_url_loading>div{
         opacity:0.3;
         background: url(/images/upload_inv_mini.gif) no-repeat 0% 50%;
         width: 17px;
         margin-left: -2px;
      }

      .audio_row .audio_acts .audio_act.vk_audio_acts{
         display:block;
      }
      .audio_row .audio_acts .audio_act.vk_audio_acts>div {
         background: url(/images/icons/profile_dots.png) no-repeat 0 5px;
         height: 13px;
         width: 18px;
      }

      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.vk_audio_acts>div{
         background: url(/images/icons/profile_dots.png) no-repeat 0 5px;
         height: 13px;
         width: 18px;
         transition: none;
      }
      .audio_row .audio_acts .audio_act.vk_audio_dl_btn.vk_audio_acts:hover>div{
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
      .vk_size_info_on_ctrl .ctrl_key_pressed .audio_row.vk_info_loaded .vk_audio_size_info_wrap,
      .vk_size_info_on_ctrl .audio_hq_label_show .audio_row.vk_info_loaded .vk_audio_size_info_wrap{
         display: table;
      }

      .vk_audio_size_info_wrap,
      .narrow_column .audios_module .vk_audio_size_info_wrap,
      .vk_size_info_on_ctrl .audio_row .vk_audio_size_info_wrap,
      .audio_row:hover .vk_audio_size_info_wrap,
      .vk_size_info_on_ctrl .audio_hq_label_show .audio_row:hover .vk_audio_size_info_wrap,
      .vk_size_info_on_ctrl .audio_row:hover .vk_audio_size_info_wrap
      {
         display: none;
      }
      .vk_audio_size_info_wrap{
         font-size: 10px;
         line-height: 9px;
         margin-right: 3px;
      }

      .vk_compact_audio .vk_audio_size_info_wrap{
         margin-top: 0px;
         height: 18px;
      }
      .vk_audio_size_info_wrap{
         margin-top: -4px;
         height: 20px;
      }

      .vk_audio_size_info{
         display: table-cell;
         vertical-align: middle;
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
      .vk_acts_menu_block a{
         display: block;
         white-space: nowrap;
         text-decoration: none;
      }
      .vk_acts_menu_block a:hover{
         background-color: rgba(0, 51, 127, 0.039);
         margin: 0px -14px;
         padding: 0 14px;
      }
      .tt_w.vk_acts_menu_block .tt_text {
         padding-bottom: 5px;
         padding-top: 5px;
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
               size_info_on_ctrl: {
                  title: 'seAudioSizeShowOnCtrl',
                  class_toggler: true
               }
            }
         },
         audio_clean_titles: {
            title: 'seAudioUntrashTitle'
         }
      },
      Extra:{
         audio_more_acts:{
            sub:{
               audio_dl_acts_2_btns:{}
            }
         },
         audio_edit_box_album_selector:{}
      }
   },
   onLibFiles: function(file_name){
      if (file_name == 'audioplayer.js'){
         if (vkopt.settings.get('audio_dl')){
            Inj.Start('AudioPlayer.prototype.toggleAudio','if (vkopt.audio.prevent_play_check()) return true;'); // для предотвращения воспроизведения при нажатии на "скачать"
         }
      }
   },
   onInit: function(){
      vkopt.audio.tpls = vk_lib.get_block_comments(function(){
      /*dl_button:
      <a class="audio_act vk_audio_dl_btn" id="vk_dl_{vals.id}" data-aid="{vals.id}" download="{vals.filename}" href="{vals.url}" onmousedown="vkopt.audio.prevent_play();" onclick="vkopt.audio.prevent_play(); return vkDownloadFile(this);" onmouseover="vkopt.audio.btn_over(this);"><div></div></a>
      */
      /*acts_button:
      <a class="audio_act vk_audio_acts" id="vk_acts_{vals.id}" data-aid="{vals.id}" onmousedown="vkopt.audio.prevent_play();" onmouseover="vkopt.audio.acts.menu(this);" onclick="vkopt.audio.prevent_play();"><div></div></a>
      */
      /*size_info:
      <small class="fl_l vk_audio_size_info_wrap" id="vk_audio_size_info_{vals.id}">
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
      /*acts_menu:
      <a href="#" onclick="vkopt.audio.add_to_group({vals.ownerId}, {vals.id}); return false;">{lng.AddToGroup}</a>
      <a href="#" onclick="return vkopt.audio.share('{vals.fullId}');">{lng.Share}</a>
      <a href="#" onclick="vkopt.audio.acts.wiki('{vals.fullId}',{vals.owner_id},{vals.id}); return false">{lng.Wiki}</a>

      */
      });
      vkopt.audio.load_sizes_cache();
   },
   onResponseAnswer: function(answer, url, q){
      if (vkopt.settings.get('audio_edit_box_album_selector') && q.act=='edit_audio_box' && answer[2]) answer[2]=answer[2]+'\n vkopt.audio.edit_box_move("'+q.aid+'");';
   },
   album_cache: {},
   edit_box_move: function(full_aid){
      var x=full_aid.split('_');
      var oid=parseInt(x[0]);
      var aid=parseInt(x[1]);

      var info = AudioUtils.getAudioFromEl(ge('audio_'+full_aid))
      var def_aid = info[AudioUtils.AUDIO_ITEM_INDEX_ALBUM_ID];

      var cur_offset=0;
      var alb_count=100;
      var albums=[];
      var get_albums=function(callback){
         if (vkopt.audio.album_cache[''+oid]) {
            callback(vkopt.audio.album_cache[''+oid]);
            return;
         }
         var params={count:100,offset:cur_offset};
         params[oid<0?'gid':'uid']=Math.abs(oid);
         dApi.call('audio.getAlbums',params,function(r){
            var _albums=r.response;
            alb_count=_albums.shift();

            albums=albums.concat(_albums);
            if (_albums.length<100){
               vkopt.audio.album_cache[''+oid]=albums;
               callback(albums);
            } else {
               cur_offset+=100;
               get_albums(callback);
            }
         });
      };
      var p=ge('audio_extra_link');
      if (!p) return;
      var div=vkCe('div',{id:'vk_audio_mover', 'class':'audio_edit_row clear_fix'},'\
                    <div class="audio_edit_label fl_l ta_r">'+IDL('SelectAlbum',1)+'</div>\
                    <div class="audio_edit_input fl_l"><div id="vk_audio_album_selector"></div><div id="vk_au_alb_ldr">'+vkopt.res.img.ldr+'</div></div>\
                  ');
      p.parentNode.insertBefore(div,p);

      get_albums(function(list){
         stManager.add(['ui_controls.js', 'ui_controls.css'],function(){
            var items=[];
            items.push(['0',IDL('NotInAlbums')]);
            for (var i=0; i<list.length;i++){
               items.push([list[i].album_id,list[i].title]);
            }

            cur.vk_auMoveToAlbum = new Dropdown(ge('vk_audio_album_selector'), items, {
                 width: 298,
                 selectedItems: [def_aid],
                 autocomplete: (items.length > 7),
                 onChange: function(val) {
                   if (!intval(val)) {
                     cur.vk_auMoveToAlbum.val(0);
                   }
                   var to_album=cur.vk_auMoveToAlbum.val();
                   show('vk_au_alb_ldr');

                   //*
                   var params={aids:aid,album_id:to_album};
                   if (oid<0) params['gid']=Math.abs(oid);
                   dApi.call('audio.moveToAlbum',params,function(r){
                     if(r.response==1){
                        // TODO: допилить. ибо в закэшированных плейлистах не изменяется до перезагрузки страницы
                        var u = {};
                        u[AudioUtils.AUDIO_ITEM_INDEX_ALBUM_ID] = to_album,
                        getAudioPlayer().updateAudio(info, u);

                        hide('vk_au_alb_ldr');
                     }
                   });
                 }
            });
            hide('vk_au_alb_ldr');
         });
      });
   },
   remove_trash:function(s){
      s=vkRemoveTrash(s); // удаление символов не являющихся буквами/иероглифами/и т.д
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
                return showDoneBox(t),
                !0
            }
      })
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
            dApi.call('audio.add',{aid:aid,oid:oid,gid:Math.abs(to_gid)},function(r){
               if (r.response){
                  vkMsg('<b><a href="/audio?id=-'+Math.abs(to_gid)+'&audio_id='+r.response+'">'+r.response+'</a></b><br>'+aid+' -> club'+to_gid);
               } else {
                  alert('aid:'+aid+'\n'+'Add error');
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
   btn_over: function(el){
      vkopt.audio.check_dl_url(el);
      vkDragOutFile(el);
      if (!vkopt.settings.get('audio_dl_acts_2_btns') && vkopt.settings.get('audio_more_acts'))
         vkopt.audio.acts.menu(el);
   },
   check_dl_url: function(el){   // если на странице не было ссылок на аудио, то при наведении на кнопку загрузки ждём их появления в кэше.
      if (el.getAttribute('href') == ''){
         addClass(el,'dl_url_loading');
         var id = el.dataset["aid"];
         function wait_and_set_url(){
            var info = vkopt.audio.__full_audio_info_cache[id];
            if (info){
               var name = vkCleanFileName(info.performer + ' - ' + info.title);
               var url = vkopt.audio.make_dl_url(info.url, name);
               el.setAttribute('href', url);
               removeClass(el,'dl_url_loading');
            } else {
               setTimeout(function(){
                  wait_and_set_url();
               },300);
            }
         }
         wait_and_set_url();
      }
   },
   make_dl_url: function(url, name){
      name = vkCleanFileName(name);
      if (/^https:.+\.vk-cdn\.net\//i.test(url))
         url = url.replace(/^https:/,'http:');
      return url + '#FILENAME/' + vkEncodeFileName(name) + '.mp3';
   },
   processNode: function(node, params){
      if (vkopt.settings.get('audio_clean_titles')){ // clean titles
         var nodes=geByClass('audio_title_wrap',node);
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



      if (!vkopt.settings.get('audio_dl') && !vkopt.settings.get('audio_more_acts')) return;
      if (!vkopt.audio.__full_audio_info_cache)
         vkopt.audio.__full_audio_info_cache = {};
      var cache = vkopt.audio.__full_audio_info_cache;

      var audios = geByClass('audio_row',node);
      if (!audios.length && hasClass(node, 'audio_row')) // если вызов из AutoList.prototype._drawRows, то на входе уже элемент audio_row
         audios = [node]

      for (var i = 0; i < audios.length; i++){
         var row = audios[i];
         var acts = geByClass1('audio_acts', row);
         var dur = geByClass1('audio_duration', row);
         var info = null;
         try {
            info = JSON.parse(row.dataset["audio"]);
         } catch(e) {

         }
         if (!acts || !info) continue;
         var info_obj = AudioUtils.asObject(info);
         if (info_obj.url==""){                    // собираем очередь из аудио, которым требуется подгрузка инфы
            if (cache[info_obj.fullId])
               info_obj = cache[info_obj.fullId];
            else
               if (vkopt.audio.__load_queue.indexOf(info_obj.fullId) == -1 && vkopt.audio.__loading_queue.indexOf(info_obj.fullId) == -1)
                  vkopt.audio.__load_queue.push(info_obj.fullId);
         }
         var name = vkCleanFileName(info[4]+' - '+info[3]);
         var btn = se(
            vk_lib.tpl_process(vkopt.audio.tpls['dl_button'], {
               id: info_obj.fullId,
               filename: name+'.mp3',
               url: info_obj.url ? vkopt.audio.make_dl_url(info_obj.url, name) : ''
            })
         );

         if (!vkopt.settings.get('audio_dl_acts_2_btns') && vkopt.settings.get('audio_more_acts')){
            addClass(btn,'vk_audio_acts');
         }

         var acts_btn = se(
            vk_lib.tpl_process(vkopt.audio.tpls['acts_button'], {
               id: info_obj.fullId
            })
         );

         var size = vkopt.audio._sizes_cache[info_obj.id];
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
            if (info_obj.url)
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
         // Кнопка скачивания
         if (vkopt.settings.get('audio_dl') && !geByClass1('vk_audio_dl_btn',acts))
            (acts.firstChild && !vkopt.settings.get('audio_dl_acts_2_btns')) ? acts.insertBefore(btn, acts.firstChild) : acts.appendChild(btn);

         // Менюшка
          if ((!vkopt.settings.get('audio_dl') || vkopt.settings.get('audio_dl_acts_2_btns')) && vkopt.settings.get('audio_more_acts'))
             acts.firstChild ? acts.insertBefore(acts_btn, acts.firstChild) : acts.appendChild(acts_btn);
      }

      if (vkopt.settings.get('audio_size_info') || vkopt.settings.get('audio_dl')) // URL'ы нужны только для этих опций
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

      var aid = id.split('_')[1];
      var size = vkopt.audio._sizes_cache[aid];
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
            if (sz_info.kbps_raw > 0 && !vkopt.audio._sizes_cache[aid]){
               vkopt.audio._sizes_cache[aid] = size;
               vkopt.audio.save_sizes_cache();
            }
         }
      };
      if (size){
         set_size_info(size);
      } else
      if (els.length){
         var reset=setTimeout(function(){
            vkopt.audio.info_thread_count--;
            rb = false;
         }, WAIT_TIME);
         vkopt.audio.info_thread_count++;
         XFR.post(url, {}, function(h, size){
            clearTimeout(reset);
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
   __load_queue:[],
   __loading_queue:[],
   __load_req_num: 1,
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
                     vkopt.audio.__full_audio_info_cache[info.fullId] = info;
                     if (info.url)
                        vkopt.audio.load_size_info(info.fullId, info.url);
                  });
                  if (vkopt.audio.__load_queue.length > 0) // если в очереди есть аудио - продолжаем грузить
                     vkopt.audio.load_audio_urls();
               }
            }
         })
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
   prevent_play_check: function(){
      if (vkopt.audio.__play_blocked){
         vkopt.audio.__play_blocked = false;
         return true;
      }
      return false;
   },
   prevent_play: function(){
      vkopt.audio.__play_blocked = true;
   },
   acts: {
      menu : function (btn) {
         var audioRow = gpeByClass('_audio_row', btn);
         var info = AudioUtils.getAudioFromEl(audioRow);
         var info_obj = AudioUtils.asObject(info);
         var menu_code = vk_lib.tpl_process(vkopt.audio.tpls['acts_menu'], info_obj)

         var raw_list = vkopt_core.plugins.call_modules('onAudioRowMenuItems',info_obj); // собираем доп. пункты со всех плагинов в один список
         var additional_items = [];
         for (var plug_id in raw_list)
            additional_items = additional_items.concat(raw_list[plug_id]);

         menu_code += additional_items.join('\n');

         var options = {
            text : function () {
               return menu_code;
            },
            dir: "down",
            shift : [14, 5, 0],
            hasover: true,
            onCreate: function(){
               addClass(btn.tt.container, 'vk_acts_menu_block');
               addEvent(btn.tt.container, 'click', vkopt.audio.prevent_play);
               addEvent(btn.tt.container, 'mousedown', vkopt.audio.prevent_play);
               addEvent(btn.tt.container, 'mousedown', cancelEvent); // блочим перетаскивание за меню
            }
         };
         showTooltip(btn, options);
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
      }
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
   get_time:null,
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
         Inj.End('AudioPlayer.prototype.notify','vkopt.scrobbler.onPlayerNotify(#ARG0#, #ARG1#, #ARG2#)');
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
      var paused=false;
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
      paused=true;
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
            }
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
               url += '?'+data.replace(/%20/g, '+')
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
         vklog('scrobbler_error ['+code+']:'+message);
      }});
      fm.scrobled = true;
      fm.s_timer.kill();
      // show scrobble ok
   },
   now_playing: function(audio_info){
      var fm=vkopt.scrobbler;
      if (!fm.enable_scrobbling) return;
      if (!fm.session_key) {
         fm.auth(function(){fm.now_playing(audio_info)});
         return;
      }
      var fm=vkopt.scrobbler;
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
            vklog('last.fm error ['+code+']:'+message);
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
               vklog('last.fm error ['+code+']:'+message);
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
            var text=IDL(!hasClass(el,'loved')?'LastFMAddToLoved':'LastFMRemoveFromLoved');

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

     var wraps = geByClass('audio_page_player_volume_wrap');
     for (var i = 0; i < wraps.length; i++){
        var ap = wraps[i].firstChild;
        if (ap && !geByClass('lastfm_status',ap.parentNode)[0]){
            ap.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_audio_page'},controls),ap);
        }
     }

     var wraps = geByClass('top_audio_player_title_wrap');
     for (var i = 0; i < wraps.length; i++){
        var ap = wraps[i].firstChild;
        if (ap && !geByClass('lastfm_status',ap.parentNode)[0]){
            ap.parentNode.insertBefore(vkCe('div',{'class':'fl_r lastfm_white'},controls),ap);
        }
     }

     var els=geByClass('vk_lastfm_icon');
     for (var i=0; i<els.length;i++){
         els[i].onmouseover=
         (function(z){
            return function(){
               var text=IDL(fm.enable_scrobbling?'ScrobblingOn':'ScrobblingOff').replace(/<username>/g,fm.username);
               text+=' <a href="#" onclick="vkopt.scrobbler.logout();">'+IDL('Logout')+'</a>';
               if (!fm.username) text=IDL('AuthNeeded');
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
            fm.s_timer.reset();
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
                fm.s_timer.resume();
                fm.set_icon(info,'playing');          // animate scrobbler icon track
             }
            break;
         case 'pause':
            if (!fm.scrobled){
               if (!fm.s_timer)
                   fm.scrobble_timer(info);
               fm.s_timer.pause();
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
}

vkopt['audio_info'] = {
   onSettings:{
      Media:{
         audio_album_info: {
            title: 'seLoadAudioAlbumInfo'
         }
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

}

vkopt['audioplayer'] = {
   onSettings:{
      Extra:{
         add_to_next_fix: {},
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
      // багфикс: при добавлении инфы об аудио в виде объекта в плейлист, оно не добавляется. впихиваем костыль для конверта объекта в массив.
      if (vkopt.settings.get('add_to_next_fix'))
         Inj.Replace('AudioPlaylist.prototype.addAudio',/(([a-z_0-9]+)\.length)(\s*&&\s*([a-z_0-9]+)\(\2\))/,'($1$3) || ($2.fullId && $4(vkopt.audioplayer.audioObjToArr($2)))')

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
            cur_pl._restoreState(),
            AudioUtils.toggleAudioHQBodyClass(),
            cur_pl.updateCurrentPlaying()
         })
      }
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
         */
      }).css
   },
   onSettings:{
      Messages: {
         im_dialogs_right:{
            title: 'seDialogsListToRight',
            class_toggler: true
         }
      },
      Extra: {
         im_hide_dialogs:{
            class_toggler: true
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
   },
   onLocation: function(nav_obj, cur_module_name){
      if (!vkopt.settings.get('im_hide_dialogs'))
         return;
      vkopt.messages.dialogs_hide_init();
   },
   dialogs_hide_init: function(){
      if (nav.objLoc[0] != 'im')
         return;
      var dialogs  = geByClass1('im-page--dialogs');

      if (geByClass1('im-page--history_empty'))
         show(dialogs);

      !hasClass('im--page','vk_hide_dialogs_toggler') && addEvent('im--page','click',function(e){
         if (!vkopt.settings.get('im_hide_dialogs'))
            return;
         addClass('im--page','vk_hide_dialogs_toggler');
         if (domClosest('im-page--chat-body',e.target) || domClosest('im-page--chat-input',e.target))
            hide(dialogs)
         if (domClosest('im-page--header-chat',e.target))
            toggle(dialogs)
      });
   }
}

vkopt['attacher'] = {
   tpls: null,
   onSettings:{
      Extra: {
         attach_media_by_id:{}
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
      });
   },
   onResponseAnswer: function(answer, url, q){
      if (!vkopt.settings.get('attach_media_by_id'))
            return;
      if (url == '/audio' && q.act == 'a_choose_audio_box' && !q.q && (answer[2] || null).replace){
         if (answer[2].indexOf('vkopt.attacher.audio.check_query') == -1)
            answer[2] = answer[2].replace(/(cur\.onChangeAudioQuery\s*=\s*function[^\{]+\{([\r\n\s]*))/,'$1vkopt.attacher.audio.check_query(arguments[0]);$2');
            answer[2] = answer[2].replace(/(box\.hideCloseProgress\(\);)/,'$1\n   vkopt.attacher.audio.check_query(cur.chooseAudioQuery);');
      }
         /*
         setTimeout(function(){
            Inj.Start('cur.onChangeAudioQuery','vkopt.attacher.audio.check_query(arguments[0]);')
         });
         */
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
               };
            }
         };
         window.event = undefined;
         return false;
      }
   }

}

vkopt['face'] =  {
   onSettings:{
      Media:{
         compact_audio: {
            title: 'seCompactAudio',
            class_toggler: true
         },
         audio_full_title: {
            title: 'seAudioFullTitles',
            class_toggler: true
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
         .vk_compact_audio .audio_row{
            padding: 1px;
         }
         .vk_compact_audio .audio_row .audio_play {
            width: 18px;
            height: 18px;
            margin-top: 0px;
            background-position: 5px 4px;
         }
         .vk_compact_audio .audio_row .audio_play.playing, .vk_compact_audio .audio_row.audio_row_playing .audio_play {
            background-position: 5px -19px;
         }
         .vk_compact_audio .audio_row .audio_acts .audio_act{
            padding: 0px 6px;
         }
         .vk_compact_audio .audio_row .audio_acts {
            margin-top: 3px;
         }
         .vk_compact_audio .audio_row .audio_duration_wrap{
            line-height: 18px;
         }
         .vk_compact_audio .audio_row .audio_info{
            line-height: 17px;
            padding-top: 0px;
         }
         .vk_compact_audio .choose_audio_rows .choose_link {
            margin: 0px;
         }
         .vk_compact_audio .page_preview_audio_wrap .page_media_x_wrap {
            top: 0px;
         }
         .vk_audio_full_title .audio_row .audio_title_wrap {
            white-space: normal;
         }
         .vk_more_acts_icon{
            background: url(/images/icons/profile_dots.png) no-repeat 0 4px;
            height: 13px;
            width: 17px;
         }
         */
      });
      var progress_bar = vk_lib.get_block_comments(vkProgressBar).css;

      return codes.main + progress_bar;
   }
}

vkopt['profile'] = {
   tpls: null,
   rx_lnk_monthday:/c(?:%5B|\[)bday(?:%5D|\])=(\d+).+c(?:%5B|\[)bmonth(?:%5D|\])=(\d+)/,
   rx_lnk_year:/c(?:%5B|\[)byear(?:%5D|\])=(\d+)/,

   onSettings:{
      Users: {
         calc_age:{
            title: 'seCalcAge',
         }
      },
      Extra: {
         zodiak_ophiuchus:{}
      }
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
      });
   },
   processNode: function(node, params){
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
         box=new MessageBox({title: IDL('Scaning'),closeButton:true,width:"350px"});
         box.removeButtons();
         box.addButton(IDL('Cancel'),function(r){abort=true; box.hide();},'no');
      }
      var html='<div id="vk_scan_bar" style="padding-bottom:10px;">'+vkopt.res.img.ldr_big+'</div>';
      if (!ops.el) box.content(html).show();
      else ge(ops.el).innerHTML=vkopt.res.img.ldr;

      var fid=0;
      var scan=function(){
         ge(ops.el || 'vk_scan_bar').innerHTML=vkProgressBar(++step,8,(ops.width || 310),' %');
         mid = first + Math.floor( (last - first) / 2 );
         //callback(first + ';' + last + '-' + mid);
         ajax.post('/friends',{act:'filter_friends',al:1,city:0,sex:0,age_from:first,age_to:mid,uid:fid},{
            onDone:function(uids){
               x=inArr(uids,target_uid);
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
                	vkopt_core.timeout(scan,300);
                }

            }
         });
      };
      dApi.call('friends.get',{uid:target_uid,count:10},function(r){
         if (!r.response || !r.response[0]){
            alert('Sorry... Mission impossible...');
            if (!ops.el) box.hide();
            return;
         }
         if (vk_DEBUG) console.log('fid',r.response[0]);
         fid=r.response[0];
         scan();
      })
   }
}

vkopt['groups'] = {
   tpls:null,
   onInit: function(){
      vkopt.groups.tpls = vk_lib.get_block_comments(function(){
         /*wiki_list_btn:
         <a id="{vals.id}" onclick="vkWikiPagesList(); return false;">{lng.WikiPagesList}<span class="fl_r vk_ldr" id="vk_wiki_pages_list_loader" style="display:none;">'+vkLdrImg+'</span>'
         */
      });
   },
   wiki_list: function(){

   }
}

vkopt['wall'] = {
   onSettings:{
      vkInterface:{
         postpone_custom_interval:{
            title: 'sePostponeCustomInterval'
         }
      },
      Extra: {
         datepicker_inj:{}
      }
   },
   onLibFiles: function(file_name){

      /* Задача - хотим менять дефолтный интервал между создаваемыми отложенными постами.
      Вариант 1.
      if (file_name == 'ui_media_selector.js')
         Inj.Replace('MediaSelector',/\+\s*3600/g, ' + vkopt.wall.postponed.date_mod()') // заменяем то самое место, где захардкожен интервал.
      Но если обновить страницу, на которой стена, то фикс не применится, т.к медиаселектор создаёт свой экземпляр раньше, чем вкопт изменит его код.
      Поэтому будем править время уже в самом datepicker'е
      */
     if (file_name == 'datepicker.js' && vkopt.settings.get('datepicker_inj')){ // передаём в наш перехватчик id элемента в котром указана дата.
         //Inj.Start('Datepicker','vkopt.wall.postponed.datepicker(#ARG0#);'); // обломс. невозможно пересоздать так.
         if (!window.vkorigDatepicker ||  (window.Datepicker  && Datepicker.toString().indexOf('onDatepickerCreate') == -1)){
            window.vkorigDatepicker = window.Datepicker;
            window.Datepicker = function(el, options){
               // vkopt.wall.onLibFiles mod. Attach to this by event onDatepickerCreate
               var args = Array.prototype.slice.call(arguments);
               vkopt_core.plugins.call_modules('onDatepickerCreate', args);
               vkorigDatepicker.apply(this, args);
            }
         }
     }

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
         var interval = new_time - (pp_last_dt && (pp_last_dt > cur_dt) ? pp_last_dt : cur_dt)

         if (interval){


            // Вычисляем величину, на которую будем автоматически дополнять время таймера для нового поста
            vkopt.wall.postponed.additional_interval = interval - default_step
         }
      },
      date_mod: function(){
         //var hours = 3; // нужна опция выбора величины интервала между постами.
         return vkopt.wall.postponed.additional_interval;//hours * 60*60;
      }
   }

}

vkopt['support'] = {
   onSettings:{
      Extra: {
         stealth_addons:{}
      }
   },
   onRequestQuery: function(url, q, options){
      if (!vkopt.settings.get('stealth_addons')) return;
      if (q.act == "save" && q.audio_orig && q.audio_html)
         q.audio_html = q.audio_orig;
   }
}

/*
vkopt['test_module'] = {
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
}
//*/

/*
vkopt['test_module'] =  {
   id: 'test_module',
   // <core>
   onInit:                 '', //function(){},
   onLibFiles:             '', //function(file_name){},
   onLocation:             '', //function(nav_obj,cur_module_name){},
   onRequestQuery:         '', //function(url, query, options){}
   onResponseAnswer:       '', //function(answer,url,params){},
   onStorage :             '', //function(command_id,command_obj){},
   processNode:            '', //function(node, params){}
   processLinks:           '', //function(link, params){},
   onModuleDelayedInit:    '', //function(plugin_id){},
   onElementTooltipFirstTimeShow: '', //function(ett, ett_options)

   // <settings>
   onSettings:             '', //function(){} || {}
   onOptionChanged:        '', //function(option_id, val, option_data){},
   firstRun:               '', //function(){}

   // <audio>
   onAudioRowMenuItems: '', //function(audio_info_obj){},

   // <wall>
   onDatepickerCreate: '' //function(args){}
};

for (var call in vkopt.test_module) {
    if (vkopt.test_module.hasOwnProperty(call)) {
        vkopt.test_module[call] = function() {
            console.error(arguments.callee);
            console.log([...arguments]);
        }
        vkopt.test_module[call].displayName = call;
    }
}
// */

vkopt_core.init();
