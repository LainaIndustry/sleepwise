/**
 * SleepWise - Core Calculator Engine
 * 
 * Provides reusable functions for all sleep-related calculations.
 * Uses minutes from midnight (0-1439) as the internal representation.
 */

const SLEEP_CONSTANTS = {
    // Average sleep cycle duration in minutes
    CYCLE_DURATION: 90,
    
    // Average time to fall asleep in minutes
    FALL_ASLEEP_BUFFER: 15,
    
    // Recommended sleep durations by age group (in hours)
    AGE_RECOMMENDATIONS: {
        newborn: { label: 'Newborn (0-3 months)', min: 14, max: 17 },
        infant: { label: 'Infant (4-11 months)', min: 12, max: 16 },
        toddler: { label: 'Toddler (1-2 years)', min: 11, max: 14 },
        preschooler: { label: 'Preschooler (3-5 years)', min: 10, max: 13 },
        school: { label: 'School-age (6-12 years)', min: 9, max: 12 },
        teen: { label: 'Teenager (13-17 years)', min: 8, max: 10 },
        'young-adult': { label: 'Young Adult (18-25 years)', min: 7, max: 9 },
        adult: { label: 'Adult (26-64 years)', min: 7, max: 9 },
        'older-adult': { label: 'Older Adult (65+ years)', min: 7, max: 8 }
    }
};

/**
 * Convert a time string (HH:MM) to minutes from midnight.
 * Handles both 24-hour and 12-hour formats.
 */
function timeToMinutes(timeStr) {
    if (!timeStr) return null;
    
    // Check if it's in HH:MM format with AM/PM
    const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
        let hours = parseInt(ampmMatch[1], 10);
        const minutes = parseInt(ampmMatch[2], 10);
        const period = ampmMatch[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
    }
    
    // Standard 24-hour format (HH:MM)
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return hours * 60 + minutes;
        }
    }
    
    return null;
}

/**
 * Convert minutes from midnight to a formatted time string.
 * Returns both 12-hour and 24-hour formats.
 */
function minutesToTime(minutes, format = '12h') {
    if (minutes === undefined || minutes === null || isNaN(minutes)) {
        return { formatted12: '--:--', formatted24: '--:--', hours: 0, minutes: 0 };
    }
    
    // Ensure minutes are in 0-1439 range
    minutes = ((minutes % 1440) + 1440) % 1440;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // 12-hour format
    let h12 = hours % 12;
    if (h12 === 0) h12 = 12;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formatted12 = `${h12}:${String(mins).padStart(2, '0')} ${period}`;
    
    // 24-hour format
    const formatted24 = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    
    return { formatted12, formatted24, hours, minutes: mins };
}

/**
 * Calculate bedtimes based on a desired wake-up time.
 * 
 * @param {number} wakeMinutes - Desired wake-up time in minutes from midnight
 * @param {number} numCycles - Number of sleep cycles (e.g., 5)
 * @param {number} fallAsleepMinutes - Time to fall asleep in minutes
 * @returns {Array} Array of suggested bedtimes with details
 */
function calculateBedtimes(wakeMinutes, numCycles, fallAsleepMinutes = 15) {
    if (!wakeMinutes || wakeMinutes < 0 || !numCycles || numCycles < 1) {
        return [];
    }
    
    const cycleDuration = SLEEP_CONSTANTS.CYCLE_DURATION;
    const results = [];
    
    // Calculate bedtimes for the specified number of cycles and a few variants
    const cycleOptions = [numCycles - 1, numCycles, numCycles + 1];
    
    for (const cycles of cycleOptions) {
        if (cycles < 3 || cycles > 8) continue;
        
        const sleepMinutes = cycles * cycleDuration;
        const bedtimeMinutes = ((wakeMinutes - sleepMinutes - fallAsleepMinutes) % 1440 + 1440) % 1440;
        
        const time = minutesToTime(bedtimeMinutes);
        const wakeTime = minutesToTime(wakeMinutes);
        
        results.push({
            time: time.formatted12,
            time24: time.formatted24,
            timeMinutes: bedtimeMinutes,
            cycles: cycles,
            sleepDuration: sleepMinutes,
            sleepHours: (sleepMinutes / 60).toFixed(1),
            wakeTime: wakeTime.formatted12,
            fallAsleepMinutes: fallAsleepMinutes,
            isRecommended: cycles === numCycles
        });
    }
    
    // Sort by bedtime (earliest first)
    results.sort((a, b) => a.timeMinutes - b.timeMinutes);
    
    return results;
}

/**
 * Calculate wake-up times based on a desired bedtime.
 * 
 * @param {number} bedtimeMinutes - Bedtime in minutes from midnight
 * @param {number} numCycles - Number of sleep cycles (e.g., 5)
 * @param {number} fallAsleepMinutes - Time to fall asleep in minutes
 * @returns {Array} Array of suggested wake-up times with details
 */
function calculateWakeTimes(bedtimeMinutes, numCycles, fallAsleepMinutes = 15) {
    if (!bedtimeMinutes || bedtimeMinutes < 0 || !numCycles || numCycles < 1) {
        return [];
    }
    
    const cycleDuration = SLEEP_CONSTANTS.CYCLE_DURATION;
    const results = [];
    
    // Calculate wake times for the specified number of cycles and a few variants
    const cycleOptions = [numCycles - 1, numCycles, numCycles + 1];
    
    for (const cycles of cycleOptions) {
        if (cycles < 3 || cycles > 8) continue;
        
        const sleepMinutes = cycles * cycleDuration;
        const wakeMinutes = ((bedtimeMinutes + fallAsleepMinutes + sleepMinutes) % 1440 + 1440) % 1440;
        
        const time = minutesToTime(wakeMinutes);
        const bedTime = minutesToTime(bedtimeMinutes);
        
        results.push({
            time: time.formatted12,
            time24: time.formatted24,
            timeMinutes: wakeMinutes,
            cycles: cycles,
            sleepDuration: sleepMinutes,
            sleepHours: (sleepMinutes / 60).toFixed(1),
            bedtime: bedTime.formatted12,
            fallAsleepMinutes: fallAsleepMinutes,
            isRecommended: cycles === numCycles
        });
    }
    
    // Sort by wake time (earliest first)
    results.sort((a, b) => a.timeMinutes - b.timeMinutes);
    
    return results;
}

/**
 * Calculate sleep cycles between a bedtime and wake-up time.
 * 
 * @param {number} bedtimeMinutes - Bedtime in minutes from midnight
 * @param {number} wakeMinutes - Wake-up time in minutes from midnight
 * @param {number} fallAsleepMinutes - Time to fall asleep in minutes
 * @returns {Object} Sleep cycle analysis
 */
function calculateSleepCycles(bedtimeMinutes, wakeMinutes, fallAsleepMinutes = 15) {
    if (!bedtimeMinutes || bedtimeMinutes < 0 || !wakeMinutes || wakeMinutes < 0) {
        return null;
    }
    
    // Calculate total sleep duration
    let totalMinutes = wakeMinutes - bedtimeMinutes;
    if (totalMinutes < 0) totalMinutes += 1440;
    
    const actualSleepMinutes = totalMinutes - fallAsleepMinutes;
    if (actualSleepMinutes < 0) {
        return {
            totalMinutes: totalMinutes,
            actualSleepMinutes: 0,
            cycles: 0,
            cycleDuration: 0,
            isValid: false,
            error: 'Sleep duration is shorter than fall-asleep time.'
        };
    }
    
    const cycleDuration = SLEEP_CONSTANTS.CYCLE_DURATION;
    const cycles = actualSleepMinutes / cycleDuration;
    
    return {
        totalMinutes: totalMinutes,
        actualSleepMinutes: actualSleepMinutes,
        actualSleepHours: (actualSleepMinutes / 60).toFixed(1),
        cycles: Math.round(cycles * 10) / 10,
        cycleDuration: cycleDuration,
        isValid: true,
        isOptimal: cycles >= 4 && cycles <= 6 && cycles % 1 < 0.3,
        totalHours: (totalMinutes / 60).toFixed(1)
    };
}

/**
 * Calculate sleep duration between bedtime and wake-up time.
 * 
 * @param {number} bedtimeMinutes - Bedtime in minutes from midnight
 * @param {number} wakeMinutes - Wake-up time in minutes from midnight
 * @param {number} fallAsleepMinutes - Time to fall asleep in minutes
 * @param {number} awakeMinutes - Time awake during night in minutes
 * @returns {Object} Sleep duration analysis
 */
function calculateSleepDuration(bedtimeMinutes, wakeMinutes, fallAsleepMinutes = 15, awakeMinutes = 0) {
    if (!bedtimeMinutes || bedtimeMinutes < 0 || !wakeMinutes || wakeMinutes < 0) {
        return null;
    }
    
    let totalMinutes = wakeMinutes - bedtimeMinutes;
    if (totalMinutes < 0) totalMinutes += 1440;
    
    const actualSleepMinutes = totalMinutes - fallAsleepMinutes - awakeMinutes;
    
    return {
        totalInBed: totalMinutes,
        totalInBedHours: (totalMinutes / 60).toFixed(1),
        fallAsleepMinutes: fallAsleepMinutes,
        awakeMinutes: awakeMinutes,
        actualSleepMinutes: Math.max(0, actualSleepMinutes),
        actualSleepHours: Math.max(0, (actualSleepMinutes / 60)).toFixed(1),
        sleepEfficiency: totalMinutes > 0 ? ((actualSleepMinutes / totalMinutes) * 100).toFixed(1) : 0
    };
}

/**
 * Get sleep recommendations based on age.
 */
function getAgeRecommendation(ageKey) {
    return SLEEP_CONSTANTS.AGE_RECOMMENDATIONS[ageKey] || SLEEP_CONSTANTS.AGE_RECOMMENDATIONS.adult;
}

/**
 * Calculate nap times based on current time and desired nap duration.
 * 
 * @param {number} currentMinutes - Current time in minutes from midnight
 * @param {number} napMinutes - Desired nap duration in minutes
 * @returns {Array} Array of wake-up times for the nap
 */
function calculateNapTimes(currentMinutes, napMinutes) {
    if (!currentMinutes || currentMinutes < 0 || !napMinutes || napMinutes < 0) {
        return [];
    }
    
    const results = [];
    const durations = [10, 20, 30, 60, 90];
    const targetDuration = napMinutes || 20;
    
    // Include the selected duration and nearby options
    const options = new Set([10, 20, 30, 60, 90]);
    if (targetDuration > 0) options.add(targetDuration);
    
    for (const duration of options) {
        const wakeMinutes = ((currentMinutes + duration) % 1440 + 1440) % 1440;
        const time = minutesToTime(wakeMinutes);
        
        let recommendation = '';
        if (duration <= 20) {
            recommendation = 'Short nap - good for a quick energy boost without grogginess.';
        } else if (duration <= 30) {
            recommendation = 'Medium nap - helps with alertness but may cause some sleep inertia.';
        } else if (duration <= 60) {
            recommendation = 'Long nap - can help with learning and memory, but may disrupt nighttime sleep.';
        } else {
            recommendation = 'Full sleep cycle - best for cognitive benefits, but ensure it fits your schedule.';
        }
        
        results.push({
            duration: duration,
            wakeTime: time.formatted12,
            wakeTime24: time.formatted24,
            wakeMinutes: wakeMinutes,
            recommendation: recommendation,
            isSelected: duration === targetDuration
        });
    }
    
    // Sort by duration
    results.sort((a, b) => a.duration - b.duration);
    
    return results;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SLEEP_CONSTANTS,
        timeToMinutes,
        minutesToTime,
        calculateBedtimes,
        calculateWakeTimes,
        calculateSleepCycles,
        calculateSleepDuration,
        getAgeRecommendation,
        calculateNapTimes
    };
}
