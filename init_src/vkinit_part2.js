
    );
}

function ge(el){return document.getElementById(el);}

function MainInit(){
  var head=document.getElementsByTagName('head')[0];
  if (document.getElementsByTagName('body')[0]) VkLoadScripts();
  else setTimeout(MainInit,10);
}
MainInit();
