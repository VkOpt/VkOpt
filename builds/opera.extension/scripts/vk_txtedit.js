// ==UserScript==
// @description   Vkontakte Optimizer Module (by KiberInfinity id13391307)
// @include       *vkontakte.ru*
// @include       *vk.com*
// ==/UserScript==
//
// (c) All Rights Reserved. VkOpt.
//


/* TEXTAREAS FUNCTIONS */
/*
function vkInsertToField(field,text,html){
	var obj=ge(field);
	if (!obj.setValue){
		obj.focus();
		if (typeof(obj.selectionStart)=="number") {
			var s=obj.value;
			s=s.substring(0,obj.selectionStart)+' '+text+' '+s.substring(obj.selectionStart);
			obj.value=s;
		} else obj.value+=' '+text;
	} else {
		var obj2=geByClass('mention_rich_ta',obj.parentNode)[0] || obj;
		obj.setValue((obj2.innerHTML || obj.value)+' '+text);//appenChild(vkCe('span'),{},html);
	}
}*/
function vkInsertToField(field,text,html){
	var obj=ge(field);
   if (obj && obj.contentEditable=="true"){
      var s=document.getSelection()+"";
      if (s=="")
         obj.appendChild(document.createTextNode(text));
      else
         document.execCommand('insertHTML', false, text);
   } else {
		obj.focus();
		if (typeof(obj.selectionStart)=="number") {
			var s=obj.value;
			s=s.substring(0,obj.selectionStart)+' '+text+' '+s.substring(obj.selectionStart);
			obj.value=s;
		} else obj.value+=' '+text;
	}
}

/*
function GetSelectedLength(obj){
obj.focus();
 if (document.selection){
  var s = document.selection.createRange();
  return s.text.length;
 }
 else if (typeof(obj.selectionStart)=="number") {
   if (obj.selectionStart!=obj.selectionEnd){
     var start = obj.selectionStart;
     var end = obj.selectionEnd;
     var len=end-start;
     return len;
   }
 }
 return 0;
}

function replaceSelectedText(obj,cbFunc){
 obj.focus();
 if (document.selection){
   var s = document.selection.createRange();
   if (s.text){
	eval("s.text="+cbFunc+"(s.text);");
	s.select();
	return true;
   }
 }
 else if (typeof(obj.selectionStart)=="number"){
   if (obj.selectionStart!=obj.selectionEnd){
     var start = obj.selectionStart;
     var end = obj.selectionEnd;
     eval("var rs = "+cbFunc+"(obj.value.substr(start,end-start));");
     obj.value = obj.value.substr(0,start)+rs+obj.value.substr(end);
     obj.setSelectionRange(end,end);
   }
   return true;
 }
 return false;
}//*/
function GetSelectedLength(obj){
obj.focus();
 if (document.selection){
  var s = document.selection.createRange();
  return s.text.length;
 }
 else if (typeof(obj.selectionStart)=="number") {
   if (obj.selectionStart!=obj.selectionEnd){
     var start = obj.selectionStart;
     var end = obj.selectionEnd;
     var len=end-start;
     return len;
   }
 } else if (obj.contentEditable=="true"){
   var sel=window.getSelection(); 
   var r=sel.getRangeAt(0);  
   el=r.commonAncestorContainer;
   while(el && el.contentEditable!="true") {
        el = el.parentNode;
   }
   if (el && el.contentEditable=="true"){
     var text = document.getSelection()+'';
     return text.length;
   }
 }
 return 0;
}

function replaceSelectedText(obj,cbFunc){
 obj.focus();
 if (document.selection){
   var s = document.selection.createRange();
   if (s.text){
	eval("s.text="+cbFunc+"(s.text);");
	s.select();
	return true;
   }
 }
 else if (typeof(obj.selectionStart)=="number"){
   if (obj.selectionStart!=obj.selectionEnd){
     var start = obj.selectionStart;
     var end = obj.selectionEnd;
     eval("var rs = "+cbFunc+"(obj.value.substr(start,end-start));");
     obj.value = obj.value.substr(0,start)+rs+obj.value.substr(end);
     obj.setSelectionRange(end,end);
   }
   return true;
 } else if (obj.contentEditable=="true"){
   var sel=window.getSelection(); 
   var r=sel.getRangeAt(0);
   el=r.commonAncestorContainer;
   while(el && el.contentEditable!="true") {
        el = el.parentNode;
   }   
   if (el && el.contentEditable=="true"){
     var text = document.getSelection()+'';
     eval("var rs = "+cbFunc+"(text);");
     document.execCommand('insertHTML', false, rs);
     //return text.length;
   }
 }
 return false;
}
///////////////////////////

function PasteSmile(text,rfield,key){
	vkInsertToField(rfield,text);
}

function AddSmileBtn(rfield){
	var GenHtml=function(rfield){
		GetSmileItem=function (smiles,key,rfield){
			var smile_text,big;
			if (typeof smiles[key]!='string'){
			  smile_text=smiles[key][0]; big=(smiles[key][2])?true:false;
			} else {  smile_text=smiles[key]; big=false; }
			var btn='<a href="#" onclick="return false;" class="vk_txt_smile_item" '+((big)?'style="display:block"':"")+'><img onclick="PasteSmile(\''+smile_text+'\',\''+rfield+'\',\''+key+'\')" src="'+vkSmilesLinks[key]+'" title="'+smile_text+'" alt="'+smile_text+'"></a>';
			return btn;
		}
		var smiles=TextPasteSmiles;
		var DivCode='<div>'+
		 '<h4>'+IDL('sm_SelectSmile')+'</h4><div class="smilemenu">';
		 var i=0;
		 for (key in smiles){
		  i++;
		  DivCode+=GetSmileItem(smiles,key,rfield);
		  //if (i % 15 == 0) DivCode+='<br>';
		 }
		DivCode+= '</div></div>';
		return DivCode;
	};
	if (!window.smiles_panel_html) smiles_panel_html=GenHtml('%FIELD_ID%');
	return smiles_panel_html.replace(/%FIELD_ID%/g,rfield);// GenHtml(rfield);//
}

vk_gen_smiles_funcs=[];
function vkTxtPanelButtons(eid,emoji){
	var idx=vk_gen_smiles_funcs.length;
	var need_gen=true;
   if (emoji){

      
      //var eid = 'reply_field39226536_390';
      /*var el=vkCe('a',{
         "class":"vk_edit_btn emoji_smile",
         href:"#",
         "onmousedown":"console.log(this); Emoji.ttClick(cur.emojiId['"+eid+"'], this); return cancelEvent(event);",
         "onmouseover":"Emoji.ttOver(this);",
         "onmouseout":"Emoji.ttOut(this);"
      },'');*/
      var el=se('<div class="emoji_smile fl_l" '+
      'onmouseover="Emoji.ttOver(this);" '+
      'onmouseout="Emoji.ttOut(this);" '+
      'onclick="return cancelEvent(event);" '+
      'onmouseup="return cancelEvent(event);" '+
      'onmousedown="console.log(this); Emoji.ttClick(cur.emojiId[\''+eid+'\'], this); return cancelEvent(event);" '+
      'style="opacity: 0.7; margin-top:-1px;"><div class="emoji_smile_icon_on"></div><div class="emoji_smile_icon vk_emoji_mini_icon"></div></div>');
      
      var txt = ge(eid);//IM.getNewTxt();
      var wrap = se('<div class="fl_l"></div>');
      txt.parentNode.insertBefore(wrap,txt);
      //cur.emoji_stickers = false;
      cur.emojiId = cur.emojiId || {};
      cur.emojiId[eid] = Emoji.init(txt, {
         ttDiff: -105,
         controlsCont: emoji,//el,//wrap.parentNode,//ge('submit_reply39226536_390'),//ge('imw_emoji_wrap'),
         shouldFocus: true,
         //onSend: IM.send,
         noEnterSend: 1,
         forceTxt: !cur.editable,
         //checkEditable: IM.checkWriteEditable,
         //saveDraft: IM.saveWriteDraft,
         rceCont: se('<div class="fl_l"></div>'),//ge('im_rcemoji_cont'), // last used
         //addMediaBtn: txt.parentNode,//ge('reply_media_lnk39226536_390'),
         sendWrap: wrap,//ge('reply_media_lnk39226536_390').parentNode,
         onStickerSend: function(stNum) {   }
      });
       


      
      return el;
   } else {
      vk_gen_smiles_funcs.push(function(el){
         if (need_gen){
            el.getElementsByTagName('div')[0].innerHTML=AddSmileBtn(eid);
            need_gen=false;
         }
      });
      var el=vkCe('a',{"class":"vk_edit_btn smile_btn",href:"#","onmouseover":"vk_gen_smiles_funcs["+idx+"](this);"},'<div class="vk_edit_sub_panel">qqwe'+/*AddSmileBtn(eid)+*/'</div>');
      //el.getElementsByTagName('div').innerHTML=AddSmileBtn(eid);
      return el;//'<a class="vk_edit_btn smile_btn" href="#"><div class="vk_edit_sub_panel">'+AddSmileBtn(eid)+'</div></a>';
   }
}
/*
function vkPrepareTxtPanels(node){
	if (getSet(33)!='y') return;
	var tstart=unixtime();
	var tas=(node || document).getElementsByTagName('textarea');
	var te_btn_count=0;
	var touts={};
	if (!window.txtareas_events) txtareas_events=[];
	
   var add_panel=function(ta){
		if ((ta.getAttribute('onfocus') && ta.getAttribute('onfocus').indexOf('showEditPost')!=-1) || ta.getAttribute('vk_edit_btns')) 
         return;//continue;//ge('edit_btns_'+ta.id)
		var panel=vkCe('div',{id:'edit_btns_'+ta.id,"class":'vk_textedit_panel'},
						//vkTxtPanelButtons(ta.id)+
						'<div style="float:left; font-size:7px; margin-top:-10px; margin-right:3px;" onclick="fadeOut(\''+'edit_btns_'+ta.id+'\');">x</div>');
		panel.appendChild(vkTxtPanelButtons(ta.id));				
		//alert(panel.innerHTML);
		ta.parentNode.insertBefore(panel,ta);
		hide(panel);
		var show_panel=function(e){
			var pid='edit_btns_'+e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
			if (!isVisible(panel))fadeIn(panel);
		};
		var hide_panel=function(e){
			var pid='edit_btns_'+e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
			touts[pid]=setTimeout(function(){fadeOut(panel)},400);
		};
		var panel_mousemove=function(e){
			var pid=e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
		};
		txtareas_events.push(panel_mousemove);
		panel.setAttribute('onmousemove','txtareas_events['+(txtareas_events.length-1)+'](event);');
		panel.setAttribute('onclick','txtareas_events['+(txtareas_events.length-1)+'](event);');
		txtareas_events.push([show_panel,hide_panel]);
		var feid=(txtareas_events.length-1);
		var onclick_area=function(e,el,idx){
			if (!el.vk_txt_panel_enabled){
				addEvent(el, 'focus', txtareas_events[idx][0]);//show_panel
				addEvent(el, 'click', txtareas_events[idx][0]);
				addEvent(el, 'blur', txtareas_events[idx][1]);//hide_panel
				txtareas_events[idx][0](e);
				el.vk_txt_panel_enabled=true;
			}
		};
		if (!ta.getAttribute('onmousemove')){//onclick
			txtareas_events.push(onclick_area);
			ta.setAttribute('onmousemove','txtareas_events['+(txtareas_events.length-1)+'](event,this,'+feid+');');
		}
		addEvent(ta, 'focus', show_panel);
		addEvent(ta, 'click', show_panel);
		addEvent(ta, 'blur', hide_panel);
		ta.vk_txt_panel_enabled=true;
		ta.setAttribute('vk_edit_btns', true);   
   };
	for (var i=0;i<tas.length;i++){
		var ta=tas[i];
      add_panel(ta);
	}
	vklog('PrepareTxtPanels time:' + (unixtime()-tstart) +'ms');
}*/

function vkAddSmilePanel(el){
	if (getSet(33)!='y' && getSet(95)!='y') return;
	var tstart=unixtime();
	var te_btn_count=0;
	var touts={};
	if (!window.txtareas_events) txtareas_events=[];
   //if (!window.txtareas_ids) txtareas_ids=0;
	
   var add_panel=function(ta){
		if ((ta.getAttribute('onfocus') && ta.getAttribute('onfocus').indexOf('showEditPost')!=-1) || ta.getAttribute('vk_edit_btns') || !ta.id) 
         return;//continue;//ge('edit_btns_'+ta.id)
		//if (!ta.id) ta.id='vktextfield_'+(txtareas_ids++);
      var panel=vkCe('div',{id:'edit_btns_'+ta.id,"class":'vk_textedit_panel emoji_no_tabs'},
						//vkTxtPanelButtons(ta.id)+
						'<div style="float:left; font-size:7px; margin-top:-10px; margin-right:3px;" onclick="fadeOut(\''+'edit_btns_'+ta.id+'\');">x</div>');
		if (getSet(33)=='y') panel.appendChild(vkTxtPanelButtons(ta.id));	
      if (getSet(95)=='y') panel.appendChild(vkTxtPanelButtons(ta.id,panel));      
		//alert(panel.innerHTML);
		ta.parentNode.insertBefore(panel,ta);
      //ta.parentNode.insertBefore(vkTxtPanelButtons(ta.id,true),ta);
		hide(panel);
		var show_panel=function(e){
			var pid='edit_btns_'+e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
			if (!isVisible(panel))fadeIn(panel);
		};
		var hide_panel=function(e){
			var pid='edit_btns_'+e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
			touts[pid]=setTimeout(function(){fadeOut(panel)},400);
		};
		var panel_mousemove=function(e){
			var pid=e.target.id;
			var panel=ge(pid);
			clearTimeout(touts[pid]);
		};
		txtareas_events.push(panel_mousemove);
		panel.setAttribute('onmousemove','txtareas_events['+(txtareas_events.length-1)+'](event);');
		panel.setAttribute('onclick','txtareas_events['+(txtareas_events.length-1)+'](event);');
		/*addEvent(panel, 'mousemove', panel_mousemove);
		addEvent(panel, 'click', panel_mousemove);*/
		txtareas_events.push([show_panel,hide_panel]);
		var feid=(txtareas_events.length-1);
		var onclick_area=function(e,el,idx){
			if (!el.vk_txt_panel_enabled){
				addEvent(el, 'focus', txtareas_events[idx][0]);//show_panel
				addEvent(el, 'click', txtareas_events[idx][0]);
				addEvent(el, 'blur', txtareas_events[idx][1]);//hide_panel
				txtareas_events[idx][0](e);
				el.vk_txt_panel_enabled=true;
			}
		};
		if (!ta.getAttribute('onmousemove')){//onclick
			txtareas_events.push(onclick_area);
			ta.setAttribute('onmousemove','txtareas_events['+(txtareas_events.length-1)+'](event,this,'+feid+');');
		}
		addEvent(ta, 'focus', show_panel);
		addEvent(ta, 'click', show_panel);
		addEvent(ta, 'blur', hide_panel);
		ta.vk_txt_panel_enabled=true;
		ta.setAttribute('vk_edit_btns', true);   
   };
   add_panel(el);
	vklog('PreparePanel time:' + (unixtime()-tstart) +'ms');
}


/* INVERT LANG CHARS */
function InpTexSetEvents(){
	var cont=document;//ge('content');
	addEvent(cont, 'keyup', TextAreaKeyPressed); //'' keypress     keydown
}
function SwichKeybText(str){
   // See keyboard layouts language in vklang.js
   var cur_kl=vk_lang['keyboard_lang'] || vk_lang_ru['keyboard_lang'];
	var alfeng=cur_kl[0];
	var alfrus=cur_kl[1];

	var message="";
	for (var i=0; i < str.length; i++) {
			var messer=str.substr(i,1);
		    for (var u=0; u < alfeng.length; u++) {
					if(messer==alfeng[u]){
						var messer=messer.replace(alfeng[u],alfrus[u]);
						break;
					}
		    }
		  message=message+messer;
	}	
   return message;
}

var vk_EnableSwichText=true;
function TextAreaKeyPressed(event){
if(vk_EnableSwichText){
  var Key;
  var ctrlKey;
  var shiftKey;
  var pressed;
  event=window.event?window.event:event;
  Key=event.keyCode;//
  ctrlKey=event.ctrlKey;
  shiftKey=event.shiftKey;
  altKey=event.altKey;

  pressedCtrlKey=ctrlKey;
  pressedAltKey=altKey;
  pressedShiftKey=shiftKey;
  //topMsg(Key+'\n'+pressedCtrlKey);
  if (pressedCtrlKey){ //pressedCtrlKey
    var processedEvent=false;
    switch (Key){
      case 81: // ctrl+Q
      case 221: case 1066: // Ctrl+]
		    vk_EnableSwichText=false;
		    setTimeout("vk_EnableSwichText=true;",200);
		    var acelem=document.activeElement;
		    if (GetSelectedLength(acelem)>0){replaceSelectedText(acelem,SwichKeybText)}
		    else if (document.activeElement.value){
            document.activeElement.value=SwichKeybText(document.activeElement.value);
          } else if (acelem.contentEditable=="true"){
            
            FindAndProcessTextNodes(acelem,function(mainNode,childItem){
               var node = mainNode.childNodes[childItem];
               node.nodeValue=SwichKeybText(node.nodeValue);
            });
          }

        break;
    }
  }
  if (processedEvent){
    e=event;//window.event;
    e.returnValue=false;
    window.status="";
    return false;
  }
}}
///////////////////

if (!window.vkscripts_ok) vkscripts_ok=1; else vkscripts_ok++;