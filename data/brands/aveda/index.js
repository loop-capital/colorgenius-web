// Aveda Full Spectrum Professional Color Data Module
// ColorGenius Shade Database

const shadesData = require('./shades.json');

/**
 * Get all shade data for Aveda
 * @returns {Object} Complete Aveda color data
 */
function getAllShades() {
  return shadesData;
}

/**
 * Get shades for a specific line
 * @param {string} lineName - Name of the color line
 * @returns {Array} Array of shade objects
 */
function getShadesByLine(lineName) {
  const lineKey = Object.keys(shadesData.lines).find(key => 
    shadesData.lines[key].name === lineName
  );
  
  if (!lineKey) {
    return [];
  }
  
  return shadesData.shades[lineKey] || [];
}

/**
 * Get shade by code
 * @param {string} shadeCode - Shade code (e.g., "5N", "7G")
 * @returns {Object|null} Shade object or null if not found
 */
function getShadeByCode(shadeCode) {
  for (const line of Object.keys(shadesData.shades)) {
    const shade = shadesData.shades[line].find(s => s.code === shadeCode);
    if (shade) return shade;
  }
  return null;
}

/**
 * Get shades by level
 * @param {number} level - Level (1-10)
 * @returns {Array} Array of shade objects at that level
 */
function getShadesByLevel(level) {
  const results = [];
  for (const line of Object.keys(shadesData.shades)) {
    results.push(...shadesData.shades[line].filter(s => s.level === level));
  }
  return results;
}

/**
 * Get shades by tone
 * @param {string} tone - Tone letter (N, G, W, A, C, R, V, B, M, S, etc.)
 * @returns {Array} Array of shade objects with that tone
 */
function getShadesByTone(tone) {
  const results = [];
  for (const line of Object.keys(shadesData.shades)) {
    results.push(...shadesData.shades[line].filter(s => s.tone === tone));
  }
  return results;
}

/**
 * Get developer information for a specific line
 * @param {string} lineName - Name of the color line
 * @returns {Object|null} Developer information or null
 */
function getDevelopers(lineName) {
  const lineKey = Object.keys(shadesData.lines).find(key => 
    shadesData.lines[key].name === lineName
  );
  
  if (!lineKey) {
    return null;
  }
  
  return shadesData.lines[lineKey].developers || null;
}

/**
 * Get mixing ratio for a specific line
 * @param {string} lineName - Name of the color line
 * @returns {string|null} Mixing ratio or null
 */
function getMixingRatio(lineName) {
  const lineKey = Object.keys(shadesData.lines).find(key => 
    shadesData.lines[key].name === lineName
  );
  
  if (!lineKey) {
    return null;
  }
  
  return shadesData.lines[lineKey].mix_ratio || null;
}

/**
 * Get processing time for a specific line
 * @param {string} lineName - Name of the color line
 * @returns {string|null} Processing time or null
 */
function getProcessingTime(lineName) {
  const lineKey = Object.keys(shadesData.lines).find(key => 
    shadesData.lines[key].name === lineName
  );
  
  if (!lineKey) {
    return null;
  }
  
  return shadesData.lines[lineKey].processing_time || null;
}

/**
 * Search shades by name or description
 * @param {string} query - Search query
 * @returns {Array} Array of matching shade objects
 */
function searchShades(query) {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  for (const line of Object.keys(shadesData.shades)) {
    results.push(...shadesData.shades[line].filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.code.toLowerCase().includes(lowerQuery)
    ));
  }
  
  return results;
}

/**
 * Get all available color lines
 * @returns {Array} Array of line objects
 */
function getAllLines() {
  return Object.values(shadesData.lines);
}

/**
 * Get line info by name
 * @param {string} lineName - Name of the color line
 * @returns {Object|null} Line information or null
 */
function getLineInfo(lineName) {
  const lineKey = Object.keys(shadesData.lines).find(key => 
    shadesData.lines[key].name === lineName
  );
  
  return lineKey ? shadesData.lines[lineKey] : null;
}

/**
 * Get formulation notes for specific applications
 * @returns {Object} Formulation notes object
 */
function getFormulationNotes() {
  return shadesData.formulation_notes;
}

/**
 * Get gray coverage recommendations
 * @returns {Object} Gray coverage guidelines
 */
function getGrayCoverageNotes() {
  return shadesData.formulation_notes.gray_coverage;
}

module.exports = {
  getAllShades,
  getShadesByLine,
  getShadeByCode,
  getShadesByLevel,
  getShadesByTone,
  getDevelopers,
  getMixingRatio,
  getProcessingTime,
  searchShades,
  getAllLines,
  getLineInfo,
  getFormulationNotes,
  getGrayCoverageNotes,
  data: shadesData
};
