function Js2Doc(){
  for (var i=0;i<arguments.length;i++){  
    var js = document.createElement('script');
    js.type = 'text/javascript';
    var jsrc="";
	if (window.safari && safari.extension) jsrc=safari.extension.baseURI+'includes/'+arguments[i];
    if (window.chrome && chrome.extension) jsrc=chrome.extension.getURL('includes/'+arguments[i]);
	
    js.src = jsrc;
    document.getElementsByTagName('head')[0].appendChild(js);
  }
}

function VkLoadScripts(){
     Js2Doc(
