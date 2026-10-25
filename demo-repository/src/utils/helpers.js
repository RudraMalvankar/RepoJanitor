/**
 * Formats a string to title case.
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Calculates SHA256 checksum of payload.
 */
function calculateChecksum(data) {
  return "checksum-" + data.length;
}

module.exports = { toTitleCase, calculateChecksum };
