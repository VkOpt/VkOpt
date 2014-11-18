// Base class for all VK buttons

package vk.gui
{
  import flash.display.SimpleButton;
  
  /**
  * @author Alexey Kharkov
  */
  public class Button extends SimpleButton
  {
    internal var bt:uint = 0; // Button Type
    internal var s:String = null; // Label
    
    public static const LINK_BUTTON:uint = 0;
    public static const BLUE_BUTTON:uint = 1;
    public static const GRAY_BUTTON:uint = 2;
    
    public function Button( label:String, x:int, y:int, button_type:uint ):void
    {
      this.x = x;
      this.y = y;

      bt = button_type;
      useHandCursor = true;

      this.label = label;
    }
    
    public function set label( value: String ):void
    {
      s = value;
      updateButton();
    }
    
    public function get label(): String
    {
      return s;
    }
    
    // ---------------------------------------------------------------------- Internal methods.
    internal virtual function updateButton():void {} // Should be overrided
  }
}
