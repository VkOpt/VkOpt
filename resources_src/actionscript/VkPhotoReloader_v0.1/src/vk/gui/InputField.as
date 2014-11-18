package vk.gui 
{
  import flash.display.Sprite;
  import flash.events.Event;
  import flash.events.MouseEvent;
  import flash.events.TextEvent;
  import flash.events.KeyboardEvent;
  import flash.text.TextField;
  import flash.text.TextFormat;

  /**
  * @author Andrew Rogozov
  * @modified by Alexey Kharkov
  */
  public class InputField extends Sprite
  {
    public static const EVENT_MODIFIED:String = "modified";
    
    private static const STD_HEIGHT:uint = 21;
    private static const FONT_SZ:Number = 11;
    private static const LINE_H:Number = FONT_SZ + 2;
    
    private var tf:TextField = null;
    private var editable:Boolean = true;
		private var sb:ScrollBar = null;
    private var multiline:Boolean = false;
    private var w:uint = 0;
    private var pgSz:uint = 0;

    public function InputField( x:uint, y:uint, width:uint, linesCount:uint = 1, editable:Boolean = true, border:Boolean = true )
    {
      this.x = x;
      this.y = y;
      this.w = width;
      this.editable = editable;
      
      pgSz = linesCount * LINE_H;
      var height:uint = 6 + pgSz;
      
			var flags:uint = editable ? Utils.TXT_INPUT : 0;
      
      if ( height < STD_HEIGHT )
        height = STD_HEIGHT;
      else
      if ( height > STD_HEIGHT )
      {
        multiline = true;
        flags |= Utils.TXT_MULTILINE;
      }
      
      if ( border )
        Utils.rect( this, 0, 0, width, height, 0xFFFFFF, 0xc0cad5 );
      
      tf = Utils.addText( 4, 2, width - 2, 11, "", 0x000000, flags, height - 2 );
      tf.selectable = true;
			tf.maxChars = 0x7fff;
      addChild( tf );
      
      // Add ScrollBar for multiline InputField
      if ( multiline  &&  height > ScrollBar.MIN_H )
      {
        sb = new ScrollBar( width - ScrollBar.W, 0, height );
        updSb();
        
        sb.lineScrollSize = LINE_H * 2;
        sb.addEventListener( Event.SCROLL, onBarScroll );
        addChild( sb );
        
        tf.addEventListener( MouseEvent.ROLL_OVER, function(e:Event):void { MouseWheel.capture(); } );
        tf.addEventListener( MouseEvent.ROLL_OUT , function(e:Event):void { MouseWheel.release(); } );
        
        tf.addEventListener( Event.SCROLL, onTextScroll );
        if ( editable )
          tf.addEventListener( Event.CHANGE, onTextChange );
      }
      
      if ( editable )
        tf.addEventListener( KeyboardEvent.KEY_DOWN, onKey );
    }
    
    public function setFocus():void
    {
      tf.stage.focus = tf;
      tf.setSelection( tf.length, tf.length );
    }

    public function get textField():TextField
    {
      return tf;
    }

    public function get value(): String
    {
      return tf.text;
    }

    public function set value( text:String ):void
    {
      tf.text = text;
      updSb();
    }
    
    public override function get width():Number
    {
      return w;
    }
    
    public override function get height():Number
    {
      return tf.height;
    }
    
    public function get textHeight():Number
    {
      return tf.textHeight;
    }
    
    // -------------------------------------------------------------------- Event handlers
		private function updSb():void // Update ScrollBar
		{
      if ( sb == null )
        return;
      
			if ( tf.textHeight <= tf.height )
      {
				sb.visible = false;
        tf.width = w - 2;
        return;
      }

      tf.width = sb.x - 2;
      tf.text = tf.text;

      var maxPos:Number = tf.textHeight - pgSz;
      //var maxPos:Number = LINE_H * tf.numLines - pgSz;

      sb.init( maxPos, pgSz );
      sb.visible = true;
		}

		private function onTextChange( e:Event ):void
		{
			updSb();
		}

		private function onKey( e:KeyboardEvent ):void
		{
			if ( e.keyCode == 13  &&  !multiline )// &&  (e.ctrlKey  ||  !multiline) )
        dispatchEvent( new Event( EVENT_MODIFIED ) );
		}

    private function onBarScroll( e:Event ):void
    {
      tf.removeEventListener( Event.SCROLL, onTextScroll );
      tf.scrollV = 1 + Math.ceil( sb.scrollPosition / LINE_H );
      tf.addEventListener( Event.SCROLL, onTextScroll );
    }
    
    public function onTextScroll( e:Event ):void
    {
      sb.scrollPosition = Math.round( (tf.scrollV - 1) * LINE_H );
    }

  }
}