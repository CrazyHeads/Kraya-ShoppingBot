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

module.exports = function(bot) {
  bot.dialog('/welcome', [
    function(session, args, next) {
      const lastVisit = session.userData.lastVisit;

     // session.send(greetings);
      if (!lastVisit) {
        session.send('Can i ask you a question?');
        session.userData = Object.assign({}, session.userData, {
           lastVisit: new Date()
         });
         session.save();
         session.endDialog();
      }
         //session.sendTyping();
        // session.endDialog();
      //   if (session.message.text.trim().equals("yes")) {
      //     var msg = new builder.Message(session);
    	//     msg.attachmentLayout(builder.AttachmentLayout.carousel)
    	//     msg.attachments([
      //     new builder.HeroCard(session)
      //       .title("")
      //       .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\gaming.png')])
      //       .buttons([
      //           builder.CardAction.imBack(session, "Gaming", "Gaming")
      //       ]),
      //     new builder.HeroCard(session)
      //       .title("")
      //       .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\youtube.jpeg')])
      //       .buttons([
      //           builder.CardAction.imBack(session, "youtube", "youtube")
      //       ]),
      //       new builder.HeroCard(session)
      //       .title("")
      //       .images([builder.CardImage.create(session, 'C:\Users\mypc\Kraya-ShoppingBot\pictures\photography.jpeg')])
      //       .buttons([
      //           builder.CardAction.imBack(session, "photography", "photography")
      //       ])
      //   ]);
      //   session.send(msg).endDialog();
      //  }
      else {
        session.endDialog("glad youre back!")
      }
      //session.endDialog('How can I help you?');
    }
  ]);
};
