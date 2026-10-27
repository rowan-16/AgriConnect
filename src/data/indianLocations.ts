export interface FormattedAddressInput {
  houseNumber?: string;
  street?: string;
  locality?: string;
  villageOrCity?: string;
  taluk?: string;
  district?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
  country?: string;
}

export interface StateLocationData {
  state: string;
  code: string;
  districts: string[];
}

export const INDIAN_STATES_AND_DISTRICTS: StateLocationData[] = [
  {
    state: 'Tamil Nadu',
    code: '33',
    districts: [
      'Virudhunagar',
      'Madurai',
      'Coimbatore',
      'Chennai',
      'Salem',
      'Erode',
      'Tirunelveli',
      'Thanjavur',
      'Dindigul',
      'Tiruchirappalli',
      'Tiruppur',
      'Vellore',
      'Cuddalore',
      'Kanchipuram',
      'Kanniyakumari',
      'Karur',
      'Nagapattinam',
      'Namakkal',
      'Nilgiris',
      'Perambalur',
      'Pudukkottai',
      'Ramanathapuram',
      'Sivaganga',
      'Theni',
      'Thoothukudi',
      'Tiruvallur',
      'Tiruvannamalai',
      'Tiruvarur',
      'Viluppuram',
      'Krishnagiri',
      'Dharmapuri',
      'Ariyalur',
      'Tenkasi',
      'Tirupathur',
      'Ranipet',
      'Chengalpattu',
      'Kallakurichi',
      'Mayiladuthurai'
    ]
  },
  {
    state: 'Maharashtra',
    code: '27',
    districts: [
      'Nashik',
      'Pune',
      'Mumbai City',
      'Mumbai Suburban',
      'Nagpur',
      'Ahmednagar',
      'Chhatrapati Sambhaji Nagar',
      'Jalgaon',
      'Kolhapur',
      'Solapur',
      'Satara',
      'Sangli',
      'Amravati',
      'Akola',
      'Beed',
      'Bhandara',
      'Buldhana',
      'Chandrapur',
      'Dhule',
      'Gadchiroli',
      'Gondia',
      'Hingoli',
      'Jalna',
      'Latur',
      'Nanded',
      'Nandurbar',
      'Osmanabad',
      'Palghar',
      'Parbhani',
      'Raigad',
      'Ratnagiri',
      'Sindhudurg',
      'Thane',
      'Wardha',
      'Washim',
      'Yavatmal'
    ]
  },
  {
    state: 'Karnataka',
    code: '29',
    districts: [
      'Bengaluru Urban',
      'Bengaluru Rural',
      'Mysuru',
      'Belagavi',
      'Mandya',
      'Shivamogga',
      'Tumakuru',
      'Ballari',
      'Bidar',
      'Vijayapura',
      'Chamarajanagar',
      'Chikkaballapur',
      'Chikkamagaluru',
      'Chitradurga',
      'Dakshina Kannada',
      'Davanagere',
      'Dharwad',
      'Gadag',
      'Hassan',
      'Haveri',
      'Kalaburagi',
      'Kodagu',
      'Kolar',
      'Koppal',
      'Raichur',
      'Ramanagara',
      'Udupi',
      'Uttara Kannada',
      'Yadgir',
      'Bagalkote',
      'Vijayanagara'
    ]
  },
  {
    state: 'Andhra Pradesh',
    code: '37',
    districts: [
      'Guntur',
      'Krishna',
      'Visakhapatnam',
      'Chittoor',
      'East Godavari',
      'West Godavari',
      'Kurnool',
      'Ananthapuramu',
      'Prakasam',
      'SPS Nellore',
      'Srikakulam',
      'Vizianagaram',
      'YSR Kadapa',
      'NTR',
      'Palnadu',
      'Bapatla',
      'Annamayya',
      'Sri Sathya Sai',
      'Tirupati',
      'Eluru',
      'Kakinada',
      'Konaseema',
      'Alluri Sitharama Raju',
      'Parvathipuram Manyam',
      'Nandyal',
      'Anakapalli'
    ]
  },
  {
    state: 'Punjab',
    code: '03',
    districts: [
      'Ludhiana',
      'Amritsar',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Hoshiarpur',
      'Firozpur',
      'Gurdaspur',
      'Faridkot',
      'Fatehgarh Sahib',
      'Fazilka',
      'Kapurthala',
      'Mansa',
      'Moga',
      'Muktsar',
      'Pathankot',
      'Rupnagar',
      'Sahibzada Ajit Singh Nagar',
      'Sangrur',
      'Shahid Bhagat Singh Nagar',
      'Sri Muktsar Sahib',
      'Tarn Taran',
      'Barnala',
      'Malerkotla'
    ]
  },
  {
    state: 'Gujarat',
    code: '24',
    districts: [
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Bhavnagar',
      'Jamnagar',
      'Junagadh',
      'Gandhinagar',
      'Anand',
      'Banaskantha',
      'Bharuch',
      'Dahod',
      'Dang',
      'Kheda',
      'Kutch',
      'Mehsana',
      'Morbi',
      'Narmada',
      'Navsari',
      'Panchmahal',
      'Patan',
      'Porbandar',
      'Sabarkantha',
      'Surendranagar',
      'Tapi',
      'Valsad',
      'Amreli',
      'Aravalli',
      'Botad',
      'Chhota Udaipur',
      'Devbhoomi Dwarka',
      'Gir Somnath',
      'Mahisagar'
    ]
  },
  {
    state: 'Kerala',
    code: '32',
    districts: [
      'Thiruvananthapuram',
      'Kollam',
      'Pathanamthitta',
      'Alappuzha',
      'Kottayam',
      'Idukki',
      'Ernakulam',
      'Thrissur',
      'Palakkad',
      'Malappuram',
      'Kozhikode',
      'Wayanad',
      'Kannur',
      'Kasaragod'
    ]
  },
  {
    state: 'Telangana',
    code: '36',
    districts: [
      'Hyderabad',
      'Ranga Reddy',
      'Medchal-Malkajgiri',
      'Warangal',
      'Karimnagar',
      'Nalgonda',
      'Khammam',
      'Nizamabad',
      'Mahabubnagar',
      'Sangareddy',
      'Siddipet',
      'Jagtial',
      'Bhadradri Kothagudem',
      'Adilabad',
      'Mancherial',
      'Kamareddy',
      'Vikarabad',
      'Suryapet'
    ]
  },
  {
    state: 'Uttar Pradesh',
    code: '09',
    districts: [
      'Lucknow',
      'Kanpur Nagar',
      'Varanasi',
      'Prayagraj',
      'Agra',
      'Meerut',
      'Ghaziabad',
      'Gautam Buddha Nagar',
      'Bareilly',
      'Aligarh',
      'Moradabad',
      'Saharanpur',
      'Gorakhpur',
      'Faizabad',
      'Jhansi',
      'Muzaffarnagar',
      'Mathura',
      'Budaun',
      'Barabanki',
      'Sitapur'
    ]
  },
  {
    state: 'Haryana',
    code: '06',
    districts: [
      'Gurugram',
      'Faridabad',
      'Karnal',
      'Panipat',
      'Ambala',
      'Hisar',
      'Rohtak',
      'Sonipat',
      'Panchkula',
      'Sirsa',
      'Yamunanagar',
      'Kurukshetra',
      'Bhiwani',
      'Rewari',
      'Jind',
      'Kaithal'
    ]
  },
  {
    state: 'Rajasthan',
    code: '08',
    districts: [
      'Jaipur',
      'Jodhpur',
      'Kota',
      'Bikaner',
      'Ajmer',
      'Udaipur',
      'Bhilwara',
      'Alwar',
      'Bharatpur',
      'Sikar',
      'Pali',
      'Sri Ganganagar',
      'Chittorgarh',
      'Nagaur'
    ]
  },
  {
    state: 'Madhya Pradesh',
    code: '23',
    districts: [
      'Bhopal',
      'Indore',
      'Jabalpur',
      'Gwalior',
      'Ujjain',
      'Sagar',
      'Dewas',
      'Satna',
      'Ratlam',
      'Rewa',
      'Murwara',
      'Singrauli',
      'Chhindwara',
      'Morena',
      'Khandwa'
    ]
  },
  {
    state: 'West Bengal',
    code: '19',
    districts: [
      'Kolkata',
      'North 24 Parganas',
      'South 24 Parganas',
      'Howrah',
      'Hooghly',
      'Purba Medinipur',
      'Paschim Medinipur',
      'Bardhaman',
      'Nadia',
      'Murshidabad',
      'Malda',
      'Jalpaiguri',
      'Darjeeling',
      'Alipurduar',
      'Cooch Behar'
    ]
  },
  {
    state: 'Bihar',
    code: '10',
    districts: [
      'Patna',
      'Gaya',
      'Bhagalpur',
      'Muzaffarpur',
      'Purnia',
      'Darbhanga',
      'Bihar Sharif',
      'Arrah',
      'Begusarai',
      'Katihar',
      'Munger',
      'Chhapra',
      'Samastipur'
    ]
  },
  {
    state: 'Odisha',
    code: '21',
    districts: [
      'Khordha',
      'Cuttack',
      'Ganjam',
      'Baleswar',
      'Sundargarh',
      'Puri',
      'Bhadrak',
      'Sambalpur',
      'Balangir',
      'Mayurbhanj',
      'Jajpur',
      'Kalahandi'
    ]
  },
  {
    state: 'Assam',
    code: '18',
    districts: [
      'Kamrup Metropolitan',
      'Cachar',
      'Dibrugarh',
      'Jorhat',
      'Nagaon',
      'Tinsukia',
      'Sonitpur',
      'Barpeta',
      'Dhubri',
      'Golaghat',
      'Sivasagar'
    ]
  },
  {
    state: 'Delhi',
    code: '07',
    districts: [
      'Central Delhi',
      'East Delhi',
      'New Delhi',
      'North Delhi',
      'North East Delhi',
      'North West Delhi',
      'Shahdara',
      'South Delhi',
      'South East Delhi',
      'South West Delhi',
      'West Delhi'
    ]
  },
  {
    state: 'Uttarakhand',
    code: '05',
    districts: [
      'Dehradun',
      'Haridwar',
      'Nainital',
      'Udham Singh Nagar',
      'Pauri Garhwal',
      'Tehri Garhwal',
      'Almora',
      'Chamoli'
    ]
  },
  {
    state: 'Himachal Pradesh',
    code: '02',
    districts: [
      'Kangra',
      'Mandi',
      'Shimla',
      'Solan',
      'Sirmaur',
      'Una',
      'Chamba',
      'Hamirpur',
      'Kullu',
      'Bilaspur'
    ]
  },
  {
    state: 'Goa',
    code: '30',
    districts: [
      'North Goa',
      'South Goa'
    ]
  },
  {
    state: 'Jammu and Kashmir',
    code: '01',
    districts: [
      'Srinagar',
      'Jammu',
      'Anantnag',
      'Baramulla',
      'Kathua',
      'Pulwama',
      'Udhampur',
      'Budgam',
      'Kupwara'
    ]
  },
  {
    state: 'Puducherry',
    code: '34',
    districts: [
      'Puducherry',
      'Karaikal',
      'Mahe',
      'Yanam'
    ]
  },
  {
    state: 'Chandigarh',
    code: '04',
    districts: [
      'Chandigarh'
    ]
  }
];

export function getDistrictsForState(stateName: string): string[] {
  if (!stateName) return [];
  const found = INDIAN_STATES_AND_DISTRICTS.find(
    s => s.state.toLowerCase() === stateName.trim().toLowerCase()
  );
  return found ? found.districts : [];
}

export function getStateCode(stateName: string): string {
  if (!stateName) return '';
  const found = INDIAN_STATES_AND_DISTRICTS.find(
    s => s.state.toLowerCase() === stateName.trim().toLowerCase()
  );
  return found ? found.code : '';
}

export function isValidPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function isValidGstin(gstin: string): boolean {
  if (!gstin) return false;
  const cleaned = gstin.trim().toUpperCase();
  // Standard Indian GSTIN Regex: 2 digits state code + 10 alphanumeric PAN + 1 entity + 'Z' + 1 checksum
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleaned);
}

export function formatStructuredAddress(addr?: FormattedAddressInput | null): string {
  if (!addr) return '';
  const parts: string[] = [];
  if (addr.houseNumber) parts.push(addr.houseNumber);
  if (addr.street) parts.push(addr.street);
  if (addr.locality) parts.push(addr.locality);
  if (addr.villageOrCity) parts.push(addr.villageOrCity);
  if (addr.taluk) parts.push(`Taluk: ${addr.taluk}`);
  if (addr.district) parts.push(addr.district);
  if (addr.state) parts.push(addr.state);
  if (addr.postalCode) parts.push(addr.postalCode);
  if (addr.country && addr.country !== 'India') parts.push(addr.country);
  return parts.filter(Boolean).join(', ');
}
