const express = require("express");
const fs = require("fs");
const path = require("path");
const basicAuth = require("basic-auth");
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();

const app = express();
const PORT = 3080;

// Content Security Policy (CSP) Middleware with nonce
app.use((req, res, next) => {
  // Generate a unique nonce per request (for inline scripts)
  const nonce = Buffer.from(Date.now().toString()).toString("base64");
  res.locals.nonce = nonce;

  // Strict but Swagger-compatible CSP
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' blob:; style-src 'self' 'unsafe-inline';`
  );

  next();
});

// ✅ Basic Authentication Middleware
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

// Serve Swagger UI (no CDN version)

// Serve Swagger UI static assets from node_modules
app.use("/swagger-ui", express.static(swaggerUiAssetPath));

// Serve your Swagger YAML file (protected)
app.get("/swagger4.yaml", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "swagger4.yaml"));
});

// Serve the Swagger UI HTML page (protected)
app.get("/docs1", auth, (req, res) => {
  const nonce = res.locals.nonce; // Use nonce from middleware

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>

  <!-- All scripts include the same nonce -->
  <script nonce="${nonce}" src="/swagger-ui/swagger-ui-bundle.js"></script>
  <script nonce="${nonce}" src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
  <script nonce="${nonce}">
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/swagger4.yaml',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>
  `);
});

// ================================
// Start the server
// ================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs1`);
});
