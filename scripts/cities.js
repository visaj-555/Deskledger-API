const axios = require('axios');

const stateMap = {
    "Andhra Pradesh": "66b3127bed0af3423a62a7c3",
    "Arunachal Pradesh": "66b3127bed0af3423a62a7c6",
    "Assam" : "66b3127bed0af3423a62a7c9",
    "Bihar" : "66b3127bed0af3423a62a7cc",
    "Chhattisgarh" : "66b3127bed0af3423a62a7cf",
    "Goa" : "66b3127bed0af3423a62a7d2",
    "Gujarat" : "66b3127bed0af3423a62a7d5",
    "Haryana" : "66b3127bed0af3423a62a7d8",
    "Himachal Pradesh" : "66b3127bed0af3423a62a7db",
    "Jharkhand" : "66b3127bed0af3423a62a7de",
    "Karnataka" : "66b3127bed0af3423a62a7e1",
    "Kerala" : "66b3127bed0af3423a62a7e4",
    "Madhya Pradesh" : "66b3127bed0af3423a62a7e7",
    "Maharashtra" : "66b3127bed0af3423a62a7ea",
    "Manipur" : "66b3127bed0af3423a62a7ed",
    "Meghalaya" : "66b3127bed0af3423a62a7f0",
    "Mizoram" : "66b3127bed0af3423a62a7f3",
    "Nagaland" : "66b3127bed0af3423a62a7f6",
    "Odisha" : "66b3127bed0af3423a62a7f9",
    "Punjab" : "66b3127bed0af3423a62a7fc",
    "Rajasthan" : "66b3127bed0af3423a62a7ff",
    "Sikkim" :  "66b3127bed0af3423a62a802",
    "Tamil Nadu" : "66b3127ced0af3423a62a805",
    "Telangana" : "66b3127ced0af3423a62a808",
    "Tripura" : "66b3127ced0af3423a62a80b",
    "Uttar Pradesh" : "66b3127ced0af3423a62a80e",
    "Uttarakhand" : "66b3127ced0af3423a62a811",
    "West Bengal" : "66b3127ced0af3423a62a814",
    "Ladakh (UT)" : "66b3127ced0af3423a62a817",
    "Chandigarh (UT)" : "66b3127ced0af3423a62a81a",
    "Dadra and Nagar Haveli (UT)" : "66b3127ced0af3423a62a81d",
    "Daman and Diu (UT)" : "66b3127ced0af3423a62a820",
    "Lakshadweep (UT)" : "66b3127ced0af3423a62a823",
    "Delhi (UT)" : "66b3127ced0af3423a62a826",
    "Jammu and Kashmir (UT)" : "66b3127ced0af3423a62a829",
    "Pondicherry (UT)" : "66b3127ced0af3423a62a82c",
    "Andaman and Nicobar Islands (UT)" : "66b3127ced0af3423a62a82f",

};

// List of cities for each state
const cities = {
    "Andhra Pradesh": ["Vishakhapatnam", "Vijayawada", "Guntur"],
    "Arunachal Pradesh": ["Itanagar", "Pasighat"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur"],
    "Chhattisgarh": ["Raipur", "Bilaspur", "Durg"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama"],
"Gujarat": [
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Junagadh",
  "Gandhinagar",
  "Anand",
  "Nadiad",
  "Mehsana",
  "Bharuch",
  "Patan",
  "Porbandar",
  "Valsad",
  "Dahod",
  "Godhra",
  "Adalaj",
  "Bharuch",
  "Ankleshwar",
  "Kadi",  
  "Kalol",
  "Kadi",
  "Halol",
  "Mangrol"
],
  "Haryana": ["Chandigarh", "Faridabad", "Gurugram"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    "Manipur": ["Imphal", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Punjab": ["Amritsar", "Ludhiana", "Chandigarh"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Sikkim": ["Gangtok", "Namchi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Tripura": ["Agartala", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi"],
    "Uttarakhand": ["Dehradun", "Haridwar"],
    "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
    "Ladakh (UT)": ["Leh", "Kargil"],
    "Chandigarh (UT)": ["Chandigarh"],
    "Dadra and Nagar Haveli (UT)": ["Silvassa"],
    "Daman and Diu (UT)": ["Daman", "Diu"],
    "Lakshadweep (UT)": ["Kavaratti"],
    "Delhi (UT)": ["New Delhi"],
    "Jammu and Kashmir (UT)": ["Srinagar", "Jammu"],
    "Pondicherry (UT)": ["Puducherry"],
    "Andaman and Nicobar Islands (UT)": ["Port Blair"],
  };
const registerCity = async (cityName, stateId) => {
  try {
    const response = await axios.post('http://192.168.29.168:3500/city', { cityName, stateId });
    console.log(`Registered city: ${cityName} in state ID: ${stateId}`, response.data);
  } catch (error) {
    console.error(`Error registering city: ${cityName}`, error.response ? error.response.data : error.message);
  }
};

const registerAllCities = async () => {
  for (const stateName in cities) {
    const stateId = stateMap[stateName];
    for (const cityName of cities[stateName]) {
      await registerCity(cityName, stateId);
    }
  }
};

registerAllCities();
