const path = require("path");
const { isArray } = require("util");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//middle
const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((o) => o.id === orderId);

  if (foundOrder) {
    res.locals.FOrder = foundOrder;
    return next();
  } else {
    return next({
      status: 404,
      message: `Order id not found: ${req.params.orderId}`,
    });
  }
};

const newOrderIsValid = (req, res, next) => {
  res.locals.NOrder = req.body.data;
  order = res.locals.NOrder;

  if (!order.deliverTo) {
    return next({ status: 400, message: "deliverTo" });
  } else if (!order.mobileNumber) {
    return next({ status: 400, message: "mobileNumber" });
  } else if (!order.dishes || order.dishes.length === 0) {
    return next({ status: 400, message: `dish error` });
  }

  return next();
};

const validDish = (req, res, next) => {
  res.locals.NOrder = req.body.data;
  dishes = res.locals.NOrder.dishes;

  if (!res.locals.NOrder.dishes || !Array.isArray(dishes)) {
    next({ status: 400, message: `dish` });
  }
  dishes.forEach((d) => {
    const index = dishes.indexOf(d, 0);
    if (d.quantity === 0 || typeof d.quantity !== "number") {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  return next();
};

const updateOrderIdValid = (req, res, next) => {
  const { orderId } = req.params;
  const newOrder = res.locals.NOrder;

  if (newOrder.id && newOrder.id !== orderId) {
    next({
      status: 400,
      message: `Order id ${res.locals.NOrder.id} does not match the ID ${orderId}`,
    });
  }

  return next();
};

const updateOrderStatusValid = (req, res, next) => {
  const order = res.locals.NOrder;

  if (order.status !== 'pending') {
    return next({
      status: 400,
      message: ` order status not available`,
    });
  }
  return next();
};

 const checkDeleteStatus = (req, res, next) => {
 const {status} = res.locals.FOrder
 if(status !== 'pending'){return next({
    status: 400,
    message: `status should be pending`,
  });}

  return next();

}

//used for get /orders
function list(req, res) {
  res.json({ data: orders });
}

//used for get orders/:orderId
const read = (req, res, next) => {
  res.json({ data: res.locals.FOrder });
};

//used for post Orders/:OrdersId
const create = (req, res, next) => {
  const { deliverTo, mobileNumber, status } = res.locals.NOrder;
  const newOrder = { deliverTo, mobileNumber, status, id: nextId() };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

//used for put on Orders/:OrdersId
function update(req, res) {
  originalResult = res.locals.FOrder;
  const { data } = ({} = req.body);
  const { deliverTo, mobileNumber, status, dishes } = data;
  const upOrder = {
    deliverTo,
    mobileNumber,
    status,
    dishes,
    id: originalResult.id,
  };

  Object.assign(originalResult, upOrder);

  res.json({ data: upOrder });
}

//used for DELETE Orders/:OrdersId
function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedOrder = orders.splice(index, 1);
  
    res.sendStatus(204);
  }


module.exports = {
  list,
  read: [orderExists, read],
  create: [validDish, newOrderIsValid, create],
  update: [
    validDish,
    orderExists,
    newOrderIsValid,
    updateOrderIdValid,
    updateOrderStatusValid,
    update,
  ],
  destroy: [orderExists, checkDeleteStatus, destroy],
};
