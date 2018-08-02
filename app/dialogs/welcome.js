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
const builder = require('botbuilder');

module.exports = function(bot) {
  bot.dialog('/welcome', [
    function(session, args, next) {
      const lastVisit = session.userData.lastVisit;

     // session.send(greetings);
      if (!lastVisit) {
        //session.send('Pick a card!');
        session.userData = Object.assign({}, session.userData, {
           lastVisit: new Date()
         });
         session.save();
         var msg = new builder.Message(session)
          .text("Pick a card!")
          .suggestedActions(
              builder.SuggestedActions.create(
                      session, [
                          builder.CardAction.imBack(session, "Skip", "Skip")
                      ]
                    ));
         // session.send(msg);
          msg.attachmentLayout(builder.AttachmentLayout.carousel)
          msg.attachments([
            new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage
              .create(session, 'http://www.color-hex.com/palettes/1866.png')
              .tap(builder.CardAction.imBack(session, "White", "White"))]),
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage
              .create(session, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuk4V3qIvwq8NH_wu2UPcW4dSmWYYM4VeugRRCaTEkdqbdjrcY1w')
              .tap(builder.CardAction.imBack(session, "Black", "Black"))]),
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage
              .create(session, 'https://media.istockphoto.com/photos/metal-texture-red-background-picture-id453232543?k=6&m=453232543&s=612x612&w=0&h=pq2bIg-WUXgZWMdt8sOwXahL-NZNShX4q780jAlbAM4=')])
              .tap(builder.CardAction.imBack(session, "Red", "Red"))]
        );
        session.endDialog(msg)//.endDialog();
       // session.endDialog("Nice Hobby!");
        //session.endDialog();
      }
    
      else {
        session.endDialog("Glad, You are back!")
      }
      //session.endDialog('How can I help you?');
    }
  ]);
};