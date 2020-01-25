/*** modules ***/
	var http = require("http")
	var https = require("https")
	var fs   = require("fs")
	var qs   = require("querystring")

	var main = require("./logic")
	var db = {}

/*** server ***/
	var port = main.getEnvironment("port")
	if (main.getEnvironment("ssl")) {
		var server = https.createServer(main.getEnvironment("certificates"), handleRequest)
	}
	else {
		var server = http.createServer(handleRequest)
	}
		server.listen(port, function (error) {
			if (error) {
				main.logError(error)
			}
			else {
				main.logStatus("listening on port " + port)
			}
		})

/*** handleRequest ***/
	function handleRequest(request, response) {
		// collect data
			var data = ""
			request.on("data", function (chunk) { data += chunk })
			request.on("end", parseRequest)

		/* parseRequest */
			function parseRequest() {
				try {
					// get request info
						request.get    = qs.parse(request.url.split("?")[1]) || {}
						request.path   = request.url.split("?")[0].split("/") || []
						request.url    = request.url.split("?")[0] || "/"
						request.post   = data ? JSON.parse(data) : {}
						request.cookie = request.headers.cookie ? qs.parse(request.headers.cookie.replace(/; /g, "&")) : {}
						request.ip     = request.headers["x-forwarded-for"] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress
						
					// session
						main.determineSession(request, db)

					// log it
						if (request.url !== "/favicon.ico") {
							main.logStatus((request.cookie.session || "new") + " @ " + request.ip + "\n[" + request.method + "] " + request.path.join("/") + "\n" + JSON.stringify(request.method == "GET" ? request.get : request.post))
						}

					// where next ?
						routeRequest()
				}
				catch (error) {_403("unable to parse request")}
			}

		/* routeRequest */
			function routeRequest() {
				try {
					// get
						if (request.method == "GET") {
							switch (true) {
								// favicon
									case (/\/favicon[.]ico$/).test(request.url):
									case (/\/icon[.]png$/).test(request.url):
									case (/\/apple\-touch\-icon[.]png$/).test(request.url):
									case (/\/apple\-touch\-icon\-precomposed[.]png$/).test(request.url):
									case (/\/logo[.]png$/).test(request.url):
										try {
											response.writeHead(200, {"Content-Type": "image/png"})
											fs.readFile("./public/logo.png", function (error, file) {
												if (error) {_404(error)}
												else {
													response.end(file, "binary")
												}
											})
										}
										catch (error) {_404(error)}
									break
							
								// home
									case (/^\/$/).test(request.url):
										try {
											response.writeHead(200, {
												"Set-Cookie": String( "session=" + request.session.id + "; expires=" + (new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7)).toUTCString()) + "; path=/; domain=" + main.getEnvironment("domain") ),
												"Content-Type": "text/html; charset=utf-8"
											})
											main.renderHTML(request, "./public/index.html", function (html) {
												response.end(html)
											})
										}
										catch (error) {_404(error)}
									break

								// authorization
									case (/^\/authorization\/?$/).test(request.url):
										try {
											response.writeHead(200, {
												"Content-Type": "text/html; charset=utf-8"
											})
											request.post = JSON.parse(request.get.embeddedPost)
											main.proxyRequest(request, function (data) {
												main.setAuthorization(request, db, data, function (authorizationResults) {
													request.authorizationResults = authorizationResults
													main.renderHTML(request, "./public/authorization.html", function (html) {
														response.end(html)
													})
												})
											})
										}
										catch (error) {_404(error)}
									break

								// readme
									case (/readme[.]md$/i).test(request.url):
										try {
											response.writeHead(200, {"Content-Type": main.getContentType(request.url)})
											fs.readFile("./" + request.path.join("/"), function (error, file) {
												if (error) {_404(error)}
												else {
													response.end(file, "binary")
												}
											})
										}
										catch (error) {_404(error)}
									break

								// other asset
									case (/[.]([a-zA-Z0-9])+$/).test(request.url):
										try {
											response.writeHead(200, {"Content-Type": main.getContentType(request.url)})
											fs.readFile("./public" + request.path.join("/"), function (error, file) {
												if (error) {_404(error)}
												else {
													response.end(file, "binary")
												}
											})
										}
										catch (error) {_404(error)}
									break

								// other
									default:
										_404()
									break
							}
						}

					// post
						else if (request.method == "POST" && request.post.action) {
							switch (request.post.action) {
								// proxyRequest
									case "proxyRequest":
										try {
											response.writeHead(200, {"Content-Type": "text/json"})
											main.proxyRequest(request, function (data) {
												response.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(error)}
									break

								// getAuthorization
									case "getAuthorization":
										try {
											response.writeHead(200, {"Content-Type": "text/json"})
											main.getAuthorization(request, db, function (data) {
												response.end(JSON.stringify(data))
											})
										}
										catch (error) {_403(error)}
									break

								// others
									default:
										_403()
									break
							}
						}

					// others
						else {_403("unknown route")}
				}
				catch (error) {_403("unable to route request")}
			}

		/* _302 */
			function _302(data) {
				main.logStatus("redirecting to " + (data || "/"))
				response.writeHead(302, { Location: data || "../../../../" })
				response.end()
			}

		/* _403 */
			function _403(data) {
				main.logError(data)
				response.writeHead(403, { "Content-Type": "text/json" })
				response.end( JSON.stringify({success: false, error: data}) )
			}

		/* _404 */
			function _404(data) {
				main.logError(data)
				response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
				main.renderHTML(request, "./public/_404.html", function (html) {
					response.end(html)
				})
			}
	}
