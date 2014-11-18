// LinkButton DisplayState

package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  
  /**
  * @author Alexey Kharkov
  */
  internal class LinkButtonDS extends Sprite
  {
    public function LinkButtonDS( bt:uint, state:uint, s:String, fs:uint, tf:uint, w:uint, h:uint ):void
    {
      // fs - Font Size
      // tf - Text Format
      
      tf |= Utils.TXT_AUTOSIZE;
      
      if ( state == 1 )
        tf |= Utils.TXT_UNDERLINE;
      
      if ( w > 0  &&  h > 0 )
        tf |= Utils.TXT_MULTILINE;
      
      var txt:TextField = Utils.addText( 0, 0, w, fs, s, Utils.BUT1_TXT_COL, tf, h );
      
      //if ( w > 0  &&  h == 0  &&  txt.textWidth > w )
      //{
      //  tf |= Utils.TXT_MULTILINE;
      //  txt = Utils.addText( 0, 0, w, fs, s, Utils.BUT1_TXT_COL, tf, h );
      //}
      
      addChild( txt );
    }
  }
}
