const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumbers: [String],
  image: String,
});

// Create Contact Model
const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
