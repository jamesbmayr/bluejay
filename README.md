<h1>bluejay</h1>
<h3>an action-voice engine by James Mayr</h3>
<br><br>

<hr>
<h2>INTRODUCTION</h2>
<blockquote>
Welcome to bluejay, a voice assistant that isn't always listening, that doesn't compile huge data troves of your speech and history, and that doesn't have any idea who you are. The trade-off is that you need to have some familiarity with coding to customize it to your needs - including creating developer accounts with any APIs you intend to use. But, at least in theory, bluejay is infinitely expandable - think of this as an engine that can power your use cases... with a ton of built-in functionality already.
<br><br>
Why did I build this? I wanted a voice assistant to perform various platform-specific searches, to read me the news, to control my smart home devices, etc. There are, of course, existing solutions to this... but I just don't trust the big players. I imagine they're using the audio recordings and transcripts for their own purposes, whether that's market research or personalizing ads or building new AI products. I wanted a system that provides more control over the flow of information and allows me to interact with APIs without creating a unified record of my preferences and history. But more than that, I built this because it seemed like fun.
</blockquote>
<br><br><br>

<hr>
<h2>TECHNOLOGIES</h2>
<blockquote>
<h3>nodeJS</h3>
A simple nodeJS application running locally is used for serving front-end files and proxying requests to external APIs.
<br><br>

<h3>JS (ES6)</h3>
The front-end is a vanilla Javascript application (using some ES6 syntax). The core engine lives in a single script, with an additional script containing the library of recognized phrases and executable actions.
<br><br>

<h3>LocalStorage API</h3>
Since there are no user accounts, all settings are stored locally in the browser's LocalStorage cache. This includes credentials to external APIs - nothing is stored in the code.
<br><br>

<h3>WebAudio API</h3>
The native WebAudio API powers a simple pitch detection, which only stores frequency data - not words.
<br><br>

<h3>SpeechRecognition API</h3>
Another native API, SpeechRecognition kicks in once a whistle is detected, and converts speech into text. Note that Chrome technically sends this audio to Google servers for (presumably anonymous) processing.
<br><br>

<h3>SpeechSynthesis API</h3>
This leverages the speech synthesis functionality of the device to transform response text into spoken words.
</blockquote>
<br><br><br>

<hr>
<h2>SET-UP</h2>
<blockquote>
<h3>back-end: localhost</h3>
<ol>
<li>Download and install the latest version of nodeJS.</li>
<li>Download the bluejay .zip, open it, and move the files to the folder of your choice.</li>
<li>Navigate to this location in Terminal, then to the folder <code>localhost</code>.</li>
<li><code>npm start</code></li>
</ol>

<h3>back-end: Firebase</h3>
<ol>
<li>Alternately, create a new project on <a target="_blank" href="https://firebase.google.com/">Google Firebase</a>.</li>
<li>This may incur minimal costs (pennies). If you want to use Firebase to call external APIs, such as to fetch information or control smart devices, Google requires a pay-as-you-go plan.</li>
<li>Download and install the latest version of Firebase.</li>
<li>Download the bluejay .zip, open it, and move the files to the folder of your choice.</li>
<li>Navigate to this location in Terminal, then to the folder <code>firebase</code>.</li>
<li><code>firebase init</code></li>
<li>Follow the prompts to set up your Firebase project.</li>
<li><code>firebase deploy</code></li>
<li>When the project is deployed, the logs will indicate the url of your Firebase project.</li>
</ol>

<h3>front-end</h3>
<ol>
<li>Download and install the latest version of Google Chrome. <i>Note: Safari and Firefox do not support SpeechRecognition API.</i></li>
<li>If you have deployed using Firebase, simply navigate to the url of your project. Otherwise, read on...</li>
<li>Option 1: easy, then annoying
<ol>
<li>In <code>index.js</code>, in <code>getEnvironment</code>, set <code>ssl</code> to <code>false</code>.</li>
<li>Open http://localhost:3000 in your browser. <i>Note: since this is not https, the webpage will constantly ask you to grant audio permissions.</i></li>
</ol>
</li>
<li>Option 2: annoying, then easy
<ol>
<li>On chrome://flags/#unsafely-treat-insecure-origin-as-secure, add <code>localhost</code> in the text field and set the select to Enabled.</li>
<li>On chrome://flags/#allow-insecure-localhost, switch to Enabled.</li>
<li>Create a security certificate for localhost. <i>(optional, to remove the red warning)</i> You can do that with this command, from <a target="_blank" href="https://letsencrypt.org/docs/certificates-for-localhost/">https://letsencrypt.org/docs/certificates-for-localhost/</a>
<br>
<pre>openssl req -x509 -out localhost.crt -keyout localhost.key \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")</pre>
<br>
Then use your computer's Keychain Access or equivalent to Alsways Trust this certificate.
</li>
<li>Open <a href="https://localhost:3000" target="_blank">https://localhost:3000</a> in your browser. <i>Note: on startup, Chrome may show you a reminder that you are treating localhost as https.</i></li>
</ol>
</li>
</ol>
</blockquote>
<br><br><br>

<hr>
<h2>HOW TO USE THIS</h2>
<blockquote>
This is an overview of the user experience - how to interact with bluejay. Subsequent sections will explain how it works, how to set up developer accounts with APIs, and how to add your own functionality. 
<br><br>

<h3>Input</h3>
There are 4 input methods:
<ul>
<li>Type a phrase into the text box.</li>
<li>Click the circular button and speak a phrase.</li>
<li>Whistle any interval (that is, two distinct notes), up or down, within an octave, to get bluejay's attention; then speak your phrase.</li>
<li>After responding, most actions will cause bluejay to follow up and listen again.</li>
</ul>
<br>

<h3>Settings</h3>
The interface also provides a few settings, which you can access by clicking the "hamburger" icon.
<ul>
<li>upload: Use this to import a simple JSON file of key/value pairs of configurations (such as api keys or favorite websites). Note that this information is stored in LocalStorage only.</li>
<li>on: Uncheck this to turn off whistle detection. (While unchecked, input method #3 is unavailable.)</li>	
<li>listen (sec): How long should bluejay listen for words before processing them?</li>
<li>volume: How loud should the speech synthesis response be?</li>
<li>voice: Which voice (provided by the device) should the speech synthesis use?</li>
</ul>
<br>

<h3>Response Structure</h3>
Each response should include the following components:
<br>
<ol>
<li>
<b>visual</b>
<ul>
<li>phrase: the exact user-input phrase detected</li>
<li>icon: an emoji representing the action that the phrase matched to</li>
<li>action: the name of the action that the phrase matched to; all actions are in the form of <code>infinitive verb</code> + <code>details</code>, such as "<code>get</code> + <code>the time</code>"</li>
<li>timestamp: the hh:mm:ss time the response was generated</li>
<li>responseHTML: the output generated by the action function, including:
<ul>
<li>an <code>&lt;h2&gt;</code> with the primary output (often wrapped in an <code>&lt;a&gt;</code>)</li>
<li>additional unstructured information</li>
<li>additional structured information, such as a <code>&lt;ul&gt;</code>, <code>&lt;table&gt;</code>, <code>&lt;svg&gt;</code>, <code>&lt;img&gt;</code>, or <code>&lt;iframe&gt;</code></li>
</ul>
</li>
</ul>
</li>

<li>
<b>auditory</b>
<ul>
<li>message: the spoken text that is fed to the SpeechSynthesis API</li>
</ul>
</li>

<li>
<b>contextual</b>
<ul>
<li><i>(Note: These items can add information to the <code>CONTEXT_LIBRARY</code> or change the format of the response.)</i></li>
<li><code>followup</code>: set this to <code>false</code> to prevent bluejay from automatically triggering SpeechRecognition again</li>
<li><code>auto</code>: makes the action bar blue</li>
<li><code>error</code>: makes the action bar red, saves this action as incomplete and follows up</li>
<li><code>number</code>: the main number of the response, if applicable</li>
<li><code>word</code>: the main word or short phrase of the response, if applicable</li>
<li><code>time</code>: the main date/timestamp of the response, if applicable</li>
<li><code>url</code>: the main url of the response, if applicable</li>
<li><code>video</code>: the id of the <code>&lt;iframe&gt;</code> or <code>&lt;video&gt;</code> of the response, if applicable</li>
<li><code>language</code>: the alternate language for the spoken response, if applicable</li>
<li><code>results</code>: a list of additional responses, if applicable, such as for a search action</li>
</ul>
</li>
</ol>
</blockquote>
<br><br><br>

<hr>
<h2>HOW IT WORKS</h2>
<blockquote>
<h3>Whistling</h3>
<ol>
<li>Clicking the large logo button on load creates a <code>new AudioContext()</code> which connects to the device microphone.</li>
<li>A <code>setInterval</code> runs a function every X ms which analyzes the latest microphone data. It attempts to understand the complexity, frequency, and energy (volume) of input sound.</li>
<li>If certain criteria are met across these categories (simple sine wave, frequency in the whistling range, sufficient loudness) then the frequency is converted to a pitch and stored. Only the last 10 iterations are saved.</li>
<li>If an interval (that is, a difference between two pitches) of at least a minor second and at most a perfect fourth is detected, speech recognition is triggered.</li>
<li>It also plays a chirp sound in an <code>&lt;audio&gt;</code> element. <i>(Note: this is actually an edited recording of bluejays!)</i></li>
</ol>

<h3>Speech Recognition</h3>
<ol>
<li>As indicated above, this can be triggered by whistling, clicking the button, or a followup command from a previous action.</li>
<li>The <code>speechRecognition</code> API listens for X seconds or until it detects silence.</li>
<li>The audio is technically processed through a Google API, but this is all built-in to Chrome.</li>
<li>The resultant object contains multiple possible text matches; only the first is used.</li>
</ol>

<h3>Pre-Matching</h3>
<ol>
<li>A phrase is entered, either through speech recognition or by being manually typed in the text box.</li>
<li>If the phrase exactly matches one of the elements in <code>ERROR_LIBRARY["stop-phrases"]</code>, the system will set the action to <code>stop</code>. This will flush out any previously incomplete action or flow, as well as stop any playing video or speech synthesis. The system will not follow up.</li>
<li>If the last 6 characters of the phrase are <code>cancel</code> (case-insensitive), the system will abort this entirely and produce no output. The system will not follow up.</li>
<li>If a <code>flow</code> was set (that is, a multi-step action), then the entire phrase will be fed into that action. (Note that only a <code>stop</code> command will exit a flow prematurely.)</li>
</ol>

<h3>Matching</h3>
<ol>
<li>Otherwise, the full phrase (trimmed and cleaned up a bit) is matched against every key in the <code>PHRASE_LIBRARY</code>. If there are no matches, the last word (broken at spaces) is moved to a <code>remainder</code> string, and the preceding phrase is matched against the <code>PHRASE_LIBRARY</code>. This continues until a match is found.</li>
<li>If a match is found, the <code>remainder</code> is fed into the action function indicated by the <code>PHRASE_LIBRARY</code>.</li>
<li>If no match was found, but there was a previously incomplete action, the entire phrase is fed into that action function (similar to a flow above).</li>
<li>If no match was found and there was no previously incomplete action, the system selects an error from <code>ERROR_LIBRARY["noaction-responses"]</code> and follows up to try again.</li>
</ol>

<h3>Action</h3>
<ol>
<li>If there was an action, the remainder (or <code>null</code>) will be fed into the function of that name in the <code>ACTION_LIBRARY</code>.</li>
<li>Generally, these actions will either transform the remainder, use it to search for information on an API, or send it to an API and return the result.</li>
</ol>

<h3>History</h3>
<ol>
<li>The phrase, action, remainder, and response object are all fed into <code>createHistory</code>.</li>
<li>This function updates the <code>CONTEXT_LIBRARY</code> with the latest phrase, action, and remainder, as well as the response icon, message, html, and any additional parameters.</li>
<li>A history block is created (see Response Structure above).</li>
<li>The SpeechSynthesis API will speak the response message (see Response Structure above).</li>
<li>Unless there was an explicit command not to, the system will then follow up for another phrase.</li>
</ol>

<h3>Libraries</h3>
<ul>
<li><code>PHRASE_LIBRARY</code>: the object populated by <code>library.js</code> containing all key-value pairs of spoken phrase to action name.</li>
<li><code>ACTION_LIBRARY</code>: the object populated by <code>library.js</code> containing all the actions that can be invoked by the user.</li>
<li><code>FUNCTION_LIBRARY</code>: the list of helper functions used throughout the front-end, such as <code>getAverage</code> and <code>sortRandom</code>; all of the form handlers, such as <code>changeWhistleOn</code> and <code>changeRecognitionDuration</code>; all of the <code>initialize</code> functions for the other libraries, such as <code>initializeAudio</code> and <code>initializeRecognition</code>; all of the functions that communicate externally, such as <code>proxyRequest</code> and <code>sendPost</code>; and all of the functions described in this flow, such as <code>matchPhrase</code> and <code>createHistory</code>. Basically, this is all functions except the ones users invoke in the <code>ACTION_LIBRARY</code>.</li>
<li><code>ELEMENT_LIBRARY</code>: an object to more easily access DOM elements, such as the settings inputs.</li>
<li><code>AUDIO_LIBRARY</code>: the object containing all data and functions powering the whistle detection.</li>
<li><code>SOUND_LIBRARY</code>: the object containing all information powering the chirp sound.</li>
<li><code>RECOGNITION_LIBRARY</code>: the object containing all data and functions powering the SpeechRecognition.</li>
<li><code>VOICE_LIBRARY</code>: the object containing all data and functions powering the SpeechSynthesis.</li>
<li><code>ERROR_LIBRARY</code>: an object of arrays of <code>stop-phrases</code>, <code>noaction-responses</code>, and <code>error-responses</code>.</li>
<li><code>CONTEXT_LIBRARY</code>: an object to store temporary values pertaining to the last phrase, action, response, etc.; this also contains information about the current flow and any current alarms.</li>
<li><code>CONFIGURATION_LIBRARY</code>: an object saved in <code>localStorage</code> that contains <code>settings</code> related to the whistling, speech recognition, and speech synthesis components, as well as any user-provided API credentials, favorite websites and RSS feeds, and location information.</li>
<li><code>NUMBER_WORD_LIBRARY</code>: a key-value mapping of number words to digits, such as <code>"one": 1</code>.</li>
<li><code>LETTER_WORD_LIBRARY</code>: a key-value mapping of letter words to letters, such as <code>"sea": "c"</code>.</li>
</ul>
</blockquote>
<br><br><br>

<hr>
<h2>CUSTOMIZING FUNCTIONALITY</h2>
<blockquote>
You can easily add your own functions to library.js:
<br><br>

<h3>Add phrases to the PHRASE_LIBRARY</h3>
<ul>
<li>The <code>key</code> represents part of the user's spoken <code>phrase</code>, matched from the beginning.</li>
<li>The <code>value</code> represents the name of the function to run.</li>
</ul>

<h3>Add action to the ACTION_LIBRARY</h3>
<ul>
<li>The name of the function should be all lowercase, only alphabetical, an imperative command from bluejay's point of view (ex: <code>"get the time"</code> or <code>"search google"</code>).</li>
<li>All action functions take two inputs:
<ul>
<li>The <code>remainder</code> is the rest of the user's spoken <code>phrase</code>, everything that did not match in the PHRASE_LIBRARY, through to the end of the string.</li>
<li>The <code>callback</code> is the function to run with the output; this is generally going to be <code>FUNCTION_LIBRARY.createHistory</code>.</li>
</ul>
</li>
<li>Wrap the contents of the function in a <code>try { } catch (error) { }</code>.
<ul>
<li>The default error handler is: <code>callback({icon: icon, error: true, message: "I was unable to " + arguments.callee.name + ".", html: "&lt;h2&gt;Unknown error in &lt;b&gt;" + arguments.callee.name + "&lt;/b&gt;:&lt;/h2&gt;" + error})</code></li>
</ul>
</li>
<li>Identify the <code>icon</code> to display in the response.
<ul>
<li>This should be in the format <code>\&\#x1f426;</code> where the characters between <code>x</code> and <code>;</code> represent the HTML code for an emoji character.</li>
</ul>
</li>
<li>Format the <code>remainder</code> as necessary, such as <code>.trim()</code> or using a <code>.replace(/some regex/gi, "")</code>.</li>
<li>Perform the action logic, including accessing external APIs.
<ul>
<li>Generally, use a "<code>error</code> → <code>callback</code> and <code>return</code>" structure. For example, check for a required configuration before attempting to use it, and callback with an error message if it's missing.</li>
<li>Use <code>FUNCTION_LIBRARY</code> functions wherever possible, such as <code>proxyRequest</code> to have the server make an API request, or <code>getDigits</code> to transform number words ("one") into numerals (1).</li>
<li>If the action requires multiple steps, set <code>CONTEXT_LIBRARY.flow</code> to the name of this function, and store all temporary information within a new object at <code>CONTEXT_LIBRARY[name of this functon]</code>. Make sure to <code>delete</code> this and unset the <code>flow</code> at the end.</li>
</ul>
</li>
<li>Format the output. This will usually be: <code>callback({icon: icon, message: message, html: responseHTML})</code> <i>(See the Response Structure section for more options.)</i></li>
</ul>
</blockquote>
<br><br><br>

<hr>
<h2>ACCESSING EXTERNAL DATA</h2>
<blockquote>
Many of bluejay's actions require fetching information from external data sources.
<br><br>

<h3>HTML/XML/RSS</h3>
<blockquote>
Some actions can get information from a publicly accessible HTML page, or an XML or RSS feed:
<br><br>

<h4>Etymonline</h4>
<ul>
<li>"find etymology" → https://www.etymonline.com/word/<b>{search}</b></li>
</ul>

<h4>The Free Dictionary</h4>
<ul>
<li>"define idiom" → https://www.thefreedictionary.com/_/partner.aspx?Set=idioms&Word=<b>{search}</b></li>
</ul>

<h4>Snapple Facts</h4>
<ul>
<li>"get a fact" → https://www.snapple.com/real-facts/</li>
</ul>

<h4>Various RSS Feeds</h4>
<ul>
<li>"get the latest post" →  RSS feeds</li>
<li>"get a random post" → RSS feeds</li>
<li>"get all posts" → RSS feeds</li>
<li>"get the headlines" → RSS feeds</li>
</ul>
</blockquote>
<br>

<h3>Open APIs</h3>
<blockquote>
Other actions involve fetching information from an external API. Several of these APIs require no authentication, and will therefore work right out of the box:
<br><br>

<h4>DataMuse</h4>
<ul>
<li>"get rhymes" → https://api.datamuse.com/words?rel_rhy=<b>{search}</b></li>
<li>"get synonyms" → https://api.datamuse.com/words?rel_syn=<b>{search}</b></li>
<li>"get antonyms" → https://api.datamuse.com/words?rel_ant=<b>{search}</b></li>
<li>"get definition" → https://api.datamuse.com/words?md=d&sp=<b>{search}</b></li>
</ul>

<h4>PoetryDB</h4>
<ul>
<li>"get a poem" → https://poetrydb.org/random</li>
</ul>

<h4>ICanHazDadJoke</h4>
<ul>
<li>"get a joke" → https://icanhazdadjoke.com/slack</li>
</ul>

<h4>Forismatic</h4>
<ul>
<li>"get a quote" → http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en</li>
</ul>

<h4>Yerkee</h4>
<ul>
<li>"get a fortune" → http://yerkee.com/api/fortune</li>
</ul>

<h4>Complimentr</h4>
<ul>
<li>"get a compliment" → https://complimentr.com/api</li>
</ul>

<h4>EvilInsult</h4>
<ul>
<li>"get an insult" → https://evilinsult.com/generate_insult.php?lang=en&type=json</li>
</ul>

<h4>Trivia</h4>
<ul>
<li>"play true or false" → https://opentdb.com/api.php?amount=10&type=boolean</li>
</ul>

<h4>Wikipedia</h4>
<ul>
<li>"get a wikipedia entry" → https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=<b>{search}</b> & https://en.wikipedia.org/w/api.php?action=parse&format=json&utf8=1&page=<b>{search}</b></li>
<li>"get this day in history" → https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&utf8=1&srsearch=<b>{search}</b> & https://en.wikipedia.org/w/api.php?action=parse&format=json&utf8=1&page=<b>{search}</b></li>
</ul>

<h4>Open Library</h4>
<ul>
<li>"get a book" → http://openlibrary.org/search.json?q=<b>{search}</b></li>
</ul>

<h4>OpenTrivia Database</h4>
<ul>
<li>"play true or false" → https://opentdb.com/api.php?amount=10&type=boolean</li>
</ul>

<h4>Random Word API</h4>
<ul>
<li>"play hangman" → http://random-word-api.herokuapp.com/word?number=100</li>
</ul>

<h4>Mad Libz</h4>
<ul>
<li>"play mad libs" → http://madlibz.herokuapp.com/api/random?minlength=5&maxlength=25</li>
</ul>

<h4>Sunrise-Sunset</h4>
<ul>
<li>"get the sunrise" → https://api.sunrise-sunset.org/json?lat=<b>{lat}</b>&lng=<b>{long}</b>&date=<b>{date}</b></li>
<li>"get the sunset" → https://api.sunrise-sunset.org/json?lat=<b>{lat}</b>&lng=<b>{long}</b>&date=<b>{date}</b></li>
</ul>

<h4>MBTA API</h4>
<ul>
<li>"get metro predictions" → https://api-v3.mbta.com/predictions?sort=stop_sequence&include=stop&filter[route]=<b>{id}</b> & https://api-v3.mbta.com/alerts?filter[route]=<b>{id}</b></li>
</ul>

<h4>JamesMayr.com</h4>
<ul>
<li><i>(Note: These are Firebase Custom Functions I created, adapted from my own projects.)</i></li>
<li>"convert" → https://us-central1-projects-3bd0e.cloudfunctions.net/unitconverter?quantity=<b>{quantity}</b>&from=<b>{unit}</b>&to=<b>{unit}</b></li>
<li>"find factors" → https://us-central1-projects-3bd0e.cloudfunctions.net/factorfinder?number=<b>{search}</b></li>
<li>"analyze chord" → https://us-central1-projects-3bd0e.cloudfunctions.net/chordanalyzer?notes=<b>{search}</b></li>
<li>"shuffle word" → https://us-central1-projects-3bd0e.cloudfunctions.net/wordshuffler?word=<b>{search}</b></li>
<li>"convert base" → https://us-central1-projects-3bd0e.cloudfunctions.net/baseconverter?numberString=<b>{quantity}</b>oldBase=<b>{oldBase}</b>&newBase=<b>{newBase}</b></li>
<li>"encrypt message" → https://us-central1-projects-3bd0e.cloudfunctions.net/messageencrypter?action=encrypt&message=<b>{message}</b>&keyword=<b>{keyword}</b></li>
<li>"decrypt message" → https://us-central1-projects-3bd0e.cloudfunctions.net/messageencrypter?action=decrypt&message=<b>{message}</b>&keyword=<b>{keyword}</b></li>
</ul>
</blockquote>
<br>

<h3>APIs Requiring an Account</h3>
<blockquote>
Other APIs will require you to create a developer account and add your credentials into LocalStorage, either using the "change configuration" action or by uploading a JSON file through the interface.
<br><br>

<h4>IFTTT</h4>
<ul>
<li>actions:
<ul>
<li>"trigger ifttt" → https://maker.ifttt.com/trigger/bluejay_<b>{command}</b>/with/key/<b>{ifttt key}</b> with optional body <code>{"value1": number}</code></li>
<li>"turn on ifttt device" → https://maker.ifttt.com/trigger/bluejay_<b>{command}</b>_on/with/key/<b>{ifttt key}</b></li>
<li>"turn off ifttt device" → https://maker.ifttt.com/trigger/bluejay_<b>{command}</b>_off/with/key/<b>{ifttt key}</b></li>
<li>"toggle ifttt device" → https://maker.ifttt.com/trigger/bluejay_<b>{command}</b>_toggle/with/key/<b>{ifttt key}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="https://ifttt.com">https://ifttt.com</a></li>
<li>Connect your other accounts, such as Philips Hue or SmartLife.</li>
<li>Navigate to <a target="_blank" href="https://ifttt.com/create">https://ifttt.com/create</a> to create a new applet.</li>
<li>For "THIS" use the <b>Webhooks</b> service. Select <b>Receive a web request.</b>. Name the event: bluejay_<b>{command}</b>. Your command should use underscores instead of spaces, and it should end with "on", "off", or "toggle". Example: <b>bluejay_kitchen_lights_on</b></li>
<li>For "THAT" select your external service, then select the action from the available list, and select any settings within the menus.</li>
<li>Save this and finish.</li>
<li>After creating your commands, go to the Webhooks settings at <a target="_blank" href="https://ifttt.com/maker_webhooks/settings">https://ifttt.com/maker_webhooks/settings</a>. Your key is the last part of the URL shown: https://maker.ifttt.com/use/<b>{your key}</b>.</li>
<li>Save your key in bluejay as <code>ifttt key</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Open Weather</h4>
<ul>
<li>actions:
<ul>
<li>"get the weather" → https://api.openweathermap.org/data/2.5/forecast?appid=<b>{key}</b>&q=<b>{search}</b>,us&mode=json&units=imperial</li>
<li>"get todays weather" → https://api.openweathermap.org/data/2.5/forecast?appid=<b>{key}</b>&q=<b>{search}</b>,us&mode=json&units=imperial</li>
<li>"get tomorrows weather" → https://api.openweathermap.org/data/2.5/forecast?appid=<b>{key}</b>&q=<b>{search}</b>,us&mode=json&units=imperial</li>
<li>"get a days weather" → https://api.openweathermap.org/data/2.5/forecast?appid=<b>{key}</b>&q=<b>{search}</b>,us&mode=json&units=imperial</li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="https://home.openweathermap.org/users/sign_up">https://home.openweathermap.org/users/sign_up</a></li>
<li>Save your key as <code>open weather api</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Spoonacular</h4>
<ul>
<li>actions:
<ul>
<li>"get nutrition facts" → https://api.spoonacular.com/recipes/guessNutrition?apiKey=<b>{key}</b>&title=<b>{search}</b></li>
<li>"get nutrition answer" → https://api.spoonacular.com/recipes/quickAnswer?apiKey=<b>{key}</b>&title=<b>{search}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="https://spoonacular.com/food-api/console">https://spoonacular.com/food-api/console</a></li>
<li>Save your key as <code>spoonacular api</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Alphavantage</h4>
<ul>
<li>actions:
<ul>
<li>"get stock price" → https://www.alphavantage.co/query?apikey=<b>{key}</b>&function=SYMBOL_SEARCH&keywords=<b>{search}</b> & https://www.alphavantage.co/query?apikey=<b>{key}</b>&function=TIME_SERIES_DAILY&symbol=<b>{symbol}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="https://www.alphavantage.co/support/#api-key">https://www.alphavantage.co/support/#api-key</a></li>
<li>Save your key as <code>alphavantage api</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Online Movie Database</h4>
<ul>
<li>actions:
<ul>
<li>"get a movie" → https://www.omdbapi.com/?apikey=<b>{key}</b>&s=<b>{search}</b> & https://www.omdbapi.com/?apikey=<b>{key}</b>&plot=full&i=<b>{id}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="http://www.omdbapi.com/apikey.aspx">http://www.omdbapi.com/apikey.aspx</a></li>
<li>Save your key as <code>omdb api</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Stands4</h4>
<ul>
<li>actions:
<ul>
<li>"find lyrics" → https://www.stands4.com/services/v2/lyrics.php?format=json&uid=<b>{stands4 id}</b>&tokenid=<b>{stands4 api key}</b>&term=<b>{title search}</b>&artist=<b>{artist search}</b> → https://www.lyrics.com/db-print.php?id=<b>{song id}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a free account: <a target="_blank" href="https://www.lyrics.com/api.php">https://www.lyrics.com/api.php</a></li>
<li>Save your user id as <code>stands4 id</code>.</li>
<li>Save your token as <code>stands4 api key</code>.</li>
</ol>
</li>
</ul>
<br>

<h4>Google APIs</h4>
<ul>
<li>actions:
<ul>
<li>"get the time" → https://maps.googleapis.com/maps/api/geocode/json?key=<b>{key}</b>&address=<b>{search}</b> & https://maps.googleapis.com/maps/api/timezone?key=<b>{key}</b>&location=<b>{lat,long}</b>&timestamp=<b>{seconds}</b></li>
<li>"get the sunrise" → https://maps.googleapis.com/maps/api/geocode/json?key=<b>{key}</b>&address=<b>{search}</b></li>
<li>"get the sunset" → https://maps.googleapis.com/maps/api/geocode/json?key=<b>{key}</b>&address=<b>{search}</b></li>
<li>"google geolocate" → https://maps.googleapis.com/maps/api/geocode/json?key=<b>{key}</b>&address=<b>{search}</b></li>
<li>"search google directions" → https://maps.googleapis.com/maps/api/directions/json?key=<b>{key}</b>&origin=<b>{search}</b>&destination=<b>{search}</b></li>
<li>"search google places" → https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=<b>{key}</b>&inputtype=textquery&fields=place_id&input=<b>{search}</b> & https://maps.googleapis.com/maps/api/place/details/json?key=<b>{key}</b>&inputtype=textquery&fields=name,photo,url,website,formatted_phone_number,formatted_address,geometry,opening_hours&place_id=<b>{id}</b></li>
<li>"search youtube" → https://www.googleapis.com/youtube/v3/search?key=<b>{key}</b>&part=snippet&type=video&videoEmbeddable=true&maxResults=10&order=viewCount&q=<b>{search}</b></li>
<li>"google translate" → https://translation.googleapis.com/language/translate/v2?key=<b>{key}</b>&q=<b>{search}</b>&target=<b>{languageCode}</b></li>
<li>"search google timezone" → https://maps.googleapis.com/maps/api/geocode/json?key=<b>{key}</b>&address=<b>{search}</b> & https://maps.googleapis.com/maps/api/timezone/json?key=<b>{key}</b>&location=<b>{lat,long}</b>&timestamp=<b>{seconds}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Use your existing Google account or create one here: <a target="_blank" href="https://www.google.com/">https://www.google.com/</a></li>
<li>Create a new project on Google API Console: <a target="_blank" href="https://console.developers.google.com/projectcreate">https://console.developers.google.com/projectcreate</a></li>
<li>Enable the APIs you want to use: <a target="_blank" href="https://console.developers.google.com/apis/library">https://console.developers.google.com/apis/library</a></li>
<li>Go to <a target="_blank" href="https://console.developers.google.com/apis/credentials">https://console.developers.google.com/apis/credentials</a> and create a new key. Set <code>Application restrictions</code> to <code>None</code> and <code>API restrictions</code> to <code>Don't restrict key</code>.</li>
<li>Save the API Key as <code>google api key</code>. <i>Note that this is free for 1 year, but costs pennies after that.</i></li>
</ol>
</li>
</ul>
<br>

<h4>Google Custom Search</h4>
<ul>
<li>actions:
<ul>
<li>"search google" → <b>{custom search url}</b>&key=<b>{key}</b>&q=<b>{search}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Use your existing Google account or create one here: <a target="_blank" href="https://www.google.com/">https://www.google.com/</a></li>
<li>Create a new Custom Search Engine here: <a target="_blank" href="https://cse.google.com/cse/all">https://cse.google.com/cse/all</a></li>
<li>Add a new search engine to search any random website, such as https://www.example.com.</li>
<li>Edit the search engine to remove this website from "Sites to search".</li>
<li>Instead, set "Search the entire web" to <code>ON</code>.</li>
<li>Save your "Public URL" as <code>google custom search</code>.</li>
<li>You will also need the <code>google api key</code> from above.</li>
</ol>
</li>
</ul>
</blockquote>
<br>

<h3>Creating an API with Google Apps Script</h3>
<blockquote>
If you're anything like me, you have a lot of information within Google applications, such as Docs, Sheets, Gmail, Calendar, and Contacts. For that, you can create use Google Apps Script to publish a script to the web to serve as an API endpoint into your account.
<ul>
<li>actions:
<ul>
<li>"edit wish list" → <b>{url}</b>&action=listWish&item=<b>{name}</b>&cost=<b>{cost}</b>&type=<b>{type}</b>b></li>
<li>"get balance" → <b>{url}</b>&action=getBalance&account=<b>{name}</b></li>
<li>"log purchase" → <b>{url}</b>&action=logPurchase&category=<b>{name}</b>&description=<b>{description}</b>&amount=<b>{cost}</b></li>
<li>"fetch calendar" → <b>{url}</b>&action=fetchEvents&startDate=<b>{date}</b>&endDate=<b>{date}</b></li>
<li>"find event" → <b>{url}</b>&action=findEvent&name=<b>{name}</b></li>
<li>"add event" → <b>{url}</b>&action=addEvent&title=<b>{name}</b>&startDate=<b>{startDate}</b>&startTime=<b>{startTime}</b>&endDate=<b>{endDate}</b>&endTime=<b>{endTime}</b>&location=<b>{location}</b></li>
<li>"get a list" → <b>{url}</b>&action=getList&list=<b>{name}</b></li>
<li>"add an item to a list" → <b>{url}</b>&action=addTask&list=<b>{name}</b>&task=<b>{description}</b></li>
<li>"get contacts" → <b>{url}</b>&action=getContacts&name=<b>{name}</b></li>
<li>"get birthday" → <b>{url}</b>&action=getContacts&name=<b>{name}</b></li>
<li>"get phone number" → <b>{url}</b>&action=getContacts&name=<b>{name}</b></li>
<li>"get email" → <b>{url}</b>&action=getContacts&name=<b>{name}</b></li>
<li>"get address" → <b>{url}</b>&action=getContacts&name=<b>{name}</b></li>
<li>"draft email" → <b>{url}</b>&action=draftEmail&recipient=<b>{name}</b>&subject=<b>{subject}</b>&body=<b>{body}</b></li>
<li>"log gratitude" → <b>{url}</b>&action=logGratitude&text=<b>{text}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Use your existing Google account or create one here: <a target="_blank" href="https://www.google.com/">https://www.google.com/</a></li>
<li>Go to <a target="_blank" href="https://script.google.com/home/my">https://script.google.com/home/my</a> to create a new script.</li>
<li>See below for an example script that would fetch your Google Tasks. Note that this involves generating a secret key to send along with each request, ensuring only you can access this.</li>
<li>Save the script and select <code>Publish > Deploy as a web app...</code></li>
<li>Set <code>Execute the app as:</code> to yourself and <code>Who has access to the app:</code> to <code>Anyone, even anonymous</code>. For <code>Project version:</code>, select <code>New</code> and add a commit message, then click <code>Update</code>.</li>
<li>Approve whatever new access the application needs. Your browser may warn you that this is unsafe, because it's an unknown developer... but that "unknown developer" is you. So proceed anyway.</li>
<li>For each script, save the public url as <code>google apps script</code> or <code>google apps script {#}</code>. (I use one script url, with <code>?action=</code> as a query parameter.)</li>
</ol>
</li>
</ul>

<pre>
function doGet(event) {
  if (event && event.parameter && event.parameter.key == {secret key}) {
    if (event.action == "getList") {
      return ContentService.createTextOutput(JSON.stringify(getList(event)))
    }
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Unknown action."
    }))
  }
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: "Unauthorized."
  }))
}

function getList(event) {
  var allLists = Tasks.Tasklists.list()
  var listName = (event.parameter.list || "Default List").toLowerCase().trim()
      
  for (var i in allLists.items) {
    if (allLists.items[i].title.toLowerCase().trim() == listName) {
      var list = allLists.items[i]
      break
    }
  }
      
  if (list) {
    var listContents = Tasks.Tasks.list(list.id) || {items: []}
    return {success: true, listName: list.title, list: listContents.items}
  }
  return {success: false, message: "Unknown list."}
}
</pre>
</blockquote>
<br><br>

<h3>APIs Requiring Oauth</h3>
<blockquote>
Finally, some APIs require Oauth, because you could be writing information to a user's account (yours, presumably). Broadly speaking, Oauth involves sending users to another platform's website where they authenticate and are then redirected back to your site. Of course, since bluejay lives at <code>localhost</code>, that doesn't work. Here's the bizarre workaround I engineered:
<ol>
<li>Parse the user response or look in the <code>CONFIGURATION_LIBRARY</code> for the platform's <code>key</code>, <code>secret</code>, and <code>redirect</code>.</li>
<li>Create a popup window of the platform's auth screen; the <code>state</code> query param will include the bluejay url and platform API <code>key</code> and/or <code>secret</code>, encrypted as required for later.</li>
<li>The user (also you) clicks through and completes the auth flow in the popup window.</li>
<li>The external platform then redirects the popup to the <code>redirect</code> parameter, which must match the one on file in your developer settings. Believe it or not, I'm using a Google Apps Script for this. The platform will send the authorization <code>code</code> as a query parameter.</li>
<li>I have a Google Apps Script that captures and logs this request. It splits the <code>state</code> parameter into the bluejay url and the platform API <code>secret</code>, and uses the authorization <code>code</code> parameter sent from the platform.</li>
<li>The Google Apps Script page returns a tiny HTML page with a &lt;script&gt; that automatically redirects to bluejay's <code>/authorization</code> endpoint, with an <code>embeddedPost</code> parameter.</li>
<li>This page sends uses proxyRequest to send the <code>embeddedPost</code>  to the bluejay server, which sends an API request to the external platform with the authorization <code>code</code> received earlier.</li>
<li>The platform finally responds with the actual <code>access_token</code>, <code>refresh_token</code>, and <code>expiration</code>.</li>
<li>The bluejay server sends these results back to the /authorization page, which immediately stores them in localStorage.</li>
<li>The main bluejay window has actually been checking localStorage this whole time, and now that there is a value set for this data, the page finally saves these values to <code>CONFIGURATION_LIBRARY</code>.</li>
<li>It also announces that it was a success, and automatically closes the popup window from before.</li>
</ol>
<br>

<h4>Wink</h4>
<ul>
<li>actions:
<ul>
<li>"authorize platform" → https://api.wink.com/oauth2/authorize</li>
<li>"get wink devices" → https://api.wink.com/users/me/wink_devices?client_id=<b>{key}</b>&client_secret=<b>{secret}</b></li>
<li>"set wink device" → https://api.wink.com/<b>{type}</b>s/<b>{id}</b>/desired_state?client_id=<b>{key}</b>&client_secret=<b>{secret}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a Google Apps Script to handle Oauth redirects (see below).</li>
<li>Go to <a target="_blank" href="https://developer.wink.com/clients">https://developer.wink.com/clients</a> and create an account.</li>
<li>Click <code>NEW</code> to start a new application.</li>
<li>Save the Google Apps Script url to <code>REDIRECT URIS</code> on the developer page.</li>
<li>Save Client ID as <code>wink key</code>, Client Secret as <code>wink secret</code>, and this Google Apps Script url as <code>wink redirect</code>.</li>
<li>Say "authorize wink" and follow the Oauth flow as a user.</li>
</ol>
</li>
</ul>

<pre>
function doGet(event) { return authorize(event) }
function doPost(event) { return authorize(event) }
function authorize(event) {
  try {  
    var code = event.parameter.code || ""
    var state = (event.parameter.state || "").split(";;;") || []
    var bluejayUrl = state[0].replace("http://","https://")
    var authorization = state[1]
  
    var postUrl = "https://api.wink.com/oauth2/token"
    var data = {
      "method": "post",
      "url": postUrl,
      "Content-Type": "application/json",
      "body": {
        "grant_type": "authorization_code",
        "code": code,
        "client_secret": authorization
      }
    }
   
    var link = bluejayUrl + "authorization?embeddedPost=" +
      encodeURIComponent(JSON.stringify(data))
    var response = HtmlService.createHtmlOutput("Redirecting to&lt;br&gt;" +
      "&lt;a href='" + link + "'&gt;" + link + "&lt;/a&gt;" + 
      "&lt;script&gt;window.onload = function() { " + 
      "window.location = '" + link + "'" + 
      " }&lt;/script&gt;")
        response.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    return response
  }
  catch (error) {
    return ContentService.createTextOutput(error)
  }
}
</pre>
<br>

<h4>Sonos</h4>
<ul>
<li>actions:
<ul>
<li>"authorize platform" → https://api.sonos.com/login/v3/oauth</li>
<li>"get sonos devices" → https://api.ws.sonos.com/control/api/v1/households & https://api.ws.sonos.com/control/api/v1/households/<b>{id}</b>/groups</li>
<li>"set sonos devices" → https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/playback/play & https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/playback/pause & https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/playback/skipToNextTrack & https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/playback/skipToPreviousTrack & https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/groupVolume/relative & https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/groupVolume & https://api.ws.sonos.com/control/api/v1/players/<b>{id}</b>/playerVolume/relative & https://api.ws.sonos.com/control/api/v1/players/<b>{id}</b>/playerVolume</li>
<li>"get now playing on sonos" → https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/playbackMetadata</li>
<li>"get favorites on sonos" → https://api.ws.sonos.com/control/api/v1/households/<b>{id}</b>/favorites</li>
<li>"play favorite on sonos" → https://api.ws.sonos.com/control/api/v1/groups/<b>{id}</b>/favorites</li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a Google Apps Script to handle Oauth redirects (see below).</li>
<li>Go to <a target="_blank" href="https://integration.sonos.com/users/sign_up">https://integration.sonos.com/users/sign_up</a> and create an account.</li>
<li>On <a target="_blank" href="https://integration.sonos.com/integrations">https://integration.sonos.com/integrations</a>, click <code>New control integration</code>.</li>
<li>Save the Google Apps Script url to <code>Redirect URIs</code> on the Credentials page.</li>
<li>Save Key as <code>sonos key</code>, Secret as <code>sonos secret</code>, and this Google Apps Script url as <code>sonos redirect</code>.</li>
<li>Say "authorize sonos" and follow the Oauth flow as a user.</li>
</ol>
</li>
</ul>

<pre>
function doGet(event) { return authorize(event) }
function doPost(event) { return authorize(event) }
function authorize(event) {
  try {  
    var code = event.parameter.code || ""
    var state = (event.parameter.state || "").split(";;;") || []
    var bluejayUrl = state[0].replace("http://","https://")
    var authorization = state[1]
  
    var redirectURI = encodeURIComponent({this Google Apps Script's public url})
    var postUrl = "https://api.sonos.com/login/v3/oauth/access?grant_type=authorization_code&code=" +
      code + "&redirect_uri=" + redirectURI
    var data = {
      "method": "post",
      "url": postUrl,
      "Authorization": "Basic " + authorization,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
   
    var link = bluejayUrl + "authorization?embeddedPost=" +
      encodeURIComponent(JSON.stringify(data))
    var response = HtmlService.createHtmlOutput("Redirecting to&lt;br&gt;" +
      "&lt;a href='" + link + "'&gt;" + link + "&lt;/a&gt;" + 
      "&lt;script&gt;window.onload = function() { " + 
      "window.location = '" + link + "'" + 
      " }&lt;/script&gt;")
        response.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    return response
  }
  catch (error) {
    return ContentService.createTextOutput(error)
  }
}
</pre>
<br>

<h4>Reddit</h4>
<ul>
<li>actions:
<ul>
<li>"authorize platform" → https://www.reddit.com/api/v1/authorize</li>
<li>"get a reddit post" → https://oauth.reddit.com/r/<b>{subreddit}</b></li>
</ul>
</li>
<li>setup:
<ol>
<li>Create a Google Apps Script to handle Oauth redirects (see below).</li>
<li>Go to <a target="_blank" href="https://reddit.com/">https://reddit.com/</a> and create an account.</li>
<li>Go to <a target="_blank" href="https://www.reddit.com/prefs/apps/">https://www.reddit.com/prefs/apps/</a> and click<code>"create app...</code>.</li>
<li>Save the Google Apps Script url to <code>redirect uri</code> on the developer page.</li>
<li>Save the random string below the application name as <code>reddit key</code>, secret as <code>reddit secret</code>, and this Google Apps Script url as <code>reddit redirect</code>.</li>
<li>Say "authorize reddit" and follow the Oauth flow as a user.</li>
</ol>
</li>
</ul>

<pre>
function doGet(event) { return authorize(event) }
function doPost(event) { return authorize(event) }
function authorize(event) {
  try {
    var code = event.parameter.code || ""
    var state = (event.parameter.state || "").split(";;;") || []
    var bluejayUrl = state[0].replace("http://","https://")
    var authorization = state[1]
    
    var redirectURI = encodeURIComponent({this Google Apps Script's public url}) 
    var postUrl = "https://www.reddit.com/api/v1/access_token?grant_type=authorization_code&code=" +
      code + "&redirect_uri=" + redirectURI
    var data = {
      "method": "post",
      "url": postUrl,
      "Authorization": "Basic " + authorization,
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
   
    var link = bluejayUrl + "authorization?embeddedPost=" +
      encodeURIComponent(JSON.stringify(data))
    var response = HtmlService.createHtmlOutput("Redirecting to&lt;br&gt;" +
      "&lt;a href='" + link + "'&gt;" + link + "&lt;/a&gt;" + 
      "&lt;script&gt;window.onload = function() { " + 
      "window.location = '" + link + "'" + 
      " }&lt;/script&gt;")
        response.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    return response
  }
  catch (error) {
    return ContentService.createTextOutput(error)
  }
}
</pre>
</blockquote>
</blockquote>
