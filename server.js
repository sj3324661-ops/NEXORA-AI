const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        name: "NEXORA AI",
        status: "Online",
        message: "Smart Search चालू है!"
    });
});

app.get("/search", async (req, res) => {

    try {

        let question = req.query.q;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: "सवाल लिखें।"
            });
        }

        // सवाल को साफ करना

        question = question
            .replace(/क्या है\??/gi, "")
            .replace(/कौन है\??/gi, "")
            .replace(/बताओ/gi, "")
            .replace(/what is/gi, "")
            .replace(/who is/gi, "")
            .replace(/[?।!]/g, "")
            .trim();

        // हिंदी या English पहचानना

        const isHindi = /[\u0900-\u097F]/.test(question);

        const wiki = isHindi
            ? "https://hi.wikipedia.org/w/api.php"
            : "https://en.wikipedia.org/w/api.php";

        // Wikipedia Search

        const searchURL = new URL(wiki);

        searchURL.search = new URLSearchParams({
            action: "query",
            list: "search",
            srsearch: question,
            srlimit: "5",
            format: "json",
            utf8: "1"
        });

        const searchResponse = await fetch(searchURL, {
            headers: {
                "User-Agent": "NEXORA-AI/1.0"
            }
        });

        const searchData = await searchResponse.json();

        const results = searchData.query.search;

        if (!results || results.length === 0) {
            return res.json({
                success: true,
                results: []
            });
        }

        // सही लेखों का विवरण लाना

        const pageIds = results
            .map(item => item.pageid)
            .join("|");

        const detailURL = new URL(wiki);

        detailURL.search = new URLSearchParams({
            action: "query",
            pageids: pageIds,
            prop: "extracts",
            exintro: "1",
            explaintext: "1",
            exchars: "700",
            format: "json",
            utf8: "1"
        });

        const detailResponse = await fetch(detailURL, {
            headers: {
                "User-Agent": "NEXORA-AI/1.0"
            }
        });

        const detailData = await detailResponse.json();

        const pages = detailData.query.pages;

        const finalResults = results.map(item => {

            const page = pages[item.pageid];

            return {
                title: item.title,
                description: page?.extract || ""
            };

        });

        res.json({
            success: true,
            language: isHindi ? "Hindi" : "English",
            results: finalResults
        });

    } catch (error) {

        console.log("SEARCH ERROR:", error);

        res.status(500).json({
            success: false,
            error: "Search नहीं हो सकी।"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("NEXORA AI Smart Search चालू है!");
});
