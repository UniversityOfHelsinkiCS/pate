const fs = require("fs");

require.extensions[".mustache"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};
const Mustache = require("mustache");
const mailTemplate = require("../assets/mail.mustache");

const toskaMail = "grp-toska@helsinki.fi";

const createMailHTML = (text, color, header) => {
  const content = text.replace(/\n/g, "<br>");
  return Mustache.render(mailTemplate, { content, color, header });
};

const parseSettings = (settings) => ({
  toskaAsBcc: settings.hideToska && !settings.disableToska,
  toskaAsCc: !settings.hideToska && !settings.disableToska,
  color: settings.color || "lightsteelblue",
  header: settings.header || "",
  dryrun: settings.dryrun || false,
});

const prepareMailsWithTemplate = (emails, template, settings) => {
  const { toskaAsCc, toskaAsBcc, color, header } =
    parseSettings(settings);

  const addCc = (array = []) => (toskaAsCc ? [...array, toskaMail] : array);
  const addBcc = (array = []) => (toskaAsBcc ? [...array, toskaMail] : array);

  const acualEmails = emails
    .map((emailOverwrite) => ({
      ...template,
      ...emailOverwrite,
    }))
    .map((email) => {
      return {
        html: createMailHTML(email.text, color, header),
        ...email,
        from: `${email.from || "University of Helsinki"} <noreply@helsinki.fi>`,
        cc: addCc(email.cc),
        bcc: addBcc(email.bcc),
      };
    });

    return acualEmails
};

module.exports = { prepareMailsWithTemplate, parseSettings };
