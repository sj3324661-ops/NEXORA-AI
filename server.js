const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// NEXORA AI Home
app.get("/", (req, res) => {
    res.json({
        name: "NEXORA AI",
        status: "Online",
        message: "NEXORA AI चालू है!"
    });
});

// HTML कोड साफ करने का फंक्शन
function cleanText(text) {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

// Internet Search
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: "कृपया अपना सवाल लिखें।"
            });
        }

        const url =
            "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
            encodeURIComponent(query) +
            "&format=json&utf8=1";

        const response = await fetch(url, {
            headers: {
                "User-Agent": "NEXORA-AI/1.0"
            },
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            throw new Error("Wikipedia Error: " + response.status);
        }

        const data = await response.json();

        const results = data.query.search.map(item => ({
            title: cleanText(item.title),
            description: cleanText(item.snippet)
        }));

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error("SEARCH ERROR:", error);

        res.status(500).json({
            success: false,
            error: "इंटरनेट सर्च नहीं हो सकी।"
        });
    }
});

// Server Start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("NEXORA AI चालू है!");
});
