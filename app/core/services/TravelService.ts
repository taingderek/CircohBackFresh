import { supabase } from './supabaseClient';
import { 
  Contact,
  TravelPlan, 
  TravelPlanCreateData, 
  TravelPlanUpdateData,
  TravelContactLink,
  TravelContactLinkCreateData
} from '../types/contact';
import { GeoCoordinates } from '../types/user';
import ContactService from './ContactService';

/**
 * Transforms a database travel plan to our TravelPlan type
 */
const transformTravelPlan = (raw: any): TravelPlan => {
  // Parse coordinates if they exist
  let coordinates: GeoCoordinates | null = null;
  if (raw.coordinates) {
    try {
      const pointString = raw.coordinates.toString();
      const match = pointString.match(/POINT\(([^ ]+) ([^)]+)\)/);
      if (match && match.length === 3) {
        coordinates = {
          longitude: parseFloat(match[1]),
          latitude: parseFloat(match[2])
        };
      }
    } catch (error) {
      console.error('Error parsing coordinates:', error);
    }
  }

  return {
    id: raw.id,
    userId: raw.user_id,
    title: raw.purpose || `Trip to ${raw.destination_city}`,
    destination: `${raw.destination_city}${raw.destination_state ? ', ' + raw.destination_state : ''}${raw.destination_country ? ', ' + raw.destination_country : ''}`,
    destination_coords: coordinates,
    start_date: new Date(raw.arrival_date),
    end_date: new Date(raw.departure_date),
    description: raw.notes,
    notify_contacts: raw.notify_friends || false,
    created_at: new Date(raw.created_at),
    updated_at: new Date(raw.updated_at)
  };
};

/**
 * Transforms a database travel contact link
 */
const transformTravelContactLink = (raw: any): TravelContactLink => {
  return {
    id: raw.id,
    travel_plan_id: raw.travel_plan_id,
    contact_id: raw.contact_id,
    notify: raw.notify || false,
    notified_at: raw.notified_at ? new Date(raw.notified_at) : null,
    created_at: new Date(raw.created_at)
  };
};

class TravelService {
  /**
   * Get all travel plans for the current user
   */
  async getTravelPlans(): Promise<TravelPlan[]> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .order('arrival_date', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map(transformTravelPlan);
    } catch (error) {
      console.error('Error fetching travel plans:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific travel plan by ID
   */
  async getTravelPlan(travelPlanId: string): Promise<TravelPlan | null> {
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', travelPlanId)
        .single();
        
      if (error) throw error;
      
      return data ? transformTravelPlan(data) : null;
    } catch (error) {
      console.error('Error fetching travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Create a new travel plan
   */
  async createTravelPlan(travelPlanData: TravelPlanCreateData): Promise<TravelPlan> {
    try {
      // Extract city, state, country from destination
      const { city, state, country } = this.parseDestination(travelPlanData.destination);
      
      // Transform to database format
      const dbTravelPlan: Record<string, any> = {
        destination_city: city,
        destination_state: state,
        destination_country: country,
        arrival_date: travelPlanData.start_date,
        departure_date: travelPlanData.end_date,
        purpose: travelPlanData.title,
        notes: travelPlanData.description,
        notify_friends: travelPlanData.notify_contacts !== undefined ? travelPlanData.notify_contacts : true,
        friends_notified: false
      };
      
      // Add coordinates if provided
      if (travelPlanData.destination_coords) {
        const { longitude, latitude } = travelPlanData.destination_coords;
        dbTravelPlan.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      const { data, error } = await supabase
        .from('travel_plans')
        .insert(dbTravelPlan)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelPlan(data);
    } catch (error) {
      console.error('Error creating travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing travel plan
   */
  async updateTravelPlan(travelPlanId: string, travelPlanData: TravelPlanUpdateData): Promise<TravelPlan> {
    try {
      // Transform to database format
      const dbTravelPlan: Record<string, any> = {};
      
      if (travelPlanData.title !== undefined) dbTravelPlan.purpose = travelPlanData.title;
      if (travelPlanData.description !== undefined) dbTravelPlan.notes = travelPlanData.description;
      if (travelPlanData.start_date !== undefined) dbTravelPlan.arrival_date = travelPlanData.start_date;
      if (travelPlanData.end_date !== undefined) dbTravelPlan.departure_date = travelPlanData.end_date;
      if (travelPlanData.notify_contacts !== undefined) dbTravelPlan.notify_friends = travelPlanData.notify_contacts;
      
      // Parse destination if provided
      if (travelPlanData.destination !== undefined) {
        const { city, state, country } = this.parseDestination(travelPlanData.destination);
        dbTravelPlan.destination_city = city;
        dbTravelPlan.destination_state = state;
        dbTravelPlan.destination_country = country;
      }
      
      // Update coordinates if provided
      if (travelPlanData.destination_coords) {
        const { longitude, latitude } = travelPlanData.destination_coords;
        dbTravelPlan.coordinates = `POINT(${longitude} ${latitude})`;
      }
      
      const { data, error } = await supabase
        .from('travel_plans')
        .update(dbTravelPlan)
        .eq('id', travelPlanId)
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelPlan(data);
    } catch (error) {
      console.error('Error updating travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Delete a travel plan
   */
  async deleteTravelPlan(travelPlanId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('travel_plans')
        .delete()
        .eq('id', travelPlanId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      throw error;
    }
  }
  
  /**
   * Parse a destination string into city, state, country
   */
  private parseDestination(destination: string): { city: string; state: string | null; country: string | null } {
    const parts = destination.split(',').map(part => part.trim());
    
    if (parts.length === 1) {
      return { city: parts[0], state: null, country: null };
    } else if (parts.length === 2) {
      return { city: parts[0], state: null, country: parts[1] };
    } else if (parts.length >= 3) {
      return { city: parts[0], state: parts[1], country: parts[2] };
    }
    
    return { city: destination, state: null, country: null };
  }
  
  /**
   * Get travel contact links for a travel plan
   */
  async getTravelContactLinks(travelPlanId: string): Promise<TravelContactLink[]> {
    try {
      const { data, error } = await supabase
        .from('travel_contact_links')
        .select('*')
        .eq('travel_plan_id', travelPlanId);
        
      if (error) throw error;
      
      return (data || []).map(transformTravelContactLink);
    } catch (error) {
      console.error('Error fetching travel contact links:', error);
      throw error;
    }
  }
  
  /**
   * Create a new travel contact link
   */
  async createTravelContactLink(linkData: TravelContactLinkCreateData): Promise<TravelContactLink> {
    try {
      const { data, error } = await supabase
        .from('travel_contact_links')
        .insert({
          travel_plan_id: linkData.travel_plan_id,
          contact_id: linkData.contact_id,
          notify: linkData.notify !== undefined ? linkData.notify : true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return transformTravelContactLink(data);
    } catch (error) {
      console.error('Error creating travel contact link:', error);
      throw error;
    }
  }
  
  /**
   * Delete a travel contact link
   */
  async deleteTravelContactLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('travel_contact_links')
        .delete()
        .eq('id', linkId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting travel contact link:', error);
      throw error;
    }
  }
  
  /**
   * Find contacts near a travel destination
   * @param travelPlanId The travel plan ID
   * @param radiusKm The radius in kilometers to search for contacts
   */
  async findContactsNearDestination(travelPlanId: string, radiusKm: number = 50): Promise<Array<{ contact: Contact, distanceKm: number }>> {
    try {
      // Get the travel plan
      const travelPlan = await this.getTravelPlan(travelPlanId);
      if (!travelPlan || !travelPlan.destination_coords) {
        throw new Error('Travel plan not found or has no coordinates');
      }
      
      // Get all contacts
      const contacts = await ContactService.getContacts();
      
      // Filter contacts that have coordinates
      const result: Array<{ contact: Contact, distanceKm: number }> = [];
      
      for (const contact of contacts) {
        if (contact.coordinates) {
          const distance = this.calculateDistance(
            travelPlan.destination_coords.latitude,
            travelPlan.destination_coords.longitude,
            contact.coordinates.latitude,
            contact.coordinates.longitude
          );
          
          if (distance <= radiusKm) {
            result.push({
              contact,
              distanceKm: distance
            });
          }
        }
      }
      
      // Sort by distance
      return result.sort((a, b) => a.distanceKm - b.distanceKm);
    } catch (error) {
      console.error('Error finding contacts near destination:', error);
      throw error;
    }
  }
  
  /**
   * Calculate the distance between two points in kilometers
   * Uses the Haversine formula
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export default new TravelService(); 