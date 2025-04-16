document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('costEstimatorForm');
    const baseCostElement = document.getElementById('baseCost');
    const featuresCostElement = document.getElementById('featuresCost');
    const locationFactorElement = document.getElementById('locationFactor');
    const totalCostElement = document.getElementById('totalCost');
    
    // Cost parameters in Indian Rupees
    const costParams = {
        modular: 12500,       // ₹12,500 per sqft
        panelized: 10800,     // ₹10,800 per sqft
        precut: 9000,         // ₹9,000 per sqft
        materialGrade: {
            economy: 0.9,
            standard: 1.0,
            premium: 1.2,
            luxury: 1.5
        },
        features: {
            garage: 1250000,   // ₹12.5 lakhs
            deck: 650000,      // ₹6.5 lakhs
            fireplace: 400000, // ₹4 lakhs
            solar: 850000      // ₹8.5 lakhs
        }
    };
    
    // Initialize chart
    const ctx = document.getElementById('costChart').getContext('2d');
    const costChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Structure', 'Materials', 'Features', 'Location'],
            datasets: [{
                data: [0, 0, 0, 0],
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
            maintainAspectRatio: false
        }
    });
    
    // Calculate costs
    function calculateCosts() {
        const buildingType = document.getElementById('buildingType').value;
        const squareFootage = parseFloat(document.getElementById('squareFootage').value) || 0;
        const materialGrade = document.getElementById('materialGrade').value;
        const locationFactor = parseFloat(document.getElementById('location').value);
        const floors = parseInt(document.getElementById('floors').value);
        
        // Get selected features
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
                            .map(el => el.value);
        
        // Calculate base cost
        let baseCost = 0;
        if (buildingType && squareFootage > 0) {
            baseCost = costParams[buildingType] * squareFootage * costParams.materialGrade[materialGrade];
            
            // Adjust for floors (simplified)
            if (floors > 1) {
                baseCost *= (1 + (floors - 1) * 0.3);
            }
        }
        
        // Calculate features cost
        let featuresCost = 0;
        features.forEach(feature => {
            featuresCost += costParams.features[feature];
        });
        
        // Calculate total cost
        const totalCost = (baseCost + featuresCost) * locationFactor;
        
        // Format numbers in Indian Rupees with lakhs/crores
        function formatINR(amount) {
            if (amount >= 10000000) {
                return '₹' + (amount / 10000000).toFixed(2) + ' crores';
            } else if (amount >= 100000) {
                return '₹' + (amount / 100000).toFixed(2) + ' lakhs';
            } else {
                return '₹' + amount.toLocaleString('en-IN');
            }
        }
        
        // Update UI
        baseCostElement.textContent = formatINR(baseCost);
        featuresCostElement.textContent = formatINR(featuresCost);
        locationFactorElement.textContent = `${((locationFactor - 1) * 100).toFixed(0)}%`;
        totalCostElement.textContent = formatINR(totalCost);
        
        // Update chart
        updateChart(baseCost, featuresCost, locationFactor);
        
        // Store results for results page
        localStorage.setItem('prefabEstimate', JSON.stringify({
            buildingType,
            squareFootage,
            floors,
            materialGrade,
            features,
            locationFactor,
            baseCost,
            featuresCost,
            totalCost
        }));
    }
    
    function updateChart(baseCost, featuresCost, locationFactor) {
        const locationAdjustment = (baseCost + featuresCost) * (locationFactor - 1);
        
        costChart.data.datasets[0].data = [
            baseCost * 0.7,  // Structure
            baseCost * 0.3,  // Materials
            featuresCost,     // Features
            locationAdjustment // Location
        ];
        costChart.update();
    }
    
    // Event listeners
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateCosts();
        
        // Redirect to results page
        window.location.href = 'results.html';
    });
    
    // Recalculate on any input change
    form.addEventListener('input', function() {
        calculateCosts();
    });
    
    // Initial calculation
    calculateCosts();
});