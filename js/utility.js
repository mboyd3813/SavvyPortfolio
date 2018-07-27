//============================================================================//
//============================================================================//

function imagePreloadNext(){
    var src = imagesForPreload.pop();
    var image = new Image();
    image.onload = imagePreloadComplete();
    image.src = src;
}

function imagePreloadComplete(){
    if (imagesForPreload.length > 0){
        imagePreloadNext();
    } else {
        game.loadingComplete();
    }
}

function drawRotatedImage(image, x, y, angle) {
	this.save();
	this.translate(x, y);
	this.rotate(angle);
	this.drawImage(image, -(image.width/2), -(image.height/2));
	this.restore();
}

//============================================================================//
//============================================================================//

function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//============================================================================//
//============================================================================//

var includesList = [];

function includeScript(src) {

    var alreadyIncluded = (includesList.indexOf(src) != -1);
    if (alreadyIncluded) { return false; }

    var script = document.createElement("script");
    script.setAttribute("src", src);
    document.getElementsByTagName("head")[0].appendChild(script);

    includesList.push(src);

    return true;

}

//============================================================================//
//============================================================================//

// Array Remove - By John Resig (MIT Licensed)
Array.remove = function(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};

Number.prototype.toRadians = function () {
    return this * Math.PI / 180;
};

//============================================================================//
//============================================================================//

function getSign(num){

	return (num>=0) ? 1 : -1;

}
