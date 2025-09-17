# Athena Frontend API Integration

This document describes the integration between the Athena frontend and the athena-orchestrator API.

## Features Implemented

### 1. Real API Integration
- Replaced mock responses with actual API calls to `athena-orchestrator`
- Endpoint: `POST /chat`
- Request format: `{ session_id, message, title }`
- Response format: `{ answer, data_preview, sql, latency_ms, clarify }`

### 2. Session Management
- Automatic session ID generation: `athena_<timestamp>_<random>`
- Session persistence across conversation
- Unique session per browser tab/window

### 3. Response Handling
- **Answer**: Main response text with markdown formatting
- **Data Preview**: Structured table display for query results
- **SQL**: Query information (displayed in latency indicator)
- **Latency**: Response time in milliseconds
- **Clarify**: Interactive clarification options

### 4. Data Preview Tables
- Automatic table rendering for structured data
- Column headers and row data formatting
- Number formatting with commas
- String truncation for long values
- Scrollable container (max 300px height)
- Row count and execution time display

### 5. Clarification Flow
- Interactive buttons for clarification options
- Click-to-select functionality
- Automatic follow-up API calls
- Seamless conversation continuation

### 6. Configuration Panel
- API URL customization
- Persistent storage in localStorage
- Easy access via settings button
- Default: `http://localhost:8000`

### 7. Error Handling
- Network error detection
- API response validation
- User-friendly error messages
- Graceful fallback behavior

## Usage

### Starting the API Server
```bash
cd athena-orchestrator
python app_mysql_stateful_clarify_routed.py
```

### Configuring the Frontend
1. Click the settings button (⚙️) in the input footer
2. Enter your API base URL (default: `http://localhost:8000`)
3. Click "Save"

### Example API Response
```json
{
  "answer": "Here are the top 5 suppliers in oncology...",
  "data_preview": {
    "columns": ["supplier", "total_value_inr", "total_quantity_inr", "avg_price_inr"],
    "rows": [
      {
        "supplier": "FRESENIUS KABI DEUTSCHLAND GMBH",
        "total_value_inr": 2285555286,
        "total_quantity_inr": 2871509,
        "avg_price_inr": 829.66
      }
    ],
    "elapsed_ms": 225
  },
  "sql": "SELECT supplier, SUM(value_inr) AS total_value_inr...",
  "latency_ms": 12255,
  "clarify": null
}
```

### Clarification Response Example
```json
{
  "answer": "Do you want to calculate the growth rate based on total value or total quantity?",
  "data_preview": {
    "columns": [],
    "rows": []
  },
  "sql": null,
  "latency_ms": 1645,
  "clarify": {
    "question": "Do you want to calculate the growth rate based on total value or total quantity?",
    "options": [
      "Total Value",
      "Total Quantity"
    ]
  }
}
```

## Technical Details

### File Structure
- `script.js`: Main JavaScript with API integration
- `styles.css`: Styling for data preview and clarification components
- `index.html`: HTML structure with configuration panel

### Key Functions
- `generateAthenaResponse()`: Makes API calls
- `createDataPreviewHtml()`: Renders data tables
- `createClarificationHtml()`: Renders clarification options
- `sendClarificationResponse()`: Handles clarification follow-ups
- `toggleConfig()`: Manages configuration panel

### CSS Classes
- `.data-preview`: Data table container
- `.clarification-section`: Clarification options container
- `.config-panel`: Configuration modal
- `.latency-indicator`: Response time display

## Browser Compatibility
- Modern browsers with ES6+ support
- Fetch API support required
- localStorage for configuration persistence
- CSS Grid and Flexbox support recommended
