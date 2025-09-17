# CORS Troubleshooting Guide

## ✅ CORS Issue Fixed!

The CORS error has been resolved by adding proper CORS middleware to the athena-orchestrator server.

## What Was Fixed

### 1. **Backend CORS Configuration**
- Added `CORSMiddleware` to FastAPI app
- Configured to allow all origins in development (`*`)
- Enabled all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Allowed all headers

### 2. **Frontend Error Handling**
- Better error messages for CORS issues
- Network error detection
- Connection testing functionality

### 3. **Connection Testing**
- Added "Test Connection" button in configuration panel
- Real-time connection status feedback
- Detailed error messages for troubleshooting

## How to Use

### 1. **Start the Server**
```bash
cd athena-orchestrator
./restart_server.sh
```

Or manually:
```bash
cd athena-orchestrator
python app_mysql_stateful_clarify_routed.py
```

### 2. **Test the Connection**
1. Open the frontend in your browser
2. Click the settings button (⚙️) in the input footer
3. Click "Test Connection" to verify the API is reachable
4. You should see "✅ Connection successful!"

### 3. **Verify CORS is Working**
- Open browser developer tools (F12)
- Go to Network tab
- Send a message in the chat
- Check that the request to `/chat` succeeds without CORS errors

## CORS Configuration Details

The server now includes this CORS configuration:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:8080",  # Vue dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080", 
        "http://127.0.0.1:5173",
        "file://",  # For local file serving
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

## Common Issues & Solutions

### Issue: "CORS Error: Unable to connect to the API"
**Solution**: 
1. Make sure the athena-orchestrator server is running
2. Check the API URL in the configuration panel
3. Use the "Test Connection" button to verify

### Issue: "Network Error: Unable to reach the API server"
**Solution**:
1. Verify the server is running on the correct port (default: 8000)
2. Check if the URL is correct (should be `http://localhost:8000`)
3. Ensure no firewall is blocking the connection

### Issue: "Connection failed: 404 Not Found"
**Solution**:
1. Make sure you're using the correct API URL
2. The health endpoint should be at `/healthz`
3. The chat endpoint should be at `/chat`

### Issue: "Connection failed: 500 Internal Server Error"
**Solution**:
1. Check the server logs for detailed error information
2. Verify database connection is working
3. Ensure all environment variables are set correctly

## Testing the Fix

### 1. **Health Check**
```bash
curl http://localhost:8000/healthz
```
Should return: `{"status": "ok", "database": "connected"}`

### 2. **CORS Preflight Test**
```bash
curl -X OPTIONS http://localhost:8000/chat \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 3. **Frontend Test**
1. Open the frontend
2. Click settings (⚙️)
3. Click "Test Connection"
4. Should show "✅ Connection successful!"

## Production Considerations

For production deployment, you should:

1. **Restrict Origins**: Replace `"*"` with specific allowed origins
2. **Use HTTPS**: Ensure both frontend and backend use HTTPS
3. **Environment Variables**: Use environment variables for CORS configuration

Example production CORS config:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "https://www.your-frontend-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## Server URLs

- **API Server**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/healthz
- **Chat Endpoint**: http://localhost:8000/chat

The CORS issue should now be completely resolved! 🎉
