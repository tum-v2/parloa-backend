const VALID_TOKEN_INSURANCE: string = "FFsecret00token";
const VALID_DOBS = ["1976-01-01", "1980-08-08"];

interface ProductDetails {
  [key: string]: {
    product_name: string;
    product_description: string;
    product_details?: string;
    product_disclaimer?: string;
  };
}
const PRODUCT_DETAILS: ProductDetails = {
  property_basic: {
    product_name: "Property Insurance",
    product_description:
      "Covers your home and belongings against damage and theft of common household items.",
    product_details:
      "Covers your home and belongings against damage and theft of household items.",
    product_disclaimer: `maximum individual item value reimbursed is 1000 USD
        - maximum total value of all individual items reimbursed is 5000 USD
        - total property damage reimbursed is 600000 USD
        - does not cover damage caused by natural disasters like flooding or earthquakes
        `,
  },
  property_liability: {
    product_name: "Liability Insurance for property",
    product_description:
      "An add on to the basic property insurance. Covers you against liability claims for bodily injury related to your property.",
    product_details:
      "Covers any 3rd party liablity claims for damage caused by your porperty. Includes legal fees",
    product_disclaimer:
      "- maximum total value of all individual items reimbursed is 5000 USD",
  },
  property_ebike: {
    product_name: "E-bike Insurance Add-on for basic property insurance",
    product_description:
      "An add on to the basic property insurance. Covers your ebike.",
    product_details:
      "An add on to the basic property insurance. Covers your ebike against damage and theft. Maxium damage covered is 1000 USD. Maxium theft value covered is 3000 USD. The number of ebikes covered needs to be specified when purchasing the insurance.",
    product_disclaimer:
      "only covers theft if ebike was stored inside a locked building. Battery damage is only covered if battery coverage addon is purchased.",
  },
};

interface ProdList {
  [key: string]: {
    product_name: string;
    product_description: string;
  };
}

const PRODUCT_LIST: ProdList = {};
for (const prod_id in PRODUCT_DETAILS) {
  if (PRODUCT_DETAILS.hasOwnProperty(prod_id)) {
    const sub_props = PRODUCT_DETAILS[prod_id];
    PRODUCT_LIST[prod_id] = {
      product_name: sub_props.product_name,
      product_description: sub_props.product_description,
    };
  }
}

export function auth(policy_number: number, date_of_birth: string) {
  if (
    (policy_number === 334455 || policy_number === 888888) &&
    date_of_birth in VALID_DOBS
  ) {
    return { auth_token: VALID_TOKEN_INSURANCE };
  }
  return { error: "Authentication failed" };
}

function get_policy_info(policy_number: number, auth_token: string) {
  if (auth_token != VALID_TOKEN_INSURANCE) {
    return { error: "Authentication failed" };
  }

  if (policy_number === 334455) {
    return {
      customer_first_name: "Bill",
      customer_last_name: "Murray",
      products: {
        property_basic: {
          policy_start_date: "2023-06-01",
          scheduled_arrival: "2023-11-12",
        },
        property_liability: {
          policy_start_date: "2023-06-01",
          scheduled_arrival: "2023-11-12",
        },
      },
    };
  } else if (policy_number === 888888) {
    return {
      customer_first_name: "Bill",
      customer_last_name: "Murray",
      policy_start_date: "2023-06-01",
      scheduled_arrival: "2023-11-12 12:30am",
      products: {
        property_basic: {
          policy_start_date: "2023-06-01",
          scheduled_arrival: "2023-11-12",
        },
        property_ebike: {
          policy_start_date: "2023-07-01",
          scheduled_arrival: "2023-12-01",
          covered_ebikes: 2,
        },
      },
    };
  }
  return { error: "Policy number doesn't exist" };
}

function get_product_info(product_id: string) {
  if (!(product_id in PRODUCT_DETAILS)) {
    return { error: "Product doesn't exist" };
  }
  return PRODUCT_DETAILS[product_id];
}

function get_product_list() {
  return PRODUCT_LIST;
}
