export type MapLanguageMode = 'bilingual' | 'hi' | 'en';

export interface BilingualPlaceEntry {
  en: string;
  hi: string;
  districtEn?: string;
  districtHi?: string;
  stateEn?: string;
  stateHi?: string;
}

/**
 * Dictionary of Indian oilfield towns, well sites, districts, states,
 * sedimentary basins, and geological formations in English and Hindi (Devanagari).
 */
export const INDIAN_PLACE_DICTIONARY: Record<string, BilingualPlaceEntry> = {
  // Active & Offset Well Places (Upper Assam)
  'Duliajan-042': {
    en: 'Duliajan-042',
    hi: 'दुलियाजान-०४२',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Naharkatiya-043': {
    en: 'Naharkatiya-043',
    hi: 'नाहरकटिया-०४३',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Baghjan-Tinsukia-041': {
    en: 'Baghjan-Tinsukia-041',
    hi: 'बाघजान-तिनसुकिया-०४१',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Duliajan-East-101': {
    en: 'Duliajan-East-101',
    hi: 'दुलियाजान-पूर्व-१०१',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Naharkatiya-North-102': {
    en: 'Naharkatiya-North-102',
    hi: 'नाहरकटिया-उत्तर-१०२',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Tengakhat-103': {
    en: 'Tengakhat-103',
    hi: 'तेंगाखाट-१०३',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Hugrijan-104': {
    en: 'Hugrijan-104',
    hi: 'हुगरीजन-१०४',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Barekuri-105': {
    en: 'Barekuri-105',
    hi: 'बारेकुरी-१०५',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Kathaloni-106': {
    en: 'Kathaloni-106',
    hi: 'कठालोनी-१०६',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Hapjan-107': {
    en: 'Hapjan-107',
    hi: 'हापजान-१०७',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Makum-108': {
    en: 'Makum-108',
    hi: 'माकुम-१०८',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Naharkatiya-South-109': {
    en: 'Naharkatiya-South-109',
    hi: 'नाहरकटिया-दक्षिण-१०९',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Chabua-110': {
    en: 'Chabua-110',
    hi: 'चाबुआ-११०',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Digboi-West-111': {
    en: 'Digboi-West-111',
    hi: 'डिगबोई-पश्चिम-१११',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Baghjan-112': {
    en: 'Baghjan-112',
    hi: 'बाघजान-११२',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Moran-113': {
    en: 'Moran-113',
    hi: 'मोरन-११३',
    districtEn: 'Dibrugarh–Sivasagar',
    districtHi: 'डिब्रूगढ़–शिवसागर',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Dikom-114': {
    en: 'Dikom-114',
    hi: 'डिकॉम-११४',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Moran-Sivasagar-044': {
    en: 'Moran-Sivasagar-044',
    hi: 'मोरन-शिवसागर-०४४',
    districtEn: 'Sivasagar',
    districtHi: 'शिवसागर',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Mangala-Barmer-051': {
    en: 'Mangala-Barmer-051',
    hi: 'मंगला-बाड़मेर-०५१',
    districtEn: 'Barmer',
    districtHi: 'बाड़मेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },
  'Rajahmundry-KG-062': {
    en: 'Rajahmundry-KG-062',
    hi: 'राजमंड्री-केजी-०६२',
    districtEn: 'East Godavari',
    districtHi: 'पूर्वी गोदावरी',
    stateEn: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
  },
  'Ankleshwar-Cambay-074': {
    en: 'Ankleshwar-Cambay-074',
    hi: 'अंकलेश्वर-खंभात-०७४',
    districtEn: 'Bharuch',
    districtHi: 'भरूच',
    stateEn: 'Gujarat',
    stateHi: 'गुजरात',
  },
  'Mumbai-High-North-088': {
    en: 'Mumbai-High-North-088',
    hi: 'मुंबई-हाई-उत्तर-०८८',
    districtEn: 'Arabian Sea Offshore',
    districtHi: 'अरब सागर अपतटीय',
    stateEn: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
  },
  'Karaikal-Cauvery-095': {
    en: 'Karaikal-Cauvery-095',
    hi: 'कराईकल-कावेरी-०९५',
    districtEn: 'Nagapattinam',
    districtHi: 'नागपट्टिनम',
    stateEn: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
  },
  'Paradip-Mahanadi-099': {
    en: 'Paradip-Mahanadi-099',
    hi: 'पारादीप-महानदी-०९९',
    districtEn: 'Jagatsinghpur',
    districtHi: 'जगतसिंहपुर',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
  },
  'Mangala-North-201': {
    en: 'Mangala-North-201',
    hi: 'मंगला-उत्तर-२०१',
    districtEn: 'Barmer',
    districtHi: 'बाड़मेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },
  'Bhagyam-Pachpadra-202': {
    en: 'Bhagyam-Pachpadra-202',
    hi: 'भाग्यम-पचपदरा-२०२',
    districtEn: 'Barmer',
    districtHi: 'बाड़मेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },
  'Tanot-Jaisalmer-203': {
    en: 'Tanot-Jaisalmer-203',
    hi: 'तनोट-जैसलमेर-२०३',
    districtEn: 'Jaisalmer',
    districtHi: 'जैसलमेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },
  'Kakinada-Deep-301': {
    en: 'Kakinada-Deep-301',
    hi: 'काकीनाडा-डीप-३०१',
    districtEn: 'Kakinada',
    districtHi: 'काकीनाडा',
    stateEn: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
  },
  'Pasarlapudi-KG-302': {
    en: 'Pasarlapudi-KG-302',
    hi: 'पसरलापुडी-केजी-३०२',
    districtEn: 'East Godavari',
    districtHi: 'पूर्वी गोदावरी',
    stateEn: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
  },
  'Ankleshwar-South-401': {
    en: 'Ankleshwar-South-401',
    hi: 'अंकलेश्वर-दक्षिण-४०१',
    districtEn: 'Bharuch',
    districtHi: 'भरूच',
    stateEn: 'Gujarat',
    stateHi: 'गुजरात',
  },
  'Mehsana-Kalol-402': {
    en: 'Mehsana-Kalol-402',
    hi: 'मेहसाणा-कलोल-४०२',
    districtEn: 'Mehsana',
    districtHi: 'मेहसाणा',
    stateEn: 'Gujarat',
    stateHi: 'गुजरात',
  },
  'Mumbai-High-South-501': {
    en: 'Mumbai-High-South-501',
    hi: 'मुंबई-हाई-दक्षिण-५०१',
    districtEn: 'Mumbai Offshore',
    districtHi: 'मुंबई अपतटीय',
    stateEn: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
  },
  'Bassein-Vasai-502': {
    en: 'Bassein-Vasai-502',
    hi: 'बसीन-वसई-५०२',
    districtEn: 'Western Offshore',
    districtHi: 'पश्चिमी अपतटीय',
    stateEn: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
  },
  'Karaikal-Cauvery-601': {
    en: 'Karaikal-Cauvery-601',
    hi: 'कराईकल-कावेरी-६०१',
    districtEn: 'Nagapattinam',
    districtHi: 'नागपट्टिनम',
    stateEn: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
  },
  'Paradip-Mahanadi-701': {
    en: 'Paradip-Mahanadi-701',
    hi: 'पारादीप-महानदी-७०१',
    districtEn: 'Jagatsinghpur',
    districtHi: 'जगतसिंहपुर',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
  },
  'Mumbai High Offshore Platform Hub': {
    en: 'Mumbai High Offshore Platform Hub',
    hi: 'मुंबई हाई अपतटीय प्लेटफ़ॉर्म हब',
    districtEn: 'Mumbai Offshore',
    districtHi: 'मुंबई अपतटीय',
    stateEn: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
  },
  'Jaisalmer — Tanot Desert Gas Hub': {
    en: 'Jaisalmer — Tanot Desert Gas Hub',
    hi: 'जैसलमेर — तनोट मरुस्थलीय गैस हब',
    districtEn: 'Jaisalmer',
    districtHi: 'जैसलमेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },

  // Indian Oilfield Hubs & National Sedimentary Basin Hubs
  'Duliajan Field HQ': {
    en: 'Duliajan Field HQ',
    hi: 'दुलियाजान क्षेत्र मुख्यालय',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Naharkatiya Oilfield': {
    en: 'Naharkatiya Oilfield',
    hi: 'नाहरकटिया तेल क्षेत्र',
    districtEn: 'Dibrugarh',
    districtHi: 'डिब्रूगढ़',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Digboi Historic Oilfield': {
    en: 'Digboi Historic Oilfield',
    hi: 'डिगबोई ऐतिहासिक तेल क्षेत्र',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Baghjan–Tinsukia Sector': {
    en: 'Baghjan–Tinsukia Sector',
    hi: 'बाघजान–तिनसुकिया सेक्टर',
    districtEn: 'Tinsukia',
    districtHi: 'तिनसुकिया',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Moran–Sivasagar Block': {
    en: 'Moran–Sivasagar Block',
    hi: 'मोरन–शिवसागर ब्लॉक',
    districtEn: 'Charaideo / Sivasagar',
    districtHi: 'चराईदेव / शिवसागर',
    stateEn: 'Assam',
    stateHi: 'असम',
  },
  'Barmer — Mangala & Pachpadra Hub': {
    en: 'Barmer — Mangala & Pachpadra Hub',
    hi: 'बाड़मेर — मंगला एवं पचपदरा हब',
    districtEn: 'Barmer',
    districtHi: 'बाड़मेर',
    stateEn: 'Rajasthan',
    stateHi: 'राजस्थान',
  },
  'Rajahmundry–Kakinada Onland Hub': {
    en: 'Rajahmundry–Kakinada Onland Hub',
    hi: 'राजमंड्री–काकीनाडा तटीय हब',
    districtEn: 'East Godavari',
    districtHi: 'पूर्वी गोदावरी',
    stateEn: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
  },
  'Ankleshwar–Mehsana–Vadodara Hub': {
    en: 'Ankleshwar–Mehsana–Vadodara Hub',
    hi: 'अंकलेश्वर–मेहसाणा–वडोदरा हब',
    districtEn: 'Bharuch / Mehsana',
    districtHi: 'भरूच / मेहसाणा',
    stateEn: 'Gujarat',
    stateHi: 'गुजरात',
  },
  'Karaikal–Nagapattinam Sector': {
    en: 'Karaikal–Nagapattinam Sector',
    hi: 'कराईकल–नागपट्टिनम सेक्टर',
    districtEn: 'Nagapattinam',
    districtHi: 'नागपट्टिनम',
    stateEn: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
  },
  'Paradip–Bhubaneswar Sector': {
    en: 'Paradip–Bhubaneswar Sector',
    hi: 'पारादीप–भुवनेश्वर सेक्टर',
    districtEn: 'Jagatsinghpur',
    districtHi: 'जगतसिंहपुर',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
  },
};

export const INDIAN_BASIN_AND_FORMATION_HINDI: Record<string, string> = {
  'Upper Assam Basin': 'ऊपरी असम बेसिन',
  'Upper Assam Fold Belt': 'ऊपरी असम फोल्ड बेल्ट',
  'Upper Assam Shelf': 'ऊपरी असम शेल्फ',
  'Barmer–Sanchor & Jaisalmer Basin': 'बाड़मेर–सांचोर एवं जैसलमेर बेसिन',
  'Krishna–Godavari (KG) Basin': 'कृष्णा–गोदावरी (केजी) बेसिन',
  'Cambay Basin': 'खंभात (कैम्बे) बेसिन',
  'Cauvery Basin': 'कावेरी बेसिन',
  'Mahanadi Basin': 'महानदी बेसिन',
  'Dhekiajuli Alluvial Sands': 'ढेकियाजुली जलोढ़ रेत (Dhekiajuli Sands)',
  'Namsang Claystone Formation': 'नामसांग क्लेस्टोन संरचना (Namsang Claystone)',
  'Tipam Sandstone Formation': 'तिपम बलुआ पत्थर संरचना (Tipam Sandstone)',
  'Girujan Clay — Transition Shale': 'गिरुजन क्ले — संक्रमण शेल (Girujan Clay)',
  'Barail Sandstone Reservoir': 'बरेल बलुआ पत्थर जलाशय (Barail Reservoir)',
};

export const MAP_UI_LABELS: Record<string, { en: string; hi: string }> = {
  activeWellBadge: { en: 'ACTIVE', hi: 'सक्रिय कूप' },
  activeWellLegend: { en: 'Active Well', hi: 'सक्रिय कूप' },
  normalOffsetLegend: { en: 'Normal Offset', hi: 'सामान्य ऑफसेट कूप' },
  selectedWellLegend: { en: 'Selected Well', hi: 'चयनित कूप' },
  highRiskLegend: { en: 'High Risk', hi: 'उच्च जोखिम' },
  criticalEventLegend: { en: 'Critical Event', hi: 'गंभीर घटना' },
  jumpDuliajan: {
    en: 'Duliajan–Naharkatiya (Assam)',
    hi: 'दुलियाजान–नाहरकटिया (असम)',
  },
  jumpDigboi: {
    en: 'Digboi–Tinsukia',
    hi: 'डिगबोई–तिनसुकिया',
  },
  jumpMoran: {
    en: 'Moran–Sivasagar',
    hi: 'मोरन–शिवसागर',
  },
  jumpAllIndia: {
    en: 'All-India Basins Map',
    hi: 'अखिल भारतीय बेसिन मानचित्र',
  },
  hubsOn: {
    en: 'Hubs: ON',
    hi: 'तेल क्षेत्र केंद्र: चालू',
  },
  hubsOff: {
    en: 'Hubs: OFF',
    hi: 'तेल क्षेत्र केंद्र: बंद',
  },
  currentDepth: {
    en: 'Current Depth',
    hi: 'वर्तमान गहराई',
  },
  formation: {
    en: 'Formation',
    hi: 'भू-संरचना',
  },
  totalDepth: {
    en: 'Total Depth',
    hi: 'कुल गहराई',
  },
  wellStatus: {
    en: 'Well Status',
    hi: 'कूप स्थिति',
  },
  historicalEvents: {
    en: 'Historical Events',
    hi: 'ऐतिहासिक घटनाएं',
  },
  highestSeverity: {
    en: 'Highest Severity',
    hi: 'उच्चतम गंभीरता',
  },
  viewWellProfile: {
    en: 'View Well Profile',
    hi: 'कूप प्रोफ़ाइल देखें',
  },
  compareWell: {
    en: 'Compare Well',
    hi: 'कूप तुलना करें',
  },
  viewEvents: {
    en: 'View Events',
    hi: 'घटनाएं देखें',
  },
};

/**
 * Formats any Indian place name, well site name, basin, or formation
 * in Hindi and English according to the selected language mode.
 */
export function formatIndianPlaceLabel(
  rawText: string,
  mode: MapLanguageMode = 'bilingual'
): string {
  const baseName = rawText.split('(')[0].trim();
  const entry = INDIAN_PLACE_DICTIONARY[baseName] || INDIAN_PLACE_DICTIONARY[rawText];

  if (entry) {
    if (mode === 'hi') return entry.hi;
    if (mode === 'en') return entry.en;
    return `${entry.hi} · ${entry.en}`;
  }

  const basinOrFormationHi = INDIAN_BASIN_AND_FORMATION_HINDI[rawText];
  if (basinOrFormationHi) {
    if (mode === 'hi') return basinOrFormationHi.split('(')[0].trim();
    if (mode === 'en') return rawText;
    return `${basinOrFormationHi.split('(')[0].trim()} · ${rawText}`;
  }

  return rawText;
}

/**
 * Formats a UI control or legend label on the GIS map in Hindi and/or English.
 */
export function formatMapUILabel(
  key: keyof typeof MAP_UI_LABELS,
  mode: MapLanguageMode = 'bilingual'
): string {
  const item = MAP_UI_LABELS[key];
  if (!item) return String(key);
  if (mode === 'hi') return item.hi;
  if (mode === 'en') return item.en;
  return `${item.hi} / ${item.en}`;
}

/**
 * Builds structured Hindi + English marker and popup labels for an active or offset well.
 */
export function getBilingualWellLabel(
  wellName: string,
  wellId: string,
  mode: MapLanguageMode = 'bilingual'
) {
  const shortPlaceEn = wellName.split('(')[0].trim();
  const entry = INDIAN_PLACE_DICTIONARY[shortPlaceEn];
  const shortPlaceHi = entry ? entry.hi : shortPlaceEn;
  const locationEn = entry?.districtEn
    ? `${entry.districtEn}, ${entry.stateEn}`
    : wellName.includes('(')
    ? wellName.slice(wellName.indexOf('(') + 1, wellName.lastIndexOf(')'))
    : 'Assam, India';
  const locationHi = entry?.districtHi
    ? `${entry.districtHi}, ${entry.stateHi}`
    : 'असम, भारत';

  const markerTitle =
    mode === 'hi'
      ? shortPlaceHi
      : mode === 'en'
      ? shortPlaceEn
      : `${shortPlaceHi} · ${shortPlaceEn}`;

  const locationSubtitle =
    mode === 'hi'
      ? `${locationHi}, भारत`
      : mode === 'en'
      ? `${locationEn}, India`
      : `${locationHi} (${locationEn}, India)`;

  const activeBadge = formatMapUILabel('activeWellBadge', mode);

  return {
    wellId,
    shortPlaceEn,
    shortPlaceHi,
    markerTitle,
    locationSubtitle,
    activeBadge,
  };
}

/**
 * Builds structured Hindi + English marker and popup labels for an Indian Oilfield / Basin Hub.
 */
export function getBilingualHubLabel(
  place: {
    id: string;
    name: string;
    state: string;
    basin: string;
  },
  mode: MapLanguageMode = 'bilingual'
) {
  const entry = INDIAN_PLACE_DICTIONARY[place.name];
  const nameHi = entry ? entry.hi : place.name;
  const districtHi = entry?.districtHi || place.state.split(',')[0].trim();
  const stateHi = entry?.stateHi || '';
  const basinHi =
    INDIAN_BASIN_AND_FORMATION_HINDI[place.basin] || place.basin;

  const markerLabel =
    mode === 'hi'
      ? `${nameHi} (${districtHi})`
      : mode === 'en'
      ? `${place.name} (${place.state.split(',')[0]})`
      : `${nameHi} · ${place.name} (${districtHi})`;

  const popupTitle =
    mode === 'hi'
      ? nameHi
      : mode === 'en'
      ? place.name
      : `${nameHi} · ${place.name}`;

  const popupRegion =
    mode === 'hi'
      ? `${districtHi}, ${stateHi}, भारत · ${basinHi}`
      : mode === 'en'
      ? `${place.state}, India · ${place.basin}`
      : `${districtHi}, ${stateHi} (${place.state}, India) · ${basinHi} (${place.basin})`;

  return {
    markerLabel,
    popupTitle,
    popupRegion,
  };
}
