(function(){
if (typeof console == 'undefined' || !(console || {}).log || !(console || {}).info)
   var console = {
      log:function(){},
      info:function(){},
      error:function(){}
   };
   
var ex_loader = {
   type:'internal', // internal|beta|online
   base_path: 'http://vkopt.net/upd/',
   config_url:'http://vkopt.net/upd/upd/config.json',
   scripts_path:'http://vkopt.net/upd/scripts/',
   beta_path: 'https://raw.githubusercontent.com/VkOpt/VkOpt/master/source/',

   mark:'vkopt_loader',
   packed_scripts:[
      {
         "in_frames":1,
         "run_at":0,
         "files":[
            "vkopt.js",
            "vk_face.js",
            "vk_lib.js",
            "vk_main.js",
            "vk_media.js",
            "vk_page.js",
            "vk_resources.js",
            "vk_settings.js",
            "vk_skinman.js",
            "vk_txtedit.js",
            "vk_users.js",
            "vklang.js"
         ],
         "domain":"vkontakte\\.ru|vk\\.com",
         "exclude":"|notifier\\.php|im_frame\\.php|about:blank|i",
         "api_enabled":true
      },
      {
         "files":["vk_lib.js"],
         "domain":"vkontakte\\.ru|vk\\.com|vk\\.me|userapi\\.com",
         "exclude":"|notifier\\.php|im_frame\\.php|about:blank|i"
      }      
   ],
   config:[ //Default config; example; overwritten;
      {
         "in_frames":1, // 0 or null - execute in all; 1 - exclude frames; 2 - only in frames; 3 - disable scripts
         "run_at":0, //0 - start or 1 - dom_content_loaded
         "files":[  //Scripts list
            //"script1.js",
            //"script2.js"
         ],
         "domain":"example\\.com",
         "exclude":"|notifier\.php|im_frame\.php|about:blank|i", // RegEx "|pattern|flags" for excluding urls
         "api_enabled":true
      }    
   ],
   update_time: 10*60*1000, //update scripts each 4 hours
   moz_strorage_id:"http://vkopt.loader.storage",
   browsers:{
      mozilla:(function(){try{return Components.interfaces.nsIObserverService!=null} catch(e){return false} })(),
      opera: window.opera && opera.extension,
      chrome: window.chrome && chrome.extension,
      safari: window.safari && safari.extension,
      maxthon: (function(){try{return window.external.mxGetRuntime!=null} catch(e){return false} })() //without try{}catch it fail script on Firefox
   },
   get_script_path:function(filename){
      var spath='';
      if (filename.match(/^https?:\/\//)) return filename;
      var b = ex_loader.browsers;
      switch (ex_loader.type){
         case 'internal': //
            if (b.opera) spath='scripts/'+filename;
            else if (b.chrome) spath=chrome.extension.getURL('scripts/'+filename);
            else if (b.safari) spath=safari.extension.baseURI+'scripts/'+filename;
            else if (b.mozilla)
                if (!Components.classes) // Firefox Jetpack
                    spath = 'resource://vkopt-at-vkopt-dot-net/vkopt/data/scripts/' + filename;
                else
                    spath = 'resource://vkopt/' + filename;
            break;
         case 'beta':
            spath= (ex_loader.beta_path.match(/^https?:\/\//)?'':ex_loader.base_path)+ex_loader.beta_path+filename;
            break;
         case 'online':
            spath=(ex_loader.scripts_path.match(/^https?:\/\//)?'':ex_loader.base_path)+ex_loader.scripts_path+filename;
            break;
         default:
            spath=(ex_loader.scripts_path.match(/^https?:\/\//)?'':ex_loader.base_path)+ex_loader.scripts_path+filename;
      }
      //console.log(filename,spath);
      return spath;
      //var src=(filename.match(/https?:\/\//))?filename:spath+filename;
      //filename:ex_loader.base_path+ex_loader.scripts_path+filename
      
   },
   init:function(){
      var b = ex_loader.browsers;   
      
      if (ex_loader.type=='internal' && b.maxthon){         // MAXTHON
         ex_loader.type='online';        // Maxthon 4 doesn't support inject scripts from internal resources
      }
      
      ex_loader.init_config();
      
      if (b.opera){                                   // OPERA
         opera.extension.onconnect = function(event)  {
            ext_api.ready=true;
            event.source.postMessage({act:'connected'}); 
         };
         opera.extension.onmessage = function(event) {
           var data = event.data;
           if (data.act=='get_scripts'){
               ex_loader.get_scripts(data.url,function(files,api_allowed){
                  event.source.postMessage({files:files, api_enabled:api_allowed,key:data.key});
               },data.in_frame);           
           }
           
            var SendResponse=function(msg){
                  msg.key = data.key;
                  msg._req=data._req;
                  event.source.postMessage(msg);
            };
            ext_api.message_handler(data,SendResponse);
         };
         
      } else if (b.chrome){                          // CHROME         
         ext_api.ready=true;
         chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
            // request.url - contain url
            if (request.act=='get_scripts' && request.url){
               ex_loader.get_scripts(request.url,function(files,api_allowed){
                  //console.log({url: request.url, inframe: request.in_frame, files:files});
                  sendResponse({files:files, api_enabled:api_allowed, key:request.key});
               },request.in_frame);           
               return;
            }
            // FOR API
            var SendResp=function(data){
               data.key = request.key;
               data._req= request._req;
               sendResponse(data);
            };
            ext_api.message_handler(request,SendResp);            
            
         });         
      } else if(b.safari){                         // SAFARI
         safari.application.addEventListener("message", function(e) {
            // e.message.url - contain url
            if (e.name === "get_scripts"){
               ex_loader.get_scripts(e.message.url,function(files,api_allowed){
                  e.target.page.dispatchMessage("scripts", {files:files, api_enabled:api_allowed,key:e.message.key});
               },e.message.in_frame);
               
            }

            var SendResponse=function(msg){
                  msg.key = e.message.key;
                  msg._req= e.message._req;
                  e.target.page.dispatchMessage('extension_api',msg);
            };
            ext_api.message_handler(e.message,SendResponse);
            
         }, false);
         ext_api.ready=true;
         
      } else if (b.maxthon){         // MAXTHON
            var rt = window.external.mxGetRuntime();            
            rt.listen('get_scripts', function(data){
               ex_loader.get_scripts(data.url,function(files,api_allowed){
                  rt.post('scripts',{files:files, api_enabled:api_allowed,key:data.key});
               },data.in_frame);               
            });
            
            //console.log('Init api listeners');
            rt = window.external.mxGetRuntime();
            rt.listen('extension_bg_api', function(data){
               var SendResponse=function(msg){
                  msg.key = data.key;
                  msg._req= data._req;
                  rt.post('extension_api',msg);
               };
               ext_api.message_handler(data,SendResponse);
            });     
            ext_api.ready=true;   
            
      } else if (b.mozilla){                // MOZILLA 
         ex_loader.moz_ldr(function(doc,win){
               var bg={
                  get_scripts:ex_loader.get_scripts,
                  postMessage:function(data,callback){
                     var SendResponse=function(msg){
                        msg.key = data.key;
                        msg._req= data._req;
                        callback(msg);
                     };
                     ext_api.message_handler(data,SendResponse,{win:win,doc:doc,mozilla:1});
                  }
               };
               vkopt_ldr_init_content_script(win, doc, bg);
         });
      }
      setInterval(function(){ //Run update checker
         //ex_loader.update_config();
         ex_loader.init_config();      
      },ex_loader.update_time);
   },
   moz_ldr:function(callback){
       if (!Components.classes) // Firefox Jetpack
           callback(document, document.defaultView);
       else {
           var srv = {
               observe: function (aSubject, aTopic, aData) {
                   switch (aTopic) {
                       case 'document-element-inserted':
                           var doc = aSubject;
                           if (null === doc.location) break;
                           var win = doc.defaultView;
                           callback(doc, win);
                           break;
                   }
               }
           };
           var observerService = Components.classes['@mozilla.org/observer-service;1']
               .getService(Components.interfaces.nsIObserverService);
           observerService.addObserver(srv, 'document-element-inserted', false);
       }
   },
   is_packed_available:function(){
      return !((window.external && window.external.mxGetRuntime) || ex_loader.online_update);         // MAXTHON
   },
   is_allow_run:function(in_frames,doc,in_frame){
      in_frames = in_frames || 0;
      var inframe=(in_frame!=null)?in_frame:((doc || document).defaultView.parent != (doc || document).defaultView);
      switch (in_frames){ // 0 or null - execute in all; 1 - exclude frames; 2 - only in frames; 3 - disable scripts
         case 0: 
            return true; // include all
         case 1: 
            return inframe?false:true; // exclude frames
         case 2:
            return inframe?true:false; // only in frames
         case 3:
            return false;  // disable scripts
      }
      return true;      
   },
   update_all:function(callback){
      ex_loader.set('scripts_config_hash',Math.random());
      ex_loader.update_config(function(){ex_loader.init_config(callback);},true);   
   },
   get_scripts:function(url,callback,in_frame){
      var api_allowed = false;
      var domain=url;
      if (url=='about:'+'blank'){    // AMO folly
         callback([]);
         return;
      }
      if (domain.indexOf('/')!=-1) domain=domain.split('/')[2];
      console.info('ext_bg: get_scripts ',domain);
      var data=ex_loader.config;//ex_loader.packed_scripts
      var scripts=[];
      for (var i=0; i<data.length;i++){
         var rx=data[i].domain;
         var x=rx.match(/^\|(.+)\|([a-z]*)$/);  // parse regex  "|^http://ya\\.ru|i"
         if (x){
            rx=new RegExp(x[1],x[2]);
         }
         
         var allow=true;
         var exclude_rx=data[i].exclude;
         if (exclude_rx){
            x=exclude_rx.match(/^\|(.+)\|([a-z]*)$/);  // parse regex  "|^http://ya\\.ru|i"
            if (x){
               exclude_rx=new RegExp(x[1],x[2]);
            }
            if (url.match(exclude_rx))
               allow=false;
            
         }
         
         if (allow && in_frame!=null) allow=ex_loader.is_allow_run(data[i].in_frames,null,in_frame);

         if (url.match(rx) && allow)
            for (var j=0;j<data[i].files.length;j++){
               var src=ex_loader.get_script_path(data[i].files[j]);//(data[i].files[j].match(/^https?:\/\//))?data[i].files[j]:ex_loader.base_path+ex_loader.scripts_path+data[i].files[j];
               if (data[i].api_enabled){
                  api_allowed = true;
               }
               var add=true;
               for (var z=0; z<scripts.length; z++) if (scripts[z][0]==src){
                  add=false;
                  if (scripts[z][1]!=data[i].in_frames){
                     if (scripts[z][1]>0 && !data[i].in_frames){//0 or null - execute in all; 1 - exclude frames; 2 - only in frames
                        scripts[z][1]=data[i].in_frames;
                     }
                  }
               }
                  
               if (add)
                  scripts.push([src,data[i].in_frames,data[i].files[j], (data[i].run_at || 0),0]);
            }
      }
      
      if (scripts.length>1) console.info('ext_bg: get_scripts scr:',scripts,' url:'+url);
      //console.log('scripts:',scripts);
      var result=[];
      var idx=0;
      var load_next=function(){
         //console.error('ext_bg: ldr',idx,'/',scripts.length);
         if (idx>=scripts.length) {
            if (scripts.length>1) console.info('ext_bg: get_scripts scr res:',result,' url:'+url);
            callback(result, api_allowed);
            return;
         }
         
         ex_loader.get_script_content(scripts[idx][0],function(script){
            scripts[idx][4]=(script==scripts[idx][0]);
            scripts[idx][0]=script;
            result.push(scripts[idx]);
            idx++;
            load_next();
         });
      };
      load_next();
   },
   update_config:function(callback,clear){
      if (ex_loader.type=='internal'){ 
         callback();
         return;
      }
      ex_loader.load((ex_loader.config_url.match(/^https?:\/\//)?'':ex_loader.base_path)+ex_loader.config_url+'?rand='+Math.random(),function(script){
         if (!script) return;
         if (clear) ex_loader.clear();
         var ts=ex_loader.time();
         ex_loader.set('scripts_config',ts+script);//store script and timesamp        
         callback();
      });
   },
   init_config:function(callback){
      var cur_ts=ex_loader.time();
      var ts=0; 
      if (ex_loader.type=='internal'){ 
         ex_loader.config=ex_loader.packed_scripts;
         return;
      }
      var content=ex_loader.get('scripts_config');
      var old_hash=ex_loader.get('scripts_config_hash');
      if (content){
         content=String(content);
         ts=parseInt(content.substr(0,String(cur_ts).length));//parse script download time
         content=content.substr(String(cur_ts).length);//parse script content
         if (content=='')  return; // next call maybe from setInterval in ex_loader.init();
         try{
            var data=JSON.parse(content);
            var hash=String(data.shift());
            ex_loader.set('scripts_config_hash',hash);
            ex_loader.config=data;
         }catch(e){
            ex_loader.error('config_parse_error. waiting '+ex_loader.update_time+'ms for reloading...');
            setTimeout(function(){
               ex_loader.update_config(function(){ex_loader.init_config(callback);});
            },ex_loader.update_time);
            return;
         }
         
         if (old_hash!=hash){
            setTimeout(function(){
               var scripts=[];
               for (var i=0; i<data.length;i++)
                     for (var j=0;j<data[i].files.length;j++){
                        var src=ex_loader.get_script_path(data[i].files[j]);//(data[i].files[j].match(/^https?:\/\//))?data[i].files[j]:ex_loader.base_path+ex_loader.scripts_path+data[i].files[j];
                        scripts.push(src);
                     }

               var idx=0;
               var load_next=function(){
                  if (idx>=scripts.length){ 
                     if (callback) callback();
                     return;
                  }
                  ex_loader.update_script(scripts[idx++],load_next);
               };
               load_next(); 
            },5);
         }
         if (cur_ts - ts > ex_loader.update_time) setTimeout(function(){ex_loader.update_config(ex_loader.init_config);},10);// update if script date expired           
      } else {
         ex_loader.update_config(function(){ex_loader.init_config(callback)});
      } 
   },
   time:function() { return Math.round(new Date().getTime());},
   error:function(s){console.log(s);},  
   load:function(path,callback){
      var req = new XMLHttpRequest();
      req.open('GET', path, true);
      req.onreadystatechange = function(){
         if (req.readyState == 4) {
            if (!req.responseText) ex_loader.error('ERROR: Can\'t read ' + path);
            //console.log('script_content:',path,{txt:req.responseText,req:req});
            callback(req.status==200 || !path.match(/^https?:\/\//)?req.responseText:null,req);
         }
      };
      req.send();
      //if (!req.responseText) ex_loader.error('ERROR: Can\'t read ' + path);
      //return req.status==200?req.responseText:null;
   },
   get:function(key){
      if (window.navigator.userAgent.match('Mozilla')&& typeof Components !="undefined"  && typeof Components.classes !="undefined"){
         var url = ex_loader.moz_strorage_id;
         var ios = Components.classes["@mozilla.org/network/io-service;1"]
                   .getService(Components.interfaces.nsIIOService);
         var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
                   .getService(Components.interfaces.nsIScriptSecurityManager);
         var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
                   .getService(Components.interfaces.nsIDOMStorageManager);
         var uri = ios.newURI(url, "", null);
         var principal = ssm.getCodebasePrincipal(uri);
         var storage = dsm.getLocalStorageForPrincipal(principal, "");
         
         return storage.getItem(key);
      }
      return localStorage[key];
   },
   set:function(key,value){
      if (window.navigator.userAgent.match('Mozilla')  && typeof Components !="undefined" && typeof Components.classes !="undefined"){
         var url = ex_loader.moz_strorage_id;
         var ios = Components.classes["@mozilla.org/network/io-service;1"]
                   .getService(Components.interfaces.nsIIOService);
         var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
                   .getService(Components.interfaces.nsIScriptSecurityManager);
         var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
                   .getService(Components.interfaces.nsIDOMStorageManager);
         var uri = ios.newURI(url, "", null);
         var principal = ssm.getCodebasePrincipal(uri);
         var storage = dsm.getLocalStorageForPrincipal(principal, "");
         
         storage.setItem(key, value);           
      } else
         localStorage[key]=value;
   },
   clear:function(){
      if (window.navigator.userAgent.match('Mozilla')  && typeof Components !="undefined" && typeof Components.classes !="undefined"){
         var url = ex_loader.moz_strorage_id;
         var ios = Components.classes["@mozilla.org/network/io-service;1"]
                   .getService(Components.interfaces.nsIIOService);
         var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
                   .getService(Components.interfaces.nsIScriptSecurityManager);
         var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
                   .getService(Components.interfaces.nsIDOMStorageManager);
         var uri = ios.newURI(url, "", null);
         var principal = ssm.getCodebasePrincipal(uri);
         var storage = dsm.getLocalStorageForPrincipal(principal, "");
         
         storage.clear();
      } else
         localStorage.clear();    
   },
   update_script:function(name,callback){
      ex_loader.load(name+'?rand='+Math.random(),function(script){
         if (!script) return;
         var ts=ex_loader.time();
         ex_loader.set(name.split('/').pop(),ts+script);//store script and timesamp
         callback();
      });

   },
   scripts_cache:{},
   get_script_content:function(name,callback){
      //console.log('get_script_content:',name);
      var cur_ts=ex_loader.time();
      var ts=0; 
      var key=name.split('/').pop();
      var content=ex_loader.get(key);
      
      if (content && name.match(/https?:\/\//)){
         content=String(content);
         ts=parseInt(content.substr(0,String(cur_ts).length));//parse script download time
         content=content.substr(String(cur_ts).length);//parse script content
         //if (ts-cur_ts > ex_loader.update_time) setTimeout(function(){ex_loader.update_script(name)},10);// update if script date expired
      } else {
         if (name.match(/https?:\/\//)){
            ex_loader.update_script(name,function(){
               ex_loader.get_script_content(name,function(content){
                  callback(content);
               }); 
            });         
         } else {
            if (window.opera && opera.extension){
               if (!ex_loader.scripts_cache[key]){
                  ex_loader.load(name,function(content){
                     ex_loader.scripts_cache[key]=content;
                     callback(content);
                  })
               } else {
                  callback(ex_loader.scripts_cache[key]);
               }
            } else {
               callback(name);
            }
         }
         return;
      }
      callback(content);    
   }
};

var _ua = navigator.userAgent.toLowerCase();
var browser = {
  version: (_ua.match( /.+(?:me|ox|on|rv|it|era|opr|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
  opera: (/opera/i.test(_ua) || /opr/i.test(_ua)),
  msie: (/msie/i.test(_ua) && !/opera/i.test(_ua) || /trident\//i.test(_ua)),
  msie6: (/msie 6/i.test(_ua) && !/opera/i.test(_ua)),
  msie7: (/msie 7/i.test(_ua) && !/opera/i.test(_ua)),
  msie8: (/msie 8/i.test(_ua) && !/opera/i.test(_ua)),
  msie9: (/msie 9/i.test(_ua) && !/opera/i.test(_ua)),
  mozilla: /firefox/i.test(_ua),
  chrome: /chrome/i.test(_ua),
  yabrowser: /yabrowser/i.test(_ua),
  safari: (!(/chrome/i.test(_ua)) && /webkit|safari|khtml/i.test(_ua)),
  iphone: /iphone/i.test(_ua),
  ipod: /ipod/i.test(_ua),
  iphone4: /iphone.*OS 4/i.test(_ua),
  ipod4: /ipod.*OS 4/i.test(_ua),
  ipad: /ipad/i.test(_ua),
  android: /android/i.test(_ua),
  bada: /bada/i.test(_ua),
  mobile: /iphone|ipod|ipad|opera mini|opera mobi|iemobile|android/i.test(_ua),
  msie_mobile: /iemobile/i.test(_ua),
  safari_mobile: /iphone|ipod|ipad/i.test(_ua),
  opera_mobile: /opera mini|opera mobi/i.test(_ua),
  opera_mini: /opera mini/i.test(_ua),
  mac: /mac/i.test(_ua)
};

ext_api={
   ready:false,
   message_handler:function(data,send_response,obj){
      obj = obj || {};
      console.log('BG_GET:',data,send_response);
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
            
         case 'update_scripts':
            ex_loader.update_all(function(){
               send_response({act:'scripts_updated'});
            });
            break;         
         case 'download':
            /*
            if (browser.chrome){
               ext_api.download_chr(data.url,data.name,function(loaded,total){
                  send_response({act:'on_download_progress',loaded:loaded,total:total, _prevent_remove_cb:true});
               })
            } else */
            ext_api.download(data.url,data.name,obj.win);
            break;         
         default: if (send_response) send_response({act:'extension bg default response',msg:data,key:data.key});
      }
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
      if (browser.mozilla && !Components.classes) {    // Firefox Jetpack
          options.mozTime=Date.now();
          self.port.emit("ajax", options);
          function ajaxResponse(obj) {
              if (options.mozTime == obj.mozTime) {
                  delete obj.mozTime;
                  callback(obj);
                  self.port.removeListener("ajax_response", ajaxResponse);
              }
          }
          self.port.on("ajax_response", ajaxResponse);
      }
      else {
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
          //callback = callback || this.noop,
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
          if (data && (typeof data == 'object') && Object.prototype.toString.call(data) !== '[object Array]') data = serialize(data);

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
   },
   /*download_chr:function(url,name,progress_callback){
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.responseType = "blob";
      req.onprogress=function(evt){
            if (evt.lengthComputable){  
              if (progress_callback)
               progress_callback(evt.loaded,evt.total)
               //var percentComplete = (evt.loaded / evt.total)*100;
            } 
         };

      req.onload = function(oEvent) {
         var res = req.response;
         var blob = new Blob([res], {type:req.getResponseHeader('Content-Type')});
         url = window.URL.createObjectURL(blob);
         var a = document.createElement("a");
         document.body.appendChild(a);
         a.style = "display: none";
         a.href = url;
         a.download = name;
         a.click();
         window.URL.revokeObjectURL(url);
      };
      req.send();
      return req;
   },*/
   download:function(url, title, win,  fileType, aShouldBypassCache){ // ONLY MOZILLA
       if (!Components.classes) // Firefox Jetpack
           self.port.emit("download", url, title);
       else {
           function getDownloadFile(defaultString, fileType) {
               var nsIFilePicker = Components.interfaces.nsIFilePicker;

               var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
               fp.init(window, "Save As", nsIFilePicker.modeSave);
               try {
                   var urlExt = defaultString.substr(defaultString.lastIndexOf(".") + 1, 3);
                   if (urlExt != fileType) defaultString += "." + fileType
               } catch (ex) {
               }

               fp.defaultString = defaultString;

               fp.appendFilter(fileType, "*." + fileType);
               var rv = fp.show();
               if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
                   var file = fp.file;
                   //var path = fp.file.path;
                   return file;
               }
               return null;
           }

           if (!fileType)
               fileType = url.substr(url.lastIndexOf(".") + 1, 3);

           var file = getDownloadFile(title, fileType);
           var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
           var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
           var uri = ios.newURI(url, null, null);

           var fileURL = ios.newFileURI(file);

           persist = makeWebBrowserPersist();
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
           persist.persistFlags |= nsIWBP.PERSIST_FLAGS_DONT_CHANGE_FILENAMES;
           var tr = Components.classes["@mozilla.org/transfer;1"].createInstance(Components.interfaces.nsITransfer);
           tr.init(uri, fileURL, "", null, null, null, persist, isPrivate);
           persist.progressListener = tr;
           if (browser.version < 36)
               persist.saveURI(uri, null, null, null, null, fileURL, privacyContext);
           else // В новых FF добавлен четвертый параметр aReferrerPolicy
               persist.saveURI(uri, null, null, null, null, null, fileURL, privacyContext);
       }
   },
   utils:{
      chrome_init: function(){
         var download_file_names={};
         chrome.webRequest.onBeforeRequest.addListener(
            function(details) {
               //console.log('onBeforeRequest:',details);
               var url=details.url.match(/^(.+)[&\?]\/(.+\.[a-z0-9]+)/);
               if (url){
                  download_file_names['name'+details.requestId]=decodeURIComponent(url[2]);
                  return {redirectUrl: url[1]};
               }
            }, 
            {urls: ["*://*.vk.me/*","*://*.userapi.me/*","*://*.vk-cdn.net/*"]},["blocking"]
         );
                 
         chrome.webRequest.onHeadersReceived.addListener(
            function(details) {
               //console.log('onHeadersReceived:',details);
               if (download_file_names['name'+details.requestId]){
                  var found = false;
                  for (var i = 0; i < details.responseHeaders.length; ++i) {
                     if (details.responseHeaders[i].name === 'Content-Disposition') {
                        details.responseHeaders[i].value = 'attachment; filename="'+download_file_names['name'+details.requestId]+'"';
                        found = true;
                        break;
                     } //Content-Disposition: attachment; filename=\"1.png\""
                  }
                  if (!found) details.responseHeaders.push({
                     name: 'Content-Disposition',
                     value: 'attachment; filename="'+download_file_names['name'+details.requestId]+'"'
                  });
                  return {
                     responseHeaders: details.responseHeaders
                  };
               }
            }, 
            {urls: ["*://*.vk.me/*","*://*.userapi.me/*","*://*.vk-cdn.net/*"]}, ["responseHeaders","blocking"]
         );
      }
   }
};


ex_loader.init();

if (browser.chrome && !(window.external && window.external.mxGetRuntime))
   ext_api.utils.chrome_init()

})();