const request = require('request-promise-native');
const _ = require('lodash');

// const apiKey = process.env.SEARCH_API_KEY;

const indexes = {
  categories: `http://webhose.io/productFilter?token=c08e9b5b-cec4-4f6f-bf38-378a5f1702bd&format=json`,
  products: `http://webhose.io/productFilter?token=c08e9b5b-cec4-4f6f-bf38-378a5f1702bd&format=json`,
  variants: `http://webhose.io/productFilter?token=c08e9b5b-cec4-4f6f-bf38-378a5f1702bd&format=json`
};

const search = (index, query) => {
  return request({
    url: `http://webhose.io/productFilter?token=c08e9b5b-cec4-4f6f-bf38-378a5f1702bd&format=json${query}`
  })
    .then(result => {
      const obj = JSON.parse(result);
      console.log(
        `Searched ${index} for [${query}] and found ${obj && obj.products && obj.products.length} results`
      );
      return obj.products;
    })
    .catch(error => {
      console.error(error);
      return [];
    });
};

const searchCategories = query => search('categories', query);
const searchProducts = query => search('products', query);
const searchVariants = query => search('variants', query);

module.exports = {
  // listTopLevelCategories: () => searchCategories('$filter=parent eq null'),

  findCategoryByTitle: title => searchCategories(`&q=category:${title}`),

  findSubcategoriesByParentId: id =>
    searchCategories(`$filter=parent eq '${id}'`),

  // findSubcategoriesByParentTitle: function(title) {
  //   // ToDo: would be easier if categories had their parent titles indexed
  //   return this.findCategoryByTitle(title).then(value => {
  //     // ToDo: do we care about the test score on the result?
  //     return value.slice(0, 1).reduce((chain, v) => {
  //       return chain.then(() => {
  //         return this.findSubcategoriesByParentId(v.id);
  //       });
  //     }, Promise.resolve({ value: [] }));
  //   });
  // },

  findProductById: function(product) {
    return searchProducts(`$filter=id eq '${product}'`);
  },

  findProductsByTitle: function(product) {
    return searchProducts(`&q=country%3AIN%20name%3A${product}`);
  },

  findProductsBySubcategoryTitle: function(title) {
    return searchProducts(`&q=category:'${title}'`);
  },

  findProducts: function(query) {
    return searchProducts(query);
  },

  findVariantById: function(id) {
    return searchVariants(`&q=id:'${id}'`);
  },

  findVariantBySku: function(sku) {
    return searchVariants(`$filter=sku eq '${sku}'`);
  },

  findVariantForProduct: function(productId, color, size) {
    return searchVariants(`$filter=productId eq '${productId}'`).then(
      variants => {
        if (variants.length === 1) {
          console.log(`Returning the only variant for ${productId}`);
          return variants[0];
        } else {
          return variants.find(v => {
            const isColorMatch = v.color === color || (!v.color && !color);
            const isSizeMatch = v.size === size || (!v.size && !size);

            console.log(
              `Checking if ${v.id} with ${v.size}-${
                v.color
              } is the right one for ${size}-${color}`
            );

            return (
              (!color && !size) ||
              (color && !size && isColorMatch) ||
              (!color && size && isSizeMatch) ||
              (isColorMatch && isSizeMatch)
            );
          });
        }
      }
    );
  },

  find: function(query) {
    // search for products and categories and then decide what it is based on best match

    // ToDo: also need to search for a category and then products in it
    // if its @search.score is higher than a full text product search

    return Promise.all([
      this.findSubcategoriesByParentTitle(query),
      this.findProducts(`&q=${query}`)
    ]).then(([subcategories, products]) => ({ subcategories, products }));
  }
};
