/**
 * SleepWise - Bedtime Calculator
 * Find the best time to go to bed based on wake-up time
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const wakeTimeInput = document.getElementById('bedtime-wake-time');
    const cyclesSelect = document.getElementById('bedtime-cycles');
    const fallAsleepSelect = document.getElementById('bedtime-fall-asleep');
    const ageSelect = document.getElementById('bedtime-age');
    const submitBtn = document.getElementById('bedtime-submit');
    const resultsContainer = document.getElementById('bedtime-results');
    const resultsList = document.getElementById('bedtime-results-list');
    const nowBtn = document.getElementById('bedtime-now-btn');
    
    // Initialize with current time
    if (wakeTimeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        wakeTimeInput.value = `${hours}:${minutes}`;
    }
    
    // Now button
    if (nowBtn) {
        nowBtn.addEventListener('click', function() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            if (wakeTimeInput) {
                wakeTimeInput.value = `${hours}:${minutes}`;
            }
        });
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', calculateBedtime);
    }
    
    // Enter key
    if (wakeTimeInput) {
        wakeTimeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateBedtime();
            }
        });
    }
    
    function calculateBedtime() {
        if (!wakeTimeInput || !cyclesSelect) return;
        
        const timeStr = wakeTimeInput.value;
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
        
        // Calculate bedtimes
        const results = window.calculateBedtimes ? window.calculateBedtimes(targetMinutes, cycles, fallAsleep) : [];
        
        if (!results || results.length === 0) {
            showError('Unable to calculate bedtimes. Please try different values.');
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
                    <strong>Go to bed at ${recommendedTime}</strong> for ${recommendedCycles} sleep cycles 
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
