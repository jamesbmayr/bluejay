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

		/* constants */
			var INTERVAL = 50
			var DELAY = 1000

		/* libraries */
			var VOICE_LIBRARY = {}
			var CONFIGURATION_LIBRARY = window.CONFIGURATION_LIBRARY = {}
			var FUNCTION_LIBRARY = window.FUNCTION_LIBRARY = {}
			var PHRASE_LIBRARY = window.PHRASE_LIBRARY || {}
			var ACTION_LIBRARY = window.ACTION_LIBRARY || {}
			var CONTEXT_LIBRARY = window.CONTEXT_LIBRARY = {
				lastPhrase: null,
				lastAction: null,
				lastResponseMessage: null,
				lastResponseHTML: null,
				flow: null
			}

		/* error responses */
			var STOP_PHRASES = ["quit this game", "quit this", "quit", "abort this", "stop this", "stop", "stop talking", "stop speaking", "shut up"]

			var NOPHRASE = "..."
			var NOPHRASE_RESPONSES = ["Sorry, I didn't catch that.", "I didn't hear you.", "Wait, what?", "Can you say that again?", "I swear I'm listening!"]
			var NOPHRASE_INDEX = Math.floor(Math.random() * NOPHRASE_RESPONSES.length)

			var NOACTION = "???"
			var NOACTION_RESPONSES = ["Not sure I follow.", "I don't understand.", "What does that mean?", "I don't know that one.", "No, I don't get it."]
			var NOACTION_INDEX = Math.floor(Math.random() * NOACTION_RESPONSES.length)

			var ERROR_RESPONSES = ["Something went wrong.", "I couldn't do that.", "Let's try that again later.", "Sorry, I have failed you.", "Not sure what happened."]
			var ERROR_INDEX = Math.floor(Math.random() * ERROR_RESPONSES.length)

		/* settings */
			var DURATION = 10000
			var VOICE = window.VOICE = null
			var VOLUME = 1

		/* statuses */
			var LISTENING = false
			var TIME = 0
			var COUNTDOWN = null
			
		/* elements */
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
				RECOGNITION.onstart = startListening
				RECOGNITION.onsoundend = stopListening
				RECOGNITION.onresult = matchPhrase

		/* synthesizer */
			var SYNTHESIZER = window.speechSynthesis
				SYNTHESIZER.onvoiceschanged = listVoices

	/*** settings ***/
		/* listVoices */
			FUNCTION_LIBRARY.listVoices = listVoices
			function listVoices() {
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
					else if (event.phrase) {
						// if voice exists
							if (VOICE_LIBRARY[event.phrase]) {
								VOICE = VOICE_LIBRARY[event.phrase]
								INPUTS_VOICES.value = event.phrase
								return {message: "Voice set to " + event.phrase, html: "voice: " + event.phrase}
							}

						// otherwise
							else {
								return {message: "I don't recognize that voice.", html: "voice not found: " + event.phrase}
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
							VOLUME = Math.max(0, Math.min(100, Number(INPUTS_VOLUME.value))) / 100
					}

				// via action
					else if (event.phrase) {
						// if not a number
							if (isNaN(Number(event.phrase))) {
								return {message: "That's not a valid number.", html: "invalid volume: " + event.phrase}
							}

						// otherwise
							else {
								var newVolume = Math.round(Math.max(0, Math.min(100, Number(event.phrase))))
								INPUTS_VOLUME.value = newVolume
								VOLUME = newVolume / 100
								return {message: "Volume set to " + newVolume, html: "volume: " + newVolume}
							}
					}

			}

		/* changeDuration */
			INPUTS_DURATION.addEventListener("change", changeDuration)
			FUNCTION_LIBRARY.changeDuration = changeDuration
			function changeDuration(event) {
				// set duration
					DURATION = Math.max(0, Math.min(60, Number(INPUTS_DURATION.value))) * 1000
			}

		/* initializeConfiguration */
			FUNCTION_LIBRARY.initializeConfiguration = initializeConfiguration
			initializeConfiguration()
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
						return {message: "I couldn't set that configuration.", html: "invalid or missing key and value"}
					}

				// update config
					else {
						CONFIGURATION_LIBRARY[event.key] = event.value
						window.localStorage.setItem("CONFIGURATION_LIBRARY", JSON.stringify(CONFIGURATION_LIBRARY))

						return {message: event.key + " is now " + event.value, html: event.key + " = " + event.value}
					}
			}

	/*** audio input ***/
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
						SYNTHESIZER.pause()
						SYNTHESIZER.cancel()
						RECOGNITION.start()
					}
			}

		/* startListening */
			FUNCTION_LIBRARY.startListening = startListening
			function startListening(event) {
				// set global
					LISTENING = true

				// set countdown failsafe
					TIME = 0
					COUNTDOWN = setInterval(countdownListening, INTERVAL)
			}

		/* countdownListening */
			FUNCTION_LIBRARY.countdownListening = countdownListening
			function countdownListening(event) {
				// add to time
					TIME += INTERVAL

				// update bar width
					INPUTS_COUNTDOWN.style.width = (DURATION - TIME) / DURATION * 100 + "%"

				// stop when duration is reached
					if (TIME >= DURATION) {
						FUNCTION_LIBRARY.stopListening(true)
					}
			}

		/* stopListening */
			FUNCTION_LIBRARY.stopListening = stopListening
			function stopListening(continuable) {
				// cancel countdown
					clearInterval(COUNTDOWN)

				// unset global
					LISTENING = false

				// button
					INPUTS_COUNTDOWN.style.width = "0%"

				// continue
					if (continuable) {
						RECOGNITION.stop()
					}

				// abort --> display "no results"
					else {
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

				// clear text
					INPUTS_TEXT.value = ""

				// submit to match
					FUNCTION_LIBRARY.matchPhrase({
						results: [[{transcript: phrase}]]
					})
			}

		/* matchPhrase */
			FUNCTION_LIBRARY.matchPhrase = matchPhrase
			function matchPhrase(event) {
				// cancel countdown
					clearInterval(COUNTDOWN)

				// get phrase
					if (!event || !event.results || !event.results[0] || !event.results[0][0] || !event.results[0][0].transcript) {
						var phrase = ""
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
						var previousFlow = CONTEXT_LIBRARY.flow
						CONTEXT_LIBRARY.flow = null
						if (previousFlow) {
							delete CONTEXT_LIBRARY[previousFlow]
						}
						
						SYNTHESIZER.pause()
						SYNTHESIZER.cancel()

						createHistory(phrase || "stop", action, {message: "", html: previousFlow ? ("ended flow: " + previousFlow) : "stop"})
					}

				// no phrase
					else if (!phrase) {
						phrase = NOPHRASE
						action = NOACTION
						var message = NOPHRASE_RESPONSES[NOPHRASE_INDEX]
						NOPHRASE_INDEX = (NOPHRASE_INDEX == NOPHRASE_RESPONSES.length - 1) ? 0 : (NOPHRASE_INDEX + 1)

						var response = {message: message, html: message}
						createHistory(phrase, action, response)
					}

				// phrase, but no action
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
					FUNCTION_LIBRARY.speakResponse(response.message)
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
								utterance.volume = VOLUME
							SYNTHESIZER.speak(utterance)
						}
				}, DELAY)
			}

	/*** back-end ***/
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