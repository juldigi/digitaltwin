import test from 'node:test';
import assert from 'node:assert/strict';
import {readableStatus} from '../frontend/src/display-language.js';

test('data uncertainty has plain Indonesian labels without overstating verification',()=>{
 assert.equal(readableStatus('UNKNOWN'),'Belum diketahui');
 assert.equal(readableStatus('UNVERIFIED'),'Belum diverifikasi');
 assert.equal(readableStatus('PARTIAL / APPROXIMATE'),'Sebagian detail masih berupa perkiraan');
 assert.equal(readableStatus('IDENTITY VERIFIED / ACTUAL PHOTO GEOMETRY / CUTTER INTERNAL UNRESOLVED'),'Identitas dan bentuk luar mengacu pada foto aktual; bagian dalam pemotong belum terverifikasi');
 assert.equal(readableStatus('NOT_IMPLEMENTED · LAYOUT PLACEHOLDER'),'Belum tersedia · Penanda posisi pada denah');
});

test('technical identifiers and ordinary text remain intact',()=>{
 assert.equal(readableStatus('Heidelberg CX 104'),'Heidelberg CX 104');
 assert.equal(readableStatus('BMJ-MCH-0010'),'BMJ-MCH-0010');
 assert.equal(readableStatus(null),'Belum tersedia');
});
