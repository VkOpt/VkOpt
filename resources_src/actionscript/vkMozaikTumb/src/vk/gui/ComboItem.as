package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.events.MouseEvent;
    
  /**
  * @author Alexey Kharkov
  */
  internal class ComboItem extends Sprite
  {
    private var par:* = null;
    private var w:uint = 1;
    
    public var txt:TextField = null;
    public var idx:int = 0;

    public function ComboItem( par:*, s:String, idx:int, w:int ):void
    {
      this.par = par;
      this.idx = idx;
      this.w = w;
      
      //Utils.fillRect( this, 0, 0, w, ListBox.ITEM_H, 0xffffff, 0.0 );
      
      txt = Utils.addText( 4, 2, w, 11, s );
      addChild( txt );
      
      addEventListener( MouseEvent.MOUSE_OVER, onOver );
      addEventListener( MouseEvent.MOUSE_OUT , onOut );
      addEventListener( MouseEvent.MOUSE_DOWN, onDown );
      
      buttonMode = true;
      mouseChildren = false;
    }
    
    // ----------------------------------------------------------------------- Events handlers
    private function onOver( e:MouseEvent ):void
    {
      if ( !par.enMouse )
        return;
      
      if ( par.owner == null ) // Parent is Listbox, not ComboBox
      {
        if ( par.selY != y )
          Utils.rect( this, 0, 1, w, ListBox.ITEM_H - 1, Utils.ARROW_BG_COL, Utils.ARROW_BG_BORDER_COL );
      }
      else
        par.setItemActive( this );
    }
  
    private function onOut( e:MouseEvent ):void
    {
      graphics.clear();
    }
    
    private function onDown( e:MouseEvent ):void
    {
      graphics.clear();
      par.onItemClick( this, true );
    }
  }
}
