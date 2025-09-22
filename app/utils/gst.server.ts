// GST calculation utilities for Indian tax compliance

export interface GSTCalculation {
  subtotal: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
  isInterState: boolean;
}

export interface InvoiceItem {
  description: string;
  hsnCode?: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
}

// Indian states with their GST state codes
export const INDIAN_STATES = {
  "Andhra Pradesh": "37",
  "Arunachal Pradesh": "12",
  "Assam": "18",
  "Bihar": "10",
  "Chhattisgarh": "22",
  "Delhi": "07",
  "Goa": "30",
  "Gujarat": "24",
  "Haryana": "06",
  "Himachal Pradesh": "02",
  "Jharkhand": "20",
  "Karnataka": "29",
  "Kerala": "32",
  "Madhya Pradesh": "23",
  "Maharashtra": "27",
  "Manipur": "14",
  "Meghalaya": "17",
  "Mizoram": "15",
  "Nagaland": "13",
  "Odisha": "21",
  "Punjab": "03",
  "Rajasthan": "08",
  "Sikkim": "11",
  "Tamil Nadu": "33",
  "Telangana": "36",
  "Tripura": "16",
  "Uttar Pradesh": "09",
  "Uttarakhand": "05",
  "West Bengal": "19",
};

/**
 * Calculate GST based on place of supply and billing address
 */
export function calculateGST(
  items: InvoiceItem[],
  billingState: string,
  shippingState: string,
  placeOfSupply?: string
): GSTCalculation {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  
  // Determine if it's inter-state transaction
  const supplierState = placeOfSupply || billingState;
  const isInterState = supplierState !== shippingState;
  
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  
  if (isInterState) {
    // Inter-state: IGST only
    items.forEach(item => {
      igstAmount += (item.amount * item.gstRate) / 100;
    });
  } else {
    // Intra-state: CGST + SGST
    items.forEach(item => {
      const gstAmount = (item.amount * item.gstRate) / 100;
      cgstAmount += gstAmount / 2;
      sgstAmount += gstAmount / 2;
    });
  }
  
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = subtotal + totalTax;
  
  // Calculate average rates for display
  const totalGSTRate = items.length > 0 
    ? items.reduce((sum, item) => sum + item.gstRate, 0) / items.length 
    : 0;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    cgstRate: isInterState ? 0 : totalGSTRate / 2,
    sgstRate: isInterState ? 0 : totalGSTRate / 2,
    igstRate: isInterState ? totalGSTRate : 0,
    cgstAmount: Math.round(cgstAmount * 100) / 100,
    sgstAmount: Math.round(sgstAmount * 100) / 100,
    igstAmount: Math.round(igstAmount * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    isInterState,
  };
}

/**
 * Validate GSTIN format
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) return false;
  
  // GSTIN format: 2 digits state code + 10 digits PAN + 1 digit entity number + 1 digit Z + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
}

/**
 * Get state code from GSTIN
 */
export function getStateFromGSTIN(gstin: string): string | null {
  if (!validateGSTIN(gstin)) return null;
  
  const stateCode = gstin.substring(0, 2);
  const stateEntry = Object.entries(INDIAN_STATES).find(([_, code]) => code === stateCode);
  return stateEntry ? stateEntry[0] : null;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix: string, counter: number): string {
  return `${prefix}${counter.toString().padStart(4, '0')}`;
}

/**
 * Determine place of supply based on transaction type
 */
export function determinePlaceOfSupply(
  billingAddress: any,
  shippingAddress: any,
  isB2B: boolean = false
): string {
  // For B2B transactions, place of supply is recipient's location
  // For B2C transactions, place of supply is where goods are delivered
  
  if (isB2B && billingAddress?.state) {
    return billingAddress.state;
  }
  
  if (shippingAddress?.state) {
    return shippingAddress.state;
  }
  
  return billingAddress?.state || "Maharashtra"; // Default fallback
}

/**
 * Check if reverse charge is applicable
 */
export function isReverseChargeApplicable(
  supplierGSTIN: string,
  customerGSTIN: string,
  amount: number
): boolean {
  // Reverse charge applies in specific scenarios:
  // 1. Unregistered supplier to registered recipient
  // 2. Specific categories of goods/services
  // 3. Import of services
  
  if (!supplierGSTIN && customerGSTIN) {
    return true; // Unregistered supplier to registered recipient
  }
  
  // Add more reverse charge scenarios as needed
  return false;
}

/**
 * Format currency for Indian locale
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert number to words (for invoice amounts)
 */
export function numberToWords(amount: number): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  function convertHundreds(num: number): string {
    let result = '';
    
    if (num > 99) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
    if (num > 19) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    
    if (num > 0) {
      result += ones[num] + ' ';
    }
    
    return result;
  }
  
  if (amount === 0) return 'Zero Rupees Only';
  
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  
  let result = '';
  
  if (rupees >= 10000000) { // Crores
    result += convertHundreds(Math.floor(rupees / 10000000)) + 'Crore ';
    rupees %= 10000000;
  }
  
  if (rupees >= 100000) { // Lakhs
    result += convertHundreds(Math.floor(rupees / 100000)) + 'Lakh ';
    rupees %= 100000;
  }
  
  if (rupees >= 1000) { // Thousands
    result += convertHundreds(Math.floor(rupees / 1000)) + 'Thousand ';
    rupees %= 1000;
  }
  
  if (rupees > 0) {
    result += convertHundreds(rupees);
  }
  
  result += 'Rupees';
  
  if (paise > 0) {
    result += ' and ' + convertHundreds(paise) + 'Paise';
  }
  
  return result.trim() + ' Only';
}