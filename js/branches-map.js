/* Branches map: Leaflet map linked to the branch list. Needs Leaflet loaded first. */
(function () {
    const mapEl = document.getElementById('branchMap');
    if (!mapEl || typeof L === 'undefined') return;

    const branches = [
        { id: 'kawangware', name: 'Kawangware',   coords: [-1.2755, 36.7552], zoom: 14, desc: 'Main market area, opposite the stage.' },
        { id: 'utawala',    name: 'Utawala',      coords: [-1.2935, 36.9558], zoom: 14, desc: 'Off the Eastern Bypass, near the shopping centre.' },
        { id: 'thika',      name: 'Thika',        coords: [-1.0333, 37.0667], zoom: 13, desc: 'Town centre, along Kenyatta Highway.' },
        { id: 'nairobi',    name: 'Nairobi (HQ)', coords: [-1.2921, 36.8219], zoom: 14, desc: 'Head office, central business district.' }
    ];

    const map = L.map(mapEl, {
        center: [-1.18, 36.9],
        zoom: 9,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
        minZoom: 7,
        maxZoom: 18
    });

    // Free, keyless OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    function makeIcon(active) {
        return L.divIcon({
            className: '',
            html: '<span class="branch-pin' + (active ? ' active' : '') + '"></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            popupAnchor: [0, -12]
        });
    }

    const markers = {};
    const items = Array.from(document.querySelectorAll('.branch-item'));

    branches.forEach((b) => {
        const marker = L.marker(b.coords, { icon: makeIcon(false), title: b.name }).addTo(map);
        marker.bindPopup(
            '<strong>' + b.name + '</strong>' +
            '<br><span style="color:#5a5f7d;font-size:12.5px;line-height:1.4;display:inline-block;margin-top:2px">' +
            b.desc +
            '</span>'
        );
        markers[b.id] = marker;
    });

    let currentId = null;

    function activate(id, { fly = true } = {}) {
        if (!markers[id]) return;
        currentId = id;

        items.forEach((el) => {
            const on = el.dataset.branch === id;
            el.classList.toggle('active', on);
            el.setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        Object.keys(markers).forEach((k) => {
            markers[k].setIcon(makeIcon(k === id));
        });

        const b = branches.find((x) => x.id === id);
        if (fly) {
            map.flyTo(b.coords, b.zoom, { duration: 1.1, easeLinearity: 0.25 });
            window.setTimeout(() => markers[id].openPopup(), 700);
        }
    }

    items.forEach((el) => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.branch-link')) return;
            activate(el.dataset.branch);
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate(el.dataset.branch);
            }
        });
    });

    Object.keys(markers).forEach((id) => {
        markers[id].on('click', () => {
            currentId = id;
            items.forEach((el) => {
                const on = el.dataset.branch === id;
                el.classList.toggle('active', on);
                el.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            Object.keys(markers).forEach((k) => markers[k].setIcon(makeIcon(k === id)));
        });
    });

    const isDesktop = window.matchMedia('(min-width: 901px)').matches;
    if (isDesktop && items.length) {
        window.setTimeout(() => activate(items[0].dataset.branch), 500);
    }

    window.addEventListener('load', () => setTimeout(() => map.invalidateSize(), 250));
    if ('ResizeObserver' in window) {
        new ResizeObserver(() => map.invalidateSize()).observe(mapEl);
    }
})();
