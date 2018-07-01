var builder = require('botbuilder');
const express = require('express');
const greeting = require('./app/recognizer/greeting');
const commands = require('./app/recognizer/commands');
const smiles = require('./app/recognizer/smiles');

const dialog = {
  welcome: require('./app/dialogs/welcome'),
  categories: require('./app/dialogs/categories'),
  explore: require('./app/dialogs/explore'),
  showProduct: require('./app/dialogs/showProduct'),
  choseVariant: require('./app/dialogs/choseVariant'),
  showVariant: require('./app/dialogs/showVariant'),
  addToCart: require('./app/dialogs/addToCart'),
  showCart: require('./app/dialogs/showCart')
};

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, {
  persistConversationData: true
});

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cbc3ade-21f3-4b54-8379-10b32c39475c?subscription-key=a824d32eec8e4f5fad56b89574deb811'
var intents = new builder.IntentDialog({
  recognizers: [
    commands,
    greeting,
    new builder.LuisRecognizer(model)//process.env.LUIS_ENDPOINT)
  ],
  intentThreshold: 0.2,
  recognizeOrder: builder.RecognizeOrder.series
});

intents.matches('Greeting', '/welcome');
intents.matches('ShowTopCategories', '/categories');
intents.matches('Search', '/explore');
intents.matches('Next', '/next');
intents.matches('ExploreProduct', '/showProduct');
intents.matches('AddToCart', '/addToCart');
intents.matches('ShowCart', '/showCart');
intents.matches('Checkout', '/checkout');
intents.matches('Reset', '/reset');
intents.matches('Smile', '/smileBack');
intents.onDefault('/confused');

bot.dialog('/', intents);
dialog.welcome(bot);
dialog.categories(bot);
dialog.explore(bot);
dialog.showProduct(bot);
dialog.choseVariant(bot);
dialog.showVariant(bot);
dialog.addToCart(bot);
dialog.showCart(bot);

bot.dialog('/confused', [
  function(session, args, next) {
    // ToDo: need to offer an option to say "help"
    if (session.message.text.trim()) {
      session.endDialog(
        "Sorry, I didn't understand you or maybe just lost track of our conversation"
      );
    } else {
      session.endDialog();
    }
  }
]);

bot.on('routing', smiles.smileBack.bind(smiles));

bot.dialog('/reset', [
  function(session, args, next) {
    session.endConversation(['See you later!', 'bye!']);
  }
]);

bot.dialog('/checkout', [
  function(session, args, next) {
    const cart = session.privateConversationData.cart;

    if (!cart || !cart.length) {
      session.send(
        'I would be happy to check you out but your cart appears to be empty. Look around and see if you like anything'
      );
      session.reset('/categories');
    } else {
      session.endDialog('Alright! You are all set!');
    }
  }
]);

const app = express();

app.get(`/`, (_, res) => res.sendFile(path.join(__dirname + '/index.html')));
app.post('/api/messages', connector.listen());

app.listen(process.env.PORT || process.env.port || 3978, () => {
  console.log('Express HTTP is ready and is accepting connections');
});


// // Setup Restify Server
// var server = restify.createServer();
// server.listen(process.env.port || process.env.PORT || 3978, function () {
//    console.log('%s listening to %s', server.name, server.url); 
// });

// // Create chat connector for communicating with the Bot Framework Service
// var connector = new builder.ChatConnector({
//     appId: process.env.MicrosoftAppId,
//     appPassword: process.env.MicrosoftAppPassword
// });

// // Listen for messages from users 
// server.post('/api/messages', connector.listen());
// var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cbc3ade-21f3-4b54-8379-10b32c39475c?subscription-key=0ea014db136845feb12005633d5c405a&spellCheck=true&bing-spell-check-subscription-key={b74fea214c3b419485447ea3ad6a5d0a}&verbose=true&timezoneOffset=0&q=';
// var bot = new builder.UniversalBot(connector, function (session) {
//     session.send("Hi! I'm Kraya and I'm an Shpooing Assistant. ");
//     initializeConversationData(session);

//     session.beginDialog("OptionPrompt");

// });

// var recognizer = new builder.LuisRecognizer(model)
// var dialog = new builder.IntentDialog({ recognizers: [recognizer] })
// const greetings = [
//   "Hi I'm Kraya",
//   'hi there,this is Kraya',
//   'heyyy! This is Kraya',
//   "hey there! I'm Krayaa",
//   "hello beautiful face!I'm Kraya",
//   'hello hello, Kraya here',
//   "hello there, I'm Kraya",
//   'hey! Im Kraya!,what up',
//   "hey!I'm Kraya..what's up",
//   'Hey! whatup',
//   'Salute',
//   'Hi! how are you',
// ];
// bot.dialog('/', dialog)

// console.log(dialog)
// dialog.matches('Greetings', function (session, results) {
//     const pickRandom = require('pick-random');
//     session.send("%s",pickRandom(greetings));
//     //session.send('Hello I am Kraya! What can I do for you today?');
// })

// dialog.matches('Search', function (session, args,next) {
//     var intent  = args.intent;
// //    session.send("%s",intent);
//     var item = builder.EntityRecognizer.findEntity(args.intent.entities, 'Item')
//      if (!item) {
//             builder.Prompts.text(session, "Sure! Take a look at these");
//      } else{
//             next({ response: item.entity });
//      }
// })

// bot.dialog('/confused', [
//     function(session, args, next) {
//       // ToDo: need to offer an option to say "help"
//       if (session.message.text.trim()) {
//         session.endDialog(
//           "Sorry, I didn't understand you or maybe just lost track of our conversation"
//         );
//       } else {
//         session.endDialog();
//       }
//     }
//   ]);
  

// dialog.matches('Traits', function (session, args, results) {
//     session.send('I feel the same');
// })

// dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));
