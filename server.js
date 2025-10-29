const express = require("express");
const fs = require("fs");
const path = require("path");
const basicAuth = require("basic-auth");
const crypto = require("crypto");
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();

const app = express();
const PORT = 3080;

// Basic Authentication Middleware
const auth = (req, res, next) => {
  const user = basicAuth(req);
  const username = "admin";
  const password = "password";

  if (!user || user.name !== username || user.pass !== password) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger UI"');
    return res.status(401).send("Authentication required.");
  }
  next();
};

// Middleware to add CSP headers with nonce
const addCspWithNonce = (req, res, next) => {
  // Generate a random nonce
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce;

  // Set CSP header
  res.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' https://advisoruat.pramericalife.in 'nonce-${nonce}'; style-src 'self' https://advisoruat.pramericalife.in 'nonce-${nonce}' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:;`
  );

  next();
};

// Serve Swagger YAML
app.get("/swagger4.yaml", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "swagger4.yaml"));
});

// Serve Swagger UI from CDN with nonce and CSP
app.get("/docs1", auth, addCspWithNonce, (req, res) => {
  const nonce = res.locals.nonce;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://advisoruat.pramericalife.in/swagger-ui.css" nonce="${nonce}">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://advisoruat.pramericalife.in/swagger-ui-bundle.js" nonce="${nonce}"></script>
  <script nonce="${nonce}">
    window.onload = function() {
      SwaggerUIBundle({
        url: 'https://advisoruat.pramericalife.in/swagger4.yaml',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs1`);
});
