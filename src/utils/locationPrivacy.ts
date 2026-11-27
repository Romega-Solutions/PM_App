export type LocationCoordinates = {
  lat: number;
  lng: number;
};

// A 0.015° grid is about 1.67 km north-south everywhere. East-west it is
// about 1.61 km in Manila and 1.24-1.42 km across California, keeping the
// stored point within the product's intended 1-2 km privacy range.
export const LOCATION_PRIVACY_GRID_DEGREES = 0.015;

function snapToGrid(value: number, min: number, max: number): number {
  const snapped =
    Math.round(value / LOCATION_PRIVACY_GRID_DEGREES) *
    LOCATION_PRIVACY_GRID_DEGREES;
  const bounded = Math.min(max, Math.max(min, snapped));
  const stable = Number(bounded.toFixed(6));

  return Object.is(stable, -0) ? 0 : stable;
}

export function roundCoordinates(
  coordinates: LocationCoordinates,
): LocationCoordinates {
  return {
    lat: snapToGrid(coordinates.lat, -90, 90),
    lng: snapToGrid(coordinates.lng, -180, 180),
  };
}
