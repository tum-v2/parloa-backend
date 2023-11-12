const VALID_TOKEN: string = "FFsecret00token";
const VALID_NAMES: string[] = [
  "ALWAY",
  "CHERNIKOV",
  "DINIZ",
  "ERCOLANI",
  "GAIDUSH",
  "HESAM",
  "MEHTA",
  "OSTWALD",
  "O'REILLY",
  "O'CONNOR",
  "PETROVICS",
  "RINDSLAND",
];
export function auth(booking_number: string, last_name: string) {
  if (
    booking_number.toUpperCase() == "PARL0A" &&
    last_name.toUpperCase() in VALID_NAMES
  ) {
    return { auth_token: VALID_TOKEN };
  } else {
    return { error: "Authentication failed" };
  }
}
function booking_info(booking_number: string, auth_token: string) {
  if (booking_number.toUpperCase() == "PARL0A" && auth_token == VALID_TOKEN)
    return {
      flight_number: "PA123",
      scheduled_departure: "2023-11-12 11:00am",
      scheduled_arrival: "2023-11-12 12:30am",
      departure_city: "New York",
      arrival_city: "Boston",
      passangers: 3,
    };
  else {
    return { error: "Booking Number doesn't exist" };
  }
}
function check_availability(
  booking_number: string,
  new_date: string,
  auth_token: string
) {
  if (booking_number.toUpperCase() == "PARL0A" && auth_token == VALID_TOKEN)
    if (new_date == "2023-11-19")
      return [
        {
          flight_number: "PA222",
          scheduled_departure: "2023-11-19 8:00am",
          scheduled_arrival: "2023-11-19 9:30am",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
        {
          flight_number: "PA321",
          scheduled_departure: "2023-11-19 5:30pm",
          scheduled_arrival: "2023-11-19 7:00pm",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
      ];
    else if (new_date == "2024-04-01")
      return [
        {
          flight_number: "PA222",
          scheduled_departure: "2024-04-01 8:00am",
          scheduled_arrival: "2024-04-01 9:30am",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
        {
          flight_number: "PA333",
          scheduled_departure: "2024-04-01 9:00am",
          scheduled_arrival: "2024-04-01 10:35am",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
        {
          flight_number: "PA444",
          scheduled_departure: "2024-04-01 4:00pm",
          scheduled_arrival: "2024-04-01 5:35pm",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
        {
          flight_number: "PA321",
          scheduled_departure: "2024-04-01 5:30pm",
          scheduled_arrival: "2024-04-01 7:00pm",
          departure_city: "New York",
          arrival_city: "Boston",
          passangers: 3,
        },
      ];

  return { error: "No flights available" };
}
function change_flight_date(
  booking_number: string,
  new_date: string,
  auth_token: string
): boolean {
  if (
    booking_number.toUpperCase() == "PARL0A" &&
    new_date in ["2023-11-19", "2024-04-01"] &&
    auth_token == VALID_TOKEN
  ) {
    return true;
  } else {
    return false;
  }
}
function is_valid_email(email: string): boolean {
  const pattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return pattern.test(email);
}
function send_booking_change_email(
  email: string,
  booking_number: number,
  new_departure_date: Date,
  new_departure_time: Date,
  new_flight_number: number
) {
  if (is_valid_email(email)) {
    return { success: "Email sent" };
  } else {
    return { error: "Invalid email address" };
  }
}
