// import necessary files
const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();
const port = process.env.PORT || 5002;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

// database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@doctorsfinderbd-cluster.s3mzmtk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    // await client.connect();
    //   create all collection
    const doctorsCollection = client
      .db("doctorsFinderBD")
      .collection("doctors");
    const patientCollection = client
      .db("doctorsFinderBD")
      .collection("patients");
    const adminsCollection = client.db("doctorsFinderBD").collection("admins");
    const topDoctorsCollection = client
      .db("doctorsFinderBD")
      .collection("topDoctors");
    const feedbacksCollection = client
      .db("doctorsFinderBD")
      .collection("feedbacks");
    /* 
==================================================
                    Admin
==========================================================================================
*/
    // get single admins
    app.get("/admins/:emailId", async (req, res) => {
      const email = req.params.emailId;
      const admin = await adminsCollection.findOne({ email: email });
      // console.log(admin);
      res.send(admin);
    });

    /* update doctor verification status */
    app.put("/updateDocVerification", async (req, res) => {
      const updatedInf = req.body;
      const result = await doctorsCollection.updateOne(
        { email: updatedInf.email },
        { $set: { isVerified: "true" } }
      );
      res.send(result);
    });

    /* 
==================================================
                    Doctor
==========================================================================================
*/

    // get all doctors
    app.get("/allDoctors", async (req, res) => {
      const doctors = await doctorsCollection.find({}).toArray();
      res.send(doctors);
      console.log(res);
    });
    // get single doctors
    app.get("/allDoctors/:emailId", async (req, res) => {
      const doctor = await doctorsCollection.findOne({
        email: req.params.emailId,
      });
      res.send(doctor);
    });
    // get single doctors by boject id
    app.get("/detailsDoctor/:pId", async (req, res) => {
      const doctor = await doctorsCollection.findOne({
        _id: new ObjectId(req.params.pId),
      });
      res.send(doctor);
    });
    // add a doctor to db
    app.post("/adddoctor", async (req, res) => {
      const newDoctor = {
        role: "doctor",
        isRegistered: "true",
        isVerified: "false",
        license: `${req.body.license}`,
        name: `${req.body.name}`,
        email: `${req.body.email}`,
        phn: `${req.body.mobile}`,
        skills: [],
        tags: [],
        imgUrl: "",
        chamber: "",
        appointmentRequest: [],
        schedule: [],
        dob: "",
        dFeedbacks: [],
        location: "",
        appointmentFee: "",
      };
      // console.log(req.body);
      const result = await doctorsCollection.insertOne(newDoctor);
      res.send(result);
    });

    /* update doctor profile */
    app.put("/updateDoctors/:email", async (req, res) => {
      const updatedInfo = req.body;

      const updatedResult = await doctorsCollection.updateOne(
        { email: req.params.email },
        {
          $set: {
            name: updatedInfo.name,
            dob: updatedInfo.dob,
            chamber: updatedInfo.chamber,
            phn: updatedInfo.phn,
            skills: updatedInfo.skills,
            location: updatedInfo.location,
            appointmentFee: updatedInfo.appointmentFee,
          },
        }
      );
      res.send(updatedResult);
      // console.log(updatedResult);
    });

    /* load doctor based on distric */
    app.get("/areaDoctor/:dis", async (req, res) => {
      // console.log("ok");
      const allData = await doctorsCollection.find({}).toArray();
      const filteredData = allData?.filter(
        (d) => d?.location.toLowerCase() == req.params.dis.toLocaleLowerCase()
      );
      res.send(filteredData);
    });

    /* load doctor based on distric */
    app.get("/daisesDoctor/:problemName", async (req, res) => {
      const lowerCase = req.params.problemName.toLocaleLowerCase();
      // console.log(lowerCase);
      // console.log(req.params.problemName);
      const filterData = await doctorsCollection
        .find({
          $or: [
            { "skills.addedSkill": `${req.params.problemName}` },
            { "skills.addedSkill": lowerCase },
          ],
        })
        .toArray();

      res.send(filterData);
      // console.log(filterData);
    });

    /* 
==================================================
                    patient
==========================================================================================
*/
    // get all patients
    app.get("/allPatients", async (req, res) => {
      const patients = await patientCollection.find({}).toArray();
      res.send(patients);
    });
    // get single patients
    app.get("/allPatients/:emailId", async (req, res) => {
      const patient = await patientCollection.findOne({
        email: req.params.emailId,
      });
      res.send(patient);
    });

    // add a patient to db
    app.post("/addpatient", async (req, res) => {
      const newPatient = {
        role: "patient",
        name: `${req.body.name}`,
        email: `${req.body.email}`,
        mobile: `${req.body.mobile}`,
        imgUrl: "",
        appointment: [],
      };
      // console.log(req.body);
      const result = await patientCollection.insertOne(newPatient);
      res.send(result);
    });

    app.put("/updatePatient/:email", async (req, res) => {
      const email = req.params.email;
      const updatedInfo = req.body;

      const updatedResult = await patientCollection.updateOne(
        { email: email },
        {
          $set: {
            name: updatedInfo.name,
            mobile: updatedInfo.mobile,
          },
        }
      );
      res.send(updatedResult);
    });

    /*   Submit feedback to doctor to db  */

    app.put("/sendFeedback/doctor/:docEmail", async (req, res) => {
      const docemail = req.params.docEmail;

      const result = await doctorsCollection.updateOne(
        { email: docemail },
        {
          $push: {
            dFeedbacks: req.body,
          },
        }
      );
      // console.log(docemail);
      res.send(result);
    });

    /* 
==================================================
                    Feedback
==========================================================================================
*/
    // get all feedbacks
    app.get("/allFeedback", async (req, res) => {
      const feedbacks = await feedbacksCollection.find({}).toArray();
      res.send(feedbacks);
    });

    /* 
==================================================
                    Top Doctors
==========================================================================================
*/

    // get all
    app.get("/topDoctors", async (req, res) => {
      const topDoctors = await topDoctorsCollection.find({}).toArray();
      res.send(topDoctors);
    });
    // add top doctors from doctor list
    app.post("/addTopDoctor", async (req, res) => {
      const newTopDoctor = req.body;
      const result = await topDoctorsCollection.insertOne(newTopDoctor);
      res.send(result);
    });

    // remove from top doctor list
    app.delete("/deleteDoctortop/:id", async (req, res) => {
      const deletedId = req.params.id;
      const result = await topDoctorsCollection.deleteOne({
        _id: new ObjectId(deletedId),
      });
      res.send(result);
    });

    /* =====================================================================
              Add appoint in both user
========================================================================
*/

    app.put("/bookedAppointment/:doctorId/:patientId", async (req, res) => {
      const doctorId = req.params.doctorId;
      const patientId = req.params.patientId;
      const appointmentData = req.body;
      const newAppointId = new ObjectId();

      // daTA
      const appointmentDoctorData = {
        status: "Not Accepted",
        time: appointmentData.time,
        patientDetails: {
          name: appointmentData.patientInfo.name,
          emailId: appointmentData.patientInfo.email,
          mobile: appointmentData.patientInfo.mobile,
          age: appointmentData.patientInfo.age,
          sex: appointmentData.patientInfo.sex,
        },
        platform: appointmentData.platform,
        problems: {
          title: appointmentData.problem.title,
          desc: appointmentData.problem.desc,
        },
        meetingLink: "",
        appointID: new ObjectId(newAppointId),
      };

      /* make data for patient appointment */
      const appointmentPatientData = {
        doctorName: appointmentData.docInfo.name,
        doctorEmail: appointmentData.docInfo.email,
        status: "Not Accepted",
        time: appointmentData.time,
        platform: appointmentData.platform,
        problem: {
          title: appointmentData.problem.title,
          desc: appointmentData.problem.desc,
        },
        meetingLink: "",
        appointID: new ObjectId(newAppointId),
      };

      const doctorResult = await doctorsCollection.updateOne(
        { _id: new ObjectId(doctorId) },
        {
          $push: {
            appointmentRequest: appointmentDoctorData,
          },
        }
      );
      // console.log(doctorResult);

      const patientResult = await patientCollection.updateOne(
        { _id: new ObjectId(patientId) },
        {
          $push: {
            appointment: appointmentPatientData,
          },
        }
      );

      if (
        patientResult.modifiedCount === 1 &&
        doctorResult.modifiedCount === 1
      ) {
        res.send({ status: "OK", code: 200 });
      } else {
        res.send({ status: "error", code: 400 });
      }
    });

    /* update appointment time  */
    app.put("/updateTime/:email", async (req, res) => {
      const updatedInfo = req.body;
      let patientEmail = "";
      console.log(updatedInfo);
      const doctor = await doctorsCollection.findOne({
        email: req.params.email,
      });
      const allAppointments = doctor.appointmentRequest;

      allAppointments.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.time = `${updatedInfo.time}`;
          patientEmail = appointment.patientDetails.emailId;
        }
      });

      const updatedResult = await doctorsCollection.updateOne(
        { email: req.params.email },
        {
          $set: {
            appointmentRequest: allAppointments,
          },
        }
      );

      // update is patient db
      const patient = await patientCollection.findOne({ email: patientEmail });

      const allPatientAppointment = patient.appointment;

      allPatientAppointment.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.time = `${updatedInfo.time}`;
        }
      });

      const updatedResult2 = await patientCollection.updateOne(
        { email: patientEmail },
        {
          $set: {
            appointment: allPatientAppointment,
          },
        }
      );
      //
      if (
        updatedResult.modifiedCount === 1 &&
        updatedResult2.modifiedCount === 1
      ) {
        res.send({ status: "OK", code: 200 });
      } else {
        res.send({ status: "error", code: 400 });
      }
      // res.send(updatedResult);
    });

    /* update request status */

    app.put("/updateStatus/:email", async (req, res) => {
      const updatedInfo = req.body;
      let patientEmail = "";
      const doctor = await doctorsCollection.findOne({
        email: req.params.email,
      });
      const allAppointments = doctor.appointmentRequest;

      allAppointments.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.status = `${updatedInfo.status}`;
          patientEmail = appointment.patientDetails.emailId;
          // console.log(appointment);
        }
      });

      const updatedResult = await doctorsCollection.updateOne(
        { email: req.params.email },
        {
          $set: {
            appointmentRequest: allAppointments,
          },
        }
      );

      // UPDATE PATIENT DB
      const patient = await patientCollection.findOne({ email: patientEmail });

      const allPatientAppointment = patient.appointment;
      // console.log(allPatientAppointment);
      allPatientAppointment.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.status = `${updatedInfo.status}`;
          // console.log(appointment);
        }
      });

      const updatedResult2 = await patientCollection.updateOne(
        { email: patientEmail },
        {
          $set: {
            appointment: allPatientAppointment,
          },
        }
      );
      if (
        updatedResult.modifiedCount === 1 &&
        updatedResult2.modifiedCount === 1
      ) {
        res.send({ status: "OK", code: 200 });
      } else {
        res.send({ status: "error", code: 400 });
      }
    });

    /* appointment link updated */

    app.put("/updateLink/:email", async (req, res) => {
      const updatedInfo = req.body;
      let patientEmail = "";
      const doctor = await doctorsCollection.findOne({
        email: req.params.email,
      });
      const allAppointments = doctor.appointmentRequest;

      allAppointments.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.meetingLink = `${updatedInfo.meetingLink}`;
          patientEmail = appointment.patientDetails.emailId;
        }
      });

      const updatedResult = await doctorsCollection.updateOne(
        { email: req.params.email },
        {
          $set: {
            appointmentRequest: allAppointments,
          },
        }
      ); /* 
      console.log(updatedResult);
      res.send(updatedResult); */

      // UPDATE PATIENT DB
      const patient = await patientCollection.findOne({ email: patientEmail });

      const allPatientAppointment = patient.appointment;
      // console.log(allPatientAppointment);
      allPatientAppointment.map((appointment) => {
        const obId = new ObjectId(appointment.appointID).toString();
        if (`${obId}` === `${updatedInfo.idx}`) {
          appointment.meetingLink = `${updatedInfo.meetingLink}`;
          // console.log(appointment);
        }
      });

      const updatedResult2 = await patientCollection.updateOne(
        { email: patientEmail },
        {
          $set: {
            appointment: allPatientAppointment,
          },
        }
      );
      if (
        updatedResult.modifiedCount === 1 &&
        updatedResult2.modifiedCount === 1
      ) {
        res.send({ status: "OK", code: 200 });
      } else {
        res.send({ status: "error", code: 400 });
      }
    });
  } finally {
  }
}

client.connect((err) => {
  // const collection = client.db("doctorsFinderBD").collection("users");
  console.log("DB CONNECT");
  // perform actions on the collection object
  client.close();
});
run().catch(console.dir);
// test server
app.get("/", (req, res) => {
  res.send("Hi learning zone api is running! ");
});

app.listen(port, () => {
  console.log("Server is running on port= ", port);
});
