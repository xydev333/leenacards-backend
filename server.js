var express = require("express");
var fs = require("fs");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var fileUpload = require("express-fileupload");
var mailer = require("express-mailer");
var dotenv = require("dotenv");
var ev = require("express-validation");
var categoryUploadHandler = require("./controllers/categoryUpload");
var typeUploadHandler = require("./controllers/typeUpload");
var adminUploadHandler = require("./controllers/adminUpload");
var cardUploadHandler = require("./controllers/cardUpload");
var bannerUploadHandler = require("./controllers/bannerUpload");
var advertiseUploadHandler = require("./controllers/advertiseUpload");
var CheckReservedCard = require("./controllers/Queue/CheckReservedCard");
var knetController = require("./controllers/knetController");

require("babel-core/register");
require("babel-polyfill");

require("babel-register")({
  presets: ["env"]
});

var app = express();
app.use(express.static(path.join(__dirname, 'public')));
dotenv.config();
// dotenv.load();
// var port = process.env.PORT;

// app.use(logger('dev'));

// // create a write stream (in append mode)
// var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

// // setup the logger
// app.use(logger('combined', {stream: accessLogStream}));

// tell the app to parse HTTP body messages- will accept 2 mb data
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "2.7mb", extended: false }));
app.use(bodyParser.urlencoded({ limit: "2.7mb", extended: false }));

// parse application/json
app.use(bodyParser.json());

// Set views folder for emails
app.set('views', __dirname + '/views');
// Set template engine for view files
app.set('view engine', 'ejs');

//minified json
app.set('json spaces', 0);

// SMTP setting
console.log("!!!!!username", process.env.MAIL_SENDER, process.env.MAIL_USERNAME, process.env.MAIL_PASSWORD, process.env.MAIL_PORT, process.env.MAIL_HOST, process.env.MAIL_SECURE_CONNECTION, process.env.MAIL_TRANSPORT_METHOD);
console.log('"' + process.env.SERVICE_NAME + '" <' + process.env.MAIL_SENDER + '>');
mailer.extend(app, {
	from: '"' + process.env.SERVICE_NAME + '" <' + process.env.MAIL_SENDER + '>',
	host: process.env.MAIL_HOST, // hostname
	secureConnection: process.env.MAIL_SECURE_CONNECTION, // use SSL
	port: process.env.MAIL_PORT, // port for secure SMTP
	transportMethod: process.env.MAIL_TRANSPORT_METHOD, // default is SMTP. Accepts anything that nodemailer accepts
	auth: {
	  	user: process.env.MAIL_USERNAME,
	  	pass: process.env.MAIL_PASSWORD
	}
});

app.use(cors());

// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:8000"],
//     methods: ["GET", "POST"],
//     credentials: true // enable set cookie
//   })
// );

// app.use(cookieParser());
// app.use(fileUpload({
//   limits: { fileSize: 60 * 1024 * 1024 },
// }));

// // tell the app to look for static files in these directories
// // app.use(express.static(path.join(__dirname, 'assets/users')));
// // app.use(express.static(path.join(__dirname, 'web/build')));

app.all("/*", function(req, res, next) {
  // 	// CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  // Set custom headers for CORS
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Access-Token,X-Key,Authorization,Client-Key"
  );

  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

app.set("view engine", "ejs");

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
// Any URL's that do not follow the below pattern should be avoided unless you
// are sure that authentication is not needed
app.all('/v1/auth/*', [
	require('./middlewares/validaterequest')
]);

app.use("/category/upload", categoryUploadHandler);
app.use("/type/upload", typeUploadHandler);
app.use("/card/upload", cardUploadHandler);
app.use("/banner/upload", bannerUploadHandler);
app.use("/admin/upload", adminUploadHandler);
app.use("/advertise/upload", advertiseUploadHandler);

app.use("/pay/knet", knetController);

// app.use('/images', express.static('photos'))

app.use("/", require("./routes"));

// For express-validation
// app.use(function (err, req, res, next) {
// 	// specific for validation errors
// 	if (err instanceof ev.ValidationError) return res.status(400).json(err);

// 	// other type of errors, it *might* also be a Runtime Error
// 	// example handling
// 	if (process.env.NODE_ENV !== 'production') {
// 	  return res.status(404).json({status: 404, message:'URL not found'});
// 	} else {
// 	  return res.status(404).json({status: 404, message:'URL not found'});
// 	}
//   });

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  // next(err);
  return res.status(404).send({ status: 404, message: "URL not found" });
});

//CheckReservedCard queue
CheckReservedCard.addQueue(null, "CheckReservedCard", {});

// Start the server
// app.set('port', production.SERVER_PORT || process.env.PORT);
var server = app.listen(1198, function() {
  // console.log("Express server listening on port " + 1198);
});
