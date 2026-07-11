/**
 * Lyzr AI Agent Integration Service
 */

const callLyzrAgent = async (message, userId, ngo) => {
  const apiKey = process.env.LYZR_API_KEY;
  const agentId = process.env.LYZR_AGENT_ID || '6a5161d8e94befedee3418aa';

  if (!apiKey) {
    console.warn("[LYZR SERVICE]: LYZR_API_KEY is not defined in environment variables.");
    throw new Error("Lyzr AI Agent integration is not configured. Missing API Key.");
  }

  try {
    const url = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
    
    // Prefix context details of the NGO for context-awareness
    let contextHeader = "";
    if (ngo) {
      contextHeader = `[NGO Profile Context: Name="${ngo.name || ''}", Category="${ngo.category || ''}", State="${ngo.state || ''}", District="${ngo.district || ''}", Founder="${ngo.founderName || ''}", Established=${ngo.yearEstablished || ''}, Annual Budget="${ngo.annualBudget || ''}", Funding Needed="${ngo.fundingNeeded || ''}"]\n`;
    }

    const fullMessage = `${contextHeader}User Query: ${message}`;

    const headers = {
      'accept': 'application/json',
      'x-api-key': apiKey,
      'content-type': 'application/json'
    };

    const body = {
      user_id: `user-${userId}`,
      agent_id: agentId,
      session_id: `session-${userId}`, // Context history session ID
      message: fullMessage
    };

    console.log(`[LYZR SERVICE]: Sending chat request to Lyzr Agent (${agentId}) for user ${userId}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Lyzr API error: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    console.log("[LYZR SERVICE]: Response received successfully from Lyzr Agent.");
    return data.response;
  } catch (error) {
    console.error("[LYZR SERVICE]: API call failed:", error.message);
    throw error;
  }
};

module.exports = {
  callLyzrAgent
};
