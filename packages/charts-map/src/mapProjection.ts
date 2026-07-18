import { geoAlbersUsa, geoNaturalEarth1, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export type MapProjectionName = "naturalEarth" | "albersUsa";

export function createMapProjection(
  name: MapProjectionName,
  width: number,
  height: number,
  features: Feature<Geometry>[],
): GeoProjection {
  const projection =
    name === "albersUsa"
      ? geoAlbersUsa()
      : geoNaturalEarth1().fitExtent(
          [
            [8, 8],
            [width - 8, height - 8],
          ],
          {
            type: "FeatureCollection",
            features,
          } satisfies FeatureCollection,
        );

  if (name === "albersUsa") {
    projection.fitExtent(
      [
        [8, 8],
        [width - 8, height - 8],
      ],
      {
        type: "FeatureCollection",
        features,
      } satisfies FeatureCollection,
    );
  }

  return projection;
}

export function createPathGenerator(projection: GeoProjection) {
  return geoPath(projection);
}
