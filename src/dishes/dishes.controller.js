const { listenerCount } = require("events");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

//middle
const dishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((d) => d.id === dishId);

  if (foundDish) {
    res.locals.FDish = foundDish;
    return next();
  } else {
    return next({
      status: 404,
      message: `Dish id not found: ${req.params.dishId}`,
    });
  }
};

const newDishIsValid = (req, res, next) => {
  res.locals.NDish = req.body.data;
  dish = res.locals.NDish;

  if (!dish.name) {
    return next({ status: 400, message: "name" });
  } else if (!dish.description) {
    return next({ status: 400, message: "description" });
  } else if (!dish.image_url) {
    return next({ status: 400, message: "image_url" });
  } else if (!dish.price || dish.price <= 0) {
    return next({ status: 400, message: "price" });
  }

  if (typeof dish.price !== "number") {
    return next({ status: 400, message: "price not valid" });
  }

  return next();
};

const updateDishIdValid = (req, res, next) => {
  const { dishId } = req.params;
  const newDish = res.locals.NDish;

  if (newDish.id && newDish.id !== dishId) {
    next({
      status: 400,
      message: `Dish id ${res.locals.NDish.id} does not match the ID ${dishId}`,
    });
  }

  return next();
};

//used for get /dishes
function list(req, res) {
  res.json({ data: dishes });
}

//used for get dishes/:dishesId
const read = (req, res, next) => {
  res.json({ data: res.locals.FDish });
};

//used for post dishes/:dishesId
const create = (req, res, next) => {
  const { name, description, image_url, price } = res.locals.NDish;
  const newDish = { name, description, image_url, price, id: nextId() };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

//used for PUT on dishes/:dishesId
function update(req, res) {
  originalResult = res.locals.FDish;
  const { data } = ({} = req.body);
  const { name, description, image_url, price } = data;
  const upDish = { name, description, image_url, price, id: originalResult.id };

  Object.assign(originalResult, upDish);

  res.json({ data: originalResult });
}

module.exports = {
  list,
  read: [dishExists, read],
  create: [newDishIsValid, create],
  update: [dishExists, newDishIsValid, updateDishIdValid, update],
};
