import { ResourceType } from 'describe/resource';
import { SurfaceStoreType } from 'internals/stores/surface';

// collect a full picture of which resources and of what identities the surface is using
const readResourceRequirements =
  (snapshot: SurfaceStoreType) =>
  (): {
    Resource: ResourceType<any, any>;
    identity: any;
  }[] => {
    const requirements: {
      Resource: ResourceType<any, any>;
      identity: any;
    }[] = [];

    for (const { Resource, identity } of snapshot) {
      const existingRequirement = requirements.find(requirement => {
        if (Resource !== requirement.Resource) return false;
        if (!Resource.areIdentitiesEqual(identity, requirement.identity))
          return false;

        return true;
      });
      if (existingRequirement) continue;

      requirements.push({ Resource, identity });
    }

    return requirements;
  };

export default readResourceRequirements;
