const axios = require("axios");

// Set fields in below function to whatever you want them to be

const sendEmails = async (preview = false) => {
  const emails = [
    {
      to: "firstname.lastname@helsinki.fi",
      subject: "Email subject",
    },
  ];

  const text = "foobar";

  const mail = {
    template: {
      from: "noreply@helsinki.fi",
      text: text,
    },
    emails: emails,
    settings: {
      hideToska: false,
      disableToska: true,
      header: "App name",
    },
  };

  console.log(`sending ${emails.length} emails`);

  try {
    if (preview) {
      const response = await pateClient.post("/preview", mail);
      console.log(response.data.html);
    } else {
      await pateClient.post("/", mail);
    }
  } catch (error) {
    console.log("Did you forget to use VPN?");
    throw new Error(error);
  }
};

const main = async () => {
  const preview = process.argv[2] === "preview";
  await sendEmails(preview);
};

const pateClient = axios.create({
  baseURL: "https://importer.cs.helsinki.fi/api/pate",
  params: {
    // Set your very own Toska token
    token: TOKEN,
  },
});

// If you want to get HTML-preview use like this: node send_emails_like_this.js preview

main();
