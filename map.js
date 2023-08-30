var map, myIcon;

document.addEventListener('DOMContentLoaded', () => {
    fetch('udb.json')
        .then(response => response.json())
        .then(data => {

            hideLoading();

            map = L.map('map').setView([51.505, -0.09], 2);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            var customIcon = L.Icon.extend({
                options: {
                    iconUrl: 'pin-green_2.png', 
                    iconSize: [65, 65], 
                    iconAnchor: [22, 94], 
                    popupAnchor: [-3, -76] 
                }
            });

            myIcon = new customIcon();

            let years = [...new Set(data.Hatch_UDB_Timeline.map(item => item.date.split('/')[2]))];
            years = years.reverse();

            const yearSelect = document.getElementById('yearSelect');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                yearSelect.appendChild(option);
            });

            $('#yearSelect').on('change', function (event) {
                let selectedCountry = document.getElementById('countrySelect').value;
                loadPoints(data, event.target.value, selectedCountry);
            });


            let countries = [...new Set(data.Hatch_UDB_Timeline.map(item => item.key_vals.Country))];
            countries = countries.sort();

            const countrySelect = document.getElementById('countrySelect');
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.text = country;
                countrySelect.appendChild(option);
            });

            $('#countrySelect').on('change', function (event) {
                selectedYear = document.getElementById('yearSelect').value;
                loadPoints(data, selectedYear, event.target.value);
            });

        })
        .catch(error => console.error('Error loading JSON file:', error));


});

function loadPoints(data, year, country) {
    showLoading();

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    data.Hatch_UDB_Timeline
        .filter(point => {
            const [lat, lon] = point.key_vals.LatLong.split(' ').map(parseFloat);
            if (isNaN(lat) || isNaN(lon)) {
                return false;
            }

            if (year !== '') {
                let check = point.date.split('/')[2] === year;
                if (!check) {
                    return false;
                }
            }

            if (country !== '') {
                let check = point.key_vals.Country === country;
                if (!check) {
                    return false;
                }
            }

            return true;

        })
        .forEach(point => {
            const [lat, lon] = point.key_vals.LatLong.split(' ').map(parseFloat);

            const marker = L.marker([lat, lon], { icon: myIcon }).addTo(map);
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

        });
    hideLoading();

}

function showLoading() {
    $('.loading-overlay').addClass('show');
}

function hideLoading() {
    $('.loading-overlay').removeClass('show');
}


$(document).ready(function () {
    $('.select2').select2({
        dropdownAutoWidth: true,
        width: 'auto'
    });
})