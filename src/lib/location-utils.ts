export function findLocationPath(data: any[], targetId: number): any[] | null {
  for (const item of data) {
    // If this is the one, start the path array
    if (item.id === targetId) {
      return [item];
    }
    
    // If it has children, search deeper
    if (item.cities && item.cities.length > 0) {
      const childPath = findLocationPath(item.cities, targetId);
      if (childPath) {
        // If found in children, prepend the current item to the path
        return [item, ...childPath];
      }
    }
  }
  return null;
}