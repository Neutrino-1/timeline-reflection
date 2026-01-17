# Timeline: A Journey of Learning

A reflective web application that visualizes your life journey and career path through an interactive timeline. This website helps you reflect on the past and understand what decisions led you to your current career path.

## Purpose

This project is designed to help you:
- **Reflect on your past**: See how your experiences, skills, and interests evolved over time
- **Understand your journey**: Visualize the decisions and milestones that shaped your career
- **Analyze your path**: Get AI-powered insights into your skills development and career trajectory
- **Share your story**: Create a beautiful, interactive timeline of your personal and professional growth

## Features

- **Interactive Timeline**: Chronological visualization of your life events
- **Skill Matrix Charts**: Radar charts showing your skills progression (Creativity, Logic, Physical, Social, Tech)
- **Career Match Analysis**: AI-generated career recommendations based on your journey
- **Visual Storytelling**: Image galleries and descriptions for each milestone
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- A text editor for editing JSON files
- Access to an LLM (like ChatGPT, Claude, or similar) for generating analysis data

## Setup

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Timeline
   ```

2. **Open the project**
   - Simply open `index.html` in your web browser, or
   - Use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     ```
    - You can also use "live Server" plugin on VScode. 
3. **Access the website**
   - Open `http://localhost:8000` in your browser

## How to Customize for Your Own Journey

### Step 1: Edit `content.json`

The `content.json` file contains your personal timeline data. Each entry represents a year or period in your life.

**Structure:**
```json
[
  {
    "year": "1999",
    "title": "Hello World",
    "description": "Your description of what happened this year...",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  },
  {
    "year": "2000",
    "title": "Next Milestone",
    "description": "Another important event...",
    "images": []
  }
]
```

**Fields:**
- `year`: The year or time period (e.g., "1999", "2004 - 2009")
- `title`: A short title for this milestone
- `description`: A detailed description of what happened, what you learned, or what was significant
- `images`: Array of image URLs (can be empty `[]`)

**Tips:**
- Add entries chronologically (they will be sorted automatically)
- Be descriptive in your descriptions - this helps generate better AI analysis
- Include key learning moments, career decisions, and personal growth experiences
- Use image URLs from services like Unsplash, Imgur, or your own hosting

### Step 2: Generate `llm-interpretation.json`

This file contains AI-generated analysis of your journey, including skill assessments and career recommendations.

**Using ChatGPT/Claude to generate the interpretation**

1. **Prepare your prompt:**
   ```
   I have a timeline of my life journey in JSON format. For each year, please analyze:
   - The skills I developed (rate Creativity, Logic, Physical, Social, Tech from 0-100)
   - Top 10 career matches based on my activities and interests
   - A brief analysis summary
   
   Here's my content.json:
   [paste your content.json here]
   
   Please return a JSON object with this structure:
   {
     "YEAR": {
       "analysis_summary": "Brief analysis of this year...",
       "skills_matrix": { "Creativity": X, "Logic": X, "Physical": X, "Social": X, "Tech": X },
       "top_career_matches": [
         { "role": "Career Name", "match_percentage": X },
         ...
       ]
     },
     ...
   }
   ```

2. **Copy the response** and save it as `llm-interpretation.json`

3. **Validate the JSON** using a JSON validator to ensure it's properly formatted


**Important Notes:**
- The `year` keys in `llm-interpretation.json` must match the `year` values in `content.json`
- Skills should be rated 0-100
- Career matches should be ordered by relevance (highest match_percentage first)
- Include at least 5-10 career matches per year

### Step 3: Customize Styling (Optional)

Edit `style.css` to match your personal brand:
- Change color scheme in `:root` variables
- Modify fonts
- Adjust spacing and layout

## 📁 File Structure

```
Timeline/
├── index.html          # Main HTML file
├── script.js           # JavaScript logic and chart rendering
├── style.css           # Styling and layout
├── content.json        # Your personal timeline data
├── llm-interpretation.json  # AI-generated analysis
└── Readme.md           # This file
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share your customized timeline

## License

This project is open source and licensed under the **MIT License**.

**Happy reflecting! 🚀**
