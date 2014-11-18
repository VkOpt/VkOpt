package vk
{

    public class Lang extends Object
    {
        private var _sexType:String = "slavic";
        private var _numericType:String = "slavic";
        private var _delimiter:String = "";
        private var _language:Number = 0;
        private static var _instance:Lang;
        private static var _allowInst:Boolean;

        public function Lang()
        {
            if (!_allowInst)
            {
                throw new Error("Error: Instantiation failed.");
            }
            return;
        }// end function

        public function set language(lang:Number) : void
        {
            this._language = lang;
            this._numericType = "slavic";
            this._sexType = "slavic";
            this._delimiter = "";
            switch(lang)
            {
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 12:
                case 14:
                case 50:
                case 51:
                case 52:
                case 59:
                case 61:
                case 68:
                case 91:
                case 555:
                case 666:
                {
                    this._numericType = "western";
                    this._sexType = "no";
                    break;
                }
                case 11:
                case 21:
                {
                    this._numericType = "czech";
                    this._sexType = "no";
                    break;
                }
                case 19:
                case 54:
                {
                    this._numericType = "romanian";
                    this._sexType = "no";
                    break;
                }
                case 71:
                {
                    this._numericType = "slovenian";
                    this._sexType = "no";
                    break;
                }
                default:
                {
                    break;
                }
            }
            return;
        }// end function

        public function get language() : Number
        {
            return this._language;
        }// end function

        public function langNumeric(count:Number, variants:Array) : String
        {
            var _loc_4:Number = NaN;
            var _loc_6:Array = null;
            var _loc_7:Number = NaN;
            var _loc_8:String = null;
            if (!variants)
            {
                return count.toString();
            }
            var _loc_3:String = "";
            switch(this._numericType)
            {
                case "slavic":
                {
                    if (count != Math.floor(count))
                    {
                        if (!variants[1])
                        {
                        }
                        _loc_3 = variants[0];
                    }
                    else
                    {
                        _loc_4 = count % 100;
                        if (_loc_4 > 4)
                        {
                        }
                        if (_loc_4 < 21)
                        {
                            if (!variants[2])
                            {
                            }
                            _loc_3 = variants[0];
                        }
                        else
                        {
                            _loc_4 = _loc_4 % 10;
                            switch(_loc_4)
                            {
                                case 1:
                                {
                                    _loc_3 = variants[0];
                                    break;
                                }
                                case 2:
                                case 3:
                                case 4:
                                {
                                    if (!variants[1])
                                    {
                                    }
                                    _loc_3 = variants[0];
                                    break;
                                }
                                default:
                                {
                                    if (!variants[2])
                                    {
                                    }
                                    _loc_3 = variants[0];
                                    break;
                                }
                            }
                        }
                    }
                    break;
                }
                case "czech":
                {
                    if (count != Math.floor(count))
                    {
                        if (!variants[3])
                        {
                        }
                        if (!variants[1])
                        {
                        }
                        _loc_3 = variants[0];
                    }
                    else
                    {
                        switch(count)
                        {
                            case 1:
                            {
                                _loc_3 = variants[0];
                                break;
                            }
                            case 2:
                            case 3:
                            case 4:
                            {
                                if (!variants[1])
                                {
                                }
                                _loc_3 = variants[0];
                                break;
                            }
                            default:
                            {
                                if (!variants[2])
                                {
                                }
                                _loc_3 = variants[0];
                                break;
                            }
                        }
                    }
                    break;
                }
                case "romanian":
                {
                    if (count != Math.floor(count))
                    {
                        if (!variants[3])
                        {
                        }
                        if (!variants[1])
                        {
                        }
                        _loc_3 = variants[0];
                    }
                    else
                    {
                        switch(count)
                        {
                            case 1:
                            {
                                _loc_3 = variants[0];
                                break;
                            }
                            default:
                            {
                                _loc_4 = count % 100;
                                if (_loc_4 < 20)
                                {
                                    if (!variants[1])
                                    {
                                    }
                                    return variants[0];
                                }
                                if (!variants[2])
                                {
                                }
                                return variants[0];
                                break;
                            }
                        }
                    }
                    break;
                }
                case "slovenian":
                {
                    if (count != Math.floor(count))
                    {
                        if (!variants[2])
                        {
                        }
                        if (!variants[1])
                        {
                        }
                        _loc_3 = variants[0];
                    }
                    else
                    {
                        _loc_4 = count % 100;
                        switch(_loc_4)
                        {
                            case 1:
                            {
                                _loc_3 = variants[0];
                                break;
                            }
                            case 2:
                            {
                                _loc_3 = variants[1];
                                break;
                            }
                            case 3:
                            case 4:
                            {
                                if (!variants[2])
                                {
                                }
                                _loc_3 = variants[0];
                                break;
                            }
                            default:
                            {
                                if (!variants[3])
                                {
                                }
                                if (!variants[2])
                                {
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
                default:
                {
                    break;
                }
            }
            var _loc_5:* = count.toString();
            if (this._delimiter.length > 0)
            {
            }
            if (count == Math.floor(count))
            {
                _loc_6 = [];
                _loc_7 = _loc_5.length % 3 - 3;
                while (_loc_7 < _loc_5.length)
                {
                    
                    _loc_8 = _loc_5.substr(_loc_7 < 0 ? (0) : (_loc_7), _loc_7 < 0 ? (3 + _loc_7) : (3));
                    if (_loc_8.length > 0)
                    {
                        _loc_6.push(_loc_8);
                    }
                    _loc_7 = _loc_7 + 3;
                }
                _loc_5 = _loc_6.join(this._delimiter);
            }
            if (!_loc_3)
            {
            }
            _loc_3 = "{count}".replace("{count}", _loc_5);
            return _loc_3;
        }// end function

        public static function getInstance() : Lang
        {
            if (_instance == null)
            {
                _allowInst = true;
                _instance = new Lang;
                _allowInst = false;
            }
            return _instance;
        }// end function

    }
}
