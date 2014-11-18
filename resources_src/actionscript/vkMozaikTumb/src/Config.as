package
{
    import flash.display.*;

    public class Config extends Object
    {
        private static var _config:Object = {
			upload_url:"http://cs319216.vk.com/upload.php?act=do_add&mid=2314852&aid=169819278&gid=37273781&hash=82c465709a9b754e44ba2b4a4c27426a&rhash=235249149115419e40ada041ab7e2037&swfupload=1&api=1&save_big=1", 
			redirect_url:"http://localhost/index.php?result=1", 
			onResize:"vk_photos.pz_onresize",
			onDone:"vk_photos.pz_ondone",
			language_id:0, 
			lang: {
				default_photo:"Обыкновенный фейк",
				multi_fake:"Мультифейк",
				browse_header:"Загрузка фотографий с Вашего компьютера", 
				browse_limitations:"Ограничения", 
				browse_formats:"Поддерживаемые форматы файлов:  JPG, PNG и GIF. ", 
				browse_big_photos:"Загружать большие фотографии", 
				photos_count:["{count} фотография", "{count} фотографии", "{count} фотографий"], 
				no_photos:"Нет фотографий", 
				cannot_add_more:"Вы не можете добавлять больше 50 фотографий.", 
				send_confirm:"Размер отправляемых данных ",
				loading:"Загрузка", 
				processing:"Обработка данных", 
				sending:"Отправка данных", 
				error_loading_file:"Ошибка загрузки файла", 
				error:"Произошла ошибка!", 
				KB:"Кб", 
				MB:"Мб", 
				decimal_separator:",", 
				button_browse:"Выбрать одиночное фото", 
				button_multi_browse:"Выбрать файл для мозаики", 
				button_send:"Отправить", 
				button_add:"Еще", 
				button_close:"Закрыть", 
				button_terminate:"Прервать", 
				button_cancel:"Отмена"
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

