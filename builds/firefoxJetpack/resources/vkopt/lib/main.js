var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var {Cc, Ci, Cu} = require("chrome");

pageMod.PageMod({
    include: [ "*.vkontakte.ru", "*.vk.com" ],
    exclude: /.*notifier\.php|.*im_frame\.php/i,
    contentScriptFile: [self.data.url("content_script.js"), self.data.url("background.js")],
    contentScriptWhen: "start",
    onAttach: function(worker) {
        worker.port.on("download", function(url, name) {
            downloadFile(url, name);
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

