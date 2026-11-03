const mongoose = require("mongoose");

const dbConnection = () => {
  //connect with database
  mongoose.connect(process.env.DB_URL).then((conn) => {
    console.log(`Database connected:${conn.connection.host}`);
  });
  // .catch((err)=>{
  //     console.error(`Database Error: ${err}`);
  //     process.exit(1);
  // });
};
module.exports = dbConnection;
