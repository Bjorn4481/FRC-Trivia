export let top100 = [];

export const loadTop100 = new Promise((resolve, reject) => {
    fetch('./data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvText => {
            const results = Papa.parse(csvText, { header: true });
            top100 = results.data.slice(0, 100);
            resolve(top100);
        })
        .catch(error => {
            console.error('Error fetching or parsing CSV data:', error);
            reject(error);
        });
});
