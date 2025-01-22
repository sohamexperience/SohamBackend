const { userHandler } = require("./handlers/userHandler");

exports.userHandler = async (event) => {
  return await userHandler(event);
};