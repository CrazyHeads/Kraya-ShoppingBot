const builder = require('botbuilder');
const sentiment = require('../sentiment');

const displayCart = function(session, cart) {
  const cards = cart.map(item =>
    new builder.ThumbnailCard(session)
    .title(item.product_name)
    .subtitle(`Rs.${item.product_lowest_price}`)
    .text(item.product_link)
      .buttons([
        builder.CardAction.imBack(
          session,
          `@remove:${item.product_id}`,
          'Remove'
        )
      ])
      .images([builder.CardImage.create(session, item.product_images)])
  );

  session.sendTyping();
  session.send(
    new builder.Message(
      session,
      `You have ${cart.length} products in your cart`
    )
      .attachments(cards)
      .attachmentLayout(builder.AttachmentLayout.carousel)
  );
};

module.exports = function(bot) {
  bot.dialog('/showCart', [
    function(session, args, next) {
      const cart = session.privateConversationData.cart;
      console.log("CARTTTT", cart)
      if (!cart || !cart.length) {
        session.send(
          'Your shopping cart appears to be empty. Can I help you find anything?'
        );
        session.reset('/categories');
      } else {
        displayCart(session, cart);
        next();
      }
    },
    ...sentiment.confirm('Ready to checkout?'),
    function(session, args, next) {
      if (args.response) {
        session.reset('/checkout');
      } else {
        session.endDialog('Sure, take your time. Just tell me when');
      }
    }
  ]);
};
