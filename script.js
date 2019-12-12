window.addEventListener("load", function() {
	/*** globals ***/
		/* browser prefixes */
			window.speechRecognition = window.webkitSpeechRecognition || window.speechRecognition
			window.speechSynthesis   = window.webkitSpeechSynthesis   || window.speechSynthesis

		/* triggers */
			if ((/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent)) {
				var on = { click: "touchstart", mousedown: "touchstart", mousemove: "touchmove", mouseup: "touchend" }
			}
			else {
				var on = { click:      "click", mousedown:  "mousedown", mousemove: "mousemove", mouseup:  "mouseup" }
			}

		/* constants */
			var INTERVAL = 50
			var DELAY = 1000
			var VOICES = {}

		/* libraries */
			var PHRASE_LIBRARY = window.PHRASE_LIBRARY || {}
			var ACTION_LIBRARY = window.ACTION_LIBRARY || {}

		/* error responses */
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
			var VOICE = null
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
		/* listVoices  */
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
						VOICES[voiceList[i].name] = voiceList[i]
					}

				// loop through voices
					for (var i in VOICES) {
						var option = document.createElement("option")
							option.innerText = i
							option.value = i
						INPUTS_VOICES.appendChild(option)
					}

				// select first voice
					if (voiceList.length) {
						INPUTS_VOICES.value = voiceList[0].name
						VOICE = VOICES[voiceList[0].name]
					}
			}

		/* changeVoice */
			INPUTS_VOICES.addEventListener("change", changeVoice)
			function changeVoice(event) {
				// select voice from voices object
					VOICE = VOICES[INPUTS_VOICES.value] || null
			}

		/* changeVolume */
			INPUTS_VOLUME.addEventListener("change", changeVolume)
			function changeVolume(event) {
				// set volume
					VOLUME = Math.max(0, Math.min(100, Number(INPUTS_VOLUME.value))) / 100
			}

		/* changeDuration */
			INPUTS_DURATION.addEventListener("change", changeDuration)
			function changeDuration(event) {
				// set duration
					DURATION = Math.max(0, Math.min(60, Number(INPUTS_DURATION.value))) * 1000
			}

	/*** audio input ***/
		/* toggleListening */
			INPUTS_AUDIO.addEventListener(on.click, toggleListening)
			function toggleListening(event) {
				// manual stop (don't transcribe)
					if (LISTENING) {
						stopListening(false)
					}

				// manual start
					else {
						RECOGNITION.start()
					}
			}

		/* startListening */
			function startListening(event) {
				// set global
					LISTENING = true

				// set countdown failsafe
					TIME = 0
					COUNTDOWN = setInterval(countdownListening, INTERVAL)
			}

		/* countdownListening */
			function countdownListening(event) {
				// add to time
					TIME += INTERVAL

				// update bar width
					INPUTS_COUNTDOWN.style.width = (DURATION - TIME) / DURATION * 100 + "%"

				// stop when duration is reached
					if (TIME >= DURATION) {
						stopListening(true)
					}
			}

		/* stopListening */
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
						matchPhrase()
					}
			}

	/*** phrases ***/
		/* submitPhrase */
			INPUTS_FORM.addEventListener("submit", submitPhrase)
			function submitPhrase(event) {
				// get text
					var phrase = INPUTS_TEXT.value || ""

				// clear text
					INPUTS_TEXT.value = ""

				// submit to match
					matchPhrase({
						results: [[{transcript: phrase}]]
					})
			}

		/* matchPhrase */
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

				// match phrase to an action in the library
					var phraseText = phrase.toLowerCase().replace(/[?!.,:;'"]/gi,"").split(/\s/gi)
					var remainder = []
					
					do {
						var action = PHRASE_LIBRARY[phraseText.join(" ")] || null
						
						if (!action) {
							remainder.unshift(phraseText.pop())
						}
					} while (!action && phraseText.length)

				// createHistory
					createHistory(phrase, action, {
						remainder: remainder.join(" ") || ""
					})
			}

	/*** stream output ***/
		/* createHistory */
			function createHistory(phrase, action, options) {
				// structure
					var historyBlock = document.createElement("div")
						historyBlock.className = "stream-history"

					var phraseBlock = document.createElement("div")
						phraseBlock.className = "stream-history-phrase"
					historyBlock.appendChild(phraseBlock)

					var actionBlock = document.createElement("div")
						actionBlock.className = "stream-history-action"
					historyBlock.appendChild(actionBlock)

					var responseBlock = document.createElement("div")
						responseBlock.className = "stream-history-response"
					historyBlock.appendChild(responseBlock)

				// no phrase
					if (!phrase) {
						var response = NOPHRASE_RESPONSES[NOPHRASE_INDEX]
						NOPHRASE_INDEX = (NOPHRASE_INDEX == NOPHRASE_RESPONSES.length - 1) ? 0 : (NOPHRASE_INDEX + 1)

						phraseBlock.innerText = NOPHRASE
						actionBlock.innerText = NOACTION
						responseBlock.innerText = response
					}

				// phrase, but no action
					else if (!action) {
						var response = NOACTION_RESPONSES[NOACTION_INDEX]
						NOACTION_INDEX = (NOACTION_INDEX == NOACTION_RESPONSES.length - 1) ? 0 : (NOACTION_INDEX + 1)

						phraseBlock.innerText = phrase
						actionBlock.innerText = NOACTION
						responseBlock.innerText = response
					}

				// phrase & action
					else {
						var response = ACTION_LIBRARY[action](options.remainder)
						if (!response) {
							var response = ERROR_RESPONSES[ERROR_INDEX]
							ERROR_INDEX = (ERROR_INDEX == ERROR_RESPONSES.length - 1) ? 0 : (ERROR_INDEX + 1)
						}

						phraseBlock.innerText = phrase
						actionBlock.innerText = action
						responseBlock.innerText = response
					}

				// prepend to stream
					STREAM.prepend(historyBlock)

				// speak
					speakResponse(response)
			}

	/*** audio output ***/
		/* speakResponse */
			function speakResponse(response) {
				setTimeout(function() {
					// remove previous utterances queued up
						SYNTHESIZER.cancel()

					// speak the transcript
						if (VOICE) {
							var utterance = new SpeechSynthesisUtterance(response)
								utterance.voice = VOICE
								utterance.volume = VOLUME
							SYNTHESIZER.speak(utterance)
						}
				}, DELAY)
			}

})