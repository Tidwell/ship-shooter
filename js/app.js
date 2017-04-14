(function() {
	function ctg(x) {
		return 1 / Math.tan(x);
	}

	function getImg(img) {
		return document.querySelectorAll('.imgs .'+img)[0].cloneNode(true);
	}
	
	function reducer(state = {
		activeImg: getImg('galleon'),
		canFindTreasure: true,
		canOpenTreasure: false,
		treasureFalse: true,
		score: 0
	}, action) {
		switch(action.type) {
			case 'FINDSHIP':
				const newState = Object.assign({}, state, {
					treasureOpened: false,
					canFindTreasure: true,
					activeImg: getImg('galleon')
				});
				if (state.treasureOpened) {
					newState.score = state.score += 1;
				}
				return newState;
			
			case 'FINDTREASURE':
				return Object.assign({}, state, {
					canFindTreasure: false,
					canOpenTreasure: true,
					activeImg: getImg('chest'),
				});

			case 'OPENTREASURE':
				return Object.assign({}, state, {
					canOpenTreasure: false,
					activeImg: getImg('chest-open'),
					treasureOpened: true
				});
			
			default:
				return state;
		}
	}

	let store = Redux.createStore(reducer);

	store.subscribe(() => {
	  render();
	});


	function click(e) {
		
		// const state = store.getState();
		// if (state.canFindTreasure) {
		// 	return store.dispatch({ type: 'FINDTREASURE' });
		// }
		// if (state.canOpenTreasure) {
		// 	return store.dispatch({ type: 'OPENTREASURE' });
		// }

		// store.dispatch({ type: 'FINDSHIP' });
	}

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
		// document.querySelectorAll('#app')[0].innerHTML = '';
		document.querySelectorAll('#app')[0].appendChild(state.activeImg);
		// document.querySelectorAll('.score')[0].innerHTML = state.score;
	}

	
	document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        // Use event.pageX / event.pageY here
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
	document.querySelectorAll('#app')[0].addEventListener('click', click);
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

	document.body.requestPointerLock();


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
