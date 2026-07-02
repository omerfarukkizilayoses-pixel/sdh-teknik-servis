import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wrench, CheckCircle, Calendar, PlusCircle, Search, MessageSquare, ShieldAlert } from 'lucide-react';

function App() {
  // LocalStorage Entegrasyonu
  const [servisVerisi, setServisVerisi] = useState(() => {
    const lokalData = localStorage.getItem('sdh_servis_kayitlari');
    return lokalData ? JSON.parse(lokalData) : {};
  });

  // Ekran Genişliği Takibi (Responsive Yapı İçin)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Form State'leri
  const [activeTab, setActiveTab] = useState('ekle');
  const [servisAdi, setServisAdi] = useState('');
  const [cihazModel, setCihazModel] = useState('');
  const [telefon, setTelefon] = useState('');
  const [cihazSeriNo, setCihazSeriNo] = useState('');
  const [yapilanIslem, setYapilanIslem] = useState('');
  const [degisenParcalar, setDegisenParcalar] = useState('');
  const [sonUretilenQR, setSonUretilenQR] = useState(null);
  const [sorguSeriNo, setSorguSeriNo] = useState('');
  const [sorguSonucu, setSorguSonucu] = useState(null);

  // URL'den Otomatik Karekod Sorgulama Algılayıcı (Telefon Kamerası İçin)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlSeriNo = queryParams.get('serino');
    if (urlSeriNo) {
      const temizUrlSeriNo = urlSeriNo.toUpperCase().trim();
      setActiveTab('sorgula');
      setSorguSeriNo(temizUrlSeriNo);
      
      const lokalData = localStorage.getItem('sdh_servis_kayitlari');
      if (lokalData) {
        const data = JSON.parse(lokalData);
        if (data[temizUrlSeriNo]) {
          setSorguSonucu(data[temizUrlSeriNo]);
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sdh_servis_kayitlari', JSON.stringify(servisVerisi));
  }, [servisVerisi]);

  // Sayaçlar
  const toplamCihaz = Object.keys(servisVerisi).length;
  const parcaDegisenSayisi = Object.values(servisVerisi).reduce((acc, cihaz) => {
    const hasParca = cihaz.islemler.some(i => i.parcalar && i.parcalar.length > 0);
    return hasParca ? acc + 1 : acc;
  }, 0);

  const handleKaydet = (e) => {
    e.preventDefault();
    if (!cihazSeriNo || !servisAdi) {
      alert("Lütfen İlgili Birim ve Seri No alanlarını doldurun!");
      return;
    }

    const temizSeriNo = cihazSeriNo.toUpperCase().trim();
    const parcaListesi = degisenParcalar.split('\n').map(p => p.trim()).filter(p => p !== '');

    const yeniIslem = {
      tarih: new Date().toLocaleDateString('tr-TR'),
      islem: yapilanIslem,
      parcalar: parcaListesi
    };

    setServisVerisi(prev => {
      const guncel = { ...prev };
      if (guncel[temizSeriNo]) {
        guncel[temizSeriNo].islemler = [yeniIslem, ...guncel[temizSeriNo].islemler];
        guncel[temizSeriNo].servis_adi = servisAdi;
        guncel[temizSeriNo].telefon = telefon;
        guncel[temizSeriNo].cihaz_model = cihazModel;
      } else {
        guncel[temizSeriNo] = {
          servis_adi: servisAdi,
          telefon: telefon,
          cihaz_model: cihazModel,
          islemler: [yeniIslem]
        };
      }
      return guncel;
    });

    // KAREKOD ARTIK DİREKT LİNKE GÖNDERECEK
    const qrIcerik = `https://omerfarukkizilayoses-pixel.github.io/sdh-teknik-servis/?serino=${temizSeriNo}`;
    setSonUretilenQR(qrIcerik);
    alert(`${temizSeriNo} başarıyla kaydedildi!`);
  };

  const handleSorgula = (val) => {
    const aranan = val.toUpperCase().trim();
    setSorguSeriNo(aranan);
    if (servisVerisi[aranan]) {
      setSorguSonucu(servisVerisi[aranan]);
    } else {
      setSorguSonucu(null);
    }
  };

  // --- DİNAMİK RESPONSIVE SAF CSS STİLLERİ ---
  const styles = {
    container: { padding: isMobile ? '10px' : '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh', boxSizing: 'border-box' },
    headerBox: { background: 'linear-gradient(135deg, #0052D4, #4364F7)', padding: isMobile ? '15px' : '30px', borderRadius: '16px', color: 'white', textAlign: 'center', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' },
    h1: { margin: 0, fontSize: isMobile ? '20px' : '32px', fontWeight: '800', letterSpacing: '0.5px' },
    pSub: { margin: '6px 0 0 0', fontSize: isMobile ? '11px' : '14px', tracking: '2px', opacity: 0.85, fontWeight: '300' },
    statsGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' },
    card: (bg) => ({ background: bg, padding: '20px', borderRadius: '14px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }),
    tabContainer: { backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #e2e8f0' },
    tabHeader: { display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexDirection: isMobile ? 'column' : 'row' },
    tabButton: (active) => ({ flex: 1, padding: isMobile ? '12px' : '16px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '13px', backgroundColor: active ? 'white' : 'transparent', color: active ? '#4364F7' : '#64748b', borderTop: !isMobile && active ? '4px solid #4364F7' : '4px solid transparent', borderLeft: isMobile && active ? '4px solid #4364F7' : '4px solid transparent', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.15s' }),
    formGrid: { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' },
    label: { fontSize: '11px', fontWeight: '700', color: '#475569', letterSpacing: '0.5px' },
    input: { padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'border 0.2s', backgroundColor: '#fff', boxSizing: 'border-box', width: '100%' },
    button: { width: '100%', backgroundColor: '#4364F7', color: 'white', fontWeight: '700', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px', boxShadow: '0 4px 12px rgba(67, 100, 247, 0.2)' },
    qrBox: { marginTop: '25px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '20px', justifyContent: 'center' },
    wpButton: { backgroundColor: '#10b981', color: 'white', textDecoration: 'none', padding: '11px 18px', borderRadius: '8px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '13px' },
    infoBox: { backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '15px', borderRadius: '0 10px 10px 0', marginBottom: '20px' },
    historyCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '15px', borderRadius: '12px', marginBottom: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }
  };

  return (
    <div style={styles.container}>
      {/* BAŞLIK PANELİ */}
      <div style={styles.headerBox}>
        <h1 style={styles.h1}>🏥 SORGUN DEVLET HASTANESİ</h1>
        <p style={styles.pSub}>BİLGİSAYAR TEKNİK BAKIM ONARIM WEB SİSTEMİ</p>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div style={styles.statsGrid}>
        <div style={styles.card('linear-gradient(135deg, #1e293b, #0f172a)')}>
          <div><h3 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{toplamCihaz}</h3><p style={{ margin: 0, fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Sistemde Kayıtlı Cihaz</p></div>
          <Wrench style={{ opacity: 0.25, width: '32px', height: '32px' }} />
        </div>
        <div style={styles.card('linear-gradient(135deg, #059669, #10b981)')}>
          <div><h3 style={{ margin: 0, fontSize: '26px', fontWeight: '800' }}>{parcaDegisenSayisi}</h3><p style={{ margin: 0, fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Parça Değişimi Yapılanlar</p></div>
          <CheckCircle style={{ opacity: 0.25, width: '32px', height: '32px' }} />
        </div>
        <div style={styles.card('linear-gradient(135deg, #3b82f6, #1d4ed8)')}>
          <div><h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{isMobile ? 'MOBİL MOD' : 'MASAÜSTÜ MOD'}</h3><p style={{ margin: 0, fontSize: '12px', opacity: 0.75, marginTop: '2px' }}>Cihaz Hafızası Aktif</p></div>
          <Calendar style={{ opacity: 0.25, width: '32px', height: '32px' }} />
        </div>
      </div>

      {/* ANA SEKMELİ PANEL */}
      <div style={styles.tabContainer}>
        <div style={styles.tabHeader}>
          <button onClick={() => setActiveTab('ekle')} style={styles.tabButton(activeTab === 'ekle')}>
            <PlusCircle size={16} /> YENİ TEKNİK RAPOR EKLE
          </button>
          <button onClick={() => setActiveTab('sorgula')} style={styles.tabButton(activeTab === 'sorgula')}>
            <Search size={16} /> KAREKOD / SERİ NO SORGULA
          </button>
        </div>

        <div style={{ padding: isMobile ? '15px' : '25px' }}>
          {/* SEKME 1: RAPOR EKLEME */}
          {activeTab === 'ekle' && (
            <form onSubmit={handleKaydet}>
              <div style={styles.formGrid}>
                <div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>İLGİLİ SERVİS / BİRİM ADI</label>
                    <input type="text" style={styles.input} value={servisAdi} onChange={e => setServisAdi(e.target.value)} placeholder="Örn: Acil Servis, Laboratuvar" required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>CİHAZ TÜRÜ / MARKA / MODEL</label>
                    <input type="text" style={styles.input} value={cihazModel} onChange={e => setCihazModel(e.target.value)} placeholder="Örn: Lenovo Masaüstü PC" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>BİRİM DAHİLİ / TELEFON</label>
                    <input type="text" style={styles.input} value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="Örn: 905XXXXXXXXX" />
                  </div>
                </div>
                <div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>CİHAZ DEMİRBAŞ NO / SERİ NO</label>
                    <input type="text" style={styles.input} value={cihazSeriNo} onChange={e => setCihazSeriNo(e.target.value)} placeholder="Örn: SRG554" required />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>YAPILAN TEKNİK MÜDAHALE NOTLARI</label>
                    <textarea style={{ ...styles.input, height: isMobile ? '90px' : '114px', resize: 'none' }} value={yapilanIslem} onChange={e => setYapilanIslem(e.target.value)} placeholder="Cihaza yapılan işlemler..." />
                  </div>
                </div>
              </div>

              <div style={{ ...styles.formGroup, marginTop: '5px' }}>
                <label style={styles.label}>DEĞİŞEN TEKNİK PARÇALAR (Her parçayı yeni satıra yazın)</label>
                <textarea style={{ ...styles.input, height: '65px', resize: 'none' }} value={degisenParcalar} onChange={e => setDegisenParcalar(e.target.value)} placeholder="Örn: 240GB SSD" />
              </div>

              <button type="submit" style={styles.button}>💾 Raporu Kaydet ve Karekod Üret</button>

              {sonUretilenQR && (
                <div style={styles.qrBox}>
                  <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <QRCodeSVG value={sonUretilenQR} size={isMobile ? 140 : 160} level={"H"} includeMargin={true} fgColor="#0052D4" />
                  </div>
                  <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#1e293b', fontWeight: '700' }}>Karekod Başarıyla Üretildi</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '340px', lineHeight: '1.4' }}>Barkod veya etiket yazıcısından çıktı alarak doğrudan cihazın üzerine yapıştırabilirsiniz.</p>
                    {telefon && (
                      <a href={`https://wa.me/${telefon}?text=${encodeURIComponent(`Sorgun DH Teknik Servis:\n\n${servisAdi} birimine ait cihazınızın bakımı tamamlanmıştır.\nİşlem: ${yapilanIslem}`)}`} target="_blank" rel="noreferrer" style={styles.wpButton}>
                        <MessageSquare size={15} /> WhatsApp Bildirimi Gönder
                      </a>
                    )}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* SEKME 2: SORGULAMA */}
          {activeTab === 'sorgula' && (
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label}>CİHAZ DEMİRBAŞ / SERİ NUMARASI</label>
                <input type="text" style={{ ...styles.input, padding: '14px', fontSize: '16px' }} value={sorguSeriNo} onChange={e => handleSorgula(e.target.value)} placeholder="Barkod okuyucuyla okutun veya elle yazın..." />
              </div>

              {sorguSonucu ? (
                <div style={{ marginTop: '25px' }}>
                  <div style={styles.infoBox}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#1e3a8a', fontSize: '16px', fontWeight: '700' }}>📋 Cihaz Kimlik Bilgisi</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                      <strong>Birim/Servis:</strong> {sorguSonucu.servis_adi} <br />
                      <strong>Model/Tür:</strong> {sorguSonucu.cihaz_model || 'Belirtilmedi'} <br />
                      <strong>İletişim Dahili:</strong> {sorguSonucu.telefon || 'Yok'}
                    </p>
                  </div>

                  <h3 style={{ fontSize: '14px', color: '#475569', marginBottom: '12px', fontWeight: '700' }}>⏳ Kronolojik Bakım Geçmişi</h3>
                  {sorguSonucu.islemler.map((islem, idx) => (
                    <div key={idx} style={styles.historyCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '10px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#4364F7' }}>Müdahale #{sorguSonucu.islemler.length - idx}</span>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{islem.tarih}</span>
                      </div>
                      <p style={{ fontSize: '14px', margin: '5px 0', color: '#334155', lineHeight: '1.4' }}><strong>Yapılan İşlem:</strong> {islem.islem}</p>
                      {islem.parcalar && islem.parcalar.length > 0 && (
                        <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', marginTop: '10px', border: '1px solid #edf2f7' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' }}>🔄 Değişen Parçalar:</span>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                            {islem.parcalar.map((p, pIdx) => <li key={pIdx}>{p}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                sorguSeriNo && (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                    <ShieldAlert size={36} style={{ color: '#f59e0b', marginBottom: '10px' }} />
                    <p style={{ margin: 0, fontSize: '14px' }}>Bu seri numarasına ait bir teknik servis kaydı bulunamadı.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;