var builder = require('botbuilder');
const express = require('express');
var restify = require('restify');

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

var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/3449f364-876f-4683-b4b5-99d5aa41f8c4?subscription-key=4862bf8ef9ce4c3588682fcaeff3d92a'
var intents = new builder.IntentDialog({
  recognizers: [
    commands,
    greeting,
    new builder.LuisRecognizer(model)
  ],
  intentThreshold: 0.2,
  recognizeOrder: builder.RecognizeOrder.series
});

intents.matches('Greeting', '/welcome');
intents.matches('ShowTopCategories', '/categories');
intents.matches('Explore', '/explore');
intents.matches('Next', '/next');
intents.matches('Search', '/showProduct');
intents.matches('AddToCart', '/addToCart');
intents.matches('ShowCart', '/showCart');
intents.matches('Checkout', '/checkout');
intents.matches('Reset', '/reset');
intents.matches('Smile', '/smileBack');
intents.onDefault('/confused');

bot.on('conversationUpdate', function (message) {
  if (message.membersAdded) {
      message.membersAdded.forEach(function (identity) {
          if (identity.id == message.address.bot.id) {
              // Bot is joining conversation
              // - For WebChat channel you'll get this on page load.
              var reply = new builder.Message()
                      .address(message.address)
                      .text("Hello! I'm Kraya. \n Your personal shopping assistant.");
              bot.send(reply);
          } 
      });
  }
  
});

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
    var reply = session.message.trim();
    if (reply == "yes") {
          var msg = new builder.Message(session);
    	    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    	    msg.attachments([
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\gaming.png')])
            .buttons([
                builder.CardAction.imBack(session, "Gaming", "Gaming")
            ]),
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\youtube.jpeg')])
            .buttons([
                builder.CardAction.imBack(session, "youtube", "youtube")
            ]),
            new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\photography.jpeg')])
            .buttons([
                builder.CardAction.imBack(session, "photography", "photography")
            ])
        ]);
        session.send(msg).endDialog();
    }
    else if (session.message.text.trim() == "Gaming") {
      session.endDialog("Nice Hobby");
    }
    else if (session.message.text.trim()) {
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


var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url); 
});
// const app = express(); 

// app.get(`/`, (_, res) => res.sendFile(path.join(__dirname + '/index.html')));
// app.post('/api/messages', connector.listen());

// app.listen(process.env.PORT || process.env.port || 3978, () => {
//   console.log('Express HTTP is ready and is accepting connections');
// });


