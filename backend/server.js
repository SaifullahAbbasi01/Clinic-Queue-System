const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());

app.get("/generate/:service", (req, res) => {
  const service = req.params.service;
  const prefix = ["","R","D","P"];

  db.query(
    "SELECT COUNT(*) AS c FROM tokens WHERE service_id=?",
    [service],
    (err, result) => {
      const count = result[0].c + 1;
      const token = prefix[service] + String(count).padStart(3, "0");

      db.query(
        "INSERT INTO tokens(token_number, service_id) VALUES (?, ?)",
        [token, service]
      );
      res.send("Your Token: " + token);
    }
  );
});

app.get("/call-next", (req, res) => {
  db.query("UPDATE tokens SET status='served' WHERE status='serving'");
  db.query(
    "SELECT * FROM tokens WHERE status='waiting' ORDER BY token_id LIMIT 1",
    (err, result) => {
      if (result.length === 0) {
        res.send("No tokens");
      } else {
        db.query(
          "UPDATE tokens SET status='serving' WHERE token_id=?",
          [result[0].token_id]
        );
        res.send("Now Serving: " + result[0].token_number);
      }
    }
  );
});

app.get("/display", (req, res) => {
  db.query(
    "SELECT token_number FROM tokens WHERE status='serving' ORDER BY token_id DESC LIMIT 1",
    (err, result) => {
      res.send(result.length ? result[0].token_number : "Waiting");
    }
  );
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
