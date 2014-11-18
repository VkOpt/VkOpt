package 
{	
	import flash.display.*;
    import flash.events.*;
    import flash.ui.*;
    import flash.utils.*;	
	import flash.net.*;
	import flash.external.ExternalInterface;
	import vk.gui.*;
	//import encryption.MD5;
	import com.hurlant.util.Base64;
	/**
	 * ...
	 * @author KiberInfinity
	 */
	public class Main extends Sprite 
	{
		public static var FILE_FILTER:Array = ["All Files (*.*)", "*.*"];
		public var file:FileReference;
		
		public function Main():void 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
	    private function vk_string_escape(str:String):String{
		  function encodeCharx(original:String):String{
			 var thecharchar:String=original.charAt(0);
			 switch(thecharchar){
				   case '\n': return "\\n"; break; //newline
				   case '\r': return "\\r"; break; //Carriage return
				   case '\'': return "\\'"; break;
				   //case '"': return "\\\""; break;
				   //case '\&': return "\\&"; break;
				   case '\\': return "\\\\"; break;
				   case '\t': return "\\t"; break;
				   //case '\b': return "\\b"; break;
				   //case '\f': return "\\f"; break;

				   default:
					  return original;
					  break;
			 }
		  }
		  var preescape:String="" + str;
		  var escaped:String="";
		  var i:int=0;
		  for(i=0;i<preescape.length;i++){
			 escaped=escaped+encodeCharx(preescape.charAt(i));
		  }
		  return escaped;         
	    }
		private function init(e:Event = null):void 
		{
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
            contextMenu = new ContextMenu();
            contextMenu.hideBuiltInItems();
            var ciVkOpt:ContextMenuItem = new ContextMenuItem("VkOpt DataLoader v0.4");
            contextMenu.customItems.push(ciVkOpt);
            ciVkOpt.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, 
					function (e:Event): void{ navigateToURL(new URLRequest("http://vkopt.net"), "_blank");});
            
			var ciKiberInfinity:ContextMenuItem = new ContextMenuItem("Made by Raevskiy Mihail");
            contextMenu.customItems.push(ciKiberInfinity);
            ciKiberInfinity.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, 
					function (e:Event): void { navigateToURL(new URLRequest("http://vkontakte.ru/id13391307"), "_blank");} );
        
			
			
			
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			var vars:Object = LoaderInfo(parent.loaderInfo).parameters;
			var s_browse:String = (vars['idl_browse'] != null)?vars['idl_browse'] : "Browse";
			if (vars['mask_ext'] && vars['mask_name']) {	FILE_FILTER[0] = vars['mask_name']; FILE_FILTER[1] = vars['mask_ext'];  }
			var ImgBytes:ByteArray;
			var Btn:SquareButton = new SquareButton(s_browse, 0, 0); //new RoundButton(s_browse, 0, 0);
			//Btn.width = 70;
			addChild(Btn);
			//trace(Btn.height);
			file = new FileReference();
			file.addEventListener(Event.SELECT, function(e:Event): void {
				if (file.size == 0) {
					trace("File size is zero bytes");
					return;
				}
				var th1func:Function = function(e: Event): void {
					file.removeEventListener(Event.COMPLETE, th1func);
					ImgBytes = ByteArray(e.target.data);
					var b64:String;
					b64 = Base64.encodeByteArray(ImgBytes);
					var text:String = Base64.decode(b64);
					//text=escape(text);
					text = vk_string_escape(text);
					trace(text);
					if (ExternalInterface.available) { ExternalInterface.call('vkOnDataLoaded', text); }
					else {  navigateToURL(new URLRequest("javascript:vkOnDataLoaded('"+text+"')"), '_self');}
				}
				file.addEventListener(Event.COMPLETE, th1func);
				//file.textField.text = fthumb_1.name;
				file.load();
			});
			Btn.addEventListener(MouseEvent.CLICK, function (e: MouseEvent): void {
					file.browse([new FileFilter(FILE_FILTER[0], FILE_FILTER[1])]);
			});
			if (ExternalInterface.available){
				var obj:Object = ExternalInterface.call('vkOnInitDataLoader', Btn.width, Btn.height);
			}
		}
		
	}
	
}