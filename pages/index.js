import { Wrapper } from "@googlemaps/react-wrapper";
import { useRef, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export default function App() {
  return (
    <Wrapper
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      version="beta"
      libraries={["marker"]}
    >
      <MyMap />
    </Wrapper>
  );
}

const mapOptions = {
  mapId: process.env.NEXT_PUBLIC_MAP_ID,
  center: { lat: 32.79413, lng: 34.98828 },
  zoom: 12,
  //disableDefaultUI: true,
};

function MyMap() {
  const [map, setMap] = useState();
  const ref = useRef();

  useEffect(() => {
    setMap(new window.google.maps.Map(ref.current, mapOptions));
  }, []);

  return (
    <>
      <div ref={ref} id="map" />
      {map && <Weather map={map} />}
    </>
  );
}

const weatherData = {
  A: {
    name: "Bar",
    position: { lat: 32.805513, lng: 35.003651 },
    climate: "Raining",
    temp: 20,
    fiveDay: [15, 10, 12, 22, 20],
  },
  B: {
    name: "Liran",
    position: { lat: 32.788655, lng: 34.969891 },
    climate: "Cloudy",
    temp: 20,
    fiveDay: [15, 18, 12, 22, 20],
  },
  C: {
    name: "Hope",
    position: { lat: 32.781336, lng: 35.005757 },
    climate: "Sunny",
    temp: 20,
    fiveDay: [15, 18, 12, 22, 20],
  },
};

function Weather({ map }) {
  const [data, setData] = useState(weatherData);
  const [highlight, setHighlight] = useState();
  const [editing, setEditing] = useState();

  return (
    <>
      {editing && (
        <Editing
          weather={data[editing]}
          update={(newWeather) => {
            setData((existing) => {
              return { ...existing, [editing]: { ...newWeather } };
            });
          }}
          close={() => setEditing(null)}
        />
      )}
      {Object.entries(data).map(([key, weather]) => (
        <Marker
          key={key}
          map={map}
          position={weather.position}
          onClick={() => setEditing(key)}
        >
          <div
            className={`marker ${weather.climate.toLowerCase()} ${
              highlight === key || editing === key ? "highlight" : ""
            }`}
            onMouseEnter={() => setHighlight(key)}
            onMouseLeave={() => setHighlight(null)}
          >
            <h2>{weather.climate}</h2>
            <div>{weather.temp}c</div>
            {highlight === key || editing === key ? (
              <div className="five-day">
                <p>Next 5 Days:</p>
                <p>{weather.fiveDay.join(", ")}</p>
              </div>
            ) : null}
          </div>
        </Marker>
      ))}
    </>
  );
}

function Marker({ map, children, position, onClick }) {
  const markerRef = useRef();
  const rootRef = useRef();
  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div");
      rootRef.current = createRoot(container);

      markerRef.current = new google.maps.marker.AdvancedMarkerView({
        position,
        content: container,
      });
    }
  }, [position]);

  useEffect(() => {
    rootRef.current.render(children);
    markerRef.current.position = position;
    markerRef.current.map = map;
    const listener = markerRef.current.addListener("click", onClick);
    return () => listener.remove();
  }, [map, position, children, onClick]);
}

function Editing({ weather, update, close }) {
  return (
    <div className="editing">
      <h2>Editing {weather.name}</h2>

      <label htmlFor="climate">Climate</label>
      <select
        id="climate"
        value={weather.climate}
        onChange={(e) => update({ ...weather, climate: e.target.value })}
      >
        {["Sunny", "Cloudy", "Raining"].map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>

      <label htmlFor="temp">Temperture</label>
      <input
        id="temp"
        type="number"
        value={weather.temp}
        onChange={(e) => update({ ...weather, temp: e.target.value })}
      />

      <button type="button" onClick={() => close()}>
        Close
      </button>
    </div>
  );
}
