// VM Traders - Frontend Data Layer (replaces all backend dependencies)

// 1. Initial Product Data
const initialGroceryProducts = [
    { id: 'g1', name: 'Fresh Milk', category: 'Dairy Products', price: 50, unit: '1 litre', image: 'assets/images/products/milk.png' },
    { id: 'g2', name: 'Premium Curd', category: 'Dairy Products', price: 30, unit: '500 ml', image: 'assets/images/products/dairy.png' },
    { id: 'g3', name: 'Salted Butter', category: 'Dairy Products', price: 55, unit: '100 g', image: 'assets/images/products/dairy.png' },
    { id: 'g4', name: 'Fresh Paneer', category: 'Dairy Products', price: 90, unit: '200 g', image: 'assets/images/products/milk.png' },
    { id: 'g5', name: 'Cheese Slices', category: 'Dairy Products', price: 120, unit: 'pack', image: 'assets/images/products/dairy.png' },
    
    { id: 'v1', name: 'Fresh Tomatoes', category: 'Vegetables', price: 40, unit: '1 kg', image: 'assets/images/products/vegetables.png' },
    { id: 'v2', name: 'Organic Broccoli', category: 'Vegetables', price: 80, unit: '500 g', image: 'assets/images/products/vegetables.png' },
    { id: 'v3', name: 'Bell Peppers', category: 'Vegetables', price: 100, unit: '500 g', image: 'assets/images/products/vegetables.png' },
    { id: 'v4', name: 'Onions', category: 'Vegetables', price: 35, unit: '1 kg', image: 'assets/images/products/vegetables.png' },
    
    { id: 'f1', name: 'Fresh Apples', category: 'Fruits', price: 120, unit: '1 kg', image: 'assets/images/products/fruits.png' },
    { id: 'f2', name: 'Sweet Oranges', category: 'Fruits', price: 90, unit: '1 kg', image: 'assets/images/products/fruits.png' },
    { id: 'f3', name: 'Green Grapes', category: 'Fruits', price: 70, unit: '500 g', image: 'assets/images/products/fruits.png' },
    
    { id: 'g6', name: 'Basmati Rice', category: 'Packaged Staples', price: 300, unit: '5 kg bag', image: 'assets/images/products/rice.png' },
    { id: 'g7', name: 'Wheat Flour', category: 'Packaged Staples', price: 250, unit: '5 kg', image: 'assets/images/products/rice.png' },
    { id: 'g8', name: 'Pure Sugar', category: 'Packaged Staples', price: 45, unit: '1 kg', image: 'assets/images/products/rice.png' },
    { id: 'g12', name: 'Refined Oil', category: 'Packaged Staples', price: 140, unit: '1 litre', image: 'assets/images/products/rice.png' },
    
    { id: 'g13', name: 'Premium Bread', category: 'Snacks & Packaged Foods', price: 40, unit: '1 pack', image: 'assets/images/products/snacks.png' },
    { id: 'g14', name: 'Chocolate Cookies', category: 'Snacks & Packaged Foods', price: 25, unit: 'packet', image: 'assets/images/products/snacks.png' },
    { id: 'g16', name: 'Potato Chips', category: 'Snacks & Packaged Foods', price: 20, unit: 'packet', image: 'assets/images/products/snacks.png' },
    
    { id: 'g18', name: 'Assorted Tea Powder', category: 'Beverages', price: 120, unit: '250 g', image: 'assets/images/products/juice.png' },
    { id: 'g20', name: 'Orange Juice', category: 'Beverages', price: 60, unit: '1 litre', image: 'assets/images/products/juice.png' },
    { id: 'g21', name: 'Mineral Water', category: 'Beverages', price: 20, unit: '1 litre', image: 'assets/images/products/juice.png' },
    
    { id: 'g22', name: 'Dishwashing Liquid', category: 'Household Essentials', price: 110, unit: '500 ml', image: 'assets/images/products/household.png' },
    { id: 'g24', name: 'Clean Shampoo', category: 'Household Essentials', price: 120, unit: '200 ml', image: 'assets/images/products/household.png' }
];

// Force update version to refresh DataLayer
localStorage.setItem('groceryProducts_v5', JSON.stringify(initialGroceryProducts));

// 3. Helper Functions
const DataLayer = {
    getProducts: () => JSON.parse(localStorage.getItem('groceryProducts_v5') || '[]'),
    saveProducts: (products) => localStorage.setItem('groceryProducts_v5', JSON.stringify(products)),
    
    getOrders: () => JSON.parse(localStorage.getItem('orders') || '[]'),
    saveOrders: (orders) => localStorage.setItem('orders', JSON.stringify(orders)),
    
    getUsers: () => JSON.parse(localStorage.getItem('users') || '[]'),
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    logout: () => localStorage.removeItem('currentUser')
};

// Global Exposure (for legacy script compatibility)
window.DataLayer = DataLayer;
console.log("VM Traders: Data Layer Initialized (Fully Offline).");
