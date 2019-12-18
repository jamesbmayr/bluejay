window.addEventListener("load", function() {
	/*** globals ***/
		/* browser prefixes */
			window.speechRecognition = window.webkitSpeechRecognition || window.speechRecognition
			window.speechSynthesis   = window.webkitSpeechSynthesis   || window.speechSynthesis

		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				var ON = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
			}
			else {
				var ON = { click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup" }
			}

		/* libraries */
			var AUDIO_LIBRARY 			= window.AUDIO_LIBRARY = null
			var SOUND_LIBRARY 			= window.SOUND_LIBRARY = {}
			var VOICE_LIBRARY 			= window.VOICE_LIBRARY = {}
			var CONFIGURATION_LIBRARY 	= window.CONFIGURATION_LIBRARY = {}
			var FUNCTION_LIBRARY 		= window.FUNCTION_LIBRARY = {}
			var PHRASE_LIBRARY 			= window.PHRASE_LIBRARY || {}
			var ACTION_LIBRARY 			= window.ACTION_LIBRARY || {}
			var CONTEXT_LIBRARY 		= window.CONTEXT_LIBRARY = {
				lastPhrase: null,
				lastAction: null,
				lastResponseMessage: null,
				lastResponseHTML: null,
				flow: null
			}

		/* abort & error messages */
			var STOP_PHRASES = ["quit this game", "quit this", "quit", "abort this", "abort", "stop this", "stop", "stop talking", "stop speaking", "please stop", "shut up", "never mind", "forget it", "forget that"]

			var NOACTION = "???"
			var NOACTION_RESPONSES = ["I'm not sure I follow.", "I don't understand.", "What does that mean?", "I don't know that one.", "I don't get it.", "I'm sorry, can you try that again?", "Can you repeat that?", "Please say that again.", "Wait, what was that?", "I'll need you to repeat that.", "What am I supposed to do?"]
			var NOACTION_INDEX = Math.floor(Math.random() * NOACTION_RESPONSES.length)

			var ERROR_RESPONSES = ["Something went wrong.", "I couldn't do that.", "Let's try that again later.", "Sorry, I have failed you.", "I'm not sure what happened.", "I ran into an error.", "That's an error.", "That didn't go the way I expected.", "Sorry, I couldn't complete that action.", "I blame the developers for this failure."]
			var ERROR_INDEX = Math.floor(Math.random() * ERROR_RESPONSES.length)

		/* settings */
			var LISTENING_INTERVAL = 50
			var LISTENING_DURATION = 10000
			var VOICE = window.VOICE = null
			var VOICE_DELAY = 100
			var VOICE_VOLUME = 1
			var WHISTLE_INTERVAL = 100
			var WHISTLE_FFTSIZE = 8192 / 16
			var WHISTLE_FREQUENCY_THRESHOLD = 500
			var WHISTLE_ENERGY_THRESHOLD = 0.0001
			var WHISTLE_RATIO_MINIMUM = 0.5
			var WHISTLE_RATIO_MAXIMUM = 2

		/* statuses */
			var INITIALIZED = false
			var LISTENING = false
			var LISTENING_TIME = 0
			var LISTENING_COUNTDOWN = null
			
		/* elements */
			var OVERLAY = document.getElementById("overlay")
			var OVERLAY_BUTTON = document.getElementById("overlay-button")

			var INPUTS_AUDIO = document.getElementById("inputs-audio")
			var INPUTS_FORM = document.getElementById("inputs-form")
			var INPUTS_TEXT = document.getElementById("inputs-text")
			var INPUTS_COUNTDOWN = document.getElementById("inputs-countdown")

			var INPUTS_DURATION = document.getElementById("inputs-duration")
			var INPUTS_VOICES = document.getElementById("inputs-voices")
			var INPUTS_VOLUME = document.getElementById("inputs-volume")

			var STREAM = document.getElementById("stream")

		/* recognition */
			var RECOGNITION = new window.speechRecognition()
				RECOGNITION.onsoundend = stopListening
				RECOGNITION.onresult = matchPhrase

		/* synthesizer */
			var SYNTHESIZER = window.speechSynthesis
				SYNTHESIZER.onvoiceschanged = initializeVoices

		/* getAverage */
			FUNCTION_LIBRARY.getAverage = getAverage
			function getAverage(arr) {
				if (!Array.isArray(arr)) {
					return null
				}
				else {
					var sum = 0
					for (var i = 0; i < arr.length; i++) {
						sum += arr[i]
					}
					return (sum / arr.length)
				}
			}

	/*** settings ***/
		/* initializeApplication */
			OVERLAY_BUTTON.addEventListener(ON.click, initializeApplication)
			FUNCTION_LIBRARY.initializeApplication = initializeApplication
			function initializeApplication(event) {
				if (!INITIALIZED) {
					// hide overlay
						INITIALIZED = true
						OVERLAY.setAttribute("invisible", true)

					// focus on input
						INPUTS_TEXT.focus()

					// configuration
						initializeConfiguration()

					// audio
						initializeAudio()

					// preload sounds
						initializeSounds()
				}
			}

		/* initializeConfiguration */
			FUNCTION_LIBRARY.initializeConfiguration = initializeConfiguration
			function initializeConfiguration() {
				// get localStorage
					var storedConfigs = window.localStorage.getItem("CONFIGURATION_LIBRARY")

				// if it exists, try writing to global variable
					if (storedConfigs) {
						try {
							storedConfigs = JSON.parse(storedConfigs)
							for (var i in storedConfigs) {
								CONFIGURATION_LIBRARY[i] = storedConfigs[i]
							}
						}
						catch (error) {}
					}
			}

		/* changeConfiguration */
			FUNCTION_LIBRARY.changeConfiguration = changeConfiguration
			function changeConfiguration(event) {
				// missing key or value
					if (!event.key || !event.value) {
						return false
					}

				// update config
					else {
						CONFIGURATION_LIBRARY[event.key] = event.value
						window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						return true
					}
			}

		/* initializeVoices */
			FUNCTION_LIBRARY.initializeVoices = initializeVoices
			function initializeVoices() {
				// clear options
					INPUTS_VOICES.innerHTML = ""

				// default (no voice)
					var option = document.createElement("option")
						option.innerText = "no voice"
						option.value = null
					INPUTS_VOICES.appendChild(option)

				// get all voices
					var voiceList = SYNTHESIZER.getVoices()
					for (var i in voiceList) {
						VOICE_LIBRARY[voiceList[i].name.toLowerCase().trim()] = voiceList[i]
					}

				// loop through voices
					for (var i in VOICE_LIBRARY) {
						var option = document.createElement("option")
							option.innerText = i
							option.value = i
						INPUTS_VOICES.appendChild(option)
					}

				// select first voice
					if (voiceList.length) {
						INPUTS_VOICES.value = voiceList[0].name.toLowerCase().trim()
						VOICE = VOICE_LIBRARY[voiceList[0].name.toLowerCase().trim()]
					}
			}

		/* changeVoice */
			INPUTS_VOICES.addEventListener("change", changeVoice)
			FUNCTION_LIBRARY.changeVoice = changeVoice
			function changeVoice(event) {
				// via select
					if (event.target && event.target.id == INPUTS_VOICES.id) {
						// set voice from library
							VOICE = VOICE_LIBRARY[INPUTS_VOICES.value.toLowerCase()] || null
					}

				// via action
					else if (event.name) {
						// if voice exists
							if (VOICE_LIBRARY[event.name]) {
								VOICE = VOICE_LIBRARY[event.name]
								INPUTS_VOICES.value = event.name
								return true
							}

						// otherwise
							else {
								return false
							}
					}
			}

		/* changeVolume */
			INPUTS_VOLUME.addEventListener("change", changeVolume)
			FUNCTION_LIBRARY.changeVolume = changeVolume
			function changeVolume(event) {
				// via input
					if (event.target && event.target.id == INPUTS_VOLUME.id) {
						// set volume
							VOICE_VOLUME = Math.max(0, Math.min(100, Number(INPUTS_VOLUME.value))) / 100
					}

				// via action
					else if (event.volume) {
						// if not a number
							if (isNaN(Number(event.volume))) {
								return false
							}

						// otherwise
							else {
								var newVolume = Math.round(Math.max(0, Math.min(100, Number(event.volume))))
								INPUTS_VOLUME.value = newVolume
								VOICE_VOLUME = newVolume / 100
								return true
							}
					}
			}

		/* changeDuration */
			INPUTS_DURATION.addEventListener("change", changeDuration)
			FUNCTION_LIBRARY.changeDuration = changeDuration
			function changeDuration(event) {
				// set duration
					LISTENING_DURATION = Math.max(0, Math.min(60, Number(INPUTS_DURATION.value))) * 1000
			}

	/*** audio input ***/
		/* initializeSounds */
			FUNCTION_LIBRARY.initializeSounds = initializeSounds
			function initializeSounds() {
				try {
					// chirp
						var audio = new Audio()
							audio.src = "chirp.ogg"
							audio.load()
							audio.pause()
							audio.volume = 0.5
						SOUND_LIBRARY.chirp = audio
						setTimeout(function() {
							SOUND_LIBRARY.chirpDuration = audio.duration * 1000
						}, VOICE_DELAY)
				} catch (error) {}
			}

		/* initializeAudio */
			FUNCTION_LIBRARY.initializeAudio = initializeAudio
			function initializeAudio() {
				// audio context
					AUDIO_LIBRARY = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)()
					window.AUDIO_LIBRARY = AUDIO_LIBRARY

				// analyzer
					AUDIO_LIBRARY.analyzer = AUDIO_LIBRARY.createAnalyser()
					AUDIO_LIBRARY.analyzer.fftSize = WHISTLE_FFTSIZE

				// input
					AUDIO_LIBRARY.input = {
						bufferLength: AUDIO_LIBRARY.analyzer.frequencyBinCount,
						lastFrequency: 0,
						lastFrequencyCounter: 0,
						minimum: null,
						maximum: null,
						extremes: 0,
						lastCrossUp: null,
						lastCrossDown: null,
						lastExtreme: null,
						waveLengths: null,
						data: null
					}
					AUDIO_LIBRARY.input.data = new Float32Array(AUDIO_LIBRARY.input.bufferLength)

				// microphone
					if (navigator.mediaDevices) {
						navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
							AUDIO_LIBRARY.microphone = AUDIO_LIBRARY.createMediaStreamSource(stream)
							AUDIO_LIBRARY.microphone.connect(AUDIO_LIBRARY.analyzer)
							AUDIO_LIBRARY.loop = setInterval(FUNCTION_LIBRARY.analyzeAudio, WHISTLE_INTERVAL)
						})
					}
			}

		/* analyzeAudio */
			FUNCTION_LIBRARY.analyzeAudio = analyzeAudio
			function analyzeAudio(event) {
				if (!LISTENING) {
					// refresh data
						AUDIO_LIBRARY.input.lastFrequencyCounter += WHISTLE_INTERVAL
						AUDIO_LIBRARY.analyzer.getFloatTimeDomainData(AUDIO_LIBRARY.input.data)

					// figure out some values
						AUDIO_LIBRARY.input.minimum       = 0
						AUDIO_LIBRARY.input.maximum       = 0
						AUDIO_LIBRARY.input.extremes      = 0
						AUDIO_LIBRARY.input.lastCrossUp   = null
						AUDIO_LIBRARY.input.lastCrossDown = null
						AUDIO_LIBRARY.input.lastExtreme   = null
						AUDIO_LIBRARY.input.wavelengths   = []

					// calculate wavelength from up-cross to up-cross and from down-cross to down-cross (past midpoint)
						for (var t = 1; t < AUDIO_LIBRARY.input.bufferLength; t++) {
							if (AUDIO_LIBRARY.input.data[t - 1] < 0 && AUDIO_LIBRARY.input.data[t] >= 0) { // cross up
								AUDIO_LIBRARY.input.wavelengths.push(t - AUDIO_LIBRARY.input.lastCrossUp)
								AUDIO_LIBRARY.input.lastCrossUp = t
							}
							else if (AUDIO_LIBRARY.input.data[t - 1] >= 0 && AUDIO_LIBRARY.input.data[t] < 0) { // cross down
								AUDIO_LIBRARY.input.wavelengths.push(t - AUDIO_LIBRARY.input.lastCrossDown)
								AUDIO_LIBRARY.input.lastCrossDown = t
							}

							if (AUDIO_LIBRARY.input.data[t] > AUDIO_LIBRARY.input.maximum) { // new maximum
								AUDIO_LIBRARY.input.maximum = AUDIO_LIBRARY.input.data[t]
							}
							else if (AUDIO_LIBRARY.input.data[t] < AUDIO_LIBRARY.input.minimum) { // new minimum
								AUDIO_LIBRARY.input.minimum = AUDIO_LIBRARY.input.data[t]
							}
						}

					// calculate number of changes in direction within 10% of max or min
						for (var t = 0; t < AUDIO_LIBRARY.input.bufferLength; t++) {
							if      ((AUDIO_LIBRARY.input.data[t] > AUDIO_LIBRARY.input.maximum * 0.7) && (!AUDIO_LIBRARY.input.lastExtreme || AUDIO_LIBRARY.input.lastExtreme == "min")) {
							 	AUDIO_LIBRARY.input.lastExtreme = "max"
								AUDIO_LIBRARY.input.extremes++
							}
							else if ((AUDIO_LIBRARY.input.data[t] < AUDIO_LIBRARY.input.minimum * 0.7) && (!AUDIO_LIBRARY.input.lastExtreme || AUDIO_LIBRARY.input.lastExtreme == "max")) {
							 	AUDIO_LIBRARY.input.lastExtreme = "min"
								AUDIO_LIBRARY.input.extremes++
							}
						}

					// remove the first two waves, as they'll be a partial crossup and partial crossdown
						AUDIO_LIBRARY.input.wavelengths = AUDIO_LIBRARY.input.wavelengths.slice(2)
						AUDIO_LIBRARY.input.extremes   -= 2

					// collapse complex waves down to simple waves
						var complexity = Math.round(AUDIO_LIBRARY.input.wavelengths.length / AUDIO_LIBRARY.input.extremes)

					// calculate the frequency & note (sample rate is usually 44100 Hz)
						var newFrequency 	= AUDIO_LIBRARY.sampleRate / FUNCTION_LIBRARY.getAverage(AUDIO_LIBRARY.input.wavelengths) / complexity

					// if above 500Hz and enough energy
						if (newFrequency >= WHISTLE_FREQUENCY_THRESHOLD && AUDIO_LIBRARY.input.maximum >= WHISTLE_ENERGY_THRESHOLD && AUDIO_LIBRARY.input.minimum <= -WHISTLE_ENERGY_THRESHOLD) {
							// no previous frequency
								if (!AUDIO_LIBRARY.input.lastFrequency) {
									AUDIO_LIBRARY.input.lastFrequency = newFrequency
									AUDIO_LIBRARY.input.lastFrequencyCounter = 0
								}

							// compare frequencies
								else {
									var ratio = Math.round(newFrequency / AUDIO_LIBRARY.input.lastFrequency * 100) / 100
									AUDIO_LIBRARY.input.lastFrequency = newFrequency
									AUDIO_LIBRARY.input.lastFrequencyCounter = 0

									if (WHISTLE_RATIO_MINIMUM < ratio && ratio < WHISTLE_RATIO_MAXIMUM) {
										FUNCTION_LIBRARY.startListening({chirp: true})
									}
								}
						}

					// otherwise, reset after 1 second
						else if (AUDIO_LIBRARY.input.lastFrequencyCounter >= 1000) {
							AUDIO_LIBRARY.input.lastFrequency = 0
							AUDIO_LIBRARY.input.lastFrequencyCounter = 0
						}
				}
			}

		/* toggleListening */
			INPUTS_AUDIO.addEventListener(ON.click, toggleListening)
			FUNCTION_LIBRARY.toggleListening = toggleListening
			function toggleListening(event) {
				// manual stop (don't transcribe)
					if (LISTENING) {
						FUNCTION_LIBRARY.stopListening(false)
					}

				// manual start
					else {
						startListening({chirp: false})
					}
			}

		/* startListening */
			FUNCTION_LIBRARY.startListening = startListening
			function startListening(event) {
				// disable input
					INPUTS_TEXT.setAttribute("disabled", true)

				// clear whistle history
					AUDIO_LIBRARY.input.lastFrequency = 0
					AUDIO_LIBRARY.input.lastFrequencyCounter = 0

				// synthesizer
					SYNTHESIZER.pause()
					SYNTHESIZER.cancel()

				// chirp
					var chirpDelay = 0
					if (event.chirp && SOUND_LIBRARY.chirp) {
						try {
							SOUND_LIBRARY.chirp.pause()
							SOUND_LIBRARY.chirp.currentTime = 0
							SOUND_LIBRARY.chirp.play()
							var chirpDelay = SOUND_LIBRARY.chirpDuration
						} catch (error) {}
					}
				
				// set global
					LISTENING = true

				// set countdown failsafe
					setTimeout(function() {
						try {
							RECOGNITION.start()
						} catch (error) {}

						LISTENING_TIME = 0
						LISTENING_COUNTDOWN = setInterval(FUNCTION_LIBRARY.countdownListening, LISTENING_INTERVAL)
					}, chirpDelay)
			}

		/* countdownListening */
			FUNCTION_LIBRARY.countdownListening = countdownListening
			function countdownListening(event) {
				// add to time
					LISTENING_TIME += LISTENING_INTERVAL

				// update bar width
					INPUTS_COUNTDOWN.style.width = (LISTENING_DURATION - LISTENING_TIME) / LISTENING_DURATION * 100 + "%"

				// stop when duration is reached
					if (LISTENING_TIME >= LISTENING_DURATION) {
						FUNCTION_LIBRARY.stopListening(true)
					}
			}

		/* stopListening */
			FUNCTION_LIBRARY.stopListening = stopListening
			function stopListening(continuable) {
				// cancel countdown
					clearInterval(LISTENING_COUNTDOWN)

				// unset global
					LISTENING = false

				// button & text bar
					INPUTS_COUNTDOWN.style.width = "0%"
					INPUTS_TEXT.removeAttribute("disabled")
					INPUTS_TEXT.focus()

				// continue
					if (continuable) {
						RECOGNITION.stop()
					}

				// abort --> display "no results"
					else {
						RECOGNITION.stop()
						RECOGNITION.abort()
						FUNCTION_LIBRARY.matchPhrase()
					}
			}

	/*** phrases ***/
		/* submitPhrase */
			INPUTS_FORM.addEventListener("submit", submitPhrase)
			FUNCTION_LIBRARY.submitPhrase = submitPhrase
			function submitPhrase(event) {
				// get text
					var phrase = INPUTS_TEXT.value || ""

				// clear text / bar
					INPUTS_TEXT.value = ""
					INPUTS_COUNTDOWN.style.width = "0%"

				// submit to match
					FUNCTION_LIBRARY.matchPhrase({
						results: [[{transcript: phrase}]]
					})
			}

		/* matchPhrase */
			FUNCTION_LIBRARY.matchPhrase = matchPhrase
			function matchPhrase(event) {
				// cancel countdown
					clearInterval(LISTENING_COUNTDOWN)

				// get phrase
					if (!event || !event.results || !event.results[0] || !event.results[0][0] || !event.results[0][0].transcript) {
						return false
					}
					else {
						var phrase = event.results[0][0].transcript
					}

				// match phrase to stop command
					if (STOP_PHRASES.includes(phrase.trim())) {
						var action = "stop"
						var remainder = []
					}

				// existing flow?
					else if (CONTEXT_LIBRARY.flow) {
						var action = CONTEXT_LIBRARY.flow
						var remainder = phrase.split(/\s/gi)
					}

				// match phrase to an action in the library
					else {
						var phraseText = phrase.split(/\s/gi)
						var remainder = []
						
						do {
							var action = PHRASE_LIBRARY[phraseText.join(" ").toLowerCase().replace(/[?!.,:;'"_\/\(\)\$\%]/gi,"")] || null
							
							if (!action) {
								remainder.unshift(phraseText.pop())
							}
						} while (!action && phraseText.length)
					}

				// enact phrase
					FUNCTION_LIBRARY.enactPhrase(phrase, action, (remainder.join(" ") || ""))
			}

		/* enactPhrase */
			FUNCTION_LIBRARY.enactPhrase = enactPhrase
			function enactPhrase(phrase, action, remainder) {
				// stop phrase
					if (action == "stop") {
						// end flow
							var previousFlow = CONTEXT_LIBRARY.flow
							CONTEXT_LIBRARY.flow = null
							if (previousFlow) {
								delete CONTEXT_LIBRARY[previousFlow]
							}
						
						// stop speaking
							SYNTHESIZER.pause()
							SYNTHESIZER.cancel()

						createHistory(phrase || "stop", action, {message: "", html: previousFlow ? ("ended flow: " + previousFlow) : "stop"})
					}

				// no action
					else if (!action || !ACTION_LIBRARY[action]) {
						action = NOACTION
						var message = NOACTION_RESPONSES[NOACTION_INDEX]
						NOACTION_INDEX = (NOACTION_INDEX == NOACTION_RESPONSES.length - 1) ? 0 : (NOACTION_INDEX + 1)

						var response = {message: message, html: message}
						createHistory(phrase, action, response)
					}

				// phrase & action
					else {
						ACTION_LIBRARY[action](remainder, function(response) {
							if (typeof response === undefined || response === null) {
								var message = ERROR_RESPONSES[ERROR_INDEX]
								ERROR_INDEX = (ERROR_INDEX == ERROR_RESPONSES.length - 1) ? 0 : (ERROR_INDEX + 1)
								var response = {message: message, html: message}
							}

							createHistory(phrase, action, response)
						})
					}
			}

	/*** stream output ***/
		/* createHistory */
			FUNCTION_LIBRARY.createHistory = createHistory
			function createHistory(phrase, action, response) {
				// context
					CONTEXT_LIBRARY.lastPhrase = phrase
					CONTEXT_LIBRARY.lastAction = action
					CONTEXT_LIBRARY.lastResponseMessage = response.message
					CONTEXT_LIBRARY.lastResponseHTML = response.html

				// visuals
					var historyBlock = document.createElement("div")
						historyBlock.className = "stream-history"

					var phraseBlock = document.createElement("div")
						phraseBlock.className = "stream-history-phrase"
						phraseBlock.innerText = phrase
					historyBlock.appendChild(phraseBlock)

					var actionBlock = document.createElement("div")
						actionBlock.className = "stream-history-action"
						actionBlock.innerText = action
					historyBlock.appendChild(actionBlock)

					var responseBlock = document.createElement("div")
						responseBlock.className = "stream-history-response"
						responseBlock.innerHTML = response.html
					historyBlock.appendChild(responseBlock)

				// prepend to stream
					STREAM.prepend(historyBlock)

				// speak
					if (response.message) {
						FUNCTION_LIBRARY.speakResponse(response.message)
					}
			}

	/*** audio output ***/
		/* speakResponse */
			FUNCTION_LIBRARY.speakResponse = speakResponse
			function speakResponse(message) {
				setTimeout(function() {
					// remove previous utterances queued up
						SYNTHESIZER.cancel()

					// speak the transcript
						if (VOICE) {
							var utterance = new SpeechSynthesisUtterance(message)
								utterance.voice = VOICE
								utterance.volume = VOICE_VOLUME
								utterance.onend = startListening
							SYNTHESIZER.speak(utterance)
						}
				}, VOICE_DELAY)
			}

	/*** back-end ***/
		/* receiveiFrameMessage */
			FUNCTION_LIBRARY.receiveiFrameMessage = receiveiFrameMessage
			window.onmessage = receiveiFrameMessage
			function receiveiFrameMessage(event) {
				try {
					if (!event.isTrusted || event.origin !== window.location.origin) {
						console.log("untrusted message from " + event.origin)
					}
					else {
						event.data = JSON.stringify(event.data)

						if (!event.data || !event.data.function || !FUNCTION_LIBRARY[event.data.function]) {
							console.log("unable to complete postMessage function: " + event)
						}
						else {
							FUNCTION_LIBRARY[event.data.function](event.data.input || null)
							console.log("postMessage success")
						}
					}
				}
				catch (error) { console.log(error) }
			}

		/* proxyRequest */
			FUNCTION_LIBRARY.proxyRequest = proxyRequest
			function proxyRequest(options, callback) {
				// set action for server
					options.action = "proxyRequest"

				// create request object and send to server
					var request = new XMLHttpRequest()
						request.open("POST", location.pathname, true)
						request.onload = function() {
							if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
								callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
							}
							else {
								callback({success: false, readyState: request.readyState, message: request.status})
							}
						}
						request.send(JSON.stringify(options))
			}
})