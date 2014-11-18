package vk.gui 
{
  import flash.display.Sprite;
  import flash.events.Event;
  import flash.events.MouseEvent;
  
	/**
   * @author Alexey Kharkov
   */
  public class Pagination extends Sprite
  {
    // Pagination types (binary flags)
    public static const RECT_AS_SEL:uint = 0x0001;
    public static const RIGHT_ALIGNED:uint = 0x0002;
    
    private static const SEL_LINE_COL:uint = 0x45668e;
    private static const SEL_RECT_COL:uint = 0xeef2f4;
    private static const DX1:uint = 2; // distance between buttons
    private static const DX2:uint = 5; // distance between buttons
    
    private var elemsOnPage:uint = 0; // elements count on a page
    
    private var p_cnt:uint = 0; // pages count
    private var cur_p:uint = 0; // current page
    private var tp:uint = 0; // pagination type
    private var p_vis:uint = 0; // visible pages count = 2 * p_vis + 1
    private var y2:uint = 0;
    private var cur_x:uint = 0;
    
    private var cont1:Sprite = null; // up buttons container
    private var cont2:Sprite = null; // down buttons container
    private var cp1:Sprite = null; // "current page" up sprite
    private var cp2:Sprite = null; // "current page" down sprite
    
    public function Pagination( totalCount:uint, x:uint, y:uint, height:uint = 0, type:uint = 0, pagesVisible:uint = 2, elemsOnPage:uint = 10 ) 
    {
      this.x = x;
      this.y = y;
      this.elemsOnPage = elemsOnPage;
      
      tp = type;
      p_vis = pagesVisible;
      p_cnt = Math.ceil( totalCount / elemsOnPage );
      
      //Dbg.init( this );
      //Dbg.log( "totalCount " + totalCount + "  elemsOnPage " + elemsOnPage + "   p_cnt " + p_cnt );
      
      cont1 = new Sprite();
      cont2 = new Sprite();
      
      this.height = height;
      
      addChild( cont1 );
      addChild( cont2 );

      createCp();
      update();
    }
    
    public override function get height():Number
    {
      return cont2.y;
    }
    
    public override function set height( val:Number ):void
    {
      y2 = Math.max( val, 20 );
      cont2.y = y2;
    }
    
    public function get curPage():uint
    {
      return cur_p;
    }
    
    public function set curPage( val:uint ):void
    {
      cur_p = val;
      update();
    }
    
    public function get numPages():uint
    {
      return p_cnt;
    }
    
    // -------------------------------------------------------------------- Private methods
    private function createCp():void // Create "current page" sprites
    {
      cp1 = new Sprite();
      cp2 = new Sprite();
      
      cp2.y = -2;
      
      if ( tp & RECT_AS_SEL )
      {
        Utils.rect( cp1, 0, 0, 40, 20, SEL_RECT_COL, Utils.BLUE_BK_COL );
        Utils.rect( cp2, 0, 0, 40, 20, SEL_RECT_COL, Utils.BLUE_BK_COL );
        
        cp1.y = -2;
      } else
      {
        Utils.fillRect( cp1, 0, 0, 10, 2, SEL_LINE_COL );
        Utils.fillRect( cp2, 0, 0, 10, 2, SEL_LINE_COL );
        
        cp1.y = 16;
      }
      
      cp1.visible = false;
      cp2.visible = false;
      
      cont1.addChild( cp1 );
      cont2.addChild( cp2 );
    }
    
    private function updCp( xx:uint, w:uint ):void // update "current page" sprites
    {
      if ( tp & RECT_AS_SEL )
      {
        cp1.x = cp2.x = xx - 3;
        cp1.width = cp2.width = w + ((cur_p == 7 || cur_p == 8) ? 4 : 5);
      } else
      {
        cp1.x = cp2.x = xx;
        cp1.width = cp2.width = w + 2;
      }
    }
    
    private function addBut( s:String, up:Boolean, cur:Boolean ):uint
    {
      var bt:* = (tp & RECT_AS_SEL)
        ? new LinkButton( s, cur_x, 0 )
        : new LightButton( s, cur_x, 0, 0, -1, 0x45668e, Utils.BUT1_TXT_COL, 0xffffff, LightButton.CENTER, 11, 1 );

      if ( cur )
      {
        if ( !(tp & RECT_AS_SEL) )
          bt.bold = true;
        
        updCp( bt.x, bt.width );
        bt.enabled = false;
      }
      else
        bt.addEventListener( MouseEvent.CLICK, onBut );

      if ( up )
        cont1.addChild( bt );
      else
        cont2.addChild( bt );

      return bt.width + ((tp & RECT_AS_SEL) ? DX2 : DX1);
    }
    
    private function addButs( s:String, cur:Boolean = false ):void
    {
      addBut( s, true, cur );
      var dx:uint = addBut( s, false, cur );
      
      cur_x += dx;
    }
    
    private function update():void
    {
      clearLayout( cont1 );
      clearLayout( cont2 );

      if ( p_cnt <= 1 )
      {
        cp1.visible = false;
        cp2.visible = false;
        return;
      }

      cp1.visible = true;
      cp2.visible = true;

      cur_x = (cur_p == 0  &&  (tp & RIGHT_ALIGNED)) ? 3 : 0;

      // create page buttons
      var i:int;
      if ( p_cnt <= p_vis * 2 + 1 )
      {
        for ( i = 0; i < p_cnt; ++i )
        {
          addButs( "" + (i + 1), (i == cur_p) );
        }
      } else
      {
        var p1:int = Math.max( 0, cur_p - p_vis );
        var p2:int = Math.min( p_cnt - 1, cur_p + p_vis );
        
        if ( p1 > 0 )
          addButs( "«" );

        for ( i = p1; i <= p2; ++i )
        {
          addButs( "" + (i + 1), (i == cur_p) );
        }

        if ( p2 < p_cnt - 1 )
          addButs( "»" );
      }
      
      if ( tp & RIGHT_ALIGNED )
      {
        cont1.x = cont2.x = -cont1.width + ((cur_p == p_cnt - 1) ? 1 : 0);
      }
    }
    
    // -------------------------------------------------------------------- Event handlers
    private function onBut( e:MouseEvent ):void
    {
      var idx:int = e.target.intVal;
      if ( idx < 0 )
        idx = p_cnt - 1;
      else
        idx --;
      
      curPage = idx;
      dispatchEvent( new Event( Event.CHANGE ) );
    }
    
    // -------------------------------------------------------------------- Static methods
    private static function clearLayout( obj:Sprite ):void
    {
      while ( obj.numChildren > 1 ) // first element is the "current page" sprite
        obj.removeChildAt( obj.numChildren - 1 );
    }

  }
}