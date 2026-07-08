# Nav Data

Exports the site's `storage` (map feature) entities as files for freeflight
computers (XCTrack, SeeYou Navigator, XCSoar):

- `/api/navdata/airspace.txt` — OpenAir airspace built from **Polygon**
  geometries in `field_location`. Landings (`landing`) get class `W`
  (rendered green), everything else class `Q`, `AL SFC` / `AH 100ft AGL`.
- `/api/navdata/waypoints.cup` — SeeYou CUP waypoints built from **Point**
  geometries. Storage type maps to CUP style: landing → 21, takeoff → 20,
  obstacle → 8, poi → 19, unmapped → 0.

Both routes are anonymous and parameterless, so Tome exports them into the
static build automatically.

## Where to change things

- **Which entities are included** (per file): the `flight_data` view — the
  `airspace` display currently excludes `obstacle`, the `waypoints` display
  excludes `poi`. Edit the view's filters, no code needed.
- **Type → OpenAir class / CUP style mappings**: constants at the top of
  `src/Controller/NavdataController.php`.
- **The download links block**: block plugin `navdata_links`, rendered by the
  SDC component `navdata:navdata-links` (place it via Layout Builder).
