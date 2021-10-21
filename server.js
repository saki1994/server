const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

//user Schema

const dailySchema = new mongoose.Schema({
  polish: String,
  english: String, 
  dateAdded: String,
  wordStatus: {
    hasTested: Boolean,
    repeated: Boolean,
    timesRepeated: Number,
  },
});

const Daily = new mongoose.model("Language", dailySchema);

app
  .route("/")

  .get((req, res) => {
    Daily.find({}, (err, foundWords) => {
      res.send(foundWords);
    }); 

    
  })

  .patch((req, res) => {
    Daily.findOneAndUpdate(
      { _id: req.body._id },
      { $set: req.body },
      function (err) {
        !err && console.log("Successfully edited");
      }
    );
  })

  .delete((req, res) => {
    Daily.deleteOne({ id: req.body._id }, (err) => {
      !err && console.log("Successfully deleted");
    });
  })

  .post((req, res) => {
    const fullDate = new Date();
    const  date = fullDate.getDate();
    const  month = fullDate.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
    const  year = fullDate.getFullYear();

    const dateAdded = date + "/" + month + "/" + year;

    const { polish, english, wordStatus } = req.body;

    Daily.findOne({ english: english }, (err, foundWord) => {
      if (foundWord) {
        res.send({ message: "The sentence already exist" });
      } else {
        const foundWord = new Daily({ polish, english, wordStatus, dateAdded });
        foundWord.save((err) => {
          if (err) {
            res.send(err);
          } else {
            res.send({ message: "Successful" });
          }
        });
      }
    });
  });

app.listen(process.env.PORT || 3001, () => {
  console.log("Started");
});
