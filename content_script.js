// ==UserScript==
// @include       *.*
// ==/UserScript==
(function(){

var ext_browser={
   mozilla:(function(){try{return Components.interfaces.nsIObserverService!=null} catch(e){return false} })(),
   mozilla_jetpack: typeof self != 'undefined' && self.port && self.port.emit && self.port.on,
   opera: window.opera && opera.extension,
   chrome: window.chrome && chrome.extension,
   safari: window.safari   && safari.self,
   maxthon: (function(){try{return window.external.mxGetRuntime!=null} catch(e){return false} })() //without try{}catch it fail script on Firefox
};

function init_content_script(win,doc,bg){
win = win || window;
doc = doc || document;
bg  = bg  || {};
var api_enabled = false;
var ex_ldr={
   mark:'vkopt_loader',
   __key:(Math.round(Math.random()*10000000)).toString(35),
   init:function(){
      ex_ldr.get_scripts(function(data){
         var obj=JSON.parse(win.localStorage['ldr_disabled_libs'] || "{}");
         var run_at_start=[];
         var run_content_loaded=[];
         if (data.length){
            ex_ldr.inj_script("window._ext_ldr_"+ex_ldr.mark+"=true;");
         }
         for (var i=0; i<data.length; i++){
            var file=data[i];  //file[3] - run_at
            (file[3]?run_content_loaded:run_at_start).push(file);
         }

         var inj=function(data){
            for (var i=0; i<data.length; i++){
               var file=data[i];
               if (!ex_ldr.is_allow_run(file[1],doc)) continue;
               if (obj[file[2]]) continue;
               ex_ldr.inj_script(file[0],file[2],file[4]);//file[3] - run_at
               //console.log('inj:'+file[2]);
            }
         };
         //console.log('inj at start',run_at_start.length);
         inj(run_at_start);
         doc.addEventListener("DOMContentLoaded", function(){
            //console.log('inj after content loaded',run_content_loaded.length);
            inj(run_content_loaded);
         }, false );
      })
   },
   get_scripts:function(callback){
      if (ext_browser.opera){                                                      // OPERA

         opera.extension.addEventListener('message',function(event){
            var data = event.data || {};
            /*if (data.__key==ex_ldr.__key)
               console.error('ext_content: ON_MESSAGE',data, data.files && data.files.length);*/

            if (data.__key==ex_ldr.__key && data.files && data.files.length>0){
               callback(data.files);
            }
            if (data.act=='connected'){
               opera.extension.postMessage({act:'get_scripts', url:doc.location.href,in_frame:ex_ldr.is_in_frame(doc), __key:ex_ldr.__key});
               console.log('ext_content: opera.extension.postMessage get_scripts');
            }
            if (data.api_enabled) api_enabled = true;

            ex_api.ready=true;
            if (data.__key==ex_ldr.__key){
               ex_api.message_handler(data);
            }
            ex_api.post_message=function(msg){
               msg=ex_api.prepare_data(msg);
               opera.extension.postMessage(msg);
               return msg;
            }
         },false);
      } else if (ext_browser.chrome){                                              // CHROMIUM
         chrome.extension.sendRequest({act:'get_scripts', url:doc.location.href,in_frame:ex_ldr.is_in_frame(doc), __key:ex_ldr.__key}, function(data) {
            if (data.__key==ex_ldr.__key && data.files && data.files.length>0){
               if (data.api_enabled)
                  api_enabled = true;
               callback(data.files);
            }
         });
         //*
         ex_api.ready=true;

         ex_api.post_message=function(msg){
            msg=ex_api.prepare_data(msg);
            chrome.extension.sendRequest(msg, function(data) {
               if (data.__key==ex_ldr.__key){
                  ex_api.message_handler(data);
               }
            });
            return msg;
         }
      } else if (ext_browser.safari){
         ex_api.ready=true;
         safari.self.addEventListener("message", function(e) {                                    // SAFARI
            if (e.message.__key==ex_ldr.__key && e.message.files && e.message.files.length>0){
               if (e.message.api_enabled)
                  api_enabled = true;
               callback(e.message.files);
            }
            if (e.message.__key==ex_ldr.__key){
               ex_api.message_handler(e.message);
            }
         }, false);
         safari.self.tab.dispatchMessage("get_scripts",{url:doc.location.href,in_frame:ex_ldr.is_in_frame(doc), __key:ex_ldr.__key});

         ex_api.post_message=function(msg){
               msg=ex_api.prepare_data(msg);
               safari.self.tab.dispatchMessage('extension_api',msg);
               return msg;
         }
      } else if (ext_browser.maxthon){                                 // MAXTHON
         var rt = window.external.mxGetRuntime();
         rt.post('get_scripts',{url:doc.location.href,in_frame:ex_ldr.is_in_frame(doc), __key:ex_ldr.__key});
         rt.listen('scripts', function(data){
            if (data.__key==ex_ldr.__key && data.files && data.files.length>0){
               //console.log('scripts on '+doc.location.href,data.files);
               if (data.api_enabled)
                  api_enabled = true;
               callback(data.files);
            }
         });

         ex_api.post_message=function(msg){
            msg=ex_api.prepare_data(msg);
            rt.post('extension_bg_api',msg);
            return msg;
         };
         rt.listen('extension_api', function(data){
            if (data.__key==ex_ldr.__key){
               ex_api.message_handler(data);
            }
         });
         ex_api.ready=true;
      } else if (ext_browser.mozilla_jetpack){

         self.port.on("scripts",function (data) {
            //alert('on content script\n'+data.__key+'\n'+ex_ldr.__key+'\n'+data.files.length);
            if (data.__key==ex_ldr.__key && data.files && data.files.length>0){
               if (data.api_enabled)
                  api_enabled = true;
               callback(data.files);
            }
         });

         var get_scr = function(data) {
            self.port.emit("get_scripts", {url:doc.location.href,in_frame:ex_ldr.is_in_frame(doc), __key:ex_ldr.__key});
         }

         get_scr();
         // изначально первое сообщение не доходило в background, из-за этого 'init' запрос был добавлен
         // (вероятно глюк ночной сборки, либо onAttach срабатывал после отсылки сообщения).
         //self.port.on("init",get_scr);

         ex_api.post_message=function(msg){
            msg=ex_api.prepare_data(msg);
            self.port.emit('extension_bg_api',msg);
            return msg;
         };
         self.port.on('extension_api', function(data){
            if (data.__key==ex_ldr.__key){
               ex_api.message_handler(data);
            }
         });
         ex_api.ready=true;

      } else { //if (ext_browser.mozilla)                  // MOZILLA

         bg.get_scripts(doc.location.href,function(files, api_allowed){
            if (files && files.length>0){
               //console.log('scripts on '+doc.location.href,data.files);
               if (api_allowed)
                  api_enabled = true;
               callback(files);
            }
         },ex_ldr.is_in_frame(doc));

         ex_api.post_message=function(msg){
            msg=ex_api.prepare_data(msg);
            setTimeout(function(){
               bg.postMessage(msg,function(data){
                  if (data.__key==ex_ldr.__key){
                     ex_api.message_handler(data);
                  }
               });
            },1);
            return msg;
         }

      }
   },
   is_in_frame:function(doc){
      return ((doc || document).defaultView.parent != (doc || document).defaultView);
   },
   is_allow_run:function(in_frames,doc){
      in_frames = in_frames || 0;
      var inframe=((doc || document).defaultView.parent != (doc || document).defaultView);
      switch (in_frames){ // 0 or null - execute in all; 1 - exclude frames; 2 - only in frames; 3 - disable scripts
         case 0:
            return true; // include all
         case 1:
            return !inframe; // exclude frames
         case 2:
            return !!inframe; // only in frames
         case 3:
            return false;  // disable scripts
      }
      return true;
   },
   inj_script:function(script,info,by_src){
      var ext=(info || ".js").split('.').pop();
      switch(ext){
         case 'js':
            if (ext_browser.opera) win.eval(script);
            else {   /*if (ext_browser.chrome || ext_browser.safari || ext_browser.maxthon)*/
               var js = doc.createElement('script');
               js.type = 'text/javascript';
               js.charset = 'UTF-8';
               if (!by_src)
                  js.innerHTML=script;
               else
                  js.src=script;
               js.setAttribute(ex_ldr.mark,info);
               doc.getElementsByTagName('head')[0].appendChild(js);
            }
            break;
         case 'css':
            if (by_src){
               var cssNode = document.createElement('link');
               cssNode.type = 'text/css';
               cssNode.rel = 'stylesheet';
               cssNode.setAttribute(ex_ldr.mark,info);
               cssNode.href = script;
               doc.getElementsByTagName("head")[0].appendChild(cssNode);
            } else {
               var styleElement = doc.createElement("style");
               styleElement.type = "text/css";
               styleElement.setAttribute(ex_ldr.mark,info);
               styleElement.appendChild(doc.createTextNode(script));
               doc.getElementsByTagName("head")[0].appendChild(styleElement);
            }
            break;
      }
   },
   init_keys:function(){
      var done=function(){
         informer.show(ex_ldr.mark+" scripts updated",2000,doc);
      };
      var keyhandler = function(e){
         if (!e){  e = event; }
         if (e.altKey && e.ctrlKey){
            switch (e.keyCode){
               case 85: /*case 1075: case 1043: case 117://alert("Alt+Ctrl+U"); */
                  ex_api.req({act:'update_scripts'},function(){
                     done();
                  });
                  informer.show(ex_ldr.mark+" run update scripts<br/>(Alt+Ctrl+U)",2000,doc);
                  ex_ldr.inj_script("console.log('"+ex_ldr.mark+" run update scripts (Alt+Ctrl+U)');");

                  break;
            }
         }
      };
      if (doc.addEventListener){
         doc.addEventListener('keydown', keyhandler, false);
      } else if (doc.attachEvent){
         doc.attachEvent('keydown', keyhandler);
      } else {
         doc.onkeydown = keyhandler;
      }
   }

};

var informer={
   delay:2000,
   show:function(msg,delay,doc){
      delay = delay || informer.delay;
      doc = doc || document;
      var div=doc.createElement('div');
      div.setAttribute('style','position:fixed; z-index:10000; background:rgba(0,0,0,0.7); color:#FFF; padding:10px; width:200px; left:-250px; border-radius:0 15px 15px 0; bottom:5px; box-shadow:0 0 5px #000; text-shadow:0 -1px #000; -webkit-transition: all 200ms linear;-moz-transition: all 200ms linear;-o-transition: all 200ms linear; transition: all 200ms linear;font-family: "tahoma", "arial", "verdana", sans-serif, "Lucida Sans"; font-size: 11px;');
      console.log('informer',msg);
      div.innerHTML=msg;
      var a=doc.createElement('div');
      a.innerHTML='&times;';
      a.setAttribute('style','cursor:pointer; float:right; padding:0px 3px; line-height:16px;font-size: 8pt; font-weight:bold; background:rgba(0,0,0,0.5); border-radius:3px;');
      div.insertBefore(a,div.firstChild);
      doc.body.appendChild(div);
      var old_left=div.style.left;

      var visible=true;
      var hide=function(){
         if (!visible) return;
         visible=false;
         div.style.left=old_left;
         setTimeout(function(){div.parentNode.removeChild(div);},400);
      };
      a.onclick=hide;
      setTimeout(function(){div.style.left='0px';},1);
      setTimeout(function(){
         hide();
      },delay);
   }
};

//  win.postMessage({act:'get',url:'http://vkopt.net/download'},"*")
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

var ex_api={
   __key:(Math.round(Math.random()*10000000)).toString(35),
   ready:false,
   callbacks:{},
   cid:1,
   prepare_data:function(msg){
      msg = msg || {};
      msg.__key=ex_ldr.__key;
      msg._req=ex_api.cid++;
      return msg
   },
   post_message:function(data){console.log("can't post message to bg process",data)},
   init:function(win){
      win = win || window;

      ex_msg.init(ex_api.on_message);
      //win.addEventListener("message", ex_api.on_message,false);
   },
   message_handler:function(data){
      data = data || {};
      if (data && data._req && ex_api.callbacks['cb_'+data._req]){
         ex_api.callbacks['cb_'+data._req](data);
      } else {
         if (data._req) console.log('Response from bg:',data);
      }
   },
   on_message:function(e,send_response){ // FOR PAGE <-> CONTENT SCRIPT
      var res = e.data;
      //console.log('msg_get:',res);
      if (!res.act || res.mark!=ex_ldr.mark) return;
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
         case 'permissions_request':
         case 'permissions_get':
         //case 'update_scripts':
            ex_api.req(res,function(data, sub){
               //win.postMessage(JSON.parse(JSON.stringify({response:data,sub:sub})),"*");
               send_response(JSON.parse(JSON.stringify({response:data,sub:sub})));
            });
            break;
      }
   },
   req:function(data,callback){
      var data=ex_api.post_message(data);
      if (!api_enabled)
         return true;
      data._sub = data._sub || {};
      var cid=data._req;
      if (callback){
         ex_api.callbacks['cb_'+cid]=function(response){
            callback(response,data._sub);
            //alert('RESPONSE!\n'+response+'\n+data._sub);
            if (!response._prevent_remove_cb)
               delete ex_api.callbacks['cb_'+cid];
         }
      }
      //console.log('REQ_ID: '+data._req);
   }

};


ex_ldr.init();
ex_ldr.init_keys(); // TODO: disable if no need
ex_api.init(win);
//win.ex_api=ex_api;
}


if (ext_browser.opera || ext_browser.chrome || ext_browser.safari || ext_browser.maxthon || ext_browser.mozilla_jetpack){
      init_content_script(window, document);
}

// in Mozilla browsers "init_content_script" called from background.js

vkopt_ldr_init_content_script=init_content_script;
/*
in injected scripts:
api ready check
crossdomain requests
*/


})();
