window.onload = function() {

	// Video
	var video = document.getElementById("video");
	var videoCover = document.getElementById("video-cover");
	var videoText = document.getElementById("cover-text");
	var videoControls = document.getElementById("video-controls");

	// Buttons
	var playButton = document.getElementById("play-pause");
	var muteButton = document.getElementById("mute");
	var fullScreenButton = document.getElementById("full-screen");

	// Sliders
	var seekBar = document.getElementById("seek-bar");
	var seekOverlay = document.getElementById("seekOverlay");
	var volumeBar = document.getElementById("volume-bar");

	// Set Height Based on Window Size
	var header = document.getElementsByClassName('kcts-header');
	var landing = document.getElementById("main-landing");
	var infoBox = document.getElementById("sidebar");
	var videoContainer = document.getElementById("video-container");

	// watches if video was paused or not for seek handling
	var wasPaused = true;

	resizeElements();
	parseTimecodes();
	writeTimeList(); // comment out to stop write
	updateVideoMarkers();
	updateTimecodeClassObjects();

	window.addEventListener("resize", resizeElements);

	// Event listener for the play/pause button
	playButton.addEventListener("click", pausePlay);

	// Event listener for click on video container to play/pause
	videoCover.addEventListener("click", pausePlay);

	// Event listener for the mute button
	muteButton.addEventListener("click", function() {
		if (video.muted == false) {
			// Mute the video
			video.muted = true;

			// Update the button text
			muteButton.innerHTML = "Unmute";
		} else {
			// Unmute the video
			video.muted = false;

			// Update the button text
			muteButton.innerHTML = "Mute";
		}
	});

	// Event listener for the seek bar
	seekBar.addEventListener("change", function() {
		// Calculate the new time
		var time = video.duration * (seekBar.value / 100);

		// Update the video time
		video.currentTime = time;
	});

	// Event listener for the full-screen button
	fullScreenButton.addEventListener("click", function() {
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.mozRequestFullScreen) {
			video.mozRequestFullScreen(); // Firefox
		} else if (video.webkitRequestFullscreen) {
			video.webkitRequestFullscreen(); // Chrome and Safari
		}
	});

	// Update the seek bar as the video plays
	video.addEventListener("timeupdate", function() {
		// Calculate the slider value
		var value = (100 / video.duration) * video.currentTime;

		// Update the slider value
		seekBar.value = value;
	});

	// Pause the video when the seek handle is being dragged
	seekBar.addEventListener("mousedown", function() {
		if (video.paused == true) {
			wasPaused = true;
		} else {
			wasPaused = false;
		}
		video.pause();
	});

	// Play the video when the seek handle is dropped
	seekBar.addEventListener("mouseup", function() {
		if (wasPaused == false) {
			video.play();
		}
	});

	// Handles click to explore video instead of drag while playing
	seekBar.addEventListener("click", function(e) {
		var xPos = e.pageX - seekBar.getBoundingClientRect().left;
		// translate from px to timecode
		video.currentTime = xPos / seekBar.clientWidth * video.duration;
	});

	// Event listener for the volume bar
	volumeBar.addEventListener("change", function() {
		// Update the video volume
		video.volume = volumeBar.value;
	}, false);

	// function for pause/play event listeners, changing HTML elements and showing cover
	function pausePlay() {
		if (video.paused == true) {
			// Play the video
			video.play();
			videoCover.style.backgroundColor = "transparent";
			videoText.style.visibility = "hidden";
			wasPaused = false;
			// Update the button text to 'Pause'
			playButton.innerHTML = "Pause";
		} else {
			// Pause the video
			video.pause();
			videoCover.style.backgroundColor = "black";
			videoText.style.visibility = "visible";
			wasPaused = true;
			// Update the button text to 'Play'
			playButton.innerHTML = "Play";
		}
	}

	// parse in timecodes from timecodes.js to HTML
	function parseTimecodes() {
		var totalMarkers = "";
		for (i = 0; i < timecodes.length; i++) {
			var timecodeMarker = '<span class="marker" id="marker' + i + '" data-timecode="' + timecodes[i].timecode + '"><span class="tooltipcontent">';
			if (timecodes[i].image != "") {
				timecodeMarker += '<img src="' + timecodes[i].image + '" width="100px" max-height="100px" alt="marker" />';
			}
			timecodeMarker += timecodes[i].title + '</span></span>';
			totalMarkers += timecodeMarker;
		}
		seekOverlay.insertAdjacentHTML('beforeend', totalMarkers);
	}

	// place and add listeners on markers
	function updateVideoMarkers() {
		var markers = document.getElementsByClassName("marker");
		var seekBarWidth = seekBar.clientWidth;
		for (i = 0; i < markers.length; i++) {
			var location = (seekBarWidth * markers[i].dataset.timecode / video.duration);
			markers[i].style.left = location + "px";
			markers[i].addEventListener("click", function() {
				video.currentTime = this.dataset.timecode;
			});
		}
	}

	// takes the timecodes and writes them into a list in id time-links
	function writeTimeList() {
		var insertTo = document.getElementById("time-links");
		var list = "<ul>";
		for (i = 0; i < timecodes.length; i++) {
			list += "<li class='timecode' data-timecode='" + timecodes[i].timecode + "'>" + timecodes[i].title + "</li>";
		}
		list += "</ul>";
		insertTo.insertAdjacentHTML('beforeend', list);
	}

	// updates objects with the timecode class
	// to target a specific timecode, add a "data-timecode" custom variable on desired object and "timecode" class
	function updateTimecodeClassObjects() {
		var pointers = document.getElementsByClassName("timecode");
		for (i = 0; i < pointers.length; i++) {
			pointers[i].addEventListener("click", function() {
				video.currentTime = this.dataset.timecode;
			});
		}
	}

	// resizes video and infoBox elements based on header
	function resizeElements() {
		var heightWithoutHeader = window.innerHeight - header[0].clientHeight;
		var videoHeight = heightWithoutHeader - videoControls.clientHeight;
		landing.style.height = heightWithoutHeader + "px";
		videoContainer.style.maxWidth = (videoHeight / 9 * 16) + "px";
		if ((videoContainer.clientWidth + 150) < landing.offsetWidth) {
			infoBox.style.width = (window.innerWidth - (videoHeight / 9 * 16)) + "px";
			infoBox.style.height = "100%";
			infoBox.style.position = "absolute";
			infoBox.style.top = "0";
			infoBox.style.left = "";
			infoBox.style.bottom = "";
			infoBox.style.right = "0";
		} else {
			if (heightWithoutHeader - videoContainer.clientHeight > 300) {
				infoBox.style.height = (heightWithoutHeader - videoContainer.clientHeight) + "px";
			} else {
				infoBox.style.height = "300px";
			}
			infoBox.style.width = "100%";
			infoBox.style.position = "relative";
		}
		updateVideoMarkers();
	}
}
