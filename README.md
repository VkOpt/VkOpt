VkOpt
=====

VkOpt

```javascript
vkopt['vkopt_any_plugin'] = {
    // id: 'vkopt_any_plugin',
    // <core>
    onInit:               function(){},                         /* выполняется один раз после загрузки стрницы */
    onLibFiles:           function(file_name){},                /* место для инъекций, срабатывает при
                                                                   подключении нового js-файла движком контакта.*/
    onLocation:           function(nav_obj, cur_module_name){}, /* вызывается при переходе между страницами */
    onRequestQuery:       function(url, query, options){},      /* вызывается перед выполнением ajax.post метода.
                                                                   Если функция вернёт false, то запрос выполнен не будет. */
    onResponseAnswer:     function(answer,url,params){},        /* answer - массив, изменять только его элементы */
    onCmd:                function(command_obj){},              /* слушает сообщения отосланные из других
                                                                   вкладок вк через vkopt.cmd(command_obj) */
    processNode:          function(node, params){}              /* обработка элемента */
    processLinks:         function(link, params){},             /* обработка ссылки */
    onModuleDelayedInit:  function(plugin_id){},                /* реакция на подключение модуля, опоздавшего к загрузке страницы. */
    onElementTooltipFirstTimeShow: function(ett, ett_options){},/* реакция на первый показ ElementTooltip, при
                                                                   создании его контента. На момент вызова в элементе ett._ttel уже есть контент.
                                                                   По ett._opts.id можно определить к чему тултип относится. */
    onInlineDropdownCreate: function(el, options){},            /* реакция на создание контрола InlineDropdown.
                                                                   Можно использовать для добавления своих пунктов в options.items для меню элемента el */
    onDatepickerCreate:   function(args){},                     /* вызывается при создании селектора даты new Datepicker(),
                                                                   args - массив аргументов переданных в конструктор */
    css:                  function(){} || {},                   /* CSS модуля, автоматическм встраивается в страницу */

    // <settings>
    onSettings:           function(){} || {},                   /* возвращаем объект с перечисленными по категориям настройками этого модуля */
    onOptionChanged:      function(option_id, val, option_data){},/* реакция на изменение опции */
    firstRun:             function(){},                         /* вызывается при первом запуске (не найдены ранее прописанные настройки vkopt'a),
                                                                   P.S. вкопт из хранилища расширения восстанавливает
                                                                   только данные из своего конфига, если они были сохранены,
                                                                   тогда это первым запуском не считается, но в локальном
                                                                   хранилище могут отсутствовать данные от других модулей,
                                                                   хранящих инфу не через vkopt.settings.get | vkopt.settings.set */

    // <im>
    onImSend:             function(query){},                    /* вызывается перед отправкой личного сообщения.
                                                                   Если функция вернёт false, то сообщение не отправится. */
    /* onImReceive:       <not implemented yet> */

    // <audio>
    onAudioRowItems: function(audioEl, audioObject, audio){}      /* добавление кастомных кнопок-иконок (actions) и пунктов в доп. действия (more) для аудио
                                                                  результатом вызова функции должен быть объект вида {actions:[item1, item2, ...], more:[item1, item2, ...]}
                                                                  а каждый добавляемый пункт имеет вид массива с элементами:
                                                                  itemN = [
                                                                     id,                                    // id кнопки, добавляется к имени CSS-класса
                                                                     function(audioEl, audioObject, audio), // обработчик нажатия на кнопку
                                                                     html,                                  // внутреннее содержимое кнопки, для конопок-иконок обычно пустая строка
                                                                     attrs,                                 // строка с дополнительными атрибутами
                                                                     tagName                                // если требуется, чтоб тегом кнопки был не "div", а другой, то указывать тут.
                                                                  ]  */

   };
   ```
