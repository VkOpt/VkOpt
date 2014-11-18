package vk.gui
{
    import flash.display.*;

    dynamic public class ProgressBarBase extends MovieClip
    {
        public var progressBar:MovieClip;
        public var indeterBar:MovieClip;
        public var indeterMask:MovieClip;
        public var trackBar:MovieClip;

        public function ProgressBarBase()
        {
            
		 progressBar = new MovieClip();
         indeterBar = new MovieClip();
         indeterMask = new MovieClip();
         trackBar = new MovieClip();
		 return;
        }// end function

    }
}
