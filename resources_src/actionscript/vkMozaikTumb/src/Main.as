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
	import vk.controls.LiteBox;
	
	import vk.*
	import vk.gui.*;
	import vk.controls.*;
	import vk.photo.*;
	//import hurlant.jpeg.as3_jpeg_wrapper;
	import com.adobe.images.*;
	import ru.inspirit.net.MultipartURLLoader;
	import ru.inspirit.net.events.MultipartURLLoaderEvent;
	
	/**
	 * ...
	 * @author KiberInfinity
	 */
	public class Main extends Sprite 
	{

		
		public var confirmText:TextField;
		public var confirmBox:LiteBox;
		private var progressBar:ProgressBar;
		private var progressBox:LiteBox;
		private var progressText:TextField;
		
		/* Main Menu */
		public var MainContainer:Sprite;
		private var main_menu:MainMenu;
		private var menu_item1:MenuItem = null; //* = null;
    	private var menu_item2:MenuItem = null;
		
		/* Page 1 */
		public var input:InputField;
		public var btn:SquareButton;
		public var upbtn:RoundButton;
		public var prep:SquareButton;		
		public var imagePreview:Sprite;
		public var Panel:Sprite;
		public var MainPanel:Sprite;
		
		/* Page 2 */
		public var browse:SquareButton;
		public var upload:SquareButton;	
		public var Preview:Sprite;
		public var Panel2:Sprite;
		public var MainPanel2:Sprite;		
		
		/* Others vars 1 */
		private var config:Object;
		private var lang:Lang;
		public var ThumbArr: Array;
		public var RawThumbs: Array;
		private var resizedImage: Bitmap;
		private var postData:UploadPostData;
		private var urlLoader:URLLoader;
		private var MMLoader:MultipartURLLoader;
		/* Others vars 2 */
		public var MThumbArr: Array;
		public var MRawThumbs: Array;
		

		/* Global vars */
		private var upload_url:String;
		private var redirect_url:String;
		private var small_thumb:ByteArray;
		private var normal_thumb:ByteArray;
		
		private var W:uint = 253;
		private var H:uint = 50;
		private var X:uint = 300;
		private var Y:uint = 0;
		private var uploading:Boolean = false;
		private var forceTerminate:Boolean = false;
		
		public static var FILE_FILTER:Array = ["Images (*.jpg, *.jpeg, *.gif, *.png)", "*.jpg;*.JPG;*.jpeg;*.JPEG;*.gif;*.GIF*.png;*.PNG"];
		
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
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// entry point
			config = Config.loadConfig(parent.loaderInfo); //getConfig();
			upload_url = config.upload_url;
			redirect_url = config.redirect_url;
			
			lang = Lang.getInstance();
            lang.language = config.language_id;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			stage.align = StageAlign.TOP_LEFT;
			
			contextMenu = new ContextMenu();
            contextMenu.hideBuiltInItems();
			var ciVkOpt:ContextMenuItem = new ContextMenuItem("VkOpt PhotoZ v1.5.2");
				contextMenu.customItems.push(ciVkOpt);
				ciVkOpt.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void{ navigateToURL(new URLRequest("http://vkopt.net"), "_blank");});
            
			var ciKiberInfinity:ContextMenuItem = new ContextMenuItem("Made by Raevskiy Mihail");
				contextMenu.customItems.push(ciKiberInfinity);
				ciKiberInfinity.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, function (e:Event): void { navigateToURL(new URLRequest("http://vk.com/id13391307"), "_blank"); } );
			
			postData = new UploadPostData();
			
			/*var bg:Sprite = new Sprite();
			Utils.fillRect( bg, 0, 0, 627, 4050, Utils.BK_COL );
			addChild( bg );*/
			
			/*MainContainer = new Sprite();
			main_menu = new MainMenu(null);
			main_menu.addEventListener( Event.CHANGE, onMenuNavigate );
			menu_item1 = main_menu.addItem( config.lang.default_photo, "loc1" );
			menu_item2 = main_menu.addItem( config.lang.multi_fake, "loc2" );
			//menu_item3 = main_menu.addItem( "Primitives drawing", "loc3" );
			//menu_item4 = main_menu.addItem( "Paginations", "loc4" );
			//menu_item5 = main_menu.addItem( "InputFields", "loc5" );
			MainContainer.addChild( main_menu );
			addChild(MainContainer);*/
			 
			 
			/* Page 1 */
			 input = new InputField(0, 30, 200);
			 input.textField.text = config.redirect_url;
			 upbtn = new RoundButton('Box', 70, 5);
			 Panel = new Sprite();
			 
			 btn = new SquareButton(config.lang.button_browse, 0, 5, Button.GRAY_BUTTON);
			 //Panel.addChild(btn);
			 browse = new SquareButton(config.lang.button_multi_browse, 0, 5, Button.GRAY_BUTTON);
			 Panel.addChild(browse);
			 prep = new SquareButton(config.lang.button_send, Panel.width + 10, 5);
			 Panel.addChild(prep);
			 prep.visible = false;
			 
			 
			 MainPanel = new Sprite();
			 MainPanel.x = 0;
			 MainPanel.y = 0;
			 Panel.x = 0;
			 
			var file:FileReference = new FileReference();
			file.addEventListener(Event.SELECT, function(e:Event): void {
				if (file.size == 0) {
					trace("File size is zero bytes");
					return;
				}
				var onFileLoaded:Function = function(e: Event): void {
					file.removeEventListener(Event.COMPLETE, onFileLoaded);
                    var data: ByteArray = ByteArray(e.target.data);
                    var imgLoader:Loader = new Loader();
					//showProgress("IMG");
					//progressBar.source = imgLoader.contentLoaderInfo;
					
					var onImgLoaded:Function=function(e: Event): void {
						var source: Bitmap = Bitmap(e.target.content);
						DrawParts(source);
						source.bitmapData.dispose();
						prep.visible = true;
					}
					
                	imgLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onImgLoaded);
                	//imgLoader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, onImageLoadError);
                 	//imgLoader.contentLoaderInfo.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onImageLoadError);
                    imgLoader.loadBytes(data, new LoaderContext(false));
					
				}
				file.addEventListener(Event.COMPLETE, onFileLoaded);				
				input.textField.text = file.name;
				file.load();
			});
			
			btn.addEventListener(MouseEvent.CLICK, function (e: MouseEvent): void {
					file.browse([new FileFilter(FILE_FILTER[0], FILE_FILTER[1])]);
			});
			
			prep.addEventListener(MouseEvent.CLICK, function (e: MouseEvent): void {
					postData.reset();
					ThumbArr = [];
					forceTerminate = false; 
					uploading = false;
					showProgress(config.lang.processing);
					progressBar.maximum = (RawThumbs.length+1)*2;
					progressBar.setProgress(0);
					setTimeout(function():void{
						var jenc:JPGEncoder = new JPGEncoder(100);
						//var small:Bitmap = ImageHelper.resize(resizedImage, 75, 99000);//75
						//small.bitmapData = PartOfBitmap(small.bitmapData, 0, 0, 75, ((small.height > 75)?75:small.height));
						
						/*var normal:Bitmap = ImageHelper.resize(resizedImage,640,480);
						var result:BitmapData = new BitmapData(640, 480,  false,  0xf7f7f7); 
						result.copyPixels(normal.bitmapData, 
										  new Rectangle(0, 0, normal.width, normal.height),                      
										  new Point((640 / 2) - (normal.width / 2), 0));
						//small_thumb = jenc.encode(small.bitmapData);*/
						if (forceTerminate) return;
						//normal_thumb = jenc.encode(result);
					
						progressBar.value++;
						if (forceTerminate) return;
						setTimeout(PrepareJPGThumbs, 700, RawThumbs, function():void { 
							showProgress(""); 
							showConfirm(config.lang.send_confirm + Helper.langDataSize(postData.dataSize, config.lang));
						});
					},700);	
			}); 
			
			browse.addEventListener(MouseEvent.CLICK, function (e: MouseEvent): void {
					files.browse([new FileFilter(FILE_FILTER[0], FILE_FILTER[1])]);
			});							 
			//menu_item1.panel.
			addChild(MainPanel);
			MainPanel.addChild(Panel);
			Panel.x = (stage.stageWidth / 2) - (Panel.width / 2);
			
			/* Page 2 
			upload = new SquareButton(config.lang.button_send, btn.width + 10, 5);	
			Preview = new Sprite();
			Panel2 = new Sprite();
			Panel2.addChild(browse);
			//Panel2.addChild(upload);
			Panel2.x = (stage.stageWidth / 2) - (Panel2.width / 2);
			Preview.y = Panel2.height + 2;
			MainPanel2 = new Sprite();
			MainPanel2.addChild(Panel2);
			MainPanel2.addChild(Preview);
			menu_item2.panel.addChild( MainPanel2 );
			*/
			
			var files:FileReferenceList = new FileReferenceList();
			files.addEventListener(Event.SELECT, onSelectFiles);

			InitBoxes();
			ResizeStage();
		}
		
		/* Page 2*/
		private function onSelectFiles(event: Event) : void {
           // var request: URLRequest = new URLRequest("http://www.[yourdomain].com/fileUploadScript.cfm");
		   	MThumbArr = [];
			MRawThumbs = [];
            var file: FileReference;
            var files: FileReferenceList = FileReferenceList(event.target);
			
            var selectedFileArray: Array = files.fileList;
			showProgress("Loadin...");
			progressBar.maximum = selectedFileArray.length;
            for (var i: uint = 0; i < selectedFileArray.length; i++) {
                file = FileReference(selectedFileArray[i]);
                file.addEventListener(Event.COMPLETE, onFileLoaded);
				if (file.size == 0) {
					trace("File size is zero bytes");
					return;
				}
                try {
					file.load();//upload(request);
                } catch(error: Error) {
                    trace("Unable to upload files.");
                }
            }
			//file.addEventListener(Event.COMPLETE, onFileLoaded);	
        }
		private function onFileLoaded(event: Event): void {
					//e.target.removeEventListener(Event.COMPLETE, onFileLoaded);
					//trace('loaded: ' + event.target.name);
                    var data: ByteArray = ByteArray(event.target.data);
                    var imgLoader:Loader = new Loader();					
					var onImgLoaded:Function=function(e: Event): void {
						var source: Bitmap = Bitmap(e.target.content);
						MThumbArr.push(ImageHelper.resize(source, 520, 650));
						trace('loaded: ' + event.target.name + "("+(progressBar.value+1).toFixed()+'/'+progressBar.maximum.toFixed()+")" );
						source.bitmapData.dispose();
						if ((progressBar.value+1) == (progressBar.maximum) ) {
							showProgress("");
							
							GenerateMultiFoto(MThumbArr);
						}
						progressBar.value = MThumbArr.length;

					}
					
                	imgLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, onImgLoaded);
                	imgLoader.loadBytes(data, new LoaderContext(false));
					
		}
		
		private function GenerateMultiFoto(bitmaps:Array):void {
						var pad:uint = 24;
						var ipx:uint = 5;
						var ipy:uint = 40;
						var border:uint = 0;
						var cut:uint = 20;
						var i:uint = 0; var k:uint = 0;	
						var part:BitmapData;
						var rows:uint = 1;
						MRawThumbs = [];
						
						//resizedImage = ImageHelper.resize(source, 520, 16000);//650
						
					
						
						//var col:uint = resizedImage.bitmapData.width / 4;
						//var row:uint = resizedImage.bitmapData.height / rows;
						//input.textField.text = col.toString()+'x'+row.toString();

						if (Preview && MainPanel.contains(Preview)) {
							MainPanel.removeChild(Preview);
							Preview = null;
						}
						Preview = new Sprite();
						Preview.x = ipx;
						Preview.y = ipy;
						
						//MainPanel2.addChild(Preview);  
						RawThumbs = [];
						for (k = 0; k < bitmaps.length; k++ )
						{
							/*part = PartOfBitmap(resizedImage.bitmapData, i * col, k * row, col, row);
							DrawPart(imagePreview, part, border, col, row, i * col + pad * i, k * row + pad * k);
							RawThumbs.push(part);*/
							var BitMap:Bitmap = bitmaps[k];
							
							BitMap.x = 0;
							BitMap.y = Preview.height;
							MRawThumbs.push(Preview.height);
							Preview.addChild(BitMap);
						}
						
						setTimeout(function():void {
							var  bmd:BitmapData = new BitmapData(Preview.width, Preview.height);
							bmd.draw(Preview);
							for (i = 1; i < MRawThumbs.length; i++ ){
								bmd.applyFilter(bmd,new Rectangle(0,MRawThumbs[i]-2, bmd.width, 4),new Point(0,MRawThumbs[i]-2),new BlurFilter(0,2,BitmapFilterQuality.HIGH));
							}							
							var source: Bitmap = new Bitmap(bmd);
							DrawParts(source);
							
							source.bitmapData.dispose();
							prep.visible = true;	
							//main_menu.selectedItem = menu_item1;
						},100);

						
						/*var jenc:JPGEncoder = new JPGEncoder(100);
						bmd.draw(Preview);
						var ba:ByteArray = jenc.encode(bmd);
						var file:FileReference = new FileReference();
						showProgress("Saving");
						progressBar.source = file;
						file.addEventListener(Event.COMPLETE, function():void{showProgress("")}); 
						file.save(ba, "MyDrawing.png"); */
							
						Preview.x = (stage.stageWidth / 2) - (Preview.width / 2); 
						ResizeStage();
		
		}
		
		
		/* End Page 2 */
		
         private function onMenuNavigate( e:Event ):void
         {
            ResizeStage();
			 /*if ( e.target is VK.MainMenu )
            {
              menu_item2.panel.addChild( VK.addText( "Menu Item Navigated: " + e.target.selectedItem.label, 20, last_y_2 ) );
              last_y_2 += 18;
              resizeStage( menu_item2.panel.y + last_y_2 );
            }*/
         }		
		
		public function InitBoxes() : void {
				  confirmBox = new LiteBox();
				  var cfBoxContent:Sprite = new Sprite();
				  var cfBoxForm:Sprite = new Sprite();
				  Utils.rect(cfBoxForm, 0, 0, 280, 130, 0xdae2e8, 0xadbbca, 1);
				  Utils.rect(cfBoxForm, 10, 10, 260, 110, 0xffffff, 0xffffff, 1);
				  cfBoxContent.x = 20;
				  cfBoxContent.y = 20;
				  cfBoxForm.addChild(cfBoxContent);
				  Utils.fillRect(cfBoxContent, 0, 0, 240, 90, 16777215, 0);
                  confirmText = Utils.addText(0, 15, 240, 11, "", 0, Utils.TXT_CENTER | Utils.TXT_HTML);
                  cfBoxContent.addChild(confirmText);
                  var cfBoxClose:RoundButton = new RoundButton(config.lang.button_cancel, 0, 0, Button.GRAY_BUTTON);
                  cfBoxClose.addEventListener(MouseEvent.CLICK, function (event:Event) : void{
                      confirmBox.hide();
                      return;
                  });
                  cfBoxClose.x = cfBoxContent.width - cfBoxClose.width;
                  cfBoxClose.y = cfBoxContent.height - cfBoxClose.height;
                  cfBoxContent.addChild(cfBoxClose);
                  var cfBoxSend:* = new RoundButton(config.lang.button_send, 0, 0);
                  cfBoxSend.addEventListener(MouseEvent.CLICK, onSendConfirmClick);
                  cfBoxSend.x = cfBoxClose.x - cfBoxSend.width - 10;
                  cfBoxSend.y = cfBoxClose.y;
                  cfBoxContent.addChild(cfBoxSend);
                  confirmBox.content = cfBoxForm;
                  confirmBox.y = 150;
                  confirmBox.x = Math.round((stage.stageWidth - confirmBox.width) / 2);
                  addChild(confirmBox);
				  
      			  progressBox = new LiteBox();
                  var prBoxContent:Sprite = new Sprite();
				  var prBoxForm:Sprite = new Sprite();
				  Utils.rect(prBoxForm, 0, 0, 280, 130, 0xdae2e8, 0xadbbca, 1);
				  Utils.rect(prBoxForm, 10, 10, 260, 110, 0xffffff, 0xffffff, 1);
				  prBoxContent.x = 20;
				  prBoxContent.y = 20;
				  prBoxForm.addChild(prBoxContent);
                  Utils.fillRect(prBoxContent, 0, 0, 240, 90, 0xffffff, 1);
                  progressText = Utils.addText(0, 0, 240, 11, "", 0, Utils.TXT_CENTER | Utils.TXT_HTML);
                  prBoxContent.addChild(progressText);
                  progressBar = new ProgressBar();
                  progressBar.setWidth(240);
                  progressBar.y = 35;
                  prBoxContent.addChild(progressBar);
                  var prBoxClose:RoundButton = new RoundButton(config.lang.button_terminate, 0, 0, Button.GRAY_BUTTON);
                  prBoxClose.addEventListener(MouseEvent.CLICK, onTerminateClick);
                  prBoxClose.x = prBoxContent.width - prBoxClose.width;
                  prBoxClose.y = prBoxContent.height - prBoxClose.height;
                  prBoxContent.addChild(prBoxClose);
                  progressBox.content = prBoxForm;//prBoxContent
                  progressBox.y = 150;
                  progressBox.x = Math.round((stage.stageWidth - progressBox.width) / 2);
                  addChild(progressBox);
				  
				  progressBox.addEventListener(BasePanel.EVENT_SHOW, onPanelsShow);
				  progressBox.addEventListener(BasePanel.EVENT_HIDE, onPanelsHide);
            	  confirmBox.addEventListener(BasePanel.EVENT_SHOW, onPanelsShow);
            	  confirmBox.addEventListener(BasePanel.EVENT_HIDE, onPanelsHide);
		}
		
        public function showConfirm(label:String) : void{
            if (label == ""){
                confirmBox.hide();
            } else {
				confirmText.htmlText = label;
				confirmBox.y = (MainPanel.height<150+confirmBox.height)?0:150;
                confirmBox.show();
            }
            return;
        }
		public function showProgress(label:String) : void{
            if (label == ""){
                progressBox.hide();
            } else {
                progressText.htmlText = label;
				progressBox.y = (MainPanel.height<150+progressBox.height)?0:150;
                progressBar.value = 0;
                progressBox.show();
            }
            return;
        }
		public function onTerminateClick(event:MouseEvent) : void
        {
            /*if (!this.uploading){
                this.forceTerminate = true;
                return;
            }*/
            forceTerminate = true;
			if (urlLoader)   urlLoader.close();
            progressBox.hide();
            //this.uploading = false;
            return;
        }
		
		public function onPanelsShow(event:Event) : void{
            MainPanel.filters = [new BlurFilter(5, 5, BitmapFilterQuality.HIGH)];
        }
		public function onPanelsHide(event:Event) : void{
            MainPanel.filters = [];
        }
		
		public function DrawParts(source: Bitmap,cutlines:Boolean=false) : void {
						var pad:uint = 5;//24;
						var ipx:uint = 5;
						var ipy:uint = 40;
						var border:uint = 0;//6;
						var cut:uint = 20;
						var i:uint = 0; var k:uint = 0;	
						var part:BitmapData;
						var rows:uint = 1;//5;
						var cols:uint = 6;
						
						resizedImage = ImageHelper.resize(source, 480, 604);//650
						var result:BitmapData = resizedImage.bitmapData;//new BitmapData(520, resizedImage.bitmapData.height,  false,  0xf7f7f7); 
						/*result.copyPixels(resizedImage.bitmapData, 
										  new Rectangle(0, 0, resizedImage.width, resizedImage.height),                      
										  new Point((480 / 2) - (resizedImage.width / 2), 0));*/
						//showProgress("IMG");
					
						
						var col:uint = result.width / cols;//resizedImage.bitmapData
						var row:uint = result.height / rows;
						input.textField.text = col.toString()+'x'+row.toString();

						if (imagePreview && MainPanel.contains(imagePreview)) {
							MainPanel.removeChild(imagePreview);
							imagePreview = null;
						}
						imagePreview = new Sprite();
						imagePreview.x = ipx;
						imagePreview.y = ipy;
						
						MainPanel.addChild(imagePreview);  
						RawThumbs = [];
						for (k = 0; k < rows; k++ )
							for (i = 0; i < cols; i++ ){
								part = PartOfBitmap(result, i * col, k * row, col, row);
								DrawPart(imagePreview, part, border, col, row, i * col + pad * i, k * row + pad * k);
								RawThumbs.push(part);
							}
						imagePreview.x = (stage.stageWidth / 2) - (imagePreview.width / 2); 
						//var new_height:String = MainPanel.height.toFixed();
						ResizeStage();
		}
		public function ResizeStage(new_height:String=""):void {
			if (new_height == "") new_height = MainPanel.height.toFixed();//MainContainer
			if (ExternalInterface.available) {  
				ExternalInterface.call(config.onResize, new_height); 
			}
			else { 
				trace(config.onResize+": "+new_height); 
			}
			//else {  navigateToURL(new URLRequest("javascript:vkOnFlashResize('"+new_height+"')"), '_self');}
		}
		

		public function PrepareJPGThumbs(images:Array,callback:Function):void {
						if (forceTerminate) return;
						var jenc:JPGEncoder = new JPGEncoder(100);
						var part:BitmapData;
						var mini:Bitmap;
						var bytes:ByteArray;
						var thumb75:ByteArray;
						if (images.length != ThumbArr.length){
								part = images[ThumbArr.length];//.shift();
								bytes = jenc.encode(part); 
								progressBar.value++;
								setTimeout(function():void { 
									//mini = new Bitmap(part);
									//var small:Bitmap = ImageHelper.resize(mini, 75, 99000);//75
									//thumb75 = jenc.encode(small.bitmapData);
								
									postData.addFile("file" + ThumbArr.length, "file" + ThumbArr.length + ".jpg", bytes);//normal_thumb);
									//postData.addFile("Thumbnail2_" + ThumbArr.length, "Thumbnail2_" + ThumbArr.length + ".jpg", thumb75);//small_thumb
									//postData.addFile("Thumbnail3_" + ThumbArr.length, "Thumbnail3_" + ThumbArr.length + ".jpg", bytes);
									ThumbArr.push(bytes);
									progressBar.value++;
									setTimeout(PrepareJPGThumbs, 20, images, callback);	
								}, 20);
								
						} else {  
							callback();
						}				
		}
		
		public function onSendConfirmClick(e:Event) : void
        {
			showProgress(config.lang.sending);
			
			var urlRequest:URLRequest = new URLRequest();
            urlRequest.data = this.postData.getPostData();
            urlRequest.url = upload_url;
            urlRequest.contentType = "multipart/form-data; boundary=" + this.postData.getBoundary();
            urlRequest.method = URLRequestMethod.POST;
            urlRequest.requestHeaders.push(new URLRequestHeader("Cache-Control", "no-cache"));
            if (urlLoader == null) { urlLoader = new URLLoader();   }
            var onImagesUploded:Function = function(e:Event):void {
				//navigateToURL(new URLRequest(redirect_url), "_self"); 
				var data:String = URLLoader(e.target).data;
				data = vk_string_escape(data);
				//trace("completeHandler: " + loader.data);
				if (ExternalInterface.available) {  
					ExternalInterface.call(config.onDone, data); 
				}
				else { 
					trace(config.onDone+": "+data); 
				}
				//var vars:URLVariables = new URLVariables(loader.data);
				//trace("The answer is " + vars.answer);
			};
			urlLoader.dataFormat = URLLoaderDataFormat.BINARY;			
			urlLoader.addEventListener(Event.COMPLETE, onImagesUploded);
			progressBar.source = urlLoader; //urlLoader.addEventListener( ProgressEvent.PROGRESS , UploadProgressHandler );
            try{
                urlLoader.load(urlRequest);
            } catch (error:Error) {
                trace(error.message);
            }
            return;
        }
		public function PartOfBitmap(orign:BitmapData,x:uint,y:uint,w:uint,h:uint):BitmapData {
						var rect:Rectangle = new Rectangle(x, y, w, h);
						var rect2:Rectangle = new Rectangle(0, 0, w, h);
						var cell:ByteArray = orign.getPixels(rect);
						cell.position = 0;
						var part:BitmapData = new BitmapData(w, h);
						part.setPixels(rect2, cell);
						return part;
		}
		
		
		public function DrawPart(imagePreview:Sprite, part:BitmapData, border:uint,col:uint,row:uint, xx:uint,yy:uint) : void {
						var BitMap:Bitmap = new Bitmap(part);
						BitMap.x = border+xx;
						BitMap.y = border+yy;
						imagePreview.addChild(BitMap);
						if (border>0)
							Utils.rect( imagePreview , xx , yy, col+border*2, row+border*2,  0xffffff, 0xcccccc ); 			
		}
		
		private function UploadProgressHandler( e:ProgressEvent ):void  {   
				trace("progressHandler loaded:" + e.bytesLoaded + " total: " + e.bytesTotal);
		}

		
	}
	
}