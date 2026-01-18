document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('timeline-app'); 
    
    // --- 1. LOAD DATA DYNAMICALLY FROM JSON FILES ---
    let contentData = [];
    let llmData = {};
    
    try {
        // Load content.json
        const contentResponse = await fetch('content.json');
        if (!contentResponse.ok) {
            throw new Error(`Failed to load content.json: ${contentResponse.statusText}`);
        }
        contentData = await contentResponse.json();
        
        // Load llm-interpretation.json
        const llmResponse = await fetch('llm-interpretation.json');
        if (!llmResponse.ok) {
            throw new Error(`Failed to load llm-interpretation.json: ${llmResponse.statusText}`);
        }
        llmData = await llmResponse.json();
        
        // Sort contentData by year to ensure chronological order
        contentData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback: show error message to user
        app.innerHTML = `<div style="padding: 20px; color: red;">Error loading data: ${error.message}. Please ensure content.json and llm-interpretation.json exist.</div>`;
        return;
    }

    // Store chart instances to avoid re-creating them constantly
    const chartInstances = {};

    // --- 2. Initialize App ---
    const mergedData = contentData.map(item => {
        const interpretation = llmData[item.year];
        return {
            ...item,
            skills: interpretation ? interpretation.skills_matrix : {},
            matches: interpretation ? interpretation.top_career_matches : [],
            aiSummary: interpretation ? interpretation.analysis_summary : "No analysis available."
        };
    });

    // Ensure we have data before initializing
    if (mergedData.length === 0) {
        app.innerHTML = '<div style="padding: 20px;">No timeline data available.</div>';
        return;
    }

    const latestData = mergedData[mergedData.length - 1];
    initHeroCharts(latestData);
    buildTimeline(mergedData);

    // --- 3. Hero Charts (Two Graphs) ---
    function initHeroCharts(data) {
        // Skill Radar
        const ctxSkill = document.getElementById('heroSkillChart').getContext('2d');
        new Chart(ctxSkill, {
            type: 'radar',
            data: {
                labels: Object.keys(data.skills),
                datasets: [{
                    label: 'Current Skills',
                    data: Object.values(data.skills),
                    fill: true,
                    backgroundColor: 'rgba(42, 161, 152, 0.2)',
                    borderColor: '#2aa198',
                    pointBackgroundColor: '#2aa198'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: { r: { suggestedMin: 0, suggestedMax: 100, grid: { color: 'rgba(100,100,100,0.1)' } } }
            }
        });

        // Career Matches - Top 10
        const ctxCareer = document.getElementById('heroCareerChart').getContext('2d');
        const top10Matches = data.matches.slice(0, 10); // Limit to top 10
        const labels = top10Matches.map(m => m.role);
        const values = top10Matches.map(m => m.match_percentage);

        new Chart(ctxCareer, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Match Probability (%)',
                    data: values,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: { x: { beginAtZero: true, max: 100 } }
            }
        });
    }

    // --- 4. Build Timeline ---
    function buildTimeline(data) {
        data.forEach((item, index) => {
            const div = document.createElement('div');
            div.classList.add('timeline-item');
            if (index > data.length / 2) div.classList.add('future-mode');

            // Track view state for each item
            const viewState = { isGraphView: false };

            div.innerHTML = `
                <div class="year-header">
                    <div class="year-bubble">${item.year}</div>
                    <button class="toggle-stats-btn" data-index="${index}" style="display: none;">
                        📊 Stats
                    </button>
                </div>
                <div class="item-content">
                    <div class="content-header">
                        <h3>${item.title}</h3>
                        <button class="close-accordion-btn" data-index="${index}" style="display: none;">✕</button>
                    </div>
                    
                    <div class="text-view" id="text-view-${index}">
                        <p>${item.description}</p>
                        <div class="ai-note"><strong>AI Analysis:</strong> ${item.aiSummary}</div>
                        <div class="gallery-thumbs">
                            ${item.images.map(src => `<img src="${src}" class="thumb" onclick="openModal('${src}')">`).join('')}
                        </div>
                    </div>

                    <div class="graph-view" id="graph-view-${index}">
                        <canvas id="chart-${index}"></canvas>
                    </div>
                </div>
            `;

            // Function to close an accordion
            const closeAccordion = (itemDiv, itemIndex) => {
                itemDiv.classList.remove('active');
                const toggleBtn = document.querySelector(`.toggle-stats-btn[data-index="${itemIndex}"]`);
                const closeBtn = document.querySelector(`.close-accordion-btn[data-index="${itemIndex}"]`);
                if (toggleBtn) toggleBtn.style.display = 'none';
                if (closeBtn) closeBtn.style.display = 'none';
                
                // Reset view state
                const textView = document.getElementById(`text-view-${itemIndex}`);
                const graphView = document.getElementById(`graph-view-${itemIndex}`);
                if (textView && graphView) {
                    textView.style.display = 'block';
                    graphView.style.display = 'none';
                    if (toggleBtn) toggleBtn.textContent = '📊 Stats';
                }
            };

            // Function to open an accordion
            const openAccordion = (itemDiv, itemIndex) => {
                // Close all other accordions first
                document.querySelectorAll('.timeline-item').forEach(i => {
                    const otherIndex = Array.from(app.children).indexOf(i);
                    if (otherIndex >= 0 && i !== itemDiv) {
                        closeAccordion(i, otherIndex);
                    }
                });
                
                // Open this accordion
                itemDiv.classList.add('active');
                const toggleBtn = document.querySelector(`.toggle-stats-btn[data-index="${itemIndex}"]`);
                const closeBtn = document.querySelector(`.close-accordion-btn[data-index="${itemIndex}"]`);
                if (toggleBtn) toggleBtn.style.display = 'flex';
                if (closeBtn) closeBtn.style.display = 'block';
                
                // Reset to text view when opening
                viewState.isGraphView = false;
                const textView = document.getElementById(`text-view-${itemIndex}`);
                const graphView = document.getElementById(`graph-view-${itemIndex}`);
                if (textView && graphView) {
                    textView.style.display = 'block';
                    graphView.style.display = 'none';
                    if (toggleBtn) toggleBtn.textContent = '📊 Stats';
                }
            };

            // Click on year bubble to open accordion
            const yearBubble = div.querySelector('.year-bubble');
            yearBubble.addEventListener('click', (e) => {
                e.stopPropagation();
                if (div.classList.contains('active')) {
                    closeAccordion(div, index);
                } else {
                    openAccordion(div, index);
                }
            });

            // Close button click handler
            const closeBtn = div.querySelector('.close-accordion-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeAccordion(div, index);
            });

            // Click on content area (but not buttons/images) - do nothing or close
            div.addEventListener('click', (e) => {
                // If clicking an image, button, or header, don't do anything
                if(e.target.classList.contains('thumb') || 
                   e.target.closest('.year-header') || 
                   e.target.closest('.toggle-stats-btn') ||
                   e.target.closest('.close-accordion-btn') ||
                   e.target.closest('.content-header')) return;
            });

            // Toggle Graph Logic
            const toggleBtn = div.querySelector('.toggle-stats-btn');
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Stop bubbling to accordion click
                
                // Ensure the accordion is open if it isn't
                if (!div.classList.contains('active')) {
                    openAccordion(div, index);
                }

                // Toggle between text and graph view
                viewState.isGraphView = !viewState.isGraphView;
                toggleGraphView(index, item, div.classList.contains('future-mode'), viewState.isGraphView);
            });

            app.appendChild(div);
        });
    }

    // --- 5. Toggle Graph Function ---
    function toggleGraphView(index, item, isFuture, showGraph) {
        const textView = document.getElementById(`text-view-${index}`);
        const graphView = document.getElementById(`graph-view-${index}`);
        const toggleBtn = document.querySelector(`.toggle-stats-btn[data-index="${index}"]`);
        
        if (showGraph) {
            textView.style.display = 'none';
            graphView.style.display = 'block';
            
            // Update button text
            if (toggleBtn) toggleBtn.textContent = '📝 Text';
            
            // Initialize Chart if not exists
            if (!chartInstances[index]) {
                const ctx = document.getElementById(`chart-${index}`).getContext('2d');
                
                // Determine styling based on era
                const textColor = isFuture ? '#fff' : '#000';
                const gridColor = isFuture ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                const chartColor = isFuture ? 'rgba(42, 161, 152, 0.5)' : 'rgba(181, 137, 0, 0.5)';
                const borderColor = isFuture ? '#2aa198' : '#b58900';

                // Data for Radar (Top 5 Careers)
                const top5 = item.matches.slice(0, 5);
                
                // Wrap labels into 2 lines by splitting at spaces
                const wrapLabel = (label, maxCharsPerLine = 18) => {
                    if (label.length <= maxCharsPerLine) return label;
                    
                    // Try to split at a space near the middle
                    const words = label.split(' ');
                    if (words.length === 1) {
                        // Single word - split in the middle
                        const mid = Math.floor(label.length / 2);
                        return label.substring(0, mid) + '\n' + label.substring(mid);
                    }
                    
                    // Find the best split point (closest to middle)
                    let firstLine = '';
                    let secondLine = '';
                    const targetLength = Math.floor(label.length / 2);
                    
                    for (let i = 0; i < words.length; i++) {
                        const testLine = (firstLine + ' ' + words[i]).trim();
                        if (testLine.length <= targetLength + 5) {
                            firstLine = testLine;
                        } else {
                            secondLine = words.slice(i).join(' ');
                            break;
                        }
                    }
                    
                    // Return with line break
                    if (secondLine) {
                        return firstLine + '\n' + secondLine;
                    }
                    return label;
                };
                
                const chartLabels = top5.map(m => wrapLabel(m.role));
                
                chartInstances[index] = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Career Fit %',
                            data: top5.map(m => m.match_percentage),
                            backgroundColor: chartColor,
                            borderColor: borderColor,
                            pointBackgroundColor: borderColor,
                            fill: true
                        }]
                    },
                    options: {
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 30,
                                right: 30,
                                bottom: 30,
                                left: 30
                            }
                        },
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100,
                                pointLabels: { 
                                    font: { size: 11, lineHeight: 1.2 },
                                    color: textColor,
                                    padding: 18
                                },
                                grid: { color: gridColor },
                                angleLines: { color: gridColor },
                                ticks: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ' + context.parsed.r + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } else {
            graphView.style.display = 'none';
            textView.style.display = 'block';
            
            // Update button text
            if (toggleBtn) toggleBtn.textContent = '📊 Stats';
        }
    }

    // --- 6. Modal Logic ---
    window.openModal = function(src) {
        document.getElementById('imageModal').style.display = "block";
        document.getElementById('modalImg').src = src;
    }
    document.querySelector('.close').onclick = function() {
        document.getElementById('imageModal').style.display = "none";
    }
});