const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const app = express();
const Link = require('./models/qr');
// The URL you want to encode in the QR code
const mongoose = require('mongoose');
const { ObjectId } = require("mongodb");
const connectDB = async () => {
  try {
    const con = await mongoose.connect('mongodb+srv://ashishjangid:wZ0gmfpnyfZY9Sux@cluster0.yeraifz.mongodb.net/qrlinks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}
connectDB();

app.get("/api", async (req, res) => {
  const record = async () => {
    // Generate the QR code
    const qrId = new mongoose.mongo.ObjectId()
    const data = new Link({
      name: 'google_qr.png',
      qrId: qrId
    })
    const saved = await data.save();
    if (saved._id) {
      const redirectionLink = `https://www.google.com/${qrId}`;
      QRCode.toFile('google_qr.png', redirectionLink, (err) => {
        if (err) {
          return { data: err }
        }else {
          return { data: 'QR code saved as google_qr.png' };
        }
      });
    }
  }
  const resultl = await record();
  res.status(200).send({ success: true, message: "API Is running", data: resultl, errors: "" })
});



// Redirect to the associated link for a given ID
app.get('/api/scanner/:id', async (req, res) => {
  console.log('req.params', req.params)
  const { id } = req.params;

  try {
    // Find the link associated with the provided ID
    const linkData = await Link.findOne({ qrId: ObjectId(id) });
    console.log('linkData', linkData)
    if (!linkData) {
      return res.status(404).json({ error: 'Link not found' });
    }
    console.log('linkData.link', linkData.link)
    // Redirect to the associated link
    return res.status(302).redirect(linkData.link);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to redirect' });
  }
});


app.listen(3000);