(function($) {
	let music;

	function getImg(img) {
		return document.querySelectorAll('.imgs .' + img)[0].cloneNode(true);
	}

	// function $(qs) {
	// 	return document.querySelectorAll(qs)[0];
	// }

	function isCollide(a, b) {
		return !(
			((a.top + a.height) < (b.top)) ||
			(a.top > (b.top + b.height)) ||
			((a.left + a.width) < b.left) ||
			(a.left > (b.left + b.width))
		);
	}

	/*
	
	*** STATE MANAGER ***

	 */

	const initialState = {
		sound: true,
		hasWon: false,
		score: 0,
		hasFired: false,
		cannonBallTargetX: 0,
		cannonBallTargetY: 0,
		cannonRotationDegrees: 0,
		isHit: false
	};

	function reducer(state = initialState, action) {
		switch (action.type) {
			case 'HIT':
				return Object.assign({}, state, {
					score: state.score + 1,
					isHit: true
				});
			case 'HAS_BEEN_HIT':
				return Object.assign({}, state, {
					isHit: false
				});
			case 'RESET':
				return Object.assign({}, state, initialState);
			case 'FIRE_CANNONBALL':
				return Object.assign({}, state, {
					cannonBallTargetX: action.target.x,
					cannonBallTargetY: action.target.y,
				});
			case 'CANNONBALL_SINK':
				return Object.assign({}, state, {
					cannonBallTargetX: 0,
					cannonBallTargetY: 0
				});
			case 'AIM_CANNON':
				return Object.assign({}, state, {
					cannonRotationDegrees: action.degrees
				});
			case 'WIN':
				return Object.assign({}, state, {
					hasWon: true
				});
			case 'TOGGLE_SOUND':
				initialState.sound = !state.sound;
				return Object.assign({}, state, {
					sound: !state.sound
				});
			default:
				return state;
		}
	}

	let store = Redux.createStore(reducer);

	const throttledRender = $.throttle( 15, renderOnStoreChange );
	store.subscribe(() => {
		throttledRender();
	});

	/*
	
	*** RENDERING ***

	 */
	function createCannonBall() {
		const ball = document.createElement('div');
		ball.className = 'cannonball';
		$('body').append(ball);
	}

	function renderOnStoreChange() {
		const state = store.getState();

		let galleonContainer = $('.galleon-container');
		let galleon = $('#app .galleon');
		if (!galleon.length) {
			galleonContainer = $('<div class="galleon-container"></div>');
			galleonContainer.append(getImg('galleon'));
			galleon = $('#app').append(galleonContainer);
		}

		const cannon = $('.cannon-container .cannon');

		if (!cannon.length) {
			$('.cannon-container').append(getImg('cannon'));
		}

		//render cannon rotation
		$('body').css('--cursor-rotate', state.cannonRotationDegrees + 'deg');

		if ((state.cannonBallTargetX || state.cannonBallTargetY) && !$('.cannonball').length) {
			$('.cannon-container').addClass('fired');
			setTimeout(function() {
				$('.cannon-container').removeClass('fired');
			}, 250);
			createCannonBall();
			$('.cannonball').css('--cursor-clicked-top', state.cannonBallTargetY + 'px');
			$('.cannonball').css('--cursor-clicked-left', state.cannonBallTargetX + 'px');

			if (state.sound) {
				createjs.Sound.play('cannon');
			}
		} else if ($('.cannonball').length && !state.cannonBallTargetX && !state.cannonBallTargetY) {
			$('.cannonball').remove();
		}

		//render gallion being hit
		galleon[0].dataset.hits = state.score;
		galleonContainer[0].dataset.hits = state.score;

		if (state.isHit) {
			$('.galleon-container').append(getImg('pyro'));
			$('#app').addClass('hit');
			setTimeout(function() {
				$('#app').removeClass('hit');
				$('.galleon-container .pyro').remove();
			}, 500);
			store.dispatch({
				type: 'HAS_BEEN_HIT'
			});
			if (state.sound) {
				const hit = createjs.Sound.play('hit');
				hit.volume = .5;
			}
		}

		//update score		
		$('.score').html(state.score);

		//win screen
		if (state.hasWon) {
			$('#win').show();
		} else {
			$('#win').hide();
		}

		if (!state.sound) {
			$('body').addClass('sound-disabled');
			createjs.Sound.stop();
		} else {
			$('body').removeClass('sound-disabled');
			if (music) {
				music.play();
			}
		}
	}

	/*
	
	*** EVENT HANDLING ***

	 */
	
	let sinkTimeout;

	function fireCannon(e) {
		const state = store.getState();
		if (state.cannonBallTargetX && state.cannonBallTargetY) {
			return;
		}
		store.dispatch({
			type: 'FIRE_CANNONBALL',
			target: {
				x: e.pageX,
				y: e.pageY
			}
		});


		sinkTimeout = setTimeout(function() {
			store.dispatch({
				type: 'CANNONBALL_SINK'
			});
		}, 500);
	}

	function aimCannon(event) {

		var op = Math.abs(window.innerHeight - event.pageY);
		var adj = Math.abs((window.innerWidth / 2) - event.pageX);

		var angle = (Math.atan2(adj, op) * (180 / Math.PI));
		if (event.pageX < window.innerWidth / 2) {
			angle *= -1;
		}

		store.dispatch({
			type: 'AIM_CANNON',
			degrees: angle
		});
	}

	function reset() {
		store.dispatch({
			type: 'RESET'
		});
	}

	function toggleSound() {
		store.dispatch({
			type: 'TOGGLE_SOUND'
		});
	}


	const throttledAim = $.throttle( 15, aimCannon );
	document.addEventListener('mousemove', throttledAim);

	document.addEventListener('click', fireCannon);

	$('#win button').on('click', reset);

	$('#chrome .sound').on('click', toggleSound);

	/*
	
	*** EVENT LOOP ***

	 */
	setInterval(function() {
		const state = store.getState();

		var gal = $('#app .galleon')[0];
		var ball = $('.cannonball')[0];

		if (gal && ball && isCollide(gal.getBoundingClientRect(), ball.getBoundingClientRect())) {
			store.dispatch({
				type: 'HIT'
			});
			store.dispatch({
				type: 'CANNONBALL_SINK'
			});
			clearTimeout(sinkTimeout);
		}

		if (state.score === 5) {
			store.dispatch({
				type: 'WIN'
			});
		}
	}, 200);

	// make some waves.
	var ocean = document.getElementById('ocean'),
		waveWidth = 10,
		waveCount = Math.floor(window.innerWidth / waveWidth),
		docFrag = document.createDocumentFragment();

	for (var i = 0; i < waveCount; i++) {
		var wave = document.createElement('div');
		wave.className += ' wave';
		docFrag.append(wave);
		wave.style.left = i * waveWidth + 'px';
		wave.style.webkitAnimationDelay = (i / 100) + 's';
	}

	ocean.append(docFrag);

	renderOnStoreChange();

	createjs.Sound.on('fileload', handleLoadComplete);
	createjs.Sound.alternateExtensions = ['mp3'];
	createjs.Sound.registerSound('sound/cannon.mp3', 'cannon', 4);
	createjs.Sound.registerSound('sound/music.mp3', 'music');
	createjs.Sound.registerSound('sound/hit.mp3', 'hit', 4);
	function handleLoadComplete(event) {
		music = createjs.Sound.play('music', { loop: -1 });
		music.volume = 0.45;
	}

}(jQuery));
