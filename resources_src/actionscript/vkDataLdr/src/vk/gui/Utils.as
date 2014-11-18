// As agreed, all these functions and constants are public, but not documented yet.

package vk.gui
{
  import flash.display.DisplayObject;
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.text.TextFieldType;
  import flash.text.TextFieldAutoSize;
  import flash.text.TextFormat;
  import flash.text.TextFormatAlign;
  import flash.display.LineScaleMode;
  import flash.display.CapsStyle;
  import flash.display.JointStyle;


  /**
  * @author Alexey Kharkov
  */
  public class Utils
  {
    public static var fnm:String = "Tahoma";

    // VKontakte standard colors
    public static const BK_COL:int = 0xF7F7F7;
    
    public static const BLUE_BK_COL:int = 0xDAE1E8;
    public static const BLUE_TXT_COL:int = 0x36638e;

    public static const BORDER_COL:int = 0xd8dfea;
    public static const BORDER2_COL:int = 0xc0cad5;
    
    public static const ARROW_BG_COL:int = 0xe1e8ed;
    public static const ARROW_BG_BORDER_COL:int = 0xd2dbe0;
    
    public static const SEL_BG_COL:int = 0x5f83a5;
    public static const SEL_BG_BORDER_COL:int = 0x345f88;

    public static const BUT1_TXT_COL:int = 0x2B587A;

    // addText params
    public static const TXT_UNDERLINE:int = 0x0001;
    public static const TXT_BOLD:int = 0x0002;
    public static const TXT_MULTILINE:int = 0x0004;
    public static const TXT_CENTER:int = 0x0008;
    public static const TXT_AUTOSIZE:int = 0x0010;
    public static const TXT_INPUT:int = 0x0020;
    public static const TXT_BORDER:int = 0x0040;
    public static const TXT_HTML:int = 0x0080;
    

    // Rectangles
    public static function fillRect( obj:*, x:int, y:int, w:uint, h:uint, c:int, alpha:Number = 1.0 ):void
    {
      obj.graphics.lineStyle();
      obj.graphics.beginFill( c, alpha );
      obj.graphics.drawRect( x, y, w, h );
      obj.graphics.endFill();
    }
    
    public static function rect( obj:*, x:int, y:int, w:uint, h:uint, c:int, bc:int, alpha:Number = 1.0 ):void
    {
      fillRect( obj, x, y, w, h, c, alpha );
      hollowRect( obj, x, y, w, h, bc );
    }
    
    public static function hollowRect( obj:*, x:int, y:int, w:uint, h:uint, c:int ):void
    {
      obj.graphics.lineStyle( 1, c, 1.0, true, LineScaleMode.NORMAL, CapsStyle.SQUARE, JointStyle.MITER, 1.414 );
      obj.graphics.drawRect( x, y, w, h );
    }

    // Round rectangles
    public static function fillRRect( obj:*, x:int, y:int, w:uint, h:uint, c:int, r:int ):void
    {
      obj.graphics.lineStyle();
      obj.graphics.beginFill( c, 1.0 );
      obj.graphics.drawRoundRect( x, y, w, h, r );
      obj.graphics.endFill();
    }

    // Lines
    public static function line( obj:*, x1:Number, y1:Number, x2:Number, y2:Number, c:int, alpha:Number = 1.0 ):void
    {
      obj.graphics.lineStyle( 1, c, alpha, true, LineScaleMode.NORMAL, CapsStyle.SQUARE, JointStyle.MITER, 1.414 );
      obj.graphics.moveTo( x1, y1 );
      obj.graphics.lineTo( x2, y2 );
    }
    
    public static function horLine( obj:*, x1:int, x2:int, y:int, c:int, alpha:Number = 1.0 ):void
    {
      line( obj, x1, y, x2, y, c, alpha );
    }

    public static function vertLine( obj:*, x:int, y1:int, y2:int, c:int, alpha:Number = 1.0 ):void
    {
      line( obj, x, y1, x, y2, c, alpha );
    }

    public static function vertSeparator( obj:*, x:int = 0, y:int = 0 ):void
    {
      vertLine( obj, x    , y, y + 10, 0xe9be90 );
      vertLine( obj, x + 1, y, y + 10, 0xa7d4ff );
    }
    
    // Dash Lines
    public static function horDashLine( obj:*, x1:int, x2:int, y:int, c:int, step:uint = 4 ):void // Should be x2 > x1!
    {
      obj.graphics.lineStyle( 1, c );
      
      for ( var x:uint = x1; x < x2; x += 2*step )
      {
        obj.graphics.moveTo( x, y );
        obj.graphics.lineTo( Math.min(x2 + 1, x + step), y );
      }
    }
    
    public static function vertDashLine( obj:*, x:int, y1:int, y2:int, c:int, step:uint = 4 ):void // Should be y2 > y1!
    {
      obj.graphics.lineStyle( 1, c );
      
      for ( var y:uint = y1; y < y2; y += 2*step )
      {
        obj.graphics.moveTo( x, y );
        obj.graphics.lineTo( x, Math.min(y2 + 1, y + step) );
      }
    }

    // Dash rects
    public static function dashRect( obj:*, x:int, y:int, w:uint, h:uint, c:int, step:uint = 4 ):void
    {
      horDashLine( obj, x, x + w, y    , c, step );
      horDashLine( obj, x, x + w, y + h, c, step );
      
      vertDashLine( obj, x    , y, y + h, c, step );
      vertDashLine( obj, x + w, y, y + h, c, step );
    }
    
    // TextFields
    public static function getTxtFormat( fsz:int, prm:int = 0 ):TextFormat
    {
      var f:TextFormat = new TextFormat();
      f.font = fnm;
      f.size = fsz;
      f.underline = isPar(prm, TXT_UNDERLINE);
      f.bold = isPar(prm, TXT_BOLD);
      f.align = isPar(prm, TXT_CENTER) ? TextFormatAlign.CENTER : TextFormatAlign.LEFT;
      return f;
    }
    
    public static function setText( tf:TextField, s:String, isHtml:Boolean = false ):void
    {
      var f:TextFormat = tf.getTextFormat();
      
      if ( isHtml )
        tf.htmlText = s;
      else
        tf.text = s;
        
      tf.setTextFormat( f );
      updSz( tf );
    }
    
    public static function updSz( tf:TextField, hh:uint = 0, ww:uint = 0 ):void
    {
      tf.autoSize = TextFieldAutoSize.LEFT;
      var h:int = tf.height;
      var w:int = tf.width;
      tf.autoSize = TextFieldAutoSize.NONE;
      tf.height = (hh > 0  &&  hh < h) ? hh : h;
      tf.width  = (ww > 0  &&  ww < w) ? ww : w;
    }
    
    public static function addBorder( tf:TextField ):void
    {
      tf.background = true;
      tf.border = true;
      tf.borderColor = BORDER2_COL;
    }
    
    // To be refactored...
    public static function addText( x:int, y:int, w:int, fsz:int, s:String, tc:int = 0, prm:int = 0, h_:int = 0 ):TextField
    {
      var f:TextFormat = getTxtFormat( fsz, prm );
      
      var tf:TextField = new TextField();
      tf.defaultTextFormat = f;
      tf.setTextFormat( f );
      tf.x = x;
      tf.y = y;
      tf.width = w;

      if ( s == null )
        tf.text = "";
      else
      {
        if ( isPar(prm, TXT_HTML) )
          tf.htmlText = s;
        else
          tf.text = s;
      }
      
      if ( isPar(prm, TXT_MULTILINE) )
      {
        tf.wordWrap = true;
        tf.multiline = true;
      }

      if ( isPar(prm, TXT_AUTOSIZE)  ||  w == 0 )
        tf.autoSize = TextFieldAutoSize.LEFT;
        
      if ( isPar(prm, TXT_INPUT) )
      {
        tf.selectable = true;
        tf.mouseEnabled = true;
        tf.type = TextFieldType.INPUT;
      } else
      {
        //!!tf.selectable = false;
      }
      
      if ( isPar(prm, TXT_BORDER) )
      {
        addBorder( tf );
      }
      
      var h:int = (fsz * 1.6); // Magic constant...
      tf.height = (h_ == 0)  ?  h  :  h_;
      
      if ( isPar(prm, TXT_AUTOSIZE) )
      {
        h = tf.height;
        w = (w == 0) ? tf.width : Math.min( w, tf.width );
        tf.autoSize = TextFieldAutoSize.NONE;
        tf.height = h;
        tf.width = w;// + 2;
        if ( h_ > 0  &&  h_ < h )
          tf.height = h_;
      }
      
      tf.textColor = tc;
      
      if ( s != null  &&  isPar(prm, TXT_HTML) )
        tf.htmlText = s;

      return tf;
    }
    
    // ----------------------------------------------------------------- Internal methods.
    internal static function drawArrow( obj:*, x:uint, y:uint, down:Boolean, c:uint = 0 ):void
    {
      var dy:uint = down ? 1 : -1;

      Utils.horLine ( obj, x + 0, x + 6, y, c );
      Utils.horLine ( obj, x + 1, x + 5, y + dy, c );
      Utils.horLine ( obj, x + 2, x + 4, y + 2*dy, c );
      
      Utils.vertLine( obj, x + 3, y, y + 3*dy, c );
    }
    
    internal static function topParent( obj:DisplayObject ):DisplayObject
    {
      return (obj.parent as DisplayObject) 
        ? topParent( (obj.parent as DisplayObject) ) 
        : (obj as DisplayObject);
    }

    // ----------------------------------------------------------------- Private mehods.
    private static function isPar( p:int, pp:int ):Boolean
    {
      return (p & pp) != 0;
    }
  }
}