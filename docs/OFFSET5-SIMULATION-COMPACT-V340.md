# V340 — restore simulation interior and compact mobile controls

The user rejected V339: simulation must reveal the process interior, and the enlarged transverse guards changed the upper PU appearance. IMG_3009 shows a portrait transport card occupying three large rows over the machine.

- Remove the Offset 5 exception that kept simulation in exterior mode. Starting simulation opens interior and enables ink-flow visualization. Stopping restores exterior only when simulation opened it; manually opened interior remains open.
- Revert V339 stacked face grilles and raised edge bar to the pre-V339 PU geometry. Preserve V404/V408 open upper service deck, external green duct roller, custom dimensions, receiving throat and supported downstream junction cabinets.
- Mobile transport uses a 28px context row and 44px control row, 6px gap and 8px padding: about 96px plus borders. Mode, speed, play and stop share the second row. Selects retain accessible names; touch controls remain 44px. The exterior/interior toggle stays available in the context row. Desktop layout is preserved.

V338/V339 statements that simulation should preserve a closed exterior are superseded by the user's explicit correction. Geometry/visibility tests are software checks; they do not establish a serial-specific visual match. The browser environment lacks WebGL and cannot certify Safari 3D rendering.
