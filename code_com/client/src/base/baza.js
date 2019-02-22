const Sequelize = require("sequelize");
const sequelize = new Sequelize("code_com","root","",{host:"127.0.0.1", port:"",dialect:"mysql"});
module.exports = sequelize;      