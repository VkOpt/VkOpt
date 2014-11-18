package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.events.MouseEvent;
  import flash.events.Event;
  
  /**
  * @author Alexey Kharkov
  */
  public class Box extends Sprite
  {
    private var but_clicked:uint = 0;
    private var sb:ScrollBar = null;
    private var txt:TextField = null;
    private var obj:* = null;
    private var w:uint = 0;
    private var h:uint = 0;
    
    public static var STAGE_WIDTH:uint = 627;
    
    private static const BORDER_W:uint = 12;
    private static const TITLE_H:uint = 29;
    private static const BOTTOM_H:uint = 42;
    private static const FONT_SZ:Number = 11;
    private static const LINE_H:Number = FONT_SZ + 2;

    private static const MAX_CONTENT_HEIGHT:uint = 4 + LINE_H * 35;
    
    private static const CONTENT_X:uint = 12;
    private static const CONTENT_Y:uint = TITLE_H + 14;
    private static const BOTTOM_DY:uint = 27;
    
    public function Box( title:String, content:*, y:int, w_:uint, buttons:Array ):void
    {
      this.w = w_;
      this.x = Math.round( (STAGE_WIDTH - w) / 2 );
      this.y = y;
      
      var trasp_bg:Sprite = new Sprite();
      Utils.fillRect( trasp_bg, -10000, -10000, 20000, 20000, 0, 0.0 );
      //Utils.fillRect( trasp_bg, -this.x, -this.y, root.width, root.height, 0, 0.0 );
      addChild( trasp_bg );
      
      var needScroll:Boolean = false;
      var pgSz:Number = 1;
      var maxPos:Number = 1;
      var lineSz:uint = 1;
      
      // Content
      if ( content is String )
      {
        txt = Utils.addText( CONTENT_X, CONTENT_Y, w - 2*CONTENT_X, FONT_SZ, content as String, 0, Utils.TXT_MULTILINE | Utils.TXT_AUTOSIZE );
        addChild( txt );
        h = txt.y + txt.textHeight + BOTTOM_DY + BOTTOM_H;
        
        if ( txt.textHeight > MAX_CONTENT_HEIGHT )
        {
          txt.width = w - 3 * CONTENT_X;
          Utils.updSz( txt, MAX_CONTENT_HEIGHT );
          h = txt.y + MAX_CONTENT_HEIGHT + BOTTOM_DY + BOTTOM_H;
          
          needScroll = true;
          pgSz = txt.height;
          maxPos = Math.round( txt.textHeight - pgSz );
          
    			txt.addEventListener( Event.SCROLL, onTextScroll );
        }
      } else
      {
        // Content is DisplayObject
        
        obj = content;
        
        content.x = 1;
        content.y = TITLE_H + 1;
        addChild( content );
        
        if ( content.height > MAX_CONTENT_HEIGHT )
        {
          if ( w == 0 )
            w = content.width + ScrollBar.W + 1;
          
          needScroll = true;
          pgSz = MAX_CONTENT_HEIGHT;
          maxPos = content.height - pgSz;
          lineSz = 10;
          
          content.mask = maskRect();
          //content.x -= 8;
          h = content.y + Math.max( ScrollBar.MIN_H + 2, Math.min( MAX_CONTENT_HEIGHT, content.height ) ) + BOTTOM_H;
          
          addEventListener( MouseEvent.MOUSE_WHEEL, onWheel );
        } else
        {
          if ( w == 0 )
            w = content.width + 1;
          
          h = content.y + content.height + BOTTOM_H;
        }
        
        this.x = Math.round( (STAGE_WIDTH - w) / 2 );
      }
      
      // Title
      addChild( Utils.addText( 9, 5, w - 10, 13, title, 0xffffff, Utils.TXT_BOLD ) );
      
      // Background
      Utils.fillRect( this, -BORDER_W, -BORDER_W, w + 2 * BORDER_W, h + 2 * BORDER_W, 0xCAD1D9, 0.84 );
      Utils.rect( this, 0, 0, w, h, 0xffffff, 0xaaaaaa );
      Utils.fillRect( this, 0, 0, w, TITLE_H, 0x4b769f );
      Utils.horLine( this, 1, w-1, 1, 0x6088b3 );
      Utils.horLine( this, 1, w-1, TITLE_H - 1, 0x466e94 );
      
      // Bottom
      Utils.fillRect( this, 0, h - BOTTOM_H, w, BOTTOM_H, 0xf2f2f2 );
      Utils.horLine( this, 1, w - 1, h - BOTTOM_H, 0xcccccc );
      
      // Border
      Utils.hollowRect( this, 0, 0, w, h, 0xaaaaaa );
      Utils.hollowRect( this, 0, 0, w, TITLE_H, 0x45688e );
      
      // Buttons
      var xx:int = w - 10;
      var yy:int = h - BOTTOM_H + 8;
      for ( var i:int = buttons.length - 1; i >= 0; --i )
      {
        var but:* = new SquareButton( buttons[i], xx, yy, (i==0) ? Button.BLUE_BUTTON : Button.GRAY_BUTTON );
        but.x -= but.width;
        xx = but.x - 10;
        addChild( but );
        
        but.idx = i;
        but.addEventListener( MouseEvent.CLICK, onBut );
      }
      
      //
      if ( obj )
        setChildIndex( obj, numChildren - 1 );
      
      // Scroll bar
      if ( needScroll )
      {
        sb = new ScrollBar( w - 16, TITLE_H, h - TITLE_H - BOTTOM_H );
        sb.init( maxPos, pgSz );
        sb.lineScrollSize = lineSz;
        sb.addEventListener( Event.SCROLL, onScroll );
        addChild( sb );
        
        var sp:Sprite = new Sprite();
        Utils.horLine( sp, 0, w, 0, 0x45688e );
        sp.y = TITLE_H;
        addChild( sp );
      }

      //
      visible = false;
    }
    
    public function setVisible( vis:Boolean ):void
    {
      visible = vis;
      if ( vis )
        MouseWheel.capture();
      else
        MouseWheel.release();
    }
    
    public function get buttonClickedIndex():uint
    {
      return but_clicked;
    }

    public override function get width():Number
    {
      return w;
    }
    
    public override function get height():Number
    {
      return h;
    }

    // ------------------------------------------------------------------------------- Private methods
    private function maskRect():Sprite
    {
      var ss:Sprite = new Sprite();
      Utils.fillRect( ss, 1, TITLE_H + 1, w - ScrollBar.W - 1, MAX_CONTENT_HEIGHT, 0 );
      addChild( ss );
      return ss;
    }

    // ------------------------------------------------------------------------------- Event handlers
    private function onBut( e:MouseEvent ):void
    {
      but_clicked = e.target.idx;
      setVisible( false );
      dispatchEvent( new Event( Event.SELECT ) );
    }

    private function onScroll( e:Event ):void
    {
      if ( txt != null )
      {
        txt.removeEventListener( Event.SCROLL, onTextScroll );
        txt.scrollV = 1 + Math.round( sb.scrollPosition / LINE_H );
        txt.addEventListener( Event.SCROLL, onTextScroll );
      }
      if ( obj != null )
      {
        obj.y = TITLE_H + 1 - sb.scrollPosition;
      }
    }
    
    public function onTextScroll( e:Event ):void
    {
      sb.scrollPosition = Math.round( (txt.scrollV - 1) * LINE_H );
    }

    private function onWheel( e:MouseEvent ):void
    {
      sb.scrollPosition -= sb.lineScrollSize * e.delta;
      onScroll( null );
    }
  }
}
