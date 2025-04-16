document.addEventListener('DOMContentLoaded', function() {
    // Get stored estimate data
    const estimateData = JSON.parse(localStorage.getItem('prefabEstimate'));
    
    if (!estimateData) {
        window.location.href = 'estimator.html';
        return;
    }

    // Indian Prefab Construction Cost Parameters (in ₹)
    const indianCostParams = {
        // Base costs already in estimateData
        additionalCosts: {
            labour: {
                skilled: 600,       // ₹600/sqft for skilled labor
                unskilled: 300      // ₹300/sqft for unskilled labor
            },
            foundation: 250,        // ₹250/sqft for standard foundation
            plumbing: 150,          // ₹150/sqft
            electrical: 200,        // ₹200/sqft
            interior: {
                basic: 400,         // ₹400/sqft for basic finishing
                premium: 800        // ₹800/sqft for premium finishing
            },
            approvals: {
                buildingPlan: 50000,    // ₹50,000 for plan approval
                municipal: 0.01,       // 1% of project cost
                environmental: 25000    // ₹25,000 for clearances
            },
            transportation: {
                local: 50000,       // ₹50,000 for local transport
                longDistance: 2      // ₹2/km for long distance (>100km)
            },
            contingency: 0.05       // 5% of total cost
        }
    };

    // Calculate additional Indian-specific costs
    function calculateIndianCosts(baseData) {
        const sqft = baseData.squareFootage;
        const costs = {
            labour: (indianCostParams.additionalCosts.labour.skilled + 
                    indianCostParams.additionalCosts.labour.unskilled) * sqft,
            foundation: indianCostParams.additionalCosts.foundation * sqft,
            plumbing: indianCostParams.additionalCosts.plumbing * sqft,
            electrical: indianCostParams.additionalCosts.electrical * sqft,
            interior: indianCostParams.additionalCosts.interior.basic * sqft,
            approvals: indianCostParams.additionalCosts.approvals.buildingPlan + 
                      (baseData.totalCost * indianCostParams.additionalCosts.approvals.municipal) +
                      indianCostParams.additionalCosts.approvals.environmental,
            transportation: indianCostParams.additionalCosts.transportation.local,
            contingency: baseData.totalCost * indianCostParams.additionalCosts.contingency
        };
        
        // Add premium if material grade is premium/luxury
        if (baseData.materialGrade === 'premium' || baseData.materialGrade === 'luxury') {
            costs.interior = indianCostParams.additionalCosts.interior.premium * sqft;
        }
        
        return costs;
    }

    const additionalCosts = calculateIndianCosts(estimateData);
    const totalIndianCost = estimateData.totalCost + 
                          Object.values(additionalCosts).reduce((a, b) => a + b, 0);

    // Format numbers in Indian Rupees
    function formatINR(amount) {
        if (amount >= 10000000) {
            return '₹' + (amount / 10000000).toFixed(2) + ' crores';
        } else if (amount >= 100000) {
            return '₹' + (amount / 100000).toFixed(2) + ' lakhs';
        } else {
            return '₹' + Math.round(amount).toLocaleString('en-IN');
        }
    }

    // Display summary
    document.getElementById('finalTotalCost').textContent = formatINR(totalIndianCost);
    
    // Calculate savings (25% savings vs RCC construction)
    const savings = totalIndianCost * 0.25;
    document.getElementById('savingsAmount').textContent = formatINR(savings);
    
    // Project summary
    document.getElementById('projectSummary').innerHTML = `
        <li><strong>Construction Type:</strong> ${formatBuildingType(estimateData.buildingType)}</li>
        <li><strong>Built-up Area:</strong> ${estimateData.squareFootage} sq.ft.</li>
        <li><strong>Floors:</strong> ${estimateData.floors}</li>
        <li><strong>Material Grade:</strong> ${estimateData.materialGrade.charAt(0).toUpperCase() + estimateData.materialGrade.slice(1)}</li>
        <li><strong>Location:</strong> ${getLocationName(estimateData.locationFactor)}</li>
        <li><strong>Completion Time:</strong> ${estimateData.floors > 1 ? '4-6 months' : '2-3 months'}</li>
    `;
    
    // Detailed cost breakdown
    const costBreakdown = document.getElementById('costBreakdownTable').querySelector('tbody');
    costBreakdown.innerHTML = `
        <tr>
            <td>Prefab Structure</td>
            <td>${formatINR(estimateData.baseCost)}</td>
            <td>${((estimateData.baseCost / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Labour Charges</td>
            <td>${formatINR(additionalCosts.labour)}</td>
            <td>${((additionalCosts.labour / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Foundation Work</td>
            <td>${formatINR(additionalCosts.foundation)}</td>
            <td>${((additionalCosts.foundation / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Plumbing & Sanitation</td>
            <td>${formatINR(additionalCosts.plumbing)}</td>
            <td>${((additionalCosts.plumbing / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Electrical Work</td>
            <td>${formatINR(additionalCosts.electrical)}</td>
            <td>${((additionalCosts.electrical / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Interior Finishing</td>
            <td>${formatINR(additionalCosts.interior)}</td>
            <td>${((additionalCosts.interior / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Approvals & Clearances</td>
            <td>${formatINR(additionalCosts.approvals)}</td>
            <td>${((additionalCosts.approvals / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Transportation</td>
            <td>${formatINR(additionalCosts.transportation)}</td>
            <td>${((additionalCosts.transportation / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
            <td>Contingency (5%)</td>
            <td>${formatINR(additionalCosts.contingency)}</td>
            <td>${((additionalCosts.contingency / totalIndianCost) * 100).toFixed(1)}%</td>
        </tr>
    `;

    // Charts
    const resultsCtx = document.getElementById('resultsChart').getContext('2d');
    new Chart(resultsCtx, {
        type: 'pie',
        data: {
            labels: [
                'Prefab Structure',
                'Labour',
                'Foundation',
                'Plumbing',
                'Electrical',
                'Interior',
                'Approvals',
                'Transport',
                'Contingency'
            ],
            datasets: [{
                data: [
                    estimateData.baseCost,
                    additionalCosts.labour,
                    additionalCosts.foundation,
                    additionalCosts.plumbing,
                    additionalCosts.electrical,
                    additionalCosts.interior,
                    additionalCosts.approvals,
                    additionalCosts.transportation,
                    additionalCosts.contingency
                ],
                backgroundColor: [
                    '#3498db', '#2ecc71', '#e74c3c', '#f39c12',
                    '#9b59b6', '#1abc9c', '#d35400', '#34495e', '#7f8c8d'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${formatINR(context.raw)} (${((context.raw/totalIndianCost)*100).toFixed(1)}%)`;
                        }
                    }
                }
            }
        }
    });

    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(comparisonCtx, {
        type: 'bar',
        data: {
            labels: ['Prefab Construction', 'RCC Construction'],
            datasets: [{
                label: 'Total Cost (₹)',
                data: [totalIndianCost, totalIndianCost * 1.25],
                backgroundColor: ['#3498db', '#e74c3c']
            },
            {
                label: 'Time (Months)',
                data: [estimateData.floors > 1 ? 5 : 3, estimateData.floors > 1 ? 12 : 8],
                backgroundColor: ['#2ecc71', '#f39c12'],
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cost in ₹' }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: { display: true, text: 'Duration in Months' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });

    // Helper functions
    function formatBuildingType(type) {
        const types = {
            modular: 'Modular Home (Factory-built)',
            panelized: 'Panelized System',
            precut: 'Precut Components (Site Assembly)'
        };
        return types[type] || type;
    }

    function getLocationName(factor) {
        if (factor === 1.0) return 'Metro City (Mumbai/Delhi/Bangalore)';
        if (factor === 1.15) return 'Tier-1 City (Pune/Hyderabad)';
        if (factor === 1.3) return 'Tier-2 City';
        if (factor === 1.5) return 'Rural/Village Area';
        return 'Custom Location';
    }

    // Button event listeners
    document.getElementById('newEstimate').addEventListener('click', () => window.location.href = 'estimator.html');
    document.getElementById('printEstimate').addEventListener('click', () => window.print());
    document.getElementById('contactUs').addEventListener('click', () => window.location.href = 'contact.html');
});