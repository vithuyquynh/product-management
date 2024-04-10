const Product = require("../../models/product.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const configSystem = require("../../config/system")


//[GET] Get products
module.exports.products = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Filter Status
  const filterStatus = filterStatusHelper(req.query);

  if (req.query.status) {
    find.status = req.query.status;
  }
  // End Filter Status

  //Search
  const objectSearch = searchHelper(req.query);
  if (objectSearch.keyword) {
    find.title = objectSearch.regex;
  }
  //End Search

  //Pagination
  const countProducts = await Product.countDocuments(find);
  let objectPagination = paginationHelper(
    {
      limitItem: 4,
      currentPage: 1,
    },
    countProducts,
    req.query
  );
  //End Pagination

  const products = await Product.find(find)
    .sort({position: 'desc'})
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);
  // console.log(products);
  res.render("admin/pages/products/index", {
    pageTitle: "Trang danh sách sản phẩm",
    products: products,
    filterStatus: filterStatus,
    keyword: objectSearch.keyword,
    pagination: objectPagination,
  });
};

//[PATCH] Change status product
module.exports.changeStatus = async (req, res) => {
  const status = req.params.status;
  const id = req.params.id;

  await Product.updateOne({ _id: id }, { status: status });
  req.flash('success', 'Cập nhật trạng thái sản phẩm thành công!');
  res.redirect("back");
};
//[PATCH] Change multi status products
module.exports.changeMulti = async (req, res) => {
  const type = req.body.type;
  const ids = req.body.ids.split(", ");
  switch (type) {
    case 'active':
      await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: type } }
      );
      req.flash('success', 'Cập nhật trạng thái sản phẩm thành công!');
      break;
    case 'inactive':
      await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: type } }
      );
      req.flash('success', 'Cập nhật trạng thái sản phẩm thành công!');
      break;
    
    case 'delete':
      await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { deleted: true, deletedAt: new Date() } }
      );
      req.flash('success', 'Xóa sản phẩm thành công!');
      break;
    case 'change-position':
      for(item of ids) {
        const [id, position] = item.split("-")
        await Product.updateOne({_id: id}, {position: position})
      }
      req.flash('success', 'Thay đổi vị trí sản phẩm thành công!');
      break;
    
    default:
      break;
  }
  res.redirect('back')
};
//[delete] delete product item
module.exports.delete = async (req, res) => {
  const id = req.params.id;
  await Product.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
  req.flash('success', 'Xóa sản phẩm thành công!');
  res.redirect("back");
};

//[Get] create product
module.exports.create = async (req, res) => {
  res.render("admin/pages/products/create", {
    pageTitle: "Trang tạo mới sản phẩm",
  });
};

//[post] create product
module.exports.createPost = async (req, res) => {
  req.body.price = parseInt(req.body.price)
  req.body.discountPercentage = parseInt(req.body.discountPercentage)
  req.body.stock = parseInt(req.body.stock)
  if(req.body.position) {
    req.body.position = parseInt(req.body.position)
  }else {
    const countProducts = await Product.countDocuments()
    req.body.position = countProducts + 1
  }
  const product = new Product(req.body)
  await product.save()
  req.flash('success', 'Đã tạo sản phẩm thành công!');
  res.redirect(`${configSystem.prefixAdmin}/products`)
};

//[Get] edit product
module.exports.edit = async (req, res) => {
  const id = req.params.id
  const find = {
    deleted: false,
    _id: id
  }
  try {
    const product = await Product.findOne(find)
    res.render("admin/pages/products/edit", {
      pageTitle: "Trang chỉnh sửa sản phẩm",
      product: product
    });
  } catch (error) {
    if(error) {
      res.redirect(`${configSystem.prefixAdmin}/products`)
    }
  }
};

//[patch] edit product
module.exports.editPatch = async (req, res) => {
  const id = req.params.id
  req.body.price = parseInt(req.body.price)
  req.body.discountPercentage = parseInt(req.body.discountPercentage)
  req.body.stock = parseInt(req.body.stock)
  req.body.position = parseInt(req.body.position)
  try {
    await Product.updateOne({_id: id}, req.body)
    req.flash('success', 'Cập nhật sản phẩm thành công!');
  } catch (error) {
    req.flash('success', 'Cập nhật sản phẩm thất bại!');
  }
  res.redirect(`${configSystem.prefixAdmin}/products/edit/${id}`)
};

//[get] detail product
module.exports.detail = async (req, res) => {
  const id = req.params.id
  const find = {
    deleted: false,
    _id: id
  }
  try {
    const product = await Product.findOne(find)
    res.render("admin/pages/products/detail", {
      pageTitle: product.title,
      product: product
    });
  } catch (error) {
    if(error) {
      res.redirect(`${configSystem.prefixAdmin}/products`)
    }
  }
};