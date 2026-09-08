// Product data for the Vijayawada Pure Ghee Store
const products = [
    {
        id: "amrutha-cow-ghee",
        name: "AMRUTHA COW GHEE",
        subtitle: "Pure Tradition. Rich Taste. Natural Goodness.",
        description: "AMRUTHA COW GHEE is a traditionally crafted clarified butter made from cow’s milk. With its rich aroma, golden texture, and authentic taste, it is perfect for everyday cooking, sweets, rice, chapati, and traditional Indian recipes.",
        benefits: [
            "Provides energy as a concentrated source of fat",
            "Contains fat-soluble vitamins such as vitamins A, D, E and K, depending on the ghee",
            "Can be included in a balanced diet in appropriate portions",
            "Adds rich flavor and texture to everyday meals",
            "Suitable for traditional Indian cooking and recipes"
        ],
        image: "amrutha-cow-ghee.jpg",
        features: ["100% Pure Cow Ghee", "Traditional Preparation", "Rich Aroma & Taste", "No Added Preservatives", "Natural Goodness", "Premium Quality"],
        sizes: [
            { size: "250ml", price: 180 },
            { size: "500ml", price: 340 },
            { size: "1 Litre", price: 650 },
            { size: "2 Litre", price: 1250 }
        ],
        defaultSizeIndex: 1 // Default to 500ml
    },
    {
        id: "amrutha-buffalo-ghee",
        name: "AMRUTHA BUFFALO GHEE",
        subtitle: "Pure & Natural — Rich Taste, Traditional Goodness",
        description: "AMRUTHA BUFFALO GHEE is traditionally prepared from rich buffalo milk and crafted using the traditional Bilona method. Its golden color, rich aroma, and smooth texture make it an excellent choice for everyday cooking, sweets, rice, chapati, and authentic Indian recipes.",
        benefits: [
            "Provides energy as a concentrated source of fat",
            "Contains fat-soluble vitamins, depending on the product and processing",
            "Adds flavor and richness to everyday meals",
            "Can be included in a balanced diet in appropriate portions",
            "Useful for traditional Indian cooking and recipes"
        ],
        image: "amrutha-buffalo-ghee.jpg",
        features: ["100% Pure & Natural", "Traditional Bilona Method", "Rich Aroma", "Great Taste", "Premium Quality", "Traditionally Crafted"],
        sizes: [
            { size: "250ml", price: 180 },
            { size: "500ml", price: 340 },
            { size: "1 Litre", price: 650 },
            { size: "2 Litre", price: 1250 }
        ],
        defaultSizeIndex: 1 // Default to 500ml
    }
];

// Export to window object for browser access
if (typeof window !== 'undefined') {
    window.gheeProducts = products;
}
