package vk.gui 
{
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.events.MouseEvent;
    
  /**
   * @author Alexey Kharkov
   */
  public class RadioButton extends LabelButton
  {
    private var group:RadioButtonsGroup = null;
    private var idx:uint = 0;
    private var isChecked:Boolean = false;
    private var isOver:Boolean = false;
    private var img:RadioButtonImg = null;
    
    public function RadioButton( label:String, idx:uint, group:RadioButtonsGroup, x:int, y:int ):void
    {
    	super( label, 19, -2 );

      this.x = x;
      this.y = y;
      this.group = group;
      this.idx = idx;
      
      // Transparent BackGround
      Utils.fillRect( this, 0, 0, width, 15, 0, 0 );

      //
      img = new RadioButtonImg();
      addChild( img );
      
      reDraw();

      addEventListener( MouseEvent.MOUSE_OVER, onOver  );
      addEventListener( MouseEvent.MOUSE_OUT , onOut   );
      addEventListener( MouseEvent.MOUSE_DOWN, onClick );
      
      buttonMode = true;
      mouseChildren = false;
    }
    
    public function get index():uint
    {
      return idx;
    }
    
    public function get checked():Boolean
    {
      return isChecked;
    }
    
    public function set checked( b:Boolean ):void
    {
      setChecked( b );
      group.selectedIndex = index;
    }
    
    // ----------------------------------------------------------------------- internal methods
    internal function setChecked( b:Boolean ):void
    {
      isChecked = b;
      reDraw();
    }
    
    // ----------------------------------------------------------------------- private methods
    private function reDraw():void
    {
      if ( isChecked )
        img.gotoAndStop( isOver ? 3 : 1 );
      else
        img.gotoAndStop( isOver ? 4 : 2 );
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
      checked = true;
    }
  }
}
