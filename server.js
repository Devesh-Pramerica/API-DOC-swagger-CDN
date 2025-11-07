const express = require("express");
const fs = require("fs");
const path = require("path");
const basicAuth = require("basic-auth");
const crypto = require("crypto");
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();
const cors = require("cors");
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

const allowedOrigin = "https://apidev.pramericalife.in";

app.use(cors({
  origin: allowedOrigin,
  methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["X-Requested-With", "Content-Type", "Authorization"],
  credentials: true,
}));

// Preflight handling
app.options('*', cors({
  origin: allowedOrigin,
  credentials: true,
}));

//auth 2
// Basic Authentication Middleware
const auth2 = (req, res, next) => {
  const user = basicAuth(req);
  const username = "admin";
  const password = "admin";

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
app.get("/inkasure.yaml", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "inkasure.yaml"));
});

// Serve Swagger UI from CDN with nonce and CSP
app.get("/inkasure", auth, addCspWithNonce, (req, res) => {
  const nonce = res.locals.nonce;
const clientIP = req?.connection?.remoteAddress;
console.log(clientIP);
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
        url: '/gateway/inkasure.yaml',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>`);
});

//advisory portal

app.get("/agentportal.yaml", auth2, (req, res) => {
  res.sendFile(path.join(__dirname, "agentportal.yaml"));
});

// Serve Swagger UI from CDN with nonce and CSP
app.get("/agentportal", auth2, addCspWithNonce, (req, res) => {
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
        url: '/gateway/agentportal.yaml',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/inkasure`);
  console.log(`Swagger UI: http://localhost:${PORT}/agentportal`);
});
