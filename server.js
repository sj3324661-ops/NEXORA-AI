const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
res.json({
name: "NEXORA AI",
status: "Online",
message: "NEXORA AI चालू है!"
});
});

app.get("/search", async (req, res) => {
try {
const query = req.query.q;

    if (!query) {
        return res.status(400).json({
            error: "सवाल लिखना जरूरी है।"
        });
    }

    const url =
        "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
        encodeURIComponent(query) +
        "&format=json";

    const response = await fetch(url);
    const data = await response.json();

    const results = data.query.search.map(item => ({
        title: item.title,
        description: item.snippet.replace(/<[^>]*>/g, "")
    }));

    res.json({
        success: true,
        results: results
    });

} catch (error) {
    res.status(500).json({
        success: false,
        error: "खोज नहीं हो सकी।"
    });
}

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("NEXORA AI चालू है!");
});
