# Superadmin scene editor

Configure a distinct `SUPERADMIN_TOKEN` secret on the Cloudflare Worker. Its bearer token grants existing administrator operations and the scene editor; the ordinary admin token cannot write scene overrides. Connect using the Superadmin token, then open **Pengaturan → Editor Scene 3D**.

The editor stores object transforms and visibility in the existing D1 `twin_state` row. It requires no additional migration. Every save preserves the preceding override map as a revision, up to ten revisions. The scene endpoint checks `If-Match` against the state revision. The editor has numeric transform inputs, a Three.js gizmo, object search, hide/restore, floor grounding, undo/redo for the current editing session, and server revision restore. Closing without saving discards the draft.

Object IDs under `node:` are structural paths in the generated scene. After a code update changes the scene hierarchy, paths can point to different objects; inspect and clear affected overrides before publishing such a change. `asset:` IDs are tied to machine IDs and are more stable. Hidden objects remain in source geometry and can be restored. Mesh changes that alter process components may affect simulations, so verify the affected machine after saving.

Current scope is transforms and visibility on rendered factory nodes. It does not yet implement creation of geometry, wall endpoint editing, duplicate, alignment, collision warnings, or editing a standalone machine inspection model. Superadmin access is enforced on the Worker, not only by hiding the menu.
