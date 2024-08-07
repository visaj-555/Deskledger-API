const axios = require('axios');

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal", 
  "Ladakh (UT)", 
  "Chandigarh (UT)",
  "Dadra and Nagar Haveli (UT)",
  "Daman and Diu (UT)",
  "Lakshadweep (UT)",
  "Delhi (UT)", 
  "Jammu and Kashmir (UT)",
  "Pondicherry (UT)" ,
  "Andaman and Nicobar Islands (UT)",


];

const registerState = async (stateName) => {
  try {
    const response = await axios.post('http://192.168.29.168:3500/state', { stateName });
    console.log(`Registered state: ${stateName}`, response.data);
  } catch (error) {
    console.error(`Error registering state: ${stateName}`, error.response ? error.response.data : error.message);
  }
};

const registerAllStates = async () => {
  for (const state of states) {
    await registerState(state);
  }
};

registerAllStates();
