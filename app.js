var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/23c0c905-9354-4900-9feb-4175c4547caa?subscription-key=a824d32eec8e4f5fad56b89574deb811&spellCheck=true&bing-spell-check-subscription-key=1351bf4c6760405a9fa1f370084d2d39&verbose=true&timezoneOffset=330'
var bot = new builder.UniversalBot(connector)
var recognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({ recognizers: [recognizer] })

bot.dialog('/', dialog)
console.log(dialog)
dialog.matches('Greetings', function (session, results) {
    session.send('Hello I am Kraya!');
})


dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand.")); 