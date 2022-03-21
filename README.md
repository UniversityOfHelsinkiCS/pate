# Pate

The email service. Running in pate.toska.cs.helsinki.fi, POST the payload there. Include token as either query parameter or in headers.

You can use the POST `/preview` to receive a preview before sending any emails. Use the same payload. The endpoint will return the html version of the email for the **first** email in the array of emails.

The generated email format is the following: 

![Example image](https://raw.githubusercontent.com/UniversityOfHelsinkiCS/pate/main/assets/example_screenshot.png)

This email is generated from the following:

```javascript
{
  "template": { // Every email will have the fields that are defined here
    "from": "Example robot",
    "text": "This is the text\nwhich\nsupports\n\nnewlines<h1>And html</h1>"
  },
  "emails": [{ // The emails overwrite what is written in the template
    "to": "jami.kousa@helsinki.fi",
    "subject": "This is subject"
  }],
  "settings": {
    "hideToska": false, // Set grp-toska as bcc instead of cc
    "disableToska": true, // Do not set grp-toska as bcc or cc
    "color": "pink",, // Color of the header, test for yourself.
    "header": "Sent by Pate", // The header text in the header, usually the name of the application
    "headerFontColor": "white", // Set the color of the text in header, by default it is black
    "dryrun": true // Tells pate to accept this payload, log it but not actually send the mail
  }
}
```