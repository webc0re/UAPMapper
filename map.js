
document.addEventListener('DOMContentLoaded', () => {
    // JSON-Daten abrufen
    fetch('udb.json')
        .then(response => response.json())
        .then(data => {
            // Karte erstellen
            const map = L.map('map').setView([51.505, -0.09], 2); // Koordinaten und Zoom-Level anpassen

            // OpenStreetMap Kacheln hinzufügen
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Dropdown-Menü mit Jahren füllen
            const years = [...new Set(data.Hatch_UDB_Timeline.map(item => item.date.split('/')[2]))];
            const select = document.getElementById('yearSelect');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                select.appendChild(option);
            });

            // Event-Listener für das Dropdown-Menü hinzufügen
            select.addEventListener('change', (event) => {
                // Alle Marker von der Karte entfernen
                map.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // Marker für das ausgewählte Jahr hinzufügen
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
                                <b>Location:</b> <a href="${point.key_vals.LocationLink}" target="_blank">Google Maps</a><br>

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
        .catch(error => console.error('Fehler beim Laden der JSON-Daten:', error));
});
