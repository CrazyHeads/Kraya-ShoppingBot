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

      session.send(greetings);

      if (!lastVisit) {
        session.send(
          'Our store carries bikes, parts, accessories, and sport clothing articles'
        );
        session.userData = Object.assign({}, session.userData, {
          lastVisit: new Date()
        });
        session.save();
      } else {
        session.send("Glad you're back!");
      }

      session.endDialog('How can I help you?');
    }
  ]);
};
