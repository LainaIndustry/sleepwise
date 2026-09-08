/**
 * SleepWise - Sleep Duration Calculator
 * Calculate total sleep time and efficiency
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const bedtimeInput = document.getElementById('duration-bedtime');
    const wakeupInput = document.getElementById('duration-wakeup');
    const fallAsleepSelect = document.getElementById('duration-fall-asleep');
    const awakeSelect = document.getElementById('duration-awake');
    const submitBtn = document.getElementById('duration-submit');
    const resetBtn = document.getElementById('duration-reset');
    const resultsContainer = document.getElementById('duration-results');
    const resultsContent = document.getElementById('duration-results-content');
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', calculateDuration);
    }
    
    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (bedtimeInput) bedtimeInput.value = '23:00';
            if (wakeupInput) wakeupInput.value = '07:00';
            if (fallAsleepSelect) fallAsleepSelect.value = '15';
            if (awakeSelect) awakeSelect.value = '0';
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    }
    
    function calculateDuration() {
        if (!bedtimeInput || !wakeupInput) return;
        
        const bedtimeStr = bedtimeInput.value;
        const wakeupStr = wakeupInput.value;
        const fallAsleep = parseInt(fallAsleepSelect ? fallAsleepSelect.value : '15', 10);
        const awake = parseInt(awakeSelect ? awakeSelect.value : '0', 10);
        
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
        const result = window.calculateSleepDuration ? 
            window.calculateSleepDuration(bedtimeMinutes, wakeMinutes, fallAsleep, awake) : null;
        
        if (!result) {
            showError('Unable to calculate sleep duration. Please check your inputs.');
            return;
        }
        
        displayResults(result);
        
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
    
    function displayResults(result) {
        if (!resultsContainer || !resultsContent) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        const totalHours = result.totalInBedHours;
        const actualSleep = result.actualSleepHours;
        const efficiency = result.sleepEfficiency;
        
        let statusColor = 'var(--success)';
        let statusText = 'Good';
        let statusDescription = 'Your sleep efficiency is within a healthy range.';
        
        if (efficiency < 85) {
            statusColor = 'var(--warning)';
            statusText = 'Improvement Needed';
            statusDescription = 'Consider improving sleep hygiene to increase sleep efficiency.';
        } else if (efficiency >= 90) {
            statusColor = 'var(--success)';
            statusText = 'Excellent';
            statusDescription = 'Great sleep efficiency! You\'re spending most of your time in bed sleeping.';
        }
        
        let html = `
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md);margin:var(--space-md) 0;">
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${totalHours}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Time in Bed (hours)</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${actualSleep}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Actual Sleep (hours)</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;border-color:${statusColor};">
                    <div style="font-size:2rem;font-weight:700;color:${statusColor};">${efficiency}%</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Sleep Efficiency</div>
                </div>
            </div>
            
            <div style="padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);margin:var(--space-md) 0;">
                <p style="margin:0;font-size:0.9375rem;font-weight:600;">${statusText}</p>
                <p style="margin:var(--space-xs) 0 0 0;font-size:0.875rem;color:var(--text-secondary);">${statusDescription}</p>
            </div>
            
            <div style="margin-top:var(--space-lg);">
                <h4 style="font-size:1rem;">Sleep Breakdown</h4>
                <ul style="color:var(--text-secondary);font-size:0.9375rem;padding-left:var(--space-lg);">
                    <li>Total time in bed: ${totalHours} hours</li>
                    <li>Time to fall asleep: ${result.fallAsleepMinutes} minutes</li>
                    <li>Time awake during night: ${result.awakeMinutes} minutes</li>
                    <li>Actual sleep time: ${actualSleep} hours</li>
                </ul>
            </div>
            
            <div style="margin-top:var(--space-lg);padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);">
                <h4 style="font-size:1rem;">What Is Sleep Efficiency?</h4>
                <p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">
                    Sleep efficiency is the percentage of time you spend sleeping while in bed. 
                    A healthy sleep efficiency is typically above 85%. If yours is below 85%, 
                    consider evaluating your sleep hygiene and environment.
                </p>
                <a href="/blog/tips-for-better-sleep.html" style="font-size:0.875rem;margin-top:var(--space-sm);display:inline-block;">View sleep tips →</a>
            </div>
        `;
        
        resultsContent.innerHTML = html;
    }
});
