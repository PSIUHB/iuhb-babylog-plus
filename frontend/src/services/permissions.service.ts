import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useFamilyStore } from '@/stores/family.store';

// Define the available permissions
export enum Permission {
  VIEW_CHILDREN = 'view_children',
  LOG_EVENTS = 'log_events',
  EDIT_CHILDREN = 'edit_children',
  VIEW_REPORTS = 'view_reports',
  MANAGE_FAMILY = 'manage_family',
  INVITE_CAREGIVERS = 'invite_caregivers'
}

class PermissionsService {
  // Get the current user's permissions for the active family
  private getUserPermissions() {
    const authStore = useAuthStore();
    const familyStore = useFamilyStore();
    
    const user = authStore.user;
    const activeFamily = familyStore.currentFamily;
    
    console.log('DEBUG - getUserPermissions:', {
      user: user?.id,
      activeFamily: activeFamily?.id,
      userFamilies: activeFamily?.userFamilies
    });

    if (!user || !activeFamily) {
      console.log('No user or active family found for permissions');
      return [];
    }
    
    // Check if userFamilies exists and is not empty
    if (!activeFamily.userFamilies || activeFamily.userFamilies.length === 0) {
      console.warn('userFamilies is empty or undefined for family:', activeFamily.id);
      // Don't assume parent role - return empty permissions to force proper data loading
      return [];
    }

    // Find the user's role in the active family
    const userFamily = activeFamily.userFamilies.find(
      (uf: any) => uf.userId === user.id || (uf.user && uf.user.id === user.id)
    );
    
    console.log('DEBUG - Found userFamily:', userFamily);

    if (!userFamily) {
      console.warn('User not found in userFamilies for family:', activeFamily.id, 'user:', user.id);
      return [];
    }
    
    const permissions = this.getPermissionsFromRole(userFamily.role);
    console.log('DEBUG - Permissions for role', userFamily.role, ':', permissions);

    return permissions;
  }
  
  // Map roles to permissions
  getPermissionsFromRole(role: string): string[] {
    switch (role) {
      case 'parent':
        // Parent has every permission for the family
        return [
          Permission.VIEW_CHILDREN,
          Permission.LOG_EVENTS,
          Permission.EDIT_CHILDREN,
          Permission.VIEW_REPORTS,
          Permission.MANAGE_FAMILY,
          Permission.INVITE_CAREGIVERS
        ];
      case 'caregiver':
        // Caregiver has limited permissions
        return [
          Permission.VIEW_CHILDREN,
          Permission.LOG_EVENTS,
          Permission.VIEW_REPORTS
        ];
      default:
        return [Permission.VIEW_CHILDREN];
    }
  }
  
  // Check if the user has a specific permission
  hasPermission(permission: Permission): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission);
  }
  
  // Check if the user has all of the specified permissions
  hasPermissions(permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.every(permission => userPermissions.includes(permission));
  }
  
  // Check if the user has any of the specified permissions
  hasAnyPermission(permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }
}

// Create a singleton instance
const permissionsService = new PermissionsService();

// Export a composable function to use in Vue components
export function usePermissions() {
  const authStore = useAuthStore();
  const familyStore = useFamilyStore();
  
  // Get the current user's permissions for the active family
  const getUserPermissions = () => {
    const user = authStore.user;
    const activeFamily = familyStore.currentFamily;
    
    if (!user || !activeFamily) {
      return [];
    }
    
    // Find the user's role in the active family
    const userFamily = activeFamily.userFamilies?.find(
      (uf: any) => uf.userId === user.id || (uf.user && uf.user.id === user.id)
    );
    
    if (!userFamily) {
      return [];
    }
    
    // Directly use the role-to-permissions mapping here instead of calling the service method
    // This ensures we're not dealing with any potential issues with method access
    let permissions: string[] = [];
    
    switch (userFamily.role) {
      case 'parent':
        // Parent has every permission for the family
        permissions = [
          Permission.VIEW_CHILDREN,
          Permission.LOG_EVENTS,
          Permission.EDIT_CHILDREN,
          Permission.VIEW_REPORTS,
          Permission.MANAGE_FAMILY,
          Permission.INVITE_CAREGIVERS
        ];
        break;
      case 'caregiver':
        // Caregiver has limited permissions
        permissions = [
          Permission.VIEW_CHILDREN,
          Permission.LOG_EVENTS,
          Permission.VIEW_REPORTS
        ];
        break;
      default:
        permissions = [Permission.VIEW_CHILDREN];
    }
    
    return permissions;
  };
  
  // Reactive permissions that update when the store changes
  const permissions = computed(() => getUserPermissions());
  
  // Check if the user has a specific permission
  const hasPermission = (permission: Permission) => {
    console.log(permissions, permission);
    // Check the computed permissions based on user's role
    return permissions.value.includes(permission);
  };
  
  // Check if the user has all of the specified permissions
  const hasPermissions = (requiredPermissions: Permission[]) => {
    // Check if the user has all the required permissions based on their role
    return requiredPermissions.every(permission => 
      permissions.value.includes(permission)
    );
  };
  
  // Check if the user has any of the specified permissions
  const hasAnyPermission = (requiredPermissions: Permission[]) => {
    // Check if the user has any of the required permissions based on their role
    return requiredPermissions.some(permission => 
      permissions.value.includes(permission)
    );
  };
  
  return {
    permissions,
    hasPermission,
    hasPermissions,
    hasAnyPermission
  };
}

export default permissionsService;