package vk.gui
{
  import flash.display.Sprite;
  import flash.display.Stage;
  import flash.text.TextField;
  import flash.events.MouseEvent;
  import flash.events.Event;
    
  /**
  * @author Alexey Kharkov
  */
  public class MainMenu extends Sprite
  {
    private var last_x:int = 10;
    private var items:Array = new Array();
    private var cur_page:uint = 0xffff;
    private var last_page:uint = 0;
    private var menu_line:Sprite = null;
    
    private var wrapper:* = null;
    private var lazyMode:Boolean = false;
    
    static private var WIDTH:uint = 627;
    static internal const HEIGHT:uint = 36;
    static private const Y:uint = 13;

    public function MainMenu( wrapper:*, lazyMode:Boolean = false ):void
    {
      this.wrapper = wrapper;
      this.lazyMode = lazyMode;
      
      if ( wrapper != null  &&  wrapper.width > 0 )
        WIDTH = wrapper.width;
      
      Utils.fillRect( this, 0, 0, WIDTH, HEIGHT, 0xffffff );
      
      menu_line = new Sprite();
      menu_line.y = HEIGHT;
      Utils.horLine( menu_line, 0, WIDTH, 0, Utils.BLUE_TXT_COL );
      addChild( menu_line );
    }
    
    public function addItem( label:String, location:String, in_navigation_panel:Boolean = true ):MenuItem
    {
      var idx:uint = items.length;
      
      var button:MenuButton = new MenuButton( label, last_x, Y )
      button.mask = mnuMask();
      button.idx = idx;
      addChild( button );
      button.addEventListener( MouseEvent.CLICK, onButClicked );
      
      var menuItem:MenuItem = new MenuItem( this, button, idx == cur_page, location, in_navigation_panel );
      addChild( menuItem.panel );

      items.push( menuItem );
      
      menuLineOnTop();
      
      last_x += 4 + button.width;
      
      if ( idx == 0 )
        changePage( idx );
        
      return menuItem;
    }
    
    public function get selectedPage():uint
    {
      return cur_page;
    }
    
    public function set selectedPage( page:uint ):void
    {
      changePage( page );
    }
    
    public function get selectedLocation():String
    {
      return items[cur_page].location;
    }
    
    public function set selectedLocation( loc:String ):void
    {
      setLocation( loc, true );
    }
    
    public function get selectedItem():MenuItem
    {
      return items[cur_page];
    }
    
    public function set selectedItem( item:MenuItem ):void
    {
      for ( var i:uint = 0; i < items.length; ++i )
        if ( items[i] == item )
        {
          changePage( i );
          return;
        }
    }
    
    public function setLocation( loc:String, needEvent:Boolean = false ):void
    {
      for ( var i:uint = 0; i < items.length; ++i )
        if ( items[i].location == loc )
        {
          changePage( i, needEvent );
          return;
        }
    }
    
    public function switchPanels():void // Used in "lazyMode"
    {
      if ( last_page < 0xffff )
        items[last_page].panel.visible = false;
      
      items[cur_page].panel.visible = true;
      last_page = cur_page;
    }
    
    // --------------------------------------------------------------------- Internal methods.
    internal function updateButtons():void
    {
      last_x = 10;
      for ( var i:uint = 0; i < items.length; ++i )
      {
        items[i].button.x = last_x;
        if ( items[i].visible )
          last_x += 4 + items[i].button.width;
      }
    }
    
    internal function menuLineOnTop():void
    {
      setChildIndex( menu_line, numChildren - 1 );
    }

    // --------------------------------------------------------------------- Private methods.
    private function mnuMask():Sprite
    {
      var ss:Sprite = new Sprite();
      Utils.fillRect( ss, 0, 0, WIDTH, HEIGHT, 0 );
      addChild( ss );
      return ss;
    }

    private function onButClicked( e:MouseEvent ):void
    {
      changePage( e.target.idx, true, true );
    }
    
    private function changePage( page:uint, needEvent:Boolean = true, force:Boolean = false ):void
    {
      if ( !force  &&  page == cur_page )
        return;
      
      last_page = cur_page;
      
      cur_page = page;
      if ( cur_page >= items.length )
        cur_page = items.length - 1;
      if ( cur_page < 0 )
        cur_page = 0;

      if ( last_page < 0xffff )
        items[last_page].button.setSel( false );
      
      var item:MenuItem = items[cur_page];
      item.button.setSel( true );
        
      if ( !lazyMode )
        switchPanels();
      
      // Update yellow location string and window title
      if ( wrapper != null  &&  !(wrapper is Stage) )
      {
        var ar1:Array = new Array();
        var ar2:Array = new Array();
        
        if ( item.location != null  &&  item.in_navigation_panel )
        {
          ar1.push( item.button.label );
          ar2.push( item.location );
        }
        
        wrapper.external.setNavigation( ar1, ar2 );
        wrapper.external.setTitle( item.button.label );
      }

      //
      if ( needEvent )
        dispatchEvent( new Event( Event.CHANGE ) );
    }
  }
}
