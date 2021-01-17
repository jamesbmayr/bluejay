window.addEventListener("load", function() {
	/*** globals ***/
		/* browser prefixes */
			window.speechRecognition 	= window.webkitSpeechRecognition || window.speechRecognition
			window.speechSynthesis   	= window.webkitSpeechSynthesis   || window.speechSynthesis
			window.AudioContext			= window.webkitAudioContext      || window.AudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext

		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				var MOBILE = true
				var ON = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
			}
			else {
				var MOBILE = false
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
				lastInteractionTime: new Date().getTime(),
				lastPhrase: null,
				lastAction: null,
				lastRemainder: null,
				lastResponseIcon: null,
				lastResponseMessage: null,
				lastResponseHTML: null,
				lastResponseNumber: null,
				lastResponseTime: null,
				lastResponseWord: null,
				lastResponseURL: null,
				lastResponseVideo: null,
				lastResults: [],
				flow: null,
				alarms: [],
				startListening: null,
				loop: null,
				overrideFollowup: false
			}

		/* error library */
			var ERROR_LIBRARY = window.ERROR_LIBRARY = {
				"stop-phrases": ["quit this game", "quit this", "quit", "abort this", "abort", "stop this", "stop", "stop talking", "stop speaking", "please stop", "shut up", "never mind", "nevermind", "forget it", "forget that"],
				"noaction-responses": ["I'm not sure I follow.", "I don't understand.", "What does that mean?", "I don't know that one.", "I don't get it.", "I'm sorry, can you try that again?", "Can you repeat that?", "Please say that again.", "Wait, what was your question?", "I'll need you to repeat that.", "What am I supposed to do?"],
				"error-responses": ["Something went wrong.", "I couldn't do that.", "Let's try that again later.", "Sorry, I have failed you.", "I'm not sure what happened.", "I ran into an error.", "That's an error.", "That didn't go the way I expected.", "Sorry, I couldn't complete that action.", "I blame the developers for this failure."],
			}

		/* configurations */
			var CONFIGURATION_LIBRARY = window.CONFIGURATION_LIBRARY = {
				settings: {
					"bluejay-id": null,
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
					"screen-brightness": 100,
					"fetch-interval": 3000,
					"fetch-abandon": 120,
					"dim-time": 1000 * 60 * 2
				}
			}

		/* element library */
			var ELEMENT_LIBRARY = window.ELEMENT_LIBRARY = {
				"body": 						document.body,
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
				"inputs-screen-brightness": 	document.getElementById("inputs-screen-brightness"),

				"stream": 						document.getElementById("stream"),

				"translucency": 				document.getElementById("translucency")
			}

		/* number word library */
			var NUMBER_WORD_LIBRARY = window.NUMBER_WORD_LIBRARY = {
				"zero": 		0,
				"quadrillionth": (1 / 1000000000000000),
				"quadrillionths": (1 / 1000000000000000),
				"trillionth": 	(1 / 1000000000000),
				"trillionths": 	(1 / 1000000000000),
				"billionth": 	(1 / 1000000000),
				"billionths": 	(1 / 1000000000),
				"millionth": 	(1 / 1000000),
				"millionths": 	(1 / 1000000),
				"thousandth": 	(1 / 1000),
				"thousandths": 	(1 / 1000),
				"hundredth": 	(1 / 100),
				"hundredths": 	(1 / 100),
				"ninetieth": 	(1 / 90),
				"ninetieths": 	(1 / 90),
				"eightieth": 	(1 / 80),
				"eightieths": 	(1 / 80),
				"seventieth": 	(1 / 70),
				"seventieths": 	(1 / 70),
				"sixtieth": 	(1 / 60),
				"sixtieths": 	(1 / 60),
				"fiftieth": 	(1 / 50),
				"fiftieths": 	(1 / 50),
				"fortieth": 	(1 / 40),
				"fortieths": 	(1 / 40),
				"fourtieth": 	(1 / 40),
				"fourtieths": 	(1 / 40),
				"thirtieth": 	(1 / 30),
				"thirtieths": 	(1 / 30),
				"twentieth": 	(1 / 20),
				"twentieths": 	(1 / 20),
				"nineteenth": 	(1 / 19),
				"nineteenths": 	(1 / 19),
				"eighteenth": 	(1 / 18),
				"eighteenths": 	(1 / 18),
				"seventeenth": 	(1 / 17),
				"seventeenths": (1 / 17),
				"sixteenth": 	(1 / 16),
				"sixteenths": 	(1 / 16),
				"fifteenth": 	(1 / 15),
				"fifteenths": 	(1 / 15),
				"fourteenth": 	(1 / 14),
				"fourteenths": 	(1 / 14),
				"thirteenth": 	(1 / 13),
				"thirteenths": 	(1 / 13),
				"twelfth": 		(1 / 12),
				"twelfths": 	(1 / 12),
				"eleventh": 	(1 / 11),
				"elevenths": 	(1 / 11),
				"tenth": 		(1 / 10),
				"tenths": 		(1 / 10),
				"ninth": 		(1 / 9),
				"ninths": 		(1 / 9),
				"eighth": 		(1 / 8),
				"eighths": 		(1 / 8),
				"seventh": 		(1 / 7),
				"sevenths": 	(1 / 7),
				"sixth": 		(1 / 6),
				"sixths": 		(1 / 6),
				"fifth": 		(1 / 5),
				"fifths": 		(1 / 5),
				"fourth": 		(1 / 4),
				"fourths": 		(1 / 4),
				"quarter": 		(1 / 4),
				"quarters": 	(1 / 4),
				"third": 		(1 / 3),
				"thirds": 		(1 / 3),
				"half": 		(1 / 2),
				"halfs": 		(1 / 2),
				"halves": 		(1 / 2),
				"a": 			1,
				"an": 			1,
				"one": 			1,
				"two": 			2,
				"three": 		3,
				"four": 		4,
				"five": 		5,
				"six": 			6,
				"seven": 		7,
				"eight": 		8,
				"nine": 		9,
				"ten": 			10,
				"eleven": 		11,
				"twelve": 		12,
				"thirteen": 	13,
				"fourteen": 	14,
				"fifteen": 		15,
				"sixteen": 		16,
				"seventeen": 	17,
				"eighteen": 	18,
				"nineteen": 	19,
				"twenty": 		20,
				"thirty": 		30,
				"forty": 		40,
				"fourty": 		40,
				"fifty": 		50,
				"sixty": 		60,
				"seventy": 		70,
				"eighty": 		80,
				"ninety": 		90,
				"hundred": 		100,
				"thousand": 	1000,
				"million": 		1000000,
				"billion": 		1000000000,
				"trillion": 	1000000000000,
				"quadrillion": 	1000000000000000
			}

		/* letter word library */
			var LETTER_WORD_LIBRARY = window.LETTER_WORD_LIBRARY = {
				"eh": 		"a",
				"hey": 		"a",
				"bee": 		"b",
				"sea": 		"c",
				"see": 		"c",
				"dee": 		"d",
				"he": 		"e",
				"app": 		"f",
				"gee": 		"g",
				"chi": 		"g",
				"each": 	"h",
				"eye": 		"i",
				"hi": 		"i",
				"jay": 		"j",
				"kay": 		"k",
				"hell": 	"l",
				"al": 		"l",
				"elf": 		"l",
				"um": 		"m",
				"an": 		"n",
				"and": 		"n",
				"end": 		"n",
				"ann": 		"n",
				"anne": 	"n",
				"oh": 		"o",
				"owe": 		"o",
				"pea": 		"p",
				"pee": 		"p",
				"cue": 		"q",
				"queue": 	"q",
				"are": 		"r",
				"our": 		"r",
				"as": 		"s",
				"ask": 		"s",
				"tea": 		"t",
				"tee": 		"t",
				"ewe": 		"u",
				"you": 		"u",
				"via": 		"v",
				"vis": 		"v",
				"viz": 		"v",
				"double": 	"w",
				"ax": 		"x",
				"axe": 		"x",
				"ex": 		"x",
				"why": 		"y",
				"while": 	"y",
				"the": 		"z",
				"zed": 		"z"
			}

	/*** application ***/
		/* initializeApplication */
			ELEMENT_LIBRARY["overlay-button"].addEventListener("click", initializeApplication)
			FUNCTION_LIBRARY.initializeApplication = initializeApplication
			function initializeApplication(event) {
				try {
					if (!INITIALIZED) {
						// audio
							AUDIO_LIBRARY.audio = new window.AudioContext()

						// hide overlay
							INITIALIZED = true
							ELEMENT_LIBRARY["overlay"].setAttribute("invisible", true)

						// interaction
							FUNCTION_LIBRARY.setLastInteraction()

						// full screen
							ELEMENT_LIBRARY.body.requestFullscreen()

						// preload errors
							ERROR_LIBRARY["noaction-index"] = Math.floor(Math.random() * ERROR_LIBRARY["noaction-responses"].length)
							ERROR_LIBRARY["error-index"]    = Math.floor(Math.random() * ERROR_LIBRARY["error-responses"].length)

						// configuration
							initializeConfiguration()

						// audio
							initializeAudio()	

						// preload sounds
							initializeSounds()

						// recognition
							initializeRecognition()

						// synthesizer
							initializeVoices()

						// loop
							CONTEXT_LIBRARY.loop = setInterval(iterateState, CONFIGURATION_LIBRARY["state-interval"])
					}
				} catch (error) {}
			}

		/* setLastInteraction */
			ELEMENT_LIBRARY["body"].addEventListener(ON.click, setLastInteraction)
			ELEMENT_LIBRARY["inputs-text"].addEventListener("input", setLastInteraction)
			FUNCTION_LIBRARY.setLastInteraction = setLastInteraction
			function setLastInteraction(event) {
				try {
					// not initialized?
						if (!INITIALIZED) {
							return
						}

					// remember when last we interacted
						CONTEXT_LIBRARY.lastInteractionTime = new Date().getTime()

					// current brightness
						var currentBrightness = (1 - Number(ELEMENT_LIBRARY["translucency"].style.opacity)) * 100

					// if dimmed by user
						if (!currentBrightness && CONFIGURATION_LIBRARY.settings["screen-brightness"] < 10) {
							FUNCTION_LIBRARY.setBrightness(10)
							return
						}

					// if dimmed from inactivity
						if (currentBrightness < CONFIGURATION_LIBRARY.settings["screen-brightness"]) {
							FUNCTION_LIBRARY.setBrightness(CONFIGURATION_LIBRARY.settings["screen-brightness"])
						}
				} catch (error) {}
			}

		/* getAverage */
			FUNCTION_LIBRARY.getAverage = getAverage
			function getAverage(arr) {
				try {
					// not an array
						if (!Array.isArray(arr)) {
							return null
						}

					// add items & divide by count
						var sum = 0
						for (var i = 0; i < arr.length; i++) {
							sum += arr[i]
						}
						return (sum / arr.length)
				} catch (error) {
					return null
				}
			}

		/* getDigits */
			FUNCTION_LIBRARY.getDigits = getDigits
			function getDigits(numberWord) {
				try {
					// already is a digit
						if (!isNaN(numberWord)) {
							return numberWord
						}

					// run through number word library
						numberWord = numberWord.toLowerCase().trim()
						if (!isNaN(NUMBER_WORD_LIBRARY[numberWord])) {
							return NUMBER_WORD_LIBRARY[numberWord]
						}

					// return original
						return numberWord
				}
				catch (error) {
					return numberWord
				}
			}

		/* getLetters */
			FUNCTION_LIBRARY.getLetters = getLetters
			function getLetters(letterWord) {
				try {
					// clean up
						letterWord = letterWord.toLowerCase().trim()

					// already is a letter
						if ((/^[a-z]{1}$/).test(letterWord)) {
							return letterWord
						}

					// run through letter word library
						else if (LETTER_WORD_LIBRARY[letterWord]) {
							return LETTER_WORD_LIBRARY[letterWord]
						}

					// return original
						return letterWord
				}
				catch (error) {
					return letterWord
				}
			}

		/* getDateTime */
			FUNCTION_LIBRARY.getDateTime = getDateTime
			function getDateTime(timePhrase, past) {
				try {
					// clean up
						timePhrase = timePhrase.toLowerCase().trim()

					// word
						if (timePhrase == "yesterday") {
							return new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
						}
						else if (timePhrase == "today") {
							return new Date()
						}
						else if (timePhrase == "tomorrow") {
							return new Date(new Date().getTime() + 1000 * 60 * 60 * 24)
						}
						else if (timePhrase == "now") {
							return new Date()
						}

					// time
						else if (timePhrase == "noon" || timePhrase == "midnight" || timePhrase.includes(":") || timePhrase.replace(/\./gi, "").includes("am") || timePhrase.replace(/\./gi, "").includes("pm") || timePhrase.replace(/\'/gi, "").includes("oclock")) {
							// fix AM / PM and hours without minutes
								var time = timePhrase.replace(/\s?p\.?\s?m\.?/gi, " PM").replace(/\s?a\.?\s?m\.?/gi, " AM").replace(/o\'clock/gi, "").replace("noon", "12:00 PM").replace("midnight", "12:00 AM")
									time = time.split(/\s+/gi)
									time = (time[0].replace(/[^0-9:]/gi, "") || "12") + ":00 " + (time[1] || "")

							// get ms
								var date = new Date(time).getTime() || new Date(new Date().toDateString() + " " + time).getTime()
							
							// force past?
								if (past) {
									if (new Date().getTime() < date) {
										// 12 hours back
											if (!time.includes("PM") && !time.includes("AM") && new Date().getTime() > date - (1000 * 60 * 60 * 12)) {
												date = date - (1000 * 60 * 60 * 12)
											}

										// in the past & am/pm specified? 24 hours ahead
											else if (new Date().getTime() > date - (1000 * 60 * 60 * 24)) {
												date = date - (1000 * 60 * 60 * 24)
											}
									}
								}

							// force future
								else {
									if (new Date().getTime() > date) {
										// 12 hours ahead
											if (!time.includes("PM") && !time.includes("AM") && new Date().getTime() < date + (1000 * 60 * 60 * 12)) {
												date = date + (1000 * 60 * 60 * 12)
											}

										// in the past & am/pm specified? 24 hours ahead
											else if (new Date().getTime() < date + (1000 * 60 * 60 * 24)) {
												date = date + (1000 * 60 * 60 * 24)
											}
									}
								}

							return new Date(date)
						}

					// date
						else {
							// split at spaces
								var date = timePhrase.split(/ ?\/ ?|\s/gi)

							// month
								if (isNaN(date[0])) {
									date[0] = ["january","february","march","april","may","june","july","august","september","october","november","december"].indexOf(date[0]) + 1
								}

							// day (ordinal --> cardinal)
								date[1] = date[1].replace(/[^0-9]/gi, "")
							
							// year or no year?
								if (date.length !== 2) {
									date = date.join("/")
								}
								else {
									var attempt = date.join("/") + "/" + new Date().getFullYear()

									if (new Date(attempt) < new Date()) {
										date = date.join("/") + "/" + (new Date().getFullYear() + 1)
									}
									else {
										date = attempt
									}
								}
							
							return new Date(date)
						}
				}
				catch (error) {
					return timePhrase
				}
			}

		/* generateRandom */
			FUNCTION_LIBRARY.generateRandom = generateRandom
			function generateRandom(set, length) {
				try {
					// parameters
						set = set || "0123456789abcdefghijklmnopqrstuvwxyz"
						length = length || 32
					
					// loop to build
						var output = ""
						for (var i = 0; i < length; i++) {
							output += (set[Math.floor(Math.random() * set.length)])
						}

					// start with letter
						if ((/[a-zA-Z]/).test(set)) {
							while (!(/[a-zA-Z]/).test(output[0])) {
								output = (set[Math.floor(Math.random() * set.length)]) + output.substring(1)
							}
						}

					// return
						return output
				}
				catch (error) {
					return null
				}
			}

		/* chooseRandom */
			FUNCTION_LIBRARY.chooseRandom = chooseRandom
			function chooseRandom(options) {
				try {
					// not array --> return
						if (!Array.isArray(options)) {
							return options
						}
					
					// pick a random array element
						return options[Math.floor(Math.random() * options.length)]
				}
				catch (error) {
					return options
				}
			}

		/* sortRandom */
			FUNCTION_LIBRARY.sortRandom = sortRandom
			function sortRandom(array) {
				try {
					// not array --> return
						if (!Array.isArray(array)) {
							return array
						}

					// copy
						var output = JSON.parse(JSON.stringify(array))

					// shuffle
						var x = output.length
						while (x > 0) {
							var y = Math.floor(Math.random() * x)
							x = x - 1
							var temp = output[x]
							output[x] = output[y]
							output[y] = temp
						}

					// return
						return output
				}
				catch (error) {
					return array
				}
			}

	/*** settings ***/
		/* initializeConfiguration */
			FUNCTION_LIBRARY.initializeConfiguration = initializeConfiguration
			function initializeConfiguration() {
				try {
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

								// create bluejay-id
									if (!CONFIGURATION_LIBRARY.settings["bluejay-id"]) {
										CONFIGURATION_LIBRARY.settings["bluejay-id"] = generateRandom()
										window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
									}
							}
							catch (error) {}
						}

					// set brightness
						FUNCTION_LIBRARY.setBrightness()
				} catch (error) {}
			}

		/* changeConfiguration */
			FUNCTION_LIBRARY.changeConfiguration = changeConfiguration
			function changeConfiguration(event) {
				try {
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
				} catch (error) {}
			}

		/* uploadConfiguration */
			ELEMENT_LIBRARY["inputs-configuration"].addEventListener("change", uploadConfiguration)
			FUNCTION_LIBRARY.uploadConfiguration = uploadConfiguration
			function uploadConfiguration(event) {
				try {
					// interact
						FUNCTION_LIBRARY.setLastInteraction()

					// if file
						if (ELEMENT_LIBRARY["inputs-configuration"].value && ELEMENT_LIBRARY["inputs-configuration"].value.length) {
							// read
								var reader = new FileReader()
								reader.readAsText(event.target.files[0])

							// then parse data
								reader.onload = function(event) {
									// data
										var data = String(event.target.result)
										try {
											// get data & loop through to set configs
												data = JSON.parse(data)
												for (var i in data) {
													changeConfiguration({key: i, value: data[i]})
												}

											// interact
												FUNCTION_LIBRARY.setLastInteraction()
										} catch (error) {}
								}
						}
				} catch (error) {}
			}

		/* changeBrightness */
			ELEMENT_LIBRARY["inputs-screen-brightness"].addEventListener("change", changeBrightness)
			FUNCTION_LIBRARY.changeBrightness = changeBrightness
			function changeBrightness(event) {
				try {
					// via input
						if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-screen-brightness"].id) {
							// interact
								FUNCTION_LIBRARY.setLastInteraction()

							// set brightness
								CONFIGURATION_LIBRARY.settings["screen-brightness"] = Math.max(0, Math.min(100, Number(ELEMENT_LIBRARY["inputs-screen-brightness"].value)))
								window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
								FUNCTION_LIBRARY.setBrightness()
						}

					// via action
						else if (event.brightness !== undefined) {
							// if not a number
								if (isNaN(Number(event.brightness))) {
									return false
								}

							// otherwise
								else {
									var newBrightness = Math.round(Math.max(0, Math.min(100, Number(event.brightness))))
									ELEMENT_LIBRARY["inputs-screen-brightness"].value = newBrightness
									CONFIGURATION_LIBRARY.settings["screen-brightness"] = newBrightness
									window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
									FUNCTION_LIBRARY.setBrightness()
									return newBrightness
								}
						}

					// otherwise
						else {
							return false
						}
				} catch (error) {}
			}

		/* setBrightness */
			FUNCTION_LIBRARY.setBrightness = setBrightness
			function setBrightness(amount) {
				try {
					// from touch / inactivity
						if (amount !== undefined && amount !== null) {
							ELEMENT_LIBRARY["translucency"].style.opacity = Math.max(0, Math.min(1, (100 - amount) / 100))
							return
						}

					// from command / settings change
						ELEMENT_LIBRARY["translucency"].style.opacity = Math.max(0, Math.min(1, 1 - (CONFIGURATION_LIBRARY.settings["screen-brightness"] / 100)))
				} catch (error) {}
			}

		/* iterateState */
			FUNCTION_LIBRARY.iterateState = iterateState
			function iterateState(event) {
				try {
					// analyze audio
						FUNCTION_LIBRARY.analyzeAudio()

					// check if we should restart listening
						FUNCTION_LIBRARY.checkStartListening()

					// update timers
						FUNCTION_LIBRARY.checkAlarms()

					// check if inactive
						if (new Date().getTime() > CONTEXT_LIBRARY.lastInteractionTime + CONFIGURATION_LIBRARY.settings["dim-time"]) {
							FUNCTION_LIBRARY.setBrightness(MOBILE ? 0 : 10)
						}
				} catch (error) {}
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
							SOUND_LIBRARY.chirpDuration = audio.duration * 1000 + 500
						}, CONFIGURATION_LIBRARY.settings["voice-delay"])
				} catch (error) {}
			}

		/* initializeAudio */
			FUNCTION_LIBRARY.initializeAudio = initializeAudio
			function initializeAudio() {
				try {
					// audio exists?
						if (!AUDIO_LIBRARY.audio) {
							AUDIO_LIBRARY.audio = new window.AudioContext()
						}

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
							FUNCTION_LIBRARY.changeWhistleListen(true)
						}
				} catch (error) {}
			}

		/* changeWhistleOn */
			ELEMENT_LIBRARY["inputs-whistle-on"].addEventListener("change", changeWhistleOn)
			FUNCTION_LIBRARY.changeWhistleOn = changeWhistleOn
			function changeWhistleOn(event) {
				try {
					// stop-listening command
						if (event.forceOff) {
							CONFIGURATION_LIBRARY.settings["whistle-on"] = ELEMENT_LIBRARY["inputs-whistle-on"].checked = false
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						}

					// stop-listening timeout expires
						if (event.forceOn) {
							CONFIGURATION_LIBRARY.settings["whistle-on"] = ELEMENT_LIBRARY["inputs-whistle-on"].checked = true
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						}

					// toggle checkbox
						else {
							FUNCTION_LIBRARY.setLastInteraction()

							CONFIGURATION_LIBRARY.settings["whistle-on"] = ELEMENT_LIBRARY["inputs-whistle-on"].checked || false
							window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))

							window.CONTEXT_LIBRARY.startListening = null
						}

					// actually start listening for whistles (if not currently listening for words)
						if (!event.forceOn && CONFIGURATION_LIBRARY.settings["whistle-on"] && !RECOGNITION_LIBRARY.active) {
							FUNCTION_LIBRARY.changeWhistleListen(true)
							return
						}

					// actually stop listening for whistles
						if (!CONFIGURATION_LIBRARY.settings["whistle-on"]) {
							FUNCTION_LIBRARY.changeWhistleListen(false)
						}
				} catch (error) {}
			}

		/* changeWhistleListen */
			FUNCTION_LIBRARY.changeWhistleListen = changeWhistleListen
			function changeWhistleListen(activate) {
				try {
					//  no audio
						if (!AUDIO_LIBRARY.audio) {
							return false
						}

					// activate
						if (activate && CONFIGURATION_LIBRARY.settings["whistle-on"] && !AUDIO_LIBRARY.microphone) {
							navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
								// remove microphone connection if it exists
									if (AUDIO_LIBRARY.microphone) {
										changeWhistleListen(false)
									}

								// create new microphone connection & connect to analyzer
									AUDIO_LIBRARY.microphone = AUDIO_LIBRARY.audio.createMediaStreamSource(stream)
									AUDIO_LIBRARY.microphone.connect(AUDIO_LIBRARY.analyzer)
							})
							return
						}

					// deactivate
						if (AUDIO_LIBRARY.microphone) {
							// remove tracks (streams)
								AUDIO_LIBRARY.microphone.mediaStream.getTracks().forEach(function(track) {
									track.enabled = false
									track.stop()
								})

							// disconnect from analyzer
								AUDIO_LIBRARY.microphone.disconnect()

							// delete in a bunch of ways just in case
								delete AUDIO_LIBRARY.microphone.mediaStream
								delete AUDIO_LIBRARY.microphone
								AUDIO_LIBRARY.microphone = null
						}
				} catch (error) {}
			}

		/* analyzeAudio */
			FUNCTION_LIBRARY.analyzeAudio = analyzeAudio
			function analyzeAudio(event) {
				try {
					if (AUDIO_LIBRARY.audio && AUDIO_LIBRARY.microphone && CONFIGURATION_LIBRARY.settings["whistle-on"] && !RECOGNITION_LIBRARY.active) {
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
									FUNCTION_LIBRARY.setLastInteraction()
									CONTEXT_LIBRARY.overrideFollowup = false
									FUNCTION_LIBRARY.startRecognizing({chirp: true})
								}
							}
					}
				} catch (error) {}
			}

	/*** recognition ***/
		/* initializeRecognition */
			FUNCTION_LIBRARY.initializeRecognition = initializeRecognition
			function initializeRecognition() {
				try {
					// statuses
						RECOGNITION_LIBRARY.active = false
						RECOGNITION_LIBRARY.time = 0
						RECOGNITION_LIBRARY.wait = null
						RECOGNITION_LIBRARY.countdown = null

					// create speech recognition
						RECOGNITION_LIBRARY.recognition = new window.speechRecognition()
						RECOGNITION_LIBRARY.recognition.onsoundend = stopRecognizing
						RECOGNITION_LIBRARY.recognition.onnomatch = matchPhrase
						RECOGNITION_LIBRARY.recognition.onresult = matchPhrase
				} catch (error) {}
			}

		/* changeRecognitionDuration */
			ELEMENT_LIBRARY["inputs-recognition-duration"].addEventListener("change", changeRecognitionDuration)
			FUNCTION_LIBRARY.changeRecognitionDuration = changeRecognitionDuration
			function changeRecognitionDuration(event) {
				try {
					// via input
						if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-recognition-duration"].id) {
							// interact
								FUNCTION_LIBRARY.setLastInteraction()

							// set duration
								CONFIGURATION_LIBRARY.settings["recognition-duration"] = Math.max(1, Math.min(60, Number(ELEMENT_LIBRARY["inputs-recognition-duration"].value)))
								window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						}

					// via action
						else if (event.duration !== undefined) {
							// if not a number
								if (isNaN(Number(event.duration))) {
									return false
								}

							// otherwise
								else {
									var newDuration = Math.round(Math.max(1, Math.min(60, Number(event.duration))))
									ELEMENT_LIBRARY["inputs-recognition-duration"].value = newDuration
									CONFIGURATION_LIBRARY.settings["recognition-duration"] = newDuration
									window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
									return newDuration
								}
						}

					// otherwise
						else {
							return false
						}
				} catch (error) {}
			}

		/* changeRecognizing */
			ELEMENT_LIBRARY["inputs-audio"].addEventListener(ON.click, changeRecognizing, {passive: true})
			FUNCTION_LIBRARY.changeRecognizing = changeRecognizing
			function changeRecognizing(event) {
				try {
					// interact
						FUNCTION_LIBRARY.setLastInteraction()

					// manual stop (don't transcribe)
						if (RECOGNITION_LIBRARY.active) {
							FUNCTION_LIBRARY.stopRecognizing(false)
						}

					// manual start
						else {
							FUNCTION_LIBRARY.startRecognizing({chirp: false})
						}
				} catch (error) {}
			}

		/* startRecognizing */
			FUNCTION_LIBRARY.startRecognizing = startRecognizing
			function startRecognizing(event) {
				try {
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

						// close microphone
							if (AUDIO_LIBRARY.microphone) {
								FUNCTION_LIBRARY.changeWhistleListen(false)
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
				} catch (error) {}
			}

		/* countdownRecognizing */
			FUNCTION_LIBRARY.countdownRecognizing = countdownRecognizing
			function countdownRecognizing(event) {
				try {
					// add to time
						RECOGNITION_LIBRARY.time += CONFIGURATION_LIBRARY.settings["recognition-interval"]

					// update bar width
						ELEMENT_LIBRARY["inputs-countdown"].style.width = (CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000 - RECOGNITION_LIBRARY.time) / (CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000) * 100 + "%"

					// stop when duration is reached
						if (RECOGNITION_LIBRARY.time >= CONFIGURATION_LIBRARY.settings["recognition-duration"] * 1000) {
							FUNCTION_LIBRARY.stopRecognizing(true)
						}
				} catch (error) {}
			}

		/* stopRecognizing */
			FUNCTION_LIBRARY.stopRecognizing = stopRecognizing
			function stopRecognizing(continuable) {
				try {
					// cancel countdown
						clearInterval(RECOGNITION_LIBRARY.wait)
						clearInterval(RECOGNITION_LIBRARY.countdown)

					// unset global
						RECOGNITION_LIBRARY.active = false

					// button & text bar
						ELEMENT_LIBRARY["inputs-countdown"].style.width = "0%"
						ELEMENT_LIBRARY["inputs-text"].removeAttribute("disabled")

					// continuable ? stop --> matching
						if (continuable) {
							RECOGNITION_LIBRARY.recognition.stop()
						}

					// not continuable ? abort --> no matching --> listen for whistles
						else {
							RECOGNITION_LIBRARY.recognition.abort()
							FUNCTION_LIBRARY.changeWhistleListen(true)
						}
				} catch (error) {}
			}

	/*** phrases ***/
		/* submitPhrase */
			ELEMENT_LIBRARY["inputs-form"].addEventListener("submit", submitPhrase)
			FUNCTION_LIBRARY.submitPhrase = submitPhrase
			function submitPhrase(event) {
				try {
					// interact
						FUNCTION_LIBRARY.setLastInteraction()

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
				} catch (error) {}
			}

		/* matchPhrase */
			FUNCTION_LIBRARY.matchPhrase = matchPhrase
			function matchPhrase(event) {
				try {
					// interact
						if (event && event.type == "result") {
							FUNCTION_LIBRARY.setLastInteraction()
						}

					// cancel countdown
						clearInterval(RECOGNITION_LIBRARY.countdown)

					// no detected phrases --> stop as not continuable (--> abort --> listen for whistles)
						if (!event || !event.results || !event.results[0] || !event.results[0][0] || !event.results[0][0].transcript) {
							FUNCTION_LIBRARY.stopRecognizing(false)
							return false
						}
					
					// get phrase
						var phrase = event.results[0][0].transcript

					// followup
						var followup = (event.inputType == "written") ? false : true					

					// match phrase to stop command
						if (ERROR_LIBRARY["stop-phrases"].includes(phrase.trim())) {
							var action = "stop"
							var remainder = []
							    followup = false
						}

					// last word is cancel --> listen for whistles
						else if (phrase.toLowerCase().includes("cancel") && phrase.toLowerCase().trim().lastIndexOf("cancel") == phrase.trim().length - 6) {
							FUNCTION_LIBRARY.changeWhistleListen(true)
							return false
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
								var action = PHRASE_LIBRARY[phraseText.join(" ").toLowerCase().replace(/[?!.,:;'"\-_\/\(\)\$\%]/gi,"")] || null
								
								if (!action) {
									remainder.unshift(phraseText.pop())
								}
							} while ((!action || !ACTION_LIBRARY[action]) && phraseText.length)

							// no action, but lastIncompleteAction
								if ((!action || !ACTION_LIBRARY[action]) && CONTEXT_LIBRARY.lastIncompleteAction && ACTION_LIBRARY[CONTEXT_LIBRARY.lastIncompleteAction]) {
									action = CONTEXT_LIBRARY.lastIncompleteAction
								}
						}

					// enact phrase
						FUNCTION_LIBRARY.enactPhrase(phrase, action, (remainder.join(" ") || ""), followup)
				} catch (error) {}
			}

		/* enactPhrase */
			FUNCTION_LIBRARY.enactPhrase = enactPhrase
			function enactPhrase(phrase, action, remainder, followup) {
				try {
					// stop phrase
						if (action == "stop") {
							// end flow
								var previousFlow = CONTEXT_LIBRARY.flow
								CONTEXT_LIBRARY.flow = null
								if (previousFlow) {
									delete CONTEXT_LIBRARY[previousFlow]
								}

							// end lastIncompleteAction
								CONTEXT_LIBRARY.lastIncompleteAction = null

							// end videos
								if (CONTEXT_LIBRARY.lastResponseVideo) {
									stopVideo(CONTEXT_LIBRARY.lastResponseVideo)
								}
							
							// stop speaking
								VOICE_LIBRARY.synthesizer.pause()
								VOICE_LIBRARY.synthesizer.cancel()

							createHistory(phrase || "stop", action, "", {icon: "&#x1f6ab;", auto: true, message: "", html: previousFlow ? ("ended flow: " + previousFlow) : "stop", followup: false})
						}

					// no action
						else if (!action || !ACTION_LIBRARY[action]) {
							var message = ERROR_LIBRARY["noaction-responses"][ERROR_LIBRARY["noaction-index"]]

							ERROR_LIBRARY["noaction-index"] = (ERROR_LIBRARY["noaction-index"] == ERROR_LIBRARY["noaction-responses"].length - 1) ? 0 : (ERROR_LIBRARY["noaction-index"] + 1)
							createHistory(phrase, "no action", "", {icon: "&#x1f6a9;", error: true, message: message, html: message, followup: followup})
						}

					// phrase & action
						else {
							ACTION_LIBRARY[action](remainder, function(response) {
								// no response
									if (typeof response === undefined || response === null) {
										var message = ERROR_LIBRARY["error-responses"][ERROR_LIBRARY["error-index"]]
										ERROR_LIBRARY["error-index"] = (ERROR_LIBRARY["error-index"] == ERROR_LIBRARY["error-responses"].length - 1) ? 0 : (ERROR_LIBRARY["error-index"] + 1)
										var response = {icon: "&#x1f6a9;", error: true, message: message, html: message, followup: followup}
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
									createHistory(phrase, action, remainder, response)
							})
						}
				} catch (error) {}
			}

	/*** stream output ***/
		/* createHistory */
			FUNCTION_LIBRARY.createHistory = createHistory
			function createHistory(phrase, action, remainder, response) {
				try {
					// context
						CONTEXT_LIBRARY.lastResponseIcon = response.icon
						CONTEXT_LIBRARY.lastResponseMessage = response.message
						CONTEXT_LIBRARY.lastResponseHTML = response.html

						if (response.error) {
							CONTEXT_LIBRARY.lastIncompleteAction = action
						}
						else {
							CONTEXT_LIBRARY.lastIncompleteAction = null
						}

						if (!["no action", "stop", "repeat that", "do that again", "get next result"].includes(action)) {
							CONTEXT_LIBRARY.lastPhrase = phrase
							CONTEXT_LIBRARY.lastAction = action
							CONTEXT_LIBRARY.lastRemainder = remainder
						}

						if (response.number) {
							CONTEXT_LIBRARY.lastResponseNumber = response.number
						}
						if (response.time) {
							CONTEXT_LIBRARY.lastResponseTime = response.time
						}
						if (response.word) {
							CONTEXT_LIBRARY.lastResponseWord = response.word
						}
						if (response.url) {
							CONTEXT_LIBRARY.lastResponseURL = response.url
						}
						if (response.video) {
							CONTEXT_LIBRARY.lastResponseVideo = response.video
						}
						if (response.results) {
							CONTEXT_LIBRARY.lastResults = response.results
						}
						
					// visuals
						var historyBlock = document.createElement("div")
							historyBlock.className = "stream-history" + (response.error ? " stream-history-error" : "") + (response.auto ? " stream-history-auto" : "")

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

					// followup?
						if (!response.message && response.followup) {
							FUNCTION_LIBRARY.startRecognizing()
						}

					// speak
						else {
							// reactivate microphone
								FUNCTION_LIBRARY.changeWhistleListen(true)

							// speak
								if (response.message) {
									FUNCTION_LIBRARY.voiceResponse(response)
								}
						}
				} catch (error) {}
			}

		/* stopVideo */
			FUNCTION_LIBRARY.stopVideo = stopVideo
			function stopVideo(id) {
				try {
					// find element
						var video = document.getElementById(id)

					// no video
						if (!video) {
							return false
						}

					// youtube iframe --> reload without autoplay
						if (video.tagName.toLowerCase() == "iframe" && video.src.includes("youtube")) {
							video.src = video.src.replace("autoplay=1","autoplay=0")
							return true
						}
				} catch (error) {}
			}

		/* restartVideo */
			FUNCTION_LIBRARY.restartVideo = restartVideo
			function restartVideo(id) {
				try {
					// find element
						var video = document.getElementById(id)

					// no video
						if (!video) {
							return false
						}

					// youtube iframe --> reload with autoplay
						if (video.tagName.toLowerCase() == "iframe" && video.src.includes("youtube")) {
							video.src = video.src.includes("autoplay=1") ? video.src : video.src.includes("autoplay=0") ? video.src.replace("autoplay=0", "autoplay=1") : (video.src + "?autoplay=1")
						}
				} catch (error) {}
			}

		/* checkAlarms */
			FUNCTION_LIBRARY.checkAlarms = checkAlarms
			function checkAlarms() {
				try {
					// current time
						var timeNow = new Date().getTime()

					// loop through timers to check (and send a message)
						for (var i = 0; i < CONTEXT_LIBRARY.alarms.length; i++) {
							if (CONTEXT_LIBRARY.alarms[i] && CONTEXT_LIBRARY.alarms[i].time <= timeNow) {
								// if speaking, stop and don't follow up
									if (VOICE_LIBRARY.synthesizer.speaking) {
										CONTEXT_LIBRARY.overrideFollowup = true
										VOICE_LIBRARY.synthesizer.pause()
									}

								// if recognizing, stop
									if (RECOGNITION_LIBRARY.active) {
										FUNCTION_LIBRARY.stopRecognizing(false)
									}

								// clear alarm
									var time = new Date(CONTEXT_LIBRARY.alarms[i].time).toLocaleString()
									var action = CONTEXT_LIBRARY.alarms[i].action
									CONTEXT_LIBRARY.alarms[i] = null

								// action
									if (action) {
										FUNCTION_LIBRARY.matchPhrase({
											inputType: "result",
											results: [[{transcript: action}]]
										})
									}

								// alarm message
									else {
										createHistory("...", "alarm", "", {icon: "&#x23f0;", auto: true, message: "This is your alarm for " + time, html: "<h2>alarm #" + (i + 1) + ": <b>" + time + "</b></h2>", followup: false, auto: true})
									}
							}
						}
				} catch (error) {}
			}

		/* checkStartListening */
			FUNCTION_LIBRARY.checkStartListening = checkStartListening
			function checkStartListening() {
				try {
					// current time
						var timeNow = new Date().getTime()

					// check if startListening is set and in the past
						if (CONTEXT_LIBRARY.startListening && CONTEXT_LIBRARY.startListening <= timeNow) {
							FUNCTION_LIBRARY.changeWhistleOn({forceOn: true})
							createHistory("...", "start listening", "", {icon: "&#x1f50a;", auto: true, message: "", html: "<h2>whistle detection turned on at <b>" + new Date(CONTEXT_LIBRARY.startListening).toLocaleString() + "</b></h2>", followup: false})
							CONTEXT_LIBRARY.startListening = null
						}
				} catch (error) {}
			}

	/*** voices ***/
		/* initializeVoices */
			FUNCTION_LIBRARY.initializeVoices = initializeVoices
			function initializeVoices() {
				try {
					// clear options
						ELEMENT_LIBRARY["inputs-voice"].innerHTML = ""

					// default (no voice)
						var option = document.createElement("option")
							option.innerText = "no voice"
							option.value = null
						ELEMENT_LIBRARY["inputs-voice"].appendChild(option)

					// create synthesizer
						VOICE_LIBRARY.voices = {}
						VOICE_LIBRARY.synthesizer = window.speechSynthesis
						VOICE_LIBRARY.synthesizer.onvoiceschanged = loadVoices

					// load voices
						if (!VOICE_LIBRARY.voices || !Object.keys(VOICE_LIBRARY.voices).length) {
							loadVoices() // force voices to load
						}
				} catch (error) {}
			}

		/* loadVoices */
			FUNCTION_LIBRARY.loadVoices = loadVoices
			function loadVoices(event) {
				try {
					// get voices
						var voiceList = window.speechSynthesis.getVoices() || {}
						if (!voiceList || !voiceList.length) {
							return false
						}

					// save voices
						for (var i in voiceList) {
							VOICE_LIBRARY.voices[voiceList[i].name.toLowerCase().trim()] = voiceList[i]
						}

					// loop through voices to create options
						for (var i in VOICE_LIBRARY.voices) {
							var option = document.createElement("option")
								option.innerText = i
								option.value = i
							ELEMENT_LIBRARY["inputs-voice"].appendChild(option)
						}

					// select voice from configuration
						if (CONFIGURATION_LIBRARY.settings["voice"] && VOICE_LIBRARY.voices[CONFIGURATION_LIBRARY.settings["voice"]]) {
							ELEMENT_LIBRARY["inputs-voice"].value = CONFIGURATION_LIBRARY.settings["voice"]
						}

					// or else select first voice
						else if (voiceList.length) {
							ELEMENT_LIBRARY["inputs-voice"].value = voiceList[0].name.toLowerCase().trim()
							CONFIGURATION_LIBRARY.settings["voice"] = voiceList[0].name.toLowerCase().trim()
						}
				} catch (error) {}
			}

		/* changeVoice */
			ELEMENT_LIBRARY["inputs-voice"].addEventListener("change", changeVoice)
			FUNCTION_LIBRARY.changeVoice = changeVoice
			function changeVoice(event) {
				try {
					// via select
						if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-voice"].id) {
							// interact
								FUNCTION_LIBRARY.setLastInteraction()

							// set voice from library
								if (VOICE_LIBRARY.voices[ELEMENT_LIBRARY["inputs-voice"].value.toLowerCase()]) {
									CONFIGURATION_LIBRARY.settings["voice"] = ELEMENT_LIBRARY["inputs-voice"].value.toLowerCase()
									window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
								}
						}

					// via action
						else if (event.name) {
							// if voice exists
								if (VOICE_LIBRARY.voices[event.name]) {
									CONFIGURATION_LIBRARY.settings["voice"] = event.name
									window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
									ELEMENT_LIBRARY["inputs-voice"].value = event.name
									return event.name
								}

							// otherwise
								else {
									return false
								}
						}
				} catch (error) {}
			}

		/* changeVoiceVolume */
			ELEMENT_LIBRARY["inputs-voice-volume"].addEventListener("change", changeVoiceVolume)
			FUNCTION_LIBRARY.changeVoiceVolume = changeVoiceVolume
			function changeVoiceVolume(event) {
				try {
					// via input
						if (event.target && event.target.id == ELEMENT_LIBRARY["inputs-voice-volume"].id) {
							// interact
								FUNCTION_LIBRARY.setLastInteraction()

							// set volume
								CONFIGURATION_LIBRARY.settings["voice-volume"] = Math.max(0, Math.min(100, Number(ELEMENT_LIBRARY["inputs-voice-volume"].value)))
								window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))
						}

					// via action
						else if (event.volume !== undefined) {
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
									return newVolume
								}
						}

					// otherwise
						else {
							return false
						}
				} catch (error) {}
			}

		/* voiceResponse */
			FUNCTION_LIBRARY.voiceResponse = voiceResponse
			function voiceResponse(response) {
				try {
					setTimeout(function() {
						// remove previous utterances queued up
							VOICE_LIBRARY.synthesizer.cancel()

						// speak the transcript
							if (CONFIGURATION_LIBRARY.settings["voice"] && VOICE_LIBRARY.voices[CONFIGURATION_LIBRARY.settings["voice"]]) {
								// language
									if (response.language) {
										var voiceName = Object.keys(VOICE_LIBRARY.voices).find(function(key) {
											return VOICE_LIBRARY.voices[key].lang == response.language || VOICE_LIBRARY.voices[key].lang.split("-")[0] == response.language
										}) || null
									}

								// utterance (add filler for mobile due to inconsistent speech start / audio start)
									var utterance = new SpeechSynthesisUtterance((MOBILE ? "bluejay message: " : "") + response.message)
										utterance.voice = VOICE_LIBRARY.voices[voiceName || CONFIGURATION_LIBRARY.settings["voice"]]
										utterance.volume = Math.max(0, Math.min(1, CONFIGURATION_LIBRARY.settings["voice-volume"] / 100))
									if (response.followup) {
										utterance.onend = function() {
											if (CONTEXT_LIBRARY.overrideFollowup) {
												CONTEXT_LIBRARY.overrideFollowup = false
											}
											else {
												FUNCTION_LIBRARY.startRecognizing()
											}
										}
									}

								// speak
									setTimeout(function() {
										VOICE_LIBRARY.synthesizer.speak(utterance)
									}, MOBILE ? 1000 : CONFIGURATION_LIBRARY.settings["voice-delay"])
							}
					}, CONFIGURATION_LIBRARY.settings["voice-delay"])
				} catch (error) {}
			}

	/*** communication in/out ***/
		/* sendPost */
			FUNCTION_LIBRARY.sendPost = sendPost
			function sendPost(options, callback) {
				try {
					// create request object and send to server
						var request = new XMLHttpRequest()
							request.open("POST", "sendPost", true)
							request.onload = function() {
								if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
									callback(JSON.parse(request.responseText) || {success: false, message: "unknown error"})
								}
								else {
									callback({success: false, readyState: request.readyState, message: request.status})
								}
							}
							request.send(JSON.stringify(options))
				} catch (error) {}
			}

		/* proxyRequest */
			FUNCTION_LIBRARY.proxyRequest = proxyRequest
			function proxyRequest(options, callback, silent) {
				try {
					// set action for server
						options.action = "proxyRequest"
						options["bluejay-id"] = CONFIGURATION_LIBRARY.settings["bluejay-id"]

					// set timeout
						if (!silent) {
							var timeout = setTimeout(function() {
								FUNCTION_LIBRARY.createHistory("...", "API request", "", {icon: "&#x231b;", auto: true, message: "I'm fetching that now.", html: "querying the API...", followup: false})
							}, CONFIGURATION_LIBRARY.settings["fetch-interval"])
						}

					// create request object and send to server, then clear timeout on response
						sendPost(options, function(response) {
							if (timeout) { clearInterval(timeout) }
							callback(response)
						})
				} catch (error) {}
			}
})
