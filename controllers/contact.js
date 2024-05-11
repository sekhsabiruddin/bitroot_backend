const Contact = require("../models/contact");
const express = require("express");
const router = express.Router();
const { upload } = require("../multer");
const fs = require("fs");
const csv = require("csv-parser");
const ErrorHandler = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// ==========================Create Contacts==============
router.post(
  "/create-contacts",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    const { name, phoneNumbers, image } = req.body;
    try {
      const existingContact = await Contact.findOne({
        phoneNumbers: { $in: phoneNumbers },
      });

      if (existingContact) {
        throw new ErrorHandler("Contact with this phone already exists", 404);
      }

      const fileUrl = req.file ? req.file.filename : null;
      const newContact = new Contact({
        name,
        phoneNumbers,
        image: fileUrl,
      });

      await newContact.save();
      res.json(newContact);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
//==================== Fetch All Contacts=======================
router.get(
  "/all-contacts",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const contacts = await Contact.find();
      res.json(contacts);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//================ Update Contact ======================
router.patch(
  "/update-contacts/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, phoneNumbers, image } = req.body;
      const updatedFields = {};
      if (name) {
        updatedFields.name = name;
      }
      if (phoneNumbers) {
        updatedFields.phoneNumbers = phoneNumbers;
      }
      if (image) {
        updatedFields.image = image;
      }
      const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true }
      );

      if (!updatedContact) {
        throw new ErrorHandler("Contact not found", 404);
      }

      res.json({ message: "Contact updated successfully", updatedContact });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// ================ Delete Contact ===================
router.delete(
  "/contacts/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const contact = await Contact.findOneAndDelete(req.params.id);

      if (!contact) {
        throw new ErrorHandler("Contact not found", 404);
      }

      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ================== Search Contacts ==========================
router.get(
  "/contacts/search",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, phoneNumbers } = req.query;
      let query = {};
      if (name) {
        query.name = { $regex: name, $options: "i" };
      }

      if (phoneNumbers && Array.isArray(phoneNumbers)) {
        query.phoneNumbers = { $in: phoneNumbers };
      } else if (phoneNumbers) {
        query.phoneNumbers = phoneNumbers.toString();
      }

      const contacts = await Contact.find(query);

      if (contacts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No contacts found matching the search criteria.",
        });
      }

      res.json(contacts);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//================ Export Contacts to CSV=============================
router.get(
  "/contacts/export",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const contacts = await Contact.find();
      const csvHeader = "Name,Phone Numbers,Image\n";
      const csvData = contacts
        .map((contact) => {
          const phoneNumbers = contact.phoneNumbers.join(";");
          return `${contact.name},${phoneNumbers},${contact.image || ""}`;
        })
        .join("\n");
      const csvContent = `${csvHeader}${csvData}`;

      // Set response headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
      res.setHeader("Content-Length", csvContent.length);
      res.setHeader("Cache-Control", "no-cache");

      // Send CSV content as response
      res.status(200).send(csvContent);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
