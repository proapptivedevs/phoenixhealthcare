var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var PATIENTS_COLLECTION = "patients";
var TESTS_COLLECTION = "tests";
var RECORDS_COLLECTION = "records";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
  var samplePatientpost = {
    "name": "Jill Collins",
    "age": 26,
    "gender": "F",
    "bloodType": "B",
    "testData": {
    			"bloodPressure": 39,
    			"respiratoryRate": 64,
    			"bloodOxygenlevel": "high",
    			"heartBeatRate":9
    			},
    "records": {
    			"bloodPressure": 29,
    			"respiratoryRate": 93,
    			"bloodOxygenlevel": "fair",
    			"heartBeatRate":11
    			}			
  };
  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App is running at port", port);
   /* console.log('Server %s listening at %s', server.name)
    console.log('Resources:')
    console.log('/patients')
    console.log('Sample Patient post Data: ')
    console.log(samplePatientpost)
    console.log('Sample Patient Get Data: ')
    console.log('/patients/:id')
    console.log('Get all Patients : ')
    console.log('/patients')*/
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/patients"
 *    GET: finds all patients
 *    POST: creates a new patient
 */

app.get("/patients", function(req, res) {
  db.collection(PATIENTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get patients.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/patients", function(req, res) {
  var newPatient = req.body;
  newPatient.createDate = new Date();

  if (!(req.body.firstName || req.body.lastName)) {
    handleError(res, "Invalid user input", "Must provide a first or last name.", 400);
  }

  db.collection(PATIENTS_COLLECTION).insertOne(newPatient, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new patient.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/patients/:id"
 *    GET: find patient by id
 *    PUT: update patient by id
 *    DELETE: deletes patient by id
 */

app.get("/patients/:id", function(req, res) {
  db.collection(PATIENTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get patient");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/patients/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(PATIENTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update patient");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/patients/:id", function(req, res) {
  db.collection(PATIENTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete patient");
    } else {
      res.status(204).end();
    }
  });
});