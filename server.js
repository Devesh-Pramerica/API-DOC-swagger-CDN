const express = require("express");
const fs = require("fs");
const path = require("path");
const basicAuth = require("basic-auth");
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();

const app = express();
const PORT = 3010;

// Basic Authentication Middleware
const auth = (req, res, next) => {
    console.log(req)
  const user = basicAuth(req);
  const username = "admin";
  const password = "password";

  if (!user || user.name !== username || user.pass !== password) {
    res.set("WWW-Authenticate", 'Basic realm="Swagger UI"');
    return res.status(401).send("Authentication required.");
  }
  next();
};

/*
//With CDN
//Serve Swagger YAML
app.get("/swagger4.yaml", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "swagger4.yaml"));
});

//Serve Swagger UI from CDN
app.get("/docs1", auth, (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui.css" >
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: '/swagger4.yaml',
        dom_id: '#swagger-ui',
      });
    };
  </script>
</body>
</html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
*/


//Without CDN

// Serve Swagger UI static assets (locally from node_modules)

app.use("/swagger-ui", express.static(swaggerUiAssetPath));

// Serve your Swagger YAML file (protected)
app.get("/swagger4.yaml", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "swagger4.yaml"));
});

// Serve the Swagger UI page (protected)
app.get("/docs1", auth, (req, res) => {
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
  <script src="/swagger-ui/swagger-ui-bundle.js"></script>
  <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
  <script>
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});

