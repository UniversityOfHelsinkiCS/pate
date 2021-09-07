const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");
const toskaMail = "grp-toska@helsinki.fi";

const createMailHTML = (text, color, header, headerFontColor) => {
  const mailTemplate = fs.readFileSync(
    path.join(__dirname, "..", "assets", "mail.mustache"),
    "utf8"
  );
  const content = text.replace(/\n/g, "<br>");
  return Mustache.render(mailTemplate, { content, color, header, headerFontColor });
};

const parseSettings = (settings) => ({
  toskaAsBcc: settings.hideToska && !settings.disableToska,
  toskaAsCc: !settings.hideToska && !settings.disableToska,
  color: settings.color || "lightsteelblue",
  header: settings.header || "",
  headerFontColor: settings.headerFontColor || "black",
  dryrun: settings.dryrun || false,
});

const prepareMailsWithTemplate = (emails, template, settings) => {
  const { toskaAsCc, toskaAsBcc, color, header, headerFontColor } = parseSettings(settings);

  const addCc = (array = []) => (toskaAsCc ? [...array, toskaMail] : array);
  const addBcc = (array = []) => (toskaAsBcc ? [...array, toskaMail] : array);

  const acualEmails = emails
    .map((emailOverwrite) => ({
      ...template,
      ...emailOverwrite,
    }))
    .map((email) => {
      return {
        html: createMailHTML(email.text, color, header, headerFontColor),
        ...email,
        from: `${email.from || "University of Helsinki"} <noreply@helsinki.fi>`,
        cc: addCc(email.cc),
        bcc: addBcc(email.bcc),
      };
    });

  return acualEmails;
};

module.exports = { prepareMailsWithTemplate, parseSettings };
