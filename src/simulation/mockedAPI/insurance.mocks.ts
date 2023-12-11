/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable require-jsdoc */
const validTokenInsurance: string = 'FFsecret00token';
const validDobs: string[] = ['1976-01-01', '1980-08-08'];

interface ProductDetails {
  [key: string]: {
    productName: string;
    productDescription: string;
    productDetails?: string;
    productDisclaimer?: string;
  };
}
const productDetails: ProductDetails = {
  propertyBasic: {
    productName: 'Property Insurance',
    productDescription: 'Covers your home and belongings against damage and theft of common household items.',
    productDetails: 'Covers your home and belongings against damage and theft of household items.',
    productDisclaimer: `maximum individual item value reimbursed is 1000 USD
        - maximum total value of all individual items reimbursed is 5000 USD
        - total property damage reimbursed is 600000 USD
        - does not cover damage caused by natural disasters like flooding or earthquakes
        `,
  },
  propertyLiability: {
    productName: 'Liability Insurance for property',
    productDescription:
      'An add on to the basic property insurance. Covers you against liability claims for bodily injury related to your property.',
    productDetails: 'Covers any 3rd party liablity claims for damage caused by your porperty. Includes legal fees',
    productDisclaimer: '- maximum total value of all individual items reimbursed is 5000 USD',
  },
  propertyEbike: {
    productName: 'E-bike Insurance Add-on for basic property insurance',
    productDescription: 'An add on to the basic property insurance. Covers your ebike.',
    productDetails:
      'An add on to the basic property insurance. Covers your ebike against damage and theft. Maxium damage covered is 1000 USD. Maxium theft value covered is 3000 USD. The number of ebikes covered needs to be specified when purchasing the insurance.',
    productDisclaimer:
      'only covers theft if ebike was stored inside a locked building. Battery damage is only covered if battery coverage addon is purchased.',
  },
};

interface ProdList {
  [key: string]: {
    productName: string;
    productDescription: string;
  };
}

const productList: ProdList = {};
for (const prodID in productDetails) {
  if (prodID in productDetails) {
    const subProps = productDetails[prodID];
    productList[prodID] = {
      productName: subProps.productName,
      productDescription: subProps.productDescription,
    };
  }
}

export function auth(policyNumber: number, dateOfBirth: string) {
  if ((policyNumber === 334455 || policyNumber === 888888) && dateOfBirth in validDobs) {
    return { authToken: validTokenInsurance };
  }
  return { error: 'Authentication failed' };
}

export function getPolicyInfo(policyNumber: number, authToken: string) {
  if (authToken != validTokenInsurance) {
    return { error: 'Authentication failed' };
  }

  if (policyNumber === 334455) {
    return {
      customerFirstName: 'Bill',
      customerLastName: 'Murray',
      products: {
        propertyBasic: {
          policyStartDate: '2023-06-01',
          scheduledArrival: '2023-11-12',
        },
        propertyLiability: {
          policyStartDate: '2023-06-01',
          scheduledArrival: '2023-11-12',
        },
      },
    };
  } else if (policyNumber === 888888) {
    return {
      customerFirstName: 'Bill',
      customerLastName: 'Murray',
      policyStartDate: '2023-06-01',
      scheduledArrival: '2023-11-12 12:30am',
      products: {
        propertyBasic: {
          policyStartDate: '2023-06-01',
          scheduledArrival: '2023-11-12',
        },
        propertyEbike: {
          policyStartDate: '2023-07-01',
          scheduledArrival: '2023-12-01',
          covered_ebikes: 2,
        },
      },
    };
  }
  return { error: "Policy number doesn't exist" };
}

export function getProductInfo(productId: string) {
  if (!(productId in productDetails)) {
    return { error: "Product doesn't exist" };
  }
  return productDetails[productId];
}

export function getProductList() {
  return productList;
}
