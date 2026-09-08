/**
 * SleepWise - Nap Calculator
 * Plan the perfect nap duration and timing
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const currentTimeInput = document.getElementById('nap-current-time');
    const durationSelect = document.getElementById('nap-duration');
    const submitBtn = document.getElementById('nap-submit');
    const resetBtn = document.getElementById('nap-reset');
    const resultsContainer = document.getElementById('nap-results');
    const resultsContent = document.getElementById('nap-results-content');
    const nowBtn = document.getElementById('nap-now-btn');
    
    // Initialize with current time
    if (currentTimeInput) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        currentTimeInput.value = `${hours}:${minutes}`;
    }
    
    // Now button
    if (nowBtn) {
        nowBtn.addEventListener('click', function() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            if (currentTimeInput) {
                currentTimeInput.value = `${hours}:${minutes}`;
            }
        });
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', planNap);
    }
    
    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (currentTimeInput) {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                currentTimeInput.value = `${hours}:${minutes}`;
            }
            if (durationSelect) durationSelect.value = '20';
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    }
    
    function planNap() {
        if (!currentTimeInput || !durationSelect) return;
        
        const timeStr = currentTimeInput.value;
        const duration = parseInt(durationSelect.value, 10);
        
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
        
        const currentMinutes = hours * 60 + minutes;
        
        // Calculate nap times using the engine
        const results = window.calculateNapTimes ? window.calculateNapTimes(currentMinutes, duration) : [];
        
        if (!results || results.length === 0) {
            showError('Unable to calculate nap times. Please try again.');
            return;
        }
        
        displayResults(results, duration);
        
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
    
    function displayResults(results, selectedDuration) {
        if (!resultsContainer || !resultsContent) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        const currentTime = results[0]?.wakeTime ? '--:--' : '';
        
        let html = `
            <div style="margin:var(--space-md) 0;">
                <p style="font-size:0.9375rem;font-weight:600;">Based on your current time, here are your nap options:</p>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(180px, 1fr));gap:var(--space-md);margin:var(--space-md) 0;">
        `;
        
        results.forEach(result => {
            const isSelected = result.duration === selectedDuration;
            const wakeTime = result.wakeTime || '--:--';
            const recommendation = result.recommendation || '';
            
            let durationLabel = `${result.duration} min`;
            if (result.duration === 10) durationLabel = '10 min (Power Nap)';
            else if (result.duration === 20) durationLabel = '20 min (Energy Boost)';
            else if (result.duration === 30) durationLabel = '30 min (Alertness)';
            else if (result.duration === 60) durationLabel = '60 min (Learning)';
            else if (result.duration === 90) durationLabel = '90 min (Full Cycle)';
            
            html += `
                <div class="result-card" style="${isSelected ? 'border:2px solid var(--primary);' : ''}background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:1.25rem;font-weight:700;color:${isSelected ? 'var(--primary)' : 'var(--text)'};">${durationLabel}</div>
                    <div style="font-size:1.5rem;font-weight:600;color:var(--text);margin:var(--space-sm) 0;">Wake at ${wakeTime}</div>
                    <div style="font-size:0.8125rem;color:var(--text-muted);">${recommendation}</div>
                    ${isSelected ? '<div style="font-size:0.75rem;color:var(--primary);font-weight:600;margin-top:var(--space-sm);">✓ Selected</div>' : ''}
                </div>
            `;
        });
        
        html += `
            </div>
            
            <div style="padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);margin:var(--space-md) 0;">
                <h4 style="font-size:1rem;margin-bottom:var(--space-sm);">Nap Tips</h4>
                <ul style="color:var(--text-secondary);font-size:0.875rem;padding-left:var(--space-lg);">
                    <li>Best time to nap: 1-3 PM (circadian dip)</li>
                    <li>Avoid napping within 6 hours of bedtime</li>
                    <li>Set an alarm to wake up on time</li>
                    <li>Find a quiet, dark, comfortable place</li>
                </ul>
            </div>
        `;
        
        resultsContent.innerHTML = html;
    }
});
