import type { WeatherResponse } from '../../lib/schemas/api';

export default function WeatherWidget({ data, error }: { data: WeatherResponse | null; error?: string | null }) {
  if (error) return <p>{error}</p>;
  if (!data) return <p>No weather data.</p>;
  const f = data.forecast;
  return (
    <div className="text-sm space-y-1">
      <p>Condition: {f.condition}</p>
      <p>Temp: {f.temp_c}&deg;C</p>
      <p>Wind: {f.wind_kph} kph</p>
      <p>Rain chance: {f.rain_chance}%</p>
    </div>
  );
}
