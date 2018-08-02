const builder = require('botbuilder');
const search = require('../search/search');
const pickRandom = require('pick-random');
const jokes = [ "I am on a seafood diet. I see food, and I eat it.",
"Alcohol! Because no great story started with someone eating a salad",
"Don't worry if plan A fails, there are 25 more letters in the alphabet.",
"Don’t drink while driving – you might spill the beer.",
"Doesn’t expecting the unexpected make the unexpected expected?",
"I'm not clumsy, The floor just hates me, the table and chairs are bullies and the walls get in my way.",
"Life is short, smile while you still have teeth.",
"The only reason I'm fat is because a tiny body couldn't store all this personality.",
"I'm not lazy, I'm just very relaxed.",
"You're born free, then you're taxed to death.",
"A cookie a day keeps the sadness away. An entire jar of cookies a day brings it back."
];
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
  const message = slice.map(c => c.product_title).join(', ');
  const more = start + slice.length < subcategories.length;

  if (!more) {
    session.endDialog(
      `We ${
        start > 0 ? 'also ' : ''
      }have ${message}. See anything you like? Just ask for it.`
    );
  } else {
    // session.endDialog(
    //   `We ${start > 0 ? 'also ' : ''}have ${message} and ${
    //     start > 0 ? 'even ' : ''
    //   }more.` +
    //     (start > 0
    //       ? " Keep scrolling if you don't see what you like."
    //       : ' You can scroll through the list with "next" or "more"')
    // );
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
    new builder.ThumbnailCard(session)
    .title(p.product_title)
    .subtitle(`Rs.${p.product_lowest_price}`)
    .text(p.product_brand)
    .buttons([
      builder.CardAction.imBack(session, `@show:${p.product_id}`, 'Show me')
    ])
    .images([
      builder.CardImage.create(session, p.product_image).tap(
        builder.CardAction.imBack(session, `${p.product_id}`)
      )
    ])
);
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
          'Which brand would you like me to look up for you?'
        );
      } else {
        next({ response: query });
      }
    },
    function(session, args, next) {
      session.sendTyping();

      const query = args.response;
      if (query == "skip") {
        session.endDialog("That's okay. I won't feel bad");
      }
      else if (query == 'Black') {
       // session.send("You chose black");
       //const favColor = 'black';
       session.endDialog("%s",pickRandom(jokes));
     //  session.endDialog("I am not lazy, I am on energy saving mode");

       session.privateConversationData.favColor = 'Black';

      } else if (query == 'White') {
       // const favColor = 'white';
        session.privateConversationData.favColor = 'White';
        session.endDialog("%s",pickRandom(jokes));

        //session.endDialog("Life is a shipwreck but we must not forget to sing in the lifeboats.");

      } else if (query == 'Red') {
       // const favColor = 'red';
        session.privateConversationData.favColor = 'Red';
        session.endDialog("%s",pickRandom(jokes));

        //session.send("Put on your red shoes, and dance the blues.");
      }
      else {

      // ToDo: also need to search for products in the category
      search.find(query).then(({ subcategories, products }) => {
       // if (subcategories.length) {
          session.privateConversationData = Object.assign(
            {},
            session.privateConversationData,
            {
              list: {
                type: 'categories',
                data: subcategories
              },
              pagination: {
                start: 0
              }
            }
          );
          session.save();

          listCategories(session, subcategories);
       //} 
        if (products.length) {
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
        } else {
          session.endDialog(
            `I tried looking for ${query} but I couldn't find anything, sorry!`
          );
        }
      });
    }
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
