export class SetUtils {
    static difference(setA: Set<any>, setB: Set<any>){
        const diff = new Set(setA);
        for (const item of setB){
            if(diff.has(item)){
                diff.delete(item);
            } else {
                diff.add(item);
            }
        }

        return diff;
    }

    static same(setA: Set<any>, setB: Set<any>){
        const diff = this.difference(setA, setB);
        return diff.size === 0;
    }

    static union(setA: Set<any>, setB: Set<any>){
        const un = new Set(setA);
        for (const item of setB) {
            un.add(item);
        }
        return un;
    }

    static intersection(setA: Set<any>, setB: Set<any>){
      const inter = new Set();
      for (const item of setB){
        if (setA.has(item)){
          inter.add(item);
        }
      }

      return inter;
    }
}