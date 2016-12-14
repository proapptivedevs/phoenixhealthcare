var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var ObjectID = mongodb.ObjectID;
var PATIENTS = "patients";
var TESTS = "tests";
var RECORDS = "records";
var USERS = "users";

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// DB and Server Connectivity

var db;
var URI = process.env.MONGODB_URI;
if (!URI)
  URI = 'mongodb://127.0.0.1:27017/eHealthCare';

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");
  // Initialize the app.
  var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("App is running at port", port);
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
  db.collection(PATIENTS).find({}).toArray(function(err, docs) {
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

  db.collection(PATIENTS).insertOne(newPatient, function(err, doc) {
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
  db.collection(PATIENTS).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.messsage, "Failed to get patient");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/patients/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(PATIENTS).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update patient");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/patients/:id", function(req, res) {
  db.collection(PATIENTS).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete patient");
    } else {
      res.status(204).end();
    }
  });
});


// records
app.get('/patient/:id/record', function (req, res, next) {
   patientRecordSave.find({ patient_id: req.params.id }, function (error, patientRecords) {
   res.send(patientRecords)
  });
});


app.post('/patient/:id/record', function (req, res, next) {

  if (req.params.date === undefined ) {
    return next(new restify.InvalidArgumentError('date must be supplied'))
  }
  if (req.params.type === undefined ) {
    return next(new restify.InvalidArgumentError('type must be supplied'))
  }
  if (req.params.value1 === undefined ) {
    return next(new restify.InvalidArgumentError('value1 must be supplied'))
  }
  if (req.params.nurse === undefined ) {
    return next(new restify.InvalidArgumentError('nurse must be supplied'))
  }
  
  
  var newPatientRecord = {
		patient_id: req.params.id, 
		date: req.params.date, 
		type: req.params.type,
		value1: req.params.value1,
		value2: req.params.value2,
		nurse: req.params.nurse
	}

  patientRecordSave.create( newPatientRecord, function (error, patient) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)))
    res.send(201, newPatientRecord)
  });
});


