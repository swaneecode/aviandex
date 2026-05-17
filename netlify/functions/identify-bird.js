exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: 'API key not configured. Add ANTHROPIC_API_KEY to Netlify environment variables.' }) 
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: parsed.messages,
      }),
    });

    const responseText = await res.text();
    
    if (!res.ok) {
      return { 
        statusCode: res.status, 
        headers, 
        body: JSON.stringify({ error: `Anthropic API error ${res.status}: ${responseText}` }) 
      };
    }

    return { statusCode: 200, headers, body: responseText };

  } catch (err) {
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: `Function error: ${err.message}` }) 
    };
  }
};
