/**
 * Ensures all fields are filled. The "template" is used as the basis for all emails and the email details then would overwrite the fields in template.
 * Validation checks that whatever is not in template is defined in emails
 */
const validationMiddleware = (req, res, next) => {
  const REQUIRED_FIELDS = ["to", "subject", "text"];

  const { emails, template } = req.body;
  if (!Array.isArray(emails))
    return res.status(400).send("body.emails must be an array");
  if (!emails.length)
    return res.status(400).send("body.emails must have something in it");
  if (!template || typeof template !== "object")
    return res.status(400).send("body.template must be an object");

  let missingFields = REQUIRED_FIELDS;
  if (template)
    Object.keys(template).forEach(
      (key) => (missingFields = missingFields.filter((field) => field === key))
    );

  let isMissingFields = false;
  emails.forEach((emailRequest) => {
    missingFields.forEach((field) => {
      if (Object.keys(emailRequest).includes(field)) isMissingFields = true;
    });
  });

  if (isMissingFields)
    return res.status(400).send("does not contain all data to send mail");

  next();
};

module.exports = {
  validationMiddleware,
};
