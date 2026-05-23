import nodemailer from "nodemailer";
import { memory } from "../config/db.js";
import { Contact } from "../models/Contact.js";

const defaultContact = {
  email: "admin@example.com",
  phone: "",
  location: "India",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  twitter: "",
  website: ""
};

export const getContact = async (_req, res) => {
  if (memory.enabled) {
    if (!memory.contact) memory.contact = defaultContact;
    return res.json(memory.contact);
  }

  const contact = await Contact.findOne();
  res.json(contact || defaultContact);
};

export const updateContact = async (req, res) => {
  if (memory.enabled) {
    memory.contact = { ...(memory.contact || defaultContact), ...req.body, updatedAt: new Date().toISOString() };
    return res.json(memory.contact);
  }

  const contact = await Contact.findOneAndUpdate({}, req.body, {
    upsert: true,
    new: true,
    runValidators: true
  });

  res.json(contact);
};

export const sendMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  if (process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT || 587),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.CONTACT_RECEIVER || process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: message
    });
  } else {
    console.log("Contact form message:", { name, email, message });
  }

  res.json({ message: "Message sent successfully" });
};
