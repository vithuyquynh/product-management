module.exports = (query) => {
  const objectSearch = {}
  if (query.keyword) {
    objectSearch.keyword = query.keyword;
    objectSearch.regex = new RegExp(objectSearch.keyword, "i");
  }
  return objectSearch
};
