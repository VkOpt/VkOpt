package vk.gui
{
  /**
  * @author Andrew Rogozov
  * @modified by Alexey Kharkov
  */
  public class RoundButton extends Button
  {
    public function RoundButton( label:String, x:int, y:int, type:uint = BLUE_BUTTON ):void
    {
      super( label, x, y, type );
    }
    
    // ---------------------------------------------------------------------- Internal methods.
    internal override function updateButton():void
    {
      upState   = new RoundButtonDS( bt, 0, s );
      overState = new RoundButtonDS( bt, 1, s );
      downState = hitTestState = overState;
    }
  }
}
