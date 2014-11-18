package vk.gui
{
  import flash.display.Sprite;
  import flash.events.Event;
  import flash.events.MouseEvent;
  import flash.text.TextField;
  import flash.text.TextFieldAutoSize;
  import flash.text.TextFormat;

  /**
  * @author Alexey Kharkov
  */
  internal class MenuButton extends Sprite
  {
    public var idx:uint = 0;

    private var s:String = null;
    private var txt:TextField = null;
    private var isSelected:Boolean = false;
    private var w:uint = 0;
    
    // Colors
    static private const txtCol:uint = Utils.BUT1_TXT_COL;
    static private const bkCol:uint = 0xFFFFFF;
    static private const activeBkCol:uint = Utils.BLUE_BK_COL;
    static private const selectedTxtCol:uint = 0xFFFFFF;
    static private const selectedBkCol:uint = Utils.BLUE_TXT_COL;
  
      // Sizes
    static private const H:int = 25;
    static private const btnRaduis:uint = 6;
    
    //
    public function MenuButton( label:String, x:int, y:int ):void
    {
      this.x = x;
      this.y = y;

      txt = Utils.addText( 9, 3, 1000, 11, label, txtCol, Utils.TXT_AUTOSIZE );
      txt.mouseEnabled = false;
      addChild( txt );
      
      setSel( isSelected );

      buttonMode = true;
      mouseChildren = false;
      
      addEventListener( MouseEvent.MOUSE_OVER, onOver );
      addEventListener( MouseEvent.MOUSE_OUT, onOut );
    }
    
    public function set label( value: String ):void
    {
      txt.text = value;
      txt.setTextFormat( Utils.getTxtFormat( 11, 0 ) );
      Utils.updSz( txt );
      setSel( isSelected );
    }
    
    public function get label(): String
    {
      return txt.text;
    }
    
    // ----------------------------------------------------------------- Internal methods.
    internal function setSel( b:Boolean ):void
    {
      isSelected = b;
      w = txt.width + 16;
      graphics.clear();
      Utils.fillRRect( this, 0, 0, w, H, isSelected ? selectedBkCol : bkCol, btnRaduis )
      txt.textColor = isSelected ? selectedTxtCol : txtCol;
    }
    
    // ----------------------------------------------------------------- Mouse events.
    private function onOver( e:MouseEvent ):void
    {
      if ( !isSelected )
        Utils.fillRRect( this, 0, 0, w, H, activeBkCol, btnRaduis );
    }
    
    private function onOut( e:MouseEvent ):void
    {
      if ( !isSelected )
        setSel( isSelected );
    }
  }
}