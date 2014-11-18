package vk.gui 
{
  import flash.display.Sprite;

  /**
   * @author Alexey Kharkov
   */
  public class MenuItem
  {
    private var vis:Boolean = true; // visible
    private var menu:MainMenu = null;
    private var but:MenuButton = null; // button
    private var p:Sprite = null; // panel
    private var loc:String = null;
    
    internal var in_navigation_panel:Boolean = false;
    
    
    public function MenuItem( menu:MainMenu, but:MenuButton, visible:Boolean, location:String, in_navigation_panel:Boolean ) 
    {
      this.menu = menu;
      this.but = but;
      this.in_navigation_panel = in_navigation_panel;
      loc = location;
      
      p = new Sprite();
      p.visible = visible;
      p.y = MainMenu.HEIGHT;
    }
    
    public function get visible():Boolean
    {
      return vis;
    }
    
    public function set visible( b:Boolean ):void
    {
      vis = b;
      but.visible = vis;
      
      if ( !vis )
        p.visible = false;
        
      menu.updateButtons();
    }
    
    public function get label():String
    {
      return but.label;
    }
    
    public function set label( s:String ):void
    {
      but.label = s;
      menu.updateButtons();
    }

    public function get location():String
    {
      return loc;
    }
    
    public function set location( s:String ):void
    {
      loc = s;
    }
    
    public function get panel():Sprite
    {
      return p;
    }
    
    public function set panel( p_:Sprite ):void
    {
      menu.removeChild( p );
      p_.visible = p.visible;
      p = p_;
      p.y = MainMenu.HEIGHT;
      menu.addChild( p );
      menu.menuLineOnTop();
    }
    
    // ---------------------------------------------------------------------- Internal methods.
    internal function get button():MenuButton
    {
      return but;
    }
  }

}