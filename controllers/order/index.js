module.exports = {

  placeOrder: require("./placeOrder"),
  getMyOrders: require("./getMyOrders"),
  getOrderById: require("./getOrderById"),

  requestReturnItem: require("./requestReturnItem"),
  requestItemCancel: require("./requestItemCancel"),

  cancelOrder: require("./cancelOrder"),

  getMyReturns: require("./getMyReturns"),
  getMyCancellations: require("./getMyCancellations"),

  adminGetOrders: require("./adminGetOrders"),
  adminGetOrderStats: require("./adminGetOrderStats")

};