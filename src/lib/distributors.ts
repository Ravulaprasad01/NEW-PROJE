// Simple distributor directory keyed by product code prefix.
// In real usage, populate from your database.

export interface AddressBlock {
  name: string;
  email: string;
  lines: string[];
}

export interface DistributorProfile {
  id: string;
  office: AddressBlock; // From
  delivery: AddressBlock; // To (default delivery contact/address)
  productCodePrefixes: string[]; // e.g., ["PKA", "PKI"]
}

const DISTRIBUTORS: DistributorProfile[] = [
  {
    id: 'best-choice-international',
    office: {
      name: 'Best Choice International Ltd',
      email: 'irenesogood@gmail.com',
      lines: [
        'Block A, Floor 5 , Po Chai Industrial Bldg',
        '#28 Wong Chuk Hnag Road',
        'Aberdeen, Hong Kong',
      ],
    },
    delivery: {
      name: 'Best Choice International Ltd',
      email: 'irenesogood@gmail.com',
      lines: [
        'Block A, Floor 5 , Po Chai Industrial Bldg',
        '#28 Wong Chuk Hnag Road',
        'Aberdeen, Hong Kong',
      ],
    },
    productCodePrefixes: [
      'PKA', 'PKI', 'SFI', 'GFJ', 'GFE', 'TGE', 'SFM', 'DGF', 'KCPF', 'KCPFL'
    ],
  },
  {
    id: 'distributor-3',
    office: {
      name: 'Happy Dog Inc',
      email: 'cathrina@cobbgrill.com.ph',
      lines: [
        'Level 24, Philippine Stock Exchange Tower',
        'One Bonifacio High Street',
        '5th Ave. Cor. 28th St. BGC, Taguig City',
        'Manila, Philippines',
      ],
    },
    delivery: {
      name: 'Nirvasian Fullfillment Centre',
      email: 'cathrina@cobbgrill.com.ph',
      lines: [
        'East Gerodias Street',
        'San Antonio',
        'San Pedro, Laguna 4023',
        'Philippines',
      ],
    },
    // Prefix for EAN-like product codes provided
    productCodePrefixes: ['600'],
  },
  // Add more distributors as needed
];

export function getDistributorForProductCode(productCode?: string): DistributorProfile | undefined {
  if (!productCode) return undefined;
  const upper = productCode.toUpperCase();
  return DISTRIBUTORS.find(d => d.productCodePrefixes.some(p => upper.startsWith(p)));
}

export function getDistributorForItems(items: Array<{ product_id?: string }>): DistributorProfile | undefined {
  for (const it of items) {
    const dist = getDistributorForProductCode(it.product_id);
    if (dist) return dist;
  }
  return undefined;
}


