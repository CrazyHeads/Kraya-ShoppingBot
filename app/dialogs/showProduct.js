const builder = require('botbuilder');
const search = require('../search/search');
const printSpecifications = function(session,product,specs,price) {
  
  var msg = new builder.Message(session)
    .addAttachment({
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
            type: "AdaptiveCard",
               body: [
                {
                  "type": "TextBlock",
                  "size": "large",
                  "weight": "bolder",
                  "text": `${product.product_name}`
                 },   
                 {
                  "type": "Image",
                  "size": "medium",
                  "url": `${product.product_images[0]}`
                 },   
                 {
                   "type": "TextBlock",
                   "weight": "bolder",
                   "text": `${specs.main_specs[0]}`
                 },
                 {
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `${specs.main_specs[1]}`
                },{
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `${specs.main_specs[2]}`
                },{
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `${specs.main_specs[3]}`
                },
                {
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `Amazon:-${price.amazon}`
                },
                {
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `Flipkart:-${price.flipkart}`
                },
                {
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `Ebay:-${price.ebay}`
                },
                {
                  "type": "TextBlock",
                  "weight": "bolder",
                  "text": `Snapdeal:-${price.snapdeal}`
                },
                ],
                // "actions": [
                //   {
                //     "type": "Action.OpenUrl",
                //     "title": "Amazon",
                //     "url": `${product.stores[0].product_store_url}`
                //   }
                // ]
              }
            })
            .suggestedActions(
              builder.SuggestedActions.create(
                      session, [
                          builder.CardAction.imBack(session,`@add:${product.product_id}`,"add to compare")
                      ]
              ));
  const  colors = product.available_colors;
  console.log(colors);
  console.log(session.privateConversationData.favColor);
  var flag = 0;
  for (var i = 0;i < colors.length;i++) {
    console.log(colors[i]);
    //console.log()
    if (colors[i] == session.privateConversationData.favColor) {
      flag = 1;
      break;
    }
  }
  if (flag==1) {
    session.send(`Also avaliable in your favourite color ${session.privateConversationData.favColor}`);
  }
  session.endDialog(msg);

  //return specs[0];
}
const showProduct = function(session, product, products_spec,price) {
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
  printSpecifications(session,product,products_spec,price);
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
          'Which brand would you like to see?'
        );
      } else {
        next({ response: product.entity });
      }
    },
    function(session, args, next) {
            session.sendTyping();

      const product_id = args.response;
      var products_spec = '';
      var price='';
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
      //   // var temp = JSON.stringify(price);
      //   // var t = temp.replace(/[!?.\/\\\[\]\(\)]/g, '');
      //   // var g = temp.replace(/[:]/g,'-');
      //   // var k = g.replace(/[""]/g,'');
      //   // var kt = k.replace(/[,]/g,"\n");
      //   // var v = kt.replace(/[\{\}]/g);
      //   // var prices = v.replace("undefined", "");
      //  // t =  temp.replace('}','');
      //   console.log(price.amazon);
        
        //session.endDialog(price.amazon);
     // })
      // .catch(err => {
      //   console.error(err);
      // })
      Promise.all([
        search.fetchDetails(product_id),
        search.fetchSpecs(product_id),
        search.fetchPrices(product_id),
        search.findProductById(product_id),
        search.findProductsByTitle(product_id),
      ])
        .then(([product, products,p]) => {
          products_spec = products
          const item = product;
          price = p;
          console.log(p.amazon);
          if (!item) {
            session.endDialog(
              "Sorry, I couldn't find the product you asked about"
            );
            return Promise.reject();
          } else {
            return item;
          }
          // if (!p) {
          //   session.endDialog(
          //     "Sorry, I couldn't find the product you asked about"
          //   );
          // }
          // else
          // return p;
        })
        .then(item => {
          showProduct(session, item,products_spec,price);
          return item;
        })
        // .then(p => {
        //   return p;
        // })
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
