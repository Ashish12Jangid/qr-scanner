const express = require('express');
const fs = require('fs');
const qr = require('qrcode');
const qrCode = require('qrcode-reader');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
// Directory to store QR code images.
const qrCodeDirectory = 'qr-codes';
app.use(express.static(qrCodeDirectory));
// support parsing of application/json type post data
app.use(bodyParser.json());
// parse request to body-parser
app.use(bodyParser.urlencoded({ extended: true }));
// Route to assign a link to a QR code.
app.post('/assign/:id', async (req, res) => {
    const id = req.params.id;
    const assignedLink = req.body.link;
    // Regenerate the QR code with the assigned link.
    const qrCodeImagePath = `${qrCodeDirectory}/${id}.png`;
    await generateQRCode(id, assignedLink);
    res.send(`Link assigned to QR code (${id}): ${assignedLink}`);
});
// Generate QR codes with unique IDs.
const generateQRCode = (id, link) => {
    return new Promise((resolve, reject) => {
        const data = { link };
        qr.toFile(`${qrCodeDirectory}/${id}.png`, JSON.stringify(data), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
// Route to validate and redirect QR codes.
app.get('/validate/:id', (req, res) => {
    const id = req.params.id;
    const filePath = `${qrCodeDirectory}/${id}.png`;
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).send('QR code not found');
        } else {
            // Read the content of the QR code image.
            fs.readFile(filePath, (readErr, data) => {
                if (readErr) {
                    res.status(500).send('Error reading QR code data');
                } else {
                    const qr = new qrCode();
                    console.log('data',data)
                    // Decode the QR code image data.
                    qr.decode(data, function (err, result) {
                        console.log('result',result)
                        if (err) {
                            res.status(500).send('Error decoding QR code');
                        } else {
                            try {
                                const parsedData = JSON.parse(result.result);
                                console.log('parsedData', parsedData)
                                const assignedLink = parsedData.link;
                                if (assignedLink) {
                                    // Redirect to the assigned link.
                                    res.redirect(assignedLink);
                                } else {
                                    // If no link is assigned for this QR code, you can handle it as needed.
                                    res.status(404).send('No link assigned for this QR code');
                                }
                            } catch (jsonParseError) {
                                res.status(500).send('Error parsing QR code data as JSON');
                            }
                        }
                    });
                }
            });
        }
    });

});
// Generate QR codes with unique IDs at server startup.
(async () => {
    const numberOfQRCodes = 5; // You can change this to the desired number of QR codes.
    for (let i = 1; i <= numberOfQRCodes; i++) {
        const uniqueId = `qr-code-${i}`;
        await generateQRCode(uniqueId, ''); // Initially, the link is empty.
        console.log(`QR code generated for ${uniqueId}`);
    }
    console.log('Server is running on port', port);
})();
app.listen(port);