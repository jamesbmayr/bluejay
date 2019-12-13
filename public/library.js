/* phrase library */
	window.PHRASE_LIBRARY = {
		// settings
			"change voice to": 					"change voice",
			"change the voice to": 				"change voice",
			"set voice to": 					"change voice",
			"set the voice to": 				"change voice",
			"set new voice": 					"change voice",
			"switch voice to": 					"change voice",
			"switch the voice to": 				"change voice",

			"change volume to": 				"change volume",
			"change the volume to": 			"change volume",
			"set volume to": 					"change volume",
			"set the volume to": 				"change volume",
			"set new volume": 					"change volume",

		// meta
			"repeat after me": 					"repeat after me",
			"say what i say": 					"repeat after me",
			"say exactly what i say": 			"repeat after me",
			"say this back": 					"repeat after me",

		// time
			"what time is it": 					"what time is it",
			"what is the time": 				"what time is it",
			"whats the time": 					"what time is it",
			"tell me the time": 				"what time is it",

			"what day is it": 					"what day is it",
			"what day is today": 				"what day is it",
			"whats the day": 					"what day is it",
			"whats today": 						"what day is it",
			"tell me the day": 					"what day is it",

			"what month is it": 				"what month is it",
			"what is the month": 				"what month is it",
			"whats the month": 					"what month is it",
			"tell me the month": 				"what month is it",

			"what is the date": 				"what is the date",
			"what is todays date": 				"what is the date",
			"whats the date": 					"what is the date",
			"tell me the date": 				"what is the date",

		// rng
			"roll a d": 						"roll a die",
			"roll a die": 						"roll a die",
			"roll a": 							"roll a die",

			"flip a coin": 						"flip a coin",
			"heads or tails": 					"flip a coin",

		// math
			"calculate": 						"calculate",
			"add": 								"calculate",
			"subtract": 						"calculate",
			"multiply": 						"calculate",
			"divide": 							"calculate",
			
			"double": 							"double",
			"triple": 							"triple",

			"average": 							"average",
			"find the average of": 				"average",
			"what is the average of": 			"average",
			"whats the average of": 			"average",

		// word api fetches
			"what rhymes with": 				"find rhymes",
			"find a rhyme for": 				"find rhymes",
			"find rhymes for": 					"find rhymes",
			"get a rhyme for": 					"find rhymes",
			"get rhymes for": 					"find rhymes",
			"rhymes with": 						"find rhymes",
			"something that rhymes with": 		"find rhymes",

			"what is a synonym for": 			"find synonyms",
			"find a synonym for": 				"find synonyms",
			"find synonyms for": 				"find synonyms",
			"get a synonym for": 				"find synonyms",
			"get synonyms for": 				"find synonyms",
			"synonym of": 						"find synonyms",
			"what has the same meaning as": 	"find synonyms",

			"define": 							"define",
			"define the word": 					"define",
			"look up the word": 				"define",
			"provide a definition for": 		"define",
			"what is the meaning of": 			"define",
			"whats the meaning of": 			"define",

		// content api fetches
			"tell me a joke": 					"tell a joke",
			"know any jokes": 					"tell a joke",
			"say something funny": 				"tell a joke",
			"be funny": 						"tell a joke",
			"i could use a joke": 				"tell a joke",
			"tell a joke": 						"tell a joke",

			"give me a quote": 					"get a quote",
			"get a quote": 						"get a quote",
			"random quote": 					"get a quote",
			"famous quote": 					"get a quote",

			"get the headlines": 				"get the headlines",
			"get todays headlines": 			"get the headlines",
			"whats happening in the world": 	"get the headlines",
			"what is happening in the world": 	"get the headlines",
			"get the top stories": 				"get the headlines",
			"get me the news": 					"get the headlines",
			"give me the news": 				"get the headlines",
			"fetch the news": 					"get the headlines",
			"what is the news": 				"get the headlines",
			"whats the news": 					"get the headlines",
			"whats the latest news": 			"get the headlines",
			"what is the latest news": 			"get the headlines",
			"whats happening in the news": 		"get the headlines",
			"what is happening in the news": 	"get the headlines",
	}

/* action library */
	window.ACTION_LIBRARY = {
		// settings
			"change voice": function(remainder, callback) {
				try {
					var name = remainder.toLowerCase().trim()
					callback(window.FUNCTION_LIBRARY.changeVoice({phrase: name}))
				} catch (error) {}
			},
			"change volume": function(remainder, callback) {
				try {
					var volume = remainder.trim()
					callback(window.FUNCTION_LIBRARY.changeVolume({phrase: volume}))
				} catch (error) {}
			},

		// meta
			"repeat after me": function(remainder, callback) {
				try {
					callback(remainder)
				} catch (error) {}
			},

		// time
			"what time is it": function(remainder, callback) {
				try {
					callback((new Date().toLocaleTimeString()))
				} catch (error) {}
			},
			"what day is it": function(remainder, callback) {
				try {
					callback((["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()]))
				} catch (error) {}
			},
			"what month is it": function(remainder, callback) {
				try {
					callback((["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()]))
				} catch (error) {}
			},
			"what is the date": function(remainder, callback) {
				try {
					callback((["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()] + " " + new Date().getDate()))
				} catch (error) {}
			},

		// rng
			"roll a die": function(remainder, callback) {
				try {
					var sides = Number(remainder.replace(/d/gi,""))
					callback(Math.floor(Math.random() * sides) + 1)
				} catch (error) {}
			},
			"flip a coin": function(remainder, callback) {
				try {
					callback(["heads","tails"][Math.floor(Math.random() * 2)])
				} catch (error) {}
			},
		
		// math
			"calculate": function(remainder, callback) {
				try {
					// loop through and identify terms
						var terms = remainder.split(/\s/gi)
						for (var i = 0; i < terms.length; i++) {
							if (isNaN(terms[i])) {
								if (terms[i] == "by") { terms[i] = "" }
								else if (terms[i] == "of") { terms[i] = "" }
								else if (terms[i] == "plus") { terms[i] = "+" }
								else if (terms[i] == "minus") { terms[i] = "-" }
								else if (terms[i] == "times") { terms[i] = "*" }
								else if (terms[i] == "divided") { terms[i] = "/" }
								else if (terms[i] == "squared") { terms[i] = "** 2" }
								else if (terms[i] == "cubed") { terms[i] = "** 3" }
								else if (terms[i] == "halved") { terms[i] = "/ 2" }
								else if (terms[i] == "power") { terms[i] = "**" }
								else if (terms[i] == "root") { terms[i] = "** (1/"; terms.splice(i + 2, 0, ")")}
								else if (terms[i] == "(" || terms[i] == ")") {}
								else if (terms[i] == "percent") { terms[i] = "/ 100 *"}
							}
							else {
								terms[i] = Number(terms[i])
							}
						}

					// evaluate and return result
						var result = eval(terms.join(" "))
						if (isNaN(result)) {
							callback("Unable to calculate.")
						}
						else {
							callback(Number(result))
						}
				}
				catch (error) { callback("Unable to calculate.") }
			},
			"double": function(remainder, callback) {
				try {
					var result = 2 * Number(remainder)
					if (isNaN(result)) {
						callback("Unable to calculate.")
					}
					else {
						callback(Number(result))
					}
				}
				catch (error) { callback("Unable to calculate.") }
			},
			"triple": function(remainder, callback) {
				try {
					var result = 3 * Number(remainder)
					if (isNaN(result)) {
						callback("Unable to calculate.")
					}
					else {
						callback(Number(result))
					}
				}
				catch (error) { callback("Unable to calculate.") }
			},
			"average": function(remainder, callback) {
				try {
					// loop through and aggregate terms
						var terms = remainder.split(/\s/gi)
						var numbers = []
						for (var i = 0; i < terms.length; i++) {
							if (!isNaN(terms[i])) {
								numbers.push(Number(terms[i]))
							}
						}

						var result = numbers.reduce(function(total, term) {
							return (total + term)
						}) / (numbers.length || 1)

					// return result
						if (isNaN(result)) {
							callback("Unable to calculate.")
						}
						else {
							callback(Number(result))
						}
				}
				catch (error) { callback("Unable to calculate.") }
			},

		// word api fetches
			"find rhymes": function(remainder, callback) {
				try {
					// options
						var options = {
							url: "https://api.datamuse.com/words?rel_rhy=" + remainder
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response list
									var list = response || []
									for (var i in list) {
										list[i] = "<li>" + list[i].word + "</li>"
									}

								// message, link, list
									var message = "I found " + list.length + " rhyme" + (list.length == 1 ? "" : "s") + " for " + remainder + "."
									var link = "<a target='_blank' href='https://rhymezone.com/r/rhyme.cgi?typeofrhyme=perfect&Word=" + remainder + "'>" + message + "</a>"
									callback(link + "<ul>" + list.join("") + "</ul>")
							}
							catch (error) {
								callback("I can't rhyme that.")
							}
						})
				} catch (error) {}
			},

			"find synonyms": function(remainder, callback) {
				try {
					// options
						var options = {
							url: "https://api.datamuse.com/words?rel_syn=" + remainder
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response list
									var list = response || []
									for (var i in list) {
										list[i] = "<li>" + list[i].word + "</li>"
									}

								// message, link, list
									var message = "I found " + list.length + " synonym" + (list.length == 1 ? "" : "s") + " for " + remainder + "."
									var link = "<a target='_blank' href='https://rhymezone.com/r/rhyme.cgi?typeofrhyme=syn&Word=" + remainder + "'>" + message + "</a>"
									callback(link + "<ul>" + list.join("") + "</ul>")
							}
							catch (error) {
								callback("I don't know any synonyms for that.")
							}
						})
				} catch (error) {}
			},

			"define": function(remainder, callback) {
				try {
					// options
						var options = {
							url: "https://api.datamuse.com/words?md=d&sp=" + remainder
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response list
									var word = response[0]
									var list = []
									for (var i in word.defs) {
										word.defs[i] = "[" + word.defs[i].replace(/\t/,"] ")
										list[i] = "<li>" + word.defs[i] + "</li>"
									}

								// message, link, list
									var message = "I found " + list.length + " definition" + (list.length == 1 ? "" : "s") + " for " + remainder + "."
									var link = "<a target='_blank' href='http://wordnetweb.princeton.edu/perl/webwn?s=" + remainder + "'>" + message + "</a>"
									callback(link + "<ul>" + list.join("") + "</ul>")
							}
							catch (error) {
								callback("I can't define that.")
							}
						})
				} catch (error) {}
			},

		// content api fetches
			"tell a joke": function(remainder, callback) {
				try {
					// options
						var options = {
							url: "https://icanhazdadjoke.com/slack"
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response link
									var jokeLink = "https://icanhazdadjoke.com"
									var jokeText = response.attachments[0].text
									callback("<a target='_blank' href='" + jokeLink + "'>" + jokeText + "</a>")	
							}
							catch (error) {
								callback("I don't know any jokes.")
							}
							
						})
				} catch (error) {}
			},

			"get a quote": function(remainder, callback) {
				try {
					// options
						var options = {
							url: "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en"
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response link
									var quoteLink   = response.quoteLink
									var quoteText   = response.quoteText
									var quoteAuthor = response.quoteAuthor
									callback("<a target='_blank' href='" + quoteLink + "'>\"" + quoteText + "\" - " + quoteAuthor + "</a>")
							}
							catch (error) {
								callback("I don't know any quotes.")
							}
						})
				} catch (error) {}
			},

			"get the headlines": function(remainder, callback) {
				try {
					// initial callback
						callback("Let me fetch the latest news.")

					// options
						var options = {
							url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
						}

					// proxy to server
						window.FUNCTION_LIBRARY.proxyRequest(options, function(response) {
							try {
								// construct response list
									var list = response.rss.channel.item
									var stories = []
									for (var i = 0; i < list.length - 1; i++) {
										stories.push("<li><a target='_blank' href='" + list[i].link + "'><b>" + list[i].title + "</b></a><p>" + list[i].description + "</p></li>")
									}

								// message, link, list
									var message = "I found " + stories.length + " stor" + (list.length == 1 ? "y" : "ies") + "."
									callback(message + "<ul>" + stories.join("") + "</ul>")
							}
							catch (error) {
								callback("I can't get the news.")
							}
						})
				}
				catch (error) {}
			}
	}
