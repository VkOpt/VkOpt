package 
{
    import flash.utils.*;

    public class Helper extends Object
    {

        public function Helper()
        {
            return;
        }
		
        public static function langDataSize(bytes:Number, lang:Object) : String
        {
            if (bytes >= 0)
            {
            }
            if (bytes < 1024 * 1024)
            {
                return Math.ceil(bytes / 1024) + " " + lang.KB;
            }
            return format(bytes / 1024 / 1024, 1, lang["decimal_separator"]) + " " + lang.MB;
        }

        public static function clone(source:Object):Object
        {
            var _loc_2:* = new ByteArray();
            _loc_2.writeObject(source);
            _loc_2.position = 0;
            return _loc_2.readObject();
        }

        public static function format(num:Number, precision:Number, splitCharacter:String = ".") : String
        {
            var _loc_4:* = Math.abs(precision);
            precision = Math.abs(precision);
            if (_loc_4 == 0)
            {
                return Math.round(num).toString();
            }
            return Math.round(num) + splitCharacter + Math.round(num * Math.pow(10, precision)).toString().substr(-precision);
        }

    }
}
