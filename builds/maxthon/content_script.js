// ==UserScript==
// @include       *.*
// ==/UserScript==

ex_ldr={
   mark:'vkopt_loader',
   key:(Math.round(Math.random()*10000000)).toString(35),
   init:function(){
      ex_ldr.get_scripts(function(data){
         var obj=JSON.parse(window.localStorage['ldr_disabled_libs'] || "{}");
         var run_at_start=[];
         var run_content_loaded=[];
         for (var i=0; i<data.length; i++){
            var file=data[i];  //file[3] - run_at
            (file[3]?run_content_loaded:run_at_start).push(file);
         }
         var inj=function(data){
            for (var i=0; i<data.length; i++){
               var file=data[i];
               if (!ex_ldr.is_allow_run(file[1])) continue;
               if (obj[file[2]]) continue;
               ex_ldr.inj_script(file[0],file[2]);//file[3] - run_at
               //console.log('inj:'+file[2]);
            }
         }
         //console.log('inj at start');
         inj(run_at_start);
         document.addEventListener("DOMContentLoaded", function(){
            //console.log('inj after content loaded');
            inj(run_content_loaded);
         }, false );
      })
   },
   get_scripts:function(callback){
      if (window.external && window.external.mxGetRuntime){         // MAXTHON
         var rt = window.external.mxGetRuntime();
         rt.post('get_scripts',{url:document.location.href,in_frame:ex_ldr.is_in_frame(),key:ex_ldr.key});
         rt.listen('scripts', function(data){
            if (data.key==ex_ldr.key && data.files && data.files.length>0){
               //console.log('scripts on '+document.location.href,data.files);
               callback(data.files);
            }
         }); 
         
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
            return inframe?false:true; // exclude frames
         case 2:
            return inframe?true:false; // only in frames
         case 3:
            return false;  // disable scripts
      }
      return true;      
   },
   inj_script:function(script,info){
      var ext=(info || ".js").split('.').pop();
      switch(ext){
         case 'js':
            var js = document.createElement('script');
            js.type = 'text/javascript';
            js.innerHTML=script;
            js.setAttribute(ex_ldr.mark,info);
            document.getElementsByTagName('head')[0].appendChild(js);                         
            break;
         case 'css':
               var styleElement = document.createElement("style");
               styleElement.type = "text/css";
               styleElement.setAttribute(ex_ldr.mark,info);
               styleElement.appendChild(document.createTextNode(script));
               document.getElementsByTagName("head")[0].appendChild(styleElement);
            break;
      }
   },
   init_keys:function(){
      var keyhandler = function(e){ 
         if (!e){  var e = event; };
         if (e.altKey && e.ctrlKey){    
            switch (e.keyCode){            
               case 85: /*case 1075: case 1043: case 117://alert("Alt+Ctrl+U"); */          
                  if (window.external && window.external.mxGetRuntime){
                     var rt=window.external.mxGetRuntime();
                     rt.post('update_scripts',{key:ex_ldr.key});
                     rt.listen('scripts_updated', function(data){
                        if (data.key==ex_ldr.key)
                           informer.show(ex_ldr.mark+" scripts updated",2000);
                     }); 
                  }
                  informer.show(ex_ldr.mark+" run update scripts<br>(Alt+Ctrl+U)",2000);
                  ex_ldr.inj_script("console.log('"+ex_ldr.mark+" run update scripts (Alt+Ctrl+U)');");
                  
                  break;
            }
         };
      };
      if (document.addEventListener){
         document.addEventListener('keydown', keyhandler, false);
      } else if (document.attachEvent){
         document.attachEvent('keydown', keyhandler);
      } else {
         document.onkeydown = keyhandler;
      };   
   }

}

informer={
   delay:2000,
   show:function(msg,delay,doc){
      delay = delay || informer.delay;
      doc = doc || document;
      var div=doc.createElement('div');
      div.setAttribute('style','position:fixed; z-index:10000; background:rgba(0,0,0,0.7); color:#FFF; padding:10px; width:200px; left:-250px; border-radius:0 15px 15px 0; bottom:5px; box-shadow:0 0 5px #000; text-shadow:0 -1px #000; -webkit-transition: all 200ms linear;-moz-transition: all 200ms linear;-o-transition: all 200ms linear; transition: all 200ms linear;font-family: "tahoma", "arial", "verdana", sans-serif, "Lucida Sans"; font-size: 11px;');
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
      }
      a.onclick=hide;
      setTimeout(function(){div.style.left='0px';},1);
      setTimeout(function(){
         hide();
      },delay);
   }
}


ex_ldr.init();
ex_ldr.init_keys();

