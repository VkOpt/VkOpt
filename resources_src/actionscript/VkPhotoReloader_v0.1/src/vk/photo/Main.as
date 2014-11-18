package vk.photo{
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
	//import progress_loader;
	
	import vk.api.serialization.json.JSON;

	import vk.api.APIProvider;
	import vk.gui.*;
 

	
	/**
	 * ...
	 * @author KiberInfinity
	 */
  public class Main extends Sprite {
    public static var ALBUM_LIST: Array = new Array();	
	
    private var urlLoader: URLLoader;
    
    private var btnBrowse: RoundButton;
	private var postData:UploadPostData;
	
	private var btns: Array;
	private var CBAlbums: ComboBox;
    private var uploadButtons: Sprite;
    	
    private var imagePreview: Sprite;
	private var MainPanel: Sprite;
	private var ProgressLoader:progress_loader;
    private var resizedImage: Bitmap;
	private var UploadSource: Bitmap;
	private var UploadBytes: ByteArray;
    private var dp: APIProvider;
    private var uploadUrl: String;
    private var aid: String;
	
    private var app: Object;
	
	private var W:uint = 253;
    private var H:uint = 50;
    private var X:uint = 0;
    private var Y:uint = 30;
    private var uploading:Boolean = false;
	
	// Flash Vars 
	private var config:Object;
	private var lang:Object;
    //private var vars:Object = LoaderInfo(parent.loaderInfo).parameters;
	private var user_id:uint = 0;
    private var viewer_id:uint = 0;
	private var app_id:uint = 0;
	private var api_url:String = "";
	private var api_sid:String = "";
	private var api_secret:String = "";
	
	private var image_url:String = "";
	private var album_id:uint = 0;
	
    internal static const TEST_MODE:Boolean = false; // For local testing please change this to "true"
    
		public function Main():void {
			addEventListener(Event.ADDED_TO_STAGE, init);
		}
		
		private function init(e:Event = null):void {
			removeEventListener(Event.ADDED_TO_STAGE, init);
			////////////////////////////////////////
			config = Config.loadConfig(parent.loaderInfo); //getConfig();
			lang = config.lang;
			
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			
			contextMenu = new ContextMenu();
            contextMenu.hideBuiltInItems();
			var ciVkOpt:ContextMenuItem = new ContextMenuItem("VkOpt PhotoUp v1.0");
				contextMenu.customItems.push(ciVkOpt);
				ciVkOpt.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void{ navigateToURL(new URLRequest("http://vkopt.net"), "_blank");});
            
			var ciKiberInfinity:ContextMenuItem = new ContextMenuItem("Made by Raevskiy Mihail");
				contextMenu.customItems.push(ciKiberInfinity);
				ciKiberInfinity.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void { navigateToURL(new URLRequest("http://vkontakte.ru/id13391307"), "_blank"); } );
			
				
			// Read FlashVars	  
			app_id = config.api_id;
			user_id   = config.user_id;
			viewer_id = config.viewer_id;
			api_url = config.api_url;
			api_sid = config.api_sid;
			api_secret = config.api_secret;
			image_url = config.image_url;
			album_id = config.album_id;
      
			if ( viewer_id == 0 ) {
				api_url = "http://api.vkontakte.ru/api.php";
				app_id = 2168679;
				viewer_id = 13391307;
				user_id = 13391307;
				api_url = 'http://api.vkontakte.ru/api.php';
				api_sid = '';
				api_secret = '';
				image_url = 'http://cs4296.vk.com/u3457516/124935920/w_0003bc4e.jpg';
			}

			if ( user_id == 0 )  user_id = viewer_id;
			////////////////////////////////////////////	
			app = new Object();
			app.stageWidth = 250;
			app.stageHeight = 100;

			//Security.allowDomain("*");
			MainPanel = new Sprite();
			MainPanel.x = 0;
			MainPanel.y = 0;
			addChild(MainPanel);
			var txt:TextField = Utils.addText( 5, 0, 0, 11, lang.choice_album);
			MainPanel.addChild( txt );
			
			ProgressLoader = new progress_loader();
			ProgressLoader.x = (app.stageWidth-ProgressLoader.width)/2;
			ProgressLoader.y = 63;
			MainPanel.addChild(ProgressLoader);
			
			postData = new UploadPostData();

			CBAlbums = new ComboBox(null, 10, 20, app.stageWidth);
			CBAlbums.x = 5;//Math.round((app.stageWidth-CBAlbums.width)/2);
			CBAlbums.addItemsArray([lang.loading_info]);
			MainPanel.addChild(CBAlbums);
			
			
			var btnUpload: RoundButton = new RoundButton(lang.button_upload, 0, 0);
			btnUpload.addEventListener(MouseEvent.CLICK, onUploadClick);

			uploadButtons = new Sprite();
			uploadButtons.addChild(btnUpload);
			uploadButtons.x = Math.round((app.stageWidth / 2) - (btnUpload.width / 2));
			uploadButtons.y = 55;//btnBrowse.y;
			uploadButtons.visible = false;
			MainPanel.addChild(uploadButtons);

			W = app.stageWidth;
			X = 5;//Math.round((app.stageWidth - W) / 2);
			Y = uploadButtons.y - 15;
			updView();   
			showLoader();
			//viewer_id,user_id,app_id,api_url   // api_secret,api_sid
			dp = new APIProvider(app_id, api_secret,api_sid,viewer_id,api_url,TEST_MODE);//app.parameters.viewer_id
			dp.setup( { onError: function(error: String): void {debug("Error: " + error); }});	  	 
			UploadBytes = new ByteArray();
			var imgurlLoader:URLLoader = new URLLoader;
			imgurlLoader.addEventListener(Event.COMPLETE, function(e:Event):void {
				UploadBytes = imgurlLoader.data;
				uploadButtons.visible = true;
				var userPhotoLoader:Loader = new Loader();
				userPhotoLoader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {		
						var resizedImage: Bitmap = ImageHelper.resize(Bitmap(userPhotoLoader.content), app.stageWidth, app.stageWidth);
						debug('ByteLoaderLoaded');
						imagePreview = new Sprite();
						imagePreview.addChild(resizedImage);
						imagePreview.x = 5;
						imagePreview.y = 95;
						MainPanel.addChild(imagePreview);
						hideLoader();
				});	  
				userPhotoLoader.loadBytes(UploadBytes);
			});
			imgurlLoader.dataFormat = URLLoaderDataFormat.BINARY;
			var uReq:URLRequest = new URLRequest(image_url);
			imgurlLoader.load(uReq);
			debug(image_url);

			var p:Object = new Object();
			p.uid = viewer_id;
			var album_idx:uint = 0;
			dp.request("photos.getAlbums", {params:p,onComplete: function(response: Object): void {
				if (response) {
				  var items:Array = new Array();
				  ALBUM_LIST = new Array();
				  for (var i:uint = 0; i < response.length; i++){
					items[i] = response[i].title;
					ALBUM_LIST[i] = response[i].aid;
					if (response[i].aid == album_id) album_idx = i;
				  }
				  CBAlbums.clear();
				  CBAlbums.addItemsArray(items);	
				  CBAlbums.selectedIndex = album_idx;
				  if (album_idx) {
					showLoader();
					
					hideLoader();
				  }
				}
			}});
			
			if (ExternalInterface.available) {  
					ExternalInterface.call(config.onFlashReady); //onUploadComplete  |  onDebug | onFlashReady
			}
	}
    
    private function showLoader(): void {
		ProgressLoader.visible = true;
		uploadButtons.visible = false;
	}
   
	private function hideLoader(): void {
		ProgressLoader.visible = false;
		uploadButtons.visible = true;
	}	
    private function onUploadClick(e:MouseEvent): void {
      var p:Object = new Object();
	  p.aid = ALBUM_LIST[CBAlbums.selectedIndex];
	  p.save_big = 1; 
	  dp.request("photos.getUploadServer", {params:p,onComplete: function(response: Object): void {
        if (response.upload_url) {
			uploadUrl = response.upload_url;
			aid = response.aid;
			var urlRequest: URLRequest = new URLRequest();
			if (uploadUrl == "") {
				debug("Upload URL is empty");
				return;
			}
			postData.reset();
			postData.addFile("file1", "file1.jpg", UploadBytes);
			
			urlRequest.data = postData.getPostData();
			urlRequest.url =  uploadUrl;
			urlRequest.contentType = "multipart/form-data; boundary=" + postData.getBoundary();
			urlRequest.method = URLRequestMethod.POST;
			urlRequest.requestHeaders.push(new URLRequestHeader("Cache-Control", "no-cache"));
			if (urlLoader == null)
			{
				urlLoader = new URLLoader();
			}
			urlLoader.dataFormat = URLLoaderDataFormat.BINARY;
			// Configure listeners
			urlLoader.addEventListener(ProgressEvent.PROGRESS, progressHandler );
			urlLoader.addEventListener(Event.COMPLETE, onUploadComplete);//DataEvent.UPLOAD_COMPLETE_DATA
			urlLoader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, onIOError); 
			var vkbox: BoxLite = new BoxLite( lang.confirm_box_text, 5, 250, ["OK", lang.cancel],MainPanel);
			vkbox.x = 5;
			vkbox.y = 20;//50;
			vkbox.addEventListener( Event.SELECT, function( e:Event ):void {
				trace( e.target.buttonClickedIndex ); 
				if (e.target.buttonClickedIndex==0){
					try {
						urlLoader.load(urlRequest);
						uploading = true;
						uploadButtons.visible = false;
						updView();
						//showLoader();
					} catch (error:Error) {
						debug(error);
						debug("Upload error");
						return;
					}
				} else {
					vkbox.setVisible(false);
				}
			});
			addChild(vkbox);
			vkbox.setVisible(true);
		}
     }});	 
   }

	
	private function progressHandler( e:ProgressEvent ):void  {  updView( Number(e.bytesLoaded) / e.bytesTotal );  }
    private function updView( ratio:Number = 0 ):void{
      vk.gui.Utils.rect( this, X , Y + 10, W, 34, 0xf7f7f7, 0xcccccc ); 
	  //vk.gui.Utils.rect( this, X + 17, Y + 110, 253, 34, 0xf7f7f7, 0xcccccc ); 
      if ( uploading ){
        const xx:uint = X + 7;
        const yy:uint = Y + 20;
        const w:uint = W-20;
        const h:uint = 14;
        vk.gui.Utils.rect( this, xx, yy, w, h, 0xffffff, 0xcccccc );
		vk.gui.Utils.rect( this, xx, yy, w * ratio, h, 0x5C7893, 0x36638E );
      }
    }
    
    
    private function onUploadComplete(e: Event): void {//DataEvent
      debug("Upload complete");
      debug('Data: ' + e.target.data);
      //showLoader(false);
	  uploading = false;
	  updView();
	  uploadButtons.visible = true;
	  
      var data: Object = JSON.decode(e.target.data);
		  if (data.photos_list) {
			dp.request('photos.save', { params: data, onComplete: function(response: Object): void {
				debug(response[0].id);
				debug("Image successfully saved.");
				if (ExternalInterface.available) {  
					ExternalInterface.call(config.onUploadComplete, response[0].id, response[0].aid); //onUploadComplete  |  onDebug | onFlashReady
				}
			}} );	
      } else debug("No PhotosList");
    }
    private function onSecurityError(e: SecurityErrorEvent): void {
      debug("Security error");
      //showLoader(false);
    }
    private function onIOError(e: IOErrorEvent): void {
      debug("IO error");
      //showLoader(false);
    }
    private function debug(msg: * ): void {
		if (ExternalInterface.available) {  
			ExternalInterface.call(config.onDebug, msg); //onUploadComplete  |  onDebug
		}
		trace(msg);
    }
	}
	
}
