package 
{
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.external.ExternalInterface;
	import flash.utils.*;
	import flash.ui.*;
	import flash.net.*;
	import flash.filters.*;
	import flash.geom.*;
	import flash.system.*;
	import flash.text.*;
	
	import vk.gui.*;
	/**
	 * ...
	 * @author KiberInfinity
	 */
	public class Main extends Sprite 
	{
		//VARS
		private var config:Object;
		private var FileRef:FileReference = new FileReference();
		
		private var btn:SquareButton;
		private var SText:String;
		private var SFName:String = 'default.txt';
		
		
		//FUNCTONS
		public function Main():void 
		{
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			config = Config.loadConfig(parent.loaderInfo);
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			contextMenu = new ContextMenu();
            contextMenu.hideBuiltInItems();
			var ciVkOpt:ContextMenuItem = new ContextMenuItem("VkOpt DataSaver v0.3");
				contextMenu.customItems.push(ciVkOpt);
				ciVkOpt.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void{ navigateToURL(new URLRequest("http://vkopt.net"), "_blank");});
            
			var ciKiberInfinity:ContextMenuItem = new ContextMenuItem("Made by Raevskiy Mihail");
				contextMenu.customItems.push(ciKiberInfinity);
				ciKiberInfinity.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void { navigateToURL(new URLRequest("http://vkontakte.ru/id13391307"), "_blank"); } );
			btn = new SquareButton(config.lang.save_button, 0, 0);
			btn.visible = false;
			addChild(btn);	
			
			if (ExternalInterface.available){
				//ExternalInterface.addCallback(config.onReceivedText, onGetTextToSave);
				var obj:Object = ExternalInterface.call(config.onInit, btn.width, btn.height);
				onGetTextToSave(obj.text, obj.name);
				FileRef.addEventListener(Event.COMPLETE, function(e:Event):void{
					btn.alpha=1
					btn.enabled = true;
					btn.label = config.lang.save_button;
					ExternalInterface.call(config.onSavedFile);
				});				
			}
			btn.addEventListener(MouseEvent.CLICK, SaveTextToFile);
		}
		private function SaveTextToFile(e: MouseEvent):void {
			btn.alpha = 0.8;
			btn.enabled = false;
			btn.label = config.lang.waiting;
			FileRef.save(SText, SFName);
		}
		private function onGetTextToSave(value:String,filename:String='default.txt'):void {
			SText = value;
			SFName = filename;
			btn.visible = true;	
			ExternalInterface.call(config.onSaveFile,value,filename);
        }
		
	}
	
}