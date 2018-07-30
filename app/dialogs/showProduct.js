const builder = require('botbuilder');
const search = require('../search/search');
const printSpecifications = function(session,product,specs) {
  
  var msg = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            type: "AdaptiveCard",
               body: [
                 {
                  "type": "Image",
                  "size": "medium",
                  "url": `${product.product_images[0]}`
                 },   
                 {
                   "type": "TextBlock",
                   "text": `${specs.main_specs[0]}`
                 },
                 {
                  "type": "TextBlock",
                  "text": `${specs.main_specs[1]}`
                },{
                  "type": "TextBlock",
                  "text": `${specs.main_specs[2]}`
                },{
                  "type": "TextBlock",
                  "text": `${specs.main_specs[3]}`
                }
                ]
              }
            })
            .suggestedActions(
              builder.SuggestedActions.create(
                      session, [
                          builder.CardAction.imBack(session,`@add:${product.product_id}`,"add to compare")
                      ]
              ));
  session.endDialog(msg);
  //return specs[0];
}
const showProduct = function(session, product, products_spec) {
  session.sendTyping();
//  console.log(product.product_id);
  //showPrices = (session,search.fetchPrices(product.product_id);
  // const tile = new builder.HeroCard(session)
  //   .title(product.product_name)
  //   .subtitle(`Rating:${product.product_ratings}`)
  //   //.text(`${printSpecifications(products_spec.main_specs)}`)
  //   //.text(`Screen:${products_spec.main_specs[0]}`)
  //   //.text(`Rating:${product.product_ratings}`)
  //   .buttons(
  //     //  (product.colors.length <= 1)
  //     //  ? [
  //           builder.CardAction.postBack(
  //             session,
  //             `@add:${product.product_title}`,
  //             'Show more')
  //   //        ]
  //   //     : []
  //   )
  //   .images([builder.CardImage.create(session, product.product_images[0])]);
  // session.endDialog(new builder.Message(session).attachments([tile]));
 // console.log(products_spec);
  printSpecifications(session,product,products_spec);
  // var msg = new builder.Message(session)
  //         //.text("Pick a card!")
  //         .suggestedActions(
  //             builder.SuggestedActions.create(
  //                     session, [
  //                         builder.CardAction.imBack(session,`@add:${product.product_id}`,"add to compare")
  //                     ]
  //             ));
  //session.send(msg);
}
module.exports = function(bot) {
  bot.dialog('/showProduct', [
    function(session, args, next) {
      if (!args) {
        return session.reset('/confused');
      }

      const product = builder.EntityRecognizer.findEntity(
        args.entities,'Product'
      );

      if (!product || !product.entity) {
        builder.Prompts.text(
          session,
          'I am sorry, what product would you like to see?'
        );
      } else {
        next({ response: product.entity });
      }
    },
    function(session, args, next) {
            session.sendTyping();

      const product_id = args.response;
      var products_spec = '';
      var price ='';
      Promise.all([
        search.fetchPrices(product_id)
      ])
      .then(([storePrices])=> {
        const price = storePrices;
        if (!price) {
          session.endDialog(
            "Sorry,Couldn't fetch prices from stores."
          );
          return Promise.reject();
        } else {
          return price;
        }
      })
      .then(price => { 
        console.log("Im in prices section");
        var temp = JSON.stringify(price);
        var t = temp.replace(/[!?.\/\\\[\]\(\)]/g, '');
        var g = temp.replace(/[:]/g,'-');
        var k = g.replace(/[""]/g,'');
        var kt = k.replace(/[,]/g,"\n");
        var v = kt.replace(/[\{\}]/g);
        var prices = v.replace("undefined", "");
       // t =  temp.replace('}','');
        console.log(t);
        //console.log(JSON.stringify(price));
        session.send(prices);
       // session.send(JSON.stringify(price));
        //session.send(`Amazon:${JSON.stringify(price.amazon)}`);
      })
      .catch(err => {
        console.error(err);
      })
      Promise.all([
        search.fetchDetails(product_id),
        search.fetchSpecs(product_id),
       // search.fetchPrices(product_id),
        search.findProductById(product_id),
        search.findProductsByTitle(product_id),
      ])
        .then(([product, products]) => {
          products_spec = products
          const item = product;
          //prices = prices;
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
          showProduct(session, item,products_spec);
          return item;
        })
        .catch(err => {
          console.error(err);
        })
        // Promise.all([
        //   search.fetchPrices(product_id)
        // ])
        // .then(([storePrices])=> {
        //   const price = storePrices;
        //   if (!price) {
        //     session.endDialog(
        //       "Sorry,Couldn't fetch prices from stores."
        //     );
        //     return Promise.reject();
        //   } else {
        //     return price;
        //   }
        // })
        // .then(price => { 
        //   console.log("Im in prices section");
        //   console.log(JSON.stringify(price));
        //   session.send(JSON.stringify(price));
        // })
        // .catch(err => {
        //   console.error(err);
        // })
      }
    
    
    // function(session, args, next) {
    //   if (args.response) {
    //     session.beginDialog('/choseVariant', {
    //       product: session.dialogData.product
    //     });
    //   } else if (session.message.text === 'no') {
    //     session.endDialog('Alright. I am here if you need anything else');
    //   } else {
    //     // no variants, can go straight to "add to card"
    //     next();
    //   }
    // },
    // function(session, args, next) {
    //   const color =
    //     args &&
    //     args.response &&
    //     args.response.color &&
    //     args.response.color.entity;
    //   const size =
    //     args &&
    //     args.response &&
    //     args.response.size &&
    //     args.response.size.entity;

    //   // ToDo: I wonder if it's still here after we ran another dialog on top of the current one or if I need to cary it back
    //   const product = session.dialogData.product;

    //   search.findVariantForProduct(product.id, color, size).then(variant => {
    //     if (color || size) {
    //       session.sendTyping();
    //       session.reset('/showVariant', { product, variant });
    //     } else {
    //       session.endDialog();
    //     }
    //   });
    // }
  ]);
};
