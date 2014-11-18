package vk.gui
{
  /**
  * @author Alexey Kharkov
  */
	public class LightButton extends LinkButton
	{
		private var c:int  = 0; // color
		private var ac:int = 0; // active color
		private var tc:uint  = 0; // text color
		private var atc:uint = 0; // active text color
		private var align:int = -1;
    private var margins:uint = 0;
    
    public static const CENTER:uint = 0;
    public static const LEFT:uint = 1;
    public static const RIGHT:uint = 2;

		public function LightButton( label:String, x:int, y:int, width:uint,
			color:int, active_color:int, text_color:uint, active_text_color:uint, 
			align:uint = CENTER, font_size:uint = 11, margins:uint = 4 ):void
		{
			super( label, x, y, font_size, width );
			
			c = color;
			ac = active_color;
			tc = text_color;
			atc = active_text_color;
			this.align = align;
      this.margins = margins;
      
      updateButton();
		}
		
    // -------------------------------------------------------------------- Internal methods
    internal override function updateButton():void
    {
      if ( align < 0 )
        return;
      
      upState   = new LightButtonDS( bt, 0, s, fs, tf, w, c, ac, tc, atc, align, margins );
      overState = new LightButtonDS( bt, 1, s, fs, tf, w, c, ac, tc, atc, align, margins );
      downState = hitTestState = overState;
    }
	}
}