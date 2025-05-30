// Claude (Anthropic) integration - currently disabled by default
import { MessageGenerationParams, MessageResult } from './AIService';

class ClaudeService {
  private API_URL = 'https://api.anthropic.com/v1/messages';
  private API_KEY = process.env.ANTHROPIC_API_KEY || '';
  private MODEL = 'claude-3-opus-20240229'; // Use latest or update as needed

  // Mirror the OpenAI interface
  public async generateMessage(params: MessageGenerationParams): Promise<MessageResult> {
    // Stub: Not active yet
    return {
      message: '[Claude integration is currently disabled. Using OpenAI instead.]',
      success: false,
      quotaRemaining: 0
    };
  }
}

export const claudeService = new ClaudeService();
export default ClaudeService; 