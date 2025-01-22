const { projectHandler } = require("./handlers/projectsHandlers");


exports.projectHandler = async (event) => {
    return await projectHandler(event);
  };
