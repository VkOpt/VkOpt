package vk.gui 
{
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.events.MouseEvent;
  import flash.events.Event;
    
  /**
   * @author Alexey Kharkov
   */
  public class CheckBox extends LabelButton
  {
    private var isChecked:Boolean = false;
    private var isOver:Boolean = false;
    //private var img:CheckBoxImg = null;
    
    public function CheckBox( label:String, x:int, y:int ):void
    {
    	super( label, 19, -2 );
      this.x = x;
      this.y = y;

      //
      //img = new CheckBoxImg();
      //addChild( img );
      
      reDraw();

      addEventListener( MouseEvent.MOUSE_OVER, onOver  );
      addEventListener( MouseEvent.MOUSE_OUT , onOut   );
      addEventListener( MouseEvent.MOUSE_DOWN, onClick );
      
      buttonMode = true;
      mouseChildren = false;
    }
    
    public function get checked():Boolean
    {
      return isChecked;
    }
    
    public function set checked( b:Boolean ):void
    {
      isChecked = b;
      reDraw();
    }
    
    // ----------------------------------------------------------------------- private methods
    private function reDraw():void
    {
      //if ( isChecked )
      //  img.gotoAndStop( isOver ? 3 : 1 );
      //else
      //  img.gotoAndStop( isOver ? 4 : 2 );

      graphics.clear();
      
      // Transparent BackGround
      Utils.fillRect( this, 0, 0, width, 15, 0, 0 );

      Utils.rect( this, 0, 0, 13, 13, isOver ? 0xdae1e8 : 0xffffff, 0xc0cad5 );
      
      if ( isChecked )
      {
        var c:uint = isOver ? 0xb7c0cb : 0xdfe5ea;
        var i:uint;
        
        // Back
        for ( i = 2; i <= 5; ++i )
          Utils.horLine( this, Math.max(3, i), i+2, i+6, c );

        var i2:uint = isOver ? 13 : 11;
        for ( i = 6; i <= i2; ++i )
          Utils.horLine( this, i, Math.min(i2 + 1, i + 2), 16 - i, c );
          
        if ( !isOver )
          Utils.vertLine( this, 14, 3, 4, 0xdfe5ea );

        // Front
        for ( i = 3; i <= 5; ++i )
          Utils.horLine( this, i, i + 2, i + 4, 0x5f83a5 );
        
        Utils.vertLine( this, 4, 6, 7, 0x5f83a5 );
        Utils.vertLine( this, 6, 8, 10, 0x5f83a5 );
          
        for ( i = 6; i <= 13; ++i )
          Utils.horLine( this, i, i + ((i == 13) ? 1 : 2), 14 - i, 0x5f83a5 );
      }
    }
    
    // ----------------------------------------------------------------------- Event handlers
    private function onOver( e:MouseEvent ):void
    {
      isOver = true;
      reDraw();
    }

    private function onOut( e:MouseEvent ):void
    {
      isOver = false;
      reDraw();
    }

    private function onClick( e:MouseEvent ):void
    {
      isChecked = !isChecked;
      reDraw();
      dispatchEvent( new Event( Event.CHANGE ) );
    }
  }
}
