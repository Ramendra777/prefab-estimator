document.addEventListener('DOMContentLoaded', function() {
    // Get stored estimate data
    const estimateData = JSON.parse(localStorage.getItem('prefabEstimate'));
    
    if (!estimateData) {
        // Redirect to calculator if no data
        window.location.href = 'estimator.html';
        return;
    }
    
    // Display summary
    document.getElementById('finalTotalCost').textContent = `$${estimateData.totalCost.toLocaleString()}`;
    
    // Calculate savings (assuming 15% savings vs traditional)
    const savings = estimateData.totalCost * 0.15;
    document.getElementById('savingsAmount').textContent = `$${savings.toLocaleString()}`;
    
    // Project summary
    const projectSummary = document.getElementById('projectSummary');
    projectSummary.innerHTML = `
        <li><strong>Type:</strong> ${formatBuildingType(estimateData.buildingType)}</li>
        <li><strong>Size:</strong> ${estimateData.squareFootage} sq. ft.</li>
        <li><strong>Floors:</strong> ${estimateData.floors}</li>
        <li><strong>Material Grade:</strong> ${estimateData.materialGrade.charAt(0).toUpperCase() + estimateData.materialGrade.slice(1)}</li>
        <li><strong>Features:</strong> ${estimateData.features.length > 0 ? estimateData.features.join(', ') : 'None'}</li>
        <li><strong>Location:</strong> ${getLocationName(estimateData.locationFactor)}</li>
    `;
    
    // Cost breakdown table
    const costBreakdown = document.getElementById('costBreakdownTable').querySelector('tbody');
    costBreakdown.innerHTML = `
        <tr>
            <td>Base Structure</td>
            <td>$${estimateData.baseCost.toLocaleString()}</td>
            <td>${((estimateData.baseCost / estimateData.totalCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Additional Features</td>
            <td>$${estimateData.featuresCost.toLocaleString()}</td>
            <td>${((estimateData.featuresCost / estimateData.totalCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Location Adjustment</td>
            <td>$${((estimateData.locationFactor - 1) * (estimateData.baseCost + estimateData.featuresCost)).toLocaleString()}</td>
            <td>${((estimateData.locationFactor - 1) * 100).toFixed(1)}%</td>
        </tr>
    `;
    
    // Charts
    const resultsCtx = document.getElementById('resultsChart').getContext('2d');
    new Chart(resultsCtx, {
        type: 'bar',
        data: {
            labels: ['Structure', 'Materials', 'Features', 'Location'],
            datasets: [{
                label: 'Cost Breakdown',
                data: [
                    estimateData.baseCost * 0.7,
                    estimateData.baseCost * 0.3,
                    estimateData.featuresCost,
                    (estimateData.locationFactor - 1) * (estimateData.baseCost + estimateData.featuresCost)
                ],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f39c12'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Prefabricated', 'Traditional'],
            datasets: [{
                label: 'Construction Cost',
                data: [estimateData.totalCost, estimateData.totalCost * 1.15],
                backgroundColor: [
                    '#3498db',
                    '#e74c3c'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Button event listeners
    document.getElementById('newEstimate').addEventListener('click', function() {
        window.location.href = 'estimator.html';
    });
    
    document.getElementById('printEstimate').addEventListener('click', function() {
        window.print();
    });
    
    document.getElementById('contactUs').addEventListener('click', function() {
        window.location.href = '#';
    });
    
    // Helper functions
    function formatBuildingType(type) {
        const types = {
            modular: 'Modular Home',
            panelized: 'Panelized System',
            precut: 'Precut Components'
        };
        return types[type] || type;
    }
    
    function getLocationName(factor) {
        if (factor === 1.0) return 'Urban';
        if (factor === 1.15) return 'Suburban';
        if (factor === 1.3) return 'Rural';
        if (factor === 1.5) return 'Remote';
        return 'Custom';
    }
});