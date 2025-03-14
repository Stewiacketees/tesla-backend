const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Tesla API Token (Use an environment variable for security)
const TESLA_API_TOKEN = process.env.TESLA_API_TOKEN;

app.get("/tesla-location", async (req, res) => {
    if (!TESLA_API_TOKEN) {
        return res.status(500).json({ error: "Tesla API Token is missing" });
    }

    try {
        // Get list of vehicles
        const vehiclesResponse = await fetch("https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles", {
            headers: { Authorization: `Bearer ${TESLA_API_TOKEN}` }
        });
        const vehiclesData = await vehiclesResponse.json();

        if (!vehiclesData.response || vehiclesData.response.length === 0) {
            return res.status(404).json({ error: "No Tesla vehicles found" });
        }

        const vehicleId = vehiclesData.response[0].id;

        // Get vehicle location
        const locationResponse = await fetch(`https://fleet-api.prd.na.vn.cloud.tesla.com/api/1/vehicles/${vehicleId}/vehicle_data`, {
            headers: { Authorization: `Bearer ${TESLA_API_TOKEN}` }
        });
        const locationData = await locationResponse.json();

        if (!locationData.response || !locationData.response.drive_state) {
            return res.status(404).json({ error: "Location data not available" });
        }

        const { latitude, longitude, heading } = locationData.response.drive_state;

        res.json({ latitude, longitude, heading });
    } catch (error) {
        console.error("Error fetching Tesla data:", error);
        res.status(500).json({ error: "Failed to retrieve Tesla location" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
