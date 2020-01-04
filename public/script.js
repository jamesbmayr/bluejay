window.addEventListener("load", function() {
	/*** globals ***/
		/* browser prefixes */
			window.speechRecognition 	= window.webkitSpeechRecognition || window.speechRecognition
			window.speechSynthesis   	= window.webkitSpeechSynthesis   || window.speechSynthesis
			window.AudioContext			= window.webkitAudioContext      || window.AudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext

		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				var ON = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
			}
			else {
				var ON = { click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup" }
			}

	/*** libraries ***/
		/* empty globals */
			var INITIALIZED 			= false
			var AUDIO_LIBRARY 			= window.AUDIO_LIBRARY 			=  {}
			var SOUND_LIBRARY 			= window.SOUND_LIBRARY 			=  {}
			var RECOGNITION_LIBRARY 	= window.RECOGNITION_LIBRARY 	=  {}
			var VOICE_LIBRARY 			= window.VOICE_LIBRARY 			=  {}

			var FUNCTION_LIBRARY 		= window.FUNCTION_LIBRARY 		=  {}
			var PHRASE_LIBRARY 			= window.PHRASE_LIBRARY 		|| {}
			var ACTION_LIBRARY 			= window.ACTION_LIBRARY 		|| {}

		/* context library */
			var CONTEXT_LIBRARY = window.CONTEXT_LIBRARY = {
				lastPhrase: null,
				lastAction: null,
				lastResponseMessage: null,
				lastResponseHTML: null,
				lastResponseNumber: null,
				flow: null,
				alarms: [],
				loop: null
			}

		/* error library */
			var ERROR_LIBRARY = window.ERROR_LIBRARY = {
				"stop-phrases": ["quit this game", "quit this", "quit", "abort this", "abort", "stop this", "stop", "stop talking", "stop speaking", "please stop", "shut up", "never mind", "forget it", "forget that"],
				"stop-listening-phrases": ["quit listening", "quit listening to me", "stop listening", "stop listening to me", "cease listening", "cease listening to me"],
				"noaction": "???",
				"noaction-responses": ["I'm not sure I follow.", "I don't understand.", "What does that mean?", "I don't know that one.", "I don't get it.", "I'm sorry, can you try that again?", "Can you repeat that?", "Please say that again.", "Wait, what was your question?", "I'll need you to repeat that.", "What am I supposed to do?"],
				"error-responses": ["Something went wrong.", "I couldn't do that.", "Let's try that again later.", "Sorry, I have failed you.", "I'm not sure what happened.", "I ran into an error.", "That's an error.", "That didn't go the way I expected.", "Sorry, I couldn't complete that action.", "I blame the developers for this failure."],
			}

		/* configurations */
			var CONFIGURATION_LIBRARY = window.CONFIGURATION_LIBRARY = {
				settings: {
					"state-interval": 100,
					"whistle-on": true,
					"whistle-fftsize": 512,
					"whistle-frequency-minimum": 1000,
					"whistle-frequency-maximum": 2000,
					"whistle-energy-threshold": 0.01,
					"whistle-interval-minimum": 1,
					"whistle-interval-maximum": 5,
					"recognition-interval": 50,
					"recognition-duration": 10,
					"voice": null,
					"voice-delay": 100,
					"voice-volume": 100,
					"fetch-interval": 3000,
					"fetch-abandon": 10
				}
			}

		/* element library */
			var ELEMENT_LIBRARY = window.ELEMENT_LIBRARY = {
				"overlay": 						document.getElementById("overlay"),
				"overlay-button": 				document.getElementById("overlay-button"),

				"inputs-audio": 				document.getElementById("inputs-audio"),
				"inputs-form": 					document.getElementById("inputs-form"),
				"inputs-text": 					document.getElementById("inputs-text"),
				"inputs-countdown": 			document.getElementById("inputs-countdown"),

				"inputs-configuration": 		document.getElementById("inputs-configuration"),
				"inputs-whistle-on": 			document.getElementById("inputs-whistle-on"),
				"inputs-recognition-duration": 	document.getElementById("inputs-recognition-duration"),
				"inputs-voice": 				document.getElementById("inputs-voice"),
				"inputs-voice-volume": 			document.getElementById("inputs-voice-volume"),

				"stream": 						document.getElementById("stream")
			}

	/*** application ***/
		/* initializeApplication */
			ELEMENT_LIBRARY["overlay-button"].addEventListener(ON.click, initializeApplication)
			FUNCTION_LIBRARY.initializeApplication = initializeApplication
			function initializeApplication(event) {
				if (!INITIALIZED) {
					// hide overlay
						INITIALIZED = true
						ELEMENT_LIBRARY["overlay"].setAttribute("invisible", true)

					// focus on input
						ELEMENT_LIBRARY["inputs-text"].focus()

					// preload errors
						ERROR_LIBRARY["noaction-index"] = Math.floor(Math.random() * ERROR_LIBRARY["noaction-responses"].length)
						ERROR_LIBRARY["error-index"]    = Math.floor(Math.random() * ERROR_LIBRARY["error-responses"].length)

					// preload sounds
						initializeSounds()

					// audio
						initializeAudio()

					// recognition
						initializeRecognition()

					// synthesizer
						initializeVoices()

					// configuration
						initializeConfiguration()

					// loop
						CONTEXT_LIBRARY.loop = setInterval(iterateState, CONFIGURATION_LIBRARY["state-interval"])
				}
			}

		/* getAverage */
			FUNCTION_LIBRARY.getAverage = getAverage
			function getAverage(arr) {
				try {
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
				} catch (error) {
					return null
				}
			}

		/* getDigits */
			FUNCTION_LIBRARY.getDigits = getDigits
			function getDigits(numberWord) {
				try {
					if (!isNaN(numberWord)) {
						return numberWord
					}
					else {
						numberWord = numberWord.toLowerCase().trim()
						     if (numberWord == "zero") 		{ return 0 }
						else if (numberWord == "one") 		{ return 1 }
						else if (numberWord == "two") 		{ return 2 }
						else if (numberWord == "three") 	{ return 3 }
						else if (numberWord == "four") 		{ return 4 }
						else if (numberWord == "five") 		{ return 5 }
						else if (numberWord == "six") 		{ return 6 }
						else if (numberWord == "seven") 	{ return 7 }
						else if (numberWord == "eight") 	{ return 8 }
						else if (numberWord == "nine") 		{ return 9 }
						else if (numberWord == "ten") 		{ return 10 }
						else if (numberWord == "eleven") 	{ return 11 }
						else if (numberWord == "twelve") 	{ return 12 }
						else if (numberWord == "thirteen") 	{ return 13 }
						else if (numberWord == "fourteen") 	{ return 14 }
						else if (numberWord == "fifteen") 	{ return 15 }
						else if (numberWord == "sixteen") 	{ return 16 }
						else if (numberWord == "seventeen") { return 17 }
						else if (numberWord == "eighteen") 	{ return 18 }
						else if (numberWord == "nineteen") 	{ return 19 }
						else if (numberWord == "twenty") 	{ return 20 }
						else if (numberWord == "thirty") 	{ return 30 }
						else if (numberWord == "forty") 	{ return 40 }
						else if (numberWord == "fifty") 	{ return 50 }
						else if (numberWord == "sixty") 	{ return 60 }
						else if (numberWord == "seventy") 	{ return 70 }
						else if (numberWord == "eighty") 	{ return 80 }
						else if (numberWord == "ninety") 	{ return 90 }
						else if (numberWord == "hundred") 	{ return 100 }
						else if (numberWord == "thousand") 	{ return 1000 }
						else if (numberWord == "million") 	{ return 1000000 }
						else if (numberWord == "billion") 	{ return 1000000000 }
						else if (numberWord == "trillion") 	{ return 1000000000000 }
						else {
							return numberWord
						}
					}
				}
				catch (error) {
					return numberWord
				}
			}

		/* chooseRandom */
			FUNCTION_LIBRARY.chooseRandom = chooseRandom
			function chooseRandom(options) {
				try {
					if (!Array.isArray(options)) {
						return false
					}
					else {
						return options[Math.floor(Math.random() * options.length)]
					}
				}
				catch (error) {
					return false
				}
			}

	/*** settings ***/
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
								// built-in settings
									if (i == "settings") {
										for (var j in storedConfigs.settings) {
											CONFIGURATION_LIBRARY.settings[j] = storedConfigs.settings[j]

											if (ELEMENT_LIBRARY["inputs-" + j]) {
												if (j == "whistle-on") {
													ELEMENT_LIBRARY["inputs-" + j].checked = CONFIGURATION_LIBRARY.settings[j]
												}
												else {
													ELEMENT_LIBRARY["inputs-" + j].value = CONFIGURATION_LIBRARY.settings[j]
												}
											}
										}
									}

								// custom
									else {
										CONFIGURATION_LIBRARY[i] = storedConfigs[i]
									}
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

				// protect settings
					else if (event.key.toLowerCase().trim() == "settings") {
						return false
					}

				// update config
					else {
						CONFIGURATION_LIBRARY[event.key] = event.value
						window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						return true
					}
			}

		/* uploadConfiguration */
			ELEMENT_LIBRARY["inputs-configuration"].addEventListener("change", uploadConfiguration)
			FUNCTION_LIBRARY.uploadConfiguration = uploadConfiguration
			function uploadConfiguration(event) {
				if (ELEMENT_LIBRARY["inputs-configuration"].value && ELEMENT_LIBRARY["inputs-configuration"].value.length) {
					var reader = new FileReader()
					reader.readAsText(event.target.files[0])
					reader.onload = function(event) {
						// data
							var data = String(event.target.result)
							try {
								data = JSON.parse(data)
								for (var i in data) {
									changeConfiguration({key: i, value: data[i]})
								}
							} catch (error) { }
					}
				}
			}

		/* iterateState */
			FUNCTION_LIBRARY.iterateState = iterateState
			function iterateState(event) {
				// analyze audio
					FUNCTION_LIBRARY.analyzeAudio()

				// update timers
					FUNCTION_LIBRARY.checkAlarms()
			}

	/*** whistling ***/
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
						}, CONFIGURATION_LIBRARY.settings["voice-delay"])
				} catch (error) {}
			}

		/* initializeAudio */
			FUNCTION_LIBRARY.initializeAudio = initializeAudio
			function initializeAudio() {
				// audio context
					AUDIO_LIBRARY.audio = new window.AudioContext

				// analyzer
					AUDIO_LIBRARY.analyzer = AUDIO_LIBRARY.audio.createAnalyser()
					AUDIO_LIBRARY.analyzer.fftSize = CONFIGURATION_LIBRARY.settings["whistle-fftsize"]

				// input
					AUDIO_LIBRARY.input = {
						bufferLength: AUDIO_LIBRARY.analyzer.frequencyBinCount,
						pitches: [],
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
							AUDIO_LIBRARY.microphone = AUDIO_LIBRARY.audio.createMediaStreamSource(stream)
							AUDIO_LIBRARY.microphone.connect(AUDIO_LIBRARY.analyzer)
						})
					}
			}

		/* changeWhistleOn */
			ELEMENT_LIBRARY["inputs-whistle-on"].addEventListener("change", changeWhistleOn)
			FUNCTION_LIBRARY.changeWhistleOn = changeWhistleOn
			function changeWhistleOn(event) {
				try {
					// start / stop listening
						CONFIGURATION_LIBRARY.settings["whistle-on"] = ELEMENT_LIBRARY["inputs-whistle-on"].checked || false
						window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))

					// actually stop listening
						if (!CONFIGURATION_LIBRARY.settings["whistle-on"]) {
							FUNCTION_LIBRARY.stopRecognizing(false)
						}
				} catch (error) {}
			}

		/* analyzeAudio */
			FUNCTION_LIBRARY.analyzeAudio = analyzeAudio
			function analyzeAudio(event) {
				if (AUDIO_LIBRARY.audio && CONFIGURATION_LIBRARY.settings["whistle-on"] && !RECOGNITION_LIBRARY.active) {
					// refresh data
						AUDIO_LIBRARY.input.lastFrequencyCounter += CONFIGURATION_LIBRARY.settings["state-interval"]
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
						var frequency 	= AUDIO_LIBRARY.audio.sampleRate / FUNCTION_LIBRARY.getAverage(AUDIO_LIBRARY.input.wavelengths) / complexity

					// if within range and enough energy
						if (complexity == 1 // simple waves are whistles
							&& CONFIGURATION_LIBRARY.settings["whistle-frequency-minimum"] <= frequency && frequency <= CONFIGURATION_LIBRARY.settings["whistle-frequency-maximum"] // frequency within whistle range
							&& AUDIO_LIBRARY.input.minimum <= -CONFIGURATION_LIBRARY.settings["whistle-energy-threshold"] && CONFIGURATION_LIBRARY.settings["whistle-energy-threshold"] <= AUDIO_LIBRARY.input.maximum) { // energy spikes above/below thresholds
							// convert frequency to quantized pitch
								var pitch = Math.round(69 + 12 * Math.log2(frequency / 440))
						}
						else {
							var pitch = null
						}

					// update pitches array
						AUDIO_LIBRARY.input.pitches.push(pitch)
						var pitchCount = 1000 / CONFIGURATION_LIBRARY.settings["state-interval"] // store 1 second of pitches
						while (AUDIO_LIBRARY.input.pitches.length > pitchCount) {
							AUDIO_LIBRARY.input.pitches.shift()
						}

					// get difference
						if (pitch) {
							var biggest = -1000 // arbitrarily small
							var smallest = 1000 // arbitrarily big
							for (var i in AUDIO_LIBRARY.input.pitches) {
								if (!AUDIO_LIBRARY.input.pitches[i]) {}
								else {
									if (AUDIO_LIBRARY.input.pitches[i] > biggest) {
										biggest = AUDIO_LIBRARY.input.pitches[i]
									}
									if (AUDIO_LIBRARY.input.pitches[i] < smallest) {
										smallest = AUDIO_LIBRARY.input.pitches[i]
									}
								}
							}
							var difference = Math.abs(biggest - smallest)

							if (CONFIGURATION_LIBRARY.settings["whistle-interval-minimum"] <= difference && difference <= CONFIGURATION_LIBRARY.settings["whistle-interval-maximum"]) { // minor 2nd to perfect 4th
								FUNCTION_LIBRARY.startRecognizing({chirp: true})
							}
						}
				}
			}

	/*** recognition ***/
		/* initializeRecognition */
			FUNCTION_LIBRARY.initializeRecognition = initializeRecognition
			function initializeRecognition() {
				// statuses
					RECOGNITION_LIBRARY.active = false
					RECOGNITION_LIBRARY.time = 0
					RECOGNITION_LIBRARY.wait = null
					RECOGNITION_LIBRARY.countdown = null

				// create speech recognition
					RECOGNITION_LIBRARY.recognition = new window.speechRecognition()
					RECOGNITION_LIBRARY.recognition.onsoundend = stopRecognizing
					RECOGNITION_LIBRARY.recognition.onresult = matchPhrase
			}

		/* changeRecognitionDuration */
			ELEMENT_LIBRARY["inputs-recognition-duration"].addEventListener("change", changeRecognitionDuration)
			FUNCTION_LIBRARY.changeRecognitionDuration = changeRecognitionDuration
			function changeRecognitionDuration(event) {
				// set duration
					CONFIGURATION_LIBRARY.settings["recognition-duration"] = Math.max(0, Math.min(60, Number(ELEMENT_LIBRARY["inputs-recognition-duration"].value)))
					window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
			}

		/* changeRecognizing */
			ELEMENT_LIBRARY["inputs-audio"].addEventListener(ON.click, changeRecognizing)
			FUNCTION_LIBRARY.changeRecognizing = changeRecognizing
			function changeRecognizing(event) {
				// manual stop (don't transcribe)
					if (RECOGNITION_LIBRARY.active) {
						FUNCTION_LIBRARY.stopRecognizing(false)
					}

				// manual start
					else {
						FUNCTION_LIBRARY.startRecognizing({chirp: false})
					}
			}

		/* startRecognizing */
			FUNCTION_LIBRARY.startRecognizing = startRecognizing
			function startRecognizing(event) {
				if (!RECOGNITION_LIBRARY.active) {
					// disable input
						ELEMENT_LIBRARY["inputs-text"].setAttribute("disabled", true)

					// clear whistle history
						AUDIO_LIBRARY.input.lastFrequency = 0
						AUDIO_LIBRARY.input.lastFrequencyCounter = 0

					// synthesizer
						VOICE_LIBRARY.synthesizer.pause()
						VOICE_LIBRARY.synthesizer.cancel()

					// chirp
						var chirpDelay = 0
						if (event && event.chirp && SOUND_LIBRARY.chirp) {
							try {
								SOUND_LIBRARY.chirp.pause()
								SOUND_LIBRARY.chirp.currentTime = 0
								SOUND_LIBRARY.chirp.play()
								var chirpDelay = SOUND_LIBRARY.chirpDuration
							} catch (error) {}
						}
					
					// set global
						RECOGNITION_LIBRARY.active = true

					// set countdown failsafe
						RECOGNITION_LIBRARY.wait = setTimeout(function() {
							try {
								RECOGNITION_LIBRARY.recognition.start()
							} catch (error) {}

							RECOGNITION_LIBRARY.time = 0
							RECOGNITION_LIBRARY.countdown = setInterval(FUNCTION_LIBRARY.countdownRecognizing, CONFIGURATION_LIBRARY.settings["recognition-interval"])
						}, chirpDelay)
				}
			}

		/* countdownRecognizing */
			FUNCTION_LIBRARY.countdownRecognizing = countdownRecognizing
			function countdownRecognizing(event) {
				// add to time
					RECOGNITION_LIBRARY.time += CONFIGURATION_LIBRARY.settings["recognition-interval"]

				// update bar width
					ELEMENT_LIBRARY["inputs-countdown"].style.width = (CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000 - RECOGNITION_LIBRARY.time) / (CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000) * 100 + "%"

				// stop when duration is reached
					if (RECOGNITION_LIBRARY.time >= CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000) {
						FUNCTION_LIBRARY.stopRecognizing(true)
					}
			}

		/* stopRecognizing */
			FUNCTION_LIBRARY.stopRecognizing = stopRecognizing
			function stopRecognizing(continuable) {
				// cancel countdown
					clearInterval(RECOGNITION_LIBRARY.wait)
					clearInterval(RECOGNITION_LIBRARY.countdown)

				// unset global
					RECOGNITION_LIBRARY.active = false

				// button & text bar
					ELEMENT_LIBRARY["inputs-countdown"].style.width = "0%"
					ELEMENT_LIBRARY["inputs-text"].removeAttribute("disabled")
					ELEMENT_LIBRARY["inputs-text"].focus()

				// continue
					if (continuable) {
						RECOGNITION_LIBRARY.recognition.stop()
					}

				// abort
					else {
						RECOGNITION_LIBRARY.recognition.stop()
						RECOGNITION_LIBRARY.recognition.abort()
					}
			}

	/*** phrases ***/
		/* submitPhrase */
			ELEMENT_LIBRARY["inputs-form"].addEventListener("submit", submitPhrase)
			FUNCTION_LIBRARY.submitPhrase = submitPhrase
			function submitPhrase(event) {
				// get text
					var phrase = ELEMENT_LIBRARY["inputs-text"].value || ""

				// clear text / bar
					ELEMENT_LIBRARY["inputs-text"].value = ""
					ELEMENT_LIBRARY["inputs-countdown"].style.width = "0%"

				// submit to match
					FUNCTION_LIBRARY.matchPhrase({
						inputType: "written",
						results: [[{transcript: phrase}]]
					})
			}

		/* matchPhrase */
			FUNCTION_LIBRARY.matchPhrase = matchPhrase
			function matchPhrase(event) {
				// cancel countdown
					clearInterval(RECOGNITION_LIBRARY.countdown)

				// get phrase
					if (!event || !event.results || !event.results[0] || !event.results[0][0] || !event.results[0][0].transcript) {
						return false
					}
					else {
						var phrase = event.results[0][0].transcript
					}

				// followup
					var followup = (event.inputType == "written") ? false : true

				// match phrase to stop command
					if (ERROR_LIBRARY["stop-phrases"].includes(phrase.trim())) {
						var action = "stop"
						var remainder = []
						    followup = false
					}

				// match phrase to stop-listening command
					else if (ERROR_LIBRARY["stop-listening-phrases"].includes(phrase.trim())) {
						var action = "stop listening"
						var remainder = []
						    followup = false
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
					FUNCTION_LIBRARY.enactPhrase(phrase, action, (remainder.join(" ") || ""), followup)
			}

		/* enactPhrase */
			FUNCTION_LIBRARY.enactPhrase = enactPhrase
			function enactPhrase(phrase, action, remainder, followup) {
				// stop phrase
					if (action == "stop") {
						// end flow
							var previousFlow = CONTEXT_LIBRARY.flow
							CONTEXT_LIBRARY.flow = null
							if (previousFlow) {
								delete CONTEXT_LIBRARY[previousFlow]
							}
						
						// stop speaking
							VOICE_LIBRARY.synthesizer.pause()
							VOICE_LIBRARY.synthesizer.cancel()

						createHistory(phrase || "stop", action, {icon: "&#x1f507;", message: "", html: previousFlow ? ("ended flow: " + previousFlow) : "stop", followup: false})
					}

				// stop-listening phrase
					else if (action == "stop listening") {
						// stop speaking
							VOICE_LIBRARY.synthesizer.pause()
							VOICE_LIBRARY.synthesizer.cancel()

						// turn off whistle-on
							CONFIGURATION_LIBRARY.settings["whistle-on"] = ELEMENT_LIBRARY["inputs-whistle-on"].checked = false
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
							FUNCTION_LIBRARY.stopRecognizing(false)

						createHistory(phrase || "stop listening", action, {icon: "&#x1f507;", message: "", html: "whistle detection turned off", followup: false})
					}

				// no action
					else if (!action || !ACTION_LIBRARY[action]) {
						action = ERROR_LIBRARY["noaction"]
						var message = ERROR_LIBRARY["noaction-responses"][ERROR_LIBRARY["noaction-index"]]

						ERROR_LIBRARY["noaction-index"] = (ERROR_LIBRARY["noaction-index"] == ERROR_LIBRARY["noaction-responses"].length - 1) ? 0 : (ERROR_LIBRARY["noaction-index"] + 1)
						var response = {icon: "&#x2753;", message: message, html: message, followup: followup}
						createHistory(phrase, action, response)
					}

				// phrase & action
					else {
						ACTION_LIBRARY[action](remainder, function(response) {
							// no response
								if (typeof response === undefined || response === null) {
									var message = ERROR_LIBRARY["error-responses"][ERROR_LIBRARY["error-index"]]
									ERROR_LIBRARY["error-index"] = (ERROR_LIBRARY["error-index"] == ERROR_LIBRARY["error-responses"].length - 1) ? 0 : (ERROR_LIBRARY["error-index"] + 1)
									var response = {message: message, html: message, followup: followup}
								}

							// followup?
								if (followup === false) {
									response.followup = false
								}
								else if (response.followup === false) {
									response.followup = false
								}
								else {
									response.followup = true
								}

							// history
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
						phraseBlock.innerText = phrase || ""
					historyBlock.appendChild(phraseBlock)

					var actionBlock = document.createElement("div")
						actionBlock.className = "stream-history-action"
					historyBlock.appendChild(actionBlock)

						var actionIconBlock = document.createElement("div")
							actionIconBlock.className = "stream-history-action-icon"
							actionIconBlock.innerHTML = response.icon || ""
						actionBlock.appendChild(actionIconBlock)

						var actionNameBlock = document.createElement("div")
							actionNameBlock.className = "stream-history-action-name"
							actionNameBlock.innerText = action || ""
						actionBlock.appendChild(actionNameBlock)

						var actionTimeBlock = document.createElement("div")
							actionTimeBlock.className = "stream-history-action-time"
							actionTimeBlock.innerText = new Date().toLocaleTimeString()
						actionBlock.appendChild(actionTimeBlock)

					var responseBlock = document.createElement("div")
						responseBlock.className = "stream-history-response"
						responseBlock.innerHTML = response.html || ""
					historyBlock.appendChild(responseBlock)

				// prepend to stream
					ELEMENT_LIBRARY["stream"].prepend(historyBlock)

				// speak
					if (response.message) {
						FUNCTION_LIBRARY.voiceResponse(response)
					}

				// followup
					else if (response.followup) {
						FUNCTION_LIBRARY.startRecognizing()
					}
			}

		/* checkAlarms */
			FUNCTION_LIBRARY.checkAlarms = checkAlarms
			function checkAlarms() {
				// current time
					var timeNow = new Date().getTime()

				// loop through timers to check (and send a message)
					for (var i = 0; i < CONTEXT_LIBRARY.alarms.length; i++) {
						if (CONTEXT_LIBRARY.alarms[i] <= timeNow) {
							createHistory("-", "time's up", {icon: "&#x23F0;", message: "This is your alarm for " + new Date(CONTEXT_LIBRARY.alarms[i]).toLocaleTimeString(), html: "The time is now <b>" + new Date(CONTEXT_LIBRARY.alarms[i]).toLocaleString() + "</b>.", followup: false})
							CONTEXT_LIBRARY.alarms.splice(i, 1)
							i--
						}
					}
			}

	/*** voices ***/
		/* initializeVoices */
			FUNCTION_LIBRARY.initializeVoices = initializeVoices
			function initializeVoices() {
				// create synthesizer
					VOICE_LIBRARY.synthesizer = window.speechSynthesis

				// clear options
					ELEMENT_LIBRARY["inputs-voice"].innerHTML = ""

				// default (no voice)
					var option = document.createElement("option")
						option.innerText = "no voice"
						option.value = null
					ELEMENT_LIBRARY["inputs-voice"].appendChild(option)

				// get all voices
					VOICE_LIBRARY.voices = VOICE_LIBRARY.voices || {}
					var voiceList = VOICE_LIBRARY.synthesizer.getVoices()
					for (var i in voiceList) {
						VOICE_LIBRARY.voices[voiceList[i].name.toLowerCase().trim()] = voiceList[i]
					}

				// loop through voices
					for (var i in VOICE_LIBRARY.voices) {
						var option = document.createElement("option")
							option.innerText = i
							option.value = i
						ELEMENT_LIBRARY["inputs-voice"].appendChild(option)
					}

				// select first voice
					if (voiceList.length) {
						ELEMENT_LIBRARY["inputs-voice"].value = voiceList[0].name.toLowerCase().trim()
						CONFIGURATION_LIBRARY.settings["voice"] =voiceList[0].name.toLowerCase().trim()
					}
			}

		/* changeVoice */
			ELEMENT_LIBRARY["inputs-voice"].addEventListener("change", changeVoice)
			FUNCTION_LIBRARY.changeVoice = changeVoice
			function changeVoice(event) {
				// via select
					if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-voice"].id && VOICE_LIBRARY.voices[ELEMENT_LIBRARY["inputs-voice"].value.toLowerCase()]) {
						// set voice from library
							CONFIGURATION_LIBRARY.settings["voice"] = ELEMENT_LIBRARY["inputs-voice"].value.toLowerCase()
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
					}

				// via action
					else if (event.name) {
						// if voice exists
							if (VOICE_LIBRARY.voices[event.name]) {
								CONFIGURATION_LIBRARY.settings["voice"] = event.name
								window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
								ELEMENT_LIBRARY["inputs-voice"].value = event.name
								return true
							}

						// otherwise
							else {
								return false
							}
					}
			}

		/* changeVoiceVolume */
			ELEMENT_LIBRARY["inputs-voice-volume"].addEventListener("change", changeVoiceVolume)
			FUNCTION_LIBRARY.changeVoiceVolume = changeVoiceVolume
			function changeVoiceVolume(event) {
				// via input
					if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-voice-volume"].id) {
						// set volume
							CONFIGURATION_LIBRARY.settings["voice-volume"] = Math.max(0, Math.min(100, Number(ELEMENT_LIBRARY["inputs-voice-volume"].value)))
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
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
								ELEMENT_LIBRARY["inputs-voice-volume"].value = newVolume
								CONFIGURATION_LIBRARY.settings["voice-volume"] = newVolume
								window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
								return true
							}
					}
			}

		/* voiceResponse */
			FUNCTION_LIBRARY.voiceResponse = voiceResponse
			function voiceResponse(response) {
				setTimeout(function() {
					// remove previous utterances queued up
						VOICE_LIBRARY.synthesizer.cancel()

					// speak the transcript
						if (CONFIGURATION_LIBRARY.settings["voice"] && VOICE_LIBRARY.voices[CONFIGURATION_LIBRARY.settings["voice"]]) {
							var utterance = new SpeechSynthesisUtterance(response.message)
								utterance.voice = VOICE_LIBRARY.voices[CONFIGURATION_LIBRARY.settings["voice"]]
								utterance.volume = Math.max(0, Math.min(1, CONFIGURATION_LIBRARY.settings["voice-volume"] / 100))
								if (response.followup) {
									utterance.onend = FUNCTION_LIBRARY.startRecognizing
								}
							VOICE_LIBRARY.synthesizer.speak(utterance)
						}
				}, CONFIGURATION_LIBRARY.settings["voice-delay"])
			}

	/*** communication in/out ***/
		/* sendPost */
			FUNCTION_LIBRARY.sendPost = sendPost
			function sendPost(options, callback) {
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

		/* proxyRequest */
			FUNCTION_LIBRARY.proxyRequest = proxyRequest
			function proxyRequest(options, callback) {
				// set action for server
					options.action = "proxyRequest"

				// set timeout
					var timeout = setTimeout(function() {
						FUNCTION_LIBRARY.createHistory("...", "API request", {icon: "&#x231b;", message: "I'm fetching that now.", html: "querying the API...", followup: false})
					}, CONFIGURATION_LIBRARY.settings["fetch-interval"])

				// create request object and send to server, then clear timeout on response
					sendPost(options, function(response) {
						if (timeout) { clearInterval(timeout) }
						callback(response)
					})
			}

		/* fetchPeriodically */
			FUNCTION_LIBRARY.fetchPeriodically = fetchPeriodically
			function fetchPeriodically(action, key, callback) {
				// set escape counter
					var abandonCounter = CONFIGURATION_LIBRARY.settings["fetch-abandon"]

				// create loop
					var fetchLoop = setInterval(function() {
						if (abandonCounter) {
							abandonCounter--
							// request data from server
								FUNCTION_LIBRARY.sendPost({action: action, key: key}, function(data) {
									if (data.success && data.data) {
										clearInterval(fetchLoop)
										callback(data.data)
									}
								})
						}
						else {
							clearInterval(fetchLoop)
						}
					}, CONFIGURATION_LIBRARY.settings["fetch-interval"])
			}
})
