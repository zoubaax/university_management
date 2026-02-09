const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    RH: 'RH',
    RESPONSABLE_DEPARTMENT: 'RESPONSABLE_DEPARTMENT',
    DIRECTOR_DEPARTMENT: 'DIRECTOR_DEPARTMENT',
    SECRETARY: 'SECRETARY',
    PROFESSOR: 'PROFESSOR',
    STUDENT: 'STUDENT',
};

// Map of which role can create which other role/resource
const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: {
        canCreateRoles: [ROLES.RH],
        canManageResources: ['departments'],
    },
    [ROLES.RH]: {
        canCreateRoles: [
            ROLES.PROFESSOR,
            ROLES.DIRECTOR_DEPARTMENT,
            ROLES.SECRETARY,
        ],
        canManageResources: ['departments', 'employees'], // Employees includes cleaners/security
        canCreateEmployeeTypes: ['CLEANER', 'SECURITY', 'PROFESSOR', 'ADMINISTRATIVE'],
    },
    [ROLES.RESPONSABLE_DEPARTMENT]: {
        canCreateRoles: [ROLES.STUDENT],
        canManageResources: ['specialities', 'students'],
    },
};

/**
 * Check if a role can create another role
 * @param {string} creatorRole 
 * @param {string} targetRole 
 */
const canCreateRole = (creatorRole, targetRole) => {
    if (!PERMISSIONS[creatorRole]) return false;
    return PERMISSIONS[creatorRole].canCreateRoles.includes(targetRole);
};

/**
 * Check if a role can manage a resource
 * @param {string} role 
 * @param {string} resource 
 */
const canManageResource = (role, resource) => {
    if (!PERMISSIONS[role]) return false;
    return PERMISSIONS[role].canManageResources.includes(resource);
};

module.exports = {
    ROLES,
    PERMISSIONS,
    canCreateRole,
    canManageResource,
};
