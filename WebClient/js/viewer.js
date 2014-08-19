var viewImageJQ = $('#viewImage')
var viewImage = viewImageJQ[0]
var hammertime = Hammer(viewImage, {})

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var widthRatio = viewImage.naturalWidth / winWidth;
var heightRatio = viewImage.naturalHeight / winHeight;

if(widthRatio >= heightRatio){
	var ratio = (winWidth - 24)/viewImage.width;
	viewImage.width = winWidth - 24;
	viewImage.removeAttribute('height');
	
	viewImageJQ.css('top', (winHeight - (viewImage.height*ratio))/2);
	viewImageJQ.css('left', 12)
}else{
	viewImage.removeAttribute('width');
	var ratio = (winHeight - 24)/viewImage.height;
	viewImage.height = winHeight - 24;
	
	viewImageJQ.css('top', 12);
	viewImageJQ.css('left', (winWidth - (viewImage.width*ratio))/2);
}

hammertime.get('pan').set({direction: Hammer.DIRECTION_ALL});

hammertime.on('pan', function(ev){
	console.log(ev);
});