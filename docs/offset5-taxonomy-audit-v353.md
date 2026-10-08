# Offset 5 detail navigation and evidence audit — V353

V352 fixed the inspection taxonomy. The wider upstream-to-downstream audit still found empty geometry references at part/specific-part level: feeder 45, register 26, coater 23, dryer 16, delivery 51, plus platform/auxiliary entries. Printing units and transfers already had explicit component references.

V353 assigns entries without a distinct modeled mesh an explicit nearest-assembly anchor. Their geometryScope is ASSEMBLY_ANCHOR_ONLY, their parent anchor is recorded, and their description explains in Indonesian that focus/isolation operates on the assembly, not a verified physical shape of the named part. Confidence becomes REFERENCE_ONLY and verified remains false. This does not fabricate missing geometry or silently certify manual-defined device functions as installed shapes.

All detail references are checked against runtime nodes, including feeder, table, every PU, transfers, coater, dryer, inspection, delivery and auxiliary structures. Installed dimensions and simulation geometry are untouched. Direct component references remain intact.
