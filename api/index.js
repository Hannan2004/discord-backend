const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('../config/db');
const mentorRequest = require('../models/requestsModel')
require('dotenv').config();

connectDB();

const app = express();
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
app.use(cors());
app.use(express.json());

app.post("/request-mentor", async (req, res) => {
    const { teamName, tableNumber, queryCategory } = req.body;
    console.log("Request received", teamName, tableNumber, queryCategory);
    const discordPayload = {
        content: "**New Mentor Request!** 🚀",
        embeds: [
          {
            title: "Mentor Request Details",
            fields: [
              { name: "👥 Team Name", value: teamName, inline: true },
              { name: "📍 Table Number", value: tableNumber, inline: true },
              { name: "❓ Query", value: queryCategory }
            ],
            color: 3447003
          }
        ]
      };

      try {
        await axios.post(WEBHOOK_URL, discordPayload, {
            headers: { "Content-Type": "application/json" }
        });
        const newRequest = new mentorRequest({
          teamName,
          tableNumber,
          queryCategory,
          status: "pending"
        });
        await newRequest.save();
        res.status(200).json({ message: "Request sent successfully" });
      } catch (error) {
        console.error("Error sending message to Discord", error);
        res.status(500).json({ error: "Failed to send request" });
      }
});

app.get("/requests", async (req, res) => {
    try {
        const requests = await mentorRequest.find({});
        res.status(200).json(requests);
        console.log("Requests fetched successfully");
    } catch (error) {
        console.error("Error fetching requests", error);
        res.status(500).json({ error: "Failed to fetch requests" });
    }
});

app.put("/requests/:id", async (req, res) => {
  const { id } = req.params;
  try {
      const request = await mentorRequest.findById(id);
      if (!request) {
          return res.status(404).json({ error: "Request not found" });
      }
      request.status = "resolved";
      await request.save();
      res.status(200).json({ message: "Request status updated to resolved" });
  } catch (error) {
      console.error("Error updating request status", error);
      res.status(500).json({ error: "Failed to update request status" });
  }
});

// Export as Vercel Serverless Function
module.exports = app;
