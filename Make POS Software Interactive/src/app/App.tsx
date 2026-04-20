import { useState, useRef, useEffect } from "react";
import svgPaths from "../imports/svg-8zk14c26q8";
import svgPathsDiscount from "../imports/svg-a7cqc683xl";
import svgPathsKeyboard from "../imports/svg-lmr7gq38z6";
import svgPathsPayment from "../imports/svg-uo8btnt26d";
import svgPathsMulti from "../imports/svg-ofjprozyzn";
import EmptyBag from "../imports/EmptyBag";
import NewSale from "../imports/NewSale";
import imgDownload12 from "figma:asset/05c46adedb8e868fcf843338c9d0febcdbc25929.png";
import AddProduct from "./components/AddProduct";

// Product type
interface Product {
  id: string;
  name: string;
  code: string;
  barcode: string;
  batchNo: string;
  unit: string;
  price: number;
  stock: number;
}

// Cart item type
interface CartItem extends Product {
  quantity: number;
  discount: number;
  charge: number;
  tax: number;
}

// Customer type
interface Customer {
  name: string;
  phone: string;
  points: number;
  dueAmount: number;
  pointsExpiry: number;
}

// Coupon type
interface Coupon {
  id: string;
  code: string;
  percentage: number;
  description: string;
  minPurchase: number;
  color: string;
  disabled?: boolean;
}


// Sample products database
const sampleProducts: Product[] = [
  { id: "1", name: "Paracetamol 500mg", code: "MED001", barcode: "8901234567890", batchNo: "B12345", unit: "Tablet", price: 5, stock: 100 },
  { id: "2", name: "Amoxicillin 250mg", code: "MED002", barcode: "8901234567891", batchNo: "B12346", unit: "Capsule", price: 12, stock: 50 },
  { id: "3", name: "Cough Syrup", code: "MED003", barcode: "8901234567892", batchNo: "B12347", unit: "Bottle", price: 75, stock: 30 },
  { id: "4", name: "Vitamin C 1000mg", code: "MED004", barcode: "8901234567893", batchNo: "B12348", unit: "Tablet", price: 8, stock: 200 },
  { id: "5", name: "Band-Aid Pack", code: "MED005", barcode: "8901234567894", batchNo: "B12349", unit: "Pack", price: 25, stock: 75 },
  { id: "6", name: "Aspirin 100mg", code: "MED006", barcode: "8901234567895", batchNo: "B12350", unit: "Tablet", price: 4, stock: 150 },
  { id: "7", name: "Antiseptic Cream", code: "MED007", barcode: "8901234567896", batchNo: "B12351", unit: "Tube", price: 45, stock: 40 },
  { id: "8", name: "Thermometer Digital", code: "MED008", barcode: "8901234567897", batchNo: "B12352", unit: "Piece", price: 150, stock: 20 },
];

export default function App() {
  const [currentView, setCurrentView] = useState<"pos" | "inventory">("pos");
  const [searchQuery, setSearchQuery] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerInput, setCustomerInput] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>(sampleProducts);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showChargesModal, setShowChargesModal] = useState(false);
  const [chargeInput, setChargeInput] = useState("0");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [keypadPosition, setKeypadPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [discountPosition, setDiscountPosition] = useState({ x: 0, y: 0 });
  const [isDraggingDiscount, setIsDraggingDiscount] = useState(false);
  const [discountDragOffset, setDiscountDragOffset] = useState({ x: 0, y: 0 });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentPosition, setPaymentPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPayment, setIsDraggingPayment] = useState(false);
  const [paymentDragOffset, setPaymentDragOffset] = useState({ x: 0, y: 0 });
  const [splitPayments, setSplitPayments] = useState<Array<{ method: string; amount: number }>>([]);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showMultiSalespersonModal, setShowMultiSalespersonModal] = useState(false);
  const [salespersonAssignments, setSalespersonAssignments] = useState<Record<string, string>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount and when view changes
  useEffect(() => {
    if (currentView === "pos" && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [currentView]);

  // Keep search input focused
  useEffect(() => {
    const handleGlobalClick = () => {
      if (currentView === "pos" && searchInputRef.current) {
        // Only focus if not interacting with other inputs or modals
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT' && !showDiscountModal && !showChargesModal && !showPaymentModal && !showNewSaleModal && !showMultiSalespersonModal) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [currentView, showDiscountModal, showChargesModal, showPaymentModal, showNewSaleModal, showMultiSalespersonModal]);

  // Available coupons
  const availableCoupons: Coupon[] = [
    { id: "1", code: "NEW50", percentage: 50, description: "50%off on Minimum Purchase of 999", minPurchase: 999, color: "#00c80d" },
    { id: "2", code: "SAVE30", percentage: 30, description: "30%off on Minimum Purchase of 499", minPurchase: 499, color: "#0085c8" },
    { id: "3", code: "FLAT20", percentage: 20, description: "20%off on Minimum Purchase of 299", minPurchase: 299, color: "#e2e2e2", disabled: true },
    { id: "4", code: "GET10", percentage: 10, description: "10%off on Minimum Purchase of 99", minPurchase: 99, color: "#e2e2e2", disabled: true },
  ];

  // Filter products based on search
  const filteredProducts = inventoryProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add product to cart
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [
          ...prev,
          { ...product, quantity: 1, discount: 0, charge: 0, tax: 5 },
        ];
      }
    });
    setSearchQuery("");
    setShowProductDropdown(false);
  };

  // Update cart item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.id !== id));
    } else {
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  // Remove selected items
  const removeSelectedItems = () => {
    setCartItems(cartItems.filter((item) => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  // Toggle item selection
  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle customer selection
  const handleCustomerInput = (value: string) => {
    setCustomerInput(value);
    // Simulate finding customer
    if (value.length > 3) {
      // Mock customer data
      setCustomer({
        name: "Jenbhai Ooaa",
        phone: "98*72 17283",
        points: 13,
        dueAmount: 2500,
        pointsExpiry: 23,
      });
    }
  };

  // Apply coupon
  const handleApplyCoupon = (coupon: Coupon) => {
    if (!coupon.disabled && subtotal >= coupon.minPurchase) {
      setAppliedCoupon(coupon);
      setShowDiscountModal(false);
    }
  };

  // Handle number keyboard input
  const handleKeypadInput = (value: string) => {
    if (value === "backspace") {
      setChargeInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else if (value === "esc") {
      setChargeInput("0");
      setShowChargesModal(false);
    } else if (value === "enter") {
      const amount = parseFloat(chargeInput);
      if (!isNaN(amount) && amount > 0) {
        setDeliveryCharge(amount);
      }
      setChargeInput("0");
      setShowChargesModal(false);
    } else if (value === ".") {
      if (!chargeInput.includes(".")) {
        setChargeInput((prev) => prev + ".");
      }
    } else if (value === "-") {
      if (chargeInput === "0") {
        setChargeInput("-");
      }
    } else {
      // Number input
      setChargeInput((prev) => (prev === "0" ? value : prev + value));
    }
  };

  // Calculate totals
  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.price * item.quantity;
    const afterDiscount = subtotal - item.discount;
    const afterCharge = afterDiscount + item.charge;
    const taxAmount = (afterCharge * item.tax) / 100;
    return afterCharge + taxAmount;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstAmount = (subtotal * 5) / 100;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;
  const totalAfterTax = subtotal + gstAmount;
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.percentage) / 100 : 0;
  const grandTotal = totalAfterTax + deliveryCharge - globalDiscount - couponDiscount;

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCustomer(null);
    setCustomerInput("");
    setGlobalDiscount(0);
    setDeliveryCharge(0);
    setSelectedItems(new Set());
    setAppliedCoupon(null);
    setSalespersonAssignments({});
  };

  if (currentView === "inventory") {
    return (
      <AddProduct
        onBack={() => setCurrentView("pos")}
        onAdd={(product) => {
          setInventoryProducts((prev) => [...prev, product]);
        }}
      />
    );
  }

  return (
    <div className="bg-[#edf0f2] relative size-full overflow-auto">
      {/* Header */}
      <div className="absolute bg-white right-0 top-0 w-full z-10 border-b border-[#eaeaea]">
        <div className="content-stretch flex items-center justify-between px-[54px] py-[12px]">
          <div className="content-stretch flex items-center">
            <div className="h-[45px] relative w-[121px]">
              <img alt="Logo" className="absolute inset-0 max-w-none object-cover size-full" src={imgDownload12} />
            </div>
          </div>
          <div className="content-stretch flex gap-[24px] items-center justify-end">
            <button className="bg-white content-stretch flex gap-[4px] items-center px-[12px] py-[8px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50">
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Hold</p>
              <div className="overflow-clip relative size-[16px]">
                <div className="absolute inset-[4.17%_12.5%_4.17%_16.67%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.3333 14.6667">
                    <path d={svgPaths.p2672c80} fill="#727681" />
                  </svg>
                </div>
              </div>
            </button>
            <div className="bg-[#a2a8b8] h-[33px] w-px" />
            <div className="content-stretch flex gap-[8px] items-center px-[8px] py-[6px] rounded-[8px] border border-[#eaeaea]">
              <div className="bg-[#3770ff] content-stretch flex items-center justify-center p-[8px] rounded-full size-[24px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] text-white">A</p>
              </div>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">
                <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold">Alok </span>
                <span>(Cashier)</span>
              </p>
              <div className="overflow-clip relative size-[12px]">
                <div className="absolute inset-[32.98%_20.83%_37.14%_20.83%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.00079 3.58658">
                    <path d={svgPaths.pa3fa900} fill="#0E101A" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="absolute bg-white content-stretch flex gap-[12px] h-[66px] items-center left-0 px-[16px] py-[12px] top-[69px] right-[451px]">
        <div className="bg-white flex-[1_0_0] h-full relative rounded-[8px] border border-[#eaeaea]">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex gap-[8px] items-center px-[16px] relative size-full">
              <div className="overflow-clip relative size-[18px]">
                <div className="absolute inset-[12.5%_14.62%_14.62%_12.5%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.1175 13.1175">
                    <path d={svgPaths.p22aa9300} fill="#515457" />
                  </svg>
                </div>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  setShowProductDropdown(value.length > 0);

                  // Auto-add if exact barcode/code match
                  if (value.length >= 3) {
                    const exactMatch = inventoryProducts.find(
                      (p) => p.barcode === value || p.code === value
                    );
                    if (exactMatch) {
                      addToCart(exactMatch);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.length > 0) {
                    // Check if search query matches a barcode exactly
                    const exactMatch = inventoryProducts.find(
                      (p) => p.barcode === searchQuery || p.code === searchQuery
                    );
                    if (exactMatch) {
                      addToCart(exactMatch);
                    }
                  }
                }}
                onFocus={() => setShowProductDropdown(searchQuery.length > 0)}
                placeholder="Search by Name, Code or Scan Barcode"
                className="flex-1 font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px] outline-none bg-transparent"
              />
            </div>
          </div>
          {/* Product Dropdown */}
          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#eaeaea] rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto z-50">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-[#eaeaea] last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#0e101a]">{product.name}</p>
                      <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#727681]">
                        Code: {product.code} | Barcode: {product.barcode}
                      </p>
                    </div>
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#0e101a]">₹{product.price}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white h-full relative rounded-[8px] border border-[#eaeaea]">
          <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] size-full">
            <button className="content-stretch flex items-center px-[10px] py-[8px] hover:bg-gray-50">
              <div className="overflow-clip relative size-[16px]">
                <div className="absolute inset-[12.5%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
                    <path d={svgPaths.p28727051} fill="#727681" />
                  </svg>
                </div>
              </div>
            </button>
            <div className="border-l border-[#eaeaea] h-full" />
            <button className="content-stretch flex items-center px-[10px] py-[8px] hover:bg-gray-50">
              <div className="overflow-clip relative size-[16px]">
                <div className="absolute inset-[16.67%_12.5%]">
                  <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 10.6667">
                    <path d={svgPaths.p31a45700} fill="#727681" />
                  </svg>
                </div>
              </div>
            </button>
            <button className="bg-[#1f7fff] content-stretch flex items-center px-[10px] py-[8px] hover:bg-[#1a6eeb]">
              <div className="relative size-[16px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                  <path d={svgPaths.pbfc9000} fill="white" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="absolute content-stretch flex flex-col items-start left-0 top-[135px] right-[451px] bottom-0 overflow-auto">
        {/* Header */}
        <div className="bg-[#f3f8fb] flex items-center w-full sticky top-0 z-5">
          <div className="content-stretch flex items-center justify-between px-[16px] py-[4px] w-full">
            <div className="content-stretch flex items-center gap-[8px] w-[300px]">
              <button
                onClick={() => {
                  if (selectedItems.size === cartItems.length) {
                    setSelectedItems(new Set());
                  } else {
                    setSelectedItems(new Set(cartItems.map((item) => item.id)));
                  }
                }}
                className="relative size-[18px] hover:opacity-70"
              >
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p2aa2df00} fill={selectedItems.size > 0 ? "#1f7fff" : "#6C748C"} />
                </svg>
              </button>
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Product Name & Code</p>
            </div>
            <div className="content-stretch flex flex-[1_0_0] items-center justify-between">
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Batch No.</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">QTY</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Unit</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Price</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Discount</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Charge</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Tax</p>
              </div>
              <div className="w-[94px] px-[12px] py-[4px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px]">Amount</p>
              </div>
            </div>
            {selectedItems.size > 0 && (
              <button onClick={removeSelectedItems} className="relative size-[18px] hover:opacity-70 ml-2">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                  <path d={svgPaths.pa292d80} fill="#D00003" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 w-full bg-white">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <EmptyBag />
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white border-b border-[#eaeaea] hover:bg-gray-50">
                <div className="content-stretch flex items-center justify-between px-[16px] py-[8px] w-full">
                  <div className="content-stretch flex items-center gap-[8px]">
                    <button
                      onClick={() => toggleItemSelection(item.id)}
                      className="relative size-[18px] hover:opacity-70 p-[4px]"
                    >
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                        <path d={svgPaths.p2aa2df00} fill={selectedItems.has(item.id) ? "#1f7fff" : "#6C748C"} />
                      </svg>
                    </button>
                    <div className="content-stretch flex flex-col gap-[4px] items-start justify-center px-[12px] py-[4px] w-[300px]">
                      <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">{item.name}</p>
                      <div className="content-stretch flex gap-[4px] items-center">
                        <div className="overflow-clip relative size-[12px]">
                          <div className="absolute inset-[8.33%_0]">
                            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 10">
                              <path d={svgPaths.p16baa200} fill="#727681" />
                            </svg>
                          </div>
                        </div>
                        <p className="font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[12px]">
                          {item.code} {item.barcode && `| ${item.barcode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-[1_0_0] items-center justify-between">
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">{item.batchNo}</p>
                    </div>
                    <div className="w-[94px]">
                      <div className="bg-white relative rounded-[8px]">
                        <div className="content-stretch flex items-center overflow-clip relative rounded-[inherit] border border-[#eaeaea]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-[#f8f9fb] content-stretch flex flex-col items-center justify-center size-[30px] border-r border-[#eaeaea] hover:bg-gray-200"
                          >
                            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">-</p>
                          </button>
                          <div className="content-stretch flex flex-col items-center justify-center p-[4px] size-[30px]">
                            <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[12px]">{item.quantity}</p>
                          </div>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-[#f8f9fb] content-stretch flex flex-col items-center justify-center size-[30px] border-l border-[#eaeaea] hover:bg-gray-200"
                          >
                            <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">+</p>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">{item.unit}</p>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹ {item.discount.toFixed(2)}</p>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹ {item.charge.toFixed(2)}</p>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹ {item.tax.toFixed(2)}</p>
                    </div>
                    <div className="w-[94px] px-[12px] py-[4px]">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹ {calculateItemTotal(item).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => updateQuantity(item.id, 0)} className="overflow-clip relative size-[18px] hover:opacity-70 ml-2">
                    <div className="absolute inset-[0_8.33%]">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 18">
                        <path d={svgPaths.pa292d80} fill="#D00003" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="absolute bg-[#fafafa] content-stretch flex h-[calc(100vh-69px)] items-center right-0 px-[12px] py-[24px] top-[69px] w-[439px] border-l border-[#eaeaea]">
        <div className="content-stretch flex flex-col h-full items-start justify-between w-full">
          {/* Top Section */}
          <div className="content-stretch flex flex-col gap-[12px] items-start w-full">
            {/* Customer Input */}
            <div className="relative w-full h-[89px]">
              <div className="absolute flex items-center justify-between left-0 right-0 top-0">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[12px]">
                  <span>Customer Name</span>
                  <span className="text-[#d00003]">*</span>
                </p>
                {customer && (
                  <button
                    onClick={() => {
                      setCustomer(null);
                      setCustomerInput("");
                    }}
                    className="overflow-clip relative size-[16px] hover:opacity-70 cursor-pointer"
                  >
                    <div className="absolute inset-[0_8.33%]">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 16">
                        <path d={svgPaths.p28a15d80} fill="#6C748C" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
              <div className="absolute bg-white border border-[#eaeaea] h-[66px] left-0 right-0 rounded-[8px] top-[23px]">
                {customer ? (
                  <div className="absolute left-[11px] top-[14px] right-[11px]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">
                      {customer.name} {customer.phone}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="bg-[#ffd700] rounded-full size-[8px]" />
                        <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[12px]">
                          {customer.points} points -{customer.pointsExpiry} days to expire!
                        </p>
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] text-[#d00003] text-[12px]">
                        Due ₹ {customer.dueAmount.toFixed(2)}/-
                      </p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={customerInput}
                    onChange={(e) => handleCustomerInput(e.target.value)}
                    placeholder="Enter Name / Phone No."
                    className="absolute left-[11px] top-[22.5px] right-[11px] font-['Inter:Regular',sans-serif] font-normal text-[#727681] text-[14px] outline-none bg-transparent"
                  />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute inset-[-0.5px_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 415 1">
                  <path d="M0 0.5H415" stroke="#A2A8B8" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>

            {/* Price Breakdown */}
            {cartItems.length > 0 && (
              <div className="content-stretch flex flex-col gap-[8px] w-full">
                <div className="flex justify-between items-center">
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[14px]">Subtotal</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹{subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[14px]">GST 5%</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹{gstAmount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center pl-4">
                  <p className="font-['Inter:Regular',sans-serif] text-[#a2a8b8] text-[12px]">CGST</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[12px]">₹{cgstAmount.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center pl-4">
                  <p className="font-['Inter:Regular',sans-serif] text-[#a2a8b8] text-[12px]">SGST</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[12px]">₹{sgstAmount.toFixed(2)}</p>
                </div>
                {deliveryCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[14px]">Delivery Charge</p>
                    <div className="flex items-center gap-2">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">₹{deliveryCharge}</p>
                      <button onClick={() => setDeliveryCharge(0)} className="text-[#d00003] hover:opacity-70">
                        <svg className="size-[12px]" fill="none" viewBox="0 0 8.39038 8.39038">
                          <path d={svgPaths.p3b543ec0} fill="#D00003" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <p className="font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px]">Applied:</p>
                      <span className="bg-[#e8f5e9] text-[#2e7d32] px-2 py-1 rounded text-[12px] font-medium">{appliedCoupon.code}</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-[#d00003] hover:opacity-70">
                        <svg className="size-[10px]" fill="none" viewBox="0 0 8.39038 8.39038">
                          <path d={svgPaths.p3b543ec0} fill="#D00003" />
                        </svg>
                      </button>
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#2e7d32] text-[14px]">-₹{couponDiscount.toFixed(2)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Grand Total */}
            <div className="content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-center justify-between w-full pt-2">
              <p className="text-[#0e101a] text-[14px]">Grand Total</p>
              <p className="text-[#0e101a] text-[20px]">₹{grandTotal.toFixed(2)}</p>
            </div>

            {/* Items and Units Count */}
            {cartItems.length > 0 && (
              <div className="content-stretch flex items-center justify-between w-full">
                <div className="flex gap-[24px]">
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[12px]">
                    No. of Items: <span className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a]">{cartItems.length}</span>
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[12px]">
                    No. of Units: <span className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a]">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-0 relative shrink-0 w-full">
              <div className="absolute inset-[-0.5px_0]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 415 1">
                  <path d="M0 0.5H415" stroke="#A2A8B8" strokeDasharray="4 4" />
                </svg>
              </div>
            </div>

            {/* Discount & Charges */}
            <div className="content-stretch flex gap-[16px] h-[66px] items-center w-full">
              <button
                onClick={() => {
                  // Position discount modal near the discount button
                  const windowWidth = window.innerWidth;
                  const windowHeight = window.innerHeight;
                  setDiscountPosition({
                    x: windowWidth / 2 - 250,
                    y: windowHeight / 2 - 200
                  });
                  setShowDiscountModal(true);
                }}
                className="bg-white flex-[1_0_0] h-[66px] relative rounded-[8px] border border-[#eaeaea] hover:bg-gray-50"
              >
                <div className="flex items-center justify-center h-full p-[8px]">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Discount</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setChargeInput("0");
                  // Position keyboard near the charges button
                  const windowWidth = window.innerWidth;
                  const windowHeight = window.innerHeight;
                  setKeypadPosition({
                    x: windowWidth / 2 - 150,
                    y: windowHeight / 2 - 150
                  });
                  setShowChargesModal(true);
                }}
                className="bg-white flex-[1_0_0] h-[66px] relative rounded-[8px] border border-[#eaeaea] hover:bg-gray-50"
              >
                <div className="flex items-center justify-center h-full p-[8px]">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Charges</p>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="content-stretch flex flex-col gap-[16px] items-start w-full">
            {/* Proceed To Pay & Cash Drawer */}
            <div className="content-stretch flex gap-[16px] items-center w-full">
              <button className="bg-white content-stretch flex h-[66px] items-center justify-center px-[8px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Cash Drawer</p>
              </button>
              <button
                disabled={cartItems.length === 0 || !customer}
                onClick={() => {
                  if (cartItems.length > 0 && customer) {
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;
                    setPaymentPosition({
                      x: windowWidth / 2 - 250,
                      y: windowHeight / 2 - 200
                    });
                    setSelectedPaymentMethod(null);
                    setSplitPayments([]);
                    setShowPaymentModal(true);
                  }
                }}
                className="bg-[#1f7fff] flex-[1_0_0] h-[66px] relative rounded-[8px] border border-[#eaeaea] hover:bg-[#1a6eeb] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-[8px] h-full">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-white">Proceed To Pay</p>
                  <div className="overflow-clip relative size-[20px]">
                    <div className="absolute bottom-1/4 left-[16.67%] right-1/4 top-[25.04%]">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 9.9928">
                        <path d={svgPaths.p2d4dd800} fill="white" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Action Buttons Row 1 */}
            <div className="content-stretch flex gap-[16px] items-center w-full">
              <button
                onClick={() => setShowNewSaleModal(true)}
                className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50"
              >
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">+ New Sales</p>
              </button>
              <button className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">All Customers</p>
              </button>
              <button
                disabled={cartItems.length === 0}
                onClick={() => setShowMultiSalespersonModal(true)}
                className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`font-['Inter:Regular',sans-serif] font-normal text-[14px] text-center ${cartItems.length === 0 ? 'text-[#a2a8b8]' : 'text-[#0e101a]'}`}>
                  <p>Multi</p>
                  <p>Salesperson</p>
                </div>
              </button>
            </div>

            {/* Action Buttons Row 2 */}
            <div className="content-stretch flex gap-[16px] items-center w-full">
              <button className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Damage</p>
              </button>
              <button className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Return</p>
              </button>
              <button
                onClick={() => setCurrentView("inventory")}
                className="bg-white flex-[1_0_0] h-[66px] rounded-[8px] border border-[#eaeaea] hover:bg-gray-50"
              >
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">Inventory</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div
          className="fixed z-50"
          style={{
            left: `${discountPosition.x}px`,
            top: `${discountPosition.y}px`,
            cursor: isDraggingDiscount ? 'grabbing' : 'default'
          }}
          onMouseMove={(e) => {
            if (isDraggingDiscount) {
              setDiscountPosition({
                x: e.clientX - discountDragOffset.x,
                y: e.clientY - discountDragOffset.y
              });
            }
          }}
          onMouseUp={() => setIsDraggingDiscount(false)}
          onMouseLeave={() => setIsDraggingDiscount(false)}
        >
          <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] w-[505px] max-h-[90vh] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] select-none">
            {/* Header */}
            <div
              className="bg-[#f6f9fa] relative shrink-0 w-full border-b border-[#eaeaea] cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                // Only start dragging if clicking on the header area (not the close button)
                if ((e.target as HTMLElement).closest('button')) return;
                setIsDraggingDiscount(true);
                setDiscountDragOffset({
                  x: e.clientX - discountPosition.x,
                  y: e.clientY - discountPosition.y
                });
              }}
            >
              <div className="content-stretch flex items-start justify-between px-[24px] py-[20px] relative w-full">
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[16px]">Available Coupons</p>
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="overflow-clip relative size-[16px] hover:opacity-70 cursor-pointer"
                >
                  <div className="absolute inset-[23.78%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.39038 8.39038">
                      <path d={svgPathsDiscount.p3b543ec0} fill="#6C748C" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative shrink-0 w-full overflow-y-auto">
              <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
                <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px]">
                    Vouchers for customer: {customer ? `${customer.name} (${customer.phone})` : "Guest"}
                  </p>
                  <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon.id}
                        onClick={() => handleApplyCoupon(coupon)}
                        disabled={coupon.disabled || subtotal < coupon.minPurchase}
                        className={`bg-white content-stretch flex items-center p-[12px] relative rounded-[8px] w-full border border-[#eaeaea] ${
                          !coupon.disabled && subtotal >= coupon.minPurchase ? "hover:bg-gray-50 cursor-pointer" : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px relative">
                          <div
                            className="content-stretch flex flex-col items-center justify-center pb-[13px] pl-[6px] pr-[5px] pt-[12px] relative rounded-[22px] shrink-0 size-[44px]"
                            style={{ backgroundColor: coupon.color }}
                          >
                            <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] text-white">{coupon.percentage}%</p>
                          </div>
                          <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center min-w-px relative">
                            <p
                              className={`font-['Inter:Medium',sans-serif] font-medium text-[14px] ${
                                coupon.disabled ? "text-[#9f9f9f]" : "text-[#0e101a]"
                              }`}
                            >
                              {coupon.code}
                            </p>
                            <p
                              className={`font-['Inter:Regular',sans-serif] font-normal text-[12px] ${
                                coupon.disabled ? "text-[#d5d5d5]" : "text-[#727681]"
                              }`}
                            >
                              {coupon.description}
                            </p>
                            {subtotal < coupon.minPurchase && !coupon.disabled && (
                              <p className="font-['Inter:Regular',sans-serif] font-normal text-[10px] text-[#d00003]">
                                Add ₹{(coupon.minPurchase - subtotal).toFixed(2)} more to apply
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full">
                  <div className="absolute inset-[-0.5px_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 457 1">
                      <path d="M0 0.5H457" stroke="#A2A8B8" strokeDasharray="4 4" />
                    </svg>
                  </div>
                </div>

                {/* Cancel Button */}
                <div className="content-stretch flex gap-[16px] h-[44px] items-center relative shrink-0 w-full">
                  <button
                    onClick={() => setShowDiscountModal(false)}
                    className="bg-white flex-[1_0_0] h-full relative rounded-[8px] border border-[#a2a8b8] hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center h-full px-[12px] py-[8px]">
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#727681] text-[14px]">Cancel</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charges Keyboard Modal */}
      {showChargesModal && (
        <div
          className="fixed z-50"
          style={{
            left: `${keypadPosition.x}px`,
            top: `${keypadPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'default'
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              setKeypadPosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
              });
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div className="bg-[#f9f9f9] content-stretch flex flex-col gap-[6px] items-center pb-[16px] px-[16px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] rounded-[8px] select-none">
            {/* Drag Handle */}
            <div
              className="flex items-center justify-center relative shrink-0 size-[14px] rotate-90 cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({
                  x: e.clientX - keypadPosition.x,
                  y: e.clientY - keypadPosition.y
                });
              }}
            >
              <div className="relative size-[14px]">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                  <path d={svgPathsKeyboard.p26dd5980} fill="#727681" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
              {/* Display */}
              <div className="bg-white content-stretch flex flex-col h-[40px] items-end justify-center p-[8px] relative shrink-0 w-[281px] border border-[#d9d9d9]">
                <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#090909] text-[24px]">{chargeInput}</p>
              </div>

              {/* Row 1: 1, 2, 3, Backspace */}
              <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                <button
                  onClick={() => handleKeypadInput("1")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">1</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("2")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">2</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("3")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">3</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("backspace")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[58px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <div className="relative size-[24px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsKeyboard.p3deaa600} fill="#535353" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Row 2: 4, 5, 6, ESC */}
              <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                <button
                  onClick={() => handleKeypadInput("4")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">4</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("5")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">5</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("6")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">6</p>
                </button>
                <button
                  onClick={() => handleKeypadInput("esc")}
                  className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[58px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[#535353] text-[16px]">esc</p>
                </button>
              </div>

              {/* Row 3 & 4: Left side (7,8,9 and -,0,.) + Right side (Enter) */}
              <div className="content-stretch flex gap-[6px] items-center relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-[217px]">
                  {/* Row 3: 7, 8, 9 */}
                  <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                    <button
                      onClick={() => handleKeypadInput("7")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">7</p>
                    </button>
                    <button
                      onClick={() => handleKeypadInput("8")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">8</p>
                    </button>
                    <button
                      onClick={() => handleKeypadInput("9")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">9</p>
                    </button>
                  </div>

                  {/* Row 4: -, 0, . */}
                  <div className="content-stretch flex gap-[5px] items-center relative shrink-0 w-full">
                    <button
                      onClick={() => handleKeypadInput("-")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">-</p>
                    </button>
                    <button
                      onClick={() => handleKeypadInput("0")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">0</p>
                    </button>
                    <button
                      onClick={() => handleKeypadInput(".")}
                      className="bg-white content-stretch flex flex-col h-[48px] items-center justify-center p-[8px] relative shrink-0 w-[69px] border border-[#d9d9d9] hover:bg-gray-100"
                    >
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#535353] text-[24px]">.</p>
                    </button>
                  </div>
                </div>

                {/* Enter Button */}
                <button
                  onClick={() => handleKeypadInput("enter")}
                  className="bg-white content-stretch flex flex-col h-[102px] items-center justify-center p-[8px] relative shrink-0 w-[58px] border border-[#d9d9d9] hover:bg-gray-100"
                >
                  <div className="relative size-[24px]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                      <path d={svgPathsKeyboard.p12852cc0} fill="#535353" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {showPaymentModal && (
        <div
          className="fixed z-50"
          style={{
            left: `${paymentPosition.x}px`,
            top: `${paymentPosition.y}px`,
            cursor: isDraggingPayment ? 'grabbing' : 'default'
          }}
          onMouseMove={(e) => {
            if (isDraggingPayment) {
              setPaymentPosition({
                x: e.clientX - paymentDragOffset.x,
                y: e.clientY - paymentDragOffset.y
              });
            }
          }}
          onMouseUp={() => setIsDraggingPayment(false)}
          onMouseLeave={() => setIsDraggingPayment(false)}
        >
          <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[16px] w-[505px] max-h-[90vh] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] select-none">
            {/* Header */}
            <div
              className="bg-[#1f7fff] relative shrink-0 w-full cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                setIsDraggingPayment(true);
                setPaymentDragOffset({
                  x: e.clientX - paymentPosition.x,
                  y: e.clientY - paymentPosition.y
                });
              }}
            >
              <div className="content-stretch flex items-center justify-between px-[24px] py-[20px] relative w-full">
                <p className="font-['Inter:Medium',sans-serif] font-medium text-white text-[16px]">Payment Settlement</p>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="overflow-clip relative size-[16px] hover:opacity-70 cursor-pointer"
                >
                  <div className="absolute inset-[23.78%]">
                    <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.39038 8.39038">
                      <path d={svgPathsDiscount.p3b543ec0} fill="white" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative shrink-0 w-full overflow-y-auto">
              <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative w-full">
                {/* Total Payable Card */}
                <div className="bg-[#1f7fff] content-stretch flex flex-col items-center justify-center p-[24px] relative rounded-[12px] shrink-0 w-full">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-white text-[14px]">Total Payable Amount</p>
                  <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-white text-[32px] mt-2">₹{grandTotal.toFixed(2)}</p>
                </div>

                {/* Select Payment Mode */}
                <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">Select Payment Mode</p>

                  {/* Payment Method Grid */}
                  <div className="grid grid-cols-2 gap-[16px] w-full">
                    {/* Cash */}
                    <button
                      onClick={() => setSelectedPaymentMethod('cash')}
                      className={`bg-white content-stretch flex flex-col items-center justify-center p-[24px] relative rounded-[12px] border-2 hover:bg-gray-50 ${
                        selectedPaymentMethod === 'cash' ? 'border-[#1f7fff]' : 'border-[#eaeaea]'
                      }`}
                    >
                      <div className="relative size-[48px] mb-2">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 40">
                          <path d={svgPathsPayment.p3ec1a440} fill="#F5F5F5" />
                          <path d={svgPathsPayment.p1193c380} fill="#FFD700" />
                          <path d={svgPathsPayment.p1eae2a80} fill="#FFD700" />
                          <path d={svgPathsPayment.p3ecba000} fill="#C4A000" />
                        </svg>
                      </div>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">Cash</p>
                    </button>

                    {/* UPI */}
                    <button
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`bg-white content-stretch flex flex-col items-center justify-center p-[24px] relative rounded-[12px] border-2 hover:bg-gray-50 ${
                        selectedPaymentMethod === 'upi' ? 'border-[#1f7fff]' : 'border-[#eaeaea]'
                      }`}
                    >
                      <div className="relative size-[48px] mb-2">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 40">
                          <path d={svgPathsPayment.p3ec1a440} fill="#F5F5F5" />
                          <path d={svgPathsPayment.p1948be80} fill="#097939" />
                          <path d={svgPathsPayment.p393a9b20} fill="#F37920" />
                        </svg>
                      </div>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">UPI</p>
                    </button>

                    {/* Card */}
                    <button
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`bg-white content-stretch flex flex-col items-center justify-center p-[24px] relative rounded-[12px] border-2 hover:bg-gray-50 ${
                        selectedPaymentMethod === 'card' ? 'border-[#1f7fff]' : 'border-[#eaeaea]'
                      }`}
                    >
                      <div className="relative size-[48px] mb-2">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 40">
                          <path d={svgPathsPayment.p3ec1a440} fill="#1f7fff" />
                          <path d={svgPathsPayment.p1d9e3a00} fill="#003D82" />
                          <path d={svgPathsPayment.pf55a100} fill="#E0E0E0" opacity="0.3" />
                        </svg>
                      </div>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">Card</p>
                    </button>

                    {/* Split */}
                    <button
                      onClick={() => {
                        setSelectedPaymentMethod('split');
                        if (splitPayments.length === 0) {
                          setSplitPayments([{ method: 'cash', amount: 0 }, { method: 'upi', amount: 0 }]);
                        }
                      }}
                      className={`bg-white content-stretch flex flex-col items-center justify-center p-[24px] relative rounded-[12px] border-2 hover:bg-gray-50 ${
                        selectedPaymentMethod === 'split' ? 'border-[#1f7fff]' : 'border-[#eaeaea]'
                      }`}
                    >
                      <div className="relative size-[48px] mb-2">
                        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 40">
                          <path d={svgPathsPayment.p3ec1a440} fill="#F5F5F5" />
                          <path d={svgPathsPayment.p2c3c7300} fill="#9E9E9E" opacity="0.6" />
                          <path d={svgPathsPayment.p3f9e70f1} fill="#757575" />
                        </svg>
                      </div>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">Split</p>
                    </button>
                  </div>

                  {/* Split Payment Details */}
                  {selectedPaymentMethod === 'split' && (
                    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full mt-4">
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">Split Payment Details</p>
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="content-stretch flex gap-[12px] items-center w-full">
                          <select
                            value={payment.method}
                            onChange={(e) => {
                              const newSplitPayments = [...splitPayments];
                              newSplitPayments[index].method = e.target.value;
                              setSplitPayments(newSplitPayments);
                            }}
                            className="bg-white flex-1 h-[44px] px-[12px] rounded-[8px] border border-[#eaeaea] font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px] outline-none"
                          >
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                          </select>
                          <input
                            type="number"
                            value={payment.amount || ''}
                            onChange={(e) => {
                              const newSplitPayments = [...splitPayments];
                              newSplitPayments[index].amount = parseFloat(e.target.value) || 0;
                              setSplitPayments(newSplitPayments);
                            }}
                            placeholder="Amount"
                            className="bg-white flex-1 h-[44px] px-[12px] rounded-[8px] border border-[#eaeaea] font-['Inter:Regular',sans-serif] text-[#0e101a] text-[14px] outline-none"
                          />
                          {splitPayments.length > 2 && (
                            <button
                              onClick={() => {
                                const newSplitPayments = splitPayments.filter((_, i) => i !== index);
                                setSplitPayments(newSplitPayments);
                              }}
                              className="text-[#d00003] hover:opacity-70"
                            >
                              <svg className="size-[16px]" fill="none" viewBox="0 0 8.39038 8.39038">
                                <path d={svgPathsDiscount.p3b543ec0} fill="#D00003" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => setSplitPayments([...splitPayments, { method: 'cash', amount: 0 }])}
                        className="bg-[#f6f9fa] content-stretch flex items-center justify-center h-[44px] px-[12px] rounded-[8px] border border-[#eaeaea] w-full hover:bg-gray-100"
                      >
                        <p className="font-['Inter:Medium',sans-serif] font-medium text-[#1f7fff] text-[14px]">+ Add Payment Method</p>
                      </button>
                      <div className="flex justify-between items-center w-full mt-2">
                        <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[14px]">Total Entered:</p>
                        <p className="font-['Inter:Medium',sans-serif] font-medium text-[#0e101a] text-[14px]">
                          ₹{splitPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center w-full">
                        <p className="font-['Inter:Regular',sans-serif] text-[#727681] text-[14px]">Remaining:</p>
                        <p className="font-['Inter:Medium',sans-serif] font-medium text-[#d00003] text-[14px]">
                          ₹{(grandTotal - splitPayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-0 relative shrink-0 w-full">
                  <div className="absolute inset-[-0.5px_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 457 1">
                      <path d="M0 0.5H457" stroke="#A2A8B8" strokeDasharray="4 4" />
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="bg-white flex-1 h-[44px] relative rounded-[8px] border border-[#a2a8b8] hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center h-full px-[12px] py-[8px]">
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#727681] text-[14px]">Cancel</p>
                    </div>
                  </button>
                  <button
                    className="bg-white flex-1 h-[44px] relative rounded-[8px] border border-[#a2a8b8] hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-center h-full px-[12px] py-[8px]">
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-[#727681] text-[14px]">Share</p>
                    </div>
                  </button>
                  <button
                    disabled={!selectedPaymentMethod}
                    onClick={() => {
                      if (selectedPaymentMethod === 'split') {
                        const totalEntered = splitPayments.reduce((sum, p) => sum + p.amount, 0);
                        if (Math.abs(totalEntered - grandTotal) > 0.01) {
                          alert('Split payment amounts must equal the total amount!');
                          return;
                        }
                      }
                      alert(`Payment of ₹${grandTotal.toFixed(2)} completed via ${selectedPaymentMethod}!`);
                      setShowPaymentModal(false);
                      clearCart();
                    }}
                    className="bg-[#1f7fff] flex-1 h-[44px] relative rounded-[8px] border border-[#1f7fff] hover:bg-[#1a6eeb] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center h-full px-[12px] py-[8px]">
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-white text-[14px]">Complete Transaction</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Confirmation Modal */}
      {showNewSaleModal && (
        <div className="fixed z-50 flex items-center justify-center" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-[360px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">
            <NewSaleConfirmation
              onConfirm={() => {
                clearCart();
                setShowNewSaleModal(false);
              }}
              onCancel={() => setShowNewSaleModal(false)}
            />
          </div>
        </div>
      )}

      {/* Multi Salesperson Modal */}
      {showMultiSalespersonModal && (
        <div className="fixed z-50" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="w-[750px] max-h-[80vh] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)]">
            <MultiSalespersonModal
              cartItems={cartItems}
              salespersonAssignments={salespersonAssignments}
              onAssignmentChange={setSalespersonAssignments}
              onClose={() => setShowMultiSalespersonModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// New Sale Confirmation Component
function NewSaleConfirmation({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-center justify-center p-[24px] relative rounded-[8px]">
      <div aria-hidden="true" className="absolute border border-[#eaeaea] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="relative shrink-0 size-[48px]">
        <img
          alt="Cancel"
          className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
          src="data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='24' cy='24' r='24' fill='%23FFE5E9'/%3E%3Cpath d='M24 14V24M24 24V34M24 24H34M24 24H14' stroke='%23E03F57' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"
        />
      </div>
      <div className="content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[4px] items-center leading-[1.2] not-italic relative shrink-0">
        <p className="relative shrink-0 text-[#0e101a] text-[14px] whitespace-nowrap">Start a New Sale?</p>
        <p className="relative shrink-0 text-[#727681] text-[12px] text-center w-[264px]">All items currently in the cart will be removed. Do you want to continue?</p>
      </div>
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
        <button
          onClick={onCancel}
          className="bg-white content-stretch cursor-pointer flex items-center justify-center px-[20px] py-[12px] relative rounded-[4px] shrink-0 w-[122px] hover:bg-gray-50"
        >
          <div aria-hidden="true" className="absolute border-[#eaeaea] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[#727681] text-[14px] text-left whitespace-nowrap">Cancel</p>
        </button>
        <button
          onClick={onConfirm}
          className="bg-[#1f7fff] content-stretch cursor-pointer flex items-center justify-center px-[20px] py-[12px] relative rounded-[4px] shrink-0 w-[122px] hover:bg-[#1a6eeb]"
        >
          <div aria-hidden="true" className="absolute border-[#0084ff] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[4px]" />
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-none not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Confirm</p>
        </button>
      </div>
    </div>
  );
}

// Multi Salesperson Modal Component
function MultiSalespersonModal({
  cartItems,
  salespersonAssignments,
  onAssignmentChange,
  onClose
}: {
  cartItems: CartItem[];
  salespersonAssignments: Record<string, string>;
  onAssignmentChange: (assignments: Record<string, string>) => void;
  onClose: () => void;
}) {
  const salespeople = ["Alok Ranjan Oraon", "Amandeep Dhiman", "Rajesh Kumar", "Priya Sharma"];

  const handleSalespersonChange = (itemId: string, salesperson: string) => {
    onAssignmentChange({
      ...salespersonAssignments,
      [itemId]: salesperson
    });
  };

  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start p-[24px] relative rounded-[8px]">
      {/* Header */}
      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#0e101a] text-[12px] whitespace-nowrap">Multi Salesperson</p>
        <button
          onClick={onClose}
          className="block cursor-pointer overflow-clip relative shrink-0 size-[18px] hover:opacity-70"
        >
          <div className="absolute inset-[23.78%]">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.43918 9.43918">
              <path d={svgPathsMulti.p1fbd2d00} fill="#727681" />
            </svg>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        {/* Header Row */}
        <div className="bg-[#f3f8fb] flex-[1_0_0] min-w-px relative w-full">
          <div className="flex flex-row items-center size-full">
            <div className="content-stretch flex items-center justify-between px-[16px] py-[4px] relative size-full">
              <div className="content-stretch flex gap-[8px] h-[30px] items-center px-[12px] py-[4px] relative shrink-0 w-[300px]">
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#727681] text-[14px] whitespace-nowrap">Product Name & Code</p>
              </div>
              <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-w-px relative">
                <div className="content-stretch flex gap-[8px] h-[30px] items-center px-[12px] py-[4px] relative shrink-0 w-[94px]">
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#727681] text-[14px] whitespace-nowrap">QTY</p>
                </div>
                <div className="content-stretch flex gap-[8px] h-[30px] items-center px-[12px] py-[4px] relative shrink-0 w-[300px]">
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#727681] text-[14px] whitespace-nowrap">Select Salesperson</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Rows */}
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full max-h-[400px] overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white relative shrink-0 w-full border-b border-[#eaeaea]">
              <div className="flex flex-row items-center size-full">
                <div className="content-stretch flex items-center justify-between px-[16px] py-[8px] relative size-full">
                  {/* Product Name & Code */}
                  <div className="content-stretch flex flex-col gap-[4px] items-start justify-center px-[12px] py-[4px] relative shrink-0 w-[300px]">
                    <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#0e101a] text-[14px] whitespace-nowrap">{item.name}</p>
                    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                      <div className="overflow-clip relative shrink-0 size-[10px]">
                        <div className="absolute inset-[8.33%_0]">
                          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 8.33333">
                            <path d={svgPathsMulti.p907d100} fill="#727681" />
                          </svg>
                        </div>
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#727681] text-[12px] whitespace-nowrap">{item.code}</p>
                    </div>
                  </div>

                  <div className="content-stretch flex flex-[1_0_0] items-center justify-between min-w-px relative">
                    {/* Quantity */}
                    <div className="content-stretch flex gap-[8px] h-[30px] items-center px-[12px] py-[4px] relative shrink-0 w-[94px]">
                      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.2] not-italic relative shrink-0 text-[#0e101a] text-[14px] whitespace-nowrap">{String(item.quantity).padStart(2, '0')}</p>
                    </div>

                    {/* Salesperson Dropdown */}
                    <div className="relative shrink-0 w-[300px]">
                      <select
                        value={salespersonAssignments[item.id] || ""}
                        onChange={(e) => handleSalespersonChange(item.id, e.target.value)}
                        className="content-stretch flex h-[30px] items-center justify-between px-[12px] py-[4px] relative rounded-[8px] w-full border border-[#eaeaea] font-['Inter:Regular',sans-serif] font-normal text-[#0e101a] text-[14px] outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='11' height='6' viewBox='0 0 11 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.25 5.38L0 0.13L1.13 0L5.25 4.12L9.37 0L10.5 0.13L5.25 5.38Z' fill='%23727681'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center'
                        }}
                      >
                        <option value="">Select Salesperson</option>
                        {salespeople.map((person) => (
                          <option key={person} value={person}>{person}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
