package vk.controls
{
    import flash.display.*;

    public class LiteBox extends BasePanel
    {
        private var liteBoxSprite:LiteBoxSprite;
        private var _content:DisplayObject;

        public function LiteBox()
        {
            this.liteBoxSprite = new LiteBoxSprite();
            addChild(this.liteBoxSprite);
            return;
        }// end function

        public function get content() : DisplayObject
        {
            return this._content;
        }// end function

        public function set content(obj:DisplayObject) : void
        {
            if (this._content)
            {
                removeChild(this._content);
            }
            if (obj == null)
            {
                return;
            }
            this._content = obj;
            addChild(this._content);
            var _loc_2:int = 20;
            this._content.y = 20;
            this._content.x = _loc_2;
            this.refresh();
            return;
        }// end function

        public function refresh() : void
        {
            if (!this._content)
            {
                return;
            }
            this.liteBoxSprite.width = Math.round(this._content.x + this._content.width + 23);
            this.liteBoxSprite.height = Math.round(this._content.y + this._content.height + 25);
            return;
        }// end function

    }
}
