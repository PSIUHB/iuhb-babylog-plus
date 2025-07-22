import { defineStore } from 'pinia';
import familiesService from '../services/families.service';
import websocketService from '../services/websocket.service';
import { useAuthStore } from './auth.store';

interface FamilyState {
  families: any[];
  currentFamily: any | null;
  loading: boolean;
  error: string | null;
}

export const useFamilyStore = defineStore('family', {
  state: (): FamilyState => ({
    families: [],
    currentFamily: null,
    loading: false,
    error: null,
  }),

  getters: {
    getCurrentFamily: (state) => state.currentFamily,
    getCurrentFamilyId: (state) => state.currentFamily?.id,
    getFamilies: (state) => state.families,
  },

  actions: {
    // Reset the store state
    reset() {
      this.families = [];
      this.currentFamily = null;
      this.loading = false;
      this.error = null;
    },

    async fetchFamilies() {
      this.loading = true;
      this.error = null;

      try {
        const response = await familiesService.getFamilies();

        // Store the families data
        this.families = response;

        // If there's no current family but we have families, load the first one with full details
        if (!this.currentFamily && response.length > 0) {
          await this.setCurrentFamilyById(response[0].id);
        }

        return response;
      } catch (error) {
        console.error('Error fetching families:', error);

        // Set proper error message based on error type
        if (error instanceof Error) {
          this.error = error.message;
        } else if (typeof error === 'string') {
          this.error = error;
        } else {
          this.error = 'Failed to fetch families. Please check your connection and try again.';
        }

        // Clear families data on error
        this.families = [];
        this.currentFamily = null;

        throw error; // Re-throw so components can handle it
      } finally {
        this.loading = false;
      }
    },

    // Add a new method to set current family by ID and load full details
    async setCurrentFamilyById(familyId: string) {
      this.loading = true;
      try {
        const familyWithDetails = await familiesService.getFamily(familyId);
        console.log('DEBUG - Loaded family with details:', familyWithDetails);
        this.currentFamily = familyWithDetails;
        return familyWithDetails;
      } catch (error) {
        console.error('Error loading family details:', error);
        // Keep the basic family info if detailed loading fails
        const basicFamily = this.families.find(f => f.id === familyId);
        if (basicFamily) {
          this.currentFamily = basicFamily;
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchFamily(familyId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await familiesService.getFamily(familyId);
        this.currentFamily = response;
        return response;
      } catch (error) {
        console.error('Error fetching family:', error);

        // Set proper error message
        if (error instanceof Error) {
          this.error = error.message;
        } else if (typeof error === 'string') {
          this.error = error;
        } else {
          this.error = 'Failed to fetch family details. Please check your connection and try again.';
        }

        throw error; // Re-throw so components can handle it
      } finally {
        this.loading = false;
      }
    },

    setCurrentFamily(family: any) {
      this.currentFamily = family;
    },

    // Create a new family
    async createFamily(familyData: { name: string }) {
      this.loading = true;
      this.error = null;

      try {
        const response = await familiesService.createFamily(familyData);

        // Add the new family to the families array
        this.families.push(response);

        // Set the new family as the current family
        this.currentFamily = response;

        return response;
      } catch (error) {
        console.error('Error creating family:', error);
        this.error = error instanceof Error ? error.message : 'Failed to create family';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Join a family using an invite code or invitation token
    async joinFamily(code: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await familiesService.joinFamily(code);

        // Refresh families after joining
        await this.fetchFamilies();

        return response;
      } catch (error) {
        console.error('Error joining family:', error);
        this.error = error instanceof Error ? error.message : 'Failed to join family';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Accept a family invitation
    async acceptInvitation(invitationId: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await familiesService.acceptInvitation(invitationId);

        // Refresh families after accepting invitation
        await this.fetchFamilies();

        return response;
      } catch (error) {
        console.error('Error accepting invitation:', error);
        this.error = error instanceof Error ? error.message : 'Failed to accept invitation';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Initialize family state
    async init() {
      try {
        await this.fetchFamilies();
        
        // Connect to WebSocket and set up event handlers
        await this.setupWebSocketConnection();
      } catch (error) {
        console.error('Error initializing family store:', error);
        // Error is already handled in fetchFamilies, no need to do anything here
      }
    },
    
    // Set up WebSocket connection and event handlers
    async setupWebSocketConnection() {
      try {
        // Connect to WebSocket server
        await websocketService.connect();
        
        // Set up event handlers for family events
        websocketService.on('family.updated', this.handleFamilyUpdated.bind(this));
        websocketService.on('family.member.joined', this.handleFamilyMemberJoined.bind(this));
        websocketService.on('family.member.left', this.handleFamilyMemberLeft.bind(this));
        websocketService.on('family.member.updated', this.handleFamilyMemberUpdated.bind(this));
        websocketService.on('family.member.removed', this.handleFamilyMemberRemoved.bind(this));
        
        // Set up event handlers for child events
        websocketService.on('child.created', this.handleChildCreated.bind(this));
        websocketService.on('child.updated', this.handleChildUpdated.bind(this));
        
        // Set up event handlers for trackable events
        websocketService.on('trackable.created', this.handleTrackableCreated.bind(this));
        websocketService.on('trackable.updated', this.handleTrackableUpdated.bind(this));
        websocketService.on('trackable.deleted', this.handleTrackableDeleted.bind(this));
        
        // Set up event handlers for event events
        websocketService.on('event.created', this.handleEventCreated.bind(this));
        websocketService.on('event.milestone.deleted', this.handleEventMilestoneDeleted.bind(this));
        
        console.log('WebSocket event handlers set up');
      } catch (error) {
        console.error('Error setting up WebSocket connection:', error);
      }
    },
    
    // Handle family updated event
    async handleFamilyUpdated(data: any) {
      console.log('Family updated event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
      
      // Refresh the families list
      await this.fetchFamilies();
    },
    
    // Handle family member joined event
    async handleFamilyMemberJoined(data: any) {
      console.log('Family member joined event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle family member left event
    async handleFamilyMemberLeft(data: any) {
      console.log('Family member left event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle family member updated event
    async handleFamilyMemberUpdated(data: any) {
      console.log('Family member updated event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle family member removed event
    async handleFamilyMemberRemoved(data: any) {
      console.log('Family member removed event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle child created event
    async handleChildCreated(data: any) {
      console.log('Child created event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle child updated event
    async handleChildUpdated(data: any) {
      console.log('Child updated event received:', data);
      
      // If this is the current family, refresh it
      if (this.currentFamily && this.currentFamily.id === data.familyId) {
        await this.fetchFamily(data.familyId);
      }
    },
    
    // Handle trackable created event
    async handleTrackableCreated(data: any) {
      console.log('Trackable created event received:', data);
      
      // If this is the current family and we have the child in the current family, refresh the family
      if (this.currentFamily) {
        const childInFamily = this.currentFamily.children?.some(child => child.id === data.childId);
        if (childInFamily) {
          await this.fetchFamily(this.currentFamily.id);
        }
      }
    },
    
    // Handle trackable updated event
    async handleTrackableUpdated(data: any) {
      console.log('Trackable updated event received:', data);
      
      // If this is the current family and we have the child in the current family, refresh the family
      if (this.currentFamily) {
        const childInFamily = this.currentFamily.children?.some(child => child.id === data.childId);
        if (childInFamily) {
          await this.fetchFamily(this.currentFamily.id);
        }
      }
    },
    
    // Handle trackable deleted event
    async handleTrackableDeleted(data: any) {
      console.log('Trackable deleted event received:', data);
      
      // If this is the current family and we have the child in the current family, refresh the family
      if (this.currentFamily) {
        const childInFamily = this.currentFamily.children?.some(child => child.id === data.childId);
        if (childInFamily) {
          await this.fetchFamily(this.currentFamily.id);
        }
      }
    },
    
    // Handle event created event
    async handleEventCreated(data: any) {
      console.log('Event created event received:', data);
      
      // If this is the current family and we have the child in the current family, refresh the family
      if (this.currentFamily) {
        const childInFamily = this.currentFamily.children?.some(child => child.id === data.child.id);
        if (childInFamily) {
          await this.fetchFamily(this.currentFamily.id);
        }
      }
    },
    
    // Handle event milestone deleted event
    async handleEventMilestoneDeleted(data: any) {
      console.log('Event milestone deleted event received:', data);
      
      // If this is the current family and we have the child in the current family, refresh the family
      if (this.currentFamily) {
        const childInFamily = this.currentFamily.children?.some(child => child.id === data.child.id);
        if (childInFamily) {
          await this.fetchFamily(this.currentFamily.id);
        }
      }
    }
  }
});
