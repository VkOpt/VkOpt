package vk.gui
{
  import flash.display.DisplayObject;
  import flash.display.DisplayObjectContainer;
  import flash.display.Sprite;
  import flash.events.Event;
  import flash.events.MouseEvent;

  public class ScrollBar extends Sprite
  {
    public var lineScrollSize:uint = 3;

    private var arrow1:ScrollButton = null;
    private var arrow2:ScrollButton = null;
    private var slider:Sprite = null;

    private var maxPos:Number = 0; // max scroll position
    private var pageSz:Number = 1; // page size
    private var h:uint = 0;
    
    private var isOver:Boolean = false;
    
    private var sliderMaxY:uint = 0;
    private var sliderLen:uint = 40;
    
    private var dragging:Boolean = false;
    private var dragY:int = 0;
    
    private var trasp_bg:Sprite = null;
    
    private var curPos:Number = 0;
    
    private static const SLIDER_POS_Y:uint = 16;
    private static const SLIDER_MIN_LEN:uint = 10;
    private static const LINE_POS_X:uint = 12;
    private static const LINE_POS_Y:uint = 8;
    internal static const W:uint = 16;
    internal static const MIN_H:uint = 33 + SLIDER_MIN_LEN;

    public function ScrollBar( x:int, y:int, h:int )
    {
      this.x = x;
      this.y = y;
      this.h = h;
     
      trasp_bg = new Sprite();
      Utils.fillRect( trasp_bg, -10000, -10000, 20000, 20000, 0, 0.0 );
      //trasp_bg.visible = false;
      //addChild( trasp_bg );

      addEventListener( MouseEvent.MOUSE_DOWN, onLineDown );
      
      // Scroll arrows
      arrow1 = new ScrollButton( 0, 0, false );
      addChild( arrow1 );
      arrow1.addEventListener( Event.SCROLL, onUpScroll );

      arrow2 = new ScrollButton( 0, h - 16, true );
      addChild( arrow2 );
      arrow2.addEventListener( Event.SCROLL, onDownScroll );
      
      // Slider
      slider = new Sprite();
      slider.buttonMode = true;
      slider.x = 0;
      slider.y = SLIDER_POS_Y;
      slider.buttonMode = true;
      slider.useHandCursor = true;

      redrawSlider();
      
      slider.addEventListener( MouseEvent.MOUSE_OVER, onSliderOver );
      slider.addEventListener( MouseEvent.MOUSE_OUT, onSliderOut );
      slider.addEventListener( MouseEvent.MOUSE_DOWN, onSliderDown );
      
      addChild( slider );
      
      //
      setHeight( h );
    }
    
    public function setHeight( h:int ):void
    {
      this.h = h;
      recalcSliderLen();
    }

    public function init( maxScrollPos:Number, pageSize:Number ):void
    {
      maxPos = (maxScrollPos < 0) ? 0 : maxScrollPos;
      pageSz = pageSize;
      
      recalcSliderLen();
    }
/*
    public override function get width():Number
    {
      return 16;
    }

    public override function get height():Number
    {
      return h;
    }
*/
    // scrollPosition
    public function get scrollPosition():int
    {
      if ( sliderMaxY <= 0 )
        return 0;
      
      return Math.round( (maxPos * curPos) / sliderMaxY );
    }
    
    public function set scrollPosition( val:int ):void
    {
      if ( maxPos == 0 )
      {
        slider.y = SLIDER_POS_Y;
        return;
      }
      
      if ( val < 0 ) val = 0;
      if ( val > maxPos ) val = maxPos;
      
      curPos = (sliderMaxY * val) / maxPos;
      slider.y = SLIDER_POS_Y + curPos;
    }
    
    // ----------------------------------------------------------------------- private methods.
    private function redrawSlider():void
    {
      this.graphics.clear();
      slider.graphics.clear();
      
      // ScrollBar background
      Utils.rect( this, 0, 0, W, h, 0xFAFAFA, 0xcccccc );
      
      // Slider
      //Utils.draw3dBar( slider, 1, 1, W - 2, sliderLen - 1, isOver || dragging, true );
      
      var c: uint = (isOver || dragging) ? Utils.SEL_BG_COL : Utils.ARROW_BG_COL;
      var bc:uint = (isOver || dragging) ? Utils.SEL_BG_BORDER_COL : Utils.BORDER2_COL;
      Utils.rect( slider, 0, 0, W, sliderLen, c, bc );
    }
    
    private function recalcSliderLen():void
    {
      var hh:int = h - 2*SLIDER_POS_Y + 1;
      
      if ( maxPos + pageSz > 0 )
      {
        sliderLen = Math.round( (pageSz * hh) / (maxPos + pageSz) );
        if ( sliderLen > hh ) sliderLen = hh;
        if ( sliderLen < SLIDER_MIN_LEN ) sliderLen = SLIDER_MIN_LEN;
      }        
      else
        sliderLen = SLIDER_MIN_LEN;
      
      sliderMaxY = hh - sliderLen - 1;
      redrawSlider();
    }

    private function onLineDown( e:MouseEvent ):void
    {
      if ( e.target != this )
        return;
        
      if ( e.localY >= slider.y  &&  e.localY <= slider.y + sliderLen )
        return;
      
      slider.y = e.localY - sliderLen / 2;
      if ( slider.y < SLIDER_POS_Y ) slider.y = SLIDER_POS_Y;
      if ( slider.y > SLIDER_POS_Y + sliderMaxY ) slider.y = SLIDER_POS_Y + sliderMaxY;
      
      curPos = slider.y - SLIDER_POS_Y;
      dispatchEvent( new Event( Event.SCROLL ) );
    }

    // ----------------------------------------------------------------- Events handlers
    private function onUpScroll( e:Event ):void
    {
      scrollPosition -= lineScrollSize;
      dispatchEvent( new Event( Event.SCROLL ) );
    }
    
    private function onDownScroll( e:Event ):void
    {
      scrollPosition += lineScrollSize;
      dispatchEvent( new Event( Event.SCROLL ) );
    }

    private function onSliderOver( e:MouseEvent ):void
    {
      setChildIndex( slider, numChildren - 1 );
      isOver = true;
      redrawSlider();
    }
    
    private function onSliderOut( e:MouseEvent ):void
    {
      isOver = false;
      redrawSlider();
    }
    
    private function onSliderDown( e:MouseEvent ):void
    {
      dragging = true;
      dragY = e.stageY - slider.y;
      
      addChild( trasp_bg );
      //trasp_bg.visible = true;
      
      redrawSlider();
      
      Utils.topParent(this).addEventListener( MouseEvent.MOUSE_UP, onUp );
      Utils.topParent(this).addEventListener( MouseEvent.MOUSE_MOVE, onMove );
    }
    
    private function onUp( e:MouseEvent ):void
    {
      dragging = false;
      
      removeChild( trasp_bg );
      //trasp_bg.visible = false;
      
      redrawSlider();
      
      Utils.topParent(this).removeEventListener( MouseEvent.MOUSE_UP, onUp );
      Utils.topParent(this).removeEventListener( MouseEvent.MOUSE_MOVE, onMove );
/*      
      if ( wrapper != null )
      {
        if ( wrapper.parent as DisplayObject != null )
        {
          wrapper.parent.removeEventListener( MouseEvent.MOUSE_UP, onUp );
          wrapper.parent.removeEventListener( MouseEvent.MOUSE_MOVE, onMove );
        }
        else
        {
          wrapper.removeEventListener( MouseEvent.MOUSE_UP, onUp );
          wrapper.removeEventListener( MouseEvent.MOUSE_MOVE, onMove );
        }
      } else
      {
        removeEventListener( MouseEvent.MOUSE_UP, onUp );
        removeEventListener( MouseEvent.MOUSE_MOVE, onMove );
      }
*/
    }
    
    private function onMove( e:MouseEvent ):void
    {
      if ( dragging )
      {
        slider.y = e.stageY - dragY;
        slider.y = SLIDER_POS_Y + Math.min( sliderMaxY, Math.max( 0, slider.y - SLIDER_POS_Y ) );
        
        curPos = slider.y - SLIDER_POS_Y;
        dispatchEvent( new Event( Event.SCROLL ) );
      }
    }

  }
}
