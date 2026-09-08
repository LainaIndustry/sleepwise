/**
 * SleepWise - Sleep Calculator
 * Main interactive sleep calculator functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const calcContainer = document.querySelector('.calculator-card');
    if (!calcContainer) return;
    
    // DOM elements
    const modeButtons = calcContainer.querySelectorAll('.calc-option-btn');
    const timeInput = document.getElementById('calc-time');
    const cyclesSelect = document.getElementById('calc-cycles');
    const fallAsleepSelect = document.getElementById('calc-fall-asleep');
    const ageSelect = document.getElementById('calc-age');
    const submitBtn = document.getElementById('calc-submit');
    const resetBtn = document.getElementById('calc-reset');
    const resultsContainer = document.getElementById('calc-results');
    const resultsList = document.getElementById('calc-results-list');
    const nowButton = calcContainer.querySelector('.time-btn');
    
    let currentMode = 'wake'; // 'wake' or 'bedtime'
    
    // Initialize
    if (timeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
    }
    
    // Mode toggle
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modeButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-checked', 'true');
            currentMode = this.dataset.mode;
            
            // Update label
            const label = calcContainer.querySelector('.calc-option-label');
            if (label) {
                label.textContent = currentMode === 'wake' ? 'I want to wake up at:' : 'I want to go to bed at:';
            }
            
            // Clear results
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    });
    
    // Now button
    if (nowButton) {
        nowButton.addEventListener('click', function() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            if (timeInput) {
                timeInput.value = `${hours}:${minutes}`;
            }
        });
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            performCalculation();
        });
    }
    
    // Enter key support
    if (timeInput) {
        timeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performCalculation();
            }
        });
    }
    
    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (timeInput) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                timeInput.value = `${hours}:${minutes}`;
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
    
    function performCalculation() {
        if (!timeInput || !cyclesSelect) return;
        
        const timeStr = timeInput.value;
        const cycles = parseInt(cyclesSelect.value, 10);
        const fallAsleep = parseInt(fallAsleepSelect ? fallAsleepSelect.value : '15', 10);
        const age = ageSelect ? ageSelect.value : 'adult';
        
        // Validate time
        if (!timeStr || timeStr.length < 4) {
            showError('Please enter a valid time.');
            return;
        }
        
        // Parse time
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
        
        // Perform calculation based on mode
        let results;
        let modeLabel;
        
        if (currentMode === 'wake') {
            // Calculate bedtimes
            results = window.calculateBedtimes ? window.calculateBedtimes(targetMinutes, cycles, fallAsleep) : [];
            modeLabel = 'Suggested Bedtimes';
        } else {
            // Calculate wake-up times
            results = window.calculateWakeTimes ? window.calculateWakeTimes(targetMinutes, cycles, fallAsleep) : [];
            modeLabel = 'Suggested Wake-Up Times';
        }
        
        if (!results || results.length === 0) {
            showError('Unable to calculate times. Please try different values.');
            return;
        }
        
        // Display results
        displayResults(results, modeLabel, age);
        
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
    
    function displayResults(results, modeLabel, age) {
        if (!resultsContainer || !resultsList) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        // Get age recommendation
        const ageInfo = window.getAgeRecommendation ? window.getAgeRecommendation(age) : null;
        const ageRange = ageInfo ? `${ageInfo.min}-${ageInfo.max} hours` : '7-9 hours';
        
        let html = '';
        
        results.forEach((result, index) => {
            const isRecommended = result.isRecommended;
            const timeDisplay = result.time || result.time12 || result.formatted12 || '--:--';
            const sleepHours = result.sleepHours || (result.sleepDuration / 60).toFixed(1);
            const cycles = result.cycles || 0;
            
            html += `
                <div class="result-card" style="${isRecommended ? 'border:2px solid var(--primary);' : ''}">
                    <div class="result-time">${timeDisplay}</div>
                    <div class="result-label">${index === 0 ? 'Recommended' : 'Alternative'}</div>
                    <div class="result-detail">${sleepHours}h sleep • ${cycles} cycles</div>
                </div>
            `;
        });
        
        // Add explanation
        const recommended = results.find(r => r.isRecommended) || results[0];
        const recommendedTime = recommended ? recommended.time || recommended.formatted12 : '--:--';
        const recommendedCycles = recommended ? recommended.cycles : 0;
        const recommendedHours = recommended ? (recommended.sleepDuration / 60).toFixed(1) : '--';
        
        html += `
            <div class="calc-explanation" style="margin-top:var(--space-md);padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);">
                <p style="font-size:0.9375rem;margin:0;">
                    <strong>${currentMode === 'wake' ? 'Go to bed at' : 'Wake up at'} ${recommendedTime}</strong> for ${recommendedCycles} sleep cycles 
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
