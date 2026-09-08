/**
 * SleepWise - Age-Based Sleep Guide
 * Display sleep recommendations based on age group
 */

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.calculator-main');
    if (!container) return;
    
    const ageSelect = document.getElementById('age-select');
    const submitBtn = document.getElementById('age-submit');
    const resultsContainer = document.getElementById('age-results');
    const resultsContent = document.getElementById('age-results-content');
    
    const ageRecommendations = {
        'newborn': {
            label: 'Newborn (0-3 months)',
            min: 14,
            max: 17,
            description: 'Newborns need significant sleep for brain development and growth. Sleep is typically divided into multiple short periods throughout the day and night.',
            tips: [
                'Follow safe sleep guidelines (back sleeping, firm mattress)',
                'Create a consistent sleep environment',
                'Watch for sleep cues like yawning or fussiness',
                'Establish a simple bedtime routine'
            ]
        },
        'infant': {
            label: 'Infant (4-11 months)',
            min: 12,
            max: 16,
            description: 'Infants begin to consolidate sleep into longer nighttime periods. Naps during the day remain important for development.',
            tips: [
                'Establish a consistent sleep schedule',
                'Create a calming bedtime routine',
                'Ensure the sleep environment is safe and comfortable',
                'Limit stimulation before bedtime'
            ]
        },
        'toddler': {
            label: 'Toddler (1-2 years)',
            min: 11,
            max: 14,
            description: 'Toddlers typically transition to one longer nap during the day. Nighttime sleep becomes more consolidated.',
            tips: [
                'Maintain a consistent sleep-wake schedule',
                'Use a calming bedtime routine',
                'Encourage independent sleep skills',
                'Create a sleep-friendly environment'
            ]
        },
        'preschooler': {
            label: 'Preschooler (3-5 years)',
            min: 10,
            max: 13,
            description: 'Preschoolers may still nap but many begin to drop daytime naps. Nighttime sleep becomes the primary sleep period.',
            tips: [
                'Maintain consistent bedtimes and wake times',
                'Limit screen time before bed',
                'Use a positive sleep routine',
                'Address fears or anxieties about sleep'
            ]
        },
        'school': {
            label: 'School-age (6-12 years)',
            min: 9,
            max: 12,
            description: 'School-age children have more structured schedules. Adequate sleep is essential for school performance and overall health.',
            tips: [
                'Set consistent sleep and wake times',
                'Limit caffeine and screen time',
                'Create a homework and bedtime schedule',
                'Encourage physical activity during the day'
            ]
        },
        'teen': {
            label: 'Teenager (13-17 years)',
            min: 8,
            max: 10,
            description: 'Teenagers often experience a shift in circadian rhythm, making them naturally sleep later. This can conflict with early school start times.',
            tips: [
                'Aim for consistent sleep and wake times',
                'Limit caffeine and screen time before bed',
                'Expose yourself to morning sunlight',
                'Manage stress and activities effectively'
            ]
        },
        'young-adult': {
            label: 'Young Adult (18-25 years)',
            min: 7,
            max: 9,
            description: 'Young adults often have irregular schedules due to work, study, and social life. Prioritizing sleep is crucial for mental and physical health.',
            tips: [
                'Maintain a consistent sleep schedule',
                'Create a relaxing bedtime routine',
                'Limit caffeine and alcohol before bed',
                'Manage stress and anxiety'
            ]
        },
        'adult': {
            label: 'Adult (26-64 years)',
            min: 7,
            max: 9,
            description: 'Adults with busy careers and family responsibilities may sacrifice sleep. Prioritizing sleep is essential for long-term health and productivity.',
            tips: [
                'Aim for 7-9 hours of quality sleep',
                'Create a comfortable sleep environment',
                'Exercise regularly but not too close to bedtime',
                'Manage stress through relaxation techniques'
            ]
        },
        'older-adult': {
            label: 'Older Adult (65+ years)',
            min: 7,
            max: 8,
            description: 'Older adults may experience changes in sleep patterns, including lighter sleep and more frequent awakenings. Sleep remains essential for health.',
            tips: [
                'Maintain a consistent sleep schedule',
                'Ensure regular exposure to daylight',
                'Stay physically and mentally active',
                'Manage medications that may affect sleep'
            ]
        }
    };
    
    // Auto-display results on page load
    if (ageSelect) {
        setTimeout(() => {
            displayRecommendations(ageSelect.value);
        }, 100);
    }
    
    // Submit
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            if (ageSelect) {
                displayRecommendations(ageSelect.value);
            }
        });
    }
    
    function displayRecommendations(ageKey) {
        if (!resultsContainer || !resultsContent) return;
        
        const data = ageRecommendations[ageKey];
        if (!data) return;
        
        resultsContainer.hidden = false;
        resultsContainer.removeAttribute('hidden');
        
        const avgSleep = ((data.min + data.max) / 2).toFixed(1);
        
        let html = `
            <div style="text-align:center;padding:var(--space-md) 0;">
                <div style="font-size:1.5rem;font-weight:700;color:var(--text);">${data.label}</div>
                <div style="font-size:3rem;font-weight:700;color:var(--primary);margin:var(--space-sm) 0;">
                    ${data.min}–${data.max} hours
                </div>
                <div style="font-size:1rem;color:var(--text-secondary);">Recommended sleep per 24 hours</div>
                <div style="font-size:0.875rem;color:var(--text-muted);margin-top:var(--space-sm);">Average: ${avgSleep} hours</div>
            </div>
            
            <div style="padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);margin:var(--space-md) 0;">
                <p style="margin:0;font-size:0.9375rem;">${data.description}</p>
            </div>
            
            <div style="margin-top:var(--space-lg);">
                <h4 style="font-size:1rem;">Tips for Better Sleep</h4>
                <ul style="color:var(--text-secondary);font-size:0.9375rem;padding-left:var(--space-lg);">
                    ${data.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top:var(--space-lg);padding:var(--space-md);background:var(--surface-alt);border-radius:var(--radius);">
                <h4 style="font-size:1rem;">Signs You May Need More Sleep</h4>
                <ul style="color:var(--text-secondary);font-size:0.875rem;padding-left:var(--space-lg);">
                    <li>Feeling tired or drowsy during the day</li>
                    <li>Difficulty concentrating or remembering</li>
                    <li>Mood changes or irritability</li>
                    <li>Needing caffeine to stay alert</li>
                </ul>
            </div>
        `;
        
        resultsContent.innerHTML = html;
        
        // Scroll to results
        if (window.innerWidth < 768 && resultsContainer) {
            setTimeout(() => {
                resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});
