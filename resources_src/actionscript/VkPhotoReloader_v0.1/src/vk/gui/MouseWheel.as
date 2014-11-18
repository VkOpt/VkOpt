/**
* MouseWheel by Denis Kolyako. Created January 16, 2009, last update: May 8, 2009
*
* You may distribute this class freely, provided it is not modified in any way
* (including removing this header or changing the package path).
*/ 

package vk.gui
{
  import flash.display.Loader;
  import flash.errors.IllegalOperationError;
  import flash.events.AsyncErrorEvent;
  import flash.events.Event;
  import flash.events.StatusEvent;
  import flash.net.LocalConnection;
  import flash.utils.ByteArray;

  public final class MouseWheel
  {
    private static const bb:ByteArray = new ByteArray();
    private static const conn:LocalConnection = new LocalConnection();
    private static const dt0:Array = new Array(
      0x46575309,
      0x28010000,
      0x7800055F,
      0x00000FA0,
      0x00001F01,
      0x00441100,
      0x00000043,
      0x02FFFFFF,
      0x3F03FE00,
      0x0000885C,
      0x0009006C,
      0x63004C6F,
      0x63616C43,
      0x6F6E6E65,
      0x6374696F,
      0x6E006C63
    );
    
    private static const dt1:Array = new Array(
      0x00636F6E,
      0x6E656374,
      0x00636170,
      0x74757265,
      0x004D6F75,
      0x73650061,
      0x64644C69,
      0x7374656E,
      0x65720072,
      0x656D6F76,
      0x654C6973,
      0x74656E65,
      0x72006F6E,
      0x4D6F7573,
      0x65576865,
      0x656C0096,
      0x0D000800,
      0x06000000,
      0x00000000,
      0x00080140,
      0x1D960900,
      0x08020701,
      0x00000008,
      0x001C9602,
      0x00080352,
      0x17960200,
      0x08001C96,
      0x02000804,
      0x8E0F0000,
      0x01000329,
      0x00027661,
      0x6C756500,
      0x38009602,
      0x00040212,
      0x9D020019,
      0x00960900,
      0x04010701,
      0x00000008,
      0x051C9602,
      0x00080652,
      0x17990200,
      0x14009609,
      0x00040107,
      0x01000000,
      0x08051C96,
      0x02000807,
      0x52174F96,
      0x02000808,
      0x9B050000,
      0x00000000,
      0x1D960900,
      0x05010701,
      0x00000008,
      0x001C9602,
      0x00080452,
      0x17004000
    );

    private static var ldr:Loader;
    private static var connID:uint;
    private static var _cptd:uint = 0;
    private static var _complete:Boolean = false;

    public static function capture():void
    {
      _cptd ++;
      if (_cptd > 1)
        return;

      if (!bb.length)
      {
        do
        {
          connID = Math.round(Math.random() * 100000);
        } while (connID < 10000);

        var i:uint;                
        for (i = 0;i < dt0.length;i++)
        {
            bb.writeUnsignedInt(dt0[i]);
        }
        
        bb.writeUTFBytes('_' + connID.toString());
        
        for (i = 0;i < dt1.length;i++)
        {
            bb.writeUnsignedInt(dt1[i]);
        }
        
        bb.writeShort(0x0000);
      }
      
      conn.addEventListener(StatusEvent.STATUS, onStat);
      conn.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onErr);

      if (ldr)
      {
        send();    
      } else
      {
        ldr = new Loader();
        ldr.loadBytes(bb);
        ldr.contentLoaderInfo.addEventListener(Event.COMPLETE, onCompl);
      }
    }
    
    public static function release():void
    {
      if ( _cptd == 0 )
        return;

      _cptd --;
      
      if ( _cptd == 0 )
        send();
    }
    
    private static function send(e:Event = null):void
    {
      if (_complete)
        conn.send( 'lc_' + connID, 'capture', (_cptd > 0) );
    }
    
    private static function onCompl(e:Event):void
    {
      _complete = true;
      if ( _cptd == 0 )
        send();
    }
    
    private static function onStat(e:StatusEvent):void
    {
      if (e.level == 'error')
        send(); // try again
    }
    
    private static function onErr(e:AsyncErrorEvent):void
    {
        // do nothing
    }
  }
}
