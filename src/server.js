require("./config/db");

const app = require("express")();
const bodyParser = require('express').json;
const cors = require('cors');
const routes = require("./routes");
const cookies = require("cookie-parser");
const expressJSDocSwagger = require('express-jsdoc-swagger');

const options = {
    info: {
      version: '1.0.0',
      title: 'trycrypto API',
      license: {
        name: 'MIT',
      },
    },
    security: {
      BasicAuth: {
        type: 'http',
        scheme: 'basic',
      },
    },
    // Base directory which we use to locate your JSDOC files
    baseDir: __dirname,
    // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
    filesPattern: './**/*.js',
    // URL where SwaggerUI will be rendered
    swaggerUIPath: '/api-docs',
    // Expose OpenAPI UI
    exposeSwaggerUI: true,
    // Expose Open API JSON Docs documentation in `apiDocsPath` path.
    exposeApiDocs: false,
    // Open API JSON Docs endpoint.
    apiDocsPath: '/v1/api-docs',
    // Set non-required fields as nullable by default
    notRequiredAsNullable: false,
    // You can customize your UI options.
    // you can extend swagger-ui-express config. You can checkout an example of this
    // in the `example/configuration/swaggerOptions.js`
    swaggerUiOptions: {},
    // multiple option in case you want more that one instance
    multiple: true,
  };
  
  expressJSDocSwagger(app)(options);

app.use(cookies());
app.use(bodyParser());
app.use(
  cors({ 
      credentials: true, 
      origin: "http://127.0.0.1:5173", 
      exposedHeaders: ["Set-Cookie"] 
  })
);
app.use(routes);


module.exports = app;