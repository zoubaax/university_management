/**
 * Utility functions for Academic Year calculations
 */

/**
 * Calculates the current academic year in the format "YYYY/YYYY"
 * An academic year starts in September (8) and ends in August (7) of the following year.
 * @returns {string} The current academic year (e.g., "2023/2024")
 */
export const getCurrentAcademicYear = () => {
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

/**
 * Generates a list of academic years for selection
 * @param {number} count - Number of years to generate
 * @param {boolean} includeFuture - Whether to include future years
 * @returns {Array<{value: string, label: string}>}
 */
export const getAcademicYearOptions = (count = 3, includeFuture = false) => {
    const current = getCurrentAcademicYear();
    const currentStartYear = parseInt(current.split('/')[0]);

    const options = [];

    // Future years if requested
    if (includeFuture) {
        for (let i = 1; i <= 2; i++) {
            const year = currentStartYear + i;
            options.push({ value: `${year}/${year + 1}`, label: `${year}/${year + 1}` });
        }
    }

    // Current year
    options.push({ value: current, label: current });

    // Past years
    for (let i = 1; i < count; i++) {
        const year = currentStartYear - i;
        options.push({ value: `${year}/${year + 1}`, label: `${year}/${year + 1}` });
    }

    // Sort options descending
    return options.sort((a, b) => b.value.localeCompare(a.value));
};
