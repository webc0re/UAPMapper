var map, myIcon, data;

$(document).ready(function () {

    $('.select2').select2({
        dropdownAutoWidth: true,
        width: 'auto'
    });

    $.getJSON("udb.json", function (response) {

        data = response;

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

        years.forEach(year => {
            var newOption = new Option(year, year);
            $('#yearSelect').append(newOption);
        });

        let countries = [...new Set(data.Hatch_UDB_Timeline.map(item => item.key_vals.Country))];
        countries = countries.sort();

        countries.forEach(country => {
            var newOption = new Option(country, country);
            $('#countrySelect').append(newOption);
        });

    });

    $('.custom-select').on('change', function (event) {
        loadPoints();
    });
})

function loadPoints() {

    showLoading();

    let year = $('#yearSelect').val();
    let country = $('#countrySelect').val();

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
