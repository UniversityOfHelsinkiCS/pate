# Pate

The email service. Running in pate.toska.cs.helsinki.fi, POST the payload there.

Example of usage:

```javascript
{
  "template": {
    "text": "Tämä on testimaili\nJa tämä oli rivinvaihto siellä" // Every email will have the fields defined here
  },
  "emails": [{ // The emails overwrite what is written in the template
    "to": "jami.kousa@helsinki.fi",
    "subject": "Test subject"
  }],
  "settings": {
    "hideToska": false, // Set grp-toska as bcc instead of cc
    "disableToska": true, // Do not set grp-toska as bcc or cc
    "color": "lightblue", // Color of the header, test for yourself.
    "header": "Pate", // The header text in the header, usually the name of the application
    "dryrun": true // Tells pate to accept this payload, log it but not actually send the mail
  }
}
```