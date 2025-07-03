// src/utils/emailTemplates/index.js
const templates = require('./templates');

function renderTemplate(templateName, data) {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found.`);
  }
  return template(data);
}

module.exports = { renderTemplate };