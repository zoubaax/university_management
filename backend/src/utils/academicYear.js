/**
 * Utility functions for Academic Year calculations
 */

/**
 * Calculates the current academic year in the format "YYYY/YYYY"
 * An academic year starts in September (8) and ends in August (7) of the following year.
 * @returns {string} The current academic year (e.g., "2023/2024")
 */
const getCurrentAcademicYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 is Jan, 8 is Sept)

    // If we are in September or later, the academic year is "currentYear/currentYear+1"
    if (currentMonth >= 8) {
        return `${currentYear}/${currentYear + 1}`;
    } else {
        // If we are before September, the academic year is "currentYear-1/currentYear"
        return `${currentYear - 1}/${currentYear}`;
    }
};

module.exports = {
    getCurrentAcademicYear
};
