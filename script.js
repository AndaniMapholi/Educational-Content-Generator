const form = document.getElementById("generatorForm");
const outputSection = document.getElementById("outputSection");
const outputText = document.getElementById("outputText");
const stats = document.getElementById("stats");

// API configuration
const API_KEY = "AIzaSyC9R8pJSNRKmEcYjBw5rX7V9Qr2dDXOl-c";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Subject to topics mapping
const subjectTopics = {
  "Mathematics": [
    "Fractions",
    "Algebraic Expressions",
    "Geometry",
    "Integers",
    "Probability"
  ],
  "Natural Sciences": [
    "Photosynthesis",
    "The Solar System",
    "Cells and Microorganisms",
    "Energy and Change",
    "Human Reproduction"
  ],
  "English": [
    "Comprehension Skills",
    "Parts of Speech",
    "Creative Writing",
    "Poetry Analysis",
    "Listening and Speaking"
  ],
  "Tshivenda": [
    "Reading Comprehension",
    "Traditional Stories",
    "Grammar",
    "Poetry",
    "Writing Skills"
  ],
  "Social Sciences": [
    "Map Skills",
    "Early Civilizations",
    "Weather and Climate",
    "Democracy and Government",
    "Heritage Sites"
  ],
  "Life Orientation": [
    "Personal Well-being",
    "Peer Pressure",
    "Goal Setting",
    "Healthy Living",
    "Bullying Prevention"
  ],
  "Technology": [
    "Structures",
    "Processing Materials",
    "Systems and Control",
    "Electric Circuits",
    "Design Process"
  ],
  "EMS": [
    "Entrepreneurship",
    "Financial Literacy",
    "The Economy",
    "Goods and Services",
    "Budgeting"
  ],
  "Creative Arts": [
    "Visual Arts Techniques",
    "Music Elements",
    "Drama Activities",
    "Dance Forms",
    "Art Appreciation"
  ]
};

const subjectSelect = document.getElementById("subject");
const topicSelect = document.getElementById("topic");

subjectSelect.addEventListener("change", function() {
  const subject = subjectSelect.value;
  // Clear previous topics
  topicSelect.innerHTML = '<option value="">--Select Topic--</option>';
  if (subjectTopics[subject]) {
    subjectTopics[subject].forEach(topic => {
      const opt = document.createElement('option');
      opt.value = topic;
      opt.textContent = topic;
      topicSelect.appendChild(opt);
    });
  }
});

// Function to validate API key format
function isValidApiKey(key) {
  return key && key.startsWith('AIza') && key.length > 30;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  // Validate API key before making the request
  if (!isValidApiKey(API_KEY)) {
    alert("Invalid API key format. Please check your API key configuration.");
    return;
  }

  const contentType = document.getElementById("contentType").value;
  const subject = document.getElementById("subject").value.trim();
  const topic = document.getElementById("topic").value.trim();

  if (!contentType || !subject || !topic) {
    alert("All fields are required.");
    return;
  }

  const prompt = `Generate a ${contentType} for Grade 7 on the topic "${topic}" in the subject "${subject}". Keep it age-appropriate and useful for learners.`;

  const start = performance.now();

  try {
    console.log('Making API request to:', API_URL);
    console.log('Using API key:', API_KEY.substring(0, 10) + '...');

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.8,
          topK: 40
        }
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);

    const end = performance.now();
    const duration = ((end - start) / 1000).toFixed(2);

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    // Format the generated text for better readability
    const formattedText = generatedText
      .split('\n\n').map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`).join('');
    outputText.innerHTML = formattedText;
    stats.innerText = `Generation Time: ${duration}s`;
    outputSection.classList.remove("hidden");
  } catch (err) {
    console.error('Detailed error:', err);
    alert(`Error: ${err.message}\n\nPlease check the console for more details.`);
  }
});

function exportText() {
  const text = outputText.innerHTML;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "grade7-content.txt";
  a.click();
}