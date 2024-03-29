/*** modules ***/
	const FUNCTIONS = require("firebase-functions")
	const HTTP = require("http")
	const HTTPS = require("https")

/*** logging ***/
	/* logError */
		function logError(error) {
			console.log("\n*** ERROR @ " + new Date().toLocaleString() + " ***")
			console.log(" - " + error)
			console.dir(arguments)
		}

	/* logStatus */
		function logStatus(status) {
			console.log("\n--- STATUS @ " + new Date().toLocaleString() + " ---")
			console.log(" - " + status)
		}

/*** tools ***/
	/* parseXML */
		function parseXML(xml) {
			try {
				//store all data at this level in a temporary object
					if (!tempObj || tempObj == undefined) {
						var tempObj = {}
							tempObj["escape"] = 0
					}

					var outerIndex = Math.floor(Math.random() * 1000000000000).toString(36)
					tempObj[outerIndex] = {}

				//loop through the xml at this level
					while (xml.length && tempObj["escape"] < 100) {
						//create temporary object
							var innerIndex = Math.floor(Math.random() * 1000000000000).toString(36)
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
		function proxyRequest(REQUEST, callback) {
			try {
				// gather parameters
					var protocol = REQUEST.post.url.split("://")[0]
					var method = REQUEST.post.method || "get"
					var path = REQUEST.post.url.replace(protocol + "://", "").split("?")[0].split("/")
					var host = path.shift() || ""
					REQUEST.post.host = host
					
					var body = REQUEST.post.body ? JSON.stringify(REQUEST.post.body) : REQUEST.post.url.split("?")[1] || ""
					var options = {
						host: host,
						path: "/" + encodeURI(path.join("/")),
						url: REQUEST.post.url,
						method: method.toUpperCase(),
						headers: 	{
							"Accept": REQUEST.post["Accept"] || "application/json",
							"Content-Type": REQUEST.post["Content-Type"] || "application/json",
							"User-Agent": REQUEST.post["User-Agent"] || "bluejay",
							"followRedirects": REQUEST.post["followRedirects"] || true,
							"Authorization": REQUEST.post["Authorization"] || true
						}
					}

				// log it
					logStatus("proxy request for " + REQUEST.post["bluejay-id"] + " @ " + REQUEST.ip + "\n[" + method + "] " + host + "/" + path.join("/") + "\n" + JSON.stringify(options.headers) + "\n" + body)

				// request by protocol / method
					if (protocol == "http") {
						if (method !== "get" || REQUEST.post["Authorization"]) {
							var apiRequest = HTTP.request(options, function (apiResponse) {
								proxyResponse(apiResponse, REQUEST.post.responseType, callback)
							}).on("error", callback)
							apiRequest.write(body)
							apiRequest.end()
						}
						else if (method == "get") {
							HTTP.get(REQUEST.post.url, function (apiResponse) {
								if (apiResponse.headers.location && apiResponse.headers.location.indexOf("https://") == 0) {
									HTTPS.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, REQUEST.post.responseType, callback)
									})
								}
								else if (apiResponse.headers.location && apiResponse.headers.location.indexOf("http://") == 0) {
									HTTP.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, REQUEST.post.responseType, callback)
									})
								}
								else {
									proxyResponse(apiResponse, REQUEST.post.responseType, callback)
								}
							}).on("error", callback)
						}
					}
					else if (protocol == "https") {
						if (method !== "get" || REQUEST.post["Authorization"]) {
							var apiRequest = HTTPS.request(options, function (apiResponse) {
								proxyResponse(apiResponse, REQUEST.post.responseType, callback)
							}).on("error", callback)
							apiRequest.write(body)
							apiRequest.end()
						}
						else if (method == "get") {
							HTTPS.get(REQUEST.post.url, function (apiResponse) {
								if (apiResponse.headers.location && apiResponse.headers.location.indexOf("https://") == 0) {
									HTTPS.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, REQUEST.post.responseType, callback)
									})
								}
								else if (apiResponse.headers.location && apiResponse.headers.location.indexOf("http://") == 0) {
									HTTP.get(apiResponse.headers.location, function(apiReResponse) {
										proxyResponse(apiReResponse, REQUEST.post.responseType, callback)
									})
								}
								else {
									proxyResponse(apiResponse, REQUEST.post.responseType, callback)
								}
							}).on("error", callback)
						}
					}

				// otherwise
					else {
						callback({success: false, message: "unable to " + arguments.callee.name})
					}
			}
			catch (error) {
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

	/* proxyResponse */
		function proxyResponse(apiResponse, responseType, callback) {
			try {
				// collect data
					var apiData = ""
					apiResponse.on("data", function (chunk) { apiData += chunk })

				// parse results
					apiResponse.on("end", function() { 
						try {
							logStatus("proxy response:\n" + apiData)
							
							// try json
								if (responseType == "json") {
									var responseData = JSON.parse(apiData)
									callback(responseData)
								}

							// try xml
								else if (responseType == "xml") {
									var responseData = parseXML(apiData)
									callback(responseData)
								}

							// as is
								else {
									var responseData = String(apiData)
									callback(responseData)
								}
						}
						catch (error) {
							callback(responseData || error)	
						}
					})
			}
			catch (error) {
				callback({success: false, message: "unable to " + arguments.callee.name})
			}
		}

/*** handle requests ***/
	/* sendPost */
		exports.sendPost = FUNCTIONS.https.onRequest(function(REQUEST, RESPONSE) {
			try {
				REQUEST.post = REQUEST.body || REQUEST.query
				if (typeof REQUEST.post !== "object") {
					REQUEST.post = JSON.parse(REQUEST.post)
				}
				proxyRequest(REQUEST, function(data) {
					RESPONSE.end(JSON.stringify(data))
				})
			}
			catch (error) {
				logError(error)
				RESPONSE.end("unknown error in cloud functions for sendPost")
			}
		})
