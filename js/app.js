(function() {
	function getImg(img) {
		return document.querySelectorAll('.imgs .'+img)[0].cloneNode(true);
	}
	
	function reducer(state = {
		activeImg: getImg('galleon')
	}, action) {
		switch(action.type) {
			default:
				return state;
		}
	}

	let store = Redux.createStore(reducer);

	store.subscribe(() => {
	  render();
	});

	function clickDoc(e) {
		var balls = document.getElementsByClassName('cannonball');
		if (balls[0]) {
			balls[0].parentNode.removeChild(balls[0]);
		}

		const ball = document.createElement('div');
		ball.className = 'cannonball';
		document.querySelectorAll('body')[0].appendChild(ball);
		let style = '--cursor-clicked-top: '+e.pageY+'px;';
		style += '--cursor-clicked-left: '+e.pageX+'px';
		document.querySelectorAll('.cannonball')[0].style = style;

		setTimeout(function() {
			if (document.querySelectorAll('.cannonball').length) {
				document.querySelectorAll('body')[0].removeChild(ball);
			}
		}, 500);
	}

	function render() {
		const state = store.getState();

		document.querySelectorAll('#app')[0].appendChild(state.activeImg);
	}

	
	document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var op = Math.abs(window.innerHeight - event.pageY);
        var adj = Math.abs((window.innerWidth / 2) - event.pageX);

        var angle = (Math.atan2(adj,op)*(180/Math.PI));
        if (event.pageX < window.innerWidth/2) {
        	angle *= -1;
        }
        document.querySelectorAll('body')[0].style = '--cursor-rotate: '+angle+'deg';

    }


	document.querySelectorAll('.cannon-container')[0].appendChild(getImg('cannon'));

	document.addEventListener('DOMContentLoaded', render);

	document.querySelectorAll('#win button')[0].addEventListener('click', reset);
	document.addEventListener('click', clickDoc);

	function reset() {
		hitCount = 0;
		document.querySelectorAll('#win')[0].style.display = 'none';
		delete document.querySelectorAll('#app .galleon')[0].dataset.hits;
		document.querySelectorAll('.score')[0].innerHTML = 0;
	}

	function isCollide(a, b) {
	    return !(
	        ((a.y + a.height) < (b.y)) ||
	        (a.y > (b.y + b.height)) ||
	        ((a.x + a.width) < b.x) ||
	        (a.x > (b.x + b.width))
	    );
	}

	var hitCount = 0;
	setInterval(function() {
		var gal = document.querySelectorAll('#app .galleon')[0];
		var ball = document.querySelectorAll('.cannonball')[0];

		if (gal && ball) {
			var galData = gal.getBoundingClientRect();
			galData.x = galData.left;
			galData.y = galData.top;
			var ballData = ball.getBoundingClientRect();
			ballData.x = ballData.left;
			ballData.y = ballData.top;
			if (isCollide(galData, ballData)) {
				hitCount++;
				gal.dataset.hits = hitCount;
				document.querySelectorAll('.score')[0].innerHTML = hitCount;
				if (hitCount === 5) {
					document.querySelectorAll('#win')[0].style.display = 'block';
				}
				document.querySelectorAll('#app')[0].className = 'hit';
				setTimeout(function() {
					document.querySelectorAll('#app')[0].className = '';
				}, 500);
				ball.parentNode.removeChild(ball);
				

			}
		}
	},200);

	// make some waves.
var ocean = document.getElementById("ocean"),
    waveWidth = 10,
    waveCount = Math.floor(window.innerWidth/waveWidth),
    docFrag = document.createDocumentFragment();

for(var i = 0; i < waveCount; i++){
  var wave = document.createElement("div");
  wave.className += " wave";
  docFrag.appendChild(wave);
  wave.style.left = i * waveWidth + "px";
  wave.style.webkitAnimationDelay = (i/100) + "s";
}

ocean.appendChild(docFrag);


}());
