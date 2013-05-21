var vkopt_scripts=[
    "vklang.js",
	"vk_lib.js", 
	"vk_settings.js",
   "vk_media.js",
	"vk_users.js",
	"vk_face.js",
	"vk_page.js",
	"vk_skinman.js",
	"vk_txtedit.js",
	"vk_main.js",
	"vk_resources.js",	
    "vkopt.js"
];
function isVKDomain(domain){
   return ((domain || "").match(/vk\.com|vkontakte\.ru|userapi\.com|vk\.me|youtube\.com|vimeo\.com/));
}
(function(){
var loader={
   init:function(){
      loader.moz_ldr(function(doc,win){
        win.console.log('vkopt loader...');
        if (!doc || !isVKDomain(doc.location.href)) return;
        win.console.log('vkopt loader start');
        if (doc.getElementById('vkopt_inited')) return;
        for (var i=0;i<vkopt_scripts.length;i++){
          var js = doc.createElement('script');
          js.type = 'text/javascript';
          js.src =  'resource://vkopt/'+vkopt_scripts[i];
          if (i==(vkopt_scripts.length-1))
            js.id='vkopt_inited';
          doc.getElementsByTagName('head')[0].appendChild(js);
        }
      });
   },
   moz_ldr:function(callback){
      var srv={
         observe:function(aSubject, aTopic, aData) {
           switch (aTopic) {
             case 'document-element-inserted':
               var doc = aSubject;
               if (null === doc.location) break;
               var win = doc.defaultView;
               callback(doc,win);
               break;
           }
         }
      };
      var observerService = Components.classes['@mozilla.org/observer-service;1']
        .getService(Components.interfaces.nsIObserverService);
      observerService.addObserver(srv, 'document-element-inserted', false);
   }
}
loader.init();
})();

var vkMozExtension = {
   listen_request: function (callback) { // analogue of chrome.extension.onRequest.addListener  
      var set_data = function (el, field, data) {
         if(el.dataset) {
            el.dataset[field] = JSON.stringify(data);
         } else {
            el.setUserData(field, data, null);
         }
      }
      var get_data = function (el, field) {
         if(el.dataset) {
            return JSON.parse(el.dataset[field]);
         } else {
            return el.getUserData(field);
         }
      }
      return document.addEventListener("mozext-query", function (event) {
         var node = event.target,
            doc = node.ownerDocument;
         return callback(get_data(node, "data"), doc, function (data) {
            if(!get_data(node, "callback")) {
               return doc.documentElement.removeChild(node);
            }
            set_data(node, "response", data)
            var listener = doc.createEvent("HTMLEvents");
            listener.initEvent("mozext-response", true, false);
            return node.dispatchEvent(listener);
         });
      }, false, true);
   },
   callback: function (request, sender, callback) {
      if(request.download) {
         vkDownloadFile(sender.defaultView, request.url, request.name);
         return setTimeout(function () {
            callback({
               ok: 1
            });
         }, 1000);
      }
      return callback(null);
   }
}
vkMozExtension.listen_request(vkMozExtension.callback);


try {// Firefox 18+
  Cu.import("resource://gre/modules/PrivateBrowsingUtils.jsm");
} catch (e) {
  // old Firefox versions (e.g. 3.6) didn't have PrivateBrowsingUtils.
}

function vkDownloadFile(win,aURL, aDefaultFileName, aContentType, aShouldBypassCache, aFilePickerTitleKey, aSkipPrompt) {
  if (aSkipPrompt == undefined) aSkipPrompt = false;
   var file, fileURL;
   var fileInfo = new FileInfo(aDefaultFileName);
   initFileInfo(fileInfo, aURL, null, null, aContentType, null);
   fileInfo.fileName = aDefaultFileName;
   fileInfo.fileBaseName = aDefaultFileName.substr(0, aDefaultFileName.lastIndexOf(".") - 1);
   fileInfo.fileExt = aDefaultFileName.substr(aDefaultFileName.lastIndexOf(".") + 1);
   var fpParams = {
      fpTitleKey: aFilePickerTitleKey,
      isDocument: false,
      fileInfo: fileInfo,
      contentType: aContentType,
      saveMode: 0x00,
      saveAsType : 0,
      file: file,
      fileURL: fileURL
   };
   if (!getTargetFile(fpParams, aSkipPrompt)) return;
   saveAsType = fpParams.saveAsType;
   saveMode = fpParams.saveMode;
   file = fpParams.file;
   fileURL = fpParams.fileURL;
   if (!fileURL) fileURL = makeFileURI(file);
   var source = fileInfo.uri;
   var persist = makeWebBrowserPersist();
   const nsIWBP = Components.interfaces.nsIWebBrowserPersist;
   const flags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
   
   if (win && "undefined" != typeof(PrivateBrowsingUtils) && PrivateBrowsingUtils.privacyContextFromWindow) {
      var privacyContext = PrivateBrowsingUtils.privacyContextFromWindow(win);
      var isPrivate = privacyContext.usePrivateBrowsing;
   } else {
      // older than Firefox 19 or couldn't get window.
      var privacyContext = null;
      var isPrivate = false;
   }
   
   
   persist.persistFlags = flags;
   if (aShouldBypassCache) {
      persist.persistFlags |= nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;
   }
   persist.persistFlags |= nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
   persist.persistFlags |= nsIWBP.PERSIST_FLAGS_DONT_CHANGE_FILENAMES
   var tr = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
   tr.init(source, fileURL, "", null, null, null, persist, isPrivate);
   persist.progressListener = tr;
   persist.saveURI(source, null, null, null, null, fileURL, privacyContext);
}