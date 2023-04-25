# VkOpt Reloaded

VkOpt — браузерное расширение для [ВКонтакте](https://vk.com). Присутствует возможность создавать свои модули, используя возможности расширения, и подключать их как userscript.

## Установка
1. Установка расширения [Tampermonkey (Chrome)](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
2. Добавление user-script по ссылке: <https://raw.githubusercontent.com/xiadosw/VKOpt-Reloaded/master/builds/vkopt_script.user.js>

Краткое описание доступных для модулей обработчиков, вызов которых инициируется расширением в ответ на какие-то действия/события на сайте

```javascript
window.vkopt = (window.vkopt || {});
vkopt['vkopt_any_plugin'] = {
    // id: 'vkopt_any_plugin',

    // <core>
    /*  выполняется один раз после загрузки страницы */
    onInit:               function() {},
    /*  место для инъекций, срабатывает при
        подключении нового js-файла движком ВК.*/
    onLibFiles:           function(file_name) {},
    /*  вызывается при переходе между страницами */
    onLocation:           function(nav_obj, cur_module_name) {},
    /*  вызывается перед выполнением ajax.post метода.
        Если функция вернёт false, то запрос выполнен не будет. */
    onRequestQuery:       function(url, query, options) {},
    /*  answer — массив, изменять только его элементы */
    onResponseAnswer:     function(answer, url, params) {},
    /*  слушает сообщения, отосланные из других
        вкладок ВК через vkopt.cmd(command_obj) */
    onCmd:                function(command_obj) {},
    /* обработка элемента */
    processNode:          function(node, params) {},
    /* обработка ссылки */
    processLinks:         function(link, params) {},
    /* реакция на подключение модуля, опоздавшего к загрузке страницы. */
    onModuleDelayedInit:  function(plugin_id) {},
    /*  реакция на первый показ ElementTooltip, при создании его контента.
        На момент вызова в элементе ett._ttel уже есть контент.
        По ett._opts.id можно определить к чему тултип относится. */
    onElementTooltipFirstTimeShow: function(ett, ett_options){},
    /*  вызывается при создании селектора даты new Datepicker(),
        args - массив аргументов переданных в конструктор */
    onDatepickerCreate:   function(args){},
    /*  CSS модуля, автоматически встраивается в страницу */
    css:                  function() {} || {},

    // <settings>
    /*  возвращаем объект с перечисленными по категориям настройками этого модуля */
    onSettings:           function() {} || {},
    /*  реакция на изменение опции */
    onOptionChanged:      function(option_id, val, option_data){},
    /*  вызывается при первом запуске (не найдены ранее прописанные настройки vkopt'a),
        P.S. вкопт из хранилища расширения восстанавливает
        только данные из своего конфига, если они были сохранены,
        тогда это первым запуском не считается, но в локальном
        хранилище могут отсутствовать данные от других модулей,
        хранящих инфу не через vkopt.settings.get | vkopt.settings.set */
    firstRun:             function() {},

    // <im>
    /*  вызывается перед отправкой личного сообщения.
        Если функция вернёт false, то сообщение не отправится. */
    onImSend:             function(query) {},

    // <audio>
    /*  добавление кастомных кнопок-иконок (actions)
        и пунктов в доп. действия (more) для аудио
        результатом вызова функции должен быть объект вида
        {actions:[item1, item2, ...], more:[item1, item2, ...]}
        а каждый добавляемый пункт имеет вид массива с элементами:
        itemN = [
            id,                                    // id кнопки, добавляется к имени CSS-класса
            function(audioEl, audioObject, audio), // обработчик нажатия на кнопку
            html,                                  // внутреннее содержимое кнопки, для конопок-иконок обычно пустая строка
            attrs,                                 // строка с дополнительными атрибутами
            tagName                                // если требуется, чтоб тегом кнопки был не "div", а другой, то указывать тут.
        ]  */
    onAudioRowItems: function(audioEl, audioObject, audio) {}

    // <photos>
    /* добавление пунктов в меню действий с альбомом
       результатом вызова функции должен быть массив с объектами, которые могут содержать поля:
       {
         href:       ссылка
         item_class: доп. CSS-класс,
         onclick:    строка или функция обработчик,
         attrs:      доп. HTML атрибуты тега пункта,
         text:       название пункта
       }
       aid может быть как числовым, так и вида "tag", "photos", "00", "000"
    */
    onPhotoAlbumItems:    function(aid, oid){}

    // <groups>
    /* добавление пунктов в меню действий на главной странице группы
       результатом вызова функции должен быть массив с объектами, которые могут содержать поля:
       {
         href:       ссылка
         item_class: доп. CSS-класс,
         onclick:    строка или функция обработчик,
         attrs:      доп. HTML атрибуты тега пункта,
         text:       название пункта
       }
       aid может быть как числовым, так и вида "tag", "photos", "00", "000"
    */
    onGroupActionItems:    function(oid, gid){}
};

// запускает модуль. Если мы опоздали к загрузке страницы, провоцирует вызов события onModuleDelayedInit
if (window.vkopt_core_ready) vkopt_core.plugins.delayed_run('vkopt_any_plugin');
```
