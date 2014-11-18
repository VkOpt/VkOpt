package vk.photo {

	import flash.events.*;
	import flash.net.*;
	import flash.utils.ByteArray;
	import flash.utils.Endian;

	/**
	 * Take a fileName, byteArray, and parameters object as input and return ByteArray post data suitable for a UrlRequest as output
	 *
	 * @see http://marstonstudio.com/?p=36
	 * @see http://www.w3.org/TR/html4/interact/forms.html
	 * @see http://www.jooce.com/blog/?p=143
	 * @see http://www.jooce.com/blog/wp%2Dcontent/uploads/2007/06/uploadFile.txt
	 * @see http://blog.je2050.de/2006/05/01/save-bytearray-to-file-with-php/
	 *
	 * @author Jonathan Marston
	 * @version 2007.08.19
	 *
	 * This work is licensed under a Creative Commons Attribution NonCommercial ShareAlike 3.0 License.
	 * @see http://creativecommons.org/licenses/by-nc-sa/3.0/
	 *
	 */
	public class UploadPostData {

		/**
		 * Boundary used to break up different parts of the http POST body
		 */
		private var _boundary:String = "";
    private var _post_data:ByteArray;
    
    
    public function UploadPostData()
    {
      _post_data = new ByteArray();
      _post_data.endian = Endian.BIG_ENDIAN;
    }
    
    public function get dataSize():int
    {
      return _post_data.length;
    }
    public function reset(): void
    {
      _post_data = null;
      _post_data = new ByteArray();
      _boundary = "";
    }
    
		/**
		 * Get the boundary for the post.
		 * Must be passed as part of the contentType of the UrlRequest
		 */
		public function getBoundary():String
		{

			if(_boundary.length == 0) {
				for (var i:int = 0; i < 0x20; i++ ) {
					_boundary += String.fromCharCode( int( 97 + Math.random() * 25 ) );
				}
			}

			return _boundary;
		}
		
		public function addParams(parameters: Object):void
		{
		  var i: int;
  		var bytes:String;
		  //add parameters to _post_data
			for(var name:String in parameters) {
				_post_data = BOUNDARY(_post_data);
				_post_data = LINEBREAK(_post_data);
				bytes = 'Content-Disposition: form-data; name="' + name + '"';
				for ( i = 0; i < bytes.length; i++ ) {
					_post_data.writeByte( bytes.charCodeAt(i) );
				}
				_post_data = LINEBREAK(_post_data);
				_post_data = LINEBREAK(_post_data);
				_post_data.writeUTFBytes(parameters[name]);
				_post_data = LINEBREAK(_post_data);
			}
		}
		
		public function addFile(input_name: String, file_name: String, byte_array: ByteArray):Boolean
		{
		  var i: int;
			var bytes:String;

			//add Filedata to _post_data
			_post_data = BOUNDARY(_post_data);
			_post_data = LINEBREAK(_post_data);
			bytes = 'Content-Disposition: form-data; name="' + input_name + '"; filename="';
			for ( i = 0; i < bytes.length; i++ ) {
				_post_data.writeByte( bytes.charCodeAt(i) );
			}
			_post_data.writeUTFBytes(file_name);
			_post_data = QUOTATIONMARK(_post_data);
			_post_data = LINEBREAK(_post_data);
			bytes = 'Content-Type:  image/jpeg';
			for ( i = 0; i < bytes.length; i++ ) {
				_post_data.writeByte( bytes.charCodeAt(i) );
			}
  		_post_data = LINEBREAK(_post_data);
			bytes = 'Content-Transfer-Encoding: binary';
			for ( i = 0; i < bytes.length; i++ ) {
				_post_data.writeByte( bytes.charCodeAt(i) );
			}
			_post_data = LINEBREAK(_post_data);
			_post_data = LINEBREAK(_post_data);
			_post_data.writeBytes(byte_array, 0, byte_array.length);
			_post_data = LINEBREAK(_post_data);

			return true;
		}

		/**
		 * Return post data
		 */
		public function getPostData():ByteArray {
		  //closing boundary
		  var postData: ByteArray = BOUNDARY(_post_data);
		  postData = DOUBLEDASH(postData);
			return postData;
		}

		/**
		 * Add a boundary to the _post_data with leading doubledash
		 */
		private function BOUNDARY(p:ByteArray):ByteArray {
			var l:int = getBoundary().length;

			p = DOUBLEDASH(p);
			for (var i:int = 0; i < l; i++ ) {
				p.writeByte( _boundary.charCodeAt( i ) );
			}
			return p;
		}

		/**
		 * Add one linebreak
		 */
		private function LINEBREAK(p:ByteArray):ByteArray {
			p.writeShort(0x0d0a);
			return p;
		}

		/**
		 * Add quotation mark
		 */
		private function QUOTATIONMARK(p:ByteArray):ByteArray {
			p.writeByte(0x22);
			return p;
		}

		/**
		 * Add Double Dash
		 */
		private function DOUBLEDASH(p:ByteArray):ByteArray {
			p.writeShort(0x2d2d);
			return p;
		}

	}
}