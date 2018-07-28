const builder = require('botbuilder');
const search = require('../search/search');
//const recommendations = require('../recommendations');
const sentiment = require('../sentiment');

const lookupProductOrVariant = function(session, id, next) {
  session.sendTyping();
  return Promise.all([
    search.fetchDetails(id),
    // search.findVariantById(id)
  ]).then(([products, variants]) => {
    if (products) {
      product = products;
      if (true) {
        session.sendTyping();

        return search
          .fetchDetails(product.product_id)
          .then(product)
      }
    } else {
      session.endDialog(`I cannot find ${id} in my product catalog, sorry!`);
      return Promise.reject();
    }
  });
};

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
  bot.dialog('/addToCart', [
    function(session, args, next) {
      if (!args) {
        return session.reset('/confused');
      }

      id = builder.EntityRecognizer.findEntity(args.entities, 'Id');
      if (!id || !id.entity) {
        return session.reset('/confused');
      }
      
      lookupProductOrVariant(session, id.entity, next)
        .then(({ product, variant }) => next({ product, variant }))
        .catch(error => console.error(error));
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
        .then(item => {
          if (session.privateConversationData.cart){
            session.privateConversationData.cart =  
            console.log(session.privateConversationData.concat(item))
          }else{
            session.privateConversationData.cart = []
            session.privateConversationData.cart =  session.privateConversationData.cart.console(item)
          }
        })

      session.send(`I have added ${product.product_name} to your cart`);

    },
    function(session, args, next) {
      // not doing recommendations at the moment
      session.reset('/showCart');
    }
    /*
      Not used at the moment. 
      Microsoft decided to discontinue the Recommendations API preview and the alternative is not exactly the same. 
      I may come back later and integrate another service
    */
    /*
    function(session, args, next) {
      session.sendTyping();

      recommendations.recommend([args.variant.sku]).then(variants => {
        session.sendTyping();

        if (!variants.length) {
          session.reset('/showCart');
        } else {
          session.dialogData.recommendations = variants;
          next();
        }
      });
    },
    ...sentiment.confirm(
      'I also have a few recommendations for you, would you like to see them?'
    ),
    function(session, args, next) {
      if (!args.response) {
        session.endDialog(
          'Alright. Let me know if I can help you find anything else or if you would like to see your shopping cart.'
        );
      } else {
        showRecommendations(session);
      }
    }
    */
  ]);
};
