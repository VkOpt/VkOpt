
       );
}
function isVKDomain(domain){return (domain.match('vkontakte.ru') || domain.match('vk.com') || domain.match('youtube.com'));}
window.addEventListener('load',VkOpt_Loader, false);



var vkMozExtension = {  
  listen_request: function(callback) { // analogue of chrome.extension.onRequest.addListener  
    return document.addEventListener("mozext-query", function(event) {  
      var node = event.target, doc = node.ownerDocument;  
  
      return callback(node.getUserData("data"), doc, function(data) {  
        if (!node.getUserData("callback")) {  
          return doc.documentElement.removeChild(node);  
        }  
  
        node.setUserData("response", data, null);  
  
        var listener = doc.createEvent("HTMLEvents");  
        listener.initEvent("mozext-response", true, false);  
        return node.dispatchEvent(listener);  
      });  
    }, false, true);  
  },  
  
  callback: function(request, sender, callback) {  
    if (request.download) {  
      vkDownloadFile(request.url,request.name);
      return setTimeout(function() {  
         callback({ok: 1});  
      }, 1000);  
    }
    return callback(null);  
    }  
}  
vkMozExtension.listen_request(vkMozExtension.callback); 

function vkDownloadFile(aURL, aDefaultFileName, aContentType, aShouldBypassCache, aFilePickerTitleKey, aSkipPrompt) {
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
   persist.persistFlags = flags;
   if (aShouldBypassCache) {
      persist.persistFlags |= nsIWBP.PERSIST_FLAGS_BYPASS_CACHE;
   }
   persist.persistFlags |= nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
   persist.persistFlags |= nsIWBP.PERSIST_FLAGS_DONT_CHANGE_FILENAMES
   var tr = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
   tr.init(source, fileURL, "", null, null, null, persist);
   persist.progressListener = tr;
   persist.saveURI(source, null, null, null, null, fileURL);
}