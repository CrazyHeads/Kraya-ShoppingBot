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
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cbc3ade-21f3-4b54-8379-10b32c39475c?subscription-key=0ea014db136845feb12005633d5c405a&spellCheck=true&bing-spell-check-subscription-key={b74fea214c3b419485447ea3ad6a5d0a}&verbose=true&timezoneOffset=0&q=';
var bot = new builder.UniversalBot(connector)
var recognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({ recognizers: [recognizer] })
const greetings = [
  "Hi I'm Kraya",
  'hi there,this is Kraya',
  'heyyy! This is Kraya',
  "hey there! I'm Krayaa",
  "hello beautiful face!I'm Kraya",
  'hello hello, Kraya here',
  "hello there, I'm Kraya",
  'hey! Im Kraya!,what up',
  "hey!I'm Kraya..what's up",
  'Hey! whatup',
  'Salute',
  'Hi! how are you',
];
bot.dialog('/', dialog)
console.log(dialog)
dialog.matches('Greetings', function (session, results) {
    const pickRandom = require('pick-random');
    session.send("%s",pickRandom(greetings));
    //session.send('Hello I am Kraya! What can I do for you today?');
})

dialog.matches('Search', function (session, args,next) {
    var intent  = args.intent;
//    session.send("%s",intent);
    var item = builder.EntityRecognizer.findEntity(args.intent.entities, 'Item')
     if (!item) {
            builder.Prompts.text(session, "Sure! Take a look at these");
     } else{
            next({ response: item.entity });
     }
})

dialog.matches('Traits', function (session, args, results) {
    session.send('I feel the same');
})

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));
