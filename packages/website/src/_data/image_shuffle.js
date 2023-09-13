// Shuffle contributor logos on main page

document.addEventListener("DOMContentLoaded", (event) => {
	// wait for DOM to complete loading before altering the images
	shuffle();
});

function shuffle() {
	var img_div = document.getElementById('images');
	var imgs = ticker.getElementsByTagName('img');
	var tmpdiv = document.createElement('div');
	tmpdiv.id = 'ticker_images';
	tmpdiv.className = 'flex -mx-8 img-ticker';
	// Add initial spacer to ensure initial logo appears on screen
	tmpdiv.innerHTML += '<img class="max-h-16 w-96 mx-12 self-start flex m-auto">'
	var order = shuffleArray(Array.from({length: imgs.length}, (v, i) => i+1));
	
	for (var i = 0; i < order.length; i++) {
		tmpdiv.appendChild(  document.getElementById('img' + order[i])  );
	}

	// ensure images appear for the duration of the animation by copying the node twice
	var clone = tmpdiv.cloneNode(true);
	while (clone.hasChildNodes()) {
		tmpdiv.appendChild(clone.firstChild);
	}

  	// replace img_div with shuffled order images
	img_div.parentNode.replaceChild(tmpdiv, img_div);
}

function shuffleArray(arr) {
	for (var i = 0, shuffled = [], randomIndex = 0; i < arr.length; i++) {
        randomIndex = Math.floor(Math.random() *  arr.length);
        while (shuffled.indexOf(arr[randomIndex]) !== -1) {
		randomIndex = Math.floor(Math.random() *  arr.length);
        }
       shuffled.push(arr[randomIndex]);
    }
	return shuffled;
}
