/*** modules ***/
	var http       = require("http")
	var https      = require("https")
	var fs         = require("fs")
	var qs         = require("querystring")
	var debug      = getEnvironment("debug")
	module.exports = {}

/*** logs ***/
	/* logError */
		module.exports.logError = logError
		function logError(error) {
			if (debug) {
				console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
				console.log(" - " + error)
				console.dir(arguments)
			}
		}

	/* logStatus */
		module.exports.logStatus = logStatus
		function logStatus(status) {
			if (debug) {
				console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
				console.log(" - " + status)

			}
		}

	/* logMessage */
		module.exports.logMessage = logMessage
		function logMessage(message) {
			if (debug) {
				console.log(" - " + new Date().toLocaleString() + ": " + message)
			}
		}

	/* logTime */
		module.exports.logTime = logTime
		function logTime(flag, callback) {
			if (debug) {
				var before = process.hrtime()
				callback()
				
				var after = process.hrtime(before)[1] / 1e6
				if (after > 5) {
					logMessage(flag + " " + after)
				}
			}
			else {
				callback()
			}
		}

/*** maps ***/
	/* getEnvironment */
		module.exports.getEnvironment = getEnvironment
		function getEnvironment(index) {
			try {
				if (process.env.DOMAIN !== undefined) {
					var environment = {
						port:   process.env.PORT,
						domain: process.env.DOMAIN,
						debug:  (process.env.DEBUG || false),
						ssl: (process.env.DEBUG || true),
						certificates: (process.env.CERTIFICATES || {})
					}
				}
				else {
					var environment = {
						port:   3000,
						domain: "localhost",
						debug:  true,
						ssl: true,
						certificates: {
							key: fs.readFileSync("localhost.key"),
							cert: fs.readFileSync("localhost.crt")
						}
					}
				}

				return environment[index]
			}
			catch (error) {
				logError(error)
				return false
			}
		}

	/* getAsset */
		module.exports.getAsset = getAsset
		function getAsset(index) {
			try {
				switch (index) {
					case "logo":
						return "logo.png"
					break
					case "meta":
						return '<meta charset="UTF-8"/>\
								<meta name="description" content="bluejay is an action-voice engine."/>\
								<meta name="author" content="James Mayr"/>\
								<meta property="og:title" content="bluejay: an action-voice engine"/>\
								<meta property="og:url" content="https://bluejay.herokuapp.com"/>\
								<meta property="og:description" content="bluejay is an action-voice engine."/>\
								<meta property="og:image" content="https://bluejay.herokuapp.com/logo.png"/>\
								<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"/>'
					break

					default:
						return null
					break
				}
			}
			catch (error) {logError(error)}
		}

	/* getContentType */
		module.exports.getContentType = getContentType
		function getContentType(string) {
			try {
				var array = string.split(".")
				var extension = array[array.length - 1].toLowerCase()

				switch (extension) {
					// application
						case "json":
						case "pdf":
						case "rtf":
						case "xml":
						case "zip":
							return "application/" + extension
						break

					// font
						case "otf":
						case "ttf":
						case "woff":
						case "woff2":
							return "font/" + extension
						break

					// audio
						case "aac":
						case "midi":
						case "wav":
							return "audio/" + extension
						break
						case "mid":
							return "audio/midi"
						break
						case "mp3":
							return "audio/mpeg"
						break
						case "oga":
							return "audio/ogg"
						break
						case "weba":
							return "audio/webm"
						break

					// images
						case "bmp":
						case "gif":
						case "jpeg":
						case "png":
						case "tiff":
						case "webp":
							return "image/" + extension
						break
						case "jpg":
							return "image/jpeg"
						break
						case "svg":
							return "image/svg+xml"
						break
						case "tif":
							return "image/tiff"
						break

					// video
						case "mpeg":
						case "webm":
							return "video/" + extension
						break
						case "ogv":
							return "video/ogg"
						break

					// text
						case "css":
						case "csv":
						case "html":
						case "js":
							return "text/" + extension
						break

						case "md":
							return "text/html"
						break

						case "txt":
						default:
							return "text/plain"
						break
				}
			}
			catch (error) {logError(error)}
		}

/*** checks ***/
	/* isNumLet */
		module.exports.isNumLet = isNumLet
		function isNumLet(string) {
			try {
				return (/^[a-z0-9A-Z_\s]+$/).test(string)
			}
			catch (error) {
				logError(error)
				return false
			}
		}

/*** tools ***/
	/* renderHTML */
		module.exports.renderHTML = renderHTML
		function renderHTML(request, path, callback) {
			try {
				var html = {}
				fs.readFile(path, "utf8", function (error, file) {
					if (error) {
						logError(error)
						callback("")
					}
					else {
						html.original = file
						html.array = html.original.split(/<script\snode>|<\/script>node>/gi)

						for (html.count = 1; html.count < html.array.length; html.count += 2) {
							try {
								html.temp = eval(html.array[html.count])
							}
							catch (error) {
								html.temp = ""
								logError("<sn>" + Math.ceil(html.count / 2) + "</sn>\n" + error)
							}
							html.array[html.count] = html.temp
						}

						callback(html.array.join(""))
					}
				})
			}
			catch (error) {
				logError(error)
				callback("")
			}
		}

	/* parseXML */
		module.exports.parseXML = parseXML
		function parseXML(xml) {
			try {
				//store all data at this level in a temporary object
					if (!tempObj || tempObj == undefined) {
						var tempObj = {}
							tempObj["escape"] = 0
					}

					var outerIndex = generateRandom()
					tempObj[outerIndex] = {}

				//loop through the xml at this level
					while (xml.length && tempObj["escape"] < 100) {
						//create temporary object
							var innerIndex = generateRandom()
							tempObj[innerIndex] = {}
							tempObj["escape"] = tempObj["escape"] + 1

						//get tag and element
							var element = xml.substring(0, xml.indexOf(">") + 1)
							var tagName = element.substring(1, Math.min((element.indexOf(" ") + 1) || (element.length + 1), (element.indexOf(">") + 1) || (element.length + 1)) - 1).replace("/","")

						//self closing?
							if (element.substring(element.length - 2, element.length - 1) == "/") {
								var selfClosing = true
							}
							else if (xml.indexOf("</" + tagName + ">") == -1) {
								var selfClosing = true
							}
							else if (element.indexOf("</") !== -1) {
								var selfClosing = true
							}
							else {
								var tagCount = 1
								var index = tagName.length

								while (tagCount && index < xml.length) {
									if (xml.indexOf("<" + tagName, index) == index) {
										tagCount++
									}
									else if ((xml.indexOf("</" + tagName, index) == index) || (xml.indexOf("< /" + tagName, index) == index) || (xml.indexOf("</ " + tagName, index) == index) || (xml.indexOf("< / " + tagName, index) == 0)) {
										tagCount--
									}
									index++
								}

								if (tagCount) {
									selfClosing = true
								}
								else {
									selfClosing = false
									var closingIndex = index - 1
								}
							}

						//get parameters
							var parameters = element.replace("<" + tagName, "")
								parameters = parameters.substring(0, parameters.length - 1).trim()

							if (parameters.length > 0) {
								parameters = parameters.split(/\"|\'/g)
								
								if (parameters.length == 1) {
									parameters = parameters.join().split(/\s|\=/g)
								}
								
								if (Array.isArray(parameters) && parameters.length > 1) {
									for (var p = 0; p < parameters.length; p += 2) {

										if ((parameters[p].length > 0) && (parameters[p] !== "/")) {
											var key = parameters[p].replace("=", "").trim()
											var value = parameters[p + 1]

											tempObj[innerIndex][key] = value
										}
									}
								}
							}

						//get data & run recursively
							if (!selfClosing) {
								var data = xml.substring(element.length, closingIndex).trim()

								if (data.indexOf("\n") == 0) {
									data = data.substring(1, data.length).trim()
								}
								if (data.lastIndexOf("\n") == data.length - 1) {
									data = data.substring(0, data.length - 1).trim()
								}

								if (data.indexOf("<![CDATA[") == 0) {
									tempObj[innerIndex] = data.substring(9, data.length - 3).trim()
								}
								else if ((data.indexOf("<") == 0) && (tempObj["escape"] < 100)) {
									tempObj["escape"] = tempObj["escape"] + 1
									
									var tempData = parseXML(data)
									var tempDataKeys = Object.keys(tempData)
									
									for (var t in tempDataKeys) {
										tempObj[innerIndex][tempDataKeys[t]] = tempData[tempDataKeys[t]]
									}
								}
								else if (data.length) {
									if (isNaN(Number(data))) {
										tempObj[innerIndex]._ = data.trim()
									}
									else {
										tempObj[innerIndex]._ = Number(data)
									}
								}
							}

						//consolidate parameters if one or none
							var keys = Object.keys(tempObj[innerIndex])
							if ((keys.length == 1) && (keys[0] == "_")) {
								tempObj[innerIndex] = tempObj[innerIndex][keys[0]]
							}
							else if (keys.length == 0) {
								tempObj[innerIndex] = true
							}

						//remove section from xml string
							if (!selfClosing) {
								xml = xml.substring(closingIndex + tagName.length + 3, xml.length)
							}
							else {
								xml = xml.substring(element.length, xml.length)
							}

							if (xml.indexOf("\n") == 0) {
								xml = xml.substring(1, xml.length)
							}
							if (xml.lastIndexOf("\n") == xml.length - 1) {
								xml = xml.substring(0, xml.length - 1)
							}

							xml = xml.trim()

						//add temporary object (or string) to json tree
							if (tempObj[outerIndex][tagName] && tempObj[outerIndex][tagName] !== undefined) {
								tempObj[outerIndex][tagName].push(tempObj[innerIndex])
							}
							else {
								tempObj[outerIndex][tagName] = [tempObj[innerIndex]]
							}
					}

				//consolidate arrays of one
					var tagNames = Object.keys(tempObj[outerIndex])
					for (var t in tagNames) {
						if (tempObj[outerIndex][tagNames[t]].length == 1) {
							tempObj[outerIndex][tagNames[t]] = tempObj[outerIndex][tagNames[t]][0]
						}
					}

				//return this object to the higher level
					return tempObj[outerIndex]
			}
			catch (error) {
				logError(error)
				return {}
			}
		}

	/* proxyRequest */
		module.exports.proxyRequest = proxyRequest
		function proxyRequest(request, callback) {
			try {
				// gather parameters
					var protocol = request.post.url.split("://")[0]
					var method = request.post.method || "get"
					var path = request.post.url.replace(protocol + "://", "").split("?")[0].split("/")
					var host = path.shift() || ""
					request.post.host = host
					
					var body = request.post.body ? JSON.stringify(request.post.body) : request.post.url.split("?")[1] || ""
					var options = {
						host: host,
						path: "/" + encodeURI(path.join("/")),
						url: request.post.url,
						method: method.toUpperCase(),
						headers: 	{
							"Accept": request.post["Accept"] || "application/json",
							"Content-Type": request.post["Content-Type"] || "application/json",
							"User-Agent": request.post["User-Agent"] || "bluejay",
							"followRedirects": request.post["followRedirects"] || true,
							"Authorization": request.post["Authorization"] || true
						}
					}

				// log it
					logStatus("proxy request @ " + request.ip + "\n[" + method + "] " + host + "/" + path.join("/") + "\n" + JSON.stringify(options.headers) + "\n" + body)

				// request by protocol / method
					if (protocol == "http") {
						if (method !== "get" || request.post["Authorization"]) {
							var apiRequest = http.request(options, function (apiResponse) {
								proxyResponse(apiResponse, request.post.asIs, callback)
							}).on("error", callback)
							apiRequest.write(body)
							apiRequest.end()
						}
						else if (method == "get") {
							http.get(request.post.url, function (apiResponse) {
								if (apiResponse.headers.location && apiResponse.headers.location.indexOf("https://") == 0) {
									https.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, request.post.asIs, callback)
									})
								}
								else if (apiResponse.headers.location && apiResponse.headers.location.indexOf("http://") == 0) {
									http.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, request.post.asIs, callback)
									})
								}
								else {
									proxyResponse(apiResponse, request.post.asIs, callback)
								}
							}).on("error", callback)
						}
					}
					else if (protocol == "https") {
						if (method !== "get" || request.post["Authorization"]) {
							var apiRequest = https.request(options, function (apiResponse) {
								proxyResponse(apiResponse, request.post.asIs, callback)
							}).on("error", callback)
							apiRequest.write(body)
							apiRequest.end()
						}
						else if (method == "get") {
							https.get(request.post.url, function (apiResponse) {
								if (apiResponse.headers.location && apiResponse.headers.location.indexOf("https://") == 0) {
									https.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, request.post.asIs, callback)
									})
								}
								else if (apiResponse.headers.location && apiResponse.headers.location.indexOf("http://") == 0) {
									http.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, request.post.asIs, callback)
									})
								}
								else {
									proxyResponse(apiResponse, request.post.asIs, callback)
								}
							}).on("error", callback)
						}
					}

				// otherwise
					else {
						callback({success: false, message: "unable to proxy request"})
					}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to proxy request"})
			}
		}

	/* proxyResponse */
		module.exports.proxyResponse = proxyResponse
		function proxyResponse(apiResponse, asIs, callback) {
			try {
				// collect data
					var apiData = ""
					apiResponse.on("data", function (chunk) { apiData += chunk })

				// parse results
					apiResponse.on("end", function() { 
						try {
							logStatus("proxy response:\n" + apiData)
							// as is
								if (asIs) {
									var responseData = String(apiData)
									callback(responseData)
								}

							// try json
								else {
									var responseData = JSON.parse(apiData)
									callback(responseData)
								}
						} catch (error) {
							try {
								// try xml
									if (apiData.includes("<") || apiData.includes(">")) {
										var responseData = parseXML(apiData)
										callback(responseData)
									}

								// back to as is
									else {
										var responseData = String(apiData)
										callback(responseData)
									}
							}
							catch (error) {
								// as is or error
									callback(responseData || error)	
							}
						}
					})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to proxy response"})
			}
		}

/*** randoms ***/
	/* generateRandom */
		module.exports.generateRandom = generateRandom
		function generateRandom(set, length) {
			try {
				set = set || "0123456789abcdefghijklmnopqrstuvwxyz"
				length = length || 32
				
				var output = ""
				for (var i = 0; i < length; i++) {
					output += (set[Math.floor(Math.random() * set.length)])
				}

				if ((/[a-zA-Z]/).test(set)) {
					while (!(/[a-zA-Z]/).test(output[0])) {
						output = (set[Math.floor(Math.random() * set.length)]) + output.substring(1)
					}
				}

				return output
			}
			catch (error) {
				logError(error)
				return null
			}
		}

	/* chooseRandom */
		module.exports.chooseRandom = chooseRandom
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
				logError(error)
				return false
			}
		}

/*** database ***/
	/* setAuthorization */
		module.exports.setAuthorization = setAuthorization
		function setAuthorization(request, db, data, callback) {
			try {
				db[request.session.id][request.post.host] = data
				callback({success: true})
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to set authorization"})
			}
		}

	/* getAuthorization */
		module.exports.getAuthorization = getAuthorization
		function getAuthorization(request, db, callback) {
			try {
				if (db[request.session.id] && request.post.key && db[request.session.id][request.post.key]) {
					callback({success: true, data: db[request.session.id][request.post.key]})
				}
				else {
					callback({success: false, data: null})
				}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to get authorization"})
			}
		}

	/* determineSession */
		module.exports.determineSession = determineSession
		function determineSession(request, db) {
			try {
				if (!request.cookie.session || request.cookie.session == null || request.cookie.session == 0) {
					request.session = {
						id: generateRandom(),
						updated: new Date().getTime(),
						info: {
							"ip":         request.ip,
				 			"user-agent": request.headers["user-agent"],
				 			"language":   request.headers["accept-language"],
						}
					}

					db[request.session.id] = request.session
				}
				else if (db[request.cookie.session]) {
					request.session = db[request.cookie.session]
					request.session.updated = new Date().getTime()
				}
				else {
					request.cookie.session = null
					determineSession(request, db)
				}
			}
			catch (error) {
				logError(error)
				callback({success: false, message: "unable to determine session"})
			}
		}
