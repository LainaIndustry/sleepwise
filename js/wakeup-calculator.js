/**
 * SleepWise - Wake-Up Calculator
 * Find the best time to wake up based on bedtime
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const bedtimeInput = document.getElementById('wakeup-bedtime');
    const cyclesSelect = document.getElementById('wakeup-cycles');
    const fallAsleepSelect = document.getElementById('wakeup-fall-asleep');
    const ageSelect = document.getElementById('wakeup-age');
    const submitBtn = document.getElementById('wakeup-submit');
    const resetBtn = document.getElementById('wakeup-reset');
    const resultsContainer = document.getElementById('wakeup-results');
    const resultsList = document.getElementById('wakeup-results-list');
    const nowBtn = document.getElementById('wakeup-now-btn');
    
    // Initialize with current time
    if (bedtimeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        bedtimeInput.value = `${hours}:${minutes}`;
    }
    
    // Now button
    if (nowBtn) {
        nowBtn.addEventListener('click', function() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            if (bedtimeInput) {
                bedtimeInput.value = `${hours}:${minutes}`;
            }
        });
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', calculateWakeup);
    }
    
    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (bedtimeInput) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                bedtimeInput.value = `${hours}:${minutes}`;
            }
            if (cyclesSelect) cyclesSelect.value = '5';
            if (fallAsleepSelect) fallAsleepSelect.value = '15';
            if (ageSelect) ageSelect.value = 'adult';
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    }
    
    function calculateWakeup() {
        if (!bedtimeInput || !cyclesSelect) return;
        
        const timeStr = bedtimeInput.value;
        const cycles = parseInt(cyclesSelect.value, 10);
        const fallAsleep = parseInt(fallAsleepSelect ? fallAsleepSelect.value : '15', 10);
        const age = ageSelect ? ageSelect.value : 'adult';
        
        // Validate time
        if (!timeStr || timeStr.length < 4) {
            showError('Please enter a valid time.');
            return;
        }
        
        const timeParts = timeStr.split(':');
        if (timeParts.length !== 2) {
            showError('Please enter a valid time in HH:MM format.');
            return;
        }
        
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            showError('Please enter a valid time between 00:00 and 23:59.');
            return;
        }
        
        const targetMinutes = hours * 60 + minutes;
        
        // Calculate wake-up times
        const results = window.calculateWakeTimes ? window.calculateWakeTimes(targetMinutes, cycles, fallAsleep) : [];
        
        if (!results || results.length === 0) {
            showError('Unable to calculate wake-up times. Please try different values.');
            return;
        }
        
        displayResults(results, age);
        
        // Scroll to results on mobile
        if (window.innerWidth < 768 && resultsContainer) {
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    function showError(message) {
        if (resultsContainer) {
            resultsContainer.hidden = false;
            resultsContainer.removeAttribute('hidden');
            resultsList.innerHTML = `
                <div class="calc-error" style="text-align:center;padding:var(--space-lg);color:var(--danger);">
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    function displayResults(results, age) {
        if (!resultsContainer || !resultsList) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        const ageInfo = window.getAgeRecommendation ? window.getAgeRecommendation(age) : null;
        const ageRange = ageInfo ? `${ageInfo.min}-${ageInfo.max} hours` : '7-9 hours';
        
        let html = '';
        
        results.forEach((result, index) => {
            const isRecommended = result.isRecommended;
            const timeDisplay = result.time || result.formatted12 || '--:--';
            const sleepHours = result.sleepHours || (result.sleepDuration / 60).toFixed(1);
            const cycles = result.cycles || 0;
            
            html += `
                <div class="result-card" style="${isRecommended ? 'border:2px solid var(--primary);' : ''}">
                    <div class="result-time">${timeDisplay}</div>
                    <div class="result-label">${isRecommended ? 'Recommended' : 'Alternative'}</div>
                    <div class="result-detail">${sleepHours}h sleep • ${cycles} cycles</div>
                </div>
            `;
        });
        
        const recommended = results.find(r => r.isRecommended) || results[0];
        const recommendedTime = recommended ? recommended.time || recommended.formatted12 : '--:--';
        const recommendedCycles = recommended ? recommended.cycles : 0;
        const recommendedHours = recommended ? (recommended.sleepDuration / 60).toFixed(1) : '--';
        
        html += `
            <div class="calc-explanation" style="margin-top:var(--space-md);padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);">
                <p style="font-size:0.9375rem;margin:0;">
                    <strong>Wake up at ${recommendedTime}</strong> for ${recommendedCycles} sleep cycles 
                    (approximately ${recommendedHours} hours). This allows time to fall asleep (${recommended ? recommended.fallAsleepMinutes : 15} min buffer).
                </p>
                <p style="font-size:0.875rem;color:var(--text-muted);margin-top:var(--space-sm);">
                    For your age group (${ageInfo ? ageInfo.label : 'Adult'}), recommended sleep is ${ageRange}.
                </p>
            </div>
        `;
        
        resultsList.innerHTML = html;
    }
});
