package
{
    import flash.display.*;
		
    public class Config extends Object
    {
        private static var _config:Object = {
			api_url:"http://api.vkontakte.ru/api.php",
			api_id: 2168679,
			viewer_id:0,
			user_id: 0,
			api_url: 'http://api.vkontakte.ru/api.php',
			api_sid:'',
			api_secret:'',
			image_url: 'http://cs4296.vk.com/u3457516/124935920/w_0003bc4e.jpg',
			album_id: 0,
			onFlashReady:"onFlashReady", 
			onUploadComplete:"onUploadComplete", 
			onDebug:"onDebug", 
			lang: {
				button_upload:'Загрузить изображение',
				choice_album:'Выберите альбом для загрузки:',
				loading_info:'Загрузка информации... Ждите...',
				confirm_box_text:'Нажмите "OK" для подтверждения отправки изображения',
				cancel:'Отмена'
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

