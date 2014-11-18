package vk.gui
{
    import flash.events.*;
	import flash.display.*;
	import flash.utils.*;
	import caurina.transitions.*;

    public class ProgressBar extends Sprite
    {
        private var _height:Number = 17;
		private var _width:Number = 100;
		private var _trackw:Number = 35;
		private var _animated:Boolean = false;
		private var trackbar:Sprite;
		private var _maximum:Number = 100;
        private var _minimum:Number = 0;
        private var _value:Number = 0;
		
        private var _source:EventDispatcher;
		
		public function ProgressBar()
        {			
            trackbar = new Sprite();
			vk.gui.Utils.rect( trackbar, 0, 0, _trackw, _height, 0x5C7893, 0x36638E );
			addChild(trackbar);
			trackbar.alpha = 0;
			return;
        }

        public function set maximum(visible:Number) : void
        {
            this._maximum = visible;
            return;
        }

        public function setWidth(visible:Number) : void
        {
			_width = visible;
            return;
        }

        public function get minimum() : Number
        {
            return this._minimum;
        }

        public function reset() : void
        {
            this.value = 0;
            this.EndAnimate();
            return;
        }

        private function onProgressStart(event:Event) : void
        {
            removeEventListener(event.type, this.onProgressStart);
            this.EndAnimate();
            return;
        }

        public function get source() : EventDispatcher
        {
            return this._source;
        }

        public function set minimum(visible:Number) : void
        {
            this._minimum = visible;
            return;
        }



        public function get maximum() : Number
        {
            return this._maximum;
        }

        public function set value(visible:Number) : void
        {
            if (visible > this._maximum)
            {
                return;
            }
            this._value = visible;
			updView(this._value / this._maximum);
            return;
        }

        public function get percentComplete() : Number
        {
            return Math.floor(this._value / this._maximum * 100);
        }

        private function onProgress(event:ProgressEvent) : void
        {
            this.setProgress(event.bytesLoaded, event.bytesTotal);
			trace(event.bytesLoaded.toString(), event.bytesTotal.toString());
            return;
        }

        public function setProgress(visible:Number, visiblemax:Number = 0) : void
        {
            EndAnimate();
			this.value = visible;
            if (visiblemax > 0)
            {
                this.maximum = visiblemax;
            }
			updView(this._value / this._maximum);
            return;
        }
		


        public function get value() : Number
        {
            return this._value;
        }

        public function set source(visible:EventDispatcher) : void
        {
            if (this._source != null)
            {
                this._source.removeEventListener(ProgressEvent.PROGRESS, this.onProgress);
            }
            if (visible == null)
            {
                this._source = null;
                this.EndAnimate();
            }
            else
            {
                this._source = visible;
                this._source.addEventListener(Event.INIT, this.onProgressStart);
                this._source.addEventListener(ProgressEvent.PROGRESS, this.onProgress);
                this.Animate();
            }
            return;
        }

        private function updView( ratio:Number = 0 ):void{
     		const w:uint = _width;
     		const h:uint = _height;
     		vk.gui.Utils.rect( this, 0, 0, w, h, 0xffffff, 0xcccccc );
			vk.gui.Utils.rect( this, 0, 0, w * ratio, h, 0x5C7893, 0x36638E );
      		
		}
		private function updTrack( x:Number = 0 ):void{
			const w:uint = _width;
     		const h:uint = _height;
     		vk.gui.Utils.rect( this, 0, 0, w, h, 0xffffff, 0xcccccc );
      		
		}
		
		public function EndAnimate() : void
		{
			Tweener.removeTweens(trackbar);
			_animated = false;
			trackbar.visible = false;
			
		}
		public function Animate() : void
        {
			var alpha_start:Number = 0.5;
			var alpha_end:Number = 1;
			var alpha_time:Number = 0.5;
			var tween_time:Number = 1;
			_animated = true;
			updTrack();
			trackbar.alpha = 1;
			trackbar.visible = true;
			Tweener.removeTweens(trackbar);
			var toRight:Function;
			var toLeft:Function;
			toRight = function():void {
					if (!_animated) return;
					Tweener.removeTweens(trackbar);
					Tweener.addTween(trackbar, { alpha:alpha_start, time:alpha_time, transition:"linear",
						onComplete:function () : void {Tweener.addTween(trackbar, { alpha:alpha_end, time:alpha_time, transition:"linear" } );}
					});
					Tweener.addTween(trackbar, { x:_width - _trackw, time:tween_time, transition:"linear", onComplete:function () : void { toLeft(); }
					});
				};
			toLeft = function():void {
					if (!_animated) return;
					Tweener.removeTweens(trackbar);
					Tweener.addTween(trackbar, { alpha:alpha_start, time:alpha_time, transition:"linear",
						onComplete:function () : void {Tweener.addTween(trackbar, { alpha:alpha_end, time:alpha_time, transition:"linear"} );}
					});
					Tweener.addTween(trackbar, { x:0, time:tween_time, transition:"linear", onComplete:function () : void { toRight(); }
					});
				};
			
            toRight();
        }

    
	}
}

