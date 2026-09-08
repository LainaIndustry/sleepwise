/**
 * SleepWise - Sleep Debt Calculator
 * Track weekly sleep patterns and calculate sleep debt
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const ageSelect = document.getElementById('debt-age');
    const dayInputsContainer = document.getElementById('debt-day-inputs');
    const submitBtn = document.getElementById('debt-submit');
    const resetBtn = document.getElementById('debt-reset');
    const resultsContainer = document.getElementById('debt-results');
    const resultsContent = document.getElementById('debt-results-content');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Generate day inputs
    if (dayInputsContainer) {
        let html = '';
        days.forEach(day => {
            html += `
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md);margin-bottom:var(--space-md);align-items:end;">
                    <div style="font-weight:600;padding-bottom:var(--space-sm);">${day}</div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:0.75rem;color:var(--text-muted);">Recommended (hours)</label>
                        <input type="number" class="form-control debt-recommended" data-day="${day}" value="8" min="4" max="18" step="0.5">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label style="font-size:0.75rem;color:var(--text-muted);">Actual (hours)</label>
                        <input type="number" class="form-control debt-actual" data-day="${day}" value="7" min="0" max="18" step="0.5">
                    </div>
                </div>
            `;
        });
        dayInputsContainer.innerHTML = html;
        
        // Update recommended values based on age
        updateRecommendedSleep();
    }
    
    // Age change updates recommended values
    if (ageSelect) {
        ageSelect.addEventListener('change', updateRecommendedSleep);
    }
    
    function updateRecommendedSleep() {
        if (!ageSelect) return;
        const age = ageSelect.value;
        const ageInfo = window.getAgeRecommendation ? window.getAgeRecommendation(age) : null;
        
        if (ageInfo) {
            const recommended = (ageInfo.min + ageInfo.max) / 2;
            document.querySelectorAll('.debt-recommended').forEach(input => {
                input.value = recommended.toFixed(1);
            });
        }
    }
    
    // Calculate
    if (submitBtn) {
        submitBtn.addEventListener('click', calculateDebt);
    }
    
    // Reset
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            document.querySelectorAll('.debt-recommended').forEach(input => {
                input.value = '8';
            });
            document.querySelectorAll('.debt-actual').forEach(input => {
                input.value = '7';
            });
            if (ageSelect) ageSelect.value = 'adult';
            updateRecommendedSleep();
            if (resultsContainer) {
                resultsContainer.setAttribute('hidden', '');
                resultsContainer.hidden = true;
            }
        });
    }
    
    function calculateDebt() {
        const recommendedInputs = document.querySelectorAll('.debt-recommended');
        const actualInputs = document.querySelectorAll('.debt-actual');
        
        let totalRecommended = 0;
        let totalActual = 0;
        let dayData = [];
        
        recommendedInputs.forEach((input, index) => {
            const rec = parseFloat(input.value) || 0;
            const act = parseFloat(actualInputs[index]?.value) || 0;
            
            totalRecommended += rec;
            totalActual += act;
            
            dayData.push({
                day: days[index],
                recommended: rec,
                actual: act,
                difference: act - rec
            });
        });
        
        const weeklyDebt = totalRecommended - totalActual;
        const averageSleep = totalActual / 7;
        const averageRecommended = totalRecommended / 7;
        
        displayResults(dayData, totalRecommended, totalActual, weeklyDebt, averageSleep, averageRecommended);
        
        // Scroll to results
        if (window.innerWidth < 768 && resultsContainer) {
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    function displayResults(dayData, totalRecommended, totalActual, weeklyDebt, averageSleep, averageRecommended) {
        if (!resultsContainer || !resultsContent) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        let statusColor = 'var(--success)';
        let statusText = 'Good';
        let statusDescription = 'You\'re getting enough sleep on average.';
        
        if (weeklyDebt > 7) {
            statusColor = 'var(--danger)';
            statusText = 'High Sleep Debt';
            statusDescription = 'You\'re significantly sleep-deprived. Consider prioritizing rest.';
        } else if (weeklyDebt > 3) {
            statusColor = 'var(--warning)';
            statusText = 'Moderate Sleep Debt';
            statusDescription = 'You\'re slightly sleep-deprived. Try to get more rest.';
        } else if (weeklyDebt < -2) {
            statusColor = 'var(--warning)';
            statusText = 'Excess Sleep';
            statusDescription = 'You\'re getting more sleep than average. This may be fine, but monitor for other factors.';
        }
        
        // Create bar chart visualization
        let barHtml = '';
        dayData.forEach(data => {
            const barHeight = Math.min(Math.max((data.actual / data.recommended) * 100, 0), 200);
            const barColor = data.actual >= data.recommended ? 'var(--success)' : 'var(--warning)';
            
            barHtml += `
                <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
                    <div style="font-size:0.625rem;color:var(--text-muted);">${data.day.substring(0, 3)}</div>
                    <div style="width:100%;height:80px;background:var(--surface-alt);border-radius:var(--radius-sm);overflow:hidden;position:relative;">
                        <div style="position:absolute;bottom:0;left:0;right:0;height:${Math.min(barHeight, 100)}%;background:${barColor};border-radius:var(--radius-sm);transition:height 0.5s ease;"></div>
                    </div>
                    <div style="font-size:0.625rem;color:var(--text-muted);margin-top:2px;">${data.actual.toFixed(1)}h</div>
                </div>
            `;
        });
        
        let html = `
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-md);margin:var(--space-md) 0;">
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:var(--text);">${totalActual.toFixed(1)}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Total Sleep (hours)</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;">
                    <div style="font-size:2rem;font-weight:700;color:${weeklyDebt > 0 ? 'var(--danger)' : 'var(--success)'};">${weeklyDebt > 0 ? '+' : ''}${weeklyDebt.toFixed(1)}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Weekly Sleep Debt</div>
                </div>
                <div class="result-card" style="background:var(--surface-alt);padding:var(--space-lg);text-align:center;border-color:${statusColor};">
                    <div style="font-size:2rem;font-weight:700;color:${statusColor};">${statusText}</div>
                    <div style="font-size:0.875rem;color:var(--text-muted);">Status</div>
                </div>
            </div>
            
            <div style="padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);margin:var(--space-md) 0;">
                <p style="margin:0;font-size:0.9375rem;">${statusDescription}</p>
                <p style="margin:var(--space-sm) 0 0 0;font-size:0.875rem;color:var(--text-muted);">
                    Average nightly sleep: ${averageSleep.toFixed(1)} hours (recommended: ${averageRecommended.toFixed(1)} hours)
                </p>
            </div>
            
            <div style="margin-top:var(--space-lg);">
                <h4 style="font-size:1rem;">Weekly Sleep Pattern</h4>
                <div style="display:flex;gap:var(--space-xs);margin:var(--space-md) 0;height:100px;align-items:flex-end;">
                    ${barHtml}
                </div>
            </div>
            
            <div style="margin-top:var(--space-lg);">
                <h4 style="font-size:1rem;">Daily Breakdown</h4>
                <div style="overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border);">
                                <th style="text-align:left;padding:var(--space-sm);">Day</th>
                                <th style="text-align:center;padding:var(--space-sm);">Recommended</th>
                                <th style="text-align:center;padding:var(--space-sm);">Actual</th>
                                <th style="text-align:center;padding:var(--space-sm);">Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dayData.map(data => `
                                <tr style="border-bottom:1px solid var(--border-light);">
                                    <td style="padding:var(--space-sm);font-weight:500;">${data.day}</td>
                                    <td style="text-align:center;padding:var(--space-sm);">${data.recommended.toFixed(1)}h</td>
                                    <td style="text-align:center;padding:var(--space-sm);">${data.actual.toFixed(1)}h</td>
                                    <td style="text-align:center;padding:var(--space-sm);color:${data.difference >= 0 ? 'var(--success)' : 'var(--danger)'};">${data.difference >= 0 ? '+' : ''}${data.difference.toFixed(1)}h</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        resultsContent.innerHTML = html;
    }
});
