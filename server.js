require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

var urlList = [];
var sum = 0;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.post("/api/shorturl", function(req, res) {
    var input = req.body.url;
    if (/^ftp/.test(input)) {
        res.json({ error: "invalid url" });
    } else {
        try {
            var url = new URL(input);
        } catch (e) {
            res.json({ error: "invalid url" })
        };
        dns.lookup(url.hostname, (error, address, family) => {
            if (error) {
                res.json({ error: "invalid url" });
            } else {

                var result = urlList.filter(d => d.original_url === input);
                if (result.length == 0) {
                    sum += 1;
                    result = { original_url: input, short_url: sum };
                    urlList.push(result);
                    console.log(urlList);
                } else {
                    result = result[0];
                }

                res.json(result);
            }
        });
    }
});

app.get("/api/shorturl/:key", (req, res) => {
    var key = req.params.key;
    console.log(key);
    console.log(urlList);
    var result = urlList.filter(d => d.short_url == key);
    if (!result[0]) {
        res.json({ "error": "No short URL found for the given input" });
    } else {
        console.log(result);
        res.redirect(301, result[0].original_url);
    }
});

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});