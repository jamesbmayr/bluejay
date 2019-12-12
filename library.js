/* phrase library */
	window.PHRASE_LIBRARY = {
		"what time is it": 			"what time is it",
		"what is the time": 		"what time is it",
		"whats the time": 			"what time is it",
		"tell me the time": 		"what time is it",

		"what day is it": 			"what day is it",
		"what day is today": 		"what day is it",
		"whats the day": 			"what day is it",
		"tell me the day": 			"what day is it",

		"what month is it": 		"what month is it",
		"what is the month": 		"what month is it",
		"whats the month": 			"what month is it",
		"tell me the month": 		"what month is it",

		"what is the date": 		"what is the date",
		"what is today's date": 	"what is the date",
		"whats the date": 			"what is the date",
		"tell me the date": 		"what is the date",

		"roll a d": 				"roll a die",
		"roll a die": 				"roll a die",
		"roll a": 					"roll a die",

		"flip a coin": 				"flip a coin",
		"heads or tails": 			"flip a coin",

		"repeat after me": 			"repeat after me",
		"say what i say": 			"repeat after me",
		"say this back": 			"repeat after me",

		"calculate": 				"calculate"
	}

/* action library */
	window.ACTION_LIBRARY = {
		"what time is it": function() {
			return (new Date().toLocaleTimeString())
		},
		"what day is it": function() {
			return (["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()])
		},
		"what month is it": function() {
			return (["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()])
		},
		"what is the date": function() {
			return (["January","February","March","April","May","June","July","August","September","October","November","December"][new Date().getMonth()] + " " + new Date().getDate())
		},
		"roll a die": function(remainder) {
			var sides = Number(remainder.replace(/d/gi,""))
			return Math.floor(Math.random() * sides) + 1
		},
		"flip a coin": function(remainder) {
			return ["heads","tails"][Math.floor(Math.random() * 2)]
		},
		"repeat after me": function(remainder) {
			return remainder
		},
		"calculate": function(remainder) {
			try {
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

				var result = eval(terms.join(" "))
				if (isNaN(result)) {
					return "Unable to calculate."
				}
				else {
					return Number(result)
				}
			}
			catch (error) {
				return "Unable to calculate."
			}
		}
	}
