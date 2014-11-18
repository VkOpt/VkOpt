package vk.gui
{
  /**
  * @author Alexey Kharkov
  */
  public class LinkButton extends Button
  {
    internal var fs:uint = 11; // Font Size
    internal var tf:uint = 0; // Text Format
    internal var w:uint = 0; // Width  (used for multiline LinkButton, in other case should be equal to zero)
    internal var h:uint = 0; // Height (used for multiline LinkButton, in other case should be equal to zero)
    
    public function LinkButton( label:String, x:int, y:int, font_size:uint = 11, width:uint = 0, height:uint = 0 ):void
    {
      super( label, x, y, Button.LINK_BUTTON );
      fs = font_size;
      w = width;
      h = height;
      updateButton();
    }

    public function get fontSize():uint
    {
      return fs;
    }
    
    public function set fontSize( val:uint ):void
    {
      fs = val;
      updateButton();
    }

    public function get bold():Boolean
    {
      return 0 != (tf & Utils.TXT_BOLD);
    }
    
    public function set bold( val:Boolean ):void
    {
      if ( val ) 
        tf |= Utils.TXT_BOLD;
      else
        tf &= ~Utils.TXT_BOLD;
      
      updateButton();
    }
    
    public function get centered():Boolean
    {
      return 0 != (tf & Utils.TXT_CENTER);
    }
    
    public function set centered( val:Boolean ):void
    {
      if ( val ) 
        tf |= Utils.TXT_CENTER;
      else
        tf &= ~Utils.TXT_CENTER;
      
      updateButton();
    }
    
    public function get maxWidth():uint
    {
      return w;
    }
    
    public function set maxWidth( val:uint ):void
    {
      w = val;
      updateButton();
    }
    
    public function get intVal():int // Used in Pagination, for example
    {
			if ( label == "«" ) return 1;
			if ( label == "»" ) return -1;
			return parseInt( label );
    }
    
    // -------------------------------------------------------------------- Internal methods
    internal override function updateButton():void
    {
      upState   = new LinkButtonDS( bt, 0, s, fs, tf, w, h );
      overState = new LinkButtonDS( bt, 1, s, fs, tf, w, h );
      downState = hitTestState = overState;
    }
  }
}
