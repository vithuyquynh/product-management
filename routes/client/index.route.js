const productRouters = require("./product.route")
const homeRouters = require("./home.route")

module.exports = (app) => {
    app.use('/', homeRouters)
    app.use('/products', productRouters)
}