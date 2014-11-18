package vk.gui 
{
  import flash.display.Sprite;
  import flash.text.TextField;
  import flash.events.MouseEvent;
    
  /**
   * @author Alexey Kharkov
   */
  internal class LabelButton extends Sprite
  {
    private var txt:TextField = null;
    
    public function LabelButton( label:String, x:int, y:int ):void
    {
      txt = Utils.addText( x, y, 0, 11, label );
      addChild( txt );
      
      buttonMode = true;
      mouseChildren = false;
    }
    
    public function get label():String
    {
      return txt.text;
    }
    
    public function set label( s:String ):void
    {
      Utils.setText( txt, s );
    }
  }
}
