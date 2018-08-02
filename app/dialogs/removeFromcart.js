const builder = require('botbuilder');
const search = require('../search/search');
const sentiment = require('../sentiment');

// const lookupProductOrVariant = function(session, id, next) {
//   session.sendTyping();
//   return Promise.all([
//     search.fetchDetails(id),
//   ]).then(([products, variants]) => {
//     if (products) {
//       product = products;
//       if (true) {
//         session.sendTyping();

//         return search
//           .fetchDetails(product.product_id)
//           .then(product)
//       }
//     } else {
//       session.endDialog(`I cannot find ${id} in my product catalog, sorry!`);
//       return Promise.reject();
//     }
//   });
// };

// const describe = function(product, variant) {
//   console.log(product)
//   return (
//     `${product.product_name} ` 
//   );
// };

/*
  Not used at the moment. 
  Microsoft decided to discontinue the Recommendations API preview and the alternative is not exactly the same. 
  I may come back later and integrate another service
*/
/*
const showRecommendations = function(session) {
  session.sendTyping();
  Promise.all(
    session.dialogData.recommendations.map(offer => {
      return new Promise((resolve, reject) => {
        search
          .findVariantBySku(offer.items[0].id)
          .then(variants => {
            offer.variant = variants[0];
            return offer.variant.productId;
          })
          .then(productId => search.findProductById(productId))
          .then(products => {
            offer.product = products[0];
            resolve(offer);
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      });
    })
  ).then(offers => {
    session.sendTyping();
    // skype doesn't understand postBack from the carousel so that's why I am using imBack for recommendations
    const tiles = offers.map(offer =>
      new builder.ThumbnailCard(session)
        .title(offer.product.title)
        .subtitle(`$${offer.product.price}`)
        .text(offer.reasoning)
        .buttons([
          builder.CardAction.imBack(
            session,
            `@show:${offer.product.id}`,
            'Show me'
          )
        ])
        .images([builder.CardImage.create(session, offer.variant.image)])
    );
    session.endDialog(
      new builder.Message(session)
        .attachments(tiles)
        .attachmentLayout(builder.AttachmentLayout.carousel)
    );
  });
};
*/

module.exports = function(bot) {
  var id = ''
  bot.dialog('/removeFromcart', [
    function(session, args, next) {
      if (!args) {
        return session.reset('/confused');
      }

      id = builder.EntityRecognizer.findEntity(args.entities, 'Id');
      if (!id || !id.entity) {
        return session.reset('/confused');
      }
      
      // lookupProductOrVariant(session, id.entity, next)
      //   .then(({ product, variant }) => next({ product, variant }))
      //   .catch(error => console.error(error));
      next();
    },
    function(session, args, next) {

      Promise.all([
        search.fetchDetails(id.entity),
      ])
        .then(([product, products]) => {
          console.log(product)
          //const item = product.concat(products)[0];
          const item = product;
          if (!item) {
            session.endDialog(
              "Sorry, I couldn't find the product you asked about"
            );
            return Promise.reject();
          } else {
            return item;
          }
        })
  
      console.log("cart length before removing is is",session.privateConversationData.cart.length);
      var i = 0; 
      for (;i<session.privateConversationData.cart.length;i++) {
        if (session.privateConversationData.cart[i].product_id == id.entity) {
          break;
        }
      }
           session.privateConversationData.cart 
           //= (
             //session.privateConversationData.cart || []
         // )
          .splice(i,1);
     session.endDialog(`I have removed ${product.product_name} from your cart`);
     if(session.privateConversationData.cart.length === 1) {
      cart = []
    } 
      console.log("Cart length after is ",session.privateConversationData.cart.length)
    },
    function(session, args, next) {
      // not doing recommendations at the moment
      session.reset('/showCart');
    // displayCart(session, cart);
    // next();
    }
  ]);
};