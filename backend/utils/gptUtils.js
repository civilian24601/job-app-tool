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

const analyzeDocuments = async (documents) => {
  const combinedText = documents.map(doc => doc.text).join('\n');
  const prompt = `
    You are an expert career advisor. Here is the combined text from a user's resume and other documents:
    ${combinedText}

    Based on this information, provide a detailed summary of the user's profile, highlighting key skills, experience, and potential job titles. Then, suggest a type of job the user should look for, considering their background and skills.
  `;

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.data.choices[0].text.trim();
};

module.exports = { analyzeDocuments };
