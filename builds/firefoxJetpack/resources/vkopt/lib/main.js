var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var {Cc, Ci, Cu} = require("chrome");
const {XMLHttpRequest} = require("sdk/net/xhr");

pageMod.PageMod({
    include: ["*.vkontakte.ru", "*.vk.com"],
    exclude: /.*notifier\.php|.*im_frame\.php/i,
    contentScriptFile: [self.data.url("content_script.js"), self.data.url("background.js")],
    contentScriptWhen: "start",
    onAttach: function (worker) {
        worker.port.on("download", downloadFile);
        worker.port.on("ajax", function (options) {
            Ajax(options, worker);
        });
    }
});

Cu.import("resource://gre/modules/Downloads.jsm");
Cu.import("resource://gre/modules/Task.jsm");

function downloadFile(url, name) {
    // Показ диалогового окна выбора пути для сохранения файла
    var nsIFilePicker = Ci.nsIFilePicker;
    var fp = Cc["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var window = require("sdk/window/utils").getMostRecentBrowserWindow();
    fp.init(window, "Save As", nsIFilePicker.modeSave);
    fp.defaultString = name;
    var fileType = name.substr(name.lastIndexOf(".") + 1, 3);
    fp.appendFilter(fileType, "*." + fileType);
    var rv = fp.show();
    if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
        // Добавление закачки в менеджер закачек
        Task.spawn(function () {
            try {
                let list = yield Downloads.getList(Downloads.ALL);
                let download = yield Downloads.createDownload({
                    source: url,
                    target: fp.file
                });
                yield list.add(download);
                yield download.start();
            } catch (e) {
                console.error(e);
            }
        }).then(null, Cu.reportError);
    }
}

function Ajax(options, worker) {
    function callback(obj) {
        worker.port.emit("ajax_response", obj);
    }

    /* Копипаста из background.js:596
     options={
     url
     method:  POST | GET | HEAD
     data  :  POST data
     params:  GET params
     headers: if headers['Content-type']=='multipart/form-data'  use data as Uint8Array
     }
     */
    if (!options.url || (options.url || '').replace(/^\s+|\s+$/g, '') == '') {
        var response = {};
        response.text = '';
        response.headers = '';
        response.status = 0;
        response.error = 'No URL';
        callback(response);
        return;
    }
    var serialize = function (obj) {
        var pairs = [];
        for (var key in obj) {
            pairs.push(encodeURIComponent(key)
            + '=' + encodeURIComponent(obj[key]));
        }
        return pairs.join('&');
    };
    var isEmptyObject = function (obj) {
        for (var key in obj) return false;
        return true;
    };
    var xhr = new XMLHttpRequest(),
        method = options.method || 'GET',
        params = serialize(options.params || {}),
        headers = options.headers || {},
        data = options.data || null,
        url = options.url || '',
        responseType = options.responseType,
        contentType = headers['Content-type'] || 'application/x-www-form-urlencoded';
    if (!headers['Content-type'])
        headers['Content-type'] = contentType;

    if (data && (typeof data == 'object') && isEmptyObject(data)) data = null;
    if (data && (typeof data == 'object')) data = serialize(data);

    if (~contentType.indexOf('multipart/form-data') && method == 'POST' && data && data.length) {
        var buffer = new Uint8Array(data.length);
        for (var i = 0; i < data.length; i++) {
            buffer[i] = data[i];
        }
        data = buffer.buffer;
    }
    if (params)
        url += ~url.indexOf('?') ? '&' + params : '?' + params;
    try {
        xhr.open(method, url, true);
        for (var i in headers) {
            xhr.setRequestHeader(i, headers[i]);
        }
        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var response = {};
                if (!responseType || responseType == 'text') response.text = xhr.responseText;
                response.headers = xhr.getAllResponseHeaders();
                response.status = xhr.status;
                response.raw = (responseType == 'arraybuffer' ? [].slice.call(new Uint8Array(xhr.response)) : xhr.response);
                callback(response);
            }
        };
        xhr.send(data);
    } catch (e) {
        console.log('XHR ERROR', e);
        callback({
            error: e
        });
    }
}
