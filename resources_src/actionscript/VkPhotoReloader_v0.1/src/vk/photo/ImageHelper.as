package vk.photo
{
  import flash.display.*;
  import flash.geom.*;
  import flash.filters.ConvolutionFilter;

  
  public class ImageHelper {
    
    public static function resize(image: Bitmap, width: Number, height: Number): Bitmap
    {
      var scale:Number = 1;
      var scaleMatrix: Matrix = new Matrix();
      
			if (image.width > width || image.height > height)
			{
				scale = Math.min(width / image.width, height / image.height);
				scaleMatrix.scale(scale, scale);
			}
			image.smoothing = true;
  		
  		var bmp: BitmapData = new BitmapData(image.width * scale, image.height * scale, true, 0xFFFFFFFF);
      bmp.draw(image, scaleMatrix, null, null, null, true);
      /*var center = 10, divisor = 5;
      if (width < 150) {
        center = 15;
        divisor = 10;
      }
      var sharpenF:ConvolutionFilter = new ConvolutionFilter(3, 3, [0, -1, 0, -1, center, -1, 0, -1, 0], divisor);
      bmp.applyFilter(bmp, bmp.rect, new Point(0,0), sharpenF);
  	  */
		  return new Bitmap(bmp, PixelSnapping.AUTO, true);
    }
    
    
    public static function rotateRight(image: Bitmap): Bitmap 
    {
      return ImageHelper.rotate(image, 1);
    }
    
    public static function rotateLeft(image: Bitmap): Bitmap 
    {
      return ImageHelper.rotate(image, 2);
    }
    
    
    private static function rotate(image: Bitmap, type: Number): Bitmap
    {
      var rotateMatrix: Matrix = new Matrix();
      
      switch (type) 
      {
        case 2:
          rotateMatrix.rotate(-Math.PI / 2);
          rotateMatrix.translate(0, image.width);
        break;
        default:
          rotateMatrix.rotate(Math.PI / 2);
          rotateMatrix.translate(image.height, 0);
      }
      
			image.smoothing = true;
      var bmp: BitmapData = new BitmapData(image.height, image.width, true, 0xFFFFFFFF);
      bmp.draw(image, rotateMatrix, null, null, null, true);
  		return new Bitmap(bmp, PixelSnapping.AUTO, true);
    }
    
  }
}