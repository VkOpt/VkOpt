package vk.gui
{
  import flash.display.DisplayObject;
  import flash.display.DisplayObjectContainer;
  import flash.display.Sprite;
  import flash.display.Stage;
  import flash.events.KeyboardEvent;
  import flash.events.MouseEvent;
  import flash.events.Event;
  import flash.display.MovieClip;
  import flash.text.TextField;

  /**
  * @author Alexey Kharkov
  */
  public class ListBox extends Sprite
  {
    private var items:Array = null;

    private var cur:ComboItem = null; // Currently active item
    private var hl:ComboItem = null; // Highlighted item
    private var w:int = 0; // width
    
    internal var sel:Sprite = null; // Highlighting rectangle
    private var sb:ScrollBar = null;
    
    internal var owner:ComboBox = null;
    internal var enMouse:Boolean = true;
    
    static internal const ITEM_H:uint = 19;
    static private const W:uint = 16; // ScrollBar width
    static private const ITEMS_COUNT_TO_SCROLL:uint = 12;
    

    public function ListBox( x:int, y:int, w:int ):void
    {
      this.x = x;
      this.y = y;
      this.w = w;
      
      items = new Array();

      //Dbg.init( this );
      
      //mouseEnabled = false;
      buttonMode = true;
      
      // Selection rects
      sel = new Sprite();
      Utils.rect( sel, 0, 1, w, ITEM_H - 1, Utils.SEL_BG_COL, Utils.SEL_BG_BORDER_COL );
      //drawSel( w );
      sel.mouseEnabled = false;
      addChild( sel );
      sel.mask = maskRect();
      
      // Scroll bar
      sb = new ScrollBar( w - W, 0, ITEM_H * ITEMS_COUNT_TO_SCROLL - 1 );
      sb.visible = false;
      sb.addEventListener( Event.SCROLL, onScroll );
      addChild( sb );

      // Keys control
      addEventListener( KeyboardEvent.KEY_DOWN, onKeyDown );
      
      //
      drawBg();
      
      addEventListener( MouseEvent.ROLL_OVER, onOver );
      addEventListener( MouseEvent.ROLL_OUT, onOut );
      addEventListener( MouseEvent.MOUSE_WHEEL, onWheel );
    }
    
    public function clear():void
    {
      cur = null;
      items = new Array();
      clearLayout();

      // Reset Selection Rect
      //drawSel( w );
      
      // Reset ScrollBar
      sb.init( 0, ITEMS_COUNT_TO_SCROLL );
      sb.scrollPosition = 0;
      sb.visible = false;
    }
    
    public function addItemsArray( arr:Array ):void
    {
      for ( var i:uint = 0; i < arr.length; ++i )
        addItemHelper( arr[i] );
      
      upd();
    }
    
    public function addItem( s:String ):void
    {
      addItemHelper( s );
      upd();
    }
    
    public function get selectedIndex():int
    {
      return (cur != null) ? cur.idx : 0;
    }
    
    public function set selectedIndex( idx:int ):void
    {
      if ( idx >= 0  &&  idx < length )
      {
        onItemClick( items[idx], false );
        scrollToCur();
      }
    }
    
    public function get length():uint
    {
      return items.length;
    }

    public override function get width():Number
    {
      return w;
    }
    
    public override function get height():Number
    {
      return Math.min(length, ITEMS_COUNT_TO_SCROLL) * ITEM_H;
    }
    
    // ---------------------------------------------------------------------------- internal methods.
    internal function setItemActive( item:* ):void
    {
      if ( hl != null )
        hl.txt.textColor = 0;
      
      hl = item;
      sel.y = item.y;
      item.txt.textColor = 0xffffff;
    }
    
    internal function onItemClick( item:*, b:Boolean ):void
    {
      cur = item;
      setItemActive( item );
      
      if ( owner == null )
        dispatchEvent( new Event( Event.CHANGE ) );
      else
        owner.onItemClick( item, b );
    }
    
    internal function reset():void
    {
      setItemActive( cur );
      scrollToCur();
    }
    
    internal function get selY():int
    {
      return sel.y;
    }

    // ---------------------------------------------------------------------------- private methods.
    private function addItemHelper( s:String ):void
    {
      var idx:int = length;
      var item:ComboItem = new ComboItem( this, s, idx, w );
      item.y = idx * ITEM_H - 1;

      if ( idx == 0 )
      {
        cur = item;
        hl = item;
        setItemActive( item );
      }
      
      items.push( item );
    }
    
    private function upd():void
    {
      drawBg();

      if ( length > ITEMS_COUNT_TO_SCROLL )
      {
        sb.init( length - ITEMS_COUNT_TO_SCROLL, ITEMS_COUNT_TO_SCROLL );
        sb.scrollPosition = 0;
        
        sb.visible = true;
        
        //if ( length == 1 + ITEMS_COUNT_TO_SCROLL )
        //{
          //drawSel( w - W - 1 );
        //}
      } else
        reDraw();
    }
    
    private function scrollToCur():void
    {
      if ( cur.y < 0  ||  cur.y >= ITEMS_COUNT_TO_SCROLL * ITEM_H - 1 )
      {
        sb.scrollPosition = cur.idx - ITEMS_COUNT_TO_SCROLL / 3;
        reDraw();
      }
    }
    
    private function scrollToBounds( item:ComboItem ):void
    {
      if ( item.y < 0 )
      {
        sb.scrollPosition = item.idx;
      } else
      if ( item.y >= ITEMS_COUNT_TO_SCROLL * ITEM_H - 1 )
      {
        sb.scrollPosition = item.idx - ITEMS_COUNT_TO_SCROLL + 1;
      }
      reDraw();
    }
    
    private function maskRect():Sprite
    {
      var ss:Sprite = new Sprite();
      Utils.fillRect( ss, 0, 0, w + 1, ITEMS_COUNT_TO_SCROLL * ITEM_H + 1, 0 );
      addChild( ss );
      return ss;
    }
    
    private function drawBg():void
    {
      graphics.clear();
      var h:uint = Math.min(length, ITEMS_COUNT_TO_SCROLL) * ITEM_H - 1;
      Utils.rect( this, 0, 0, w, h, 0xffffff, 0xcccccc, (owner == null) ? 1 : 0.92 );
      
      if ( owner != null )
      {
        Utils.horLine( this, 0, w, 0, 0xadadad );
        Utils.horLine( this, 0, w, h, 0xadadad, 0.95 );
        Utils.horLine( this, 0, w, h + 1, 0xadadad, 0.5 );
        Utils.horLine( this, 0, w, h + 2, 0xadadad, 0.2 );
      }
    }
    
    //private function drawSel( ww:uint ):void
    //{
    //  sel.graphics.clear();
    //  Utils.rect( sel, 0, 1, ww, ITEM_H - 1, Utils.SEL_BG_COL, Utils.SEL_BG_BORDER_COL );
    //}
    
    private function reDraw():void
    {
      //removeEventListener( MouseEvent.ROLL_OVER, onOver );
      //removeEventListener( MouseEvent.ROLL_OUT, onOut );

      clearLayout();
      
      var yy:uint = -ITEM_H * Math.round( sb.scrollPosition );
      for ( var i:uint = 0; i < items.length; ++i )
      {
        items[i].y = yy - 1;
        yy += ITEM_H;
        
        if ( items[i].y > -ITEM_H  &&  items[i].y < height )
        {
          addChild( items[i] );
          items[i].mask = maskRect();
        }
      }
      
      setChildIndex( sb, numChildren - 1 );
      setItemActive( hl );

      //addEventListener( MouseEvent.ROLL_OVER, onOver );
      //addEventListener( MouseEvent.ROLL_OUT, onOut );
    }
    
    private function clearLayout():void
    {
      while ( numChildren > 2 ) // the first two children are "sel" and "sel mask"
        removeChildAt( numChildren - 1 );
      addChild( sb );
    }
    
    private function mouseInside():Boolean
    {
      return mouseX > 0  &&  mouseX < width  &&  mouseY > 0  &&  mouseY < height;
    }
    
    // ----------------------------------------------------------------------- Event handlers
    private function onKeyDown( e:KeyboardEvent ):void
    {
      if ( owner != null )
        return;
      
      enMouse = false;
      if ( e.keyCode == 38 )
      {
        if ( selectedIndex > 0 )
        {
          onItemClick( items[selectedIndex - 1], false );
          scrollToBounds( cur );
          hl.graphics.clear();
        }
      } else
      if ( e.keyCode == 40 )
      {
        if ( selectedIndex < length - 1 )
        {
          onItemClick( items[selectedIndex + 1], false );
          scrollToBounds( cur );
          hl.graphics.clear();
        }
      }
      addEventListener( MouseEvent.MOUSE_MOVE, function(e:MouseEvent):void { enMouse = true; } );
    }
    
    internal function onComboKeyDown( e:KeyboardEvent ):void
    {
      enMouse = false;
      if ( e.keyCode == 13 )
      {
        onItemClick( hl, true );
      } else
      if ( e.keyCode == 38 )
      {
        if ( hl.idx > 0 )
        {
          setItemActive( items[hl.idx - 1] );
          scrollToBounds( hl );
        }
      } else
      if ( e.keyCode == 40 )
      {
        if ( hl.idx < length - 1 )
        {
          setItemActive( items[hl.idx + 1] );
          scrollToBounds( hl );
        }
      }
      addEventListener( MouseEvent.MOUSE_MOVE, function(e:MouseEvent):void { enMouse = true; } );
    }

    private function onOver( e:MouseEvent ):void
    {
      //Dbg.log( "onOver( " + mouseX + ", " + mouseY + " ),  " + x + ", " + y + " - " + (x+width) + ", " + (y+height) + "     hitTest " + mouseInside() );
      if ( e.target == this  &&  owner == null )
      {
        MouseWheel.capture();
      }
    }
    
    private function onOut( e:MouseEvent ):void
    {
      //Dbg.log( "onOut( " + mouseX + ", " + mouseY + " ),  " + x + ", " + y + " - " + (x+width) + ", " + (y+height) + "     hitTest " + mouseInside() );
      if ( e.target == this  &&  owner == null  &&  !mouseInside() )
      {
        MouseWheel.release();
      }
    }
  
    private function onScroll( e:Event ):void
    {
      reDraw();
    }

    private function onWheel( e:MouseEvent ):void
    {
      enMouse = true;
      sb.scrollPosition -= e.delta;
      reDraw();
    }
  }
}
