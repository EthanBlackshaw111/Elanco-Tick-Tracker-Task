
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { API_URL, cityCoordinates } from './Cities';
import './App.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
);

function App() {
    const [sightings, setSightings] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [selectedSighting, setSelectedSighting] = useState(null);
    const [showTickGuide, setShowTickGuide] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const response = await fetch(API_URL);
                const data = await response.json();
                setSightings(data);
            }
            catch {
                setError(true);
            }

            setLoading(false);
        }

        loadData();
    }, []);

    let filteredSightings = sightings.filter((sighting) => {
        return (
            (sighting.location || '').toLowerCase().includes(search.toLowerCase()) ||
            (sighting.species || '').toLowerCase().includes(search.toLowerCase())
        );
    });

    let cities = [];

    filteredSightings.forEach((sighting) => {
        if (
            sighting.location &&
            cityCoordinates[sighting.location] &&
            !cities.includes(sighting.location)
        ) {
            cities.push(sighting.location);
        }
    });


    function handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const date = formData.get('date');
        const time = formData.get('time');
        const location = formData.get('location').trim();
        const species = formData.get('species').trim();

        // Check for missing information
        if (!date || !time || !location || !species) {
            setMessage('Please complete all fields.');
            setMessageType('error');
            return;
        }

        // Check that the date is not in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (new Date(date + 'T00:00:00') > today) {
            setMessage('The sighting date cannot be in the future.');
            setMessageType('error');
            return;
        }

        // Add the sighting temporarily
        const newSighting = {
            id: Date.now(),
            date: date,
            time: time,
            location: location,
            species: species,
            latinName: 'Not provided'
        };

        setSightings([...sightings, newSighting]);
        setSearch('');
        setMessage('Sighting submitted successfully!');
        setMessageType('success');

        event.target.reset();
    }


    const areaSightings = selectedSighting
        ? sightings.filter(
            (sighting) =>
                sighting.location === selectedSighting.location
        )
        : [];

    const timelineData = areaSightings.reduce((groups, sighting) => {
        const year = new Date(sighting.date).getFullYear();

        const existing = groups.find(
            (item) => item.date === year
        );

        if (existing) {
            existing.count++;
        } else {
            groups.push({
                date: year,
                count: 1
            });
        }

        return groups;
    }, []).sort((a, b) => new Date(a.date) - new Date(b.date));


    return (
        <div>
            <header className="header">
                <h1>Tick Tracker</h1>
                <h3>By Ethan Blackshaw</h3>
            </header>




            <main className="main">
                <button onClick={() => setShowTickGuide(true)}>
                    Tick Guide & Prevention
                </button>

                <h2>Tick sightings</h2>

                {loading && <p>Loading sightings...</p>}

                {error && <p>Could not load sightings.</p>}

                {!loading && !error && (
                    <>
                        <h3>Sightings map</h3>

                        <MapContainer
                            center={[54.5, -3]}
                            zoom={5}
                            className="sightings-map"
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {cities.map((city) => (
                                <CircleMarker
                                    key={city}
                                    center={cityCoordinates[city]}
                                    radius={10}
                                    eventHandlers={{
                                        click: () => {
                                            const sighting = filteredSightings.find(
                                                (sighting) => sighting.location === city
                                            );

                                            if (sighting) {
                                                setSelectedSighting(sighting);
                                            }
                                        }
                                    }}
                                >
                                    <Popup>
                                        <strong>{city}</strong>
                                        <p>
                                            {filteredSightings.filter(
                                                (sighting) => sighting.location === city
                                            ).length} sightings
                                        </p>
                                        <button
                                            onClick={() => {
                                                const sighting = filteredSightings
                                                    .filter((sighting) => sighting.location === city)
                                                    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                                                if (sighting) {
                                                    setSelectedSighting(sighting);
                                                }
                                            }}
                                        >
                                            View details
                                        </button>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>

                        <h3>All sightings</h3>

                        <input
                            type="text"
                            placeholder="Search location or species..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />

                        <p>{filteredSightings.length} sightings found</p>


                        <h3>Report a Sighting</h3>

                        <form className="report-form" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label htmlFor="date">Date:</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    max={today}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="time">Time:</label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    required
                                />
                            </div>

                            <div>
                                <select id="location" name="location" required>
                                    <option value="">Select a city</option>
                                    {Object.keys(cityCoordinates).map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select id="species" name="species" required>
                                    <option value="">Select a tick species</option>
                                    <option value="Marsh Tick">Marsh Tick</option>
                                    <option value="Southern Rodent Tick">Southern Rodent Tick</option>
                                    <option value="Passerine Tick">Passerine Tick</option>
                                    <option value="Tree-hole Tick">Tree-Hole Tick</option>
                                    <option value="Fox/Badger Tick">Fox/Badger Tick</option>
                                    <option value="Unknown">Unknown</option>
                                </select>
                            </div>

                            <button type="submit">Submit Sighting</button>
                        </form>

                        {message && (
                            <p className={messageType}>
                                {message}
                            </p>
                        )}

                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Location</th>
                                        <th>Species</th>
                                        <th>Scientific name</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredSightings.map((sighting) => (
                                        <tr key={sighting.id}>
                                            <td>{sighting.date}</td>
                                            <td>{sighting.location}</td>
                                            <td>{sighting.species}</td>
                                            <td>{sighting.latinName}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSighting(sighting)}
                                                >
                                                    View details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}



            </main>
            {selectedSighting && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedSighting(null)}
                >
                    <div
                        className="modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className="modal-close"
                            onClick={() => setSelectedSighting(null)}
                            aria-label="Close details"
                        >
                            &times;
                        </button>

                        <h2>Sighting Details</h2>

                        <p>
                            <strong>Date:</strong> {selectedSighting.date}
                        </p>

                        <p>
                            <strong>Time:</strong> {selectedSighting.time || 'Not provided'}
                        </p>

                        <p>
                            <strong>Location:</strong> {selectedSighting.location}
                        </p>

                        <p>
                            <strong>Species:</strong> {selectedSighting.species}
                        </p>

                        <p>
                            <strong>Scientific name:</strong>{' '}
                            {selectedSighting.latinName || 'Not provided'}
                        </p>

                        <h3>Sighting Activity Over Time</h3>

                        <Line
                            data={{
                                labels: timelineData.map((item) => item.date),
                                datasets: [{
                                    label: 'Tick sightings',
                                    data: timelineData.map((item) => item.count),
                                    borderColor: '#3b82f6',
                                    tension: 0.3
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { precision: 0 }
                                    }
                                }
                            }}
                        />

                        <button onClick={() => setSelectedSighting(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showTickGuide && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowTickGuide(false)}
                >
                    <div className="modal" onClick={(event) => event.stopPropagation()}>
                        <button onClick={() => setShowTickGuide(false)}>
                            Close
                        </button>

                        <h3>Marsh Tick</h3>
                        <p>
                            Scientific name: Ixodes apronophorus.
                            Found in wetland habitats and associated with water voles.
                        </p>

                        <h3>Southern Rodent Tick</h3>
                        <p>
                            Scientific name: Ixodes acuminatus.
                            Lives in the burrows of small rodents, mainly in southern England.
                        </p>

                        <h3>Passerine Tick</h3>
                        <p>
                            Scientific name: Ixodes frontalis.
                            A bird-parasitising tick commonly associated with songbirds.
                            It can occasionally feed on humans.
                        </p>

                        <h3>Tree-hole Tick</h3>
                        <p>
                            Scientific name: Ixodes arboricola.
                            Associated with birds that nest in tree holes, including
                            great tits and blue tits.
                        </p>

                        <h3>Fox/Badger Tick</h3>
                        <p>
                            Scientific name: Ixodes canisuga.
                            Found throughout the UK and commonly associated with
                            foxes, badgers and domestic dogs.
                        </p>

                        <h2>Prevention Tips</h2>

                        <ul>
                            <li>Wear long trousers and cover exposed skin when outdoors.</li>
                            <li>Use an appropriate insect repellent according to its label.</li>
                            <li>Check your skin and clothing for ticks after being outdoors.</li>
                            <li>Remove attached ticks promptly using a suitable tick remover.</li>
                            <li>Keep to paths where possible and avoid brushing against vegetation.</li>
                        </ul>
                    </div>
                </div>
            )}

            <footer className="footer">
                Tick Tracker
            </footer>
        </div>
    );
}

export default App;
