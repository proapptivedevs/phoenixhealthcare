angular.module("patientsApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    patients: function(Patients) {
                        return Patients.getPatients();
                    }
                }
            })
            .when("/new/patient", {
                controller: "NewPatientController",
                templateUrl: "patient-form.html"
            })
             .when("/tests", {
                controller: "TestListController",
                templateUrl: "tests.html"
            })
             .when("/new/tests", {
                controller: "NewTestController",
                templateUrl: "add-test.html"
            })
             .when("/records", {
                controller: "RecordListController",
                templateUrl: "records.html"
            })
            .when("/update/record", {
                controller: "UpdateRecordController",
                templateUrl: "update-record.html"
            })
            .when("/patient/:patientId", {
                controller: "EditPatientController",
                templateUrl: "patient.html"
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Patients", function($http) {
        this.getPatients = function() {
            return $http.get("/patients").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding patients.");
                });
        }
        this.createPatient = function(patient) {
            return $http.post("/patients", patient).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating patient.");
                });
        }
        this.getPatient = function(patientId) {
            var url = "/patients/" + patientId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this patient.");
                });
        }
        this.editPatient = function(patient) {
            var url = "/patients/" + patient._id;
            console.log(patient._id);
            return $http.put(url, patient).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this patient.");
                    console.log(response);
                });
        }
        this.deletePatient = function(patientId) {
            var url = "/patients/" + patientId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this patient.");
                    console.log(response);
                });
        }
    })
    .controller("ListController", function(patients, $scope) {
        $scope.patients = patients.data;
    })
    .controller("NewPatientController", function($scope, $location, Patients) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.savePatient = function(patient) {
            Patients.createPatient(patient).then(function(doc) {
                var patientUrl = "/patient/" + doc.data._id;
                $location.path(patientUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditPatientController", function($scope, $routeParams, Patients) {
        Patients.getPatient($routeParams.patientId).then(function(doc) {
            $scope.patient = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.patientFormUrl = "patient-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.patientFormUrl = "";
        }

        $scope.savePatient = function(patient) {
            Patients.editPatient(patient);
            $scope.editMode = false;
            $scope.patientFormUrl = "";
        }

        $scope.deletePatient = function(patientId) {
            Patients.deletePatient(patientId);
        }
    });