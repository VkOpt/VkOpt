var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
//var {Cc, Ci} = require("chrome");

pageMod.PageMod({
    include: [ "*.vkontakte.ru", "*.vk.com" ],
    exclude: /.*notifier\.php|.*im_frame\.php/i,
    contentScriptFile: self.data.url("loader.js"),
    contentScriptWhen: "ready"
});

