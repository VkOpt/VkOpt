package vk.gui 
{
	import flash.events.*;
	import flash.display.*;
	/**
	 * ...
	 * @author KiberInfinity
	 */
	
    public class ProgressBar extends MovieClip
    {
        private var trackBar:MovieClip = new MovieClip();
        private var progressBar:MovieClip = new MovieClip();
		
		private var _maximum:Number = 100;
        private var _minimum:Number = 0;
        private var _value:Number = 0;
        private var _source:EventDispatcher;

        public function ProgressBar() { progressBar.width = 0;  return;    }
        public function get maximum() : Number{  return this._maximum;  }
        public function set maximum(param1:Number) : void{this._maximum = param1; return;}
        public function reset() : void{ this._value = 0;  return; }
        public function set value(param1:Number) : void
        {
            if (param1 > this._maximum) { return; }
            this._value = param1;
            progressBar.width = Math.ceil((trackBar.width - 2) * this._value / this._maximum);
            return;
        }// end function

        private function onProgress(event:ProgressEvent) : void
        {
            this.setProgress(event.bytesLoaded, event.bytesTotal);
            return;
        }// end function

        public function get minimum() : Number
        {
            return this._minimum;
        }// end function

        public function get value() : Number
        {
            return this._value;
        }// end function

        public function setProgress(param1:Number, param2:Number = 0) : void
        {
            this.value = param1;
            if (param2 > 0)
            {
                this.maximum = param2;
            }
            return;
        }// end function

        public function set source(param1:EventDispatcher) : void
        {
            if (this._source != null)
            {
                this._source.removeEventListener(ProgressEvent.PROGRESS, this.onProgress);
            }
            if (param1 == null)
            {
                this._source = null;
            }
            else
            {
                this._source = param1;
                this._source.addEventListener(ProgressEvent.PROGRESS, this.onProgress);
            }
            return;
        }// end function

        public function get source() : EventDispatcher
        {
            return this._source;
        }// end function

        public function set minimum(param1:Number) : void
        {
            this._minimum = param1;
            return;
        }// end function

        public function get percentComplete() : Number
        {
            return Math.floor(this._value / this._maximum * 100);
        }// end function

    }

}