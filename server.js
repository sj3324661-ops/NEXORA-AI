const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// HOME PAGE

app.get("/", (req, res) => {

    res.json({
        name: "NEXORA AI",
        status: "Online",
        message: "NEXORA AI Smart Search चालू है!"
    });

});


// ROMAN HINDI CONVERTER

function convertRomanHindi(question) {

    let q = question.toLowerCase().trim();

    const replacements = [

        [/\bbharat\b/g, "India"],
        [/\bindia\b/g, "India"],
        [/\bbharat desh\b/g, "India"],

        [/\btaj mahal\b/g, "Taj Mahal"],
        [/\bdelhi\b/g, "Delhi"],
        [/\bmumbai\b/g, "Mumbai"],
        [/\buttar pradesh\b/g, "Uttar Pradesh"],
        [/\bnepal\b/g, "Nepal"],

        [/\bpradhan mantri\b/g, "Prime Minister"],
        [/\brashtrapati\b/g, "President"],
        [/\brajdhaani\b/g, "capital"],
        [/\brajdhani\b/g, "capital"],
        [/\bitihaas\b/g, "history"],
        [/\bvigyan\b/g, "science"],
        [/\bcomputer\b/g, "computer"],
        [/\bmobile\b/g, "mobile phone"]

    ];

    replacements.forEach(([pattern, replacement]) => {

        q = q.replace(pattern, replacement);

    });

    q = q
        .replace(/\bkya hai\b/g, "")
        .replace(/\bkya hota hai\b/g, "")
        .replace(/\bkaun hai\b/g, "")
        .replace(/\bbatao\b/g, "")
        .replace(/\bsamjhao\b/g, "")
        .replace(/[?!.,]/g, "")
        .trim();

    return q;
}


// SMART SEARCH

app.get("/search", async (req, res) => {

    try {

        let question = req.query.q;

        if (!question) {

            return res.status(400).json({

                success: false,
                error: "कृपया अपना सवाल लिखें।"

            });

        }


        // LANGUAGE DETECTION

        const isHindi = /[\u0900-\u097F]/.test(question);


        // QUESTION CLEANING

        if (isHindi) {

            question = question
                .replace(/क्या है\??/gi, "")
                .replace(/कौन है\??/gi, "")
                .replace(/क्या होता है\??/gi, "")
                .replace(/बताओ/gi, "")
                .replace(/समझाओ/gi, "")
                .replace(/[?!।]/g, "")
                .trim();

        } else {

            question = convertRomanHindi(question);

        }


        // WIKIPEDIA LANGUAGE

        const wiki = isHindi
            ? "https://hi.wikipedia.org/w/api.php"
            : "https://en.wikipedia.org/w/api.php";


        // SEARCH REQUEST

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

                "User-Agent": "NEXORA-AI/1.0 (AI Assistant)"

            },

            signal: AbortSignal.timeout(15000)

        });


        if (!searchResponse.ok) {

            throw new Error("Wikipedia Search Error");

        }


        const searchData = await searchResponse.json();

        const results = searchData.query?.search || [];


        // NO RESULTS

        if (results.length === 0) {

            return res.json({

                success: true,
                results: []

            });

        }


        // GET ARTICLE DETAILS

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
            exchars: "1000",
            format: "json",
            utf8: "1"

        });


        const detailResponse = await fetch(detailURL, {

            headers: {

                "User-Agent": "NEXORA-AI/1.0 (AI Assistant)"

            },

            signal: AbortSignal.timeout(15000)

        });


        if (!detailResponse.ok) {

            throw new Error("Wikipedia Article Error");

        }


        const detailData = await detailResponse.json();

        const pages = detailData.query?.pages || {};


        // FINAL RESULTS

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

            searchedQuestion: question,

            results: finalResults

        });


    } catch (error) {

        console.log("SEARCH ERROR:", error);

        res.status(500).json({

            success: false,

            error: "इंटरनेट सर्च नहीं हो सकी।"

        });

    }

});


// SERVER START

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("NEXORA AI Smart Search चालू है!");

});
