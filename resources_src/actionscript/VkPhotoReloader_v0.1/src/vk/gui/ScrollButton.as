package vk.gui
{
  import flash.display.Sprite;
  import flash.events.Event;
  import flash.events.MouseEvent;
  import flash.events.TimerEvent;
  import flash.utils.Timer;

  public class ScrollButton extends Sprite
  {
    private var downArrow:Boolean = false;
    private var isOver:Boolean = false;
    
    private var timer:Timer = null;
    private var timer1:Timer = null;
    
    public function ScrollButton( x:int, y:int, downArrow:Boolean )
    {
      this.x = x;
      this.y = y;
      this.downArrow = downArrow;      

      buttonMode = true;

      timer = new Timer( 35, 0 );
      timer.addEventListener( TimerEvent.TIMER, onTimer );
      
      timer1 = new Timer( 500, 1 );
      timer1.addEventListener( TimerEvent.TIMER, onTimer1 );

      reDraw();
      
      addEventListener( MouseEvent.MOUSE_OVER, onOver );
      addEventListener( MouseEvent.MOUSE_OUT , onOut  );
      addEventListener( MouseEvent.MOUSE_DOWN, onDown );
      addEventListener( MouseEvent.MOUSE_UP  , onUp   );
    }
    
    // ----------------------------------------------------------------- Private methods
    private function reDraw():void
    {
      //Utils.draw3dBar( this, 0, 0, 14, 14, isOver );
      
      var c:uint = isOver ? Utils.SEL_BG_COL : Utils.ARROW_BG_COL;
      var bc:uint = isOver ? Utils.SEL_BG_BORDER_COL : Utils.BORDER2_COL;
      Utils.rect( this, 0, 0, 16, 16, c, bc );
      
      Utils.drawArrow( this, 5, downArrow ? 7 : 9, downArrow, isOver ? 0xffffff : 0 );
    }
    
    private function stopTimers():void
    {
      if ( timer.running )
        timer.stop();
      
      if ( timer1.running )
        timer1.stop();
    }
    
    // ----------------------------------------------------------------- Event handlers
    private function onTimer( e:TimerEvent ):void
    {
      dispatchEvent( new Event( Event.SCROLL ) );
    }
    
    private function onTimer1( e:TimerEvent ):void
    {
      timer.start();
    }
    
    private function onOver( e:MouseEvent ):void
    {
      isOver = true;
      parent.setChildIndex( this, parent.numChildren - 1 );
      reDraw();
    }
    
    private function onOut( e:MouseEvent ):void
    {
      isOver = false;
      stopTimers();
      reDraw();
    }
    
    private function onDown( e:MouseEvent ):void
    {
      onTimer( null );
      timer1.start();
    }
    
    private function onUp( e:MouseEvent ):void
    {
      stopTimers();
    }
  }

}
