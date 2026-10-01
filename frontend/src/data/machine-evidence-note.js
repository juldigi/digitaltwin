export function machineEvidenceNote({dedicated=false,simulationAvailable=false,photoCount=0,sourceCount=0}={}){
 const photos=Math.max(0,Number(photoCount)||0),sources=Math.max(0,Number(sourceCount)||0);
 const sourceText=sources?sources+' sumber teknis yang tercatat':'sumber teknis yang tersedia';
 if(photos>0)return `Model 3D menggunakan ${photos} foto aktual dan ${sourceText}. Detail yang belum didukung sumber tetap diperlakukan sebagai referensi.`;
 if(dedicated)return `Model 3D khusus menggunakan ${sourceText}. Foto aktual tidak diklaim tersedia pada konteks ini; detail tanpa bukti eksplisit tetap diperlakukan sebagai referensi.`;
 if(simulationAvailable)return `Model 3D acuan menggunakan identitas mesin BMJ dan ${sourceText} dari keluarga/OEM. Bentuk ini bukan klaim geometri serial-spesifik; simulasi hanya menggambarkan proses yang didukung sumber.`;
 return `Model 3D acuan menggunakan identitas mesin BMJ dan ${sourceText}. Simulasi belum diaktifkan karena bukti proses belum cukup, sehingga detail serial-spesifik tidak diasumsikan.`;
}
