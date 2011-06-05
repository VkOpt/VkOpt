function Js2Doc(){
  for (var i=0;i<arguments.length;i++){  
    var js = document.createElement('script');
    js.type = 'text/javascript';
    var jsrc="";//"scripts/"+arguments[i];
    //alert(safari.extension.baseURI+'\n'+'\n'+arguments[i]);
	if (window.safari && safari.extension) jsrc=safari.extension.baseURI+'includes/'+arguments[i];
    if (window.chrome && chrome.extension) jsrc=chrome.extension.getURL('includes/'+arguments[i]);
	
    js.src = jsrc;
    document.getElementsByTagName('head')[0].appendChild(js);
  }
}

function VkLoadScripts(){
     Js2Doc(
    "vklang.js",
	"vk_lib.js", 
	"vk_settings.js",
	"vk_users.js",
	"vk_face.js",
	"vk_page.js",
	"vk_skinman.js",
	"vk_txtedit.js",
	"vk_main.js",
	"vk_resources.js",	
    "vkopt.js"
    );
}

function ge(el){return document.getElementById(el);}

function MainInit(){
  var head=document.getElementsByTagName('head')[0];
  if (document.getElementsByTagName('body')[0]) VkLoadScripts();//ge('pageContainer')
  else setTimeout(MainInit,10);
}
MainInit();

/*
var vkoptjsload=setInterval(function(){                                           
if (head){clearInterval(vkoptjsload); VkLoadScripts()}
},10);
*/
//VkLoadScripts();