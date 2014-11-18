// LinkButton DisplayState

package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  
  /**
  * @author Alexey Kharkov
  */
  internal class LightButtonDS extends Sprite
  {
    public function LightButtonDS( bt:uint, state:uint, s:String, fs:uint, tf:uint, w:uint, c:int, ac:int, tc:uint, atc:uint, align:uint, margins:uint ):void
    {
      // fs - Font Size
      // tf - Text Format
      
      if ( align == LightButton.CENTER )
        tf |= Utils.TXT_CENTER;
      
      var txt:TextField = Utils.addText( margins, margins - 2, w, fs, s, (state == 1) ? atc : tc, tf );
      
      if ( align == LightButton.RIGHT )
        txt.x = w - 8 - txt.textWidth;
      
      addChild( txt );

      var col:int = (state == 1) ? ac : c;
      if ( col >= 0 )
      {
        if ( w == 0 )
          w = txt.textWidth + 4 + 2 * margins;
          
        const h:uint = fs + 2 * margins + 3;

			  Utils.fillRect( this, 0, 0, w, h, col );
      }
    }
  }
}
