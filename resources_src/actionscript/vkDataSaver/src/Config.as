package
{
    import flash.display.*;

    public class Config extends Object
    {
        private static var _config:Object = {
			//onReceivedText:"vkSendTextDataToSave",
			onSavedFile:"vkOnSavedFile",
			onSaveFile:"vkOnSaveDebug",
			onInit:"vkOnResizeSaveBtn",
			language_id:0, 
			lang: {
				error:"Произошла ошибка!",
				KB:"Кб", 
				MB:"Мб", 
				decimal_separator:",",
				save_button:"Сохранить",
				button_send:"Отправить", 
				button_add:"Еще", 
				button_close:"Закрыть", 
				button_terminate:"Прервать", 
				button_cancel:"Отмена",
				waiting:"Ждите..."
			}
		};

        public function Config()
        {
            return;
        }

        public static function getConfig() : Object
        {
            return _config;
        }

        public static function loadConfig(param1:LoaderInfo) : Object
        {
            var key:String;
            var value:String;
            var is_lang:Boolean;
            var parameters:Object;
            var loaderInfo:* = param1;
            try
            {
                is_lang;
                parameters = LoaderInfo(loaderInfo).parameters;
                for (key in parameters){
                    value = String(parameters[key]);
                    is_lang = key.indexOf("lang.") == 0 && _config.lang[key.substr(5)] !== undefined;
                    if (is_lang) {
                        trace("Lang " + key + ": " + unescape(value));
                        if (value.substr(0, 1) == "@") {
                            _config.lang[key.substr(5)] = unescape(value.substr(1)).split("@");
                        } else {
                            _config.lang[key.substr(5)] = unescape(value);
                        }
                        continue;
                    }
                    if (_config[key] != undefined) {
                        trace("Param " + key + ": " + unescape(value));
                        _config[key] = unescape(value);
                    }
                }
            } catch (error:Error) {
                trace("ERROR on loadConfig");
                trace(error);
            }
            return _config;
        }

    }
}

