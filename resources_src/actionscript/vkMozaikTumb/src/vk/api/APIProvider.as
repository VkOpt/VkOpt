package vk.api {
  
  import flash.net.*;
  import flash.errors.*;
  import flash.events.*;
  
  import vk.api.serialization.json.*;
  
  public class APIProvider {
    public const API_SERVER_URL: String = "http://api.vkontakte.ru/api.php";
    
	private var _api_url: String;
    private var _api_id: Number;
    private var _api_secret: String;
    private var _viewer_id: Number;
    private var _test_mode: Boolean;
    private var _request_params: Array;
    
    private var _global_options: Object;
    
    
    
    public function APIProvider(api_id: Number, api_secret: String, viewer_id: Number, api_url:String, test_mode: Boolean = false) {
      _api_id     = api_id;
      _api_secret = api_secret;
      _viewer_id  = viewer_id;
      _test_mode  = test_mode;
	  _api_url	  = api_url;
    }
    
    public function setup(options: Object): void {
      _global_options = options;
    }
    
    public function request(method: String, options: Object = null):void {
      var onComplete: Function, onError: Function;
      if (options == null) {
        options = new Object();
      }
      options.onComplete = options.onComplete ? options.onComplete : (_global_options.onComplete ? _global_options.onComplete : null);
      options.onError = options.onError ? options.onError : (_global_options.onError ? _global_options.onError : null);
      _sendRequest(method, options);
    }
    
    
    
    /********************
     * Private methods
     ********************/

    private function _sendRequest(method:String, options:Object):void {
      var self:Object = this;
      
      var request_params: Object = {method: method};
      request_params.api_id = _api_id;
      request_params.format = "JSON";
      if (_test_mode) {
        request_params.test_mode = "1";
      }
      if (options.params) {
        for (var i: String in options.params) {
          request_params[i] = options.params[i];
        }
      }
      
      var variables:URLVariables = new URLVariables();
      for (var j: String in request_params) {
        variables[j] = request_params[j];
      }
      variables['sig'] = _generate_signature(request_params);
      
      var request:URLRequest = new URLRequest();
      request.url = _api_url;
      request.method = URLRequestMethod.POST;
      request.data = variables;
      
      var loader:URLLoader = new URLLoader();
      loader.dataFormat = URLLoaderDataFormat.TEXT;
      if (options.onError) {
        loader.addEventListener(IOErrorEvent.IO_ERROR, function():void {
          options.onError("Connection error occured");
        });
        loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, function():void {
          options.onError("Security error occured");
        });
      }
      
      loader.addEventListener(Event.COMPLETE, function(e:Event):void{
        var loader:URLLoader = URLLoader(e.target);
				trace(loader.data);
			  var data: Object = JSON.decode(loader.data);
        if (data.error) {
          options.onError(data.error);
        } else if (options.onComplete && data.response) {
          options.onComplete(data.response);
        }
      });
      try {
        loader.load(request);
      }
      catch (error:Error) {
        options.onError(error);
      }
    }

    /**
     * Generates signature
     *
     */
    private function _generate_signature(request_params: Object): String {
      var signature: String = "";
      var sorted_array: Array = new Array();
      for (var key: String in request_params) {
        sorted_array.push(key + "=" + request_params[key]);
      }
      sorted_array.sort();

      // Note: make sure that the signature parameter is not already included in
      //       request_params array.
      for (key in sorted_array) {
        signature += sorted_array[key];
      }
			if (_viewer_id > 0) signature = _viewer_id.toString() + signature;
      signature += _api_secret;
      return MD5.encrypt(signature);
    }
  }
}