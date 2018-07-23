const request = require('request-promise-native');
const _ = require('lodash');

const searchApp = process.env.SEARCH_APP_NAME;
const apiKey = `M9COE0ZSdJMpWHtKWsej1Ct7PJ423K7y350`;

const indexes = {
  categories: `https://price-api.datayuge.com/api/v1/compare/list/categories?api_key=${apiKey}`,
  products: `https://price-api.datayuge.com/api/v1/compare/search?api_key=${apiKey}`,
  variants: `https://prisce-api.datayuge.com/api/v1/compare/list/filters?api_key=${apiKey}`,
  productDetail: `https://price-api.datayuge.com/api/v1/compare/detail?api_key=${apiKey}`//&id=ZToxMjIyNA`
};

const search = (index, query) => {
  console.log(`${indexes[index]}&${query}`)
  return request({
    url: `${indexes[index]}&${query}`,
  })
    .then(result => {
      const obj = JSON.parse(result);
      console.log(
        `Searched ${index} for [${query}] and found ${obj &&
          obj.data &&
          obj.data.length} results`
      );
      return obj.data;
    })
    .catch(error => {
      console.error(error);
      return [];
    });
};

const searchCategories = query => search('categories', query);
const searchProducts = query => search('products', query);
const searchVariants = query => search('variants', query);
const searchDetails = query => search('productDetail',query);

module.exports = {
  listTopLevelCategories: () => searchCategories('page=1'),

  findCategoryByTitle: title => searchCategories(`product="${title}"`),
  findSubcategoriesByParentId: id => searchCategories(`product_id='${id}'`),

  findSubcategoriesByParentTitle: function(title) {
    // ToDo: would be easier if categories had their parent titles indexed
    return this.findCategoryByTitle(title).then(value => {
      // ToDo: do we care about the test score on the result?
      return value.slice(0, 1).reduce((chain, v) => {
        return chain.then(() => {
          return this.findSubcategoriesByParentId(v.product_title);
        });
      }, Promise.resolve({ value: [] }));
    });
  },

  fetchDetails: function(product) {
    return searchDetails(`id=${product}`);
  },
  findProductById: function(product) {
    return searchProducts(`product=${product}`);
  },

  findProductsByTitle: function(product) {
    return searchProducts(`product=${product}`);
  },

  findProductsBySubcategoryTitle: function(title) {
    return searchProducts(`subcategory=${title}`);
  },

  findProducts: function(query) {
    console.log("In find Products")
    return searchProducts(`product=${query}`);
  },

  findVariantById: function(id) {
    return searchVariants(`$filter=id eq${id}`);
  },

  findVariantBySku: function(sku) {
    return searchVariants(`$filter=sku eq ${sku}`);
  },

  findVariantForProduct: function(productId, color, size) {
    return searchVariants(`product_id=${productId}`).then(
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
      this.findProducts(`${query}`)
    ]).then(([subcategories, products]) => ({ subcategories, products }));
  }
};
