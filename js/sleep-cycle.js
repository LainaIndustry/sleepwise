/**
 * SleepWise - Sleep Cycle Calculator
 * Analyze sleep cycles and sleep architecture
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const bedtimeInput = document.getElementById('cycle-bedtime');
    const wakeupInput = document.getElementById('cycle-wakeup');
    const fallAsleepSelect = document.getElementById('cycle-fall-asleep');
    const ageSelect = document.getElementById('cycle-age');
    const submitBtn = document.getElementById('cycle-submit');
    const resetBtn = document.getElementById('cycle-reset');
    const resultsContainer = document.getElementById('cycle-results');
    const resultsContent = document.getElementById('cycle-results-content');
    
    // Initialize with current time
    if (bedtimeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        bedtimeInput.value = `${hours}:${minutes}`;
    }
    
    if (wakeupInput) {
        const now = new Date();
        const hours = String(now.getHours() + 8).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        wakeupInput.value = `${hours % 24}:${minutes}`;
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', analyzeCycles);
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
            if (wakeupInput) {
                const now = new Date();
                const hours = String(now.getHours() + 8).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                wakeupInput.value = `${hours % 24}:${minutes}`;
            }
            if (fallAsleepSelect) fallAsleepSelect.value = '15';
            if (ageSelect) ageSelect.value = 'adult';
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    }
    
    function analyzeCycles() {
        if (!bedtimeInput || !wakeupInput) return;
        
        const bedtimeStr = bedtimeInput.value;
        const wakeupStr = wakeupInput.value;
        const fallAsleep = parseInt(fallAsleepSelect ? fallAsleepSelect.value : '15', 10);
        const age = ageSelect ? ageSelect.value : 'adult';
        
        // Validate inputs
        if (!bedtimeStr || !wakeupStr) {
            showError('Please enter both bedtime and wake-up time.');
            return;
        }
        
        const bedtimeParts = bedtimeStr.split(':');
        const wakeupParts = wakeupStr.split(':');
        
        if (bedtimeParts.length !== 2 || wakeupParts.length !== 2) {
            showError('Please enter valid times in HH:MM format.');
            return;
        }
        
        const bedHours = parseInt(bedtimeParts[0], 10);
        const bedMinutes = parseInt(bedtimeParts[1], 10);
        const wakeHours = parseInt(wakeupParts[0], 10);
        const wakeMinutes = parseInt(wakeupParts[1], 10);
        
        if (isNaN(bedHours) || isNaN(bedMinutes) || isNaN(wakeHours) || isNaN(wakeMinutes) ||
            bedHours < 0 || bedHours > 23 || bedMinutes < 0 || bedMinutes > 59 ||
            wakeHours < 0 || wakeHours > 23 || wakeMinutes < 0 || wakeMinutes > 59) {
            showError('Please enter valid times between 00:00 and 23:59.');
            return;
        }
        
        const bedtimeMinutes = bedHours * 60 + bedMinutes;
        const wakeMinutes = wakeHours * 60 + wakeMinutes;
        
        // Calculate using the engine
        const result = window.calculateSleepCycles ? 
            window.calculateSleepCycles(bedtimeMinutes, wakeMinutes, fallAsleep) : null;
        
        if (!result || !result.isValid) {
            showError(result?.error || 'Unable to calculate sleep cycles. Please check your inputs.');
            return;
        }
        
        displayResults(result, age);
        
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
            resultsContent.innerHTML = `
                <div class="calc-error" style="text-align:center;padding:var(--space-lg);color:var(--danger);">
                    <p>${message}</p>
                </div>
            `;
        }
    }
    
    function displayResults(result, age) {
        if (!resultsContainer || !resultsContent) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        const ageInfo = window.getAgeRecommendation ? window.getAgeRecommendation(age) : null;
        const ageRange = ageInfo ? `${ageInfo.min}-${ageInfo.max} hours` : '7-9 hours';
        
        const cycles = result.cycles;
        const actualSleepHours = result.actualSleepHours;
        const totalHours = result.totalHours;
        
        let statusColor = 'var(--success)';
        let statusText = 'Optimal';
        let statusDescription = 'Great! Your sleep duration is within the recommended range.';
        
        if (cycles < 4) {
            statusColor = 'var(--warning)';
            statusText = 'Short';
            statusDescription = 'You may want to aim for more sleep cycles for better restoration.';
        } else if (cycles > 7) {
            statusColor = 'var(--warning)';
            statusText = 'Long';
            statusDescription = 'While extra sleep can be beneficial, extremely long sleep may indicate underlying issues.';
        } else if (cycles >= 4 && cycles <= 6) {
            statusColor = 'var(--success)';
            statusText = 'Optimal';
            statusDescription = 'Your sleep duration is within the recommended range for adults.';
        }
        
        let html = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);margin:var(--space-md) 0;">
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${totalHours}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Total Sleep (hours)</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${cycles}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Sleep Cycles</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${actualSleepHours}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Actual Sleep (hours)</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;border-color:${statusColor};">
                    <div style="font-size:2rem;font-weight:700;color:${statusColor};">${statusText}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Sleep Status</div>
                </div>
            </div>
            
            <div style="padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);margin:var(--space-md) 0;">
                <p style="margin:0;font-size:0.9375rem;">${statusDescription}</p>
                <p style="margin:var(--space-sm) 0 0 0;font-size:0.875rem;color:var(--text-muted);">
                    Recommended for your age group (${ageInfo ? ageInfo.label : 'Adult'}): ${ageRange}
                </p>
                <p style="margin:var(--space-sm) 0 0 0;font-size:0.875rem;color:var(--text-muted);">
                    Average sleep cycle: ${result.cycleDuration} minutes
                </p>
            </div>
            
            <div style="margin-top:var(--space-lg);">
                <h4 style="font-size:1rem;">Understanding Your Results</h4>
                <ul style="color:var(--text-secondary);font-size:0.9375rem;padding-left:var(--space-lg);">
                    <li>You experienced approximately ${Math.round(result.cycles * 10) / 10} sleep cycles</li>
                    <li>${Math.round(result.cycles * 10) / 10} cycles × ${result.cycleDuration} minutes = approximately ${actualSleepHours} hours of sleep</li>
                    <li>You spent ${totalHours} hours in bed total</li>
                </ul>
            </div>
        `;
        
        resultsContent.innerHTML = html;
    }
});
