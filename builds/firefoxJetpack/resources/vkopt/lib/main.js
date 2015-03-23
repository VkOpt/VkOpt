var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
//var {Cc, Ci} = require("chrome");

pageMod.PageMod({
  include: [ /.*vk\.com.*/ ],
  contentScriptFile: [ self.data.url("loader.js") ]
});

