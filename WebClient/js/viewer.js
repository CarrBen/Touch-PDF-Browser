var viewImageJQ = $('#viewImage')
var viewImage = viewImageJQ[0]
viewImage.JQ = viewImageJQ;
var hammertime = Hammer(viewImage, {})

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var widthRatio = viewImage.naturalWidth / winWidth;
var heightRatio = viewImage.naturalHeight / winHeight;

if(widthRatio >= heightRatio){
	var ratio = (winWidth - 24)/viewImage.width;
	viewImage.width = winWidth - 24;
	viewImage.removeAttribute('height');
	
	viewImage.scale = ratio;
	viewImageJQ.css('top', (winHeight - (viewImage.height*ratio))/2);
	viewImageJQ.css('left', 12)
}else{
	viewImage.removeAttribute('width');
	var ratio = (winHeight - 24)/viewImage.height;
	viewImage.height = winHeight - 24;
	
	viewImage.scale = ratio;
	viewImageJQ.css('top', 12);
	viewImageJQ.css('left', (winWidth - (viewImage.width*ratio))/2);
}

hammertime.get('pan').set({direction: Hammer.DIRECTION_ALL});
hammertime.get('pinch').set({enable: true});

viewImage.panstart = function(){
	var that = this;
	return function(ev){
		that.startTop = parseInt(that.JQ.css('top'));
		that.startLeft = parseInt(that.JQ.css('left'));
		console.log(that.startTop);
	}
}

hammertime.on('panstart', viewImage.panstart());

viewImage.pan = function(){
	var that = this;
	return function(ev){
		that.JQ.css('top', that.startTop + ev.deltaY);
		that.JQ.css('left', that.startLeft + ev.deltaX);
	}
}

hammertime.on('pan', viewImage.pan());

viewImage.pinchstart = function(){
	var that = this;
	return function(ev){
		that.startScale = that.scale;
	}
}

hammertime.on('pinchstart', viewImage.pinchstart());

viewImage.pinch = function(){
	var that = this;
	return function(ev){
		console.log(ev);
		that.scale = that.startScale * ev.scale;
		
		that.height = that.scale * that.naturalHeight;
		that.width = that.scale * that.naturalWidth;
	}
}

hammertime.on('pinch', viewImage.pinch());