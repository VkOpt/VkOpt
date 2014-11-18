// SquareBlueButton DisplayState

package vk.gui
{
  import flash.display.Sprite;
  import flash.text.TextField;
  
  /**
  * @author Alexey Kharkov
  */
  internal class SquareBlueButtonDS extends Sprite
  {
    public function SquareBlueButtonDS( state:uint, label:String, w:uint, h:uint ):void
    {
      var bc:uint = 0x3b6798; // Border Color
      
      var bgc:uint = 0; // BackGround Color
      var ibc:uint = 0; // Inner Border Color
      var tlc:uint = 0; // Top Line Color
      
      var tc:uint = 0; // Text Color
      var tsc:uint = 0; // Text Shadow Color

      tlc = 0x3b6798;
      tc = 0xffffff;
      tsc = 0x45688e;
      
      switch (state)
      {
      case 1: // Over state
        bgc = 0x84a1bf;
        tlc = 0x92acc7;
        ibc = 0x7293b7;
        break;
      case 2: // Down state
        bc = 0x3a6595;
        bgc = 0x6688ad;
        tlc = 0x7495b8; // Should be drawn as bottom line.
        ibc = 0x51769e;
        break;
      default: // Out state
        bgc = 0x6d8fb3;
        tlc = 0x7e9cbc;
        ibc = 0x5c82ab;
        break;
      }
      
      const xx:uint = (w == 0) ? 10 : 0;
      const fs:uint = 11; // Font Size
      
      var txt1:TextField = Utils.addText( xx, 0, w, fs, label, tsc, Utils.TXT_CENTER );
      var txt2:TextField = Utils.addText( xx, 0, w, fs, label, tc , Utils.TXT_CENTER );

      if ( w == 0 )
        w = txt1.textWidth + 24;

      txt2.y = Math.round((h - txt1.textHeight) / 2) - 2;
      txt1.y = txt2.y + 1;
      
      Utils.rect( this, 0, 0, w, h, bgc, bc );
      Utils.hollowRect( this, 1, 1, w - 2, h - 2, ibc );
      if ( state == 2 )
        Utils.horLine( this, 2, w - 2, h - 1, tlc );
      else
        Utils.horLine( this, 1, w - 1, 1, tlc );

      addChild( txt1 );
      addChild( txt2 );
    }
  }
}
