import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FactoryEngine} from '../frontend/src/engine.js';

const source=readFileSync(new URL('../frontend/src/engine.js',import.meta.url),'utf8');

test('V309 detached proxy materials are disposed only after no live factory object references them',()=>{
 let sharedDisposals=0,orphanDisposals=0,sharedMap=0,orphanMap=0;
 const shared={map:{dispose(){sharedMap++}},dispose(){sharedDisposals++}},orphan={map:{dispose(){orphanMap++}},dispose(){orphanDisposals++}};
 const root={traverse(fn){fn({material:shared});fn({material:[shared]});}};
 const context={actualFactory:{root}};
 const disposed=FactoryEngine.prototype.disposeDetachedFactoryMaterials.call(context,new Set([shared,orphan]),root);
 assert.equal(disposed,1);
 assert.equal(sharedDisposals,0);assert.equal(sharedMap,0);
 assert.equal(orphanDisposals,1);assert.equal(orphanMap,1);
});

test('V309 proxy replacement frees unique geometry immediately but defers shared material disposal',()=>{
 const start=source.indexOf('async hydrateFactoryDetailedMachines');
 const end=source.indexOf('registerSceneObjects()',start);
 const hydration=source.slice(start,end);
 assert.match(hydration,/object\.geometry\?\.dispose\?\.\(\);const list=Array\.isArray\(object\.material\)\?object\.material:\[object\.material\];for\(const material of list\)if\(material\)detachedMaterials\.add\(material\)/);
 assert.doesNotMatch(hydration,/object\.material\?\.dispose/);
 assert.match(hydration,/factoryDetachedMaterialDisposeCount=this\.disposeDetachedFactoryMaterials\(detachedMaterials,actual\.root\)/);
});

test('V309 keeps the already-merged selected-machine hydration synchronization intact',()=>{
 assert.match(source,/refreshFactorySelectionAfterHydration\(id,wrapper\)/);
 assert.match(source,/wrapper\.updateWorldMatrix\?\.\(true,true\);this\.factorySelectionHelper\.update\?\.\(\)/);
 assert.match(source,/if\(this\.view==='factory'&&this\.transition&&this\.isObjectVisible\(wrapper\)\)this\.fit\(wrapper,'operator'\)/);
});
