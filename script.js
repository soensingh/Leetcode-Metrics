document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('fetch-metrics');
    const searchInput = document.getElementById('username');
    const statusMessage = document.getElementById('status-message');

    const progressItemEasy = document.querySelector('.progress-easy');
    const progressItemMedium = document.querySelector('.progress-medium');
    const progressItemHard = document.querySelector('.progress-hard');

    const cards = document.querySelector('.stats-card');


    const animationStoppers = new Map();


    animationStoppers.set(progressItemEasy, animateProgress(progressItemEasy, 1500));
    animationStoppers.set(progressItemMedium, animateProgress(progressItemMedium, 1500));
    animationStoppers.set(progressItemHard, animateProgress(progressItemHard, 1500));

    function updateProgress(solved, total, label, circle) {

        if (animationStoppers.has(circle)) {
            const stopAnimation = animationStoppers.get(circle);
            stopAnimation();
            animationStoppers.delete(circle);
        }


        const progressDegree = solved / total * 100;


        setTimeout(() => {

            animateToValue(circle, progressDegree, 1000);


            updateProgressLabel(circle, solved, total);
        }, 100);
    }

    function updateProgressLabel(circle, solved, total) {

        let labelDiv = circle.querySelector('.progress-label');
        if (!labelDiv) {

            labelDiv = document.createElement('div');
            labelDiv.className = 'progress-label';
            circle.appendChild(labelDiv);
        }


        labelDiv.textContent = `${solved}/${total}`;
    }


    function animateToValue(circle, targetValue, duration) {

        circle.style.setProperty('--progress-degree', '0%');

        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            let progress = (timestamp - start) / duration;
            progress = progress > 1 ? 1 : progress;


            let eased = 1 - Math.pow(1 - progress, 3);

            const current = targetValue * eased;

            circle.style.setProperty('--progress-degree', `${current}%`);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    function validateUsername(username) {
        if (!username || username.trim() === '') {
            statusMessage.classList.remove('status-message-green');
            statusMessage.classList.add('status-message-red');
            statusMessage.textContent = 'Please enter a valid LeetCode username.';
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isValid = regex.test(username);
        if (!isValid) {
            statusMessage.classList.remove('status-message-green');
            statusMessage.classList.add('status-message-red');
            statusMessage.textContent = 'Username contains invalid characters.';
        }
        return isValid;
    }

    async function fetchMetrics(username) {
        const apiUrl = `https://leetcode-stats-api.herokuapp.com/${username}`;
        try {
            searchButton.disabled = true;
            searchButton.textContent = 'Fetching...';
            statusMessage.classList.add('status-message-green');
            statusMessage.classList.remove('status-message-red');
            statusMessage.textContent = 'Loading data...';

            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const fetchedData = await response.json();
            console.log('Fetched data:', fetchedData);
            displayData(fetchedData);
            statusMessage.textContent = '';
        }
        catch (error) {
            console.error('Error fetching data:', error);
            statusMessage.classList.remove('status-message-green');
            statusMessage.classList.add('status-message-red');
            statusMessage.textContent = 'Error fetching data. Please check the username and try again.';
        }
        finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Fetch Metrics';
        }
    }

    function displayData(fetchedData) {
        const totalQuestions = fetchedData.totalQuestions;
        const easyQuestions = fetchedData.totalEasy;
        const mediumQuestions = fetchedData.totalMedium;
        const hardQuestions = fetchedData.totalHard;
        const easySolved = fetchedData.easySolved;
        const mediumSolved = fetchedData.mediumSolved;
        const hardSolved = fetchedData.hardSolved;
        const acceptanceRate = fetchedData.acceptanceRate;
        const ranking = fetchedData.ranking;
        const contributionPoints = fetchedData.contributionPoints;
        const reputation = fetchedData.reputation;

        console.log(`Total Questions: ${totalQuestions}`);
        console.log(`Easy Questions: ${easyQuestions}`);
        console.log(`Medium Questions: ${mediumQuestions}`);
        console.log(`Hard Questions: ${hardQuestions}`);
        console.log(`Easy Solved: ${easySolved}`);
        console.log(`Medium Solved: ${mediumSolved}`);
        console.log(`Hard Solved: ${hardSolved}`);

        updateProgress(easySolved, easyQuestions, 'Easy', progressItemEasy);
        updateProgress(mediumSolved, mediumQuestions, 'Medium', progressItemMedium);
        updateProgress(hardSolved, hardQuestions, 'Hard', progressItemHard);

        const cardsData = [
            {
                label: `Acceptance Rate`,
                value: acceptanceRate
            },
            {
                label: `Ranking`,
                value: ranking
            },
            {
                label: `Contribution Pts`,
                value: contributionPoints
            },
            {
                label: `Reputation`,
                value: reputation
            }
        ]

        console.log('Cards Data:', cardsData);

        cards.innerHTML = cardsData.map(
            data => {
                return `
            <div class="card">
                <h3>${data.label}</h3>
                <p>${data.value}</p>
            </div>`
            }).join('');
        console.log('Cards HTML:', cards.innerHTML);
    }

    searchButton.addEventListener('click', function () {
        statusMessage.textContent = '';
        const username = searchInput.value;
        console.log(`Fetching metrics for user: ${username}`);
        if (validateUsername(username)) {
            fetchMetrics(username);
        }
    });

    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            statusMessage.textContent = '';
            const username = searchInput.value;
            if (validateUsername(username)) {
                fetchMetrics(username);
            }
        }
    });


    function animateProgress(circle, duration) {
        let start = null;
        let animationFrame = null;
        let animationActive = true;


        circle.style.setProperty('--progress-degree', '0%');

        function step(timestamp) {
            if (!start) start = timestamp;
            if (!animationActive) return;

            let progress = (timestamp - start) / duration;


            let value;
            if (progress <= 0.5) {

                value = (progress * 2) * 100;
            } else if (progress <= 1) {

                value = (1 - (progress - 0.5) * 2) * 100;
            } else {

                value = 0;
                circle.style.setProperty('--progress-degree', '0%');
                animationActive = false;
                return;
            }

            circle.style.setProperty('--progress-degree', `${value}%`);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            } else {
                animationActive = false;
            }
        }

        animationFrame = requestAnimationFrame(step);

        return function stopAnimation() {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
            animationActive = false;
        };
    }
});