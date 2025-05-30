import { supabase } from '../services/supabaseClient';

export type Memory = {
  id: string;
  contact_id: string;
  user_id: string;
  content: string;
  memory_type: 'note' | 'event' | 'preference' | 'milestone' | 'other';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type NewMemory = Omit<Memory, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

class MemoryService {
  /**
   * Get all memories for a contact
   */
  async getMemoriesForContact(contactId: string): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories:', error);
      throw error;
    }

    return data as Memory[];
  }

  /**
   * Get a single memory by ID
   */
  async getMemoryById(id: string): Promise<Memory | null> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching memory:', error);
      throw error;
    }

    return data as Memory;
  }

  /**
   * Create a new memory
   */
  async createMemory(memory: NewMemory): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .insert([memory])
      .select()
      .single();

    if (error) {
      console.error('Error creating memory:', error);
      throw error;
    }

    return data as Memory;
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory> {
    const { data, error } = await supabase
      .from('memories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating memory:', error);
      throw error;
    }

    return data as Memory;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  /**
   * Toggle pin status of a memory
   */
  async togglePinStatus(id: string, currentStatus: boolean): Promise<Memory> {
    return this.updateMemory(id, { is_pinned: !currentStatus });
  }

  /**
   * Get all pinned memories for a contact
   */
  async getPinnedMemories(contactId: string): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('contact_id', contactId)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pinned memories:', error);
      throw error;
    }

    return data as Memory[];
  }

  /**
   * Search memories by content
   */
  async searchMemories(query: string): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching memories:', error);
      throw error;
    }

    return data as Memory[];
  }

  /**
   * Get memories by type
   */
  async getMemoriesByType(type: Memory['memory_type']): Promise<Memory[]> {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('memory_type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memories by type:', error);
      throw error;
    }

    return data as Memory[];
  }

  /**
   * Generate a memory summary for a contact
   */
  async generateMemorySummary(contactId: string): Promise<string> {
    const memories = await this.getMemoriesForContact(contactId);
    
    if (memories.length === 0) {
      return "No memories recorded yet.";
    }
    
    // Create a simple summary from the most recent memories
    const recentMemories = memories.slice(0, 5);
    const pinnedMemories = memories.filter(m => m.is_pinned);
    
    let summary = "";
    
    if (pinnedMemories.length > 0) {
      summary += "Important details:\n";
      pinnedMemories.forEach(m => {
        summary += `• ${m.content}\n`;
      });
      summary += "\n";
    }
    
    if (recentMemories.length > 0) {
      summary += "Recent memories:\n";
      recentMemories.forEach(m => {
        const memoryDate = new Date(m.created_at).toLocaleDateString();
        summary += `• ${memoryDate}: ${m.content}\n`;
      });
    }
    
    return summary;
  }
}

export const memoryService = new MemoryService();
export default memoryService; 