// ==UserScript==
// @name          VKOpt Reloaded
// @version       {script_version}
// @author        xiadosw [id115860632]
// @description   VKOpt Reloaded 3.x
// @downloadUrl   https://raw.githubusercontent.com/xiadosw/VkOpt-Reloaded/master/builds/vkopt_script.user.js
// @updateUrl     https://raw.githubusercontent.com/xiadosw/VkOpt-Reloaded/master/builds/vkopt_script.meta.js
// @match       *://vkontakte.ru/*
// @match       *://*.vkontakte.ru/*
// @match       *://vk.com/*
// @match       *://*.vk.com/*
// @match       *://userapi.com/*
// @match       *://*.userapi.com/*
// @match       *://vk.me/*
// @match       *://*.vk.me/*
// @match       *://*.vkuseraudio.net/*
// @match       *://*.vkuservideo.net/*
// @connect     self
// @connect     vkontakte.ru
// @connect     vk.com
// @connect     userapi.com
// @connect     vk.me
// @connect     vkuseraudio.net
// @connect     vkuservideo.net
// @connect     vkopt.net
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==


(function(win, doc, code){
   var mark = 'vkopt_loader',
       __key = (Math.round(Math.random()*10000000)).toString(35);

   var ext_browser={
      mozilla:(function(){try{return !chrome && Components.interfaces.nsIObserverService!=null} catch(e){return false} })(),
      mozilla_jetpack: !!(typeof self != 'undefined' && self.port && self.port.emit && self.port.on),
      opera: !!(window.opera && opera.extension),
      webext: (function() { try { return !!chrome && !!chrome.extension } catch (e) {return false} })(),
      chrome: !!(window.chrome && chrome.extension),
      safari: !!(window.safari   && safari.self),
      maxthon: (function(){try{return window.external.mxGetRuntime!=null} catch(e){return false} })(), //without try{}catch it fail script on Firefox
      gm: (typeof GM_xmlhttpRequest != 'undefined') && {download: typeof GM_download != 'undefined'},
   };
   var ex_msg={
      init:function(handler){
         if (!doc.head){
            setTimeout(function(){
              ex_msg.init(handler);
            },10)
            return;
         }
         if (typeof CustomEvent != 'undefined'){
            win.addEventListener('vkopt_messaging_request', function(e) {
               handler(e.detail,function(data){
                  var data_obj = {data:data}
                  var response = new CustomEvent("vkopt_messaging_response",{detail:JSON.stringify(data_obj)});
                  win.dispatchEvent(response);
               });
            });
         } else {
             doc.addEventListener("vkopt_messaging_request", function(event) {
               var node = event.target;
               if (!node || node.nodeType != Node.TEXT_NODE)
                 return;

               var _doc = node.ownerDocument;
               handler(JSON.parse(node.nodeValue), function(response) {
                 node.nodeValue = JSON.stringify(response);
                 var event = _doc.createEvent("HTMLEvents");
                 event.initEvent("vkopt_messaging_response", true, false);
                 return node.dispatchEvent(event);
               });
             }, false, true);
         }
      }
   }
   var ex_loader = {
     get:function(key){
        try{
           return GM_getValue(key, null);
        } catch(e){
           console.error('GM_getValue error key:"'+key+'" ', e);
        }
     },
     set:function(key,value){
        GM_setValue(key, value);
     }
   }
   var ext_api={
      __key:(Math.round(Math.random()*10000000)).toString(35),
      ready:false,
      callbacks:{},
      cid:1,
      prepare_data:function(msg){
         msg = msg || {};
         msg.__key=ex_ldr.__key;
         msg._req=ext_api.cid++;
         return msg
      },
      post_message:function(data){console.log("can't post message to bg process",data)},
      init:function(win){
         ex_msg.init(ext_api.on_message);
      },
      /*
      message_handler:function(data){
         data = data || {};
         if (data && data._req && ext_api.callbacks['cb_'+data._req]){
            ext_api.callbacks['cb_'+data._req](data);
         } else {
            if (data._req) console.log('Response from bg:',data);
         }
      },*/
      on_message:function(e,send_response){ // FOR PAGE <-> CONTENT SCRIPT
         var res = e.data;
         //console.log('msg_get:',res);
         if (!res.act || res.mark!=mark) return;
         switch (res.act){
            case 'get':
            case 'post':
            case 'head':
            case 'ajax':

            case 'storage_get':
            case 'storage_set':
            case 'storage_keys':
            case 'storage_delete':
            case 'storage_clear':

            case 'download':
            case 'check_ext':
               ext_api.message_handler(res,function(data){
                  send_response(JSON.parse(JSON.stringify({response:data,sub:res._sub})));
               });
               break;
         }
      },
      // from bg part
      store_val_prefix: 'custval_',
      message_handler:function(data,send_response){
         //console.log('BG_GET:',data,send_response);
         switch(data.act){
            case 'check_ext':
               send_response({act:'get_response'});
               break;
            case 'get':
               ext_api.get(data.url,function(t,status){
                  send_response({act:'GET_response', response:t});
               });
               break;
            case 'post':
               ext_api.post(data.url,data.params,function(t,status){
                  send_response({act:'POST_response', response:t});
               });
               break;
            case 'head':
               ext_api.head(data.url,function(headers,status){
                  send_response({act:'POST_response', response:headers});
               });
               break;
            case 'ajax':
               ext_api.ajax(data.options,function(r){
                  /*
                     r.text      is xhr.responseText;
                     r.headers   is xhr.getAllResponseHeaders();
                     r.status    is xhr.status;
                        OR
                     r.error
                  */
                  send_response({act:'AJAX_response', response:r});
               });
               break;

            case 'storage_get':
               var prefix = data.reserved_access_allowed ? '' : ext_api.store_val_prefix;
               if (data.keys){
                  var vals={};
                  for (var i=0; i<data.keys.length; i++){
                     if (!ext_api.storage_is_allowed_key(data.keys[i]) && !data.reserved_access_allowed){
                        console.log('access to key ' + data.keys[i] + ' not allowed');
                        continue;
                     }
                     //console.log('key: ', data.keys[i], ex_loader.get(prefix+data.keys[i]));
                     vals[data.keys[i]] = ex_loader.get(prefix+data.keys[i]) || null;
                  }
                  send_response({act:'storage_value',values:vals});
               } else if(data.key){
                  if (ext_api.storage_is_allowed_key(data.key) || data.reserved_access_allowed){
                     send_response({act:'storage_value', key:data.key, value: ex_loader.get(prefix+data.key) || null  });
                  } else {
                     console.log('write access to key ' + data.key + ' not allowed');
                  }
               }
               break;
            case 'storage_set':
               var prefix = data.reserved_access_allowed ? '' : ext_api.store_val_prefix;
               if (data.values){
                  for (var key in data.values){
                     if (!ext_api.storage_is_allowed_key(key) && !data.reserved_access_allowed){
                        console.log('write access to key ' + key + ' not allowed');
                        continue;
                     }
                     ex_loader.set(prefix+key, data.values[key]);
                  }
               } else if(data.value && data.key){
                  if (ext_api.storage_is_allowed_key(data.key) || data.reserved_access_allowed){
                     ex_loader.set(prefix+data.key, data.value);
                  } else {
                     console.log('write access to key ' + data.key + ' not allowed');
                  }
               }
               send_response({act:'storage_set_ok'});
               break;
            case 'storage_keys':
               var i, keys, raw_keys = GM_listValues();
               for (i = 0; i < raw_keys.length; i++ )
                  if (ext_api.storage_is_allowed_key(raw_keys[i]) || data.reserved_access_allowed) // не нужно давать инфу о закэшированных скриптах
                     keys.push(raw_keys[i]);
               send_response({act:'storage_obj_keys',keys:keys});
               break;
            case 'storage_delete':
               if (data.keys){
                  var vals={};
                  for (var i=0; i<data.keys.length; i++){
                     if (!ext_api.storage_is_allowed_key(data.keys[i]) || data.reserved_access_allowed){
                        console.log('access to key ' + data.keys[i] + ' not allowed');
                        continue;
                     }
                    GM_deleteValue(data.keys[i]);
                  }
                  send_response({act:'storage_delete_keys'});
               } else if(data.key){
                  if (ext_api.storage_is_allowed_key(data.key)  || data.reserved_access_allowed){
                     GM_deleteValue(data.key);
                     send_response({act:'storage_delete_key'});
                  } else {
                     console.log('write access to key ' + data.key + ' not allowed');
                  }
               }
               break;
            case 'storage_clear':
               var i, keys = GM_listValues();
               for (i = 0; i < keys.length; i++ )
                  if (ext_api.storage_is_allowed_key(keys[i]) || data.reserved_access_allowed) // не нужно удалять закэшированные скрипты
                     GM_deleteValue(keys[i]);
               break;

            case 'download':
               GM_download(data.url,data.name)
               break;
            default: if (send_response) send_response({act:'extension bg default response',msg:data, __key:data.__key});
         }
      },
      storage_is_allowed_key:function(key){
         if (['scripts_config','scripts_config_hash'].indexOf(key)>-1)
            return false;
         if (/\.(js|css)$/.test(key))
            return false;
         return true;
      },
      ajax:function(options,callback){
         /*
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
             for (var key in obj)
                 return false;
             return true;
         },
         method = options.method || 'GET',
         params = serialize(options.params || {}),
         headers = options.headers || {},
         data = options.data || null,
         url = options.url || '',
         responseType = options.responseType || '',
         contentType = headers['Content-type'] || 'application/x-www-form-urlencoded';
         if (!headers['Content-type'])
             headers['Content-type'] = contentType;

         if (data && (typeof data == 'object') && isEmptyObject(data))
             data = null;
         if (data && (typeof data == 'object') && Object.prototype.toString.call(data) !== '[object Array]')
             data = serialize(data);

         if (~contentType.indexOf('multipart/form-data') && method == 'POST' && data && data.length) {
             var buffer = new Uint8Array(data.length);
             for (var i = 0; i < data.length; i++) {
                 buffer[i] = data[i];
             }
             data = buffer.buffer;
         }
         if (params)
             url += ~url.indexOf('?') ? '&' + params : '?' + params;

         var opts = {
             method: method,
             url: url,
             headers: headers,
             data: data,
             binary: !(typeof data == 'string'),
             onload: function (xhr) {
                 var response = {};
                 if (!responseType || responseType == 'text')
                     response.text = xhr.responseText;
                 response.headers = xhr.responseHeaders;
                 response.status = xhr.status;
                 response.raw = (responseType == 'arraybuffer' ? [].slice.call(new Uint8Array(xhr.response)) : xhr.response);
                 callback(response);
             }
         }
         if (responseType)
             opts.responseType = responseType;
         try {
             var gxhr = GM_xmlhttpRequest(opts);
         } catch (e) {
             console.log('XHR ERROR', e);
             callback({
                 error: e
             });
         }
         },
      get:function(url,params,callback){
         if (!callback){
            callback=params;
            params=null;
         }
         ext_api.ajax({url:url, params:params, method:'GET'},function(r){
            callback(r.text,r.status);
         })
      },
      post:function(url,params,callback){
         ext_api.ajax({url:url, data:params, method:'POST'},function(r){
            callback(r.text,r.status);
         })
      },
      head:function(url, callback){
         ext_api.ajax({url:url, method:'HEAD'},function(r){
            callback(r.headers,r.status);
         })
      }


   };

   ext_api.init(win);
   var init = function(){
      if (!doc.getElementsByTagName("head")[0]){
         setTimeout(init,10);
         return;
      }

      ext_api.ready=true;
      ext_api.post_message=function(msg){
         msg=ext_api.prepare_data(msg);
         opera.extension.postMessage(msg);
         return msg;
      }

      var script = " window._ext_ldr_"+mark+"=true;\n window._"+mark+"_browser = "+ JSON.stringify(ext_browser) +";\n" + code;
      var js = doc.createElement('script');
      js.type = 'text/javascript';
      js.charset = 'UTF-8';
      js.innerHTML=script;
      js.setAttribute(mark,"{script_version}");
      doc.getElementsByTagName('head')[0].appendChild(js);
   }
   init();
})(unsafeWindow, document, (function(){
   var target_script = function(){
{script_content}
   };
   var code = target_script.toString().match(/^.+?\{([\s\S]+)\}$/)[1];
   return code
})());