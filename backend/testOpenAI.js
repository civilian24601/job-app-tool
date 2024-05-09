require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Configuration, OpenAIApi } = require('openai');

console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);  // Debugging

let configuration;
try {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (err) {
  console.error('Error creating OpenAI Configuration:', err);
}
console.log('Configuration:', configuration);  // Debugging

let openai;
try {
  openai = new OpenAIApi(configuration);
} catch (err) {
  console.error('Error creating OpenAI Client:', err);
}
console.log('OpenAI Client:', openai);  // Debugging
