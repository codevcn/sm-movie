const mongoose = require("mongoose");

// mongodb+srv://codevcn:vcn095127@vcncluster.kqwqcb3.mongodb.net/memonote?retryWrites=true&w=majority
const connect = async (req, res) => {
  try {
    await mongoose.connect(
      `mongodb+srv://codevcn:vcn095127@vcncluster.kqwqcb3.mongodb.net/cinema?retryWrites=true&w=majority`
    );
    console.log("Connect database successfully!");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connect;
