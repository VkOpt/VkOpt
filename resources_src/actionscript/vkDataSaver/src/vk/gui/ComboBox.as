package vk.gui
{
  import flash.display.DisplayObject;
  import flash.display.DisplayObjectContainer;
  import flash.display.Sprite;
  import flash.display.Stage;
  import flash.events.MouseEvent;
  import flash.events.Event;
  import flash.events.KeyboardEvent;
  import flash.display.MovieClip;
  import flash.text.TextField;
  import flash.utils.Timer;
  import flash.events.TimerEvent;

  /**
  * @author Alexey Kharkov
  */
  public class ComboBox extends Sprite
  {
    private var wrapper:* = null;
    private var txt:TextField = null;

    private var da_bg:Sprite = null; // "Down Arrow" BackGround
    private var dd:ListBox = null; // DropDown
    
    private var mouseOver:Boolean = false;
    private var timer:Timer = null;
    
    private static const W:uint = 16; // width of "Down Arrow BackGround"
    private static const H:uint = 21; // height of the text field
    
    private static const TIMER_DELAY:uint = 33;
    

    public function ComboBox( wrapper:*, x:int, y:int, w:int ):void
    {
      this.x = x;
      this.y = y;
      this.wrapper = wrapper;
      
      buttonMode = true;
      
      timer = new Timer( TIMER_DELAY, 0 );
      
      // BackGround
      var bg:Sprite = new Sprite();
      Utils.fillRect( bg, 0, 0, w, H, 0xffffff );
      addChild( bg );

      // Arrow BackGround
      da_bg = new Sprite();
      Utils.fillRect( da_bg, 0, 0, W, H, Utils.ARROW_BG_COL );
      Utils.vertLine( da_bg, 0, 0, H-0.5, Utils.ARROW_BG_BORDER_COL );
      da_bg.x = w - W;
      da_bg.y = 0.5;
      da_bg.alpha = 0;
      da_bg.mouseEnabled = false;
      addChild( da_bg );

      // Border and "Down Arrow"
      var rc:Sprite = new Sprite();
      var rc_x:int = w - 11;
      Utils.hollowRect( rc, 0, 0, w, H, Utils.BORDER2_COL );
      Utils.drawArrow( rc, rc_x, 9, true );
      rc.mouseEnabled = false;
      addChild( rc );
      
      // Text field
      txt = Utils.addText( 4, 2, w - W, 11, "" );
      txt.mouseEnabled = false;
      addChild( txt );
      
      // Drop down
      dd = new ListBox( 0, H, w );
      dd.visible = false;
      dd.owner = this;
      addChild( dd );
      
      //
      bg.addEventListener( MouseEvent.MOUSE_DOWN, onClick );
      addEventListener( MouseEvent.ROLL_OVER, onOver );
      if ( wrapper != null )
        wrapper.addEventListener( "onWindowBlur", onWindowBlur );
    }
    
    public function clear():void
    {
      dd.clear();
    }
    
    public function addItemsArray( arr:Array ):void
    {
      if ( dd.length == 0  &&  arr.length > 0 )
        setCurTxt( arr[0] );
      
      dd.addItemsArray( arr );
    }

    public function addItem( s:String ):void
    {
      if ( dd.length == 0 )
        setCurTxt( s );

      dd.addItem( s );
    }
    
    public function get selectedIndex():int
    {
      return dd.selectedIndex;
    }
    
    public function set selectedIndex( idx:int ):void
    {
      dd.selectedIndex = idx;
    }
    
    public function get length():uint
    {
      return dd.length;
    }

    public override function get width():Number
    {
      return dd.width;
    }
    
    public override function get height():Number
    {
      return dd.y + (dd.visible ? dd.height : 0);
    }
    
    // ---------------------------------------------------------------------------- internal methods.
    internal function onItemClick( item:*, b:Boolean ):void
    {
      setCurTxt( item.txt.text );
      dispatchEvent( new Event( Event.CHANGE ) );
      
      if ( b )
        showDropDown( !dd.visible );
    }
    
    // ---------------------------------------------------------------------------- private methods.
    private function setCurTxt( s:String ):void
    {
      txt.text = s;
      txt.setTextFormat( Utils.getTxtFormat( 11, 0 ) );
    }
    
    private function showDropDown( b:Boolean ):void
    {
      if ( root == null )
        return;
      
      dd.reset();
      
      if ( b )
      {
        // Show DropDown
        dd.visible = true;
        
        (parent as DisplayObjectContainer).setChildIndex( this, (parent as DisplayObjectContainer).numChildren - 1 );
        
        // Keys control
        Utils.topParent(this).addEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
        /*if ( wrapper != null )
        {
          if ( wrapper.parent as DisplayObject != null )
            wrapper.parent.addEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
          else
            wrapper.addEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
        }*/

        //
        root.addEventListener( MouseEvent.MOUSE_DOWN, onStageClick );
        MouseWheel.capture();
      } else
      {
        // Hide DropDown
        dd.visible = false;
        if ( !mouseOver )
          da_bg.alpha = 0.0;
        
        // Keys control
        Utils.topParent(this).removeEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
        /*if ( wrapper != null )
        {
          if ( wrapper.parent as DisplayObject != null )
            wrapper.parent.removeEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
          else
            wrapper.removeEventListener( KeyboardEvent.KEY_DOWN, dd.onComboKeyDown );
        }*/

        //
        root.removeEventListener( MouseEvent.MOUSE_DOWN, onStageClick );
        MouseWheel.release();
      }
      
      dispatchEvent( new Event( Event.RESIZE ) );
    }
    
    // -----------------------------------------------------------------------  Over/Out animation
    private function timerHandler1( e:TimerEvent ):void
    {
      da_bg.alpha += 0.2;
      if ( da_bg.alpha >= 1.0 )
      {
        da_bg.alpha = 1.0;
        timer.stop();
      }
    }
    
    private function timerHandler2( e:TimerEvent ):void
    {
      da_bg.alpha -= 0.2;
      if ( da_bg.alpha <= 0.0 )
      {
        da_bg.alpha = 0.0;
        timer.stop();
      }
    }
    
    private function startAnim( over:Boolean ):void
    {
      if ( timer.running )
        timer.stop();
      timer = new Timer( TIMER_DELAY, 5 );
      timer.addEventListener( TimerEvent.TIMER, over ? timerHandler1 : timerHandler2 );
      timer.start();
    }
    
    // ----------------------------------------------------------------------- Event handlers
    private function onWindowBlur( e:Object ):void
    {
      if ( dd.visible )
        showDropDown( false );
    }

    private function onOver( e:MouseEvent ):void
    {
      mouseOver = true;
      removeEventListener( MouseEvent.ROLL_OVER, onOver );
      addEventListener( MouseEvent.ROLL_OUT, onOut );
      startAnim( true );
    }
    
    private function onOut( e:MouseEvent ):void
    {
      mouseOver = false;
      removeEventListener( MouseEvent.ROLL_OUT, onOut );
      addEventListener( MouseEvent.ROLL_OVER, onOver );
      if ( !dd.visible )
        startAnim( false );
    }
  
    private function onClick( e:MouseEvent ):void
    {
      showDropDown( !dd.visible );
    }
  
    private function onStageClick( e:MouseEvent ):void
    {
      if ( !contains( e.target as DisplayObject ) )
        showDropDown( false );
    }
  }
}