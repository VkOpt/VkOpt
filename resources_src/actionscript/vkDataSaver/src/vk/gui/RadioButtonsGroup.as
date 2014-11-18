package vk.gui 
{
  import flash.display.Sprite;
  import flash.events.Event;
  
  /**
   * @author Alexey Kharkov
   */
  public class RadioButtonsGroup extends Sprite
  {
  	private var items:Array = null;
    private var sel:RadioButton = null; // Currently selected RadioButton

    public function RadioButtonsGroup( x:int, y:int ):void
    {
      this.x = x;
      this.y = y;

      items = new Array();
    }
    
    public function addRadioButton( label:String, x:int, y:int ):RadioButton
    {
      var but:RadioButton = new RadioButton( label, items.length, this, x, y );
      addChild( but );
      items.push( but );
      return but;
    }
    
    public function get selectedIndex():int
    {
      return (sel == null) ? -1 : sel.index;
    }
    
    public function set selectedIndex( idx:int ):void
    {
      var item:RadioButton = null;
      if ( idx >= 0  &&  idx < items.length )
        item = items[idx];
      
      selectedItem = item;
    }
    
    public function get selectedItem():RadioButton
    {
      return sel;
    }
    
    public function set selectedItem( item:RadioButton ):void
    {
      if ( sel != null )
        sel.setChecked( false );
      
      sel = item;
      sel.setChecked( true );
      
      dispatchEvent( new Event( Event.CHANGE ) );
    }
  }
}
