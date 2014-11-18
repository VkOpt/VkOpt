/*
package vk.gui
{
  import flash.display.Sprite;
  import flash.events.MouseEvent;
  import flash.text.TextField;

  public class Dbg
  {
    public static const DEBUG_ON:Boolean = true;

    private static var txt:TextField = null;
    private static var ss:String = "";
    private static var showDebugButton:Sprite = null;
    private static var showDebug:Boolean = true;// false;
    
    public static function init( obj:* ):void
    {
      if ( !DEBUG_ON  ||  obj == null )
        return;
        
      showDebugButton = new Sprite();
      showDebugButton.x = 395;
      showDebugButton.y = 5;
      
      Utils.rect( showDebugButton, 0, 0, 8, 8, 0xEFEFEF, 0x997777 );
      
      showDebugButton.addEventListener( MouseEvent.MOUSE_DOWN, onDown );

      // Show it
      obj.addChild( showDebugButton );
      
      txt = Utils.addText( 115, 5, 480, 11, ss, 0, Utils.TXT_MULTILINE | Utils.TXT_BORDER, 550 );
      obj.addChild( txt );
      txt.visible = showDebug;
      txt.background = true;
      txt.backgroundColor = 0xFFFFFF;
      txt.alpha = 0.9;
      txt.selectable = true;
      txt.mouseEnabled = true;
    }

    public static function log( s:String ):void
    {
      if ( !DEBUG_ON )
        return;
        
      //traceCurTime();
      gg( s );
    }
    
    private static function gg( s:String ):void
    {
      trace( s );
      ss += s + "\n";
      if ( txt != null )
      {
        txt.text = ss;
        txt.setTextFormat( Utils.getTxtFormat( 11, Utils.TXT_MULTILINE ) );
      }
    }
    
    private static var wasTime:uint = 0;
    
    private static function traceCurTime():void
    {
      var tt:uint = new Date().valueOf();
      //trace( tt + "   " + wasTime );
      if ( wasTime > 0 )
      {
        var dt:int = tt - wasTime;
        gg( "     dt " + dt + " ms" );
      } else
        gg( "     starting dt calc" );
      
      wasTime = tt;
      //trace( loc );
    }

    // ----------------------------------------------------------------- Mouse events		
    private static function onDown( e:MouseEvent ):void
    {
      showDebug = !showDebug;
      txt.visible = showDebug;
    }
  }
  
}
/* */
