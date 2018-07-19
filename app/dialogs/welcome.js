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
              .create(session, 'https://www.billboard.com/files/styles/900_wide/public/media/Gaming-2017-billboard-1548.jpg')
              .tap(builder.CardAction.imBack(session, "Gaming", "Gaming"))]),
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage
              .create(session, 'http://www.cthulhuart.com/wp-content/uploads/2018/06/movie.jpg')
              .tap(builder.CardAction.imBack(session, "Youtube", "Youtube"))]),
          new builder.HeroCard(session)
            .title("")
            .images([builder.CardImage
              .create(session, 'https://petapixel.com/assets/uploads/2014/03/photog1.jpg')])
              .tap(builder.CardAction.imBack(session, "Photography", "Photography"))]
        );
        session.send(msg)//.endDialog();
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