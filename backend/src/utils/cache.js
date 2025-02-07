class MemoryCache {
    constructor() {
      this.store = new Map();
    }
  
    set(key, value, ttl = 0) {
      this.store.set(key, { value, expires: ttl ? Date.now() + ttl : null });
    }
  
    get(key) {
      const entry = this.store.get(key);
      if (!entry) return null;
  
      // 检查是否过期
      if (entry.expires && Date.now() > entry.expires) {
        this.store.delete(key);
        return null;
      }
  
      return entry.value;
    }
  
    delete(key) {
      this.store.delete(key);
    }
  
    clear() {
      this.store.clear();
    }
  }
  
  export default MemoryCache;