package vk.controls
{
    import caurina.transitions.*;
    import flash.display.*;
    import flash.events.*;
    import vk.gui.*;

    public class BasePanel extends Sprite
    {
        private var container:DisplayObjectContainer;
        private var isVisible:Boolean = false;
        private static var panelsShown:int = 0;
        public static const EVENT_SHOW:String = "event_show";
        private static var transparentBG:Sprite;
        public static const EVENT_HIDE:String = "event_hide";
        private static var panels:Array = [];

        public function BasePanel()
        {
            if (!transparentBG)
            {
                transparentBG = new Sprite();
                Utils.fillRect(transparentBG, 0, 0, 10, 10, 0, 0);
            }
            panels.push(this);
            this.visible = false;
            return;
        }// end function

        public function hide() : void
        {
            if (parent)
            {
            }
            if (!this.isVisible)
            {
                return;
            }
            Tweener.removeTweens(this);
            Tweener.addTween(this, {alpha:0, time:0.7, onComplete:function () : void
				{
                this.visible = false;
                if (!panelsShown) parent.removeChild(transparentBG);
                return;
				}
            });
            this.isVisible = false;
            var _loc_3:* = panelsShown - 1;
            panelsShown = _loc_3;
            if (!panelsShown)
            {
                dispatchEvent(new Event(BasePanel.EVENT_HIDE));
            }
            return;
        }// end function

        public function show() : void
        {
            if (parent)
            {
            }
            if (this.isVisible)
            {
                return;
            }
            if (!panelsShown)
            {
                parent.addChild(transparentBG);
                parent.setChildIndex(transparentBG, parent.numChildren - 2);
            }
            transparentBG.width = parent.width;
            transparentBG.height = parent.height;
            if (Tweener.isTweening(this))
            {
                Tweener.removeTweens(this);
            }
            this.alpha = 0;
            this.visible = true;
            parent.setChildIndex(this, (parent.numChildren - 1));
            this.isVisible = true;
            Tweener.addTween(this, {alpha:1, time:0.5});
            if (!panelsShown)
            {
                dispatchEvent(new Event(BasePanel.EVENT_SHOW));
            }
            var _loc_2:* = panelsShown + 1;
            panelsShown = _loc_2;
            return;
        }// end function

    }
}
