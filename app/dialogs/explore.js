const builder = require('botbuilder');
const search = require('../search/search');

const extractQuery = (session, args) => {
  if (args && args.entities && args.entities.length) {
    // builder.EntityRecognizer.findEntity(args.entities, 'CompanyName');
    // builder.EntityRecognizer.findBestMatch(data, entity.entity);
    const question = args.entities.find(e => e.type === 'Entity');
    const detail = args.entities.find(e => e.type === 'Detail');

    return `${(detail || { entity: '' }).entity} ${
      (question || { entity: '' }).entity
    }`.trim();
  } else if (session.message.text.split(' ').length <= 2) {
    // just assume they typed a category or a product name
    return session.message.text.replace('please', '').trim();
  } else {
    return undefined;
  }
};

const listCategories = (session, subcategories, start = 0) => {
  // ToDo: to be saved as a pagination object on the state and the list needs to be saved too
  const slice = subcategories.slice(start, start + 6);
  if (slice.length === 0) {
    return session.endDialog(
      "That's it. You have seen it all. See anything you like? Just ask for it."
    );
  }

  // ToDo: I have two displays. Cards and words. probably need a method to present it
  const message = slice.map(c => c.title).join(', ');
  const more = start + slice.length < subcategories.length;

  if (!more) {
    session.endDialog(
      `We ${
        start > 0 ? 'also ' : ''
      }have ${message}. See anything you like? Just ask for it.`
    );
  } else {
    session.endDialog(
      `We ${start > 0 ? 'also ' : ''}have ${message} and ${
        start > 0 ? 'even ' : ''
      }more.` +
        (start > 0
          ? " Keep scrolling if you don't see what you like."
          : ' You can scroll through the list with "next" or "more"')
    );
  }
};

const listProducts = (session, products, start = 0) => {
  // ToDo: need to filter out products with very small @search.score
  const slice = products.slice(start, start + 4);
  if (slice.length === 0) {
    return session.endDialog(
      "That's it. You have seen it all. See anything you like? Just ask for it."
    );
  }

  const cards = slice.map(p =>
    new builder.HeroCard(session)
      .title(p.name)
      .subtitle(`Rs.${p.price}`)
      .text(p.description.slice(0,100))
      .buttons([
        builder.CardAction.imBack(session, '/showCart', 'Add to Cart')
      ])
      .images([
        builder.CardImage.create(session, p.images[0]).tap(
        builder.CardAction.imBack(session, `@show:${p.product_id}`)
        )
      ])
  );

  cards.push(new builder.HeroCard(session)
  .images([
    builder.CardImage.create(session,'https://png.icons8.com/ios/1600/add.png').tap(
    builder.CardAction.imBack(session, `more`)
    )
  ])
  .buttons([
    builder.CardAction.imBack(session, `more`, 'Show More')
  ]));
 
  if (start === 0) {
    session.send(
      `I found ${
        products.length
      } products and here are the best matches. Tap on the image to take a closer look.`
    );
  }

  session.sendTyping();
  session.endDialog(
    new builder.Message(session)
      .attachments(cards)
      .attachmentLayout(builder.AttachmentLayout.carousel)
  
  );
};

module.exports = function(bot) {
  bot.dialog('/explore', [
    function(session, args, next) {
      const query = extractQuery(session, args);

      if (!query) {
        // ToDo: randomize across a few different sentences
        builder.Prompts.text(
          session,
          'I am sorry, what would you like me to look up for you?'
        );
      } else {
        next({ response: query });
      }
    },
    function(session, args, next) {
      session.sendTyping();

      const query = args.response;
      // if (query == "yes" || query == "Yes"){
      //   var msg = new builder.Message(session);
      //   msg.attachmentLayout(builder.AttachmentLayout.carousel)
      //   msg.attachments([
      //     new builder.HeroCard(session)
      //     .title("")
      //     .images([builder.CardImage
      //       .create(session, 'https://www.billboard.com/files/styles/900_wide/public/media/Gaming-2017-billboard-1548.jpg')
      //       .tap(builder.CardAction.imBack(session, "Gaming", "Gaming"))]),
      //   new builder.HeroCard(session)
      //     .title("")
      //     .images([builder.CardImage
      //       .create(session, 'http://www.cthulhuart.com/wp-content/uploads/2018/06/movie.jpg')
      //       .tap(builder.CardAction.imBack(session, "Youtube", "Youtube"))]),
      //   new builder.HeroCard(session)
      //     .title("")
      //     .images([builder.CardImage
      //       .create(session, 'https://petapixel.com/assets/uploads/2014/03/photog1.jpg')])
      //       .tap(builder.CardAction.imBack(session, "Photography", "Photography"))]
      // );
      // session.send(msg).endDialog();
      // } else if (query == "no") {
      //   session.endDialog("okay! What can i do for you?");
      // } else if (query == "Gaming" || query == "youtube" || query == "photography") {
      //   session.endDialog("Nice Hobby!");
      // }
      // ToDo: also need to search for products in the category
      search.find(query).then(({ subcategories, products }) => {
        if (subcategories.length) {
          session.privateConversationData = Object.assign(
            {},
            session.privateConversationData,
            {
              list: {
                type: 'category',
                data: subcategories
              },
              pagination: {
                start: 0
              }
            }
          );
          session.save();

          listCategories(session, subcategories);
        } else if (products.length) {
          session.privateConversationData = Object.assign(
            {},
            session.privateConversationData,
            {
              list: {
                type: 'products',
                data: products
              },
              pagination: {
                start: 0
              }
            }
          );
          session.save();

          listProducts(session, products);
        } 
        else {
          session.endDialog(
            `I tried looking for ${query} but I couldn't find anything, sorry!`
          );
        }
      });
    }
  
  ]);

  bot.dialog('/next', [
    function(session, args, next) {
      if (
        !session.privateConversationData ||
        !session.privateConversationData.list
      ) {
        return session.endDialog('Sorry, I have no active list to scroll');
      }

      const list = session.privateConversationData.list;
      const pagination = session.privateConversationData.pagination;

      switch (list.type) {
        case 'products':
          session.privateConversationData = Object.assign(
            {},
            session.privateConversationData,
            {
              pagination: {
                start: pagination.start + 4
              }
            }
          );
          session.save();

          return listProducts(session, list.data, pagination.start + 4);

        case 'categories':
          // ToDo: this is updating the state. Time to use Redux maybe?
          session.privateConversationData = Object.assign(
            {},
            session.privateConversationData,
            {
              pagination: {
                start: pagination.start + 6
              }
            }
          );
          session.save();

          return listCategories(session, list.data, pagination.start + 6);
      }

      session.endDialog(
        'Something funny happened and I started wondering who I am'
      );
    }
  ]);
};