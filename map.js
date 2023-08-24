
document.addEventListener('DOMContentLoaded', () => {
    fetch('udb.json')
        .then(response => response.json())
        .then(data => {
            const map = L.map('map').setView([51.505, -0.09], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            const years = [...new Set(data.Hatch_UDB_Timeline.map(item => item.date.split('/')[2]))];
            const select = document.getElementById('yearSelect');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                select.appendChild(option);
            });

            select.addEventListener('change', (event) => {
                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                data.Hatch_UDB_Timeline
                    .filter(point => point.date.split('/')[2] === event.target.value)
                    .forEach(point => {
                        const [lat, lon] = point.key_vals.LatLong.split(' ').map(parseFloat);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            const marker = L.marker([lat, lon]).addTo(map);
                            marker.bindPopup(`
                                 
                                <b>Date:</b> ${point.date}<br>
                                <b>Country:</b> ${point.key_vals.Country}<br>
                                <b>State/Province:</b> ${point.key_vals["State/Prov"]}<br>
                                <b>Location:</b> ${point.location}<br>
                                <b>Locale:</b> ${point.key_vals.Locale}<br>
                                <b>Description:</b> ${point.desc}<br>
                                <b>Description:</b> ${point.key_vals.HatchDesc}<br>
                                <b>Credibility:</b> ${point.key_vals.Credibility}<br>
                                <b>Duration:</b> ${point.key_vals.Duration}<br>
                                <b>Strangeness:</b> ${point.key_vals.Strangeness}<br>
                                <b>Type:</b> ${point.type}
                            `);
                        }
                    });
            });
        })
        .catch(error => console.error('Error loading JSON file:', error));
});
