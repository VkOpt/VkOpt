// SquareGrayButton DisplayState

package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  
  /**
  * @author Alexey Kharkov
  */
  internal class SquareGrayButtonDS extends Sprite
  {
    public function SquareGrayButtonDS( state:uint, s:String, w:uint, h:uint ):void
    {
      const bc:uint = 0xB8B8B8; // Border Color
      const tmlc:uint = 0x9f9f9f; // TopMost Line Color
      
      var bgc:uint = 0; // BackGround Color
      var tlc:uint = 0xffffff; // Top Line Color
      var ibc:uint = 0xf4f4f4; // Inner Border Color
      var blc:uint = 0xdfdfdf; // Bottom Line Color
      
      var tc:uint = 0; // Text Color
      var tsc:uint = 0; // Text Shadow Color

      tc = 0;
      tsc = 0xffffff;
      switch (state)
      {
      case 1: // Over state
        bgc = Utils.BK_COL;
        break;
      case 2: // Down state
        bgc = 0xe4e4e4;
        tlc = 0xcccccc;
        ibc = 0xcbcbcb;
        blc = 0xe8e8e8;
        break;
      default: // Out state
        bgc = 0xeaeaea;
        break;
      }

      const xx:uint = (w == 0) ? 10 : 0;
      const fs:uint = 11; // Font Size
      
      var txt1:TextField = Utils.addText( xx, 0, w, fs, s, tsc, Utils.TXT_CENTER );
      var txt2:TextField = Utils.addText( xx, 0, w, fs, s, tc , Utils.TXT_CENTER );

      if ( w == 0 )
        w = txt1.textWidth + 24;

      txt2.y = Math.round((h - txt1.textHeight) / 2) - 2;
      txt1.y = txt2.y + 1;
      
      Utils.rect( this, 0, 0, w, h, bgc, bc );
      Utils.horLine( this, 0, w, 0, tmlc );
      Utils.hollowRect( this, 1, 1, w - 2, h - 2, ibc );
      Utils.horLine( this, 1, w - 1, 1, tlc );
      Utils.horLine( this, 2, w - 2, h - 1, blc );
      
      addChild( txt1 );
      addChild( txt2 );
    }
  }
}
